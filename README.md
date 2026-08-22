# 🌳 Life Tree RPG

App de desenvolvimento pessoal baseado na Árvore da Vida Kabbalística com sistema de progressão RPG.

## Conceito
10 áreas de vida mapeadas nas 10 sefirot da Kabbalah. Cada hábito completado e meta atingida evolui a árvore visualmente e concede XP, moedas e conquistas.

## Stack
- React (web / artefato Claude)
- React Native + Expo (mobile / APK)
- AsyncStorage (persistência local)
- Claude API (Coach de IA)

## Versões

| Versão | Arquivo | O que tem |
|---|---|---|
| v1 | v1-clean.jsx | Base — árvore, hábitos, metas, RPG |
| v2 | v2-sprint1-fix.jsx | Persistência + edição de hábitos/metas |
| v3 | v3-sprint4.jsx | Personalização de áreas e cores + backup |
| v4 | v4-full.jsx | Streaks, filtros, diário, dashboard, conquistas |
| v5 | v5-v2.jsx | Pomodoro, sub-tarefas, marcos, calendário, undo |
| v6 | v6-current.jsx | Widget customizável + Coach de IA (ATUAL) |

## Documentos

| Arquivo | Descrição |
|---|---|
| docs/roadmaps/roadmap-10-10.md | Roadmap completo para 10/10 |
| docs/avaliacoes/avaliacao-po-designer.md | Avaliação PO + Designer |
| docs/ai-coach-agent-spec.md | Especificação do Coach de IA |
| docs/smartwatch-integration.md | Guia de integração com smartwatch |

## Próximos passos
Ver `docs/roadmaps/roadmap-10-10.md` — Fase 1 prioridade.

## Como rodar
```bash
cd app/native
npm install
npx expo start
```