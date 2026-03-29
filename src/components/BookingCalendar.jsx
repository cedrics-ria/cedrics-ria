import { useEffect, useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

function isoDate(date) {
  return date.toISOString().split('T')[0];
}

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

function endOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

// Returns ISO string dates that fall within [start, end] inclusive
function dateRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(isoDate(new Date(cur)));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// Mon = 0 … Sun = 6 (ISO week day index)
function weekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export default function BookingCalendar({ listingId, currentUser, onBook }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [pendingDates, setPendingDates] = useState(new Set());
  const [loadingDates, setLoadingDates] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [booking, setBooking] = useState(false);

  const [mode, setMode] = useState('days');
  const [hourDate, setHourDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (!listingId) return;
    setLoadingDates(true);
    supabase
      .from('bookings')
      .select('start_date, end_date, status')
      .eq('listing_id', listingId)
      .in('status', ['accepted', 'pending'])
      .then(({ data }) => {
        const blocked = new Set();
        const pending = new Set();
        (data || []).forEach(({ start_date, end_date, status }) => {
          dateRange(start_date, end_date).forEach((d) => {
            if (status === 'accepted') blocked.add(d);
            else pending.add(d);
          });
        });
        setBlockedDates(blocked);
        setPendingDates(pending);
        setLoadingDates(false);
      });
  }, [listingId]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  function handleDayClick(dateStr, isPast, isBlocked) {
    if (isPast || isBlocked || pendingDates.has(dateStr)) return;
    if (!startDate || (startDate && endDate)) {
      // Start fresh selection
      setStartDate(dateStr);
      setEndDate(null);
    } else {
      // We have a start but no end
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate(null);
      } else if (dateStr === startDate) {
        setStartDate(null);
      } else {
        // Check if any blocked date falls in the range
        const range = dateRange(startDate, dateStr);
        const hasBlocked = range.some((d) => blockedDates.has(d));
        if (hasBlocked) {
          // Reset and start over from this date
          setStartDate(dateStr);
          setEndDate(null);
        } else {
          setEndDate(dateStr);
        }
      }
    }
  }

  function getDayState(dateStr) {
    if (blockedDates.has(dateStr)) return 'blocked';
    if (pendingDates.has(dateStr)) return 'pending';
    if (startDate && endDate) {
      if (dateStr === startDate) return 'start';
      if (dateStr === endDate) return 'end';
      if (dateStr > startDate && dateStr < endDate) return 'inRange';
    } else if (startDate && !endDate) {
      if (dateStr === startDate) return 'start';
      if (hoveredDate && hoveredDate > startDate && dateStr > startDate && dateStr <= hoveredDate)
        return 'hover';
    }
    return 'normal';
  }

  function buildCalendarDays() {
    const firstDay = startOfMonth(viewYear, viewMonth);
    const lastDay = endOfMonth(viewYear, viewMonth);
    const leadingBlanks = weekdayIndex(firstDay);
    const days = [];
    for (let i = 0; i < leadingBlanks; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(viewYear, viewMonth, d);
      days.push(date);
    }
    // Pad to full weeks
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  async function handleBook() {
    if (mode === 'hours') {
      if (!hourDate || !startTime || !endTime || !onBook) return;
      setBooking(true);
      try {
        await onBook({ startDate: hourDate, endDate: hourDate, startTime, endTime, mode: 'hours' });
        setHourDate('');
        setStartTime('');
        setEndTime('');
      } finally {
        setBooking(false);
      }
    } else {
      if (!startDate || !endDate || !onBook) return;
      setBooking(true);
      try {
        await onBook({ startDate, endDate, mode: 'days' });
        setStartDate(null);
        setEndDate(null);
      } finally {
        setBooking(false);
      }
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }

  const calendarDays = buildCalendarDays();
  const canBook = mode === 'hours'
    ? !!(hourDate && startTime && endTime && endTime > startTime && currentUser)
    : !!(startDate && endDate && currentUser);

  const dayStyle = (dateStr, isPast, isBlocked) => {
    const state = dateStr ? getDayState(dateStr) : 'blank';
    const isPending = state === 'pending';

    const base = {
      width: 38,
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      fontSize: '0.88rem',
      fontWeight: 500,
      cursor: isPast || isBlocked || isPending ? 'not-allowed' : 'pointer',
      transition: 'background 0.12s ease, color 0.12s ease',
      userSelect: 'none',
      position: 'relative',
    };

    if (isPast) return { ...base, color: 'rgba(28,58,46,0.2)', cursor: 'not-allowed' };
    if (isBlocked)
      return {
        ...base,
        background: 'rgba(196,113,74,0.10)',
        color: C.terra,
        textDecoration: 'line-through',
        cursor: 'not-allowed',
      };
    if (isPending)
      return {
        ...base,
        background: 'rgba(200,169,107,0.15)',
        color: C.gold,
        cursor: 'not-allowed',
      };
    if (state === 'start' || state === 'end')
      return { ...base, background: C.forest, color: 'white', fontWeight: 700, borderRadius: 8 };
    if (state === 'inRange')
      return { ...base, background: 'rgba(28,58,46,0.12)', color: C.forest, borderRadius: 0 };
    if (state === 'hover') return { ...base, background: 'rgba(28,58,46,0.07)', color: C.forest };
    return { ...base, color: C.ink };
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        padding: '1.5rem',
        border: `1px solid ${C.line}`,
        boxShadow: '0 4px 20px rgba(28,58,46,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: C.forest }}>
          Verfügbarkeit & Buchung
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={prevMonth}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.forest,
              fontWeight: 700,
              fontSize: '1rem',
            }}
            aria-label="Vorheriger Monat"
          >
            ‹
          </button>
          <span
            style={{
              fontWeight: 700,
              color: C.forest,
              fontSize: '0.9rem',
              minWidth: 120,
              textAlign: 'center',
            }}
          >
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.forest,
              fontWeight: 700,
              fontSize: '1rem',
            }}
            aria-label="Nächster Monat"
          >
            ›
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: 'rgba(28,58,46,0.06)', borderRadius: 10, padding: '0.25rem', marginBottom: '1rem', gap: '0.25rem' }}>
        {['days', 'hours'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', background: mode === m ? C.forest : 'transparent', color: mode === m ? 'white' : C.muted, fontWeight: mode === m ? 700 : 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s ease' }}>
            {m === 'days' ? 'Tage' : 'Stunden'}
          </button>
        ))}
      </div>

      {mode === 'hours' ? (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: C.forest, display: 'block', marginBottom: '0.4rem' }}>Datum</label>
              <input type="date" value={hourDate} min={isoDate(today)} onChange={e => setHourDate(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 12, border: `1px solid ${C.line}`, fontSize: '0.9rem', background: 'white', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: C.forest, display: 'block', marginBottom: '0.4rem' }}>Von</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 12, border: `1px solid ${C.line}`, fontSize: '0.9rem', background: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: C.forest, display: 'block', marginBottom: '0.4rem' }}>Bis</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 12, border: `1px solid ${C.line}`, fontSize: '0.9rem', background: 'white', outline: 'none' }} />
              </div>
            </div>
          </div>
          {hourDate && startTime && endTime && endTime > startTime && (
            <div style={{ marginTop: '1rem', background: C.sageLight, borderRadius: 12, padding: '0.9rem 1rem', fontSize: '0.88rem', color: C.forest }}>
              <strong>{new Date(hourDate).toLocaleDateString('de-DE')}</strong>, {startTime} – {endTime} ({(() => { const [sh,sm] = startTime.split(':').map(Number); const [eh,em] = endTime.split(':').map(Number); return Math.max(0, (eh*60+em) - (sh*60+sm)) / 60; })().toFixed(1)} Std.)
            </div>
          )}
          {/* CTA */}
          <div style={{ marginTop: '1rem' }}>
            {!currentUser ? (
              <div style={{ textAlign: 'center', padding: '0.85rem', background: C.sageLight, borderRadius: 12, color: C.forest, fontSize: '0.88rem', fontWeight: 600 }}>Einloggen um zu buchen</div>
            ) : (
              <button onClick={handleBook} disabled={!canBook || booking} style={{ width: '100%', padding: '1rem', borderRadius: 12, border: 'none', background: canBook ? `linear-gradient(135deg, ${C.forest}, #163126)` : 'rgba(28,58,46,0.12)', color: canBook ? 'white' : C.muted, fontWeight: 700, fontSize: '0.97rem', cursor: canBook ? 'pointer' : 'not-allowed', transition: 'all 0.15s ease', opacity: booking ? 0.7 : 1 }}>
                {booking ? 'Anfrage wird gesendet…' : canBook ? 'Anfragen' : 'Datum & Uhrzeit wählen'}
              </button>
            )}
          </div>
        </div>
      ) : loadingDates ? (
        <div
          style={{ textAlign: 'center', color: C.muted, padding: '2rem 0', fontSize: '0.88rem' }}
        >
          Kalender wird geladen…
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              marginBottom: '0.5rem',
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: C.muted,
                  padding: '0.35rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={`blank-${idx}`} />;
              const dateStr = isoDate(date);
              const isPast = date < today;
              const isBlocked = blockedDates.has(dateStr);
              return (
                <div
                  key={dateStr}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 0',
                  }}
                >
                  <div
                    style={dayStyle(dateStr, isPast, isBlocked)}
                    onClick={() => handleDayClick(dateStr, isPast, isBlocked)}
                    onMouseEnter={() => {
                      if (!isPast && !isBlocked && startDate && !endDate) setHoveredDate(dateStr);
                    }}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={isBlocked ? 'Nicht verfügbar' : dateStr}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: C.forest }} />
              <span style={{ fontSize: '0.75rem', color: C.muted }}>Ausgewählt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: 'rgba(196,113,74,0.15)',
                  border: `1px solid ${C.terra}`,
                }}
              />
              <span style={{ fontSize: '0.75rem', color: C.muted }}>Belegt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: 'rgba(200,169,107,0.25)',
                  border: `1px solid ${C.gold}`,
                }}
              />
              <span style={{ fontSize: '0.75rem', color: C.muted }}>Angefragt</span>
            </div>
          </div>

          {/* Selection summary */}
          {(startDate || endDate) && (
            <div
              style={{
                marginTop: '1rem',
                background: C.sageLight,
                borderRadius: 12,
                padding: '0.9rem 1rem',
                fontSize: '0.88rem',
                color: C.forest,
              }}
            >
              {startDate && !endDate && (
                <span>
                  Startdatum: <strong>{formatDate(startDate)}</strong> — jetzt Enddatum wählen
                </span>
              )}
              {startDate && endDate && (
                <span>
                  <strong>{formatDate(startDate)}</strong> bis{' '}
                  <strong>{formatDate(endDate)}</strong> ({dateRange(startDate, endDate).length} Tag
                  {dateRange(startDate, endDate).length !== 1 ? 'e' : ''})
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: '1rem' }}>
            {!currentUser ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.85rem',
                  background: C.sageLight,
                  borderRadius: 12,
                  color: C.forest,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                Einloggen um zu buchen
              </div>
            ) : (
              <button
                onClick={handleBook}
                disabled={!canBook || booking}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: 12,
                  border: 'none',
                  background: canBook
                    ? `linear-gradient(135deg, ${C.forest}, #163126)`
                    : 'rgba(28,58,46,0.12)',
                  color: canBook ? 'white' : C.muted,
                  fontWeight: 700,
                  fontSize: '0.97rem',
                  cursor: canBook ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  opacity: booking ? 0.7 : 1,
                }}
              >
                {booking ? 'Anfrage wird gesendet…' : canBook ? 'Anfragen' : 'Zeitraum wählen'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
