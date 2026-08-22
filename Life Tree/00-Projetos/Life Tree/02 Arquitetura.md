---
tags: [lifetree, arquitetura]
aliases: [Arquitetura]
---

# Arquitetura

## Estrutura do monorepo

```
LifeTree/
├── preview/                    ← App principal rodando (Vite, localhost:5173)
│   └── src/
│       ├── App.jsx             ← Life Tree hub (árvore central) — 1232 linhas (RPG removido 19/08/2026, ainda não fatiado)
│       ├── YesodModule.jsx     ← Módulo Finanças — ✅ integrado, ainda não fatiado
│       ├── GeburahModule.jsx   ← Módulo Saúde — ✅ integrado — **shell fatiado em 22/08/2026** (1795→527 linhas, ver `geburah/` abaixo)
│       ├── geburah/            ← 13 arquivos — tabs/sheets (`TreinoTab.jsx`, `NutriTab.jsx`, `MedidasTab.jsx`, `PlanejamentoTab.jsx`, `ConfigTab.jsx`) + `context.js` (`GeburahCtx`) + `theme.js`/`constants.js`/`helpers.js`/`icons.jsx` + dado estático (`exerciseLibrary.js`/`foodLibrary.js`/`defaultRoutines.js`/`seedData.js`)
│       ├── HodModule.jsx       ← Módulo Profissional — ✅ integrado — **shell fatiado em 22/08/2026** (1768→309 linhas, ver `hod/` abaixo)
│       ├── hod/                 ← 12 arquivos — tabs/páginas/sheets (`HodTab.jsx`, `CarreiraTab.jsx`, `ProjetosTab.jsx`, `ClientPage.jsx`, `MarcaTab.jsx`, `ConfigTab.jsx`) + `context.js` (`HodCtx`) + `theme.js`/`constants.js`/`helpers.js`/`icons.jsx`/`seedData.js`
│       ├── TipharethModule.jsx ← Módulo Autocuidado — ✅ integrado, ainda não fatiado
│       ├── ChesedModule.jsx    ← Módulo Relacionamentos — ✅ integrado em 31/07/2026, ainda não fatiado
│       ├── NetzachModule.jsx   ← Módulo Qualidade de Vida — ✅ integrado em 31/07/2026, ainda não fatiado
│       ├── ChokmahModule.jsx / BinahModule.jsx ← Espiritualidade / Conhecimento — ✅ integrados 13/08/2026, ainda não fatiados
│       ├── MalkuthModule.jsx / KetherModule.jsx ← Controle / Desejo — 🟡 protótipos (18–20/08/2026)
│       └── shared/              ← `ui.jsx`/`uiBind.jsx` (kit de UI compartilhado, item 2 do plano de decomposição), `coachSync.js`, `photoStore.js`
│
├── modules/                    ← Módulos standalone (cada um tem seu Vite próprio)
│   ├── yesod-financas/         ← ✅ tem código real em src/ + dev server próprio
│   ├── hod-profissional/       ← ✅ idem
│   ├── geburah-saude/          ← presumido — não auditado em detalhe
│   ├── chesed-relacionamentos/ ← ⚠️ desatualizado vs preview/src/ChesedModule.jsx (integração adicionou persistência+score bridge só lá)
│   ├── netzach-qualidade/      ← ⚠️ idem, desatualizado vs preview/src/NetzachModule.jsx
│   └── [outros 5 módulos]/     ← estrutura de pasta criada, conteúdo não auditado
│
├── shared/
│   ├── storage/index.js        ← Bridge localStorage
│   ├── theme/index.js          ← Tema compartilhado
│   └── score-bridge.js         ← Publica scores para a Árvore
│
├── app/
│   ├── native/                 ← vazio, confirmado em 10/08/2026 (não é "não auditado" — é 0 arquivos, ver [[10 Segurança, Mobile e Performance]])
│   └── versions/               ← Histórico de versões (ver [[Versões]])
│
└── docs/
    ├── roadmaps/
    ├── avaliacoes/
    ├── ai-coach-agent-spec.md
    └── smartwatch-integration.md
```

> ⚠️ Corrigido em auditoria de 28/07/2026: o código real tem **4 módulos integrados** (Yesod, Geburah, Hod, Tiphareth), não apenas Yesod. Ver mapeamento completo e status de cada sefirá em [[03 Módulos (Sefirot)]].

---

## Funcionamento geral do `App.jsx` (o hub)

Esta seção documenta cada funcionalidade do hub central com o código real que a implementa — não a intenção original, o que está de fato rodando. Todas as referências de linha são de `preview/src/App.jsx`.

### Score bridge — como a Árvore calcula as cores das sefirot

> ⚠️ **Atualizado em 22/08/2026** — o snippet abaixo descrevia só os 6 primeiros módulos integrados (31/07/2026); hoje `aScores` promove **10** chaves (os 8 módulos reais + 2 protótipos, este último via um score fixo já que Kether/"Desejos" não tem conceito de score próprio). O sistema de hábito/meta genérico do hub que alimentava `aScoresBase` como fallback **foi removido em 19/08/2026** junto da camada de RPG (ver [[04 Bugs Conhecidos]]) — hoje o fallback de qualquer sefirá sem módulo é fixo, não mais calculado a partir de hábitos/metas do hub.

Cada sefirá tem um score (0-1) que vem do `localStorage` compartilhado, publicado por cada módulo real:

```js
// App.jsx:542-553 — getModuleScore lê o score que cada módulo publica em lifetree_scores
const aScores={
  desejos:        0, // Kether/Desejo não tem conceito de score próprio — fixo em 0
  financas:       getModuleScore("yesod",    finScore) / 100, // único com fallback não-fixo, ver ressalva abaixo
  profissional:   getModuleScore("hod",      0) / 100,
  autocuidado:    getModuleScore("tiphareth",0) / 100,
  saude:          getModuleScore("geburah",  0) / 100,
  relacionamentos:getModuleScore("chesed",   0) / 100,
  qualidade_vida: getModuleScore("netzach",  0) / 100,
  espiritualidade:getModuleScore("chokmah",  0) / 100,
  conhecimento:   getModuleScore("binah",    0) / 100,
  pessoal:        getModuleScore("malkuth",  0) / 100, // Malkuth/Controle
};
```

Cada módulo escreve o próprio score em `localStorage.lifetree_scores` (ver "Como um módulo se conecta à Árvore" abaixo) — `App.jsx` só lê, nunca calcula score de módulo nenhum internamente. `financas` é a única chave com fallback não-fixo (`finScore`, o card manual "Leve pra Árvore" do Yesod) — resquício de quando esse card era a única fonte de score antes do Yesod publicar score real; as outras 8 caem pra `0` se o módulo ainda não publicou nada.

### KabbalahTree — efeito de líquido subindo com superfície ondulada (31/07/2026)

Cada sefirá é desenhada como um círculo SVG com um "líquido" que sobe proporcionalmente ao score — recortado (`clipPath`) na forma do próprio círculo:

```js
// dentro de <defs>: um clipPath por sefirá
{sefirot.map(s=>(
  <clipPath key={"clip"+s.id} id={"clip"+s.id}>
    <circle cx={s.x} cy={s.y} r={R-2}/>
  </clipPath>
))}
```

