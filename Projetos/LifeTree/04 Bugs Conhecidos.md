---
tags: [lifetree, bugs, arquitetura]
aliases: [Bugs Conhecidos]
---

# Bugs Conhecidos e Soluções

Relacionado a [[Arquitetura]] — problemas encontrados durante o desenvolvimento e integração de módulos.

> ⚠️ Seção reorganizada em 28/07/2026 após auditoria direta do código (ver [[09 Auditoria de Código vs Documentação]]). Bugs abaixo divididos entre **corrigidos**, **ativos confirmados no código** e **padrões/regras gerais**.

### 🟢 Config não abria os módulos reais pra 9 dos 10 sefirot — corrigido em 19–20/08/2026
**Onde:** `App.jsx`, lista "SEFIROT → ÁREAS" da aba Config.

**Problema:** a árvore principal (`KabbalahTree.onSelect`) já roteava cada sefirá pro módulo real certo, mas a lista equivalente do Config sempre chamava `setPage({type:"area",areaId})` — abrindo a página genérica (`AreaPage`, hoje removida) mesmo pros 9 sefirot que já tinham módulo próprio. Achado no processo de construir o Kether, ao adicionar seu roteamento.

**Correção:** os dois pontos agora chamam a mesma função (`goToSefira`), sem duplicar a lógica de switch entre os dois lugares.

### 🟢 Sheets recém-extraídas do Geburah/Hod com cor hardcoded de light-mode — corrigido de quebra em 22/08/2026
**Onde:** `preview/src/geburah/NutriTab.jsx` (`AddAlimentoSheet`, `AddRefeicaoSheet`, `AddIngredienteSheet`) e `preview/src/hod/CarreiraTab.jsx` (`EditSkillSheet`), `preview/src/hod/MarcaTab.jsx` (`EditPillarsSheet`), `preview/src/hod/ProjetosTab.jsx` (`EditProjectSheet`) — todos escritos durante a decomposição do item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]] (ver [[02 Arquitetura]] → "Decomposição de módulo grande em subarquivos").

**Problema:** ao mover esses sheets do shell (onde liam `C` por closure de módulo) pros arquivos novos, algumas cores acabaram digitadas na mão em vez de lidas do Context — em 3 casos um hex literal de light-mode (ex: `#8a5a2e`, o `LIGHT.muted` do Hod) e em 2 casos um resquício de outro padrão que nunca existiu de verdade neste codebase (`color:"var(--muted)"`, CSS custom property — este projeto não usa nenhuma, todo tema passa por `ThemeCtx`/prop `C`). Em dark mode, o resultado seria texto praticamente ilegível (cor clara sobre fundo claro que nunca aparece, ou a string CSS inválida sendo ignorada pelo navegador e caindo no `color` herdado). Nenhum dos 5 tinha sido testado em dark mode antes do achado — a checagem de lint/build não pega isso (é uma string CSS válida do ponto de vista do parser, só semanticamente errada).

**Como foi achado:** revisão do próprio código logo após escrevê-lo, antes do teste no navegador — não foi um bug reportado pelo usuário, foi pego numa varredura (`grep`) por `var(--` e pelos hex literais de cada tema, feita de propósito depois do primeiro caso ter aparecido por acaso no Geburah.

**Correção:** os 5 sheets passaram a ler `const C = useContext(ThemeCtx);` no topo (mesmo padrão de qualquer outro componente do módulo) e usar `C.muted` em vez do literal/CSS-var. Testado ao vivo no navegador em dark mode nos dois módulos depois da correção — confirmado legível.

**Regra geral pra qualquer decomposição futura (App.jsx ou outro módulo):** ao extrair um componente que usava `C` por closure de módulo pra um arquivo novo, sempre adicionar `useContext(ThemeCtx)` explicitamente e nunca "chutar" uma cor de memória — mais barato grepar por hex/var suspeitos logo depois de escrever do que confiar só em teste visual manual encontrar todos.

### 🟢 Camada de RPG do hub (moedas, nível/XP global, lista de desejos genérica) — removida em 19/08/2026
**Onde:** `App.jsx` — pedido explícito do usuário, não um bug. Removidos: `coins`/`xp`/`lvl`/`getLevel`/`LVL_T`/`LVL_N`, badge de moedas/nível no header, barra de XP, card de nível e "Jornada de Níveis" na aba "Status" (removida por inteiro — só tinha esses 3 blocos), lista de desejos genérica (`wishes`) e seu modal, sistema de conquistas (`BADGES`) que lia esse hábito/meta genérico do hub, e as abas "Hábitos"/"Metas" genéricas da nav inferior.

**Achado ao escopar a remoção:** as abas "Hábitos"/"Metas" não eram só uma lista redundante — carregavam 5 funcionalidades reais sem equivalente em nenhum módulo real: **Pomodoro** (timer de foco por hábito), **lembretes** (hora/minuto), **sub-tarefas** (checklist dentro de um hábito), **marcos** (milestones dentro de uma meta, com XP próprio) e **calendário/heatmap** por hábito. Usuário avisado do escopo completo antes de confirmar a remoção — ver [[01 Kether]] → "Camada de RPG removida" pro detalhe completo e o que ficou (diário, backup, score financeiro manual, widgets `finscore`/`diario`).

## Status confirmado por leitura direta do código (28/07/2026)

### 🟢 Sefirot não enchiam visualmente na Árvore — corrigido em 31/07/2026
**Onde:** `App.jsx`, componente `KabbalahTree` (renderização da árvore central).

**Problema (P0 do [[05 Roadmap]], antes "não verificado"):** as sefirot eram sempre desenhadas com a mesma opacidade quase uniforme (`fillOpacity={0.1+sc*0.2}`, variando só entre 10-30%) — não davam nenhuma noção de "completude" proporcional ao score. Especificação original (líquido subindo conforme o score) tinha se perdido.

**Correção:** substituído por um efeito real de líquido subindo — um `<rect>` clipado pela forma do círculo (`clipPath`), com altura e posição calculadas a partir do score (`height = 2*(R-2)*sc`), mais uma linha de superfície sutil no topo do líquido. Transição suave via CSS (`transition: y, height`).

**Bug relacionado encontrado no processo:** `scoreMap` usava `scores[s.areaId]||0.5` — como `0` é falsy em JS, `0 || 0.5` virava `0.5`, então qualquer sefirá com score **exatamente 0%** (Geburah e Tiphareth, no momento do teste) aparecia com metade do líquido em vez de vazia. Trocado para `??` (nullish coalescing), que só cai no fallback quando o valor é `null`/`undefined`, não quando é `0`.

**Verificado:** inspecionado o DOM em produção via `javascript_tool` — os 6 módulos integrados bateram exatamente com os scores reais em `localStorage.lifetree_scores` (Chesed 34%, Hod 12%, Yesod 20%, Netzach 7%, Geburah 0%, Tiphareth 0%); as 4 sefirot sem módulo mostram 50% (fallback padrão), consistente com `aScoresBase` sem hábitos/metas cadastrados.

### 🟢 Score duplicado no card principal — corrigido em 31/07/2026
**Onde:** `YesodModule.jsx`, `HodModule.jsx`, `TipharethModule.jsx`, `NetzachModule.jsx` — card de score principal na aba hub de cada módulo.

**Problema (achado navegando o app, com captura de tela do usuário):** o score aparecia duas vezes no mesmo card — grande à esquerda (`fontSize:52`) e de novo numa caixinha "Leve para a Árvore" à direita (`fontSize:28`). Geburah e Chesed não tinham esse problema.

**Correção:** removida a caixinha duplicada da direita nos 4 módulos, mantendo só o número grande à esquerda. Virou diretriz permanente — ver [[02 Arquitetura]] (seção "Diretriz de UI — não duplicar o score").

### 🟢 Todas as integrações de IA fazem fetch sem headers de autenticação — corrigido em 31/07 e 01/08/2026
**Onde:** `App.jsx` (`sendToCoach`), `YesodModule.jsx` (`analyzeFinances`), `GeburahModule.jsx` (`sendCoach` e `callAI`), `HodModule.jsx` (`suggestActions`), `TipharethModule.jsx` (`runAgent`), `ChesedModule.jsx` (`callAI`), `NetzachModule.jsx` (`callAI`) — **7 pontos de integração, todos com o mesmo padrão**:

```js
fetch("https://api.anthropic.com/v1/messages",{
  method:"POST",
  headers:{"Content-Type":"application/json"}, // ← falta x-api-key e anthropic-version
  body:JSON.stringify({model:"claude-sonnet-4-20250514", ...})
})
```

