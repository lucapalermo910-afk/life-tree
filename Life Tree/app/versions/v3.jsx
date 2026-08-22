import { useState, useEffect } from "react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#07090f", surface:"#0c1018", card:"#0f1520",
  b1:"#182030", b2:"#253040",
  text:"#eef2ff", muted:"#44556a", dim:"#7a8fa8",
  navBg:"#060b12",
};
const LIGHT = {
  bg:"#eef1f9", surface:"#ffffff", card:"#f8faff",
  b1:"#c4cfe6", b2:"#98aacf",
  text:"#07101e", muted:"#556080", dim:"#1e3060",
  navBg:"#eef1f9",
};
// C is passed as a prop/argument everywhere — no global mutable state
// ── ICONS ─────────────────────────────────────────────────────────────────────
const ICONS = {
  heart:    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  book:     ["M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"],
  sun:      ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:     ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  check:    "M20 6 9 17l-5-5",
  plus:     "M12 5v14M5 12h14",
  x:        "M18 6 6 18M6 6l12 12",
  back:     "M19 12H5m7 7-7-7 7-7",
  gear:     ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  zap:      "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  trend:    "M3 3v18h18M18 9l-5 5-4-4-3 3",
  alvo:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M22 12h-2","M2 12h2","M12 2v2","M12 20v2"],
  treelife: ["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  key:      ["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"],
  lotus:    ["M12 17 C11 14 11 10 12 7 C13 10 13 14 12 17Z","M12 17 C10 14 7 12 6 9 C8 9 11 12 12 17Z","M12 17 C14 14 17 12 18 9 C16 9 13 12 12 17Z","M12 17 C9 15 5 15 4 13 C6 12 10 14 12 17Z","M12 17 C15 15 19 15 20 13 C18 12 14 14 12 17Z","M12 17 L12 22","M12 20 C10 19 8 20 8 20","M12 20 C14 19 16 20 16 20"],
  flame:    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  monitor:  ["M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z","M8 21h8","M12 17v4"],
  scale:    ["M12 3v18","M3 9h18","M8 3l4 6 4-6","M8 21l4-6 4 6","M3 15a6 6 0 0 0 6-6","M15 15a6 6 0 0 0 6-6"],
  landmark: ["M3 22h18","M4 22V10h4V7h2V4h4v3h2v3h4v12","M4 10h16","M8 22v-5a4 4 0 0 1 8 0v5","M6 7V4h2v3","M16 7V4h2v3","M10 4V2h4v2"],
  gitbranch:["M6 3v9","M6 21v-3","circle cx='6' cy='3' r='2'","circle cx='6' cy='21' r='2'","circle cx='18' cy='6' r='2'","M6 12 C6 15 10 18 14 18 L16 18","M12 6 L16 6"],
  pencil:   ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
};

function Icon({ name, size=16, color="currentColor", sw=1.5, style={} }) {
  const d = ICONS[name];
  if (!d) return null;
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,...style}}>
      {paths.map((p,i) => {
        if (p.startsWith("circle")) {
          const m = p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);
          if (m) return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;
        }
        return <path key={i} d={p}/>;
      })}
    </svg>
  );
}

// ── 10 AREAS ──────────────────────────────────────────────────────────────────
const DEFAULT_AREAS = [
  { id:"desejos",        label:"Desejos",          color:"#06b6d4", weight:10,
    subareas:[{id:"des_curto",label:"Curto prazo",color:"#22d3ee",weight:35},{id:"des_medio",label:"Médio prazo",color:"#0891b2",weight:35},{id:"des_sonhos",label:"Sonhos",color:"#06b6d4",weight:30}]},
  { id:"espiritualidade",label:"Espiritualidade",   color:"#c084fc", weight:10,
    subareas:[{id:"esp_pratica",label:"Prática",color:"#e879f9",weight:35},{id:"esp_estudo",label:"Estudo",color:"#a855f7",weight:35},{id:"esp_reflexao",label:"Reflexão",color:"#c084fc",weight:30}]},
  { id:"conhecimento",   label:"Conhecimento",      color:"#4f46e5", weight:10,
    subareas:[{id:"con_tecnico",label:"Técnico",color:"#6366f1",weight:40},{id:"con_idiomas",label:"Idiomas",color:"#4338ca",weight:30},{id:"con_cultura",label:"Cultura",color:"#4f46e5",weight:30}]},
  { id:"relacionamentos",label:"Relacionamentos",   color:"#ec4899", weight:10,
    subareas:[{id:"rel_casal",label:"Casal",color:"#f43f5e",weight:40},{id:"rel_familia",label:"Família",color:"#fb7185",weight:35},{id:"rel_amigos",label:"Amigos",color:"#ec4899",weight:25}]},
  { id:"saude",          label:"Saúde",             color:"#ef4444", weight:10,
    subareas:[{id:"sau_corpo",label:"Corpo",color:"#f97316",weight:40},{id:"sau_mente",label:"Mente",color:"#ef4444",weight:35},{id:"sau_energia",label:"Energia",color:"#fca5a5",weight:25}]},
  { id:"autocuidado",    label:"Autocuidado",       color:"#f59e0b", weight:10,
    subareas:[{id:"aut_aparencia",label:"Aparência",color:"#fbbf24",weight:40},{id:"aut_higiene",label:"Higiene",color:"#f59e0b",weight:30},{id:"aut_estilo",label:"Estilo",color:"#d97706",weight:30}]},
  { id:"qualidade_vida", label:"Qualidade de Vida", color:"#84cc16", weight:10,
    subareas:[{id:"qv_lazer",label:"Lazer",color:"#a3e635",weight:35},{id:"qv_lar",label:"Lar",color:"#84cc16",weight:35},{id:"qv_experiencias",label:"Experiências",color:"#65a30d",weight:30}]},
  { id:"profissional",   label:"Profissional",      color:"#f97316", weight:10,
    subareas:[{id:"pro_carreira",label:"Carreira",color:"#fb923c",weight:35},{id:"pro_projetos",label:"Projetos",color:"#f97316",weight:25},{id:"pro_educacao",label:"Educação",color:"#ea580c",weight:20},{id:"pro_marca",label:"Marca Pessoal",color:"#fdba74",weight:20}]},
  { id:"financas",       label:"Finanças",          color:"#10b981", weight:10,
    subareas:[{id:"fin_receita",label:"Receita",color:"#34d399",weight:30},{id:"fin_gastos",label:"Gastos",color:"#10b981",weight:30},{id:"fin_patrimonio",label:"Patrimônio",color:"#059669",weight:40}]},
  { id:"pessoal",        label:"Pessoal",           color:"#b45309", weight:10,
    subareas:[{id:"pes_valores",label:"Valores",color:"#d97706",weight:35},{id:"pes_proposito",label:"Propósito",color:"#b45309",weight:35},{id:"pes_autocon",label:"Autoconhecimento",color:"#92400e",weight:30}]},
];

