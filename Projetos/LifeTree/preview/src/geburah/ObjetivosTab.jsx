// PREVIEW VISUAL — mockup do fluxo de objetivo com plano automático, pra validar design com o
// usuário antes de implementar de verdade. Sem persistência real (estado só local, some ao
// recarregar), sem chamada real ao Coach (plano é texto-base ajustado conforme os gaps
// respondidos, simulando o que a IA geraria) — ver plano salvo em
// C:\Users\mcrel\.claude\plans\majestic-roaming-umbrella.md.
// Fluxo revisado em 29/08/2026 (seção "Fluxo do motor de plano — revisado" do plano) — de uma
// confirmação única (objetivo+plano+hábito juntos) pra 4 passos: status atual mostrado (não
// perguntado, usa dado real de peso/composição já existente) → Coach pergunta só os gaps reais
// (condicionamento/lesão/dieta, nada disso é rastreado hoje) → sugestão editável → hábito só
// depois do "de acordo", como confirmação separada. Vale como padrão pra qualquer módulo, não
// só Geburah — ver plano.
// Quando aprovado de vez, isso vira a base real: lista de objetivos persistida
// (`lifetree_geb_metas` ou nome equivalente), plano gerado de verdade via buildGoalPlanPrompt +
// Coach, e reflexo read-only no Kether.
import { useState, useContext } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, GREEN, AMBER, Sheet, FI, FS, Card, Btn } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt1, fmtKg } from "./helpers.js";

const PLANO_BASE = {
  steps: [
    { id: "s1", title: "Registrar o peso 2x por semana, mesmo dia/horário", done: false },
    { id: "s2", title: "Treinar 4x por semana (2 força + 2 cardio leve/moderado)", done: false },
    { id: "s3", title: "Ajustar ingestão calórica pra um déficit moderado (~500kcal/dia)", done: false },
    { id: "s4", title: "Reavaliar em 30 dias — ver tendência real, não só o dia", done: false },
  ],
  impactoPositivo: [
    "Mais energia e disposição no dia a dia",
    "Redução de risco cardiovascular com a perda gradual",
    "Ganho de massa magra junto, não só perda de peso (com treino de força mantido)",
  ],
  impactoNegativo: [
    "Fome/irritação nos primeiros 7-10 dias de ajuste calórico é esperado",
    "Platô entre a 3ª-4ª semana é normal, não significa que parou de funcionar",
    "Se a perda passar de ~1%/semana, é rápido demais — ajustar antes de continuar",
  ],
  habitoSugerido: "Treinar 4x/semana (força + cardio)",
};

const GAP_QUESTOES = [
  { k: "condicionamento", label: "Nível de condicionamento", type: "select", opts: ["Iniciante", "Intermediário", "Avançado"] },
  { k: "lesao", label: "Alguma lesão ou restrição física?", type: "text", placeholder: "Ex: Nenhuma, joelho sensível, dor lombar..." },
  { k: "dieta", label: "Alguma restrição alimentar?", type: "text", placeholder: "Ex: Nenhuma, vegetariano, intolerância a lactose..." },
];

function trivial(v) {
  const s = (v || "").trim().toLowerCase();
  return !s || s === "não" || s === "nao" || s === "nenhuma" || s === "nenhum";
}

// Simula o que o Coach faria com buildGoalPlanPrompt: usa status real + gaps respondidos pra
// ajustar o passo a passo, não só devolver o texto fixo de sempre — prova o passo 2/3 do fluxo
// ("pegar informações sobre condições de treino e dieta para propor correções").
function gerarPlano(gaps) {
  const p = JSON.parse(JSON.stringify(PLANO_BASE));
  if (gaps.condicionamento === "Iniciante") {
    p.steps[1].title = "Treinar 3x por semana (1 força leve + 2 caminhada/cardio leve) — começando devagar por ser iniciante";
    p.habitoSugerido = "Treinar 3x/semana (força leve + caminhada)";
  } else if (gaps.condicionamento === "Avançado") {
    p.steps[1].title = "Treinar 5x por semana (3 força + 2 cardio moderado/intenso)";
    p.habitoSugerido = "Treinar 5x/semana (força + cardio)";
  }
  if (!trivial(gaps.lesao)) {
    p.impactoNegativo.push(`Lesão/restrição informada ("${gaps.lesao.trim()}") — evitar exercícios que sobrecarreguem essa área; considerar acompanhamento profissional antes de intensificar.`);
  }
  if (!trivial(gaps.dieta)) {
    p.steps.splice(3, 0, { id: "s3b", title: `Adaptar o plano alimentar considerando: ${gaps.dieta.trim()}`, done: false });
  }
  return p;
}

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
          {pesoMeta != null && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Meta de peso: {fmtKg(pesoMeta)}</div>}
        </div>
      </div>
    </div>
  );
}

