// Dado de seed (trilhas de estudo/livros) do Binah - dado puro, sem logica. cor de D_TRACKS inlined do TRACK_PALETTE (que fica no modulo, ainda usado em runtime pra trilhas novas). Extraido em 21/08/2026 (item 1 do Plano de Decomposicao).

export const D_TRACKS = [
  {id:"tr1",name:"Filosofia",color:"#4f46e5",focus:"atual",topics:[
    {id:"tp1",name:"Estoicismo",level:2,target:5,notes:"Ler Meditações de Marco Aurélio"},
  ]},
  {id:"tr2",name:"Programação",color:"#8b5cf6",focus:"atual",topics:[
    {id:"tp2",name:"Python",level:3,target:5,notes:""},
  ]},
];
export const D_LIVROS = [
  {id:"lv1",titulo:"Meditações",autor:"Marco Aurélio",status:"lendo",paginaAtual:45,totalPaginas:220,notas:""},
];
