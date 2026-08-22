import { useState, useEffect } from "react";
import YesodModule from "./YesodModule.jsx";
import HodModule from "./HodModule.jsx";
import TipharethModule from "./TipharethModule.jsx";
import GeburahModule from "./GeburahModule.jsx";
import ChesedModule from "./ChesedModule.jsx";
import NetzachModule from "./NetzachModule.jsx";

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
  palette:  ["M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z","M6.8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z","M9.2 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z","M14.8 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z","M17.2 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z","M15 18a3 3 0 0 0 3-3"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  upload:   ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  copy:     ["M9 9V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3","M4 14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z"],
  trash:    ["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  tag:      ["M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.59-7.59a1 1 0 0 0 0-1.41L12 2Z","M7 7h.01"],
  flame2:   "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  award:    ["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z","M8.21 13.89 7 23l5-3 5 3-1.21-9.12"],
  bar2:     ["M18 20V10","M12 20V4","M6 20v-6"],
  pen:      ["M12 20h9","M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  filter:   ["M22 3H2l8 9.46V19l4 2v-8.54Z"],
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  book2:    ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  layout:   ["M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"],
  bell:     ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  clock:    ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 6v6l4 2"],
  timer:    ["M10 2h4","M12 14l4-4","M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"],
  undo:     ["M3 7v6h6","M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"],
  list:     ["M9 6h11","M9 12h11","M9 18h11","M4 6h1v1H4z","M4 12h1v1H4z","M4 18h1v1H4z"],
  flag:     ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z","M4 22v-7"],
  target2:  ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 8v4","M12 16h.01"],
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
  {id:"dash",   icon:"bar2",     label:"Dash"},
  {id:"coach",  icon:"lotus",    label:"Coach"},
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

// ── STREAK ────────────────────────────────────────────────────────────────────
const calcStreak = h => {
  if(!h.completions.length) return 0;
  const days = [...new Set(h.completions)].sort().reverse();
  let streak=0, cur=new Date();
  for(let i=0;i<365;i++){
    const k=cur.toISOString().slice(0,10);
    if(days.includes(k)) streak++;
    else if(i>0) break;
    cur.setDate(cur.getDate()-1);
  }
  return streak;
};

// ── BADGES ────────────────────────────────────────────────────────────────────
const BADGES = [
  {id:"first_habit",  icon:"check",  color:"#c084fc", label:"Primeiro Passo",  desc:"Complete seu primeiro hábito",
   check:(h,g,xp)=>h.some(x=>x.completions.length>0)},
  {id:"streak7",      icon:"flame2", color:"#f97316", label:"Semana de Fogo",  desc:"7 dias seguidos num hábito",
   check:(h)=>h.some(x=>calcStreak(x)>=7)},
  {id:"streak30",     icon:"flame2", color:"#ef4444", label:"Mês Imparável",   desc:"30 dias seguidos num hábito",
   check:(h)=>h.some(x=>calcStreak(x)>=30)},
  {id:"first_goal",   icon:"alvo",   color:"#f59e0b", label:"Conquistador",    desc:"Conclua sua primeira meta",
   check:(h,g)=>g.some(x=>gScore(x)>=1)},
  {id:"goals5",       icon:"alvo",   color:"#fbbf24", label:"Mestre das Metas",desc:"5 metas concluídas",
   check:(h,g)=>g.filter(x=>gScore(x)>=1).length>=5},
  {id:"xp500",        icon:"zap",    color:"#818cf8", label:"Aventureiro",     desc:"Acumule 500 XP",
   check:(h,g,xp)=>xp>=500},
  {id:"xp2000",       icon:"zap",    color:"#a855f7", label:"Herói",           desc:"Acumule 2000 XP",
   check:(h,g,xp)=>xp>=2000},
  {id:"allAreas",     icon:"treelife",color:"#06b6d4",label:"Árvore Completa", desc:"Hábitos em todas as 10 áreas",
   check:(h)=>{const ids=new Set(h.map(x=>x.areaId));return ids.size>=10;}},
  {id:"habits10",     icon:"check",  color:"#34d399", label:"Décuplo",         desc:"10 hábitos criados",
   check:(h)=>h.length>=10},
  {id:"diario7",      icon:"pen",    color:"#ec4899", label:"Cronista",        desc:"7 entradas no diário",
   check:(h,g,xp,diary)=>diary.length>=7},
];

// ── WIDGET BAR ────────────────────────────────────────────────────────────────
const WIDGET_DEFS = [
  {id:"habitos_hoje", label:"Hábitos hoje",    icon:"check",    color:"#34d399",
   value:(h,g,xp,coins,fs,xph,areas,isDone,today,diary,lvl)=>h.filter(x=>isDone(x)).length+"/"+h.length},
  {id:"streak_top",   label:"Streak",          icon:"flame2",   color:"#f97316",
   value:(h)=>Math.max(0,...h.map(x=>calcStreak(x)))+"d"},
  {id:"xp_hoje",      label:"XP hoje",         icon:"zap",      color:"#c084fc",
   value:(h,g,xp,coins,fs,xph,areas,isDone,today)=>"+"+(xph.find(e=>e.date===today)||{xp:0}).xp},
  {id:"nivel",        label:"Nível",           icon:"treelife", color:"#818cf8",
   value:(h,g,xp,coins,fs,xph,areas,isDone,today,diary,lvl)=>"Nv."+lvl.level+" "+lvl.name},
  {id:"moedas",       label:"Moedas",          icon:"alvo",     color:"#fbbf24",
   value:(h,g,xp,coins)=>coins+"🪙"},
  {id:"metas_ativas", label:"Metas",           icon:"alvo",     color:"#f59e0b",
   value:(h,g)=>g.filter(x=>gScore(x)<1).length+" ativas"},
  {id:"metas_feitas", label:"Concluídas",      icon:"award",    color:"#34d399",
   value:(h,g)=>g.filter(x=>gScore(x)>=1).length+" metas"},
  {id:"area_fraca",   label:"Atenção",         icon:"trend",    color:"#ef4444",
   value:(h,g,xp,coins,fs,xph,areas)=>{
     const worst=areas.filter(a=>a.id!=="financas").sort((a,b)=>arScore(a,h,g)-arScore(b,h,g))[0];
     return worst?.label||"—";
   }},
  {id:"finscore",     label:"Finanças",        icon:"scale",    color:"#10b981",
   value:(h,g,xp,coins,fs)=>fs+"%"},
  {id:"conquistas",   label:"Conquistas",      icon:"award",    color:"#a855f7",
   value:(h,g,xp,coins,fs,xph,areas,isDone,today,diary)=>
     BADGES.filter(b=>b.check(h,g,xp,diary)).length+"/"+BADGES.length},
  {id:"habitos_total",label:"Hábitos",         icon:"list",     color:"#06b6d4",
   value:(h)=>h.length+" hábitos"},
  {id:"xp_total",     label:"XP total",        icon:"zap",      color:"#818cf8",
   value:(h,g,xp)=>xp+" XP"},
  {id:"streak_medio", label:"Streak médio",    icon:"flame2",   color:"#fb923c",
   value:(h)=>h.length?Math.round(h.reduce((s,x)=>s+calcStreak(x),0)/h.length)+"d":"0d"},
  {id:"diario",       label:"Diário",          icon:"pen",      color:"#ec4899",
   value:(h,g,xp,coins,fs,xph,areas,isDone,today,diary)=>diary.length+" entradas"},
];

function WidgetBar({C,habits,goals,xp,coins,finScore,xpHistory,areas,isDoneToday,today,diary,lvl,widgetConfig,onEditWidgets}) {
  if(!widgetConfig.length) return (
    <div style={{textAlign:"center",padding:"8px 0 12px",color:C.muted,fontSize:11,cursor:"pointer"}}
      onClick={onEditWidgets}>
      ＋ Adicionar widgets
    </div>
  );
  const active=widgetConfig.map(id=>WIDGET_DEFS.find(d=>d.id===id)).filter(Boolean);
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",overflowX:"auto",gap:7,paddingBottom:4}}>
        {active.map((wd,i)=>{
          const val=wd.value(habits,goals,xp,coins,finScore,xpHistory,areas,isDoneToday,today,diary,lvl);
          return (
            <div key={wd.id} style={{flexShrink:0,minWidth:80,background:C.card,
              border:"1px solid "+wd.color+"33",borderRadius:12,padding:"9px 11px",
              textAlign:"center"}}>
              <Icon name={wd.icon} size={14} color={wd.color} style={{margin:"0 auto 4px",display:"block"}}/>
              <div style={{fontSize:13,fontWeight:900,color:wd.color,lineHeight:1.1,marginBottom:2}}>{val}</div>
              <div style={{fontSize:8,color:C.muted,letterSpacing:.3}}>{wd.label.toUpperCase()}</div>
            </div>
          );
        })}
        <div onClick={onEditWidgets} style={{flexShrink:0,width:48,background:C.b1,
          borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Icon name="gear" size={16} color={C.muted}/>
        </div>
      </div>
    </div>
  );
}

// ── SUBTASKS SHEET (proper component — needs local useState) ─────────────────
function SubtasksSheet({C,h,color,onToggle,onAdd,onRemove,onClose}) {
  const [newSt,setNewSt] = useState("");
  return (
    <Sheet C={C} title={"Sub-tarefas — "+h?.title} onClose={onClose}>
      <div style={{marginBottom:12}}>
        {(h?.subtasks||[]).length===0&&(
          <div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>
            Nenhuma sub-tarefa ainda
          </div>
        )}
        {(h?.subtasks||[]).map(st=>(
          <div key={st.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",
            borderBottom:"1px solid "+C.b1}}>
            <button onClick={()=>onToggle(h.id,st.id)}
              style={{width:18,height:18,borderRadius:4,flexShrink:0,cursor:"pointer",
                border:"1.5px solid "+(st.done?color:C.b2),
                background:st.done?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {st.done&&<Icon name="check" size={10} color="#fff" sw={2.5}/>}
            </button>
            <span style={{flex:1,fontSize:12,color:st.done?C.muted:C.text,
              textDecorationLine:st.done?"line-through":"none"}}>{st.title}</span>
            <button onClick={()=>onRemove(h.id,st.id)}
              style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
              <Icon name="x" size={12}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={newSt} onChange={e=>setNewSt(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&newSt.trim()){onAdd(h.id,newSt);setNewSt("");}}}
          placeholder="Nova sub-tarefa..."
          style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
            padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}/>
        <button onClick={()=>{if(newSt.trim()){onAdd(h.id,newSt);setNewSt("");}}}
          style={{padding:"9px 14px",borderRadius:9,background:color,border:"none",
            color:"#fff",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center"}}>
          <Icon name="plus" size={14} color="#fff"/>
        </button>
      </div>
    </Sheet>
  );
}

// ── MILESTONES SHEET (proper component) ───────────────────────────────────────
function MilestonesSheet({C,g,color,msForm,setMsForm,onToggle,onAdd,onRemove,onClose}) {
  return (
    <Sheet C={C} title={"Marcos — "+g?.title} onClose={onClose}>
      <div style={{marginBottom:12}}>
        {(g?.milestones||[]).length===0&&(
          <div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>
            Nenhum marco — divida sua meta em etapas
          </div>
        )}
        {(g?.milestones||[]).map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 0",
            borderBottom:"1px solid "+C.b1}}>
            <button onClick={()=>onToggle(g.id,m.id)}
              style={{width:18,height:18,borderRadius:4,flexShrink:0,cursor:"pointer",
                border:"1.5px solid "+(m.done?"#f59e0b":C.b2),
                background:m.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {m.done&&<Icon name="check" size={10} color="#fff" sw={2.5}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:m.done?C.muted:C.text,
                textDecorationLine:m.done?"line-through":"none"}}>{m.title}</div>
              <div style={{fontSize:9,color:C.muted}}>valor: {m.value} {g?.unit} · +{m.xp} XP</div>
            </div>
            <button onClick={()=>onRemove(g.id,m.id)}
              style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
              <Icon name="x" size={12}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{background:C.bg,border:"1px solid "+C.b1,borderRadius:12,padding:12,marginBottom:8}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>NOVO MARCO</div>
        <FInp C={C} label="Título" value={msForm.title} onChange={v=>setMsForm(f=>({...f,title:v}))} placeholder="Ex: 50% concluído"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <FInp C={C} label={"Valor ("+g?.unit+")"} value={msForm.value} onChange={v=>setMsForm(f=>({...f,value:Number(v)}))} type="number"/>
          <FInp C={C} label="XP" value={msForm.xp} onChange={v=>setMsForm(f=>({...f,xp:Number(v)}))} type="number"/>
        </div>
        <PBtn color={color} onClick={()=>onAdd(g.id)}>
          <Icon name="flag" size={13} color="#fff"/>
          <span style={{marginLeft:4}}>Adicionar marco</span>
        </PBtn>
      </div>
    </Sheet>
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
  // ── MÓDULOS ATIVOS ───────────────────────────────────────────────────────────
  const VALID_MODULES = ["yesod","hod","tiphareth","geburah"];
  const devModule = VALID_MODULES.find(m => new URLSearchParams(location.search).get("module") === m) ?? null;
  const [activeModule, setActiveModule] = useState(devModule); // null | "yesod" | "hod" | "tiphareth" | "geburah" | "chesed" | "netzach"

  // modals — null = closed | "new" = criar | {id,...} = editar
  const [mHabit,  setMHabit]  = useState(null);
  const [mGoal,   setMGoal]   = useState(null);
  const [mWish,   setMWish]   = useState(false);

  // ── SPRINT 2: filtros de hábitos ─────────────────────────────────────────────
  const [filterArea,   setFilterArea]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── SPRINT 3: diário + histórico XP ──────────────────────────────────────────
  const [diary,        setDiary]        = useState([]);
  const [xpHistory,    setXpHistory]    = useState([]);
  const [mDiary,       setMDiary]       = useState(null);
  const [diaryForm,    setDiaryForm]    = useState({sefirotId:"kether",text:"",mood:"✨"});
  const [badgeQueue,   setBadgeQueue]   = useState([]);
  const MOODS = ["✨","😊","😐","😔","🔥","💪","🙏","💭"];

  // ── SPRINT 4: edição de áreas ─────────────────────────────────────────────────
  const [mEditArea,   setMEditArea]   = useState(null);
  const [mEditSub,    setMEditSub]    = useState(null);
  const [areaForm,    setAreaForm]    = useState({label:"",color:""});
  const [subForm,     setSubForm]     = useState({label:"",color:""});
  const [mBackup,     setMBackup]     = useState(false);
  const [importText,  setImportText]  = useState("");
  const [importError, setImportError] = useState("");
  const [copiedBackup,setCopiedBackup]= useState(false);

  // ── V2: IMEDIATAS ─────────────────────────────────────────────────────────────
  // Notificações por hábito (id→{enabled,hour,min})
  const [reminders,   setReminders]   = useState({});
  const [mReminder,   setMReminder]   = useState(null);
  const [remHour,     setRemHour]     = useState(8);
  const [remMin,      setRemMin]      = useState(0);
  // Desfazer exclusão
  const [undoQueue,   setUndoQueue]   = useState([]);
  // Widget customizável
  const ALL_WIDGETS = [
    {id:"habitos_hoje", label:"Hábitos hoje",    icon:"check",   color:"#34d399"},
    {id:"streak_top",   label:"Maior streak",     icon:"flame2",  color:"#f97316"},
    {id:"xp_hoje",      label:"XP do dia",        icon:"zap",     color:"#c084fc"},
    {id:"nivel",        label:"Nível atual",      icon:"treelife",color:"#818cf8"},
    {id:"moedas",       label:"Moedas",           icon:"alvo",    color:"#fbbf24"},
    {id:"metas_ativas", label:"Metas ativas",     icon:"alvo",    color:"#f59e0b"},
    {id:"metas_feitas", label:"Metas concluídas", icon:"award",   color:"#34d399"},
    {id:"area_fraca",   label:"Área mais fraca",  icon:"trend",   color:"#ef4444"},
    {id:"finscore",     label:"Score financeiro", icon:"scale",   color:"#10b981"},
    {id:"conquistas",   label:"Conquistas",       icon:"award",   color:"#a855f7"},
    {id:"habitos_total",label:"Total hábitos",    icon:"list",    color:"#06b6d4"},
    {id:"xp_total",     label:"XP total",         icon:"zap",     color:"#818cf8"},
    {id:"streak_medio", label:"Streak médio",     icon:"flame2",  color:"#fb923c"},
    {id:"diario",       label:"Entradas diário",  icon:"pen",     color:"#ec4899"},
  ];
  const [widgetConfig, setWidgetConfig] = useState(["habitos_hoje","streak_top","xp_hoje"]);
  const [mWidgets,     setMWidgets]     = useState(false);

  // ── COACH DE IA ──────────────────────────────────────────────────────────────
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput,    setCoachInput]    = useState("");
  const [coachLoading,  setCoachLoading]  = useState(false);
  // Hábitos com sub-tarefas: h.subtasks = [{id,title,done}]
  const [mSubtasks,   setMSubtasks]   = useState(null); // habitId
  // Metas com marcos: g.milestones = [{id,title,value,xp,done}]
  const [mMilestones, setMMilestones] = useState(null); // goalId
  const [msForm,      setMsForm]      = useState({title:"",value:0,xp:25});
  // Calendário de completions
  const [calHabit,    setCalHabit]    = useState(null); // habitId to view calendar
  // Modo foco / Pomodoro
  const [focusHabit,  setFocusHabit]  = useState(null); // habitId
  const [pomodoroSecs,setPomodoroSecs]= useState(25*60);
  const [pomodoroRun, setPomodoroRun] = useState(false);
  const [pomodoroDone,setPomodoroDone]= useState(false);

  const PALETTE = [
    "#06b6d4","#0891b2","#22d3ee",
    "#c084fc","#a855f7","#e879f9",
    "#4f46e5","#6366f1","#818cf8",
    "#ec4899","#f43f5e","#fb7185",
    "#ef4444","#f97316","#fca5a5",
    "#f59e0b","#fbbf24","#d97706",
    "#84cc16","#a3e635","#65a30d",
    "#10b981","#34d399","#059669",
    "#b45309","#d97706","#92400e",
    "#64748b","#94a3b8","#cbd5e1",
  ];

  const blankH={title:"",areaId:"saude",subareaId:"sau_corpo",freq:"daily",freqTarget:1,xp:20};
  const blankG={title:"",areaId:"saude",subareaId:"sau_corpo",progress:0,target:100,unit:"%",xp:100,dir:"up"};
  const blankW={title:"",cost:50,icon:"key"};
  const [hF,setHF]=useState(blankH);
  const [gF,setGF]=useState(blankG);
  const [wF,setWF]=useState(blankW);

  const lvl=getLevel(xp);
  const today=todayK(), wk=weekK();

  const aScoresBase=Object.fromEntries(areas.map(ar=>[ar.id, arScore(ar,habits,goals)/10]));
  // Lê scores dos módulos integrados do localStorage compartilhado
  const getModuleScore = (id, fallback) => {
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      return scores[id]?.score ?? fallback;
    } catch(e) { return fallback; }
  };
  const aScores={
    ...aScoresBase,
    financas:       getModuleScore("yesod",    finScore) / 100,
    profissional:   getModuleScore("hod",      aScoresBase.profissional*100) / 100,
    autocuidado:    getModuleScore("tiphareth",aScoresBase.autocuidado*100) / 100,
    saude:          getModuleScore("geburah",  aScoresBase.saude*100) / 100,
    relacionamentos:getModuleScore("chesed",   aScoresBase.relacionamentos*100) / 100,
    qualidade_vida: getModuleScore("netzach",  aScoresBase.qualidade_vida*100) / 100,
  };

  // ── PERSISTÊNCIA: carregar ao montar ────────────────────────────────────────
  useEffect(()=>{
    loadState().then(saved=>{
      if(saved){
        if(saved.habits)   setHabits(saved.habits);
        if(saved.goals)    setGoals(saved.goals);
        if(saved.wishes)   setWishes(saved.wishes);
        if(saved.areas)    setAreas(saved.areas);
        if(saved.diary)    setDiary(saved.diary);
        if(saved.xpHistory)setXpHistory(saved.xpHistory);
        if(saved.reminders)   setReminders(saved.reminders);
        if(saved.widgetConfig)setWidgetConfig(saved.widgetConfig);
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
    saveState({ habits, goals, wishes, areas, diary, xpHistory, reminders, widgetConfig, xp, coins, finScore, dark });
  },[habits, goals, wishes, areas, diary, xpHistory, reminders, widgetConfig, xp, coins, finScore, dark, loaded]);

  const toast_=(msg,color="#818cf8")=>{setToast({msg,color});setTimeout(()=>setToast(null),2400);};

  const isDoneToday=h=>{
    const mn=monthK();
    if(h.freq==="daily")   return h.completions.filter(c=>c===today).length>=h.freqTarget;
    if(h.freq==="weekly")  return h.completions.filter(c=>c>=wk).length>=h.freqTarget;
    if(h.freq==="monthly") return h.completions.filter(c=>c.startsWith(mn)).length>=h.freqTarget;
    return false;
  };

  const checkBadges=(newHabits,newGoals,newXp,newDiary)=>{
    const earned=BADGES.filter(b=>b.check(newHabits,newGoals,newXp,newDiary||diary));
    const newOnes=earned.filter(b=>!badgeQueue.find(q=>q.id===b.id));
    if(newOnes.length) setBadgeQueue(q=>[...q,...newOnes]);
  };

  const doCompleteHabit=id=>{
    setHabits(prev=>{
      const next=prev.map(h=>{
        if(h.id!==id) return h;
        const mn=monthK();
        const periodCount =
          h.freq==="daily"   ? h.completions.filter(c=>c===today).length :
          h.freq==="weekly"  ? h.completions.filter(c=>c>=wk).length :
          h.freq==="monthly" ? h.completions.filter(c=>c.startsWith(mn)).length : 0;
        if(periodCount>=h.freqTarget){toast_("Já completado!",C.muted);return h;}
        setXp(x=>{
          const nx=x+h.xp;
          setXpHistory(hist=>{
            const k=todayK();
            const idx=hist.findIndex(e=>e.date===k);
            if(idx>=0){const n=[...hist];n[idx]={...n[idx],xp:n[idx].xp+h.xp};return n;}
            return [...hist,{date:k,xp:h.xp}].slice(-90);
          });
          setTimeout(()=>checkBadges(next,goals,nx,diary),100);
          return nx;
        });
        setCoins(c=>c+Math.floor(h.xp/5));
        const ar=areas.find(a=>a.id===h.areaId);
        toast_("+"+h.xp+" XP  +"+Math.floor(h.xp/5)+" moedas",ar?.color||"#818cf8");
        return {...h,completions:[...h.completions,today]};
      });
      return next;
    });
  };

  const doUpdateGoal=(id,val)=>{
    setGoals(prev=>{
      const next=prev.map(g=>{
        if(g.id!==id) return g;
        const was=gScore(g)>=1;
        const upd={...g,progress:Number(val)};
        if(!was&&gScore(upd)>=1){setXp(x=>x+g.xp);toast_("🏆 Meta! +"+g.xp+" XP","#f59e0b");}
        return upd;
      });
      setTimeout(()=>checkBadges(habits,next,xp,diary),100);
      return next;
    });
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

  // ── SPRINT 4: editar área ────────────────────────────────────────────────────
  const openEditArea=(ar)=>{
    setAreaForm({label:ar.label, color:ar.color});
    setMEditArea(ar.id);
  };
  const submitEditArea=()=>{
    if(!areaForm.label.trim()) return;
    setAreas(prev=>prev.map(a=>a.id===mEditArea?{...a,label:areaForm.label,color:areaForm.color}:a));
    toast_("Área atualizada",areaForm.color);
    setMEditArea(null);
  };

  // ── SPRINT 4: editar sub-área ────────────────────────────────────────────────
  const openEditSub=(areaId,sub)=>{
    setSubForm({label:sub.label, color:sub.color});
    setMEditSub({areaId, subId:sub.id});
  };
  const submitEditSub=()=>{
    if(!subForm.label.trim()) return;
    setAreas(prev=>prev.map(a=>a.id===mEditSub.areaId?{
      ...a,subareas:a.subareas.map(s=>s.id===mEditSub.subId?{...s,label:subForm.label,color:subForm.color}:s)
    }:a));
    toast_("Sub-área atualizada",subForm.color);
    setMEditSub(null);
  };

  // ── SPRINT 4: export/import ──────────────────────────────────────────────────
  // ── SPRINT 3: diário ─────────────────────────────────────────────────────────
  const submitDiary=()=>{
    if(!diaryForm.text.trim()) return;
    const entry={id:"d"+uid(),date:todayK(),...diaryForm};
    const next=[entry,...diary];
    setDiary(next);
    toast_("Entrada salva","#ec4899");
    setMDiary(null); setDiaryForm({sefirotId:"kether",text:"",mood:"✨"});
    setTimeout(()=>checkBadges(habits,goals,xp,next),100);
  };

  // ── V2: DESFAZER EXCLUSÃO ────────────────────────────────────────────────────
  const deleteWithUndo=(type,item)=>{
    if(type==="habit") setHabits(p=>p.filter(x=>x.id!==item.id));
    if(type==="goal")  setGoals(p=>p.filter(x=>x.id!==item.id));
    const t=setTimeout(()=>setUndoQueue(q=>q.filter(x=>x.id!==item.id)),5000);
    setUndoQueue(q=>[...q,{type,item,tid:t}]);
  };
  const undoDelete=(entry)=>{
    clearTimeout(entry.tid);
    if(entry.type==="habit") setHabits(p=>[...p,entry.item]);
    if(entry.type==="goal")  setGoals(p=>[...p,entry.item]);
    setUndoQueue(q=>q.filter(x=>x.item.id!==entry.item.id));
    toast_("Restaurado!","#34d399");
  };

  // ── V2: LEMBRETES ─────────────────────────────────────────────────────────────
  const saveReminder=(habitId)=>{
    setReminders(r=>({...r,[habitId]:{enabled:true,hour:remHour,min:remMin}}));
    toast_("Lembrete salvo 🔔","#818cf8"); setMReminder(null);
    // Browser Notification API
    if("Notification" in window && Notification.permission!=="granted"){
      Notification.requestPermission();
    }
  };
  const removeReminder=(habitId)=>{
    setReminders(r=>{const n={...r};delete n[habitId];return n;});
    toast_("Lembrete removido","#818cf8");
  };

  // Pomodoro timer
  useEffect(()=>{
    if(!pomodoroRun) return;
    if(pomodoroSecs<=0){setPomodoroRun(false);setPomodoroDone(true);toast_("🎉 Pomodoro concluído!","#34d399");return;}
    const t=setInterval(()=>setPomodoroSecs(s=>s-1),1000);
    return ()=>clearInterval(t);
  },[pomodoroRun,pomodoroSecs]);

  const startPomodoro=(habitId,mins=25)=>{
    setFocusHabit(habitId); setPomodoroSecs(mins*60);
    setPomodoroRun(false); setPomodoroDone(false);
  };
  const fmtTimer=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── V2: SUB-TAREFAS ──────────────────────────────────────────────────────────
  const toggleSubtask=(habitId,stId)=>{
    setHabits(p=>p.map(h=>h.id!==habitId?h:{
      ...h,subtasks:(h.subtasks||[]).map(s=>s.id!==stId?s:{...s,done:!s.done})
    }));
  };
  const addSubtask=(habitId,title)=>{
    if(!title.trim()) return;
    setHabits(p=>p.map(h=>h.id!==habitId?h:{
      ...h,subtasks:[...(h.subtasks||[]),{id:"st"+uid(),title,done:false}]
    }));
  };
  const removeSubtask=(habitId,stId)=>{
    setHabits(p=>p.map(h=>h.id!==habitId?h:{
      ...h,subtasks:(h.subtasks||[]).filter(s=>s.id!==stId)
    }));
  };

  // ── V2: MARCOS DE META ────────────────────────────────────────────────────────
  const addMilestone=(goalId)=>{
    if(!msForm.title.trim()) return;
    setGoals(p=>p.map(g=>g.id!==goalId?g:{
      ...g,milestones:[...(g.milestones||[]),{id:"ms"+uid(),...msForm,done:false}]
    }));
    setMsForm({title:"",value:0,xp:25});
    toast_("Marco adicionado","#f59e0b");
  };
  const toggleMilestone=(goalId,msId)=>{
    setGoals(p=>p.map(g=>{
      if(g.id!==goalId) return g;
      const ms=(g.milestones||[]).map(m=>{
        if(m.id!==msId) return m;
        if(!m.done){setXp(x=>x+m.xp);toast_("+"+m.xp+" XP — Marco atingido! 🏁","#f59e0b");}
        return {...m,done:!m.done};
      });
      return {...g,milestones:ms};
    }));
  };
  const removeMilestone=(goalId,msId)=>{
    setGoals(p=>p.map(g=>g.id!==goalId?g:{
      ...g,milestones:(g.milestones||[]).filter(m=>m.id!==msId)
    }));
  };

  // ── COACH DE IA ──────────────────────────────────────────────────────────────
  const sendToCoach=async(msgOverride)=>{
    const msg=(msgOverride||coachInput).trim();
    if(!msg) return;
    setCoachInput("");
    const userMsg={role:"user",content:msg};
    const newMsgs=[...coachMessages,userMsg];
    setCoachMessages(newMsgs);
    setCoachLoading(true);

    // contexto do app para o coach
    const ctx={
      habitos: habits.map(h=>({titulo:h.title,area:h.areaId,freq:h.freq,streak:calcStreak(h),
        feito_hoje:isDoneToday(h),completions:h.completions.length})),
      metas: goals.map(g=>({titulo:g.title,area:g.areaId,progresso:g.progress,
        alvo:g.target,unidade:g.unit,percentual:Math.round(gScore(g)*100)})),
      xp, nivel:lvl.level, nomeNivel:lvl.name, moedas:coins,
      score_financeiro:finScore,
      areas_scores: areas.map(ar=>({area:ar.label,score:Math.round(arScore(ar,habits,goals)*10)})),
      diario_recente: diary.slice(0,3).map(d=>({data:d.date,humor:d.mood,texto:d.text.slice(0,200)})),
    };

    const systemPrompt=`Você é o Coach de Vida do Life Tree RPG — um assistente inteligente que ajuda o usuário a evoluir em suas 10 áreas de vida (Saúde, Finanças, Relacionamentos, Espiritualidade, Conhecimento, etc), baseado na Árvore da Vida Kabbalística.

CONTEXTO ATUAL DO USUÁRIO:
${JSON.stringify(ctx,null,2)}

SUAS CAPACIDADES:
Você pode ajudar o usuário a:
1. CRIAR hábitos — responda com JSON action quando o usuário pedir para criar: {"action":"create_habit","title":"...","areaId":"...","freq":"daily|weekly|monthly","freqTarget":1,"xp":20}
2. CRIAR metas — {"action":"create_goal","title":"...","areaId":"...","progress":0,"target":100,"unit":"%","xp":100,"dir":"up|down"}
3. CRIAR entrada no diário — {"action":"create_diary","text":"...","sefirotId":"kether","mood":"✨"}
4. REGISTRAR conclusão de hábito — {"action":"complete_habit","id":"..."}
5. ATUALIZAR progresso de meta — {"action":"update_goal","id":"...","progress":50}
6. ANÁLISE e SUGESTÕES — analise os dados e sugira melhorias
7. RESPONDER perguntas sobre o progresso

REGRAS:
- Quando o usuário pedir para CRIAR algo, inclua o JSON da action no final da resposta entre <ACTION> e </ACTION>
- Seja motivador, conciso e direto
- Use emojis moderadamente  
- Responda sempre em português
- Se precisar de mais informações para criar algo, pergunte
- Quando sugerir hábitos, use os areaIds corretos: desejos, espiritualidade, conhecimento, relacionamentos, saude, autocuidado, qualidade_vida, profissional, financas, pessoal`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:systemPrompt,
          messages:newMsgs.map(m=>({role:m.role,content:m.content})),
        })
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"Erro ao processar resposta.";
      
      // parse action if present
      const actionMatch=text.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
      let cleanText=text.replace(/<ACTION>[\s\S]*?<\/ACTION>/g,"").trim();
      
      if(actionMatch){
        try{
          const action=JSON.parse(actionMatch[1].trim());
          // execute action
          if(action.action==="create_habit"){
            const sub=areas.find(a=>a.id===action.areaId)?.subareas[0];
            setHabits(p=>[...p,{id:"h"+uid(),title:action.title,areaId:action.areaId,
              subareaId:sub?.id||"",freq:action.freq||"daily",freqTarget:action.freqTarget||1,
              xp:action.xp||20,completions:[]}]);
            cleanText+=" ✅ Hábito criado!";
          }
          if(action.action==="create_goal"){
            setGoals(p=>[...p,{id:"g"+uid(),title:action.title,areaId:action.areaId,
              subareaId:areas.find(a=>a.id===action.areaId)?.subareas[0]?.id||"",
              progress:action.progress||0,target:action.target||100,
              unit:action.unit||"%",xp:action.xp||100,dir:action.dir||"up"}]);
            cleanText+=" ✅ Meta criada!";
          }
          if(action.action==="create_diary"){
            setDiary(p=>[{id:"d"+uid(),date:todayK(),sefirotId:action.sefirotId||"kether",
              text:action.text,mood:action.mood||"✨"},...p]);
            cleanText+=" ✅ Entrada salva no diário!";
          }
          if(action.action==="complete_habit"){
            doCompleteHabit(action.id);
            cleanText+=" ✅ Hábito marcado como feito!";
          }
          if(action.action==="update_goal"){
            doUpdateGoal(action.id,action.progress);
            cleanText+=" ✅ Meta atualizada!";
          }
        }catch(e){}
      }
      
      setCoachMessages(p=>[...p,{role:"assistant",content:cleanText}]);
    }catch(e){
      setCoachMessages(p=>[...p,{role:"assistant",content:"Erro de conexão. Verifique sua internet."}]);
    }
    setCoachLoading(false);
  };

  const buildBackup=()=>JSON.stringify({habits,goals,wishes,areas,diary,xpHistory,reminders,widgetConfig,xp,coins,finScore,dark,_v:3,_ts:new Date().toISOString()},null,2);

  const doExport=()=>{
    const txt=buildBackup();
    if(navigator.clipboard){
      navigator.clipboard.writeText(txt).then(()=>{setCopiedBackup(true);setTimeout(()=>setCopiedBackup(false),2500);});
    }
  };

  const doImport=()=>{
    setImportError("");
    try{
      const d=JSON.parse(importText);
      if(d.habits)    setHabits(d.habits);
      if(d.goals)     setGoals(d.goals);
      if(d.wishes)    setWishes(d.wishes);
      if(d.areas)     setAreas(d.areas);
      if(d.diary)     setDiary(d.diary);
      if(d.xpHistory) setXpHistory(d.xpHistory);
      if(d.reminders) setReminders(d.reminders);
      if(d.xp!=null)  setXp(d.xp);
      if(d.coins!=null) setCoins(d.coins);
      if(d.finScore!=null){ setFinScore(d.finScore); setFinScoreInput(d.finScore); }
      if(d.dark!=null) setDark(d.dark);
      toast_("Backup restaurado!","#34d399");
      setMBackup(false); setImportText("");
    }catch(e){
      setImportError("JSON inválido — verifique o texto copiado");
    }
  };

  const doReset=()=>{
    if(!window.confirm("Apagar todos os dados? Esta ação não pode ser desfeita.")) return;
    setHabits([]); setGoals([]); setDiary([]); setXpHistory([]); setReminders({});
    setWishes([{id:"w1",title:"Teclado mecânico",cost:50,icon:"key"},{id:"w2",title:"Jantar especial",cost:30,icon:"sun"}]);
    setAreas(DEFAULT_AREAS); setXp(0); setCoins(0); setFinScore(50);
    toast_("Dados apagados","#ef4444"); setMBackup(false);
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

  // badge popup auto-dismiss
  useEffect(()=>{
    if(!badgeQueue.length) return;
    const t=setTimeout(()=>setBadgeQueue(q=>q.slice(1)),3500);
    return ()=>clearTimeout(t);
  },[badgeQueue]);

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
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:99px;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:99px;cursor:pointer;}select option{background:#0c1018;}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.4);opacity:1}}"}</style>

      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",
          padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,
          whiteSpace:"nowrap",pointerEvents:"none",boxShadow:"0 4px 20px "+toast.color+"55",
          animation:"popIn .25s ease forwards"}}>
          {toast.msg}
        </div>
      )}

      {/* UNDO BAR */}
      {undoQueue.length>0&&(
        <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",
          background:C.surface,border:"1px solid "+C.b2,borderRadius:12,
          padding:"9px 14px",display:"flex",alignItems:"center",gap:10,zIndex:400,
          boxShadow:"0 4px 20px #0004",width:"calc(100% - 32px)",maxWidth:398}}>
          <span style={{flex:1,fontSize:11,color:C.text}}>
            {undoQueue[0].type==="habit"?"Hábito":"Meta"} excluído
          </span>
          <button onClick={()=>undoDelete(undoQueue[0])}
            style={{background:"#818cf8",border:"none",borderRadius:7,padding:"5px 12px",
              color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <Icon name="undo" size={11} color="#fff"/> Desfazer
          </button>
        </div>
      )}

      {/* BADGE POPUP */}
      {badgeQueue[0]&&(
        <div style={{position:"fixed",top:54,left:"50%",transform:"translateX(-50%)",
          background:"linear-gradient(135deg,"+badgeQueue[0].color+"ee,"+badgeQueue[0].color+"99)",
          color:"#fff",padding:"10px 18px",borderRadius:14,fontWeight:700,fontSize:12,zIndex:998,
          display:"flex",alignItems:"center",gap:9,pointerEvents:"none",
          boxShadow:"0 6px 24px "+badgeQueue[0].color+"66",animation:"popIn .3s ease forwards",
          whiteSpace:"nowrap"}}>
          <Icon name={badgeQueue[0].icon} size={18} color="#fff" sw={2}/>
          <div>
            <div style={{fontSize:10,opacity:.85,letterSpacing:.5}}>CONQUISTA DESBLOQUEADA</div>
            <div>{badgeQueue[0].label}</div>
          </div>
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

      {/* ── MÓDULO ATIVO (renderiza fora do content div) ── */}
      {activeModule==="yesod"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <YesodModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}
      {activeModule==="hod"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <HodModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}
      {activeModule==="tiphareth"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <TipharethModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}
      {activeModule==="geburah"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <GeburahModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}
      {activeModule==="chesed"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <ChesedModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}
      {activeModule==="netzach"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <NetzachModule onBack={()=>setActiveModule(null)}/>
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"8px 16px 90px"}}>
        {page&&<AreaPage {...areaPageProps}/>}
        {!page&&<>

        {/* ══ TREE */}
        {tab==="tree"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            {/* ── WIDGET CUSTOMIZÁVEL ── */}
            <WidgetBar C={C} habits={habits} goals={goals} xp={xp} coins={coins}
              lvl={lvl} finScore={finScore} xpHistory={xpHistory} areas={areas}
              isDoneToday={isDoneToday} today={today} diary={diary}
              widgetConfig={widgetConfig} onEditWidgets={()=>setMWidgets(true)}/>
            <KabbalahTree C={C} sefirot={SEFIROT} scores={aScores} onSelect={areaId=>{
              if(areaId==="financas")    { setPage(null); setActiveModule("yesod"); }
              else if(areaId==="profissional") { setPage(null); setActiveModule("hod"); }
              else if(areaId==="autocuidado")  { setPage(null); setActiveModule("tiphareth"); }
              else if(areaId==="saude")        { setPage(null); setActiveModule("geburah"); }
              else if(areaId==="relacionamentos") { setPage(null); setActiveModule("chesed"); }
              else if(areaId==="qualidade_vida")  { setPage(null); setActiveModule("netzach"); }
              else setPage({type:"area",areaId});
            }}/>
          </div>
        )}

        {/* ══ HABITS */}
        {tab==="habits"&&(()=>{
          const aOpts2=[{v:"all",l:"Todas"},...areas.map(a=>({v:a.id,l:a.label}))];
          const filtered=habits.filter(h=>{
            if(filterArea!=="all"&&h.areaId!==filterArea) return false;
            if(filterStatus==="done"&&!isDoneToday(h)) return false;
            if(filterStatus==="pending"&&isDoneToday(h)) return false;
            return true;
          });
          const byArea=areas.map(ar=>({ar,list:filtered.filter(h=>h.areaId===ar.id)})).filter(x=>x.list.length);
          return (
          <div style={{animation:"slideUp .3s ease"}}>
            {/* Header row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,color:C.muted}}>
                {habits.filter(h=>isDoneToday(h)).length}/{habits.length} hoje
              </span>
              <PBtn sm onClick={()=>openNewHabit()}><Icon name="plus" size={12}/> Hábito</PBtn>
            </div>

            {/* Filtro área */}
            <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,marginBottom:6}}>
              {aOpts2.map(o=>(
                <button key={o.v} onClick={()=>setFilterArea(o.v)}
                  style={{flexShrink:0,padding:"4px 10px",borderRadius:99,fontSize:10,fontWeight:700,cursor:"pointer",border:"none",
                    background:filterArea===o.v?"#818cf8":C.b1,color:filterArea===o.v?"#fff":C.muted}}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Filtro status */}
            <div style={{display:"flex",gap:5,marginBottom:12}}>
              {[{v:"all",l:"Todos"},{v:"done",l:"✓ Feitos"},{v:"pending",l:"⏳ Pendentes"}].map(o=>(
                <button key={o.v} onClick={()=>setFilterStatus(o.v)}
                  style={{padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,cursor:"pointer",border:"none",
                    background:filterStatus===o.v?C.b2:C.b1,color:filterStatus===o.v?C.text:C.muted}}>
                  {o.l}
                </button>
              ))}
            </div>

            {filtered.length===0&&(
              <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                <div style={{fontSize:32,marginBottom:10}}>{habits.length===0?"⚔️":"🔍"}</div>
                <div style={{fontSize:13,fontWeight:600}}>{habits.length===0?"Nenhum hábito ainda":"Nenhum hábito neste filtro"}</div>
              </div>
            )}
            {byArea.map(({ar,list})=>{
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
                  {list.map(h=>{
                    const done=isDoneToday(h);
                    const sub=ar.subareas.find(s=>s.id===h.subareaId);
                    const streak=calcStreak(h);
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
                        {streak>0&&(
                          <div style={{display:"flex",alignItems:"center",gap:2,background:streak>=7?"#f9731620":"#f9731610",
                            borderRadius:99,padding:"2px 6px"}}>
                            <Icon name="flame2" size={9} color="#f97316"/>
                            <span style={{fontSize:9,fontWeight:700,color:"#f97316"}}>{streak}</span>
                          </div>
                        )}
                        <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
                        <button onClick={()=>startPomodoro(h.id)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}
                          title="Modo foco">
                          <Icon name="timer" size={12}/>
                        </button>
                        <button onClick={()=>setCalHabit(h.id)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}
                          title="Calendário">
                          <Icon name="clock" size={12}/>
                        </button>
                        <button onClick={()=>{setMReminder(h.id);const r=reminders[h.id]||{};setRemHour(r.hour||8);setRemMin(r.min||0);}}
                          style={{background:"none",border:"none",color:reminders[h.id]?"#818cf8":C.muted,cursor:"pointer",display:"flex",padding:2}}
                          title="Lembrete">
                          <Icon name="bell" size={12} color={reminders[h.id]?"#818cf8":C.muted}/>
                        </button>
                        <button onClick={()=>setMSubtasks(h.id)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}
                          title="Sub-tarefas">
                          <Icon name="list" size={12}/>
                        </button>
                        <button onClick={()=>openEditHabit(h)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                          <Icon name="pencil" size={12}/>
                        </button>
                        <button onClick={()=>deleteWithUndo("habit",h)}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}>
                          <Icon name="x" size={11}/>
                        </button>
                        {/* sub-tarefas inline */}
                        {(h.subtasks||[]).length>0&&(
                          <div style={{marginLeft:28,marginBottom:4}}>
                            {(h.subtasks||[]).map(st=>(
                              <div key={st.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0"}}>
                                <button onClick={()=>toggleSubtask(h.id,st.id)}
                                  style={{width:14,height:14,borderRadius:3,flexShrink:0,cursor:"pointer",
                                    border:"1.5px solid "+(st.done?ar.color:C.b2),
                                    background:st.done?ar.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  {st.done&&<Icon name="check" size={8} color="#fff" sw={2.5}/>}
                                </button>
                                <span style={{fontSize:10,color:st.done?C.muted:C.text,
                                  textDecorationLine:st.done?"line-through":"none",flex:1}}>{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          );
        })()}

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
                    <button onClick={()=>setMMilestones(g.id)}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",padding:2}}
                      title="Marcos">
                      <Icon name="flag" size={13}/>
                    </button>
                    <button onClick={()=>deleteWithUndo("goal",g)}
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
                  {/* marcos */}
                  {(g.milestones||[]).length>0&&(
                    <div style={{marginBottom:8}}>
                      {(g.milestones||[]).map(m=>(
                        <div key={m.id} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",
                          borderBottom:"1px solid "+C.b1}}>
                          <button onClick={()=>toggleMilestone(g.id,m.id)}
                            style={{width:14,height:14,borderRadius:3,cursor:"pointer",flexShrink:0,
                              border:"1.5px solid "+(m.done?"#f59e0b":C.b2),
                              background:m.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {m.done&&<Icon name="check" size={8} color="#fff" sw={2.5}/>}
                          </button>
                          <span style={{flex:1,fontSize:10,color:m.done?C.muted:C.text,
                            textDecorationLine:m.done?"line-through":"none"}}>{m.title}</span>
                          <span style={{fontSize:9,color:"#fbbf24"}}>+{m.xp}</span>
                          <button onClick={()=>removeMilestone(g.id,m.id)}
                            style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:1,display:"flex"}}>
                            <Icon name="x" size={9}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

        {/* ══ COACH */}
        {tab==="coach"&&(()=>{
          const QUICK = [
            "Analise meu progresso geral",
            "Crie um hábito de meditação diária",
            "Quais áreas preciso melhorar mais?",
            "Registre no diário: me sinto motivado hoje",
            "Crie uma meta: ler 12 livros este ano",
            "Sugira 3 hábitos para saúde",
          ];
          return (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",animation:"slideUp .3s ease"}}>
            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
              {coachMessages.length===0&&(
                <div style={{padding:"0 0 16px"}}>
                  <div style={{background:"linear-gradient(135deg,#c084fc18,#06b6d418)",
                    border:"1px solid #c084fc22",borderRadius:14,padding:14,marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"#c084fc22",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Icon name="lotus" size={20} color="#c084fc"/>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:800,color:C.text}}>Coach de Vida</div>
                        <div style={{fontSize:9,color:"#c084fc"}}>Powered by Claude</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>
                      Olá! Sou seu coach. Posso analisar seu progresso, criar hábitos e metas, registrar no diário, e muito mais. Como posso ajudar?
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>AÇÕES RÁPIDAS</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {QUICK.map(q=>(
                      <button key={q} onClick={()=>sendToCoach(q)}
                        style={{textAlign:"left",padding:"9px 12px",background:C.card,
                          border:"1px solid "+C.b1,borderRadius:10,cursor:"pointer",
                          fontSize:11,color:C.text,fontWeight:500}}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {coachMessages.map((m,i)=>(
                <div key={i} style={{marginBottom:10,display:"flex",
                  justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  {m.role==="assistant"&&(
                    <div style={{width:28,height:28,borderRadius:8,background:"#c084fc22",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      flexShrink:0,marginRight:7,alignSelf:"flex-end"}}>
                      <Icon name="lotus" size={14} color="#c084fc"/>
                    </div>
                  )}
                  <div style={{maxWidth:"80%",padding:"9px 12px",borderRadius:12,
                    background:m.role==="user"?"#818cf8":C.card,
                    border:m.role==="user"?"none":"1px solid "+C.b1,
                    color:m.role==="user"?"#fff":C.text,
                    fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap",
                    borderBottomRightRadius:m.role==="user"?2:12,
                    borderBottomLeftRadius:m.role==="assistant"?2:12}}>
                    {m.content}
                  </div>
                </div>
              ))}
              {coachLoading&&(
                <div style={{display:"flex",gap:7,alignItems:"flex-end",marginBottom:10}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"#c084fc22",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name="lotus" size={14} color="#c084fc"/>
                  </div>
                  <div style={{padding:"10px 14px",background:C.card,border:"1px solid "+C.b1,
                    borderRadius:"12px 12px 12px 2px",display:"flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#c084fc",
                        animation:`pulse 1s ${i*.2}s infinite`,opacity:.7}}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Input */}
            <div style={{display:"flex",gap:8,paddingTop:8,borderTop:"1px solid "+C.b1}}>
              <input value={coachInput} onChange={e=>setCoachInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendToCoach()}
                placeholder="Pergunte ao coach ou peça para criar algo..."
                style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:12,
                  padding:"10px 14px",color:C.text,fontSize:12,outline:"none"}}/>
              <button onClick={()=>sendToCoach()}
                style={{width:42,height:42,borderRadius:12,background:"#818cf8",
                  border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon name="back" size={16} color="#fff" style={{transform:"rotate(180deg)"}}/>
              </button>
            </div>
          </div>
          );
        })()}

        {/* ══ DASH */}
        {tab==="dash"&&(()=>{
          const earnedBadges=BADGES.filter(b=>b.check(habits,goals,xp,diary));
          const maxXp=Math.max(...xpHistory.map(e=>e.xp),1);
          const last14=xpHistory.slice(-14);
          const topStreaks=[...habits].sort((a,b)=>calcStreak(b)-calcStreak(a)).slice(0,5).filter(h=>calcStreak(h)>0);
          const sefirotOpts=SEFIROT.map(s=>({v:s.id,l:s.ptName+" — "+s.name}));
          return (
          <div style={{animation:"slideUp .3s ease"}}>

            {/* ── XP Histórico ── */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>XP — ÚLTIMOS 14 DIAS</div>
              {last14.length===0?(
                <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:11}}>
                  Complete hábitos para ver o histórico
                </div>
              ):(
                <div style={{display:"flex",alignItems:"flex-end",gap:3,height:60,padding:"0 4px"}}>
                  {last14.map((e,i)=>{
                    const h=(e.xp/maxXp)*56;
                    return (
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <div style={{width:"100%",height:h,background:"linear-gradient(180deg,#c084fc,#818cf8)",
                          borderRadius:"3px 3px 0 0",minHeight:2}}/>
                        <span style={{fontSize:7,color:C.muted}}>{e.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Top Streaks ── */}
            {topStreaks.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>🔥 TOP STREAKS</div>
                {topStreaks.map(h=>{
                  const ar=areas.find(a=>a.id===h.areaId);
                  const streak=calcStreak(h);
                  return (
                    <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                      background:C.card,borderWidth:1,borderStyle:"solid",borderColor:C.b1,borderRadius:10,marginBottom:6}}>
                      <Icon name="flame2" size={16} color={streak>=30?"#ef4444":streak>=7?"#f97316":"#fbbf24"}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.text}}>{h.title}</div>
                        <div style={{fontSize:9,color:ar?.color}}>{ar?.label}</div>
                      </div>
                      <div style={{fontSize:18,fontWeight:900,color:streak>=30?"#ef4444":streak>=7?"#f97316":"#fbbf24"}}>
                        {streak}d
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Dashboard áreas ── */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>PROGRESSO POR ÁREA</div>
              {areas.map(ar=>{
                const score=ar.id==="financas"?finScore:Math.round(arScore(ar,habits,goals)*10);
                return (
                  <div key={ar.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:ar.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:C.text,width:110,flexShrink:0}}>{ar.label}</span>
                    <div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:score+"%",background:ar.color,borderRadius:99,transition:"width .6s"}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:ar.color,width:30,textAlign:"right"}}>{score}%</span>
                  </div>
                );
              })}
            </div>

            {/* ── Conquistas ── */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>
                CONQUISTAS — {earnedBadges.length}/{BADGES.length}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {BADGES.map(b=>{
                  const unlocked=earnedBadges.find(e=>e.id===b.id);
                  return (
                    <div key={b.id} style={{padding:"10px 12px",background:C.card,
                      border:"1px solid "+(unlocked?b.color+"44":C.b1),borderRadius:12,
                      opacity:unlocked?1:0.4}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                        <div style={{width:26,height:26,borderRadius:8,
                          background:unlocked?b.color+"22":C.b1,
                          display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <Icon name={b.icon} size={13} color={unlocked?b.color:C.muted}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:unlocked?C.text:C.muted,lineHeight:1.2}}>
                          {b.label}
                        </span>
                      </div>
                      <div style={{fontSize:9,color:C.muted,lineHeight:1.4}}>{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Diário ── */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>DIÁRIO</div>
                <PBtn sm onClick={()=>setMDiary("new")} color="#ec4899">
                  <Icon name="pen" size={11} color="#fff"/> <span style={{marginLeft:3}}>Escrever</span>
                </PBtn>
              </div>
              {diary.length===0&&(
                <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:11}}>
                  Nenhuma entrada ainda — registre sua jornada
                </div>
              )}
              {diary.slice(0,10).map(e=>{
                const sef=SEFIROT.find(s=>s.id===e.sefirotId);
                return (
                  <div key={e.id} style={{padding:"11px 13px",background:C.card,
                    border:"1px solid "+C.b1,borderRadius:12,marginBottom:7}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                      <span style={{fontSize:16}}>{e.mood}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:sef?.color||C.muted,fontWeight:700}}>
                          {sef?.ptName||"Geral"} · {sef?.name}
                        </div>
                        <div style={{fontSize:9,color:C.muted}}>{e.date}</div>
                      </div>
                      <button onClick={()=>setDiary(prev=>prev.filter(x=>x.id!==e.id))}
                        style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:2,display:"flex"}}>
                        <Icon name="x" size={11}/>
                      </button>
                    </div>
                    <div style={{fontSize:12,color:C.text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{e.text}</div>
                  </div>
                );
              })}
              {diary.length>10&&(
                <div style={{textAlign:"center",fontSize:10,color:C.muted,padding:"8px 0"}}>
                  +{diary.length-10} entradas anteriores
                </div>
              )}
            </div>

          </div>
          );
        })()}

        {/* ══ CONFIG */}
        {tab==="config"&&(
          <div style={{animation:"slideUp .3s ease"}}>

            {/* Export / Import */}
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button onClick={()=>setMBackup(true)} style={{flex:1,display:"flex",alignItems:"center",
                justifyContent:"center",gap:6,padding:"10px",borderRadius:10,cursor:"pointer",
                background:"linear-gradient(135deg,#10b98133,#10b98111)",
                border:"1px solid #10b98144",color:"#10b981",fontWeight:700,fontSize:11}}>
                <Icon name="download" size={13}/> Backup
              </button>
              <button onClick={()=>setMBackup(true)} style={{flex:1,display:"flex",alignItems:"center",
                justifyContent:"center",gap:6,padding:"10px",borderRadius:10,cursor:"pointer",
                background:"linear-gradient(135deg,#818cf833,#818cf811)",
                border:"1px solid #818cf844",color:"#818cf8",fontWeight:700,fontSize:11}}>
                <Icon name="upload" size={13}/> Restaurar
              </button>
            </div>

            {/* Áreas — renomear + cor */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>ÁREAS DE VIDA</div>
            {areas.map(ar=>{
              const sef=SEFIROT.find(s=>s.areaId===ar.id);
              return (
                <div key={ar.id} style={{marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",
                    background:C.card,border:"1px solid "+ar.color+"22",borderRadius:12}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:ar.color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{ar.label}</div>
                      {sef&&<div style={{fontSize:9,color:C.muted}}>{sef.name} · {sef.ptName}</div>}
                    </div>
                    <button onClick={()=>openEditArea(ar)}
                      style={{background:ar.color+"18",border:"1px solid "+ar.color+"33",borderRadius:7,
                        padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,
                        color:ar.color,fontSize:10,fontWeight:700}}>
                      <Icon name="pencil" size={10}/> Editar
                    </button>
                  </div>
                  {/* sub-áreas */}
                  <div style={{marginLeft:18,marginTop:4,display:"flex",flexDirection:"column",gap:4}}>
                    {ar.subareas.map(sub=>(
                      <div key={sub.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
                        background:C.surface,border:"1px solid "+sub.color+"22",borderRadius:8}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:sub.color,flexShrink:0}}/>
                        <span style={{flex:1,fontSize:11,color:C.text}}>{sub.label}</span>
                        <button onClick={()=>openEditSub(ar.id,sub)}
                          style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:2,display:"flex"}}>
                          <Icon name="pencil" size={11}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Sefirot map */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,margin:"16px 0 8px"}}>SEFIROT → ÁREAS</div>
            <Card C={C}>
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
                      <div style={{fontSize:9,color:C.muted}}>{s.name}</div>
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

      {/* BOTTOM NAV — hidden when module is active */}
      {!activeModule&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
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
      </div>}

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

      {/* ── SPRINT 4: EDITAR ÁREA ── */}
      {mEditArea&&(()=>{
        const ar=areas.find(a=>a.id===mEditArea);
        return (
          <Sheet C={C} title={"Editar · "+ar?.label} onClose={()=>setMEditArea(null)}>
            <FInp C={C} label="Nome da área" value={areaForm.label} onChange={v=>setAreaForm(f=>({...f,label:v}))}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>COR</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:8}}>
                {PALETTE.map(col=>(
                  <button key={col} onClick={()=>setAreaForm(f=>({...f,color:col}))}
                    style={{width:"100%",aspectRatio:"1",borderRadius:8,background:col,border:"none",cursor:"pointer",
                      outline:areaForm.color===col?"3px solid #fff":"3px solid transparent",
                      outlineOffset:1,transform:areaForm.color===col?"scale(1.15)":"scale(1)",transition:"all .15s"}}/>
                ))}
              </div>
            </div>
            <PBtn color={areaForm.color||"#818cf8"} onClick={submitEditArea}>Salvar Área</PBtn>
          </Sheet>
        );
      })()}

      {/* ── SPRINT 4: EDITAR SUB-ÁREA ── */}
      {mEditSub&&(()=>{
        const ar=areas.find(a=>a.id===mEditSub.areaId);
        const sub=ar?.subareas.find(s=>s.id===mEditSub.subId);
        return (
          <Sheet C={C} title={"Editar · "+sub?.label} onClose={()=>setMEditSub(null)}>
            <FInp C={C} label="Nome da sub-área" value={subForm.label} onChange={v=>setSubForm(f=>({...f,label:v}))}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>COR</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:8}}>
                {PALETTE.map(col=>(
                  <button key={col} onClick={()=>setSubForm(f=>({...f,color:col}))}
                    style={{width:"100%",aspectRatio:"1",borderRadius:8,background:col,border:"none",cursor:"pointer",
                      outline:subForm.color===col?"3px solid #fff":"3px solid transparent",
                      outlineOffset:1,transform:subForm.color===col?"scale(1.15)":"scale(1)",transition:"all .15s"}}/>
                ))}
              </div>
            </div>
            <PBtn color={subForm.color||"#818cf8"} onClick={submitEditSub}>Salvar Sub-área</PBtn>
          </Sheet>
        );
      })()}

      {/* ── SPRINT 4: BACKUP / RESTAURAR ── */}
      {mBackup&&(
        <Sheet C={C} title="Backup & Restaurar" onClose={()=>{setMBackup(false);setImportText("");setImportError("");}}>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>EXPORTAR DADOS</div>
            <div style={{background:C.bg,border:"1px solid "+C.b1,borderRadius:10,padding:12,marginBottom:10,
              fontSize:9,color:C.dim,fontFamily:"monospace",lineHeight:1.6}}>
              {`habits: ${habits.length} · goals: ${goals.length}`}<br/>
              {`xp: ${xp} · coins: ${coins} · finScore: ${finScore}`}
            </div>
            <PBtn color="#10b981" onClick={doExport}>
              <Icon name="copy" size={13} color="#fff"/>
              <span style={{marginLeft:4}}>{copiedBackup?"✓ Copiado!":"Copiar JSON"}</span>
            </PBtn>
            <div style={{fontSize:9,color:C.muted,marginTop:6,textAlign:"center",lineHeight:1.5}}>
              Cole num Google Keep ou bloco de notas para guardar o backup
            </div>
          </div>

          <div style={{marginBottom:18,borderTop:"1px solid "+C.b1,paddingTop:14}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>RESTAURAR BACKUP</div>
            <textarea value={importText} onChange={e=>setImportText(e.target.value)}
              placeholder="Cole aqui o JSON do backup..."
              style={{width:"100%",minHeight:90,background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
                padding:"9px 12px",color:C.text,fontSize:11,outline:"none",resize:"vertical",
                fontFamily:"monospace",boxSizing:"border-box",display:"block"}}/>
            {importError&&<div style={{fontSize:10,color:"#ef4444",marginTop:5}}>{importError}</div>}
            <PBtn color="#818cf8" onClick={doImport} style={{marginTop:8}}>
              <Icon name="upload" size={13} color="#fff"/>
              <span style={{marginLeft:4}}>Restaurar dados</span>
            </PBtn>
          </div>

          <div style={{borderTop:"1px solid "+C.b1,paddingTop:14}}>
            <div style={{fontSize:10,color:"#ef4444",fontWeight:700,letterSpacing:.8,marginBottom:8}}>ZONA DE PERIGO</div>
            <PBtn color="#ef4444" onClick={doReset}>
              <Icon name="trash" size={13} color="#fff"/>
              <span style={{marginLeft:4}}>Apagar todos os dados</span>
            </PBtn>
          </div>
        </Sheet>
      )}

      {/* ── V2: POMODORO / MODO FOCO ── */}
      {focusHabit&&(()=>{
        const h=habits.find(x=>x.id===focusHabit);
        const ar=areas.find(a=>a.id===h?.areaId);
        const color=ar?.color||"#818cf8";
        const prog=Math.min(100,(1-(pomodoroSecs/(25*60)))*100);
        return (
          <div style={{position:"fixed",inset:0,background:C.bg,zIndex:500,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:8}}>MODO FOCO</div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:24,textAlign:"center"}}>{h?.title}</div>
            <div style={{position:"relative",width:180,height:180,marginBottom:28}}>
              <svg width={180} height={180} viewBox="0 0 180 180">
                <circle cx={90} cy={90} r={80} fill="none" stroke={C.b1} strokeWidth={8}/>
                <circle cx={90} cy={90} r={80} fill="none" stroke={color} strokeWidth={8}
                  strokeDasharray={`${2*Math.PI*80}`}
                  strokeDashoffset={`${2*Math.PI*80*(1-prog/100)}`}
                  strokeLinecap="round" transform="rotate(-90 90 90)"
                  style={{transition:"stroke-dashoffset 1s linear"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:40,fontWeight:900,color:C.text,letterSpacing:2,lineHeight:1}}>
                  {fmtTimer(pomodoroSecs)}
                </div>
                {pomodoroDone&&<div style={{fontSize:11,color:"#34d399",marginTop:4}}>✓ Concluído!</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              {[15,25,50].map(m=>(
                <button key={m} onClick={()=>{setPomodoroSecs(m*60);setPomodoroRun(false);setPomodoroDone(false);}}
                  style={{padding:"5px 14px",borderRadius:99,fontSize:11,fontWeight:700,cursor:"pointer",
                    border:"1px solid "+C.b2,background:C.card,color:C.text}}>{m}min</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <PBtn color={pomodoroRun?"#ef4444":color} onClick={()=>setPomodoroRun(r=>!r)} style={{minWidth:100}}>
                <Icon name={pomodoroRun?"x":"timer"} size={14} color="#fff"/>
                <span style={{marginLeft:4}}>{pomodoroRun?"Pausar":"Iniciar"}</span>
              </PBtn>
              {pomodoroDone&&(
                <PBtn color="#34d399" onClick={()=>{doCompleteHabit(h.id);setFocusHabit(null);}} style={{minWidth:100}}>
                  <Icon name="check" size={14} color="#fff"/>
                  <span style={{marginLeft:4}}>Marcar feito</span>
                </PBtn>
              )}
            </div>
            <button onClick={()=>setFocusHabit(null)}
              style={{marginTop:20,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>
              Fechar foco
            </button>
          </div>
        );
      })()}

      {/* ── V2: LEMBRETE ── */}
      {mReminder&&(()=>{
        const h=habits.find(x=>x.id===mReminder);
        const existing=reminders[mReminder];
        return (
          <Sheet C={C} title={"Lembrete — "+h?.title} onClose={()=>setMReminder(null)}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>HORÁRIO</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:4}}>HORA</div>
                  <select value={remHour} onChange={e=>setRemHour(Number(e.target.value))}
                    style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
                      padding:"9px",color:C.text,fontSize:15,fontWeight:700,outline:"none",textAlign:"center"}}>
                    {Array.from({length:24},(_,i)=>i).map(hh=>(
                      <option key={hh} value={hh}>{String(hh).padStart(2,"0")}</option>
                    ))}
                  </select>
                </div>
                <span style={{fontSize:22,color:C.muted,paddingTop:18}}>:</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:4}}>MINUTO</div>
                  <select value={remMin} onChange={e=>setRemMin(Number(e.target.value))}
                    style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
                      padding:"9px",color:C.text,fontSize:15,fontWeight:700,outline:"none",textAlign:"center"}}>
                    {[0,5,10,15,20,25,30,35,40,45,50,55].map(m=>(
                      <option key={m} value={m}>{String(m).padStart(2,"0")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={{fontSize:9,color:C.muted,marginBottom:14,lineHeight:1.6,
              background:C.bg,padding:10,borderRadius:9}}>
              ℹ️ Lembrete salvo localmente. Para notificações push no celular, use a versão APK.
            </div>
            <PBtn color="#818cf8" onClick={()=>saveReminder(mReminder)} style={{marginBottom:8}}>
              <Icon name="bell" size={13} color="#fff"/>
              <span style={{marginLeft:4}}>Salvar — {String(remHour).padStart(2,"0")}:{String(remMin).padStart(2,"0")}</span>
            </PBtn>
            {existing&&(
              <PBtn color="#ef4444" onClick={()=>{removeReminder(mReminder);setMReminder(null);}}>
                <Icon name="trash" size={13} color="#fff"/>
                <span style={{marginLeft:4}}>Remover lembrete</span>
              </PBtn>
            )}
          </Sheet>
        );
      })()}

      {/* ── V2: SUB-TAREFAS ── */}
      {mSubtasks&&(()=>{
        const h=habits.find(x=>x.id===mSubtasks);
        const ar=areas.find(a=>a.id===h?.areaId);
        const color=ar?.color||"#818cf8";
        return (
          <SubtasksSheet C={C} h={h} color={color}
            onToggle={(hid,sid)=>toggleSubtask(hid,sid)}
            onAdd={(hid,t)=>addSubtask(hid,t)}
            onRemove={(hid,sid)=>removeSubtask(hid,sid)}
            onClose={()=>setMSubtasks(null)}/>
        );
      })()}

      {/* ── V2: MARCOS DE META ── */}
      {mMilestones&&(()=>{
        const g=goals.find(x=>x.id===mMilestones);
        const ar=areas.find(a=>a.id===g?.areaId);
        const color=ar?.color||"#f59e0b";
        return (
          <MilestonesSheet C={C} g={g} color={color}
            msForm={msForm} setMsForm={setMsForm}
            onToggle={(gid,mid)=>toggleMilestone(gid,mid)}
            onAdd={(gid)=>addMilestone(gid)}
            onRemove={(gid,mid)=>removeMilestone(gid,mid)}
            onClose={()=>setMMilestones(null)}/>
        );
      })()}

      {/* ── V2: CALENDÁRIO ── */}
      {calHabit&&(()=>{
        const h=habits.find(x=>x.id===calHabit);
        const ar=areas.find(a=>a.id===h?.areaId);
        const color=ar?.color||"#818cf8";
        const doneSet=new Set(h?.completions||[]);
        const weeks=14;
        const days=[];
        for(let i=weeks*7-1;i>=0;i--){
          const d=new Date();d.setDate(d.getDate()-i);
          days.push(d.toISOString().slice(0,10));
        }
        return (
          <Sheet C={C} title={h?.title+" — Calendário"} onClose={()=>setCalHabit(null)}>
            <div style={{fontSize:9,color:C.muted,marginBottom:12,textAlign:"center"}}>
              Últimas {weeks} semanas · {doneSet.size} completions
            </div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${weeks},1fr)`,gap:3}}>
              {days.map((d)=>{
                const done=doneSet.has(d);
                const isToday=d===todayK();
                return (
                  <div key={d} title={d} style={{aspectRatio:"1",borderRadius:3,
                    background:done?color:C.b1,opacity:done?1:0.35,
                    border:isToday?"2px solid "+color:"2px solid transparent"}}/>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginTop:12,justifyContent:"center"}}>
              <div style={{width:10,height:10,borderRadius:2,background:C.b1,opacity:.35}}/>
              <span style={{fontSize:9,color:C.muted}}>Não feito</span>
              <div style={{width:10,height:10,borderRadius:2,background:color}}/>
              <span style={{fontSize:9,color:C.muted}}>Feito</span>
            </div>
          </Sheet>
        );
      })()}

      {/* ── WIDGET CONFIG ── */}
      {mWidgets&&(
        <Sheet C={C} title="Personalizar Widgets" onClose={()=>setMWidgets(false)}>
          <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>
            Toque para ativar/desativar. Arraste para reordenar. Máximo 6 widgets visíveis de uma vez.
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ATIVOS ({widgetConfig.length}/6)</div>
            {widgetConfig.length===0&&(
              <div style={{textAlign:"center",padding:12,color:C.muted,fontSize:11,background:C.bg,borderRadius:9}}>
                Nenhum widget ativo — adicione abaixo
              </div>
            )}
            {widgetConfig.map((id,i)=>{
              const wd=WIDGET_DEFS.find(d=>d.id===id);
              if(!wd) return null;
              return (
                <div key={id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",
                  background:C.card,border:"1px solid "+wd.color+"33",borderRadius:10,marginBottom:6}}>
                  <div style={{width:28,height:28,borderRadius:8,background:wd.color+"18",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={wd.icon} size={13} color={wd.color}/>
                  </div>
                  <span style={{flex:1,fontSize:12,fontWeight:600,color:C.text}}>{wd.label}</span>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setWidgetConfig(p=>{const n=[...p];if(i>0){[n[i-1],n[i]]=[n[i],n[i-1]];}return n;})}
                      style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                        color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                      disabled={i===0}>▲</button>
                    <button onClick={()=>setWidgetConfig(p=>{const n=[...p];if(i<n.length-1){[n[i],n[i+1]]=[n[i+1],n[i]];}return n;})}
                      style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                        color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                      disabled={i===widgetConfig.length-1}>▼</button>
                    <button onClick={()=>setWidgetConfig(p=>p.filter(x=>x!==id))}
                      style={{background:"#ef444420",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                        color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name="x" size={11}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>DISPONÍVEIS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {WIDGET_DEFS.filter(wd=>!widgetConfig.includes(wd.id)).map(wd=>(
              <button key={wd.id} onClick={()=>{if(widgetConfig.length<6)setWidgetConfig(p=>[...p,wd.id]);}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",
                  background:C.card,border:"1px solid "+C.b1,borderRadius:10,cursor:"pointer",
                  opacity:widgetConfig.length>=6?0.4:1,textAlign:"left"}}>
                <div style={{width:24,height:24,borderRadius:7,background:wd.color+"18",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name={wd.icon} size={12} color={wd.color}/>
                </div>
                <span style={{fontSize:11,color:C.text,fontWeight:500}}>{wd.label}</span>
              </button>
            ))}
          </div>
          {widgetConfig.length>=6&&(
            <div style={{fontSize:10,color:"#f59e0b",marginTop:10,textAlign:"center"}}>
              Máximo de 6 widgets atingido — remova um para adicionar
            </div>
          )}
        </Sheet>
      )}

      {/* ── SPRINT 3: DIÁRIO MODAL ── */}
      {mDiary&&(
        <Sheet C={C} title="Nova Entrada" onClose={()=>setMDiary(null)}>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>HUMOR</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {MOODS.map(m=>(
                <button key={m} onClick={()=>setDiaryForm(f=>({...f,mood:m}))}
                  style={{fontSize:22,background:diaryForm.mood===m?C.b2:"none",
                    border:diaryForm.mood===m?"1px solid "+C.b2:"1px solid transparent",
                    borderRadius:8,padding:"4px 8px",cursor:"pointer",
                    transform:diaryForm.mood===m?"scale(1.2)":"scale(1)",transition:"all .15s"}}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <FSel C={C} label="Sefirá relacionada" value={diaryForm.sefirotId}
            onChange={v=>setDiaryForm(f=>({...f,sefirotId:v}))}
            opts={SEFIROT.map(s=>({v:s.id,l:s.ptName+" — "+s.name}))}/>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:4}}>REFLEXÃO</div>
            <textarea value={diaryForm.text} onChange={e=>setDiaryForm(f=>({...f,text:e.target.value}))}
              placeholder="O que está em mente hoje? Reflexões, intenções, gratidão..."
              style={{width:"100%",minHeight:120,background:C.bg,border:"1px solid "+C.b2,borderRadius:9,
                padding:"9px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",
                lineHeight:1.6,boxSizing:"border-box",display:"block"}}/>
          </div>
          <PBtn color="#ec4899" onClick={submitDiary}>
            <Icon name="pen" size={13} color="#fff"/>
            <span style={{marginLeft:4}}>Salvar entrada</span>
          </PBtn>
        </Sheet>
      )}
    </div>
  );
}
