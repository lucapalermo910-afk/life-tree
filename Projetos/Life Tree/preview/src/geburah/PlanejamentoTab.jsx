// PlanejamentoTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { useContext } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, ORANGE, Sheet, FS, Badge, Btn } from "./theme.js";
import { Ico } from "./icons.jsx";
import { REFEICOES } from "./constants.js";
import { todayS } from "./helpers.js";

const DIAS_COMPLETOS=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export function PlanejamentoTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { rotinasTreino, setRotinasTreino, logTreino, planSem, alimentos, openSh } = g;
  // Reatribui qual rotina cai em qual dia da semana — "dias" vive dentro de cada rotina
  // (rotinasTreino[].dias), não como um mapa dia→rotina separado, então reatribuir precisa
  // tirar o dia de quem tinha antes e colocar em quem recebeu agora (nunca deixa duas
  // rotinas reclamando o mesmo dia).
  const setTreinoDoDia = (diaCompleto,novaRotinaId) => {
    setRotinasTreino(p=>p.map(r=>{
      const temHoje=r.dias.includes(diaCompleto);
      if(novaRotinaId&&r.id===novaRotinaId) return temHoje?r:{...r,dias:[...r.dias,diaCompleto]};
      return temHoje?{...r,dias:r.dias.filter(dd=>dd!==diaCompleto)}:r;
    }));
  };
  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Planejamento Semanal</div>
      {Array.from({length:7},(_,i)=>{
        const d=new Date(); d.setDate(d.getDate()+i);
        const ds=d.toISOString().slice(0,10);
        const diaCompleto=DIAS_COMPLETOS[d.getDay()];
        const diasNome=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
        const isToday=ds===todayS();
        const rotinaDoDia=rotinasTreino.find(r=>r.dias.includes(diaCompleto));
        const treinoFeito=rotinaDoDia&&logTreino.some(l=>l.data===ds&&l.rotinaId===rotinaDoDia.id&&l.horaFim);
        return(
          <div key={ds} style={{marginBottom:10}}>
            <div style={{fontSize:10,color:isToday?ORANGE:C.muted,fontWeight:700,marginBottom:6}}>{diasNome.toUpperCase()} {ds.slice(5)} {isToday&&"— HOJE"}</div>
            {/* Treino do dia — resolve o gap "planejamento semanal não enxerga o treino":
                dieta (REFEICOES abaixo) e treino (rotinasTreino[].dias) viviam em duas
                visões separadas dentro do mesmo módulo; agora aparecem juntos por dia. */}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:C.card,border:"1px solid "+(treinoFeito?ACCENT+"55":C.b1),borderRadius:8,marginBottom:4}}>
              <div style={{fontSize:9,color:C.muted,width:76,flexShrink:0,lineHeight:1.2}}>Treino</div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:5}}>
                {rotinaDoDia?(<>
                  <Badge label={rotinaDoDia.name} color={ACCENT}/>
                  {treinoFeito&&<span style={{fontSize:9,color:ACCENT,fontWeight:700}}>✓ feito</span>}
                </>):(<span style={{fontSize:9,color:C.muted}}>Descanso</span>)}
              </div>
              <div style={{marginBottom:-11,width:90,flexShrink:0}}>
                <FS label="" value={rotinaDoDia?.id||""} onChange={v=>setTreinoDoDia(diaCompleto,v)} opts={[{v:"",l:"Descanso"},...rotinasTreino.map(r=>({v:r.id,l:r.name}))]}/>
              </div>
            </div>
            {REFEICOES.map(ref=>{
              const key=ds+"_"+ref;
              const ids=planSem[key]||[];
              return(
                <div key={ref} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:C.card,border:"1px solid "+C.b1,borderRadius:8,marginBottom:4}}>
                  <div style={{fontSize:9,color:C.muted,width:76,flexShrink:0,lineHeight:1.2}}>{ref}</div>
                  <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:3}}>
                    {ids.map(id=>{const al=alimentos.find(a=>a.id===id);return al?<Badge key={id} label={al.name} color={ORANGE}/>:null;})}
                    {ids.length===0&&<span style={{fontSize:9,color:C.muted}}>—</span>}
                  </div>
                  <button onClick={()=>openSh("planRefeicao",{planKey:key,ids:[...ids]})} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="plus" size={12} color={ORANGE}/></button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function PlanRefeicaoSheet(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { f, F, close, alimentos, setPlanSem, toast_ } = g;
  return(
    <Sheet title="Planejar Refeição" onClose={close}>
      <div style={{marginBottom:12}}>
        {(f.ids||[]).map(id=>{const al=alimentos.find(a=>a.id===id);return al?<div key={id} style={{display:"flex",justifyContent:"space-between",padding:"6px 8px",background:C.surface,borderRadius:8,marginBottom:4}}>
          <span style={{fontSize:11}}>{al.name}</span>
          <button onClick={()=>F({ids:(f.ids||[]).filter(x=>x!==id)})} style={{background:"none",border:"none",cursor:"pointer"}}><Ico n="x" size={11} color={C.muted}/></button>
        </div>:null;})}
      </div>
      <FS label="Adicionar alimento" value="" onChange={v=>{if(v&&!(f.ids||[]).includes(v))F({ids:[...(f.ids||[]),v]});}} opts={[{v:"",l:"Selecione..."},...alimentos.map(a=>({v:a.id,l:a.name}))]}/>
      <Btn color={ORANGE} onClick={()=>{setPlanSem(p=>({...p,[f.planKey]:f.ids||[]}));toast_("Planejamento salvo",ORANGE);close();}}>Salvar</Btn>
    </Sheet>
  );
}
