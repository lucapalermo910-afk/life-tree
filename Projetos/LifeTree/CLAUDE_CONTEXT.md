# 🌳 Life Tree — Contexto do Projeto para Claude Code

> Este documento contém todo o contexto, decisões técnicas, padrões e lições aprendidas
> para ser usado como referência no desenvolvimento contínuo do projeto.

---

## Visão Geral

**Life Tree RPG** é um app de desenvolvimento pessoal baseado na Árvore da Vida Kabbalística.
10 sefirot = 10 áreas de vida = 10 módulos independentes, conectados por um hub central (Árvore).

### Stack
- **Frontend:** React (web) + React Native + Expo (mobile)
- **Build:** Vite 5 + @vitejs/plugin-react@4
- **Persistência:** localStorage (web) / AsyncStorage (mobile)
- **IA:** Claude API (claude-sonnet-4-20250514)
- **Ícones:** SVG inline customizados (web) / @expo/vector-icons Feather (mobile)

---

## Estrutura do Monorepo

```
LifeTree/
├── preview/                    ← App principal rodando (Vite)
│   └── src/
│       ├── App.jsx             ← Life Tree hub (árvore central)
│       └── YesodModule.jsx     ← Módulo Finanças integrado
│
├── modules/                    ← Módulos standalone (cada um tem seu Vite)
│   ├── yesod-financas/         ← ✅ Integrado
│   ├── hod-profissional/       ← 🔜 Próximo
│   ├── geburah-saude/          ← 🔜 Próximo
│   └── [outros 7 módulos]/     ← Estrutura criada, sem conteúdo ainda
│
├── shared/
│   ├── storage/index.js        ← Bridge localStorage
│   ├── theme/index.js          ← Tema compartilhado
│   └── score-bridge.js         ← Publica scores para a Árvore
│
├── app/
│   └── versions/               ← Histórico de versões
│       ├── v1-clean.jsx
│       ├── v2-sprint1-fix.jsx
│       ├── v3-sprint4.jsx
│       ├── v4-full.jsx
│       ├── v5-v2.jsx
│       ├── v6-current.jsx
│       ├── v7-yesod-integrated.jsx  ← versão atual
│       └── YesodModule.jsx
│
└── docs/
    ├── roadmaps/
    │   └── roadmap-10-10.md
    ├── avaliacoes/
    │   └── avaliacao-po-designer.md
    ├── ai-coach-agent-spec.md
    └── smartwatch-integration.md
```

---

## Mapeamento Sefirot → Módulos

| Sefirá | Nome PT | Área | Módulo | Status |
|---|---|---|---|---|
| Kether | Coroa | Desejos | kether-desejos | 🔜 |
| Chokmah | Sabedoria | Espiritualidade | chokmah-espiritualidade | 🔜 |
| Binah | Entendimento | Conhecimento | binah-conhecimento | 🔜 |
| Chesed | Misericórdia | Relacionamentos | chesed-relacionamentos | 🔜 |
| Geburah | Força | Saúde | geburah-saude | 🔜 Avançado |
| Tiphareth | Beleza | Autocuidado | tiphareth-autocuidado | 🔜 |
| Netzach | Vitória | Qualidade de Vida | netzach-qualidade | 🔜 |
| Hod | Esplendor | Profissional | hod-profissional | 🔜 Avançado |
| Yesod | Fundação | Finanças | yesod-financas | ✅ Integrado |
| Malkuth | Reino | Pessoal | malkuth-pessoal | 🔜 |

---

## Arquitetura de Integração

### Como um módulo se conecta à Árvore

1. **Score bridge** — módulo publica score (0-100) no localStorage:
```js
localStorage.setItem("lifetree_scores", JSON.stringify({
  yesod: { score: 40, updatedAt: "2026-06-05T..." }
}))
```

2. **App.jsx lê o score** na hora de calcular as cores da árvore:
```js
const getModuleScore = (moduleId) => {
  try {
    const raw = localStorage.getItem("lifetree_scores");
    const scores = raw ? JSON.parse(raw) : {};
    return scores[moduleId]?.score ?? 50; // 50 = default
  } catch(e) { return 50; }
};
```

3. **Clique na sefirá** abre o módulo:
```js
// Em App.jsx, no KabbalahTree onSelect:
if(areaId === "financas") { setPage(null); setActiveModule("yesod"); }
```

4. **Módulo renderiza** em tela cheia com `position:fixed`:
```jsx
{activeModule === "yesod" && (
  <div style={{position:"fixed",inset:0,zIndex:100,overflowY:"auto"}}>
    <YesodModule onBack={() => setActiveModule(null)}/>
  </div>
)}
```

5. **Botão ← Árvore** no módulo:
```jsx
<button onClick={onBack}>← Árvore</button>
```

---

## Padrão de Módulo — Template

Todo novo módulo deve seguir este padrão:

