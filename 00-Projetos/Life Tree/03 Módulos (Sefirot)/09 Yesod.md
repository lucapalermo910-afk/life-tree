---
tags: [lifetree, modulo, yesod]
aliases: [Yesod]
---

# 💰 Yesod — Finanças

> Status: ✅ Integrado na Árvore · Arquivo: `preview/src/YesodModule.jsx` (~1185 linhas, 25/08/2026) · **fecha como v10** (ver [[08 Versões]])
> Score bridge: publica `yesod` em `lifetree_scores`
> Esta nota incorpora a auditoria funcional completa feita em 01/08/2026 (levantamento de telas/entidades/gaps que também existe como [artefato web](https://claude.ai/code/artifact/477b284f-23ed-447d-a614-5ff541796195)) — é a referência canônica do estado do módulo daqui pra frente, não só notas de implementação.

## Abas
Reorganizado em 01/08/2026 de 9 pra **5 abas**: `yesod` (Yesod — com controle segmentado interno **Visão Geral** / **Fluxo** / **IF**, ver [[04 Bugs Conhecidos]]) · `orc` (Orçamento) · `bolsos` (Contas, Caixinhas, Cartões e Investimentos, cada linha com editar/apagar inline) · `debt` (Dívidas) · `cfg` (Config — só o que não tem lugar em outra tela: Bancos, Categorias, Recorrências). As antigas abas `over` (Geral) e `inv` (Investimentos, agora dentro de Bolsos) foram removidas; `fluxo` e `if` viraram seções do controle segmentado em vez de abas próprias.

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

- **Yesod → Visão Geral** — score "Saúde Financeira" (0–100%, fórmula em [[#Score do módulo|Score]]) com barra e XP acumulado · banner de alertas de vencimento (faturas/dívidas ≤7 dias, destaque vermelho se ≤2) · painel de indicadores (12 disponíveis, usuário escolhe quais e em que ordem) · checklist de hábitos financeiros próprios do módulo · checklist de metas financeiras próprias do módulo.
- **Yesod → IF** — progresso da meta (patrimônio atual vs. necessário, regra dos 4%), projeção de anos/meses até atingir com base na poupança média dos últimos 3 meses, renda mensal estimada, editar meta por valor-alvo ou por renda desejada. (Fluxo saiu do controle segmentado do Yesod em 25/08/2026 — ver Orçamento abaixo — sobra só Visão Geral | IF.)
- **Orçamento** — ganhou controle segmentado próprio em 25/08/2026, **Fluxo primeiro** (é o mais usado): **Fluxo** (carrossel de 6 sub-views que antes vivia na aba Yesod — Fluxo de Caixa com gráfico realizado+esperado do ano inteiro + lançamentos filtráveis embutidos, ver seção própria; Taxa de Poupança; Progresso Dívidas; Rendimento Investimentos; Evolução Patrimonial; Projeção) · **Orçamento** (lista por categoria com limite/gasto real/%/alerta "ACIMA", criar/editar/apagar). A aba "Extrato" existiu como 3º pill por 2 dias e foi removida — voltou a viver dentro do próprio Fluxo.
- **Bolsos** — Contas (saldo, criar com banco novo direto daqui, editar/apagar inline, tocar → extrato) **com Cartões aninhado dentro** (limite usado com barra de cor por %, mesmas ações, tocar → faturas por vencimento — nested em Contas desde 23/08/2026, antes era seção irmã) · Caixinhas (saldo/meta/%/data alvo, mesmas ações, tocar → depositar/retirar) · Investimentos (4 categorias com total e ganho/perda, tocar → detalhe por subcategoria).
- **Dívidas** — total em dívidas no topo; lista com progresso (%, parcelas pagas/total); criar, apagar, tocar → editar / registrar parcela paga.
- **Config** — Bancos (único lugar de CRUD, sem equivalente browsável em outra tela) · Categorias de Saída/Entrada (criar/apagar) · Recorrências (pausar/retomar, apagar).

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

### Score do módulo
```js
const calcYesodScore = () => {
  const cf0 = cashflowMonth(-1);
  const savRate = cf0.ins>0 ? Math.max(0,(cf0.ins-cf0.outs)/cf0.ins) : 0;
  const ifN = ifGoal || ifMonthly*300 || 1;
  const debtS = debts.length>0 ? debts.reduce((s,d)=>s+(d.parcelasPagas/d.totalParcelas),0)/debts.length : 1;
  const budS = budgets.length>0 ? budgets.filter(b=>budgetSpend(b.cat)<=b.limit).length/budgets.length : 0.5;
  const habS = yHabits.filter(h=>h.done).length/(yHabits.length||1);
  const goaS = yGoals.filter(g=>g.done).length/(yGoals.length||1);
  return Math.round((
    Math.min(1,savRate/0.2)*0.20 +      // taxa de poupança, 20%
    Math.min(1,net/ifN)*0.25 +          // progresso rumo à IF, 25%
    debtS*0.15 +                        // dívidas quitadas, 15%
    budS*0.15 +                         // orçamento respeitado, 15%
    habS*0.13 +                         // hábitos financeiros, 13%
    goaS*0.12                           // metas financeiras, 12%
  )*100);
};
```

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

## Persistência
Prefixo `lifetree_fin_` — 21 chaves: `banks`, `accs` (inclui a conta virtual Carteira), `cards`, `boxes`, `debts`, `invs`, `budgets`, `yhabits`, `ygoals`, `ifgoal`, `ifmonthly`, `finxp`, `patrimsnaps` (agora gravado de verdade, ver acima), `catsout`, `catsin`, `recurrings`, `yesodcards`, `projevents` (12/08/2026, substitui `projscenario`), `splitpeople`, `recoverrides` (novo, 23/08/2026), `plannedItems` (novo, 23/08/2026). ~~`scenarios`~~ removida 23/08/2026 junto com a aba (chave antiga fica órfã no localStorage de quem já tinha usado, inofensiva). Segue o padrão correto (localStorage, não `window.storage`) — tema (`dark`) não é persistido aqui, vem só de `App.jsx` (ver [[02 Arquitetura]]).

## Padrão de tema
`const C = dark ? DARK : LIGHT;` — dentro do componente, **correto** (não usa o anti-padrão de variável global mutável que afeta Geburah/Hod/Tiphareth).

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
