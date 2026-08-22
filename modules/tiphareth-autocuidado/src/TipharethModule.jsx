import { useState, useEffect, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK  = { bg:"#07090f",surface:"#0c1018",card:"#0f1520",b1:"#182030",b2:"#253040",text:"#eef2ff",muted:"#44556a",dim:"#7a8fa8",nav:"#060b12" };
const LIGHT = { bg:"#fffbf0",surface:"#ffffff",card:"#fffef7",b1:"#f0e6c8",b2:"#d4c090",text:"#2a1f0a",muted:"#8a7a5a",dim:"#4a3a1a",nav:"#fffbf0" };
let C = {...LIGHT};
const ACCENT = "#f59e0b";
const uid = () => Math.random().toString(36).slice(2,8);
const todayS = () => new Date().toISOString().slice(0,10);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IC = {
  plus:"M12 5v14M5 12h14",x:"M18 6 6 18M6 6l12 12",check:"M20 6 9 17l-5-5",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sun:["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  moon:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  gear:["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z","M12 2v2","M12 20v2","M4.93 4.93l1.41 1.41","M17.66 17.66l1.41 1.41","M2 12h2","M20 12h2","M6.34 17.66l-1.41 1.41","M19.07 4.93l-1.41 1.41"],
  heart:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  sparkle:["M12 3v4","M12 17v4","M3 12h4","M17 12h4","M5.64 5.64l2.83 2.83","M15.54 15.54l2.83 2.83","M5.64 18.36l2.83-2.83","M15.54 8.46l2.83-2.83"],
  droplet:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-2.5-5.5S13 5 12 2C9.9 5 5 8.5 5 15a7 7 0 0 0 7 7z",
  mirror:["M12 3v18","M5 8h14","M5 16h14","M8 3C8 3 5 6 5 12s3 9 3 9","M16 3C16 3 19 6 19 12s-3 9-3 9"],
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
  clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 6v6l4 2"],
  smile:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M8 14s1.5 2 4 2 4-2 4-2","M9 9h.01","M15 9h.01"],
  trash:["M3 6h18","M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6","M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2","M10 11v6","M14 11v6"],
  save:["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z","M14 2v4a2 2 0 0 0 2 2h4","M12 13v6","M9 16l3 3 3-3"],
  send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bot:"M12 8V4H8M12 8H8V4M12 8v4m0-4h4V4h-4M8 4H4v4h4M16 4h4v4h-4M8 12H4v4h4m4-4h4v4h-4m-4 4H4v4h4m4-4v4h4v-4",
  user:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  layout:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  eyeoff:["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24","M1 1l22 22"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","circle cx='12' cy='12' r='3'"],
  grip:"M9 3h1v1H9zM9 7h1v1H9zM9 11h1v1H9zM9 15h1v1H9zM14 3h1v1h-1zM14 7h1v1h-1zM14 11h1v1h-1zM14 15h1v1h-1z",
};
function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if(!d) return null;
  const parts = Array.isArray(d)?d:d.split(/(?=M)/).filter(Boolean);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {parts.map((p,i)=>{
        if(p.startsWith("circle")){const m=p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/);if(m)return<circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>;}
        return <path key={i} d={p}/>;
      })}
    </svg>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Sheet({title,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:430,padding:"0 18px 34px",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:C.surface,paddingTop:12,paddingBottom:12,zIndex:1}}>
          <div style={{width:32,height:3,background:C.b2,borderRadius:99,margin:"0 auto 12px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:700}}>{title}</span>
            <button onClick={onClose} style={{background:C.b1,border:"none",borderRadius:99,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={13} color={C.dim}/></button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
function FI({label,value,onChange,type="text",placeholder,min}){
  return(
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <input type={type} value={value} placeholder={placeholder} min={min} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}
function FTA({label,value,onChange,placeholder,rows=3}){
  return(
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <textarea value={value} placeholder={placeholder} rows={rows} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}}/>
    </div>
  );
}
function FS({label,value,onChange,opts}){
  return(
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>{label.toUpperCase()}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg,border:"1px solid "+C.b2,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"}}>
        {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
function Btn({children,onClick,color,sm,outline,full=true,disabled,style:s={}}){
  const c=color||ACCENT;
  return(
    <button onClick={onClick} disabled={disabled} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"7px 13px":"11px 18px",borderRadius:10,cursor:disabled?"default":"pointer",background:outline?"transparent":"linear-gradient(135deg,"+c+"dd,"+c+"88)",border:outline?"1.5px solid "+c:"none",color:outline?c:"#fff",fontWeight:700,fontSize:sm?11:13,width:full?"100%":"auto",opacity:disabled?0.55:1,...s}}>
      {children}
    </button>
  );
}
function Card({children,color,style:s={}}){
  return <div style={{background:C.card,border:"1px solid "+(color?color+"22":C.b1),borderRadius:14,padding:14,...s}}>{children}</div>;
}
function ProgressBar({value,color,height=5}){
  return(
    <div style={{height,background:C.b1,borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:Math.min(100,Math.max(0,value))+"%",background:color||ACCENT,borderRadius:99,transition:"width .5s"}}/>
    </div>
  );
}
function Badge({label,color}){
  return <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:(color||ACCENT)+"22",color:color||ACCENT,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
}

// ─── DATA DEFAULTS ────────────────────────────────────────────────────────────
const TABS=[
  {id:"tiph",   icon:"treelife",label:"Tiphareth"},
  {id:"aparencia",icon:"mirror",label:"Aparência"},
  {id:"bemestar",icon:"heart",  label:"Bem-estar"},
  {id:"rotinas", icon:"clock",  label:"Rotinas"},
  {id:"cfg",     icon:"gear",   label:"Config"},
];
const MOOD_OPTS=[
  {v:"energizado",l:"Energizado ⚡",c:"#f59e0b"},
  {v:"calmo",l:"Calmo 🌿",c:"#10b981"},
  {v:"cansado",l:"Cansado 🌙",c:"#6366f1"},
  {v:"ansioso",l:"Ansioso 🌀",c:"#8b5cf6"},
  {v:"feliz",l:"Feliz ☀️",c:"#f97316"},
];
const FREQ_OPTS=[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}];
const D_APARENCIA_HABITS=[
  {id:"ah1",title:"Skincare matinal",freq:"Diário",done:false,area:"aparencia",xp:15},
  {id:"ah2",title:"Skincare noturno",freq:"Diário",done:false,area:"aparencia",xp:15},
  {id:"ah3",title:"Cuidar das unhas",freq:"Semanal",done:false,area:"aparencia",xp:10},
  {id:"ah4",title:"Cuidar do cabelo",freq:"Semanal",done:false,area:"aparencia",xp:10},
];
const D_BEMESTAR_HABITS=[
  {id:"bh1",title:"10 min só para mim",freq:"Diário",done:false,area:"bemestar",xp:20},
  {id:"bh2",title:"Fazer algo prazeroso",freq:"Semanal",done:false,area:"bemestar",xp:25},
  {id:"bh3",title:"Escrever 3 coisas que gosto em mim",freq:"Semanal",done:false,area:"bemestar",xp:20},
];
const D_ROTINAS=[
  {id:"r1",name:"Rotina Matinal",time:"manhã",steps:[
    {id:"rs1",title:"Lavar o rosto",done:false,min:2},
    {id:"rs2",title:"Tônico",done:false,min:1},
    {id:"rs3",title:"Hidratante",done:false,min:2},
    {id:"rs4",title:"Protetor solar",done:false,min:2},
  ]},
  {id:"r2",name:"Rotina Noturna",time:"noite",steps:[
    {id:"rs6",title:"Double cleanse",done:false,min:5},
    {id:"rs7",title:"Sérum",done:false,min:2},
    {id:"rs8",title:"Hidratante noturno",done:false,min:2},
  ]},
];
const D_GOALS=[
  {id:"g1",title:"Manter rotina 30 dias",area:"aparencia",done:false,xp:150},
  {id:"g2",title:"Ritual de spa em casa",area:"bemestar",done:false,xp:100},
  {id:"g3",title:"Montar kit de skincare",area:"aparencia",done:false,xp:80},
];
const D_PRODUTOS=[
  {id:"p1",name:"Sabonete CeraVe",category:"Limpeza",freq:"2x dia",notes:""},
  {id:"p2",name:"Hidratante La Roche",category:"Hidratação",freq:"2x dia",notes:""},
  {id:"p3",name:"Protetor Solar FPS50",category:"Proteção",freq:"manhã",notes:""},
];

// ─── WIDGET CATALOG ── todos os blocos disponíveis para o dashboard ────────────
const WIDGET_CATALOG = [
  {id:"score",    label:"Score Tiphareth", desc:"Número principal + barra",         defaultOn:true,  size:"full"},
  {id:"mini_scores",label:"Mini Scores",  desc:"Grade hábitos/rotinas/metas",       defaultOn:true,  size:"full"},
  {id:"mood",     label:"Humor do dia",   desc:"Seletor de humor",                  defaultOn:true,  size:"full"},
  {id:"habitos_hoje",label:"Hábitos de hoje",desc:"Lista rápida de hábitos",        defaultOn:true,  size:"full"},
  {id:"coach",    label:"Coach IA",       desc:"Chat com agente de autocuidado",    defaultOn:true,  size:"full"},
  {id:"rotinas_quick",label:"Rotinas rápidas",desc:"Progresso das rotinas hoje",    defaultOn:false, size:"full"},
  {id:"metas_widget",label:"Metas",       desc:"Progresso das metas",              defaultOn:false, size:"full"},
  {id:"xp_bar",   label:"XP & Nível",    desc:"Barra de experiência e nível",      defaultOn:false, size:"full"},
  {id:"quote",    label:"Frase do dia",   desc:"Afirmação motivacional",            defaultOn:false, size:"full"},
];
const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w=>w.defaultOn).map(w=>w.id);

// ─── AGENT TOOLS DEFINITION ──────────────────────────────────────────────────
const AGENT_TOOLS = [
  {
    name:"criarHabito",
    description:"Cria um novo hábito de autocuidado para o usuário",
    input_schema:{type:"object",properties:{
      titulo:{type:"string",description:"Nome do hábito"},
      frequencia:{type:"string",enum:["Diário","Semanal","Mensal"]},
      area:{type:"string",enum:["aparencia","bemestar"]},
      xp:{type:"number",description:"XP ao completar, padrão 15"},
    },required:["titulo","frequencia","area"]},
  },
  {
    name:"concluirHabito",
    description:"Marca um hábito como feito hoje pelo ID ou título",
    input_schema:{type:"object",properties:{
      id:{type:"string",description:"ID do hábito"},
      titulo:{type:"string",description:"Título parcial para busca"},
    },required:[]},
  },
  {
    name:"criarMeta",
    description:"Cria uma nova meta de autocuidado",
    input_schema:{type:"object",properties:{
      titulo:{type:"string"},
      area:{type:"string",enum:["aparencia","bemestar"]},
      xp:{type:"number"},
    },required:["titulo","area"]},
  },
  {
    name:"editarMeta",
    description:"Edita título, área ou XP de uma meta existente",
    input_schema:{type:"object",properties:{
      id:{type:"string"},
      titulo:{type:"string"},
      area:{type:"string"},
      xp:{type:"number"},
    },required:["id"]},
  },
  {
    name:"concluirMeta",
    description:"Marca uma meta como concluída",
    input_schema:{type:"object",properties:{id:{type:"string"},titulo:{type:"string"}},required:[]},
  },
  {
    name:"adicionarProduto",
    description:"Adiciona um produto à lista de skincare",
    input_schema:{type:"object",properties:{
      nome:{type:"string"},
      categoria:{type:"string",enum:["Limpeza","Hidratação","Proteção","Sérum","Tônico","Óleo","Esfoliante","Cabelo","Outro"]},
      frequencia:{type:"string",description:"Quando usar. Ex: manhã e noite"},
      notas:{type:"string"},
    },required:["nome","categoria"]},
  },
  {
    name:"adicionarPassoRotina",
    description:"Adiciona um passo a uma rotina existente",
    input_schema:{type:"object",properties:{
      rotina_nome:{type:"string",description:"Nome parcial da rotina. Ex: matinal, noturna"},
      titulo:{type:"string",description:"Descrição do passo"},
      duracao_min:{type:"number"},
    },required:["rotina_nome","titulo"]},
  },
  {
    name:"atualizarHumor",
    description:"Atualiza o humor atual do usuário",
    input_schema:{type:"object",properties:{
      humor:{type:"string",enum:["energizado","calmo","cansado","ansioso","feliz"]},
    },required:["humor"]},
  },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
async function sGet(key,fb){try{const r=await window.storage.get(key);return r?JSON.parse(r.value):fb;}catch{return fb;}}
async function sSet(key,val){try{await window.storage.set(key,JSON.stringify(val));}catch{}}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]=useState(false);
  C=dark?DARK:LIGHT;

  const [tab,setTab]=useState("tiph");
  const [sh,setSh]=useState(null);
  const [f,setF]=useState({});
  const F=v=>setF(x=>({...x,...v}));
  const [toast,setToast]=useState(null);
  const toast_=(msg,color)=>{setToast({msg,color:color||ACCENT});setTimeout(()=>setToast(null),2600);};
  const close=()=>{setSh(null);setF({});};
  const openSh=(name,init)=>{setF(init||{});setSh(name);};

  const [loaded,setLoaded]=useState(false);
  const [aparenciaHabits,_setAH]=useState(D_APARENCIA_HABITS);
  const [bemestarHabits, _setBH]=useState(D_BEMESTAR_HABITS);
  const [rotinas,        _setR] =useState(D_ROTINAS);
  const [goals,          _setG] =useState(D_GOALS);
  const [produtos,       _setP] =useState(D_PRODUTOS);
  const [xp,             _setXP]=useState(0);
  const [mood,           _setM] =useState("calmo");
  // widget config
  const [activeWidgets,  _setW] =useState(DEFAULT_WIDGETS);

  // persisted setters
  const mk=(setter,key)=>v=>setter(prev=>{const next=typeof v==="function"?v(prev):v;sSet(key,next);return next;});
  const setAH=mk(_setAH,"aparenciaHabits");
  const setBH=mk(_setBH,"bemestarHabits");
  const setR =mk(_setR, "rotinas");
  const setG =mk(_setG, "goals");
  const setP =mk(_setP, "produtos");
  const setXP=mk(_setXP,"xp");
  const setM =v=>{_setM(v);sSet("mood",v);};
  const setW =mk(_setW, "activeWidgets");

  useEffect(()=>{
    (async()=>{
      const[ah,bh,rot,g,pr,xpv,mv,wv]=await Promise.all([
        sGet("aparenciaHabits",D_APARENCIA_HABITS),sGet("bemestarHabits",D_BEMESTAR_HABITS),
        sGet("rotinas",D_ROTINAS),sGet("goals",D_GOALS),sGet("produtos",D_PRODUTOS),
        sGet("xp",0),sGet("mood","calmo"),sGet("activeWidgets",DEFAULT_WIDGETS),
      ]);
      _setAH(ah);_setBH(bh);_setR(rot);_setG(g);_setP(pr);_setXP(xpv);_setM(mv);_setW(wv);
      setLoaded(true);
    })();
  },[]);

  // scores
  const allHabits=[...aparenciaHabits,...bemestarHabits];
  const habitScore =allHabits.length?Math.round(allHabits.filter(h=>h.done).length/allHabits.length*100):0;
  const goalScore  =goals.length?Math.round(goals.filter(g=>g.done).length/goals.length*100):0;
  const rotinaScore=rotinas.length?Math.round(rotinas.reduce((s,r)=>s+r.steps.filter(st=>st.done).length/(r.steps.length||1),0)/rotinas.length*100):0;
  const tiphScore  =Math.round(habitScore*0.35+goalScore*0.3+rotinaScore*0.35);
  const level = Math.floor(xp/200)+1;
  const xpInLevel = xp%200;

  // ─── AGENT DISPATCHER ───────────────────────────────────────────────────────
  function createDispatcher(){
    return {
      criarHabito:({titulo,frequencia,area,xp:x=15})=>{
        const novo={id:"ah"+uid(),title:titulo,freq:frequencia||"Diário",done:false,area,xp:Number(x)||15};
        if(area==="aparencia")setAH(p=>[...p,novo]);else setBH(p=>[...p,novo]);
        toast_("Hábito criado: "+titulo);
        return{ok:true,id:novo.id,mensagem:"Hábito '"+titulo+"' criado com sucesso!"};
      },
      concluirHabito:({id,titulo})=>{
        let found=false;
        const update=p=>p.map(h=>{
          if((id&&h.id===id)||(titulo&&h.title.toLowerCase().includes(titulo.toLowerCase()))){found=true;return{...h,done:true};}
          return h;
        });
        setAH(update);setBH(update);
        if(found)toast_("Hábito concluído! ✓");
        return{ok:found,mensagem:found?"Hábito marcado como feito!":"Hábito não encontrado"};
      },
      criarMeta:({titulo,area,xp:x=100})=>{
        const nova={id:"g"+uid(),title:titulo,area,done:false,xp:Number(x)||100};
        setG(p=>[...p,nova]);
        toast_("Meta criada: "+titulo);
        return{ok:true,id:nova.id,mensagem:"Meta '"+titulo+"' criada!"};
      },
      editarMeta:({id,titulo,area,xp:x})=>{
        setG(p=>p.map(g=>g.id===id?{...g,...(titulo&&{title:titulo}),...(area&&{area}),...(x&&{xp:Number(x)})}:g));
        toast_("Meta atualizada");
        return{ok:true,mensagem:"Meta atualizada com sucesso!"};
      },
      concluirMeta:({id,titulo})=>{
        let found=false;
        setG(p=>p.map(g=>{
          if((id&&g.id===id)||(titulo&&g.title.toLowerCase().includes(titulo.toLowerCase()))){found=true;if(!g.done)setXP(x=>x+g.xp);return{...g,done:true};}
          return g;
        }));
        return{ok:found,mensagem:found?"Meta concluída! 🎉":"Meta não encontrada"};
      },
      adicionarProduto:({nome,categoria,frequencia,notas})=>{
        const novo={id:"p"+uid(),name:nome,category:categoria||"Outro",freq:frequencia||"",notes:notas||""};
        setP(p=>[...p,novo]);
        toast_("Produto adicionado: "+nome);
        return{ok:true,id:novo.id,mensagem:"Produto '"+nome+"' adicionado!"};
      },
      adicionarPassoRotina:({rotina_nome,titulo,duracao_min})=>{
        let found=false;
        setR(prev=>prev.map(r=>{
          if(r.name.toLowerCase().includes(rotina_nome.toLowerCase())){
            found=true;
            return{...r,steps:[...r.steps,{id:"rs"+uid(),title:titulo,done:false,min:Number(duracao_min)||3}]};
          }
          return r;
        }));
        if(found)toast_("Passo adicionado à rotina");
        return{ok:found,mensagem:found?"Passo '"+titulo+"' adicionado!":"Rotina '"+rotina_nome+"' não encontrada"};
      },
      atualizarHumor:({humor})=>{
        setM(humor);
        toast_("Humor atualizado: "+humor);
        return{ok:true,mensagem:"Humor atualizado para "+humor};
      },
    };
  }

  // ─── AGENT CHAT ─────────────────────────────────────────────────────────────
  const [chatHistory,setChatHistory]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [agentLoading,setAgentLoading]=useState(false);
  const chatEndRef=useRef(null);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatHistory]);

  const buildSystemPrompt=()=>`
Você é a Coach de Autocuidado do Tiphareth (Life Tree).
Você tem ferramentas para criar hábitos, metas, produtos, passos de rotina e registrar humor diretamente no app.
Quando o usuário pedir para criar, registrar, adicionar, marcar ou atualizar qualquer coisa — USE as ferramentas. Não peça confirmação, execute e confirme brevemente.
Seja direta, calorosa e motivadora. Respostas curtas (máx 2 linhas) salvo pedido de análise.

Estado atual (${todayS()}):
- Humor: ${mood}
- Score Tiphareth: ${tiphScore}% | Hábitos: ${habitScore}% | Rotinas: ${rotinaScore}% | Metas: ${goalScore}%
- Hábitos aparência: ${JSON.stringify(aparenciaHabits.map(h=>({id:h.id,titulo:h.title,feito:h.done,freq:h.freq})))}
- Hábitos bem-estar: ${JSON.stringify(bemestarHabits.map(h=>({id:h.id,titulo:h.title,feito:h.done,freq:h.freq})))}
- Metas: ${JSON.stringify(goals.map(g=>({id:g.id,titulo:g.title,concluida:g.done,xp:g.xp})))}
- Produtos: ${JSON.stringify(produtos.map(p=>({id:p.id,nome:p.name,cat:p.category})))}
- Rotinas: ${JSON.stringify(rotinas.map(r=>({id:r.id,nome:r.name,horario:r.time,passos:r.steps.map(s=>({id:s.id,titulo:s.title,feito:s.done}))}))}
- XP total: ${xp} (Nível ${level})
`;

  const runAgent=async(userMsg)=>{
    setAgentLoading(true);
    const dispatch=createDispatcher();
    const messages=[...chatHistory.map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}];
    try{
      let iterations=0;
      while(iterations<6){
        iterations++;
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1024,system:buildSystemPrompt(),tools:AGENT_TOOLS,messages}),
        }).then(r=>r.json());

        messages.push({role:"assistant",content:res.content});

        if(res.stop_reason==="end_turn"){
          const text=(res.content||[]).map(b=>b.type==="text"?b.text:"").join("").trim();
          setChatHistory(prev=>[...prev,{role:"user",content:userMsg},{role:"assistant",content:text||"✓"}]);
          break;
        }
        if(res.stop_reason==="tool_use"){
          const toolResults=[];
          for(const block of res.content){
            if(block.type!=="tool_use")continue;
            const fn=dispatch[block.name];
            const result=fn?fn(block.input):{error:"Ferramenta não encontrada: "+block.name};
            toolResults.push({type:"tool_result",tool_use_id:block.id,content:JSON.stringify(result)});
          }
          messages.push({role:"user",content:toolResults});
        } else break;
      }
    }catch(e){
      setChatHistory(prev=>[...prev,{role:"user",content:userMsg},{role:"assistant",content:"Erro ao processar: "+e.message}]);
    }
    setAgentLoading(false);
  };

  const sendChat=()=>{
    const msg=chatInput.trim();
    if(!msg||agentLoading)return;
    setChatInput("");
    runAgent(msg);
  };

  // ─── WIDGET CUSTOMIZER SHEET ─────────────────────────────────────────────────
  const WidgetCustomizer=()=>(
    <Sheet title="Personalizar Dashboard" onClose={close}>
      <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Ative ou desative os blocos do seu dashboard. Arraste para reordenar em breve.</div>
      {WIDGET_CATALOG.map(w=>{
        const on=activeWidgets.includes(w.id);
        return(
          <div key={w.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:C.bg,borderRadius:10,marginBottom:8,border:"1px solid "+(on?ACCENT+"44":C.b1)}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:on?C.text:C.muted}}>{w.label}</div>
              <div style={{fontSize:9,color:C.muted}}>{w.desc}</div>
            </div>
            <button onClick={()=>setW(prev=>on?prev.filter(x=>x!==w.id):[...prev,w.id])}
              style={{width:40,height:22,borderRadius:99,cursor:"pointer",border:"none",background:on?ACCENT:C.b2,position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </button>
          </div>
        );
      })}
      <div style={{marginTop:6}}>
        <Btn color={C.muted} outline sm full={false} onClick={()=>setW(DEFAULT_WIDGETS)}>Restaurar padrão</Btn>
      </div>
    </Sheet>
  );

  // ─── TIPHARETH TAB ────────────────────────────────────────────────────────────
  const W=(id)=>activeWidgets.includes(id);

  const TiphTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      {/* Botão customizar */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>openSh("widgets")}
          style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:10,fontWeight:700,color:C.muted}}>
          <Ico n="layout" size={11} color={C.muted}/> Personalizar
        </button>
      </div>

      {/* WIDGET: Score principal */}
      {W("score")&&(
        <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>TIPHARETH — AUTOCUIDADO</div>
              <div style={{fontSize:52,fontWeight:900,color:ACCENT,lineHeight:1}}>{tiphScore}%</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:6}}>Leve para a Árvore</div>
              <div style={{background:C.card,border:"2px solid "+ACCENT,borderRadius:12,padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:900,color:ACCENT,lineHeight:1}}>{tiphScore}</div>
                <div style={{fontSize:9,color:ACCENT,fontWeight:700,marginTop:2}}>% → Tiphareth</div>
              </div>
            </div>
          </div>
          <ProgressBar value={tiphScore} color={"linear-gradient(90deg,"+ACCENT+",#fbbf24)"} height={8}/>
          <div style={{fontSize:9,color:C.muted,marginTop:6}}>Beleza que vem de dentro para fora</div>
        </div>
      )}

      {/* WIDGET: XP & Nível */}
      {W("xp_bar")&&(
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>XP & NÍVEL</div>
            <Badge label={"Nível "+level} color={"#fbbf24"}/>
          </div>
          <ProgressBar value={xpInLevel/2} color={"#fbbf24"} height={6}/>
          <div style={{fontSize:9,color:C.muted,marginTop:4}}>{xpInLevel}/200 XP para o próximo nível · {xp} total</div>
        </Card>
      )}

      {/* WIDGET: Mini scores */}
      {W("mini_scores")&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[{l:"Hábitos",v:habitScore,c:ACCENT,tab:"aparencia"},{l:"Rotinas",v:rotinaScore,c:"#f97316",tab:"rotinas"},{l:"Metas",v:goalScore,c:"#10b981",tab:null}].map(m=>(
            <div key={m.l} onClick={()=>m.tab&&setTab(m.tab)} style={{background:C.card,border:"1px solid "+m.c+"22",borderRadius:12,padding:"10px 8px",textAlign:"center",cursor:m.tab?"pointer":"default"}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>{m.l}</div>
              <div style={{fontSize:20,fontWeight:900,color:m.c,marginBottom:4}}>{m.v}%</div>
              <ProgressBar value={m.v} color={m.c} height={3}/>
            </div>
          ))}
        </div>
      )}

      {/* WIDGET: Humor */}
      {W("mood")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>COMO VOCÊ ESTÁ HOJE?</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {MOOD_OPTS.map(m=>(
              <button key={m.v} onClick={()=>setM(m.v)}
                style={{padding:"6px 12px",borderRadius:99,cursor:"pointer",fontSize:11,fontWeight:600,background:mood===m.v?m.c+"22":"transparent",border:"1.5px solid "+(mood===m.v?m.c:C.b2),color:mood===m.v?m.c:C.muted}}>
                {m.l}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* WIDGET: Rotinas rápidas */}
      {W("rotinas_quick")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>ROTINAS DE HOJE</div>
          {rotinas.map(r=>{
            const done=r.steps.filter(s=>s.done).length;
            const pct=r.steps.length?Math.round(done/r.steps.length*100):0;
            const tc=r.time==="manhã"?"#f59e0b":"#6366f1";
            return(
              <div key={r.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:600,color:tc,marginBottom:4}}>
                  <span>{r.name}</span><span>{done}/{r.steps.length}</span>
                </div>
                <ProgressBar value={pct} color={tc} height={5}/>
              </div>
            );
          })}
        </Card>
      )}

      {/* WIDGET: Metas */}
      {W("metas_widget")&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>METAS</div>
          {goals.slice(0,3).map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:"1px solid "+C.b1}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:g.done?"#10b981":C.b2,flexShrink:0}}/>
              <span style={{fontSize:11,flex:1,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</span>
              <Badge label={g.xp+" XP"} color={g.done?"#10b981":C.muted}/>
            </div>
          ))}
        </Card>
      )}

      {/* WIDGET: Frase do dia */}
      {W("quote")&&(
        <div style={{background:"linear-gradient(135deg,#8b5cf622,#6366f111)",border:"1px solid #8b5cf633",borderRadius:14,padding:16,marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:13,fontStyle:"italic",color:"#8b5cf6",lineHeight:1.6}}>
            "Cuidar de si mesma não é egoísmo — é a base de tudo."
          </div>
          <div style={{fontSize:9,color:C.muted,marginTop:6}}>Afirmação do dia</div>
        </div>
      )}

      {/* WIDGET: Hábitos */}
      {W("habitos_hoje")&&(
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS DE HOJE</div>
            <span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{allHabits.filter(h=>h.done).length}/{allHabits.length}</span>
          </div>
          {allHabits.map(h=>(
            <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid "+C.b1}}>
              <button onClick={()=>{
                if(!h.done)setXP(x=>x+h.xp);
                if(h.area==="aparencia")setAH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));
                else setBH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));
              }} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
                <div style={{fontSize:9,color:C.muted}}>{h.area==="aparencia"?"Aparência":"Bem-estar"} · {h.freq}</div>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
            </div>
          ))}
        </Card>
      )}

      {/* WIDGET: Coach IA com function calling */}
      {W("coach")&&(
        <Card>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>COACH DE AUTOCUIDADO</div>
          {/* Sugestões rápidas */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {[
              "Cria um hábito de beber água",
              "Adiciona creme para olhos à rotina noturna",
              "Cria meta de meditar 10 dias",
              "Estou me sentindo ansiosa hoje",
            ].map(s=>(
              <button key={s} onClick={()=>{setChatInput(s);}}
                style={{fontSize:10,padding:"5px 10px",borderRadius:99,background:C.b1,border:"1px solid "+C.b2,cursor:"pointer",color:C.dim,whiteSpace:"nowrap"}}>
                {s}
              </button>
            ))}
          </div>
          {/* Histórico de chat */}
          {chatHistory.length>0&&(
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:12,maxHeight:280,overflowY:"auto"}}>
              {chatHistory.map((m,i)=>{
                const isUser=m.role==="user";
                return(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:10,flexDirection:isUser?"row-reverse":"row",alignItems:"flex-start"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:isUser?ACCENT+"33":C.b1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      <Ico n={isUser?"user":"sparkle"} size={11} color={isUser?ACCENT:C.muted}/>
                    </div>
                    <div style={{maxWidth:"80%",background:isUser?ACCENT+"18":C.card,border:"1px solid "+(isUser?ACCENT+"33":C.b1),borderRadius:isUser?"12px 2px 12px 12px":"2px 12px 12px 12px",padding:"8px 12px",fontSize:12,lineHeight:1.5,color:C.text}}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {agentLoading&&(
                <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:C.b1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Ico n="sparkle" size={11} color={C.muted}/>
                  </div>
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:"2px 12px 12px 12px",padding:"8px 12px",fontSize:12,color:C.muted}}>
                    <span style={{animation:"pulse 1s infinite"}}>Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
          )}
          {chatHistory.length===0&&!agentLoading&&(
            <div style={{textAlign:"center",padding:"16px 0 12px",color:C.muted}}>
              <div style={{fontSize:22,marginBottom:6}}>✨</div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>Sua coach pessoal</div>
              <div style={{fontSize:10}}>Fale o que quiser criar, registrar ou mudar</div>
            </div>
          )}
          {/* Input */}
          <div style={{display:"flex",gap:8}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendChat()}
              placeholder="Ex: Adiciona protetor solar na rotina matinal..."
              style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:10,padding:"9px 12px",color:C.text,fontSize:12,outline:"none"}}/>
            <button onClick={sendChat} disabled={agentLoading||!chatInput.trim()}
              style={{width:38,height:38,borderRadius:10,background:ACCENT,border:"none",cursor:agentLoading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:agentLoading||!chatInput.trim()?0.5:1}}>
              <Ico n="send" size={14} color="#fff"/>
            </button>
          </div>
          {chatHistory.length>0&&<button onClick={()=>setChatHistory([])} style={{marginTop:8,fontSize:9,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Limpar conversa</button>}
        </Card>
      )}
    </div>
  );

  // ─── APARÊNCIA TAB ────────────────────────────────────────────────────────────
  const AparenciaTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Aparência</div><div style={{fontSize:10,color:C.muted}}>Skincare, cabelo e estilo</div></div>
        <Btn sm full={false} onClick={()=>openSh("addAparenciaHabit",{title:"",freq:"Diário",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700}}>Meus Produtos</div>
        <Btn sm full={false} onClick={()=>openSh("addProduto",{name:"",category:"Limpeza",freq:"",notes:""})}><Ico n="plus" size={11}/> Produto</Btn>
      </div>
      {produtos.map(p=>(
        <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}>
          <div style={{width:28,height:28,borderRadius:8,background:ACCENT+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="droplet" size={14} color={ACCENT}/></div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{p.name}</div><div style={{fontSize:9,color:C.muted}}>{p.category} · {p.freq}</div></div>
          <button onClick={()=>openSh("editProduto",{...p})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
          <button onClick={()=>{setP(prev=>prev.filter(x=>x.id!==p.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Hábitos de Aparência</div>
      {aparenciaHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXP(x=>x+h.xp);setAH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>{setAH(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ─── BEM-ESTAR TAB ────────────────────────────────────────────────────────────
  const BemestarTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Bem-estar</div><div style={{fontSize:10,color:C.muted}}>Autoestima, prazer e presença</div></div>
        <Btn sm full={false} onClick={()=>openSh("addBemestarHabit",{title:"",freq:"Diário",xp:20})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700}}>Metas</div>
        <Btn sm full={false} onClick={()=>openSh("addGoal",{title:"",area:"bemestar",xp:100})}><Ico n="plus" size={11}/> Meta</Btn>
      </div>
      {goals.map(g=>(
        <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(g.done?ACCENT+"33":C.b1),borderRadius:10,marginBottom:6}}>
          <button onClick={()=>{if(!g.done)setXP(x=>x+g.xp);setG(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?ACCENT:C.b2),background:g.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div><div style={{fontSize:9,color:C.muted}}>{g.area}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{g.xp}</span>
          <button onClick={()=>openSh("editGoal",{...g})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>
          <button onClick={()=>{setG(p=>p.filter(x=>x.id!==g.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
      <div style={{fontSize:11,fontWeight:700,marginBottom:10}}>Hábitos de Bem-estar</div>
      {bemestarHabits.map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXP(x=>x+h.xp);setBH(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?ACCENT:C.b2),background:h.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}><div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div><div style={{fontSize:9,color:C.muted}}>{h.freq}</div></div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>{setBH(p=>p.filter(x=>x.id!==h.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}
    </div>
  );

  // ─── ROTINAS TAB ──────────────────────────────────────────────────────────────
  const RotinasTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontSize:13,fontWeight:800}}>Rotinas</div><div style={{fontSize:10,color:C.muted}}>Seus rituais de autocuidado</div></div>
        <Btn sm full={false} onClick={()=>openSh("addRotina",{name:"",time:"manhã"})}><Ico n="plus" size={11}/> Rotina</Btn>
      </div>
      {rotinas.map(r=>{
        const done=r.steps.filter(s=>s.done).length;const total=r.steps.length;
        const pct=total?Math.round(done/total*100):0;const tc=r.time==="manhã"?"#f59e0b":"#6366f1";
        return(
          <Card key={r.id} color={tc} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Ico n="clock" size={14} color={tc}/>
                <div><div style={{fontSize:13,fontWeight:800,color:tc}}>{r.name}</div><div style={{fontSize:9,color:C.muted}}>{done}/{total} passos · {r.time}</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openSh("addStep",{rotinaId:r.id,title:"",min:2})} style={{background:tc+"18",border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" size={12} color={tc}/></button>
                <button onClick={()=>setR(p=>p.filter(x=>x.id!==r.id))} style={{background:C.b1,border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color={C.muted}/></button>
              </div>
            </div>
            <ProgressBar value={pct} color={tc} height={4}/>
            <div style={{marginTop:10}}>
              {r.steps.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderTop:"1px solid "+C.b1}}>
                  <button onClick={()=>setR(p=>p.map(ro=>ro.id===r.id?{...ro,steps:ro.steps.map(st=>st.id===s.id?{...st,done:!st.done}:st)}:ro))}
                    style={{width:19,height:19,borderRadius:5,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(s.done?tc:C.b2),background:s.done?tc:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {s.done&&<Ico n="check" size={10} color="#fff" sw={2.5}/>}
                  </button>
                  <div style={{flex:1,fontSize:12,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none"}}>{s.title}</div>
                  <span style={{fontSize:9,color:C.muted}}>{s.min}min</span>
                  <button onClick={()=>openSh("editStep",{rotinaId:r.id,stepId:s.id,title:s.title,min:s.min})} style={{background:C.b1,border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={10} color={C.muted}/></button>
                  <button onClick={()=>setR(p=>p.map(ro=>ro.id===r.id?{...ro,steps:ro.steps.filter(st=>st.id!==s.id)}:ro))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                </div>
              ))}
            </div>
            {done===total&&total>0&&<div style={{marginTop:8,textAlign:"center",fontSize:11,color:tc,fontWeight:700}}>✓ Rotina completa!</div>}
          </Card>
        );
      })}
    </div>
  );

  // ─── CONFIG TAB ───────────────────────────────────────────────────────────────
  const ConfigTab=()=>(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:ACCENT+"11",border:"2px solid "+ACCENT+"33",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE TIPHARETH</div>
        <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{tiphScore}</div>
        <div style={{fontSize:12,color:ACCENT,fontWeight:700}}>% → Tiphareth · Nível {level}</div>
      </div>
      <div style={{background:C.card,border:"1px solid #10b98133",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <Ico n="save" size={14} color="#10b981"/>
        <div><div style={{fontSize:11,fontWeight:600,color:"#10b981"}}>Dados salvos automaticamente</div><div style={{fontSize:9,color:C.muted}}>Persistência via Storage API</div></div>
      </div>
      <Card style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700}}>Dashboard</span>
          <Btn sm full={false} onClick={()=>openSh("widgets")}><Ico n="layout" size={11}/> Personalizar</Btn>
        </div>
        <div style={{fontSize:10,color:C.muted}}>{activeWidgets.length} de {WIDGET_CATALOG.length} widgets ativos</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
          {WIDGET_CATALOG.map(w=>(
            <span key={w.id} style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:activeWidgets.includes(w.id)?ACCENT+"22":C.b1,color:activeWidgets.includes(w.id)?ACCENT:C.muted,fontWeight:600}}>{w.label}</span>
          ))}
        </div>
      </Card>
      <div style={{paddingTop:10,borderTop:"1px solid "+C.b1}}>
        <Btn outline color="#ef4444" onClick={()=>{
          if(window.confirm("Apagar todos os dados?")) {
            setAH(D_APARENCIA_HABITS);setBH(D_BEMESTAR_HABITS);setR(D_ROTINAS);
            setG(D_GOALS);setP(D_PRODUTOS);setXP(0);
            toast_("Dados resetados","#ef4444");
          }
        }}><Ico n="trash" size={13} color="#ef4444"/> Resetar todos os dados</Btn>
      </div>
    </div>
  );

  if(!loaded) return(
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>✨</div><div style={{fontSize:12}}>Carregando Tiphareth…</div></div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:translateX(-50%) scale(.8)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}"}</style>
      {toast&&<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>TIPHARETH</div><div style={{fontSize:18,fontWeight:800}}>Autocuidado</div></div>
        <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Ico n={dark?"sun":"moon"} size={14} color={C.dim}/>
        </button>
      </div>
      <div style={{padding:"10px 16px 90px"}}>
        {tab==="tiph"    &&<TiphTab/>}
        {tab==="aparencia"&&<AparenciaTab/>}
        {tab==="bemestar"&&<BemestarTab/>}
        {tab==="rotinas" &&<RotinasTab/>}
        {tab==="cfg"     &&<ConfigTab/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{const a=tab===t.id;return(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}>
            <div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
              <Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/>
            </div>
            {a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}
            {!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}
          </button>
        );})}
      </div>

      {/* SHEETS */}
      {sh==="widgets"&&<WidgetCustomizer/>}
      {sh==="addAparenciaHabit"&&<Sheet title="Novo Hábito de Aparência" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Aplicar protetor solar"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setAH(p=>[...p,{id:"ah"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false,area:"aparencia"}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="addBemestarHabit"&&<Sheet title="Novo Hábito de Bem-estar" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: 10 min só para mim"/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={FREQ_OPTS}/><FI label="XP" value={f.xp||20} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setBH(p=>[...p,{id:"bh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||20,done:false,area:"bemestar"}]);toast_("Criado");close();}}>Criar</Btn></Sheet>}
      {sh==="addGoal"&&<Sheet title="Nova Meta" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Manter skincare 30 dias"/><FS label="Área" value={f.area||"bemestar"} onChange={v=>F({area:v})} opts={[{v:"aparencia",l:"Aparência"},{v:"bemestar",l:"Bem-estar"}]}/><FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setG(p=>[...p,{id:"g"+uid(),title:f.title,area:f.area||"bemestar",xp:Number(f.xp)||100,done:false}]);toast_("Meta criada");close();}}>Criar</Btn></Sheet>}
      {sh==="editGoal"&&<Sheet title="Editar Meta" onClose={close}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/><FS label="Área" value={f.area||"bemestar"} onChange={v=>F({area:v})} opts={[{v:"aparencia",l:"Aparência"},{v:"bemestar",l:"Bem-estar"}]}/><FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/><Btn color={ACCENT} onClick={()=>{setG(p=>p.map(x=>x.id===f.id?{...x,title:f.title,area:f.area,xp:Number(f.xp)}:x));toast_("Atualizada");close();}}>Salvar</Btn></Sheet>}
      {sh==="addProduto"&&<Sheet title="Novo Produto" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Protetor Solar FPS 50"/><FS label="Categoria" value={f.category||"Limpeza"} onChange={v=>F({category:v})} opts={["Limpeza","Hidratação","Proteção","Sérum","Tônico","Óleo","Esfoliante","Cabelo","Outro"].map(x=>({v:x,l:x}))}/><FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})} placeholder="Ex: manhã e noite"/><FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/><Btn color={ACCENT} onClick={()=>{if(!f.name)return;setP(p=>[...p,{id:"p"+uid(),name:f.name,category:f.category||"Limpeza",freq:f.freq||"",notes:f.notes||""}]);toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editProduto"&&<Sheet title="Editar Produto" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/><FS label="Categoria" value={f.category||"Limpeza"} onChange={v=>F({category:v})} opts={["Limpeza","Hidratação","Proteção","Sérum","Tônico","Óleo","Esfoliante","Cabelo","Outro"].map(x=>({v:x,l:x}))}/><FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})}/><FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/><Btn color={ACCENT} onClick={()=>{setP(p=>p.map(x=>x.id===f.id?{...x,name:f.name,category:f.category,freq:f.freq,notes:f.notes}:x));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
      {sh==="addRotina"&&<Sheet title="Nova Rotina" onClose={close}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Rotina Matinal"/><FS label="Período" value={f.time||"manhã"} onChange={v=>F({time:v})} opts={[{v:"manhã",l:"Manhã"},{v:"noite",l:"Noite"},{v:"tarde",l:"Tarde"}]}/><Btn color={ACCENT} onClick={()=>{if(!f.name)return;setR(p=>[...p,{id:"r"+uid(),name:f.name,time:f.time||"manhã",steps:[]}]);toast_("Criada");close();}}>Criar</Btn></Sheet>}
      {sh==="addStep"&&<Sheet title="Novo Passo" onClose={close}><FI label="Descrição" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Aplicar hidratante"/><FI label="Duração (min)" value={f.min||2} onChange={v=>F({min:v})} type="number" min={1}/><Btn color={ACCENT} onClick={()=>{if(!f.title)return;setR(p=>p.map(r=>r.id===f.rotinaId?{...r,steps:[...r.steps,{id:"rs"+uid(),title:f.title,done:false,min:Number(f.min)||2}]}:r));toast_("Adicionado");close();}}>Adicionar</Btn></Sheet>}
      {sh==="editStep"&&<Sheet title="Editar Passo" onClose={close}><FI label="Descrição" value={f.title||""} onChange={v=>F({title:v})}/><FI label="Duração (min)" value={f.min||2} onChange={v=>F({min:v})} type="number" min={1}/><Btn color={ACCENT} onClick={()=>{setR(p=>p.map(r=>r.id===f.rotinaId?{...r,steps:r.steps.map(s=>s.id===f.stepId?{...s,title:f.title,min:Number(f.min)||2}:s)}:r));toast_("Atualizado");close();}}>Salvar</Btn></Sheet>}
    </div>
  );
}
