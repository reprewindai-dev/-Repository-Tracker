/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

import { MachineIdentity, MeteringEvent, TelemetryLog } from "./src/types.js";
import { CAPABILITIES } from "./src/data.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel (Settings > Secrets).");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Databases for Simulation
const MACHINE_DB = new Map<string, MachineIdentity>();
const METERING_DB: MeteringEvent[] = [];
const TELEMETRY_BUS: TelemetryLog[] = [];

// Helper to log telemetry
function emitTelemetry(type: TelemetryLog['type'], payload: any) {
  const log: TelemetryLog = {
    id: `tel_${crypto.randomBytes(8).toString('hex')}`,
    type,
    timestamp: new Date().toISOString(),
    payload
  };
  TELEMETRY_BUS.unshift(log);
  if (TELEMETRY_BUS.length > 500) {
    TELEMETRY_BUS.pop();
  }
}

// Seed Database with some realistic initial M2M activity
const seedMachines = [
  {
    installation_id: "inst_f98c812a",
    deployment_id: "dep_0a91e1d0",
    workspace_id: "ws_dev_core",
    repository: "veklom-frontend",
    version: "v1.2.4-beta",
    environment: "production",
    token: "vkm_token_671fa82cd934",
    origin: { hostname: "coolify-srv-01", ip_hash: "sha256_cool_srv_1", agent: "coolify-deployment-pipeline" },
    license: { status: "active", tier: "fleet" },
    first_seen: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    installation_id: "inst_0c3d9a1f",
    deployment_id: "dep_9a2f1b0c",
    workspace_id: "ws_agent_03",
    repository: "veklom-byos-backend",
    version: "v1.2.0-release",
    environment: "dev",
    token: "vkm_token_4fa20bd1c92d",
    origin: { hostname: "cursor-workspace-ubuntu", ip_hash: "sha256_cursor_ws", agent: "cursor-agent-autobuild" },
    license: { status: "active", tier: "developer" },
    first_seen: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  }
];

seedMachines.forEach(m => {
  MACHINE_DB.set(m.token, m as MachineIdentity);
  // 🛡️ Sentinel: Omit sensitive token from public telemetry event
  const { token, ...safeMachine } = m;
  emitTelemetry("identity.registered", safeMachine);
});

// Record some seed microtransactions
emitTelemetry("metering.recorded", {
  event_id: "evt_seed_01",
  installation_id: "inst_f98c812a",
  capability: "architecture_validate",
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  billing: { total_usd: 0.01, settlement: "x402" }
});
emitTelemetry("metering.recorded", {
  event_id: "evt_seed_02",
  installation_id: "inst_0c3d9a1f",
  capability: "risk_score",
  timestamp: new Date(Date.now() - 1800000).toISOString(),
  billing: { total_usd: 0.002, settlement: "x402" }
});

// ================= API ENDPOINTS =================

// 1. Machine-Readable Discovery JSON File (Veklom Discovery Schema v2.0)
app.get("/api/discovery", (req, res) => {
  res.json({
    version: "2.0",
    name: "Veklom M2M Ledger",
    description: "Machine-native governance, architecture validation, repo risk scoring, and agent safety runtime.",
    documentation: "https://veklom.com/docs",
    identity: {
      required: true,
      endpoint: "/api/identity/register",
      fields: [
        "installation_id",
        "deployment_id",
        "workspace_id",
        "version",
        "environment"
      ]
    },
    metering: {
      endpoint: "/api/metering/record",
      capabilities: CAPABILITIES.map(c => c.id)
    },
    api: CAPABILITIES.reduce((acc, cap) => {
      acc[cap.id] = {
        endpoint: `/api/gateway/${cap.id}`,
        method: "POST",
        price_per_call_usd: cap.price_usd,
        rate_limit_per_minute: cap.rate_limit_per_minute
      };
      return acc;
    }, {} as Record<string, any>),
    machine_access_credits: {
      tiers: {
        free: { daily_clone_quota: 100, price_usd: 0 },
        developer: { daily_clone_quota: 5000, price_usd: 9 },
        fleet: { daily_clone_quota: 50000, price_usd: 49 },
        industrial: { daily_clone_quota: 500000, price_usd: 199 }
      }
    }
  });
});

