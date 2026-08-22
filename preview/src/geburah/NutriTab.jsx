// NutriTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). nutriSv/refExpanded/
// mealCollapsed/secCollapsed/aguaMl eram hoisted no shell só pra sobreviver ao remount
// da aba a cada render — agora que NutriTab é um componente de módulo estável, viram
// useState local normal.
import { useState, useContext } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, ORANGE, GREEN, BLUE, PURPLE, AMBER, MICRO_META, Sheet, FI, FTA, FS, Card, Btn, Badge, Bar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { CATS_AL, REFEICOES, REFEICAO_ITEM_CAP } from "./constants.js";
import { uid, todayS, fmt1, clamp, refeicaoPorHorario } from "./helpers.js";

export function NutriTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { alimentos, setAlimentos, receitas, setReceitas, logDieta, setLogDieta, todayLog, calcMacro, calHoje, protHoje, carbHoje, gordHoje,
    agua, setAgua, aguaHoje, aguaPct, metas, tdee, openSh, toast_ } = g;
  const [sv,setSv] = useState("hoje");
  const [refExpanded,setRefExpanded] = useState({});
  const [mealCollapsed,setMealCollapsed] = useState({});
  const [secCollapsed,setSecCollapsed] = useState({});
  const [aguaMl,setAguaMl] = useState(250);

  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"hoje",l:"Hoje"},{id:"biblioteca",l:"Alimentos"},{id:"receitas",l:"Receitas"}].map(s=>(
          <button key={s.id} onClick={()=>setSv(s.id)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:10,background:sv===s.id?"linear-gradient(135deg,"+ORANGE+"dd,"+ORANGE+"88)":C.b1,border:"none",color:sv===s.id?"#fff":C.muted}}>{s.l}</button>
        ))}
      </div>

      {sv==="hoje"&&(function HojeView(){
        const pastDays=[...new Set(logDieta.filter(l=>l.data!==todayS()).map(l=>l.data))].sort((a,b)=>b.localeCompare(a));
        const lastPastDay=pastDays[0];
        const repetirDia=()=>{
          const itens=logDieta.filter(l=>l.data===lastPastDay);
          setLogDieta(p=>[...p,...itens.map(l=>({...l,id:"ld"+uid(),data:todayS()}))]);
          toast_("Refeições de "+lastPastDay.split("-").reverse().join("/")+" repetidas",ORANGE);
        };
        const favoritos=alimentos.filter(a=>a.favorito);
        const todaysCopos=agua.copos.filter(c=>c.data===todayS());
        return(
        <div>
          {favoritos.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:6}}>ADIÇÃO RÁPIDA</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {favoritos.map(al=>(
                  <button key={al.id} onClick={()=>openSh("addRefeicao",{refeicao:refeicaoPorHorario(),alimentoId:al.id,unidade:al.porcao?al.porcao.label:"g",qtd:al.porcao?1:100,data:todayS()})}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:99,background:ORANGE+"14",border:"1px solid "+ORANGE+"44",color:ORANGE,fontWeight:700,fontSize:11,cursor:"pointer"}}>
                    <Ico n="star" size={11} filled color={ORANGE}/> {al.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Refeições</div>
            <div style={{display:"flex",gap:6}}>
              {todayLog.length===0&&lastPastDay&&<Btn sm full={false} outline color={ORANGE} onClick={repetirDia}><Ico n="refresh" size={11}/> Repetir</Btn>}
              <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addRefeicao",{refeicao:refeicaoPorHorario(),alimentoId:alimentos[0]?.id||"",qtd:100,data:todayS()})}><Ico n="plus" size={11}/> Registrar</Btn>
            </div>
          </div>
          {REFEICOES.map(ref=>{
            const items=todayLog.filter(l=>l.refeicao===ref);
            if(!items.length)return(
              <div key={ref} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.surface,border:"1px dashed "+C.b1,borderRadius:8,marginBottom:8}}>
                <span style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.5}}>{ref.toUpperCase()}</span>
                <span style={{fontSize:10,color:C.muted}}>—</span>
              </div>
            );
            const refCal=items.reduce((s,i)=>{const al=alimentos.find(a=>a.id===i.alimentoId);return al?s+al.cal100*i.qtd/100:s;},0);
            const collapsed=!!mealCollapsed[ref];
            const expanded=!!refExpanded[ref];
            const visible=expanded?items:items.slice(0,REFEICAO_ITEM_CAP);
            const hidden=items.length-visible.length;
            return(<Card key={ref} style={{marginBottom:8}}>
              <button onClick={()=>setMealCollapsed(p=>({...p,[ref]:!collapsed}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:collapsed?0:6}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:10,color:ORANGE,fontWeight:700}}>{ref.toUpperCase()}</span>
                  <span style={{fontSize:9,color:C.muted}}>{collapsed?"▾":"▴"}</span>
                </div>
                <Badge label={Math.round(refCal)+"kcal · "+items.length+(items.length===1?" item":" itens")} color={ORANGE}/>
              </button>
              {!collapsed&&(<>
              {visible.map(item=>{
                const al=alimentos.find(a=>a.id===item.alimentoId); if(!al)return null;
                return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid "+C.b1}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600}}>{al.name}</div>
                    <div style={{fontSize:9,color:C.muted}}>{item.qtdDisplay!=null?fmt1(item.qtdDisplay)+" "+item.unidadeDisplay:item.qtd+"g"} · {Math.round(al.cal100*item.qtd/100)}kcal · {Math.round(al.prot*item.qtd/100)}g prot</div>
                  </div>
                  <button onClick={()=>setLogDieta(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                </div>);
              })}
              {(hidden>0||expanded&&items.length>REFEICAO_ITEM_CAP)&&(
                <button onClick={()=>setRefExpanded(p=>({...p,[ref]:!expanded}))} style={{width:"100%",background:"none",border:"none",borderTop:"1px solid "+C.b1,cursor:"pointer",padding:"7px 0 0",marginTop:2,fontSize:10,color:ORANGE,fontWeight:700}}>
                  {expanded?"Ver menos ▴":"+"+hidden+" mais ▾"}
                </button>
              )}
              </>)}
            </Card>);
          })}

          {/* Água */}
          <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:12,marginTop:4,marginBottom:12}}>
            <button onClick={()=>setSecCollapsed(p=>({...p,agua:!p.agua}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <Ico n="droplet" size={11} color={ACCENT}/>
                <span style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1}}>ÁGUA</span>
                <span style={{fontSize:9,color:C.muted}}>{secCollapsed.agua?"▾":"▴"}</span>
              </div>
              <span style={{fontSize:9,color:C.muted}}>meta {agua.meta/1000}L</span>
            </button>
            <div style={{fontSize:18,fontWeight:900,color:ACCENT}}>{Math.round(aguaHoje/100)/10}L <span style={{fontSize:10,color:C.muted,fontWeight:400}}>/ {agua.meta/1000}L</span></div>
            <Bar value={aguaPct} color={ACCENT} height={3}/>
            {!secCollapsed.agua&&(<div style={{marginTop:10}}>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <input type="number" value={aguaMl} min={0} step={50} onChange={e=>setAguaMl(Number(e.target.value))}
                  style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                <button onClick={()=>{if(aguaMl>0){setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:todayS(),ml:aguaMl}]}));toast_("+"+aguaMl+"ml",ACCENT);}}}
                  style={{padding:"7px 14px",borderRadius:8,background:ACCENT,border:"none",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>Adicionar</button>
              </div>
              {todaysCopos.length===0
                ? <div style={{textAlign:"center",padding:"8px 0",color:C.muted,fontSize:11}}>Nenhum registro ainda</div>
                : todaysCopos.map((c,i)=>(
                  <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:i>0?"1px solid "+C.b1:"none"}}>
                    <span style={{fontSize:11,fontWeight:600}}>{i+1}º copo · {c.ml}ml</span>
                    <button onClick={()=>setAgua(a=>({...a,copos:a.copos.filter(x=>x.id!==c.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                  </div>
                ))
              }
            </div>)}
          </div>

          {/* Acompanhamento de Nutrientes — macros + micronutrientes no mesmo card, mesmo estilo de gauge */}
          <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:12,marginBottom:12}}>
            <button onClick={()=>setSecCollapsed(p=>({...p,nutrientes:!p.nutrientes}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:secCollapsed.nutrientes?0:8}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{fontSize:11,fontWeight:800,color:C.text}}>Acompanhamento de Nutrientes</div>
                <span style={{fontSize:9,color:C.muted}}>{secCollapsed.nutrientes?"▾":"▴"}</span>
              </div>
              <div style={{fontSize:9,color:C.muted}}>TDEE estimado: {tdee}kcal</div>
            </button>
            {!secCollapsed.nutrientes&&(<>
            {/* Estourar a meta vira vermelho (ACCENT) em qualquer nutriente, macro ou micro —
                sinal único e consistente de "passou do valor de referência", sem julgar se
                isso é bom ou ruim pra cada caso específico (ex: sódio é sempre ruim passar,
                proteína às vezes é intencional; a barra só avisa, quem interpreta é o usuário). */}
            {[{l:"Calorias",v:Math.round(calHoje),m:metas.cal,u:"kcal",c:ACCENT},{l:"Proteína",v:Math.round(protHoje),m:metas.prot,u:"g",c:GREEN},{l:"Carb",v:Math.round(carbHoje),m:metas.carb,u:"g",c:AMBER},{l:"Gordura",v:Math.round(gordHoje),m:metas.gord,u:"g",c:PURPLE}].map(macro=>{
              const over=macro.m>0&&macro.v>macro.m;
              const pct=macro.m>0?clamp(Math.round(macro.v/macro.m*100),0,100):0;
              const color=over?ACCENT:macro.c;
              return(<div key={macro.l} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:11}}>{macro.l}{over&&<span style={{color:ACCENT,fontWeight:700}}> · acima do limite</span>}</span>
                  <span style={{fontSize:11,fontWeight:700,color}}>{macro.v}<span style={{fontSize:9,color:C.muted}}>/{macro.m}{macro.u}</span></span>
                </div>
                <Bar value={pct} color={color} height={4}/>
              </div>);
            })}
            <div style={{height:1,background:C.b1,margin:"10px 0"}}/>
            {[{l:"Fibra",v:calcMacro("fibra"),m:MICRO_META.fibra,u:"g",c:GREEN},{l:"Sódio",v:calcMacro("sodio"),m:MICRO_META.sodio,u:"mg",c:PURPLE},{l:"Cálcio",v:calcMacro("calcio"),m:MICRO_META.calcio,u:"mg",c:BLUE},{l:"Ferro",v:calcMacro("ferro"),m:MICRO_META.ferro,u:"mg",c:AMBER},{l:"Vitamina C",v:calcMacro("vitC"),m:MICRO_META.vitC,u:"mg",c:ORANGE}].map(micro=>{
              const over=micro.m>0&&micro.v>micro.m;
              const pct=micro.m>0?clamp(Math.round(micro.v/micro.m*100),0,100):0;
              const color=over?ACCENT:micro.c;
              return(<div key={micro.l} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:11}}>{micro.l}{over&&<span style={{color:ACCENT,fontWeight:700}}> · acima do limite</span>}</span>
                  <span style={{fontSize:11,fontWeight:700,color}}>{fmt1(micro.v)}<span style={{fontSize:9,color:C.muted}}>/{micro.m}{micro.u}</span></span>
                </div>
                <Bar value={pct} color={color} height={4}/>
              </div>);
            })}
            </>)}
          </div>
        </div>
        );
      })()}

      {sv==="biblioteca"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Alimentos</div>
            <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addAlimento",{name:"",cat:CATS_AL[0],cal100:0,prot:0,carb:0,gord:0})}><Ico n="plus" size={11}/> Alimento</Btn>
          </div>
          {CATS_AL.map(cat=>{
            const als=alimentos.filter(a=>a.cat===cat); if(!als.length)return null;
            return(<div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:ORANGE,fontWeight:700,letterSpacing:1,marginBottom:6}}>{cat.toUpperCase()}</div>
              {als.map(al=>(
                <div key={al.id} style={{padding:"8px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                        <div style={{fontSize:12,fontWeight:600}}>{al.name}</div>
                        {al.porcao&&<Badge label={al.porcao.label+" "+al.porcao.gramas+"g"} color={C.muted}/>}
                      </div>
                      <div style={{fontSize:9,color:C.muted}}>Por 100g: {al.cal100}kcal · {al.prot}g P · {al.carb}g C · {al.gord}g G</div>
                      {(al.fibra>0||al.sodio>0||al.calcio>0||al.ferro>0||al.vitC>0)&&<div style={{fontSize:9,color:C.muted,marginTop:1}}>Fibra {al.fibra||0}g · Sódio {al.sodio||0}mg · Cálcio {al.calcio||0}mg · Ferro {al.ferro||0}mg · VitC {al.vitC||0}mg</div>}
                    </div>
                    <div style={{display:"flex",gap:2,alignItems:"center",flexShrink:0}}>
                      <button onClick={()=>setAlimentos(p=>p.map(x=>x.id===al.id?{...x,favorito:!x.favorito}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}} title="Favoritar">
                        <Ico n="star" size={15} filled={al.favorito} color={al.favorito?AMBER:C.b2}/>
                      </button>
                      <button onClick={()=>setAlimentos(p=>p.filter(x=>x.id!==al.id))} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>);
          })}
        </div>
      )}

      {sv==="receitas"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Receitas</div>
            <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addReceita",{name:"",desc:"",steps:[""]})}><Ico n="plus" size={11}/> Receita</Btn>
          </div>
          {receitas.map(r=>{
            const totalCal=r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al.cal100*ing.qtd/100):s;},0);
            const totalProt=r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al.prot*ing.qtd/100):s;},0);
            return(
              <Card key={r.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800}}>{r.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{r.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <Badge label={Math.round(totalCal)+"kcal"} color={ORANGE}/>
                    <button onClick={()=>setReceitas(p=>p.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                  </div>
                </div>
                {r.ingredientes.map((ing,i)=>{
                  const al=alimentos.find(a=>a.id===ing.alimentoId);
                  return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,padding:"4px 0",borderTop:"1px solid "+C.b1}}>
                    <span>{al?.name||"?"}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:C.muted}}>{ing.qtdDisplay!=null?fmt1(ing.qtdDisplay)+" "+ing.unidadeDisplay:ing.qtd+"g"}</span>
                      <button onClick={()=>setReceitas(p=>p.map(rc=>rc.id===r.id?{...rc,ingredientes:rc.ingredientes.filter((_,j)=>j!==i)}:rc))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={10} color={C.muted}/></button>
                    </div>
                  </div>);
                })}
                {(r.steps||[]).length>0&&(
                  <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.b1}}>
                    <div style={{fontSize:9,color:ORANGE,fontWeight:700,marginBottom:4}}>MODO DE PREPARO</div>
                    {r.steps.map((step,i)=><div key={i} style={{fontSize:10,color:C.muted,marginBottom:3}}>{i+1}. {step}</div>)}
                  </div>
                )}
                <div style={{marginTop:6,fontSize:9,color:ORANGE,fontWeight:700}}>{Math.round(totalCal)}kcal · {Math.round(totalProt)}g proteína</div>
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <Btn sm outline color={ORANGE} style={{flex:1}} onClick={()=>openSh("addIngrediente",{receitaId:r.id,alimentoId:alimentos[0]?.id||"",qtd:100})}><Ico n="plus" size={11}/> Ingrediente</Btn>
                  <Btn sm outline color={ORANGE} style={{flex:1}} onClick={()=>{r.ingredientes.forEach(ing=>setLogDieta(p=>[...p,{id:"ld"+uid(),data:todayS(),refeicao:refeicaoPorHorario(),alimentoId:ing.alimentoId,qtd:ing.qtd,...(ing.qtdDisplay!=null?{qtdDisplay:ing.qtdDisplay,unidadeDisplay:ing.unidadeDisplay}:{})}]));toast_("Adicionado ao diário!",ORANGE);}}><Ico n="plus" size={11}/> Ao diário</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AddAlimentoSheet(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { f, F, close, setAlimentos, toast_ } = g;
  return(
    <Sheet title="Novo Alimento" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Peito de frango"/>
      <FS label="Categoria" value={f.cat||CATS_AL[0]} onChange={v=>F({cat:v})} opts={CATS_AL.map(c=>({v:c,l:c}))}/>
      <div style={{fontSize:10,color:C.muted,marginBottom:8,fontWeight:700}}>MACROS POR 100G</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Calorias" value={f.cal100||0} onChange={v=>F({cal100:v})} type="number"/>
        <FI label="Proteína (g)" value={f.prot||0} onChange={v=>F({prot:v})} type="number" step={0.1}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Carboidrato (g)" value={f.carb||0} onChange={v=>F({carb:v})} type="number" step={0.1}/>
        <FI label="Gordura (g)" value={f.gord||0} onChange={v=>F({gord:v})} type="number" step={0.1}/>
      </div>
      <div style={{fontSize:10,color:C.muted,margin:"10px 0 8px",fontWeight:700}}>MICRONUTRIENTES POR 100G (OPCIONAL)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Fibra (g)" value={f.fibra||0} onChange={v=>F({fibra:v})} type="number" step={0.1}/>
        <FI label="Sódio (mg)" value={f.sodio||0} onChange={v=>F({sodio:v})} type="number"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Cálcio (mg)" value={f.calcio||0} onChange={v=>F({calcio:v})} type="number"/>
        <FI label="Ferro (mg)" value={f.ferro||0} onChange={v=>F({ferro:v})} type="number" step={0.1}/>
      </div>
      <FI label="Vitamina C (mg)" value={f.vitC||0} onChange={v=>F({vitC:v})} type="number" step={0.1}/>
      <div style={{fontSize:10,color:C.muted,margin:"10px 0 8px",fontWeight:700}}>PORÇÃO PERSONALIZADA (OPCIONAL)</div>
      <div style={{fontSize:9,color:C.muted,marginTop:-4,marginBottom:8}}>Deixe em branco pra só registrar em gramas. Ex: "unidade" com 118g pra banana.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <FI label="Nome da porção" value={f.porcaoLabel||""} onChange={v=>F({porcaoLabel:v})} placeholder="unidade, fatia, xícara..."/>
        <FI label="Peso da porção (g)" value={f.porcaoGramas||0} onChange={v=>F({porcaoGramas:v})} type="number" step={0.1}/>
      </div>
      <Btn color={ORANGE} onClick={()=>{
        if(!f.name)return;
        const porcao=(f.porcaoLabel&&Number(f.porcaoGramas)>0)?{label:f.porcaoLabel,gramas:Number(f.porcaoGramas)}:null;
        setAlimentos(p=>[...p,{id:"al"+uid(),name:f.name,cat:f.cat||CATS_AL[0],cal100:Number(f.cal100)||0,prot:Number(f.prot)||0,carb:Number(f.carb)||0,gord:Number(f.gord)||0,
          fibra:Number(f.fibra)||0,sodio:Number(f.sodio)||0,calcio:Number(f.calcio)||0,ferro:Number(f.ferro)||0,vitC:Number(f.vitC)||0,
          ...(porcao?{porcao}:{}),favorito:false}]);
        toast_("Adicionado",ORANGE);close();
      }}>Adicionar</Btn>
    </Sheet>
  );
}