const SEFIROT = [
  { id:"kether",    num:1,  name:"Kether",    ptName:"Coroa",        meaning:"Desejos",          x:150, y:38,  color:"#06b6d4", areaId:"desejos",        icon:"key"      },
  { id:"chokmah",   num:2,  name:"Chokmah",   ptName:"Sabedoria",    meaning:"Espiritualidade",  x:68,  y:100, color:"#c084fc", areaId:"espiritualidade",icon:"lotus"    },
  { id:"binah",     num:3,  name:"Binah",     ptName:"Entendimento", meaning:"Conhecimento",     x:232, y:100, color:"#4f46e5", areaId:"conhecimento",   icon:"book"     },
  { id:"chesed",    num:4,  name:"Chesed",    ptName:"Misericórdia", meaning:"Relacionamentos",  x:68,  y:198, color:"#ec4899", areaId:"relacionamentos",icon:"heart"    },
  { id:"geburah",   num:5,  name:"Geburah",   ptName:"Força",        meaning:"Saúde",            x:232, y:198, color:"#ef4444", areaId:"saude",          icon:"flame"    },
  { id:"tiphareth", num:6,  name:"Tiphareth", ptName:"Beleza",       meaning:"Autocuidado",      x:150, y:232, color:"#f59e0b", areaId:"autocuidado",    icon:"sun"      },
  { id:"netzach",   num:7,  name:"Netzach",   ptName:"Vitória",      meaning:"Qualidade de Vida",x:68,  y:305, color:"#84cc16", areaId:"qualidade_vida", icon:"gitbranch"},
  { id:"hod",       num:8,  name:"Hod",       ptName:"Esplendor",    meaning:"Profissional",     x:232, y:305, color:"#f97316", areaId:"profissional",   icon:"monitor"  },
  { id:"yesod",     num:9,  name:"Yesod",     ptName:"Fundação",     meaning:"Finanças",         x:150, y:368, color:"#10b981", areaId:"financas",       icon:"scale"    },
  { id:"malkuth",   num:10, name:"Malkuth",   ptName:"Reino",        meaning:"Pessoal",          x:150, y:448, color:"#b45309", areaId:"pessoal",        icon:"landmark" },
];

const PATHS = [
  [0,1],[0,2],[1,2],[0,5],[1,3],[1,5],[2,4],[2,5],
  [3,4],[3,5],[3,6],[4,5],[4,7],[5,6],[5,7],[5,8],
  [6,7],[6,8],[6,9],[7,8],[7,9],[8,9],
];

// ── SCORING ───────────────────────────────────────────────────────────────────
const todayK  = () => new Date().toISOString().slice(0,10);
const weekK   = () => { const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); };
const monthK  = () => new Date().toISOString().slice(0,7);
const uid     = () => Math.random().toString(36).slice(2,7);
const pct     = (a,b) => b===0?0:Math.min(100,Math.round(a/b*100));

const hScore = h => {
  const t=todayK(),w=weekK(),m=monthK();
  if(h.freq==="daily")   return Math.min(1,h.completions.filter(c=>c===t).length/h.freqTarget);
  if(h.freq==="weekly")  return Math.min(1,h.completions.filter(c=>c>=w).length/h.freqTarget);
  if(h.freq==="monthly") return Math.min(1,h.completions.filter(c=>c.startsWith(m)).length/h.freqTarget);
  return 0;
};
const gScore = g => {
  if(g.dir==="down") return g.progress<=g.target?1:Math.max(0,1-(g.progress-g.target)/(g.progress*1.5-g.target));
  return Math.min(1,g.progress/g.target);
};
const saScore = (sid,habits,goals) => {
  const sh=habits.filter(h=>h.subareaId===sid), sg=goals.filter(g=>g.subareaId===sid);
  if(!sh.length&&!sg.length) return 0.5;
  let t=0,c=0;
  sh.forEach(h=>{t+=hScore(h);c++;});
  sg.forEach(g=>{t+=gScore(g);c++;});
  return c?t/c:0.5;
};
const arScore = (area,habits,goals) => {
  let ws=0,ss=0;
  area.subareas.forEach(sa=>{const s=saScore(sa.id,habits,goals)*10;ss+=s*sa.weight;ws+=sa.weight;});
  return ws?ss/ws:5;
};

const LVL_T = [0,200,500,1000,2000,4000,8000,15000];
const LVL_N = ["Aprendiz","Aventureiro","Guerreiro","Herói","Campeão","Mestre","Lenda","Imortal"];
const getLevel = xp => {
  for(let i=LVL_T.length-1;i>=0;i--) if(xp>=LVL_T[i]) return {level:i+1,name:LVL_N[i],min:LVL_T[i],max:LVL_T[i+1]||LVL_T[i]*2};
  return {level:1,name:LVL_N[0],min:0,max:200};
};

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEY = "lifetree-v1";

async function loadState() {
  try {
    const res = await window.storage.get(STORAGE_KEY);
    if (res && res.value) return JSON.parse(res.value);
  } catch(e) {}
  return null;
}

async function saveState(state) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(state));
  } catch(e) {}
}

