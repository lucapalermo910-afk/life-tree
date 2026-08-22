// ConfigTab, extraído de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). Sem sheets próprios — reabre os
// mesmos sheets de Carreira/Projetos/Marca (renderizados pelo shell, gated por `sh`).
import { useContext } from "react";
import { D_TRACKS, D_TRACKS_GENERIC } from "./seedData.js";
import { useHod } from "./context.js";
import { ThemeCtx, Card, Btn } from "./theme.js";
import { Ico } from "./icons.jsx";
import { FOCUS_META } from "./constants.js";
import { todayS, typeColor, typeLabel, phaseLabel } from "./helpers.js";

export function ConfigTab(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { tracks, setTracks, carGoals, setCarGoals, carHabits, setCarHabits, projects, setProjects, brand, setBrand, openSh, toast_ } = g;
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

      {/* Perfil de trilhas — troca o conjunto inteiro, com confirmação (destrutivo) */}
      <Card style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Perfil de Trilhas</div>
        <div style={{fontSize:9,color:C.muted,marginBottom:10}}>O seed padrão é aprofundado em Produto/PM. Se sua área é outra, recomece com trilhas genéricas e edite/renomeie como quiser — isso substitui todas as trilhas atuais.</div>
        <div style={{display:"flex",gap:8}}>
          <Btn sm outline onClick={()=>{if(window.confirm("Substituir todas as trilhas atuais pelo seed de Produto/PM (12 trilhas)? Isso não pode ser desfeito.")){setTracks(D_TRACKS);toast_("Trilhas de Produto/PM aplicadas");}}} style={{flex:1}}>Produto/PM</Btn>
          <Btn sm outline onClick={()=>{if(window.confirm("Substituir todas as trilhas atuais por 6 trilhas genéricas (aplicáveis a qualquer área)? Isso não pode ser desfeito.")){setTracks(D_TRACKS_GENERIC);toast_("Trilhas genéricas aplicadas");}}} style={{flex:1}}>Genérico</Btn>
        </div>
      </Card>

      {/* Trilhas de competência */}
      <Sec title="Trilhas de Competência" addLabel="Adicionar" onAdd={()=>openSh("addTrack",{name:"",focus:"atual"})}>
        {tracks.map(t=>(
          <Row key={t.id} dot={t.color} title={t.name} sub={FOCUS_META[t.focus].label+" · "+t.skills.length+" habilidade(s)"}
            onEdit={()=>openSh("editTrack",{...t})}
            onDel={()=>{setTracks(p=>p.filter(x=>x.id!==t.id));toast_("Removido");}}/>
        ))}
      </Sec>

      {/* Objetivos de carreira */}
      <Sec title="Objetivos de Carreira" addLabel="Adicionar" onAdd={()=>openSh("addCarGoal",{title:"",prazo:todayS(),xp:100})}>
        {carGoals.map(gl=>(
          <Row key={gl.id} title={gl.title} sub={"Prazo: "+gl.prazo+" · "+gl.xp+" XP"+(gl.done?" · Concluído":"")}
            onEdit={()=>openSh("editCarGoal",{...gl})}
            onDel={()=>{setCarGoals(p=>p.filter(x=>x.id!==gl.id));toast_("Removido");}}/>
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

      {/* Projetos */}
      <Sec title="Projetos" addLabel="Adicionar" onAdd={()=>openSh("addProject",{name:"",type:"negocio",phase:"exploracao",canvas:{}})}>
        {projects.map(p=>(
          <Row key={p.id} dot={typeColor(p.type)} title={p.name} sub={typeLabel(p.type)+" · "+phaseLabel(p)}
            onEdit={()=>openSh("editProject",{id:p.id,name:p.name,type:p.type,canvas:p.canvas||{},price:p.price,goal:p.goal,yesodCategoria:p.yesodCategoria||""})}
            onDel={()=>{setProjects(p2=>p2.filter(x=>x.id!==p.id));toast_("Removido");}}/>
        ))}
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
}
