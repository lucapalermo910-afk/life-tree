---
tags: [lifetree, spec, ia]
---

# 🤖 Agente Coach de IA — Especificação para Todos os Apps

> Baseado na implementação do Life Tree v3 (ver [[Versões]]). Use este documento para replicar o padrão em qualquer outro app do ecossistema — ver [[Módulos (Sefirot)]].
>
> ⚠️ **Desatualizado em relação ao Life Tree real desde 01/08/2026.** O código abaixo (`fetch` direto do client pra Anthropic, sem confirmação antes de executar ação) **não é mais o que roda no Life Tree** — foi substituído por um proxy serverless + confirmação obrigatória + um registry de skills por módulo. Pra implementar o Coach **dentro do Life Tree**, siga [[02 Arquitetura]] → seções "Coach de IA" e "Coach de IA — ações por módulo", não o código desta página. Este documento continua válido como **conceito geral** (útil se for montar o Coach num app fora do Life Tree, do zero), mas qualquer app novo deveria de qualquer forma adotar proxy de auth + confirmação — não replicar o `fetch` direto abaixo.

## Conceito

O Coach de IA é um assistente conversacional embutido diretamente no app que:

1. **Lê o contexto completo** do app em tempo real (dados, estado, histórico)
2. **Conversa naturalmente** com o usuário em português
3. **Executa ações reais** dentro do app via JSON actions parsados da resposta
4. **Persiste o histórico** da sessão enquanto o app está aberto

O usuário nunca precisa sair do app para interagir com a IA — tudo acontece inline.

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    APP                              │
│                                                     │
│  ┌──────────┐   contexto JSON   ┌───────────────┐  │
│  │  Estado  │ ─────────────────▶│  System       │  │
│  │  do App  │                   │  Prompt       │  │
│  └──────────┘                   └───────┬───────┘  │
│                                         │           │
│  ┌──────────┐   mensagens       ┌───────▼───────┐  │
│  │   Chat   │ ◀────────────────▶│  Claude API   │  │
│  │    UI    │                   │  (Sonnet 4)   │  │
│  └──────────┘                   └───────┬───────┘  │
│       │                                 │           │
│       │         <ACTION>{...}</ACTION>  │           │
│       ▼                                 ▼           │
│  ┌──────────────────────────────────────────────┐  │
│  │           Action Executor                    │  │
│  │  parse JSON → chama setState do app          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Implementação — Código Base React

### 1. Estado necessário
```js
const [coachMessages, setCoachMessages] = useState([]);
const [coachInput,    setCoachInput]    = useState("");
const [coachLoading,  setCoachLoading]  = useState(false);
```

### 2. Função principal `sendToCoach`
```js
const sendToCoach = async (msgOverride) => {
  const msg = (msgOverride || coachInput).trim();
  if (!msg) return;
  setCoachInput("");

  const userMsg = { role: "user", content: msg };
  const newMsgs = [...coachMessages, userMsg];
  setCoachMessages(newMsgs);
  setCoachLoading(true);

  const ctx = buildContext();
  const systemPrompt = buildSystemPrompt(ctx);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
      })
    });
    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "Erro.";

    const actionMatch = text.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
    let cleanText = text.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, "").trim();

    if (actionMatch) {
      try {
        const action = JSON.parse(actionMatch[1].trim());
        const result = executeAction(action);
        if (result) cleanText += " " + result;
      } catch (e) {}
    }

    setCoachMessages(p => [...p, { role: "assistant", content: cleanText }]);
  } catch (e) {
    setCoachMessages(p => [...p, { role: "assistant", content: "Erro de conexão." }]);
  }
  setCoachLoading(false);
};
```

### 3. UI do Chat

> 📌 **No hub do Life Tree (`App.jsx`), essa UI de aba dedicada foi substituída em 31/07/2026** por um campo de input permanente (`position:fixed`, visível em todas as abas), com um balão mostrando só a última resposta acima do campo — não uma lista de mensagens rolável. O código abaixo continua válido como **padrão geral pra outros apps** (ou pra qualquer app que prefira um chat de tela cheia em vez de um campo flutuante); ver [[02 Arquitetura]] (seção "Coach de IA") pra como ficou especificamente no Life Tree.

