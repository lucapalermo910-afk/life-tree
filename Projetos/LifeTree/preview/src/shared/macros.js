// Metas de calorias e macros para um objetivo de peso (05/11/2026).
// Pedido do usuário: o Coach entregar "o cálculo de macros que a dieta precisa para chegar na
// meta, considerando os exercícios e o peso ideal de proteína". O cálculo é feito AQUI, em
// código, e não pelo modelo: o Coach só coleta os dados (bloco "dieta" do create_objective) e
// explica. Assim os números são reprodutíveis e conferíveis.
//
// Premissas (todas ajustáveis aqui, num lugar só):
// - Gasto basal: Mifflin-St Jeor (mesma fórmula do calcTDEE do GeburahModule).
// - Gasto total EXPLÍCITO (07/11/2026, pedido do usuário: "estimar tudo o mais próximo do
//   comportamento real"): basal × 1,2 (dia a dia sem treino) + gasto líquido dos treinos
//   (sessões × duração × MET 5 da musculação) + gasto líquido do cardio (minutos × MET 5,
//   moderado). Líquido = (MET − 1), para não contar duas vezes o basal daquele tempo.
//   Antes era um multiplicador por nº de treinos (1,55 → 1,725), que dava ~2.100 kcal/semana
//   a mais por UM treino a mais e ignorava o cardio.
// - A data da meta e os marcos saem da simulação dia a dia em shared/planejamento.js
//   (simularPlano), com o basal caindo junto com o peso.
// - Perda: déficit de ~0,7% do peso por semana (7700 kcal por kg de gordura), limitado a 25%
//   do gasto total, e nunca abaixo do gasto basal nem de 1500 (homem) / 1200 (mulher) kcal.
// - Proteína: 1,8 g por kg do peso-meta (protege a massa magra no déficit; com IMC alto,
//   usar o peso-meta evita superestimar). Mínimo de 1,4 g por kg do peso atual.
// - Gordura: 25% das calorias, mínimo de 0,6 g por kg do peso-meta.
// - Carboidrato: o que sobra.

export const FATOR_POR_TREINOS = (n) => (n <= 0 ? 1.2 : n <= 2 ? 1.375 : n <= 4 ? 1.55 : n <= 6 ? 1.725 : 1.9);

export const ATIVIDADE_BASE = 1.2, MET_MUSCULACAO = 5, MET_CARDIO = 5, DURACAO_TREINO_PADRAO = 60;
const kcalLiquidoMin = (met, peso) => ((met - 1) * 3.5 * peso) / 200;
export const tmbDe = ({ peso, altura, anos, masc }) => 10 * peso + 6.25 * altura - 5 * anos + (masc ? 5 : -161);
// Gasto diário (kcal) com o peso do dia — usado no cálculo das metas e na simulação.
export function gastoDiario(peso, { altura_cm, idade, sexo, treinos_semana, cardio_min_semana, duracao_treino_min }) {
  const masc = String(sexo || "").toUpperCase().startsWith("M");
  const tmb = tmbDe({ peso, altura: Number(altura_cm), anos: Number(idade), masc });
  const dur = Number(duracao_treino_min) > 0 ? Number(duracao_treino_min) : DURACAO_TREINO_PADRAO;
  const treino = ((Number(treinos_semana) || 0) * dur * kcalLiquidoMin(MET_MUSCULACAO, peso)) / 7;
  const cardio = ((Number(cardio_min_semana) || 0) * kcalLiquidoMin(MET_CARDIO, peso)) / 7;
  return { tmb, base: tmb * ATIVIDADE_BASE, treino, cardio, total: tmb * ATIVIDADE_BASE + treino + cardio, duracao: dur };
}

const r5 = (x) => Math.round(x / 5) * 5;

