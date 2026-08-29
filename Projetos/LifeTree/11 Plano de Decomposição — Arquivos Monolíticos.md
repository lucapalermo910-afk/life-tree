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

## Atualização (26/08/2026) — Yesod cresceu 70% numa sessão só, ainda fora do item 2 e sem o item 5

A leva de despesas divididas bidirecionais (a receber/a pagar, modo de acerto conta-a-conta/líquido por pessoa) levou `YesodModule.jsx` de **1138 pra 1985 linhas** — maior salto de uma sessão só neste arquivo desde que a tabela acima começou a ser medida. Yesod segue sendo o único módulo que ficou de fora do item 2 (kit de UI compartilhado, `shared/ui.jsx` — usa `C` como prop em vez de Context, nunca migrado) e não teve o item 5 (fatiamento em subarquivos) sequer iniciado, ao contrário de Geburah (2572→527) e Hod (1869→309), já fatiados. Análise completa de qualidade de código/UX/performance dessa sessão, com achados específicos, em [[04 Bugs Conhecidos]] → "Yesod — auditoria de código, UX e performance (26/08/2026)"; itens priorizados por severidade em [[05 Roadmap]].

Não muda a lógica do plano (ainda vale "não fatiar enquanto a superfície do produto muda") — mas o gap entre Yesod e os módulos já fatiados está aumentando, não estabilizando, o que vale considerar quando a ordem do item 5 for revisitada.

## Plano pro Yesod (26/08/2026) — levantamento concluído, PLANO, nada executado

> Pedido do usuário depois de fechar a leva de bugs P6-P10 (ver [[04 Bugs Conhecidos]]): "monte esse plano de decomposição pro Yesod". Mesmo processo já provado no Geburah/Hod — levantamento de dependências por um agente em modo estritamente leitura, **antes** de qualquer linha de código mudar (mesma lição do incidente do item 1 registrado acima: nunca delegar leitura e edição em paralelo). `YesodModule.jsx` está em **2050 linhas** no momento deste levantamento. Nada abaixo foi implementado — é a mesma natureza deste documento como um todo, um plano de execução, não uma execução.

### Duas boas notícias e uma diferença real em relação ao Geburah/Hod

**Boa notícia 1 — sem estado pra hoisting.** Nenhum `useState` foi encontrado dentro de nenhuma das funções de aba renderizadas inline (`YesodTab`, `FluxoTab`, `FluxoCaixaView`, os `InlineBlock` de sub-página, `GoalsTab`) — toda variável local dentro delas é `const` derivado de estado de fora. **Mesma situação do Hod, não do Geburah** — não precisa da etapa mais delicada (devolver estado hoisted pra dentro de cada aba depois de extrair).

**Boa notícia 2 — migração pro kit de UI compartilhado é quase de graça.** O item 2 do plano geral (`shared/ui.jsx`) já foi feito nos outros 7 módulos, mas excluiu o Yesod porque ele já usava um padrão diferente — `C` como prop explícita em vez de `ThemeCtx`. O próprio `shared/ui.jsx` já documenta esse caso no cabeçalho: **já existe um caminho pronto pra módulo que passa `C` por prop, "importar direto"** — sem precisar montar `ThemeCtx`/`bindThemeContext` do zero como os outros 6 precisaram. `Sheet`/`FI`/`FS`/`Btn` do Yesod (`YesodModule.jsx:91-131`, 41 linhas) são shape-compatíveis 1:1 com a versão compartilhada, incluindo o próprio fix de input decimal (a versão compartilhada já tem a mesma lógica de texto-local-até-`onBlur`) — migrar é apagar essas 41 linhas e trocar por um import, **zero call site muda**. Mais barato que qualquer uma das 7 migrações já feitas.

