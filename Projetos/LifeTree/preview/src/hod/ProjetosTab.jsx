// ProjetosTab + ProjectPage + seus sheets, extraídos de HodModule.jsx (22/08/2026, item 5
// do [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { useContext } from "react";
import { useHod } from "./context.js";
import { ThemeCtx, Sheet, FI, FTA, FS, Card, Btn, Badge } from "./theme.js";
import { Ico } from "./icons.jsx";
import { PROJECT_TYPES, PHASES_BY_TYPE, CANVAS_FIELDS_BY_TYPE, CRITERIA_BY_TYPE } from "./constants.js";
import { uid, todayS, fmt, typeColor, typeLabel, phasesFor, criteriaAutoChecks, chipStyle, yesodMonthRevenueForCategory } from "./helpers.js";

export function ProjetosTab(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { projects, projFilter, setProjFilter, openSh, nav } = g;
  const receitaMatch = p => (p.price>0 && p.goal>0) || (p.clients||[]).some(c=>c.active);
  const filtered = projects.filter(p=>{
    if(!projFilter) return true;
    if(projFilter==="receita") return receitaMatch(p);
    return p.type===projFilter;
  });
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:800}}>Projetos</div>
          <div style={{fontSize:10,color:C.muted}}>De ideias a negócios em operação</div>
        </div>
        <Btn sm full={false} color="#8b5cf6" onClick={()=>openSh("addProject",{name:"",type:"negocio",phase:"exploracao",canvas:{}})}>
          <Ico n="plus" size={11}/> Projeto
        </Btn>
      </div>

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
        <button onClick={()=>setProjFilter(null)} style={chipStyle(!projFilter,C.dim,C)}>Todos</button>
        {PROJECT_TYPES.map(t=>(
          <button key={t.id} onClick={()=>setProjFilter(t.id)} style={chipStyle(projFilter===t.id,t.color,C)}>{t.label}</button>
        ))}
        <button onClick={()=>setProjFilter("receita")} style={chipStyle(projFilter==="receita","#10b981",C)}>Gerando receita</button>
      </div>

      {filtered.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum projeto aqui</div>}
      {filtered.map(p=>{
        const phases = phasesFor(p.type);
        const phaseIdx = phases.findIndex(ph=>ph.id===p.phase);
        const color = typeColor(p.type);
        const activeClients = (p.clients||[]).filter(c=>c.active).length;
        const monthlyRev = activeClients*(p.price||0);
        const showRevenue = p.price>0 || p.goal>0 || activeClients>0;
        const canvasSummary = p.canvas?.valueProp || p.canvas?.offer || p.canvas?.problem || p.canvas?.topic || p.canvas?.desc || "";
        return (
          <Card key={p.id} color={color} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:800,color}}>{p.name}</span>
                  <Badge label={typeLabel(p.type)} color={color}/>
                </div>
                {canvasSummary&&<div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{canvasSummary}</div>}
              </div>
              <button onClick={()=>nav("project",p.id)} style={{background:color+"22",border:"1px solid "+color+"44",borderRadius:8,padding:"5px 10px",cursor:"pointer",color,fontSize:10,fontWeight:700,marginLeft:8,flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                Ver <Ico n="chev" size={10} color={color}/>
              </button>
            </div>

            {showRevenue&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:900,color}}>{activeClients}</div>
                  <div style={{fontSize:9,color:C.muted}}>alunos/clientes</div>
                </div>
                <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:900,color}}>{fmt(monthlyRev)}</div>
                  <div style={{fontSize:9,color:C.muted}}>mês atual</div>
                </div>
                <div style={{background:C.surface,borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:900,color}}>{fmt(p.goal)}</div>
                  <div style={{fontSize:9,color:C.muted}}>meta/mês</div>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:4,marginBottom:8}}>
              {phases.map((ph,i)=>(
                <div key={ph.id} style={{flex:1,height:4,borderRadius:99,background:i<=phaseIdx?color:C.b1,opacity:i===phaseIdx?1:i<phaseIdx?0.6:0.3}}/>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9}}>
              <span style={{color,fontWeight:700}}>{phases[phaseIdx]?.label}</span>
              <span style={{color:C.muted}}>{phases[phaseIdx]?.desc}</span>
            </div>

            {p.nextStep&&(
              <>
                <div style={{height:1,background:C.b1,margin:"10px 0"}}/>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:4}}>PRÓXIMO PASSO</div>
                <div style={{fontSize:12,fontWeight:600,color}}>{p.nextStep}</div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function ProjectPage(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { page, projects, setProjects, back, openSh, brand, setBrand, toast_, setPage, setXp } = g;
  const p = projects.find(x=>x.id===page.id); if(!p) return null;
  const color = typeColor(p.type);
  const phases = phasesFor(p.type);
  const phaseIdx = phases.findIndex(ph=>ph.id===p.phase);
  const activeClients = (p.clients||[]).filter(c=>c.active).length;
  const showRevenue = p.price>0 || p.goal>0 || activeClients>0 || (p.revenueHistory||[]).length>0;
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
        <Ico n="back" size={13}/> Projetos
      </button>

      <div style={{background:"linear-gradient(135deg,"+color+"18,"+color+"06)",border:"1px solid "+color+"33",borderRadius:16,padding:18,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{fontSize:15,fontWeight:800,color}}>{p.name}</div>
              <Badge label={typeLabel(p.type)} color={color}/>
            </div>
          </div>
          <button onClick={()=>openSh("editProject",{id:p.id,name:p.name,type:p.type,canvas:p.canvas||{},price:p.price,goal:p.goal,yesodCategoria:p.yesodCategoria||""})}
            style={{background:color+"22",border:"1px solid "+color+"44",borderRadius:8,padding:"5px 11px",cursor:"pointer",color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:10}}>
            <Ico n="edit" size={11} color={color}/> Editar
          </button>
        </div>
        <div style={{display:"flex",gap:4}}>
          {phases.map((ph,i)=>(
            <button key={ph.id} onClick={()=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,phase:ph.id}:x))}
              style={{flex:1,padding:"6px 4px",borderRadius:8,border:"none",cursor:"pointer",background:ph.id===p.phase?color:i<phaseIdx?color+"44":C.b1,color:ph.id===p.phase?"#fff":i<phaseIdx?color:C.muted,fontSize:9,fontWeight:700}}>
              {ph.label}
            </button>
          ))}
        </div>
        {(() => {
          const criteria = (CRITERIA_BY_TYPE[p.type] || CRITERIA_BY_TYPE.outro)[phaseIdx] || null;
          if(!criteria) return null;
          const autoCheck = criteriaAutoChecks(p, phaseIdx);
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

      {/* Ponte Projeto (conteúdo) → Canal em Marca Pessoal — antes eram telas sem ligação
          nenhuma: validar a ideia de um canal (aqui) e operá-lo (Marca Pessoal → Canais)
          não se falavam. Ver [[08 Hod]], gap #5 da "Auditoria pós-implementação". */}
      {p.type==="conteudo"&&(p.linkedChannelId
        ? <div style={{background:"#ec489911",border:"1px solid #ec489933",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:11,color:"#ec4899",display:"flex",alignItems:"center",gap:6}}>
            <Ico n="globe" size={13} color="#ec4899"/> Vinculado ao canal "{(brand.channels||[]).find(c=>c.id===p.linkedChannelId)?.name||"?"}" em Marca Pessoal
          </div>
        : <Btn outline color="#ec4899" style={{marginBottom:14}} onClick={()=>{
            const channel = {id:"bc"+uid(),name:p.name,active:true,followers:0,goal:500,freq:p.canvas?.freq||"",notes:"Promovido do projeto '"+p.name+"'",followerHistory:[]};
            setBrand(b=>({...b,channels:[...b.channels,channel]}));
            setProjects(pr=>pr.map(x=>x.id===p.id?{...x,linkedChannelId:channel.id}:x));
            toast_("Canal criado em Marca Pessoal",  "#ec4899");
          }}><Ico n="globe" size={13}/> Promover a Canal (Marca Pessoal)</Btn>
      )}

      {/* Canvas */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>SOBRE O PROJETO</div>
        {(CANVAS_FIELDS_BY_TYPE[p.type]||CANVAS_FIELDS_BY_TYPE.outro).map(cf=>(
          <div key={cf.k} style={{marginBottom:10}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>{cf.l.toUpperCase()}</div>
            <div style={{fontSize:12,color:(p.canvas||{})[cf.k]?C.text:C.muted,fontStyle:(p.canvas||{})[cf.k]?"normal":"italic"}}>{(p.canvas||{})[cf.k]||"Não definido"}</div>
          </div>
        ))}
      </Card>

      {/* Revenue */}
      {showRevenue&&(
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",gap:16,marginBottom:(p.revenueHistory||[]).length?10:0,flexWrap:"wrap",rowGap:10}}>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>RENDA/MÊS (projetada)</div><div style={{fontSize:15,fontWeight:800}}>{fmt(activeClients*(p.price||0))}</div></div>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>META</div><div style={{fontSize:15,fontWeight:800,color}}>{fmt(p.goal)}</div></div>
            <div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>VALOR/UNIT</div><div style={{fontSize:15,fontWeight:800}}>{fmt(p.price)}</div></div>
            {p.yesodCategoria&&(()=>{
              const real = yesodMonthRevenueForCategory(p.yesodCategoria);
              if(real===null) return null;
              const projetada = activeClients*(p.price||0);
              const diff = real-projetada;
              return (
                <div>
                  <div style={{fontSize:8,color:C.muted,fontWeight:600}}>REAL (YESOD)</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#10b981"}}>{fmt(real)}</div>
                  {diff!==0&&<div style={{fontSize:8,fontWeight:700,color:diff>0?"#10b981":"#ef4444"}}>{diff>0?"+":""}{fmt(diff)} vs. projetada</div>}
                </div>
              );
            })()}
          </div>
          {(p.revenueHistory||[]).length>0&&(function RevenueChart(){
            const hist=p.revenueHistory;
            const maxRev=Math.max(...hist.map(h=>h.rev),p.goal,1);
            const prev=hist.length>=2?hist[hist.length-2].rev:null;
            const curr=hist[hist.length-1]?.rev??0;
            const diff=prev!==null?curr-prev:null;
            return (
              <div>
                {diff!==null&&<div style={{fontSize:10,fontWeight:700,color:diff>=0?"#10b981":"#ef4444",marginBottom:8}}>{diff>=0?"+":""}{fmt(diff)} vs mês anterior</div>}
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
                  {hist.map((h,i)=>{
                    const barH=Math.max(4,Math.round((h.rev/maxRev)*70));
                    const isLast=i===hist.length-1;
                    return (
                      <div key={h.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{fontSize:8,color:isLast?color:C.muted,fontWeight:isLast?700:400}}>{fmt(h.rev).replace("R$ ","")}</div>
                        <div style={{width:"100%",height:barH,borderRadius:"4px 4px 0 0",background:isLast?"linear-gradient(180deg,"+color+","+color+"88)":C.b2,transition:"height .4s"}}/>
                        <div style={{fontSize:8,color:C.muted}}>{h.month.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Clients */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Alunos / Clientes</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addClient",{projId:p.id,name:"",freq:"",since:todayS(),goal:""})}><Ico n="plus" size={11}/> Adicionar</Btn>
      </div>
      {(p.clients||[]).length===0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhum registrado ainda.</div>}
      {(p.clients||[]).map(c=>{
        // Mesmo sinal que já existia só no contexto do Coach (buildHodContext →
        // clientes_precisando_atencao) — sem sessão há mais de 14 dias — agora também
        // visível na tela, não só quando o usuário pergunta ao Coach. Ver [[08 Hod]], gap #3.
        const lastSession = [...(c.sessions||[])].sort((a,b)=>b.date.localeCompare(a.date))[0];
        const daysSinceSession = lastSession ? Math.round((new Date(todayS())-new Date(lastSession.date))/864e5) : null;
        const needsAttention = c.active && (daysSinceSession===null || daysSinceSession>14);
        return (
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(needsAttention?"#f59e0b44":c.active?color+"22":C.b1),borderRadius:10,marginBottom:6}}>
          <div style={{width:28,height:28,borderRadius:8,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="users" size={14} color={color}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600}}>{c.name}</div>
            <div style={{fontSize:9,color:C.muted}}>{c.freq}{c.freq?" · ":""}desde {c.since}</div>
            {needsAttention&&<div style={{fontSize:9,color:"#f59e0b",fontWeight:700,marginTop:2}}>⚠ {daysSinceSession===null?"sem sessão registrada":"sem sessão há "+daysSinceSession+"d"}</div>}
          </div>
          <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,clients:x.clients.map(cl=>cl.id===c.id?{...cl,active:!cl.active}:cl)}:x))}
            style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
            <Badge label={c.active?"Ativo":"Inativo"} color={c.active?color:C.muted}/>
          </button>
          <button onClick={()=>setPage({type:"client",projId:p.id,id:c.id})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="chev" size={13} color={C.muted}/></button>
          <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,clients:x.clients.filter(cl=>cl.id!==c.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Plan */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Plano / Roteiro</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addPlanItem",{projId:p.id,topic:""})}><Ico n="plus" size={11}/> Item</Btn>
      </div>
      {(p.plan||[]).length===0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhum item ainda.</div>}
      {(p.plan||[]).map(pl=>{
        const statusColor = pl.status==="concluido"?"#10b981":pl.status==="andamento"?color:"#64748b";
        const statusLabel = pl.status==="concluido"?"Concluído":pl.status==="andamento"?"Em andamento":"Pendente";
        return (
          <div key={pl.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}>
            <span style={{fontSize:12,flex:1}}>{pl.topic}</span>
            <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,plan:x.plan.map(pi=>pi.id===pl.id?{...pi,status:pi.status==="pendente"?"andamento":pi.status==="andamento"?"concluido":"pendente"}:pi)}:x))}
              style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="refresh" size={10} color={C.muted}/>
            </button>
            <Badge label={statusLabel} color={statusColor}/>
            <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,plan:x.plan.filter(pi=>pi.id!==pl.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Experiments */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Experimentos</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addExp",{projId:p.id,title:"",prazo:todayS()})}><Ico n="plus" size={11}/> Adicionar</Btn>
      </div>
      {(p.experiments||[]).map(e=>{
        const statusColor = e.status==="concluido"?"#10b981":e.status==="andamento"?color:"#64748b";
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
                <button onClick={()=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,experiments:x.experiments.map(ex=>ex.id===e.id?{...ex,status:ex.status==="nao_iniciado"?"andamento":ex.status==="andamento"?"concluido":"nao_iniciado"}:ex)}:x))}
                  style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico n="refresh" size={11} color={C.muted}/>
                </button>
                <button onClick={()=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,experiments:x.experiments.filter(ex=>ex.id!==e.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Learnings */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Aprendizados</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addLearning",{projId:p.id,text:"",date:todayS(),positive:true})}><Ico n="plus" size={11}/> Registrar</Btn>
      </div>
      {(p.learnings||[]).map(l=>(
        <div key={l.id} style={{display:"flex",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(l.positive?"#10b98122":"#ef444422"),borderRadius:11,marginBottom:7}}>
          <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:l.positive?"#10b98122":"#ef444422",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
            <span style={{fontSize:9}}>{l.positive?"✓":"!"}</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12}}>{l.text}</div>
            <div style={{fontSize:9,color:C.muted,marginTop:2}}>{l.date}</div>
          </div>
          <button onClick={()=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,learnings:x.learnings.filter(x2=>x2.id!==l.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignSelf:"flex-start"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Habits */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Hábitos</div>
        <Btn sm full={false} color={color} onClick={()=>openSh("addProjectHabit",{projId:p.id,title:"",freq:"Semanal",xp:15})}><Ico n="plus" size={11}/> Hábito</Btn>
      </div>
      {(p.habits||[]).map(h=>(
        <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
          <button onClick={()=>{if(!h.done)setXp(x=>x+h.xp);setProjects(pr=>pr.map(x=>x.id===p.id?{...x,habits:x.habits.map(hh=>hh.id===h.id?{...hh,done:!hh.done}:hh)}:x));}}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(h.done?color:C.b2),background:h.done?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {h.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:h.done?C.muted:C.text,textDecoration:h.done?"line-through":"none"}}>{h.title}</div>
            <div style={{fontSize:9,color:C.muted}}>{h.freq}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{h.xp}</span>
          <button onClick={()=>setProjects(pr=>pr.map(x=>x.id===p.id?{...x,habits:x.habits.filter(hh=>hh.id!==h.id)}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
        </div>
      ))}

      <div style={{height:1,background:C.b1,margin:"14px 0"}}/>

      {/* Next step */}
      <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>Próximo Passo Prioritário</div>
      <div style={{background:color+"11",border:"1px solid "+color+"33",borderRadius:11,padding:"12px 14px",marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:700,color}}>{p.nextStep||"Nenhum definido"}</div>
      </div>
      <Btn outline color={color} onClick={()=>openSh("editNextStep",{projId:p.id,nextStep:p.nextStep})}>
        <Ico n="edit" size={13}/> Atualizar próximo passo
      </Btn>
    </div>
  );
}

export function AddProjectSheet(){
  const g = useHod();
  const { f, F, close, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Projeto" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Canal no YouTube"/>
      <FS label="Tipo" value={f.type||"negocio"} onChange={v=>F({type:v, phase:(PHASES_BY_TYPE[v]||PHASES_BY_TYPE.outro)[0].id})} opts={PROJECT_TYPES.map(t=>({v:t.id,l:t.label}))}/>
      {(CANVAS_FIELDS_BY_TYPE[f.type||"negocio"]).map(cf=>(
        <FI key={cf.k} label={cf.l} value={(f.canvas||{})[cf.k]||""} onChange={v=>F({canvas:{...(f.canvas||{}),[cf.k]:v}})}/>
      ))}
      <Btn color={typeColor(f.type||"negocio")} onClick={()=>{
        if(!f.name)return;
        const type=f.type||"negocio";
        setProjects(p=>[...p,{id:"pj"+uid(),name:f.name,type,phase:f.phase||(PHASES_BY_TYPE[type]||PHASES_BY_TYPE.outro)[0].id,canvas:f.canvas||{},plan:[],experiments:[],learnings:[],price:0,goal:0,revenueHistory:[],clients:[],nextStep:"",habits:[]}]);
        toast_("Projeto criado");close();
      }}>Criar</Btn>
    </Sheet>
  );
}

export function EditProjectSheet(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { f, F, close, setProjects, toast_ } = g;
  return (
    <Sheet title="Editar Projeto" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
      {(CANVAS_FIELDS_BY_TYPE[f.type]||CANVAS_FIELDS_BY_TYPE.outro).map(cf=>(
        <FI key={cf.k} label={cf.l} value={(f.canvas||{})[cf.k]||""} onChange={v=>F({canvas:{...(f.canvas||{}),[cf.k]:v}})}/>
      ))}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Valor unitário (R$)" value={f.price||0} onChange={v=>F({price:v})} type="number"/>
        <FI label="Meta mensal (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number"/>
      </div>
      <FI label="Categoria no Yesod (opcional)" value={f.yesodCategoria||""} onChange={v=>F({yesodCategoria:v})} placeholder="ex: Aulas particulares"/>
      <div style={{fontSize:9,color:C.muted,marginBottom:11,marginTop:-6}}>Se a categoria bater com uma categoria de entrada do Yesod, a receita real do mês aparece ao lado da meta — sem alterar nada lá.</div>
      <Btn color={typeColor(f.type)} onClick={()=>{setProjects(p=>p.map(x=>x.id===f.id?{...x,name:f.name,canvas:f.canvas||{},price:Number(f.price)||0,goal:Number(f.goal)||0,yesodCategoria:f.yesodCategoria||""}:x));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddPlanItemSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Item do Plano" onClose={close}>
      <FI label="Tópico / Marco" value={f.topic||""} onChange={v=>F({topic:v})} placeholder="Ex: Definir currículo do módulo 1"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.topic)return;setProjects(p=>p.map(x=>x.id===f.projId?{...x,plan:[...x.plan,{id:"pl"+uid(),topic:f.topic,status:"pendente"}]}:x));toast_("Adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddExpSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Experimento" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Entrevistar 5 potenciais clientes"/>
      <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.title)return;setProjects(p=>p.map(x=>x.id===f.projId?{...x,experiments:[...x.experiments,{id:"e"+uid(),title:f.title,status:"nao_iniciado",prazo:f.prazo||todayS()}]}:x));toast_("Adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddLearningSheet(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
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
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.text)return;setProjects(p=>p.map(x=>x.id===f.projId?{...x,learnings:[...x.learnings,{id:"l"+uid(),text:f.text,date:f.date||todayS(),positive:f.positive!==false}]}:x));toast_("Registrado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditNextStepSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Próximo Passo Prioritário" onClose={close}>
      <FTA label="Qual é o próximo passo concreto?" value={f.nextStep||""} onChange={v=>F({nextStep:v})} placeholder="Uma ação específica e factível..." rows={3}/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{setProjects(p=>p.map(x=>x.id===f.projId?{...x,nextStep:f.nextStep}:x));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddProjectHabitSheet(){
  const g = useHod();
  const { f, F, close, projects, setProjects, toast_ } = g;
  return (
    <Sheet title="Novo Hábito" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Preparar material das aulas"/>
      <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
      <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
      <Btn color={typeColor((projects.find(x=>x.id===f.projId)||{}).type)} onClick={()=>{if(!f.title)return;setProjects(p=>p.map(x=>x.id===f.projId?{...x,habits:[...x.habits,{id:"ph"+uid(),title:f.title,freq:f.freq||"Semanal",xp:Number(f.xp)||15,done:false}]}:x));toast_("Criado");close();}}>Criar</Btn>
    </Sheet>
  );
}
