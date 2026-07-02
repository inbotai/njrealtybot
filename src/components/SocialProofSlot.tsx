/**
 * Social proof / testimonial slot — CMS-driven from a config array.
 * Content supplied by the owner (not AI-generated).
 * gardenstate.ai branding only.
 */

const TESTIMONIALS = [
  // Julio will supply real testimonials — these are placeholders
  // Structure: { quote, name, location, metric }
] as Array<{ quote: string; name: string; location: string; metric?: string }>;

export default function SocialProofSlot() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center text-2xl font-bold text-navy mb-8">What Homeowners Say</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm border">
              <p className="text-gray-600 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.location}</p>
                </div>
                {t.metric && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    {t.metric}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Results may vary. AI-generated estimates for informational purposes only. Not appraisals.
        </p>
      </div>
    </section>
  );
}
