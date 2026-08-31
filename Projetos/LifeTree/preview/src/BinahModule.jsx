import { useState, useEffect, createContext } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { D_TRACKS, D_LIVROS } from "./binah/seedData.js";
import { bindThemeContext } from "./shared/uiBind.jsx";

const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
const LIGHT = { bg:"#eef2ff", surface:"#ffffff", card:"#f5f7ff", b1:"#c7d2fe", b2:"#818cf8", text:"#1e1b4b", muted:"#4c4a7a", dim:"#1e1b4b", nav:"#eef2ff" };
const ThemeCtx = createContext(LIGHT);
const ACCENT = "#4f46e5";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);

const IC = {
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6 6 18M6 6l12 12",
  check:   "M20 6 9 17l-5-5",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:     ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:    "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:    ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  back:    "M19 12H5m7 7-7-7 7-7",
  book:    ["M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"],
  layers:  ["M12 2 2 7l10 5 10-5-10-5Z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  compass: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"],
  layout:  ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
};

function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if(!d) return null;
  const parts = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {parts.map((p,i) => { if(p.startsWith("circle")){const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);if(m)return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;} return <path key={i} d={p}/>; })}
    </svg>
  );
}

// Sheet/FI/FTA/FS/Card/Bar/Btn consolidados em shared/ui.jsx (21/08/2026, item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao ThemeCtx e ao
// ACCENT do módulo, sem mudar nenhum call site. Binah não tinha Badge (único dos 7
// módulos sem esse componente) — não incluído no binding, fica disponível em
// shared/ui.jsx se algum call site precisar dele no futuro.
const { Sheet, FI, FTA, FS, Card, Bar, Btn } = bindThemeContext(ThemeCtx, ACCENT);
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
  {id:"binah",  icon:"treelife",label:"Binah"},
  {id:"trilhas",icon:"layers",  label:"Trilhas"},
  {id:"leitura",icon:"book",    label:"Leitura"},
  {id:"cfg",    icon:"gear",    label:"Config"},
];

const TRACK_PALETTE = ["#4f46e5","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#3b82f6","#14b8a6","#f97316","#ec4899","#6366f1","#84cc16"];
const FOCUS_META = {
  atual:      {label:"Foco Atual", color:ACCENT},
  explorando: {label:"Explorando", color:"#06b6d4"},
  arquivada:  {label:"Arquivada",  color:"#64748b"},
};
const FOCUS_OPTS = [{v:"atual",l:"Foco Atual"},{v:"explorando",l:"Explorando"},{v:"arquivada",l:"Arquivada"}];
const LIVRO_STATUS = [{v:"quero_ler",l:"Quero Ler"},{v:"lendo",l:"Lendo"},{v:"lido",l:"Lido"},{v:"pausado",l:"Pausado"}];
const READ_MINUTES = [10,20,30,45];

const D_READING_LOG = []; // [{id,date,livroId,minutos}]

