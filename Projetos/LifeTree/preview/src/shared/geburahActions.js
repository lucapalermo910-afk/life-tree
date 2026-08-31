// Ações que o Coach global executa sobre os dados do Geburah (Saúde/Treino).
//
// Mesmo padrão de yesodActions.js (ver esse arquivo pro racional completo): o estado do
// Geburah vive em GeburahModule.jsx (usePersisted → localStorage), não em App.jsx, então
// essas funções leem/escrevem localStorage direto (chave "lifetree_geb_*") e avisam o
// módulo via notifyCoachDataUpdated("geburah") — se o módulo estiver montado, ele relê do
// storage (ver GeburahModule.jsx, usePersisted com reloadSignal=coachSyncTick).

import { notifyCoachDataUpdated } from "./coachSync.js";
import { CATS_AL, GRUPOS } from "../geburah/constants.js";

const PFX = "lifetree_geb_";
const uid = () => Math.random().toString(36).slice(2, 8);
const todayS = () => new Date().toISOString().slice(0, 10);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PFX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(PFX + key, JSON.stringify(val));
  } catch {}
}
function notifyGeburahUpdated() {
  notifyCoachDataUpdated("geburah");
}

function refeicaoPorHorarioNow() {
  const h = new Date().getHours();
  if (h < 10) return "Café da manhã";
  if (h < 12) return "Lanche";
  if (h < 15) return "Almoço";
  if (h < 18) return "Lanche tarde";
  if (h < 21) return "Jantar";
  return "Ceia";
}

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");
function normalize(s) {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(DIACRITICS_RE, "").trim();
}

// Localiza um item de uma lista por nome, em ordem de confiança crescente de "esforço" —
// exato → prefixo → substring (comportamento antigo, único que existia) → todas as
// palavras da busca aparecem no nome (resolve caso como "peito grelhado" batendo em
// "Peito de Frango Grelhado", que substring simples não pega se a ordem das palavras
// não é idêntica). Resolve o gap "match por substring falha bem mais que o esperado
// mesmo com banco de 376 itens" registrado em [[04 Bugs Conhecidos]].
function findByField(list, field, text) {
  if (!list.length) return null;
  const q = normalize(text);
  if (!q) return list[0];
  const norm = list.map(x => ({ item: x, n: normalize(x[field] || "") }));
  let hit = norm.find(x => x.n === q);
  if (!hit) hit = norm.find(x => x.n.startsWith(q));
  if (!hit) hit = norm.find(x => x.n.includes(q));
  if (!hit) {
    const words = q.split(/\s+/).filter(Boolean);
    hit = norm.find(x => words.every(w => x.n.includes(w)));
  }
  return hit ? hit.item : null;
}

// ── PESO ─────────────────────────────────────────────────────────────────────
export function registerGeburahWeight(a) {
  const peso = Number(a.peso);
  if (!peso || peso <= 0) return { ok: false, message: "Peso inválido." };
  const pesagens = readJSON("pesagens", []);
  const data = a.data || todayS();
  // upsert por data — mesmo comportamento do Sheet "Registrar Peso" na UI (uma pesagem
  // por dia; registrar de novo no mesmo dia substitui, não duplica).
  const entry = { id: "ps" + uid(), data, peso, ...(a.gordura ? { gordura: Number(a.gordura) } : {}) };
  writeJSON("pesagens", [...pesagens.filter(x => x.data !== data), entry]);
  notifyGeburahUpdated();
  return { ok: true, message: "Peso de " + peso + "kg registrado em " + data + "." };
}

// ── REFEIÇÃO ─────────────────────────────────────────────────────────────────
export function registerGeburahMeal(a) {
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "' no banco." };
  let qtd = Number(a.qtd);
  if (!qtd && a.porcoes && al.porcao?.gramas) qtd = Number(a.porcoes) * al.porcao.gramas;
  if (!qtd || qtd <= 0) qtd = al.porcao?.gramas || 100;
  const logDieta = readJSON("logDieta", []);
  const refeicao = a.refeicao || refeicaoPorHorarioNow();
  const entry = { id: "ld" + uid(), data: a.data || todayS(), refeicao, alimentoId: al.id, qtd };
  writeJSON("logDieta", [...logDieta, entry]);
  notifyGeburahUpdated();
  return { ok: true, message: al.name + " (" + qtd + "g) registrado em " + refeicao + "." };
}

