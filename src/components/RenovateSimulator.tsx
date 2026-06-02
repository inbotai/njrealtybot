"use client";

import { useState } from "react";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20renovation%20options%20for%20my%20home";

const roomTypes = [
  { id: "kitchen", label: "Kitchen", icon: "🍳", avgCost: "$15,000 – $40,000", avgRoi: "2.5x – 3.5x" },
  { id: "bathroom", label: "Bathroom", icon: "🛁", avgCost: "$8,000 – $25,000", avgRoi: "2x – 3x" },
  { id: "livingroom", label: "Living Room", icon: "🛋️", avgCost: "$5,000 – $15,000", avgRoi: "1.5x – 2x" },
  { id: "exterior", label: "Exterior / Curb Appeal", icon: "🏡", avgCost: "$3,000 – $10,000", avgRoi: "2x – 4x" },
  { id: "landscaping", label: "Landscaping", icon: "🌳", avgCost: "$2,000 – $8,000", avgRoi: "1.5x – 2.5x" },
];

const roiData = [
  { renovation: "Minor Kitchen Remodel", cost: "$15,000", valueAdded: "$45,000", roi: "200%", tier: "high" },
  { renovation: "Bathroom Addition", cost: "$25,000", valueAdded: "$50,000", roi: "100%", tier: "high" },
  { renovation: "New Garage Door", cost: "$4,000", valueAdded: "$16,000", roi: "300%", tier: "high" },
  { renovation: "Exterior Paint / Siding", cost: "$8,000", valueAdded: "$20,000", roi: "150%", tier: "high" },
  { renovation: "Hardwood Floor Refinish", cost: "$3,000", valueAdded: "$10,000", roi: "233%", tier: "medium" },
  { renovation: "Landscaping / Curb Appeal", cost: "$5,000", valueAdded: "$12,000", roi: "140%", tier: "medium" },
  { renovation: "Major Kitchen Remodel", cost: "$60,000", valueAdded: "$72,000", roi: "20%", tier: "low" },
  { renovation: "Master Suite Addition", cost: "$100,000", valueAdded: "$80,000", roi: "-20%", tier: "low" },
];

export default function RenovateSimulator() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Renovation{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Simulator
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            See how renovations would look and calculate the ROI — before spending a dollar.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">How It Works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">Upload a Photo</h3>
              <p className="mt-1 text-sm text-gray-600">Send Vale a photo of your kitchen, bathroom, or any room via WhatsApp</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">AI Renders the Remodel</h3>
              <p className="mt-1 text-sm text-gray-600">Our AI shows you what the renovated room would look like in multiple styles</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">See the ROI</h3>
              <p className="mt-1 text-sm text-gray-600">Get estimated cost, value added, and ROI — data-backed from NJ market comps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Room selector */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Choose a Room to Simulate</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                className={`rounded-xl border-2 p-4 text-center transition ${
                  selectedRoom === room.id
                    ? "border-gold bg-gold/5 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gold/50 hover:shadow"
                }`}
              >
                <div className="text-3xl">{room.icon}</div>
                <p className="mt-2 text-sm font-semibold text-navy">{room.label}</p>
                <p className="mt-1 text-xs text-gray-500">Cost: {room.avgCost}</p>
                <p className="text-xs text-green-600 font-medium">ROI: {room.avgRoi}</p>
              </button>
            ))}
          </div>

          {selectedRoom && (
            <div className="mt-8 rounded-xl bg-white border border-gold/30 p-6 text-center">
              <p className="text-lg font-bold text-navy">
                Ready to see your {roomTypes.find(r => r.id === selectedRoom)?.label.toLowerCase()} transformed?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Send Vale a photo of your {roomTypes.find(r => r.id === selectedRoom)?.label.toLowerCase()} on WhatsApp and ask for a renovation simulation.
              </p>
              <a
                href={`https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20a%20${selectedRoom}%20renovation%20simulation`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#20bd5a]"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
                Send Photo to Vale
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ROI table */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Renovation ROI Guide — New Jersey</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Based on national averages adjusted for the NJ market</p>
          <div className="mt-8 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Renovation</th>
                  <th className="px-4 py-3 text-right font-medium">Avg. Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Value Added</th>
                  <th className="px-4 py-3 text-right font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((r, i) => (
                  <tr key={r.renovation} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.renovation}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cost}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.valueAdded}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      r.tier === "high" ? "text-green-600" : r.tier === "medium" ? "text-yellow-600" : "text-red-500"
                    }`}>{r.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">
            Source: National Association of Realtors 2025 Remodeling Impact Report, adjusted for NJ market.
            Actual ROI varies by property condition, location, and market timing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">Want a Personalized Renovation Plan?</h2>
          <p className="mt-2 text-gray-300">
            Vale analyzes your property and tells you exactly which renovations will give you the highest return.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-navy hover:bg-yellow-400">
            Get My Renovation Plan
          </a>
          <p className="mt-3 text-xs text-gray-400">Free when you list with us. $20/room otherwise.</p>
        </div>
      </section>
    </>
  );
}
