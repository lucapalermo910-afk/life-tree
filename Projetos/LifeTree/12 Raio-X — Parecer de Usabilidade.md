---
tags: [lifetree, usabilidade, auditoria, raio-x]
aliases: ["Raio-X", "Raio-X do Life Tree", "Parecer de Usabilidade"]
---

# 🩻 Raio-X do Life Tree — Parecer de Usabilidade

> Parecer de usabilidade feito testando o app **ao vivo no navegador** (`claude-in-chrome`), não por leitura de código — walkthrough real, dados de teste populados, Coach acionado de verdade, heurísticas de Nielsen, benchmark de mercado por categoria. Complementa, não substitui, a auditoria de módulos ([[00 Índice]], 09/08/2026) e a de segurança/performance ([[10 Segurança, Mobile e Performance]], 10/08/2026).
>
> **1ª rodada: 14/08/2026** (8 módulos, Kether/Malkuth ainda placeholder). **2ª rodada: 29/08/2026** (10 módulos — Kether e Malkuth viraram reais entre as duas rodadas —, terminou no mesmo dia com 3 correções deployadas em produção). **3ª rodada: 31/08/2026** (versão sem nenhum dado mockado — onboarding em branco testado de verdade pela 1ª vez, mais profundidade nova em Geburah/Yesod).
>
> Publicado também como [artefato web](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a) — mesmo conteúdo, formato visual, mesmo link atualizado nas três rodadas (esta nota é quem estava faltando no vault até 29/08/2026 — antes só existia como HTML).

**Nota geral: 8.0/10** (era 7.9/10 em 29/08 já com as 3 correções do mesmo dia, 7.3/10 em 14/08).

## Sumário executivo

A 3ª rodada fecha um bloqueador estrutural que as duas anteriores só registravam como pendente: **onboarding**. Até 29/08 nunca tinha existido, de verdade, um teste do que um usuário novo veria — os 10 módulos sempre foram testados com dado de seed já populado. Nesta rodada, todo dado de demonstração (contas, dívidas, treinos, receitas, hábitos-modelo, XP inicial — ~15 arquivos, 10 módulos) foi removido na fonte, incluindo duas armadilhas que um "zerar só o `useState`" teria deixado passar: um fallback de re-seed escondido dentro de um `useEffect` de montagem no Hod, e três botões "Reiniciar dados" (Chokmah, Binah, Tiphareth) que reintroduziam o seed antigo mesmo depois de zerado. Testado ao vivo com `localStorage` limpo nos 10 módulos + hub: zero crash, zero `NaN`, catálogos de referência preservados (373 alimentos, biblioteca de exercícios) — só uma imperfeição cosmética no card de peso do Geburah (ver "Achados — 3ª rodada" abaixo).

Além do onboarding, Geburah ganhou profundidade real de produto — busca de alimento em tela cheia com porção em 2 casas decimais e unidades culinárias marcadas "(estimado)", CRUD completo de receitas, e uma aba "Alimentos" dedicada por categoria — e o Coach do módulo, que cobria só 8 ações antigas (peso/refeição/água/medida/treino/metas), passou a cobrir as **17 ações novas** também (comida, receita, rotina, exercício), a pedido explícito do usuário ("todas elas"). Yesod trocou o painel de Indicadores por uma visão de Receitas/Despesas quebrada em efetivada/esperada/vencida, e ganhou um card "Próximas Receitas" simétrico ao de despesas já existente. E a navegação inferior ficou consistente nos 8 módulos: o botão de árvore no rodapé virou uma aba normal (leva ao dashboard do próprio módulo), a saída pra Árvore da Vida ficou só no "← Árvore" do topo — corrige uma inconsistência que nenhuma das duas rodadas anteriores tinha notado porque nenhuma testava navegação de saída de propósito.

**Os 3 achados críticos da 2ª rodada seguem corrigidos e em produção** (29/08/2026) — ver "Achados críticos" abaixo e [[04 Bugs Conhecidos]].

## Achados críticos

### 🟢 Coach 100% fora do ar no Yesod — corrigido no mesmo dia
Perguntar qualquer coisa ao Coach de dentro do Yesod (testado com `"oi"`) falhava sempre com `HTTP 413 "Payload grande demais"`, confirmado via rede — não era o conteúdo da pergunta, era o payload que o módulo monta. Causa raiz: `preview/api/_lib/rateLimit.js` definia `MAX_BODY_BYTES = 32 * 1024` ("sobra pra uma mensagem de chat normal"), mas o contexto que `buildYesodContext` monta hoje — depois de crescer pra cobrir 50+ ações, 5 skills de planejamento e o novo status de risco da Meta de IF — estourava esse teto sozinho, antes mesmo de somar a pergunta do usuário. Medido ao vivo: `system`+`messages` do Yesod com dado de seed normal e "oi" = ~35KB.

