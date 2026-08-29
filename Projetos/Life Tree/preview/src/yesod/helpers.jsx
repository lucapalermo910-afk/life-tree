import { useState } from "react";
import { Ico } from "./icons.jsx";
import { ACCENT } from "./theme.js";
import { COLOR_PALETTE } from "./constants.js";

// Card colapsável usado no "Índice de tudo" de Config (26/08/2026) -- cabeçalho com
// título+contagem+Adicionar+seta, corpo só renderiza quando aberto (evita montar tudo de
// uma vez numa tela que agora espelha o app inteiro).
export function CfgSection({ title, count, defaultOpen, onAdd, addLabel, C, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{background:C.card,border:"1px solid "+C.b1,borderRadius:14,marginBottom:10,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,fontWeight:700}}>{title}</span>
          {count!=null&&<span style={{fontSize:10,fontWeight:700,color:C.muted,background:C.surface,borderRadius:99,padding:"1px 7px"}}>{count}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {onAdd&&<button onClick={e=>{e.stopPropagation();onAdd();}} style={{background:C.b1,border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,color:ACCENT}}><Ico n="plus" size={11}/> {addLabel||"Adicionar"}</button>}
          <div style={{transform:open?"rotate(90deg)":"none",transition:"transform .15s",display:"flex"}}><Ico n="chev" size={12} color={C.muted}/></div>
        </div>
      </div>
      {open&&<div style={{padding:"0 14px 14px"}}>{children}</div>}
    </div>
  );
}
// Gráfico de linha da Projeção de Fluxo de Caixa — sem lib de charts, SVG cru igual ao
// resto do módulo. "base" é a trajetória sem ajuste de cenário; "scenario" (opcional) é
// a trajetória com os ajustes do usuário somados — desenhada por cima, tracejada, só
// quando difere de base (senão é redundante mostrar duas linhas iguais).
export function ProjChart({ base, scenario, C, height=140 }) {
  const W=300, H=height, padB=18;
  const hasScenario = scenario && scenario.some((p,i)=>Math.abs(p.balance-base[i].balance)>0.5);
  const all = hasScenario ? [...base,...scenario] : base;
  const minB = Math.min(0,...all.map(p=>p.balance));
  const maxB = Math.max(...all.map(p=>p.balance),1);
  const xN = base.length-1||1;
  const xOf = i => (i/xN)*W;
  const yOf = v => (H-padB)-((v-minB)/((maxB-minB)||1))*(H-padB-8);
  const pathOf = pts => pts.map((p,i)=>(i===0?"M":"L")+xOf(i).toFixed(1)+","+yOf(p.balance).toFixed(1)).join(" ");
  const zeroY = yOf(0);
  const lineColor = hasScenario ? C.dim : ACCENT;
  return (
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height,display:"block",overflow:"visible"}} preserveAspectRatio="none">
      {minB<0 && <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,3" opacity={0.5}/>}
      <path d={pathOf(base)+" L"+xOf(xN)+","+(H-padB)+" L0,"+(H-padB)+" Z"} fill={lineColor} opacity={0.12} stroke="none"/>
      <path d={pathOf(base)} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {hasScenario && <path d={pathOf(scenario)} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="5,4" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}
export function ColorPicker({ value, onChange, C }) {
  const [open, setOpen] = useState(false);
  return (<div style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:.8}}>COR</div><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>setOpen(o=>!o)} style={{width:36,height:36,borderRadius:10,background:value||ACCENT,border:"none",cursor:"pointer",flexShrink:0}}/><span style={{fontSize:11,color:C.muted}}>{open?"Escolha uma cor":"Toque para mudar"}</span></div>{open&&(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,padding:"10px",background:C.b1,borderRadius:12}}>{COLOR_PALETTE.map(c=>(<button key={c} onClick={()=>{onChange(c);setOpen(false);}} style={{width:32,height:32,borderRadius:8,background:c,border:"none",cursor:"pointer",boxShadow:value===c?"0 0 0 2px #fff, 0 0 0 4px "+c:"none"}}/>))}</div>)}</div>);
}
// Totalizador compacto por seção de Bolsos — versão discreta do card grande de "TOTAL EM
// DÍVIDAS" de antes (25/08/2026: usuário achou que tinha destaque demais); uma linha só,
// cor por categoria em vez do gradiente+borda grossa de antes.
export function MiniTotal({ label, value, color, C }) {
  return (<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:"1px solid "+color+"33",borderLeft:"3px solid "+color,borderRadius:10,padding:"8px 12px",marginBottom:10}}>
    <span style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:.6}}>{label}</span>
    <span style={{fontSize:14,fontWeight:900,color}}>{value}</span>
  </div>);
}
