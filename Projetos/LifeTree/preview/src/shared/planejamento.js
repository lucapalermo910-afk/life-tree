import { normalizarTreino } from "./treino.js";
import { calcularMacros, gastoDiario, dietaDoObjetivo } from "./macros.js";
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

// ── Trocar o prazo (07/11/2026, pedido do usuário) ───────────────────────────────────
// O prazo é o fim do plano: ao trocá-lo, a última etapa passa a terminar nele e a data
// do prazo antigo escrita em "O objetivo" vira a nova. Devolve os campos a gravar.
const br = (s) => s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4);
export function ajustarPrazo(o, novo) {
  if (!ISO.test(novo || "")) return { prazo: novo || null };
  const campos = { prazo: novo };
  if (o.prazo && o.descricao && o.descricao.includes(br(o.prazo))) campos.descricao = o.descricao.split(br(o.prazo)).join(br(novo));
  const steps = o.plano?.steps || [];
  const ult = steps[steps.length - 1];
  if (ult) {
    const m = String(ult.title || "").match(/^([^:]{3,40}):([\s\S]*)$/);
    const periodo = m ? m[1] : "";
    const datas = [...periodo.matchAll(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g)];
    // Início da última etapa: a 1ª data escrita no período (ou o fim da etapa anterior).
    const lim = limitesDasFases(steps, o.criado, o.prazo);
    const inicioUlt = datas.length >= 2 ? fimDaFase(datas[0][0], o.criado, o.prazo) : lim[lim.length - 1]?.inicio;
    if (datas.length && (!inicioUlt || novo > inicioUlt)) {
      const d = datas[datas.length - 1];
      const novoPeriodo = periodo.slice(0, d.index) + br(novo) + periodo.slice(d.index + d[0].length);
      campos.plano = { ...o.plano, steps: steps.map((s, i) => (i === steps.length - 1 ? { ...s, title: novoPeriodo + ":" + m[2] } : s)) };
    }
  }
  return campos;
}