**Corrigido:** `MAX_BODY_BYTES` subiu pra 256KB — margem pro maior módulo hoje + crescimento futuro + histórico de conversa acumulado (o proxy recebe a conversa inteira de novo a cada turno, não só a mensagem nova). Retestado ao vivo: o mesmo request que antes voltava `413` agora chega até a Anthropic (`400`, erro de billing real da conta — condição externa, não mais bug do proxy). Deployado em produção (`vercel --prod`, hash `index-3htl_D2Y.js`).

### 🟢 Erro cru da API vazava pro usuário final — corrigido no mesmo dia
Reproduzido verbatim: `"Erro de conexão: Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."` — em inglês, citando "Anthropic API" e "Plans & Billing" direto pro usuário final. Já era achado de 14/08, nunca corrigido até então.

**Corrigido:** `sendToCoach` (`App.jsx`) agora loga o erro real só no console e mostra sempre "O Coach está indisponível agora. Tente de novo em instantes." pro usuário, independente da causa (billing, payload, rede).

### 🟢 Toast/bolha de erro do Coach não sumia sozinho — corrigido no mesmo dia
Não é um toast separado — é a própria bolha de resposta do Coach (`position:fixed`, a mesma que mostra ação pendente pra confirmar), com estado em `App.jsx` acima de todos os módulos. Confirmado sobrevivendo até depois de trocar de módulo inteiro (apareceu por cima do Geburah minutos depois de disparado no Yesod), pior do que o registro de 14/08 sugeria.

**Corrigido:** novo `useEffect` fecha a bolha sozinha 6s depois, mas só quando a última mensagem é um erro (`isError:true`) — uma resposta normal do Coach (que pode ter ação pendente pra confirmar) continua exigindo fechamento manual, como antes.

### 🟢 Bug de decimal e "50% fixo" — resolvidos entre as duas rodadas
Retestado `245.90` no campo Valor (R$) do Yesod: patrimônio líquido caiu exatamente R$245,90, sem truncar (corrigido em 15/08/2026, ver [[04 Bugs Conhecidos]]). E os 10 módulos mostram percentuais reais e distintos — nenhum "50%" genérico de placeholder restante, nem em Kether/Malkuth, que eram exatamente os dois módulos com esse problema em 14/08.

### 🟢 Zero erros de console — confirmado de novo
Navegação completa pelos 10 módulos + hub + troca de tema + formulário + duas chamadas de Coach com erro — zero erro JS no console em qualquer ponto, nas duas rodadas.

## Achados — 3ª rodada (31/08/2026)

### 🟢 Zero dado mockado — onboarding em branco testado pela 1ª vez
Até esta rodada, nenhum teste (14/08 ou 29/08) tinha carregado o app com `localStorage` vazio — os 10 módulos sempre chegavam pré-populados. Removido na fonte: contas/cartões/dívidas/investimentos e hábitos-modelo do Yesod, rotinas e receitas-modelo do Geburah, trilhas/metas/hábitos/projetos-modelo do Hod, XP inicial (era 120) e cadastros do Chesed, hobbies/tarefas/experiências do Netzach, hábitos/tradições do Chokmah (+ botão "Reiniciar dados"), trilhas/livros do Binah (+ botão "Reiniciar dados"), hábitos/rotinas/metas/produtos do Tiphareth (+ botão "Reiniciar dados"). Catálogos de referência (373 alimentos, biblioteca de exercícios, taxonomias de categoria) foram mantidos de propósito — não são dado de demonstração, são base de consulta.

**Testado ao vivo, `localStorage.clear()` + reload, nos 10 módulos + hub:** zero crash, zero `NaN`, todo empty-state renderizando corretamente ("Nenhum item ainda", "Sem treino agendado", "0/0", checklists do Kether/Malkuth confirmando "nenhuma meta/desejo/projeto nos módulos conectados ainda"). Único ponto cosmético: o card "Meta do Dia" do Geburah mostra um pequeno negativo (`-0.1kg`) quando peso atual e meta ainda não foram configurados, porque a taxa semanal (usada como divisor) precisa ficar num piso seguro (`0.5`, o mínimo do próprio formulário) em vez de zerar — não é `NaN` nem crash, só um número que não faz sentido lido isoladamente antes do 1º cadastro. Não bloqueia uso; fica registrado como item de polimento, não como bug.

