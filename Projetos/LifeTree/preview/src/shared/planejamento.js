import { normalizarTreino } from "./treino.js";
// Planejamento do objetivo (06/11/2026, pedido do usuário — hierarquia tipo OKR).
// A aba Objetivos só PLANEJA: objetivo → resultados-chave (alvos) → metas da semana →
// linha do tempo (fases, cada uma termina num marco) → rotina → impactos.
// O acompanhamento fica nas outras abas e será ligado depois. Tudo que é número dependente
// de conta (marcos de peso) é calculado aqui, nunca escrito pelo Coach.

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const diaUTC = (s) => Date.parse(s + "T12:00:00Z");
const somaDias = (s, n) => { const d = new Date(diaUTC(s) + n * 86400000); return d.toISOString().slice(0, 10); };

// Resultados-chave: alvos do plano. O peso-alvo vem da dieta (fonte única).
export function normalizarResultados(r = {}) {
  const pct = (v, padrao) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(100, n) : padrao; };
  const g = Number(r.gordura_pct);
  return { treino_pct: pct(r.treino_pct, 85), dieta_pct: pct(r.dieta_pct, 85), gordura_pct: Number.isFinite(g) && g > 0 ? Math.round(g * 10) / 10 : null };
}

// Data final da fase a partir do período escrito no passo:
// "06/11 a 30/11/2026" → 2026-11-30 · "Semanas 1-4" → início + 28 dias · "Semana 5" → início + 35.
export function fimDaFase(periodo, inicio, prazo) {
  const p = String(periodo || "");
  const datas = [...p.matchAll(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g)];
  if (datas.length) {
    const [, d, m, a] = datas[datas.length - 1];
    let ano = a ? (a.length === 2 ? 2000 + Number(a) : Number(a)) : Number((prazo || iso(new Date())).slice(0, 4));
    let s = ano + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    if (!a && prazo && s > prazo) { ano -= 1; s = ano + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
    return ISO.test(s) && !Number.isNaN(diaUTC(s)) ? s : null;
  }
  const sem = p.match(/semanas?\s*(\d+)(?:\s*(?:-|–|a|até)\s*(\d+))?/i);
  if (sem && ISO.test(inicio || "")) return somaDias(inicio, 7 * Number(sem[2] || sem[1]));
  return null;
}

// Peso esperado numa data, pelo ritmo do quadro de dieta, sem passar do peso-meta.
export function pesoEsperado(dieta, kgSemana, inicio, data) {
  const atual = Number(dieta?.peso_kg), meta = Number(dieta?.peso_meta_kg), kg = Math.abs(Number(kgSemana));
  if (!atual || !meta || !kg || !ISO.test(inicio || "") || !ISO.test(data || "")) return null;
  const semanas = Math.max(0, (diaUTC(data) - diaUTC(inicio)) / (7 * 86400000));
  const p = meta < atual ? Math.max(meta, atual - kg * semanas) : Math.min(meta, atual + kg * semanas);
  return Math.round(p * 10) / 10;
}

export const kgBR = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " kg";
const dataCurta = (s) => s.slice(8, 10) + "/" + s.slice(5, 7);

// Função para o PlanoCard: texto do marco no fim de cada fase, ou null.
export function marcosDoObjetivo({ dieta, macros, inicio, prazo }) {
  if (!dieta || !macros?.ok) return null;
  return (periodo) => {
    const fim = fimDaFase(periodo, inicio, prazo);
    const p = fim && pesoEsperado(dieta, macros.kgSemana, inicio, fim);
    return p ? "Marco: " + kgBR(p) + " em " + dataCurta(fim) : null;
  };
}

// Rotina (hábitos recorrentes) mora em plano.rotina. Planos antigos tinham um só
// "habitoSugerido": vira o primeiro item da rotina.
export function comRotina(pl) {
  if (!pl || Array.isArray(pl.rotina)) return pl;
  return { ...pl, rotina: pl.habitoSugerido ? [pl.habitoSugerido] : [] };
}

// ── Fases executáveis (06/11/2026, pedido do usuário) ────────────────────────────────
// Cada fase da linha do tempo = { id, title ("DD/MM a DD/MM/AAAA: nome"), done, semana
// (treinos/cardio/divisão da fase), tarefas [{ id, texto, ate, done }], revisao }.
// Na Saúde as tarefas ficam só descritas; quem marca é o Controle (Malkuth), e o % de
// tarefas feitas é o gauge do cartão do objetivo.
const rid = (p) => p + Math.random().toString(36).slice(2, 8);

export function normalizarTarefa(t) {
  const texto = String(typeof t === "string" ? t : t?.texto || "").trim();
  const ate = typeof t === "object" && ISO.test(t?.ate || "") ? t.ate : null;
  return { id: (typeof t === "object" && t?.id) || rid("tf"), texto, ate, done: !!(typeof t === "object" && t?.done) };
}

export function normalizarFase(s) {
  if (typeof s === "string") return { id: rid("st"), title: s, done: false };
  const periodo = String(s?.periodo || "").trim(), nome = String(s?.titulo || s?.title || "").trim();
  return {
    id: s?.id || rid("st"),
    title: periodo && !nome.startsWith(periodo) ? periodo + ": " + nome : nome,
    done: !!s?.done,
    ...(s?.semana ? { semana: normalizarTreino(s.semana) } : {}),
    tarefas: (Array.isArray(s?.tarefas) ? s.tarefas : []).map(normalizarTarefa).filter((t) => t.texto),
    ...(s?.revisao ? { revisao: String(s.revisao).trim() } : {}),
  };
}

// Período "DD/MM a DD/MM/AAAA" do início do título (mesma regra do partesDoPasso).
const periodoDe = (title) => (String(title || "").match(/^([^:]{3,40}):/) || [])[1] || "";

export function limitesDasFases(steps = [], inicio, prazo) {
  let ini = ISO.test(inicio || "") ? inicio : iso(new Date());
  return steps.map((s) => {
    const fim = fimDaFase(periodoDe(s.title), inicio, prazo);
    const r = { inicio: ini, fim };
    if (fim) ini = fim;
    return r;
  });
}

// Fase de hoje: a primeira que ainda não terminou (ou a última).
export function indiceFaseAtual(steps = [], inicio, prazo, hoje = iso(new Date())) {
  const lim = limitesDasFases(steps, inicio, prazo);
  const i = lim.findIndex((l) => l.fim && l.fim >= hoje);
  return i >= 0 ? i : Math.max(0, steps.length - 1);
}

// Meta de treino em vigor: a da fase atual, se as fases tiverem; senão a do plano.
export function treinoAtual(o) {
  const steps = o?.plano?.steps || [];
  if (o?.semTreino) return null;
  if (steps.some((s) => s.semana)) {
    const i = indiceFaseAtual(steps, o.criado, o.prazo);
    const s = steps[i]?.semana ? steps[i] : steps.find((x) => x.semana);
    return { ...normalizarTreino(s.semana), fase: steps.indexOf(s), fim: limitesDasFases(steps, o.criado, o.prazo)[steps.indexOf(s)]?.fim || null };
  }
  return null;
}

// Totais até o prazo somando fase por fase (cada uma com a sua meta semanal).
export function totaisDasFases(steps = [], inicio, prazo) {
  if (!steps.length || !steps.every((s) => s.semana)) return null;
  const lim = limitesDasFases(steps, inicio, prazo);
  if (lim.some((l) => !l.fim)) return null;
  let treinos = 0, cardio = 0, dias = 0;
  steps.forEach((s, i) => {
    const d = Math.max(0, Math.round((diaUTC(lim[i].fim) - diaUTC(lim[i].inicio)) / 86400000));
    dias += d; treinos += (s.semana.treinos_semana * d) / 7; cardio += (s.semana.cardio_min_semana * d) / 7;
  });
  return { dias, treinos: Math.round(treinos), cardio: Math.round(cardio) };
}

// Execução = tarefas concluídas ÷ tarefas do plano (gauge do cartão).
export function execucaoDoPlano(plano) {
  const ts = (plano?.steps || []).flatMap((s) => s.tarefas || []);
  const feitas = ts.filter((t) => t.done).length;
  return { feitas, total: ts.length, pct: ts.length ? Math.round((feitas / ts.length) * 100) : 0 };
}
