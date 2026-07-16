/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MachineIdentity {
  installation_id: string;
  deployment_id: string;
  workspace_id: string;
  repository: string;
  version: string;
  environment: string;
  token?: string;
  origin: {
    hostname: string;
    ip_hash: string;
    agent: string;
  };
  license: {
    status: 'active' | 'expired' | 'invalid' | 'none';
    tier: 'free' | 'developer' | 'fleet' | 'enterprise';
  };
  first_seen: string;
  last_seen: string;
}

export interface Capability {
  id: string;
  name: string;
  price_usd: number;
  category: 'analysis' | 'governance' | 'audit';
  description: string;
  rate_limit_per_minute: number;
}

export interface MeteringEvent {
  event_id: string;
  execution_id: string;
  installation_id: string;
  workspace_id: string;
  capability: string;
  timestamp: string;
  inputs_hash: string;
  outputs_hash: string;
  billing: {
    units: number;
    unit_price_usd: number;
    total_usd: number;
    settlement: 'x402';
  };
  governance: {
    policy_pack: string;
    evidence_issued: boolean;
    ledger_anchor: string;
  };
}

export interface TelemetryLog {
  id: string;
  type: 'identity.registered' | 'metering.recorded' | 'gateway.request' | 'gateway.error' | 'settlement.daily';
  timestamp: string;
  payload: any;
}

export interface CloneAttributionRecord {
  date: string;
  clones: number;
  known: number;
  unknown: number;
  unknown_ratio: number;
}
