---
tags: [lifetree, arquitetura, plano, refactor]
aliases: ["Plano de Decomposição", "Quebra dos Monólitos"]
---

# 🧩 Plano de Decomposição — Arquivos Monolíticos

> Pedido pelo usuário em 12/08/2026, depois de resolver os gaps funcionais do Geburah: "quanto ao item 9 [arquivo monolítico], acredito que seria importante avaliar no app como um todo. traga um plano de execução em como quebrar essa estrutura para evitar complicações futuras." Este é um **plano**, não uma implementação — nada abaixo foi executado nesta leva, exceto os dois itens já concluídos no Geburah que servem de prova de conceito (ver [[05 Geburah]]).

## Por que agora, e por que não agora

Já era item P2 do [[05 Roadmap]] ("quebrar App.jsx/GeburahModule.jsx em subcomponentes"), fase "4 — Fundação técnica" — ou seja, o próprio roadmap já colocava isso **depois** de completar os módulos, não antes. Este plano não muda essa priorização; documenta a estratégia pra quando a decisão de atacar for tomada, e resolve desde já as duas peças que eram simples o bastante pra não esperar (ver "O que já foi feito" abaixo).

## Estado real, medido (12/08/2026)

Linhas por arquivo (`Get-Content | Measure-Object -Line`):

| Arquivo | Linhas | Observação |
|---|---|---|
| `GeburahModule.jsx` | 2572 | maior módulo — ~29% é dado estático (biblioteca de exercícios + banco de alimentos) |
| `App.jsx` | 2535 | hub — árvore, hábitos, metas, diário, coach, backup, todos num arquivo |
| `HodModule.jsx` | 1615 (1859 em 13/08/2026, após fechar os gaps do módulo — ver [[08 Hod]]) | trilhas de competência + motor de projetos + CRM embutido |
| `YesodModule.jsx` | 1133 | mais compacto apesar de ter o maior número de ações de Coach (42) |
| `ChesedModule.jsx` | 806 (915 em 13/08/2026, após fechar os gaps do módulo — ver [[04 Chesed]]) | |
| `TipharethModule.jsx` | 596 (828 em 13/08/2026, após fechar os gaps do módulo — ver [[06 Tiphareth]]) | |
| `NetzachModule.jsx` | 473 (551 em 13/08/2026, após fechar os gaps do módulo — ver [[07 Netzach]]) | |

Achados de arquitetura confirmados por leitura direta + lint (`react-hooks/static-components`), não suposição:

1. ~~**Componentes de aba recriados a cada render**~~ ✅ **corrigido nos 6 módulos** (`const XTab = () => {...}` definido dentro do componente do módulo, renderizado como `<XTab/>`) — Geburah (8 ocorrências, 12/08/2026), Tiphareth (6, incluindo `WidgetCustomizer`), Chesed (6) e Netzach (5), todos 13/08/2026 (ver [[05 Geburah]] → "Acompanhamento de treino ao vivo", [[06 Tiphareth]], [[04 Chesed]], [[07 Netzach]] e [[04 Bugs Conhecidos]]). O Hod tinha uma variante — `renderTab()`/`renderPage()` retornavam `<HodTab/>` etc, o que a contagem de `react-hooks/static-components` não pega (a regra só olha JSX direto no corpo do componente, não o que uma função auxiliar retorna) — corrigido em 13/08/2026, ver [[08 Hod]] e [[04 Bugs Conhecidos]]. **Só Yesod nunca teve o problema** (usa o padrão IIFE seguro, chamado direto). **Lição que valeu a pena registrar:** não confiar só na contagem de lint ao avaliar um módulo novo — procurar também funções que `return <X/>` em vez de só `<X/>` inline (foi o caso do Hod).
2. ~~**Tema global mutável**~~ ✅ **corrigido nos 6 módulos** (`let C` reatribuído no render em vez de `const C` local) — Yesod e o hub já usavam o padrão correto desde antes; Geburah (12/08/2026), Hod, Tiphareth, Chesed e Netzach corrigidos em 13/08/2026. Ver [[04 Bugs Conhecidos]].
3. **~29% do `GeburahModule.jsx` é dado estático sem nenhuma lógica** — `D_EX_MUSC` (154 linhas), `D_EX_ARTES` (124 linhas), `D_AL` (419 linhas, banco de alimentos), `D_ROT`/`D_REC` (~30 linhas) = **~730 das 2572 linhas**. Os outros módulos provavelmente têm o mesmo padrão em proporção menor (rotinas padrão, seeds de hábito, etc.) — não medido linha a linha nesta leva.
4. **Kit de UI compartilhado duplicado por arquivo** — `Sheet`, `FI`, `FTA`, `FS`, `Card`, `Bar`, `Btn`, `Badge`, `Ico`/`IC` (ícones SVG) são reimplementados quase identicamente em cada um dos 6 módulos (~100-150 linhas cada), em vez de um único módulo compartilhado. `usePersisted` (hook de persistência por chave) também está duplicado por módulo com pequenas variações de nome de prefixo.
5. **Sem code splitting** — `App.jsx` importa os 6 `*Module.jsx` no topo do arquivo (`import YesodModule from "./YesodModule.jsx"` etc.), então quem abre só a Árvore já baixa o bundle inteiro dos 6 módulos. Item A1/P1 do [[10 Segurança, Mobile e Performance]], não repetido aqui em detalhe.

