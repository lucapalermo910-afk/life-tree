// Rotinas e receitas padrao do Geburah - dado puro, sem logica. Extraido de GeburahModule.jsx em 21/08/2026 (item 1 do Plano de Decomposicao).

export const D_ROT=[
  {id:"rt1",name:"Treino A — Peito/Tríceps",dias:["Segunda","Quinta"],exercicios:[
    {id:"re1",exercicioId:"e1",series:4,reps:"8-12",carga:60,descanso:90},
    {id:"re2",exercicioId:"e6",series:3,reps:"12-15",carga:25,descanso:60},
    {id:"re3",exercicioId:"e9",series:3,reps:"30s",carga:0,descanso:45},
  ]},
  {id:"rt2",name:"Treino B — Costas/Bíceps",dias:["Terça","Sexta"],exercicios:[
    {id:"re4",exercicioId:"e7",series:4,reps:"8-12",carga:50,descanso:90},
    {id:"re5",exercicioId:"e3",series:3,reps:"5-8",carga:80,descanso:120},
    {id:"re6",exercicioId:"e5",series:3,reps:"10-12",carga:20,descanso:60},
  ]},
  {id:"rt3",name:"Treino C — Pernas",dias:["Quarta","Sábado"],exercicios:[
    {id:"re7",exercicioId:"e2",series:4,reps:"8-12",carga:70,descanso:120},
    {id:"re8",exercicioId:"e8",series:3,reps:"12-15",carga:100,descanso:90},
  ]},
  // Treino D — não substitui A/B/C (ids e1..e10 continuam válidos, com met, e não foram
  // remapeados pra não invalidar PR/histórico de quem já tem dado salvo referenciando
  // esses ids); em vez disso apresenta pra usuários novos, já no dia livre (Domingo),
  // uma amostra da biblioteca de 286 exercícios (musculação + artes marciais) migrada em
  // 09/08/2026 — sem isso, quem nunca abre Treino → Exercícios não descobre que ela existe.
  {id:"rt4",name:"Treino D — Full Body (biblioteca nova)",dias:["Domingo"],exercicios:[
    {id:"re9", exercicioId:"elm3", series:4,reps:"8-12", carga:40,descanso:90},
    {id:"re10",exercicioId:"elm26",series:3,reps:"10-12",carga:30,descanso:90},
    {id:"re11",exercicioId:"elm93",series:4,reps:"10-12",carga:80,descanso:90},
    {id:"re12",exercicioId:"ela157",series:3,reps:"3min",carga:0,descanso:60},
  ]},
];
export const D_REC=[
  {id:"rec1",name:"Bowl de Proteína",  desc:"Pós-treino perfeito",ingredientes:[{alimentoId:"fq09",qtd:150},{alimentoId:"gl02",qtd:100},{alimentoId:"fr05",qtd:80}],steps:["Grelhe o frango temperado","Monte o bowl com o arroz","Adicione a banana fatiada por cima"]},
  {id:"rec2",name:"Mingau de Aveia",   desc:"Café da manhã energético",ingredientes:[{alimentoId:"mc01",qtd:60},{alimentoId:"fr05",qtd:120}],steps:["Misture aveia com 200ml de água ou leite","Cozinhe em fogo médio por 5 minutos","Adicione a banana amassada e sirva"]},
];
