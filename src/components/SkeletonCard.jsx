import { C } from '../constants';

export default function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}` }}>
      <div style={{ height: 180, background: "linear-gradient(90deg, #EAF0EB 25%, #dce8dc 50%, #EAF0EB 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "1.4rem" }}>
        {[60, 40, 80].map((w) => (
          <div key={w} style={{ height: 14, borderRadius: 8, background: "#EAF0EB", marginBottom: "0.65rem", width: `${w}%`, animation: "shimmer 1.4s infinite" }} />
        ))}
        <div style={{ height: 38, borderRadius: 12, background: "#EAF0EB", marginTop: "0.5rem", animation: "shimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}
