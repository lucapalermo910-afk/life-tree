// Shared/ui.jsx (item 2) e theme/icons/constants/helpers (item 5, passo 2) saíram daqui em
// 26/08/2026. Desde o passo 4 (Bolsos/OrçamentoFluxo/Objetivos/Config viraram arquivos
// próprios), o shell não usa mais nenhum export de shared/ui.jsx nem de yesod/helpers.jsx —
// só o que sobrou de cross-cutting (hub, DetailPages, Sheets, renderXRow) precisa daqui.
import { ACCENT, DARK, LIGHT } from "./yesod/theme.js";
import { Ico } from "./yesod/icons.jsx";
import { fmt, accBal, getStmts, TABS } from "./yesod/constants.js";
// yesod/context.js — extraído em 26/08/2026 (item 5, passo 3 do Plano de Decomposição, ver
// 11 Plano de Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 3"). Todo
// useState+persistência+cálculo financeiro+ação de CRUD que antes vivia direto no corpo
// deste componente agora mora em useYesodState() — chamado uma vez aqui, distribuído via
// YesodCtx.Provider pra abas futuras (passo 4) poderem consumir via useContext em vez de
// receber tudo por prop. Os 5 renderXRow e toda a JSX abaixo continuam aqui de propósito —
// dependem de C (tema), que é apresentação, não dado (ver comentário em context.js).
import { useYesodState, YesodCtx } from "./yesod/context.js";
import { Sheets } from "./yesod/Sheets.jsx";
import { DetailPages } from "./yesod/DetailPages.jsx";
import { BolsosTab } from "./yesod/BolsosTab.jsx";
import { OrcamentoFluxoTab } from "./yesod/OrcamentoFluxoTab.jsx";
import { ObjetivosTab } from "./yesod/ObjetivosTab.jsx";
import { ConfigTab } from "./yesod/ConfigTab.jsx";

