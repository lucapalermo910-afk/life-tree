import { useContext, useState } from "react";
import { Btn, FI, GoalCard, PlanoCard } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt } from "./constants.js";
import { YesodCtx } from "./context.js";
import { YESOD_ACTION_HANDLERS } from "../shared/yesodActions.js";
import {
  readIfPlan,
  criarIfPlan as criarIfPlanShared,
  addIfMeta as addIfMetaShared,
  removeIfMeta as removeIfMetaShared,
  addIfAcao as addIfAcaoShared,
  removeIfAcao as removeIfAcaoShared,
  apagarIfPlano as apagarIfPlanoShared,
} from "../shared/ifPlanActions.js";

// % do objetivo: se tem métrica real vinculada (ex: patrimônio líquido), calcula do dado real
// do módulo — mesma fórmula da Meta de IF, só que com o alvo do próprio objetivo em vez do
// alvo da IF. Sem métrica, cai pro fallback: passos do plano marcados como concluídos.
// Arquitetura decidida em 29/08/2026 (ver plano salvo) — dual de propósito, não todo objetivo
// tem (ou precisa ter) um número real por trás.
function goalPct(g, net) {
  if (g.metrica?.id === "patrimonio_liquido" && g.metrica.valor > 0) {
    return Math.max(0, Math.min(100, Math.round((net / g.metrica.valor) * 100)));
  }
  if (g.plano?.steps?.length) {
    return Math.round((g.plano.steps.filter(s => s.done).length / g.plano.steps.length) * 100);
  }
  return 0;
}

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Diferente das outras 4
// sub-páginas de detalhe (que foram pra DetailPages.jsx por serem cross-tab via Config),
// `goalsDetail` só é aberta de dentro desta própria aba (nav("goalsDetail"), sem outro call
// site — confirmado por grep) — então ficou aqui mesmo, mais perto do plano original.
// Definido fora de ObjetivosTab (26/08/2026) — mesmo motivo do BackBtn de DetailPages.jsx
// (react-hooks/static-components: "component created during render" ao subir pro nível
// direto da função exportada).
function BackBtn({label, C, back}){return(<button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}><Ico n="back" size={13}/> {label}</button>);}