O nível do líquido (altura do preenchimento) é o mesmo cálculo desde a primeira correção — `y = s.y+(R-2)-2*(R-2)*sc`, animado via CSS transition. O que mudou em 31/07 (2ª rodada, depois que o usuário achou o topo "rígido demais"): em vez de um `<rect>` com borda reta, a superfície agora é um `<path>` ondulado (`buildWaveD`), animado horizontalmente em loop:

```js
const WAVE_WL=22, WAVE_AMP=1.7; // comprimento de onda / amplitude, em unidades do viewBox
const buildWaveD = (leftX, rightX, baseY, bottomY) => {
  const half=WAVE_WL/2;
  let d=`M ${leftX} ${baseY} `, x=leftX, up=true;
  while (x < rightX) {
    const nx=x+half;
    d+=`Q ${x+half/2} ${baseY+(up?-WAVE_AMP:WAVE_AMP)} ${nx} ${baseY} `;
    x=nx; up=!up;
  }
  d+=`L ${rightX} ${bottomY} L ${leftX} ${bottomY} Z`;
  return d;
};
```
```jsx
<g clipPath={"url(#clip"+s.id+")"}>
  <g style={{transform:"translateY("+(s.y+(R-2)-2*(R-2)*sc)+"px)",
    transition:"transform .8s cubic-bezier(.4,0,.2,1)"}}>
    <g style={{animation:"waveMove 3.4s linear infinite"}}>
      <path d={buildWaveD(s.x-(R-2)-WAVE_WL, s.x+(R-2)+WAVE_WL, 0, 200)} fill={s.color} fillOpacity={0.7}/>
      <path d={buildWaveD(s.x-(R-2)-WAVE_WL, s.x+(R-2)+WAVE_WL, 0, 200)} fill="none" stroke={s.color} strokeOpacity={0.95} strokeWidth="1.1"/>
    </g>
  </g>
</g>
```
O path é gerado bem mais largo que o círculo (`±WAVE_WL` de folga de cada lado) pra poder deslizar horizontalmente (`@keyframes waveMove{from{translateX(0)}to{translateX(-22px)}}`, um comprimento de onda inteiro) sem nunca expor uma borda dentro da área visível do círculo — o excesso é cortado pelo `clipPath`.

**Histórico do que veio antes (31/07, 1ª rodada):** o círculo era preenchido inteiro com opacidade quase fixa (`fillOpacity={0.1+sc*0.2}`, variando só 10-30%) — não dava nenhuma sensação de "completude". Era uma especificação original que tinha se perdido. Primeira correção trocou por um `<rect>` clipado com altura proporcional ao score (borda reta no topo); a 2ª rodada (acima) trocou o `<rect>` pelo `<path>` ondulado. Ver [[04 Bugs Conhecidos]] para o achado completo de cada rodada.

`sc` vem de `scoreMap`, que **precisa usar `??` e não `||`** ao ler o score:
```js
const scoreMap = Object.fromEntries(sefirot.map(s=>[s.id, scores[s.areaId]??0.5]));
```
Com `||`, uma sefirá em **exatamente 0%** (`0 || 0.5`) caía no fallback de 0.5 e aparecia com metade do líquido — o mesmo bug clássico de "falsy zero" que vale checar em qualquer lugar do código que combine número + fallback.

As linhas que conectam as sefirot (guias verticais + conexões entre círculos) também foram corrigidas em 31/07: as guias tinham `strokeDasharray` (pontilhadas) enquanto as conexões eram sólidas — agora todas sólidas, e a cor de ambas trocada de `C.b2` (quase invisível no escuro) pra `C.dim`. Ver [[04 Bugs Conhecidos]].

### Persistência do hub — `localStorage` (corrigido em 15/08/2026)

```js
// App.jsx:164-176 — assinatura async preservada de propósito (call sites já
// usavam .then()/await; corpo virou síncrono por dentro, mas não valia a pena
// tocar em todo call site só por isso)
async function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

async function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e) {}
}
```

**Histórico:** até 15/08/2026, `loadState`/`saveState` chamavam `window.storage.get/set` — uma API que só existe no ambiente de artefato Claude; fora dele falhava silenciosamente (o `try/catch` engolia o erro) e nada era persistido. Corrigido trocando o corpo por `localStorage` direto, mantendo `async`/mesma assinatura pra não precisar tocar nos call sites; chave também migrada de `"lifetree-v1"` pra `"lifetree_hub-v1"` (prefixo consistente com os módulos). Ver [[04 Bugs Conhecidos]]. Hoje `saveState` recebe só o que ainda vive no hub (`areas`/`diary`/`widgetConfig`/`finScore`/`dark`) — `habits`/`goals`/`wishes`/`xp`/`coins` não existem mais, ver "Camada de RPG do hub — removida" abaixo.

### Camada de RPG do hub — removida em 19/08/2026

> ⚠️ Até 31/07/2026 esta seção documentava, com código, um sistema genérico de hábitos/metas no hub inteiro separado dos módulos reais: `doCompleteHabit`/`doUpdateGoal` (CRUD com streak/marcos), XP+moedas por completar hábito, 8 níveis (`LVL_T`/`getLevel`), uma "loja" de desejos resgatáveis por moeda, 10 conquistas (`BADGES`) recalculadas a cada ação, um dashboard de 14 widgets (`WIDGET_DEFS`) alimentado por esse sistema, e a aba "Dash" do carrossel (gráfico de XP, top streaks, grid de conquistas). **Nada disso existe mais** — removido por inteiro em 19/08/2026, a pedido do usuário, junto com a decisão de que Kether (não o hub) seria o lugar certo pra "desejo" (ver [[01 Kether]] → "Camada de RPG removida"). Zero ocorrência hoje de `habits`/`goals`/`wishes`/`xp`/`coins`/`BADGES`/`LVL_T`/`WIDGET_DEFS` (o antigo, de 14 opções) em `App.jsx`.
>
> O que ficou no lugar: cada módulo (Yesod, Geburah, Hod...) já tinha o próprio sistema de hábitos/metas específico daquela área — isso nunca dependeu do sistema genérico do hub e continua funcionando normalmente. O hub hoje só mantém `areas` (cor/label customizável), `diary` (diário reflexivo), um `widgetConfig` bem menor (2 widgets: `finscore`, `diario` — ver "Widgets do hub" abaixo) e `finScore` (o card manual "Leve pra Árvore" do Yesod, ver ressalva em "Score bridge" acima). Detalhe completo do que foi removido e por quê em [[04 Bugs Conhecidos]] → "Camada de RPG do hub — removida".

### Widgets do hub (hoje: 2, não mais 14)

```js
// App.jsx:375-380
const WIDGET_DEFS = [
  {id:"finscore", label:"Finanças", icon:"scale", color:"#10b981", value:(fs)=>fs+"%"},
  {id:"diario",   label:"Diário",   icon:"pen",   color:"#ec4899", value:(fs,diary)=>diary.length+" entradas"},
];
```
Cada módulo tem o próprio catálogo de widgets, maior e independente deste (ex: Geburah tem 9 tipos de widget, Hod tem os seus) — não confundir os dois sistemas.

### Diário

Entradas de texto livre associadas a uma sefirá e a um emoji de humor — sem análise de IA sobre o conteúdo (isso é feito à parte, pelo Coach, se o usuário pedir):

