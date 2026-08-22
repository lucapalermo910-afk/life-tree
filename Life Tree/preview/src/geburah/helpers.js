// Helpers puros + hook de persistência do Geburah, extraídos de GeburahModule.jsx
// (21/08/2026, item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]]) para
// que os arquivos de aba (geburah/*Tab.jsx) possam importá-los sem depender do shell.
import { useState, useEffect, useCallback } from "react";

export const uid    = () => Math.random().toString(36).slice(2,8);
export const todayS = () => new Date().toISOString().slice(0,10);
export const fmt1   = n  => Number(n).toFixed(1);
export const fmtKg  = n  => fmt1(n)+"kg";
export const clamp  = (v,a,b) => Math.min(b,Math.max(a,v));

// Sugere o tipo de refeição pelo horário atual — usado como padrão em vez de fixar
// sempre "Almoço", que ficava errado em quick-adds feitos à noite.
export function refeicaoPorHorario() {
  const h = new Date().getHours();
  if (h<10) return "Café da manhã";
  if (h<12) return "Lanche";
  if (h<15) return "Almoço";
  if (h<18) return "Lanche tarde";
  if (h<21) return "Jantar";
  return "Ceia";
}
// Estimativa de % de gordura corporal pela fórmula da Marinha dos EUA (US Navy Method) —
// sem balança de bioimpedância, é o método por fita métrica mais usado e validado
// (~3-4% de margem vs. DEXA). Usa só medidas que o módulo já coleta (Cintura, Pescoço,
// Quadril em mulheres, altura do Perfil) — não pede nenhum dado novo ao usuário.
export function calcNavyBF(sexo, cintura, pescoco, quadril, alturaCm) {
  if (!cintura || !pescoco || !alturaCm) return null;
  if (sexo === "F") {
    if (!quadril) return null;
    const diff = cintura + quadril - pescoco;
    if (diff <= 0) return null;
    return 495/(1.29579 - 0.35004*Math.log10(diff) + 0.22100*Math.log10(alturaCm)) - 450;
  }
  const diff = cintura - pescoco;
  if (diff <= 0) return null;
  return 495/(1.0324 - 0.19077*Math.log10(diff) + 0.15456*Math.log10(alturaCm)) - 450;
}

// ── STORAGE ───────────────────────────────────────────────────────────────────
export const GEB_PFX = "lifetree_geb_";
export function sGet(key) { try{const v=localStorage.getItem(GEB_PFX+key);return v!==null?JSON.parse(v):null;}catch{return null;} }
export function sSet(key,val) { try{localStorage.setItem(GEB_PFX+key,JSON.stringify(val));}catch{} }
// reloadSignal: quando muda (qualquer valor novo), relê a chave do localStorage — usado
// depois que o Coach global (App.jsx) escreve direto no localStorage via geburahActions.js,
// mesmo mecanismo do Yesod (ver coachSync.js). Sem isso, se o módulo estiver montado quando
// uma ação do Coach roda, a tela fica com dado velho até um reload manual da página.
export function usePersisted(key,def,reloadSignal) {
  const [v,setV] = useState(()=>{ const s=sGet(key); return s!==null?s:def; });
  useEffect(()=>{
    if(reloadSignal===undefined) return;
    const s=sGet(key); if(s!==null) setV(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[reloadSignal]);
  const set = useCallback(fn=>{
    setV(prev=>{const next=typeof fn==="function"?fn(prev):fn; sSet(key,next); return next;});
  },[key]);
  return [v,set];
}

// ── TREINO CALC ──────────────────────────────────────────────────────────────
export const FATOR_MET_ARTE=0.80, FATOR_MET_MUSC=0.65; // correção pessimista (inclui descanso entre séries) — mesmo fator da biblioteca de exercícios original
export function kcalMinExercicio(e,pesoKg){ if(!e?.met)return null; const fator=e.grupo==="Artes Marciais"?FATOR_MET_ARTE:FATOR_MET_MUSC; return (e.met*fator*pesoKg/60); }

// Tipo de registro na execução ao vivo — deriva do grupo/nome em vez de anotar os 286
// itens da biblioteca um a um. "carga": peso em kg (padrão, musculação). "tempo": segundos
// sustentados/decorridos (artes marciais, cardio, flexibilidade — reaproveita o mesmo campo
// numérico cargaReal, só troca a unidade exibida). "reps": contagem de repetições sem carga
// relevante (bodyweight tipo flexão/agachamento livre — usa o campo novo repsReal).
// LOG_TIPO_OVERRIDE cobre exceções que a heurística por grupo erraria (Prancha é "Core" mas
// é medida por tempo, não carga).
export const LOG_TIPO_OVERRIDE = { e9:"tempo" };
export function logTipoDe(ex){
  if(!ex) return "carga";
  if(LOG_TIPO_OVERRIDE[ex.id]) return LOG_TIPO_OVERRIDE[ex.id];
  if(ex.grupo==="Artes Marciais"||ex.grupo==="Cardio"||ex.grupo==="Flexibilidade") return "tempo";
  if(ex.equip==="Corpo"&&/flex[aã]o|agachamento livre|abdominal|burpee|barra fixa|paralela/i.test(ex.name||"")) return "reps";
  return "carga";
}
export function logTipoUnidade(tipo){ return tipo==="tempo"?"s":tipo==="reps"?"reps":"kg"; }
