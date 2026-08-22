---
tags: [lifetree, modulo, tiphareth]
aliases: [Tiphareth]
---

# ☀️ Tiphareth — Autocuidado

> Status: ✅ Integrado na Árvore — **não estava documentado em nenhuma fonte antes da auditoria de 28/07/2026** (nem no repo, nem no `obsidian-vault` antigo). Arquivo: `preview/src/TipharethModule.jsx` (996 linhas em 13/08/2026, após o hub cross-módulo)
> Score bridge: publica `tiphareth` em `lifetree_scores`
> Ações de Coach em `preview/src/shared/tipharethActions.js` (10 ações, `actions:true` desde 13/08/2026)

## Abas
`tiph` (hub) · `aparencia` · `bemestar` · `rotinas` · `cfg` — 5 abas.

## Funcionalidades

### Duas frentes: Aparência e Bem-estar
Hábitos separados por área (`aparenciaHabits`, `bemestarHabits`) — ex: skincare matinal/noturno, cuidar das unhas/cabelo (aparência); "10 min só pra mim", escrever coisas que gosta em si (bem-estar).

### Rotinas com passos
```js
const D_ROTINAS=[
  {id:"r1",name:"Rotina Matinal",time:"manhã",steps:[
    {id:"rs1",title:"Lavar o rosto",done:false,min:2},
    {id:"rs2",title:"Tônico",done:false,min:1},
    {id:"rs3",title:"Hidratante",done:false,min:2},
    {id:"rs4",title:"Protetor solar",done:false,min:2},
  ]},
  {id:"r2",name:"Rotina Noturna",time:"noite",steps:[/* double cleanse, sérum, hidratante noturno */]},
];
```

### Lista de produtos (skincare)
Produtos cadastrados com categoria (Limpeza, Hidratação, Proteção, Sérum, Tônico, Óleo, Esfoliante, Cabelo, Outro), frequência de uso e notas.

### Humor do dia
5 opções fixas (energizado, calmo, cansado, ansioso, feliz), cada uma com cor própria — usado como widget de dashboard e enviado ao coach como contexto.

### Score do módulo
```js
const habitScore  = allHabits.length ? Math.round(allHabits.filter(h=>h.done).length/allHabits.length*100) : 0;
const goalScore   = goals.length     ? Math.round(goals.filter(g=>g.done).length/goals.length*100)         : 0;
const rotinaScore = rotinas.length   ? Math.round(rotinas.reduce((s,r)=>s+r.steps.filter(st=>st.done).length/(r.steps.length||1),0)/rotinas.length*100) : 0;
const tiphScore   = Math.round(habitScore*0.35 + goalScore*0.3 + rotinaScore*0.35);
```

### Widgets customizáveis (catálogo com 12 opções — 3 novas em 13/08/2026)
```js
const WIDGET_CATALOG = [
  {id:"score",       label:"Score Tiphareth", defaultOn:true},
  {id:"mini_scores", label:"Mini Scores",     defaultOn:true},
  {id:"mood",        label:"Humor do dia",    defaultOn:true},
  {id:"mood_history",label:"Diário de Humor", defaultOn:true},  // novo — 1º lote 13/08
  {id:"streaks",     label:"Streaks",         defaultOn:true},  // novo — 2º lote 13/08
  {id:"mood_correlation",label:"Humor × Hábitos",defaultOn:true}, // novo — 2º lote 13/08
  {id:"habitos_hoje",label:"Hábitos de hoje", defaultOn:true},
  {id:"remedios_hoje",label:"Remédios de hoje",defaultOn:false}, // novo — 1º lote 13/08
  {id:"rotinas_quick",label:"Rotinas rápidas",defaultOn:false},
  {id:"metas_widget",label:"Metas",           defaultOn:false},
  {id:"xp_bar",      label:"XP & Nível",      defaultOn:false},
  {id:"quote",       label:"Frase do dia",    defaultOn:false},
];
```
Nota: o widget `coach` listado aqui em versões anteriores do doc não existe no catálogo atual — divergência da documentação antiga, não um gap real (o Coach do Tiphareth é a barra global do hub, não um widget de dashboard).