// ── Simulação dia a dia (07/11/2026, pedido do usuário: "estimar tudo o mais próximo do
// comportamento real possível, considerando a queda do metabolismo basal") ─────────────
// Em cada etapa as calorias são planejadas no início dela, com o peso esperado naquele dia e
// a meta de treino/cardio da etapa. Dentro da etapa o peso cai dia a dia pelo déficit real
// (gasto do dia, recalculado com o peso do dia, − calorias planejadas) ÷ 7.700. Depois da
// última etapa, segue com a mesma rotina, replanejando a cada 4 semanas, até a meta.
// Devolve: `atual` (metas de hoje, com chegada/pesoNoPrazo/semanas), `marcos[i]` (texto do
// marco no fim da etapa i), `etapas[i]` (metas planejadas da etapa), `chegada`, `pesoNoPrazo`.
const LIMITE_DIAS = 3 * 365;
export function simularPlano({ dieta, ajustes = {}, steps = [], inicio, prazo, hoje = iso(new Date()) }) {
  const peso0 = Number(dieta?.peso_kg), meta = Number(dieta?.peso_meta_kg);
  if (!peso0 || !meta) return null;
  const ini = ISO.test(inicio || "") ? inicio : hoje;
  const semanaPadrao = { treinos_semana: Number(dieta.treinos_semana) || 0, cardio_min_semana: Number(dieta.cardio_min_semana) || 0 };
  const lim = limitesDasFases(steps, ini, prazo);
  const blocos = steps.map((s, i) => ({ i, ini: lim[i].inicio, fim: lim[i].fim, semana: s.semana || null })).filter((b) => b.fim && b.fim > b.ini);
  let ultimaSemana = semanaPadrao;
  blocos.forEach((b) => { b.semana = b.semana || ultimaSemana; ultimaSemana = b.semana; });
  if (!blocos.length) blocos.push({ i: null, ini, fim: ISO.test(prazo || "") ? prazo : somaDias(ini, 7 * 26), semana: semanaPadrao });
  const perder = meta < peso0, ganhar = meta > peso0;
  const comSemana = (w, sem) => ({ ...dieta, peso_kg: Math.round(w * 10) / 10, treinos_semana: sem.treinos_semana, cardio_min_semana: sem.cardio_min_semana });

  let w = peso0, d = ini, k = 0, plano = null, planoDesde = null, chegada = null, pesoNoPrazo = null, atual = null;
  const etapas = [], pesoFim = {}, pesoEm = {};
  for (let n = 0; n <= LIMITE_DIAS; n++) {
    while (k < blocos.length - 1 && d > blocos[k].fim) k++;
    const b = blocos[k], depois = d > b.fim;
    const sem = b.semana;
    if (!plano || (planoDesde !== k && !depois) || (depois && n % 28 === 0)) {
      plano = calcularMacros(comSemana(w, sem), { ...ajustes, objetivo: perder ? "perder" : ganhar ? "ganhar" : "manter" }); planoDesde = depois ? planoDesde : k;
      if (!plano.ok) return null;
      if (!depois && b.i != null) etapas[b.i] = { inicio: d, ...plano };
    }
    if (!atual && d >= hoje) atual = plano;
    pesoEm[d] = Math.round(w * 10) / 10;
    if (prazo && d === prazo) pesoNoPrazo = Math.round(w * 10) / 10;
    if (b.i != null && d === b.fim) pesoFim[b.i] = Math.round(w * 10) / 10;
    if (!chegada && ((perder && w <= meta + 0.05) || (ganhar && w >= meta - 0.05) || (!perder && !ganhar))) chegada = d;
    if (chegada && (!prazo || d >= prazo) && d >= blocos[blocos.length - 1].fim) break;
    const gasto = gastoDiario(w, comSemana(w, sem)).total;
    w -= (gasto - plano.cal) / 7700;
    if (perder) w = Math.max(meta, w); if (ganhar) w = Math.min(meta, w);
    d = somaDias(d, 1);
  }
  if (!atual) atual = plano;
  const semanas = chegada ? Math.max(0, Math.ceil((diaUTC(chegada) - diaUTC(hoje)) / (7 * 86400000))) : null;
  const dataBR = (x) => x.slice(8, 10) + "/" + x.slice(5, 7);
  const marcos = steps.map((s, i) => (pesoFim[i] != null && lim[i]?.fim ? "Marco: " + kgBR(pesoFim[i]) + " em " + dataBR(lim[i].fim) : null));
  return { atual: { ...atual, chegada, pesoNoPrazo, semanas, simulado: true }, marcos, etapas, chegada, pesoNoPrazo, pesoFim, pesoEm };
}

// Dados de entrada da simulação para um objetivo salvo (dieta guardada ou reconstruída).
export function simularObjetivo(o, perfil = {}) {
  if (!o?.macros && !o?.dieta) return null;
  const base = dietaDoObjetivo(o, perfil);
  const semFases = !(o.plano?.steps || []).some((s) => s.semana);
  const dieta = semFases && o.treino ? { ...base, treinos_semana: o.treino.treinos_semana, cardio_min_semana: o.treino.cardio_min_semana } : base;
  return simularPlano({ dieta, ajustes: o.ajustes || {}, steps: o.plano?.steps || [], inicio: o.criado, prazo: o.prazo });
}

