// ClientPage + seus sheets, extraídos de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { useContext } from "react";
import { useHod } from "./context.js";
import { ThemeCtx, Sheet, FI, FTA, Btn, Badge } from "./theme.js";
import { Ico } from "./icons.jsx";
import { uid, todayS, typeColor } from "./helpers.js";

export function ClientPage(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { page, projects, setProjects, back, openSh } = g;
  const p = projects.find(x=>x.id===page.projId); if(!p) return null;
  const c = (p.clients||[]).find(x=>x.id===page.id); if(!c) return null;
  const color = typeColor(p.type);
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
        <Ico n="back" size={13}/> {p.name}
      </button>

      <div style={{background:"linear-gradient(135deg,"+color+"18,"+color+"06)",border:"1px solid "+color+"33",borderRadius:16,padding:18,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color,marginBottom:4}}>{c.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.freq}{c.freq?" · ":""}desde {c.since}</div>
          </div>
          <button onClick={()=>openSh("editClient",{projId:p.id,id:c.id,name:c.name,contact:c.contact,freq:c.freq,goal:c.goal,progressNote:c.progressNote})}
            style={{background:color+"22",border:"1px solid "+color+"44",borderRadius:8,padding:"5px 11px",cursor:"pointer",color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:10}}>
            <Ico n="edit" size={11} color={color}/> Editar
          </button>
        </div>
        {c.goal&&<div style={{marginBottom:8}}><div style={{fontSize:8,color:C.muted,fontWeight:700}}>OBJETIVO</div><div style={{fontSize:12}}>{c.goal}</div></div>}
        {c.progressNote&&<div><div style={{fontSize:8,color:C.muted,fontWeight:700}}>SITUAÇÃO ATUAL</div><div style={{fontSize:12}}>{c.progressNote}</div></div>}
      </div>

      {/* Plan */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Plano de Trabalho</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addClientPlan",{projId:p.id,clientId:c.id,topic:""})}><Ico n="plus" size={11}/> Tópico</Btn>
      </div>
      {(c.plan||[]).length===0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhum tópico ainda.</div>}
      {(c.plan||[]).map(pl=>{
        const statusColor = pl.status==="concluido"?"#10b981":pl.status==="andamento"?color:"#64748b";
        const statusLabel = pl.status==="concluido"?"Concluído":pl.status==="andamento"?"Em andamento":"Pendente";
        return (
          <div key={pl.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}>
            <span style={{fontSize:12,flex:1}}>{pl.topic}</span>
            <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,clients:x.clients.map(cl=>cl.id===c.id?{...cl,plan:cl.plan.map(pi=>pi.id===pl.id?{...pi,status:pi.status==="pendente"?"andamento":pi.status==="andamento"?"concluido":"pendente"}:pi)}:cl)}:x))}
              style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="refresh" size={10} color={C.muted}/>
            </button>
            <Badge label={statusLabel} color={statusColor}/>
            <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,clients:x.clients.map(cl=>cl.id===c.id?{...cl,plan:cl.plan.filter(pi=>pi.id!==pl.id)}:cl)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Sessions */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Histórico de Sessões</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addClientSession",{projId:p.id,clientId:c.id,date:todayS(),notes:"",nextStep:""})}><Ico n="plus" size={11}/> Sessão</Btn>
      </div>
      {(c.sessions||[]).length===0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhuma sessão registrada ainda.</div>}
      {[...(c.sessions||[])].reverse().map(s=>(
        <div key={s.id} style={{padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3}}>{s.date}</div>
              {s.notes&&<div style={{fontSize:12,marginBottom:3}}>{s.notes}</div>}
              {s.nextStep&&<div style={{fontSize:10,color}}>Próximo: {s.nextStep}</div>}
            </div>
            <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,clients:x.clients.map(cl=>cl.id===c.id?{...cl,sessions:cl.sessions.filter(ss=>ss.id!==s.id)}:cl)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        </div>
      ))}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Feedback */}
      <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>Último Feedback</div>
      <div style={{background:color+"11",border:"1px solid "+color+"33",borderRadius:11,padding:"12px 14px",marginBottom:8}}>
        {c.lastFeedback ? (
          <>
            <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{c.lastFeedback.date}</div>
            <div style={{fontSize:13,color}}>{c.lastFeedback.text}</div>
          </>
        ) : <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Nenhum registrado</div>}
      </div>
      <Btn outline color={color} onClick={()=>openSh("editClientFeedback",{projId:p.id,clientId:c.id,date:c.lastFeedback?.date||todayS(),text:c.lastFeedback?.text||""})}>
        <Ico n="edit" size={13}/> Atualizar feedback
      </Btn>
    </div>
  );
}