```jsx
{tab === "coach" && (
  <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 200px)" }}>
    <div style={{ flex:1, overflowY:"auto" }}>
      {coachMessages.map((m, i) => (
        <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", marginBottom:10 }}>
          <div style={{
            maxWidth:"80%", padding:"9px 12px", borderRadius:12,
            background: m.role==="user" ? "#818cf8" : C.card,
            color: m.role==="user" ? "#fff" : C.text,
            fontSize:12, lineHeight:1.6,
          }}>
            {m.content}
          </div>
        </div>
      ))}
      {coachLoading && <LoadingDots />}
    </div>

    <div style={{ display:"flex", gap:8, paddingTop:8, borderTop:"1px solid "+C.b1 }}>
      <input
        value={coachInput}
        onChange={e => setCoachInput(e.target.value)}
        onKeyDown={e => e.key==="Enter" && sendToCoach()}
        placeholder="Pergunte ou peça para criar algo..."
        style={{ flex:1, background:C.bg, border:"1px solid "+C.b2, borderRadius:12, padding:"10px 14px", color:C.text, fontSize:12, outline:"none" }}
      />
      <button onClick={() => sendToCoach()} style={{ width:42, height:42, borderRadius:12, background:"#818cf8", border:"none", cursor:"pointer" }}>
        →
      </button>
    </div>
  </div>
)}
```

## System Prompt — Template por App

```
Você é o Coach de [NOME DO APP] — [descrição do papel].

CONTEXTO ATUAL DO USUÁRIO:
${JSON.stringify(ctx, null, 2)}

SUAS CAPACIDADES:
Você pode executar as seguintes ações respondendo com JSON entre <ACTION> e </ACTION>:
[lista de actions disponíveis]

REGRAS:
- Quando o usuário pedir para criar/modificar algo, inclua a action no final
- Seja conciso, motivador, direto
- Responda sempre em português
- Use emojis com moderação
```

## Actions — Catálogo por App

### 🌳 Life Tree (implementado)

| Action | JSON | Efeito |
|---|---|---|
| `create_habit` | `{action, title, areaId, freq, freqTarget, xp}` | Cria hábito |
| `create_goal` | `{action, title, areaId, progress, target, unit, xp, dir}` | Cria meta |
| `create_diary` | `{action, text, sefirotId, mood}` | Entrada no diário |
| `complete_habit` | `{action, id}` | Marca hábito como feito |
| `update_goal` | `{action, id, progress}` | Atualiza progresso |

### 💰 App de Finanças

| Action | JSON | Efeito |
|---|---|---|
| `create_transaction` | `{action, type:"receita\|despesa", value, category, description, date}` | Registra lançamento |
| `create_account` | `{action, name, type:"corrente\|poupança\|investimento", balance}` | Cadastra conta |
| `create_product` | `{action, name, price, category, unit}` | Cadastra produto/serviço |
| `create_budget` | `{action, category, limit, period:"mensal\|semanal"}` | Define orçamento |
| `transfer` | `{action, fromAccount, toAccount, value, description}` | Transferência entre contas |
| `set_goal` | `{action, name, targetValue, deadline, currentValue}` | Meta financeira |
| `query_balance` | `{action, accountId}` | Consulta saldo (resposta via contexto) |

**Contexto recomendado para Finanças:**
```js
const ctx = {
  contas: accounts.map(a => ({ id:a.id, nome:a.name, saldo:a.balance, tipo:a.type })),
  transacoes_recentes: transactions.slice(0,10),
  orcamentos: budgets.map(b => ({ categoria:b.category, limite:b.limit, gasto:b.spent })),
  resumo_mes: { receitas: totalIncome, despesas: totalExpenses, saldo: balance },
  metas: financialGoals,
};
```

### 🏃 App de Saúde / Treino

| Action | JSON | Efeito |
|---|---|---|
| `log_workout` | `{action, type, duration, calories, notes}` | Registra treino |
| `log_meal` | `{action, name, calories, protein, carbs, fat, mealType}` | Registra refeição |
| `log_measurement` | `{action, weight, bodyFat, date}` | Medições corporais |
| `create_routine` | `{action, name, days, exercises:[{name,sets,reps}]}` | Cria rotina de treino |
| `set_health_goal` | `{action, type:"peso\|gordura\|musculo", target, deadline}` | Define meta |
| `log_water` | `{action, ml}` | Registra hidratação |

### 📚 App de Conhecimento / Leitura

| Action | JSON | Efeito |
|---|---|---|
| `add_book` | `{action, title, author, pages, category}` | Adiciona livro |
| `log_reading` | `{action, bookId, pages, notes}` | Registra sessão de leitura |
| `create_note` | `{action, title, content, tags, bookId}` | Cria nota/resumo |
| `set_reading_goal` | `{action, booksPerYear, pagesPerDay}` | Define meta de leitura |
| `add_course` | `{action, title, platform, totalHours, category}` | Adiciona curso |
| `log_study` | `{action, courseId, minutes, topic}` | Registra estudo |

