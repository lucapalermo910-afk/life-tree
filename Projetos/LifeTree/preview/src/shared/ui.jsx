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

// Aceita tanto "245.90" (ponto-decimal, já testado/relado em toda a base) quanto o padrão
// brasileiro de milhar ("500.000" → 500000, "1.234.567,89" → 1234567.89) — achado 29/08/2026:
// usuário reportou não conseguir ajustar a Meta de IF do Yesod; causa raiz era digitar
// "500.000" pra dizer "500 mil" e o campo salvar `Number("500.000")` = 500 (ponto = decimal,
// zeros viram casas decimais, sem aviso nenhum). Heurística: se tem vírgula, ela é o separador
// decimal e todo "." antes dela é milhar (removido); sem vírgula, um "." com exatamente 3
// dígitos depois (e nada de decimal de moeda tem 3 casas) é tratado como milhar — só 1-2
// dígitos depois do único "." continua sendo decimal, preservando o caso já testado "245.90".
export function parseBRNumber(raw) {
  if (raw.includes(",")) {
    const [intPart, decPart] = raw.split(",");
    return Number(intPart.replace(/\./g, "") + "." + (decPart || ""));
  }
  const dotGroups = raw.split(".");
  if (dotGroups.length > 1 && dotGroups[dotGroups.length - 1].length === 3) {
    return Number(dotGroups.join(""));
  }
  return Number(raw);
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
          if (!/^-?[\d.]*,?\d*$/.test(raw)) return;
          setText(raw);
          if (raw === "" || raw === "-" || raw === "." || raw === ",") { onChange(0); return; }
          const n = parseBRNumber(raw);
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

// GoalCard/PlanoCard — genéricos, movidos do mockup de Geburah (geburah/ObjetivosTab.jsx,
// descartado em 29/08/2026 na revisão de arquitetura do objetivo+plano com IA — ver
// C:\Users\mcrel\.claude\plans\majestic-roaming-umbrella.md) pra virar reaproveitável pelos
// módulos que entrarem no motor genérico (Yesod primeiro). Mesmo motivo do resto deste
// arquivo: um componente só, não uma cópia por módulo.

function CheckIcon({ color = "currentColor", size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function PlusIcon({ color = "currentColor", size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Card de resumo do objetivo — % + gauge, clique abre o detalhe. Visual copiado 1:1 do card
// da Meta de Independência Financeira do Yesod (padrão que o usuário pediu explicitamente
// pra generalizar, 29/08/2026) — `statLine` é livre pra caber tanto o caso com métrica real
// ("R$X de R$Y") quanto o caso sem métrica (% vem dos passos do plano concluídos).
export function GoalCard({ C, accent = "#818cf8", label, pct, statLine, onClick }) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default", background: "linear-gradient(135deg," + accent + "22," + accent + "06)", border: "1px solid " + accent + "44", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: accent, marginBottom: 2 }}>{p}%</div>
      {statLine && <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{statLine}</div>}
      <div style={{ height: 10, background: C.b1, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: p + "%", background: "linear-gradient(90deg," + accent + ",#06b6d4)", borderRadius: 99 }} />
      </div>
    </div>
  );
}

// Linha de texto editável inline (passo do plano ou item de impacto) — input sem borda
// visível que parece texto estático até o usuário tocar nele, com um × pra apagar a linha.
// Linha editável (06/11/2026): era um <input> de uma linha só, e textos longos do Coach
// ficavam cortados. Agora é uma textarea que cresce com o conteúdo.
function EditableRow({ C, value, onChange, onRemove, strike, dim }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(1, Math.ceil((value || "").length / 38))}
        style={{
          flex: 1, minWidth: 0, resize: "none", border: "1px solid " + C.b1, borderRadius: 8, background: C.surface || "transparent",
          outline: "none", padding: "6px 8px", fontSize: 13, lineHeight: 1.45, fontFamily: "inherit",
          color: dim ? C.muted : C.text, textDecoration: strike ? "line-through" : "none", fieldSizing: "content",
        }}
      />
      <button onClick={onRemove} aria-label="Remover linha" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, opacity: 0.6, flexShrink: 0 }}>
        <XIcon color={C.muted} size={12} />
      </button>
    </div>
  );
}
function AddRowBtn({ C, onClick, label, accent = "#818cf8" }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 4, color: accent, fontSize: 10, fontWeight: 700 }}>
      <PlusIcon color={accent} size={10} /> {label}
    </button>
  );
}

// Plano gerado pelo Coach — passo a passo + impacto positivo/negativo, tudo editável.
// `onUpdate` recebe um updater (prev => next), mesma assinatura de um setState — quem chama
// decide se aplica direto (plano ainda em confirmação, ex: `pendingCoachAction`) ou dentro de
// uma lista já persistida (objetivo salvo) — ver usos em App.jsx/yesod/ObjetivosTab.jsx.
// Separa "06/11 a 19/11/2026: adaptação com 4 sessões" em período + texto, pra mostrar o
// período em destaque. Só quando o trecho antes dos ":" é curto (parece um rótulo).
function partesDoPasso(t) {
  const m = String(t || "").match(/^([^:]{2,40}):\s+([\s\S]+)$/);
  const maiuscula = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  return m ? { periodo: m[1].trim(), texto: maiuscula(m[2].trim()) } : { periodo: null, texto: String(t || "") };
}

