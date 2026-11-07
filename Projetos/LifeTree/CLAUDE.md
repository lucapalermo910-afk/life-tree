# Life Tree RPG — conventions for this codebase

## Project layout

- `preview/src/App.jsx` — the live integrated app (the "Árvore da Vida" shell + bottom
  nav). This is what actually runs (`cd preview && npm run dev`).
- `preview/src/*Module.jsx` (Yesod, Hod, Tiphareth, Geburah, Chesed, Netzach) — the
  6 life-area modules, already integrated into the app above and imported by it.
- `modules/<area>/src/*Module.jsx` — standalone source snapshots of each module
  (built independently, e.g. as separate Claude artifacts). These are **not** wired
  into the live app and are missing integration props (`onBack`, `dark`, `setDark`,
  etc.). Treat them as pre-integration drafts, not something to run directly.
- `app/versions/v1.jsx` … `v8-*.jsx` — historical full-app snapshots. Reference only.

## Merging a module into the live app (`modules/<area>` → `preview/src`)

When bringing a module from `modules/<area>/src/` into `preview/src/`, or building
a brand-new area module, always do this integration pass — don't paste it in as-is:

1. **Dark mode must NOT be owned by the module.** `App.jsx` is the single source of
   truth: `const [dark, setDark] = useState(false)` lives only in `App.jsx`, and it's
   the only place that persists it (part of the app's saved state blob).
   - Module signature must accept it as props: `function XModule({ onBack, dark, setDark })`.
   - Compute the module's own `C = dark ? DARK : LIGHT` from that prop — don't add a
     local `useState(false)` for it.
   - Don't add a per-module localStorage key for theme (e.g. `lifetree_x_dark`). A module
     that persists or re-derives its own dark/light value will drift out of sync with
     the rest of the app the moment the user toggles theme from a different screen.
   - `App.jsx` must pass `dark={dark} setDark={setDark}` at every `<XModule .../>`
     call site (search for `activeModule===` in `App.jsx`).
   - The module's own sun/moon toggle button keeps working unmodified — it just calls
     the passed-down `setDark`, so toggling from *any* screen updates every screen.

2. **Dark-mode color contrast.** Each module defines its own `DARK`/`LIGHT` theme
   objects (same shape as `App.jsx`'s). In `DARK`:
   - `muted` must be a light, readable color (was `#44556a`, nearly invisible on
     `#07090f` — fixed to `#dde3ee`, ~15:1 contrast). Never introduce a `muted` that's
     only a couple shades off the background.
   - Avoid stacking a low-opacity style (`opacity: .3`–`.4`) on top of an already-dim
     color like `muted` for "locked"/disabled states — the two multiply and the text
     becomes unreadable. If something needs a "locked" look, prefer opacity ≥ `.55`–`.65`.

3. Give the module an `onBack` prop and render it from `App.jsx` inside a
   `position:fixed; inset:0` wrapper, following the existing `activeModule==="..."`
   blocks in `App.jsx`.

Both of the module edits above should be applied to **all** `*Module.jsx` files
consistently — they share the same `DARK`/`LIGHT` shape and the same integration
contract, so a fix or convention in one belongs in all six.

## Objetivos com plano — padrão obrigatório (definido pelo usuário em 05–06/11/2026)

Vale para todo objetivo de qualquer área (Saúde, Finanças e as próximas: Profissional,
Autocuidado, Conhecimento, Relacionamentos). Ao levar o plano pelo Coach para uma área
nova, ou ao mexer em qualquer tela de objetivo, siga isto — não invente variações.

**Criação e roteamento**
- Objetivo nasce pelo **Desejo (Kether)**, no botão **"+ Novo"**, ou pelo Coach dentro do
  módulo. Onde quer que seja criado, mora no módulo de origem e **aparece no Desejo** (lido
  pelos `GOAL_ADAPTERS`). A aba Objetivos dos módulos tem "+ Novo", que leva ao Desejo
  (`abrirDesejo`). O plano não se edita no Desejo: o toque leva ao módulo.
- Sem etiquetas de área na criação: a área é sugerida pelo texto (`shared/areaObjetivo.js`)
  e aparece como "Vai para: X (sugerido) · Trocar". Área sem plano pelo Coach = "em breve".
- A skill do Coach escolhida no Desejo fica **travada** até confirmar ou cancelar
  (`coachSkillTravada` no `App.jsx`). Palavras-chave de outros módulos nas respostas do
  usuário não podem desviar a conversa.
- Ao tocar no cartão de um objetivo no Desejo, abrir o módulo de destino na aba Objetivos
  com o plano aberto (`abrirObjetivo` / `destinoObjetivo`).

**Conteúdo do objetivo**
- `titulo` = **nome curto** (até ~30 caracteres, como o usuário falaria: "Bater 75 kg").
  `descricao` = **uma linha só: resultado + data** ("Chegar a 75 kg em 28/02/2027"), mostrada
  no plano como "O objetivo". Condições (frequência, dieta, etapas) vão para metas e passos.
- Números que dependem de conta (calorias, macros, prazos em semanas, valores) são
  **calculados em código**, nunca pelo modelo. O Coach coleta os dados e explica
  (ex: bloco `dieta` → `shared/macros.js` → `MacrosCard`). O prompt diz explicitamente
  para não escrever esses números no texto.
- Todo prompt do Coach recebe a data de hoje (já feito em `sendToCoach`).

**Planejamento × acompanhamento (06/11/2026, pedido do usuário — hierarquia tipo OKR)**
- A aba Objetivos **só planeja**. A execução é marcada no **Controle (Malkuth)** e nas outras
  abas (pesagens, treinos, diário). Não criar checkboxes de execução na aba Objetivos.
- Estrutura do plano: **O objetivo → Resultados-chave → metas da semana → Linha do tempo
  (fases com marco) → Rotina → Impactos**. Tudo ligado direto ao objetivo (sem aninhar por KR).
- **Resultados-chave** (`ResultadosCard`, `o.krs`): alvos de "como saber que deu certo".
  Saúde: peso (vem da dieta, fonte única), % de treinos feitos, % de dias dentro da dieta,
  % de gordura opcional. Resultado sem número não entra.
- **Linha do tempo executável** (`shared/planejamento.js`, `shared/FaseSaude.jsx`): cada
  fase = `{ title "DD/MM a DD/MM/AAAA: nome", semana {treinos, cardio, divisão}, tarefas
  [{texto, ate, done}], revisao }`. Mostra: período e nome → Na semana → Tarefas (só
  descritas, com "até DD/MM") → Revisão em DD/MM → **Marco** (peso esperado no fim da fase,
  calculado pelo ritmo da dieta; o Coach não escreve pesos). As metas da semana progridem
  fase a fase; o **quadro de treino mostra e edita a fase atual** ("Fase 1 · até 30/11") e a
  dieta usa os treinos da fase atual. Totais até o prazo somam fase a fase. Tocar na fase
  abre o editor (período/nome, meta da semana, tarefas com data, revisão). O círculo da fase
  não marca: fica verde quando todas as tarefas da fase estão feitas.
- **Etapas**: na tela, as fases se chamam **etapas** ("ETAPA 1 · 06/11 a 30/11/2026",
  "+ Adicionar etapa", `rotuloPasso="Etapa"`), inclusive no Controle e no quadro de treino.
  Etapa sem tarefas mostra "Sem tarefas. Toque na etapa para adicionar…".
- **Tarefas: criadas no módulo de origem** (editor da etapa), **marcadas no Controle**. O
  Malkuth lista "TAREFAS DOS OBJETIVOS" (pendentes primeiro, por
  data, atrasadas em destaque) e marca via `GEBURAH_ACTION_HANDLERS.toggle_tarefa_objetivo`.
- **Gauge do objetivo = % de tarefas feitas** (`execucaoDoPlano`), igual na Saúde, no Desejo e
  no Controle, com "N de M tarefas · faltam N dias".
- **Rotina** (`plano.rotina`): 3–5 hábitos recorrentes, editáveis como os impactos. O antigo
  `habitoSugerido` vira o primeiro item (`comRotina`).
- Na interface, palavras curtas em português (Resultados-chave, Marco, Rotina); nada de
  "KR"/"milestone" na tela.
- Piloto na Saúde; levar às outras áreas depois do piloto. (`GoalCard` com `pct={null}`
  continua disponível para objetivo sem tarefas, mas a Saúde usa o gauge.)

**Visual**
- **Editar = tocar no item; apagar = ×** (pedido do usuário, 06/11/2026 — "UX mais limpa").
  Sem lápis, lixeira, botão "Editar" ou menu de segurar. Cartão do objetivo (`GoalCard`):
  toque abre o plano; × discreto no canto apaga (com confirmação). Dentro do `PlanoCard`,
  tocar em "O objetivo" (edita nome, prazo e objetivo), em **cada quadro de meta**, em **cada
  passo** ou em cada impacto abre a edição só daquele item, numa caixa com ✓ (concluir) e
  × (apagar) no canto. O círculo do passo continua só marcando. "+ Adicionar passo" e
  "+ Adicionar" ficam no fim de cada lista. No Desejo, o toque leva ao módulo de destino.
- Metas vão para o `PlanoCard` como lista: `metas=[{ chave, titulo, render(editando), onApagar }]`.
- Título dos quadros de meta sem "(calculadas pelo app)"; só "(ajustadas por você)" quando for o caso.
- Ordem do plano: **O objetivo → metas da área → passo a passo → impactos**. Em Saúde, as
  metas são **treino (`TreinoCard`) e depois dieta (`MacrosCard`)**. Treino = treinos na semana,
  cardio na semana (min), totais até o prazo (treinos e minutos de cardio, do `criado` ao
  `prazo`, recalculados quando a meta semanal ou o prazo mudam) e tipo de treino (A, AB, ABC…, com a sequência da semana); sem
  duração, horário ou acompanhamento de execução. Treinos por semana têm **fonte única** no
  quadro de treino: a dieta lê de lá e recalcula quando muda. Metas entram pela prop `metas` do `PlanoCard`, nunca abaixo do plano. Meta
  ajustada à mão fica marcada como "ajustada por você".
- **Metas editáveis recalculam tudo.** Em edição, o quadro de metas vira calculadora: o
  usuário mexe nos dados e nas alavancas (ex: peso, peso-meta, treinos, perda por semana,
  calorias, proteína) e o código recalcula o resto (ex: carboidrato, gordura, semanas até a
  meta), com os mesmos limites de segurança e avisos. Nunca deixar números dependentes
  editáveis de forma solta. Guardar os dados de entrada no objetivo (ex: `dieta`, `ajustes`)
  para poder recalcular depois.
- Plano = `PlanoCard` em **modo leitura por padrão**: "O objetivo" no topo, passos numerados
  em linha do tempo com o período ("20/11 a 31/12/2026:") em destaque e o texto completo,
  com quebra de linha; impactos empilhados (+ positivo, ! atenção). Edição tocando no
  item. Nunca `<input>` de uma linha para texto do Coach.
- Respostas do Coach: negrito em Markdown vira negrito (`textoCoach`); respostas longas
  ou com plano abrem a conversa em tela cheia.
- Textos de interface em português, curtos. Sem quadros de "protótipo"/"teste" em telas
  que o usuário já usa.

**Fluxo de trabalho**
- Mudanças vão por PR para a branch `dev` (endereço de teste
  `preview-git-dev-lucapalermo910-5080s-projects.vercel.app`). A `main` (produção,
  `preview-gamma-fawn.vercel.app`) só recebe um PR `dev` → `main` quando o usuário disser
  para publicar.
- Depois de cada mudança, atualizar `01 Estado Atual.md` (o que mudou, o que foi e o que
  não foi testado).