**Problema:** nenhum desses `fetch` envia `x-api-key` ou `anthropic-version`. A API da Anthropic rejeita a requisição sem esses headers — ou seja, **nenhum Coach de IA do app funciona como está**, a menos que algo externo ao código (proxy, variável de ambiente injetada em outro lugar) complete a chamada. Não achado antes — nenhuma fonte anterior (repo ou `obsidian-vault`) documentava isso.

**Por que se repete 7 vezes:** todos os módulos foram claramente gerados a partir do mesmo template/prompt original (mesmo padrão de `fetch`, mesmos nomes de variável) — o bug foi copiado junto com o padrão.

**Correção:** proxy serverless (`/api/coach`, guarda a key como env var) criado em 31/07/2026 pro hub e Yesod; os outros 5 módulos migrados em seguida pra um registry único de skills (`coachSkills.js`) que também passa por esse proxy — nenhum `fetch` direto à Anthropic restou em nenhum módulo. Detalhe completo em [[02 Arquitetura]], seção "Coach de IA".

### 🟢 window.storage no hub central — corrigido em 15/08/2026
**Onde:** `preview/src/App.jsx`, funções `loadState()`/`saveState()`.

**Problema:** o próprio hub central (`App.jsx`) ainda usava `window.storage.get/set` para persistir o estado principal (hábitos, metas, XP, etc.) — a mesma API que só existe em artefatos Claude e que a regra "window.storage proibido" (ver abaixo) diz ter sido banida. Isso quebrava a persistência do app principal fora do ambiente de artefato.

**Por que ninguém pegou:** os módulos (Yesod, Geburah, Hod, Tiphareth) usam `localStorage` corretamente com prefixo `lifetree_`; só o próprio `App.jsx` — o arquivo mais importante — tinha ficado de fora da migração.

**Correção:** `loadState`/`saveState` trocados por `localStorage` direto, mesma assinatura async pra não precisar tocar nos call sites. Chave também migrada de `"lifetree-v1"` (hífen, fora do padrão) pra `"lifetree_hub-v1"` (prefixo `lifetree_` consistente com os módulos). Testado no navegador: hábito criado no hub sobrevive a reload da página.

### 🟢 Timer Geburah — stale closure — corrigido em 12/08/2026
**Onde:** `GeburahModule.jsx` — `useEffect(..., [timerAtivo?.segundos>0])`

**Problema:** dependência do `useEffect` comparava um booleano derivado em vez do objeto `timerAtivo` inteiro — o efeito não re-executava corretamente a cada segundo.
**Correção:** dependência trocada para `[timerAtivo]`. Feito junto com a implementação de acompanhamento de treino ao vivo — ver entrada abaixo e [[05 Geburah]]. Verificado no navegador: timer de descanso conta corretamente após iniciar um treino.

### 🟢 registrar_refeicao (Geburah) — banco de alimentos pequeno — corrigido em 04/08/2026
A action `registrar_refeicao` está implementada e conectada ao coach conversacional. O banco de alimentos (`alimentos`/`D_AL`) foi expandido de poucos itens para **376 itens em 22 categorias** (padrão TACO, com macros + micronutrientes + porção), superando a meta de "200+ itens" do [[05 Roadmap]]. Reduz bastante o risco de falha por substring, mas o match continua sendo por nome simples (`alimentos.find(a=>a.name.toLowerCase().includes(...))`, sem normalização/fuzzy) — nomes bem diferentes do cadastro ainda podem não casar.

### 🟢 Banco de exercícios pequeno / sem dado de gasto calórico (Geburah) — corrigido em 09/08/2026
Não estava listado aqui antes, mas era o gap confirmado na auditoria de 09/08/2026 (ver [[05 Geburah]]): o catálogo de exercícios (`D_EX`) tinha só 10 itens fixos, sem nenhum dado de MET/calorias — treino não entrava na conta calórica do módulo de jeito nenhum (só TDEE + dieta). Corrigido migrando os ~276 exercícios de `biblioteca-exercicios-v3.jsx` (153 de musculação + 123 de artes marciais, todos com MET) pro `D_EX`, com navegação por grupo/nível/modalidade e kcal/min estimado por exercício na aba Treino → Exercícios.
**Gap novo, mais específico, encontrado na mesma auditoria (fechado abaixo em 12/08/2026):** o MET agora existe mas não é consumido em nenhum cálculo real (não soma numa sessão, não abate de `calHoje`, não entra no `gebScore`) — porque `logTreino` não guarda duração de treino. Detalhe completo em [[05 Geburah]], seção "Gap analysis — pós-biblioteca de exercícios".

### 🟢 Cadeia bloqueada pelo MET — sem acompanhamento de treino ao vivo — corrigido em 12/08/2026
Fecha os 5 itens da gap analysis logo acima: duração de sessão (`horaInicio`/`horaFim`/`duracaoMin` em `logTreino`, relógio ao vivo durante o treino), registro type-aware por exercício (`logTipoDe`: carga/tempo/reps, com override pra exceções que a heurística erra), cálculo de calorias do treino (`kcalDoTreino`/`kcalTreinoHoje`/`calLiquidas`, reaproveitando a fórmula MET já existente), `treinoScore` passando a considerar volume de kcal além de frequência, e planejamento semanal (`PlanejamentoTab`) ganhando uma linha "Treino" por dia com indicador de conclusão e dropdown de reatribuição. Implementação completa e verificação no navegador em [[05 Geburah]] → "Acompanhamento de treino ao vivo".

### 🟢 stmtDue (Yesod) — corrigido
**Onde:** `YesodModule.jsx` linha ~21 — o fix `if (closeDay >= dueDay) { dm++; ... }` já está aplicado no código.

### 🟢 Nav bar do hub com 7 abas — corrigido em 31/07/2026
**Onde:** `App.jsx`, array `TABS` e renderização da aba "Árvore".

**Problema:** `TABS` tinha 7 itens (`tree`, `habits`, `goals`, `rpg`, `dash`, `coach`, `config`) — acima do limite de 5 recomendado pela [[Avaliação PO + Designer]] (ver também [[05 Roadmap]]).

**Correção (não é exatamente o plano original de 5 abas "Crescimento"/"Perfil" do roadmap, mas resolve o mesmo problema):**
- `TABS` reduzido para 4: `tree` (Árvore), `habits`, `goals`, `config`.
- **RPG e Dash viraram slides de um carrossel** dentro da própria aba "Árvore" — `treeSlide` (0=Árvore, 1=Status, 2=Dash). O carrossel é **circular**: da Árvore (slide 0) a seta esquerda vai direto pro Dash (slide 2), e vice-versa (`(treeSlide+2)%3` / `(treeSlide+1)%3` — sem `Math.min`/`Math.max` de clamp).
- "RPG" foi **renomeado para "Status"** no rótulo do carrossel (`TREE_SLIDES`).
- **Coach deixou de ser aba** — virou um campo de input permanente (`position:fixed`, acima da nav bar), visível nas 4 abas restantes, reaproveitando o mesmo `sendToCoach`/`coachMessages`/`coachInput` de antes.

**Bug encontrado e corrigido na 1ª versão (StrictMode + updater impuro):** a primeira implementação usava arraste manual em JS (`onPointerDown/Move/Up`) e chamava `setTreeSlide` **dentro do updater funcional** de `setDragDX` (`setDragDX(dx => { ...; setTreeSlide(...); return 0; })`). Em dev, o React StrictMode invoca updaters de `setState` duas vezes pra detectar impurezas — como as duas chamadas de `setTreeSlide` encadeavam uma sobre a resultado pendente da outra, um único arraste pulava **2 slides** em vez de 1. Corrigido guardando o delta do arraste numa `ref` (leitura pura em `treeDragEnd`, sem efeito colateral dentro de outro updater). **Regra geral:** nunca chamar `setState` de dentro do updater funcional de outro `setState`.

**🔁 Reescrito por completo em 31/07/2026 (sessão seguinte, mesmo dia):** o usuário testou no navegador e achou a navegação "travada"/com delay mesmo depois do fix acima. Trocado o arraste manual em JS por **scroll nativo do navegador com CSS scroll-snap** (`overflow-x:auto` + `scroll-snap-type:x mandatory`) — o gesto de arraste passou a ser 100% gerenciado pelo navegador, sem nenhum JS rastreando o dedo. Duas descobertas no processo, confirmadas via console/DOM (podem ser específicas do ambiente de teste automatizado, não necessariamente do Chrome real do usuário, mas os fixes são robustos de qualquer forma):
- `scrollTo({behavior:"smooth"})` travava sem completar o scroll — trocado pra `behavior:"instant"`.
- `scrollTo()` programático não disparava o evento `scroll` nativo — então clicar nas setas não atualizava qual slide estava "ativo" (dots, altura). Corrigido fazendo os botões/dots chamarem `setTreeSlide(i)` **diretamente**, sem depender do evento de scroll pra descobrir onde parou.