// ── ÁGUA ─────────────────────────────────────────────────────────────────────
export function registerGeburahWater(a) {
  const ml = Number(a.ml);
  if (!ml || ml <= 0) return { ok: false, message: "Quantidade de água inválida." };
  const agua = readJSON("agua", { meta: 3000, copos: [] });
  const copos = [...(agua.copos || []), { id: "ag" + uid(), data: a.data || todayS(), ml }];
  writeJSON("agua", { ...agua, copos });
  notifyGeburahUpdated();
  return { ok: true, message: ml + "ml de água registrados." };
}
export function adjustGeburahWaterGoal(a) {
  const meta = Number(a.meta);
  if (!meta || meta <= 0) return { ok: false, message: "Meta de água inválida." };
  const agua = readJSON("agua", { meta: 3000, copos: [] });
  writeJSON("agua", { ...agua, meta });
  notifyGeburahUpdated();
  return { ok: true, message: "Meta de água atualizada para " + meta + "ml." };
}

// ── MEDIDAS CORPORAIS ────────────────────────────────────────────────────────
// a.medidas: {"Cintura":90,"Peso":88,...} — mescla com o que já existir na mesma data
// em vez de sobrescrever (ex: o usuário já tinha registrado Peito hoje pela tela, e o
// Coach só está adicionando Cintura — não pode apagar o Peito).
export function registerGeburahMeasurement(a) {
  const raw = a.medidas && typeof a.medidas === "object" ? a.medidas : null;
  if (!raw) return { ok: false, message: "Nenhuma medida informada." };
  const cleaned = {};
  Object.entries(raw).forEach(([k, v]) => { const n = Number(v); if (!isNaN(n)) cleaned[k] = n; });
  if (!Object.keys(cleaned).length) return { ok: false, message: "Nenhuma medida numérica válida." };
  const medidasCorp = readJSON("medidasCorp", []);
  const data = a.data || todayS();
  const existing = medidasCorp.find(x => x.data === data);
  const merged = existing ? { ...existing.medidas, ...cleaned } : cleaned;
  writeJSON("medidasCorp", [...medidasCorp.filter(x => x.data !== data), { id: existing?.id || "mc" + uid(), data, medidas: merged }]);
  notifyGeburahUpdated();
  return { ok: true, message: Object.keys(cleaned).length + " medida(s) registrada(s) em " + data + "." };
}

// ── TREINO ───────────────────────────────────────────────────────────────────
// Espelha exatamente o botão "Iniciar" da UI (GeburahModule.jsx) — mesma forma de log
// (horaInicio + series pré-preenchidas com feito:false a partir da rotina), pra que o
// resto do app (relógio ao vivo, kcal, treinoScore, planejamento) trate igual não importa
// se o treino foi iniciado pela tela ou pelo Coach.
export function startGeburahWorkout(a) {
  const rotinas = readJSON("rotinasTreino", []);
  const rot = findByField(rotinas, "name", a.rotina);
  if (!rot) return { ok: false, message: "Não encontrei rotina com '" + a.rotina + "'." };
  const logTreino = readJSON("logTreino", []);
  const log = {
    id: "lt" + uid(), data: todayS(), horaInicio: new Date().toISOString(),
    rotinaId: rot.id, rotinaName: rot.name,
    series: rot.exercicios.map(e => ({ ...e, feito: false, cargaReal: e.carga })),
  };
  writeJSON("logTreino", [...logTreino, log]);
  notifyGeburahUpdated();
  return { ok: true, message: "Treino '" + rot.name + "' iniciado! Abra a aba Treino pra registrar as séries." };
}
// Finaliza o treino em andamento (sem horaFim) mais recente de hoje — "match" opcional
// desambigua se por acaso houver mais de um treino aberto no mesmo dia.
export function finishGeburahWorkout(a) {
  const logTreino = readJSON("logTreino", []);
  const today = todayS();
  let candidates = logTreino.filter(l => !l.horaFim && l.data === today);
  if (a.rotina) {
    const q = normalize(a.rotina);
    const filtered = candidates.filter(l => normalize(l.rotinaName || "").includes(q));
    if (filtered.length) candidates = filtered;
  }
  if (!candidates.length) return { ok: false, message: "Não encontrei nenhum treino em andamento hoje." };
  candidates.sort((x, y) => (y.horaInicio || "").localeCompare(x.horaInicio || ""));
  const log = candidates[0];
  const fim = new Date().toISOString();
  const inicioMs = log.horaInicio ? new Date(log.horaInicio).getTime() : null;
  const duracaoMin = inicioMs != null ? Math.max(1, Math.round((new Date(fim).getTime() - inicioMs) / 60000)) : null;
  writeJSON("logTreino", logTreino.map(l => l.id === log.id ? { ...l, horaFim: fim, duracaoMin } : l));
  notifyGeburahUpdated();
  return { ok: true, message: "Treino '" + log.rotinaName + "' finalizado" + (duracaoMin ? " (" + duracaoMin + "min)" : "") + "." };
}