### 🟢 Nutrição/Geburah — busca de alimento, receitas e aba dedicada
Fluxo de registro de refeição trocou de modal por um card que abre busca em tela cheia → detalhe do alimento → seletor de porção (2 casas decimais, unidades culinárias como colher de sopa/xícara/copo marcadas "(estimado)"). Criação de alimento saiu do fluxo de busca e ganhou aba própria ("Alimentos"), com o mesmo padrão de categoria-e-drilldown já usado na biblioteca de exercícios — decisão revertida em campo depois de uma 1ª tentativa (botão dentro da busca) não ter agradado. CRUD completo de receitas (filtro, detalhe, editar, excluir, registrar como refeição) também novo nesta janela.

### 🟢 Coach do Geburah — 8 ações antigas → 25 no total
`geburahActions.js`/`coachSkills.js` ganharam 17 ações novas (CRUD de alimento, CRUD de receita + ingredientes + registro como refeição, excluir item de refeição, CRUD de rotina/exercício) — cobrindo tudo que o módulo passou a ter na UI. Antes, o Coach só via peso/refeição/água/medida/treino/metas; qualquer coisa sobre comida, receita ou rotina precisava ser feita manualmente.

### 🟢 Navegação inferior — botão de árvore virou aba normal nos 8 módulos
Antes, o ícone de árvore do rodapé chamava `onBack()` (saía pra Árvore da Vida) em todo módulo — comportamento diferente de qualquer outra aba do mesmo rodapé, que navega dentro do módulo. Corrigido nos 8 módulos (Yesod, Hod, Tiphareth, Geburah, Chesed, Netzach, Chokmah, Binah): agora leva ao dashboard do próprio módulo, como as demais abas; sair pra Árvore ficou exclusivamente no "← Árvore" do topo.

### 🟢 Yesod — dashboard: Indicadores → Receitas/Despesas do mês, Próximas Receitas
Painel de Indicadores substituído por cards de Receitas totais (efetivadas/esperadas) e Despesas totais (efetivadas/esperadas/vencidas/próximas do vencimento) — reaproveitando a mesma lógica que já alimentava os alertas "EM ATRASO"/"VENCE NOS PRÓXIMOS 7 DIAS", então os números batem entre os dois lugares por construção, não por coincidência. Novo card "PRÓXIMAS RECEITAS" (só informativo — receitas recorrentes se lançam sozinhas ao vencer, diferente de despesas, que exigem confirmação manual via "Pagar Conta"). Card de Hábitos removido do dashboard a pedido do usuário (retomada da funcionalidade fica pra depois); card de Variação removido do dashboard do Geburah pelo mesmo motivo — simplificação, não perda de dado (os valores continuam calculáveis, só saíram da tela).

## SWOT do produto

**Forças**
- Profundidade por módulo real (376 alimentos c/ kcal ao vivo, PR automático, motor de projeto com CRM, Meta de IF com projeção real+risco)
- Identidade visual única — árvore com "líquido" por score, forte nos dois temas, 10/10 sefirot acesas
- Zero erros de runtime em duas rodadas de teste seguidas
- Cross-módulo real nos dois sentidos — Kether/Malkuth sincronizam metas/hábitos/projetos com 8 módulos
- 3 dos 8 módulos originais já decompostos (Yesod, Geburah, Hod saíram de monolito de 2000+ linhas)

**Fraquezas**
- 7 de 10 módulos ainda monolíticos (Chesed, Tiphareth, Netzach, Chokmah, Binah + `App.jsx`)
- Sem autenticação de chamador de verdade no proxy do Coach (token/sessão)

**Oportunidades**
- Hub cross-módulo (Tiphareth/Kether/Malkuth) já maior que qualquer benchmark isolado — vale generalizar o padrão pros módulos que faltam
- Banco de alimentos curado (TACO) vendável como "mais confiável" vs. bases crowdsourced
- Custo zero/próprio vs. US$99–199/ano dos concorrentes financeiros
- Padrão "projeção real + baseline + risco" do Yesod é replicável em Geburah (peso) e Hod (receita de projeto) — generalizaria o diferencial mais forte do produto

