// NutriTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). nutriSv/refExpanded/
// mealCollapsed/secCollapsed/aguaMl eram hoisted no shell só pra sobreviver ao remount
// da aba a cada render — agora que NutriTab é um componente de módulo estável, viram
// useState local normal.
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, ORANGE, GREEN, BLUE, PURPLE, AMBER, MICRO_META, Sheet, FI, FTA, FS, Card, Btn, Badge, Bar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { CATS_AL, REFEICOES, REFEICAO_ITEM_CAP, UNIDADES_MEDIDA, TAMANHOS_PORCAO } from "./constants.js";
import { uid, todayS, fmt1, clamp, refeicaoPorHorario, diaSemanaDe, fmtDDMMAA, dateStrOffset, rotuloDia } from "./helpers.js";

export function NutriTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { alimentos, setAlimentos, receitas, setReceitas, logDieta, setLogDieta,
    agua, setAgua, metas, tdee, openSh, toast_ } = g;
  // "Diário"/"Alimentos" (31/08/2026) — a aba "Receitas" que existia aqui antes não volta:
  // registrar/ver/editar receita já tem lugar próprio (filtro "Receitas" na busca de
  // alimento + tela de detalhe). "Alimentos" volta como aba dedicada de gerenciar a
  // biblioteca (criar/favoritar/excluir) — usuário não queria isso dentro do fluxo de busca.
  const [sv,setSv] = useState("diario");
  const [bibCat,setBibCat] = useState(null);
  const [refExpanded,setRefExpanded] = useState({});
  const [secCollapsed,setSecCollapsed] = useState({});
  const [microsExpanded,setMicrosExpanded] = useState(false);
  const [diaOffset,setDiaOffset] = useState(0);
  const [aguaMl,setAguaMl] = useState(250);

  // Fluxo de registrar alimento (31/08/2026, pedido do usuário) — tela cheia em vez de
  // modal: card de refeição abre a busca (addCtx guarda refeição+data-alvo), escolher um
  // alimento abre o detalhe/porção (addAlimentoId). Estado fica no NutriTab (não em telas
  // separadas) só pra sobreviver ao "voltar" sem perder o texto já digitado na busca.
  const [addCtx,setAddCtx] = useState(null);
  const [addAlimentoId,setAddAlimentoId] = useState(null);
  const [addReceitaId,setAddReceitaId] = useState(null);
  const [buscaQuery,setBuscaQuery] = useState("");
  const [buscaFiltro,setBuscaFiltro] = useState("recentes");
  const [addQtd,setAddQtd] = useState(100);
  const [addUnidade,setAddUnidade] = useState("g");
  const fecharAdd=()=>{setAddCtx(null);setAddAlimentoId(null);setAddReceitaId(null);setBuscaQuery("");setBuscaFiltro("recentes");};
  const abrirDetalhe=alId=>{setAddAlimentoId(alId);setAddUnidade("g");setAddQtd(100);};
  // Unidades disponíveis pra um alimento: grama, P/M/G (Médio = a porção nativa do
  // alimento se tiver, senão 100g) e as unidades culinárias genéricas de UNIDADES_MEDIDA —
  // a porção nativa NÃO vira uma opção à parte (duplicava o Médio com peso idêntico, sem
  // sentido ter as duas — pedido do usuário 31/08/2026). Todo peso fora "grama" é
  // estimativa, marcada "(E)" na UI — não é densidade real do alimento (não temos esse
  // dado por item na biblioteca).
  const unidadesDoAlimento=al=>{
    if(!al)return[];
    const base=al.porcao?.gramas||100;
    const list=[{id:"g",label:"Grama",gramas:1,estimado:false}];
    TAMANHOS_PORCAO.forEach(t=>list.push({id:"tam_"+t.id,label:t.label,gramas:Math.round(base*t.fator),estimado:true}));
    UNIDADES_MEDIDA.forEach(u=>list.push({id:u.id,label:u.label,gramas:u.gramas,estimado:true}));
    return list;
  };

  if(addCtx&&addAlimentoId){
    const al=alimentos.find(a=>a.id===addAlimentoId);
    const unidades=unidadesDoAlimento(al);
    const unidadeInfo=unidades.find(u=>u.id===addUnidade)||unidades[0];
    const qtdGramas=Number(addQtd||0)*(unidadeInfo?.gramas||1);
    const per=field=>al?(al[field]*qtdGramas/100):0;
    return(
      <div style={{animation:"slideUp .3s ease",paddingBottom:80}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={()=>setAddAlimentoId(null)} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="back" size={13} color={C.muted}/>
          </button>
          <div style={{flex:1,fontSize:14,fontWeight:800,color:C.text,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{al?.name}</div>
          <button onClick={()=>al&&setAlimentos(p=>p.map(x=>x.id===al.id?{...x,favorito:!x.favorito}:x))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",flexShrink:0}} title="Favoritar">
            <Ico n="star" size={18} filled={!!al?.favorito} color={al?.favorito?AMBER:C.muted}/>
          </button>
        </div>

        {/* minWidth:0 nos dois — sem isso o <select> usa a largura intrínseca da opção mais
            longa ("Colher de sobremesa (10g) (E)") como piso e estoura a margem do app,
            reportado pelo usuário 31/08/2026 (flexbox só encolhe item com min-width:auto
            até o conteúdo natural, que aqui é maior que o espaço disponível). */}
        <div style={{display:"flex",gap:8,marginBottom:6}}>
          <input type="number" value={addQtd} min={0} step={0.01} onChange={e=>setAddQtd(e.target.value)}
            style={{flex:1,minWidth:0,background:C.card,border:"1px solid "+C.b1,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:14,fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
          <select value={addUnidade} onChange={e=>{const nv=e.target.value;setAddUnidade(nv);setAddQtd(nv==="g"?100:1);}}
            style={{flex:1.4,minWidth:0,background:C.card,border:"1px solid "+C.b1,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:12,fontWeight:700,outline:"none",boxSizing:"border-box",textOverflow:"ellipsis"}}>
            {unidades.map(u=>(<option key={u.id} value={u.id}>{u.label} ({u.gramas}g){u.estimado?" (E)":""}</option>))}
          </select>
        </div>
        {unidadeInfo?.estimado&&<div style={{fontSize:9,color:C.muted,marginBottom:10}}>(E) peso estimado — pode variar do alimento real.</div>}

        <div style={{fontSize:11,fontWeight:800,margin:unidadeInfo?.estimado?"6px 0 8px":"16px 0 8px"}}>Informações Nutricionais</div>
        <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:26,fontWeight:900,color:ORANGE,marginBottom:10}}>{Math.round(per("cal100"))} <span style={{fontSize:11,color:C.muted,fontWeight:600}}>kcal</span></div>
          {[["Carboidratos",per("carb"),"g",AMBER],["Proteínas",per("prot"),"g",GREEN],["Gorduras",per("gord"),"g",PURPLE],["Fibras",per("fibra"),"g",GREEN],["Sódio",per("sodio"),"mg",PURPLE],["Cálcio",per("calcio"),"mg",BLUE],["Ferro",per("ferro"),"mg",AMBER],["Vitamina C",per("vitC"),"mg",ORANGE]].map(([l,v,u])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid "+C.b1}}>
              <span style={{fontSize:11,color:C.muted}}>{l}</span>
              <span style={{fontSize:11,fontWeight:700}}>{fmt1(v)}{u}</span>
            </div>
          ))}
        </div>

        {/* Botão fixo acima da barra do coach (mesmo motivo do Sheet em shared/ui.jsx: sem
            portal, ficava por trás da barra do coach — só uma tira laranja cortada aparecia
            no fim da tela, reportado pelo usuário 31/08/2026). */}
        {createPortal(
          <div style={{position:"fixed",bottom:126,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:140,boxSizing:"border-box",padding:"0 16px"}}>
            <Btn color={ORANGE} onClick={()=>{
              if(!al||!qtdGramas)return;
              setLogDieta(p=>[...p,{id:"ld"+uid(),data:addCtx.data,refeicao:addCtx.refeicao,alimentoId:al.id,qtd:qtdGramas,
                ...(addUnidade!=="g"?{qtdDisplay:Number(addQtd),unidadeDisplay:unidadeInfo.label}:{})}]);
              toast_("Registrado",ORANGE);
              fecharAdd();
            }}>Adicionar à refeição</Btn>
          </div>,
          document.body
        )}
      </div>
    );
  }

  if(addCtx&&addReceitaId){
    const r=receitas.find(x=>x.id===addReceitaId);
    // Nutrientes TOTAIS da receita (não por 100g como no alimento — uma receita é uma
    // composição fixa de ingredientes, cada um já com sua própria quantidade, então não faz
    // sentido "escalar por porção" de novo aqui; ver pedido do usuário 31/08/2026 de poder
    // "verificar os nutrientes das receitas assim como acontece com outros alimentos").
    const total=field=>r?r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al[field]*ing.qtd/100):s;},0):0;
    return(
      <div style={{animation:"slideUp .3s ease",paddingBottom:80}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={()=>setAddReceitaId(null)} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="back" size={13} color={C.muted}/>
          </button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r?.name}</div>
            {r?.desc&&<div style={{fontSize:10,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.desc}</div>}
          </div>
          <button onClick={()=>r&&openSh("editReceita",{receitaId:r.id,name:r.name,desc:r.desc})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",flexShrink:0}} title="Editar">
            <Ico n="edit" size={16} color={C.muted}/>
          </button>
          <button onClick={()=>{if(!r)return;setReceitas(p=>p.filter(x=>x.id!==r.id));setAddReceitaId(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",flexShrink:0}} title="Excluir receita">
            <Ico n="x" size={16} color={C.muted}/>
          </button>
        </div>

        <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>Informações Nutricionais</div>
        <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:26,fontWeight:900,color:ORANGE,marginBottom:10}}>{Math.round(total("cal100"))} <span style={{fontSize:11,color:C.muted,fontWeight:600}}>kcal total</span></div>
          {[["Carboidratos",total("carb"),"g"],["Proteínas",total("prot"),"g"],["Gorduras",total("gord"),"g"],["Fibras",total("fibra"),"g"],["Sódio",total("sodio"),"mg"],["Cálcio",total("calcio"),"mg"],["Ferro",total("ferro"),"mg"],["Vitamina C",total("vitC"),"mg"]].map(([l,v,u])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid "+C.b1}}>
              <span style={{fontSize:11,color:C.muted}}>{l}</span>
              <span style={{fontSize:11,fontWeight:700}}>{fmt1(v)}{u}</span>
            </div>
          ))}
        </div>

        <div style={{fontSize:11,fontWeight:800,marginBottom:8}}>Ingredientes</div>
        {(!r||r.ingredientes.length===0)&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Nenhum ingrediente ainda</div>}
        {r&&r.ingredientes.map((ing,i)=>{
          const al=alimentos.find(a=>a.id===ing.alimentoId); if(!al)return null;
          return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600}}>{al.name}</div>
              <div style={{fontSize:9,color:C.muted}}>{ing.qtdDisplay!=null?fmt1(ing.qtdDisplay)+" "+ing.unidadeDisplay:ing.qtd+"g"} · {Math.round(al.cal100*ing.qtd/100)}kcal</div>
            </div>
            <button onClick={()=>setReceitas(p=>p.map(rc=>rc.id===r.id?{...rc,ingredientes:rc.ingredientes.filter((_,j)=>j!==i)}:rc))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
          </div>);
        })}
        <button onClick={()=>r&&openSh("addIngrediente",{receitaId:r.id,alimentoId:alimentos[0]?.id||"",qtd:100})} style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed "+C.b2,background:"none",color:ORANGE,fontWeight:700,fontSize:11,cursor:"pointer",marginTop:8}}>
          <Ico n="plus" size={11}/> Ingrediente
        </button>

        {createPortal(
          <div style={{position:"fixed",bottom:126,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:140,boxSizing:"border-box",padding:"0 16px"}}>
            <Btn color={ORANGE} onClick={()=>{
              if(!r||!r.ingredientes.length)return;
              setLogDieta(p=>[...p,...r.ingredientes.map(ing=>({id:"ld"+uid(),data:addCtx.data,refeicao:addCtx.refeicao,alimentoId:ing.alimentoId,qtd:ing.qtd,
                ...(ing.qtdDisplay!=null?{qtdDisplay:ing.qtdDisplay,unidadeDisplay:ing.unidadeDisplay}:{})}))]);
              toast_("Registrado",ORANGE);
              fecharAdd();
            }}>Adicionar à refeição</Btn>
          </div>,
          document.body
        )}
      </div>
    );
  }

  if(addCtx){
    const query=buscaQuery.trim().toLowerCase();
    const recentesIds=[...logDieta].reverse().map(l=>l.alimentoId).filter((id,i,arr)=>arr.indexOf(id)===i).slice(0,12);
    // Filtro "Receitas" (31/08/2026, substituiu "Pessoais" — nunca tinha alimento nenhum lá,
    // enquanto Receitas já é uma lista existente e útil) troca a fonte inteira pra `receitas`
    // em vez de `alimentos`, então a busca por texto também precisa ramificar aqui — senão
    // digitar com o filtro em Receitas continuaria buscando na biblioteca de alimentos.
    const isReceitas=buscaFiltro==="receitas";
    let pool;
    if(isReceitas){
      pool=receitas.filter(r=>!query||r.name.toLowerCase().includes(query));
    } else if(query){
      pool=alimentos.filter(a=>a.name.toLowerCase().includes(query)).sort((a,b)=>{
        const aq=a.name.toLowerCase(), bq=b.name.toLowerCase();
        const aStarts=aq.startsWith(query)?0:1, bStarts=bq.startsWith(query)?0:1;
        return aStarts-bStarts||a.name.localeCompare(b.name);
      }).slice(0,30);
    } else if(buscaFiltro==="favoritos"){
      pool=alimentos.filter(a=>a.favorito);
    } else {
      pool=recentesIds.map(id=>alimentos.find(a=>a.id===id)).filter(Boolean);
    }
    return(
      <div style={{animation:"slideUp .3s ease",paddingBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={fecharAdd} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico n="back" size={13} color={C.muted}/>
          </button>
          <div style={{fontSize:14,fontWeight:800,color:C.text}}>{addCtx.refeicao}</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,background:C.card,border:"1px solid "+C.b1,borderRadius:10,padding:"9px 12px",marginBottom:10}}>
          <Ico n="search" size={14} color={C.muted}/>
          <input value={buscaQuery} onChange={e=>setBuscaQuery(e.target.value)} placeholder="Buscar alimento..." autoFocus
            style={{flex:1,minWidth:0,background:"none",border:"none",outline:"none",color:C.text,fontSize:13}}/>
          {buscaQuery&&<button onClick={()=>setBuscaQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button>}
        </div>

        {/* Sem busca digitada, a lista fica restrita a Recentes/Favoritos/Receitas — nunca
            abre a biblioteca inteira (280+ itens) sem filtro, que era o problema apontado
            pelo usuário. Com busca digitada (fora do filtro Receitas), o texto procura em
            toda a biblioteca. */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"recentes",l:"Recentes"},{id:"favoritos",l:"Favoritos"},{id:"receitas",l:"Receitas"}].map(f=>(
            <button key={f.id} onClick={()=>setBuscaFiltro(f.id)} style={{flex:1,padding:"7px 4px",borderRadius:99,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(buscaFiltro===f.id?ORANGE:C.b2),background:buscaFiltro===f.id?ORANGE+"18":"transparent",color:buscaFiltro===f.id?ORANGE:C.muted}}>{f.l}</button>
          ))}
        </div>

        {pool.length===0&&(
          <div style={{textAlign:"center",padding:"24px 0",color:C.muted,fontSize:11}}>
            {isReceitas?(query?"Nenhuma receita encontrada":"Nenhuma receita ainda"):query?"Nenhum alimento encontrado":buscaFiltro==="favoritos"?"Nenhum favorito ainda":"Nenhum registro recente"}
          </div>
        )}
        {isReceitas?pool.map(r=>{
          const totalCal=r.ingredientes.reduce((s,ing)=>{const al=alimentos.find(a=>a.id===ing.alimentoId);return al?s+(al.cal100*ing.qtd/100):s;},0);
          return(<Card key={r.id} style={{marginBottom:8}} onClick={()=>setAddReceitaId(r.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700}}>{r.name}</div>
                <div style={{fontSize:10,color:C.muted}}>{Math.round(totalCal)}kcal · {r.ingredientes.length} ingrediente{r.ingredientes.length===1?"":"s"}{r.desc?" · "+r.desc:""}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setAddReceitaId(r.id);}} style={{background:ORANGE,border:"none",borderRadius:99,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n="plus" size={13} color="#fff"/>
              </button>
            </div>
          </Card>);
        }):pool.map(al=>(
          <Card key={al.id} style={{marginBottom:8}} onClick={()=>abrirDetalhe(al.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>{al.favorito&&<Ico n="star" size={10} filled color={AMBER}/>}{al.name}</div>
                <div style={{fontSize:10,color:C.muted}}>{al.cal100}kcal · {al.porcao?al.porcao.label+" ("+al.porcao.gramas+"g)":"100g"} · C:{al.carb}g P:{al.prot}g G:{al.gord}g</div>
              </div>
              <button onClick={e=>{e.stopPropagation();abrirDetalhe(al.id);}} style={{background:ORANGE,border:"none",borderRadius:99,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n="plus" size={13} color="#fff"/>
              </button>
            </div>
          </Card>
        ))}

        {/* "+ Criar alimento novo" tirado de novo daqui (31/08/2026) — usuário não queria
            criação de alimento dentro do fluxo de busca, e sim de volta na aba "Alimentos"
            dedicada (ver abaixo). */}
        {isReceitas&&(
          <button onClick={()=>openSh("addReceita",{name:buscaQuery,desc:"",steps:[""]})} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px dashed "+C.b2,background:"none",color:C.muted,fontWeight:700,fontSize:11,cursor:"pointer",marginTop:4}}>
            + Criar receita nova
          </button>
        )}
      </div>
    );
  }

  return(
    <div style={{animation:"slideUp .3s ease"}}>
      {/* "Receitas" não volta pra cá (31/08/2026) — já tem lugar próprio (filtro "Receitas"
          na busca de alimento + tela de detalhe). "Alimentos" volta como aba dedicada pra
          gerenciar a biblioteca (criar/favoritar/excluir), separada do fluxo de registro. */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"diario",l:"Diário"},{id:"biblioteca",l:"Alimentos"}].map(s=>(
          <button key={s.id} onClick={()=>setSv(s.id)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:10,background:sv===s.id?"linear-gradient(135deg,"+ORANGE+"dd,"+ORANGE+"88)":C.b1,border:"none",color:sv===s.id?"#fff":C.muted}}>{s.l}</button>
        ))}
      </div>

      {sv==="diario"&&(function DiaView(){
        // Navegação por dia (30/08/2026, pedido do usuário, mesmo padrão da Rotina do Dia
        // em TreinoTab.jsx) — tudo nesta view (refeições, água, macros/micros) passa a
        // refletir o dia navegado, não sempre o dia real de hoje.
        const viewDate = new Date(); viewDate.setDate(viewDate.getDate()+diaOffset);
        const diaSemana = diaSemanaDe(viewDate);
        const rotulo = rotuloDia(diaOffset,diaSemana);
        const viewDateStr = dateStrOffset(diaOffset);
        const logDoDia = logDieta.filter(l=>l.data===viewDateStr);
        const calcMacroDia = field => logDoDia.reduce((s,l)=>{const al=alimentos.find(a=>a.id===l.alimentoId);return al?s+(al[field]*l.qtd/100):s;},0);
        const calDia=calcMacroDia("cal100"), protDia=calcMacroDia("prot"), carbDia=calcMacroDia("carb"), gordDia=calcMacroDia("gord");
        const coposDoDia = agua.copos.filter(c=>c.data===viewDateStr);
        const aguaMlDia = coposDoDia.reduce((s,c)=>s+c.ml,0);
        const aguaPctDia = agua.meta>0?clamp(Math.round(aguaMlDia/agua.meta*100),0,100):0;
        // "Repetir" continua específico de popular o dia real de hoje (não faz sentido
        // "repetir" pra um dia arbitrário navegado) — só aparece quando diaOffset===0.
        const pastDays=[...new Set(logDieta.filter(l=>l.data!==todayS()).map(l=>l.data))].sort((a,b)=>b.localeCompare(a));
        const lastPastDay=pastDays[0];
        const repetirDia=()=>{
          const itens=logDieta.filter(l=>l.data===lastPastDay);
          setLogDieta(p=>[...p,...itens.map(l=>({...l,id:"ld"+uid(),data:todayS()}))]);
          toast_("Refeições de "+lastPastDay.split("-").reverse().join("/")+" repetidas",ORANGE);
        };
        return(
        <div>
          {/* NAVEGAÇÃO POR DIA */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <button onClick={()=>setDiaOffset(o=>o-1)} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ico n="back" size={13} color={C.muted}/>
            </button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:ORANGE,fontWeight:700,letterSpacing:1}}>{rotulo}{(diaOffset===0||diaOffset===1||diaOffset===-1)?" · "+diaSemana.toUpperCase():""}</div>
              <div style={{fontSize:13,fontWeight:800,color:C.text}}>{fmtDDMMAA(viewDate)}</div>
            </div>
            <button onClick={()=>setDiaOffset(o=>o+1)} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{display:"inline-flex",transform:"scaleX(-1)"}}><Ico n="back" size={13} color={C.muted}/></span>
            </button>
          </div>

          {/* ACOMPANHAMENTO DE NUTRIENTES — primeiro card (pedido do usuário). Macros
              principais (kcal/carb/prot/gordura) sempre visíveis; micronutrientes ficam
              atrás de "Ver mais nutrientes". */}
          <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:12,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:C.text}}>Acompanhamento de Macros</div>
              <div style={{fontSize:9,color:C.muted}}>TDEE estimado: {tdee}kcal</div>
            </div>
            {/* Estourar a meta vira vermelho (ACCENT) em qualquer nutriente, macro ou micro —
                sinal único e consistente de "passou do valor de referência", sem julgar se
                isso é bom ou ruim pra cada caso específico (ex: sódio é sempre ruim passar,
                proteína às vezes é intencional; a barra só avisa, quem interpreta é o usuário). */}
            {[{l:"Calorias",v:Math.round(calDia),m:metas.cal,u:"kcal",c:ACCENT},{l:"Proteína",v:Math.round(protDia),m:metas.prot,u:"g",c:GREEN},{l:"Carb",v:Math.round(carbDia),m:metas.carb,u:"g",c:AMBER},{l:"Gordura",v:Math.round(gordDia),m:metas.gord,u:"g",c:PURPLE}].map(macro=>{
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
            <button onClick={()=>setMicrosExpanded(e=>!e)} style={{background:"none",border:"none",cursor:"pointer",color:ORANGE,fontSize:10,fontWeight:700,padding:"8px 0 0"}}>
              {microsExpanded?"Ocultar nutrientes ▴":"Ver mais nutrientes (5) ▾"}
            </button>
            {microsExpanded&&(<>
            <div style={{height:1,background:C.b1,margin:"10px 0"}}/>
            {[{l:"Fibra",v:calcMacroDia("fibra"),m:MICRO_META.fibra,u:"g",c:GREEN},{l:"Sódio",v:calcMacroDia("sodio"),m:MICRO_META.sodio,u:"mg",c:PURPLE},{l:"Cálcio",v:calcMacroDia("calcio"),m:MICRO_META.calcio,u:"mg",c:BLUE},{l:"Ferro",v:calcMacroDia("ferro"),m:MICRO_META.ferro,u:"mg",c:AMBER},{l:"Vitamina C",v:calcMacroDia("vitC"),m:MICRO_META.vitC,u:"mg",c:ORANGE}].map(micro=>{
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

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Refeições</div>
            <div style={{display:"flex",gap:6}}>
              {diaOffset===0&&logDoDia.length===0&&lastPastDay&&<Btn sm full={false} outline color={ORANGE} onClick={repetirDia}><Ico n="refresh" size={11}/> Repetir</Btn>}
              <Btn sm full={false} color={ORANGE} onClick={()=>setAddCtx({refeicao:diaOffset===0?refeicaoPorHorario():REFEICOES[0],data:viewDateStr})}><Ico n="plus" size={11}/> Registrar</Btn>
            </div>
          </div>
          {/* Cards de refeição clicáveis (pedido do usuário) — tocar em qualquer parte do
              card abre a tela cheia de busca de alimento (addCtx), não mais um modal.
              Sem adição rápida inline — o registro sempre passa pela busca+detalhe/porção. */}
          {REFEICOES.map(ref=>{
            const items=logDoDia.filter(l=>l.refeicao===ref);
            const refCal=items.reduce((s,i)=>{const al=alimentos.find(a=>a.id===i.alimentoId);return al?s+al.cal100*i.qtd/100:s;},0);
            const expanded=!!refExpanded[ref];
            const visible=expanded?items:items.slice(0,REFEICAO_ITEM_CAP);
            const hidden=items.length-visible.length;
            return(<Card key={ref} style={{marginBottom:8}} onClick={()=>setAddCtx({refeicao:ref,data:viewDateStr})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:items.length?6:0}}>
                <span style={{fontSize:10,color:ORANGE,fontWeight:700}}>{ref.toUpperCase()}</span>
                {items.length>0
                  ? <Badge label={Math.round(refCal)+"kcal · "+items.length+(items.length===1?" item":" itens")} color={ORANGE}/>
                  : <Ico n="plus" size={13} color={ORANGE}/>}
              </div>
              {items.length===0&&<div style={{fontSize:10,color:C.muted}}>Nenhum item ainda</div>}
              {visible.map(item=>{
                const al=alimentos.find(a=>a.id===item.alimentoId); if(!al)return null;
                return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid "+C.b1}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600}}>{al.name}</div>
                    <div style={{fontSize:9,color:C.muted}}>{item.qtdDisplay!=null?fmt1(item.qtdDisplay)+" "+item.unidadeDisplay:item.qtd+"g"} · {Math.round(al.cal100*item.qtd/100)}kcal · {Math.round(al.prot*item.qtd/100)}g prot</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setLogDieta(p=>p.filter(x=>x.id!==item.id));}} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                </div>);
              })}
              {(hidden>0||expanded&&items.length>REFEICAO_ITEM_CAP)&&(
                <button onClick={e=>{e.stopPropagation();setRefExpanded(p=>({...p,[ref]:!expanded}));}} style={{width:"100%",background:"none",border:"none",borderTop:"1px solid "+C.b1,cursor:"pointer",padding:"7px 0 0",marginTop:2,fontSize:10,color:ORANGE,fontWeight:700}}>
                  {expanded?"Ver menos ▴":"+"+hidden+" mais ▾"}
                </button>
              )}
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
            <div style={{fontSize:18,fontWeight:900,color:ACCENT}}>{Math.round(aguaMlDia/100)/10}L <span style={{fontSize:10,color:C.muted,fontWeight:400}}>/ {agua.meta/1000}L</span></div>
            <Bar value={aguaPctDia} color={ACCENT} height={3}/>
            {!secCollapsed.agua&&(<div style={{marginTop:10}}>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <input type="number" value={aguaMl} min={0} step={50} onChange={e=>setAguaMl(Number(e.target.value))}
                  style={{flex:1,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                <button onClick={()=>{if(aguaMl>0){setAgua(a=>({...a,copos:[...a.copos,{id:"ag"+uid(),data:viewDateStr,ml:aguaMl}]}));toast_("+"+aguaMl+"ml",ACCENT);}}}
                  style={{padding:"7px 14px",borderRadius:8,background:ACCENT,border:"none",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>Adicionar</button>
              </div>
              {coposDoDia.length===0
                ? <div style={{textAlign:"center",padding:"8px 0",color:C.muted,fontSize:11}}>Nenhum registro ainda</div>
                : coposDoDia.map((c,i)=>(
                  <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:i>0?"1px solid "+C.b1:"none"}}>
                    <span style={{fontSize:11,fontWeight:600}}>{i+1}º copo · {c.ml}ml</span>
                    <button onClick={()=>setAgua(a=>({...a,copos:a.copos.filter(x=>x.id!==c.id)}))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={12} color={C.muted}/></button>
                  </div>
                ))
              }
            </div>)}
          </div>
        </div>
        );
      })()}

      {/* Drilldown por categoria (31/08/2026, pedido do usuário) — mesmo padrão já usado na
          biblioteca de exercícios do Treino: primeiro nível é uma grade de categorias com
          contagem, tocar numa abre só os alimentos daquela categoria. Evita jogar as 22
          categorias × todos os alimentos na tela de uma vez só. */}
      {sv==="biblioteca"&&(!bibCat?(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:800}}>Alimentos</div>
            <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addAlimento",{name:"",cat:CATS_AL[0],cal100:0,prot:0,carb:0,gord:0})}><Ico n="plus" size={11}/> Alimento</Btn>
          </div>
          <div style={{fontSize:9,color:C.muted,marginBottom:10}}>{alimentos.length} alimentos cadastrados · toque numa categoria para ver a lista completa</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {CATS_AL.map(cat=>{
              const n=alimentos.filter(a=>a.cat===cat).length; if(!n)return null;
              return(
                <button key={cat} onClick={()=>setBibCat(cat)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:11,padding:12,cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:800,marginBottom:5,color:C.text}}>{cat}</div>
                  <Badge label={n+(n===1?" alimento":" alimentos")} color={ORANGE}/>
                </button>
              );
            })}
          </div>
        </div>
      ):(
        <div>
          <button onClick={()=>setBibCat(null)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0}}>
            <Ico n="back" size={13}/> Categorias
          </button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800}}>{bibCat}</div>
            <Btn sm full={false} color={ORANGE} onClick={()=>openSh("addAlimento",{name:"",cat:bibCat,cal100:0,prot:0,carb:0,gord:0})}><Ico n="plus" size={11}/> Alimento</Btn>
          </div>
          {alimentos.filter(a=>a.cat===bibCat).map(al=>(
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
        </div>
      ))}
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

// Editar nome/descrição de uma receita já existente (31/08/2026) — não mexe em
// ingredientes/steps, isso já é feito direto na tela de detalhe da receita (add/remove).
export function EditReceitaSheet(){
  const g = useGeburah();
  const { f, F, close, setReceitas, toast_ } = g;
  return(
    <Sheet title="Editar Receita" onClose={close}>
      <FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Bowl proteico"/>
      <FTA label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} rows={2}/>
      <Btn color={ORANGE} onClick={()=>{
        if(!f.name)return;
        setReceitas(p=>p.map(r=>r.id===f.receitaId?{...r,name:f.name,desc:f.desc||""}:r));
        toast_("Receita atualizada",ORANGE);close();
      }}>Salvar</Btn>
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