Além disso: as setas + indicador de bolinhas foram **movidas pra abaixo do conteúdo do carrossel** (antes ficavam acima, logo abaixo da barra de XP) — decisão de UX: controles de navegação em mobile convencionalmente ficam na base da tela (zona de alcance do polegar), como o `UIPageControl` da Apple. Ver detalhe técnico completo (código, decisão de arquitetura) em [[02 Arquitetura]], seção "Navegação (nav bar)".

**Bug relacionado, também corrigido nessa reescrita:** o `useLayoutEffect` que sincroniza a altura do carrossel com o slide ativo rodava durante a tela de "Carregando..." (`loaded===false`), quando as refs dos slides ainda eram `null` — e como `loaded` não estava na lista de dependências do efeito, ele nunca recalculava depois que o conteúdo real montava, deixando a altura travada (sem efeito) e recriando o espaço vazio gigante que o efeito deveria eliminar. Corrigido adicionando `loaded` às dependências.

### 🟢 Barra inferior (cards) mais larga que o corpo da tela — corrigido em 31/07/2026
**Onde:** `preview/src/index.css`, regra `#root`.

**Problema:** `#root` tinha `display:flex; flex-direction:column; width:1126px` — sobra do template padrão do Vite/React (feito pra landing page), sem relação com o app mobile-frame. Isso fazia a `<div>` principal do app (com `maxWidth:430, margin:"0 auto"`) encolher pro tamanho do conteúdo em telas largas, em vez de esticar até os 430px do frame — enquanto a barra de navegação fixa (`position:fixed`), que não sofre esse efeito de flexbox, continuava calculando 430px certinho contra a viewport. Resultado: nav bar visivelmente mais larga que o corpo do app.

**Correção:** `#root` reduzido a `{ min-height: 100svh; box-sizing: border-box; }` — removidos `width`, `display:flex`, `flex-direction`, `text-align`, `border-inline` (todos sobra do scaffold, não usados por nenhum componente do app). Verificado medindo `getBoundingClientRect()` do frame e da nav via `javascript_tool` antes/depois — ambos bateram em `width:430px` com as mesmas bordas.

### 🟢 Contraste ruim no modo escuro (`muted`/`dim` quase invisíveis) — corrigido em 31/07/2026
**Onde:** tema `DARK` em `App.jsx` e nos 6 módulos (`ChesedModule.jsx`, `GeburahModule.jsx`, `HodModule.jsx`, `NetzachModule.jsx`, `TipharethModule.jsx`, `YesodModule.jsx`) — todos com a mesma constante copiada.

**Problema:** `DARK.muted` era `#44556a`, quase da mesma luminância do fundo `#07090f` (contraste ~2:1, bem abaixo do mínimo legível) — usado nos rótulos "HÁBITOS HOJE", "STREAK", labels da nav, etc. Em dois pontos específicos (badges bloqueadas no Dash e "Jornada de Níveis" no Status) o problema dobrava: texto já com cor `muted` recebia **também** `opacity:0.3–0.4`, multiplicando os dois efeitos.

**Correção:** `muted` clareado em duas rodadas até `#dde3ee` (~15:1 de contraste) e `dim` até `#9fb0c7` (~9:1, usado nas linhas da árvore) — mesma cor nos 7 arquivos. Opacidades de "bloqueado"/"não alcançado" subidas de 0.3–0.4 para 0.55–0.65 (ainda dá noção de "trancado", mas legível). Verificado abrindo cada um dos 6 módulos no navegador em modo escuro via `claude-in-chrome`.

**Regra geral:** nunca combinar uma cor já pensada como "secundária/apagada" (`muted`, `dim`) com uma opacidade adicional baixa (<0.5) pra indicar estado desabilitado/bloqueado — os dois efeitos multiplicam e o texto fica ilegível. Preferir opacidade ≥0.55 quando a cor de base já é discreta.

### 🟢 Modo escuro não sincronizava entre módulos — corrigido em 31/07/2026
**Onde:** `App.jsx` e os 6 módulos (`ChesedModule.jsx`, `GeburahModule.jsx`, `HodModule.jsx`, `NetzachModule.jsx`, `TipharethModule.jsx`, `YesodModule.jsx`).

**Problema:** cada módulo tinha seu **próprio** `const [dark, setDark] = useState(false)`, totalmente independente do hub e dos outros módulos — ao clicar numa sefirá, o módulo sempre abria em modo claro (ou, no caso do Yesod, lembrava um estado próprio salvo numa chave de `localStorage` separada, `lifetree_fin_dark`), não importa o que estivesse configurado na Árvore.

**Correção:** `dark`/`setDark` agora vivem só em `App.jsx` (única fonte de verdade, já persistida no `saveState` do hub) e são passados como props em cada `<XModule dark={dark} setDark={setDark} .../>`. Removido o `useState` e a persistência duplicada de tema de cada módulo — o botão de sol/lua de qualquer tela (hub ou dentro de um módulo) agora chama o mesmo `setDark`, então alternar em qualquer lugar atualiza todas as telas. Documentado como convenção obrigatória em `LifeTree/CLAUDE.md` (raiz do repo) pra qualquer merge futuro de módulo.

### 🟢 Linhas da árvore inconsistentes (pontilhado vs sólido) e sem contraste — corrigido em 31/07/2026
**Onde:** `App.jsx`, componente `KabbalahTree`.

**Problema:** as 3 linhas-guia verticais tinham `strokeDasharray="3,5"` (pontilhadas) enquanto as linhas que conectam as sefirot eram sólidas — inconsistência visual. Além disso ambas usavam `stroke={C.b2}` (`#253040` no escuro, quase a cor do fundo) com opacidade baixa (0.1–0.4), ficando quase invisíveis no modo escuro.

**Correção:** removido `strokeDasharray` das guias (agora todas as linhas são sólidas) e trocado `stroke` de `C.b2` para `C.dim` (cor clara, mesma usada em textos secundários) nos dois grupos de linha, com opacidade mínima subida (0.4–0.9 conforme o score, antes 0.1–0.6).

### 🟢 Preenchimento das sefirot rígido demais — melhorado em 31/07/2026 (evolução do fix anterior)
**Onde:** `App.jsx`, componente `KabbalahTree`.

Depois do fix de 31/07 que fez o líquido subir com o score (`<rect>` clipado, ver seção acima), o topo do líquido ainda era uma linha reta perfeitamente horizontal — pedido do usuário pra parecer mais "onda". Substituído o `<rect>` por um `<path>` gerado (`buildWaveD`) com ondulação (amplitude ~1.7, comprimento de onda ~22 unidades), animado horizontalmente em loop contínuo via CSS (`@keyframes waveMove`, translateX contínuo) — a superfície do líquido ondula suavemente em vez de ter uma borda reta.

### 🟢 Barra do coach sobrepondo a bottom nav do módulo — corrigido em 31/07/2026
**Onde:** `App.jsx`, barra fixa do coach.

**Problema:** a barra usava `bottom: activeModule ? 0 : 64` — dentro de um módulo, ficava exatamente em cima da bottom nav do próprio módulo (também `bottom:0`), cobrindo os ícones.

**Correção:** `bottom:64` sempre, mesmo valor usado na tela principal — todos os módulos compartilham a mesma altura de bottom nav, então um único offset serve pra todos.

### 🟢 Carrossel Árvore/Status/Dash bloqueava o scroll vertical do mouse — corrigido em 31/07/2026
**Onde:** `App.jsx`, container do carrossel (`treeScrollRef`).

**Problema:** o container tem `scroll-snap-type:x` pra permitir arraste horizontal entre slides — isso capturava o wheel vertical do mouse quando o cursor estava sobre a Árvore, impedindo a página de rolar (as setas/bolinhas do carrossel ficavam invisíveis porque estavam abaixo da dobra e o usuário não conseguia descer até elas).

**Correção:** listener nativo de `wheel` com `{passive:false}` anexado via `useEffect` direto no elemento (não `onWheel` do React) — repassa deltaY pro `window.scrollBy` quando o gesto é predominantemente vertical. **Achado no processo:** `onWheel` do React é registrado como *passive* por padrão desde o React 17 (otimização de performance de scroll) — `e.preventDefault()` dentro dele **não tem efeito nenhum**, silenciosamente. Precisa de `addEventListener(..., {passive:false})` fora do React pra `preventDefault()` funcionar de verdade.

### 🟢 Modais de módulo (`Sheet`) presos atrás do coach bar — corrigido em 01/08/2026 (com uma regressão própria no meio do caminho)
**Onde:** `App.jsx` (wrapper do módulo ativo) e o componente `Sheet` dos 6 módulos.

