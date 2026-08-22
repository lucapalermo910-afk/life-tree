---
tags: [lifetree, modulo, chesed]
aliases: [Chesed]
---

# 💗 Chesed — Relacionamentos

> Status: ✅ **Integrado na Árvore em 31/07/2026**, gaps de arquitetura fechados em 13/08/2026. Arquivo: `preview/src/ChesedModule.jsx` (915 linhas em 13/08/2026).
> Score bridge: publica `chesed` em `lifetree_scores`. Testado no navegador (Chrome via `claude-in-chrome`): back button, persistência sobrevivendo a reload, score atualizando ao completar hábito.
> Ações de Coach em `preview/src/shared/chesedActions.js` (6 ações, `actions:true` desde 13/08/2026).

## Funcionalidades (confirmadas no código)

### CRM pessoal de relacionamentos
Pessoas cadastradas com tipo de relação, data do último contato e frequência ideal de contato — o "maior gap" identificado no [[05 Roadmap]] (P1 #11), e o código já existe:
```js
const [pessoas, setPessoas] = useState(SEED_PESSOAS); // {nome, tipo, ultimoContato, freqIdeal}
const pessoasAtrasadas = pessoas
  .filter(p=>diasDesde(p.ultimoContato)>p.freqIdeal)
  .sort((a,b)=>diasDesde(b.ultimoContato)-diasDesde(a.ultimoContato));
```

### Datas importantes (aniversários e recorrências)
```js
const proximaAnual = (orig) => {
  const d = new Date(orig+"T12:00:00"), hoje = new Date(todayS()+"T12:00:00");
  const p = new Date(hoje.getFullYear(), d.getMonth(), d.getDate());
  if(p < hoje) p.setFullYear(p.getFullYear()+1);
  return p.toISOString().slice(0,10);
};
const datasProx = datas
  .map(d=>({...d, proxima: d.recorrente ? proximaAnual(d.data) : d.data}))
  .filter(d=>diasAte(d.proxima)<=30)
  .sort((a,b)=>diasAte(a.proxima)-diasAte(b.proxima));
```

### Registros de interação com qualidade
Cada contato registrado (`registros`) tem tipo e uma nota de qualidade (1-5), usada no score.

### Hábitos de relacionamento
Lista própria de hábitos (ex: ligar pra alguém, marcar encontro).

### Score do módulo
```js
const habScore    = habits.length   ? Math.round(habits.filter(h=>h.done).length/habits.length*100) : 0;
const freqScore   = pessoas.length  ? Math.round(pessoas.filter(p=>diasDesde(p.ultimoContato)<=p.freqIdeal*1.5).length/pessoas.length*100) : 0;
const qualScore   = registros.length? Math.round(registros.slice(-5).reduce((s,r)=>s+r.qualidade,0)/Math.min(5,registros.length)/5*100) : 0;
const chesedScore = Math.round(habScore*0.3 + freqScore*0.4 + qualScore*0.3); // frequência de contato pesa mais (40%)
```

### Coach IA — nota de atualização (09/08/2026, atualizada em 13/08/2026)
> ⚠️ A seção abaixo descreve a implementação **anterior à consolidação do Coach** (decisão "Life Tree Coach architecture" no histórico do projeto — ver [[02 Arquitetura]] → "Coach de IA") e está desatualizada. Hoje o Chesed usa a skill `chesed` em `coachSkills.js`, roteada pelo Coach global — sem `fetch` próprio (resolve, de quebra, o bug de auth abaixo). **`actions:true` desde 13/08/2026** (`chesedActions.js`, 6 ações — deixou de ser só leitura): cadastra pessoa, atualiza informações estruturadas de uma pessoa (interesses/presentes/tópicos pendentes/nota), registra contato (com o mesmo ajuste de "nunca retroceder `ultimoContato`" da UI), cadastra data especial, cria/marca hábito. Antes disso, `buildChesedContext()` só analisava/sugeria, nunca executava nada — texto original abaixo mantido como registro histórico da arquitetura pré-consolidação, não do gap de `actions:false` (que já foi fechado).

**Bug achado e corrigido no processo, fora da lista original de gaps:** `buildChesedContext()` calculava `datas_proximas` filtrando `diasAte(d.data)` direto no campo `data` bruto (o ano original do evento, ex. `1965-07-12` pro aniversário da mãe) — sem projetar pra próxima ocorrência com `proximaAnual()` como a tela do módulo já fazia. Resultado: `diasAte()` de uma data de 1965 dá um número gigante negativo, então o filtro `>=0` **nunca** deixava passar nenhuma data recorrente — o Coach nunca via nenhum aniversário como "próximo", mesmo com datas cadastradas e a tela mostrando "em Xd" corretamente. Corrigido replicando `proximaAnual()` dentro de `coachSkills.js` e mapeando `datasProx` com `.proxima` antes de filtrar, igual ao `ChesedModule.jsx`. Verificado com `buildChesedContext()` chamado direto no console do navegador.

### Coach IA — analítico single-shot (texto histórico, ver nota acima)
```js
const jsonFmt = '{"diagnostico":"texto","pessoa_prioridade":{"nome":"pessoa","por_que":"razao","acao":"o que fazer"},"insight_relacionamentos":"observacao profunda","datas_lembrete":["data importante"],"afirmacao":"frase sobre conexoes"}';
fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"}, /* ... */});
```
🔴 Mesmo bug sistêmico dos outros módulos: **sem `x-api-key`/`anthropic-version`** — ver [[04 Bugs Conhecidos]].

## Auditoria funcional — visão vs. código (09/08/2026, gap fechado em 13/08/2026)
Feita como parte da auditoria cruzada dos 10 módulos (ver [[01 Estado Atual]] e artefato web linkado lá). Visão do usuário: gestor de relacionamento com datas importantes, insights, coordenação de contatos (qualidade e quantidade) e informações importantes sobre as pessoas. **Mais maduro do que a auditoria inicial supunha** — datas importantes ✅, quantidade (`freqIdeal`/`ultimoContato`/`pessoasAtrasadas`) ✅, qualidade (`qualidade` nos registros + campo de "energia" da relação) ✅, informações importantes (`nota` por pessoa + `registros` com conteúdo/insights) ✅. ~~Único gap real: "informações importantes" é hoje uma nota de texto livre por pessoa, não campos estruturados~~ ✅ fechado em 13/08/2026 — ver "Gaps fechados" abaixo.

## Padrão de tema — corrigido em 13/08/2026
Usava `_C` (não `C`) como variável global mutável — mesmo anti-padrão de Geburah/Hod/Tiphareth antes dos respectivos fixes, com nome diferente:
```js
_C = dark ? DARK : LIGHT;
const C = _C;
```
Corrigido com o mesmo padrão `ThemeCtx` (`React.createContext`) já provado nos outros três: `Sheet`/`FI`/`FTA`/`FS`/`Card`/`Bar`/`Badge`/`ScoreRing` ficam em escopo de módulo lendo `useTheme()` (que agora chama `useContext(ThemeCtx)` em vez de retornar a variável mutável — os call sites dentro desses componentes não mudaram); `ChesedModule` calcula `const C` local e monta `<ThemeCtx.Provider value={C}>` (só um ponto de retorno, diferente do Tiphareth).

**Componentes de aba recriados a cada render — corrigido na mesma leva.** `ChedsedTab`, `PessoasTab`, `PessoaPage`, `DatasTab`, `RegistrosTab`, `ConfigTab` eram definidas dentro do componente e renderizadas como `<ChedsedTab/>` etc — 6 ocorrências confirmadas por `eslint` (`react-hooks/static-components`), igual ao Tiphareth. Nenhuma tinha `useState` próprio, então a correção foi só trocar `<X/>` por `X()` nos pontos de despacho.

**Lint noise limpo:** `useRef` importado e nunca usado (removido), 4 ocorrências de `catch(_){}` com parâmetro não usado trocadas por `catch{}` (diferente do `allowEmptyCatch` do `eslint.config.js`, que só cobre catch **sem** parâmetro), um `eslint-disable-next-line react-hooks/exhaustive-deps` órfão removido, função `save` definida em `renderSheet` e nunca usada removida. Depois dessas correções, `eslint` fica só com o padrão pré-existente `react-hooks/set-state-in-effect` no efeito de carregamento inicial do localStorage — mesmo padrão presente em Geburah (2 ocorrências) e Hod (3), não é uma regressão nem algo que os outros módulos corrigiram.

## Persistência (adicionada na integração de 31/07/2026)
Prefixo `lifetree_ches_` — chaves: `pessoas`, `datas`, `registros`, `habits`, `xp`, `dark`, `activeWidgets` (nova, 13/08/2026). O código original em `modules/` não tinha nenhuma persistência (tudo em memória via `useState` com dados seed) — isso foi adicionado durante a integração, seguindo o padrão de Hod/Geburah.

## Gaps fechados — 13/08/2026
Usuário pediu a lista compilada de gaps/bugs do Chesed (mesmo formato do Geburah/Hod/Tiphareth), depois pediu pra resolver todos, sem exclusões.

**Dashboard de widgets customizáveis.** Chesed era o único dos 4 módulos já modernizados sem essa tela — layout da aba principal era fixo. Novo `WIDGET_CATALOG` (5 blocos: Score, Mini Scores, Datas Próximas, Precisam de Atenção, Hábitos de Hoje, todos `defaultOn:true` — nada de novo escondido, só ficou possível desligar) + botão "Personalizar" + `WidgetCustomizer` sheet, mesmo padrão do Geburah/Hod/Tiphareth. Verificado no navegador: desligar "Mini Scores" escondeu o bloco imediatamente sem afetar os outros.

**Seletor de cor e emoji.** Pessoa nova sempre nascia com `cor:ACCENT` fixo (rosa) e o campo emoji era um input de texto livre. Novo `PESSOA_PALETTE` (12 cores, mesmo padrão do `TRACK_PALETTE` do Hod) e `EMOJI_OPTS` (20 emojis curados) como seletores visuais nos formulários de criar/editar pessoa. Verificado no navegador: pessoa nova com emoji e cor customizados aparece corretamente na lista e na página de detalhe.

**Campos estruturados de "informações importantes".** Além da `nota` livre já existente, pessoa ganhou `interesses`, `presentes` (já dados) e `topicosPendentes` — expostos no formulário e num novo card "Informações Importantes" na página da pessoa (só aparece se pelo menos um campo estiver preenchido). `buildChesedContext()` ganhou `pessoas_com_topicos_pendentes` pro Coach trazer à tona proativamente.

**`ultimoContato` não revertia ao apagar registro.** Apagar o registro mais recente de uma pessoa deixava `ultimoContato` "preso" na data do registro apagado — o status "atrasado"/"em dia" ficava mentindo. Novo `delRegistro(id)`: se o registro apagado era exatamente a fonte do `ultimoContato` atual, recalcula a partir do registro restante mais recente da mesma pessoa (ou mantém como está, se não sobrar nenhum — não dá pra inferir um contato real sem prova). Corrigido também um bug irmão no mesmo fluxo: registrar um contato **sempre** sobrescrevia `ultimoContato` com a data do novo registro, mesmo se fosse uma data mais antiga que a atual (backdating derrubava o valor) — agora só avança (`Math.max` implícito via comparação de string `YYYY-MM-DD`). Verificado no navegador: registrar contato hoje pra "Mãe" (85 dias atrasada) mudou o status pra "Em dia"; apagar esse registro reverteu corretamente pra "85d atrás", puxando a data do registro mais antigo restante.

**Coach `actions:true`.** `chesedActions.js` (novo, 6 ações): cadastrar pessoa, atualizar informações estruturadas, registrar contato, cadastrar data especial, criar/marcar hábito. Mesmo mecanismo de sincronização do Yesod/Geburah/Hod/Tiphareth: `useCoachDataSync("chesed", reloadFromStorage)`. Bug do `datasProx` no contexto do Coach descrito acima corrigido na mesma leva. Verificado no navegador: chamando `CHESED_ACTION_HANDLERS.register_contato` direto (via `import()` dinâmico no console) registrou o contato e a tela atualizou sem reload; escrever uma pessoa nova direto em `lifetree_ches_pessoas` e disparar o evento de sync também atualizou a lista ao vivo.

Todas as mudanças verificadas com `npm run build` (limpo) e `eslint` (só o padrão pré-existente `set-state-in-effect`, ver acima) antes da verificação no navegador via `claude-in-chrome`.

## Ver também
- [[03 Módulos (Sefirot)]]
- [[02 Arquitetura]]
- [[04 Bugs Conhecidos]]
- [[05 Geburah]] · [[08 Hod]] · [[06 Tiphareth]] — referência dos padrões mecânicos (`ThemeCtx`, chamada como função) aplicados aqui
- [[11 Plano de Decomposição — Arquivos Monolíticos]]
- [[05 Roadmap]] — P1 #11, "maior gap" do produto (já endereçado, ver auditoria acima)
