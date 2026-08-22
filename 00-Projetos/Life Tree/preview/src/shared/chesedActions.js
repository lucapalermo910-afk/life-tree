// Ações que o Coach global executa sobre os dados do Chesed (Relacionamentos).
//
// Mesmo padrão de yesodActions.js/geburahActions.js/hodActions.js/tipharethActions.js: o
// estado do Chesed vive em ChesedModule.jsx (useState + localStorage, chave
// "lifetree_ches_*"), não em App.jsx, então essas funções leem/escrevem localStorage direto
// e avisam o módulo via notifyCoachDataUpdated("chesed") — se o módulo estiver montado, ele
// relê do storage.

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_ches_";
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
function notifyChesedUpdated() {
  notifyCoachDataUpdated("chesed");
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

const PESSOA_PALETTE = ["#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6", "#6366f1", "#84cc16", "#f472b6"];

// ── PESSOAS ──────────────────────────────────────────────────────────────────
export function createChesedPessoa(a) {
  const nome = (a.nome || "").trim();
  if (!nome) return { ok: false, message: "Nome vazio." };
  const pessoas = readJSON("pessoas", []);
  const pessoa = {
    id: "p" + uid(), nome, emoji: a.emoji || "😊", tipo: a.tipo || "Amigo",
    freqIdeal: Number(a.freqIdeal) || 7, ultimoContato: a.ultimoContato || todayS(),
    energia: a.energia || "positiva", nota: a.nota || "",
    cor: PESSOA_PALETTE[pessoas.length % PESSOA_PALETTE.length],
    interesses: a.interesses || "", presentes: a.presentes || "", topicosPendentes: a.topicosPendentes || "",
  };
  writeJSON("pessoas", [...pessoas, pessoa]);
  notifyChesedUpdated();
  return { ok: true, message: "Pessoa '" + nome + "' adicionada." };
}

export function updateChesedPessoaInfo(a) {
  const pessoas = readJSON("pessoas", []);
  const found = findByField(pessoas, "nome", a.match);
  if (!found) return { ok: false, message: "Não encontrei pessoa com '" + a.match + "'." };
  const patch = {};
  if (a.interesses != null) patch.interesses = a.interesses;
  if (a.presentes != null) patch.presentes = a.presentes;
  if (a.topicosPendentes != null) patch.topicosPendentes = a.topicosPendentes;
  if (a.nota != null) patch.nota = a.nota;
  writeJSON("pessoas", pessoas.map(p => p.id === found.id ? { ...p, ...patch } : p));
  notifyChesedUpdated();
  return { ok: true, message: "Informações de '" + found.nome + "' atualizadas." };
}

// ── REGISTROS DE CONTATO ─────────────────────────────────────────────────────
// Mesmo comportamento da UI: registrar um contato também atualiza ultimoContato da pessoa
// (só avança a data, nunca retrocede — mesma correção aplicada no botão "Registrar" da tela).
export function registerChesedContato(a) {
  const pessoas = readJSON("pessoas", []);
  const pessoa = findByField(pessoas, "nome", a.pessoa);
  if (!pessoa) return { ok: false, message: "Não encontrei pessoa com '" + a.pessoa + "'." };
  const data = a.data || todayS();
  const registros = readJSON("registros", []);
  writeJSON("registros", [...registros, {
    id: "r" + uid(), pessoaId: pessoa.id, data,
    tipo: a.tipo || "Conversa", conteudo: a.conteudo || "", qualidade: Number(a.qualidade) || 3,
  }]);
  writeJSON("pessoas", pessoas.map(p => p.id === pessoa.id ? { ...p, ultimoContato: data > p.ultimoContato ? data : p.ultimoContato } : p));
  notifyChesedUpdated();
  return { ok: true, message: "Contato com '" + pessoa.nome + "' registrado." };
}

// ── DATAS ESPECIAIS ───────────────────────────────────────────────────────────
export function createChesedData(a) {
  const nome = (a.nome || "").trim();
  if (!nome) return { ok: false, message: "Nome da data vazio." };
  if (!a.data) return { ok: false, message: "Data vazia (formato YYYY-MM-DD)." };
  const pessoas = readJSON("pessoas", []);
  const pessoa = a.pessoa ? findByField(pessoas, "nome", a.pessoa) : null;
  const datas = readJSON("datas", []);
  writeJSON("datas", [...datas, {
    id: "dt" + uid(), nome, pessoaId: pessoa ? pessoa.id : "",
    data: a.data, tipo: a.tipo || "Data especial", recorrente: a.recorrente !== false, lembrete: 7,
  }]);
  notifyChesedUpdated();
  return { ok: true, message: "Data '" + nome + "' adicionada" + (pessoa ? " para " + pessoa.nome : "") + "." };
}

// ── HÁBITOS DE RELACIONAMENTO ─────────────────────────────────────────────────
export function createChesedHabit(a) {
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  const habits = readJSON("habits", []);
  writeJSON("habits", [...habits, { id: "rh" + uid(), title, freq: a.freq || "Semanal", xp: Number(a.xp) || 15, done: false }]);
  notifyChesedUpdated();
  return { ok: true, message: "Hábito '" + title + "' criado." };
}
export function toggleChesedHabit(a) {
  const habits = readJSON("habits", []);
  const found = findByField(habits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  const nextDone = !found.done;
  writeJSON("habits", habits.map(h => h.id === found.id ? { ...h, done: nextDone } : h));
  if (nextDone) {
    const xp = readJSON("xp", 0);
    writeJSON("xp", xp + found.xp);
  }
  notifyChesedUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (nextDone ? "feito" : "pendente") + "." };
}

export const CHESED_ACTION_HANDLERS = {
  create_pessoa: createChesedPessoa,
  update_pessoa_info: updateChesedPessoaInfo,
  register_contato: registerChesedContato,
  create_data: createChesedData,
  create_habit: createChesedHabit,
  toggle_habit: toggleChesedHabit,
};
