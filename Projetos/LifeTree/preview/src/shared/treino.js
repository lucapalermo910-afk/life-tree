// Metas de treino de um objetivo (06/11/2026). Decisão do usuário: treinos por semana,
// cardio em minutos por semana e tipo de treino em letras (A, AB, ABC...). Sem duração,
// horário ou acompanhamento de execução. Treinos por semana é a fonte única: a dieta lê daqui.

export function hojeLocal() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
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
  if (o.semTreino) return null;
  if (o.treino) return normalizarTreino(o.treino);
  if (!o.macros) return null;
  return normalizarTreino({ treinos_semana: dieta?.treinos_semana ?? 3, cardio_min_semana: 0 });
}

// Totais do plano (06/11/2026): do início do objetivo (criado) até o prazo.
// total = meta semanal × dias / 7, arredondado. Recalcula sempre que a meta semanal muda.
export function totaisAteFim(t, inicio, prazo) {
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(prazo || "")) return null;
  const ini = /^\d{4}-\d{2}-\d{2}$/.test(inicio || "") ? inicio : hojeLocal();
  const dias = Math.round((Date.parse(prazo + "T12:00:00Z") - Date.parse(ini + "T12:00:00Z")) / 86400000);
  if (dias <= 0) return null;
  return { dias, treinos: Math.round((t.treinos_semana * dias) / 7), cardio: Math.round((t.cardio_min_semana * dias) / 7) };
}
