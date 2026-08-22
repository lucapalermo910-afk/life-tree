// ConfigTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { useContext } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, ORANGE, Sheet, FI, FS, Btn } from "./theme.js";
import { Ico } from "./icons.jsx";
import { GRUPOS } from "./constants.js";

export function ConfigTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { gebScore, treinoScore, dietaScore, pesoScore, perfil, openSh, tdee, metas, agua, rotinasTreino, setRotinasTreino, exercicios, setExercicios, toast_ } = g;
  const Row=({title,sub,onEdit,onDel})=>(<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{title}</div>{sub&&<div style={{fontSize:9,color:C.muted}}>{sub}</div>}</div>
    {onEdit&&<button onClick={onEdit} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button>}
    {onDel&&<button onClick={onDel} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>}
  </div>);
  const Sec=({title,addLabel,onAdd,children})=>(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span style={{fontSize:12,fontWeight:700}}>{title}</span>
      {onAdd&&<Btn sm full={false} onClick={onAdd}><Ico n="plus" size={11}/> {addLabel}</Btn>}
    </div>
    {children}
  </div>);
  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{background:ACCENT+"11",border:"2px solid "+ACCENT+"33",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE GEBURAH</div>
        <div style={{fontSize:42,fontWeight:900,color:ACCENT,lineHeight:1}}>{gebScore}<span style={{fontSize:16}}>%</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
          {[{l:"Treino 40%",v:treinoScore},{l:"Nutrição 30%",v:dietaScore},{l:"Peso 30%",v:pesoScore}].map(s=>(
            <div key={s.l} style={{background:C.surface,borderRadius:8,padding:"6px"}}>
              <div style={{fontSize:8,color:C.muted}}>{s.l}</div>
              <div style={{fontSize:14,fontWeight:800,color:ACCENT}}>{s.v}%</div>
            </div>
          ))}
        </div>
      </div>

      <Sec title="Perfil e TDEE" addLabel="Editar" onAdd={()=>openSh("editPerfil",{...perfil})}>
        <Row title={perfil.nome} sub={perfil.peso+"kg · "+perfil.altura+"cm · "+perfil.idade+"anos"} onEdit={()=>openSh("editPerfil",{...perfil})}/>
        <div style={{padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
          <div style={{fontSize:10,color:C.muted}}>TDEE estimado</div>
          <div style={{fontSize:18,fontWeight:900,color:ORANGE}}>{tdee} <span style={{fontSize:10}}>kcal/dia</span></div>
          <div style={{fontSize:9,color:C.muted}}>Nível: {perfil.atividade}</div>
        </div>
      </Sec>

      <Sec title="Metas Nutricionais" addLabel="Editar" onAdd={()=>openSh("editMetas",{...metas})}>
        {[["Calorias diárias",metas.cal+" kcal"],["Proteína",metas.prot+"g"],["Carboidrato",metas.carb+"g"],["Gordura",metas.gord+"g"]].map(([t,s])=>(
          <Row key={t} title={t} sub={s} onEdit={()=>openSh("editMetas",{...metas})}/>
        ))}
      </Sec>

      <Sec title="Meta de Água" addLabel="Editar" onAdd={()=>openSh("editAgua",{meta:agua.meta})}>
        <Row title="Meta diária" sub={agua.meta+"ml ("+Math.round(agua.meta/250)+" copos)"} onEdit={()=>openSh("editAgua",{meta:agua.meta})}/>
      </Sec>

      <Sec title="Rotinas de Treino" addLabel="Adicionar" onAdd={()=>openSh("addRotina",{name:"",dia:"Segunda"})}>
        {rotinasTreino.map(r=><Row key={r.id} title={r.name} sub={r.dias.join(", ")+" · "+r.exercicios.length+" exercícios"} onDel={()=>{setRotinasTreino(p=>p.filter(x=>x.id!==r.id));toast_("Removido");}}/>)}
      </Sec>

      <Sec title="Exercícios" addLabel="Adicionar" onAdd={()=>openSh("addExercicio",{name:"",grupo:GRUPOS[0],equip:"",inst:""})}>
        {exercicios.slice(0,5).map(e=><Row key={e.id} title={e.name} sub={e.grupo+" · "+e.equip} onDel={()=>{setExercicios(p=>p.filter(x=>x.id!==e.id));toast_("Removido");}}/>)}
        {exercicios.length>5&&<div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"4px 0"}}>+{exercicios.length-5} mais na biblioteca</div>}
      </Sec>
    </div>
  );
}