// Linha de texto editável inline (passo ou item de impacto) — input sem borda visível que
// parece texto estático até o usuário tocar nele, com um × pra apagar a linha.
function EditableRow({ C, value, onChange, onRemove, strike, dim }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, border: "none", background: "transparent", outline: "none", padding: 0,
          fontSize: 11, fontFamily: "inherit", color: dim ? C.muted : C.text,
          textDecoration: strike ? "line-through" : "none",
        }}
      />
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.5, flexShrink: 0 }}>
        <Ico n="x" size={11} color={C.muted} />
      </button>
    </div>
  );
}

function AddRowBtn({ C, onClick, label }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 4, color: ACCENT, fontSize: 10, fontWeight: 700 }}>
      <Ico n="plus" size={10} color={ACCENT} /> {label}
    </button>
  );
}

// onUpdate recebe um updater (prev => next), mesma assinatura do setState — o chamador decide
// se aplica direto (plano em edição, ainda não confirmado) ou dentro de uma lista de objetivos
// já persistidos (ver usos em ObjetivosTab). Corrige o bug relatado: antes os passos/impactos
// eram <span> estáticos (nota dizia "a implementar" e nunca foi), sem jeito nenhum de editar.
function PlanoCard({ C, plano, onToggleStep, onUpdate }) {
  const editStep = (id, title) => onUpdate((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, title } : s)) }));
  const removeStep = (id) => onUpdate((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) }));
  const addStep = () => onUpdate((p) => ({ ...p, steps: [...p.steps, { id: "s" + Date.now(), title: "", done: false }] }));

  const editImpacto = (kind, i, text) => onUpdate((p) => ({ ...p, [kind]: p[kind].map((t, idx) => (idx === i ? text : t)) }));
  const removeImpacto = (kind, i) => onUpdate((p) => ({ ...p, [kind]: p[kind].filter((_, idx) => idx !== i) }));
  const addImpacto = (kind) => onUpdate((p) => ({ ...p, [kind]: [...p[kind], ""] }));

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 14, marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Ico n="target" size={13} color={ACCENT} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>PLANO GERADO PELO COACH</span>
      </div>

      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PASSO A PASSO</div>
      {plano.steps.map((s) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
          <button
            onClick={() => onToggleStep(s.id)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer", padding: 0,
              border: "1.5px solid " + (s.done ? GREEN : C.b2), background: s.done ? GREEN : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {s.done && <Ico n="check" size={10} color="#fff" sw={2.5} />}
          </button>
          <div style={{ flex: 1 }}>
            <EditableRow C={C} value={s.title} onChange={(v) => editStep(s.id, v)} onRemove={() => removeStep(s.id)} strike={s.done} dim={s.done} />
          </div>
        </div>
      ))}
      <AddRowBtn C={C} onClick={addStep} label="Adicionar passo" />

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: GREEN, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>IMPACTO POSITIVO</div>
          {plano.impactoPositivo.map((t, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <EditableRow C={C} value={t} onChange={(v) => editImpacto("impactoPositivo", i, v)} onRemove={() => removeImpacto("impactoPositivo", i)} />
            </div>
          ))}
          <AddRowBtn C={C} onClick={() => addImpacto("impactoPositivo")} label="Adicionar" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PONTOS DE ATENÇÃO</div>
          {plano.impactoNegativo.map((t, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <EditableRow C={C} value={t} onChange={(v) => editImpacto("impactoNegativo", i, v)} onRemove={() => removeImpacto("impactoNegativo", i)} />
            </div>
          ))}
          <AddRowBtn C={C} onClick={() => addImpacto("impactoNegativo")} label="Adicionar" />
        </div>
      </div>

      <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginTop: 10 }}>
        Toque em qualquer passo ou impacto pra editar o texto — × remove a linha.
      </div>
    </div>
  );
}

