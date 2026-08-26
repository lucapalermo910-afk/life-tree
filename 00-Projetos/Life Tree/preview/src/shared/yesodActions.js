// Ações que o Coach global executa sobre os dados do Yesod (Finanças).
//
// O estado do Yesod vive dentro de YesodModule.jsx (useState + localStorage), não em
// App.jsx — diferente do hub, onde hábitos/metas/diário já vivem em App.jsx e as ações
// só chamam os setters do próprio componente. Como o Coach roda em App.jsx, essas funções
// leem e escrevem direto no localStorage (mesma fonte de verdade que o YesodModule usa).
//
// Esse é o padrão de referência pros próximos módulos que ganharem ações de coach: um
// <modulo>Actions.js igual este, chamando notifyCoachDataUpdated(moduleId) depois de cada
// escrita — ver coachSync.js pro porquê (sem isso, se o módulo estiver montado, a UI fica
// dessincronizada do localStorage até um reload manual).

import { notifyCoachDataUpdated } from "./coachSync.js";

const PFX = "lifetree_fin_";
const uid = () => Math.random().toString(36).slice(2, 8);
const todayS = () => new Date().toISOString().slice(0, 10);

// Conta virtual "Carteira" onde lançamentos em dinheiro são guardados — mesmo id fixo
// usado em YesodModule.jsx (CASH_ACC_ID), pra que ambos os caminhos (form manual e coach)
// escrevam sempre na mesma conta e o saldo/fluxo de caixa/orçamento reflitam dinheiro
// igual a qualquer outro método de pagamento.
const CASH_ACC_ID = "cash-wallet";
function ensureCashAccount(accs) {
  if (accs.some(a => a.id === CASH_ACC_ID)) return accs;
  return [...accs, { id: CASH_ACC_ID, bankId: null, name: "Carteira", isCash: true, txs: [] }];
}

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
function notifyYesodUpdated() {
  notifyCoachDataUpdated("yesod");
}

const addM = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const freqAdd = (ds, freq) => freq === "weekly" ? addDays(ds, 7) : freq === "yearly" ? addM(ds, 12) : addM(ds, 1);

function findAccount(accs, banks, nameHint) {
  if (!accs.length) return null;
  if (!nameHint) return accs[0];
  const q = nameHint.toLowerCase();
  const scored = accs.find(a => {
    const bankName = banks.find(b => b.id === a.bankId)?.name || "";
    return (a.name + " " + bankName).toLowerCase().includes(q);
  });
  return scored || accs[0];
}
function findCard(cards, banks, nameHint) {
  if (!cards.length) return null;
  if (!nameHint) return cards[0];
  const q = nameHint.toLowerCase();
  const scored = cards.find(c => {
    const bankName = banks.find(b => b.id === c.bankId)?.name || "";
    return (c.name + " " + bankName).toLowerCase().includes(q);
  });
  return scored || cards[0];
}

// Localiza o melhor item de uma lista por substring num campo de texto (nome, título, etc.)
function findByField(list, field, text) {
  if (!list.length) return null;
  const q = (text || "").toLowerCase();
  if (!q) return list[0];
  return list.find(x => (x[field] || "").toLowerCase().includes(q)) || null;
}

// Localiza um lançamento (em contas ou cartões) por texto da descrição, com data opcional
// pra desambiguar. Retorna { where:"acc"|"card", ownerId, tx } do mais recente que bater.
function findTransaction(accs, cards, matchText, matchDate) {
  const q = (matchText || "").toLowerCase();
  const candidates = [];
  accs.forEach(a => (a.txs || []).forEach(tx => {
    if (tx.desc.toLowerCase().includes(q)) candidates.push({ where: "acc", ownerId: a.id, tx });
  }));
  cards.forEach(c => (c.txs || []).forEach(tx => {
    if (tx.desc.toLowerCase().includes(q)) candidates.push({ where: "card", ownerId: c.id, tx });
  }));
  if (!candidates.length) return null;
  if (matchDate) {
    const exact = candidates.find(c => c.tx.date === matchDate);
    if (exact) return exact;
  }
  candidates.sort((a, b) => b.tx.date.localeCompare(a.tx.date));
  return candidates[0];
}

