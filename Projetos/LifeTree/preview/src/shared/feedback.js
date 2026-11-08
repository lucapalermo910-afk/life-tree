// Feedback automático do Coach (08/11/2026, pedido do usuário: "o Coach percebe que pesei
// acima e manda: vamos equilibrar a dieta ou o treino hoje"). O CÓDIGO decide quando falar
// (regras abaixo, sobre a verificação do plano); a mensagem é montada aqui, sem chamar a API.
// "Conversar" abre o Coach com a situação já explicada. Base para o push no futuro.
// Regras de propósito conservadoras:
// - Peso: só pela MÉDIA DE 7 DIAS (≥ 3 pesagens) contra o esperado da simulação, ±1 kg. Uma
//   pesagem isolada acima, com a média em dia, vira "variação normal" — não alarme.
// - Correção é de EXECUÇÃO (treino, cardio, registrar, proteína). Nunca mandar comer menos:
//   as calorias do plano podem já estar no mínimo seguro.
// - No máximo 3 avisos; cada um pode ser dispensado até o fim do dia.
import { verificarObjetivo } from "./planejamento.js";

const CHAVE_DISPENSADOS = "lifetree_feedback_dispensados";
const hojeISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dataCurta = (s) => (s ? s.slice(8, 10) + "/" + s.slice(5, 7) : "");
const kg = (n) => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " kg";
const ler = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };

export function lerDadosSaude() {
  const g = (k, f) => ler("lifetree_geb_" + k, f);
  return { objetivos: g("objetivos", []), pesagens: g("pesagens", []), logTreino: g("logTreino", []), logDieta: g("logDieta", []),
    alimentos: g("alimentos", []), metas: g("metas", {}), agua: g("agua", {}), rotinasTreino: g("rotinasTreino", []),
    perfil: g("perfil", {}), pesosMeta: g("pesosMeta", {}) };
}

