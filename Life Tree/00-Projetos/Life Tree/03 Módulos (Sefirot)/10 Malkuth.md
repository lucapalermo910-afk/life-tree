---
tags: [lifetree, modulo, malkuth]
aliases: [Malkuth]
---

# 🏛️ Malkuth — Controle

> Status: 🟡 Protótipo. `preview/src/MalkuthModule.jsx` existe e está wireado em `App.jsx` (nó "Controle" da árvore) — só a aba Atividades das 6 propostas, mas já cobrindo os 8 módulos reais com sincronização bidirecional. Ver "Estendido pros 8 módulos" abaixo. Histórico: até 18/08/2026 o módulo era "genuinamente vago" (`modules/malkuth-pessoal/src/` vazio, confirmado em 28/07/2026) — as seções abaixo documentam essa evolução na ordem em que aconteceu.

## Ideia de quick input (do [[05 Roadmap]])
Reflexão rápida: prompt do dia, 1 toque. Backlog P3 menciona testes de personalidade integrados e análise de padrões no diário via IA (Reflectly-like) como diferenciais.

## Visão do usuário (09/08/2026)
O próprio usuário marcou este módulo como o mais indefinido dos 10 — "está um pouco mais nebuloso... gostaria de conversar mais pra entender como aterrisar essa parte." Levantado como parte da auditoria cruzada dos 10 módulos (ver [[01 Estado Atual]] e artefato web linkado lá). Sem proposta de design — fica pra conversa aberta, não pra escopo pronto. Único fio solto conhecido: `areaId:"pessoal"` hoje é o rótulo mais genérico dos 10 (valores/propósito/autoconhecimento como sub-áreas) — um dos pontos a decidir é se Malkuth herda esse recorte ou vira outra coisa.

## Proposta nova (15/08/2026) — hub central de controle
Segunda ideia de direção pro módulo, além da reflexão/journaling levantada no parecer de usabilidade de 14/08 (ver seção "Kether & Malkuth" do [artefato web](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a), inspirada em Stoic/Reflectly): o usuário propôs revisitar o Malkuth como **hub central de controle** — agregando sinais de atenção de todos os outros 9 módulos num só lugar, complementando (ou substituindo) o papel informal que o Netzach carrega hoje. Análise completa, com varredura de integrações cross-módulo existentes, prós/contras, e a leitura de por que Kether (topo)/Malkuth (base) fazem uma dupla natural de "hub de aspiração"/"hub de controle" na própria estrutura da árvore, em [[05 Roadmap]] → "Integrações entre módulos — estudo completo". Ainda não decidido se essa proposta substitui a visão de reflexão/journaling ou coexiste com ela — mesma "conversa em aberto" de 09/08, agora com uma segunda opção concreta na mesa.

## Proposta de UI/UX (18/08/2026) — "módulo integrador geral"

> Pedido do usuário: o Reino vira o módulo que **registra atividades e hábitos de todas as frentes**, integrando tudo, servindo de painel de controle geral — substituindo de vez a função que o 3º slide do carrossel ("Dash") tentava cumprir solto, sem sefira dona. **O slide "Dash" já foi removido do carrossel em 18/08/2026** (`App.jsx`, `TREE_SLIDES` de 3 pra 2 itens — Árvore/Status) — o conteúdo dele (XP histórico, top streaks, progresso por área, conquistas, diário) é exatamente o que migra pra cá, não foi descartado. Isto é uma **proposta de design pra discutir e decidir**, não uma implementação — construir o módulo de verdade é esforço do mesmo porte que Chokmah/Binah (ver [[02 Chokmah]]/[[03 Binah]]), merece sessão própria quando a direção estiver fechada.

### Por que o "Dash" já era quase isso
O slide removido tinha 5 blocos, todos genuinamente cross-módulo por natureza — só estavam no lugar errado (um slide de carrossel do hub, sem identidade própria, em vez de um módulo):
1. **XP — últimos 14 dias** (gráfico de barra)
2. **Top streaks** (top 5 hábitos por sequência, de qualquer área)
3. **Progresso por área** (as 10 áreas com barra) — **tinha um bug**: usava o score genérico (`arScore`) pra 9 das 10 áreas em vez do score real publicado por cada módulo (mesmo gap achado na varredura de integrações, ver [[05 Roadmap]]) — good de corrigir na migração, não só copiar o bug de lugar.
4. **Conquistas** (badges)
5. **Diário** (entradas gerais, com tag de sefira)

### Proposta de estrutura — abas (mesmo padrão hub+N dos outros 8 módulos)

