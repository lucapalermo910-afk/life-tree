import { useContext } from "react";
import { FI } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt, FREQ_LABELS } from "./constants.js";
import { CfgSection, MiniTotal } from "./helpers.jsx";
import { ICAT } from "./seedData.js";
import { YesodCtx } from "./context.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Último passo da
// sequência — Preferências/Segurança/Índice de tudo/CRUD de bancos-categorias-pessoas-
// recorrências. Os 5 renderXRow continuam no shell (mesma razão do BolsosTab), passados
// aqui como props junto com C.
export function ConfigTab({ C, renderAccRow, renderCardRow, renderBoxRow, renderInvCatRow, renderDebtRow }) {
  const ctx = useContext(YesodCtx);
  const {
    accs, banks, boxes, cards, catsIn, catsOut, confirmDestructive, debts, delBank, delCatIn,
    delCatOut, delRecurring, delSplitPerson, guard, invs, openSh, recurringOverrides, recurringPendingDates, recurrings, scoreWeights,
    setConfirmDestructive, setScoreWeights, setSplitPersonMode, splitPeople, today, toggleRecurring, totAcc, totBox, totCardDebt, totDebtRem,
    totInv,
  } = ctx;
  return (
          <div style={{animation:"slideUp .3s ease"}}>
            {/* Preferências do módulo — primeira seção de Config a sair do padrão "lista +
                Adicionar" das entidades abaixo (Bancos/Categorias/Pessoas/Recorrências);
                aqui mora configuração de comportamento, não itens que se criam/apagam. */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>PREFERÊNCIAS</div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700}}>Fórmula de Saúde Financeira</span>
                <button onClick={()=>setScoreWeights({savRate:25,debt:20,budget:20,emergency:20,if:15,emergencyTargetMonths:6})} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700}}>Restaurar padrão</button>
              </div>
              <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>Pesos de cada componente do % mostrado na Visão Geral. Não precisam somar 100 — o app normaliza sozinho; zere um peso pra tirar aquele componente do cálculo. Peça pro Coach avaliar ou sugerir esses pesos a qualquer momento.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FI label="Taxa de poupança (%)" value={scoreWeights.savRate} onChange={v=>setScoreWeights(p=>({...p,savRate:v}))} type="number" min={0} C={C}/>
                <FI label="Dívidas (%)" value={scoreWeights.debt} onChange={v=>setScoreWeights(p=>({...p,debt:v}))} type="number" min={0} C={C}/>
                <FI label="Orçamento (%)" value={scoreWeights.budget} onChange={v=>setScoreWeights(p=>({...p,budget:v}))} type="number" min={0} C={C}/>
                <FI label="Reserva de emergência (%)" value={scoreWeights.emergency} onChange={v=>setScoreWeights(p=>({...p,emergency:v}))} type="number" min={0} C={C}/>
                <FI label="Independência Financeira (%)" value={scoreWeights.if} onChange={v=>setScoreWeights(p=>({...p,if:v}))} type="number" min={0} C={C}/>
                <FI label="Meta de reserva (meses)" value={scoreWeights.emergencyTargetMonths} onChange={v=>setScoreWeights(p=>({...p,emergencyTargetMonths:v}))} type="number" min={1} C={C}/>
              </div>
              <div style={{fontSize:9,color:C.muted,textAlign:"right"}}>Total: {(Number(scoreWeights.savRate)||0)+(Number(scoreWeights.debt)||0)+(Number(scoreWeights.budget)||0)+(Number(scoreWeights.emergency)||0)+(Number(scoreWeights.if)||0)}%</div>
            </div>

            {/* Segurança (26/08/2026) — chave única controlando se editar/apagar uma
                ENTIDADE (Conta/Banco/Cartão/Caixinha/Dívida/Investimento/Recorrência/Pessoa/
                Despesa a pagar) pede confirmação antes de executar. Default ligado — desligar
                é escolha explícita do usuário, não o comportamento de fábrica. Não cobre
                deletar um lançamento/categoria isolada (baixo risco, ver guard() acima). */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>SEGURANÇA</div>
            <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700}}>Confirmar antes de editar/apagar</span>
              <div style={{fontSize:10,color:C.muted,margin:"4px 0 10px",lineHeight:1.6}}>Pede confirmação antes de salvar edições ou apagar Conta/Banco/Cartão/Caixinha/Dívida/Investimento/Recorrência/Pessoa/Despesa a pagar. Lançamentos e categorias isolados continuam instantâneos.</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setConfirmDestructive(true)} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(confirmDestructive?ACCENT:C.b2),background:confirmDestructive?ACCENT+"18":"transparent",color:confirmDestructive?ACCENT:C.text}}>Sim (padrão)</button>
                <button onClick={()=>setConfirmDestructive(false)} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!confirmDestructive?"#ef4444":C.b2),background:!confirmDestructive?"#ef444418":"transparent",color:!confirmDestructive?"#ef4444":C.text}}>Não</button>
              </div>
            </div>

            {/* Índice de tudo (26/08/2026) — espelho de todo item do módulo (mesma
                lógica de clique/editar/apagar de Bolsos, via renderXRow extraídos), pra
                Config funcionar como hub único de criar/editar em vez de precisar navegar
                até cada aba. Seções começam fechadas -- é uma tela que agora repete tudo
                que já existe em Bolsos, então some por padrão pra não virar uma segunda
                Bolsos sempre visível. */}
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>ÍNDICE DE TUDO</div>
            <div style={{fontSize:9,color:C.muted,marginBottom:10,lineHeight:1.6}}>Todo item do módulo, num só lugar. Toque no título de cada seção pra abrir.</div>
            <CfgSection title="Contas" count={accs.length} onAdd={()=>openSh("addAcc",{bankId:banks[0]?.id||"",name:""})} C={C}>
              <MiniTotal label="TOTAL EM CONTAS" value={fmt(totAcc)} color={ACCENT} C={C}/>
              {accs.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma conta cadastrada</div>}
              {accs.map(renderAccRow)}
            </CfgSection>
            <CfgSection title="Cartões" count={cards.length} onAdd={()=>openSh("addCard",{bankId:banks[0]?.id||"",name:"",limit:5000,closeDay:10,dueDay:25,color:ACCENT})} C={C}>
              <MiniTotal label="TOTAL EM FATURAS" value={fmt(totCardDebt)} color="#8b5cf6" C={C}/>
              {cards.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhum cartão cadastrado</div>}
              {cards.map(renderCardRow)}
            </CfgSection>
            <CfgSection title="Caixinhas" count={boxes.length} onAdd={()=>openSh("addBox",{name:"",goal:0,color:ACCENT,rate:0,rateUnit:"ano"})} C={C}>
              <MiniTotal label="TOTAL EM CAIXINHAS" value={fmt(totBox)} color="#06b6d4" C={C}/>
              {boxes.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma caixinha cadastrada</div>}
              {boxes.map(renderBoxRow)}
            </CfgSection>
            <CfgSection title="Investimentos" count={invs.length} onAdd={()=>openSh("addInv",{bankId:banks[0]?.id||"",subCat:"rf_pub",name:"",invested:0,balance:0,rate:"",maturity:"",accId:""})} C={C}>
              <MiniTotal label="TOTAL INVESTIDO" value={fmt(totInv)} color="#f59e0b" C={C}/>
              {ICAT.map(renderInvCatRow)}
            </CfgSection>
            <CfgSection title="Dívidas e Financiamentos" count={debts.length} onAdd={()=>openSh("addDebt",{name:"",credor:"",totalParcelas:12,parcelasPagas:0,valorParcela:0,dueDay:10,startDate:today,color:"#ef4444",valorRecebido:0,accId:""})} C={C}>
              <MiniTotal label="TOTAL EM DÍVIDAS" value={fmt(totDebtRem)} color="#ef4444" C={C}/>
              {debts.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma dívida cadastrada</div>}
              {debts.map(renderDebtRow)}
            </CfgSection>

            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8,marginTop:14}}>GERENCIAR</div>
            {[
              {title:"Bancos",items:banks,addSh:"addBank",addInit:{name:"",color:ACCENT},render:b=><div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/><span style={{flex:1,fontSize:12,fontWeight:600}}>{b.name}</span><button onClick={()=>openSh("editBank",{id:b.id,name:b.name,color:b.color})} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>guard(()=>delBank(b.id),"Apagar o banco \""+b.name+"\"? Essa ação não pode ser desfeita.")} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Categorias de Saída",items:catsOut,addSh:"addCatOut",addInit:{name:""},render:c=><div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><span style={{flex:1,fontSize:12,fontWeight:600}}>{c}</span><button onClick={()=>delCatOut(c)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Categorias de Entrada",items:catsIn,addSh:"addCatIn",addInit:{name:""},render:c=><div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}><span style={{flex:1,fontSize:12,fontWeight:600}}>{c}</span><button onClick={()=>delCatIn(c)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button></div>},
              {title:"Pessoas p/ Dividir Despesas",items:splitPeople,addSh:"addSplitPerson",addInit:{name:""},render:p=>{
                const mode=p.settlementMode||"item";
                return(<div key={p.id} style={{padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{flex:1,fontSize:12,fontWeight:600}}>{p.name}</span>
                    <button onClick={()=>guard(()=>delSplitPerson(p.id),"Apagar \""+p.name+"\" da lista de pessoas? Essa ação não pode ser desfeita.")} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>
                  </div>
                  {/* Como acertar despesas divididas com essa pessoa (26/08/2026) — "Conta a
                      conta" (padrão) acerta cada despesa separada, como sempre foi; "Líquido"
                      soma tudo que ela deve com tudo que você deve a ela e fecha na diferença,
                      numa transação só. Por pessoa, não global — dá pra ter gente no dia a dia
                      (líquido) e gente ocasional (conta a conta) ao mesmo tempo. */}
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setSplitPersonMode(p.id,"item")} style={{flex:1,padding:"6px 2px",borderRadius:7,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(mode==="item"?ACCENT:C.b2),background:mode==="item"?ACCENT+"18":"transparent",color:mode==="item"?ACCENT:C.muted}}>Conta a conta</button>
                    <button onClick={()=>setSplitPersonMode(p.id,"net")} style={{flex:1,padding:"6px 2px",borderRadius:7,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(mode==="net"?ACCENT:C.b2),background:mode==="net"?ACCENT+"18":"transparent",color:mode==="net"?ACCENT:C.muted}}>Líquido</button>
                  </div>
                </div>);
              }}
            ].map(sec=>(
              <CfgSection key={sec.title} title={sec.title} count={sec.items.length} defaultOpen onAdd={()=>openSh(sec.addSh,sec.addInit)} C={C}>
                {sec.items.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhum item</div>}
                {sec.items.map(item=>sec.render(item))}
              </CfgSection>
            ))}

            <CfgSection title="Recorrências" count={recurrings.length} defaultOpen C={C}>
              {recurrings.length===0&&<div style={{textAlign:"center",padding:10,color:C.muted,fontSize:11}}>Nenhuma recorrência — crie uma marcando a frequência ao lançar</div>}
              {recurrings.map(r=>{const pend=recurringPendingDates(r);return(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:C.surface,borderRadius:9,marginBottom:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:pend.length?"#f97316":r.active?(r.type==="in"?"#16a34a":"#ef4444"):C.b2,flexShrink:0}}/>
                  <div style={{flex:1,opacity:r.active?1:.5}}>
                    <div style={{fontSize:12,fontWeight:600,textDecoration:r.active?"none":"line-through"}}>{r.desc}</div>
                    <div style={{fontSize:9,color:pend.length?"#f97316":C.muted,fontWeight:pend.length?700:400}}>{pend.length?pend.length+" pendente"+(pend.length>1?"s":"")+" desde "+pend[0].split("-").reverse().join("/"):fmt(r.amount)+" · "+FREQ_LABELS[r.freq]+" · próxima "+r.nextDate}</div>
                  </div>
                  {pend.length>0&&<button onClick={()=>{const overrideKey=pend[0].slice(0,7)+"|"+r.id;const amount=Object.prototype.hasOwnProperty.call(recurringOverrides,overrideKey)?Number(recurringOverrides[overrideKey]):r.amount;openSh("payRecurring",{recurringId:r.id,accId:r.accId||"",desc:r.desc,amount,dueDate:pend[0],jurosAtraso:0});}} style={{background:"#f9731622",border:"1px solid #f9731644",borderRadius:8,padding:"5px 9px",cursor:"pointer",color:"#f97316",fontSize:9,fontWeight:700}}>Pagar</button>}
                  <button onClick={()=>toggleRecurring(r.id)} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.muted}}>{r.active?"⏸":"▶"}</button>
                  <button onClick={()=>guard(()=>delRecurring(r.id),"Apagar a recorrência \""+r.desc+"\"? Essa ação não pode ser desfeita.")} style={{background:C.b1,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={12} color="#ef4444"/></button>
                </div>
              );})}
            </CfgSection>
          </div>
  );
}