## O que já foi feito (Geburah 12/08 + Hod, Tiphareth, Chesed e Netzach 13/08/2026) — itens 3 e 4 concluídos nos 6 módulos

Os dois problemas acima foram resolvidos nos **6 módulos** — os itens 3 e 4 do sequenciamento abaixo estão concluídos:

- **Tema mutável → `React.createContext`** (`ThemeCtx`, criado uma vez no topo do arquivo; `Sheet`/`FI`/`FTA`/`FS`/`Card`/`ProgressBar`/`Bar` ficam em escopo de módulo lendo `useContext(ThemeCtx)`; o componente do módulo calcula `const C` local e monta `<ThemeCtx.Provider value={C}>` uma vez, envolvendo o JSX retornado). Detalhe em [[05 Geburah]], [[08 Hod]], [[06 Tiphareth]], [[04 Chesed]] e [[07 Netzach]], cada um em "Padrão de tema". No Hod apareceu uma variação: um helper de módulo (`chipStyle`) lia `C` fora de qualquer componente — resolvido passando `C` como parâmetro em vez de Context. No Tiphareth apareceu outra: **dois** pontos de `return` (tela de carregamento + tela principal) precisavam do Provider, não só um. No Chesed havia uma camada de indireção já pronta (`useTheme()`) — só precisou trocar o que ela retorna. No Netzach, nenhuma indireção existia — os componentes de UI compartilhada ganharam `useTheme()` do zero.
- **Componentes de aba recriados → hoist de estado + chamada como função, não JSX** (`{tab==="x" && XTab()}` em vez de `{tab==="x" && <XTab/>}`; qualquer `useState` que morava dentro do Tab sobe pro componente do módulo). No Geburah precisou hoisting de estado (`TreinoTab`/`NutriTab` tinham `useState` próprio); **em Hod, Tiphareth, Chesed e Netzach não precisou** — nenhum Tab/Page/Sheet tinha estado próprio, foi só trocar `<X/>` por `X()` nos pontos de despacho. Detalhe em [[05 Geburah]] → "Acompanhamento de treino ao vivo", [[08 Hod]], [[06 Tiphareth]], [[04 Chesed]], [[07 Netzach]] e [[04 Bugs Conhecidos]].

Essas duas correções, por módulo, foram de risco baixo e mecânicas — não exigiram redesenhar nada, só aplicar o mesmo padrão já validado no Geburah, com o cuidado extra de verificar `useState` interno (só o Geburah tinha), helpers de módulo fora do componente que leem `C` por closure (só o Hod tinha), e quantos pontos de `return` existem (só o Tiphareth tinha dois). Com os 6 módulos corrigidos, os itens 3 e 4 do sequenciamento abaixo estão riscados — restam os itens 1, 2, 5 e 6, nenhum começado ainda.

## Princípios do plano (evitar complicações futuras)

