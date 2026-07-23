/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  Database, 
  ShieldAlert, 
  Layers, 
  FileCode,
  Download
} from 'lucide-react';
import { CAPABILITIES } from '../data';

// ⚡ Bolt: Added React.memo to prevent unnecessary re-renders when parent polls without changes
export default React.memo(function SpecsViewer() {
  const [activeTab, setActiveTab] = useState<'discovery' | 'identity' | 'metering' | 'x402' | 'mtp'>('discovery');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const specs = {
    discovery: {
      title: "veklom-discovery.json (v2.0)",
      description: "Exposes endpoints, microtransaction pricing, licensing, and quota metrics directly to incoming autonomous agents.",
      json: `{
  "version": "2.0",
  "name": "Veklom M2M Ledger",
  "description": "Machine-native governance, architecture validation, repo risk scoring, and agent safety runtime.",
  "documentation": "https://veklom.com/docs",
  "identity": {
    "required": true,
    "endpoint": "/api/identity/register",
    "fields": [
      "installation_id",
      "deployment_id",
      "workspace_id",
      "version",
      "environment"
    ]
  },
  "metering": {
    "endpoint": "/api/metering/record",
    "capabilities": [
      "risk_score",
      "architecture_validate",
      "policy_enforce",
      "audit_full"
    ]
  },
  "api": {
    "risk_score": {
      "endpoint": "/api/gateway/risk_score",
      "method": "POST",
      "price_per_call_usd": 0.002,
      "rate_limit_per_minute": 600
    },
    "architecture_validate": {
      "endpoint": "/api/gateway/architecture_validate",
      "method": "POST",
      "price_per_call_usd": 0.01,
      "rate_limit_per_minute": 300
    },
    "policy_enforce": {
      "endpoint": "/api/gateway/policy_enforce",
      "method": "POST",
      "price_per_call_usd": 0.05,
      "rate_limit_per_minute": 120
    },
    "audit_full": {
      "endpoint": "/api/gateway/audit_full",
      "method": "POST",
      "price_per_call_usd": 0.10,
      "rate_limit_per_minute": 60
    }
  },
  "machine_access_credits": {
    "tiers": {
      "free": { "daily_clone_quota": 100, "price_usd": 0 },
      "developer": { "daily_clone_quota": 5000, "price_usd": 9 },
      "fleet": { "daily_clone_quota": 50000, "price_usd": 49 },
      "industrial": { "daily_clone_quota": 500000, "price_usd": 199 }
    }
  }
}`
    },
    identity: {
      title: "Veklom Installation Identity (VII) Schema",
      description: "Generates cryptographically signed machine passports on startup. No capability executes without verifying this identity token.",
      json: `{
  "installation_id": "inst_7bf91d3c",
  "deployment_id": "dep_4fa09e1d",
  "workspace_id": "ws_agent_autonomous",
  "repository": "veklom-frontend",
  "version": "v1.4.2-autonomous",
  "environment": "production",
  "token": "vkm_token_71fb8cd902a41...",
  "origin": {
    "hostname": "coolify-srv-01",
    "ip_hash": "sha256_cool_srv_1",
    "agent": "coolify-deployment-pipeline"
  },
  "license": {
    "status": "active",
    "tier": "fleet"
  },
  "first_seen": "2026-07-14T12:00:00Z",
  "last_seen": "2026-07-15T19:18:54Z"
}`
    },
    metering: {
      title: "Veklom Runtime Metering (VRM) Model",
      description: "Logs every single dynamic capability run with secure hashes of inputs, outputs, and ledger transaction signatures.",
      json: `{
  "event_id": "evt_47c9e10d",
  "execution_id": "exec_81fa0e2c",
  "installation_id": "inst_7bf91d3c",
  "workspace_id": "ws_agent_autonomous",
  "capability": "policy_enforce",
  "timestamp": "2026-07-15T19:21:00Z",
  "inputs_hash": "sha256_7fa2bd...",
  "outputs_hash": "sha256_8cb0de...",
  "billing": {
    "units": 1,
    "unit_price_usd": 0.05,
    "total_usd": 0.05,
    "settlement": "x402"
  },
  "governance": {
    "policy_pack": "default-compliance-v1",
    "evidence_issued": true,
    "ledger_anchor": "gnom_tx_f8c10be928a..."
  }
}`
    },
    x402: {
      title: "x402 Micropayment & Settle Specs",
      description: "Specifies real-time settlement mechanics mapping capabilities to actual microtransaction values in USD, anchoring every event to Gnomledger.",
      json: `{
  "ledger_name": "Gnomledger",
  "currency": "USD",
  "micropayment_rules": {
    "risk_score": {
      "base_fee": 0.002,
      "payment_class": "instant_micro_settlement"
    },
    "architecture_validate": {
      "base_fee": 0.01,
      "payment_class": "instant_micro_settlement"
    },
    "policy_enforce": {
      "base_fee": 0.05,
      "payment_class": "standard_governed_settlement"
    },
    "audit_full": {
      "base_fee": 0.10,
      "payment_class": "standard_governed_settlement"
    }
  },
  "traceability": {
    "cryptographic_proof": "SHA-256 state hashing",
    "governance_compliance": "Level 4 Autonomous Compliance"
  }
}`
    },
    mtp: {
      title: "Machine Trail Protocol (MTP) Spec (v1.0)",
      description: "The universal, game-changing machine trail standard. Forces cloning autonomous agents, container builders, and scrapers to leave cryptographically signed telemetry breadcrumbs explaining WHO, WHAT, WHY, WHEN, and WHERE.",
      json: `{
  "$schema": "https://veklom.com/schemas/mtp-v1.json",
  "protocol": "Machine Trail Protocol (MTP)",
  "version": "1.0.0",
  "breadcrumbs": {
    "required": true,
    "payload_fields": {
      "who": {
        "identity_type": "autonomous_agent | ephemeral_ci_runner | security_scanner",
        "client_fingerprint": "SHA-256 hash of hardware, network, and runtime characteristics"
      },
      "what": {
        "accessed_resource": "e.g. /system_map.md or specific file paths",
        "action_type": "clone | checkout | fetch | inspect"
      },
      "why": {
        "intent_classification": "workspace_hydration | compilation_dry_run | policy_evaluation",
        "target_motive": "e.g. system layout understanding"
      },
      "when": {
        "timestamp": "ISO-8601 UTC",
        "trigger_frequency": "on_demand | automated_cron | repository_webhook"
      },
      "where": {
        "origin_channel": "GitHub Actions | Vercel Build | Coolify Server | Local Dev",
        "referring_node": "Referrer URL or platform metadata"
      }
    }
  },
  "cryptographic_assurance": {
    "signature_algorithm": "ECDSA-secp256k1",
    "anchored_ledger": "Gnomledger v2"
  }
}`
    }
  };

  const currentSpec = specs[activeTab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="specs-viewer-root">
      
      {/* Left sidebar select tabs */}
      <div className="space-y-2 lg:col-span-1">
        <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider mb-3">
          Protocol Modules
        </h3>
        {Object.entries(specs).map(([key, spec]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as any);
              setCopied(false);
            }}
            className={`w-full p-3.5 rounded-xl text-left font-mono transition-all border flex flex-col gap-1 ${
              activeTab === key
                ? 'bg-slate-900/80 border-slate-700/80 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <span className="text-xs font-bold font-mono">
              {key === 'discovery' ? '📄 Discovery v2.0' :
               key === 'identity' ? '🔑 Passport VII' :
               key === 'metering' ? '📏 Metering VRM' :
               key === 'x402' ? '💎 Settle x402' : '📡 Trail MTP'}
            </span>
            <span className="text-[10px] text-slate-500 leading-normal truncate max-w-full">
              {spec.title}
            </span>
          </button>
        ))}
      </div>

      {/* Right JSON spec display area */}
      <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white font-mono flex items-center gap-1.5">
                <BookOpen size={14} className="text-cyan-400" />
                {currentSpec.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl mt-1">
                {currentSpec.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(currentSpec.json)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-xs font-mono transition"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    COPIED
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    COPY SCHEMA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-cyan-400/90 overflow-x-auto whitespace-pre h-[380px] scrollbar-thin">
          {currentSpec.json}
        </div>

        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Standards Compliance: RFC 2119 / x402 Protocol</span>
          <span>Security Class: Ledger Governed</span>
        </div>
      </div>

    </div>
  );
})