```js
const submitDiary=()=>{
  if(!diaryForm.text.trim()) return;
  const entry={id:"d"+uid(),date:todayK(),...diaryForm}; // {sefirotId, text, mood}
  setDiary([entry,...diary]);
};
```

### Coach de IA

> ⚠️ **Reescrito em 01/08/2026 — a versão anterior deste texto descrevia um `fetch` direto do client pra API da Anthropic sem headers de auth. Isso foi corrigido e substituído por completo** (proxy serverless + registry de skills + confirmação obrigatória). Não existe mais nenhum `fetch` direto à Anthropic em nenhum lugar do client — ver decisão "Life Tree Coach architecture" no histórico do projeto pra como se chegou aqui.

**Camada de transporte (auth):** o client nunca fala com a Anthropic direto. `preview/src/shared/coachClient.js` (`callCoachAPI()`) chama `/api/coach` — uma function serverless (`preview/api/coach.js` em produção na Vercel, replicada por um middleware do próprio `vite.config.js` em `npm run dev`) que injeta a API key (guardada como env var, nunca no bundle) e os headers corretos (`x-api-key`, `anthropic-version`) antes de repassar pra Anthropic.

**Camada de skill (contexto + prompt por módulo):** `preview/src/shared/coachSkills.js` é um registry — `COACH_SKILLS = { hub, yesod, hod, tiphareth, geburah, chesed, netzach }`. Cada skill tem `buildContext()` (monta o resumo de dados daquele domínio) e `systemPrompt(ctx)`. `pickSkillId(activeModule, texto)` escolhe a skill pelo módulo ativo na tela, com fallback por palavra-chave quando a pergunta foge do domínio atual. `sendToCoach` (em `App.jsx`) monta o system prompt a partir da skill escolhida e chama `callCoachAPI`.

**A barra do Coach é permanente**, não uma aba — `position:fixed`, visível em qualquer tela do hub e por cima de qualquer módulo ativo (zIndex:150, acima do wrapper do módulo que fica em zIndex:100 de propósito — ver "Coach de IA — ações por módulo" abaixo pro porquê disso importar). Mostra um balão com a última resposta acima do campo.

**Confirmação obrigatória, sempre** (decisão de 01/08/2026, pedida explicitamente pelo usuário — "para qualquer registro"): nenhuma ação executa no turno em que a IA responde. O JSON entre `<ACTION>...</ACTION>` é parseado e guardado em `pendingCoachAction` (estado em `App.jsx`); a bolha de resposta mostra botões **Confirmar**/**Cancelar**, e só o clique em Confirmar chama `executeCoachAction`. Cancelar (ou mandar uma nova pergunta sem responder) descarta a ação pendente sem executar nada. Os system prompts instruem a IA a formular a resposta como proposta ("vou fazer X — confirma?"), nunca como se já tivesse feito.

**Duas famílias de ação, dependendo de onde o estado vive — hoje TODOS os 8 módulos reais + o hub têm `actions:true`** (atualizado 22/08/2026 — esta seção descrevia um estado de 01/08/2026 em que só Yesod tinha ações, nunca corrigido conforme os outros módulos foram migrados entre 12–13/08/2026):
- **hub** (`actions:true`): diário vive em `App.jsx` (hábitos/metas genéricos não existem mais no hub, ver "Camada de RPG do hub — removida" acima), ação chama os setters do próprio componente direto (`create_diary`).
- **Yesod** (`actions:true`, 42 ações — 34 desde 01/08/2026 + 8 novas em 12/08/2026 acompanhando divisão de despesas/cenários/eventos de projeção): o estado vive dentro de `YesodModule.jsx`, não em `App.jsx`. Ver seção dedicada abaixo — é o padrão que os outros 7 módulos seguiram.
- **Geburah** (`actions:true` desde 12/08/2026, 8 ações), **Hod** (desde 13/08/2026, 25 ações), **Tiphareth** (desde 13/08/2026, 10 ações), **Chesed** (desde 13/08/2026, 6 ações), **Netzach** (desde 13/08/2026, 8 ações), **Chokmah** (desde a criação, 13/08/2026, 6 ações), **Binah** (desde a criação, 13/08/2026, 6 ações) — todos seguindo a mesma receita `<modulo>Actions.js` + `useCoachDataSync` descrita abaixo. Nenhum módulo real fica só em leitura hoje.
  - **Hod, 09/08/2026 (histórico):** antes de ganhar `actions:true` em 13/08, o `buildHodContext()` e o `systemPrompt` da skill já tinham sido bastante enriquecidos (trilhas de competência com score, projetos com fase/canvas/evidência, clientes precisando de atenção) e a persona virou um mentor exigente ("honestidade brutal", confronta fase declarada com evidência) antes de qualquer ação executável existir. Exemplo de que dá pra evoluir bastante o *contexto* e o *prompt* de uma skill antes de mexer em `actions`. Detalhe completo em [[08 Hod]].

### Coach de IA — a barra segue a cor do módulo ativo (01/08/2026)

**Problema encontrado:** a barra do Coach (ícone lótus, botão de enviar, botão Confirmar) tinha 3 cores hardcoded (`#818cf8` roxo, `#c084fc` roxo claro, `#10b981` verde — esse último claramente copiado do Yesod, o módulo de referência) que não mudavam com o módulo ativo. Resultado: dentro do Geburah (identidade vermelha) a barra continuava roxa/verde, e mesmo dentro do Yesod (identidade verde) só o botão Confirmar acertava a cor por coincidência — o resto seguia o roxo do hub.

**Correção — `MODULE_ACCENTS` em `App.jsx`:** um mapa fixo `{ yesod, hod, tiphareth, geburah, chesed, netzach } → hex`, com o **mesmo hex** que cada `*Module.jsx` já usa na própria constante `ACCENT` no topo do arquivo (não inventar uma cor nova aqui — copiar a que já existe):

```js
const MODULE_ACCENTS = {
  yesod: "#10b981", hod: "#f97316", tiphareth: "#f59e0b",
  geburah: "#ef4444", chesed: "#ec4899", netzach: "#84cc16",
  chokmah: "#c084fc", binah: "#4f46e5", malkuth: "#b45309", kether: "#06b6d4", // adicionados conforme cada módulo nasceu (13/08 a 20/08/2026)
};
const HUB_ACCENT = "#818cf8"; // cor do hub em si, fora de qualquer módulo
```

Dentro do componente: `const coachAccent = MODULE_ACCENTS[activeModule] || HUB_ACCENT;` — usado no ícone lótus, no botão de enviar e no botão Confirmar da barra do Coach. Sem módulo ativo (telas do hub: Árvore/Hábitos/Metas/Config), cai no roxo do hub, sem mudança de comportamento ali.

**Regra pra módulo novo:** ao integrar um módulo (ver checklist mais abaixo), adicionar sua cor em `MODULE_ACCENTS` usando o mesmo hex do `ACCENT` do módulo — não precisa mexer em mais nada, a barra do Coach já pega a cor sozinha pelo `activeModule`. Isso vale só pra elementos que vivem no **hub** mas precisam refletir a identidade do módulo ativo (hoje, só a barra do Coach); dentro do próprio `*Module.jsx` cada um já usa sua própria constante `ACCENT` normalmente, sem precisar desse mapa.

### Coach de IA — ações por módulo (o padrão pra dar ações a um módulo novo)

O problema: o Coach roda em `App.jsx`, mas o estado de cada módulo (exceto hub) vive dentro do próprio componente do módulo (`useState` + `localStorage`), não em `App.jsx`. Não dá pra chamar `setAccs(...)` de dentro de `App.jsx` porque esse setter nem existe lá. E se o módulo estiver **montado** (usuário navegou até ele) quando uma ação roda, o estado em memória do componente fica desatualizado em relação ao `localStorage` até um reload manual — a UI mostraria dados velhos.

A solução usada no Yesod (`preview/src/shared/yesodActions.js`) é o padrão oficial:

1. **Um arquivo `<modulo>Actions.js`** com uma função por ação. Cada função lê o estado atual do `localStorage` (`lifetree_<prefixo>_<chave>`), aplica a mudança, escreve de volta, e retorna `{ok, message}`.
2. **Registry de handlers**: exporta um objeto `<MODULO>_ACTION_HANDLERS = { nome_da_acao: funcao, ... }`. Em `App.jsx`, o dispatch genérico é `YESOD_ACTION_HANDLERS[action.action]?.(action)` — não precisa de um `if` por ação ali.
3. **Sincronização com o componente montado**: `preview/src/shared/coachSync.js` fornece `notifyCoachDataUpdated(moduleId)` (chamar no fim de cada ação que escreveu algo) e o hook `useCoachDataSync(moduleId, reloadFn)` (chamar uma vez dentro do componente do módulo, apontando pra mesma função que ele já usa pra carregar do `localStorage` no mount). Um único nome de evento (`lifetree:coach-data-updated`) serve pra todos os módulos — o hook filtra por `detail.module`, não precisa inventar um evento novo por módulo.
4. **Contexto rico o bastante pra resolver referências por nome**: como a IA não tem acesso a IDs internos, o `buildXContext()` da skill precisa incluir listas de nomes (contas, categorias, o que for) pra a IA "apontar" pro item certo, e as funções de ação usam *fuzzy match* por substring (`nome.toLowerCase().includes(texto)`) — nunca exigir ID exato da IA.
5. **Modais do módulo (`Sheet` ou equivalente) precisam de `createPortal`**: como o wrapper do módulo ativo fica em `zIndex:100` (abaixo do coach bar, de propósito — pra ele aparecer por cima do conteúdo normal do módulo), qualquer modal fullscreen dentro do módulo (formulário de Add/Edit) ficaria **preso atrás do coach bar** se não escapasse desse stacking context. Todo `Sheet` dos 6 módulos usa `createPortal(sheetJsx, document.body)` por isso — replicar em qualquer modal novo que precise aparecer por cima de tudo.

```js
// <modulo>Actions.js — esqueleto
import { notifyCoachDataUpdated } from "./coachSync.js";
const PFX = "lifetree_<prefixo>_";
function readJSON(key, fallback) { /* localStorage.getItem(PFX+key), JSON.parse ou fallback */ }
function writeJSON(key, val) { /* localStorage.setItem(PFX+key, JSON.stringify(val)) */ }

