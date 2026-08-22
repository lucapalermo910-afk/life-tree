import { useState, useEffect, createContext, useContext } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { D_APARENCIA_HABITS, D_BEMESTAR_HABITS, D_ROTINAS, D_GOALS, D_PRODUTOS } from "./tiphareth/seedData.js";
import { bindThemeContext } from "./shared/uiBind.jsx";

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK  = { bg:"#07090f",surface:"#0c1018",card:"#0f1520",b1:"#182030",b2:"#253040",text:"#eef2ff",muted:"#dde3ee",dim:"#9fb0c7",nav:"#060b12" };
const LIGHT = { bg:"#fffbf0",surface:"#ffffff",card:"#fffef7",b1:"#f0e6c8",b2:"#d4c090",text:"#2a1f0a",muted:"#8a7a5a",dim:"#4a3a1a",nav:"#fffbf0" };
// Sheet/FI/FTA/FS/Card/ProgressBar/MoodHistoryStrip leem o tema atual daqui — Provider
// montado uma vez no root de TipharethModule com o C local e correto (const, não a `let C`
// global mutável que existia antes de 13/08/2026, ver [[04 Bugs Conhecidos]]). Mesmo padrão
// já provado no Geburah e no Hod.
const ThemeCtx = createContext(LIGHT);
const ACCENT = "#f59e0b";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IC = {
  plus:"M12 5v14M5 12h14",x:"M18 6 6 18M6 6l12 12",check:"M20 6 9 17l-5-5",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  heart:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  sparkle:["M12 3v4","M12 17v4","M3 12h4","M17 12h4","M5.64 5.64l2.83 2.83","M15.54 15.54l2.83 2.83","M5.64 18.36l2.83-2.83","M15.54 8.46l2.83-2.83"],
  droplet:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-2.5-5.5S13 5 12 2C9.9 5 5 8.5 5 15a7 7 0 0 0 7 7z",
  mirror:["M12 3v18","M5 8h14","M5 16h14","M8 3C8 3 5 6 5 12s3 9 3 9","M16 3C16 3 19 6 19 12s-3 9-3 9"],
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 6v6l4 2"],
  smile:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M8 14s1.5 2 4 2 4-2 4-2","M9 9h.01","M15 9h.01"],
  trash:["M3 6h18","M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6","M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2","M10 11v6","M14 11v6"],
  save:["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z","M14 2v4a2 2 0 0 0 2 2h4","M12 13v6","M9 16l3 3 3-3"],
  send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bot:"M12 8V4H8M12 8H8V4M12 8v4m0-4h4V4h-4M8 4H4v4h4M16 4h4v4h-4M8 12H4v4h4m4-4h4v4h-4m-4 4H4v4h4m4-4v4h4v-4",
  user:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  layout:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  eyeoff:["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24","M1 1l22 22"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","circle cx='12' cy='12' r='3'"],
  grip:"M9 3h1v1H9zM9 7h1v1H9zM9 11h1v1H9zM9 15h1v1H9zM14 3h1v1h-1zM14 7h1v1h-1zM14 11h1v1h-1zM14 15h1v1h-1z",
};
function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if(!d) return null;
  const parts = Array.isArray(d)?d:d.split(/(?=M)/).filter(Boolean);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {parts.map((p,i)=>{
        if(p.startsWith("circle")){const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);if(m)return<circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;}
        return <path key={i} d={p}/>;
      })}
    </svg>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
// Sheet/FI/FTA/FS/Card/ProgressBar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026,
// item 2 do [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao
// ThemeCtx e ao ACCENT do módulo, sem mudar nenhum call site (inclusive o nome local
// "ProgressBar", só um alias do "Bar" compartilhado).
const { Sheet, FI, FTA, FS, Card, Bar: ProgressBar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);

// ─── DATA DEFAULTS ────────────────────────────────────────────────────────────
const TABS=[
  {id:"tiph",   icon:"treelife",label:"Tiphareth"},
  {id:"aparencia",icon:"mirror",label:"Aparência"},
  {id:"bemestar",icon:"heart",  label:"Bem-estar"},
  {id:"rotinas", icon:"clock",  label:"Rotinas"},
  {id:"cfg",     icon:"gear",   label:"Config"},
];
const MOOD_OPTS=[
  {v:"energizado",l:"Energizado ⚡",c:"#f59e0b"},
  {v:"calmo",l:"Calmo 🌿",c:"#10b981"},
  {v:"cansado",l:"Cansado 🌙",c:"#6366f1"},
  {v:"ansioso",l:"Ansioso 🌀",c:"#8b5cf6"},
  {v:"feliz",l:"Feliz ☀️",c:"#f97316"},
];
const FREQ_OPTS=[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}];
// Diário de humor direcionado — resolve o gap "mood era só um valor atual, não uma série
// histórica com prompts guiados" (ver [[06 Tiphareth]] → "Auditoria funcional"). Diferente
// do diário genérico do hub (freeform, ligado por sefirotId): aqui cada entrada já nasce
// carimbada com o humor do dia e responde 2 prompts fixos, específicos de autocuidado.
const MOOD_PROMPTS = [
  {k:"influencia", q:"O que mais influenciou seu humor hoje?"},
  {k:"gratidao",    q:"Uma coisa que você é grata/o hoje"},
];
const D_MOOD_LOG=[]; // [{id,date,mood,influencia,gratidao}] — upsert por dia (1 entrada/dia)

// Acompanhamento de remédios — gap total antes (nenhuma chave lifetree_tiph_* relacionada
// a medicação existia). times: array de horários (ex:["08:00","20:00"]) — cada horário de
// cada remédio ativo vira um item no checklist "Hoje" (medicationLog upsert por
// medId+time+date, mesmo padrão de upsert-por-dia usado em pesagem/humor no resto do app).
const D_MEDICATIONS=[]; // [{id,name,dosage,times:[...],notes,active}]
const D_MEDICATION_LOG=[]; // [{id,medId,date,time,taken}]