// 2. Machine Identity Registration
app.post("/api/identity/register", (req, res) => {
  const { workspace_id, repository, version, environment, origin } = req.body;
  
  if (!workspace_id || !repository) {
    return res.status(400).json({ error: "Missing required registration parameters: 'workspace_id' and 'repository'." });
  }

  const token = `vkm_token_${crypto.randomBytes(16).toString('hex')}`;
  const installation_id = `inst_${crypto.randomBytes(8).toString('hex')}`;
  const deployment_id = `dep_${crypto.randomBytes(8).toString('hex')}`;

  const newMachine: MachineIdentity = {
    installation_id,
    deployment_id,
    workspace_id,
    repository,
    version: version || "v1.0.0",
    environment: environment || "production",
    token,
    origin: {
      hostname: origin?.hostname || `node-${crypto.randomBytes(4).toString('hex')}`,
      ip_hash: crypto.createHash("sha256").update((origin?.hostname || "anon") + Date.now().toString()).digest("hex").substring(0, 16),
      agent: origin?.agent || req.headers["user-agent"] || "unknown-agent"
    },
    license: {
      status: "active",
      tier: "developer"
    },
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  };

  MACHINE_DB.set(token, newMachine);
  // 🛡️ Sentinel: Omit sensitive token from public telemetry event
  const { token: _, ...safeMachine } = newMachine;
  emitTelemetry("identity.registered", safeMachine);

  res.json({
    status: "registered",
    token,
    installation_id,
    deployment_id,
    license: newMachine.license,
    message: "Machine identity approved. Value boundary gate opened."
  });
});

// 3. Get Active Machines list (for dashboard display)
app.get("/api/identity/list", (req, res) => {
  // 🛡️ Sentinel: Omit sensitive tokens from public API response
  const safeMachines = Array.from(MACHINE_DB.values()).map(machine => {
    const { token, ...safeMachine } = machine;
    return safeMachine;
  });
  res.json(safeMachines);
});

// 4. Record Metering Event
app.post("/api/metering/record", (req, res) => {
  const { installation_id, workspace_id, capability, inputs } = req.body;

  if (!installation_id || !capability) {
    return res.status(400).json({ error: "Missing identity or capability details." });
  }

  const targetCap = CAPABILITIES.find(c => c.id === capability);
  const unit_price = targetCap ? targetCap.price_usd : 0.01;

  const event: MeteringEvent = {
    event_id: `evt_${crypto.randomBytes(8).toString('hex')}`,
    execution_id: `exec_${crypto.randomBytes(8).toString('hex')}`,
    installation_id,
    workspace_id: workspace_id || "default",
    capability,
    timestamp: new Date().toISOString(),
    inputs_hash: crypto.createHash("sha256").update(JSON.stringify(inputs || {})).digest("hex").substring(0, 16),
    outputs_hash: crypto.createHash("sha256").update(Date.now().toString()).digest("hex").substring(0, 16),
    billing: {
      units: 1,
      unit_price_usd: unit_price,
      total_usd: unit_price,
      settlement: "x402"
    },
    governance: {
      policy_pack: "default-compliance-v1",
      evidence_issued: true,
      ledger_anchor: `gnom_tx_${crypto.randomBytes(12).toString('hex')}`
    }
  };

  METERING_DB.unshift(event);
  emitTelemetry("metering.recorded", event);

  res.json({
    status: "recorded",
    event_id: event.event_id,
    settlement: "x402",
    amount_usd: unit_price,
    ledger_anchor: event.governance.ledger_anchor
  });
});

// 5. Get recorded metering list
app.get("/api/metering/list", (req, res) => {
  res.json(METERING_DB);
});

// 6. Get live telemetry log bus
app.get("/api/telemetry/bus", (req, res) => {
  res.json(TELEMETRY_BUS);
});

