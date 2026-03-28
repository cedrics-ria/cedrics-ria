import { useEffect, useRef, useState } from 'react';

export default function AnimatedStat({ value, label }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        padding: '1.75rem 1.5rem',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(6px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
        {value}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{label}</div>
    </div>
  );
}
