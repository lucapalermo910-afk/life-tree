---
tags: [lifetree, roadmap]
aliases: [Roadmap]
---

# 🗺️ Roadmap — Life Tree

> Consolida em um único documento os 3 roadmaps que existiam separados em `Avaliação/` (Roadmap 10-10, Roadmap Atual, Roadmap Completo). Os originais foram arquivados temporariamente e depois removidos (28/07/2026) por já estarem 100% consolidados aqui — este é o documento vivo daqui pra frente.
>
> Base: [[Avaliação PO + Designer]] (nota 7.2/10) + achados de código em [[09 Auditoria de Código vs Documentação]].

## Princípios estratégicos

1. **Fricção zero no input diário** — se demora mais que 5 segundos, perde o usuário
2. **Valor visível em segundos** — feedback imediato a cada ação
3. **Diferencial competitivo defendido** — explorar gaps que nenhum concorrente cobre

## Scorecard de referência

Nota média atual: **7.2/10** → Meta: **10/10**, em 6 dimensões.

| Dimensão | Atual | Meta | Gap |
|---|---|---|---|
| Proposta de valor | 8.0 | 10 | -2.0 |
| Funcionalidade | 8.5 | 10 | -1.5 |
| Visual / Estética | 7.5 | 10 | -2.5 |
| UI (interface) | 6.0 | 10 | -4.0 |
| UX (experiência) | 6.0 | 10 | -4.0 |
| Potencial de mercado | 7.5 | 10 | -2.5 |

Detalhamento da avaliação em [[Avaliação PO + Designer]].

> ⚠️ **Gap do próprio scorecard, achado em 10/08/2026:** nenhuma das 6 dimensões acima cobre segurança de dados, capacidade de instalar no Android, ou performance/qualidade de código — a auditoria dedicada a essas 3 frentes (ver seção logo abaixo) não tem onde "pontuar" nesse scorecard do jeito que ele existe hoje. Não foram inventadas notas novas pra não forçar um número sem critério — os achados entraram como itens de backlog priorizados, não como nota.

> ⚠️ **Segundo gap do scorecard, achado em 14/08/2026:** o mesmo problema se repete pro parecer de usabilidade testado ao vivo (ver [[04 Bugs Conhecidos]] → "Usabilidade — teste ao vivo") — não é a mesma escala do 7.2/10 acima (esse vem de [[Avaliação PO + Designer]], por leitura/heurística; o parecer de 14/08 testou interação real no navegador e chegou a 7.3/10 numa escala própria, com nota por módulo e comparação com benchmark de mercado). Os dois números não devem ser somados nem comparados diretamente. Achados também entraram como backlog priorizado (ver Fase 0 abaixo), não como ajuste do scorecard. Artefato completo: [artefato web](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a).

---

## 🎯 Plano de Evolução — sequenciamento recomendado (12/08/2026)

