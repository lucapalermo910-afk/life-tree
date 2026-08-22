---
tags: [lifetree, modulo, hod]
aliases: [Hod]
---

# 💼 Hod — Profissional

> Status: ✅ Integrado na Árvore (confirmado no código — docs anteriores diziam "pendente") · Arquivo: `preview/src/HodModule.jsx` — **fatiado em 22/08/2026** (shell com 309 linhas, era 1859 em 13/08/2026 antes do split; hoje o shell só tem roteamento/state, o resto vive em 12 arquivos sob `preview/src/hod/`, ver [[11 Plano de Decomposição — Arquivos Monolíticos]] → "Item 5 concluído no Hod")
> Score bridge: publica `hod` em `lifetree_scores`
> Ações de Coach em `preview/src/shared/hodActions.js` (25 ações, `actions:true` desde 13/08/2026)
> Projeto standalone também existe em `modules/hod-profissional/` com dev server próprio (`dev-url.txt` → `?module=hod`).

## Funcionalidades

Organizado em 3 sub-áreas (reduzido de 4 em 09/08/2026 — Renda Ativa e Negócio se fundiram em Projetos, ver "Análise de Gaps" abaixo), cada uma com sua própria pontuação:

### Carreira — Trilhas de Competência
`skills` (lista plana) foi substituída por `tracks` — trilhas de competência, cada uma com sua lista própria de skills e um `focus` (`atual` | `explorando` | `arquivada`, cicla por clique — permite manter trilhas de uma carreira anterior sem que elas contem no score, ou já começar a rastrear competências de uma direção nova antes de fazer a virada). Genérico pra qualquer profissão; o seed vem com 12 trilhas aprofundadas de PO/PM (Discovery, UX/UI, Estratégia & Visão, Priorização & Roadmap, Backlog/Histórias/Refino, Ágil, Liderança, Dados & Experimentação, Comunicação/Stakeholders, Fluência Técnica, Modelo de Negócio & Pricing, Product Marketing/GTM).
```js
const trackScore = t => t.skills.length ? Math.round(t.skills.reduce((s,sk)=>s+(sk.level/sk.target),0)/t.skills.length*100) : 0;
const carScore = () => {
  const habS = carHabits.length ? carHabits.filter(h=>h.done).length/carHabits.length : 0.5;
  const goaS = carGoals.length  ? carGoals.filter(g=>g.done).length/carGoals.length   : 0;
  const activeTracks = tracks.filter(t=>t.focus!=="arquivada");        // trilhas arquivadas não contam pro score
  const withSkills = activeTracks.filter(t=>t.skills.length);
  const skS = withSkills.length ? withSkills.reduce((s,t)=>s+trackScore(t)/100,0)/withSkills.length : 0.5;
  return Math.round((habS*0.3 + goaS*0.4 + skS*0.3)*100);
};
```
Metas de carreira, hábitos de carreira e conquistas profissionais seguem como antes (sem mudança de modelo).

### Projetos — motor unificado (substitui Renda Ativa + Negócio)
`sources` e `businesses` deixaram de ser entidades separadas — ambas viraram `projects`, com um `type` (`negocio`/`produto`/`conteudo`/`servico`/`outro`) que seleciona um conjunto de fases (`PHASES_BY_TYPE`) e de campos de canvas (`CANVAS_FIELDS_BY_TYPE`). `price`/`goal`/`revenueHistory` (monetização) e `clients[]` (CRM — nome, contato, objetivo, situação atual, `plan[]` de tópicos/marcos, `sessions[]` de histórico de interações, `lastFeedback`) ficam disponíveis em **qualquer** tipo, não travados por fase — um projeto pode ganhar seu primeiro cliente ainda em validação. Snapshot mensal de receita gravado automaticamente uma vez por mês, por projeto:
```js
useEffect(() => {
  if(!storageReady || !projects.length) return;
  const monthKey = new Date().toISOString().slice(0,7);
  const updated = projects.map(p => {
    const hist = p.revenueHistory || [];
    if(hist.some(h=>h.month===monthKey)) return p;
    const rev = (p.clients||[]).filter(c=>c.active).length * (p.price||0);
    return {...p, revenueHistory:[...hist,{month:monthKey,rev}].slice(-6)};
  });
  setProjects(updated);
}, [storageReady]);
```
```js
const projetosScore = () => {
  // por projeto: fase atual + experimentos concluídos + aprendizados + hábitos, mais receita/meta quando goal>0 —
  // ver fórmula completa em HodModule.jsx (pesos mudam conforme o projeto monetiza ou não)
};
```
Critérios de avanço de fase (checklist textual) só existem hoje pro `type:"negocio"` — os demais tipos ainda não têm critério equivalente (ver "Decisões em aberto").