**Problema original:** pra dar ações ao Coach no Yesod, os formulários de Add/Edit (`Sheet`, `zIndex:300`) precisavam aparecer por cima do coach bar (`zIndex:150`) — mas o `Sheet` fica renderizado **dentro** do wrapper do módulo ativo, que tinha `zIndex:100` (abaixo do coach bar, de propósito, pra esse ficar visível sobre o conteúdo normal do módulo). Como o `zIndex` de um elemento só é comparado dentro do stacking context do seu ancestral mais próximo com posicionamento, o `zIndex:300` do `Sheet` nunca "escapava" do teto de 100 do wrapper — o modal ficava clicável mas visualmente coberto pela barra do coach.

**Tentativa 1 (gerou uma regressão nova):** subir o `zIndex` do wrapper do módulo pra 160 (acima do coach bar). Resolveu os `Sheet`s, mas como o mesmo wrapper também contém o **conteúdo normal** do módulo, isso fez a bolha de resposta do coach (`zIndex:149`, com os botões Confirmar/Cancelar da ação — ver [[02 Arquitetura]]) ficar **coberta pelo conteúdo do módulo** quando a página estava rolada até certos pontos. Achado testando a confirmação de ações no navegador.

**Correção definitiva:** `createPortal(sheetJsx, document.body)` no componente `Sheet` — presente igual nos 6 módulos (Yesod, Hod, Tiphareth, Geburah, Chesed, Netzach), todos compartilhando o mesmo padrão. O modal escapa de vez do stacking context do wrapper, comparando seu `zIndex:300` direto contra o resto do app. Com isso o wrapper do módulo voltou pro `zIndex:100` original — a bolha de resposta do coach volta a aparecer por cima do conteúdo normal, e os `Sheet`s aparecem por cima de tudo via portal, independente do `zIndex` do wrapper.

**Regra geral:** qualquer modal fullscreen dentro de um módulo que precise aparecer acima de elementos fora daquele módulo (coach bar, outro overlay do hub) precisa de portal — não dá pra resolver só ajustando `zIndex`, porque o modal está preso no stacking context do ancestral.

### 🟢 Indicadores do dashboard do Yesod não eram persistidos — corrigido em 01/08/2026
**Onde:** `YesodModule.jsx`, estado `yesodCards` (quais dos 12 indicadores aparecem no card "INDICADORES" e em que ordem).

**Problema:** `yesodCards` nunca tinha um par carregar/salvar em `localStorage` — só existia em memória, então resetava pro padrão de 6 indicadores a cada reload da página, mesmo depois do usuário customizar em "Editar".

**Correção:** adicionado ao `loadFromStorage`/efeito de salvar, chave `lifetree_fin_yesodcards`.

### 🟢 Lançamentos em dinheiro não eram persistidos em lugar nenhum — corrigido em 01/08/2026
**Onde:** `YesodModule.jsx`, função `launch()` — branch `method==="dinheiro"` — e `yesodActions.js`, `createYesodTransaction`.

**Problema:** ao registrar um lançamento com meio de pagamento "Dinheiro", o código tinha um branch vazio (`/* dinheiro não vincula conta — registrado sem saldo */`) — nada era salvo, o valor simplesmente desaparecia. Não afetava saldo de conta, fluxo de caixa nem orçamento. Confirmado que era assim tanto no formulário manual quanto na ação do Coach (que retornava um erro avisando isso em vez de fingir sucesso).

**Correção:** criada uma conta virtual fixa "Carteira" (`CASH_ACC_ID="cash-wallet"`, `isCash:true`, sem `bankId`) dentro do próprio array `accs` — reaproveita o modelo de conta existente em vez de um ledger paralelo. Todo lançamento em dinheiro (form manual e Coach, mesmo id fixo replicado em `yesodActions.js`) vai pra ela, então passa a contar em saldo/fluxo de caixa/orçamento/patrimônio líquido como qualquer outra conta. Usuários com dados salvos antes da mudança ganham a conta automaticamente via efeito de migração na primeira carga. Detalhe completo em [[09 Yesod]].

### 🟢 Barra do Coach não seguia a cor do módulo ativo — corrigido em 01/08/2026
**Onde:** `App.jsx`, barra fixa do Coach (ícone lótus, botão de enviar, botão Confirmar).

**Problema:** as 3 cores da barra eram hardcoded (`#818cf8` roxo, `#c084fc` roxo claro, `#10b981` verde — esse último copiado do Yesod). Dentro do Geburah (identidade vermelha, `ACCENT:"#ef4444"`) a barra continuava roxa/verde; dentro do próprio Yesod (identidade verde) só o botão Confirmar acertava a cor por coincidência, o resto seguia o roxo do hub — dava a impressão de que o módulo "não tinha identidade visual própria" mesmo o resto da tela já usando a cor certa.

**Correção:** mapa `MODULE_ACCENTS` em `App.jsx` (`{yesod:"#10b981", hod:"#f97316", tiphareth:"#f59e0b", geburah:"#ef4444", chesed:"#ec4899", netzach:"#84cc16"}`, mesmo hex que cada `*Module.jsx` já usa na própria constante `ACCENT`) + `coachAccent = MODULE_ACCENTS[activeModule] || HUB_ACCENT` aplicado nos 3 pontos da barra. Detalhe e regra pra módulo novo em [[02 Arquitetura]] → "Coach de IA — a barra segue a cor do módulo ativo".

### 🟢 LIGHT do Hod copiava a paleta neutra do hub em vez da cor da própria sefira — corrigido em 09/08/2026
**Onde:** `HodModule.jsx`, constante `LIGHT` (linha ~8).

**Problema:** `LIGHT` do Hod era azul/índigo (`bg:"#eef1f9", b1:"#c4cfe6", b2:"#98aacf", muted:"#556080"`) — a mesma paleta neutra do hub (`App.jsx`) — em vez de tingida na cor do próprio `ACCENT` (`#f97316`, laranja), como Yesod (verde), Geburah (vermelho) e Chesed (rosa) já faziam corretamente. Resultado: o modo claro do Hod parecia "a tela da Árvore da Vida" em vez de "a tela do Hod" — achado pelo usuário comparando visualmente os módulos.

**Correção:** `LIGHT` retingido em laranja (`bg:"#fff7ed", card:"#fffaf3", b1:"#fed7aa", b2:"#fb923c", muted:"#8a5a2e", dim:"#452405"`). `DARK` não mudou — continua neutro e idêntico entre módulos, só o `ACCENT` muda por módulo (isso é intencional, ver regra abaixo). Virou diretriz permanente, com checklist e exemplos de hex de cada módulo — ver [[02 Arquitetura]] → "Diretriz de UI — LIGHT tintado por sefira, DARK sempre neutro".

**Não confundir com o bug de "Tema global mutável (C)" abaixo** — são dois problemas independentes no mesmo arquivo: um é *qual cor* o `LIGHT` usa (esse aqui, corrigido), o outro é *como* `C` é reatribuído (`let C` global mutável em vez de `const C` local — continua ativo no Hod, não fazia parte do escopo dessa correção).

## Segurança, Android e performance (10/08/2026)

> Levantado numa auditoria dedicada, separada da auditoria de módulos do dia anterior — ver artefato web linkado em [[01 Estado Atual]] e detalhe completo em [[10 Segurança, Mobile e Performance]]. Achados verificados direto no código (`preview/`, `app/native/`, configs de build e do proxy), não suposição.

### 🟡 Proxy do Coach (`/api/coach`) é um endpoint aberto — rate limit adicionado em 15/08/2026, autenticação de chamador ainda não
**Onde:** `preview/api/coach.js` (produção, Vercel) e o middleware equivalente em `preview/vite.config.js` (dev), agora com `preview/api/_lib/rateLimit.js` compartilhado entre os dois.

**Problema original:** nenhum dos dois exigia autenticação de quem chama, não havia rate limit, não havia restrição de CORS/origem, e não havia limite de tamanho de payload — só validava que `messages` é um array não vazio. A `ANTHROPIC_API_KEY` continua segura (nunca vai pro bundle do client), mas quem descobrisse a URL publicada podia gerar chamadas por conta da chave do dono — risco de abuso de custo/cota, não de vazamento dos dados já salvos localmente.

**Correção parcial aplicada:** limitador em memória por IP (20 requisições/10min, `429` + header `Retry-After` quando estoura), limite de payload (32KB, `413` se exceder) e clamp server-side de `maxTokens` (máx. 1500, independente do que o client pedir) — os três em `rateLimit.js`, aplicados tanto no `coach.js` de produção quanto no middleware de dev. Testado: 22 chamadas seguidas via `fetch` no console → as ~20 primeiras passam (respondidas pela Anthropic de verdade), as últimas voltam `429` sem chegar na API.