**A diferença real — o hub principal não pode ser extraído, ele é Geburah-shaped, não Hod-shaped.** `HodTab` pôde sair do shell porque só tocava ~11 identificadores (os 4 scores por domínio já vinham prontos como função). A aba hub do Yesod (`tab==="yesod"`, `YesodModule.jsx:1185-1385` — score, "Em Atraso", "Despesas Divididas", grid de indicadores, hábitos) toca **20+ identificadores diferentes** (`calcYesodScore`, `cashflowMonth`, `ifGoal`/`ifMonthly`, `net`, `debts`, `budgets`, `budgetSpend`, `yHabits`, `yGoals`, `finXp`, `totInv`, `totAcc`, `yesodCards`, `vencimentoAlerts`, `recurringOverrides`, `sharedOwed`, `splitPeople`, `pendingSplits`, `guard`, `despesasExpanded`) e abre 6+ sheets diferentes — exatamente o motivo do `GebTab` do Geburah ter ficado no shell. **A aba hub do Yesod fica no shell**, igual o `GebTab`, não vira um arquivo próprio pequeno igual o `HodTab`.

### Outros achados que definem a forma do split

- **`accs`/`cards`/`banks`/`debts`/`catsOut`/`catsIn` são fortemente cross-cutting** — lidos pelo hub, por Bolsos, pelo "Índice de tudo" do Config, pelo Fluxo e por Despesas Divididas ao mesmo tempo. Isso confirma que o Context (`YesodCtx`) precisa expor a maior parte do estado do módulo, não só um recorte por domínio — esperado, dado que todo o módulo gira em torno de dinheiro entrando/saindo das mesmas contas.
- **5 helpers de linha usados em 2 lugares cada:** `renderAccRow`/`renderCardRow`/`renderBoxRow`/`renderInvCatRow`/`renderDebtRow` (hoje `YesodModule.jsx:1011-1015`) são chamados tanto por Bolsos quanto pelo "Índice de tudo" do Config — mesmo problema do `HodTab`, só que no nível de helper em vez de dashboard inteira. Viram parte de `yesod/helpers.jsx`, importados pelos dois.
- **A maioria dos sheets de CRUD de entidade é aberta de 2-3 abas ao mesmo tempo** (ex: `editAcc` abre de Bolsos E do Config; `payRecurring` abre do hub E do Config) — mesma situação dos "15 sheets soltos, gateados só por `sh===`" já documentada pro Geburah. Precisam de Context pra qualquer aba poder abrir qualquer sheet, não pertencem a um arquivo só.
- **Risco novo, específico do Yesod, que Geburah/Hod não tinham nessa escala:** o Coach faz `useCoachDataSync("yesod", loadFromStorage)` no shell hoje — Yesod tem 47 ações de Coach (mais que qualquer outro módulo), então o `loadFromStorage`/os efeitos de persistência migrarem pro Context precisa continuar disparando corretamente quando o Coach escreve no `localStorage` por fora do React. Testar isso explicitamente (editar via Coach com o módulo montado, confirmar que a UI atualiza sem reload) é uma verificação a mais que os splits anteriores não precisaram fazer com esse peso.

### Estrutura proposta

| Arquivo | Linhas (estimativa) | Conteúdo |
|---|---|---|
| `YesodModule.jsx` (shell) | ~450 | Mount do Provider, roteamento de abas, a aba hub inteira (não extraível, ver acima), sheets cross-aba: `confirmGuard`, `launch`, `editCards`, `receiveSplit`/`paySplit`/`netSettle`, `payRecurring` |
| `yesod/context.js` | ~730-750 | `YesodCtx` — todo `useState`+persistência (194-340), `guard`/navegação (342-356), efeito de geração de recorrências (358-397), cálculos financeiros (`allTxs`/`cashflowMonth`/`calcYesodScore`/`vencimentoAlerts`, 399-709), todas as ações CRUD incl. `launch` e despesas divididas (711-1001) |
| `yesod/theme.js` | ~6 | `DARK`/`LIGHT`/`ACCENT` |
| `yesod/icons.jsx` | ~21 | `Ico`/`IC` |
| `yesod/constants.js` | ~55 | categorias padrão, métodos de pagamento, seções, paleta |
| `yesod/helpers.jsx` | 65 (feito) | `CfgSection`, `ColorPicker`, `MiniTotal`, `ProjChart`. **Ajuste feito na prática (26/08/2026):** os 5 `renderXRow` ficaram de fora — fecham sobre `nav`/`openSh`/`delAcc`/`guard` do componente, migram junto do `context.js` (passo 3), não fazia sentido trocar a assinatura deles duas vezes |
| `yesod/BolsosTab.jsx` | ~330 | aba Bolsos + 5 sub-páginas de detalhe (conta/cartão/caixinha/investimento/dívida) + sheets de CRUD de conta/banco/cartão/caixinha/dívida/investimento |
| `yesod/OrcamentoFluxoTab.jsx` | ~260 | aba Orçamento+Fluxo, `FluxoTab`, motor de Projeção, `addBudget`/`editBudget` |
| `yesod/ObjetivosTab.jsx` | ~40 | aba Objetivos + página de detalhe + `editIF`/`addYGoal` |
| `yesod/ConfigTab.jsx` | ~120 | Preferências, Segurança, "Índice de tudo" (reusa os `renderXRow` de `helpers.jsx`), CRUD de bancos/categorias/pessoas/recorrências |
| **(shared/ui.jsx, sem arquivo novo)** | -41 | `Sheet`/`FI`/`FS`/`Btn` locais apagados, substituídos por import |