// 7. Value Boundary Gateway - Governed Execution Portal
app.post("/api/gateway/:capability", (req, res) => {
  const capability = req.params.capability;
  const token = req.headers["x-veklom-machine-token"] as string;

  if (!token) {
    emitTelemetry("gateway.error", { error: "Missing Machine Token Header", capability });
    return res.status(401).json({
      error: "Value Boundary Access Blocked",
      reason: "Missing 'x-veklom-machine-token' header. Machine identity required.",
      onboarding_url: "/api/discovery"
    });
  }

  const machine = MACHINE_DB.get(token);
  if (!machine) {
    // 🛡️ Sentinel: Omit invalid token from error telemetry to prevent accidental credential logging
    emitTelemetry("gateway.error", { error: "Invalid Machine Token", capability });
    return res.status(403).json({
      error: "Value Boundary Access Denied",
      reason: "Machine token has expired or is invalid.",
      re_register_url: "/api/identity/register"
    });
  }

  const capConfig = CAPABILITIES.find(c => c.id === capability);
  if (!capConfig) {
    return res.status(404).json({ error: `Capability '${capability}' does not exist.` });
  }

  // Update last seen
  machine.last_seen = new Date().toISOString();

  // Perform Simulated Capability Logic
  let secureOutput: any = {};
  if (capability === "risk_score") {
    secureOutput = {
      score: +(Math.random() * 25 + 5).toFixed(2),
      critical_vulnerabilities: 0,
      licenses_ok: true,
      m2m_reputation_index: 0.98
    };
  } else if (capability === "architecture_validate") {
    secureOutput = {
      valid: true,
      modular_index: 0.94,
      cyclic_dependencies: 0,
      policy_adherence_percent: 100
    };
  } else if (capability === "policy_enforce") {
    secureOutput = {
      enforced: true,
      applicable_policies: ["NoSecretLeaks", "ServerSideGeminiOnly", "M2MQuotaEnforcement"],
      violations_detected: 0
    };
  } else if (capability === "audit_full") {
    secureOutput = {
      audit_report_hash: crypto.createHash("sha256").update(token + capability + Date.now().toString()).digest("hex"),
      summary: "System verified fully secure, modular, and structurally compliant with absolute trace proof.",
      compliance_tier: "Level 4 (Autonomous Machine Compliant)"
    };
  }

  // Record Metering Event and micropayment
  const event_id = `evt_${crypto.randomBytes(8).toString('hex')}`;
  const execution_id = `exec_${crypto.randomBytes(8).toString('hex')}`;
  const ledger_anchor = `gnom_tx_${crypto.randomBytes(12).toString('hex')}`;

  const meteringEvent: MeteringEvent = {
    event_id,
    execution_id,
    installation_id: machine.installation_id,
    workspace_id: machine.workspace_id,
    capability,
    timestamp: new Date().toISOString(),
    inputs_hash: crypto.createHash("sha256").update(JSON.stringify(req.body || {})).digest("hex").substring(0, 16),
    outputs_hash: crypto.createHash("sha256").update(JSON.stringify(secureOutput)).digest("hex").substring(0, 16),
    billing: {
      units: 1,
      unit_price_usd: capConfig.price_usd,
      total_usd: capConfig.price_usd,
      settlement: "x402"
    },
    governance: {
      policy_pack: "default-compliance-v1",
      evidence_issued: true,
      ledger_anchor
    }
  };

  METERING_DB.unshift(meteringEvent);
  emitTelemetry("metering.recorded", meteringEvent);

  res.json({
    execution: {
      id: execution_id,
      timestamp: meteringEvent.timestamp,
      status: "success",
      capability
    },
    output: secureOutput,
    micropayment: {
      ledger_anchor,
      protocol: "x402",
      debited_usd: capConfig.price_usd,
      license_tier: machine.license.tier
    }
  });
});

