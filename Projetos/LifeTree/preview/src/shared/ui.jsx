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
// onDelete (06/11/2026, pedido do usuário): × discreto no canto; o toque no cartão abre o
// plano, e no plano cada item se edita com um toque. `onEdit` não é mais usado.
export function GoalCard({ C, accent = "#818cf8", label, pct, statLine, onClick, onDelete, rotulo = null, titulo = null }) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div onClick={onClick} aria-label={label}
      style={{ cursor: onClick ? "pointer" : "default", background: "linear-gradient(135deg," + accent + "22," + accent + "06)", border: "1px solid " + accent + "44", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{(rotulo || label).toUpperCase()}</div>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label={"Apagar objetivo " + label}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, opacity: 0.6, flexShrink: 0 }}>
            <XIcon color={C.muted} size={14} />
          </button>
        )}
      </div>
      {pct == null ? (
        // Só planejamento (06/11/2026): sem percentual até o acompanhamento ser ligado.
        <>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: "2px 0 4px", lineHeight: 1.25 }}>{titulo || label}</div>
          {statLine && <div style={{ fontSize: 12, color: C.muted }}>{statLine}</div>}
        </>
      ) : (
        <>
          <div style={{ fontSize: 28, fontWeight: 900, color: accent, marginBottom: 2 }}>{p}%</div>
          {statLine && <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{statLine}</div>}
          <div style={{ height: 10, background: C.b1, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: p + "%", background: "linear-gradient(90deg," + accent + ",#06b6d4)", borderRadius: 99 }} />
          </div>
        </>
      )}
    </div>
  );
}