// `ajustes` (06/11/2026, pedido do usuário: "ao editar as metas o quadro precisa recalcular"):
// - kgSemana: perda desejada por semana → define o déficit (kg × 7700 / 7 por dia)
// - cal: calorias diárias fixadas à mão → a perda semanal passa a sair delas
// - prot: proteína (g) fixada à mão → o carboidrato absorve a diferença
// Só um de kgSemana/cal vale por vez (quem chama limpa o outro). O piso de segurança
// continua valendo: se a perda pedida exigir comer abaixo dele, o cartão avisa.
export function calcularMacros(dietaIn, ajustes = {}) {
  const { peso_kg, altura_cm, idade, sexo, treinos_semana, peso_meta_kg } = dietaIn;
  const peso = Number(peso_kg), altura = Number(altura_cm), anos = Number(idade);
  const masc = String(sexo || "").toUpperCase().startsWith("M");
  if (!(peso > 30 && altura > 120 && anos >= 16)) return { ok: false, faltando: "peso, altura e idade (16 anos ou mais)" };
  const meta = Number(peso_meta_kg) > 30 ? Number(peso_meta_kg) : peso;

  const g = gastoDiario(peso, dietaIn);
  const tmb = g.tmb, fator = ATIVIDADE_BASE, gasto = g.total;

  // `ajustes.objetivo` (07/11/2026): a simulação força "perder" até chegar à meta — sem isso,
  // a 0,5 kg da meta o cálculo virava "manter" e a simulação parava a meio quilo do fim.
  const objetivo = ajustes.objetivo || (meta < peso - 0.5 ? "perder" : meta > peso + 0.5 ? "ganhar" : "manter");
  const piso = Math.max(tmb, masc ? 1500 : 1200);
  const kgPedido = Number(ajustes.kgSemana) > 0 ? Number(ajustes.kgSemana) : null;
  const calPedida = Number(ajustes.cal) > 0 ? Number(ajustes.cal) : null;

  let alvo;
  if (calPedida) alvo = calPedida;
  else if (objetivo === "perder") {
    const deficit = kgPedido ? (kgPedido * 7700) / 7 : Math.min((0.007 * peso * 7700) / 7, 0.25 * gasto);
    alvo = gasto - deficit;
  } else alvo = gasto + (objetivo === "ganhar" ? Math.min(0.1 * gasto, 300) : 0);
  const limitadoPeloPiso = !calPedida && objetivo === "perder" && alvo < piso;
  const calorias = calPedida ? Math.round(calPedida) : r5(Math.max(alvo, objetivo === "perder" ? piso : 0));

  const protPedida = Number(ajustes.prot) > 0 ? Math.round(Number(ajustes.prot)) : null;
  const prot = protPedida ?? Math.round(Math.max(1.8 * meta, 1.4 * peso));
  const gord = Math.round(Math.max((0.25 * calorias) / 9, 0.6 * meta));
  const carb = Math.max(0, Math.round((calorias - prot * 4 - gord * 9) / 4));

  const deficitReal = gasto - calorias;
  const kgSemana = objetivo === "perder" && deficitReal > 0 ? (deficitReal * 7) / 7700 : 0;
  const semanas = objetivo === "perder" && kgSemana > 0 ? Math.ceil((peso - meta) / kgSemana) : null;

  return {
    ok: true, objetivo,
    tmb: Math.round(tmb), fator, gasto: Math.round(gasto),
    base: Math.round(g.base), kcalTreinoDia: Math.round(g.treino), kcalCardioDia: Math.round(g.cardio), duracaoTreino: g.duracao,
    treinos_semana: Number(treinos_semana) || 0, cardio_min_semana: Number(dietaIn.cardio_min_semana) || 0,
    cal: calorias, prot, carb, gord,
    kgSemana: Math.round(kgSemana * 100) / 100, semanas,
    limitadoPeloPiso,
    // Avisos de segurança para valores ajustados à mão
    abaixoDoPiso: calorias < piso,
    ritmoAlto: objetivo === "perder" && kgSemana > 0.01 * peso,
    carbZerado: carb === 0,
    piso: Math.round(piso),
    ajustado: !!(kgPedido || calPedida || protPedida),
  };
}

const TREINOS_POR_FATOR = { 1.2: 0, 1.375: 2, 1.55: 3, 1.725: 5, 1.9: 7 };

/** Dados de entrada do objetivo. Objetivos criados antes de 06/11/2026 não guardavam o bloco
 *  "dieta": reconstrói pelo perfil (peso, altura, idade, sexo) e pelas metas salvas. */
export function dietaDoObjetivo(o, perfil = {}) {
  if (o.dieta) return o.treino ? { ...o.dieta, treinos_semana: o.treino.treinos_semana } : o.dieta;
  const m = o.macros || {};
  const peso = Number(perfil.peso) || null;
  const pesoMeta = peso && m.semanas && m.kgSemana ? Math.round(peso - m.semanas * m.kgSemana) : peso;
  return { peso_kg: peso, altura_cm: Number(perfil.altura) || null, idade: Number(perfil.idade) || null, sexo: perfil.sexo || "M",
    treinos_semana: TREINOS_POR_FATOR[m.fator] ?? 3, peso_meta_kg: pesoMeta };
}
