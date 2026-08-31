import { useState, useEffect, useRef, useMemo, createContext } from "react";
import { useCoachDataSync } from "../shared/coachSync.js";
import { D_BANKS, D_ACCS, D_CARDS, D_BOXES, D_DEBTS, ICAT, D_INVS } from "./seedData.js";
import { ACCENT } from "./theme.js";
import {
  uid, fmt, tod, MTHS, addM, addDays, freqAdd, nextMonthlyDue, accBal, getStmts,
  CASH_ACC_ID, accLabel, D_CATS_OUT, D_CATS_IN,
} from "./constants.js";

// YesodCtx — extraído em 26/08/2026 (item 5, passo 3 do Plano de Decomposição, ver 11 Plano
// de Decomposição — Arquivos Monolíticos.md). Diferente do padrão Geburah/Hod (lá,
// context.js só declara o Context e o estado/ações continuam no shell) — aqui o hub
// principal (YesodTab, tab==="yesod") não pôde ser extraído (toca 20+ identificadores
// cross-cutting, confirmado no levantamento) — deixar estado+ações no shell não reduziria
// nada de verdade. useYesodState() concentra tudo que NÃO é apresentação (estado,
// persistência, cálculos financeiros, ações de CRUD); o shell chama uma vez e distribui
// via <YesodCtx.Provider value={...}>. Os 5 renderXRow (Bolsos/Config) e toda a JSX de
// abas continuam fora daqui de propósito — dependem de C (tema), que é apresentação, não
// dado, e o próprio Yesod já passa C explícito por prop (não usa ThemeCtx, ver migração
// pro shared/ui.jsx) — YesodCtx cobre só a metade "dado/ação" do módulo.
export const YesodCtx = createContext(null);

