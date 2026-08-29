import { useContext } from "react";
import { Btn } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt, addM, mLbl, accBal, getStmts } from "./constants.js";
import { ICAT } from "./seedData.js";
import { YesodCtx } from "./context.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). As 5 sub-páginas de
// detalhe (conta/cartão/caixinha/investimento/dívida) NÃO entraram em BolsosTab.jsx como o
// plano original previa — são abertas por `nav(...)`, que só seta `page` e não mexe em
// `tab`, e os 5 renderXRow que chamam nav() são usados tanto em Bolsos quanto no "Índice de
// tudo" de Config. Uma sub-página vivendo só dentro de BolsosTab pararia de aparecer se
// aberta a partir de Config. `goalsDetail` (a 6ª variante do dispatcher original) NÃO está
// aqui — só é aberta de dentro da própria aba Objetivos (nav("goalsDetail"), sem outro call
// site), então ficou dentro de ObjetivosTab.jsx, mais perto do plano original pra esse caso.
// Definido fora de DetailPages (26/08/2026) — dentro do corpo do componente, o
// react-hooks/static-components acusava "component created during render" (a extração
// tirou o BackBtn de dentro do IIFE aninhado que existia no YesodModule.jsx original,
// onde o lint não pegava por estar um nível mais fundo; virou erro real ao subir pro
// nível direto da função exportada).
function BackBtn({label, C, back}){return(<button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}><Ico n="back" size={13}/> {label}</button>);}

