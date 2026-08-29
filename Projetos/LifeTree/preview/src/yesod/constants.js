export const uid  = () => Math.random().toString(36).slice(2,8);
export const fmt  = n  => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
export const tod  = () => new Date().toISOString().slice(0,10);
export const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export const addM = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0,10); };
export const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };
export const freqAdd = (ds, freq) => freq === "weekly" ? addDays(ds, 7) : freq === "yearly" ? addM(ds, 12) : addM(ds, 1);
export const FREQ_LABELS = { weekly: "Semanal", monthly: "Mensal", yearly: "Anual" };
export const nextMonthlyDue = (dueDay, today) => {
  const now = new Date(today + "T12:00:00");
  let y = now.getFullYear(), m = now.getMonth();
  let d = new Date(y, m, dueDay);
  if (d < now) { m++; if (m > 11) { m = 0; y++; } d = new Date(y, m, dueDay); }
  return d.toISOString().slice(0,10);
};
export const mLbl = ds => { const p = ds.slice(0,7).split("-"); return MTHS[parseInt(p[1])-1] + "/" + p[0].slice(2); };
export const stmtDue = (pd, closeDay, dueDay) => {
  const d = new Date(pd + "T12:00:00");
  let m = d.getMonth(), y = d.getFullYear();
  // Se passou do fechamento, vai para o próximo mês
  if (d.getDate() > closeDay) { m++; if (m > 11) { m = 0; y++; } }
  // Se fechamento >= vencimento, vencimento é no mês seguinte ao fechamento
  let dm = m, dy = y;
  if (closeDay >= dueDay) { dm++; if (dm > 11) { dm = 0; dy++; } }
  return new Date(dy, dm, dueDay).toISOString().slice(0,10);
};
export const accBal = acc => (acc.txs||[]).reduce((s,t) => t.type === "in" ? s + t.amount : s - t.amount, 0);
export const getStmts = card => { const map = {}; (card.txs||[]).forEach(tx => { const n = tx.type === "in" ? 1 : (tx.installments||1); const sign = tx.type === "in" ? -1 : 1; for (let i = 0; i < n; i++) { const pd = i === 0 ? tx.date : addM(tx.date, i); const due = stmtDue(pd, card.closeDay, card.dueDay); if (!map[due]) map[due] = []; map[due].push({ ...tx, parcel: n > 1 ? (i+1)+"/"+n : null, amt: (tx.amount/n)*sign }); } }); return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([due,items]) => ({ due, items, total: items.reduce((s,x) => s+x.amt, 0) })); };

// Conta virtual — não é um banco de verdade, é onde lançamentos method:"dinheiro" (form
// manual e coach, ver yesodActions.js) são guardados, pra que dinheiro entre no saldo,
// fluxo de caixa e orçamento como qualquer outro método. id fixo, replicado no coach.
export const CASH_ACC_ID = "cash-wallet";
export const accLabel = (a, banks) => a.isCash ? "Carteira" : (banks.find(b=>b.id===a.bankId)?.name||"")+" - "+a.name;

export const D_CATS_OUT = ["Alimentação","Moradia","Transporte","Saude","Educação","Lazer","Vestuário","Serviços","Tecnologia","Assinaturas","Outros"];
export const D_CATS_IN  = ["Salario","Freelance","Aluguel recebido","Reembolso","Outros"];
export const PAY_METHODS = [{v:"credito",l:"Credito"},{v:"debito",l:"Debito"},{v:"pix",l:"PIX"},{v:"ted",l:"TED"},{v:"dinheiro",l:"Dinheiro"}];
export const TABS = [{id:"yesod",icon:"treelife",label:"Yesod"},{id:"orc",icon:"alvo",label:"Orçamento"},{id:"bolsos",icon:"bank",label:"Bolsos"},{id:"goals",icon:"target",label:"Objetivos"},{id:"cfg",icon:"gear",label:"Config"}];
// A aba Yesod tinha um controle segmentado Visão Geral/IF (Yesod/Fluxo/IF originalmente,
// 01/08/2026) — a seção IF saiu em 25/08/2026 pra virar a aba própria "Objetivos" (junto
// com as Metas financeiras, que moraram na Visão Geral até então), sobrando só Visão
// Geral. Sem outra seção pra alternar, o controle de pills foi removido.
// Fluxo saiu daqui em 25/08/2026 — virou pill dentro de Orçamento (ORC_SECTIONS). Extrato
// existiu como 3º pill por 2 dias e foi removido — a lista de lançamentos com filtro
// (tipo/categoria/período) voltou a viver dentro do próprio Fluxo, ver FluxoCaixaView.
export const ORC_SECTIONS = [{id:"fluxo",l:"Fluxo"},{id:"orc",l:"Orçamento"}];
// Horizontes da Projeção de Fluxo de Caixa (view "projecao" dentro de Fluxo) — dias<=90
// usam granularidade diária no gráfico, acima disso vira mensal (ver buildProjSeries).
export const PROJ_HORIZONS = [
  {id:"30d",l:"30 dias",days:30},{id:"60d",l:"60 dias",days:60},{id:"90d",l:"90 dias",days:90},
  {id:"6m",l:"6 meses",days:182},{id:"1a",l:"1 ano",days:365},{id:"3a",l:"3 anos",days:1095},
];
export const COLOR_PALETTE = ["#8b5cf6","#6366f1","#3b82f6","#06b6d4","#10b981","#84cc16","#f59e0b","#f97316","#ef4444","#ec4899","#64748b","#0f172a"];
