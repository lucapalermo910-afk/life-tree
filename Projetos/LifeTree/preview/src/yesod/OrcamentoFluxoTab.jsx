import { useContext } from "react";
import { FI, FS, Btn } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { uid, fmt, ORC_SECTIONS, PROJ_HORIZONS } from "./constants.js";
import { ProjChart } from "./helpers.jsx";
import { ICAT } from "./seedData.js";
import { YesodCtx } from "./context.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Abas Orçamento e Fluxo
// de Caixa (pill ORC_SECTIONS) — sem sub-página cross-tab, sem sheet próprio fora do que já
// mora em Sheets.jsx (addBudget/editBudget), então nenhum desvio do plano original aqui.
export function OrcamentoFluxoTab({ C }) {
  const ctx = useContext(YesodCtx);
  const {
    budgetSpend, budgets, buildProjSeries, cashflowMonth, catsIn, catsOut, debts, extCat,
    extType, fluxoView, futureCategoryTotals, getMonthStr, invs, isFutureYm, monthLabel2, monthTotals,
    mySplitShare, net, openSh, orcSection, overMonth, page, projEvents, projHorizonId, projMilestones,
    projUpcoming, retroPatrim, selChartYm, setBudgets, setExtCat, setExtType, setFluxoView, setOrcSection,
    setPlannedItems, setProjEvents, setProjHorizonId, setRecurringOverrides, setSelChartYm, splitPeople, tab, totAcc,
    touchXRef, txsByMonth,
  } = ctx;
  return (
    <>
        {!page&&tab==="orc"&&(
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {ORC_SECTIONS.map(s=>(<button key={s.id} onClick={()=>setOrcSection(s.id)}
                style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,
                  background:orcSection===s.id?"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)":C.b1,
                  border:"none",color:orcSection===s.id?"#fff":C.muted}}>{s.l}</button>))}
            </div>
            {orcSection==="orc"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,fontWeight:800}}>Orçamento — {monthLabel2(getMonthStr(0))}</span>
                <button onClick={()=>openSh("addBudget",{cat:catsOut[0],limit:0})} style={{background:"none",border:"1px solid "+ACCENT,borderRadius:7,padding:"5px 11px",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10}/> Categoria</button>
              </div>
              {budgets.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum orçamento definido</div>}
              {budgets.map(bg=>{const spent=budgetSpend(bg.cat);const pct=Math.min(100,Math.round((spent/bg.limit)*100));const over=spent>bg.limit;const color=over?"#ef4444":pct>75?"#f59e0b":ACCENT;return(<div key={bg.id} style={{background:C.card,border:"1px solid "+(over?"#ef444433":C.b1),borderRadius:12,padding:"11px 13px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12,fontWeight:600}}>{bg.cat}</span>{over&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:"#fee2e2",color:"#ef4444",fontWeight:700}}>ACIMA</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,fontWeight:700,color}}>{fmt(spent)}</span><span style={{fontSize:9,color:C.muted}}>/ {fmt(bg.limit)}</span><button onClick={()=>openSh("editBudget",{id:bg.id,cat:bg.cat,limit:bg.limit})} style={{background:C.b1,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" size={10} color={C.muted}/></button><button onClick={()=>setBudgets(p=>p.filter(x=>x.id!==bg.id))} style={{background:C.b1,border:"none",borderRadius:99,width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={9} color={C.muted}/></button></div></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{pct}% usado {over?"— "+fmt(spent-bg.limit)+" acima":"— "+fmt(bg.limit-spent)+" disponível"}</div></div>);})}
            </div>)}
          </div>
        )}
        {!page&&tab==="orc"&&orcSection==="fluxo"&&(function FluxoTab(){
          const VIEWS=["fluxo","poupanca","dividas-rel","invest-rel","patrimonio","projecao"];
          const VIEW_LABELS=["Fluxo de Caixa","Taxa de Poupança","Progresso Dívidas","Rendimento Invest.","Evolução Patrimonial","Projeção"];
          const vIdx=typeof fluxoView==="number"?fluxoView:0;
          const cf=cashflowMonth(overMonth);const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(overMonth+o));
          const savingsRate=cf.ins>0?Math.max(0,Math.round(((cf.ins-cf.outs)/cf.ins)*100)):0;
          const totDebtNow=debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
          const investPerf=invs.map(i=>({name:i.name.length>16?i.name.slice(0,14)+"...":i.name,gain:i.balance-i.invested,pct:i.invested>0?((i.balance-i.invested)/i.invested*100).toFixed(1):"0.0",color:ICAT.find(c=>c.sub.some(s=>s.id===i.subCat))?.color||ACCENT})).sort((a,b)=>b.gain-a.gain);
          return(
            <div style={{animation:"slideUp .3s ease"}} onTouchStart={e=>{touchXRef.current=e.touches[0].clientX;}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touchXRef.current;if(Math.abs(dx)>40){setFluxoView(v=>dx<0?Math.min(VIEWS.length-1,v+1):Math.max(0,v-1));}}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:800}}>{VIEW_LABELS[vIdx]}</span>
              </div>
              {/* Antes tinha um "← Ago/26 →" aqui (overMonth), independente do mês selecionado
                  no gráfico abaixo (selChartYm) — dava pra ficar com dois meses diferentes
                  mostrados ao mesmo tempo na tela, um deles sem efeito nenhum visível (bug
                  reportado 25/08/2026 com screenshot: cabeçalho em "Out/25", gráfico em
                  "Mar/26"). Removido — a única forma de escolher o mês agora é tocar numa
                  barra do gráfico; overMonth continua existindo só pra Taxa de Poupança
                  (histórico de 6 meses), sem controle visível próprio, sempre no mês atual. */}
              {vIdx===0&&(function FluxoCaixaView(){
                const chartYm=selChartYm||getMonthStr(0);
                const curYm=getMonthStr(0);const[curY]=curYm.split("-").map(Number);
                // Ano corrente fixo, Jan-Dez (12 barras cabem na tela sem precisar arrastar) —
                // realizado até o mês atual, esperado dali até dezembro. Substituiu o toggle
                // 3/6/12 de antes (25/08/2026): o usuário queria ver o ano inteiro de uma vez,
                // não só uma janela — e com 12 meses fixos não sobra necessidade de gesto de
                // arrastar pra "ver mais", já mostra tudo.
                const yearYms=Array.from({length:12},(_,i)=>curY+"-"+String(i+1).padStart(2,"0"));
                const chartMonths=yearYms.map(ym=>({ym,...monthTotals(ym),future:isFutureYm(ym)}));
                const chartMax=Math.max(...chartMonths.map(m=>Math.max(m.ins,m.outs)),1);
                const selTotals=monthTotals(chartYm);const selFuture=isFutureYm(chartYm);const selBalance=selTotals.ins-selTotals.outs;

                // Lista fundida (era a aba "Extrato", voltou a viver aqui em 25/08/2026 — clicar
                // num card não pula de tela mais nenhuma, o detalhe aparece embaixo na hora).
                // Busca e filtro de período saíram em 25/08/2026 — o mês já é 100% escolhido
                // pelo gráfico, não faz sentido ter um segundo controle de período aqui.
                const allCats=[...new Set([...catsOut,...catsIn])];
                let list=[];
                if(!selFuture){
                  list=(txsByMonth[chartYm]||[]).filter(tx=>{
                    if(extType!=="todos"&&tx.type!==extType)return false;
                    if(extCat&&tx.cat!==extCat)return false;
                    return true;
                  }).sort((a,b)=>b.date.localeCompare(a.date));
                }
                const total=list.reduce((s,tx)=>s+(tx.type==="in"?tx.amount:-mySplitShare(tx)),0);
                let futureRows=[];
                const futureType=extType==="todos"?"out":extType;
                if(selFuture){
                  const totals=futureCategoryTotals(chartYm,futureType);
                  futureRows=Object.entries(totals).map(([cat,v])=>({cat,...v})).filter(r=>!extCat||r.cat===extCat);
                }

                return(<div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>REALIZADO + ESPERADO — {curY}</div>
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    {/* Barras sempre limitadas a 56px (Math.min defensivo + overflow:hidden no
                        container, 25/08/2026) — a razão m.ins/chartMax já devia garantir isso
                        matematicamente (chartMax é o maior valor entre os meses mostrados), mas
                        um valor muito acima da escala normal (ex: um empréstimo grande recém
                        creditado) fazia a barra parecer estourar o card por falta dessa trava. */}
                    <div style={{display:"flex",gap:4,alignItems:"flex-end",height:70,marginBottom:8,overflow:"hidden"}}>{chartMonths.map(m=>(<div key={m.ym} onClick={()=>setSelChartYm(m.ym)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}><div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:56,overflow:"hidden"}}><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.future?"#16a34a55":"#16a34a",height:Math.min(56,Math.max(2,(m.ins/chartMax)*56))+"px"}}/><div style={{flex:1,borderRadius:"3px 3px 0 0",background:m.future?"#ef444455":"#ef4444",height:Math.min(56,Math.max(2,(m.outs/chartMax)*56))+"px"}}/></div><div style={{fontSize:6,color:m.ym===chartYm?ACCENT:(m.future?C.dim:C.muted),fontWeight:m.ym===chartYm?700:400,whiteSpace:"nowrap"}}>{monthLabel2(m.ym).slice(0,3)}{m.future?"(E)":""}</div></div>))}</div>
                    <div style={{display:"flex",gap:12,fontSize:8,color:C.muted}}><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#16a34a",display:"inline-block"}}/>Realizado</span><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#16a34a55",display:"inline-block"}}/>Esperado (E)</span></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700}}>{monthLabel2(chartYm)}</span>
                    {selFuture&&<span style={{fontSize:8,fontWeight:700,color:"#f59e0b",background:"#f59e0b18",padding:"3px 8px",borderRadius:99}}>projeção editável</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                    <div onClick={()=>setExtType("in")} style={{background:C.card,border:"1px solid "+(extType==="in"?ACCENT:C.b1),borderRadius:12,padding:"11px 10px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Receitas</div><div style={{fontSize:13,fontWeight:900,color:"#16a34a"}}>{fmt(selTotals.ins)}</div></div>
                    <div onClick={()=>setExtType("out")} style={{background:C.card,border:"1px solid "+(extType==="out"?ACCENT:C.b1),borderRadius:12,padding:"11px 10px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Custos</div><div style={{fontSize:13,fontWeight:900,color:"#ef4444"}}>{fmt(selTotals.outs)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Saldo</div><div style={{fontSize:13,fontWeight:900,color:selBalance>=0?ACCENT:"#ef4444"}}>{fmt(selBalance)}</div></div>
                  </div>

                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>LANÇAMENTOS</span>
                    <select value={extCat} onChange={e=>setExtCat(e.target.value)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:9,padding:"5px 8px",color:C.text,fontSize:10,outline:"none"}}>
                      <option value="">Todas categorias</option>
                      {allCats.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{display:"flex",gap:6,marginBottom:14}}>
                    {[{v:"todos",l:"Todos"},{v:"in",l:"Receitas"},{v:"out",l:"Custos"}].map(o=>(
                      <button key={o.v} onClick={()=>setExtType(o.v)} style={{flex:1,padding:"7px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:10,border:"1.5px solid "+(extType===o.v?ACCENT:C.b2),background:extType===o.v?ACCENT+"18":"transparent",color:extType===o.v?ACCENT:C.muted}}>{o.l}</button>
                    ))}
                  </div>

                  {selFuture?(<>
                    <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>Mês futuro — valores vêm das recorrências ativas. Edite pra ajustar só {monthLabel2(chartYm)} (a recorrência continua com o valor padrão nos outros meses); some uma categoria nova se precisar.{extType==="todos"&&" Mostrando Custos esperados — escolha Receitas ou Custos acima pra trocar."}</div>
                    {futureRows.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma categoria esperada ainda.</div>}
                    {futureRows.map((row,i)=>(<div key={row.cat+i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 11px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:7}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:700}}>{row.cat}</div>
                        {row.fromRecurring&&<div style={{fontSize:8,color:C.muted}}>da recorrência "{row.recDesc}"</div>}
                        {row.readOnly&&<div style={{fontSize:8,color:C.muted}}>{row.note} · não editável aqui</div>}
                      </div>
                      {row.readOnly
                        ?<span style={{fontSize:12,fontWeight:800,color:C.text}}>{fmt(row.amount)}</span>
                        :row.fromRecurring
                        ?<input type="number" value={row.amount} onChange={e=>setRecurringOverrides(p=>({...p,[chartYm+"|"+row.recId]:e.target.value}))} style={{width:78,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 9px",color:C.text,fontSize:12,outline:"none",textAlign:"right"}}/>
                        :<input type="number" value={row.amount} onChange={e=>setPlannedItems(p=>p.map(it=>it.id===row.plannedId?{...it,amount:e.target.value}:it))} style={{width:78,background:C.bg,border:"1px solid "+C.b2,borderRadius:8,padding:"7px 9px",color:C.text,fontSize:12,outline:"none",textAlign:"right"}}/>}
                    </div>))}
                    <Btn outline sm color={ACCENT} onClick={()=>{
                      const opts=futureType==="in"?catsIn:catsOut;
                      setPlannedItems(p=>[...p,{id:"pi"+uid(),ym:chartYm,cat:opts[0],type:futureType,amount:0}]);
                    }}><Ico n="plus" size={11}/> Adicionar categoria esperada</Btn>
                  </>):(<>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 14px",marginBottom:14}}>
                      <span style={{fontSize:9,color:C.muted,fontWeight:600}}>{list.length} lançamento{list.length===1?"":"s"}</span>
                      <span style={{fontSize:14,fontWeight:900,color:total>=0?"#16a34a":"#ef4444"}}>{total>=0?"+":"-"}{fmt(Math.abs(total))}</span>
                    </div>
                    {list.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum lançamento encontrado com esses filtros.</div>}
                    {list.map((tx,i)=>{
                      const splitPerson = tx.split ? splitPeople.find(p=>p.id===tx.split.personId) : null;
                      const shownAmount = tx.type==="in" ? tx.amount : mySplitShare(tx);
                      return(<div key={tx.id+i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={12} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.sourceName} · {tx.date.split("-").reverse().join("/")}</div>{splitPerson&&<div style={{fontSize:8,color:"#f59e0b"}}>Total pago {fmt(tx.amount)} · {splitPerson.name} deve {fmt(tx.amount-shownAmount)} · {tx.split.settled?"recebido":"pendente"}</div>}</div><div style={{fontSize:12,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444",flexShrink:0}}>{tx.type==="in"?"+":"-"}{fmt(shownAmount)}</div></div>);
                    })}
                  </>)}
                </div>);
              })()}
              {vIdx===1&&(<div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:18,marginBottom:10,textAlign:"center"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>TAXA DE POUPANÇA</div><div style={{fontSize:52,fontWeight:900,color:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",lineHeight:1}}>{savingsRate}%</div><div style={{fontSize:11,color:C.muted,marginTop:6}}>Meta saudável: 20%+</div><div style={{height:8,background:C.b1,borderRadius:99,overflow:"hidden",margin:"16px 0 8px"}}><div style={{height:"100%",width:Math.min(100,savingsRate)+"%",background:savingsRate>=20?ACCENT:savingsRate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>HISTÓRICO</div>{months6.slice().reverse().map(m=>{const rate=m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0;return(<div key={m.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:m.ym===cf.ym?ACCENT:C.text,fontWeight:m.ym===cf.ym?700:400}}>{monthLabel2(m.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,rate)+"%",background:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color:rate>=20?ACCENT:rate>=10?"#f59e0b":"#ef4444",minWidth:30,textAlign:"right"}}>{rate}%</span></div>);})}</div></div>)}
              {vIdx===2&&(<div><div style={{background:"linear-gradient(135deg,#ef444418,#ef444406)",border:"1px solid #ef444433",borderRadius:14,padding:16,marginBottom:10,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>TOTAL EM DÍVIDAS</div><div style={{fontSize:28,fontWeight:900,color:"#ef4444"}}>{fmt(totDebtNow)}</div></div>{debts.map(d=>{const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} style={{background:C.card,border:"1px solid "+d.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{d.name}</div>{d.credor&&<div style={{fontSize:9,color:d.color}}>{d.credor}</div>}</div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:d.color}}>{fmt((d.totalParcelas-d.parcelasPagas)*d.valorParcela)}</div><div style={{fontSize:9,color:C.muted}}>restante</div></div></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>{d.parcelasPagas}/{d.totalParcelas} ({pct}%)</div></div>);})}{debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}</div>)}
              {vIdx===3&&(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>TOTAL INVESTIDO</div><div style={{fontSize:22,fontWeight:900,color:ACCENT}}>{fmt(invs.reduce((s,i)=>s+i.invested,0))}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>RENDIMENTO</div><div style={{fontSize:22,fontWeight:900,color:invs.reduce((s,i)=>s+(i.balance-i.invested),0)>=0?ACCENT:"#ef4444"}}>{fmt(invs.reduce((s,i)=>s+(i.balance-i.invested),0))}</div></div></div></div>{investPerf.map((inv,i)=>{const positive=inv.gain>=0;return(<div key={i} style={{background:C.card,border:"1px solid "+inv.color+"22",borderRadius:12,padding:"11px 13px",marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:6,height:6,borderRadius:"50%",background:inv.color}}/><span style={{fontSize:12,fontWeight:600}}>{inv.name}</span></div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:positive?ACCENT+"22":"#ef444422",color:positive?ACCENT:"#ef4444",fontWeight:700}}>{positive?"+":""}{inv.pct}%</span><span style={{fontSize:12,fontWeight:700,color:positive?ACCENT:"#ef4444"}}>{positive?"+":""}{fmt(inv.gain)}</span></div></div></div>);})}</div>)}
              {vIdx===4&&(function InlineBlock(){const ptsAll=retroPatrim();const pts=ptsAll.slice(-24);const maxP=Math.max(...pts.map(p=>Math.abs(p.net)),1);const nowYm=new Date().toISOString().slice(0,7);const totalGain=pts.length>1?pts[pts.length-1].net-pts[0].net:0;return(<div><div style={{background:"linear-gradient(135deg,"+ACCENT+"18,"+ACCENT+"06)",border:"1px solid "+ACCENT+"33",borderRadius:14,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>PATRIMÔNIO ATUAL</div><div style={{fontSize:26,fontWeight:900,color:ACCENT}}>{fmt(net)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>VARIAÇÃO</div><div style={{fontSize:16,fontWeight:800,color:totalGain>=0?ACCENT:"#ef4444"}}>{totalGain>=0?"+":""}{fmt(totalGain)}</div></div></div></div><div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>EVOLUÇÃO — {pts.length} {pts.length===1?"MÊS":"MESES"}{ptsAll.length>pts.length?" (últimos 24 de "+ptsAll.length+")":""}</div><div style={{display:"flex",gap:6,alignItems:"flex-end",height:90}}>{pts.map((p,i)=>{const h=Math.max(4,(Math.abs(p.net)/maxP)*82);const color=p.net>=0?(p.ym===nowYm?ACCENT:ACCENT+"66"):"#ef4444";return(<div key={p.ym} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:color,height:h+"px"}}/><div style={{fontSize:7,color:p.ym===nowYm?ACCENT:C.muted,fontWeight:p.ym===nowYm?700:400,whiteSpace:"nowrap"}}>{monthLabel2(p.ym)}</div></div>);})}</div></div><div style={{fontSize:9,color:C.muted,lineHeight:1.6}}>Cada mês é gravado uma vez e não muda mais depois (só o mês corrente segue ao vivo) — histórico cresce mês a mês a partir de {ptsAll[0]?monthLabel2(ptsAll[0].ym):"agora"}.</div></div>);})()}
              {vIdx===5&&(function InlineBlock(){
                const horizon=PROJ_HORIZONS.find(h=>h.id===projHorizonId)||PROJ_HORIZONS[2];
                const scenarioActive=projEvents.length>0;
                const base=buildProjSeries(horizon.days,null);
                const scen=scenarioActive?buildProjSeries(horizon.days,projEvents):null;
                const shown=scen||base;
                const endShown=shown[shown.length-1].balance;
                const milestones=projMilestones(horizon.days);
                const negIdx=shown.findIndex(p=>p.balance<0);
                const upcoming=horizon.days<=90?projUpcoming(horizon.days):[];
                const fmtDate=ds=>ds.split("-").reverse().join("/");
                return(<div>
                  <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>{PROJ_HORIZONS.map(h=>(<button key={h.id} onClick={()=>setProjHorizonId(h.id)} style={{padding:"6px 11px",borderRadius:99,cursor:"pointer",fontWeight:700,fontSize:10,border:"1.5px solid "+(projHorizonId===h.id?ACCENT:C.b2),background:projHorizonId===h.id?ACCENT+"18":"transparent",color:projHorizonId===h.id?ACCENT:C.muted}}>{h.l}</button>))}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Saldo hoje</div><div style={{fontSize:13,fontWeight:900}}>{fmt(totAcc)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Projetado</div><div style={{fontSize:13,fontWeight:900,color:endShown>=0?ACCENT:"#ef4444"}}>{fmt(endShown)}</div></div>
                    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:600,marginBottom:3}}>Variação</div><div style={{fontSize:13,fontWeight:900,color:(endShown-totAcc)>=0?ACCENT:"#ef4444"}}>{(endShown-totAcc)>=0?"+":""}{fmt(endShown-totAcc)}</div></div>
                  </div>
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    <ProjChart base={base} scenario={scen} C={C}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginTop:6}}><span>Hoje</span><span>{fmtDate(base[base.length-1].date)}</span></div>
                    {scenarioActive&&(<div style={{display:"flex",gap:14,marginTop:10,fontSize:9,color:C.muted}}><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px solid "+C.dim,display:"inline-block"}}/>Atual</span><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+ACCENT,display:"inline-block"}}/>Cenário ajustado</span></div>)}
                  </div>
                  {negIdx>=0&&(<div style={{display:"flex",gap:10,alignItems:"center",background:"#ef444414",border:"1px solid #ef444433",borderRadius:12,padding:"11px 13px",marginBottom:10}}><Ico n="zap" size={14} color="#ef4444"/><div style={{fontSize:11,color:"#ef4444",fontWeight:600}}>Saldo pode ficar negativo em {fmtDate(shown[negIdx].date)} nesse ritmo.</div></div>)}
                  {milestones.length>0&&(<div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>MARCOS NO PERÍODO</div>
                    {milestones.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+C.b1,borderRadius:10,padding:"9px 12px",marginBottom:6}}><div><div style={{fontSize:11,fontWeight:700}}>{m.label}</div><div style={{fontSize:9,color:m.color}}>{m.detail}</div></div><div style={{fontSize:10,color:C.muted}}>{fmtDate(m.date)}</div></div>))}
                  </div>)}
                  {upcoming.length>0&&(<div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>PRÓXIMOS LANÇAMENTOS CONHECIDOS</div>
                    {upcoming.map((u,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:5}}><div style={{width:22,height:22,borderRadius:6,flexShrink:0,background:u.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={u.type==="in"?"up":"down"} size={11} color={u.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1,fontSize:11,fontWeight:600}}>{u.desc}</div><div style={{fontSize:9,color:C.muted,marginRight:6}}>{fmtDate(u.date)}</div><div style={{fontSize:11,fontWeight:700,color:u.type==="in"?"#16a34a":"#ef4444"}}>{u.type==="in"?"+":"-"}{fmt(u.amount)}</div></div>))}
                  </div>)}
                  <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:12}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>AJUSTAR CENÁRIO</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:10}}>Simula "e se" sem alterar nenhum dado real — dá pra somar vários eventos na mesma projeção.</div>
                    {projEvents.map((ev,idx)=>(
                      <div key={ev.id} style={{background:C.b1,borderRadius:10,padding:10,marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <input value={ev.label||""} onChange={e=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,label:e.target.value}:x))} placeholder="Nome do evento (opcional, ex: Viagem)" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:11,fontWeight:600,outline:"none"}}/>
                          <button onClick={()=>setProjEvents(p=>p.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={12} color={C.muted}/></button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                          <FI label="Receita extra (R$/mês)" value={ev.deltaIn||0} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,deltaIn:v}:x))} type="number" C={C}/>
                          <FI label="Redução de custo (R$/mês)" value={ev.deltaOut||0} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,deltaOut:v}:x))} type="number" C={C}/>
                        </div>
                        <FS label="A partir de" value={String(ev.fromM||0)} onChange={v=>setProjEvents(p=>p.map((x,i)=>i===idx?{...x,fromM:Number(v)}:x))} opts={[{v:"0",l:"Imediato"},{v:"6",l:"Em 6 meses"},{v:"12",l:"Em 1 ano"}]} C={C}/>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8}}>
                      <Btn outline sm color={ACCENT} onClick={()=>setProjEvents(p=>[...p,{id:"pe"+uid(),label:"",deltaIn:0,deltaOut:0,fromM:0}])}><Ico n="plus" size={11}/> Adicionar evento</Btn>
                      {scenarioActive&&<Btn outline color={C.muted} sm onClick={()=>setProjEvents([])}>Resetar cenário</Btn>}
                    </div>
                  </div>
                  <div style={{fontSize:9,color:C.muted,lineHeight:1.6}}>Projeção: parte orgânica (entradas/saídas de conta) pela média dos últimos 3 meses · faturas de cartão pela data real de vencimento de cada parcela pendente (não mais média) · dívidas descontadas até a quitação. Não prevê gastos variáveis ou imprevistos — trate como tendência, não como garantia.</div>
                </div>);
              })()}
              <div style={{display:"flex",gap:5,justifyContent:"center",padding:"18px 0 4px"}}>{VIEWS.map((_,i)=>(<button key={i} onClick={()=>setFluxoView(i)} style={{width:i===vIdx?16:6,height:6,borderRadius:99,background:i===vIdx?ACCENT:C.b2,border:"none",cursor:"pointer",transition:"all .2s",padding:0}}/>))}</div>
            </div>
          );
        })()}
    </>
  );
}