export function AddClientSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Aluno / Cliente" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Nome do aluno ou cliente"/>
      <FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})} placeholder="Ex: 2x semana"/>
      <FI label="Desde" value={f.since||todayS()} onChange={v=>F({since:v})} type="date"/>
      <FI label="Objetivo" value={f.goal||""} onChange={v=>F({goal:v})} placeholder="Ex: Passar no vestibular"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.name)return;setProjects(p=>p.map(x=>x.id===f.projId?{...x,clients:[...x.clients,{id:"cl"+uid(),name:f.name,contact:"",freq:f.freq||"",since:f.since||todayS(),active:true,goal:f.goal||"",progressNote:"",plan:[],sessions:[],lastFeedback:null}]}:x));toast_("Adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function EditClientSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Editar Aluno / Cliente" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
      <FI label="Contato" value={f.contact||""} onChange={v=>F({contact:v})} placeholder="Telefone, e-mail..."/>
      <FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})}/>
      <FI label="Objetivo" value={f.goal||""} onChange={v=>F({goal:v})}/>
      <FTA label="Situação atual" value={f.progressNote||""} onChange={v=>F({progressNote:v})} rows={2}/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{setProjects(p=>p.map(pr=>pr.id===f.projId?{...pr,clients:pr.clients.map(c=>c.id===f.id?{...c,name:f.name,contact:f.contact,freq:f.freq,goal:f.goal,progressNote:f.progressNote}:c)}:pr));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddClientPlanSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Tópico do Plano" onClose={close}>
      <FI label="Tópico" value={f.topic||""} onChange={v=>F({topic:v})} placeholder="Ex: Funções trigonométricas"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.topic)return;setProjects(p=>p.map(pr=>pr.id===f.projId?{...pr,clients:pr.clients.map(c=>c.id===f.clientId?{...c,plan:[...c.plan,{id:"clp"+uid(),topic:f.topic,status:"pendente"}]}:c)}:pr));toast_("Adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddClientSessionSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Registrar Sessão" onClose={close}>
      <FI label="Data" value={f.date||todayS()} onChange={v=>F({date:v})} type="date"/>
      <FTA label="Notas da sessão" value={f.notes||""} onChange={v=>F({notes:v})} rows={3}/>
      <FI label="Próximo passo" value={f.nextStep||""} onChange={v=>F({nextStep:v})} placeholder="O que fazer na próxima sessão?"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{setProjects(p=>p.map(pr=>pr.id===f.projId?{...pr,clients:pr.clients.map(c=>c.id===f.clientId?{...c,sessions:[...c.sessions,{id:"ses"+uid(),date:f.date||todayS(),notes:f.notes||"",nextStep:f.nextStep||""}]}:c)}:pr));toast_("Sessão registrada");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditClientFeedbackSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Último Feedback" onClose={close}>
      <FI label="Data" value={f.date||todayS()} onChange={v=>F({date:v})} type="date"/>
      <FTA label="Feedback" value={f.text||""} onChange={v=>F({text:v})} rows={3}/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{setProjects(p=>p.map(pr=>pr.id===f.projId?{...pr,clients:pr.clients.map(c=>c.id===f.clientId?{...c,lastFeedback:{date:f.date||todayS(),text:f.text||""}}:c)}:pr));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}
