export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Appraiser fee intelligence
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            Fee transparency for real estate appraisers.
          </h1>

          <p className="max-w-3xl text-xl leading-8 text-zinc-400">
            Search real appraisal fee data, AMC ratings, lender trends, turn
            times, revision burden, and market activity by city, state, form
            type, and loan type.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200">
              Search Market Data
            </button>

            <button className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold transition hover:border-zinc-500">
              Submit Anonymous Fee
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="mb-3 text-2xl font-semibold">Fee Transparency</h2>
            <p className="text-zinc-400">
              View average fees by city, state, form type, loan type, and
              client type.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="mb-3 text-2xl font-semibold">AMC Ratings</h2>
            <p className="text-zinc-400">
              Compare AMCs by pay speed, revision burden, communication, and
              overall fairness.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="mb-3 text-2xl font-semibold">Lender Analytics</h2>
            <p className="text-zinc-400">
              Track turn times, fee trends, revision counts, and direct lender
              versus AMC order patterns.
            </p>
          </div>
        </div>

        <section className="mt-20 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-3xl font-bold">Search market trends</h2>

            <div className="grid gap-4">
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="City" />
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="State" />
              <select className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white">
                <option>Form Type</option>
                <option>1004</option>
                <option>1075</option>
                <option>1025</option>
                <option>2055</option>
              </select>
              <select className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white">
                <option>Loan Type</option>
                <option>Conventional</option>
                <option>FHA</option>
                <option>VA</option>
                <option>USDA</option>
              </select>

              <button className="mt-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">
                View Average Fees & Turn Times
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-3xl font-bold">Anonymous submission</h2>

            <div className="grid gap-4">
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="State" />
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="City" />
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="Fee $" />
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="Turn Time in Days" />
              <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" placeholder="Revision Count" />

              <button className="mt-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200">
                Submit Fee Data
              </button>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-6 text-3xl font-bold">Analytics coming next</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Chart</p>
              <h3 className="text-xl font-semibold">Fee Trends</h3>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Chart</p>
              <h3 className="text-xl font-semibold">Fee by State</h3>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Chart</p>
              <h3 className="text-xl font-semibold">AMC Averages</h3>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
