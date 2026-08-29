import { useState, useEffect, useRef, useMemo } from "react";

const ACCENT = "#10b981";
const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#44556a", dim:"#7a8fa8", nav:"#060b12" };
const LIGHT = { bg:"#eef1f9", surface:"#ffffff",  card:"#f8faff", b1:"#c4cfe6", b2:"#98aacf",  text:"#07101e", muted:"#556080", dim:"#1e3060",  nav:"#eef1f9" };

const uid  = () => Math.random().toString(36).slice(2,8);
const fmt  = n  => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const tod  = () => new Date().toISOString().slice(0,10);
const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const addM = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0,10); };
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

const D_BANKS = [{id:"b1",name:"Nubank",color:"#8b5cf6"},{id:"b2",name:"Itau",color:"#f59e0b"},{id:"b3",name:"XP Invest",color:"#06b6d4"}];
const D_ACCS = [
  {id:"a1",bankId:"b1",name:"Conta Corrente",txs:[{id:"t1",desc:"Salario",amount:12000,type:"in",date:"2026-05-05",cat:"Salario",method:"pix"},{id:"t2",desc:"Aluguel",amount:2800,type:"out",date:"2026-05-10",cat:"Moradia",method:"pix"},{id:"t3",desc:"Supermercado",amount:450,type:"out",date:"2026-05-15",cat:"Alimentação",method:"debito"},{id:"t4",desc:"Aulas",amount:1500,type:"in",date:"2026-05-20",cat:"Freelance",method:"pix"}]},
  {id:"a2",bankId:"b2",name:"Conta Corrente",txs:[{id:"t5",desc:"Transferência recebida",amount:2000,type:"in",date:"2026-05-06",cat:"Transferência",method:"ted"}]},
];
const D_CARDS = [
  {id:"c1",bankId:"b1",name:"Nubank Roxinho",limit:8000,closeDay:10,dueDay:25,color:"#8b5cf6",txs:[{id:"ct1",desc:"Spotify",amount:35,date:"2026-05-03",cat:"Serviços",installments:1,type:"out"},{id:"ct2",desc:"Jantar",amount:280,date:"2026-05-18",cat:"Alimentação",installments:1,type:"out"},{id:"ct3",desc:"Notebook",amount:4800,date:"2026-05-07",cat:"Tecnologia",installments:12,type:"out"}]},
  {id:"c2",bankId:"b2",name:"Itau Visa Gold",limit:15000,closeDay:5,dueDay:20,color:"#f59e0b",txs:[{id:"ct4",desc:"Academia",amount:130,date:"2026-05-02",cat:"Saude",installments:1,type:"out"},{id:"ct5",desc:"Tenis",amount:900,date:"2026-05-08",cat:"Vestuário",installments:3,type:"out"}]},
];
const D_BOXES = [{id:"bx1",name:"Reserva de Emergencia",goal:20000,color:ACCENT,balance:8000},{id:"bx2",name:"Viagem Buenos Aires",goal:5000,color:"#06b6d4",balance:1200},{id:"bx3",name:"Fundo Anual",goal:10000,color:"#f59e0b",balance:3500}];
const D_DEBTS = [{id:"d1",name:"Financiamento Carro",credor:"Banco Itau",totalParcelas:48,parcelasPagas:12,valorParcela:1250,dueDay:10,startDate:"2024-01-10",color:"#ef4444"},{id:"d2",name:"Empréstimo Pessoal",credor:"Nubank",totalParcelas:10,parcelasPagas:4,valorParcela:800,dueDay:15,startDate:"2024-06-15",color:"#f97316"}];
const ICAT = [{id:"rf",label:"Renda Fixa",color:ACCENT,sub:[{id:"rf_pub",label:"Títulos Públicos"},{id:"rf_priv",label:"Títulos Privados"},{id:"rf_fund",label:"Fundos RF"}]},{id:"rv",label:"Renda Variável",color:"#ef4444",sub:[{id:"rv_ac",label:"Ações"},{id:"rv_fii",label:"FIIs"},{id:"rv_etf",label:"ETFs"}]},{id:"mm",label:"Multimercado",color:"#8b5cf6",sub:[{id:"mm_f",label:"Fundos MM"}]},{id:"int",label:"Internacional",color:"#f97316",sub:[{id:"int_b",label:"BDRs"},{id:"int_e",label:"ETFs Globais"}]}];
const D_INVS = [{id:"i1",bankId:"b3",subCat:"rf_pub",name:"Tesouro IPCA+ 2029",invested:10000,balance:10420,rate:"IPCA+5.5%",maturity:"2029-08-15"},{id:"i2",bankId:"b3",subCat:"rf_priv",name:"CDB 120% CDI",invested:5000,balance:5180,rate:"120% CDI",maturity:"2027-03-10"},{id:"i3",bankId:"b3",subCat:"rv_ac",name:"PETR4",invested:3000,balance:3240,rate:"",maturity:""},{id:"i4",bankId:"b3",subCat:"rv_fii",name:"MXRF11",invested:2000,balance:2150,rate:"",maturity:""},{id:"i5",bankId:"b3",subCat:"mm_f",name:"Verde AM",invested:8000,balance:8340,rate:"",maturity:""}];

const CATS_OUT = ["Alimentação","Moradia","Transporte","Saude","Educação","Lazer","Vestuário","Serviços","Tecnologia","Assinaturas","Outros"];
const CATS_IN  = ["Salario","Freelance","Aluguel recebido","Reembolso","Outros"];
const PAY_METHODS = [{v:"credito",l:"Credito"},{v:"debito",l:"Debito"},{v:"pix",l:"PIX"},{v:"ted",l:"TED"},{v:"dinheiro",l:"Dinheiro"}];
const TABS = [{id:"yesod",icon:"treelife",label:"Yesod"},{id:"over",icon:"wallet",label:"Geral"},{id:"fluxo",icon:"activity",label:"Fluxo"},{id:"orc",icon:"alvo",label:"Orçamento"},{id:"bolsos",icon:"bank",label:"Bolsos"},{id:"debt",icon:"debt",label:"Dívidas"},{id:"inv",icon:"barchart",label:"Invest"},{id:"if",icon:"scale",label:"IF"},{id:"cfg",icon:"gear",label:"Config"}];
const COLOR_PALETTE = ["#8b5cf6","#6366f1","#3b82f6","#06b6d4","#10b981","#84cc16","#f59e0b","#f97316","#ef4444","#ec4899","#64748b","#0f172a"];

function Sheet({ title, onClose, C, children }) {
  return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}><div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,padding:"0 18px 34px",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}><div style={{width:32,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:15,fontWeight:700,color:C.text}}>{title}</span><button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={13} color={C.dim}/></button></div></div>{children}</div></div>);
}
function FI({ label, value, onChange, type="text", placeholder, min, C }) {
  return (<div style={{marginBottom:11}}>{label?<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>:null}<input type={type} value={value} placeholder={placeholder} min={min} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)} style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>);
}
function FS({ label, value, onChange, opts, C }) {
  return (<div style={{marginBottom:11}}>{label?<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>:null}<select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>);
}
function Btn({ children, onClick, color, sm, outline, full=true, style: s={} }) {
  const c = color||ACCENT;
  return (<button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"7px 13px":"11px 18px",borderRadius:10,cursor:"pointer",background:outline?"transparent":"linear-gradient(135deg,"+c+"dd,"+c+"88)",border:outline?"1.5px solid "+c:"none",color:outline?c:"#fff",fontWeight:700,fontSize:sm?11:13,width:full?"100%":"auto",...s}}>{children}</button>);
}
function ColorPicker({ value, onChange, C }) {
  const [open, setOpen] = useState(false);
  return (<div style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>COR</div><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>setOpen(o=>!o)} style={{width:36,height:36,borderRadius:10,background:value||ACCENT,border:"none",cursor:"pointer",flexShrink:0}}/><span style={{fontSize:11,color:C.muted}}>{open?"Escolha uma cor":"Toque para mudar"}</span></div>{open&&(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,padding:"10px",background:C.b1,borderRadius:12}}>{COLOR_PALETTE.map(c=>(<button key={c} onClick={()=>{onChange(c);setOpen(false);}} style={{width:32,height:32,borderRadius:8,background:c,border:"none",cursor:"pointer",boxShadow:value===c?"0 0 0 2px #fff, 0 0 0 4px "+c:"none"}}/>))}</div>)}</div>);
}

