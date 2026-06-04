/**
 * ServiceLadder — a reusable 4-stage funnel abstraction.
 *
 * Stage 1: Diagnose  (free, instant analysis)
 * Stage 2: Equip     (paid deliverable the user acts on themselves)
 * Stage 3: Connect   (referral to a vetted professional)
 * Stage 4: Automate  (full automation — future)
 *
 * Each concrete service (property tax, refi, insurance, etc.) implements
 * ServiceLadderConfig with its own input/result types and logic.
 */

// ── Stage definitions ──────────────────────────────────────────

export interface DiagnoseStage<TInput, TResult> {
  /** Run the free analysis. Must be deterministic — no LLM calls. */
  analyze(input: TInput): TResult;
}

export interface EquipStage<TDiagnoseResult, TPacket> {
  /** Generate the paid deliverable from a completed diagnosis. */
  generatePacket(diagnosis: TDiagnoseResult): TPacket;
}

export interface ConnectStage<TLeadData> {
  /** Capture a lead for professional referral. */
  captureLead(lead: TLeadData): Promise<{ success: boolean; leadId?: string }>;
}

// Rung 4 is a seam only — no interface needed until implementation.
// When ready, add: AutomateStage<TInput, TResult>

// ── Ladder config ──────────────────────────────────────────────

export interface ServiceLadderConfig<
  TDiagnoseInput,
  TDiagnoseResult,
  TPacket,
  TLeadData,
> {
  /** Human-readable service name (e.g. "Property Tax Appeal") */
  name: string;
  /** URL slug for routing (e.g. "property-tax") */
  slug: string;
  diagnose: DiagnoseStage<TDiagnoseInput, TDiagnoseResult>;
  equip: EquipStage<TDiagnoseResult, TPacket>;
  connect: ConnectStage<TLeadData>;
  // automate: reserved for Rung 4
}

// ── Funnel state ───────────────────────────────────────────────

export type LadderStage = "diagnose" | "equip" | "connect" | "automate";

export interface LadderState<TDiagnoseResult> {
  stage: LadderStage;
  diagnosisResult: TDiagnoseResult | null;
  packetGenerated: boolean;
  leadCaptured: boolean;
}