Soma ≈ 2075 linhas — bate com as 2050 originais (a diferença é boilerplate de import/export normal de qualquer split).

**Leitura honesta do resultado, sem venderademais:** ao contrário do Hod (1768→309, -83%) e do Geburah (2572→527, -79%), o shell do Yesod não vai ficar pequeno no mesmo sentido — ele mantém a aba hub inteira porque ela é genuinamente cross-cutting, não por falta de esforço no split. O ganho real de legibilidade não vem de "o shell virou um arquivo pequeno", vem de: Bolsos/Orçamento-Fluxo/Objetivos/Config (~750 linhas combinadas) saírem pra arquivos próprios testáveis sozinhos, e o `context.js` concentrar estado+regra de negócio num lugar (~740 linhas) separado da apresentação — uma redução real de acoplamento, mesmo que `context.js` continue sendo, ele mesmo, um arquivo grande.

### Sequenciamento proposto (dentro do item 5, específico pro Yesod)

1. ~~**Migrar pro `shared/ui.jsx`** primeiro~~ ✅ **concluído em 26/08/2026** — ver seção própria abaixo. Fecha o item 2 do plano geral pros 8/8 módulos antes de fatiar, seguindo o princípio 3 do plano ("corrigir duplicação de UI antes de fatiar, não depois").
2. ~~**Extrair `yesod/theme.js`/`icons.jsx`/`constants.js`/`helpers.jsx`**~~ ✅ **concluído em 26/08/2026** — ver seção própria abaixo.
3. ~~**Extrair `yesod/context.js`**~~ ✅ **concluído em 26/08/2026** — ver seção própria abaixo.
4. ~~**Extrair `BolsosTab` → `OrcamentoFluxoTab` → `ObjetivosTab` → `ConfigTab`**~~ ✅ **concluído em 26/08/2026** — ver seção própria abaixo. Saiu também `DetailPages.jsx`/`Sheets.jsx`, não previstos como arquivos próprios no plano original.
5. ~~**Hub e sheets cross-aba ficam no shell**~~ — realizado de forma mais limpa do que o previsto: sheets cross-aba viraram `Sheets.jsx` (arquivo próprio, montado incondicionalmente no shell) em vez de ficar inline; hub continua no shell como planejado.

Cada etapa: `npm run build`/`eslint` limpos, teste no navegador (claro/escuro, a aba mexida + pelo menos uma ação de Coach), commit próprio — mesmo padrão já validado 2x.

## Item 2 concluído no Yesod (26/08/2026) — 1º passo do plano acima

Confirmado exatamente como o levantamento previu: `Sheet`/`FI`/`FS`/`Btn` locais (`YesodModule.jsx:91-131`, 41 linhas) eram shape-compatíveis 1:1 com `shared/ui.jsx` — todos os quatro recebem `C` como prop nomeada nos dois lados, então a troca foi apagar as 41 linhas e importar (`import { Sheet, FI, FS, Btn } from "./shared/ui.jsx"`), sem mudar nenhum call site. Também saiu o import de `createPortal` (só o `Sheet` local usava, a versão compartilhada já cuida disso). Com os 8/8 módulos migrados, o item 2 do plano geral está fechado.