// ── METAS NUTRICIONAIS ───────────────────────────────────────────────────────
export function adjustGeburahGoals(a) {
  const metas = readJSON("metas", { cal: 2200, prot: 160, carb: 220, gord: 70 });
  const patch = {};
  ["cal", "prot", "carb", "gord"].forEach(k => { if (a[k] != null) patch[k] = Number(a[k]); });
  if (!Object.keys(patch).length) return { ok: false, message: "Nenhuma meta informada." };
  writeJSON("metas", { ...metas, ...patch });
  notifyGeburahUpdated();
  return { ok: true, message: "Meta(s) nutricional(is) atualizada(s)." };
}

// Remove um item já lançado numa refeição (31/08/2026, pedido do usuário — Coach cobria
// registrar mas não desfazer). Sem "refeicao" pega o item mais recente daquele alimento no
// dia; com "refeicao" restringe antes, pra não remover o item errado se o mesmo alimento
// foi lançado em duas refeições no mesmo dia.
export function deleteGeburahMealItem(a) {
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  const logDieta = readJSON("logDieta", []);
  const data = a.data || todayS();
  let candidates = logDieta.filter(l => l.alimentoId === al.id && l.data === data);
  if (a.refeicao) {
    const filtered = candidates.filter(l => normalize(l.refeicao) === normalize(a.refeicao));
    if (filtered.length) candidates = filtered;
  }
  if (!candidates.length) return { ok: false, message: "Não encontrei '" + al.name + "' registrado em " + data + "." };
  const alvo = candidates[candidates.length - 1];
  writeJSON("logDieta", logDieta.filter(l => l.id !== alvo.id));
  notifyGeburahUpdated();
  return { ok: true, message: al.name + " removido de " + alvo.refeicao + "." };
}