**Ameaças**
- Rate-limit do proxy mitigou o "endpoint aberto" mas introduziu o teto de payload que quebrou o Yesod — segurança e funcionalidade colidiram sem ninguém perceber (corrigido, ver acima)
- Sem PWA/instalação Android — barreira de adoção fora do navegador
- Gamification fatigue se cada módulo empilhar sistema de recompensa próprio
- Zero testes automatizados — o bug de payload é exatamente o tipo de regressão que um teste de integração pegaria antes de virar produção

## Vira projeto real?

A pergunta certa não é "os módulos são bons o suficiente" — é "alguém trocaria YNAB, MyFitnessPal, Trello e Goodreads por isto". Resposta honesta: **não, não do jeito que está posicionado hoje**.

**Tensão dupla, real nos dois lados ao mesmo tempo:** a metáfora cabalística (10 sefirot, "Árvore da Vida") é forte o bastante pra ser a única razão de alguém escolher isto sobre um app neutro — mas é fricção fora do público de autoconhecimento/esoterismo. E 10 verticais competindo cada uma contra um líder de categoria dedicado é grande demais — nenhuma nota de módulo passou de 8/10 comparada ao especialista da categoria.

**Precedente de mercado:** identidade forte + escopo largo nunca sustentou como negócio sozinho (Gyroscope pivotou pra hardware e foi descontinuado; Habitica ficou nicho por 10+ anos). Identidade forte + escopo estreito, sim (Co-Star/Chani). O único caso de escopo largo que sobrevive (Exist.io) sobrevive pequeno, nunca tentando ser mainstream.

**Onde está o moat de verdade:** cruzar dado real de módulos diferentes do mesmo usuário sem auto-relato — isso deixou de ser só o hub do Tiphareth: Kether e Malkuth, que em 14/08 eram casca vazia, viraram peças reais dessa mesma tese. Isso, mais a identidade visual, é a única coisa que nenhum concorrente consegue copiar, porque exige possuir o conjunto inteiro.

**Veredito:** há mérito real, mas o produto vendável é mais estreito que o app inteiro. Quatro caminhos mapeados, sem decisão fechada (decisão estratégica do usuário, não técnica):
- **A — Continuar como ferramenta pessoal.** Mérito total, sem validar nada.
- **B — Produto de nicho, tema intacto** (recomendado *se* virar produto). Mantém a Cabala, mira o público que já paga por Co-Star/Chani. Preserva o que já foi construído.
- **C — Tirar a casca, vender o motor.** Reposicionar como "correlacionador de vida" neutro (estilo Exist.io) — perde o diferencial visual/emocional mais forte encontrado.
- **D — Separar um módulo, abandonar o "tudo".** Hod (motor de projeto+CRM) ou Chesed (CRM pessoal) já competem como ferramenta ponto-a-ponto por si só.

## Módulo a módulo