// ── KABBALAH TREE ─────────────────────────────────────────────────────────────
function KabbalahTree({ C, sefirot, scores, onSelect }) {
  const R=26;
  const scoreMap = Object.fromEntries(sefirot.map(s=>[s.id, scores[s.areaId]||0.5]));
  return (
    <svg viewBox="-20 -20 340 530" style={{width:"100%",maxWidth:340,display:"block",margin:"0 auto"}}>
      <defs>
        {sefirot.map(s=>(
          <radialGradient key={s.id} id={"rg"+s.id} cx="50%" cy="50%">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.35+scoreMap[s.id]*0.55}/>
            <stop offset="70%" stopColor={s.color} stopOpacity={0.08+scoreMap[s.id]*0.18}/>
            <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
          </radialGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[[68,80,68,320],[150,20,150,460],[232,80,232,320]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.b2} strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="3,5"/>
      ))}
      {PATHS.map(([a,b],i)=>{
        const sa=sefirot[a], sb=sefirot[b];
        const avg=(scoreMap[sa.id]+scoreMap[sb.id])/2;
        return (
          <line key={i} x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
            stroke={avg>0.65?sa.color:C.b2} strokeWidth={avg>0.65?"1.6":"0.8"}
            strokeOpacity={0.1+avg*0.5} strokeLinecap="round"/>
        );
      })}
      {sefirot.map(s=>{
        const sc=scoreMap[s.id];
        const glowR=R+10+sc*18;
        const iconD=ICONS[s.icon];
        const iconPaths=Array.isArray(iconD)?iconD:(iconD?[iconD]:[]);
        const iconSz=13, iconScale=iconSz/24;
        const ix=s.x-iconSz/2, iy=s.y-iconSz/2;
        return (
          <g key={s.id} style={{cursor:"pointer"}} onClick={()=>onSelect(s.areaId)}>
            <circle cx={s.x} cy={s.y} r={glowR} fill={"url(#rg"+s.id+")"}/>
            <circle cx={s.x} cy={s.y} r={R} fill="none" stroke={s.color} strokeWidth="1.2" strokeOpacity={0.55+sc*0.45} style={{filter:"url(#glow)"}}/>
            <circle cx={s.x} cy={s.y} r={R-2} fill={s.color} fillOpacity={0.1+sc*0.2}/>
            <g transform={"translate("+ix+","+iy+") scale("+iconScale+")"} style={{pointerEvents:"none"}}>
              {iconPaths.map((p,pi)=>{
                if(p.startsWith("circle")){
                  const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);
                  if(m) return <circle key={pi} cx={m[1]} cy={m[2]} r={m[3]} fill="none" stroke={s.color} strokeOpacity={0.65+sc*0.35} strokeWidth={1.8/iconScale} strokeLinecap="round" strokeLinejoin="round"/>;
                }
                return <path key={pi} d={p} fill="none" stroke={s.color} strokeOpacity={0.65+sc*0.35} strokeWidth={1.8/iconScale} strokeLinecap="round" strokeLinejoin="round"/>;
              })}
            </g>
            <text x={s.x} y={s.y+R+11} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={s.color} fillOpacity={0.9} style={{fontFamily:"system-ui,sans-serif",userSelect:"none"}}>
              {s.ptName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── UI PRIMITIVES (all receive C as prop) ─────────────────────────────────────
const Card = ({C,children,style={}}) => (
  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,...style}}>
    {children}
  </div>
);
const Bar = ({C,v,color,max=10}) => (
  <div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}>
    <div style={{height:"100%",width:(v/max)*100+"%",background:color,borderRadius:99,transition:"width .5s"}}/>
  </div>
);
function Sheet({C,title,onClose,children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000d",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,
        padding:"0 18px 34px",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}>
          <div style={{width:30,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>{title}</span>
            <button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,
              width:26,height:26,color:C.dim,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon name="x" size={13}/>
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
function FInp({C,label,value,onChange,type="text",placeholder,min}) {
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <input type={type} value={value} placeholder={placeholder} min={min}
        onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
          padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}
function FSel({C,label,value,onChange,opts}) {
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
          padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>
        {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
function PBtn({children,onClick,color="#818cf8",sm=false,style={}}) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,
      padding:sm?"6px 13px":"11px 18px",borderRadius:9,cursor:"pointer",
      background:"linear-gradient(135deg,"+color+"cc,"+color+"77)",
      border:"none",color:"#fff",fontWeight:700,fontSize:sm?11:13,
      width:sm?"auto":"100%",...style}}>
      {children}
    </button>
  );
}

const TABS = [
  {id:"tree",   icon:"treelife", label:"Árvore"},
  {id:"habits", icon:"check",    label:"Hábitos"},
  {id:"goals",  icon:"alvo",     label:"Metas"},
  {id:"rpg",    icon:"zap",      label:"RPG"},
  {id:"config", icon:"gear",     label:"Config"},
];

// ── AREA PAGE (top-level component — stable identity, no remount on parent re-render) ─
function AreaPage({
  C, page, areas, habits, goals, goalInputs, setGoalInputs,
  finScore, finScoreInput, setFinScoreInput, editingFinScore, setEditingFinScore,
  setPage, setHabits, setGoals, setFinScore,
  isDoneToday, doCompleteHabit, doUpdateGoal,
  openNewHabit, openEditHabit, openNewGoal, openEditGoal,
  today, wk,
}) {
  if(!page) return null;
  const ar=areas.find(a=>a.id===page.areaId);
  const sa=page.type==="subarea"?ar?.subareas.find(s=>s.id===page.subareaId):null;
  const item=sa||ar;
  const color=item?.color||"#818cf8";
  const sef=SEFIROT.find(s=>s.areaId===page.areaId);
  const score=sa?saScore(sa.id,habits,goals)*10:(ar?arScore(ar,habits,goals):5);
  const relHabits=sa?habits.filter(h=>h.subareaId===sa.id):habits.filter(h=>h.areaId===ar?.id);
  const relGoals=sa?goals.filter(g=>g.subareaId===sa.id):goals.filter(g=>g.areaId===ar?.id);
  const mn=monthK();

  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <button onClick={()=>setPage(sa?{type:"area",areaId:ar.id}:null)}
          style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,
            padding:"6px 12px",color:C.dim,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600}}>
          <Icon name="back" size={13}/>{sa?ar?.label:"Árvore"}
        </button>
        {sa&&<span style={{fontSize:10,color:C.muted}}>/ {sa.label}</span>}
      </div>

      <div style={{background:"linear-gradient(135deg,"+color+"18,"+color+"06)",
        border:"1px solid "+color+"33",borderRadius:16,padding:18,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:color+"22",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {sef&&!sa?<Icon name={sef.icon} size={22} color={color}/>:
             <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800}}>{item?.label}</div>
            {sef&&!sa&&<div style={{fontSize:10,color:C.muted,marginTop:1}}>{sef.name} · {sef.ptName}</div>}
            {sa&&<div style={{fontSize:10,color:ar?.color}}>{ar?.label}</div>}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:4}}>
          <span>PROGRESSO</span><span style={{color,fontWeight:700}}>{Math.round((score/10)*100)}%</span>
        </div>
        <div style={{height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:(score/10)*100+"%",background:"linear-gradient(90deg,"+color+","+color+"88)",borderRadius:99}}/>
        </div>
      </div>

      {/* YESOD bridge */}
      {!sa&&ar?.id==="financas"&&(
        <div style={{marginBottom:14}}>
          <div style={{background:"linear-gradient(135deg,#10b98118,#10b98106)",border:"1px solid #10b98133",borderRadius:14,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:9,color:"#10b981",fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE FINANCEIRO</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>Informe o score da aba Yesod no módulo de Finanças</div>
              </div>
              <button onClick={()=>{setFinScoreInput(finScore);setEditingFinScore(true);}}
                style={{background:"#10b98122",border:"1px solid #10b98144",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#10b981",fontSize:11,fontWeight:700}}>
                Atualizar
              </button>
            </div>
            {editingFinScore?(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <input type="number" min={0} max={100} value={finScoreInput}
                    onChange={e=>setFinScoreInput(Math.min(100,Math.max(0,Number(e.target.value))))}
                    style={{flex:1,background:C.bg,border:"1px solid #10b981",borderRadius:8,padding:"8px 12px",color:C.text,fontSize:18,fontWeight:700,outline:"none",textAlign:"center"}}/>
                  <span style={{fontSize:18,fontWeight:700,color:"#10b981"}}>%</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setFinScore(finScoreInput);setEditingFinScore(false);}}
                    style={{flex:1,padding:"9px",borderRadius:8,background:"#10b981",border:"none",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Salvar</button>
                  <button onClick={()=>setEditingFinScore(false)}
                    style={{padding:"9px 14px",borderRadius:8,background:C.b1,border:"none",color:C.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>Cancelar</button>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontSize:48,fontWeight:900,color:"#10b981",lineHeight:1,marginBottom:8}}>{finScore}%</div>
                <div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:finScore+"%",background:"linear-gradient(90deg,#10b981,#06b6d4)",borderRadius:99,transition:"width .6s"}}/>
                </div>
                <div style={{fontSize:9,color:C.muted}}>Yesod reflete este score na árvore</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* sub-areas */}
      {!sa&&ar?.subareas&&(
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>SUB-ÁREAS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {ar.subareas.map(sub=>{
              const ss=saScore(sub.id,habits,goals)*10;
              return (
                <div key={sub.id} onClick={()=>setPage({type:"subarea",areaId:ar.id,subareaId:sub.id})}
                  style={{background:C.card,border:"1px solid "+sub.color+"22",borderRadius:12,padding:11,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:sub.color,flexShrink:0}}/>
                    <span style={{fontSize:11,fontWeight:700,color:C.text,lineHeight:1.2}}>{sub.label}</span>
                  </div>
                  <Bar C={C} v={ss} color={sub.color}/>
                  <div style={{fontSize:9,color:sub.color,fontWeight:700,textAlign:"right",marginTop:3}}>
                    {Math.round((ss/10)*100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* hábitos */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS</div>
          <button onClick={()=>openNewHabit(ar?.id, sa?.id)}
            style={{background:"none",border:"1px solid "+color,borderRadius:6,padding:"3px 9px",
              color,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700}}>
            <Icon name="plus" size={10}/> Adicionar
          </button>
        </div>
        {relHabits.length===0&&(
          <div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>
            Nenhum hábito ainda — adicione o primeiro
          </div>
        )}
        {relHabits.map(h=>{
          const done=isDoneToday(h);
          const sub=ar?.subareas.find(s=>s.id===h.subareaId);
          const hcolor=sub?.color||color;
          return (
            <div key={h.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",
              background:done?hcolor+"0d":C.card,
              border:"1px solid "+(done?hcolor+"30":C.b1),
              borderRadius:10,marginBottom:6}}>
              <button onClick={()=>doCompleteHabit(h.id)}
                style={{width:22,height:22,borderRadius:6,
                  border:"1.5px solid "+(done?hcolor:C.b2),
                  background:done?hcolor:"transparent",cursor:"pointer",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                {done&&<Icon name="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:done?C.muted:C.text,fontWeight:500,
                  textDecoration:done?"line-through":"none"}}>{h.title}</div>
                {!sa&&sub&&<div style={{fontSize:9,color:hcolor,marginTop:1}}>{sub.label}</div>}
                <div style={{fontSize:9,color:C.muted,marginTop:1}}>
                  {h.freq==="daily"  &&"Diário · "  +h.completions.filter(c=>c===today).length+"/"+h.freqTarget}
                  {h.freq==="weekly" &&"Semanal · " +h.completions.filter(c=>c>=wk).length+"/"+h.freqTarget}
                  {h.freq==="monthly"&&"Mensal · "  +h.completions.filter(c=>c.startsWith(mn)).length+"/"+h.freqTarget}
                </div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
              <button onClick={()=>openEditHabit(h)}
                style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
                <Icon name="pencil" size={12}/>
              </button>
              <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))}
                style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
                <Icon name="x" size={12}/>
              </button>
            </div>
          );
        })}
      </div>

      {/* metas */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>METAS</div>
          <button onClick={()=>openNewGoal(ar?.id, sa?.id)}
            style={{background:"none",border:"1px solid "+color,borderRadius:6,padding:"3px 9px",
              color,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700}}>
            <Icon name="plus" size={10}/> Adicionar
          </button>
        </div>
        {relGoals.length===0&&(
          <div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>
            Nenhuma meta ainda
          </div>
        )}
        {relGoals.map(g=>{
          const p=Math.round(gScore(g)*100);
          const sub=ar?.subareas.find(s=>s.id===g.subareaId);
          const gcolor=sub?.color||color;
          return (
            <Card C={C} key={g.id} style={{marginBottom:8,borderColor:gcolor+"22",padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700}}>{g.title}</div>
                  {!sa&&sub&&<div style={{fontSize:9,color:gcolor}}>{sub.label}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:900,color:p>=100?"#34d399":gcolor}}>{p}%</div>
                  <div style={{fontSize:8,color:"#fbbf24"}}>+{g.xp} xp</div>
                </div>
                <button onClick={()=>openEditGoal(g)}
                  style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
                  <Icon name="pencil" size={13}/>
                </button>
                <button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))}
                  style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
                  <Icon name="x" size={13}/>
                </button>
              </div>
              <div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}>
                <div style={{height:"100%",width:p+"%",background:p>=100?"#34d399":gcolor,borderRadius:99}}/>
              </div>
              <div style={{fontSize:9,color:C.muted,marginBottom:p<100?8:0}}>
                {g.dir==="down"?"↓":"↑"} {g.progress} → {g.target} {g.unit}
                {p>=100&&<span style={{color:"#34d399",fontWeight:700,marginLeft:8}}>Concluída ✓</span>}
              </div>
              {p<100&&(
                <div style={{display:"flex",gap:6}}>
                  <input type="number" value={goalInputs[g.id]!==undefined?Number(goalInputs[g.id]):g.progress}
                    onChange={e=>setGoalInputs(prev=>({...prev,[g.id]:e.target.value}))}
                    style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:7,
                      padding:"6px 9px",color:C.text,fontSize:12,outline:"none"}}/>
                  <button onClick={()=>doUpdateGoal(g.id,goalInputs[g.id]!==undefined?goalInputs[g.id]:g.progress)}
                    style={{padding:"6px 12px",borderRadius:7,background:gcolor,border:"none",
                      color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Salvar</button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark,   setDark]   = useState(false);
  const C = dark ? {...DARK} : {...LIGHT};

  const [loaded,  setLoaded]  = useState(false);
  const [tab,     setTab]     = useState("tree");
  const [areas,   setAreas]   = useState(DEFAULT_AREAS);
  const [habits,  setHabits]  = useState([]);
  const [goals,   setGoals]   = useState([]);
  const [goalInputs, setGoalInputs] = useState({});
  const [wishes,  setWishes]  = useState([
    {id:"w1",title:"Teclado mecânico",cost:50,icon:"key"},
    {id:"w2",title:"Jantar especial",cost:30,icon:"sun"},
    {id:"w3",title:"Curso premium",cost:80,icon:"book"},
    {id:"w4",title:"Viagem — Buenos Aires",cost:300,icon:"gitbranch"},
  ]);
  const [xp,      setXp]      = useState(0);
  const [coins,   setCoins]   = useState(0);
  const [finScore,setFinScore]= useState(50);
  const [editingFinScore, setEditingFinScore] = useState(false);
  const [finScoreInput,   setFinScoreInput]   = useState(50);
  const [toast,   setToast]   = useState(null);
  const [page,    setPage]    = useState(null);

  // modals — null = closed | "new" = criar | {id,...} = editar
  const [mHabit,  setMHabit]  = useState(null);
  const [mGoal,   setMGoal]   = useState(null);
  const [mWish,   setMWish]   = useState(false);

  const blankH={title:"",areaId:"saude",subareaId:"sau_corpo",freq:"daily",freqTarget:1,xp:20};
  const blankG={title:"",areaId:"saude",subareaId:"sau_corpo",progress:0,target:100,unit:"%",xp:100,dir:"up"};
  const blankW={title:"",cost:50,icon:"key"};
  const [hF,setHF]=useState(blankH);
  const [gF,setGF]=useState(blankG);
  const [wF,setWF]=useState(blankW);

  const lvl=getLevel(xp);
  const today=todayK(), wk=weekK();

  const aScoresBase=Object.fromEntries(areas.map(ar=>[ar.id, arScore(ar,habits,goals)/10]));
  const aScores={...aScoresBase, financas: finScore/100};

  // ── PERSISTÊNCIA: carregar ao montar ────────────────────────────────────────
  useEffect(()=>{
    loadState().then(saved=>{
      if(saved){
        if(saved.habits)   setHabits(saved.habits);
        if(saved.goals)    setGoals(saved.goals);
        if(saved.wishes)   setWishes(saved.wishes);
        if(saved.xp!=null) setXp(saved.xp);
        if(saved.coins!=null) setCoins(saved.coins);
        if(saved.finScore!=null){ setFinScore(saved.finScore); setFinScoreInput(saved.finScore); }
        if(saved.dark!=null) setDark(saved.dark);
      }
      setLoaded(true);
    });
  },[]);

  // ── PERSISTÊNCIA: salvar a cada mudança ──────────────────────────────────────
  useEffect(()=>{
    if(!loaded) return;
    saveState({ habits, goals, wishes, xp, coins, finScore, dark });
  },[habits, goals, wishes, xp, coins, finScore, dark, loaded]);

  const toast_=(msg,color="#818cf8")=>{setToast({msg,color});setTimeout(()=>setToast(null),2400);};

  const isDoneToday=h=>{
    const mn=monthK();
    if(h.freq==="daily")   return h.completions.filter(c=>c===today).length>=h.freqTarget;
    if(h.freq==="weekly")  return h.completions.filter(c=>c>=wk).length>=h.freqTarget;
    if(h.freq==="monthly") return h.completions.filter(c=>c.startsWith(mn)).length>=h.freqTarget;
    return false;
  };

  const doCompleteHabit=id=>{
    setHabits(prev=>prev.map(h=>{
      if(h.id!==id) return h;
      // BUG3 fix: check against the correct period, not just today
      const mn=monthK();
      const periodCount =
        h.freq==="daily"   ? h.completions.filter(c=>c===today).length :
        h.freq==="weekly"  ? h.completions.filter(c=>c>=wk).length :
        h.freq==="monthly" ? h.completions.filter(c=>c.startsWith(mn)).length : 0;
      if(periodCount>=h.freqTarget){toast_("Já completado!",C.muted);return h;}
      setXp(x=>x+h.xp); setCoins(c=>c+Math.floor(h.xp/5));
      const ar=areas.find(a=>a.id===h.areaId);
      toast_("+"+h.xp+" XP  +"+Math.floor(h.xp/5)+" moedas",ar?.color||"#818cf8");
      return {...h,completions:[...h.completions,today]};
    }));
  };

  const doUpdateGoal=(id,val)=>{
    setGoals(prev=>prev.map(g=>{
      if(g.id!==id) return g;
      const was=gScore(g)>=1;
      const upd={...g,progress:Number(val)};
      if(!was&&gScore(upd)>=1){setXp(x=>x+g.xp);toast_("🏆 Meta! +"+g.xp+" XP","#f59e0b");}
      return upd;
    }));
  };

  const doRedeem=w=>{
    if(coins<w.cost){toast_("Moedas insuficientes","#ef4444");return;}
    setCoins(c=>c-w.cost); toast_("Resgatado! Você merece","#f59e0b");
  };

  const getSubs=aid=>areas.find(a=>a.id===aid)?.subareas||[];
  const aOpts=areas.map(a=>({v:a.id,l:a.label}));
  const sOpts=aid=>getSubs(aid).map(s=>({v:s.id,l:s.label}));

  // ── HÁBITO: criar ou editar ──────────────────────────────────────────────────
  const openNewHabit=(areaId,subareaId)=>{
    setHF({...blankH, areaId:areaId||"saude", subareaId:subareaId||getSubs(areaId||"saude")[0]?.id||""});
    setMHabit("new");
  };
  const openEditHabit=(h)=>{
    setHF({title:h.title,areaId:h.areaId,subareaId:h.subareaId,freq:h.freq,freqTarget:h.freqTarget,xp:h.xp});
    setMHabit(h.id);
  };
  const submitHabit=()=>{
    if(!hF.title.trim()) return;
    if(mHabit==="new"){
      setHabits(p=>[...p,{id:"h"+uid(),...hF,completions:[]}]);
      toast_("Hábito criado","#c084fc");
    } else {
      setHabits(p=>p.map(h=>h.id===mHabit?{...h,...hF}:h));
      toast_("Hábito atualizado","#c084fc");
    }
    setMHabit(null); setHF(blankH);
  };

  // ── META: criar ou editar ────────────────────────────────────────────────────
  const openNewGoal=(areaId,subareaId)=>{
    setGF({...blankG, areaId:areaId||"saude", subareaId:subareaId||getSubs(areaId||"saude")[0]?.id||""});
    setMGoal("new");
  };
  const openEditGoal=(g)=>{
    setGF({title:g.title,areaId:g.areaId,subareaId:g.subareaId,progress:g.progress,target:g.target,unit:g.unit,xp:g.xp,dir:g.dir});
    setMGoal(g.id);
  };
  const submitGoal=()=>{
    if(!gF.title.trim()) return;
    if(mGoal==="new"){
      setGoals(p=>[...p,{id:"g"+uid(),...gF}]);
      toast_("Meta criada","#f59e0b");
    } else {
      setGoals(p=>p.map(g=>g.id===mGoal?{...g,...gF}:g));
      toast_("Meta atualizada","#f59e0b");
    }
    setMGoal(null); setGF(blankG);
  };

  const submitWish=()=>{
    if(!wF.title.trim()) return;
    setWishes(p=>[...p,{id:"w"+uid(),...wF}]);
    toast_("Desejo adicionado","#fbbf24"); setMWish(false); setWF(blankW);
  };

  // ── AREA PAGE (defined outside App — see below) ──────────────────────────────
  const areaPageProps = {
    C, page, areas, habits, goals, goalInputs, setGoalInputs,
    finScore, finScoreInput, setFinScoreInput, editingFinScore, setEditingFinScore,
    setPage, setHabits, setGoals, setFinScore,
    isDoneToday, doCompleteHabit, doUpdateGoal,
    openNewHabit, openEditHabit, openNewGoal, openEditGoal,
    today, wk,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  if(!loaded) return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:C.bg,minHeight:"100vh",
      maxWidth:430,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>🌳</div>
        <div style={{fontSize:12}}>Carregando sua jornada…</div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:C.bg,minHeight:"100vh",
      maxWidth:430,margin:"0 auto",color:C.text,transition:"background .3s"}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:99px;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:99px;cursor:pointer;}select option{background:#0c1018;}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}"}</style>

      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",
          padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,
          whiteSpace:"nowrap",pointerEvents:"none",boxShadow:"0 4px 20px "+toast.color+"55",
          animation:"popIn .25s ease forwards"}}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{padding:"16px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>LIFE RPG</div>
          <div style={{fontSize:17,fontWeight:800}}>
            {page ? (areas.find(a=>a.id===page.areaId)?.label||"Área") : "Árvore da Vida"}
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,
            padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
            <Icon name="alvo" size={11} color="#fbbf24"/>
            <span style={{fontWeight:800,fontSize:12,color:"#fbbf24"}}>{coins}</span>
          </div>
          <div style={{background:C.card,border:"1px solid #818cf833",borderRadius:8,
            padding:"5px 10px",display:"flex",alignItems:"center",gap:4}}>
            <Icon name="treelife" size={11} color="#818cf8"/>
            <span style={{fontWeight:800,fontSize:11,color:"#818cf8"}}>Nv.{lvl.level}</span>
          </div>
          <button onClick={()=>setDark(d=>!d)}
            style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,
              width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Icon name={dark?"sun":"moon"} size={14} color={C.dim}/>
          </button>
        </div>
      </div>

      {/* XP BAR */}
      <div style={{padding:"7px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginBottom:3}}>
          <span>{xp} XP — {lvl.name}</span><span>{lvl.max} XP</span>
        </div>
        <div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:pct(xp-lvl.min,lvl.max-lvl.min)+"%",
            background:"linear-gradient(90deg,#c084fc,#06b6d4)",borderRadius:99,transition:"width .8s"}}/>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"8px 16px 90px"}}>
        {page&&<AreaPage {...areaPageProps}/>}
        {!page&&<>

        {/* ══ TREE */}
        {tab==="tree"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <KabbalahTree C={C} sefirot={SEFIROT} scores={aScores} onSelect={areaId=>setPage({type:"area",areaId})}/>
          </div>
        )}

        {/* ══ HABITS */}
        {tab==="habits"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:11,color:C.muted}}>
                {habits.filter(h=>isDoneToday(h)).length}/{habits.length} hoje
              </span>
              <PBtn sm onClick={()=>openNewHabit()}><Icon name="plus" size={12}/> Hábito</PBtn>
            </div>
            {habits.length===0&&(
              <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                <div style={{fontSize:32,marginBottom:10}}>⚔️</div>
                <div style={{fontSize:13,fontWeight:600}}>Nenhum hábito ainda</div>
                <div style={{fontSize:11,marginTop:4}}>Toque numa sefirá para começar</div>
              </div>
            )}
            {areas.map(ar=>{
              const ah=habits.filter(h=>h.areaId===ar.id);
              if(!ah.length) return null;
              const sef=SEFIROT.find(s=>s.areaId===ar.id);
              return (
                <div key={ar.id} style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:ar.color}}/>
                    <span style={{fontSize:10,fontWeight:700,color:ar.color,letterSpacing:.3}}>
                      {ar.label.toUpperCase()}
                    </span>
                    {sef&&<span style={{fontSize:9,color:C.muted}}>· {sef.ptName}</span>}
                  </div>
                  {ah.map(h=>{
                    const done=isDoneToday(h);
                    const sub=ar.subareas.find(s=>s.id===h.subareaId);
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",
                        background:done?ar.color+"0d":C.card,
                        border:"1px solid "+(done?ar.color+"30":C.b1),
                        borderRadius:10,marginBottom:5}}>
                        <button onClick={()=>doCompleteHabit(h.id)}
                          style={{width:20,height:20,borderRadius:5,
                            border:"1.5px solid "+(done?ar.color:C.b2),
                            background:done?ar.color:"transparent",cursor:"pointer",flexShrink:0,
                            display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                          {done&&<Icon name="check" size={10} color="#fff" sw={2.5}/>}
                        </button>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:done?C.muted:C.text,fontWeight:500,
                            textDecoration:done?"line-through":"none"}}>{h.title}</div>
                          {sub&&<div style={{fontSize:9,color:ar.color,marginTop:1}}>{sub.label}</div>}
                        </div>
                        <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
                        <button onClick={()=>openEditHabit(h)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                          <Icon name="pencil" size={12}/>
                        </button>
                        <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                          <Icon name="x" size={11}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ GOALS */}
        {tab==="goals"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:11,color:C.muted}}>{goals.length} metas</span>
              <PBtn sm onClick={()=>openNewGoal()}><Icon name="plus" size={12}/> Meta</PBtn>
            </div>
            {goals.length===0&&(
              <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                <div style={{fontSize:32,marginBottom:10}}>🎯</div>
                <div style={{fontSize:13,fontWeight:600}}>Nenhuma meta ainda</div>
                <div style={{fontSize:11,marginTop:4}}>Defina o que quer conquistar</div>
              </div>
            )}
            {goals.map(g=>{
              const ar=areas.find(a=>a.id===g.areaId)||areas[0];
              const p=Math.round(gScore(g)*100);
              return (
                <Card C={C} key={g.id} style={{marginBottom:9,borderColor:ar.color+"22"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:ar.color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700}}>{g.title}</div>
                      <div style={{fontSize:9,color:ar.color}}>{ar.label}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:17,fontWeight:900,color:p>=100?"#34d399":ar.color}}>{p}%</div>
                      <div style={{fontSize:8,color:"#fbbf24"}}>+{g.xp} xp</div>
                    </div>
                    <button onClick={()=>openEditGoal(g)}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                      <Icon name="pencil" size={13}/>
                    </button>
                    <button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                      <Icon name="x" size={13}/>
                    </button>
                  </div>
                  <div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}>
                    <div style={{height:"100%",width:p+"%",background:p>=100?"#34d399":ar.color,borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginBottom:p<100?9:0}}>
                    {g.dir==="down"?"↓":"↑"} {g.progress} → {g.target} {g.unit}
                    {p>=100&&<span style={{color:"#34d399",fontWeight:700,marginLeft:8}}>✓</span>}
                  </div>
                  {p<100&&(
                    <div style={{display:"flex",gap:6}}>
                      <input type="number" value={goalInputs[g.id]!==undefined?Number(goalInputs[g.id]):g.progress}
                        onChange={e=>setGoalInputs(p=>({...p,[g.id]:e.target.value}))}
                        style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:7,
                          padding:"6px 9px",color:C.text,fontSize:12,outline:"none"}}/>
                      <button onClick={()=>doUpdateGoal(g.id,goalInputs[g.id]!==undefined?goalInputs[g.id]:g.progress)}
                        style={{padding:"6px 12px",borderRadius:7,background:ar.color,border:"none",
                          color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Salvar</button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* ══ RPG */}
        {tab==="rpg"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{background:dark?"linear-gradient(135deg,#0d1420,#1a1030)":"linear-gradient(135deg,#f0f4ff,#e8f0ff)",
              border:"1px solid "+(dark?"#c084fc22":"#c084fc44"),borderRadius:16,padding:20,marginBottom:14,textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:14,background:"#c084fc14",border:"1px solid #c084fc30",
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                <Icon name="treelife" size={26} color="#c084fc"/>
              </div>
              <div style={{fontSize:18,fontWeight:800,marginBottom:2}}>{lvl.name}</div>
              <div style={{fontSize:11,color:"#c084fc",marginBottom:14}}>Nível {lvl.level}</div>
              <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:14}}>
                {[{v:xp,l:"XP",c:"#c084fc"},{v:coins,l:"MOEDAS",c:"#fbbf24"},{v:habits.filter(h=>isDoneToday(h)).length,l:"HOJE",c:"#34d399"}].map(s=>(
                  <div key={s.l}>
                    <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:8,color:C.muted}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct(xp-lvl.min,lvl.max-lvl.min)+"%",
                  background:"linear-gradient(90deg,#c084fc,#06b6d4)",borderRadius:99}}/>
              </div>
              <div style={{fontSize:9,color:C.muted,marginTop:4}}>{lvl.max-xp} XP para Nível {lvl.level+1}</div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700}}>Lista de Desejos</span>
              <PBtn sm onClick={()=>setMWish(true)} color="#06b6d4"><Icon name="plus" size={12}/> Desejo</PBtn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {wishes.map(w=>{
                const can=coins>=w.cost;
                return (
                  <Card C={C} key={w.id} style={{padding:12,textAlign:"center",borderColor:can?"#fbbf2433":C.b1}}>
                    <div style={{width:34,height:34,borderRadius:9,background:can?"#fbbf2410":C.b1,
                      display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 7px"}}>
                      <Icon name={w.icon||"key"} size={17} color={can?"#fbbf24":C.muted}/>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{w.title}</div>
                    <div style={{fontSize:12,fontWeight:900,color:"#fbbf24",marginBottom:8}}>🪙 {w.cost}</div>
                    <button onClick={()=>doRedeem(w)}
                      style={{width:"100%",padding:"6px",borderRadius:7,cursor:can?"pointer":"default",
                        background:can?"linear-gradient(135deg,#fbbf24,#f59e0b)":C.b1,
                        border:"none",color:can?"#000":C.muted,fontSize:10,fontWeight:700}}>
                      {can?"Resgatar":"Bloqueado"}
                    </button>
                  </Card>
                );
              })}
            </div>

            <Card C={C}>
              <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Jornada de Níveis</div>
              {LVL_N.map((name,i)=>{
                const thr=LVL_T[i],reached=xp>=thr,curr=lvl.level===i+1;
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,opacity:reached?1:.3}}>
                    <div style={{width:24,height:24,borderRadius:99,flexShrink:0,
                      background:curr?"#c084fc":reached?C.b2:C.b1,
                      border:curr?"2px solid #c084fc":"none",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {reached&&!curr
                        ?<Icon name="check" size={10} color={C.dim} sw={2.5}/>
                        :<span style={{fontSize:10,fontWeight:700,color:curr?"#fff":C.muted}}>{i+1}</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:curr?"#c084fc":C.text}}>{name}</div>
                      <div style={{fontSize:8,color:C.muted}}>{thr}{LVL_T[i+1]?" → "+LVL_T[i+1]:"+"}  XP</div>
                    </div>
                    {curr&&<span style={{fontSize:8,padding:"2px 7px",borderRadius:99,
                      background:"#c084fc20",color:"#c084fc",fontWeight:700}}>ATUAL</span>}
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* ══ CONFIG */}
        {tab==="config"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.7}}>
              Mapeamento das 10 sefirot para as suas áreas de vida.
            </div>
            <Card C={C}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Sefirot → Áreas</div>
              {SEFIROT.map(s=>{
                const ar=areas.find(a=>a.id===s.areaId);
                return (
                  <div key={s.id} onClick={()=>setPage({type:"area",areaId:s.areaId})}
                    style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"9px 11px",
                      background:C.surface,borderRadius:10,cursor:"pointer",
                      border:"1px solid "+s.color+"22"}}>
                    <div style={{width:30,height:30,borderRadius:8,background:s.color+"18",
                      border:"1px solid "+s.color+"33",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name={s.icon} size={14} color={s.color}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:s.color}}>{s.ptName}</div>
                      <div style={{fontSize:9,color:C.muted}}>{s.name} · {s.meaning}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:ar?.color||s.color}}/>
                      <span style={{fontSize:10,fontWeight:600,color:ar?.color||s.color}}>{ar?.label}</span>
                    </div>
                    <Icon name="back" size={10} color={C.muted} style={{transform:"rotate(180deg)"}}/>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        </>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:C.navBg,borderTop:"1px solid "+C.b1,
        display:"flex",padding:"6px 0 12px",zIndex:50}}>
        {TABS.map(t=>{
          const a=tab===t.id&&!page;
          return (
            <button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}}
              style={{flex:1,background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"3px 0"}}>
              <div style={{width:34,height:30,borderRadius:8,
                background:a?"#c084fc13":"transparent",
                border:a?"1px solid #c084fc28":"1px solid transparent",
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                <Icon name={t.icon} size={14} color={a?"#c084fc":C.muted}/>
              </div>
              <span style={{fontSize:8,fontWeight:a?700:400,color:a?"#c084fc":C.muted,letterSpacing:.3}}>
                {t.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* SHEETS */}
      {mHabit&&(
        <Sheet C={C} title={mHabit==="new"?"Novo Hábito":"Editar Hábito"} onClose={()=>{setMHabit(null);setHF(blankH);}}>
          <FInp C={C} label="Título" value={hF.title} onChange={v=>setHF(f=>({...f,title:v}))} placeholder="Ex: Meditar 10 min"/>
          <FSel C={C} label="Área" value={hF.areaId} onChange={v=>setHF(f=>({...f,areaId:v,subareaId:getSubs(v)[0]?.id||""}))} opts={aOpts}/>
          <FSel C={C} label="Sub-área" value={hF.subareaId} onChange={v=>setHF(f=>({...f,subareaId:v}))} opts={sOpts(hF.areaId)}/>
          <FSel C={C} label="Frequência" value={hF.freq} onChange={v=>setHF(f=>({...f,freq:v}))} opts={[{v:"daily",l:"Diário"},{v:"weekly",l:"Semanal"},{v:"monthly",l:"Mensal"}]}/>
          <FInp C={C} label="Vezes por período" value={hF.freqTarget} onChange={v=>setHF(f=>({...f,freqTarget:v}))} type="number" min={1}/>
          <FInp C={C} label="XP por conclusão" value={hF.xp} onChange={v=>setHF(f=>({...f,xp:v}))} type="number" min={5}/>
          <PBtn color="#c084fc" onClick={submitHabit}>{mHabit==="new"?"Criar Hábito":"Salvar Alterações"}</PBtn>
        </Sheet>
      )}
      {mGoal&&(
        <Sheet C={C} title={mGoal==="new"?"Nova Meta":"Editar Meta"} onClose={()=>{setMGoal(null);setGF(blankG);}}>
          <FInp C={C} label="Título" value={gF.title} onChange={v=>setGF(f=>({...f,title:v}))} placeholder="Ex: Correr 5km"/>
          <FSel C={C} label="Área" value={gF.areaId} onChange={v=>setGF(f=>({...f,areaId:v,subareaId:getSubs(v)[0]?.id||""}))} opts={aOpts}/>
          <FSel C={C} label="Sub-área" value={gF.subareaId} onChange={v=>setGF(f=>({...f,subareaId:v}))} opts={sOpts(gF.areaId)}/>
          <FSel C={C} label="Direção" value={gF.dir} onChange={v=>setGF(f=>({...f,dir:v}))} opts={[{v:"up",l:"↑ Aumentar"},{v:"down",l:"↓ Reduzir"}]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FInp C={C} label="Atual" value={gF.progress} onChange={v=>setGF(f=>({...f,progress:v}))} type="number"/>
            <FInp C={C} label="Meta" value={gF.target} onChange={v=>setGF(f=>({...f,target:v}))} type="number"/>
          </div>
          <FInp C={C} label="Unidade" value={gF.unit} onChange={v=>setGF(f=>({...f,unit:v}))} placeholder="%, R$, km..."/>
          <FInp C={C} label="XP de recompensa" value={gF.xp} onChange={v=>setGF(f=>({...f,xp:v}))} type="number"/>
          <PBtn color="#f59e0b" onClick={submitGoal}>{mGoal==="new"?"Criar Meta":"Salvar Alterações"}</PBtn>
        </Sheet>
      )}
      {mWish&&(
        <Sheet C={C} title="Novo Desejo" onClose={()=>setMWish(false)}>
          <FInp C={C} label="Título" value={wF.title} onChange={v=>setWF(f=>({...f,title:v}))} placeholder="Ex: Viagem para Lisboa"/>
          <FSel C={C} label="Ícone" value={wF.icon} onChange={v=>setWF(f=>({...f,icon:v}))} opts={[
            {v:"key",l:"Chave"},{v:"sun",l:"Sol"},{v:"book",l:"Livro"},{v:"gitbranch",l:"Ramo"},
            {v:"heart",l:"Coração"},{v:"flame",l:"Chama"},{v:"monitor",l:"Monitor"},{v:"scale",l:"Balança"},
          ]}/>
          <FInp C={C} label="Custo em moedas" value={wF.cost} onChange={v=>setWF(f=>({...f,cost:v}))} type="number" min={1}/>
          <PBtn color="#06b6d4" onClick={submitWish}>Adicionar Desejo</PBtn>
        </Sheet>
      )}
    </div>
  );
}