// ── CRIAR LANÇAMENTO (única ou recorrente) ──────────────────────────────────────
export function createYesodTransaction(a) {
  const accs = readJSON("accs", []);
  const cards = readJSON("cards", []);
  const banks = readJSON("banks", []);
  const catsOut = readJSON("catsout", []);
  const catsIn = readJSON("catsin", []);
  const recurrings = readJSON("recurrings", []);
  const splitPeople = readJSON("splitpeople", []);

  const type = a.type === "in" ? "in" : "out";
  const amount = Math.abs(Number(a.amount) || 0);
  if (!amount) return { ok: false, message: "Valor inválido." };
  const date = a.date || todayS();
  const desc = a.desc || (type === "in" ? "Entrada" : "Saída");
  let cat = a.cat || (type === "in" ? "Outros" : "Outros");
  // categoria nova mencionada pelo usuário e ainda não cadastrada → cria automaticamente
  if (type === "out" && !catsOut.includes(cat)) { catsOut.push(cat); writeJSON("catsout", catsOut); }
  if (type === "in" && !catsIn.includes(cat)) { catsIn.push(cat); writeJSON("catsin", catsIn); }

  const method = a.method || "pix";
  let accId = null, cardId = null;

  // Split (divisão de despesa) — só saídas em conta, não cartão, mesma regra da UI.
  // a.splitPerson é resolvido por nome contra splitpeople; se não achar, ignora o split
  // silenciosamente em vez de falhar o lançamento inteiro.
  let splitPayload = null;
  if (type === "out" && method !== "credito" && a.splitPerson) {
    const person = findByField(splitPeople, "name", a.splitPerson);
    if (person) splitPayload = { personId: person.id, theirPercent: Number(a.splitPercent) || 50, settled: false };
  }

  if (method === "credito") {
    const card = findCard(cards, banks, a.card || a.account);
    if (!card) return { ok: false, message: "Nenhum cartão cadastrado." };
    cardId = card.id;
    const installments = type === "in" ? 1 : (Number(a.installments) || 1);
    const updated = cards.map(c => c.id === card.id ? { ...c, txs: [...c.txs, { id: "ct"+uid(), desc, amount, type, date, cat, installments }] } : c);
    writeJSON("cards", updated);
  } else if (method === "dinheiro") {
    accId = CASH_ACC_ID;
    const withCash = ensureCashAccount(accs);
    const updated = withCash.map(x => x.id === CASH_ACC_ID ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc, amount, type, date, cat, method: "dinheiro", recurring: a.freq || "", ...(splitPayload ? { split: splitPayload } : {}) }] } : x);
    writeJSON("accs", updated);
  } else {
    const acc = findAccount(accs, banks, a.account);
    if (!acc) return { ok: false, message: "Nenhuma conta cadastrada." };
    accId = acc.id;
    const updated = accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc, amount, type, date, cat, method, recurring: a.freq || "", ...(splitPayload ? { split: splitPayload } : {}) }] } : x);
    writeJSON("accs", updated);
  }

  let recurMsg = "";
  if (a.freq) {
    writeJSON("recurrings", [...recurrings, { id: "rec"+uid(), desc, amount, type, cat, method, accId, cardId, freq: a.freq, nextDate: freqAdd(date, a.freq), active: true, ...(splitPayload ? { split: { personId: splitPayload.personId, theirPercent: splitPayload.theirPercent } } : {}) }]);
    recurMsg = " (recorrente: " + ({ weekly: "semanal", monthly: "mensal", yearly: "anual" }[a.freq] || a.freq) + ")";
  }

  const splitMsg = splitPayload ? " · dividido com " + (splitPeople.find(p => p.id === splitPayload.personId)?.name) + " (" + splitPayload.theirPercent + "%)" : "";

  notifyYesodUpdated();
  return { ok: true, message: (type === "in" ? "Entrada" : "Saída") + " de R$" + amount.toFixed(2) + " (" + desc + ") registrada" + recurMsg + splitMsg + "." };
}

