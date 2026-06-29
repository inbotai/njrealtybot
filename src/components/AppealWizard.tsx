"use client";

import { useState, useRef, useEffect } from "react";
import LeadGate from "@/components/LeadGate";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

const DISCLAIMER = "Garden State AI is not a law firm, attorney, tax advisor, or licensed appraiser. This tool helps you organize information for your property tax appeal. You are solely responsible for verifying all information before filing. We strongly recommend reviewing your completed form with a licensed NJ property tax attorney before submission.";

const APPEAL_REASONS = [
  "Assessment exceeds true market value",
  "Assessment is not in line with comparable properties",
  "Property condition issues (damage, deterioration)",
  "Recent sale price was lower than assessment",
  "Incorrect property classification",
  "Incorrect property data (lot size, sqft, bedrooms)",
  "Other (specify below)",
];

const PROPERTY_CLASSES = [
  { value: "2", label: "Class 2 — Residential (1-4 family)" },
  { value: "3A", label: "Class 3A — Farm (regular)" },
  { value: "3B", label: "Class 3B — Farm (qualified)" },
  { value: "4A", label: "Class 4A — Commercial" },
  { value: "4B", label: "Class 4B — Industrial" },
  { value: "4C", label: "Class 4C — Apartments (5+ units)" },
];

const NJ_COUNTIES = [
  "Atlantic", "Bergen", "Burlington", "Camden", "Cape May", "Cumberland",
  "Essex", "Gloucester", "Hudson", "Hunterdon", "Mercer", "Middlesex",
  "Monmouth", "Morris", "Ocean", "Passaic", "Salem", "Somerset",
  "Sussex", "Union", "Warren",
];

interface FormData {
  // Step 1: Owner & Property
  ownerName: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  ownerPhone: string;
  ownerEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyCounty: string;
  propertyZip: string;
  block: string;
  lot: string;
  qualifier: string;
  taxYear: string;
  // Step 2: Assessment
  assessedTotal: string;
  assessedLand: string;
  assessedImprovement: string;
  currentTaxes: string;
  propertyClass: string;
  // Step 3: Appeal basis
  claimedValue: string;
  appealReasons: string[];
  appealNarrative: string;
  // Step 4: Comparables
  useGSAIComps: boolean;
  comps: { address: string; salePrice: string; saleDate: string; beds: string; baths: string; sqft: string }[];
  // Step 5: Evidence
  evidenceFiles: File[];
}

const EMPTY_COMP = { address: "", salePrice: "", saleDate: "", beds: "", baths: "", sqft: "" };

