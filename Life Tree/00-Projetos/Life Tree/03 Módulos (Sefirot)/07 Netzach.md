---
tags: [lifetree, modulo, netzach]
aliases: [Netzach]
---

# 🌿 Netzach — Qualidade de Vida

> Status: ✅ **Integrado na Árvore em 31/07/2026**, gaps de arquitetura fechados em 13/08/2026 — último dos 6 módulos a passar por essa leva. Arquivo: `preview/src/NetzachModule.jsx` (551 linhas em 13/08/2026).
> Score bridge: publica `netzach` em `lifetree_scores`. Testado no navegador (Chrome via `claude-in-chrome`): back button, persistência sobrevivendo a reload (score e XP confirmados após reload completo), score atualizando ao completar hábito.
> Ações de Coach em `preview/src/shared/netzachActions.js` (8 ações, `actions:true` desde 13/08/2026) — todos os 6 módulos agora têm ações completas.

## Abas (já definidas no código)
`netz` (hub) · `lazer` · `lar` · `exp` (Experiências) · `cfg`

## Funcionalidades (confirmadas no código)

### Lazer
Hábitos de lazer (ex: "fazer algo só por prazer", "desconectar das telas 1h", "encontrar amigos ou família") e hobbies cadastrados por categoria (Esporte, Arte, Música, Leitura, Gastronomia, Tecnologia, Natureza, Jogos, Viagem, Outro), cada um com última data praticada.

### Lar
Tarefas domésticas por categoria (Limpeza, Organização, Manutenção, Decoração, Compras) com frequência e flag de urgência, e hábitos do lar (ex: "manter a cama arrumada", "10 min de organização rápida", "cuidar de planta/jardim").

### Experiências (bucket list)
```js
const D_EXPERIENCIAS = [
  {titulo:"Ver aurora boreal", cat:"Viagem", status:"sonho", nota:"Noruega ou Islândia", emoji:"🌌"},
  {titulo:"Morar na Itália", cat:"Viagem", status:"planejando", prazo:"2028-01-01"},
  // status: sonho → planejando → agendado → feito
];
```

### Score do módulo
```js
const allHabits = [...lazerHabits,...larHabits];
const habScore  = allHabits.length ? Math.round(allHabits.filter(h=>h.done).length/allHabits.length*100) : 0;
const expScore  = experiencias.length ? Math.round(experiencias.filter(e=>e.status==="feito").length/experiencias.length*100) : 0;
const hobScore  = hobbies.length ? Math.min(100, Math.round(hobbies.filter(h=>h.lastDone&&h.lastDone>=/* últimos 7 dias */).length/hobbies.length*100)) : 0;
const netzScore = Math.round(habScore*0.4 + expScore*0.2 + hobScore*0.4); // hábitos e hobbies pesam igual (40% cada)
```

### Coach IA — nota de atualização (09/08/2026, atualizada em 13/08/2026)
> ⚠️ A seção abaixo descreve a implementação **anterior à consolidação do Coach** (decisão "Life Tree Coach architecture" no histórico do projeto — ver [[02 Arquitetura]] → "Coach de IA") e está desatualizada. Hoje o Netzach usa a skill `netzach` em `coachSkills.js`, roteada pelo Coach global — sem `fetch` próprio (resolve, de quebra, o bug de auth abaixo). **`actions:true` desde 13/08/2026** (`netzachActions.js`, 8 ações — deixou de ser só leitura): cria/marca hobby feito, cria/marca hábito (lazer ou lar), cria/marca tarefa feita, cria/avança experiência (bucket list). Netzach era o último dos 6 módulos sem ações de Coach — agora todos têm. Antes disso, `buildNetzachContext()` só analisava/sugeria, nunca executava nada — texto original abaixo mantido como registro histórico da arquitetura pré-consolidação.

### Coach IA — analítico single-shot (texto histórico, ver nota acima)
```js
const jsonFmt = '{"diagnostico":"texto","lazer":[{"acao":"texto","por_que":"razão"}],"lar":[{"acao":"texto"}],"experiencia":{"sugestao":"texto","por_que":"razão"},"afirmacao":"frase motivacional"}';
fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"}, /* ... */});
```
🔴 Mesmo bug sistêmico: **sem `x-api-key`/`anthropic-version`** — ver [[04 Bugs Conhecidos]].

## Auditoria funcional — visão vs. código (09/08/2026, tratado em 13/08/2026)
Feita como parte da auditoria cruzada dos 10 módulos (ver [[01 Estado Atual]] e artefato web linkado lá). Visão do usuário: Netzach tem ligação com o dia a dia — execução de tarefas diárias que **impactam em diversos módulos**.

- **AUSENTE — tarefas cross-módulo.** `tarefas` (lista local do Netzach, com flag `urgente`) é isolada: não existe hoje nenhum mecanismo pra uma tarefa nascer num módulo (ex: "pagar fatura" no Yesod) e aparecer/impactar outro. É o mesmo problema, visto de três ângulos diferentes, que também aparece como `tarefas` no Netzach, `alertas_vencimento_7dias` no Yesod, e `datas_proximas`/`pessoas_atrasadas` no Chesed — três sistemas de "coisa com prazo" que não se falam. **Não implementado nesta leva de propósito** — é uma decisão de arquitetura, não um gap de código; três opções concretas com trade-off (camada central, view agregada read-only, não mexer agora) levantadas em [[05 Roadmap]] → "Tarefas & calendário — decisão de arquitetura em aberto", recomendação pela view agregada read-only (mesmo padrão do hub do Tiphareth).