1. **Extrair dado antes de extrair lógica.** Mover arrays estáticos (`D_EX_MUSC`, `D_AL`, seeds de hábito/rotina) pra arquivos próprios é uma mudança quase sem risco — é `import` no lugar de literal inline, o array em si não muda. Fazer isso primeiro em todos os módulos, antes de qualquer split de componente, porque já corta uma fatia grande dos arquivos maiores sem tocar em lógica nenhuma.
2. **Consolidar o kit de UI compartilhado antes de fatiar cada módulo.** Um único `shared/ui.jsx` (ou pasta `shared/ui/`) com `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar`/`Btn`/`Badge`/`Ico` parametrizados por tema via Context (mesmo padrão do Geburah) elimina a duplicação em 6 lugares de uma vez só — e vira a base que todo split subsequente usa, em vez de cada módulo levar sua própria cópia pro arquivo novo.
3. **Corrigir tema mutável e componentes recriados ANTES de fatiar** cada módulo, não depois — fatiar um arquivo que ainda tem esses dois bugs só espalha o problema por mais arquivos, dificultando aplicar a correção depois (mais call sites pra revisar, dependências cruzadas entre arquivos novos).
4. **Um módulo por vez, cada um é um PR fechado e testável sozinho** — nunca uma leva "quebra tudo de uma vez". Sequência sugerida abaixo por risco/tamanho, não por importância do módulo.
5. **Sem mudar contrato de props.** `onBack`, `dark`, `setDark` continuam exatamente como `App.jsx` já espera (ver `LifeTree/CLAUDE.md`) — a decomposição é interna a cada módulo, `App.jsx` não muda nenhuma chamada de `<XModule .../>` por causa disso.
6. **Sem criar dependência circular.** Sub-arquivos de um módulo (`geburah/data.js`, `geburah/TreinoTab.jsx`) podem importar de `shared/`, nunca de `App.jsx` nem de outro módulo — os módulos já não se importam entre si hoje, isso não pode regredir.
7. **Lint como rede de segurança, não suposição.** Rodar `react-hooks/static-components` e `react-hooks/purity` depois de cada etapa (foi assim que o hoist do Geburah foi validado) — qualquer split de componente que reintroduza o padrão "função definida dentro de função, renderizada como JSX" é pra ser pego pelo lint antes do browser.
8. **Verificação no navegador depois de cada módulo**, igual já é praxe nesta sessão — persistência sobrevivendo a reload, tema claro/escuro, Coach (se o módulo tiver `actions:true`), abas mantendo estado.

## Itens 1 e 2 concluídos (21/08/2026)

Executados a pedido do usuário, na ordem que o plano já recomendava — dado estático primeiro, depois kit de UI compartilhado, ambos antes de qualquer fatiamento de arquivo (item 5, ainda não iniciado).

**Item 1 — dado estático extraído dos 8 módulos** pra arquivos próprios (`geburah/`, `hod/`, `chesed/`, `tiphareth/`, `yesod/`, `netzach/`, `chokmah/`, `binah/`), import no lugar do literal inline. Onde um array de seed referenciava uma constante do módulo (`ACCENT`, paletas de cor) só usada ali, o valor foi inlined como literal no arquivo novo — a constante em si ficou no módulo porque também é usada em lógica de runtime (ex: `TRACK_PALETTE` do Hod/Binah, pra colorir trilhas criadas depois). Um achado no processo: a primeira tentativa (rodada num fork em paralelo à leva de UI, sem coordenação — ver nota abaixo) esqueceu a palavra `export` em 2 arquivos novos, quebrando o build; corrigido antes de seguir.

| Módulo | Linhas antes | Linhas depois | Dado extraído |
|---|---|---|---|
| Geburah | 2590 | 1795 | Biblioteca de exercícios (286 itens), banco de alimentos (376), rotinas/receitas padrão — 3 arquivos, 729 linhas |
| Hod | 1869 | 1671 | Trilhas/metas/hábitos/conquistas/projetos/marca — 1 arquivo, 95 linhas |
| Yesod | 1151 | 1138 | Bancos/contas/cartões/caixinhas/dívidas/categorias de investimento — 1 arquivo, 15 linhas |
| Tiphareth | 1011 | 890 | Hábitos de aparência/bem-estar/rotinas/metas/produtos — 1 arquivo, 35 linhas |
| Chesed | 916 | 803 | Pessoas/datas/registros/hábitos — 1 arquivo, 24 linhas |
| Chokmah | 623 | 532 | Hábitos de prática/tradições — 1 arquivo, 10 linhas |
| Binah | 614 | 527 | Trilhas de estudo/livros — 1 arquivo, 12 linhas |
| Netzach | 566 | 462 | Hobbies/hábitos de lazer e lar/tarefas/experiências — 1 arquivo, 27 linhas |