// Linha de texto editável inline (passo do plano ou item de impacto) — input sem borda
// visível que parece texto estático até o usuário tocar nele, com um × pra apagar a linha.
// Linha editável (06/11/2026): era um <input> de uma linha só, e textos longos do Coach
// ficavam cortados. Agora é uma textarea que cresce com o conteúdo.
export function EditableRow({ C, value, onChange, onRemove, strike, dim, autoFocus }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus}
        rows={Math.max(1, Math.ceil((value || "").length / 38))}
        style={{
          flex: 1, minWidth: 0, resize: "none", border: "1px solid " + C.b1, borderRadius: 8, background: C.surface || "transparent",
          outline: "none", padding: "6px 8px", fontSize: 13, lineHeight: 1.45, fontFamily: "inherit",
          color: dim ? C.muted : C.text, textDecoration: strike ? "line-through" : "none", fieldSizing: "content",
        }}
      />
      {onRemove && (
        <button onClick={onRemove} aria-label="Remover linha" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, opacity: 0.6, flexShrink: 0 }}>
          <XIcon color={C.muted} size={12} />
        </button>
      )}
    </div>
  );
}
export function AddRowBtn({ C, onClick, label, accent = "#818cf8" }) {
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

// Plano gerado pelo Coach — descrição, metas, passo a passo e impactos.
// `onUpdate` recebe um updater (prev => next), mesma assinatura de um setState — quem chama
// decide se aplica direto (plano ainda em confirmação, ex: `pendingCoachAction`) ou dentro de
// uma lista já persistida (objetivo salvo) — ver usos em App.jsx/yesod/ObjetivosTab.jsx.
// Leitura por padrão: texto completo, com quebra de linha, período do passo em destaque,
// impactos empilhados. `somenteLeitura` desliga a edição (ex: espelho no Kether).
// Edição (06/11/2026, pedido do usuário): tocar num item já abre a edição só dele, com
// ✓ (concluir) e × (apagar) no canto. Sem botão "Editar", lápis ou menu.
//   chaves: "cabecalho" (nome, prazo, objetivo) · "meta:<chave>" · "passo:<id>" · "imp:<tipo>:<i>".
// `metas`: lista [{ chave, titulo, render(editando), onApagar }] (ou um nó, só leitura).
// Planejamento (06/11/2026): `tituloPassos` (ex: "LINHA DO TEMPO"), `renderDetalhe(passo, i)` →
// conteúdo extra da fase (meta da semana, tarefas, revisão, marco), `renderEditor(passo, patch)`
// → editor próprio da fase, `passoFeito(passo)` → concluído derivado (ex: todas as tarefas
// feitas no Controle). Sem `onToggleStep`, o círculo só mostra o estado. `plano.rotina` =
// lista de hábitos, se existir.
// `editando`/`onEditando` (booleanos): quem chama pode abrir o cabeçalho em edição (ex:
// "Editar" vindo do Desejo) e fica sabendo quando algum item está em edição.
export function PlanoCard({ C, plano, onToggleStep, onUpdate, accent = "#818cf8", descricao = null, somenteLeitura = false,
  nome = null, onNome = null, onDescricao = null, prazo = null, onPrazo = null, metas = null, editando: editandoExt, onEditando,
  tituloPassos = "PASSO A PASSO", renderDetalhe = null, renderEditor = null, passoFeito = null }) {
  const [chave, setChaveInt] = useState(editandoExt ? "cabecalho" : null);
  const setChave = (k) => { setChaveInt(k); if (onEditando) onEditando(!!k); };
  // Quem chama abriu/fechou a edição: ajusta durante o render.
  const [extAnterior, setExtAnterior] = useState(editandoExt);
  if (editandoExt !== extAnterior) {
    setExtAnterior(editandoExt);
    if (editandoExt) setChaveInt((k) => k || "cabecalho");
    else if (editandoExt === false) setChaveInt(null);
  }
  const podeEditar = !somenteLeitura;
  const tocar = (k) => (podeEditar ? { onClick: () => setChave(k), style: { cursor: "pointer" } } : {});

  const editStep = (id, title) => onUpdate((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, title } : s)) }));
  const patchStep = (id, patch) => onUpdate((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const removeStep = (id) => { onUpdate((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) })); setChave(null); };
  const addStep = () => {
    const novo = { id: "st" + Date.now(), title: "", done: false };
    onUpdate((p) => ({ ...p, steps: [...p.steps, novo] }));
    setChave("passo:" + novo.id);
  };
  const editImpacto = (kind, i, text) => onUpdate((p) => ({ ...p, [kind]: p[kind].map((t, idx) => (idx === i ? text : t)) }));
  const removeImpacto = (kind, i) => { onUpdate((p) => ({ ...p, [kind]: p[kind].filter((_, idx) => idx !== i) })); setChave(null); };
  const addImpacto = (kind) => { const n = plano[kind].length; onUpdate((p) => ({ ...p, [kind]: [...p[kind], ""] })); setChave("imp:" + kind + ":" + n); };

  const titulo = (texto, cor = C.muted) => (
    <div style={{ fontSize: 10, color: cor, fontWeight: 800, letterSpacing: 1, margin: "0 0 8px" }}>{texto}</div>
  );
  const icone = (rotulo, fn, el, cor) => (
    <button onClick={(e) => { e.stopPropagation(); fn(); }} aria-label={rotulo}
      style={{ width: 28, height: 28, borderRadius: 99, border: "none", background: cor, cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{el}</button>
  );
  // Caixa de edição: conteúdo + ✓ (concluir) e, se houver, × (apagar) no canto.
  const caixa = (conteudo, onApagar, rotuloApagar = "Apagar") => (
    <div style={{ border: "1.5px solid " + accent + "66", borderRadius: 12, padding: 10, background: accent + "08" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 6 }}>
        {onApagar && icone(rotuloApagar, onApagar, <XIcon color="#ef4444" size={12} />, "#ef444418")}
        {icone("Concluir", () => setChave(null), <CheckIcon color="#fff" size={12} />, accent)}
      </div>
      {conteudo}
    </div>
  );
  const campoTexto = { width: "100%", boxSizing: "border-box", border: "1px solid " + C.b1, borderRadius: 8, background: C.surface || "transparent", outline: "none",
    padding: "8px 10px", fontSize: 14, fontFamily: "inherit", color: C.text };
  const adicionar = (label, fn) => podeEditar && <AddRowBtn C={C} onClick={fn} label={label} accent={accent} />;

  const temCabecalho = podeEditar && (onNome || onPrazo || onDescricao);
  const listaMetas = Array.isArray(metas) ? metas.filter(Boolean) : null;

  const lista = (kind, rotulo, cor, marca) => (
    <div style={{ marginTop: 16 }}>
      {titulo(rotulo, cor)}
      {plano[kind].map((t, i) => chave === "imp:" + kind + ":" + i ? (
        <div key={i} style={{ marginBottom: 8 }}>
          {caixa(<EditableRow C={C} value={t} onChange={(v) => editImpacto(kind, i, v)} autoFocus />, () => removeImpacto(kind, i))}
        </div>
      ) : (
        <div key={i} {...tocar("imp:" + kind + ":" + i)}
          style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.45, color: C.text, cursor: podeEditar ? "pointer" : "default" }}>
          <span style={{ color: cor, fontWeight: 900, flexShrink: 0, width: 14, textAlign: "center" }}>{marca}</span>
          <span style={{ overflowWrap: "anywhere" }}>{t || <em style={{ color: C.muted }}>vazio</em>}</span>
        </div>
      ))}
      {adicionar("Adicionar", () => addImpacto(kind))}
    </div>
  );

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 14, padding: 16 }}>
      {chave === "cabecalho" ? (
        <div style={{ marginBottom: 16 }}>
          {caixa(
            <>
              {onNome && (<div style={{ marginBottom: 12 }}>{titulo("NOME")}
                <input value={nome || ""} onChange={(e) => onNome(e.target.value)} placeholder="Nome curto, ex: Bater 75 kg" style={{ ...campoTexto, fontWeight: 700 }} /></div>)}
              {onPrazo && (<div style={{ marginBottom: 12 }}>{titulo("PRAZO")}
                <input type="date" value={prazo || ""} onChange={(e) => onPrazo(e.target.value || null)} style={{ ...campoTexto, width: "auto" }} /></div>)}
              {onDescricao && (<div>{titulo("O OBJETIVO")}
                <textarea value={descricao || ""} onChange={(e) => onDescricao(e.target.value)} rows={2} placeholder="Resultado + data, ex: Chegar a 75 kg em 28/02/2027"
                  style={{ ...campoTexto, fontSize: 13, lineHeight: 1.45, resize: "none", fieldSizing: "content" }} /></div>)}
            </>
          )}
        </div>
      ) : (descricao || temCabecalho) && (
        <div {...(temCabecalho ? tocar("cabecalho") : {})}
          style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid " + C.b1, cursor: temCabecalho ? "pointer" : "default" }}>
          {titulo("O OBJETIVO")}
          <div style={{ fontSize: 13, lineHeight: 1.5, color: descricao ? C.text : C.muted, overflowWrap: "anywhere" }}>{descricao || "Toque para escrever: resultado + data"}</div>
        </div>
      )}

      {listaMetas ? listaMetas.length > 0 && (
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {listaMetas.map((m) => chave === "meta:" + m.chave ? (
            <div key={m.chave}>{caixa(m.render(true), m.onApagar || null, "Apagar " + m.titulo.toLowerCase())}</div>
          ) : (
            <div key={m.chave} {...tocar("meta:" + m.chave)} aria-label={m.titulo}>{m.render(false)}</div>
          ))}
        </div>
      ) : metas && (
        <div style={{ marginBottom: 16 }}>{typeof metas === "function" ? metas(false) : metas}</div>
      )}

      {titulo(tituloPassos)}
      {plano.steps.map((s, i) => {
        const { periodo, texto } = partesDoPasso(s.title);
        const ultimo = i === plano.steps.length - 1;
        const emEdicao = chave === "passo:" + s.id;
        const feito = passoFeito ? passoFeito(s) : s.done;
        return (
          <div key={s.id} style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={onToggleStep ? () => onToggleStep(s.id) : undefined} disabled={!onToggleStep}
                aria-label={onToggleStep ? (feito ? "Desmarcar" : "Marcar") + " passo " + (i + 1) : "Fase " + (i + 1) + (feito ? " concluída" : "")}
                style={{
                  width: 26, height: 26, borderRadius: 99, flexShrink: 0, cursor: onToggleStep ? "pointer" : "default", padding: 0,
                  border: "2px solid " + (feito ? "#10b981" : accent), background: feito ? "#10b981" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontSize: 11, fontWeight: 900,
                }}
              >
                {feito ? <CheckIcon color="#fff" size={12} /> : i + 1}
              </button>
              {!ultimo && <div style={{ width: 2, flex: 1, minHeight: 12, background: C.b1, margin: "3px 0" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: ultimo ? 0 : 14 }}>
              {emEdicao ? (
                caixa(renderEditor ? renderEditor(s, (patch) => patchStep(s.id, patch))
                  : <EditableRow C={C} value={s.title} onChange={(v) => editStep(s.id, v)} strike={s.done} dim={s.done} autoFocus />, () => removeStep(s.id), "Apagar passo " + (i + 1))
              ) : (
                <div aria-label={"Passo " + (i + 1)} {...tocar("passo:" + s.id)}>
                  {periodo && <div style={{ fontSize: 11, fontWeight: 800, color: s.done ? C.muted : accent, marginTop: 4, marginBottom: 2 }}>{periodo}</div>}
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: s.done ? C.muted : C.text, textDecoration: s.done && !passoFeito ? "line-through" : "none", fontWeight: renderDetalhe ? 700 : 400,
                    overflowWrap: "anywhere", marginTop: periodo ? 0 : 4 }}>{texto || <em style={{ color: C.muted }}>vazio</em>}</div>
                  {renderDetalhe && renderDetalhe(s, i)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {adicionar("Adicionar passo", addStep)}

      {Array.isArray(plano.rotina) && lista("rotina", "ROTINA", accent, "↻")}
      {lista("impactoPositivo", "IMPACTO POSITIVO", "#10b981", "+")}
      {lista("impactoNegativo", "PONTOS DE ATENÇÃO", "#ef4444", "!")}
    </div>
  );
}
