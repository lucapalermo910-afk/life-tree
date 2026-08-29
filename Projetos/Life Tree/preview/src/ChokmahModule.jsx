import { useState, useEffect, createContext } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { D_PRATICA_HABITS, D_TRADICOES } from "./chokmah/seedData.js";
import { bindThemeContext } from "./shared/uiBind.jsx";

const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
const LIGHT = { bg:"#faf5ff", surface:"#ffffff", card:"#fdf9ff", b1:"#e9d5ff", b2:"#c084fc", text:"#2e1065", muted:"#7c5aa6", dim:"#3b0764", nav:"#faf5ff" };
const ThemeCtx = createContext(LIGHT);
const ACCENT = "#c084fc";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);
const diasDesde = (d) => d ? Math.round((new Date(todayS()) - new Date(d)) / 864e5) : 999;

const IC = {
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6 6 18M6 6l12 12",
  check:   "M20 6 9 17l-5-5",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:     ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:    "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:    ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  back:    "M19 12H5m7 7-7-7 7-7",
  sparkle: ["M12 3v4","M12 17v4","M3 12h4","M17 12h4","M5.64 5.64l2.83 2.83","M15.54 15.54l2.83 2.83","M5.64 18.36l2.83-2.83","M15.54 8.46l2.83-2.83"],
  compass: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"],
  pen:     ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
  layout:  ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  lotus:   ["M12 21c-4-2.6-4-6.7-4-8.5a4 4 0 0 1 8 0c0 1.8 0 5.9-4 8.5Z","M12 12.5c-2.6-1.6-4.3-4.2-4.6-7","M12 12.5c2.6-1.6 4.3-4.2 4.6-7","M12 12.5c-.8-2.6-.8-5.3 0-8","M12 12.5c.8-2.6.8-5.3 0-8"],
  flame:   ["M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.5-1.5-2-1-4 .3-1.3-.5-3-1.5-3 .5 1.5-1 2-1 4a2 2 0 0 1-2-2c-1 1-2 2-2 4.5A5.5 5.5 0 0 0 11.5 22a5.5 5.5 0 0 0 5.5-5.5c0-3-2-4.5-2.5-9-1.5 1-3 3-3 6.5"],
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

// Sheet/FI/FTA/FS/Card/Bar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026, item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao ThemeCtx e ao
// ACCENT do módulo, sem mudar nenhum call site.
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

const TABS = [
  {id:"chok",     icon:"lotus",   label:"Chokmah"},
  {id:"praticas", icon:"sparkle", label:"Práticas"},
  {id:"tradicoes",icon:"compass", label:"Tradições"},
  {id:"diario",   icon:"pen",     label:"Diário"},
  {id:"cfg",      icon:"gear",    label:"Config"},
];

const FREQ_OPTS = [{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}];
const TRAD_TIPOS = ["Religião","Filosofia","Tradição contemplativa","Outro"];
const TRAD_STATUS = [{v:"explorando",l:"Explorando"},{v:"praticando",l:"Praticando"},{v:"pausado",l:"Em pausa"}];
const TRAD_PALETTE = ["#c084fc","#f472b6","#f59e0b","#06b6d4","#10b981","#ef4444","#3b82f6","#8b5cf6","#14b8a6","#f97316","#6366f1","#84cc16"];
const MED_MINUTES = [5,10,15,20];
const DIARY_PROMPTS = [
  {k:"paz",       q:"O que me deu paz hoje?"},
  {k:"gratidao",  q:"Um momento de gratidão"},
  {k:"aprendizado",q:"O que percebi sobre mim hoje?"},
];

const WIDGET_CATALOG = [
  {id:"score",       label:"Score Chokmah",         desc:"Número principal + sub-scores + barra", defaultOn:true},
  {id:"tradicoes_hub",label:"Tradições em Exploração",desc:"Tradições marcadas como explorando ou praticando",defaultOn:true},
  {id:"habitos_hoje",label:"Hábitos de Hoje",       desc:"Lista rápida de hábitos",           defaultOn:true},
];
const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w=>w.defaultOn).map(w=>w.id);

const D_MEDITATION_LOG = []; // [{id,date,minutes}]
const D_DIARY = []; // [{id,date,prompt,texto}]

