---
tags: [lifetree, modulo, chokmah]
aliases: [Chokmah]
---

# 🪷 Chokmah — Espiritualidade

> Status: ✅ **Construído do zero em 13/08/2026** — primeiro dos 4 sefirot sem módulo a ganhar tela própria. Arquivo: `preview/src/ChokmahModule.jsx` (~700 linhas).
> Score bridge: publica `chokmah` em `lifetree_scores` (o node já existia na `SEFIROT` de `App.jsx` com essa cor/ícone, só nunca tinha módulo por trás).
> Ações de Coach em `preview/src/shared/chokmahActions.js` (6 ações, `actions:true` desde o dia 1 — construído já seguindo o padrão que os outros 6 módulos levaram até 13/08/2026 pra alcançar).

## Abas
`chok` (hub) · `praticas` · `tradicoes` · `diario` · `cfg` — 5 abas.

## Contexto — por que este e não outro dos 4 ausentes
Usuário perguntou qual módulo já construído estava mais avançado (resposta: Yesod), decidiu seguir pros 4 sefirot ainda sem módulo. Dos 4 (Kether, Chokmah, Binah, Malkuth), Chokmah e Binah já tinham "visão pronta" registrada no Roadmap — Kether depende de uma decisão de mecânica de recompensas ainda em aberto, Malkuth é propositalmente vago. Usuário pediu os dois de uma vez.

## Visão do usuário (09/08/2026)
Estudar diferentes religiões, aplicar hábitos de reflexão e leitura sagrada. Ideia de quick input do Roadmap: "Meditar: 5/10/15 min direto, 1 toque." Sem proposta de design fechada até então — desenhada nesta sessão a partir dessa visão + do checklist de integração de novo módulo em [[02 Arquitetura]].

## Funcionalidades

### Práticas (hábitos + meditação)
Hábitos de prática espiritual (`praticaHabits`, ex: "Meditar 10 minutos", "Momento de gratidão", "Leitura sagrada ou reflexiva") + um log rápido de meditação com 4 botões de "1 toque" (5/10/15/20 min) que faz upsert por dia (`meditationLog`, soma minutos se já meditou hoje) e alimenta um streak (mesmo algoritmo `streakFromDates` do Geburah/Tiphareth).
```js
const MED_MINUTES = [5,10,15,20];
const logMeditation = (minutes) => {
  const date = todayS();
  setMeditationLog(prev => {
    const existing = prev.find(m=>m.date===date);
    if (existing) return prev.map(m=>m.date===date?{...m,minutes:m.minutes+minutes}:m);
    return [...prev, {id:"med"+uid(), date, minutes}];
  });
  setXp(v=>v+minutes*2);
};
```

### Tradições
Religiões/filosofias/tradições contemplativas que o usuário está explorando (`tradicoes`: nome, tipo, status explorando/praticando/pausado, notas, cor). Seed: Budismo (explorando), Estoicismo (praticando). Cards com toggle de status inline, mesmo padrão visual dos hobbies do Netzach.

### Diário Espiritual
Reflexões com prompt guiado (`diary`: data, prompt, texto) — 3 prompts fixos ("O que me deu paz hoje?", "Um momento de gratidão", "O que percebi sobre mim hoje?") ou o usuário pode digitar livre. Diferente do diário de humor do Tiphareth (que faz upsert por dia): aqui são múltiplas entradas livres, mais parecido com os registros de contato do Chesed.

### Score do módulo
```js
const habScore = praticaHabits.filter(h=>h.done).length/praticaHabits.length*100;
const medScore = Math.min(100, medStreak*15); // streak de meditação
const diarioScore = Math.min(100, diaryEntries7d/7*100); // entradas nos últimos 7 dias
const chokScore = Math.round(habScore*0.35 + medScore*0.3 + diarioScore*0.35);
```

### Dashboard de widgets customizáveis
`WIDGET_CATALOG` com 4 blocos (Score, Mini Scores, Tradições em Exploração, Hábitos de Hoje) — construído desde o início, não como retrofit.

### Coach IA
`actions:true` desde o primeiro commit do módulo (`chokmahActions.js`, 6 ações): criar/marcar hábito, registrar meditação (upsert por dia), criar tradição, atualizar status de tradição, adicionar entrada de diário. `buildChokmahContext()` expõe hábitos pendentes, tradições em exploração, se já meditou hoje, últimos registros de meditação e diário recente. Mesmo mecanismo de sincronização dos outros módulos: `useCoachDataSync("chokmah", reloadFromStorage)`.

## Padrão de tema
`ThemeCtx` (`React.createContext`) desde o início — não houve retrofit porque não existia código antigo. `LIGHT` tingido em lilás/roxo (`ACCENT:"#c084fc"`, mesma cor do node na árvore); `DARK` neutro, idêntico aos outros 7 módulos. Tabs chamadas como função (`ChokTab()`, não `<ChokTab/>`) desde o primeiro commit — o bug de "componente recriado a cada render" que os outros 6 módulos precisaram corrigir depois nunca existiu aqui.

## Persistência
Prefixo `lifetree_chok_` — chaves: `praticaHabits`, `tradicoes`, `meditationLog`, `diary`, `xp`, `activeWidgets`, `dark` (via prop do hub, nunca local).

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[03 Binah]] — construído na mesma leva, mesmo checklist
- [[05 Roadmap]]