export default function BinahModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [tab,  setTab]  = useState("binah");
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);
  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2600); };
  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };

  // Seed de demo removido em 31/08/2026 (pedido do usuário — nova versão inicia em branco)
  const [tracks,     setTracks]     = useState([]);
  const [livros,     setLivros]     = useState([]);
  const [readingLog, setReadingLog] = useState(D_READING_LOG);
  const [xp, setXp] = useState(0);

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const PFX = "lifetree_binah_";
  const lsGet = (k) => { try { const v = localStorage.getItem(PFX+k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(PFX+k, JSON.stringify(v)); } catch {} };

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const tr_ = lsGet("tracks");        if(tr_) setTracks(tr_);
    const lv_ = lsGet("livros");        if(lv_) setLivros(lv_);
    const rl_ = lsGet("readingLog");    if(rl_) setReadingLog(rl_);
    const xp_ = lsGet("xp");            if(xp_ !== null) setXp(xp_);
    setStorageReady(true);
  }, []);
  const reloadFromStorage = () => {
    const tr_ = lsGet("tracks");     if(tr_) setTracks(tr_);
    const lv_ = lsGet("livros");     if(lv_) setLivros(lv_);
    const rl_ = lsGet("readingLog"); if(rl_) setReadingLog(rl_);
    const xp_ = lsGet("xp");         if(xp_ !== null) setXp(xp_);
  };
  useCoachDataSync("binah", reloadFromStorage);

  useEffect(() => { if(!storageReady) return; lsSet("tracks", tracks); }, [tracks, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("livros", livros); }, [livros, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("readingLog", readingLog); }, [readingLog, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("xp", xp); }, [xp, storageReady]);

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

  const allTopics = tracks.flatMap(t=>t.topics);
  const trilhaScore = allTopics.length ? Math.round(allTopics.reduce((s,t)=>s+Math.min(1,t.level/(t.target||5)),0)/allTopics.length*100) : 0;
  const readStreak = streakFromDates(readingLog.map(r=>r.date));
  const leituraScore = Math.min(100, readStreak*15);
  const binahScore = Math.round(trilhaScore*0.5 + leituraScore*0.5);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["binah"] = { score: binahScore, updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch {}
  }, [binahScore, storageReady]);

  const trilhasFoco = tracks.filter(t=>t.focus==="atual");
  const lendoAgora = livros.filter(l=>l.status==="lendo");

  const logReading = (livroId, minutes) => {
    const date = todayS();
    setReadingLog(prev => {
      const existing = prev.find(r=>r.date===date && r.livroId===livroId);
      if (existing) return prev.map(r=>r===existing?{...r,minutos:r.minutos+minutes}:r);
      return [...prev, {id:"rl"+uid(), date, livroId, minutos:minutes}];
    });
    setXp(v=>v+Math.round(minutes*1.5));
    toast_(`Leitura registrada (+${minutes} min) 📖`);
  };

  const cycleFocus = f => f==="atual" ? "explorando" : f==="explorando" ? "arquivada" : "atual";

  // ── Binah Tab (hub) ────────────────────────────────────────────────────────
  // Sem "Personalizar" desde 30/08/2026 (pedido do usuário) — os 3 blocos abaixo (score,
  // lendo agora, trilhas em foco) sempre aparecem agora, sem toggle de ativar/desativar.
  const BinahTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      {/* Simplificado em 30/08/2026 — antes tinha 2 mini-cards (Trilhas de Estudo/Leitura)
          espremidos ao lado do score grande; esse detalhamento já existe nas próprias abas. */}
      <Card style={{background:`linear-gradient(135deg,${ACCENT}22,${ACCENT}06)`,border:`1px solid ${ACCENT}44`,marginBottom:14}}>
        <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>BINAH — ENTENDIMENTO</div>
        <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1,marginBottom:10}}>{binahScore}<span style={{fontSize:18}}>%</span></div>
        <Bar value={binahScore} color={`linear-gradient(90deg,${ACCENT},#06b6d4)`} height={6}/>
      </Card>

      {readStreak>0&&<Card style={{marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:22}}>🔥 {readStreak}</div>
        <div style={{fontSize:9,color:C.muted,marginTop:2}}>dias seguidos lendo</div>
      </Card>}

      {lendoAgora.length>0&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>LENDO AGORA</div>
          {lendoAgora.map(l=>(
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{l.titulo}</div>
                <div style={{fontSize:9,color:C.muted}}>{l.autor}{l.totalPaginas?" · pág. "+l.paginaAtual+"/"+l.totalPaginas:""}</div>
              </div>
              <Btn sm full={false} color={ACCENT} onClick={()=>logReading(l.id,15)}>+15 min</Btn>
            </div>
          ))}
        </Card>
      )}

      {trilhasFoco.length>0&&(
        <Card>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>TRILHAS EM FOCO</div>
          {trilhasFoco.map(t=>(
            <div key={t.id} style={{padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                <div style={{fontSize:12,fontWeight:700,color:t.color}}>{t.name}</div>
              </div>
              {t.topics.map(tp=>(
                <div key={tp.id} style={{fontSize:10,color:C.muted,marginLeft:16,marginBottom:2}}>{tp.name} — nível {tp.level}/{tp.target}</div>
              ))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );

  // ── Trilhas Tab ─────────────────────────────────────────────────────────────
  const TrilhasTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Trilhas de Estudo</div><div style={{fontSize:10,color:C.muted}}>{tracks.length} trilhas</div></div>
        <Btn sm full={false} onClick={()=>openSh("addTrack",{name:"",focus:"atual",color:TRACK_PALETTE[0]})}><Ico n="plus" size={11}/> Trilha</Btn>
      </div>
      {tracks.map(t=>(
        <Card key={t.id} color={t.color} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:t.color,flexShrink:0}}/>
              <div style={{fontSize:14,fontWeight:800,color:t.color}}>{t.name}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>setTracks(p=>p.map(x=>x.id===t.id?{...x,focus:cycleFocus(x.focus)}:x))}
                style={{fontSize:9,padding:"4px 9px",borderRadius:99,cursor:"pointer",border:"1px solid "+FOCUS_META[t.focus].color,background:FOCUS_META[t.focus].color+"18",color:FOCUS_META[t.focus].color,fontWeight:700}}>
                {FOCUS_META[t.focus].label}
              </button>
              <button onClick={()=>openSh("editTrack",{...t})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={11} color={C.muted}/></button>
              <button onClick={()=>setTracks(p=>p.filter(x=>x.id!==t.id))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color="#ef4444"/></button>
            </div>
          </div>
          {t.topics.map(tp=>(
            <div key={tp.id} style={{padding:"8px 0",borderTop:`1px solid ${C.b1}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:600}}>{tp.name}</span>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:10,color:C.muted}}>{tp.level}/{tp.target}</span>
                  <button onClick={()=>setTracks(p=>p.map(x=>x.id===t.id?{...x,topics:x.topics.map(y=>y.id===tp.id?{...y,level:Math.min(tp.target,tp.level+1)}:y)}:x))}
                    style={{background:t.color+"18",border:"none",borderRadius:6,width:20,height:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:t.color,fontSize:11,fontWeight:800}}>+</button>
                  <button onClick={()=>openSh("editTopic",{...tp,trackId:t.id})} style={{background:C.b1,border:"none",borderRadius:6,width:20,height:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={9} color={C.muted}/></button>
                  <button onClick={()=>setTracks(p=>p.map(x=>x.id===t.id?{...x,topics:x.topics.filter(y=>y.id!==tp.id)}:x))} style={{background:C.b1,border:"none",borderRadius:6,width:20,height:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={9} color="#ef4444"/></button>
                </div>
              </div>
              <Bar value={tp.level/(tp.target||5)*100} color={t.color} height={3}/>
              {tp.notes&&<div style={{fontSize:9,color:C.muted,marginTop:3}}>{tp.notes}</div>}
            </div>
          ))}
          <div style={{marginTop:10}}>
            <Btn sm outline color={t.color} onClick={()=>openSh("addTopic",{trackId:t.id,name:"",level:1,target:5,notes:""})}><Ico n="plus" size={10}/> Tópico</Btn>
          </div>
        </Card>
      ))}
    </div>
  );

  // ── Leitura Tab ─────────────────────────────────────────────────────────────
  const LeituraTab = () => (
    <div style={{animation:"slideUp .35s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Leitura</div><div style={{fontSize:10,color:C.muted}}>{livros.length} livros</div></div>
        <Btn sm full={false} onClick={()=>openSh("addLivro",{titulo:"",autor:"",status:"quero_ler",paginaAtual:0,totalPaginas:0,notas:""})}><Ico n="plus" size={11}/> Livro</Btn>
      </div>
      {LIVRO_STATUS.map(st=>{
        const ls = livros.filter(l=>l.status===st.v);
        if(!ls.length) return null;
        return (
          <div key={st.v} style={{marginBottom:16}}>
            <div style={{fontSize:10,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:8}}>{st.l.toUpperCase()}</div>
            {ls.map(l=>{
              const pct = l.totalPaginas ? Math.min(100,Math.round(l.paginaAtual/l.totalPaginas*100)) : 0;
              return (
                <Card key={l.id} style={{marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:800}}>{l.titulo}</div>
                      <div style={{fontSize:9,color:C.muted}}>{l.autor}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>openSh("editLivro",{...l})} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={11} color={C.muted}/></button>
                      <button onClick={()=>setLivros(p=>p.filter(x=>x.id!==l.id))} style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color="#ef4444"/></button>
                    </div>
                  </div>
                  {l.totalPaginas>0&&<div style={{marginBottom:8}}>
                    <Bar value={pct} color={ACCENT} height={4}/>
                    <div style={{fontSize:9,color:C.muted,marginTop:3}}>{l.paginaAtual}/{l.totalPaginas} páginas ({pct}%)</div>
                  </div>}
                  {l.status==="lendo"&&<div style={{display:"flex",gap:6}}>
                    {READ_MINUTES.map(m=>(
                      <button key={m} onClick={()=>logReading(l.id,m)} style={{flex:1,padding:"7px 4px",borderRadius:8,cursor:"pointer",border:`1px solid ${ACCENT}33`,background:ACCENT+"10",color:ACCENT,fontWeight:700,fontSize:10}}>{m}min</button>
                    ))}
                  </div>}
                </Card>
              );
            })}
          </div>
        );
      })}
      {livros.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted}}>
        <div style={{fontSize:32,marginBottom:8}}>📚</div>
        <div style={{fontSize:12}}>Adicione um livro que você está lendo ou quer ler</div>
      </div>}
    </div>
  );

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
          {onAdd&&<Btn sm full={false} onClick={onAdd}><Ico n="plus" size={11}/> {addLabel}</Btn>}
        </div>
        {children}
      </div>
    );
    return (
      <div style={{animation:"slideUp .35s ease"}}>
        <div style={{background:`${ACCENT}11`,border:`2px solid ${ACCENT}33`,borderRadius:15,padding:15,textAlign:"center",marginBottom:11}}>
          <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1.2,marginBottom:6}}>SCORE BINAH — CONTRIBUIÇÃO PARA A ÁRVORE</div>
          <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{binahScore}<span style={{fontSize:16}}>%</span></div>
        </div>
        <Sec title="Trilhas" addLabel="Adicionar" onAdd={()=>openSh("addTrack",{name:"",focus:"atual",color:TRACK_PALETTE[0]})}>
          {tracks.map(t=><Row key={t.id} title={t.name} sub={t.topics.length+" tópicos · "+FOCUS_META[t.focus].label} onEdit={()=>openSh("editTrack",{...t})} onDel={()=>{setTracks(p=>p.filter(x=>x.id!==t.id));toast_("Removido");}}/>)}
        </Sec>
        <Sec title="Livros">
          {livros.map(l=><Row key={l.id} title={l.titulo} sub={l.autor+" · "+(LIVRO_STATUS.find(s=>s.v===l.status)?.l||"")} onEdit={()=>openSh("editLivro",{...l})} onDel={()=>{setLivros(p=>p.filter(x=>x.id!==l.id));toast_("Removido");}}/>)}
        </Sec>
        <Btn color="#ef4444" outline onClick={()=>{
          if(!confirm("Apagar todos os dados do Binah?")) return;
          setTracks([]); setLivros([]); setReadingLog([]); setXp(0);
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

    if(sh==="addTrack"||sh==="editTrack") {
      const isEdit = sh==="editTrack";
      return (
        <Sheet title={isEdit?"Editar Trilha":"Nova Trilha de Estudo"} onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Filosofia"/>
          <FS label="Foco" value={f.focus||"atual"} onChange={v=>F({focus:v})} opts={FOCUS_OPTS}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700,letterSpacing:.8}}>COR</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {TRACK_PALETTE.map(cl=>(
                <button key={cl} onClick={()=>F({color:cl})} style={{width:26,height:26,borderRadius:"50%",background:cl,border:(f.color||TRACK_PALETTE[0])===cl?"2.5px solid "+C.text:"2px solid transparent",cursor:"pointer",padding:0}}/>
              ))}
            </div>
          </div>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.name) return;
            if(isEdit) {
              setTracks(p=>p.map(x=>x.id===f.id?{...x,name:f.name,focus:f.focus,color:f.color||x.color}:x));
              toast_("Atualizado");
            } else {
              setTracks(p=>[...p,{id:"tr"+uid(),name:f.name,color:f.color||TRACK_PALETTE[p.length%TRACK_PALETTE.length],focus:f.focus||"atual",topics:[]}]);
              toast_("Trilha criada");
            }
            close();
          }}>{isEdit?"Salvar":"Criar"}</Btn>
        </Sheet>
      );
    }

    if(sh==="addTopic"||sh==="editTopic") {
      const isEdit = sh==="editTopic";
      return (
        <Sheet title={isEdit?"Editar Tópico":"Novo Tópico"} onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Estoicismo"/>
          <FI label="Nível atual" value={f.level||1} onChange={v=>F({level:v})} type="number" min={0}/>
          <FI label="Meta" value={f.target||5} onChange={v=>F({target:v})} type="number" min={1}/>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.name) return;
            if(isEdit) {
              setTracks(p=>p.map(t=>t.id===f.trackId?{...t,topics:t.topics.map(tp=>tp.id===f.id?{...tp,name:f.name,level:Number(f.level),target:Number(f.target)||5,notes:f.notes}:tp)}:t));
              toast_("Atualizado");
            } else {
              setTracks(p=>p.map(t=>t.id===f.trackId?{...t,topics:[...t.topics,{id:"tp"+uid(),name:f.name,level:Number(f.level)||1,target:Number(f.target)||5,notes:f.notes||""}]}:t));
              toast_("Tópico criado");
            }
            close();
          }}>{isEdit?"Salvar":"Criar"}</Btn>
        </Sheet>
      );
    }

    if(sh==="addLivro"||sh==="editLivro") {
      const isEdit = sh==="editLivro";
      return (
        <Sheet title={isEdit?"Editar Livro":"Novo Livro"} onClose={close}>
          <FI label="Título" value={f.titulo||""} onChange={v=>F({titulo:v})} placeholder="Ex: Meditações"/>
          <FI label="Autor" value={f.autor||""} onChange={v=>F({autor:v})} placeholder="Ex: Marco Aurélio"/>
          <FS label="Status" value={f.status||"quero_ler"} onChange={v=>F({status:v})} opts={LIVRO_STATUS}/>
          <FI label="Página atual" value={f.paginaAtual||0} onChange={v=>F({paginaAtual:v})} type="number" min={0}/>
          <FI label="Total de páginas" value={f.totalPaginas||0} onChange={v=>F({totalPaginas:v})} type="number" min={0}/>
          <FTA label="Notas" value={f.notas||""} onChange={v=>F({notas:v})} rows={2}/>
          <Btn color={ACCENT} onClick={()=>{
            if(!f.titulo) return;
            if(isEdit) {
              setLivros(p=>p.map(x=>x.id===f.id?{...x,titulo:f.titulo,autor:f.autor,status:f.status,paginaAtual:Number(f.paginaAtual)||0,totalPaginas:Number(f.totalPaginas)||0,notas:f.notas}:x));
              toast_("Atualizado");
            } else {
              setLivros(p=>[...p,{id:"lv"+uid(),titulo:f.titulo,autor:f.autor||"",status:f.status||"quero_ler",paginaAtual:Number(f.paginaAtual)||0,totalPaginas:Number(f.totalPaginas)||0,notas:f.notas||""}]);
              toast_("Livro adicionado");
            }
            close();
          }}>{isEdit?"Salvar":"Adicionar"}</Btn>
        </Sheet>
      );
    }
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
        <span style={{fontSize:12,color:C.muted}}>Binah · Conhecimento</span>
      </div>

      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.bg,zIndex:40,borderBottom:`1px solid ${C.b1}`,paddingBottom:12}}>
        <div>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2.5}}>BINAH</div>
          <div style={{fontSize:17,fontWeight:900,letterSpacing:-.3}}>Conhecimento</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Badge de XP removido em 30/08/2026 (pedido do usuário — descartado por enquanto,
              mecânica de XP/recompensa vai ser revista mais adiante). xp/setXp continuam
              rastreando internamente (logReading ainda incrementa), só não exibe mais. */}
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:`1px solid ${C.b1}`,borderRadius:9,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
          </button>
        </div>
      </div>

      <div style={{padding:"14px 16px 100px"}}>
        {currentTab==="binah"   && BinahTab()}
        {currentTab==="trilhas" && TrilhasTab()}
        {currentTab==="leitura" && LeituraTab()}
        {currentTab==="cfg"     && ConfigTab()}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:`1px solid ${C.b1}`,zIndex:50,padding:"8px 0 16px",display:"flex",backdropFilter:"blur(12px)"}}>
        {TABS.map(t=>{
          const a = currentTab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"2px 0",transition:"transform .1s"}}>
              <div style={{width:36,height:30,borderRadius:9,background:a?ACCENT+"18":"transparent",border:a?`1px solid ${ACCENT}30`:"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                <Ico n={t.icon} size={14} color={a?ACCENT:C.muted}/>
              </div>
              <span style={{fontSize:8,fontWeight:700,color:a?ACCENT:C.muted,letterSpacing:.3}}>{t.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {renderSheet()}
    </div>
    </ThemeCtx.Provider>
  );
}