export default function ChokmahModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [tab,  setTab]  = useState("chok");
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);
  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2600); };
  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };

  const [praticaHabits, setPraticaHabits] = useState(D_PRATICA_HABITS);
  const [tradicoes,     setTradicoes]     = useState(D_TRADICOES);
  const [meditationLog, setMeditationLog] = useState(D_MEDITATION_LOG);
  const [diary,         setDiary]         = useState(D_DIARY);
  const [xp, setXp] = useState(0);
  const [activeWidgets, setActiveWidgets] = useState(DEFAULT_WIDGETS);

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const PFX = "lifetree_chok_";
  const lsGet = (k) => { try { const v = localStorage.getItem(PFX+k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(PFX+k, JSON.stringify(v)); } catch {} };

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const ph_ = lsGet("praticaHabits"); if(ph_) setPraticaHabits(ph_);
    const tr_ = lsGet("tradicoes");     if(tr_) setTradicoes(tr_);
    const ml_ = lsGet("meditationLog"); if(ml_) setMeditationLog(ml_);
    const di_ = lsGet("diary");         if(di_) setDiary(di_);
    const xp_ = lsGet("xp");            if(xp_ !== null) setXp(xp_);
    const w_  = lsGet("activeWidgets"); if(w_)  setActiveWidgets(w_);
    setStorageReady(true);
  }, []);
  const reloadFromStorage = () => {
    const ph_ = lsGet("praticaHabits"); if(ph_) setPraticaHabits(ph_);
    const tr_ = lsGet("tradicoes");     if(tr_) setTradicoes(tr_);
    const ml_ = lsGet("meditationLog"); if(ml_) setMeditationLog(ml_);
    const di_ = lsGet("diary");         if(di_) setDiary(di_);
    const xp_ = lsGet("xp");            if(xp_ !== null) setXp(xp_);
  };
  useCoachDataSync("chokmah", reloadFromStorage);

  useEffect(() => { if(!storageReady) return; lsSet("praticaHabits", praticaHabits); }, [praticaHabits, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("tradicoes", tradicoes); }, [tradicoes, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("meditationLog", meditationLog); }, [meditationLog, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("diary", diary); }, [diary, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("xp", xp); }, [xp, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("activeWidgets", activeWidgets); }, [activeWidgets, storageReady]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const streakFromDates = (dates) => {
    const uniq = [...new Set(dates)].sort().reverse();
    if(!uniq.length) return 0;
    let streak = 0;
    let cursor = new Date(todayS());
    for (const d of uniq) {
      const dd = new Date(d);
      const diff = Math.round((cursor-dd)/864e5);
      if (diff===0 || diff===1) { streak++; cursor = dd; } else break;
    }
    return streak;
  };

  const habScore = praticaHabits.length ? Math.round(praticaHabits.filter(h=>h.done).length/praticaHabits.length*100) : 0;
  const medStreak = streakFromDates(meditationLog.map(m=>m.date));
  const medScore  = Math.min(100, medStreak*15);
  const diaryEntries7d = diary.filter(d=>diasDesde(d.date)<=7).length;
  const diarioScore = Math.min(100, Math.round(diaryEntries7d/7*100));
  const chokScore = Math.round(habScore*0.35 + medScore*0.3 + diarioScore*0.35);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["chokmah"] = { score: chokScore, updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch {}
  }, [chokScore, storageReady]);

  const tradicoesAtivas = tradicoes.filter(t=>t.status==="explorando"||t.status==="praticando");

  const logMeditation = (minutes) => {
    const date = todayS();
    setMeditationLog(prev => {
      const existing = prev.find(m=>m.date===date);
      if (existing) return prev.map(m=>m.date===date?{...m,minutes:m.minutes+minutes}:m);
      return [...prev, {id:"med"+uid(), date, minutes}];
    });
    setXp(v=>v+minutes*2);
    toast_(`Meditação registrada (+${minutes} min) 🧘`);
  };

  // ─── Widget customizer ────────────────────────────────────────────────────
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

  // ── Chokmah Tab (hub) ────────────────────────────────────────────────────────
  const ChokTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>openSh("widgets")}
          style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:700,color:C.muted}}>
          <Ico n="layout" size={11} color={C.muted}/> Personalizar
        </button>
      </div>

      {W("score")&&<Card style={{background:`linear-gradient(135deg,${ACCENT}22,${ACCENT}06)`,border:`1px solid ${ACCENT}44`,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>CHOKMAH — SABEDORIA</div>
            <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{chokScore}<span style={{fontSize:18}}>%</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
            {[
              {l:"Práticas",  v:habScore,   c:ACCENT,     t:"praticas"},
              {l:"Meditação", v:medScore,   c:"#06b6d4",  t:"praticas"},
              {l:"Diário",    v:diarioScore,c:"#f59e0b",  t:"diario"},
            ].map(m=>(
              <div key={m.l} onClick={()=>setTab(m.t)} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:"pointer",border:`1px solid ${m.c}22`}}>
                <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
              </div>
            ))}
          </div>
        </div>
        <Bar value={chokScore} color={`linear-gradient(90deg,${ACCENT},#f472b6)`} height={6}/>
      </Card>}

      {medStreak>0&&<Card style={{marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:22}}>🔥 {medStreak}</div>
        <div style={{fontSize:9,color:C.muted,marginTop:2}}>dias seguidos meditando</div>
      </Card>}

      {W("tradicoes_hub")&&tradicoesAtivas.length>0&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>TRADIÇÕES EM EXPLORAÇÃO</div>
          {tradicoesAtivas.map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.cor,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{t.nome}</div>
                <div style={{fontSize:9,color:C.muted}}>{t.tipo}</div>
              </div>
              <Badge label={TRAD_STATUS.find(s=>s.v===t.status)?.l} color={t.cor}/>
            </div>
          ))}
        </Card>
      )}

      {W("habitos_hoje")&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:800}}>Práticas de Hoje</div>
          <span style={{fontSize:10,color:ACCENT,fontWeight:700,background:ACCENT+"15",padding:"2px 10px",borderRadius:99}}>{praticaHabits.filter(h=>h.done).length}/{praticaHabits.length}</span>
        </div>
        {praticaHabits.map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:`1px solid ${C.b1}`}}>
            <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp); setPraticaHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
              style={{width:24,height:24,borderRadius:7,flexShrink:0,cursor:"pointer",border:`1.5px solid ${h.done?ACCENT:C.b2}`,background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
              {h.done&&<Ico n="check" size={12} color="#fff" sw={2.5}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
              <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          </div>
        ))}
      </Card>}
    </div>
  );

  // ── Práticas Tab ─────────────────────────────────────────────────────────────
  const PraticasTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:800,marginBottom:4}}>Meditar agora</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:12}}>Um toque registra a sessão e soma ao streak</div>
        <div style={{display:"flex",gap:8}}>
          {MED_MINUTES.map(m=>(
            <button key={m} onClick={()=>logMeditation(m)} style={{flex:1,padding:"12px 4px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${ACCENT}44`,background:ACCENT+"12",color:ACCENT,fontWeight:800,fontSize:14}}>
              {m}<div style={{fontSize:8,fontWeight:600,marginTop:2}}>min</div>
            </button>
          ))}
        </div>
        {medStreak>0&&<div style={{fontSize:10,color:C.muted,marginTop:10,textAlign:"center"}}>🔥 {medStreak} dias seguidos</div>}
      </Card>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Hábitos de Prática</div><div style={{fontSize:10,color:C.muted}}>Rituais que sustentam sua jornada</div></div>
        <Btn sm full={false} onClick={()=>openSh("addHabit",{title:"",freq:"Diário",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {praticaHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:`1px solid ${C.b1}`}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setPraticaHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.5px solid ${h.done?ACCENT:C.b2}`,background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>setPraticaHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ── Tradições Tab ─────────────────────────────────────────────────────────────
  const TradicoesTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Tradições</div><div style={{fontSize:10,color:C.muted}}>{tradicoes.length} exploradas</div></div>
        <Btn sm full={false} onClick={()=>openSh("addTrad",{nome:"",tipo:TRAD_TIPOS[0],status:"explorando",notas:""})}><Ico n="plus" size={11}/> Tradição</Btn>
      </div>
      {tradicoes.map(t=>(
        <Card key={t.id} color={t.cor} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:t.cor}}>{t.nome}</div>
              <div style={{fontSize:9,color:C.muted}}>{t.tipo}</div>
              {t.notas&&<div style={{fontSize:10,color:C.muted,marginTop:4,lineHeight:1.4}}>{t.notas}</div>}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>openSh("editTrad",{...t})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={11} color={C.muted}/></button>
              <button onClick={()=>setTradicoes(p=>p.filter(x=>x.id!==t.id))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color="#ef4444"/></button>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {TRAD_STATUS.map(s=>(
              <button key={s.v} onClick={()=>setTradicoes(p=>p.map(x=>x.id===t.id?{...x,status:s.v}:x))}
                style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontSize:9,fontWeight:700,border:`1.5px solid ${t.status===s.v?t.cor:C.b2}`,background:t.status===s.v?t.cor+"22":"transparent",color:t.status===s.v?t.cor:C.muted}}>
                {s.l}
              </button>
            ))}
          </div>
        </Card>
      ))}
      {tradicoes.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>🕊️</div>
        <div style={{fontSize:12}}>Registre religiões, filosofias ou tradições que você quer explorar</div>
      </div>}
    </div>
  );

  // ── Diário Tab ─────────────────────────────────────────────────────────────
  const DiarioTab = () => {
    const entries = [...diary].reverse();
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div><div style={{fontSize:13,fontWeight:800}}>Diário Espiritual</div><div style={{fontSize:10,color:C.muted}}>{diary.length} entradas</div></div>
          <Btn sm full={false} onClick={()=>openSh("addDiary",{date:todayS(),prompt:DIARY_PROMPTS[0].q,texto:""})}><Ico n="plus" size={11}/> Refletir</Btn>
        </div>
        {entries.map(d=>(
          <Card key={d.id} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:ACCENT}}>{d.prompt}</div>
                <div style={{fontSize:9,color:C.muted}}>{d.date}</div>
              </div>
              <button onClick={()=>setDiary(prev=>prev.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={12} color={C.muted}/></button>
            </div>
            {d.texto&&<div style={{fontSize:12,lineHeight:1.6,color:C.text}}>{d.texto}</div>}
          </Card>
        ))}
        {entries.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
          <div style={{fontSize:32,marginBottom:8}}>📖</div>
          <div style={{fontSize:12}}>Reflita sobre seu dia com um prompt guiado</div>
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
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{background:`${ACCENT}11`,border:`2px solid ${ACCENT}33`,borderRadius:15,padding:15,textAlign:"center",marginBottom:11}}>
          <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1.2,marginBottom:6}}>SCORE CHOKMAH — CONTRIBUIÇÃO PARA A ÁRVORE</div>
          <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{chokScore}<span style={{fontSize:16}}>%</span></div>
        </div>
        <Sec title="Hábitos de Prática" addLabel="Adicionar" onAdd={()=>openSh("addHabit",{title:"",freq:"Diário",xp:15})}>
          {praticaHabits.map(h=><Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"} onEdit={()=>openSh("editHabit",{...h})} onDel={()=>{setPraticaHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Tradições" addLabel="Adicionar" onAdd={()=>openSh("addTrad",{nome:"",tipo:TRAD_TIPOS[0],status:"explorando",notas:""})}>
          {tradicoes.map(t=><Row key={t.id} title={t.nome} sub={t.tipo+" · "+TRAD_STATUS.find(s=>s.v===t.status)?.l} onEdit={()=>openSh("editTrad",{...t})} onDel={()=>{setTradicoes(p=>p.filter(x=>x.id!==t.id));toast_("Removido");}}/>)}
        </Sec>
        <Btn color="#ef4444" outline onClick={()=>{
          if(!confirm("Apagar todos os dados do Chokmah?")) return;
          setPraticaHabits(D_PRATICA_HABITS); setTradicoes(D_TRADICOES); setMeditationLog([]); setDiary([]); setXp(0); setActiveWidgets(DEFAULT_WIDGETS);
          toast_("Dados reiniciados","#ef4444");
        }}>Reiniciar dados do módulo</Btn>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SHEETS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSheet = () => {
    if(!sh) return null;

    if(sh==="addHabit"||sh==="editHabit") {
      const isEdit = sh==="editHabit";
      return (
        <Sheet title={isEdit?"Editar Hábito":"Novo Hábito"} onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Meditar 10 minutos"/>
          <FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/>
          <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number" min={1}/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.title) return;
            if(isEdit) {
              setPraticaHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));
              toast_("Atualizado");
            } else {
              setPraticaHabits(p=>[...p,{id:"ph"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false}]);
              toast_("Hábito criado");
            }
            close();
          }}>{isEdit?"Salvar":"Criar"}</Btn>
        </Sheet>
      );
    }

    if(sh==="addTrad"||sh==="editTrad") {
      const isEdit = sh==="editTrad";
      return (
        <Sheet title={isEdit?"Editar Tradição":"Nova Tradição"} onClose={close}>
          <FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})} placeholder="Ex: Budismo"/>
          <FS label="Tipo" value={f.tipo||TRAD_TIPOS[0]} onChange={v=>F({tipo:v})} opts={TRAD_TIPOS.map(t=>({v:t,l:t}))}/>
          <FS label="Status" value={f.status||"explorando"} onChange={v=>F({status:v})} opts={TRAD_STATUS}/>
          <FTA label="Notas" value={f.notas||""} onChange={v=>F({notas:v})} rows={3} placeholder="O que te atrai nessa tradição?"/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.nome) return;
            if(isEdit) {
              setTradicoes(p=>p.map(x=>x.id===f.id?{...x,...f}:x));
              toast_("Atualizado");
            } else {
              setTradicoes(p=>[...p,{id:"tr"+uid(),nome:f.nome,tipo:f.tipo||TRAD_TIPOS[0],status:f.status||"explorando",notas:f.notas||"",cor:TRAD_PALETTE[p.length%TRAD_PALETTE.length]}]);
              toast_("Tradição adicionada");
            }
            close();
          }}>{isEdit?"Salvar":"Adicionar"}</Btn>
        </Sheet>
      );
    }

    if(sh==="addDiary") return (
      <Sheet title="Refletir" onClose={close}>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>PROMPT</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {DIARY_PROMPTS.map(p=>(
              <button key={p.k} onClick={()=>F({prompt:p.q})} style={{padding:"9px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",border:`1.5px solid ${f.prompt===p.q?ACCENT:C.b2}`,background:f.prompt===p.q?ACCENT+"18":"transparent",color:f.prompt===p.q?ACCENT:C.text,fontSize:12,fontWeight:600}}>
                {p.q}
              </button>
            ))}
          </div>
        </div>
        <FTA label="Sua reflexão" value={f.texto||""} onChange={v=>F({texto:v})} rows={5} placeholder="Escreva livremente..."/>
        <Btn color={ACCENT} onClick={()=>{
          if(!f.texto) return;
          setDiary(p=>[...p,{id:"di"+uid(),date:todayS(),prompt:f.prompt||DIARY_PROMPTS[0].q,texto:f.texto}]);
          toast_("Reflexão salva ✨");
          close();
        }}>Salvar</Btn>
      </Sheet>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const currentTab = tab;

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

      {toast&&(
        <div style={{position:"fixed",top:18,left:"50%",background:toast.color,color:"#fff",padding:"9px 20px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)",boxShadow:"0 4px 20px "+toast.color+"66"}}>
          {toast.msg}
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Chokmah · Espiritualidade</span>
      </div>

      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.bg,zIndex:40,borderBottom:`1px solid ${C.b1}`,paddingBottom:12}}>
        <div>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2.5}}>CHOKMAH</div>
          <div style={{fontSize:17,fontWeight:900,letterSpacing:-.3}}>Espiritualidade</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",background:"#fbbf2415",padding:"4px 10px",borderRadius:99}}>
            {xp} XP
          </div>
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:`1px solid ${C.b1}`,borderRadius:9,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
          </button>
        </div>
      </div>

      <div style={{padding:"14px 16px 100px"}}>
        {currentTab==="chok"     && ChokTab()}
        {currentTab==="praticas" && PraticasTab()}
        {currentTab==="tradicoes"&& TradicoesTab()}
        {currentTab==="diario"   && DiarioTab()}
        {currentTab==="cfg"      && ConfigTab()}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:`1px solid ${C.b1}`,zIndex:50,padding:"8px 0 16px",display:"flex",backdropFilter:"blur(12px)"}}>
        {TABS.map(t=>{
          const a = currentTab===t.id;
          return (
            <button key={t.id} onClick={()=>t.id===TABS[0].id?onBack():setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"2px 0",transition:"transform .1s"}}>
              <div style={{width:36,height:30,borderRadius:9,background:a?ACCENT+"18":"transparent",border:a?`1px solid ${ACCENT}30`:"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                <Ico n={t.icon} size={14} color={a?ACCENT:C.muted}/>
              </div>
              <span style={{fontSize:8,fontWeight:700,color:a?ACCENT:C.muted,letterSpacing:.3}}>{t.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {renderSheet()}
      {sh==="widgets"&&WidgetCustomizer()}
    </div>
    </ThemeCtx.Provider>
  );
}