// Plano gerado pelo Coach — descrição, passo a passo e impactos.
// `onUpdate` recebe um updater (prev => next), mesma assinatura de um setState — quem chama
// decide se aplica direto (plano ainda em confirmação, ex: `pendingCoachAction`) ou dentro de
// uma lista já persistida (objetivo salvo) — ver usos em App.jsx/yesod/ObjetivosTab.jsx.
// 06/11/2026: leitura por padrão (texto completo, com quebra de linha, período do passo em
// destaque, impactos empilhados) e edição só depois de tocar em "Editar". Antes era tudo
// <input> de uma linha, em duas colunas, e os textos do Coach ficavam cortados.
// `somenteLeitura` esconde o botão Editar (ex: espelho no Kether).
export function PlanoCard({ C, plano, onToggleStep, onUpdate, accent = "#818cf8", descricao = null, somenteLeitura = false }) {
  const [editando, setEditando] = useState(false);
  const editStep = (id, title) => onUpdate((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, title } : s)) }));
  const removeStep = (id) => onUpdate((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) }));
  const addStep = () => onUpdate((p) => ({ ...p, steps: [...p.steps, { id: "st" + Date.now(), title: "", done: false }] }));

  const editImpacto = (kind, i, text) => onUpdate((p) => ({ ...p, [kind]: p[kind].map((t, idx) => (idx === i ? text : t)) }));
  const removeImpacto = (kind, i) => onUpdate((p) => ({ ...p, [kind]: p[kind].filter((_, idx) => idx !== i) }));
  const addImpacto = (kind) => onUpdate((p) => ({ ...p, [kind]: [...p[kind], ""] }));

  const titulo = (texto, cor = C.muted) => (
    <div style={{ fontSize: 10, color: cor, fontWeight: 800, letterSpacing: 1, margin: "0 0 8px" }}>{texto}</div>
  );
  const impactos = (kind, rotulo, cor, marca) => (
    <div style={{ marginTop: 16 }}>
      {titulo(rotulo, cor)}
      {plano[kind].map((t, i) => editando ? (
        <div key={i} style={{ marginBottom: 6 }}>
          <EditableRow C={C} value={t} onChange={(v) => editImpacto(kind, i, v)} onRemove={() => removeImpacto(kind, i)} />
        </div>
      ) : (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.45, color: C.text }}>
          <span style={{ color: cor, fontWeight: 900, flexShrink: 0, width: 14, textAlign: "center" }}>{marca}</span>
          <span style={{ overflowWrap: "anywhere" }}>{t}</span>
        </div>
      ))}
      {editando && <AddRowBtn C={C} onClick={() => addImpacto(kind)} label="Adicionar" accent={accent} />}
    </div>
  );

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 14, padding: 16 }}>
      {descricao && (
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid " + C.b1 }}>
          {titulo("O OBJETIVO")}
          <div style={{ fontSize: 13, lineHeight: 1.5, color: C.text, overflowWrap: "anywhere" }}>{descricao}</div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        {titulo("PASSO A PASSO")}
        {!somenteLeitura && (
          <button onClick={() => setEditando((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0 8px", color: accent, fontSize: 11, fontWeight: 800 }}>
            {editando ? "Concluir" : "Editar"}
          </button>
        )}
      </div>

      {plano.steps.map((s, i) => {
        const { periodo, texto } = partesDoPasso(s.title);
        const ultimo = i === plano.steps.length - 1;
        return (
          <div key={s.id} style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => onToggleStep(s.id)}
                aria-label={(s.done ? "Desmarcar" : "Marcar") + " passo " + (i + 1)}
                style={{
                  width: 26, height: 26, borderRadius: 99, flexShrink: 0, cursor: "pointer", padding: 0,
                  border: "2px solid " + (s.done ? "#10b981" : accent), background: s.done ? "#10b981" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontSize: 11, fontWeight: 900,
                }}
              >
                {s.done ? <CheckIcon color="#fff" size={12} /> : i + 1}
              </button>
              {!ultimo && <div style={{ width: 2, flex: 1, minHeight: 12, background: C.b1, margin: "3px 0" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: ultimo ? 0 : 14 }}>
              {editando ? (
                <EditableRow C={C} value={s.title} onChange={(v) => editStep(s.id, v)} onRemove={() => removeStep(s.id)} strike={s.done} dim={s.done} />
              ) : (
                <>
                  {periodo && <div style={{ fontSize: 11, fontWeight: 800, color: s.done ? C.muted : accent, marginTop: 4, marginBottom: 2 }}>{periodo}</div>}
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none",
                    overflowWrap: "anywhere", marginTop: periodo ? 0 : 4 }}>{texto}</div>
                </>
              )}
            </div>
          </div>
        );
      })}
      {editando && <AddRowBtn C={C} onClick={addStep} label="Adicionar passo" accent={accent} />}

      {impactos("impactoPositivo", "IMPACTO POSITIVO", "#10b981", "+")}
      {impactos("impactoNegativo", "PONTOS DE ATENÇÃO", "#ef4444", "!")}
    </div>
  );
}