// Helper: Parse owner and repo name from any GitHub URL variation
function parseGitHubUrl(urlStr: string): { owner: string; repo: string } | null {
  if (!urlStr) return null;
  let cleanUrl = urlStr.trim();
  
  // Remove trailing slashes and common graph suffixes
  cleanUrl = cleanUrl.replace(/\/+$/, "");
  cleanUrl = cleanUrl.replace(/\/graphs\/traffic\/?$/i, "");
  cleanUrl = cleanUrl.replace(/\/actions\/?$/i, "");
  
  // Remove protocol and hostname
  cleanUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  
  const parts = cleanUrl.split("/");
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1];
    if (owner && repo) {
      return { owner, repo };
    }
  }
  return null;
}

interface GitHubData {
  repoInfo: any;
  workflowRuns: any[];
  commits: any[];
  pullRequests: any[];
  trafficClones: { count: number; uniques: number; value?: any } | null;
  trafficViews: { count: number; uniques: number; value?: any } | null;
  trafficPaths: any[] | null;
  trafficReferrers: any[] | null;
  error?: string;
}

// Helper: Fetch real-time data from GitHub REST API
async function fetchGitHubData(owner: string, repo: string, token?: string): Promise<GitHubData> {
  const headers: Record<string, string> = {
    "User-Agent": "veklom-m2m-detective",
    "Accept": "application/vnd.github.v3+json"
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const result: GitHubData = {
    repoInfo: null,
    workflowRuns: [],
    commits: [],
    pullRequests: [],
    trafficClones: null,
    trafficViews: null,
    trafficPaths: null,
    trafficReferrers: null
  };

  try {
    // 1. Fetch main repo details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error(`Repository not found (${owner}/${repo}). If this is a private repository, please supply a valid GitHub Personal Access Token (PAT).`);
      }
      throw new Error(`GitHub API returned status ${repoRes.status}: ${repoRes.statusText}`);
    }
    result.repoInfo = await repoRes.json();

    // 2. Fetch Workflow runs (Actions logs representing real automated machine-build trail)
    try {
      const runsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=30`, { headers });
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        result.workflowRuns = runsData.workflow_runs || [];
      }
    } catch (e) {
      console.warn("Failed to fetch workflow runs:", e);
    }

    // 3. Fetch Commits
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`, { headers });
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json();
        result.commits = Array.isArray(commitsData) ? commitsData : [];
      }
    } catch (e) {
      console.warn("Failed to fetch commits:", e);
    }

    // 4. Fetch PRs
    try {
      const pullsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?per_page=20&state=all`, { headers });
      if (pullsRes.ok) {
        const pullsData = await pullsRes.json();
        result.pullRequests = Array.isArray(pullsData) ? pullsData : [];
      }
    } catch (e) {
      console.warn("Failed to fetch pulls:", e);
    }

    // 5. If Token is provided, unlock premium Private Traffic analytics endpoints!
    if (token) {
      try {
        const clonesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/clones`, { headers });
        if (clonesRes.ok) {
          const clonesData = await clonesRes.json();
          result.trafficClones = {
            count: clonesData.count || 0,
            uniques: clonesData.uniques || 0,
            value: clonesData
          };
        }

        const viewsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/views`, { headers });
        if (viewsRes.ok) {
          const viewsData = await viewsRes.json();
          result.trafficViews = {
            count: viewsData.count || 0,
            uniques: viewsData.uniques || 0,
            value: viewsData
          };
        }

        const pathsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/popular/paths`, { headers });
        if (pathsRes.ok) {
          result.trafficPaths = await pathsRes.json();
        }

        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/popular/referrers`, { headers });
        if (refRes.ok) {
          result.trafficReferrers = await refRes.json();
        }
      } catch (trafficErr) {
        console.error("Failed to fetch private traffic stats even with token:", trafficErr);
      }
    }
  } catch (err: any) {
    result.error = err.message || String(err);
  }

  return result;
}

// 8. AI M2M Detective Investigation (using gemini-3.5-flash with 100% Real-Time GitHub Fetching)
app.post("/api/detective/analyze", async (req, res) => {
  const { query, githubUrl, githubEmail, githubToken } = req.body;

  try {
    const ai = getAiClient();
    
    let customRepoFocus = "";
    let gitHubStats: GitHubData | null = null;
    let parsed = parseGitHubUrl(githubUrl);

    if (githubUrl && parsed) {
      const tokenToUse = githubToken || process.env.GITHUB_TOKEN;
      gitHubStats = await fetchGitHubData(parsed.owner, parsed.repo, tokenToUse);
    }

    if (gitHubStats && !gitHubStats.error) {
      const info = gitHubStats.repoInfo;
      const workflows = gitHubStats.workflowRuns;
      const commitsList = gitHubStats.commits;
      const pullsList = gitHubStats.pullRequests;
      const clones = gitHubStats.trafficClones;
      const views = gitHubStats.trafficViews;
      const paths = gitHubStats.trafficPaths;
      const referrers = gitHubStats.trafficReferrers;

      customRepoFocus = `
