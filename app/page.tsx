export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-2xl font-bold text-blue-900">
            AppraiserIntel
          </div>

          <nav className="space-y-2 text-sm font-medium text-slate-600">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-700">Dashboard</div>
            <div className="px-4 py-3">Fee Search</div>
            <div className="px-4 py-3">Submit Data</div>
            <div className="px-4 py-3">AMC Scorecard</div>
            <div className="px-4 py-3">Market Trends</div>
            <div className="px-4 py-3">Reports</div>
          </nav>

          <div className="mt-16 rounded-2xl bg-blue-50 p-4 text-sm text-slate-600">
            Submit anonymous fee data to help build accurate market insights.
            <button className="mt-4 w-full rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white">
              Submit Data
            </button>
          </div>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-950">Dashboard</h1>
              <p className="text-slate-500">
                Real fee data. Real market insight. Built for appraisers.
              </p>
            </div>

            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Last 30 Days
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Avg Fee 1004 FHA</p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">$625</h2>
              <p className="mt-2 text-sm text-emerald-600">+4.3%</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Avg Turn Time</p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">5.2</h2>
              <p className="mt-2 text-sm text-slate-500">days</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Submissions</p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">1,248</h2>
              <p className="mt-2 text-sm text-emerald-600">+12.5%</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Active Markets</p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">412</h2>
              <p className="mt-2 text-sm text-slate-500">cities</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-950">Average Fee by Loan Type</h2>
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cincinnati, OH</button>
            </div>

            <div className="flex h-64 items-end justify-between gap-4 border-b border-slate-200 px-4">
              {[
                ["FHA", "70%", "$625"],
                ["VA", "66%", "$600"],
                ["Conventional", "60%", "$575"],
                ["USDA", "52%", "$525"],
                ["Other", "75%", "$650"],
              ].map(([label, height, fee]) => (
                <div key={label} className="flex flex-1 flex-col items-center">
                  <p className="mb-2 text-sm font-semibold text-blue-950">{fee}</p>
                  <div className="w-full rounded-t-xl bg-blue-600" style={{ height }} />
                  <p className="mt-3 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold text-blue-950">Anonymous Fee Submission</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="City" />
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="State" />
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Form Type" />
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Loan Type" />
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Fee" />
                <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Turn Time" />
              </div>
              <button className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">
                Submit Anonymous Data
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-blue-950">Top AMC Scores</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span>AMC One</span><strong className="text-emerald-600">4.2</strong></div>
                <div className="flex justify-between"><span>LenderX Valuations</span><strong className="text-emerald-600">3.6</strong></div>
                <div className="flex justify-between"><span>Accurate Valuations</span><strong className="text-amber-500">3.2</strong></div>
                <div className="flex justify-between"><span>Quick Appraisals</span><strong className="text-orange-500">2.4</strong></div>
                <div className="flex justify-between"><span>ValuePro Network</span><strong className="text-red-500">1.8</strong></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
