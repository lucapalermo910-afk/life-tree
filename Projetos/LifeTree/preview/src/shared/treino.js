// Metas de treino de um objetivo (06/11/2026). Decisão do usuário: treinos por semana,
// cardio em minutos por semana e tipo de treino em letras (A, AB, ABC...). Sem duração,
// horário ou acompanhamento de execução. Treinos por semana é a fonte única: a dieta lê daqui.

export const DIVISOES = ["A", "AB", "ABC", "ABCD", "ABCDE"];

export function normalizarTreino(t = {}) {
  const n = Math.max(0, Math.min(7, Math.round(Number(t.treinos_semana) || 0)));
  const cardio = Math.max(0, Math.round(Number(t.cardio_min_semana) || 0));
  const div = String(t.divisao || "").toUpperCase().replace(/[^A-E]/g, "");
  return { treinos_semana: n, cardio_min_semana: cardio, divisao: DIVISOES.includes(div) ? div : (n >= 5 ? "ABC" : n >= 4 ? "AB" : "A") };
}

/** Sequência da semana: 5 treinos em ABC → ["A","B","C","A","B"]. */
export function sequenciaDaSemana({ treinos_semana, divisao }) {
  const letras = (divisao || "A").split("");
  return Array.from({ length: treinos_semana || 0 }, (_, i) => letras[i % letras.length]);
}

/** Metas de treino do objetivo; objetivos antigos derivam os treinos da dieta. */
export function treinoDoObjetivo(o, dieta) {
  if (o.treino) return normalizarTreino(o.treino);
  if (!o.macros) return null;
  return normalizarTreino({ treinos_semana: dieta?.treinos_semana ?? 3, cardio_min_semana: 0 });
}