// Uma linha de "Outras Metas" — se já tem plano (objetivo novo, criado pelo motor genérico),
// vira GoalCard (%+gauge) com clique expandindo o PlanoCard editável embaixo; sem plano
// (meta antiga, formato legado pré-29/08/2026, ou create_ygoal puro), mantém o checkbox
// simples de sempre — sem quebrar o que já existia.
function GoalRow({ g, C, net, expanded, onToggleExpand, onToggleStep, onUpdatePlano, setFinXp, setYGoals }) {
  if (!g.plano) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid " + C.b1 }}>
        <button onClick={() => { if (!g.done) { setFinXp(x => x + g.xp); } setYGoals(p => p.map(x => x.id === g.id ? { ...x, done: !x.done } : x)); }} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer", border: "1.5px solid " + (g.done ? "#f59e0b" : C.b2), background: g.done ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
          {g.done && <Ico n="check" size={11} color="#fff" sw={2.5} />}
        </button>
        <div style={{ flex: 1, fontSize: 12, color: g.done ? C.muted : C.text, textDecoration: g.done ? "line-through" : "none" }}>{g.title}</div>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>+{g.xp}</span>
        <button onClick={() => setYGoals(p => p.filter(x => x.id !== g.id))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: .5 }}><Ico n="x" size={11} color={C.muted} /></button>
      </div>
    );
  }
  const pct = goalPct(g, net);
  const statLine = g.metrica?.id === "patrimonio_liquido" ? fmt(net) + " de " + fmt(g.metrica.valor) : g.plano.steps.filter(s => s.done).length + " de " + g.plano.steps.length + " passos concluídos";
  return (
    <div style={{ borderTop: "1px solid " + C.b1, padding: "9px 0" }}>
      <GoalCard C={C} accent={ACCENT} label={g.title} pct={pct} statLine={statLine} onClick={() => onToggleExpand(g.id)} />
      {expanded && (
        <div style={{ marginTop: 10 }}>
          <PlanoCard C={C} plano={g.plano} accent={ACCENT} onToggleStep={stepId => onToggleStep(g.id, stepId)} onUpdate={updater => onUpdatePlano(g.id, updater)} />
          <button onClick={() => setYGoals(p => p.filter(x => x.id !== g.id))} style={{ marginTop: 8, background: "none", border: "1px solid " + C.b1, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: C.muted, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <Ico n="x" size={11} color={C.muted} /> Apagar objetivo
          </button>
        </div>
      )}
    </div>
  );
}

// Plano da Meta de IF (metas secundárias + ações) — até 30/08/2026 só existia dentro do
// Kether/Desejos; usuário pediu pra também editar/apagar daqui (o módulo de origem da meta
// em si). Mesma lógica compartilhada (shared/ifPlanActions.js) que o Kether usa, pra não
// duplicar a correção do bug de meta/hábito órfão — os dois lêem/escrevem o mesmo plano.
function IfPlanCard({ C, ifPlan, setIfPlan, yGoals, yHabits }) {
  const [metaInput, setMetaInput] = useState("");
  const [acaoInput, setAcaoInput] = useState("");
  const [acaoFreq, setAcaoFreq] = useState("Diário");
  const addMeta = () => { setIfPlan(addIfMetaShared(ifPlan, metaInput)); setMetaInput(""); };
  const addAcao = () => { setIfPlan(addIfAcaoShared(ifPlan, acaoInput, acaoFreq)); setAcaoInput(""); };

  if (!ifPlan) {
    return (
      <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 14, padding: 14, marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 9 }}>Ainda não tem um plano pra chegar nessa meta.</div>
        <Btn color={ACCENT} full={false} onClick={() => setIfPlan(criarIfPlanShared())}>Criar plano</Btn>
      </div>
    );
  }

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 14, padding: 14, marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>OBJETIVOS SECUNDÁRIOS</div>
      {ifPlan.metas.map(m => {
        const live = yGoals.find(g => g.title === m.title);
        const done = live?.done || false;
        return (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <button onClick={() => YESOD_ACTION_HANDLERS.toggle_ygoal({ match: m.title })}
              style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer", border: "1.5px solid " + (done ? "#10b981" : C.b2), background: done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {done && <Ico n="check" size={9} color="#fff" sw={2.5} />}
            </button>
            <span style={{ flex: 1, fontSize: 11, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{m.title}</span>
            <button onClick={() => setIfPlan(removeIfMetaShared(ifPlan, m.id))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: .5, display: "flex" }}>
              <Ico n="x" size={10} />
            </button>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <input value={metaInput} onChange={e => setMetaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addMeta()}
          placeholder="Ex: Elevar poupança pra 25%"
          style={{ flex: 1, background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 11, outline: "none" }} />
        <button onClick={addMeta} style={{ background: C.b1, border: "none", borderRadius: 8, width: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico n="plus" size={12} color={C.dim} />
        </button>
      </div>

      <div style={{ fontSize: 9, color: "#b45309", fontWeight: 700, letterSpacing: 1, margin: "14px 0 6px" }}>AÇÕES</div>
      {ifPlan.acoes.map(a => {
        const live = yHabits.find(h => h.title === a.title);
        const done = live?.done || false;
        return (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <button onClick={() => YESOD_ACTION_HANDLERS.toggle_yhabit({ match: a.title })}
              style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer", border: "1.5px solid " + (done ? "#b45309" : C.b2), background: done ? "#b45309" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {done && <Ico n="check" size={9} color="#fff" sw={2.5} />}
            </button>
            <span style={{ flex: 1, fontSize: 11, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{a.title}</span>
            <span style={{ fontSize: 9, color: C.muted }}>{a.freq}</span>
            <button onClick={() => setIfPlan(removeIfAcaoShared(ifPlan, a.id))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: .5, display: "flex" }}>
              <Ico n="x" size={10} />
            </button>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <input value={acaoInput} onChange={e => setAcaoInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addAcao()}
          placeholder="Ex: Revisar orçamento"
          style={{ flex: 1, background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 11, outline: "none" }} />
        <select value={acaoFreq} onChange={e => setAcaoFreq(e.target.value)}
          style={{ background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 6px", color: C.text, fontSize: 10, outline: "none" }}>
          <option>Diário</option><option>Semanal</option><option>Mensal</option>
        </select>
        <button onClick={addAcao} style={{ background: C.b1, border: "none", borderRadius: 8, width: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico n="plus" size={12} color={C.dim} />
        </button>
      </div>

      <button onClick={() => setIfPlan(apagarIfPlanoShared(ifPlan))} style={{ marginTop: 14, background: "none", border: "1px solid " + C.b1, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: C.muted, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
        <Ico n="x" size={11} /> Apagar plano
      </button>
    </div>
  );
}

export function ObjetivosTab({ C }) {
  const ctx = useContext(YesodCtx);
  const {
    askCoach, back, cashflowMonth, getMonthStr, guard, ifConfigured, ifGoal, ifMonthly, ifProjection, ifRisk, monthLabel2, nav, net,
    openSh, page, setFinXp, setIfBaseline, setIfGoal, setIfMonthly, setYGoals, yGoals, yHabits,
  } = ctx;
  // Plano da Meta de IF (metas secundárias + ações) — até 30/08/2026 só dava pra editar/apagar
  // de dentro do Kether/Desejos; usuário pediu pra também existir aqui, no módulo de origem.
  const [ifPlan, setIfPlan] = useState(() => readIfPlan());
  // Formulário inline (não Sheet/modal) — bench de UX definido pelo Geburah/ObjetivosTab.jsx:
  // usuário achou o modal de tela cheia com backdrop escuro pior que o card que aparece direto
  // no fluxo da aba. Ajustado em 29/08/2026 pra igualar a experiência entre os dois módulos.
  //
  // Reescrito em 29/08/2026 (arquitetura genérica de objetivo+plano, ver plano salvo) — o
  // formulário só pede título (XP fica com valor padrão, mecânica de recompensa fora de
  // escopo por decisão do usuário). Confirmar não persiste nada ainda: dispara uma mensagem
  // pro Coach ("Quero criar o objetivo: X") reaproveitando o chat que já existe — a conversa
  // de coleta de informação e o plano em si acontecem lá, não numa tela dedicada. O objetivo
  // só é salvo quando o usuário confirmar a ação que o Coach propuser (create_objective).
  const [criando, setCriando] = useState(false);
  const [tituloNovo, setTituloNovo] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const criarObjetivo = () => {
    if (!tituloNovo.trim() || !askCoach) return;
    askCoach("Quero criar o objetivo: " + tituloNovo.trim());
    setCriando(false);
    setTituloNovo("");
  };
  // Apagar a Meta de IF inteira — até 30/08/2026 só dava pra fazer isso mexendo direto no
  // localStorage (usuário pediu uma funcionalidade de verdade pra apagar/editar objetivos,
  // não só pelo dev). Some com o card (volta ao estado "sem meta definida"), o plano
  // vinculado e as metas/ações reais que ele criou — mesmo padrão de "Apagar plano" já
  // existente, só que pra meta inteira, não só o plano.
  const apagarMetaIF = () => {
    guard(() => {
      if (ifPlan) apagarIfPlanoShared(ifPlan);
      setIfGoal(0);
      setIfMonthly(0);
      setIfBaseline(null);
      setIfPlan(null);
      back();
    }, "Apagar a Meta de Independência Financeira? Isso remove a meta, o plano e as metas/ações vinculadas a ela. Essa ação não pode ser desfeita.");
  };
  const toggleStep = (goalId, stepId) => {
    setYGoals(p => p.map(g => g.id !== goalId ? g : { ...g, plano: { ...g.plano, steps: g.plano.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s) } }));
  };
  const updatePlano = (goalId, updater) => {
    setYGoals(p => p.map(g => g.id !== goalId ? g : { ...g, plano: updater(g.plano) }));
  };

  if (page && page.type === "goalsDetail") {
            // Guarda defensiva — a única entrada pra essa página é clicar no card de sempre,
            // que já não aparece sem meta configurada (ver render abaixo), mas cobre um nav()
            // direto/stale.
            if (!ifConfigured) {
              return (<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Objetivos" C={C} back={back}/>
                <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:18,textAlign:"center"}}>
                  <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Nenhuma meta de Independência Financeira definida ainda.</div>
                  <Btn color={ACCENT} full={false} onClick={()=>openSh("editIF",{ifGoal:"",ifMonthly:""})}><Ico n="edit" size={14}/> Definir meta</Btn>
                </div>
              </div>);
            }
            const ifNeeded=ifProjection.ifNeeded;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
            // monthsLeft/yearsLeft vêm de ifProjection (Context) — projMonthlyNet, não mais
            // média histórica pura. avgSaving continua sendo a média dos últimos 3 meses, só
            // como estatística visível ("poupança média/mês"), não alimenta mais a projeção.
            const {monthsLeft,yearsLeft}=ifProjection;
            const last3=[-1,-2,-3].map(o=>cashflowMonth(o));const avgSaving=Math.max(0,last3.reduce((s,m)=>s+(m.ins-m.outs),0)/3);
            const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(o));const savRates=months6.map(m=>({ym:m.ym,rate:m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0}));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Objetivos" C={C} back={back}/>
              {ifRisk.atRisk&&(
                <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#ef444418",border:"1px solid #ef444444",borderRadius:12,padding:"10px 12px",marginBottom:12}}>
                  <Ico n="alert" size={15} color="#ef4444"/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#ef4444",marginBottom:2}}>Fora da rota</div>
                    <div style={{fontSize:10.5,color:C.muted,lineHeight:1.4,marginBottom:6}}>{ifRisk.reason} — a meta atrasou ~{ifRisk.delta} {ifRisk.delta===1?"mês":"meses"} desde que o plano foi criado.</div>
                    <button onClick={()=>YESOD_ACTION_HANDLERS.reset_if_baseline()} style={{background:"#ef444422",border:"1px solid #ef444444",borderRadius:7,padding:"4px 10px",cursor:"pointer",color:"#ef4444",fontSize:10,fontWeight:700}}>Recalcular base do plano</button>
                  </div>
                </div>
              )}
              <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div><div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div><div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div><div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{l:"POUPANÇA MÉDIA/MÊS",v:fmt(avgSaving),sub:"últimos 3 meses",c:avgSaving>0?ACCENT:"#ef4444"},{l:"PROJEÇÃO",v:yearsLeft?yearsLeft+" anos":"—",sub:monthsLeft?monthsLeft+" meses":"sem dados",c:ACCENT},{l:"RENDA MENSAL (4%)",v:fmt(ifNeeded/300),sub:"ao atingir a meta",c:"#f59e0b"},{l:"PATRIMÔNIO ALVO",v:fmt(ifNeeded),sub:"regra dos 4%",c:C.text}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>{s.l}</div><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{s.sub}</div></div>))}</div>
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>TAXA DE POUPANÇA — 6 MESES</div>{savRates.map(s=>{const color=s.rate>=20?ACCENT:s.rate>=10?"#f59e0b":"#ef4444";return(<div key={s.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:s.ym===getMonthStr(0)?ACCENT:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,s.rate)+"%",background:color,borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color,minWidth:30,textAlign:"right"}}>{s.rate}%</span></div>);})}</div>
              <div style={{display:"flex",gap:8}}>
                <Btn outline color={ACCENT} onClick={()=>openSh("editIF",{ifGoal:ifNeeded,ifMonthly})}><Ico n="edit" size={14}/> Editar meta</Btn>
                <Btn outline color="#ef4444" onClick={apagarMetaIF}><Ico n="x" size={14}/> Apagar meta</Btn>
              </div>

              <div style={{marginTop:14}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>PLANO PRA CHEGAR NESSA META</div>
                <IfPlanCard C={C} ifPlan={ifPlan} setIfPlan={setIfPlan} yGoals={yGoals} yHabits={yHabits}/>
              </div>
            </div>);
  }

          // Reescrito em 30/08/2026 — "Outras Metas" (a lista de objetivos genéricos) morava só
          // dentro da página de detalhe da IF, só alcançável clicando no card dela. Com a IF
          // agora podendo ficar sem meta configurada (e sem card nenhum — usuário pediu pra não
          // ter nenhum prompt "definir meta" à mostra), essa lista ficava inalcançável. Agora
          // mora direto na tela principal da aba, independente da IF estar configurada ou não.
          const ifNeeded=ifGoal||ifMonthly*300;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
          return(<div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800}}>Objetivos</div>
              {!criando&&<Btn sm full={false} color={ACCENT} onClick={()=>setCriando(true)}><Ico n="plus" size={11}/> Objetivo</Btn>}
            </div>
            {criando&&(
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:800,marginBottom:10,color:C.text}}>Novo Objetivo</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:10,lineHeight:1.4}}>O Coach conversa com você no chat pra montar o plano — escreva só o objetivo.</div>
                <FI label="Título" value={tituloNovo} onChange={setTituloNovo} placeholder="Ex: Quitar dívida do cartão, Comprar um carro..." C={C}/>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <Btn outline color={C.dim} onClick={()=>{setCriando(false);setTituloNovo("");}}>Cancelar</Btn>
                  <Btn color="#f59e0b" onClick={criarObjetivo}><Ico n="check" size={14}/> Perguntar ao Coach</Btn>
                </div>
              </div>
            )}
            {/* Sem meta de IF configurada: nenhum card/prompt aqui — só a lista de objetivos
                abaixo (achado 30/08/2026, pedido explícito do usuário: "não tenha nada na aba,
                somente a opção de criar um novo objetivo"). */}
            {ifConfigured && (
              <div onClick={()=>nav("goalsDetail")} style={{cursor:"pointer",background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div>
                <div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div>
                <div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div>
              </div>
            )}
            {yGoals.length===0&&!criando&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:11.5}}>Nenhum objetivo ainda — toque em "+ Objetivo" pra criar um.</div>}
            {yGoals.map(g=>(
              <GoalRow key={g.id} g={g} C={C} net={net} expanded={expandedId===g.id}
                onToggleExpand={id=>setExpandedId(p=>p===id?null:id)} onToggleStep={toggleStep} onUpdatePlano={updatePlano}
                setFinXp={setFinXp} setYGoals={setYGoals}/>
            ))}
          </div>);
}