// ── A data é resultado do plano (07/11/2026, pedido do usuário: "o objetivo é bater 70 kg;
// a data quem dá é o Coach") ──────────────────────────────────────────────────────────
// Em objetivo com dieta, o prazo é a data estimada pela simulação. Mudou ritmo, cardio,
// treino ou peso-meta → a data, a última etapa e a data em "O objetivo" acompanham.
// Tolerância de 2 dias para não ficar oscilando por arredondamento.
export function alinharPrazoAoPlano(o, perfil = {}) {
  // Peso-meta mudou → o número em "O objetivo" acompanha ("Chegar a 75 kg" → "Chegar a 70 kg").
  const meta = Number(o.dieta?.peso_meta_kg);
  const mk = String(o.descricao || "").match(/(\d+(?:[.,]\d+)?)\s?kg/);
  if (meta && mk && Number(mk[1].replace(",", ".")) !== meta) {
    o = { ...o, descricao: o.descricao.replace(mk[0], String(meta).replace(".", ",") + " kg") };
  }
  const sim = simularObjetivo(o, perfil);
  const alvo = sim?.chegada;
  if (!alvo) return o;
  if (o.prazo && Math.abs(diaUTC(alvo) - diaUTC(o.prazo)) <= 2 * 86400000) return o;
  let n = { ...o, ...ajustarPrazo(o, alvo) };
  if (n.descricao && !/\d{1,2}\/\d{1,2}\/\d{4}/.test(n.descricao)) n.descricao = n.descricao.replace(/\s*$/, "") + " em " + br(alvo);
  const m = simularObjetivo(n, perfil)?.atual;
  if (m?.ok) n = { ...n, macros: m };
  return n;
}
export const prazoPeloPlano = (o) => !!(o?.macros || o?.dieta);

// Opções para encurtar ou alongar (o Coach oferece; o app calcula a data de cada uma).
// Cada cenário traz as mudanças prontas para update_objective.
export function cenariosDoObjetivo(o, perfil = {}) {
  if (!prazoPeloPlano(o)) return [];
  const base = dietaDoObjetivo(o, perfil), peso = Number(base.peso_kg);
  const steps = o.plano?.steps || [];
  const comCardio = (extra) => steps.map((s) => (s.semana ? { ...s, semana: { ...s.semana, cardio_min_semana: s.semana.cardio_min_semana + extra } } : s));
  const etapasCardio = (extra) => steps.map((s, i) => (s.semana ? { op: "editar", etapa: i + 1, semana: { cardio_min_semana: s.semana.cardio_min_semana + extra } } : null)).filter(Boolean);
  const opcoes = [
    { nome: "Ritmo padrão (~0,7% do peso por semana)", ajustes: { ...(o.ajustes || {}), kgSemana: undefined }, mud: { ajustes: { kgSemana: null } } },
    { nome: "Ritmo mais suave (~0,5% por semana)", ajustes: { kgSemana: Math.round(peso * 0.005 * 100) / 100 }, mud: { ajustes: { kgSemana: Math.round(peso * 0.005 * 100) / 100 } } },
    { nome: "Ritmo agressivo (~1% por semana; calorias podem ficar no mínimo seguro)", ajustes: { kgSemana: Math.round(peso * 0.01 * 100) / 100 }, mud: { ajustes: { kgSemana: Math.round(peso * 0.01 * 100) / 100 } } },
    // Com as calorias no mínimo seguro, só mais gasto encurta: cardio extra vira déficit extra.
    { nome: "Máximo seguro: calorias no mínimo + 15 min de cardio por dia", ajustes: { kgSemana: Math.round(peso * 0.02 * 100) / 100 }, steps: comCardio(105),
      mud: { ajustes: { kgSemana: Math.round(peso * 0.02 * 100) / 100 }, etapas: etapasCardio(105) } },
    { nome: "Máximo seguro: calorias no mínimo + 30 min de cardio por dia", ajustes: { kgSemana: Math.round(peso * 0.02 * 100) / 100 }, steps: comCardio(210),
      mud: { ajustes: { kgSemana: Math.round(peso * 0.02 * 100) / 100 }, etapas: etapasCardio(210) } },
  ];
  return opcoes.map((c) => {
    const aj = { ...c.ajustes }; Object.keys(aj).forEach((k) => aj[k] === undefined && delete aj[k]);
    const s = simularObjetivo({ ...o, ajustes: aj, plano: { ...o.plano, steps: c.steps || steps } }, perfil);
    return { nome: c.nome, data_estimada: s?.chegada || null, calorias_hoje: s?.atual?.cal ?? null, no_minimo_seguro: !!s?.atual?.limitadoPeloPiso, mudancas: c.mud };
  });
}