// ─── WIDGET CATALOG ── todos os blocos disponíveis para o dashboard ────────────
const WIDGET_CATALOG = [
  {id:"score",    label:"Score Tiphareth", desc:"Número principal + sub-scores + barra", defaultOn:true,  size:"full"},
  {id:"mood",     label:"Humor do dia",   desc:"Seletor de humor",                  defaultOn:true,  size:"full"},
  {id:"mood_history",label:"Diário de Humor",desc:"Histórico dos últimos 14 dias + refletir",defaultOn:true, size:"full"},
  {id:"streaks",  label:"Streaks",        desc:"Dias seguidos registrando humor/rotina", defaultOn:true, size:"full"},
  {id:"mood_correlation",label:"Humor × Hábitos",desc:"Correlação entre humor e hábitos completos",defaultOn:true, size:"full"},
  {id:"habitos_hoje",label:"Hábitos de hoje",desc:"Lista rápida de hábitos",        defaultOn:true,  size:"full"},
  {id:"remedios_hoje",label:"Remédios de hoje",desc:"Checklist de doses do dia",    defaultOn:false, size:"full"},
  {id:"rotinas_quick",label:"Rotinas rápidas",desc:"Progresso das rotinas hoje",    defaultOn:false, size:"full"},
  {id:"metas_widget",label:"Metas",       desc:"Progresso das metas",              defaultOn:false, size:"full"},
  {id:"xp_bar",   label:"XP & Nível",    desc:"Barra de experiência e nível",      defaultOn:false, size:"full"},
  {id:"quote",    label:"Frase do dia",   desc:"Afirmação motivacional",            defaultOn:false, size:"full"},
];
const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w=>w.defaultOn).map(w=>w.id);

// Leitura crua de localStorage fora do prefixo do Tiphareth — usada só pelo hub de
// hábitos cross-módulo abaixo (sempre leitura, nunca escreve nada em outro módulo).
function readOtherModule(key,fb){try{const v=localStorage.getItem(key);return v!==null?JSON.parse(v):fb;}catch{return fb;}}

// Hub de hábitos cross-módulo — cada módulo tem um formato de "hábito" ligeiramente
// diferente (Geburah nem tem o conceito, só rotina de treino/streak), por isso um
// adaptador por módulo em vez de um leitor genérico único. Resolve, com parametrização e
// desligado por padrão (ver hubModules no componente), o pedido do usuário de o Tiphareth
// "servir de hub" pras rotinas dos outros módulos — só leitura, marcar continua na tela
// de origem (decisão consciente: replicar a lógica de XP de cada módulo aqui multiplicaria
// risco de dessincronia por pouco ganho nesta fase de "testar se faz sentido").
const HUB_ADAPTERS = {
  yesod: { label:"Finanças", color:"#10b981", read:()=>
    readOtherModule("lifetree_fin_yhabits",[]).map(h=>({id:"yesod_"+h.id,title:h.title,freq:h.freq,done:h.done})) },
  hod: { label:"Profissional", color:"#f97316", read:()=>{
    const car=readOtherModule("lifetree_hod_carHabits",[]);
    const projects=readOtherModule("lifetree_hod_projects",[]);
    const brand=readOtherModule("lifetree_hod_brand",{habits:[]});
    return [
      ...car.map(h=>({id:"hodcar_"+h.id,title:h.title,freq:h.freq,done:h.done})),
      ...projects.flatMap(p=>(p.habits||[]).map(h=>({id:"hodproj_"+h.id,title:h.title+" ("+p.name+")",freq:h.freq,done:h.done}))),
      ...(brand.habits||[]).map(h=>({id:"hodbrand_"+h.id,title:h.title,freq:h.freq,done:h.done})),
    ];
  }},
  chesed: { label:"Relacionamentos", color:"#ec4899", read:()=>
    readOtherModule("lifetree_ches_habits",[]).map(h=>({id:"ches_"+h.id,title:h.title,freq:h.freq,done:h.done})) },
  netzach: { label:"Qualidade de Vida", color:"#84cc16", read:()=>[
    ...readOtherModule("lifetree_netz_lazerHabits",[]),
    ...readOtherModule("lifetree_netz_larHabits",[]),
  ].map(h=>({id:"netz_"+h.id,title:h.title,freq:h.freq,done:h.done})) },
  geburah: { label:"Saúde", color:"#ef4444", read:()=>{
    const logTreino=readOtherModule("lifetree_geb_logTreino",[]);
    const today=todayS();
    const treinouHoje=logTreino.some(l=>l.data===today);
    return [{id:"geb_treino_hoje",title:"Treino de hoje",freq:"Diário",done:treinouHoje}];
  }},
};
const HUB_MODULE_IDS = Object.keys(HUB_ADAPTERS);
const DEFAULT_HUB_MODULES = Object.fromEntries(HUB_MODULE_IDS.map(id=>[id,false]));

// Tira de histórico de 14 dias — usada tanto no widget do hub quanto na aba Bem-estar
// (versão mais completa, com a lista de entradas por baixo). Componente de módulo (não
// dentro de TipharethModule) porque não depende de nada além dos dados recebidos por prop
// e do tema via Context — pode ficar com identidade estável entre renders.
function MoodHistoryStrip({moodLog,onReflect}){
  const C=useContext(ThemeCtx);
  const days=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return d.toISOString().slice(0,10);});
  return(
    <div>
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        {days.map(d=>{
          const entry=moodLog.find(e=>e.date===d);
          const m=entry?MOOD_OPTS.find(o=>o.v===entry.mood):null;
          return <div key={d} title={d+(entry?" · "+(MOOD_OPTS.find(o=>o.v===entry.mood)?.l||""):"")} style={{flex:1,height:24,borderRadius:6,background:m?m.c:C.b1,opacity:m?1:0.5}}/>;
        })}
      </div>
      <Btn sm outline onClick={onReflect}><Ico n="sparkle" size={11}/> Refletir hoje</Btn>
    </div>
  );
}

