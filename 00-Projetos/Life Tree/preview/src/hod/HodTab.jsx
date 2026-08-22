// HodTab (dashboard), extraído de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). Diferente do Geburah, esta aba
// PÔDE ser extraída (só ~11 identificadores, não ~35) — ver seção "Item 5" do plano.
import { useContext } from "react";
import { useHod } from "./context.js";
import { ThemeCtx, ACCENT, Card, ProgressBar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { typeColor } from "./helpers.js";

export function HodTab(){
  const C = useContext(ThemeCtx);
  const g = useHod();
  const { carHabits, setCarHabits, projects, setProjects, brand, setBrand, setXp, setTab, carGoals, setCarGoals, setPendingAch,
    carScore, projetosScore, marcaScore, hodScore } = g;
  const hs = hodScore();
  const modules = [
    {l:"Carreira",     v:carScore(),      c:ACCENT,    icon:"monitor", w:35, tab:"carreira"},
    {l:"Projetos",     v:projetosScore(), c:"#8b5cf6", icon:"rocket",  w:45, tab:"projetos"},
    {l:"Marca Pessoal",v:marcaScore(),    c:"#ec4899", icon:"globe",   w:20, tab:"marca"},
  ];
  const allHabits = [
    ...carHabits.map(h=>({...h,mod:"Carreira",c:ACCENT,src:"car"})),
    ...projects.flatMap(p=>(p.habits||[]).map(h=>({...h,mod:p.name,c:typeColor(p.type),src:"proj",projId:p.id}))),
    ...brand.habits.map(h=>({...h,mod:"Marca",c:"#ec4899",src:"brand"})),
  ];
  return (
    <div style={{animation:"slideUp .3s ease"}}>
      <Card style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>HOD — DESENVOLVIMENTO PROFISSIONAL</div>
            <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{hs}<span style={{fontSize:18}}>%</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:4}}>
            {modules.map(m=>(
              <div key={m.l} onClick={()=>setTab(m.tab)} style={{background:C.card,borderRadius:8,padding:"5px 6px",textAlign:"center",cursor:"pointer",border:"1px solid "+m.c+"22"}}>
                <div style={{fontSize:7,color:C.muted}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:900,color:m.c}}>{m.v}%</div>
              </div>
            ))}
          </div>
        </div>
        <ProgressBar value={hs} color={"linear-gradient(90deg,"+ACCENT+",#fbbf24)"} height={6}/>
      </Card>

      <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14,marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>HÁBITOS</div>
          <span style={{fontSize:9,color:ACCENT,fontWeight:700}}>{allHabits.filter(h=>h.done).length}/{allHabits.length}</span>
        </div>
        {allHabits.map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}>
            <button onClick={()=>{
              if(h.src==="car"){ if(!h.done)setXp(x=>x+h.xp); setCarHabits(p=>p.map(x=>x.id===h.id?{...x,done:!x.done}:x)); }
              else if(h.src==="proj"){ if(!h.done)setXp(x=>x+h.xp); setProjects(p=>p.map(pr=>pr.id===h.projId?{...pr,habits:pr.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)}:pr)); }
              else { if(!h.done)setXp(x=>x+h.xp); setBrand(b=>({...b,habits:b.habits.map(x=>x.id===h.id?{...x,done:!x.done}:x)})); }
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
          <span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{carGoals.filter(g=>g.done).length}/{carGoals.length}</span>
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
}
