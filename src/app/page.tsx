export default function HomePage() {
  return (
    <>
      {/* Hero — Coming Soon */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-navy py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Coming Soon
          </div>

          <h1 className="mt-8 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            The Most Powerful AI for{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              NJ Real Estate
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Search 50,000+ homes, predict prices, get instant market analysis, and talk
            to Vale — your 24/7 AI real estate partner. Powered by NJMLS &amp; GSMLS data.
          </p>

          {/* Subscribe form */}
          <form
            action="https://formspree.io/f/xpwzgqkl"
            method="POST"
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              className="rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-yellow-400"
            >
              Subscribe for Updates
            </button>
          </form>
          <p className="mt-3 text-xs text-gray-500">
            Be the first to know when we launch. No spam, ever.
          </p>

          {/* Features preview */}
          <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
            {[
              { icon: "🧠", title: "Vale AI Partner", desc: "Not a chatbot — a real estate AI that knows every listing and gets smarter with every conversation." },
              { icon: "🔮", title: "Price Predictions", desc: "AI analyzes days on market, price history, and comps to find deals before anyone else." },
              { icon: "📊", title: "Instant CMA Reports", desc: "Complete market analysis with active, pending, and sold data in seconds." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-2 text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Broker info */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <img src="/realty-one-group-legend-logo.webp" alt="Realty One Group Legend" className="mx-auto h-16 w-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Julio Reynoso — Licensed Real Estate Agent
          </p>
          <p className="text-sm text-gray-500">
            Realty One Group Legend — 600 Getty Avenue, Clifton NJ 07011
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <a href="tel:+12018735655" className="text-navy hover:underline">(201) 873-5655</a>
            {" | "}
            <a href="mailto:julio@inbot.ai" className="text-navy hover:underline">julio@inbot.ai</a>
          </p>
        </div>
      </section>
    </>
  );
}
