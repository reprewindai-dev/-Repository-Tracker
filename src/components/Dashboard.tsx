/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Terminal, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  Cpu, 
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldAlert as AlertIcon,
  Radio
} from 'lucide-react';
import { MachineIdentity, MeteringEvent, TelemetryLog } from '../types';
import { CLONE_HISTORY, CLONE_ATTRIBUTION } from '../data';

interface DashboardProps {
  machines: MachineIdentity[];
  meteringEvents: MeteringEvent[];
  telemetryLogs: TelemetryLog[];
  onRefresh: () => void;
  activeSimulatedTab: () => void;
}

export default function Dashboard({ 
  machines, 
  meteringEvents, 
  telemetryLogs, 
  onRefresh,
  activeSimulatedTab
}: DashboardProps) {
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);
  const [filterRepo, setFilterRepo] = useState<'all' | 'frontend' | 'backend'>('all');

  // Summary Metrics
  const totalClones = 26224; // 19593 frontend + 6631 backend
  const totalUniqueCloners = 1481; // 664 + 817
  const totalIdentified = machines.length;
  
  // Total Micropayments calculated from real and seed data
  // ⚡ Bolt: Memoized to prevent recalculation on every polling tick (4s)
  const totalSettledRevenue = useMemo(() => {
    return meteringEvents.reduce((sum, e) => sum + e.billing.total_usd, 0);
  }, [meteringEvents]);
  
  // Estimated leak is calculated as: (Total Clones - Identified/Authorized executions) * average execution value ($0.04)
  const estimatedUnmonetizedLeak = ((totalClones - meteringEvents.length) * 0.04).toFixed(2);

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 180;
  const padding = 25;

  // ⚡ Bolt: Memoized complex SVG path generation that runs on every render
  const { pointsClones, pointsKnown, pathClones, pathKnown, chartData } = useMemo(() => {
    const chartData = CLONE_ATTRIBUTION;
    const maxClones = Math.max(...chartData.map(d => d.clones)) * 1.1;

    const pointsClones = chartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (chartData.length - 1);
      const y = height - padding - (d.clones * (height - 2 * padding)) / maxClones;
      return { x, y, ...d };
    });

    const pointsKnown = chartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (chartData.length - 1);
      const y = height - padding - (d.known * (height - 2 * padding)) / maxClones;
      return { x, y, ...d };
    });

    const pathClones = pointsClones.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
    const pathKnown = pointsKnown.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");

    return { pointsClones, pointsKnown, pathClones, pathKnown, chartData };
  }, [width, height, padding]);

  return (
    <div className="space-y-6" id="dashboard-root">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 - Red themed Leaking state */}
        <div className="bg-red-950/15 border border-red-800/30 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all hover:border-red-700/40">
          <div className="absolute top-4 right-4 bg-red-950/40 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border border-red-800/40 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
            LEAKING
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-red-500/80 tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-red-400" />
              Unmonetized Clones
            </h3>
            <div className="text-4xl font-black tracking-tight text-white mt-3 font-mono">
              {totalClones.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center border-t border-red-950/60 pt-2">
            <span>from {totalUniqueCloners} unique clients</span>
            <span className="text-red-400 font-mono font-bold">~${estimatedUnmonetizedLeak} USD leak</span>
          </div>
        </div>

        {/* Metric 2 - Slate themed secured IDs */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all hover:border-slate-700">
          <div className="absolute top-4 right-4 bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border border-emerald-800/40">
            SECURED
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-emerald-400" />
              Secured ID Entities
            </h3>
            <div className="text-4xl font-black tracking-tight text-white mt-3 font-mono">
              {totalIdentified}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/60 pt-2">
            Machine passports issued & running
          </div>
        </div>

        {/* Metric 3 - Slate themed metered runs */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all hover:border-slate-700">
          <div className="absolute top-4 right-4 bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border border-cyan-800/40">
            METERED
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-cyan-400" />
              Metered Runs
            </h3>
            <div className="text-4xl font-black tracking-tight text-white mt-3 font-mono">
              {meteringEvents.length}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/60 pt-2">
            Governed capability executions
          </div>
        </div>

        {/* Metric 4 - Emerald themed Monetization Engine */}
        <div className="bg-emerald-950/20 border border-emerald-800/30 p-5 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all hover:border-emerald-700/40">
          <div className="absolute top-4 right-4 bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border border-emerald-800/40">
            M2M ACTIVE
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              Settled Revenue (x402)
            </h3>
            <div className="text-4xl font-black tracking-tight text-emerald-400 mt-3 font-mono">
              ${totalSettledRevenue.toFixed(4)}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center border-t border-emerald-900/30 pt-2">
            <span>Aggregated micropayments</span>
            <span className="text-emerald-400 font-mono font-bold">100% Traceable</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart comparison */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-cyan-400" />
              14-Day M2M Traffic Spectrum
            </h3>
            <p className="text-[11px] text-slate-400">
              The crimson peak represents the anonymous cloner wave. The emerald region highlights verified M2M identities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition flex items-center gap-1 text-xs font-mono"
            >
              <RefreshCw size={12} className="animate-spin-slow" />
              REFRESH
            </button>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative bg-slate-950/60 rounded-xl p-2 border border-slate-800/60 overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding + ratio * (height - 2 * padding);
              return (
                <line 
                  key={i} 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  className="stroke-slate-800/80 stroke-dasharray-[2,2]" 
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Red Area (Leaking clones) */}
            <path
              d={`${pathClones} L ${pointsClones[pointsClones.length - 1].x} ${height - padding} L ${pointsClones[0].x} ${height - padding} Z`}
              fill="url(#red-gradient)"
              className="opacity-15"
            />

            {/* Green Area (Verified identities) */}
            <path
              d={`${pathKnown} L ${pointsKnown[pointsKnown.length - 1].x} ${height - padding} L ${pointsKnown[0].x} ${height - padding} Z`}
              fill="url(#green-gradient)"
              className="opacity-25"
            />

            {/* Line 1: Anonymous Clones */}
            <path
              d={pathClones}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Line 2: Identified installations */}
            <path
              d={pathKnown}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Points on Hover */}
            {pointsClones.map((pt, i) => (
              <circle
                key={`c-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredDataPoint?.date === pt.date ? 6 : 3}
                fill="#ef4444"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredDataPoint(pt)}
                onMouseLeave={() => setHoveredDataPoint(null)}
              />
            ))}

            {pointsKnown.map((pt, i) => (
              <circle
                key={`k-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredDataPoint?.date === pt.date ? 6 : 3}
                fill="#10b981"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredDataPoint(pt)}
                onMouseLeave={() => setHoveredDataPoint(null)}
              />
            ))}

            {/* X-axis texts */}
            {chartData.map((d, i) => {
              const x = padding + (i * (width - 2 * padding)) / (chartData.length - 1);
              return (
                <text
                  key={`tx-${i}`}
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9px]"
                >
                  {d.date}
                </text>
              );
            })}

            {/* Gradients */}
            <defs>
              <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tooltip Overlay */}
          <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-xs font-mono space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-slate-400">Total Clones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Identified (Passport Issued)</span>
            </div>
          </div>

          <AnimatePresence>
            {hoveredDataPoint && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 right-2 bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono shadow-xl"
              >
                <div className="text-slate-400 font-semibold mb-1">Date: {hoveredDataPoint.date}</div>
                <div className="text-red-400">Clones: {hoveredDataPoint.clones.toLocaleString()}</div>
                <div className="text-emerald-400">Identified: {hoveredDataPoint.known.toLocaleString()}</div>
                <div className="text-amber-400 text-[10px] mt-1 border-t border-slate-800 pt-1">
                  M2M Leakage Rate: {((hoveredDataPoint.unknown / hoveredDataPoint.clones) * 100).toFixed(1)}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* WHO, WHAT, WHY, WHEN, WHERE Forensic Bento Grid */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4" id="m2m-breadcrumbs-bento">
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-1">
            <Radio size={14} className="text-cyan-400" />
            M2M TRAFFIC BREADCRUMB CORRELATION (WHO, WHAT, WHY, WHEN, WHERE)
          </h3>
          <p className="text-[11px] text-slate-400">
            A precise, non-intrusive forensic attribution of repository cloning activity. No user chasing—pure M2M demand-spectrum intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: WHO */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-800 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                WHO
              </span>
              <span className="text-[10px] font-mono text-slate-500">Identity Class</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Client Spectrum</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">AI Coding Agents</span>
                  <span className="font-mono text-cyan-400 font-bold">58%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[58%]"></div>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">CI/CD Run Loops</span>
                  <span className="font-mono text-emerald-400 font-bold">32%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[32%]"></div>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Sec Scanners & Bots</span>
                  <span className="font-mono text-amber-500 font-bold">10%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[10%]"></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic pt-1 border-t border-slate-900/60">
              Predominantly autonomous systems rather than human browsers.
            </p>
          </div>

          {/* Card 2: WHAT */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-800 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                WHAT
              </span>
              <span className="text-[10px] font-mono text-slate-500">Resource Targets</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Top Targets</div>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-slate-300 truncate max-w-[100px]">/system_map.md</span>
                  <span className="text-cyan-400 font-bold">72%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-slate-300 truncate max-w-[100px]">/pulls/overview</span>
                  <span className="text-slate-400 font-bold">21%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded">
                  <span className="text-slate-300 truncate max-w-[100px]">/security/alerts</span>
                  <span className="text-amber-500 font-bold">7%</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic pt-1 border-t border-slate-900/60">
              Aggressive exploration of main system specifications.
            </p>
          </div>

          {/* Card 3: WHY */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-800 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                WHY
              </span>
              <span className="text-[10px] font-mono text-slate-500">System Motive</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Inferred Purpose</div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-start gap-1 bg-slate-900/40 p-1 rounded text-slate-300">
                  <span className="text-cyan-400">🤖</span>
                  <span><strong>Workspace Hydration:</strong> Ephemeral dev tools rebuilding the frontend.</span>
                </div>
                <div className="flex items-start gap-1 bg-slate-900/40 p-1 rounded text-slate-300">
                  <span className="text-emerald-400">🔄</span>
                  <span><strong>CI/CD Verify:</strong> Routine git checkout pipelines validating builds.</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic pt-1 border-t border-slate-900/60">
              Automation pulls outweigh active human inspection.
            </p>
          </div>

          {/* Card 4: WHEN */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-800 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                WHEN
              </span>
              <span className="text-[10px] font-mono text-slate-500">Temporal Waves</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Trigger Times</div>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Commit Hooks:</span>
                  <span className="text-emerald-400 font-bold">Immediate</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cron Schedules:</span>
                  <span className="text-slate-300 font-bold">00:00 UTC</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Agent Triggers:</span>
                  <span className="text-cyan-400 font-bold">On-Demand</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic pt-1 border-t border-slate-900/60">
              Sustained 24/7 frequency matches server/agent automation.
            </p>
          </div>

          {/* Card 5: WHERE */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-800 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                WHERE
              </span>
              <span className="text-[10px] font-mono text-slate-500">Origin Channels</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Referral Nodes</div>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Getup.com:</span>
                  <span className="text-white font-bold">19,593</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bing API:</span>
                  <span className="text-white">1,204</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Github CI:</span>
                  <span className="text-white">442</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Private:</span>
                  <span className="text-white">253</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic pt-1 border-t border-slate-900/60">
              Primarily referenced via automated indexers & platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Active Billing Streams & Passports list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Passports Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-400" />
                Active Machine Identity Passports
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {machines.length} ONLINE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2">Token / ID</th>
                    <th className="pb-2">Repository</th>
                    <th className="pb-2">Host / Agent</th>
                    <th className="pb-2">Tier</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {machines.map((mach, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5">
                        <div className="text-white font-semibold truncate max-w-[130px]" title={mach.token}>
                          {mach.token ? `${mach.token.substring(0, 14)}...` : `inst_${mach.installation_id.substring(0,6)}`}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Inst ID: {mach.installation_id.substring(0, 10)}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {mach.repository}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="text-slate-300 truncate max-w-[150px]">{mach.origin.hostname}</div>
                        <div className="text-slate-500 text-[10px]">{mach.origin.agent.substring(0, 25)}</div>
                      </td>
                      <td className="py-2.5">
                        <span className="capitalize text-cyan-400">{mach.license.tier}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                  {machines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No active machine passports issued yet. Go to the <button onClick={activeSimulatedTab} className="text-cyan-400 hover:underline">Client Simulator</button> to spawn AI Agents and trigger registrations!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Billing Streams */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-4">
              <DollarSign size={14} className="text-amber-400" />
              x402 Micropayment Ledger Settlements
            </h3>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {meteringEvents.map((evt, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {evt.capability === 'risk_score' ? '🔍 Risk Score' :
                         evt.capability === 'architecture_validate' ? '📐 Arch Validate' :
                         evt.capability === 'policy_enforce' ? '🛡️ Policy Enforce' : '📄 Full Audit'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[10px] flex items-center gap-1">
                      <span>Ledger Anchor:</span>
                      <span className="text-amber-500/80 font-bold flex items-center gap-0.5">
                        {evt.governance?.ledger_anchor}
                        <CheckCircle size={10} className="text-emerald-500 inline" />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-semibold font-mono">
                      +${evt.billing.total_usd.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      via {evt.billing.settlement}
                    </div>
                  </div>
                </div>
              ))}
              {meteringEvents.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No micropayment events recorded yet. Run simulations to generate billable events.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Live Telemetry Bus Stream */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400 animate-pulse" />
                Live Telemetry Log Bus
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">STREAMING</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 space-y-3 h-[420px] overflow-y-auto overflow-x-hidden scrollbar-thin">
              {telemetryLogs.map((log, i) => (
                <div key={i} className="border-l-2 border-slate-800 pl-2 py-0.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      log.type === 'identity.registered' ? 'text-emerald-400' :
                      log.type === 'metering.recorded' ? 'text-amber-400' :
                      log.type === 'gateway.error' ? 'text-red-400' : 'text-cyan-400'
                    }`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-slate-600 text-[9px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))}
              {telemetryLogs.length === 0 && (
                <div className="text-slate-600 text-center py-20">
                  Telemetry bus idle. Waiting for machine inputs...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-3">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              M2M telemetry captures automated git operations and correlates them with runtime identity signatures.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
