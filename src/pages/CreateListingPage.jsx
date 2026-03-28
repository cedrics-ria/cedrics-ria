import { useState } from 'react';
import { C, allCategoryNames } from '../constants';
import { inputBaseStyle, applyInputFocus, resetInputFocus, getFallbackImage } from '../styles';
import { supabase } from '../supabase';

export default function CreateListingPage({ onAddListing, goTo, currentUser, addToast }) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    plz: '',
    image: '',
    category: '',
    description: '',
    kaution: '',
  });
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const allPaymentMethods = [
    { id: 'Bar', label: 'Bar' },
    { id: 'Überweisung', label: 'Überweisung' },
    { id: 'PayPal', label: 'PayPal' },
    { id: 'Sonstiges', label: 'Sonstiges' },
  ];

  function togglePayment(id) {
    setPaymentMethods((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'image') setImgError(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function setCategory(cat) {
    setFormData((prev) => ({ ...prev, category: cat }));
  }

  function setPrice(p) {
    setFormData((prev) => ({ ...prev, price: p }));
  }

  const filledFields = [
    formData.title,
    formData.price,
    formData.location,
    formData.category,
    formData.description,
  ].filter(Boolean).length;
  const progress = Math.round((filledFields / 5) * 100);
  const previewImage =
    !imgError && formData.image
      ? formData.image
      : getFallbackImage(formData.category || 'Sonstiges');

  const categoryIcons = {
    Werkzeug: '🔧',
    Technik: '💻',
    'Outdoor & Sport': '⛺',
    'Foto & Technik': '📷',
    'Party & Events': '🎉',
    Musik: '🎸',
    'Bücher & Uni': '📚',
    Transport: '🚲',
    Gaming: '🎮',
    Sonstiges: '📦',
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
      addToast('Bitte logge dich zuerst ein.', 'error');
      goTo('login');
      return;
    }
    if (
      !formData.title.trim() ||
      !formData.price.trim() ||
      !formData.location.trim() ||
      !formData.category.trim() ||
      !formData.description.trim()
    ) {
      addToast('Bitte fülle alle Pflichtfelder aus.', 'error');
      return;
    }
    setSubmitting(true);
    const ok = await onAddListing({
      title: formData.title.trim(),
      price: formData.price.trim(),
      location: formData.location.trim(),
      image: formData.image.trim() || getFallbackImage(formData.category.trim()),
      images: extraImages,
      category: formData.category.trim(),
      description: formData.description.trim(),
      userId: currentUser.id,
      ownerName: currentUser.name || 'Ria Mitglied',
      rating: 5.0,
      reviews: 0,
      featured: false,
      status: 'aktiv',
      kaution: formData.kaution.trim(),
      plz: formData.plz.trim(),
      paymentMethods,
    });
    setSubmitting(false);
    if (ok !== false) goTo('listings');
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.45rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: C.forest,
    letterSpacing: '0.01em',
  };
  const sectionStyle = {
    background: 'white',
    borderRadius: 20,
    padding: '1.5rem',
    border: `1px solid ${C.line}`,
    boxShadow: '0 4px 20px rgba(28,58,46,0.05)',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => goTo('listings')}
          style={{
            background: 'white',
            color: C.forest,
            padding: '0.6rem 1rem',
            borderRadius: 12,
            border: `1px solid ${C.line}`,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}
        >
          ← Zurück
        </button>
        <div style={{ marginBottom: '2rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: C.sage,
              fontWeight: 700,
              marginBottom: '0.4rem',
            }}
          >
            Neues Inserat
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: C.forest,
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Was möchtest du verleihen?
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 600 }}>
              {filledFields} von 5 Feldern ausgefüllt
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                color: progress === 100 ? C.sage : C.muted,
                fontWeight: 700,
              }}
            >
              {progress}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: C.line, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                background:
                  progress === 100
                    ? `linear-gradient(90deg, ${C.sage}, ${C.forest})`
                    : `linear-gradient(90deg, ${C.terra}, #E8845A)`,
                width: `${progress}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Main 2-col layout */}
        <div
          className="ria-create-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left: Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Title */}
            <div style={sectionStyle}>
              <label htmlFor="create-title" style={labelStyle}>
                Titel des Inserats{' '}
                <span aria-hidden="true" style={{ color: C.terra }}>
                  *
                </span>
              </label>
              <input
                id="create-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="z. B. Campingzelt, Kamera, E-Roller ..."
                aria-required="true"
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={{ ...inputBaseStyle, fontSize: '1.05rem', fontWeight: 600 }}
              />
            </div>

            {/* Category chips */}
            <div style={sectionStyle}>
              <label style={labelStyle} id="category-label">
                Kategorie{' '}
                <span aria-hidden="true" style={{ color: C.terra }}>
                  *
                </span>
              </label>
              <div
                role="group"
                aria-labelledby="category-label"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
              >
                {allCategoryNames.map((cat) => {
                  const active = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={active}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: 999,
                        border: active ? `2px solid ${C.forest}` : `1px solid ${C.line}`,
                        background: active ? C.forest : 'white',
                        color: active ? 'white' : C.ink,
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span aria-hidden="true">{categoryIcons[cat]}</span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + Location */}
            <div style={sectionStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="create-price" style={labelStyle}>
                    Preis{' '}
                    <span aria-hidden="true" style={{ color: C.terra }}>
                      *
                    </span>
                  </label>
                  <input
                    id="create-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="z. B. 8€ / Tag"
                    aria-required="true"
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={{ ...inputBaseStyle, fontWeight: 700 }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      marginTop: '0.6rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {['3€ / Tag', '5€ / Tag', '8€ / Tag', '15€ / Tag'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrice(p)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 999,
                          border: `1px solid ${C.line}`,
                          background: formData.price === p ? C.terra : 'white',
                          color: formData.price === p ? 'white' : C.muted,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label htmlFor="create-location" style={labelStyle}>
                      Ort{' '}
                      <span aria-hidden="true" style={{ color: C.terra }}>
                        *
                      </span>
                    </label>
                    <input
                      id="create-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Stadt / Stadtteil"
                      aria-required="true"
                      onFocus={applyInputFocus}
                      onBlur={resetInputFocus}
                      style={inputBaseStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="create-plz" style={labelStyle}>
                      PLZ
                    </label>
                    <input
                      id="create-plz"
                      name="plz"
                      value={formData.plz}
                      onChange={handleChange}
                      placeholder="33098"
                      maxLength={5}
                      onFocus={applyInputFocus}
                      onBlur={resetInputFocus}
                      style={inputBaseStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kaution + Zahlungsarten */}
            <div style={sectionStyle}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label htmlFor="create-kaution" style={labelStyle}>
                    Kaution <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="create-kaution"
                    name="kaution"
                    value={formData.kaution}
                    onChange={handleChange}
                    placeholder="z. B. 50 €"
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={{ ...inputBaseStyle, fontWeight: 600 }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      marginTop: '0.6rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {['Keine', '20 €', '50 €', '100 €'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, kaution: k === 'Keine' ? '' : k }))
                        }
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 999,
                          border: `1px solid ${C.line}`,
                          background: (k === 'Keine' ? !formData.kaution : formData.kaution === k)
                            ? C.terra
                            : 'white',
                          color: (k === 'Keine' ? !formData.kaution : formData.kaution === k)
                            ? 'white'
                            : C.muted,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Zahlung akzeptiert</label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginTop: '0.1rem',
                    }}
                  >
                    {allPaymentMethods.map(({ id, label }) => {
                      const active = paymentMethods.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePayment(id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: 999,
                            border: active ? `2px solid ${C.forest}` : `1px solid ${C.line}`,
                            background: active ? C.forest : 'white',
                            color: active ? 'white' : C.ink,
                            fontWeight: active ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={sectionStyle}>
              <label htmlFor="create-description" style={labelStyle}>
                Beschreibung{' '}
                <span aria-hidden="true" style={{ color: C.terra }}>
                  *
                </span>
              </label>
              <textarea
                id="create-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Kurz den Zustand beschreiben, was dabei ist und ob Abholung oder Übergabe vor Ort möglich ist..."
                rows={5}
                aria-required="true"
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.65 }}
              />
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.78rem',
                  color: formData.description.length > 400 ? C.terra : C.muted,
                  marginTop: '0.4rem',
                }}
              >
                {formData.description.length} Zeichen
              </div>
            </div>

            {/* Image Upload + URL */}
            <div style={sectionStyle}>
              <label style={labelStyle}>
                Bild <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
              </label>

              {/* File upload button */}
              <div
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}
              >
                <label
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 12,
                    background: C.sageLight,
                    color: C.forest,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    border: `1px solid ${C.line}`,
                    display: 'inline-block',
                  }}
                >
                  {uploading ? 'Wird hochgeladen...' : 'Bild auswählen'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        addToast('Bild zu groß (max. 5 MB)', 'error');
                        return;
                      }
                      setUploading(true);
                      const ext = file.name.split('.').pop().toLowerCase();
                      const path = `public/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage
                        .from('listing-images')
                        .upload(path, file, { upsert: true });
                      if (error) {
                        addToast('Upload fehlgeschlagen: ' + error.message, 'error');
                        setUploading(false);
                        return;
                      }
                      const { data: urlData } = supabase.storage
                        .from('listing-images')
                        .getPublicUrl(path);
                      setFormData((prev) => ({ ...prev, image: urlData.publicUrl }));
                      setImgError(false);
                      setUploading(false);
                    }}
                  />
                </label>
                {formData.image && !imgError && (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={formData.image}
                      alt="Vorschau"
                      style={{
                        height: 60,
                        width: 80,
                        objectFit: 'cover',
                        borderRadius: 10,
                        border: `1px solid ${C.line}`,
                      }}
                      onError={() => setImgError(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: '' }))}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: C.terra,
                        color: 'white',
                        border: 'none',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p
                style={{
                  margin: '0.6rem 0 0',
                  fontSize: '0.8rem',
                  color: C.muted,
                  lineHeight: 1.5,
                }}
              >
                Kein Bild? Wir nutzen automatisch ein Kategoriebild.
              </p>
            </div>

            {/* Extra images */}
            <div style={sectionStyle}>
              <label style={labelStyle}>
                Weitere Bilder <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
              </label>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 12,
                  background: C.sageLight,
                  color: C.forest,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  border: `1px solid ${C.line}`,
                  marginBottom: '0.75rem',
                }}
              >
                + Weiteres Bild hochladen
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      addToast('Bild zu groß (max. 5 MB)', 'error');
                      return;
                    }
                    const ext = file.name.split('.').pop().toLowerCase();
                    const path = `public/${Date.now()}_extra.${ext}`;
                    const { error } = await supabase.storage
                      .from('listing-images')
                      .upload(path, file, { upsert: true });
                    if (error) {
                      addToast('Upload fehlgeschlagen: ' + error.message, 'error');
                      return;
                    }
                    const { data: urlData } = supabase.storage
                      .from('listing-images')
                      .getPublicUrl(path);
                    setExtraImages((prev) => [...prev, urlData.publicUrl]);
                  }}
                />
              </label>
              {extraImages.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {extraImages.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: 72,
                          height: 58,
                          objectFit: 'cover',
                          borderRadius: 10,
                          border: `1px solid ${C.line}`,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setExtraImages((prev) => prev.filter((_, j) => j !== i))}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: C.terra,
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || uploading}
              style={{
                background:
                  progress === 100
                    ? 'linear-gradient(135deg, #163126, #1C3A2E)'
                    : 'linear-gradient(135deg, #C4714A, #A95A3A)',
                color: 'white',
                padding: '1.1rem 1.5rem',
                borderRadius: 16,
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: submitting || uploading ? 'not-allowed' : 'pointer',
                opacity: submitting || uploading ? 0.7 : 1,
                boxShadow:
                  progress === 100
                    ? '0 14px 34px rgba(28,58,46,0.28)'
                    : '0 14px 34px rgba(196,113,74,0.28)',
                transition: 'all 0.3s ease',
                letterSpacing: '-0.01em',
              }}
            >
              {submitting
                ? 'Wird gespeichert…'
                : progress === 100
                  ? 'Inserat jetzt veröffentlichen'
                  : 'Inserat veröffentlichen'}
            </button>
          </form>

          {/* Right: Live Preview */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: C.sage,
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              Vorschau
            </p>
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                overflow: 'hidden',
                border: `1px solid ${C.line}`,
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  height: 220,
                  background: C.sageLight,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={previewImage}
                  alt="Vorschau"
                  onError={() => setImgError(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'opacity 0.3s ease',
                  }}
                />
                {formData.category && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(255,255,255,0.95)',
                      color: C.forest,
                      padding: '0.35rem 0.75rem',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    {categoryIcons[formData.category]} {formData.category}
                  </div>
                )}
              </div>
              <div style={{ padding: '1.4rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3 style={{ color: C.forest, margin: 0, fontSize: '1.15rem', lineHeight: 1.3 }}>
                    {formData.title || (
                      <span style={{ color: C.muted, fontStyle: 'italic', fontWeight: 400 }}>
                        Dein Titel...
                      </span>
                    )}
                  </h3>
                  <span
                    style={{
                      color: C.terra,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      fontSize: '1rem',
                    }}
                  >
                    {formData.price || (
                      <span style={{ color: C.muted, fontStyle: 'italic', fontWeight: 400 }}>
                        Preis
                      </span>
                    )}
                  </span>
                </div>
                <p style={{ color: C.muted, margin: '0 0 0.75rem', fontSize: '0.88rem' }}>
                  {formData.location || 'Ort'}
                </p>
                <p
                  style={{
                    color: C.ink,
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    margin: '0 0 1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {formData.description || (
                    <span style={{ color: C.muted, fontStyle: 'italic' }}>
                      Deine Beschreibung erscheint hier...
                    </span>
                  )}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${C.line}`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: C.muted }}>
                    {currentUser?.name || 'Dein Name'}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.82rem',
                      color: C.gold,
                      fontWeight: 700,
                    }}
                  >
                    ★ 5.0
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div
              style={{
                marginTop: '1.25rem',
                background: 'white',
                borderRadius: 18,
                padding: '1.25rem',
                border: `1px solid ${C.line}`,
              }}
            >
              <p
                style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: C.forest,
                }}
              >
                Checkliste
              </p>
              {[
                ['Titel', formData.title],
                ['Kategorie', formData.category],
                ['Preis', formData.price],
                ['Ort', formData.location],
                ['Beschreibung', formData.description],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${val ? C.sage : C.line}`,
                      background: val ? C.sage : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {val && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <polyline
                          points="1.5,5.5 4,8 8.5,2"
                          stroke="white"
                          strokeWidth="1.8"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: val ? C.forest : C.muted,
                      fontWeight: val ? 600 : 400,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