export function AddRefeicaoSheet(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { f, F, close, alimentos, setLogDieta, toast_ } = g;
  const al=alimentos.find(a=>a.id===f.alimentoId);
  const unidadeAtiva=f.unidade||"g";
  const usaPorcao=al?.porcao&&unidadeAtiva===al.porcao.label;
  const qtdGramas=usaPorcao?Number(f.qtd||0)*al.porcao.gramas:Number(f.qtd||0);
  return(
    <Sheet title="Registrar Refeição" onClose={close}>
      <FS label="Refeição" value={f.refeicao||refeicaoPorHorario()} onChange={v=>F({refeicao:v})} opts={REFEICOES.map(r=>({v:r,l:r}))}/>
      <FS label="Alimento" value={f.alimentoId||""} onChange={v=>F({alimentoId:v,unidade:"g",qtd:100})} opts={[{v:"",l:"Selecione..."},...alimentos.slice().sort((a,b)=>(b.favorito?1:0)-(a.favorito?1:0)).map(a=>({v:a.id,l:(a.favorito?"★ ":"")+a.name+" ("+a.cal100+"kcal/100g)"}))]}/>
      {al?.porcao&&(<div style={{display:"flex",gap:6,marginBottom:11}}>
        {[{v:"g",l:"Gramas"},{v:al.porcao.label,l:al.porcao.label.charAt(0).toUpperCase()+al.porcao.label.slice(1)+" ("+al.porcao.gramas+"g)"}].map(o=>(
          <button key={o.v} onClick={()=>F({unidade:o.v,qtd:o.v==="g"?100:1})} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:11,border:"1.5px solid "+(unidadeAtiva===o.v?ORANGE:C.b2),background:unidadeAtiva===o.v?ORANGE+"18":"transparent",color:unidadeAtiva===o.v?ORANGE:C.text}}>{o.l}</button>
        ))}
      </div>)}
      <FI label={usaPorcao?"Quantidade ("+al.porcao.label+")":"Quantidade (g)"} value={f.qtd||(usaPorcao?1:100)} onChange={v=>F({qtd:v})} type="number" min={usaPorcao?0.5:1} step={usaPorcao?0.5:1}/>
      {al&&<div style={{background:ORANGE+"11",borderRadius:8,padding:"8px 12px",marginBottom:11,fontSize:11}}><span style={{fontWeight:700,color:ORANGE}}>{Math.round(al.cal100*qtdGramas/100)} kcal</span> · {Math.round(al.prot*qtdGramas/100)}g prot · {Math.round(al.carb*qtdGramas/100)}g carb{usaPorcao&&<span style={{color:C.muted}}> · {Math.round(qtdGramas)}g</span>}</div>}
      <Btn color={ORANGE} onClick={()=>{
        if(!f.alimentoId||!qtdGramas)return;
        setLogDieta(p=>[...p,{id:"ld"+uid(),data:f.data||todayS(),refeicao:f.refeicao||refeicaoPorHorario(),alimentoId:f.alimentoId,qtd:qtdGramas,
          ...(usaPorcao?{qtdDisplay:Number(f.qtd),unidadeDisplay:al.porcao.label}:{})}]);
        toast_("Registrado",ORANGE);close();
      }}>Registrar</Btn>
    </Sheet>
  );
}

