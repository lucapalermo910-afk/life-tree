---
tags: [lifetree, avaliacao]
---

# Avaliação PO + Designer de Alto Nível — Life Tree RPG

> Data: Junho 2026
> Estado avaliado: v6-current (ver [[Versões]])
> Avaliação média: **7.2/10**

## 🎯 Avaliação como Product Owner

### Proposta de Valor — 8/10
O Life Tree resolve um problema real e mal resolvido: a fragmentação do autodesenvolvimento. Apps de hábito existem aos montes (Habitica, Streaks, Notion), mas nenhum unifica as 10 dimensões da vida com uma metáfora visual poderosa e um sistema de progressão RPG.

O diferencial kabbalístico é arriscado mas inteligente — é nicho o suficiente para criar identidade forte, mas universal o suficiente para não alienar.

### Funcionalidades — 8.5/10
Core loop sólido (ver [[Visão Geral]]). As sprints entregaram um produto surpreendentemente completo para um MVP — lista completa de funcionalidades em [[Visão Geral]].

### Gaps Críticos de Produto

**🔴 Onboarding zero**
O usuário abre o app e vê uma árvore vazia sem nenhuma orientação. Não sabe o que fazer, o que são as sefirot, como começar. Taxa de abandono nas primeiras 2 minutos deve ser altíssima.

**🔴 Sem dados de exemplo**
App vazio não motiva. Todo bom app de hábito começa com sugestões ou dados demo.

**🟡 Coach de IA como aba escondida**
O diferencial mais poderoso do produto está numa aba que o usuário pode nunca descobrir. Ver [[Coach de IA]].

**🟡 Sem social / compartilhamento**
Streaks e conquistas são muito mais poderosas quando você pode mostrar para alguém.

**🟡 Monetização não definida**
Sem modelo claro de receita o produto não tem futuro comercial.

### Potencial de Mercado — 7.5/10
O mercado de wellness apps movimentou $6.8 bilhões em 2023 e cresce 17% ao ano. O segmento de "self-improvement RPG" (Habitica tem 4M usuários) valida o modelo.

O diferencial kabbalístico abre um nicho específico muito rentável: pessoas em jornada de autoconhecimento, espiritualidade prática, desenvolvimento pessoal acelerado. Esse público paga bem por ferramentas que ressoam com sua visão de mundo.

Concorrentes diretos fracos nesse nicho específico — oportunidade real.

---

## 🎨 Avaliação como Designer de Alto Nível

### Visual — 7.5/10
A linguagem visual tem coerência. O dark mode em especial é bonito — as cores das sefirot contra o fundo escuro criam uma atmosfera que reforça o conceito espiritual/místico do produto. A árvore SVG é o coração visual e está bem executada.

**O que está funcionando:**
- Paleta de cores coerente e bem aplicada
- Dark mode com atmosfera única
- Árvore SVG com glow e gradientes
- Sistema de cores por área propagado consistentemente

### UI — 6/10

**🔴 Densidade de informação alta demais nas abas de hábitos**
Cada item tem 11 elementos numa linha de 430px: checkbox, título, sub-área, contagem, streak badge, XP, ícone foco, ícone calendário, ícone lembrete, ícone lista, ícone editar, ícone deletar.

> Mínimo recomendado: 44px por alvo de toque
> Nossos ícones atuais: ~24px ❌

**🔴 Nav bar com 7 abas**
O limite de usabilidade para bottom nav é 5. Com 7 abas os labels ficam cortados e os ícones pequenos demais.

**🟡 Cards de sub-área em grid 2 colunas com texto longo**
"Autoconhecimento" não cabe numa coluna de 47% — trunca ou quebra linha feia.

**🟡 Árvore não responsiva para tablets**
Em tela grande a árvore fica pequena no centro com muito espaço vazio.

### UX — 6/10

**🔴 Criar primeiro hábito tem 7 passos**
Título → Área → Sub-área → Frequência → Vezes por período → XP → Salvar.

> Meta: máximo 3 passos obrigatórios, resto em "Avançado"

**🔴 Completar hábito na aba Árvore é difícil**
O fluxo principal deveria ser: vejo a árvore → toco numa sefirá → vejo meus hábitos → marco como feito. Hoje ao tocar na sefirá você vai para uma página com os mesmos 11 botões apertados.

**🟡 Coach escondido**
O maior diferencial do produto está na 6ª aba. Deveria estar no onboarding e em destaque.

**🟡 Pomodoro abre tela fullscreen sem aviso**
Usuário toca no ícone de timer sem saber o que vai acontecer.

**🟡 Undo bar compete visualmente com nav bar**
Aparecem sobrepostos em algumas resoluções.

---

## 📊 Scorecard Final

| Dimensão | Nota | Status |
|---|---|---|
| Proposta de valor | 8.0/10 | ✅ Diferencial real, nicho bem definido |
| Funcionalidade | 8.5/10 | ✅ Surpreendentemente completo para MVP |
| Visual / Estética | 7.5/10 | 🟡 Coerente, dark mode excelente |
| UI (interface) | 6.0/10 | 🔴 Densidade alta, nav com 7 abas |
| UX (experiência) | 6.0/10 | 🔴 Onboarding zero, fluxos longos |
| Potencial de mercado | 7.5/10 | 🟡 Nicho real, concorrência fraca |
| **Média geral** | **7.2/10** | |

## 🚀 Top 3 Ações de Maior Impacto

### 1. Onboarding de 3 telas
Apresenta o conceito, pede 3 áreas prioritárias, cria 1 hábito automaticamente.
**Impacto:** Transforma taxa de retenção D1 (estimativa: +3x)

### 2. Simplificar criação de hábito
Título + Área + Frequência. Os outros campos vão para "configurações avançadas".
**Impacto:** Reduz de 7 para 3 passos — reduz abandono no primeiro uso

### 3. Reduzir nav para 5 abas
Unir Dash + Coach numa aba "Crescimento". Mover Config para o header.
**Impacto:** Aumenta tamanho dos alvos de toque, melhora legibilidade

## Ver também
- [[05 Roadmap]] — plano completo para elevar todas as notas a 10
- [[Coach de IA]] — especificação técnica do Coach de IA
- [[Smartwatch Integração]] — guia de integração com smartwatch
