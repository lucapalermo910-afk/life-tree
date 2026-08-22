import { useState, useEffect, createContext } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { SEED_PESSOAS, SEED_DATAS, SEED_REGISTROS, SEED_HABITS } from "./chesed/seedData.js";
import { bindThemeContext } from "./shared/uiBind.jsx";

// ─── Theme ────────────────────────────────────────────────────────────────────
const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
const LIGHT = { bg:"#fff0f8", surface:"#ffffff", card:"#fff5fb", b1:"#f0c8e0", b2:"#e090c0", text:"#200510", muted:"#804060", dim:"#400820", nav:"#fff0f8" };
const ACCENT = "#ec4899";
const ThemeCtx = createContext(LIGHT);

// ─── Utils ────────────────────────────────────────────────────────────────────
const uid      = () => Math.random().toString(36).slice(2,8);
const todayS   = () => new Date().toISOString().slice(0,10);
const diasAte  = (d) => Math.round((new Date(d) - new Date(todayS())) / 864e5);
const diasDesde= (d) => Math.round((new Date(todayS()) - new Date(d)) / 864e5);

// ─── Icon paths ───────────────────────────────────────────────────────────────
const IC = {
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6 6 18M6 6l12 12",
  check:   "M20 6 9 17l-5-5",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:     ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:    "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:    ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  heart:   "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  users:   ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z","M22 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  calendar:["M16 2v4","M8 2v4","M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"],
  pen:     ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
  bell:    ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  sparkle: ["M12 3v4","M12 17v4","M3 12h4","M17 12h4","M5.64 5.64l2.83 2.83","M15.54 15.54l2.83 2.83","M5.64 18.36l2.83-2.83","M15.54 8.46l2.83-2.83"],
  chev:    "M9 18l6-6-6-6",
  back:    "M19 12H5m7 7-7-7 7-7",
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3"],
  zap:     "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  map:     ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z","M9 3v15","M15 6v15"],
  star:    "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  trophy:  ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22","M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22","M18 2H6v7a6 6 0 0 0 12 0V2z"],
  layout:  ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
};

function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if(!d) return null;
  const parts = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {parts.map((p,i) => <path key={i} d={p}/>)}
    </svg>
  );
}

// ─── UI Components ────────────────────────────────────────────────────────────
// Sheet/FI/FTA/FS/Card/Bar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026, item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao ThemeCtx e ao
// ACCENT do módulo, sem mudar nenhum dos ~100 call sites abaixo (nenhum passa C ou color).
const { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);

function ScoreRing({ value, size=90, color=ACCENT, label }) {
  const r = (size-10)/2;
  const circ = 2*Math.PI*r;
  const dash = circ * Math.min(1, Math.max(0, value/100));
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color+"22"} strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .9s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:size>80?22:14,fontWeight:900,color,lineHeight:1}}>{value}</span>
        {label&&<span style={{fontSize:8,color,fontWeight:700,marginTop:2}}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TIPOS_REL   = ["Família","Casal","Amigo próximo","Amigo","Colega","Mentor/Mentee","Outro"];
const FREQ_CONTATO= [{v:1,l:"Diário"},{v:7,l:"Semanal"},{v:14,l:"Quinzenal"},{v:30,l:"Mensal"},{v:90,l:"Trimestral"}];
const TIPOS_DATA  = ["Aniversário","Aniversário de namoro/casamento","Formatura","Data especial","Outro"];
const QUALIDADE   = [{v:1,l:"1 — Superficial"},{v:2,l:"2 — Cordial"},{v:3,l:"3 — Boa"},{v:4,l:"4 — Profunda"},{v:5,l:"5 — Transformadora"}];
const TABS        = [
  {id:"chesed",   icon:"treelife", label:"Chesed"},
  {id:"pessoas",  icon:"users",    label:"Pessoas"},
  {id:"datas",    icon:"calendar", label:"Datas"},
  {id:"registros",icon:"pen",      label:"Registros"},
  {id:"cfg",      icon:"gear",     label:"Config"},
];

const PESSOA_PALETTE = ["#f97316","#8b5cf6",ACCENT,"#06b6d4","#10b981","#f59e0b","#ef4444","#3b82f6","#14b8a6","#6366f1","#84cc16","#f472b6"];
const EMOJI_OPTS = ["😊","👩","👨","🤝","❤️","👵","👴","👧","👦","🧑","👶","🐶","🐱","🎓","💼","⭐","🙏","😎","🤗","🧡"];

const WIDGET_CATALOG = [
  {id:"score",         label:"Score Chesed",       desc:"Número principal + sub-scores + barra", defaultOn:true},
  {id:"datas_proximas",label:"Datas Próximas",     desc:"Aniversários e datas em 30 dias",defaultOn:true},
  {id:"atencao",       label:"Precisam de Atenção",desc:"Pessoas com contato atrasado",   defaultOn:true},
  {id:"habitos_hoje",  label:"Hábitos de Hoje",    desc:"Lista rápida de hábitos",        defaultOn:true},
];
const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w=>w.defaultOn).map(w=>w.id);


// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ChesedModule({ onBack, dark, setDark }) {
  const [tab,  setTab]          = useState("chesed");
  const [page, setPage]         = useState(null);
  const [sh,   setSh]           = useState(null);
  const [f,    setF]            = useState({});
  const F = v => setF(x => ({...x,...v}));
  const [toast, setToast]       = useState(null);
  const [pessoas,   setPessoas]   = useState(SEED_PESSOAS);
  const [datas,     setDatas]     = useState(SEED_DATAS);
  const [registros, setRegistros] = useState(SEED_REGISTROS);
  const [habits,    setHabits]    = useState(SEED_HABITS);
  const [xp,        setXp]        = useState(120);
  const [activeWidgets, setActiveWidgets] = useState(DEFAULT_WIDGETS);

  const C = dark ? DARK : LIGHT;

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const CHESED_PFX = "lifetree_ches_";
  const lsGet = (k) => { try { const v = localStorage.getItem(CHESED_PFX+k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(CHESED_PFX+k, JSON.stringify(v)); } catch {} };

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const p_  = lsGet("pessoas");       if(p_)  setPessoas(p_);
    const d_  = lsGet("datas");         if(d_)  setDatas(d_);
    const r_  = lsGet("registros");     if(r_)  setRegistros(r_);
    const h_  = lsGet("habits");        if(h_)  setHabits(h_);
    const xp_ = lsGet("xp");            if(xp_ !== null) setXp(xp_);
    const w_  = lsGet("activeWidgets"); if(w_)  setActiveWidgets(w_);
    setStorageReady(true);
  }, []);
  // Recarrega do storage quando uma ação do Coach escreve direto (chesedActions.js) —
  // reloadFromStorage não entra nas deps do efeito de mount acima de propósito (só roda uma
  // vez); useCoachDataSync já cuida de chamar de novo quando o evento de sync dispara.
  const reloadFromStorage = () => {
    const p_  = lsGet("pessoas");       if(p_)  setPessoas(p_);
    const d_  = lsGet("datas");         if(d_)  setDatas(d_);
    const r_  = lsGet("registros");     if(r_)  setRegistros(r_);
    const h_  = lsGet("habits");        if(h_)  setHabits(h_);
    const xp_ = lsGet("xp");            if(xp_ !== null) setXp(xp_);
    const w_  = lsGet("activeWidgets"); if(w_)  setActiveWidgets(w_);
  };
  useCoachDataSync("chesed", reloadFromStorage);

  useEffect(() => { if(!storageReady) return; lsSet("pessoas", pessoas); }, [pessoas, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("datas", datas); }, [datas, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("registros", registros); }, [registros, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("habits", habits); }, [habits, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("xp", xp); }, [xp, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("activeWidgets", activeWidgets); }, [activeWidgets, storageReady]);

  const toast_ = (msg, color) => { setToast({msg, color:color||ACCENT}); setTimeout(()=>setToast(null), 2600); };
  const close   = () => { setSh(null); setF({}); };
  const openSh  = (name, init) => { setF(init||{}); setSh(name); };

  // ── Computed ────────────────────────────────────────────────────────────────
  const proximaAnual = (orig) => {
    const d = new Date(orig+"T12:00:00"), hoje = new Date(todayS()+"T12:00:00");
    const p = new Date(hoje.getFullYear(), d.getMonth(), d.getDate());
    if(p < hoje) p.setFullYear(p.getFullYear()+1);
    return p.toISOString().slice(0,10);
  };

  const habScore  = habits.length ? Math.round(habits.filter(h=>h.done).length/habits.length*100) : 0;
  const freqScore = pessoas.length ? Math.round(pessoas.filter(p=>diasDesde(p.ultimoContato)<=p.freqIdeal*1.5).length/pessoas.length*100) : 0;
  const qualScore = registros.length ? Math.round(registros.slice(-5).reduce((s,r)=>s+r.qualidade,0)/Math.min(5,registros.length)/5*100) : 0;
  const chesedScore = Math.round(habScore*0.3 + freqScore*0.4 + qualScore*0.3);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["chesed"] = { score: chesedScore, updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch {}
  }, [chesedScore, storageReady]);

  const datasProx = datas
    .map(d=>({...d, proxima: d.recorrente ? proximaAnual(d.data) : d.data}))
    .filter(d=>diasAte(d.proxima)<=30)
    .sort((a,b)=>diasAte(a.proxima)-diasAte(b.proxima));

  const pessoasAtrasadas = pessoas
    .filter(p=>diasDesde(p.ultimoContato)>p.freqIdeal)
    .sort((a,b)=>diasDesde(b.ultimoContato)-diasDesde(a.ultimoContato));

  // Apagar um registro que era a fonte do "último contato" da pessoa recalcula a data a
  // partir do registro restante mais recente — antes disso, ultimoContato ficava "preso"
  // na data do registro apagado. Se não sobrar nenhum registro, mantém o valor atual (não
  // dá pra saber o contato real sem um registro que o comprove).
  const delRegistro = (id) => {
    const reg = registros.find(r=>r.id===id);
    const remaining = registros.filter(r=>r.id!==id);
    setRegistros(remaining);
    if (!reg) return;
    setPessoas(prev => prev.map(p => {
      if (p.id!==reg.pessoaId || p.ultimoContato!==reg.data) return p;
      const others = remaining.filter(r=>r.pessoaId===p.id);
      if (!others.length) return p;
      const maxDate = others.reduce((m,r)=>r.data>m?r.data:m, others[0].data);
      return {...p, ultimoContato:maxDate};
    }));
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const energiaColor = (e) => e==="positiva"?"#10b981":e==="drenante"?"#ef4444":"#f59e0b";
  const xpLevel = Math.floor(xp/100)+1;
  const xpBar   = (xp%100);

  // ═══════════════════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Chesed Tab ──────────────────────────────────────────────────────────────
  const W = (id) => activeWidgets.includes(id);

  const WidgetCustomizer = () => (
    <Sheet title="Personalizar Dashboard" onClose={close}>
      <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Ative ou desative os blocos do seu dashboard.</div>
      {WIDGET_CATALOG.map(w=>{
        const on = activeWidgets.includes(w.id);
        return (
          <div key={w.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:C.bg,borderRadius:10,marginBottom:8,border:"1px solid "+(on?ACCENT+"44":C.b1)}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:on?C.text:C.muted}}>{w.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{w.desc}</div>
            </div>
            <button onClick={()=>setActiveWidgets(prev=>on?prev.filter(x=>x!==w.id):[...prev,w.id])}
              style={{width:40,height:22,borderRadius:99,cursor:"pointer",border:"none",background:on?ACCENT:C.b2,position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </button>
          </div>
        );
      })}
      <div style={{marginTop:6}}>
        <Btn color={C.muted} outline sm full={false} onClick={()=>setActiveWidgets(DEFAULT_WIDGETS)}>Restaurar padrão</Btn>
      </div>
    </Sheet>
  );

  const ChedsedTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>openSh("widgets")}
          style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:700,color:C.muted}}>
          <Ico n="layout" size={11} color={C.muted}/> Personalizar
        </button>
      </div>

      {/* Score Hero */}
      {W("score")&&<Card style={{background:`linear-gradient(135deg,${ACCENT}22,${ACCENT}06)`,border:`1px solid ${ACCENT}44`,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>CHESED — MISERICÓRDIA</div>
            <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{chesedScore}<span style={{fontSize:18}}>%</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
            {[
              {l:"Frequência", v:freqScore,  c:ACCENT,     t:"pessoas"},
              {l:"Qualidade",  v:qualScore,  c:"#f97316",  t:"registros"},
              {l:"Hábitos",    v:habScore,   c:"#8b5cf6",  t:null},
            ].map(m=>(
              <div key={m.l} onClick={()=>m.t&&setTab(m.t)} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:m.t?"pointer":"default",border:`1px solid ${m.c}22`}}>
                <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
              </div>
            ))}
          </div>
        </div>
        <Bar value={chesedScore} color={`linear-gradient(90deg,${ACCENT},#f97316)`} height={6}/>
      </Card>}

      {/* Upcoming dates */}
      {W("datas_proximas")&&datasProx.length>0&&(
        <div style={{background:"#fbbf2411",border:"1px solid #fbbf2433",borderRadius:14,padding:13,marginBottom:14}}>
          <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:1,marginBottom:10}}>📅 DATAS PRÓXIMAS</div>
          {datasProx.slice(0,3).map(d=>{
            const dias=diasAte(d.proxima);
            const pessoa=pessoas.find(p=>p.id===d.pessoaId);
            return (
              <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderTop:"1px solid #fbbf2422"}}>
                <span style={{fontSize:18}}>{pessoa?.emoji||"🎂"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600}}>{d.nome}</div>
                  {pessoa&&<div style={{fontSize:9,color:C.muted}}>{pessoa.nome}</div>}
                </div>
                <Badge label={dias===0?"HOJE":dias===1?"AMANHÃ":"em "+dias+"d"} color={dias<=3?"#ef4444":dias<=7?"#f59e0b":"#10b981"}/>
              </div>
            );
          })}
        </div>
      )}

      {/* People needing attention */}
      {W("atencao")&&pessoasAtrasadas.length>0&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#ef4444",fontWeight:700,letterSpacing:1,marginBottom:10}}>🔴 PRECISAM DE ATENÇÃO</div>
          {pessoasAtrasadas.slice(0,3).map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
              <span style={{fontSize:22}}>{p.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{p.nome}</div>
                <div style={{fontSize:9,color:"#ef4444"}}>Sem contato há {diasDesde(p.ultimoContato)}d · ideal: {p.freqIdeal}d</div>
              </div>
              <Btn sm full={false} color={p.cor} onClick={()=>openSh("addRegistro",{pessoaId:p.id,data:todayS(),tipo:"Mensagem",conteudo:"",qualidade:3})}>+ Reg.</Btn>
            </div>
          ))}
        </Card>
      )}

      {/* Habits */}
      {W("habitos_hoje")&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:800}}>Hábitos de Hoje</div>
          <span style={{fontSize:10,color:ACCENT,fontWeight:700,background:ACCENT+"15",padding:"2px 10px",borderRadius:99}}>{habits.filter(h=>h.done).length}/{habits.length}</span>
        </div>
        {habits.map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:`1px solid ${C.b1}`}}>
            <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp); setHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
              style={{width:24,height:24,borderRadius:7,flexShrink:0,cursor:"pointer",border:`1.5px solid ${h.done?ACCENT:C.b2}`,background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
              {h.done&&<Ico n="check" size={12} color="#fff" sw={2.5}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none",transition:"all .2s"}}>{h.title}</div>
              <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          </div>
        ))}
      </Card>}
    </div>
  );

  // ── Pessoas Tab ─────────────────────────────────────────────────────────────
  const PessoasTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:14,fontWeight:800}}>Pessoas que importam</div>
          <div style={{fontSize:10,color:C.muted}}>{pessoas.length} conexões ativas</div>
        </div>
        <Btn sm full={false} onClick={()=>openSh("addPessoa",{nome:"",emoji:"😊",tipo:TIPOS_REL[0],freqIdeal:7,energia:"positiva",nota:"",cor:ACCENT})}>
          <Ico n="plus" size={11}/> Pessoa
        </Btn>
      </div>
      {pessoas.map(p=>{
        const diasSem = diasDesde(p.ultimoContato);
        const atrasado = diasSem > p.freqIdeal;
        const statusColor = !atrasado?"#10b981":diasSem>p.freqIdeal*2?"#ef4444":"#f59e0b";
        const regsP = registros.filter(r=>r.pessoaId===p.id);
        return (
          <Card key={p.id} color={atrasado?"#ef4444":p.cor} style={{marginBottom:10,transition:"transform .15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",gap:11,flex:1}}>
                <div style={{width:46,height:46,borderRadius:14,background:p.cor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{p.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800}}>{p.nome}</div>
                  <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
                    <Badge label={p.tipo} color={p.cor}/>
                    <Badge label={atrasado?"Atrasado":"Em dia"} color={statusColor}/>
                    <Badge label={p.energia} color={energiaColor(p.energia)}/>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>setPage({type:"pessoa",id:p.id})} style={{background:p.cor+"18",border:`1px solid ${p.cor}33`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:p.cor,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>Ver <Ico n="chev" size={10} color={p.cor}/></button>
                <button onClick={()=>openSh("editPessoa",{...p})} style={{background:C.b1,border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
                <button onClick={()=>{setPessoas(prev=>prev.filter(x=>x.id!==p.id));toast_("Removido","#ef4444");}} style={{background:C.b1,border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,color:statusColor,fontWeight:600}}>{diasSem===0?"Contato hoje":"Há "+diasSem+" dias · ideal: "+p.freqIdeal+"d"}</div>
                <div style={{fontSize:9,color:C.muted}}>{regsP.length} registros · {p.nota||"Sem nota"}</div>
              </div>
              <Btn sm full={false} color={p.cor} onClick={()=>openSh("addRegistro",{pessoaId:p.id,data:todayS(),tipo:"Conversa",conteudo:"",qualidade:3})}>+ Registro</Btn>
            </div>
          </Card>
        );
      })}
      {pessoas.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>👥</div>
        <div style={{fontSize:12}}>Adicione pessoas que importam para você</div>
      </div>}
    </div>
  );

  // ── Pessoa Page ─────────────────────────────────────────────────────────────
  const PessoaPage = () => {
    const p = pessoas.find(x=>x.id===page.id); if(!p) return null;
    const regsP = [...registros.filter(r=>r.pessoaId===p.id)].reverse();
    const datasP = datas.filter(d=>d.pessoaId===p.id).map(d=>({...d,proxima:d.recorrente?proximaAnual(d.data):d.data}));
    const avgQual = regsP.length ? (regsP.reduce((s,r)=>s+r.qualidade,0)/regsP.length).toFixed(1) : "—";
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{background:`linear-gradient(135deg,${p.cor}18,${p.cor}06)`,border:`1px solid ${p.cor}33`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"flex",gap:13,flex:1}}>
              <div style={{width:58,height:58,borderRadius:17,background:p.cor+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>{p.emoji}</div>
              <div>
                <div style={{fontSize:18,fontWeight:900}}>{p.nome}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:5}}>{p.tipo}</div>
                {p.nota&&<div style={{fontSize:11,color:C.dim,fontStyle:"italic",lineHeight:1.4}}>{p.nota}</div>}
              </div>
            </div>
            <button onClick={()=>openSh("editPessoa",{...p})} style={{background:p.cor+"22",border:`1px solid ${p.cor}44`,borderRadius:9,padding:"6px 12px",cursor:"pointer",color:p.cor,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
              <Ico n="edit" size={11} color={p.cor}/> Editar
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
            {[
              {l:"Último contato",v:diasDesde(p.ultimoContato)===0?"Hoje":diasDesde(p.ultimoContato)+"d atrás"},
              {l:"Frequência",v:"A cada "+p.freqIdeal+"d"},
              {l:"Registros",v:regsP.length},
              {l:"Qualidade média",v:avgQual+"⭐"},
            ].map(s=>(
              <div key={s.l} style={{background:C.card,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontSize:7,color:C.muted,fontWeight:600,marginBottom:3,lineHeight:1.2}}>{s.l.toUpperCase()}</div>
                <div style={{fontSize:11,fontWeight:800,color:p.cor}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {(p.interesses||p.presentes||p.topicosPendentes)&&(
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>INFORMAÇÕES IMPORTANTES</div>
            {[
              {l:"Interesses",v:p.interesses,ic:"sparkle"},
              {l:"Presentes já dados",v:p.presentes,ic:"star"},
              {l:"Tópicos pendentes",v:p.topicosPendentes,ic:"bell"},
            ].filter(x=>x.v).map(x=>(
              <div key={x.l} style={{display:"flex",gap:9,padding:"7px 0",borderTop:`1px solid ${C.b1}`}}>
                <Ico n={x.ic} size={13} color={p.cor}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>{x.l.toUpperCase()}</div>
                  <div style={{fontSize:12,lineHeight:1.5}}>{x.v}</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {datasP.length>0&&(
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>DATAS ESPECIAIS</div>
            {datasP.map(d=>{
              const dias=diasAte(d.proxima);
              return (
                <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{d.nome}</div>
                    <div style={{fontSize:9,color:C.muted}}>{d.tipo} · {d.recorrente?"Recorrente":"Único"}</div>
                  </div>
                  <Badge label={dias<=0?"HOJE":dias===1?"AMANHÃ":"em "+dias+"d"} color={dias<=7?"#ef4444":dias<=30?"#f59e0b":C.muted}/>
                </div>
              );
            })}
            <Btn sm outline color={p.cor} style={{marginTop:10}} onClick={()=>openSh("addData",{pessoaId:p.id,nome:"",data:"",tipo:TIPOS_DATA[0],recorrente:true,lembrete:7})}>
              <Ico n="plus" size={11}/> Data especial
            </Btn>
          </Card>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:800}}>Histórico de Contatos</div>
          <Btn sm full={false} color={p.cor} onClick={()=>openSh("addRegistro",{pessoaId:p.id,data:todayS(),tipo:"Conversa",conteudo:"",qualidade:3})}>
            <Ico n="plus" size={11}/> Registrar
          </Btn>
        </div>
        {regsP.length===0&&<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Nenhum registro ainda</div>}
        {regsP.map(r=>(
          <div key={r.id} style={{padding:"11px 13px",background:C.card,border:`1px solid ${C.b1}`,borderRadius:12,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div><div style={{fontSize:11,fontWeight:700}}>{r.tipo}</div><div style={{fontSize:9,color:C.muted}}>{r.data}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><span key={n} style={{fontSize:11,color:n<=r.qualidade?"#fbbf24":C.b2}}>★</span>)}</div>
                <button onClick={()=>delRegistro(r.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={12} color={C.muted}/></button>
              </div>
            </div>
            {r.conteudo&&<div style={{fontSize:12,lineHeight:1.6,color:C.text}}>{r.conteudo}</div>}
          </div>
        ))}
      </div>
    );
  };

  // ── Datas Tab ───────────────────────────────────────────────────────────────
  const DatasTab = () => {
    const todasDatas = datas
      .map(d=>({...d,proxima:d.recorrente?proximaAnual(d.data):d.data,pessoa:pessoas.find(p=>p.id===d.pessoaId)}))
      .sort((a,b)=>diasAte(a.proxima)-diasAte(b.proxima));
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:14,fontWeight:800}}>Datas Especiais</div>
            <div style={{fontSize:10,color:C.muted}}>{datas.length} datas cadastradas</div>
          </div>
          <Btn sm full={false} onClick={()=>openSh("addData",{pessoaId:pessoas[0]?.id||"",nome:"",data:"",tipo:TIPOS_DATA[0],recorrente:true,lembrete:7})}>
            <Ico n="plus" size={11}/> Data
          </Btn>
        </div>
        {["Esta semana","Este mês","Próximos 3 meses","Mais distante"].map(grupo=>{
          const filtradas=todasDatas.filter(d=>{
            const dias=diasAte(d.proxima);
            return grupo==="Esta semana"?dias<=7&&dias>=0
                  :grupo==="Este mês"?dias<=30&&dias>7
                  :grupo==="Próximos 3 meses"?dias<=90&&dias>30
                  :dias>90||dias<0;
          });
          if(!filtradas.length) return null;
          const cor=grupo==="Esta semana"?"#ef4444":grupo==="Este mês"?"#f59e0b":grupo==="Próximos 3 meses"?ACCENT:C.muted;
          return (
            <div key={grupo} style={{marginBottom:18}}>
              <div style={{fontSize:10,color:cor,fontWeight:700,letterSpacing:1.2,marginBottom:8}}>{grupo.toUpperCase()}</div>
              {filtradas.map(d=>{
                const dias=diasAte(d.proxima);
                return (
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px",background:C.card,border:`1px solid ${C.b1}`,borderRadius:12,marginBottom:7}}>
                    <div style={{width:40,height:40,borderRadius:12,background:cor+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{d.pessoa?.emoji||"🎂"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700}}>{d.nome}</div>
                      <div style={{fontSize:9,color:C.muted}}>{d.pessoa?.nome||""} · {d.proxima}</div>
                    </div>
                    <Badge label={dias===0?"HOJE":dias===1?"AMANHÃ":"em "+dias+"d"} color={cor}/>
                    <button onClick={()=>setDatas(p=>p.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {datas.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
          <div style={{fontSize:32,marginBottom:8}}>📅</div>
          <div style={{fontSize:12}}>Adicione datas importantes das pessoas que você ama</div>
        </div>}
      </div>
    );
  };

  // ── Registros Tab ────────────────────────────────────────────────────────────
  const RegistrosTab = () => {
    const todos = [...registros].reverse();
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:14,fontWeight:800}}>Registros & Insights</div>
            <div style={{fontSize:10,color:C.muted}}>{registros.length} registros</div>
          </div>
          <Btn sm full={false} onClick={()=>openSh("addRegistro",{pessoaId:pessoas[0]?.id||"",data:todayS(),tipo:"Conversa",conteudo:"",qualidade:3})}>
            <Ico n="plus" size={11}/> Registrar
          </Btn>
        </div>
        {todos.map(r=>{
          const p=pessoas.find(x=>x.id===r.pessoaId);
          return (
            <Card key={r.id} style={{marginBottom:9}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:r.conteudo?8:0}}>
                <div style={{width:38,height:38,borderRadius:11,background:(p?.cor||ACCENT)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p?.emoji||"👤"}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <span style={{fontSize:12,fontWeight:700}}>{p?.nome||"?"}</span>
                      <span style={{fontSize:11,color:C.muted}}> · {r.tipo}</span>
                    </div>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><span key={n} style={{fontSize:10,color:n<=r.qualidade?"#fbbf24":C.b2}}>★</span>)}</div>
                      <button onClick={()=>delRegistro(r.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={12} color={C.muted}/></button>
                    </div>
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2}}>{r.data}</div>
                </div>
              </div>
              {r.conteudo&&<div style={{fontSize:12,lineHeight:1.6,color:C.text,paddingTop:8,borderTop:`1px solid ${C.b1}`}}>{r.conteudo}</div>}
            </Card>
          );
        })}
        {todos.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
          <div style={{fontSize:32,marginBottom:8}}>📝</div>
          <div style={{fontSize:12}}>Registre seus contatos para acompanhar as conexões</div>
        </div>}
      </div>
    );
  };

  // ── Config Tab ───────────────────────────────────────────────────────────────
  const ConfigTab = () => {
    const Row = ({title,sub,onEdit,onDel}) => (
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:C.surface,borderRadius:10,marginBottom:7}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600}}>{title}</div>
          {sub&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>{sub}</div>}
        </div>
        {onEdit&&<button onClick={onEdit} style={{background:C.b1,border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>}
        {onDel&&<button onClick={onDel} style={{background:C.b1,border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>}
      </div>
    );
    const Sec = ({title,addLabel,onAdd,children}) => (
      <div style={{background:C.card,border:`1px solid ${C.b1}`,borderRadius:15,padding:14,marginBottom:11}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:800}}>{title}</span>
          <Btn sm full={false} onClick={onAdd}><Ico n="plus" size={11}/> {addLabel}</Btn>
        </div>
        {children}
      </div>
    );

    const scoreCard = (
      <div style={{background:`${ACCENT}11`,border:`2px solid ${ACCENT}33`,borderRadius:15,padding:15,textAlign:"center",marginBottom:11}}>
        <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1.2,marginBottom:6}}>SCORE CHESED — CONTRIBUIÇÃO PARA A ÁRVORE</div>
        <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{chesedScore}<span style={{fontSize:16}}>%</span></div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
          <Badge label={`Freq: ${freqScore}%`} color={ACCENT}/>
          <Badge label={`Qual: ${qualScore}%`} color="#f97316"/>
          <Badge label={`Háb: ${habScore}%`} color="#8b5cf6"/>
        </div>
      </div>
    );

    return (
      <div style={{animation:"slideUp .35s ease"}}>
        {scoreCard}
        <Sec title="Pessoas" addLabel="Adicionar" onAdd={()=>openSh("addPessoa",{nome:"",emoji:"😊",tipo:TIPOS_REL[0],freqIdeal:7,energia:"positiva",nota:"",cor:ACCENT})}>
          {pessoas.map(p=><Row key={p.id} title={p.emoji+" "+p.nome} sub={p.tipo+" · contato a cada "+p.freqIdeal+"d · "+p.energia} onEdit={()=>openSh("editPessoa",{...p})} onDel={()=>{setPessoas(prev=>prev.filter(x=>x.id!==p.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Hábitos de Relacionamento" addLabel="Adicionar" onAdd={()=>openSh("addHabit",{title:"",freq:"Semanal",xp:15})}>
          {habits.map(h=><Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"} onEdit={()=>openSh("editHabit",{...h})} onDel={()=>{setHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>)}
        </Sec>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SHEETS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSheet = () => {
    if(!sh) return null;

    if(sh==="addPessoa"||sh==="editPessoa") {
      const isEdit = sh==="editPessoa";
      return (
        <Sheet title={isEdit?"Editar Pessoa":"Nova Pessoa"} onClose={close}>
          <FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})} placeholder="Ex: Lucas"/>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>EMOJI</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {EMOJI_OPTS.map(em=>(
                <button key={em} onClick={()=>F({emoji:em})} style={{width:32,height:32,borderRadius:9,fontSize:16,cursor:"pointer",border:(f.emoji||"😊")===em?`2px solid ${ACCENT}`:`1px solid ${C.b2}`,background:(f.emoji||"😊")===em?ACCENT+"18":C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{em}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>COR</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {PESSOA_PALETTE.map(cl=>(
                <button key={cl} onClick={()=>F({cor:cl})} style={{width:26,height:26,borderRadius:"50%",background:cl,border:(f.cor||PESSOA_PALETTE[0])===cl?"2.5px solid "+C.text:"2px solid transparent",cursor:"pointer",padding:0}}/>
              ))}
            </div>
          </div>
          <FS label="Tipo de relação" value={f.tipo||TIPOS_REL[0]} onChange={v=>F({tipo:v})} opts={TIPOS_REL.map(t=>({v:t,l:t}))}/>
          <FS label="Frequência ideal de contato" value={f.freqIdeal||7} onChange={v=>F({freqIdeal:Number(v)})} opts={FREQ_CONTATO.map(fc=>({v:fc.v,l:fc.l}))}/>
          <FS label="Energia que traz" value={f.energia||"positiva"} onChange={v=>F({energia:v})} opts={[{v:"positiva",l:"Positiva — me renova"},{v:"neutra",l:"Neutra — confortável"},{v:"drenante",l:"Drenante — me cansa"}]}/>
          <FTA label="Nota pessoal" value={f.nota||""} onChange={v=>F({nota:v})} rows={2} placeholder="O que é especial nesta pessoa?"/>
          <FTA label="Interesses" value={f.interesses||""} onChange={v=>F({interesses:v})} rows={2} placeholder="Hobbies, assuntos favoritos..."/>
          <FTA label="Presentes já dados" value={f.presentes||""} onChange={v=>F({presentes:v})} rows={2} placeholder="Pra não repetir presente"/>
          <FTA label="Tópicos de conversa pendentes" value={f.topicosPendentes||""} onChange={v=>F({topicosPendentes:v})} rows={2} placeholder="O que perguntar/lembrar na próxima conversa"/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.nome) return;
            if(isEdit) {
              setPessoas(p=>p.map(x=>x.id===f.id?{...x,...f,freqIdeal:Number(f.freqIdeal)}:x));
              toast_("Atualizado");
            } else {
              setPessoas(p=>[...p,{id:"p"+uid(),nome:f.nome,emoji:f.emoji||"😊",tipo:f.tipo||TIPOS_REL[0],freqIdeal:Number(f.freqIdeal)||7,ultimoContato:todayS(),energia:f.energia||"positiva",nota:f.nota||"",cor:f.cor||PESSOA_PALETTE[0],interesses:f.interesses||"",presentes:f.presentes||"",topicosPendentes:f.topicosPendentes||""}]);
              toast_("Pessoa adicionada ✨");
            }
            close();
          }}>{isEdit?"Salvar":"Adicionar"}</Btn>
        </Sheet>
      );
    }

    if(sh==="addRegistro") return (
      <Sheet title="Registrar Contato" onClose={close}>
        <FS label="Pessoa" value={f.pessoaId||""} onChange={v=>F({pessoaId:v})} opts={pessoas.map(p=>({v:p.id,l:p.emoji+" "+p.nome}))}/>
        <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
        <FS label="Tipo" value={f.tipo||"Conversa"} onChange={v=>F({tipo:v})} opts={["Conversa","Mensagem","Encontro","Ligação","Vídeo","Evento","Outro"].map(t=>({v:t,l:t}))}/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>QUALIDADE DO CONTATO</div>
          <div style={{display:"flex",gap:5}}>
            {QUALIDADE.map(q=>(
              <button key={q.v} onClick={()=>F({qualidade:q.v})} style={{flex:1,padding:"8px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:9,border:`1.5px solid ${(f.qualidade||3)===q.v?ACCENT:C.b2}`,background:(f.qualidade||3)===q.v?ACCENT+"22":"transparent",color:(f.qualidade||3)===q.v?ACCENT:C.muted,textAlign:"center",lineHeight:1.3}}>
                {q.l.split(" — ")[0]}
              </button>
            ))}
          </div>
        </div>
        <FTA label="O que aconteceu? Insights?" value={f.conteudo||""} onChange={v=>F({conteudo:v})} placeholder="Como foi? O que você percebeu?" rows={4}/>
        <Btn color={ACCENT} onClick={()=>{
          if(!f.pessoaId) return;
          const regData = f.data||todayS();
          setRegistros(p=>[...p,{id:"r"+uid(),pessoaId:f.pessoaId,data:regData,tipo:f.tipo||"Conversa",conteudo:f.conteudo||"",qualidade:f.qualidade||3}]);
          setPessoas(p=>p.map(x=>x.id===f.pessoaId?{...x,ultimoContato:regData>x.ultimoContato?regData:x.ultimoContato}:x));
          setXp(v=>v+20);
          toast_("Contato registrado +20 XP 🎉");
          close();
        }}>Registrar</Btn>
      </Sheet>
    );

    if(sh==="addData") return (
      <Sheet title="Nova Data Especial" onClose={close}>
        <FS label="Pessoa" value={f.pessoaId||""} onChange={v=>F({pessoaId:v})} opts={pessoas.map(p=>({v:p.id,l:p.emoji+" "+p.nome}))}/>
        <FI label="Nome da data" value={f.nome||""} onChange={v=>F({nome:v})} placeholder="Ex: Aniversário"/>
        <FS label="Tipo" value={f.tipo||TIPOS_DATA[0]} onChange={v=>F({tipo:v})} opts={TIPOS_DATA.map(t=>({v:t,l:t}))}/>
        <FI label="Data" value={f.data||""} onChange={v=>F({data:v})} type="date"/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>RECORRÊNCIA ANUAL</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:true,l:"Sim (todo ano)"},{v:false,l:"Única vez"}].map(o=>(
              <button key={String(o.v)} onClick={()=>F({recorrente:o.v})} style={{flex:1,padding:"9px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,border:`1.5px solid ${(f.recorrente!==false&&o.v||f.recorrente===o.v)?ACCENT:C.b2}`,background:(f.recorrente!==false&&o.v||f.recorrente===o.v)?ACCENT+"22":"transparent",color:(f.recorrente!==false&&o.v||f.recorrente===o.v)?ACCENT:C.text}}>{o.l}</button>
            ))}
          </div>
        </div>
        <Btn color={ACCENT} onClick={()=>{
          if(!f.nome||!f.data) return;
          setDatas(p=>[...p,{id:"dt"+uid(),nome:f.nome,pessoaId:f.pessoaId||"",data:f.data,tipo:f.tipo||TIPOS_DATA[0],recorrente:f.recorrente!==false,lembrete:7}]);
          toast_("Data adicionada 📅");
          close();
        }}>Adicionar</Btn>
      </Sheet>
    );

    if(sh==="addHabit"||sh==="editHabit") {
      const isEdit = sh==="editHabit";
      return (
        <Sheet title={isEdit?"Editar Hábito":"Novo Hábito"} onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Ligar para família"/>
          <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}]}/>
          <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number" min={1}/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.title) return;
            if(isEdit) {
              setHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));
              toast_("Atualizado");
            } else {
              setHabits(p=>[...p,{id:"rh"+uid(),title:f.title,freq:f.freq||"Semanal",xp:Number(f.xp)||15,done:false}]);
              toast_("Hábito criado");
            }
            close();
          }}>{isEdit?"Salvar":"Criar"}</Btn>
        </Sheet>
      );
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const currentTab = tab;
  const isPersonPage = page?.type==="pessoa";

  return (
    <ThemeCtx.Provider value={C}>
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text,position:"relative"}}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
        select option{background:${C.surface};}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.85)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        input,select,textarea{color-scheme:${dark?"dark":"light"};}
      `}</style>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:18,left:"50%",background:toast.color,color:"#fff",padding:"9px 20px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)",boxShadow:"0 4px 20px "+toast.color+"66"}}>
          {toast.msg}
        </div>
      )}

      {/* BOTÃO VOLTAR → ÁRVORE */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Chesed · Relacionamentos</span>
      </div>

      {/* Header */}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.bg,zIndex:40,borderBottom:`1px solid ${C.b1}`,paddingBottom:12}}>
        <div>
          {isPersonPage&&(
            <button onClick={()=>setPage(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:700,padding:"0 0 5px",marginBottom:2}}>
              <Ico n="back" size={12}/> voltar
            </button>
          )}
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2.5}}>CHESED</div>
          <div style={{fontSize:17,fontWeight:900,letterSpacing:-.3}}>
            {isPersonPage ? pessoas.find(p=>p.id===page.id)?.nome || "Pessoa" : "Relacionamentos"}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",background:"#fbbf2415",padding:"4px 10px",borderRadius:99}}>
            Nível {xpLevel} · {xp} XP
          </div>
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:`1px solid ${C.b1}`,borderRadius:9,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"14px 16px 100px"}}>
        {isPersonPage
          ? PessoaPage()
          : <>
            {currentTab==="chesed"    && ChedsedTab()}
            {currentTab==="pessoas"   && PessoasTab()}
            {currentTab==="datas"     && DatasTab()}
            {currentTab==="registros" && RegistrosTab()}
            {currentTab==="cfg"       && ConfigTab()}
          </>
        }
      </div>

      {/* Bottom Nav */}
      {!isPersonPage&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:`1px solid ${C.b1}`,zIndex:50,padding:"8px 0 16px",display:"flex",backdropFilter:"blur(12px)"}}>
          {TABS.map(t=>{
            const a = currentTab===t.id;
            return (
              <button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"2px 0",transition:"transform .1s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{width:36,height:30,borderRadius:9,background:a?ACCENT+"18":"transparent",border:a?`1px solid ${ACCENT}30`:"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                  <Ico n={t.icon} size={14} color={a?ACCENT:C.muted}/>
                </div>
                <span style={{fontSize:8,fontWeight:700,color:a?ACCENT:C.muted,letterSpacing:.3}}>{t.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sheets */}
      {renderSheet()}
      {sh==="widgets"&&WidgetCustomizer()}
    </div>
    </ThemeCtx.Provider>
  );
}