## Auditoria funcional — visão vs. código (09/08/2026, gaps fechados em 13/08/2026)
Feita como parte da auditoria cruzada dos 10 módulos (ver [[01 Estado Atual]] e artefato web linkado lá). Visão do usuário pro módulo: rotina de tratamento de pele/rosto/cabelo (já coberto, ver "Rotinas com passos" e "Lista de produtos" acima) + **registro de humor e saúde mental num estilo de diário direcionado** + **acompanhamento de remédios**.

- ~~**AUSENTE — diário de humor/saúde mental direcionado.**~~ ✅ implementado em 13/08/2026 — ver "Gaps fechados" abaixo. O que existia antes (`mood`) era um valor **único, "atual"** — não uma série de entradas ao longo do tempo, sem prompts guiados. O diário genérico do hub (`App.jsx`, ligado a qualquer sefirá por `sefirotId`) continua existindo em paralelo — é freeform e não específico de saúde mental, não substitui o diário direcionado.
- ~~**AUSENTE — remédios.**~~ ✅ implementado em 13/08/2026 — ver "Gaps fechados" abaixo. Nenhuma chave `lifetree_tiph_*` relacionada a medicação existia antes.

### Coach IA — nota de atualização (09/08/2026, atualizada em 13/08/2026)
> ⚠️ A seção abaixo descreve a implementação **anterior à consolidação do Coach** (decisão "Life Tree Coach architecture" no histórico do projeto — ver [[02 Arquitetura]] → "Coach de IA") e está desatualizada. Hoje o Tiphareth usa a skill `tiphareth` em `preview/src/shared/coachSkills.js`, roteada pelo Coach global (barra permanente do hub) — **sem** tool use nativo, sem `AGENT_TOOLS`, sem `fetch` próprio (o código `AGENT_TOOLS`/`runAgent` mostrado abaixo não existe mais no arquivo — removido como parte da limpeza de lint de 13/08/2026, já que era código morto desde a consolidação). **`actions:true` desde 13/08/2026** (`tipharethActions.js`, 10 ações — deixou de ser só leitura): cria/marca hábito, meta, produto, passo de rotina, registra humor (com upsert no diário direcionado), cadastra remédio e marca dose tomada. Antes disso, `buildTipharethContext()` só analisava/sugeria, nunca executava nada — texto original abaixo mantido como registro histórico da arquitetura pré-consolidação (tool use nativo), não do gap de `actions:false` (que já foi fechado).

### Coach IA — o único módulo com tool use real da Anthropic (não regex de `<ACTION>`) — texto histórico, ver nota acima
Diferente do hub e dos outros 3 módulos (que fazem parsing manual de tags `<ACTION>`/`<actions>` via regex), Tiphareth usa o formato nativo de **tool use** da API Anthropic, com `input_schema` por ferramenta e um loop agentic de até 6 iterações:

```js
const AGENT_TOOLS = [
  {name:"criarHabito", description:"Cria um novo hábito de autocuidado", input_schema:{...}},
  {name:"concluirHabito", description:"Marca um hábito como feito hoje pelo ID ou título", input_schema:{...}},
  {name:"criarMeta", description:"Cria uma nova meta de autocuidado", input_schema:{...}},
  {name:"editarMeta", description:"Edita título, área ou XP de uma meta existente", input_schema:{...}},
  {name:"concluirMeta", description:"Marca uma meta como concluída", input_schema:{...}},
  {name:"adicionarProduto", description:"Adiciona um produto à lista de skincare", input_schema:{...}},
  {name:"adicionarPassoRotina", description:"Adiciona um passo a uma rotina existente", input_schema:{...}},
  {name:"atualizarHumor", description:"Atualiza o humor atual do usuário", input_schema:{...}},
];

const runAgent = async (userMsg) => {
  const dispatch = createDispatcher();
  const messages = [...chatHistory, {role:"user",content:userMsg}];
  let iterations = 0;
  while (iterations < 6) {
    iterations++;
    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1024, system:buildSystemPrompt(), tools:AGENT_TOOLS, messages }),
    }).then(r=>r.json());
    messages.push({role:"assistant",content:res.content});
    if (res.stop_reason==="end_turn") { /* fim do loop, resposta final */ break; }
    // senão, despacha as tool_use calls e injeta os resultados de volta em messages
  }
};
```

