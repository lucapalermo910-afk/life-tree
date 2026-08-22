// Ações que o Coach global executa sobre os dados do Netzach (Qualidade de Vida).
//
// Mesmo padrão de yesodActions.js/geburahActions.js/hodActions.js/tipharethActions.js/
// chesedActions.js: o estado do Netzach vive em NetzachModule.jsx (useState + localStorage,
// chave "lifetree_netz_*"), não em App.jsx, então essas funções leem/escrevem localStorage
// direto e avisam o módulo via notifyCoachDataUpdated("netzach") — se o módulo estiver
// montado, ele relê do storage.

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_netz_";
const uid = () => Math.random().toString(36).slice(2, 8);
const todayS = () => new Date().toISOString().slice(0, 10);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PFX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(PFX + key, JSON.stringify(val));
  } catch {}
}
function notifyNetzUpdated() {
  notifyCoachDataUpdated("netzach");
}

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");
function normalize(s) {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(DIACRITICS_RE, "").trim();
}
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

const HOBBY_PALETTE = ["#84cc16", "#8b5cf6", "#f97316", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6", "#6366f1", "#ec4899", "#f472b6"];

// ── HOBBIES ───────────────────────────────────────────────────────────────────
export function createNetzHobby(a) {
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome vazio." };
  const hobbies = readJSON("hobbies", []);
  writeJSON("hobbies", [...hobbies, {
    id: "h" + uid(), name, cat: a.cat || "Outro", freq: a.freq || "Semanal",
    color: HOBBY_PALETTE[hobbies.length % HOBBY_PALETTE.length], note: a.note || "", lastDone: "",
  }]);
  notifyNetzUpdated();
  return { ok: true, message: "Hobby '" + name + "' adicionado." };
}
export function logNetzHobbyDone(a) {
  const hobbies = readJSON("hobbies", []);
  const found = findByField(hobbies, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei hobby com '" + a.match + "'." };
  writeJSON("hobbies", hobbies.map(h => h.id === found.id ? { ...h, lastDone: a.date || todayS() } : h));
  const xp = readJSON("xp", 0);
  writeJSON("xp", xp + 25);
  notifyNetzUpdated();
  return { ok: true, message: "'" + found.name + "' marcado como feito hoje." };
}

// ── HÁBITOS (lazer ou lar) ────────────────────────────────────────────────────
export function createNetzHabit(a) {
  const area = a.area === "lar" ? "lar" : "lazer";
  const key = area === "lar" ? "larHabits" : "lazerHabits";
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const habits = readJSON(key, []);
  writeJSON(key, [...habits, { id: (area === "lar" ? "lrh" : "lh") + uid(), title, freq: a.freq || "Diário", xp: Number(a.xp) || (area === "lar" ? 10 : 20), done: false }]);
  notifyNetzUpdated();
  return { ok: true, message: "Hábito de " + area + " '" + title + "' criado." };
}
export function toggleNetzHabit(a) {
  const area = a.area === "lar" ? "lar" : "lazer";
  const key = area === "lar" ? "larHabits" : "lazerHabits";
  const habits = readJSON(key, []);
  const found = findByField(habits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito de " + area + " com '" + a.match + "'." };
  const nextDone = !found.done;
  writeJSON(key, habits.map(h => h.id === found.id ? { ...h, done: nextDone } : h));
  if (nextDone) {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + found.xp);
  }
  notifyNetzUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (nextDone ? "feito" : "pendente") + "." };
}

// ── TAREFAS DO LAR ─────────────────────────────────────────────────────────────
export function createNetzTarefa(a) {
  const nome = (a.nome || "").trim();
  if (!nome) return { ok: false, message: "Nome vazio." };
  const tarefas = readJSON("tarefas", []);
  writeJSON("tarefas", [...tarefas, { id: "t" + uid(), nome, cat: a.cat || "Outro", freq: a.freq || "Semanal", lastDone: "", urgente: !!a.urgente }]);
  notifyNetzUpdated();
  return { ok: true, message: "Tarefa '" + nome + "' adicionada." };
}
export function logNetzTarefaDone(a) {
  const tarefas = readJSON("tarefas", []);
  const found = findByField(tarefas, "nome", a.match);
  if (!found) return { ok: false, message: "Não encontrei tarefa com '" + a.match + "'." };
  writeJSON("tarefas", tarefas.map(t => t.id === found.id ? { ...t, lastDone: a.date || todayS(), urgente: false } : t));
  const xp = readJSON("xp", 0);
  writeJSON("xp", xp + 20);
  notifyNetzUpdated();
  return { ok: true, message: "Tarefa '" + found.nome + "' marcada como feita." };
}

// ── EXPERIÊNCIAS (bucket list) ────────────────────────────────────────────────
const EXP_STATUS_VALUES = ["sonho", "planejando", "agendado", "feito"];
export function createNetzExperiencia(a) {
  const titulo = (a.titulo || "").trim();
  if (!titulo) return { ok: false, message: "Título vazio." };
  const experiencias = readJSON("experiencias", []);
  writeJSON("experiencias", [...experiencias, {
    id: "ex" + uid(), titulo, cat: a.cat || "Outro",
    status: EXP_STATUS_VALUES.includes(a.status) ? a.status : "sonho",
    prazo: a.prazo || "", nota: a.nota || "", emoji: a.emoji || "✨",
  }]);
  notifyNetzUpdated();
  return { ok: true, message: "Experiência '" + titulo + "' adicionada." };
}
export function advanceNetzExperiencia(a) {
  const experiencias = readJSON("experiencias", []);
  const found = findByField(experiencias, "titulo", a.match);
  if (!found) return { ok: false, message: "Não encontrei experiência com '" + a.match + "'." };
  const idx = EXP_STATUS_VALUES.indexOf(found.status);
  const next = EXP_STATUS_VALUES[Math.min(idx + 1, EXP_STATUS_VALUES.length - 1)];
  writeJSON("experiencias", experiencias.map(e => e.id === found.id ? { ...e, status: next } : e));
  if (next === "feito" && found.status !== "feito") {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + 100);
  }
  notifyNetzUpdated();
  return { ok: true, message: "'" + found.titulo + "' avançou para '" + next + "'." };
}

export const NETZACH_ACTION_HANDLERS = {
  create_hobby: createNetzHobby,
  log_hobby_done: logNetzHobbyDone,
  create_habit: createNetzHabit,
  toggle_habit: toggleNetzHabit,
  create_tarefa: createNetzTarefa,
  log_tarefa_done: logNetzTarefaDone,
  create_experiencia: createNetzExperiencia,
  advance_experiencia: advanceNetzExperiencia,
};
