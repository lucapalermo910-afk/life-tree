import { useState, useEffect, createContext, useContext } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { D_HOBBIES, D_LAZER_HABITS, D_TAREFAS, D_LAR_HABITS, D_EXPERIENCIAS } from "./netzach/seedData.js";
import { bindThemeContext } from "./shared/uiBind.jsx";

const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
const LIGHT = { bg:"#f5fff0", surface:"#ffffff", card:"#f8fff4", b1:"#d4edc4", b2:"#a8d48a", text:"#0a1f05", muted:"#5a7a4a", dim:"#1a4a0a", nav:"#f5fff0" };
const ThemeCtx = createContext(LIGHT);
const useTheme = () => useContext(ThemeCtx);
const ACCENT = "#84cc16";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);
const diasDesde = (d) => d ? Math.round((new Date(todayS()) - new Date(d)) / 864e5) : 999;

const IC = {
  plus:     "M12 5v14M5 12h14",
  x:        "M18 6 6 18M6 6l12 12",
  back:     "M19 12H5m7 7-7-7 7-7",
  check:    "M20 6 9 17l-5-5",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:      ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:     "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:     ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  zap:      "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  smile:    ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M8 14s1.5 2 4 2 4-2 4-2","M9 9h.01","M15 9h.01"],
  home:     ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  compass:  ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"],
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  leaf:     "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  map:      ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z","M9 3v15","M15 6v15"],
  heart:    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  treelife: ["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  camera:   ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z","M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  flag:     ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z","M4 22v-7"],
  layout:   ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
};

function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if(!d) return null;
  const parts = Array.isArray(d) ? d : d.split(/(?=M)/).filter(Boolean);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {parts.map((p,i) => { if(p.startsWith("circle")){const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);if(m)return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;} return <path key={i} d={p}/>; })}
    </svg>
  );
}