**Limitação conhecida da correção:** o limitador é em memória — numa Vercel serverless function real, cada invocação pode cair num container novo sem estado compartilhado entre elas, então não é uma garantia dura contra abuso distribuído/multi-container. Reduz o cenário mais comum (mesmo IP batendo repetido na URL), mas autenticação de chamador de verdade (ex: token por sessão) e/ou um rate limit com store externo (Redis/Upstash) continuam como possível próximo passo se o tráfego real justificar.

### 🟡 Dados sensíveis sem criptografia em repouso e sem trava de acesso ao app
**Onde:** todo o app — `localStorage` sob os prefixos `lifetree_*`.

**Problema:** finanças, saúde, medidas, remédios (quando existirem), relacionamentos — tudo em texto puro no `localStorage`, sem PIN/biometria pra abrir o app. Acesso físico ao dispositivo (ou ao perfil do navegador) é acesso total, sem fricção.

### 🟡 Backup exporta tudo em texto puro pro clipboard
**Onde:** `App.jsx`, `doExport` (Config → Backup) — ver [[02 Arquitetura]] → "Backup / Restore / Reset".

**Problema:** o JSON completo (inclusive dados financeiros e de saúde) é copiado pra área de transferência do sistema. Colar no lugar errado (chat, campo de busca, formulário) expõe o conteúdo inteiro.

### 🟡 `app/native/` está completamente vazio — confirmado, não "não auditado"
**Onde:** `LifeTree/app/native/`.

**Problema:** docs anteriores descreviam essa pasta como "existe mas não foi auditada em profundidade" — checado nesta auditoria (`Get-ChildItem -Recurse`): **zero arquivos**, nenhum código Expo/React Native foi de fato começado. A dependência `react-native-svg` em `preview/package.json` não é importada em nenhum lugar de `preview/src` — resíduo morto, não indício de esforço real. Corrigido o registro em [[09 Auditoria de Código vs Documentação]].

### 🟡 Sem PWA — nenhuma mudança desde o Roadmap original
**Onde:** `preview/public/` (só `favicon.svg`/`icons.svg`).

**Problema:** sem `manifest.json`, sem service worker — item já estava no [[05 Roadmap]] como pendente, confirmado ainda pendente.

### 🟡 Sem code splitting — bundle inicial carrega os 6 módulos inteiros
**Onde:** `preview/src/main.jsx` → `App.jsx` → import direto dos 6 `*Module.jsx`.

**Problema:** nenhum `React.lazy`/`Suspense`. Um usuário que só abre a Árvore baixa `App.jsx` (2.526 linhas) + os 6 módulos (473 a 2.358 linhas cada) de uma vez.

### 🟡 Arquivos monolíticos — parcialmente corrigido (Geburah e Hod fatiados em 22/08/2026; `App.jsx` e os outros 6 módulos seguem inteiros)
**Estado original:** `App.jsx` e `GeburahModule.jsx` passavam de 2.000 linhas, sem quebra em subcomponentes/hooks — dificultava manutenção e tendia a re-renderizar mais do que precisa. Ligado ao bug já corrigido "Tema global mutável (C)" abaixo, presente nos mesmos arquivos.

**Correção parcial:** `GeburahModule.jsx` (1795→527 linhas) e `HodModule.jsx` (1768→309 linhas) fatiados em subarquivos por domínio com um `React.createContext` por módulo — ver [[02 Arquitetura]] → "Decomposição de módulo grande em subarquivos" e [[11 Plano de Decomposição — Arquivos Monolíticos]] (item 5) pro detalhe completo. `App.jsx` (1232 linhas) e os outros 6 módulos (`YesodModule.jsx`, `TipharethModule.jsx`, `ChesedModule.jsx`, `NetzachModule.jsx`, `ChokmahModule.jsx`, `BinahModule.jsx`) continuam inteiros, sem data marcada.

### 🟡 Zero testes automatizados no projeto inteiro
Nenhum arquivo `*.test.*` fora de `node_modules` (confirmado por glob). Toda a lógica de score, as 34 ações do Coach no Yesod e os cálculos financeiros/de saúde dependem só de teste manual no navegador.

### 🟢 Lint existe mas não roda em CI
`npm run lint` (ESLint 10 + `eslint-plugin-react-hooks`) só é acionado manualmente — não bloqueia nada automaticamente, mas também não é um bug ativo, é uma lacuna de processo.

## Usabilidade — teste ao vivo (14/08/2026)

