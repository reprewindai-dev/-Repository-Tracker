/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Search, 
  HelpCircle, 
  Cpu, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

// Custom lightweight Markdown-to-HTML formatter to keep it fully self-contained and zero-dependency
function formatForensicReport(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="text-sm font-semibold text-white mt-4 mb-2 font-mono flex items-center gap-1.5 border-b border-slate-800 pb-1.5">{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} className="text-base font-bold text-cyan-400 mt-6 mb-3 font-mono border-l-2 border-cyan-400 pl-2">{line.replace('## ', '')}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-4 font-mono tracking-tight bg-slate-800/40 p-2 rounded border border-slate-800">{line.replace('# ', '')}</h2>;
    }
    
    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const cleanText = line.substring(2);
      // Check for bold parts in bullets
      return (
        <li key={idx} className="ml-4 list-disc text-xs text-slate-300 mb-1.5 leading-relaxed">
          {renderFormattedText(cleanText)}
        </li>
      );
    }

    // Numbered lists
    const numMatch = line.match(/^\d+\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="ml-2 text-xs text-slate-300 mb-2 leading-relaxed flex gap-2">
          <span className="text-cyan-400 font-bold font-mono">{line.match(/^\d+/)?.[0]}.</span>
          <span>{renderFormattedText(numMatch[1])}</span>
        </div>
      );
    }

    // Code blocks
    if (line.startsWith('```')) {
      return null; // Skip raw code backticks block, let other content align
    }

    // Standard paragraph
    if (line.trim() === '') return <div key={idx} className="h-2"></div>;

    return (
      <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2">
        {renderFormattedText(line)}
      </p>
    );
  });
}

// Sub-helper to handle simple **bold** rendering
function renderFormattedText(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-amber-400 font-semibold">{part}</strong>;
    }
    
    // Simple inline backtick `code` highlighting
    const codeParts = part.split('`');
    return codeParts.map((subPart, j) => {
      if (j % 2 === 1) {
        return <code key={j} className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded text-[10px] font-mono border border-slate-900">{subPart}</code>;
      }
      return subPart;
    });
  });
}