export function createAlgumaCoisa(a) {
  const lista = readJSON("chave", []);
  // validar a.campo, montar o novo item, dar push
  writeJSON("chave", [...lista, novoItem]);
  notifyCoachDataUpdated("nome-do-modulo");
  return { ok: true, message: "Criado." };
}

export const MODULO_ACTION_HANDLERS = { create_algo: createAlgumaCoisa, /* ... */ };
```

```js
// dentro do componente do módulo
import { useCoachDataSync } from "./shared/coachSync.js";
// ... loadFromStorage já existe (carrega tudo do localStorage pros setters do componente)
useCoachDataSync("nome-do-modulo", loadFromStorage);
```

**Decisão de arquitetura registrada em 01/08/2026:** o usuário optou explicitamente por **não migrar o estado dos módulos pra um store global** (Context API ou lib tipo Zustand) agora — eliminaria de vez a necessidade do evento de sync, mas é um risco de regressão alto nos 6 módulos já funcionando e dias de trabalho. Revisitar essa ideia só se a camada de ações (o padrão acima) começar a doer de verdade com mais módulos usando.

Actions do hub: `create_habit`, `create_goal`, `create_diary`, `complete_habit`, `update_goal`. Catálogo completo de ações do Yesod (42 ações) em [[09 Yesod]]. Template genérico de Coach pra outros ecossistemas (não Life Tree) em [[Coach de IA]] — esse documento describe o padrão conceitual; **pra replicar de verdade dentro do Life Tree, siga esta seção, não o `fetch` direto que aquele documento ainda mostra como exemplo genérico**.

### Backup / Restore / Reset

Backup é just JSON copiado pra área de transferência (não é um arquivo baixado). **Atualizado em 22/08/2026** — o backup só cobre o que ainda vive no hub (`areas`/`diary`/`widgetConfig`/`finScore`/`dark`); não inclui dado de módulo nenhum (cada `*Module.jsx` persiste e seria restaurado separadamente, se algum dia ganhar backup próprio — hoje não tem):

```js
const buildBackup=()=>JSON.stringify({areas,diary,widgetConfig,finScore,dark,_v:4,_ts:new Date().toISOString()},null,2);

const doExport=()=>{
  navigator.clipboard.writeText(buildBackup()).then(()=>{ /* feedback visual */ });
};

const doImport=()=>{
  try{ const d=JSON.parse(importText); /* restaura cada chave se presente */ }
  catch(e){ setImportError("JSON inválido — verifique o texto copiado"); }
};