**Um risco real que a comparação por leitura direta achou (e o levantamento anterior não tinha sinalizado):** o `Btn` local caía em `color||ACCENT` (verde do Yesod) quando nenhuma cor era passada; o `Btn` compartilhado cai em `color||"#818cf8"` (roxo, o padrão do hub) — **default diferente, não só estilo**. 8 call sites (os botões "Adicionar" de Contas/Cartões/Caixinhas/Investimentos/Dívidas, "Registrar" do extrato, "Objetivo" e o "Salvar" de Nova/Editar Conta) contavam com esse fallback e ficariam roxos em vez de verdes se a troca fosse literal. Corrigido adicionando `color={ACCENT}` explícito nos 8 antes de trocar o import — nenhum ficou com a cor errada.

Testado ao vivo no navegador, claro e escuro: sheet "Nova Conta" (visual, radius, Ico do X), os 5 botões "Adicionar" de Bolsos + "Registrar" do extrato + "Salvar" de conta (todos continuam verdes), input decimal (`245.9` digitado sem resetar, mesma lógica de texto-local-até-`onBlur` que já existia), e o sheet `confirmGuard` (P9, construído nesta mesma sessão) — zero erro de console. `YesodModule.jsx`: 2050 → **2015 linhas**.

## Item 5, passo 2, concluído no Yesod (26/08/2026) — theme/icons/constants/helpers

Segundo passo da sequência específica do Yesod, logo depois da migração de UI acima. Extraídos pra `yesod/`, todos puramente mecânicos — nenhum tinha (ou ficou com) `useState` do componente principal:

- **`yesod/theme.js`** (6 linhas) — `ACCENT`/`DARK`/`LIGHT`.
- **`yesod/icons.jsx`** (21 linhas) — o dicionário `IC` (privado do arquivo, não exportado) e o componente `Ico`.
- **`yesod/constants.js`** (55 linhas) — helpers de data/formatação (`uid`, `fmt`, `tod`, `MTHS`, `addM`, `addDays`, `freqAdd`, `FREQ_LABELS`, `nextMonthlyDue`, `mLbl`, `stmtDue`, `accBal`, `getStmts`, `accLabel`) e as constantes de configuração (`CASH_ACC_ID`, `D_CATS_OUT`, `D_CATS_IN`, `PAY_METHODS`, `TABS`, `ORC_SECTIONS`, `PROJ_HORIZONS`, `COLOR_PALETTE`).
- **`yesod/helpers.jsx`** (65 linhas) — `CfgSection`, `ProjChart`, `ColorPicker` (esses dois últimos com `useState` **próprio**, sem relação com o estado do `YesodModule` — continuam funcionando idênticos só por morarem em outro arquivo) e `MiniTotal`.

**Desvio deliberado do plano original:** os 5 `renderXRow` (`renderAccRow`/`renderCardRow`/`renderBoxRow`/`renderInvCatRow`/`renderDebtRow`) tinham sido cotados pra entrar em `helpers.jsx` neste passo, mas na prática eles fecham sobre `nav`/`openSh`/`delAcc`/`guard`/`banks`/`C` do componente — mover agora exigiria trocar a assinatura de todos (virar parâmetros explícitos) só pra desfazer essa mudança de novo quando o Context existir. Ficaram onde estavam; migram junto do passo 3 (`context.js`), quando `useContext` resolve isso de graça.

**Achado real ao migrar, não hipotético:** a checagem de uso por identificador (`grep` contando cada nome no corpo do componente) achou 3 símbolos que só eram usados dentro das próprias definições sendo extraídas (`stmtDue` — só chamado por `getStmts`, também extraído; `IC` — só usado dentro do próprio `Ico`; `COLOR_PALETTE` — só usado dentro do próprio `ColorPicker`) — os três ficaram **fora** do import de volta pro `YesodModule.jsx`, evitando import morto. Confirmado por `eslint`: zero ocorrência de `no-unused-vars` nos 4 arquivos novos nem no shell depois da mudança.

