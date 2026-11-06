// Metas de calorias e macros para um objetivo de peso (05/11/2026).
// Pedido do usuário: o Coach entregar "o cálculo de macros que a dieta precisa para chegar na
// meta, considerando os exercícios e o peso ideal de proteína". O cálculo é feito AQUI, em
// código, e não pelo modelo: o Coach só coleta os dados (bloco "dieta" do create_objective) e
// explica. Assim os números são reprodutíveis e conferíveis.
//
// Premissas (todas ajustáveis aqui, num lugar só):
// - Gasto basal: Mifflin-St Jeor (mesma fórmula do calcTDEE do GeburahModule).
// - Fator de atividade pela frequência de treino do plano.
// - Perda: déficit de ~0,7% do peso por semana (7700 kcal por kg de gordura), limitado a 25%
//   do gasto total, e nunca abaixo do gasto basal nem de 1500 (homem) / 1200 (mulher) kcal.
// - Proteína: 1,8 g por kg do peso-meta (protege a massa magra no déficit; com IMC alto,
//   usar o peso-meta evita superestimar). Mínimo de 1,4 g por kg do peso atual.
// - Gordura: 25% das calorias, mínimo de 0,6 g por kg do peso-meta.
// - Carboidrato: o que sobra.

export const FATOR_POR_TREINOS = (n) => (n <= 0 ? 1.2 : n <= 2 ? 1.375 : n <= 4 ? 1.55 : n <= 6 ? 1.725 : 1.9);

const r5 = (x) => Math.round(x / 5) * 5;

// `ajustes` (06/11/2026, pedido do usuário: "ao editar as metas o quadro precisa recalcular"):
// - kgSemana: perda desejada por semana → define o déficit (kg × 7700 / 7 por dia)
// - cal: calorias diárias fixadas à mão → a perda semanal passa a sair delas
// - prot: proteína (g) fixada à mão → o carboidrato absorve a diferença
// Só um de kgSemana/cal vale por vez (quem chama limpa o outro). O piso de segurança
// continua valendo: se a perda pedida exigir comer abaixo dele, o cartão avisa.
export function calcularMacros({ peso_kg, altura_cm, idade, sexo, treinos_semana, peso_meta_kg }, ajustes = {}) {
  const peso = Number(peso_kg), altura = Number(altura_cm), anos = Number(idade);
  const treinos = Number(treinos_semana) || 0;
  const masc = String(sexo || "").toUpperCase().startsWith("M");
  if (!(peso > 30 && altura > 120 && anos >= 16)) return { ok: false, faltando: "peso, altura e idade (16 anos ou mais)" };
  const meta = Number(peso_meta_kg) > 30 ? Number(peso_meta_kg) : peso;

  const tmb = 10 * peso + 6.25 * altura - 5 * anos + (masc ? 5 : -161);
  const fator = FATOR_POR_TREINOS(treinos);
  const gasto = tmb * fator;

  const objetivo = meta < peso - 0.5 ? "perder" : meta > peso + 0.5 ? "ganhar" : "manter";
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
  if (o.dieta) return o.dieta;
  const m = o.macros || {};
  const peso = Number(perfil.peso) || null;
  const pesoMeta = peso && m.semanas && m.kgSemana ? Math.round(peso - m.semanas * m.kgSemana) : peso;
  return { peso_kg: peso, altura_cm: Number(perfil.altura) || null, idade: Number(perfil.idade) || null, sexo: perfil.sexo || "M",
    treinos_semana: TREINOS_POR_FATOR[m.fator] ?? 3, peso_meta_kg: pesoMeta };
}
