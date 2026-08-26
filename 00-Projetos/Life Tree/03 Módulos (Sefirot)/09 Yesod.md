---
tags: [lifetree, modulo, yesod]
aliases: [Yesod]
---

# 💰 Yesod — Finanças

> Status: ✅ Integrado na Árvore · Arquivo: `preview/src/YesodModule.jsx` (~1545 linhas, 26/08/2026) · **fecha como v10** (ver [[08 Versões]])
> Score bridge: publica `yesod` em `lifetree_scores`
> Esta nota incorpora a auditoria funcional completa feita em 01/08/2026 (levantamento de telas/entidades/gaps que também existe como [artefato web](https://claude.ai/code/artifact/477b284f-23ed-447d-a614-5ff541796195)) — é a referência canônica do estado do módulo daqui pra frente, não só notas de implementação.

## Abas
Reorganizado em 01/08/2026 de 9 pra 5 abas, e de novo em 25/08/2026 (Dívidas entrou em Bolsos, IF+Metas saíram pra uma aba própria) — hoje são **5 abas**: `yesod` (Yesod — só Visão Geral desde 25/08/2026, sem controle segmentado; ver [[04 Bugs Conhecidos]]) · `orc` (Orçamento, com controle segmentado **Fluxo** / **Orçamento**) · `bolsos` (Contas com Cartões aninhado, Caixinhas, Investimentos **e Dívidas e Financiamentos** — 5 seções, cada uma com editar/apagar inline) · `goals` (Objetivos — Meta de Independência Financeira + metas livres) · `cfg` (Config — só o que não tem lugar em outra tela: Bancos, Categorias, Recorrências). As antigas abas `over` (Geral), `inv` (Investimentos) e `debt` (Dívidas) foram removidas; `fluxo`/`if`/`metas` viraram conteúdo de outras abas em vez de abas ou seções próprias.

## Entidades de dados
11 estruturas de dados independentes, todas em arrays no estado do componente, persistidas em `localStorage` sob `lifetree_fin_*` (ver [[#Persistência|Persistência]]).

| Entidade | Chave | Campos principais |
|---|---|---|
| Banco | `banks` | `name`, `color` |
| Conta | `accs` | `bankId`, `name`, `txs[]`, `isCash` (marca a Carteira virtual — ver seção "Dinheiro" abaixo) |
| Transação | dentro de `accs[].txs` / `cards[].txs` | `desc`, `amount` (sempre positivo, sinal vem de `type`), `type` (`in`/`out`), `date`, `cat`, `method` (pix/debito/credito/ted/dinheiro — só em txs de conta), `recurring`, `installments` (só em txs de cartão) |
| Cartão | `cards` | `bankId`, `name`, `color`, `limit`, `closeDay`, `dueDay`, `txs[]` |
| Caixinha | `boxes` | `name`, `color`, `goal`, `balance` (único saldo *armazenado* direto — não derivado), `targetDate` |
| Dívida | `debts` | `name`, `credor`, `color`, `totalParcelas`, `parcelasPagas`, `valorParcela`, `dueDay`, `startDate` |
| Investimento | `invs` | `bankId`, `subCat` (10 subcategorias em 4 grupos: Renda Fixa, Renda Variável, Multimercado, Internacional), `name`, `invested`, `balance`, `rate`, `maturity` |
| Orçamento | `budgets` | `cat`, `limit` |
| Categorias | `catsout` / `catsin` | listas de string, editáveis (seed: 11 de saída, 5 de entrada) |
| Recorrência | `recurrings` | `desc`/`amount`/`type`/`cat`/`method`, `accId`/`cardId`, `freq` (weekly/monthly/yearly), `nextDate`, `active` |
| Hábito / Meta financeira | `yhabits` / `ygoals` | `title`, `freq` (só hábito), `xp`, `done` |

Saldo de conta é sempre derivado (`accBal`, soma de `txs`), nunca armazenado — a única exceção é `boxes[].balance`, ajustado diretamente por `boxMove`.

## Telas
Visão rápida do que cada tela mostra e permite fazer — detalhe de implementação de cada uma está em [[#Funcionalidades|Funcionalidades]] abaixo.

- **Yesod → Visão Geral** — única seção da aba desde 25/08/2026 (IF saiu, Metas saiu — sem controle segmentado, é a aba toda) — score "Saúde Financeira" (0–100%, fórmula em [[#Score do módulo|Score]]) com barra e XP acumulado · banner de alertas de vencimento (faturas/dívidas ≤7 dias, destaque vermelho se ≤2) · painel de indicadores (12 disponíveis, usuário escolhe quais e em que ordem) · checklist de hábitos financeiros próprios do módulo. Botão "Registrar" no header (renomeado de "Lançar" em 25/08/2026; também aparece em Orçamento → Fluxo desde a mesma leva).
- **Objetivos** — aba própria desde 25/08/2026 (antes: seção "IF" dentro de Yesod + checklist "Metas" dentro de Visão Geral). Vista colapsada por padrão (segunda leva do dia, 25/08/2026 — a vista cheia tinha destaque demais): mostra só o card de progresso da Meta de Independência Financeira + botão "+ Objetivo"; tocar no card abre o detalhe completo como sub-página (patrimônio atual vs. necessário pela regra dos 4%, projeção de anos/meses pela poupança média dos últimos 3 meses, taxa de poupança 6 meses, editar meta, e o checklist "Outras Metas" — livre, criar/concluir com XP/apagar, não só IF, no mesmo espírito de múltiplos objetivos do Hod).
- **Orçamento** — controle segmentado **Fluxo** / **Orçamento** (desde 25/08/2026, Fluxo primeiro por ser o mais usado): **Fluxo** (carrossel de 6 sub-views que antes vivia na aba Yesod — Fluxo de Caixa com gráfico realizado+esperado do ano inteiro + lançamentos filtráveis embutidos, ver seção própria; Taxa de Poupança; Progresso Dívidas; Rendimento Investimentos; Evolução Patrimonial; Projeção) · **Orçamento** (lista por categoria com limite/gasto real/%/alerta "ACIMA", criar/editar/apagar). A aba "Extrato" existiu como 3º pill por 2 dias e foi removida — voltou a viver dentro do próprio Fluxo.
- **Bolsos** — cada seção com um totalizador compacto no topo (uma linha, cor própria — trocou o card grande de destaque que só "Dívidas" tinha, 25/08/2026): Contas — verde (saldo, editar/apagar inline, tocar → extrato **agrupado por mês desde 25/08/2026**, cada grupo com o saldo daquele mês; botão "Banco" de criação rápida removido em 25/08/2026 por duplicar Config → Bancos) **com Cartões aninhado dentro** — roxo (limite usado com barra de cor por %, mesmas ações, tocar → faturas por vencimento, todas as faturas passadas já listadas sem filtro — nested em Contas desde 23/08/2026) · Caixinhas — azul (saldo/meta/%/data alvo/**taxa de juros editável (%a.a. ou %a.m.), desde 25/08/2026**, mesmas ações, tocar → **Depositar/Retirar agora exige escolher uma conta (dinheiro sai/entra de verdade), mais histórico mensal de saldo e projeção futura pela taxa, 25/08/2026**) · Investimentos — âmbar (4 categorias com total e ganho/perda, tocar → detalhe por subcategoria, **Aportar/Resgatar ligados a conta desde 25/08/2026, além do já existente Atualizar saldo**) · **Dívidas e Financiamentos** — vermelho (5ª seção desde 25/08/2026, antes aba própria — lista com progresso, criar (**ganhou "Valor recebido" + conta pra creditar, 25/08/2026**)/apagar, tocar → **Parcela/Amortizar (por valor ou parcelas, reduzindo prazo ou parcela)/Quitar dívida — os três ligados a conta, 25/08/2026**).
- **Config** — ganhou seção **Preferências** em 26/08/2026 (primeira do tipo, antes só existiam listas "item + Adicionar"): card **Fórmula de Saúde Financeira** com os 5 pesos do % da Visão Geral editáveis + meta de reserva em meses + "Restaurar padrão" (ver [[#Score do módulo (recomposto 26/08/2026 — pesos agora configuráveis)|Score]]) · Bancos (único lugar de CRUD, sem equivalente browsável em outra tela) · Categorias de Saída/Entrada (criar/apagar) · Recorrências (pausar/retomar, apagar).

## Funcionalidades

### Bancos, contas e cartões
Estrutura de dados: `banks` → `accs` (contas correntes, cada uma com lista de transações) e `cards` (cartões de crédito, cada um com limite, dia de fechamento/vencimento e transações parceladas).

```js
const accBal = acc => (acc.txs||[]).reduce((s,t) => t.type === "in" ? s + t.amount : s - t.amount, 0);
```

Faturas de cartão são calculadas agrupando transações por data de vencimento (`stmtDue`), considerando parcelamento:
```js
const getStmts = card => {
  const map = {};
  (card.txs||[]).forEach(tx => {
    const n = tx.type === "in" ? 1 : (tx.installments||1);
    const sign = tx.type === "in" ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const pd = i === 0 ? tx.date : addM(tx.date, i);
      const due = stmtDue(pd, card.closeDay, card.dueDay);
      // agrupa por data de vencimento, aplica sinal e parcela
    }
  });
  return Object.entries(map).sort(...).map(...);
};
```

### Cálculo de vencimento de fatura (bug corrigido)
```js
const stmtDue = (pd, closeDay, dueDay) => {
  const d = new Date(pd + "T12:00:00");
  let m = d.getMonth(), y = d.getFullYear();
  if (d.getDate() > closeDay) { m++; if (m > 11) { m = 0; y++; } }
  // Fix: se fechamento >= vencimento, vencimento vai pro mês seguinte
  let dm = m, dy = y;
  if (closeDay >= dueDay) { dm++; if (dm > 11) { dm = 0; dy++; } }
  return new Date(dy, dm, dueDay).toISOString().slice(0,10);
};
```
Esse edge case (`closeDay >= dueDay`) já está corrigido no código — ver [[04 Bugs Conhecidos]].

### Caixinhas (boxes)
Reservas nomeadas com meta e saldo próprio (ex: "Reserva de Emergência", "Viagem"), com movimentação de entrada/saída validada (`boxMove` rejeita valor ≤ 0).

### Dívidas
Financiamentos/empréstimos com total de parcelas, parcelas pagas, valor da parcela — usado tanto no cálculo de patrimônio líquido quanto no score. **Pagar uma dívida (`payDebt`) não gera nenhuma transação** — só incrementa `parcelasPagas` — por isso dívidas não aparecem no fluxo de caixa histórico, mas entram explicitamente no cálculo da Projeção (ver abaixo), que é o único lugar que precisa desse efeito futuro.

### Investimentos
Categorizados em 4 grupos (Renda Fixa, Renda Variável, Multimercado, Internacional), cada um com valor investido, saldo atual, taxa e vencimento.

### Orçamento
Limite mensal por categoria de gasto (`budgets`), comparado ao gasto real do mês via `budgetSpend(cat)`.

### Fluxo de caixa
`cashflowMonth(offset)` agrega todas as transações (contas + cartões) de um mês específico em entradas/saídas/saldo. `retroPatrimData` (memoizado com `useMemo`) reconstrói patrimônio líquido histórico dos últimos 6 meses.

### Método "Dinheiro" persistido via conta virtual Carteira (01/08/2026, resolve gap conhecido)
Lançamentos com `method:"dinheiro"` desapareciam sem serem salvos em lugar nenhum (nem saldo, nem fluxo de caixa, nem orçamento) — ver histórico em [[04 Bugs Conhecidos]]. Corrigido criando uma conta virtual fixa (`CASH_ACC_ID = "cash-wallet"`, `isCash:true`, sem `bankId`) dentro do próprio array `accs` — todo lançamento em dinheiro (formulário manual e Coach) vai pra ela, então entra no cálculo de saldo/fluxo/orçamento/patrimônio líquido como qualquer outra conta, sem precisar de um modelo de dados paralelo. Usuários com dados salvos antes dessa mudança ganham a conta automaticamente num efeito de migração na primeira carga do módulo. Na UI: aparece em Bolsos → Contas com ícone de carteira, sem os botões de editar/apagar (conta de sistema); fica de fora dos seletores de conta pra pix/débito/ted; e o sheet de lançamento mostra "Registrado na Carteira (dinheiro)" no lugar do seletor de conta quando o método é dinheiro. `yesodActions.js` replica o mesmo `CASH_ACC_ID` pro Coach escrever no mesmo lugar.

### Projeção de fluxo de caixa (01/08/2026, resolve item do [[05 Roadmap]])
Nova sub-view dentro de Fluxo. Horizontes de 30/60/90 dias, 6 meses, 1 ano e 3 anos (dias ≤90 usa granularidade diária, acima disso mensal). Modelo: média de entradas−saídas dos últimos 3 meses (contas+cartões, já reflete recorrências e gasto de cartão) como linha de base, descontando as parcelas de dívidas ativas até a quitação — o único efeito futuro conhecido que a média histórica não captura, já que pagar uma dívida não gera lançamento (ver seção Dívidas acima). Recorrências **não** somam de novo em cima da média (evita contar duas vezes o que a média já inclui) — aparecem só como anotação, na lista "Próximos lançamentos conhecidos" (horizontes ≤90 dias).

Mostra: gráfico de linha do saldo projetado (SVG próprio, sem lib), aviso se o saldo pode ficar negativo, lista de "marcos no período" (quitação de dívida e quanto isso libera por mês), e um **ajustador de cenário** — receita extra / redução de custo mensal a partir de um mês escolhido, sobrepondo uma segunda linha tracejada no gráfico. O cenário é persistido à parte (`lifetree_fin_projscenario`) só pra sobreviver a reload — nunca escreve em nenhuma entidade financeira real, é puramente uma camada de exibição ("e se"), com botão "Resetar cenário".

> ⚠️ Este `projEvents`/ProjChart continua existindo exatamente como descrito (projeção diária/mensal com dívidas e faturas de cartão pela data real) — é diferente e mais preciso que o novo gráfico mensal da Fluxo de Caixa (ver seção "Gráfico realizado+esperado" abaixo), que é categorizado mas menos granular. Os dois coexistem de propósito.

### Hábitos e metas financeiras próprios do módulo
Além dos hábitos/metas gerais da Árvore, Yesod tem sua própria lista fixa de hábitos financeiros (`yHabits`: registrar lançamentos, revisar saldo, checar faturas, etc.) e metas (`yGoals`: reserva de emergência, orçamento respeitado, taxa de poupança, quitar dívidas, marcos de IF) — cada um com XP próprio, somado a `finXp`.

### Independência Financeira (IF)
Meta de patrimônio (`ifGoal`) e gasto mensal esperado na aposentadoria (`ifMonthly`) — usados tanto na aba "IF" quanto na fórmula de score.

### Score do módulo (recomposto 26/08/2026 — pesos agora configuráveis)
Fórmula antiga (fixa, 6 componentes) tinha problemas concretos encontrados numa auditoria a
pedido do usuário: hábitos/metas nunca "resetavam" (uma vez marcado feito, ficava feito pra
sempre — 25% do score só crescia, nunca refletia recaída/comportamento atual); progresso de
dívida era média simples entre dívidas sem pesar pelo saldo (uma dívida de R$500 quitada e
uma de R$50.000 intocada empatavam em 50%); orçamento era binário (estourar 1% ou 500% do
limite pontuava igual); não existia reserva de emergência no score, apesar do módulo já ter
tudo pra calcular isso; IF pesava 25% mas é métrica de décadas — dominava o score de quem
está no início da jornada mesmo com disciplina diária impecável.

Recomposta em 5 componentes, com **pesos editáveis em Config → Preferências**
(`scoreWeights`, persistido em `lifetree_fin_scoreweights`, default
`{savRate:25,debt:20,budget:20,emergency:20,if:15,emergencyTargetMonths:6}` — não precisam
somar 100, a fórmula normaliza pelo total informado; zerar um peso tira o componente do
cálculo). Hábitos/metas **saíram do cálculo** — continuam dando XP e aparecendo em Visão
Geral/Objetivos normalmente, só não influenciam mais o %.

```js
const calcYesodScore = () => {
  const cf0 = cashflowMonth(-1);
  const savRate = cf0.ins>0 ? Math.max(0,(cf0.ins-cf0.outs)/cf0.ins) : 0;
  const savS = Math.min(1, savRate/0.2);

  // pondera pelo valor ORIGINAL de cada dívida (não média simples) — equivale a
  // 1 − saldo_devedor_total/valor_original_total
  const totalDebtOriginal = debts.reduce((s,d)=>s+d.totalParcelas*d.valorParcela,0);
  const debtS = debts.length===0 ? 1 : (totalDebtOriginal>0 ? Math.max(0,1-totDebtRem/totalDebtOriginal) : 1);

  // mede a distância proporcional ao limite por categoria, não um binário dentro/fora
  const budS = budgets.length===0 ? 0.5 : budgets.reduce((s,b)=>{
    const spend=budgetSpend(b.cat);
    return s+(spend<=b.limit?1:Math.max(0,1-(spend-b.limit)/b.limit));
  },0)/budgets.length;

  // componente novo: contas+caixinhas ÷ gasto médio mensal, meta configurável em meses
  const avgMonthlyExpense=[-1,-2,-3].reduce((s,o)=>s+cashflowMonth(o).outs,0)/3;
  const emergS = Math.min(1, (totAcc+totBox)/avgMonthlyExpense/(scoreWeights.emergencyTargetMonths||6));

  const ifN = ifGoal || ifMonthly*300 || 1;
  const ifS = Math.min(1, net/ifN);

  const w = scoreWeights;
  const totalW = w.savRate+w.debt+w.budget+w.emergency+w.if;
  return Math.round(((savS*w.savRate + debtS*w.debt + budS*w.budget + emergS*w.emergency + ifS*w.if)/totalW)*100);
};
```

**Coach** ganhou a ação `update_score_weights` (só corrige os campos informados) e o
contexto `formula_saude_financeira` (pesos atuais + cada sub-componente já calculado com os
dados reais, pro Coach não recalcular às cegas) — quando o usuário pergunta sobre o score ou
pede avaliação/sugestão, o systemPrompt instrui a explicar com os números reais, apontar peso
"desperdiçado" (ex: peso alto em dívida sem nenhuma dívida cadastrada) e só aplicar a mudança
depois que o usuário topar a redistribuição na conversa — nunca decide sozinho reduzir um
peso só pra "otimizar" o número.

### Categorias customizáveis (01/08/2026)
`catsOut`/`catsIn` deixaram de ser constantes fixas (`D_CATS_OUT`/`D_CATS_IN` continuam como seed inicial) e viraram estado persistido, editável em Config → "Categorias de Saída"/"Categorias de Entrada" (adicionar via sheet, remover com botão x). Todos os seletores de categoria do módulo (lançamento, orçamento) usam essas listas.

### Recorrência real de lançamentos (01/08/2026)
Antes, marcar "Mensal/Semanal/Anual" no lançamento só gravava uma tag (`recurring`) sem nenhum efeito futuro. Agora existe um array `recurrings` (templates: `{desc, amount, type, cat, method, accId|cardId, freq, nextDate, active}`) — ao lançar com recorrência marcada, além do lançamento imediato, um template é criado com `nextDate = freqAdd(data, freq)`. Um `useEffect` roda no carregamento do módulo e gera (com catch-up, até 60 iterações) todos os lançamentos em atraso desde a última execução, avançando `nextDate` a cada um. Config → "Recorrências" lista os templates ativos com pausar/retomar (⏸▶) e apagar.

### Busca de lançamentos (01/08/2026)
Campo de busca por descrição/categoria no extrato de cada conta e na lista de lançamentos da aba Fluxo (`txSearch`, estado efêmero não persistido).

### Alertas de vencimento (01/08/2026)
Banner no topo da aba Yesod (`upcomingAlerts()`) listando faturas de cartão e parcelas de dívida que vencem nos próximos 7 dias, com destaque vermelho para ≤2 dias.

### Dashboard de indicadores (bug de persistência corrigido em 01/08/2026)
`yesodCards` (quais dos 12 indicadores aparecem no card "INDICADORES" e em que ordem) nunca era salvo em `localStorage` — resetava pro padrão de 6 a cada reload. Corrigido (`lifetree_fin_yesodcards`).

### Coach IA — ações completas (01/08/2026, substituiu a versão analítica single-shot)
O antigo botão "Analisar" (`analyzeFinances`, fetch direto sem headers de auth) foi removido — ver decisão "Life Tree Coach architecture" no histórico. O Yesod agora é o único módulo com skill `actions:true` no Coach global (`App.jsx`), com **42 ações** (34 originais + 8 novas em 12/08/2026 — divisão de despesas, cenários, eventos de projeção, ver seção "Coach — paridade completa" abaixo) cobrindo toda a superfície do módulo:

- Lançamentos: criar (único ou recorrente, qualquer método de pagamento — incluindo dinheiro, ver seção acima), editar, apagar
- Categorias: criar, apagar
- Recorrências: editar, pausar/retomar, apagar
- Bancos, contas, cartões: CRUD completo
- Caixinhas: criar (com `targetDate` opcional — meta com prazo), editar, apagar, depositar/retirar
- Dívidas: criar, editar, apagar, registrar parcela paga
- Investimentos: criar, editar, apagar, atualizar saldo
- Orçamento por categoria: criar, editar, apagar
- Meta de Independência Financeira: atualizar
- Hábitos/metas financeiras do módulo (`yHabits`/`yGoals`): criar, marcar feito/pendente, apagar
- Dashboard: adicionar/remover/reordenar indicadores

Implementação em `preview/src/shared/yesodActions.js` — não usa os setters do componente (o Coach roda em `App.jsx`, o estado do Yesod vive só aqui): lê/escreve `localStorage.lifetree_fin_*` direto, e avisa o módulo (se montado) via `notifyCoachDataUpdated("yesod")` (`preview/src/shared/coachSync.js`) pra recarregar do storage e não ficar dessincronizado.

**Confirmação obrigatória:** nenhuma ação executa no primeiro turno — o Coach propõe (texto + `<ACTION>`), `App.jsx` guarda em `pendingCoachAction` e mostra botões Confirmar/Cancelar na bolha de resposta; só executa após clique em Confirmar. Vale pro Yesod e pro hub igualmente.

**Coach como analista financeiro:** o contexto (`buildYesodContext` em `coachSkills.js`) inclui capacidade de poupança média (últimos 3 meses) e caixinhas com `targetDate`, com instrução explícita pro Coach calcular quanto guardar por mês pra bater uma meta até uma data, e — se não for viável — dar alternativas concretas (máximo possível, renda extra necessária, priorizar quitar dívida) em vez de só dizer que não dá. Cobre também múltiplos objetivos simultâneos.

Detalhe completo da arquitetura (por que localStorage direto em vez de props, o padrão pros próximos módulos) em [[02 Arquitetura]] → seção "Coach de IA — ações por módulo".

## Limitações 1-5 da auditoria de 09/08/2026 — implementadas em 12/08/2026

Fase 1 do [[05 Roadmap]] → "Plano de Evolução". Testado no navegador via `claude-in-chrome` (dev server local): split de despesa criado e marcado como acertado, edição de lançamento movendo Nubank→Carteira com saldo recalculado corretamente nas duas contas, cenário criado com item de caixinha mostrando esperado/atual, projeção com evento de cenário múltiplo e faturas de cartão futuras aparecendo em "Próximos lançamentos conhecidos". `npm run build` limpo.

### Divisão de despesas (split)
Nova entidade `splitPeople` (`lifetree_fin_splitpeople` — `{id,name}`, CRUD em Config → "Pessoas p/ Dividir Despesas") e campo opcional `split:{personId,theirPercent,settled}` em `accs[].txs[]` (só saídas, não cartão — cobre o caso real: conta de luz/água por pix/débito). Ao lançar ou editar uma saída, toggle "Dividir despesa" → escolhe pessoa + % que ela paga. Card "Despesas Divididas" na Visão Geral (só aparece se houver alguma) lista pendências com botão "Marcar acertado" (`toggleSplitSettled`). Recorrência carrega o `split` no template (`recurrings[].split`, sem `settled`) e cada ocorrência gerada nasce com `settled:false` de novo — cada mês é uma pendência nova, mesmo que o mês anterior já tenha sido acertado.

### ~~Cenários — esperado vs. real~~ (removida 23/08/2026)
~~Nova entidade `scenarios`...~~ Toda a sub-seção "Cenários" (aba, entidade `scenarios`, ações `create_scenario`/`delete_scenario` do Coach) foi removida a pedido do usuário — colidia de nome com o ajustador "Cenário" da Projeção/Fluxo (dois conceitos diferentes com o mesmo nome) e não era usada. Um bug pré-existente ficou registrado só como curiosidade histórica, não corrigido (a feature toda foi embora antes): `createYesodScenario`/`deleteYesodScenario` (`yesodActions.js`) escreviam na chave `"scenarios"`, mas a aba lia `"lifetree_fin_scenarios"` — cenários criados pelo Coach provavelmente nunca apareciam na tela.

### Projeção de fluxo de caixa — parcela a parcela + múltiplos eventos
Duas mudanças no modelo: (1) `avgAccountNet3` agora calcula a média histórica só de transações de **conta** (não cartão) — cartão saiu da média e passou a entrar via `cardBurdenAtMonth`, que soma o valor exato de cada fatura futura pela data real de vencimento (`getStmts`), não mais estimativa. (2) `projScenario` (objeto único) virou `projEvents` (array) — dá pra somar múltiplos eventos na mesma simulação (ex: "aumento em março" + "viagem em julho" ao mesmo tempo), cada um com seu próprio `fromM`. Migração automática: se só existir o `projscenario` antigo salvo, vira um evento único na primeira carga.

### Editar lançamento — move entre Carteira e conta bancária
`saveEditTx` substitui o handler antigo: o seletor de Método no "Editar Lançamento" deixou de ser travado (antes só oferecia "dinheiro" se a transação já fosse da Carteira, e vice-versa). Trocar o método agora move a transação de fato entre os arrays `accs[].txs` (remove da conta original, adiciona na nova) em vez de só editar em memória — cobre tanto Carteira→conta quanto conta→Carteira.

### Evolução de patrimônio — snapshot mensal real
Novo efeito (`useEffect` dependente de `[net, storageLoaded]`) grava/atualiza a entrada do mês corrente em `patrimSnaps` a cada mudança de patrimônio líquido — antes essa chave existia persistida mas nunca era escrita por nenhum código, então `retroPatrimData` sempre reconstruía só os últimos 6 meses on-the-fly. Meses passados, uma vez gravados, não são reescritos (só o mês corrente segue "ao vivo") — histórico real cresce mês a mês a partir de quando essa leva entrou no ar, sem limite de 6 meses. Label da view "Evolução Patrimonial" ficou dinâmico (`EVOLUÇÃO — N MESES`), gráfico mostra até os últimos 24 pontos.

### O que ficou de fora desta leva, deliberadamente
- **Sem sincronização bancária** e **sem importação CSV/OFX** — decisões conscientes anteriores, não mudaram.
- **Split só cobre transações de conta, não de cartão** — cartão tem fluxo de parcelamento próprio (`getStmts`), juntar split com parcela ficaria complexo demais pro escopo desta leva; se precisar dividir uma compra no cartão, registrar manualmente a parte de cada um.
- **Projeção ainda não prevê gastos variáveis/imprevistos** — nem tenta; segue sendo tendência, não garantia (texto explícito na tela).

### Coach — paridade completa nas 5 funcionalidades novas (mesmo dia, sessão seguinte)
Usuário perguntou se o Coach já lidava com as 5 funcionalidades — resposta na hora: só leitura de `cenarios`/`divisoes_pendentes`, zero ação de escrita, e **um bug real encontrado na revisão**: `editYesodTransaction` (ação do Coach) ainda só trocava o campo `method` no lugar, sem mover a transação entre `accs`/`cards` — a mesma falha que `saveEditTx` (UI) tinha corrigido horas antes. Se o usuário pedisse ao Coach "muda esse lançamento pra dinheiro", ele reportaria sucesso mas deixaria uma transação `method:"dinheiro"` presa dentro de uma conta bancária, quebrando a invariante que o filtro antigo da tela existia pra evitar.

**Corrigido + 8 ações novas**, todas em `yesodActions.js` (dispatch genérico via `YESOD_ACTION_HANDLERS[action.action]` em `App.jsx`, nenhuma mudança de plumbing necessária):
- `edit_transaction` ganhou o mesmo fix de mover conta (`method`→"dinheiro" ou `changes.account` indicado) que a UI já tinha.
- `create_transaction` aceita `splitPerson`/`splitPercent` opcionais (resolve pessoa por nome, ignora silenciosamente se não achar).
- Divisão de despesas: `create_split_person`, `delete_split_person`, `mark_split_settled` (busca por texto na descrição, mais recente desempata).
- ~~Cenários: `create_scenario`, `delete_scenario`~~ — removidas 23/08/2026 junto com a aba Cenários (ver seção própria acima).
- Projeção: `add_proj_event`, `delete_proj_event`, `clear_proj_events` (equivalente ao botão "Resetar cenário").

Contexto (`buildYesodContext`) ganhou `eventos_projecao` (não tinha nada antes); `cenarios`/`divisoes_pendentes` já existiam da leva anterior. `systemPrompt` documentou as 8 ações novas (itens 43-50) e foi ajustado pra propor `create_scenario` em vez de só sugerir a tela quando não houver cenário. Testado com `npm run build` limpo — sem teste no navegador via chat real (exigiria a API key configurada), confiança vem de seguir exatamente o mesmo padrão das 34 ações já em produção.

### Gráfico realizado+esperado editável por categoria, Extrato Geral (23/08/2026)
Pedido pelo usuário depois de testar o app no celular: um gráfico único no Fluxo de Caixa (não mais o antigo "Histórico 6 meses" só-passado) mostrando meses **realizados** (ano corrente até o mês atual, cores vivas) seguidos de meses **esperados** (toggle 3/6/12, cores claras, rótulo "(E)"), com os cards Receitas/Custos/Saldo e um drilldown por categoria (sheet, aberto tocando Receitas ou Custos) reagindo ao mês selecionado na barra — mês passado é só leitura (mesma agregação que "Gastos por Categoria" fazia, agora cobrindo receita também), mês futuro é **editável por categoria**.

Duas fontes alimentam um mês futuro: recorrências ativas daquele tipo (`recurringOverrides`, chave `"<ym>|<recurringId>"` → ajuste pontual só daquele mês, o valor padrão da recorrência não muda) e categorias sem recorrência por trás, adicionadas na hora pelo botão "Adicionar categoria esperada" (`plannedItems` — `{id,ym,cat,type,amount,desc}`, um item avulso por mês/categoria, não gera lançamento sozinho quando o mês chega). **Fecha o loop com o real**: `generateRecurrings` (gera lançamentos de recorrências vencidas) agora consulta `recurringOverrides` pelo mês antes de usar o valor padrão da recorrência — ajustar o esperado de um mês futuro antes dele chegar muda o que é efetivamente lançado quando a recorrência dispara, não é só decoração no gráfico.

A antiga sub-view "Gastos por Categoria" (só saída, só mês corrente) foi removida — o novo drilldown já cobre isso e mais (receita, qualquer mês). O ajustador "AJUSTAR CENÁRIO" inline da Projeção **não** foi tocado nem duplicado aqui — são dois conceitos diferentes que continuam coexistindo (ver aviso na seção Projeção acima).

~~**Extrato Geral** (botão "Extrato" na aba Orçamento)~~ — existiu como sub-página, depois como pill, os dois removidos no mesmo dia (25/08/2026) — a busca/filtro por tipo/categoria/período que ela tinha voltou a viver dentro do próprio Fluxo (ver "Ajustes de 25/08/2026" abaixo), não é mais uma tela/pill separada.

Testado no navegador via `claude-in-chrome`: gráfico renderiza meses reais + projetados corretamente, seleção de mês futuro mostra badge "projeção editável", drilldown de Custos abre com a categoria vinda de uma recorrência real ("Conta de Luz"), editar o valor reflete na hora nos cards de resumo, Extrato Geral filtra em tempo real. `npm run build`/`eslint` limpos (só o mesmo ruído pré-existente de sempre).

### Ajustes de 25/08/2026 — Fluxo vira pill de Orçamento, gráfico Jan-Dez fixo, Extrato morre
Três levas no mesmo dia (as duas primeiras já foram revisadas pela terceira, registro só o estado final):

1. **Fluxo saiu da aba Yesod, virou pill de Orçamento** — `ORC_SECTIONS`, mesmo componente
   visual de pills que já existia, **Fluxo primeiro** (`[{id:"fluxo"},{id:"orc"}]`, default
   `orcSection="fluxo"`) — é o mais usado do dia a dia. `YESOD_SECTIONS` ficou só com Visão
   Geral | IF. O card indicador "Poupança" na Visão Geral navega pra `tab="orc"` + pill
   "fluxo" em vez de mudar seção dentro do Yesod.
2. **Gráfico virou Jan-Dez fixo do ano corrente** — nada de toggle 3/6/12 (existiu por uma
   leva só, removido): o pedido foi ver o ano inteiro, realizado até o mês atual + esperado
   até dezembro, sempre. Com 12 barras fixas cabendo na tela sem scroll, não sobrou
   necessidade de gesto de arrastar pra "ver mais meses" — já mostra tudo de uma vez.
3. **Aba "Extrato" morreu, fundida de volta no Fluxo** — existiu como pill separado (e antes
   disso como sub-página) por 2 dias; o usuário não gostou de "clicar num card e pular pra
   outro lugar" nem a primeira vez (modal) nem a segunda (troca de pill). A lista de
   lançamentos com filtro (busca/tipo/categoria/período — "Mês selecionado" por padrão,
   ligado ao mês clicado no gráfico, com Últimos 3 meses/Tudo como alternativa) agora vive
   direto abaixo dos cards Receitas/Custos/Saldo, no lugar de "LANÇAMENTOS" — selecionar
   outro mês no gráfico atualiza tudo ali mesmo, sem sair da tela. Mês futuro mostra as
   categorias esperadas editáveis (recorrências + `plannedItems`) no lugar da lista de
   lançamentos reais — mesma lógica de antes, só que embutida em vez de numa aba/Sheet à
   parte. Estados `chartMode`/`extYm` (da leva anterior) removidos por ficarem sem uso.

4. **Header do Fluxo perdeu o indicador de mês próprio** — existia um controle "◀ Mês ▶"
   (`overMonth`/`setOverMonth`) acima do gráfico, independente do mês selecionado nas barras
   (`selChartYm`); os dois podiam mostrar meses diferentes ao mesmo tempo na tela, um deles
   sem efeito visível nenhum — bug reportado com screenshot (header em "Out/25", gráfico em
   "Mar/26"). Removido; a única forma de escolher o mês agora é tocar numa barra do gráfico,
   como o usuário já vinha usando. `overMonth` virou constante local (`= 0`) — segue existindo
   só porque a Taxa de Poupança (janela fixa dos últimos 6 meses) precisa de um mês-base, mas
   não tem controle próprio nem depende da seleção do gráfico.
5. **Lançamentos do Fluxo perderam busca e filtro de período** — a lista fundida no Fluxo (item
   3 acima) tinha, além do filtro por tipo/categoria, um campo de busca por descrição/categoria
   e um seletor "Mês selecionado / Últimos 3 meses / Tudo". Removidos os dois: o mês já é
   100% controlado pelo gráfico logo acima, então "Mês selecionado" era a única opção que
   fazia sentido na prática e o seletor virou ruído; a busca não tinha sido pedida e não
   compensava o espaço. Sobra só o filtro por categoria (select) e os pills Todos/Receitas/
   Custos. Estados `extSearch`/`extPeriod` removidos por ficarem sem uso.

Testado no navegador com uma base de dados fake injetada via `localStorage` só na sessão do
`npm run dev` (não toca nos arquivos de seed reais nem no app do celular): meses realizados
de Jun/Jul/Ago com lançamentos variados em várias categorias/contas/cartão, recorrências
novas cobrindo Salário/Aluguel/Internet/Assinaturas, um `recurringOverrides` pontual (Conta de
Luz sobe pra R$260 só em Out/26) e `plannedItems` em Set/Out/Nov. Confirmado: header mostra só
"Fluxo de Caixa" (sem mês solto), clicar numa barra passada/atual/futura atualiza o rótulo do
mês + cards + lista todos juntos, mês futuro mostra badge "projeção editável" com as categorias
certas (incluindo o override de Out/26 em 260), editar um valor projetado (testado em Set/26,
Lazer 300→450) reflete na hora no card de Custos, lista de lançamentos sem busca/período. `npm
run build`/`eslint` limpos (33 problemas, mesmo baseline pré-existente de sempre — a remoção
de `setOverMonth` teria introduzido 1 `no-unused-vars` novo, corrigido trocando o `useState`
por uma constante).

### Reorganização de navegação e correção de patrimônio líquido (25/08/2026, leva 2)
Feedback depois de testar a leva anterior com dados falsos (ver seção acima): 6 pontos de
navegação/UX mais um pedido explícito de auditoria de confiabilidade dos números.

1. **Botão inferior esquerdo (ícone "Yesod") não sai mais do módulo.** Causa raiz: uma correção
   de sessão anterior tinha feito esse ícone (o mesmo `treelife` da Árvore em `App.jsx`) chamar
   `onBack()` direto — o que quebrou a única forma de voltar pra Visão Geral a partir de
   Orçamento/Bolsos/Config, já que não tem mais controle segmentado dentro da aba Yesod pra
   isso. Agora navega internamente como qualquer outro tab (`setTab`/`setPage(null)`); sair do
   módulo continua pelo link "← Árvore" no topo, que já funcionava corretamente.
2. **Botão "Lançar"** passa a aparecer também em Orçamento → Fluxo (onde vive a lista de
   lançamentos), não só na Visão Geral.
3. **Botão "Banco" removido de Bolsos → Contas** — Config → Bancos já é CRUD completo
   (criar/editar/apagar), o botão em Contas só duplicava a criação sem oferecer editar/apagar.
4. **Dívidas e Financiamentos** deixou de ser aba própria no rodapé e virou a 5ª seção de
   Bolsos (depois de Investimentos) — mesmo padrão visual (divisor + header com botão) das
   outras seções. Rodapé cai pra 4 ícones antes do item 5 devolver pra 5.
5. **Nova aba "Objetivos"** — a seção "IF" (que vivia dentro da aba Yesod, controle segmentado
   Visão Geral/IF) migrou pra lá, e o checklist "Metas" (que vivia dentro da Visão Geral)
   também — os dois juntos no mesmo lugar. Com "IF" fora, a aba Yesod sobrou só com Visão
   Geral: o controle de pills foi removido (sem sentido com 1 opção só). "Outras Metas" segue
   livre pra criar qualquer objetivo, não só IF — aproxima o módulo do padrão de múltiplos
   objetivos do Hod, como pedido.
6. **Auditoria de confiabilidade**, testada ao vivo com a base de dados falsa (ver seção
   acima): confirmado que transações de cartão aparecem tanto no Extrato/Fluxo (agrupadas por
   mês da transação) quanto na fatura do cartão certo (agrupada por ciclo de fechamento/
   vencimento — datas diferentes são esperadas, ex. uma compra de 15/08 com fechamento dia 10
   cai na fatura de setembro, não na de agosto) — comportamento correto, não bug. Confirmado
   que os totais por categoria do Orçamento batem exatamente com os do Fluxo pro mesmo mês
   (testado com Alimentação: R$1.035,90 nos dois lugares). **Encontrado 1 bug real**: `net`
   (Patrimônio Líquido, usado no header, no score e na Meta de IF) calculava `totCardDebt`
   (soma das faturas em aberto de todos os cartões) mas nunca subtraía do total — o patrimônio
   ficava inflado pelo valor total usado nos cartões de crédito. Corrigido (`net` agora
   desconta `totCardDebt` também); no ambiente de teste isso corrigiu o patrimônio de
   R$32.645,10 pra R$20.800,10 (diferença de R$11.845,00, batendo exatamente com a soma das
   faturas em aberto dos 2 cartões de teste).

Testado no navegador: ícone Yesod volta pra Visão Geral de qualquer aba; "Lançar" aparece nos
dois lugares certos; Bolsos → Contas sem botão "Banco" (Config → Bancos intacto); Dívidas
dentro de Bolsos com dados corretos; aba Objetivos mostra IF + Outras Metas, indicadores da
Visão Geral ("Prog. IF", "Dívidas", "Metas") navegam pros lugares certos depois da
reorganização. `npm run build`/`eslint` limpos — **32 problemas** (baseline caiu de 33 pra 32:
`totCardDebt` era declarado e nunca lido, agora é usado no cálculo de `net`, então o
`no-unused-vars` correspondente sumiu — não foi introduzido nenhum problema novo). Rebuild do
APK debug, cópia pra Downloads, commit + push, changelog aqui — mesmo padrão das levas
anteriores.

### Registrar, totalizadores compactos em Bolsos, Objetivos colapsado (25/08/2026, leva 3)
Terceira leva do dia, ajustes finos depois de testar a leva 2:

1. **Botão "Lançar" virou "Registrar"** — no header e dentro do extrato de conta, mesmo
   comportamento.
2. **Card "TOTAL EM DÍVIDAS" perdeu destaque** — o usuário achou que um card grande
   (gradiente, borda grossa, número de 24px) só pra Dívidas não fazia sentido. Virou um
   totalizador compacto de uma linha (label + valor, borda colorida fina à esquerda —
   componente `MiniTotal`, ver `YesodModule.jsx`). Todas as outras 4 seções de Bolsos
   ganharam o mesmo totalizador, cada uma com sua cor: Contas (verde, soma dos saldos),
   Cartões (roxo, "Total em Faturas" — soma de `totCardDebt`, a mesma fatura em aberto que
   agora desconta do patrimônio líquido desde a leva 2), Caixinhas (azul, soma dos saldos),
   Investimentos (âmbar, total investido), Dívidas (vermelho, como antes, só que compacto).
3. **Aba Objetivos colapsa pro card principal** — a vista cheia (card de IF + grid de stats
   + taxa de poupança 6 meses + editar meta + checklist Outras Metas) apareceu logo depois
   da leva 2 e o usuário achou cheia demais por padrão. Virou vista colapsada: só o card de
   progresso da Meta de IF + botão "+ Objetivo" (cria uma meta livre sem precisar abrir o
   detalhe). Tocar no card navega pra `page.type==="goalsDetail"`, mesmo padrão de sub-página
   já usado em conta/cartão/caixinha/investimento/dívida (`nav()`/`BackBtn`) — lá dentro mostra
   tudo que antes ficava sempre visível.

**Follow-up da mesma leva**: os botões "+ Conta"/"+ Cartão"/"+ Caixinha"/"+ Ativo" em Bolsos
viraram todos "+ Adicionar" (Dívidas já usava esse texto) — rótulo único pro botão de criar
em cada seção, em vez de um nome diferente por seção.

Testado no navegador: botão "Registrar" nos dois lugares; Bolsos com 5 totalizadores
compactos e cores diferentes (Contas R$40.415,10 verde, Faturas R$11.845,00 roxo, Caixinhas
R$12.700,00 azul, Dívidas R$49.800,00 vermelho); Objetivos mostra só o card de IF por padrão,
tocar nele abre o detalhe completo com "← Objetivos" pra voltar, "+ Objetivo" abre o sheet de
criar meta direto da vista colapsada. `npm run build`/`eslint` limpos — 32 problemas (mesmo
baseline da leva 2). Rebuild do APK debug, cópia pra Downloads, commit + push, changelog aqui.

### Bolsos passam a movimentar contas de verdade — extrato por mês, Caixinhas com juros/histórico/projeção, Investimentos com Aportar/Resgatar, Dívidas com amortização/quitação (25/08/2026, leva 4)
Depois de usar a reorganização de Bolsos, o usuário percebeu que várias ações de dinheiro
(mover pra Caixinha, aportar/resgatar Investimento, quitar Dívida, receber um empréstimo)
não tinham **nenhuma ligação com uma conta** — o valor só mudava isolado na própria
entidade. Achado que resolveu o design: o app já tinha o padrão certo pra isso, o modo
**Transferir** do sheet de lançamento (tx real numa conta + ajuste do outro lado) — as
mudanças abaixo generalizam essa mesma ideia em vez de inventar um mecanismo novo.

1. **Contas — extrato agrupado por mês.** A lista de lançamentos da conta (que era plana)
   agora agrupa por mês, cada grupo com cabeçalho mostrando o saldo daquele mês — rolar a
   lista já mostra os extratos realizados dos meses passados, sem precisar de navegação
   separada.
2. **Cartões — faturas passadas já funcionavam.** Conferido que `getStmts` já lista todos
   os meses (passado/atual/futuro) sem filtro — nenhuma mudança de código necessária aqui.
3. **Caixinhas** ganharam campo de **taxa de juros** (número + toggle % ao ano/% ao mês,
   editável pelo usuário — não fixo). **Depositar/Retirar agora exige escolher uma conta**:
   o dinheiro debita/credita de verdade uma conta (antes só ajustava o saldo da caixinha
   isolado). Novo **histórico mensal de saldo** (`boxSnaps`, mesmo padrão do `patrimSnaps` —
   mês corrente ao vivo, meses passados congelados; história só existe a partir de agora,
   não é retroativa) e nova **projeção futura** (composição mês a mês pela taxa informada),
   os dois na página de detalhe da caixinha.
4. **Investimentos** ganharam **Aportar** e **Resgatar**, cada um ligado a uma conta.
   Aportar soma no `invested` e no `balance`. Resgatar reduz o `balance` e reduz o
   `invested` **proporcionalmente** ao que saiu do saldo — confirmado com o usuário que é
   assim que o % de rendimento fica coerente antes/depois de um resgate parcial (testado:
   resgate de 50% do saldo manteve o % de rendimento idêntico). "Atualizar saldo" continua
   existindo, é o ajuste de valor de mercado.
5. **Dívidas**: criar uma dívida ganhou campo **"Valor recebido"** (o principal — pode ser
   diferente da soma das parcelas, que já embute juros, confirmado com o usuário) + conta
   pra creditar, então o empréstimo recebido cai de verdade numa conta ao criar. "Registrar
   parcela paga" agora exige conta e debita o valor pago. Duas ações novas, as duas também
   ligadas a conta: **Amortizar** (por valor em R$ ou por número de parcelas; no modo valor,
   escolha entre reduzir prazo — quita parcelas finais, valor da parcela não muda — ou
   reduzir parcela — nº de parcelas não muda, valor de cada uma diminui) e **Quitar dívida**
   (paga o saldo devedor inteiro de uma vez).

Testado no navegador ponta a ponta: extrato de conta mostrando Ago/Jun/Mai/26 com subtotal
cada; caixinha com 12% a.a., depósito de R$500 debitando a conta certa e atualizando
saldo/histórico/projeção (conferida a fórmula de juros composto mês a mês); investimento com
aporte de R$1.000 (saldo 10.420→11.420, % de ganho ajustado corretamente) e resgate de
R$5.710 — metade do saldo — mantendo o % de rendimento em 3,8% antes e depois; dívida nova
com valor recebido R$10.000 creditando a conta (parcelas somam R$12.000 com juros, valores
propositalmente diferentes); amortização de R$2.000 reduzindo parcela (833,33 = 10.000/12,
exato); parcela paga debitando a conta; quitação geral zerando o saldo devedor (100%
quitado). `npm run build`/`eslint` limpos — 34 problemas; as 2 a mais que a leva 3 (32) são
réplicas esperadas do mesmo padrão de ruído que `patrimSnaps` já gerava (`catch(_)` +
`setState` síncrono dentro de effect), agora também para a nova chave `boxSnaps` — confirmado
comparando lint linha a linha contra a versão anterior ao HEAD, não é regressão nova.

**Follow-up (mesmo dia)**: usuário reportou que criar um investimento NOVO com valor
"Aplicado" não debitava conta nenhuma — a leva 4 só tinha ligado Aportar/Resgatar (ações
sobre investimento já existente), esquecendo que criar um do zero é o mesmo gap que já tinha
sido corrigido pra criar dívida (item 5 acima). Corrigido: `addInv` ganhou `accId` opcional
("Debitar de", com aviso de que pode deixar em branco se for um ativo que já existia antes
do app) e, se preenchido, debita o valor aplicado da conta ao criar. Encontrado no teste real
do usuário um investimento órfão criado antes da correção (`invested:10000, balance:0`, sem
tx correspondente em nenhuma conta) — ficou registrado aqui como um lembrete de que dados
criados antes desse commit podem precisar de correção manual (editar o Saldo atual e/ou
lançar a diferença manualmente), não foi corrigido automaticamente.

### Barra do gráfico não estoura mais o card; compra parcelada e parcelas de dívida entram no "Esperado" (25/08/2026, leva 5)
Dois pedidos do usuário no mesmo dia: um ajuste visual (barra grande "parecendo estourar" o
card do gráfico) e uma auditoria — "todos os lançamentos de contas, caixinhas, investimentos
e dívidas aparecem no extrato e no fluxo? compra parcelada impacta fluxos futuros? uma dívida
reflete nos custos? receita recorrente aparece no fluxo?".

1. **Gráfico sem estouro visual**: `height:Math.max(2,(m.ins/chartMax)*56)` já devia ficar
   sempre ≤56px matematicamente (chartMax é o maior valor entre os meses mostrados), mas sem
   teto explícito nem `overflow:hidden` no container, qualquer valor bem acima da escala
   normal do ano (ex: um empréstimo grande recém-creditado) fazia a barra parecer romper o
   card. Adicionado `Math.min(56,...)` nos dois cálculos de altura (entradas e saídas) +
   `overflow:hidden` nos dois containers — trava dupla, defensiva.
2. **Compra parcelada e parcelas de dívida agora entram no "Esperado"**: auditoria encontrou
   que nenhum dos dois aparecia em mês futuro nenhum do Fluxo — só no mês em que a compra foi
   feita ou a dívida criada. A projeção "Esperado" só somava recorrências ativas + categorias
   planejadas manualmente. As funções certas pra isso já existiam
   (`cardBurdenAtMonth`/`debtBurdenAtMonth`, criadas antes só pra Projeção de Fluxo de Caixa,
   uma sub-view separada) — `futureCategoryTotals` passou a somar as duas também, como
   categorias novas "Fatura de Cartão" e "Parcelas de Dívida", só leitura (fatos já
   conhecidos, diferente de recorrências/planejados que são estimativa editável).

Testado no navegador: compra de R$3.000 em 3x lançada no cartão — mês seguinte mostrou
"Fatura de Cartão" no Esperado batendo com a parcela devida naquele mês; "Parcelas de Dívida"
em Set/26 somou R$2.050,00 = R$1.250 (Financiamento Carro) + R$800 (Empréstimo Pessoal),
exato; total de Custos do mês (R$7.455,00) bateu com a soma de todas as categorias listadas,
incluindo as duas novas. Confirmado que receita recorrente (Salário) já aparecia certinho no
Esperado (sem mudança necessária) e que todos os lançamentos ligados a conta das levas
anteriores (Caixinha, Investimento, Dívida) aparecem certinho no Extrato/Fluxo do mês em que
aconteceram. `npm run build`/`eslint` limpos — 34 problemas, mesmo baseline de antes.

### Despesas Divididas ganham contabilização de verdade (25/08→26/08/2026, leva 6)
Usuário pediu pra entender como "Despesas Divididas" funcionava e, ao ver que era só um
lembrete visual (custo sempre contado cheio, "Marcar acertado" não gerava nenhum dinheiro,
sem noção de "a receber" em lugar nenhum), pediu pra implementar a contabilização real.

1. **Custo líquido sempre** — o valor que conta em Fluxo/Orçamento/Score agora é
   `mySplitShare` (desconta a parte da outra pessoa), **sempre**, esteja "acertado" ou não —
   a parte dela nunca foi seu gasto de verdade. Aplicado em `cashflowMonth`, `monthTotals`
   (mês realizado), `budgetSpend`, `avgAccountNet3` (projeção) e na lista de Lançamentos do
   Fluxo (linha individual + total do filtro). Recorrências futuras com split **não** foram
   ajustadas (limitação conhecida, documentada em comentário — evita risco de dobrar o
   desconto no fluxo de edição de `recurringOverrides`).
2. **"A receber" vira ativo de verdade** — `splitReceivable` soma a parte pendente de todas
   as despesas divididas não recebidas, e essa soma (`totReceivable`) entra no cálculo do
   Patrimônio Líquido (`net`) até ser efetivamente recebida.
3. **"Marcar acertado" virou "Registrar recebimento"** — sheet novo que pede a conta onde
   caiu o reembolso e lança de verdade uma entrada (`tx in`, categoria "Reembolso") nela,
   só então marcando a transação original como acertada — mesmo princípio de "tudo ligado a
   conta" já usado em Caixinha/Investimento/Dívida. Itens já recebidos mostram um badge
   estático "Recebido" (sem opção de desfazer aqui — pra corrigir um erro, usa a edição
   manual do lançamento, que continua existindo à parte). O header do card ganhou "a receber
   R$X" somando os pendentes.
4. **Notas visuais**: Extrato de conta mostra o valor **cheio** pago (é o dado real que saiu
   da conta) com uma nota "Dividido com Fulano (50%) · pendente/recebido"; a lista de
   Lançamentos do Fluxo mostra o valor **líquido** (bate com o total do card Custos acima),
   com nota "Total pago RX · Fulano deve RY".
5. **Coach IA**: ação `mark_split_settled` ganhou o mesmo comportamento — `settled:true`
   agora lança o reembolso de verdade numa conta (campo `account` opcional, ou primeira
   conta por padrão) antes de marcar acertado; `settled:false` continua só corrigindo o
   campo, sem desfazer um reembolso já lançado.

Testado no navegador: nova despesa dividida de R$200 (50%) fez o patrimônio cair exatamente
R$100 (não R$200 — os outros R$100 viraram "a receber"); Custos do mês conferidos via
`localStorage` batendo exatamente com a soma líquida de todos os splits do mês, incluindo um
que já estava "acertado" desde antes desta leva (confirma que o desconto vale sempre, não só
enquanto pendente); "Registrar recebimento" lançou a entrada certa na conta escolhida e o
patrimônio ficou idêntico ao de antes (ativo virou caixa — evento neutro, como esperado).
`npm run build`/`eslint` limpos — 34 problemas, mesmo baseline (YesodModule.jsx,
yesodActions.js, coachSkills.js todos limpos).

### Coach ganha paridade com a UI — box_move/create_debt/pay_debt/create_investment ligados a conta, 4 ações novas (26/08/2026, leva 7)
Usuário trouxe 3 estudos pro módulo (Config como hub, revisão da fórmula do %, Coach com
paridade total + skills de planejamento financeiro — resumo completo dado em chat, não
registrado aqui por ainda não terem sido todos implementados) e pediu pra começar pela
correção mais urgente: as ações do Coach que ficaram **desatualizadas** conforme a UI ganhou
a exigência de "tudo ligado a conta" ao longo desta sessão.

Confirmado no código: `box_move`, `create_debt`, `pay_debt` e `create_investment` em
`yesodActions.js` ainda eram as versões de antes desta sessão inteira — sem nenhuma noção de
conta. Pedir pro Coach "deposita R$500 na Reserva de Emergência" ou "cria uma dívida de
R$10.000" mexia no número sem debitar/creditar conta nenhuma, quebrando silenciosamente a
mesma disciplina que a UI já garantia (accBal, patrimônio líquido ficando incoerentes com o
que o Coach "fez").

Corrigido, espelhando exatamente as funções da UI já testadas nesta sessão:
- `box_move` — exige/usa uma conta (primeira, se omitida), lança a tx real de débito
  (depósito) ou crédito (retirada) nela — mesma lógica de `boxMoveLinked`.
- `create_debt` — ganhou `valorRecebido`+`account` — credita o principal recebido numa conta
  ao criar — mesma lógica de `addDebt`.
- `pay_debt` — exige/usa uma conta e debita o valor da(s) parcela(s) — mesma lógica de
  `payDebt`.
- `create_investment` — ganhou `account` — debita o valor aplicado ao criar, quando
  informado — mesma lógica de `addInv`.

Quatro ações novas, sem equivalente nenhum no Coach antes:
- `amortize_debt` — por valor (R$, com escolha de reduzir prazo ou parcela) ou por número de
  parcelas — mesma lógica de `amortizarDivida`.
- `settle_debt` — quitação geral do saldo devedor — mesma lógica de `quitarDivida`.
- `invest_aportar` / `invest_resgatar` — aporte e resgate ligados a conta, resgate reduz o
  aplicado proporcionalmente — mesma lógica de `invAportar`/`invResgatar`.

`systemPrompt` (`coachSkills.js`) documentado com os campos/ações novas. `npm run
build`/`eslint` limpos (exit 0 em ambos os arquivos). Sem teste via chat real (exigiria API
key configurada, mesmo padrão já adotado nesta sessão pra ações de coach) — confiança vem de
espelhar função por função a lógica da UI já testada visualmente.

**Status dos 3 estudos** (26/08/2026): item 2 (fórmula do % configurável) **implementado**,
ver "Config ganha Preferências..." abaixo e [[#Score do módulo (recomposto 26/08/2026 — pesos agora configuráveis)|Score]].
Restam: Config como hub central — o "índice de tudo" espelhando Contas/Cartões/Caixinhas/
Investimentos/Dívidas/Bancos/Categorias/Recorrências/Pessoas/Objetivos dentro de Config, e
outras preferências do módulo (cor de destaque, apelido, densidade visual, confirmação de
exclusão — essa última é a lacuna de segurança mais real hoje, nenhum delete pede
confirmação). Skills de planejamento financeiro (b-e: Expense Leak Detector, Automatic
Savings System, Budget Without Shame, Debt Elimination — este último precisa de campo de
juros na Dívida, que não existe hoje) também pendentes.

### Config ganha "Preferências" — fórmula de Saúde Financeira configurável + skill do Coach de avaliar/sugerir pesos (26/08/2026, leva 8)
Primeira peça concreta do estudo "Config como hub", por ser a mais imediatamente acionável:
o usuário pediu explicitamente que a fórmula do % (ver seção "Score do módulo" acima) virasse
ajustável em Config a qualquer momento, em vez de eu fixar uma composição nova sem opção de
mudança — e que o Coach pudesse ajudar a avaliar/sugerir esses pesos.

- Nova seção **"PREFERÊNCIAS"** em Config — primeira do tipo (até então só existiam listas
  "item + Adicionar" tipo Bancos/Categorias). Card "Fórmula de Saúde Financeira": 5 pesos
  editáveis + meta de reserva em meses + "Restaurar padrão".
- `scoreWeights` novo estado persistido (`lifetree_fin_scoreweights`), a fórmula recomposta
  já descrita na seção "Score do módulo" acima.
- Coach ganhou a ação `update_score_weights` (só corrige os campos informados) e o contexto
  `formula_saude_financeira` (pesos + cada sub-componente já calculado com dados reais). Novo
  skill no systemPrompt: ao ser perguntado sobre o score, o Coach explica com números reais
  (não em abstrato), aponta peso "desperdiçado" e só aplica a mudança depois que o usuário
  topar a redistribuição — nunca decide sozinho "otimizar" o número reduzindo um peso.
- Bônus: `patrimonio_liquido` no contexto do Coach (`buildYesodContext`) estava desatualizado
  desde a correção de patrimônio líquido de uma leva anterior (não descontava fatura de
  cartão nem somava despesas divididas a receber) — corrigido pra bater com a UI.

Testado no navegador: fórmula recomposta fez o score pular de 43% pra 76% com os pesos
padrão (matemática conferida via réplica exata em JS, bateu 76% exato); mudar um peso
recalculou o score em tempo real; "Restaurar padrão" volta aos valores default exatos;
simulado o write exato que `update_score_weights` faria via `localStorage` (mesmo padrão
readJSON+patch+writeJSON das outras ações do Coach) e confirmado que a UI lê e reflete o
formato certinho. `npm run build` limpo; `YesodModule.jsx` mantém o mesmo baseline de lint
(35 problemas — só mais um `catch(_)` esperado pro novo efeito de persistência, mesmo padrão
de sempre); `coachSkills.js`/`yesodActions.js` sem nenhum problema.

## Persistência
Prefixo `lifetree_fin_` — 23 chaves: `banks`, `accs` (inclui a conta virtual Carteira), `cards`, `boxes`, `debts`, `invs`, `budgets`, `yhabits`, `ygoals`, `ifgoal`, `ifmonthly`, `finxp`, `patrimsnaps` (agora gravado de verdade, ver acima), `boxsnaps` (novo, 25/08/2026 — histórico mensal de saldo por Caixinha, mesmo padrão de `patrimsnaps` mas não retroativo), `scoreweights` (novo, 26/08/2026 — pesos da fórmula de Saúde Financeira), `catsout`, `catsin`, `recurrings`, `yesodcards`, `projevents` (12/08/2026, substitui `projscenario`), `splitpeople`, `recoverrides` (novo, 23/08/2026), `plannedItems` (novo, 23/08/2026). ~~`scenarios`~~ removida 23/08/2026 junto com a aba (chave antiga fica órfã no localStorage de quem já tinha usado, inofensiva). Segue o padrão correto (localStorage, não `window.storage`) — tema (`dark`) não é persistido aqui, vem só de `App.jsx` (ver [[02 Arquitetura]]).

## Padrão de tema
`const C = dark ? DARK : LIGHT;` — dentro do componente, **correto** (não usa o anti-padrão de variável global mutável que afeta Geburah/Hod/Tiphareth).

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
