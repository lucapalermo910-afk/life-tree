// Ações que o Coach global executa sobre os dados do Tiphareth (Autocuidado).
//
// Mesmo padrão de yesodActions.js/geburahActions.js/hodActions.js: o estado do Tiphareth
// vive em TipharethModule.jsx (useState + localStorage, chave "lifetree_tiph_*"), não em
// App.jsx, então essas funções leem/escrevem localStorage direto e avisam o módulo via
// notifyCoachDataUpdated("tiphareth") — se o módulo estiver montado, ele relê do storage.

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_tiph_";
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
function notifyTiphUpdated() {
  notifyCoachDataUpdated("tiphareth");
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

const MOOD_VALUES = ["energizado", "calmo", "cansado", "ansioso", "feliz"];

// ── HÁBITOS (aparência ou bem-estar) ─────────────────────────────────────────
export function createTiphHabit(a) {
  const area = a.area === "aparencia" ? "aparencia" : "bemestar";
  const key = area === "aparencia" ? "aparenciaHabits" : "bemestarHabits";
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const habits = readJSON(key, []);
  writeJSON(key, [...habits, { id: (area === "aparencia" ? "ah" : "bh") + uid(), title, freq: a.freq || "Diário", xp: Number(a.xp) || 15, done: false, area }]);
  notifyTiphUpdated();
  return { ok: true, message: "Hábito de " + area + " '" + title + "' criado." };
}
export function toggleTiphHabit(a) {
  const area = a.area === "aparencia" ? "aparencia" : "bemestar";
  const key = area === "aparencia" ? "aparenciaHabits" : "bemestarHabits";
  const habits = readJSON(key, []);
  const found = findByField(habits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito de " + area + " com '" + a.match + "'." };
  const nextDone = !found.done;
  writeJSON(key, habits.map(h => h.id === found.id ? { ...h, done: nextDone } : h));
  if (nextDone) {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + found.xp);
  }
  notifyTiphUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (nextDone ? "feito" : "pendente") + "." };
}

// ── METAS ─────────────────────────────────────────────────────────────────────
export function createTiphGoal(a) {
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const goals = readJSON("goals", []);
  writeJSON("goals", [...goals, { id: "g" + uid(), title, area: a.area === "aparencia" ? "aparencia" : "bemestar", xp: Number(a.xp) || 100, done: false }]);
  notifyTiphUpdated();
  return { ok: true, message: "Meta '" + title + "' criada." };
}
export function toggleTiphGoal(a) {
  const goals = readJSON("goals", []);
  const found = findByField(goals, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei meta com '" + a.match + "'." };
  const nextDone = !found.done;
  writeJSON("goals", goals.map(g => g.id === found.id ? { ...g, done: nextDone } : g));
  if (nextDone) {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + found.xp);
  }
  notifyTiphUpdated();
  return { ok: true, message: "Meta '" + found.title + "' marcada como " + (nextDone ? "concluída" : "pendente") + "." };
}

// ── PRODUTOS ──────────────────────────────────────────────────────────────────
export function createTiphProduct(a) {
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do produto vazio." };
  const produtos = readJSON("produtos", []);
  writeJSON("produtos", [...produtos, { id: "p" + uid(), name, category: a.category || "Outro", freq: a.freq || "", notes: a.notes || "" }]);
  notifyTiphUpdated();
  return { ok: true, message: "Produto '" + name + "' adicionado." };
}

// ── ROTINAS ───────────────────────────────────────────────────────────────────
export function addTiphRoutineStep(a) {
  const rotinas = readJSON("rotinas", []);
  const routine = findByField(rotinas, "name", a.routine);
  if (!routine) return { ok: false, message: "Não encontrei rotina com '" + a.routine + "'." };
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Descrição do passo vazia." };
  const step = { id: "rs" + uid(), title, done: false, min: Number(a.min) || 2 };
  writeJSON("rotinas", rotinas.map(r => r.id === routine.id ? { ...r, steps: [...r.steps, step] } : r));
  notifyTiphUpdated();
  return { ok: true, message: "Passo '" + title + "' adicionado a '" + routine.name + "'." };
}
export function toggleTiphRoutineStep(a) {
  const rotinas = readJSON("rotinas", []);
  const routine = findByField(rotinas, "name", a.routine);
  if (!routine) return { ok: false, message: "Não encontrei rotina com '" + a.routine + "'." };
  const step = findByField(routine.steps, "title", a.step);
  if (!step) return { ok: false, message: "Não encontrei passo com '" + a.step + "' em '" + routine.name + "'." };
  writeJSON("rotinas", rotinas.map(r => r.id === routine.id ? { ...r, steps: r.steps.map(s => s.id === step.id ? { ...s, done: !s.done } : s) } : r));
  notifyTiphUpdated();
  return { ok: true, message: "Passo '" + step.title + "' marcado como " + (!step.done ? "feito" : "pendente") + "." };
}

