"use client";

import { useState, useEffect } from "react";

export interface ListingFormData {
  address: string;
  cisAcknowledged: boolean;
  agencyAcknowledged: boolean;
  structuralIssues: string;
  waterDamage: string;
  environmentalHazards: string;
  floodZone: string;
  leadPaint: string;
  yearBuilt: string;
  fullName: string;
  phone: string;
  email: string;
  consentCommunications: boolean;
}

export type UpdateFn = (k: keyof ListingFormData, v: string | boolean) => void;

/* ---- Shared UI primitives ---- */

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-navy">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    />
  );
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm leading-relaxed text-gray-700">{children}</span>
    </label>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <div className="mt-1 flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm transition ${
              value === opt.value
                ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---- Step 1: Property Address ---- */
export function StepAddress({ form, update }: { form: ListingFormData; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">Property Address</h2>
      <p className="mb-4 text-sm text-gray-500">
        Enter the full address of the property you want to list.
      </p>
      <Label>Street Address, City, State, ZIP</Label>
      <Input
        value={form.address}
        onChange={(v) => update("address", v)}
        placeholder="123 Main St, Wayne, NJ 07470"
      />
    </div>
  );
}

/* ---- Step 2: Consumer Information Statement ---- */
export function StepCIS({ form, update }: { form: ListingFormData; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">
        NJ Consumer Information Statement
      </h2>
      <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        <p className="mb-2 font-semibold">
          New Jersey Real Estate Commission Consumer Information Statement
          (Summary)
        </p>
        <p className="mb-2">
          Before you enter into a relationship with a real estate broker or
          salesperson, you should be aware of the following:
        </p>
        <ul className="mb-2 list-disc space-y-1 pl-5">
          <li>A seller&apos;s agent works for and owes fiduciary duties to the seller.</li>
          <li>A buyer&apos;s agent works for and owes fiduciary duties to the buyer.</li>
          <li>A disclosed dual agent works for both parties with their informed consent.</li>
          <li>A transaction broker facilitates the transaction without representing either party.</li>
        </ul>
        <p className="mb-2">
          Under NJ law (N.J.A.C. 11:5-6.1), a licensee must provide this
          statement at the first substantive contact with a consumer. You are
          entitled to receive a full copy of this document from your agent.
        </p>
        <p>
          By acknowledging below, you confirm that you have been informed of
          these agency relationships and your right to receive the full Consumer
          Information Statement.
        </p>
      </div>
      <div className="mt-4">
        <Checkbox checked={form.cisAcknowledged} onChange={(v) => update("cisAcknowledged", v)}>
          I acknowledge receipt of the NJ Consumer Information Statement
        </Checkbox>
      </div>
    </div>
  );
}

/* ---- Step 3: Agency Disclosure ---- */
export function StepAgency({ form, update }: { form: ListingFormData; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">Agency Disclosure</h2>
      <div className="mt-3 rounded-lg border bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        <p className="mb-2 font-semibold">Seller&apos;s Agent Relationship</p>
        <p className="mb-2">
          By listing your property with us, a licensed real estate agent
          affiliated with Better Homes and Gardens Real Estate | Green Team will
          act as your <strong>Seller&apos;s Agent</strong>. This means:
        </p>
        <ul className="mb-2 list-disc space-y-1 pl-5">
          <li>The agent owes you fiduciary duties including loyalty, confidentiality, full disclosure, obedience, reasonable care, and accounting.</li>
          <li>The agent will market your property, negotiate on your behalf, and guide you through the transaction.</li>
          <li>Compensation will be outlined in a separate listing agreement prior to your property going on the market.</li>
          <li>You have the right to ask questions about the agency relationship at any time.</li>
        </ul>
        <p>
          This digital onboarding does <strong>not</strong> constitute a listing
          agreement. A licensed agent will review your submission and provide a
          formal listing agreement for your review and signature.
        </p>
      </div>
      <div className="mt-4">
        <Checkbox checked={form.agencyAcknowledged} onChange={(v) => update("agencyAcknowledged", v)}>
          I acknowledge the seller&apos;s agent relationship disclosure above
        </Checkbox>
      </div>
    </div>
  );
}