Testado: `npm run build` (98 módulos, mesmo bundle) e `npm run lint` limpos (só o ruído de `catch(_)` pré-existente, já documentado); navegador em claro/escuro — hub (ícones, score, alertas), Bolsos, Config, Fluxo de Caixa (números de Ago/26 idênticos: R$69.295,00/R$21.260,90/R$48.034,10) — zero erro de console. `YesodModule.jsx`: 2015 → **1883 linhas**.

## Item 5, passo 3, concluído no Yesod (26/08/2026) — context.js

Terceiro passo, o de maior risco real da sequência: todo `useState`+persistência+cálculos financeiros+ações CRUD saiu do shell pra `yesod/context.js`, dentro de um hook `useYesodState()` + `export const YesodCtx = createContext(null)`. Extração de ~814 linhas feita via `sed -n` (não Read/reescrita manual) pra evitar risco de transcrição em linhas de até 2000+ caracteres — comparação `comm`/`grep` entre a lista de identificadores extraída do código-fonte e os blocos de `return {}`/destructure escritos à mão, feita duas vezes, antes de rodar o app.

**Desvio deliberado do padrão Geburah/Hod:** nos outros módulos, `context.js` ficou pequeno e a lógica de negócio continuou no shell. Aqui isso não funcionaria — a aba hub do Yesod toca 20+ identificadores cross-cutting (ver "Duas boas notícias e uma diferença real" acima), então um `context.js` fino deixaria o shell do mesmo tamanho de antes. Em vez disso, `context.js` concentra o hook `useYesodState()` com toda a lógica, e o shell chama `const ctx = useYesodState()` uma vez, monta `<YesodCtx.Provider value={ctx}>` e desestrutura só os ~141 nomes que a aba hub e os sheets cross-aba usam diretamente — os outros ~36 (usados só internamente por outras ações, ex. `allTxs`, `finXp`, `totReceivable`) ficam disponíveis via `useContext(YesodCtx)` pros arquivos de aba dos próximos passos, sem precisar voltar aqui pra expor mais nada.

**Bugs pegos durante a extração, não hipotéticos:**
- Regex de varredura de identificadores (`[a-zA-Z_$]+`) excluía dígitos no fim do nome — `monthLabel2` e `avgAccountNet3` ficaram de fora da primeira lista. Pego comparando (`comm -23`) a lista antiga com a corrigida (`[a-zA-Z0-9_$]+`), que achou exatamente essas 2 diferenças.
- `ORC_SECTIONS` foi importado em `context.js` mas só aparecia dentro de um comentário de código (não uso real) — lint acusou `no-unused-vars`, import removido (continua importado normalmente no shell, onde é de fato usado pra renderizar).
- 36 nomes desestruturados no shell não eram usados em nenhuma JSX restante ali (só por dentro das próprias ações do hook) — lint acusou os 36 como `no-unused-vars`; resolvido calculando o conjunto exato via `comm -23` (177 nomes do hook menos os 36) e reescrevendo o destructure do shell só com os 141 realmente usados.

Testado ao vivo: `npm run build` (99 módulos) e `npm run lint` limpos (só ruído pré-existente de `catch(_)`, documentado). Navegador: reload completo do app confirmando um erro de console (`useState is not defined`) era resíduo de HMR de um estado intermediário do arquivo, não bug atual (zero referência real a hooks do React fora de `context.js`, confirmado por grep); claro/escuro; navegação em Bolsos (`renderAccRow` renderizando normal, os 5 `renderXRow` continuam no shell); transação de ponta a ponta — criei "Teste context.js" de R$33,90 via `launch()` (agora vivendo no hook), confirmei input decimal ainda funciona, saldo e patrimônio líquido subiram exatamente R$33,90, deletei via delete instantâneo de lançamento único, reverteu limpo; toggle "Segurança" (`confirmDestructive`) mostrando "Sim (padrão)" selecionado e o sheet `confirmGuard` disparando normalmente ao tentar apagar uma conta (cancelado sem confirmar); reload completo de página com re-entrada no módulo confirmando persistência (patrimônio R$55.055,10 e score 62% idênticos ao estado antes do reload).

`YesodModule.jsx`: 1883 → **1096 linhas**. Novo `yesod/context.js`: **864 linhas**.

