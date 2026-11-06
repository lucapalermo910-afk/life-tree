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
- Objetivo é criado **só no Desejo (Kether)**, pelo "+ Objetivo". Os módulos não criam:
  a aba Objetivos deles tem o botão **"+ Novo"**, que leva ao Desejo (`abrirDesejo`).
- Sem etiquetas de área na criação: a área é sugerida pelo texto (`shared/areaObjetivo.js`)
  e aparece como "Vai para: X (sugerido) · Trocar". Área sem plano pelo Coach = "em breve".
- A skill do Coach escolhida no Desejo fica **travada** até confirmar ou cancelar
  (`coachSkillTravada` no `App.jsx`). Palavras-chave de outros módulos nas respostas do
  usuário não podem desviar a conversa.
- Ao tocar no cartão de um objetivo no Desejo, abrir o módulo de destino na aba Objetivos
  com o plano aberto (`abrirObjetivo` / `destinoObjetivo`).

**Conteúdo do objetivo**
- `titulo` = **nome curto** (até ~30 caracteres, como o usuário falaria: "Bater 75 kg").
  `descricao` = a frase SMART completa, mostrada dentro do plano como "O objetivo".
- Números que dependem de conta (calorias, macros, prazos em semanas, valores) são
  **calculados em código**, nunca pelo modelo. O Coach coleta os dados e explica
  (ex: bloco `dieta` → `shared/macros.js` → `MacrosCard`). O prompt diz explicitamente
  para não escrever esses números no texto.
- Todo prompt do Coach recebe a data de hoje (já feito em `sendToCoach`).

**Visual**
- Cartão do objetivo = `GoalCard` (nome, percentual, linha de status, barra) com
  **lápis (editar/renomear) e lixeira (apagar)** no canto do cartão (`onEdit`/`onDelete`).
  Tocar nos botões não abre o plano. Apagar sempre pede confirmação.
- Plano = `PlanoCard` em **modo leitura por padrão**: "O objetivo" no topo, passos numerados
  em linha do tempo com o período ("20/11 a 31/12/2026:") em destaque e o texto completo,
  com quebra de linha; impactos empilhados (+ positivo, ! atenção). Edição só depois de
  tocar em "Editar". Nunca `<input>` de uma linha para texto do Coach.
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