export default function YesodModule({ onBack, dark, setDark, askCoach }) {
  const C = dark ? DARK : LIGHT;
  const ctx0 = useYesodState();
  // askCoach (29/08/2026, motor genérico de objetivo+plano) — dispara sendToCoach do App.jsx
  // com uma mensagem programática, reaproveitando 100% do chat/skill/ação que já existe.
  // Só ObjetivosTab.jsx usa hoje (consumido via useContext(YesodCtx), não passado por prop
  // direta — mesmo padrão do resto do ctx).
  const ctx = { ...ctx0, askCoach };
  // Destructuring parcial de propósito (26/08/2026, encolhido de novo no passo 4 — ver 11
  // Plano de Decomposição — Arquivos Monolíticos.md) — ctx tem 177 chaves (tudo que
  // useYesodState expõe), mas o shell só puxa pro escopo local o que ele mesmo usa direto
  // (hub, renderXRow, DetailPages/Sheets como props de C). Cada arquivo de aba
  // (BolsosTab/OrcamentoFluxoTab/ObjetivosTab/ConfigTab) lê o resto via useContext(YesodCtx)
  // próprio, sem passar por aqui.
  const {
    accs, bkOf, budgetSpend, budgets, calcYesodScore, cards, cashflowMonth, catsOut, debtLateInfo,
    debts, delAcc, delBox, delCard, delDebt, delOwed, despesasExpanded, getMonthStr,
    guard, ifGoal, ifMonthly, invs, nav, net, openSh, orcSection, page, pendingSplits,
    recurringAmountFor, recurringOverrides, recurringPendingDates, recurrings, setDespesasExpanded,
    setFinXp, setOrcSection, setPage, setSh, setTab, setYHabits, sharedOwed, splitPeople, tab,
    toast, today, totAcc, totInv, vencimentoAlerts, yGoals, yHabits, yesodCards,
  } = ctx;

  // Renderizadores de linha extraídos de Bolsos (26/08/2026) -- usados tanto em Bolsos
  // quanto no "Índice de tudo" de Config, pra não duplicar a mesma lógica de
  // clique/editar/apagar em dois lugares.
  const renderAccRow=ac=>{const bk2=bkOf(ac.bankId);const accColor=ac.isCash?"#f59e0b":(bk2?.color||ACCENT);const bal=accBal(ac);return(<div key={ac.id} onClick={()=>nav("account",ac.id)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:accColor+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n={ac.isCash?"wallet":"bank"} size={16} color={accColor}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{ac.isCash?"Carteira":bk2?.name}</div><div style={{fontSize:10,color:C.muted}}>{ac.isCash?"Dinheiro":ac.name}</div></div><div style={{fontSize:16,fontWeight:900,color:bal>=0?ACCENT:"#ef4444"}}>{fmt(bal)}</div>{!ac.isCash&&(<><button onClick={e=>{e.stopPropagation();openSh("editAcc",{id:ac.id,bankId:ac.bankId,name:ac.name});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();guard(()=>delAcc(ac.id),"Apagar a conta \""+ac.name+"\" e todo o histórico de lançamentos dela? Essa ação não pode ser desfeita.");}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></>)}</div></div>);};
  const renderCardRow=cd=>{const stmts=getStmts(cd);const debt=stmts.reduce((s,st)=>s+st.total,0);const used=Math.min(100,Math.round((debt/cd.limit)*100));return(<div key={cd.id} onClick={()=>nav("card",cd.id)} style={{background:C.card,border:"1px solid "+cd.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:cd.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="card" size={16} color={cd.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{cd.name}</div><div style={{fontSize:9,color:C.muted}}>Fecha {cd.closeDay} · Vence {cd.dueDay}</div></div><button onClick={e=>{e.stopPropagation();openSh("editCard",{id:cd.id,bankId:cd.bankId,name:cd.name,limit:cd.limit,closeDay:cd.closeDay,dueDay:cd.dueDay,color:cd.color});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();guard(()=>delCard(cd.id),"Apagar o cartão \""+cd.name+"\" e todo o histórico de faturas dele? Essa ação não pode ser desfeita.");}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:used+"%",background:used>80?"#ef4444":used>50?"#f59e0b":cd.color,borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Usado: {fmt(debt)}</span><span>Limite: {fmt(cd.limit)}</span></div></div>);};
  const renderBoxRow=bx=>{const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));return(<div key={bx.id} onClick={()=>nav("box",bx.id)} style={{background:C.card,border:"1px solid "+bx.color+"22",borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:10,background:bx.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="piggy" size={16} color={bx.color}/></div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{bx.name}</div><div style={{fontSize:9,color:C.muted}}>Meta: {fmt(bx.goal)}{bx.targetDate?" · até "+bx.targetDate.split("-").reverse().join("/"):""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:bx.color}}>{fmt(bx.balance)}</div><div style={{fontSize:9,color:C.muted}}>{pct}%</div></div><button onClick={e=>{e.stopPropagation();openSh("editBox",{id:bx.id,name:bx.name,goal:bx.goal,targetDate:bx.targetDate||"",color:bx.color,rate:bx.rate||0,rateUnit:bx.rateUnit||"ano"});}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={e=>{e.stopPropagation();guard(()=>delBox(bx.id),"Apagar a caixinha \""+bx.name+"\"? O saldo dela não volta pra nenhuma conta — essa ação não pode ser desfeita.");}} style={{background:"none",border:"none",cursor:"pointer",padding:3,display:"flex"}}><Ico n="x" size={13} color={C.muted}/></button></div><div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div></div>);};
  const renderInvCatRow=cat=>{const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));const tot=ci.reduce((s,i)=>s+i.balance,0);const gain=tot-ci.reduce((s,i)=>s+i.invested,0);return(<div key={cat.id} onClick={()=>nav("inv",cat.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",background:C.card,border:"1px solid "+(ci.length?cat.color+"22":C.b1),borderRadius:12,marginBottom:8,cursor:"pointer",opacity:ci.length?1:.5}}><div style={{width:10,height:10,borderRadius:"50%",background:cat.color}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{cat.label}</div>{ci.length>0&&<div style={{fontSize:9,color:gain>=0?"#10b981":"#ef4444",fontWeight:600}}>{gain>=0?"+":""}{fmt(gain)}</div>}{ci.length===0&&<div style={{fontSize:9,color:C.muted}}>Nenhum ativo</div>}</div>{ci.length>0&&<div style={{fontSize:14,fontWeight:800,color:cat.color}}>{fmt(tot)}</div>}<Ico n="chev" size={12} color={C.muted}/></div>);};
  const renderDebtRow=d=>{const restantes=d.totalParcelas-d.parcelasPagas;const saldo=restantes*d.valorParcela;const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));return(<div key={d.id} onClick={()=>nav("debt",d.id)} style={{background:C.card,border:"1px solid "+d.color+"33",borderRadius:14,padding:14,marginBottom:10,cursor:"pointer"}}><div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:d.color,marginTop:5,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{d.name}</div><div style={{fontSize:9,color:C.muted}}>{d.credor&&<span style={{color:d.color}}>{d.credor} </span>}{fmt(d.valorParcela)}/mês</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:d.color}}>{fmt(saldo)}</div><div style={{fontSize:9,color:C.muted}}>saldo devedor</div></div><button onClick={e=>{e.stopPropagation();guard(()=>delDebt(d.id),"Apagar a dívida \""+d.name+"\"? Essa ação não pode ser desfeita.");}} style={{background:C.b1,border:"none",borderRadius:99,width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={10} color={C.muted}/></button></div><div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div><div style={{fontSize:9,color:C.muted}}>Pago: {pct}% · {d.parcelasPagas}/{d.totalParcelas} parcelas</div></div>);};

  return (
    <YesodCtx.Provider value={ctx}>
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:C.card,
          border:"1px solid #10b98133",borderRadius:9,padding:"7px 12px",cursor:"pointer",
          color:"#10b981",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>Yesod · Finanças</span>
      </div>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}select option{background:"+C.surface+";}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:scale(.8) translateX(-50%)}100%{opacity:1;transform:scale(1) translateX(-50%)}}"}</style>

      {toast&&(<div style={{position:"fixed",top:16,left:"50%",background:toast.color,color:"#fff",padding:"8px 18px",borderRadius:99,fontWeight:700,fontSize:12,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none",animation:"popIn .25s ease forwards",transform:"translateX(-50%)"}}>{toast.msg}</div>)}

      {/* HEADER */}
      <div style={{padding:"18px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2}}>YESOD</div><div style={{fontSize:18,fontWeight:800}}>Finanças</div></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* FIX 1: default method=pix + first account pre-selected */}
          {!page&&(tab==="yesod"||(tab==="orc"&&orcSection==="fluxo"))&&(<button onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:catsOut[0],method:"pix",cardId:"",accId:accs[0]?.id||"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:""})} style={{background:"linear-gradient(135deg,"+ACCENT+"dd,"+ACCENT+"88)",border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Ico n="zap" size={13} color="#fff"/> Registrar</button>)}
          <button onClick={()=>setDark(d=>!d)} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ico n={dark?"sun":"moon"} size={14} color={C.dim}/></button>
        </div>
      </div>

      {/* NET BAR */}
      <div style={{padding:"8px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginBottom:3}}><span>Patrimônio líquido</span><span style={{fontWeight:700,color:ACCENT}}>{fmt(net)}</span></div>
        <div style={{height:3,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:"100%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div>
      </div>

      <div style={{padding:"10px 16px 90px"}}>

        <DetailPages C={C}/>

        {/* ══ YESOD — VISÃO GERAL ══ */}
        {!page&&tab==="yesod"&&(function YesodTab(){
          const ys=calcYesodScore();
          const {overdue:overdueAlerts,upcoming:alerts}=vencimentoAlerts();
          const openAlert=al=>{
            if(al.kind==="card"){ nav("card",al.ref); return; }
            if(al.kind==="debt"){
              const d=debts.find(x=>x.id===al.ref);
              let jurosAtraso=0;
              if(d&&d.taxaJuros>0&&al.qtd>0){
                const monthlyRate=d.taxaJurosUnit==="mes"?(d.taxaJuros/100):(d.taxaJuros/100)/12;
                jurosAtraso=Math.round(d.valorParcela*monthlyRate*al.qtd*100)/100;
              }
              openSh("payDebt",{debtId:al.ref,accId:"",qtd:al.qtd,jurosAtraso});
              return;
            }
            if(al.kind==="recurring"){
              const r=recurrings.find(x=>x.id===al.ref);if(!r)return;
              const overrideKey=al.dueDate.slice(0,7)+"|"+r.id;
              const amount=Object.prototype.hasOwnProperty.call(recurringOverrides,overrideKey)?Number(recurringOverrides[overrideKey]):r.amount;
              openSh("payRecurring",{recurringId:r.id,accId:r.accId||"",desc:r.desc,amount,dueDate:al.dueDate,jurosAtraso:0});
            }
          };

          return(<div style={{animation:"slideUp .3s ease"}}>
            {/* Score principal */}
            <div style={{background:"linear-gradient(135deg,#10b98122,#10b98106)",border:"1px solid #10b98144",borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:2}}>YESOD — SAÚDE FINANCEIRA</div>
                <div style={{fontSize:46,fontWeight:900,color:ACCENT,lineHeight:1}}>{ys}<span style={{fontSize:18}}>%</span></div>
              </div>
              <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:ys+"%",background:"linear-gradient(90deg,#10b981,#06b6d4)",borderRadius:99,transition:"width .6s"}}/></div>
            </div>

            {/* Visão geral de Receitas/Despesas do mês (31/08/2026, pedido do usuário,
                substituiu os INDICADORES customizáveis) — Efetivada = já virou transação de
                verdade (cashflowMonth do mês atual); Esperada = próxima ocorrência de
                recorrência ativa cujo nextDate cai neste mês e ainda não foi paga (nextDate só
                avança depois que o usuário confirma o pagamento — ver payRecurringOccorrence
                em context.js, por isso nextDate<mês atual nunca acontece aqui). Vencida/Próxima
                do vencimento em despesas reaproveitam exatamente a mesma regra de
                debtLateInfo/recurringPendingDates/getStmts que já alimenta os cards "EM
                ATRASO"/"VENCE NOS PRÓXIMOS 7 DIAS" logo abaixo — os totais batem com esses
                cards por construção, não é um cálculo paralelo. */}
            {(()=>{
              const curYm=getMonthStr(0);
              const cfNow=cashflowMonth(0);

              const receitasEfetivadas=cfNow.ins;
              const receitasEsperadas=recurrings
                .filter(r=>r.active&&r.type==="in"&&r.nextDate.slice(0,7)===curYm)
                .reduce((s,r)=>s+recurringAmountFor(r,curYm),0);
              const receitasTotais=receitasEfetivadas+receitasEsperadas;

              const despesasEfetivadas=cfNow.outs;
              const despesasVencidas=
                recurrings.reduce((s,r)=>s+recurringPendingDates(r).length*recurringAmountFor(r,curYm),0)
                +debts.reduce((s,d)=>{ if(d.parcelasPagas>=d.totalParcelas) return s; const li=debtLateInfo(d); return li.atraso>0?s+d.valorParcela*li.atraso:s; },0);
              const despesasProximas=
                cards.reduce((s,cd)=>{ const stmts=getStmts(cd); const next=stmts.find(st=>st.due>=today); if(!next) return s; const days=Math.round((new Date(next.due)-new Date(today))/864e5); return days<=7?s+next.total:s; },0)
                +debts.reduce((s,d)=>{ if(d.parcelasPagas>=d.totalParcelas) return s; const li=debtLateInfo(d); if(li.atraso>0||!li.nextDue) return s; const days=Math.round((new Date(li.nextDue)-new Date(today))/864e5); return days<=7?s+d.valorParcela:s; },0);
              const despesasEsperadas=
                recurrings.filter(r=>r.active&&r.type==="out"&&r.nextDate.slice(0,7)===curYm&&r.nextDate>=today).reduce((s,r)=>{ const days=Math.round((new Date(r.nextDate)-new Date(today))/864e5); return days>7?s+recurringAmountFor(r,curYm):s; },0)
                +debts.reduce((s,d)=>{ if(d.parcelasPagas>=d.totalParcelas) return s; const li=debtLateInfo(d); if(li.atraso>0||!li.nextDue||li.nextDue.slice(0,7)!==curYm) return s; const days=Math.round((new Date(li.nextDue)-new Date(today))/864e5); return days>7?s+d.valorParcela:s; },0);
              const despesasTotais=despesasEfetivadas+despesasVencidas+despesasProximas+despesasEsperadas;

              const MiniBox=({l,v,c})=>(
                <div style={{background:C.surface,borderRadius:8,padding:"7px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:C.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:900,color:c}}>{fmt(v)}</div>
                </div>
              );
              return(<>
                <div style={{background:C.card,border:"1px solid #16a34a33",borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>RECEITAS DO MÊS</div>
                    <div style={{fontSize:18,fontWeight:900,color:"#16a34a"}}>{fmt(receitasTotais)}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <MiniBox l="EFETIVADAS" v={receitasEfetivadas} c="#16a34a"/>
                    <MiniBox l="ESPERADAS" v={receitasEsperadas} c={C.muted}/>
                  </div>
                </div>
                <div style={{background:C.card,border:"1px solid #ef444433",borderRadius:14,padding:14,marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>DESPESAS DO MÊS</div>
                    <div style={{fontSize:18,fontWeight:900,color:"#ef4444"}}>{fmt(despesasTotais)}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <MiniBox l="EFETIVADAS" v={despesasEfetivadas} c="#ef4444"/>
                    <MiniBox l="ESPERADAS" v={despesasEsperadas} c={C.muted}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <MiniBox l="VENCIDAS" v={despesasVencidas} c="#dc2626"/>
                    <MiniBox l="PRÓX. VENCIMENTO" v={despesasProximas} c="#f97316"/>
                  </div>
                </div>
              </>);
            })()}

            {/* Alertas de vencimento — EM ATRASO (parcela de dívida vencida, recorrência de
                saída pendente) primeiro, depois PRÓXIMOS 7 DIAS; ambos clicáveis pra pagar
                direto dali (26/08/2026) */}
            {overdueAlerts.length>0&&(
              <div style={{background:C.card,border:"1px solid #ef444466",borderRadius:14,padding:12,marginBottom:14}}>
                <div style={{fontSize:9,color:"#ef4444",fontWeight:700,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico n="debt" size={11} color="#ef4444"/> EM ATRASO</div>
                {overdueAlerts.map(al=>(<div key={al.id} onClick={()=>openAlert(al)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:"1px solid "+C.b1,cursor:"pointer"}}>
                  <div><div style={{fontSize:11,fontWeight:600}}>{al.label}</div><div style={{fontSize:9,color:"#ef4444",fontWeight:700}}>{al.days<=0?"vence hoje":al.days+"d de atraso"}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:800,color:"#ef4444"}}>{fmt(al.amount)}</span><Ico n="chev" size={11} color={C.muted}/></div>
                </div>))}
              </div>
            )}
            {alerts.length>0&&(
              <div style={{background:C.card,border:"1px solid #f9731644",borderRadius:14,padding:12,marginBottom:14}}>
                <div style={{fontSize:9,color:"#f97316",fontWeight:700,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico n="debt" size={11} color="#f97316"/> VENCE NOS PRÓXIMOS 7 DIAS</div>
                {alerts.map(al=>{const urgent=al.days<=2;return(<div key={al.id} onClick={()=>openAlert(al)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid "+C.b1,cursor:"pointer"}}>
                  <div><div style={{fontSize:11,fontWeight:600}}>{al.label}</div><div style={{fontSize:9,color:urgent?"#ef4444":C.muted,fontWeight:urgent?700:400}}>{al.days===0?"Vence hoje":al.days===1?"Vence amanhã":"Vence em "+al.days+" dias"}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:800,color:urgent?"#ef4444":al.color}}>{fmt(al.amount)}</span><Ico n="chev" size={11} color={C.muted}/></div>
                </div>);})}
              </div>
            )}
            {/* PRÓXIMAS RECEITAS (31/08/2026, pedido do usuário — "mesma forma" do card de
                despesas acima, agora pro lado das entradas). Só informativo, sem onClick: ao
                contrário de despesa (que exige confirmar "Pagar Conta" manualmente, ver
                payRecurringOccurrence), recorrência de ENTRADA já lança sozinha assim que
                nextDate chega (ver useEffect de recorrências em context.js) — não existe ação
                de "confirmar recebimento" pra abrir aqui, é só um aviso do que está a caminho. */}
            {(()=>{
              const proximasReceitas=recurrings
                .filter(r=>r.active&&r.type==="in")
                .map(r=>({...r,days:Math.round((new Date(r.nextDate)-new Date(today))/864e5)}))
                .filter(r=>r.days>=0&&r.days<=7)
                .sort((a,b)=>a.days-b.days);
              if(!proximasReceitas.length) return null;
              return(
                <div style={{background:C.card,border:"1px solid #16a34a44",borderRadius:14,padding:12,marginBottom:14}}>
                  <div style={{fontSize:9,color:"#16a34a",fontWeight:700,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ico n="up" size={11} color="#16a34a"/> PRÓXIMAS RECEITAS</div>
                  {proximasReceitas.map(r=>(<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid "+C.b1}}>
                    <div><div style={{fontSize:11,fontWeight:600}}>{r.desc}</div><div style={{fontSize:9,color:C.muted}}>{r.days===0?"Hoje":r.days===1?"Amanhã":"Em "+r.days+" dias"}</div></div>
                    <span style={{fontSize:12,fontWeight:800,color:"#16a34a"}}>{fmt(recurringAmountFor(r,getMonthStr(0)))}</span>
                  </div>))}
                </div>
              );
            })()}
            {/* Despesas divididas pendentes — nos DOIS sentidos (26/08/2026): receivables
                (accs[].txs[].split — EU paguei, o outro me deve) e sharedOwed (o OUTRO pagou,
                eu devo — criado dentro do próprio Registrar, ver launch()). Só mostra o que
                ainda está pendente — uma vez acertada, a despesa vira transação normal no
                extrato da conta (fonte de verdade do histórico), não precisa de selo "Pago"/
                "Recebido" aqui. Clicar na linha inteira já abre a quitação como um lançamento
                (escolher conta → confirma → dinheiro sai/entra e a pendência fecha) — sem
                botão à parte. Bolinha verde = a receber, vermelha = a pagar.
                Pessoas com settlementMode "net" (Config → Pessoas) entram AGRUPADAS numa
                única linha de saldo líquido em vez de uma linha por despesa — quita tudo com
                aquela pessoa de uma vez só, com uma transação em vez de várias. */}
            {(()=>{
              const pendReceivable=pendingSplits().filter(t=>!t.split.settled);
              const pendPayable=sharedOwed.filter(o=>!o.settled);
              if(!pendReceivable.length && !pendPayable.length) return null;
              const netIds=new Set(splitPeople.filter(p=>p.settlementMode==="net").map(p=>p.id));
              const itemReceivable=pendReceivable.filter(t=>!netIds.has(t.split.personId));
              const itemPayable=pendPayable.filter(o=>!netIds.has(o.personId));
              const netGroups=[...netIds].map(pid=>{
                const recv=pendReceivable.filter(t=>t.split.personId===pid);
                const pay=pendPayable.filter(o=>o.personId===pid);
                if(!recv.length&&!pay.length) return null;
                const totRecv=recv.reduce((s,t)=>s+t.amount*(t.split.theirPercent/100),0);
                const totPay=pay.reduce((s,o)=>s+Number(o.amount),0);
                const lastDate=[...recv.map(t=>t.date),...pay.map(o=>o.date)].sort().slice(-1)[0];
                return{personId:pid,net:totRecv-totPay,count:recv.length+pay.length,date:lastDate};
              }).filter(Boolean);
              const totReceivablePend=itemReceivable.reduce((s,t)=>s+t.amount*(t.split.theirPercent/100),0)+netGroups.reduce((s,g)=>s+Math.max(0,g.net),0);
              const totPayablePend=itemPayable.reduce((s,o)=>s+Number(o.amount),0)+netGroups.reduce((s,g)=>s+Math.max(0,-g.net),0);
              const combined=[
                ...itemReceivable.map(t=>({kind:"receivable",key:"r-"+t.id,date:t.date,raw:t})),
                ...itemPayable.map(o=>({kind:"payable",key:"p-"+o.id,date:o.date,raw:o})),
                ...netGroups.map(g=>({kind:"net",key:"n-"+g.personId,date:g.date,raw:g})),
              ].sort((a,b)=>b.date.localeCompare(a.date));
              return(
                <div style={{background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:14,padding:12,marginBottom:14}}>
                  <div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:8}}>DESPESAS DIVIDIDAS</div>
                  <div style={{display:"flex",gap:14,marginBottom:10,fontSize:10,fontWeight:700}}>
                    {totReceivablePend>0&&<span style={{color:ACCENT}}>a receber {fmt(totReceivablePend)}</span>}
                    {totPayablePend>0&&<span style={{color:"#ef4444"}}>a pagar {fmt(totPayablePend)}</span>}
                  </div>
                  {(despesasExpanded?combined:combined.slice(0,8)).map(row=>{
                    if(row.kind==="receivable"){
                      const t=row.raw;const person=splitPeople.find(p=>p.id===t.split.personId);const theirs=t.amount*(t.split.theirPercent/100);
                      return(<div key={row.key} onClick={()=>openSh("receiveSplit",{origAccId:t.accId,txId:t.id,origDesc:t.desc,theirs,accId:"",personName:person?.name||"?"})} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 4px",borderTop:"1px solid "+C.b1,cursor:"pointer"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:ACCENT,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                          <div style={{fontSize:9,color:C.muted}}>{person?.name||"?"} deve a você {fmt(theirs)} ({t.split.theirPercent}%) · {t.date.split("-").reverse().join("/")}</div>
                        </div>
                        <Ico n="chev" size={12} color={C.muted}/>
                      </div>);
                    }
                    if(row.kind==="payable"){
                      const o=row.raw;const person=splitPeople.find(p=>p.id===o.personId);
                      return(<div key={row.key} onClick={()=>openSh("paySplit",{owedId:o.id,personName:person?.name||"?",desc:o.desc,amount:o.amount,accId:""})} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 4px",borderTop:"1px solid "+C.b1,cursor:"pointer"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.desc}</div>
                          <div style={{fontSize:9,color:C.muted}}>Você deve a {person?.name||"?"} {fmt(o.amount)} · {o.date.split("-").reverse().join("/")}</div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();guard(()=>delOwed(o.id),"Apagar a pendência \""+o.desc+"\"?");}} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}}><Ico n="x" size={12} color={C.muted}/></button>
                      </div>);
                    }
                    const g=row.raw;const person=splitPeople.find(p=>p.id===g.personId);const zero=g.net===0;const favorMe=g.net>0;
                    return(<div key={row.key} onClick={()=>openSh("netSettle",{personId:g.personId,personName:person?.name||"?",net:g.net,count:g.count,accId:""})} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 4px",borderTop:"1px solid "+C.b1,cursor:"pointer"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:zero?C.muted:favorMe?ACCENT:"#ef4444",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person?.name||"?"} · saldo líquido ({g.count} {g.count>1?"itens":"item"})</div>
                        <div style={{fontSize:9,color:C.muted}}>{zero?"Zerado — só fecha as pendências":favorMe?"Deve a você "+fmt(g.net):"Você deve "+fmt(Math.abs(g.net))}</div>
                      </div>
                      <Ico n="chev" size={12} color={C.muted}/>
                    </div>);
                  })}
                  {combined.length>8&&(
                    <button onClick={()=>setDespesasExpanded(v=>!v)} style={{width:"100%",background:"none",border:"none",borderTop:"1px solid "+C.b1,marginTop:2,padding:"9px 4px 0",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700}}>
                      {despesasExpanded?"Ver menos":"Ver mais "+(combined.length-8)+" pendência"+(combined.length-8>1?"s":"")}
                    </button>
                  )}
                </div>
              );
            })()}

          </div>);
        })()}

        {!page&&tab==="orc"&&<OrcamentoFluxoTab C={C}/>}

        {/* ══ BOLSOS ══ — Contas (com Cartões aninhado dentro)/Caixinhas/Investimentos/
            Dívidas e Financiamentos (5ª seção, 25/08/2026 — antes era aba própria),
            com editar/apagar inline (antes só em Config, que agora só guarda o que não
            tem outro lugar) */}
        {!page&&tab==="bolsos"&&(
          <BolsosTab C={C} renderAccRow={renderAccRow} renderCardRow={renderCardRow} renderBoxRow={renderBoxRow} renderInvCatRow={renderInvCatRow} renderDebtRow={renderDebtRow}/>
        )}

        {/* ══ OBJETIVOS ══ — aba própria desde 25/08/2026 (antes: seção "IF" dentro da aba
            Yesod, e checklist de Metas dentro da Visão Geral). Junta o objetivo "fixo" do
            módulo (Independência Financeira) com metas livres criadas pelo usuário, no
            mesmo espírito de múltiplos objetivos do Hod. Vista colapsada (só o card
            principal, 25/08/2026 — usuário achou a tela cheia demais por padrão): tocar no
            card abre o detalhe completo (stats, taxa de poupança, editar meta, outras
            metas) em `page.type==="goalsDetail"`, dentro do próprio ObjetivosTab.jsx (não
            cross-tab como as outras 5 sub-páginas — ver DetailPages.jsx). */}
        {tab==="goals"&&(!page||page.type==="goalsDetail")&&<ObjetivosTab C={C}/>}

        {/* ══ CONFIG ══ — só o que não tem equivalente em outra tela (Contas/Cartões/
            Caixinhas/Investimentos passaram a ter editar/apagar direto em Bolsos, 01/08/2026) */}
        {!page&&tab==="cfg"&&<ConfigTab C={C} renderAccRow={renderAccRow} renderCardRow={renderCardRow} renderBoxRow={renderBoxRow} renderInvCatRow={renderInvCatRow} renderDebtRow={renderDebtRow}/>}

      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.nav,borderTop:"1px solid "+C.b1,zIndex:50,padding:"6px 0 12px",display:"flex"}}>
        {TABS.map(t=>{const a=tab===t.id&&!page;return(<button key={t.id} onClick={()=>{setTab(t.id);setPage(null);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"2px 0"}}><div style={{width:32,height:28,borderRadius:8,background:a?ACCENT+"13":"transparent",border:a?"1px solid "+ACCENT+"28":"1px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}><Ico n={t.icon} size={13} color={a?ACCENT:C.muted}/></div>{a&&<span style={{fontSize:7,fontWeight:700,color:ACCENT,letterSpacing:.2,whiteSpace:"nowrap"}}>{t.label.toUpperCase()}</span>}{!a&&<span style={{fontSize:1,color:"transparent"}}>.</span>}</button>);})}
      </div>

      <Sheets C={C}/>
    </div>
    </YesodCtx.Provider>
  );
}
