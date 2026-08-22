// MarcaTab + seus sheets, extraídos de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). Usa "#ec4899" como accent próprio
// (não o ACCENT laranja do módulo) — carregado sem alteração do original, não é um bug.
import { useContext } from "react";
import { useHod } from "./context.js";
import { ThemeCtx, Sheet, FI, FTA, FS, Btn, Badge, ProgressBar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { CONTENT_FORMATS, CHANNELS } from "./constants.js";
import { uid, todayS, pct } from "./helpers.js";

export function MarcaTab(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { brand, setBrand, openSh, setXp, marcaScore } = g;
  return (
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
                  {(function FollowerDiff(){
                    const hist = ch.followerHistory||[];
                    if(hist.length<2) return null;
                    const prev = hist[hist.length-2].count;
                    const curr = hist[hist.length-1].count;
                    const d = curr-prev;
                    if(d===0) return null;
                    return <span style={{fontSize:9,fontWeight:700,color:d>0?"#10b981":"#ef4444"}}>{d>0?"+":""}{d}</span>;
                  }())}
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
}

export function EditPillarsSheet(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
    <Sheet title="Pilares da Marca" onClose={close}>
      <FTA label="Pilares (um por linha)" value={f.pillars||""} onChange={v=>F({pillars:v})} placeholder={"PO/PM\nEducação\nImigração para Europa"} rows={5}/>
      <div style={{fontSize:10,color:C.muted,marginBottom:12}}>Em que assuntos você quer ser referência?</div>
      <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,pillars:f.pillars.split("\n").map(x=>x.trim()).filter(Boolean)}));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddChannelSheet(){
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
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
  );
}

export function EditChannelSheet(){
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
    <Sheet title="Editar Canal" onClose={close}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Seguidores atuais" value={f.followers||0} onChange={v=>F({followers:v})} type="number"/>
        <FI label="Meta" value={f.goal||500} onChange={v=>F({goal:v})} type="number"/>
      </div>
      <FI label="Frequência" value={f.freq||""} onChange={v=>F({freq:v})}/>
      <FTA label="Notas" value={f.notes||""} onChange={v=>F({notes:v})} rows={2}/>
      <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,channels:b.channels.map(x=>x.id===f.id?{...x,followers:Number(f.followers),goal:Number(f.goal),freq:f.freq,notes:f.notes}:x)}));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddContentSheet(){
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
    <Sheet title="Novo Conteúdo" onClose={close}>
      <FI label="Título / Tema" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Jornada de um PO"/>
      <FS label="Formato" value={f.format||CONTENT_FORMATS[0]} onChange={v=>F({format:v})} opts={CONTENT_FORMATS.map(x=>({v:x,l:x}))}/>
      <FI label="Canal" value={f.channel||"LinkedIn"} onChange={v=>F({channel:v})} placeholder="LinkedIn, Instagram..."/>
      <FI label="Prazo" value={f.prazo||todayS()} onChange={v=>F({prazo:v})} type="date"/>
      <Btn color="#ec4899" onClick={()=>{if(!f.title)return;setBrand(b=>({...b,contentPlan:[...b.contentPlan,{id:"cp"+uid(),title:f.title,format:f.format||CONTENT_FORMATS[0],channel:f.channel||"LinkedIn",status:"ideia",prazo:f.prazo||todayS()}]}));toast_("Adicionado");close();}}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddBrandHabitSheet(){
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
    <Sheet title="Novo Hábito de Marca" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Publicar um conteúdo"/>
      <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
      <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
      <Btn color="#ec4899" onClick={()=>{if(!f.title)return;setBrand(b=>({...b,habits:[...b.habits,{id:"bh"+uid(),title:f.title,freq:f.freq||"Semanal",xp:Number(f.xp)||15,done:false}]}));toast_("Criado");close();}}>Criar</Btn>
    </Sheet>
  );
}

export function EditBrandHabitSheet(){
  const g = useHod();
  const { f, F, close, setBrand, toast_ } = g;
  return (
    <Sheet title="Editar Hábito de Marca" onClose={close}>
      <FI label="Título" value={f.title||""} onChange={v=>F({title:v})}/>
      <FS label="Frequência" value={f.freq||"Semanal"} onChange={v=>F({freq:v})} opts={["Diário","Semanal","Mensal"].map(x=>({v:x,l:x}))}/>
      <FI label="XP" value={f.xp||15} onChange={v=>F({xp:v})} type="number"/>
      <Btn color="#ec4899" onClick={()=>{setBrand(b=>({...b,habits:b.habits.map(x=>x.id===f.id?{...x,title:f.title,freq:f.freq,xp:Number(f.xp)}:x)}));toast_("Atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}