// Doses de hoje — achata medications×times ativos em itens marcáveis, cruzando com
// medicationLog (upsert por medId+time+data) pra saber o que já foi tomado.
function MedicationTodayChecklist({medications,medicationLog,onToggle}){
  const C=useContext(ThemeCtx);
  const today=todayS();
  const items=medications.filter(m=>m.active!==false).flatMap(m=>(m.times&&m.times.length?m.times:[""]).map(t=>({med:m,time:t})));
  if(!items.length) return <div style={{fontSize:10,color:C.muted}}>Nenhum remédio ativo cadastrado.</div>;
  return(
    <div>
      {items.map(({med,time})=>{
        const taken=medicationLog.some(l=>l.medId===med.id&&l.time===time&&l.date===today&&l.taken);
        return(
          <div key={med.id+time} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid "+C.b1}}>
            <button onClick={()=>onToggle(med,time)}
              style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(taken?"#10b981":C.b2),background:taken?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {taken&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:taken?C.muted:C.text,textDecoration:taken?"line-through":"none"}}>{med.name}{time&&" · "+time}</div>
              <div style={{fontSize:9,color:C.muted}}>{med.dosage}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const TIPH_PFX = "lifetree_tiph_";
function sGet(key,fb){try{const v=localStorage.getItem(TIPH_PFX+key);return v!==null?JSON.parse(v):fb;}catch{return fb;}}
function sSet(key,val){try{localStorage.setItem(TIPH_PFX+key,JSON.stringify(val));}catch{}}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function TipharethModule({ onBack, dark, setDark, askCoach }){
  const C=dark?DARK:LIGHT;

  const [tab,setTab]=useState("tiph");
  const [sh,setSh]=useState(null);
  const [f,setF]=useState({});
  const F=v=>setF(x=>({...x,...v}));
  const [toast,setToast]=useState(null);
  const toast_=(msg,color)=>{setToast({msg,color:color||ACCENT});setTimeout(()=>setToast(null),2600);};
  const close=()=>{setSh(null);setF({});};
  const openSh=(name,init)=>{setF(init||{});setSh(name);};

  const [loaded,setLoaded]=useState(false);
  const [aparenciaHabits,_setAH]=useState(D_APARENCIA_HABITS);
  const [bemestarHabits, _setBH]=useState(D_BEMESTAR_HABITS);
  const [rotinas,        _setR] =useState(D_ROTINAS);
  const [goals,          _setG] =useState(D_GOALS);
  const [produtos,       _setP] =useState(D_PRODUTOS);
  const [xp,             _setXP]=useState(0);
  const [mood,           _setM] =useState("calmo");
  // widget config
  const [activeWidgets,  _setW] =useState(DEFAULT_WIDGETS);
  const [moodLog,        _setML]=useState(D_MOOD_LOG);
  const [medications,    _setMeds]=useState(D_MEDICATIONS);
  const [medicationLog,  _setMedLog]=useState(D_MEDICATION_LOG);
  const [hubModules,     _setHM]=useState(DEFAULT_HUB_MODULES); // {yesod,hod,chesed,netzach,geburah: bool} — todos false até o usuário ligar
  const [routineCompletionLog,_setRCL]=useState([]); // [{id,date,routineId}] — logado sozinho quando uma rotina bate 100%

  // persisted setters
  const mk=(setter,key)=>v=>setter(prev=>{const next=typeof v==="function"?v(prev):v;sSet(key,next);return next;});
  const setAH=mk(_setAH,"aparenciaHabits");
  const setBH=mk(_setBH,"bemestarHabits");
  const setR =mk(_setR, "rotinas");
  const setG =mk(_setG, "goals");
  const setP =mk(_setP, "produtos");
  const setXP=mk(_setXP,"xp");
  const setM =v=>{_setM(v);sSet("mood",v);};
  const setW =mk(_setW, "activeWidgets");
  const setML=mk(_setML,"moodLog");
  const setMeds=mk(_setMeds,"medications");
  const setMedLog=mk(_setMedLog,"medicationLog");
  const setHM =mk(_setHM, "hubModules");
  const setRCL=mk(_setRCL,"routineCompletionLog");

  // Hábitos "hoje" combinando Tiphareth + módulos do hub que estiverem ligados — usado
  // pro widget cross-módulo e pra capturar o snapshot de correlação com humor. Calculado a
  // cada render (não é caro: cada adaptador só lê algumas chaves pequenas de localStorage).
  const hubHabitsByModule = HUB_MODULE_IDS.filter(id=>hubModules[id]).map(id=>({
    id, ...HUB_ADAPTERS[id], items: HUB_ADAPTERS[id].read(),
  }));
  const combinedHabits = [...aparenciaHabits, ...bemestarHabits, ...hubHabitsByModule.flatMap(m=>m.items)];
  const habitsPctNow = combinedHabits.length ? Math.round(combinedHabits.filter(h=>h.done).length/combinedHabits.length*100) : null;

  // Registra o humor rápido (seletor do widget) E upserta a entrada de hoje no diário
  // direcionado — assim o histórico se constrói sozinho a partir do fluxo que já existia,
  // sem exigir uma ação extra do usuário só pra começar a ter dado histórico. Também
  // captura o % de hábitos completos no momento (Tiphareth + hub ligado) — é o dado bruto
  // da correlação humor×hábitos, construído pra frente a partir de agora (não dá pra
  // reconstruir retroativamente, não existe histórico diário de hábitos antes disso).
  const pickMood=v=>{
    setM(v);
    setML(prev=>{
      const today=todayS();
      const existing=prev.find(e=>e.date===today);
      if(existing) return prev.map(e=>e.date===today?{...e,mood:v,habitsPct:habitsPctNow}:e);
      return [...prev,{id:"ml"+uid(),date:today,mood:v,influencia:"",gratidao:"",habitsPct:habitsPctNow}];
    });
  };

  useEffect(()=>{
    (async()=>{
      const[ah,bh,rot,g,pr,xpv,mv,wv,ml,meds,medlog,hm,rcl]=await Promise.all([
        sGet("aparenciaHabits",D_APARENCIA_HABITS),sGet("bemestarHabits",D_BEMESTAR_HABITS),
        sGet("rotinas",D_ROTINAS),sGet("goals",D_GOALS),sGet("produtos",D_PRODUTOS),
        sGet("xp",0),sGet("mood","calmo"),sGet("activeWidgets",DEFAULT_WIDGETS),
        sGet("moodLog",D_MOOD_LOG),sGet("medications",D_MEDICATIONS),sGet("medicationLog",D_MEDICATION_LOG),
        sGet("hubModules",DEFAULT_HUB_MODULES),sGet("routineCompletionLog",[]),
      ]);
      _setAH(ah);_setBH(bh);_setR(rot);_setG(g);_setP(pr);_setXP(xpv);_setM(mv);_setW(wv);
      _setML(ml);_setMeds(meds);_setMedLog(medlog);_setHM({...DEFAULT_HUB_MODULES,...hm});_setRCL(rcl);
      setLoaded(true);
    })();
  },[]);

  // O Coach global (App.jsx) executa ações do Tiphareth direto no localStorage — ver
  // tipharethActions.js — porque o estado do módulo vive só aqui, não em App.jsx. Se este
  // módulo estiver montado quando uma ação roda, precisa recarregar pra não ficar com a UI
  // desatualizada. Mesmo padrão de Yesod/Geburah/Hod.
  const reloadFromStorage=()=>{
    _setAH(sGet("aparenciaHabits",D_APARENCIA_HABITS));
    _setBH(sGet("bemestarHabits",D_BEMESTAR_HABITS));
    _setR(sGet("rotinas",D_ROTINAS));
    _setG(sGet("goals",D_GOALS));
    _setP(sGet("produtos",D_PRODUTOS));
    _setXP(sGet("xp",0));
    _setM(sGet("mood","calmo"));
    _setW(sGet("activeWidgets",DEFAULT_WIDGETS));
    _setML(sGet("moodLog",D_MOOD_LOG));
    _setMeds(sGet("medications",D_MEDICATIONS));
    _setMedLog(sGet("medicationLog",D_MEDICATION_LOG));
  };
  useCoachDataSync("tiphareth", reloadFromStorage);

  // scores
  const allHabits=[...aparenciaHabits,...bemestarHabits];
  const habitScore =allHabits.length?Math.round(allHabits.filter(h=>h.done).length/allHabits.length*100):0;
  const goalScore  =goals.length?Math.round(goals.filter(g=>g.done).length/goals.length*100):0;
  const rotinaScore=rotinas.length?Math.round(rotinas.reduce((s,r)=>s+r.steps.filter(st=>st.done).length/(r.steps.length||1),0)/rotinas.length*100):0;
  const tiphScore  =Math.round(habitScore*0.35+goalScore*0.3+rotinaScore*0.35);
  const level = Math.floor(xp/200)+1;
  const xpInLevel = xp%200;

  // Loga a conclusão de uma rotina (todas as etapas feitas) uma vez por dia — alimenta o
  // streak de rotinas abaixo. Chamado depois de qualquer toggle de passo; upsert por
  // rotina+dia evita duplicar se o usuário desmarcar e marcar de novo no mesmo dia.
  const logRoutineCompletionIfDone=(routine)=>{
    if(!routine.steps.length || routine.steps.some(s=>!s.done)) return;
    const today=todayS();
    setRCL(prev=>prev.some(l=>l.routineId===routine.id&&l.date===today)?prev:[...prev,{id:"rcl"+uid(),date:today,routineId:routine.id}]);
  };

  // Streaks — diário de humor (moodLog já tem data por entrada) e rotinas (routineCompletionLog,
  // novo). Mesmo algoritmo de calcStreak do Geburah: conta dias consecutivos a partir de hoje.
  const streakFromDates=(dates)=>{
    const uniq=[...new Set(dates)].sort((a,b)=>b.localeCompare(a));
    if(!uniq.length) return 0;
    let streak=0, cur=new Date(todayS());
    for(const d of uniq){
      const dd=new Date(d);
      const diff=Math.round((cur-dd)/86400000);
      if(diff<=1){streak++;cur=dd;}else break;
    }
    return streak;
  };
  const moodStreak=streakFromDates(moodLog.map(e=>e.date));
  const routineStreak=streakFromDates(routineCompletionLog.map(l=>l.date));

  // Correlação humor × hábitos — média de habitsPct (capturado no momento de cada entrada,
  // ver pickMood/moodReflection) agrupada por humor. Só entra na lista humores com pelo
  // menos 1 entrada com habitsPct gravado — não existe dado anterior a 13/08/2026 pra
  // reconstruir, então a lista começa vazia/esparsa e cresce com o uso.
  const moodCorrelation=MOOD_OPTS.map(m=>{
    const entries=moodLog.filter(e=>e.mood===m.v&&e.habitsPct!=null);
    if(!entries.length) return null;
    const avg=Math.round(entries.reduce((s,e)=>s+e.habitsPct,0)/entries.length);
    return {...m, avg, count:entries.length};
  }).filter(Boolean);

  // ── SCORE BRIDGE → Árvore ────────────────────────────────────────────────
  useEffect(()=>{
    if(!loaded) return;
    try{
      const raw=localStorage.getItem("lifetree_scores");
      const scores=raw?JSON.parse(raw):{};
      scores["tiphareth"]={score:tiphScore,updatedAt:new Date().toISOString()};
      localStorage.setItem("lifetree_scores",JSON.stringify(scores));
    }catch{}
  },[tiphScore,loaded]);

  // Marca/desmarca uma dose de hoje — upsert por medId+time+data (não acumula duplicata
  // se clicado mais de uma vez no mesmo dia).
  const toggleMedication=(med,time)=>{
    const today=todayS();
    setMedLog(prev=>{
      const existing=prev.find(l=>l.medId===med.id&&l.time===time&&l.date===today);
      if(existing) return prev.map(l=>l===existing?{...l,taken:!l.taken}:l);
      return [...prev,{id:"ml"+uid(),medId:med.id,date:today,time,taken:true}];
    });
  };

  // ─── WIDGET CUSTOMIZER SHEET ─────────────────────────────────────────────────
  const WidgetCustomizer=()=>(
    <Sheet title="Personalizar Dashboard" onClose={close}>
      <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Ative ou desative os blocos do seu dashboard. Arraste para reordenar em breve.</div>
      {WIDGET_CATALOG.map(w=>{
        const on=activeWidgets.includes(w.id);
        return(
          <div key={w.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:C.bg,borderRadius:10,marginBottom:8,border:"1px solid "+(on?ACCENT+"44":C.b1)}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:on?C.text:C.muted}}>{w.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{w.desc}</div>
            </div>
            <button onClick={()=>setW(prev=>on?prev.filter(x=>x!==w.id):[...prev,w.id])}
              style={{width:40,height:22,borderRadius:99,cursor:"pointer",border:"none",background:on?ACCENT:C.b2,position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </button>
          </div>
        );
      })}
      <div style={{marginTop:6}}>
        <Btn color={C.muted} outline sm full={false} onClick={()=>setW(DEFAULT_WIDGETS)}>Restaurar padrão</Btn>
      </div>
    </Sheet>
  );

  // ─── TIPHARETH TAB ────────────────────────────────────────────────────────────
  const W=(id)=>activeWidgets.includes(id);

  const TiphTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      {/* Botão customizar */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>openSh("widgets")}
          style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:700,color:C.muted}}>
          <Ico n="layout" size={11} color={C.muted}/> Personalizar
        </button>
      </div>

      {/* WIDGET: Score principal */}
      {W("score")&&(
        <Card style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>TIPHARETH — AUTOCUIDADO</div>
              <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{tiphScore}<span style={{fontSize:18}}>%</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
              {[{l:"Hábitos",v:habitScore,c:ACCENT,tab:"aparencia"},{l:"Rotinas",v:rotinaScore,c:"#f97316",tab:"rotinas"},{l:"Metas",v:goalScore,c:"#10b981",tab:null}].map(m=>(
                <div key={m.l} onClick={()=>m.tab&&setTab(m.tab)} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:m.tab?"pointer":"default",border:"1px solid "+m.c+"22"}}>
                  <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                  <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
                </div>
              ))}
            </div>
          </div>
          <ProgressBar value={tiphScore} color={"linear-gradient(90deg,"+ACCENT+",#fbbf24)"} height={6}/>
        </Card>
      )}

      {/* WIDGET: XP & Nível */}
      {W("xp_bar")&&(
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>XP & NÍVEL</div>
            <Badge label={"Nível "+level} color={"#fbbf24"}/>
          </div>
          <ProgressBar value={xpInLevel/2} color={"#fbbf24"} height={6}/>
          <div style={{fontSize:9,color:C.muted,marginTop:4}}>{xpInLevel}/200 XP para o próximo nível · {xp} total</div>
        </Card>
      )}
      {/* WIDGET: Humor */}
      {W("mood")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>COMO VOCÊ ESTÁ HOJE?</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {MOOD_OPTS.map(m=>(
              <button key={m.v} onClick={()=>pickMood(m.v)}
                style={{padding:"6px 12px",borderRadius:99,cursor:"pointer",fontSize:11,fontWeight:600,background:mood===m.v?m.c+"22":"transparent",border:"1.5px solid "+(mood===m.v?m.c:C.b2),color:mood===m.v?m.c:C.muted}}>
                {m.l}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* WIDGET: Diário de Humor (histórico direcionado) */}
      {W("mood_history")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>DIÁRIO DE HUMOR — 14 DIAS</div>
          <MoodHistoryStrip moodLog={moodLog} onReflect={()=>openSh("moodReflection",{...( moodLog.find(e=>e.date===todayS())||{influencia:"",gratidao:""})})}/>
        </Card>
      )}

      {/* WIDGET: Remédios de hoje */}
      {W("remedios_hoje")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>REMÉDIOS DE HOJE</div>
          <MedicationTodayChecklist medications={medications} medicationLog={medicationLog} onToggle={toggleMedication}/>
        </Card>
      )}

      {/* WIDGET: Streaks */}
      {W("streaks")&&(
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={{flex:1,background:C.card,border:"1px solid "+ACCENT+"22",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:900,color:ACCENT}}>🔥 {moodStreak}</div>
            <div style={{fontSize:8,color:C.muted,marginTop:2}}>dias registrando humor</div>
          </div>
          <div style={{flex:1,background:C.card,border:"1px solid #6366f122",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:900,color:"#6366f1"}}>🔥 {routineStreak}</div>
            <div style={{fontSize:8,color:C.muted,marginTop:2}}>dias completando rotina</div>
          </div>
        </div>
      )}

      {/* WIDGET: Correlação Humor × Hábitos */}
      {W("mood_correlation")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>HUMOR × HÁBITOS</div>
          {moodCorrelation.length===0
            ? <div style={{fontSize:10,color:C.muted}}>Ainda sem dados suficientes — registre humor por alguns dias pra ver o padrão aparecer aqui.</div>
            : moodCorrelation.map(m=>(
              <div key={m.v} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                <span style={{fontSize:11,width:90,flexShrink:0,color:m.c,fontWeight:600}}>{m.l}</span>
                <div style={{flex:1}}><ProgressBar value={m.avg} color={m.c} height={5}/></div>
                <span style={{fontSize:10,color:C.muted,width:70,textAlign:"right"}}>{m.avg}% · {m.count}d</span>
              </div>
            ))}
        </Card>
      )}

      {/* WIDGET: Hábitos de outros módulos (hub, read-only) — só aparece quando pelo menos
          um módulo está ligado em Config → Hub de Hábitos; parametrizado por módulo,
          nenhum ligado por padrão. */}
      {hubHabitsByModule.length>0&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>HÁBITOS DE OUTROS MÓDULOS</div>
          <div style={{fontSize:9,color:C.muted,marginBottom:10}}>Somente leitura — marcar como feito continua na tela de origem.</div>
          {hubHabitsByModule.map(m=>(
            <div key={m.id} style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:m.color,marginBottom:4}}>{m.label}</div>
              {m.items.map(h=>(
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
                  <div style={{width:14,height:14,borderRadius:4,flexShrink:0,background:h.done?m.color+"22":C.b1,border:"1px solid "+(h.done?m.color:C.b2),display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {h.done&&<Ico n="check" size={9} color={m.color}/>}
                  </div>
                  <span style={{fontSize:11,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

      {/* Resumo semanal do Coach */}
      {askCoach&&(
        <Btn outline color={ACCENT} style={{marginBottom:14}} onClick={()=>{
          askCoach("Faça um resumo da minha semana de autocuidado: humor, hábitos e rotinas. Aponte padrões que valem a pena notar.");
          toast_("Perguntado ao Coach — veja a resposta na barra abaixo");
        }}><Ico n="sparkle" size={13}/> Resumo da semana (Coach)</Btn>
      )}

      {/* WIDGET: Rotinas rápidas */}
      {W("rotinas_quick")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>ROTINAS DE HOJE</div>
          {rotinas.map(r=>{
            const done=r.steps.filter(s=>s.done).length;
            const pct=r.steps.length?Math.round(done/r.steps.length*100):0;
            const tc=r.time==="manhã"?"#f59e0b":"#6366f1";
            return(
              <div key={r.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:600,color:tc,marginBottom:4}}>
                  <span>{r.name}</span><span>{done}/{r.steps.length}</span>
                </div>
                <ProgressBar value={pct} color={tc} height={5}/>
              </div>
            );
          })}
        </Card>
      )}

      {/* WIDGET: Metas */}
      {W("metas_widget")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>METAS</div>
          {goals.slice(0,3).map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:"1px solid "+C.b1}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:g.done?"#10b981":C.b2,flexShrink:0}}/>
              <span style={{fontSize:11,flex:1,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</span>
              <Badge label={g.xp+" XP"} color={g.done?"#10b981":C.muted}/>
            </div>
          ))}
        </Card>
      )}

      {/* WIDGET: Frase do dia */}
      {W("quote")&&(
        <div style={{background:"linear-gradient(135deg,#8b5cf622,#6366f111)",border:"1px solid #8b5cf633",borderRadius:14,padding:16,marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:13,fontStyle:"italic",color:"#8b5cf6",lineHeight:1.6}}>
            "Cuidar de si mesma não é egoísmo — é a base de tudo."
          </div>
          <div style={{fontSize:9,color:C.muted,marginTop:6}}>Afirmação do dia</div>
        </div>
      )}

      {/* WIDGET: Hábitos */}
      {W("habitos_hoje")&&(
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS DE HOJE</div>
            <span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{allHabits.filter(h=>h.done).length}/{allHabits.length}</span>
          </div>
          {allHabits.map(h=>(
            <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>{
                if(!h.done)setXP(x=>x+h.xp);
                if(h.area==="aparencia")setAH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));
                else setBH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));
              }} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
                <div style={{fontSize:9,color:C.muted}}>{h.area==="aparencia"?"Aparência":"Bem-estar"} · {h.freq}</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
            </div>
          ))}
        </Card>
      )}

    </div>
  );

  // ─── APARÊNCIA TAB ────────────────────────────────────────────────────────────
  const AparenciaTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Aparência</div><div style={{fontSize:10,color:C.muted}}>Skincare, cabelo e estilo</div></div>
        <Btn sm full={false} onClick={()=>openSh("addAparenciaHabit",{title:"",freq:"Diário",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700}}>Meus Produtos</div>
        <Btn sm full={false} onClick={()=>openSh("addProduto",{name:"",category:"Limpeza",freq:"",notes:""})}><Ico n="plus" size={11}/> Produto</Btn>
      </div>
      {produtos.map(p=>(
        <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}>
          <div style={{width:28,height:28,borderRadius:8,background:ACCENT+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="droplet" size={14} color={ACCENT}/></div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{p.name}</div><div style={{fontSize:9,color:C.muted}}>{p.category} · {p.freq}</div></div>
          <button onClick={()=>openSh("editProduto",{...p})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
          <button onClick={()=>{setP(prev=>prev.filter(x=>x.id!==p.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Hábitos de Aparência</div>
      {aparenciaHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXP(x=>x+h.xp);setAH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>{setAH(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ─── BEM-ESTAR TAB ────────────────────────────────────────────────────────────
  const BemestarTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Bem-estar</div><div style={{fontSize:10,color:C.muted}}>Autoestima, prazer e presença</div></div>
        <Btn sm full={false} onClick={()=>openSh("addBemestarHabit",{title:"",freq:"Diário",xp:20})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>

      {/* Diário de Humor — histórico direcionado (resolve o gap "mood só tinha valor atual") */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Diário de Humor</div>
        <MoodHistoryStrip moodLog={moodLog} onReflect={()=>openSh("moodReflection",{...(moodLog.find(e=>e.date===todayS())||{influencia:"",gratidao:""})})}/>
        {moodLog.length>0&&(
          <div style={{marginTop:12}}>
            {[...moodLog].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7).map(e=>{
              const m=MOOD_OPTS.find(o=>o.v===e.mood);
              return(
                <div key={e.id} style={{padding:"8px 0",borderTop:"1px solid "+C.b1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:e.influencia||e.gratidao?4:0}}>
                    <span style={{fontSize:10,fontWeight:700,color:m?.c||C.muted}}>{e.date} · {m?.l||e.mood}</span>
                  </div>
                  {e.influencia&&<div style={{fontSize:10,color:C.text,marginBottom:2}}>💭 {e.influencia}</div>}
                  {e.gratidao&&<div style={{fontSize:10,color:C.text}}>🙏 {e.gratidao}</div>}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Remédios */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700}}>Remédios</div>
        <Btn sm full={false} onClick={()=>openSh("addMedication",{name:"",dosage:"",times:"",notes:""})}><Ico n="plus" size={11}/> Remédio</Btn>
      </div>
      {medications.length===0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhum remédio cadastrado.</div>}
      {medications.map(m=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(m.active===false?C.b1:ACCENT+"22"),borderRadius:10,marginBottom:6}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:m.active===false?C.muted:C.text}}>{m.name}</div>
            <div style={{fontSize:9,color:C.muted}}>{m.dosage}{m.times?.length?" · "+m.times.join(", "):""}</div>
          </div>
          <button onClick={()=>setMeds(prev=>prev.map(x=>x.id===m.id?{...x,active:x.active===false}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
            <Badge label={m.active===false?"Inativo":"Ativo"} color={m.active===false?C.muted:"#10b981"}/>
          </button>
          <button onClick={()=>openSh("editMedication",{...m,times:(m.times||[]).join(", ")})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
          <button onClick={()=>{setMeds(prev=>prev.filter(x=>x.id!==m.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
      {medications.some(m=>m.active!==false)&&(
        <Card style={{marginBottom:14,marginTop:8}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>DOSES DE HOJE</div>
          <MedicationTodayChecklist medications={medications} medicationLog={medicationLog} onToggle={toggleMedication}/>
        </Card>
      )}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700}}>Metas</div>
        <Btn sm full={false} onClick={()=>openSh("addGoal",{title:"",area:"bemestar",xp:100})}><Ico n="plus" size={11}/> Meta</Btn>
      </div>
      {goals.map(g=>(
        <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(g.done?ACCENT+"33":C.b1),borderRadius:10,marginBottom:6}}>
          <button onClick={()=>{if(!g.done)setXP(x=>x+g.xp);setG(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?ACCENT:C.b2),background:g.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div><div style={{fontSize:9,color:C.muted}}>{g.area}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{g.xp}</span>
          <button onClick={()=>openSh("editGoal",{...g})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
          <button onClick={()=>{setG(p=>p.filter(x=>x.id!==g.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Hábitos de Bem-estar</div>
      {bemestarHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXP(x=>x+h.xp);setBH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>{setBH(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ─── ROTINAS TAB ──────────────────────────────────────────────────────────────
  const RotinasTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Rotinas</div><div style={{fontSize:10,color:C.muted}}>Seus rituais de autocuidado</div></div>
        <Btn sm full={false} onClick={()=>openSh("addRotina",{name:"",time:"manhã"})}><Ico n="plus" size={11}/> Rotina</Btn>
      </div>
      {rotinas.map(r=>{
        const done=r.steps.filter(s=>s.done).length;const total=r.steps.length;
        const pct=total?Math.round(done/total*100):0;const tc=r.time==="manhã"?"#f59e0b":"#6366f1";
        return(
          <Card key={r.id} color={tc} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Ico n="clock" size={14} color={tc}/>
                <div><div style={{fontSize:13,fontWeight:800,color:tc}}>{r.name}</div><div style={{fontSize:9,color:C.muted}}>{done}/{total} passos · {r.time}</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openSh("addStep",{rotinaId:r.id,title:"",min:2})} style={{background:tc+"18",border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" size={12} color={tc}/></button>
                <button onClick={()=>setR(p=>p.filter(x=>x.id!==r.id))} style={{background:C.b1,border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color={C.muted}/></button>
              </div>
            </div>
            <ProgressBar value={pct} color={tc} height={4}/>
            <div style={{marginTop:10}}>
              {r.steps.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderTop:"1px solid "+C.b1}}>
                  <button onClick={()=>{
                    const updatedSteps=r.steps.map(st=>st.id===s.id?{...st,done:!st.done}:st);
                    setR(p=>p.map(ro=>ro.id===r.id?{...ro,steps:updatedSteps}:ro));
                    logRoutineCompletionIfDone({...r,steps:updatedSteps});
                  }}
                    style={{width:19,height:19,borderRadius:5,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(s.done?tc:C.b2),background:s.done?tc:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {s.done&&<Ico n="check" size={10} color="#fff" sw={2.5}/>}
                  </button>
                  <div style={{flex:1,fontSize:12,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none"}}>{s.title}</div>
                  <span style={{fontSize:9,color:C.muted}}>{s.min}min</span>
                  <button onClick={()=>openSh("editStep",{rotinaId:r.id,stepId:s.id,title:s.title,min:s.min})} style={{background:C.b1,border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={10} color={C.muted}/></button>
                  <button onClick={()=>setR(p=>p.map(ro=>ro.id===r.id?{...ro,steps:ro.steps.filter(st=>st.id!==s.id)}:ro))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                </div>
              ))}
            </div>
            {done===total&&total>0&&<div style={{marginTop:8,textAlign:"center",fontSize:11,color:tc,fontWeight:700}}>✓ Rotina completa!</div>}
          </Card>
        );
      })}
    </div>
  );

  // ─── CONFIG TAB ───────────────────────────────────────────────────────────────
  const ConfigTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:ACCENT+"11",border:"2px solid "+ACCENT+"33",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE TIPHARETH</div>
        <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{tiphScore}<span style={{fontSize:16}}>%</span></div>
        <div style={{fontSize:12,color:ACCENT,fontWeight:700,marginTop:4}}>Nível {level}</div>
      </div>
      <div style={{background:C.card,border:"1px solid #10b98133",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <Ico n="save" size={14} color="#10b981"/>
        <div><div style={{fontSize:11,fontWeight:600,color:"#10b981"}}>Dados salvos automaticamente</div><div style={{fontSize:9,color:C.muted}}>Persistência via Storage API</div></div>
      </div>
      <Card style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700}}>Dashboard</span>
          <Btn sm full={false} onClick={()=>openSh("widgets")}><Ico n="layout" size={11}/> Personalizar</Btn>
        </div>
        <div style={{fontSize:10,color:C.muted}}>{activeWidgets.length} de {WIDGET_CATALOG.length} widgets ativos</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
          {WIDGET_CATALOG.map(w=>(
            <span key={w.id} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:activeWidgets.includes(w.id)?ACCENT+"22":C.b1,color:activeWidgets.includes(w.id)?ACCENT:C.muted,fontWeight:600}}>{w.label}</span>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Hub de Hábitos</div>
        <div style={{fontSize:9,color:C.muted,marginBottom:10}}>Mostra aqui, só leitura, os hábitos dos módulos que você ligar. Marcar como feito continua na tela de origem. Todos desligados por padrão — ligue um de cada vez pra testar se faz sentido.</div>
        {HUB_MODULE_IDS.map(id=>{
          const adapter=HUB_ADAPTERS[id];
          const on=!!hubModules[id];
          return(
            <div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 10px",background:C.bg,borderRadius:9,marginBottom:6,border:"1px solid "+(on?adapter.color+"44":C.b1)}}>
              <div style={{flex:1,fontSize:12,fontWeight:600,color:on?adapter.color:C.text}}>{adapter.label}</div>
              <button onClick={()=>setHM(prev=>({...prev,[id]:!prev[id]}))}
                style={{width:40,height:22,borderRadius:99,cursor:"pointer",border:"none",background:on?adapter.color:C.b2,position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </button>
            </div>
          );
        })}
      </Card>
      <div style={{paddingTop:10,borderTop:"1px solid "+C.b1}}>
        <Btn outline color="#ef4444" onClick={()=>{
          if(window.confirm("Apagar todos os dados?")) {
            setAH(D_APARENCIA_HABITS);setBH(D_BEMESTAR_HABITS);setR(D_ROTINAS);
            setG(D_GOALS);setP(D_PRODUTOS);setXP(0);
            setML(D_MOOD_LOG);setMeds(D_MEDICATIONS);setMedLog(D_MEDICATION_LOG);
            setHM(DEFAULT_HUB_MODULES);setRCL([]);
            toast_("Dados resetados","#ef4444");
          }
        }}><Ico n="trash" size={13} color="#ef4444"/> Resetar todos os dados</Btn>
      </div>
    </div>
  );

  if(!loaded) return(
    <ThemeCtx.Provider value={C}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>✨</div><div style={{fontSize:12}}>Carregando Tiphareth…</div></div>
    </div>
    </ThemeCtx.Provider>
  );

  return(
    <ThemeCtx.Provider value={C}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}"}</style>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>}
      {/* BOTÃO VOLTAR → ÁRVORE */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Tiphareth · Autocuidado</span>
      </div>
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>TIPHARETH</div><div style={{fontSize:18,fontWeight:800}}>Autocuidado</div></div>
        <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
        </button>
      </div>
      <div style={{padding:"10px 16px 90px"}}>
        {tab==="tiph"    &&TiphTab()}
        {tab==="aparencia"&&AparenciaTab()}
        {tab==="bemestar"&&BemestarTab()}
        {tab==="rotinas" &&RotinasTab()}
        {tab==="cfg"     &&ConfigTab()}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{const a=tab===t.id;return(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}>
            <div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
              <Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/>
            </div>
            {a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}
            {!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}
          </button>
        );})}
      </div>

      {/* SHEETS */}
      {sh==="widgets"&&WidgetCustomizer()}
      {sh==="addAparenciaHabit"&&<Sheet title="Novo Hábito de Aparência" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Aplicar protetor solar"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setAH(p=>[...p,{id:"ah"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false,area:"aparencia"}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="addBemestarHabit"&&<Sheet title="Novo Hábito de Bem-estar" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: 10 min só para mim"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||20} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setBH(p=>[...p,{id:"bh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||20,done:false,area:"bemestar"}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="addGoal"&&<Sheet title="Nova Meta" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Manter skincare 30 dias"/><FS label="Área" value={f.area||"bemestar"} onChange={v=>F({area:v})} opts={[{v:"aparencia",l:"Aparência"},{v:"bemestar",l:"Bem-estar"}]}/><FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setG(p=>[...p,{id:"g"+uid(),title:f.title,area:f.area||"bemestar",xp:Number(f.xp)||100,done:false}]);toast_("Meta criada");close();}}>Criar</Btn></Sheet>}
      {sh==="editGoal"&&<Sheet title="Editar Meta" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/><FS label="Área" value={f.area||"bemestar"} onChange={v=>F({area:v})} opts={[{v:"aparencia",l:"Aparência"},{v:"bemestar",l:"Bem-estar"}]}/><FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{setG(p=>p.map(x=>x.id===f.id?{...x,title:f.title,area:f.area,xp:Number(f.xp)}:x));toast_("Atualizada");close();}}>Salvar</Btn></Sheet>}
      {sh==="addProduto"&&<Sheet title="Novo Produto" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Protetor Solar FPS 50"/><FS label="Categoria" value={f.category||"Limpeza"} onChange={v=>F({category:v})} opts={["Limpeza","Hidratação","Proteção","Sérum","Tônico","Óleo","Esfoliante","Cabelo","Outro"].map(x=>({v:x,l:x}))}/><FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})} placeholder="Ex: manhã e noite"/><FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/><Btn color={ACCENT} onClick={()=>{if(!f.name)return;setP(p=>[...p,{id:"p"+uid(),name:f.name,category:f.category||"Limpeza",freq:f.freq||"",notes:f.notes||""}]);toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editProduto"&&<Sheet title="Editar Produto" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/><FS label="Categoria" value={f.category||"Limpeza"} onChange={v=>F({category:v})} opts={["Limpeza","Hidratação","Proteção","Sérum","Tônico","Óleo","Esfoliante","Cabelo","Outro"].map(x=>({v:x,l:x}))}/><FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})}/><FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/><Btn color={ACCENT} onClick={()=>{setP(p=>p.map(x=>x.id===f.id?{...x,name:f.name,category:f.category,freq:f.freq,notes:f.notes}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addRotina"&&<Sheet title="Nova Rotina" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Rotina Matinal"/><FS label="Período" value={f.time||"manhã"} onChange={v=>F({time:v})} opts={[{v:"manhã",l:"Manhã"},{v:"noite",l:"Noite"},{v:"tarde",l:"Tarde"}]}/><Btn color={ACCENT} onClick={()=>{if(!f.name)return;setR(p=>[...p,{id:"r"+uid(),name:f.name,time:f.time||"manhã",steps:[]}]);toast_("Criada");close();}}>Criar</Btn></Sheet>}
      {sh==="addStep"&&<Sheet title="Novo Passo" onClose={close}><FI label="Descrição" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Aplicar hidratante"/><FI label="Duração (min)" value={f.min||2} onChange={v=>F({min:v})} type="number" min={1}/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setR(p=>p.map(r=>r.id===f.rotinaId?{...r,steps:[...r.steps,{id:"rs"+uid(),title:f.title,done:false,min:Number(f.min)||2}]}:r));toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editStep"&&<Sheet title="Editar Passo" onClose={close}><FI label="Descrição" value={f.title||""} onChange={v=>F({title:v})}/><FI label="Duração (min)" value={f.min||2} onChange={v=>F({min:v})} type="number" min={1}/><Btn color={ACCENT} onClick={()=>{setR(p=>p.map(r=>r.id===f.rotinaId?{...r,steps:r.steps.map(s=>s.id===f.stepId?{...s,title:f.title,min:Number(f.min)||2}:s)}:r));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="moodReflection"&&(
        <Sheet title="Refletir sobre hoje" onClose={close}>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Humor de hoje: <b style={{color:C.text}}>{MOOD_OPTS.find(o=>o.v===mood)?.l||mood}</b> — mude no widget "Como você está hoje?" se precisar.</div>
          {MOOD_PROMPTS.map(p=>(
            <FTA key={p.k} label={p.q} value={f[p.k]||""} onChange={v=>F({[p.k]:v})} rows={2}/>
          ))}
          <Btn color={ACCENT} onClick={()=>{
            const today=todayS();
            setML(prev=>{
              const existing=prev.find(e=>e.date===today);
              if(existing) return prev.map(e=>e.date===today?{...e,influencia:f.influencia||"",gratidao:f.gratidao||"",habitsPct:habitsPctNow}:e);
              return [...prev,{id:"ml"+uid(),date:today,mood,influencia:f.influencia||"",gratidao:f.gratidao||"",habitsPct:habitsPctNow}];
            });
            toast_("Refletido 🌿");close();
          }}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addMedication"&&(
        <Sheet title="Novo Remédio" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Vitamina D"/>
          <FI label="Dosagem" value={f.dosage||""} onChange={v=>F({dosage:v})} placeholder="Ex: 1 cápsula"/>
          <FI label="Horários" value={f.times||""} onChange={v=>F({times:v})} placeholder="Ex: 08:00, 20:00"/>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.name)return;
            const times=(f.times||"").split(",").map(t=>t.trim()).filter(Boolean);
            setMeds(p=>[...p,{id:"med"+uid(),name:f.name,dosage:f.dosage||"",times,notes:f.notes||"",active:true}]);
            toast_("Remédio adicionado");close();
          }}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="editMedication"&&(
        <Sheet title="Editar Remédio" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
          <FI label="Dosagem" value={f.dosage||""} onChange={v=>F({dosage:v})}/>
          <FI label="Horários" value={f.times||""} onChange={v=>F({times:v})} placeholder="Ex: 08:00, 20:00"/>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/>
          <Btn color={ACCENT} onClick={()=>{
            const times=(f.times||"").split(",").map(t=>t.trim()).filter(Boolean);
            setMeds(p=>p.map(x=>x.id===f.id?{...x,name:f.name,dosage:f.dosage||"",times,notes:f.notes||""}:x));
            toast_("Atualizado");close();
          }}>Salvar</Btn>
        </Sheet>
      )}
    </div>
    </ThemeCtx.Provider>
  );
}
