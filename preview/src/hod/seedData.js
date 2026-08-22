// Paleta e dado de seed (trilhas/metas/habitos/conquistas/projetos/marca) do Hod - dado puro, sem logica. Extraido de HodModule.jsx em 21/08/2026 (item 1 do Plano de Decomposicao).

export const TRACK_PALETTE = ["#06b6d4","#ec4899","#8b5cf6","#f97316","#f59e0b","#10b981","#ef4444","#3b82f6","#14b8a6","#6366f1","#84cc16","#f472b6"];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────────────
export const D_TRACKS = [
  {id:"tr1", name:"Discovery & Pesquisa de Usuário",                 color:TRACK_PALETTE[0], focus:"atual", skills:[{id:"sk1",name:"Entrevistas de usuário",level:3,target:5,notes:"Aprofundar em jobs-to-be-done"}]},
  {id:"tr2", name:"UX/UI & Design de Produto",                        color:TRACK_PALETTE[1], focus:"atual", skills:[{id:"sk2",name:"Heurísticas de usabilidade",level:2,target:5,notes:""}]},
  {id:"tr3", name:"Estratégia & Visão de Produto",                    color:TRACK_PALETTE[2], focus:"atual", skills:[{id:"sk3",name:"OKRs e North Star Metric",level:2,target:5,notes:""}]},
  {id:"tr4", name:"Priorização & Roadmap",                            color:TRACK_PALETTE[3], focus:"atual", skills:[{id:"sk4",name:"RICE/ICE e trade-offs técnicos",level:4,target:5,notes:""}]},
  {id:"tr5", name:"Backlog, Histórias & Refino Técnico",              color:TRACK_PALETTE[4], focus:"atual", skills:[{id:"sk5",name:"INVEST e critérios de aceite",level:3,target:5,notes:""}]},
  {id:"tr6", name:"Metodologias Ágeis & Cerimônias",                  color:TRACK_PALETTE[5], focus:"atual", skills:[{id:"sk6",name:"Facilitação de cerimônias",level:3,target:5,notes:""}]},
  {id:"tr7", name:"Liderança de Time & Influência sem Autoridade",    color:TRACK_PALETTE[6], focus:"atual", skills:[{id:"sk7",name:"Liderança sem autoridade",level:3,target:5,notes:""}]},
  {id:"tr8", name:"Dados, Métricas & Experimentação",                 color:TRACK_PALETTE[7], focus:"atual", skills:[{id:"sk8",name:"SQL e análise de funil",level:2,target:5,notes:"Evoluir SQL e análise"}]},
  {id:"tr9", name:"Comunicação com Stakeholders & Storytelling",      color:TRACK_PALETTE[8], focus:"atual", skills:[{id:"sk9",name:"Comunicação com stakeholders",level:3,target:5,notes:""}]},
  {id:"tr10",name:"Fluência Técnica / Capacidade de Dev Própria",     color:TRACK_PALETTE[9], focus:"atual", skills:[{id:"sk10",name:"Ler/escrever código básico",level:2,target:5,notes:""}]},
  {id:"tr11",name:"Modelo de Negócio & Pricing",                      color:TRACK_PALETTE[10],focus:"atual", skills:[{id:"sk11",name:"Unit economics",level:1,target:5,notes:""}]},
  {id:"tr12",name:"Product Marketing & Go-to-Market",                 color:TRACK_PALETTE[11],focus:"atual", skills:[{id:"sk12",name:"Lançamento de features",level:2,target:5,notes:""}]},
];
// Seed alternativo, genérico — o padrão (D_TRACKS acima) é aprofundado em PO/PM porque é
// o caso de uso real de quem construiu o módulo, mas isso deixava quem não é PO/PM sem
// nenhum ponto de partida (gap #4 da auditoria de 09/08/2026, ver [[08 Hod]]). Não troca o
// seed padrão pra não tirar a riqueza de quem já usa — vira uma opção em Config ("Perfil
// de Trilhas") que o usuário escolhe explicitamente pra recomeçar com trilhas universais,
// aplicáveis a qualquer profissão, e edita/renomeia como quiser a partir daí.
export const D_TRACKS_GENERIC = [
  {id:"trg1",name:"Comunicação & Apresentação",              color:TRACK_PALETTE[0],focus:"atual",skills:[{id:"skg1",name:"Apresentar ideias com clareza",level:1,target:5,notes:""}]},
  {id:"trg2",name:"Gestão do Tempo & Produtividade",          color:TRACK_PALETTE[1],focus:"atual",skills:[{id:"skg2",name:"Priorizar tarefas",level:1,target:5,notes:""}]},
  {id:"trg3",name:"Trabalho em Equipe & Liderança",           color:TRACK_PALETTE[2],focus:"atual",skills:[{id:"skg3",name:"Colaborar e delegar",level:1,target:5,notes:""}]},
  {id:"trg4",name:"Ferramentas & Ofício",                     color:TRACK_PALETTE[3],focus:"atual",skills:[{id:"skg4",name:"Domínio das ferramentas do dia a dia",level:1,target:5,notes:"Edite pro seu ofício específico"}]},
  {id:"trg5",name:"Networking & Relacionamento Profissional", color:TRACK_PALETTE[4],focus:"atual",skills:[{id:"skg5",name:"Construir e manter contatos relevantes",level:1,target:5,notes:""}]},
  {id:"trg6",name:"Aprendizado Contínuo & Especialização",    color:TRACK_PALETTE[5],focus:"atual",skills:[{id:"skg6",name:"Estudar e se atualizar na área",level:1,target:5,notes:""}]},
];
export const D_CAR_GOALS = [
  {id:"cg1",title:"Obter certificação PSPO",done:false,prazo:"2026-12-01",xp:150},
  {id:"cg2",title:"Assumir produto estratégico na empresa",done:false,prazo:"2026-09-01",xp:200},
  {id:"cg3",title:"Liderar discovery de nova feature",done:false,prazo:"2026-07-01",xp:100},
];
export const D_CAR_HABITS = [
  {id:"ch1",title:"Ler 20 min sobre produto/gestão",freq:"Diário",done:false,xp:10},
  {id:"ch2",title:"Alinhar expectativas com stakeholders",freq:"Semanal",done:false,xp:20},
  {id:"ch3",title:"Registrar uma conquista ou aprendizado",freq:"Semanal",done:false,xp:15},
];
export const D_ACHIEVEMENTS = [
  {id:"ach1",date:"2026-04-10",title:"Lançamento do produto X com 30% acima da meta","impact":"Alto"},
  {id:"ach2",date:"2026-03-01",title:"Reduziu tempo de discovery em 40%","impact":"Alto"},
];
export const D_PROJECTS = [
  {
    id:"pj1", name:"Professor Particular", type:"servico", phase:"operacao",
    canvas:{targetAudience:"Estudantes de vestibular", offer:"Aulas de matemática e física", deliveryFormat:"Online, 1:1", differentiator:"Material próprio por tema"},
    plan:[{id:"pl1",topic:"Criar perfil no Superprof",status:"pendente"},{id:"pl2",topic:"Montar banco de exercícios por tema",status:"pendente"}],
    experiments:[], learnings:[],
    price:120, goal:3000, revenueHistory:[],
    clients:[
      {id:"cl1",name:"Pedro",contact:"",freq:"2x semana",since:"2026-01-15",active:true,goal:"Passar no vestibular",progressNote:"",plan:[],sessions:[],lastFeedback:null},
      {id:"cl2",name:"Ana",contact:"",freq:"1x semana",since:"2026-03-01",active:true,goal:"",progressNote:"",plan:[],sessions:[],lastFeedback:null},
    ],
    nextStep:"Criar perfil no Superprof",
    habits:[{id:"ph1",title:"Preparar material das aulas",freq:"Semanal",xp:15,done:false},{id:"ph2",title:"Pedir feedback aos alunos",freq:"Mensal",xp:20,done:false}],
  },
  {
    id:"pj2", name:"Despachante Digital Europa", type:"negocio", phase:"exploracao",
    canvas:{targetAudience:"Brasileiros emigrando ou já na Europa", valueProp:"Simplificar burocracia europeia à distância, em português", revenueModel:"Taxa por serviço ou assinatura mensal", market:"Itália"},
    plan:[],
    experiments:[
      {id:"e1",title:"Conversar com 5 brasileiros que foram para Europa",status:"andamento",prazo:"2026-07-01"},
      {id:"e2",title:"Mapear os 3 processos burocráticos mais dolorosos",status:"nao_iniciado",prazo:"2026-08-01"},
    ],
    learnings:[
      {id:"l1",date:"2026-05-01",text:"Alta demanda em grupos de brasileiros na Itália no Facebook",positive:true},
      {id:"l2",date:"2026-05-10",text:"Regulação para despachantes varia por país — precisa pesquisar",positive:false},
    ],
    price:0, goal:0, revenueHistory:[],
    clients:[],
    nextStep:"Entrevistar 5 brasileiros que foram para a Itália nos últimos 2 anos",
    habits:[],
  },
];
export const D_BRAND = {
  pillars:["PO/PM","Educação","Imigração para Europa"],
  channels:[
    {id:"bc1",name:"LinkedIn",active:true,followers:0,goal:1000,freq:"2x semana",notes:"Foco em carreira e produto",followerHistory:[]},
    {id:"bc2",name:"Instagram",active:false,followers:0,goal:500,freq:"",notes:"",followerHistory:[]},
  ],
  contentPlan:[
    {id:"cp1",title:"Jornada de um PO: o que aprendi em X anos",format:"Texto/Post",channel:"LinkedIn",status:"ideia",prazo:"2026-07-01"},
    {id:"cp2",title:"Como é se preparar para morar na Itália",format:"Texto/Post",channel:"LinkedIn",status:"ideia",prazo:"2026-08-01"},
  ],
  habits:[
    {id:"bh1",title:"Publicar um conteúdo",freq:"Semanal",done:false,xp:25},
    {id:"bh2",title:"Comentar em 5 posts relevantes",freq:"Semanal",done:false,xp:10},
    {id:"bh3",title:"Responder todos os comentários recebidos",freq:"Semanal",done:false,xp:10},
  ],
};


