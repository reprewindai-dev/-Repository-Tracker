/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Play, 
  Key, 
  FileCode, 
  Cpu, 
  ShieldAlert, 
  Coins, 
  Server, 
  Radio, 
  ChevronRight, 
  Settings,
  HelpCircle,
  AlertTriangle,
  Flame,
  CheckCircle
} from 'lucide-react';
import { CAPABILITIES } from '../data';

interface ClientSimulatorProps {
  onEventTriggered: () => void;
}

export default React.memo(function ClientSimulator({ onEventTriggered }: ClientSimulatorProps) {
  // Stages states
  const [activeStep, setActiveStep] = useState<number>(1);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System idle. Ready to initiate Machine Onboarding sequence."
  ]);
  
  // Simulation variables
  const [discoveryData, setDiscoveryData] = useState<any | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>("ws_agent_autonomous");
  const [selectedRepo, setSelectedRepo] = useState<string>("veklom-frontend");
  const [environment, setEnvironment] = useState<string>("production");
  const [hostname, setHostname] = useState<string>("agent-sandbox-05");
  const [agentName, setAgentName] = useState<string>("windsurf-coder-core");

  const [machineToken, setMachineToken] = useState<string>("");
  const [installationId, setInstallationId] = useState<string>("");
  const [licenseTier, setLicenseTier] = useState<string>("");

  const [selectedCapability, setSelectedCapability] = useState<string>("risk_score");
  const [includeTokenInCall, setIncludeTokenInCall] = useState<boolean>(true);
  const [customInputData, setCustomInputData] = useState<string>('{\n  "target_repository": "veklom-byos-backend",\n  "include_dependabot": true\n}');
  const [gatewayResult, setGatewayResult] = useState<any | null>(null);

  // Stress simulator state
  const [isStressRunning, setIsStressRunning] = useState<boolean>(false);
  const [stressProgress, setStressProgress] = useState<number>(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Stage 1: Fetch Discovery Schema
  const handleFetchDiscovery = async () => {
    addLog("Sending GET request to /api/discovery...");
    try {
      const res = await fetch("/api/discovery");
      const data = await res.json();
      setDiscoveryData(data);
      addLog("Successfully fetched veklom-discovery.json v" + data.version);
      addLog(`Discovered ${data.metering.capabilities.length} secure capabilities. API boundaries mapped.`);
      setActiveStep(2);
    } catch (err: any) {
      addLog(`ERROR: Failed to fetch discovery file: ${err.message}`);
    }
  };

  // Stage 2: Register Machine Passport
  const handleRegisterMachine = async () => {
    addLog("Sending POST request to /api/identity/register...");
    try {
      const res = await fetch("/api/identity/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          repository: selectedRepo,
          version: "v1.4.2-autonomous",
          environment: environment,
          origin: {
            hostname: hostname,
            agent: agentName
          }
        })
      });
      const data = await res.json();
      if (data.token) {
        setMachineToken(data.token);
        setInstallationId(data.installation_id);
        setLicenseTier(data.license?.tier);
        addLog(`REGISTRATION SUCCESSFUL.`);
        addLog(`Machine Identity Passport issued: ${data.installation_id}`);
        addLog(`Acquired secure Token: ${data.token.substring(0, 16)}...`);
        addLog(`Value boundary opened. Quota allotted on ${data.license.tier.toUpperCase()} tier.`);
        onEventTriggered();
        setActiveStep(3);
      } else {
        addLog(`REGISTRATION REJECTED: ${data.error}`);
      }
    } catch (err: any) {
      addLog(`ERROR: Registration failure: ${err.message}`);
    }
  };

  // Stage 3: Make Gateway Call
  const handleGatewayExecution = async () => {
    const tokenToSend = includeTokenInCall ? machineToken : "";
    addLog(`Sending POST request to /api/gateway/${selectedCapability}...`);
    
    let parsedInput = {};
    try {
      parsedInput = JSON.parse(customInputData);
    } catch (e) {
      addLog("WARNING: Invalid input JSON. Sending empty object.");
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (tokenToSend) {
        headers["x-veklom-machine-token"] = tokenToSend;
      }

      const res = await fetch(`/api/gateway/${selectedCapability}`, {
        method: "POST",
        headers,
        body: JSON.stringify(parsedInput)
      });
      
      const data = await res.json();
      setGatewayResult(data);

      if (res.status === 200) {
        addLog(`GATEWAY SUCCESS: Capability '${selectedCapability}' executed.`);
        addLog(`x402 Micropayment Settle: -${data.micropayment.debited_usd} USD.`);
        addLog(`Ledger Anchor anchored on: ${data.micropayment.ledger_anchor}`);
        onEventTriggered();
      } else {
        addLog(`GATEWAY ACCESS REJECTED (HTTP ${res.status}): ${data.error}`);
        addLog(`REASON: ${data.reason}`);
      }
    } catch (err: any) {
      addLog(`ERROR: Gateway execution failed: ${err.message}`);
    }
  };

  // Stress simulator loop: simulates 10 fast requests to generate nice metrics
  const runStressSimulation = async () => {
    if (!machineToken) {
      addLog("ERROR: Please register a machine identity token first in Step 2.");
      return;
    }
    setIsStressRunning(true);
    setStressProgress(0);
    addLog("STRESS SIMULATOR ON: Commencing 10 rapid automated agent capability runs...");

    const caps = ["risk_score", "architecture_validate", "policy_enforce", "audit_full"];

    for (let i = 1; i <= 10; i++) {
      const randomCap = caps[Math.floor(Math.random() * caps.length)];
      addLog(`Stress Job [${i}/10]: Calling ${randomCap} via M2M pipeline...`);
      
      try {
        const res = await fetch(`/api/gateway/${randomCap}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-veklom-machine-token": machineToken
          },
          body: JSON.stringify({
            workspace_id: workspaceId,
            pipeline_job_id: `stress_${i}_${Date.now()}`
          })
        });
        const data = await res.json();
        if (res.status === 200) {
          addLog(`Stress [${i}/10] Settled: -${data.micropayment.debited_usd} USD (via ${data.micropayment.ledger_anchor.substring(0, 15)}...)`);
        }
        setStressProgress(Math.round((i / 10) * 100));
        onEventTriggered();
        // Short pause between stress requests
        await new Promise(r => setTimeout(r, 450));
      } catch (e: any) {
        addLog(`Stress Job [${i}/10] Failed: ${e.message}`);
      }
    }
    setIsStressRunning(false);
    addLog("STRESS SIMULATOR COMPLETE. Check Dashboard metrics for updated settlement ledger counters.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="client-simulator-root">
      
      {/* Left 7 Columns: Interactive onboarding steps */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Step Guide Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 p-1.5 rounded-xl">
          {[1, 2, 3].map(step => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeStep === step 
                  ? 'bg-slate-900 border border-slate-800 text-white' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === step ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {step}
              </span>
              {step === 1 ? 'Discovery' : step === 2 ? 'Identity Register' : 'Gateway Exec'}
            </button>
          ))}
        </div>

        {/* Step 1 Content: Fetch Discovery File */}
        {activeStep === 1 && (
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileCode size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Step 1: Read Veklom M2M Discovery Schema</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  In today's machine economy, any automated cloner/agent searches for a standard machine-readable definition file (`/.well-known/veklom-discovery.json` or `/api/discovery`) to discover endpoints, price metrics, quotas, and licensing structures.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500 pb-1.5 border-b border-slate-900">
                <span>Request Endpoint:</span>
                <span className="text-cyan-400">GET /api/discovery</span>
              </div>
              <p className="text-slate-400 text-xs">
                Clicking the button simulates the automated cloner requesting instructions on how to behave, identify, and execute within the platform rules.
              </p>
              <button
                onClick={handleFetchDiscovery}
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Play size={14} /> Fetch Discovery File
              </button>
            </div>

            {discoveryData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs font-mono"
              >
                <div className="text-slate-400 font-semibold mb-2">Discovered Schema Metadata:</div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">M2M Engine Name:</span>
                    <span>{discoveryData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Identity Authority:</span>
                    <span className="text-emerald-400">{discoveryData.identity.endpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Micro-Transaction protocol:</span>
                    <span className="text-amber-500">x402 protocol</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discovered Capabilities count:</span>
                    <span>{discoveryData.metering.capabilities.length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 2 Content: Identity Registration */}
        {activeStep === 2 && (
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Step 2: Onboard Cloner and Issue Identity Passport</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Once discovery is read, the automated system submits configuration details (workspace, repository, origin) to get registered. The server authenticates the cloner, allotting quotas and returning a cryptographically secure token.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">Workspace ID</label>
                <input 
                  type="text" 
                  value={workspaceId} 
                  onChange={(e) => setWorkspaceId(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Cloned Repository</label>
                <select 
                  value={selectedRepo} 
                  onChange={(e) => setSelectedRepo(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 outline-none"
                >
                  <option value="veklom-frontend">veklom-frontend</option>
                  <option value="veklom-byos-backend">veklom-byos-backend</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Environment</label>
                <input 
                  type="text" 
                  value={environment} 
                  onChange={(e) => setEnvironment(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Hostname / Node ID</label>
                <input 
                  type="text" 
                  value={hostname} 
                  onChange={(e) => setHostname(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400">Agent User-Agent Signature</label>
                <input 
                  type="text" 
                  value={agentName} 
                  onChange={(e) => setAgentName(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleRegisterMachine}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold transition flex items-center justify-center gap-1.5 text-xs font-mono"
            >
              <Key size={14} /> Register Machine Passport & Open Value Boundary
            </button>

            {machineToken && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs font-mono space-y-1 text-slate-300"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <CheckCircle size={14} /> Machine passport issued!
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Installation ID:</span>
                  <span>{installationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized Token:</span>
                  <span className="text-emerald-400 break-all select-all">{machineToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allotted License Tier:</span>
                  <span className="capitalize text-cyan-400">{licenseTier}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 3 Content: Gateway Execution */}
        {activeStep === 3 && (
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Step 3: Test Value Boundary Gateway Access</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Let's call one of our secure microservices through the gateway. You can send the token to verify access, or toggle the token off to watch the server **enforce the value boundary** and reject anonymous automated execution.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Select Protected Capability</label>
                <select 
                  value={selectedCapability} 
                  onChange={(e) => setSelectedCapability(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-amber-500"
                >
                  {CAPABILITIES.map(cap => (
                    <option key={cap.id} value={cap.id}>
                      {cap.name} (${cap.price_usd} / run)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold">Include Authorization Passport Token</div>
                  <div className="text-[10px] text-slate-500">
                    If false, simulated cloner calls anonymously without registering.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeTokenInCall(!includeTokenInCall)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    includeTokenInCall ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      includeTokenInCall ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Capability Input Parameters (JSON)</label>
                <textarea 
                  value={customInputData} 
                  onChange={(e) => setCustomInputData(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px] focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleGatewayExecution}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition flex items-center justify-center gap-1.5 text-xs font-mono"
            >
              <Play size={14} /> Execute Secure Gateway Call & Settle
            </button>

            {gatewayResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 text-xs font-mono space-y-2 border ${
                  gatewayResult.error 
                    ? 'bg-red-950/30 border-red-500/20 text-red-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {gatewayResult.error ? (
                  <>
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                      <ShieldAlert size={14} /> Access Blocked: Boundary Gate Checked!
                    </div>
                    <div><span className="text-slate-500">Reason:</span> {gatewayResult.reason}</div>
                    <div className="text-[10px] text-red-400/80 bg-red-500/5 p-1 rounded mt-1">
                      M2M Gate forced identity required. Anonymous pipeline execution blocked.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle size={14} /> Execution Succeeded & Settled
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Transaction hash:</span>
                      <span className="text-amber-500 font-bold">{gatewayResult.micropayment?.ledger_anchor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Micropayment usd:</span>
                      <span className="text-amber-400">${gatewayResult.micropayment?.debited_usd.toFixed(4)}</span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="text-slate-500">Capability Output Payload:</div>
                      <pre className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 overflow-x-auto whitespace-pre">
                        {JSON.stringify(gatewayResult.output, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* Right 5 Columns: Console Logs & Stress Simulator */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Stress run tool card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border border-amber-500/20 flex items-center gap-1">
            <Flame size={12} className="animate-pulse" />
            STRESS TOOL
          </div>
          
          <h3 className="text-sm font-semibold text-white">M2M Pipeline Loop Stress Simulator</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 mb-4">
            Simulate an active ecosystem cloner stream. This triggers **10 sequential automated pipeline calls** through the Value Boundary, compiling microtransactions and updating the ledger in real-time.
          </p>

          <button
            onClick={runStressSimulation}
            disabled={isStressRunning}
            className={`w-full py-3 rounded-xl font-semibold font-mono text-xs transition flex items-center justify-center gap-1.5 ${
              isStressRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg'
            }`}
          >
            {isStressRunning ? (
              <>Running Simulation Loop ({stressProgress}%)</>
            ) : (
              <>Commence 10x Automated Capability Stress Runs</>
            )}
          </button>

          {isStressRunning && (
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
              <motion.div 
                className="bg-amber-500 h-full"
                animate={{ width: `${stressProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </div>

        {/* Real-time Simulator Console logs */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                <Terminal size={14} className="text-cyan-400" />
                SIMULATOR CLIENT LOGS
              </h4>
              <button 
                onClick={() => setConsoleLogs(["Console cleared. System listening."])}
                className="text-[9px] font-mono text-slate-600 hover:text-slate-400 uppercase"
              >
                Clear
              </button>
            </div>

            <div className="bg-slate-950/40 font-mono text-[10px] text-cyan-400/80 space-y-1.5 h-[280px] overflow-y-auto pr-1">
              {consoleLogs.map((log, i) => (
                <div key={i} className="leading-relaxed hover:bg-slate-900/10 py-0.5">
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2.5 border-t border-slate-900 mt-2 text-[10px] text-slate-500 font-mono leading-relaxed flex items-center gap-1.5">
            <Radio size={12} className="text-cyan-400 animate-ping" />
            <span>M2M simulator active on loop host: localhost:3000</span>
          </div>
        </div>

      </div>

    </div>
  );
});