const initialForm: FormData = {
  ownerName: "", ownerAddress: "", ownerCity: "", ownerState: "NJ", ownerZip: "",
  ownerPhone: "", ownerEmail: "",
  propertyAddress: "", propertyCity: "", propertyCounty: "", propertyZip: "",
  block: "", lot: "", qualifier: "", taxYear: new Date().getFullYear().toString(),
  assessedTotal: "", assessedLand: "", assessedImprovement: "", currentTaxes: "", propertyClass: "2",
  claimedValue: "", appealReasons: [], appealNarrative: "",
  useGSAIComps: false,
  comps: [{ ...EMPTY_COMP }, { ...EMPTY_COMP }, { ...EMPTY_COMP }],
  evidenceFiles: [],
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i + 1 === current ? "bg-gold text-navy" :
            i + 1 < current ? "bg-emerald-500 text-white" :
            "bg-gray-700 text-gray-400"
          }`}>
            {i + 1 < current ? "\u2713" : i + 1}
          </div>
          {i < total - 1 && <div className={`w-8 h-0.5 ${i + 1 < current ? "bg-emerald-500" : "bg-gray-700"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function AppealWizard() {
  const [step, setStep] = useState(0); // 0 = landing, 1-5 = form steps, 6 = review, 7 = done
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [loadingComps, setLoadingComps] = useState(false);
  const [generating, setGenerating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-fill from Tax Shock analysis if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("gsai_tax_analysis");
      if (!raw) return;
      const data = JSON.parse(raw);
      sessionStorage.removeItem("gsai_tax_analysis"); // consume once

      setForm(prev => {
        const updated = { ...prev };

        // Property info
        if (data.address) updated.propertyAddress = data.address.replace(/,.*$/, "").trim();
        if (data.city) updated.propertyCity = data.city;
        if (data.county) updated.propertyCounty = data.county;

        // Block/Lot
        if (data.block) updated.block = data.block;
        if (data.lot) updated.lot = data.lot;
        if (data.qualifier) updated.qualifier = data.qualifier;

        // Assessment
        if (data.assessedValue) updated.assessedTotal = data.assessedValue.toString();
        if (data.taxAnnual) updated.currentTaxes = data.taxAnnual.toFixed(2);
        if (data.landAssessment) updated.assessedLand = data.landAssessment.toString();
        if (data.improvementAssessment) updated.assessedImprovement = data.improvementAssessment.toString();

        // Claimed value = conservative estimate or mid market value
        if (data.conservativeEstimate) {
          updated.claimedValue = Math.round(data.conservativeEstimate).toString();
        } else if (data.estimatedMarketValueMid) {
          updated.claimedValue = Math.round(data.estimatedMarketValueMid).toString();
        }

        // Pre-select appeal reasons
        updated.appealReasons = ["Assessment exceeds true market value", "Assessment is not in line with comparable properties"];

        // Build narrative from Chapter 123 analysis
        const parts: string[] = [];
        if (data.chapter123Result === "over_assessed" && data.eqRatio) {
          parts.push(`Under NJ Chapter 123, the county equalization ratio is ${(data.eqRatio * 100).toFixed(2)}%. Based on ${data.comparables?.length || 0} comparable sales, the estimated market value is $${Math.round(data.estimatedMarketValueMid || 0).toLocaleString()}, placing the current assessment above the Common Level Range upper bound.`);
        }
        if (data.caseStrengthExplanation) {
          parts.push(data.caseStrengthExplanation);
        }
        if (parts.length) updated.appealNarrative = parts.join("\n\n");

        // Comparables
        if (data.comparables?.length) {
          updated.comps = data.comparables.slice(0, 6).map((c: any) => ({
            address: c.address || "",
            salePrice: c.salePrice || "",
            saleDate: c.saleDate || "",
            beds: c.beds || "",
            baths: c.baths || "",
            sqft: c.sqft || "",
          }));
          updated.useGSAIComps = true;
        }

        return updated;
      });

      // Skip the landing page, go straight to step 1
      setStep(1);
    } catch { /* ignore parse errors */ }
  }, []);

  function update(field: keyof FormData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateComp(idx: number, field: string, value: string) {
    setForm(prev => {
      const comps = [...prev.comps];
      comps[idx] = { ...comps[idx], [field]: value };
      return { ...prev, comps };
    });
  }

  function toggleReason(reason: string) {
    setForm(prev => ({
      ...prev,
      appealReasons: prev.appealReasons.includes(reason)
        ? prev.appealReasons.filter(r => r !== reason)
        : [...prev.appealReasons, reason],
    }));
  }

  function next() {
    setStep(s => s + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function back() {
    setStep(s => s - 1);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadGSAIComps() {
    if (!form.propertyAddress || !form.propertyCity) return;
    setLoadingComps(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/tax-appeal/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: `${form.propertyAddress}, ${form.propertyCity}` }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comparables?.length) {
          const loaded = data.comparables.slice(0, 6).map((c: any) => ({
            address: c.address || "", salePrice: c.salePrice?.toString() || "",
            saleDate: c.saleDate || "", beds: c.bedrooms?.toString() || "",
            baths: c.bathrooms?.toString() || "", sqft: c.livingAreaSqft?.toString() || "",
          }));
          update("comps", loaded);
          update("useGSAIComps", true);
          // Auto-fill assessment if empty
          if (!form.assessedTotal && data.assessedValue) {
            update("assessedTotal", data.assessedValue.toString());
            update("assessedLand", data.landAssessment?.toString() || "");
            update("assessedImprovement", data.improvementAssessment?.toString() || "");
            update("currentTaxes", data.taxAnnual?.toFixed(2) || "");
            if (data.county) update("propertyCounty", data.county);
          }
        }
      }
    } catch { /* best effort */ }
    setLoadingComps(false);
  }

  async function generatePDF() {
    setGenerating(true);
    try {
      const { generateAppealPDF } = await import("./AppealPDF");
      await generateAppealPDF(form);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
    // Register as lead in admin dashboard
    try {
      await fetch(`${IDX_API}/api/idx/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.ownerName || "Tax Appeal User",
          phone: form.ownerPhone || undefined,
          email: form.ownerEmail || undefined,
          lead_type: "info_request",
          source: "tax_appeal_wizard",
          message: `Tax appeal PDF generated for ${form.propertyAddress}, ${form.propertyCity}. Block ${form.block}, Lot ${form.lot}. Assessment: $${form.assessedTotal}, Claimed: $${form.claimedValue}. ${form.comps.filter(c => c.address).length} comps attached.`,
        }),
      });
    } catch { /* non-blocking */ }
    setGenerating(false);
    setStep(7);
  }

  const inputCls = "w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-gold transition text-sm";
  const labelCls = "block text-sm text-gray-400 mb-1";
  const btnPrimary = "rounded-xl bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400 transition disabled:opacity-40";
  const btnSecondary = "rounded-xl border border-white/20 px-8 py-3 text-gray-300 hover:text-white hover:border-white/40 transition";

  // ── Landing ──────────────────────────────────────────────
  if (step === 0) {
    return (
      <>
        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy">
              NJ Property Tax<br /><span className="text-gold">Appeal Assistant</span>
            </h1>
            <p className="mt-5 text-lg text-gray-500">
              Prepare your Form A-1 petition with comparable sales data.
              <br />Generate a professional document ready to print and file.
            </p>
            <button onClick={() => setStep(1)} className={`mt-8 ${btnPrimary} text-lg px-12 py-4`}>
              Prepare My Tax Appeal
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Takes about 10 minutes. Free. No account needed.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-navy">How It Works</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-5">
              {[
                { n: "1", t: "Your Info", d: "Owner name, property address, Block/Lot" },
                { n: "2", t: "Assessment", d: "Current assessed value and taxes" },
                { n: "3", t: "Your Case", d: "Why you believe the assessment is wrong" },
                { n: "4", t: "Comparables", d: "Recent sales that support your value" },
                { n: "5", t: "Evidence", d: "Photos of conditions, damage, etc." },
              ].map(s => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold font-bold">{s.n}</div>
                  <h3 className="mt-2 font-semibold text-navy text-sm">{s.t}</h3>
                  <p className="mt-1 text-xs text-gray-500">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-gray-50 py-8">
          <div className="mx-auto max-w-3xl px-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-bold text-amber-800 text-sm">Important Legal Notice</h3>
              <p className="mt-2 text-sm text-amber-700">{DISCLAIMER}</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Done ─────────────────────────────────────────────────
  if (step === 7) {
    const countyBoardLinks: Record<string, string> = {
      BERGEN: "https://www.co.bergen.nj.us/tax-board",
      HUDSON: "https://www.hudsoncountynj.org/tax-board",
      ESSEX: "https://www.essexcountynj.org/government/tax-board",
      PASSAIC: "https://www.passaiccountynj.org/government/boards_and_commissions/board_of_taxation.php",
      SUSSEX: "https://www.sussex.nj.us/cn/webpage/1376",
      MORRIS: "https://morriscountynj.gov/departments/board-of-taxation",
      UNION: "https://ucnj.org/board-of-taxation",
      MIDDLESEX: "https://www.middlesexcountynj.gov/government/departments/department-of-finance/board-of-taxation",
      MONMOUTH: "https://www.co.monmouth.nj.us/page.aspx?ID=2516",
      OCEAN: "https://www.co.ocean.nj.us/OC/TaxBoard",
    };
    const countyUpper = (form.propertyCounty || "").toUpperCase();
    const boardLink = countyBoardLinks[countyUpper] || `https://www.google.com/search?q=${encodeURIComponent(`${form.propertyCounty} county NJ board of taxation filing`)}`;

    return (
      <section className="bg-white min-h-[80vh] py-12">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{"\u2705"}</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy">Your Appeal Package Is Ready!</h1>
            <p className="mt-3 text-lg text-gray-500">Your Form A-1 PDF has been downloaded. Here&apos;s exactly what to do next.</p>
          </div>

          {/* Step-by-step timeline */}
          <div className="mt-10 space-y-0">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold text-navy font-bold flex items-center justify-center text-lg">1</div>
                <div className="w-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gold text-lg">Print Your Form A-1</h3>
                <p className="text-gray-600 mt-1">Open the downloaded PDF and print <strong>3 copies</strong>: one for the County Board, one for your municipality, and one for your records.</p>
                <button onClick={generatePDF} className="mt-3 text-sm text-gold underline hover:text-yellow-500">Download PDF again</button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold text-navy font-bold flex items-center justify-center text-lg">2</div>
                <div className="w-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gold text-lg">Review Before Filing</h3>
                <p className="text-gray-600 mt-1">Double-check all information on the form. We <strong>strongly recommend</strong> having a licensed NJ tax attorney review it before you file.</p>
                <p className="text-gray-500 text-sm mt-2">Need an attorney referral? Message us on WhatsApp and we&apos;ll connect you with a tax appeal specialist in {form.propertyCounty || "your"} County.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold text-navy font-bold flex items-center justify-center text-lg">3</div>
                <div className="w-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gold text-lg">File with Your County Board</h3>
                <p className="text-gray-600 mt-1">Submit your petition to the <strong>{form.propertyCounty || "County"} County Board of Taxation</strong>. You can file in person or by mail.</p>
                <a href={boardLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-navy hover:bg-gray-200 transition">
                  {"\uD83C\uDFDB\uFE0F"} {form.propertyCounty || "County"} County Board of Taxation Website {"\u2192"}
                </a>
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-red-700 text-sm font-semibold">{"\u23F0"} Deadline: April 1, {new Date().getFullYear() + (new Date().getMonth() >= 3 ? 1 : 0)}</p>
                  <p className="text-red-500 text-xs mt-1">Late filings are NOT accepted. File early to avoid missing the deadline.</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold text-navy font-bold flex items-center justify-center text-lg">4</div>
                <div className="w-0.5 flex-1 bg-gray-200" />
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gold text-lg">Attend Your Hearing</h3>
                <p className="text-gray-600 mt-1">The County Board will schedule a hearing (typically 1-3 months after filing). You&apos;ll present your case with your comparable sales evidence.</p>
                <p className="text-gray-500 text-sm mt-2"><strong>Tip:</strong> Bring printouts of the comparable sales from your PDF. The Board wants to see recent sold prices of similar homes near yours.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-lg">5</div>
              </div>
              <div className="pb-4">
                <h3 className="font-bold text-emerald-600 text-lg">Get Your Decision</h3>
                <p className="text-gray-600 mt-1">The Board will issue a judgment. If approved, your assessment will be reduced and you&apos;ll see lower taxes on your next bill.</p>
                <p className="text-gray-500 text-sm mt-2">If denied, you can appeal to the NJ Tax Court within 45 days of the decision.</p>
              </div>
            </div>
          </div>

          {/* CTA: Get help */}
          <div className="mt-8 rounded-xl bg-indigo-50 border border-indigo-200 p-6 text-center">
            <h3 className="font-bold text-lg text-navy">Need Help With Your Appeal?</h3>
            <p className="text-gray-600 mt-2 text-sm">Our team can connect you with experienced NJ tax appeal attorneys and guide you through the process.</p>
            <a href="https://wa.me/12015281095?text=I%20need%20help%20with%20my%20property%20tax%20appeal" target="_blank" rel="noopener noreferrer" className={`inline-block mt-4 ${btnPrimary}`}>
              {"\uD83D\uDCF1"} Chat With Us on WhatsApp
            </a>
            <p className="text-gray-500 text-xs mt-2">or text (201) 528-1095</p>
          </div>

          <LeadGate
            valueProp="Get Appeal Updates + Attorney Referral"
            source="tax_appeal_wizard"
            message={`Tax appeal for ${form.propertyAddress}, ${form.propertyCity} — claimed value $${form.claimedValue}`}
            resultsText={[
              `\uD83D\uDCCB *Tax Appeal Summary — ${form.propertyAddress}, ${form.propertyCity}*`,
              ``,
              `County: ${form.propertyCounty || "N/A"}`,
              `Current Assessment: $${parseInt(form.assessedTotal || "0").toLocaleString()}`,
              `Your Claimed Value: $${parseInt(form.claimedValue || "0").toLocaleString()}`,
              `Reasons: ${form.appealReasons.join(", ") || "N/A"}`,
              `Comparables: ${form.comps.filter(c => c.address).length} sales attached`,
              ``,
              `Your Form A-1 PDF has been generated.`,
              `File before April 1 with your County Board of Taxation.`,
              ``,
              `Full analysis: gardenstate.ai/tax-shock`,
              `\u2014 Garden State AI`,
            ].join("\n")}
          />

          {/* Other actions */}
          <div className="mt-6 flex gap-3 justify-center">
            <a href="/tax-shock" className={btnSecondary}>Run Another Analysis</a>
          </div>

          <div className="mt-8 rounded-xl bg-amber-900/20 border border-amber-500/30 p-5 text-center">
            <p className="text-amber-300 font-bold text-sm mb-2">{"\u26A0\uFE0F"} Important Legal Disclaimer</p>
            <p className="text-gray-300 text-sm leading-relaxed">{DISCLAIMER}</p>
          </div>
        </div>
      </section>
    );
  }

  // ── Form Steps ───────────────────────────────────────────
  return (
    <section ref={formRef} className="bg-[#0a0f1a] min-h-screen text-white py-12">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center text-xl font-bold mb-2">NJ Property Tax Appeal Assistant</h2>
        <StepIndicator current={step} total={step <= 5 ? 5 : 5} />

        {/* Step 1: Owner & Property */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Step 1: Property Owner Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.ownerName} onChange={e => update("ownerName", e.target.value)} placeholder="John Doe" /></div>
              <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.ownerPhone} onChange={e => update("ownerPhone", e.target.value)} placeholder="(201) 555-0123" /></div>
            </div>
            <div><label className={labelCls}>Mailing Address</label><input className={inputCls} value={form.ownerAddress} onChange={e => update("ownerAddress", e.target.value)} placeholder="123 Main St" /></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className={labelCls}>City</label><input className={inputCls} value={form.ownerCity} onChange={e => update("ownerCity", e.target.value)} /></div>
              <div><label className={labelCls}>State</label><input className={inputCls} value={form.ownerState} onChange={e => update("ownerState", e.target.value)} /></div>
              <div><label className={labelCls}>Zip</label><input className={inputCls} value={form.ownerZip} onChange={e => update("ownerZip", e.target.value)} /></div>
            </div>

            <hr className="border-white/10" />
            <h3 className="text-lg font-bold text-gold">Property Being Appealed</h3>

            <div><label className={labelCls}>Property Address *</label><input className={inputCls} value={form.propertyAddress} onChange={e => update("propertyAddress", e.target.value)} placeholder="70 Oak St" /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelCls}>City/Municipality *</label><input className={inputCls} value={form.propertyCity} onChange={e => update("propertyCity", e.target.value)} placeholder="Closter" /></div>
              <div>
                <label className={labelCls}>County *</label>
                <select className={inputCls} value={form.propertyCounty} onChange={e => update("propertyCounty", e.target.value)}>
                  <option value="">Select county...</option>
                  {NJ_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div><label className={labelCls}>Block *</label><input className={inputCls} value={form.block} onChange={e => update("block", e.target.value)} /></div>
              <div><label className={labelCls}>Lot *</label><input className={inputCls} value={form.lot} onChange={e => update("lot", e.target.value)} /></div>
              <div><label className={labelCls}>Qualifier</label><input className={inputCls} value={form.qualifier} onChange={e => update("qualifier", e.target.value)} placeholder="Optional" /></div>
              <div><label className={labelCls}>Tax Year</label><input className={inputCls} value={form.taxYear} onChange={e => update("taxYear", e.target.value)} /></div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={next} disabled={!form.ownerName || !form.propertyAddress || !form.propertyCity} className={btnPrimary}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Assessment */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Step 2: Current Assessment</h3>
            <p className="text-sm text-gray-400">Enter the values from your tax bill or assessment notice.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelCls}>Total Assessed Value *</label><input className={inputCls} type="number" value={form.assessedTotal} onChange={e => update("assessedTotal", e.target.value)} placeholder="300000" /></div>
              <div><label className={labelCls}>Annual Property Taxes</label><input className={inputCls} type="number" step="0.01" value={form.currentTaxes} onChange={e => update("currentTaxes", e.target.value)} placeholder="12500.00" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelCls}>Land Assessment</label><input className={inputCls} type="number" value={form.assessedLand} onChange={e => update("assessedLand", e.target.value)} placeholder="95000" /></div>
              <div><label className={labelCls}>Improvement Assessment</label><input className={inputCls} type="number" value={form.assessedImprovement} onChange={e => update("assessedImprovement", e.target.value)} placeholder="205000" /></div>
            </div>
            <div>
              <label className={labelCls}>Property Classification</label>
              <select className={inputCls} value={form.propertyClass} onChange={e => update("propertyClass", e.target.value)}>
                {PROPERTY_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {form.propertyClass !== "2" && (
              <div className="rounded-xl bg-amber-900/30 border border-amber-500/30 p-4 text-sm text-amber-300">
                <strong>&#x26A0; Note:</strong> Non-residential properties (Class 4A, 4B, 4C) with taxes over $25,000 require a licensed attorney to file the appeal. This tool can help you organize your information to bring to your attorney.
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={back} className={btnSecondary}>Back</button>
              <button onClick={next} disabled={!form.assessedTotal} className={btnPrimary}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Appeal Basis */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Step 3: Basis for Appeal</h3>
            <p className="text-sm text-gray-400">What value do you believe is correct, and why?</p>

            <div>
              <label className={labelCls}>Your Claimed Market Value *</label>
              <input className={inputCls} type="number" value={form.claimedValue} onChange={e => update("claimedValue", e.target.value)} placeholder="250000" />
              <p className="text-xs text-gray-500 mt-1">This is the value you believe your property is actually worth.</p>
            </div>

            <div>
              <label className={labelCls}>Reason(s) for Appeal (select all that apply) *</label>
              <div className="space-y-2 mt-2">
                {APPEAL_REASONS.map(r => (
                  <label key={r} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.appealReasons.includes(r)} onChange={() => toggleReason(r)}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-white/10 text-gold focus:ring-gold" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Additional Details (optional)</label>
              <textarea className={`${inputCls} min-h-[100px]`} value={form.appealNarrative} onChange={e => update("appealNarrative", e.target.value)}
                placeholder="Describe any additional factors: property damage, market conditions in your area, incorrect property records, etc." />
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={back} className={btnSecondary}>Back</button>
              <button onClick={next} disabled={!form.claimedValue || form.appealReasons.length === 0} className={btnPrimary}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Comparables */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Step 4: Comparable Sales</h3>
            <p className="text-sm text-gray-400">Recent sales of similar properties strengthen your appeal.</p>

            {/* Auto-load button */}
            <button onClick={loadGSAIComps} disabled={loadingComps || !form.propertyAddress}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-bold text-white hover:from-indigo-500 hover:to-purple-500 transition disabled:opacity-40"
            >
              {loadingComps ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading comparables...
                </span>
              ) : form.useGSAIComps ? (
                "\u2705 Comparables Loaded from Garden State AI"
              ) : (
                "\uD83D\uDD0D Use My Comparables from Garden State AI"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">Or enter your own comparable sales below</p>

            {/* Comp entries */}
            {form.comps.map((comp, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-300">Comparable {i + 1}</p>
                  {form.comps.length > 1 && (
                    <button onClick={() => update("comps", form.comps.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  )}
                </div>
                <input className={inputCls} value={comp.address} onChange={e => updateComp(i, "address", e.target.value)} placeholder="Address" />
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                  <input className={inputCls} type="number" value={comp.salePrice} onChange={e => updateComp(i, "salePrice", e.target.value)} placeholder="Sale Price" />
                  <input className={inputCls} type="date" value={comp.saleDate} onChange={e => updateComp(i, "saleDate", e.target.value)} />
                  <input className={inputCls} value={comp.beds} onChange={e => updateComp(i, "beds", e.target.value)} placeholder="Beds" />
                  <input className={inputCls} value={comp.baths} onChange={e => updateComp(i, "baths", e.target.value)} placeholder="Baths" />
                  <input className={inputCls} value={comp.sqft} onChange={e => updateComp(i, "sqft", e.target.value)} placeholder="Sqft" />
                </div>
              </div>
            ))}

            {form.comps.length < 6 && (
              <button onClick={() => update("comps", [...form.comps, { ...EMPTY_COMP }])}
                className="w-full rounded-lg border border-dashed border-white/20 py-3 text-sm text-gray-400 hover:text-white hover:border-white/40 transition">
                + Add Another Comparable
              </button>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={back} className={btnSecondary}>Back</button>
              <button onClick={next} className={btnPrimary}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 5: Evidence */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Step 5: Supporting Evidence (Optional)</h3>
            <p className="text-sm text-gray-400">Photos of property condition, damage, or issues can strengthen your appeal. You can also add these when you file.</p>

            <label className="block w-full rounded-xl border-2 border-dashed border-white/20 p-8 text-center cursor-pointer hover:border-gold/50 transition">
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={e => update("evidenceFiles", [...form.evidenceFiles, ...Array.from(e.target.files || [])])} />
              <p className="text-gray-400">&#x1F4F7; Click to upload photos</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG accepted</p>
            </label>

            {form.evidenceFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {form.evidenceFiles.map((f, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden bg-white/5 aspect-square flex items-center justify-center">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => update("evidenceFiles", form.evidenceFiles.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">&#x2715;</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={back} className={btnSecondary}>Back</button>
              <button onClick={next} className={btnPrimary}>Review My Appeal</button>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gold">Review Your Appeal</h3>
            <p className="text-sm text-gray-400">Please verify all information before generating your Form A-1.</p>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Owner</p>
                <p className="text-white font-semibold">{form.ownerName}</p>
                <p className="text-gray-400">{form.ownerAddress}, {form.ownerCity} {form.ownerState} {form.ownerZip}</p>
              </div>
              <hr className="border-white/10" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Property</p>
                <p className="text-white font-semibold">{form.propertyAddress}, {form.propertyCity}, NJ {form.propertyZip}</p>
                <p className="text-gray-400">Block {form.block}, Lot {form.lot}{form.qualifier ? `, Qual ${form.qualifier}` : ""} | {form.propertyCounty} County | Tax Year {form.taxYear}</p>
              </div>
              <hr className="border-white/10" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Current Assessment</p>
                  <p className="text-white font-bold">${parseInt(form.assessedTotal || "0").toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Your Claimed Value</p>
                  <p className="text-emerald-400 font-bold">${parseInt(form.claimedValue || "0").toLocaleString()}</p>
                </div>
              </div>
              <hr className="border-white/10" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Reasons</p>
                <ul className="list-disc list-inside text-gray-300 mt-1">
                  {form.appealReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <hr className="border-white/10" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Comparables ({form.comps.filter(c => c.address).length})</p>
                {form.comps.filter(c => c.address).map((c, i) => (
                  <p key={i} className="text-gray-300">{c.address} — ${parseInt(c.salePrice || "0").toLocaleString()} ({c.beds}bd/{c.baths}ba)</p>
                ))}
              </div>
              {form.evidenceFiles.length > 0 && (
                <>
                  <hr className="border-white/10" />
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Evidence: {form.evidenceFiles.length} photo(s) attached</p>
                </>
              )}
            </div>

            {/* Disclaimer before generate */}
            <div className="rounded-xl bg-amber-900/20 border border-amber-500/30 p-4 text-xs text-amber-300">
              <p className="font-bold mb-1">&#x26A0; Before You Generate</p>
              <p>{DISCLAIMER}</p>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={back} className={btnSecondary}>Edit</button>
              <button onClick={generatePDF} disabled={generating} className={`${btnPrimary} text-lg`}>
                {generating ? "Generating PDF..." : "Generate Form A-1 PDF"}
              </button>
            </div>
          </div>
        )}

        {/* Persistent disclaimer */}
        {step >= 1 && step <= 6 && (
          <p className="mt-8 text-[10px] text-gray-600 text-center">{DISCLAIMER}</p>
        )}
      </div>
    </section>
  );
}