// ── Verificação dos dados registrados × plano (08/11/2026, pedido do usuário: o Coach "precisa
// ser capaz de verificar os dados imputados") ─────────────────────────────────────────────
// Tudo calculado aqui; o Coach só lê e explica. `d` = dados do módulo Saúde:
// { pesagens [{data,peso}], logTreino [{data,horaFim}], logDieta [{data,alimentoId,qtd}],
//   alimentos [{id,cal100,prot}], metas {cal,prot}, agua {meta}, rotinasTreino [], perfil, pesosMeta }.
const diasEntre = (a, b) => Math.round((diaUTC(b) - diaUTC(a)) / 86400000);
const r1 = (x) => Math.round(x * 10) / 10;
export function verificarObjetivo(o, d, hoje = iso(new Date())) {
  const alertas = [];
  const sim = simularObjetivo(o, d.perfil || {});
  const dieta = o.macros || o.dieta ? dietaDoObjetivo(o, d.perfil || {}) : null;
  const inicio = o.criado || hoje;
  const steps = o.plano?.steps || [];
  const lim = limitesDasFases(steps, inicio, o.prazo);
  const iAtual = indiceFaseAtual(steps, inicio, o.prazo, hoje);
  const semanaAtual = steps[iAtual]?.semana || o.treino || null;

  // Pesagens: ponto de partida, tendência real e comparação com o esperado pela simulação.
  const pes = [...(d.pesagens || [])].filter((p) => p?.data && Number(p.peso)).sort((a, b) => a.data.localeCompare(b.data));
  const ult = pes[pes.length - 1] || null;
  const desde = (dias) => pes.filter((p) => diasEntre(p.data, hoje) <= dias);
  const media7 = desde(7).length ? r1(desde(7).reduce((s, p) => s + Number(p.peso), 0) / desde(7).length) : null;
  let ritmoReal = null;
  const j = desde(28);
  if (j.length >= 2 && diasEntre(j[0].data, j[j.length - 1].data) >= 7) {
    const xs = j.map((p) => diasEntre(j[0].data, p.data)), ys = j.map((p) => Number(p.peso));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    const inc = xs.reduce((s, x, k) => s + (x - mx) * (ys[k] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    ritmoReal = Math.round(-inc * 7 * 100) / 100; // kg perdidos por semana (positivo = perdendo)
  }
  const esperadoHoje = sim?.pesoEm?.[hoje] ?? null;
  const pesagens = { registros: pes.length, ultima: ult ? { data: ult.data, peso: Number(ult.peso) } : null, media_7_dias: media7,
    ritmo_real_kg_semana: ritmoReal, ritmo_planejado_kg_semana: sim?.atual?.kgSemana ?? null, peso_esperado_hoje: esperadoHoje,
    diferenca_para_o_esperado: media7 != null && esperadoHoje != null ? r1(media7 - esperadoHoje) : null };
  if (!pes.length) alertas.push("Nenhuma pesagem registrada: o plano parte de " + (dieta?.peso_kg ?? "?") + " kg sem confirmação, e os marcos não têm referência real.");
  else if (dieta && Math.abs(Number(pes.find((p) => p.data >= inicio)?.peso ?? ult.peso) - Number(dieta.peso_kg)) >= 1)
    alertas.push("Ponto de partida diferente: o plano usa " + dieta.peso_kg + " kg e a primeira pesagem desde o início é " + (pes.find((p) => p.data >= inicio)?.peso ?? ult.peso) + " kg.");
  if (ult && diasEntre(ult.data, hoje) > 10) alertas.push("Última pesagem há " + diasEntre(ult.data, hoje) + " dias.");
  if (pesagens.diferenca_para_o_esperado != null && Math.abs(pesagens.diferenca_para_o_esperado) >= 1)
    alertas.push("Peso (média de 7 dias) " + (pesagens.diferenca_para_o_esperado > 0 ? "acima" : "abaixo") + " do esperado em " + Math.abs(pesagens.diferenca_para_o_esperado) + " kg.");

  // Treinos: feitos × planejados na etapa atual e nas últimas 4 semanas.
  const feitos = (d.logTreino || []).filter((l) => l?.data && l.horaFim);
  const abertos = (d.logTreino || []).filter((l) => l?.data && !l.horaFim && l.data < hoje).length;
  const iniEtapa = lim[iAtual]?.inicio || inicio;
  const nEtapa = feitos.filter((l) => l.data >= iniEtapa && l.data <= hoje).length;
  const diasEtapa = Math.max(1, diasEntre(iniEtapa, hoje) + 1);
  const planejadosEtapa = semanaAtual ? r1((semanaAtual.treinos_semana * diasEtapa) / 7) : null;
  const n28 = feitos.filter((l) => diasEntre(l.data, hoje) < 28 && l.data <= hoje).length;
  const treinos = { na_etapa_atual: nEtapa, planejados_ate_hoje_na_etapa: planejadosEtapa,
    aderencia_pct: planejadosEtapa ? Math.round((nEtapa / Math.max(planejadosEtapa, 1)) * 100) : null, ultimos_28_dias: n28,
    alvo_pct: o.krs?.treino_pct ?? null, rotinas_cadastradas: (d.rotinasTreino || []).length, tipo_de_treino: semanaAtual?.divisao || null,
    cardio: "o app ainda não registra minutos de cardio separados" };
  if (semanaAtual && treinos.aderencia_pct != null && diasEtapa >= 7 && treinos.aderencia_pct < (o.krs?.treino_pct ?? 85))
    alertas.push("Treinos na etapa atual: " + nEtapa + " de ~" + planejadosEtapa + " planejados (" + treinos.aderencia_pct + "%), abaixo do alvo de " + (o.krs?.treino_pct ?? 85) + "%.");
  if (semanaAtual && (d.rotinasTreino || []).length < semanaAtual.divisao.length)
    alertas.push("Tipo de treino " + semanaAtual.divisao + " pede " + semanaAtual.divisao.length + " rotinas, e há " + (d.rotinasTreino || []).length + " cadastradas.");
  if (abertos) alertas.push(abertos + " treino(s) de dias anteriores ficaram sem finalizar.");

  // Dieta: últimos 14 dias do diário contra as metas.
  const al = new Map((d.alimentos || []).map((a) => [a.id, a]));
  const porDia = {};
  (d.logDieta || []).forEach((l) => {
    if (!l?.data || diasEntre(l.data, hoje) >= 14 || l.data > hoje) return;
    const a = al.get(l.alimentoId); if (!a) return;
    const x = (porDia[l.data] ||= { cal: 0, prot: 0 });
    x.cal += ((Number(a.cal100) || 0) * (Number(l.qtd) || 0)) / 100; x.prot += ((Number(a.prot) || 0) * (Number(l.qtd) || 0)) / 100;
  });
  const metaCal = d.metas?.cal || sim?.atual?.cal, metaProt = d.metas?.prot || sim?.atual?.prot;
  const diasReg = Object.values(porDia);
  const dentro = diasReg.filter((x) => metaCal && Math.abs(x.cal - metaCal) <= metaCal * 0.1 && (!metaProt || x.prot >= metaProt * 0.9)).length;
  const dietaV = { dias_com_registro_14d: diasReg.length, dias_dentro_da_meta_14d: dentro,
    media_kcal_registrada: diasReg.length ? Math.round(diasReg.reduce((s, x) => s + x.cal, 0) / diasReg.length) : null,
    media_prot_registrada_g: diasReg.length ? Math.round(diasReg.reduce((s, x) => s + x.prot, 0) / diasReg.length) : null,
    meta_kcal: metaCal ?? null, meta_prot_g: metaProt ?? null, alvo_pct: o.krs?.dieta_pct ?? null,
    observacao: "diário alimentar costuma subestimar o consumo; a tendência do peso é o dado mais confiável" };
  if (o.macros && diasEntre(inicio, hoje) >= 3 && diasReg.length < Math.min(7, diasEntre(inicio, hoje)))
    alertas.push("Alimentação registrada em " + diasReg.length + " dos últimos " + Math.min(14, diasEntre(inicio, hoje) + 1) + " dias: não dá para medir a dieta.");
  if (!(Number(d.agua?.meta) > 0)) alertas.push("Meta de água está em 0 ml.");

  // Tarefas do plano.
  const ts = steps.flatMap((s, i) => (s.tarefas || []).map((t) => ({ ...t, etapa: i + 1 })));
  const atrasadas = ts.filter((t) => !t.done && t.ate && t.ate < hoje).map((t) => ({ etapa: t.etapa, texto: t.texto, ate: t.ate }));
  const proximas = ts.filter((t) => !t.done && t.ate && t.ate >= hoje && diasEntre(hoje, t.ate) <= 7).map((t) => ({ etapa: t.etapa, texto: t.texto, ate: t.ate }));
  if (atrasadas.length) alertas.push(atrasadas.length + " tarefa(s) atrasada(s): " + atrasadas.map((t) => t.texto).join("; ") + ".");

  // Consistência entre o que foi digitado em lugares diferentes.
  const pf = d.perfil || {};
  if (dieta && pf.altura && Number(pf.altura) !== Number(dieta.altura_cm)) alertas.push("Altura diferente no perfil (" + pf.altura + ") e no plano (" + dieta.altura_cm + ").");
  if (dieta && pf.idade && Number(pf.idade) !== Number(dieta.idade)) alertas.push("Idade diferente no perfil (" + pf.idade + ") e no plano (" + dieta.idade + ").");
  if (dieta && d.pesosMeta?.pesoMeta && Number(d.pesosMeta.pesoMeta) !== Number(dieta.peso_meta_kg))
    alertas.push("Peso-meta da aba de medidas (" + d.pesosMeta.pesoMeta + " kg) diferente do objetivo (" + dieta.peso_meta_kg + " kg).");
  (o.plano?.rotina || []).forEach((r) => { if (/\d+\s?(g|kcal|kg)\b/i.test(r)) alertas.push("Rotina com número fixo que pode ficar desatualizado: \"" + r + "\"."); });
  if ((o.plano?.rotina || []).some((r) => /pes\w*[^.]*1x por semana|pes\w*[^.]*semanal/i.test(r)))
    alertas.push("A rotina diz pesar 1x por semana; com pesagem diária o app compara a média de 7 dias e avisa quando sair do plano.");

  return { hoje, etapa_atual: iAtual + 1, pesagens, treinos, dieta: dietaV, tarefas: { atrasadas, proximas_7_dias: proximas,
    feitas: ts.filter((t) => t.done).length, total: ts.length }, alertas };
}

// ── Tarefas que se completam sozinhas (08/11/2026, pedido do usuário) ─────────────────
// Tarefa reconhecível pelo texto é marcada quando o registro correspondente aparece a partir
// do início da etapa dela: pesagem → "pesar/pesagem"; medidas → "medir/medida/cintura";
// rotinas cadastradas ≥ treinos do tipo de treino → "montar/criar/cadastrar … treino(s)/rotina".
// Nunca desmarca. Marca `auto` com o motivo, para o Controle mostrar "feita automaticamente".
const REGRAS_AUTO = [
  { tipo: "pesagem", re: /\b(pes(ar|e|agem|agens)|registrar (o )?peso)\b/i },
  { tipo: "medidas", re: /\b(medir|medidas?|cintura)\b/i },
  { tipo: "rotinas", re: /\b(montar|criar|cadastrar)\b[^.]*\b(treinos?|rotinas?)\b/i },
];
// Todos os tipos que a tarefa cita ("Pesagem e medidas finais" → pesagem + medidas: precisa dos dois).
export function tiposAutomaticos(texto) { return REGRAS_AUTO.filter((r) => r.re.test(String(texto || ""))).map((r) => r.tipo); }
export const tipoAutomatico = (texto) => tiposAutomaticos(texto)[0] || null;

export function autoConcluirTarefas(objetivos, d) {
  let mudou = false;
  const pes = (d.pesagens || []).filter((p) => p?.data), med = (d.medidasCorp || []).filter((m) => m?.data);
  const nRotinas = (d.rotinasTreino || []).length;
  const novos = (objetivos || []).map((o) => {
    const steps = o.plano?.steps || [];
    if (!steps.some((s) => s.tarefas?.length)) return o;
    const lim = limitesDasFases(steps, o.criado, o.prazo);
    let mudouO = false;
    const st = steps.map((s, i) => {
      if (!s.tarefas?.length) return s;
      const ini = lim[i]?.inicio || o.criado || "0000-00-00";
      const precisa = (s.semana?.divisao || "").length || 1;
      const ts = s.tarefas.map((t) => {
        if (t.done) return t;
        const tipos = tiposAutomaticos(t.texto);
        if (!tipos.length) return t;
        // Janela: desde o início da etapa, mas no máximo 7 dias antes do "até" — assim
        // "pesagem final" (até 31/03) não se completa com a pesagem de 01/02.
        let desde = ini;
        if (t.ate && ISO.test(t.ate)) { const j = somaDias(t.ate, -7); if (j > desde) desde = j; }
        const ok = tipos.every((tipo) => (tipo === "pesagem" ? pes.some((p) => p.data >= desde)
          : tipo === "medidas" ? med.some((m) => m.data >= desde) : nRotinas >= precisa));
        if (!ok) return t;
        mudouO = true;
        return { ...t, done: true, auto: tipos[0] };
      });
      return mudouO ? { ...s, tarefas: ts } : s;
    });
    if (!mudouO) return o;
    mudou = true;
    return { ...o, plano: { ...o.plano, steps: st } };
  });
  return mudou ? novos : objetivos;
}

// ── Tarefa leva ao lugar de executá-la (08/11/2026, pedido do usuário) ─────────────────
// Tocar na tarefa no Controle abre a tela onde ela se faz. Sem lugar no app: agenda (Google
// Agenda com o evento preenchido) ou a etapa no plano.
export function destinoDaTarefa(t) {
  const x = String(t?.texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const tipos = tiposAutomaticos(t?.texto);
  if (tipos.includes("pesagem")) return { moduleId: "geburah", tab: "medidas", abrir: "registrarPeso", rotulo: "Registrar peso" };
  if (tipos.includes("medidas")) return { moduleId: "geburah", tab: "medidas", rotulo: "Registrar medidas" };
  if (tipos.includes("rotinas")) return { moduleId: "geburah", tab: "treino", abrir: "addRotina", rotulo: "Criar rotina" };
  if (/\b(agenda|agendar|horario|fixar|consulta|medico|marcar)\b/.test(x)) {
    const d = (t.ate || iso(new Date())).replace(/-/g, ""), d2 = somaDias(t.ate || iso(new Date()), 1).replace(/-/g, "");
    return { agenda: true, rotulo: "Pôr na agenda",
      url: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(t.texto) + "&dates=" + d + "/" + d2 + "&details=" + encodeURIComponent("Tarefa do plano no LifeTree") };
  }
  if (/\b(treino|treinos|cargas?|divisao|cardio|exercicio)\b/.test(x)) return { moduleId: "geburah", tab: "treino", rotulo: "Abrir treinos" };
  if (/\b(cardapio|alimentacao|refeic|proteina|dieta|comida|festas)\b/.test(x)) return { moduleId: "geburah", tab: "nutri", rotulo: "Abrir nutrição" };
  if (/\bpeso\b/.test(x)) return { moduleId: "geburah", tab: "medidas", rotulo: "Ver peso" };
  return { moduleId: "geburah", objetivo: true, rotulo: "Ver no plano" };
}