// ── ALIMENTOS (biblioteca) ───────────────────────────────────────────────────
export function createGeburahFood(a) {
  if (!a.nome) return { ok: false, message: "Nome do alimento não informado." };
  const alimentos = readJSON("alimentos", []);
  const cat = CATS_AL.includes(a.categoria) ? a.categoria : CATS_AL[0];
  const porcao = (a.porcaoLabel && Number(a.porcaoGramas) > 0) ? { label: a.porcaoLabel, gramas: Number(a.porcaoGramas) } : null;
  const novo = {
    id: "al" + uid(), name: a.nome, cat,
    cal100: Number(a.cal100) || 0, prot: Number(a.prot) || 0, carb: Number(a.carb) || 0, gord: Number(a.gord) || 0,
    fibra: Number(a.fibra) || 0, sodio: Number(a.sodio) || 0, calcio: Number(a.calcio) || 0, ferro: Number(a.ferro) || 0, vitC: Number(a.vitC) || 0,
    ...(porcao ? { porcao } : {}), favorito: false,
  };
  writeJSON("alimentos", [...alimentos, novo]);
  notifyGeburahUpdated();
  return { ok: true, message: "Alimento '" + novo.name + "' criado em " + cat + "." };
}
export function editGeburahFood(a) {
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  const patch = {};
  if (a.nome) patch.name = a.nome;
  if (a.categoria && CATS_AL.includes(a.categoria)) patch.cat = a.categoria;
  ["cal100", "prot", "carb", "gord", "fibra", "sodio", "calcio", "ferro", "vitC"].forEach(k => { if (a[k] != null) patch[k] = Number(a[k]); });
  if (a.porcaoLabel && Number(a.porcaoGramas) > 0) patch.porcao = { label: a.porcaoLabel, gramas: Number(a.porcaoGramas) };
  if (!Object.keys(patch).length) return { ok: false, message: "Nenhum campo pra atualizar." };
  writeJSON("alimentos", alimentos.map(x => x.id === al.id ? { ...x, ...patch } : x));
  notifyGeburahUpdated();
  return { ok: true, message: "Alimento '" + al.name + "' atualizado." };
}
export function deleteGeburahFood(a) {
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  writeJSON("alimentos", alimentos.filter(x => x.id !== al.id));
  notifyGeburahUpdated();
  return { ok: true, message: "Alimento '" + al.name + "' excluído." };
}
export function setGeburahFoodFavorite(a) {
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  const favorito = a.favorito != null ? !!a.favorito : !al.favorito;
  writeJSON("alimentos", alimentos.map(x => x.id === al.id ? { ...x, favorito } : x));
  notifyGeburahUpdated();
  return { ok: true, message: al.name + (favorito ? " favoritado." : " removido dos favoritos.") };
}

// ── RECEITAS ─────────────────────────────────────────────────────────────────
export function createGeburahRecipe(a) {
  if (!a.nome) return { ok: false, message: "Nome da receita não informado." };
  const receitas = readJSON("receitas", []);
  const novo = { id: "rec" + uid(), name: a.nome, desc: a.desc || "", ingredientes: [], steps: [] };
  writeJSON("receitas", [...receitas, novo]);
  notifyGeburahUpdated();
  return { ok: true, message: "Receita '" + novo.name + "' criada — use add_recipe_ingredient pra montar os ingredientes." };
}
export function editGeburahRecipe(a) {
  const receitas = readJSON("receitas", []);
  const rec = findByField(receitas, "name", a.receitaNome);
  if (!rec) return { ok: false, message: "Não encontrei a receita '" + a.receitaNome + "'." };
  const patch = {};
  if (a.nome) patch.name = a.nome;
  if (a.desc != null) patch.desc = a.desc;
  if (!Object.keys(patch).length) return { ok: false, message: "Nenhum campo pra atualizar." };
  writeJSON("receitas", receitas.map(r => r.id === rec.id ? { ...r, ...patch } : r));
  notifyGeburahUpdated();
  return { ok: true, message: "Receita '" + rec.name + "' atualizada." };
}
export function deleteGeburahRecipe(a) {
  const receitas = readJSON("receitas", []);
  const rec = findByField(receitas, "name", a.receitaNome);
  if (!rec) return { ok: false, message: "Não encontrei a receita '" + a.receitaNome + "'." };
  writeJSON("receitas", receitas.filter(r => r.id !== rec.id));
  notifyGeburahUpdated();
  return { ok: true, message: "Receita '" + rec.name + "' excluída." };
}
export function addGeburahRecipeIngredient(a) {
  const receitas = readJSON("receitas", []);
  const rec = findByField(receitas, "name", a.receitaNome);
  if (!rec) return { ok: false, message: "Não encontrei a receita '" + a.receitaNome + "'." };
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  let qtd = Number(a.qtd);
  if (!qtd && a.porcoes && al.porcao?.gramas) qtd = Number(a.porcoes) * al.porcao.gramas;
  if (!qtd || qtd <= 0) qtd = al.porcao?.gramas || 100;
  const ing = { alimentoId: al.id, qtd };
  writeJSON("receitas", receitas.map(r => r.id === rec.id ? { ...r, ingredientes: [...r.ingredientes, ing] } : r));
  notifyGeburahUpdated();
  return { ok: true, message: al.name + " (" + qtd + "g) adicionado à receita '" + rec.name + "'." };
}
export function removeGeburahRecipeIngredient(a) {
  const receitas = readJSON("receitas", []);
  const rec = findByField(receitas, "name", a.receitaNome);
  if (!rec) return { ok: false, message: "Não encontrei a receita '" + a.receitaNome + "'." };
  const alimentos = readJSON("alimentos", []);
  const al = findByField(alimentos, "name", a.alimentoNome);
  if (!al) return { ok: false, message: "Não encontrei o alimento '" + a.alimentoNome + "'." };
  const idx = rec.ingredientes.findIndex(ing => ing.alimentoId === al.id);
  if (idx === -1) return { ok: false, message: al.name + " não está na receita '" + rec.name + "'." };
  const novosIngredientes = rec.ingredientes.filter((_, i) => i !== idx);
  writeJSON("receitas", receitas.map(r => r.id === rec.id ? { ...r, ingredientes: novosIngredientes } : r));
  notifyGeburahUpdated();
  return { ok: true, message: al.name + " removido da receita '" + rec.name + "'." };
}
// Registra TODOS os ingredientes da receita como itens separados no diário — mesmo
// resultado do botão "Adicionar à refeição" na tela de detalhe da receita.
export function registerGeburahRecipe(a) {
  const receitas = readJSON("receitas", []);
  const rec = findByField(receitas, "name", a.receitaNome);
  if (!rec) return { ok: false, message: "Não encontrei a receita '" + a.receitaNome + "'." };
  if (!rec.ingredientes.length) return { ok: false, message: "A receita '" + rec.name + "' ainda não tem ingredientes." };
  const logDieta = readJSON("logDieta", []);
  const data = a.data || todayS();
  const refeicao = a.refeicao || refeicaoPorHorarioNow();
  const novos = rec.ingredientes.map(ing => ({
    id: "ld" + uid(), data, refeicao, alimentoId: ing.alimentoId, qtd: ing.qtd,
    ...(ing.qtdDisplay != null ? { qtdDisplay: ing.qtdDisplay, unidadeDisplay: ing.unidadeDisplay } : {}),
  }));
  writeJSON("logDieta", [...logDieta, ...novos]);
  notifyGeburahUpdated();
  return { ok: true, message: "Receita '" + rec.name + "' (" + novos.length + " ingredientes) registrada em " + refeicao + "." };
}

