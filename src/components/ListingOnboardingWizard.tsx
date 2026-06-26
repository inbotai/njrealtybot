"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  type ListingFormData,
  StepAddress,
  StepCIS,
  StepAgency,
  StepCondition,
  StepPricing,
  StepContact,
  StepConfirmation,
} from "@/components/ListingSteps";

const IDX_API =
  process.env.NEXT_PUBLIC_IDX_API ||
  "https://inbot-idx-api-production.up.railway.app";

const TOTAL_STEPS = 7;

const DISCLAIMER =
  "All listing services are provided by licensed real estate professionals affiliated with Better Homes and Gardens Real Estate | Green Team, 293 Route 94, Vernon, NJ 07462. AI analysis is for informational purposes only.";

const STEP_LABELS = [
  "Property Address",
  "Consumer Info Statement",
  "Agency Disclosure",
  "Property Condition",
  "Pricing Strategy",
  "Contact & Consent",
  "Confirmation",
];

const initialForm: ListingFormData = {
  address: "",
  cisAcknowledged: false,
  agencyAcknowledged: false,
  structuralIssues: "no",
  waterDamage: "no",
  environmentalHazards: "no",
  floodZone: "unknown",
  leadPaint: "unknown",
  yearBuilt: "",
  fullName: "",
  phone: "",
  email: "",
  consentCommunications: false,
};

export default function ListingOnboardingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const addr = searchParams.get("address");
    if (addr) setForm((f) => ({ ...f, address: addr }));
  }, [searchParams]);

  const update = (field: keyof ListingFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return form.address.trim().length > 5;
      case 2:
        return form.cisAcknowledged;
      case 3:
        return form.agencyAcknowledged;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return (
          form.fullName.trim().length > 1 &&
          form.phone.trim().length > 6 &&
          form.email.includes("@") &&
          form.consentCommunications
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${IDX_API}/api/idx/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          phone: form.phone,
          email: form.email,
          source: "listing_onboarding",
          address: form.address,
          property_condition: {
            structuralIssues: form.structuralIssues,
            waterDamage: form.waterDamage,
            environmentalHazards: form.environmentalHazards,
            floodZone: form.floodZone,
            leadPaint: form.leadPaint,
            yearBuilt: form.yearBuilt,
          },
          disclosures: {
            cisAcknowledged: form.cisAcknowledged,
            agencyAcknowledged: form.agencyAcknowledged,
            consentCommunications: form.consentCommunications,
          },
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStep(7);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 6) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="rounded-2xl bg-white shadow-xl">
      {/* Header */}
      <div className="rounded-t-2xl bg-navy px-6 py-5">
        <h1 className="text-2xl font-bold text-gold">List Your Home</h1>
        <p className="mt-1 text-sm text-gray-300">
          Digital onboarding — complete in 5 minutes
        </p>
      </div>

      {/* Progress */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-navy">
            Step {step} of {TOTAL_STEPS}: {STEP_LABELS[step - 1]}
          </span>
          <span className="text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[320px] px-6 py-6">
        {step === 1 && <StepAddress form={form} update={update} />}
        {step === 2 && <StepCIS form={form} update={update} />}
        {step === 3 && <StepAgency form={form} update={update} />}
        {step === 4 && <StepCondition form={form} update={update} />}
        {step === 5 && <StepPricing address={form.address} />}
        {step === 6 && <StepContact form={form} update={update} />}
        {step === 7 && <StepConfirmation />}
      </div>

      {/* Navigation */}
      {step < 7 && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <button
            onClick={back}
            disabled={step === 1}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:invisible"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance() || submitting}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Submitting..."
              : step === 6
                ? "Submit Listing Request"
                : "Next"}
          </button>
        </div>
      )}

      {error && (
        <div className="border-t px-6 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Disclaimer */}
      <div className="rounded-b-2xl border-t bg-gray-50 px-6 py-4">
        <p className="text-xs leading-relaxed text-gray-400">{DISCLAIMER}</p>
      </div>
    </div>
  );
}