| Aba | Conteúdo | Origem |
|---|---|---|
| **Reino** (hub) | Score geral (ver "Score do Reino" abaixo) + "o que precisa de atenção agora", puxando de **todos** os módulos (hoje isso só existe espalhado: Chesed tem "precisam de atenção", Yesod tem "vence em 7 dias", Netzach tem badge "negligenciado", Hod tem "cliente sem sessão há 14 dias" — cada um só visível dentro do próprio módulo) | Novo |
| **Atividades** | Log cross-módulo de hábitos — ver "verdade" ou reflexo" abaixo — evolução do hub read-only do Tiphareth (`HUB_ADAPTERS`), mas como tela principal do módulo em vez de feature opcional, cobrindo os 8 módulos (não só 5) | Evolui o hub do Tiphareth |
| **Progresso** | Progresso por área (corrigido pra usar score real) + XP últimos 14 dias + top streaks | Migra do "Dash" |
| **Conquistas** | Badges | Migra do "Dash" |
| **Diário** | Reflexão pessoal — pode evoluir pra rotina dupla manhã/noite (Stoic-like) em vez de entrada solta, conforme já pesquisado no parecer de 14/08 | Migra do "Dash" + visão original de reflexão |
| **Config** | Toggle de quais módulos aparecem nas abas Reino/Atividades — mesmo padrão já validado no Tiphareth (todos desligados por padrão, ou já ligados por padrão dado que aqui é o propósito central do módulo, a decidir) | Novo |

### Score do Reino — o que ele representa
Diferente dos outros 8 módulos (cujo score vem do próprio domínio), o score do Reino faria mais sentido como a **média dos scores reais dos outros módulos** — a nota "vida como um todo", finalmente calculada certo (hoje nem existe um número assim em lugar nenhum do app; o mais perto é o "Nível"/XP total, que mistura tudo sem separar por área). Isso também resolveria de quebra o gap achado na varredura: Chokmah e Binah entrariam nessa média com o score real, não o genérico.

### Decisões de design em aberto — preciso da sua opinião antes de fechar
1. **Read-only ou read-write na aba Atividades?** Marcar um hábito de outro módulo como feito **dentro do Reino** — grava direto no módulo de origem (primeira vez no projeto que um módulo escreveria no `localStorage` de outro; mais complexo, mas resolve duplicação de verdade) ou só reflete visualmente e ao tocar leva pra tela de origem (mais simples, mesmo padrão já validado do Tiphareth, mas o usuário ainda faz 2 passos pra marcar)? **Recomendação:** começar read-only + deep-link (mesmo risco baixo do Tiphareth), read-write vira fase 2 se o read-only não for suficiente na prática.
2. **Diário de reflexão e painel de controle cabem nas mesmas abas, ou um vira secundário?** Hoje as duas ideias competem por "o que você vê primeiro ao abrir o Reino".
3. **A aba Atividades cobre os 8 módulos direto, ou só os que o usuário ligar (opt-in, como o Tiphareth)?** Dado que aqui é o propósito central do módulo (não uma feature bônus como no Tiphareth), talvez faça sentido nascer com todos ligados por padrão — mas isso é mais dado exposto de uma vez.
4. **O calendário/tarefas central (Opção A, já decidida em 15/08 — ver [[05 Roadmap]])** — vira uma aba própria aqui ("Tarefas"), ou fica dentro da aba Reino (hub)?

### Decisão 1 fechada e testada (18/08/2026) — bidirecional de verdade
Usuário respondeu à decisão 1: quer bidirecional real — criar/marcar em qualquer lado (Reino ou módulo de origem) reflete no outro, pros 8 módulos. Confirmado que dá pra fazer sem migrar o modelo de dado de ninguém: a escrita reaproveita as mesmas `*_ACTION_HANDLERS` que o Coach já usa em cada módulo (já respeitam a lógica de XP/score própria de cada um); a leitura segue o padrão já validado do `HUB_ADAPTERS` do Tiphareth.

