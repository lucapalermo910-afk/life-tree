import { useState, useEffect } from "react";
import { D_EX_MUSC, D_EX_ARTES, D_EX_CARDIO, D_EX } from "./geburah/exerciseLibrary.js";
import { D_AL } from "./geburah/foodLibrary.js";
import { D_ROT, D_REC } from "./geburah/defaultRoutines.js";
import { useCoachDataSync } from "./shared/coachSync.js";
import { ThemeCtx, DARK, LIGHT, ACCENT, ORANGE, GREEN, PURPLE, AMBER, Sheet, Card, Bar, Btn } from "./geburah/theme.js";
import { GeburahCtx } from "./geburah/context.js";
import { Ico } from "./geburah/icons.jsx";
import { TABS } from "./geburah/constants.js";
import { uid, todayS, fmt1, fmtKg, clamp, calcNavyBF, sGet, sSet, usePersisted, FATOR_MET_ARTE, FATOR_MET_MUSC, logTipoDe } from "./geburah/helpers.js";
import { TreinoTab, LogTreinoPage, AddExercicioSheet, AddRotinaSheet, EditRotinaSheet, PickExerciciosSheet, AddExRotSheet, EditExRotSheet } from "./geburah/TreinoTab.jsx";
import { NutriTab, AddAlimentoSheet, AddRefeicaoSheet, AddReceitaSheet, EditReceitaSheet, AddIngredienteSheet } from "./geburah/NutriTab.jsx";
import { PlanejamentoTab, PlanRefeicaoSheet } from "./geburah/PlanejamentoTab.jsx";
import { MedidasTab, RegistrarPesoSheet, EditMetaPesoSheet, AddMedidasSheet } from "./geburah/MedidasTab.jsx";
import { ObjetivosTab } from "./geburah/ObjetivosTab.jsx";
import { ConfigTab, EditMetasSheet, EditPerfilSheet, EditAguaSheet } from "./geburah/ConfigTab.jsx";

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function GeburahModule({ onBack, dark, setDark }) {
  // Correto: const local, não variável global mutável (bug corrigido em 12/08/2026 —
  // ver [[04 Bugs Conhecidos]] → "Tema global mutável (C)"). Sheet/FI/FTA/FS/Card/Bar
  // (agora em geburah/theme.js) recebem esse valor via ThemeCtx.
  const C = dark ? DARK : LIGHT;

  const [tab,  setTab]  = useState("geb");
  const [page, setPage] = useState(null); // {type, ...}
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);
  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2600); };
  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };

  // ── PERSISTED STATE ────────────────────────────────────────────────────────
  // coachSyncTick: incrementado sempre que o Coach global grava direto no localStorage
  // (geburahActions.js) — repassado como reloadSignal pras chaves que uma ação do Coach
  // pode alterar, pra tela não ficar com dado velho enquanto o módulo está montado.
  const [coachSyncTick, setCoachSyncTick] = useState(0);
  useCoachDataSync("geburah", ()=>setCoachSyncTick(t=>t+1));
  const [exercicios,    setExercicios]    = usePersisted("exercicios",   D_EX);
  const [rotinasTreino, setRotinasTreino] = usePersisted("rotinasTreino",D_ROT);
  const [logTreino,     setLogTreino]     = usePersisted("logTreino",    [], coachSyncTick);
  const [alimentos,     setAlimentos]     = usePersisted("alimentos",    D_AL);
  const [receitas,      setReceitas]      = usePersisted("receitas",     D_REC);
  const [logDieta,      setLogDieta]      = usePersisted("logDieta",     [], coachSyncTick);
  // Seed de demonstração removido em 31/08/2026 (pedido do usuário — nova versão inicia em
  // branco). taxaSemanal continua 0.5 (não 0) de propósito — é divisor em `diasRest`
  // (mais abaixo) e o próprio campo do formulário já trava min={0.1}, então 0 nunca seria um
  // valor válido de qualquer forma; zerar só pesoAtual/pesoMeta é suficiente pra não ter
  // nenhum peso "de mentira" no dashboard antes do usuário configurar a meta de verdade.
  const [pesosMeta,     setPesosMeta]     = usePersisted("pesosMeta",    {pesoAtual:0,pesoMeta:0,taxaSemanal:0.5,iniciou:todayS(),metaGordura:null});
  const [pesagens,      setPesagens]      = usePersisted("pesagens",     [], coachSyncTick);
  const [medidasCorp, setMedidasCorp] = usePersisted("medidasCorp",[], coachSyncTick);
  const [metas,     setMetas]     = usePersisted("metas",    {cal:2200,prot:160,carb:220,gord:70}, coachSyncTick);
  const [perfil,    setPerfil]    = usePersisted("perfil",   {nome:"",peso:0,altura:0,idade:0,sexo:"M",atividade:"moderado"});
  const [agua,      setAgua]      = usePersisted("agua",     {meta:3000,copos:[]}, coachSyncTick);  // copos: [{id,data,ml}]
  const [planSem,   setPlanSem]   = usePersisted("planSem",  {}); // {YYYY-MM-DD_refeicao: [alimentoId,...]}

  // ── MIGRAÇÃO: biblioteca de exercícios (09/08/2026) ──────────────────────────
  // `exercicios` só recebe D_EX_BASE/D_EX_MUSC/D_EX_ARTES como default na 1ª carga
  // (usePersisted só usa o `def` quando a chave ainda não existe no localStorage).
  // Instalações que já tinham `exercicios` salvo (com os 10 itens antigos, ou custom)
  // nunca ganhariam os 276 novos sozinhas — roda uma vez, mescla o que falta por id
  // (não duplica, não mexe em itens custom do usuário) e marca a flag pra nunca repetir,
  // assim um exercício da biblioteca que o usuário apagar depois não volta.
  useEffect(()=>{
    if(sGet("libExMigrated_v1")) return;
    setExercicios(p=>{
      const existentes = new Set(p.map(e=>e.id));
      const novos = [...D_EX_MUSC,...D_EX_ARTES].filter(e=>!existentes.has(e.id));
      return novos.length ? [...p,...novos] : p;
    });
    sSet("libExMigrated_v1", true);
  },[]);

  // Migração v2 (29/08/2026): mesma lógica acima, agora pra D_EX_CARDIO (16 itens novos de
  // cardio — antes só existia "Corrida" no D_EX_BASE original). Flag própria porque a v1 já
  // rodou e não roda de novo — sem isso, quem já tinha `exercicios` salvo nunca ganharia os
  // itens de cardio novos sozinho.
  useEffect(()=>{
    if(sGet("libExMigrated_v2")) return;
    setExercicios(p=>{
      const existentes = new Set(p.map(e=>e.id));
      const novos = D_EX_CARDIO.filter(e=>!existentes.has(e.id));
      return novos.length ? [...p,...novos] : p;
    });
    sSet("libExMigrated_v2", true);
  },[]);

  // ── COMPUTED ───────────────────────────────────────────────────────────────
  const sortedPes    = [...pesagens].sort((a,b)=>a.data.localeCompare(b.data));
  const ultimaPes    = sortedPes[sortedPes.length-1];
  const pesoHoje     = ultimaPes?.peso || pesosMeta.pesoAtual;
  const pesoMeta     = pesosMeta.pesoMeta;
  const diasPass     = Math.max(1,Math.round((new Date(todayS())-new Date(pesosMeta.iniciou))/(86400000)));
  const perdaTotal   = pesosMeta.pesoAtual - pesoHoje;
  const faltaPerder  = Math.max(0, pesoHoje - pesoMeta);
  const diasRest     = Math.round(faltaPerder/pesosMeta.taxaSemanal*7);
  const metaDiaria   = pesosMeta.pesoAtual - (pesosMeta.taxaSemanal/7)*diasPass;
  const variacaoHoje = pesoHoje - metaDiaria;

  // Estimativa de %gordura pela fórmula da Marinha — calculada a partir da última medida
  // corporal registrada, pra pré-preencher (editável) o campo ao registrar peso.
  const ultMedidasEntry = medidasCorp.length?[...medidasCorp].sort((a,b)=>b.data.localeCompare(a.data))[0]:null;
  const navyEstimate = ultMedidasEntry
    ? calcNavyBF(perfil.sexo, ultMedidasEntry.medidas["Cintura"], ultMedidasEntry.medidas["Pescoço"], ultMedidasEntry.medidas["Quadril"], perfil.altura)
    : null;

  const todayLog = logDieta.filter(l=>l.data===todayS());
  const calcMacro = (field) => todayLog.reduce((s,l)=>{const al=alimentos.find(a=>a.id===l.alimentoId);return al?s+(al[field]*l.qtd/100):s;},0);
  const calHoje  = calcMacro("cal100");
  const protHoje = calcMacro("prot");
  const carbHoje = calcMacro("carb");
  const gordHoje = calcMacro("gord");

  // Streak
  const calcStreak = () => {
    const dias = [...new Set(logTreino.map(l=>l.data))].sort((a,b)=>b.localeCompare(a));
    if(!dias.length) return 0;
    let streak=0; let cur=new Date(todayS());
    for(const d of dias){
      const dd=new Date(d);
      const diff=Math.round((cur-dd)/86400000);
      if(diff<=1){streak++;cur=dd;}else break;
    }
    return streak;
  };
  const streak = calcStreak();

  // Calorias gastas numa sessão de treino — só existe se a sessão tem duracaoMin (fechada
  // com "Finalizar treino", ver LogTreinoPage). Sessões antigas/abandonadas sem duração
  // retornam null e ficam de fora de qualquer soma — nunca chuta um tempo.
  const kcalDoTreino = (log) => {
    if(!log?.duracaoMin) return null;
    const done = (log.series||[]).filter(s=>s.feito);
    if(!done.length) return 0;
    const mets = done.map(s=>exercicios.find(e=>e.id===s.exercicioId)?.met||0).filter(m=>m>0);
    if(!mets.length) return 0;
    const metMedio = mets.reduce((s,m)=>s+m,0)/mets.length;
    const artesCount = done.filter(s=>exercicios.find(e=>e.id===s.exercicioId)?.grupo==="Artes Marciais").length;
    const fator = artesCount>done.length/2 ? FATOR_MET_ARTE : FATOR_MET_MUSC;
    return Math.round(metMedio*fator*(perfil.peso||75)/60*log.duracaoMin);
  };
  const kcalTreinoHoje = logTreino.filter(l=>l.data===todayS()).reduce((s,l)=>s+(kcalDoTreino(l)||0),0);
  const calLiquidas = calHoje - kcalTreinoHoje;

  const treinos7dLogs = logTreino.filter(l=>{const d=new Date(l.data);const n=new Date();n.setDate(n.getDate()-7);return d>=n;});
  const treinos7d    = treinos7dLogs.length;
  const kcalTreino7d = treinos7dLogs.reduce((s,l)=>s+(kcalDoTreino(l)||0),0);
  const treinoScoreBase = Math.min(100,Math.round(treinos7d/4*100));
  // Enriquecido com volume/intensidade (via kcal, que só existe pra sessões com duração
  // registrada) quando há dado — senão cai pra frequência pura, igual sempre foi, sem
  // penalizar quem ainda não começou a finalizar treino com duração. Meta implícita de
  // kcal: ~300kcal/sessão × 4 sessões/semana, mesma meta de frequência só que em energia.
  const treinoScore = kcalTreino7d>0
    ? Math.min(100,Math.round((treinos7d/4)*50 + Math.min(1,kcalTreino7d/(4*300))*50))
    : treinoScoreBase;
  const dietaScore   = metas.cal>0?Math.min(100,Math.round((calHoje/metas.cal)*100)):0;
  const pesoScore    = Math.max(0,Math.min(100,Math.round((1-faltaPerder/(pesosMeta.pesoAtual-pesoMeta+0.001))*100)));
  const gebScore     = Math.round(treinoScore*0.4+dietaScore*0.3+pesoScore*0.3);

  // ── SCORE BRIDGE → Árvore ────────────────────────────────────────────────
  useEffect(()=>{
    try{
      const raw=localStorage.getItem("lifetree_scores");
      const scores=raw?JSON.parse(raw):{};
      scores["geburah"]={score:gebScore,updatedAt:new Date().toISOString()};
      localStorage.setItem("lifetree_scores",JSON.stringify(scores));
    }catch(_){}
  },[gebScore]);

  // PRs — por tipo de registro do exercício: "reps" compara repsReal (não tem carga
  // relevante), "carga"/"tempo" continuam comparando cargaReal (kg ou segundos, conforme
  // logTipoDe) igual sempre foi.
  const prMap = {};
  logTreino.forEach(lt=>lt.series?.forEach(s=>{
    // só série marcada como feita conta pra PR — sem esse filtro, iniciar um treino já
    // "batia recorde" sozinho, porque cargaReal nasce pré-preenchida com a carga alvo da
    // rotina (e.carga) antes de qualquer série ser de fato executada.
    if(!s.feito) return;
    const ex=exercicios.find(e=>e.id===s.exercicioId);
    const tipo=logTipoDe(ex);
    const c=tipo==="reps"?Number(s.repsReal)||0:Number(s.cargaReal??s.carga)||0;
    if(c>0)prMap[s.exercicioId]=Math.max(prMap[s.exercicioId]||0,c);
  }));

  // TDEE
  const calcTDEE = () => {
    const {peso,altura,idade,sexo,atividade} = perfil;
    const bmr = sexo==="M" ? 10*peso+6.25*altura-5*idade+5 : 10*peso+6.25*altura-5*idade-161;
    const mult = {sedentario:1.2,leve:1.375,moderado:1.55,intenso:1.725,muito_intenso:1.9}[atividade]||1.55;
    return Math.round(bmr*mult);
  };
  const tdee = calcTDEE();

  // Água hoje
  const aguaHoje = agua.copos.filter(c=>c.data===todayS()).reduce((s,c)=>s+c.ml,0);
  const aguaPct  = Math.min(100,Math.round(aguaHoje/agua.meta*100));

  // Rotina sugerida hoje
  const diaSemana = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][new Date().getDay()];
  const rotinaSugerida = rotinasTreino.find(r=>r.dias.includes(diaSemana));

  // ── WIDGET COMPONENTS ─────────────────────────────────────────────────────
  const renderWidget = (w) => {
    const varColor = variacaoHoje>0.3?"#ef4444":variacaoHoje<-0.3?GREEN:AMBER;
    switch(w.type){
      // Simplificado em 30/08/2026 (pedido do usuário) — antes tinha os 3 mini-cards de
      // Treino/Nutrição/Peso espremidos ao lado do score grande (card dentro de card,
      // números minúsculos e clique escondido). Esse detalhamento já existe em cada aba
      // própria (Treino/Nutrição/Medidas) — aqui fica só o score geral, sem duplicar.
      case "score-geburah": return (
        <Card style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44"}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>GEBURAH — FORÇA</div>
          <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1,marginBottom:10}}>{gebScore}<span style={{fontSize:18}}>%</span></div>
          <Bar value={gebScore} color={"linear-gradient(90deg,"+ACCENT+",#f97316)"} height={6}/>
        </Card>
      );
      case "peso-hero": return (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800}}>Pesagem de Hoje</div>
            <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS(),...(navyEstimate?{gordura:Math.round(navyEstimate*10)/10}:{})})}><Ico n="plus" size={11}/> Registrar</Btn>
          </div>
          {/* Card "VARIAÇÃO" removido (31/08/2026, pedido do usuário) — número cru
              redundante com a mensagem de status logo abaixo, que já diz a mesma coisa em
              texto (acima/abaixo/dentro da meta). */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            {[["HOJE",fmtKg(pesoHoje),ACCENT],["META DO DIA",fmtKg(metaDiaria),GREEN]].map(([l,v,c])=>(
              <div key={l} style={{background:C.surface,borderRadius:8,padding:"7px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.muted}}>{l}</div>
                <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{background:varColor+"11",border:"1px solid "+varColor+"33",borderRadius:8,padding:"6px 10px",fontSize:10,color:varColor,fontWeight:600}}>
            {variacaoHoje>0.3?"⬆ Acima da meta — considere reduzir calorias":variacaoHoje<-0.3?"⬇ Abaixo da meta — ótimo ritmo!":"✓ Dentro da meta — continue assim!"}
          </div>
        </Card>
      );
      case "macros-hoje": return (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800}}>Macros Hoje</div>
            <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addRefeicao",{refeicao:"Café da manhã",alimentoId:alimentos[0]?.id||"",qtd:100,data:todayS()})}>
              <Ico n="plus" size={11}/> Refeição
            </Btn>
          </div>
          {[{l:"Calorias",v:Math.round(calHoje),meta:metas.cal,unit:"kcal",c:ACCENT},{l:"Proteína",v:Math.round(protHoje),meta:metas.prot,unit:"g",c:GREEN},{l:"Carb",v:Math.round(carbHoje),meta:metas.carb,unit:"g",c:AMBER},{l:"Gordura",v:Math.round(gordHoje),meta:metas.gord,unit:"g",c:PURPLE}].map(m=>{
            const over=m.meta>0&&m.v>m.meta;
            const pct=m.meta>0?clamp(Math.round(m.v/m.meta*100),0,100):0;
            const color=over?ACCENT:m.c;
            return(<div key={m.l} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:10}}>{m.l}{over&&<span style={{color:ACCENT,fontWeight:700}}> · acima</span>}</span>
                <span style={{fontSize:10,fontWeight:700,color}}>{m.v}<span style={{fontSize:8,color:C.muted}}>/{m.meta}{m.unit}</span></span>
              </div>
              <Bar value={pct} color={color} height={3}/>
            </div>);
          })}
          {kcalTreinoHoje>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,paddingTop:8,borderTop:"1px solid "+C.b1}}>
              <span style={{fontSize:10,color:C.muted}}>− {kcalTreinoHoje}kcal do treino de hoje</span>
              <span style={{fontSize:11,fontWeight:800,color:calLiquidas<=metas.cal?GREEN:ACCENT}}>Líquidas: {Math.round(calLiquidas)}kcal</span>
            </div>
          )}
        </Card>
      );
      // Streak integrado aqui em 30/08/2026 (pedido do usuário) — antes era um card próprio
      // ao lado do de Água, sempre visível mesmo zerado ("💪 0 dias consecutivos" lê como
      // fracasso, não motivação). Agora só aparece como uma linha quando há sequência de
      // verdade pra comemorar (streak>0), dentro do card que já fala de treino.
      case "treino-hoje": return (
        <Card>
          <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>Treino de Hoje</div>
          {streak>0&&(
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,fontSize:10,color:streak>=7?AMBER:ACCENT,fontWeight:700}}>
              <span>{streak>=7?"🔥":"💪"}</span>
              <span>{streak} {streak===1?"dia seguido treinando":"dias seguidos treinando"}{streak>=7?" — semana completa!":""}</span>
            </div>
          )}
          {rotinaSugerida ? (
            <div>
              <div style={{fontSize:12,fontWeight:700,color:ACCENT,marginBottom:4}}>{rotinaSugerida.name}</div>
              <div style={{fontSize:9,color:C.muted,marginBottom:8}}>{rotinaSugerida.exercicios.length} exercícios · {diaSemana}</div>
              <Btn color={ACCENT} sm onClick={()=>{
                const log={id:"lt"+uid(),data:todayS(),horaInicio:new Date().toISOString(),rotinaId:rotinaSugerida.id,rotinaName:rotinaSugerida.name,series:rotinaSugerida.exercicios.map(e=>({...e,feito:false,cargaReal:e.carga}))};
                setLogTreino(p=>[...p,log]); setPage({type:"logTreino",logId:log.id}); toast_("Treino iniciado! 💪",ACCENT);
              }}><Ico n="flame" size={12}/> Iniciar agora</Btn>
            </div>
          ) : (
            <div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"8px 0"}}>Nenhuma rotina para {diaSemana}. Que tal criar uma?</div>
          )}
        </Card>
      );
      default: return <Card><div style={{fontSize:10,color:C.muted}}>Widget desconhecido</div></Card>;
    }
  };

  // ── GEBURAH TAB ───────────────────────────────────────────────────────────
  // Fica no shell (não extraída como as outras 5 abas) — é o dashboard agregador,
  // toca ~35 identificadores de todos os domínios; extrair significaria ou uma lista de
  // props enorme e frágil, ou mover todos esses computeds junto (quebrando as outras
  // abas que também precisam deles). Ver seção "GebTab" do levantamento em
  // [[11 Plano de Decomposição — Arquivos Monolíticos]].
  // Layout fixo desde 30/08/2026 (pedido do usuário: remover "Customizar") — os 4 cards que
  // sobraram (score, peso, macros, treino) são todos largura total, então a grade de 2
  // colunas com widget "half" (que só existia pra Água/Streak, removidos do dashboard) não
  // faz mais sentido — vira uma coluna só, sem editor de layout.
  const GebTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:12}}>DASHBOARD</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {renderWidget({type:"score-geburah"})}
        {renderWidget({type:"peso-hero"})}
        {renderWidget({type:"macros-hoje"})}
        {renderWidget({type:"treino-hoje"})}
      </div>
    </div>
  );

  // ── GEBURAH CTX — bundle pras abas extraídas (ver geburah/context.js) ───────
  const ctx = {
    f, setF, F, sh, setSh, close, openSh, toast, toast_, page, setPage, tab, setTab,
    exercicios, setExercicios, rotinasTreino, setRotinasTreino, logTreino, setLogTreino, prMap, kcalDoTreino, perfil, setPerfil,
    alimentos, setAlimentos, receitas, setReceitas, logDieta, setLogDieta, todayLog, calcMacro, calHoje, protHoje, carbHoje, gordHoje,
    agua, setAgua, aguaHoje, aguaPct, metas, setMetas, tdee,
    medidasCorp, setMedidasCorp, pesoHoje, navyEstimate, pesosMeta, setPesosMeta, pesoMeta, pesoScore, perdaTotal, faltaPerder, diasRest,
    sortedPes, pesagens, setPesagens,
    planSem, setPlanSem,
    gebScore, treinoScore, dietaScore, streak, treinos7d,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  // ThemeCtx.Provider entrega este C (local, correto) pra Sheet/FI/FTA/FS/Card/Bar —
  // ver comentário completo junto da definição de ThemeCtx, em geburah/theme.js.
  return (
    <ThemeCtx.Provider value={C}>
    <GeburahCtx.Provider value={ctx}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text,position:"relative"}}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:${C.surface}}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>}

      {/* BOTÃO VOLTAR → ÁRVORE */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Geburah · Saúde</span>
      </div>

      {/* Header */}
      <div style={{padding:"14px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          {page&&<button onClick={()=>setPage(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 4px"}}><Ico n="back" size={12}/> voltar</button>}
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>GEBURAH</div>
          <div style={{fontSize:18,fontWeight:800}}>Força</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"10px 16px 100px"}}>
        {page?.type==="logTreino"
          ? <LogTreinoPage/>
          : <>
            {tab==="geb"    &&GebTab()}
            {tab==="treino" &&<TreinoTab/>}
            {tab==="nutri"  &&<NutriTab/>}
            {tab==="planejamento"&&<PlanejamentoTab/>}
            {tab==="objetivos"&&<ObjetivosTab/>}
            {tab==="medidas"&&<MedidasTab/>}
            {tab==="cfg"    &&<ConfigTab/>}
          </>
        }
      </div>

      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{
          const a=tab===t.id&&!page;
          return(<button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}>
            <div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
              <Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/>
            </div>
            {a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}
            {!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}
          </button>);
        })}
      </div>


      {/* ── SHEETS movidas pras abas (geburah/*Tab.jsx) — renderizadas aqui porque `sh`
          mora no shell e é independente da aba ativa (ex: registrarPeso pode abrir a
          partir do widget do dashboard OU da aba Medidas). ───────────────────────── */}
      {sh==="registrarPeso"&&<RegistrarPesoSheet/>}
      {sh==="editMetaPeso"&&<EditMetaPesoSheet/>}
      {sh==="editMetas"&&<EditMetasSheet/>}
      {sh==="editPerfil"&&<EditPerfilSheet/>}
      {sh==="editAgua"&&<EditAguaSheet/>}
      {sh==="addExercicio"&&<AddExercicioSheet/>}
      {sh==="addRotina"&&<AddRotinaSheet/>}
      {sh==="editRotina"&&<EditRotinaSheet/>}
      {sh==="pickExercicios"&&<PickExerciciosSheet/>}
      {sh==="addExRot"&&<AddExRotSheet/>}
      {sh==="editExRot"&&<EditExRotSheet/>}
      {sh==="addAlimento"&&<AddAlimentoSheet/>}
      {sh==="addRefeicao"&&<AddRefeicaoSheet/>}
      {sh==="addReceita"&&<AddReceitaSheet/>}
      {sh==="editReceita"&&<EditReceitaSheet/>}
      {sh==="addIngrediente"&&<AddIngredienteSheet/>}
      {sh==="planRefeicao"&&<PlanRefeicaoSheet/>}
      {sh==="addMedidas"&&<AddMedidasSheet/>}
    </div>
    </GeburahCtx.Provider>
    </ThemeCtx.Provider>
  );
}
