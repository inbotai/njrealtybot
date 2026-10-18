export default function AnalysisWait({ title, note }: { title: string; note: string }) {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <h2 className="mt-4 text-lg font-bold text-navy">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{note}</p>
          <p className="mt-3 text-xs text-gray-400">
            Public assessment records and comparable sales usually take 10–20 seconds.
          </p>
        </div>
      </div>
    </section>
  );
}