### Marca Pessoal
Canais de conteúdo (com histórico mensal de seguidores, gravado automaticamente igual à receita), plano de conteúdo por status (ideia/publicado), hábitos de marca. Sem mudanças nesta leva.
```js
const marcaScore = () => {
  const habS = brand.habits.filter(h=>h.done).length/(brand.habits.length||1);
  const chanS = brand.channels.filter(c=>c.active).length/(brand.channels.length||1);
  const contS = brand.contentPlan.filter(c=>c.status==="publicado").length/(brand.contentPlan.length||1);
  return Math.round((habS*0.4+chanS*0.2+contS*0.4)*100);
};
```

### Score consolidado do módulo
```js
const hodScore = () => Math.round(carScore()*0.35 + projetosScore()*0.45 + marcaScore()*0.20);
```
Os pesos de Renda Ativa (20%) e Negócio (25%) da versão anterior se somaram em Projetos (45%) — o total não mudou, só a origem dos dados (ver "Análise de Gaps").

### Conquistas a partir de metas concluídas
```js
const [pendingAch, setPendingAch] = useState(null); // meta que acabou de ser concluída → vira sugestão de conquista
```

## Persistência
Prefixo `lifetree_hod_` — chaves atuais: `tracks`, `carGoals`, `carHabits`, `achievements`, `projects`, `brand`, `xp`. Correto (localStorage). **Migração automática, no mount:** se `tracks`/`projects` não existirem mas as chaves antigas (`skills`, `sources`, `businesses`) existirem, o módulo migra os dados na hora (skills antigas agrupadas por `cat` viram trilhas; sources viram `projects` tipo `servico` fase `operacao`; businesses viram `projects` tipo `negocio`) — sem perda de dado pra quem já tinha usado a versão anterior. Só cai no seed novo (12 trilhas PO/PM + Professor Particular/Despachante Digital Europa como projetos) se não houver nenhum dado, nem novo nem antigo.

## Padrão de tema — correção de registro (12/08/2026): esta seção estava errada
> ⚠️ A versão anterior desta seção afirmava que o anti-padrão de tema mutável "já não existe" no Hod. **Isso nunca foi verdade** — confirmado lendo o código diretamente em 12/08/2026: `HodModule.jsx` linha 9 tem `let C = {...LIGHT};` no escopo do módulo, reatribuído dentro do componente (`C = dark ? DARK : LIGHT;`, linha 335) em vez de `const C` local. `dark`/`setDark` **são** recebidos corretamente por prop de `App.jsx` (isso nunca foi o problema) — o que está errado é só a variável `C`. Confirmado também por lint: a regra `react-hooks/globals` (mais nova que a antiga `react-hooks/static-components`) marca a linha 335 como **erro**, não só aviso: "Cannot reassign variables declared outside of the component/hook". Ainda ativo — ver [[04 Bugs Conhecidos]] → "Tema global mutável (C)" (fonte correta; esta nota serve só pra registrar e corrigir o engano). Em 09/08/2026 o `LIGHT` também passou a ser tingido em laranja (cor do `ACCENT` do módulo) em vez da paleta azul/índigo neutra que copiava o hub — isso sim está correto — ver [[02 Arquitetura]] → "Diretriz de UI — LIGHT tintado por sefira, DARK sempre neutro". Correção mecânica (padrão `ThemeCtx`, já provado no Geburah) e sequenciamento em [[11 Plano de Decomposição — Arquivos Monolíticos]].

## Coach IA — estado atual (atualizado em 13/08/2026)
Skill `hod` em `coachSkills.js`, **`actions:true` desde 13/08/2026** — antes era só análise, hoje executa 25 ações via `hodActions.js` (mesmo padrão de `yesodActions.js`/`geburahActions.js`): trilhas/skills (criar/editar/apagar, com `edit_skill` marcando `lastPracticed` automaticamente quando o nível muda), projetos (criar/editar, mudar fase, próximo passo, plano/roteiro — `add_plan_item` aceita um array `topics` pra rascunhar um roteiro inteiro numa ação só, experimentos, aprendizados), clientes/alunos (criar, plano individual, sessão, feedback), metas/hábitos de carreira, conquistas (com trilha vinculada opcional), hábitos/ideias de marca pessoal. Como o estado do Hod vive só em `HodModule.jsx` (não em `App.jsx`), usa o mesmo mecanismo de sincronização do Yesod/Geburah: `useCoachDataSync("hod", reloadFromStorage)` relê o localStorage quando uma ação do Coach escreve nele. Verificado no navegador: escrever direto em `lifetree_hod_carHabits` e disparar o evento de sync atualizou a tela sem reload.

`buildHodContext()` resume `trilhas_competencia` (nome/foco/score/skills, cada skill agora com `dias_desde_ultima_pratica`), metas e hábitos de carreira, `conquistas_recentes` (com trilha vinculada quando existe), `projetos` (nome/tipo/fase/canvas/próximo passo/experimentos abertos/aprendizados recentes/receita quando `goal>0`/`clientes_precisando_atencao` — clientes ativos sem sessão registrada há mais de 14 dias) e marca pessoal. `systemPrompt` mantém a persona de mentor exigente (avaliação com "honestidade brutal", confronta fase declarada com evidência, adapta especialidade ao que o usuário configurou, nunca assume PO/PM fixo) e ganhou a lista completa das 25 ações + regra explícita de quando usar `topics`/`ideas` em array (pedidos tipo "monta o currículo/roadmap/calendário editorial pra mim"). Keywords já cobriam vocabulário de produto/projeto desde 09/08/2026.