> Pedido do usuário: cruzar este Roadmap com [[04 Bugs Conhecidos]] e as auditorias por módulo (seções abaixo) num plano de ataque único, com a lente de um PO sênior — decidindo a tensão entre "terminar módulos primeiro" vs. "resolver segurança/performance/arquitetura primeiro". Também publicado como [artefato web](https://claude.ai/code/artifact/6f06ef78-00c6-4da5-9e85-cae9840929f6) (visual, com todos os itens por fase). **Este é o sequenciamento vigente** — supera a ordem informal que existia antes nas seções "Prioridade imediata"/"Próximo mês" abaixo (mantidas como detalhe de execução de cada item, não como ordem).

**Veredito:** a leitura do usuário estava certa pra quase tudo — terminar a evolução dos módulos antes da fundação técnica pesada é a ordem certa, porque a superfície do produto ainda muda rápido (4 módulos nem existem ainda) e refatorar `App.jsx`/`GeburahModule.jsx` agora significaria refatorar de novo depois. A única exceção: um punhado de itens baratos (~1 dia no total) cuja severidade só piora com o tempo — não competem em atenção com o trabalho de módulo, por isso viram uma Fase 0 separada em vez de esperar a fundação técnica.

| Fase | O quê | Quando |
|---|---|---|
| **0 — Higiene imediata** | ~~Bug de input decimal nos 9 arquivos~~ ✅ ~~Rate limit no proxy do Coach (S1)~~ ✅ ~~3 bugs triviais (`window.storage` no hub, timer Geburah, tema `let C` mutável)~~ ✅ ~~Renomear sefirot~~ ✅ — todos feitos em 15/08/2026, ver [[01 Estado Atual]]. Das 3 decisões de arquitetura sem código, restam 2 (tarefas/calendário já decidido — ver "Tarefas & calendário" abaixo; mecânica de recompensas do Kether ficou **moot** em 19/08/2026, ver item 3 abaixo) | ~1 dia, antes de tudo — **fase concluída** |
| **1 — Fechar o que já está maduro** | Onboarding de 3 telas · ~~ações do Coach no Hod~~ ✅ feito 13/08/2026 · ~~duração de treino no Geburah~~ ✅ feito 12/08/2026 · ~~split de despesas + cenário esperado-vs-real no Yesod~~ ✅ feito 12/08/2026, junto com projeção parcela-a-parcela/múltiplos eventos, mover lançamento Carteira↔conta e histórico real de patrimônio — ver [[09 Yesod]] · ~~diário de humor + remédios no Tiphareth~~ ✅ feito 13/08/2026, ver [[06 Tiphareth]] · ~~sinalizar cliente sem sessão no Hod~~ ✅ feito 13/08/2026 | maior ROI imediato |
| **2 — Completar a árvore** | ~~Chokmah + Binah~~ ✅ feito 13/08/2026, ver [[02 Chokmah]]/[[03 Binah]] · **Malkuth em andamento** (direção fechada 18/08, protótipo da aba Atividades cobrindo os 8 módulos 19/08 — faltam as outras 5 abas, ver [[10 Malkuth]]) · **Kether em andamento** (direção fechada 19/08 — vira "Desejo", agrega metas + deriva metas em outros módulos a partir de um desejo — protótipo funcional testado 19–20/08, ver [[01 Kether]]) | após Fase 1 — **Malkuth e Kether começaram antes do previsto**, por decisão do usuário |

> ⚠️ **Nota (22/08/2026):** a proposta de MVP do Raio-X (14/08/2026, [artefato](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a)) pra Kether/Malkuth — benchmarks Milanote/Storyflow (Kether) e Stoic/Reflectly (Malkuth), sugestões concretas de UI — ficou parcialmente superada pelos protótipos reais construídos depois (18–20/08/2026, direção fechada pelo usuário sem consultar essa proposta específica). Não foi formalmente descartada nem reconciliada com o que já existe — quem for continuar Malkuth/Kether deveria checar se algo daquela proposta ainda vale a pena antes de assumir que o caminho atual é o definitivo.
| **3 — Conectar os módulos** | Implementar a decisão de tarefas/calendário da Fase 0 · integrações mapeadas (Hod↔Yesod, Yesod↔Geburah, Geburah↔Tiphareth, Binah↔Hod, Kether↔todos) | após Fase 2 |
| **4 — Fundação técnica** | PWA completo (A1) · quebrar `App.jsx`/demais módulos em subcomponentes (P2 — ~~Geburah~~ ✅ ~~Hod~~ ✅ fatiados em 22/08/2026, plano de execução completo em [[11 Plano de Decomposição — Arquivos Monolíticos]], 12/08/2026; `App.jsx` e os outros 6 módulos seguem inteiros) · code splitting (P1, só compensa depois de fatiar mais módulos) · criptografia local + trava de acesso (S2) · testes automatizados (P3) · backup seguro (S3) · utilitário compartilhado de `localStorage` (P4) | antes de abrir pra fora — **P2 começou fora de ordem** (usuário decidiu fatiar Geburah/Hod em 22/08/2026 antes de completar a Fase 2/3, ver [[01 Estado Atual]]), demais itens da fase seguem sem data |
| **5 — Beta / validação** | Retoma o plano original desta seção (20 beta users, métricas D1/D7, monetização) | produto pronto |

**Fica pra depois, de propósito, com motivo específico (não é só "baixa prioridade"):** wearables/reconhecimento de foto (Geburah) — depende de infra externa ainda não resolvida; Capacitor/React Native nativo — PWA já resolve Android pelo menor custo, só reconsiderar se push/biometria virarem bloqueador real; Supabase/sync em nuvem — só importa com usuários reais além de você; Monetização — sem beta rodando não há o que precificar.

**3 decisões que destravam a Fase 0** (nenhuma exige código, só uma escolha sua):
1. ~~Tarefas & calendário~~ — **decidido em 15/08/2026: Opção A, camada central.** O usuário rejeitou explicitamente a Opção B recomendada (view agregada read-only) — quer um dado de verdade compartilhado entre todos os módulos, não um espelho visual, "seguindo a lógica do módulo Qualidade de Vida" (Netzach), porque o valor de um ecossistema único está em ver o impacto cruzado de cada tarefa em diferentes áreas da vida, não só listar tudo junto. Implementação **fica pra depois** (é maior que Fase 0 — novo modelo `tarefa` com `origemModulo`/`prazo`/`urgente`, criável a partir de qualquer módulo, migrando os 3 sistemas hoje isolados e depois estendendo pros módulos que não têm nenhum conceito de prazo ainda; é trabalho de Fase 3, não de Fase 0). Ver seção "Tarefas & calendário" acima — a Opção B ali descrita não é mais a recomendação vigente pra esse projeto.
2. Cadastro de pessoa/família — vive no Config geral, ou dentro do Chesed (já é o módulo de relacionamentos)? Ainda em aberto.
3. ~~Mecânica de recompensas do Kether~~ — **ficou moot em 19/08/2026.** A pergunta pressupunha que XP/moedas globais continuariam existindo; nessa mesma sessão o usuário pediu a remoção de toda a camada de RPG do hub (moedas, nível/XP global, lista de desejos genérica — ver [[01 Kether]] → "Camada de RPG removida"), e decidiu uma direção diferente pro próprio Kether: não é mais hub de recompensas, é "Desejo" — agrega metas dos módulos reais e deriva metas novas a partir de um desejo. Protótipo construído e testado no mesmo dia, ver [[01 Kether]].

---

## 🧭 Product-market fit (14/08/2026) — decisão em aberto, não é sobre módulo nenhum

> Pedido do usuário depois do parecer de usabilidade: análise crítica de se há mérito em virar produto pra outras pessoas (não só ferramenta pessoal), comparando com precedente real de mercado (Habitica, Exist.io, Gyroscope, Fabulous, templates "Life OS" do Notion, Co-Star/Chani). Detalhe completo, com a tabela de precedentes, na seção "Vira projeto real?" do [artefato web](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a).

**Veredito:** há mérito, mas não no formato "substituir 8 apps de categoria" — nenhuma nota de módulo do parecer de usabilidade passou de 8/10 comparada ao especialista da categoria (YNAB, MyFitnessPal, Trello...), bom o bastante pra uso pessoal, não decisivo o bastante pra alguém migrar de app já instalado. O único ativo genuinamente defensável (que nenhum concorrente isolado consegue copiar, por natureza) é o hub cross-módulo do Tiphareth + a identidade visual da árvore. Precedente de mercado reforça: identidade forte + escopo largo nunca sustentou como negócio sozinho (Gyroscope pivotou pra hardware e foi descontinuado); identidade forte + escopo estreito, sim (Co-Star, Chani).

**4 caminhos mapeados, sem decisão fechada** (é escolha estratégica do usuário, não técnica):
1. Continuar como ferramenta pessoal — mérito total, não exige nenhuma mudança de rumo.
2. Produto de nicho mantendo o tema Cabala intacto, mirando o público de autoconhecimento/esoterismo (mesmo público que já paga Co-Star/Chani) — aproveita 100% do que já foi construído, só exige foco de mensagem.
3. Tirar a Cabala, vender só o motor de correlação cross-módulo (estilo Exist.io) — mercado potencialmente maior, mas perde o diferencial visual/emocional mais forte encontrado no parecer.
4. Separar um módulo (Hod ou Chesed já competem como ferramenta ponto-a-ponto) e abandonar a promessa "tudo em um".

Se a decisão for **2**, o roadmap muda de "terminar os 10 módulos" pra "decidir o que cortar" — não é o mesmo trabalho que completar Kether/Malkuth da Fase 2 acima.

> ⚠️ **Atualização (18/08/2026):** o usuário fechou a direção — Malkuth vira "módulo integrador geral", registrando atividades/hábitos de todas as frentes e servindo de painel de controle. Proposta completa de UI/UX (estrutura de abas, o que migra do extinto slide "Dash" do carrossel, decisões de design em aberto) em [[10 Malkuth]] → "Proposta de UI/UX (18/08/2026)". O 3º slide do carrossel ("Dash") já foi **removido** do hub nesta mesma sessão — o conteúdo dele é exatamente o que migra pro Reino quando o módulo for construído, não foi descartado.

---

## 🧭 Auditoria de módulos (09/08/2026) — decisões em aberto

Levantamento cruzado dos 10 módulos (visão do usuário vs. estado real do código), feito antes de decidir a próxima leva de evolução. Achados de cada módulo estão na própria nota (seção "Auditoria funcional" ou "Visão do usuário" em cada uma, ver [[03 Módulos (Sefirot)]]); aqui ficam as decisões que **destravam** o resto do trabalho.

### Renomear sefirot pro tema (proposta, baixo risco)
Trocar o rótulo em destaque da Árvore/Config de `ptName` (nome cabalístico) pra `meaning` (o tema real) — ver [[02 Arquitetura]] → "Nomenclatura das sefirot". `meaning` já existe no dado, é mudança de exibição:

| Sefirá | Hoje (destaque) | Proposto (destaque) |
|---|---|---|
| Kether | Coroa | Desejos & Planos |
| Chokmah | Sabedoria | Espiritualidade |
| Binah | Entendimento | Aprendizado |
| Chesed | Misericórdia | Relacionamentos |
| Geburah | Força | Corpo & Treino |
| Tiphareth | Beleza | Autocuidado |
| Netzach | Vitória | Qualidade de Vida |
| Hod | Esplendor | Profissional |
| Yesod | Fundação | Finanças |
| Malkuth | Reino | ~~a definir~~ **Controle** — decidido em 19/08/2026, ver [[10 Malkuth]] |

### Tarefas & calendário — decisão de arquitetura em aberto (opções levantadas em 13/08/2026)
Hoje existem **três sistemas de "coisa com prazo" isolados** que não se falam: `tarefas` no Netzach (local, flag `urgente`), `alertas_vencimento_7dias` no Yesod (faturas/dívidas), `datas_proximas`/`pessoas_atrasadas` no Chesed. A visão do usuário de "Netzach tem ligação com o dia a dia — tarefas que impactam em diversos módulos" (ver [[07 Netzach]]) e o pedido de uma lista de tarefas + calendário centralizados batem de frente com esse estado fragmentado. **Decisão a tomar antes de desenhar qualquer tela** — muda a arquitetura de tudo que vier depois, inclusive o onboarding (item abaixo). Retomado na auditoria do Netzach (13/08/2026): em vez de implementar de qualquer jeito, três opções concretas com trade-off, pra decidir quando fizer sentido:

- **Opção A — camada central de tarefas/calendário.** Novo conceito `tarefa` reusável (`origemModulo`, `prazo`, `urgente`), criável a partir de qualquer módulo, com lista/calendário agregado no hub. **Prós:** visão unificada de "o que precisa da minha atenção hoje", um só lugar pra notificação futura. **Contras:** maior esforço — novo modelo de dado, migração dos 3 sistemas existentes, risco de duplicar responsabilidade (editar em dois lugares: módulo de origem e a camada central).
- **Opção B — view agregada read-only (recomendada).** Cada módulo mantém sua própria lista de "coisa com prazo" como já é hoje; um widget/tela no hub só **lê e apresenta junto** os 3 sistemas, sem duplicar dado nem criar um novo modelo — mesmo padrão do hub de hábitos cross-módulo que o Tiphareth ganhou em 13/08/2026 (`HUB_ADAPTERS`, ver [[06 Tiphareth]]), que já foi validado pelo usuário como a abordagem certa pra esse tipo de integração (read-only, menor risco, reusa infraestrutura). **Prós:** menor esforço, menor risco, não duplica edição. **Contras:** os 3 formatos de "prazo" continuam distintos por baixo (urgente vs. vencimento vs. atrasado) — a visão agregada precisa normalizar isso só visualmente; criar uma tarefa nova ainda exige ir ao módulo de origem.
- **Opção C — não mexer agora.** Aceitar a fragmentação como está e resolver só quando (se) o Kether virar o "hub de recompensas" ouvindo eventos de todos os módulos — a mesma infraestrutura de evento poderia alimentar tarefas nesse momento, sem esforço extra dedicado agora.

**Recomendação (histórica, 13/08/2026):** Opção B — mesmo racional que já convenceu o usuário no hub do Tiphareth (espelhar em vez de centralizar), com o padrão de código já pronto e aprovado. Dá pra evoluir pra Opção A depois se a visão agregada mostrar que vale a pena centralizar de verdade.

**Decisão real do usuário (15/08/2026): Opção A**, não a B recomendada. Pedido explícito: calendário e lista de atividades compartilhados entre todos os módulos, "seguindo a lógica do módulo Qualidade de Vida" — o valor de um ecossistema único está em ver o impacto cruzado de cada tarefa em diferentes áreas da vida, o que um espelho read-only não entrega de verdade. Sequenciamento: correções da Fase 0 primeiro, camada central de tarefas fica pra depois (Fase 3, não é implementação trivial). Nenhum código escrito ainda — só a decisão de arquitetura está fechada.

### Onboarding guiado — ainda não existe
Nenhum código de onboarding/tutorial encontrado (grep vazio em `preview/src`). A ideia do usuário: uma "máscara" que apresenta cada sefirá e conduz uma jornada de primeiro registro que já vira hábito/hábito em algum módulo. Depende, em parte, da decisão de tarefas/calendário acima (se o primeiro registro guiado já nasce como uma tarefa central ou como um hábito local do módulo).

### Split de despesas do Yesod — pré-requisito de cadastro
Despesa recorrente dividida por percentual fixo com a esposa (ex: luz, 50/50, com controle de quem já pagou) precisa de um conceito de "pessoa/membro da família" que não existe em lugar nenhum do app hoje (nem em Config). Decidir de onde vem esse cadastro antes de desenhar o campo `split` na transação — ver [[09 Yesod]].

### Ordem de ataque dos 4 módulos ausentes (Kether, Chokmah, Binah, Malkuth)
~~Nenhum dos quatro tem módulo~~ — **Chokmah e Binah construídos em 13/08/2026** (ver [[02 Chokmah]], [[03 Binah]]), usuário pediu os dois de uma vez em vez de escolher a ordem entre eles. **Malkuth** deixou de ser "conversa em aberto" em 18/08/2026 — direção fechada (módulo integrador geral/hub de controle) e protótipo real construído e estendido pros 8 módulos em 18–19/08 (ver [[10 Malkuth]]); ainda não é um módulo "completo" — só 1 das 6 abas propostas existe. **Kether** seguiu o mesmo caminho um dia depois (19–20/08/2026) — vira "Desejo", protótipo funcional testado cobrindo 6 módulos-alvo pra derivação de metas (ver [[01 Kether]]). **Todos os 10 nós da árvore têm algum código real agora** — nenhum mais genuinamente vazio; o que resta é completar as abas restantes de Malkuth/Kether pra ficarem no mesmo nível dos outros 8.

### Integrações entre módulos — mapa inicial pra debate (13/08/2026, histórico)
**Primeiro passo implementado em 13/08/2026** — ver [[06 Tiphareth]] "Hub de hábitos cross-módulo". O Tiphareth passou a espelhar (read-only, por módulo ligável, todos desligados por padrão) os hábitos de Yesod, Hod, Chesed, Netzach e Geburah, começando a validar a integração cross-módulo na prática antes de decidir os próximos candidatos abaixo — ainda pendente decidir se algum desses vira leitura-e-escrita de verdade. Candidatos levantados na auditoria, ainda não implementados: receita de projetos/clientes (Hod) alimentando o fluxo de caixa (Yesod); orçamento de categorias tipo "alimentação"/"academia" (Yesod) refletindo o gasto real de dieta/treino (Geburah); peso/medidas (Geburah) e humor/saúde mental (Tiphareth) como duas metades da mesma história de bem-estar (parcialmente coberto pelo hub acima, mas sem correlação peso×humor ainda); "ligar pra fulano" (Chesed) e experiência/lazer planejado (Netzach) como a mesma tarefa vista de dois módulos; aprendizado (Binah) contando pro score de uma trilha de competência (Hod) — Binah já existe desde 13/08/2026 e reaproveita o próprio modelo de trilhas do Hod, mas a integração entre os dois não foi implementada; Kether "ouvindo" evento de progresso de qualquer módulo, se virar o hub de recompensas.

> ⚠️ **Superseded pelo estudo completo abaixo (15/08/2026)** — mantido só como registro histórico do primeiro levantamento. O estudo novo verificou cada candidato direto no código (não achado nenhum implementado desde 13/08) e achou gaps que este mapa inicial não cobria.

## 🔗 Integrações entre módulos — estudo completo (15/08/2026)

> Pedido do usuário: varredura completa do app sobre integrações existentes e as que seriam importantes no futuro, com a lente da "ideia central de controle" — e uma proposta pra revisitar o Malkuth (hoje "Reino", vago) como hub central de controle, no lugar (ou complementando) o papel que o Netzach carrega hoje informalmente. Levantamento verificado direto no código (`preview/src/`), não por leitura de documentação anterior.

### O que já existe de verdade (verificado no código)

**1. Score bridge — todos os 8 módulos publicam, mas só 6 chegam na árvore.** Cada módulo escreve o próprio score em `localStorage.lifetree_scores` a cada mudança (write confirmado nos 8: `YesodModule.jsx`, `GeburahModule.jsx`, `HodModule.jsx`, `TipharethModule.jsx`, `ChesedModule.jsx`, `NetzachModule.jsx`, `ChokmahModule.jsx`, `BinahModule.jsx`), e `App.jsx` lê isso pra preencher o líquido da árvore. **Gap achado nesta varredura:** o `aScores` de `App.jsx` (linhas ~1022-1030) só promove pra árvore o score real de **6** módulos (Yesod, Hod, Tiphareth, Geburah, Chesed, Netzach) — **Chokmah e Binah publicam certinho, mas a árvore ignora e usa o cálculo genérico do hub (quase sempre vazio) no lugar.** Score bridge "meio implementado" desde que os dois nasceram, nunca fechado.

**2. Hub de hábitos cross-módulo do Tiphareth — read-only, desligado por padrão.** `HUB_ADAPTERS` lê direto do `localStorage` de 5 módulos (Yesod, Hod, Chesed, Netzach, Geburah — ver [[06 Tiphareth]]). **Chokmah e Binah não têm adapter** — o hub foi construído em 13/08, antes dos dois existirem, e ninguém voltou pra adicionar. Em cima disso, o Tiphareth já calcula uma **correlação Humor × Hábitos** (grava `habitsPct` a cada entrada de humor) — uma integração de segunda ordem que só existe de verdade se o usuário ligar pelo menos 1 módulo no toggle, e que nenhum documento anterior descrevia como integração própria.

**3. Hod → Yesod já existe — mas ao contrário do que o mapa de 13/08 dizia.** `HodModule.jsx` lê `lifetree_fin_accs`/`lifetree_fin_cards` do Yesod direto (read-only) pra mostrar "REAL (YESOD)" ao lado da receita projetada de um projeto. Não é "Hod alimenta o Yesod" (como o candidato antigo descrevia) — é o inverso: Hod **puxa** do Yesod pra comparar projeção com real. Funciona só se o projeto tiver a categoria do Yesod preenchida num campo de **texto livre**, sem validação contra as categorias reais — acoplamento frágil, para de funcionar silenciosamente se o nome mudar de um lado.

**4. O "YESOD bridge" no hub é manual — nome engana.** `App.jsx` tem um card chamado no comentário de "YESOD bridge" (`finScore`), mas ele **não lê nada do Yesod** — é um número que só muda quando o usuário clica "Atualizar" e digita à mão, com default `50`. Parece automático, não é.

**5. Coach: cada skill é uma ilha — a skill "hub" não vê os módulos reais.** Confirmado lendo as 8 funções `buildXContext()` inteiras: nenhuma cruza dado de outro módulo, cada uma lê só as próprias chaves. A skill `hub` (usada quando nenhum módulo está ativo) recebe um contexto "universal", mas ele é montado só a partir do sistema genérico de hábitos/metas do próprio hub — o mesmo sistema que hoje só tem uso real em Kether/Malkuth — **não dos 8 módulos de verdade**. Perguntar pro Coach "como está minha vida" hoje não dá a ele visão de Yesod, Geburah, Hod etc — só do que foi cadastrado à parte no sistema genérico.

### Candidatos do mapa de 13/08 — status real, confirmado no código

| Candidato | Status real (15/08/2026) |
|---|---|
| Receita do Hod alimentando o fluxo de caixa do Yesod | 🟡 Existe parcialmente, mas **invertido** — é leitura do Hod sobre o Yesod (item 3 acima), não o Yesod recebendo dado do Hod |
| Orçamento do Yesod refletindo gasto real de dieta/treino do Geburah | 🔴 Não implementado — zero referência cruzada nos dois arquivos |
| Peso/medidas (Geburah) × humor (Tiphareth) | 🔴 Não implementado — a única ponte Geburah→Tiphareth é o hábito sintético "Treino de hoje" do hub (item 2), não peso nem humor |
| Chesed × Netzach como a mesma tarefa | 🔴 Não implementado — zero referência cruzada nos dois arquivos |
| Binah alimentando trilha de competência do Hod | 🔴 Não implementado — Binah só reaproveitou o *modelo de dado* do Hod como inspiração, não existe integração de dado real entre os dois |
| Kether ouvindo evento de progresso de qualquer módulo | 🔴 Não implementado — Kether não tem módulo próprio ainda |

Nenhum dos 6 candidatos levantados em 13/08 foi implementado desde então.

### Gaps novos, achados só nesta varredura (não estavam em nenhum documento)
- 🟡 Chokmah e Binah publicam score real mas a árvore não usa — mostra o cálculo genérico (quase sempre errado pra baixo) no lugar.
- 🟡 Chokmah e Binah de fora do hub de hábitos do Tiphareth — simples de fechar (mesmo padrão dos outros 5 adapters), só não foi feito por ordem cronológica de construção.
- 🟡 `finScore`/"YESOD bridge" no hub é manual, nome sugere automação que não existe.
- 🔵 `yesodCategoria` (ponte Hod→Yesod) é string livre sem validação — acoplamento frágil.
- 🔵 Skill "hub" do Coach desconectada da riqueza real dos 8 módulos — só enxerga o sistema genérico de hábitos que quase ninguém usa fora de Kether/Malkuth.

Nenhum desses é implementado agora — ficam registrados como candidatos de baixo esforço/alto valor pra próxima leva de integração (os 2 primeiros em especial: são o mesmo tipo de fix, pequenos, e destravam a árvore/hub mostrando dado real dos 2 módulos mais novos).

### A ideia central de controle — Netzach hoje, Malkuth como proposta

Hoje, "controle" no sentido de gerenciar a vida dia a dia — tarefas, prazos, o que precisa de atenção agora — não tem um dono claro. O que existe mais perto disso é o **Netzach** (Qualidade de Vida): a aba "Lar" tem tarefas domésticas com frequência e badge de atraso ("em dia"/"atenção"/"atrasada"), e o módulo nasceu com a visão de usuário de "ligação com o dia a dia — tarefas que impactam em diversos módulos" (ver [[07 Netzach]]). Mas isso é **local e parcial**: o Netzach só controla as próprias tarefas domésticas — os outros dois sistemas de "coisa com prazo" (`alertas_vencimento_7dias` do Yesod, `datas_proximas`/`pessoas_atrasadas` do Chesed) continuam isolados, e nada do que acontece em Geburah, Hod, Tiphareth, Chokmah ou Binah passa por ali. Netzach carrega a *ideia* de controle sem ter a *abrangência* de controle.

**Proposta do usuário: revisitar o Malkuth (hoje "Reino", o módulo mais indefinido dos 10 — ver [[10 Malkuth]]) como hub central de controle de verdade**, agregando sinais de todos os outros 9 módulos num só lugar, em vez de cada um ficar isolado.

**Por que isso faz sentido além de "resolver um problema técnico":** na própria estrutura da Árvore da Vida, Kether (topo, Coroa) e Malkuth (base, Reino) são os dois pontos onde a árvore "fecha o circuito" — Kether é a fonte/potencial (de onde tudo vem, os desejos, o "porquê"), Malkuth é a manifestação física (onde tudo converge e se torna real no dia a dia, o "aqui e agora"). Isso já bate com o que o Roadmap de 13/08 cogitou pro Kether — "ouvir evento de progresso de qualquer módulo, se virar o hub de recompensas" (ver Opção C, seção "Tarefas & calendário" acima) — só que pro lado errado da árvore: recompensa/aspiração é tema de Kether (topo), controle/execução é tema de Malkuth (base). Os dois não competem — são os dois extremos naturais da árvore, cada um agregando por um motivo diferente:

| | Kether (topo) | Malkuth (base) |
|---|---|---|
| Tema kabalístico | Fonte, potencial, coroa | Reino, manifestação física |
| Papel proposto | Hub de **recompensa/aspiração** — pra onde o progresso dos outros módulos converge como motivação | Hub de **controle/execução** — de onde a atenção do dia a dia é dirigida pros outros módulos |
| Pergunta que responde | "O que estou construindo?" | "O que precisa de mim agora?" |

Isso também dá **um lar arquitetural natural pro sistema de tarefas/calendário compartilhado** que você já decidiu construir (Opção A, camada central — ver seção "Tarefas & calendário" acima, decisão de 15/08/2026): hoje essa decisão está registrada como uma feature solta, sem sefira dona. Se o Malkuth virar o hub de controle, o calendário/tarefas central **mora** ali — deixa de ser "uma tela nova no hub" e passa a ser "a funcionalidade central do décimo módulo", com identidade própria.

### Prós e contras

**Prós:**
- Resolve duas perguntas em aberto ao mesmo tempo: dá um lar temático pro calendário/tarefas compartilhado (Opção A já decidida) **e** fecha a "conversa em aberto" mais nebulosa do roadmap — a própria visão do Malkuth, que você mesmo descreveu como "a mais indefinida dos 10" (ver [[10 Malkuth]]).
- Ressoa com o simbolismo da própria Cabala em vez de ser uma função técnica arbitrária colada num módulo qualquer — Malkuth como "onde tudo se manifesta" é literalmente a definição tradicional da sefira.
- Cria uma simetria clara com o Kether (topo=aspiração, base=controle) em vez de dois módulos concorrendo pelo mesmo papel de "hub que vê tudo".
- Já existe um embrião: o dashboard "PROGRESSO POR ÁREA" (slide "Status" do hub, `App.jsx`) já lista as 10 áreas com barra de progresso — não é greenfield total, mas hoje tem o mesmo gap do item 1 acima (usa `arScore` genérico em vez do score real de cada módulo pra 9 das 10 áreas — outro achado desta varredura, não documentado antes).
- Endereça de vez a fragmentação de "coisa com prazo" (Netzach/Yesod/Chesed) num lugar que faz sentido tanto tecnicamente quanto tematicamente.

**Contras / riscos:**
- **Segunda mudança de direção do Malkuth.** A visão anterior (ver [[10 Malkuth]] e a pesquisa de benchmark do parecer de usabilidade de 14/08 — Stoic, Reflectly, rotina de reflexão manhã/noite) era jornada de reflexão/journaling pessoal, não hub de controle. As duas ideias não são incompatíveis por natureza, mas competem por espaço de tela e por "o que é a primeira coisa que você vê ao abrir o Malkuth" — precisa decidir se uma vira a tela principal e a outra uma aba secundária, ou se a reflexão pessoal é descartada.
- **Maior superfície técnica que qualquer integração existente.** O hub do Tiphareth lê 5 módulos; um hub de controle de verdade em Malkuth precisaria ler potencialmente os 9 outros (incluindo Kether, se/quando existir) — mais manutenção, mais chance de quebrar quando um módulo muda o formato dos próprios dados.
- **Malkuth é hoje o módulo com menos decisão tomada dos 10.** Construir algo arquiteturalmente central (que os outros módulos passam a ser "lidos por") em cima da base menos madura é o oposto do padrão que já funcionou no projeto até aqui — o hub do Tiphareth só foi construído depois que Tiphareth já estava maduro havia semanas. Normalmente um hub agregador deveria vir depois das peças que agrega estarem estáveis, não antes.
- **Overlap de propósito com o hub do Tiphareth.** Já existe 1 sefira fazendo "olhar pra vários módulos de uma vez" (Tiphareth, foco bem-estar/hábitos). Um Malkuth-hub-de-controle seria o segundo — não é necessariamente ruim (papéis diferentes: Tiphareth é sobre *bem-estar cruzado*, Malkuth seria sobre *ação/atenção cruzada*), mas precisa ficar claro pro usuário final por que existem 2 lugares "que juntam tudo", ou vira confuso.

### Recomendação (sem fechar a decisão — é sua)

A ideia tem mérito real e não é só resolver um problema técnico com uma desculpa temática — a simetria Kether/Malkuth (aspiração/controle, topo/base) é genuinamente coerente com a estrutura da árvore. Mas o **momento** de construir isso deveria vir depois, não agora: mesma lógica que já vale pra Fase 2 do Plano de Evolução (Kether e Malkuth entram depois de completar/estabilizar os 8 módulos existentes, não antes) — um hub que lê de todo mundo fica mais barato e mais estável de construir quando "todo mundo" já parou de mudar de formato. Os 5 gaps pequenos listados acima (Chokmah/Binah fora do score bridge e do hub do Tiphareth, especialmente) valem a pena fechar bem antes disso, já que são baratos e destravam dado real que já existe, só não está chegando aonde deveria.

Se/quando decidir seguir com o Malkuth-hub-de-controle, o próximo passo não é código — é a mesma conversa em aberto que já estava registrada pro Malkuth (ver [[10 Malkuth]]): decidir explicitamente se a reflexão pessoal (visão anterior) e o controle agregado (proposta nova) coexistem, e se sim, qual é a tela principal.

> ⚠️ **Atualização (18–19/08/2026):** o usuário decidiu seguir antes do momento recomendado acima ("depois de estabilizar os 8 módulos") — e o risco técnico principal listado nos contras ("maior superfície técnica que qualquer integração existente", "mais chance de quebrar quando um módulo muda o formato dos próprios dados") não se confirmou na prática: o protótipo da aba Atividades foi construído e testado lendo/escrevendo nos 8 módulos reais (não só 9-incluindo-Kether, que ainda não existe) sem nenhum erro de console, porque ele nunca lê o formato interno de cada módulo diretamente — só reaproveita as `*_ACTION_HANDLERS` que o Coach já usa (que já abstraem o formato de cada um). O único atrito real encontrado foi de nomenclatura (nomes de ação não são 100% padronizados entre módulos — `toggle_yhabit` vs. `toggle_habit`, `area` como parâmetro extra em Netzach/Tiphareth), não de instabilidade de formato de dado. Isso não invalida o "espere estabilizar" como princípio geral — só mostra que, nesse caso específico, o custo real foi menor que o estimado porque a integração passa por uma camada já abstraída (as ações do Coach), não pelo dado bruto de cada módulo. Detalhe completo em [[10 Malkuth]] → "Estendido pros 8 módulos".

---

## 🎯 Próximos passos priorizados (19/08/2026, atualizado 19–20/08/2026)

> Atualização direta desta sessão — feita pra decidir o que vem depois de fechar o rótulo "Controle" e estender a aba Atividades do Malkuth pros 8 módulos. Cruza o estado real (código + docs, ambos verificados nesta sessão) com o [[#🎯 Plano de Evolução — sequenciamento recomendado (12/08/2026)|Plano de Evolução]] vigente — não substitui esse plano, prioriza dentro dele.

> ⚠️ **Atualização (19–20/08/2026):** os itens 1 (parcial) e 5 abaixo já não se aplicam do jeito que foram escritos — Kether ganhou protótipo real no mesmo dia (o usuário não esperou pelas decisões da Fase 0) e o gap do score bridge (item 2) foi corrigido de quebra durante esse trabalho, já que remover a camada de RPG do hub exigia mexer na mesma função (`aScores`). Texto original mantido riscado abaixo por registro; itens 3 e 4 continuam de pé.

1. ~~Fechar as 2 decisões de arquitetura que restam da Fase 0~~ — a de recompensas do Kether ficou **moot** (Kether virou "Desejo", não hub de recompensas — ver [[01 Kether]]); resta só cadastro de pessoa/família (Config geral ou dentro do Chesed?), ainda em aberto, baixo esforço.
2. ~~Os 2 gaps baratos achados na varredura de integrações de 15/08/2026~~ — **corrigido em 19/08/2026**: `aScores` em `App.jsx` agora promove chokmah/binah/malkuth pra árvore (só "desejos"/Kether fica sem score real, por não ter um conceito de score próprio). O gap do hub de hábitos do Tiphareth (`HUB_ADAPTERS` sem adapter pra Chokmah/Binah) segue aberto — não fechado nesta leva.
3. **Continuar o Malkuth e o Kether** — ambos têm só 1 peça das propostas completas construída. Malkuth: mais uma das 5 abas restantes (Progresso é a mais barata — reaproveita o "Dash" já removido). Kether: fechar os 2 módulos sem toggle na aba Metas (Geburah/Chesed não entraram nem na peça de derivação), ou construir a "aba Reino"-equivalente (visão consolidada de todos os desejos e progresso).
4. **Onboarding de 3 telas** — continua sinalizado como maior ROI/menor esforço de todo o roadmap (ver "Prioridade imediata" abaixo) e não teve nenhum movimento desde que foi levantado em 09/08/2026. Compete por atenção com os itens de módulo acima, mas é o item mais citado como bloqueador de retenção real.
5. ~~Kether — só depois do item 1~~ — feito antes do previsto, ver acima.

**Não priorizado de propósito, mesmo motivo de sempre:** Fase 4 (fundação técnica — PWA, decomposição de arquivos, testes, criptografia) continua depois da Fase 2/3, porque a superfície do produto ainda muda (Malkuth/Kether ainda têm abas por construir) — refatorar agora significaria refatorar de novo depois.

## 🛡️ Auditoria de segurança, Android e performance (10/08/2026)

Levantamento dedicado, verificado direto no código (`preview/`, `app/native/`, `vite.config.js`, `api/coach.js`, `package.json`) — detalhe completo em [[10 Segurança, Mobile e Performance]], versão resumida em [[04 Bugs Conhecidos]]. Ordenado por severidade real, não por seção:

| # | Item | Severidade | Esforço |
|---|---|---|---|
| S1 | ~~**Proxy do Coach (`/api/coach`) é endpoint aberto**~~ — rate limit por IP + limite de payload + clamp de `maxTokens` adicionados em 15/08/2026 (ver [[04 Bugs Conhecidos]]). Segue sem autenticação de chamador de verdade (token/sessão) — mitigado, não eliminado. | 🟡 Média (era 🔴 Alta) | Pequeno — feito |
| S2 | Dados sem criptografia em repouso e sem trava de acesso ao app (PIN/biometria) | 🟡 Média | Médio |
| S3 | Backup exporta tudo (financeiro + saúde) em texto puro pro clipboard | 🟡 Média | Pequeno |
| A1 | **Sem PWA** — `manifest.json`/service worker ainda não existem, item já estava no roadmap antes desta auditoria | 🟡 Média | Pequeno–Médio |
| A2 | `app/native/` confirmado **vazio** — nenhum esforço de React Native/Expo foi de fato começado, apesar dos docs sugerirem o contrário | 🔵 Info | — |
| P1 | Sem code splitting — bundle inicial carrega os 6 módulos inteiros de uma vez | 🟡 Média | Médio |
| P2 | Arquivos monolíticos — ~~`GeburahModule.jsx`~~ ✅ ~~`HodModule.jsx`~~ ✅ fatiados em 22/08/2026 (1795→527 e 1768→309 linhas, ver [[02 Arquitetura]]); `App.jsx` (1232 linhas) e os outros 6 módulos ainda sem quebra em subcomponentes | 🟡 Média (era 🟡 Média, 2/8 arquivos-alvo feitos) | Grande — parcial |
| P3 | Zero testes automatizados no projeto inteiro | 🟡 Média | Grande |
| P4 | Duplicação estrutural do acesso a `localStorage` entre módulos (sem utilitário compartilhado) | 🔵 Info | Médio |
| P5 | Acessibilidade — navegação por teclado, leitor de tela; não testada/quantificada em nenhuma auditoria até agora. Item novo, 22/08/2026 — apontado pelo Raio-X de 14/08 ([artefato](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a)) como bloqueador de nota 10/10, nunca tinha virado item de backlog (só constava como "não verificado" em [[01 Estado Atual]]) | 🟡 Média | Grande |

Nada disso foi priorizado ainda contra o resto do backlog (onboarding, tarefas/calendário, etc. — ver seção "Auditoria de módulos" acima). **S1 é o único item com severidade real de segurança em produção** — os demais são exposição condicional (dispositivo perdido, backup mal colado) ou dívida técnica.

---

## 🚨 Prioridade imediata (próximas 2 semanas)

> Detalhe de execução dos itens da **Fase 0 e Fase 1** do plano de sequenciamento acima — a ordem entre eles é a da seção "Plano de Evolução", não a ordem em que aparecem aqui embaixo.

Se pudesse fazer só uma coisa: **onboarding de 3 telas**. É o item de maior impacto com menor esforço — um usuário que passa pelo onboarding tem ~3x mais chance de voltar no dia seguinte, e todo o resto do produto só tem valor se o usuário não abandona nos primeiros 2 minutos.

### Fundação UX
- [ ] **Onboarding de 3 telas** — boas-vindas (árvore crescendo) → escolher 3 áreas prioritárias → criar 1º hábito guiado em 2 toques. Salvar flag `onboarded: true`.
- [ ] **Simplificar criação de hábito** — Título + Área + Frequência (3 campos obrigatórios); resto em "⚙️ Avançado". Reduz de 7 para 3 passos.
- [x] ~~Reduzir nav de 7 para 5 abas~~ — **implementado em 31/07/2026, com uma solução diferente da originalmente planejada:** em vez de agrupar em "Crescimento"/"Perfil" (5 abas), a nav foi pra **4 abas** (`Árvore · Hábitos · Metas · Config`) — RPG (renomeado "Status") e Dash viraram slides de um carrossel circular dentro da própria aba Árvore (arraste ou setas nos cantos), e o Coach virou um campo de input permanente (não uma aba de "Perfil"/"Crescimento"). Resolve o mesmo problema de densidade de nav apontado pela [[Avaliação PO + Designer]]. Ver [[04 Bugs Conhecidos]] e [[02 Arquitetura]].
- [ ] **Quick input universal (FAB)** — botão flutuante em todo módulo, bottom sheet com 3-4 ações rápidas, 1-2 toques pra registrar sem formulário. Ver tabela de quick-input por sefirá na seção [[#Backlog priorizado por módulo|Backlog]].

### Bugs críticos (confirmados no código)
- [ ] **Capturar erro cru do Coach, trocar por mensagem amigável** — recomendação "Agora" do parecer de usabilidade de 14/08/2026 ([artefato "Raio-X"](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a)), junto do bug de decimal — esse foi corrigido, este ficou de fora do Roadmap até 22/08/2026. Já documentado em [[04 Bugs Conhecidos]] → "Erro cru da API do Coach vaza pro usuário final". Esforço pequeno.
- [ ] **Toast de erro do Coach com auto-dismiss** — mesma origem (Raio-X, 14/08), mesma situação (documentado em [[04 Bugs Conhecidos]], nunca virou item do Roadmap). Esforço pequeno.
- [x] ~~`window.storage` ainda ativo no hub central (`App.jsx`) — quebra persistência fora do artefato Claude~~ — **corrigido em 15/08/2026**, trocado por `localStorage`. Ver [[04 Bugs Conhecidos]].
- [x] ~~Timer do Geburah com dependência errada no `useEffect`~~ — **corrigido em 12/08/2026**. Ver [[04 Bugs Conhecidos]].
- [x] ~~`registrar_refeicao` (Geburah) falha pra maioria dos alimentos — banco pequeno~~ — **corrigido em 04/08/2026**: banco expandido de poucos itens pra 376 (22 categorias, padrão TACO). Ver [[04 Bugs Conhecidos]].
- [x] ~~Banco de exercícios pequeno / sem dado de gasto calórico (Geburah)~~ — **corrigido em 09/08/2026**: `D_EX` foi de 10 pra 286 itens (153 musculação + 123 artes marciais), todos com MET. Gap novo e mais específico encontrado na auditoria pós-migração: MET existe mas não é usado em nenhum cálculo (sessão/dieta/score) porque `logTreino` não guarda duração — ver [[05 Geburah]], seção "Gap analysis — pós-biblioteca de exercícios".
- [x] ~~Preenchimento visual das sefirot na Árvore~~ — **corrigido em 31/07/2026**: implementado efeito de líquido subindo (rect clipado + `??` no lugar de `||`). Ver [[04 Bugs Conhecidos]].

Detalhe completo de cada bug em [[04 Bugs Conhecidos]].

### Yesod
- [x] ~~Receitas/despesas esperadas (lançamentos futuros)~~ — **implementado em 01/08/2026** como recorrência real (`recurrings`, geração automática com catch-up ao abrir o app), não um cadastro de "esperado" separado — resolve o mesmo problema.
- [x] ~~Projeção de fluxo de caixa 30/60/90 dias~~ — **implementado em 01/08/2026**, e ampliado além do pedido original: horizontes de 30 dias a 3 anos, com marcos de quitação de dívida, aviso de saldo negativo e um ajustador de cenário (receita extra/redução de custo) que não toca dado real. Ver [[09 Yesod]].
- [x] ~~Converter coach Yesod para conversacional com actions~~ — **implementado em 01/08/2026**: 34 ações cobrindo o módulo inteiro (lançamentos, categorias, recorrências, bancos/contas/cartões, caixinhas com meta+prazo, dívidas, investimentos, orçamento, meta IF, hábitos/metas do módulo, dashboard), com confirmação obrigatória antes de executar e raciocínio de analista financeiro pra metas com prazo. Ver [[09 Yesod]] e [[02 Arquitetura]].
- [x] Categorias customizáveis — **feito em 01/08/2026** (item não previsto no backlog original, adicionado por pedido direto do usuário) — ver [[09 Yesod]]
- [x] Busca de lançamentos — **feito em 01/08/2026**, ver [[09 Yesod]]
- [x] Alertas de vencimento (fatura/dívida) — **feito em 01/08/2026**, ver [[09 Yesod]] (in-app, não é push notification)

### App no celular (PWA)
- [ ] `manifest.json` + ícones — **confirmado: ainda não existe** em `preview/public`
- [ ] Service worker para offline
- [ ] Deploy Vercel (`vercel --prod` na pasta `preview/`)
- [ ] Testar no celular real

**Critério de saída deste sprint:** usuário novo cria o 1º hábito em <60s · sefirot enchem visualmente conforme progresso · quick input funciona no Yesod · ~~Yesod mostra projeção de saldo do próximo mês~~ (feito 01/08/2026, e cobre até 3 anos).

---

## Próximo mês

**Semanas 3-4 — Quick Input em todos os módulos core:** histórico como atalho (repetir último lançamento) · roteamento Haiku/Sonnet no código.

**Semanas 5-6 — Supabase:** setup conta + projeto (**confirmado: nenhuma dependência de Supabase em nenhum `package.json` do repo ainda**) · schema do banco · auth Google · migrar Árvore + Yesod.

**Semanas 7-8 — Qualidade:** prompt caching em todos os agentes (ver [[Coach de IA]]).

## Mês 2-3 — Validação

- 20 usuários beta (não técnicos, sem contexto de kabbalah)
- Medir: % que completa onboarding, D1, D7
- Beta pago: 10 fundadores a R$9,90
- [x] ~~Expandir banco de alimentos Geburah (200+ itens TACO)~~ — feito 04/08/2026 (376 itens)

---

## 💅 Fase 2 — UI Polish (depois da Fundação UX)

**Impacto:** UI 7.5→9 · Visual 7.5→9. Elevar a qualidade visual ao nível dos melhores apps.

- **Design system formal:** 4 tamanhos de texto (xs/sm/md/lg) · espaçamento grid 4px · border radius padronizado (8/12/16/99) · sombras suaves no dark (glow nas sefirot ativas) · micro-animações (shake erro, bounce check, pulse streak)
- **Árvore responsiva:** escala com largura da tela · split view em tablet · pulso nas sefirot com hábitos pendentes · linhas animadas ao completar hábitos
- **Cards redesenhados:** gradient sutil no hábito concluído · confetti + card dourado na meta 100% · modal fullscreen de reveal em conquista · badges animados de streak (7d chama, 30d partículas)
- **Dark mode premium:** gradientes de profundidade · blur glassmorphism nos modais · nebulosa de fundo na árvore · cores mais saturadas
- **Ilustrações e empty states:** cada aba vazia com ilustração temática (semente esperando, guerreiro pronto, silhueta misteriosa)

---

## 📋 Backlog priorizado por módulo

> Fases 3 ("Funcionalidade Avançada"), 4 ("Monetização") e 5 ("Ecossistema") do roadmap original de 10 pontos foram substituídas por este backlog + a seção de [[#Monetização|Monetização]] abaixo, que cobrem o mesmo terreno de forma mais granular e sem repetir os mesmos itens duas vezes.

### 🔥 P1 — Alto impacto (semanas 3-6)

| # | Item | Módulo | Impacto |
|---|---|---|---|
| 1 | ~~Recorrências automáticas~~ (Pix Automático ready) | Yesod | ✅ feito 01/08/2026 — geração real de lançamentos futuros, não só Pix Automático (qualquer entrada/saída recorrente) |
| 2 | Categorização automática de transações | Yesod | Fricção |
| 3 | Gráfico de gastos por categoria temporal | Yesod | Visualização |
| 4 | Compartilhamento familiar/casal | Yesod | Mercado |
| 5 | ~~Banco de alimentos brasileiros (200+ itens)~~ | Geburah | ✅ feito 04/08/2026 — 376 itens, ver [[04 Bugs Conhecidos]] |
| 6 | ~~Timer automático pós-série de treino~~ | Geburah | ✅ já existia desde a implementação de 12/08/2026 (item 7b/e), confirmado no navegador ao reavaliar os gaps — dispara ao marcar série feita |
| 7 | ~~Sugestão de carga baseada em PR~~ | Geburah | ✅ feito 12/08/2026 — heurística PR+incremento, achou e corrigiu de quebra um bug real em `prMap` (contava série não executada como PR). Ver [[04 Bugs Conhecidos]] |
| 7a | ~~Banco de exercícios c/ MET (musculação + artes marciais)~~ | Geburah | ✅ feito 09/08/2026 — 286 itens, ver [[05 Geburah]] |
| 7b | ~~Registrar duração do treino (`horaInicio`/`horaFim` em `logTreino`)~~ | Geburah | ✅ feito 12/08/2026 — junto com relógio de sessão ao vivo. Ver [[05 Geburah]] |
| 7c | ~~Calorias líquidas (dieta − gasto do treino via MET) no dashboard/score~~ | Geburah | ✅ feito 12/08/2026 — nova linha "Calorias líquidas" no widget Macros Hoje. Ver [[05 Geburah]] |
| 7d | ~~Log de série por duração/rounds (não só carga em kg) — pra Artes Marciais/cardio/bodyweight~~ | Geburah | ✅ feito 12/08/2026 — sistema `logTipo` (carga/tempo/reps). Ver [[05 Geburah]] |
| 7e | ~~Unir planejamento semanal de treino e dieta numa visão só~~ | Geburah | ✅ feito 12/08/2026 — linha "Treino" por dia em `PlanejamentoTab`, com indicador de conclusão e reatribuição. Ver [[05 Geburah]] |
| 8 | Log de conquistas profissionais exportável | Hod | Diferencial |
| 9 | Pipeline de oportunidades (CRM pessoal) | Hod | **Parcialmente feito 09/08/2026** — CRM de clientes/alunos (plano de trabalho, sessões, feedback) dentro de qualquer projeto tipo `servico`; ainda falta funil de leads/oportunidades *antes* de virarem cliente. Ver [[08 Hod]] |
| 9a | ~~Trilhas de competência (Carreira) + motor de projetos unificado (Projetos, substitui Renda Ativa+Negócio)~~ | Hod | ✅ feito 09/08/2026 — não previsto no backlog original, pedido direto do usuário. Ver [[08 Hod]] |
| 9b | ~~Ações do Coach pro Hod (`actions:true`)~~ | Hod | ✅ feito 13/08/2026 — `hodActions.js`, 25 ações. Ver [[08 Hod]] |
| 9c | ~~Sinalizar na tela cliente sem sessão há +14 dias~~ | Hod | ✅ feito 13/08/2026. Ver [[08 Hod]] |
| 9d | ~~Critérios de avanço de fase pros tipos Produto/Conteúdo/Serviço/Outro~~ | Hod | ✅ feito 13/08/2026 — `CRITERIA_BY_TYPE` generalizado pros 5 tipos. Ver [[08 Hod]] |
| 10 | Sons ambiente + meditações guiadas em PT | Chokmah | PT-BR único |
| 11 | **CRM Pessoal de Relacionamentos completo** | Chesed | **Maior gap** |
| 12 | Lembretes automáticos de datas | Chesed | Engajamento |

### 💪 P2 — Importante (semanas 7-12)

| # | Item | Módulo | Impacto |
|---|---|---|---|
| 13 | Integração wearables (Google Fit/Apple Health) | Geburah | Automação |
| 14 | Reconhecimento de alimentos por foto IA | Geburah | UX premium |
| 15 | Time tracking simples por projeto | Hod | Pro feature |
| 16 | Spaced repetition para conhecimento | Binah | Anki-killer |
| 17 | Sistema de destaques de leitura | Binah | Readwise-like |
| 18 | Checklists domésticos recorrentes | Netzach | Tody-killer |
| 19 | Bucket list com planejamento real | Netzach | Diferencial |
| 20 | Diário de experiências com fotos | Netzach | Memória |
| 21 | ~~Tracking de humor com correlações~~ | Tiphareth | ✅ feito 13/08/2026 — diário de humor direcionado (`moodLog`, upsert diário, 2 prompts guiados, tira de 14 dias) + correlação Humor × Hábitos (`moodCorrelation`, snapshot `habitsPct` a cada registro, forward-building a partir da implementação) + streaks de humor/rotina — ver [[06 Tiphareth]] |
| 21a | **Tornar a correlação Humor × Hábitos visível na tela** (hoje só existe como dado, `habitsPct`, sem UI própria) | Tiphareth | Recomendação "Depois" do Raio-X (14/08/2026, [artefato](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a)) — sem dono até 22/08/2026. Esforço pequeno-médio (o dado já existe, falta só o gráfico/resumo). |
| 22 | ~~Rotina de skincare com produtos~~ | Tiphareth | ✅ já existia antes desta leva (`D_ROTINAS`/`D_PRODUTOS`, aba Rotinas + Aparência) |
| 23 | Ciclo menstrual integrado | Tiphareth | Mercado bi |

### 🌱 P3 — Estratégico (semanas 13-24)

| # | Item | Módulo | Impacto |
|---|---|---|---|
| 24 | Testes de personalidade integrados | Malkuth | Diferencial |
| 25 | Análise de padrões no diário (IA) | Malkuth | Reflectly-like |
| 26 | Visualização de desejos com mood board | Kether | Visual |
| 27 | Importação de dados (Habitica, Notion, MFP) | Todos | Migração |
| 28 | Modo offline completo | Todos | Confiabilidade |
| 29 | Sincronização em nuvem (Supabase) | Todos | Multi-device |
| 30 | App WearOS com check-in rápido | Todos | Ver [[Smartwatch Integração]] |
| 31 | Comunidade e desafios em grupo | Árvore | Habitica-gap |
| 32 | Coach IA com memória persistente | Todos | Ver [[Coach de IA]] |
| 33 | Multi-idioma (EN, ES inicialmente) | Todos | Expansão |
| 34 | API pública — webhooks (Zapier, Make), SDK para parceiros | Todos | Ecossistema |

### ⚡ Quick Input por módulo (padrão obrigatório)

FAB (+) sempre visível → bottom sheet com 3-4 ações rápidas → 1-2 toques pra registrar, sem formulário. Long-press na sefirá da Árvore também abre o quick input. Coach IA por voz executa direto ("registrei R$50 em alimentação").

| Sefirá | Ação principal | Toques |
|---|---|---|
| Yesod (Finanças) | Lançar despesa: valor → categoria | 2 |
| Geburah (Saúde) | Marcar refeição: foto ou favorito | 1-2 |
| Hod (Profissional) | Iniciar foco: timer 25min | 1 |
| Chokmah (Espiritualidade) | Meditar: 5/10/15 min direto | 1 |
| Chesed (Relacionamentos) | Registrar contato: pessoa → tipo | 2 |
| Binah (Conhecimento) | Log leitura: livro → minutos | 1 |
| Netzach (Qualidade) | Marcar tarefa doméstica | 1 |
| Tiphareth (Autocuidado) | Humor de hoje: 5 emojis | 1 |
| Malkuth (Controle) | Marcar atividade de outro módulo direto no Reino | 1 |
| Kether (Desejo) | Marcar meta de outro módulo direto no Desejo | 1 |

---

## 💰 Monetização

### Princípios
Freemium real (não trial disfarçado) · paywall contextual (bloqueia no momento de valor, não na entrada) · pricing brasileiro · sem ads.

### Planos

**🌱 Gratuito (Semente)** — para sempre, sem cartão: árvore completa visível · até 5 hábitos / 3 metas ativos · 2 sefirot completas (Yesod + 1 escolhida) · Coach IA 10 msgs/mês · backup manual · 1 widget.

**🌳 Pro (Árvore)** — R$19,90/mês ou R$149/ano (38% off anual): todas as 10 sefirot completas · hábitos/metas/Coach ilimitados · widgets ilimitados · desafios e templates · revisão semanal automática · backup em nuvem · badge "Guardião da Árvore" · smartwatch básico.

**🌟 Mestre (Iluminação)** — R$49,90/mês ou R$399/ano (33% off anual): tudo do Pro + Coach com memória persistente · correlações entre módulos · análise de padrões com IA · acesso antecipado · suporte prioritário · compartilhamento até 3 pessoas · smartwatch completo.

### Conversão
**Trial:** 14 dias grátis do Pro, sem cartão, nurturing por email, oferta 50% off no dia 12.

**Paywall contextual:**

| Momento | Mensagem | Plano |
|---|---|---|
| Criar 6º hábito | "Você está crescendo! Desbloqueie hábitos ilimitados" | Pro |
| 11ª msg ao Coach | "Continue conversando — desbloqueie o Coach ilimitado" | Pro |
| Abrir 3ª sefirá | "Complete sua árvore — desbloqueie todas as áreas" | Pro |
| Tentar correlações | "Descubra os padrões da sua vida" | Mestre |
| Backup automático | "Nunca perca seus dados" | Pro |

### Projeção financeira (cenário conservador)
Premissas: conversão free→pago 5% · churn mensal 8%.

| Mês | Free | Pro | Mestre | MRR |
|---|---|---|---|---|
| 1 | 500 | 25 | 5 | R$750 |
| 3 | 2.000 | 100 | 20 | R$3.000 |
| 6 | 5.000 | 250 | 50 | R$7.500 |
| 12 | 15.000 | 750 | 150 | R$22.500 |
| 24 | 50.000 | 2.500 | 500 | R$75.000 |

ARR ano 2: R$900.000.

### Lançamento
**Beta (mês 1-2):** 100 usuários de comunidades de desenvolvimento pessoal, Kabbalah/místico, biohackers, coaches. **Público (mês 3):** Product Hunt, parcerias com criadores (YouTube/Instagram/TikTok de espiritualidade e produtividade), conteúdo orgânico da árvore evoluindo, 50% off perpétuo pra primeira coorte. **Crescimento (mês 4+):** SEO, afiliados (20% recorrente), integrações Notion/Habitica, ASO.

---

## Decisões tomadas

| Decisão | Motivo | Data |
|---|---|---|
| Vite 5 + @vitejs/plugin-react@4 | Vite 8/OXC quebra JSX-in-IIFE | Histórico |
| IIFEs → funções nomeadas | esbuild não suporta IIFEs em JSX | Histórico |
| window.storage → localStorage | window.storage só existe em artifacts Claude | Histórico — **aplicado no `App.jsx` raiz em 15/08/2026**, ver [[04 Bugs Conhecidos]] |
| 3 módulos no ano 1 (não 10) | Qualidade > quantidade | Junho 2026 — código já passou disso: 4 integrados (Yesod, Geburah, Hod, Tiphareth) |
| PWA antes de React Native | Mais rápido, mesmo resultado pro usuário | Junho 2026 |
| Vercel grátis como hosting | 0 custo, HTTPS automático, deploy simples | Junho 2026 |
| Supabase grátis como backend | 500MB grátis, auth Google, SDK simples | Junho 2026 |

---

## Métricas e critérios de sucesso

### Critérios de abort (curto prazo)
**Fase 1 (validação):** abortar se <50% completam onboarding após 3 iterações · D7 < 15% após 4 semanas de beta · NPS < 20 no mês 4.
**Fase 2 (tração):** abortar se CAC > R$60 em todos os canais testados · conversão free→pro < 1,5% com onboarding validado · churn > 12%/mês por 2 meses seguidos.

### Métricas por fase de qualidade
| Fase | Métrica | Meta |
|---|---|---|
| Fundação UX | Taxa de conclusão do onboarding | >80% |
| Fundação UX | Retenção D1 | >50% |
| UI Polish | Nota de design (App Store) | >4.5⭐ |
| UI Polish | Tempo médio de sessão | >5 min |
| Funcionalidade avançada | Retenção D30 | >30% |
| Funcionalidade avançada | Hábitos completados/usuário/semana | >15 |

### Métricas de negócio (acompanhar continuamente)
| Métrica | Meta mês 3 | Meta mês 12 |
|---|---|---|
| MAU | 1.500 | 12.000 |
| Conversão Free → Pro | 4% | 6% |
| Churn mensal | <10% | <5% |
| LTV | R$120 | R$350 |
| CAC | R$30 | R$40 |
| LTV/CAC | 4x | 8x |
| NPS | >40 | >60 |

### Scorecard projetado por fase
| Dimensão | Atual | Fundação UX | UI Polish | Func. Avançada | Monetização | Ecossistema |
|---|---|---|---|---|---|---|
| Proposta de valor | 8.0 | 8.5 | 9.0 | 9.5 | 9.5 | **10** |
| Funcionalidade | 8.5 | 8.5 | 8.5 | 9.5 | 9.5 | **10** |
| Visual / Estética | 7.5 | 7.5 | 9.5 | 9.5 | 9.5 | **10** |
| UI | 6.0 | 8.5 | 9.5 | 9.5 | 9.5 | **10** |
| UX | 6.0 | 8.5 | 9.0 | 9.5 | 9.5 | **10** |
| Mercado | 7.5 | 7.5 | 7.5 | 8.0 | 9.5 | **10** |
| **Média** | **7.2** | **8.2** | **8.8** | **9.2** | **9.5** | **10** |

---

## 🔮 Visão de 12 meses

```
Mês 1-3:   MVP polido (Fundação UX + UI Polish)
Mês 4-6:   Lançamento + primeiros 2.000 usuários
Mês 7-9:   Monetização funcionando + R$10k MRR
Mês 10-12: Smartwatch + comunidade + R$25k MRR
```

**Norte final:** Life Tree como a referência em desenvolvimento pessoal integrado no Brasil, com expansão para o mercado hispânico no ano 2.

## Ver também
- [[Avaliação PO + Designer]]
- [[04 Bugs Conhecidos]]
- [[09 Auditoria de Código vs Documentação]]
- [[03 Módulos (Sefirot)]]
- [[Coach de IA]] · [[Smartwatch Integração]]
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