export function DetailPages({ C }) {
  const ctx = useContext(YesodCtx);
  const {
    accs, back, bkOf, boxes, boxSnaps, cards, catsOut, debtLateInfo,
    debts, delAccTx, delCardTx, delInv, getMonthStr, guard, invs, monthLabel2,
    openSh, page, recalibrarCronogramaDivida, setTxSearch, splitPeople, today, txSearch,
  } = ctx;
  if (!page) return null;

          if(page.type==="account"){
            const ac=accs.find(a=>a.id===page.id);if(!ac)return null;
            const bk2=bkOf(ac.bankId);const accColor=ac.isCash?"#f59e0b":(bk2?.color||ACCENT);const bal=accBal(ac);const txs=[...(ac.txs||[])].sort((a,b)=>b.date.localeCompare(a.date));
            const q=txSearch.trim().toLowerCase();const filteredTxs=q?txs.filter(t=>(t.desc+" "+t.cat).toLowerCase().includes(q)):txs;
            // Agrupado por mês (25/08/2026) — filteredTxs já vem ordenado desc por data,
            // então agrupar em sequência já produz os grupos do mês mais recente pro mais
            // antigo, sem precisar de estado de navegação: rolar a lista já mostra os
            // extratos realizados dos meses passados.
            const monthGroups=[];
            filteredTxs.forEach(tx=>{
              const ym=tx.date.slice(0,7);
              let g=monthGroups[monthGroups.length-1];
              if(!g||g.ym!==ym){g={ym,txs:[]};monthGroups.push(g);}
              g.txs.push(tx);
            });
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Contas" C={C} back={back}/>
              <div style={{background:"linear-gradient(135deg,"+accColor+"18,"+accColor+"06)",border:"1px solid "+accColor+"33",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:2}}>{ac.isCash?"Carteira":bk2?.name+" - "+ac.name}</div><div style={{fontSize:28,fontWeight:900,color:accColor}}>{fmt(bal)}</div></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>EXTRATO</div><Btn sm full={false} color={ACCENT} onClick={()=>openSh("launch",{ltype:"out",desc:"",amount:0,date:today,cat:catsOut[0],method:ac.isCash?"dinheiro":"pix",accId:ac.id,cardId:"",installments:1,fromKind:"acc",fromId:"",toKind:"acc",toId:"",lockCash:ac.isCash})}><Ico n="plus" size={12}/> Registrar</Btn></div>
              <input value={txSearch} onChange={e=>setTxSearch(e.target.value)} placeholder="Buscar por descrição ou categoria..." style={{width:"100%",background:C.card,border:"1px solid "+C.b1,borderRadius:9,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
              {filteredTxs.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhum lançamento encontrado</div>}
              {monthGroups.map(g=>{const monthNet=g.txs.reduce((s,tx)=>s+(tx.type==="in"?tx.amount:-tx.amount),0);return(
                <div key={g.ym} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"0 2px"}}><span style={{fontSize:11,fontWeight:700,color:C.text}}>{monthLabel2(g.ym)}</span><span style={{fontSize:11,fontWeight:700,color:monthNet>=0?"#16a34a":"#ef4444"}}>{monthNet>=0?"+":"-"}{fmt(Math.abs(monthNet))}</span></div>
                  {g.txs.map(tx=>{
                    const splitPerson = tx.split ? splitPeople.find(p=>p.id===tx.split.personId) : null;
                    return(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.card,border:"1px solid "+C.b1,borderRadius:10,marginBottom:6}}><div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:tx.type==="in"?"#dcfce744":"#fee2e244",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={tx.type==="in"?"up":"down"} size={13} color={tx.type==="in"?"#16a34a":"#ef4444"}/></div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{tx.desc}</div><div style={{fontSize:9,color:C.muted}}>{tx.cat} · {tx.method} · {tx.date}</div>{splitPerson&&<div style={{fontSize:8,color:"#f59e0b"}}>Dividido com {splitPerson.name} ({tx.split.theirPercent}%) · {tx.split.settled?"recebido":"pendente"}</div>}</div><div style={{fontSize:13,fontWeight:800,color:tx.type==="in"?"#16a34a":"#ef4444"}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount)}</div><button onClick={()=>openSh("editTx",{accId:ac.id,origAccId:ac.id,id:tx.id,ltype:tx.type,desc:tx.desc,amount:tx.amount,date:tx.date,cat:tx.cat,method:tx.method,recurring:tx.recurring||"",splitOn:!!tx.split,splitPersonId:tx.split?.personId||"",splitPercent:tx.split?.theirPercent??50,splitSettled:tx.split?.settled||false})} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>delAccTx(ac.id,tx.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button></div>);
                  })}
                </div>
              );})}
            </div>);
          }

          if(page.type==="card"){
            const cd=cards.find(c=>c.id===page.id);if(!cd)return null;
            const bk2=bkOf(cd.bankId);const stmts=getStmts(cd);const debt=stmts.reduce((s,st)=>s+st.total,0);
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Cartões" C={C} back={back}/>
              <div style={{background:"linear-gradient(135deg,"+cd.color+"18,"+cd.color+"06)",border:"1px solid "+cd.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{bk2?.name} - {cd.name}</div>
                <div style={{display:"flex",gap:20,marginBottom:10}}><div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>LIMITE</div><div style={{fontSize:16,fontWeight:800}}>{fmt(cd.limit)}</div></div><div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>DISPONÍVEL</div><div style={{fontSize:16,fontWeight:800,color:ACCENT}}>{fmt(cd.limit-debt)}</div></div></div>
                <div style={{height:4,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:Math.min(100,(debt/cd.limit)*100)+"%",background:debt/cd.limit>0.8?"#ef4444":cd.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>Fecha dia {cd.closeDay} · Vence dia {cd.dueDay}</div>
              </div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:10}}>FATURAS</div>
              {stmts.length===0&&<div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma transação</div>}
              {stmts.map((st,si)=>{const past=st.due<today;const curr=!past&&si===stmts.findIndex(x=>x.due>=today);return(<div key={st.due} style={{background:C.card,border:"1px solid "+(curr?cd.color+"44":C.b1),borderRadius:14,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontSize:12,fontWeight:700,color:curr?cd.color:C.text,display:"flex",alignItems:"center",gap:6}}>Fatura {mLbl(st.due)}{curr&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:cd.color+"22",color:cd.color,fontWeight:700}}>VIGENTE</span>}</div><div style={{fontSize:9,color:C.muted}}>Vence {st.due.slice(8)}/{mLbl(st.due)}</div></div><div style={{fontSize:16,fontWeight:900,color:"#ef4444"}}>{fmt(st.total)}</div></div>{st.items.map((item,ii)=>(<div key={ii} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:"1px solid "+C.b1}}><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{item.desc}</div><div style={{fontSize:9,color:C.muted}}>{item.cat} · {item.date}{item.parcel?" · Parcela "+item.parcel:""}</div></div><div style={{fontSize:12,fontWeight:700,color:item.type==="in"?"#16a34a":"#ef4444"}}>{fmt(Math.abs(item.amt))}</div>{!item.parcel&&<button onClick={()=>delCardTx(cd.id,item.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico n="x" size={13} color={C.muted}/></button>}</div>))}</div>);})}
            </div>);
          }

          if(page.type==="debt"){
            const d=debts.find(x=>x.id===page.id);if(!d)return null;
            const restantes=d.totalParcelas-d.parcelasPagas;const saldo=restantes*d.valorParcela;const pct=Math.min(100,Math.round((d.parcelasPagas/d.totalParcelas)*100));
            const li=debtLateInfo(d);
            const jurosSugestao=li.atraso>0&&d.taxaJuros>0?Math.round(d.valorParcela*(d.taxaJurosUnit==="mes"?(d.taxaJuros/100):(d.taxaJuros/100)/12)*li.atraso*100)/100:0;
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Dívidas" C={C} back={back}/>
              <div style={{background:"linear-gradient(135deg,"+d.color+"18,"+d.color+"06)",border:"1px solid "+d.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:11,color:C.muted,marginBottom:2}}>{d.name}</div>{d.credor&&<div style={{fontSize:12,fontWeight:700,color:d.color,marginBottom:4}}>{d.credor}</div>}<div style={{fontSize:22,fontWeight:900,color:d.color}}>{fmt(saldo)}</div>{d.taxaJuros>0&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>{d.taxaJuros}% {d.taxaJurosUnit==="mes"?"a.m.":"a.a."}</div>}{li.atraso>0&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><span style={{fontSize:9,color:"#ef4444",fontWeight:700}}>Atrasada · {li.atraso} parcela{li.atraso>1?"s":""}</span><button onClick={()=>recalibrarCronogramaDivida(d.id)} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:9,color:C.muted,textDecoration:"underline"}}>Marcar em dia</button></div>}</div>
                  <button onClick={()=>openSh("editDebt",{id:d.id,name:d.name,credor:d.credor||"",totalParcelas:d.totalParcelas,parcelasPagas:d.parcelasPagas,valorParcela:d.valorParcela,dueDay:d.dueDay,startDate:d.startDate,color:d.color,taxaJuros:d.taxaJuros||0,taxaJurosUnit:d.taxaJurosUnit||"ano"})} style={{background:d.color+"22",border:"1px solid "+d.color+"44",borderRadius:9,padding:"6px 12px",cursor:"pointer",color:d.color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><Ico n="edit" size={12} color={d.color}/> Editar</button>
                </div>
                <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",margin:"12px 0 4px"}}><div style={{height:"100%",width:pct+"%",background:d.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>{pct}% quitado</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>{[{l:"Total",v:d.totalParcelas,c:C.text},{l:"Pagas",v:d.parcelasPagas,c:ACCENT},{l:"Restantes",v:restantes,c:d.color}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{s.l}</div></div>))}</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <Btn full={false} style={{flex:1}} color={ACCENT} onClick={()=>openSh("payDebt",{debtId:d.id,accId:"",qtd:li.atraso>0?li.atraso:1,jurosAtraso:jurosSugestao})}><Ico n="check" size={13}/> Parcela</Btn>
                <Btn full={false} style={{flex:1}} outline color={d.color} onClick={()=>openSh("amortizarDivida",{debtId:d.id,accId:"",mode:"valor",effect:"prazo",value:0,qtd:1})}><Ico n="down" size={13}/> Amortizar</Btn>
              </div>
              <Btn outline color="#ef4444" onClick={()=>openSh("quitarDivida",{debtId:d.id,accId:"",remaining:saldo})}><Ico n="x" size={14}/> Quitar dívida</Btn>
            </div>);
          }

          if(page.type==="box"){
            const bx=boxes.find(b=>b.id===page.id);if(!bx)return null;
            const pct=Math.min(100,Math.round((bx.balance/bx.goal)*100));
            const rate=bx.rate||0;
            const monthlyRate=rate>0?((bx.rateUnit||"ano")==="ano"?Math.pow(1+rate/100,1/12)-1:rate/100):0;
            const history=boxSnaps.filter(s=>s.boxId===bx.id).sort((a,b)=>a.ym.localeCompare(b.ym)).slice(-6);
            const projection=Array.from({length:6},(_,i)=>{const v=bx.balance*Math.pow(1+monthlyRate,i+1);return{ym:addM(getMonthStr(0),i+1),value:v};});
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Caixinhas" C={C} back={back}/>
              <div style={{background:"linear-gradient(135deg,"+bx.color+"18,"+bx.color+"06)",border:"1px solid "+bx.color+"33",borderRadius:16,padding:18,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:bx.color,marginBottom:4}}>{bx.name}</div><div style={{fontSize:28,fontWeight:900}}>{fmt(bx.balance)}</div>
                <div style={{height:6,background:C.b1,borderRadius:99,overflow:"hidden",margin:"10px 0 4px"}}><div style={{height:"100%",width:pct+"%",background:bx.color,borderRadius:99}}/></div>
                <div style={{fontSize:9,color:C.muted}}>{pct}% da meta de {fmt(bx.goal)}{bx.targetDate?" · até "+bx.targetDate.split("-").reverse().join("/"):""}{rate>0?" · "+rate+"% "+((bx.rateUnit||"ano")==="ano"?"a.a.":"a.m."):""}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}><Btn full={false} style={{flex:1}} color={bx.color} onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"in",amount:0,date:today})}><Ico n="up" size={13}/> Depositar</Btn><Btn full={false} style={{flex:1}} outline color="#ef4444" onClick={()=>openSh("boxmove",{boxId:bx.id,moveType:"out",amount:0,date:today})}><Ico n="down" size={13}/> Retirar</Btn></div>
              {history.length>0&&(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>SALDOS ANTERIORES</div>
                {history.map(s=>(<div key={s.ym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:s.ym===getMonthStr(0)?bx.color:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><span style={{fontSize:11,fontWeight:700}}>{fmt(s.balance)}</span></div>))}
              </div>)}
              {rate>0&&(<div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>PROJEÇÃO (mantendo o saldo atual rendendo)</div>
                {projection.map(p=>(<div key={p.ym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:C.text}}>{monthLabel2(p.ym)}</span><span style={{fontSize:11,fontWeight:700,color:bx.color}}>{fmt(p.value)}</span></div>))}
              </div>)}
            </div>);
          }

          if(page.type==="inv"){
            const cat=ICAT.find(c=>c.id===page.id);if(!cat)return null;
            const ci=invs.filter(i=>cat.sub.some(s=>s.id===i.subCat));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Investimentos" C={C} back={back}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:cat.color}}/><span style={{fontSize:15,fontWeight:800,color:cat.color}}>{cat.label}</span></div>
              {cat.sub.map(sub=>{const si=ci.filter(i=>i.subCat===sub.id);if(!si.length)return null;return(<div key={sub.id} style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>{sub.label.toUpperCase()}</div>{si.map(inv=>{const gain=inv.balance-inv.invested;const gp=inv.invested>0?((gain/inv.invested)*100).toFixed(1):"0.0";return(<div key={inv.id} style={{background:C.card,border:"1px solid "+cat.color+"22",borderRadius:14,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:12,fontWeight:700}}>{inv.name}</div><div style={{fontSize:9,color:C.muted}}>{bkOf(inv.bankId)?.name}{inv.rate?" · "+inv.rate:""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:cat.color}}>{fmt(inv.balance)}</div><div style={{fontSize:9,fontWeight:600,color:gain>=0?"#10b981":"#ef4444"}}>{gain>=0?"+":""}{fmt(gain)} ({gp}%)</div></div></div><div style={{display:"flex",gap:6,marginBottom:6}}><Btn sm full={false} color={ACCENT} style={{flex:1}} onClick={()=>openSh("invAport",{invId:inv.id,accId:"",amount:0,date:today})}><Ico n="up" size={11}/> Aportar</Btn><Btn sm full={false} outline color="#ef4444" style={{flex:1}} onClick={()=>openSh("invResgate",{invId:inv.id,accId:"",amount:0,date:today})}><Ico n="down" size={11}/> Resgatar</Btn></div><div style={{display:"flex",gap:6}}><Btn sm full={false} outline color={cat.color} style={{flex:1}} onClick={()=>openSh("checkin",{invId:inv.id,balance:inv.balance})}><Ico n="refresh" size={11}/> Atualizar saldo</Btn><button onClick={()=>openSh("editInv",{id:inv.id,name:inv.name,invested:inv.invested,balance:inv.balance,rate:inv.rate,maturity:inv.maturity})} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="edit" size={12} color={C.muted}/></button><button onClick={()=>guard(()=>delInv(inv.id),"Apagar o investimento \""+inv.name+"\"? Essa ação não pode ser desfeita.")} style={{background:C.b1,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="x" size={12} color="#ef4444"/></button></div></div>);})}</div>);})}
              {ci.length===0&&<div style={{textAlign:"center",padding:32,color:C.muted,fontSize:12}}>Nenhum ativo</div>}
            </div>);
          }
          return null;
}
