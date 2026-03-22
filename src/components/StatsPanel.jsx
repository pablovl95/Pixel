import LineChart from './LineChart';
import BarChart  from './BarChart';
import { liveStats, dailyData, monthlyData, today, yesterday } from '../data/marketStats';

// ─── Helper: delta badge ──────────────────────────────────────────────────
function Delta({ current, previous, suffix = '' }) {
  const diff = current - previous;
  const pct  = previous ? ((diff / previous) * 100).toFixed(1) : '0.0';
  const up   = diff >= 0;
  return (
    <span className={`text-[10px] font-mono ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%{suffix}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/[0.07]">
      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-white font-semibold text-base font-mono leading-tight" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-white/30">{sub}</span>}
    </div>
  );
}

// ─── Section title ─────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest pt-1 border-t border-white/[0.07]">
        {title}
      </span>
      {children}
    </div>
  );
}

// ─── Canvas fill progress bar ─────────────────────────────────────────────
function FillBar({ pct }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-mono text-white/40">
        <span>Canvas filled</span>
        <span className="text-white">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────
export default function StatsPanel({ open, onClose }) {
  const last7  = dailyData.slice(-7);
  const last30 = dailyData.slice(-30);

  return (
    <>
      {/* ── Mobile bottom sheet backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={[
        'bg-black/80 backdrop-blur-sm flex flex-col gap-3 px-3 py-3 text-white',
        // desktop
        'md:relative md:w-72 md:shrink-0 md:h-full md:overflow-y-auto md:border-l md:border-white/[0.08] md:translate-y-0 md:z-auto md:rounded-none',
        // mobile bottom sheet
        'fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto',
        'rounded-t-2xl border-t border-x border-white/[0.12]',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
      ].join(' ')}>

        {/* drag handle (solo mobile) */}
        <div className="md:hidden flex justify-center pb-1 -mt-1">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

      {/* ── Overview KPIs ── */}
      <Section title="Overview">
        <div className="grid grid-cols-2 gap-1.5">
          <KPI
            label="Pixels sold"
            value={parseInt(liveStats.sold).toLocaleString()}
            sub={`of ${(liveStats.total / 1_000_000).toFixed(1)}M total`}
          />
          <KPI
            label="For sale"
            value={parseInt(liveStats.forSale).toLocaleString()}
            accent="#22c55e"
          />
          <KPI
            label="Avg price"
            value={`€${liveStats.avgPrice}`}
            accent="#f59e0b"
          />
          <KPI
            label="Highest sale"
            value={`€${liveStats.maxPrice}`}
            accent="#f87171"
          />
        </div>
        <KPI
          label="Total volume"
          value={`€${parseFloat(liveStats.totalVolume).toLocaleString()}`}
          sub="all-time marketplace"
          accent="#a78bfa"
        />
        <FillBar pct={liveStats.pctSold} />
      </Section>

      {/* ── Today ── */}
      <Section title="Today">
        <div className="grid grid-cols-2 gap-1.5">
          <KPI
            label="Sales"
            value={today.sales.toLocaleString()}
            sub={<Delta current={today.sales} previous={yesterday.sales} />}
          />
          <KPI
            label="Avg price"
            value={`€${today.avgPrice}`}
            sub={<Delta current={today.avgPrice} previous={yesterday.avgPrice} />}
            accent="#f59e0b"
          />
          <KPI
            label="Volume"
            value={`€${parseFloat(today.volume).toLocaleString()}`}
            sub={<Delta current={today.volume} previous={yesterday.volume} />}
            accent="#a78bfa"
          />
        </div>
      </Section>

      {/* ── Daily sales (last 30 days) ── */}
      <Section title="Daily Sales — last 30 days">
        <BarChart
          data={last30}
          valueKey="sales"
          color="#3b82f6"
          formatY={v => v.toLocaleString() + ' px'}
        />
      </Section>

      {/* ── Avg price history ── */}
      <Section title="Avg Price — last 30 days">
        <LineChart
          data={last30}
          valueKey="avgPrice"
          color="#f59e0b"
          formatY={v => `€${v.toFixed(2)}`}
        />
      </Section>

      {/* ── Daily volume ── */}
      <Section title="Volume (€) — last 30 days">
        <LineChart
          data={last30}
          valueKey="volume"
          color="#a78bfa"
          formatY={v => `€${parseFloat(v).toLocaleString()}`}
        />
      </Section>

      {/* ── Monthly overview ── */}
      <Section title="Monthly Sales — 12 months">
        <BarChart
          data={monthlyData}
          valueKey="sales"
          color="#22c55e"
          formatY={v => v.toLocaleString() + ' px'}
        />
      </Section>

      <Section title="Avg Price — 12 months">
        <LineChart
          data={monthlyData}
          valueKey="avgPrice"
          color="#fb923c"
          formatY={v => `€${v.toFixed(2)}`}
        />
      </Section>

      {/* Padding at bottom */}
      <div className="h-3" />
    </aside>
    </>
  );
}
