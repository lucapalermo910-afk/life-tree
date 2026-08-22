// Ações que o Coach global executa sobre os dados do Binah (Conhecimento).
//
// Mesmo padrão dos outros módulos: o estado do Binah vive em BinahModule.jsx
// (useState + localStorage, chave "lifetree_binah_*"), não em App.jsx, então essas funções
// leem/escrevem localStorage direto e avisam o módulo via notifyCoachDataUpdated("binah").

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_binah_";
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
function notifyBinahUpdated() {
  notifyCoachDataUpdated("binah");
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

const TRACK_PALETTE = ["#4f46e5", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6", "#f97316", "#ec4899", "#6366f1", "#84cc16"];
const FOCUS_VALUES = ["atual", "explorando", "arquivada"];
const LIVRO_STATUS_VALUES = ["quero_ler", "lendo", "lido", "pausado"];

// ── TRILHAS DE ESTUDO ─────────────────────────────────────────────────────────
export function createBinahTrack(a) {
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome vazio." };
  const tracks = readJSON("tracks", []);
  writeJSON("tracks", [...tracks, {
    id: "tr" + uid(), name, color: TRACK_PALETTE[tracks.length % TRACK_PALETTE.length],
    focus: FOCUS_VALUES.includes(a.focus) ? a.focus : "atual", topics: [],
  }]);
  notifyBinahUpdated();
  return { ok: true, message: "Trilha '" + name + "' criada." };
}
export function createBinahTopic(a) {
  const tracks = readJSON("tracks", []);
  const track = findByField(tracks, "name", a.track);
  if (!track) return { ok: false, message: "Não encontrei trilha com '" + a.track + "'." };
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do tópico vazio." };
  const topic = { id: "tp" + uid(), name, level: Number(a.level) || 1, target: Number(a.target) || 5, notes: a.notes || "" };
  writeJSON("tracks", tracks.map(t => t.id === track.id ? { ...t, topics: [...t.topics, topic] } : t));
  notifyBinahUpdated();
  return { ok: true, message: "Tópico '" + name + "' criado em '" + track.name + "'." };
}
export function updateBinahTopicLevel(a) {
  const tracks = readJSON("tracks", []);
  let found = null, foundTrack = null;
  for (const t of tracks) {
    const tp = findByField(t.topics, "name", a.match);
    if (tp) { found = tp; foundTrack = t; break; }
  }
  if (!found) return { ok: false, message: "Não encontrei tópico com '" + a.match + "'." };
  const nextLevel = a.level != null ? Number(a.level) : Math.min(found.target, found.level + 1);
  writeJSON("tracks", tracks.map(t => t.id === foundTrack.id ? { ...t, topics: t.topics.map(tp => tp.id === found.id ? { ...tp, level: nextLevel } : tp) } : t));
  notifyBinahUpdated();
  return { ok: true, message: "'" + found.name + "' agora está no nível " + nextLevel + "/" + found.target + "." };
}

// ── LEITURA ────────────────────────────────────────────────────────────────────
export function createBinahLivro(a) {
  const titulo = (a.titulo || "").trim();
  if (!titulo) return { ok: false, message: "Título vazio." };
  const livros = readJSON("livros", []);
  writeJSON("livros", [...livros, {
    id: "lv" + uid(), titulo, autor: a.autor || "",
    status: LIVRO_STATUS_VALUES.includes(a.status) ? a.status : "quero_ler",
    paginaAtual: Number(a.paginaAtual) || 0, totalPaginas: Number(a.totalPaginas) || 0, notas: a.notas || "",
  }]);
  notifyBinahUpdated();
  return { ok: true, message: "Livro '" + titulo + "' adicionado." };
}
export function updateBinahLivroStatus(a) {
  const livros = readJSON("livros", []);
  const found = findByField(livros, "titulo", a.match);
  if (!found) return { ok: false, message: "Não encontrei livro com '" + a.match + "'." };
  if (!LIVRO_STATUS_VALUES.includes(a.status)) return { ok: false, message: "Status inválido. Use: " + LIVRO_STATUS_VALUES.join(", ") + "." };
  writeJSON("livros", livros.map(l => l.id === found.id ? { ...l, status: a.status, paginaAtual: a.paginaAtual != null ? Number(a.paginaAtual) : l.paginaAtual } : l));
  notifyBinahUpdated();
  return { ok: true, message: "'" + found.titulo + "' marcado como '" + a.status + "'." };
}
export function logBinahReading(a) {
  const minutos = Number(a.minutos);
  if (!minutos || minutos <= 0) return { ok: false, message: "Minutos inválidos." };
  const livros = readJSON("livros", []);
  const livro = a.livro ? findByField(livros, "titulo", a.livro) : null;
  if (a.livro && !livro) return { ok: false, message: "Não encontrei livro com '" + a.livro + "'." };
  const date = a.date || todayS();
  const log = readJSON("readingLog", []);
  const livroId = livro ? livro.id : "";
  const existing = log.find(r => r.date === date && r.livroId === livroId);
  if (existing) {
    writeJSON("readingLog", log.map(r => r === existing ? { ...r, minutos: r.minutos + minutos } : r));
  } else {
    writeJSON("readingLog", [...log, { id: "rl" + uid(), date, livroId, minutos }]);
  }
  const xp = readJSON("xp", 0);
  writeJSON("xp", xp + Math.round(minutos * 1.5));
  notifyBinahUpdated();
  return { ok: true, message: "Leitura de " + minutos + " min registrada" + (livro ? " em '" + livro.titulo + "'" : "") + "." };
}

export const BINAH_ACTION_HANDLERS = {
  create_track: createBinahTrack,
  create_topic: createBinahTopic,
  update_topic_level: updateBinahTopicLevel,
  create_livro: createBinahLivro,
  update_livro_status: updateBinahLivroStatus,
  log_reading: logBinahReading,
};
