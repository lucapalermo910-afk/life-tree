// Cardápio planejado × metas, e registro de cardio (16/11/2026 — camada 2, "plano aterrissado").
// planSem: { "AAAA-MM-DD_Refeição": [ {id, qtd} ] } — itens antigos eram só o id do alimento
// (sem quantidade): contam como 1 porção (porcao.gramas) ou 100 g.
export const dataLocal = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const proximosDias = (n = 7, base = new Date()) => Array.from({ length: n }, (_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return dataLocal(d); });

export function itensDoPlano(lista, alimentos = []) {
  return (lista || []).map((x) => {
    if (typeof x === "string") { const al = alimentos.find((a) => a.id === x); return { id: x, qtd: al?.porcao?.gramas || 100 }; }
    return { id: x?.id, qtd: Number(x?.qtd) || 100 };
  }).filter((x) => x.id);
}

export function totaisDoDia(planSem, ds, alimentos, refeicoes) {
  const t = { cal: 0, prot: 0, carb: 0, gord: 0, itens: 0 };
  refeicoes.forEach((ref) => itensDoPlano(planSem?.[ds + "_" + ref], alimentos).forEach(({ id, qtd }) => {
    const a = alimentos.find((x) => x.id === id); if (!a) return;
    t.cal += ((Number(a.cal100) || 0) * qtd) / 100; t.prot += ((Number(a.prot) || 0) * qtd) / 100;
    t.carb += ((Number(a.carb) || 0) * qtd) / 100; t.gord += ((Number(a.gord) || 0) * qtd) / 100; t.itens++;
  }));
  return { cal: Math.round(t.cal), prot: Math.round(t.prot), carb: Math.round(t.carb), gord: Math.round(t.gord), itens: t.itens };
}

// Dia "dentro": calorias a ±10% da meta e proteína ≥ 90% da meta.
export function avaliarDia(tot, metas) {
  if (!tot.itens) return { status: "vazio" };
  const cal = Number(metas?.cal) || 0, prot = Number(metas?.prot) || 0;
  const difCal = cal ? tot.cal - cal : 0;
  const ok = (!cal || Math.abs(difCal) <= cal * 0.1) && (!prot || tot.prot >= prot * 0.9);
  return { status: ok ? "ok" : "fora", difCal, faltaProt: prot ? Math.max(0, prot - tot.prot) : 0 };
}

export function resumoCardapio(planSem, alimentos, metas, refeicoes, dias = proximosDias(7)) {
  return dias.map((ds) => {
    const tot = totaisDoDia(planSem, ds, alimentos, refeicoes), av = avaliarDia(tot, metas);
    return { data: ds, calorias: tot.cal, proteina_g: tot.prot, carbo_g: tot.carb, gordura_g: tot.gord, itens: tot.itens, situacao: av.status,
      ...(av.status === "fora" ? { diferenca_kcal: av.difCal, falta_proteina_g: av.faltaProt } : {}) };
  });
}

// Cardio: logCardio [{ id, data, tipo, min }]
export const TIPOS_CARDIO = ["Esteira", "Bike", "Caminhada", "Elíptico", "Escada", "Corrida", "Natação", "Outro"];
export function cardioDaSemana(logCardio, hoje = dataLocal()) {
  const ini = (() => { const d = new Date(hoje + "T12:00:00"); d.setDate(d.getDate() - 6); return dataLocal(d); })();
  const doPeriodo = (logCardio || []).filter((c) => c?.data >= ini && c.data <= hoje);
  return { minutos_7_dias: doPeriodo.reduce((s, c) => s + (Number(c.min) || 0), 0), sessoes_7_dias: doPeriodo.length,
    hoje: (logCardio || []).filter((c) => c?.data === hoje).reduce((s, c) => s + (Number(c.min) || 0), 0) };
}