// ── HUMOR (widget rápido + diário direcionado) ───────────────────────────────
// Mesmo comportamento do seletor de humor na UI: registra o humor rápido e faz upsert da
// entrada de hoje no diário (moodLog), com prompts opcionais (influencia/gratidao) —
// resolve o gap "Coach nunca atualiza humor via chat".
export function registerTiphMood(a) {
  const mood = MOOD_VALUES.includes(a.mood) ? a.mood : null;
  if (!mood) return { ok: false, message: "Humor inválido. Use um de: " + MOOD_VALUES.join(", ") + "." };
  writeJSON("mood", mood);
  const date = a.date || todayS();
  const moodLog = readJSON("moodLog", []);
  const existing = moodLog.find(e => e.date === date);
  const patch = { mood, ...(a.influencia != null ? { influencia: a.influencia } : {}), ...(a.gratidao != null ? { gratidao: a.gratidao } : {}) };
  if (existing) {
    writeJSON("moodLog", moodLog.map(e => e.date === date ? { ...e, ...patch } : e));
  } else {
    writeJSON("moodLog", [...moodLog, { id: "ml" + uid(), date, influencia: "", gratidao: "", ...patch }]);
  }
  notifyTiphUpdated();
  return { ok: true, message: "Humor registrado como '" + mood + "'" + (date !== todayS() ? " em " + date : "") + "." };
}

// ── REMÉDIOS ──────────────────────────────────────────────────────────────────
export function createTiphMedication(a) {
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do remédio vazio." };
  const meds = readJSON("medications", []);
  const times = Array.isArray(a.times) ? a.times : (a.times ? String(a.times).split(",").map(t => t.trim()).filter(Boolean) : []);
  writeJSON("medications", [...meds, { id: "med" + uid(), name, dosage: a.dosage || "", times, notes: a.notes || "", active: true }]);
  notifyTiphUpdated();
  return { ok: true, message: "Remédio '" + name + "' cadastrado" + (times.length ? " (" + times.join(", ") + ")" : "") + "." };
}
export function logTiphMedicationTaken(a) {
  const meds = readJSON("medications", []);
  const med = findByField(meds, "name", a.match);
  if (!med) return { ok: false, message: "Não encontrei remédio com '" + a.match + "'." };
  const date = a.date || todayS();
  const time = a.time || (med.times && med.times[0]) || "";
  const log = readJSON("medicationLog", []);
  const existing = log.find(l => l.medId === med.id && l.time === time && l.date === date);
  if (existing) {
    writeJSON("medicationLog", log.map(l => l === existing ? { ...l, taken: true } : l));
  } else {
    writeJSON("medicationLog", [...log, { id: "ml" + uid(), medId: med.id, date, time, taken: true }]);
  }
  notifyTiphUpdated();
  return { ok: true, message: "Dose de '" + med.name + "'" + (time ? " (" + time + ")" : "") + " marcada como tomada." };
}

export const TIPHARETH_ACTION_HANDLERS = {
  create_habit: createTiphHabit,
  toggle_habit: toggleTiphHabit,
  create_goal: createTiphGoal,
  toggle_goal: toggleTiphGoal,
  create_product: createTiphProduct,
  add_routine_step: addTiphRoutineStep,
  toggle_routine_step: toggleTiphRoutineStep,
  register_mood: registerTiphMood,
  create_medication: createTiphMedication,
  log_medication_taken: logTiphMedicationTaken,
};