| Módulo | Nota | vs. benchmark | Maior gap hoje |
|---|---|---|---|
| **Yesod** — Finanças | 7.0 | YNAB, Monarch Money | Coach 100% fora do ar (achado #1, já corrigido — ver acima) |
| **Geburah** — Saúde | 8.2 | MyFitnessPal, Strong/Hevy | Meta de Peso usa taxa manual fixa, não a tendência real das pesagens |
| **Hod** — Profissional | 8.0 | Trello, Notion | Receita real do Yesod já integrada, mas é só snapshot — sem tendência nem alerta |
| **Kether** — Desejos | 7.0 | Milanote, vision boards | UI ainda se rotula "protótipo" — defasada em relação ao que já entrega |
| **Malkuth** — Controle | 6.0 | Todoist, Habitica | Só a 1ª peça existe (aba Atividades) — resto do módulo ainda não construído |
| **Tiphareth** — Autocuidado | 7.0 | Daylio, Bearable, Finch | Correlação cross-módulo é opt-in, desligada por padrão (6 de 11 widgets) |
| **Chesed** — Relacionamentos | 7.5 | Dex, Clay, Cozi | Cadastro 100% manual, sem sync |
| **Netzach** — Qualidade de Vida | 6.5 | Buckist | Módulo mais raso em densidade de conteúdo |
| **Chokmah** — Espiritualidade | 6.5 | Headspace, Insight Timer | Zero conteúdo guiado — só registra, não conduz |
| **Binah** — Conhecimento | 6.5 | Goodreads, StoryGraph | Sem metadado automático de livro nem estatística agregada |

### Yesod — destaques da 2ª rodada
Meta de IF agora projeta pela capacidade real (débito de cartão/dívida já descontado), com baseline e alerta de risco atribuído à causa (testei simulando uma base antiga: apontou a dívida certa, o atraso certo, "Recalcular base" funcionou). 50+ ações de Coach — quando o Coach funciona (ver achado #1, corrigido).

### Hod — destaques da 2ª rodada
Card do projeto "Professor Particular" mostrando **"REAL (YESOD) R$500 · +R$260 vs. projetada"** — cruzamento com receita real do Yesod funcionando ao vivo. Motor de projeto com fase/canvas por tipo e critérios explícitos pra avançar de fase.

### Kether — era placeholder com 50% fixo em 14/08
Metas agregadas de Yesod/Hod/Tiphareth (8 itens reais, toggle bidirecional), Projetos do Hod espelhados read-only (fase/tipo corretos), alerta "Fora da rota" da Meta de IF espelhado sem recalcular nada. Sincronização bidirecional real com 3+ módulos — nenhum benchmark de "vision board" faz isso.

### Malkuth — era placeholder com 50% fixo em 14/08
Uma aba só, "Atividades": checklist único agregando tarefas dos 8 módulos, cada item navegável até a origem. Mesmo padrão de sincronização do Kether, provado 2x agora — mas é só a 1ª peça do módulo completo proposto (score, reflexão, Config ainda faltam).

## Casos de uso reais testados ao vivo

| Cenário | O que testei | Resultado |
|---|---|---|
| Registrar compra (R$245,90, Pix) | Yesod, 29/08 | 🟢 Salvou certinho — decimal corrigido |
| Perguntar "oi" ao Coach no Yesod | 29/08 | 🟢 Antes: `413`. Corrigido, agora chega até a Anthropic |
| Perguntar "oi" ao Coach no Geburah | 29/08 | 🟡 Erro de billing (crédito da conta esgotado — condição externa), mas agora com mensagem amigável |
| Simular Meta de IF saindo da rota | 29/08 | 🟢 Alerta apontou a dívida certa; "Recalcular base" resetou |
| Ver receita real de projeto do Hod | 29/08 | 🟢 "REAL (YESOD)" batendo com o Yesod |
| Abrir Kether/Malkuth | 29/08 | 🟢 Reais agora, sincronização de verdade |
| Logar refeição (Geburah) | 14/08 | 🟢 kcal recalculada ao vivo |
| Registrar contato (Chesed) | 14/08 | 🟢 Fluxo completo, sem atrito |
| Trocar tema no meio da sessão | 29/08, re-confirmado | 🟢 Consistente, sem flash |

## Performance & arquitetura

**Resolvido ou mudou desde as auditorias anteriores:**
- 🟢 Proxy do Coach ganhou rate-limit + guard de payload (15/08) — mitigou o "endpoint aberto", mas o guard de payload foi a causa raiz do achado #1 (corrigido 29/08, ver [[10 Segurança, Mobile e Performance]])
- 🟢 Yesod, Geburah e Hod decompostos em subarquivos (item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]]) — só `App.jsx` e 5 dos 8 módulos originais seguem monolíticos
- 🟢 Versionamento real existe — repo GitHub (`lucapalermo910-afk/life-tree`) + Vercel auto-deploy, um Root Directory dessincronizado corrigido em 29/08
- 🟡 Sem criptografia local, sem PIN/biometria, zero testes automatizados, sem PWA, sem code splitting — inalterado

**Confirmado nesta rodada (29/08, só via uso ao vivo):**
- Zero erros de runtime — segunda rodada seguida sem nenhum
- Bug de decimal corrigido, retestado com sucesso
- Coach 413 no Yesod (corrigido no mesmo dia)
- Erro de API cru + toast sem auto-dismiss (os dois corrigidos no mesmo dia)

## Nota histórica — a proposta de 14/08 pros módulos pendentes

Em 14/08 este relatório propunha, sem fechar decisão: Kether ligado a ações reais (não um mural estático, lição do Milanote) e Malkuth com rotina dupla manhã/noite (referência Stoic). O caminho realizado foi diferente do proposto — e melhor do que qualquer benchmark isolado sugeria: em vez de conteúdo próprio, os dois módulos viraram **espelhos bidirecionais** dos 8 módulos já existentes. Kether cumpriu a lição do Milanote por um caminho mais forte — cada item já é literalmente a meta real de outro módulo. Malkuth ainda está no primeiro passo — o resto do escopo proposto (reflexão dupla, tira de humor) segue em aberto.

## Valor × gap, por módulo

