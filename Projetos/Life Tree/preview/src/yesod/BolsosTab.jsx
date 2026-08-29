import { useContext } from "react";
import { Btn } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt } from "./constants.js";
import { MiniTotal } from "./helpers.jsx";
import { ICAT } from "./seedData.js";
import { YesodCtx } from "./context.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Só a lista — as 5
// sub-páginas de detalhe (conta/cartão/caixinha/investimento/dívida) moraram em
// DetailPages.jsx, e os 5 renderXRow continuam no shell (fecham sobre C/nav/openSh/guard
// dele, ver context.js), passados aqui como props junto com C.
export function BolsosTab({ C, renderAccRow, renderCardRow, renderBoxRow, renderInvCatRow, renderDebtRow }) {
  const ctx = useContext(YesodCtx);
  const { accs, banks, boxes, cards, debts, openSh, today, totAcc, totBox, totCardDebt, totDebtRem, totInv } = ctx;
  return (
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Contas</span><Btn sm full={false} color={ACCENT} onClick={()=>openSh("addAcc",{bankId:banks[0]?.id||"",name:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM CONTAS" value={fmt(totAcc)} color={ACCENT} C={C}/>
            {accs.map(renderAccRow)}
            {/* Cartões aninhado dentro de Contas (reorganização 23/08/2026, ver 04 Bugs
                Conhecidos) — divisor mais leve que o das outras seções, pra ler como
                subseção de Contas em vez de seção irmã */}
            <div style={{height:1,background:C.b1,margin:"12px 0",opacity:.6}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:11,fontWeight:800,color:C.muted}}>Cartões</span><Btn sm full={false} color={ACCENT} onClick={()=>openSh("addCard",{bankId:banks[0]?.id||"",name:"",limit:5000,closeDay:10,dueDay:25,color:ACCENT})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM FATURAS" value={fmt(totCardDebt)} color="#8b5cf6" C={C}/>
            {cards.map(renderCardRow)}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Caixinhas</span><Btn sm full={false} color={ACCENT} onClick={()=>openSh("addBox",{name:"",goal:0,color:ACCENT,rate:0,rateUnit:"ano"})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM CAIXINHAS" value={fmt(totBox)} color="#06b6d4" C={C}/>
            {boxes.map(renderBoxRow)}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Investimentos</span><Btn sm full={false} color={ACCENT} onClick={()=>openSh("addInv",{bankId:banks[0]?.id||"",subCat:"rf_pub",name:"",invested:0,balance:0,rate:"",maturity:"",accId:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL INVESTIDO" value={fmt(totInv)} color="#f59e0b" C={C}/>
            {ICAT.map(renderInvCatRow)}
            {/* Dívidas e Financiamentos — era aba própria no rodapé, virou 5ª seção de
                Bolsos em 25/08/2026 (usuário: "consigo ver tudo numa única aba") */}
            <div style={{height:1,background:C.b1,margin:"14px 0"}}/>
            <div id="yesod-dividas" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:12,fontWeight:800}}>Dívidas e Financiamentos</span><Btn sm full={false} color={ACCENT} onClick={()=>openSh("addDebt",{name:"",credor:"",totalParcelas:12,parcelasPagas:0,valorParcela:0,dueDay:10,startDate:today,color:"#ef4444",valorRecebido:0,accId:""})}><Ico n="plus" size={11}/> Adicionar</Btn></div>
            <MiniTotal label="TOTAL EM DÍVIDAS" value={fmt(totDebtRem)} color="#ef4444" C={C}/>
            {debts.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhuma dívida cadastrada</div>}
            {debts.map(renderDebtRow)}
          </div>
  );
}
