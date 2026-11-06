// 05/11/2026: objetivos passam a ser CRIADOS só no Desejo/Kether (pedido do usuário: "o
// objetivo precisa ser criado no desejo e daí aparecer no módulo impactado"). Esta aba mostra,
// acompanha e edita os objetivos de saúde; o botão leva ao Desejo.
// Objetivos do Geburah com plano gerado pelo Coach (04/11/2026). Era um protótipo visual
// (estado local, plano simulado) desde 29/08/2026; agora segue o mesmo motor genérico do Yesod
// (yesod/ObjetivosTab.jsx): "+ Objetivo" manda "Quero criar o objetivo..." pro Coach, que
// mostra o status que já existe, pergunta só o que falta (rotina, local, condicionamento,
// restrições, prazo), devolve um objetivo SMART com marcos e só salva depois da confirmação
// (create_objective → geburahActions.js). Persistido em lifetree_geb_objetivos e espelhado
// read-only no Malkuth (GOAL_ACTIVITY_ADAPTERS).
import { useContext, useEffect, useState } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, GREEN, Btn } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt1, fmtKg } from "./helpers.js";
import { GoalCard, PlanoCard } from "../shared/ui.jsx";
import { MacrosCard } from "../shared/MacrosCard.jsx";

function StatusAtual({ C, pesoHoje, pesoMeta, navyEstimate, trendKg }) {
  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Ico n="scale" size={13} color={ACCENT} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>STATUS ATUAL</span>
      </div>
      <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>
        Antes de perguntar qualquer coisa, o Coach já parte do que a sua base mostra — nada disso
        precisa ser digitado de novo.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: C.bg, borderRadius: 9, padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, marginBottom: 3 }}>PESO ATUAL</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{pesoHoje ? fmtKg(pesoHoje) : "— sem registro"}</div>
          {trendKg != null && trendKg !== 0 && (
            <div style={{ fontSize: 9, color: trendKg < 0 ? GREEN : "#ef4444", marginTop: 2 }}>{trendKg > 0 ? "+" : ""}{fmt1(trendKg)}kg desde o registro anterior</div>
          )}
        </div>
        <div style={{ background: C.bg, borderRadius: 9, padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, marginBottom: 3 }}>% GORDURA (EST.)</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{navyEstimate != null ? fmt1(navyEstimate) + "%" : "— sem medidas"}</div>
          {pesoMeta > 0 && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Meta de peso: {fmtKg(pesoMeta)}</div>}
        </div>
      </div>
    </div>
  );
}

// Linha de texto editável inline (passo ou item de impacto) — input sem borda visível que
// parece texto estático até o usuário tocar nele, com um × pra apagar a linha.


const pctDe = (o) => (o.plano?.steps?.length ? Math.round((o.plano.steps.filter((s) => s.done).length / o.plano.steps.length) * 100) : 0);
const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const diasAte = (iso) => Math.ceil((new Date(iso + "T00:00:00") - new Date(new Date().toDateString())) / 86400000);

function linhaStatus(o) {
  const feitos = o.plano ? o.plano.steps.filter((s) => s.done).length : 0;
  const total = o.plano ? o.plano.steps.length : 0;
  const base = feitos + " de " + total + " marcos";
  if (!o.prazo) return base;
  const d = diasAte(o.prazo);
  return base + " · " + (d >= 0 ? "faltam " + d + " dias (" + dataBR(o.prazo) + ")" : "prazo vencido em " + dataBR(o.prazo));
}

export function ObjetivosTab() {
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { pesoHoje, pesoMeta, navyEstimate, sortedPes, objetivos, setObjetivos, abrirDesejo, objetivoInicial } = g;
  const trendKg = sortedPes && sortedPes.length >= 2 ? sortedPes[sortedPes.length - 1].peso - sortedPes[sortedPes.length - 2].peso : null;

  const [aberto, setAberto] = useState(objetivoInicial || null);
  // Vindo do Desejo: rola até o objetivo aberto.
  useEffect(() => { if (objetivoInicial) document.getElementById("obj-" + objetivoInicial)?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [objetivoInicial]);

  const toggleStep = (id, stepId) =>
    setObjetivos((p) => p.map((o) => (o.id !== id ? o : { ...o, plano: { ...o.plano, steps: o.plano.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) } })));
  const updatePlano = (id, updater) => setObjetivos((p) => p.map((o) => (o.id !== id ? o : { ...o, plano: updater(o.plano) })));
  // Renomear (06/11/2026): nomes antigos vinham com a frase SMART inteira. O nome anterior vira
  // a descrição quando o objetivo ainda não tem uma, para não perder os detalhes.
  const renomear = (o) => {
    const novo = window.prompt("Novo nome do objetivo (curto, ex: Bater 75 kg):", o.descricao ? o.title : "");
    if (!novo || !novo.trim() || novo.trim() === o.title) return;
    setObjetivos((p) => p.map((x) => (x.id !== o.id ? x : { ...x, title: novo.trim(), descricao: x.descricao || x.title })));
  };
  const apagar = (o) => {
    if (!window.confirm("Apagar o objetivo '" + o.title + "' e o plano dele?")) return;
    setObjetivos((p) => p.filter((x) => x.id !== o.id));
  };

  return (
    <div style={{ animation: "slideUp .3s ease" }}>
      <StatusAtual C={C} pesoHoje={pesoHoje} pesoMeta={pesoMeta} navyEstimate={navyEstimate} trendKg={trendKg} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 10px" }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Objetivos</div>
        {abrirDesejo && (
          <Btn sm full={false} color={ACCENT} onClick={abrirDesejo}>
            <Ico n="plus" size={11} /> Novo
          </Btn>
        )}
      </div>

      {objetivos.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 11.5 }}>Nenhum objetivo de saúde ainda. Os objetivos são criados no Desejo, onde o Coach monta o plano com você, e aparecem aqui.</div>
      )}

      {objetivos.map((o) => (
        <div key={o.id} id={"obj-" + o.id} style={{ borderTop: "1px solid " + C.b1, padding: "9px 0", scrollMarginTop: 70 }}>
          <GoalCard C={C} accent={ACCENT} label={o.title} pct={pctDe(o)} statLine={linhaStatus(o)} onClick={() => setAberto(aberto === o.id ? null : o.id)} />
          {aberto === o.id && (
            <div style={{ marginTop: 10 }}>
              {o.plano
                ? <PlanoCard C={C} plano={o.plano} descricao={o.descricao || null} accent={ACCENT} onToggleStep={(sid) => toggleStep(o.id, sid)} onUpdate={(u) => updatePlano(o.id, u)} />
                : <div style={{ fontSize: 11, color: C.muted }}>Este objetivo não tem plano.</div>}
              {o.macros && <div style={{ marginTop: 10 }}><MacrosCard C={C} m={o.macros} prazo={o.prazo} accent={ACCENT} /></div>}
              {o.plano?.habitoSugerido && (
                <div style={{ fontSize: 10.5, color: GREEN, marginTop: 8 }}>Hábito sugerido: {o.plano.habitoSugerido}</div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => renomear(o)} style={{ background: "none", border: "1px solid " + C.b1, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: C.muted, fontSize: 10.5, fontWeight: 700 }}>
                Renomear
              </button>
              <button onClick={() => apagar(o)} style={{ background: "none", border: "1px solid " + C.b1, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: C.muted, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <Ico n="x" size={11} color={C.muted} /> Apagar objetivo
              </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