## Item 5, passo 4, concluído no Yesod (26/08/2026) — últimos 4 arquivos de aba

Quarto e último passo da sequência específica do Yesod. Extraídos de `YesodModule.jsx` (que já estava em 1105 linhas no início deste passo — 9 a mais que os 1096 do fim do passo 3, por edições pontuais entre sessões): `yesod/BolsosTab.jsx`, `yesod/OrcamentoFluxoTab.jsx`, `yesod/ObjetivosTab.jsx`, `yesod/ConfigTab.jsx` — e mais dois arquivos não previstos na tabela original, `yesod/DetailPages.jsx` e `yesod/Sheets.jsx`.

**Correção de arquitetura em relação ao plano original, achada por grep antes de extrair (não hipótese):** a tabela do plano ("Estrutura proposta", acima) previa que as 5 sub-páginas de detalhe (conta/cartão/caixinha/investimento/dívida, hoje abertas via `nav(...)`) e os sheets de CRUD (addAcc/editAcc/addCard/etc., abertos via `openSh(...)`) entrariam dentro de `BolsosTab.jsx`. Isso está errado: os 5 `renderXRow` que chamam `nav()`/`openSh()` já são usados tanto na lista de Bolsos quanto no "Índice de tudo" de Config (confirmado por grep — mesmas 5 funções, duas chamadas cada) desde o passo 2, e a seção `{/* ══ SHEETS ══ */}` inteira é gatilhada só por `sh==="nomeDoSheet"`, sem nenhum check de `tab` em lugar nenhum dela (lida linha a linha pra confirmar). Se as sub-páginas ou os sheets morassem só dentro de `BolsosTab.jsx`, abrir uma conta ou um sheet de edição a partir de Config (`tab==="cfg"`) pararia de funcionar, porque `BolsosTab` simplesmente não estaria montado nesse momento. Mesma lógica por trás de deixar os `renderXRow` no shell desde o passo 2, agora aplicada a mais duas coisas:

- **`yesod/DetailPages.jsx`** (134 linhas) — as 5 sub-páginas cross-tab (`page.type` em `account`/`card`/`debt`/`box`/`inv`), montada incondicionalmente no shell (`<DetailPages C={C}/>`), não dentro de nenhuma aba.
- **`yesod/Sheets.jsx`** (302 linhas) — todo bloco de sheets (`confirmGuard`, `launch`, CRUD de conta/banco/cartão/caixinha/dívida/investimento, `editCards`, `receiveSplit`/`paySplit`/`netSettle`, `payRecurring`, etc.), também montada incondicionalmente (`<Sheets C={C}/>`) — isso é, na prática, a mesma decisão que o item 5 original já previa ("sheets cross-aba ficam no shell"), só que virou arquivo próprio em vez de ficar inline.
- **`goalsDetail`** (a 6ª variante que existia no dispatcher original) é a única sub-página genuinamente exclusiva de uma aba — `nav("goalsDetail")` só é chamado de dentro do próprio `ObjetivosTab.jsx`, confirmado por grep (zero outro call site) — por isso ficou dentro de `ObjetivosTab.jsx`, mais perto do plano original nesse caso específico.
- **`yesod/BolsosTab.jsx`** (47 linhas) — só a lista (Contas/Cartões/Caixinhas/Investimentos/Dívidas), recebendo `C` e os 5 `renderXRow` como props do shell.
- **`yesod/OrcamentoFluxoTab.jsx`** (231 linhas, o maior dos quatro) — abas Orçamento+Fluxo inteiras, incl. os 6 sub-views de Fluxo (Fluxo de Caixa/Poupança/Dívidas/Investimentos/Patrimônio/Projeção) e o `ProjChart`. Sem sub-página nem sheet exclusivo, sem desvio do plano.
- **`yesod/ConfigTab.jsx`** (141 linhas) — Preferências/Segurança/Índice de tudo/CRUD de bancos-categorias-pessoas-recorrências, recebendo `C` e os 5 `renderXRow` como props (mesmo padrão do BolsosTab).