export function AddReceitaSheet(){
  const g = useGeburah();
  const { f, F, close, setReceitas, toast_ } = g;
  return(
    <Sheet title="Nova Receita" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Bowl proteico"/>
      <FTA label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} rows={2}/>
      <Btn color={ORANGE} onClick={()=>{if(!f.name)return;setReceitas(p=>[...p,{id:"rec"+uid(),name:f.name,desc:f.desc||"",ingredientes:[],steps:[]}]);toast_("Receita criada",ORANGE);close();}}>Criar</Btn>
    </Sheet>
  );
}

export function AddIngredienteSheet(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { f, F, close, alimentos, setReceitas, toast_ } = g;
  const al=alimentos.find(a=>a.id===f.alimentoId);
  const unidadeAtiva=f.unidade||"g";
  const usaPorcao=al?.porcao&&unidadeAtiva===al.porcao.label;
  const qtdGramas=usaPorcao?Number(f.qtd||0)*al.porcao.gramas:Number(f.qtd||0);
  return(
    <Sheet title="Adicionar Ingrediente" onClose={close}>
      <FS label="Alimento" value={f.alimentoId||""} onChange={v=>F({alimentoId:v,unidade:"g",qtd:100})} opts={alimentos.slice().sort((a,b)=>(b.favorito?1:0)-(a.favorito?1:0)).map(a=>({v:a.id,l:(a.favorito?"★ ":"")+a.name+" ("+a.cal100+"kcal/100g)"}))}/>
      {al?.porcao&&(<div style={{display:"flex",gap:6,marginBottom:11}}>
        {[{v:"g",l:"Gramas"},{v:al.porcao.label,l:al.porcao.label.charAt(0).toUpperCase()+al.porcao.label.slice(1)+" ("+al.porcao.gramas+"g)"}].map(o=>(
          <button key={o.v} onClick={()=>F({unidade:o.v,qtd:o.v==="g"?100:1})} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:11,border:"1.5px solid "+(unidadeAtiva===o.v?ORANGE:C.b2),background:unidadeAtiva===o.v?ORANGE+"18":"transparent",color:unidadeAtiva===o.v?ORANGE:C.text}}>{o.l}</button>
        ))}
      </div>)}
      <FI label={usaPorcao?"Quantidade ("+al.porcao.label+")":"Quantidade (g)"} value={f.qtd||(usaPorcao?1:100)} onChange={v=>F({qtd:v})} type="number" min={usaPorcao?0.5:1} step={usaPorcao?0.5:1}/>
      {al&&<div style={{background:ORANGE+"11",borderRadius:8,padding:"8px 12px",marginBottom:11,fontSize:11}}><span style={{fontWeight:700,color:ORANGE}}>{Math.round(al.cal100*qtdGramas/100)} kcal</span> · {Math.round(al.prot*qtdGramas/100)}g prot{usaPorcao&&<span style={{color:C.muted}}> · {Math.round(qtdGramas)}g</span>}</div>}
      <Btn color={ORANGE} onClick={()=>{
        if(!f.alimentoId||!qtdGramas)return;
        setReceitas(p=>p.map(r=>r.id===f.receitaId?{...r,ingredientes:[...r.ingredientes,{alimentoId:f.alimentoId,qtd:qtdGramas,
          ...(usaPorcao?{qtdDisplay:Number(f.qtd),unidadeDisplay:al.porcao.label}:{})}]}:r));
        toast_("Adicionado",ORANGE);close();
      }}>Adicionar</Btn>
    </Sheet>
  );
}
