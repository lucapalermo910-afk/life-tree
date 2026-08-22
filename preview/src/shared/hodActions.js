// Ações que o Coach global executa sobre os dados do Hod (Carreira/Profissional).
//
// Mesmo padrão de yesodActions.js/geburahActions.js: o estado do Hod vive em
// HodModule.jsx (useState + localStorage, chave "lifetree_hod_*"), não em App.jsx, então
// essas funções leem/escrevem localStorage direto e avisam o módulo via
// notifyCoachDataUpdated("hod") — se o módulo estiver montado, ele relê do storage.
//
// Resolve o maior gap apontado na auditoria de 09/08/2026 (ver [[08 Hod]] → "Auditoria
// pós-implementação"): o Coach só falava sobre plano de aula/material/trilha/projeto, cada
// item precisava ser digitado à mão depois. add_plan_item e add_client_plan_item aceitam
// "topics" (array) além de "topic" (string única) justamente pra isso — o Coach pode
// rascunhar um roteiro inteiro (currículo de aula, roadmap técnico, calendário editorial)
// numa ação só, sempre como proposta editável, nunca escrito direto sem confirmação.

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_hod_";
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
function notifyHodUpdated() {
  notifyCoachDataUpdated("hod");
}

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");
function normalize(s) {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(DIACRITICS_RE, "").trim();
}
// Mesmo mecanismo de match usado em geburahActions.js (normalização + confiança
// crescente: exato → prefixo → substring → todas as palavras) — resolve o mesmo tipo de
// gap de "match por substring simples falha fácil" que foi corrigido lá, aplicado aqui
// desde o início por consistência (trilha/projeto/cliente também são buscados por nome).
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

const TRACK_PALETTE = ["#06b6d4","#ec4899","#8b5cf6","#f97316","#f59e0b","#10b981","#ef4444","#3b82f6","#14b8a6","#6366f1","#84cc16","#f472b6"];
const PHASES_BY_TYPE = {
  negocio:  ["exploracao","validacao","estruturacao","escala"],
  produto:  ["concepcao","mvp","beta","lancamento","iteracao"],
  conteudo: ["ideacao","piloto","consistencia","crescimento"],
  servico:  ["concepcao","oferta","piloto","operacao","escala"],
  outro:    ["planejamento","execucao","revisao"],
};
const phasesFor = t => PHASES_BY_TYPE[t] || PHASES_BY_TYPE.outro;