## Análise de Gaps — Evolução do Módulo (09/08/2026)

> **Status: implementado em 09/08/2026** (Proposta A — trilhas de competência, dentro de Carreira; Proposta B — motor de projetos unificado, substituindo Renda Ativa + Negócio por uma aba única "Projetos"; evolução do Coach). Esta seção documenta o raciocínio e o desenho que levaram à implementação — útil pra entender *por que* o modelo de dados é esse, não só o que ele faz (isso já está documentado em "Funcionalidades" acima). Segue o mesmo espírito da auditoria funcional feita pro Yesod (ver [[09 Yesod]] → "Limitações conhecidas").

### Objetivo redefinido do módulo
Hod deixa de ser só "carreira + 3 sub-áreas fixas" e passa a ser o módulo que ajuda o usuário a **evoluir profissionalmente em qualquer direção que ele escolher**: crescer na carreira atual, pivotar de carreira, ou tirar do papel qualquer atividade remunerada/projeto profissional novo. Isso precisa valer pra **qualquer usuário, em qualquer profissão** — o módulo não pode ficar hardcoded pra "Product Owner" só porque é o caso do usuário atual. A regra de design que resolve essa tensão, usada nas propostas abaixo: **estrutura de dados e telas são genéricas e configuráveis; o conteúdo rico (frameworks, templates, taxonomias) é seed/exemplo que o usuário pode adotar, editar ou ignorar.**

Caso de uso de referência do usuário atual (não é o único suportado, mas é o que valida se o desenho é bom o bastante): PO/PM numa empresa de software financeiro querendo evoluir toda a cadeia de produto (discovery, UX/UI, priorização/backlog, escrita de história/refino técnico, metodologias ágeis, liderança de time, capacidade própria de dev) **+** controlar/evoluir uma atividade de professor particular **+** tocar múltiplos projetos paralelos com naturezas diferentes (Life Tree é um produto sendo construído, um canal de YouTube é um projeto de conteúdo ainda não lançado, e há outros projetos de dev).

### Gaps identificados (mapeados às propostas abaixo)
1. **"Habilidades" é uma lista plana sem estrutura de domínio** — não dá pra ver de relance "estou fraco em Discovery mas forte em Priorização"; não escala pra uma profissão com dezenas de competências relevantes. → Proposta A.
2. **"Renda Ativa" e "Negócio" são dois modelos de dados separados pra um único ciclo de vida** — qualquer atividade nova (dar aulas particulares, abrir uma consultoria, lançar um produto) passa pelas mesmas etapas: ideia → validar → estruturar a oferta → primeiros clientes/uso → operar → escalar. Hoje "Negócio" tem fase/validação mas não tem clientes nem receita; "Renda Ativa" tem clientes/receita mas não tem fase nem validação — cada um só modela metade do ciclo. Consequência prática: "quero começar a dar aulas particulares" não cabe direito em nenhuma das duas (é validação de uma ideia de serviço *e* vai precisar de CRM assim que tiver o primeiro aluno), e `businesses` não tem `habits[]` como `sources` tem, então não dá pra transformar "trabalhar no projeto X" num hábito rastreado. → Proposta B.
3. **Coach do Hod é só analítico e genérico** (`actions:false`, prompt curto, sem taxonomia de competência nem avaliação crítica, sem capacidade de ajudar a redigir plano/material) — não tem instrução pra ser um mentor de alto nível nem pra ser honesto sobre lacunas/viabilidade; contexto não inclui nada das propostas A/B. → seção "Evolução do Coach".

### Proposta A — Framework de Competências (genérico + trilha PO/PM aprofundada)

**Modelo de dados novo:** `skills` (lista plana) vira `tracks` (trilhas de competência), cada uma com suas próprias skills:
```js
tracks: [{
  id, name, color, icon,
  skills: [{ id, name, level, target, notes, lastPracticed }]
}]
```
Score de uma trilha = média `level/target` das skills dela (mesma fórmula que já existe, só que por grupo em vez de globalmente). Score de Carreira passa a ser a média das trilhas, ponderável se o usuário quiser dar mais peso a alguma.

**Por que trilha em vez de categoria (`SKILL_CATS` atual):** categoria hoje é só uma tag decorativa (Técnica/Comportamental/Liderança/...) sem peso nem agregação própria. Trilha vira uma unidade real de progresso — dá pra ver um radar/lista "Discovery: 60% · UX/UI: 30% · Liderança: 80%" de relance, que é exatamente o tipo de visão que orienta "onde investir a próxima hora de estudo".