**Item 2 — kit de UI compartilhado** (`shared/ui.jsx` + `shared/uiBind.jsx`) — `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar`/`Btn`/`Badge`, antes duplicados quase idênticos em 7 dos 8 módulos (todos exceto Yesod, que já passava `C` como prop em vez de usar Context — ficou de fora desta leva, não migrado). Achado real antes de migrar: não era uma implementação só, eram **duas linhagens visuais** quase iguais (Geburah/Hod/Tiphareth/Netzach com radius 9px/padding "9px 12px"/transição .5s vs. Chesed/Chokmah/Binah com radius 10-11px/padding maior/transição .8s cubic-bezier/cursor "not-allowed" em botão desabilitado/`<select>` com `appearance:none`) — escolhida a segunda, mais recente e refinada, como padrão único. Nenhuma prop funcional foi perdida (`wide` do Sheet, `hint`/`max`/`step` do FI, `onClick` do Card, `disabled` do Btn — todos preservados como opcionais); um bug real do Hod (`ProgressBar` sem clamp, podia passar de 100% ou ficar negativo) foi corrigido de quebra. `bindThemeContext(ThemeCtx, ACCENT)` liga o kit ao Context e ao accent de cada módulo sem mudar nenhum call site existente — só a definição local dos 8 componentes virou uma linha de import + uma linha de binding.

Testado ao vivo no navegador nos 7 módulos migrados (Sheet com portal, FI com o hint do Geburah, Card/Bar/Btn com a cor certa por módulo) — zero erro de console. `npm run build`/`eslint` limpos (só o ruído pré-existente de sempre). Bundle final caiu de ~1019KB pra ~995KB só com a deduplicação.

> ⚠️ **Achado de processo, não do código:** a pesquisa de dado estático (item 1) foi delegada a um agente em paralelo à pesquisa de UI (item 2); o agente de dado excedeu o escopo pedido (só sobrevoar e reportar) e foi direto editar 3 módulos (Hod/Chesed/Tiphareth), incluindo o bug de `export` faltando. Nada foi perdido — revisado, corrigido e testado igual ao resto —, mas fica registrado: delegar execução de edição em paralelo à própria edição do mesmo arquivo é risco real de colisão, evitado aqui só porque as edições dos dois lados miraram regiões diferentes do arquivo.

## Item 5 concluído no Geburah (22/08/2026)

O levantamento de dependências (feito por um agente em modo estritamente leitura, antes de qualquer edição — lição do incidente do item 1 aplicada aqui) revelou o fatiamento sugerido acima como otimista: as 6 abas compartilham ~30 pedaços de estado/computed, e 15 sheets (modais) vivem soltos no shell, gateados só por `sh===`, sem pertencer a nenhuma aba especificamente. Duas mudanças de desenho em relação ao esboço original:

- **`GebTab` (dashboard) ficou no shell**, não foi extraída — é o agregador que toca ~35 identificadores de todos os domínios; extrair significaria ou uma lista de props enorme e frágil, ou mover todos esses computeds junto (quebrando as outras abas que também precisam deles).
- **`geburah/context.js` (`GeburahCtx`)** — as outras 5 abas (Treino, Nutrição, Planejamento, Medidas, Config) + `LogTreinoPage` + as 15 sheets viraram componentes de módulo de verdade (`export function TreinoTab()`, importados e renderizados como `<TreinoTab/>`), lendo o estado compartilhado via `useContext(GeburahCtx)` em vez de props individuais. O shell monta um único objeto de contexto com tudo que é genuinamente cross-tab (f/sh/toast/openSh, estado de treino/nutrição/medidas/planejamento, scores). Efeito colateral bom: como as abas agora têm identidade estável (não são mais recriadas a cada render do shell), o estado que só existia hoisted no shell pra sobreviver a esse remount (`medExpanded`, `fotos`, `treinoSv`, `bibGrupo`, `timerAtivo`, `nowTick` etc.) voltou a ser `useState` local normal dentro de cada aba — reduz a superfície do Context em vez de aumentá-la.

Também extraídos pro shell reutilizar: `geburah/theme.js` (ThemeCtx + paleta + kit de UI ligado ao Context — existir num arquivo à parte evita import circular entre o shell e as abas), `geburah/constants.js`, `geburah/helpers.js`, `geburah/icons.jsx`.

| Arquivo | Linhas |
|---|---|
| `GeburahModule.jsx` (shell) | 1795 → **527** |
| `geburah/TreinoTab.jsx` (+ LogTreinoPage + 4 sheets) | 385 |
| `geburah/NutriTab.jsx` (+ 4 sheets) | 368 |
| `geburah/MedidasTab.jsx` (+ 3 sheets) | 303 |
| `geburah/ConfigTab.jsx` (+ 3 sheets) | 106 |
| `geburah/PlanejamentoTab.jsx` (+ 1 sheet) | 90 |
| `geburah/context.js` / `theme.js` / `constants.js` / `helpers.js` / `icons.jsx` | 14 / 25 / 41 / 75 / 39 |