// ── ROTINA DE TREINO / EXERCÍCIO ─────────────────────────────────────────────
export function createGeburahRoutine(a) {
  if (!a.nome) return { ok: false, message: "Nome da rotina não informado." };
  const rotinasTreino = readJSON("rotinasTreino", []);
  const dias = Array.isArray(a.dias) && a.dias.length ? a.dias : (a.dia ? [a.dia] : ["Segunda"]);
  const grupos = Array.isArray(a.grupos) ? a.grupos : [];
  const novo = { id: "rt" + uid(), name: a.nome, dias, grupos, meta: Number(a.meta) || 8, exercicios: [] };
  writeJSON("rotinasTreino", [...rotinasTreino, novo]);
  notifyGeburahUpdated();
  return { ok: true, message: "Rotina '" + novo.name + "' criada — use add_routine_exercise pra montar os exercícios." };
}
export function editGeburahRoutine(a) {
  const rotinasTreino = readJSON("rotinasTreino", []);
  const rot = findByField(rotinasTreino, "name", a.rotinaNome);
  if (!rot) return { ok: false, message: "Não encontrei a rotina '" + a.rotinaNome + "'." };
  const patch = {};
  if (a.nome) patch.name = a.nome;
  if (a.meta != null) patch.meta = Number(a.meta);
  if (!Object.keys(patch).length) return { ok: false, message: "Nenhum campo pra atualizar." };
  writeJSON("rotinasTreino", rotinasTreino.map(r => r.id === rot.id ? { ...r, ...patch } : r));
  notifyGeburahUpdated();
  return { ok: true, message: "Rotina '" + rot.name + "' atualizada." };
}
export function deleteGeburahRoutine(a) {
  const rotinasTreino = readJSON("rotinasTreino", []);
  const rot = findByField(rotinasTreino, "name", a.rotinaNome);
  if (!rot) return { ok: false, message: "Não encontrei a rotina '" + a.rotinaNome + "'." };
  writeJSON("rotinasTreino", rotinasTreino.filter(r => r.id !== rot.id));
  notifyGeburahUpdated();
  return { ok: true, message: "Rotina '" + rot.name + "' excluída." };
}
export function addGeburahRoutineExercise(a) {
  const rotinasTreino = readJSON("rotinasTreino", []);
  const rot = findByField(rotinasTreino, "name", a.rotinaNome);
  if (!rot) return { ok: false, message: "Não encontrei a rotina '" + a.rotinaNome + "'." };
  const exercicios = readJSON("exercicios", []);
  const ex = findByField(exercicios, "name", a.exercicioNome);
  if (!ex) return { ok: false, message: "Não encontrei o exercício '" + a.exercicioNome + "'." };
  const novo = {
    id: "re" + uid(), exercicioId: ex.id,
    series: Number(a.series) || 3, reps: a.reps || "10-12",
    carga: Number(a.carga) || 0, descanso: Number(a.descanso) || 60,
  };
  writeJSON("rotinasTreino", rotinasTreino.map(r => r.id === rot.id ? { ...r, exercicios: [...r.exercicios, novo] } : r));
  notifyGeburahUpdated();
  return { ok: true, message: ex.name + " adicionado à rotina '" + rot.name + "'." };
}
export function removeGeburahRoutineExercise(a) {
  const rotinasTreino = readJSON("rotinasTreino", []);
  const rot = findByField(rotinasTreino, "name", a.rotinaNome);
  if (!rot) return { ok: false, message: "Não encontrei a rotina '" + a.rotinaNome + "'." };
  const exercicios = readJSON("exercicios", []);
  const ex = findByField(exercicios, "name", a.exercicioNome);
  if (!ex) return { ok: false, message: "Não encontrei o exercício '" + a.exercicioNome + "'." };
  const novosExercicios = rot.exercicios.filter(re => re.exercicioId !== ex.id);
  if (novosExercicios.length === rot.exercicios.length) return { ok: false, message: ex.name + " não está na rotina '" + rot.name + "'." };
  writeJSON("rotinasTreino", rotinasTreino.map(r => r.id === rot.id ? { ...r, exercicios: novosExercicios } : r));
  notifyGeburahUpdated();
  return { ok: true, message: ex.name + " removido da rotina '" + rot.name + "'." };
}
export function createGeburahExercise(a) {
  if (!a.nome) return { ok: false, message: "Nome do exercício não informado." };
  const exercicios = readJSON("exercicios", []);
  const grupo = GRUPOS.includes(a.grupo) ? a.grupo : GRUPOS[0];
  const novo = { id: "e" + uid(), name: a.nome, grupo, equip: a.equip || "", inst: a.inst || "" };
  writeJSON("exercicios", [...exercicios, novo]);
  notifyGeburahUpdated();
  return { ok: true, message: "Exercício '" + novo.name + "' criado em " + grupo + "." };
}