// Sheet/FI/FTA/FS/Card/Bar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026, item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao ThemeCtx e ao
// ACCENT do módulo, sem mudar nenhum call site.
const { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);
function ColorSwatches({ label="Cor", value, onChange }) {
  const C = useTheme();
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {HOBBY_PALETTE.map(cl=>(
          <button key={cl} onClick={()=>onChange(cl)} style={{width:26,height:26,borderRadius:"50%",background:cl,border:(value||HOBBY_PALETTE[0])===cl?"2.5px solid "+C.text:"2px solid transparent",cursor:"pointer",padding:0}}/>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  {id:"netz",   icon:"treelife", label:"Netzach"},
  {id:"lazer",  icon:"smile",    label:"Lazer"},
  {id:"lar",    icon:"home",     label:"Lar"},
  {id:"exp",    icon:"compass",  label:"Experiências"},
  {id:"cfg",    icon:"gear",     label:"Config"},
];

const FREQ_OPTS = [{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"},{v:"Trimestral",l:"Trimestral"}];
const FREQ_DAYS = {"Diário":1,"Semanal":7,"Mensal":30,"Trimestral":90};
const EXP_STATUS = [{v:"sonho",l:"Sonho"},{v:"planejando",l:"Planejando"},{v:"agendado",l:"Agendado"},{v:"feito",l:"Feito! ✓"}];
const HOBBY_CATS = ["Esporte","Arte","Música","Leitura","Gastronomia","Tecnologia","Natureza","Jogos","Viagem","Outro"];
const TAREFA_CATS = ["Limpeza","Organização","Manutenção","Decoração","Compras","Outro"];
const HOBBY_PALETTE = ["#84cc16","#8b5cf6","#f97316","#06b6d4","#10b981","#f59e0b","#ef4444","#3b82f6","#14b8a6","#6366f1","#ec4899","#f472b6"];

const WIDGET_CATALOG = [
  {id:"score",       label:"Score Netzach",  desc:"Número principal + sub-scores + barra", defaultOn:true},
  {id:"habitos_hoje",label:"Hábitos de Hoje",desc:"Lista rápida de hábitos",      defaultOn:true},
];
const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w=>w.defaultOn).map(w=>w.id);

// Dado de seed movido pra ./netzach/seedData.js em 21/08/2026 (item 1 do Plano de
// Decomposição) — ver import no topo do arquivo.

export default function NetzachModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [tab,  setTab]  = useState("netz");
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);
  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };
  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };

  const [hobbies,     setHobbies]     = useState(D_HOBBIES);
  const [lazerHabits, setLazerHabits] = useState(D_LAZER_HABITS);
  const [tarefas,     setTarefas]     = useState(D_TAREFAS);
  const [larHabits,   setLarHabits]   = useState(D_LAR_HABITS);
  const [experiencias,setExperiencias]= useState(D_EXPERIENCIAS);
  const [xp, setXp] = useState(0);
  const [activeWidgets, setActiveWidgets] = useState(DEFAULT_WIDGETS);

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const NETZ_PFX = "lifetree_netz_";
  const lsGet = (k) => { try { const v = localStorage.getItem(NETZ_PFX+k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(NETZ_PFX+k, JSON.stringify(v)); } catch {} };

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const h_  = lsGet("hobbies");      if(h_)  setHobbies(h_);
    const lh_ = lsGet("lazerHabits");  if(lh_) setLazerHabits(lh_);
    const t_  = lsGet("tarefas");      if(t_)  setTarefas(t_);
    const lrh_= lsGet("larHabits");    if(lrh_)setLarHabits(lrh_);
    const e_  = lsGet("experiencias"); if(e_)  setExperiencias(e_);
    const xp_ = lsGet("xp");           if(xp_ !== null) setXp(xp_);
    const w_  = lsGet("activeWidgets");if(w_)  setActiveWidgets(w_);
    setStorageReady(true);
  }, []);
  // Recarrega do storage quando uma ação do Coach escreve direto (netzachActions.js).
  const reloadFromStorage = () => {
    const h_  = lsGet("hobbies");      if(h_)  setHobbies(h_);
    const lh_ = lsGet("lazerHabits");  if(lh_) setLazerHabits(lh_);
    const t_  = lsGet("tarefas");      if(t_)  setTarefas(t_);
    const lrh_= lsGet("larHabits");    if(lrh_)setLarHabits(lrh_);
    const e_  = lsGet("experiencias"); if(e_)  setExperiencias(e_);
    const xp_ = lsGet("xp");           if(xp_ !== null) setXp(xp_);
  };
  useCoachDataSync("netzach", reloadFromStorage);

  useEffect(() => { if(!storageReady) return; lsSet("hobbies", hobbies); }, [hobbies, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("lazerHabits", lazerHabits); }, [lazerHabits, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("tarefas", tarefas); }, [tarefas, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("larHabits", larHabits); }, [larHabits, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("experiencias", experiencias); }, [experiencias, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("xp", xp); }, [xp, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("activeWidgets", activeWidgets); }, [activeWidgets, storageReady]);

  const allHabits = [...lazerHabits,...larHabits];
  const habScore  = allHabits.length ? Math.round(allHabits.filter(h=>h.done).length/allHabits.length*100) : 0;
  const expScore  = experiencias.length ? Math.round(experiencias.filter(e=>e.status==="feito").length/experiencias.length*100) : 0;
  const hobScore  = hobbies.length ? Math.min(100, Math.round(hobbies.filter(h=>diasDesde(h.lastDone)<=7).length/hobbies.length*100)) : 0;
  const netzScore = Math.round(habScore*0.4+expScore*0.2+hobScore*0.4);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["netzach"] = { score: netzScore, updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch {}
  }, [netzScore, storageReady]);

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

  const NetzTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>openSh("widgets")}
          style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:700,color:C.muted}}>
          <Ico n="layout" size={11} color={C.muted}/> Personalizar
        </button>
      </div>
      {W("score")&&<Card style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>NETZACH — QUALIDADE DE VIDA</div>
            <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{netzScore}<span style={{fontSize:18}}>%</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
            {[{l:"Hábitos",v:habScore,c:ACCENT,t:"lazer"},{l:"Hobbies",v:hobScore,c:"#22d3ee",t:"lazer"},{l:"Experiências",v:expScore,c:"#f59e0b",t:"exp"}].map(m=>(
              <div key={m.l} onClick={()=>setTab(m.t)} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:"pointer",border:"1px solid "+m.c+"22"}}>
                <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
              </div>
            ))}
          </div>
        </div>
        <Bar value={netzScore} color={"linear-gradient(90deg,"+ACCENT+",#22d3ee)"} height={6}/>
      </Card>}

      {W("habitos_hoje")&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS DE HOJE</div>
          <span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{allHabits.filter(h=>h.done).length}/{allHabits.length}</span>
        </div>
        {allHabits.map(h=>{
          const isLazer=lazerHabits.some(x=>x.id===h.id);
          return (
            <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);if(isLazer)setLazerHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));else setLarHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
                style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
                <div style={{fontSize:9,color:C.muted}}>{isLazer?"Lazer":"Lar"} · {h.freq}</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
            </div>
          );
        })}
      </Card>}
    </div>
  );

  const LazerTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Lazer & Hobbies</div><div style={{fontSize:10,color:C.muted}}>O que renova sua energia</div></div>
        <Btn sm full={false} onClick={()=>openSh("addHobby",{name:"",cat:HOBBY_CATS[0],freq:"Semanal",color:ACCENT,note:""})}><Ico n="plus" size={11}/> Hobby</Btn>
      </div>
      {hobbies.map(h=>{
        const diasSemFazer=diasDesde(h.lastDone);
        const status=diasSemFazer<=7?"em dia":diasSemFazer<=14?"atenção":"negligenciado";
        const statusColor=status==="em dia"?ACCENT:status==="atenção"?"#f59e0b":"#ef4444";
        return (
          <Card key={h.id} color={h.color} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:h.color}}>{h.name}</div>
                <div style={{fontSize:9,color:C.muted}}>{h.cat} · {h.freq}</div>
                {h.note&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{h.note}</div>}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <Badge label={status} color={statusColor}/>
                <button onClick={()=>openSh("editHobby",{...h})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={11} color={C.muted}/></button>
                <button onClick={()=>setHobbies(p=>p.filter(x=>x.id!==h.id))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color="#ef4444"/></button>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:C.muted}}>{h.lastDone?"Última vez: "+h.lastDone:"Nunca feito"}</span>
              <Btn sm full={false} color={h.color} onClick={()=>{setHobbies(p=>p.map(x=>x.id===h.id?{...x,lastDone:todayS()}:x));setXp(v=>v+25);toast_("Feito! +25 XP",h.color);}}>
                <Ico n="check" size={11}/> Fiz hoje
              </Btn>
            </div>
          </Card>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Hábitos de Lazer</div>
        <Btn sm full={false} onClick={()=>openSh("addLazerHabit",{title:"",freq:"Diário",xp:20})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {lazerHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setLazerHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>setLazerHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  const LarTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Lar</div><div style={{fontSize:10,color:C.muted}}>Seu ambiente de vida</div></div>
        <Btn sm full={false} onClick={()=>openSh("addTarefa",{nome:"",cat:TAREFA_CATS[0],freq:"Semanal",urgente:false})}><Ico n="plus" size={11}/> Tarefa</Btn>
      </div>

      {tarefas.filter(t=>t.urgente).length>0&&(
        <div style={{background:"#ef444411",border:"1px solid #ef444433",borderRadius:12,padding:12,marginBottom:12}}>
          <div style={{fontSize:10,color:"#ef4444",fontWeight:700,marginBottom:6}}>URGENTE</div>
          {tarefas.filter(t=>t.urgente).map(t=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid #ef444422"}}>
              <span style={{fontSize:12}}>{t.nome}</span>
              <Btn sm full={false} color="#ef4444" onClick={()=>{setTarefas(p=>p.map(x=>x.id===t.id?{...x,lastDone:todayS(),urgente:false}:x));setXp(v=>v+20);toast_("Feito! +20 XP","#ef4444");}}>Feito</Btn>
            </div>
          ))}
        </div>
      )}

      {TAREFA_CATS.map(cat=>{
        const ts=tarefas.filter(t=>t.cat===cat&&!t.urgente);
        if(!ts.length) return null;
        return (
          <div key={cat} style={{marginBottom:14}}>
            <div style={{fontSize:10,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:6}}>{cat.toUpperCase()}</div>
            {ts.map(t=>{
              const dias=diasDesde(t.lastDone);
              const freqDias=FREQ_DAYS[t.freq]||7;
              const atrStatus=dias<=freqDias?"em dia":dias<=freqDias*1.5?"atenção":"atrasada";
              const atrColor=atrStatus==="em dia"?ACCENT:atrStatus==="atenção"?"#f59e0b":"#ef4444";
              return (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{t.nome}</div>
                    <div style={{fontSize:9,color:C.muted}}>{t.freq} · {t.lastDone?"Feito "+t.lastDone:"Nunca feito"}</div>
                  </div>
                  <Badge label={atrStatus} color={atrColor}/>
                  <button onClick={()=>setTarefas(p=>p.map(x=>x.id===t.id?{...x,urgente:!x.urgente}:x))}
                    style={{fontSize:9,padding:"3px 8px",borderRadius:99,cursor:"pointer",background:t.urgente?"#ef444422":"transparent",border:"1px solid "+(t.urgente?"#ef4444":C.b2),color:t.urgente?"#ef4444":C.muted,fontWeight:600}}>!</button>
                  <Btn sm full={false} color={ACCENT} onClick={()=>{setTarefas(p=>p.map(x=>x.id===t.id?{...x,lastDone:todayS()}:x));setXp(v=>v+20);toast_("Feito! +20 XP");}}>Feito</Btn>
                  <button onClick={()=>setTarefas(p=>p.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Hábitos do Lar</div>
        <Btn sm full={false} onClick={()=>openSh("addLarHabit",{title:"",freq:"Diário",xp:10})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {larHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setLarHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>setLarHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  const ExpTab = () => {
    const byStatus = (s) => experiencias.filter(e=>e.status===s);
    const statusColor = {sonho:"#8b5cf6",planejando:"#f59e0b",agendado:"#06b6d4",feito:ACCENT};
    return (
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontSize:13,fontWeight:800}}>Experiências</div><div style={{fontSize:10,color:C.muted}}>{experiencias.filter(e=>e.status==="feito").length}/{experiencias.length} realizadas</div></div>
          <Btn sm full={false} color="#f59e0b" onClick={()=>openSh("addExp",{titulo:"",cat:"Viagem",status:"sonho",prazo:"",nota:"",emoji:"✨"})}><Ico n="plus" size={11}/> Experiência</Btn>
        </div>

        {["sonho","planejando","agendado","feito"].map(st=>{
          const exps=byStatus(st);
          if(!exps.length) return null;
          const label={sonho:"Sonhos",planejando:"Planejando",agendado:"Agendado",feito:"Realizadas ✓"}[st];
          return (
            <div key={st} style={{marginBottom:16}}>
              <div style={{fontSize:10,color:statusColor[st],fontWeight:700,letterSpacing:1,marginBottom:8}}>{label.toUpperCase()}</div>
              {exps.map(e=>(
                <div key={e.id} style={{padding:"11px 13px",background:C.card,border:"1px solid "+statusColor[st]+"22",borderRadius:12,marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:18}}>{e.emoji||"✨"}</span>
                        <span style={{fontSize:13,fontWeight:700}}>{e.titulo}</span>
                      </div>
                      <div style={{fontSize:9,color:C.muted}}>{e.cat}{e.prazo?" · "+e.prazo:""}</div>
                      {e.nota&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>{e.nota}</div>}
                    </div>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <button onClick={()=>{const idx=EXP_STATUS.findIndex(x=>x.v===e.status);const next=EXP_STATUS[(idx+1)%EXP_STATUS.length].v;setExperiencias(p=>p.map(x=>x.id===e.id?{...x,status:next}:x));if(next==="feito"){setXp(v=>v+100);toast_("Experiência realizada! +100 XP","#f59e0b");}}}
                        style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:statusColor[st]+"18",border:"1px solid "+statusColor[st]+"44",color:statusColor[st],fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {e.status==="feito"?"Realizado":"Avançar →"}
                      </button>
                      <button onClick={()=>openSh("editExp",{...e})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={11} color={C.muted}/></button>
                      <button onClick={()=>setExperiencias(p=>p.filter(x=>x.id!==e.id))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color="#ef4444"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const ConfigTab = () => {
    const Row = ({title,sub,onEdit,onDel}) => (
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{title}</div>{sub&&<div style={{fontSize:9,color:C.muted}}>{sub}</div>}</div>
        {onEdit&&<button onClick={onEdit} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>}
        {onDel&&<button onClick={onDel} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>}
      </div>
    );
    const Sec = ({title,addLabel,onAdd,children}) => (
      <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:700}}>{title}</span>
          <Btn sm full={false} onClick={onAdd}><Ico n="plus" size={11}/> {addLabel}</Btn>
        </div>
        {children}
      </div>
    );
    return (
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{background:ACCENT+"11",border:"2px solid "+ACCENT+"33",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE NETZACH — LEVE PARA A ÁRVORE</div>
          <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{netzScore}<span style={{fontSize:16}}>%</span></div>
        </div>
        <Sec title="Hobbies" addLabel="Adicionar" onAdd={()=>openSh("addHobby",{name:"",cat:HOBBY_CATS[0],freq:"Semanal",color:ACCENT,note:""})}>
          {hobbies.map(h=><Row key={h.id} title={h.name} sub={h.cat+" · "+h.freq} onEdit={()=>openSh("editHobby",{...h})} onDel={()=>{setHobbies(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Hábitos de Lazer" addLabel="Adicionar" onAdd={()=>openSh("addLazerHabit",{title:"",freq:"Diário",xp:20})}>
          {lazerHabits.map(h=><Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"} onEdit={()=>openSh("editLazerHabit",{...h})} onDel={()=>{setLazerHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Tarefas do Lar" addLabel="Adicionar" onAdd={()=>openSh("addTarefa",{nome:"",cat:TAREFA_CATS[0],freq:"Semanal",urgente:false})}>
          {tarefas.map(t=><Row key={t.id} title={t.nome} sub={t.cat+" · "+t.freq} onEdit={()=>openSh("editTarefa",{...t})} onDel={()=>{setTarefas(p=>p.filter(x=>x.id!==t.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Hábitos do Lar" addLabel="Adicionar" onAdd={()=>openSh("addLarHabit",{title:"",freq:"Diário",xp:10})}>
          {larHabits.map(h=><Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"} onEdit={()=>openSh("editLarHabit",{...h})} onDel={()=>{setLarHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Experiências" addLabel="Adicionar" onAdd={()=>openSh("addExp",{titulo:"",cat:"Viagem",status:"sonho",prazo:"",nota:"",emoji:"✨"})}>
          {experiencias.map(e=><Row key={e.id} title={e.titulo} sub={e.cat+" · "+e.status} onEdit={()=>openSh("editExp",{...e})} onDel={()=>{setExperiencias(p=>p.filter(x=>x.id!==e.id));toast_("Removido");}}/>)}
        </Sec>
      </div>
    );
  };

  return (
    <ThemeCtx.Provider value={C}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+"}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}"}</style>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>}

      {/* BOTÃO VOLTAR → ÁRVORE */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Netzach · Qualidade de Vida</span>
      </div>

      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>NETZACH</div>
          <div style={{fontSize:18,fontWeight:800}}>Qualidade de Vida</div>
        </div>
        <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
        </button>
      </div>
      <div style={{padding:"10px 16px 90px"}}>
        {tab==="netz"  &&NetzTab()}
        {tab==="lazer" &&LazerTab()}
        {tab==="lar"   &&LarTab()}
        {tab==="exp"   &&ExpTab()}
        {tab==="cfg"   &&ConfigTab()}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{const a=tab===t.id;return(<button key={t.id} onClick={()=>t.id===TABS[0].id?onBack():setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}><div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/></div>{a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}{!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}</button>);} )}
      </div>

      {sh==="addHobby"&&<Sheet title="Novo Hobby" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Jogar violão"/><FS label="Categoria" value={f.cat||HOBBY_CATS[0]} onChange={v=>F({cat:v})} opts={HOBBY_CATS.map(c=>({v:c,l:c}))}/><FS label="Frequência ideal" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><ColorSwatches value={f.color} onChange={v=>F({color:v})}/><FTA label="Notas" value={f.note||""} onChange={v=>F({note:v})} rows={2} placeholder="O que você gosta nessa atividade?"/><Btn color={ACCENT} onClick={()=>{if(!f.name)return;setHobbies(p=>[...p,{id:"h"+uid(),name:f.name,cat:f.cat||HOBBY_CATS[0],freq:f.freq||"Semanal",color:f.color||HOBBY_PALETTE[0],note:f.note||"",lastDone:""}]);toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editHobby"&&<Sheet title="Editar Hobby" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/><FS label="Categoria" value={f.cat||HOBBY_CATS[0]} onChange={v=>F({cat:v})} opts={HOBBY_CATS.map(c=>({v:c,l:c}))}/><FS label="Frequência ideal" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><ColorSwatches value={f.color} onChange={v=>F({color:v})}/><FTA label="Notas" value={f.note||""} onChange={v=>F({note:v})} rows={2}/><Btn color={ACCENT} onClick={()=>{setHobbies(p=>p.map(x=>x.id===f.id?{...x,name:f.name,cat:f.cat,freq:f.freq,color:f.color||x.color,note:f.note}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addLazerHabit"&&<Sheet title="Novo Hábito de Lazer" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Assistir série favorita"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||20} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setLazerHabits(p=>[...p,{id:"lh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||20,done:false}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="editLazerHabit"&&<Sheet title="Editar Hábito" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||20} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{setLazerHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addTarefa"&&<Sheet title="Nova Tarefa do Lar" onClose={close}><FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})} placeholder="Ex: Limpar banheiro"/><FS label="Categoria" value={f.cat||TAREFA_CATS[0]} onChange={v=>F({cat:v})} opts={TAREFA_CATS.map(c=>({v:c,l:c}))}/><FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><Btn color={ACCENT} onClick={()=>{if(!f.nome)return;setTarefas(p=>[...p,{id:"t"+uid(),nome:f.nome,cat:f.cat||TAREFA_CATS[0],freq:f.freq||"Semanal",lastDone:"",urgente:false}]);toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editTarefa"&&<Sheet title="Editar Tarefa" onClose={close}><FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})}/><FS label="Categoria" value={f.cat||TAREFA_CATS[0]} onChange={v=>F({cat:v})} opts={TAREFA_CATS.map(c=>({v:c,l:c}))}/><FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><Btn color={ACCENT} onClick={()=>{setTarefas(p=>p.map(x=>x.id===f.id?{...x,nome:f.nome,cat:f.cat,freq:f.freq}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addLarHabit"&&<Sheet title="Novo Hábito do Lar" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Cama arrumada"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setLarHabits(p=>[...p,{id:"lrh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||10,done:false}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="editLarHabit"&&<Sheet title="Editar Hábito do Lar" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{setLarHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addExp"&&<Sheet title="Nova Experiência" onClose={close}><FI label="Título" value={f.titulo||""} onChange={v=>F({titulo:v})} placeholder="Ex: Ver aurora boreal"/><FI label="Emoji" value={f.emoji||"✨"} onChange={v=>F({emoji:v})}/><FS label="Categoria" value={f.cat||"Viagem"} onChange={v=>F({cat:v})} opts={["Viagem","Gastronomia","Esporte","Arte","Natureza","Social","Aventura","Outro"].map(c=>({v:c,l:c}))}/><FS label="Status" value={f.status||"sonho"} onChange={v=>F({status:v})} opts={EXP_STATUS}/><FI label="Prazo (opcional)" value={f.prazo||""} onChange={v=>F({prazo:v})} type="date"/><FTA label="Notas" value={f.nota||""} onChange={v=>F({nota:v})} rows={2}/><Btn color="#f59e0b" onClick={()=>{if(!f.titulo)return;setExperiencias(p=>[...p,{id:"ex"+uid(),titulo:f.titulo,cat:f.cat||"Viagem",status:f.status||"sonho",prazo:f.prazo||"",nota:f.nota||"",emoji:f.emoji||"✨"}]);toast_("Adicionado","#f59e0b");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editExp"&&<Sheet title="Editar Experiência" onClose={close}><FI label="Título" value={f.titulo||""} onChange={v=>F({titulo:v})}/><FI label="Emoji" value={f.emoji||"✨"} onChange={v=>F({emoji:v})}/><FS label="Status" value={f.status||"sonho"} onChange={v=>F({status:v})} opts={EXP_STATUS}/><FI label="Prazo (opcional)" value={f.prazo||""} onChange={v=>F({prazo:v})} type="date"/><FTA label="Notas" value={f.nota||""} onChange={v=>F({nota:v})} rows={2}/><Btn color="#f59e0b" onClick={()=>{setExperiencias(p=>p.map(x=>x.id===f.id?{...x,titulo:f.titulo,emoji:f.emoji,status:f.status,prazo:f.prazo,nota:f.nota}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="widgets"&&WidgetCustomizer()}
    </div>
    </ThemeCtx.Provider>
  );
}
