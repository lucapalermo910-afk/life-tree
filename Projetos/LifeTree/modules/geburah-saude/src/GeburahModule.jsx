import { useState, useEffect, useRef, useCallback } from "react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const DARK  = { bg:"#07090f",surface:"#0c1018",card:"#0f1520",b1:"#182030",b2:"#253040",text:"#eef2ff",muted:"#44556a",dim:"#7a8fa8",nav:"#060b12" };
const LIGHT = { bg:"#fff5f5",surface:"#ffffff",card:"#fff8f8",b1:"#fdd",b2:"#f9a8a8",text:"#1a0505",muted:"#8a5a5a",dim:"#4a1a1a",nav:"#fff5f5" };
const ACCENT = "#ef4444";
const ORANGE = "#f97316";
const GREEN  = "#10b981";
const BLUE   = "#3b82f6";
const PURPLE = "#8b5cf6";
const AMBER  = "#f59e0b";

const uid    = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);
const fmt1   = n  => Number(n).toFixed(1);
const fmtKg  = n  => fmt1(n)+"kg";
const clamp  = (v,a,b) => Math.min(b,Math.max(a,v));

// ── STORAGE ───────────────────────────────────────────────────────────────────
const PREFIX = "lifetree_geb_";
function sGet(key) {
  try { const v = localStorage.getItem(PREFIX+key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function sSet(key, val) {
  try { localStorage.setItem(PREFIX+key, JSON.stringify(val)); } catch {}
}
function usePersisted(key, def) {
  const [v, setV] = useState(def);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return; loaded.current = true;
    const s = sGet(key); if (s !== null) setV(s);
  }, [key]);
  const set = useCallback(fn => {
    setV(prev => { const next = typeof fn === "function" ? fn(prev) : fn; sSet(key, next); return next; });
  }, [key]);
  return [v, set];
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const IC = {
  plus:"M12 5v14M5 12h14", x:"M18 6 6 18M6 6l12 12", back:"M19 12H5m7 7-7-7 7-7",
  check:"M20 6 9 17l-5-5", edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  zap:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  flame:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  dumbbell:["M14.4 14.4 9.6 9.6","M18 6l-2.2-2.2a1 1 0 0 0-1.4 0l-5.2 5.2a1 1 0 0 0 0 1.4L11.4 12","M6 18l2.2 2.2a1 1 0 0 0 1.4 0l5.2-5.2a1 1 0 0 0 0-1.4L12.6 12","M4 20l2-2","M20 4l-2 2"],
  apple:["M12 20.94c1.5 0 4-1.73 4-6.94C16 8 13.5 6 12 6C10.5 6 8 8 8 14c0 5.21 2.5 6.94 4 6.94Z","M12 6C12 6 12 2 9 2"],
  ruler:["M3 3l18 18","M3 9V3h6","M21 15v6h-6","M10.5 3v4","M13.5 3v4","M3 10.5h4","M3 13.5h4","M17 21v-4","M20 21v-4","M21 17h-4","M21 20h-4"],
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  refresh:"M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9M21 3v5h-5M3 21v-5h5",
  droplet:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z",
  trophy:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z",
  timer:"M10 2h4M12 14l-3-3M12 2v3M20.2 12.2A9 9 0 1 1 12 3",
  send:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
  chat:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  trend:"M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  target:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  calendar:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  scale:"M12 3v18M3 9h18M8 3l4 6 4-6M8 21l4-6 4 6M3 15a6 6 0 0 0 6-6M15 15a6 6 0 0 0 6-6",
  utensils:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
  fire:"M12 12c0-3-2.5-5-2.5-8C9.5 2 12 2 12 2s2.5 0 2.5 2c0 3-2.5 5-2.5 8z M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  lightning:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  move:"M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20",
  close2:"M18 6 6 18M6 6l12 12",
};
function Ico({n,size=16,color="currentColor",sw=1.5}){
  const d=IC[n]; if(!d)return null;
  const parts=Array.isArray(d)?d:d.split(/(?=M)/).filter(Boolean);
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {parts.map((p,i)=>{if(p.startsWith("circle")){const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);if(m)return<circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;}return<path key={i} d={p}/>;})}</svg>);
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Sheet({title,onClose,children,wide}){return(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:wide?600:430,padding:"0 18px 34px",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}>
        <div style={{width:32,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700}}>{title}</span>
          <button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={13} color={C.dim}/></button>
        </div>
      </div>
      {children}
    </div>
  </div>
);}
function FI({label,value,onChange,type="text",placeholder,min,max,step,hint}){return(
  <div style={{marginBottom:11}}>
    {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
    <input type={type} value={value} placeholder={placeholder} min={min} max={max} step={step}
      onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
      style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    {hint&&<div style={{fontSize:9,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);}
function FTA({label,value,onChange,placeholder,rows=3}){return(
  <div style={{marginBottom:11}}>
    {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
    <textarea value={value} placeholder={placeholder} rows={rows} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}}/>
  </div>
);}
function FS({label,value,onChange,opts}){return(
  <div style={{marginBottom:11}}>
    {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);}
function Btn({children,onClick,color,sm,outline,full=true,style:s={},disabled}){
  const c=color||ACCENT;
  return(<button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"7px 13px":"11px 18px",borderRadius:10,cursor:disabled?"default":"pointer",background:outline?"transparent":"linear-gradient(135deg,"+c+"dd,"+c+"88)",border:outline?"1.5px solid "+c:"none",color:outline?c:"#fff",fontWeight:700,fontSize:sm?11:13,width:full?"100%":"auto",opacity:disabled?0.6:1,...s}}>{children}</button>);
}
function Card({children,color,style:s={}}){return<div style={{background:C.card,border:"1px solid "+(color?color+"22":C.b1),borderRadius:14,padding:14,...s}}>{children}</div>;}
function Bar({value,color,height=5}){return<div style={{height,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:clamp(value,0,100)+"%",background:color||ACCENT,borderRadius:99,transition:"width .5s"}}/></div>;}
function Badge({label,color}){return<span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:(color||ACCENT)+"22",color:color||ACCENT,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;}

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TABS=[{id:"geb",icon:"treelife",label:"Geburah"},{id:"treino",icon:"dumbbell",label:"Treino"},{id:"nutri",icon:"apple",label:"Nutrição"},{id:"medidas",icon:"ruler",label:"Medidas"},{id:"cfg",icon:"gear",label:"Config"}];
const GRUPOS=["Peito","Costas","Ombros","Bíceps","Tríceps","Pernas","Glúteos","Core","Cardio","Flexibilidade"];
const CATS_AL=["Proteína","Carboidrato","Gordura","Fruta","Vegetal","Laticínio","Bebida","Outro"];
const MEDIDAS_P=["Peso","Cintura","Quadril","Peito","Braço D","Braço E","Coxa D","Coxa E"];
const REFEICOES=["Café da manhã","Lanche","Almoço","Lanche tarde","Jantar","Ceia"];
const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];

// Widget catalog
const WIDGET_CATALOG = [
  {type:"score-geburah",  label:"Score Geburah",    icon:"treelife", color:ACCENT,  desc:"Score geral + sub-scores"},
  {type:"peso-hero",      label:"Peso vs Meta",      icon:"scale",    color:GREEN,   desc:"Pesagem de hoje vs meta do dia"},
  {type:"macros-hoje",    label:"Macros do Dia",     icon:"apple",    color:ORANGE,  desc:"Calorias, proteína, carb, gordura"},
  {type:"agua",           label:"Água",              icon:"droplet",  color:BLUE,    desc:"Consumo de água do dia"},
  {type:"streak",         label:"Streak de Treinos", icon:"flame",    color:AMBER,   desc:"Dias consecutivos treinando"},
  {type:"treino-hoje",    label:"Treino de Hoje",    icon:"dumbbell", color:ACCENT,  desc:"Rotina sugerida para hoje"},
  {type:"pr-board",       label:"Recordes (PRs)",    icon:"trophy",   color:AMBER,   desc:"Seus recordes de carga"},
  {type:"meta-peso",      label:"Progresso do Peso", icon:"target",   color:GREEN,   desc:"Barra de progresso até a meta"},
  {type:"ai-insight",     label:"Insight IA",        icon:"zap",      color:PURPLE,  desc:"Último diagnóstico da IA"},
  {type:"planejamento",   label:"Plano Semanal",     icon:"calendar", color:ORANGE,  desc:"Refeições planejadas da semana"},
];

const DEFAULT_LAYOUT = [
  {id:"w1",type:"score-geburah",size:"full"},
  {id:"w2",type:"peso-hero",    size:"full"},
  {id:"w3",type:"macros-hoje",  size:"full"},
  {id:"w4",type:"agua",         size:"half"},
  {id:"w5",type:"streak",       size:"half"},
  {id:"w6",type:"treino-hoje",  size:"full"},
];

// ── DEFAULT DATA ──────────────────────────────────────────────────────────────
const D_EX=[
  {id:"e1",name:"Supino Reto",     grupo:"Peito",       equip:"Barra",       inst:"Deite no banco, desça a barra até o peito, empurre explosivo"},
  {id:"e2",name:"Agachamento",     grupo:"Pernas",      equip:"Barra",       inst:"Pés largura dos ombros, desça até 90°, joelhos para fora"},
  {id:"e3",name:"Levant. Terra",   grupo:"Costas",      equip:"Barra",       inst:"Pegada dupla, costas neutras, empurre o chão"},
  {id:"e4",name:"Desenvolvimento", grupo:"Ombros",      equip:"Halteres",    inst:"Sente ereto, empurre acima da cabeça sem arqueamento"},
  {id:"e5",name:"Rosca Direta",    grupo:"Bíceps",      equip:"Barra",       inst:"Cotovelos fixos ao corpo, suba controlado"},
  {id:"e6",name:"Tríceps Corda",   grupo:"Tríceps",     equip:"Cabo",        inst:"Empurre para baixo, abra as mãos no final"},
  {id:"e7",name:"Remada Curvada",  grupo:"Costas",      equip:"Barra",       inst:"Tronco 45°, puxe até o abdômen, escápulas juntas"},
  {id:"e8",name:"Leg Press",       grupo:"Pernas",      equip:"Máquina",     inst:"Pés no centro, desça controlado, não trave joelhos"},
  {id:"e9",name:"Prancha",         grupo:"Core",        equip:"Peso corporal",inst:"Corpo reto, não eleve o quadril, respire normalmente"},
  {id:"e10",name:"Corrida",        grupo:"Cardio",      equip:"Nenhum",      inst:"Pace moderado, respire pelo nariz"},
];
const D_ROT=[
  {id:"rt1",name:"Treino A — Peito/Tríceps",dias:["Segunda","Quinta"],exercicios:[
    {id:"re1",exercicioId:"e1",series:4,reps:"8-12",carga:60,descanso:90},
    {id:"re2",exercicioId:"e6",series:3,reps:"12-15",carga:25,descanso:60},
    {id:"re3",exercicioId:"e9",series:3,reps:"30s",carga:0,descanso:45},
  ]},
  {id:"rt2",name:"Treino B — Costas/Bíceps",dias:["Terça","Sexta"],exercicios:[
    {id:"re4",exercicioId:"e7",series:4,reps:"8-12",carga:50,descanso:90},
    {id:"re5",exercicioId:"e3",series:3,reps:"5-8",carga:80,descanso:120},
    {id:"re6",exercicioId:"e5",series:3,reps:"10-12",carga:20,descanso:60},
  ]},
  {id:"rt3",name:"Treino C — Pernas",dias:["Quarta","Sábado"],exercicios:[
    {id:"re7",exercicioId:"e2",series:4,reps:"8-12",carga:70,descanso:120},
    {id:"re8",exercicioId:"e8",series:3,reps:"12-15",carga:100,descanso:90},
  ]},
];
const D_AL=[
  {id:"al1",name:"Frango grelhado",   cat:"Proteína",   cal100:165,prot:31, carb:0,  gord:3.6},
  {id:"al2",name:"Arroz branco coz.", cat:"Carboidrato",cal100:130,prot:2.7,carb:28, gord:0.3},
  {id:"al3",name:"Ovo inteiro",       cat:"Proteína",   cal100:155,prot:13, carb:1.1,gord:11},
  {id:"al4",name:"Banana",            cat:"Fruta",      cal100:89, prot:1.1,carb:23, gord:0.3},
  {id:"al5",name:"Aveia",             cat:"Carboidrato",cal100:389,prot:17, carb:66, gord:7},
  {id:"al6",name:"Whey Protein",      cat:"Proteína",   cal100:400,prot:80, carb:8,  gord:6},
  {id:"al7",name:"Batata doce",       cat:"Carboidrato",cal100:86, prot:1.6,carb:20, gord:0.1},
  {id:"al8",name:"Azeite",            cat:"Gordura",    cal100:884,prot:0,  carb:0,  gord:100},
];
const D_REC=[
  {id:"rec1",name:"Bowl de Proteína",  desc:"Pós-treino perfeito",ingredientes:[{alimentoId:"al1",qtd:150},{alimentoId:"al2",qtd:100},{alimentoId:"al4",qtd:80}],steps:["Grelhe o frango temperado","Monte o bowl com o arroz","Adicione a banana fatiada por cima"]},
  {id:"rec2",name:"Mingau de Aveia",   desc:"Café da manhã energético",ingredientes:[{alimentoId:"al5",qtd:60},{alimentoId:"al4",qtd:120}],steps:["Misture aveia com 200ml de água ou leite","Cozinhe em fogo médio por 5 minutos","Adicione a banana amassada e sirva"]},
];

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function GeburahModule({ onBack }) {
  const [dark, setDark] = useState(false);
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
  const [exercicios,    setExercicios]    = usePersisted("exercicios",   D_EX);
  const [rotinasTreino, setRotinasTreino] = usePersisted("rotinasTreino",D_ROT);
  const [logTreino,     setLogTreino]     = usePersisted("logTreino",    []);
  const [alimentos,     setAlimentos]     = usePersisted("alimentos",    D_AL);
  const [receitas,      setReceitas]      = usePersisted("receitas",     D_REC);
  const [logDieta,      setLogDieta]      = usePersisted("logDieta",     []);
  const [pesosMeta,     setPesosMeta]     = usePersisted("pesosMeta",    {pesoAtual:88,pesoMeta:78,taxaSemanal:0.5,iniciou:todayS()});
  const [pesagens,      setPesagens]      = usePersisted("pesagens",     [
    {id:"ps1",data:"2026-05-01",peso:90.2},{id:"ps2",data:"2026-05-08",peso:89.5},
    {id:"ps3",data:"2026-05-15",peso:89.0},{id:"ps4",data:"2026-05-22",peso:88.5},
    {id:"ps5",data:todayS(),peso:88.0},
  ]);
  const [medidasCorp, setMedidasCorp] = usePersisted("medidasCorp",[
    {id:"mc1",data:"2026-05-01",medidas:{Peso:90.2,Cintura:92,Quadril:104,Peito:108,"Braço D":38,"Braço E":37.5,"Coxa D":62,"Coxa E":61.5}},
    {id:"mc2",data:todayS(),medidas:{Peso:88.0,Cintura:90,Quadril:103,Peito:107,"Braço D":38.5,"Braço E":38,"Coxa D":61,"Coxa E":61}},
  ]);
  const [metas,     setMetas]     = usePersisted("metas",    {cal:2200,prot:160,carb:220,gord:70});
  const [perfil,    setPerfil]    = usePersisted("perfil",   {nome:"Atleta",peso:88,altura:175,idade:30,sexo:"M",atividade:"moderado"});
  const [agua,      setAgua]      = usePersisted("agua",     {meta:3000,copos:[]});  // copos: [{id,data,ml}]
  const [planSem,   setPlanSem]   = usePersisted("planSem",  {}); // {YYYY-MM-DD_refeicao: [alimentoId,...]}
  const [widgetLayout, setWidgetLayout] = usePersisted("widgetLayout", DEFAULT_LAYOUT);
  const [coachHistory, setCoachHistory] = usePersisted("coachHistory", []);
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading,setAiLoading]  = useState(false);
  const [aiError,  setAiError]    = useState(null);
  const [widgetEditMode, setWidgetEditMode] = useState(false);
  const [timerAtivo, setTimerAtivo] = useState(null); // {segundos, exercicioNome}
  const timerRef = useRef(null);

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

  const todayLog = logDieta.filter(l=>l.data===todayS());
  const calcMacro = (field) => todayLog.reduce((s,l)=>{const al=alimentos.find(a=>a.id===l.alimentoId);return al?s+(al[field]*l.qtd/100):s;},0);
  const calHoje  = calcMacro("cal100");
  const protHoje = calcMacro("prot");
  const carbHoje = calcMacro("carb");
  const gordHoje = calcMacro("gord");

  // Streak
  const calcStreak = () => {
    const today = todayS();
    const dias = [...new Set(logTreino.map(l=>l.data))]
      .filter(d=>d<=today) // nunca contar futuro
      .sort((a,b)=>b.localeCompare(a));
    if(!dias.length) return 0;
    let streak=0; let cur=new Date(today);
    for(const d of dias){
      const dd=new Date(d);
      const diff=Math.round((cur-dd)/86400000);
      if(diff<=1){streak++;cur=dd;}else break;
    }
    return streak;
  };
  const streak = calcStreak();

  const treinos7d    = logTreino.filter(l=>{const d=new Date(l.data);const n=new Date();n.setDate(n.getDate()-7);return d>=n;}).length;
  const treinoScore  = Math.min(100,Math.round(treinos7d/4*100));
  const dietaScore   = metas.cal>0?Math.min(100,Math.round((calHoje/metas.cal)*100)):0;
  const pesoScore    = Math.max(0,Math.min(100,Math.round((1-faltaPerder/(pesosMeta.pesoAtual-pesoMeta+0.001))*100)));
  const gebScore     = Math.round(treinoScore*0.4+dietaScore*0.3+pesoScore*0.3);

  // PRs
  const prMap = {};
  logTreino.forEach(lt=>lt.series?.forEach(s=>{const c=s.cargaReal??s.carga;if(c>0)prMap[s.exercicioId]=Math.max(prMap[s.exercicioId]||0,c);}));

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

  // Timer
  useEffect(function InlineBlock(){
    if(!timerAtivo) return;
    if(timerAtivo.segundos<=0){ setTimerAtivo(null); return; }
    const id=setInterval(()=>setTimerAtivo(t=>t&&t.segundos>0?{...t,segundos:t.segundos-1}:null),1000);
    return()=>clearInterval(id);
  },[timerAtivo]);

  // ── AI COACH ──────────────────────────────────────────────────────────────
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const coachEndRef = useRef(null);

  const COACH_SYSTEM = `Você é o Coach do Geburah, um personal trainer e nutricionista com acesso total ao app. 
Você pode EXECUTAR AÇÕES no app além de dar conselhos. Quando o usuário pedir para registrar algo, faça isso retornando ações JSON.

AÇÕES DISPONÍVEIS (retorne dentro de <actions>[...]</actions>):
- {"action":"registrar_peso","peso":88.5,"data":"YYYY-MM-DD"}
- {"action":"registrar_refeicao","alimentoNome":"frango","qtd":150,"refeicao":"Almoço","data":"YYYY-MM-DD"}
- {"action":"registrar_agua","ml":250,"data":"YYYY-MM-DD"}
- {"action":"iniciar_treino","rotinaId":"rt1"}
- {"action":"registrar_medida","medidas":{"Cintura":90,"Peso":88}}
- {"action":"ajustar_meta_calorias","cal":2000,"prot":160}

Sempre responda em português de forma direta e motivadora. Se executar ações, diga o que fez de forma amigável.
CONTEXTO ATUAL: PESO_HOJE, META_DIA, CALORIAS_HOJE, META_CALORIAS, TREINOS_SEMANA, STREAK dias.`;

  const sendCoach = async () => {
    const msg = coachInput.trim();
    if(!msg || coachLoading) return;
    setCoachInput("");
    setCoachLoading(true);

    const ctx = COACH_SYSTEM
      .replace("PESO_HOJE", pesoHoje+"kg")
      .replace("META_DIA",  fmt1(metaDiaria)+"kg")
      .replace("CALORIAS_HOJE", Math.round(calHoje)+"kcal")
      .replace("META_CALORIAS", metas.cal+"kcal")
      .replace("TREINOS_SEMANA", treinos7d+" treinos nos últimos 7 dias")
      .replace("STREAK", streak);

    const newHistory = [...coachHistory, {role:"user", content:msg}];
    setCoachHistory(newHistory);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: ctx,
          messages: newHistory.slice(-10),
        })
      });
      const data = await res.json();
      const text = (data.content||[]).map(i=>i.text||"").join("");

      // Parse actions
      const actMatch = text.match(/<actions>([\s\S]*?)<\/actions>/);
      let cleanText = text.replace(/<actions>[\s\S]*?<\/actions>/g,"").trim();

      if(actMatch){
        try{
          const acts = JSON.parse(actMatch[1]);
          const actArr = Array.isArray(acts)?acts:[acts];
          actArr.forEach(act=>{
            if(act.action==="registrar_peso"){
              setPesagens(p=>[...p.filter(x=>x.data!==act.data),{id:"ps"+uid(),data:act.data||todayS(),peso:Number(act.peso)}]);
            } else if(act.action==="registrar_refeicao"){
              const al = alimentos.find(a=>a.name.toLowerCase().includes((act.alimentoNome||"").toLowerCase()));
              if(al) setLogDieta(p=>[...p,{id:"ld"+uid(),data:act.data||todayS(),refeicao:act.refeicao||"Almoço",alimentoId:al.id,qtd:Number(act.qtd)||100}]);
            } else if(act.action==="registrar_agua"){
              setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:act.data||todayS(),ml:Number(act.ml)||250}]}));
            } else if(act.action==="ajustar_meta_calorias"){
              setMetas(m=>({...m,cal:act.cal||m.cal,prot:act.prot||m.prot}));
            } else if(act.action==="registrar_medida"){
              const blank={}; MEDIDAS_P.forEach(m=>{blank[m]=act.medidas?.[m]||0;});
              setMedidasCorp(p=>[...p,{id:"mc"+uid(),data:todayS(),medidas:{...blank,...act.medidas}}]);
            }
          });
        }catch(e){}
      }

      const finalHistory = [...newHistory, {role:"assistant",content:cleanText}];
      setCoachHistory(finalHistory);
    } catch(e){
      setCoachHistory([...newHistory,{role:"assistant",content:"Desculpa, tive um erro de conexão. Tente de novo."}]);
    }
    setCoachLoading(false);
  };

  useEffect(function InlineBlock(){ coachEndRef.current?.scrollIntoView({behavior:"smooth"}); },[coachHistory]);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(function InlineBlock(){
    try{
      const raw=localStorage.getItem("lifetree_scores");
      const scores=raw?JSON.parse(raw):{};
      scores["geburah"]={score:gebScore,updatedAt:new Date().toISOString()};
      localStorage.setItem("lifetree_scores",JSON.stringify(scores));
    }catch(e){}
  },[gebScore]);

  // ── AI ANÁLISE ────────────────────────────────────────────────────────────
  const callAI = () => {
    setAiLoading(true); setAiError(null);
    const ultimasMed = medidasCorp.length?[...medidasCorp].sort((a,b)=>b.data.localeCompare(a.data))[0].medidas:{};
    const ultTreino  = logTreino.length?[...logTreino].sort((a,b)=>b.data.localeCompare(a.data))[0]:null;
    const ctx = {
      peso_hoje:pesoHoje, meta_peso_hoje:Number(fmt1(metaDiaria)), variacao:Number(fmt1(variacaoHoje)),
      acima_da_meta:variacaoHoje>0, peso_meta_final:pesoMeta, falta_kg:Number(fmt1(faltaPerder)),
      calorias:Math.round(calHoje), meta_cal:metas.cal, prot:Math.round(protHoje), meta_prot:metas.prot,
      tdee, agua_ml:aguaHoje, meta_agua:agua.meta,
      treinos_semana:treinos7d, streak, dias_sem_treinar:ultTreino?Math.round((new Date(todayS())-new Date(ultTreino.data))/86400000):999,
      ultimo_treino:ultTreino?{nome:ultTreino.rotinaName,data:ultTreino.data}:null,
      rotinas:rotinasTreino.map(r=>r.name), medidas:ultimasMed,
    };
    const fmt='{"diagnostico":"texto","ajuste_dieta":{"resumo":"texto","calorias_sugeridas":2000,"proteina_g":150,"observacoes":"texto"},"treino_hoje":{"recomendacao":"texto","rotina_sugerida":"nome ou null","ajustes":["ajuste1"]},"motivacao":"frase curta e poderosa"}';
    const instrucao="Você é personal trainer e nutricionista especializado. Com base nos dados, seja direto e específico. Responda SOMENTE com JSON: "+fmt+". Dados: "+JSON.stringify(ctx);
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:instrucao}]})})
    .then(r=>r.json())
    .then(data=>{const t=(data.content||[]).map(i=>i.text||"").join("");const s=t.indexOf("{");const e=t.lastIndexOf("}");if(s===-1)throw new Error("Inválido");setAiResult(JSON.parse(t.slice(s,e+1)));})
    .catch(e=>setAiError("Erro: "+e.message)).finally(()=>setAiLoading(false));
  };

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
            <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS()})}><Ico n="plus" size={11}/> Registrar</Btn>
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
            const pct=m.meta>0?clamp(Math.round(m.v/m.meta*100),0,100):0;
            return(<div key={m.l} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:10}}>{m.l}</span>
                <span style={{fontSize:10,fontWeight:700,color:m.c}}>{m.v}<span style={{fontSize:8,color:C.muted}}>/{m.meta}{m.unit}</span></span>
              </div>
              <Bar value={pct} color={m.c} height={3}/>
            </div>);
          })}
        </Card>
      );
      case "agua": return (
        <Card style={{textAlign:"center"}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:6}}>ÁGUA</div>
          <div style={{fontSize:28,fontWeight:900,color:BLUE,lineHeight:1}}>{Math.round(aguaHoje/1000*10)/10}<span style={{fontSize:11,color:C.muted}}>L</span></div>
          <div style={{fontSize:9,color:C.muted,marginBottom:8}}>Meta: {agua.meta}ml</div>
          <Bar value={aguaPct} color={BLUE} height={4}/>
          <div style={{display:"flex",gap:5,marginTop:8}}>
            {[200,300,500].map(ml=>(
              <button key={ml} onClick={()=>{setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:todayS(),ml}]}));toast_("+"+ml+"ml 💧",BLUE);}}
                style={{flex:1,padding:"5px",borderRadius:7,background:BLUE+"22",border:"1px solid "+BLUE+"44",color:BLUE,fontWeight:700,fontSize:10,cursor:"pointer"}}>
                +{ml}ml
              </button>
            ))}
          </div>
        </Card>
      );
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
                const log={id:"lt"+uid(),data:todayS(),rotinaId:rotinaSugerida.id,rotinaName:rotinaSugerida.name,series:rotinaSugerida.exercicios.map(e=>({...e,feito:false,cargaReal:e.carga}))};
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
      case "ai-insight": return (
        <Card style={{background:PURPLE+"08",border:"1px solid "+PURPLE+"22"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800}}>Insight IA</div>
            <Btn sm full={false} color={PURPLE} onClick={callAI} disabled={aiLoading}><Ico n="zap" size={11}/> {aiLoading?"...":"Analisar"}</Btn>
          </div>
          {aiResult?.motivacao&&<div style={{fontSize:11,fontStyle:"italic",color:PURPLE,marginBottom:6}}>"{aiResult.motivacao}"</div>}
          {aiResult?.diagnostico&&<div style={{fontSize:10,color:C.text,lineHeight:1.5}}>{aiResult.diagnostico.slice(0,120)}...</div>}
          {!aiResult&&<div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"8px 0"}}>Clique em Analisar para ver insights personalizados</div>}
          {aiError&&<div style={{fontSize:10,color:"#ef4444"}}>{aiError}</div>}
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

  // ── COACH TAB (substitui por aba flutuante) ───────────────────────────────
  const CoachPanel = ({onClose}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:400,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:C.surface,borderRadius:"18px 18px 0 0",maxHeight:"85vh",display:"flex",flexDirection:"column",width:"100%",maxWidth:430,margin:"0 auto"}}>
        <div style={{padding:"12px 18px",borderBottom:"1px solid "+C.b1,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:99,background:GREEN,boxShadow:"0 0 6px "+GREEN}}/>
            <div>
              <div style={{fontSize:13,fontWeight:800}}>Coach Geburah</div>
              <div style={{fontSize:9,color:C.muted}}>Pode registrar dados, analisar e dar conselhos</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={13} color={C.dim}/></button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"12px 18px",display:"flex",flexDirection:"column",gap:10,minHeight:200}}>
          {coachHistory.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>
              <div style={{fontSize:28,marginBottom:8}}>🤖</div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Oi! Sou seu Coach Geburah</div>
              <div style={{fontSize:10,lineHeight:1.6}}>Posso registrar dados, analisar seu progresso e fazer ajustes diretos no app. Experimente:</div>
              {["Registra 88kg hoje","Comi 150g de frango no almoço","Bebi 500ml de água","Como tá minha semana?","Ajusta minha meta de calorias para 2000"].map(s=>(
                <button key={s} onClick={()=>{setCoachInput(s);}} style={{display:"block",width:"100%",textAlign:"left",margin:"3px 0",padding:"6px 10px",background:PURPLE+"11",border:"1px solid "+PURPLE+"22",borderRadius:8,cursor:"pointer",fontSize:10,color:PURPLE,fontWeight:600}}>{s}</button>
              ))}
            </div>
          )}
          {coachHistory.map((msg,i)=>(
            <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"80%",padding:"8px 12px",borderRadius:msg.role==="user"?"14px 14px 2px 14px":"14px 14px 14px 2px",background:msg.role==="user"?ACCENT:C.card,border:msg.role==="user"?"none":"1px solid "+C.b1,color:msg.role==="user"?"#fff":C.text,fontSize:11,lineHeight:1.5}}>
                {msg.content}
              </div>
            </div>
          ))}
          {coachLoading&&(
            <div style={{display:"flex",justifyContent:"flex-start"}}>
              <div style={{padding:"8px 16px",borderRadius:"14px 14px 14px 2px",background:C.card,border:"1px solid "+C.b1,fontSize:11,color:C.muted}}>
                Pensando... ✦
              </div>
            </div>
          )}
          <div ref={coachEndRef}/>
        </div>

        <div style={{padding:"10px 18px 20px",borderTop:"1px solid "+C.b1,display:"flex",gap:8,flexShrink:0}}>
          <input value={coachInput} onChange={e=>setCoachInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendCoach()}
            placeholder="Digite ou peça para registrar algo..."
            style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:10,padding:"9px 12px",color:C.text,fontSize:12,outline:"none"}}/>
          <button onClick={sendCoach} disabled={coachLoading||!coachInput.trim()}
            style={{width:40,height:40,borderRadius:10,background:coachLoading||!coachInput.trim()?C.b1:"linear-gradient(135deg,"+PURPLE+"dd,"+PURPLE+"88)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="send" size={16} color={coachLoading||!coachInput.trim()?C.muted:"#fff"}/>
          </button>
        </div>
      </div>
    </div>
  );

  // ── TREINO TAB ────────────────────────────────────────────────────────────
  const TreinoTab = () => {
    const [sv,setSv] = useState("rotinas");
    return(
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"rotinas",l:"Rotinas"},{id:"log",l:"Histórico"},{id:"biblioteca",l:"Exercícios"}].map(s=>(
            <button key={s.id} onClick={()=>setSv(s.id)} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:sv===s.id?"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)":C.b1,border:"none",color:sv===s.id?"#fff":C.muted}}>{s.l}</button>
          ))}
        </div>
        {sv==="rotinas"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800}}>Minhas Rotinas</div>
              <Btn sm full={false} onClick={()=>openSh("addRotina",{name:"",dia:"Segunda"})}><Ico n="plus" size={11}/> Rotina</Btn>
            </div>
            {rotinasTreino.map(r=>(
              <Card key={r.id} color={ACCENT} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:ACCENT}}>{r.name}</div>
                    <div style={{fontSize:9,color:C.muted}}>{r.dias.join(", ")} · {r.exercicios.length} exercícios</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm full={false} color={ACCENT} onClick={()=>{
                      const log={id:"lt"+uid(),data:todayS(),rotinaId:r.id,rotinaName:r.name,series:r.exercicios.map(e=>({...e,feito:false,cargaReal:e.carga}))};
                      setLogTreino(p=>[...p,log]); setPage({type:"logTreino",logId:log.id}); toast_("Treino iniciado! 💪",ACCENT);
                    }}><Ico n="flame" size={11}/> Iniciar</Btn>
                    <button onClick={()=>setRotinasTreino(p=>p.filter(x=>x.id!==r.id))} style={{background:C.b1,border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color={C.muted}/></button>
                  </div>
                </div>
                {r.exercicios.map(re=>{
                  const ex=exercicios.find(e=>e.id===re.exercicioId);
                  const pr=prMap[re.exercicioId];
                  return(
                    <div key={re.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid "+C.b1}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:11}}>{ex?.name||"?"}</span>
                        {pr&&<Badge label={"PR "+pr+"kg"} color={AMBER}/>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:9,color:C.muted}}>{re.series}x{re.reps} · {re.carga>0?re.carga+"kg":"PC"}</span>
                        <button onClick={()=>openSh("editExRot",{rotinaId:r.id,reId:re.id,exercicioId:re.exercicioId,series:re.series,reps:re.reps,carga:re.carga,descanso:re.descanso})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={11} color={C.muted}/></button>
                        <button onClick={()=>setRotinasTreino(p=>p.map(rt=>rt.id===r.id?{...rt,exercicios:rt.exercicios.filter(e=>e.id!==re.id)}:rt))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                      </div>
                    </div>
                  );
                })}
                <Btn sm outline color={ACCENT} style={{marginTop:8}} onClick={()=>openSh("addExRot",{rotinaId:r.id,exercicioId:exercicios[0]?.id||"",series:3,reps:"10-12",carga:0,descanso:60})}>
                  <Ico n="plus" size={11}/> Exercício
                </Btn>
              </Card>
            ))}
          </div>
        )}
        {sv==="log"&&(
          <div>
            <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Histórico de Treinos</div>
            {logTreino.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum treino ainda</div>}
            {[...logTreino].reverse().map(l=>(
              <div key={l.id} onClick={()=>setPage({type:"logTreino",logId:l.id})} style={{padding:"10px 13px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>{l.rotinaName}</div>
                    <div style={{fontSize:9,color:C.muted}}>{l.data}</div>
                  </div>
                  <Badge label={l.series.filter(s=>s.feito).length+"/"+l.series.length+" feitos"} color={ACCENT}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {l.series.filter(s=>s.feito).slice(0,3).map((s,i)=>{
                    const ex=exercicios.find(e=>e.id===s.exercicioId);
                    const cr=s.cargaReal??s.carga;
                    return<Badge key={i} label={(ex?.name||"?")+": "+(cr>0?cr+"kg":"PC")} color={C.muted}/>;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {sv==="biblioteca"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800}}>Exercícios</div>
              <Btn sm full={false} onClick={()=>openSh("addExercicio",{name:"",grupo:GRUPOS[0],equip:"",inst:""})}><Ico n="plus" size={11}/> Exercício</Btn>
            </div>
            {GRUPOS.map(grupo=>{
              const exs=exercicios.filter(e=>e.grupo===grupo); if(!exs.length)return null;
              return(<div key={grupo} style={{marginBottom:12}}>
                <div style={{fontSize:10,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:6}}>{grupo.toUpperCase()}</div>
                {exs.map(e=>{
                  const pr=prMap[e.id];
                  // Historico de carga
                  const hist = logTreino.flatMap(lt=>lt.series.filter(s=>s.exercicioId===e.id&&(s.cargaReal??s.carga)>0).map(s=>({data:lt.data,carga:s.cargaReal??s.carga}))).sort((a,b)=>a.data.localeCompare(b.data)).slice(-6);
                  return(
                    <div key={e.id} style={{padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hist.length>1?6:0}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{fontSize:12,fontWeight:600}}>{e.name}</div>
                            {pr&&<Badge label={"🏆 "+pr+"kg"} color={AMBER}/>}
                          </div>
                          <div style={{fontSize:9,color:C.muted}}>{e.equip}</div>
                        </div>
                        <button onClick={()=>setExercicios(p=>p.filter(x=>x.id!==e.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                      </div>
                      {hist.length>1&&(
                        <div style={{height:30,display:"flex",alignItems:"flex-end",gap:3}}>
                          {hist.map((h,i)=>{
                            const maxH=Math.max(...hist.map(x=>x.carga));
                            const barH=Math.max(4,Math.round((h.carga/maxH)*26));
                            const isLast=i===hist.length-1;
                            return<div key={i} style={{flex:1,height:barH,borderRadius:"2px 2px 0 0",background:isLast?ACCENT:C.b2,transition:"height .3s"}} title={h.carga+"kg — "+h.data}/>;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>);
            })}
          </div>
        )}
      </div>
    );
  };

  // ── LOG TREINO PAGE ───────────────────────────────────────────────────────
  const LogTreinoPage = () => {
    const log = logTreino.find(l=>l.id===page.logId);
    if(!log) return null;
    const update = (idx,patch) => setLogTreino(p=>p.map(l=>l.id===log.id?{...l,series:l.series.map((s,i)=>i===idx?{...s,...patch}:s)}:l));
    const done = log.series.filter(s=>s.feito).length;
    const pct  = log.series.length>0?Math.round(done/log.series.length*100):0;
    return(
      <div style={{animation:"slideUp .3s ease"}}>
        <button onClick={()=>setPage(null)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
          <Ico n="back" size={13}/> Treino
        </button>
        {timerAtivo&&(
          <div style={{background:ACCENT+"22",border:"2px solid "+ACCENT+"44",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:9,color:ACCENT,fontWeight:700}}>DESCANSO — {timerAtivo.exercicioNome}</div>
              <div style={{fontSize:28,fontWeight:900,color:ACCENT,fontVariantNumeric:"tabular-nums"}}>{Math.floor(timerAtivo.segundos/60).toString().padStart(2,"0")}:{(timerAtivo.segundos%60).toString().padStart(2,"0")}</div>
            </div>
            <button onClick={()=>setTimerAtivo(null)} style={{background:ACCENT+"22",border:"1px solid "+ACCENT+"44",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:ACCENT,fontWeight:700,fontSize:11}}>Pular</button>
          </div>
        )}
        <div style={{background:ACCENT+"18",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:14,fontWeight:800,color:ACCENT}}>{log.rotinaName}</div>
            <Badge label={done+"/"+log.series.length} color={ACCENT}/>
          </div>
          <Bar value={pct} color={ACCENT} height={5}/>
          <div style={{fontSize:9,color:C.muted,marginTop:3}}>{log.data} · {pct}% completo</div>
        </div>
        {log.series.map((s,idx)=>{
          const ex=exercicios.find(e=>e.id===s.exercicioId);
          const cargaAtual=s.cargaReal!==undefined?s.cargaReal:s.carga;
          const pr=prMap[s.exercicioId];
          const isPR=pr&&cargaAtual>pr;
          return(
            <Card key={s.id||idx} color={s.feito?ACCENT:undefined} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:13,fontWeight:700}}>{ex?.name||"?"}</div>
                    {isPR&&<span style={{fontSize:9,background:AMBER+"22",color:AMBER,padding:"1px 7px",borderRadius:99,fontWeight:700}}>🏆 PR!</span>}
                  </div>
                  <div style={{fontSize:9,color:C.muted}}>{ex?.grupo} · {s.series}x{s.reps}</div>
                </div>
                <button onClick={()=>{
                  update(idx,{feito:!s.feito});
                  if(!s.feito&&s.descanso>0) setTimerAtivo({segundos:s.descanso,exercicioNome:ex?.name||"?"});
                }} style={{width:32,height:32,borderRadius:8,cursor:"pointer",border:"1.5px solid "+(s.feito?ACCENT:C.b2),background:s.feito?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {s.feito&&<Ico n="check" size={14} color="#fff" sw={2.5}/>}
                </button>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[["SÉRIES",s.series,1],["REPS",s.reps,1]].map(([label,val,fl])=>(
                  <div key={label} style={{flex:fl,background:C.surface,borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.muted}}>{label}</div>
                    <div style={{fontSize:14,fontWeight:800}}>{val}</div>
                  </div>
                ))}
                <div style={{flex:1.4,background:cargaAtual!==s.carga?ACCENT+"18":C.surface,borderRadius:8,padding:"5px 8px",textAlign:"center",border:cargaAtual!==s.carga?"1px solid "+ACCENT+"55":"none"}}>
                  <div style={{fontSize:8,color:C.muted,marginBottom:2}}>CARGA REAL (kg)</div>
                  <input type="number" value={cargaAtual} min={0} step={0.5} onChange={e=>update(idx,{cargaReal:Number(e.target.value)})}
                    style={{width:"100%",background:"transparent",border:"none",textAlign:"center",fontSize:14,fontWeight:800,color:cargaAtual!==s.carga?ACCENT:C.text,outline:"none",padding:0}}/>
                  {s.carga>0&&<div style={{fontSize:7,color:C.muted}}>base: {s.carga}kg</div>}
                </div>
                <div style={{flex:1,background:C.surface,borderRadius:8,padding:"5px 8px",textAlign:"center",cursor:"pointer"}} onClick={()=>setTimerAtivo({segundos:s.descanso,exercicioNome:ex?.name||"?"})}>
                  <div style={{fontSize:8,color:C.muted}}>DESCANSO</div>
                  <div style={{fontSize:14,fontWeight:800}}>{s.descanso}s</div>
                  <div style={{fontSize:7,color:ACCENT}}>▶ timer</div>
                </div>
              </div>
            </Card>
          );
        })}
        {pct===100&&(
          <div style={{background:GREEN+"22",border:"2px solid "+GREEN+"44",borderRadius:14,padding:14,textAlign:"center",marginTop:10}}>
            <div style={{fontSize:24,marginBottom:6}}>🎉</div>
            <div style={{fontSize:14,fontWeight:800,color:GREEN}}>Treino completo!</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Mais um dia de Geburah</div>
          </div>
        )}
      </div>
    );
  };

  // ── NUTRIÇÃO TAB ──────────────────────────────────────────────────────────
  const NutriTab = () => {
    const [sv,setSv] = useState("hoje");
    return(
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"hoje",l:"Hoje"},{id:"plano",l:"Plano"},{id:"biblioteca",l:"Alimentos"},{id:"receitas",l:"Receitas"}].map(s=>(
            <button key={s.id} onClick={()=>setSv(s.id)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:10,background:sv===s.id?"linear-gradient(135deg,"+ORANGE+"dd,"+ORANGE+"88)":C.b1,border:"none",color:sv===s.id?"#fff":C.muted}}>{s.l}</button>
          ))}
        </div>

        {sv==="hoje"&&(
          <div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:800}}>Macros</div>
                <div style={{fontSize:9,color:C.muted}}>TDEE estimado: {tdee}kcal</div>
              </div>
              {[{l:"Calorias",v:Math.round(calHoje),m:metas.cal,u:"kcal",c:ACCENT},{l:"Proteína",v:Math.round(protHoje),m:metas.prot,u:"g",c:GREEN},{l:"Carb",v:Math.round(carbHoje),m:metas.carb,u:"g",c:AMBER},{l:"Gordura",v:Math.round(gordHoje),m:metas.gord,u:"g",c:PURPLE}].map(macro=>{
                const pct=macro.m>0?clamp(Math.round(macro.v/macro.m*100),0,100):0;
                return(<div key={macro.l} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:11}}>{macro.l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:macro.c}}>{macro.v}<span style={{fontSize:9,color:C.muted}}>/{macro.m}{macro.u}</span></span>
                  </div>
                  <Bar value={pct} color={macro.c} height={4}/>
                </div>);
              })}
            </div>

            {/* Água inline */}
            <div style={{background:BLUE+"11",border:"1px solid "+BLUE+"22",borderRadius:12,padding:10,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:BLUE,fontWeight:700,marginBottom:2}}>ÁGUA</div>
                <div style={{fontSize:18,fontWeight:900,color:BLUE}}>{Math.round(aguaHoje/100)/10}L <span style={{fontSize:10,color:C.muted}}>/ {agua.meta/1000}L</span></div>
                <Bar value={aguaPct} color={BLUE} height={3}/>
              </div>
              <div style={{display:"flex",gap:4}}>
                {[200,500].map(ml=>(
                  <button key={ml} onClick={()=>{setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:todayS(),ml}]}));toast_("+"+ml+"ml 💧",BLUE);}}
                    style={{padding:"5px 8px",borderRadius:7,background:BLUE+"22",border:"none",color:BLUE,fontWeight:700,fontSize:10,cursor:"pointer"}}>+{ml}ml</button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800}}>Refeições</div>
              <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addRefeicao",{refeicao:"Almoço",alimentoId:alimentos[0]?.id||"",qtd:100,data:todayS()})}><Ico n="plus" size={11}/> Registrar</Btn>
            </div>
            {REFEICOES.map(ref=>{
              const items=todayLog.filter(l=>l.refeicao===ref); if(!items.length)return null;
              const refCal=items.reduce((s,i)=>{const al=alimentos.find(a=>a.id===i.alimentoId);return al?s+al.cal100*i.qtd/100:s;},0);
              return(<Card key={ref} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:10,color:ORANGE,fontWeight:700}}>{ref.toUpperCase()}</div>
                  <Badge label={Math.round(refCal)+"kcal"} color={ORANGE}/>
                </div>
                {items.map(item=>{
                  const al=alimentos.find(a=>a.id===item.alimentoId); if(!al)return null;
                  return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid "+C.b1}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:600}}>{al.name}</div>
                      <div style={{fontSize:9,color:C.muted}}>{item.qtd}g · {Math.round(al.cal100*item.qtd/100)}kcal · {Math.round(al.prot*item.qtd/100)}g prot</div>
                    </div>
                    <button onClick={()=>setLogDieta(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                  </div>);
                })}
              </Card>);
            })}
            {todayLog.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma refeição registrada hoje</div>}
          </div>
        )}

        {sv==="plano"&&(
          <div>
            <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Planejamento Semanal</div>
            {Array.from({length:7},(_,i)=>{
              const d=new Date(); d.setDate(d.getDate()+i);
              const ds=d.toISOString().slice(0,10);
              const diasNome=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
              const isToday=ds===todayS();
              return(
                <div key={ds} style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:isToday?ORANGE:C.muted,fontWeight:700,marginBottom:6}}>{diasNome.toUpperCase()} {ds.slice(5)} {isToday&&"— HOJE"}</div>
                  {["Café da manhã","Almoço","Jantar"].map(ref=>{
                    const key=ds+"_"+ref;
                    const ids=planSem[key]||[];
                    const cal=ids.reduce((s,id)=>{const al=alimentos.find(a=>a.id===id);return al?s+al.cal100*100/100:s;},0);
                    return(
                      <div key={ref} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:C.card,border:"1px solid "+C.b1,borderRadius:8,marginBottom:4}}>
                        <div style={{fontSize:10,color:C.muted,width:70,flexShrink:0}}>{ref}</div>
                        <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:3}}>
                          {ids.map(id=>{const al=alimentos.find(a=>a.id===id);return al?<Badge key={id} label={al.name} color={ORANGE}/>:null;})}
                          {ids.length===0&&<span style={{fontSize:9,color:C.muted}}>—</span>}
                        </div>
                        <button onClick={()=>openSh("planRefeicao",{planKey:key,ids:[...ids]})} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="plus" size={12} color={ORANGE}/></button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {sv==="biblioteca"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800}}>Alimentos</div>
              <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addAlimento",{name:"",cat:CATS_AL[0],cal100:0,prot:0,carb:0,gord:0})}><Ico n="plus" size={11}/> Alimento</Btn>
            </div>
            {CATS_AL.map(cat=>{
              const als=alimentos.filter(a=>a.cat===cat); if(!als.length)return null;
              return(<div key={cat} style={{marginBottom:12}}>
                <div style={{fontSize:10,color:ORANGE,fontWeight:700,letterSpacing:1,marginBottom:6}}>{cat.toUpperCase()}</div>
                {als.map(al=>(
                  <div key={al.id} style={{padding:"8px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600}}>{al.name}</div>
                        <div style={{fontSize:9,color:C.muted}}>Por 100g: {al.cal100}kcal · {al.prot}g P · {al.carb}g C · {al.gord}g G</div>
                      </div>
                      <button onClick={()=>setAlimentos(p=>p.filter(x=>x.id!==al.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                    </div>
                  </div>
                ))}
              </div>);
            })}
          </div>
        )}

        {sv==="receitas"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:800}}>Receitas</div>
              <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addReceita",{name:"",desc:"",steps:[""]})}><Ico n="plus" size={11}/> Receita</Btn>
            </div>
            {receitas.map(r=>{
              const totalCal=r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al.cal100*ing.qtd/100):s;},0);
              const totalProt=r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al.prot*ing.qtd/100):s;},0);
              return(
                <Card key={r.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:800}}>{r.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{r.desc}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <Badge label={Math.round(totalCal)+"kcal"} color={ORANGE}/>
                      <button onClick={()=>setReceitas(p=>p.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                    </div>
                  </div>
                  {r.ingredientes.map((ing,i)=>{
                    const al=alimentos.find(a=>a.id===ing.alimentoId);
                    return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,padding:"4px 0",borderTop:"1px solid "+C.b1}}>
                      <span>{al?.name||"?"}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:C.muted}}>{ing.qtd}g</span>
                        <button onClick={()=>setReceitas(p=>p.map(rc=>rc.id===r.id?{...rc,ingredientes:rc.ingredientes.filter((_,j)=>j!==i)}:rc))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={10} color={C.muted}/></button>
                      </div>
                    </div>);
                  })}
                  {(r.steps||[]).length>0&&(
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.b1}}>
                      <div style={{fontSize:9,color:ORANGE,fontWeight:700,marginBottom:4}}>MODO DE PREPARO</div>
                      {r.steps.map((step,i)=><div key={i} style={{fontSize:10,color:C.muted,marginBottom:3}}>{i+1}. {step}</div>)}
                    </div>
                  )}
                  <div style={{marginTop:6,fontSize:9,color:ORANGE,fontWeight:700}}>{Math.round(totalCal)}kcal · {Math.round(totalProt)}g proteína</div>
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <Btn sm outline color={ORANGE} style={{flex:1}} onClick={()=>openSh("addIngrediente",{receitaId:r.id,alimentoId:alimentos[0]?.id||"",qtd:100})}><Ico n="plus" size={11}/> Ingrediente</Btn>
                    <Btn sm outline color={ORANGE} style={{flex:1}} onClick={()=>{r.ingredientes.forEach(ing=>setLogDieta(p=>[...p,{id:"ld"+uid(),data:todayS(),refeicao:"Almoço",alimentoId:ing.alimentoId,qtd:ing.qtd}]));toast_("Adicionado ao diário!",ORANGE);}}><Ico n="plus" size={11}/> Ao diário</Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── MEDIDAS TAB ───────────────────────────────────────────────────────────
  const MedidasTab = () => {
    const ult = medidasCorp.length?[...medidasCorp].sort((a,b)=>b.data.localeCompare(a.data))[0]:null;
    const pri = medidasCorp.length?[...medidasCorp].sort((a,b)=>a.data.localeCompare(b.data))[0]:null;
    return(
      <div style={{animation:"slideUp .3s ease"}}>
        <Card color={ACCENT} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Meta de Peso</div>
            <Btn sm full={false} onClick={()=>openSh("editMetaPeso",{...pesosMeta})}><Ico n="edit" size={11}/> Editar</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[["INICIAL",fmtKg(pesosMeta.pesoAtual),ACCENT],["META",fmtKg(pesoMeta),GREEN],["PERDA/SEM",fmtKg(pesosMeta.taxaSemanal),C.text]].map(([l,v,c])=>(
              <div key={l} style={{background:C.surface,borderRadius:9,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.muted}}>{l}</div>
                <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <Bar value={pesoScore} color={"linear-gradient(90deg,"+ACCENT+","+GREEN+")"} height={5}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:3}}>
            <span>Perdeu {fmt1(perdaTotal)}kg</span><span>Falta {fmt1(faltaPerder)}kg · ~{diasRest} dias</span>
          </div>
        </Card>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Histórico de Peso</div>
          <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS()})}><Ico n="plus" size={11}/> Pesar</Btn>
        </div>
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:70,marginBottom:8,position:"relative"}}>
            {/* Meta line */}
            {sortedPes.slice(-7).length>0&&(function InlineBlock(){
              const all=sortedPes.slice(-7);
              const maxP=Math.max(...all.map(x=>x.peso))+0.5;
              const minP=Math.min(...all.map(x=>x.peso))-0.5;
              const range=maxP-minP;
              return all.map((p,i)=>{
                const h=Math.max(6,Math.round(((p.peso-minP)/range)*60));
                const metaP=pesosMeta.pesoAtual-(pesosMeta.taxaSemanal/7)*Math.max(0,Math.round((new Date(p.data)-new Date(pesosMeta.iniciou))/86400000));
                const mh=Math.max(2,Math.round(((metaP-minP)/range)*60));
                const isT=p.data===todayS();
                const above=p.peso>metaP+0.2;
                return(
                  <div key={p.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
                    <div style={{fontSize:7,color:isT?ACCENT:C.muted,fontWeight:isT?700:400}}>{fmtKg(p.peso)}</div>
                    <div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end",position:"relative"}}>
                      <div style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",background:isT?ACCENT:above?"#ef444466":C.b2}}/>
                      <div style={{position:"absolute",bottom:mh-1,left:0,right:0,height:2,background:GREEN+"66",borderRadius:1}}/>
                    </div>
                    <div style={{fontSize:7,color:C.muted}}>{p.data.slice(5)}</div>
                  </div>
                );
              });
            })()}
          </div>
          <div style={{display:"flex",gap:10,fontSize:8,color:C.muted,marginBottom:8}}>
            <span>🔴 Acima da meta</span><span style={{color:GREEN}}>— Linha de meta</span>
          </div>
          {sortedPes.slice().reverse().slice(0,5).map(p=>{
            const meta=pesosMeta.pesoAtual-(pesosMeta.taxaSemanal/7)*Math.max(0,Math.round((new Date(p.data)-new Date(pesosMeta.iniciou))/86400000));
            const dif=p.peso-meta;
            return(<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid "+C.b1}}>
              <span style={{fontSize:11}}>{p.data}</span>
              <span style={{fontSize:12,fontWeight:700,color:ACCENT}}>{fmtKg(p.peso)}</span>
              <span style={{fontSize:10,fontWeight:600,color:dif>0.2?"#ef4444":dif<-0.2?GREEN:C.muted}}>{dif>0?"+":""}{fmt1(dif)}kg vs meta</span>
              <button onClick={()=>setPesagens(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
            </div>);
          })}
        </Card>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Medidas Corporais</div>
          <Btn sm full={false} onClick={()=>{const b={};MEDIDAS_P.forEach(m=>{b[m]=ult?.medidas[m]||0;});openSh("addMedidas",{data:todayS(),medidas:b});}}><Ico n="plus" size={11}/> Registrar</Btn>
        </div>
        {ult&&(
          <Card>
            <div style={{fontSize:9,color:C.muted,marginBottom:10}}>Última: {ult.data}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {MEDIDAS_P.map(m=>{
                const at=ult.medidas[m]||0;
                const an=pri?.medidas[m]||0;
                const dif=at-an;
                return(<div key={m} style={{background:C.surface,borderRadius:9,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{m.toUpperCase()}</div>
                  <div style={{fontSize:15,fontWeight:800,color:ACCENT}}>{m==="Peso"?fmtKg(at):at+"cm"}</div>
                  {an>0&&at!==an&&<div style={{fontSize:9,color:dif<0?GREEN:"#ef4444",fontWeight:600}}>{dif<0?"":"+"}  {fmt1(dif)}{m==="Peso"?"kg":"cm"}</div>}
                </div>);
              })}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ── CONFIG TAB ────────────────────────────────────────────────────────────
  const ConfigTab = () => {
    const Row=({title,sub,onEdit,onDel})=>(<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{title}</div>{sub&&<div style={{fontSize:9,color:C.muted}}>{sub}</div>}</div>
      {onEdit&&<button onClick={onEdit} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>}
      {onDel&&<button onClick={onDel} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>}
    </div>);
    const Sec=({title,addLabel,onAdd,children})=>(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:12,fontWeight:700}}>{title}</span>
        {onAdd&&<Btn sm full={false} onClick={onAdd}><Ico n="plus" size={11}/> {addLabel}</Btn>}
      </div>
      {children}
    </div>);
    return(
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{background:ACCENT+"11",border:"2px solid "+ACCENT+"33",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE GEBURAH</div>
          <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{gebScore}<span style={{fontSize:16}}>%</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
            {[{l:"Treino 40%",v:treinoScore},{l:"Nutrição 30%",v:dietaScore},{l:"Peso 30%",v:pesoScore}].map(s=>(
              <div key={s.l} style={{background:C.surface,borderRadius:8,padding:"6px"}}>
                <div style={{fontSize:8,color:C.muted}}>{s.l}</div>
                <div style={{fontSize:14,fontWeight:800,color:ACCENT}}>{s.v}%</div>
              </div>
            ))}
          </div>
        </div>

        <Sec title="Perfil e TDEE" addLabel="Editar" onAdd={()=>openSh("editPerfil",{...perfil})}>
          <Row title={perfil.nome} sub={perfil.peso+"kg · "+perfil.altura+"cm · "+perfil.idade+"anos"} onEdit={()=>openSh("editPerfil",{...perfil})}/>
          <div style={{padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
            <div style={{fontSize:10,color:C.muted}}>TDEE estimado</div>
            <div style={{fontSize:18,fontWeight:900,color:ORANGE}}>{tdee} <span style={{fontSize:10}}>kcal/dia</span></div>
            <div style={{fontSize:9,color:C.muted}}>Nível: {perfil.atividade}</div>
          </div>
        </Sec>

        <Sec title="Metas Nutricionais" addLabel="Editar" onAdd={()=>openSh("editMetas",{...metas})}>
          {[["Calorias diárias",metas.cal+" kcal"],["Proteína",metas.prot+"g"],["Carboidrato",metas.carb+"g"],["Gordura",metas.gord+"g"]].map(([t,s])=>(
            <Row key={t} title={t} sub={s} onEdit={()=>openSh("editMetas",{...metas})}/>
          ))}
        </Sec>

        <Sec title="Meta de Água" addLabel="Editar" onAdd={()=>openSh("editAgua",{meta:agua.meta})}>
          <Row title="Meta diária" sub={agua.meta+"ml ("+Math.round(agua.meta/250)+" copos)"} onEdit={()=>openSh("editAgua",{meta:agua.meta})}/>
        </Sec>

        <Sec title="Rotinas de Treino" addLabel="Adicionar" onAdd={()=>openSh("addRotina",{name:"",dia:"Segunda"})}>
          {rotinasTreino.map(r=><Row key={r.id} title={r.name} sub={r.dias.join(", ")+" · "+r.exercicios.length+" exercícios"} onDel={()=>{setRotinasTreino(p=>p.filter(x=>x.id!==r.id));toast_("Removido");}}/>)}
        </Sec>

        <Sec title="Exercícios" addLabel="Adicionar" onAdd={()=>openSh("addExercicio",{name:"",grupo:GRUPOS[0],equip:"",inst:""})}>
          {exercicios.slice(0,5).map(e=><Row key={e.id} title={e.name} sub={e.grupo+" · "+e.equip} onDel={()=>{setExercicios(p=>p.filter(x=>x.id!==e.id));toast_("Removido");}}/>)}
          {exercicios.length>5&&<div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"4px 0"}}>+{exercicios.length-5} mais na biblioteca</div>}
        </Sec>
      </div>
    );
  };

  const [showCoach, setShowCoach] = useState(false);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text,position:"relative"}}>
      <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:${C.surface}}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{padding:"14px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          {onBack&&!page&&(
            <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:ACCENT,fontSize:11,fontWeight:700,padding:"0 0 4px"}}>
              <Ico n="back" size={12} color={ACCENT}/> Árvore
            </button>
          )}
          {page&&<button onClick={()=>setPage(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 4px"}}><Ico n="back" size={12}/> voltar</button>}
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>GEBURAH</div>
          <div style={{fontSize:18,fontWeight:800}}>Força · Saúde</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowCoach(true)} style={{background:"linear-gradient(135deg,"+PURPLE+"dd,"+PURPLE+"88)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#fff",fontWeight:700,fontSize:11}}>
            <Ico n="chat" size={12} color="#fff"/> Coach
          </button>
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
            {tab==="geb"    &&<GebTab/>}
            {tab==="treino" &&<TreinoTab/>}
            {tab==="nutri"  &&<NutriTab/>}
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

      {/* Coach Panel */}
      {showCoach&&<CoachPanel onClose={()=>setShowCoach(false)}/>}

      {/* Widget Editor */}
      {sh==="widgetEditor"&&<WidgetEditorSheet/>}

      {/* ── ALL SHEETS ───────────────────────────────────────────────────── */}
      {sh==="registrarPeso"&&<Sheet title="Registrar Peso" onClose={close}>
        <FI label="Peso (kg)" value={f.peso||0} onChange={v=>F({peso:v})} type="number" step={0.1} min={30} max={250}/>
        <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
        <Btn color={ACCENT} onClick={()=>{if(!f.peso)return;setPesagens(p=>[...p.filter(x=>x.data!==f.data),{id:"ps"+uid(),data:f.data||todayS(),peso:Number(f.peso)}]);toast_("✓ Pesagem registrada");close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="editMetaPeso"&&<Sheet title="Meta de Peso" onClose={close}>
        <FI label="Peso inicial (kg)" value={f.pesoAtual||0} onChange={v=>F({pesoAtual:v})} type="number" step={0.1}/>
        <FI label="Peso meta (kg)" value={f.pesoMeta||0} onChange={v=>F({pesoMeta:v})} type="number" step={0.1}/>
        <FI label="Perda semanal (kg)" value={f.taxaSemanal||0.5} onChange={v=>F({taxaSemanal:v})} type="number" step={0.1} min={0.1} max={1}/>
        <FI label="Data de início" value={f.iniciou||todayS()} onChange={v=>F({iniciou:v})} type="date"/>
        <Btn color={ACCENT} onClick={()=>{setPesosMeta({pesoAtual:Number(f.pesoAtual),pesoMeta:Number(f.pesoMeta),taxaSemanal:Number(f.taxaSemanal),iniciou:f.iniciou});toast_("Meta atualizada");close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="editMetas"&&<Sheet title="Metas Nutricionais" onClose={close}>
        <div style={{background:ORANGE+"11",borderRadius:9,padding:"8px 12px",marginBottom:12,fontSize:11,color:ORANGE}}>TDEE estimado: <strong>{tdee} kcal</strong></div>
        <FI label="Calorias (kcal)" value={f.cal||2200} onChange={v=>F({cal:v})} type="number" hint={"Déficit sugerido: "+(tdee-300)+" kcal"}/>
        <FI label="Proteína (g)" value={f.prot||160} onChange={v=>F({prot:v})} type="number"/>
        <FI label="Carboidrato (g)" value={f.carb||220} onChange={v=>F({carb:v})} type="number"/>
        <FI label="Gordura (g)" value={f.gord||70} onChange={v=>F({gord:v})} type="number"/>
        <Btn color={ACCENT} onClick={()=>{setMetas({cal:Number(f.cal),prot:Number(f.prot),carb:Number(f.carb),gord:Number(f.gord)});toast_("Metas atualizadas");close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="editPerfil"&&<Sheet title="Meu Perfil" onClose={close}>
        <FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Peso (kg)" value={f.peso||0} onChange={v=>F({peso:v})} type="number" step={0.1}/>
          <FI label="Altura (cm)" value={f.altura||175} onChange={v=>F({altura:v})} type="number"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Idade" value={f.idade||25} onChange={v=>F({idade:v})} type="number"/>
          <FS label="Sexo" value={f.sexo||"M"} onChange={v=>F({sexo:v})} opts={[{v:"M",l:"Masculino"},{v:"F",l:"Feminino"}]}/>
        </div>
        <FS label="Nível de atividade" value={f.atividade||"moderado"} onChange={v=>F({atividade:v})} opts={[{v:"sedentario",l:"Sedentário"},{v:"leve",l:"Leve (1-3x/sem)"},{v:"moderado",l:"Moderado (3-5x/sem)"},{v:"intenso",l:"Intenso (6-7x/sem)"},{v:"muito_intenso",l:"Muito intenso"}]}/>
        <Btn color={ACCENT} onClick={()=>{setPerfil({nome:f.nome,peso:Number(f.peso),altura:Number(f.altura),idade:Number(f.idade),sexo:f.sexo,atividade:f.atividade});toast_("Perfil atualizado");close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="editAgua"&&<Sheet title="Meta de Água" onClose={close}>
        <FI label="Meta diária (ml)" value={f.meta||3000} onChange={v=>F({meta:v})} type="number" step={250} hint={"≈ "+Math.round((f.meta||3000)/250)+" copos de 250ml"}/>
        <Btn color={BLUE} onClick={()=>{setAgua(a=>({...a,meta:Number(f.meta)||3000}));toast_("Meta de água atualizada",BLUE);close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="addExercicio"&&<Sheet title="Novo Exercício" onClose={close}>
        <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Supino Reto"/>
        <FS label="Grupo muscular" value={f.grupo||GRUPOS[0]} onChange={v=>F({grupo:v})} opts={GRUPOS.map(g=>({v:g,l:g}))}/>
        <FI label="Equipamento" value={f.equip||""} onChange={v=>F({equip:v})} placeholder="Ex: Barra, Halteres..."/>
        <FTA label="Instruções" value={f.inst||""} onChange={v=>F({inst:v})} rows={2}/>
        <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setExercicios(p=>[...p,{id:"e"+uid(),name:f.name,grupo:f.grupo||GRUPOS[0],equip:f.equip||"",inst:f.inst||""}]);toast_("Exercício adicionado");close();}}>Adicionar</Btn>
      </Sheet>}

      {sh==="addRotina"&&<Sheet title="Nova Rotina" onClose={close}>
        <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Treino A — Peito/Ombros"/>
        <FS label="Dia principal" value={f.dia||"Segunda"} onChange={v=>F({dia:v})} opts={DIAS_SEMANA.map(d=>({v:d,l:d}))}/>
        <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setRotinasTreino(p=>[...p,{id:"rt"+uid(),name:f.name,dias:[f.dia||"Segunda"],exercicios:[]}]);toast_("Rotina criada");close();}}>Criar</Btn>
      </Sheet>}

      {sh==="addExRot"&&<Sheet title="Adicionar Exercício" onClose={close}>
        <FS label="Exercício" value={f.exercicioId||""} onChange={v=>F({exercicioId:v})} opts={exercicios.map(e=>({v:e.id,l:e.name+" ("+e.grupo+")"}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Séries" value={f.series||3} onChange={v=>F({series:v})} type="number" min={1}/>
          <FI label="Repetições" value={f.reps||"10-12"} onChange={v=>F({reps:v})} placeholder="10-12"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Carga (kg)" value={f.carga||0} onChange={v=>F({carga:v})} type="number" min={0}/>
          <FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>
        </div>
        <Btn color={ACCENT} onClick={()=>{if(!f.exercicioId)return;setRotinasTreino(p=>p.map(r=>r.id===f.rotinaId?{...r,exercicios:[...r.exercicios,{id:"re"+uid(),exercicioId:f.exercicioId,series:Number(f.series)||3,reps:f.reps||"10-12",carga:Number(f.carga)||0,descanso:Number(f.descanso)||60}]}:r));toast_("Adicionado");close();}}>Adicionar</Btn>
      </Sheet>}

      {sh==="editExRot"&&<Sheet title="Editar Exercício" onClose={close}>
        <FS label="Exercício" value={f.exercicioId||""} onChange={v=>F({exercicioId:v})} opts={exercicios.map(e=>({v:e.id,l:e.name+" ("+e.grupo+")"}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Séries" value={f.series||3} onChange={v=>F({series:v})} type="number" min={1}/>
          <FI label="Repetições" value={f.reps||"10-12"} onChange={v=>F({reps:v})} placeholder="10-12"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Carga (kg)" value={f.carga||0} onChange={v=>F({carga:v})} type="number" min={0}/>
          <FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>
        </div>
        <Btn color={ACCENT} onClick={()=>{setRotinasTreino(p=>p.map(r=>r.id===f.rotinaId?{...r,exercicios:r.exercicios.map(e=>e.id===f.reId?{...e,exercicioId:f.exercicioId,series:Number(f.series),reps:f.reps,carga:Number(f.carga),descanso:Number(f.descanso)}:e)}:r));toast_("Atualizado");close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="addAlimento"&&<Sheet title="Novo Alimento" onClose={close}>
        <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Peito de frango"/>
        <FS label="Categoria" value={f.cat||CATS_AL[0]} onChange={v=>F({cat:v})} opts={CATS_AL.map(c=>({v:c,l:c}))}/>
        <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700}}>POR 100G</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Calorias" value={f.cal100||0} onChange={v=>F({cal100:v})} type="number"/>
          <FI label="Proteína (g)" value={f.prot||0} onChange={v=>F({prot:v})} type="number" step={0.1}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FI label="Carboidrato (g)" value={f.carb||0} onChange={v=>F({carb:v})} type="number" step={0.1}/>
          <FI label="Gordura (g)" value={f.gord||0} onChange={v=>F({gord:v})} type="number" step={0.1}/>
        </div>
        <Btn color={ORANGE} onClick={()=>{if(!f.name)return;setAlimentos(p=>[...p,{id:"al"+uid(),name:f.name,cat:f.cat||CATS_AL[0],cal100:Number(f.cal100)||0,prot:Number(f.prot)||0,carb:Number(f.carb)||0,gord:Number(f.gord)||0}]);toast_("Adicionado",ORANGE);close();}}>Adicionar</Btn>
      </Sheet>}

      {sh==="addRefeicao"&&<Sheet title="Registrar Refeição" onClose={close}>
        <FS label="Refeição" value={f.refeicao||"Almoço"} onChange={v=>F({refeicao:v})} opts={REFEICOES.map(r=>({v:r,l:r}))}/>
        <FS label="Alimento" value={f.alimentoId||""} onChange={v=>F({alimentoId:v})} opts={[{v:"",l:"Selecione..."},...alimentos.map(a=>({v:a.id,l:a.name+" ("+a.cal100+"kcal/100g)"}))]}/>
        <FI label="Quantidade (g)" value={f.qtd||100} onChange={v=>F({qtd:v})} type="number" min={1}/>
        {f.alimentoId&&(function InlineBlock(){const al=alimentos.find(a=>a.id===f.alimentoId);if(!al)return null;const kcal=Math.round(al.cal100*(f.qtd||100)/100);return<div style={{background:ORANGE+"11",borderRadius:8,padding:"8px 12px",marginBottom:11,fontSize:11}}><span style={{fontWeight:700,color:ORANGE}}>{kcal} kcal</span> · {Math.round(al.prot*(f.qtd||100)/100)}g prot · {Math.round(al.carb*(f.qtd||100)/100)}g carb</div>;})()}
        <Btn color={ORANGE} onClick={()=>{if(!f.alimentoId)return;setLogDieta(p=>[...p,{id:"ld"+uid(),data:f.data||todayS(),refeicao:f.refeicao||"Almoço",alimentoId:f.alimentoId,qtd:Number(f.qtd)||100}]);toast_("Registrado",ORANGE);close();}}>Registrar</Btn>
      </Sheet>}

      {sh==="addReceita"&&<Sheet title="Nova Receita" onClose={close}>
        <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Bowl proteico"/>
        <FTA label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} rows={2}/>
        <Btn color={ORANGE} onClick={()=>{if(!f.name)return;setReceitas(p=>[...p,{id:"rec"+uid(),name:f.name,desc:f.desc||"",ingredientes:[],steps:[]}]);toast_("Receita criada",ORANGE);close();}}>Criar</Btn>
      </Sheet>}

      {sh==="addIngrediente"&&<Sheet title="Adicionar Ingrediente" onClose={close}>
        <FS label="Alimento" value={f.alimentoId||""} onChange={v=>F({alimentoId:v})} opts={alimentos.map(a=>({v:a.id,l:a.name+" ("+a.cal100+"kcal/100g)"}))}/>
        <FI label="Quantidade (g)" value={f.qtd||100} onChange={v=>F({qtd:v})} type="number" min={1}/>
        {f.alimentoId&&(function InlineBlock(){const al=alimentos.find(a=>a.id===f.alimentoId);if(!al)return null;const kcal=Math.round(al.cal100*(f.qtd||100)/100);return<div style={{background:ORANGE+"11",borderRadius:8,padding:"8px 12px",marginBottom:11,fontSize:11}}><span style={{fontWeight:700,color:ORANGE}}>{kcal} kcal</span> · {Math.round(al.prot*(f.qtd||100)/100)}g prot</div>;})()}
        <Btn color={ORANGE} onClick={()=>{if(!f.alimentoId)return;setReceitas(p=>p.map(r=>r.id===f.receitaId?{...r,ingredientes:[...r.ingredientes,{alimentoId:f.alimentoId,qtd:Number(f.qtd)||100}]}:r));toast_("Adicionado",ORANGE);close();}}>Adicionar</Btn>
      </Sheet>}

      {sh==="planRefeicao"&&<Sheet title="Planejar Refeição" onClose={close}>
        <div style={{marginBottom:12}}>
          {(f.ids||[]).map(id=>{const al=alimentos.find(a=>a.id===id);return al?<div key={id} style={{display:"flex",justifyContent:"space-between",padding:"6px 8px",background:C.surface,borderRadius:8,marginBottom:4}}>
            <span style={{fontSize:11}}>{al.name}</span>
            <button onClick={()=>F({ids:(f.ids||[]).filter(x=>x!==id)})} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="x" size={11} color={C.muted}/></button>
          </div>:null;})}
        </div>
        <FS label="Adicionar alimento" value="" onChange={v=>{if(v&&!(f.ids||[]).includes(v))F({ids:[...(f.ids||[]),v]});}} opts={[{v:"",l:"Selecione..."},...alimentos.map(a=>({v:a.id,l:a.name}))]}/>
        <Btn color={ORANGE} onClick={()=>{setPlanSem(p=>({...p,[f.planKey]:f.ids||[]}));toast_("Planejamento salvo",ORANGE);close();}}>Salvar</Btn>
      </Sheet>}

      {sh==="addMedidas"&&<Sheet title="Registrar Medidas" onClose={close}>
        <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {MEDIDAS_P.map(m=><FI key={m} label={m+(m==="Peso"?" (kg)":" (cm)")} value={(f.medidas||{})[m]||0} onChange={v=>F({medidas:{...(f.medidas||{}),[m]:v}})} type="number" step={0.1}/>)}
        </div>
        <Btn color={ACCENT} onClick={()=>{if(!f.data)return;setMedidasCorp(p=>[...p.filter(x=>x.data!==f.data),{id:"mc"+uid(),data:f.data,medidas:f.medidas||{}}].sort((a,b)=>a.data.localeCompare(b.data)));toast_("Medidas registradas");close();}}>Salvar</Btn>
      </Sheet>}
    </div>
  );
}
