"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";
import MarketPoll from "./MarketPoll";
import SaveToLogCTA from "./SaveToLogCTA";

const testimonials = [
  { name: "Maria G.", city: "Bloomfield", text: "Vale gave me an instant estimate and connected me with an agent the same day. Sold above asking!" },
  { name: "James R.", city: "Paramus", text: "The CMA report was incredibly detailed. I knew exactly how to price my home." },
  { name: "Sandra L.", city: "Fort Lee", text: "From valuation to closing in 45 days. The AI assistant made everything smooth." },
];

const stats = [
  { value: "50,000+", label: "Properties Analyzed" },
  { value: "21", label: "NJ Counties Covered" },
  { value: "30 sec", label: "Instant Valuation" },
  { value: "Free", label: "No Obligation" },
];

export default function SellPageClient() {
  const [address, setAddress] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(`CMA for ${address}`)}`);
  }

  function handleVoice(text: string) {
    // If they say an address, go to CMA
    router.push(`/chat?q=${encodeURIComponent(`CMA for ${text}`)}`);
  }

  return (
    <>
      {/* Hero — direct to address input */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            What&apos;s Your Home <span className="text-gold">Worth?</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Get a free AI-powered valuation in 30 seconds. No obligation.
          </p>

          {/* Address input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl">
            <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl px-4 py-2 items-center gap-2">
              {!voiceActive && (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address... (e.g. 36 Clark Ave, Bloomfield)"
                  className="flex-1 px-2 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400"
                />
              )}
              <VoiceButton onTranscript={handleVoice} onRecordingChange={setVoiceActive} />
              {!voiceActive && (
                <button
                  type="submit"
                  disabled={!address.trim()}
                  className="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
                >
                  Get Free Estimate
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Or click the microphone and say your address
            </p>
          </form>

          {/* Save to MyHome Log CTA */}
          <div className="mt-10">
            <SaveToLogCTA toolType="cma" headline="Already know your address? Save it to start tracking." />
          </div>
        </div>
      </section>    </>
  );
}