export function EditMetasSheet(){
  const g = useGeburah();
  const { f, F, close, tdee, setMetas, toast_ } = g;
  return(
    <Sheet title="Metas Nutricionais" onClose={close}>
      <div style={{background:ORANGE+"11",borderRadius:9,padding:"8px 12px",marginBottom:12,fontSize:11,color:ORANGE}}>TDEE estimado: <strong>{tdee} kcal</strong></div>
      <FI label="Calorias (kcal)" value={f.cal||2200} onChange={v=>F({cal:v})} type="number" hint={"Déficit sugerido: "+(tdee-300)+" kcal"}/>
      <FI label="Proteína (g)" value={f.prot||160} onChange={v=>F({prot:v})} type="number"/>
      <FI label="Carboidrato (g)" value={f.carb||220} onChange={v=>F({carb:v})} type="number"/>
      <FI label="Gordura (g)" value={f.gord||70} onChange={v=>F({gord:v})} type="number"/>
      <Btn color={ACCENT} onClick={()=>{setMetas({cal:Number(f.cal),prot:Number(f.prot),carb:Number(f.carb),gord:Number(f.gord)});toast_("Metas atualizadas");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditPerfilSheet(){
  const g = useGeburah();
  const { f, F, close, setPerfil, toast_ } = g;
  return(
    <Sheet title="Meu Perfil" onClose={close}>
      <FI label="Nome" value={f.nome||""} onChange={v=>F({nome:v})}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Peso (kg)" value={f.peso||0} onChange={v=>F({peso:v})} type="number" step={0.1}/>
        <FI label="Altura (cm)" value={f.altura||175} onChange={v=>F({altura:v})} type="number"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Idade" value={f.idade||25} onChange={v=>F({idade:v})} type="number"/>
        <FS label="Sexo" value={f.sexo||"M"} onChange={v=>F({sexo:v})} opts={[{v:"M",l:"Masculino"},{v:"F",l:"Feminino"}]}/>
      </div>
      <FS label="Nível de atividade" value={f.atividade||"moderado"} onChange={v=>F({atividade:v})} opts={[{v:"sedentario",l:"Sedentário"},{v:"leve",l:"Leve (1-3x/sem)"},{v:"moderado",l:"Moderado (3-5x/sem)"},{v:"intenso",l:"Intenso (6-7x/sem)"},{v:"muito_intenso",l:"Muito intenso"}]}/>
      <Btn color={ACCENT} onClick={()=>{setPerfil({nome:f.nome,peso:Number(f.peso),altura:Number(f.altura),idade:Number(f.idade),sexo:f.sexo,atividade:f.atividade});toast_("Perfil atualizado");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditAguaSheet(){
  const g = useGeburah();
  const { f, F, close, setAgua, toast_ } = g;
  return(
    <Sheet title="Meta de Água" onClose={close}>
      <FI label="Meta diária (ml)" value={f.meta||3000} onChange={v=>F({meta:v})} type="number" step={250} hint={"≈ "+Math.round((f.meta||3000)/250)+" copos de 250ml"}/>
      <Btn color={ACCENT} onClick={()=>{setAgua(a=>({...a,meta:Number(f.meta)||3000}));toast_("Meta de água atualizada",ACCENT);close();}}>Salvar</Btn>
    </Sheet>
  );
}
