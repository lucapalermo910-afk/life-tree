---
tags: [lifetree, modulos, sefirot]
aliases: ["Módulos (Sefirot)", "03 Módulos (Sefirot)"]
---

# Módulos (Sefirot)

Mapeamento das 10 sefirot da Kabbalah para os 10 módulos de área de vida do app. Ver arquitetura de integração em [[Arquitetura]]. Cada módulo tem seu próprio arquivo nesta mesma pasta, com funcionalidades e código detalhados.

| Sefirá | Nome PT | Área | Módulo | Status |
|---|---|---|---|---|
| Kether | Coroa | Desejos | [[Kether]] | 🟡 Protótipo (aba Metas + Desejos com derivação, 6/6 módulos-alvo) |
| Chokmah | Sabedoria | Espiritualidade | [[Chokmah]] | ✅ Integrado |
| Binah | Entendimento | Conhecimento | [[Binah]] | ✅ Integrado |
| Chesed | Misericórdia | Relacionamentos | [[Chesed]] | ✅ Integrado |
| Geburah | Força | Saúde | [[Geburah]] | ✅ Integrado |
| Tiphareth | Beleza | Autocuidado | [[Tiphareth]] | ✅ Integrado |
| Netzach | Vitória | Qualidade de Vida | [[Netzach]] | ✅ Integrado |
| Hod | Esplendor | Profissional | [[Hod]] | ✅ Integrado |
| Yesod | Fundação | Finanças | [[Yesod]] | ✅ Integrado |
| Malkuth | Reino | Controle | [[Malkuth]] | 🟡 Protótipo (aba Atividades, 8/8 módulos conectados) |

> ⚠️ **Status corrigido em auditoria de código (28/07/2026)** — ver [[09 Auditoria de Código vs Documentação]].
> - `preview/src/App.jsx` importava e renderizava só 4 módulos originalmente (Yesod, Geburah, Hod, Tiphareth); os docs do repo original citavam só Yesod. **Tiphareth** não estava documentado em nenhuma fonte antes da auditoria.
> - **31/07/2026 — Chesed e Netzach foram integrados de verdade.** Tinham módulos inteiros escritos em `modules/` (58KB e 45KB) mas fora do checklist de integração (sem persistência, sem score bridge, sem botão de voltar, `export default function App()` genérico). Aplicado o checklist completo, testado no navegador (Chrome via `claude-in-chrome`): back button, persistência via localStorage sobrevivendo a reload, score bridge publicando em `lifetree_scores`. Snapshot salvo em `app/versions/v8-relacionamentos-qualidade-integrated.jsx`.
> - **13/08/2026 — Chokmah e Binah construídos do zero**, já nascendo com o checklist completo (nunca passaram por estágio read-only). Ver [[02 Chokmah]]/[[03 Binah]] e [[01 Estado Atual]].
> - **18–19/08/2026 — Malkuth ganhou o primeiro código real**, um protótipo focado (`preview/src/MalkuthModule.jsx`): só a aba Atividades das 6 propostas, mas já lendo/escrevendo nos 8 módulos reais via sincronização bidirecional (reaproveita as `*_ACTION_HANDLERS` do Coach pra escrever, o padrão `HUB_ADAPTERS` do Tiphareth pra ler). Rótulo em destaque na árvore mudou de "Pessoal"/"Reino" pra **"Controle"**. Ver [[10 Malkuth]] → "Decisão 1 fechada e testada" e "Estendido pros 8 módulos".
> - **19–20/08/2026 — Kether ganhou o primeiro código real** (`preview/src/KetherModule.jsx`): mesmo padrão do Controle, mas pro lado das metas — aba "Metas" agregando Yesod/Hod/Tiphareth com toggle bidirecional, e "Desejos" (lista própria) que **deriva metas reais em até 6 módulos** (os 3 acima + Netzach/Chokmah/Binah, sem toggle nesses 3). Ver [[01 Kether]] → "Proposta e implementação". Nesse processo, a **camada de RPG do hub inteira foi removida** (moedas, nível/XP global, lista de desejos genérica, abas Hábitos/Metas genéricas do hub — essas últimas levaram junto Pomodoro/lembretes/sub-tarefas/marcos/calendário, nenhum com equivalente em módulo real) e um bug real de roteamento foi corrigido (lista "SEFIROT → ÁREAS" do Config não abria os módulos reais). Ver [[04 Bugs Conhecidos]].
> - Malkuth e Kether ainda faltam as outras abas das propostas completas (Reino/Progresso/Conquistas/Diário/Config no Malkuth) pra virar módulo "pronto" no mesmo sentido dos outros 8.

**Módulos integrados agora: 8 de 10** (Yesod, Geburah, Hod, Tiphareth, Chesed, Netzach, Chokmah, Binah) **+ 2 em protótipo** (Malkuth, Kether). Todos os 10 nós da árvore têm algum código real agora — nenhum mais "genuinamente vazio".

> 📋 **Auditoria de visão vs. estado atual (09/08/2026)** — comparação módulo a módulo entre o que existe no código e a visão do usuário pra cada um dos 10 nós, feita antes de decidir a próxima leva de evolução. Achados incorporados na seção de cada módulo (ver "Auditoria funcional" / "Visão do usuário" em cada nota) e nas perguntas em aberto em [[05 Roadmap]]. Também publicada como [artefato web](https://claude.ai/code/artifact/cd019a65-8e04-44b0-add7-59f39c2f9e3c). Resumo em [[01 Estado Atual]].

## IDs do score bridge

Usar exatamente estes IDs ao publicar scores (ver [[Arquitetura]] para o mecanismo):

```js
"kether"    // Desejos
"chokmah"   // Espiritualidade
"binah"     // Conhecimento
"chesed"    // Relacionamentos
"geburah"   // Saúde
"tiphareth" // Autocuidado
"netzach"   // Qualidade de Vida
"hod"       // Profissional
"yesod"     // Finanças
"malkuth"   // Controle (renomeado de "Pessoal" em 18/08/2026, ver [[10 Malkuth]])
```

## Achado sistêmico em todas as 7 integrações de IA existentes — corrigido em 31/07 e 01/08/2026

~~Hub (`App.jsx`) + Yesod + Geburah + Hod + Tiphareth + Chesed + Netzach — **todas** fazem `fetch` direto pra API da Anthropic **sem headers de autenticação** (`x-api-key`, `anthropic-version`). Não é um bug isolado de um módulo — é um padrão copiado em cada implementação.~~ Consolidado num proxy único (`/api/coach`) com registry de skills (`coachSkills.js`) cobrindo todos os módulos — nenhum `fetch` direto restante. O proxy em si ganhou rate limit + limite de payload em 15/08/2026 (ver [[04 Bugs Conhecidos]]), ainda sem autenticação de chamador de verdade. Ver [[01 Estado Atual]], seção "Coach de IA".

## Ver também
- [[Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[05 Roadmap]]
- [[09 Auditoria de Código vs Documentação]]