export default React.memo(function AiDetective() {
  const [query, setQuery] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [githubEmail, setGithubEmail] = useState<string>("");
  const [githubToken, setGithubToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forensicReport, setForensicReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Suggested pre-made investigative templates
  const templates = [
    {
      title: "1. M2M Interaction Gateway & Blockchain Micro-Payments",
      description: "Gateway architecture, ECDSA passports, Gnomledger blockchain traceability, and machine flow.",
      prompt: "Design and detail a complete Machine-to-Machine (M2M) interaction gateway for GitHub repositories. Explain the authentication layer (ECDSA passports), blockchain traceability via Gnomledger/x402, machine user flow, and backend tracking/monetization mechanisms."
    },
    {
      title: "2. Comprehensive Revenue & Monetization Strategy",
      description: "Pay-per-clone analytics, subscription tiers, automated API access, and market intelligence licensing.",
      prompt: "Provide a comprehensive monetization strategy for GitHub repository insights. Detail pay-per-clone analytics, subscription tiers, API access for autonomous agents, data licensing for market intelligence, and a blockchain micro-payment system proposal."
    },
    {
      title: "3. 20,000+ Clone Traffic & Bot Classification Audit",
      description: "Categorize 20k+ clones into CI runners, AI coding loops, scrapers, and targeted tech.",
      prompt: "Analyze the 20,000+ GitHub clone traffic dataset. Identify traffic sources, categorize machine/bot types (CI runners, AI developer workspaces, dependency auditors), hypothesize intent behind system_map.md inspection, and list targeted technologies/languages."
    }
  ];

  const handleInvestigate = async (promptText: string, customUrl?: string) => {
    setIsLoading(true);
    setError(null);
    setForensicReport(null);

    const targetUrl = customUrl !== undefined ? customUrl : githubUrl;

    try {
      const res = await fetch("/api/detective/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: promptText || "Analyze the forensic traffic signatures for the specified repository.", 
          githubUrl: targetUrl,
          githubEmail,
          githubToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setForensicReport(data.analysis);
      } else {
        setError(data.error || "Failed to retrieve diagnostic audit from the M2M Detective.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="ai-detective-root">
      
      {/* Top Banner explaining the Detective */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-slate-900/20 pointer-events-none select-none">
          <Terminal size={180} />
        </div>
        
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
          <Sparkles size={14} className="animate-pulse" />
          M2M DEEP FORENSIC INVESTIGATOR
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Veklom Autonomous Detective</h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
          Microsoft Copilot and generic LLMs give vague, probabilistic runarounds because they don't analyze your concrete compute environment. The Veklom Detective correlates your active telemetry loops with server-side <code className="text-cyan-400 font-mono text-[10px]">gemini-3.1-pro-preview</code> (Thinking Level: High) to trace automated breadcrumbs, verify footprints, and unlock M2M business strategies.
        </p>
      </div>

      {/* Grid: Templates vs Output Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Diagnostic Templates */}
        <div className="lg:col-span-5 space-y-4">
          {/* GitHub Traffic URL Scan Input Box */}
          <div className="bg-slate-900/50 border border-cyan-500/30 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles size={14} className="text-cyan-400" />
              Real-Time GitHub Scanner
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We connect to <strong>100% real, live GitHub APIs</strong>. Enter your repository URL (any public repo or traffic graph URL) and optional credentials below to run live forensic audits.
            </p>
            <div className="bg-slate-950/80 border border-slate-800 p-2 rounded text-[10px] text-slate-400 font-mono">
              💡 <span className="text-amber-300 font-semibold">Public Scope Note:</span> Unauthenticated scans use Veklom's global 20k+ clone benchmark dataset. Adding your Personal Access Token scopes the AI audit directly to your private traffic graphs.
            </div>
            
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">REPOSITORY URL</label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="e.g. https://github.com/reprewindai-dev/veklom-frontend"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>GITHUB EMAIL</span>
                    <span className="text-[8px] text-slate-500">(OPTIONAL)</span>
                  </label>
                  <input
                    type="email"
                    value={githubEmail}
                    onChange={(e) => setGithubEmail(e.target.value)}
                    placeholder="e.g. you@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>OAUTH TOKEN / PAT</span>
                    <span className="text-[8px] text-slate-500">(OPTIONAL)</span>
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleInvestigate("Please analyze this specific repository traffic and reconstruct the automated footprint.", githubUrl)}
              disabled={isLoading || !githubUrl.trim()}
              className={`w-full py-2.5 rounded-lg font-semibold font-mono text-xs transition flex items-center justify-center gap-1.5 ${
                isLoading || !githubUrl.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 shadow-md font-bold'
              }`}
            >
              <Search size={13} /> Scan Live Repository
            </button>
          </div>

          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            Quick Diagnostic Scanners
          </h3>

          <div className="space-y-3">
            {templates.map((tmpl, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl transition cursor-pointer group flex flex-col justify-between"
                onClick={() => {
                  if (!githubUrl.trim()) {
                    setError("Please specify a valid GitHub Repository URL above before running a forensic diagnostic run.");
                    return;
                  }
                  setQuery(tmpl.prompt);
                  handleInvestigate(tmpl.prompt);
                }}
              >
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>{tmpl.title}</span>
                    <ArrowRight size={12} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom query console */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-white font-mono flex items-center gap-1.5">
              <Terminal size={14} className="text-cyan-400" />
              Custom Forensic Request Prompt
            </h4>
            
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask the Detective anything (e.g. 'Can we lock down system_map.md behind an identity boundary?')"
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500 resize-none pr-8"
              />
            </div>

            <button
              onClick={() => {
                if (!githubUrl.trim()) {
                  setError("Please specify a valid GitHub Repository URL above before running custom forensic diagnostics.");
                  return;
                }
                handleInvestigate(query);
              }}
              disabled={isLoading || !query.trim()}
              className={`w-full py-2.5 rounded-xl font-semibold font-mono text-xs transition flex items-center justify-center gap-1.5 ${
                isLoading || !query.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-lg'
              }`}
            >
              <Search size={14} /> Run Forensic Diagnostics
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Report Console */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-xl p-5 min-h-[480px] flex flex-col">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <FileText size={16} className="text-cyan-400" />
              FORENSIC INVESTIGATOR CONSOLE
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Output: Markdown Report
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              
              {/* Idle State */}
              {!isLoading && !forensicReport && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 space-y-4"
                >
                  <div className="inline-flex p-4 rounded-full bg-slate-950 text-slate-500 border border-slate-800">
                    <Terminal size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-300">Forensic Terminal Idle</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Select one of the quick diagnostic scanners on the left or type a custom prompt to launch the deep investigator pipeline.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Loading Scanner Animation */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 space-y-6"
                >
                  <div className="relative inline-flex items-center justify-center">
                    {/* Pulsing radar */}
                    <div className="absolute inset-0 h-16 w-16 bg-cyan-500/10 rounded-full animate-ping border border-cyan-500/20"></div>
                    <div className="p-4 rounded-full bg-slate-950 text-cyan-400 border border-slate-800 relative z-10 animate-pulse">
                      <Cpu size={28} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold text-cyan-400">ACTIVATING HIGH THINKING ENGINE</h4>
                    <div className="text-[11px] text-slate-500 font-mono space-y-1 animate-pulse max-w-md mx-auto">
                      <div>&gt; Pulling live repository stats from GitHub REST API...</div>
                      <div>&gt; Correlating workflow commits and clone logs...</div>
                      <div>&gt; Analyzing M2M value boundary triggers...</div>
                      <div>&gt; Correlating system_map.md breadcrumbs...</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 text-center space-y-3"
                >
                  <AlertTriangle className="text-red-500 mx-auto" size={32} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold text-red-400">INVESTIGATION FAILED</h4>
                    <p className="text-xs text-red-300/80 max-w-md mx-auto leading-relaxed">
                      {error}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    If this is a missing API key error, you must specify GEMINI_API_KEY inside the secrets panel in Settings &gt; Secrets.
                  </div>
                </motion.div>
              )}

              {/* Finished Forensic Report Display */}
              {forensicReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin"
                >
                  <div className="flex items-center gap-2 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-slate-200">
                    <CheckCircle size={18} className="text-cyan-400 shrink-0" />
                    <span>Deep reasoning session complete. Formulated forensic M2M solution.</span>
                  </div>

                  <div className="prose prose-invert max-w-none space-y-1 font-sans">
                    {formatForensicReport(forensicReport)}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
});
