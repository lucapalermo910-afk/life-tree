// Ações que o Coach global executa sobre os dados do Chokmah (Espiritualidade).
//
// Mesmo padrão dos outros módulos: o estado do Chokmah vive em ChokmahModule.jsx
// (useState + localStorage, chave "lifetree_chok_*"), não em App.jsx, então essas funções
// leem/escrevem localStorage direto e avisam o módulo via notifyCoachDataUpdated("chokmah").

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_chok_";
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
function notifyChokUpdated() {
  notifyCoachDataUpdated("chokmah");
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

const TRAD_PALETTE = ["#c084fc", "#f472b6", "#f59e0b", "#06b6d4", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];
const TRAD_STATUS_VALUES = ["explorando", "praticando", "pausado"];

// ── HÁBITOS DE PRÁTICA ────────────────────────────────────────────────────────
export function createChokHabit(a) {
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const habits = readJSON("praticaHabits", []);
  writeJSON("praticaHabits", [...habits, { id: "ph" + uid(), title, freq: a.freq || "Diário", xp: Number(a.xp) || 15, done: false }]);
  notifyChokUpdated();
  return { ok: true, message: "Hábito '" + title + "' criado." };
}
export function toggleChokHabit(a) {
  const habits = readJSON("praticaHabits", []);
  const found = findByField(habits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  const nextDone = !found.done;
  writeJSON("praticaHabits", habits.map(h => h.id === found.id ? { ...h, done: nextDone } : h));
  if (nextDone) {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + found.xp);
  }
  notifyChokUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (nextDone ? "feito" : "pendente") + "." };
}

// ── MEDITAÇÃO (log rápido, upsert por dia) ────────────────────────────────────
export function logChokMeditation(a) {
  const minutes = Number(a.minutes);
  if (!minutes || minutes <= 0) return { ok: false, message: "Minutos inválidos." };
  const date = a.date || todayS();
  const log = readJSON("meditationLog", []);
  const existing = log.find(m => m.date === date);
  if (existing) {
    writeJSON("meditationLog", log.map(m => m.date === date ? { ...m, minutes: m.minutes + minutes } : m));
  } else {
    writeJSON("meditationLog", [...log, { id: "med" + uid(), date, minutes }]);
  }
  const xp = readJSON("xp", 0);
  writeJSON("xp", xp + minutes * 2);
  notifyChokUpdated();
  return { ok: true, message: "Meditação de " + minutes + " min registrada" + (date !== todayS() ? " em " + date : "") + "." };
}

// ── TRADIÇÕES ──────────────────────────────────────────────────────────────────
export function createChokTradicao(a) {
  const nome = (a.nome || "").trim();
  if (!nome) return { ok: false, message: "Nome vazio." };
  const tradicoes = readJSON("tradicoes", []);
  writeJSON("tradicoes", [...tradicoes, {
    id: "tr" + uid(), nome, tipo: a.tipo || "Outro",
    status: TRAD_STATUS_VALUES.includes(a.status) ? a.status : "explorando",
    notas: a.notas || "", cor: TRAD_PALETTE[tradicoes.length % TRAD_PALETTE.length],
  }]);
  notifyChokUpdated();
  return { ok: true, message: "Tradição '" + nome + "' adicionada." };
}
export function updateChokTradicaoStatus(a) {
  const tradicoes = readJSON("tradicoes", []);
  const found = findByField(tradicoes, "nome", a.match);
  if (!found) return { ok: false, message: "Não encontrei tradição com '" + a.match + "'." };
  if (!TRAD_STATUS_VALUES.includes(a.status)) return { ok: false, message: "Status inválido. Use: " + TRAD_STATUS_VALUES.join(", ") + "." };
  writeJSON("tradicoes", tradicoes.map(t => t.id === found.id ? { ...t, status: a.status, notas: a.notas != null ? a.notas : t.notas } : t));
  notifyChokUpdated();
  return { ok: true, message: "'" + found.nome + "' marcada como '" + a.status + "'." };
}

// ── DIÁRIO ESPIRITUAL ──────────────────────────────────────────────────────────
export function addChokDiaryEntry(a) {
  const texto = (a.texto || "").trim();
  if (!texto) return { ok: false, message: "Texto vazio." };
  const diary = readJSON("diary", []);
  writeJSON("diary", [...diary, { id: "di" + uid(), date: a.date || todayS(), prompt: a.prompt || "Reflexão livre", texto }]);
  notifyChokUpdated();
  return { ok: true, message: "Reflexão registrada no diário." };
}

export const CHOKMAH_ACTION_HANDLERS = {
  create_habit: createChokHabit,
  toggle_habit: toggleChokHabit,
  log_meditation: logChokMeditation,
  create_tradicao: createChokTradicao,
  update_tradicao_status: updateChokTradicaoStatus,
  add_diary_entry: addChokDiaryEntry,
};