**Genérico pra qualquer profissão:** o usuário cria/edita/apaga trilhas livremente (uma trilha é só um nome + cor + lista de skills) — nada no modelo de dados menciona produto ou tecnologia. O que muda por profissão é só o **conteúdo seed**.

**Trilha seed pro caso de uso do usuário — competências de PO/PM, análise aprofundada (não se limita ao que foi pedido na conversa):**

| Trilha | O que cobre |
|---|---|
| **Discovery & Pesquisa de Usuário** | Entrevistas, jobs-to-be-done, pesquisa qualitativa/quantitativa, síntese de insights, personas, validação de problema antes de solução |
| **UX/UI & Design de Produto** | Heurísticas de usabilidade, fluxos e wireframes, colaboração com design, pensar em design system, acessibilidade básica |
| **Estratégia & Visão de Produto** | Visão de produto, product-market fit, análise competitiva, posicionamento, North Star Metric, OKRs, outcomes vs. outputs |
| **Priorização & Roadmap** | RICE/ICE/Kano/valor×esforço, trade-offs técnicos, sequenciamento, gestão de dívida técnica no roadmap |
| **Backlog, Histórias & Refino Técnico** | INVEST, critérios de aceite, refino com o time, Definition of Ready/Done, épico→história→tarefa, story splitting |
| **Metodologias Ágeis & Cerimônias** | Scrum/Kanban/dual-track discovery, facilitação de cerimônias, métricas ágeis (velocity, cycle time, throughput) |
| **Liderança de Time & Influência sem Autoridade** | Motivar devs, feedback, resolução de conflito, segurança psicológica, servant leadership |
| **Dados, Métricas & Experimentação** | Métricas de ativação/retenção/engajamento, SQL básico, A/B testing, análise de funil, instrumentação de eventos |
| **Comunicação com Stakeholders & Storytelling** | Apresentar decisões orientadas a dados, gestão de expectativas, comunicação executiva, negociação de escopo |
| **Fluência Técnica / Capacidade de Dev Própria** | Entender arquitetura o bastante pra dialogar com engenharia, ler/escrever código básico, entender APIs e dados, avaliar viabilidade técnica |
| **Modelo de Negócio & Pricing** | Unit economics, pricing, forecasting de receita ligado a produto, business case de feature |
| **Product Marketing & Go-to-Market** | Lançamento de features, posicionamento, habilitação de vendas/suporte, comunicação de mudanças |

12 trilhas — vai além da lista original do usuário (que cobria discovery, UX/UI, priorização/backlog, escrita de história/refino técnico, ágil, liderança de time, dev) somando estratégia/visão, dados/experimentação, comunicação/stakeholders, modelo de negócio/pricing e product marketing, que são lacunas comuns de PO/PM em nível sênior.

**Migração:** as 5 skills seed atuais (`D_SKILLS`) mapeiam bem pra dentro dessas trilhas (ex: "Discovery e Pesquisa" → trilha Discovery, "Roadmap e Priorização" → trilha Priorização) — dá pra migrar sem perder dado.

### Proposta B — Motor de Projetos Unificado (substitui Renda Ativa + Negócio)

**Origem desta proposta:** o usuário apontou, revisando a v1 deste documento, que a antiga "Proposta B" (CRM de alunos/clientes) na verdade é derivada da antiga "Proposta C" (motor de projetos), não uma coisa paralela — exemplo dele: *"quero iniciar um projeto de dar aulas particulares" e aí o módulo me ajuda a organizar o CRM, mas além disso, precisa me ajudar a estruturar aulas, criar materiais de apoio e assim por diante.* Dar aulas particulares **é** um projeto (tem que validar se há demanda/nicho, definir preço e formato, conseguir os primeiros alunos) que, ao amadurecer, **também** precisa de CRM (acompanhar cada aluno) — não são duas necessidades diferentes, é o mesmo projeto em fases diferentes do seu ciclo de vida. Daqui em diante as duas propostas viram uma só.

**O objetivo, na formulação do próprio usuário:** dado um projeto X, o módulo (com o Coach) deve ajudar a **validar a viabilidade da ideia**, **estruturar um plano de execução faseado**, **quebrar isso em atividades pra incluir na rotina** — e, quando o projeto envolve atendimento recorrente, **acompanhar cada cliente/aluno** (o antigo escopo da Proposta B) e **ajudar a criar o conteúdo/material** que a oferta precisa (currículo de aula, material de apoio, esqueleto de plano de negócio, roadmap técnico — ver "Evolução do Coach" abaixo).

