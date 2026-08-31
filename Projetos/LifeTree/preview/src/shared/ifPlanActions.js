// Plano da Meta de Independência Financeira — extraído de KetherModule.jsx em 30/08/2026
// (usuário pediu pra também editar/apagar esse plano de dentro do Yesod, não só do Kether/
// Desejos — ver as duas telas do Yesod nos screenshots do pedido). Ficava só como funções
// locais do Kether; agora é compartilhado porque duas telas (Kether "Objetivo Principal" e
// Yesod "Meta de Independência Financeira") precisam ler/escrever exatamente o mesmo plano,
// sem duplicar a lógica (e sem duplicar o bug já corrigido — apagar item daqui tem que
// apagar também a meta/hábito real no Yesod, não só a referência local).
//
// Guardado sob uma chave "keth" por decisão original do protótipo do Kether (29/08/2026) —
// mantido assim pra não quebrar quem já tem o plano salvo; é a mesma chave nos dois módulos.
import { YESOD_ACTION_HANDLERS } from "./yesodActions.js";

export const IF_PLAN_KEY = "lifetree_keth_if_plan";
const uid = () => Math.random().toString(36).slice(2, 8);

export function readIfPlan() {
  try {
    const v = localStorage.getItem(IF_PLAN_KEY);
    return v !== null ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

function writeIfPlan(next) {
  try { localStorage.setItem(IF_PLAN_KEY, next === null ? "null" : JSON.stringify(next)); } catch {}
  return next;
}

export function criarIfPlan() {
  YESOD_ACTION_HANDLERS.reset_if_baseline();
  return writeIfPlan({ metas: [], acoes: [] });
}

export function addIfMeta(plan, title, xp = 150) {
  const t = (title || "").trim();
  if (!t) return plan;
  YESOD_ACTION_HANDLERS.create_ygoal({ title: t, xp });
  return writeIfPlan({ ...plan, metas: [...plan.metas, { id: "ifm" + uid(), title: t }] });
}

// Apaga a referência aqui E a meta de verdade no Yesod — antes só tirava a referência local,
// deixando a meta órfã em "Outras Metas" pra sempre (achado 30/08/2026).
export function removeIfMeta(plan, id) {
  const m = plan.metas.find(x => x.id === id);
  if (m) YESOD_ACTION_HANDLERS.delete_ygoal({ match: m.title });
  return writeIfPlan({ ...plan, metas: plan.metas.filter(x => x.id !== id) });
}

export function addIfAcao(plan, title, freq, xp = 20) {
  const t = (title || "").trim();
  if (!t) return plan;
  YESOD_ACTION_HANDLERS.create_yhabit({ title: t, freq, xp });
  return writeIfPlan({ ...plan, acoes: [...plan.acoes, { id: "ifa" + uid(), title: t, freq }] });
}

// Mesma correção do removeIfMeta — apaga o hábito real, não só a referência.
export function removeIfAcao(plan, id) {
  const a = plan.acoes.find(x => x.id === id);
  if (a) YESOD_ACTION_HANDLERS.delete_yhabit({ match: a.title });
  return writeIfPlan({ ...plan, acoes: plan.acoes.filter(x => x.id !== id) });
}

// Apaga o plano inteiro (volta pro estado "ainda não tem plano") e todas as metas/ações reais
// que ele criou no Yesod — não existia nenhuma forma de fazer isso antes (achado 30/08/2026).
export function apagarIfPlano(plan) {
  plan.metas.forEach(m => YESOD_ACTION_HANDLERS.delete_ygoal({ match: m.title }));
  plan.acoes.forEach(a => YESOD_ACTION_HANDLERS.delete_yhabit({ match: a.title }));
  return writeIfPlan(null);
}