// ── TRILHAS DE COMPETÊNCIA ───────────────────────────────────────────────────
export function createHodTrack(a) {
  const tracks = readJSON("tracks", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome da trilha vazio." };
  const focus = ["atual", "explorando", "arquivada"].includes(a.focus) ? a.focus : "atual";
  writeJSON("tracks", [...tracks, { id: "tr" + uid(), name, color: TRACK_PALETTE[tracks.length % TRACK_PALETTE.length], focus, skills: [] }]);
  notifyHodUpdated();
  return { ok: true, message: "Trilha '" + name + "' criada." };
}
export function editHodTrack(a) {
  const tracks = readJSON("tracks", []);
  const found = findByField(tracks, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei trilha com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (["atual", "explorando", "arquivada"].includes(changes.focus)) patch.focus = changes.focus;
  writeJSON("tracks", tracks.map(t => t.id === found.id ? { ...t, ...patch } : t));
  notifyHodUpdated();
  return { ok: true, message: "Trilha '" + found.name + "' atualizada." };
}
export function deleteHodTrack(a) {
  const tracks = readJSON("tracks", []);
  const found = findByField(tracks, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei trilha com '" + a.match + "'." };
  writeJSON("tracks", tracks.filter(t => t.id !== found.id));
  notifyHodUpdated();
  return { ok: true, message: "Trilha '" + found.name + "' removida." };
}
// Registrar uma skill (ou atualizar nível de uma já existente) marca lastPracticed=hoje —
// fecha o gap "sem última prática" (ver [[08 Hod]]): toda vez que o nível muda, é porque
// o usuário praticou/evoluiu, então é o sinal natural de "praticado agora".
export function createHodSkill(a) {
  const tracks = readJSON("tracks", []);
  const track = findByField(tracks, "name", a.track);
  if (!track) return { ok: false, message: "Não encontrei trilha com '" + a.track + "'." };
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome da habilidade vazio." };
  const skill = { id: "sk" + uid(), name, level: Math.min(5, Math.max(1, Number(a.level) || 1)), target: Math.min(5, Math.max(1, Number(a.target) || 5)), notes: a.notes || "", lastPracticed: todayS() };
  writeJSON("tracks", tracks.map(t => t.id === track.id ? { ...t, skills: [...t.skills, skill] } : t));
  notifyHodUpdated();
  return { ok: true, message: "Habilidade '" + name + "' adicionada à trilha '" + track.name + "'." };
}
export function editHodSkill(a) {
  const tracks = readJSON("tracks", []);
  const track = findByField(tracks, "name", a.track);
  if (!track) return { ok: false, message: "Não encontrei trilha com '" + a.track + "'." };
  const skill = findByField(track.skills, "name", a.skill);
  if (!skill) return { ok: false, message: "Não encontrei habilidade com '" + a.skill + "' em '" + track.name + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (changes.notes != null) patch.notes = changes.notes;
  if (changes.level != null) { patch.level = Math.min(5, Math.max(1, Number(changes.level))); patch.lastPracticed = todayS(); }
  if (changes.target != null) patch.target = Math.min(5, Math.max(1, Number(changes.target)));
  writeJSON("tracks", tracks.map(t => t.id === track.id ? { ...t, skills: t.skills.map(s => s.id === skill.id ? { ...s, ...patch } : s) } : t));
  notifyHodUpdated();
  return { ok: true, message: "Habilidade '" + skill.name + "' atualizada." };
}
export function deleteHodSkill(a) {
  const tracks = readJSON("tracks", []);
  const track = findByField(tracks, "name", a.track);
  if (!track) return { ok: false, message: "Não encontrei trilha com '" + a.track + "'." };
  const skill = findByField(track.skills, "name", a.skill);
  if (!skill) return { ok: false, message: "Não encontrei habilidade com '" + a.skill + "'." };
  writeJSON("tracks", tracks.map(t => t.id === track.id ? { ...t, skills: t.skills.filter(s => s.id !== skill.id) } : t));
  notifyHodUpdated();
  return { ok: true, message: "Habilidade '" + skill.name + "' removida." };
}

// ── PROJETOS ─────────────────────────────────────────────────────────────────
export function createHodProject(a) {
  const projects = readJSON("projects", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do projeto vazio." };
  const type = Object.keys(PHASES_BY_TYPE).includes(a.type) ? a.type : "negocio";
  writeJSON("projects", [...projects, {
    id: "pj" + uid(), name, type, phase: phasesFor(type)[0],
    canvas: a.canvas || {}, plan: [], experiments: [], learnings: [],
    price: 0, goal: 0, revenueHistory: [], clients: [], nextStep: "", habits: [],
  }]);
  notifyHodUpdated();
  return { ok: true, message: "Projeto '" + name + "' criado (tipo " + type + ")." };
}
export function editHodProject(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (changes.canvas) patch.canvas = { ...(found.canvas || {}), ...changes.canvas };
  if (changes.price != null) patch.price = Number(changes.price) || 0;
  if (changes.goal != null) patch.goal = Number(changes.goal) || 0;
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, ...patch } : p));
  notifyHodUpdated();
  return { ok: true, message: "Projeto '" + found.name + "' atualizado." };
}
export function setHodProjectPhase(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const phases = phasesFor(found.type);
  const phase = findByField(phases.map(id => ({ id, name: id })), "name", a.phase)?.id;
  if (!phase) return { ok: false, message: "Fase '" + a.phase + "' não existe pro tipo '" + found.type + "'. Fases válidas: " + phases.join(", ") + "." };
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, phase } : p));
  notifyHodUpdated();
  return { ok: true, message: "Projeto '" + found.name + "' avançou pra fase '" + phase + "'." };
}
export function setHodNextStep(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, nextStep: a.nextStep || "" } : p));
  notifyHodUpdated();
  return { ok: true, message: "Próximo passo de '" + found.name + "' atualizado." };
}
// a.topics (array) ou a.topic (string única) — permite o Coach rascunhar um roteiro
// inteiro (currículo de aula, roadmap técnico, calendário editorial) numa ação só.
export function addHodPlanItem(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const topics = Array.isArray(a.topics) ? a.topics : (a.topic ? [a.topic] : []);
  if (!topics.length) return { ok: false, message: "Nenhum item de plano informado." };
  const items = topics.filter(Boolean).map(topic => ({ id: "pl" + uid(), topic, status: "pendente" }));
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, plan: [...(p.plan || []), ...items] } : p));
  notifyHodUpdated();
  return { ok: true, message: items.length + " item(ns) adicionado(s) ao plano de '" + found.name + "'." };
}
export function addHodExperiment(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título do experimento vazio." };
  const exp = { id: "e" + uid(), title, status: "nao_iniciado", prazo: a.prazo || todayS() };
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, experiments: [...(p.experiments || []), exp] } : p));
  notifyHodUpdated();
  return { ok: true, message: "Experimento '" + title + "' adicionado a '" + found.name + "'." };
}
export function addHodLearning(a) {
  const projects = readJSON("projects", []);
  const found = findByField(projects, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const text = (a.text || "").trim();
  if (!text) return { ok: false, message: "Texto do aprendizado vazio." };
  const learning = { id: "l" + uid(), date: a.date || todayS(), text, positive: a.positive !== false };
  writeJSON("projects", projects.map(p => p.id === found.id ? { ...p, learnings: [...(p.learnings || []), learning] } : p));
  notifyHodUpdated();
  return { ok: true, message: "Aprendizado registrado em '" + found.name + "'." };
}

// ── CLIENTES (dentro de um projeto) ──────────────────────────────────────────
export function createHodClient(a) {
  const projects = readJSON("projects", []);
  const proj = findByField(projects, "name", a.match);
  if (!proj) return { ok: false, message: "Não encontrei projeto com '" + a.match + "'." };
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do cliente/aluno vazio." };
  const client = { id: "cl" + uid(), name, contact: a.contact || "", freq: a.freq || "", since: a.since || todayS(), active: true, goal: a.goal || "", progressNote: "", plan: [], sessions: [], lastFeedback: null };
  writeJSON("projects", projects.map(p => p.id === proj.id ? { ...p, clients: [...(p.clients || []), client] } : p));
  notifyHodUpdated();
  return { ok: true, message: "'" + name + "' adicionado(a) como cliente/aluno de '" + proj.name + "'." };
}
function findProjectAndClient(projects, projMatch, clientMatch) {
  const proj = findByField(projects, "name", projMatch);
  if (!proj) return { error: "Não encontrei projeto com '" + projMatch + "'." };
  const client = findByField(proj.clients || [], "name", clientMatch);
  if (!client) return { error: "Não encontrei cliente/aluno com '" + clientMatch + "' em '" + proj.name + "'." };
  return { proj, client };
}
export function addHodClientPlanItem(a) {
  const projects = readJSON("projects", []);
  const { proj, client, error } = findProjectAndClient(projects, a.match, a.client);
  if (error) return { ok: false, message: error };
  const topics = Array.isArray(a.topics) ? a.topics : (a.topic ? [a.topic] : []);
  if (!topics.length) return { ok: false, message: "Nenhum item de plano informado." };
  const items = topics.filter(Boolean).map(topic => ({ id: "pl" + uid(), topic, status: "pendente" }));
  writeJSON("projects", projects.map(p => p.id === proj.id ? { ...p, clients: p.clients.map(c => c.id === client.id ? { ...c, plan: [...(c.plan || []), ...items] } : c) } : p));
  notifyHodUpdated();
  return { ok: true, message: items.length + " item(ns) adicionado(s) ao plano de '" + client.name + "'." };
}
export function addHodClientSession(a) {
  const projects = readJSON("projects", []);
  const { proj, client, error } = findProjectAndClient(projects, a.match, a.client);
  if (error) return { ok: false, message: error };
  const session = { id: "cs" + uid(), date: a.date || todayS(), notes: a.notes || "", nextStep: a.nextStep || "" };
  writeJSON("projects", projects.map(p => p.id === proj.id ? { ...p, clients: p.clients.map(c => c.id === client.id ? { ...c, sessions: [...(c.sessions || []), session] } : c) } : p));
  notifyHodUpdated();
  return { ok: true, message: "Sessão registrada com '" + client.name + "'." };
}
export function updateHodClientFeedback(a) {
  const projects = readJSON("projects", []);
  const { proj, client, error } = findProjectAndClient(projects, a.match, a.client);
  if (error) return { ok: false, message: error };
  const text = (a.text || "").trim();
  if (!text) return { ok: false, message: "Texto do feedback vazio." };
  const feedback = { date: a.date || todayS(), text };
  writeJSON("projects", projects.map(p => p.id === proj.id ? { ...p, clients: p.clients.map(c => c.id === client.id ? { ...c, lastFeedback: feedback } : c) } : p));
  notifyHodUpdated();
  return { ok: true, message: "Feedback de '" + client.name + "' atualizado." };
}

// ── CARREIRA (metas e hábitos) ───────────────────────────────────────────────
export function createHodCarGoal(a) {
  const carGoals = readJSON("carGoals", []);
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  writeJSON("carGoals", [...carGoals, { id: "cg" + uid(), title, prazo: a.prazo || todayS(), xp: Number(a.xp) || 100, done: false }]);
  notifyHodUpdated();
  return { ok: true, message: "Objetivo de carreira '" + title + "' criado." };
}
export function toggleHodCarGoal(a) {
  const carGoals = readJSON("carGoals", []);
  const found = findByField(carGoals, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei objetivo com '" + a.match + "'." };
  writeJSON("carGoals", carGoals.map(g => g.id === found.id ? { ...g, done: !g.done } : g));
  notifyHodUpdated();
  return { ok: true, message: "Objetivo '" + found.title + "' marcado como " + (!found.done ? "concluído" : "pendente") + "." };
}
export function createHodCarHabit(a) {
  const carHabits = readJSON("carHabits", []);
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  writeJSON("carHabits", [...carHabits, { id: "ch" + uid(), title, freq: a.freq || "Diário", xp: Number(a.xp) || 10, done: false }]);
  notifyHodUpdated();
  return { ok: true, message: "Hábito de carreira '" + title + "' criado." };
}
export function toggleHodCarHabit(a) {
  const carHabits = readJSON("carHabits", []);
  const found = findByField(carHabits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  writeJSON("carHabits", carHabits.map(h => h.id === found.id ? { ...h, done: !h.done } : h));
  notifyHodUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (!found.done ? "feito" : "pendente") + "." };
}

// ── CONQUISTAS ────────────────────────────────────────────────────────────────
// a.track (opcional) — liga a conquista a uma trilha (fecha o gap "conquistas não linkam
// com trilhas", ver [[08 Hod]]); usado tipicamente quando uma trilha bate 100%.
export function createHodAchievement(a) {
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const achievements = readJSON("achievements", []);
  let trackId = null, trackName = null;
  if (a.track) {
    const tracks = readJSON("tracks", []);
    const track = findByField(tracks, "name", a.track);
    if (track) { trackId = track.id; trackName = track.name; }
  }
  writeJSON("achievements", [...achievements, { id: "ach" + uid(), title, date: a.date || todayS(), impact: a.impact || "Alto", ...(trackId ? { trackId } : {}) }]);
  notifyHodUpdated();
  return { ok: true, message: "Conquista '" + title + "' registrada" + (trackName ? " (trilha: " + trackName + ")" : "") + "." };
}

// ── MARCA PESSOAL (cobertura leve) ───────────────────────────────────────────
export function createHodBrandHabit(a) {
  const brand = readJSON("brand", { pillars: [], channels: [], contentPlan: [], habits: [] });
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  writeJSON("brand", { ...brand, habits: [...(brand.habits || []), { id: "bh" + uid(), title, freq: a.freq || "Semanal", xp: Number(a.xp) || 15, done: false }] });
  notifyHodUpdated();
  return { ok: true, message: "Hábito de marca '" + title + "' criado." };
}
export function toggleHodBrandHabit(a) {
  const brand = readJSON("brand", { pillars: [], channels: [], contentPlan: [], habits: [] });
  const found = findByField(brand.habits || [], "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  writeJSON("brand", { ...brand, habits: brand.habits.map(h => h.id === found.id ? { ...h, done: !h.done } : h) });
  notifyHodUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (!found.done ? "feito" : "pendente") + "." };
}
// a.ideas (array) ou a.title (string única) — mesmo racional do add_plan_item: Coach
// pode propor um calendário editorial inteiro numa ação só.
export function addHodContentIdea(a) {
  const brand = readJSON("brand", { pillars: [], channels: [], contentPlan: [], habits: [] });
  const titles = Array.isArray(a.ideas) ? a.ideas : (a.title ? [a.title] : []);
  if (!titles.length) return { ok: false, message: "Nenhuma ideia de conteúdo informada." };
  const items = titles.filter(Boolean).map(title => ({ id: "cp" + uid(), title, format: a.format || "Texto/Post", channel: a.channel || "LinkedIn", status: "ideia", prazo: a.prazo || todayS() }));
  writeJSON("brand", { ...brand, contentPlan: [...(brand.contentPlan || []), ...items] });
  notifyHodUpdated();
  return { ok: true, message: items.length + " ideia(s) de conteúdo adicionada(s)." };
}

export const HOD_ACTION_HANDLERS = {
  create_track: createHodTrack,
  edit_track: editHodTrack,
  delete_track: deleteHodTrack,
  create_skill: createHodSkill,
  edit_skill: editHodSkill,
  delete_skill: deleteHodSkill,
  create_project: createHodProject,
  edit_project: editHodProject,
  set_project_phase: setHodProjectPhase,
  set_next_step: setHodNextStep,
  add_plan_item: addHodPlanItem,
  add_experiment: addHodExperiment,
  add_learning: addHodLearning,
  create_client: createHodClient,
  add_client_plan_item: addHodClientPlanItem,
  add_client_session: addHodClientSession,
  update_client_feedback: updateHodClientFeedback,
  create_car_goal: createHodCarGoal,
  toggle_car_goal: toggleHodCarGoal,
  create_car_habit: createHodCarHabit,
  toggle_car_habit: toggleHodCarHabit,
  create_achievement: createHodAchievement,
  create_brand_habit: createHodBrandHabit,
  toggle_brand_habit: toggleHodBrandHabit,
  add_content_idea: addHodContentIdea,
};