const doReset=()=>{
  if(!window.confirm("Apagar todos os dados? Esta ação não pode ser desfeita.")) return;
  /* zera diary; restaura areas/finScore padrão */
};
```

### Personalização de áreas e sub-áreas

Cada uma das 10 áreas e suas sub-áreas tem label e cor editáveis, via a aba Config:

```js
const submitEditArea=()=>{
  setAreas(prev=>prev.map(a=>a.id===mEditArea?{...a,label:areaForm.label,color:areaForm.color}:a));
};
```

### Nomenclatura das sefirot — ptName vs. tema (proposta, 09/08/2026)

Hoje `SEFIROT` (`App.jsx`) tem três nomes por sefirá: `name` (hebraico, ex. "Yesod"), `ptName` (tradução cabalística em PT, ex. "Fundação") e `meaning` (o tema real de área de vida, ex. "Finanças"). A UI usa `ptName` como rótulo em destaque em todo lugar (tooltip da Árvore, cabeçalho de área, Config) e `name` como legenda — `meaning` já existe no dado mas não é o que aparece em destaque em lugar nenhum.

**Proposta levantada pelo usuário na auditoria de 09/08/2026:** inverter o destaque — mostrar o tema (`meaning`, "Finanças"/"Saúde"/...) como rótulo principal, com o nome cabalístico como legenda secundária (do jeito que `name` já é hoje). Como o campo já existe no modelo de dados, é mudança de exibição (trocar qual campo aparece em destaque nos pontos listados em [[03 Módulos (Sefirot)]] → tabela + [[09 Auditoria de Código vs Documentação]]), não de dado — baixo risco. Ainda não implementado; nomes propostos por sefirá (alguns diferem do `meaning` atual pra soar mais natural como rótulo de app) estão em [[05 Roadmap]].

### Instalação no Android — 100% web hoje (levantado em 10/08/2026)

Sem PWA (`preview/public/` só tem `favicon.svg`/`icons.svg`, sem `manifest.json` nem service worker) e sem nenhum código nativo (`app/native/` confirmado vazio — ver correção acima). Três caminhos com trade-off — PWA (esforço pequeno, reaproveita 100% do código, já era o plano), Capacitor (esforço médio, ganha push/biometria/Play Store sem reescrever UI), React Native (esforço grande, reescrita completa). Detalhe e tabela comparativa em [[10 Segurança, Mobile e Performance]].

### Pomodoro / Lembretes / Desfazer exclusão — removidos em 19/08/2026

Três recursos genéricos do hub (timer de foco de 25min por hábito, lembrete de hora/minuto sem disparo real de notificação, undo de 5s ao deletar hábito/meta) viviam dentro das antigas abas "Hábitos"/"Metas" do hub — removidos junto com elas quando a camada de RPG saiu (ver "Camada de RPG do hub — removida" acima). Nenhum dos três tinha equivalente em módulo real; não foram migrados, só descontinuados. Zero ocorrência hoje de `pomodoroRun`/`reminders`/`undoQueue`/`deleteWithUndo` em `App.jsx`.

### Navegação (nav bar) — reduzida 3 vezes: 7→4 (31/07/2026) →4 com 1 slide (18/08) →2 (19/08)

> ⚠️ **Atualizado em 22/08/2026** — esta seção descrevia o estado de 31/07/2026 (4 abas, carrossel de 3 slides) sem registrar as duas reduções seguintes. Histórico completo:

**Original (antes de 31/07):** 7 abas fixas — `tree`, `habits`, `goals`, `rpg`, `dash`, `coach`, `config` — acima do limite de 5 recomendado pela [[Avaliação PO + Designer]].

**31/07/2026:** reduzida pra 4 abas (`tree`/`habits`/`goals`/`config`); RPG e Dash viraram 2 slides de um carrossel dentro da aba Árvore (junto com a própria Árvore, 3 slides no total — "Árvore"/"Status"/"Dash"); Coach virou campo permanente, deixou de ser aba.

**18/08/2026:** o slide "Dash" foi removido do carrossel (seu conteúdo — XP histórico, top streaks, progresso por área, conquistas, diário — é o que hoje migraria pro Malkuth/Controle quando ganhar a aba "Progresso", não foi descartado, só tirado do hub). Carrossel caiu de 3 pra 2 slides ("Árvore"/"Status").

**19/08/2026:** removida a camada de RPG inteira (ver acima) — o slide "Status" (que só tinha os 3 blocos de RPG: moedas/nível, barra de XP, "Jornada de Níveis") deixou de fazer sentido e foi removido também, e as abas genéricas "Hábitos"/"Metas" da nav inferior saíram junto. **Estado atual:** `TABS` tem só **2** itens (`tree`/`config`), `TREE_SLIDES` tem só **1** (`["Árvore"]` — tecnicamente não é mais um carrossel de verdade, já que só sobrou 1 slide, mas o código do scroll-snap continua o mesmo, só não tem pra onde arrastar).

```js
// App.jsx — estado atual (22/08/2026)
const TABS = [
  {id:"tree",   icon:"treelife", label:"Árvore"},
  {id:"config", icon:"gear",     label:"Config"},
];
const TREE_SLIDES = ["Árvore"];
```

**Reescrito em 31/07/2026 (mesmo dia, sessão seguinte):** a primeira versão do carrossel usava arraste manual em JS (`onPointerDown/Move/Up`, cálculo de threshold, `transform:translateX`) — funcionava, mas o usuário achou a navegação "travada"/com delay ao testar. Trocado por **scroll nativo do navegador com CSS scroll-snap**, que é o padrão de mercado pra esse tipo de carrossel (ver seção [[#Navegação — decisão de arquitetura|decisão de arquitetura]] abaixo) — o arraste em si passou a ser 100% gerenciado pelo navegador (inércia, velocidade), sem nenhum JS customizado rastreando o dedo:

```js
const [treeSlide, setTreeSlide] = useState(0); // índice do slide ativo (0,1,2)
const treeScrollRef = useRef(null);            // o container com overflow-x:auto

const treeGoToSlide = i => {
  const el = treeScrollRef.current;
  if(el) el.scrollTo({left: i*el.clientWidth, behavior:"instant"});
  setTreeSlide(i); // ver nota abaixo sobre por que isso é setado direto, não via onScroll
};
```
```jsx
<div ref={treeScrollRef} onScroll={treeOnScroll} style={{display:"flex",
  overflowX:"auto", scrollSnapType:"x mandatory"}}>
  <div style={{width:"100%",flexShrink:0,scrollSnapAlign:"start"}}>{/* Árvore */}</div>
  <div style={{width:"100%",flexShrink:0,scrollSnapAlign:"start"}}>{/* Status */}</div>
  <div style={{width:"100%",flexShrink:0,scrollSnapAlign:"start"}}>{/* Dash */}</div>
