/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capability, CloneAttributionRecord } from './types';

export const CAPABILITIES: Capability[] = [
  {
    id: "risk_score",
    name: "Repo Risk Score",
    price_usd: 0.002,
    category: "analysis",
    description: "Scores a repository, dependency graph, or workspace for structural & dependency risk.",
    rate_limit_per_minute: 600
  },
  {
    id: "architecture_validate",
    name: "Architecture Validation",
    price_usd: 0.01,
    category: "governance",
    description: "Validates code structure, modular imports, and architecture rules against Veklom standards.",
    rate_limit_per_minute: 300
  },
  {
    id: "policy_enforce",
    name: "Policy Enforcement",
    price_usd: 0.05,
    category: "governance",
    description: "Enforces custom compliance & security policy packs on capabilities and autonomous agents.",
    rate_limit_per_minute: 120
  },
  {
    id: "audit_full",
    name: "Full Audit",
    price_usd: 0.10,
    category: "audit",
    description: "Performs an immutable architectural audit, issues signed evidence, and anchors to the ledger.",
    rate_limit_per_minute: 60
  }
];

// 14 days of realistic clone telemetry
export const CLONE_HISTORY: { date: string; clones: number; uniqueCloners: number; repo: string }[] = [
  { date: "07/02", clones: 450, uniqueCloners: 48, repo: "veklom-frontend" },
  { date: "07/03", clones: 720, uniqueCloners: 72, repo: "veklom-frontend" },
  { date: "07/04", clones: 610, uniqueCloners: 55, repo: "veklom-frontend" },
  { date: "07/05", clones: 950, uniqueCloners: 110, repo: "veklom-frontend" },
  { date: "07/06", clones: 680, uniqueCloners: 85, repo: "veklom-frontend" },
  { date: "07/07", clones: 250, uniqueCloners: 35, repo: "veklom-frontend" },
  { date: "07/08", clones: 580, uniqueCloners: 62, repo: "veklom-frontend" },
  { date: "07/09", clones: 1620, uniqueCloners: 125, repo: "veklom-frontend" },
  { date: "07/10", clones: 1450, uniqueCloners: 98, repo: "veklom-frontend" },
  { date: "07/11", clones: 3400, uniqueCloners: 75, repo: "veklom-frontend" },
  { date: "07/12", clones: 4200, uniqueCloners: 82, repo: "veklom-frontend" },
  { date: "07/13", clones: 3950, uniqueCloners: 66, repo: "veklom-frontend" },
  { date: "07/14", clones: 3800, uniqueCloners: 122, repo: "veklom-frontend" },
  { date: "07/15", clones: 4183, uniqueCloners: 130, repo: "veklom-frontend" },
  
  { date: "07/02", clones: 150, uniqueCloners: 55, repo: "veklom-byos-backend" },
  { date: "07/03", clones: 210, uniqueCloners: 62, repo: "veklom-byos-backend" },
  { date: "07/04", clones: 180, uniqueCloners: 51, repo: "veklom-byos-backend" },
  { date: "07/05", clones: 350, uniqueCloners: 85, repo: "veklom-byos-backend" },
  { date: "07/06", clones: 280, uniqueCloners: 72, repo: "veklom-byos-backend" },
  { date: "07/07", clones: 140, uniqueCloners: 44, repo: "veklom-byos-backend" },
  { date: "07/08", clones: 310, uniqueCloners: 59, repo: "veklom-byos-backend" },
  { date: "07/09", clones: 480, uniqueCloners: 98, repo: "veklom-byos-backend" },
  { date: "07/10", clones: 520, uniqueCloners: 104, repo: "veklom-byos-backend" },
  { date: "07/11", clones: 610, uniqueCloners: 112, repo: "veklom-byos-backend" },
  { date: "07/12", clones: 750, uniqueCloners: 135, repo: "veklom-byos-backend" },
  { date: "07/13", clones: 820, uniqueCloners: 142, repo: "veklom-byos-backend" },
  { date: "07/14", clones: 910, uniqueCloners: 150, repo: "veklom-byos-backend" },
  { date: "07/15", clones: 921, uniqueCloners: 155, repo: "veklom-byos-backend" }
];

// Historical attribution records showing what we can reconstruct
export const CLONE_ATTRIBUTION: CloneAttributionRecord[] = [
  { date: "07/09", clones: 2100, known: 820, unknown: 1280, unknown_ratio: 0.609 },
  { date: "07/10", clones: 1970, known: 780, unknown: 1190, unknown_ratio: 0.604 },
  { date: "07/11", clones: 4010, known: 910, unknown: 3100, unknown_ratio: 0.773 },
  { date: "07/12", clones: 4950, known: 1120, unknown: 3830, unknown_ratio: 0.773 },
  { date: "07/13", clones: 4770, known: 1050, unknown: 3720, unknown_ratio: 0.779 },
  { date: "07/14", clones: 4710, known: 1180, unknown: 3530, unknown_ratio: 0.749 },
  { date: "07/15", clones: 5104, known: 1250, unknown: 3854, unknown_ratio: 0.755 }
];
