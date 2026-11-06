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
import { calcularMacros, dietaDoObjetivo } from "../shared/macros.js";
import { TreinoCard } from "../shared/TreinoCard.jsx";
import { normalizarTreino, treinoDoObjetivo, hojeLocal } from "../shared/treino.js";
import { ResultadosCard } from "../shared/ResultadosCard.jsx";
import { normalizarResultados, marcosDoObjetivo, comRotina } from "../shared/planejamento.js";

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


const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const diasAte = (iso) => Math.ceil((new Date(iso + "T00:00:00") - new Date(new Date().toDateString())) / 86400000);

// Só planejamento (06/11/2026): o cartão mostra prazo e fases, sem percentual — o
// acompanhamento fica nas outras abas e será ligado depois.
function linhaStatus(o) {
  const total = o.plano ? o.plano.steps.length : 0;
  const partes = [];
  if (o.prazo) { const d = diasAte(o.prazo); partes.push(d >= 0 ? "faltam " + d + " dias" : "prazo vencido em " + dataBR(o.prazo)); }
  if (total) partes.push(total + (total === 1 ? " fase" : " fases"));
  return partes.join(" · ");
}

export function ObjetivosTab() {
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { pesoHoje, pesoMeta, navyEstimate, sortedPes, objetivos, setObjetivos, abrirDesejo, objetivoInicial, editarInicial, setMetas, perfil } = g;
  const trendKg = sortedPes && sortedPes.length >= 2 ? sortedPes[sortedPes.length - 1].peso - sortedPes[sortedPes.length - 2].peso : null;

  const [aberto, setAberto] = useState(objetivoInicial || null);
  const [editando, setEditando] = useState(editarInicial ? objetivoInicial : null);
  const mudar = (id, campos) => setObjetivos((p) => p.map((o) => (o.id !== id ? o : { ...o, ...campos })));
  // Ajustar uma meta recalcula todas (shared/macros.js) e o resultado vira as metas diárias
  // da aba Nutrição. Perda semanal e calorias são alavancas excludentes: mexer numa solta a outra.
  // Metas de treino: treinos por semana alimentam a dieta, que é recalculada junto.
  const mudarTreino = (o, k, v) => {
    const treino = normalizarTreino({ ...treinoDoObjetivo(o, dietaDoObjetivo(o, perfil)), [k]: v });
    const criado = o.criado ? {} : { criado: hojeLocal() };
    if (!o.macros) { mudar(o.id, { treino, ...criado }); return; }
    const dieta = { ...dietaDoObjetivo(o, perfil), treinos_semana: treino.treinos_semana };
    const m = calcularMacros(dieta, o.ajustes || {});
    mudar(o.id, m.ok ? { treino, dieta, macros: m, ...criado } : { treino, dieta, ...criado });
    if (m.ok && setMetas) setMetas((p) => ({ ...p, cal: m.cal, prot: m.prot, carb: m.carb, gord: m.gord }));
  };
  const mudarMacro = (o, k, v) => {
    const dieta = { ...dietaDoObjetivo(o, perfil) };
    const ajustes = { ...(o.ajustes || {}) };
    if (k === "kgSemana") { ajustes.kgSemana = v || undefined; delete ajustes.cal; }
    else if (k === "cal") { ajustes.cal = v || undefined; delete ajustes.kgSemana; }
    else if (k === "prot") ajustes.prot = v || undefined;
    else dieta[k] = v;
    const m = calcularMacros(dieta, ajustes);
    if (!m.ok) { mudar(o.id, { dieta, ajustes }); return; }
    mudar(o.id, { dieta, ajustes, macros: m });
    if (setMetas) setMetas((p) => ({ ...p, cal: m.cal, prot: m.prot, carb: m.carb, gord: m.gord }));
  };
  // Vindo do Desejo: rola até o objetivo aberto.
  useEffect(() => { if (objetivoInicial) document.getElementById("obj-" + objetivoInicial)?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [objetivoInicial]);

  const toggleStep = (id, stepId) =>
    setObjetivos((p) => p.map((o) => (o.id !== id ? o : { ...o, plano: { ...o.plano, steps: o.plano.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) } })));
  const updatePlano = (id, updater) => setObjetivos((p) => p.map((o) => (o.id !== id ? o : { ...o, plano: updater(comRotina(o.plano)) })));
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
          <GoalCard C={C} accent={ACCENT} label={o.title} pct={null} rotulo={o.prazo ? "Até " + dataBR(o.prazo) : "Objetivo"} titulo={o.title} statLine={linhaStatus(o)} onClick={() => { setAberto(aberto === o.id ? null : o.id); setEditando(null); }}
            onEdit={() => { setAberto(o.id); setEditando(o.id); }} onDelete={() => apagar(o)} />
          {aberto === o.id && (
            <div style={{ marginTop: 10 }}>
              {o.plano
                ? <PlanoCard C={C} plano={comRotina(o.plano)} accent={ACCENT} onToggleStep={(sid) => toggleStep(o.id, sid)} onUpdate={(u) => updatePlano(o.id, u)}
                    nome={o.title} onNome={(v) => mudar(o.id, { title: v })}
                    descricao={o.descricao || null} onDescricao={(v) => mudar(o.id, { descricao: v })}
                    prazo={o.prazo || null} onPrazo={(v) => mudar(o.id, { prazo: v })}
                    tituloPassos="LINHA DO TEMPO"
                    marcoDoPasso={marcosDoObjetivo({ dieta: o.macros ? dietaDoObjetivo(o, perfil) : null, macros: o.macros, inicio: o.criado || hojeLocal(), prazo: o.prazo })}
                    metas={[
                      { chave: "resultados", titulo: "Resultados-chave",
                        render: (ed) => <ResultadosCard C={C} r={normalizarResultados(o.krs)} dieta={o.macros ? dietaDoObjetivo(o, perfil) : null} temDieta={!!o.macros} accent={ACCENT} editando={ed}
                          onChange={(k, v) => mudar(o.id, { krs: { ...normalizarResultados(o.krs), [k]: v } })} /> },
                      treinoDoObjetivo(o, dietaDoObjetivo(o, perfil)) && { chave: "treino", titulo: "Metas de treino",
                        render: (ed) => <TreinoCard C={C} t={treinoDoObjetivo(o, dietaDoObjetivo(o, perfil))} accent={ACCENT} editando={ed} inicio={o.criado} prazo={o.prazo} onChange={(k, v) => mudarTreino(o, k, v)} />,
                        onApagar: () => { if (window.confirm("Apagar as metas de treino deste objetivo?")) mudar(o.id, { treino: null, semTreino: true }); } },
                      o.macros && { chave: "dieta", titulo: "Metas de dieta",
                        render: (ed) => <MacrosCard C={C} m={o.macros} prazo={o.prazo} accent={ACCENT} editando={ed} dieta={dietaDoObjetivo(o, perfil)} onChange={(k, v) => mudarMacro(o, k, v)} />,
                        onApagar: () => { if (window.confirm("Apagar as metas de dieta deste objetivo?")) mudar(o.id, { macros: null, dieta: null, ajustes: null }); } },
                    ]}
                    editando={editando === o.id} onEditando={(v) => setEditando(v ? o.id : null)} />
                : <div style={{ fontSize: 11, color: C.muted }}>Este objetivo não tem plano.</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