export function feedbacksDaSaude(d, hoje = hojeISO()) {
  const o = (d.objetivos || []).find((x) => (x.macros || x.dieta) && !x.done) || (d.objetivos || []).find((x) => x.plano && !x.done);
  if (!o) return [];
  const v = verificarObjetivo(o, d, hoje);
  const out = [];
  const pes = [...(d.pesagens || [])].filter((p) => p?.data && Number(p.peso)).sort((a, b) => a.data.localeCompare(b.data));
  const semana = pes.filter((p) => (Date.parse(hoje) - Date.parse(p.data)) / 86400000 < 7);
  const pesouHoje = pes.some((p) => p.data === hoje);
  const t7 = (d.logTreino || []).filter((l) => l?.horaFim && l.data <= hoje && (Date.parse(hoje) - Date.parse(l.data)) / 86400000 < 7).length;
  const alvoSemana = (o.plano?.steps?.[v.etapa_atual - 1]?.semana || o.treino)?.treinos_semana ?? null;
  const nd = v.dieta.dias_com_registro_14d;
  const execucao = (alvoSemana != null ? t7 + " de " + alvoSemana + " treinos" : t7 + (t7 === 1 ? " treino" : " treinos")) + " e " +
    (nd === 0 ? "nenhum dia de alimentação registrado" : nd + (nd === 1 ? " dia" : " dias") + " de alimentação registrados");
  const p = v.pesagens;

  if (o.macros && semana.length >= 3 && p.diferenca_para_o_esperado != null && p.diferenca_para_o_esperado >= 1) {
    out.push({ id: "peso_acima", nivel: "alerta", titulo: "Peso acima do plano",
      texto: "A média dos últimos 7 dias (" + kg(p.media_7_dias) + ") está " + kg(p.diferenca_para_o_esperado) + " acima do esperado para hoje (" + kg(p.peso_esperado_hoje) + "). Nesta semana: " + execucao + ". Foco hoje: fazer o treino e o cardio da etapa e registrar as refeições — sem cortar abaixo da meta de calorias.",
      pergunta: "Minha média de peso está " + kg(p.diferenca_para_o_esperado) + " acima do esperado. Olhando meus registros, o que ajusto hoje no treino ou na dieta, sem descer das calorias mínimas?" });
  } else if (o.macros && semana.length >= 3 && p.diferenca_para_o_esperado != null && p.diferenca_para_o_esperado <= -1.5) {
    out.push({ id: "peso_abaixo", nivel: "info", titulo: "Perdendo mais rápido que o plano",
      texto: "A média de 7 dias está " + kg(-p.diferenca_para_o_esperado) + " abaixo do esperado. Bom sinal, mas cuide da massa magra: bata a proteína do dia e não pule os treinos de força.",
      pergunta: "Estou perdendo mais rápido que o plano (" + kg(-p.diferenca_para_o_esperado) + " abaixo). Preciso ajustar algo para preservar massa magra?" });
  } else if (o.macros && pesouHoje && p.peso_esperado_hoje != null && pes[pes.length - 1].peso - p.peso_esperado_hoje >= 1) {
    out.push({ id: "peso_dia", nivel: "ok", titulo: "Variação normal",
      texto: "A pesagem de hoje (" + kg(pes[pes.length - 1].peso) + ") veio acima do esperado, mas o peso oscila 1 a 2 kg de um dia para o outro (água, sal, carboidrato). O que vale é a média de 7 dias" + (semana.length >= 3 ? ", que segue no plano." : " — continue pesando todo dia.") });
  }
  if (o.macros && !pesouHoje) {
    out.push({ id: "pesar_hoje", nivel: "info", titulo: "Pesagem de hoje",
      texto: "Registre o peso de hoje em jejum. Com uma pesagem por dia, o app compara a média de 7 dias com o plano." + (pes.length ? " Última: " + kg(pes[pes.length - 1].peso) + " em " + dataCurta(pes[pes.length - 1].data) + "." : "") });
  }
  const tr = v.treinos;
  if (tr.aderencia_pct != null && tr.planejados_ate_hoje_na_etapa >= 2 && tr.aderencia_pct < (o.krs?.treino_pct ?? 85)) {
    out.push({ id: "treinos", nivel: "alerta", titulo: "Treinos abaixo do ritmo",
      texto: "Na etapa " + v.etapa_atual + ": " + tr.na_etapa_atual + " de ~" + Math.round(tr.planejados_ate_hoje_na_etapa) + " treinos planejados até hoje (" + tr.aderencia_pct + "%). Dá para recuperar hoje?",
      pergunta: "Estou com " + tr.aderencia_pct + "% dos treinos da etapa. Como recupero esta semana sem exagerar?" });
  }
  if (o.macros && v.dieta.dias_com_registro_14d === 0 && (Date.parse(hoje) - Date.parse(o.criado || hoje)) / 86400000 >= 2) {
    out.push({ id: "dieta_registro", nivel: "info", titulo: "Alimentação sem registro",
      texto: "Nenhuma refeição registrada nos últimos dias. Sem isso, o app não sabe se o peso acima ou abaixo vem da dieta ou do treino." });
  }
  const at = v.tarefas.atrasadas, prox = v.tarefas.proximas_7_dias.filter((t) => t.ate <= hoje);
  if (at.length) out.push({ id: "tarefas_atrasadas", nivel: "alerta", titulo: at.length === 1 ? "Tarefa atrasada" : at.length + " tarefas atrasadas",
    texto: at.slice(0, 3).map((t) => t.texto + " (até " + dataCurta(t.ate) + ")").join(" · ") + (at.length > 3 ? " · …" : "") + ". Marque no Controle quando fizer." });
  else if (prox.length) out.push({ id: "tarefas_hoje", nivel: "info", titulo: "Tarefa para hoje",
    texto: prox.map((t) => t.texto).join(" · ") + ". Marque no Controle quando fizer." });

  const ordem = { alerta: 0, info: 1, ok: 2 };
  return out.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]).map((f) => ({ ...f, id: f.id + ":" + hoje }));
}

export function dispensados() { return ler(CHAVE_DISPENSADOS, {}); }
export function dispensar(id) {
  const hoje = hojeISO();
  const atual = Object.fromEntries(Object.entries(dispensados()).filter(([, dia]) => dia === hoje));
  try { localStorage.setItem(CHAVE_DISPENSADOS, JSON.stringify({ ...atual, [id]: hoje })); } catch { /* sem armazenamento */ }
}
// "Conversar": o App escuta e abre o Coach da Saúde com a pergunta.
export function conversarComCoach(pergunta) {
  window.dispatchEvent(new CustomEvent("lifetree:coach", { detail: { texto: pergunta, skill: "geburah" } }));
}