**Bugs pegos durante a extração, não hipotéticos:**
- `BolsosTab.jsx` ficou sem a `</div>` de fechamento na primeira tentativa (erro de offset num `sed -n` de 28 linhas) — `npm run build` falhou com `Parsing error: Unexpected token` apontando exatamente pra linha, corrigido na hora.
- Repetiu-se o mesmo padrão de falso-positivo já visto no passo 3: identificadores que só existem como *string* passada pra `openSh("nomeDoSheet", ...)` (ex.: `checkin`, `editInv`, `launch`, `amortizarDivida`, `quitarDivida`, `payDebt` em `DetailPages.jsx`; `ifGoal`/`ifMonthly`/`net` em `Sheets.jsx`; `addAcc`/`addBank`/`addBox`/`addCard`/`addCatIn`/`addCatOut`/`addDebt`/`addInv`/`addSplitPerson`/`editBank` em `ConfigTab.jsx`) foram capturados pela varredura de identificadores porque a regex não distingue `openSh("addAcc",...)` (string) de `addAcc(...)` (chamada real) — todos pegos por `eslint no-unused-vars` na hora de rodar lint, não por revisão manual, e removidos do destructure.
- `PROJ_HORIZONS`/`ORC_SECTIONS`/`ColorPicker`/`PAY_METHODS`/`CfgSection`/`MiniTotal`/`ICAT`/`FI`/`FS`/`Btn`/`Sheet`/`uid`/`addM`/`mLbl`/`FREQ_LABELS` foram saindo dos imports do shell em ondas, um pouco depois de cada extração, conforme `eslint` ia confirmando que o último consumidor tinha saído — nenhum removido "no escuro", sempre confirmado por lint antes.

Testado ao vivo, navegador, claro/escuro, cada arquivo isoladamente antes do próximo: **BolsosTab** — as 5 seções (Contas/Cartões/Caixinhas/Investimentos/Dívidas) com dados reais idênticos (R$79.330,10 em contas, financiamentos e empréstimos corretos); **OrçamentoFluxoTab** — pill Fluxo/Orçamento alternando, gráfico de barras Realizado+Esperado, números de Ago/26 idênticos (R$69.295,00/R$21.260,90/R$48.034,10), lista de lançamentos com linha de despesa dividida ("Esposa deve R$110,00 · recebido"); **ObjetivosTab** — card de IF (18%, R$55.055,10 de R$300.000,00), clique abrindo `goalsDetail` com stats reais (poupança média R$5.587,00, projeção 3.7 anos), checklist de Outras Metas com toggle real (XP creditado, 0/7→1/7, desfeito depois); **ConfigTab** — Preferências (pesos da fórmula), Índice de tudo expandindo Bancos/Investimentos, e o teste mais importante: **clicar num investimento dentro do Índice de tudo de Config (`tab==="cfg"`) abriu corretamente a sub-página de detalhe do `DetailPages.jsx`** — prova ao vivo, não só por leitura de código, de que a correção de arquitetura (sub-páginas e sheets cross-tab, não presos a uma aba) funciona como projetado. Zero erro de console em todos os testes (só o já conhecido resíduo de HMR de `ReferenceError` durante hot-reload no meio de uma edição, que some com reload limpo). `npm run build` limpo. `npm run lint` acusou um erro real que a extração introduziu, corrigido depois (não fazia parte do relato original deste passo): o `BackBtn` local de `DetailPages.jsx` e `ObjetivosTab.jsx` (`const BackBtn=({label})=>(...)`, fechando sobre `C`/`back` por closure) morava, no `YesodModule.jsx` original, dentro do IIFE aninhado (`function InlineBlock(){...}`) que o dispatcher de sub-páginas chamava — nesse nível, `react-hooks/static-components` não pegava. Ao extrair, `BackBtn` foi parar direto no corpo da função exportada (`export function DetailPages({C}){...}`), o nível exato que a regra fiscaliza — virou erro real (`Cannot create components during render`) em 6 pontos (5 em `DetailPages.jsx`, 1 em `ObjetivosTab.jsx`), confirmado comparando com o backup pré-extração (`/tmp/YesodModule.jsx.bak`), não suposição. Corrigido subindo `BackBtn` pra escopo de módulo (`function BackBtn({label,C,back}){...}`, fora da função exportada) e passando `C`/`back` explícitos nos 6 call sites. **Nota:** o mesmo padrão (`BackBtn`/função equivalente definida dentro do corpo do componente) existe, sem correção, em `geburah/ConfigTab.jsx` e `hod/ConfigTab.jsx` (13 ocorrências de `static-components` lá) — pré-existente e fora do escopo deste passo, não corrigido aqui. Resto do lint só ruído pré-existente documentado: `catch(_)` (em `context.js`, não tocado neste passo), um `i` não usado num `.map` que já existia antes do passo 4, `calcYesodScore` acessado antes de declarado dentro de um `useEffect` (mesma ordem já presente no arquivo original, confirmada no backup) e um `??` sempre-verdadeiro em `Number(...)??50` — os três últimos em `context.js`, também não tocado neste passo.

