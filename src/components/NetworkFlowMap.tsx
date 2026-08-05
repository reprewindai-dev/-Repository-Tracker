import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Cpu, 
  Server, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  GitBranch, 
  Filter, 
  ArrowRight,
  Terminal,
  Lock,
  DollarSign,
  Radio
} from 'lucide-react';
import { MachineIdentity, MeteringEvent } from '../types';

interface NetworkFlowMapProps {
  machines: MachineIdentity[];
  meteringEvents: MeteringEvent[];
  onSelectMachine?: (machine: MachineIdentity) => void;
}

interface NodeItem {
  id: string;
  name: string;
  type: 'agent' | 'gateway' | 'repo';
  subType?: 'ai_agent' | 'ci_cd' | 'scanner' | 'anonymous' | 'gateway' | 'repo';
  status: 'active' | 'leaking' | 'metered';
  stats: string;
  icon: any;
  color: string;
  category: string;
  details?: any;
}

interface EdgeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  volume: number; // e.g. clone volume or request frequency
  frequency: 'high' | 'medium' | 'low';
  protocol: 'x402-http' | 'git-upload-pack' | 'oidc-jwt' | 'anonymous-raw';
  status: 'secured' | 'leaking' | 'metered';
  label: string;
}

// ⚡ Bolt Optimization: Wrap NetworkFlowMap in React.memo to prevent expensive re-renders
// (calculating SVG paths) when the parent Dashboard updates local state (e.g., hovering tooltips).
const NetworkFlowMap = React.memo(function NetworkFlowMap({ machines, meteringEvents }: NetworkFlowMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'high_freq' | 'metered' | 'leaking'>('all');
  const [selectedRepoFilter, setSelectedRepoFilter] = useState<'all' | 'frontend' | 'backend'>('all');

  // Build nodes
  const nodes: NodeItem[] = useMemo(() => {
    // Static & dynamic agent nodes
    const baseAgents: NodeItem[] = [
      {
        id: 'agent_cursor',
        name: 'Cursor IDE Agent Workspace',
        type: 'agent',
        subType: 'ai_agent',
        status: 'metered',
        stats: '11,364 requests/day',
        icon: Cpu,
        color: '#22d3ee', // Cyan
        category: 'AI Developer Workspace',
        details: { agent: 'Cursor-AI/2.4 (x86_64)', tier: 'fleet', ip: '34.120.88.19', passport: 'pass_secp256k1_0x89f2c...' }
      },
      {
        id: 'agent_ghactions',
        name: 'GitHub Actions OIDC Runners',
        type: 'agent',
        subType: 'ci_cd',
        status: 'active',
        stats: '8,320 clones/day',
        icon: Zap,
        color: '#10b981', // Emerald
        category: 'CI/CD Automated Pipeline',
        details: { agent: 'GitHub-Hookshot/f31e2a', tier: 'enterprise', ip: '140.82.115.4', passport: 'pass_secp256k1_0x33a1e...' }
      },
      {
        id: 'agent_claude',
        name: 'Claude Code CLI Agent',
        type: 'agent',
        subType: 'ai_agent',
        status: 'metered',
        stats: '3,840 calls/day',
        icon: Terminal,
        color: '#38bdf8', // Sky
        category: 'Autonomous AI Terminal',
        details: { agent: 'Claude-Code/1.0.4', tier: 'developer', ip: '52.9.142.201', passport: 'pass_secp256k1_0x11d8c...' }
      },
      {
        id: 'agent_dependabot',
        name: 'Dependabot / Security Scanners',
        type: 'agent',
        subType: 'scanner',
        status: 'active',
        stats: '1,200 audits/day',
        icon: Lock,
        color: '#f59e0b', // Amber
        category: 'Dependency Auditor',
        details: { agent: 'Dependabot-Fetcher/2.0', tier: 'free', ip: '192.30.252.12', passport: 'pass_secp256k1_0xee44b...' }
      },
      {
        id: 'agent_anonymous',
        name: 'Unidentified Botnets / Scrapers',
        type: 'agent',
        subType: 'anonymous',
        status: 'leaking',
        stats: '1,500 unmonetized/day',
        icon: ShieldAlert,
        color: '#ef4444', // Red
        category: 'Anonymous Cloners',
        details: { agent: 'git/2.39.2 (Linux x86_64)', tier: 'none', ip: '185.220.101.5', passport: 'UNREGISTERED' }
      }
    ];

    // Add any dynamic machines registered in runtime state
    machines.forEach((m, idx) => {
      const id = `dynamic_mach_${idx}_${m.installation_id.substring(0, 6)}`;
      if (!baseAgents.some(a => a.id === id)) {
        baseAgents.push({
          id,
          name: m.origin.hostname || `Machine ${m.installation_id.substring(0, 8)}`,
          type: 'agent',
          subType: 'ai_agent',
          status: 'metered',
          stats: `${m.license.tier.toUpperCase()} Tier`,
          icon: Cpu,
          color: '#a855f7', // Purple
          category: 'Live Registered Machine',
          details: { agent: m.origin.agent, tier: m.license.tier, ip_hash: m.origin.ip_hash, passport: m.token }
        });
      }
    });

    // Central Gateway Hub
    const gatewayNode: NodeItem = {
      id: 'gateway_hub',
      name: 'M2M Gateway Interceptor (x402)',
      type: 'gateway',
      subType: 'gateway',
      status: 'metered',
      stats: '26,224 requests handled',
      icon: Network,
      color: '#06b6d4', // Cyan hub
      category: 'Settlement & Passport Core',
      details: { protocol: 'x402 HTTP Payment Header + Gnomledger', status: 'ONLINE', port: '3000' }
    };

    // Target Repositories
    const repos: NodeItem[] = [
      {
        id: 'repo_frontend',
        name: 'veklom-frontend',
        type: 'repo',
        subType: 'repo',
        status: 'leaking',
        stats: '19,593 clones (74.7%)',
        icon: GitBranch,
        color: '#22d3ee',
        category: 'React 18 + Vite Web Client',
        details: { owner: 'reprewindai-dev', clones: 19593, unique_cloners: 664, leak_est: '$783.72' }
      },
      {
        id: 'repo_backend',
        name: 'veklom-byos-backend',
        type: 'repo',
        subType: 'repo',
        status: 'metered',
        stats: '6,631 clones (25.3%)',
        icon: Server,
        color: '#10b981',
        category: 'Node.js ESM REST Engine',
        details: { owner: 'reprewindai-dev', clones: 6631, unique_cloners: 817, leak_est: '$265.24' }
      }
    ];

    return [...baseAgents, gatewayNode, ...repos];
  }, [machines]);

  // Build edges connecting agents -> gateway -> repos
  const edges: EdgeConnection[] = useMemo(() => {
    return [
      // High frequency path 1: Cursor -> Gateway
      {
        id: 'edge_cursor_gw',
        sourceId: 'agent_cursor',
        targetId: 'gateway_hub',
        volume: 11364,
        frequency: 'high',
        protocol: 'x402-http',
        status: 'metered',
        label: '11.3k req/d (High Freq)'
      },
      // High frequency path 2: GitHub Actions -> Gateway
      {
        id: 'edge_ghactions_gw',
        sourceId: 'agent_ghactions',
        targetId: 'gateway_hub',
        volume: 8320,
        frequency: 'high',
        protocol: 'oidc-jwt',
        status: 'secured',
        label: '8.3k req/d (High Freq)'
      },
      // Medium frequency path 3: Claude Code -> Gateway
      {
        id: 'edge_claude_gw',
        sourceId: 'agent_claude',
        targetId: 'gateway_hub',
        volume: 3840,
        frequency: 'medium',
        protocol: 'x402-http',
        status: 'metered',
        label: '3.8k req/d'
      },
      // Low frequency path 4: Dependabot -> Gateway
      {
        id: 'edge_dependabot_gw',
        sourceId: 'agent_dependabot',
        targetId: 'gateway_hub',
        volume: 1200,
        frequency: 'low',
        protocol: 'git-upload-pack',
        status: 'secured',
        label: '1.2k req/d'
      },
      // Unmonetized path 5: Anonymous -> Gateway
      {
        id: 'edge_anon_gw',
        sourceId: 'agent_anonymous',
        targetId: 'gateway_hub',
        volume: 1500,
        frequency: 'high',
        protocol: 'anonymous-raw',
        status: 'leaking',
        label: '1.5k unmonetized/d'
      },

      // Gateway -> veklom-frontend (High Frequency main destination)
      {
        id: 'edge_gw_frontend',
        sourceId: 'gateway_hub',
        targetId: 'repo_frontend',
        volume: 19593,
        frequency: 'high',
        protocol: 'git-upload-pack',
        status: 'leaking',
        label: '19,593 clones/14d (74.7%)'
      },

      // Gateway -> veklom-byos-backend
      {
        id: 'edge_gw_backend',
        sourceId: 'gateway_hub',
        targetId: 'repo_backend',
        volume: 6631,
        frequency: 'medium',
        protocol: 'x402-http',
        status: 'metered',
        label: '6,631 clones/14d (25.3%)'
      }
    ];
  }, []);

  // Filter edges based on filter controls
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      if (filterMode === 'high_freq' && edge.frequency !== 'high') return false;
      if (filterMode === 'metered' && edge.status !== 'metered' && edge.status !== 'secured') return false;
      if (filterMode === 'leaking' && edge.status !== 'leaking') return false;

      if (selectedRepoFilter === 'frontend') {
        if (edge.targetId === 'repo_backend' || (edge.sourceId === 'gateway_hub' && edge.targetId !== 'repo_frontend')) {
          return false;
        }
      }
      if (selectedRepoFilter === 'backend') {
        if (edge.targetId === 'repo_frontend' || (edge.sourceId === 'gateway_hub' && edge.targetId !== 'repo_backend')) {
          return false;
        }
      }

      return true;
    });
  }, [edges, filterMode, selectedRepoFilter]);

  // Helper coordinate generator for 3-column layout canvas
  // Column 1 (Agents): X=60, Column 2 (Gateway): X=330, Column 3 (Repos): X=600
  const getNodeCoordinates = (node: NodeItem, index: number, totalInCol: number) => {
    if (node.type === 'agent') {
      const colHeight = 340;
      const step = colHeight / (totalInCol + 1);
      return { x: 75, y: 35 + (index + 1) * step };
    }
    if (node.type === 'gateway') {
      return { x: 330, y: 205 };
    }
    // Repo
    const step = 200 / (totalInCol + 1);
    return { x: 585, y: 105 + (index + 1) * step };
  };

  const agentNodes = nodes.filter(n => n.type === 'agent');
  const gatewayNodes = nodes.filter(n => n.type === 'gateway');
  const repoNodes = nodes.filter(n => n.type === 'repo');

  const nodePosMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    agentNodes.forEach((n, i) => map.set(n.id, getNodeCoordinates(n, i, agentNodes.length)));
    gatewayNodes.forEach((n, i) => map.set(n.id, getNodeCoordinates(n, i, gatewayNodes.length)));
    repoNodes.forEach((n, i) => map.set(n.id, getNodeCoordinates(n, i, repoNodes.length)));
    return map;
  }, [agentNodes, gatewayNodes, repoNodes]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Network size={16} />
            </span>
            <h3 className="text-sm font-bold uppercase text-slate-200 tracking-wider font-mono">
              Live M2M Topology & Traffic Flow Map
            </h3>
            <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              REAL-TIME FLOW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing high-frequency connections between autonomous machine identities, the x402 Gateway Interceptor, and target GitHub repositories.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Traffic mode filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'all' ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              All Paths
            </button>
            <button
              onClick={() => setFilterMode('high_freq')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${filterMode === 'high_freq' ? 'bg-amber-950 text-amber-400 font-bold border border-amber-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Zap size={11} /> High Freq Only
            </button>
            <button
              onClick={() => setFilterMode('metered')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'metered' ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              x402 Metered
            </button>
            <button
              onClick={() => setFilterMode('leaking')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'leaking' ? 'bg-red-950 text-red-400 font-bold border border-red-800/40' : 'text-slate-400 hover:text-white'}`}
            >
              Unmonetized
            </button>
          </div>

          {/* Repo Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setSelectedRepoFilter('all')}
              className={`px-2 py-1 rounded-md ${selectedRepoFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All Repos
            </button>
            <button
              onClick={() => setSelectedRepoFilter('frontend')}
              className={`px-2 py-1 rounded-md ${selectedRepoFilter === 'frontend' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Frontend
            </button>
            <button
              onClick={() => setSelectedRepoFilter('backend')}
              className={`px-2 py-1 rounded-md ${selectedRepoFilter === 'backend' ? 'bg-emerald-950 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Backend
            </button>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* SVG Flow Canvas (3 cols on large screens) */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 relative overflow-hidden min-h-[410px]">
          
          {/* Legend Banner */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono backdrop-blur">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-300">AI Agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">CI/CD Automation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">High-Freq Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-slate-300">Unmonetized Leak</span>
            </div>
          </div>

          {/* Column labels */}
          <div className="absolute bottom-2 left-0 right-0 px-6 flex justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
            <span>COL 1: MACHINE IDENTITIES</span>
            <span>COL 2: GATEWAY INTERCEPTOR</span>
            <span>COL 3: TARGET REPOSITORIES</span>
          </div>

          {/* Interactive SVG Layer */}
          <svg viewBox="0 0 660 410" className="w-full h-auto">
            <defs>
              {/* Radial glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Gradient strokes */}
              <linearGradient id="grad-high-freq" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              <linearGradient id="grad-leaking" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>

              <linearGradient id="grad-metered" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            {/* Render Edges / Curved Connection Lines */}
            {filteredEdges.map(edge => {
              const srcPos = nodePosMap.get(edge.sourceId);
              const tgtPos = nodePosMap.get(edge.targetId);

              if (!srcPos || !tgtPos) return null;

              const isHighlighted = 
                hoveredEdgeId === edge.id || 
                selectedNodeId === edge.sourceId || 
                selectedNodeId === edge.targetId;

              // Cubic bezier control points
              const dx = (tgtPos.x - srcPos.x) / 2;
              const pathD = `M ${srcPos.x} ${srcPos.y} C ${srcPos.x + dx} ${srcPos.y}, ${tgtPos.x - dx} ${tgtPos.y}, ${tgtPos.x} ${tgtPos.y}`;

              // Determine color & stroke properties
              let strokeColor = '#334155';
              let strokeWidth = 1.5;
              let animSpeed = '4s';

              if (edge.frequency === 'high') {
                strokeColor = 'url(#grad-high-freq)';
                strokeWidth = isHighlighted ? 3.5 : 2.5;
                animSpeed = '1.8s';
              } else if (edge.status === 'leaking') {
                strokeColor = 'url(#grad-leaking)';
                strokeWidth = isHighlighted ? 3 : 2;
                animSpeed = '2.5s';
              } else if (edge.status === 'metered') {
                strokeColor = 'url(#grad-metered)';
                strokeWidth = isHighlighted ? 3 : 2;
                animSpeed = '2.2s';
              }

              return (
                <g key={edge.id} className="cursor-pointer" onMouseEnter={() => setHoveredEdgeId(edge.id)} onMouseLeave={() => setHoveredEdgeId(null)}>
                  {/* Background thicker glow path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edge.status === 'leaking' ? '#ef4444' : edge.frequency === 'high' ? '#f59e0b' : '#06b6d4'}
                    strokeWidth={strokeWidth + 2}
                    className={`transition-all duration-300 ${isHighlighted ? 'opacity-40' : 'opacity-10'}`}
                  />

                  {/* Main connection line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={edge.frequency === 'high' ? '6 4' : '4 4'}
                    className="transition-all duration-200"
                  />

                  {/* Animated Data Packets / Floating Pulses moving along the path */}
                  <motion.circle
                    r={edge.frequency === 'high' ? 3.5 : 2.5}
                    fill={edge.status === 'leaking' ? '#ef4444' : edge.frequency === 'high' ? '#f59e0b' : '#22d3ee'}
                    filter="url(#glow)"
                  >
                    <animateMotion
                      path={pathD}
                      dur={animSpeed}
                      repeatCount="indefinite"
                    />
                  </motion.circle>

                  <motion.circle
                    r={edge.frequency === 'high' ? 2.5 : 2}
                    fill={edge.status === 'metered' ? '#10b981' : '#ffffff'}
                  >
                    <animateMotion
                      path={pathD}
                      dur={animSpeed}
                      begin="0.9s"
                      repeatCount="indefinite"
                    />
                  </motion.circle>

                  {/* Edge Label on Hover */}
                  {isHighlighted && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 8}
                      textAnchor="middle"
                      className="fill-amber-300 font-mono text-[9px] font-bold bg-slate-900 px-1"
                    >
                      {edge.label} ({edge.protocol})
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map(node => {
              const pos = nodePosMap.get(node.id);
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const IconComponent = node.icon;

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      r={node.type === 'gateway' ? 34 : 26}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Highlighting pulse for Gateway or High-Freq targets */}
                  {node.type === 'gateway' && (
                    <circle
                      r="38"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1"
                      className="animate-ping opacity-30"
                    />
                  )}

                  {/* Node Circle Background */}
                  <circle
                    r={node.type === 'gateway' ? 28 : 20}
                    fill="#0f172a"
                    stroke={node.color}
                    strokeWidth={isSelected ? "3" : "2"}
                    filter="url(#glow)"
                    className="transition-all duration-200 group-hover:scale-110"
                  />

                  {/* Node Icon */}
                  <foreignObject 
                    x={node.type === 'gateway' ? -12 : -9} 
                    y={node.type === 'gateway' ? -12 : -9} 
                    width={node.type === 'gateway' ? 24 : 18} 
                    height={node.type === 'gateway' ? 24 : 18}
                  >
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <IconComponent size={node.type === 'gateway' ? 18 : 14} style={{ color: node.color }} />
                    </div>
                  </foreignObject>

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y={node.type === 'gateway' ? 44 : 32}
                    textAnchor="middle"
                    className="fill-slate-200 font-mono text-[9.5px] font-bold"
                  >
                    {node.name.length > 20 ? `${node.name.substring(0, 18)}...` : node.name}
                  </text>

                  {/* Subtitle Stats */}
                  <text
                    x="0"
                    y={node.type === 'gateway' ? 56 : 43}
                    textAnchor="middle"
                    className="fill-slate-400 font-mono text-[8px]"
                  >
                    {node.stats}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Sidebar (1 col) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono space-y-4">
          {selectedNode ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedNode.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase">Node Diagnostics</span>
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-slate-900 border border-slate-800" style={{ color: selectedNode.color }}>
                    {React.createElement(selectedNode.icon, { size: 18 })}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{selectedNode.name}</h4>
                    <p className="text-[10px] text-slate-400">{selectedNode.category}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedNode.status === 'metered' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60' :
                    selectedNode.status === 'leaking' ? 'bg-red-950/80 text-red-400 border-red-800/60' :
                    'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                  }`}>
                    {selectedNode.status === 'metered' ? 'METERED (x402)' :
                     selectedNode.status === 'leaking' ? 'UNMONETIZED TRAFFIC' : 'PASSPORT SECURED'}
                  </span>
                </div>

                {/* Detailed Attributes */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg space-y-1.5 text-[10px]">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                    System Parameters:
                  </div>
                  {Object.entries(selectedNode.details || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[110px]" title={String(v)}>
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Traffic summary for this node */}
                <div className="bg-cyan-950/20 border border-cyan-900/40 p-2.5 rounded-lg space-y-1">
                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    <Radio size={12} /> Live Flow Volume
                  </div>
                  <p className="text-[11px] text-slate-300 font-bold">
                    {selectedNode.stats}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Routing through M2M Interceptor via Gnomledger proof blocks.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500 space-y-2">
              <Network size={28} className="text-slate-700 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Select a Node in the Canvas</p>
              <p className="text-[10px] leading-relaxed max-w-[180px]">
                Click any Machine Identity, Gateway Hub, or Repository Node to inspect live telemetry and passport credentials.
              </p>
            </div>
          )}

          {/* Quick Stats Summary Footer */}
          <div className="border-t border-slate-800/80 pt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Identified Path Share:</span>
              <span className="text-emerald-400 font-bold">88.2%</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Unmonetized Leak Path:</span>
              <span className="text-red-400 font-bold">11.8%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default NetworkFlowMap;