export function useYesodState() {
  const [tab, setTab] = useState("yesod");
  const [page, setPage] = useState(null);
  const [banks, setBanks] = useState(D_BANKS);
  const [accs, setAccs] = useState(D_ACCS);
  const [cards, setCards] = useState(D_CARDS);
  const [boxes, setBoxes] = useState(D_BOXES);
  // Snapshot mensal de saldo por Caixinha (25/08/2026) — mesmo padrão de patrimSnaps
  // (ver useEffect mais abaixo): mês corrente atualizado ao vivo, meses passados uma vez
  // gravados nunca são reescritos. Diferente de patrimSnaps, não é retroativo — só existe
  // história a partir de quando essa mudança entrou no ar.
  const [boxSnaps, setBoxSnaps] = useState([]);
  const [debts, setDebts] = useState(D_DEBTS);
  const [budgets, setBudgets] = useState([]); // seed de demo removido 31/08/2026
  const overMonth = 0; // Taxa de Poupança sempre olha o mês atual (histórico de 6 meses); sem controle próprio desde 25/08/2026.
  const [fluxoView, setFluxoView] = useState(0);
  const [orcSection, setOrcSection] = useState("fluxo"); // fluxo | orc — ver ORC_SECTIONS
  // 0 = "sem meta definida ainda" (achado 30/08/2026: usuário quis apagar a Meta de IF por
  // completo pra testar o fluxo de criação do zero — antes sempre tinha um valor padrão
  // pré-preenchido, 300000/5000, e não existia um estado "vazio" de verdade). ifConfigured
  // (perto de ifNeeded abaixo) é quem decide se mostra o card de sempre ou o estado vazio.
  const [ifGoal, setIfGoal] = useState(0);
  const [ifMonthly, setIfMonthly] = useState(0);
  // ifBaseline: snapshot da projeção da meta IF no momento em que o plano (Kether) foi
  // criado/recalculado pela última vez — comparado contra a projeção atual pra detectar
  // quando algo (dívida nova, queda de renda) tirou a meta da rota (ver ifRisk). null até
  // a 1ª vez que a projeção roda (auto-capturada, ver useEffect perto de ifProjection).
  const [ifBaseline, setIfBaseline] = useState(null);
  const touchXRef = useRef(0);
  const [patrimSnaps, setPatrimSnaps] = useState([]);
  const [invs, setInvs] = useState(D_INVS);
  const [toast, setToast] = useState(null);
  const [sh, setSh] = useState(null);
  const [f, setF] = useState({});
  const [yHabits, setYHabits] = useState([]); // seed de demo removido 31/08/2026 (usuário vai revisar hábitos separadamente)
  const [yGoals, setYGoals] = useState([]); // seed de demo removido 31/08/2026
  const [finXp, setFinXp] = useState(0);
  const [yesodCards, setYesodCards] = useState(["poupanca","if","dividas","orcamento","habitos","metas"]);
  const [catsOut, setCatsOut] = useState(D_CATS_OUT);
  const [catsIn, setCatsIn] = useState(D_CATS_IN);
  const [recurrings, setRecurrings] = useState([]);
  // Gráfico realizado+esperado do Fluxo de Caixa (substituiu HISTÓRICO 6 MESES, 23/08/2026).
  // recurringOverrides: ajuste pontual de UMA ocorrência futura de uma recorrência ("<ym>|<recurringId>" -> valor),
  // não muda o valor padrão da recorrência. plannedItems: categoria esperada futura sem recorrência por trás.
  const [recurringOverrides, setRecurringOverrides] = useState({});
  const [plannedItems, setPlannedItems] = useState([]);
  const [selChartYm, setSelChartYm] = useState(null); // null = mês atual, calculado on-the-fly
  const [txSearch, setTxSearch] = useState("");
  // "Ver mais" do card Despesas Divididas (26/08/2026) — antes cortava em 8 itens sem
  // nenhum jeito de ver/acertar o resto; agora só limita visualmente até o usuário pedir
  // pra expandir, e os totais do cabeçalho sempre bateram com a lista inteira, exibida ou não.
  const [despesasExpanded, setDespesasExpanded] = useState(false);
  // Filtro tipo/categoria da lista de lançamentos do Fluxo (era a aba "Extrato Geral"
  // separada, 23-25/08/2026, voltou a viver dentro do próprio Fluxo — sem busca nem seletor
  // de período próprios, 25/08/2026: o mês já vem 100% do gráfico).
  const [extType, setExtType] = useState("todos");
  const [extCat, setExtCat] = useState("");
  const [projHorizonId, setProjHorizonId] = useState("90d");
  // Ajustes de cenário da Projeção — camada só de exibição, nunca escreve em nenhuma
  // entidade real (contas/dívidas/etc). Persistido à parte pra sobreviver a reload sem
  // se misturar com dados reais. Lista de eventos (não mais um único delta) — cada um com
  // deltaIn/deltaOut em R$/mês e fromM = a partir de qual mês, pra simular múltiplos "e se"
  // ao mesmo tempo (ex: "aumento em março" E "viagem em julho" na mesma projeção).
  const [projEvents, setProjEvents] = useState([]);
  // Pessoas com quem despesas recorrentes são divididas (ex: cônjuge) — split fica dentro
  // da própria transação (accs[].txs[].split), não aqui; esta lista só guarda quem existe.
  const [splitPeople, setSplitPeople] = useState([]);
  // Despesas que OUTRA pessoa pagou e eu devo minha parte de volta (26/08/2026) — sentido
  // inverso do split em accs[].txs[].split (que é quando EU pago e o outro me deve). Não
  // nasce de nenhuma transação minha — o dinheiro nunca passou pela minha conta — então
  // vive numa lista à parte, e só vira uma transação de verdade quando eu quito (paySplit),
  // mesmo princípio de "tudo ligado a conta" do resto do módulo. {id,personId,desc,amount,date,settled}
  const [sharedOwed, setSharedOwed] = useState([]);
  // Pesos da fórmula de Saúde Financeira (26/08/2026) — configurável em Config, ver
  // calcYesodScore. Não precisam somar 100 (a fórmula normaliza sozinha) — dá pra zerar um
  // componente inteiro botando o peso dele em 0.
  const [scoreWeights, setScoreWeights] = useState({savRate:25,debt:20,budget:20,emergency:20,if:15,emergencyTargetMonths:6});
  // Confirmação antes de editar/apagar registros (26/08/2026, Config → Preferências →
  // Segurança) — default ligado. Só guarda ações de entidade inteira (Conta/Banco/Cartão/
  // Caixinha/Dívida/Investimento/Recorrência/Pessoa/Despesa a pagar e o "Salvar" de cada
  // sheet de editar) — deletar um lançamento/categoria isolada continua instantâneo, ver
  // guard() mais abaixo.
  const [confirmDestructive, setConfirmDestructive] = useState(true);
  const F = v => setF(x => ({...x,...v}));
  const toast_ = (msg, color) => { setToast({msg,color:color||ACCENT}); setTimeout(()=>setToast(null),2400); };

  // ── PERSISTÊNCIA ─────────────────────────────────────────────────────────
  const [storageLoaded, setStorageLoaded] = useState(false);
  const loadFromStorage = () => {
    try {
        const PREFIX = "lifetree_";
        const load = (k) => { try { const v = localStorage.getItem(PREFIX+k); return v ? JSON.parse(v) : null; } catch(_) { return null; } };
        const r_banks=load("fin_banks"); if(r_banks) setBanks(r_banks);
        const r_accs=load("fin_accs"); if(r_accs) setAccs(r_accs);
        const r_cards=load("fin_cards"); if(r_cards) setCards(r_cards);
        const r_boxes=load("fin_boxes"); if(r_boxes) setBoxes(r_boxes);
        const r_debts=load("fin_debts"); if(r_debts) setDebts(r_debts);
        const r_invs=load("fin_invs"); if(r_invs) setInvs(r_invs);
        const r_budgets=load("fin_budgets"); if(r_budgets) setBudgets(r_budgets);
        const r_yhabits=load("fin_yhabits"); if(r_yhabits) setYHabits(r_yhabits);
        const r_ygoals=load("fin_ygoals"); if(r_ygoals) setYGoals(r_ygoals);
        const r_ifgoal=load("fin_ifgoal"); if(r_ifgoal!=null) setIfGoal(r_ifgoal);
        const r_ifmonthly=load("fin_ifmonthly"); if(r_ifmonthly!=null) setIfMonthly(r_ifmonthly);
        const r_ifbaseline=load("fin_ifbaseline"); if(r_ifbaseline!=null) setIfBaseline(r_ifbaseline);
        const r_finxp=load("fin_finxp"); if(r_finxp!=null) setFinXp(r_finxp);
        const r_patrimsnaps=load("fin_patrimsnaps"); if(r_patrimsnaps) setPatrimSnaps(r_patrimsnaps);
        const r_boxsnaps=load("fin_boxsnaps"); if(r_boxsnaps) setBoxSnaps(r_boxsnaps);
        const r_catsout=load("fin_catsout"); if(r_catsout) setCatsOut(r_catsout);
        const r_catsin=load("fin_catsin"); if(r_catsin) setCatsIn(r_catsin);
        const r_recurrings=load("fin_recurrings"); if(r_recurrings) setRecurrings(r_recurrings);
        const r_recoverrides=load("fin_recoverrides"); if(r_recoverrides) setRecurringOverrides(r_recoverrides);
        const r_plannedItems=load("fin_plannedItems"); if(r_plannedItems) setPlannedItems(r_plannedItems);
        const r_yesodcards=load("fin_yesodcards"); if(r_yesodcards) setYesodCards(r_yesodcards);
        const r_projevents=load("fin_projevents");
        if(r_projevents) setProjEvents(r_projevents);
        else { const r_projscn_old=load("fin_projscenario"); if(r_projscn_old&&((Number(r_projscn_old.deltaIn)||0)!==0||(Number(r_projscn_old.deltaOut)||0)!==0)) setProjEvents([{id:"pe"+uid(),label:"",deltaIn:r_projscn_old.deltaIn||0,deltaOut:r_projscn_old.deltaOut||0,fromM:r_projscn_old.fromM||0}]); }
        const r_splitpeople=load("fin_splitpeople"); if(r_splitpeople) setSplitPeople(r_splitpeople);
        const r_sharedowed=load("fin_sharedowed"); if(r_sharedowed) setSharedOwed(r_sharedowed);
        const r_scoreweights=load("fin_scoreweights"); if(r_scoreweights) setScoreWeights(p=>({...p,...r_scoreweights}));
        const r_confirmdestructive=load("fin_confirmdestructive"); if(r_confirmdestructive!=null) setConfirmDestructive(r_confirmdestructive);
    } finally { setStorageLoaded(true); }
  };
  useEffect(() => { loadFromStorage(); }, []);
  // o Coach global (App.jsx) executa ações financeiras direto no localStorage — ver
  // yesodActions.js — porque o estado do Yesod vive só aqui, não em App.jsx. Se este
  // módulo estiver montado quando uma ação roda, precisa recarregar do localStorage
  // pra não ficar com a UI desatualizada em relação ao que o coach acabou de mudar.
  useCoachDataSync("yesod", loadFromStorage);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_banks",JSON.stringify(banks));}catch(_){} }, [banks,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_accs",JSON.stringify(accs));}catch(_){} }, [accs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_cards",JSON.stringify(cards));}catch(_){} }, [cards,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_boxes",JSON.stringify(boxes));}catch(_){} }, [boxes,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_debts",JSON.stringify(debts));}catch(_){} }, [debts,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_invs",JSON.stringify(invs));}catch(_){} }, [invs,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_budgets",JSON.stringify(budgets));}catch(_){} }, [budgets,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_yhabits",JSON.stringify(yHabits));}catch(_){} }, [yHabits,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ygoals",JSON.stringify(yGoals));}catch(_){} }, [yGoals,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_catsout",JSON.stringify(catsOut));}catch(_){} }, [catsOut,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_catsin",JSON.stringify(catsIn));}catch(_){} }, [catsIn,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_recurrings",JSON.stringify(recurrings));}catch(_){} }, [recurrings,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_recoverrides",JSON.stringify(recurringOverrides));}catch(_){} }, [recurringOverrides,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_plannedItems",JSON.stringify(plannedItems));}catch(_){} }, [plannedItems,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_yesodcards",JSON.stringify(yesodCards));}catch(_){} }, [yesodCards,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ifgoal",JSON.stringify(ifGoal));}catch(_){} }, [ifGoal,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ifmonthly",JSON.stringify(ifMonthly));}catch(_){} }, [ifMonthly,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_ifbaseline",JSON.stringify(ifBaseline));}catch(_){} }, [ifBaseline,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_finxp",JSON.stringify(finXp));}catch(_){} }, [finXp,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_patrimsnaps",JSON.stringify(patrimSnaps));}catch(_){} }, [patrimSnaps,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_boxsnaps",JSON.stringify(boxSnaps));}catch(_){} }, [boxSnaps,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_projevents",JSON.stringify(projEvents));}catch(_){} }, [projEvents,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_splitpeople",JSON.stringify(splitPeople));}catch(_){} }, [splitPeople,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_sharedowed",JSON.stringify(sharedOwed));}catch(_){} }, [sharedOwed,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_scoreweights",JSON.stringify(scoreWeights));}catch(_){} }, [scoreWeights,storageLoaded]);
  useEffect(() => { if(!storageLoaded) return; try{localStorage.setItem("lifetree_fin_confirmdestructive",JSON.stringify(confirmDestructive));}catch(_){} }, [confirmDestructive,storageLoaded]);
  // Migração pra quem já tinha dados salvos antes da Carteira existir — sem isso,
  // usuários antigos ficariam sem destino pra lançamentos em dinheiro até um "novo" seed.
  useEffect(() => { if(!storageLoaded) return; setAccs(p => p.some(a=>a.id===CASH_ACC_ID) ? p : [...p,{id:CASH_ACC_ID,bankId:null,name:"Carteira",isCash:true,txs:[]}]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLoaded]);

  const bkOf = id => banks.find(b=>b.id===id);
  const nav = (type,id) => setPage({type,id});
  const back = () => setPage(null);
  const close = () => { setSh(null); setF({}); };
  const openSh = (name,init) => { setF(init||{}); setSh(name); };
  // guard() — porta de confirmação pra editar/apagar registros (26/08/2026, ver
  // confirmDestructive em Config → Preferências → Segurança, default ligado). Quando
  // ligado, abre um sheet genérico ("Apagar Conta?" etc.) e só executa `run` se o usuário
  // confirmar; quando desligado, executa na hora, igual o app sempre se comportou antes
  // desta chave existir. Usado nos deletes/edições de ENTIDADE (Conta/Banco/Cartão/
  // Caixinha/Dívida/Investimento/Recorrência/Pessoa/Despesa a pagar) — deletar um
  // lançamento ou categoria isolada continua instantâneo de propósito (baixo risco, alta
  // frequência, guardar isso violaria o princípio de fricção zero do próprio roadmap).
  const guard = (run,msg,danger=true) => { if(!confirmDestructive){run();return;} openSh("confirmGuard",{run,msg,danger}); };
  const today = tod();

  // ── RECORRÊNCIAS → gera lançamentos em atraso desde a última execução ────
  // Recorrências de SAÍDA (exceto crédito, que sempre vai pra fatura sozinha) pararam de
  // disparar sozinhas aqui em 26/08/2026 — viram "conta a pagar" pendente até o usuário
  // confirmar com "Pagar" (permitindo somar juros de atraso); entrada (ex: Salário) e
  // crédito continuam automáticas, sem noção de atraso.
  useEffect(() => {
    if (!storageLoaded) return;
    let generated = 0;
    const updated = recurrings.map(r => {
      if (!r.active) return r;
      if (r.type==="out" && r.method!=="credito") return r;
      let next = r.nextDate;
      const dates = [];
      let guard = 0;
      while (next <= today && guard < 60) { dates.push(next); next = freqAdd(next, r.freq); guard++; }
      if (!dates.length) return r;
      generated += dates.length;
      dates.forEach(date => {
        // Se o usuário ajustou o valor esperado desse mês no drilldown do Fluxo antes da
        // recorrência disparar (recurringOverrides), o lançamento gerado usa esse valor —
        // senão o ajuste seria só decoração no gráfico, sem refletir no que é registrado.
        const overrideKey = date.slice(0,7) + "|" + r.id;
        const amount = Object.prototype.hasOwnProperty.call(recurringOverrides,overrideKey) ? Number(recurringOverrides[overrideKey]) : r.amount;
        const base = { desc: r.desc, amount, type: r.type, date, cat: r.cat };
        if (r.method === "credito" && r.cardId) {
          setCards(p => p.map(c => c.id === r.cardId ? { ...c, txs: [...c.txs, { id: "ct"+uid(), ...base, installments: 1 }] } : c));
        } else if (r.accId) {
          // r.split (config da recorrência) vira split.settled:false em CADA ocorrência gerada
          // — cada mês nasce como pendente de novo, mesmo que o mês anterior já tenha sido acertado.
          setAccs(p => p.map(a => a.id === r.accId ? { ...a, txs: [...a.txs, { id: "t"+uid(), ...base, method: r.method, recurring: r.freq, ...(r.split ? { split: { ...r.split, settled: false } } : {}) }] } : a));
        }
      });
      return { ...r, nextDate: next };
    });
    if (generated > 0) {
      setRecurrings(updated);
      toast_(generated===1 ? "1 lançamento recorrente gerado" : generated+" lançamentos recorrentes gerados", ACCENT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLoaded]);

  // Despesas Divididas — contabilização de verdade (25/08/2026): antes o custo de uma
  // despesa dividida contava sempre cheio em todo lugar (Fluxo/Orçamento/Score) e a parte
  // devida pela outra pessoa não existia em lugar nenhum do sistema — "Marcar acertado" só
  // trocava uma cor, sem gerar nenhum dinheiro. Agora: mySplitShare é o custo que É seu de
  // verdade (desconta a parte do outro, sempre, esteja acertado ou não — a parte dela nunca
  // foi seu gasto); splitReceivable é a parte que ela ainda deve, enquanto não recebida —
  // conta como ativo (a receber) no patrimônio líquido até virar dinheiro de verdade numa
  // conta (ver receiveSplit()). Só transações de CONTA têm split (nunca cartão).
  const mySplitShare = t => t.split ? t.amount*(1-(Number(t.split.theirPercent)||0)/100) : t.amount;
  const splitReceivable = t => (t.split && !t.split.settled) ? t.amount*((Number(t.split.theirPercent)||0)/100) : 0;

  const totAcc = accs.reduce((s,a)=>s+accBal(a),0);
  const totBox = boxes.reduce((s,b)=>s+b.balance,0);
  const totInv = invs.reduce((s,i)=>s+i.balance,0);
  // Fatura de cartão em aberto é passivo igual dívida/financiamento — ficava calculada
  // (totCardDebt) e nunca descontada do patrimônio líquido (bug real encontrado na
  // auditoria de 25/08/2026: net inflava o patrimônio pelo valor total usado nos cartões).
  const totCardDebt = cards.reduce((s,c)=>s+getStmts(c).reduce((ss,st)=>ss+st.total,0),0);
  const totDebtRem = debts.reduce((s,d)=>s+(d.totalParcelas-d.parcelasPagas)*d.valorParcela,0);
  const totReceivable = accs.reduce((s,a)=>s+(a.txs||[]).reduce((ss,t)=>ss+splitReceivable(t),0),0);
  // Espelha totReceivable pro lado inverso: despesa que a outra pessoa pagou e eu ainda
  // devo minha parte é passivo de verdade (mesmo antes de eu pagar), senão o patrimônio
  // líquido ficaria assimétrico — contando o que me devem, mas não o que eu devo.
  const totPayable = sharedOwed.reduce((s,o)=>s+(o.settled?0:Number(o.amount)||0),0);
  const net = totAcc+totBox+totInv-totDebtRem-totCardDebt+totReceivable-totPayable;

  const getMonthStr = offset => { const d=new Date(); d.setMonth(d.getMonth()+offset); return d.toISOString().slice(0,7); };
  const monthLabel2 = ym => { const [y,m]=ym.split("-"); return MTHS[parseInt(m)-1]+"/"+y.slice(2); };
  // allTxs/txsByMonth memoizados (26/08/2026, P10 — ver 04 Bugs Conhecidos.md) — antes
  // allTxs() reconstruía a lista inteira (spread + accLabel por transação) do zero em TODA
  // chamada, e cashflowMonth ainda escaneava essa lista inteira de novo por cima pra achar
  // só o mês pedido — só na view de Fluxo isso rodava mais de 10x por render (vários
  // offsets em loop). txsByMonth agrupa uma vez por accs/cards; cashflowMonth vira um
  // lookup O(1) + soma só das transações daquele mês, em vez de filtrar tudo de novo a
  // cada offset. Invisível com dado de seed, evita degradar conforme o histórico cresce.
  const allTxs = useMemo(() => {
    const txs=[];
    accs.forEach(a=>(a.txs||[]).forEach(t=>txs.push({...t,source:"conta",sourceName:accLabel(a,banks)})));
    cards.forEach(c=>(c.txs||[]).forEach(t=>txs.push({...t,type:t.type||"out",source:"cartao",sourceName:c.name})));
    return txs;
  }, [accs, cards, banks]);
  const txsByMonth = useMemo(() => {
    const map={};
    allTxs.forEach(t=>{ if(!t.date) return; const ym=t.date.slice(0,7); (map[ym]=map[ym]||[]).push(t); });
    return map;
  }, [allTxs]);
  const cashflowMonth = offset => { const ym=getMonthStr(offset); const txs=txsByMonth[ym]||[]; const ins=txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0); const outs=txs.filter(t=>t.type==="out").reduce((s,t)=>s+mySplitShare(t),0); return {ym,ins,outs,balance:ins-outs,txs}; };

  // ── GRÁFICO REALIZADO+ESPERADO (Fluxo de Caixa) ───────────────────────────────
  // ym > mês atual = futuro (projetado a partir de recorrências + plannedItems, editável);
  // ym <= mês atual = realizado (somatório de lançamentos de verdade, só leitura).
  const isFutureYm = ym => ym > getMonthStr(0);
  const monthRange = ym => { const [y,m]=ym.split("-").map(Number); return [ym+"-01", new Date(y,m,0).toISOString().slice(0,10)]; };
  const monthDiff = (fromYm,toYm) => { const [fy,fm]=fromYm.split("-").map(Number); const [ty,tm]=toYm.split("-").map(Number); return (ty-fy)*12+(tm-fm); };
  const recurringAmountFor = (r,ym) => { const key=ym+"|"+r.id; return Object.prototype.hasOwnProperty.call(recurringOverrides,key) ? Number(recurringOverrides[key]) : r.amount; };
  // Retorna { [categoria]: {amount, fromRecurring, recDesc, recId} } pra um mês futuro —
  // cada categoria some as ocorrências de recorrências ativas daquele tipo nesse mês (via
  // stepping de freqAdd, mesmo padrão de projUpcoming) + plannedItems daquele mês/tipo.
  const futureCategoryTotals = (ym,type) => {
    const [mStart,mEnd] = monthRange(ym);
    const totals = {};
    recurrings.filter(r=>r.active&&r.type===type).forEach(r=>{
      let d=r.nextDate, guard=0;
      while (d<=mEnd && guard<60) {
        if (d>=mStart) {
          if (!totals[r.cat]) totals[r.cat]={amount:0,fromRecurring:true,recDesc:r.desc,recId:r.id};
          totals[r.cat].amount += recurringAmountFor(r,ym);
        }
        d=freqAdd(d,r.freq); guard++;
      }
    });
    plannedItems.filter(p=>p.ym===ym&&p.type===type).forEach(p=>{
      if (!totals[p.cat]) totals[p.cat]={amount:0,fromRecurring:false,plannedId:p.id};
      totals[p.cat].amount += Number(p.amount)||0;
    });
    // Fatura de cartão (parcelas ainda por vencer) e parcelas de dívida em aberto (25/08/2026)
    // — sem isso, uma compra parcelada ou uma dívida não apareciam em NENHUM mês futuro do
    // Fluxo, só no mês em que a compra foi feita ou a dívida criada. Somados por fora dos
    // recurrings/plannedItems (que o usuário edita livremente) porque são fatos já
    // conhecidos, não estimativas — por isso `readOnly`, sem input editável na lista.
    if (type==="out") {
      const mi = monthDiff(getMonthStr(0), ym) - 1;
      const cardBurden = cardBurdenAtMonth(mi);
      if (cardBurden > 0) totals["Fatura de Cartão"] = {amount: cardBurden, readOnly:true, note:"parcelas de compras já lançadas nos cartões"};
      const debtBurden = debtBurdenAtMonth(mi);
      if (debtBurden > 0) totals["Parcelas de Dívida"] = {amount: debtBurden, readOnly:true, note:"parcelas em aberto das dívidas cadastradas"};
    }
    return totals;
  };
  const monthTotals = ym => {
    if (!isFutureYm(ym)) {
      const txs = txsByMonth[ym]||[];
      return { ins: txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0), outs: txs.filter(t=>t.type==="out").reduce((s,t)=>s+mySplitShare(t),0) };
    }
    const sumOf = totals => Object.values(totals).reduce((s,v)=>s+v.amount,0);
    return { ins: sumOf(futureCategoryTotals(ym,"in")), outs: sumOf(futureCategoryTotals(ym,"out")) };
  };
  // Custo por categoria também usa mySplitShare (25/08/2026) — mesma lógica: o que é
  // dividido não é gasto seu por inteiro, mesmo antes de ser "acertado".
  const budgetSpend = cat => { const ym=getMonthStr(0); return (txsByMonth[ym]||[]).filter(t=>t.type==="out"&&t.cat===cat).reduce((s,t)=>s+mySplitShare(t),0); };
  const retroPatrimData = useMemo(() => {
    const months=[]; for(let i=-5;i<=0;i++){const d=new Date();d.setMonth(d.getMonth()+i);const ym=d.toISOString().slice(0,7);const endDate=ym+"-31";const accTotal=accs.reduce((s,a)=>s+(a.txs||[]).filter(t=>t.date<=endDate).reduce((ss,t)=>t.type==="in"?ss+t.amount:ss-t.amount,0),0);const debtTotal=debts.reduce((s,d2)=>{const paid=Math.min(d2.totalParcelas,Math.round((new Date(endDate)-new Date(d2.startDate+"T00:00:00"))/(1000*60*60*24*30)));return s+Math.max(0,d2.totalParcelas-paid)*d2.valorParcela;},0);months.push({ym,net:accTotal+totBox+totInv-debtTotal});}const snaps=[...patrimSnaps];months.forEach(m=>{if(!snaps.some(s=>s.ym===m.ym))snaps.push(m);});return snaps.sort((a,b)=>a.ym.localeCompare(b.ym));
  }, [accs, debts, totBox, totInv, patrimSnaps]);
  const retroPatrim = () => retroPatrimData;
  // Snapshot mensal real do patrimônio líquido — sem isso, patrimSnaps existia como chave
  // persistida mas nunca era escrita, então a Evolução Patrimonial ficava travada nos
  // últimos 6 meses reconstruídos on-the-fly (retroPatrimData), sem história de verdade.
  // Atualiza (não duplica) a entrada do mês corrente a cada mudança de "net"; meses
  // passados, uma vez gravados, nunca são reescritos — viram história permanente.
  useEffect(() => {
    if (!storageLoaded) return;
    const ym = getMonthStr(0);
    setPatrimSnaps(prev => {
      const idx = prev.findIndex(s => s.ym === ym);
      if (idx === -1) return [...prev, { ym, net }];
      if (prev[idx].net === net) return prev;
      const next = [...prev]; next[idx] = { ym, net }; return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, storageLoaded]);

  // Snapshot mensal de saldo por Caixinha — mesmo padrão acima (patrimSnaps), uma entrada
  // {ym,boxId,balance} por caixinha por mês, mês corrente atualizado ao vivo.
  useEffect(() => {
    if (!storageLoaded) return;
    const ym = getMonthStr(0);
    setBoxSnaps(prev => {
      let changed = false;
      let next = prev;
      boxes.forEach(b => {
        const idx = next.findIndex(s => s.ym === ym && s.boxId === b.id);
        if (idx === -1) { if(!changed){next=[...next];changed=true;} next.push({ ym, boxId: b.id, balance: b.balance }); }
        else if (next[idx].balance !== b.balance) { if(!changed){next=[...next];changed=true;} next[idx] = { ym, boxId: b.id, balance: b.balance }; }
      });
      return changed ? next : prev;
    });
  }, [boxes, storageLoaded]);

  // ── PROJEÇÃO DE FLUXO DE CAIXA ────────────────────────────────────────────
  // Modelo: média de (entradas−saídas) dos últimos 3 meses (contas+cartões, já reflete
  // recorrências ativas e gasto de cartão — não precisam ser somados de novo) menos as
  // parcelas de dívidas ainda em aberto (dívidas não geram lançamento nenhum hoje, então
  // são o único efeito futuro conhecido que a média histórica NÃO captura) mais o ajuste
  // de cenário do usuário, quando ativo. mi = índice do mês projetado (0 = próximo mês).
  // avgAccountNet3: só transações de CONTA (não cartão) — é a parte "orgânica" do fluxo de
  // caixa que não tem como saber com precisão no futuro, então continua sendo média. Cartão
  // saiu daqui de propósito pra não ser contado duas vezes (ver cardBurdenAtMonth abaixo).
  const avgAccountNet3 = () => {
    const ms=[-3,-2,-1].map(o=>{
      const ym=getMonthStr(o);const txs=[];accs.forEach(a=>(a.txs||[]).forEach(t=>{if(t.date&&t.date.startsWith(ym))txs.push(t);}));
      return txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0)-txs.filter(t=>t.type==="out").reduce((s,t)=>s+mySplitShare(t),0);
    });
    return ms.reduce((s,v)=>s+v,0)/ms.length;
  };
  const debtBurdenAtMonth = mi => debts.reduce((s,d)=>{const rem=d.totalParcelas-d.parcelasPagas;return mi<rem?s+d.valorParcela:s;},0);
  // cardBurdenAtMonth: soma exata das faturas com vencimento no mês projetado mi (0=próximo
  // mês), parcela a parcela via getStmts (que já sabe a data de vencimento de cada parcela
  // pendente) — não mais média histórica. Resolve a limitação "cartões entram só via média".
  const cardBurdenAtMonth = mi => {
    const targetYm = getMonthStr(mi+1);
    let total=0;
    cards.forEach(c=>{ getStmts(c).forEach(st=>{ if (st.due>=today && st.due.startsWith(targetYm)) total+=st.total; }); });
    return total;
  };
  // eventsDeltaAtMonth: soma de TODOS os eventos de cenário ativos nesse mês — antes só
  // existia um delta único; agora suporta múltiplos eventos simultâneos (ex: "aumento em
  // março" + "viagem em julho" na mesma projeção), cada um com seu próprio fromM.
  const eventsDeltaAtMonth = (mi, events) => (events||[]).reduce((s,ev)=>mi>=(ev.fromM||0)?s+((Number(ev.deltaIn)||0)-(Number(ev.deltaOut)||0)):s,0);
  const projMonthlyNet = (mi, events) => avgAccountNet3() - cardBurdenAtMonth(mi) - debtBurdenAtMonth(mi) + eventsDeltaAtMonth(mi, events);
  const buildProjSeries = (horizonDays, events) => {
    const points=[{x:0,date:today,balance:totAcc}];
    if (horizonDays<=90) {
      let bal=totAcc;
      for (let d=1; d<=horizonDays; d++) { const mi=Math.floor((d-1)/30.44); bal+=projMonthlyNet(mi,events)/30.44; points.push({x:d,date:addDays(today,d),balance:bal}); }
    } else {
      const months=Math.round(horizonDays/30.44);
      let bal=totAcc;
      for (let m=1; m<=months; m++) { bal+=projMonthlyNet(m-1,events); points.push({x:m,date:addM(today,m),balance:bal}); }
    }
    return points;
  };
  const projMilestones = horizonDays => {
    const months=Math.ceil(horizonDays/30.44); const out=[];
    debts.forEach(d=>{ const rem=d.totalParcelas-d.parcelasPagas; if (rem>0 && rem<=months) out.push({date:addM(today,rem),label:d.name+" quitada",detail:"libera "+fmt(d.valorParcela)+"/mês",color:ACCENT}); });
    return out.sort((a,b)=>a.date.localeCompare(b.date));
  };
  const projUpcoming = horizonDays => {
    const endDate=addDays(today,horizonDays); const out=[];
    recurrings.filter(r=>r.active).forEach(r=>{ let d=r.nextDate,guard=0; while(d<=endDate&&guard<40){ out.push({date:d,desc:r.desc,amount:r.amount,type:r.type}); d=freqAdd(d,r.freq); guard++; } });
    debts.forEach(d=>{ if(d.parcelasPagas>=d.totalParcelas) return; const due=nextMonthlyDue(d.dueDay,today); if(due<=endDate) out.push({date:due,desc:d.name+" · parcela",amount:d.valorParcela,type:"out"}); });
    return out.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,14);
  };

  // ── PROJEÇÃO DA META IF ── ligada ao projMonthlyNet (não mais média histórica pura) —
  // achado 29/08/2026: o cálculo de "quanto falta" da meta IF usava só a média dos últimos
  // 3 meses de transações reais (cashflowMonth), que já existia só como estatística. Uma
  // dívida nova cadastrada hoje só "aparecia" nesse cálculo depois de 3 meses pagando ela.
  // projMonthlyNet(0,...) já soma debtBurdenAtMonth desde o mês em que a dívida é criada —
  // trocar a fonte resolve o atraso sem duplicar a conta de dívida em outro lugar.
  const ifNeeded = ifGoal || ifMonthly*300;
  // ifConfigured: false enquanto o usuário nunca definiu a meta (ifGoal/ifMonthly ainda em
  // 0, o default de "nunca configurado") — controla se o card de sempre aparece ou se mostra
  // o estado vazio (ver ObjetivosTab.jsx), e se isso é publicado pro Kether ler.
  const ifConfigured = ifNeeded > 0;
  const ifCapacity = projMonthlyNet(0, projEvents);
  const ifMonthsLeft = (ifConfigured && ifCapacity>0) ? Math.ceil((ifNeeded-net)/ifCapacity) : null;
  const ifProjection = { ifNeeded, net, capacity: ifCapacity, monthsLeft: ifMonthsLeft, yearsLeft: ifMonthsLeft!=null ? Number((ifMonthsLeft/12).toFixed(1)) : null };

  // ifBaseline: capturado automaticamente na 1ª vez que a projeção roda (lazy init, cobre
  // quem já tinha a meta IF configurada antes desta mudança) — depois disso só muda via
  // YESOD_ACTION_HANDLERS.reset_if_baseline (yesodActions.js), chamado pelo Kether ao criar
  // o plano ou pelo botão "Recalcular base" aqui — nunca sozinho a cada render. É uma função
  // pura fora do Context de propósito, pra ser chamável do Kether sem o Yesod estar montado.
  useEffect(() => {
    if (!storageLoaded || ifBaseline || !ifConfigured) return;
    setIfBaseline({ capturedAt: today, monthsLeft: ifMonthsLeft, net });
  }, [storageLoaded, ifBaseline, ifConfigured, ifMonthsLeft, net, today]);

  // ifRisk: "fora da rota" = a meta atrasou 2 meses ou mais desde a base. A dívida específica
  // apontada como causa é achada comparando startDate das dívidas com a data da base — não é
  // um diff genérico de todo o estado financeiro, só cobre o caso concreto (dívida nova) que
  // motivou isso; queda de renda sem dívida nova ainda cai no motivo genérico abaixo.
  const ifRisk = (() => {
    if (!ifBaseline || ifMonthsLeft==null || ifBaseline.monthsLeft==null) return { atRisk:false };
    const delta = ifMonthsLeft - ifBaseline.monthsLeft;
    if (delta < 2) return { atRisk:false, delta };
    const newDebts = debts.filter(d => d.startDate && d.startDate >= ifBaseline.capturedAt);
    const newDebtBurden = newDebts.reduce((s,d)=>s+d.valorParcela,0);
    const reason = newDebts.length
      ? newDebts.map(d=>d.name).join(", ")+" adiciona"+(newDebts.length>1?"m":"")+" "+fmt(newDebtBurden)+"/mês de comprometimento"
      : "a capacidade de poupança caiu desde que o plano foi criado";
    return { atRisk:true, delta, reason };
  })();

  // Publica pro Kether ler via readOtherModule (mesmo padrão read-only de yesodCards/score) —
  // Kether não tem acesso ao contexto do Yesod, só ao que foi persistido aqui.
  useEffect(() => {
    if (!storageLoaded) return;
    // Sem meta configurada: remove a chave em vez de publicar zero — o Kether já tem o gate
    // `{ifStatus && (...)}` pronto, então some o card de lá também sem precisar de lógica nova.
    if (!ifConfigured) { try { localStorage.removeItem("lifetree_fin_ifstatus"); } catch(_) {} return; }
    try { localStorage.setItem("lifetree_fin_ifstatus", JSON.stringify({ projection: ifProjection, risk: ifRisk })); } catch(_) {}
  }, [ifMonthsLeft, net, ifNeeded, ifConfigured, ifRisk.atRisk, ifRisk.reason, storageLoaded]);

  // ── SCORE BRIDGE → publica score do Yesod para a Árvore ──────────────────
  useEffect(() => {
    if (!storageLoaded) return;
    const score = calcYesodScore();
    if (typeof window.publishScore === "function") {
      window.publishScore("yesod", score);
    } else {
      // fallback direto no localStorage
      try {
        const raw = localStorage.getItem("lifetree_scores");
        const scores = raw ? JSON.parse(raw) : {};
        scores["yesod"] = { score, updatedAt: new Date().toISOString() };
        localStorage.setItem("lifetree_scores", JSON.stringify(scores));
      } catch(e) {}
    }
  }, [banks, accs, cards, boxes, debts, invs, budgets, scoreWeights, storageLoaded]);
  // Fórmula de Saúde Financeira — recomposta em 26/08/2026 (pesos configuráveis em Config,
  // ver scoreWeights acima). Problemas da fórmula antiga que motivaram a mudança:
  // (1) hábitos/metas nunca "resetavam" — uma vez marcado feito, ficava feito pra sempre,
  //     então essa fatia (25% somados) só crescia, nunca refletia comportamento atual. Saiu
  //     do cálculo — hábitos/metas continuam dando XP e aparecendo na Visão Geral, só não
  //     entram mais no %.
  // (2) progresso de dívida era média simples entre dívidas, sem pesar pelo saldo — uma
  //     dívida de R$500 quitada e uma de R$50.000 intocada empatavam em 50%. Agora pondera
  //     pelo valor total de cada dívida (equivalente a 1 − saldo_devedor/valor_original).
  // (3) orçamento era binário (dentro/fora do limite) — estourar 1% ou 500% pontuava igual.
  //     Agora mede a distância proporcional ao limite por categoria.
  // (4) não existia reserva de emergência no score, apesar do módulo já ter tudo pra
  //     calcular isso (contas+caixinhas ÷ gasto médio mensal). Componente novo.
  // (5) IF pesava 25% mas é uma métrica de décadas — dominava o score de quem está no
  //     início da jornada mesmo com disciplina diária impecável. Peso reduzido.
  const calcYesodScore = () => {
    const cf0=cashflowMonth(-1);
    const savRate=cf0.ins>0?Math.max(0,(cf0.ins-cf0.outs)/cf0.ins):0;
    const savS=Math.min(1,savRate/0.2);

    const totalDebtOriginal=debts.reduce((s,d)=>s+d.totalParcelas*d.valorParcela,0);
    const debtS=debts.length===0?1:(totalDebtOriginal>0?Math.max(0,1-totDebtRem/totalDebtOriginal):1);

    const budS=budgets.length===0?0.5:budgets.reduce((s,b)=>{
      const spend=budgetSpend(b.cat);
      const catScore=spend<=b.limit?1:Math.max(0,1-(spend-b.limit)/b.limit);
      return s+catScore;
    },0)/budgets.length;

    const avgMonthlyExpense=[-1,-2,-3].reduce((s,o)=>s+cashflowMonth(o).outs,0)/3;
    const emergTarget=scoreWeights.emergencyTargetMonths||6;
    const emergMonths=avgMonthlyExpense>0?(totAcc+totBox)/avgMonthlyExpense:0;
    const emergS=Math.min(1,emergMonths/emergTarget);

    const ifN=ifGoal||ifMonthly*300||1;
    const ifS=Math.min(1,net/ifN);

    const w=scoreWeights;
    const totalW=(Number(w.savRate)||0)+(Number(w.debt)||0)+(Number(w.budget)||0)+(Number(w.emergency)||0)+(Number(w.if)||0);
    if(totalW<=0)return 0;
    return Math.round(((savS*(Number(w.savRate)||0)+debtS*(Number(w.debt)||0)+budS*(Number(w.budget)||0)+emergS*(Number(w.emergency)||0)+ifS*(Number(w.if)||0))/totalW)*100);
  };

  // ── ALERTAS DE VENCIMENTO ── separados em ATRASADOS (parcela de dívida vencida sem
  // registrar pagamento, recorrência de saída pendente de confirmação) e PRÓXIMOS (fatura/
  // parcela nos próximos 7 dias) — 26/08/2026, ver "Atraso e juros" no changelog.
  // debtDueDates: cronograma completo de vencimentos da dívida (1 data por parcela), a
  // partir de startDate+dueDay — permite saber se o usuário está "em dia" comparando quantas
  // datas já passaram com parcelasPagas, em vez de assumir sempre pontualidade.
  const debtDueDates = d => {
    const start = new Date(d.startDate+"T12:00:00");
    let y = start.getFullYear(), m = start.getMonth();
    if (start.getDate() > d.dueDay) { m++; if (m > 11) { m = 0; y++; } }
    const dates = [];
    for (let i=0;i<d.totalParcelas;i++) { dates.push(new Date(y,m,d.dueDay).toISOString().slice(0,10)); m++; if (m > 11) { m = 0; y++; } }
    return dates;
  };
  const debtLateInfo = d => {
    const dates = debtDueDates(d);
    const expected = dates.filter(dt => dt <= today).length;
    const atraso = Math.max(0, expected - d.parcelasPagas);
    return { atraso, oldestDue: atraso>0 ? dates[d.parcelasPagas] : null, nextDue: d.parcelasPagas<d.totalParcelas ? dates[d.parcelasPagas] : null };
  };
  // recorrência de SAÍDA (exceto crédito, que sempre cai na fatura sozinha) — datas ainda
  // não confirmadas com "Pagar" e já vencidas; type "in" e method "credito" continuam
  // lançando sozinhas (ver useEffect de recorrências abaixo), sem noção de atraso.
  const recurringPendingDates = r => {
    if (!r.active || r.type!=="out" || r.method==="credito") return [];
    const out = []; let dt = r.nextDate, guard = 0;
    while (dt <= today && guard < 60) { out.push(dt); dt = freqAdd(dt, r.freq); guard++; }
    return out;
  };
  const vencimentoAlerts = () => {
    const overdue = [], upcoming = [];
    cards.forEach(cd => {
      const stmts = getStmts(cd);
      const next = stmts.find(s => s.due >= today);
      if (next) {
        const days = Math.round((new Date(next.due) - new Date(today)) / 864e5);
        if (days <= 7) upcoming.push({ id: "card-"+cd.id, label: cd.name+" · fatura", amount: next.total, days, color: cd.color, kind:"card", ref:cd.id });
      }
    });
    debts.forEach(d => {
      if (d.parcelasPagas >= d.totalParcelas) return;
      const li = debtLateInfo(d);
      if (li.atraso > 0) {
        const days = Math.round((new Date(today) - new Date(li.oldestDue)) / 864e5);
        overdue.push({ id: "debt-"+d.id, label: d.name+" · "+li.atraso+" parcela"+(li.atraso>1?"s":"")+" em atraso", amount: d.valorParcela*li.atraso, days, color: d.color, kind:"debt", ref:d.id, qtd: li.atraso });
      } else if (li.nextDue) {
        const days = Math.round((new Date(li.nextDue) - new Date(today)) / 864e5);
        if (days <= 7) upcoming.push({ id: "debt-"+d.id, label: d.name+" · parcela", amount: d.valorParcela, days, color: d.color, kind:"debt", ref:d.id, qtd:1 });
      }
    });
    recurrings.forEach(r => {
      const pend = recurringPendingDates(r);
      if (pend.length) {
        const days = Math.round((new Date(today) - new Date(pend[0])) / 864e5);
        overdue.push({ id: "rec-"+r.id, label: r.desc+(pend.length>1?" · "+pend.length+" pendentes":""), amount: r.amount*pend.length, days, color:"#f97316", kind:"recurring", ref:r.id, dueDate:pend[0] });
      }
    });
    return { overdue: overdue.sort((a,b)=>b.days-a.days), upcoming: upcoming.sort((a,b)=>a.days-b.days) };
  };

  // CRUD actions
  const addBank=()=>{if(!f.name)return;setBanks(p=>[...p,{id:"b"+uid(),name:f.name,color:f.color||ACCENT}]);toast_("Banco adicionado");close();};
  const editBank=()=>{setBanks(p=>p.map(b=>b.id===f.id?{...b,name:f.name,color:f.color}:b));toast_("Banco atualizado");close();};
  const delBank=id=>{setBanks(p=>p.filter(b=>b.id!==id));toast_("Banco removido");};
  const addAcc=()=>{if(!f.name)return;setAccs(p=>[...p,{id:"a"+uid(),bankId:f.bankId,name:f.name,txs:[]}]);toast_("Conta adicionada");close();};
  const editAcc=()=>{setAccs(p=>p.map(a=>a.id===f.id?{...a,bankId:f.bankId,name:f.name}:a));toast_("Conta atualizada");close();};
  const delAcc=id=>{setAccs(p=>p.filter(a=>a.id!==id));toast_("Conta removida");};
  const addCard=()=>{if(!f.name)return;setCards(p=>[...p,{id:"c"+uid(),bankId:f.bankId,name:f.name,limit:Number(f.limit)||5000,closeDay:Number(f.closeDay)||10,dueDay:Number(f.dueDay)||25,color:f.color||ACCENT,txs:[]}]);toast_("Cartão adicionado");close();};
  const editCard=()=>{setCards(p=>p.map(c=>c.id===f.id?{...c,bankId:f.bankId,name:f.name,limit:Number(f.limit),closeDay:Number(f.closeDay),dueDay:Number(f.dueDay),color:f.color}:c));toast_("Cartão atualizado");close();};
  const delCard=id=>{setCards(p=>p.filter(c=>c.id!==id));toast_("Cartão removido");};
  const addBox=()=>{if(!f.name)return;setBoxes(p=>[...p,{id:"bx"+uid(),name:f.name,goal:Number(f.goal)||0,targetDate:f.targetDate||"",color:f.color||ACCENT,balance:0,rate:Number(f.rate)||0,rateUnit:f.rateUnit||"ano"}]);toast_("Caixinha criada");close();};
  const editBox=()=>{setBoxes(p=>p.map(b=>b.id===f.id?{...b,name:f.name,goal:Number(f.goal),targetDate:f.targetDate||"",color:f.color,rate:Number(f.rate)||0,rateUnit:f.rateUnit||"ano"}:b));toast_("Caixinha atualizada");close();};
  const delBox=id=>{setBoxes(p=>p.filter(b=>b.id!==id));toast_("Caixinha removida");};
  // Criar dívida credita o PRINCIPAL recebido numa conta (25/08/2026) — separado da soma
  // das parcelas, que já embute juros e não é o valor que efetivamente entrou na conta.
  const addDebt=()=>{
    if(!f.name)return;
    setDebts(p=>[...p,{id:"d"+uid(),name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas)||12,parcelasPagas:Number(f.parcelasPagas)||0,valorParcela:Number(f.valorParcela)||0,dueDay:Number(f.dueDay)||10,startDate:f.startDate||today,color:f.color||"#ef4444",taxaJuros:Number(f.taxaJuros)||0,taxaJurosUnit:f.taxaJurosUnit||"ano"}]);
    const valorRecebido=Number(f.valorRecebido)||0;
    if(valorRecebido>0&&f.accId){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Empréstimo: "+f.name,amount:valorRecebido,type:"in",date:f.startDate||today,cat:"Empréstimo",method:"ted"}]}:a));
    }
    toast_("Dívida adicionada","#f97316");close();
  };
  const editDebt=()=>{setDebts(p=>p.map(d=>d.id===f.id?{...d,name:f.name,credor:f.credor||"",totalParcelas:Number(f.totalParcelas),parcelasPagas:Number(f.parcelasPagas),valorParcela:Number(f.valorParcela),dueDay:Number(f.dueDay),startDate:f.startDate,color:f.color,taxaJuros:Number(f.taxaJuros)||0,taxaJurosUnit:f.taxaJurosUnit||"ano"}:d));toast_("Dívida atualizada");close();};
  // Registrar parcela paga agora exige conta (25/08/2026) — era a única ação de dívida que
  // mexia em parcelasPagas sem debitar dinheiro de lugar nenhum.
  const payDebt=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const qtd=Math.max(1,Number(f.qtd||1));
    const valor=qtd*d.valorParcela;
    const juros=Number(f.jurosAtraso)||0;
    const newTxs=[{id:"t"+uid(),desc:"Parcela "+d.name,amount:valor,type:"out",date:today,cat:"Pagamento de dívida",method:"ted"}];
    if(juros>0) newTxs.push({id:"t"+uid(),desc:"Juros de atraso: "+d.name,amount:juros,type:"out",date:today,cat:"Juros de atraso",method:"ted"});
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,...newTxs]}:a));
    setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:Math.min(x.totalParcelas,x.parcelasPagas+qtd)}:x));
    toast_("Pagamento registrado",ACCENT);close();
  };
  // Confirma UMA ocorrência pendente de uma recorrência de saída (26/08/2026) — recorrências
  // de saída (exceto crédito) pararam de lançar sozinhas, ver useEffect abaixo; o usuário
  // confirma aqui, podendo somar juros de atraso como lançamento à parte.
  const payRecurringOccurrence=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const r=recurrings.find(x=>x.id===f.recurringId);if(!r)return;
    const dueDate=f.dueDate;
    const overrideKey=dueDate.slice(0,7)+"|"+r.id;
    const amount=Object.prototype.hasOwnProperty.call(recurringOverrides,overrideKey)?Number(recurringOverrides[overrideKey]):r.amount;
    const juros=Number(f.jurosAtraso)||0;
    const newTxs=[{id:"t"+uid(),desc:r.desc,amount,type:"out",date:dueDate,cat:r.cat,method:r.method,recurring:r.freq,...(r.split?{split:{...r.split,settled:false}}:{})}];
    if(juros>0) newTxs.push({id:"t"+uid(),desc:"Juros de atraso: "+r.desc,amount:juros,type:"out",date:today,cat:"Juros de atraso",method:"ted"});
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,...newTxs]}:a));
    setRecurrings(p=>p.map(x=>x.id===r.id?{...x,nextDate:freqAdd(dueDate,x.freq)}:x));
    toast_("Pagamento registrado",ACCENT);close();
  };
  // "Marcar em dia" (26/08/2026) — o cronograma de vencimento é inferido de startDate+dueDay
  // (ver debtLateInfo), assumindo 1 parcela paga por mês desde o início do contrato. Uma
  // dívida cadastrada com parcelasPagas que não reflete esse ritmo exato (ex: histórico
  // migrado de outro controle) aparece com atraso "fantasma". Isso só reancora startDate pra
  // que o cronograma bata com o presente — não toca parcelasPagas/valorParcela/totalParcelas,
  // é só recalibração de data, sem efeito financeiro nenhum.
  const recalibrarCronogramaDivida=debtId=>{
    setDebts(p=>p.map(x=>{
      if(x.id!==debtId) return x;
      const nd=nextMonthlyDue(x.dueDay,today);
      const ndDate=new Date(nd+"T12:00:00");
      const anchor=new Date(ndDate.getFullYear(),ndDate.getMonth()-x.parcelasPagas,1);
      return {...x,startDate:anchor.toISOString().slice(0,10)};
    }));
    toast_("Cronograma recalibrado",ACCENT);
  };
  // Amortização (25/08/2026) — paga um valor extra (por R$ ou por nº de parcelas) além do
  // fluxo normal de parcelas, com escolha de reduzir prazo (mantém valor da parcela, quita
  // parcelas finais) ou reduzir parcela (mantém nº de parcelas, diminui o valor de cada
  // uma). Sempre debita de uma conta.
  const amortizarDivida=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const remaining=(d.totalParcelas-d.parcelasPagas)*d.valorParcela;
    if(remaining<=0)return;
    if(f.mode==="parcelas"){
      const qtd=Math.max(1,Math.min(d.totalParcelas-d.parcelasPagas,Number(f.qtd||1)));
      const amortValue=qtd*d.valorParcela;
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Amortização "+d.name,amount:amortValue,type:"out",date:today,cat:"Amortização de dívida",method:"ted"}]}:a));
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:x.parcelasPagas+qtd}:x));
      toast_("Amortização registrada",ACCENT);close();
      return;
    }
    const amortValue=Math.max(0,Math.min(Number(f.value)||0,remaining));
    if(amortValue<=0){toast_("Informe um valor válido","#ef4444");return;}
    const remainingAfter=remaining-amortValue;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Amortização "+d.name,amount:amortValue,type:"out",date:today,cat:"Amortização de dívida",method:"ted"}]}:a));
    if(f.effect==="parcela"){
      const remainingInstallments=d.totalParcelas-d.parcelasPagas;
      const newValorParcela=remainingAfter<=0?0:remainingAfter/remainingInstallments;
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,valorParcela:newValorParcela,...(remainingAfter<=0?{parcelasPagas:x.totalParcelas}:{})}:x));
    }else{
      const newTotalParcelas=remainingAfter<=0?d.parcelasPagas:d.parcelasPagas+Math.ceil(remainingAfter/d.valorParcela);
      setDebts(p=>p.map(x=>x.id===f.debtId?{...x,totalParcelas:newTotalParcelas}:x));
    }
    toast_("Amortização registrada",ACCENT);close();
  };
  // Quitação geral (25/08/2026) — paga o saldo devedor inteiro de uma vez, de uma conta.
  const quitarDivida=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const d=debts.find(x=>x.id===f.debtId);if(!d)return;
    const remaining=(d.totalParcelas-d.parcelasPagas)*d.valorParcela;
    if(remaining<=0)return;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Quitação "+d.name,amount:remaining,type:"out",date:today,cat:"Quitação de dívida",method:"ted"}]}:a));
    setDebts(p=>p.map(x=>x.id===f.debtId?{...x,parcelasPagas:x.totalParcelas}:x));
    toast_("Dívida quitada",ACCENT);close();
  };
  const delDebt=id=>{setDebts(p=>p.filter(d=>d.id!==id));toast_("Dívida removida");};
  // Criar investimento com "Aplicado" > 0 credita o valor numa conta (25/08/2026, mesmo
  // gap encontrado e corrigido pra criar dívida) — antes o valor "aparecia" direto no
  // investimento sem debitar de lugar nenhum.
  const addInv=()=>{
    if(!f.name)return;
    setInvs(p=>[...p,{id:"i"+uid(),bankId:f.bankId,subCat:f.subCat,name:f.name,invested:Number(f.invested)||0,balance:Number(f.balance)||0,rate:f.rate||"",maturity:f.maturity||""}]);
    const invested=Number(f.invested)||0;
    if(invested>0&&f.accId){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Aporte inicial: "+f.name,amount:invested,type:"out",date:today,cat:"Investimento",method:"ted"}]}:a));
    }
    toast_("Investimento adicionado");close();
  };
  const editInv=()=>{setInvs(p=>p.map(i=>i.id===f.id?{...i,name:f.name,invested:Number(f.invested),balance:Number(f.balance),rate:f.rate,maturity:f.maturity}:i));toast_("Atualizado");close();};
  const delInv=id=>{setInvs(p=>p.filter(i=>i.id!==id));toast_("Removido");};
  const checkin=()=>{setInvs(p=>p.map(i=>i.id===f.invId?{...i,balance:Number(f.balance)}:i));toast_("Saldo atualizado");close();};
  // Aportar/Resgatar (25/08/2026) — antes só existia "Atualizar saldo" (checkin, acima),
  // que sobrescreve o valor sem nenhuma ligação com conta nem rastro de aporte/resgate.
  // Aportar/Resgatar movimentam uma conta de verdade, igual ao Depositar/Retirar de
  // Caixinha (boxMoveLinked) e ao modo Transferir do launch().
  const invAportar=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const amount=Number(f.amount);
    const inv=invs.find(i=>i.id===f.invId);
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Aporte em "+(inv?.name||""),amount,type:"out",date:f.date||today,cat:"Investimento",method:"ted"}]}:a));
    setInvs(p=>p.map(i=>i.id===f.invId?{...i,invested:i.invested+amount,balance:i.balance+amount}:i));
    toast_("Aporte registrado",ACCENT);close();
  };
  const invResgatar=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const inv=invs.find(i=>i.id===f.invId);if(!inv)return;
    const amount=Math.min(Number(f.amount),inv.balance);
    if(amount<=0)return;
    // Resgate reduz invested proporcionalmente ao que saiu do balance, pra manter o %
    // de rendimento coerente antes/depois de um resgate parcial (confirmado com o usuário).
    const proportion=inv.balance>0?amount/inv.balance:1;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Resgate de "+inv.name,amount,type:"in",date:f.date||today,cat:"Investimento",method:"ted"}]}:a));
    setInvs(p=>p.map(i=>i.id===f.invId?{...i,balance:i.balance-amount,invested:Math.max(0,i.invested-i.invested*proportion)}:i));
    toast_("Resgate registrado",ACCENT);close();
  };
  const addCatOut=()=>{const name=(f.name||"").trim();if(!name||catsOut.includes(name))return;setCatsOut(p=>[...p,name]);toast_("Categoria adicionada");close();};
  const addCatIn=()=>{const name=(f.name||"").trim();if(!name||catsIn.includes(name))return;setCatsIn(p=>[...p,name]);toast_("Categoria adicionada");close();};
  const delCatOut=name=>setCatsOut(p=>p.filter(c=>c!==name));
  const delCatIn=name=>setCatsIn(p=>p.filter(c=>c!==name));
  const toggleRecurring=id=>setRecurrings(p=>p.map(r=>r.id===id?{...r,active:!r.active}:r));
  const delRecurring=id=>{setRecurrings(p=>p.filter(r=>r.id!==id));toast_("Recorrência removida");};
  // FIX 3: validate amount > 0
  // Depósito/retirada de Caixinha SEMPRE ligado a uma conta (25/08/2026) — antes só
  // ajustava boxes[].balance isolado, dinheiro "aparecia"/"desaparecia" sem sair de lugar
  // nenhum. Mesma ideia já usada no modo Transferir do launch() (linha ~558): tx real na
  // conta + ajuste do outro lado.
  const boxMoveLinked=()=>{
    if(!f.amount||Number(f.amount)<=0){toast_("Informe um valor válido","#ef4444");return;}
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const amount=Number(f.amount);
    const box=boxes.find(b=>b.id===f.boxId);
    const boxName=box?.name||"";
    if(f.moveType==="in"){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Depósito em "+boxName,amount,type:"out",date:f.date,cat:"Transferência",method:"ted"}]}:a));
      setBoxes(p=>p.map(b=>b.id===f.boxId?{...b,balance:b.balance+amount}:b));
    }else{
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Retirada de "+boxName,amount,type:"in",date:f.date,cat:"Transferência",method:"ted"}]}:a));
      setBoxes(p=>p.map(b=>b.id===f.boxId?{...b,balance:b.balance-amount}:b));
    }
    toast_("Movimentação registrada");close();
  };
  const delAccTx=(aId,tId)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.filter(t=>t.id!==tId)}:a));
  const editAccTx=(aId,tx)=>setAccs(p=>p.map(a=>a.id===aId?{...a,txs:a.txs.map(t=>t.id===tx.id?{...t,...tx}:t)}:a));
  const delCardTx=(cId,tId)=>setCards(p=>p.map(c=>c.id===cId?{...c,txs:c.txs.filter(t=>t.id!==tId)}:c));
  // Editar lançamento — pode trocar de conta (inclusive Carteira ↔ conta bancária), o que
  // exige mover a transação de array (não só patchar no lugar). f.origAccId é a conta de
  // onde a transação foi aberta pra edição; f.accId é a conta escolhida agora no form.
  // f.splitSettled nunca é alterado pela UI de edição (26/08/2026, ver sheet "editTx") — só
  // carrega o valor original da transação, pra essa função nunca mudar status financeiro
  // sem dinheiro ter se movido de verdade (só receiveSplit/paySplit/netSettle fazem isso).
  const saveEditTx=()=>{
    if(!f.desc||!f.amount)return;
    const targetId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;
    if(!targetId){toast_("Selecione uma conta","#ef4444");return;}
    const payload={id:f.id,desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||"",...(f.splitOn&&f.splitPersonId?{split:{personId:f.splitPersonId,theirPercent:Number(f.splitPercent)||50,settled:!!f.splitSettled}}:{})};
    if(targetId===f.origAccId){
      editAccTx(f.origAccId,payload);
    }else{
      setAccs(p=>p.map(a=>{
        if(a.id===f.origAccId)return{...a,txs:a.txs.filter(t=>t.id!==f.id)};
        if(a.id===targetId)return{...a,txs:[...a.txs,payload]};
        return a;
      }));
    }
    toast_("Atualizado");close();
  };
  // ── DIVISÃO DE DESPESAS — pessoas + toggle de "já recebi/paguei minha parte" ─────
  // settlementMode por pessoa (26/08/2026): "item" (padrão) acerta cada despesa dividida
  // separadamente, como sempre funcionou; "net" agrupa TODAS as pendências (a receber E a
  // pagar) daquela pessoa numa única linha com o saldo líquido — só uma transação fecha
  // tudo de uma vez. Configurável em Config → Pessoas, não é global: cada pessoa tem o modo
  // que fizer sentido pra frequência de acerto com ela.
  const addSplitPerson=()=>{const name=(f.name||"").trim();if(!name)return;setSplitPeople(p=>[...p,{id:"sp"+uid(),name,settlementMode:"item"}]);toast_("Pessoa adicionada");close();};
  const delSplitPerson=id=>setSplitPeople(p=>p.filter(x=>x.id!==id));
  const setSplitPersonMode=(id,mode)=>setSplitPeople(p=>p.map(x=>x.id===id?{...x,settlementMode:mode}:x));
  const pendingSplits=()=>{const out=[];accs.forEach(a=>(a.txs||[]).forEach(t=>{if(t.split)out.push({...t,accId:a.id,accName:accLabel(a,banks)});}));return out.sort((a,b)=>(a.split.settled===b.split.settled?0:a.split.settled?1:-1)||b.date.localeCompare(a.date));};
  // Registrar recebimento de uma despesa dividida (25/08/2026) — substitui o antigo
  // toggleSplitSettled (só trocava uma cor, sem mexer em dinheiro nenhum). Agora lança de
  // verdade uma entrada na conta escolhida (o dinheiro que a outra pessoa te devolveu) e só
  // então marca a transação original como acertada — mesmo princípio de "tudo ligado a
  // conta" já usado em Caixinha/Investimento/Dívida. f vem preenchido por openSh("receiveSplit",
  // {origAccId,txId,origDesc,theirs,accId:""}).
  const receiveSplit=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const theirs=Number(f.theirs)||0;
    setAccs(p=>p.map(a=>{
      let next=a;
      if(a.id===f.origAccId) next={...next,txs:next.txs.map(t=>t.id===f.txId?{...t,split:{...t.split,settled:true}}:t)};
      if(a.id===f.accId) next={...next,txs:[...next.txs,{id:"t"+uid(),desc:"Reembolso: "+f.origDesc,amount:theirs,type:"in",date:today,cat:"Reembolso",method:"ted"}]};
      return next;
    }));
    toast_("Reembolso registrado",ACCENT);close();
  };
  // ── SENTIDO INVERSO — outra pessoa pagou, eu devo minha parte ───────────────────────
  // Criado dentro do próprio launch() (26/08/2026, ver "DIVIDIR DESPESA" no sheet de
  // Registrar) via f.payer==="other" — não tem sheet/botão dedicado: é só mais uma opção
  // do fluxo normal de lançamento, já que "quem pagou" é parte natural de "dividir despesa".
  // delOwed: apaga um registro feito errado (não tem transação de conta associada, então
  // apagar aqui é seguro — não deixa lançamento nenhum órfão).
  // paySplit: é o que de fato lança a saída na conta escolhida e só então marca como pago
  // — mesmo princípio de receiveSplit/quitarDivida, nunca marca "pago" sem gerar a
  // transação real primeiro.
  const delOwed=id=>{setSharedOwed(p=>p.filter(o=>o.id!==id));toast_("Removido");};
  const paySplit=()=>{
    if(!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    const o=sharedOwed.find(x=>x.id===f.owedId);if(!o)return;
    setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:"Pagamento a "+(f.personName||"?")+": "+o.desc,amount:o.amount,type:"out",date:today,cat:o.cat||"Divisão de despesas",method:"ted"}]}:a));
    setSharedOwed(p=>p.map(x=>x.id===o.id?{...x,settled:true}:x));
    toast_("Pagamento registrado","#ef4444");close();
  };
  // Acerto líquido (26/08/2026, modo "net") — fecha TODAS as pendências abertas com a pessoa
  // de uma vez: soma tudo que ela deve a você (receivables) menos tudo que você deve a ela
  // (sharedOwed) e lança só a diferença como UMA transação (entrada se o saldo for a seu
  // favor, saída se for contra). Se o líquido zerar exatamente, fecha as pendências sem
  // gerar transação nenhuma — não haveria dinheiro de verdade pra mover. f vem preenchido
  // por openSh("netSettle", {personId, personName, net, count, accId:""}).
  const netSettle=()=>{
    const net=Number(f.net)||0;
    if(net!==0&&!f.accId){toast_("Selecione uma conta","#ef4444");return;}
    if(net!==0){
      setAccs(p=>p.map(a=>a.id===f.accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:(net>0?"Acerto líquido de ":"Acerto líquido a ")+(f.personName||"?"),amount:Math.abs(net),type:net>0?"in":"out",date:today,cat:net>0?"Reembolso":"Divisão de despesas",method:"ted"}]}:a));
    }
    setAccs(p=>p.map(a=>({...a,txs:a.txs.map(t=>(t.split&&t.split.personId===f.personId&&!t.split.settled)?{...t,split:{...t.split,settled:true}}:t)})));
    setSharedOwed(p=>p.map(o=>(o.personId===f.personId&&!o.settled)?{...o,settled:true}:o));
    toast_(net===0?"Pendências fechadas — saldo zerado":"Acerto líquido registrado",net>=0?ACCENT:"#ef4444");close();
  };
  const launch=()=>{
    if(!f.desc||!f.amount)return;
    // "Outra pessoa pagou" (26/08/2026) — nasce e morre aqui: não é uma transação minha, só
    // uma pendência (sharedOwed) até eu quitar via paySplit. Sai antes de qualquer lógica de
    // conta/cartão/transferência, porque nenhuma delas se aplica nesse caso.
    if(f.ltype==="out"&&f.splitOn&&f.payer==="other"){
      if(!f.splitPersonId){toast_("Selecione quem pagou","#ef4444");return;}
      const myShare=Number(f.amount)*((Number(f.splitPercent)??50)/100);
      if(myShare<=0){toast_("Informe um valor válido","#ef4444");return;}
      setSharedOwed(p=>[...p,{id:"ow"+uid(),personId:f.splitPersonId,desc:f.desc,amount:myShare,cat:f.cat||catsOut[0],date:f.date||today,settled:false}]);
      toast_("Registrado — você deve sua parte","#ef4444");close();
      return;
    }
    // Split só se aplica a saídas em conta (não cartão, não transferência) — cobre o caso
    // real (conta de luz/água paga por pix/débito, dividida 50/50 com a esposa). Cartão de
    // crédito com "dividir" ligado é rejeitado explicitamente (26/08/2026) em vez de
    // silenciosamente ignorar o split — antes disso o toggle "Sim" ficava aceso sem efeito
    // nenhum se o método fosse crédito, parecendo dividido sem estar.
    if(f.ltype==="out"&&f.method==="credito"&&f.splitOn&&f.payer!=="other"){toast_("Divisão não disponível no cartão de crédito — desative \"Dividir\" ou mude o meio de pagamento","#ef4444");return;}
    const splitPayload=(f.ltype==="out"&&f.method!=="credito"&&f.splitOn&&f.splitPersonId)?{personId:f.splitPersonId,theirPercent:Number(f.splitPercent)||50,settled:false}:null;
    if(f.ltype==="transfer"){if(!f.fromId||!f.toId){toast_("Selecione origem e destino","#ef4444");return;}const id=uid();const fromName=(f.fromKind==="acc"?accs:boxes).find(x=>x.id===f.fromId)?.name||"";const toName=(f.toKind==="acc"?accs:boxes).find(x=>x.id===f.toId)?.name||"";if(f.fromKind==="acc")setAccs(p=>p.map(a=>a.id===f.fromId?{...a,txs:[...a.txs,{id:"t"+id+"o",desc:f.desc+" para "+toName,amount:Number(f.amount),type:"out",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.fromId?{...b,balance:b.balance-Number(f.amount)}:b));if(f.toKind==="acc")setAccs(p=>p.map(a=>a.id===f.toId?{...a,txs:[...a.txs,{id:"t"+id+"d",desc:f.desc+" de "+fromName,amount:Number(f.amount),type:"in",date:f.date,cat:"Transferência",method:"ted"}]}:a));else setBoxes(p=>p.map(b=>b.id===f.toId?{...b,balance:b.balance+Number(f.amount)}:b));toast_("Transferência realizada");close();return;}
    if(f.method==="credito"){if(!f.cardId){toast_("Selecione um cartão","#ef4444");return;}const ins=f.ltype==="in"?1:(Number(f.installments)||1);setCards(p=>p.map(c=>c.id===f.cardId?{...c,txs:[...c.txs,{id:"ct"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,installments:ins}]}:c));}
    else{const accId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;if(!accId){toast_("Selecione uma conta","#ef4444");return;}setAccs(p=>p.map(a=>a.id===accId?{...a,txs:[...a.txs,{id:"t"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,date:f.date,cat:f.cat,method:f.method,recurring:f.recurring||"",...(splitPayload?{split:splitPayload}:{})}]}:a));}
    if(f.recurring){const accId=f.method==="dinheiro"?CASH_ACC_ID:f.accId;setRecurrings(p=>[...p,{id:"rec"+uid(),desc:f.desc,amount:Number(f.amount),type:f.ltype,cat:f.cat,method:f.method,accId:f.method==="credito"?null:accId,cardId:f.method==="credito"?f.cardId:null,freq:f.recurring,nextDate:freqAdd(f.date,f.recurring),active:true,...(splitPayload?{split:{personId:splitPayload.personId,theirPercent:splitPayload.theirPercent}}:{})}]);}
    toast_(f.ltype==="in"?"Entrada registrada":"Saída registrada",f.ltype==="in"?ACCENT:"#ef4444");close();
  };

  const accOpts=()=>[{v:"",l:"Selecione..."},...accs.filter(a=>!a.isCash).map(a=>({v:a.id,l:accLabel(a,banks)}))];
  const cardOpts=()=>[{v:"",l:"Selecione..."},...cards.map(c=>({v:c.id,l:c.name}))];
  const bankOpts=()=>banks.map(b=>({v:b.id,l:b.name}));
  const iCatOpts=()=>ICAT.flatMap(c=>c.sub.map(s=>({v:s.id,l:c.label+" - "+s.label})));


  return {
    accOpts, accs, addAcc, addBank, addBox, addCard, addCatIn, addCatOut,
    addDebt, addInv, addSplitPerson, allTxs, amortizarDivida, avgAccountNet3, back, bankOpts,
    banks, bkOf, boxes, boxMoveLinked, boxSnaps, budgets, budgetSpend, buildProjSeries,
    calcYesodScore, cardBurdenAtMonth, cardOpts, cards, cashflowMonth, catsIn, catsOut, checkin,
    close, confirmDestructive, debtBurdenAtMonth, debtDueDates, debtLateInfo, debts, delAcc, delAccTx,
    delBank, delBox, delCard, delCardTx, delCatIn, delCatOut, delDebt, delInv,
    delOwed, delRecurring, delSplitPerson, despesasExpanded, editAcc, editAccTx, editBank, editBox,
    editCard, editDebt, editInv, eventsDeltaAtMonth, extCat, extType, f, F,
    finXp, fluxoView, futureCategoryTotals, getMonthStr, guard, iCatOpts, ifBaseline, ifConfigured, ifGoal, ifMonthly, ifProjection, ifRisk,
    invAportar, invResgatar, invs, isFutureYm, launch, loadFromStorage, monthDiff, monthLabel2,
    monthRange, monthTotals, mySplitShare, nav, net, netSettle, openSh, orcSection,
    overMonth, page, patrimSnaps, payDebt, payRecurringOccurrence, paySplit, pendingSplits, plannedItems,
    projEvents, projHorizonId, projMilestones, projMonthlyNet, projUpcoming, quitarDivida, recalibrarCronogramaDivida, receiveSplit,
    recurringAmountFor, recurringOverrides, recurringPendingDates, recurrings, retroPatrim, retroPatrimData, saveEditTx, scoreWeights,
    selChartYm, setAccs, setBanks, setBoxes, setBoxSnaps, setBudgets, setCards, setCatsIn,
    setCatsOut, setConfirmDestructive, setDebts, setDespesasExpanded, setExtCat, setExtType, setF, setFinXp,
    setFluxoView, setIfBaseline, setIfGoal, setIfMonthly, setInvs, setOrcSection, setPage, setPatrimSnaps, setPlannedItems,
    setProjEvents, setProjHorizonId, setRecurringOverrides, setRecurrings, setScoreWeights, setSelChartYm, setSh, setSharedOwed,
    setSplitPeople, setSplitPersonMode, setStorageLoaded, setTab, setToast, setTxSearch, setYesodCards, setYGoals,
    setYHabits, sh, sharedOwed, splitPeople, splitReceivable, storageLoaded, tab, toast,
    toast_, today, toggleRecurring, totAcc, totBox, totCardDebt, totDebtRem, totInv,
    totPayable, totReceivable, touchXRef, txsByMonth, txSearch, vencimentoAlerts, yesodCards, yGoals,
    yHabits,
  };
}
