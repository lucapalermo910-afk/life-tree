import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import YesodModule from "./YesodModule.jsx";
import HodModule from "./HodModule.jsx";
import TipharethModule from "./TipharethModule.jsx";
import GeburahModule from "./GeburahModule.jsx";
import ChesedModule from "./ChesedModule.jsx";
import NetzachModule from "./NetzachModule.jsx";
import ChokmahModule from "./ChokmahModule.jsx";
import BinahModule from "./BinahModule.jsx";
import MalkuthModule from "./MalkuthModule.jsx";
import KetherModule from "./KetherModule.jsx";
import { callCoachAPI } from "./shared/coachClient.js";
import { getSkill, pickSkillId } from "./shared/coachSkills.js";
import { YESOD_ACTION_HANDLERS } from "./shared/yesodActions.js";
import { GEBURAH_ACTION_HANDLERS } from "./shared/geburahActions.js";
import { HOD_ACTION_HANDLERS } from "./shared/hodActions.js";
import { TIPHARETH_ACTION_HANDLERS } from "./shared/tipharethActions.js";
import { CHESED_ACTION_HANDLERS } from "./shared/chesedActions.js";
import { NETZACH_ACTION_HANDLERS } from "./shared/netzachActions.js";
import { CHOKMAH_ACTION_HANDLERS } from "./shared/chokmahActions.js";
import { BINAH_ACTION_HANDLERS } from "./shared/binahActions.js";

// ── THEME ─────────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#07090f", surface:"#0c1018", card:"#0f1520",
  b1:"#182030", b2:"#253040",
  text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7",
  navBg:"#060b12",
};
const LIGHT = {
  bg:"#eef1f9", surface:"#ffffff", card:"#f8faff",
  b1:"#c4cfe6", b2:"#98aacf",
  text:"#07101e", muted:"#556080", dim:"#1e3060",
  navBg:"#eef1f9",
};
// Cor de cada sefirah/módulo — igual ao ACCENT declarado no topo de cada *Module.jsx.
// Usada pra colorir elementos que vivem no hub (não dentro do módulo em si, que já usa
// sua própria cor) mas que precisam refletir a identidade visual de qual módulo está
// ativo — hoje só a barra do Coach, ver "MODULE_ACCENTS" onde é usada mais abaixo.
const MODULE_ACCENTS = {
  yesod: "#10b981", hod: "#f97316", tiphareth: "#f59e0b",
  geburah: "#ef4444", chesed: "#ec4899", netzach: "#84cc16",
  chokmah: "#c084fc", binah: "#4f46e5", malkuth: "#b45309", kether: "#06b6d4",
};
const HUB_ACCENT = "#818cf8"; // cor do hub em si, fora de qualquer módulo (Árvore/Config)
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
  { id:"malkuth",   num:10, name:"Malkuth",   ptName:"Reino",        meaning:"Controle",         x:150, y:448, color:"#b45309", areaId:"pessoal",        icon:"landmark" }, // destaque "Controle" (18/08/2026) — sinaliza que é módulo-meio (hub que reflete os outros 9), não mais um tema de vida como os demais; decidido depois da proposta de hub central de controle, ver [[10 Malkuth]]
];

const PATHS = [
  [0,1],[0,2],[1,2],[0,5],[1,3],[1,5],[2,4],[2,5],
  [3,4],[3,5],[3,6],[4,5],[4,7],[5,6],[5,7],[5,8],
  [6,7],[6,8],[6,9],[7,8],[7,9],[8,9],
];

// ── SCORING ───────────────────────────────────────────────────────────────────
const todayK  = () => new Date().toISOString().slice(0,10);
const uid     = () => Math.random().toString(36).slice(2,7);

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
// window.storage só existe no ambiente de artefato Claude — o hub precisa de
// localStorage direto, mesmo padrão de prefixo lifetree_ que os módulos já usam.
const STORAGE_KEY = "lifetree_hub-v1";

async function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

async function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e) {}
}

// ── KABBALAH TREE ─────────────────────────────────────────────────────────────
const WAVE_WL=22, WAVE_AMP=1.7;
const buildWaveD = (leftX, rightX, baseY, bottomY) => {
  const half=WAVE_WL/2;
  let d=`M ${leftX} ${baseY} `, x=leftX, up=true;
  while (x < rightX) {
    const nx=x+half;
    d+=`Q ${x+half/2} ${baseY+(up?-WAVE_AMP:WAVE_AMP)} ${nx} ${baseY} `;
    x=nx; up=!up;
  }
  d+=`L ${rightX} ${bottomY} L ${leftX} ${bottomY} Z`;
  return d;
};

