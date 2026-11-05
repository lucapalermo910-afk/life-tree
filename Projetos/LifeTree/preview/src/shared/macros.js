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

export function calcularMacros({ peso_kg, altura_cm, idade, sexo, treinos_semana, peso_meta_kg }) {
  const peso = Number(peso_kg), altura = Number(altura_cm), anos = Number(idade);
  const treinos = Number(treinos_semana) || 0;
  const masc = String(sexo || "").toUpperCase().startsWith("M");
  if (!(peso > 30 && altura > 120 && anos >= 16)) return { ok: false, faltando: "peso, altura e idade (16 anos ou mais)" };
  const meta = Number(peso_meta_kg) > 30 ? Number(peso_meta_kg) : peso;

  const tmb = 10 * peso + 6.25 * altura - 5 * anos + (masc ? 5 : -161);
  const fator = FATOR_POR_TREINOS(treinos);
  const gasto = tmb * fator;

  const objetivo = meta < peso - 0.5 ? "perder" : meta > peso + 0.5 ? "ganhar" : "manter";
  let ajuste = 0;
  if (objetivo === "perder") ajuste = -Math.min((0.007 * peso * 7700) / 7, 0.25 * gasto);
  if (objetivo === "ganhar") ajuste = Math.min(0.1 * gasto, 300);
  const piso = Math.max(tmb, masc ? 1500 : 1200);
  const calorias = r5(Math.max(gasto + ajuste, objetivo === "perder" ? piso : 0));

  const prot = Math.round(Math.max(1.8 * meta, 1.4 * peso));
  const gord = Math.round(Math.max((0.25 * calorias) / 9, 0.6 * meta));
  const carb = Math.max(0, Math.round((calorias - prot * 4 - gord * 9) / 4));

  const deficitReal = gasto - calorias;
  const kgSemana = objetivo === "perder" ? (deficitReal * 7) / 7700 : 0;
  const semanas = objetivo === "perder" && kgSemana > 0 ? Math.ceil((peso - meta) / kgSemana) : null;

  return {
    ok: true, objetivo,
    tmb: Math.round(tmb), fator, gasto: Math.round(gasto),
    cal: calorias, prot, carb, gord,
    kgSemana: Math.round(kgSemana * 100) / 100, semanas,
    limitadoPeloPiso: objetivo === "perder" && gasto + ajuste < piso,
  };
}
