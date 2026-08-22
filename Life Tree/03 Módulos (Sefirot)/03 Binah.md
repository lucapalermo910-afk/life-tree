---
tags: [lifetree, modulo, binah]
aliases: [Binah]
---

# 📖 Binah — Conhecimento

> Status: ✅ **Construído do zero em 13/08/2026**, junto com o Chokmah. Arquivo: `preview/src/BinahModule.jsx` (~620 linhas).
> Score bridge: publica `binah` em `lifetree_scores`.
> Ações de Coach em `preview/src/shared/binahActions.js` (6 ações, `actions:true` desde o dia 1).

## Abas
`binah` (hub) · `trilhas` · `leitura` · `cfg` — 4 abas.

## Visão do usuário (09/08/2026)
Registrar assuntos que o usuário se interessa em estudar e montar um acompanhamento de aprendizado — parecido em espírito com o [[08 Hod]] (trilhas de competência), mas voltado a estudo, não carreira. Ideia de quick input do Roadmap: "Log de leitura: livro atual → minutos, 1 toque."

O doc de visão já recomendava reaproveitar o **padrão de trilhas do Hod** em vez de desenhar um modelo novo — foi exatamente o que se fez.

## Funcionalidades

### Trilhas de Estudo
Mesmo modelo de dados do Hod (`tracks`: nome, cor, foco atual/explorando/arquivada, `topics` com nível/meta/notas), reaproveitado como estava recomendado no doc de visão — só o domínio muda (assunto de estudo em vez de trilha de competência profissional). Seed: Filosofia (tópico "Estoicismo", nível 2/5) e Programação (tópico "Python", nível 3/5). Botão "+" incrementa nível direto na lista; edição completa via sheet.
```js
const trilhaScore = allTopics.length
  ? Math.round(allTopics.reduce((s,t)=>s+Math.min(1,t.level/(t.target||5)),0)/allTopics.length*100)
  : 0;
```

### Leitura
Livros (`livros`: título, autor, status quero_ler/lendo/lido/pausado, página atual/total, notas) agrupados por status. Livros "lendo" ganham botões de log rápido "1 toque" (10/20/30/45 min), mesmo padrão de UX do log de meditação do Chokmah — upsert por dia+livro (`readingLog`), soma minutos se já leu esse livro hoje, alimenta um streak de leitura.
```js
const leituraScore = Math.min(100, readStreak*15); // streak-based, mesmo padrão do Chokmah
const binahScore = Math.round(trilhaScore*0.5 + leituraScore*0.5);
```

### Dashboard de widgets customizáveis
`WIDGET_CATALOG` com 4 blocos (Score, Mini Scores, Lendo Agora, Trilhas em Foco) — construído desde o início.

### Coach IA
`actions:true` desde o primeiro commit (`binahActions.js`, 6 ações): criar trilha, criar tópico, atualizar nível de tópico (avança 1 se omitido), criar livro, atualizar status de livro, registrar leitura (upsert por dia+livro). `buildBinahContext()` expõe trilhas com tópicos/níveis, livros "lendo agora", livros "quero ler", se já leu hoje e últimas leituras. Mesmo mecanismo de sincronização: `useCoachDataSync("binah", reloadFromStorage)`.

## Padrão de tema
`ThemeCtx` desde o início, sem retrofit. `LIGHT` tingido em índigo (`ACCENT:"#4f46e5"`, mesma cor do node na árvore); `DARK` neutro, idêntico aos outros 7 módulos. Tabs chamadas como função desde o primeiro commit.

## Persistência
Prefixo `lifetree_binah_` — chaves: `tracks`, `livros`, `readingLog`, `xp`, `activeWidgets`, `dark` (via prop do hub).

## Integração futura (não implementada)
O doc de visão original apontava uma possível integração: aprendizado técnico registrado no Binah contando pro score de uma trilha de competência equivalente no Hod. Não implementada nesta leva — fora de escopo, mesma cautela aplicada às outras integrações cross-módulo em aberto (ver [[05 Roadmap]] → "Integrações entre módulos").

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[02 Chokmah]] — construído na mesma leva, mesmo checklist
- [[08 Hod]] — padrão de trilhas de competência, modelo de dados reaproveitado aqui
- [[05 Roadmap]]