</div>
```
As setas/bolinhas de navegação usam a mesma lógica circular de antes (`(treeSlide+1)%3` / `(treeSlide+2)%3`, sem clamp) e ficam **abaixo** do conteúdo do carrossel, não acima — decisão de UX de 31/07/2026: controles de navegação em telas mobile (dots de onboarding, paginação) convencionalmente ficam na base, mais alcançáveis com o polegar (zona de alcance do Steven Hoober) e é o padrão do próprio `UIPageControl` da Apple.

> ⚠️ **Duas descobertas não-óbvias durante a reescrita, ambas confirmadas lendo o console/DOM real, não só suspeita:**
> 1. **`scrollTo({behavior:"smooth"})` trava sem completar** nesse ambiente de desenvolvimento/teste (fica parado no ponto de partida) — só `behavior:"instant"` funciona de forma confiável. Trocado, perdendo a animação suave do clique nas setas (o arraste com o dedo continua com a física nativa do navegador, isso não é afetado).
> 2. **`scrollTo()` programático não dispara o evento `scroll` nativo** nesse mesmo ambiente (confirmado com um `addEventListener('scroll', ...)` puro, sem React) — então o handler `treeOnScroll` (que só detecta arraste real do usuário) nunca atualizaria `treeSlide` depois de um clique na seta. Por isso `treeGoToSlide` chama `setTreeSlide(i)` **diretamente**, sem depender do evento de scroll — assim setas/bolinhas funcionam garantido, independente desse comportamento do navegador. Ambos os achados podem ser uma particularidade do ambiente de automação usado nos testes (não necessariamente reproduzível no Chrome real de um usuário), mas o fix é robusto de qualquer forma.

A sincronia de altura do carrossel (cada slide ocupa só a altura do seu próprio conteúdo, não a do slide mais alto) usa `useLayoutEffect` medindo `scrollHeight` de refs por slide — mesma técnica de antes, mas com um bug real corrigido: o efeito rodava durante a tela de "Carregando..." (`loaded===false`), quando as refs ainda eram `null`, e como `loaded` não estava nas dependências, nunca recalculava depois que o conteúdo real montava (altura ficava travada em `""`, sem efeito, recriando o espaço vazio gigante que o efeito deveria eliminar). Corrigido adicionando `loaded` às dependências do efeito.

## Navegação — decisão de arquitetura
**Por que scroll nativo em vez de JS customizado:** qualquer carrossel horizontal dentro de uma página que também rola verticalmente é uma combinação historicamente frágil. Arraste manual em JS (`pointerdown/move/up` + `transform`) dá controle total, mas reimplementa fisica de scroll que o navegador já resolve (inércia, velocidade, cancelamento por toque acidental) — e é fácil introduzir bugs sutis nesse caminho (ver [[04 Bugs Conhecidos]], bug do StrictMode/updater impuro que pulava 2 slides). CSS `scroll-snap-type` + `overflow-x:auto` delega isso tudo ao navegador; o preço é que **não dá pra confiar em `scrollTo({behavior:"smooth"})` nem no evento `scroll`** disparando de forma previsível em todo ambiente (ver achados acima) — então qualquer navegação programática (botão, dot, deep-link) deve **atualizar o estado React diretamente**, nunca inferir o slide atual só a partir do evento de scroll.

---

## Como um módulo se conecta à Árvore

1. **Score bridge** — módulo publica score (0-100) no localStorage:
```js
localStorage.setItem("lifetree_scores", JSON.stringify({
  yesod: { score: 40, updatedAt: "2026-06-05T..." }
}))
```

2. **App.jsx lê o score** na hora de calcular as cores da árvore (código real, ver seção "Score bridge" acima):
```js
const getModuleScore = (moduleId) => {
  try {
    const raw = localStorage.getItem("lifetree_scores");
    const scores = raw ? JSON.parse(raw) : {};
    return scores[moduleId]?.score ?? 50; // 50 = default
  } catch(e) { return 50; }
};
```

3. **Clique na sefirá** abre o módulo — **atualizado em 22/08/2026**: hoje é uma única função `goToSefira`, cobrindo os 10 sefirot (antes era um if/else com fallback pra uma página genérica, `AreaPage` — removida por inteiro em 19/08/2026 junto da camada de RPG, ver [[04 Bugs Conhecidos]] → "Config não abria os módulos reais"), usada tanto pelo clique na Árvore quanto pela lista de navegação do Config:
```js
// App.jsx — goToSefira(areaId), chamada pelo KabbalahTree.onSelect e pela lista do Config
const goToSefira = areaId => {
  if(areaId==="financas")             setActiveModule("yesod");
  else if(areaId==="profissional")    setActiveModule("hod");
  else if(areaId==="autocuidado")     setActiveModule("tiphareth");
  else if(areaId==="saude")           setActiveModule("geburah");
  else if(areaId==="relacionamentos") setActiveModule("chesed");
  else if(areaId==="qualidade_vida")  setActiveModule("netzach");
  else if(areaId==="espiritualidade") setActiveModule("chokmah");
  else if(areaId==="conhecimento")    setActiveModule("binah");
  else if(areaId==="pessoal")         setActiveModule("malkuth");
  else if(areaId==="desejos")         setActiveModule("kether");
};
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

Detalhe de cada módulo já integrado (Yesod, Geburah, Hod, Tiphareth) com suas próprias funcionalidades e código em [[03 Módulos (Sefirot)]].

---

## Padrão de módulo — template

Todo novo módulo deve seguir este padrão:

