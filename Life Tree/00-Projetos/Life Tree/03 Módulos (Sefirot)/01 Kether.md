---
tags: [lifetree, modulo, kether]
aliases: [Kether]
---

# 🔑 Kether — Desejo

> Status: 🟡 Protótipo. `preview/src/KetherModule.jsx` existe e está wireado em `App.jsx` (nó "Desejos" da árvore) — cobre metas cross-módulo com sincronização bidirecional (mesmo padrão do Controle/Malkuth, mas pro lado das metas). Construído e testado ao vivo em 19–20/08/2026. Histórico: até 18/08/2026 o módulo era genuinamente vazio (`modules/kether-desejos/src/` sem código, confirmado em 28/07/2026) — as seções abaixo documentam essa evolução na ordem em que aconteceu.

## O que existia antes (histórico)
Nada além da estrutura de pasta e do mapeamento em [[03 Módulos (Sefirot)]] (cor `#06b6d4`, areaId `desejos`). Existia uma lista de desejos genérica (título + custo em moedas) dentro do hub, na aba "Status" de `App.jsx` — **removida em 19/08/2026** junto com toda a camada de RPG do hub (moedas, nível/XP global, a própria lista de desejos), ver seção "Camada de RPG removida" abaixo.

## Visão do usuário (09/08/2026) — superseded
Planos e desejos futuros — "centro do esquema de recompensas do app inteiro". Essa visão original (Kether como hub de recompensas, gastando XP/moedas globais) foi **substituída** em 19/08/2026 pela proposta concreta abaixo, depois que o Controle/Malkuth (18–19/08) provou o padrão de sincronização bidirecional e o usuário propôs aplicar a mesma lógica pro lado das metas.

## Proposta e implementação (19–20/08/2026) — "Desejo cuida das metas, assim como o Controle cuida dos hábitos"

Pedido do usuário: mesma arquitetura do Controle/Malkuth, mas para metas em vez de hábitos — com um adicional específico do Kether: um **desejo** (ex: "morar na Itália") deve poder **derivar metas concretas em módulos impactados** (ex: "aprender Italiano" no Binah/Conhecimento, "poupança de mudança" no Yesod/Finanças, "emprego na Itália" no Hod/Profissional), criadas de verdade nesses módulos ao salvar o desejo — não só uma lista solta dentro do Kether.

### Duas peças, arquitetura diferente cada uma

**1. Aba "Metas" — agregação bidirecional (mesmo padrão do Controle)**
Só 3 módulos entraram aqui: **Yesod** (`ygoals`), **Hod** (`carGoals`), **Tiphareth** (`goals`, com campo `area` interno — diferente dos hábitos de Netzach/Tiphareth, aqui é uma lista única, não duas, então não precisou do parâmetro `area` no toggle). Os outros 5 módulos não têm um conceito de "meta" com `done` booleano limpo (ver levantamento abaixo) — ficam de fora da agregação com toggle, mas entram na segunda peça.

| Módulo | Conceito mais próximo | Fit pra monitoramento com toggle |
|---|---|---|
| Yesod | `ygoals` — meta financeira, `{title,xp,done}` | ✅ Bom |
| Hod | `carGoals` — objetivo de carreira, `{title,prazo,xp,done}` | ✅ Bom |
| Tiphareth | `goals` — meta de aparência/bem-estar, `{title,area,xp,done}` | ✅ Bom |
| Netzach | `experiencias` — bucket list, status `sonho→planejando→agendado→feito` (não booleano) | 🟡 Fraco — usado só na peça 2 |
| Chokmah | `tradicoes` — prática explorada, status `explorando/praticando/pausado` | 🟡 Fraco — usado só na peça 2 |
| Binah | `tracks` — trilha de competência, sem status de conclusão | 🟡 Fraco — usado só na peça 2 |
| Geburah, Chesed | Nada parecido com meta | 🔴 Fora — nem a peça 2 cobre |

**2. "Desejos" — lista própria do Kether, com derivação**
`lifetree_keth_desejos` (novo, só do Kether — os outros módulos não sabem que um desejo existe, só recebem a meta derivada como se tivesse sido criada normalmente). Cada desejo guarda `{id, title, createdAt, metasDerivadas:[{moduleId,title}]}`. Ao criar um desejo com metas derivadas, o Kether chama a ação de criação de cada módulo alvo (as mesmas `*_ACTION_HANDLERS` que o Coach já usa):