function KabbalahTree({ C, sefirot, scores, onSelect }) {
  const R=26;
  const scoreMap = Object.fromEntries(sefirot.map(s=>[s.id, scores[s.areaId]??0.5]));
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
        {sefirot.map(s=>(
          <clipPath key={"clip"+s.id} id={"clip"+s.id}>
            <circle cx={s.x} cy={s.y} r={R-2}/>
          </clipPath>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[[68,80,68,320],[150,20,150,460],[232,80,232,320]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.dim} strokeWidth="0.7" strokeOpacity="0.7"/>
      ))}
      {PATHS.map(([a,b],i)=>{
        const sa=sefirot[a], sb=sefirot[b];
        const avg=(scoreMap[sa.id]+scoreMap[sb.id])/2;
        return (
          <line key={i} x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
            stroke={avg>0.65?sa.color:C.dim} strokeWidth={avg>0.65?"1.6":"1"}
            strokeOpacity={0.4+avg*0.5} strokeLinecap="round"/>
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
            {/* container vazio — sempre visível, mostra o "copo" mesmo em 0% */}
            <circle cx={s.x} cy={s.y} r={R-2} fill={C.card} fillOpacity={0.6}/>
            {/* líquido subindo conforme o score da sefirá, com superfície ondulada */}
            <g clipPath={"url(#clip"+s.id+")"}>
              <g style={{transform:"translateY("+(s.y+(R-2)-2*(R-2)*sc)+"px)",
                transition:"transform .8s cubic-bezier(.4,0,.2,1)"}}>
                <g style={{animation:"waveMove 3.4s linear infinite"}}>
                  <path d={buildWaveD(s.x-(R-2)-WAVE_WL, s.x+(R-2)+WAVE_WL, 0, 200)}
                    fill={s.color} fillOpacity={0.7}/>
                  <path d={buildWaveD(s.x-(R-2)-WAVE_WL, s.x+(R-2)+WAVE_WL, 0, 200)}
                    fill="none" stroke={s.color} strokeOpacity={0.95} strokeWidth="1.1"/>
                </g>
              </g>
            </g>
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
              {s.meaning}
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
  const isNum = type==="number";
  // Inputs decimais precisam de estado de texto próprio: um <input type="number"> nativo
  // reporta e.target.value==="" no estado intermediário "N." (ponto sem dígito seguinte),
  // o que zerava o campo controlado a cada "." digitado. Texto local + type="text" evita isso;
  // onChange continua sempre recebendo um Number, então nenhum call site precisa mudar.
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => { if (!focused) setText(String(value ?? "")); }, [value, focused]);
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <input type={isNum?"text":type} inputMode={isNum?"decimal":undefined} value={isNum?text:value} placeholder={placeholder} min={min}
        onFocus={isNum?()=>setFocused(true):undefined}
        onBlur={isNum?()=>{setFocused(false);setText(String(value ?? ""));}:undefined}
        onChange={e=>{
          if(!isNum){onChange(e.target.value);return;}
          const raw=e.target.value;
          if(!/^-?\d*\.?\d*$/.test(raw))return;
          setText(raw);
          if(raw===""||raw==="-"||raw==="."){onChange(0);return;}
          const n=Number(raw);
          if(!Number.isNaN(n))onChange(n);
        }}
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

// "Hábitos"/"Metas" (abas genéricas do hub) removidas em 19/08/2026 — liam/escreviam um
// sistema de dado solto no próprio App.jsx, nunca ligado aos módulos reais. Hábitos ficam
// no Controle/Malkuth (agregação bidirecional dos 8 módulos), metas ficam no Desejo/Kether
// (mesmo padrão, ver KetherModule.jsx). Perdeu-se com a remoção: Pomodoro, lembretes,
// sub-tarefas, marcos e calendário por hábito — nenhum tinha equivalente real em módulo
// algum; ver [[04 Bugs Conhecidos]] pro registro completo antes de recriar, se fizer falta.
const TABS = [
  {id:"tree",   icon:"treelife", label:"Árvore"},
  {id:"config", icon:"gear",     label:"Config"},
];
// "Dash" (3º slide) removido em 18/08/2026, "Status" (2º slide — nível/moedas/desejos)
// removido em 19/08/2026 junto com a camada de RPG. Só resta "Árvore".
const TREE_SLIDES = ["Árvore"];


// ── WIDGET BAR ────────────────────────────────────────────────────────────────
// Catálogo reduzido em 19/08/2026 — os widgets de hábitos/metas/XP/nível/conquistas
// liam o sistema genérico do hub (removido junto com moedas/nível/desejos, ver
// [[04 Bugs Conhecidos]]). Só sobram os 2 widgets independentes desse sistema.
const WIDGET_DEFS = [
  {id:"finscore",     label:"Finanças",        icon:"scale",    color:"#10b981",
   value:(fs)=>fs+"%"},
  {id:"diario",       label:"Diário",          icon:"pen",      color:"#ec4899",
   value:(fs,diary)=>diary.length+" entradas"},
];

function WidgetBar({C,finScore,diary,widgetConfig,onEditWidgets}) {
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
          const val=wd.value(finScore,diary);
          return (
            <div key={wd.id} style={{flex:"1 1 80px",minWidth:80,background:C.card,
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

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark,   setDark]   = useState(false);
  const C = dark ? {...DARK} : {...LIGHT};

  const [loaded,  setLoaded]  = useState(false);
  const [tab,     setTab]     = useState("tree");
  const [treeSlide, setTreeSlide] = useState(0); // 0=Árvore 1=Status 2=Dash
  const treeWrapRef = useRef(null);
  const treeScrollRef = useRef(null);
  const treeScrollRAF = useRef(null);
  const treeSlideRefs = [useRef(null), useRef(null)];
  const treeOnScroll = () => {
    if(treeScrollRAF.current) return;
    treeScrollRAF.current = requestAnimationFrame(() => {
      treeScrollRAF.current = null;
      const el = treeScrollRef.current;
      if(!el || !el.clientWidth) return;
      const idx = Math.round(el.scrollLeft/el.clientWidth);
      setTreeSlide(s => s===idx?s:idx);
    });
  };
  // scroll-snap horizontal (mandatory) do carrossel captura o wheel vertical do mouse e
  // impede a página de rolar quando o cursor está sobre a árvore — React registra onWheel
  // como passive por padrão, então e.preventDefault() ali não tem efeito; precisa de um
  // listener nativo not-passive pra repassar o delta vertical pro scroll da página.
  useEffect(() => {
    const el = treeScrollRef.current;
    if(!el) return;
    const onWheel = e => {
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        e.preventDefault();
        window.scrollBy(0, e.deltaY);
      }
    };
    el.addEventListener("wheel", onWheel, {passive:false});
    return () => el.removeEventListener("wheel", onWheel);
  }, [loaded, tab]); // o div do carrossel só existe no DOM quando loaded && tab==="tree" — reanexa o listener toda vez que ele remonta
  const [areas,   setAreas]   = useState(DEFAULT_AREAS);
  const [finScore,setFinScore]= useState(50);
  const [editingFinScore, setEditingFinScore] = useState(false);
  const [finScoreInput,   setFinScoreInput]   = useState(50);
  const [toast,   setToast]   = useState(null);

  // ── MÓDULOS ATIVOS ───────────────────────────────────────────────────────────
  const VALID_MODULES = ["yesod","hod","tiphareth","geburah"];
  const devModule = VALID_MODULES.find(m => new URLSearchParams(location.search).get("module") === m) ?? null;
  const [activeModule, setActiveModule] = useState(devModule); // null | "yesod" | "hod" | "tiphareth" | "geburah" | "chesed" | "netzach" | "chokmah" | "binah" | "malkuth" | "kether"

  // ── SPRINT 3: diário ──────────────────────────────────────────────────────────
  const [diary,        setDiary]        = useState([]);
  const [mDiary,       setMDiary]       = useState(null);
  const [diaryForm,    setDiaryForm]    = useState({sefirotId:"kether",text:"",mood:"✨"});
  const MOODS = ["✨","😊","😐","😔","🔥","💪","🙏","💭"];

  useLayoutEffect(() => {
    const el = treeSlideRefs[treeSlide]?.current;
    if (el && treeWrapRef.current) treeWrapRef.current.style.height = el.scrollHeight + "px";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, treeSlide, diary.length]);

  // ── SPRINT 4: edição de áreas ─────────────────────────────────────────────────
  const [mEditArea,   setMEditArea]   = useState(null);
  const [mEditSub,    setMEditSub]    = useState(null);
  const [areaForm,    setAreaForm]    = useState({label:"",color:""});
  const [subForm,     setSubForm]     = useState({label:"",color:""});
  const [mBackup,     setMBackup]     = useState(false);
  const [importText,  setImportText]  = useState("");
  const [importError, setImportError] = useState("");
  const [copiedBackup,setCopiedBackup]= useState(false);

  // Widget customizável — catálogo reduzido em 19/08/2026, ver comentário no WIDGET_DEFS.
  const [widgetConfig, setWidgetConfig] = useState(["finscore","diario"]);
  const [mWidgets,     setMWidgets]     = useState(false);

  // ── BOTÃO/GESTO DE VOLTAR DO ANDROID ──────────────────────────────────────────
  // Sem isso o Capacitor cai no comportamento padrão (sai do app direto, de qualquer
  // tela) — bug reportado 22/08/2026 testando o APK no celular. Fecha um sheet do hub
  // aberto, senão sai do módulo ativo pra árvore (mesma ação do botão "← Árvore" de
  // cada módulo), senão (raiz do hub, nada aberto) sai do app de verdade. Não alcança
  // sheets/páginas internas de cada módulo (ver plano) — um back-press de dentro de um
  // módulo com algo aberto pula direto pra árvore, mas não sai mais do app sem querer.
  const backBtnStateRef = useRef();
  backBtnStateRef.current = { activeModule, mDiary, mEditArea, mEditSub, mBackup, mWidgets };
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handle = CapacitorApp.addListener("backButton", () => {
      const s = backBtnStateRef.current;
      if (s.mDiary)      { setMDiary(null);      return; }
      if (s.mEditArea)   { setMEditArea(null);   return; }
      if (s.mEditSub)    { setMEditSub(null);    return; }
      if (s.mBackup)     { setMBackup(false);    return; }
      if (s.mWidgets)    { setMWidgets(false);   return; }
      if (s.activeModule){ setActiveModule(null);return; }
      CapacitorApp.exitApp();
    });
    return () => { handle.remove(); };
  }, []);

  // ── COACH DE IA ──────────────────────────────────────────────────────────────
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput,    setCoachInput]    = useState("");
  const [coachLoading,  setCoachLoading]  = useState(false);
  // Balão da última resposta não tinha como ser fechado manualmente — um erro (ex: "problema
  // de pagamento" da API) ficava preso na tela até o usuário mandar outra pergunta, o que só
  // trocava um erro pelo próximo. `coachBubbleClosed` dá um X explícito; reseta pra false toda
  // vez que uma nova resposta chega (ver sendToCoach/confirmPendingCoachAction/cancelPendingCoachAction).
  const [coachBubbleClosed, setCoachBubbleClosed] = useState(false);
  // Ação proposta pelo coach, aguardando confirmação explícita do usuário — nenhuma ação
  // (de nenhuma skill) executa no primeiro turno, sempre fica pendente até Confirmar/Cancelar.
  const [pendingCoachAction, setPendingCoachAction] = useState(null); // {action, skillId} | null
  // Cor da barra do Coach segue o módulo ativo (vermelho no Geburah, verde no Yesod...) —
  // sem módulo aberto, usa a cor do próprio hub. Ver MODULE_ACCENTS/HUB_ACCENT no topo do arquivo.
  const coachAccent = MODULE_ACCENTS[activeModule] || HUB_ACCENT;
  // Roteamento único pros 10 nós da árvore — usado pelo onSelect da KabbalahTree e pela
  // lista "SEFIROT → ÁREAS" do Config (antes iam pra AreaPage genérica, removida em
  // 19/08/2026 junto com o hábitos/metas do hub — todos os 10 têm módulo real agora).
  const goToSefira = areaId => {
    if(areaId==="financas")             setActiveModule("yesod");
    else if(areaId==="profissional")    setActiveModule("hod");
    else if(areaId==="autocuidado")     setActiveModule("tiphareth");
    else if(areaId==="saude")           setActiveModule("geburah");
    else if(areaId==="relacionamentos") setActiveModule("chesed");
    else if(areaId==="qualidade_vida")  setActiveModule("netzach");
    else if(areaId==="espiritualidade") setActiveModule("chokmah");
    else if(areaId==="conhecimento")    setActiveModule("binah");
    else if(areaId==="pessoal")         setActiveModule("malkuth");
    else if(areaId==="desejos")         setActiveModule("kether");
  };

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

  // Lê scores dos módulos integrados do localStorage compartilhado
  const getModuleScore = (id, fallback) => {
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      return scores[id]?.score ?? fallback;
    } catch(e) { return fallback; }
  };
  // Sem hábito/meta genérico no hub desde 19/08/2026 (removido, ver TABS acima) — o único
  // fallback sem score real hoje é "desejos" (Kether não publica score próprio, é um hub de
  // metas, não um módulo com progresso quantificável). Os demais 9 leem o score real
  // publicado por cada módulo em lifetree_scores; chokmah/binah/malkuth entraram nesse mapa
  // em 19/08/2026 — publicavam certo mas a árvore ignorava (gap achado em 15/08, ver
  // [[05 Roadmap]] → "Integrações entre módulos").
  const aScores={
    desejos:        0,
    financas:       getModuleScore("yesod",    finScore) / 100,
    profissional:   getModuleScore("hod",      0) / 100,
    autocuidado:    getModuleScore("tiphareth",0) / 100,
    saude:          getModuleScore("geburah",  0) / 100,
    relacionamentos:getModuleScore("chesed",   0) / 100,
    qualidade_vida: getModuleScore("netzach",  0) / 100,
    espiritualidade:getModuleScore("chokmah",  0) / 100,
    conhecimento:   getModuleScore("binah",    0) / 100,
    pessoal:        getModuleScore("malkuth",  0) / 100,
  };

  // ── PERSISTÊNCIA: carregar ao montar ────────────────────────────────────────
  useEffect(()=>{
    loadState().then(saved=>{
      if(saved){
        if(saved.areas)    setAreas(saved.areas);
        if(saved.diary)    setDiary(saved.diary);
        if(saved.widgetConfig)setWidgetConfig(saved.widgetConfig);
        if(saved.finScore!=null){ setFinScore(saved.finScore); setFinScoreInput(saved.finScore); }
        if(saved.dark!=null) setDark(saved.dark);
      }
      setLoaded(true);
    });
  },[]);

  // ── PERSISTÊNCIA: salvar a cada mudança ──────────────────────────────────────
  useEffect(()=>{
    if(!loaded) return;
    saveState({ areas, diary, widgetConfig, finScore, dark });
  },[areas, diary, widgetConfig, finScore, dark, loaded]);

  const toast_=(msg,color="#818cf8")=>{setToast({msg,color});setTimeout(()=>setToast(null),2400);};

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

  // ── SPRINT 3: diário ─────────────────────────────────────────────────────────
  const submitDiary=()=>{
    if(!diaryForm.text.trim()) return;
    const entry={id:"d"+uid(),date:todayK(),...diaryForm};
    setDiary([entry,...diary]);
    toast_("Entrada salva","#ec4899");
    setMDiary(null); setDiaryForm({sefirotId:"kether",text:"",mood:"✨"});
  };

  // ── COACH DE IA ──────────────────────────────────────────────────────────────
  const sendToCoach=async(msgOverride)=>{
    const msg=(msgOverride||coachInput).trim();
    if(!msg) return;
    setCoachInput("");
    setPendingCoachAction(null); // nova pergunta descarta silenciosamente qualquer ação ainda não confirmada
    const userMsg={role:"user",content:msg};
    const newMsgs=[...coachMessages,userMsg];
    setCoachMessages(newMsgs);
    setCoachLoading(true);

    // contexto universal — usado pela skill "hub"; outras skills (ex: yesod) montam o
    // próprio contexto a partir dos dados do módulo. areas_scores agora lê o score real
    // publicado por cada módulo (aScores), não mais o cálculo genérico do hub — corrigido
    // em 19/08/2026 junto com a remoção do sistema de hábitos/metas/XP/nível do hub
    // (hábitos/metas cross-módulo agora vivem no Controle/Malkuth e no Desejo/Kether).
    const universalCtx={
      score_financeiro:finScore,
      areas_scores: areas.map(ar=>({area:ar.label,score:Math.round((aScores[ar.id]??0)*100)})),
      diario_recente: diary.slice(0,3).map(d=>({data:d.date,humor:d.mood,texto:d.text.slice(0,200)})),
    };

    // roteamento: módulo ativo decide a skill por padrão, com fallback de intenção
    // (palavras-chave) quando a pergunta claramente foge do domínio do módulo atual
    const skillId=pickSkillId(activeModule, msg);
    const skill=getSkill(skillId);
    const skillCtx=skill.buildContext(universalCtx);
    const systemPrompt=skill.systemPrompt(skillCtx);

    try{
      const data=await callCoachAPI({
        system:systemPrompt,
        messages:newMsgs.map(m=>({role:m.role,content:m.content})),
        maxTokens:1000,
      });
      const text=data.content?.map(b=>b.text||"").join("")||"Erro ao processar resposta.";

      // parse action if present — só skills com actions:true propõem ação. Nenhuma ação
      // executa aqui: fica pendente até o usuário confirmar explicitamente (ver
      // confirmPendingCoachAction), pra qualquer registro, sempre — isso vale pra
      // hub e Yesod igual, não é uma regra só do Yesod.
      const actionMatch=text.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
      const cleanText=text.replace(/<ACTION>[\s\S]*?<\/ACTION>/g,"").trim();

      if(actionMatch && skill.actions){
        try{
          const action=JSON.parse(actionMatch[1].trim());
          setPendingCoachAction({action,skillId});
        }catch(e){}
      } else {
        setPendingCoachAction(null);
      }

      setCoachMessages(p=>[...p,{role:"assistant",content:cleanText}]);
    }catch(e){
      setCoachMessages(p=>[...p,{role:"assistant",content:"Erro de conexão: "+e.message}]);
    }
    setCoachBubbleClosed(false);
    setCoachLoading(false);
  };

  // Executa de fato uma ação já proposta e confirmada. Separado de sendToCoach porque só
  // roda depois do clique em "Confirmar" — nunca no mesmo turno em que a IA propõe.
  const executeCoachAction=(action,skillId)=>{
    if(skillId==="yesod"){
      // Yesod não guarda estado em App.jsx (vive em YesodModule.jsx/localStorage) — por
      // isso o dispatch é genérico via YESOD_ACTION_HANDLERS (yesodActions.js), que
      // leem/escrevem localStorage direto e avisam o módulo (se montado) via evento, em
      // vez de chamar setters locais como as ações do hub abaixo.
      const handler=YESOD_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="geburah"){
      // Mesmo racional do Yesod acima — Geburah também guarda o próprio estado em
      // localStorage via GeburahModule.jsx, não em App.jsx.
      const handler=GEBURAH_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="hod"){
      // Mesmo racional acima — Hod também guarda o próprio estado em localStorage via
      // HodModule.jsx, não em App.jsx.
      const handler=HOD_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="tiphareth"){
      // Mesmo racional acima — Tiphareth também guarda o próprio estado em localStorage
      // via TipharethModule.jsx, não em App.jsx.
      const handler=TIPHARETH_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="chesed"){
      // Mesmo racional acima — Chesed também guarda o próprio estado em localStorage via
      // ChesedModule.jsx, não em App.jsx.
      const handler=CHESED_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="netzach"){
      // Mesmo racional acima — Netzach também guarda o próprio estado em localStorage via
      // NetzachModule.jsx, não em App.jsx.
      const handler=NETZACH_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="chokmah"){
      // Mesmo racional acima — Chokmah também guarda o próprio estado em localStorage via
      // ChokmahModule.jsx, não em App.jsx.
      const handler=CHOKMAH_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    if(skillId==="binah"){
      // Mesmo racional acima — Binah também guarda o próprio estado em localStorage via
      // BinahModule.jsx, não em App.jsx.
      const handler=BINAH_ACTION_HANDLERS[action.action];
      if(!handler) return "Não reconheci essa ação.";
      const result=handler(action);
      return result.ok?"✅ "+result.message:"⚠️ "+result.message;
    }
    // hub — só resta o diário aqui (hábitos/metas genéricos removidos em 19/08/2026)
    if(action.action==="create_diary"){
      setDiary(p=>[{id:"d"+uid(),date:todayK(),sefirotId:action.sefirotId||"kether",
        text:action.text,mood:action.mood||"✨"},...p]);
      return "✅ Entrada salva no diário!";
    }
    return "Não reconheci essa ação.";
  };

  const confirmPendingCoachAction=()=>{
    if(!pendingCoachAction) return;
    const {action,skillId}=pendingCoachAction;
    const resultText=executeCoachAction(action,skillId);
    setCoachMessages(p=>[...p,{role:"assistant",content:resultText}]);
    setCoachBubbleClosed(false);
    setPendingCoachAction(null);
  };
  const cancelPendingCoachAction=()=>{
    setCoachMessages(p=>[...p,{role:"assistant",content:"Ok, não fiz nada."}]);
    setCoachBubbleClosed(false);
    setPendingCoachAction(null);
  };

  const buildBackup=()=>JSON.stringify({areas,diary,widgetConfig,finScore,dark,_v:4,_ts:new Date().toISOString()},null,2);

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
      if(d.areas)     setAreas(d.areas);
      if(d.diary)     setDiary(d.diary);
      if(d.widgetConfig) setWidgetConfig(d.widgetConfig);
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
    setDiary([]); setAreas(DEFAULT_AREAS); setFinScore(50);
    toast_("Dados apagados","#ef4444"); setMBackup(false);
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
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:99px;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:99px;cursor:pointer;}select option{background:#0c1018;}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.4);opacity:1}}@keyframes waveMove{from{transform:translateX(0)}to{transform:translateX(-22px)}}"}</style>

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
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>LIFE TREE</div>
          <div style={{fontSize:17,fontWeight:800}}>Árvore da Vida</div>
        </div>
        <button onClick={()=>setDark(d=>!d)}
          style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,
            width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Icon name={dark?"sun":"moon"} size={14} color={C.dim}/>
        </button>
      </div>

      {/* ── MÓDULO ATIVO (renderiza fora do content div) ── zIndex:100, abaixo do coach bar
          (150), de propósito: assim o coach bar e a bolha de resposta sempre aparecem por
          cima do conteúdo normal do módulo. Os Sheets internos de cada módulo (modais de
          Add/Edit, zIndex:300) escapam via createPortal(..., document.body) — ver Sheet em
          YesodModule.jsx — então ficam acima de tudo sem depender do zIndex deste wrapper. ── */}
      {activeModule==="yesod"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <YesodModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="hod"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <HodModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="tiphareth"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <TipharethModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark} askCoach={sendToCoach}/>
        </div>
      )}
      {activeModule==="geburah"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <GeburahModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="chesed"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <ChesedModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="netzach"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <NetzachModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="chokmah"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <ChokmahModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="binah"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <BinahModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="malkuth"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <MalkuthModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}
      {activeModule==="kether"&&(
        <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
          <KetherModule onBack={()=>setActiveModule(null)} dark={dark} setDark={setDark}/>
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"8px 16px 150px"}}>
        {/* ══ TREE ── carrossel de 1 slide só desde 19/08/2026 (Status foi removido junto
            com moedas/nível/desejos) — estrutura de scroll-snap mantida (inofensiva com 1
            slide, evita mexer no cálculo de altura/resize) mas sem indicador/setas. */}
        {tab==="tree"&&(()=>{
          return (
          <div>
            <div ref={treeWrapRef} style={{overflow:"hidden",transition:"height .32s cubic-bezier(.4,0,.2,1)"}}>
              <div ref={treeScrollRef} onScroll={treeOnScroll} style={{display:"flex",alignItems:"flex-start",
                overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>

                {/* ── SLIDE 1 — ÁRVORE ── */}
                <div ref={treeSlideRefs[0]} style={{width:"100%",flexShrink:0,scrollSnapAlign:"start"}}>
                  <WidgetBar C={C} finScore={finScore} diary={diary}
                    widgetConfig={widgetConfig} onEditWidgets={()=>setMWidgets(true)}/>
                  <KabbalahTree C={C} sefirot={SEFIROT} scores={aScores} onSelect={goToSefira}/>
                </div>

              </div>
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

            {/* Score financeiro — antes vivia na AreaPage genérica (removida em 19/08/2026
                junto com hábitos/metas do hub); único valor manual do app, o Yesod não
                escreve aqui direto. Ver [[05 Roadmap]] → item S/nome sugere automação que
                não existe — mantido só pra não perder a única forma de editar. */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>SCORE FINANCEIRO (MANUAL)</div>
            <Card C={C} style={{marginBottom:16,borderColor:"#10b98133"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:editingFinScore?10:0}}>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>Informe o score da aba Yesod no módulo de Finanças</div>
                <button onClick={()=>{setFinScoreInput(finScore);setEditingFinScore(true);}}
                  style={{background:"#10b98122",border:"1px solid #10b98144",borderRadius:8,padding:"5px 12px",cursor:"pointer",color:"#10b981",fontSize:11,fontWeight:700,flexShrink:0,marginLeft:10}}>
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
                <div style={{fontSize:32,fontWeight:900,color:"#10b981",lineHeight:1}}>{finScore}%</div>
              )}
            </Card>

            {/* Sefirot map */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,margin:"16px 0 8px"}}>SEFIROT → ÁREAS</div>
            <Card C={C}>
              {SEFIROT.map(s=>{
                const ar=areas.find(a=>a.id===s.areaId);
                return (
                  <div key={s.id} onClick={()=>goToSefira(s.areaId)}
                    style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"9px 11px",
                      background:C.surface,borderRadius:10,cursor:"pointer",
                      border:"1px solid "+s.color+"22"}}>
                    <div style={{width:30,height:30,borderRadius:8,background:s.color+"18",
                      border:"1px solid "+s.color+"33",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name={s.icon} size={14} color={s.color}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:s.color}}>{s.meaning}</div>
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
      </div>

      {/* COACH — barra fixa permanente, sempre visível em qualquer módulo (zIndex acima
          do overlay de módulo, que é 100). bottom:64 sempre — cada módulo tem sua própria
          bottom nav com a mesma altura da bottom nav do hub (padding "6px 0 12px"), então
          usar o mesmo offset evita a barra do coach cobrir os ícones da nav do módulo. */}
      {/* Fundo opaco calculado (color-mix), não um hex fixo copiado de cada *Module.jsx: mistura
          o accent do módulo ativo com branco/preto conforme o tema — é a mesma conta que gerou o
          bg de cada módulo (~7% de accent sobre a base), sem duplicar o hex exato aqui e sem
          deixar o conteúdo real vazar por trás (transparência de verdade tentada antes brigava
          com o texto quando a página estava rolada até certos pontos). */}
      <div style={{position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,zIndex:150,boxSizing:"border-box",
        background:activeModule?"color-mix(in srgb, "+coachAccent+" 8%, "+(dark?"#07090f":"#ffffff")+")":C.navBg,
        borderTop:"1px solid "+(activeModule?coachAccent+"33":C.b1),
        display:"flex",alignItems:"center",gap:6,padding:"8px 16px"}}>
        <Icon name="lotus" size={15} color={coachAccent} style={{flexShrink:0}}/>
        <input value={coachInput} onChange={e=>setCoachInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendToCoach()}
          placeholder={coachLoading?"Pensando…":"Pergunte ao coach ou peça pra criar algo..."}
          disabled={coachLoading}
          style={{flex:1,minWidth:0,background:coachAccent+"14",border:"1.5px solid "+coachAccent+"55",borderRadius:99,
            padding:"8px 14px",color:C.text,fontSize:12,outline:"none"}}/>
        <button onClick={()=>sendToCoach()} disabled={coachLoading}
          style={{width:32,height:32,borderRadius:99,flexShrink:0,
            background:coachLoading?C.b2:coachAccent,border:"none",
            cursor:coachLoading?"default":"pointer",display:"flex",
            alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={14} color="#fff" style={{transform:"rotate(180deg)"}}/>
        </button>
      </div>
      {/* balão com a última resposta do coach — some sozinho quando o usuário manda a próxima,
          ou fecha no X. Antes do X existir, uma resposta sem pendingCoachAction (ex: erro de
          pagamento da API) ficava presa na tela até a próxima pergunta, que só trocava um erro
          pelo próximo — reportado como bug 22/08/2026. */}
      {coachMessages.length>0 && coachMessages[coachMessages.length-1].role==="assistant" && !coachBubbleClosed && (
        <div style={{position:"fixed",bottom:116,left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:430,zIndex:149,boxSizing:"border-box",padding:"0 16px"}}>
          <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,
            padding:"9px 12px",fontSize:11,lineHeight:1.5,color:C.text,maxHeight:160,overflowY:"auto",
            boxShadow:"0 -4px 14px #0006",position:"relative"}}>
            {!pendingCoachAction && (
              <button onClick={()=>setCoachBubbleClosed(true)} aria-label="Fechar"
                style={{position:"absolute",top:6,right:6,width:20,height:20,borderRadius:99,
                  background:C.b1,border:"none",cursor:"pointer",display:"flex",
                  alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12,lineHeight:1}}>
                ✕
              </button>
            )}
            <div style={{paddingRight:pendingCoachAction?0:22}}>{coachMessages[coachMessages.length-1].content}</div>
            {pendingCoachAction&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={confirmPendingCoachAction} style={{flex:1,padding:"7px",borderRadius:8,
                  background:"linear-gradient(135deg,"+coachAccent+"dd,"+coachAccent+"88)",border:"none",color:"#fff",
                  fontWeight:700,fontSize:11,cursor:"pointer"}}>Confirmar</button>
                <button onClick={cancelPendingCoachAction} style={{flex:1,padding:"7px",borderRadius:8,
                  background:C.b1,border:"none",color:C.muted,fontWeight:700,fontSize:11,cursor:"pointer"}}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAV — hidden when module is active */}
      {!activeModule&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:C.navBg,borderTop:"1px solid "+C.b1,
        display:"flex",padding:"6px 0 12px",zIndex:50}}>
        {TABS.map(t=>{
          const a=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
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
              {`áreas: ${areas.length} · diário: ${diary.length} entradas · finScore: ${finScore}%`}
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
            opts={SEFIROT.map(s=>({v:s.id,l:s.meaning+" — "+s.name}))}/>
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
