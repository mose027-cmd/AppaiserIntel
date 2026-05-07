export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="mb-6 text-6xl font-bold tracking-tight">
          AppaiserIntel
        </h1>

        <p className="mb-8 max-w-2xl text-xl text-zinc-400">
          Modern appraisal order management and marketplace platform for
          appraisers, AMCs, lenders, and brokers.
        </p>

        <div className="flex gap-4">
          <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200">
            Find Appraisers
          </button>

          <button className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold transition hover:border-zinc-500">
            Post an Order
          </button>
        </div>
      </section>
    </main>
  );
}
