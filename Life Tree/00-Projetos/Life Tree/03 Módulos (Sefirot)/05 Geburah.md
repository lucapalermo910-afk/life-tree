---
tags: [lifetree, modulo, geburah]
aliases: [Geburah]
---

# 🏋️ Geburah — Saúde

> Status: ✅ Integrado na Árvore · Arquivo: `preview/src/GeburahModule.jsx` — **fatiado em 22/08/2026** (shell com 527 linhas, era 2572 em 12/08/2026 antes da extração de dado estático e 1795 antes do split final; hoje o shell só tem roteamento/state/dashboard, o resto vive em 13 arquivos sob `preview/src/geburah/`, ver [[11 Plano de Decomposição — Arquivos Monolíticos]] → "Item 5 concluído no Geburah") · Ações de Coach em `preview/src/shared/geburahActions.js` (8 ações, `actions:true` desde 12/08/2026)
> Score bridge: publica `geburah` em `lifetree_scores`
> Artefatos web publicados sobre este módulo: [Auditoria Funcional](https://claude.ai/code/artifact/b06253fc-3323-4931-bbf5-e18ccd983fdb) (01/08/2026 — telas/entidades/gaps, cobre Treino e Nutrição igualmente) · [Benchmark de Mercado](https://claude.ai/code/artifact/23a38ead-1e59-4471-ae5e-232b8cbfeb89) (01/08/2026 — Geburah comparado contra Strong/Hevy/Jefit/Fitbod, MyFitnessPal/Cronometer/Yazio, Apple Health/Google Fit/Renpho/Withings) · [Proposta — Biblioteca de Alimentos](https://claude.ai/code/artifact/75f8d7b2-28c6-4f23-a48d-0b20c0fa1ea4) (03/08/2026 — 183 itens novos propostos: fast food, culinária japonesa/árabe/chinesa, suplementos, bebidas; antecede a expansão pra 376 itens implementada em 04/08/2026, ver [[04 Bugs Conhecidos]]).

## Abas
`geb` (hub) · `treino` · `nutri` · `medidas` · `cfg` — **5 abas**, já dentro do limite recomendado (diferente do hub e do Yesod).

## Funcionalidades

### Persistência via hook próprio (`usePersisted`)
```js
function sGet(key) { try{const v=localStorage.getItem(GEB_PFX+key);return v!==null?JSON.parse(v):null;}catch{return null;} }
function sSet(key,val) { try{localStorage.setItem(GEB_PFX+key,JSON.stringify(val));}catch{} }
function usePersisted(key,def) {
  const [v,setV] = useState(()=>{ const s=sGet(key); return s!==null?s:def; });
  // ... salva em localStorage a cada mudança
}
```
Chaves (`lifetree_geb_` prefix): `exercicios`, `rotinasTreino`, `logTreino`, `alimentos`, `receitas`, `logDieta`, `pesosMeta`, `pesagens`, `medidasCorp`, `metas`, `perfil`, `agua`, `planSem`, `widgetLayout`, `coachHistory`.

### Treino
Rotinas de treino por dia da semana (`rotinasTreino`), log de treinos executados (`logTreino`, cada um com séries por exercício), PRs (recordes pessoais) calculados a partir do histórico:
```js
const prMap = {};
logTreino.forEach(lt=>lt.series?.forEach(s=>{
  const c=s.cargaReal??s.carga;
  if(c>0) prMap[s.exercicioId]=Math.max(prMap[s.exercicioId]||0,c);
}));
```

### Biblioteca de exercícios (musculação + artes marciais) — adicionada em 09/08/2026
`D_EX` deixou de ser os 10 exercícios fixos originais e virou `[...D_EX_BASE, ...D_EX_MUSC, ...D_EX_ARTES]` — **286 exercícios** no total:
- `D_EX_BASE`: os 10 originais, agora com campo `met` (estimado) também.
- `D_EX_MUSC` (153 itens): musculação, gerado a partir de `biblioteca-exercicios-v3.jsx` (artifact do usuário) via script Node (não digitado à mão), cobrindo Peito/Costas/Ombros/Bíceps/Tríceps/Antebraço/Pernas/Glúteos/Core/Lombar-Posterior/Pescoço, cada um com `equip`, `nivel` (Iniciante–Elite) e `met`.
- `D_EX_ARTES` (123 itens): Boxe, Muay Thai, Karatê, Taekwondo, Kickboxing, Kung Fu — cada exercício tem `equip` no formato `"<arte> · <nível da graduação>"` (ex: `"Boxe · C-Class (Iniciante)"`), `inst` (instrução técnica real) e `met`.

Aba Treino → Exercícios virou navegação por grupo (antes listava tudo direto): clique num grupo → filtro por nível (musculação) ou por modalidade (artes marciais, já que cada arte tem sua própria escala de graduação — Kyu/Dan no Karatê, Geup/Dan no Taekwondo, etc., incompatíveis entre si) → lista com badge de kcal/min (`kcalMinExercicio(e, perfil.peso)`, mesmo fator de correção pessimista do artifact original: -35% musculação, -20% artes marciais).

```js
const FATOR_MET_ARTE=0.80, FATOR_MET_MUSC=0.65;
function kcalMinExercicio(e,pesoKg){
  if(!e?.met) return null;
  const fator = e.grupo==="Artes Marciais" ? FATOR_MET_ARTE : FATOR_MET_MUSC;
  return e.met*fator*pesoKg/60;
}
```
Rotinas padrão (`D_ROT`) continuam referenciando os ids `e1`..`e10` de `D_EX_BASE` — não foram remapeadas pros novos ids equivalentes, então usuários novos ainda começam com as mesmas 3 rotinas de sempre.

### Timer de descanso entre séries — bug corrigido em 12/08/2026
```js
useEffect(()=>{
  if(!timerAtivo) return;
  if(timerAtivo.segundos<=0){ setTimerAtivo(null); return; }
  timerRef.current=setInterval(()=>setTimerAtivo(t=>t?{...t,segundos:t.segundos-1}:null),1000);
  return()=>clearInterval(timerRef.current);
},[timerAtivo]); // era [timerAtivo?.segundos>0] — comparava um booleano, não o objeto
```
Era exatamente como descrito em [[04 Bugs Conhecidos]]; corrigido junto com a implementação de acompanhamento de treino ao vivo (ver seção abaixo). Verificado no navegador: timer de descanso conta corretamente após "Iniciar" um treino.

### Nutrição
Banco de alimentos (`alimentos`) com macros por 100g, receitas, e log de refeições do dia. Macros do dia calculados por soma ponderada:
```js
const calcMacro = (field) => todayLog.reduce((s,l)=>{
  const al=alimentos.find(a=>a.id===l.alimentoId);
  return al?s+(al[field]*l.qtd/100):s;
},0);
```
TDEE (gasto calórico diário) via fórmula de Harris-Benedict:
```js
const calcTDEE = () => {
  const {peso,altura,idade,sexo,atividade} = perfil;
  const bmr = sexo==="M" ? 10*peso+6.25*altura-5*idade+5 : 10*peso+6.25*altura-5*idade-161;
  const mult = {sedentario:1.2,leve:1.375,moderado:1.55,intenso:1.725,muito_intenso:1.9}[atividade]||1.55;
  return Math.round(bmr*mult);
};
```

### Água
Registro de copos bebidos por dia, meta configurável, progresso em %.

### Medidas corporais e peso
Histórico de pesagens e medidas corporais (cintura, etc.), com meta de peso e taxa semanal esperada de emagrecimento — usado pra calcular `metaDiaria` (peso esperado hoje) e `variacaoHoje`.

### Streak de treino
```js
const calcStreak = () => {
  const dias = [...new Set(logTreino.map(l=>l.data))].sort((a,b)=>b.localeCompare(a));
  if(!dias.length) return 0;
  let streak=0; let cur=new Date(todayS());
  for(const d of dias){
    const dd=new Date(d);
    const diff=Math.round((cur-dd)/86400000);
    if(diff<=1){streak++;cur=dd;}else break;
  }
  return streak;
};
```

### Score do módulo
```js
const treinos7d   = logTreino.filter(/* últimos 7 dias */).length;
const treinoScore = Math.min(100,Math.round(treinos7d/4*100));      // meta: 4 treinos/semana
const dietaScore  = metas.cal>0 ? Math.min(100,Math.round((calHoje/metas.cal)*100)) : 0;
const pesoScore   = Math.max(0,Math.min(100,Math.round((1-faltaPerder/(pesosMeta.pesoAtual-pesoMeta+0.001))*100)));
const gebScore    = Math.round(treinoScore*0.4+dietaScore*0.3+pesoScore*0.3);
```

### Coach IA — nota de atualização (12/08/2026, atualizada na mesma data)
> ⚠️ A seção abaixo descreve a implementação **anterior à consolidação do Coach** (decisão "Life Tree Coach architecture" no histórico do projeto — ver [[02 Arquitetura]] → "Coach de IA") e está desatualizada — ficou pra trás quando Tiphareth/Chesed/Netzach foram corrigidos numa leva anterior. Hoje o Geburah usa a skill `geburah` em `coachSkills.js`, roteada pelo Coach global (barra permanente do hub) — sem `fetch` próprio, sem tags `<actions>`, sem histórico de chat separado (resolve, de quebra, o bug de auth sem headers descrito abaixo). **`actions:true` desde 12/08/2026 (mesma data, leva seguinte):** `geburahActions.js` dá ao Coach 8 ações reais (registrar peso/refeição/água/medida, iniciar/finalizar treino, ajustar metas de água/nutrição) — deixou de ser só leitura. Detalhe completo em "Gaps restantes fechados — 12/08/2026" mais abaixo. Texto original mantido abaixo como registro histórico.

### Coach IA — dual (texto histórico, desatualizado — ver nota acima)

**Conversacional**, com histórico e actions:
```js
const COACH_SYSTEM = `Você é o Coach do Geburah, um personal trainer e nutricionista com acesso total ao app.
AÇÕES DISPONÍVEIS (retorne dentro de <actions>[...]</actions>):
- {"action":"registrar_peso","peso":88.5,"data":"YYYY-MM-DD"}
- {"action":"registrar_refeicao","alimentoNome":"frango","qtd":150,"refeicao":"Almoço","data":"YYYY-MM-DD"}
- {"action":"registrar_agua","ml":250,"data":"YYYY-MM-DD"}
- {"action":"iniciar_treino","rotinaId":"rt1"}
- {"action":"registrar_medida","medidas":{"Cintura":90,"Peso":88}}
- {"action":"ajustar_meta_calorias","cal":2000,"prot":160}`;

const sendCoach = async () => {
  // ... monta contexto (peso hoje, meta do dia, calorias, treinos na semana, streak)
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:ctx, messages:newHistory.slice(-10) })
  });
  // parseia <actions>[...]</actions>, executa cada uma
};
```

`registrar_refeicao` busca o alimento por substring do nome:
```js
const al = alimentos.find(a=>a.name.toLowerCase().includes((act.alimentoNome||"").toLowerCase()));
if(al) setLogDieta(/* ... */); // se `al` for undefined, a action falha SILENCIOSAMENTE
```
**Atualizado em 04/08/2026:** o banco (`alimentos`) cresceu de poucos itens para 376 (22 categorias, padrão TACO) — o match por substring falha bem menos agora, mas o mecanismo continua sendo string simples (sem normalização/fuzzy), então nomes muito diferentes do cadastro ainda falham silenciosamente. Ver [[04 Bugs Conhecidos]].

**Analítico** (`callAI`), separado do chat — diagnóstico single-shot.

🔴 **Ambos** os `fetch` (conversacional e analítico) só enviam `{"Content-Type":"application/json"}` como header — sem `x-api-key`/`anthropic-version`. Mesmo padrão sistêmico documentado em [[04 Bugs Conhecidos]].

### Widgets customizáveis
`widgetLayout` persiste quais blocos aparecem no dashboard do módulo (10 tipos: score, peso-hero, macros-hoje, água, streak, treino-hoje, pr-board, meta-peso, ai-insight, planejamento).

## Padrão de tema — corrigido em 12/08/2026
Era exatamente o anti-padrão "🟡 Tema global mutável (C)" listado em [[04 Bugs Conhecidos]] (`let C` no escopo do módulo, reatribuído a cada render). **Correção não foi um simples `let`→`const`:** `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar` (as únicas das ~8 funções de UI compartilhada que dependem de cor de tema) liam `C` por closure de módulo em ~100 call sites espalhados pelo arquivo — só trocar pra `const C` local dentro do componente exigiria (a) aninhar essas 6 funções dentro de `GeburahModule` (recriaria a identidade delas a cada render → React desmontaria/remontaria qualquer `<input>` dentro de um `Sheet` aberto a cada tecla digitada, regressão grave) ou (b) passar `C` como prop nos ~100 call sites (risco alto de erro manual num arquivo de 2200+ linhas).

**Solução adotada:** `ThemeCtx` (`React.createContext`), criado uma vez no topo do módulo. `GeburahModule` calcula `const C = dark ? DARK : LIGHT` local (correto) e monta `<ThemeCtx.Provider value={C}>` uma única vez, envolvendo todo o JSX retornado. `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar` continuam em escopo de módulo (identidade estável entre renders — sem risco de remount) e cada uma chama `useContext(ThemeCtx)` internamente pra ler o C atual. Nenhum dos ~100 call sites precisou mudar. `Btn`/`Badge` não usam cor de tema, ficaram como estavam.

**Achado no processo, corrigido em 12/08/2026 (leva seguinte):** `GebTab`, `TreinoTab`, `NutriTab`, `PlanejamentoTab`, `MedidasTab`, `ConfigTab`, `LogTreinoPage` e `WidgetEditorSheet` eram todas definidas como `const XTab = () => {...}` **dentro** de `GeburahModule` — o mesmo anti-padrão de "componente recriado a cada render" que o fix de `C` evitou introduzir, só que pré-existente e numa escala maior: cada uma dessas 8 "abas" perdia seu próprio estado interno (`TreinoTab` tinha `useState("rotinas")`/`useState(null)` pra sub-view e grupo selecionado, por exemplo) toda vez que `GeburahModule` re-renderizava por qualquer motivo — o que é frequente. Achado pelo eslint (`react-hooks/static-components`) ao validar o fix do tema, e corrigido quando o usuário pediu pra resolver os gaps restantes do módulo. Ver seção "Correções de arquitetura" abaixo.

## Gap analysis — pós-biblioteca de exercícios (09/08/2026)

Feita depois de fechar o gap "banco de exercícios pequeno" (ver [[04 Bugs Conhecidos]]), pra identificar o que continua faltando agora que o dado de MET existe. Achados por leitura direta do código, do mais pro menos importante:

1. **MET existe mas não é consumido em nenhum cálculo real — só aparece como badge estático.** `kcalMinExercicio` roda só na lista de exercícios (Treino → Exercícios); nunca é somado numa sessão de treino, nunca abate de `calHoje` (a conta de calorias hoje é só dieta) e não entra em `gebScore`/`treinoScore`. A lacuna "sem dado de gasto calórico" virou "tem o dado, mas ele não circula pro resto do app".
2. **Bloqueador raiz do item 1: `logTreino` não guarda duração.** Cada treino salvo tem `data`, `rotinaId` e `series` (`exercicioId,series,reps,carga,cargaReal,feito`) — sem `horaInicio`/`horaFim` nem tempo por série. Sem duração, qualquer "kcal queimadas nesse treino" precisa chutar um tempo — não dá pra fazer certo sem resolver isso primeiro. É o item que desbloqueia o 1, o 3 (parcialmente) e o 4.
3. **`treinoScore` é só frequência, ignora o que foi treinado.** `Math.min(100,Math.round(treinos7d/4*100))` — 4 sessões de Boxe Iniciante (7-11 MET, alta intensidade) zeram o score igual a 4 treinos pesados de perna, e um treino de 5min de alongamento de pescoço conta igual a um treino completo. Já era assim antes da biblioteca; o catálogo maior (Cardio/Artes Marciais) deixa a lacuna mais visível.
4. **O formulário de série assume "carga em kg" pra tudo — não faz sentido pra ~40% do catálogo novo.** `addExRot`/`editExRot` sempre pedem `Carga (kg)`, e PR (`prMap`) só olha `cargaReal`. Funciona bem pra musculação com peso, mas os 123 itens de Artes Marciais (jab, chute, sparring, rounds) e vários itens de corpo/cardio (Prancha, Corda de Velocidade, Corrida) não têm como registrar "3 rounds de 3min" ou "30 flexões" — e um "PR de 0kg" não quer dizer nada.
5. **Planejamento semanal não enxerga o treino.** `PlanejamentoTab` só planeja refeições (`planSem`) por dia; qual rotina cai em qual dia mora em `rotinasTreino[].dias`, mas não aparece nem é editável na visão semanal — são dois sistemas de agenda que não se falam dentro do mesmo módulo.

**Como aplicar:** se o próximo passo for "aproveitar o MET de verdade" (ex: calorias líquidas = dieta − treino), a ordem certa é resolver o item 2 primeiro (duração/hora de início-fim no `logTreino`), senão qualquer estimativa de kcal por sessão fica arbitrária. Os itens 4 e 5 são independentes e podem ser feitos em paralelo. Refletido em [[05 Roadmap]].

> ✅ **Implementado em 12/08/2026 — os 5 itens.** Ver seção "Acompanhamento de treino ao vivo" abaixo.

## Acompanhamento de treino ao vivo — implementado em 12/08/2026
Fecha os 5 itens da gap analysis acima. Proposto primeiro como design (avaliação da "cadeia bloqueada pelo MET"), depois implementado por completo incluindo o item 5 (planejamento), que tinha sido excluído da primeira leva.

**Duração da sessão (desbloqueia os itens 1/3/4).** `logTreino` ganhou `horaInicio` (gravado ao clicar "Iniciar", tanto no widget "Treino de Hoje" do hub quanto no botão "Iniciar" da lista de rotinas) e `horaFim`+`duracaoMin` (gravados por `finalizarTreino`, disparado pelo botão "Finalizar treino" em `LogTreinoPage`). Relógio de sessão ao vivo via `nowTick` (estado elevado a `GeburahModule`, `setInterval` de 1s só enquanto `page.type==="logTreino"`) — mostra `Xmin Ys` contando durante o treino e `Xmin Ys (finalizado)` depois.

**Sistema `logTipo` (carga/tempo/reps) — resolve o item 4.**
```js
const LOG_TIPO_OVERRIDE = { e9:"tempo" }; // exceções que a heurística por grupo/nome erra (ex: Prancha)
function logTipoDe(ex){
  if(!ex) return "carga";
  if(LOG_TIPO_OVERRIDE[ex.id]) return LOG_TIPO_OVERRIDE[ex.id];
  if(ex.grupo==="Artes Marciais"||ex.grupo==="Cardio"||ex.grupo==="Flexibilidade") return "tempo";
  if(ex.equip==="Corpo"&&/flex[aã]o|agachamento livre|abdominal|burpee|barra fixa|paralela/i.test(ex.name||"")) return "reps";
  return "carga";
}
```
`addExRot`/`editExRot` relabelam o campo de meta dinamicamente ("Carga (kg)" / "Tempo (s)" / "Reps") de acordo com o exercício selecionado. `LogTreinoPage` reusa `cargaReal` pra carga e tempo (unidade diferente) e usa um campo novo `repsReal` pro tipo reps. `prMap` ficou type-aware: PR de tipo reps usa `repsReal`, os outros continuam usando `cargaReal`. Verificado no navegador com os 3 tipos (Supino Reto=carga, Prancha=tempo via override, e o formulário de adicionar exercício relabelando corretamente).

**Cálculo de calorias — resolve o item 1.** Reaproveita `kcalMinExercicio` (mesma fórmula MET×fator×peso/60 já usada na Biblioteca de Exercícios) multiplicado pela duração real da sessão: `kcalDoTreino(log)` por sessão, `kcalTreinoHoje`/`kcalTreino7d` agregados, `calLiquidas = calHoje - kcalTreinoHoje` exibido como nova linha "Calorias líquidas" no widget "Macros Hoje" (só aparece quando há treino hoje). Verificado no navegador: sessão de treino finalizada mostrou "~5kcal nesta sessão" e o hub passou a mostrar "− 5kcal do treino de hoje / Líquidas: -5kcal".

**`treinoScore` — resolve o item 3.** Passou a misturar volume de kcal com frequência (mantendo fallback pro cálculo antigo quando não há dado de kcal suficiente), em vez de só contar sessões/semana. Verificado no navegador: score do módulo subiu de 0%→5% (Treino 13%) após uma sessão parcial (1 de 3 exercícios) ser finalizada.

**Planejamento semanal enxerga o treino — resolve o item 5.** `PlanejamentoTab` ganhou uma linha "Treino" por dia (usa o novo `DIAS_COMPLETOS` + `setTreinoDoDia(diaCompleto, novaRotinaId)`), mostrando a rotina agendada (lida de `rotinasTreino[].dias`, a mesma fonte que a aba Treino já usava), indicador "✓ feito" quando existe um `logTreino` daquele dia com `rotinaId` correspondente e `horaFim` preenchido, e um dropdown de reatribuição pra trocar a rotina do dia sem sair do planejamento. Verificado no navegador: reatribuir o dia de hoje pra "Treino A" (rotina já finalizada na sessão de teste) fez o "✓ feito" aparecer imediatamente.

## Gaps restantes fechados — 12/08/2026 (leva seguinte)
Depois de listar os gaps pendentes pós-implementação (Coach `actions:false`, match de refeição por substring simples, `D_ROT` preso aos 10 exercícios originais, sem timer automático, sem sugestão de carga, componentes de aba recriados, arquivo monolítico), o usuário pediu pra resolver todos, **exceto** integração com wearables e reconhecimento de foto por IA (ambos propositalmente adiados — dependem de infra externa/são feature premium sem prioridade, ver [[05 Roadmap]]) — e pediu que o item de arquivo monolítico virasse um **plano de execução pro app inteiro**, não uma implementação isolada no Geburah (ver [[11 Plano de Decomposição — Arquivos Monolíticos]]).

**Coach ganhou `actions:true`** — `preview/src/shared/geburahActions.js` (novo arquivo, mesmo padrão de `yesodActions.js`): 8 ações (`register_weight`, `register_meal`, `register_water`, `adjust_water_goal`, `register_measurement`, `start_workout`, `finish_workout`, `adjust_nutrition_goal`). `start_workout`/`finish_workout` espelham exatamente o botão "Iniciar"/`finalizarTreino` da UI, então relógio ao vivo/kcal/treinoScore tratam igual não importa se o treino começou pela tela ou pelo Coach. `coachSkills.js` atualizado (`actions:true`, novo system prompt numerado, `treino_em_andamento_hoje` adicionado ao contexto pra o Coach saber se já existe sessão aberta antes de propor `start_workout` de novo). Como o estado do Geburah não vive em `App.jsx` (mora em `usePersisted`/localStorage dentro do próprio módulo, igual Yesod), foi preciso o mesmo mecanismo de sincronização do Yesod: `usePersisted` ganhou um 3º parâmetro opcional `reloadSignal` (relê a chave do localStorage quando muda) e `GeburahModule` passa um `coachSyncTick` (incrementado via `useCoachDataSync("geburah", ...)`, ver `coachSync.js`) pras chaves que uma ação pode alterar. Verificado no navegador: gravar `lifetree_geb_pesagens` direto e disparar o evento `lifetree:coach-data-updated` (simulando o que uma ação real faz) atualizou "Pesagem de Hoje" e o score do módulo **sem reload da página**.

**Match de `register_meal` deixou de ser substring simples.** `geburahActions.js` tem `findByField` com normalização (remove acento/caixa) e 4 níveis de confiança crescente: exato → prefixo → substring (comportamento antigo) → todas as palavras da busca aparecem no nome (resolve "peito grelhado" batendo em "Peito de Frango Grelhado", que substring puro não pega se a ordem das palavras não é idêntica). Resolve o gap documentado em [[04 Bugs Conhecidos]] (banco cresceu pra 376 itens em 04/08/2026, mas o mecanismo de match continuava simples).

**`D_ROT` ganhou uma 4ª rotina, sem tocar nas 3 originais.** Os ids `e1`..`e10` de `D_EX_BASE` não foram remapeados (evita invalidar PR/histórico de quem já tem dado salvo referenciando esses ids) — em vez disso, "Treino D — Full Body (biblioteca nova)" foi adicionado no dia livre (Domingo), usando 4 exercícios da biblioteca de 286 migrada em 09/08/2026 (`elm3` Supino Reto c/ Barra, `elm26` Puxada Aberta, `elm93` Leg Press 45°, `ela157` Corda de Velocidade — esse último já classificado tipo "tempo" pela heurística de grupo, sem precisar de override). Resolve o gap "quem nunca abre Treino → Exercícios não descobre que a biblioteca nova existe".

**Timer automático pós-série já existia** — checado no código antes de reimplementar: `onClick` do checkbox de série já disparava `setTimerAtivo` quando a série era marcada feita (`if(!s.feito&&s.descanso>0)`), adicionado na leva anterior (implementação do acompanhamento ao vivo) sem ter sido nomeado explicitamente como "timer automático" na doc. Verificado de novo no navegador pra confirmar.

**Sugestão de carga/tempo/reps baseada em PR** — heurística simples (não é IA): `prSugestao = PR + incremento` (+2.5kg carga, +5s tempo, +1 rep), mostrada como hint (`sugestão: 62.5kg (PR: 60kg)`) sob o campo de registro de série, só quando existe PR pro exercício. Achado no processo, corrigido junto: `prMap` contava série **ainda não executada** como PR (`cargaReal` nasce pré-preenchida com a carga alvo da rotina ao iniciar o treino, antes de qualquer `feito:true`) — corrigido filtrando `s.feito` antes de considerar pro cálculo. Ver [[04 Bugs Conhecidos]].

**Componentes de aba recriados a cada render — corrigido.** `TreinoTab`/`NutriTab` tinham `useState` próprio (sub-view, grupo/nível da biblioteca) — subiu pro escopo de `GeburahModule` (mesmo padrão já usado pra `medExpanded`/`fotos` etc.). Os 8 call sites (`GebTab`, `TreinoTab`, `NutriTab`, `PlanejamentoTab`, `MedidasTab`, `ConfigTab`, `LogTreinoPage`, `WidgetEditorSheet`) trocaram de JSX (`<TreinoTab/>`) pra chamada direta (`TreinoTab()`) — como são plain function calls (não instanciação de componente React), o retorno é inlined na árvore do próprio `GeburahModule`, sem identidade própria pra desmontar/remontar. Confirmado: `eslint` não reporta mais nenhuma ocorrência de `react-hooks/static-components` em `GeburahModule.jsx` (eram 8). Verificado no navegador: selecionar grupo "Costas" + filtro "Iniciante" na biblioteca de exercícios, depois alternar modo claro/escuro (força um re-render completo do módulo) — a navegação da biblioteca permanece intacta, algo que resetaria pro estado inicial antes da correção. `Row`/`Sec` (helpers internos de `ConfigTab`, sem estado próprio, sem inputs) ficaram de fora dessa correção de propósito — remontam também, mas não perdem estado nem afetam foco de digitação; hoisting deles fica pro item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]] se algum dia valer a pena.