🔴 Mesmo assim, o `fetch` só tem `{"Content-Type":"application/json"}` nos headers — **sem `x-api-key`/`anthropic-version`**, o mesmo bug sistêmico de todas as outras 4 integrações de IA do projeto (hub, Yesod, Geburah, Hod). Ver [[04 Bugs Conhecidos]].

System prompt inclui todo o estado relevante embutido diretamente (hábitos, metas, produtos, rotinas, XP, nível, humor):
```js
const buildSystemPrompt=()=>`Você é a Coach de Autocuidado do Tiphareth (Life Tree).
Você tem ferramentas para criar hábitos, metas, produtos, passos de rotina e registrar humor diretamente no app.
Quando o usuário pedir para criar, registrar, adicionar, marcar ou atualizar qualquer coisa — USE as ferramentas.
Estado atual (${todayS()}):
- Humor: ${mood}
- Score Tiphareth: ${tiphScore}% | Hábitos: ${habitScore}% | Rotinas: ${rotinaScore}% | Metas: ${goalScore}%
...`;
```

## Persistência
Prefixo `lifetree_tiph_`, com um helper de "setter persistido" que salva a cada chamada:
```js
const mk=(setter,key)=>v=>setter(prev=>{const next=typeof v==="function"?v(prev):v;sSet(key,next);return next;});
const setAH=mk(_setAH,"aparenciaHabits");
```

## Padrão de tema — corrigido em 13/08/2026
Tinha dois problemas registrados nesta seção; só um dos dois era real. **`dark`/`setDark` já vinham por prop de `App.jsx`** (`TipharethModule({ onBack, dark, setDark })`) — o trecho antigo mostrando `useState(false)` local estava desatualizado, provavelmente copiado de antes do fix de sincronização de tema de 31/07/2026 (ver [[04 Bugs Conhecidos]]). **O que era real:** `let C = {...LIGHT}` no escopo do módulo, reatribuído dentro do componente (`C=dark?DARK:LIGHT`) — mesmo anti-padrão do Geburah/Hod antes do fix, confirmado por lint como erro (`react-hooks/globals`). Corrigido com o mesmo padrão `ThemeCtx` (`React.createContext`) já provado nos outros dois: `Sheet`/`FI`/`FTA`/`FS`/`Card`/`ProgressBar`/`MoodHistoryStrip`/`MedicationTodayChecklist` ficam em escopo de módulo lendo `useContext(ThemeCtx)`; `TipharethModule` calcula `const C` local e monta `<ThemeCtx.Provider value={C}>` (nos dois pontos de retorno — tela de carregamento e tela principal).

**Componentes de aba recriados a cada render — achado e corrigido na mesma leva.** `TiphTab`, `AparenciaTab`, `BemestarTab`, `RotinasTab`, `ConfigTab` **e `WidgetCustomizer`** (a sheet de personalizar dashboard) eram definidas dentro do componente e renderizadas como `<TiphTab/>` etc — 6 ocorrências confirmadas por `eslint` (`react-hooks/static-components`). Nenhuma tinha `useState` próprio, então a correção foi só trocar `<X/>` por `X()` nos pontos de despacho, sem hoisting de estado — mesma situação do Hod (ver [[08 Hod]] e [[04 Bugs Conhecidos]]).

**Lint noise limpo:** `useRef` importado e nunca usado (removido — nada no módulo precisava), `todayS()` que estava definida mas nunca chamada (deixou de ser código morto: agora é usada pelo diário de humor e pelo checklist de remédios, ver "Gaps fechados" abaixo), um `catch(_){}` com parâmetro não usado. Depois dessas correções, `eslint` fica com **zero** achados no arquivo.

## Gaps fechados — 13/08/2026
Usuário pediu a lista compilada de gaps/bugs do Tiphareth (mesmo formato do Geburah/Hod), depois pediu pra resolver todos, sem exclusões.

