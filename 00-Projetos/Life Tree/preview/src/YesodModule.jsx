import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useCoachDataSync } from "./shared/coachSync.js";
import { D_BANKS, D_ACCS, D_CARDS, D_BOXES, D_DEBTS, ICAT, D_INVS } from "./yesod/seedData.js";

const ACCENT = "#10b981";
const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
// LIGHT tingido de verde (ACCENT) igual ao Geburah tinge de vermelho — antes usava
// exatamente os mesmos tons azul/lavanda do tema do hub (App.jsx), então o módulo não
// tinha identidade visual própria em modo claro (só os ACCENT pontuais destacavam).
const LIGHT = { bg:"#f2faf6", surface:"#ffffff",  card:"#f7fdfa", b1:"#cceee0", b2:"#7dd3ae",  text:"#04140c", muted:"#4a8570", dim:"#0f3d29",  nav:"#f2faf6" };

const uid  = () => Math.random().toString(36).slice(2,8);
const fmt  = n  => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const tod  = () => new Date().toISOString().slice(0,10);
const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const addM = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0,10); };
const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };
const freqAdd = (ds, freq) => freq === "weekly" ? addDays(ds, 7) : freq === "yearly" ? addM(ds, 12) : addM(ds, 1);
const FREQ_LABELS = { weekly: "Semanal", monthly: "Mensal", yearly: "Anual" };
const nextMonthlyDue = (dueDay, today) => {
  const now = new Date(today + "T12:00:00");
  let y = now.getFullYear(), m = now.getMonth();
  let d = new Date(y, m, dueDay);
  if (d < now) { m++; if (m > 11) { m = 0; y++; } d = new Date(y, m, dueDay); }
  return d.toISOString().slice(0,10);
};
const mLbl = ds => { const p = ds.slice(0,7).split("-"); return MTHS[parseInt(p[1])-1] + "/" + p[0].slice(2); };
const stmtDue = (pd, closeDay, dueDay) => {
  const d = new Date(pd + "T12:00:00");
  let m = d.getMonth(), y = d.getFullYear();
  // Se passou do fechamento, vai para o próximo mês
  if (d.getDate() > closeDay) { m++; if (m > 11) { m = 0; y++; } }
  // Se fechamento >= vencimento, vencimento é no mês seguinte ao fechamento
  let dm = m, dy = y;
  if (closeDay >= dueDay) { dm++; if (dm > 11) { dm = 0; dy++; } }
  return new Date(dy, dm, dueDay).toISOString().slice(0,10);
};
const accBal = acc => (acc.txs||[]).reduce((s,t) => t.type === "in" ? s + t.amount : s - t.amount, 0);
const getStmts = card => { const map = {}; (card.txs||[]).forEach(tx => { const n = tx.type === "in" ? 1 : (tx.installments||1); const sign = tx.type === "in" ? -1 : 1; for (let i = 0; i < n; i++) { const pd = i === 0 ? tx.date : addM(tx.date, i); const due = stmtDue(pd, card.closeDay, card.dueDay); if (!map[due]) map[due] = []; map[due].push({ ...tx, parcel: n > 1 ? (i+1)+"/"+n : null, amt: (tx.amount/n)*sign }); } }); return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([due,items]) => ({ due, items, total: items.reduce((s,x) => s+x.amt, 0) })); };

const IC = {
  plus:"M12 5v14M5 12h14", x:"M18 6 6 18M6 6l12 12", back:"M19 12H5m7 7-7-7 7-7", check:"M20 6 9 17l-5-5",
  bank:"M3 22h18M6 18V9M10 18V9M14 18V9M18 18V9M12 2L2 7h20L12 2", card:"M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 11h20",
  piggy:"M4 12h1m-1 4h13a3 3 0 0 0 0-6H8a2 2 0 0 0-2 2v4m14-4V8a2 2 0 0 0-2-2H8", wallet:"M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M21 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z",
  up:"M12 19V5m-7 7 7-7 7 7", down:"M12 5v14m7-7-7 7-7-7", refresh:"M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9M21 3v5h-5M3 21v-5h5",
  sun:"M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8z", chev:"M9 18l6-6-6-6",
  gear:"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  debt:"M2 17h20M6 17V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M10 12h4M12 9v6", scale:"M12 3v18M3 9h18M8 3l4 6 4-6M8 21l4-6 4 6M3 15a6 6 0 0 0 6-6M15 15a6 6 0 0 0 6-6",
  alvo:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  activity:"M22 12h-4l-3 9L9 3l-3 9H2", barchart:"M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  target:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
};

function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if (!d) return null;
  const parts = Array.isArray(d) ? d : d.split(/(?=M)/).filter(Boolean);
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>{parts.map((p,i) => { if (p.startsWith("circle")) { const m = p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/); if (m) return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>; } return <path key={i} d={p}/>; })}</svg>);
}

// Conta virtual — não é um banco de verdade, é onde lançamentos method:"dinheiro" (form
// manual e coach, ver yesodActions.js) são guardados, pra que dinheiro entre no saldo,
// fluxo de caixa e orçamento como qualquer outro método. id fixo, replicado no coach.
const CASH_ACC_ID = "cash-wallet";
const accLabel = (a, banks) => a.isCash ? "Carteira" : (banks.find(b=>b.id===a.bankId)?.name||"")+" - "+a.name;

const D_CATS_OUT = ["Alimentação","Moradia","Transporte","Saude","Educação","Lazer","Vestuário","Serviços","Tecnologia","Assinaturas","Outros"];
const D_CATS_IN  = ["Salario","Freelance","Aluguel recebido","Reembolso","Outros"];
const PAY_METHODS = [{v:"credito",l:"Credito"},{v:"debito",l:"Debito"},{v:"pix",l:"PIX"},{v:"ted",l:"TED"},{v:"dinheiro",l:"Dinheiro"}];
const TABS = [{id:"yesod",icon:"treelife",label:"Yesod"},{id:"orc",icon:"alvo",label:"Orçamento"},{id:"bolsos",icon:"bank",label:"Bolsos"},{id:"goals",icon:"target",label:"Objetivos"},{id:"cfg",icon:"gear",label:"Config"}];
// A aba Yesod tinha um controle segmentado Visão Geral/IF (Yesod/Fluxo/IF originalmente,
// 01/08/2026) — a seção IF saiu em 25/08/2026 pra virar a aba própria "Objetivos" (junto
// com as Metas financeiras, que moraram na Visão Geral até então), sobrando só Visão
// Geral. Sem outra seção pra alternar, o controle de pills foi removido.
// Fluxo saiu daqui em 25/08/2026 — virou pill dentro de Orçamento (ORC_SECTIONS). Extrato
// existiu como 3º pill por 2 dias e foi removido — a lista de lançamentos com filtro
// (tipo/categoria/período) voltou a viver dentro do próprio Fluxo, ver FluxoCaixaView.
const ORC_SECTIONS = [{id:"fluxo",l:"Fluxo"},{id:"orc",l:"Orçamento"}];
// Horizontes da Projeção de Fluxo de Caixa (view "projecao" dentro de Fluxo) — dias<=90
// usam granularidade diária no gráfico, acima disso vira mensal (ver buildProjSeries).
const PROJ_HORIZONS = [
  {id:"30d",l:"30 dias",days:30},{id:"60d",l:"60 dias",days:60},{id:"90d",l:"90 dias",days:90},
  {id:"6m",l:"6 meses",days:182},{id:"1a",l:"1 ano",days:365},{id:"3a",l:"3 anos",days:1095},
];
const COLOR_PALETTE = ["#8b5cf6","#6366f1","#3b82f6","#06b6d4","#10b981","#84cc16","#f59e0b","#f97316","#ef4444","#ec4899","#64748b","#0f172a"];

function Sheet({ title, onClose, C, children }) {
  // Portal pro <body>: o wrapper do módulo ativo (App.jsx) e o coach bar/bolha de resposta
  // disputam z-index no nível raiz do app, e o Sheet fica preso no stacking context do
  // módulo (ver App.jsx "MÓDULO ATIVO" pra explicação completa). Escapando via portal, o
  // Sheet compara seu zIndex:300 direto contra o resto do app, sempre por cima, sem forçar
  // o módulo inteiro a ficar acima do coach bar (o que cobriria a bolha de resposta).
  return createPortal(
    (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}><div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,padding:"0 18px 34px",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}><div style={{width:32,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:15,fontWeight:700,color:C.text}}>{title}</span><button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={13} color={C.dim}/></button></div></div>{children}</div></div>),
    document.body
  );
}
function FI({ label, value, onChange, type="text", placeholder, min, C }) {
  const isNum = type==="number";
  // Inputs decimais precisam de estado de texto próprio: um <input type="number"> nativo
  // reporta e.target.value==="" no estado intermediário "245." (ponto sem dígito seguinte),
  // o que zerava o campo controlado a cada "." digitado. Texto local + type="text" evita isso;
  // onChange continua sempre recebendo um Number, então nenhum call site precisa mudar.
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => { if (!focused) setText(String(value ?? "")); }, [value, focused]);
  return (<div style={{marginBottom:11}}>{label?<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>:null}<input type={isNum?"text":type} inputMode={isNum?"decimal":undefined} value={isNum?text:value} placeholder={placeholder} min={min}
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
    style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>);
}
function FS({ label, value, onChange, opts, C }) {
  return (<div style={{marginBottom:11}}>{label?<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>:null}<select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>);
}
function Btn({ children, onClick, color, sm, outline, full=true, style: s={} }) {
  const c = color||ACCENT;
  return (<button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"7px 13px":"11px 18px",borderRadius:10,cursor:"pointer",background:outline?"transparent":"linear-gradient(135deg,"+c+"dd,"+c+"88)",border:outline?"1.5px solid "+c:"none",color:outline?c:"#fff",fontWeight:700,fontSize:sm?11:13,width:full?"100%":"auto",...s}}>{children}</button>);
}
// Gráfico de linha da Projeção de Fluxo de Caixa — sem lib de charts, SVG cru igual ao
// resto do módulo. "base" é a trajetória sem ajuste de cenário; "scenario" (opcional) é
// a trajetória com os ajustes do usuário somados — desenhada por cima, tracejada, só
// quando difere de base (senão é redundante mostrar duas linhas iguais).
function ProjChart({ base, scenario, C, height=140 }) {
  const W=300, H=height, padB=18;
  const hasScenario = scenario && scenario.some((p,i)=>Math.abs(p.balance-base[i].balance)>0.5);
  const all = hasScenario ? [...base,...scenario] : base;
  const minB = Math.min(0,...all.map(p=>p.balance));
  const maxB = Math.max(...all.map(p=>p.balance),1);
  const xN = base.length-1||1;
  const xOf = i => (i/xN)*W;
  const yOf = v => (H-padB)-((v-minB)/((maxB-minB)||1))*(H-padB-8);
  const pathOf = pts => pts.map((p,i)=>(i===0?"M":"L")+xOf(i).toFixed(1)+","+yOf(p.balance).toFixed(1)).join(" ");
  const zeroY = yOf(0);
  const lineColor = hasScenario ? C.dim : ACCENT;
  return (
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height,display:"block",overflow:"visible"}} preserveAspectRatio="none">
      {minB<0 && <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,3" opacity={0.5}/>}
      <path d={pathOf(base)+" L"+xOf(xN)+","+(H-padB)+" L0,"+(H-padB)+" Z"} fill={lineColor} opacity={0.12} stroke="none"/>
      <path d={pathOf(base)} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {hasScenario && <path d={pathOf(scenario)} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="5,4" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}
function ColorPicker({ value, onChange, C }) {
  const [open, setOpen] = useState(false);
  return (<div style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>COR</div><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>setOpen(o=>!o)} style={{width:36,height:36,borderRadius:10,background:value||ACCENT,border:"none",cursor:"pointer",flexShrink:0}}/><span style={{fontSize:11,color:C.muted}}>{open?"Escolha uma cor":"Toque para mudar"}</span></div>{open&&(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,padding:"10px",background:C.b1,borderRadius:12}}>{COLOR_PALETTE.map(c=>(<button key={c} onClick={()=>{onChange(c);setOpen(false);}} style={{width:32,height:32,borderRadius:8,background:c,border:"none",cursor:"pointer",boxShadow:value===c?"0 0 0 2px #fff, 0 0 0 4px "+c:"none"}}/>))}</div>)}</div>);
}
// Totalizador compacto por seção de Bolsos — versão discreta do card grande de "TOTAL EM
// DÍVIDAS" de antes (25/08/2026: usuário achou que tinha destaque demais); uma linha só,
// cor por categoria em vez do gradiente+borda grossa de antes.
function MiniTotal({ label, value, color, C }) {
  return (<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+color+"33",borderLeft:"3px solid "+color,borderRadius:10,padding:"8px 12px",marginBottom:10}}>
    <span style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:.6}}>{label}</span>
    <span style={{fontSize:14,fontWeight:900,color}}>{value}</span>
  </div>);
}