export default function App() {
  const [dark, setDark] = useState(false);
  const C = dark ? DARK : LIGHT;
  const [tab, setTab] = useState("yesod");
  const [page, setPage] = useState(null);
  const [banks, setBanks] = useState(D_BANKS);
  const [accs, setAccs] = useState(D_ACCS);
  const [cards, setCards] = useState(D_CARDS);
  const [boxes, setBoxes] = useState(D_BOXES);
  const [debts, setDebts] = useState(D_DEBTS);
  const [budgets, setBudgets] = useState([{id:"bg1",cat:"Alimentação",limit:800},{id:"bg2",cat:"Moradia",limit:3000},{id:"bg3",cat:"Transporte",limit:400},{id:"bg4",cat:"Lazer",limit:300},{id:"bg5",cat:"Saude",limit:500}]);
  const [overMonth, setOverMonth] = useState(0);
  const [fluxoView, setFluxoView] = useState(0);
  const [ifGoal, setIfGoal] = useState(300000);
  const [ifMonthly, setIfMonthly] = useState(5000);
  const touchXRef = useRef(0);
  const [patrimSnaps, setPatrimSnaps] = useState([]);
  const [invs, setInvs] = useState(D_INVS);
  const [toast, setToast] = useState(null);
  const [sh, setSh] = useState(null);
  const [f, setF] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [yHabits, setYHabits] = useState([{id:"yh1",title:"Registrar todos os lançamentos",freq:"Diário",done:false,xp:15},{id:"yh2",title:"Revisar saldo das contas",freq:"Semanal",done:false,xp:20},{id:"yh3",title:"Verificar faturas abertas",freq:"Semanal",done:false,xp:20},{id:"yh4",title:"Checar progresso do orçamento",freq:"Mensal",done:false,xp:30},{id:"yh5",title:"Atualizar saldo dos investimentos",freq:"Mensal",done:false,xp:25}]);
  const [yGoals, setYGoals] = useState([{id:"yg1",title:"Reserva de emergência (3 meses)",done:false,xp:200},{id:"yg2",title:"Orçamento respeitado 3 meses seguidos",done:false,xp:150},{id:"yg3",title:"Taxa de poupança acima de 20%",done:false,xp:100},{id:"yg4",title:"Quitar todas as dívidas",done:false,xp:300},{id:"yg5",title:"Atingir 25% da meta IF",done:false,xp:250},{id:"yg6",title:"Atingir 50% da meta IF",done:false,xp:400},{id:"yg7",title:"Liberdade Financeira 100%",done:false,xp:1000}]);
  const [finXp, setFinXp] = useState(0);
  const F = v => setF(x => ({...x,...v}));
  const toast_ = (msg, color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const [storageLoaded, setStorageLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const keys = ["fin_banks","fin_accs","fin_cards","fin_boxes","fin_debts","fin_invs","fin_budgets","fin_yhabits","fin_ygoals","fin_ifgoal","fin_ifmonthly","fin_finxp","fin_dark","fin_patrimsnaps"];
        for (const k of keys) {
          try {
            const r = await window.storage.get(k); if (!r) continue;
            const v = JSON.parse(r.value);
            if (k==="fin_banks") setBanks(v); if (k==="fin_accs") setAccs(v); if (k==="fin_cards") setCards(v);
            if (k==="fin_boxes") setBoxes(v); if (k==="fin_debts") setDebts(v); if (k==="fin_invs") setInvs(v);
            if (k==="fin_budgets") setBudgets(v); if (k==="fin_yhabits") setYHabits(v); if (k==="fin_ygoals") setYGoals(v);
            if (k==="fin_ifgoal") setIfGoal(v); if (k==="fin_ifmonthly") setIfMonthly(v); if (k==="fin_finxp") setFinXp(v);
            if (k==="fin_dark") setDark(v); if (k==="fin_patrimsnaps") setPatrimSnaps(v);
          } catch(_) {}
        }
      } finally { setStorageLoaded(true); }
    })();
  }, []);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_banks",JSON.stringify(banks)).catch(function InlineBlock(){}); }, [banks,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_accs",JSON.stringify(accs)).catch(function InlineBlock(){}); }, [accs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_cards",JSON.stringify(cards)).catch(function InlineBlock(){}); }, [cards,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_boxes",JSON.stringify(boxes)).catch(function InlineBlock(){}); }, [boxes,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_debts",JSON.stringify(debts)).catch(function InlineBlock(){}); }, [debts,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_invs",JSON.stringify(invs)).catch(function InlineBlock(){}); }, [invs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_budgets",JSON.stringify(budgets)).catch(function InlineBlock(){}); }, [budgets,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_yhabits",JSON.stringify(yHabits)).catch(function InlineBlock(){}); }, [yHabits,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_ygoals",JSON.stringify(yGoals)).catch(function InlineBlock(){}); }, [yGoals,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_ifgoal",JSON.stringify(ifGoal)).catch(function InlineBlock(){}); }, [ifGoal,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_ifmonthly",JSON.stringify(ifMonthly)).catch(function InlineBlock(){}); }, [ifMonthly,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_finxp",JSON.stringify(finXp)).catch(function InlineBlock(){}); }, [finXp,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_dark",JSON.stringify(dark)).catch(function InlineBlock(){}); }, [dark,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; window.storage.set("fin_patrimsnaps",JSON.stringify(patrimSnaps)).catch(function InlineBlock(){}); }, [patrimSnaps,storageLoaded]);

  const bkOf = id => banks.find(b=>b.id===id);
  const nav = (type,id) => setPage({type,id});
  const back = () => setPage(null);
  const close = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };
  const today = tod();

  const totAcc = accs.reduce((s,a)=>s+accBal(a),0);
  const totBox = boxes.reduce((s,b)=>s+b.balance,0);
  const totInv = invs.reduce((s,i)=>s+i.balance,0);
  const totCardDebt = cards.reduce((s,c)=>s+getStmts(c).reduce((ss,st)=>ss+st.total,0),0);
  const totDebtRem = debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
  const net = totAcc+totBox+totInv-totDebtRem;

  const getMonthStr = offset => { const d=new Date(); d.setMonth(d.getMonth()+offset); return d.toISOString().slice(0,7); };
  const monthLabel2 = ym => { const [y,m]=ym.split("-"); return MTHS[parseInt(m)-1]+"/"+y.slice(2); };
  const allTxs = () => { const txs=[]; accs.forEach(a=>(a.txs||[]).forEach(t=>txs.push({...t,source:"conta",sourceName:bkOf(a.bankId)?.name+" - "+a.name}))); cards.forEach(c=>(c.txs||[]).forEach(t=>txs.push({...t,type:t.type||"out",source:"cartao",sourceName:c.name}))); return txs; };
  const cashflowMonth = offset => { const ym=getMonthStr(offset); const txs=allTxs().filter(t=>t.date&&t.date.startsWith(ym)); const ins=txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0); const outs=txs.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0); return {ym,ins,outs,balance:ins-outs,txs}; };
  const budgetSpend = cat => { const ym=getMonthStr(0); return allTxs().filter(t=>t.type==="out"&&t.cat===cat&&t.date&&t.date.startsWith(ym)).reduce((s,t)=>s+t.amount,0); };
  const retroPatrimData = useMemo(() => {
    const months=[]; for(let i=-5;i<=0;i++){const d=new Date();d.setMonth(d.getMonth()+i);const ym=d.toISOString().slice(0,7);const endDate=ym+"-31";const accTotal=accs.reduce((s,a)=>s+(a.txs||[]).filter(t=>t.date<=endDate).reduce((ss,t)=>t.type==="in"?ss+t.amount:ss-t.amount,0),0);const debtTotal=debts.reduce((s,d2)=>{const paid=Math.min(d2.totalParcelas,Math.round((new Date(endDate)-new Date(d2.startDate+"T00:00:00"))/(1000*60*60*24*30)));return s+Math.max(0,d2.totalParcelas-paid)*d2.valorParcela;},0);months.push({ym,net:accTotal+totBox+totInv-debtTotal});}const snaps=[...patrimSnaps];months.forEach(m=>{if(!snaps.some(s=>s.ym===m.ym))snaps.push(m);});return snaps.sort((a,b)=>a.ym.localeCompare(b.ym));
  }, [accs, debts, totBox, totInv, patrimSnaps]);
  const retroPatrim = () => retroPatrimData;

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

  const analyzeFinances = () => {
    setAiLoading(true); setAiError(null);
    const cf=cashflowMonth(-1); const savRate=cf.ins>0?Math.round(((cf.ins-cf.outs)/cf.ins)*100):0;
    const catSpend={}; cf.txs.filter(t=>t.type==="out").forEach(t=>{catSpend[t.cat]=(catSpend[t.cat]||0)+t.amount;});
    const topCats=Object.entries(catSpend).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,v])=>c+": R$"+v.toFixed(0));
    const ifN=ifGoal||ifMonthly*300||1;
    const ctx={receita_mes:cf.ins,despesa_mes:cf.outs,saldo_mes:cf.balance,taxa_poupanca_pct:savRate,patrimonio_liquido:net,total_dividas:totDebtRem,total_investido:totInv,progresso_IF_pct:Math.round(net/ifN*100),meta_IF:ifN,top_categorias_gasto:topCats,num_dividas:debts.length,superavit:cf.balance>0};
    const prompt='Você é um consultor financeiro pessoal. Analise o perfil financeiro abaixo e responda SOMENTE com JSON válido neste formato exato: {"diagnostico":"texto","receita":[{"texto":"acao"}],"custos":[{"texto":"acao","categoria":"cat","impacto":"alto/medio/baixo"}],"superavit":{"recomendacao":"texto","dividasPct":40,"investimentosPct":60},"longo_prazo":[{"texto":"acao"}]}. Seja direto, específico e use os números do perfil. Perfil: '+JSON.stringify(ctx);
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})})
    .then(r=>r.json()).then(data=>{const text=(data.content||[]).map(i=>i.text||"").join("");const start=text.indexOf("{");const end=text.lastIndexOf("}");if(start===-1||end===-1)throw new Error("Resposta inválida");setAiAnalysis(JSON.parse(text.slice(start,end+1)));}).catch(e=>{setAiError("Erro na análise: "+e.message);}).finally(function InlineBlock(){setAiLoading(false);});
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
  const addBox=()=>{if(!f.name)return;setBoxes(p=>[...p,{id:"bx"+uid(),name:f.name,goal:Number(f.goal)||0,color:f.color||ACCENT,balance:0}]);toast_("Caixinha criada");close();};
  const editBox=()=>{setBoxes(p=>p.map(b=>b.id===f.id?{...b,name:f.name,goal:Number(f.goal),color:f.color}:b));toast_("Caixinha atualizada");close();};
  const delBox=id=>{setBoxes(p=>p.filter(b=>b.id!==id));toast_("Caixinha removida");};
  const addDebt=()=>{if(!f.name)return;setDebts(p=>[...p,{id:"d"+uid(),name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas)||12,parcelasPagas:Number(f.parcelasPagas)||0,valorParcela:Number(f.valorParcela)||0,dueDay:Number(f.dueDay)||10,startDate:f.startDate||today,color:f.color||"#ef4444"}]);toast_("Dívida adicionada","#f97316");close();};
  const editDebt=()=>{setDebts(p=>p.map(d=>d.id===f.id?{...d,name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas),parcelasPagas:Number(f.parcelasPagas),valorParcela:Number(f.valorParcela),dueDay:Number(f.dueDay),startDate:f.startDate,color:f.color}:d));toast_("Dívida atualizada");close();};
  const payDebt=()=>{setDebts(p=>p.map(d=>d.id===f.debtId?{...d,parcelasPagas:Math.min(d.totalParcelas,d.parcelasPagas+Number(f.qtd||1))}:d));toast_("Pagamento registrado",ACCENT);close();};
  const delDebt=id=>{setDebts(p=>p.filter(d=>d.id!==id));toast_("Dívida removida");};
  const addInv=()=>{if(!f.name)return;setInvs(p=>[...p,{id:"i"+uid(),bankId:f.bankId,subCat:f.subCat,name:f.name,invested:Number(f.invested)||0,balance:Number(f.balance)||0,rate:f.rate||"",maturity:f.maturity||""}]);toast_("Investimento adicionado");close();};
  const editInv=()=>{setInvs(p=>p.map(i=>i.id===f.id?{...i,name:f.name,invested:Number(f.invested),balance:Number(f.balance),rate:f.rate,maturity:f.maturity}:i));toast_("Atualizado");close();};
  const delInv=id=>{setInvs(p=>p.filter(i=>i.id!==id));toast_("Removido");};
  const checkin=()=>{setInvs(p=>p.map(i=>i.id===f.invId?{...i,balance:Number(f.balance)}:i));toast_("Saldo atualizado");close();};
  // FIX 3: validate amount > 0
  const boxMove=()=>{if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}const delta=f.moveType==="in"?Number(f.amount):-Number(f.amount);setBoxes(p=>p.map(b=>b.id===f.boxId?{...b,balance:b.balance+delta}:b));toast_("Movimentação registrada");close();};
  const delAccTx=(aId,tId)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.filter(t=>t.id!==tId)}:a));
  const editAccTx=(aId,tx)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.map(t=>t.id===tx.id?{...t,...tx}:t)}:a));
  const delCardTx=(cId,tId)=>setCards(p=>p.map(c=>c.id===cId?{...c,txs:c.txs.filter(t=>t.id!==tId)}:c));

  const launch=()=>{
    if(!f.desc||!f.amount)return;
    if(f.ltype==="transfer"){if(!f.fromId||!f.toId){toast_("Selecione origem e destino","#ef4444");return;}const id=uid();const fromName=(f.fromKind==="acc"?accs:boxes).find(x=>x.id===f.fromId)?.name||"";const toName=(f.toKind==="acc"?accs:boxes).find(x=>x.id===f.toId)?.name||"";if(f.fromKind==="acc")setAccs(p=>p.map(a=>a.id===f.fromId?{...a,txs:[...a.txs,{id:"t"+id+"o",desc:f.desc+" para "+toName,amount:Number(f.amount),type:"out",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.fromId?{...b,balance:b.balance-Number(f.amount)}:b));if(f.toKind==="acc")setAccs(p=>p.map(a=>a.id===f.toId?{...a,txs:[...a.txs,{id:"t"+id+"d",desc:f.desc+" de "+fromName,amount:Number(f.amount),type:"in",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.toId?{...b,balance:b.balance+Number(f.amount)}:b));toast_("Transferência realizada");close();return;}
    if(f.method==="credito"){if(!f.cardId){toast_("Selecione um cartão","#ef4444");return;}const ins=f.ltype==="in"?1:(Number(f.installments)||1);setCards(p=>p.map(c=>c.id===f.cardId?{...c,txs:[...c.txs,{id:"ct"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,installments:ins}]}:c));}
    else if(f.method==="dinheiro"){/* dinheiro não vincula conta — registrado sem saldo */}
    else if(f.method!=="dinheiro"){if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||""}]}:a));}
    toast_(f.ltype==="in"?"Entrada registrada":"Saída registrada",f.ltype==="in"?ACCENT:"#ef4444");close();
  };

  const accOpts=()=>[{v:"",l:"Selecione..."},...accs.map(a=>({v:a.id,l:(bkOf(a.bankId)?.name||"")+" - "+a.name}))];
  const cardOpts=()=>[{v:"",l:"Selecione..."},...cards.map(c=>({v:c.id,l:c.name}))];
  const bankOpts=()=>banks.map(b=>({v:b.id,l:b.name}));
  const iCatOpts=()=>ICAT.flatMap(c=>c.sub.map(s=>({v:s.id,l:c.label+" - "+s.label})));

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+";}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:scale(.8) translateX(-50%)}100%{opacity:1;transform:scale(1) translateX(-50%)}}"}</style>

      {toast&&(<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>)}

      {/* HEADER */}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>YESOD</div><div style={{fontSize:18,fontWeight:800}}>Finanças</div></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* FIX 1: default method=pix + first account pre-selected */}
          {!page&&tab==="over"&&(<button onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:CATS_OUT[0],method:"pix",cardId:"",accId:accs[0]?.id||"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:""})} style={{background:"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)",border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Ico n="zap" size={13} color="#fff"/> Lançar</button>)}
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
            const bk2=bkOf(ac.bankId);const bal=accBal(ac);const txs=[...(ac.txs||[])].sort((a,b)=>b.date.localeCompare(a.date));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Contas"/>
              <div style={{background:"linear-gradient(135deg,"+(bk2?.color||ACCENT)+"18,"+(bk2?.color||ACCENT)+"06)",border:"1px solid "+(bk2?.color||ACCENT)+"33",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>{bk2?.name} - {ac.name}</div><div style={{fontSize:28,fontWeight:900,color:bk2?.color||ACCENT}}>{fmt(bal)}</div></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>EXTRATO</div><Btn sm full={false} onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:CATS_OUT[0],method:"pix",accId:ac.id,cardId:"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:""})}><Ico n="plus" size={12}/> Lançar</Btn></div>
              {txs.map(tx=>(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={13} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.method} · {tx.date}</div></div><div style={{fontSize:13,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444"}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount)}</div><button onClick={()=>openSh("editTx",{accId:ac.id,id:tx.id,ltype:tx.type,desc:tx.desc,amount:tx.amount,date:tx.date,cat:tx.cat,method:tx.method,recurring:tx.recurring||""})} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delAccTx(ac.id,tx.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button></div>))}
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
              <Btn color={ACCENT} onClick={()=>openSh("payDebt",{debtId:d.id,qtd:1})}><Ico n="check" size={14}/> Registrar parcela paga</Btn>
            </div>);
          }

          if(page.type==="box"){
            const bx=boxes.find(b=>b.id===page.id);if(!bx)return null;
            const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Caixinhas"/>
              <div style={{background:"linear-gradient(135deg,"+bx.color+"18,"+bx.color+"06)",border:"1px solid "+bx.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:bx.color,marginBottom:4}}>{bx.name}</div><div style={{fontSize:28,fontWeight:900}}>{fmt(bx.balance)}</div>
                <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",margin:"10px 0 4px"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>{pct}% da meta de {fmt(bx.goal)}</div>
              </div>
              <div style={{display:"flex",gap:8}}><Btn full={false} style={{flex:1}} color={bx.color} onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"in",amount:0,date:today})}><Ico n="up" size={13}/> Depositar</Btn><Btn full={false} style={{flex:1}} outline color="#ef4444" onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"out",amount:0,date:today})}><Ico n="down" size={13}/> Retirar</Btn></div>
            </div>);
          }

          if(page.type==="inv"){
            const cat=ICAT.find(c=>c.id===page.id);if(!cat)return null;
            const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Investimentos"/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:cat.color}}/><span style={{fontSize:15,fontWeight:800,color:cat.color}}>{cat.label}</span></div>
              {cat.sub.map(sub=>{const si=ci.filter(i=>i.subCat===sub.id);if(!si.length)return null;return(<div key={sub.id} style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>{sub.label.toUpperCase()}</div>{si.map(inv=>{const gain=inv.balance-inv.invested;const gp=inv.invested>0?((gain/inv.invested)*100).toFixed(1):"0.0";return(<div key={inv.id} style={{background:C.card,border:"1px solid "+cat.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{inv.name}</div><div style={{fontSize:9,color:C.muted}}>{bkOf(inv.bankId)?.name}{inv.rate?" · "+inv.rate:""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:cat.color}}>{fmt(inv.balance)}</div><div style={{fontSize:9,fontWeight:600,color:gain>=0?"#10b981":"#ef4444"}}>{gain>=0?"+":""}{fmt(gain)} ({gp}%)</div></div></div><Btn sm full={false} outline color={cat.color} onClick={()=>openSh("checkin",{invId:inv.id,balance:inv.balance})}><Ico n="refresh" size={11}/> Atualizar saldo</Btn></div>);})}</div>);})}
              {ci.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum ativo</div>}
            </div>);
          }
          return null;
        })()}

        {/* ══ YESOD ══ */}
        {!page&&tab==="yesod"&&(function YesodTab(){
          const ys=calcYesodScore();
          return(<div style={{animation:"slideUp .3s ease"}}>
            <div style={{background:"linear-gradient(135deg,#10b98122,#10b98106)",border:"1px solid #10b98144",borderRadius:16,padding:18,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div><div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>YESOD — SAÚDE FINANCEIRA</div><div style={{fontSize:52,fontWeight:900,color:ACCENT,lineHeight:1}}>{ys}%</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,marginBottom:6}}>Leve para a Árvore</div><div style={{background:C.card,border:"2px solid "+ACCENT,borderRadius:12,padding:"10px 16px",textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:ACCENT,lineHeight:1}}>{ys}</div><div style={{fontSize:9,color:ACCENT,fontWeight:700,marginTop:2}}>% → Yesod</div></div></div>
              </div>
              <div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ys+"%",background:"linear-gradient(90deg,#10b981,#06b6d4)",borderRadius:99,transition:"width .6s"}}/></div>
              <div style={{fontSize:9,color:C.muted}}>Score calculado automaticamente pelos seus dados financeiros</div>
              {finXp>0&&<div style={{marginTop:8,fontSize:11,color:"#fbbf24",fontWeight:700}}>🪙 {finXp} XP acumulados</div>}
            </div>
            {(function InlineBlock(){const cf0=cashflowMonth(-1);const savRate=cf0.ins>0?Math.max(0,(cf0.ins-cf0.outs)/cf0.ins):0;const ifN=ifGoal||ifMonthly*300||1;const rows=[{l:"Poupança",v:Math.min(100,Math.round(savRate/0.2*100)),w:"20%",c:"#16a34a"},{l:"Prog. IF",v:Math.min(100,Math.round(net/ifN*100)),w:"25%",c:"#06b6d4"},{l:"Dívidas",v:debts.length>0?Math.round(debts.reduce((s,d)=>s+(d.parcelasPagas/d.totalParcelas),0)/debts.length*100):100,w:"15%",c:"#f97316"},{l:"Orçamento",v:budgets.length>0?Math.round(budgets.filter(b=>budgetSpend(b.cat)<=b.limit).length/budgets.length*100):50,w:"15%",c:"#8b5cf6"},{l:"Hábitos",v:Math.round(yHabits.filter(h=>h.done).length/(yHabits.length||1)*100),w:"13%",c:ACCENT},{l:"Metas",v:Math.round(yGoals.filter(g=>g.done).length/(yGoals.length||1)*100),w:"12%",c:"#f59e0b"}];return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>{rows.map(r=>{const color=r.v>=80?r.c:r.v>=50?"#f59e0b":"#ef4444";return(<div key={r.l} style={{background:C.card,border:"1px solid "+color+"22",borderRadius:12,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>{r.l}</div><div style={{fontSize:18,fontWeight:900,color,marginBottom:4}}>{r.v}%</div><div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:r.v+"%",background:color,borderRadius:99}}/></div><div style={{fontSize:8,color:C.muted,marginTop:3}}>peso {r.w}</div></div>);})}</div>);})()}
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{yHabits.filter(h=>h.done).length}/{yHabits.length}</span><button onClick={()=>openSh("addYHabit",{title:"",freq:"Diário",xp:15})} style={{background:ACCENT+"22",border:"1px solid "+ACCENT+"44",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10} color={ACCENT}/> Hábito</button></div>
              </div>
              {yHabits.map(h=>(<div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}><button onClick={()=>{if(!h.done){setFinXp(x=>x+h.xp);}setYHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}</button><div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted,marginTop:1}}>{h.freq}</div></div><span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span><button onClick={()=>setYHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:.5}}><Ico n="x" size={11} color={C.muted}/></button></div>))}
            </div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>METAS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{yGoals.filter(g=>g.done).length}/{yGoals.length}</span><button onClick={()=>openSh("addYGoal",{title:"",xp:100})} style={{background:"#f59e0b22",border:"1px solid #f59e0b44",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:"#f59e0b",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10} color="#f59e0b"/> Meta</button></div>
              </div>
              {yGoals.map(g=>(<div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}><button onClick={()=>{if(!g.done){setFinXp(x=>x+g.xp);}setYGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?"#f59e0b":C.b2),background:g.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}</button><div style={{flex:1,fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div><span style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>+{g.xp}</span><button onClick={()=>setYGoals(p=>p.filter(x=>x.id!==g.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:.5}}><Ico n="x" size={11} color={C.muted}/></button></div>))}
            </div>
          </div>);
        })()}

        {/* ══ GERAL ══ */}
        {!page&&tab==="over"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {[{l:"Contas",v:totAcc,c:ACCENT,icon:"bank",t:"bolsos"},{l:"Cartões",v:-totCardDebt,c:"#ef4444",icon:"card",t:"bolsos"},{l:"Dívidas",v:-totDebtRem,c:"#f97316",icon:"debt",t:"debt"},{l:"Caixinhas",v:totBox,c:"#06b6d4",icon:"piggy",t:"bolsos"},{l:"Investido",v:totInv,c:"#f59e0b",icon:"barchart",t:"inv"}].map(s=>(<div key={s.l} onClick={()=>setTab(s.t)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:12,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><Ico n={s.icon} size={13} color={s.c}/><span style={{fontSize:10,color:C.muted,fontWeight:600}}>{s.l}</span></div><div style={{fontSize:16,fontWeight:900,color:s.c}}>{fmt(s.v)}</div></div>))}
            </div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginTop:6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:aiAnalysis?12:0}}>
                <div><div style={{fontSize:12,fontWeight:800}}>Análise Financeira IA</div>{aiAnalysis&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>Baseada nos dados do mês anterior</div>}</div>
                <button onClick={analyzeFinances} disabled={aiLoading} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:10,cursor:aiLoading?"default":"pointer",background:aiLoading?"linear-gradient(135deg,"+C.b2+","+C.b1+")":"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)",border:"none",color:"#fff",fontWeight:700,fontSize:11,opacity:aiLoading?0.7:1}}><Ico n="zap" size={12} color="#fff"/> {aiLoading?"Analisando...":"Analisar"}</button>
              </div>
              {!aiAnalysis&&!aiLoading&&!aiError&&(<div style={{textAlign:"center",padding:"16px 0",color:C.muted}}><div style={{fontSize:22,marginBottom:6}}>✨</div><div style={{fontSize:11,fontWeight:600,marginBottom:3}}>Consultor Financeiro IA</div><div style={{fontSize:10}}>Diagnóstico, sugestões de receita, corte de custos e estratégia de longo prazo</div></div>)}
              {aiLoading&&<div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>Analisando seu perfil financeiro...</div>}
              {aiError&&<div style={{fontSize:11,color:"#ef4444",padding:"8px 12px",background:"#fee2e2",borderRadius:8,marginTop:10}}>{aiError}</div>}
              {aiAnalysis&&(<div>
                <div style={{background:ACCENT+"11",border:"1px solid "+ACCENT+"33",borderRadius:10,padding:"10px 12px",marginBottom:12}}><div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>DIAGNÓSTICO</div><div style={{fontSize:12,lineHeight:1.6}}>{aiAnalysis.diagnostico}</div></div>
                {(aiAnalysis.receita||[]).length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,color:"#16a34a",fontWeight:700,letterSpacing:1,marginBottom:8}}>↑ AUMENTAR RECEITA</div>{(aiAnalysis.receita||[]).map((r,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}><div style={{width:5,height:5,borderRadius:"50%",background:"#16a34a",marginTop:5,flexShrink:0}}/><div style={{fontSize:12,lineHeight:1.5}}>{r.texto}</div></div>)}</div>}
                {(aiAnalysis.custos||[]).length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,color:"#ef4444",fontWeight:700,letterSpacing:1,marginBottom:8}}>↓ REDUZIR CUSTOS</div>{(aiAnalysis.custos||[]).map((c2,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}><div style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",marginTop:5,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:12,lineHeight:1.5}}>{c2.texto}</div>{c2.categoria&&<div style={{fontSize:9,color:C.muted}}>{c2.categoria}</div>}</div></div>)}</div>}
                {(aiAnalysis.longo_prazo||[]).length>0&&<div><div style={{fontSize:10,color:"#06b6d4",fontWeight:700,letterSpacing:1,marginBottom:8}}>LONGO PRAZO</div>{(aiAnalysis.longo_prazo||[]).map((l,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}><div style={{width:5,height:5,borderRadius:"50%",background:"#06b6d4",marginTop:5,flexShrink:0}}/><div style={{fontSize:12,lineHeight:1.5}}>{l.texto}</div></div>)}</div>}
                <button onClick={()=>setAiAnalysis(null)} style={{marginTop:12,width:"100%",padding:"7px",borderRadius:8,background:C.b1,border:"none",cursor:"pointer",color:C.muted,fontSize:10,fontWeight:600}}>Limpar</button>
              </div>)}
            </div>
          </div>
        )}

        {/* ══ FLUXO ══ */}
        {!page&&tab==="fluxo"&&(function FluxoTab(){
          const VIEWS=["fluxo","categorias","poupanca","dividas-rel","invest-rel","patrimonio"];
          const VIEW_LABELS=["Fluxo de Caixa","Gastos por Categoria","Taxa de Poupança","Progresso Dívidas","Rendimento Invest.","Evolução Patrimonial"];
          const vIdx=typeof fluxoView==="number"?fluxoView:0;
          const cf=cashflowMonth(overMonth);const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(overMonth+o));const maxVal=Math.max(...months6.map(m=>Math.max(m.ins,m.outs)),1);
          const catSpend={};cf.txs.filter(t=>t.type==="out").forEach(t=>{catSpend[t.cat]=(catSpend[t.cat]||0)+t.amount;});const catEntries=Object.entries(catSpend).sort((a,b)=>b[1]-a[1]);const catMax=catEntries.length?catEntries[0][1]:1;
          const CAT_COLORS=["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16","#f97316","#64748b"];
          const savingsRate=cf.ins>0?Math.max(0,Math.round(((cf.ins-cf.outs)/cf.ins)*100)):0;
          const totDebtNow=debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
          const investPerf=invs.map(i=>({name:i.name.length>16?i.name.slice(0,14)+"...":i.name,gain:i.balance-i.invested,pct:i.invested>0?((i.balance-i.invested)/i.invested*100).toFixed(1):"0.0",color:ICAT.find(c=>c.sub.some(s=>s.id===i.subCat))?.color||ACCENT})).sort((a,b)=>b.gain-a.gain);
          return(
            <div style={{animation:"slideUp .3s ease"}} onTouchStart={e=>{touchXRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touchXRef.current;if(Math.abs(dx)>40){setFluxoView(v=>dx<0?Math.min(VIEWS.length-1,v+1):Math.max(0,v-1));}}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:800}}>{VIEW_LABELS[vIdx]}</span>
                {vIdx===0&&(<div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>setOverMonth(m=>m-1)} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="back" size={10} color={C.muted}/></button><span style={{fontSize:10,fontWeight:700,minWidth:44,textAlign:"center"}}>{monthLabel2(cf.ym)}</span><button onClick={()=>setOverMonth(m=>Math.min(0,m+1))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:overMonth===0?0.3:1}}><Ico n="chev" size={10} color={C.muted}/></button></div>)}
              </div>
              {vIdx===0&&(<div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>{[{l:"Entradas",v:cf.ins,c:"#16a34a"},{l:"Saídas",v:cf.outs,c:"#ef4444"},{l:"Saldo",v:cf.balance,c:cf.balance>=0?ACCENT:"#ef4444"}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>{s.l}</div><div style={{fontSize:13,fontWeight:900,color:s.c}}>{fmt(s.v)}</div></div>))}</div>
                <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>HISTÓRICO 6 MESES</div>
                  <div style={{display:"flex",gap:6,alignItems:"flex-end",height:70,marginBottom:8}}>{months6.map(m=>(<div key={m.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:56}}><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.ym===cf.ym?"#16a34a":"#16a34a55",height:Math.max(2,(m.ins/maxVal)*56)+"px"}}/><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.ym===cf.ym?"#ef4444":"#ef444455",height:Math.max(2,(m.outs/maxVal)*56)+"px"}}/></div><div style={{fontSize:7,color:m.ym===cf.ym?ACCENT:C.muted,fontWeight:m.ym===cf.ym?700:400}}>{monthLabel2(m.ym)}</div></div>))}</div>
                </div>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>LANÇAMENTOS</div>
                {cf.txs.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum lançamento</div>}
                {[...cf.txs].sort((a,b)=>b.date.localeCompare(a.date)).map((tx,i)=>(<div key={tx.id+i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={12} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.sourceName}</div></div><div style={{fontSize:12,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444",flexShrink:0}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount)}</div></div>))}
              </div>)}
              {vIdx===1&&(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>MÊS ATUAL — SAÍDAS</div><div style={{fontSize:22,fontWeight:900,color:"#ef4444",marginBottom:12}}>{fmt(cf.outs)}</div>{catEntries.length===0&&<div style={{textAlign:"center",padding:16,color:C.muted,fontSize:12}}>Sem gastos registrados</div>}{catEntries.map(([cat,val],i)=>{const pct=Math.round((val/cf.outs)*100);const color=CAT_COLORS[i%CAT_COLORS.length];return(<div key={cat} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:600}}>{cat}</span><div style={{display:"flex",gap:8}}><span style={{fontSize:9,color:C.muted}}>{pct}%</span><span style={{fontSize:12,fontWeight:700,color}}>{fmt(val)}</span></div></div><div style={{height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.round((val/catMax)*100)+"%",background:color,borderRadius:99}}/></div></div>);})}</div>)}
              {vIdx===2&&(<div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:18,marginBottom:10,textAlign:"center"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>TAXA DE POUPANÇA</div><div style={{fontSize:52,fontWeight:900,color:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",lineHeight:1}}>{savingsRate}%</div><div style={{fontSize:11,color:C.muted,marginTop:6}}>Meta saudável: 20%+</div><div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",margin:"16px 0 8px"}}><div style={{height:"100%",width:Math.min(100,savingsRate)+"%",background:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>HISTÓRICO</div>{months6.slice().reverse().map(m=>{const rate=m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0;return(<div key={m.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:m.ym===cf.ym?ACCENT:C.text,fontWeight:m.ym===cf.ym?700:400}}>{monthLabel2(m.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,rate)+"%",background:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",minWidth:30,textAlign:"right"}}>{rate}%</span></div>);})}</div></div>)}
              {vIdx===3&&(<div><div style={{background:"linear-gradient(135deg,#ef444418,#ef444406)",border:"1px solid #ef444433",borderRadius:14,padding:16,marginBottom:10,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>TOTAL EM DÍVIDAS</div><div style={{fontSize:28,fontWeight:900,color:"#ef4444"}}>{fmt(totDebtNow)}</div></div>{debts.map(d=>{const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} style={{background:C.card,border:"1px solid "+d.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{d.name}</div>{d.credor&&<div style={{fontSize:9,color:d.color}}>{d.credor}</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:d.color}}>{fmt((d.totalParcelas-d.parcelasPagas)*d.valorParcela)}</div><div style={{fontSize:9,color:C.muted}}>restante</div></div></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{d.parcelasPagas}/{d.totalParcelas} ({pct}%)</div></div>);})}{debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}</div>)}
              {vIdx===4&&(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>TOTAL INVESTIDO</div><div style={{fontSize:22,fontWeight:900,color:ACCENT}}>{fmt(invs.reduce((s,i)=>s+i.invested,0))}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>RENDIMENTO</div><div style={{fontSize:22,fontWeight:900,color:invs.reduce((s,i)=>s+(i.balance-i.invested),0)>=0?ACCENT:"#ef4444"}}>{fmt(invs.reduce((s,i)=>s+(i.balance-i.invested),0))}</div></div></div></div>{investPerf.map((inv,i)=>{const positive=inv.gain>=0;return(<div key={i} style={{background:C.card,border:"1px solid "+inv.color+"22",borderRadius:12,padding:"11px 13px",marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:6,height:6,borderRadius:"50%",background:inv.color}}/><span style={{fontSize:12,fontWeight:600}}>{inv.name}</span></div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:positive?ACCENT+"22":"#ef444422",color:positive?ACCENT:"#ef4444",fontWeight:700}}>{positive?"+":""}{inv.pct}%</span><span style={{fontSize:12,fontWeight:700,color:positive?ACCENT:"#ef4444"}}>{positive?"+":""}{fmt(inv.gain)}</span></div></div></div>);})}</div>)}
              {vIdx===5&&(function InlineBlock(){const pts=retroPatrim();const maxP=Math.max(...pts.map(p=>Math.abs(p.net)),1);const nowYm=new Date().toISOString().slice(0,7);const totalGain=pts.length>1?pts[pts.length-1].net-pts[0].net:0;return(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>PATRIMÔNIO ATUAL</div><div style={{fontSize:26,fontWeight:900,color:ACCENT}}>{fmt(net)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>VARIAÇÃO</div><div style={{fontSize:16,fontWeight:800,color:totalGain>=0?ACCENT:"#ef4444"}}>{totalGain>=0?"+":""}{fmt(totalGain)}</div></div></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>EVOLUÇÃO 6 MESES</div><div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>{pts.map((p,i)=>{const h=Math.max(4,(Math.abs(p.net)/maxP)*82);const color=p.net>=0?(p.ym===nowYm?ACCENT:ACCENT+"66"):"#ef4444";return(<div key={p.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:color,height:h+"px"}}/><div style={{fontSize:7,color:p.ym===nowYm?ACCENT:C.muted,fontWeight:p.ym===nowYm?700:400,whiteSpace:"nowrap"}}>{monthLabel2(p.ym)}</div></div>);})}</div></div></div>);})()}
              <div style={{display:"flex",gap:5,justifyContent:"center",padding:"18px 0 4px"}}>{VIEWS.map((_,i)=>(<button key={i} onClick={()=>setFluxoView(i)} style={{width:i===vIdx?16:6,height:6,borderRadius:99,background:i===vIdx?ACCENT:C.b2,border:"none",cursor:"pointer",transition:"all .2s",padding:0}}/>))}</div>
            </div>
          );
        })()}

        {/* ══ ORÇAMENTO ══ */}
        {!page&&tab==="orc"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:800}}>Orçamento — {monthLabel2(getMonthStr(0))}</span><button onClick={()=>openSh("addBudget",{cat:CATS_OUT[0],limit:0})} style={{background:"none",border:"1px solid "+ACCENT,borderRadius:7,padding:"5px 11px",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10}/> Categoria</button></div>
            {budgets.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum orçamento definido</div>}
            {budgets.map(bg=>{const spent=budgetSpend(bg.cat);const pct=Math.min(100,Math.round((spent/bg.limit)*100));const over=spent>bg.limit;const color=over?"#ef4444":pct>75?"#f59e0b":ACCENT;return(<div key={bg.id} style={{background:C.card,border:"1px solid "+(over?"#ef444433":C.b1),borderRadius:12,padding:"11px 13px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12,fontWeight:600}}>{bg.cat}</span>{over&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:"#fee2e2",color:"#ef4444",fontWeight:700}}>ACIMA</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,fontWeight:700,color}}>{fmt(spent)}</span><span style={{fontSize:9,color:C.muted}}>/ {fmt(bg.limit)}</span><button onClick={()=>openSh("editBudget",{id:bg.id,cat:bg.cat,limit:bg.limit})} style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={10} color={C.muted}/></button><button onClick={()=>setBudgets(p=>p.filter(x=>x.id!==bg.id))} style={{background:C.b1,border:"none",borderRadius:99,width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={9} color={C.muted}/></button></div></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{pct}% usado {over?"— "+fmt(spent-bg.limit)+" acima":"— "+fmt(bg.limit-spent)+" disponível"}</div></div>);})}
          </div>
        )}

        {/* ══ BOLSOS ══ */}
        {!page&&tab==="bolsos"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Contas</span><div style={{display:"flex",gap:6}}><Btn sm full={false} outline color={C.muted} onClick={()=>openSh("addBank",{name:"",color:ACCENT})}><Ico n="bank" size={11}/> Banco</Btn><Btn sm full={false} onClick={()=>openSh("addAcc",{bankId:banks[0]?.id||"",name:""})}><Ico n="plus" size={11}/> Conta</Btn></div></div>
            {accs.map(ac=>{const bk2=bkOf(ac.bankId);const bal=accBal(ac);return(<div key={ac.id} onClick={()=>nav("account",ac.id)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:(bk2?.color||ACCENT)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="bank" size={16} color={bk2?.color||ACCENT}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{bk2?.name}</div><div style={{fontSize:10,color:C.muted}}>{ac.name}</div></div><div style={{fontSize:16,fontWeight:900,color:bal>=0?ACCENT:"#ef4444"}}>{fmt(bal)}</div><Ico n="chev" size={13} color={C.muted}/></div></div>);})}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Caixinhas</span><Btn sm full={false} onClick={()=>openSh("addBox",{name:"",goal:0,color:ACCENT})}><Ico n="plus" size={11}/> Caixinha</Btn></div>
            {boxes.map(bx=>{const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));return(<div key={bx.id} onClick={()=>nav("box",bx.id)} style={{background:C.card,border:"1px solid "+bx.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:bx.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="piggy" size={16} color={bx.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{bx.name}</div><div style={{fontSize:9,color:C.muted}}>Meta: {fmt(bx.goal)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:bx.color}}>{fmt(bx.balance)}</div><div style={{fontSize:9,color:C.muted}}>{pct}%</div></div><Ico n="chev" size={13} color={C.muted}/></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div></div>);})}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Cartões</span><Btn sm full={false} onClick={()=>openSh("addCard",{bankId:banks[0]?.id||"",name:"",limit:5000,closeDay:10,dueDay:25,color:ACCENT})}><Ico n="plus" size={11}/> Cartão</Btn></div>
            {cards.map(cd=>{const stmts=getStmts(cd);const debt=stmts.reduce((s,st)=>s+st.total,0);const used=Math.min(100,Math.round((debt/cd.limit)*100));return(<div key={cd.id} onClick={()=>nav("card",cd.id)} style={{background:C.card,border:"1px solid "+cd.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:cd.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="card" size={16} color={cd.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{cd.name}</div><div style={{fontSize:9,color:C.muted}}>Fecha {cd.closeDay} · Vence {cd.dueDay}</div></div><Ico n="chev" size={13} color={C.muted}/></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:used+"%",background:used>80?"#ef4444":used>50?"#f59e0b":cd.color,borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Usado: {fmt(debt)}</span><span>Limite: {fmt(cd.limit)}</span></div></div>);})}
          </div>
        )}

        {/* ══ DÍVIDAS ══ */}
        {!page&&tab==="debt"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:800}}>Dívidas e Financiamentos</span><Btn sm full={false} onClick={()=>openSh("addDebt",{name:"",credor:"",totalParcelas:12,parcelasPagas:0,valorParcela:0,dueDay:10,startDate:today,color:"#ef4444"})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <div style={{background:"linear-gradient(135deg,#ef444418,#ef444406)",border:"1px solid #ef444433",borderRadius:14,padding:14,marginBottom:12}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>TOTAL EM DÍVIDAS</div><div style={{fontSize:24,fontWeight:900,color:"#ef4444"}}>{fmt(totDebtRem)}</div></div>
            {debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}
            {debts.map(d=>{const restantes=d.totalParcelas-d.parcelasPagas;const saldo=restantes*d.valorParcela;const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} onClick={()=>nav("debt",d.id)} style={{background:C.card,border:"1px solid "+d.color+"33",borderRadius:14,padding:14,marginBottom:10,cursor:"pointer"}}><div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:d.color,marginTop:5,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{d.name}</div><div style={{fontSize:9,color:C.muted}}>{d.credor&&<span style={{color:d.color}}>{d.credor} </span>}{fmt(d.valorParcela)}/mês</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:d.color}}>{fmt(saldo)}</div><div style={{fontSize:9,color:C.muted}}>saldo devedor</div></div><button onClick={e=>{e.stopPropagation();delDebt(d.id);}} style={{background:C.b1,border:"none",borderRadius:99,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={10} color={C.muted}/></button></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>Pago: {pct}% · {d.parcelasPagas}/{d.totalParcelas} parcelas</div></div>);})}
          </div>
        )}

        {/* ══ INVESTIMENTOS ══ */}
        {!page&&tab==="inv"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:800}}>Investimentos</span><Btn sm full={false} onClick={()=>openSh("addInv",{bankId:banks[0]?.id||"",subCat:"rf_pub",name:"",invested:0,balance:0,rate:"",maturity:""})}><Ico n="plus" size={11}/> Ativo</Btn></div>
            <div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:14,marginBottom:12}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>TOTAL INVESTIDO</div><div style={{fontSize:24,fontWeight:900,color:ACCENT}}>{fmt(totInv)}</div><div style={{fontSize:10,color:ACCENT,marginTop:2,fontWeight:600}}>Rendimento: {fmt(invs.reduce((s,i)=>s+(i.balance-i.invested),0))}</div></div>
            {ICAT.map(cat=>{const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));const tot=ci.reduce((s,i)=>s+i.balance,0);const gain=tot-ci.reduce((s,i)=>s+i.invested,0);return(<div key={cat.id} onClick={()=>nav("inv",cat.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",background:C.card,border:"1px solid "+(ci.length?cat.color+"22":C.b1),borderRadius:12,marginBottom:8,cursor:"pointer",opacity:ci.length?1:.5}}><div style={{width:10,height:10,borderRadius:"50%",background:cat.color}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{cat.label}</div>{ci.length>0&&<div style={{fontSize:9,color:gain>=0?"#10b981":"#ef4444",fontWeight:600}}>{gain>=0?"+":""}{fmt(gain)}</div>}{ci.length===0&&<div style={{fontSize:9,color:C.muted}}>Nenhum ativo</div>}</div>{ci.length>0&&<div style={{fontSize:14,fontWeight:800,color:cat.color}}>{fmt(tot)}</div>}<Ico n="chev" size={12} color={C.muted}/></div>);})}
          </div>
        )}

        {/* ══ IF ══ */}
        {!page&&tab==="if"&&(function IFTab(){
          const ifNeeded=ifGoal||ifMonthly*300;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
          const last3=[-1,-2,-3].map(o=>cashflowMonth(o));const avgSaving=Math.max(0,last3.reduce((s,m)=>s+(m.ins-m.outs),0)/3);
          const monthsLeft=avgSaving>0?Math.ceil((ifNeeded-net)/avgSaving):null;const yearsLeft=monthsLeft?(monthsLeft/12).toFixed(1):null;
          const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(o));const savRates=months6.map(m=>({ym:m.ym,rate:m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0}));
          return(<div style={{animation:"slideUp .3s ease"}}>
            <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div><div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div><div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div><div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{l:"POUPANÇA MÉDIA/MÊS",v:fmt(avgSaving),sub:"últimos 3 meses",c:avgSaving>0?ACCENT:"#ef4444"},{l:"PROJEÇÃO",v:yearsLeft?yearsLeft+" anos":"—",sub:monthsLeft?monthsLeft+" meses":"sem dados",c:ACCENT},{l:"RENDA MENSAL (4%)",v:fmt(ifNeeded/300),sub:"ao atingir a meta",c:"#f59e0b"},{l:"PATRIMÔNIO ALVO",v:fmt(ifNeeded),sub:"regra dos 4%",c:C.text}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>{s.l}</div><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{s.sub}</div></div>))}</div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>TAXA DE POUPANÇA — 6 MESES</div>{savRates.map(s=>{const color=s.rate>=20?ACCENT:s.rate>=10?"#f59e0b":"#ef4444";return(<div key={s.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:s.ym===getMonthStr(0)?ACCENT:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,s.rate)+"%",background:color,borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color,minWidth:30,textAlign:"right"}}>{s.rate}%</span></div>);})}</div>
            <Btn outline color={ACCENT} onClick={()=>openSh("editIF",{ifGoal:ifNeeded,ifMonthly})}><Ico n="edit" size={14}/> Editar meta</Btn>
          </div>);
        })()}

        {/* ══ CONFIG ══ FIX 2: Cartões section restored */}
        {!page&&tab==="cfg"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            {[
              {title:"Bancos",items:banks,addSh:"addBank",addInit:{name:"",color:ACCENT},render:b=><div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/><span style={{flex:1,fontSize:12,fontWeight:600}}>{b.name}</span><button onClick={()=>openSh("editBank",{id:b.id,name:b.name,color:b.color})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delBank(b.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Contas",items:accs,addSh:"addAcc",addInit:{bankId:banks[0]?.id||"",name:""},render:a=>{const bk2=bkOf(a.bankId);return<div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:bk2?.color||ACCENT}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{a.name}</div><div style={{fontSize:9,color:C.muted}}>{bk2?.name}</div></div><button onClick={()=>openSh("editAcc",{id:a.id,bankId:a.bankId,name:a.name})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delAcc(a.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>;}},
              {title:"Cartões",items:cards,addSh:"addCard",addInit:{bankId:banks[0]?.id||"",name:"",limit:5000,closeDay:10,dueDay:25,color:ACCENT},render:cd=>{const bk2=bkOf(cd.bankId);return<div key={cd.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:cd.color}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{cd.name}</div><div style={{fontSize:9,color:C.muted}}>{bk2?.name} · Fecha {cd.closeDay} · Vence {cd.dueDay} · Limite {fmt(cd.limit)}</div></div><button onClick={()=>openSh("editCard",{id:cd.id,bankId:cd.bankId,name:cd.name,limit:cd.limit,closeDay:cd.closeDay,dueDay:cd.dueDay,color:cd.color})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delCard(cd.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>;}},
              {title:"Caixinhas",items:boxes,addSh:"addBox",addInit:{name:"",goal:0,color:ACCENT},render:bx=><div key={bx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:bx.color}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{bx.name}</div><div style={{fontSize:9,color:C.muted}}>{fmt(bx.balance)} / {fmt(bx.goal)}</div></div><button onClick={()=>openSh("editBox",{id:bx.id,name:bx.name,goal:bx.goal,color:bx.color})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delBox(bx.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Investimentos",items:invs,addSh:"addInv",addInit:{bankId:banks[0]?.id||"",subCat:"rf_pub",name:"",invested:0,balance:0,rate:"",maturity:""},render:inv=>{const catColor=ICAT.find(c=>c.sub.some(s=>s.id===inv.subCat))?.color||ACCENT;return<div key={inv.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:catColor}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{inv.name}</div><div style={{fontSize:9,color:C.muted}}>{fmt(inv.balance)}</div></div><button onClick={()=>openSh("editInv",{id:inv.id,name:inv.name,invested:inv.invested,balance:inv.balance,rate:inv.rate,maturity:inv.maturity})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delInv(inv.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>;}}
            ].map(sec=>(<div key={sec.title} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:12,fontWeight:700}}>{sec.title}</span><Btn sm full={false} onClick={()=>openSh(sec.addSh,sec.addInit)}><Ico n="plus" size={11}/> Adicionar</Btn></div>{sec.items.map(item=>sec.render(item))}</div>))}
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
          <div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT},{v:"transfer",l:"Transferir",c:"#8b5cf6"}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?CATS_IN[0]:CATS_OUT[0]})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div>
          <FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} placeholder="Ex: Supermercado" C={C}/>
          <FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/>
          <FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/>
          {f.ltype!=="transfer"&&<FS label="Categoria" value={f.cat||CATS_OUT[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?CATS_IN:CATS_OUT).map(c=>({v:c,l:c}))} C={C}/>}
          {f.ltype!=="transfer"&&(<div style={{marginBottom:12}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>RECORRÊNCIA</div><div style={{display:"flex",gap:6}}>{[{v:"",l:"Único"},{v:"monthly",l:"Mensal"},{v:"weekly",l:"Semanal"},{v:"yearly",l:"Anual"}].map(o=>(<button key={o.v} onClick={()=>F({recurring:o.v})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+((f.recurring||"")===o.v?ACCENT:C.b2),background:(f.recurring||"")===o.v?ACCENT+"18":"transparent",color:(f.recurring||"")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div></div>)}
          {f.ltype==="transfer"&&(<div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ORIGEM</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({fromKind:o.v,fromId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.fromKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.fromKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.fromKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
            <FS label="" value={f.fromId||""} onChange={v=>F({fromId:v})} opts={[{v:"",l:"Selecione..."},...((f.fromKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:(bkOf(a.bankId)?.name||"")+" - "+a.name})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><div style={{width:24,height:24,borderRadius:"50%",background:C.b1,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="down" size={12} color={C.muted}/></div></div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>DESTINO</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({toKind:o.v,toId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.toKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.toKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.toKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
            <FS label="" value={f.toId||""} onChange={v=>F({toId:v})} opts={[{v:"",l:"Selecione..."},...((f.toKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:(bkOf(a.bankId)?.name||"")+" - "+a.name})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
          </div>)}
          {f.ltype!=="transfer"&&(<div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>MEIO DE PAGAMENTO</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>{PAY_METHODS.map(m=>(<button key={m.v} onClick={()=>F({method:m.v})} style={{padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+(f.method===m.v?ACCENT:C.b2),background:f.method===m.v?ACCENT+"18":"transparent",color:f.method===m.v?ACCENT:C.text}}>{m.l}</button>))}</div>
            {f.method==="credito"&&(<div><FS label="Cartão" value={f.cardId||""} onChange={v=>F({cardId:v})} opts={cardOpts()} C={C}/>{f.ltype==="out"&&<FI label="Parcelas" value={f.installments||1} onChange={v=>F({installments:Math.max(1,v)})} type="number" min={1} C={C}/>}</div>)}
            {["pix","debito","ted"].includes(f.method||"")&&<FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
          </div>)}
          <Btn color={f.ltype==="transfer"?"#8b5cf6":f.ltype==="in"?ACCENT:"#ef4444"} onClick={launch}>{f.ltype==="transfer"?"Confirmar Transferência":f.ltype==="in"?"Registrar Entrada":"Registrar Saída"}</Btn>
        </Sheet>
      )}

      {sh==="addBudget"&&(<Sheet title="Nova Categoria de Orçamento" onClose={close} C={C}><FS label="Categoria" value={f.cat||CATS_OUT[0]} onChange={v=>F({cat:v})} opts={CATS_OUT.map(c=>({v:c,l:c}))} C={C}/><FI label="Limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.limit)return;setBudgets(p=>[...p,{id:"bg"+uid(),cat:f.cat||CATS_OUT[0],limit:Number(f.limit)}]);toast_("Orçamento adicionado");close();}}>Adicionar</Btn></Sheet>)}
      {sh==="editBudget"&&(<Sheet title="Editar Orçamento" onClose={close} C={C}><div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>{f.cat}</div><FI label="Novo limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{setBudgets(p=>p.map(b=>b.id===f.id?{...b,limit:Number(f.limit)}:b));toast_("Limite atualizado");close();}}>Salvar</Btn></Sheet>)}
      {sh==="addYHabit"&&(<Sheet title="Novo Hábito Financeiro" onClose={close} C={C}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Revisar o orçamento" C={C}/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}]} C={C}/><FI label="XP por conclusão" value={f.xp||15} onChange={v=>F({xp:v})} type="number" min={5} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.title?.trim())return;setYHabits(p=>[...p,{id:"yh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false}]);toast_("Hábito criado");close();}}><Ico n="check" size={14}/> Criar Hábito</Btn></Sheet>)}
      {sh==="addYGoal"&&(<Sheet title="Nova Meta Financeira" onClose={close} C={C}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Quitar dívida do cartão" C={C}/><FI label="XP de recompensa" value={f.xp||100} onChange={v=>F({xp:v})} type="number" min={10} C={C}/><Btn color="#f59e0b" onClick={()=>{if(!f.title?.trim())return;setYGoals(p=>[...p,{id:"yg"+uid(),title:f.title,xp:Number(f.xp)||100,done:false}]);toast_("Meta criada","#f59e0b");close();}}><Ico n="check" size={14}/> Criar Meta</Btn></Sheet>)}
      {sh==="editTx"&&(<Sheet title="Editar Lançamento" onClose={close} C={C}><div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?CATS_IN[0]:CATS_OUT[0]})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div><FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><FS label="Categoria" value={f.cat||CATS_OUT[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?CATS_IN:CATS_OUT).map(c=>({v:c,l:c}))} C={C}/><FS label="Método" value={f.method||"pix"} onChange={v=>F({method:v})} opts={PAY_METHODS.filter(m=>m.v!=="credito")} C={C}/><Btn color={ACCENT} onClick={()=>{editAccTx(f.accId,{id:f.id,desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||""});toast_("Atualizado");close();}}>Salvar</Btn></Sheet>)}
      {sh==="editIF"&&(<Sheet title="Meta de Independência Financeira" onClose={close} C={C}><div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>Defina o patrimônio necessário para viver de renda (regra dos 4% ao ano).</div><FI label="Patrimônio alvo (R$)" value={f.ifGoal||0} onChange={v=>F({ifGoal:v})} type="number" min={0} C={C}/><div style={{textAlign:"center",fontSize:11,color:C.muted,marginBottom:12}}>— ou defina pela renda —</div><FI label="Renda mensal desejada (R$)" value={f.ifMonthly||0} onChange={v=>F({ifMonthly:v,ifGoal:Number(v)*300})} type="number" min={0} C={C}/>{(f.ifGoal||0)>0&&<div style={{background:C.b1,borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:11,color:C.dim}}>Renda de {fmt((f.ifGoal||0)/300)}/mês pela regra dos 4%</div>}<Btn color={ACCENT} onClick={()=>{setIfGoal(Number(f.ifGoal)||0);setIfMonthly(Number(f.ifMonthly)||0);toast_("Meta atualizada");close();}}>Salvar</Btn></Sheet>)}
      {(sh==="addBank"||sh==="editBank")&&(<Sheet title={sh==="addBank"?"Novo Banco":"Editar Banco"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Nubank" C={C}/><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBank"?addBank:editBank}>Salvar</Btn></Sheet>)}
      {(sh==="addAcc"||sh==="editAcc")&&(<Sheet title={sh==="addAcc"?"Nova Conta":"Editar Conta"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Conta Corrente" C={C}/><Btn onClick={sh==="addAcc"?addAcc:editAcc}>Salvar</Btn></Sheet>)}
      {(sh==="addCard"||sh==="editCard")&&(<Sheet title={sh==="addCard"?"Novo Cartão":"Editar Cartão"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Visa Platinum" C={C}/><FI label="Limite (R$)" value={f.limit||5000} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Dia fechamento" value={f.closeDay||10} onChange={v=>F({closeDay:v})} type="number" min={1} C={C}/><FI label="Dia vencimento" value={f.dueDay||25} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addCard"?addCard:editCard}>Salvar</Btn></Sheet>)}
      {(sh==="addBox"||sh==="editBox")&&(<Sheet title={sh==="addBox"?"Nova Caixinha":"Editar Caixinha"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Viagem Europa" C={C}/><FI label="Meta (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number" min={0} C={C}/><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBox"?addBox:editBox}>Salvar</Btn></Sheet>)}
      {(sh==="addDebt"||sh==="editDebt")&&(<Sheet title={sh==="addDebt"?"Nova Dívida":"Editar Dívida"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Financiamento Carro" C={C}/><FI label="Credor" value={f.credor||""} onChange={v=>F({credor:v})} placeholder="Ex: Banco Itau" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Total de parcelas" value={f.totalParcelas||12} onChange={v=>F({totalParcelas:v})} type="number" min={1} C={C}/><FI label="Parcelas pagas" value={f.parcelasPagas||0} onChange={v=>F({parcelasPagas:v})} type="number" min={0} C={C}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Valor da parcela (R$)" value={f.valorParcela||0} onChange={v=>F({valorParcela:v})} type="number" min={0} C={C}/><FI label="Dia vencimento" value={f.dueDay||10} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div><FI label="Data de início" value={f.startDate||today} onChange={v=>F({startDate:v})} type="date" C={C}/><ColorPicker value={f.color||"#ef4444"} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||"#ef4444"} onClick={sh==="addDebt"?addDebt:editDebt}>Salvar</Btn></Sheet>)}
      {sh==="payDebt"&&(<Sheet title="Registrar Parcela" onClose={close} C={C}><FI label="Número de parcelas" value={f.qtd||1} onChange={v=>F({qtd:Math.max(1,v)})} type="number" min={1} C={C}/><Btn color={ACCENT} onClick={payDebt}><Ico n="check" size={14}/> Confirmar</Btn></Sheet>)}
      {(sh==="addInv"||sh==="editInv")&&(<Sheet title={sh==="addInv"?"Novo Investimento":"Editar Investimento"} onClose={close} C={C}>{sh==="addInv"&&<><FS label="Banco/Corretora" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FS label="Categoria" value={f.subCat||"rf_pub"} onChange={v=>F({subCat:v})} opts={iCatOpts()} C={C}/></>}<FI label="Nome do ativo" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Tesouro IPCA+" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Aplicado (R$)" value={f.invested||0} onChange={v=>F({invested:v})} type="number" min={0} C={C}/><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/></div><FI label="Taxa referência" value={f.rate||""} onChange={v=>F({rate:v})} placeholder="Ex: IPCA+5.5%" C={C}/><Btn color={ACCENT} onClick={sh==="addInv"?addInv:editInv}>Salvar</Btn></Sheet>)}
      {sh==="checkin"&&(<Sheet title="Atualizar Saldo" onClose={close} C={C}><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={checkin}><Ico n="refresh" size={14}/> Salvar</Btn></Sheet>)}
      {sh==="boxmove"&&(<Sheet title="Movimentar Caixinha" onClose={close} C={C}><div style={{display:"flex",gap:8,marginBottom:12}}>{[{v:"in",l:"Depositar",c:ACCENT},{v:"out",l:"Retirar",c:"#ef4444"}].map(o=>(<button key={o.v} onClick={()=>F({moveType:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+o.c,background:(f.moveType||"in")===o.v?o.c:"transparent",color:(f.moveType||"in")===o.v?"#fff":o.c}}>{o.l}</button>))}</div><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color={(f.moveType||"in")==="in"?ACCENT:"#ef4444"} onClick={boxMove}>Confirmar {(f.moveType||"in")==="in"?"Depósito":"Retirada"}</Btn></Sheet>)}

    </div>
  );
}