**Diário de humor direcionado.** Novo modelo `moodLog` (`{id,date,mood,influencia,gratidao}`, upsert por dia) — diferente do diário genérico do hub. O seletor de humor rápido que já existia ("Como você está hoje?") continua igual, mas agora, ao escolher um humor, grava automaticamente uma entrada de hoje no histórico (`pickMood`) — o histórico se constrói sozinho a partir do fluxo que já existia, sem exigir uma ação extra. Um botão "Refletir hoje" abre uma sheet com 2 prompts fixos (`MOOD_PROMPTS`: "O que mais influenciou seu humor hoje?" e "Uma coisa que você é grata/o hoje") que complementam a entrada do dia. Um componente novo, `MoodHistoryStrip` (módulo, reutilizado no widget do hub e na aba Bem-estar), mostra uma tira de 14 dias coloridas pela cor do humor daquele dia; a aba Bem-estar também lista as últimas 7 entradas com as respostas aos prompts. Novo widget de dashboard `mood_history` (ativo por padrão). Verificado no navegador: selecionar humor colore o dia de hoje na tira instantaneamente; "Refletir hoje" salva e aparece na lista.

**Acompanhamento de remédios.** Gap total antes — zero código relacionado a medicação. Novo modelo `medications` (`{id,name,dosage,times:[...],notes,active}`) + `medicationLog` (`{id,medId,date,time,taken}`, upsert por remédio+horário+dia). Seção "Remédios" na aba Bem-estar: lista de remédios cadastrados (nome, dosagem, horários, ativo/inativo, editar/apagar) + um componente novo `MedicationTodayChecklist` (módulo, reutilizado no widget do hub e na aba) que achata remédios×horários ativos do dia em itens marcáveis — cada remédio com 2 horários vira 2 itens independentes no checklist. Novo widget de dashboard `remedios_hoje` (opcional, desligado por padrão). Verificado no navegador: cadastrar "Vitamina D" (08:00, 20:00) gerou 2 itens no checklist de hoje; marcar um como tomado aplica risco no texto e não duplica ao clicar de novo.

**Coach `actions:true`.** `tipharethActions.js` (novo, 10 ações): hábitos/metas (criar/marcar), produtos, passos de rotina (adicionar/marcar), humor (`register_mood`, com upsert no diário — mesmo racional do `pickMood` da UI), remédios (cadastrar + marcar dose tomada). Mesmo mecanismo de sincronização do Yesod/Geburah/Hod: `useCoachDataSync("tiphareth", reloadFromStorage)`. `buildTipharethContext()` ganhou `diario_humor_recente` (últimos 7 dias com prompts), `remedios_ativos` e `doses_pendentes_hoje` (sinal proativo, mesmo racional do "clientes precisando de atenção" do Hod). `systemPrompt` instrui a Coach a nunca inventar respostas pros prompts guiados (só preenche `influencia`/`gratidao` se o usuário disser algo nesse sentido) e a comentar padrões no humor recente "sem soar clínica" (não é terapeuta). Verificado no navegador: escrever direto em `lifetree_tiph_bemestarHabits` e disparar o evento de sync atualizou a tela sem reload.

Todas as mudanças verificadas com `npm run build` (limpo) e `eslint` (zero erros/avisos, incluindo `tipharethActions.js` e as mudanças em `coachSkills.js`/`App.jsx`) antes da verificação no navegador via `claude-in-chrome`.

## Hub de hábitos cross-módulo + correlação + streaks — 13/08/2026
Segundo lote do mesmo dia. Depois de fechar os gaps acima, usuário pediu ideias de funcionalidades para o módulo; das 7 sugeridas, gostou das 3 primeiras e pediu uma quarta, maior: que o Tiphareth **incorporasse as rotinas de todos os módulos, servindo de hub** para começar a integração cross-módulo — com parametrização por módulo e **tudo desligado por padrão** para testar um de cada vez. Recomendei espelhamento **read-only** em vez de leitura-e-escrita interativa (cada módulo tem sua própria lógica de concessão de XP; replicar isso no Tiphareth arriscava divergência/dessincronia) — usuário confirmou via pergunta direta. Esta foi a primeira funcionalidade de integração cross-módulo do projeto (antes disso, cada módulo só lia/escrevia seu próprio prefixo de localStorage).

