// Helpers puros do Hod, extraídos de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { PROJECT_TYPES, PHASES_BY_TYPE } from "./constants.js";

export const uid = () => Math.random().toString(36).slice(2,8);
export const todayS = () => new Date().toISOString().slice(0,10);
export const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
export const pct = (a,b) => b===0?0:Math.min(100,Math.round(a/b*100));

// Receita de projeto (meta/preço×clientes) vs. financeiro real do Yesod — antes os dois
// números podiam divergir silenciosamente, sem nenhum jeito de comparar (gap #6 da
// "Auditoria pós-implementação", ver [[08 Hod]]; "esforço grande" no doc original porque
// reconciliação bidirecional completa exigiria decisões de mapeamento de categoria/conta —
// fora de escopo aqui). Versão pragmática: leitura read-only do localStorage do Yesod
// (nunca escreve nada lá), soma as entradas do mês atual numa categoria que o usuário
// vincula ao projeto. Retorna null se o projeto não tem categoria vinculada.
export function yesodMonthRevenueForCategory(cat) {
  if (!cat) return null;
  try {
    const accs = JSON.parse(localStorage.getItem("lifetree_fin_accs") || "[]");
    const cards = JSON.parse(localStorage.getItem("lifetree_fin_cards") || "[]");
    const ym = new Date().toISOString().slice(0, 7);
    let sum = 0;
    accs.forEach(a => (a.txs || []).forEach(t => { if (t.type === "in" && t.cat === cat && t.date && t.date.startsWith(ym)) sum += t.amount; }));
    cards.forEach(c => (c.txs || []).forEach(t => { if (t.type === "in" && t.cat === cat && t.date && t.date.startsWith(ym)) sum += t.amount; }));
    return sum;
  } catch { return null; }
}

// ── TRILHAS DE COMPETÊNCIA ─────────────────────────────────────────────────
export const cycleFocus = f => f==="atual" ? "explorando" : f==="explorando" ? "arquivada" : "atual";
export const trackScore = t => t.skills.length ? Math.round(t.skills.reduce((s,sk)=>s+(sk.level/sk.target),0)/t.skills.length*100) : 0;

// ── MOTOR DE PROJETOS UNIFICADO ─────────────────────────────────────────────
// Cada linha corresponde, em ordem, aos 3 itens do CRITERIA_BY_TYPE daquele type+fase —
// "false" fixo = critério subjetivo, sem sinal automático no dado (mesmo padrão que o
// negócio já tinha: 2 auto-checados + 1 manual).
export function criteriaAutoChecks(p, phaseIdx) {
  const exp = p.experiments || [], learn = p.learnings || [], clients = p.clients || [], plan = p.plan || [], habits = p.habits || [];
  const expDone = exp.filter(e=>e.status==="concluido").length;
  const learnDone = learn.length;
  const activeClients = clients.filter(c=>c.active).length;
  const planDone = plan.filter(x=>x.status==="concluido").length;
  const canvas = p.canvas || {};
  const hasAnySession = clients.some(c=>(c.sessions||[]).length>0);
  const hasPositiveFeedback = clients.some(c=>c.lastFeedback);
  const revenue3mo = (p.revenueHistory||[]).slice(-3);
  const revenueStable3mo = revenue3mo.length>=3 && revenue3mo.every(h=>h.rev>0);
  const table = {
    negocio: [
      [expDone>=3, learnDone>=1, false],
      [activeClients>=1, !!canvas.revenueModel, false],
      [revenueStable3mo, false, false],
    ],
    produto: [
      [!!(canvas.problem&&canvas.targetUser), expDone>=1, !!p.nextStep],
      [learnDone>=1, !!canvas.successMetric, expDone>=3],
      [learnDone>=3, expDone>=2, false],
      [true, !!canvas.successMetric, habits.length>0],
    ],
    conteudo: [
      [!!(canvas.topic&&canvas.format), !!canvas.freq, plan.length>=1],
      [planDone>=3, learnDone>=1, habits.length>0],
      [habits.some(h=>h.done), learnDone>=5, !!p.linkedChannelId],
    ],
    servico: [
      [!!(canvas.targetAudience&&canvas.differentiator), !!canvas.deliveryFormat, learnDone>=1],
      [p.price>0, plan.length>=1, false],
      [activeClients>=1, hasAnySession, hasPositiveFeedback],
      [revenueStable3mo, activeClients>=3, plan.length>=1],
    ],
    outro: [
      [!!canvas.desc, !!p.nextStep, plan.length>=1],
      [plan.length>0 && planDone===plan.length, habits.length>0, false],
    ],
  };
  return (table[p.type] || table.outro)[phaseIdx] || [false,false,false];
}
export const typeMeta  = t => PROJECT_TYPES.find(x=>x.id===t) || PROJECT_TYPES[4];
export const typeColor = t => typeMeta(t).color;
export const typeLabel = t => typeMeta(t).label;
export const phasesFor = t => PHASES_BY_TYPE[t] || PHASES_BY_TYPE.outro;
export const phaseLabel = p => (phasesFor(p.type).find(ph=>ph.id===p.phase)||{}).label || p.phase;
// C explícito por parâmetro (não por closure de módulo) — chamada de dentro dos arquivos
// de aba, que já têm o C local correto (via useContext(ThemeCtx)) disponível pra passar.
export const chipStyle = (active,color,C) => ({
  flexShrink:0,padding:"6px 12px",borderRadius:99,border:"1px solid "+(active?color:C.b1),
  background:active?color+"18":C.card,color:active?color:C.muted,fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",
});