export function ObjetivosTab() {
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { pesoHoje, pesoMeta, navyEstimate, sortedPes } = g;
  const trendKg = sortedPes && sortedPes.length >= 2 ? sortedPes[sortedPes.length - 1].peso - sortedPes[sortedPes.length - 2].peso : null;

  const [objetivos, setObjetivos] = useState([]);
  const [criando, setCriando] = useState(false);
  const [gerando, setGerando] = useState(false);
  // step: "form" (título livre) -> "status" (mostrado, não perguntado) -> "gaps" (só o que
  // falta) -> "plano" (sugestão editável) -> "habito" (confirmação separada, só depois do
  // "de acordo" no plano)
  const [step, setStep] = useState("form");
  // Livre, igual ao Yesod ("Nova Meta Financeira" — só título + XP, sem tipo/categoria fixos).
  const [f, setF] = useState({ title: "", xp: 100 });
  const [gaps, setGaps] = useState({ condicionamento: "Intermediário", lesao: "", dieta: "" });
  const [planoAtual, setPlanoAtual] = useState(null);

  const resetForm = () => {
    setCriando(false);
    setStep("form");
    setF({ title: "", xp: 100 });
    setGaps({ condicionamento: "Intermediário", lesao: "", dieta: "" });
    setPlanoAtual(null);
  };

  const confirmarTitulo = () => {
    if (!f.title?.trim()) return;
    setStep("status");
  };

  const gerarSugestao = () => {
    setGerando(true);
    // Simula a latência real de uma chamada ao Coach — no real, isso é o buildGoalPlanPrompt,
    // que recebe f.title + o contexto do Geburah (status + gaps) e devolve um plano de verdade.
    setTimeout(() => {
      setPlanoAtual(gerarPlano(gaps));
      setGerando(false);
      setStep("plano");
    }, 900);
  };

  const confirmarPlano = () => {
    setObjetivos((p) => [
      ...p,
      { id: "obj" + Date.now(), titulo: f.title.trim(), xp: Number(f.xp) || 100, plano: planoAtual, habito: null },
    ]);
    setStep("habito");
  };

  const decidirHabito = (aceitou) => {
    setObjetivos((p) => p.map((o, i) => (i === p.length - 1 ? { ...o, habito: aceitou ? planoAtual.habitoSugerido : "recusado" } : o)));
    resetForm();
  };

  const toggleStep = (objId, stepId) => {
    setObjetivos((p) =>
      p.map((o) =>
        o.id !== objId ? o : { ...o, plano: { ...o.plano, steps: o.plano.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) } }
      )
    );
  };

  const updatePlano = (objId, updater) => {
    setObjetivos((p) => p.map((o) => (o.id !== objId ? o : { ...o, plano: updater(o.plano) })));
  };

  const removeObjetivo = (objId) => {
    setObjetivos((p) => p.filter((o) => o.id !== objId));
  };

  return (
    <div style={{ animation: "slideUp .3s ease" }}>
      <div style={{ background: "linear-gradient(135deg," + ACCENT + "22," + ACCENT + "06)", border: "1px solid " + ACCENT + "44", borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PREVIEW — AINDA NÃO É REAL</div>
        <div style={{ fontSize: 11.5, color: C.text, lineHeight: 1.5 }}>
          Protótipo visual do fluxo em 4 passos: status mostrado → gaps perguntados → sugestão
          editável → hábito só depois do "de acordo". Nada aqui persiste ainda.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Objetivos</div>
        {!criando && (
          <Btn sm full={false} color={ACCENT} onClick={() => setCriando(true)}>
            <Ico n="plus" size={11} /> Objetivo
          </Btn>
        )}
      </div>

      {objetivos.length === 0 && !criando && (
        <div style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 11.5 }}>Nenhum objetivo ainda — toque em "+ Objetivo" pra criar um.</div>
      )}

      {criando && step === "form" && (
        <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10 }}>Novo Objetivo</div>
          <FI label="Título" value={f.title} onChange={(v) => setF((p) => ({ ...p, title: v }))} placeholder="Ex: Chegar em 75kg, Reduzir % de gordura, Correr 5km sem parar..." />
          <FI label="XP de recompensa" value={f.xp} onChange={(v) => setF((p) => ({ ...p, xp: v }))} type="number" min={10} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn outline color={C.dim} onClick={resetForm}>Cancelar</Btn>
            <Btn color={ACCENT} onClick={confirmarTitulo}>Continuar</Btn>
          </div>
        </div>
      )}

      {criando && step === "status" && (
        <div style={{ marginBottom: 14 }}>
          <StatusAtual C={C} pesoHoje={pesoHoje} pesoMeta={pesoMeta} navyEstimate={navyEstimate} trendKg={trendKg} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn outline color={C.dim} onClick={resetForm}>Cancelar</Btn>
            <Btn color={ACCENT} onClick={() => setStep("gaps")}>Continuar</Btn>
          </div>
        </div>
      )}

      {criando && step === "gaps" && (
        <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>Só o que ainda não sabemos</div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
            Nada disso é rastreado na sua base hoje — usado pra propor um plano seguro e viável pra "{f.title}".
          </div>
          <FS label={GAP_QUESTOES[0].label} value={gaps.condicionamento} onChange={(v) => setGaps((p) => ({ ...p, condicionamento: v }))} opts={GAP_QUESTOES[0].opts.map((o) => ({ v: o, l: o }))} />
          <FI label={GAP_QUESTOES[1].label} value={gaps.lesao} onChange={(v) => setGaps((p) => ({ ...p, lesao: v }))} placeholder={GAP_QUESTOES[1].placeholder} />
          <FI label={GAP_QUESTOES[2].label} value={gaps.dieta} onChange={(v) => setGaps((p) => ({ ...p, dieta: v }))} placeholder={GAP_QUESTOES[2].placeholder} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn outline color={C.dim} onClick={resetForm}>Cancelar</Btn>
            <Btn color={ACCENT} onClick={gerarSugestao}>{gerando ? "Gerando plano..." : "Gerar sugestão"}</Btn>
          </div>
        </div>
      )}

      {criando && step === "plano" && planoAtual && (
        <div style={{ marginBottom: 14 }}>
          <PlanoCard C={C} plano={planoAtual} onToggleStep={(stepId) => setPlanoAtual((p) => ({ ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) }))} onUpdate={setPlanoAtual} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn outline color={C.dim} onClick={resetForm}>Cancelar</Btn>
            <Btn color={ACCENT} onClick={confirmarPlano}><Ico n="check" size={14} /> Confirmar objetivo + plano</Btn>
          </div>
        </div>
      )}

      {criando && step === "habito" && planoAtual && (
        <div style={{ background: ACCENT + "14", border: "1px solid " + ACCENT + "33", borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ico n="flame" size={15} color={AMBER} />
            <span style={{ fontSize: 12, fontWeight: 800 }}>Objetivo criado — quer um hábito de apoio?</span>
          </div>
          <div style={{ fontSize: 11, color: C.text, marginBottom: 12, lineHeight: 1.4 }}>
            Sugestão: <b>{planoAtual.habitoSugerido}</b>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn outline color={C.dim} onClick={() => decidirHabito(false)}>Agora não</Btn>
            <Btn color={AMBER} onClick={() => decidirHabito(true)}><Ico n="check" size={14} /> Criar hábito</Btn>
          </div>
        </div>
      )}

      {objetivos.map((o) => (
        <div key={o.id} style={{ marginBottom: 18 }}>
          <div style={{ background: C.card, border: "1px solid " + ACCENT + "33", borderRadius: 12, padding: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ico n="target" size={14} color={ACCENT} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>{o.titulo}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>+{o.xp}</span>
              <button onClick={() => removeObjetivo(o.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.5 }}>
                <Ico n="x" size={13} color={C.muted} />
              </button>
            </div>
            {o.habito && o.habito !== "recusado" && (
              <div style={{ fontSize: 10, color: AMBER, marginTop: 6 }}><Ico n="flame" size={10} color={AMBER} /> Hábito criado: {o.habito}</div>
            )}
          </div>
          <PlanoCard C={C} plano={o.plano} onToggleStep={(stepId) => toggleStep(o.id, stepId)} onUpdate={(updater) => updatePlano(o.id, updater)} />
        </div>
      ))}
    </div>
  );
}
