---
tags: [lifetree, auditoria]
aliases: ["Auditoria de Código vs Documentação"]
---

# Auditoria de Código vs Documentação (28/07/2026)

> 📋 **Auditoria complementar em 09/08/2026** — não é uma repetição deste método (código vs. docs), é **visão do usuário vs. código**, módulo a módulo nos 10 nós da árvore. Achados incorporados em cada nota de [[03 Módulos (Sefirot)]] e resumidos em [[01 Estado Atual]]. Um achado dessa auditoria é relevante pra este documento especificamente: as seções "Coach IA" de Geburah/Tiphareth/Chesed/Netzach (ver tabela da seção 6 abaixo) descreviam implementações (fetch direto, tool use nativo, dual coach) que já não existem desde a consolidação de 31/07–01/08/2026 — corrigido com uma nota em cada nota de módulo, texto histórico preservado abaixo dela.
>
> 📋 **Auditoria complementar em 10/08/2026** — segurança de dados, caminho de instalação no Android e performance/qualidade de código, verificados direto no código. Achado que corrige um item da seção 5 abaixo: `app/native` não é "existe mas não auditado", está confirmado **vazio**. Detalhe completo em [[10 Segurança, Mobile e Performance]].

> Objetivo: conferir, lendo diretamente `preview/src/*.jsx`, `package.json` e as pastas do repo, se a documentação (tanto os docs originais do repo `LifeTree/` quanto o `obsidian-vault` mais antigo) reflete o estado real do código. Achados incorporados nas notas deste vault; o `obsidian-vault` não foi alterado.

## Método
Leitura direta de `preview/src/App.jsx`, `YesodModule.jsx`, `GeburahModule.jsx`, `HodModule.jsx`, `TipharethModule.jsx`, `preview/package.json`, `package.json` (raiz), `preview/public/`, `modules/*` e `app/`.

## Achados principais

### 1. Módulos realmente integrados: 4, não 1 nem 2
`App.jsx` importa e renderiza **Yesod, Geburah, Hod e Tiphareth** (linhas 2-5 e 1433-1469 de `App.jsx`).
- Os docs originais do repo (`CLAUDE_CONTEXT.md`) diziam só **Yesod**.
- O `obsidian-vault` dizia **Yesod + Geburah**, com Hod "🔜 pendente".
- **Tiphareth não aparecia documentado em nenhuma das duas fontes** — módulo completo, com score bridge funcionando, descoberto só nesta auditoria.

Corrigido em [[03 Módulos (Sefirot)]].

### 2. `window.storage` ainda ativo no hub central — bug crítico não documentado
Tanto o repo quanto o `obsidian-vault` tratam "`window.storage` proibido → usar `localStorage`" como regra já aplicada. Na prática, `App.jsx` (o hub central, o arquivo mais importante do projeto) ainda chama `window.storage.get/set` em `loadState()`/`saveState()`, usadas para persistir hábitos, metas e XP. Isso quebra fora do ambiente de artefato Claude.

Os módulos (Yesod, Geburah, Hod, Tiphareth) seguem a regra corretamente com `localStorage` prefixado — só o `App.jsx` ficou de fora.

Documentado em [[04 Bugs Conhecidos]] e [[02 Arquitetura]].

### 3. Bugs confirmados como ainda ativos
- Timer do Geburah com dependência errada no `useEffect` (`[timerAtivo?.segundos>0]`) — presente linha por linha como o `obsidian-vault` descrevia.
- `registrar_refeicao` do Geburah falha para a maioria dos alimentos por banco de dados pequeno — confirmado.
- Nav bar do hub ainda com 7 abas (`TABS` em `App.jsx`) — a redução para 5 planejada nos roadmaps não foi feita. **Corrigido depois, em 31/07/2026** (reduzida para 4 abas + carrossel — ver [[04 Bugs Conhecidos]]); mantido aqui como registro do estado no momento desta auditoria.

### 4. Bugs confirmados como já corrigidos
- `stmtDue` do Yesod (edge case `closeDay >= dueDay`) — fix já aplicado no código, como o `obsidian-vault` registrava (o repo original deixava isso ambíguo).

### 5. Infra planejada vs implementada
- PWA (`manifest.json`, service worker): **não existe** em `preview/public` (só há `favicon.svg`/`icons.svg`). O plano existe (ver [[05 Roadmap]]), mas nada foi implementado.
- Supabase: **nenhuma dependência** em `package.json` (raiz ou `preview/`) — puramente planejado.
- `app/native` (Expo/React Native) existe como pasta mas não foi auditado em profundidade nesta sessão. **Corrigido em 10/08/2026:** auditado — a pasta está completamente vazia (0 arquivos), não é um caso de "conteúdo real não auditado" como este item sugeria. Ver [[10 Segurança, Mobile e Performance]].
- `modules/hod-profissional` (e presumivelmente os outros `modules/*`) têm projeto Vite standalone real, com `dev-url.txt` apontando pra um servidor local — não são "estrutura vazia sem conteúdo" como o `CLAUDE_CONTEXT.md` original descrevia.

### 6. Coach IA por módulo — tipo real confirmado
| Módulo | Tipo de coach | Confirmado no código |
|---|---|---|
| Yesod | Analítico single-shot (`analyzeFinances()`) | ✅ ainda não migrado para conversacional |
| Geburah | Dual — conversacional (`sendCoach()`) + analítico (`callAI()`) | ✅ como documentado no `obsidian-vault` |
| Hod | Não auditado em detalhe nesta sessão | — |
| Tiphareth | Não auditado em detalhe nesta sessão | — |

## O que ficou de fora desta auditoria
- Conformidade do design system (`05-UX-UI/diretrizes.md` do `obsidian-vault`) com o CSS/estilos reais — não verificado.
- Bug "sefirot não enchem visualmente na Árvore" (P0 no roadmap consolidado) — não verificado por leitura de código. ✅ Verificado e corrigido em 31/07/2026, ver [[04 Bugs Conhecidos]].
- Estado do `app/native` (Expo).
- Conteúdo real dos outros `modules/*` além de `yesod-financas` e `hod-profissional`.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[04 Bugs Conhecidos]]
- [[02 Arquitetura]]
- [[05 Roadmap]]
