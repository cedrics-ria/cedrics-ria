import { useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';
import { inputBaseStyle, applyInputFocus, resetInputFocus } from '../styles';

export default function ContractModal({
  contract, listingId, listingTitle,
  ownerId, ownerName, renterId, renterName,
  currentUser, isOwner, addToast, onClose, onContractUpdated,
}) {
  const [form, setForm] = useState({
    start_date: contract?.start_date || '',
    end_date: contract?.end_date || '',
    price_per_day: contract?.price_per_day || '',
    kaution: contract?.kaution || '',
    item_condition: contract?.item_condition || '',
    special_notes: contract?.special_notes || '',
  });
  const [saving, setSaving] = useState(false);

  const isCompleted = contract?.status === 'completed';
  const isPending = contract?.status === 'pending_renter';
  const canSign = !isOwner && isPending;
  const isCreateMode = !contract && isOwner;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '–';
  const fmtTs = (ts) => ts ? new Date(ts).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : null;

  async function handleCreate() {
    if (!form.start_date || !form.end_date) { addToast('Bitte Zeitraum angeben.', 'error'); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { addToast('Enddatum muss nach Startdatum liegen.', 'error'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('contracts').insert({
      listing_id: String(listingId), listing_title: listingTitle,
      owner_id: ownerId, renter_id: renterId,
      owner_name: ownerName, renter_name: renterName,
      ...form, status: 'pending_renter', owner_signed_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { addToast('Fehler: ' + error.message, 'error'); return; }
    addToast('Vertrag erstellt & unterzeichnet ✓', 'info');
    onContractUpdated(data);
    onClose();
  }

  async function handleSign() {
    setSaving(true);
    const { data, error } = await supabase.from('contracts')
      .update({ renter_signed_at: new Date().toISOString(), status: 'completed' })
      .eq('id', contract.id).select().single();
    setSaving(false);
    if (error) { addToast('Fehler: ' + error.message, 'error'); return; }
    addToast('Vertrag bestätigt ✓', 'info');
    onContractUpdated(data);
    onClose();
  }

  // overlay + card styles
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
      <div style={{ background:'white', borderRadius:24, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ background: isCompleted ? 'linear-gradient(135deg, #163126, #1C3A2E)' : isPending && !isOwner ? `linear-gradient(135deg, ${C.terra}, #a85930)` : C.forest, padding:'1.5rem', borderRadius:'24px 24px 0 0', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em' }}>📄 Mietvertrag</div>
            <div style={{ fontSize:'0.82rem', opacity:0.7, marginTop:'0.2rem' }}>{listingTitle}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ padding:'1.5rem' }}>
          {/* Status badge */}
          {isCompleted && (
            <div style={{ background:'rgba(122,158,126,0.12)', border:`1px solid rgba(122,158,126,0.3)`, borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'1.2rem' }}>✅</span>
              <div>
                <div style={{ fontWeight:700, color:C.forest, fontSize:'0.9rem' }}>Vertrag von beiden Parteien unterzeichnet</div>
                <div style={{ color:C.muted, fontSize:'0.78rem' }}>Rechtsgültig nach §126b BGB</div>
              </div>
            </div>
          )}
          {isPending && !isOwner && (
            <div style={{ background:'rgba(196,113,74,0.08)', border:`1px solid rgba(196,113,74,0.25)`, borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
              <div style={{ fontWeight:700, color:C.terra, fontSize:'0.9rem' }}>⏳ Deine Bestätigung ausstehend</div>
              <div style={{ color:C.muted, fontSize:'0.78rem', marginTop:'0.2rem' }}>Bitte lies den Vertrag und bestätige ihn unten.</div>
            </div>
          )}
          {isPending && isOwner && (
            <div style={{ background:C.sageLight, borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
              <div style={{ fontWeight:700, color:C.forest, fontSize:'0.9rem' }}>⏳ Warte auf Bestätigung durch Mieter</div>
            </div>
          )}

          {/* Parties */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.25rem' }}>
            {[
              { label:'Vermieter', name: contract?.owner_name || ownerName, signed: contract?.owner_signed_at },
              { label:'Mieter', name: contract?.renter_name || renterName, signed: contract?.renter_signed_at },
            ].map(p => (
              <div key={p.label} style={{ background:C.cream, borderRadius:12, padding:'0.9rem', border:`1px solid ${C.line}` }}>
                <div style={{ fontSize:'0.72rem', color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem' }}>{p.label}</div>
                <div style={{ fontWeight:700, color:C.forest, fontSize:'0.92rem' }}>{p.name}</div>
                {p.signed ? (
                  <div style={{ fontSize:'0.72rem', color:C.sage, marginTop:'0.3rem', fontWeight:600 }}>✓ Unterzeichnet {fmtTs(p.signed)}</div>
                ) : (
                  <div style={{ fontSize:'0.72rem', color:C.muted, marginTop:'0.3rem' }}>○ Ausstehend</div>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:C.line, margin:'0 0 1.25rem' }} />

          {/* Rental Details */}
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Mietdetails</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div>
                <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Startdatum</label>
                {isCreateMode ? (
                  <input type="date" value={form.start_date} onChange={e => setForm(f=>({...f,start_date:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
                ) : (
                  <div style={{ fontWeight:600, color:C.forest }}>{fmtDate(contract?.start_date)}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Enddatum</label>
                {isCreateMode ? (
                  <input type="date" value={form.end_date} onChange={e => setForm(f=>({...f,end_date:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
                ) : (
                  <div style={{ fontWeight:600, color:C.forest }}>{fmtDate(contract?.end_date)}</div>
                )}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div>
                <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Preis</label>
                {isCreateMode ? (
                  <input type="text" placeholder="z.B. 5 € / Tag" value={form.price_per_day} onChange={e => setForm(f=>({...f,price_per_day:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
                ) : (
                  <div style={{ fontWeight:600, color:C.forest }}>{contract?.price_per_day || '–'}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Kaution</label>
                {isCreateMode ? (
                  <input type="text" placeholder="z.B. 50 €" value={form.kaution} onChange={e => setForm(f=>({...f,kaution:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
                ) : (
                  <div style={{ fontWeight:600, color:C.forest }}>{contract?.kaution || '–'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Item condition */}
          <div style={{ marginBottom:'0.75rem' }}>
            <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Zustand des Gegenstands</label>
            {isCreateMode ? (
              <textarea rows={2} placeholder="z.B. Gerät ist voll funktionsfähig, kleine Kratzer am Gehäuse…" value={form.item_condition} onChange={e => setForm(f=>({...f,item_condition:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', resize:'none', fontSize:'0.88rem' }} />
            ) : (
              <div style={{ color:C.ink, fontSize:'0.9rem', lineHeight:1.6 }}>{contract?.item_condition || '–'}</div>
            )}
          </div>

          {/* Special notes */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Besondere Hinweise</label>
            {isCreateMode ? (
              <textarea rows={2} placeholder="z.B. Reinigung vor Rückgabe, keine Weiterverleihe…" value={form.special_notes} onChange={e => setForm(f=>({...f,special_notes:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', resize:'none', fontSize:'0.88rem' }} />
            ) : (
              <div style={{ color:C.ink, fontSize:'0.9rem', lineHeight:1.6 }}>{contract?.special_notes || '–'}</div>
            )}
          </div>

          {/* Legal note */}
          <div style={{ background:C.cream, borderRadius:10, padding:'0.75rem', marginBottom:'1.25rem', fontSize:'0.75rem', color:C.muted, lineHeight:1.6 }}>
            📜 <strong>§ 126b BGB – Textform.</strong> Durch digitale Bestätigung beider Parteien ist dieser Vertrag rechtlich bindend. Die Bestätigung wird mit Zeitstempel und Nutzer-ID gespeichert.
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:`1px solid ${C.line}`, background:'white', color:C.forest, fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
              {isCompleted || (isPending && isOwner) ? 'Schließen' : 'Abbrechen'}
            </button>
            {isCreateMode && (
              <button onClick={handleCreate} disabled={saving} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.forest}, #163126)`, color:'white', fontWeight:700, cursor:saving?'default':'pointer', fontSize:'0.88rem', opacity:saving?0.7:1 }}>
                {saving ? 'Wird erstellt…' : '✍️ Vertrag erstellen & unterzeichnen'}
              </button>
            )}
            {canSign && (
              <button onClick={handleSign} disabled={saving} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.terra}, #a85930)`, color:'white', fontWeight:700, cursor:saving?'default':'pointer', fontSize:'0.88rem', opacity:saving?0.7:1 }}>
                {saving ? 'Wird gespeichert…' : '✅ Ich bestätige diesen Vertrag'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