export const GEBURAH_ACTION_HANDLERS = {
  register_weight: registerGeburahWeight,
  register_meal: registerGeburahMeal,
  delete_meal_item: deleteGeburahMealItem,
  register_water: registerGeburahWater,
  adjust_water_goal: adjustGeburahWaterGoal,
  register_measurement: registerGeburahMeasurement,
  start_workout: startGeburahWorkout,
  finish_workout: finishGeburahWorkout,
  adjust_nutrition_goal: adjustGeburahGoals,
  create_food: createGeburahFood,
  edit_food: editGeburahFood,
  delete_food: deleteGeburahFood,
  set_favorite_food: setGeburahFoodFavorite,
  create_recipe: createGeburahRecipe,
  edit_recipe: editGeburahRecipe,
  delete_recipe: deleteGeburahRecipe,
  add_recipe_ingredient: addGeburahRecipeIngredient,
  remove_recipe_ingredient: removeGeburahRecipeIngredient,
  register_recipe: registerGeburahRecipe,
  create_routine: createGeburahRoutine,
  edit_routine: editGeburahRoutine,
  delete_routine: deleteGeburahRoutine,
  add_routine_exercise: addGeburahRoutineExercise,
  remove_routine_exercise: removeGeburahRoutineExercise,
  create_exercise: createGeburahExercise,
};
