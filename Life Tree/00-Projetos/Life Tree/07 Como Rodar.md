---
tags: [lifetree, setup]
aliases: [Como Rodar]
---

# Como Rodar o Projeto

> ⚠️ **Corrigida em 22/08/2026** — as duas seções abaixo ("Módulo standalone" e "App nativo") descreviam comandos que não funcionam como escritos, confirmado lendo o repo direto (`modules/*/` não tem `package.json` nenhum — `npm run dev` não tem script pra rodar; `app/native/` está **completamente vazio**, confirmado desde a auditoria de 10/08/2026, ver [[10 Segurança, Mobile e Performance]] — `npm install` falharia de cara por não existir `package.json` ali). Corrigido pra deixar isso explícito em vez de instruções que quebram no primeiro comando.

## Life Tree principal (web / Vite) — único caminho que funciona hoje

```bash
cd preview
npm run dev
```

Sobe em `http://localhost:5173` (ou a próxima porta livre, se 5173 estiver ocupada — cada porta é uma origem separada no navegador, então dados de teste em `localStorage` não persistem entre portas diferentes).

**Pra o Coach de IA funcionar, precisa de uma chave da Anthropic:** criar `preview/.env` (não commitado) com:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Sem isso, o app inteiro roda normalmente (árvore, módulos, persistência) — só as chamadas ao Coach falham com um erro explícito (`preview/vite.config.js` retorna a mensagem "ANTHROPIC_API_KEY não configurada..." em vez de silenciosamente não fazer nada). Em produção (Vercel), a mesma variável é configurada como env var do projeto, não como arquivo `.env`.

Outros scripts disponíveis (`preview/package.json`): `npm run build` (build de produção), `npm run lint` (ESLint), `npm run preview` (serve o build).

## Módulo standalone (`modules/*/`) — não roda como está

`modules/yesod-financas/` (e os outros `modules/*/`) têm código-fonte real em `src/` (pré-integração, ver [[02 Arquitetura]]), mas **nenhum tem `package.json` próprio** — não existe `npm install`/`npm run dev` funcional ali hoje. Se precisar rodar algum desses isoladamente, o caminho mais rápido é copiar o `preview/package.json`/`vite.config.js` como base, não assumir que já existe infra pronta.

## App nativo (mobile / Expo) — pasta vazia, nada pra rodar

`app/native/` está confirmado **vazio** (0 arquivos) — nenhum código Expo/React Native foi de fato começado, apesar de docs mais antigos sugerirem o contrário. `cd app/native && npm install` falha imediatamente por não existir `package.json`. Ver [[05 Roadmap]] pra status do plano de app nativo (hoje: PWA é o caminho mais provável antes de React Native, ver [[10 Segurança, Mobile e Performance]]).

## Ver também
- [[Arquitetura]]
- [[Bugs Conhecidos]]
- [[10 Segurança, Mobile e Performance]]