Testado ao vivo no navegador: as 6 abas, `LogTreinoPage` (timer de descanso + relógio ao vivo + sugestão de PR), múltiplos sheets (incluindo o fluxo completo de registrar refeição com porção personalizada), tema claro/escuro em todas as abas migradas, e persistência entre reload — zero erro de console. `npm run build`/`eslint` limpos (só o mesmo ruído pré-existente de sempre — `react-hooks/static-components` em padrões de componente-dentro-de-função que já existiam no arquivo original, não introduzidos por este split). Um bug real foi pego e corrigido no processo: 3 sheets de Nutrição (`AddAlimento`/`AddRefeicao`/`AddIngrediente`) tinham cores de tema hardcoded como literal light-mode (`#8a5a5a`) em vez de ler `C` do Context — teria quebrado dark mode nesses três modais especificamente; corrigido antes de testar.

## Item 5 concluído no Hod (22/08/2026)

O mesmo processo (fork em modo leitura primeiro, depois split) foi repetido pro Hod — mas o levantamento aqui trouxe uma notícia boa em vez de uma complicação: **nenhuma aba/página do Hod tinha estado local próprio** antes do split (confirmado por leitura direta) — o anti-padrão "componente recriado a cada render" já tinha sido corrigido só com hoist de *função* (`X()` em vez de `<X/>`), sem precisar hoist de *estado*, porque nunca houve `useState` dentro de nenhum Tab/Page. Isso eliminou a etapa mais delicada do Geburah (devolver estado hoisted pra dentro de cada aba) — aqui o Context só precisou ser aditivo.

Segunda diferença em relação ao Geburah: **a dashboard (`HodTab`) PÔDE ser extraída**, ao contrário do `GebTab` do Geburah. `HodTab` toca só ~11 identificadores (contra ~35 do Geburah) porque os scores por domínio (`carScore()`, `projetosScore()`, `marcaScore()`, `hodScore()`) já eram funções prontas — bastou incluí-las no `HodCtx` como mais um valor do Context, em vez de precisar recomputar dezenas de valores derivados espalhados pela dashboard.

Estrutura final: `hod/HodTab.jsx` (dashboard, extraída), `hod/CarreiraTab.jsx` (+ 9 sheets + o modal de conquista, que não é gated por `sh` — dispara direto quando `pendingAch` está setado, de qualquer aba), `hod/ProjetosTab.jsx` (+ `ProjectPage` + 7 sheets), `hod/ClientPage.jsx` (+ 5 sheets), `hod/MarcaTab.jsx` (+ 6 sheets), `hod/ConfigTab.jsx` (sem sheets próprios — reabre os mesmos sheets das outras abas).

| Arquivo | Linhas |
|---|---|
| `HodModule.jsx` (shell) | 1768 → **309** |
| `hod/ProjetosTab.jsx` (+ ProjectPage + 7 sheets) | 462 |
| `hod/CarreiraTab.jsx` (+ AchievementPrompt + 9 sheets) | 343 |
| `hod/MarcaTab.jsx` (+ 6 sheets) | 201 |
| `hod/ClientPage.jsx` (+ 5 sheets) | 150 |
| `hod/ConfigTab.jsx` | 97 |
| `hod/HodTab.jsx` | 87 |
| `hod/context.js` / `theme.js` / `constants.js` / `helpers.js` / `icons.jsx` | 11 / 15 / 99 / 85 / 45 |

Testado ao vivo no navegador: as 5 abas, navegação `ProjetosTab → ProjectPage → ClientPage → voltar` (incluindo o caso especial de `back()` que pula de cliente direto pro projeto, não pra lista), o fluxo completo de editar uma habilidade até 100% → disparar o modal de conquista → registrar (prova de que um side-effect cross-arquivo via Context funciona: `EditSkillSheet` em `CarreiraTab.jsx` chama `setPendingAch`, o shell renderiza `AchievementPrompt` — também em `CarreiraTab.jsx` — independente de qual aba está ativa), e tema claro/escuro em todas as abas — zero erro de console. `npm run build`/`eslint` limpos (só o mesmo ruído pré-existente de sempre). Dois bugs pequenos pegos e corrigidos no processo, mesma categoria do bug do Geburah: 2 sheets (`EditSkillSheet` em Carreira, `EditPillarsSheet` em Marca) tinham `color:"var(--muted)"` — um resquício de outro padrão, nunca funcional neste codebase — em vez de ler `C.muted` do Context; e `EditProjectSheet` tinha uma cor light-mode hardcoded (`#8a5a2e`). Nenhum dos três tinha chegado a ser testado em dark mode antes da correção.