/* ---- Step 4: Property Condition ---- */
export function StepCondition({ form, update }: { form: ListingFormData; update: UpdateFn }) {
  const yesNoUnknown = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
    { value: "unknown", label: "Unknown" },
  ];
  const showLeadPaint = !form.yearBuilt || parseInt(form.yearBuilt) < 1978;

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">Property Condition</h2>
      <p className="mb-4 text-sm text-gray-500">
        NJ sellers are required to disclose known material defects. Answer
        honestly -- this helps your agent prepare accurate disclosures.
      </p>
      <div className="mb-4">
        <Label>Year Built (approximate)</Label>
        <Input value={form.yearBuilt} onChange={(v) => update("yearBuilt", v)} placeholder="e.g. 1985" />
      </div>
      <RadioGroup label="Any known structural issues (foundation, roof, walls)?" value={form.structuralIssues} options={yesNoUnknown} onChange={(v) => update("structuralIssues", v)} />
      <RadioGroup label="Any history of water damage, flooding, or mold?" value={form.waterDamage} options={yesNoUnknown} onChange={(v) => update("waterDamage", v)} />
      <RadioGroup label="Any known environmental hazards (asbestos, underground tanks)?" value={form.environmentalHazards} options={yesNoUnknown} onChange={(v) => update("environmentalHazards", v)} />
      <RadioGroup label="Is the property in a designated flood zone?" value={form.floodZone} options={yesNoUnknown} onChange={(v) => update("floodZone", v)} />
      {showLeadPaint && (
        <RadioGroup label="Any known lead-based paint or hazards? (Required for pre-1978 homes)" value={form.leadPaint} options={yesNoUnknown} onChange={(v) => update("leadPaint", v)} />
      )}
    </div>
  );
}

/* ---- Step 5: Pricing Strategy ---- */
export function StepPricing({ address }: { address: string }) {
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("done"), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">AI Pricing Strategy</h2>
      <p className="mb-4 text-sm text-gray-500">
        Our AI analyzes recent comparable sales to suggest an optimal price range.
      </p>
      <div className="rounded-lg border bg-gray-50 p-6 text-center">
        {status === "loading" ? (
          <div>
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-medium text-navy">Analyzing comparable sales...</p>
            <p className="mt-1 text-xs text-gray-500">
              Reviewing recent transactions near{" "}
              <span className="font-medium">{address || "your property"}</span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-600">Preliminary AI Analysis</p>
            <p className="mt-2 text-2xl font-bold text-navy">Price range will be provided by your agent</p>
            <p className="mt-2 text-xs text-gray-500">
              A licensed agent will review AI-generated comps, adjust for your
              property&apos;s unique features, and provide a recommended list price within 24 hours.
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-lg bg-indigo-50 p-3">
              <p className="text-xs font-medium text-indigo-700">Why not show a number now?</p>
              <p className="mt-1 text-xs text-indigo-600">
                Accurate pricing requires interior condition assessment, upgrades review,
                and local market expertise that only a licensed professional can provide.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Step 6: Contact & Consent ---- */
export function StepContact({ form, update }: { form: ListingFormData; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-navy">Contact & Consent</h2>
      <p className="mb-4 text-sm text-gray-500">
        Provide your contact information so a licensed agent can follow up.
      </p>
      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="John Smith" />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input value={form.phone} onChange={(v) => update("phone", v)} placeholder="(201) 555-0100" type="tel" />
        </div>
        <div>
          <Label>Email Address</Label>
          <Input value={form.email} onChange={(v) => update("email", v)} placeholder="john@example.com" type="email" />
        </div>
        <div className="mt-2">
          <Checkbox checked={form.consentCommunications} onChange={(v) => update("consentCommunications", v)}>
            I consent to being contacted by a licensed real estate agent regarding the listing of my property.
            I understand that my information will be handled in accordance with applicable privacy laws.
          </Checkbox>
        </div>
      </div>
    </div>
  );
}

/* ---- Step 7: Confirmation ---- */
export function StepConfirmation() {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-navy">Your Listing Request Has Been Submitted</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-600">
        A licensed agent will review your information and contact you within 24 hours
        to discuss next steps, including a detailed pricing strategy and the formal listing agreement.
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-lg bg-indigo-50 p-4">
        <p className="text-sm font-medium text-indigo-700">What happens next?</p>
        <ul className="mt-2 space-y-1 text-left text-xs text-indigo-600">
          <li>1. Agent reviews your submission and AI analysis</li>
          <li>2. You receive a call or email within 24 hours</li>
          <li>3. Schedule a property walkthrough</li>
          <li>4. Receive your formal listing agreement</li>
          <li>5. Your home goes live on the MLS</li>
        </ul>
      </div>
    </div>
  );
}