> Primeira auditoria feita testando ao vivo no navegador (`claude-in-chrome`, dados de teste populados nos 8 módulos, Coach acionado de verdade), não por leitura de código — por isso achou coisas que as auditorias de 09/08 e 10/08 não pegaram. Parecer completo, com SWOT, benchmarks de mercado e nota por módulo, publicado como [artefato web](https://claude.ai/code/artifact/1e53f8fe-faea-4241-8b7f-6abbe822f85a). Resumo em [[01 Estado Atual]].

### 🟢 Bug de input decimal — corrigido em 15/08/2026, nos 9 arquivos
**Onde:** componente `FI` (input de formulário numérico), duplicado idêntico em `YesodModule.jsx`, `GeburahModule.jsx`, `HodModule.jsx`, `TipharethModule.jsx`, `ChesedModule.jsx`, `NetzachModule.jsx`, `ChokmahModule.jsx`, `BinahModule.jsx` e `App.jsx` — confirmado por busca no código, mesmo trecho nos 9:
```js
onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
```

**Problema:** `Number(e.target.value)` roda a cada tecla digitada. No estado intermediário `"245."` (ponto sem dígito seguinte, digitando um decimal), o navegador considera número inválido e `e.target.value` vira string vazia — `Number("")` é `0`, e como é input controlado, o campo reseta pra `0` no meio da digitação, descartando tudo antes do ponto. Reproduzido ao vivo: digitar `245.90` no campo "Valor (R$)" do Yesod salvou a transação como `90`; digitar `83.5` no campo "Peso (kg)" do Geburah salvou `05`. Sem nenhum erro visível — o dado errado é salvo silenciosamente, só aparece conferindo o registro depois. Afeta qualquer campo decimal do app: dinheiro, peso, %gordura corporal, % de split de despesa.

**Correção aplicada nos 9 arquivos:** cada `FI`/`FInp` ganhou estado local de texto (`useState`) que só ressincroniza do valor externo quando o campo não está focado (`onBlur`) — o `<input>` virou `type="text" inputMode="decimal"` (nunca mais reporta `""` no estado intermediário, já que não é mais `type="number"`), mas `onChange` continua sempre emitindo um `Number` pro componente pai, então nenhum call site precisou mudar. Testado ao vivo: `245.90` no Yesod salvou `245.9` (confirmado em `localStorage`); `83` + vírgula no Geburah salvou `83` corretamente (peso registrado). Zero erros de console após a mudança.

### 🟡 Erro cru da API do Coach vaza pro usuário final
**Onde:** tratamento de erro da chamada ao Coach (hub e módulos).

**Problema:** quando o billing do proxy falha (já documentado, ver "Proxy do Coach" acima), a mensagem mostrada na tela é o texto cru da API da Anthropic, em inglês: `"Erro de conexão: Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."` — cita "Anthropic API" e "Plans & Billing" direto pro usuário final. A causa (billing) já era conhecida; o vazamento do texto técnico pra UI é achado novo.

**Ação recomendada:** capturar o erro antes de exibir e trocar por mensagem amigável/localizada (ex: "O Coach está indisponível agora, tente de novo mais tarde").

### 🟡 Toast de erro do Coach não some sozinho
**Onde:** sistema de toast do hub.

**Problema:** toasts de sucesso ("Saída registrada", "Pesagem registrada") somem em ~2s como esperado. O toast de erro do Coach ficou preso na tela por mais de dez navegações seguidas no teste ao vivo, cobrindo parte do rodapé/nav em telas menores.

**Ação recomendada:** aplicar o mesmo timeout de auto-dismiss dos toasts de sucesso ao toast de erro.

### 🟢 Páginas genéricas de Kether/Malkuth mostravam 50% de progresso sem nenhum dado — corrigido em 15/08/2026
**Onde:** `saScore`/`arScore` (funções puras de score, usadas pela página genérica de área — Kether/"Desejos" e Malkuth/"Pessoal" — e por `aScoresBase`, que alimenta o líquido da árvore pros mesmos 2 sefirot).

**Problema:** `saScore` retornava `0.5` (50%) como fallback quando uma sub-área não tinha nenhum hábito ou meta cadastrado — lido como progresso real pelo usuário, tanto na página genérica quanto no preenchimento da árvore (mesmo comportamento já registrado em 28/07/2026 na entrada "Sefirot não enchiam visualmente", ali tratado como esperado; achado o mesmo problema de novo em 14/08/2026 testando ao vivo, ali só documentado).

**Correção:** fallback trocado de `0.5` pra `0` em `saScore` e `arScore` — sub-área/área sem nenhum dado agora mostra `0%` de verdade. Junto, o card de score da página genérica (usado só por Kether e Malkuth) foi reestruturado pra bater com o padrão dos outros 8 módulos: rótulo + número grande (46px) com `%` inline (18px) + as sub-áreas como caixinhas clicáveis ao lado (em vez da seção "SUB-ÁREAS" separada abaixo, que foi removida por ficar redundante) + barra de progresso. Malkuth mantém "Reino" como rótulo secundário (não "Pessoal") — mesma exceção já registrada na correção de nomenclatura das sefirot. Testado ao vivo: hábito criado e marcado como feito no Kether → sub-área foi a 100%, área total foi a 35% (média ponderada correta pelas 3 sub-áreas), líquido da árvore também atualizou.

### 🟢 `no-empty` não tinha `allowEmptyCatch` — corrigido em 13/08/2026
**Onde:** `preview/eslint.config.js`.

**Problema:** todo módulo (App.jsx + os 6 `*Module.jsx`) usa `catch{}`/`catch(_){}` vazio intencionalmente em leitura/escrita de `localStorage` (dado corrompido ou quota excedida não deve derrubar a tela) — um padrão consistente, não descuido. Sem a opção `allowEmptyCatch`, cada uma dessas dezenas de ocorrências era reportada como erro de `no-empty`, empatando com ruído real de lint.

**Correção:** `rules: { 'no-empty': ['error', { allowEmptyCatch: true }] }` adicionado à config raiz — resolve globalmente (não só no Hod, onde foi achado). Achado e corrigido enquanto se limpava o lint noise do Hod (ver [[08 Hod]]); catches com parâmetro `_` não usado (`catch(_)`) também foram trocados por `catch` sem parâmetro (`no-unused-vars`) no Hod especificamente — os outros módulos ainda têm o padrão antigo (`catch(_)`), que agora só dispara `no-unused-vars`, não mais `no-empty`.

---

## Padrões e regras gerais (aplicam-se a novos módulos)

## 🔴 IIFEs no JSX — CRÍTICO
**Problema:** `{condição && (()=>{ return (<JSX/>) })()}` quebra no Vite/esbuild.

**Solução:** Substituir por função nomeada:
```jsx
// ❌ ERRADO
{tab === "home" && (()=>{ return (<div>...</div>) })()}

// ✅ CORRETO
{tab === "home" && (function HomeTab(){ return (<div>...</div>) }())}
```

## 🔴 window.storage — CRÍTICO para integração
**Problema:** Módulos originais usam `window.storage` (API do Claude artifacts) que não existe no Vite.

**Solução:** Substituir por localStorage direto:
```js
// ❌ ERRADO
await window.storage.get("chave")
await window.storage.set("chave", valor)

// ✅ CORRETO
const PREFIX = "lifetree_";
localStorage.getItem(PREFIX + "chave")
localStorage.setItem(PREFIX + "chave", JSON.stringify(valor))
```

## 🟢 retroPatrim / funções pesadas sem useMemo — já corrigido no código
**Problema:** Funções que recalculam histórico rodam todo render.

**Confirmado no código (`YesodModule.jsx`):** `retroPatrimData` já está envolvido em `useMemo`:
```js
const retroPatrimData = useMemo(() => {
  // reconstrói patrimônio líquido histórico dos últimos 6 meses
}, [accs, debts, totBox, totInv, patrimSnaps]);
```

## 🟢 stmtDue — edge case cartão (closeDay >= dueDay) — já corrigido no código
**Problema:** Vencimento calculado antes do fechamento quando closeDay >= dueDay.

**Solução (já aplicada em `YesodModule.jsx`):**
```js
const stmtDue = (pd, closeDay, dueDay) => {
  const d = new Date(pd + "T12:00:00");
  let m = d.getMonth(), y = d.getFullYear();
  if (d.getDate() > closeDay) { m++; if (m > 11) { m = 0; y++; } }
  // Fix: se fechamento >= vencimento, vencimento vai para mês seguinte
  let dm = m, dy = y;
  if (closeDay >= dueDay) { dm++; if (dm > 11) { dm = 0; dy++; } }
  return new Date(dy, dm, dueDay).toISOString().slice(0,10);
};
```

## 🟢 Tema global mutável (C) — corrigido nos 6 módulos (Geburah 12/08, Hod/Tiphareth/Chesed/Netzach 13/08/2026)
**Problema:** `let C = {...LIGHT}` no escopo do módulo, reatribuído dentro do componente a cada render (`C = dark ? DARK : LIGHT`) em vez de `const C` escopado localmente.

**Todos os 6 módulos corrigidos.** [[Yesod]] e o hub (`App.jsx`) já usavam o padrão correto desde antes; [[Geburah]] (12/08), [[Hod]], [[Tiphareth]], [[Chesed]] (`_C`) e [[Netzach]] corrigidos em 13/08/2026.

**Solução aplicada — não é só `let`→`const`:** ver [[05 Geburah]] → "Padrão de tema", [[08 Hod]] → "Padrão de tema", [[06 Tiphareth]] → "Padrão de tema", [[04 Chesed]] → "Padrão de tema" e [[07 Netzach]] → "Padrão de tema". `Sheet`/`FI`/`FTA`/`FS`/`Card`/`ProgressBar` liam `C` por closure de módulo em dezenas de call sites, então trocar pra `const` local exigiria aninhar essas funções dentro do componente (recriando sua identidade a cada render — risco de desmontar/remontar inputs abertos) ou passar `C` como prop em todos os call sites. Solução: `React.createContext` (`ThemeCtx`), montado uma vez com `<ThemeCtx.Provider value={C}>` no root do componente; as funções (continuam em escopo de módulo, identidade estável) leem via `useContext(ThemeCtx)`. No Hod, um helper de módulo (`chipStyle`) também lia `C` por closure fora de qualquer componente — resolvido passando `C` como parâmetro explícito. No Tiphareth, o Provider precisou envolver **dois** pontos de retorno (tela de "carregando" + tela principal), não só um. No Chesed, o hook `useTheme()` já existia como uma camada de indireção sobre a variável mutável (`const useTheme = () => _C`) — a correção ficou mais simples: só trocar o que `useTheme()` retorna. No Netzach, os componentes de UI compartilhada (`Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar`) não tinham indireção nenhuma (liam `C` direto por closure) — ganharam `useTheme()` do zero, um call site por componente. Sequenciamento completo em [[11 Plano de Decomposição — Arquivos Monolíticos]] (item concluído).

## 🟢 Componentes de aba recriados a cada render — corrigido nos 6 módulos (Geburah e Hod variante, Tiphareth/Chesed/Netzach 13/08/2026)
**Onde (histórico, Geburah):** `GeburahModule.jsx` — `GebTab`, `TreinoTab`, `NutriTab`, `PlanejamentoTab`, `MedidasTab`, `ConfigTab`, `LogTreinoPage`, `WidgetEditorSheet`, todas declaradas como `const XTab = () => {...}` **dentro** do corpo de `GeburahModule` e renderizadas como `<TreinoTab/>` etc.

**Problema:** cada uma dessas "abas" era uma nova identidade de função a cada render de `GeburahModule` — o React tratava como um componente diferente na árvore e desmontava/remontava a instância anterior, perdendo qualquer estado interno próprio (`TreinoTab`, por exemplo, tinha `useState` pra sub-view e grupo de exercício selecionado). Como `GeburahModule` re-renderiza com frequência (qualquer `setState` de qualquer campo do módulo), isso podia reverter a navegação interna de uma aba pro estado inicial em momentos inesperados.

**Como foi achado:** eslint (`react-hooks/static-components`, regra nova o suficiente pra não existir quando esse trecho foi escrito) rodado como checagem do fix de "Tema global mutável" acima — não foi um bug procurado, apareceu no lint de verificação.

**Correção aplicada no Geburah (12/08/2026):** duas partes. (1) O `useState` que morava dentro de `TreinoTab` (sub-view + grupo/nível da biblioteca) e `NutriTab` (sub-view) subiu pro escopo de `GeburahModule`, junto dos outros blocos de estado já hoisted anteriormente (`medExpanded`/`fotos` etc.) — sem isso, chamar as funções sem JSX (próximo passo) violaria as Rules of Hooks, já que só uma das 6 abas é chamada por vez (`&&` condicional). (2) Os 8 call sites trocaram de JSX (`<TreinoTab/>`) pra chamada direta (`{tab==="treino" && TreinoTab()}`) — como são plain function calls, não instanciação de componente React, o retorno é inlined na árvore do próprio `GeburahModule`, sem identidade própria pra desmontar/remontar. Confirmado por eslint (0 ocorrências de `react-hooks/static-components` em `GeburahModule.jsx` depois da mudança) e verificado no navegador: selecionar um grupo/nível na biblioteca de exercícios e forçar um re-render do módulo (toggle de tema) preserva a navegação, que antes resetava. Detalhe em [[05 Geburah]].

**Confirmado ativo (12/08/2026) em Chesed (6 ocorrências), Netzach (5) e Tiphareth (6, corrigido em 13/08/2026 — ver abaixo)** via `eslint --format json` contando `react-hooks/static-components` por arquivo. **No Tiphareth, uma das 6 é `WidgetCustomizer`** (a sheet de personalizar dashboard, não uma aba do menu inferior) — mesma correção mecânica, só troca de `<WidgetCustomizer/>` por `WidgetCustomizer()`.

**⚠️ Correção de registro (13/08/2026):** a checagem de 12/08 tinha concluído "Hod e Yesod não têm esse problema" só porque nenhum dos dois aparecia na contagem de `react-hooks/static-components` — conclusão errada, corrigida no dia seguinte ao ler o código do Hod de perto pra resolver os gaps do módulo. **Yesod de fato não tem o problema** (usa o padrão IIFE seguro — `(function Nome(){ return jsx })()`, chamado diretamente, não `<Nome/>`). **Hod tinha uma variante que o lint não pega:** `renderTab()`/`renderPage()` eram funções que **retornavam** `<HodTab/>`/`<ProjectPage/>` etc — a regra do eslint não atravessa essa indireção (só olha se o JSX aparece direto no corpo do componente), por isso ficou invisível na contagem, mas o efeito é o mesmo: `HodTab` é redefinida a cada render de `HodModule`, então `<HodTab/>` muda de identidade e o React remonta a subárvore a cada interação. **Corrigido no Hod em 13/08/2026:** nenhum Tab/Page do Hod tinha `useState` próprio (todo estado já morava em `HodModule`), então a correção foi só trocar `<HodTab/>` por `HodTab()` nos 2 pontos de despacho (`renderPage`/`renderTab`) — sem precisar de hoisting de estado. Verificado no navegador (digitar num campo de texto sem perder foco, e nenhuma regressão de navegação). Detalhe em [[08 Hod]].

**Corrigido no Tiphareth, mesma leva (13/08/2026):** padrão "clássico" (igual o Geburah original) — `<TiphTab/>` etc direto no JSX, não a variante disfarçada do Hod. Nenhuma das 6 tinha `useState` próprio, correção só trocou `<X/>` por `X()`. Confirmado por eslint (zero achados no arquivo depois da mudança) e no navegador. Detalhe em [[06 Tiphareth]].

**Corrigido no Chesed, sessão seguinte (13/08/2026):** também padrão "clássico" — `ChedsedTab`, `PessoasTab`, `PessoaPage`, `DatasTab`, `RegistrosTab`, `ConfigTab` (as 6 ocorrências já confirmadas em 12/08), nenhuma com `useState` próprio. Mesma correção mecânica. Detalhe em [[04 Chesed]].

**Corrigido no Netzach, mesmo dia (13/08/2026) — último módulo:** padrão "clássico" — `NetzTab`, `LazerTab`, `LarTab`, `ExpTab`, `ConfigTab` (5 ocorrências), nenhuma com `useState` próprio. Mesma correção mecânica. Com esse, os 6 módulos ficam livres desse bug. Detalhe em [[07 Netzach]].

Lição que valeu a pena registrar (ver [[11 Plano de Decomposição — Arquivos Monolíticos]]): não confiar só na contagem de `react-hooks/static-components` ao avaliar um módulo novo — procurar também por funções que retornam JSX de componente (`return <X/>`) em vez de só procurar `<X/>` direto no JSX do componente (foi o caso do Hod).

## 🟢 Dark mode deve vir de prop do hub, nunca `useState` local do módulo — regra nova (31/07/2026)
**Problema evitado:** ver "Modo escuro não sincronizava entre módulos" acima — cada módulo tendo seu próprio estado de tema quebra a sincronização com o resto do app.

**Regra pra qualquer módulo novo ou merge de `modules/<area>` pra `preview/src`:**
```jsx
// ❌ ERRADO — módulo dono do próprio tema
export default function XxxModule({ onBack }) {
  const [dark, setDark] = useState(false);
  const C = dark ? DARK : LIGHT;
  ...
}

// ✅ CORRETO — tema vem de fora, hub é a única fonte de verdade
export default function XxxModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  ...
}
```
E em `App.jsx`, todo `<XxxModule .../>` deve passar `dark={dark} setDark={setDark}`. O botão de sol/lua dentro do módulo continua igual — só chama o `setDark` recebido por prop. Nunca adicionar uma chave própria de `localStorage` pra persistir o tema de um módulo (ex: `lifetree_x_dark`) — isso também já foi um bug (Yesod tinha uma, corrigida). Regra espelhada em `LifeTree/CLAUDE.md` (raiz do repo), que qualquer sessão de código deve carregar automaticamente.

### 🟢 prMap contava série ainda não executada como recorde pessoal (Geburah) — corrigido em 12/08/2026
**Onde:** `GeburahModule.jsx`, cálculo de `prMap`.

**Problema:** o loop que calcula PR (recorde pessoal) por exercício somava `cargaReal`/`repsReal` de **toda** série de todo `logTreino`, sem checar `s.feito` — como uma série recém-criada (ao clicar "Iniciar") já nasce com `cargaReal` pré-preenchida com a carga alvo da rotina, só *iniciar* um treino já registrava um "PR" igual à carga planejada, mesmo sem nenhuma repetição de fato executada.

**Como foi achado:** testando a sugestão de carga baseada em PR (item novo, ver [[05 Geburah]]) — o hint mostrava "PR: 60kg" pra um treino que tinha acabado de começar, sem nenhuma série marcada como feita.

**Correção:** loop agora ignora séries com `s.feito!==true` antes de considerar pro PR. Verificado no navegador: suggestion/badge de PR só aparece depois que a série é de fato marcada como concluída.

## Yesod — auditoria de código, UX e performance (26/08/2026)

> Pedido do usuário depois da leva de despesas divididas bidirecionais (a receber/a pagar, modo de acerto conta-a-conta/líquido por pessoa): "análise completa das funcionalidades do módulo, da qualidade da experiência do usuário, da performance e do código, parecer honesto". Levantamento feito lendo `YesodModule.jsx` inteiro (1985 linhas), `yesodActions.js` inteiro, `App.jsx`, cruzado com [[11 Plano de Decomposição — Arquivos Monolíticos]] e este próprio documento. Build de produção rodado de verdade pro número de bundle. Itens abaixo entram priorizados em [[05 Roadmap]].

### 🟢 `saveEditTx` ignorava o princípio de "dinheiro precisa se mover antes de status mudar" — corrigido em 26/08/2026
**Onde:** `YesodModule.jsx`, `saveEditTx` (sheet "Editar Lançamento", toggle "Pendente/Acertado").

**Problema:** o próprio módulo declara em comentário (linhas ~370-377) que o status de uma despesa dividida só pode virar "acertado" quando dinheiro de verdade se move numa conta — foi exatamente por isso que `receiveSplit`/`paySplit`/`netSettle` existem (os dois últimos construídos nesta sessão, seguindo essa mesma regra). Mas `saveEditTx` escrevia `settled:!!f.splitSettled` direto do toggle do formulário, sem gerar nenhuma transação. Editar um lançamento dividido por qualquer motivo (corrigir a descrição, por exemplo) permitia marcar "Acertado" sem nenhum reembolso/pagamento real ter acontecido — subestimava o patrimônio líquido de forma silenciosa, sem transação que explicasse a mudança. Bug pré-existente (não introduzido na sessão de 26/08), mas duas ações novas daquele dia (`paySplit`/`netSettle`) passaram a depender da mesma regra sem essa brecha ter sido fechada.

**Correção:** removido o toggle "Pendente/Acertado" de dentro de "Editar Lançamento" — `f.splitSettled` continua carregando o valor original da transação (setado ao abrir o sheet) mas não é mais editável pela UI, então `saveEditTx` sempre preserva o status como estava. Quem quer acertar usa `receiveSplit`/`paySplit`/`netSettle`, os únicos caminhos que geram a transação real. Verificado no navegador: editar "Internet Compartilhada" (despesa dividida já recebida) não mostra mais o toggle, formulário vai direto de "% que a outra pessoa paga" pro botão Salvar.

### 🟢 Card "Despesas Divididas" cortava em 8 itens sem jeito de ver o resto — corrigido em 26/08/2026
**Onde:** `YesodModule.jsx`, card "DESPESAS DIVIDIDAS" (`combined.slice(0,8)`).

**Problema:** os totais "a receber"/"a pagar" no topo do card sempre somaram a lista completa de pendências, mas só as 8 primeiras apareciam na tela. A partir da 9ª pendência (plausível num casal usando "conta a conta" no dia a dia), o total mostrado deixava de bater com o que dava pra tocar — e não existia nenhum outro lugar no app pra acertar o item que ficasse de fora (extrato da conta só mostra split como texto sem ação; "Índice de tudo" do Config não lista despesas divididas). O item ficava invisível e inacertável até outras pendências fecharem e empurrarem ele de volta pro topo.

**Correção:** adicionado estado `despesasExpanded` — a lista mostra os 8 mais recentes por padrão, com um botão "Ver mais N pendências" que expande pra lista inteira (e "Ver menos" pra recolher) quando há mais de 8. Os totais já somavam tudo desde antes; agora todo item que compõe o total também é alcançável pra acertar.

### 🟡 `sharedOwed`, `splitPeople` e `recurrings` não têm fluxo de edição
**Onde:** `YesodModule.jsx`.

**Problema:** toda outra entidade do módulo (Conta, Cartão, Caixinha, Dívida, Investimento) tem sheet de editar; essas três só têm adicionar+apagar. Um erro de digitação (valor/descrição de uma despesa "a pagar", nome de uma pessoa, valor de uma recorrência) só se corrige apagando e recriando — no caso de `recurrings`, apagar perde toda a configuração (frequência, categoria, split) sem confirmação.

**Ação recomendada:** adicionar `editOwed`/`editSplitPerson`/`editRecurring`, mesmo padrão dos sheets já existentes (`editAcc`, `editDebt` etc.).

### 🟢 Nenhum delete/edição do Yesod pedia confirmação — corrigido em 26/08/2026, agora configurável
**Onde:** `YesodModule.jsx` — 9 deletes de entidade (`delAcc`, `delBank`, `delCard`, `delBox`, `delDebt`, `delInv`, `delRecurring`, `delSplitPerson`, `delOwed`) e 7 "Salvar" de edição (`editBank`, `editAcc`, `editCard`, `editBox`, `editDebt`, `editInv`, `saveEditTx`).

**Problema:** `delAcc` em particular apagava a conta **e o array inteiro de transações dela** — potencialmente meses de histórico — sem confirmação e sem undo (dado só existe em `localStorage`, não tem "restaurar do servidor"). Um toque errado no ícone pequeno de X era irreversível.

**Correção:** nova chave `confirmDestructive` em Config → Preferências → Segurança ("Confirmar antes de editar/apagar", **default ligado**, o usuário escolhe explicitamente desligar se quiser). Helper `guard(run, msg, danger)` abre um sheet de confirmação genérico antes de rodar a ação real quando a chave está ligada, e roda na hora quando desligada — aplicado nos 9 deletes e nas 7 edições de entidade acima. Deletar um lançamento isolado ou uma categoria continua instantâneo de propósito (baixo risco, alta frequência — guardar isso violaria o princípio de fricção zero do próprio roadmap). Testado no navegador nos dois estados: com a chave ligada, apagar um cartão abre "Confirmar Exclusão" com o nome do cartão e o aviso de que não pode ser desfeito; com a chave desligada, o mesmo delete acontece na hora, como sempre foi.

### 🟢 Coach (`yesodActions.js`) sem paridade com a leva de despesas divididas bidirecionais — corrigido em 26/08/2026
**Onde:** `preview/src/shared/yesodActions.js` e `preview/src/shared/coachSkills.js` (`buildYesodContext`).

**Problema:** busca por `sharedOwed`, `settlementMode`, `payer`, `netSettle`, `paySplit` no arquivo inteiro: zero ocorrências. `markYesodSplitSettled` cobria corretamente o lado antigo (eu pago, o outro me deve), mas não existia ação nenhuma pra: registrar uma despesa que a outra pessoa pagou, quitar um pagamento pendente, fazer um acerto líquido, ou ler/mudar o modo de acerto (`item`/`net`) de uma pessoa. Pedir pro Coach "registra que minha esposa pagou o mercado, devo a metade" não tinha caminho de código pra funcionar — metade das duas interfaces do módulo (toque vs. chat) não via a feature nova. Além disso, `patrimonio_liquido` calculado pelo Coach nunca descontava as pendências "a pagar" — divergia silenciosamente do que a UI mostrava sempre que houvesse alguma.

**Correção:** 5 ações novas em `yesodActions.js` (`create_owed`, `delete_owed`, `pay_owed`, `net_settle`, `set_settlement_mode`), registradas em `YESOD_ACTION_HANDLERS` e documentadas no prompt do Coach (`coachSkills.js`, ações 57-61). `buildYesodContext` ganhou `totalAPagar` (mesma lógica de `totPayable` em `YesodModule.jsx`) subtraído de `patrimonio_liquido`, mais os campos `despesas_a_pagar` e `a_pagar_despesas_divididas` no resumo, e `pessoas_divisao_despesas` passou a incluir `modo_acerto` por pessoa. Orientação proativa atualizada pra sugerir `net_settle` quando a mesma pessoa aparece em `divisoes_pendentes` e `despesas_a_pagar` ao mesmo tempo.

### 🟡 `netSettle` pode absorver silenciosamente uma pendência criada depois de o sheet abrir
**Onde:** `YesodModule.jsx`, `netSettle()`.

**Problema:** o sheet de acerto líquido calcula `net`/`count` no momento de abrir (`openSh("netSettle", {net: g.net, count: g.count, ...})`), mas a confirmação varre **todas** as pendências ainda abertas daquela pessoa no momento do clique, não só as do snapshot mostrado. Se uma nova pendência daquela pessoa aparecer entre abrir e confirmar (ex: uma recorrência dividida disparando em segundo plano), ela entra no acerto sem nunca ter aparecido no banner — justamente a feature cujo objetivo era deixar claro o que está sendo acertado, pra evitar registro errado. Janela estreita, app de um usuário só, mas é uma inconsistência real.

**Ação recomendada:** recalcular `net`/`count` a partir do estado atual no clique de "Confirmar Acerto", não confiar no snapshot de abertura.

### 🟢 Quase zero memoização — `cashflowMonth`/`allTxs` recalculados do zero em cada render — corrigido em 26/08/2026
**Onde:** `YesodModule.jsx` — só 1 `useMemo` no arquivo inteiro (`retroPatrimData`). `allTxs()` (varredura completa de contas+cartões) era chamada em 4 pontos; `cashflowMonth()` (que chamava `allTxs()` internamente e filtrava a lista inteira de novo por cima) era chamada **13 vezes** só dentro da view de Fluxo, várias dentro de loops `[-5..0].map()`.

**Problema:** invisível com dado de seed (dezenas de transações). Sem nenhuma barreira de memoização entre estado e essas recomputações, cada tecla digitada num campo de busca ou cada fechamento de toast re-renderizava o módulo e reprocessava tudo de novo — ia pesar conforme o histórico real de transações crescesse.

**Correção:** `allTxs` virou `useMemo` (dependências `accs`/`cards`/`banks`, mesmo padrão de `retroPatrimData`) — deixou de ser função, é o array já pronto. Novo `txsByMonth` (`useMemo` sobre `allTxs`) agrupa as transações por `YYYY-MM` uma única vez; `cashflowMonth`, `monthTotals`, `budgetSpend` e o filtro de lançamentos do gráfico de Fluxo passaram de "filtrar a lista inteira por prefixo de data, a cada chamada" pra "lookup O(1) no mapa por mês + somar só as transações daquele mês" — de O(total de transações) por chamada pra O(transações daquele mês). Verificado no navegador: Fluxo de Caixa (12 meses, Realizado+Esperado), Orçamento por categoria e a lista de 29 lançamentos de Ago/26 (soma batendo exatamente com o saldo do card, R$48.034,10) continuam corretos após a mudança.

### 🔵 Bundle de produção medido: 1,07MB JS (268KB gzip) num chunk único
**Onde:** `preview/vite.config.js` (sem `manualChunks`), `App.jsx` (10 módulos importados estaticamente no topo, nenhum `React.lazy`).

**Problema:** confirma com número real o que já era P1 do [[05 Roadmap]] ("sem code splitting") — quem abre a Árvore só pra ver Finanças baixa 268KB gzip de módulos que talvez nunca abra na sessão. Não é um achado novo, é a medição concreta de um item já conhecido.

## Ver também
- [[Arquitetura]]
- [[Como Rodar]]
- [[03 Módulos (Sefirot)]]
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
