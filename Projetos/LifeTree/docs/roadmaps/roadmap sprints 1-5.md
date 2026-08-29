# 🗺️ Life Tree — Roadmap para 10/10

> Baseado na avaliação PO + Designer de Alto Nível.
> Estado atual: **7.2/10** → Meta: **10/10**
> 6 dimensões · 5 fases · ~16 semanas

---

## Scorecard de Referência

| Dimensão | Atual | Meta | Gap |
|---|---|---|---|
| Proposta de valor | 8.0 | 10 | -2.0 |
| Funcionalidade | 8.5 | 10 | -1.5 |
| Visual / Estética | 7.5 | 10 | -2.5 |
| UI (interface) | 6.0 | 10 | -4.0 |
| UX (experiência) | 6.0 | 10 | -4.0 |
| Potencial de mercado | 7.5 | 10 | -2.5 |

---

## Fase 1 — Fundação UX 🏗️
**Duração:** 2 semanas
**Impacto:** UX 6→8 · UI 6→7.5
**Foco:** Eliminar os maiores pontos de abandono

### 1.1 Onboarding completo (3 telas)
- **Tela 1 — Boas-vindas:** animação da árvore crescendo, explicação do conceito em 2 linhas
- **Tela 2 — Suas áreas:** usuário seleciona 3 áreas prioritárias (highlight nas sefirot correspondentes)
- **Tela 3 — Primeiro hábito:** cria 1 hábito guiado em 2 toques com sugestões baseadas nas áreas escolhidas
- Salvar flag `onboarded: true` no storage — nunca mostra de novo

### 1.2 Simplificar criação de hábito
- Formulário principal: **Título + Área + Frequência** (3 campos)
- Botão "⚙️ Avançado" expande: sub-área, freqTarget, XP, sub-tarefas
- Defaults inteligentes: XP calculado automaticamente por frequência
- Reduz de 7 para 3 passos obrigatórios

### 1.3 Reduzir densidade dos itens de hábito
- Row normal: checkbox + título + streak + XP + menu "⋯"
- Menu "⋯" abre bottom sheet com: editar, lembrete, foco, calendário, sub-tarefas, deletar
- Alvos de toque mínimo 44px em todos os elementos
- Remove os 8 ícones inline

### 1.4 Reduzir nav de 7 para 5 abas
- **Árvore · Hábitos · Metas · Crescimento · Perfil**
- "Crescimento" = Dash + Coach + Conquistas unificados
- "Perfil" = RPG + Config + Backup
- Ícones maiores, labels legíveis em qualquer tela

---

## Fase 2 — UI Polish 💅
**Duração:** 2 semanas
**Impacto:** UI 7.5→9 · Visual 7.5→9
**Foco:** Elevar a qualidade visual ao nível dos melhores apps

### 2.1 Design system formal
- Definir 4 tamanhos de texto (xs/sm/md/lg) e usar consistentemente
- Espaçamento em grid de 4px (4, 8, 12, 16, 24, 32)
- Border radius padronizado (8 pequeno, 12 médio, 16 grande, 99 pill)
- Sombras suaves no dark mode (glow colorido nas sefirot ativas)
- Micro-animações: shake no erro, bounce no check, pulse no streak novo

### 2.2 Árvore responsiva
- Escala dinamicamente com a largura da tela
- Em tablet: árvore à esquerda, detalhes à direita (layout split)
- Animação de "pulso" nas sefirot com hábitos pendentes do dia
- Linhas da árvore animadas ao completar hábitos (glow progressivo)

### 2.3 Cards redesenhados
- Hábito concluído: background com gradient sutil da cor da área
- Meta 100%: confetti animation + card dourado
- Conquista desbloqueada: modal fullscreen com animação de reveal
- Streak 7d: badge especial animado (chama tremendo)
- Streak 30d: badge raro com efeito de partículas