**Modelo de dados:** `sources` e `businesses` deixam de ser duas entidades e viram uma só, `projects` (nome de trabalho — pode ficar "negócios"/"projetos" na UI final):
```js
{
  id, name, color, type, phase,     // type e phase definem o vocabulário — ver tabelas abaixo
  canvas: {},                       // campos livres, rótulos dependem de CANVAS_FIELDS_BY_TYPE[type]
  plan: [{ id, topic, status }],    // roteiro/roadmap do projeto em si (não confundir com o plan por cliente abaixo) — Coach ajuda a redigir, ver "Evolução do Coach"
  experiments: [], learnings: [],   // validação (já existe hoje em businesses)
  price, goal, revenueHistory: [],  // monetização — opcional em qualquer type, não só serviço (já existe hoje em sources)
  clients: [{                       // contatos recorrentes — opcional em qualquer type (já existe hoje em sources.students, enriquecido)
    id, name, contact, freq, since, active,
    goal, progressNote,                          // objetivo e situação atual do contato
    plan: [{ id, topic, status }],                // plano de trabalho DESSE cliente — currículo pro aluno, marcos pro cliente de consultoria
    sessions: [{ id, date, notes, nextStep }],     // histórico de interações/sessões
    lastFeedback: { date, text },
  }],
  nextStep, habits: [],             // execução/rotina (já existe hoje nos dois lados, unificado)
}
```
`clients[]`, `price`/`goal`/`revenueHistory` e `plan[]` ficam disponíveis em **qualquer** `type` (não travados por fase) — um projeto `negocio` pode ganhar seu primeiro cliente ainda em Validação, um `produto` pode começar a monetizar antes de "lançar" oficialmente. Progressive disclosure na UI: essas seções só aparecem em destaque quando o projeto já tem algo preenchido nelas.

**`CANVAS_FIELDS_BY_TYPE` e `PHASES_BY_TYPE`:**

| `type` | Fases | Campos do canvas |
|---|---|---|
| `negocio` (atual) | Exploração → Validação → Estruturação → Escala | Público-alvo, Proposta de valor, Modelo de receita, País/Mercado |
| `produto` (novo) | Concepção → MVP → Beta/Feedback → Lançamento → Iteração | Problema a resolver, Usuário-alvo, Métrica de sucesso, Stack/dependências |
| `conteudo` (novo) | Ideação → Piloto → Consistência → Crescimento | Tema/nicho, Formato, Frequência planejada, Diferencial |
| `servico` (novo — cobre o caso "aulas particulares") | Concepção → Oferta estruturada → Piloto (primeiros clientes) → Operação → Escala | Público-alvo, O que a oferta inclui, Formato de entrega, Diferencial |
| `outro` | Planejamento → Execução → Revisão | Descrição livre |

Isso resolve os três casos concretos do usuário: Life Tree entra como `produto` (construir e entregar, não validar mercado); um canal de YouTube entra como `conteudo` até formar — quando amadurece, passa a ser operado dentro de Marca Pessoal (que já existe pra isso: seguidores, plano de conteúdo publicado) enquanto o registro em Projetos preserva o histórico de como foi concebido; e "dar aulas particulares" entra como `servico`, com o CRM (`clients[]`) ganhando uso real assim que a fase chega em Piloto/Operação.

**Migração dos dados atuais:** `sources` existentes (ex: "Professor Particular") viram `projects` com `type:"servico"`, `phase:"operacao"` (já têm receita/alunos ativos), `canvas.oferta` preenchido a partir do `desc` atual, `students`→`clients` (campos novos ficam vazios até o usuário preencher). `businesses` existentes viram `projects` com `type:"negocio"` (único tipo que existia), ganhando `habits:[]`, `clients:[]`, `price`/`goal`/`revenueHistory:[]` vazios.

**Critérios de avanço de fase:** já existem pro `type:"negocio"` (`criteria` em `BusinessPage`, hoje só checklist visual manual). Propor um `criteria` equivalente por fase de cada `type`, exposto no contexto do Coach — pra ele avaliar (não só o usuário sozinho) se as evidências batem com a fase declarada.

**UI — decisão tomada com o usuário em 09/08/2026:** as abas "Renda Ativa" e "Negócio" somem; viram **uma aba única "Projetos"**, com filtros (por `type`, por fase, e um atalho "gerando receita hoje" = `price>0` ou `clients` ativos — equivalente ao que a antiga aba Renda Ativa mostrava). Cada card na lista mostra estatísticas condicionais (receita/clientes se o projeto tiver; barra de fase sempre).

**Score do módulo:** hoje `hodScore = carScore*0.35 + ativaScore*0.20 + negocioScore*0.25 + marcaScore*0.20`. Com a fusão, os dois pesos (0.20 + 0.25 = 0.45) passam a vir do mesmo array `projects`, calculados como sub-scores sobre o conjunto unificado (ex: uma parte do peso vem de fase/experimentos/aprendizados de todos os projetos, outra parte vem de receita-atual/meta dos projetos que têm `goal>0`) — a fórmula exata fica pra quando for implementar, o que importa registrar aqui é que **o total de peso do bloco "projetos" no score do módulo não muda (45%)**, só a origem dos dados.

### Evolução do Coach (vale pras 2 propostas)