### REPOSITORY SCAN SUMMARY: ${info.full_name}
- **URL Scanned:** ${githubUrl}
- **Privacy Mode:** ${info.private ? "Private" : "Public"}
- **Repo Metrics:** Stars: ${info.stargazers_count} | Forks: ${info.forks_count} | Open Issues: ${info.open_issues_count}
- **Primary Language:** ${info.language || "Not specified"}
- **Repository Created:** ${info.created_at} | **Last Code Push:** ${info.pushed_at || info.updated_at}
- **User Associated Email:** ${githubEmail || "Not specified"}

#### EVIDENCE: LIVE TRAFFIC METRICS (VERIFIED)
${clones ? `- **14-day Clone Operations (Direct Machine Pulls):** ${clones.count} clones (${clones.uniques} unique cloning clients)` : `- **14-day Clone Operations (Direct Machine Pulls):** [PENDING CREDENTIALS] (Please configure your Personal Access Token (PAT) with 'repo' scope to read clones/views traffic data directly).`}
${views ? `- **14-day Unique Views:** ${views.count} total views (${views.uniques} unique visitors)` : `- **14-day Unique Views:** [PENDING CREDENTIALS] (Please configure your Personal Access Token (PAT) with 'repo' scope to read clones/views traffic data).`}

${referrers && referrers.length > 0 ? `
- **Top Referrers (Verified Source):**
${referrers.slice(0, 5).map((r: any) => `  * ${r.referrer}: ${r.count} views (${r.uniques} unique)`).join("\n")}
` : ""}

${paths && paths.length > 0 ? `
- **Top Accessed Repository Paths:**
${paths.slice(0, 5).map((p: any) => `  * ${p.path}: ${p.count} views (${p.uniques} unique)`).join("\n")}
` : ""}

#### EVIDENCE: WORKFLOW RUNS & COMPUTATIONAL ACTIONS (VERIFIED MACHINE TRAIL)
- **Active GitHub Actions Workflow Runs (Last 30):** ${workflows.length} runs found.
${workflows.length > 0 ? `
- **Recent Automated Builder/CI Logs:**
${workflows.slice(0, 5).map((w: any) => `  * "${w.name}" - Status: ${w.status} | Conclusion: ${w.conclusion || "running"} | Triggered by: ${w.event} | Date: ${w.run_started_at || w.created_at}`).join("\n")}
` : "  * No active Actions workflow logs returned."}

#### EVIDENCE: RECENT COMPILATION & DEVELOPMENT COMMITS
- **Recent Repository Commits (Last 30):** ${commitsList.length} commits found.
${commitsList.length > 0 ? `
- **Recent Authors & Commit Messages:**
${commitsList.slice(0, 5).map((c: any) => `  * [${c.commit.author?.date}] "${c.commit.message.split("\n")[0]}" by ${c.commit.author?.name || "unknown"} (${c.author?.login || "no-login"})`).join("\n")}
` : "  * No commit logs returned."}

