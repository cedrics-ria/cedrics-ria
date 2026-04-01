import { C } from '../constants';

export default function AnalyticsChart({ data, title, color }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, boxShadow: '0 4px 20px rgba(28,58,46,0.06)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: C.forest }}>{title}</h3>
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.88rem' }}>
          Noch keine Daten
        </div>
      </div>
    );
  }

  const W = 480, H = 160;
  const pad = { top: 20, right: 20, bottom: 28, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const gridLines = 4;

  const points = data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: pad.top + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${pad.top + chartH} L${points[0].x},${pad.top + chartH} Z`;
  const gradId = `grad-${title.replace(/\s+/g, '-')}`;

  return (
    <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, boxShadow: '0 4px 20px rgba(28,58,46,0.06)', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800, color: C.forest }}>{title}</h3>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = pad.top + (i / gridLines) * chartH;
          const val = Math.round(maxVal - (i / gridLines) * maxVal);
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="rgba(28,58,46,0.07)" strokeWidth="1" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#7A7470">{val}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2.5" />
            <title>{`${p.label}: ${p.value}`}</title>
            {p.value > 0 && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{p.value}</text>
            )}
            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#7A7470">{p.label}</text>
          </g>
        ))}
      </svg>

      {/* Stats table */}
      <div style={{ marginTop: '1rem', borderTop: `1px solid ${C.line}`, paddingTop: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: '0.25rem' }}>
          {data.map((d, i) => {
            const prev = data[i - 1];
            const newCount = d.new ?? (prev != null ? d.value - prev.value : d.value);
            const pct = prev && prev.value > 0
              ? ((d.value - prev.value) / prev.value) * 100
              : null;
            const pctPositive = pct === null || pct >= 0;

            return (
              <div
                key={d.label}
                style={{
                  textAlign: 'center',
                  padding: '0.4rem 0.2rem',
                  borderRadius: 10,
                  background: i === data.length - 1 ? `${color}10` : 'transparent',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: C.muted, fontWeight: 600, marginBottom: '0.15rem' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.forest, lineHeight: 1 }}>
                  {d.value}
                </div>
                {newCount > 0 && (
                  <div style={{ fontSize: '0.65rem', color, fontWeight: 700, marginTop: '0.15rem' }}>
                    +{newCount}
                  </div>
                )}
                {pct !== null && (
                  <div style={{ fontSize: '0.62rem', color: pctPositive ? C.sage : C.terra, fontWeight: 700 }}>
                    {pctPositive ? '+' : ''}{pct.toFixed(0)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
