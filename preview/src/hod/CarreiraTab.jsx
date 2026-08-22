// CarreiraTab + sheets de trilhas/objetivos/hábitos/conquistas de carreira, extraídos de
// HodModule.jsx (22/08/2026, item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { useContext } from "react";
import { TRACK_PALETTE } from "./seedData.js";
import { useHod } from "./context.js";
import { ThemeCtx, ACCENT, Sheet, FI, FTA, FS, Btn, Badge, ProgressBar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { FOCUS_META, FOCUS_OPTS } from "./constants.js";
import { uid, todayS, pct, cycleFocus, trackScore } from "./helpers.js";

export function CarreiraTab(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { tracks, setTracks, openSh, carGoals, setCarGoals, setXp, setPendingAch, carHabits, setCarHabits, achievements, setAchievements, toast_, carScore } = g;
  const groups = [
    {id:"atual",      label:"Foco Atual"},
    {id:"explorando", label:"Explorando"},
    {id:"arquivada",  label:"Arquivadas"},
  ];
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>SCORE DE CARREIRA</div>
        <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{carScore()}<span style={{fontSize:16}}>%</span></div>
      </div>

      {/* Trilhas de Competência */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Trilhas de Competência</div>
        <Btn sm full={false} onClick={()=>openSh("addTrack",{name:"",focus:"atual"})}><Ico n="plus" size={11}/> Trilha</Btn>
      </div>
      <div style={{fontSize:9,color:C.muted,marginBottom:10}}>Mudando de carreira ou explorando algo novo? Crie uma trilha nova — o foco não precisa ser um só.</div>
      {groups.map(gr=>{
        const groupTracks = tracks.filter(t=>t.focus===gr.id);
        if(!groupTracks.length) return null;
        return (
          <div key={gr.id} style={{marginBottom:12}}>
            <div style={{fontSize:9,color:FOCUS_META[gr.id].color,fontWeight:700,letterSpacing:1,marginBottom:6}}>{gr.label.toUpperCase()}</div>
            {groupTracks.map(t=>{
              const sc = trackScore(t);
              return (
                <div key={t.id} style={{background:C.card,border:"1px solid "+t.color+"33",borderRadius:12,padding:"11px 13px",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                      <span style={{fontSize:12,fontWeight:700}}>{t.name}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:12,fontWeight:800,color:t.color}}>{sc}%</span>
                      <button onClick={()=>setTracks(p=>p.map(x=>x.id===t.id?{...x,focus:cycleFocus(x.focus)}:x))} title="Mudar foco"
                        style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Ico n="refresh" size={10} color={C.muted}/>
                      </button>
                      <button onClick={()=>openSh("editTrack",{...t})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button>
                      <button onClick={()=>{setTracks(p=>p.filter(x=>x.id!==t.id));toast_("Trilha removida");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                    </div>
                  </div>
                  <ProgressBar value={sc} color={t.color}/>
                  {t.skills.map(sk=>{
                    const p2=pct(sk.level,sk.target);
                    // "Última prática" — fecha o gap "sem lastPracticed" ([[08 Hod]], gap
                    // #8): a data já era prevista no modelo de dados original mas nunca
                    // tinha sido implementada de fato. Atualizada automaticamente sempre
                    // que o nível da skill muda (editSkill e a ação do Coach edit_skill).
                    const daysSincePractice = sk.lastPracticed ? Math.round((new Date(todayS())-new Date(sk.lastPracticed))/864e5) : null;
                    const stalePractice = daysSincePractice!==null && daysSincePractice>=30;
                    return (
                      <div key={sk.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0 0"}}>
                        <div style={{flex:1,marginRight:8}}>
                          <div style={{fontSize:11,fontWeight:600,marginBottom:3}}>{sk.name}</div>
                          <ProgressBar value={p2} color={t.color} height={3}/>
                          <div style={{fontSize:8,color:stalePractice?"#f59e0b":C.muted,marginTop:3}}>
                            {daysSincePractice===null?"Nunca praticado":stalePractice?"⚠ "+daysSincePractice+"d sem praticar":"Praticado há "+daysSincePractice+"d"}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:11,fontWeight:700,color:t.color}}>{sk.level}<span style={{fontSize:9,color:C.muted}}>/{sk.target}</span></span>
                          <button onClick={()=>openSh("editSkill",{...sk,trackId:t.id})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={11} color={C.muted}/></button>
                          <button onClick={()=>{setTracks(p=>p.map(x=>x.id===t.id?{...x,skills:x.skills.filter(s=>s.id!==sk.id)}:x));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={()=>openSh("addSkill",{trackId:t.id,name:"",level:1,target:5,notes:""})}
                    style={{marginTop:9,width:"100%",background:"none",border:"1px dashed "+t.color+"55",borderRadius:8,padding:"6px",cursor:"pointer",color:t.color,fontSize:10,fontWeight:700}}>
                    + Habilidade
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{height:1,background:C.b1,margin:"16px 0"}}/>

      {/* Goals */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Objetivos</div>
        <Btn sm full={false} onClick={()=>openSh("addCarGoal",{title:"",prazo:todayS(),xp:100})}><Ico n="plus" size={11}/> Objetivo</Btn>
      </div>
      {carGoals.map(g2=>(
        <div key={g2.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+(g2.done?ACCENT+"33":C.b1),borderRadius:11,marginBottom:6}}>
          <button onClick={()=>{
            if(!g2.done){setXp(x=>x+g2.xp);setPendingAch(g2);}
            setCarGoals(p=>p.map(x=>x.id===g2.id?{...x,done:!x.done}:x));
          }}
            style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g2.done?ACCENT:C.b2),background:g2.done?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {g2.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:g2.done?C.muted:C.text,textDecoration:g2.done?"line-through":"none"}}>{g2.title}</div>
            <div style={{fontSize:9,color:C.muted}}>Prazo: {g2.prazo}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:"#fbbf24"}}>+{g2.xp}</span>
          <button onClick={()=>{setCarGoals(p=>p.filter(x=>x.id!==g2.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
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
      {achievements.map(a=>{
        const linkedTrack = a.trackId ? tracks.find(t=>t.id===a.trackId) : null;
        return (
        <div key={a.id} style={{padding:"10px 13px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>{a.title}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>{a.date}{linkedTrack?" · "+linkedTrack.name:""}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {linkedTrack&&<div style={{width:8,height:8,borderRadius:"50%",background:linkedTrack.color,flexShrink:0}}/>}
              <Badge label={a.impact} color={a.impact==="Alto"?ACCENT:"#f59e0b"}/>
              <button onClick={()=>{setAchievements(p=>p.filter(x=>x.id!==a.id));toast_("Removido");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}

// Prompt de conquista — não é um sheet gated por `sh`, é um overlay independente exibido
// sempre que `pendingAch` está setado (uma meta/trilha acabou de ser concluída). Vive aqui
// (domínio de Carreira) mas é renderizado pelo shell fora da árvore de qualquer aba,
// porque pode disparar a partir de HodTab ou CarreiraTab.
export function AchievementPrompt(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { pendingAch, setPendingAch, setAchievements, toast_ } = g;
  if(!pendingAch) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setPendingAch(null)}>
      <div style={{background:C.surface,borderRadius:18,padding:22,width:"100%",maxWidth:390,boxShadow:"0 24px 60px rgba(0,0,0,.4)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:28,textAlign:"center",marginBottom:8}}>🏆</div>
        <div style={{fontSize:15,fontWeight:800,textAlign:"center",marginBottom:6}}>{pendingAch.trackId?"Trilha concluída!":"Objetivo concluído!"}</div>
        <div style={{fontSize:12,color:C.muted,textAlign:"center",marginBottom:18,lineHeight:1.5}}>Quer registrar como conquista para usar em avaliações e entrevistas?</div>
        <div style={{background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:ACCENT,marginBottom:4}}>Título sugerido</div>
          <div style={{fontSize:13,fontWeight:600}}>{pendingAch.title}</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn outline color={C.muted} onClick={()=>setPendingAch(null)} style={{flex:1}}>Pular</Btn>
          <Btn color={ACCENT} onClick={()=>{
            setAchievements(p=>[...p,{id:"ach"+uid(),title:pendingAch.title,date:todayS(),impact:"Alto",...(pendingAch.trackId?{trackId:pendingAch.trackId}:{})}]);
            toast_("Conquista registrada! 🏆");
            setPendingAch(null);
          }} style={{flex:1}}>Registrar</Btn>
        </div>
      </div>
    </div>
  );
}

export function AddTrackSheet(){
  const g = useHod();
  const { f, F, close, setTracks, toast_ } = g;
  const C = useContext(ThemeCtx);
  return (
    <Sheet title="Nova Trilha de Competência" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Discovery & Pesquisa de Usuário"/>
      <FS label="Foco" value={f.focus||"atual"} onChange={v=>F({focus:v})} opts={FOCUS_OPTS}/>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700,letterSpacing:.8}}>COR</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {TRACK_PALETTE.map(cl=>(
            <button key={cl} onClick={()=>F({color:cl})} style={{width:26,height:26,borderRadius:"50%",background:cl,border:(f.color||TRACK_PALETTE[0])===cl?"2.5px solid "+C.text:"2px solid transparent",cursor:"pointer",padding:0}}/>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,color:C.muted,marginBottom:12}}>Mudando de carreira ou testando algo novo? Use "Explorando" — não precisa apagar as trilhas antigas, só mudar o foco pra "Arquivada".</div>
      <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setTracks(p=>[...p,{id:"tr"+uid(),name:f.name,color:f.color||TRACK_PALETTE[p.length%TRACK_PALETTE.length],focus:f.focus||"atual",skills:[]}]);toast_("Trilha criada");close();}}>Criar</Btn>
    </Sheet>
  );
}

export function EditTrackSheet(){
  const g = useHod();
  const { f, F, close, setTracks, toast_ } = g;
  const C = useContext(ThemeCtx);
  return (
    <Sheet title="Editar Trilha" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
      <FS label="Foco" value={f.focus||"atual"} onChange={v=>F({focus:v})} opts={FOCUS_OPTS}/>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700,letterSpacing:.8}}>COR</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {TRACK_PALETTE.map(cl=>(
            <button key={cl} onClick={()=>F({color:cl})} style={{width:26,height:26,borderRadius:"50%",background:cl,border:f.color===cl?"2.5px solid "+C.text:"2px solid transparent",cursor:"pointer",padding:0}}/>
          ))}
        </div>
      </div>
      <Btn color={ACCENT} onClick={()=>{setTracks(p=>p.map(x=>x.id===f.id?{...x,name:f.name,focus:f.focus,color:f.color||x.color}:x));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddSkillSheet(){
  const g = useHod();
  const { f, F, close, tracks, setTracks, toast_ } = g;
  return (
    <Sheet title="Nova Habilidade" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Entrevistas de usuário"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Nível atual (1-5)" value={f.level||1} onChange={v=>F({level:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
        <FI label="Meta (1-5)" value={f.target||5} onChange={v=>F({target:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
      </div>
      <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} placeholder="Como evoluir nessa habilidade?"/>
      <Btn color={(tracks.find(t=>t.id===f.trackId)||{}).color||ACCENT} onClick={()=>{if(!f.name)return;setTracks(p=>p.map(t=>t.id===f.trackId?{...t,skills:[...t.skills,{id:"sk"+uid(),name:f.name,level:Number(f.level)||1,target:Number(f.target)||5,notes:f.notes||"",lastPracticed:todayS()}]}:t));toast_("Adicionado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditSkillSheet(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { f, F, close, tracks, setTracks, setPendingAch, toast_ } = g;
  return (
    <Sheet title="Editar Habilidade" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Nível atual (1-5)" value={f.level||1} onChange={v=>F({level:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
        <FI label="Meta (1-5)" value={f.target||5} onChange={v=>F({target:Math.min(5,Math.max(1,v))})} type="number" min={1} max={5}/>
      </div>
      <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})}/>
      {f.lastPracticed&&<div style={{fontSize:9,color:C.muted,marginBottom:11,marginTop:-6}}>Última prática: {f.lastPracticed}</div>}
      <Btn color={(tracks.find(t=>t.id===f.trackId)||{}).color||ACCENT} onClick={()=>{
        const track = tracks.find(t=>t.id===f.trackId);
        const wasComplete = track ? trackScore(track)===100 : false;
        const levelChanged = track && Number(f.level)!==(track.skills.find(s=>s.id===f.id)||{}).level;
        setTracks(p=>p.map(t=>t.id===f.trackId?{...t,skills:t.skills.map(x=>x.id===f.id?{...x,name:f.name,level:Number(f.level),target:Number(f.target),notes:f.notes,...(levelChanged?{lastPracticed:todayS()}:{})}:x)}:t));
        toast_("Atualizado");
        // Sugere conquista quando a trilha bate 100% pela primeira vez — mesma mecânica
        // que já existia só pra metas de carreira (pendingAch), agora também linkada a
        // trilha (trackId), fechando o gap "conquistas não linkam com trilhas" ([[08 Hod]]).
        if(track && !wasComplete){
          const updatedSkills = track.skills.map(x=>x.id===f.id?{...x,level:Number(f.level),target:Number(f.target)}:x);
          if(trackScore({...track,skills:updatedSkills})===100){
            setPendingAch({title:"Trilha '"+track.name+"' concluída (100%)",trackId:track.id});
          }
        }
        close();
      }}>Salvar</Btn>
    </Sheet>
  );
}

export function AddCarGoalSheet(){
  const g = useHod();
  const { f, F, close, setCarGoals, toast_ } = g;
  return (
    <Sheet title="Novo Objetivo de Carreira" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Obter certificação PSPO"/>
      <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
      <FI label="XP de recompensa" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/>
      <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setCarGoals(p=>[...p,{id:"cg"+uid(),title:f.title,prazo:f.prazo||todayS(),xp:Number(f.xp)||100,done:false}]);toast_("Objetivo criado");close();}}>Criar</Btn>
    </Sheet>
  );
}

export function EditCarGoalSheet(){
  const g = useHod();
  const { f, F, close, setCarGoals, toast_ } = g;
  return (
    <Sheet title="Editar Objetivo" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
      <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
      <FI label="XP" value={f.xp||100} onChange={v=>F({xp:v})} type="number"/>
      <Btn color={ACCENT} onClick={()=>{setCarGoals(p=>p.map(x=>x.id===f.id?{...x,title:f.title,prazo:f.prazo,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddCarHabitSheet(){
  const g = useHod();
  const { f, F, close, setCarHabits, toast_ } = g;
  return (
    <Sheet title="Novo Hábito de Carreira" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Ler 20 min sobre produto"/>
      <FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
      <FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/>
      <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setCarHabits(p=>[...p,{id:"ch"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||10,done:false}]);toast_("Hábito criado");close();}}>Criar</Btn>
    </Sheet>
  );
}

export function EditCarHabitSheet(){
  const g = useHod();
  const { f, F, close, setCarHabits, toast_ } = g;
  return (
    <Sheet title="Editar Hábito" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
      <FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
      <FI label="XP" value={f.xp||10} onChange={v=>F({xp:v})} type="number"/>
      <Btn color={ACCENT} onClick={()=>{setCarHabits(p=>p.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddAchievementSheet(){
  const g = useHod();
  const { f, F, close, tracks, setAchievements, toast_ } = g;
  return (
    <Sheet title="Registrar Conquista" onClose={close}>
      <FTA label="Conquista" value={f.title||""} onChange={v=>F({title:v})} placeholder="Descreva o resultado e impacto..." rows={3}/>
      <FI label="Data" value={f.date||todayS()} onChange={v=>F({date:v})} type="date"/>
      <FS label="Impacto" value={f.impact||"Alto"} onChange={v=>F({impact:v})} opts={["Alto","Médio","Baixo"].map(x=>({v:x,l:x}))}/>
      {tracks.length>0&&<FS label="Trilha relacionada (opcional)" value={f.trackId||""} onChange={v=>F({trackId:v})} opts={[{v:"",l:"Nenhuma"},...tracks.map(t=>({v:t.id,l:t.name}))]}/>}
      <Btn color={ACCENT} onClick={()=>{if(!f.title)return;setAchievements(p=>[...p,{id:"ach"+uid(),title:f.title,date:f.date||todayS(),impact:f.impact||"Alto",...(f.trackId?{trackId:f.trackId}:{})}]);toast_("Registrado");close();}}>Salvar</Btn>
    </Sheet>
  );
}
