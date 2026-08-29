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