**Persona:** o `systemPrompt` do skill `hod` precisa deixar de ser um resumo passivo e virar um mentor exigente — nas palavras do usuário, "capaz de avaliar de forma brutalmente honesta a parte prática e teórica do projeto", equivalente a um empresário de sucesso + professor de alto nível em planejamento e execução de negócios, e (pro lado de carreira) um mentor sênior de Produto com domínio real de discovery/UX/dados/liderança/estratégia. Rascunho de diretriz pro prompt:

> "Sua função não é validar tudo que o usuário propõe — é avaliar com honestidade brutal tanto a teoria quanto a prática de cada competência e cada projeto, apontar lacunas reais, riscos ignorados e o que falta pra evoluir de verdade. Elogio vazio não ajuda o usuário a crescer. Ao avaliar um projeto, confronte a fase declarada com as evidências reais (experimentos concluídos, aprendizados registrados, critérios batidos) antes de concordar que ele avançou de fase."

**Generalização:** essa postura de mentor não pode ficar hardcoded em "Produto" — o prompt deve se adaptar às trilhas de competência e tipos de projeto que o usuário efetivamente configurou (Proposta A/B), não assumir PO/PM pra todo mundo. Ou seja: o conteúdo específico de produto (a trilha PO/PM da Proposta A) é que carrega o conhecimento de domínio; o *comportamento* do Coach (crítico, exigente, baseado em evidência) é genérico e vale pra qualquer trilha/projeto que o usuário tiver.

**Coach ajuda a criar o plano, não só rastrear (pedido explícito do usuário):** hoje qualquer versão de "plano" no módulo é um checklist que o próprio usuário preenche manualmente. O usuário pediu explicitamente que o Coach ajude a **estruturar aulas e criar materiais de apoio** — generalizando pra qualquer projeto: o Coach deve poder **rascunhar itens de `plan[]`** quando pedido (currículo/plano de aula pro `type:"servico"`, esqueleto de plano de negócio pro `negocio`, roadmap técnico pro `produto`, calendário editorial pro `conteudo`), sempre como proposta editável — nunca escrito direto, mesma regra de "confirmação obrigatória" já usada em toda ação do Coach no Life Tree (ver [[02 Arquitetura]] → "Confirmação obrigatória, sempre"). Isso é o mesmo `plan[]` tanto no nível do projeto quanto no nível de cada `client` — o Coach pode ajudar a redigir os dois (o roteiro geral do curso, ou o plano individual de um aluno específico).

**Contexto (`buildHodContext`) precisa crescer pra alimentar essa postura:**
- Trilhas de competência com score por trilha (não só lista de skills soltas) — pra apontar a trilha mais fraca, não só a skill mais fraca
- Por projeto: `type`, fase, critérios batidos vs. pendentes, experimentos/aprendizados — pra confrontar fase declarada com evidência
- Por projeto com `clients[]`: quais clientes não têm sessão registrada há mais de N dias (sinal de "precisa de atenção"), progresso declarado vs. plano

**Ações (`actions:true`):** fora de escopo desta leva — hoje o Hod é só análise (`actions:false`). Uma vez que o modelo de dados acima estiver estável, o próximo passo natural é dar ações ao Hod seguindo a receita já documentada em [[02 Arquitetura]] → "Coach de IA — ações por módulo" (`hodActions.js` + `useCoachDataSync`), do mesmo jeito que foi feito pro Yesod.

**Keywords:** a lista atual (`carreira, trabalho, emprego, skill, habilidade, aluno, cliente, negócio, empreend, marca pessoal, conteúdo, renda extra`) não cobre vocabulário de produto (`roadmap, backlog, discovery, sprint, história de usuário, refino, priorização`) nem de mentoria de projeto (`viabilidade, MVP, lançamento`) — precisa crescer junto com o prompt.

### Implementado em 09/08/2026 — o que ficou de fora desta leva
Ambas as propostas (A e B) e a evolução do Coach foram implementadas na mesma sessão. Testado no navegador: migração de dados antigos (skills→tracks agrupadas por categoria, sources/businesses→projects), fluxo completo de um projeto `servico` (Professor Particular) incluindo abrir um cliente, registrar sessão e voltar pra página do projeto (não pra lista).

Ficou pra depois, deliberadamente fora de escopo desta leva:
- **Critérios de avanço de fase só existem pro `type:"negocio"`** — os outros 4 tipos (`produto`/`conteudo`/`servico`/`outro`) ainda avançam de fase sem nenhum checklist de evidência, mesmo o Coach já estando instruído a confrontar fase vs. evidência no texto. Se isso importar na prática, criar um `criteria` por fase de cada tipo, no mesmo formato do que já existe pro negócio.
- **Ações do Coach pro Hod (`actions:true`)** — continua só leitura/análise. Migrar pra ações (criar trilha, criar projeto, registrar sessão de cliente etc. via chat) segue a receita documentada em [[02 Arquitetura]] → "Coach de IA — ações por módulo", o mesmo padrão do Yesod.
- **Cor de trilha não é editável pelo usuário** — é atribuída automaticamente de uma paleta fixa (`TRACK_PALETTE`) na criação. Simplificação deliberada pra não precisar de um color-picker.

