import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#44556a", dim:"#7a8fa8", nav:"#060b12" };
const LIGHT = { bg:"#eef1f9", surface:"#ffffff",  card:"#f8faff", b1:"#c4cfe6", b2:"#98aacf",  text:"#07101e", muted:"#556080", dim:"#1e3060",  nav:"#eef1f9" };
let C = {...LIGHT};

const ACCENT = "#f97316";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);
const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct = (a,b) => b===0?0:Math.min(100,Math.round(a/b*100));

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const IC = {
  plus:      "M12 5v14M5 12h14",
  x:         "M18 6 6 18M6 6l12 12",
  back:      "M19 12H5m7 7-7-7 7-7",
  check:     "M20 6 9 17l-5-5",
  chev:      "M9 18l6-6-6-6",
  edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:       ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:      "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:      ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  monitor:   ["M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z","M8 21h8","M12 17v4"],
  trend:     "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  zap:       "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  target:    ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  book:      ["M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"],
  users:     ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z","M22 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  bulb:      ["M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5","M9 18h6","M10 22h4"],
  rocket:    ["M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z","M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z","M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0","M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"],
  globe:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"],
  flag:      ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z","M4 22v-7"],
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  treelife:  ["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  refresh:   "M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9M21 3v5h-5M3 21v-5h5",
};

function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n];
  if (!d) return null;
  const parts = Array.isArray(d) ? d : d.split(/(?=M)/).filter(Boolean);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0}}>
      {parts.map((p,i) => {
        if(p.startsWith("circle")) {
          const m = p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);
          if(m) return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;
        }
        return <path key={i} d={p}/>;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,padding:"0 18px 34px",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}>
          <div style={{width:32,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:700}}>{title}</span>
            <button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="x" size={13} color={C.dim}/>
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function FI({ label, value, onChange, type="text", placeholder, min, max }) {
  return (
    <div style={{marginBottom:11}}>
      {label && <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <input type={type} value={value} placeholder={placeholder} min={min} max={max}
        onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

function FTA({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{marginBottom:11}}>
      {label && <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <textarea value={value} placeholder={placeholder} rows={rows}
        onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}}/>
    </div>
  );
}

function FS({ label, value, onChange, opts }) {
  return (
    <div style={{marginBottom:11}}>
      {label && <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>
        {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color, sm, outline, full=true, style:s={} }) {
  const c = color||ACCENT;
  return (
    <button onClick={onClick}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        padding:sm?"7px 13px":"11px 18px",borderRadius:10,cursor:"pointer",
        background:outline?"transparent":"linear-gradient(135deg,"+c+"dd,"+c+"88)",
        border:outline?"1.5px solid "+c:"none",
        color:outline?c:"#fff",fontWeight:700,fontSize:sm?11:13,
        width:full?"100%":"auto",...s}}>
      {children}
    </button>
  );
}

function Card({ children, color, style:s={} }) {
  return (
    <div style={{background:C.card,border:"1px solid "+(color?color+"22":C.b1),borderRadius:14,padding:14,...s}}>
      {children}
    </div>
  );
}

function ProgressBar({ value, color, height=5 }) {
  return (
    <div style={{height,background:C.b1,borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:value+"%",background:color||ACCENT,borderRadius:99,transition:"width .5s"}}/>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:(color||ACCENT)+"22",color:color||ACCENT,fontWeight:700,whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  {id:"hod",     icon:"treelife", label:"Hod"},
  {id:"carreira",icon:"monitor",  label:"Carreira"},
  {id:"ativa",   icon:"zap",      label:"R. Ativa"},
  {id:"negocio", icon:"rocket",   label:"Negócio"},
  {id:"marca",   icon:"globe",    label:"Marca"},
  {id:"cfg",     icon:"gear",     label:"Config"},
];

const PHASES = [
  {id:"exploracao", label:"Exploração",   color:"#8b5cf6", desc:"Gerando e testando hipóteses"},
  {id:"validacao",  label:"Validação",    color:"#f59e0b", desc:"Confirmando que existe mercado"},
  {id:"estruturacao",label:"Estruturação",color:ACCENT,    desc:"Construindo a operação base"},
  {id:"escala",     label:"Escala",       color:"#10b981", desc:"Crescendo com o que funciona"},
];

const SKILL_CATS = ["Técnica","Comportamental","Liderança","Gestão","Comunicação","Estratégia","Outro"];
const CONTENT_FORMATS = ["Texto/Post","Artigo longo","Vídeo","Newsletter","Podcast","Evento","Outro"];
const CHANNELS = ["LinkedIn","Instagram","YouTube","Blog","TikTok","Twitter/X","Outro"];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────────────
const D_SKILLS = [
  {id:"sk1",name:"Discovery e Pesquisa",cat:"Técnica",level:3,target:5,notes:"Aprofundar em jobs-to-be-done"},
  {id:"sk2",name:"Roadmap e Priorização",cat:"Técnica",level:4,target:5,notes:""},
  {id:"sk3",name:"Comunicação com Stakeholders",cat:"Comportamental",level:3,target:5,notes:""},
  {id:"sk4",name:"Métricas e Dados",cat:"Técnica",level:2,target:5,notes:"Evoluir SQL e análise"},
  {id:"sk5",name:"Liderança sem Autoridade",cat:"Liderança",level:3,target:5,notes:""},
];
const D_CAR_GOALS = [
  {id:"cg1",title:"Obter certificação PSPO",done:false,prazo:"2026-12-01",xp:150},
  {id:"cg2",title:"Assumir produto estratégico na empresa",done:false,prazo:"2026-09-01",xp:200},
  {id:"cg3",title:"Liderar discovery de nova feature",done:false,prazo:"2026-07-01",xp:100},
];
const D_CAR_HABITS = [
  {id:"ch1",title:"Ler 20 min sobre produto/gestão",freq:"Diário",done:false,xp:10},
  {id:"ch2",title:"Alinhar expectativas com stakeholders",freq:"Semanal",done:false,xp:20},
  {id:"ch3",title:"Registrar uma conquista ou aprendizado",freq:"Semanal",done:false,xp:15},
];
const D_ACHIEVEMENTS = [
  {id:"ach1",date:"2026-04-10",title:"Lançamento do produto X com 30% acima da meta","impact":"Alto"},
  {id:"ach2",date:"2026-03-01",title:"Reduziu tempo de discovery em 40%","impact":"Alto"},
];
const D_ACTIVE_SOURCES = [
  {id:"as1",name:"Professor Particular",desc:"Aulas de matemática e física para vestibular",color:"#06b6d4",
   students:[
     {id:"s1",name:"Pedro",freq:"2x semana",since:"2026-01-15",active:true},
     {id:"s2",name:"Ana",freq:"1x semana",since:"2026-03-01",active:true},
   ],
   price:120, goal:3000,
   revenueHistory:[],
   habits:[
     {id:"ah1",title:"Preparar material das aulas",freq:"Semanal",done:false,xp:15},
     {id:"ah2",title:"Pedir feedback aos alunos",freq:"Mensal",done:false,xp:20},
   ],
   nextSteps:[
     {id:"ans1",title:"Criar perfil no Superprof",done:false},
     {id:"ans2",title:"Montar banco de exercícios por tema",done:false},
   ],
  },
];
const D_BUSINESSES = [
  {id:"bus1",name:"Despachante Digital Europa",color:"#8b5cf6",phase:"exploracao",
   pitch:"Serviço online de suporte burocrático para brasileiros na Europa, especialmente Itália",
   targetAudience:"Brasileiros emigrando ou já na Europa",
   valueProp:"Simplificar burocracia europeia à distância, em português",
   revenueModel:"Taxa por serviço ou assinatura mensal",
   country:"Itália",
   learnings:[
     {id:"l1",date:"2026-05-01",text:"Alta demanda em grupos de brasileiros na Itália no Facebook",positive:true},
     {id:"l2",date:"2026-05-10",text:"Regulação para despachantes varia por país — precisa pesquisar",positive:false},
   ],
   experiments:[
     {id:"e1",title:"Conversar com 5 brasileiros que foram para Europa",status:"andamento",prazo:"2026-07-01"},
     {id:"e2",title:"Mapear os 3 processos burocráticos mais dolorosos",status:"nao_iniciado",prazo:"2026-08-01"},
   ],
   nextStep:"Entrevistar 5 brasileiros que foram para a Itália nos últimos 2 anos",
  },
];
const D_BRAND = {
  pillars:["PO/PM","Educação","Imigração para Europa"],
  channels:[
    {id:"bc1",name:"LinkedIn",active:true,followers:0,goal:1000,freq:"2x semana",notes:"Foco em carreira e produto",followerHistory:[]},
    {id:"bc2",name:"Instagram",active:false,followers:0,goal:500,freq:"",notes:"",followerHistory:[]},
  ],
  contentPlan:[
    {id:"cp1",title:"Jornada de um PO: o que aprendi em X anos",format:"Texto/Post",channel:"LinkedIn",status:"ideia",prazo:"2026-07-01"},
    {id:"cp2",title:"Como é se preparar para morar na Itália",format:"Texto/Post",channel:"LinkedIn",status:"ideia",prazo:"2026-08-01"},
  ],
  habits:[
    {id:"bh1",title:"Publicar um conteúdo",freq:"Semanal",done:false,xp:25},
    {id:"bh2",title:"Comentar em 5 posts relevantes",freq:"Semanal",done:false,xp:10},
    {id:"bh3",title:"Responder todos os comentários recebidos",freq:"Semanal",done:false,xp:10},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  C = dark ? DARK : LIGHT;

  const [tab,  setTab]  = useState("hod");
  const [page, setPage] = useState(null);
  const [sh,   setSh]   = useState(null);
  const [f,    setF]    = useState({});
  const F = v => setF(x=>({...x,...v}));
  const [toast, setToast] = useState(null);

  // state
  const [skills,    setSkills]    = useState(D_SKILLS);
  const [carGoals,  setCarGoals]  = useState(D_CAR_GOALS);
  const [carHabits, setCarHabits] = useState(D_CAR_HABITS);
  const [achievements, setAchievements] = useState(D_ACHIEVEMENTS);
  const [sources,   setSources]   = useState(D_ACTIVE_SOURCES);
  const [businesses,setBusinesses]= useState(D_BUSINESSES);
  const [brand,     setBrand]     = useState(D_BRAND);
  const [xp, setXp] = useState(0);
  const [actions, setActions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [pendingAch, setPendingAch] = useState(null); // goal that just got completed → offer as achievement

  // ── PERSISTENCE ─────────────────────────────────────────────────────────────
  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const keys = ["skills","carGoals","carHabits","achievements","sources","businesses","brand","xp","actions"];
        const setters = {skills:setSkills,carGoals:setCarGoals,carHabits:setCarHabits,achievements:setAchievements,sources:setSources,businesses:setBusinesses,brand:setBrand,xp:setXp,actions:setActions};
        for (const k of keys) {
          try {
            const r = await window.storage.get("prof:"+k);
            if (r) setters[k](JSON.parse(r.value));
          } catch(_) {}
        }
      } catch(_) {}
      setStorageReady(true);
    };
    load();
  }, []);

  useEffect(() => { if(!storageReady) return; window.storage.set("prof:skills", JSON.stringify(skills)).catch(()=>{}); }, [skills, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:carGoals", JSON.stringify(carGoals)).catch(()=>{}); }, [carGoals, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:carHabits", JSON.stringify(carHabits)).catch(()=>{}); }, [carHabits, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:achievements", JSON.stringify(achievements)).catch(()=>{}); }, [achievements, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:sources", JSON.stringify(sources)).catch(()=>{}); }, [sources, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:businesses", JSON.stringify(businesses)).catch(()=>{}); }, [businesses, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:brand", JSON.stringify(brand)).catch(()=>{}); }, [brand, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:xp", JSON.stringify(xp)).catch(()=>{}); }, [xp, storageReady]);
  useEffect(() => { if(!storageReady) return; window.storage.set("prof:actions", JSON.stringify(actions)).catch(()=>{}); }, [actions, storageReady]);

  // Monthly revenue snapshot — records once per month per source
  useEffect(() => {
    if(!storageReady || !sources.length) return;
    const monthKey = new Date().toISOString().slice(0,7); // "2026-06"
    let changed = false;
    const updated = sources.map(src => {
      const hist = src.revenueHistory || [];
      if(hist.some(h=>h.month===monthKey)) return src; // already recorded
      const rev = src.students.filter(s=>s.active).length * src.price;
      changed = true;
      return {...src, revenueHistory:[...hist,{month:monthKey,rev}].slice(-6)};
    });
    if(changed) setSources(updated);
  }, [storageReady]); // only on load

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
  }, [storageReady]);

  const toast_ = (msg,color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };

  const suggestActions = () => {
    setLoadingAI(true);
    setAiError(null);
    const ctx = {
      carreira: {
        metas: carGoals.filter(g=>!g.done).map(g=>g.title),
        skills: skills.map(s=>s.name+" "+s.level+"/"+s.target),
      },
      rendaAtiva: sources.map(s=>({nome:s.name, alunos:s.students.filter(x=>x.active).length, meta:s.goal})),
      negocios: businesses.map(b=>({nome:b.name, fase:b.phase, experimentos:b.experiments.filter(e=>e.status!=="concluido").map(e=>e.title)})),
      marca: {pilares:brand.pillars, conteudo:brand.contentPlan.filter(c=>c.status==="ideia").map(c=>c.title)},
    };
    const instrucoes = "Você é um coach de desenvolvimento profissional. Sugira 6 ações concretas e factíveis para esta semana com base no perfil abaixo: 2 para Carreira, 1 para Renda Ativa, 2 para Negócio, 1 para Marca. Cada ação deve ser específica e realizável em até 3 dias. Responda SOMENTE com JSON no formato: " + '{"actions":[{"mod":"Carreira","text":"acao aqui","c":"#f97316"}]}' + ". Perfil: " + JSON.stringify(ctx);
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{role:"user", content: instrucoes}],
      }),
    })
    .then(r=>r.json())
    .then(data=>{
      const text = (data.content||[]).map(i=>i.text||"").join("");
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if(start===-1||end===-1) throw new Error("JSON nao encontrado");
      const parsed = JSON.parse(text.slice(start, end+1));
      const newActs = (parsed.actions||[]).map(a=>({
        id:"act"+uid(), mod:a.mod||"Geral", text:a.text||"", c:a.c||ACCENT, done:false, fromAI:true,
      }));
      setActions(p=>[...p.filter(a=>a.done), ...newActs]);
      setAiError(null);
    })
    .catch(e=>{ setAiError("Erro ao gerar sugestões: "+e.message); })
    .finally(()=>{ setLoadingAI(false); });
  };

  const close  = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };
  const nav    = (type,id) => setPage({type,id});
  const back   = () => setPage(null);

  // score calculations
  const carScore = () => {
    const habS = carHabits.length ? carHabits.filter(h=>h.done).length/carHabits.length : 0.5;
    const goaS = carGoals.length  ? carGoals.filter(g=>g.done).length/carGoals.length   : 0;
    const skS  = skills.length    ? skills.reduce((s,sk)=>s+(sk.level/sk.target),0)/skills.length : 0.5;
    return Math.round((habS*0.3 + goaS*0.4 + skS*0.3)*100);
  };
  const ativaScore = () => {
    if(!sources.length) return 0;
    return Math.round(sources.reduce((s,src)=>{
      const habS = src.habits.filter(h=>h.done).length/(src.habits.length||1);
      const stepS = src.nextSteps.filter(n=>n.done).length/(src.nextSteps.length||1);
      const revS = src.students.filter(s=>s.active).length*src.price >= src.goal ? 1 : (src.students.filter(s=>s.active).length*src.price)/src.goal;
      return s + (habS*0.3+stepS*0.3+revS*0.4);
    },0)/sources.length*100);
  };
  const negocioScore = () => {
    if(!businesses.length) return 0;
    return Math.round(businesses.reduce((s,b)=>{
      const phaseIdx = PHASES.findIndex(p=>p.id===b.phase);
      const phaseS = phaseIdx/3;
      const expS = b.experiments.filter(e=>e.status==="concluido").length/(b.experiments.length||1);
      const learnS = Math.min(1, b.learnings.length/5);
      return s + (phaseS*0.4+expS*0.3+learnS*0.3);
    },0)/businesses.length*100);
  };
  const marcaScore = () => {
    const habS = brand.habits.filter(h=>h.done).length/(brand.habits.length||1);
    const chanS = brand.channels.filter(c=>c.active).length/(brand.channels.length||1);
    const contS = brand.contentPlan.filter(c=>c.status==="publicado").length/(brand.contentPlan.length||1);
    return Math.round((habS*0.4+chanS*0.2+contS*0.4)*100);
  };
  const hodScore = () => Math.round((carScore()*0.35+ativaScore()*0.2+negocioScore()*0.25+marcaScore()*0.2));

  // ── HOD SCORE TAB ─────────────────────────────────────────────────────────
  const HodTab = () => {
    const hs = hodScore();
    const modules = [
      {l:"Carreira",    v:carScore(),     c:"#f97316", icon:"monitor",  w:35},
      {l:"Renda Ativa", v:ativaScore(),   c:"#06b6d4", icon:"zap",      w:20},
      {l:"Negócio",     v:negocioScore(), c:"#8b5cf6", icon:"rocket",   w:25},
      {l:"Marca Pessoal",v:marcaScore(), c:"#ec4899", icon:"globe",    w:20},
    ];
    return (
      <div style={{animation:"slideUp .3s ease"}}>
        <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>HOD — DESENVOLVIMENTO PROFISSIONAL</div>
              <div style={{fontSize:52,fontWeight:900,color:ACCENT,lineHeight:1}}>{hs}%</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:6}}>Leve para a Árvore</div>
              <div style={{background:C.card,border:"2px solid "+ACCENT,borderRadius:12,padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:900,color:ACCENT,lineHeight:1}}>{hs}</div>
                <div style={{fontSize:9,color:ACCENT,fontWeight:700,marginTop:2}}>% → Hod</div>
              </div>
            </div>
          </div>
          <div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",width:hs+"%",background:"linear-gradient(90deg,"+ACCENT+",#fbbf24)",borderRadius:99,transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:9,color:C.muted}}>Score calculado pelos seus dados reais</div>
          {xp>0&&<div style={{marginTop:8,fontSize:11,color:"#fbbf24",fontWeight:700}}>{"🪙 "+xp+" XP acumulados"}</div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {modules.map(m=>(
            <div key={m.l} onClick={()=>setTab(m.l==="Carreira"?"carreira":m.l==="Renda Ativa"?"ativa":m.l==="Negócio"?"negocio":"marca")}
              style={{background:C.card,border:"1px solid "+m.c+"22",borderRadius:14,padding:12,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                <Ico n={m.icon} size={13} color={m.c}/>
                <span style={{fontSize:10,color:C.muted,fontWeight:600,flex:1}}>{m.l}</span>
                <span style={{fontSize:8,padding:"1px 5px",borderRadius:99,background:m.c+"22",color:m.c,fontWeight:700}}>{m.w}%</span>
              </div>
              <div style={{fontSize:20,fontWeight:900,color:m.c,marginBottom:4}}>{m.v}%</div>
              <ProgressBar value={m.v} color={m.c} height={3}/>
              <div style={{fontSize:8,color:C.muted,marginTop:4}}>contribui {m.w}% do score</div>
            </div>
          ))}
        </div>

        <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>AÇÕES DA SEMANA</div>
              {actions.length>0&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>{actions.filter(a=>a.done).length+"/"+actions.length+" concluídas"}</div>}
            </div>
            <button onClick={suggestActions} disabled={loadingAI}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:10,cursor:loadingAI?"default":"pointer",
                background:loadingAI?"linear-gradient(135deg,"+C.b2+","+C.b1+")":"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)",
                border:"none",color:"#fff",fontWeight:700,fontSize:11,opacity:loadingAI?0.7:1}}>
              <Ico n="zap" size={12} color="#fff"/> {loadingAI?"Gerando...":"Sugerir ações"}
            </button>
          </div>
          {aiError&&<div style={{fontSize:11,color:"#ef4444",marginBottom:10,padding:"8px 12px",background:"#fee2e2",borderRadius:8}}>{aiError}</div>}
          {actions.length===0&&!loadingAI&&(
            <div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>
              <div style={{fontSize:24,marginBottom:8}}>✨</div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Nenhuma ação ainda</div>
              <div style={{fontSize:10}}>Toque em Sugerir ações para gerar ações personalizadas com IA</div>
            </div>
          )}
          {loadingAI&&<div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:11}}>Analisando suas metas e contexto...</div>}
          {actions.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>setActions(p=>p.map(x=>x.id===a.id?{...x,done:!x.done}:x))}
                style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",marginTop:1,
                  border:"1.5px solid "+(a.done?a.c:C.b2),background:a.done?a.c:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                {a.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:a.c,fontWeight:700,marginBottom:2}}>{a.mod.toUpperCase()}<span style={{marginLeft:6,fontSize:8,padding:"1px 5px",borderRadius:99,background:a.c+"22",color:a.c}}>IA</span></div>
                <div style={{fontSize:12,color:a.done?C.muted:C.text,textDecoration:a.done?"line-through":"none"}}>{a.text}</div>
              </div>
              <button onClick={()=>setActions(p=>p.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",marginTop:2}}><Ico n="x" size={11} color={C.muted}/></button>
            </div>
          ))}
          {actions.some(a=>a.done)&&(
            <button onClick={()=>setActions(p=>p.filter(a=>!a.done))} style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,background:C.b1,border:"none",cursor:"pointer",color:C.muted,fontSize:10,fontWeight:600}}>Limpar concluídas</button>
          )}
        </div>

        <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14,marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS</div>
            <span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{[...carHabits,...sources.flatMap(s=>s.habits),...brand.habits].filter(h=>h.done).length}/{[...carHabits,...sources.flatMap(s=>s.habits),...brand.habits].length}</span>
          </div>
          {[
            ...carHabits.map(h=>({...h,mod:"Carreira",c:ACCENT})),
            ...sources.flatMap(s=>s.habits.map(h=>({...h,mod:s.name,c:"#06b6d4"}))),
            ...brand.habits.map(h=>({...h,mod:"Marca",c:"#ec4899"})),
          ].map(h=>(
            <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>{
                if(ACCENT===h.c||h.c===ACCENT){if(!h.done)setXp(x=>x+h.xp);setCarHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}
                else if(h.c==="#06b6d4"){if(!h.done)setXp(x=>x+h.xp);setSources(p=>p.map(s=>({...s,habits:s.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)})));}
                else{if(!h.done)setXp(x=>x+h.xp);setBrand(b=>({...b,habits:b.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)}));}
              }} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?h.c:C.b2),background:h.done?h.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
                <div style={{fontSize:9,color:h.c,fontWeight:600,marginTop:1}}>{h.mod} · {h.freq}</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
            </div>
          ))}
        </div>

        <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>METAS</div>
            <span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{[...carGoals,...businesses.flatMap(b=>b.experiments.filter(e=>e.status==="concluido").map(e=>({done:true})))].filter(g=>g.done).length}/{[...carGoals].length}</span>
          </div>
          {carGoals.map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>{if(!g.done){setXp(x=>x+g.xp);setPendingAch(g);}setCarGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}}
                style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?"#f59e0b":C.b2),background:g.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                {g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div>
                <div style={{fontSize:9,color:C.muted}}>Carreira · Prazo: {g.prazo}</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>+{g.xp}</span>
            </div>
          ))}
        </div>

      </div>
    );
  };

  // ── CARREIRA TAB ──────────────────────────────────────────────────────────
  const CarreiraTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>SCORE DE CARREIRA</div>
            <div style={{fontSize:28,fontWeight:900,color:ACCENT}}>{carScore()}%</div>
          </div>
          <div style={{textAlign:"center",background:C.b1,borderRadius:10,padding:"8px 14px"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>Nível</div>
            <div style={{fontSize:13,fontWeight:800,color:ACCENT}}>PO Sênior</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Habilidades</div>
        <Btn sm full={false} onClick={()=>openSh("addSkill",{name:"",cat:SKILL_CATS[0],level:1,target:5,notes:""})}><Ico n="plus" size={11}/> Adicionar</Btn>
      </div>
      {skills.map(sk=>{
        const p=pct(sk.level,sk.target);
        return (
          <div key={sk.id} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 13px",marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div>
                <span style={{fontSize:12,fontWeight:600}}>{sk.name}</span>
                <Badge label={sk.cat} color={ACCENT}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:ACCENT}}>{sk.level}<span style={{fontSize:9,color:C.muted}}>/{sk.target}</span></span>
                <button onClick={()=>openSh("editSkill",{...sk})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button>
                <button onClick={()=>{setSkills(p=>p.filter(x=>x.id!==sk.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
              </div>
            </div>
            <ProgressBar value={p} color={ACCENT}/>
            {sk.notes&&<div style={{fontSize:9,color:C.muted,marginTop:4}}>{sk.notes}</div>}
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"16px 0"}}/>

      {/* Goals */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Objetivos</div>
        <Btn sm full={false} onClick={()=>openSh("addCarGoal",{title:"",prazo:todayS(),xp:100})}><Ico n="plus" size={11}/> Objetivo</Btn>
      </div>
      {carGoals.map(g=>(
        <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(g.done?ACCENT+"33":C.b1),borderRadius:11,marginBottom:6}}>
          <button onClick={()=>{
            if(!g.done){setXp(x=>x+g.xp);setPendingAch(g);}
            setCarGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));
          }}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?ACCENT:C.b2),background:g.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div>
            <div style={{fontSize:9,color:C.muted}}>Prazo: {g.prazo}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{g.xp}</span>
          <button onClick={()=>{setCarGoals(p=>p.filter(x=>x.id!==g.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}

      <div style={{height:1,background:C.b1,margin:"16px 0"}}/>

      {/* Habits */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Hábitos</div>
        <Btn sm full={false} onClick={()=>openSh("addCarHabit",{title:"",freq:"Diário",xp:10})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {carHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setCarHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
            <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>{setCarHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}

      <div style={{height:1,background:C.b1,margin:"16px 0"}}/>

      {/* Achievements */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Conquistas</div>
        <Btn sm full={false} onClick={()=>openSh("addAchievement",{title:"",date:todayS(),impact:"Alto"})}><Ico n="plus" size={11}/> Registrar</Btn>
      </div>
      <div style={{fontSize:9,color:C.muted,marginBottom:10}}>Registro para avaliações e entrevistas</div>
      {achievements.map(a=>(
        <div key={a.id} style={{padding:"10px 13px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>{a.title}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>{a.date}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Badge label={a.impact} color={a.impact==="Alto"?ACCENT:"#f59e0b"}/>
              <button onClick={()=>{setAchievements(p=>p.filter(x=>x.id!==a.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── RENDA ATIVA TAB ───────────────────────────────────────────────────────
  const AtivaTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:800}}>Renda Ativa</div>
          <div style={{fontSize:10,color:C.muted}}>Fontes de renda além do emprego</div>
        </div>
        <Btn sm full={false} color="#06b6d4" onClick={()=>openSh("addSource",{name:"",desc:"",color:"#06b6d4",price:0,goal:0})}>
          <Ico n="plus" size={11}/> Fonte
        </Btn>
      </div>

      {sources.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma fonte cadastrada</div>}
      {sources.map(src=>{
        const activeStudents = src.students.filter(s=>s.active).length;
        const monthlyRev = activeStudents * src.price;
        const revPct = pct(monthlyRev, src.goal);
        return (
          <Card key={src.id} color={src.color} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:src.color}}>{src.name}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{src.desc}</div>
              </div>
              <button onClick={()=>nav("source",src.id)} style={{background:src.color+"22",border:"1px solid "+src.color+"44",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:src.color,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                Ver <Ico n="chev" size={10} color={src.color}/>
              </button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:src.color}}>{activeStudents}</div>
                <div style={{fontSize:9,color:C.muted}}>alunos/clientes</div>
              </div>
              <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:src.color}}>{fmt(monthlyRev)}</div>
                <div style={{fontSize:9,color:C.muted}}>mês atual</div>
              </div>
              <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:src.color}}>{fmt(src.goal)}</div>
                <div style={{fontSize:9,color:C.muted}}>meta/mês</div>
              </div>
            </div>

            <ProgressBar value={revPct} color={src.color} height={4}/>
            <div style={{fontSize:9,color:C.muted,marginTop:4,marginBottom:10}}>{revPct}% da meta mensal</div>

            {/* next steps */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:6}}>PRÓXIMOS PASSOS</div>
            {src.nextSteps.map(ns=>(
              <div key={ns.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:"1px solid "+C.b1}}>
                <button onClick={()=>setSources(p=>p.map(s=>s.id===src.id?{...s,nextSteps:s.nextSteps.map(x=>x.id===ns.id?{...x,done:!x.done}:x)}:s))}
                  style={{width:18,height:18,borderRadius:5,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(ns.done?src.color:C.b2),background:ns.done?src.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {ns.done&&<Ico n="check" size={10} color="#fff" sw={2.5}/>}
                </button>
                <span style={{fontSize:11,color:ns.done?C.muted:C.text,textDecoration:ns.done?"line-through":"none",flex:1}}>{ns.title}</span>
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );

  // ── SOURCE PAGE ────────────────────────────────────────────────────────────
  const SourcePage = () => {
    const src = sources.find(s=>s.id===page.id); if(!src) return null;
    return (
      <div style={{animation:"slideUp .3s ease"}}>
        <button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
          <Ico n="back" size={13}/> Renda Ativa
        </button>

        <div style={{background:"linear-gradient(135deg,"+src.color+"18,"+src.color+"06)",border:"1px solid "+src.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:src.color,marginBottom:4}}>{src.name}</div>
              <div style={{fontSize:10,color:C.muted}}>{src.desc}</div>
            </div>
            <button onClick={()=>openSh("editSource",{id:src.id,name:src.name,desc:src.desc,price:src.price,goal:src.goal,color:src.color})}
              style={{background:src.color+"22",border:"1px solid "+src.color+"44",borderRadius:8,padding:"5px 11px",cursor:"pointer",color:src.color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:10}}>
              <Ico n="edit" size={11} color={src.color}/> Editar
            </button>
          </div>
          <div style={{display:"flex",gap:16,marginTop:4}}>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>RENDA/MÊS</div><div style={{fontSize:16,fontWeight:800}}>{fmt(src.students.filter(s=>s.active).length*src.price)}</div></div>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>META</div><div style={{fontSize:16,fontWeight:800,color:src.color}}>{fmt(src.goal)}</div></div>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>VALOR/UNIT</div><div style={{fontSize:16,fontWeight:800}}>{fmt(src.price)}</div></div>
          </div>
        </div>

        {/* Students */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Alunos / Clientes</div>
          <Btn sm full={false} color={src.color} onClick={()=>openSh("addStudent",{srcId:src.id,name:"",freq:"",since:todayS(),active:true})}><Ico n="plus" size={11}/> Adicionar</Btn>
        </div>
        {src.students.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(s.active?src.color+"22":C.b1),borderRadius:10,marginBottom:6}}>
            <div style={{width:28,height:28,borderRadius:8,background:src.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ico n="users" size={14} color={src.color}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
              <div style={{fontSize:9,color:C.muted}}>{s.freq} · desde {s.since}</div>
            </div>
            <Badge label={s.active?"Ativo":"Inativo"} color={s.active?src.color:C.muted}/>
            <button onClick={()=>setSources(p=>p.map(src2=>src2.id===src.id?{...src2,students:src2.students.filter(x=>x.id!==s.id)}:src2))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        ))}

        <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

        {/* Habits */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Hábitos</div>
          <Btn sm full={false} color={src.color} onClick={()=>openSh("addSrcHabit",{srcId:src.id,title:"",freq:"Semanal",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
        </div>
        {src.habits.map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
            <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setSources(p=>p.map(s=>s.id===src.id?{...s,habits:s.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)}:s));}}
              style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?src.color:C.b2),background:h.done?src.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
              <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
            </div>
            <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          </div>
        ))}

        <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

        {/* Next steps */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Próximos Passos</div>
          <Btn sm full={false} color={src.color} onClick={()=>openSh("addSrcStep",{srcId:src.id,title:""})}><Ico n="plus" size={11}/> Passo</Btn>
        </div>
        {src.nextSteps.map(ns=>(
          <div key={ns.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
            <button onClick={()=>setSources(p=>p.map(s=>s.id===src.id?{...s,nextSteps:s.nextSteps.map(x=>x.id===ns.id?{...x,done:!x.done}:x)}:s))}
              style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(ns.done?src.color:C.b2),background:ns.done?src.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {ns.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
            </button>
            <span style={{fontSize:12,color:ns.done?C.muted:C.text,textDecoration:ns.done?"line-through":"none",flex:1}}>{ns.title}</span>
            <button onClick={()=>setSources(p=>p.map(s=>s.id===src.id?{...s,nextSteps:s.nextSteps.filter(x=>x.id!==ns.id)}:s))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        ))}

        {/* Revenue history chart */}
        {(src.revenueHistory||[]).length > 0 && (()=>{
          const hist = src.revenueHistory;
          const maxRev = Math.max(...hist.map(h=>h.rev), src.goal, 1);
          const prev = hist.length>=2 ? hist[hist.length-2].rev : null;
          const curr = hist[hist.length-1]?.rev ?? 0;
          const diff = prev !== null ? curr - prev : null;
          return (
            <div style={{marginTop:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:800}}>Histórico de Receita</div>
                {diff!==null&&(
                  <span style={{fontSize:10,fontWeight:700,color:diff>=0?"#10b981":"#ef4444"}}>
                    {diff>=0?"+":""}{fmt(diff)} vs mês anterior
                  </span>
                )}
              </div>
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"14px 12px"}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
                  {hist.map((h,i)=>{
                    const barH = Math.max(4, Math.round((h.rev/maxRev)*70));
                    const isLast = i===hist.length-1;
                    return (
                      <div key={h.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{fontSize:8,color:isLast?src.color:C.muted,fontWeight:isLast?700:400}}>{fmt(h.rev).replace("R$\u00a0","")}</div>
                        <div style={{width:"100%",height:barH,borderRadius:"4px 4px 0 0",
                          background:isLast?"linear-gradient(180deg,"+src.color+","+src.color+"88)":C.b2,
                          transition:"height .4s"}}/>
                        <div style={{fontSize:8,color:C.muted,whiteSpace:"nowrap"}}>{h.month.slice(5)}</div>
                      </div>
                    );
                  })}
                  {/* Goal line indicator */}
                </div>
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{flex:1,height:1,background:src.color+"44",borderTop:"1px dashed "+src.color+"66"}}/>
                  <span style={{fontSize:8,color:src.color,fontWeight:600}}>meta {fmt(src.goal)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ── NEGÓCIO TAB ───────────────────────────────────────────────────────────
  const NegocioTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:800}}>Negócio Próprio</div>
          <div style={{fontSize:10,color:C.muted}}>Do zero à operação</div>
        </div>
        <Btn sm full={false} color="#8b5cf6" onClick={()=>openSh("addBusiness",{name:"",pitch:"",targetAudience:"",valueProp:"",revenueModel:"",country:"",phase:"exploracao",color:"#8b5cf6"})}>
          <Ico n="plus" size={11}/> Ideia
        </Btn>
      </div>

      {businesses.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum projeto cadastrado</div>}
      {businesses.map(b=>{
        const phase = PHASES.find(p=>p.id===b.phase);
        return (
          <Card key={b.id} color={b.color} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:b.color,marginBottom:4}}>{b.name}</div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{b.pitch}</div>
              </div>
              <button onClick={()=>nav("business",b.id)} style={{background:b.color+"22",border:"1px solid "+b.color+"44",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:b.color,fontSize:10,fontWeight:700,marginLeft:8,display:"flex",alignItems:"center",gap:4}}>
                Ver <Ico n="chev" size={10} color={b.color}/>
              </button>
            </div>

            {/* Phase indicator */}
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {PHASES.map((p,i)=>{
                const phaseIdx = PHASES.findIndex(x=>x.id===b.phase);
                const active = p.id===b.phase;
                const done = i<phaseIdx;
                return (
                  <div key={p.id} style={{flex:1,height:4,borderRadius:99,background:done?p.color:active?p.color:C.b1,opacity:active?1:done?0.6:0.3}}/>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9}}>
              <span style={{color:phase?.color,fontWeight:700}}>{phase?.label}</span>
              <span style={{color:C.muted}}>{phase?.desc}</span>
            </div>

            <div style={{height:1,background:C.b1,margin:"10px 0"}}/>

            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:4}}>PRÓXIMO PASSO</div>
            <div style={{fontSize:12,fontWeight:600,color:b.color}}>{b.nextStep}</div>
          </Card>
        );
      })}
    </div>
  );

  // ── BUSINESS PAGE ──────────────────────────────────────────────────────────
  const BusinessPage = () => {
    const b = businesses.find(x=>x.id===page.id); if(!b) return null;
    const phase = PHASES.find(p=>p.id===b.phase);
    return (
      <div style={{animation:"slideUp .3s ease"}}>
        <button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
          <Ico n="back" size={13}/> Negócio
        </button>

        <div style={{background:"linear-gradient(135deg,"+b.color+"18,"+b.color+"06)",border:"1px solid "+b.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:b.color,marginBottom:4}}>{b.name}</div>
              <Badge label={phase?.label||""} color={phase?.color}/>
            </div>
            <button onClick={()=>openSh("editBusiness",{...b})} style={{background:b.color+"22",border:"1px solid "+b.color+"44",borderRadius:8,padding:"5px 11px",cursor:"pointer",color:b.color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
              <Ico n="edit" size={11} color={b.color}/> Editar
            </button>
          </div>
          <div style={{display:"flex",gap:4}}>
            {PHASES.map((p,i)=>{
              const phaseIdx=PHASES.findIndex(x=>x.id===b.phase);
              return (
                <button key={p.id} onClick={()=>setBusinesses(prev=>prev.map(x=>x.id===b.id?{...x,phase:p.id}:x))}
                  style={{flex:1,padding:"6px 4px",borderRadius:8,border:"none",cursor:"pointer",background:p.id===b.phase?p.color:i<phaseIdx?p.color+"44":C.b1,color:p.id===b.phase?"#fff":i<phaseIdx?p.color:C.muted,fontSize:9,fontWeight:700}}>
                  {p.label}
                </button>
              );
            })}
          </div>
          {/* Phase criteria */}
          {(() => {
            const phaseIdx = PHASES.findIndex(x=>x.id===b.phase);
            const criteria = [
              {from:"exploracao", to:"Validação",    items:["Pelo menos 3 experimentos concluídos","Pelo menos 1 aprendizado registrado","Problema validado com potenciais clientes"]},
              {from:"validacao",  to:"Estruturação", items:["Pelo menos 1 cliente pagante","Modelo de receita definido","Processo de entrega documentado"]},
              {from:"estruturacao",to:"Escala",      items:["Receita recorrente por 3 meses","Operação não depende só de você","Métricas de crescimento positivas"]},
            ][phaseIdx] || null;
            if(!criteria) return null;
            const expDone = b.experiments.filter(e=>e.status==="concluido").length;
            const learnDone = b.learnings.length;
            const autoCheck = [expDone>=3, learnDone>=1, false]; // 3rd always manual
            return (
              <div style={{marginTop:12,background:C.bg,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>CRITÉRIOS PARA AVANÇAR → {criteria.to.toUpperCase()}</div>
                {criteria.items.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{width:14,height:14,borderRadius:4,flexShrink:0,background:autoCheck[i]?"#10b98122":C.b1,border:"1px solid "+(autoCheck[i]?"#10b981":C.b2),display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {autoCheck[i]&&<span style={{fontSize:8,color:"#10b981"}}>✓</span>}
                    </div>
                    <span style={{fontSize:10,color:autoCheck[i]?C.text:C.muted}}>{item}</span>
                  </div>
                ))}
                <div style={{fontSize:8,color:C.muted,marginTop:6,fontStyle:"italic"}}>Critérios sugeridos — você pode avançar mesmo sem cumprir todos.</div>
              </div>
            );
          })()}
        </div>

        {/* Canvas */}
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>CANVAS DO NEGÓCIO</div>
          {[
            {l:"Público-alvo",v:b.targetAudience},{l:"Proposta de valor",v:b.valueProp},
            {l:"Modelo de receita",v:b.revenueModel},{l:"País/Mercado",v:b.country},
          ].map(r=>(
            <div key={r.l} style={{marginBottom:10}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>{r.l.toUpperCase()}</div>
              <div style={{fontSize:12,color:r.v?C.text:C.muted,fontStyle:r.v?"normal":"italic"}}>{r.v||"Não definido"}</div>
            </div>
          ))}
        </Card>

        {/* Experiments */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Experimentos</div>
          <Btn sm full={false} color={b.color} onClick={()=>openSh("addExp",{busId:b.id,title:"",status:"nao_iniciado",prazo:todayS()})}><Ico n="plus" size={11}/> Adicionar</Btn>
        </div>
        {b.experiments.map(e=>{
          const statusColor = e.status==="concluido"?"#10b981":e.status==="andamento"?b.color:"#64748b";
          const statusLabel = e.status==="concluido"?"Concluído":e.status==="andamento"?"Em andamento":"Não iniciado";
          return (
            <div key={e.id} style={{padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600}}>{e.title}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2}}>Prazo: {e.prazo}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Badge label={statusLabel} color={statusColor}/>
                  <button onClick={()=>setBusinesses(prev=>prev.map(x=>x.id===b.id?{...x,experiments:x.experiments.map(ex=>ex.id===e.id?{...ex,status:ex.status==="nao_iniciado"?"andamento":ex.status==="andamento"?"concluido":"nao_iniciado"}:ex)}:x))}
                    style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="refresh" size={11} color={C.muted}/>
                  </button>
                  <button onClick={()=>setBusinesses(prev=>prev.map(x=>x.id===b.id?{...x,experiments:x.experiments.filter(ex=>ex.id!==e.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

        {/* Learnings */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Aprendizados</div>
          <Btn sm full={false} color={b.color} onClick={()=>openSh("addLearning",{busId:b.id,text:"",date:todayS(),positive:true})}><Ico n="plus" size={11}/> Registrar</Btn>
        </div>
        {b.learnings.map(l=>(
          <div key={l.id} style={{display:"flex",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(l.positive?"#10b98122":"#ef444422"),borderRadius:11,marginBottom:7}}>
            <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:l.positive?"#10b98122":"#ef444422",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
              <span style={{fontSize:9}}>{l.positive?"✓":"!"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12}}>{l.text}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>{l.date}</div>
            </div>
            <button onClick={()=>setBusinesses(prev=>prev.map(x=>x.id===b.id?{...x,learnings:x.learnings.filter(x2=>x2.id!==l.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignSelf:"flex-start"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        ))}

        <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

        {/* Next step */}
        <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>Próximo Passo Prioritário</div>
        <div style={{background:b.color+"11",border:"1px solid "+b.color+"33",borderRadius:11,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:b.color}}>{b.nextStep}</div>
        </div>
        <Btn outline color={b.color} onClick={()=>openSh("editNextStep",{busId:b.id,nextStep:b.nextStep})}>
          <Ico n="edit" size={13}/> Atualizar próximo passo
        </Btn>
      </div>
    );
  };

  // ── MARCA TAB ──────────────────────────────────────────────────────────────
  const MarcaTab = () => (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:"linear-gradient(135deg,#ec489918,#ec489906)",border:"1px solid #ec489933",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{fontSize:9,color:"#ec4899",fontWeight:700,letterSpacing:1,marginBottom:4}}>MARCA PESSOAL</div>
        <div style={{fontSize:22,fontWeight:900,color:"#ec4899",marginBottom:8}}>{marcaScore()}%</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Pilares de identidade</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {brand.pillars.map((p,i)=>(
            <span key={i} style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:"#ec489922",color:"#ec4899",fontWeight:600}}>{p}</span>
          ))}
          <button onClick={()=>openSh("editPillars",{pillars:brand.pillars.join("\n")})}
            style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:C.b1,border:"none",cursor:"pointer",color:C.muted,fontWeight:600}}>+ Editar</button>
        </div>
      </div>

      {/* Channels */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Canais</div>
        <Btn sm full={false} color="#ec4899" onClick={()=>openSh("addChannel",{name:"LinkedIn",active:true,followers:0,goal:500,freq:"",notes:""})}><Ico n="plus" size={11}/> Canal</Btn>
      </div>
      {brand.channels.map(ch=>{
        const p2=pct(ch.followers,ch.goal);
        return (
          <div key={ch.id} style={{padding:"11px 13px",background:C.card,border:"1px solid "+(ch.active?"#ec489922":C.b1),borderRadius:12,marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Ico n="globe" size={14} color={ch.active?"#ec4899":C.muted}/>
                <span style={{fontSize:13,fontWeight:700}}>{ch.name}</span>
                <Badge label={ch.active?"Ativo":"Inativo"} color={ch.active?"#ec4899":C.muted}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openSh("editChannel",{...ch})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button>
                <button onClick={()=>setBrand(b=>({...b,channels:b.channels.filter(x=>x.id!==ch.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
              </div>
            </div>
            <div style={{display:"flex",gap:16,marginBottom:8}}>
              <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>SEGUIDORES</div>
                <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                  <div style={{fontSize:14,fontWeight:800}}>{ch.followers}</div>
                  {(()=>{
                    const hist = ch.followerHistory||[];
                    if(hist.length<2) return null;
                    const prev = hist[hist.length-2].count;
                    const curr = hist[hist.length-1].count;
                    const d = curr-prev;
                    if(d===0) return null;
                    return <span style={{fontSize:9,fontWeight:700,color:d>0?"#10b981":"#ef4444"}}>{d>0?"+":""}{d}</span>;
                  })()}
                </div>
              </div>
              <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>META</div><div style={{fontSize:14,fontWeight:800,color:"#ec4899"}}>{ch.goal}</div></div>
              {ch.freq&&<div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>FREQUÊNCIA</div><div style={{fontSize:14,fontWeight:800}}>{ch.freq}</div></div>}
            </div>
            <ProgressBar value={p2} color="#ec4899" height={4}/>
            <div style={{fontSize:9,color:C.muted,marginTop:3}}>{p2}% da meta</div>
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Content plan */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Plano de Conteúdo</div>
        <Btn sm full={false} color="#ec4899" onClick={()=>openSh("addContent",{title:"",format:CONTENT_FORMATS[0],channel:"LinkedIn",status:"ideia",prazo:todayS()})}><Ico n="plus" size={11}/> Conteúdo</Btn>
      </div>
      {brand.contentPlan.map(c=>{
        const statusColor = c.status==="publicado"?"#10b981":c.status==="rascunho"?"#f59e0b":"#8b5cf6";
        const statusLabel = c.status==="publicado"?"Publicado":c.status==="rascunho"?"Rascunho":"Ideia";
        return (
          <div key={c.id} style={{padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{c.title}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:3}}>{c.format} · {c.channel} · {c.prazo}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={()=>setBrand(b=>({...b,contentPlan:b.contentPlan.map(x=>x.id===c.id?{...x,status:x.status==="ideia"?"rascunho":x.status==="rascunho"?"publicado":"ideia"}:x)}))}
                  style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico n="refresh" size={11} color={C.muted}/>
                </button>
                <Badge label={statusLabel} color={statusColor}/>
                <button onClick={()=>setBrand(b=>({...b,contentPlan:b.contentPlan.filter(x=>x.id!==c.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Habits */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Hábitos</div>
        <Btn sm full={false} color="#ec4899" onClick={()=>openSh("addBrandHabit",{title:"",freq:"Semanal",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {brand.habits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setBrand(b=>({...b,habits:b.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)}));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?"#ec4899":C.b2),background:h.done?"#ec4899":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
            <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>setBrand(b=>({...b,habits:b.habits.filter(x=>x.id!==h.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ── CONFIG TAB ─────────────────────────────────────────────────────────────
  const ConfigTab = () => {
    const secBtn = (label, onClick) => (
      <button onClick={onClick} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{label}</button>
    );
    const Row = ({dot, title, sub, onEdit, onDel}) => (
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
        {dot && <div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0}}/>}
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600}}>{title}</div>
          {sub && <div style={{fontSize:9,color:C.muted}}>{sub}</div>}
        </div>
        {onEdit && <button onClick={onEdit} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>}
        {onDel  && <button onClick={onDel}  style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>}
      </div>
    );
    const Sec = ({title, addLabel, onAdd, children}) => (
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

        {/* Habilidades */}
        <Sec title="Habilidades" addLabel="Adicionar" onAdd={()=>openSh("addSkill",{name:"",cat:SKILL_CATS[0],level:1,target:5,notes:""})}>
          {skills.map(sk=>(
            <Row key={sk.id} dot={ACCENT} title={sk.name} sub={sk.cat+" · Nível "+sk.level+"/"+sk.target}
              onEdit={()=>openSh("editSkill",{...sk})}
              onDel={()=>{setSkills(p=>p.filter(x=>x.id!==sk.id));toast_("Removido");}}/>
          ))}
        </Sec>

        {/* Objetivos de carreira */}
        <Sec title="Objetivos de Carreira" addLabel="Adicionar" onAdd={()=>openSh("addCarGoal",{title:"",prazo:todayS(),xp:100})}>
          {carGoals.map(g=>(
            <Row key={g.id} title={g.title} sub={"Prazo: "+g.prazo+" · "+g.xp+" XP"+(g.done?" · Concluído":"")}
              onEdit={()=>openSh("editCarGoal",{...g})}
              onDel={()=>{setCarGoals(p=>p.filter(x=>x.id!==g.id));toast_("Removido");}}/>
          ))}
        </Sec>

        {/* Hábitos de carreira */}
        <Sec title="Hábitos de Carreira" addLabel="Adicionar" onAdd={()=>openSh("addCarHabit",{title:"",freq:"Diário",xp:10})}>
          {carHabits.map(h=>(
            <Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"}
              onEdit={()=>openSh("editCarHabit",{...h})}
              onDel={()=>{setCarHabits(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}}/>
          ))}
        </Sec>

        {/* Fontes de renda ativa */}
        <Sec title="Fontes de Renda Ativa" addLabel="Adicionar" onAdd={()=>openSh("addSource",{name:"",desc:"",color:"#06b6d4",price:0,goal:0})}>
          {sources.map(src=>(
            <Row key={src.id} dot={src.color} title={src.name}
              sub={src.students.filter(s=>s.active).length+" alunos/clientes · Meta: "+fmt(src.goal)+"/mês"}
              onEdit={()=>openSh("editSource",{id:src.id,name:src.name,desc:src.desc,price:src.price,goal:src.goal,color:src.color})}
              onDel={()=>{setSources(p=>p.filter(x=>x.id!==src.id));toast_("Removido");}}/>
          ))}
        </Sec>

        {/* Negócios */}
        <Sec title="Projetos / Negócios" addLabel="Adicionar" onAdd={()=>openSh("addBusiness",{name:"",pitch:"",targetAudience:"",valueProp:"",revenueModel:"",country:"",phase:"exploracao",color:"#8b5cf6"})}>
          {businesses.map(b=>{
            const phase=PHASES.find(p=>p.id===b.phase);
            return (
              <Row key={b.id} dot={b.color} title={b.name} sub={phase?.label||""}
                onEdit={()=>openSh("editBusiness",{...b})}
                onDel={()=>{setBusinesses(p=>p.filter(x=>x.id!==b.id));toast_("Removido");}}/>
            );
          })}
        </Sec>

        {/* Marca pessoal */}
        <Sec title="Hábitos de Marca Pessoal" addLabel="Adicionar" onAdd={()=>openSh("addBrandHabit",{title:"",freq:"Semanal",xp:15})}>
          {brand.habits.map(h=>(
            <Row key={h.id} title={h.title} sub={h.freq+" · "+h.xp+" XP"}
              onEdit={()=>openSh("editBrandHabit",{...h})}
              onDel={()=>{setBrand(b=>({...b,habits:b.habits.filter(x=>x.id!==h.id)}));toast_("Removido");}}/>
          ))}
        </Sec>

        {/* Canais */}
        <Sec title="Canais de Marca" addLabel="Adicionar" onAdd={()=>openSh("addChannel",{name:"LinkedIn",active:true,followers:0,goal:500,freq:"",notes:""})}>
          {brand.channels.map(ch=>(
            <Row key={ch.id} title={ch.name}
              sub={(ch.active?"Ativo":"Inativo")+" · "+ch.followers+" seguidores · Meta: "+ch.goal}
              onEdit={()=>openSh("editChannel",{...ch})}
              onDel={()=>{setBrand(b=>({...b,channels:b.channels.filter(x=>x.id!==ch.id)}));toast_("Removido");}}/>
          ))}
        </Sec>

      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  const renderPage = () => {
    if(!page) return null;
    if(page.type==="source")   return <SourcePage/>;
    if(page.type==="business") return <BusinessPage/>;
    return null;
  };

  const renderTab = () => {
    if(tab==="hod")      return <HodTab/>;
    if(tab==="carreira") return <CarreiraTab/>;
    if(tab==="ativa")    return <AtivaTab/>;
    if(tab==="negocio")  return <NegocioTab/>;
    if(tab==="marca")    return <MarcaTab/>;
    if(tab==="cfg")      return <ConfigTab/>;
    return null;
  };

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+"}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}"}</style>

      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>
          {toast.msg}
        </div>
      )}

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

      {/* Achievement prompt — fires when a goal is first completed */}
      {pendingAch&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setPendingAch(null)}>
          <div style={{background:C.surface,borderRadius:18,padding:22,width:"100%",maxWidth:390,boxShadow:"0 24px 60px rgba(0,0,0,.4)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:28,textAlign:"center",marginBottom:8}}>🏆</div>
            <div style={{fontSize:15,fontWeight:800,textAlign:"center",marginBottom:6}}>Objetivo concluído!</div>
            <div style={{fontSize:12,color:C.muted,textAlign:"center",marginBottom:18,lineHeight:1.5}}>Quer registrar como conquista para usar em avaliações e entrevistas?</div>
            <div style={{background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:ACCENT,marginBottom:4}}>Título sugerido</div>
              <div style={{fontSize:13,fontWeight:600}}>{pendingAch.title}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn outline color={C.muted} onClick={()=>setPendingAch(null)} style={{flex:1}}>Pular</Btn>
              <Btn color={ACCENT} onClick={()=>{
                setAchievements(p=>[...p,{id:"ach"+uid(),title:pendingAch.title,date:todayS(),impact:"Alto"}]);
                toast_("Conquista registrada! 🏆");
                setPendingAch(null);
              }} style={{flex:1}}>Registrar</Btn>
            </div>
          </div>
        </div>
      )}

      {sh==="addSkill"&&(
        <Sheet title="Nova Habilidade" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Discovery e Pesquisa"/>
          <FS label="Categoria" value={f.cat||SKILL_CATS[0]} onChange={v=>F({cat:v})} opts={SKILL_CATS.map(c=>({v:c,l:c}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Nível atual (1-5)" value={f.level||1} onChange={v=>F({level:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
            <FI label="Meta (1-5)" value={f.target||5} onChange={v=>F({target:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
          </div>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} placeholder="Como evoluir nessa habilidade?"/>
          <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setSkills(p=>[...p,{id:"sk"+uid(),...f,level:Number(f.level)||1,target:Number(f.target)||5}]);toast_("Adicionado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editSkill"&&(
        <Sheet title="Editar Habilidade" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
          <FS label="Categoria" value={f.cat||SKILL_CATS[0]} onChange={v=>F({cat:v})} opts={SKILL_CATS.map(c=>({v:c,l:c}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Nível atual (1-5)" value={f.level||1} onChange={v=>F({level:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
            <FI label="Meta (1-5)" value={f.target||5} onChange={v=>F({target:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
          </div>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})}/>
          <Btn color={ACCENT} onClick={()=>{setSkills(p=>p.map(x=>x.id===f.id?{...x,...f,level:Number(f.level),target:Number(f.target)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addCarGoal"&&(
        <Sheet title="Novo Objetivo de Carreira" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Obter certificação PSPO"/>
          <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
          <FI label="XP de recompensa" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/>
          <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setCarGoals(p=>[...p,{id:"cg"+uid(),title:f.title,prazo:f.prazo||todayS(),xp:Number(f.xp)||100,done:false}]);toast_("Objetivo criado");close();}}>Criar</Btn>
        </Sheet>
      )}
      {sh==="addCarHabit"&&(
        <Sheet title="Novo Hábito de Carreira" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Ler 20 min sobre produto"/>
          <FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
          <FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/>
          <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setCarHabits(p=>[...p,{id:"ch"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||10,done:false}]);toast_("Hábito criado");close();}}>Criar</Btn>
        </Sheet>
      )}
      {sh==="addAchievement"&&(
        <Sheet title="Registrar Conquista" onClose={close}>
          <FTA label="Conquista" value={f.title||""} onChange={v=>F({title:v})} placeholder="Descreva o resultado e impacto..." rows={3}/>
          <FI label="Data" value={f.date||todayS()} onChange={v=>F({date:v})} type="date"/>
          <FS label="Impacto" value={f.impact||"Alto"} onChange={v=>F({impact:v})} opts={["Alto","Médio","Baixo"].map(x=>({v:x,l:x}))}/>
          <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setAchievements(p=>[...p,{id:"ach"+uid(),title:f.title,date:f.date||todayS(),impact:f.impact||"Alto"}]);toast_("Registrado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addSource"&&(
        <Sheet title="Nova Fonte de Renda Ativa" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Professor Particular"/>
          <FTA label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} placeholder="O que você faz?" rows={2}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Valor unitário (R$)" value={f.price||0} onChange={v=>F({price:v})} type="number"/>
            <FI label="Meta mensal (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number"/>
          </div>
          <Btn color="#06b6d4" onClick={()=>{if(!f.name)return;setSources(p=>[...p,{id:"as"+uid(),name:f.name,desc:f.desc||"",color:f.color||"#06b6d4",price:Number(f.price)||0,goal:Number(f.goal)||0,students:[],habits:[],nextSteps:[],revenueHistory:[]}]);toast_("Fonte adicionada");close();}}>Criar</Btn>
        </Sheet>
      )}
      {sh==="addStudent"&&(
        <Sheet title="Novo Aluno / Cliente" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Nome do aluno ou cliente"/>
          <FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})} placeholder="Ex: 2x semana"/>
          <FI label="Desde" value={f.since||todayS()} onChange={v=>F({since:v})} type="date"/>
          <Btn color="#06b6d4" onClick={()=>{if(!f.name)return;setSources(p=>p.map(s=>s.id===f.srcId?{...s,students:[...s.students,{id:"s"+uid(),name:f.name,freq:f.freq||"",since:f.since||todayS(),active:true}]}:s));toast_("Adicionado");close();}}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="addSrcHabit"&&(
        <Sheet title="Novo Hábito" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Preparar material das aulas"/>
          <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
          <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
          <Btn color="#06b6d4" onClick={()=>{if(!f.title)return;setSources(p=>p.map(s=>s.id===f.srcId?{...s,habits:[...s.habits,{id:"ah"+uid(),title:f.title,freq:f.freq||"Semanal",xp:Number(f.xp)||15,done:false}]}:s));toast_("Criado");close();}}>Criar</Btn>
        </Sheet>
      )}
      {sh==="addSrcStep"&&(
        <Sheet title="Novo Próximo Passo" onClose={close}>
          <FI label="Descrição" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Criar perfil no Superprof"/>
          <Btn color="#06b6d4" onClick={()=>{if(!f.title)return;setSources(p=>p.map(s=>s.id===f.srcId?{...s,nextSteps:[...s.nextSteps,{id:"ans"+uid(),title:f.title,done:false}]}:s));toast_("Adicionado");close();}}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="addBusiness"&&(
        <Sheet title="Novo Projeto / Ideia" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Despachante Digital Europa"/>
          <FTA label="Pitch (1 frase)" value={f.pitch||""} onChange={v=>F({pitch:v})} placeholder="O que é e para quem?" rows={2}/>
          <FI label="Público-alvo" value={f.targetAudience||""} onChange={v=>F({targetAudience:v})} placeholder="Quem você quer ajudar?"/>
          <FI label="Proposta de valor" value={f.valueProp||""} onChange={v=>F({valueProp:v})} placeholder="Que problema você resolve?"/>
          <FI label="Como vai ganhar dinheiro" value={f.revenueModel||""} onChange={v=>F({revenueModel:v})} placeholder="Ex: Taxa por serviço"/>
          <FI label="País / Mercado" value={f.country||""} onChange={v=>F({country:v})} placeholder="Ex: Itália, Europa"/>
          <FS label="Fase atual" value={f.phase||"exploracao"} onChange={v=>F({phase:v})} opts={PHASES.map(p=>({v:p.id,l:p.label+" — "+p.desc}))}/>
          <Btn color="#8b5cf6" onClick={()=>{if(!f.name)return;setBusinesses(p=>[...p,{id:"bus"+uid(),name:f.name,pitch:f.pitch||"",targetAudience:f.targetAudience||"",valueProp:f.valueProp||"",revenueModel:f.revenueModel||"",country:f.country||"",phase:f.phase||"exploracao",color:f.color||"#8b5cf6",learnings:[],experiments:[],nextStep:"Definir o primeiro experimento"}]);toast_("Projeto criado","#8b5cf6");close();}}>Criar Projeto</Btn>
        </Sheet>
      )}
      {sh==="editBusiness"&&(
        <Sheet title="Editar Projeto" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
          <FTA label="Pitch" value={f.pitch||""} onChange={v=>F({pitch:v})} rows={2}/>
          <FI label="Público-alvo" value={f.targetAudience||""} onChange={v=>F({targetAudience:v})}/>
          <FI label="Proposta de valor" value={f.valueProp||""} onChange={v=>F({valueProp:v})}/>
          <FI label="Como vai ganhar dinheiro" value={f.revenueModel||""} onChange={v=>F({revenueModel:v})}/>
          <FI label="País / Mercado" value={f.country||""} onChange={v=>F({country:v})}/>
          <Btn color="#8b5cf6" onClick={()=>{setBusinesses(p=>p.map(x=>x.id===f.id?{...x,...f}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addExp"&&(
        <Sheet title="Novo Experimento" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Entrevistar 5 potenciais clientes"/>
          <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
          <Btn color="#8b5cf6" onClick={()=>{if(!f.title)return;setBusinesses(p=>p.map(x=>x.id===f.busId?{...x,experiments:[...x.experiments,{id:"e"+uid(),title:f.title,status:"nao_iniciado",prazo:f.prazo||todayS()}]}:x));toast_("Adicionado");close();}}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="addLearning"&&(
        <Sheet title="Registrar Aprendizado" onClose={close}>
          <FTA label="O que você aprendeu?" value={f.text||""} onChange={v=>F({text:v})} placeholder="Descreva o aprendizado..." rows={3}/>
          <FI label="Data" value={f.date||todayS()} onChange={v=>F({date:v})} type="date"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700,letterSpacing:.8}}>TIPO</div>
            <div style={{display:"flex",gap:8}}>
              {[{v:true,l:"Positivo",c:"#10b981"},{v:false,l:"Atenção",c:"#ef4444"}].map(o=>(
                <button key={String(o.v)} onClick={()=>F({positive:o.v})}
                  style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,border:"1.5px solid "+((f.positive!==false)===o.v?o.c:C.b2),background:(f.positive!==false)===o.v?o.c+"18":"transparent",color:(f.positive!==false)===o.v?o.c:C.text}}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <Btn color="#8b5cf6" onClick={()=>{if(!f.text)return;setBusinesses(p=>p.map(x=>x.id===f.busId?{...x,learnings:[...x.learnings,{id:"l"+uid(),text:f.text,date:f.date||todayS(),positive:f.positive!==false}]}:x));toast_("Registrado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editNextStep"&&(
        <Sheet title="Próximo Passo Prioritário" onClose={close}>
          <FTA label="Qual é o próximo passo concreto?" value={f.nextStep||""} onChange={v=>F({nextStep:v})} placeholder="Uma ação específica e factível..." rows={3}/>
          <Btn color="#8b5cf6" onClick={()=>{setBusinesses(p=>p.map(x=>x.id===f.busId?{...x,nextStep:f.nextStep}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editPillars"&&(
        <Sheet title="Pilares da Marca" onClose={close}>
          <FTA label="Pilares (um por linha)" value={f.pillars||""} onChange={v=>F({pillars:v})} placeholder={"PO/PM\nEducação\nImigração para Europa"} rows={5}/>
          <div style={{fontSize:10,color:C.muted,marginBottom:12}}>Em que assuntos você quer ser referência?</div>
          <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,pillars:f.pillars.split("\n").map(x=>x.trim()).filter(Boolean)}));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addChannel"&&(
        <Sheet title="Novo Canal" onClose={close}>
          <FS label="Canal" value={f.name||"LinkedIn"} onChange={v=>F({name:v})} opts={CHANNELS.map(c=>({v:c,l:c}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Seguidores atuais" value={f.followers||0} onChange={v=>F({followers:v})} type="number"/>
            <FI label="Meta de seguidores" value={f.goal||500} onChange={v=>F({goal:v})} type="number"/>
          </div>
          <FI label="Frequência de publicação" value={f.freq||""} onChange={v=>F({freq:v})} placeholder="Ex: 2x semana"/>
          <FTA label="Foco / Notas" value={f.notes||""} onChange={v=>F({notes:v})} placeholder="Que tipo de conteúdo?" rows={2}/>
          <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,channels:[...b.channels,{id:"bc"+uid(),name:f.name||"LinkedIn",active:true,followers:Number(f.followers)||0,goal:Number(f.goal)||500,freq:f.freq||"",notes:f.notes||"",followerHistory:[]}]}));toast_("Canal adicionado");close();}}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="editChannel"&&(
        <Sheet title="Editar Canal" onClose={close}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Seguidores atuais" value={f.followers||0} onChange={v=>F({followers:v})} type="number"/>
            <FI label="Meta" value={f.goal||500} onChange={v=>F({goal:v})} type="number"/>
          </div>
          <FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})}/>
          <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/>
          <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,channels:b.channels.map(x=>x.id===f.id?{...x,followers:Number(f.followers),goal:Number(f.goal),freq:f.freq,notes:f.notes}:x)}));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="addContent"&&(
        <Sheet title="Novo Conteúdo" onClose={close}>
          <FI label="Título / Tema" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Jornada de um PO"/>
          <FS label="Formato" value={f.format||CONTENT_FORMATS[0]} onChange={v=>F({format:v})} opts={CONTENT_FORMATS.map(x=>({v:x,l:x}))}/>
          <FI label="Canal" value={f.channel||"LinkedIn"} onChange={v=>F({channel:v})} placeholder="LinkedIn, Instagram..."/>
          <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
          <Btn color="#ec4899" onClick={()=>{if(!f.title)return;setBrand(b=>({...b,contentPlan:[...b.contentPlan,{id:"cp"+uid(),title:f.title,format:f.format||CONTENT_FORMATS[0],channel:f.channel||"LinkedIn",status:"ideia",prazo:f.prazo||todayS()}]}));toast_("Adicionado");close();}}>Adicionar</Btn>
        </Sheet>
      )}
      {sh==="addBrandHabit"&&(
        <Sheet title="Novo Hábito de Marca" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Publicar um conteúdo"/>
          <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
          <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
          <Btn color="#ec4899" onClick={()=>{if(!f.title)return;setBrand(b=>({...b,habits:[...b.habits,{id:"bh"+uid(),title:f.title,freq:f.freq||"Semanal",xp:Number(f.xp)||15,done:false}]}));toast_("Criado");close();}}>Criar</Btn>
        </Sheet>
      )}
      {sh==="editCarGoal"&&(
        <Sheet title="Editar Objetivo" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
          <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
          <FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/>
          <Btn color={ACCENT} onClick={()=>{setCarGoals(p=>p.map(x=>x.id===f.id?{...x,title:f.title,prazo:f.prazo,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editCarHabit"&&(
        <Sheet title="Editar Hábito" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
          <FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
          <FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/>
          <Btn color={ACCENT} onClick={()=>{setCarHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editSource"&&(
        <Sheet title="Editar Fonte de Renda" onClose={close}>
          <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
          <FTA label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} rows={2}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FI label="Valor unitário (R$)" value={f.price||0} onChange={v=>F({price:v})} type="number"/>
            <FI label="Meta mensal (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number"/>
          </div>
          <Btn color="#06b6d4" onClick={()=>{setSources(p=>p.map(x=>x.id===f.id?{...x,name:f.name,desc:f.desc,price:Number(f.price),goal:Number(f.goal)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="editBrandHabit"&&(
        <Sheet title="Editar Hábito de Marca" onClose={close}>
          <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
          <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
          <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
          <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,habits:b.habits.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x)}));toast_("Atualizado");close();}}>Salvar</Btn>
        </Sheet>
      )}

    </div>
  );
}