#### EVIDENCE: OPEN/CLOSED DEVELOPER PULL REQUESTS
- **Recent Pull Requests:** ${pullsList.length} PRs found.
${pullsList.length > 0 ? `
${pullsList.slice(0, 5).map((p: any) => `  * PR #${p.number}: "${p.title}" - State: ${p.state} | Author: ${p.user?.login}`).join("\n")}
` : "  * No recent pull requests found."}
`;
    } else if (gitHubStats && gitHubStats.error) {
      customRepoFocus = `
### REPOSITORY SCAN FAILURE
- **URL Scanned:** ${githubUrl}
- **Scan Error returned from GitHub API:** "${gitHubStats.error}"
- **User Associated Email:** ${githubEmail || "Not specified"}

*Forensic Note: The scan failed to pull the repository metadata. This usually means either a typo in the repository path, a private repository that requires your Personal Access Token, or API rate-limiting on unauthenticated requests.*
`;
    } else if (githubUrl && !parsed) {
      customRepoFocus = `
### REPOSITORY SCAN INVALID URL
- **URL Scanned:** ${githubUrl}

*Forensic Note: The provided URL could not be parsed as a valid GitHub repository path. Please provide a URL in the format: https://github.com/OWNER/REPO.*
`;
    } else {
      customRepoFocus = `
### GENERAL DETECTIVE FORENSIC CONTEXT
- **User Request:** "${query}"
- **Factual Context:** No specific GitHub repository was selected or scanned in this turn.
- **Forensic Guidance:** Please enter a valid public or private GitHub repository URL (e.g., https://github.com/owner/repo) and provide a Personal Access Token (PAT) if you want to run live forensic audits on views, clones, and traffic graphs.
`;
    }

    const contextPrompt = `
You are the Veklom M2M Detective, an elite automated forensic auditor specializing in machine-to-machine repository traffic, automated compute trails, and autonomous agent tracking.
A technical founder is seeking deep structural insights into their repository's cloning traffic and patterns.

Here is the 100% REAL, live repository telemetry scan retrieved directly from the GitHub API:
${customRepoFocus}

Your goal is to answer their query: "${query || 'Generate a complete forensic report and show me how to capitalize on it.'}"
Structure your response to cover:

1. **The Forensic Detective Report (WHO, WHAT, WHY, WHEN, WHERE)**: 
   - Clearly separate:
     * **VERIFIED**: Evidence that is 100% confirmed by direct cryptographic/platform proof (such as GitHub Actions OIDC runners, explicit Commit authors, Dependabot pull requests, or exact traffic logs if authenticated).
     * **CORRELATED**: Highly probable patterns linked to specific events (e.g. GitHub Actions executing on a commit, build triggers corresponding to tag releases).
     * **INFERRED**: Logical hypotheses based on secondary attributes (e.g., high clones per unique client indicating container build loops, Vercel/Coolify hydration cycles, or repetitive AI assistant code-pulls).
     * **UNKNOWN**: Explicitly name what cannot be proven from current evidence (e.g. individual user IPs, exact names of anonymous scraper clients, or exact clones/views counts if unauthenticated). Explain exactly what token/credentials are missing to turn this unknown into verified facts.
   - Trace the precise machine breadcrumbs. Who is doing it, what are they running, why are they doing it, when are these events triggered, and where is the traffic coming from?

2. **The Business Capitalization Blueprint (Value Boundary)**: 
   - Explain how the founder can configure a "Value Boundary" (forcing identity registration via discovery schema) to monetize or secure this traffic.

3. **The x402 Micropayment Mechanics**: 
   - Show how to map Veklom capabilities (such as Risk Scoring, Architecture Validation, Policy Enforcing, Full Audit) to micro-transaction values (ranging from $0.002 to $0.10) to convert these automated pulls/clones into recurring M2M software revenue.

4. **Actionable Next Steps**: 
   - What is the immediate path to convert anonymous machine pulls into valuable metadata or revenue streams.

Provide a highly professional, visually structured Markdown report. Speak with deep technical command and authoritative composure. Use bullet points and headers clearly so the custom renderer can present it beautifully. Do NOT invent or fabricate any numbers; use the exact metrics supplied above.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt
    });

    res.json({
      success: true,
      analysis: response.text
    });
  } catch (error: any) {
    console.error("Gemini Detective API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "The M2M Detective is currently offline. Please configure your GEMINI_API_KEY in secrets."
    });
  }
});


// Vite middleware configuration for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
