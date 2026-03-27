import { useState } from 'react';
import { C, allCategoryNames } from '../constants';
import { inputBaseStyle, applyInputFocus, resetInputFocus, getFallbackImage } from '../styles';
import { supabase } from '../supabase';

export default function EditListingPage({ listing, onUpdateListing, goTo, currentUser, addToast }) {
  const [formData, setFormData] = useState({
    title: listing?.title || "",
    price: listing?.price || "",
    location: listing?.location || "",
    image: listing?.image || "",
    category: listing?.category || "",
    description: listing?.description || "",
  });
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "image") setImgError(false);
    setFormData((p) => ({ ...p, [name]: value }));
  }

  function setCategory(cat) { setFormData((p) => ({ ...p, category: cat })); }

  const categoryIcons = {
    "Werkzeug": "🔧", "Technik": "💻", "Outdoor & Sport": "⛺", "Foto & Technik": "📷",
    "Party & Events": "🎉", "Musik": "🎸", "Bücher & Uni": "📚", "Transport": "🚲", "Gaming": "🎮", "Sonstiges": "📦"
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim() || !formData.location.trim() || !formData.category.trim() || !formData.description.trim()) {
      addToast("Bitte fülle alle Pflichtfelder aus.", "error"); return;
    }
    await onUpdateListing(listing.id, {
      title: formData.title.trim(), price: formData.price.trim(), location: formData.location.trim(),
      image: formData.image.trim() || getFallbackImage(formData.category.trim()),
      category: formData.category.trim(), description: formData.description.trim(),
    });
    goTo("profile");
  }

  if (!listing) return null;

  const labelStyle = { display: "block", marginBottom: "0.45rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest };
  const sectionStyle = { background: "white", borderRadius: 20, padding: "1.5rem", border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(28,58,46,0.05)" };
  const previewImage = (!imgError && formData.image) ? formData.image : getFallbackImage(formData.category || "Sonstiges");

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "3rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => goTo("profile")} style={{ background: "white", color: C.forest, padding: "0.6rem 1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem" }}>← Zurück zum Profil</button>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.4rem" }}>Inserat bearbeiten</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: C.forest, margin: 0, letterSpacing: "-0.03em" }}>„{listing.title}" bearbeiten</h1>
        </div>

        <div className="ria-create-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem", alignItems: "start" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={sectionStyle}>
              <label style={labelStyle}>Titel <span style={{ color: C.terra }}>*</span></label>
              <input name="title" value={formData.title} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontSize: "1.05rem", fontWeight: 600 }} />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Kategorie <span style={{ color: C.terra }}>*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {allCategoryNames.map((cat) => {
                  const active = formData.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} style={{ padding: "0.5rem 0.85rem", borderRadius: 999, border: active ? `2px solid ${C.forest}` : `1px solid ${C.line}`, background: active ? C.forest : "white", color: active ? "white" : C.ink, fontWeight: active ? 700 : 500, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>{categoryIcons[cat]}</span>{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>Preis <span style={{ color: C.terra }}>*</span></label>
                  <input name="price" value={formData.price} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontWeight: 700 }} />
                </div>
                <div>
                  <label style={labelStyle}>Ort <span style={{ color: C.terra }}>*</span></label>
                  <input name="location" value={formData.location} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Beschreibung <span style={{ color: C.terra }}>*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, resize: "vertical" }} />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Bild-URL</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ padding: "0.65rem 1rem", borderRadius: 12, background: C.sageLight, color: C.forest, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", border: `1px solid ${C.line}` }}>
                  {uploading ? "Lädt..." : "Neues Bild"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { addToast("Bild zu groß (max. 5 MB)", "error"); return; }
                    setUploading(true);
                    const ext = file.name.split(".").pop().toLowerCase();
                    const path = `public/${Date.now()}.${ext}`;
                    const { error } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
                    if (error) { addToast("Upload fehlgeschlagen: " + error.message, "error"); setUploading(false); return; }
                    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
                    setFormData((p) => ({ ...p, image: urlData.publicUrl }));
                    setImgError(false); setUploading(false);
                  }} />
                </label>
                {formData.image && !imgError && <img src={formData.image} alt="" style={{ height: 50, width: 70, objectFit: "cover", borderRadius: 8 }} onError={() => setImgError(true)} />}
              </div>
              <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
            </div>

            <button type="submit" style={{ background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", padding: "1.1rem 1.5rem", borderRadius: 16, border: "none", fontSize: "1.05rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 14px 34px rgba(28,58,46,0.28)" }}>
              Änderungen speichern
            </button>
          </form>

          {/* Preview */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>Vorschau</p>
            <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <div style={{ height: 200, background: C.sageLight }}>
                <img src={previewImage} alt="" onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <h3 style={{ color: C.forest, margin: 0 }}>{formData.title || <span style={{ color: C.muted, fontStyle: "italic", fontWeight: 400 }}>Titel...</span>}</h3>
                  <span style={{ color: C.terra, fontWeight: 800 }}>{formData.price || "Preis"}</span>
                </div>
                <p style={{ color: C.muted, margin: "0 0 0.5rem", fontSize: "0.85rem" }}>{formData.location || "Ort"}</p>
                <p style={{ color: C.ink, fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{formData.description || <span style={{ color: C.muted, fontStyle: "italic" }}>Beschreibung...</span>}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