| Módulo alvo | Ação de criação | Vira |
|---|---|---|
| Yesod | `create_ygoal({title})` | Meta financeira real |
| Hod | `create_car_goal({title})` | Objetivo de carreira real |
| Tiphareth | `create_goal({title,area:"bemestar"})` | Meta de bem-estar real |
| Netzach | `create_experiencia({titulo})` | Experiência/bucket-list real, status inicial "sonho" |
| Chokmah | `create_tradicao({nome})` | Tradição real, status inicial "explorando" |
| Binah | `create_track({name})` | Trilha de competência real, vazia |

Progresso de cada meta derivada dentro do card do desejo: pros 3 módulos com meta "de verdade" (Yesod/Hod/Tiphareth), checkbox tocável, escreve direto no módulo de origem (mesmo padrão do Controle). Pros outros 3, só leitura do status atual do próprio módulo (badge, sem toggle) — não tem "concluído" bem definido pra experiência/tradição/trilha.

### Testado ao vivo no navegador (19–20/08/2026)
Réplica exata do exemplo do usuário: desejo "Morar na Itália" com 3 metas derivadas — "Poupança de mudança" (Yesod), "Emprego na Itália" (Hod), "Aprender Italiano" (Binah). Confirmado por leitura direta do `localStorage`: as 3 foram criadas de verdade em `lifetree_fin_ygoals`, `lifetree_hod_carGoals` e `lifetree_binah_tracks`. Testado nos dois sentidos pras 2 com toggle: marcar "Poupança de mudança" e "Emprego na Itália" dentro do Kether refletiu no Yesod/Hod reais; desmarcar "Emprego na Itália" dentro do próprio Hod refletiu de volta no Kether sem sync extra, tanto na aba Metas quanto dentro do card do desejo. Zero erro de console.

### Achado no processo — bug real corrigido de quebra
A lista "SEFIROT → ÁREAS" do Config sempre abria a página genérica de área (`AreaPage`, já removida — ver abaixo), mesmo pros 9 sefirot que já tinham módulo de verdade — só a árvore principal roteava certo. Consolidado numa função só (`goToSefira`), usada pelos dois lugares agora — clicar em qualquer sefirá no Config abre o módulo real, igual clicar na árvore.

## Camada de RPG do hub removida (19/08/2026)
Pedido do usuário, na mesma sessão: já que Controle/Malkuth cobre hábitos e Desejo/Kether cobre metas — dos módulos reais —, a lista de desejos genérica do hub (título + custo em moedas) e os elementos de "evolução de RPG" (moedas, nível/XP global) perderam sentido. Removidos de `App.jsx`:
- **Moedas + nível/XP global** — estado (`coins`,`xp`,`lvl`/`getLevel`/`LVL_T`/`LVL_N`), badge do header, barra de XP abaixo do header, card de nível na aba "Status", "Jornada de Níveis".
- **Lista de desejos genérica** — `wishes`, modal "Novo Desejo", resgate (`doRedeem`).
- **Aba "Status" inteira** do carrossel — só tinha os 3 blocos acima, ficou vazia depois da remoção. Carrossel voltou a ter só "Árvore" (`TREE_SLIDES`).
- **Abas "Hábitos"/"Metas" genéricas do hub** (nav inferior) — usuário confirmado explicitamente depois de eu flagar que a remoção levava junto 5 funcionalidades reais que só existiam ali: **Pomodoro** (timer de foco por hábito), **lembretes** (hora/minuto por hábito), **sub-tarefas** (checklist dentro de um hábito), **marcos** (milestones dentro de uma meta, com XP próprio) e **calendário/heatmap** por hábito. Nenhuma tinha equivalente em módulo real — ficam registradas aqui como funcionalidade perdida, candidatas a recriar dentro dos módulos reais (ou do Controle/Desejo) se fizerem falta na prática.
- **Sistema de conquistas** (`BADGES`/`checkBadges`/popup de badge) — lia só o hábito/meta/XP genérico do hub, junto com o resto.

O que **ficou**: `diary` (diário — independente, sem relação com XP/hábitos), Config (edição de área/subárea, backup/restaurar), score financeiro manual (relocado do `AreaPage` removido pra dentro do Config), e os 2 widgets que não dependiam de nada disso (`finscore`,`diario`).

## Ver também
- [[03 Módulos (Sefirot)]]
- [[10 Malkuth]] — mesmo padrão arquitetural, pro lado dos hábitos
- [[05 Roadmap]]
- [[04 Bugs Conhecidos]]