### 2.4 Dark mode premium
- Gradientes de profundidade (não flat preto)
- Blur glassmorphism nos modais
- Árvore com efeito nebulosa ao fundo
- Cores das sefirot mais saturadas no dark

### 2.5 Ilustrações e empty states
- Cada aba vazia tem ilustração temática (não só texto)
- Árvore vazia: ilustração de semente esperando
- Hábitos zerados: ilustração de guerreiro pronto para começar
- Conquistas bloqueadas: silhueta misteriosa

---

## Fase 3 — Funcionalidade Avançada ⚡
**Duração:** 3 semanas
**Impacto:** Funcionalidade 8.5→10 · Proposta de valor 8→9.5
**Foco:** Features que criam dependência e retenção de longo prazo

### 3.1 Sistema de desafios
- Desafios de 21/30/66 dias com tema (ex: "Mês da Saúde")
- Progresso visual dedicado separado dos hábitos normais
- Badge exclusivo + XP bônus ao completar
- Biblioteca de desafios sugeridos pelo Coach

### 3.2 Revisão semanal guiada
- Toda segunda-feira: modal com resumo da semana anterior
- Gráfico radar das 10 áreas (antes/depois)
- Coach sugere 1 ajuste baseado nos dados
- Entrada automática no diário com o resumo

### 3.3 Templates de hábitos
- Biblioteca com 50+ hábitos prontos por área
- Filtro por objetivo (perder peso, dormir melhor, ganhar dinheiro, etc.)
- Import com 1 toque — sem precisar preencher formulário
- Usuário pode salvar seus próprios templates

### 3.4 Correlações inteligentes
- Coach detecta: "Nos dias que você medita, sua produtividade aumenta 40%"
- Insight semanal baseado nos padrões reais do usuário
- Visualização de correlação entre áreas no Dashboard

### 3.5 Modo offline robusto
- App 100% funcional sem internet
- Coach em modo offline com respostas pré-computadas
- Sync automático quando volta a conexão

### 3.6 Importar de outros apps
- Importar hábitos do Habitica (CSV)
- Importar metas do Notion (JSON)
- Importar dados de saúde do Google Fit

---

## Fase 4 — Monetização & Mercado 💰
**Duração:** 3 semanas
**Impacto:** Potencial de mercado 7.5→10
**Foco:** Transformar produto em negócio sustentável

### 4.1 Modelo Freemium definido

**Plano Gratuito (forever):**
- Até 5 hábitos
- Até 3 metas
- Coach com 10 mensagens/mês
- 1 widget no painel
- Sem desafios

**Plano Pro (R$19,90/mês ou R$149/ano):**
- Hábitos e metas ilimitados
- Coach ilimitado
- Widgets ilimitados
- Desafios e templates
- Revisão semanal automática
- Backup na nuvem
- Badge exclusivo "Guardião da Árvore"

**Plano Mestre (R$49,90/mês):**
- Tudo do Pro
- Coach com memória persistente
- Correlações e insights avançados
- Acesso antecipado a features
- Suporte prioritário

### 4.2 Trial estratégico
- 14 dias grátis do Pro ao cadastrar
- Sem cartão de crédito
- Email de nurturing durante o trial com dicas personalizadas

### 4.3 Paywall inteligente
- Não bloqueia na abertura — bloqueia no momento de valor
- Ex: ao criar o 6º hábito → "Você está crescendo! Desbloqueie hábitos ilimitados"
- Ex: ao querer usar o Coach pela 11ª vez → upgrade contextual

### 4.4 Landing page
- Site de conversão com a árvore animada
- Depoimentos de usuários beta
- Comparativo com concorrentes
- CTA direto para download

### 4.5 Estratégia de lançamento
- Beta fechado com 100 usuários selecionados (comunidades de desenvolvimento pessoal)
- Product Hunt launch
- Parceria com criadores de conteúdo de espiritualidade e autodesenvolvimento
- TikTok / Reels mostrando a árvore evoluindo (conteúdo viral natural)

---