`YesodModule.jsx`: 1105 → **322 linhas** (-71% neste passo; -84% desde o início do item 5 no Yesod, 2015→322). Novos arquivos: `DetailPages.jsx` **134**, `Sheets.jsx` **302**, `BolsosTab.jsx` **47**, `OrcamentoFluxoTab.jsx` **231**, `ObjetivosTab.jsx` **57**, `ConfigTab.jsx` **141** — soma 912 linhas novas + 322 no shell = 1234, contra as ~1105 de antes (a diferença é boilerplate de import/export, mesma leitura já feita nos passos anteriores).

**Atualização da "leitura honesta" registrada no levantamento original:** o shell ficou bem menor do que a própria previsão do plano (~450 linhas estimadas → 322 reais) — melhor que Hod e Geburah em proporção, mesmo mantendo a aba hub inteira (238-439 originalmente, ~200 linhas) como cross-cutting. O motivo: a correção de arquitetura acima tirou do shell não só as 4 abas, mas também as sub-páginas e os sheets (que o plano original ainda contava como parte do shell) — o shell de hoje é essencialmente "Provider + hub + renderXRow + roteamento de abas", nada além disso.

## Sequenciamento recomendado

| Ordem | O quê | Módulos | Risco | Por quê nessa posição |
|---|---|---|---|---|
| 1 | ~~Extrair dado estático pra arquivos próprios~~ | ✅ **concluído em 21/08/2026** — Geburah, Hod, Chesed, Netzach, Tiphareth, Yesod, Chokmah, Binah (8/8 módulos, incluindo os 2 construídos depois deste plano) — ver seção acima | Muito baixo — puro `import`, zero mudança de comportamento, confirmado | — |
| 2 | ~~Consolidar kit de UI compartilhado (`shared/ui/`)~~ | ✅ **concluído em 21/08/2026** pra 7 dos 8 módulos, **Yesod fechou os 8/8 em 26/08/2026** (ver seção "Item 2 concluído no Yesod" acima) | Baixo-médio — muda import, não a API dos componentes, confirmado | — |
| 3 | ~~Corrigir tema mutável (`let C`) restante~~ | ✅ **concluído** — Geburah, Hod, Tiphareth, Chesed, Netzach (13/08/2026) | Baixo — padrão mecânico já provado 5x | — |
| 4 | ~~Corrigir componentes de aba recriados~~ | ✅ **concluído** — Geburah, Hod, Tiphareth, Chesed, Netzach (13/08/2026) | Baixo — padrão mecânico já provado 5x | — |
| 5 | ~~Fatiar módulos grandes em subarquivos por domínio~~ | ✅ **Geburah e Hod concluídos em 22/08/2026** (ver seções acima) — **Yesod tem plano de execução completo desde 26/08/2026** (levantamento de dependências feito, estrutura de 10 arquivos proposta, nada executado — ver seção "Plano pro Yesod" acima) — App.jsx ainda sem levantamento nenhum | Médio — exigiu desenho novo (`GeburahCtx`/`HodCtx`), não só threading mecânico de props como o esboço original previa. Hod acabou mais simples que o Geburah na prática (sem estado local pra devolver às abas, dashboard pôde ser extraída) | Só depois que dado e UI compartilhada já não estão mais duplicados dentro do arquivo a fatiar |
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
