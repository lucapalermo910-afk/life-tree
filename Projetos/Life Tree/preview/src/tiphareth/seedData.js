// Dado de seed (habitos de aparencia/bem-estar, rotinas, metas, produtos) do Tiphareth - dado puro, sem logica. Extraido de TipharethModule.jsx em 21/08/2026 (item 1 do Plano de Decomposicao).

export const D_APARENCIA_HABITS=[
  {id:"ah1",title:"Skincare matinal",freq:"Diário",done:false,area:"aparencia",xp:15},
  {id:"ah2",title:"Skincare noturno",freq:"Diário",done:false,area:"aparencia",xp:15},
  {id:"ah3",title:"Cuidar das unhas",freq:"Semanal",done:false,area:"aparencia",xp:10},
  {id:"ah4",title:"Cuidar do cabelo",freq:"Semanal",done:false,area:"aparencia",xp:10},
];
export const D_BEMESTAR_HABITS=[
  {id:"bh1",title:"10 min só para mim",freq:"Diário",done:false,area:"bemestar",xp:20},
  {id:"bh2",title:"Fazer algo prazeroso",freq:"Semanal",done:false,area:"bemestar",xp:25},
  {id:"bh3",title:"Escrever 3 coisas que gosto em mim",freq:"Semanal",done:false,area:"bemestar",xp:20},
];
export const D_ROTINAS=[
  {id:"r1",name:"Rotina Matinal",time:"manhã",steps:[
    {id:"rs1",title:"Lavar o rosto",done:false,min:2},
    {id:"rs2",title:"Tônico",done:false,min:1},
    {id:"rs3",title:"Hidratante",done:false,min:2},
    {id:"rs4",title:"Protetor solar",done:false,min:2},
  ]},
  {id:"r2",name:"Rotina Noturna",time:"noite",steps:[
    {id:"rs6",title:"Double cleanse",done:false,min:5},
    {id:"rs7",title:"Sérum",done:false,min:2},
    {id:"rs8",title:"Hidratante noturno",done:false,min:2},
  ]},
];
export const D_GOALS=[
  {id:"g1",title:"Manter rotina 30 dias",area:"aparencia",done:false,xp:150},
  {id:"g2",title:"Ritual de spa em casa",area:"bemestar",done:false,xp:100},
  {id:"g3",title:"Montar kit de skincare",area:"aparencia",done:false,xp:80},
];
export const D_PRODUTOS=[
  {id:"p1",name:"Sabonete CeraVe",category:"Limpeza",freq:"2x dia",notes:""},
  {id:"p2",name:"Hidratante La Roche",category:"Hidratação",freq:"2x dia",notes:""},
  {id:"p3",name:"Protetor Solar FPS50",category:"Proteção",freq:"manhã",notes:""},
];
