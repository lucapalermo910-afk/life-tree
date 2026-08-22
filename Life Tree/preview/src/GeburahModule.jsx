import { useState, useEffect } from "react";
import { D_EX_MUSC, D_EX_ARTES, D_EX } from "./geburah/exerciseLibrary.js";
import { D_AL } from "./geburah/foodLibrary.js";
import { D_ROT, D_REC } from "./geburah/defaultRoutines.js";
import { useCoachDataSync } from "./shared/coachSync.js";
import { ThemeCtx, DARK, LIGHT, ACCENT, ORANGE, GREEN, PURPLE, AMBER, Sheet, Card, Bar, Btn } from "./geburah/theme.js";
import { GeburahCtx } from "./geburah/context.js";
import { Ico } from "./geburah/icons.jsx";
import { TABS, WIDGET_CATALOG, DEFAULT_LAYOUT } from "./geburah/constants.js";
import { uid, todayS, fmt1, fmtKg, clamp, calcNavyBF, sGet, sSet, usePersisted, FATOR_MET_ARTE, FATOR_MET_MUSC, logTipoDe } from "./geburah/helpers.js";
import { TreinoTab, LogTreinoPage, AddExercicioSheet, AddRotinaSheet, AddExRotSheet, EditExRotSheet } from "./geburah/TreinoTab.jsx";
import { NutriTab, AddAlimentoSheet, AddRefeicaoSheet, AddReceitaSheet, AddIngredienteSheet } from "./geburah/NutriTab.jsx";
import { PlanejamentoTab, PlanRefeicaoSheet } from "./geburah/PlanejamentoTab.jsx";
import { MedidasTab, RegistrarPesoSheet, EditMetaPesoSheet, AddMedidasSheet } from "./geburah/MedidasTab.jsx";
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
  const [pesosMeta,     setPesosMeta]     = usePersisted("pesosMeta",    {pesoAtual:88,pesoMeta:78,taxaSemanal:0.5,iniciou:todayS()});
  const [pesagens,      setPesagens]      = usePersisted("pesagens",     [
    {id:"ps1",data:"2026-05-01",peso:90.2,gordura:28.0},{id:"ps2",data:"2026-05-08",peso:89.5,gordura:27.3},
    {id:"ps3",data:"2026-05-15",peso:89.0,gordura:26.8},{id:"ps4",data:"2026-05-22",peso:88.5,gordura:26.2},
    {id:"ps5",data:todayS(),peso:88.0,gordura:25.5},
  ], coachSyncTick);
  const [medidasCorp, setMedidasCorp] = usePersisted("medidasCorp",[
    {id:"mc1",data:"2026-05-01",medidas:{Peso:90.2,Cintura:92,Quadril:104,Peito:108,"Pescoço":39,"Antebraço Dir":29,"Antebraço Esq":28.5,"Bíceps Dir":38,"Bíceps Esq":37.5,"Coxa Dir":62,"Coxa Esq":61.5,"Panturrilha Dir":37,"Panturrilha Esq":36.5}},
    {id:"mc2",data:todayS(),medidas:{Peso:88.0,Cintura:90,Quadril:103,Peito:107,"Pescoço":38.5,"Antebraço Dir":29.5,"Antebraço Esq":29,"Bíceps Dir":38.5,"Bíceps Esq":38,"Coxa Dir":61,"Coxa Esq":61,"Panturrilha Dir":37,"Panturrilha Esq":36.5}},
  ], coachSyncTick);
  const [metas,     setMetas]     = usePersisted("metas",    {cal:2200,prot:160,carb:220,gord:70}, coachSyncTick);
  const [perfil,    setPerfil]    = usePersisted("perfil",   {nome:"Atleta",peso:88,altura:175,idade:30,sexo:"M",atividade:"moderado"});
  const [agua,      setAgua]      = usePersisted("agua",     {meta:3000,copos:[]}, coachSyncTick);  // copos: [{id,data,ml}]
  const [planSem,   setPlanSem]   = usePersisted("planSem",  {}); // {YYYY-MM-DD_refeicao: [alimentoId,...]}
  const [widgetLayout, setWidgetLayout] = usePersisted("widgetLayout", DEFAULT_LAYOUT);

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
  const WidgetWrapper = ({w, onRemove, editMode, children}) => (
    <div style={{position:"relative",gridColumn:w.size==="full"?"1 / -1":"auto"}}>
      {editMode&&(
        <div style={{position:"absolute",top:-8,right:-8,zIndex:10,display:"flex",gap:4}}>
          <button onClick={()=>onRemove(w.id)} style={{background:"#ef4444",border:"none",borderRadius:99,width:22,height:22,cursor:"pointer",color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
        </div>
      )}
      {children}
    </div>
  );

  const renderWidget = (w) => {
    const varColor = variacaoHoje>0.3?"#ef4444":variacaoHoje<-0.3?GREEN:AMBER;
    switch(w.type){
      case "score-geburah": return (
        <Card style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>GEBURAH — FORÇA</div>
              <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{gebScore}<span style={{fontSize:18}}>%</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
              {[{l:"Treino",v:treinoScore,c:ACCENT},{l:"Nutrição",v:dietaScore,c:ORANGE},{l:"Peso",v:pesoScore,c:GREEN}].map(m=>(
                <div key={m.l} onClick={()=>setTab(m.l==="Treino"?"treino":m.l==="Nutrição"?"nutri":"medidas")} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:"pointer",border:"1px solid "+m.c+"22"}}>
                  <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                  <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
                </div>
              ))}
            </div>
          </div>
          <Bar value={gebScore} color={"linear-gradient(90deg,"+ACCENT+",#f97316)"} height={6}/>
        </Card>
      );
      case "peso-hero": return (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800}}>Pesagem de Hoje</div>
            <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS(),...(navyEstimate?{gordura:Math.round(navyEstimate*10)/10}:{})})}><Ico n="plus" size={11}/> Registrar</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            {[["HOJE",fmtKg(pesoHoje),ACCENT],["META DO DIA",fmtKg(metaDiaria),GREEN],["VARIAÇÃO",(variacaoHoje>0?"+":"")+fmt1(variacaoHoje)+"kg",varColor]].map(([l,v,c])=>(
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
      case "agua": {
        const aguaColl=!!secCollapsedShell.agua;
        const todaysCopos=agua.copos.filter(c=>c.data===todayS());
        return (
        <Card style={{textAlign:"center"}}>
          <button onClick={()=>setSecCollapsedShell(p=>({...p,agua:!aguaColl}))} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:6,background:"none",border:"none",cursor:"pointer",width:"100%",padding:0}}>
            <Ico n="droplet" size={11} color={ACCENT}/>
            <span style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1}}>ÁGUA</span>
            <span style={{fontSize:9,color:C.muted}}>{aguaColl?"▾":"▴"}</span>
          </button>
          <div style={{fontSize:28,fontWeight:900,color:ACCENT,lineHeight:1}}>{Math.round(aguaHoje/1000*10)/10}<span style={{fontSize:11,color:C.muted}}>L</span></div>
          <div style={{fontSize:9,color:C.muted,marginBottom:8}}>Meta: {agua.meta}ml</div>
          <Bar value={aguaPct} color={ACCENT} height={4}/>
          {!aguaColl&&(<div style={{textAlign:"left",marginTop:10}}>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input type="number" value={aguaMlShell} min={0} step={50} onChange={e=>setAguaMlShell(Number(e.target.value))}
                style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"6px 8px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              <button onClick={()=>{if(aguaMlShell>0)setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:todayS(),ml:aguaMlShell}]}));}}
                style={{padding:"6px 12px",borderRadius:8,background:ACCENT,border:"none",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ml</button>
            </div>
            {todaysCopos.length===0
              ? <div style={{textAlign:"center",padding:"6px 0",color:C.muted,fontSize:10}}>Nenhum registro ainda</div>
              : todaysCopos.map((c,i)=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:i>0?"1px solid "+C.b1:"none"}}>
                  <span style={{fontSize:11}}>{i+1}º copo · {c.ml}ml</span>
                  <button onClick={()=>setAgua(a=>({...a,copos:a.copos.filter(x=>x.id!==c.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                </div>
              ))
            }
          </div>)}
        </Card>
        );
      }
      case "streak": return (
        <Card style={{textAlign:"center",background:streak>=7?AMBER+"11":C.card,border:"1px solid "+(streak>=7?AMBER+"44":C.b1)}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>STREAK</div>
          <div style={{fontSize:36,lineHeight:1,marginBottom:2}}>{streak>=7?"🔥":"💪"}</div>
          <div style={{fontSize:28,fontWeight:900,color:streak>=7?AMBER:ACCENT,lineHeight:1}}>{streak}</div>
          <div style={{fontSize:9,color:C.muted}}>dias consecutivos</div>
          {streak>=7&&<div style={{fontSize:9,color:AMBER,fontWeight:700,marginTop:4}}>Semana completa!</div>}
        </Card>
      );
      case "treino-hoje": return (
        <Card>
          <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>Treino de Hoje</div>
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
      case "pr-board": return (
        <Card>
          <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>🏆 Recordes Pessoais</div>
          {Object.keys(prMap).length===0&&<div style={{fontSize:10,color:C.muted}}>Nenhum PR ainda. Inicie um treino!</div>}
          {Object.entries(prMap).slice(0,4).map(([exId,pr])=>{
            const ex=exercicios.find(e=>e.id===exId);
            return(<div key={exId} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:"1px solid "+C.b1}}>
              <span style={{fontSize:10}}>{ex?.name||"?"}</span>
              <span style={{fontSize:10,fontWeight:700,color:AMBER}}>{pr}kg</span>
            </div>);
          })}
        </Card>
      );
      case "meta-peso": return (
        <Card>
          <div style={{fontSize:11,fontWeight:800,marginBottom:6}}>Progresso do Peso</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}>
            <span style={{color:C.muted}}>Inicial: {fmtKg(pesosMeta.pesoAtual)}</span>
            <span style={{fontWeight:700,color:ACCENT}}>Hoje: {fmtKg(pesoHoje)}</span>
            <span style={{color:GREEN}}>Meta: {fmtKg(pesoMeta)}</span>
          </div>
          <Bar value={pesoScore} color={"linear-gradient(90deg,"+ACCENT+","+GREEN+")"} height={8}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:3}}>
            <span>Perdeu {fmt1(perdaTotal)}kg</span>
            <span>Falta {fmt1(faltaPerder)}kg · ~{diasRest} dias</span>
          </div>
        </Card>
      );
      case "planejamento": return (
        <Card>
          <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>Plano Semanal</div>
          {[todayS()].map(d=>{
            const r=planSem[d+"_Almoço"]||[];
            return(<div key={d}>
              <div style={{fontSize:9,color:ORANGE,fontWeight:700}}>HOJE — ALMOÇO</div>
              {r.length===0&&<div style={{fontSize:10,color:C.muted}}>Nenhum planejamento</div>}
              {r.map(id=>{const al=alimentos.find(a=>a.id===id);return al?<div key={id} style={{fontSize:10}}>{al.name}</div>:null;})}
            </div>);
          })}
        </Card>
      );
      default: return <Card><div style={{fontSize:10,color:C.muted}}>Widget desconhecido</div></Card>;
    }
  };

  // ── ESTADO DO WIDGET DE ÁGUA (GebTab) ─────────────────────────────────────
  // secCollapsedShell/aguaMlShell: GebTab fica no shell (ver [[11 Plano de Decomposição
  // — Arquivos Monolíticos]], seção item 5 — dashboard agregador, não vale a pena
  // extrair), então o estado do widget de água mora aqui direto (independente do estado
  // homônimo que NutriTab agora mantém localmente).
  const [secCollapsedShell,setSecCollapsedShell] = useState({});
  const [aguaMlShell,setAguaMlShell] = useState(250);

  // ── WIDGET EDITOR ────────────────────────────────────────────────────────
  const WidgetEditorSheet = () => (
    <Sheet title="Customizar Dashboard" onClose={()=>setSh(null)}>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,marginBottom:8,color:C.dim}}>WIDGETS ATIVOS</div>
        {widgetLayout.map((w,i)=>{
          const meta=WIDGET_CATALOG.find(c=>c.type===w.type);
          return(
            <div key={w.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
              <Ico n={meta?.icon||"grid"} size={14} color={meta?.color||ACCENT}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{meta?.label||w.type}</div>
                <div style={{fontSize:9,color:C.muted}}>{meta?.desc}</div>
              </div>
              <select value={w.size} onChange={e=>setWidgetLayout(l=>l.map(x=>x.id===w.id?{...x,size:e.target.value}:x))}
                style={{background:C.bg,border:"1px solid "+C.b2,borderRadius:6,padding:"3px 6px",fontSize:10,color:C.text}}>
                <option value="full">Largura total</option>
                <option value="half">Metade</option>
              </select>
              <div style={{display:"flex",gap:4}}>
                {i>0&&<button onClick={()=>setWidgetLayout(l=>{const a=[...l];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:11}}>↑</button>}
                {i<widgetLayout.length-1&&<button onClick={()=>setWidgetLayout(l=>{const a=[...l];[a[i],a[i+1]]=[a[i+1],a[i]];return a;})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:11}}>↓</button>}
                <button onClick={()=>setWidgetLayout(l=>l.filter(x=>x.id!==w.id))} style={{background:"#ef444422",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",color:"#ef4444",fontSize:13,fontWeight:700}}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,marginBottom:8,color:C.dim}}>ADICIONAR WIDGET</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {WIDGET_CATALOG.filter(c=>!widgetLayout.find(w=>w.type===c.type)).map(c=>(
            <button key={c.type} onClick={()=>{setWidgetLayout(l=>[...l,{id:"w"+uid(),type:c.type,size:"full"}]);toast_(c.label+" adicionado",c.color);}}
              style={{padding:"10px",background:C.surface,border:"1px solid "+c.color+"33",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <Ico n={c.icon} size={13} color={c.color}/>
                <span style={{fontSize:11,fontWeight:700,color:c.color}}>{c.label}</span>
              </div>
              <div style={{fontSize:9,color:C.muted}}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <Btn color={ACCENT} onClick={()=>{setWidgetLayout(DEFAULT_LAYOUT);toast_("Layout resetado");}}>Resetar layout padrão</Btn>
    </Sheet>
  );

  // ── GEBURAH TAB ───────────────────────────────────────────────────────────
  // Fica no shell (não extraída como as outras 5 abas) — é o dashboard agregador,
  // toca ~35 identificadores de todos os domínios; extrair significaria ou uma lista de
  // props enorme e frágil, ou mover todos esses computeds junto (quebrando as outras
  // abas que também precisam deles). Ver seção "GebTab" do levantamento em
  // [[11 Plano de Decomposição — Arquivos Monolíticos]].
  const GebTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted}}>DASHBOARD</div>
        <button onClick={()=>setSh("widgetEditor")} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,color:C.dim}}>
          <Ico n="grid" size={12} color={C.dim}/> Customizar
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {widgetLayout.map(w=>(
          <WidgetWrapper key={w.id} w={w} editMode={false} onRemove={id=>setWidgetLayout(l=>l.filter(x=>x.id!==id))}>
            {renderWidget(w)}
          </WidgetWrapper>
        ))}
      </div>
    </div>
  );

  // ── GEBURAH CTX — bundle pras abas extraídas (ver geburah/context.js) ───────
  const ctx = {
    f, setF, F, sh, setSh, close, openSh, toast, toast_, page, setPage,
    exercicios, setExercicios, rotinasTreino, setRotinasTreino, logTreino, setLogTreino, prMap, kcalDoTreino, perfil, setPerfil,
    alimentos, setAlimentos, receitas, setReceitas, logDieta, setLogDieta, todayLog, calcMacro, calHoje, protHoje, carbHoje, gordHoje,
    agua, setAgua, aguaHoje, aguaPct, metas, setMetas, tdee,
    medidasCorp, setMedidasCorp, pesoHoje, navyEstimate, pesosMeta, setPesosMeta, pesoMeta, pesoScore, perdaTotal, faltaPerder, diasRest,
    sortedPes, pesagens, setPesagens,
    planSem, setPlanSem,
    gebScore, treinoScore, dietaScore,
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

      {/* Widget Editor */}
      {sh==="widgetEditor"&&WidgetEditorSheet()}

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
      {sh==="addExRot"&&<AddExRotSheet/>}
      {sh==="editExRot"&&<EditExRotSheet/>}
      {sh==="addAlimento"&&<AddAlimentoSheet/>}
      {sh==="addRefeicao"&&<AddRefeicaoSheet/>}
      {sh==="addReceita"&&<AddReceitaSheet/>}
      {sh==="addIngrediente"&&<AddIngredienteSheet/>}
      {sh==="planRefeicao"&&<PlanRefeicaoSheet/>}
      {sh==="addMedidas"&&<AddMedidasSheet/>}
    </div>
    </GeburahCtx.Provider>
    </ThemeCtx.Provider>
  );
}
