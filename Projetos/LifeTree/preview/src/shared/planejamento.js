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