export default function YesodModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [tab, setTab] = useState("yesod");
  const [page, setPage] = useState(null);
  const [banks, setBanks] = useState(D_BANKS);
  const [accs, setAccs] = useState(D_ACCS);
  const [cards, setCards] = useState(D_CARDS);
  const [boxes, setBoxes] = useState(D_BOXES);
  // Snapshot mensal de saldo por Caixinha (25/08/2026) — mesmo padrão de patrimSnaps
  // (ver useEffect mais abaixo): mês corrente atualizado ao vivo, meses passados uma vez
  // gravados nunca são reescritos. Diferente de patrimSnaps, não é retroativo — só existe
  // história a partir de quando essa mudança entrou no ar.
  const [boxSnaps, setBoxSnaps] = useState([]);
  const [debts, setDebts] = useState(D_DEBTS);
  const [budgets, setBudgets] = useState([{id:"bg1",cat:"Alimentação",limit:800},{id:"bg2",cat:"Moradia",limit:3000},{id:"bg3",cat:"Transporte",limit:400},{id:"bg4",cat:"Lazer",limit:300},{id:"bg5",cat:"Saude",limit:500}]);
  const overMonth = 0; // Taxa de Poupança sempre olha o mês atual (histórico de 6 meses); sem controle próprio desde 25/08/2026.
  const [fluxoView, setFluxoView] = useState(0);
  const [orcSection, setOrcSection] = useState("fluxo"); // fluxo | orc — ver ORC_SECTIONS
  const [ifGoal, setIfGoal] = useState(300000);
  const [ifMonthly, setIfMonthly] = useState(5000);
  const touchXRef = useRef(0);
  const [patrimSnaps, setPatrimSnaps] = useState([]);
  const [invs, setInvs] = useState(D_INVS);
  const [toast, setToast] = useState(null);
  const [sh, setSh] = useState(null);
  const [f, setF] = useState({});
  const [yHabits, setYHabits] = useState([{id:"yh1",title:"Registrar todos os lançamentos",freq:"Diário",done:false,xp:15},{id:"yh2",title:"Revisar saldo das contas",freq:"Semanal",done:false,xp:20},{id:"yh3",title:"Verificar faturas abertas",freq:"Semanal",done:false,xp:20},{id:"yh4",title:"Checar progresso do orçamento",freq:"Mensal",done:false,xp:30},{id:"yh5",title:"Atualizar saldo dos investimentos",freq:"Mensal",done:false,xp:25}]);
  const [yGoals, setYGoals] = useState([{id:"yg1",title:"Reserva de emergência (3 meses)",done:false,xp:200},{id:"yg2",title:"Orçamento respeitado 3 meses seguidos",done:false,xp:150},{id:"yg3",title:"Taxa de poupança acima de 20%",done:false,xp:100},{id:"yg4",title:"Quitar todas as dívidas",done:false,xp:300},{id:"yg5",title:"Atingir 25% da meta IF",done:false,xp:250},{id:"yg6",title:"Atingir 50% da meta IF",done:false,xp:400},{id:"yg7",title:"Liberdade Financeira 100%",done:false,xp:1000}]);
  const [finXp, setFinXp] = useState(0);
  const [yesodCards, setYesodCards] = useState(["poupanca","if","dividas","orcamento","habitos","metas"]);
  const [catsOut, setCatsOut] = useState(D_CATS_OUT);
  const [catsIn, setCatsIn] = useState(D_CATS_IN);
  const [recurrings, setRecurrings] = useState([]);
  // Gráfico realizado+esperado do Fluxo de Caixa (substituiu HISTÓRICO 6 MESES, 23/08/2026).
  // recurringOverrides: ajuste pontual de UMA ocorrência futura de uma recorrência ("<ym>|<recurringId>" -> valor),
  // não muda o valor padrão da recorrência. plannedItems: categoria esperada futura sem recorrência por trás.
  const [recurringOverrides, setRecurringOverrides] = useState({});
  const [plannedItems, setPlannedItems] = useState([]);
  const [selChartYm, setSelChartYm] = useState(null); // null = mês atual, calculado on-the-fly
  const [txSearch, setTxSearch] = useState("");
  // Filtro tipo/categoria da lista de lançamentos do Fluxo (era a aba "Extrato Geral"
  // separada, 23-25/08/2026, voltou a viver dentro do próprio Fluxo — sem busca nem seletor
  // de período próprios, 25/08/2026: o mês já vem 100% do gráfico).
  const [extType, setExtType] = useState("todos");
  const [extCat, setExtCat] = useState("");
  const [projHorizonId, setProjHorizonId] = useState("90d");
  // Ajustes de cenário da Projeção — camada só de exibição, nunca escreve em nenhuma
  // entidade real (contas/dívidas/etc). Persistido à parte pra sobreviver a reload sem
  // se misturar com dados reais. Lista de eventos (não mais um único delta) — cada um com
  // deltaIn/deltaOut em R$/mês e fromM = a partir de qual mês, pra simular múltiplos "e se"
  // ao mesmo tempo (ex: "aumento em março" E "viagem em julho" na mesma projeção).
  const [projEvents, setProjEvents] = useState([]);
  // Pessoas com quem despesas recorrentes são divididas (ex: cônjuge) — split fica dentro
  // da própria transação (accs[].txs[].split), não aqui; esta lista só guarda quem existe.
  const [splitPeople, setSplitPeople] = useState([]);
  const F = v => setF(x => ({...x,...v}));
  const toast_ = (msg, color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const [storageLoaded, setStorageLoaded] = useState(false);
  const loadFromStorage = () => {
    try {
        const PREFIX = "lifetree_";
        const load = (k) => { try { const v = localStorage.getItem(PREFIX+k); return v ? JSON.parse(v) : null; } catch(_) { return null; } };
        const r_banks=load("fin_banks"); if(r_banks) setBanks(r_banks);
        const r_accs=load("fin_accs"); if(r_accs) setAccs(r_accs);
        const r_cards=load("fin_cards"); if(r_cards) setCards(r_cards);
        const r_boxes=load("fin_boxes"); if(r_boxes) setBoxes(r_boxes);
        const r_debts=load("fin_debts"); if(r_debts) setDebts(r_debts);
        const r_invs=load("fin_invs"); if(r_invs) setInvs(r_invs);
        const r_budgets=load("fin_budgets"); if(r_budgets) setBudgets(r_budgets);
        const r_yhabits=load("fin_yhabits"); if(r_yhabits) setYHabits(r_yhabits);
        const r_ygoals=load("fin_ygoals"); if(r_ygoals) setYGoals(r_ygoals);
        const r_ifgoal=load("fin_ifgoal"); if(r_ifgoal!=null) setIfGoal(r_ifgoal);
        const r_ifmonthly=load("fin_ifmonthly"); if(r_ifmonthly!=null) setIfMonthly(r_ifmonthly);
        const r_finxp=load("fin_finxp"); if(r_finxp!=null) setFinXp(r_finxp);
        const r_patrimsnaps=load("fin_patrimsnaps"); if(r_patrimsnaps) setPatrimSnaps(r_patrimsnaps);
        const r_boxsnaps=load("fin_boxsnaps"); if(r_boxsnaps) setBoxSnaps(r_boxsnaps);
        const r_catsout=load("fin_catsout"); if(r_catsout) setCatsOut(r_catsout);
        const r_catsin=load("fin_catsin"); if(r_catsin) setCatsIn(r_catsin);
        const r_recurrings=load("fin_recurrings"); if(r_recurrings) setRecurrings(r_recurrings);
        const r_recoverrides=load("fin_recoverrides"); if(r_recoverrides) setRecurringOverrides(r_recoverrides);
        const r_plannedItems=load("fin_plannedItems"); if(r_plannedItems) setPlannedItems(r_plannedItems);
        const r_yesodcards=load("fin_yesodcards"); if(r_yesodcards) setYesodCards(r_yesodcards);
        const r_projevents=load("fin_projevents");
        if(r_projevents) setProjEvents(r_projevents);
        else { const r_projscn_old=load("fin_projscenario"); if(r_projscn_old&&((Number(r_projscn_old.deltaIn)||0)!==0||(Number(r_projscn_old.deltaOut)||0)!==0)) setProjEvents([{id:"pe"+uid(),label:"",deltaIn:r_projscn_old.deltaIn||0,deltaOut:r_projscn_old.deltaOut||0,fromM:r_projscn_old.fromM||0}]); }
        const r_splitpeople=load("fin_splitpeople"); if(r_splitpeople) setSplitPeople(r_splitpeople);
    } finally { setStorageLoaded(true); }
  };
  useEffect(() => { loadFromStorage(); }, []);
  // o Coach global (App.jsx) executa ações financeiras direto no localStorage — ver
  // yesodActions.js — porque o estado do Yesod vive só aqui, não em App.jsx. Se este
  // módulo estiver montado quando uma ação roda, precisa recarregar do localStorage
  // pra não ficar com a UI desatualizada em relação ao que o coach acabou de mudar.
  useCoachDataSync("yesod", loadFromStorage);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_banks",JSON.stringify(banks));}catch(_){} }, [banks,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_accs",JSON.stringify(accs));}catch(_){} }, [accs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_cards",JSON.stringify(cards));}catch(_){} }, [cards,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_boxes",JSON.stringify(boxes));}catch(_){} }, [boxes,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_debts",JSON.stringify(debts));}catch(_){} }, [debts,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_invs",JSON.stringify(invs));}catch(_){} }, [invs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_budgets",JSON.stringify(budgets));}catch(_){} }, [budgets,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_yhabits",JSON.stringify(yHabits));}catch(_){} }, [yHabits,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ygoals",JSON.stringify(yGoals));}catch(_){} }, [yGoals,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_catsout",JSON.stringify(catsOut));}catch(_){} }, [catsOut,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_catsin",JSON.stringify(catsIn));}catch(_){} }, [catsIn,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_recurrings",JSON.stringify(recurrings));}catch(_){} }, [recurrings,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_recoverrides",JSON.stringify(recurringOverrides));}catch(_){} }, [recurringOverrides,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_plannedItems",JSON.stringify(plannedItems));}catch(_){} }, [plannedItems,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_yesodcards",JSON.stringify(yesodCards));}catch(_){} }, [yesodCards,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ifgoal",JSON.stringify(ifGoal));}catch(_){} }, [ifGoal,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ifmonthly",JSON.stringify(ifMonthly));}catch(_){} }, [ifMonthly,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_finxp",JSON.stringify(finXp));}catch(_){} }, [finXp,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_patrimsnaps",JSON.stringify(patrimSnaps));}catch(_){} }, [patrimSnaps,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_boxsnaps",JSON.stringify(boxSnaps));}catch(_){} }, [boxSnaps,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_projevents",JSON.stringify(projEvents));}catch(_){} }, [projEvents,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_splitpeople",JSON.stringify(splitPeople));}catch(_){} }, [splitPeople,storageLoaded]);
  // Migração pra quem já tinha dados salvos antes da Carteira existir — sem isso,
  // usuários antigos ficariam sem destino pra lançamentos em dinheiro até um "novo" seed.
  useEffect(() => { if(!storageLoaded) return; setAccs(p => p.some(a=>a.id===CASH_ACC_ID) ? p : [...p,{id:CASH_ACC_ID,bankId:null,name:"Carteira",isCash:true,txs:[]}]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLoaded]);

  const bkOf = id => banks.find(b=>b.id===id);
  const nav = (type,id) => setPage({type,id});
  const back = () => setPage(null);
  const close = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };
  const today = tod();

  // ── RECORRÊNCIAS → gera lançamentos em atraso desde a última execução ────
  useEffect(() => {
    if (!storageLoaded) return;
    let generated = 0;
    const updated = recurrings.map(r => {
      if (!r.active) return r;
      let next = r.nextDate;
      const dates = [];
      let guard = 0;
      while (next <= today && guard < 60) { dates.push(next); next = freqAdd(next, r.freq); guard++; }
      if (!dates.length) return r;
      generated += dates.length;
      dates.forEach(date => {
        // Se o usuário ajustou o valor esperado desse mês no drilldown do Fluxo antes da
        // recorrência disparar (recurringOverrides), o lançamento gerado usa esse valor —
        // senão o ajuste seria só decoração no gráfico, sem refletir no que é registrado.
        const overrideKey = date.slice(0,7) + "|" + r.id;
        const amount = Object.prototype.hasOwnProperty.call(recurringOverrides,overrideKey) ? Number(recurringOverrides[overrideKey]) : r.amount;
        const base = { desc: r.desc, amount, type: r.type, date, cat: r.cat };
        if (r.method === "credito" && r.cardId) {
          setCards(p => p.map(c => c.id === r.cardId ? { ...c, txs: [...c.txs, { id: "ct"+uid(), ...base, installments: 1 }] } : c));
        } else if (r.accId) {
          // r.split (config da recorrência) vira split.settled:false em CADA ocorrência gerada
          // — cada mês nasce como pendente de novo, mesmo que o mês anterior já tenha sido acertado.
          setAccs(p => p.map(a => a.id === r.accId ? { ...a, txs: [...a.txs, { id: "t"+uid(), ...base, method: r.method, recurring: r.freq, ...(r.split ? { split: { ...r.split, settled: false } } : {}) }] } : a));
        }
      });
      return { ...r, nextDate: next };
    });
    if (generated > 0) {
      setRecurrings(updated);
      toast_(generated===1 ? "1 lançamento recorrente gerado" : generated+" lançamentos recorrentes gerados", ACCENT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLoaded]);

  const totAcc = accs.reduce((s,a)=>s+accBal(a),0);
  const totBox = boxes.reduce((s,b)=>s+b.balance,0);
  const totInv = invs.reduce((s,i)=>s+i.balance,0);
  // Fatura de cartão em aberto é passivo igual dívida/financiamento — ficava calculada
  // (totCardDebt) e nunca descontada do patrimônio líquido (bug real encontrado na
  // auditoria de 25/08/2026: net inflava o patrimônio pelo valor total usado nos cartões).
  const totCardDebt = cards.reduce((s,c)=>s+getStmts(c).reduce((ss,st)=>ss+st.total,0),0);
  const totDebtRem = debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
  const net = totAcc+totBox+totInv-totDebtRem-totCardDebt;

  const getMonthStr = offset => { const d=new Date(); d.setMonth(d.getMonth()+offset); return d.toISOString().slice(0,7); };
  const monthLabel2 = ym => { const [y,m]=ym.split("-"); return MTHS[parseInt(m)-1]+"/"+y.slice(2); };
  const allTxs = () => { const txs=[]; accs.forEach(a=>(a.txs||[]).forEach(t=>txs.push({...t,source:"conta",sourceName:accLabel(a,banks)}))); cards.forEach(c=>(c.txs||[]).forEach(t=>txs.push({...t,type:t.type||"out",source:"cartao",sourceName:c.name}))); return txs; };
  const cashflowMonth = offset => { const ym=getMonthStr(offset); const txs=allTxs().filter(t=>t.date&&t.date.startsWith(ym)); const ins=txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0); const outs=txs.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0); return {ym,ins,outs,balance:ins-outs,txs}; };

  // ── GRÁFICO REALIZADO+ESPERADO (Fluxo de Caixa) ───────────────────────────────
  // ym > mês atual = futuro (projetado a partir de recorrências + plannedItems, editável);
  // ym <= mês atual = realizado (somatório de lançamentos de verdade, só leitura).
  const isFutureYm = ym => ym > getMonthStr(0);
  const monthRange = ym => { const [y,m]=ym.split("-").map(Number); return [ym+"-01", new Date(y,m,0).toISOString().slice(0,10)]; };
  const recurringAmountFor = (r,ym) => { const key=ym+"|"+r.id; return Object.prototype.hasOwnProperty.call(recurringOverrides,key) ? Number(recurringOverrides[key]) : r.amount; };
  // Retorna { [categoria]: {amount, fromRecurring, recDesc, recId} } pra um mês futuro —
  // cada categoria some as ocorrências de recorrências ativas daquele tipo nesse mês (via
  // stepping de freqAdd, mesmo padrão de projUpcoming) + plannedItems daquele mês/tipo.
  const futureCategoryTotals = (ym,type) => {
    const [mStart,mEnd] = monthRange(ym);
    const totals = {};
    recurrings.filter(r=>r.active&&r.type===type).forEach(r=>{
      let d=r.nextDate, guard=0;
      while (d<=mEnd && guard<60) {
        if (d>=mStart) {
          if (!totals[r.cat]) totals[r.cat]={amount:0,fromRecurring:true,recDesc:r.desc,recId:r.id};
          totals[r.cat].amount += recurringAmountFor(r,ym);
        }
        d=freqAdd(d,r.freq); guard++;
      }
    });
    plannedItems.filter(p=>p.ym===ym&&p.type===type).forEach(p=>{
      if (!totals[p.cat]) totals[p.cat]={amount:0,fromRecurring:false,plannedId:p.id};
      totals[p.cat].amount += Number(p.amount)||0;
    });
    return totals;
  };
  const monthTotals = ym => {
    if (!isFutureYm(ym)) {
      const txs = allTxs().filter(t=>t.date&&t.date.startsWith(ym));
      return { ins: txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0), outs: txs.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0) };
    }
    const sumOf = totals => Object.values(totals).reduce((s,v)=>s+v.amount,0);
    return { ins: sumOf(futureCategoryTotals(ym,"in")), outs: sumOf(futureCategoryTotals(ym,"out")) };
  };
  const budgetSpend = cat => { const ym=getMonthStr(0); return allTxs().filter(t=>t.type==="out"&&t.cat===cat&&t.date&&t.date.startsWith(ym)).reduce((s,t)=>s+t.amount,0); };
  const retroPatrimData = useMemo(() => {
    const months=[]; for(let i=-5;i<=0;i++){const d=new Date();d.setMonth(d.getMonth()+i);const ym=d.toISOString().slice(0,7);const endDate=ym+"-31";const accTotal=accs.reduce((s,a)=>s+(a.txs||[]).filter(t=>t.date<=endDate).reduce((ss,t)=>t.type==="in"?ss+t.amount:ss-t.amount,0),0);const debtTotal=debts.reduce((s,d2)=>{const paid=Math.min(d2.totalParcelas,Math.round((new Date(endDate)-new Date(d2.startDate+"T00:00:00"))/(1000*60*60*24*30)));return s+Math.max(0,d2.totalParcelas-paid)*d2.valorParcela;},0);months.push({ym,net:accTotal+totBox+totInv-debtTotal});}const snaps=[...patrimSnaps];months.forEach(m=>{if(!snaps.some(s=>s.ym===m.ym))snaps.push(m);});return snaps.sort((a,b)=>a.ym.localeCompare(b.ym));
  }, [accs, debts, totBox, totInv, patrimSnaps]);
  const retroPatrim = () => retroPatrimData;
  // Snapshot mensal real do patrimônio líquido — sem isso, patrimSnaps existia como chave
  // persistida mas nunca era escrita, então a Evolução Patrimonial ficava travada nos
  // últimos 6 meses reconstruídos on-the-fly (retroPatrimData), sem história de verdade.
  // Atualiza (não duplica) a entrada do mês corrente a cada mudança de "net"; meses
  // passados, uma vez gravados, nunca são reescritos — viram história permanente.
  useEffect(() => {
    if (!storageLoaded) return;
    const ym = getMonthStr(0);
    setPatrimSnaps(prev => {
      const idx = prev.findIndex(s => s.ym === ym);
      if (idx === -1) return [...prev, { ym, net }];
      if (prev[idx].net === net) return prev;
      const next = [...prev]; next[idx] = { ym, net }; return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, storageLoaded]);

  // Snapshot mensal de saldo por Caixinha — mesmo padrão acima (patrimSnaps), uma entrada
  // {ym,boxId,balance} por caixinha por mês, mês corrente atualizado ao vivo.
  useEffect(() => {
    if (!storageLoaded) return;
    const ym = getMonthStr(0);
    setBoxSnaps(prev => {
      let changed = false;
      let next = prev;
      boxes.forEach(b => {
        const idx = next.findIndex(s => s.ym === ym && s.boxId === b.id);
        if (idx === -1) { if(!changed){next=[...next];changed=true;} next.push({ ym, boxId: b.id, balance: b.balance }); }
        else if (next[idx].balance !== b.balance) { if(!changed){next=[...next];changed=true;} next[idx] = { ym, boxId: b.id, balance: b.balance }; }
      });
      return changed ? next : prev;
    });
  }, [boxes, storageLoaded]);

  // ── PROJEÇÃO DE FLUXO DE CAIXA ────────────────────────────────────────────
  // Modelo: média de (entradas−saídas) dos últimos 3 meses (contas+cartões, já reflete
  // recorrências ativas e gasto de cartão — não precisam ser somados de novo) menos as
  // parcelas de dívidas ainda em aberto (dívidas não geram lançamento nenhum hoje, então
  // são o único efeito futuro conhecido que a média histórica NÃO captura) mais o ajuste
  // de cenário do usuário, quando ativo. mi = índice do mês projetado (0 = próximo mês).
  // avgAccountNet3: só transações de CONTA (não cartão) — é a parte "orgânica" do fluxo de
  // caixa que não tem como saber com precisão no futuro, então continua sendo média. Cartão
  // saiu daqui de propósito pra não ser contado duas vezes (ver cardBurdenAtMonth abaixo).
  const avgAccountNet3 = () => {
    const ms=[-3,-2,-1].map(o=>{
      const ym=getMonthStr(o);const txs=[];accs.forEach(a=>(a.txs||[]).forEach(t=>{if(t.date&&t.date.startsWith(ym))txs.push(t);}));
      return txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0)-txs.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
    });
    return ms.reduce((s,v)=>s+v,0)/ms.length;
  };
  const debtBurdenAtMonth = mi => debts.reduce((s,d)=>{const rem=d.totalParcelas-d.parcelasPagas;return mi<rem?s+d.valorParcela:s;},0);
  // cardBurdenAtMonth: soma exata das faturas com vencimento no mês projetado mi (0=próximo
  // mês), parcela a parcela via getStmts (que já sabe a data de vencimento de cada parcela
  // pendente) — não mais média histórica. Resolve a limitação "cartões entram só via média".
  const cardBurdenAtMonth = mi => {
    const targetYm = getMonthStr(mi+1);
    let total=0;
    cards.forEach(c=>{ getStmts(c).forEach(st=>{ if (st.due>=today && st.due.startsWith(targetYm)) total+=st.total; }); });
    return total;
  };
  // eventsDeltaAtMonth: soma de TODOS os eventos de cenário ativos nesse mês — antes só
  // existia um delta único; agora suporta múltiplos eventos simultâneos (ex: "aumento em
  // março" + "viagem em julho" na mesma projeção), cada um com seu próprio fromM.
  const eventsDeltaAtMonth = (mi, events) => (events||[]).reduce((s,ev)=>mi>=(ev.fromM||0)?s+((Number(ev.deltaIn)||0)-(Number(ev.deltaOut)||0)):s,0);
  const projMonthlyNet = (mi, events) => avgAccountNet3() - cardBurdenAtMonth(mi) - debtBurdenAtMonth(mi) + eventsDeltaAtMonth(mi, events);
  const buildProjSeries = (horizonDays, events) => {
    const points=[{x:0,date:today,balance:totAcc}];
    if (horizonDays<=90) {
      let bal=totAcc;
      for (let d=1; d<=horizonDays; d++) { const mi=Math.floor((d-1)/30.44); bal+=projMonthlyNet(mi,events)/30.44; points.push({x:d,date:addDays(today,d),balance:bal}); }
    } else {
      const months=Math.round(horizonDays/30.44);
      let bal=totAcc;
      for (let m=1; m<=months; m++) { bal+=projMonthlyNet(m-1,events); points.push({x:m,date:addM(today,m),balance:bal}); }
    }
    return points;
  };
  const projMilestones = horizonDays => {
    const months=Math.ceil(horizonDays/30.44); const out=[];
    debts.forEach(d=>{ const rem=d.totalParcelas-d.parcelasPagas; if (rem>0 && rem<=months) out.push({date:addM(today,rem),label:d.name+" quitada",detail:"libera "+fmt(d.valorParcela)+"/mês",color:ACCENT}); });
    return out.sort((a,b)=>a.date.localeCompare(b.date));
  };
  const projUpcoming = horizonDays => {
    const endDate=addDays(today,horizonDays); const out=[];
    recurrings.filter(r=>r.active).forEach(r=>{ let d=r.nextDate,guard=0; while(d<=endDate&&guard<40){ out.push({date:d,desc:r.desc,amount:r.amount,type:r.type}); d=freqAdd(d,r.freq); guard++; } });
    debts.forEach(d=>{ if(d.parcelasPagas>=d.totalParcelas) return; const due=nextMonthlyDue(d.dueDay,today); if(due<=endDate) out.push({date:due,desc:d.name+" · parcela",amount:d.valorParcela,type:"out"}); });
    return out.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,14);
  };

  // ── SCORE BRIDGE → publica score do Yesod para a Árvore ──────────────────
  useEffect(() => {
    if (!storageLoaded) return;
    const score = calcYesodScore();
    if (typeof window.publishScore === "function") {
      window.publishScore("yesod", score);
    } else {
      // fallback direto no localStorage
      try {
        const raw = localStorage.getItem("lifetree_scores");
        const scores = raw ? JSON.parse(raw) : {};
        scores["yesod"] = { score, updatedAt: new Date().toISOString() };
        localStorage.setItem("lifetree_scores", JSON.stringify(scores));
      } catch(e) {}
    }
  }, [banks, accs, cards, boxes, debts, invs, budgets, yHabits, yGoals, storageLoaded]);
  const calcYesodScore = () => { const cf0=cashflowMonth(-1);const savRate=cf0.ins>0?Math.max(0,(cf0.ins-cf0.outs)/cf0.ins):0;const ifN=ifGoal||ifMonthly*300||1;const debtS=debts.length>0?debts.reduce((s,d)=>s+(d.parcelasPagas/d.totalParcelas),0)/debts.length:1;const budS=budgets.length>0?budgets.filter(b=>budgetSpend(b.cat)<=b.limit).length/budgets.length:0.5;const habS=yHabits.filter(h=>h.done).length/(yHabits.length||1);const goaS=yGoals.filter(g=>g.done).length/(yGoals.length||1);return Math.round((Math.min(1,savRate/0.2)*0.20+Math.min(1,net/ifN)*0.25+debtS*0.15+budS*0.15+habS*0.13+goaS*0.12)*100); };

  // ── ALERTAS DE VENCIMENTO — faturas e parcelas de dívida nos próximos 7 dias ──
  const upcomingAlerts = () => {
    const out = [];
    cards.forEach(cd => {
      const stmts = getStmts(cd);
      const next = stmts.find(s => s.due >= today);
      if (next) {
        const days = Math.round((new Date(next.due) - new Date(today)) / 864e5);
        if (days <= 7) out.push({ id: "card-"+cd.id, label: cd.name+" · fatura", amount: next.total, due: next.due, days, color: cd.color });
      }
    });
    debts.forEach(d => {
      if (d.parcelasPagas >= d.totalParcelas) return;
      const due = nextMonthlyDue(d.dueDay, today);
      const days = Math.round((new Date(due) - new Date(today)) / 864e5);
      if (days <= 7) out.push({ id: "debt-"+d.id, label: d.name+" · parcela", amount: d.valorParcela, due, days, color: d.color });
    });
    return out.sort((a,b) => a.days-b.days);
  };

  // CRUD actions
  const addBank=()=>{if(!f.name)return;setBanks(p=>[...p,{id:"b"+uid(),name:f.name,color:f.color||ACCENT}]);toast_("Banco adicionado");close();};
  const editBank=()=>{setBanks(p=>p.map(b=>b.id===f.id?{...b,name:f.name,color:f.color}:b));toast_("Banco atualizado");close();};
  const delBank=id=>{setBanks(p=>p.filter(b=>b.id!==id));toast_("Banco removido");};
  const addAcc=()=>{if(!f.name)return;setAccs(p=>[...p,{id:"a"+uid(),bankId:f.bankId,name:f.name,txs:[]}]);toast_("Conta adicionada");close();};
  const editAcc=()=>{setAccs(p=>p.map(a=>a.id===f.id?{...a,bankId:f.bankId,name:f.name}:a));toast_("Conta atualizada");close();};
  const delAcc=id=>{setAccs(p=>p.filter(a=>a.id!==id));toast_("Conta removida");};
  const addCard=()=>{if(!f.name)return;setCards(p=>[...p,{id:"c"+uid(),bankId:f.bankId,name:f.name,limit:Number(f.limit)||5000,closeDay:Number(f.closeDay)||10,dueDay:Number(f.dueDay)||25,color:f.color||ACCENT,txs:[]}]);toast_("Cartão adicionado");close();};
  const editCard=()=>{setCards(p=>p.map(c=>c.id===f.id?{...c,bankId:f.bankId,name:f.name,limit:Number(f.limit),closeDay:Number(f.closeDay),dueDay:Number(f.dueDay),color:f.color}:c));toast_("Cartão atualizado");close();};
  const delCard=id=>{setCards(p=>p.filter(c=>c.id!==id));toast_("Cartão removido");};
  const addBox=()=>{if(!f.name)return;setBoxes(p=>[...p,{id:"bx"+uid(),name:f.name,goal:Number(f.goal)||0,targetDate:f.targetDate||"",color:f.color||ACCENT,balance:0,rate:Number(f.rate)||0,rateUnit:f.rateUnit||"ano"}]);toast_("Caixinha criada");close();};
  const editBox=()=>{setBoxes(p=>p.map(b=>b.id===f.id?{...b,name:f.name,goal:Number(f.goal),targetDate:f.targetDate||"",color:f.color,rate:Number(f.rate)||0,rateUnit:f.rateUnit||"ano"}:b));toast_("Caixinha atualizada");close();};
  const delBox=id=>{setBoxes(p=>p.filter(b=>b.id!==id));toast_("Caixinha removida");};
  // Criar dívida credita o PRINCIPAL recebido numa conta (25/08/2026) — separado da soma
  // das parcelas, que já embute juros e não é o valor que efetivamente entrou na conta.
  const addDebt=()=>{
    if(!f.name)return;
    setDebts(p=>[...p,{id:"d"+uid(),name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas)||12,parcelasPagas:Number(f.parcelasPagas)||0,valorParcela:Number(f.valorParcela)||0,dueDay:Number(f.dueDay)||10,startDate:f.startDate||today,color:f.color||"#ef4444"}]);
    const valorRecebido=Number(f.valorRecebido)||0;
    if(valorRecebido>0&&f.accId){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Empréstimo: "+f.name,amount:valorRecebido,type:"in",date:f.startDate||today,cat:"Empréstimo",method:"ted"}]}:a));
    }
    toast_("Dívida adicionada","#f97316");close();
  };
  const editDebt=()=>{setDebts(p=>p.map(d=>d.id===f.id?{...d,name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas),parcelasPagas:Number(f.parcelasPagas),valorParcela:Number(f.valorParcela),dueDay:Number(f.dueDay),startDate:f.startDate,color:f.color}:d));toast_("Dívida atualizada");close();};
  // Registrar parcela paga agora exige conta (25/08/2026) — era a única ação de dívida que
  // mexia em parcelasPagas sem debitar dinheiro de lugar nenhum.
  const payDebt=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const qtd=Math.max(1,Number(f.qtd||1));
    const valor=qtd*d.valorParcela;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Parcela "+d.name,amount:valor,type:"out",date:today,cat:"Pagamento de dívida",method:"ted"}]}:a));
    setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:Math.min(x.totalParcelas,x.parcelasPagas+qtd)}:x));
    toast_("Pagamento registrado",ACCENT);close();
  };
  // Amortização (25/08/2026) — paga um valor extra (por R$ ou por nº de parcelas) além do
  // fluxo normal de parcelas, com escolha de reduzir prazo (mantém valor da parcela, quita
  // parcelas finais) ou reduzir parcela (mantém nº de parcelas, diminui o valor de cada
  // uma). Sempre debita de uma conta.
  const amortizarDivida=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const remaining=(d.totalParcelas-d.parcelasPagas)*d.valorParcela;
    if(remaining<=0)return;
    if(f.mode==="parcelas"){
      const qtd=Math.max(1,Math.min(d.totalParcelas-d.parcelasPagas,Number(f.qtd||1)));
      const amortValue=qtd*d.valorParcela;
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Amortização "+d.name,amount:amortValue,type:"out",date:today,cat:"Amortização de dívida",method:"ted"}]}:a));
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:x.parcelasPagas+qtd}:x));
      toast_("Amortização registrada",ACCENT);close();
      return;
    }
    const amortValue=Math.max(0,Math.min(Number(f.value)||0,remaining));
    if(amortValue<=0){toast_("Informe um valor válido","#ef4444");return;}
    const remainingAfter=remaining-amortValue;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Amortização "+d.name,amount:amortValue,type:"out",date:today,cat:"Amortização de dívida",method:"ted"}]}:a));
    if(f.effect==="parcela"){
      const remainingInstallments=d.totalParcelas-d.parcelasPagas;
      const newValorParcela=remainingAfter<=0?0:remainingAfter/remainingInstallments;
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,valorParcela:newValorParcela,...(remainingAfter<=0?{parcelasPagas:x.totalParcelas}:{})}:x));
    }else{
      const newTotalParcelas=remainingAfter<=0?d.parcelasPagas:d.parcelasPagas+Math.ceil(remainingAfter/d.valorParcela);
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,totalParcelas:newTotalParcelas}:x));
    }
    toast_("Amortização registrada",ACCENT);close();
  };
  // Quitação geral (25/08/2026) — paga o saldo devedor inteiro de uma vez, de uma conta.
  const quitarDivida=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const remaining=(d.totalParcelas-d.parcelasPagas)*d.valorParcela;
    if(remaining<=0)return;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Quitação "+d.name,amount:remaining,type:"out",date:today,cat:"Quitação de dívida",method:"ted"}]}:a));
    setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:x.totalParcelas}:x));
    toast_("Dívida quitada",ACCENT);close();
  };
  const delDebt=id=>{setDebts(p=>p.filter(d=>d.id!==id));toast_("Dívida removida");};
  const addInv=()=>{if(!f.name)return;setInvs(p=>[...p,{id:"i"+uid(),bankId:f.bankId,subCat:f.subCat,name:f.name,invested:Number(f.invested)||0,balance:Number(f.balance)||0,rate:f.rate||"",maturity:f.maturity||""}]);toast_("Investimento adicionado");close();};
  const editInv=()=>{setInvs(p=>p.map(i=>i.id===f.id?{...i,name:f.name,invested:Number(f.invested),balance:Number(f.balance),rate:f.rate,maturity:f.maturity}:i));toast_("Atualizado");close();};
  const delInv=id=>{setInvs(p=>p.filter(i=>i.id!==id));toast_("Removido");};
  const checkin=()=>{setInvs(p=>p.map(i=>i.id===f.invId?{...i,balance:Number(f.balance)}:i));toast_("Saldo atualizado");close();};
  // Aportar/Resgatar (25/08/2026) — antes só existia "Atualizar saldo" (checkin, acima),
  // que sobrescreve o valor sem nenhuma ligação com conta nem rastro de aporte/resgate.
  // Aportar/Resgatar movimentam uma conta de verdade, igual ao Depositar/Retirar de
  // Caixinha (boxMoveLinked) e ao modo Transferir do launch().
  const invAportar=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const amount=Number(f.amount);
    const inv=invs.find(i=>i.id===f.invId);
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Aporte em "+(inv?.name||""),amount,type:"out",date:f.date||today,cat:"Investimento",method:"ted"}]}:a));
    setInvs(p=>p.map(i=>i.id===f.invId?{...i,invested:i.invested+amount,balance:i.balance+amount}:i));
    toast_("Aporte registrado",ACCENT);close();
  };
  const invResgatar=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const inv=invs.find(i=>i.id===f.invId);if(!inv)return;
    const amount=Math.min(Number(f.amount),inv.balance);
    if(amount<=0)return;
    // Resgate reduz invested proporcionalmente ao que saiu do balance, pra manter o %
    // de rendimento coerente antes/depois de um resgate parcial (confirmado com o usuário).
    const proportion=inv.balance>0?amount/inv.balance:1;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Resgate de "+inv.name,amount,type:"in",date:f.date||today,cat:"Investimento",method:"ted"}]}:a));
    setInvs(p=>p.map(i=>i.id===f.invId?{...i,balance:i.balance-amount,invested:Math.max(0,i.invested-i.invested*proportion)}:i));
    toast_("Resgate registrado",ACCENT);close();
  };
  const addCatOut=()=>{const name=(f.name||"").trim();if(!name||catsOut.includes(name))return;setCatsOut(p=>[...p,name]);toast_("Categoria adicionada");close();};
  const addCatIn=()=>{const name=(f.name||"").trim();if(!name||catsIn.includes(name))return;setCatsIn(p=>[...p,name]);toast_("Categoria adicionada");close();};
  const delCatOut=name=>setCatsOut(p=>p.filter(c=>c!==name));
  const delCatIn=name=>setCatsIn(p=>p.filter(c=>c!==name));
  const toggleRecurring=id=>setRecurrings(p=>p.map(r=>r.id===id?{...r,active:!r.active}:r));
  const delRecurring=id=>{setRecurrings(p=>p.filter(r=>r.id!==id));toast_("Recorrência removida");};
  // FIX 3: validate amount > 0
  // Depósito/retirada de Caixinha SEMPRE ligado a uma conta (25/08/2026) — antes só
  // ajustava boxes[].balance isolado, dinheiro "aparecia"/"desaparecia" sem sair de lugar
  // nenhum. Mesma ideia já usada no modo Transferir do launch() (linha ~558): tx real na
  // conta + ajuste do outro lado.
  const boxMoveLinked=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const amount=Number(f.amount);
    const box=boxes.find(b=>b.id===f.boxId);
    const boxName=box?.name||"";
    if(f.moveType==="in"){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Depósito em "+boxName,amount,type:"out",date:f.date,cat:"Transferência",method:"ted"}]}:a));
      setBoxes(p=>p.map(b=>b.id===f.boxId?{...b,balance:b.balance+amount}:b));
    }else{
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Retirada de "+boxName,amount,type:"in",date:f.date,cat:"Transferência",method:"ted"}]}:a));
      setBoxes(p=>p.map(b=>b.id===f.boxId?{...b,balance:b.balance-amount}:b));
    }
    toast_("Movimentação registrada");close();
  };
  const delAccTx=(aId,tId)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.filter(t=>t.id!==tId)}:a));
  const editAccTx=(aId,tx)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.map(t=>t.id===tx.id?{...t,...tx}:t)}:a));
  const delCardTx=(cId,tId)=>setCards(p=>p.map(c=>c.id===cId?{...c,txs:c.txs.filter(t=>t.id!==tId)}:c));
  // Editar lançamento — pode trocar de conta (inclusive Carteira ↔ conta bancária), o que
  // exige mover a transação de array (não só patchar no lugar). f.origAccId é a conta de
  // onde a transação foi aberta pra edição; f.accId é a conta escolhida agora no form.
  const saveEditTx=()=>{
    if(!f.desc||!f.amount)return;
    const targetId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;
    if(!targetId){toast_("Selecione uma conta","#ef4444");return;}
    const payload={id:f.id,desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||"",...(f.splitOn&&f.splitPersonId?{split:{personId:f.splitPersonId,theirPercent:Number(f.splitPercent)||50,settled:!!f.splitSettled}}:{})};
    if(targetId===f.origAccId){
      editAccTx(f.origAccId,payload);
    }else{
      setAccs(p=>p.map(a=>{
        if(a.id===f.origAccId)return{...a,txs:a.txs.filter(t=>t.id!==f.id)};
        if(a.id===targetId)return{...a,txs:[...a.txs,payload]};
        return a;
      }));
    }
    toast_("Atualizado");close();
  };
  // ── DIVISÃO DE DESPESAS — pessoas + toggle de "já recebi/paguei minha parte" ─────
  const addSplitPerson=()=>{const name=(f.name||"").trim();if(!name)return;setSplitPeople(p=>[...p,{id:"sp"+uid(),name}]);toast_("Pessoa adicionada");close();};
  const delSplitPerson=id=>setSplitPeople(p=>p.filter(x=>x.id!==id));
  const toggleSplitSettled=(accId,txId)=>setAccs(p=>p.map(a=>a.id===accId?{...a,txs:a.txs.map(t=>t.id===txId?{...t,split:{...t.split,settled:!t.split.settled}}:t)}:a));
  const pendingSplits=()=>{const out=[];accs.forEach(a=>(a.txs||[]).forEach(t=>{if(t.split)out.push({...t,accId:a.id,accName:accLabel(a,banks)});}));return out.sort((a,b)=>(a.split.settled===b.split.settled?0:a.split.settled?1:-1)||b.date.localeCompare(a.date));};
  const launch=()=>{
    if(!f.desc||!f.amount)return;
    // Split só se aplica a saídas em conta (não cartão, não transferência) — cobre o caso
    // real (conta de luz/água paga por pix/débito, dividida 50/50 com a esposa).
    const splitPayload=(f.ltype==="out"&&f.method!=="credito"&&f.splitOn&&f.splitPersonId)?{personId:f.splitPersonId,theirPercent:Number(f.splitPercent)||50,settled:false}:null;
    if(f.ltype==="transfer"){if(!f.fromId||!f.toId){toast_("Selecione origem e destino","#ef4444");return;}const id=uid();const fromName=(f.fromKind==="acc"?accs:boxes).find(x=>x.id===f.fromId)?.name||"";const toName=(f.toKind==="acc"?accs:boxes).find(x=>x.id===f.toId)?.name||"";if(f.fromKind==="acc")setAccs(p=>p.map(a=>a.id===f.fromId?{...a,txs:[...a.txs,{id:"t"+id+"o",desc:f.desc+" para "+toName,amount:Number(f.amount),type:"out",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.fromId?{...b,balance:b.balance-Number(f.amount)}:b));if(f.toKind==="acc")setAccs(p=>p.map(a=>a.id===f.toId?{...a,txs:[...a.txs,{id:"t"+id+"d",desc:f.desc+" de "+fromName,amount:Number(f.amount),type:"in",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.toId?{...b,balance:b.balance+Number(f.amount)}:b));toast_("Transferência realizada");close();return;}
    if(f.method==="credito"){if(!f.cardId){toast_("Selecione um cartão","#ef4444");return;}const ins=f.ltype==="in"?1:(Number(f.installments)||1);setCards(p=>p.map(c=>c.id===f.cardId?{...c,txs:[...c.txs,{id:"ct"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,installments:ins}]}:c));}
    else{const accId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;if(!accId){toast_("Selecione uma conta","#ef4444");return;}setAccs(p=>p.map(a=>a.id===accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||"",...(splitPayload?{split:splitPayload}:{})}]}:a));}
    if(f.recurring){const accId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;setRecurrings(p=>[...p,{id:"rec"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,cat:f.cat,method:f.method,accId:f.method==="credito"?null:accId,cardId:f.method==="credito"?f.cardId:null,freq:f.recurring,nextDate:freqAdd(f.date,f.recurring),active:true,...(splitPayload?{split:{personId:splitPayload.personId,theirPercent:splitPayload.theirPercent}}:{})}]);}
    toast_(f.ltype==="in"?"Entrada registrada":"Saída registrada",f.ltype==="in"?ACCENT:"#ef4444");close();
  };

  const accOpts=()=>[{v:"",l:"Selecione..."},...accs.filter(a=>!a.isCash).map(a=>({v:a.id,l:accLabel(a,banks)}))];
  const cardOpts=()=>[{v:"",l:"Selecione..."},...cards.map(c=>({v:c.id,l:c.name}))];
  const bankOpts=()=>banks.map(b=>({v:b.id,l:b.name}));
  const iCatOpts=()=>ICAT.flatMap(c=>c.sub.map(s=>({v:s.id,l:c.label+" - "+s.label})));

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:C.card,
          border:"1px solid #10b98133",borderRadius:9,padding:"7px 12px",cursor:"pointer",
          color:"#10b981",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Yesod · Finanças</span>
      </div>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+";}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:scale(.8) translateX(-50%)}100%{opacity:1;transform:scale(1) translateX(-50%)}}"}</style>

      {toast&&(<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>)}

      {/* HEADER */}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>YESOD</div><div style={{fontSize:18,fontWeight:800}}>Finanças</div></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* FIX 1: default method=pix + first account pre-selected */}
          {!page&&(tab==="yesod"||(tab==="orc"&&orcSection==="fluxo"))&&(<button onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:catsOut[0],method:"pix",cardId:"",accId:accs[0]?.id||"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:""})} style={{background:"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)",border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Ico n="zap" size={13} color="#fff"/> Registrar</button>)}
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ico n={dark?"sun":"moon"} size={14} color={C.dim}/></button>
        </div>
      </div>

      {/* NET BAR */}
      <div style={{padding:"8px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginBottom:3}}><span>Patrimônio líquido</span><span style={{fontWeight:700,color:ACCENT}}>{fmt(net)}</span></div>
        <div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:"100%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div>
      </div>

      <div style={{padding:"10px 16px 90px"}}>

        {/* ── SUB-PAGES ── */}
        {page&&(function InlineBlock(){
          const BackBtn=({label})=>(<button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}><Ico n="back" size={13}/> {label}</button>);

          if(page.type==="account"){
            const ac=accs.find(a=>a.id===page.id);if(!ac)return null;
            const bk2=bkOf(ac.bankId);const accColor=ac.isCash?"#f59e0b":(bk2?.color||ACCENT);const bal=accBal(ac);const txs=[...(ac.txs||[])].sort((a,b)=>b.date.localeCompare(a.date));
            const q=txSearch.trim().toLowerCase();const filteredTxs=q?txs.filter(t=>(t.desc+" "+t.cat).toLowerCase().includes(q)):txs;
            // Agrupado por mês (25/08/2026) — filteredTxs já vem ordenado desc por data,
            // então agrupar em sequência já produz os grupos do mês mais recente pro mais
            // antigo, sem precisar de estado de navegação: rolar a lista já mostra os
            // extratos realizados dos meses passados.
            const monthGroups=[];
            filteredTxs.forEach(tx=>{
              const ym=tx.date.slice(0,7);
              let g=monthGroups[monthGroups.length-1];
              if(!g||g.ym!==ym){g={ym,txs:[]};monthGroups.push(g);}
              g.txs.push(tx);
            });
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Contas"/>
              <div style={{background:"linear-gradient(135deg,"+accColor+"18,"+accColor+"06)",border:"1px solid "+accColor+"33",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>{ac.isCash?"Carteira":bk2?.name+" - "+ac.name}</div><div style={{fontSize:28,fontWeight:900,color:accColor}}>{fmt(bal)}</div></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>EXTRATO</div><Btn sm full={false} onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:catsOut[0],method:ac.isCash?"dinheiro":"pix",accId:ac.id,cardId:"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:"",lockCash:ac.isCash})}><Ico n="plus" size={12}/> Registrar</Btn></div>
              <input value={txSearch} onChange={e=>setTxSearch(e.target.value)} placeholder="Buscar por descrição ou categoria..." style={{width:"100%",background:C.card,border:"1px solid "+C.b1,borderRadius:9,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
              {filteredTxs.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum lançamento encontrado</div>}
              {monthGroups.map(g=>{const monthNet=g.txs.reduce((s,tx)=>s+(tx.type==="in"?tx.amount:-tx.amount),0);return(
                <div key={g.ym} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"0 2px"}}><span style={{fontSize:11,fontWeight:700,color:C.text}}>{monthLabel2(g.ym)}</span><span style={{fontSize:11,fontWeight:700,color:monthNet>=0?"#16a34a":"#ef4444"}}>{monthNet>=0?"+":"-"}{fmt(Math.abs(monthNet))}</span></div>
                  {g.txs.map(tx=>(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={13} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.method} · {tx.date}</div></div><div style={{fontSize:13,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444"}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount)}</div><button onClick={()=>openSh("editTx",{accId:ac.id,origAccId:ac.id,id:tx.id,ltype:tx.type,desc:tx.desc,amount:tx.amount,date:tx.date,cat:tx.cat,method:tx.method,recurring:tx.recurring||"",splitOn:!!tx.split,splitPersonId:tx.split?.personId||"",splitPercent:tx.split?.theirPercent??50,splitSettled:tx.split?.settled||false})} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delAccTx(ac.id,tx.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button></div>))}
                </div>
              );})}
            </div>);
          }

          if(page.type==="card"){
            const cd=cards.find(c=>c.id===page.id);if(!cd)return null;
            const bk2=bkOf(cd.bankId);const stmts=getStmts(cd);const debt=stmts.reduce((s,st)=>s+st.total,0);
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Cartões"/>
              <div style={{background:"linear-gradient(135deg,"+cd.color+"18,"+cd.color+"06)",border:"1px solid "+cd.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{bk2?.name} - {cd.name}</div>
                <div style={{display:"flex",gap:20,marginBottom:10}}><div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>LIMITE</div><div style={{fontSize:16,fontWeight:800}}>{fmt(cd.limit)}</div></div><div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>DISPONÍVEL</div><div style={{fontSize:16,fontWeight:800,color:ACCENT}}>{fmt(cd.limit-debt)}</div></div></div>
                <div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:Math.min(100,(debt/cd.limit)*100)+"%",background:debt/cd.limit>0.8?"#ef4444":cd.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>Fecha dia {cd.closeDay} · Vence dia {cd.dueDay}</div>
              </div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>FATURAS</div>
              {stmts.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma transação</div>}
              {stmts.map((st,si)=>{const past=st.due<today;const curr=!past&&si===stmts.findIndex(x=>x.due>=today);return(<div key={st.due} style={{background:C.card,border:"1px solid "+(curr?cd.color+"44":C.b1),borderRadius:14,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontSize:12,fontWeight:700,color:curr?cd.color:C.text,display:"flex",alignItems:"center",gap:6}}>Fatura {mLbl(st.due)}{curr&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:cd.color+"22",color:cd.color,fontWeight:700}}>VIGENTE</span>}</div><div style={{fontSize:9,color:C.muted}}>Vence {st.due.slice(8)}/{mLbl(st.due)}</div></div><div style={{fontSize:16,fontWeight:900,color:"#ef4444"}}>{fmt(st.total)}</div></div>{st.items.map((item,ii)=>(<div key={ii} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{item.desc}</div><div style={{fontSize:9,color:C.muted}}>{item.cat} · {item.date}{item.parcel?" · Parcela "+item.parcel:""}</div></div><div style={{fontSize:12,fontWeight:700,color:item.type==="in"?"#16a34a":"#ef4444"}}>{fmt(Math.abs(item.amt))}</div>{!item.parcel&&<button onClick={()=>delCardTx(cd.id,item.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button>}</div>))}</div>);})}
            </div>);
          }

          if(page.type==="debt"){
            const d=debts.find(x=>x.id===page.id);if(!d)return null;
            const restantes=d.totalParcelas-d.parcelasPagas;const saldo=restantes*d.valorParcela;const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Dívidas"/>
              <div style={{background:"linear-gradient(135deg,"+d.color+"18,"+d.color+"06)",border:"1px solid "+d.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:11,color:C.muted,marginBottom:2}}>{d.name}</div>{d.credor&&<div style={{fontSize:12,fontWeight:700,color:d.color,marginBottom:4}}>{d.credor}</div>}<div style={{fontSize:22,fontWeight:900,color:d.color}}>{fmt(saldo)}</div></div>
                  <button onClick={()=>openSh("editDebt",{id:d.id,name:d.name,credor:d.credor||"",totalParcelas:d.totalParcelas,parcelasPagas:d.parcelasPagas,valorParcela:d.valorParcela,dueDay:d.dueDay,startDate:d.startDate,color:d.color})} style={{background:d.color+"22",border:"1px solid "+d.color+"44",borderRadius:9,padding:"6px 12px",cursor:"pointer",color:d.color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><Ico n="edit" size={12} color={d.color}/> Editar</button>
                </div>
                <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",margin:"12px 0 4px"}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>{pct}% quitado</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>{[{l:"Total",v:d.totalParcelas,c:C.text},{l:"Pagas",v:d.parcelasPagas,c:ACCENT},{l:"Restantes",v:restantes,c:d.color}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{s.l}</div></div>))}</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <Btn full={false} style={{flex:1}} color={ACCENT} onClick={()=>openSh("payDebt",{debtId:d.id,accId:"",qtd:1})}><Ico n="check" size={13}/> Parcela</Btn>
                <Btn full={false} style={{flex:1}} outline color={d.color} onClick={()=>openSh("amortizarDivida",{debtId:d.id,accId:"",mode:"valor",effect:"prazo",value:0,qtd:1})}><Ico n="down" size={13}/> Amortizar</Btn>
              </div>
              <Btn outline color="#ef4444" onClick={()=>openSh("quitarDivida",{debtId:d.id,accId:"",remaining:saldo})}><Ico n="x" size={14}/> Quitar dívida</Btn>
            </div>);
          }

          if(page.type==="box"){
            const bx=boxes.find(b=>b.id===page.id);if(!bx)return null;
            const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));
            const rate=bx.rate||0;
            const monthlyRate=rate>0?((bx.rateUnit||"ano")==="ano"?Math.pow(1+rate/100,1/12)-1:rate/100):0;
            const history=boxSnaps.filter(s=>s.boxId===bx.id).sort((a,b)=>a.ym.localeCompare(b.ym)).slice(-6);
            const projection=Array.from({length:6},(_,i)=>{const v=bx.balance*Math.pow(1+monthlyRate,i+1);return{ym:addM(getMonthStr(0),i+1),value:v};});
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Caixinhas"/>
              <div style={{background:"linear-gradient(135deg,"+bx.color+"18,"+bx.color+"06)",border:"1px solid "+bx.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:bx.color,marginBottom:4}}>{bx.name}</div><div style={{fontSize:28,fontWeight:900}}>{fmt(bx.balance)}</div>
                <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",margin:"10px 0 4px"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>{pct}% da meta de {fmt(bx.goal)}{bx.targetDate?" · até "+bx.targetDate.split("-").reverse().join("/"):""}{rate>0?" · "+rate+"% "+((bx.rateUnit||"ano")==="ano"?"a.a.":"a.m."):""}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}><Btn full={false} style={{flex:1}} color={bx.color} onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"in",amount:0,date:today})}><Ico n="up" size={13}/> Depositar</Btn><Btn full={false} style={{flex:1}} outline color="#ef4444" onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"out",amount:0,date:today})}><Ico n="down" size={13}/> Retirar</Btn></div>
              {history.length>0&&(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>SALDOS ANTERIORES</div>
                {history.map(s=>(<div key={s.ym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:s.ym===getMonthStr(0)?bx.color:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><span style={{fontSize:11,fontWeight:700}}>{fmt(s.balance)}</span></div>))}
              </div>)}
              {rate>0&&(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>PROJEÇÃO (mantendo o saldo atual rendendo)</div>
                {projection.map(p=>(<div key={p.ym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:C.text}}>{monthLabel2(p.ym)}</span><span style={{fontSize:11,fontWeight:700,color:bx.color}}>{fmt(p.value)}</span></div>))}
              </div>)}
            </div>);
          }

          if(page.type==="inv"){
            const cat=ICAT.find(c=>c.id===page.id);if(!cat)return null;
            const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Investimentos"/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:cat.color}}/><span style={{fontSize:15,fontWeight:800,color:cat.color}}>{cat.label}</span></div>
              {cat.sub.map(sub=>{const si=ci.filter(i=>i.subCat===sub.id);if(!si.length)return null;return(<div key={sub.id} style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>{sub.label.toUpperCase()}</div>{si.map(inv=>{const gain=inv.balance-inv.invested;const gp=inv.invested>0?((gain/inv.invested)*100).toFixed(1):"0.0";return(<div key={inv.id} style={{background:C.card,border:"1px solid "+cat.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{inv.name}</div><div style={{fontSize:9,color:C.muted}}>{bkOf(inv.bankId)?.name}{inv.rate?" · "+inv.rate:""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:cat.color}}>{fmt(inv.balance)}</div><div style={{fontSize:9,fontWeight:600,color:gain>=0?"#10b981":"#ef4444"}}>{gain>=0?"+":""}{fmt(gain)} ({gp}%)</div></div></div><div style={{display:"flex",gap:6,marginBottom:6}}><Btn sm full={false} color={ACCENT} style={{flex:1}} onClick={()=>openSh("invAport",{invId:inv.id,accId:"",amount:0,date:today})}><Ico n="up" size={11}/> Aportar</Btn><Btn sm full={false} outline color="#ef4444" style={{flex:1}} onClick={()=>openSh("invResgate",{invId:inv.id,accId:"",amount:0,date:today})}><Ico n="down" size={11}/> Resgatar</Btn></div><div style={{display:"flex",gap:6}}><Btn sm full={false} outline color={cat.color} style={{flex:1}} onClick={()=>openSh("checkin",{invId:inv.id,balance:inv.balance})}><Ico n="refresh" size={11}/> Atualizar saldo</Btn><button onClick={()=>openSh("editInv",{id:inv.id,name:inv.name,invested:inv.invested,balance:inv.balance,rate:inv.rate,maturity:inv.maturity})} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delInv(inv.id)} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="x" size={12} color="#ef4444"/></button></div></div>);})}</div>);})}
              {ci.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum ativo</div>}
            </div>);
          }

          if(page.type==="goalsDetail"){
            const ifNeeded=ifGoal||ifMonthly*300;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
            const last3=[-1,-2,-3].map(o=>cashflowMonth(o));const avgSaving=Math.max(0,last3.reduce((s,m)=>s+(m.ins-m.outs),0)/3);
            const monthsLeft=avgSaving>0?Math.ceil((ifNeeded-net)/avgSaving):null;const yearsLeft=monthsLeft?(monthsLeft/12).toFixed(1):null;
            const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(o));const savRates=months6.map(m=>({ym:m.ym,rate:m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0}));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Objetivos"/>
              <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div><div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div><div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div><div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{l:"POUPANÇA MÉDIA/MÊS",v:fmt(avgSaving),sub:"últimos 3 meses",c:avgSaving>0?ACCENT:"#ef4444"},{l:"PROJEÇÃO",v:yearsLeft?yearsLeft+" anos":"—",sub:monthsLeft?monthsLeft+" meses":"sem dados",c:ACCENT},{l:"RENDA MENSAL (4%)",v:fmt(ifNeeded/300),sub:"ao atingir a meta",c:"#f59e0b"},{l:"PATRIMÔNIO ALVO",v:fmt(ifNeeded),sub:"regra dos 4%",c:C.text}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>{s.l}</div><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{s.sub}</div></div>))}</div>
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>TAXA DE POUPANÇA — 6 MESES</div>{savRates.map(s=>{const color=s.rate>=20?ACCENT:s.rate>=10?"#f59e0b":"#ef4444";return(<div key={s.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:s.ym===getMonthStr(0)?ACCENT:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,s.rate)+"%",background:color,borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color,minWidth:30,textAlign:"right"}}>{s.rate}%</span></div>);})}</div>
              <Btn outline color={ACCENT} onClick={()=>openSh("editIF",{ifGoal:ifNeeded,ifMonthly})}><Ico n="edit" size={14}/> Editar meta</Btn>

              {/* Outras metas — livres, não só IF (checklist com XP) */}
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginTop:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>OUTRAS METAS</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{yGoals.filter(g=>g.done).length}/{yGoals.length}</span><button onClick={()=>openSh("addYGoal",{title:"",xp:100})} style={{background:"#f59e0b22",border:"1px solid #f59e0b44",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:"#f59e0b",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10} color="#f59e0b"/> Meta</button></div>
                </div>
                {yGoals.length===0&&<div style={{textAlign:"center",padding:16,color:C.muted,fontSize:11}}>Nenhuma meta ainda — toque em "+ Meta" pra criar uma.</div>}
                {yGoals.map(g=>(<div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}><button onClick={()=>{if(!g.done){setFinXp(x=>x+g.xp);}setYGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?"#f59e0b":C.b2),background:g.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}</button><div style={{flex:1,fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div><span style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>+{g.xp}</span><button onClick={()=>setYGoals(p=>p.filter(x=>x.id!==g.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:.5}}><Ico n="x" size={11} color={C.muted}/></button></div>))}
              </div>
            </div>);
          }
          return null;
        })()}

        {/* ══ YESOD — VISÃO GERAL ══ */}
        {!page&&tab==="yesod"&&(function YesodTab(){
          const ys=calcYesodScore();
          const cf0=cashflowMonth(-1);
          const savRate=cf0.ins>0?Math.max(0,(cf0.ins-cf0.outs)/cf0.ins):0;
          const ifN=ifGoal||ifMonthly*300||1;

          // ── Catálogo de cards disponíveis ──────────────────────────────────
          const CARD_DEFS=[
            {id:"poupanca",  l:"Poupança",      v:Math.min(100,Math.round(savRate/0.2*100)), unit:"%", c:"#16a34a", tab:"fluxo",  icon:"up",       desc:"Taxa de poupança"},
            {id:"if",        l:"Prog. IF",       v:Math.min(100,Math.round(net/ifN*100)),     unit:"%", c:"#06b6d4", tab:"goals",     icon:"alvo",     desc:"Independência financeira"},
            {id:"dividas",   l:"Dívidas",        v:debts.length>0?Math.round(debts.reduce((s,d)=>s+(d.parcelasPagas/d.totalParcelas),0)/debts.length*100):100, unit:"%", c:"#f97316", tab:"bolsos", icon:"debt", desc:"Progresso quitação"},
            {id:"orcamento", l:"Orçamento",      v:budgets.length>0?Math.round(budgets.filter(b=>budgetSpend(b.cat)<=b.limit).length/budgets.length*100):50, unit:"%", c:"#8b5cf6", tab:"orc", icon:"alvo", desc:"Categorias no limite"},
            {id:"habitos",  l:"Hábitos",   v:Math.round(yHabits.filter(h=>h.done).length/(yHabits.length||1)*100), unit:"%", c:ACCENT,    tab:"habitos_section", icon:"check",    desc:"Hábitos concluídos"},
            {id:"metas",    l:"Metas",     v:Math.round(yGoals.filter(g=>g.done).length/(yGoals.length||1)*100),   unit:"%", c:"#f59e0b", tab:"goals",   icon:"alvo",     desc:"Metas atingidas"},
            {id:"patrimonio",l:"Patrimônio",     v:fmt(net),   unit:"", c:net>=0?ACCENT:"#ef4444", tab:"fluxo", icon:"wallet",   desc:"Patrimônio líquido"},
            {id:"receita",   l:"Receita",        v:fmt(cf0.ins), unit:"", c:"#16a34a", tab:"fluxo", icon:"up",    desc:"Receita do mês"},
            {id:"despesa",   l:"Despesas",       v:fmt(cf0.outs),unit:"", c:"#ef4444", tab:"fluxo", icon:"down",  desc:"Despesas do mês"},
            {id:"saldo_mes", l:"Saldo Mensal",   v:fmt(cf0.balance), unit:"", c:cf0.balance>=0?ACCENT:"#ef4444", tab:"fluxo", icon:"activity", desc:"Resultado do mês"},
            {id:"investido", l:"Investido",      v:fmt(totInv), unit:"", c:"#f59e0b", tab:"bolsos",  icon:"barchart", desc:"Total investido"},
            {id:"contas",    l:"Contas",         v:fmt(totAcc), unit:"", c:ACCENT,    tab:"bolsos",icon:"bank",    desc:"Saldo em contas"},
          ];

          const activeCards=yesodCards.map(id=>CARD_DEFS.find(d=>d.id===id)).filter(Boolean);
          const alerts=upcomingAlerts();

          return(<div style={{animation:"slideUp .3s ease"}}>
            {/* Score principal */}
            <div style={{background:"linear-gradient(135deg,#10b98122,#10b98106)",border:"1px solid #10b98144",borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>YESOD — SAÚDE FINANCEIRA</div>
                <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{ys}<span style={{fontSize:18}}>%</span></div>
              </div>
              <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:ys+"%",background:"linear-gradient(90deg,#10b981,#06b6d4)",borderRadius:99,transition:"width .6s"}}/></div>
            </div>

            {/* Alertas de vencimento */}
            {alerts.length>0&&(
              <div style={{background:C.card,border:"1px solid #f9731644",borderRadius:14,padding:12,marginBottom:14}}>
                <div style={{fontSize:9,color:"#f97316",fontWeight:700,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico n="debt" size={11} color="#f97316"/> VENCE NOS PRÓXIMOS 7 DIAS</div>
                {alerts.map(al=>{const urgent=al.days<=2;return(<div key={al.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid "+C.b1}}>
                  <div><div style={{fontSize:11,fontWeight:600}}>{al.label}</div><div style={{fontSize:9,color:urgent?"#ef4444":C.muted,fontWeight:urgent?700:400}}>{al.days===0?"Vence hoje":al.days===1?"Vence amanhã":"Vence em "+al.days+" dias"}</div></div>
                  <div style={{fontSize:12,fontWeight:800,color:urgent?"#ef4444":al.color}}>{fmt(al.amount)}</div>
                </div>);})}
              </div>
            )}
            {/* Divisões pendentes — despesas marcadas como divididas com alguém, ainda não
                acertadas. Resolve a limitação "split de despesas" (ex: luz 50/50, controle
                de quem já pagou a parte). */}
            {(()=>{const splits=pendingSplits();const pend=splits.filter(t=>!t.split.settled);if(!splits.length)return null;return(
              <div style={{background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:14,padding:12,marginBottom:14}}>
                <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>DESPESAS DIVIDIDAS{pend.length>0?" · "+pend.length+" PENDENTE"+(pend.length>1?"S":""):""}</span>
                </div>
                {splits.slice(0,6).map(t=>{const person=splitPeople.find(p=>p.id===t.split.personId);const theirs=t.amount*(t.split.theirPercent/100);return(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderTop:"1px solid "+C.b1}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                      <div style={{fontSize:9,color:C.muted}}>{person?.name||"?"} deve {fmt(theirs)} ({t.split.theirPercent}%) · {t.date.split("-").reverse().join("/")}</div>
                    </div>
                    <button onClick={()=>toggleSplitSettled(t.accId,t.id)} style={{flexShrink:0,background:t.split.settled?ACCENT+"22":"#f59e0b22",border:"1px solid "+(t.split.settled?ACCENT+"44":"#f59e0b44"),borderRadius:8,padding:"5px 9px",cursor:"pointer",color:t.split.settled?ACCENT:"#f59e0b",fontSize:9,fontWeight:700}}>{t.split.settled?"Acertado":"Marcar acertado"}</button>
                  </div>
                );})}
              </div>
            );})()}

            {/* Cards customizáveis */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>INDICADORES</div>
              <button onClick={()=>setSh("editCards")} style={{background:C.b1,border:"none",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:C.muted,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                <Ico n="gear" size={10} color={C.muted}/> Editar
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {activeCards.map(r=>{
                const isNum=typeof r.v==="number";
                const color=isNum?(r.v>=80?r.c:r.v>=50?"#f59e0b":"#ef4444"):r.c;
                return(
                  <div key={r.id} onClick={()=>{
                    if(r.tab==="habitos_section") document.getElementById("yesod-habitos")?.scrollIntoView({behavior:"smooth"});
                    else if(r.tab==="fluxo") { setTab("orc"); setOrcSection("fluxo"); }
                    else if(r.tab&&r.tab!=="yesod") setTab(r.tab);
                  }}
                    style={{background:C.card,border:"1px solid "+color+"22",borderRadius:12,
                      padding:"10px 8px",textAlign:"center",cursor:r.tab!=="yesod"?"pointer":"default"}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>{r.l}</div>
                    <div style={{fontSize:isNum?18:12,fontWeight:900,color,marginBottom:isNum?4:0,lineHeight:1.2}}>{r.v}{r.unit}</div>
                    {isNum&&<div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:r.v+"%",background:color,borderRadius:99}}/></div>}
                    <div style={{fontSize:8,color:C.muted,marginTop:3}}>{r.desc}</div>
                  </div>
                );
              })}
              {activeCards.length===0&&(
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:16,color:C.muted,fontSize:11}}>
                  Nenhum indicador — toque em Editar para adicionar
                </div>
              )}
            </div>

            {/* Hábitos */}
            <div id="yesod-habitos" style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{yHabits.filter(h=>h.done).length}/{yHabits.length}</span><button onClick={()=>openSh("addYHabit",{title:"",freq:"Diário",xp:15})} style={{background:ACCENT+"22",border:"1px solid "+ACCENT+"44",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10} color={ACCENT}/> Hábito</button></div>
              </div>
              {yHabits.map(h=>(<div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}><button onClick={()=>{if(!h.done){setFinXp(x=>x+h.xp);}setYHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}</button><div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted,marginTop:1}}>{h.freq}</div></div><span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span><button onClick={()=>setYHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:.5}}><Ico n="x" size={11} color={C.muted}/></button></div>))}
            </div>
          </div>);
        })()}

        {/* ══ YESOD — FLUXO ══ */}
        {/* ══ ORÇAMENTO ══ — ganhou pill Fluxo em 25/08/2026 (morava na aba Yesod antes, ver
            ORC_SECTIONS) — Fluxo vem primeiro, é o mais usado do dia a dia */}
        {!page&&tab==="orc"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {ORC_SECTIONS.map(s=>(<button key={s.id} onClick={()=>setOrcSection(s.id)}
                style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,
                  background:orcSection===s.id?"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)":C.b1,
                  border:"none",color:orcSection===s.id?"#fff":C.muted}}>{s.l}</button>))}
            </div>
            {orcSection==="orc"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,fontWeight:800}}>Orçamento — {monthLabel2(getMonthStr(0))}</span>
                <button onClick={()=>openSh("addBudget",{cat:catsOut[0],limit:0})} style={{background:"none",border:"1px solid "+ACCENT,borderRadius:7,padding:"5px 11px",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10}/> Categoria</button>
              </div>
              {budgets.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum orçamento definido</div>}
              {budgets.map(bg=>{const spent=budgetSpend(bg.cat);const pct=Math.min(100,Math.round((spent/bg.limit)*100));const over=spent>bg.limit;const color=over?"#ef4444":pct>75?"#f59e0b":ACCENT;return(<div key={bg.id} style={{background:C.card,border:"1px solid "+(over?"#ef444433":C.b1),borderRadius:12,padding:"11px 13px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12,fontWeight:600}}>{bg.cat}</span>{over&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:"#fee2e2",color:"#ef4444",fontWeight:700}}>ACIMA</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,fontWeight:700,color}}>{fmt(spent)}</span><span style={{fontSize:9,color:C.muted}}>/ {fmt(bg.limit)}</span><button onClick={()=>openSh("editBudget",{id:bg.id,cat:bg.cat,limit:bg.limit})} style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={10} color={C.muted}/></button><button onClick={()=>setBudgets(p=>p.filter(x=>x.id!==bg.id))} style={{background:C.b1,border:"none",borderRadius:99,width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={9} color={C.muted}/></button></div></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{pct}% usado {over?"— "+fmt(spent-bg.limit)+" acima":"— "+fmt(bg.limit-spent)+" disponível"}</div></div>);})}
            </div>)}
          </div>
        )}
        {!page&&tab==="orc"&&orcSection==="fluxo"&&(function FluxoTab(){
          const VIEWS=["fluxo","poupanca","dividas-rel","invest-rel","patrimonio","projecao"];
          const VIEW_LABELS=["Fluxo de Caixa","Taxa de Poupança","Progresso Dívidas","Rendimento Invest.","Evolução Patrimonial","Projeção"];
          const vIdx=typeof fluxoView==="number"?fluxoView:0;
          const cf=cashflowMonth(overMonth);const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(overMonth+o));
          const savingsRate=cf.ins>0?Math.max(0,Math.round(((cf.ins-cf.outs)/cf.ins)*100)):0;
          const totDebtNow=debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
          const investPerf=invs.map(i=>({name:i.name.length>16?i.name.slice(0,14)+"...":i.name,gain:i.balance-i.invested,pct:i.invested>0?((i.balance-i.invested)/i.invested*100).toFixed(1):"0.0",color:ICAT.find(c=>c.sub.some(s=>s.id===i.subCat))?.color||ACCENT})).sort((a,b)=>b.gain-a.gain);
          return(
            <div style={{animation:"slideUp .3s ease"}} onTouchStart={e=>{touchXRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touchXRef.current;if(Math.abs(dx)>40){setFluxoView(v=>dx<0?Math.min(VIEWS.length-1,v+1):Math.max(0,v-1));}}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:800}}>{VIEW_LABELS[vIdx]}</span>
              </div>
              {/* Antes tinha um "← Ago/26 →" aqui (overMonth), independente do mês selecionado
                  no gráfico abaixo (selChartYm) — dava pra ficar com dois meses diferentes
                  mostrados ao mesmo tempo na tela, um deles sem efeito nenhum visível (bug
                  reportado 25/08/2026 com screenshot: cabeçalho em "Out/25", gráfico em
                  "Mar/26"). Removido — a única forma de escolher o mês agora é tocar numa
                  barra do gráfico; overMonth continua existindo só pra Taxa de Poupança
                  (histórico de 6 meses), sem controle visível próprio, sempre no mês atual. */}
              {vIdx===0&&(function FluxoCaixaView(){
                const chartYm=selChartYm||getMonthStr(0);
                const curYm=getMonthStr(0);const[curY]=curYm.split("-").map(Number);
                // Ano corrente fixo, Jan-Dez (12 barras cabem na tela sem precisar arrastar) —
                // realizado até o mês atual, esperado dali até dezembro. Substituiu o toggle
                // 3/6/12 de antes (25/08/2026): o usuário queria ver o ano inteiro de uma vez,
                // não só uma janela — e com 12 meses fixos não sobra necessidade de gesto de
                // arrastar pra "ver mais", já mostra tudo.
                const yearYms=Array.from({length:12},(_,i)=>curY+"-"+String(i+1).padStart(2,"0"));
                const chartMonths=yearYms.map(ym=>({ym,...monthTotals(ym),future:isFutureYm(ym)}));
                const chartMax=Math.max(...chartMonths.map(m=>Math.max(m.ins,m.outs)),1);
                const selTotals=monthTotals(chartYm);const selFuture=isFutureYm(chartYm);const selBalance=selTotals.ins-selTotals.outs;

                // Lista fundida (era a aba "Extrato", voltou a viver aqui em 25/08/2026 — clicar
                // num card não pula de tela mais nenhuma, o detalhe aparece embaixo na hora).
                // Busca e filtro de período saíram em 25/08/2026 — o mês já é 100% escolhido
                // pelo gráfico, não faz sentido ter um segundo controle de período aqui.
                const allCats=[...new Set([...catsOut,...catsIn])];
                let list=[];
                if(!selFuture){
                  list=allTxs().filter(tx=>{
                    if(extType!=="todos"&&tx.type!==extType)return false;
                    if(extCat&&tx.cat!==extCat)return false;
                    if(!tx.date||!tx.date.startsWith(chartYm))return false;
                    return true;
                  }).sort((a,b)=>b.date.localeCompare(a.date));
                }
                const total=list.reduce((s,tx)=>s+(tx.type==="in"?tx.amount:-tx.amount),0);
                let futureRows=[];
                const futureType=extType==="todos"?"out":extType;
                if(selFuture){
                  const totals=futureCategoryTotals(chartYm,futureType);
                  futureRows=Object.entries(totals).map(([cat,v])=>({cat,...v})).filter(r=>!extCat||r.cat===extCat);
                }

                return(<div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>REALIZADO + ESPERADO — {curY}</div>
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    <div style={{display:"flex",gap:4,alignItems:"flex-end",height:70,marginBottom:8}}>{chartMonths.map(m=>(<div key={m.ym} onClick={()=>setSelChartYm(m.ym)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}><div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:56}}><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.future?"#16a34a55":"#16a34a",height:Math.max(2,(m.ins/chartMax)*56)+"px"}}/><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.future?"#ef444455":"#ef4444",height:Math.max(2,(m.outs/chartMax)*56)+"px"}}/></div><div style={{fontSize:6,color:m.ym===chartYm?ACCENT:(m.future?C.dim:C.muted),fontWeight:m.ym===chartYm?700:400,whiteSpace:"nowrap"}}>{monthLabel2(m.ym).slice(0,3)}{m.future?"(E)":""}</div></div>))}</div>
                    <div style={{display:"flex",gap:12,fontSize:8,color:C.muted}}><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#16a34a",display:"inline-block"}}/>Realizado</span><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#16a34a55",display:"inline-block"}}/>Esperado (E)</span></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700}}>{monthLabel2(chartYm)}</span>
                    {selFuture&&<span style={{fontSize:8,fontWeight:700,color:"#f59e0b",background:"#f59e0b18",padding:"3px 8px",borderRadius:99}}>projeção editável</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                    <div onClick={()=>setExtType("in")} style={{background:C.card,border:"1px solid "+(extType==="in"?ACCENT:C.b1),borderRadius:12,padding:"11px 10px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Receitas</div><div style={{fontSize:13,fontWeight:900,color:"#16a34a"}}>{fmt(selTotals.ins)}</div></div>
                    <div onClick={()=>setExtType("out")} style={{background:C.card,border:"1px solid "+(extType==="out"?ACCENT:C.b1),borderRadius:12,padding:"11px 10px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Custos</div><div style={{fontSize:13,fontWeight:900,color:"#ef4444"}}>{fmt(selTotals.outs)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Saldo</div><div style={{fontSize:13,fontWeight:900,color:selBalance>=0?ACCENT:"#ef4444"}}>{fmt(selBalance)}</div></div>
                  </div>

                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>LANÇAMENTOS</span>
                    <select value={extCat} onChange={e=>setExtCat(e.target.value)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:9,padding:"5px 8px",color:C.text,fontSize:10,outline:"none"}}>
                      <option value="">Todas categorias</option>
                      {allCats.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{display:"flex",gap:6,marginBottom:14}}>
                    {[{v:"todos",l:"Todos"},{v:"in",l:"Receitas"},{v:"out",l:"Custos"}].map(o=>(
                      <button key={o.v} onClick={()=>setExtType(o.v)} style={{flex:1,padding:"7px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:10,border:"1.5px solid "+(extType===o.v?ACCENT:C.b2),background:extType===o.v?ACCENT+"18":"transparent",color:extType===o.v?ACCENT:C.muted}}>{o.l}</button>
                    ))}
                  </div>

                  {selFuture?(<>
                    <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>Mês futuro — valores vêm das recorrências ativas. Edite pra ajustar só {monthLabel2(chartYm)} (a recorrência continua com o valor padrão nos outros meses); some uma categoria nova se precisar.{extType==="todos"&&" Mostrando Custos esperados — escolha Receitas ou Custos acima pra trocar."}</div>
                    {futureRows.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma categoria esperada ainda.</div>}
                    {futureRows.map((row,i)=>(<div key={row.cat+i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 11px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:7}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:700}}>{row.cat}</div>
                        {row.fromRecurring&&<div style={{fontSize:8,color:C.muted}}>da recorrência "{row.recDesc}"</div>}
                      </div>
                      {row.fromRecurring
                        ?<input type="number" value={row.amount} onChange={e=>setRecurringOverrides(p=>({...p,[chartYm+"|"+row.recId]:e.target.value}))} style={{width:78,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 9px",color:C.text,fontSize:12,outline:"none",textAlign:"right"}}/>
                        :<input type="number" value={row.amount} onChange={e=>setPlannedItems(p=>p.map(it=>it.id===row.plannedId?{...it,amount:e.target.value}:it))} style={{width:78,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 9px",color:C.text,fontSize:12,outline:"none",textAlign:"right"}}/>}
                    </div>))}
                    <Btn outline sm color={ACCENT} onClick={()=>{
                      const opts=futureType==="in"?catsIn:catsOut;
                      setPlannedItems(p=>[...p,{id:"pi"+uid(),ym:chartYm,cat:opts[0],type:futureType,amount:0}]);
                    }}><Ico n="plus" size={11}/> Adicionar categoria esperada</Btn>
                  </>):(<>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 14px",marginBottom:14}}>
                      <span style={{fontSize:9,color:C.muted,fontWeight:600}}>{list.length} lançamento{list.length===1?"":"s"}</span>
                      <span style={{fontSize:14,fontWeight:900,color:total>=0?"#16a34a":"#ef4444"}}>{total>=0?"+":"-"}{fmt(Math.abs(total))}</span>
                    </div>
                    {list.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum lançamento encontrado com esses filtros.</div>}
                    {list.map((tx,i)=>(<div key={tx.id+i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={12} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.sourceName} · {tx.date.split("-").reverse().join("/")}</div></div><div style={{fontSize:12,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444",flexShrink:0}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount)}</div></div>))}
                  </>)}
                </div>);
              })()}
              {vIdx===1&&(<div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:18,marginBottom:10,textAlign:"center"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>TAXA DE POUPANÇA</div><div style={{fontSize:52,fontWeight:900,color:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",lineHeight:1}}>{savingsRate}%</div><div style={{fontSize:11,color:C.muted,marginTop:6}}>Meta saudável: 20%+</div><div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",margin:"16px 0 8px"}}><div style={{height:"100%",width:Math.min(100,savingsRate)+"%",background:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>HISTÓRICO</div>{months6.slice().reverse().map(m=>{const rate=m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0;return(<div key={m.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:m.ym===cf.ym?ACCENT:C.text,fontWeight:m.ym===cf.ym?700:400}}>{monthLabel2(m.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,rate)+"%",background:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",minWidth:30,textAlign:"right"}}>{rate}%</span></div>);})}</div></div>)}
              {vIdx===2&&(<div><div style={{background:"linear-gradient(135deg,#ef444418,#ef444406)",border:"1px solid #ef444433",borderRadius:14,padding:16,marginBottom:10,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>TOTAL EM DÍVIDAS</div><div style={{fontSize:28,fontWeight:900,color:"#ef4444"}}>{fmt(totDebtNow)}</div></div>{debts.map(d=>{const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} style={{background:C.card,border:"1px solid "+d.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{d.name}</div>{d.credor&&<div style={{fontSize:9,color:d.color}}>{d.credor}</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:d.color}}>{fmt((d.totalParcelas-d.parcelasPagas)*d.valorParcela)}</div><div style={{fontSize:9,color:C.muted}}>restante</div></div></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{d.parcelasPagas}/{d.totalParcelas} ({pct}%)</div></div>);})}{debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}</div>)}
              {vIdx===3&&(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>TOTAL INVESTIDO</div><div style={{fontSize:22,fontWeight:900,color:ACCENT}}>{fmt(invs.reduce((s,i)=>s+i.invested,0))}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>RENDIMENTO</div><div style={{fontSize:22,fontWeight:900,color:invs.reduce((s,i)=>s+(i.balance-i.invested),0)>=0?ACCENT:"#ef4444"}}>{fmt(invs.reduce((s,i)=>s+(i.balance-i.invested),0))}</div></div></div></div>{investPerf.map((inv,i)=>{const positive=inv.gain>=0;return(<div key={i} style={{background:C.card,border:"1px solid "+inv.color+"22",borderRadius:12,padding:"11px 13px",marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:6,height:6,borderRadius:"50%",background:inv.color}}/><span style={{fontSize:12,fontWeight:600}}>{inv.name}</span></div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:positive?ACCENT+"22":"#ef444422",color:positive?ACCENT:"#ef4444",fontWeight:700}}>{positive?"+":""}{inv.pct}%</span><span style={{fontSize:12,fontWeight:700,color:positive?ACCENT:"#ef4444"}}>{positive?"+":""}{fmt(inv.gain)}</span></div></div></div>);})}</div>)}
              {vIdx===4&&(function InlineBlock(){const ptsAll=retroPatrim();const pts=ptsAll.slice(-24);const maxP=Math.max(...pts.map(p=>Math.abs(p.net)),1);const nowYm=new Date().toISOString().slice(0,7);const totalGain=pts.length>1?pts[pts.length-1].net-pts[0].net:0;return(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>PATRIMÔNIO ATUAL</div><div style={{fontSize:26,fontWeight:900,color:ACCENT}}>{fmt(net)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>VARIAÇÃO</div><div style={{fontSize:16,fontWeight:800,color:totalGain>=0?ACCENT:"#ef4444"}}>{totalGain>=0?"+":""}{fmt(totalGain)}</div></div></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>EVOLUÇÃO — {pts.length} {pts.length===1?"MÊS":"MESES"}{ptsAll.length>pts.length?" (últimos 24 de "+ptsAll.length+")":""}</div><div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>{pts.map((p,i)=>{const h=Math.max(4,(Math.abs(p.net)/maxP)*82);const color=p.net>=0?(p.ym===nowYm?ACCENT:ACCENT+"66"):"#ef4444";return(<div key={p.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:color,height:h+"px"}}/><div style={{fontSize:7,color:p.ym===nowYm?ACCENT:C.muted,fontWeight:p.ym===nowYm?700:400,whiteSpace:"nowrap"}}>{monthLabel2(p.ym)}</div></div>);})}</div></div><div style={{fontSize:9,color:C.muted,lineHeight:1.6}}>Cada mês é gravado uma vez e não muda mais depois (só o mês corrente segue ao vivo) — histórico cresce mês a mês a partir de {ptsAll[0]?monthLabel2(ptsAll[0].ym):"agora"}.</div></div>);})()}
              {vIdx===5&&(function InlineBlock(){
                const horizon=PROJ_HORIZONS.find(h=>h.id===projHorizonId)||PROJ_HORIZONS[2];
                const scenarioActive=projEvents.length>0;
                const base=buildProjSeries(horizon.days,null);
                const scen=scenarioActive?buildProjSeries(horizon.days,projEvents):null;
                const shown=scen||base;
                const endShown=shown[shown.length-1].balance;
                const milestones=projMilestones(horizon.days);
                const negIdx=shown.findIndex(p=>p.balance<0);
                const upcoming=horizon.days<=90?projUpcoming(horizon.days):[];
                const fmtDate=ds=>ds.split("-").reverse().join("/");
                return(<div>
                  <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>{PROJ_HORIZONS.map(h=>(<button key={h.id} onClick={()=>setProjHorizonId(h.id)} style={{padding:"6px 11px",borderRadius:99,cursor:"pointer",fontWeight:700,fontSize:10,border:"1.5px solid "+(projHorizonId===h.id?ACCENT:C.b2),background:projHorizonId===h.id?ACCENT+"18":"transparent",color:projHorizonId===h.id?ACCENT:C.muted}}>{h.l}</button>))}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Saldo hoje</div><div style={{fontSize:13,fontWeight:900}}>{fmt(totAcc)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Projetado</div><div style={{fontSize:13,fontWeight:900,color:endShown>=0?ACCENT:"#ef4444"}}>{fmt(endShown)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Variação</div><div style={{fontSize:13,fontWeight:900,color:(endShown-totAcc)>=0?ACCENT:"#ef4444"}}>{(endShown-totAcc)>=0?"+":""}{fmt(endShown-totAcc)}</div></div>
                  </div>
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    <ProjChart base={base} scenario={scen} C={C}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginTop:6}}><span>Hoje</span><span>{fmtDate(base[base.length-1].date)}</span></div>
                    {scenarioActive&&(<div style={{display:"flex",gap:14,marginTop:10,fontSize:9,color:C.muted}}><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px solid "+C.dim,display:"inline-block"}}/>Atual</span><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+ACCENT,display:"inline-block"}}/>Cenário ajustado</span></div>)}
                  </div>
                  {negIdx>=0&&(<div style={{display:"flex",gap:10,alignItems:"center",background:"#ef444414",border:"1px solid #ef444433",borderRadius:12,padding:"11px 13px",marginBottom:10}}><Ico n="zap" size={14} color="#ef4444"/><div style={{fontSize:11,color:"#ef4444",fontWeight:600}}>Saldo pode ficar negativo em {fmtDate(shown[negIdx].date)} nesse ritmo.</div></div>)}
                  {milestones.length>0&&(<div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>MARCOS NO PERÍODO</div>
                    {milestones.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+C.b1,borderRadius:10,padding:"9px 12px",marginBottom:6}}><div><div style={{fontSize:11,fontWeight:700}}>{m.label}</div><div style={{fontSize:9,color:m.color}}>{m.detail}</div></div><div style={{fontSize:10,color:C.muted}}>{fmtDate(m.date)}</div></div>))}
                  </div>)}
                  {upcoming.length>0&&(<div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>PRÓXIMOS LANÇAMENTOS CONHECIDOS</div>
                    {upcoming.map((u,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}><div style={{width:22,height:22,borderRadius:6,flexShrink:0,background:u.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={u.type==="in"?"up":"down"} size={11} color={u.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1,fontSize:11,fontWeight:600}}>{u.desc}</div><div style={{fontSize:9,color:C.muted,marginRight:6}}>{fmtDate(u.date)}</div><div style={{fontSize:11,fontWeight:700,color:u.type==="in"?"#16a34a":"#ef4444"}}>{u.type==="in"?"+":"-"}{fmt(u.amount)}</div></div>))}
                  </div>)}
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>AJUSTAR CENÁRIO</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Simula "e se" sem alterar nenhum dado real — dá pra somar vários eventos na mesma projeção.</div>
                    {projEvents.map((ev,idx)=>(
                      <div key={ev.id} style={{background:C.b1,borderRadius:10,padding:10,marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <input value={ev.label||""} onChange={e=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,label:e.target.value}:x))} placeholder="Nome do evento (opcional, ex: Viagem)" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:11,fontWeight:600,outline:"none"}}/>
                          <button onClick={()=>setProjEvents(p=>p.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={12} color={C.muted}/></button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                          <FI label="Receita extra (R$/mês)" value={ev.deltaIn||0} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,deltaIn:v}:x))} type="number" C={C}/>
                          <FI label="Redução de custo (R$/mês)" value={ev.deltaOut||0} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,deltaOut:v}:x))} type="number" C={C}/>
                        </div>
                        <FS label="A partir de" value={String(ev.fromM||0)} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,fromM:Number(v)}:x))} opts={[{v:"0",l:"Imediato"},{v:"6",l:"Em 6 meses"},{v:"12",l:"Em 1 ano"}]} C={C}/>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8}}>
                      <Btn outline sm color={ACCENT} onClick={()=>setProjEvents(p=>[...p,{id:"pe"+uid(),label:"",deltaIn:0,deltaOut:0,fromM:0}])}><Ico n="plus" size={11}/> Adicionar evento</Btn>
                      {scenarioActive&&<Btn outline color={C.muted} sm onClick={()=>setProjEvents([])}>Resetar cenário</Btn>}
                    </div>
                  </div>
                  <div style={{fontSize:9,color:C.muted,lineHeight:1.6}}>Projeção: parte orgânica (entradas/saídas de conta) pela média dos últimos 3 meses · faturas de cartão pela data real de vencimento de cada parcela pendente (não mais média) · dívidas descontadas até a quitação. Não prevê gastos variáveis ou imprevistos — trate como tendência, não como garantia.</div>
                </div>);
              })()}
              <div style={{display:"flex",gap:5,justifyContent:"center",padding:"18px 0 4px"}}>{VIEWS.map((_,i)=>(<button key={i} onClick={()=>setFluxoView(i)} style={{width:i===vIdx?16:6,height:6,borderRadius:99,background:i===vIdx?ACCENT:C.b2,border:"none",cursor:"pointer",transition:"all .2s",padding:0}}/>))}</div>
            </div>
          );
        })()}

        {/* ══ BOLSOS ══ — Contas (com Cartões aninhado dentro)/Caixinhas/Investimentos/
            Dívidas e Financiamentos (5ª seção, 25/08/2026 — antes era aba própria),
            com editar/apagar inline (antes só em Config, que agora só guarda o que não
            tem outro lugar) */}
        {!page&&tab==="bolsos"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Contas</span><Btn sm full={false} onClick={()=>openSh("addAcc",{bankId:banks[0]?.id||"",name:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM CONTAS" value={fmt(totAcc)} color={ACCENT} C={C}/>
            {accs.map(ac=>{const bk2=bkOf(ac.bankId);const accColor=ac.isCash?"#f59e0b":(bk2?.color||ACCENT);const bal=accBal(ac);return(<div key={ac.id} onClick={()=>nav("account",ac.id)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:accColor+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n={ac.isCash?"wallet":"bank"} size={16} color={accColor}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{ac.isCash?"Carteira":bk2?.name}</div><div style={{fontSize:10,color:C.muted}}>{ac.isCash?"Dinheiro":ac.name}</div></div><div style={{fontSize:16,fontWeight:900,color:bal>=0?ACCENT:"#ef4444"}}>{fmt(bal)}</div>{!ac.isCash&&(<><button onClick={e=>{e.stopPropagation();openSh("editAcc",{id:ac.id,bankId:ac.bankId,name:ac.name});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();delAcc(ac.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></>)}</div></div>);})}
            {/* Cartões aninhado dentro de Contas (reorganização 23/08/2026, ver 04 Bugs
                Conhecidos) — divisor mais leve que o das outras seções, pra ler como
                subseção de Contas em vez de seção irmã */}
            <div style={{height:1,background:C.b1,margin:"12px 0",opacity:.6}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:11,fontWeight:800,color:C.muted}}>Cartões</span><Btn sm full={false} onClick={()=>openSh("addCard",{bankId:banks[0]?.id||"",name:"",limit:5000,closeDay:10,dueDay:25,color:ACCENT})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM FATURAS" value={fmt(totCardDebt)} color="#8b5cf6" C={C}/>
            {cards.map(cd=>{const stmts=getStmts(cd);const debt=stmts.reduce((s,st)=>s+st.total,0);const used=Math.min(100,Math.round((debt/cd.limit)*100));return(<div key={cd.id} onClick={()=>nav("card",cd.id)} style={{background:C.card,border:"1px solid "+cd.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:cd.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="card" size={16} color={cd.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{cd.name}</div><div style={{fontSize:9,color:C.muted}}>Fecha {cd.closeDay} · Vence {cd.dueDay}</div></div><button onClick={e=>{e.stopPropagation();openSh("editCard",{id:cd.id,bankId:cd.bankId,name:cd.name,limit:cd.limit,closeDay:cd.closeDay,dueDay:cd.dueDay,color:cd.color});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();delCard(cd.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:used+"%",background:used>80?"#ef4444":used>50?"#f59e0b":cd.color,borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Usado: {fmt(debt)}</span><span>Limite: {fmt(cd.limit)}</span></div></div>);})}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Caixinhas</span><Btn sm full={false} onClick={()=>openSh("addBox",{name:"",goal:0,color:ACCENT,rate:0,rateUnit:"ano"})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM CAIXINHAS" value={fmt(totBox)} color="#06b6d4" C={C}/>
            {boxes.map(bx=>{const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));return(<div key={bx.id} onClick={()=>nav("box",bx.id)} style={{background:C.card,border:"1px solid "+bx.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:bx.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="piggy" size={16} color={bx.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{bx.name}</div><div style={{fontSize:9,color:C.muted}}>Meta: {fmt(bx.goal)}{bx.targetDate?" · até "+bx.targetDate.split("-").reverse().join("/"):""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:bx.color}}>{fmt(bx.balance)}</div><div style={{fontSize:9,color:C.muted}}>{pct}%</div></div><button onClick={e=>{e.stopPropagation();openSh("editBox",{id:bx.id,name:bx.name,goal:bx.goal,targetDate:bx.targetDate||"",color:bx.color,rate:bx.rate||0,rateUnit:bx.rateUnit||"ano"});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();delBox(bx.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div></div>);})}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Investimentos</span><Btn sm full={false} onClick={()=>openSh("addInv",{bankId:banks[0]?.id||"",subCat:"rf_pub",name:"",invested:0,balance:0,rate:"",maturity:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL INVESTIDO" value={fmt(totInv)} color="#f59e0b" C={C}/>
            {ICAT.map(cat=>{const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));const tot=ci.reduce((s,i)=>s+i.balance,0);const gain=tot-ci.reduce((s,i)=>s+i.invested,0);return(<div key={cat.id} onClick={()=>nav("inv",cat.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",background:C.card,border:"1px solid "+(ci.length?cat.color+"22":C.b1),borderRadius:12,marginBottom:8,cursor:"pointer",opacity:ci.length?1:.5}}><div style={{width:10,height:10,borderRadius:"50%",background:cat.color}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{cat.label}</div>{ci.length>0&&<div style={{fontSize:9,color:gain>=0?"#10b981":"#ef4444",fontWeight:600}}>{gain>=0?"+":""}{fmt(gain)}</div>}{ci.length===0&&<div style={{fontSize:9,color:C.muted}}>Nenhum ativo</div>}</div>{ci.length>0&&<div style={{fontSize:14,fontWeight:800,color:cat.color}}>{fmt(tot)}</div>}<Ico n="chev" size={12} color={C.muted}/></div>);})}
            {/* Dívidas e Financiamentos — era aba própria no rodapé, virou 5ª seção de
                Bolsos em 25/08/2026 (usuário: "consigo ver tudo numa única aba") */}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div id="yesod-dividas" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Dívidas e Financiamentos</span><Btn sm full={false} onClick={()=>openSh("addDebt",{name:"",credor:"",totalParcelas:12,parcelasPagas:0,valorParcela:0,dueDay:10,startDate:today,color:"#ef4444",valorRecebido:0,accId:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM DÍVIDAS" value={fmt(totDebtRem)} color="#ef4444" C={C}/>
            {debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}
            {debts.map(d=>{const restantes=d.totalParcelas-d.parcelasPagas;const saldo=restantes*d.valorParcela;const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} onClick={()=>nav("debt",d.id)} style={{background:C.card,border:"1px solid "+d.color+"33",borderRadius:14,padding:14,marginBottom:10,cursor:"pointer"}}><div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:d.color,marginTop:5,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{d.name}</div><div style={{fontSize:9,color:C.muted}}>{d.credor&&<span style={{color:d.color}}>{d.credor} </span>}{fmt(d.valorParcela)}/mês</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:d.color}}>{fmt(saldo)}</div><div style={{fontSize:9,color:C.muted}}>saldo devedor</div></div><button onClick={e=>{e.stopPropagation();delDebt(d.id);}} style={{background:C.b1,border:"none",borderRadius:99,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={10} color={C.muted}/></button></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>Pago: {pct}% · {d.parcelasPagas}/{d.totalParcelas} parcelas</div></div>);})}
          </div>
        )}

        {/* ══ OBJETIVOS ══ — aba própria desde 25/08/2026 (antes: seção "IF" dentro da aba
            Yesod, e checklist de Metas dentro da Visão Geral). Junta o objetivo "fixo" do
            módulo (Independência Financeira) com metas livres criadas pelo usuário, no
            mesmo espírito de múltiplos objetivos do Hod. Vista colapsada (só o card
            principal, 25/08/2026 — usuário achou a tela cheia demais por padrão): tocar no
            card abre o detalhe completo (stats, taxa de poupança, editar meta, outras
            metas) em `page.type==="goalsDetail"`, ver InlineBlock acima. */}
        {!page&&tab==="goals"&&(function GoalsTab(){
          const ifNeeded=ifGoal||ifMonthly*300;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
          return(<div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <Btn sm full={false} onClick={()=>openSh("addYGoal",{title:"",xp:100})}><Ico n="plus" size={11}/> Objetivo</Btn>
            </div>
            <div onClick={()=>nav("goalsDetail")} style={{cursor:"pointer",background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div>
              <div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div>
              <div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div>
            </div>
          </div>);
        })()}

        {/* ══ CONFIG ══ — só o que não tem equivalente em outra tela (Contas/Cartões/
            Caixinhas/Investimentos passaram a ter editar/apagar direto em Bolsos, 01/08/2026) */}
        {!page&&tab==="cfg"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            {[
              {title:"Bancos",items:banks,addSh:"addBank",addInit:{name:"",color:ACCENT},render:b=><div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/><span style={{flex:1,fontSize:12,fontWeight:600}}>{b.name}</span><button onClick={()=>openSh("editBank",{id:b.id,name:b.name,color:b.color})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delBank(b.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Categorias de Saída",items:catsOut,addSh:"addCatOut",addInit:{name:""},render:c=><div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><span style={{flex:1,fontSize:12,fontWeight:600}}>{c}</span><button onClick={()=>delCatOut(c)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Categorias de Entrada",items:catsIn,addSh:"addCatIn",addInit:{name:""},render:c=><div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><span style={{flex:1,fontSize:12,fontWeight:600}}>{c}</span><button onClick={()=>delCatIn(c)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Pessoas p/ Dividir Despesas",items:splitPeople,addSh:"addSplitPerson",addInit:{name:""},render:p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><span style={{flex:1,fontSize:12,fontWeight:600}}>{p.name}</span><button onClick={()=>delSplitPerson(p.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>}
            ].map(sec=>(<div key={sec.title} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:12,fontWeight:700}}>{sec.title}</span><Btn sm full={false} onClick={()=>openSh(sec.addSh,sec.addInit)}><Ico n="plus" size={11}/> Adicionar</Btn></div>{sec.items.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma categoria</div>}{sec.items.map(item=>sec.render(item))}</div>))}

            {/* Recorrências */}
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700}}>Recorrências</span>
              {recurrings.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma recorrência — crie uma marcando a frequência ao lançar</div>}
              {recurrings.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginTop:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:r.active?(r.type==="in"?"#16a34a":"#ef4444"):C.b2,flexShrink:0}}/>
                  <div style={{flex:1,opacity:r.active?1:.5}}>
                    <div style={{fontSize:12,fontWeight:600,textDecoration:r.active?"none":"line-through"}}>{r.desc}</div>
                    <div style={{fontSize:9,color:C.muted}}>{fmt(r.amount)} · {FREQ_LABELS[r.freq]} · próxima {r.nextDate}</div>
                  </div>
                  <button onClick={()=>toggleRecurring(r.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.muted}}>{r.active?"⏸":"▶"}</button>
                  <button onClick={()=>delRecurring(r.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{const a=tab===t.id&&!page;return(<button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}><div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}><Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/></div>{a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}{!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}</button>);})}
      </div>

      {/* ══ SHEETS ══ */}
      {sh==="launch"&&(
        <Sheet title="Novo Lançamento" onClose={close} C={C}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT},{v:"transfer",l:"Transferir",c:"#8b5cf6"}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?catsIn[0]:catsOut[0]})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div>
          <FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} placeholder="Ex: Supermercado" C={C}/>
          <FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/>
          <FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/>
          {f.ltype!=="transfer"&&<FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?catsIn:catsOut).map(c=>({v:c,l:c}))} C={C}/>}
          {f.ltype!=="transfer"&&(<div style={{marginBottom:12}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>RECORRÊNCIA</div><div style={{display:"flex",gap:6}}>{[{v:"",l:"Único"},{v:"monthly",l:"Mensal"},{v:"weekly",l:"Semanal"},{v:"yearly",l:"Anual"}].map(o=>(<button key={o.v} onClick={()=>F({recurring:o.v})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+((f.recurring||"")===o.v?ACCENT:C.b2),background:(f.recurring||"")===o.v?ACCENT+"18":"transparent",color:(f.recurring||"")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div></div>)}
          {f.ltype==="transfer"&&(<div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ORIGEM</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({fromKind:o.v,fromId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.fromKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.fromKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.fromKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
            <FS label="" value={f.fromId||""} onChange={v=>F({fromId:v})} opts={[{v:"",l:"Selecione..."},...((f.fromKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:accLabel(a,banks)})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><div style={{width:24,height:24,borderRadius:"50%",background:C.b1,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="down" size={12} color={C.muted}/></div></div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>DESTINO</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({toKind:o.v,toId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.toKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.toKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.toKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
            <FS label="" value={f.toId||""} onChange={v=>F({toId:v})} opts={[{v:"",l:"Selecione..."},...((f.toKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:(bkOf(a.bankId)?.name||"")+" - "+a.name})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
          </div>)}
          {f.ltype!=="transfer"&&f.lockCash&&(<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Registrado na Carteira (dinheiro)</div>)}
          {f.ltype!=="transfer"&&!f.lockCash&&(<div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>MEIO DE PAGAMENTO</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>{PAY_METHODS.map(m=>(<button key={m.v} onClick={()=>F({method:m.v})} style={{padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+(f.method===m.v?ACCENT:C.b2),background:f.method===m.v?ACCENT+"18":"transparent",color:f.method===m.v?ACCENT:C.text}}>{m.l}</button>))}</div>
            {f.method==="credito"&&(<div><FS label="Cartão" value={f.cardId||""} onChange={v=>F({cardId:v})} opts={cardOpts()} C={C}/>{f.ltype==="out"&&<FI label="Parcelas" value={f.installments||1} onChange={v=>F({installments:Math.max(1,v)})} type="number" min={1} C={C}/>}</div>)}
            {["pix","debito","ted"].includes(f.method||"")&&<FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
            {f.method==="dinheiro"&&<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Registrado na Carteira (dinheiro)</div>}
          </div>)}
          {f.ltype==="out"&&f.method!=="credito"&&(<div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>DIVIDIR DESPESA</div>
            <div style={{display:"flex",gap:6,marginBottom:f.splitOn?10:0}}>
              <button onClick={()=>F({splitOn:false})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!f.splitOn?ACCENT:C.b2),background:!f.splitOn?ACCENT+"18":"transparent",color:!f.splitOn?ACCENT:C.text}}>Não</button>
              <button onClick={()=>F({splitOn:true,splitPersonId:f.splitPersonId||splitPeople[0]?.id,splitPercent:f.splitPercent??50})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.splitOn?ACCENT:C.b2),background:f.splitOn?ACCENT+"18":"transparent",color:f.splitOn?ACCENT:C.text}}>Sim</button>
            </div>
            {f.splitOn&&(splitPeople.length===0?(
              <div style={{fontSize:11,color:C.muted}}>Cadastre alguém em Config → Pessoas antes de dividir.</div>
            ):(<>
              <FS label="Dividir com" value={f.splitPersonId||splitPeople[0].id} onChange={v=>F({splitPersonId:v})} opts={splitPeople.map(p=>({v:p.id,l:p.name}))} C={C}/>
              <FI label="% que a outra pessoa paga" value={f.splitPercent??50} onChange={v=>F({splitPercent:v})} type="number" min={0} C={C}/>
            </>))}
          </div>)}
          <Btn color={f.ltype==="transfer"?"#8b5cf6":f.ltype==="in"?ACCENT:"#ef4444"} onClick={launch}>{f.ltype==="transfer"?"Confirmar Transferência":f.ltype==="in"?"Registrar Entrada":"Registrar Saída"}</Btn>
        </Sheet>
      )}

      {sh==="addBudget"&&(<Sheet title="Nova Categoria de Orçamento" onClose={close} C={C}><FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={catsOut.map(c=>({v:c,l:c}))} C={C}/><FI label="Limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.limit)return;setBudgets(p=>[...p,{id:"bg"+uid(),cat:f.cat||catsOut[0],limit:Number(f.limit)}]);toast_("Orçamento adicionado");close();}}>Adicionar</Btn></Sheet>)}
      {sh==="editBudget"&&(<Sheet title="Editar Orçamento" onClose={close} C={C}><div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>{f.cat}</div><FI label="Novo limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{setBudgets(p=>p.map(b=>b.id===f.id?{...b,limit:Number(f.limit)}:b));toast_("Limite atualizado");close();}}>Salvar</Btn></Sheet>)}
      {sh==="addYHabit"&&(<Sheet title="Novo Hábito Financeiro" onClose={close} C={C}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Revisar o orçamento" C={C}/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}]} C={C}/><FI label="XP por conclusão" value={f.xp||15} onChange={v=>F({xp:v})} type="number" min={5} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.title?.trim())return;setYHabits(p=>[...p,{id:"yh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false}]);toast_("Hábito criado");close();}}><Ico n="check" size={14}/> Criar Hábito</Btn></Sheet>)}
      {sh==="addYGoal"&&(<Sheet title="Nova Meta Financeira" onClose={close} C={C}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Quitar dívida do cartão" C={C}/><FI label="XP de recompensa" value={f.xp||100} onChange={v=>F({xp:v})} type="number" min={10} C={C}/><Btn color="#f59e0b" onClick={()=>{if(!f.title?.trim())return;setYGoals(p=>[...p,{id:"yg"+uid(),title:f.title,xp:Number(f.xp)||100,done:false}]);toast_("Meta criada","#f59e0b");close();}}><Ico n="check" size={14}/> Criar Meta</Btn></Sheet>)}
      {sh==="editTx"&&(<Sheet title="Editar Lançamento" onClose={close} C={C}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?catsIn[0]:catsOut[0]})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div>
        <FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} C={C}/>
        <FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/>
        <FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/>
        <FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?catsIn:catsOut).map(c=>({v:c,l:c}))} C={C}/>
        {/* Método agora é livre — antes ficava travado em "dinheiro" (Carteira) ou não-dinheiro
            conforme a conta de origem, o que impedia mover o lançamento entre os dois (limitação
            conhecida). Trocar o método aqui muda a conta de destino no saveEditTx. */}
        <FS label="Método" value={f.method||"pix"} onChange={v=>F({method:v})} opts={PAY_METHODS.filter(m=>m.v!=="credito")} C={C}/>
        {f.method==="dinheiro"&&<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Será movido para a Carteira (dinheiro)</div>}
        {f.method!=="dinheiro"&&<FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
        {f.ltype==="out"&&f.method!=="credito"&&(<div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>DIVIDIR DESPESA</div>
          <div style={{display:"flex",gap:6,marginBottom:f.splitOn?10:0}}>
            <button onClick={()=>F({splitOn:false})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!f.splitOn?ACCENT:C.b2),background:!f.splitOn?ACCENT+"18":"transparent",color:!f.splitOn?ACCENT:C.text}}>Não</button>
            <button onClick={()=>F({splitOn:true,splitPersonId:f.splitPersonId||splitPeople[0]?.id,splitPercent:f.splitPercent??50})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.splitOn?ACCENT:C.b2),background:f.splitOn?ACCENT+"18":"transparent",color:f.splitOn?ACCENT:C.text}}>Sim</button>
          </div>
          {f.splitOn&&(splitPeople.length===0?(
            <div style={{fontSize:11,color:C.muted}}>Cadastre alguém em Config → Pessoas antes de dividir.</div>
          ):(<>
            <FS label="Dividir com" value={f.splitPersonId||splitPeople[0].id} onChange={v=>F({splitPersonId:v})} opts={splitPeople.map(p=>({v:p.id,l:p.name}))} C={C}/>
            <FI label="% que a outra pessoa paga" value={f.splitPercent??50} onChange={v=>F({splitPercent:v})} type="number" min={0} C={C}/>
            <div style={{display:"flex",gap:6,marginTop:2}}>
              <button onClick={()=>F({splitSettled:false})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!f.splitSettled?"#f59e0b":C.b2),background:!f.splitSettled?"#f59e0b18":"transparent",color:!f.splitSettled?"#f59e0b":C.text}}>Pendente</button>
              <button onClick={()=>F({splitSettled:true})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.splitSettled?ACCENT:C.b2),background:f.splitSettled?ACCENT+"18":"transparent",color:f.splitSettled?ACCENT:C.text}}>Acertado</button>
            </div>
          </>))}
        </div>)}
        <Btn color={ACCENT} onClick={saveEditTx}>Salvar</Btn>
      </Sheet>)}
      {sh==="editIF"&&(<Sheet title="Meta de Independência Financeira" onClose={close} C={C}><div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>Defina o patrimônio necessário para viver de renda (regra dos 4% ao ano).</div><FI label="Patrimônio alvo (R$)" value={f.ifGoal||0} onChange={v=>F({ifGoal:v})} type="number" min={0} C={C}/><div style={{textAlign:"center",fontSize:11,color:C.muted,marginBottom:12}}>— ou defina pela renda —</div><FI label="Renda mensal desejada (R$)" value={f.ifMonthly||0} onChange={v=>F({ifMonthly:v,ifGoal:Number(v)*300})} type="number" min={0} C={C}/>{(f.ifGoal||0)>0&&<div style={{background:C.b1,borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:11,color:C.dim}}>Renda de {fmt((f.ifGoal||0)/300)}/mês pela regra dos 4%</div>}<Btn color={ACCENT} onClick={()=>{setIfGoal(Number(f.ifGoal)||0);setIfMonthly(Number(f.ifMonthly)||0);toast_("Meta atualizada");close();}}>Salvar</Btn></Sheet>)}
      {(sh==="addBank"||sh==="editBank")&&(<Sheet title={sh==="addBank"?"Novo Banco":"Editar Banco"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Nubank" C={C}/><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBank"?addBank:editBank}>Salvar</Btn></Sheet>)}
      {sh==="addCatOut"&&(<Sheet title="Nova Categoria de Saída" onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Pet" C={C}/><Btn color={ACCENT} onClick={addCatOut}>Adicionar</Btn></Sheet>)}
      {sh==="addCatIn"&&(<Sheet title="Nova Categoria de Entrada" onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Dividendos" C={C}/><Btn color={ACCENT} onClick={addCatIn}>Adicionar</Btn></Sheet>)}
      {sh==="addSplitPerson"&&(<Sheet title="Nova Pessoa" onClose={close} C={C}><div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>Pra dividir despesas recorrentes (ex: conta de luz 50/50) e acompanhar o que já foi acertado.</div><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Esposa" C={C}/><Btn color={ACCENT} onClick={addSplitPerson}>Adicionar</Btn></Sheet>)}

      {(sh==="addAcc"||sh==="editAcc")&&(<Sheet title={sh==="addAcc"?"Nova Conta":"Editar Conta"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Conta Corrente" C={C}/><Btn onClick={sh==="addAcc"?addAcc:editAcc}>Salvar</Btn></Sheet>)}
      {(sh==="addCard"||sh==="editCard")&&(<Sheet title={sh==="addCard"?"Novo Cartão":"Editar Cartão"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Visa Platinum" C={C}/><FI label="Limite (R$)" value={f.limit||5000} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Dia fechamento" value={f.closeDay||10} onChange={v=>F({closeDay:v})} type="number" min={1} C={C}/><FI label="Dia vencimento" value={f.dueDay||25} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addCard"?addCard:editCard}>Salvar</Btn></Sheet>)}
      {(sh==="addBox"||sh==="editBox")&&(<Sheet title={sh==="addBox"?"Nova Caixinha":"Editar Caixinha"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Viagem Europa" C={C}/><FI label="Meta (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number" min={0} C={C}/><FI label="Data alvo (opcional)" value={f.targetDate||""} onChange={v=>F({targetDate:v})} type="date" C={C}/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>TAXA DE JUROS (RENDIMENTO ESPERADO)</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><FI value={f.rate||0} onChange={v=>F({rate:v})} type="number" min={0} C={C}/></div>
            <div style={{display:"flex",gap:6}}>{[{v:"ano",l:"% ao ano"},{v:"mes",l:"% ao mês"}].map(o=>(<button key={o.v} onClick={()=>F({rateUnit:o.v})} style={{padding:"0 12px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:11,border:"1.5px solid "+((f.rateUnit||"ano")===o.v?ACCENT:C.b2),background:(f.rateUnit||"ano")===o.v?ACCENT+"18":"transparent",color:(f.rateUnit||"ano")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
          </div>
        </div>
        <ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBox"?addBox:editBox}>Salvar</Btn></Sheet>)}
      {(sh==="addDebt"||sh==="editDebt")&&(<Sheet title={sh==="addDebt"?"Nova Dívida":"Editar Dívida"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Financiamento Carro" C={C}/><FI label="Credor" value={f.credor||""} onChange={v=>F({credor:v})} placeholder="Ex: Banco Itau" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Total de parcelas" value={f.totalParcelas||12} onChange={v=>F({totalParcelas:v})} type="number" min={1} C={C}/><FI label="Parcelas pagas" value={f.parcelasPagas||0} onChange={v=>F({parcelasPagas:v})} type="number" min={0} C={C}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Valor da parcela (R$)" value={f.valorParcela||0} onChange={v=>F({valorParcela:v})} type="number" min={0} C={C}/><FI label="Dia vencimento" value={f.dueDay||10} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div><FI label="Data de início" value={f.startDate||today} onChange={v=>F({startDate:v})} type="date" C={C}/>
        {sh==="addDebt"&&(<>
          <div style={{fontSize:10,color:C.muted,marginBottom:8,lineHeight:1.6}}>O valor recebido pode ser diferente da soma das parcelas (que já inclui juros) — é o que efetivamente cai numa conta.</div>
          <FI label="Valor recebido (R$)" value={f.valorRecebido||0} onChange={v=>F({valorRecebido:v})} type="number" min={0} C={C}/>
          <FS label="Creditar em" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        </>)}
        <ColorPicker value={f.color||"#ef4444"} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||"#ef4444"} onClick={sh==="addDebt"?addDebt:editDebt}>Salvar</Btn></Sheet>)}
      {sh==="payDebt"&&(<Sheet title="Registrar Parcela" onClose={close} C={C}><FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Número de parcelas" value={f.qtd||1} onChange={v=>F({qtd:Math.max(1,v)})} type="number" min={1} C={C}/><Btn color={ACCENT} onClick={payDebt}><Ico n="check" size={14}/> Confirmar</Btn></Sheet>)}
      {sh==="amortizarDivida"&&(<Sheet title="Amortizar" onClose={close} C={C}>
        <FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>AMORTIZAR POR</div>
          <div style={{display:"flex",gap:8}}>{[{v:"valor",l:"Valor (R$)"},{v:"parcelas",l:"Nº de parcelas"}].map(o=>(<button key={o.v} onClick={()=>F({mode:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+((f.mode||"valor")===o.v?ACCENT:C.b2),background:(f.mode||"valor")===o.v?ACCENT+"18":"transparent",color:(f.mode||"valor")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
        </div>
        {(f.mode||"valor")==="valor"?(<>
          <FI label="Valor a amortizar (R$)" value={f.value||0} onChange={v=>F({value:v})} type="number" min={0} C={C}/>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>EFEITO</div>
            <div style={{display:"flex",gap:8}}>{[{v:"prazo",l:"Reduzir prazo"},{v:"parcela",l:"Reduzir parcela"}].map(o=>(<button key={o.v} onClick={()=>F({effect:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+((f.effect||"prazo")===o.v?ACCENT:C.b2),background:(f.effect||"prazo")===o.v?ACCENT+"18":"transparent",color:(f.effect||"prazo")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
          </div>
        </>):(<FI label="Número de parcelas" value={f.qtd||1} onChange={v=>F({qtd:Math.max(1,v)})} type="number" min={1} C={C}/>)}
        <Btn color={ACCENT} onClick={amortizarDivida}><Ico n="check" size={14}/> Confirmar Amortização</Btn>
      </Sheet>)}
      {sh==="quitarDivida"&&(<Sheet title="Quitar Dívida" onClose={close} C={C}>
        <div style={{background:C.b1,borderRadius:10,padding:"11px 13px",marginBottom:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>SALDO DEVEDOR</div><div style={{fontSize:20,fontWeight:900,color:"#ef4444"}}>{fmt(f.remaining||0)}</div></div>
        <FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <Btn color="#ef4444" onClick={quitarDivida}><Ico n="check" size={14}/> Confirmar Quitação</Btn>
      </Sheet>)}
      {(sh==="addInv"||sh==="editInv")&&(<Sheet title={sh==="addInv"?"Novo Investimento":"Editar Investimento"} onClose={close} C={C}>{sh==="addInv"&&<><FS label="Banco/Corretora" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FS label="Categoria" value={f.subCat||"rf_pub"} onChange={v=>F({subCat:v})} opts={iCatOpts()} C={C}/></>}<FI label="Nome do ativo" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Tesouro IPCA+" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Aplicado (R$)" value={f.invested||0} onChange={v=>F({invested:v})} type="number" min={0} C={C}/><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/></div><FI label="Taxa referência" value={f.rate||""} onChange={v=>F({rate:v})} placeholder="Ex: IPCA+5.5%" C={C}/><Btn color={ACCENT} onClick={sh==="addInv"?addInv:editInv}>Salvar</Btn></Sheet>)}
      {sh==="checkin"&&(<Sheet title="Atualizar Saldo" onClose={close} C={C}><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={checkin}><Ico n="refresh" size={14}/> Salvar</Btn></Sheet>)}
      {sh==="invAport"&&(<Sheet title="Aportar" onClose={close} C={C}><FS label="De qual conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color={ACCENT} onClick={invAportar}><Ico n="up" size={14}/> Confirmar Aporte</Btn></Sheet>)}
      {sh==="invResgate"&&(<Sheet title="Resgatar" onClose={close} C={C}><FS label="Pra qual conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color="#ef4444" onClick={invResgatar}><Ico n="down" size={14}/> Confirmar Resgate</Btn></Sheet>)}
      {sh==="boxmove"&&(<Sheet title="Movimentar Caixinha" onClose={close} C={C}><div style={{display:"flex",gap:8,marginBottom:12}}>{[{v:"in",l:"Depositar",c:ACCENT},{v:"out",l:"Retirar",c:"#ef4444"}].map(o=>(<button key={o.v} onClick={()=>F({moveType:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+o.c,background:(f.moveType||"in")===o.v?o.c:"transparent",color:(f.moveType||"in")===o.v?"#fff":o.c}}>{o.l}</button>))}</div><FS label={(f.moveType||"in")==="in"?"De onde sai o dinheiro":"Pra onde vai o dinheiro"} value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color={(f.moveType||"in")==="in"?ACCENT:"#ef4444"} onClick={boxMoveLinked}>Confirmar {(f.moveType||"in")==="in"?"Depósito":"Retirada"}</Btn></Sheet>)}

      {sh==="editCards"&&(
        <Sheet title="Personalizar Indicadores" onClose={close} C={C}>
          <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>
            Toque para ativar/desativar. Use ▲▼ para reordenar.
          </div>
          {/* Ativos */}
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ATIVOS ({yesodCards.length})</div>
          {yesodCards.length===0&&(
            <div style={{textAlign:"center",padding:12,color:C.muted,fontSize:11,background:C.bg,borderRadius:9,marginBottom:12}}>
              Nenhum indicador ativo
            </div>
          )}
          {yesodCards.map((id,i)=>{
            const labels={poupanca:"Poupança",if:"Prog. IF",dividas:"Dívidas",orcamento:"Orçamento",habitos:"Hábitos",metas:"Metas",patrimonio:"Patrimônio",receita:"Receita",despesa:"Despesas",saldo_mes:"Saldo Mensal",investido:"Investido",contas:"Contas"};
            const colors={poupanca:"#16a34a",if:"#06b6d4",dividas:"#f97316",orcamento:"#8b5cf6",habitos:ACCENT,metas:"#f59e0b",patrimonio:ACCENT,receita:"#16a34a",despesa:"#ef4444",saldo_mes:ACCENT,investido:"#f59e0b",contas:ACCENT};
            return(
              <div key={id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",
                background:C.card,border:"1px solid "+(colors[id]||ACCENT)+"33",borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:colors[id]||ACCENT,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12,fontWeight:600,color:C.text}}>{labels[id]||id}</span>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>setYesodCards(p=>{const n=[...p];if(i>0){[n[i-1],n[i]]=[n[i],n[i-1]];}return n;})}
                    style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={i===0}>▲</button>
                  <button onClick={()=>setYesodCards(p=>{const n=[...p];if(i<n.length-1){[n[i],n[i+1]]=[n[i+1],n[i]];}return n;})}
                    style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={i===yesodCards.length-1}>▼</button>
                  <button onClick={()=>setYesodCards(p=>p.filter(x=>x!==id))}
                    style={{background:"#ef444420",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="x" size={11}/>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Disponíveis */}
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,margin:"12px 0 8px"}}>DISPONÍVEIS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[
              {id:"poupanca",l:"Poupança",c:"#16a34a"},
              {id:"if",l:"Prog. IF",c:"#06b6d4"},
              {id:"dividas",l:"Dívidas",c:"#f97316"},
              {id:"orcamento",l:"Orçamento",c:"#8b5cf6"},
              {id:"habitos",l:"Hábitos",c:ACCENT},
              {id:"metas",l:"Metas",c:"#f59e0b"},
              {id:"patrimonio",l:"Patrimônio",c:ACCENT},
              {id:"receita",l:"Receita",c:"#16a34a"},
              {id:"despesa",l:"Despesas",c:"#ef4444"},
              {id:"saldo_mes",l:"Saldo Mensal",c:ACCENT},
              {id:"investido",l:"Investido",c:"#f59e0b"},
              {id:"contas",l:"Contas",c:ACCENT},
            ].filter(d=>!yesodCards.includes(d.id)).map(d=>(
              <button key={d.id} onClick={()=>setYesodCards(p=>[...p,d.id])}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",
                  background:C.card,border:"1px solid "+C.b1,borderRadius:10,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:d.c,flexShrink:0}}/>
                <span style={{fontSize:11,color:C.text,fontWeight:500}}>{d.l}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}

    </div>
  );
}
