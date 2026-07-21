/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Terminal, 
  Cpu, 
  FileText, 
  Layers, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  BookOpen
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ClientSimulator from './components/ClientSimulator';
import AiDetective from './components/AiDetective';
import SpecsViewer from './components/SpecsViewer';

import { MachineIdentity, MeteringEvent, TelemetryLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'detective' | 'simulator' | 'specs'>('dashboard');
  
  // State from server
  const [machines, setMachines] = useState<MachineIdentity[]>([]);
  const [meteringEvents, setMeteringEvents] = useState<MeteringEvent[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchServerState = useCallback(async () => {
    try {
      const [machRes, meterRes, telRes] = await Promise.all([
        fetch("/api/identity/list"),
        fetch("/api/metering/list"),
        fetch("/api/telemetry/bus")
      ]);

      const [machData, meterData, telData] = await Promise.all([
        machRes.json(),
        meterRes.json(),
        telRes.json()
      ]);

      setMachines(prev => JSON.stringify(prev) === JSON.stringify(machData) ? prev : machData);
      setMeteringEvents(prev => JSON.stringify(prev) === JSON.stringify(meterData) ? prev : meterData);
      setTelemetryLogs(prev => JSON.stringify(prev) === JSON.stringify(telData) ? prev : telData);
    } catch (err) {
      console.error("Failed to load server state:", err);
    }
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchServerState();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Fetch initial state and poll every 4 seconds to catch active simulated executions
  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 4000);
    return () => clearInterval(interval);
  }, [fetchServerState]);

  const handleActiveSimulatedTab = useCallback(() => setActiveTab('simulator'), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation / Status Header Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                V
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-white font-mono">
                  Veklom M2M Core
                </h1>
                <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-none mt-1">
                Forensic Cloner Attribution & Value-Boundary Settlement Engine
              </p>
            </div>
          </div>

          {/* Network System Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span>Gnomledger: <span className="text-emerald-400 font-semibold">Online</span></span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Boundary Gate: <span className="text-cyan-400 font-semibold">Enforcing</span></span>
            </div>
            <button 
              onClick={handleManualRefresh}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh State"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Core Workspace Header & Tab Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              {activeTab === 'dashboard' ? '📊 Forensic Analytics Workspace' :
               activeTab === 'detective' ? '🔍 AI Forensic Investigator Console' :
               activeTab === 'simulator' ? '⚡ Autonomous M2M Sandbox Simulator' : '📄 Protocol Specifications'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'dashboard' ? 'Attribute anonymous clones and analyze secure identity migrations.' :
               activeTab === 'detective' ? 'Run advanced, high-thinking trace pattern-matching detective reports.' :
               activeTab === 'simulator' ? 'Onboard simulated cloners, acquire passports, and trigger settled API gates.' : 'Explore standard schemas for machine-native platform integration.'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border border-slate-900 bg-slate-950 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp size={13} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('detective')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'detective' 
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} className="text-cyan-400" />
              AI Detective
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator' 
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={13} />
              Sandbox
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'specs' 
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={13} />
              Specs
            </button>
          </div>
        </div>

        {/* Tab content screens */}
        <div>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Dashboard 
                  machines={machines} 
                  meteringEvents={meteringEvents} 
                  telemetryLogs={telemetryLogs} 
                  onRefresh={fetchServerState} 
                  activeSimulatedTab={handleActiveSimulatedTab}
                />
              </motion.div>
            )}

            {activeTab === 'detective' && (
              <motion.div
                key="detective"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <AiDetective />
              </motion.div>
            )}

            {activeTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ClientSimulator onEventTriggered={fetchServerState} />
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <SpecsViewer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Footer System Credits */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-12 text-center text-[10px] text-slate-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>&copy; 2026 Veklom. All Rights Reserved. M2M Infrastructure standards compliant.</span>
          <span>Security Token: SHA-256 Verified Ledger System</span>
        </div>
      </footer>

    </div>
  );
}