**Protótipo construído e testado ao vivo no navegador** (`preview/src/MalkuthModule.jsx`, novo, módulo real e mínimo — só a aba Atividades, 3 módulos conectados: Yesod, Chesed, Geburah como caso difícil sem hábito genérico — wireado em `App.jsx` como `activeModule==="malkuth"`, roteado a partir do clique no nó "Reino" da árvore):
- **Reino → Yesod:** marcar "Registrar todos os lançamentos" dentro do Reino gravou `done:true` em `lifetree_fin_yhabits` de verdade (confirmado lendo o `localStorage`), creditou XP, e o hábito apareceu marcado ao abrir o módulo Yesod de verdade.
- **Yesod → Reino:** marcar "Revisar saldo das contas" dentro do próprio Yesod refletiu no Reino ao voltar pra lá, sem nenhum código de sincronização extra — o Reino sempre lê o `localStorage` real no render.
- Zero erro de console no fluxo funcionando (2 exceptions capturadas foram de uma tentativa anterior, com o nome errado da action — `toggle_habit` vs. o real `toggle_yhabit` do Yesod; corrigido).
- **Achado no processo:** os nomes de ação não são 100% padronizados entre módulos (Yesod usa `toggle_yhabit`, Chesed usa `toggle_habit`) — quem for estender pros outros 5 módulos precisa checar o nome exato em cada `*_ACTION_HANDLERS`, não assumir um padrão único.

Escopo deste protótipo é deliberadamente pequeno (1 aba, 3 módulos) — validar a direção antes de estender pros 8 módulos e construir as outras 5 abas (Progresso, Conquistas, Diário, Config, hub) da proposta completa acima.

### Estendido pros 8 módulos (19/08/2026)
Depois de fechar o rótulo "Controle" e o vale de estilo (ver seção anterior), pedido do usuário pra estender o mesmo mecanismo bidirecional pros 5 módulos que faltavam: Hod, Netzach, Tiphareth, Chokmah, Binah. `ACTIVITY_ADAPTERS` (em `preview/src/MalkuthModule.jsx`) agora cobre os 8:
- **Hod** — `carHabits` (hábitos de carreira), ação `toggle_car_habit`. Direto, mesmo padrão de Yesod/Chesed.
- **Chokmah** — `praticaHabits`, ação `toggle_habit`. Direto.
- **Netzach e Tiphareth** — os dois guardam 2 listas separadas sob uma única ação com parâmetro `area` (Netzach: `lazerHabits`/`larHabits`; Tiphareth: `aparenciaHabits`/`bemestarHabits`). Generalizou o `toggle` do adapter pra receber o item inteiro (não só o título) — assim ele pode repassar a área certa junto com o match por texto. Testado explicitamente nos dois sentidos e nas duas áreas de cada um (Reino→módulo e módulo→Reino, "lar" e "lazer" separadamente) pra garantir que o toggle não cruzava lista errada — sem erro.
- **Binah** — mesmo caso difícil do Geburah (não tem "hábito" simples; trilhas/tópicos são por nível, livros por status). Sintetiza "Leitura de hoje" a partir do `readingLog` (mesmo padrão do "Treino de hoje" do Geburah), read-only.

**Testado ao vivo no navegador**, numa origem nova (porta 5178, `localStorage` vazio) — abriu cada um dos 5 módulos pra semear o dado padrão, marcou um item dentro de cada módulo (módulo→Reino) e confirmou refletido no Reino sem sync extra; depois marcou 4 itens de volta dentro do Reino (Reino→módulo, incluindo "lar" e "lazer" do Netzach separadamente) e confirmou por leitura direta do `localStorage` que a lista certa foi escrita (`lifetree_hod_carHabits`, `lifetree_netz_lazerHabits`, `lifetree_netz_larHabits`) com o item certo marcado — não o vizinho. Zero erro de console. Achado: nenhuma inconsistência de nome de ação nova (diferente do achado do Yesod na primeira leva) — `toggle_habit`/`toggle_car_habit` bateram com o esperado de primeira.

Cobertura agora: 8/8 módulos reais na aba Atividades (Kether continua sem módulo próprio, não entra). Próximo passo, se o usuário quiser seguir, é uma das outras 5 abas da proposta completa (Reino/Progresso/Conquistas/Diário/Config) — nenhuma começada ainda.

### Riscos técnicos a considerar (achados na varredura de integrações de 15/08)
- Corrigir o bug do "Progresso por área" (score genérico em vez do real) ao migrar, não só mover o código como está.
- Se a aba Atividades cobrir os 8 módulos, precisa de adapter novo pra Chokmah e Binah (o `HUB_ADAPTERS` do Tiphareth não tem os dois — outro gap já mapeado, mesma correção serve pros dois lugares).
- Se decidir por read-write (decisão 1), é preciso respeitar a lógica de score/XP própria de cada módulo de origem ao escrever — não é só "marcar `done:true`", cada módulo calcula o próprio score de um jeito diferente.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[05 Roadmap]]
