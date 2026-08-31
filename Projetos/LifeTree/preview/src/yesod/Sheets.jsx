import { useContext } from "react";
import { Sheet, FI, FS, Btn } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { uid, fmt, accLabel, PAY_METHODS } from "./constants.js";
import { ColorPicker } from "./helpers.jsx";
import { YesodCtx } from "./context.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Desvio do plano
// original: os sheets de CRUD (conta/banco/cartão/caixinha/dívida/investimento) NÃO
// entraram em BolsosTab.jsx como o plano previa — eles são gatilhados por `sh==="..."`,
// sem nenhum check de `tab`, e são abertos tanto de dentro de Bolsos quanto do "Índice de
// tudo" de Config (mesmos renderXRow, mesmos onClick). Um sheet vivendo só dentro de
// BolsosTab pararia de renderizar se aberto a partir de Config (tab!=="bolsos"). Por isso
// TODOS os sheets ficam aqui, num componente só, montado incondicionalmente no shell —
// mesma lógica que já valia pros 5 renderXRow (passo 2) e pra DetailPages.jsx (mesmo passo).
export function Sheets({ C }) {
  const ctx = useContext(YesodCtx);
  const {
    accOpts, accs, addAcc, addBank, addBox, addCard, addCatIn, addCatOut,
    addDebt, addInv, addSplitPerson, amortizarDivida, bankOpts, banks, bkOf, boxes,
    boxMoveLinked, cardOpts, catsIn, catsOut, checkin, close, editAcc, editBank,
    editBox, editCard, editDebt, editInv, f, F, guard, iCatOpts,
    invAportar, invResgatar, launch, netSettle, payDebt,
    payRecurringOccurrence, paySplit, quitarDivida, receiveSplit, saveEditTx, setBudgets, setIfGoal,
    setIfMonthly, setYesodCards, setYHabits, sh, splitPeople, toast_, today,
    yesodCards,
  } = ctx;
  return (
    <>
      {/* ══ SHEETS ══ */}
      {sh==="confirmGuard"&&(<Sheet title={f.danger===false?"Confirmar":"Confirmar Exclusão"} onClose={close} C={C}>
        <div style={{fontSize:13,color:C.text,marginBottom:18,lineHeight:1.6}}>{f.msg}</div>
        <Btn color={f.danger===false?ACCENT:"#ef4444"} onClick={()=>{const run=f.run;close();run&&run();}}><Ico n="check" size={14}/> Confirmar</Btn>
      </Sheet>)}
      {sh==="launch"&&(()=>{
        const owedMode = f.ltype==="out"&&f.splitOn&&f.payer==="other";
        return(
        <Sheet title="Novo Lançamento" onClose={close} C={C}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT},{v:"transfer",l:"Transferir",c:"#8b5cf6"}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?catsIn[0]:catsOut[0],splitOn:false,payer:"me"})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div>
          <FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} placeholder="Ex: Supermercado" C={C}/>
          <FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/>
          <FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/>
          {/* DIVIDIR DESPESA fica logo após Valor/Data (26/08/2026) — "quem pagou" decide se o
              resto do formulário (categoria/recorrência/meio de pagamento) faz sentido: se foi a
              outra pessoa que pagou, nada abaixo se aplica (não existe conta/cartão meu envolvido
              nessa despesa, só a minha parte pendente com ela). */}
          {f.ltype==="out"&&(<div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>DIVIDIR DESPESA</div>
            <div style={{display:"flex",gap:6,marginBottom:f.splitOn?10:0}}>
              <button onClick={()=>F({splitOn:false,payer:"me"})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!f.splitOn?ACCENT:C.b2),background:!f.splitOn?ACCENT+"18":"transparent",color:!f.splitOn?ACCENT:C.text}}>Não</button>
              <button onClick={()=>F({splitOn:true,splitPersonId:f.splitPersonId||splitPeople[0]?.id,splitPercent:f.splitPercent??50,payer:f.payer||"me"})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.splitOn?ACCENT:C.b2),background:f.splitOn?ACCENT+"18":"transparent",color:f.splitOn?ACCENT:C.text}}>Sim</button>
            </div>
            {f.splitOn&&(splitPeople.length===0?(
              <div style={{fontSize:11,color:C.muted}}>Cadastre alguém em Config → Pessoas antes de dividir.</div>
            ):(()=>{
              const personName=splitPeople.find(p=>p.id===(f.splitPersonId||splitPeople[0].id))?.name||"a outra pessoa";
              return(<>
                <FS label="Dividir com" value={f.splitPersonId||splitPeople[0].id} onChange={v=>F({splitPersonId:v})} opts={splitPeople.map(p=>({v:p.id,l:p.name}))} C={C}/>
                <div style={{fontSize:10,color:C.muted,margin:"10px 0 6px",fontWeight:700,letterSpacing:.8}}>QUEM PAGOU</div>
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  <button onClick={()=>F({payer:"me"})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+((f.payer||"me")==="me"?ACCENT:C.b2),background:(f.payer||"me")==="me"?ACCENT+"18":"transparent",color:(f.payer||"me")==="me"?ACCENT:C.text}}>Eu</button>
                  <button onClick={()=>F({payer:"other"})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.payer==="other"?"#ef4444":C.b2),background:f.payer==="other"?"#ef444418":"transparent",color:f.payer==="other"?"#ef4444":C.text}}>{personName}</button>
                </div>
                <FI label={f.payer==="other"?"Minha parte (%)":"% que "+personName+" paga"} value={f.splitPercent??50} onChange={v=>F({splitPercent:v})} type="number" min={0} C={C}/>
                {f.payer==="other"&&<div style={{fontSize:10,color:C.muted,marginTop:6,lineHeight:1.5}}>Não lança nada em conta agora — fica pendente em "Despesas Divididas" até você registrar o pagamento pra {personName}.</div>}
              </>);
            })())}
          </div>)}
          {!owedMode&&(<>
            {f.ltype!=="transfer"&&<FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?catsIn:catsOut).map(c=>({v:c,l:c}))} C={C}/>}
            {f.ltype!=="transfer"&&(<div style={{marginBottom:12}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>RECORRÊNCIA</div><div style={{display:"flex",gap:6}}>{[{v:"",l:"Único"},{v:"monthly",l:"Mensal"},{v:"weekly",l:"Semanal"},{v:"yearly",l:"Anual"}].map(o=>(<button key={o.v} onClick={()=>F({recurring:o.v})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+((f.recurring||"")===o.v?ACCENT:C.b2),background:(f.recurring||"")===o.v?ACCENT+"18":"transparent",color:(f.recurring||"")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div></div>)}
            {f.ltype==="transfer"&&(<div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ORIGEM</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({fromKind:o.v,fromId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.fromKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.fromKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.fromKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
              <FS label="" value={f.fromId||""} onChange={v=>F({fromId:v})} opts={[{v:"",l:"Selecione..."},...((f.fromKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:accLabel(a,banks)})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
              <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><div style={{width:24,height:24,borderRadius:"50%",background:C.b1,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="down" size={12} color={C.muted}/></div></div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>DESTINO</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>{[{v:"acc",l:"Conta"},{v:"box",l:"Caixinha"}].map(o=>(<button key={o.v} onClick={()=>F({toKind:o.v,toId:""})} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+((f.toKind||"acc")===o.v?"#8b5cf6":C.b2),background:(f.toKind||"acc")===o.v?"#8b5cf618":"transparent",color:(f.toKind||"acc")===o.v?"#8b5cf6":C.text}}>{o.l}</button>))}</div>
              <FS label="" value={f.toId||""} onChange={v=>F({toId:v})} opts={[{v:"",l:"Selecione..."},...((f.toKind||"acc")==="acc"?accs.map(a=>({v:a.id,l:(bkOf(a.bankId)?.name||"")+" - "+a.name})):boxes.map(b=>({v:b.id,l:b.name})))]} C={C}/>
            </div>)}
            {f.ltype!=="transfer"&&f.lockCash&&(<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Registrado na Carteira (dinheiro)</div>)}
            {f.ltype!=="transfer"&&!f.lockCash&&(<div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>MEIO DE PAGAMENTO</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>{PAY_METHODS.map(m=>(<button key={m.v} onClick={()=>F({method:m.v})} style={{padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:12,border:"1.5px solid "+(f.method===m.v?ACCENT:C.b2),background:f.method===m.v?ACCENT+"18":"transparent",color:f.method===m.v?ACCENT:C.text}}>{m.l}</button>))}</div>
              {f.method==="credito"&&(<div><FS label="Cartão" value={f.cardId||""} onChange={v=>F({cardId:v})} opts={cardOpts()} C={C}/>{f.ltype==="out"&&<FI label="Parcelas" value={f.installments||1} onChange={v=>F({installments:Math.max(1,v)})} type="number" min={1} C={C}/>}</div>)}
              {["pix","debito","ted"].includes(f.method||"")&&<FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
              {f.method==="dinheiro"&&<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Registrado na Carteira (dinheiro)</div>}
            </div>)}
          </>)}
          <Btn color={owedMode?"#ef4444":f.ltype==="transfer"?"#8b5cf6":f.ltype==="in"?ACCENT:"#ef4444"} onClick={launch}>{owedMode?"Registrar Dívida":f.ltype==="transfer"?"Confirmar Transferência":f.ltype==="in"?"Registrar Entrada":"Registrar Saída"}</Btn>
        </Sheet>
        );
      })()}

      {sh==="addBudget"&&(<Sheet title="Nova Categoria de Orçamento" onClose={close} C={C}><FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={catsOut.map(c=>({v:c,l:c}))} C={C}/><FI label="Limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.limit)return;setBudgets(p=>[...p,{id:"bg"+uid(),cat:f.cat||catsOut[0],limit:Number(f.limit)}]);toast_("Orçamento adicionado");close();}}>Adicionar</Btn></Sheet>)}
      {sh==="editBudget"&&(<Sheet title="Editar Orçamento" onClose={close} C={C}><div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>{f.cat}</div><FI label="Novo limite mensal (R$)" value={f.limit||0} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={()=>{setBudgets(p=>p.map(b=>b.id===f.id?{...b,limit:Number(f.limit)}:b));toast_("Limite atualizado");close();}}>Salvar</Btn></Sheet>)}
      {sh==="addYHabit"&&(<Sheet title="Novo Hábito Financeiro" onClose={close} C={C}><FI label="Título" value={f.title||""} onChange={v=>F({title:v})} placeholder="Ex: Revisar o orçamento" C={C}/><FS label="Frequência" value={f.freq||"Diário"} onChange={v=>F({freq:v})} opts={[{v:"Diário",l:"Diário"},{v:"Semanal",l:"Semanal"},{v:"Mensal",l:"Mensal"}]} C={C}/><FI label="XP por conclusão" value={f.xp||15} onChange={v=>F({xp:v})} type="number" min={5} C={C}/><Btn color={ACCENT} onClick={()=>{if(!f.title?.trim())return;setYHabits(p=>[...p,{id:"yh"+uid(),title:f.title,freq:f.freq||"Diário",xp:Number(f.xp)||15,done:false}]);toast_("Hábito criado");close();}}><Ico n="check" size={14}/> Criar Hábito</Btn></Sheet>)}
      {sh==="editTx"&&(<Sheet title="Editar Lançamento" onClose={close} C={C}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>{[{v:"out",l:"Saída",c:"#ef4444"},{v:"in",l:"Entrada",c:ACCENT}].map(o=>(<button key={o.v} onClick={()=>F({ltype:o.v,cat:o.v==="in"?catsIn[0]:catsOut[0]})} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,border:"1.5px solid "+(f.ltype===o.v?o.c:C.b2),background:f.ltype===o.v?o.c:"transparent",color:f.ltype===o.v?"#fff":o.c}}>{o.l}</button>))}</div>
        <FI label="Descrição" value={f.desc||""} onChange={v=>F({desc:v})} C={C}/>
        <FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/>
        <FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/>
        <FS label="Categoria" value={f.cat||catsOut[0]} onChange={v=>F({cat:v})} opts={(f.ltype==="in"?catsIn:catsOut).map(c=>({v:c,l:c}))} C={C}/>
        {/* Método agora é livre — antes ficava travado em "dinheiro" (Carteira) ou não-dinheiro
            conforme a conta de origem, o que impedia mover o lançamento entre os dois (limitação
            conhecida). Trocar o método aqui muda a conta de destino no saveEditTx. */}
        <FS label="Método" value={f.method||"pix"} onChange={v=>F({method:v})} opts={PAY_METHODS.filter(m=>m.v!=="credito")} C={C}/>
        {f.method==="dinheiro"&&<div style={{fontSize:11,color:C.muted,marginBottom:12,padding:"9px 12px",background:C.b1,borderRadius:9}}>Será movido para a Carteira (dinheiro)</div>}
        {f.method!=="dinheiro"&&<FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
        {f.ltype==="out"&&f.method!=="credito"&&(<div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>DIVIDIR DESPESA</div>
          <div style={{display:"flex",gap:6,marginBottom:f.splitOn?10:0}}>
            <button onClick={()=>F({splitOn:false})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(!f.splitOn?ACCENT:C.b2),background:!f.splitOn?ACCENT+"18":"transparent",color:!f.splitOn?ACCENT:C.text}}>Não</button>
            <button onClick={()=>F({splitOn:true,splitPersonId:f.splitPersonId||splitPeople[0]?.id,splitPercent:f.splitPercent??50})} style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:10,border:"1.5px solid "+(f.splitOn?ACCENT:C.b2),background:f.splitOn?ACCENT+"18":"transparent",color:f.splitOn?ACCENT:C.text}}>Sim</button>
          </div>
          {f.splitOn&&(splitPeople.length===0?(
            <div style={{fontSize:11,color:C.muted}}>Cadastre alguém em Config → Pessoas antes de dividir.</div>
          ):(<>
            <FS label="Dividir com" value={f.splitPersonId||splitPeople[0].id} onChange={v=>F({splitPersonId:v})} opts={splitPeople.map(p=>({v:p.id,l:p.name}))} C={C}/>
            <FI label="% que a outra pessoa paga" value={f.splitPercent??50} onChange={v=>F({splitPercent:v})} type="number" min={0} C={C}/>
            {/* Sem toggle de Pendente/Acertado aqui de propósito (26/08/2026) — status de
                acertado só pode mudar quando dinheiro de verdade se move (receiveSplit/
                paySplit/netSettle), nunca por edição de dado. f.splitSettled continua vindo
                do valor original da transação (setado ao abrir o sheet) e é preservado como
                está em saveEditTx — editar aqui nunca muda o status financeiro. */}
          </>))}
        </div>)}
        <Btn color={ACCENT} onClick={()=>guard(saveEditTx,"Salvar as alterações nesse lançamento?",false)}>Salvar</Btn>
      </Sheet>)}
      {/* value usa ?? em vez de || — achado 30/08/2026 testando o registro do zero: com ||,
          abrir a sheet pela 1ª vez (f.ifGoal:"" vindo de openSh) mostrava "0" no campo em vez
          de vazio ("" é falsy, cai no fallback), parecendo que já tinha um valor salvo. */}
      {sh==="editIF"&&(<Sheet title="Meta de Independência Financeira" onClose={close} C={C}><div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>Defina o patrimônio necessário para viver de renda (regra dos 4% ao ano).</div><FI label="Patrimônio alvo (R$)" value={f.ifGoal??""} onChange={v=>F({ifGoal:v})} type="number" min={0} C={C}/><div style={{textAlign:"center",fontSize:11,color:C.muted,marginBottom:12}}>— ou defina pela renda —</div><FI label="Renda mensal desejada (R$)" value={f.ifMonthly??""} onChange={v=>F({ifMonthly:v,ifGoal:Number(v)*300})} type="number" min={0} C={C}/>{(Number(f.ifGoal)||0)>0&&<div style={{background:C.b1,borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:11,color:C.dim}}>Renda de {fmt((Number(f.ifGoal)||0)/300)}/mês pela regra dos 4%</div>}<Btn color={ACCENT} onClick={()=>{setIfGoal(Number(f.ifGoal)||0);setIfMonthly(Number(f.ifMonthly)||0);toast_("Meta atualizada");close();}}>Salvar</Btn></Sheet>)}
      {(sh==="addBank"||sh==="editBank")&&(<Sheet title={sh==="addBank"?"Novo Banco":"Editar Banco"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Nubank" C={C}/><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBank"?addBank:()=>guard(editBank,"Salvar as alterações nesse banco?",false)}>Salvar</Btn></Sheet>)}
      {sh==="addCatOut"&&(<Sheet title="Nova Categoria de Saída" onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Pet" C={C}/><Btn color={ACCENT} onClick={addCatOut}>Adicionar</Btn></Sheet>)}
      {sh==="addCatIn"&&(<Sheet title="Nova Categoria de Entrada" onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Dividendos" C={C}/><Btn color={ACCENT} onClick={addCatIn}>Adicionar</Btn></Sheet>)}
      {sh==="addSplitPerson"&&(<Sheet title="Nova Pessoa" onClose={close} C={C}><div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.6}}>Pra dividir despesas recorrentes (ex: conta de luz 50/50) e acompanhar o que já foi acertado.</div><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Esposa" C={C}/><Btn color={ACCENT} onClick={addSplitPerson}>Adicionar</Btn></Sheet>)}

      {(sh==="addAcc"||sh==="editAcc")&&(<Sheet title={sh==="addAcc"?"Nova Conta":"Editar Conta"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Conta Corrente" C={C}/><Btn color={ACCENT} onClick={sh==="addAcc"?addAcc:()=>guard(editAcc,"Salvar as alterações nessa conta?",false)}>Salvar</Btn></Sheet>)}
      {(sh==="addCard"||sh==="editCard")&&(<Sheet title={sh==="addCard"?"Novo Cartão":"Editar Cartão"} onClose={close} C={C}><FS label="Banco" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Visa Platinum" C={C}/><FI label="Limite (R$)" value={f.limit||5000} onChange={v=>F({limit:v})} type="number" min={0} C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Dia fechamento" value={f.closeDay||10} onChange={v=>F({closeDay:v})} type="number" min={1} C={C}/><FI label="Dia vencimento" value={f.dueDay||25} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div><ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addCard"?addCard:()=>guard(editCard,"Salvar as alterações nesse cartão?",false)}>Salvar</Btn></Sheet>)}
      {(sh==="addBox"||sh==="editBox")&&(<Sheet title={sh==="addBox"?"Nova Caixinha":"Editar Caixinha"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Viagem Europa" C={C}/><FI label="Meta (R$)" value={f.goal||0} onChange={v=>F({goal:v})} type="number" min={0} C={C}/><FI label="Data alvo (opcional)" value={f.targetDate||""} onChange={v=>F({targetDate:v})} type="date" C={C}/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>TAXA DE JUROS (RENDIMENTO ESPERADO)</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><FI value={f.rate||0} onChange={v=>F({rate:v})} type="number" min={0} C={C}/></div>
            <div style={{display:"flex",gap:6}}>{[{v:"ano",l:"% ao ano"},{v:"mes",l:"% ao mês"}].map(o=>(<button key={o.v} onClick={()=>F({rateUnit:o.v})} style={{padding:"0 12px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:11,border:"1.5px solid "+((f.rateUnit||"ano")===o.v?ACCENT:C.b2),background:(f.rateUnit||"ano")===o.v?ACCENT+"18":"transparent",color:(f.rateUnit||"ano")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
          </div>
        </div>
        <ColorPicker value={f.color||ACCENT} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||ACCENT} onClick={sh==="addBox"?addBox:()=>guard(editBox,"Salvar as alterações nessa caixinha?",false)}>Salvar</Btn></Sheet>)}
      {(sh==="addDebt"||sh==="editDebt")&&(<Sheet title={sh==="addDebt"?"Nova Dívida":"Editar Dívida"} onClose={close} C={C}><FI label="Nome" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Financiamento Carro" C={C}/><FI label="Credor" value={f.credor||""} onChange={v=>F({credor:v})} placeholder="Ex: Banco Itau" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Total de parcelas" value={f.totalParcelas||12} onChange={v=>F({totalParcelas:v})} type="number" min={1} C={C}/><FI label="Parcelas pagas" value={f.parcelasPagas||0} onChange={v=>F({parcelasPagas:v})} type="number" min={0} C={C}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Valor da parcela (R$)" value={f.valorParcela||0} onChange={v=>F({valorParcela:v})} type="number" min={0} C={C}/><FI label="Dia vencimento" value={f.dueDay||10} onChange={v=>F({dueDay:v})} type="number" min={1} C={C}/></div>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>TAXA DE JUROS (OPCIONAL)</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><FI value={f.taxaJuros||0} onChange={v=>F({taxaJuros:v})} type="number" min={0} C={C}/></div>
            <div style={{display:"flex",gap:6}}>{[{v:"ano",l:"% a.a."},{v:"mes",l:"% a.m."}].map(o=>(<button key={o.v} onClick={()=>F({taxaJurosUnit:o.v})} style={{padding:"0 12px",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:11,border:"1.5px solid "+((f.taxaJurosUnit||"ano")===o.v?ACCENT:C.b2),background:(f.taxaJurosUnit||"ano")===o.v?ACCENT+"18":"transparent",color:(f.taxaJurosUnit||"ano")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
          </div>
          <div style={{fontSize:9,color:C.muted,marginTop:4,lineHeight:1.5}}>Usada pelo Coach pra comparar estratégias de quitação (Avalanche prioriza a dívida de maior juro) — deixe 0 se não souber.</div>
        </div>
        <FI label="Data de início" value={f.startDate||today} onChange={v=>F({startDate:v})} type="date" C={C}/>
        {sh==="addDebt"&&(<>
          <div style={{fontSize:10,color:C.muted,marginBottom:8,lineHeight:1.6}}>O valor recebido pode ser diferente da soma das parcelas (que já inclui juros) — é o que efetivamente cai numa conta.</div>
          <FI label="Valor recebido (R$)" value={f.valorRecebido||0} onChange={v=>F({valorRecebido:v})} type="number" min={0} C={C}/>
          <FS label="Creditar em" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        </>)}
        <ColorPicker value={f.color||"#ef4444"} onChange={c=>F({color:c})} C={C}/><Btn color={f.color||"#ef4444"} onClick={sh==="addDebt"?addDebt:()=>guard(editDebt,"Salvar as alterações nessa dívida?",false)}>Salvar</Btn></Sheet>)}
      {sh==="payDebt"&&(<Sheet title="Registrar Parcela" onClose={close} C={C}><FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Número de parcelas" value={f.qtd||1} onChange={v=>F({qtd:Math.max(1,v)})} type="number" min={1} C={C}/><FI label="Juros por atraso (R$, opcional)" value={f.jurosAtraso||0} onChange={v=>F({jurosAtraso:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={payDebt}><Ico n="check" size={14}/> Confirmar</Btn></Sheet>)}
      {sh==="payRecurring"&&(<Sheet title="Pagar Conta" onClose={close} C={C}>
        <div style={{background:C.b1,borderRadius:10,padding:"11px 13px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{f.desc}</div>
          <div style={{fontSize:20,fontWeight:900}}>{fmt(f.amount||0)}</div>
          <div style={{fontSize:9,color:C.muted,marginTop:2}}>Vencimento: {(f.dueDate||"").split("-").reverse().join("/")}</div>
        </div>
        <FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <FI label="Juros por atraso (R$, opcional)" value={f.jurosAtraso||0} onChange={v=>F({jurosAtraso:v})} type="number" min={0} C={C}/>
        <Btn color={ACCENT} onClick={payRecurringOccurrence}><Ico n="check" size={14}/> Confirmar Pagamento</Btn>
      </Sheet>)}
      {sh==="amortizarDivida"&&(<Sheet title="Amortizar" onClose={close} C={C}>
        <FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <div style={{marginBottom:11}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>AMORTIZAR POR</div>
          <div style={{display:"flex",gap:8}}>{[{v:"valor",l:"Valor (R$)"},{v:"parcelas",l:"Nº de parcelas"}].map(o=>(<button key={o.v} onClick={()=>F({mode:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+((f.mode||"valor")===o.v?ACCENT:C.b2),background:(f.mode||"valor")===o.v?ACCENT+"18":"transparent",color:(f.mode||"valor")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
        </div>
        {(f.mode||"valor")==="valor"?(<>
          <FI label="Valor a amortizar (R$)" value={f.value||0} onChange={v=>F({value:v})} type="number" min={0} C={C}/>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:700,letterSpacing:.8}}>EFEITO</div>
            <div style={{display:"flex",gap:8}}>{[{v:"prazo",l:"Reduzir prazo"},{v:"parcela",l:"Reduzir parcela"}].map(o=>(<button key={o.v} onClick={()=>F({effect:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+((f.effect||"prazo")===o.v?ACCENT:C.b2),background:(f.effect||"prazo")===o.v?ACCENT+"18":"transparent",color:(f.effect||"prazo")===o.v?ACCENT:C.text}}>{o.l}</button>))}</div>
          </div>
        </>):(<FI label="Número de parcelas" value={f.qtd||1} onChange={v=>F({qtd:Math.max(1,v)})} type="number" min={1} C={C}/>)}
        <Btn color={ACCENT} onClick={amortizarDivida}><Ico n="check" size={14}/> Confirmar Amortização</Btn>
      </Sheet>)}
      {sh==="quitarDivida"&&(<Sheet title="Quitar Dívida" onClose={close} C={C}>
        <div style={{background:C.b1,borderRadius:10,padding:"11px 13px",marginBottom:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2}}>SALDO DEVEDOR</div><div style={{fontSize:20,fontWeight:900,color:"#ef4444"}}>{fmt(f.remaining||0)}</div></div>
        <FS label="Conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <Btn color="#ef4444" onClick={quitarDivida}><Ico n="check" size={14}/> Confirmar Quitação</Btn>
      </Sheet>)}
      {sh==="receiveSplit"&&(<Sheet title="Registrar Recebimento" onClose={close} C={C}>
        <div style={{background:ACCENT+"18",border:"1px solid "+ACCENT+"44",borderRadius:10,padding:"11px 13px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:ACCENT,fontWeight:700,marginBottom:2}}>VOCÊ VAI RECEBER DE {(f.personName||"?").toUpperCase()}</div>
          <div style={{fontSize:20,fontWeight:900,color:ACCENT}}>{fmt(f.theirs||0)}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{f.origDesc}</div>
        </div>
        <FS label="Em qual conta caiu o reembolso" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <Btn color={ACCENT} onClick={receiveSplit}><Ico n="check" size={14}/> Confirmar Recebimento</Btn>
      </Sheet>)}
      {sh==="paySplit"&&(<Sheet title="Registrar Pagamento" onClose={close} C={C}>
        <div style={{background:"#ef444418",border:"1px solid #ef444444",borderRadius:10,padding:"11px 13px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#ef4444",fontWeight:700,marginBottom:2}}>VOCÊ VAI PAGAR A {(f.personName||"?").toUpperCase()}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#ef4444"}}>{fmt(f.amount||0)}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{f.desc}</div>
        </div>
        <FS label="De qual conta sai o pagamento" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
        <Btn color="#ef4444" onClick={paySplit}><Ico n="check" size={14}/> Confirmar Pagamento</Btn>
      </Sheet>)}
      {sh==="netSettle"&&(()=>{const net=Number(f.net)||0;const zero=net===0;const favorMe=net>0;const color=zero?C.muted:favorMe?ACCENT:"#ef4444";return(
        <Sheet title="Acerto Líquido" onClose={close} C={C}>
          <div style={{background:color+"18",border:"1px solid "+color+"44",borderRadius:10,padding:"11px 13px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:9,color,fontWeight:700,marginBottom:2}}>{zero?"NADA A RECEBER OU PAGAR":favorMe?"VOCÊ VAI RECEBER DE "+(f.personName||"?").toUpperCase():"VOCÊ VAI PAGAR A "+(f.personName||"?").toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:900,color}}>{fmt(Math.abs(net))}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Fecha {f.count} pendência{f.count>1?"s":""} com {f.personName} de uma vez, já descontando o que é seu de cada uma</div>
          </div>
          {!zero&&<FS label={favorMe?"Em qual conta caiu":"De qual conta sai"} value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>}
          <Btn color={zero?ACCENT:favorMe?ACCENT:"#ef4444"} onClick={netSettle}><Ico n="check" size={14}/> Confirmar Acerto</Btn>
        </Sheet>
      );})()}
      {(sh==="addInv"||sh==="editInv")&&(<Sheet title={sh==="addInv"?"Novo Investimento":"Editar Investimento"} onClose={close} C={C}>{sh==="addInv"&&<><FS label="Banco/Corretora" value={f.bankId||""} onChange={v=>F({bankId:v})} opts={bankOpts()} C={C}/><FS label="Categoria" value={f.subCat||"rf_pub"} onChange={v=>F({subCat:v})} opts={iCatOpts()} C={C}/></>}<FI label="Nome do ativo" value={f.name||""} onChange={v=>F({name:v})} placeholder="Ex: Tesouro IPCA+" C={C}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><FI label="Aplicado (R$)" value={f.invested||0} onChange={v=>F({invested:v})} type="number" min={0} C={C}/><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/></div>{sh==="addInv"&&(<>
        <div style={{fontSize:10,color:C.muted,marginBottom:8,lineHeight:1.6}}>Se o valor aplicado já saiu de uma conta sua, escolha de onde — vai debitar de lá. Deixe em branco se for um ativo que você já tinha antes do app (não debita nada).</div>
        <FS label="Debitar de (opcional)" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/>
      </>)}<FI label="Taxa referência" value={f.rate||""} onChange={v=>F({rate:v})} placeholder="Ex: IPCA+5.5%" C={C}/><Btn color={ACCENT} onClick={sh==="addInv"?addInv:()=>guard(editInv,"Salvar as alterações nesse investimento?",false)}>Salvar</Btn></Sheet>)}
      {sh==="checkin"&&(<Sheet title="Atualizar Saldo" onClose={close} C={C}><FI label="Saldo atual (R$)" value={f.balance||0} onChange={v=>F({balance:v})} type="number" min={0} C={C}/><Btn color={ACCENT} onClick={checkin}><Ico n="refresh" size={14}/> Salvar</Btn></Sheet>)}
      {sh==="invAport"&&(<Sheet title="Aportar" onClose={close} C={C}><FS label="De qual conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color={ACCENT} onClick={invAportar}><Ico n="up" size={14}/> Confirmar Aporte</Btn></Sheet>)}
      {sh==="invResgate"&&(<Sheet title="Resgatar" onClose={close} C={C}><FS label="Pra qual conta" value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color="#ef4444" onClick={invResgatar}><Ico n="down" size={14}/> Confirmar Resgate</Btn></Sheet>)}
      {sh==="boxmove"&&(<Sheet title="Movimentar Caixinha" onClose={close} C={C}><div style={{display:"flex",gap:8,marginBottom:12}}>{[{v:"in",l:"Depositar",c:ACCENT},{v:"out",l:"Retirar",c:"#ef4444"}].map(o=>(<button key={o.v} onClick={()=>F({moveType:o.v})} style={{flex:1,padding:"9px",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",border:"1.5px solid "+o.c,background:(f.moveType||"in")===o.v?o.c:"transparent",color:(f.moveType||"in")===o.v?"#fff":o.c}}>{o.l}</button>))}</div><FS label={(f.moveType||"in")==="in"?"De onde sai o dinheiro":"Pra onde vai o dinheiro"} value={f.accId||""} onChange={v=>F({accId:v})} opts={accOpts()} C={C}/><FI label="Valor (R$)" value={f.amount||0} onChange={v=>F({amount:v})} type="number" min={0} C={C}/><FI label="Data" value={f.date||today} onChange={v=>F({date:v})} type="date" C={C}/><Btn color={(f.moveType||"in")==="in"?ACCENT:"#ef4444"} onClick={boxMoveLinked}>Confirmar {(f.moveType||"in")==="in"?"Depósito":"Retirada"}</Btn></Sheet>)}

      {sh==="editCards"&&(
        <Sheet title="Personalizar Indicadores" onClose={close} C={C}>
          <div style={{fontSize:10,color:C.muted,marginBottom:12,lineHeight:1.6}}>
            Toque para ativar/desativar. Use ▲▼ para reordenar.
          </div>
          {/* Ativos */}
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,marginBottom:8}}>ATIVOS ({yesodCards.length})</div>
          {yesodCards.length===0&&(
            <div style={{textAlign:"center",padding:12,color:C.muted,fontSize:11,background:C.bg,borderRadius:9,marginBottom:12}}>
              Nenhum indicador ativo
            </div>
          )}
          {yesodCards.map((id,i)=>{
            const labels={poupanca:"Poupança",if:"Prog. IF",dividas:"Dívidas",orcamento:"Orçamento",habitos:"Hábitos",metas:"Metas",patrimonio:"Patrimônio",receita:"Receita",despesa:"Despesas",saldo_mes:"Saldo Mensal",investido:"Investido",contas:"Contas"};
            const colors={poupanca:"#16a34a",if:"#06b6d4",dividas:"#f97316",orcamento:"#8b5cf6",habitos:ACCENT,metas:"#f59e0b",patrimonio:ACCENT,receita:"#16a34a",despesa:"#ef4444",saldo_mes:ACCENT,investido:"#f59e0b",contas:ACCENT};
            return(
              <div key={id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",
                background:C.card,border:"1px solid "+(colors[id]||ACCENT)+"33",borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:colors[id]||ACCENT,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12,fontWeight:600,color:C.text}}>{labels[id]||id}</span>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>setYesodCards(p=>{const n=[...p];if(i>0){[n[i-1],n[i]]=[n[i],n[i-1]];}return n;})}
                    style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={i===0}>▲</button>
                  <button onClick={()=>setYesodCards(p=>{const n=[...p];if(i<n.length-1){[n[i],n[i+1]]=[n[i+1],n[i]];}return n;})}
                    style={{background:C.b1,border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:C.muted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={i===yesodCards.length-1}>▼</button>
                  <button onClick={()=>setYesodCards(p=>p.filter(x=>x!==id))}
                    style={{background:"#ef444420",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",
                      color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="x" size={11}/>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Disponíveis */}
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.8,margin:"12px 0 8px"}}>DISPONÍVEIS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[
              {id:"poupanca",l:"Poupança",c:"#16a34a"},
              {id:"if",l:"Prog. IF",c:"#06b6d4"},
              {id:"dividas",l:"Dívidas",c:"#f97316"},
              {id:"orcamento",l:"Orçamento",c:"#8b5cf6"},
              {id:"habitos",l:"Hábitos",c:ACCENT},
              {id:"metas",l:"Metas",c:"#f59e0b"},
              {id:"patrimonio",l:"Patrimônio",c:ACCENT},
              {id:"receita",l:"Receita",c:"#16a34a"},
              {id:"despesa",l:"Despesas",c:"#ef4444"},
              {id:"saldo_mes",l:"Saldo Mensal",c:ACCENT},
              {id:"investido",l:"Investido",c:"#f59e0b"},
              {id:"contas",l:"Contas",c:ACCENT},
            ].filter(d=>!yesodCards.includes(d.id)).map(d=>(
              <button key={d.id} onClick={()=>setYesodCards(p=>[...p,d.id])}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",
                  background:C.card,border:"1px solid "+C.b1,borderRadius:10,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:d.c,flexShrink:0}}/>
                <span style={{fontSize:11,color:C.text,fontWeight:500}}>{d.l}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