**Hub de hábitos (read-only).** `HUB_ADAPTERS`: um adapter por módulo (`yesod`, `hod`, `chesed`, `netzach`, `geburah`) com `{label, color, read()}`, cada `read()` lendo a(s) chave(s) de localStorage daquele módulo via um leitor genérico (`readOtherModule`, não o `sGet` prefixado do próprio Tiphareth) e normalizando pro formato comum `{id,title,freq,done}`. Hod é o adapter mais complexo — combina 3 fontes do módulo (`carHabits`, `projects[].habits`, `brand.habits`) numa lista só. Geburah não tem conceito de "hábito" genérico (confirmado ao ler o módulo antes de implementar), então o adapter sintetiza um item único ("Treino de hoje") a partir do log de treino do dia. Toggle por módulo em Config (`hubModules`, todos `false` por padrão — `DEFAULT_HUB_MODULES`), com aviso explícito na UI: "Mostra aqui, só leitura... marcar como feito continua na tela de origem." A seção "Hábitos de Outros Módulos" na aba principal só aparece quando pelo menos um módulo está ligado.

**Verificado no navegador:** os 5 toggles ligados de uma vez, cada um com a cor do módulo de origem; a lista renderizou hábitos reais dos 5 módulos, incluindo os casos compostos do Hod (hábito de projeto rotulado com o nome do projeto, ex. "Preparar material das aulas (Professor Particular)") e o item sintético do Geburah ("Treino de hoje"). Chesed também confirmado com dado real ("Mandar mensagem para alguém que importa") — a chave `lifetree_ches_habits` inferida por convenção de nome estava correta.

**Correlação Humor × Hábitos.** `combinedHabits` junta hábitos de Aparência + Bem-estar + hub (só módulos ligados); a cada vez que o humor é registrado (seletor rápido ou "Refletir hoje"), a entrada do `moodLog` grava um snapshot `habitsPct` (% de hábitos combinados feitos naquele momento). `moodCorrelation` agrupa entradas passadas por humor e calcula a média de `habitsPct` por humor. Como não existia snapshot histórico de hábitos antes desta implementação, a correlação **só se constrói a partir de agora** — entradas antigas do `moodLog` têm `habitsPct` indefinido e são filtradas (`e.habitsPct!=null`). Estado vazio com mensagem explícita ("Ainda sem dados suficientes...") enquanto não há pelo menos uma entrada com snapshot. Verificado no navegador: salvar "Refletir hoje" gravou `habitsPct:3` na entrada do dia (3% = 1 hábito feito de ~30 combinados, com os 5 módulos do hub ligados).

**Streaks.** Dois contadores nesta ordem: dias seguidos registrando humor (`moodLog` datas únicas) e dias seguidos completando rotina inteira (novo log `routineCompletionLog`, `{id,date,routineId}`, upsert por rotina+dia — só grava quando todos os passos de uma rotina ficam `done`, disparado no toggle de passo). Mesmo algoritmo do `calcStreak` do Geburah (`streakFromDates`): ordena datas únicas decrescente, conta consecutivos andando pra trás a partir de hoje. Verificado no navegador: 1 entrada de humor hoje → streak de humor = 1; nenhuma rotina completa → streak de rotina = 0.

**Resumo semanal do Coach.** Botão na aba principal (`askCoach && <Btn>`) que envia um prompt fixo pedindo um resumo da semana ao Coach global — recebe `askCoach` como nova prop de `TipharethModule` (`App.jsx` passa `askCoach={sendToCoach}`, a mesma função que já alimenta a barra de chat do hub). Verificado no navegador: clicar dispara o toast "Perguntado ao Coach — veja a resposta na barra abaixo" e a chamada chega no backend do Coach — nesta sessão de teste, retornou erro de crédito insuficiente na API da Anthropic (`Your credit balance is too low...`), uma questão de billing do proxy Vercel, não um bug da integração (o wiring `askCoach`→`sendToCoach`→backend está correto).

Build/lint limpos (`npm run build`, `eslint` só com o ruído pré-existente do `App.jsx` não relacionado). Todas as verificações acima feitas via `claude-in-chrome` no dev server local.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[05 Geburah]] · [[08 Hod]] — referência dos padrões mecânicos (`ThemeCtx`, chamada como função) aplicados aqui
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
