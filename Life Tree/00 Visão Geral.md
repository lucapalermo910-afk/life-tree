---
tags: [lifetree, overview]
aliases: [Visão Geral]
---

# Visão Geral

**Life Tree** é um app de desenvolvimento pessoal baseado na Árvore da Vida Kabbalística, com um módulo dedicado por área de vida.

> ⚠️ **Corrigido em 22/08/2026** — esta nota descrevia uma camada de RPG no hub (moedas, nível/XP global, conquistas/badges, "loja" de desejos) que foi **removida por completo em 19/08/2026**, a pedido explícito do usuário (ver [[04 Bugs Conhecidos]] → "Camada de RPG do hub — removida" e [[01 Kether]] → "Camada de RPG removida"). O texto abaixo nunca tinha sido atualizado depois dessa remoção — corrigido agora, junto de uma auditoria completa do vault (ver [[09 Auditoria de Código vs Documentação]]).

## Conceito
10 áreas de vida mapeadas nas 10 sefirot da Kabbalah — ver [[Módulos (Sefirot)]]. Cada uma tem seu próprio módulo (tela + persistência + Coach + score bridge pra Árvore), com hábitos/metas/registros específicos daquela área — não existe mais um sistema genérico de hábito/meta no hub que sirva pra todas de uma vez. Cada módulo publica um score (0–100%) que enche visualmente a sefirá correspondente na Árvore.

### Core loop
```
Escolher uma sefirá → Registrar algo naquele módulo (hábito, transação, refeição, leitura...) → Score do módulo sobe → Ver a sefirá encher na Árvore
```
Alguns módulos (ex: Hod) ainda têm o próprio sistema de XP por hábito/meta, interno àquele módulo — não é mais um XP/nível global do hub.

## Stack
- **Frontend:** React (web, Vite) — **só web hoje.** `app/native/` (React Native + Expo) existe como pasta mas está confirmado **vazio** (auditoria de 10/08/2026, ver [[10 Segurança, Mobile e Performance]]); as linhas abaixo descreviam o plano, não o que está implementado — corrigido aqui pra não confundir plano com estado real.
- **Build:** Vite 5 + @vitejs/plugin-react@4
- **Persistência:** localStorage (web). AsyncStorage é só o que a rota React Native usaria, se/quando essa rota for implementada — nenhum código mobile existe ainda.
- **IA:** Claude API (claude-sonnet-4-20250514) via proxy serverless — ver [[Coach de IA]] e [[02 Arquitetura]] → "Coach de IA"
- **Ícones:** SVG inline customizados — único conjunto que existe de fato (a menção a `@expo/vector-icons` era só plano da rota mobile, nunca implementada)

## Funcionalidades entregues
- ✅ 8 módulos reais integrados (Yesod/Finanças, Geburah/Saúde, Hod/Profissional, Tiphareth/Autocuidado, Chesed/Relacionamentos, Netzach/Qualidade de Vida, Chokmah/Espiritualidade, Binah/Conhecimento) — cada um com hábitos/metas/registros próprios, persistência, Coach com ações reais (`actions:true` nos 8) e score bridge pra Árvore
- 🟡 2 módulos em protótipo (Malkuth/Controle, Kether/Desejo) — agregam dado dos 8 módulos reais, ainda não têm todas as abas das propostas completas
- ✅ Diário reflexivo ligado às sefirot (no hub, não por módulo)
- ✅ Coach de IA com ações reais (confirmação obrigatória antes de executar) nos 8 módulos + skill genérica do hub
- ✅ Backup/restore (JSON via clipboard)
- ✅ Personalização de áreas e cores
- ✅ Hub de hábitos cross-módulo read-only no Tiphareth (espelha 5 dos 8 módulos)
- 🔴 Camada de RPG do hub (XP/nível/moedas globais, conquistas, Pomodoro, lembretes, calendário de completions) — **removida em 19/08/2026**, não existe mais; cada módulo tem seus próprios mecanismos de acompanhamento (streaks, scores), não um sistema genérico

## Diferencial de mercado
O mercado de wellness apps movimentou $6.8 bilhões em 2023 e cresce 17% ao ano. O diferencial kabbalístico abre um nicho específico rentável — pessoas em jornada de autoconhecimento, espiritualidade prática, desenvolvimento pessoal acelerado. **Atualização (14/08/2026):** análise de mercado mais recente, com precedente real (Habitica, Exist.io, Gyroscope, Fabulous, Co-Star/Chani) e veredito sobre virar produto, em [[05 Roadmap]] → "Product-market fit".

Ver análise completa em [[Avaliação PO + Designer]].

## Ver também
- [[Arquitetura]]
- [[Versões]]
- [[05 Roadmap]]
- [[10 Segurança, Mobile e Performance]]