### 💼 App Profissional / Projetos

| Action | JSON | Efeito |
|---|---|---|
| `create_project` | `{action, name, client, deadline, status}` | Cria projeto |
| `create_task` | `{action, title, projectId, priority, dueDate}` | Cria tarefa |
| `log_time` | `{action, projectId, taskId, minutes, description}` | Registra horas |
| `update_task` | `{action, id, status:"todo\|doing\|done"}` | Atualiza tarefa |
| `create_invoice` | `{action, client, items, dueDate}` | Cria fatura |
| `log_meeting` | `{action, title, participants, duration, notes}` | Registra reunião |

### 🏠 App de Qualidade de Vida

| Action | JSON | Efeito |
|---|---|---|
| `create_wish` | `{action, title, category, priority, estimatedCost}` | Lista de desejos |
| `log_experience` | `{action, title, date, rating, notes, category}` | Registra experiência |
| `create_routine` | `{action, name, time, tasks:[{title}]}` | Rotina diária |
| `set_home_goal` | `{action, area, description, deadline}` | Meta do lar |

## Contexto — O que sempre incluir

```js
// Resumo universal — inclua em todos os apps
const universalContext = {
  data_atual: new Date().toISOString().slice(0,10),
  usuario: {
    nivel_life_tree: lvl?.level,
    xp_total: xp,
    dias_uso: calcDaysUsing(),
  },
  resumo_atividade: {
    acoes_hoje: countTodayActions(),
    ultima_acao: lastActionDate(),
  }
};
```

## Ações Rápidas — Sugestões por App

```js
// Finanças
const QUICK_ACTIONS = [
  "Registre uma despesa de R$50 em alimentação",
  "Qual meu saldo atual?",
  "Crie uma meta de poupar R$500 este mês",
  "Onde estou gastando mais?",
  "Registre receita de R$200 de freelance",
  "Analise minha saúde financeira",
];

// Saúde
const QUICK_ACTIONS = [
  "Registre treino de 45 min de musculação",
  "Adicionei 500ml de água",
  "Como está minha evolução esta semana?",
  "Crie uma rotina de treino 3x por semana",
  "Analisar minha nutrição de hoje",
];
```

## Boas Práticas

1. **Contexto minimal mas suficiente** — não envie dados demais; contexto gigante = custo maior + respostas piores
2. **Actions atômicas** — cada action faz uma coisa só; operações complexas encadeiam múltiplas mensagens
3. **Confirmação visual** — sempre mostre feedback ao usuário quando uma action é executada
4. **Fallback gracioso** — nunca deixe o loading infinito
5. **Histórico da sessão** — mantenha `coachMessages` no estado React (não persista — cada sessão é nova)
6. **Segurança das actions** — valide o JSON da action antes de executar; nunca confie cegamente no JSON retornado

## Integração com Smartwatch

Ver [[Smartwatch Integração]]. Para o coach funcionar no smartwatch:
- Watch exibe histórico resumido (últimas 3 mensagens)
- Input por voz (Web Speech API) ou respostas rápidas pré-definidas
- Actions limitadas às mais simples (log, check, confirm)
- Sincronização via BroadcastChannel ou SharedWorker com o app principal

## Roadmap de Evolução do Coach

| Versão | Feature | Status no Life Tree |
|---|---|---|
| v1 | Chat + actions básicas | ✅ feito (hub, 31/07/2026) |
| v1.5 | Confirmação obrigatória antes de executar qualquer ação | ✅ feito (hub + Yesod, 01/08/2026) |
| v2 | Memória entre sessões (últimas 5 conversas salvas) | não iniciado |
| v3 | Proatividade — coach inicia conversa em momentos chave | não iniciado |
| v4 | Multi-app — um coach que conhece todos os apps do ecossistema | 🟡 parcial: 1 skill por módulo já existe (`coachSkills.js`), roteamento automático pelo módulo ativo já funciona; só Yesod tem ações completas (34), os outros 5 são só leitura — ver [[02 Arquitetura]] |
| v5 | Voz — input e output por áudio | não iniciado |
| v6 | Personalidade configurável (coach rigoroso vs gentil vs motivador) | não iniciado |

## Ver também
- [[Smartwatch Integração]]
- [[05 Roadmap]] — backlog P3 (coach com memória persistente)
