import { useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';
import { inputBaseStyle, applyInputFocus, resetInputFocus } from '../styles';

export default function ContractModal({
  contract, listingId, listingTitle,
  ownerId, ownerName, renterId, renterName,
  isOwner, addToast, onClose, onContractUpdated,
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
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const isCompleted = contract?.status === 'completed';
  const isPending = contract?.status === 'pending_renter';
  const isCancelled = contract?.status === 'cancelled';
  const isCancelRequestedByOwner = contract?.status === 'cancel_requested_by_owner';
  const isCancelRequestedByRenter = contract?.status === 'cancel_requested_by_renter';
  const isCancelPending = isCancelRequestedByOwner || isCancelRequestedByRenter;
  const canSign = !isOwner && isPending;
  const isCreateMode = !contract && isOwner;

  const canRequestCancel = (isOwner || !isOwner) && (isPending || isCompleted) && !isCancelled && !isCancelPending;
  const canConfirmCancel =
    (isOwner && isCancelRequestedByRenter) || (!isOwner && isCancelRequestedByOwner);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE') : '–';
  const fmtTs = (ts) => ts ? new Date(ts).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : null;

  async function handleCreate() {
    if (!form.start_date || !form.end_date) { addToast('Bitte Zeitraum angeben.', 'error'); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { addToast('Enddatum muss nach Startdatum liegen.', 'error'); return; }
    setSaving(true);
    const safeForm = {
      ...form,
      price_per_day: (form.price_per_day || '').slice(0, 50),
      kaution: (form.kaution || '').slice(0, 50),
      item_condition: (form.item_condition || '').slice(0, 500),
      special_notes: (form.special_notes || '').slice(0, 500),
    };
    const { data, error } = await supabase.from('contracts').insert({
      listing_id: String(listingId), listing_title: listingTitle,
      owner_id: ownerId, renter_id: renterId,
      owner_name: ownerName, renter_name: renterName,
      ...safeForm, status: 'pending_renter', owner_signed_at: new Date().toISOString(),
    }).select().single();
    setSaving(false);
    if (error) { console.error('[ContractModal] create:', error); addToast('Vertrag konnte nicht erstellt werden. Bitte versuche es erneut.', 'error'); return; }
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
    if (error) { console.error('[ContractModal] sign:', error); addToast('Vertrag konnte nicht bestätigt werden. Bitte versuche es erneut.', 'error'); return; }
    addToast('Vertrag bestätigt ✓', 'info');
    onContractUpdated(data);
    onClose();
  }

  async function handleCancel() {
    setSaving(true);
    let updatePayload;
    if (isPending && isOwner) {
      // Owner can directly cancel while pending
      updatePayload = { status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: ownerId };
    } else if (isCompleted) {
      // Request cancellation
      updatePayload = { status: isOwner ? 'cancel_requested_by_owner' : 'cancel_requested_by_renter' };
    } else {
      setSaving(false);
      return;
    }
    const { data, error } = await supabase.from('contracts')
      .update(updatePayload).eq('id', contract.id).select().single();
    setSaving(false);
    setCancelConfirm(false);
    if (error) { console.error('[ContractModal] cancel:', error); addToast('Stornierung konnte nicht durchgeführt werden.', 'error'); return; }
    addToast(isPending ? 'Vertrag zurückgezogen.' : 'Stornierung beantragt.', 'info');
    onContractUpdated(data);
    if (isPending) onClose();
  }

  async function handleConfirmCancel() {
    setSaving(true);
    const { data, error } = await supabase.from('contracts')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: isOwner ? ownerId : renterId })
      .eq('id', contract.id).select().single();
    setSaving(false);
    if (error) { console.error('[ContractModal] confirmCancel:', error); addToast('Stornierung konnte nicht bestätigt werden.', 'error'); return; }
    addToast('Vertrag storniert.', 'info');
    onContractUpdated(data);
  }

  function handlePrintPDF() {
    const win = window.open('', '_blank');
    if (!win) { addToast('Pop-up wurde blockiert. Bitte Pop-ups für diese Seite erlauben.', 'error'); return; }
    const c = contract;
    const statusText = isCancelled ? 'Storniert' : isCancelPending ? 'Stornierung ausstehend' : isCompleted ? 'Beidseitig unterzeichnet' : 'Ausstehend';
    const statusColor = isCancelled ? '#8B2020' : isCancelPending ? '#C4714A' : isCompleted ? '#1C3A2E' : '#C4714A';
    const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Mietvertrag – ${c.listing_title || ''}</title><style>
      @page { margin: 2cm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Georgia, 'Times New Roman', serif; color: #1A1714; line-height: 1.7; padding: 2rem; max-width: 700px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #1C3A2E; }
      .logo { font-size: 2rem; font-weight: 900; font-style: italic; color: #1C3A2E; letter-spacing: -0.04em; }
      .tagline { font-size: 0.8rem; color: #7A7470; font-style: italic; letter-spacing: 0.08em; }
      .status { display: inline-block; padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.82rem; font-weight: 700; color: white; background: ${statusColor}; margin-top: 0.75rem; }
      h1 { font-size: 1.4rem; color: #1C3A2E; margin: 1.5rem 0 0.75rem; }
      h2 { font-size: 1rem; color: #1C3A2E; margin: 1.25rem 0 0.5rem; border-bottom: 1px solid #e0ddd8; padding-bottom: 0.3rem; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
      .field { background: #F7F3EC; border-radius: 8px; padding: 0.75rem 1rem; }
      .field-label { font-size: 0.72rem; color: #7A7470; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
      .field-value { font-weight: 600; color: #1C3A2E; }
      .signed { font-size: 0.75rem; color: #7A9E7E; margin-top: 0.2rem; }
      .unsigned { font-size: 0.75rem; color: #7A7470; margin-top: 0.2rem; }
      .text-block { background: #F7F3EC; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
      .legal { background: #F7F3EC; border-radius: 8px; padding: 1rem; margin-top: 1.5rem; font-size: 0.82rem; color: #7A7470; }
      .cancelled-block { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
      .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e0ddd8; font-size: 0.78rem; color: #7A7470; }
      @media print { body { padding: 0; } }
    </style></head><body>
      <div class="header">
        <div class="logo">ria</div>
        <div class="tagline">rent it all.</div>
        <div class="status">${statusText}</div>
      </div>
      <h1>Mietvertrag: ${c.listing_title || '–'}</h1>
      <h2>Vertragsparteien</h2>
      <div class="grid">
        <div class="field">
          <div class="field-label">Vermieter</div>
          <div class="field-value">${c.owner_name || '–'}</div>
          ${c.owner_signed_at ? `<div class="signed">✓ Unterzeichnet ${fmtTs(c.owner_signed_at)}</div>` : '<div class="unsigned">○ Ausstehend</div>'}
        </div>
        <div class="field">
          <div class="field-label">Mieter</div>
          <div class="field-value">${c.renter_name || '–'}</div>
          ${c.renter_signed_at ? `<div class="signed">✓ Unterzeichnet ${fmtTs(c.renter_signed_at)}</div>` : '<div class="unsigned">○ Ausstehend</div>'}
        </div>
      </div>
      <h2>Mietdetails</h2>
      <div class="grid">
        <div class="field"><div class="field-label">Startdatum</div><div class="field-value">${fmtDate(c.start_date)}</div></div>
        <div class="field"><div class="field-label">Enddatum</div><div class="field-value">${fmtDate(c.end_date)}</div></div>
        <div class="field"><div class="field-label">Preis</div><div class="field-value">${c.price_per_day || '–'}</div></div>
        <div class="field"><div class="field-label">Kaution</div><div class="field-value">${c.kaution || '–'}</div></div>
      </div>
      ${c.item_condition ? `<h2>Zustand des Gegenstands</h2><div class="text-block">${c.item_condition}</div>` : ''}
      ${c.special_notes ? `<h2>Besondere Hinweise</h2><div class="text-block">${c.special_notes}</div>` : ''}
      ${isCancelled ? `<div class="cancelled-block"><strong>Vertrag storniert</strong>${c.cancelled_at ? `<br>Storniert am ${fmtTs(c.cancelled_at)}` : ''}</div>` : ''}
      <div class="legal">📜 <strong>§ 126b BGB – Textform.</strong> Durch digitale Bestätigung beider Parteien ist dieser Vertrag rechtlich bindend. Die Bestätigung wird mit Zeitstempel und Nutzer-ID gespeichert.<br><br>Vertrag-ID: ${c.id}</div>
      <div class="footer">ria – rent it all. · ria-rentitall.de · ${new Date().getFullYear()}</div>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  // Header background
  const headerBg = isCancelled ? 'linear-gradient(135deg, #8B2020, #6B1515)' :
    isCancelPending ? `linear-gradient(135deg, ${C.terra}, #a85930)` :
    isCompleted ? 'linear-gradient(135deg, #163126, #1C3A2E)' :
    isPending && !isOwner ? `linear-gradient(135deg, ${C.terra}, #a85930)` :
    C.forest;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
      <div style={{ background:'white', borderRadius:24, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ background: headerBg, padding:'1.5rem', borderRadius:'24px 24px 0 0', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em' }}>📄 Mietvertrag</div>
            <div style={{ fontSize:'0.82rem', opacity:0.7, marginTop:'0.2rem' }}>{listingTitle}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ padding:'1.5rem' }}>
          {/* Status badges */}
          {isCancelled && (
            <div style={{ background:'rgba(139,32,32,0.08)', border:'1px solid rgba(139,32,32,0.25)', borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'1.2rem' }}>❌</span>
              <div>
                <div style={{ fontWeight:700, color:'#8B2020', fontSize:'0.9rem' }}>Vertrag storniert</div>
                {contract.cancelled_at && <div style={{ color:C.muted, fontSize:'0.78rem' }}>Storniert am {fmtTs(contract.cancelled_at)}</div>}
              </div>
            </div>
          )}
          {canConfirmCancel && (
            <div style={{ background:'rgba(196,113,74,0.08)', border:`1px solid rgba(196,113,74,0.25)`, borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
              <div style={{ fontWeight:700, color:C.terra, fontSize:'0.9rem' }}>⚠️ Stornierung beantragt</div>
              <div style={{ color:C.muted, fontSize:'0.78rem', marginTop:'0.2rem' }}>
                {isCancelRequestedByOwner ? contract.owner_name : contract.renter_name} möchte den Vertrag stornieren. Bitte bestätige oder lehne ab.
              </div>
            </div>
          )}
          {isCancelPending && !canConfirmCancel && (
            <div style={{ background:C.sageLight, borderRadius:12, padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
              <div style={{ fontWeight:700, color:C.forest, fontSize:'0.9rem' }}>⏳ Warte auf Bestätigung der Stornierung</div>
            </div>
          )}
          {isCompleted && !isCancelPending && (
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
                  <input type="text" placeholder="z.B. 5 € / Tag" maxLength={50} value={form.price_per_day} onChange={e => setForm(f=>({...f,price_per_day:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
                ) : (
                  <div style={{ fontWeight:600, color:C.forest }}>{contract?.price_per_day || '–'}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Kaution</label>
                {isCreateMode ? (
                  <input type="text" placeholder="z.B. 50 €" maxLength={50} value={form.kaution} onChange={e => setForm(f=>({...f,kaution:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', fontSize:'0.88rem' }} />
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
              <textarea rows={2} maxLength={500} placeholder="z.B. Gerät ist voll funktionsfähig, kleine Kratzer am Gehäuse…" value={form.item_condition} onChange={e => setForm(f=>({...f,item_condition:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', resize:'none', fontSize:'0.88rem' }} />
            ) : (
              <div style={{ color:C.ink, fontSize:'0.9rem', lineHeight:1.6 }}>{contract?.item_condition || '–'}</div>
            )}
          </div>

          {/* Special notes */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ fontSize:'0.8rem', color:C.muted, display:'block', marginBottom:'0.35rem' }}>Besondere Hinweise</label>
            {isCreateMode ? (
              <textarea rows={2} maxLength={500} placeholder="z.B. Reinigung vor Rückgabe, keine Weiterverleihe…" value={form.special_notes} onChange={e => setForm(f=>({...f,special_notes:e.target.value}))} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, width:'100%', boxSizing:'border-box', resize:'none', fontSize:'0.88rem' }} />
            ) : (
              <div style={{ color:C.ink, fontSize:'0.9rem', lineHeight:1.6 }}>{contract?.special_notes || '–'}</div>
            )}
          </div>

          {/* Legal note */}
          <div style={{ background:C.cream, borderRadius:10, padding:'0.75rem', marginBottom:'1.25rem', fontSize:'0.75rem', color:C.muted, lineHeight:1.6 }}>
            📜 <strong>§ 126b BGB – Textform.</strong> Durch digitale Bestätigung beider Parteien ist dieser Vertrag rechtlich bindend. Die Bestätigung wird mit Zeitstempel und Nutzer-ID gespeichert.
          </div>

          {/* Cancel confirmation inline */}
          {cancelConfirm && (
            <div style={{ background:'rgba(139,32,32,0.06)', border:'1px solid rgba(139,32,32,0.2)', borderRadius:12, padding:'1rem', marginBottom:'1rem' }}>
              <div style={{ fontWeight:700, color:'#8B2020', fontSize:'0.9rem', marginBottom:'0.5rem' }}>
                {isPending ? 'Vertrag wirklich zurückziehen?' : 'Stornierung wirklich beantragen?'}
              </div>
              <div style={{ fontSize:'0.82rem', color:C.muted, marginBottom:'0.75rem' }}>
                {isPending ? 'Der Vertrag wird sofort storniert.' : 'Die andere Partei muss die Stornierung noch bestätigen.'}
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button onClick={() => setCancelConfirm(false)} style={{ flex:1, padding:'0.6rem', borderRadius:10, border:`1px solid ${C.line}`, background:'white', color:C.forest, fontWeight:600, cursor:'pointer', fontSize:'0.82rem' }}>Abbrechen</button>
                <button onClick={handleCancel} disabled={saving} style={{ flex:1, padding:'0.6rem', borderRadius:10, border:'none', background:'#8B2020', color:'white', fontWeight:700, cursor:saving?'default':'pointer', fontSize:'0.82rem', opacity:saving?0.7:1 }}>{saving ? 'Wird storniert…' : 'Ja, stornieren'}</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
            {/* PDF export */}
            {!isCreateMode && (
              <button onClick={handlePrintPDF} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:`1px solid ${C.line}`, background:'white', color:C.forest, fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
                📥 Als PDF speichern
              </button>
            )}
            {/* Confirm cancel (other party) */}
            {canConfirmCancel && (
              <button onClick={handleConfirmCancel} disabled={saving} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:'none', background:'#8B2020', color:'white', fontWeight:700, cursor:saving?'default':'pointer', fontSize:'0.88rem', opacity:saving?0.7:1 }}>
                {saving ? 'Wird storniert…' : '❌ Stornierung bestätigen'}
              </button>
            )}
            {/* Request cancel */}
            {canRequestCancel && !cancelConfirm && (
              <button onClick={() => setCancelConfirm(true)} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:'1px solid rgba(139,32,32,0.3)', background:'rgba(139,32,32,0.06)', color:'#8B2020', fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
                {isPending ? 'Vertrag zurückziehen' : 'Stornierung beantragen'}
              </button>
            )}
            {/* Close */}
            <button onClick={onClose} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:`1px solid ${C.line}`, background:'white', color:C.forest, fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
              {isCompleted || isCancelled || isCancelPending || (isPending && isOwner) ? 'Schließen' : 'Abbrechen'}
            </button>
            {/* Create */}
            {isCreateMode && (
              <button onClick={handleCreate} disabled={saving} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:'none', background:`linear-gradient(135deg, ${C.forest}, #163126)`, color:'white', fontWeight:700, cursor:saving?'default':'pointer', fontSize:'0.88rem', opacity:saving?0.7:1 }}>
                {saving ? 'Wird erstellt…' : '✍️ Vertrag erstellen & unterzeichnen'}
              </button>
            )}
            {/* Sign */}
            {canSign && !isCancelled && !isCancelPending && (
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
