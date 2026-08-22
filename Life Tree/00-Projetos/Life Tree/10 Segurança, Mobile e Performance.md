---
tags: [lifetree, seguranca, mobile, performance, auditoria]
aliases: ["Segurança, Mobile e Performance", "Segurança de Dados", "Instalação Android"]
---

# 🛡️ Segurança, Mobile e Performance

> Auditoria dedicada, pedida pelo usuário em 10/08/2026 logo depois da auditoria de visão vs. estado dos 10 módulos (ver [[00 Índice]] e [[01 Estado Atual]]). Três frentes que a auditoria anterior não cobria: segurança de dados, caminho de instalação no Android, performance/qualidade de código geral. Verificado direto no código (`preview/`, `app/native/`, `vite.config.js`, `api/coach.js`, `package.json`), não suposição. Também publicada como artefato web pro usuário revisar visualmente.
>
> Achados que já são "bugs confirmados" no sentido tradicional do vault foram duplicados em [[04 Bugs Conhecidos]] (seção "Segurança, Android e performance (10/08/2026)") — esta nota é a referência completa, com contexto e opções, não só a lista de bugs.
>
> Publicada também como [artefato web](https://claude.ai/code/artifact/dc532fda-b9d6-4705-8025-929c386e451a) — mesmo conteúdo, formato visual.

## Segurança de dados

Nada do achado aqui é um vazamento ativo — são riscos de exposição em cenários específicos (dispositivo compartilhado/perdido, URL do proxy descoberta, backup colado no lugar errado), relevantes justamente porque o app guarda dado financeiro e de saúde.

### 🟡 Proxy do Coach é um endpoint aberto (era 🔴, mitigado em 15/08/2026)
`preview/api/coach.js` (produção) e o middleware de dev em `preview/vite.config.js` originalmente só validavam que `messages` é um array não vazio — sem autenticação de chamador, sem rate limit, sem restrição de CORS/origem, sem limite de tamanho de payload. **Corrigido parcialmente em 15/08/2026:** `preview/api/_lib/rateLimit.js` adiciona limitador em memória por IP (20 req/10min, `429`+`Retry-After`), limite de payload (32KB) e clamp de `maxTokens` (máx. 1500) — aplicado nos dois entry points (produção e dev). Testado com 22 chamadas seguidas: as ~20 primeiras passam, o resto volta `429`. **Limitação conhecida:** o limitador é em memória — numa serverless function real, containers diferentes não compartilham estado, então não é garantia dura contra abuso distribuído. Segue **sem autenticação de chamador de verdade** (token/sessão) — a API key nunca vai pro bundle (correto), mas o endpoint ainda pode ser descoberto e usado por qualquer um, só que agora com um teto de taxa. Ver [[04 Bugs Conhecidos]].

### 🟡 Sem criptografia em repouso, sem trava de acesso ao app
Tudo em `localStorage`, texto puro, sob prefixos `lifetree_*` — saldo, dívida, peso, medidas, o que for. Sem PIN/biometria pra abrir o app: acesso físico ao dispositivo (ou ao perfil do navegador) é acesso total, sem fricção.

### 🟡 Backup exporta tudo em texto puro pro clipboard
`doExport` (Config → Backup, ver [[02 Arquitetura]] → "Backup / Restore / Reset") copia um JSON completo — inclusive financeiro e saúde — pra área de transferência. Colar no lugar errado vaza o conteúdo inteiro.

### 🔵 Dado sensível sai do dispositivo a cada pergunta ao Coach — informativo, não um bug
Esperado — é assim que um coach de IA funciona — mas vale documentar explicitamente: cada skill (`buildYesodContext`, `buildGeburahContext` etc., em `coachSkills.js`) manda o resumo completo do módulo ativo pro modelo, sem filtragem/anonimização antes de enviar. Não muda nenhuma prioridade por si só, mas é o tipo de coisa que deveria estar visível pro usuário no produto (algo como "o que o Coach vê" na tela), não só documentada aqui.

### 🔵 Sem autenticação nem múltiplos perfis — decisão consciente, não descuido
"Um usuário, um dispositivo" já era uma limitação registrada (ver [[09 Yesod]] → split de despesas). Consequência: zero controle de acesso se o dispositivo for compartilhado, emprestado ou perdido — vale ter isso explícito ao decidir se compartilhamento familiar (split de despesas do Yesod, por exemplo) entra no roadmap antes ou depois de alguma forma de proteção de acesso.

## Instalar e funcionar no Android

Estado real hoje: SPA Vite/React puro, sem nenhuma camada mobile. `preview/public/` só tem `favicon.svg`/`icons.svg` — sem `manifest.json`, sem service worker (item já estava no [[05 Roadmap]] como pendente, PWA nunca foi implementado). `app/native/` existe como pasta mas está **completamente vazia** (confirmado com `Get-ChildItem -Recurse` nesta auditoria — os docs anteriores diziam "existe mas não foi auditado em profundidade", o que soava mais avançado do que a realidade). A dependência `react-native-svg` em `preview/package.json` não é importada em lugar nenhum de `preview/src` — resíduo morto, não indício de esforço real de portar.

Três caminhos reais:

| Caminho | O que ganha | Esforço | Observação |
|---|---|---|---|
| **PWA instalável** | "Adicionar à tela inicial" no Chrome Android, cache offline via service worker | Pequeno | Reaproveita 100% do código atual — `manifest.json` + service worker + ícones. Já era o plano documentado, nunca implementado. |
| **Capacitor** | Push notification, biometria pra travar o app, ícone/splash nativos, distribuição via Play Store | Médio | Empacota o mesmo build Vite/React num WebView nativo — sem reescrever a UI. |
| **React Native puro** | UI verdadeiramente nativa | Grande | ~10.000 linhas de JSX/estilo inline atuais não são reaproveitáveis direto — reescrita completa. O `app/native` vazio sugere que essa rota foi cogitada e nunca começada. |

**Leitura da realidade do código:** PWA é o caminho de menor custo e já estava planejado — faz sentido confirmar que continua sendo a prioridade antes de considerar Capacitor (que só se justifica se push notification/biometria importarem de verdade) ou React Native (reescrita grande, só compensa se performance/gestos nativos forem crítico).

## Performance e qualidade de código

### Tamanho dos arquivos (linhas, `preview/src/`) — atualizado em 22/08/2026

> ⚠️ Tabela original (10/08/2026) só cobria 6 dos hoje 10 módulos, e antecedia tanto a extração de dado estático/kit de UI compartilhado (item 1/2, 21/08) quanto o fatiamento de Geburah/Hod (item 5, 22/08) — ver [[11 Plano de Decomposição — Arquivos Monolíticos]]. Números abaixo são atuais.

| Arquivo | Linhas |
|---|---|
| `App.jsx` (hub) | 1.232 |
| `YesodModule.jsx` | 1.138 |
| `TipharethModule.jsx` | 890 |
| `shared/coachSkills.js` | 835 |
| `ChesedModule.jsx` | 803 |
| `shared/yesodActions.js` | 742 |
| `ChokmahModule.jsx` | 532 |
| `BinahModule.jsx` | 527 |
| `GeburahModule.jsx` (shell — **fatiado em 22/08/2026**, mais 13 arquivos em `geburah/`) | 527 |
| `NetzachModule.jsx` | 462 |
| `KetherModule.jsx` | 245 |
| `HodModule.jsx` (shell — **fatiado em 22/08/2026**, mais 12 arquivos em `hod/`) | 309 |
| `MalkuthModule.jsx` | 173 |

### 🟡 Sem code splitting
`main.jsx` importa `App.jsx` direto, que importa os 10 módulos inteiros de uma vez — nenhum `React.lazy`/`Suspense`. Um usuário que só abre a Árvore baixa o código de todos os módulos + hub igual. Item P1 do [[05 Roadmap]] — "só compensa depois de fatiar mais módulos" (o ganho de lazy-load de um arquivo que já é um shell pequeno é bem menor do que era quando `GeburahModule.jsx` tinha 2.358 linhas).

### 🟡 Arquivos monolíticos — parcialmente corrigido
~~`App.jsx` e `GeburahModule.jsx` passam de 2.000 linhas cada~~ — **`GeburahModule.jsx` e `HodModule.jsx` fatiados em 22/08/2026** (ver tabela acima e [[02 Arquitetura]] → "Decomposição de módulo grande em subarquivos"). `App.jsx` (1.232 linhas) e os outros 6 módulos (`YesodModule.jsx`, `TipharethModule.jsx`, `ChesedModule.jsx`, `NetzachModule.jsx`, `ChokmahModule.jsx`, `BinahModule.jsx`) continuam sem quebra em subcomponentes — dificulta manutenção e tende a re-renderizar mais do que precisa a cada mudança de estado.

### 🟢 Tema com variável global mutável — corrigido nos 6 módulos que tinham o problema (13/08/2026)
~~Confirmado em Geburah/Hod/Tiphareth/Netzach (`let C` reatribuído a cada render)~~ — corrigido em todos via `React.createContext` (`ThemeCtx`), ver [[04 Bugs Conhecidos]] → "Tema global mutável (C)". Esta nota (10/08/2026) nunca tinha sido atualizada depois da correção — Yesod e o hub já usavam o padrão certo desde antes, e os últimos módulos (Chesed/Netzach) foram corrigidos 3 dias depois desta auditoria.

### 🟡 Zero testes automatizados no projeto inteiro
Nenhum arquivo `*.test.*` fora de `node_modules`. Toda a lógica de score, as 34 ações do Coach no Yesod e os cálculos financeiros/de saúde dependem só de teste manual no navegador.

### 🔵 Duplicação estrutural do acesso a `localStorage`
Cada módulo reimplementa seu próprio par de leitura/escrita (`sGet`/`sSet`, `readJSON`...) em vez de um utilitário compartilhado. O padrão já se repete em `yesodActions.js`/`coachSkills.js` e vai se repetir a cada novo módulo que ganhar ações (ver [[02 Arquitetura]] → "Coach de IA — ações por módulo").

### 🔵 Lint existe mas não roda em CI
`npm run lint` (ESLint 10 + `eslint-plugin-react-hooks`) só é acionado manualmente — sem pipeline de CI configurado no repo.

## Perguntas em aberto (pra priorizar, não decididas ainda)
1. ~~**Proxy aberto do Coach** — trata como prioridade curta?~~ **Respondido em 15/08/2026:** sim, rate limit + validação de payload implementados como item de Fase 0. Autenticação de chamador de verdade (token/sessão) segue em aberto, não priorizada.
2. **PWA vs. Capacitor** — confirma que PWA continua sendo o caminho (já era o plano) antes de considerar Capacitor? Ainda sem decisão — PWA segue não implementado.
3. **Refatoração dos arquivos grandes** — abre uma frente de quebra em subcomponentes antes ou depois da próxima leva de funcionalidade? **Parcialmente respondido em 22/08/2026:** o usuário decidiu fatiar Geburah e Hod fora da ordem sugerida pelo roadmap ("depois de completar os módulos") — ver [[01 Estado Atual]]. `App.jsx` e os outros 6 módulos seguem sem data.
4. **Testes automatizados** — zero hoje; a camada de ações do Coach (crescendo) e as fórmulas de score seriam os candidatos de maior risco pra cobrir primeiro? Ainda sem movimento.

## Ver também
- [[04 Bugs Conhecidos]] — versão resumida destes achados, no formato de bug tradicional do vault
- [[02 Arquitetura]] — Backup/Restore, Coach de IA (proxy, skills, ações por módulo)
- [[05 Roadmap]] — priorização
- [[09 Auditoria de Código vs Documentação]]
- [[01 Estado Atual]]
