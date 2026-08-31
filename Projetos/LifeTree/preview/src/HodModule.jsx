import { useState, useEffect } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { TRACK_PALETTE, D_TRACKS, D_CAR_GOALS, D_CAR_HABITS, D_ACHIEVEMENTS, D_PROJECTS, D_BRAND } from "./hod/seedData.js";
import { ThemeCtx, DARK, LIGHT, ACCENT } from "./hod/theme.js";
import { HodCtx } from "./hod/context.js";
import { Ico } from "./hod/icons.jsx";
import { TABS } from "./hod/constants.js";
import { uid, phasesFor, trackScore } from "./hod/helpers.js";
import { HodTab } from "./hod/HodTab.jsx";
import { CarreiraTab, AchievementPrompt, AddTrackSheet, EditTrackSheet, AddSkillSheet, EditSkillSheet, AddCarGoalSheet, EditCarGoalSheet, AddCarHabitSheet, EditCarHabitSheet, AddAchievementSheet } from "./hod/CarreiraTab.jsx";
import { ProjetosTab, ProjectPage, AddProjectSheet, EditProjectSheet, AddPlanItemSheet, AddExpSheet, AddLearningSheet, EditNextStepSheet, AddProjectHabitSheet } from "./hod/ProjetosTab.jsx";
import { ClientPage, AddClientSheet, EditClientSheet, AddClientPlanSheet, AddClientSessionSheet, EditClientFeedbackSheet } from "./hod/ClientPage.jsx";
import { MarcaTab, EditPillarsSheet, AddChannelSheet, EditChannelSheet, AddContentSheet, AddBrandHabitSheet, EditBrandHabitSheet } from "./hod/MarcaTab.jsx";
import { ConfigTab } from "./hod/ConfigTab.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function HodModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;

  const [tab,  setTab]  = useState("hod");
  const [page, setPage] = useState(null);
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);
  const [projFilter, setProjFilter] = useState(null); // null | type id | "receita"

  // state — seed de demo removido em 31/08/2026 (pedido do usuário — nova versão inicia em
  // branco); D_TRACKS_GENERIC continua intacto e só entra por escolha explícita do usuário
  // em Config → "Perfil de Trilhas" (nunca automático), fora do escopo desta limpeza.
  const [tracks,    setTracks]    = useState([]);
  const [carGoals,  setCarGoals]  = useState([]);
  const [carHabits, setCarHabits] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [brand,     setBrand]     = useState({pillars:[],channels:[],contentPlan:[],habits:[]});
  const [xp, setXp] = useState(0);
  const [pendingAch, setPendingAch] = useState(null); // goal that just got completed → offer as achievement

  // ── PERSISTENCE ─────────────────────────────────────────────────────────────
  const HOD_PFX = "lifetree_hod_";
  const lsGet = (k) => { try { const v = localStorage.getItem(HOD_PFX+k); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(HOD_PFX+k, JSON.stringify(v)); } catch {} };

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    try {
      // Trilhas — migra "skills" plano (antigo) agrupando por categoria, senão usa seed
      const tr_ = lsGet("tracks");
      if (tr_) setTracks(tr_);
      else {
        const oldSkills = lsGet("skills");
        if (oldSkills && oldSkills.length) {
          const byCat = {};
          oldSkills.forEach(sk => {
            const cat = sk.cat || "Geral";
            if(!byCat[cat]) byCat[cat] = [];
            byCat[cat].push({ id:sk.id, name:sk.name, level:sk.level, target:sk.target, notes:sk.notes||"" });
          });
          setTracks(Object.entries(byCat).map(([cat,skills],i)=>({
            id:"tr"+uid(), name:cat, color:TRACK_PALETTE[i%TRACK_PALETTE.length], focus:"atual", skills,
          })));
        } // sem seed de demo em 31/08/2026 — sem "skills" antigo pra migrar, fica [] mesmo (já é o default)
      }

      // Projetos — migra "sources" (→ type:servico) e "businesses" (→ type:negocio), senão usa seed
      const pj_ = lsGet("projects");
      if (pj_) setProjects(pj_);
      else {
        const oldSources = lsGet("sources") || [];
        const oldBusinesses = lsGet("businesses") || [];
        if (oldSources.length || oldBusinesses.length) {
          const fromSources = oldSources.map(s => ({
            id:s.id, name:s.name, type:"servico", phase:"operacao",
            canvas:{ offer:s.desc||"" },
            plan:(s.nextSteps||[]).map(ns=>({id:ns.id,topic:ns.title,status:ns.done?"concluido":"pendente"})),
            experiments:[], learnings:[],
            price:s.price||0, goal:s.goal||0, revenueHistory:s.revenueHistory||[],
            clients:(s.students||[]).map(st=>({...st, contact:st.contact||"", goal:st.goal||"", progressNote:"", plan:[], sessions:[], lastFeedback:null})),
            nextStep:(s.nextSteps||[]).find(ns=>!ns.done)?.title || "",
            habits:s.habits||[],
          }));
          const fromBusinesses = oldBusinesses.map(b => ({
            id:b.id, name:b.name, type:"negocio", phase:b.phase||"exploracao",
            canvas:{ targetAudience:b.targetAudience||"", valueProp:b.valueProp||"", revenueModel:b.revenueModel||"", market:b.country||"" },
            plan:[], experiments:b.experiments||[], learnings:b.learnings||[],
            price:0, goal:0, revenueHistory:[], clients:[],
            nextStep:b.nextStep||"", habits:b.habits||[],
          }));
          setProjects([...fromSources, ...fromBusinesses]);
        } // sem seed de demo em 31/08/2026 — sem "sources"/"businesses" antigos pra migrar, fica [] mesmo (já é o default)
      }

      const cg_ = lsGet("carGoals");    if(cg_) setCarGoals(cg_);
      const ch_ = lsGet("carHabits");   if(ch_) setCarHabits(ch_);
      const ac_ = lsGet("achievements");if(ac_) setAchievements(ac_);
      const br_ = lsGet("brand");       if(br_) setBrand(br_);
      const xp_ = lsGet("xp");          if(xp_ !== null) setXp(xp_);
    } catch {}
    setStorageReady(true);
  }, []);

  // O Coach global (App.jsx) executa ações do Hod direto no localStorage — ver
  // hodActions.js — porque o estado do Hod vive só aqui, não em App.jsx. Se este módulo
  // estiver montado quando uma ação roda, precisa recarregar do localStorage pra não ficar
  // com a UI desatualizada. Sem lógica de migração aqui (só roda no mount acima) — por
  // este ponto tracks/projects já foram gravados no localStorage pelos efeitos de save
  // abaixo, então lsGet sempre acha algo.
  const reloadFromStorage = () => {
    try {
      const tr_ = lsGet("tracks");       if(tr_) setTracks(tr_);
      const pj_ = lsGet("projects");     if(pj_) setProjects(pj_);
      const cg_ = lsGet("carGoals");     if(cg_) setCarGoals(cg_);
      const ch_ = lsGet("carHabits");    if(ch_) setCarHabits(ch_);
      const ac_ = lsGet("achievements"); if(ac_) setAchievements(ac_);
      const br_ = lsGet("brand");        if(br_) setBrand(br_);
      const xp_ = lsGet("xp");           if(xp_ !== null) setXp(xp_);
    } catch {}
  };
  useCoachDataSync("hod", reloadFromStorage);

  useEffect(() => { if(!storageReady) return; lsSet("tracks", tracks); }, [tracks, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("carGoals", carGoals); }, [carGoals, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("carHabits", carHabits); }, [carHabits, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("achievements", achievements); }, [achievements, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("projects", projects); }, [projects, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("brand", brand); }, [brand, storageReady]);
  useEffect(() => { if(!storageReady) return; lsSet("xp", xp); }, [xp, storageReady]);

  // Monthly revenue snapshot — records once per month per project
  useEffect(() => {
    if(!storageReady || !projects.length) return;
    const monthKey = new Date().toISOString().slice(0,7); // "2026-06"
    let changed = false;
    const updated = projects.map(p => {
      const hist = p.revenueHistory || [];
      if(hist.some(h=>h.month===monthKey)) return p; // already recorded
      const rev = (p.clients||[]).filter(c=>c.active).length * (p.price||0);
      changed = true;
      return {...p, revenueHistory:[...hist,{month:monthKey,rev}].slice(-6)};
    });
    if(changed) setProjects(updated);
  // roda só quando storageReady vira true (snapshot mensal, não a cada edição de projects)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageReady]);

  // Monthly follower snapshot — records once per month per channel
  useEffect(() => {
    if(!storageReady) return;
    const monthKey = new Date().toISOString().slice(0,7);
    const channels = brand.channels || [];
    let changed = false;
    const updated = channels.map(ch => {
      const hist = ch.followerHistory || [];
      if(hist.some(h=>h.month===monthKey)) return ch;
      changed = true;
      return {...ch, followerHistory:[...hist,{month:monthKey,count:ch.followers}].slice(-6)};
    });
    if(changed) setBrand(b=>({...b,channels:updated}));
  // mesma razão do efeito de receita acima — roda só quando storageReady vira true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageReady]);

  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };

  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };
  const nav    = (type,id) => setPage({type,id});
  const back   = () => { if(page?.type==="client") setPage({type:"project",id:page.projId}); else setPage(null); };

  // score calculations
  const carScore = () => {
    const habS = carHabits.length ? carHabits.filter(h=>h.done).length/carHabits.length : 0.5;
    const goaS = carGoals.length  ? carGoals.filter(g=>g.done).length/carGoals.length   : 0;
    const activeTracks = tracks.filter(t=>t.focus!=="arquivada");
    const withSkills = activeTracks.filter(t=>t.skills.length);
    const skS = withSkills.length ? withSkills.reduce((s,t)=>s+trackScore(t)/100,0)/withSkills.length : 0.5;
    return Math.round((habS*0.3 + goaS*0.4 + skS*0.3)*100);
  };
  const projetosScore = () => {
    if(!projects.length) return 0;
    return Math.round(projects.reduce((s,p)=>{
      const phases = phasesFor(p.type);
      const phaseIdx = phases.findIndex(ph=>ph.id===p.phase);
      const phaseS = phases.length>1 ? Math.max(0,phaseIdx)/(phases.length-1) : 0;
      const expS = (p.experiments||[]).length ? (p.experiments||[]).filter(e=>e.status==="concluido").length/p.experiments.length : 0;
      const learnS = Math.min(1,(p.learnings||[]).length/5);
      const habS = (p.habits||[]).length ? (p.habits||[]).filter(h=>h.done).length/p.habits.length : 0;
      const activeClients = (p.clients||[]).filter(c=>c.active).length;
      const hasRevenue = p.goal>0;
      const revS = hasRevenue ? Math.min(1,(activeClients*(p.price||0))/p.goal) : null;
      const parts = hasRevenue
        ? [phaseS*0.3, expS*0.2, learnS*0.15, habS*0.15, revS*0.2]
        : [phaseS*0.4, expS*0.25, learnS*0.2, habS*0.15];
      return s + parts.reduce((a,b)=>a+b,0);
    },0)/projects.length*100);
  };
  const marcaScore = () => {
    const habS = brand.habits.filter(h=>h.done).length/(brand.habits.length||1);
    const chanS = brand.channels.filter(c=>c.active).length/(brand.channels.length||1);
    const contS = brand.contentPlan.filter(c=>c.status==="publicado").length/(brand.contentPlan.length||1);
    return Math.round((habS*0.4+chanS*0.2+contS*0.4)*100);
  };
  const hodScore = () => Math.round((carScore()*0.35+projetosScore()*0.45+marcaScore()*0.20));

  // ── SCORE BRIDGE → Árvore ────────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["hod"] = { score: hodScore(), updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch {}
  // hodScore() só lê tracks/carGoals/carHabits/projects/brand (já listados) — não precisa
  // entrar como dependência própria, é recriada a cada render mas sempre deriva dos mesmos dados.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, carGoals, carHabits, projects, brand, storageReady]);

  // ── HOD CTX — bundle pras abas/páginas extraídas (ver hod/context.js) ───────
  const ctx = {
    f, F, close, openSh, toast, toast_, page, setPage, nav, back, sh, setTab,
    tracks, setTracks, carGoals, setCarGoals, carHabits, setCarHabits, achievements, setAchievements,
    projects, setProjects, brand, setBrand, xp, setXp, pendingAch, setPendingAch, projFilter, setProjFilter,
    carScore, projetosScore, marcaScore, hodScore,
  };

  const renderPage = () => {
    if(!page) return null;
    if(page.type==="project") return <ProjectPage/>;
    if(page.type==="client")  return <ClientPage/>;
    return null;
  };

  const renderTab = () => {
    if(tab==="hod")      return <HodTab/>;
    if(tab==="carreira") return <CarreiraTab/>;
    if(tab==="projetos") return <ProjetosTab/>;
    if(tab==="marca")    return <MarcaTab/>;
    if(tab==="cfg")      return <ConfigTab/>;
    return null;
  };

  return (
    <ThemeCtx.Provider value={C}>
    <HodCtx.Provider value={ctx}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+"}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}"}</style>

      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>
          {toast.msg}
        </div>
      )}

      {/* BOTÃO VOLTAR → ÁRVORE */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Hod · Profissional</span>
      </div>

      {/* HEADER */}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          {page&&(
            <button onClick={back} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 4px"}}>
              <Ico n="back" size={12}/> voltar
            </button>
          )}
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>HOD</div>
          <div style={{fontSize:18,fontWeight:800}}>Profissional</div>
        </div>
        <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
        </button>
      </div>

      <div style={{padding:"10px 16px 90px"}}>
        {page ? renderPage() : renderTab()}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{
          const a=tab===t.id&&!page;
          return (
            <button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}}
              style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}>
              <div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                <Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/>
              </div>
              {a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}
              {!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}
            </button>
          );
        })}
      </div>

      {/* ── SHEETS ─────────────────────────────────────────────────────────── */}
      <AchievementPrompt/>

      {sh==="addTrack"&&<AddTrackSheet/>}
      {sh==="editTrack"&&<EditTrackSheet/>}
      {sh==="addSkill"&&<AddSkillSheet/>}
      {sh==="editSkill"&&<EditSkillSheet/>}
      {sh==="addCarGoal"&&<AddCarGoalSheet/>}
      {sh==="editCarGoal"&&<EditCarGoalSheet/>}
      {sh==="addCarHabit"&&<AddCarHabitSheet/>}
      {sh==="editCarHabit"&&<EditCarHabitSheet/>}
      {sh==="addAchievement"&&<AddAchievementSheet/>}

      {sh==="addProject"&&<AddProjectSheet/>}
      {sh==="editProject"&&<EditProjectSheet/>}
      {sh==="addPlanItem"&&<AddPlanItemSheet/>}
      {sh==="addExp"&&<AddExpSheet/>}
      {sh==="addLearning"&&<AddLearningSheet/>}
      {sh==="editNextStep"&&<EditNextStepSheet/>}
      {sh==="addProjectHabit"&&<AddProjectHabitSheet/>}

      {sh==="addClient"&&<AddClientSheet/>}
      {sh==="editClient"&&<EditClientSheet/>}
      {sh==="addClientPlan"&&<AddClientPlanSheet/>}
      {sh==="addClientSession"&&<AddClientSessionSheet/>}
      {sh==="editClientFeedback"&&<EditClientFeedbackSheet/>}

      {sh==="editPillars"&&<EditPillarsSheet/>}
      {sh==="addChannel"&&<AddChannelSheet/>}
      {sh==="editChannel"&&<EditChannelSheet/>}
      {sh==="addContent"&&<AddContentSheet/>}
      {sh==="addBrandHabit"&&<AddBrandHabitSheet/>}
      {sh==="editBrandHabit"&&<EditBrandHabitSheet/>}

    </div>
    </HodCtx.Provider>
    </ThemeCtx.Provider>
  );
}