## Sequenciamento recomendado

| Ordem | O quê | Módulos | Risco | Por quê nessa posição |
|---|---|---|---|---|
| 1 | ~~Extrair dado estático pra arquivos próprios~~ | ✅ **concluído em 21/08/2026** — Geburah, Hod, Chesed, Netzach, Tiphareth, Yesod, Chokmah, Binah (8/8 módulos, incluindo os 2 construídos depois deste plano) — ver seção acima | Muito baixo — puro `import`, zero mudança de comportamento, confirmado | — |
| 2 | ~~Consolidar kit de UI compartilhado (`shared/ui/`)~~ | ✅ **concluído em 21/08/2026** — 7 dos 8 módulos (todos exceto Yesod, que já usava outro padrão — prop `C` explícita, não Context — e ficou de fora desta leva) — ver seção acima | Baixo-médio — muda import, não a API dos componentes, confirmado | — |
| 3 | ~~Corrigir tema mutável (`let C`) restante~~ | ✅ **concluído** — Geburah, Hod, Tiphareth, Chesed, Netzach (13/08/2026) | Baixo — padrão mecânico já provado 5x | — |
| 4 | ~~Corrigir componentes de aba recriados~~ | ✅ **concluído** — Geburah, Hod, Tiphareth, Chesed, Netzach (13/08/2026) | Baixo — padrão mecânico já provado 5x | — |
| 5 | ~~Fatiar módulos grandes em subarquivos por domínio~~ | ✅ **Geburah e Hod concluídos em 22/08/2026** (ver seções acima) — App.jsx ainda não iniciado | Médio — exigiu desenho novo (`GeburahCtx`/`HodCtx`), não só threading mecânico de props como o esboço original previa. Hod acabou mais simples que o Geburah na prática (sem estado local pra devolver às abas, dashboard pôde ser extraída) | Só depois que dado e UI compartilhada já não estão mais duplicados dentro do arquivo a fatiar |
| 6 | Code splitting (`React.lazy`) dos 6 módulos em `App.jsx` | App.jsx | Baixo, mas só compensa depois do item 5 | Lazy-load de um arquivo que ainda é 2500+ linhas ajuda pouco; o ganho real vem depois de já ter reduzido o bundle de cada módulo |

**Itens 1-4 são mecânicos e replicáveis** (o Geburah já é a referência viva pros itens 3 e 4). **Item 5 é o único que exige desenho novo por módulo** — como fatiar cada um depende da forma específica das abas/estado de cada um (ex: Geburah tem Treino/Nutrição/Medidas bem separados; Hod tem trilhas+projetos+CRM mais entrelaçados). Sugestão de fatiamento pro Geburah especificamente, como exemplo concreto (não vale 1:1 pros outros):

```
GeburahModule.jsx        (shell: state, ThemeCtx, hub, roteamento de abas)
geburah/exerciseLibrary.js   (D_EX_BASE/D_EX_MUSC/D_EX_ARTES — dado puro)
geburah/foodLibrary.js       (D_AL — dado puro)
geburah/defaultRoutines.js   (D_ROT/D_REC — dado puro)
geburah/TreinoTab.jsx        (+ LogTreinoPage, já usam ThemeCtx via shared/ui)
geburah/NutriTab.jsx
geburah/MedidasTab.jsx
geburah/PlanejamentoTab.jsx
geburah/ConfigTab.jsx
```

## O que este plano NÃO cobre

- **Quando executar** — isso é decisão do usuário, não deste plano (o roadmap já colocava em "Fase 4 — Fundação técnica", depois dos módulos ausentes). Este documento só existe pra quando a decisão for tomada, a execução não pise em complicação evitável.
- **App nativo / PWA** — coberto em [[10 Segurança, Mobile e Performance]] e [[05 Roadmap]], não repetido aqui.
- **Testes automatizados** — P3 do roadmap, ortogonal a este plano (decompor sem testes é mais arriscado, mas cobrir isso é decisão separada).

## Ver também
- [[05 Geburah]], [[08 Hod]], [[06 Tiphareth]] — prova de conceito dos itens 3 e 4 do sequenciamento (3 módulos já feitos)
- [[04 Bugs Conhecidos]] — status atual de tema mutável e componentes recriados por módulo
- [[05 Roadmap]] — Fase 4, item P2
- [[02 Arquitetura]]