// ── EDITAR LANÇAMENTO ────────────────────────────────────────────────────────────
export function editYesodTransaction(a) {
  const accs = readJSON("accs", []);
  const cards = readJSON("cards", []);
  const banks = readJSON("banks", []);
  const found = findTransaction(accs, cards, a.match, a.matchDate);
  if (!found) return { ok: false, message: "Não encontrei nenhum lançamento com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.desc != null) patch.desc = changes.desc;
  if (changes.amount != null) patch.amount = Math.abs(Number(changes.amount)) || found.tx.amount;
  if (changes.cat != null) patch.cat = changes.cat;
  if (changes.date != null) patch.date = changes.date;
  if (changes.method != null && found.where === "acc") patch.method = changes.method;

  if (found.where === "acc") {
    // Se o método virou "dinheiro" (→ Carteira), deixou de ser "dinheiro" vindo da Carteira
    // (→ precisa de uma conta real), ou "account" foi indicado explicitamente, a transação
    // muda de array (accs[ownerId].txs → accs[targetId].txs), não só o campo method no lugar
    // — mesmo bug que existia na tela antes do fix de 12/08/2026 (ver saveEditTx em
    // YesodModule.jsx), replicado aqui porque essa função tinha ficado pra trás.
    const withCash = ensureCashAccount(accs);
    let targetAccId = found.ownerId;
    if (patch.method === "dinheiro") {
      targetAccId = CASH_ACC_ID;
    } else if (changes.account) {
      const acc = findAccount(withCash.filter(x => !x.isCash), banks, changes.account);
      if (acc) targetAccId = acc.id;
    } else if (patch.method && patch.method !== "dinheiro" && found.ownerId === CASH_ACC_ID) {
      const acc = findAccount(withCash.filter(x => !x.isCash), banks, null);
      if (acc) targetAccId = acc.id;
    }
    const merged = { ...found.tx, ...patch };
    if (targetAccId === found.ownerId) {
      writeJSON("accs", withCash.map(x => x.id === found.ownerId ? { ...x, txs: x.txs.map(t => t.id === found.tx.id ? merged : t) } : x));
    } else {
      writeJSON("accs", withCash.map(x => {
        if (x.id === found.ownerId) return { ...x, txs: x.txs.filter(t => t.id !== found.tx.id) };
        if (x.id === targetAccId) return { ...x, txs: [...x.txs, merged] };
        return x;
      }));
    }
  } else {
    writeJSON("cards", cards.map(x => x.id === found.ownerId ? { ...x, txs: x.txs.map(t => t.id === found.tx.id ? { ...t, ...patch } : t) } : x));
  }
  notifyYesodUpdated();
  return { ok: true, message: "Lançamento '" + found.tx.desc + "' atualizado." };
}

// ── APAGAR LANÇAMENTO ────────────────────────────────────────────────────────────
export function deleteYesodTransaction(a) {
  const accs = readJSON("accs", []);
  const cards = readJSON("cards", []);
  const found = findTransaction(accs, cards, a.match, a.matchDate);
  if (!found) return { ok: false, message: "Não encontrei nenhum lançamento com '" + a.match + "'." };

  if (found.where === "acc") {
    writeJSON("accs", accs.map(x => x.id === found.ownerId ? { ...x, txs: x.txs.filter(t => t.id !== found.tx.id) } : x));
  } else {
    writeJSON("cards", cards.map(x => x.id === found.ownerId ? { ...x, txs: x.txs.filter(t => t.id !== found.tx.id) } : x));
  }
  notifyYesodUpdated();
  return { ok: true, message: "Lançamento '" + found.tx.desc + "' removido." };
}

// ── CATEGORIAS ───────────────────────────────────────────────────────────────────
export function createYesodCategory(a) {
  const key = a.kind === "in" ? "catsin" : "catsout";
  const list = readJSON(key, []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome de categoria vazio." };
  if (list.includes(name)) return { ok: false, message: "Categoria '" + name + "' já existe." };
  writeJSON(key, [...list, name]);
  notifyYesodUpdated();
  return { ok: true, message: "Categoria '" + name + "' criada." };
}
export function deleteYesodCategory(a) {
  const key = a.kind === "in" ? "catsin" : "catsout";
  const list = readJSON(key, []);
  if (!list.includes(a.name)) return { ok: false, message: "Categoria '" + a.name + "' não encontrada." };
  writeJSON(key, list.filter(c => c !== a.name));
  notifyYesodUpdated();
  return { ok: true, message: "Categoria '" + a.name + "' removida." };
}

// ── RECORRÊNCIAS ─────────────────────────────────────────────────────────────────
function findRecurring(recurrings, matchText) {
  const q = (matchText || "").toLowerCase();
  return recurrings.find(r => r.desc.toLowerCase().includes(q));
}
export function deleteYesodRecurring(a) {
  const recurrings = readJSON("recurrings", []);
  const found = findRecurring(recurrings, a.match);
  if (!found) return { ok: false, message: "Não encontrei recorrência com '" + a.match + "'." };
  writeJSON("recurrings", recurrings.filter(r => r.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Recorrência '" + found.desc + "' removida." };
}
export function toggleYesodRecurring(a) {
  const recurrings = readJSON("recurrings", []);
  const found = findRecurring(recurrings, a.match);
  if (!found) return { ok: false, message: "Não encontrei recorrência com '" + a.match + "'." };
  const nextActive = !found.active;
  writeJSON("recurrings", recurrings.map(r => r.id === found.id ? { ...r, active: nextActive } : r));
  notifyYesodUpdated();
  return { ok: true, message: "Recorrência '" + found.desc + "' " + (nextActive ? "reativada" : "pausada") + "." };
}
export function editYesodRecurring(a) {
  const recurrings = readJSON("recurrings", []);
  const found = findRecurring(recurrings, a.match);
  if (!found) return { ok: false, message: "Não encontrei recorrência com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.desc != null) patch.desc = changes.desc;
  if (changes.amount != null) patch.amount = Math.abs(Number(changes.amount)) || found.amount;
  if (changes.freq != null) patch.freq = changes.freq;
  writeJSON("recurrings", recurrings.map(r => r.id === found.id ? { ...r, ...patch } : r));
  notifyYesodUpdated();
  return { ok: true, message: "Recorrência '" + found.desc + "' atualizada." };
}

// ── BANCOS ───────────────────────────────────────────────────────────────────────
export function createYesodBank(a) {
  const banks = readJSON("banks", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do banco vazio." };
  writeJSON("banks", [...banks, { id: "b"+uid(), name, color: a.color || "#10b981" }]);
  notifyYesodUpdated();
  return { ok: true, message: "Banco '" + name + "' criado." };
}
export function editYesodBank(a) {
  const banks = readJSON("banks", []);
  const found = findByField(banks, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei banco com '" + a.match + "'." };
  writeJSON("banks", banks.map(b => b.id === found.id ? { ...b, ...(a.changes?.name && { name: a.changes.name }), ...(a.changes?.color && { color: a.changes.color }) } : b));
  notifyYesodUpdated();
  return { ok: true, message: "Banco '" + found.name + "' atualizado." };
}
export function deleteYesodBank(a) {
  const banks = readJSON("banks", []);
  const found = findByField(banks, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei banco com '" + a.match + "'." };
  writeJSON("banks", banks.filter(b => b.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Banco '" + found.name + "' removido." };
}

// ── CONTAS ───────────────────────────────────────────────────────────────────────
export function createYesodAccount(a) {
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome da conta vazio." };
  const bank = findByField(banks, "name", a.bank);
  writeJSON("accs", [...accs, { id: "a"+uid(), bankId: bank?.id || banks[0]?.id || "", name, txs: [] }]);
  notifyYesodUpdated();
  return { ok: true, message: "Conta '" + name + "' criada" + (bank ? " em " + bank.name : "") + "." };
}
export function editYesodAccount(a) {
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(accs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei conta com '" + a.match + "'." };
  const patch = {};
  if (a.changes?.name) patch.name = a.changes.name;
  if (a.changes?.bank) { const bank = findByField(banks, "name", a.changes.bank); if (bank) patch.bankId = bank.id; }
  writeJSON("accs", accs.map(x => x.id === found.id ? { ...x, ...patch } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Conta '" + found.name + "' atualizada." };
}
export function deleteYesodAccount(a) {
  const accs = readJSON("accs", []);
  const found = findByField(accs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei conta com '" + a.match + "'." };
  writeJSON("accs", accs.filter(x => x.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Conta '" + found.name + "' removida." };
}

// ── CARTÕES ──────────────────────────────────────────────────────────────────────
export function createYesodCard(a) {
  const cards = readJSON("cards", []);
  const banks = readJSON("banks", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do cartão vazio." };
  const bank = findByField(banks, "name", a.bank);
  writeJSON("cards", [...cards, {
    id: "c"+uid(), bankId: bank?.id || banks[0]?.id || "", name,
    limit: Number(a.limit) || 5000, closeDay: Number(a.closeDay) || 10, dueDay: Number(a.dueDay) || 25,
    color: a.color || "#10b981", txs: [],
  }]);
  notifyYesodUpdated();
  return { ok: true, message: "Cartão '" + name + "' criado." };
}
export function editYesodCard(a) {
  const cards = readJSON("cards", []);
  const found = findByField(cards, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei cartão com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (changes.limit != null) patch.limit = Number(changes.limit);
  if (changes.closeDay != null) patch.closeDay = Number(changes.closeDay);
  if (changes.dueDay != null) patch.dueDay = Number(changes.dueDay);
  writeJSON("cards", cards.map(x => x.id === found.id ? { ...x, ...patch } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Cartão '" + found.name + "' atualizado." };
}
export function deleteYesodCard(a) {
  const cards = readJSON("cards", []);
  const found = findByField(cards, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei cartão com '" + a.match + "'." };
  writeJSON("cards", cards.filter(x => x.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Cartão '" + found.name + "' removido." };
}

// ── CAIXINHAS ────────────────────────────────────────────────────────────────────
export function createYesodBox(a) {
  const boxes = readJSON("boxes", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome da caixinha vazio." };
  writeJSON("boxes", [...boxes, { id: "bx"+uid(), name, goal: Number(a.goal) || 0, targetDate: a.targetDate || "", color: a.color || "#10b981", balance: 0 }]);
  notifyYesodUpdated();
  return { ok: true, message: "Caixinha '" + name + "' criada" + (a.goal ? " com meta de R$" + Number(a.goal).toFixed(2) : "") + (a.targetDate ? " até " + a.targetDate : "") + "." };
}
export function editYesodBox(a) {
  const boxes = readJSON("boxes", []);
  const found = findByField(boxes, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei caixinha com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (changes.goal != null) patch.goal = Number(changes.goal);
  if (changes.targetDate != null) patch.targetDate = changes.targetDate;
  writeJSON("boxes", boxes.map(x => x.id === found.id ? { ...x, ...patch } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Caixinha '" + found.name + "' atualizada." };
}
export function deleteYesodBox(a) {
  const boxes = readJSON("boxes", []);
  const found = findByField(boxes, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei caixinha com '" + a.match + "'." };
  writeJSON("boxes", boxes.filter(x => x.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Caixinha '" + found.name + "' removida." };
}
// Ligado a conta desde 26/08/2026 (mesmo princípio de boxMoveLinked em YesodModule.jsx) —
// antes só ajustava boxes[].balance isolado, dinheiro "aparecia"/"desaparecia" sem sair de
// lugar nenhum, ficando pra trás quando a UI ganhou essa exigência.
export function boxMoveYesod(a) {
  const boxes = readJSON("boxes", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(boxes, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei caixinha com '" + a.match + "'." };
  const amount = Math.abs(Number(a.amount) || 0);
  if (!amount) return { ok: false, message: "Valor inválido." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra ligar a movimentação." };
  const moveType = a.moveType === "out" ? "out" : "in";
  const delta = moveType === "out" ? -amount : amount;
  const accTx = moveType === "in"
    ? { id: "t"+uid(), desc: "Depósito em " + found.name, amount, type: "out", date: todayS(), cat: "Transferência", method: "ted" }
    : { id: "t"+uid(), desc: "Retirada de " + found.name, amount, type: "in", date: todayS(), cat: "Transferência", method: "ted" };
  writeJSON("boxes", boxes.map(x => x.id === found.id ? { ...x, balance: x.balance + delta } : x));
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, accTx] } : x));
  notifyYesodUpdated();
  return { ok: true, message: (moveType === "out" ? "Retirada" : "Depósito") + " de R$" + amount.toFixed(2) + " em '" + found.name + "' registrado, ligado à conta '" + acc.name + "'." };
}

// ── DÍVIDAS ──────────────────────────────────────────────────────────────────────
// valorRecebido+account desde 26/08/2026 (mesmo princípio de addDebt em YesodModule.jsx) —
// o principal recebido (pode ser diferente da soma das parcelas, que já embute juros) credita
// de verdade numa conta ao criar, quando informado.
export function createYesodDebt(a) {
  const debts = readJSON("debts", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome da dívida vazio." };
  const startDate = a.startDate || todayS();
  writeJSON("debts", [...debts, {
    id: "d"+uid(), name, credor: a.credor || "",
    totalParcelas: Number(a.totalParcelas) || 12, parcelasPagas: Number(a.parcelasPagas) || 0,
    valorParcela: Number(a.valorParcela) || 0, dueDay: Number(a.dueDay) || 10,
    startDate, color: a.color || "#ef4444",
    taxaJuros: Number(a.taxaJuros) || 0, taxaJurosUnit: a.taxaJurosUnit === "mes" ? "mes" : "ano",
  }]);
  const valorRecebido = Number(a.valorRecebido) || 0;
  let creditMsg = "";
  if (valorRecebido > 0) {
    const acc = findAccount(accs, banks, a.account);
    if (acc) {
      writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Empréstimo: " + name, amount: valorRecebido, type: "in", date: startDate, cat: "Empréstimo", method: "ted" }] } : x));
      creditMsg = " R$" + valorRecebido.toFixed(2) + " creditado em '" + acc.name + "'.";
    }
  }
  notifyYesodUpdated();
  return { ok: true, message: "Dívida '" + name + "' criada." + creditMsg };
}
export function editYesodDebt(a) {
  const debts = readJSON("debts", []);
  const found = findByField(debts, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei dívida com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  ["name","credor"].forEach(k => { if (changes[k] != null) patch[k] = changes[k]; });
  ["totalParcelas","parcelasPagas","valorParcela","dueDay","taxaJuros"].forEach(k => { if (changes[k] != null) patch[k] = Number(changes[k]); });
  if (changes.taxaJurosUnit != null) patch.taxaJurosUnit = changes.taxaJurosUnit === "mes" ? "mes" : "ano";
  writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, ...patch } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Dívida '" + found.name + "' atualizada." };
}
export function deleteYesodDebt(a) {
  const debts = readJSON("debts", []);
  const found = findByField(debts, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei dívida com '" + a.match + "'." };
  writeJSON("debts", debts.filter(x => x.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Dívida '" + found.name + "' removida." };
}
// Ligado a conta desde 26/08/2026 (mesmo princípio de payDebt em YesodModule.jsx) — era a
// única ação de dívida que mexia em parcelasPagas sem debitar dinheiro de lugar nenhum.
export function payYesodDebt(a) {
  const debts = readJSON("debts", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(debts, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei dívida com '" + a.match + "'." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra debitar o pagamento." };
  const qtd = Math.max(1, Number(a.qtd) || 1);
  const novasPagas = Math.min(found.totalParcelas, found.parcelasPagas + qtd);
  const valor = qtd * found.valorParcela;
  writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, parcelasPagas: novasPagas } : x));
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Parcela " + found.name, amount: valor, type: "out", date: todayS(), cat: "Pagamento de dívida", method: "ted" }] } : x));
  notifyYesodUpdated();
  return { ok: true, message: qtd + " parcela(s) de '" + found.name + "' paga(s) (" + novasPagas + "/" + found.totalParcelas + "), R$" + valor.toFixed(2) + " debitado de '" + acc.name + "'." };
}
// Amortização (nova em 26/08/2026, mesmo princípio de amortizarDivida em YesodModule.jsx) —
// paga um valor extra (por R$ ou por nº de parcelas) além do fluxo normal, com escolha de
// reduzir prazo (mantém valor da parcela, quita parcelas finais) ou reduzir parcela (mantém
// nº de parcelas, diminui o valor de cada uma). Sempre debita de uma conta.
export function amortizeYesodDebt(a) {
  const debts = readJSON("debts", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(debts, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei dívida com '" + a.match + "'." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra debitar a amortização." };
  const remaining = (found.totalParcelas - found.parcelasPagas) * found.valorParcela;
  if (remaining <= 0) return { ok: false, message: "'" + found.name + "' já está quitada." };
  const debitTx = amortValue => ({ id: "t"+uid(), desc: "Amortização " + found.name, amount: amortValue, type: "out", date: todayS(), cat: "Amortização de dívida", method: "ted" });

  if (a.mode === "parcelas") {
    const qtd = Math.max(1, Math.min(found.totalParcelas - found.parcelasPagas, Number(a.qtd) || 1));
    const amortValue = qtd * found.valorParcela;
    writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, debitTx(amortValue)] } : x));
    writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, parcelasPagas: x.parcelasPagas + qtd } : x));
    notifyYesodUpdated();
    return { ok: true, message: "Amortizadas " + qtd + " parcela(s) (R$" + amortValue.toFixed(2) + ") de '" + found.name + "', debitado de '" + acc.name + "'." };
  }

  const amortValue = Math.max(0, Math.min(Number(a.value) || 0, remaining));
  if (!amortValue) return { ok: false, message: "Valor de amortização inválido." };
  const remainingAfter = remaining - amortValue;
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, debitTx(amortValue)] } : x));
  if (a.effect === "parcela") {
    const remainingInstallments = found.totalParcelas - found.parcelasPagas;
    const newValorParcela = remainingAfter <= 0 ? 0 : remainingAfter / remainingInstallments;
    writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, valorParcela: newValorParcela, ...(remainingAfter <= 0 ? { parcelasPagas: x.totalParcelas } : {}) } : x));
  } else {
    const newTotalParcelas = remainingAfter <= 0 ? found.parcelasPagas : found.parcelasPagas + Math.ceil(remainingAfter / found.valorParcela);
    writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, totalParcelas: newTotalParcelas } : x));
  }
  notifyYesodUpdated();
  return { ok: true, message: "Amortização de R$" + amortValue.toFixed(2) + " em '" + found.name + "' registrada (" + (a.effect === "parcela" ? "parcela reduzida" : "prazo reduzido") + "), debitado de '" + acc.name + "'." };
}
// Quitação geral (nova em 26/08/2026, mesmo princípio de quitarDivida em YesodModule.jsx) —
// paga o saldo devedor inteiro de uma vez, de uma conta.
export function settleYesodDebt(a) {
  const debts = readJSON("debts", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(debts, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei dívida com '" + a.match + "'." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra debitar a quitação." };
  const remaining = (found.totalParcelas - found.parcelasPagas) * found.valorParcela;
  if (remaining <= 0) return { ok: false, message: "'" + found.name + "' já está quitada." };
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Quitação " + found.name, amount: remaining, type: "out", date: todayS(), cat: "Quitação de dívida", method: "ted" }] } : x));
  writeJSON("debts", debts.map(x => x.id === found.id ? { ...x, parcelasPagas: x.totalParcelas } : x));
  notifyYesodUpdated();
  return { ok: true, message: "'" + found.name + "' quitada (R$" + remaining.toFixed(2) + " debitado de '" + acc.name + "')." };
}

// ── INVESTIMENTOS ────────────────────────────────────────────────────────────────
// Debita conta quando "invested">0, desde 26/08/2026 (mesmo princípio de addInv em
// YesodModule.jsx) — só debita se "account" for informado (deixe de fora se for um ativo que
// já existia antes do app, sem debitar nada).
export function createYesodInvestment(a) {
  const invs = readJSON("invs", []);
  const banks = readJSON("banks", []);
  const accs = readJSON("accs", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome do ativo vazio." };
  const bank = findByField(banks, "name", a.bank);
  writeJSON("invs", [...invs, {
    id: "i"+uid(), bankId: bank?.id || banks[0]?.id || "", subCat: a.subCat || "rf_pub", name,
    invested: Number(a.invested) || 0, balance: Number(a.balance ?? a.invested) || 0,
    rate: a.rate || "", maturity: a.maturity || "",
  }]);
  const invested = Number(a.invested) || 0;
  let debitMsg = "";
  if (invested > 0 && a.account) {
    const acc = findAccount(accs, banks, a.account);
    if (acc) {
      writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Aporte inicial: " + name, amount: invested, type: "out", date: todayS(), cat: "Investimento", method: "ted" }] } : x));
      debitMsg = " R$" + invested.toFixed(2) + " debitado de '" + acc.name + "'.";
    }
  }
  notifyYesodUpdated();
  return { ok: true, message: "Investimento '" + name + "' criado." + debitMsg };
}
export function editYesodInvestment(a) {
  const invs = readJSON("invs", []);
  const found = findByField(invs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei investimento com '" + a.match + "'." };
  const changes = a.changes || {};
  const patch = {};
  if (changes.name != null) patch.name = changes.name;
  if (changes.invested != null) patch.invested = Number(changes.invested);
  if (changes.balance != null) patch.balance = Number(changes.balance);
  if (changes.rate != null) patch.rate = changes.rate;
  writeJSON("invs", invs.map(x => x.id === found.id ? { ...x, ...patch } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Investimento '" + found.name + "' atualizado." };
}
export function deleteYesodInvestment(a) {
  const invs = readJSON("invs", []);
  const found = findByField(invs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei investimento com '" + a.match + "'." };
  writeJSON("invs", invs.filter(x => x.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Investimento '" + found.name + "' removido." };
}
export function updateYesodInvestmentBalance(a) {
  const invs = readJSON("invs", []);
  const found = findByField(invs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei investimento com '" + a.match + "'." };
  const balance = Number(a.balance);
  if (isNaN(balance)) return { ok: false, message: "Saldo inválido." };
  writeJSON("invs", invs.map(x => x.id === found.id ? { ...x, balance } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Saldo de '" + found.name + "' atualizado para R$" + balance.toFixed(2) + "." };
}
// Aportar/Resgatar (novos em 26/08/2026, mesmo princípio de invAportar/invResgatar em
// YesodModule.jsx) — diferente de updateYesodInvestmentBalance acima (ajuste de valor de
// mercado, sem tocar em conta nenhuma), estes movimentam uma conta de verdade.
export function investAportarYesod(a) {
  const invs = readJSON("invs", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(invs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei investimento com '" + a.match + "'." };
  const amount = Math.abs(Number(a.amount) || 0);
  if (!amount) return { ok: false, message: "Valor inválido." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra debitar o aporte." };
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Aporte em " + found.name, amount, type: "out", date: todayS(), cat: "Investimento", method: "ted" }] } : x));
  writeJSON("invs", invs.map(x => x.id === found.id ? { ...x, invested: x.invested + amount, balance: x.balance + amount } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Aporte de R$" + amount.toFixed(2) + " em '" + found.name + "' registrado, debitado de '" + acc.name + "'." };
}
export function investResgatarYesod(a) {
  const invs = readJSON("invs", []);
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const found = findByField(invs, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei investimento com '" + a.match + "'." };
  const acc = findAccount(accs, banks, a.account);
  if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra creditar o resgate." };
  const amount = Math.min(Math.abs(Number(a.amount) || 0), found.balance);
  if (!amount) return { ok: false, message: "Valor inválido." };
  // Resgate reduz invested proporcionalmente ao que saiu do balance, pra manter o % de
  // rendimento coerente antes/depois de um resgate parcial (mesma regra da UI).
  const proportion = found.balance > 0 ? amount / found.balance : 1;
  writeJSON("accs", accs.map(x => x.id === acc.id ? { ...x, txs: [...x.txs, { id: "t"+uid(), desc: "Resgate de " + found.name, amount, type: "in", date: todayS(), cat: "Investimento", method: "ted" }] } : x));
  writeJSON("invs", invs.map(x => x.id === found.id ? { ...x, balance: x.balance - amount, invested: Math.max(0, x.invested - x.invested * proportion) } : x));
  notifyYesodUpdated();
  return { ok: true, message: "Resgate de R$" + amount.toFixed(2) + " de '" + found.name + "' registrado, creditado em '" + acc.name + "'." };
}

// ── ORÇAMENTO ────────────────────────────────────────────────────────────────────
export function createYesodBudget(a) {
  const budgets = readJSON("budgets", []);
  const cat = (a.cat || "").trim();
  if (!cat) return { ok: false, message: "Categoria vazia." };
  if (budgets.some(b => b.cat === cat)) return { ok: false, message: "Já existe orçamento pra '" + cat + "' — use edit_budget." };
  writeJSON("budgets", [...budgets, { id: "bg"+uid(), cat, limit: Number(a.limit) || 0 }]);
  notifyYesodUpdated();
  return { ok: true, message: "Orçamento de R$" + (Number(a.limit)||0).toFixed(2) + " pra '" + cat + "' criado." };
}
export function editYesodBudget(a) {
  const budgets = readJSON("budgets", []);
  const found = findByField(budgets, "cat", a.cat || a.match);
  if (!found) return { ok: false, message: "Não encontrei orçamento pra '" + (a.cat || a.match) + "'." };
  writeJSON("budgets", budgets.map(b => b.id === found.id ? { ...b, limit: Number(a.limit) } : b));
  notifyYesodUpdated();
  return { ok: true, message: "Limite de '" + found.cat + "' atualizado pra R$" + Number(a.limit).toFixed(2) + "." };
}
export function deleteYesodBudget(a) {
  const budgets = readJSON("budgets", []);
  const found = findByField(budgets, "cat", a.cat || a.match);
  if (!found) return { ok: false, message: "Não encontrei orçamento pra '" + (a.cat || a.match) + "'." };
  writeJSON("budgets", budgets.filter(b => b.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Orçamento de '" + found.cat + "' removido." };
}

// ── META DE INDEPENDÊNCIA FINANCEIRA ─────────────────────────────────────────────
export function updateYesodIFGoal(a) {
  if (a.ifGoal != null) writeJSON("ifgoal", Number(a.ifGoal));
  if (a.ifMonthly != null) { writeJSON("ifmonthly", Number(a.ifMonthly)); if (a.ifGoal == null) writeJSON("ifgoal", Number(a.ifMonthly) * 300); }
  notifyYesodUpdated();
  return { ok: true, message: "Meta de Independência Financeira atualizada." };
}

// Pesos da Fórmula de Saúde Financeira (26/08/2026, ver formula_saude_financeira no
// contexto e calcYesodScore em YesodModule.jsx) — só corrige os campos informados, mantém
// os demais como estavam. Não precisam somar 100 (a fórmula normaliza sozinha).
export function updateYesodScoreWeights(a) {
  const current = readJSON("scoreweights", { savRate: 25, debt: 20, budget: 20, emergency: 20, if: 15, emergencyTargetMonths: 6 });
  const patch = {};
  ["savRate", "debt", "budget", "emergency", "if", "emergencyTargetMonths"].forEach(k => { if (a[k] != null) patch[k] = Number(a[k]); });
  const updated = { ...current, ...patch };
  writeJSON("scoreweights", updated);
  notifyYesodUpdated();
  return { ok: true, message: "Pesos da fórmula de Saúde Financeira atualizados." };
}

// ── HÁBITOS E METAS FINANCEIRAS DO YESOD ─────────────────────────────────────────
export function createYesodHabit(a) {
  const yhabits = readJSON("yhabits", []);
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  writeJSON("yhabits", [...yhabits, { id: "yh"+uid(), title, freq: a.freq || "Diário", xp: Number(a.xp) || 15, done: false }]);
  notifyYesodUpdated();
  return { ok: true, message: "Hábito financeiro '" + title + "' criado." };
}
export function toggleYesodHabit(a) {
  const yhabits = readJSON("yhabits", []);
  const found = findByField(yhabits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  if (!found.done) { const xp = readJSON("finxp", 0); writeJSON("finxp", xp + found.xp); }
  writeJSON("yhabits", yhabits.map(h => h.id === found.id ? { ...h, done: !h.done } : h));
  notifyYesodUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' marcado como " + (!found.done ? "feito" : "pendente") + "." };
}
export function deleteYesodHabit(a) {
  const yhabits = readJSON("yhabits", []);
  const found = findByField(yhabits, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei hábito com '" + a.match + "'." };
  writeJSON("yhabits", yhabits.filter(h => h.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Hábito '" + found.title + "' removido." };
}
export function createYesodGoal(a) {
  const ygoals = readJSON("ygoals", []);
  const title = (a.title || "").trim();
  if (!title) return { ok: false, message: "Título vazio." };
  writeJSON("ygoals", [...ygoals, { id: "yg"+uid(), title, xp: Number(a.xp) || 100, done: false }]);
  notifyYesodUpdated();
  return { ok: true, message: "Meta financeira '" + title + "' criada." };
}
export function toggleYesodGoal(a) {
  const ygoals = readJSON("ygoals", []);
  const found = findByField(ygoals, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei meta com '" + a.match + "'." };
  if (!found.done) { const xp = readJSON("finxp", 0); writeJSON("finxp", xp + found.xp); }
  writeJSON("ygoals", ygoals.map(g => g.id === found.id ? { ...g, done: !g.done } : g));
  notifyYesodUpdated();
  return { ok: true, message: "Meta '" + found.title + "' marcada como " + (!found.done ? "concluída" : "pendente") + "." };
}
export function deleteYesodGoal(a) {
  const ygoals = readJSON("ygoals", []);
  const found = findByField(ygoals, "title", a.match);
  if (!found) return { ok: false, message: "Não encontrei meta com '" + a.match + "'." };
  writeJSON("ygoals", ygoals.filter(g => g.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Meta '" + found.title + "' removida." };
}

// ── DIVISÃO DE DESPESAS ──────────────────────────────────────────────────────────
export function createYesodSplitPerson(a) {
  const people = readJSON("splitpeople", []);
  const name = (a.name || "").trim();
  if (!name) return { ok: false, message: "Nome vazio." };
  if (people.some(p => p.name.toLowerCase() === name.toLowerCase())) return { ok: false, message: "'" + name + "' já está cadastrada." };
  writeJSON("splitpeople", [...people, { id: "sp"+uid(), name }]);
  notifyYesodUpdated();
  return { ok: true, message: "'" + name + "' cadastrada pra dividir despesas." };
}
export function deleteYesodSplitPerson(a) {
  const people = readJSON("splitpeople", []);
  const found = findByField(people, "name", a.match);
  if (!found) return { ok: false, message: "Não encontrei '" + a.match + "'." };
  writeJSON("splitpeople", people.filter(p => p.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "'" + found.name + "' removida." };
}
// Marca (ou desmarca) a divisão de um lançamento como acertada — busca por texto na
// descrição entre todas as transações que TÊM split, mais recente desempata.
export function markYesodSplitSettled(a) {
  const accs = readJSON("accs", []);
  const banks = readJSON("banks", []);
  const q = (a.match || "").toLowerCase();
  let found = null;
  accs.forEach(acc => (acc.txs || []).forEach(t => {
    if (t.split && t.desc.toLowerCase().includes(q)) {
      if (!found || t.date > found.tx.date) found = { accId: acc.id, tx: t };
    }
  }));
  if (!found) return { ok: false, message: "Não encontrei lançamento dividido com '" + a.match + "'." };
  const settled = a.settled !== false;
  // Marcar como acertado agora lança o reembolso de verdade numa conta (25/08/2026, mesmo
  // princípio "tudo ligado a conta" da UI — ver receiveSplit em YesodModule.jsx) — antes só
  // trocava a cor, sem gerar dinheiro nenhum. Marcar como pendente de novo continua sendo só
  // correção manual do campo (não reverte um reembolso já lançado).
  if (settled && !found.tx.split.settled) {
    const acc = findAccount(accs, banks, a.account);
    if (!acc) return { ok: false, message: "Nenhuma conta cadastrada pra registrar o reembolso." };
    const theirs = Math.round(found.tx.amount * (found.tx.split.theirPercent / 100));
    const updated = accs.map(x => {
      let next = x;
      if (x.id === found.accId) next = { ...next, txs: next.txs.map(t => t.id === found.tx.id ? { ...t, split: { ...t.split, settled: true } } : t) };
      if (x.id === acc.id) next = { ...next, txs: [...next.txs, { id: "t"+uid(), desc: "Reembolso: " + found.tx.desc, amount: theirs, type: "in", date: todayS(), cat: "Reembolso", method: "ted" }] };
      return next;
    });
    writeJSON("accs", updated);
    notifyYesodUpdated();
    return { ok: true, message: "Reembolso de " + theirs + " registrado em " + acc.name + " e '" + found.tx.desc + "' marcado como acertado." };
  }
  writeJSON("accs", accs.map(acc => acc.id === found.accId ? { ...acc, txs: acc.txs.map(t => t.id === found.tx.id ? { ...t, split: { ...t.split, settled } } : t) } : acc));
  notifyYesodUpdated();
  return { ok: true, message: "'" + found.tx.desc + "' marcado como " + (settled ? "acertado" : "pendente") + "." };
}


// ── PROJEÇÃO — eventos de cenário ("e se") ───────────────────────────────────────
export function addYesodProjEvent(a) {
  const events = readJSON("projevents", []);
  writeJSON("projevents", [...events, { id: "pe"+uid(), label: a.label || "", deltaIn: Number(a.deltaIn) || 0, deltaOut: Number(a.deltaOut) || 0, fromM: Number(a.fromM) || 0 }]);
  notifyYesodUpdated();
  return { ok: true, message: "Evento" + (a.label ? " '" + a.label + "'" : "") + " adicionado à projeção." };
}
export function deleteYesodProjEvent(a) {
  const events = readJSON("projevents", []);
  const found = findByField(events, "label", a.match);
  if (!found) return { ok: false, message: "Não encontrei evento com '" + a.match + "'." };
  writeJSON("projevents", events.filter(e => e.id !== found.id));
  notifyYesodUpdated();
  return { ok: true, message: "Evento removido da projeção." };
}
export function clearYesodProjEvents() {
  writeJSON("projevents", []);
  notifyYesodUpdated();
  return { ok: true, message: "Cenário de projeção resetado." };
}

// ── DASHBOARD (indicadores da aba Yesod) ─────────────────────────────────────────
export const DASHBOARD_CARD_IDS = ["poupanca","if","dividas","orcamento","habitos","metas","patrimonio","receita","despesa","saldo_mes","investido","contas"];
export function addYesodDashboardCard(a) {
  if (!DASHBOARD_CARD_IDS.includes(a.cardId)) return { ok: false, message: "Indicador '" + a.cardId + "' não existe. Válidos: " + DASHBOARD_CARD_IDS.join(", ") + "." };
  const cards = readJSON("yesodcards", []);
  if (cards.includes(a.cardId)) return { ok: false, message: "Indicador '" + a.cardId + "' já está no painel." };
  writeJSON("yesodcards", [...cards, a.cardId]);
  notifyYesodUpdated();
  return { ok: true, message: "Indicador '" + a.cardId + "' adicionado ao painel." };
}
export function removeYesodDashboardCard(a) {
  const cards = readJSON("yesodcards", []);
  if (!cards.includes(a.cardId)) return { ok: false, message: "Indicador '" + a.cardId + "' não está no painel." };
  writeJSON("yesodcards", cards.filter(c => c !== a.cardId));
  notifyYesodUpdated();
  return { ok: true, message: "Indicador '" + a.cardId + "' removido do painel." };
}
export function setYesodDashboardCards(a) {
  const cardIds = Array.isArray(a.cardIds) ? a.cardIds.filter(id => DASHBOARD_CARD_IDS.includes(id)) : null;
  if (!cardIds) return { ok: false, message: "Lista de indicadores inválida." };
  writeJSON("yesodcards", cardIds);
  notifyYesodUpdated();
  return { ok: true, message: "Painel de indicadores atualizado (" + cardIds.length + " ativos)." };
}

export const YESOD_ACTION_HANDLERS = {
  create_transaction: createYesodTransaction,
  edit_transaction: editYesodTransaction,
  delete_transaction: deleteYesodTransaction,
  create_category: createYesodCategory,
  delete_category: deleteYesodCategory,
  delete_recurring: deleteYesodRecurring,
  toggle_recurring: toggleYesodRecurring,
  edit_recurring: editYesodRecurring,
  create_bank: createYesodBank,
  edit_bank: editYesodBank,
  delete_bank: deleteYesodBank,
  create_account: createYesodAccount,
  edit_account: editYesodAccount,
  delete_account: deleteYesodAccount,
  create_card: createYesodCard,
  edit_card: editYesodCard,
  delete_card: deleteYesodCard,
  create_box: createYesodBox,
  edit_box: editYesodBox,
  delete_box: deleteYesodBox,
  box_move: boxMoveYesod,
  create_debt: createYesodDebt,
  edit_debt: editYesodDebt,
  delete_debt: deleteYesodDebt,
  pay_debt: payYesodDebt,
  amortize_debt: amortizeYesodDebt,
  settle_debt: settleYesodDebt,
  create_investment: createYesodInvestment,
  edit_investment: editYesodInvestment,
  delete_investment: deleteYesodInvestment,
  update_investment_balance: updateYesodInvestmentBalance,
  invest_aportar: investAportarYesod,
  invest_resgatar: investResgatarYesod,
  create_budget: createYesodBudget,
  edit_budget: editYesodBudget,
  delete_budget: deleteYesodBudget,
  update_if_goal: updateYesodIFGoal,
  update_score_weights: updateYesodScoreWeights,
  create_yhabit: createYesodHabit,
  toggle_yhabit: toggleYesodHabit,
  delete_yhabit: deleteYesodHabit,
  create_ygoal: createYesodGoal,
  toggle_ygoal: toggleYesodGoal,
  delete_ygoal: deleteYesodGoal,
  add_dashboard_card: addYesodDashboardCard,
  remove_dashboard_card: removeYesodDashboardCard,
  set_dashboard_cards: setYesodDashboardCards,
  create_split_person: createYesodSplitPerson,
  delete_split_person: deleteYesodSplitPerson,
  mark_split_settled: markYesodSplitSettled,
  add_proj_event: addYesodProjEvent,
  delete_proj_event: deleteYesodProjEvent,
  clear_proj_events: clearYesodProjEvents,
};