```jsx
// ModuloXxx.jsx
import { useState, useEffect, useMemo } from "react";

const ACCENT = "#cor-da-sefira"; // cor específica do módulo

export default function ModuloXxx({ onBack }) {
  const [dark, setDark] = useState(false);
  const C = dark ? DARK : LIGHT;

  // ── PERSISTÊNCIA ──────────────────────────────────────────────────────────
  const [storageLoaded, setStorageLoaded] = useState(false);
  const PREFIX = "lifetree_";

  useEffect(() => {
    // Carregar dados do localStorage
    try {
      const load = (k) => {
        const v = localStorage.getItem(PREFIX + k);
        return v ? JSON.parse(v) : null;
      };
      // ... carregar cada chave
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    // Salvar dados no localStorage
    try { localStorage.setItem(PREFIX + "chave", JSON.stringify(valor)); } catch(_) {}
  }, [valor, storageLoaded]);

  // ── SCORE BRIDGE → Árvore ─────────────────────────────────────────────────
  useEffect(() => {
    if (!storageLoaded) return;
    const score = calcScore(); // 0-100
    try {
      const raw = localStorage.getItem("lifetree_scores");
      const scores = raw ? JSON.parse(raw) : {};
      scores["id-da-sefira"] = { score, updatedAt: new Date().toISOString() };
      localStorage.setItem("lifetree_scores", JSON.stringify(scores));
    } catch(e) {}
  }, [/* dependências do score */]);

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:C.text}}>
      {/* Botão voltar — OBRIGATÓRIO */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px 0"}}>
        <button onClick={onBack} style={{color:ACCENT,background:C.card,border:"1px solid "+ACCENT+"33",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:11}}>
          ← Árvore
        </button>
        <span style={{fontSize:12,color:C.muted}}>NomeSefira · ÁreaVida</span>
      </div>
      {/* ... resto do módulo */}
    </div>
  );
}
```

---

## Bugs Conhecidos e Soluções

### 🔴 IIFEs no JSX — CRÍTICO
**Problema:** `{condição && (()=>{ return (<JSX/>) })()}` quebra no Vite/esbuild.

**Solução:** Substituir por função nomeada:
```jsx
// ❌ ERRADO
{tab === "home" && (()=>{ return (<div>...</div>) })()}

// ✅ CORRETO
{tab === "home" && (function HomeTab(){ return (<div>...</div>) }())}
```

### 🔴 window.storage — CRÍTICO para integração
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

### 🟡 retroPatrim / funções pesadas sem useMemo
**Problema:** Funções que recalculam histórico rodam todo render.

**Solução:**
```js
const dadosPesados = useMemo(() => {
  // cálculo custoso aqui
}, [dependencias]);
```

### 🟡 stmtDue — edge case cartão (closeDay >= dueDay)
**Problema:** Vencimento calculado antes do fechamento quando closeDay >= dueDay.

**Solução:**
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

### 🟡 Tema global mutável (C)
**Problema:** `let C = {...LIGHT}` como variável global mutável.

**Solução:** `const C = dark ? DARK : LIGHT` dentro do componente.

---

## Checklist de Integração — Novo Módulo

Ao integrar um novo módulo, verificar:

- [ ] Substituir todos os `window.storage.get/set` por localStorage
- [ ] Substituir todas as IIFEs `(()=>{})()` por funções nomeadas
- [ ] Renomear `export default function App()` para `export default function XxxModule({ onBack })`
- [ ] Adicionar botão `← Árvore` no topo
- [ ] Adicionar score bridge no `useEffect`
- [ ] Adicionar `useMemo` em funções de cálculo pesado
- [ ] Remover `import` desnecessários (useState já importado, etc.)
- [ ] Registrar o módulo em `App.jsx`:
  - Adicionar `import XxxModule from "./XxxModule.jsx"`
  - Adicionar estado `activeModule === "xxx"` no onSelect da árvore
  - Adicionar render do módulo com `position:fixed`
- [ ] Testar no navegador todas as abas e interações
- [ ] Salvar versão em `app/versions/`

---

## Score Bridge — IDs dos Módulos

Usar exatamente estes IDs ao publicar scores:

```js
"kether"    // Desejos
"chokmah"   // Espiritualidade
"binah"     // Conhecimento
"chesed"    // Relacionamentos
"geburah"   // Saúde
"tiphareth" // Autocuidado
"netzach"   // Qualidade de Vida
"hod"       // Profissional
"yesod"     // Finanças ✅
"malkuth"   // Pessoal
```

---

## Como Rodar o Projeto

```bash
# Life Tree principal (porta 5173)
cd preview
npm run dev

# Módulo standalone (cada um em porta diferente)
cd modules/yesod-financas
npm run dev  # porta 5175
```

---

## Avaliação Atual do Produto

| Dimensão | Nota | Prioridade |
|---|---|---|
| Proposta de valor | 8.0 | — |
| Funcionalidade | 8.5 | — |
| Visual | 7.5 | Alta |
| UI | 6.0 | Crítica |
| UX | 6.0 | Crítica |
| Mercado | 7.5 | Alta |
| **Média** | **7.2** | |

Ver `docs/roadmaps/roadmap-10-10.md` para o plano completo.

---

## Comandos Úteis

```bash
# Verificar erros no arquivo antes de salvar
node -e "require('fs').readFileSync('src/App.jsx','utf8')" 2>&1

# Contar IIFEs problemáticas
grep -c "(()=>{" src/App.jsx

# Ver últimas 10 linhas de um arquivo
tail -10 src/App.jsx

# Buscar padrão em todos os arquivos
grep -r "window.storage" src/
```
