import LineChart from '../components/LineChart';
import BarChart  from '../components/BarChart';
import { liveStats, dailyData, monthlyData, today, yesterday } from '../data/marketStats';

function Delta({ current, previous }) {
  const diff = current - previous;
  const pct  = previous ? ((diff / previous) * 100).toFixed(1) : '0.0';
  const up   = diff >= 0;
  return (
    <span className={`text-xs font-mono ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function KPI({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-white font-bold text-2xl font-mono leading-tight" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  );
}

function FillBar({ pct }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <div className="flex justify-between text-xs font-mono text-white/40">
        <span>Canvas filled</span>
        <span className="text-white font-bold">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
             style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
      <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{title}</span>
      {children}
    </div>
  );
}

export default function StatsPage() {
  const last30 = dailyData.slice(-30);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Page header */}
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">Community Stats</h1>
          <p className="text-white/30 text-sm font-mono mt-0.5">Live marketplace overview</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPI label="Pixels sold"    value={parseInt(liveStats.sold).toLocaleString()}
               sub={`of ${(liveStats.total / 1_000_000).toFixed(1)}M total`} />
          <KPI label="For sale"       value={parseInt(liveStats.forSale).toLocaleString()}
               accent="#22c55e" />
          <KPI label="Avg price"      value={`€${liveStats.avgPrice}`}    accent="#f59e0b" />
          <KPI label="Highest sale"   value={`€${liveStats.maxPrice}`}    accent="#f87171" />
          <KPI label="Total volume"
               value={`€${parseFloat(liveStats.totalVolume).toLocaleString()}`}
               accent="#a78bfa" sub="all-time" />
        </div>

        <FillBar pct={liveStats.pctSold} />

        {/* Today vs Yesterday */}
        <div>
          <h2 className="text-white/50 text-xs font-mono uppercase tracking-widest mb-3">Today</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KPI label="Sales today"    value={today.sales.toLocaleString()}
                 sub={<Delta current={today.sales} previous={yesterday.sales} />} />
            <KPI label="Avg price"      value={`€${today.avgPrice}`}
                 sub={<Delta current={today.avgPrice} previous={yesterday.avgPrice} />}
                 accent="#f59e0b" />
            <KPI label="Volume today"
                 value={`€${parseFloat(today.volume).toLocaleString()}`}
                 sub={<Delta current={today.volume} previous={yesterday.volume} />}
                 accent="#a78bfa" />
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Daily Sales — last 30 days">
            <BarChart data={last30} valueKey="sales" color="#3b82f6"
                      formatY={v => v.toLocaleString() + ' px'} />
          </ChartCard>

          <ChartCard title="Avg Price — last 30 days">
            <LineChart data={last30} valueKey="avgPrice" color="#f59e0b"
                       formatY={v => `€${v.toFixed(2)}`} />
          </ChartCard>

          <ChartCard title="Volume (€) — last 30 days">
            <LineChart data={last30} valueKey="volume" color="#a78bfa"
                       formatY={v => `€${parseFloat(v).toLocaleString()}`} />
          </ChartCard>

          <ChartCard title="Monthly Sales — 12 months">
            <BarChart data={monthlyData} valueKey="sales" color="#22c55e"
                      formatY={v => v.toLocaleString() + ' px'} />
          </ChartCard>

          <ChartCard title="Avg Price — 12 months">
            <LineChart data={monthlyData} valueKey="avgPrice" color="#fb923c"
                       formatY={v => `€${v.toFixed(2)}`} />
          </ChartCard>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