| Módulo | Valor percebido | Maior gap |
|---|---|---|
| Yesod | Meta de IF com projeção real, split, cenário real-vs-esperado | Coach fora do ar (corrigido 29/08) |
| Geburah | Treino+dieta+peso cruzados, PR automático | Meta de Peso usa taxa manual, não tendência real |
| Hod | Fase certa + receita real do Yesod + CRM embutido | Comparação real-vs-meta é só snapshot |
| Kether | Metas/projetos sincronizados de verdade | UI rotulada "protótipo", defasada |
| Malkuth | Checklist cruzando os 8 módulos | Só a 1ª peça existe |
| Tiphareth | Único módulo com hub cross-módulo configurável | Correlação invisível por padrão (opt-in) |
| Chesed | CRM pessoal com nota de qualidade de contato | Cadastro 100% manual |
| Netzach | Sinaliza hobby esquecido ativamente | Módulo mais raso em conteúdo |
| Chokmah | Tradição+prática+diário integrados | Zero conteúdo guiado |
| Binah | Liga leitura a trilha de competência | Sem metadado/estatística de livro |

## Recomendações priorizadas

**Agora**
- ~~Recalibrar o teto de payload do proxy do Coach pro Yesod~~ — **feito 29/08/2026**
- ~~Capturar o erro do Coach antes de mostrar~~ — **feito 29/08/2026**

**Em seguida**
- ~~Auto-dismiss no toast/bolha de erro~~ — **feito 29/08/2026**
- Atualizar o rótulo "PROTÓTIPO — TESTE DE INTEGRAÇÃO" em Kether e Malkuth — os dois já entregam sincronização real, o texto na tela ainda soa provisório

**Depois**
- Levar o padrão da Meta de IF (projeção real + baseline + risco) pra Geburah e Hod — os dois já têm o dado necessário parado (pesagens, `revenueHistory`)
- Tornar o widget de correlação cross-módulo do Tiphareth visível por padrão (hoje opt-in)
- Piso seguro da taxa semanal do Geburah (`0.5`) ainda produz "Meta do Dia" cosmeticamente negativa antes do 1º cadastro de peso — trocar por estado "não configurado" explícito em vez de calcular com placeholder

**Decisão estratégica**
- Antes de "terminar" os 10 módulos pensando em produto pra outras pessoas, decidir entre os 4 caminhos de "Vira projeto real?" acima — inalterado desde 14/08

## O caminho até 10

**Bloqueadores de confiança — sem isso, não passa de ~8**
- ~~Bug de decimal~~ — ✓ 15/08/2026
- ~~"50% fixo" sem dado real~~ — ✓ 15/08/2026 (Kether/Malkuth confirmam isso hoje)
- **Coach respondendo de ponta a ponta** — o proxy está corrigido (29/08), mas ainda depende de crédito de API disponível na conta — condição externa, não mais bug de código

**Completude estrutural**
- ~~Kether e Malkuth virarem módulos de verdade~~ — ✓ 19-20/08/2026
- Integrações cross-módulo além do Tiphareth — parcialmente feito (Kether/Malkuth, Hod↔Yesod), ainda como espelho de leitura
- Malkuth ainda é só a 1ª peça — falta o resto do módulo
- ~~Onboarding~~ — ✓ 31/08/2026 (app zerado testado ao vivo nos 10 módulos, zero crash/`NaN`; falta só o fluxo guiado de 1º uso — hoje é "chegar em branco e usar", não um wizard)

**Base "nível profissional"**
- Testes automatizados — zero, e o bug de payload é exatamente o tipo de regressão que um teste pegaria
- Segurança — rate-limit melhorou parcialmente, segue sem criptografia/PIN
- Arquivos monolíticos — 3 de 8 módulos decompostos, `App.jsx` e 5 módulos seguem
- Acessibilidade — não testada em nenhuma das duas rodadas

**Se fosse escolher só 1 pra fechar primeiro:** fazer o Coach funcionar de ponta a ponta, inclusive e principalmente no Yesod. Dos 3 bloqueadores de confiança de 14/08, 2 caíram — o terceiro nunca foi resolvido, só trocou de forma (era erro de billing cru, virou também um `413` sistêmico no módulo mais desenvolvido, agora os dois corrigidos no código — falta só crédito na conta pra fechar de vez).

## Ver também
- [[04 Bugs Conhecidos]]
- [[09 Yesod]]
- [[01 Kether]]
- [[10 Malkuth]]
- [[10 Segurança, Mobile e Performance]]
- [[01 Estado Atual]]
