// Constantes de domínio do Hod, extraídas de HodModule.jsx (22/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { ACCENT } from "./theme.js";

export const TABS = [
  {id:"hod",      icon:"treelife", label:"Hod"},
  {id:"carreira", icon:"monitor",  label:"Carreira"},
  {id:"projetos", icon:"rocket",   label:"Projetos"},
  {id:"marca",    icon:"globe",    label:"Marca"},
  {id:"cfg",      icon:"gear",     label:"Config"},
];

export const CONTENT_FORMATS = ["Texto/Post","Artigo longo","Vídeo","Newsletter","Podcast","Evento","Outro"];
export const CHANNELS = ["LinkedIn","Instagram","YouTube","Blog","TikTok","Twitter/X","Outro"];

// ── TRILHAS DE COMPETÊNCIA ─────────────────────────────────────────────────
export const FOCUS_META = {
  atual:      {label:"Foco Atual",  color:ACCENT},
  explorando: {label:"Explorando",  color:"#3b82f6"},
  arquivada:  {label:"Arquivada",   color:"#64748b"},
};
export const FOCUS_OPTS = [{v:"atual",l:"Foco Atual"},{v:"explorando",l:"Explorando"},{v:"arquivada",l:"Arquivada"}];

// ── MOTOR DE PROJETOS UNIFICADO ─────────────────────────────────────────────
export const PROJECT_TYPES = [
  {id:"negocio", label:"Negócio",  color:"#8b5cf6"},
  {id:"produto", label:"Produto",  color:"#3b82f6"},
  {id:"conteudo",label:"Conteúdo", color:"#ec4899"},
  {id:"servico", label:"Serviço",  color:"#06b6d4"},
  {id:"outro",   label:"Outro",    color:"#64748b"},
];
export const PHASES_BY_TYPE = {
  negocio: [
    {id:"exploracao",  label:"Exploração",   desc:"Gerando e testando hipóteses"},
    {id:"validacao",   label:"Validação",    desc:"Confirmando que existe mercado"},
    {id:"estruturacao",label:"Estruturação", desc:"Construindo a operação base"},
    {id:"escala",      label:"Escala",       desc:"Crescendo com o que funciona"},
  ],
  produto: [
    {id:"concepcao", label:"Concepção",    desc:"Definindo problema e solução"},
    {id:"mvp",       label:"MVP",          desc:"Construindo a primeira versão"},
    {id:"beta",      label:"Beta/Feedback",desc:"Testando com usuários reais"},
    {id:"lancamento",label:"Lançamento",   desc:"Disponibilizando pra todos"},
    {id:"iteracao",  label:"Iteração",     desc:"Evoluindo com base em uso real"},
  ],
  conteudo: [
    {id:"ideacao",     label:"Ideação",     desc:"Definindo tema e formato"},
    {id:"piloto",      label:"Piloto",      desc:"Primeiros conteúdos publicados"},
    {id:"consistencia",label:"Consistência",desc:"Publicando com regularidade"},
    {id:"crescimento", label:"Crescimento", desc:"Expandindo audiência"},
  ],
  servico: [
    {id:"concepcao", label:"Concepção",       desc:"Definindo a oferta"},
    {id:"oferta",    label:"Oferta Estruturada",desc:"Formato e preço definidos"},
    {id:"piloto",    label:"Piloto",          desc:"Primeiros clientes"},
    {id:"operacao",  label:"Operação",        desc:"Atendendo com regularidade"},
    {id:"escala",    label:"Escala",          desc:"Crescendo a base de clientes"},
  ],
  outro: [
    {id:"planejamento",label:"Planejamento",desc:"Organizando o que precisa ser feito"},
    {id:"execucao",    label:"Execução",    desc:"Colocando em prática"},
    {id:"revisao",     label:"Revisão",     desc:"Avaliando resultado"},
  ],
};
export const CANVAS_FIELDS_BY_TYPE = {
  negocio:  [{k:"targetAudience",l:"Público-alvo"},{k:"valueProp",l:"Proposta de valor"},{k:"revenueModel",l:"Modelo de receita"},{k:"market",l:"País/Mercado"}],
  produto:  [{k:"problem",l:"Problema a resolver"},{k:"targetUser",l:"Usuário-alvo"},{k:"successMetric",l:"Métrica de sucesso"},{k:"stack",l:"Stack/Dependências"}],
  conteudo: [{k:"topic",l:"Tema/Nicho"},{k:"format",l:"Formato"},{k:"freq",l:"Frequência planejada"},{k:"differentiator",l:"Diferencial"}],
  servico:  [{k:"targetAudience",l:"Público-alvo"},{k:"offer",l:"O que a oferta inclui"},{k:"deliveryFormat",l:"Formato de entrega"},{k:"differentiator",l:"Diferencial"}],
  outro:    [{k:"desc",l:"Descrição"}],
};
// Critérios sugeridos de avanço de fase — antes só existiam pro type:"negocio" (os outros
// 4 tipos avançavam de fase num clique, sem checklist de evidência, mesmo o Coach já
// estando instruído a confrontar fase declarada com evidência). Generalizado em 13/08/2026
// pros 5 tipos — ver [[08 Hod]], gap #2 da "Auditoria pós-implementação".
export const CRITERIA_BY_TYPE = {
  negocio: [
    {to:"Validação",         items:["Pelo menos 3 experimentos concluídos","Pelo menos 1 aprendizado registrado","Problema validado com potenciais clientes"]},
    {to:"Estruturação",      items:["Pelo menos 1 cliente ativo","Modelo de receita definido no canvas","Processo de entrega documentado"]},
    {to:"Escala",            items:["Receita recorrente nos últimos 3 meses","Operação não depende só de você","Métricas de crescimento positivas"]},
  ],
  produto: [
    {to:"MVP",               items:["Problema e usuário-alvo definidos no canvas","Pelo menos 1 experimento concluído","Escopo do MVP definido (próximo passo preenchido)"]},
    {to:"Beta/Feedback",     items:["Pelo menos 1 aprendizado registrado","Métrica de sucesso definida no canvas","Pelo menos 3 experimentos concluídos"]},
    {to:"Lançamento",        items:["Pelo menos 3 aprendizados de usuários reais","Pelo menos 2 experimentos concluídos","Sem bloqueios críticos conhecidos"]},
    {to:"Iteração",          items:["Lançado e em uso por usuários reais","Métrica de sucesso sendo acompanhada","Hábito de manutenção/evolução ativo"]},
  ],
  conteudo: [
    {to:"Piloto",            items:["Tema/nicho e formato definidos no canvas","Frequência planejada definida","Primeiro item no plano/roteiro"]},
    {to:"Consistência",      items:["Pelo menos 3 itens do plano concluídos","Pelo menos 1 aprendizado registrado","Hábito de publicação ativo"]},
    {to:"Crescimento",       items:["Hábito de publicação em dia","Pelo menos 5 aprendizados registrados","Canal vinculado em Marca Pessoal"]},
  ],
  servico: [
    {to:"Oferta Estruturada",items:["Público-alvo e diferencial definidos no canvas","Formato de entrega definido","Pelo menos 1 aprendizado sobre demanda"]},
    {to:"Piloto",            items:["Valor unitário (preço) definido","Pelo menos 1 item no plano/roteiro","Pronto pra primeiros clientes"]},
    {to:"Operação",          items:["Pelo menos 1 cliente ativo","Pelo menos 1 sessão registrada","Feedback positivo de algum cliente"]},
    {to:"Escala",            items:["Receita recorrente nos últimos 3 meses","Pelo menos 3 clientes ativos","Processo de entrega documentado (plano preenchido)"]},
  ],
  outro: [
    {to:"Execução",          items:["Descrição preenchida no canvas","Próximo passo definido","Pelo menos 1 item no plano"]},
    {to:"Revisão",           items:["Todos os itens do plano concluídos","Hábito de execução ativo","Pronto pra avaliar o resultado"]},
  ],
};
