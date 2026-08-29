import { useContext } from "react";
import { Btn } from "../shared/ui.jsx";
import { ACCENT } from "./theme.js";
import { Ico } from "./icons.jsx";
import { fmt } from "./constants.js";
import { YesodCtx } from "./context.js";
import { YESOD_ACTION_HANDLERS } from "../shared/yesodActions.js";

// Extraído em 26/08/2026 (item 5, passo 4 do Plano de Decomposição, ver 11 Plano de
// Decomposição — Arquivos Monolíticos.md, seção "Item 5, passo 4"). Diferente das outras 4
// sub-páginas de detalhe (que foram pra DetailPages.jsx por serem cross-tab via Config),
// `goalsDetail` só é aberta de dentro desta própria aba (nav("goalsDetail"), sem outro call
// site — confirmado por grep) — então ficou aqui mesmo, mais perto do plano original.
// Definido fora de ObjetivosTab (26/08/2026) — mesmo motivo do BackBtn de DetailPages.jsx
// (react-hooks/static-components: "component created during render" ao subir pro nível
// direto da função exportada).
function BackBtn({label, C, back}){return(<button onClick={back} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:C.dim,marginBottom:14}}><Ico n="back" size={13}/> {label}</button>);}

export function ObjetivosTab({ C }) {
  const ctx = useContext(YesodCtx);
  const {
    back, cashflowMonth, getMonthStr, ifGoal, ifMonthly, ifProjection, ifRisk, monthLabel2, nav, net,
    openSh, page, setFinXp, setYGoals, yGoals,
  } = ctx;

  if (page && page.type === "goalsDetail") {
            const ifNeeded=ifProjection.ifNeeded;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
            // monthsLeft/yearsLeft vêm de ifProjection (Context) — projMonthlyNet, não mais
            // média histórica pura. avgSaving continua sendo a média dos últimos 3 meses, só
            // como estatística visível ("poupança média/mês"), não alimenta mais a projeção.
            const {monthsLeft,yearsLeft}=ifProjection;
            const last3=[-1,-2,-3].map(o=>cashflowMonth(o));const avgSaving=Math.max(0,last3.reduce((s,m)=>s+(m.ins-m.outs),0)/3);
            const months6=[-5,-4,-3,-2,-1,0].map(o=>cashflowMonth(o));const savRates=months6.map(m=>({ym:m.ym,rate:m.ins>0?Math.max(0,Math.round(((m.ins-m.outs)/m.ins)*100)):0}));
            return(<div style={{animation:"slideUp .3s ease"}}><BackBtn label="Objetivos" C={C} back={back}/>
              {ifRisk.atRisk&&(
                <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#ef444418",border:"1px solid #ef444444",borderRadius:12,padding:"10px 12px",marginBottom:12}}>
                  <Ico n="alert" size={15} color="#ef4444"/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#ef4444",marginBottom:2}}>Fora da rota</div>
                    <div style={{fontSize:10.5,color:C.muted,lineHeight:1.4,marginBottom:6}}>{ifRisk.reason} — a meta atrasou ~{ifRisk.delta} {ifRisk.delta===1?"mês":"meses"} desde que o plano foi criado.</div>
                    <button onClick={()=>YESOD_ACTION_HANDLERS.reset_if_baseline()} style={{background:"#ef444422",border:"1px solid #ef444444",borderRadius:7,padding:"4px 10px",cursor:"pointer",color:"#ef4444",fontSize:10,fontWeight:700}}>Recalcular base do plano</button>
                  </div>
                </div>
              )}
              <div style={{background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18,marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div><div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div><div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div><div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{l:"POUPANÇA MÉDIA/MÊS",v:fmt(avgSaving),sub:"últimos 3 meses",c:avgSaving>0?ACCENT:"#ef4444"},{l:"PROJEÇÃO",v:yearsLeft?yearsLeft+" anos":"—",sub:monthsLeft?monthsLeft+" meses":"sem dados",c:ACCENT},{l:"RENDA MENSAL (4%)",v:fmt(ifNeeded/300),sub:"ao atingir a meta",c:"#f59e0b"},{l:"PATRIMÔNIO ALVO",v:fmt(ifNeeded),sub:"regra dos 4%",c:C.text}].map(s=>(<div key={s.l} style={{background:C.card,border:"1px solid "+C.b1,borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>{s.l}</div><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{s.sub}</div></div>))}</div>
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginBottom:14}}><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:12}}>TAXA DE POUPANÇA — 6 MESES</div>{savRates.map(s=>{const color=s.rate>=20?ACCENT:s.rate>=10?"#f59e0b":"#ef4444";return(<div key={s.ym} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:10,minWidth:40,color:s.ym===getMonthStr(0)?ACCENT:C.text,fontWeight:s.ym===getMonthStr(0)?700:400}}>{monthLabel2(s.ym)}</span><div style={{flex:1,height:5,background:C.b1,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,s.rate)+"%",background:color,borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color,minWidth:30,textAlign:"right"}}>{s.rate}%</span></div>);})}</div>
              <Btn outline color={ACCENT} onClick={()=>openSh("editIF",{ifGoal:ifNeeded,ifMonthly})}><Ico n="edit" size={14}/> Editar meta</Btn>

              {/* Outras metas — livres, não só IF (checklist com XP) */}
              <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,padding:14,marginTop:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>OUTRAS METAS</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{yGoals.filter(g=>g.done).length}/{yGoals.length}</span><button onClick={()=>openSh("addYGoal",{title:"",xp:100})} style={{background:"#f59e0b22",border:"1px solid #f59e0b44",borderRadius:7,padding:"3px 9px",cursor:"pointer",color:"#f59e0b",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Ico n="plus" size={10} color="#f59e0b"/> Meta</button></div>
                </div>
                {yGoals.length===0&&<div style={{textAlign:"center",padding:16,color:C.muted,fontSize:11}}>Nenhuma meta ainda — toque em "+ Meta" pra criar uma.</div>}
                {yGoals.map(g=>(<div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:"1px solid "+C.b1}}><button onClick={()=>{if(!g.done){setFinXp(x=>x+g.xp);}setYGoals(p=>p.map(x=>x.id===g.id?{...x,done:!x.done}:x));}} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:"1.5px solid "+(g.done?"#f59e0b":C.b2),background:g.done?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{g.done&&<Ico n="check" size={11} color="#fff" sw={2.5}/>}</button><div style={{flex:1,fontSize:12,color:g.done?C.muted:C.text,textDecoration:g.done?"line-through":"none"}}>{g.title}</div><span style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>+{g.xp}</span><button onClick={()=>setYGoals(p=>p.filter(x=>x.id!==g.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:.5}}><Ico n="x" size={11} color={C.muted}/></button></div>))}
              </div>
            </div>);
  }

          const ifNeeded=ifGoal||ifMonthly*300;const ifPct=Math.min(100,Math.round((net/ifNeeded)*100));
          return(<div style={{animation:"slideUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <Btn sm full={false} color={ACCENT} onClick={()=>openSh("addYGoal",{title:"",xp:100})}><Ico n="plus" size={11}/> Objetivo</Btn>
            </div>
            <div onClick={()=>nav("goalsDetail")} style={{cursor:"pointer",background:"linear-gradient(135deg,"+ACCENT+"22,"+ACCENT+"06)",border:"1px solid "+ACCENT+"44",borderRadius:16,padding:18}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>META DE INDEPENDÊNCIA FINANCEIRA</div>
              <div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:2}}>{ifPct}%</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{fmt(net)} de {fmt(ifNeeded)}</div>
              <div style={{height:10,background:C.b1,borderRadius:99,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:ifPct+"%",background:"linear-gradient(90deg,"+ACCENT+",#06b6d4)",borderRadius:99}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted}}><span>Atual: {fmt(net)}</span><span>Faltam: {fmt(Math.max(0,ifNeeded-net))}</span></div>
            </div>
          </div>);
}