```jsx
// ModuloXxx.jsx
import { useState, useEffect, useMemo } from "react";

const ACCENT = "#cor-da-sefira"; // cor específica do módulo

export default function ModuloXxx({ onBack, dark, setDark }) {
  // dark/setDark SEMPRE vêm por prop do hub (App.jsx) — nunca useState local
  // aqui dentro (ver [[04 Bugs Conhecidos]], regra "dark mode via prop", 31/07/2026)
  const C = dark ? DARK : LIGHT;

  // ── PERSISTÊNCIA ──────────────────────────────────────────────────────────
  const [storageLoaded, setStorageLoaded] = useState(false);
  const PREFIX = "lifetree_";

  useEffect(() => {
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

## Checklist de integração — novo módulo

- [ ] Substituir todos os `window.storage.get/set` por localStorage
- [ ] Substituir todas as IIFEs `(()=>{})()` por funções nomeadas
- [ ] Renomear `export default function App()` para `export default function XxxModule({ onBack, dark, setDark })`
- [ ] **`dark`/`setDark` recebidos por prop, sem `useState` local nem chave própria de `localStorage` pra tema** — ver [[04 Bugs Conhecidos]]
- [ ] Adicionar botão `← Árvore` no topo
- [ ] Adicionar score bridge no `useEffect`
- [ ] Adicionar `useMemo` em funções de cálculo pesado
- [ ] Remover imports desnecessários
- [ ] Registrar o módulo em `App.jsx` (import, estado `activeModule`, render `position:fixed`, passar `dark={dark} setDark={setDark}`)
- [ ] **Card de score principal mostra o número uma única vez** — ver diretriz abaixo
- [ ] **Qualquer modal fullscreen (`Sheet` ou equivalente) usa `createPortal(jsx, document.body)`** — senão fica preso atrás do coach bar (zIndex:150 > zIndex:100 do wrapper do módulo). Ver "Coach de IA — ações por módulo" acima
- [ ] Se o módulo vai ganhar ações de Coach: seguir a receita `<modulo>Actions.js` + `useCoachDataSync` da seção "Coach de IA — ações por módulo" acima, adicionar a skill em `coachSkills.js` com `actions:true`
- [ ] **Adicionar a cor do módulo em `MODULE_ACCENTS` (`App.jsx`)** — mesmo hex da constante `ACCENT` do `*Module.jsx` — senão a barra do Coach fica com a cor do hub (roxo) em vez da identidade do módulo quando ele estiver ativo. Ver "Coach de IA — a barra segue a cor do módulo ativo" acima
- [ ] Testar no navegador todas as abas e interações, **inclusive alternando modo escuro/claro a partir do hub e de dentro do módulo**
- [ ] Salvar versão em `app/versions/` (ver [[Versões]])

## Migração de dado default expandido — padrão (09/08/2026)

**Problema geral:** `usePersisted(key, def)` (o hook de persistência usado em todos os módulos) só grava o `def` no `localStorage` quando a chave **ainda não existe**. Se o catálogo default de algo (alimentos, exercícios, o que for) crescer numa sessão futura, instalações que já tinham aquela chave salva (mesmo com só 1 item, ou vazia) **nunca recebem o catálogo novo sozinhas** — ficam presas no default antigo pra sempre. Foi exatamente o que aconteceu com o banco de alimentos do Geburah em 04/08/2026 (376 itens no código, mas quem já tinha `alimentos` salvo continuou vendo o catálogo velho).

**Padrão fechado ao resolver o mesmo problema pro banco de exercícios (09/08/2026, `GeburahModule.jsx`):** um `useEffect` que roda uma vez por instalação, mescla por id (não duplica, não sobrescreve nada que já existe) e usa uma flag própria no `localStorage` pra nunca repetir — assim um item da biblioteca que o usuário decidir apagar depois não reaparece sozinho:

```js
// dentro do componente do módulo, depois dos usePersisted
useEffect(()=>{
  if(sGet("libExMigrated_v1")) return; // flag própria, não reaproveitar a chave do dado em si
  setExercicios(p=>{
    const existentes = new Set(p.map(e=>e.id));
    const novos = [...D_EX_MUSC,...D_EX_ARTES].filter(e=>!existentes.has(e.id));
    return novos.length ? [...p,...novos] : p;
  });
  sSet("libExMigrated_v1", true);
},[]);
```

**Por que uma flag separada, e não só checar `p.length < novoTotal`:** comparar tamanho quebraria assim que o usuário apagasse um item da biblioteca (o total cairia abaixo do esperado e a migração rodaria de novo, trazendo o item apagado de volta). A flag garante que a migração é estritamente **uma vez na vida da instalação**, independente do que o usuário fizer com os dados depois.

**Quando aplicar esse padrão:** toda vez que um catálogo default (`D_EX`, `D_AL`, ou equivalente em outro módulo) crescer depois que o módulo já está em produção. Ainda **não aplicado** ao banco de alimentos do Geburah (a expansão de 04/08/2026 não teve essa migração) — candidato a usar a mesma receita se isso incomodar na prática.

## Decomposição de módulo grande em subarquivos — o padrão (Context por módulo, 22/08/2026)

Item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]] — fatiar um `*Module.jsx` grande num shell pequeno + subarquivos por domínio, sem mudar comportamento nenhum. Aplicado no Geburah e no Hod (os 2 maiores módulos); **não é** o mesmo padrão do checklist de "integrar módulo novo" acima — este aqui parte de um módulo já pronto e maduro, só reorganiza onde o código vive.

**Passo 0, obrigatório: mapear dependências ANTES de editar.** O esboço ingênuo ("um arquivo por aba, threading de props") quebra em qualquer módulo com estado genuinamente cross-aba — o jeito de descobrir isso sem já ter cometido o design errado é um agente em modo **estritamente leitura** (só `Read`/`Grep`/`Glob`, guardrail explícito no prompt — ver nota de processo abaixo) que lê o arquivo inteiro e reporta, por aba/sheet: toda variável de estado/setter/computed que ela usa, e principalmente quais são usadas por **mais de uma aba**. Esse levantamento decide o desenho antes de qualquer linha de código nova ser escrita.

**Se o levantamento achar estado genuinamente compartilhado entre abas (foi o caso nos dois módulos):** criar `<modulo>/context.js` com um único `React.createContext(null)` (`GeburahCtx`, `HodCtx`) + um hook `use<Modulo>()`. O shell monta um objeto `ctx` com tudo que é cross-aba (estado + setters + valores computados que dependem de mais de um pedaço de estado) e o passa via `<XCtx.Provider value={ctx}>`, envolvendo o `<ThemeCtx.Provider>` já existente. Cada aba/sheet extraída vira um **componente de módulo de verdade** (`export function TreinoTab(){ const g = useHod(); const {a,b,c} = g; ... }`), importado e renderizado como JSX normal (`<TreinoTab/>`) — não mais chamado como função (`TreinoTab()`), que era o padrão usado enquanto essas abas viviam dentro do shell (ver bug "Componentes de aba recriados" em [[04 Bugs Conhecidos]]). Isso é seguro agora porque a aba tem identidade de componente estável de verdade (definida em módulo, não mais dentro do corpo do shell) — o motivo original pra chamar como função deixou de existir.

**Efeito colateral que vale a pena procurar:** qualquer estado que estivesse hoisted no shell só pra sobreviver ao antigo bug de remount (comum em módulos que já passaram pela correção de "componentes de aba recriados" antes) pode **voltar a ser `useState` local** dentro da aba extraída — ela não é mais recriada a cada render do shell, então não precisa mais dessa muleta. Reduz a superfície do Context em vez de inchar. Foi o caso do Geburah (`treinoSv`, `bibGrupo`, `medExpanded`, `fotos`, `timerAtivo` etc. voltaram pra dentro das abas); no Hod não se aplicou — nenhuma aba tinha estado local pra começo de conversa (o bug de remount de lá era só de função retornando JSX, `renderTab()`/`renderPage()`, nunca teve estado próprio pra perder).

**O que NÃO extrair — dashboard/agregador com alto fan-in.** Se uma aba (tipicamente a dashboard/hub do módulo) toca dezenas de identificadores de todos os domínios pra montar widgets/resumos, ela é candidata a **ficar no shell**. Regra prática usada nos dois módulos: se o número de identificadores únicos que a aba usa é grande o bastante que threading via Context não simplifica nada (viraria um Context com 35+ chaves só pra uma aba consumir), o custo de extrair supera o benefício — o Geburah manteve `GebTab` no shell por esse motivo; o Hod conseguiu extrair `HodTab` porque os scores por domínio já eram funções prontas (só ~11 identificadores).

**Módulo-scope reutilizável (tema, ícones, constantes, helpers puros) sai pra arquivos à parte também**, importados tanto pelo shell quanto por cada aba — nunca definidos dentro do shell e reexportados, porque isso criaria import circular (shell importa aba, aba importaria de volta do shell). Convenção fechada nos dois módulos: `<modulo>/theme.js` (ThemeCtx + paleta + kit de UI já ligado via `bindThemeContext`), `<modulo>/constants.js` (dados de domínio estáticos), `<modulo>/helpers.js` (funções puras), `<modulo>/icons.jsx` (`IC`/`Ico`).

**Sheets/modais soltos no shell** (gated só por uma string tipo `sh==="addX"`, não presos a nenhuma aba) migram junto pro arquivo da aba que "dona" aquele domínio, exportados como componentes próprios (`export function AddTrackSheet(){...}`) e importados de volta pelo shell, que continua sendo o único lugar que sabe o valor de `sh` — `{sh==="addTrack" && <AddTrackSheet/>}`. Um modal que pode abrir a partir de mais de uma aba (ex: um prompt de conquista disparado tanto pela dashboard quanto por uma aba de detalhe) mora no arquivo do domínio a que pertence tematicamente, não em todos os lugares que o abrem — a posição de onde ele é *renderizado* pelo shell é independente de onde ele é *definido*.

> ⚠️ **Nota de processo, não de código:** a primeira vez que um agente foi delegado com instrução "só pesquisar, não editar" nesta sessão, ele foi além do escopo e editou arquivos mesmo assim (ver [[11 Plano de Decomposição — Arquivos Monolíticos]] → nota de 21/08/2026 sobre o incidente de survey-vira-edição). O guardrail usado desde então pros agentes de levantamento de dependência: listar explicitamente as ferramentas permitidas (`Read`/`Grep`/`Glob` apenas), citar o incidente anterior no próprio prompt como razão concreta pra não repetir, e pedir um relatório em texto como único output — nunca delegar levantamento e edição do mesmo arquivo em paralelo.

**Checklist ao fatiar um módulo:**
- [ ] Levantamento de dependências em modo leitura primeiro — nunca editar direto assumindo o esboço "um arquivo por aba" vai funcionar
- [ ] `<modulo>Ctx` só se houver estado genuinamente cross-aba — senão é over-engineering
- [ ] Dashboard/agregador de alto fan-in fica no shell se extrair não simplificar nada
- [ ] Tema/constantes/helpers em arquivos próprios, nunca redefinidos dentro do shell
- [ ] Abas viram componentes de módulo de verdade (`<X/>`), não mais chamadas como função (`X()`)
- [ ] Estado hoisted só por causa do antigo bug de remount — reavaliar se ainda precisa ficar no shell
- [ ] `npm run build`/`eslint` limpos (ruído pré-existente tipo `react-hooks/static-components` em componentes locais tipo `Row`/`Sec` do Config é esperado, não uma regressão — só investigar erros *novos*, tipicamente `no-unused-vars`/`no-undef` do próprio threading)
- [ ] Testar no navegador **todas** as abas, sheets, navegação entre páginas, e os dois temas — antes de considerar a leva pronta
- [ ] Salvar versão em `app/versions/` (ver [[Versões]]) — mesmo quando `App.jsx` em si não mudou, o snapshot documenta o estado do app inteiro, não só do arquivo copiado

Detalhe linha a linha de cada arquivo novo, nos dois módulos, em [[11 Plano de Decomposição — Arquivos Monolíticos]] → seções "Item 5 concluído no Geburah"/"no Hod".

## Diretriz de UI — não duplicar o score no card principal (31/07/2026)

**Problema encontrado navegando o app:** o card de score principal (`YESOD — SAÚDE FINANCEIRA`, `HOD — DESENVOLVIMENTO PROFISSIONAL`, etc.) mostrava o mesmo número **duas vezes** — uma vez grande à esquerda (`fontSize:52`) e de novo numa caixinha "Leve para a Árvore" à direita (`fontSize:28`). Achado em Yesod, Hod, Tiphareth e Netzach (Geburah e Chesed não tinham essa duplicação — Chesed usa um `ScoreRing` circular único). Corrigido nos 4 removendo a caixinha da direita e mantendo só o número grande.

**Diretriz pra qualquer módulo novo ou card de score:** o score aparece **uma vez só**, no maior elemento visual do card. Se quiser indicar "isso vai pra Árvore", usar um texto pequeno de apoio (ex: legenda abaixo do número), nunca repetir o mesmo valor num segundo elemento com o mesmo peso visual.

```jsx
// ✅ CORRETO — um só número, grande, à esquerda
<div>
  <div style={{fontSize:10,...}}>NOME — CATEGORIA</div>
  <div style={{fontSize:52,fontWeight:900,color:ACCENT}}>{score}%</div>
