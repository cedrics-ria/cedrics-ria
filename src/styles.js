import { C, categoryImages } from './constants';

export const inputBaseStyle = {
  width: "100%",
  padding: "0.95rem 1rem",
  borderRadius: 16,
  border: "1px solid rgba(28,58,46,0.15)",
  fontSize: "1rem",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(6px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
  outline: "none",
};

export const primaryButtonStyle = {
  background: "linear-gradient(135deg, #C4714A, #A95A3A)",
  color: "white",
  padding: "1rem 1.2rem",
  borderRadius: 14,
  border: "none",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 14px 34px rgba(196,113,74,0.28)",
};

export function applyInputFocus(event) {
  event.target.style.border = `1px solid ${C.forest}`;
  event.target.style.boxShadow = "0 0 0 4px rgba(28,58,46,0.08)";
}

export function resetInputFocus(event) {
  event.target.style.border = "1px solid rgba(28,58,46,0.15)";
  event.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.6)";
}

export function getFallbackImage(category) {
  return categoryImages[category] || categoryImages.Sonstiges;
}