Este documento continua sendo a referência de design pra essas duas frentes — não precisa reabrir a discussão de escopo, só implementar quando fizer sentido.

## Auditoria pós-implementação — gaps remanescentes (09/08/2026)

> Feita depois de implementar as Propostas A e B acima, medindo o estado atual do módulo contra a visão completa discutida (não contra o que existia antes). Também publicada como [artefato HTML](https://claude.ai/code/artifact/51969895-6647-4f7d-a53a-eb8678a1aaba) pro usuário revisar visualmente. Nenhuma mudança de código a partir daqui — é material de decisão de prioridade.

**A visão completa, usada como régua:**
1. Evoluir competências de PO/PM na cadeia inteira de produto: discovery, UX/UI, priorização e gestão de backlog, escrita de história e refino técnico, metodologias ágeis, condução de time de desenvolvedores, e a própria capacidade de desenvolvimento.
2. Controlar e evoluir a atividade de professor particular como fonte de renda ativa de verdade — não só contar alunos.
3. Tocar múltiplos projetos paralelos de natureza diferente (Life Tree, ideia de canal de YouTube, outros projetos de dev), com o módulo e o Coach ajudando a validar viabilidade, estruturar um plano faseado e quebrar isso em atividades de rotina.
4. Um Coach que funcione como um empresário de sucesso e um professor de alto nível — capaz de avaliar com honestidade brutal a parte prática e teórica de cada projeto/competência, e de **ajudar a criar** plano de aula e material de apoio, não só conversar sobre eles.
5. Tudo isso generalizável — o módulo precisa servir qualquer usuário, em qualquer profissão, não só o caso de PO/PM.

**8 gaps identificados, do maior pro menor impacto nessa visão — todos fechados em 13/08/2026, ver seção seguinte:**

| # | Gap | Impacto | Esforço | Status |
|---|---|---|---|---|
| 1 | Coach não executa nada no Hod (`actions:false`) — fala sobre um plano de aula/material no chat, mas cada item precisa ser digitado à mão depois. | Alto | Grande | ✅ 13/08/2026 |
| 2 | Critério de avanço de fase só existe pro tipo `negocio`. | Médio | Médio | ✅ 13/08/2026 |
| 3 | Aviso de "cliente precisa de atenção" só existe no contexto do Coach, não na tela. | Médio | Pequeno | ✅ 13/08/2026 |
| 4 | Sem ponto de partida rico pra quem não é PO/PM. | Médio | Médio | ✅ 13/08/2026 |
| 5 | Projeto de conteúdo não "gradua" pra um canal de Marca. | Baixo | Pequeno | ✅ 13/08/2026 |
| 6 | Receita de projeto (meta) não conversa com o Yesod (financeiro real). | Baixo | Grande | ✅ 13/08/2026 (versão pragmática, ver abaixo) |
| 7 | Conquistas não linkam com trilhas. | Baixo | Pequeno | ✅ 13/08/2026 |
| 8 | Sem cor de trilha customizável nem "última prática" de skill. | Baixo | Pequeno | ✅ 13/08/2026 |

## Gaps fechados — 13/08/2026
Usuário pediu a lista compilada de gaps/bugs do Hod, depois pediu pra resolver todos (sem exclusões, diferente da leva do Geburah que tinha 2 itens deliberadamente fora de escopo). Nesta leva, além dos 8 gaps acima, também corrigidos: o bug de tema mutável (`let C`, ver [[04 Bugs Conhecidos]] e seção "Padrão de tema" acima) e um bug de arquitetura **achado no processo, não estava na lista original** — "componentes de aba recriados a cada render" também afetava o Hod, apesar de uma checagem anterior (12/08/2026) ter concluído o contrário (ver [[04 Bugs Conhecidos]] para a correção de registro completa).

**Gap 1 — Coach `actions:true`:** `hodActions.js` (novo, 25 ações) + `coachSkills.js` atualizado. Detalhe completo na seção "Coach IA" acima.

**Gap 2 — critérios de fase generalizados:** `CRITERIA_BY_TYPE` (novo, module-scope) substitui o antigo `criteria` inline que só existia dentro do `if(p.type==="negocio")`. Cada um dos 5 tipos ganhou critérios específicos por transição de fase (2 auto-checados a partir do dado real + 1 subjetivo, mesmo formato que o negócio já tinha) — `criteriaAutoChecks(p, phaseIdx)` centraliza a lógica de auto-check por tipo. Verificado no navegador: projeto `servico` "Professor Particular" (fase Operação) mostra critérios reais pra avançar a Escala, algo que antes só existia pra `negocio`.

**Gap 3 — sinal de cliente sem sessão na tela:** cada card de cliente/aluno em `ProjectPage` agora calcula `daysSinceSession` a partir do histórico de sessões e mostra "⚠ sem sessão há Xd" (ou "sem sessão registrada") quando ativo e sem sessão há mais de 14 dias — mesmo critério que já existia só em `buildHodContext`. Verificado no navegador com os 2 alunos do seed (Pedro, Ana — nenhum tinha sessão registrada).

**Gap 4 — seed genérico:** `D_TRACKS_GENERIC` (6 trilhas universais: Comunicação, Gestão do Tempo, Trabalho em Equipe, Ferramentas & Ofício, Networking, Aprendizado Contínuo) + card "Perfil de Trilhas" em Config com dois botões ("Produto/PM" / "Genérico") que substituem o conjunto de trilhas inteiro, com confirmação (`window.confirm`, destrutivo). Não muda o seed padrão (continua PO/PM, é o caso de uso real) — dá um caminho explícito pra quem não é PO/PM recomeçar. Verificado no navegador.

**Gap 5 — ponte Conteúdo → Canal:** botão "Promover a Canal (Marca Pessoal)" em projetos `type:"conteudo"` sem canal vinculado ainda — cria o canal em `brand.channels` e grava `linkedChannelId` no projeto (idempotente: uma vez vinculado, mostra "Vinculado ao canal X" em vez do botão). O critério de fase "Crescimento" do tipo conteúdo passou a checar esse vínculo automaticamente. Verificado no navegador: projeto de teste "Canal LifeTree" promovido, canal apareceu em Marca Pessoal → Canais.

**Gap 6 — receita real do Yesod (versão pragmática):** campo opcional `yesodCategoria` no projeto (Editar Projeto); quando preenchido, `yesodMonthRevenueForCategory()` lê (read-only, nunca escreve) `lifetree_fin_accs`/`lifetree_fin_cards` do localStorage e soma entradas do mês atual naquela categoria, mostrado como "REAL (YESOD)" ao lado de meta/valor projetado, com delta. **Não é reconciliação bidirecional completa** (mapeamento de conta/categoria, sincronização automática) — isso continua "esforço grande" e fora de escopo; essa versão só torna a divergência visível em vez de silenciosa. Verificado no navegador injetando uma transação de teste no Yesod e confirmando que apareceu no Hod sem reload.

**Gap 7 — conquistas linkadas a trilha:** quando uma skill é editada e isso faz a trilha bater 100% pela primeira vez, `pendingAch` (mecanismo que já existia só pra metas de carreira) dispara com `trackId` preenchido — o popup mostra "Trilha concluída!" em vez de "Objetivo concluído!". `addAchievement` também ganhou um seletor opcional de trilha pra vincular manualmente. Lista de conquistas mostra o nome da trilha + um dot da cor dela quando linkada. Verificado no navegador: subir uma skill até bater a meta da trilha (100%) disparou o popup corretamente.

**Gap 8 — cor de trilha + última prática:** `addTrack`/`editTrack` ganharam um seletor de cor (12 swatches de `TRACK_PALETTE`, mesma paleta de sempre, só que agora escolhível em vez de automática). `lastPracticed` (previsto no modelo de dados desde a proposta original de 09/08/2026, nunca implementado) agora é gravado de verdade — em `createHodSkill`/`editHodSkill` (Coach) e nos sheets `addSkill`/`editSkill` (UI), sempre que o nível muda. Cada skill mostra "Nunca praticado" / "Praticado há Xd" / "⚠ Xd sem praticar" (30+ dias). Verificado no navegador nos dois casos.

**Achado no processo — componentes de aba recriados:** ver [[04 Bugs Conhecidos]] pra correção completa de registro. Resumo: `renderTab()`/`renderPage()` retornavam `<HodTab/>`/`<ProjectPage/>` etc — mesmo anti-padrão do Geburah, só que invisível pro `react-hooks/static-components` (a regra não atravessa a indireção de uma função que retorna JSX de outra). Corrigido trocando por chamada direta (`HodTab()`) nos 2 pontos de despacho — sem hoisting de estado necessário, já que nenhum Tab/Page do Hod tinha `useState` próprio.

**Lint noise limpo:** 3 blocos `catch(_){}` (empty + unused-vars) e 2 `useEffect` com dependência "faltando" (`brand.channels`, `hodScore` — ambos falsos positivos: efeitos de "só no mount"/derivados dos deps já listados). `eslint.config.js` ganhou `allowEmptyCatch:true` (resolve globalmente, não só Hod — ver [[04 Bugs Conhecidos]]).

Todas as mudanças verificadas com `npm run build` (limpo) e `eslint` (zero erros novos; os 3 remanescentes são `react-hooks/set-state-in-effect`, mesmo padrão aceito em todo o app) antes da verificação no navegador via `claude-in-chrome`.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[09 Yesod]] — modelo de auditoria funcional / "Limitações conhecidas" usado como referência de formato aqui
- [[05 Geburah]] — referência dos padrões mecânicos (`ThemeCtx`, hoist de aba) aplicados aqui
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