## Fase 5 — Ecossistema & Escala 🌍
**Duração:** 6 semanas
**Impacto:** Todas as dimensões → 10
**Foco:** Transformar o Life Tree num ecossistema

### 5.1 Sincronização em nuvem
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Dados sincronizados entre dispositivos em tempo real
- Histórico completo nunca se perde
- Compartilhamento de progresso via link

### 5.2 WearOS / Apple Watch
- Tile de resumo diário (hábitos + streak + XP)
- Check-in de hábitos direto no pulso
- Notificações inteligentes baseadas no histórico (horário que o usuário mais completa)
- Coach com respostas rápidas via voz

### 5.3 Coach com memória persistente
- Lembra de conversas anteriores
- Conhece padrões de longo prazo do usuário
- Personalidade adaptável (rigoroso / gentil / motivador)
- Proativo: inicia conversa em momentos chave (queda de streak, meta próxima do prazo)

### 5.4 Multi-app ecosystem
- Life Tree como hub central
- Integração com app de Finanças, Saúde, Conhecimento
- Score unificado das 10 áreas alimentado por todos os apps
- Um coach que conhece tudo

### 5.5 Social & Comunidade
- Perfil público opcional com árvore compartilhável
- Desafios em grupo (família, amigos, comunidades)
- Leaderboard semanal por área
- Feed de conquistas dos amigos
- Grupos temáticos (ex: "Grupo 30 dias sem açúcar")

### 5.6 API pública
- Desenvolvedores podem criar integrações
- Webhooks para automações (Zapier, Make)
- SDK para parceiros

---

## Timeline Visual

```
Semana:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
         ├──────────┤
Fase 1   │ Fundação │
         │   UX     │
         └──────────┴──────────┤
Fase 2              │ UI Polish│
                    │          │
                    └──────────┴──────────────┤
Fase 3                         │ Funcionalidade│
                               │   Avançada   │
                               └──────────────┴──────────┤
Fase 4                                        │ Monetização│
                                              └──────────┴──┤
Fase 5                                                   │Eco│
```

---

## Métricas de Sucesso por Fase

| Fase | Métrica principal | Meta |
|---|---|---|
| 1 | Taxa de conclusão do onboarding | >80% |
| 1 | Retenção D1 (volta no dia seguinte) | >50% |
| 2 | Nota na App Store (design) | >4.5⭐ |
| 2 | Tempo médio de sessão | >5 min |
| 3 | Retenção D30 | >30% |
| 3 | Hábitos completados por usuário/semana | >15 |
| 4 | Conversão free→pro | >8% |
| 4 | MRR mês 3 | R$5.000+ |
| 5 | DAU/MAU ratio | >40% |
| 5 | NPS | >60 |

---

## Scorecard Projetado por Fase

| Dimensão | Atual | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Fase 5 |
|---|---|---|---|---|---|---|
| Proposta de valor | 8.0 | 8.5 | 9.0 | 9.5 | 9.5 | **10** |
| Funcionalidade | 8.5 | 8.5 | 8.5 | 9.5 | 9.5 | **10** |
| Visual / Estética | 7.5 | 7.5 | 9.5 | 9.5 | 9.5 | **10** |
| UI (interface) | 6.0 | 8.5 | 9.5 | 9.5 | 9.5 | **10** |
| UX (experiência) | 6.0 | 8.5 | 9.0 | 9.5 | 9.5 | **10** |
| Potencial de mercado | 7.5 | 7.5 | 7.5 | 8.0 | 9.5 | **10** |
| **Média** | **7.2** | **8.2** | **8.8** | **9.2** | **9.5** | **10** |

---

## Prioridade absoluta agora

Se pudesse fazer só uma coisa: **Fase 1.1 — Onboarding.**

É o item de maior impacto com menor esforço. Um usuário que passa pelo onboarding tem 3x mais chance de voltar no dia seguinte. Todo o resto do produto só tem valor se o usuário não abandona nos primeiros 2 minutos.

Quer implementar a Fase 1 agora?