</div>

// ❌ ERRADO — duplica o mesmo valor numa caixinha à direita
<div style={{display:"flex",justifyContent:"space-between"}}>
  <div>...{score}%...</div>
  <div style={{textAlign:"right"}}>
    <div>Leve para a Árvore</div>
    <div style={{border:"2px solid "+ACCENT,...}}>{score}<div>% → Modulo</div></div>
  </div>
</div>
```

## Diretriz de UI — LIGHT tintado por sefira, DARK sempre neutro (09/08/2026)

**Achado no Hod:** o `LIGHT` do módulo usava a paleta azul/índigo neutra do hub (`bg:"#eef1f9"`, `b1:"#c4cfe6"`, `b2:"#98aacf"`, `muted:"#556080"`) em vez de tingir na própria cor (`ACCENT:"#f97316"`, laranja) — visualmente parecia "tela da Árvore da Vida" em vez de "tela do Hod". Yesod (verde), Geburah (vermelho) e Chesed (rosa) já seguiam o padrão certo; Hod ficou pra trás. Corrigido tingindo o `LIGHT` na cor do módulo.

**Regra, pros 8 módulos construídos:**
- **`LIGHT` é tingido na cor do `ACCENT` do módulo** — `bg`/`card` bem claros com a matiz do accent, `b1`/`b2` bordas na mesma matiz (claro→médio), `muted`/`dim`/`text` derivados da mesma matiz mas escurecidos o bastante pra contraste em fundo claro.
- **`DARK` permanece neutro e idêntico entre módulos** (`bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12"`) — só o `ACCENT` (usado nos destaques/botões/números) muda por módulo; o chrome escuro em si não é tingido. Isso é intencional, não um bug: mantém o dark mode consistente/neutro em todo o app, com a identidade da sefira aparecendo só nos elementos de destaque.
- **Nunca alterar o `DARK`** ao aplicar essa correção — só o `LIGHT`.

```js
// Exemplo — Hod (laranja, ACCENT:"#f97316")
const LIGHT = { bg:"#fff7ed", surface:"#ffffff", card:"#fffaf3", b1:"#fed7aa", b2:"#fb923c", text:"#241004", muted:"#8a5a2e", dim:"#452405", nav:"#fff7ed" };
```

Cores de referência já corretas nos outros módulos: Yesod verde (`#f2faf6`/`#cceee0`/`#7dd3ae`/`#4a8570`/`#0f3d29`), Geburah vermelho (`#fff5f5`/`#fdd`/`#f9a8a8`/`#8a5a5a`/`#4a1a1a`), Chesed rosa (`#fff0f8`/`#f0c8e0`/`#e090c0`/`#804060`/`#400820`).

**Checklist ao mexer no tema de um módulo:**
- [ ] `LIGHT` tingido na matiz do `ACCENT` do módulo (bg/card claríssimos, b1/b2 bordas na matiz, muted/dim/text com contraste ok em fundo claro)
- [ ] `DARK` continua com a paleta neutra padrão, idêntica aos outros 5 módulos — não tingir
- [ ] Testar toggle de modo escuro **dentro do módulo** e confirmar que persiste ao voltar ao hub (`dark`/`setDark` vêm por prop de `App.jsx`, fonte única — ver regra "dark mode via prop" no checklist de integração acima e em [[04 Bugs Conhecidos]])

Problemas frequentes ao integrar: ver [[04 Bugs Conhecidos]].

## ⚠️ Divergências confirmadas entre regra/documentação e implementação (28/07/2026, revisado 31/07/2026)

- ~~A regra "`window.storage` proibido → usar `localStorage`" está corretamente aplicada em todos os módulos, mas não no próprio hub `App.jsx`~~ — **corrigido em 15/08/2026**: `loadState`/`saveState` trocados por `localStorage` direto. Ver [[04 Bugs Conhecidos]].
- ~~A nav bar do hub (`TABS` em `App.jsx`) continua com 7 abas~~ — **corrigido em 31/07/2026**: reduzida pra 4 (Árvore/Hábitos/Metas/Config), com RPG+Dash virando um carrossel dentro da Árvore e o Coach virando campo permanente. Ver seção "Navegação (nav bar)" acima e [[04 Bugs Conhecidos]].
- ~~O Coach de IA do hub faz `fetch` direto pra API da Anthropic sem headers de autenticação~~ — **corrigido em 31/07 e 01/08/2026**: proxy serverless (`/api/coach`) guarda a key e monta os headers; nenhum módulo faz `fetch` direto à Anthropic mais. Ver seção "Coach de IA" acima e [[04 Bugs Conhecidos]].
- Lembretes de hábito só pedem permissão de notificação; não há disparo real agendado.

Detalhe completo de cada um em [[04 Bugs Conhecidos]]. Método da auditoria em [[09 Auditoria de Código vs Documentação]].

## Ver também
- [[03 Módulos (Sefirot)]]
- [[04 Bugs Conhecidos]]
- [[05 Roadmap]]
- [[Como Rodar]]
