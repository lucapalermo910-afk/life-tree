// TreinoTab + LogTreinoPage, extraídos de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). Viram componentes de módulo de
// verdade (identidade estável) em vez de funções recriadas a cada render do shell — por
// isso sv/bibGrupo/bibNivel (TreinoTab) e timerAtivo/nowTick (LogTreinoPage), antes
// hoisted no shell só pra sobreviver a esse remount, agora são useState local normal.
import { useState, useRef, useEffect, useContext } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, AMBER, GREEN, Sheet, FI, FTA, FS, Card, Btn, Badge, Bar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { GRUPOS, DIAS_SEMANA } from "./constants.js";
import { uid, todayS, kcalMinExercicio, logTipoDe, logTipoUnidade } from "./helpers.js";

export function TreinoTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { exercicios, setExercicios, rotinasTreino, setRotinasTreino, logTreino, setLogTreino, prMap, openSh, toast_, setPage, perfil } = g;
  const [sv,setSv] = useState("rotinas");
  const [bibGrupo,setBibGrupo] = useState(null);
  const [bibNivel,setBibNivel] = useState("Todos");
  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"rotinas",l:"Rotinas"},{id:"log",l:"Histórico"},{id:"biblioteca",l:"Exercícios"}].map(s=>(
          <button key={s.id} onClick={()=>setSv(s.id)} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:sv===s.id?"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)":C.b1,border:"none",color:sv===s.id?"#fff":C.muted}}>{s.l}</button>
        ))}
      </div>
      {sv==="rotinas"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Minhas Rotinas</div>
            <Btn sm full={false} onClick={()=>openSh("addRotina",{name:"",dia:"Segunda"})}><Ico n="plus" size={11}/> Rotina</Btn>
          </div>
          {rotinasTreino.map(r=>(
            <Card key={r.id} color={ACCENT} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:ACCENT}}>{r.name}</div>
                  <div style={{fontSize:9,color:C.muted}}>{r.dias.join(", ")} · {r.exercicios.length} exercícios</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm full={false} color={ACCENT} onClick={()=>{
                    const log={id:"lt"+uid(),data:todayS(),horaInicio:new Date().toISOString(),rotinaId:r.id,rotinaName:r.name,series:r.exercicios.map(e=>({...e,feito:false,cargaReal:e.carga}))};
                    setLogTreino(p=>[...p,log]); setPage({type:"logTreino",logId:log.id}); toast_("Treino iniciado! 💪",ACCENT);
                  }}><Ico n="flame" size={11}/> Iniciar</Btn>
                  <button onClick={()=>setRotinasTreino(p=>p.filter(x=>x.id!==r.id))} style={{background:C.b1,border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={11} color={C.muted}/></button>
                </div>
              </div>
              {r.exercicios.map(re=>{
                const ex=exercicios.find(e=>e.id===re.exercicioId);
                const tipo=logTipoDe(ex);
                const pr=prMap[re.exercicioId];
                return(
                  <div key={re.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid "+C.b1}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:11}}>{ex?.name||"?"}</span>
                      {pr&&<Badge label={"PR "+pr+logTipoUnidade(tipo)} color={AMBER}/>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:9,color:C.muted}}>{re.series}x{re.reps}{tipo==="carga"?" · "+(re.carga>0?re.carga+"kg":"PC"):tipo==="tempo"&&re.carga>0?" · "+re.carga+"s":""}</span>
                      <button onClick={()=>openSh("editExRot",{rotinaId:r.id,reId:re.id,exercicioId:re.exercicioId,series:re.series,reps:re.reps,carga:re.carga,descanso:re.descanso})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="edit" size={11} color={C.muted}/></button>
                      <button onClick={()=>setRotinasTreino(p=>p.map(rt=>rt.id===r.id?{...rt,exercicios:rt.exercicios.filter(e=>e.id!==re.id)}:rt))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
                    </div>
                  </div>
                );
              })}
              <Btn sm outline color={ACCENT} style={{marginTop:8}} onClick={()=>openSh("addExRot",{rotinaId:r.id,exercicioId:exercicios[0]?.id||"",series:3,reps:"10-12",carga:0,descanso:60})}>
                <Ico n="plus" size={11}/> Exercício
              </Btn>
            </Card>
          ))}
        </div>
      )}
      {sv==="log"&&(
        <div>
          <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Histórico de Treinos</div>
          {logTreino.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum treino ainda</div>}
          {[...logTreino].reverse().map(l=>(
            <div key={l.id} onClick={()=>setPage({type:"logTreino",logId:l.id})} style={{padding:"10px 13px",background:C.card,border:"1px solid "+C.b1,borderRadius:11,marginBottom:7,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>{l.rotinaName}</div>
                  <div style={{fontSize:9,color:C.muted}}>{l.data}</div>
                </div>
                <Badge label={l.series.filter(s=>s.feito).length+"/"+l.series.length+" feitos"} color={ACCENT}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {l.series.filter(s=>s.feito).slice(0,3).map((s,i)=>{
                  const ex=exercicios.find(e=>e.id===s.exercicioId);
                  const cr=s.cargaReal??s.carga;
                  return<Badge key={i} label={(ex?.name||"?")+": "+(cr>0?cr+"kg":"PC")} color={C.muted}/>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {sv==="biblioteca"&&(
        <div>
          {!bibGrupo ? (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:800}}>Exercícios</div>
                <Btn sm full={false} onClick={()=>openSh("addExercicio",{name:"",grupo:GRUPOS[0],equip:"",inst:""})}><Ico n="plus" size={11}/> Exercício</Btn>
              </div>
              <div style={{fontSize:9,color:C.muted,marginBottom:10}}>{exercicios.length} exercícios cadastrados · toque num grupo para ver a biblioteca completa</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {GRUPOS.map(grupo=>{
                  const n=exercicios.filter(e=>e.grupo===grupo).length; if(!n)return null;
                  return(
                    <button key={grupo} onClick={()=>{setBibGrupo(grupo);setBibNivel("Todos");}} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:11,padding:12,cursor:"pointer",textAlign:"left"}}>
                      <div style={{fontSize:12,fontWeight:800,marginBottom:5,color:C.text}}>{grupo}</div>
                      <Badge label={n+" exercícios"} color={ACCENT}/>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (() => {
            const isArtes = bibGrupo==="Artes Marciais";
            const itensGrupo = exercicios.filter(e=>e.grupo===bibGrupo);
            const modalidades = isArtes ? [...new Set(itensGrupo.map(e=>e.equip.split(" · ")[0]))] : [];
            const filtros = isArtes ? modalidades : ["Iniciante","Intermediário","Avançado","Elite"];
            const exs = itensGrupo.filter(e=>{
              if(bibNivel==="Todos") return true;
              if(isArtes) return e.equip.split(" · ")[0]===bibNivel;
              return e.nivel===bibNivel || !e.nivel;
            });
            return(
              <>
                <button onClick={()=>{setBibGrupo(null);setBibNivel("Todos");}} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0}}>
                  <Ico n="back" size={13}/> Grupos
                </button>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:800}}>{bibGrupo}</div>
                  <Btn sm full={false} onClick={()=>openSh("addExercicio",{name:"",grupo:bibGrupo,equip:"",inst:""})}><Ico n="plus" size={11}/> Exercício</Btn>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                  {["Todos",...filtros].map(n=>(
                    <button key={n} onClick={()=>setBibNivel(n)} style={{padding:"4px 10px",borderRadius:99,fontSize:9,fontWeight:700,cursor:"pointer",border:"none",background:bibNivel===n?ACCENT:C.b1,color:bibNivel===n?"#fff":C.muted}}>{n}</button>
                  ))}
                </div>
                {exs.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum exercício neste filtro</div>}
                {exs.map(e=>{
                  const pr=prMap[e.id];
                  // Historico de carga
                  const hist = logTreino.flatMap(lt=>lt.series.filter(s=>s.exercicioId===e.id&&(s.cargaReal??s.carga)>0).map(s=>({data:lt.data,carga:s.cargaReal??s.carga}))).sort((a,b)=>a.data.localeCompare(b.data)).slice(-6);
                  const kcalMin = kcalMinExercicio(e,perfil.peso||75);
                  return(
                    <div key={e.id} style={{padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hist.length>1?6:0}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <div style={{fontSize:12,fontWeight:600}}>{e.name}</div>
                            {pr&&<Badge label={"🏆 "+pr+"kg"} color={AMBER}/>}
                            {kcalMin&&<Badge label={kcalMin.toFixed(1)+" kcal/min"} color={ACCENT}/>}
                          </div>
                          <div style={{fontSize:9,color:C.muted}}>{e.equip}</div>
                          {e.inst&&<div style={{fontSize:9,color:C.muted,marginTop:3,lineHeight:1.5}}>{e.inst}</div>}
                        </div>
                        <button onClick={()=>setExercicios(p=>p.filter(x=>x.id!==e.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                      </div>
                      {hist.length>1&&(
                        <div style={{height:30,display:"flex",alignItems:"flex-end",gap:3}}>
                          {hist.map((h,i)=>{
                            const maxH=Math.max(...hist.map(x=>x.carga));
                            const barH=Math.max(4,Math.round((h.carga/maxH)*26));
                            const isLast=i===hist.length-1;
                            return<div key={i} style={{flex:1,height:barH,borderRadius:"2px 2px 0 0",background:isLast?ACCENT:C.b2,transition:"height .3s"}} title={h.carga+"kg — "+h.data}/>;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export function LogTreinoPage(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { logTreino, setLogTreino, page, setPage, exercicios, prMap, kcalDoTreino, toast_ } = g;
  const [timerAtivo, setTimerAtivo] = useState(null); // {segundos, exercicioNome}
  const timerRef = useRef(null);
  useEffect(()=>{
    if(!timerAtivo) return;
    if(timerAtivo.segundos<=0){ setTimerAtivo(null); return; }
    timerRef.current=setInterval(()=>setTimerAtivo(t=>t?{...t,segundos:t.segundos-1}:null),1000);
    return()=>clearInterval(timerRef.current);
  },[timerAtivo]);
  const [nowTick, setNowTick] = useState(()=>Date.now());
  useEffect(()=>{
    const id=setInterval(()=>setNowTick(Date.now()),1000);
    return ()=>clearInterval(id);
  },[]);

  const log = logTreino.find(l=>l.id===page.logId);
  if(!log) return null;
  const update = (idx,patch) => setLogTreino(p=>p.map(l=>l.id===log.id?{...l,series:l.series.map((s,i)=>i===idx?{...s,...patch}:s)}:l));
  const done = log.series.filter(s=>s.feito).length;
  const pct  = log.series.length>0?Math.round(done/log.series.length*100):0;
  // Duração ao vivo — nowTick faz esse número andar sem precisar de estado próprio no
  // shell (agora que LogTreinoPage é um componente de módulo estável, timerAtivo/nowTick
  // podem morar aqui direto — ver comentário no topo do arquivo).
  const inicioMs = log.horaInicio ? new Date(log.horaInicio).getTime() : null;
  const fimMs = log.horaFim ? new Date(log.horaFim).getTime() : null;
  const elapsedSec = inicioMs!=null ? Math.max(0,Math.round(((fimMs??nowTick)-inicioMs)/1000)) : null;
  const elapsedFmt = elapsedSec!=null ? Math.floor(elapsedSec/60)+"min "+(elapsedSec%60)+"s" : null;
  const kcalSessao = kcalDoTreino(log);
  const finalizarTreino = () => {
    const fim = new Date().toISOString();
    const duracaoMin = inicioMs!=null ? Math.max(1,Math.round((new Date(fim).getTime()-inicioMs)/60000)) : null;
    setLogTreino(p=>p.map(l=>l.id===log.id?{...l,horaFim:fim,duracaoMin}:l));
    toast_("Treino finalizado! 💪",GREEN);
  };
  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <button onClick={()=>setPage(null)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}>
        <Ico n="back" size={13}/> Treino
      </button>
      {timerAtivo&&(
        <div style={{background:ACCENT+"22",border:"2px solid "+ACCENT+"44",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,color:ACCENT,fontWeight:700}}>DESCANSO — {timerAtivo.exercicioNome}</div>
            <div style={{fontSize:28,fontWeight:900,color:ACCENT,fontVariantNumeric:"tabular-nums"}}>{Math.floor(timerAtivo.segundos/60).toString().padStart(2,"0")}:{(timerAtivo.segundos%60).toString().padStart(2,"0")}</div>
          </div>
          <button onClick={()=>setTimerAtivo(null)} style={{background:ACCENT+"22",border:"1px solid "+ACCENT+"44",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:ACCENT,fontWeight:700,fontSize:11}}>Pular</button>
        </div>
      )}
      <div style={{background:ACCENT+"18",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:14,fontWeight:800,color:ACCENT}}>{log.rotinaName}</div>
          <Badge label={done+"/"+log.series.length} color={ACCENT}/>
        </div>
        <Bar value={pct} color={ACCENT} height={5}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
          <div style={{fontSize:9,color:C.muted}}>{log.data} · {pct}% completo</div>
          {elapsedFmt&&<div style={{fontSize:11,fontWeight:800,color:ACCENT,fontVariantNumeric:"tabular-nums"}}>⏱ {elapsedFmt}{log.horaFim?" (finalizado)":""}</div>}
        </div>
        {kcalSessao!=null&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>~{kcalSessao}kcal nesta sessão</div>}
      </div>
      {log.series.map((s,idx)=>{
        const ex=exercicios.find(e=>e.id===s.exercicioId);
        const tipo=logTipoDe(ex);
        const cargaAtual=s.cargaReal!==undefined?s.cargaReal:s.carga;
        const repsAtual=s.repsReal!==undefined?s.repsReal:0;
        const valorPR = tipo==="reps"?repsAtual:cargaAtual;
        const pr=prMap[s.exercicioId];
        const isPR=pr&&valorPR>pr;
        // Sugestão de progressão a partir do PR (sobrecarga progressiva) — não é IA, é
        // heurística simples (PR + incremento pequeno por tipo), mas resolve o gap real:
        // hoje o usuário só via o badge "🏆 PR!" depois de já ter batido, sem nenhuma
        // pista de pra onde mirar antes de começar a série.
        const prSugestao = pr>0 ? (tipo==="reps"?pr+1:tipo==="tempo"?pr+5:Math.round((pr+2.5)*2)/2) : null;
        return(
          <Card key={s.id||idx} color={s.feito?ACCENT:undefined} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:13,fontWeight:700}}>{ex?.name||"?"}</div>
                  {isPR&&<span style={{fontSize:9,background:AMBER+"22",color:AMBER,padding:"1px 7px",borderRadius:99,fontWeight:700}}>🏆 PR!</span>}
                </div>
                <div style={{fontSize:9,color:C.muted}}>{ex?.grupo} · {s.series}x{s.reps}</div>
              </div>
              <button onClick={()=>{
                update(idx,{feito:!s.feito});
                if(!s.feito&&s.descanso>0) setTimerAtivo({segundos:s.descanso,exercicioNome:ex?.name||"?"});
              }} style={{width:32,height:32,borderRadius:8,cursor:"pointer",border:"1.5px solid "+(s.feito?ACCENT:C.b2),background:s.feito?ACCENT:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {s.feito&&<Ico n="check" size={14} color="#fff" sw={2.5}/>}
              </button>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["SÉRIES",s.series,1],["REPS",s.reps,1]].map(([label,val,fl])=>(
                <div key={label} style={{flex:fl,background:C.surface,borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:C.muted}}>{label}</div>
                  <div style={{fontSize:14,fontWeight:800}}>{val}</div>
                </div>
              ))}
              {tipo!=="reps"&&(<div style={{flex:1.4,background:cargaAtual!==s.carga?ACCENT+"18":C.surface,borderRadius:8,padding:"5px 8px",textAlign:"center",border:cargaAtual!==s.carga?"1px solid "+ACCENT+"55":"none"}}>
                <div style={{fontSize:8,color:C.muted,marginBottom:2}}>{tipo==="tempo"?"TEMPO REAL (s)":"CARGA REAL (kg)"}</div>
                <input type="number" value={cargaAtual} min={0} step={tipo==="tempo"?1:0.5} onChange={e=>update(idx,{cargaReal:Number(e.target.value)})}
                  style={{width:"100%",background:"transparent",border:"none",textAlign:"center",fontSize:14,fontWeight:800,color:cargaAtual!==s.carga?ACCENT:C.text,outline:"none",padding:0}}/>
                {s.carga>0&&<div style={{fontSize:7,color:C.muted}}>base: {s.carga}{logTipoUnidade(tipo)}</div>}
                {prSugestao!=null&&<div style={{fontSize:7,color:AMBER}}>sugestão: {prSugestao}{logTipoUnidade(tipo)} (PR: {pr}{logTipoUnidade(tipo)})</div>}
              </div>)}
              {tipo==="reps"&&(<div style={{flex:1.4,background:repsAtual>0?ACCENT+"18":C.surface,borderRadius:8,padding:"5px 8px",textAlign:"center",border:repsAtual>0?"1px solid "+ACCENT+"55":"none"}}>
                <div style={{fontSize:8,color:C.muted,marginBottom:2}}>REPS FEITAS</div>
                <input type="number" value={repsAtual} min={0} step={1} onChange={e=>update(idx,{repsReal:Number(e.target.value)})}
                  style={{width:"100%",background:"transparent",border:"none",textAlign:"center",fontSize:14,fontWeight:800,color:repsAtual>0?ACCENT:C.text,outline:"none",padding:0}}/>
                <div style={{fontSize:7,color:C.muted}}>meta: {s.reps}</div>
                {prSugestao!=null&&<div style={{fontSize:7,color:AMBER}}>sugestão: {prSugestao} reps (PR: {pr})</div>}
              </div>)}
              <div style={{flex:1,background:C.surface,borderRadius:8,padding:"5px 8px",textAlign:"center",cursor:"pointer"}} onClick={()=>setTimerAtivo({segundos:s.descanso,exercicioNome:ex?.name||"?"})}>
                <div style={{fontSize:8,color:C.muted}}>DESCANSO</div>
                <div style={{fontSize:14,fontWeight:800}}>{s.descanso}s</div>
                <div style={{fontSize:7,color:ACCENT}}>▶ timer</div>
              </div>
            </div>
          </Card>
        );
      })}
      {!log.horaFim&&(
        <Btn color={GREEN} onClick={finalizarTreino} style={{marginTop:4}}><Ico n="check" size={14}/> Finalizar treino</Btn>
      )}
      {pct===100&&!log.horaFim&&(
        <div style={{background:GREEN+"22",border:"2px solid "+GREEN+"44",borderRadius:14,padding:14,textAlign:"center",marginTop:10}}>
          <div style={{fontSize:24,marginBottom:6}}>🎉</div>
          <div style={{fontSize:14,fontWeight:800,color:GREEN}}>Todas as séries feitas!</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>Toque em "Finalizar treino" pra fechar a sessão e registrar a duração</div>
        </div>
      )}
      {log.horaFim&&(
        <div style={{background:GREEN+"22",border:"2px solid "+GREEN+"44",borderRadius:14,padding:14,textAlign:"center",marginTop:10}}>
          <div style={{fontSize:24,marginBottom:6}}>🎉</div>
          <div style={{fontSize:14,fontWeight:800,color:GREEN}}>Treino finalizado!</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{log.duracaoMin}min{kcalSessao!=null?" · ~"+kcalSessao+"kcal":""} · Mais um dia de Geburah</div>
        </div>
      )}
    </div>
  );
}

export function AddExercicioSheet(){
  const g = useGeburah();
  const { f, F, close, setExercicios, toast_ } = g;
  return(
    <Sheet title="Novo Exercício" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Supino Reto"/>
      <FS label="Grupo muscular" value={f.grupo||GRUPOS[0]} onChange={v=>F({grupo:v})} opts={GRUPOS.map(gr=>({v:gr,l:gr}))}/>
      <FI label="Equipamento" value={f.equip||""} onChange={v=>F({equip:v})} placeholder="Ex: Barra, Halteres..."/>
      <FTA label="Instruções" value={f.inst||""} onChange={v=>F({inst:v})} rows={2}/>
      <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setExercicios(p=>[...p,{id:"e"+uid(),name:f.name,grupo:f.grupo||GRUPOS[0],equip:f.equip||"",inst:f.inst||""}]);toast_("Exercício adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddRotinaSheet(){
  const g = useGeburah();
  const { f, F, close, setRotinasTreino, toast_ } = g;
  return(
    <Sheet title="Nova Rotina" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Treino A — Peito/Ombros"/>
      <FS label="Dia principal" value={f.dia||"Segunda"} onChange={v=>F({dia:v})} opts={DIAS_SEMANA.map(d=>({v:d,l:d}))}/>
      <Btn color={ACCENT} onClick={()=>{if(!f.name)return;setRotinasTreino(p=>[...p,{id:"rt"+uid(),name:f.name,dias:[f.dia||"Segunda"],exercicios:[]}]);toast_("Rotina criada");close();}}>Criar</Btn>
    </Sheet>
  );
}

export function AddExRotSheet(){
  const g = useGeburah();
  const { f, F, close, exercicios, setRotinasTreino, toast_ } = g;
  const exSel=exercicios.find(e=>e.id===f.exercicioId);
  const tipo=logTipoDe(exSel);
  return(<Sheet title="Adicionar Exercício" onClose={close}>
    <FS label="Exercício" value={f.exercicioId||""} onChange={v=>F({exercicioId:v})} opts={exercicios.map(e=>({v:e.id,l:e.name+" ("+e.grupo+")"}))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FI label="Séries" value={f.series||3} onChange={v=>F({series:v})} type="number" min={1}/>
      <FI label={tipo==="reps"?"Meta de reps":"Repetições"} value={f.reps||(tipo==="tempo"?"30s":"10-12")} onChange={v=>F({reps:v})} placeholder={tipo==="tempo"?"30s":"10-12"}/>
    </div>
    {tipo!=="reps"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FI label={tipo==="tempo"?"Duração alvo (s)":"Carga (kg)"} value={f.carga||0} onChange={v=>F({carga:v})} type="number" min={0}/>
      <FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>
    </div>}
    {tipo==="reps"&&<FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>}
    <Btn color={ACCENT} onClick={()=>{if(!f.exercicioId)return;setRotinasTreino(p=>p.map(r=>r.id===f.rotinaId?{...r,exercicios:[...r.exercicios,{id:"re"+uid(),exercicioId:f.exercicioId,series:Number(f.series)||3,reps:f.reps||"10-12",carga:Number(f.carga)||0,descanso:Number(f.descanso)||60}]}:r));toast_("Adicionado");close();}}>Adicionar</Btn>
  </Sheet>);
}

export function EditExRotSheet(){
  const g = useGeburah();
  const { f, F, close, exercicios, setRotinasTreino, toast_ } = g;
  const exSel=exercicios.find(e=>e.id===f.exercicioId);
  const tipo=logTipoDe(exSel);
  return(<Sheet title="Editar Exercício" onClose={close}>
    <FS label="Exercício" value={f.exercicioId||""} onChange={v=>F({exercicioId:v})} opts={exercicios.map(e=>({v:e.id,l:e.name+" ("+e.grupo+")"}))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FI label="Séries" value={f.series||3} onChange={v=>F({series:v})} type="number" min={1}/>
      <FI label={tipo==="reps"?"Meta de reps":"Repetições"} value={f.reps||"10-12"} onChange={v=>F({reps:v})} placeholder="10-12"/>
    </div>
    {tipo!=="reps"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <FI label={tipo==="tempo"?"Duração alvo (s)":"Carga (kg)"} value={f.carga||0} onChange={v=>F({carga:v})} type="number" min={0}/>
      <FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>
    </div>}
    {tipo==="reps"&&<FI label="Descanso (s)" value={f.descanso||60} onChange={v=>F({descanso:v})} type="number" min={0}/>}
    <Btn color={ACCENT} onClick={()=>{setRotinasTreino(p=>p.map(r=>r.id===f.rotinaId?{...r,exercicios:r.exercicios.map(e=>e.id===f.reId?{...e,exercicioId:f.exercicioId,series:Number(f.series),reps:f.reps,carga:Number(f.carga),descanso:Number(f.descanso)}:e)}:r));toast_("Atualizado");close();}}>Salvar</Btn>
  </Sheet>);
}