~~**Arquivo monolítico — não implementado, virou plano.**~~ **Implementado em 22/08/2026.** Por pedido explícito do usuário em 12/08, virou primeiro um plano de arquitetura do app inteiro — ver [[11 Plano de Decomposição — Arquivos Monolíticos]] — que passou a ser executado 10 dias depois: dado estático extraído (item 1, 21/08), kit de UI compartilhado consolidado (item 2, 21/08), e o shell fatiado em subarquivos por domínio com um `GeburahCtx` (`React.createContext`) pra estado cross-aba (item 5, 22/08). `TreinoTab`/`NutriTab`/`MedidasTab`/`PlanejamentoTab`/`ConfigTab` viraram componentes de módulo de verdade em `preview/src/geburah/`, cada um lendo o Context via `useContext` — o estado que tinha subido pro `GeburahModule` só pra sobreviver ao remount de "componentes recriados" (parágrafo acima) voltou a ser `useState` local dentro de cada aba, já que elas não são mais recriadas a cada render. `Row`/`Sec` do `ConfigTab` (mencionados acima como candidatos a hoisting "se algum dia valer a pena") acabaram não precisando — foram só junto pro arquivo novo como estavam, sem problema porque nunca tiveram estado próprio. Detalhe completo, arquivo por arquivo, em [[11 Plano de Decomposição — Arquivos Monolíticos]] → "Item 5 concluído no Geburah".

Todas as mudanças de código verificadas com `npm run build` (limpo) e `eslint` (zero erros novos; os poucos achados restantes em `GeburahModule.jsx` são pré-existentes, já documentados) antes da verificação no navegador.

## Checagem contra a visão do usuário (09/08/2026)
Feita como parte da auditoria cruzada dos 10 módulos (ver [[01 Estado Atual]] e artefato web linkado lá). Visão do usuário pro módulo: acompanhar medidas, refeições/macros, e **planejar** dieta e treino em linha com objetivos de peso. Medidas (`medidasCorp`), refeições/macros (`logDieta`+`alimentos`) e metas de peso/caloria já cobrem a maior parte. O ponto "planejar" já tem base própria (`planSem` — planejamento semanal, `PlanejamentoTab`) que a gap analysis acima já tinha mapeado como incompleta: item 5, "planejamento semanal não enxerga o treino" — é o mesmo gap, não um novo, só confirmando que a visão do usuário e o gap já documentado apontam pro mesmo lugar.

> ✅ Item 5 implementado em 12/08/2026 — ver "Acompanhamento de treino ao vivo" acima.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[05 Roadmap]]
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