## Padrão de tema — corrigido em 13/08/2026
Tinha `let C = {...LIGHT}` no escopo do módulo, reatribuído dentro do componente a cada render (`C = dark ? DARK : LIGHT`) — mesmo anti-padrão de Geburah/Hod/Tiphareth/Chesed antes dos respectivos fixes, confirmado por lint (`react-hooks/globals`). Corrigido com o mesmo padrão `ThemeCtx` (`React.createContext`): `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar`/`ColorSwatches` (novo) ficam em escopo de módulo lendo `useTheme()` (hook novo, `() => useContext(ThemeCtx)`); `NetzachModule` calcula `const C` local e monta `<ThemeCtx.Provider value={C}>` (só um ponto de retorno).

**Componentes de aba recriados a cada render — corrigido na mesma leva.** `NetzTab`, `LazerTab`, `LarTab`, `ExpTab`, `ConfigTab` eram definidas dentro do componente e renderizadas como `<NetzTab/>` etc — 5 ocorrências confirmadas por `eslint` (`react-hooks/static-components`). Nenhuma tinha `useState` próprio, correção só trocou `<X/>` por `X()`.

**`Date.now()` chamado direto durante o render (impuro) — corrigido na mesma leva.** O lint (`react-hooks/purity`, regra nova) pegou 1 ocorrência no cálculo de `hobScore`; o mesmo padrão se repetia, sem o lint pegar (por estar dentro de closures de `LazerTab`/`LarTab`, não no corpo direto do componente), em mais 2 pontos (`diasSemFazer` em `LazerTab`, `dias` em `LarTab`). Os 3 pontos foram unificados num helper de módulo `diasDesde(d)` (baseado em `todayS()`, mesmo padrão do Chesed), removendo a chamada direta a `Date.now()` do corpo de render.

**Lint noise limpo:** 4 ocorrências de `catch(_){}` com parâmetro não usado trocadas por `catch{}`, um `eslint-disable-next-line react-hooks/exhaustive-deps` órfão removido. Depois dessas correções, `eslint` fica só com o padrão pré-existente `react-hooks/set-state-in-effect` no efeito de carregamento inicial — mesmo padrão presente em Geburah/Hod/Chesed.

## Persistência (adicionada na integração de 31/07/2026)
Prefixo `lifetree_netz_` — chaves: `hobbies`, `lazerHabits`, `tarefas`, `larHabits`, `experiencias`, `xp`, `dark`, `activeWidgets` (nova, 13/08/2026). O código original em `modules/` não tinha nenhuma persistência — adicionada durante a integração, seguindo o padrão de Hod/Geburah.

## Gaps fechados — 13/08/2026
Usuário pediu a lista compilada de gaps/bugs do Netzach (mesmo formato dos outros 5 módulos), depois pediu pra resolver todos — com o item de tarefas cross-módulo virando plano/proposta em vez de implementação isolada, mesmo tratamento que o item de arquivo monolítico teve no Geburah.

**Indicador de atraso nas tarefas do Lar.** `LarTab` calculava `dias` (dias desde a última vez feita) mas nunca usava na UI — confirmado por lint (`'dias' is assigned a value but never used`). Diferente dos Hobbies, que já tinham badge de status. Novo `FREQ_DAYS` (mapa freq→dias esperados: Diário=1, Semanal=7, Mensal=30, Trimestral=90) e badge "em dia"/"atenção"/"atrasada" por tarefa, escalado pela frequência própria de cada uma (diferente do hobby, que usa limiar fixo de 7/14 dias — tarefas têm cadências muito mais variadas). Verificado no navegador: as 3 tarefas seed (nunca feitas) apareceram "atrasada"; marcar uma como feita mudou pra "em dia" instantaneamente.

**Seletor de cor para hobbies.** Hobby novo sempre nascia com `color:ACCENT` fixo (verde-limão), mesmo os hobbies seed tendo cores diferentes (roxo, laranja, verde). Novo `HOBBY_PALETTE` (12 cores, mesmo padrão do `PESSOA_PALETTE`/`TRACK_PALETTE` do Chesed/Hod) exposto via componente `ColorSwatches` reutilizado nos formulários de criar/editar hobby. Verificado no navegador: hobby novo com cor azul escolhida apareceu corretamente na lista.

**Dashboard de widgets customizáveis.** Netzach era o único dos 6 módulos ainda sem essa tela. Novo `WIDGET_CATALOG` (3 blocos: Score, Mini Scores, Hábitos de Hoje, todos `defaultOn:true`) + botão "Personalizar" + `WidgetCustomizer` sheet, mesmo padrão dos outros 5. Verificado no navegador.

**Coach `actions:true`.** `netzachActions.js` (novo, 8 ações): hobbies (criar/marcar feito), hábitos de lazer/lar (criar/marcar), tarefas do lar (criar/marcar feita), experiências/bucket list (criar/avançar estágio). Mesmo mecanismo de sincronização dos outros 5 módulos: `useCoachDataSync("netzach", reloadFromStorage)`. Netzach fecha a lista dos 6 módulos com ações completas. Verificado no navegador: `NETZACH_ACTION_HANDLERS.create_experiencia` e `log_tarefa_done` chamados direto (via `import()` dinâmico no console) atualizaram a tela sem reload.

Todas as mudanças verificadas com `npm run build` (limpo) e `eslint` (só o padrão pré-existente `set-state-in-effect`) antes da verificação no navegador via `claude-in-chrome`.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[05 Geburah]] · [[08 Hod]] · [[06 Tiphareth]] · [[04 Chesed]] — referência dos padrões mecânicos (`ThemeCtx`, chamada como função) aplicados aqui
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
- [[05 Roadmap]] — "Tarefas & calendário — decisão de arquitetura em aberto"
