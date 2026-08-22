import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Kit de UI compartilhado — Sheet/FI/FTA/FS/Card/Bar/Btn/Badge, consolidados em 21/08/2026
// a partir das 7 implementações quase idênticas que existiam por módulo (item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
//
// Comparação prévia achou 2 linhagens visuais quase idênticas, não uma só: Geburah/Hod/
// Tiphareth/Netzach (radius 9px, padding "9px 12px", transição .5s) vs. Chesed/Chokmah/
// Binah (radius 10-11px, padding "10-14px 13-18px", transição .8s cubic-bezier, cursor
// "not-allowed" quando desabilitado, <select> com appearance:none). Escolhida a segunda
// como padrão aqui — mais recente, mais refinada — o que muda visualmente (pouco: raio de
// borda, timing de animação, cursor) os módulos que estavam na primeira linhagem. Nenhuma
// prop funcional foi removida nessa escolha: `wide` (Sheet, só existia no Geburah), `hint`/
// `max`/`step` (FI, só existiam em alguns), `onClick` (Card, ausente em Geburah/Hod/
// Tiphareth) continuam todos disponíveis como opcionais. Bug real achado e corrigido de
// quebra: o `Bar` do Hod não tinha clamp (podia passar de 100% ou ficar negativo) — a
// versão daqui sempre clampa.
//
// Dois jeitos de consumir, sem mudar nenhum call site existente:
// 1. Módulos com ThemeCtx próprio (Geburah/Hod/Tiphareth/Chesed/Netzach/Chokmah/Binah):
//      import { bindThemeContext } from "./shared/uiBind.jsx";
//      const { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);
//    definido uma vez no topo do módulo — os ~100 call sites de cada um continuam
//    `<Sheet .../>`/`<FI .../>` sem C nenhum, exatamente como já eram.
// 2. Módulos que passam C explícito por prop (Yesod, App.jsx): importar direto —
//      import { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } from "./shared/ui.jsx";
//    call sites continuam passando C={C} como já passavam.

function XIcon({ color = "currentColor", size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function Sheet({ C, title, onClose, children, wide }) {
  // Portal pro <body> — escapa do stacking context do wrapper de módulo em App.jsx pra
  // ficar sempre acima do coach bar (ver comentário equivalente que existia em cada módulo).
  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 600 : 430, padding: "0 18px 34px", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "sticky", top: 0, background: C.surface, paddingTop: 12, paddingBottom: 12, zIndex: 1 }}>
          <div style={{ width: 36, height: 4, background: C.b2, borderRadius: 99, margin: "0 auto 14px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -.3, color: C.text }}>{title}</span>
            <button onClick={onClose} style={{ background: C.b1, border: "none", borderRadius: 99, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XIcon color={C.dim} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function FI({ C, label, value, onChange, type = "text", placeholder, min, max, step, hint }) {
  const isNum = type === "number";
  // Inputs decimais precisam de estado de texto próprio: um <input type="number"> nativo
  // reporta e.target.value==="" no estado intermediário "N." (ponto sem dígito seguinte),
  // o que zerava o campo controlado a cada "." digitado. Texto local + type="text" evita isso;
  // onChange continua sempre recebendo um Number, então nenhum call site precisa mudar.
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => { if (!focused) setText(String(value ?? "")); }, [value, focused]);
  return (
    <div style={{ marginBottom: 11 }}>
      {label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700, letterSpacing: .8 }}>{label.toUpperCase()}</div>}
      <input type={isNum ? "text" : type} inputMode={isNum ? "decimal" : undefined} value={isNum ? text : value} placeholder={placeholder} min={min} max={max} step={step}
        onFocus={isNum ? () => setFocused(true) : undefined}
        onBlur={isNum ? () => { setFocused(false); setText(String(value ?? "")); } : undefined}
        onChange={e => {
          if (!isNum) { onChange(e.target.value); return; }
          const raw = e.target.value;
          if (!/^-?\d*\.?\d*$/.test(raw)) return;
          setText(raw);
          if (raw === "" || raw === "-" || raw === ".") { onChange(0); return; }
          const n = Number(raw);
          if (!Number.isNaN(n)) onChange(n);
        }}
        style={{ width: "100%", background: C.bg, border: "1px solid " + C.b2, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      {hint && <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export function FTA({ C, label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 11 }}>
      {label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700, letterSpacing: .8 }}>{label.toUpperCase()}</div>}
      <textarea value={value} placeholder={placeholder} rows={rows} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.bg, border: "1px solid " + C.b2, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );
}

export function FS({ C, label, value, onChange, opts }) {
  return (
    <div style={{ marginBottom: 11 }}>
      {label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700, letterSpacing: .8 }}>{label.toUpperCase()}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.bg, border: "1px solid " + C.b2, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none", appearance: "none" }}>
        {opts.map(o => <option key={o.v} value={o.v} style={{ background: C.surface }}>{o.l}</option>)}
      </select>
    </div>
  );
}

export function Card({ C, children, color, onClick, style: s = {} }) {
  return (
    <div onClick={onClick} style={{ background: C.card, border: "1px solid " + (color ? color + "22" : C.b1), borderRadius: 14, padding: 14, cursor: onClick ? "pointer" : "default", ...s }}>
      {children}
    </div>
  );
}

export function Bar({ C, value, color, height = 5 }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div style={{ height, background: C.b1, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: clamped + "%", background: color, borderRadius: 99, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

export function Btn({ children, onClick, color, sm, outline, full = true, style: s = {}, disabled }) {
  const c = color || "#818cf8";
  return (
    <button disabled={disabled} onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: sm ? "7px 14px" : "12px 18px", borderRadius: 11, cursor: disabled ? "not-allowed" : "pointer", background: outline ? "transparent" : "linear-gradient(135deg," + c + "ee," + c + "88)", border: outline ? "1.5px solid " + c : "none", color: outline ? c : "#fff", fontWeight: 700, fontSize: sm ? 11 : 13, width: full ? "100%" : "auto", opacity: disabled ? .6 : 1, ...s }}>
      {children}
    </button>
  );
}

export function Badge({ label, color = "#818cf8" }) {
  return <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 99, background: color + "22", color, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: .3 }}>{label}</span>;
}
