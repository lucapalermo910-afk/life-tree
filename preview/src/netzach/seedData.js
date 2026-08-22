// Dado de seed (hobbies/habitos de lazer e lar/tarefas/experiencias) do Netzach - dado puro, sem logica. ACCENT substituido pelo literal ("#84cc16") pra nao criar import circular. Extraido em 21/08/2026 (item 1 do Plano de Decomposicao).

export const D_HOBBIES = [
  {id:"h1",name:"Jogar videogame",cat:"Jogos",freq:"Semanal",lastDone:"",color:"#8b5cf6",note:"RPGs e estratégia"},
  {id:"h2",name:"Cozinhar algo novo",cat:"Gastronomia",freq:"Semanal",lastDone:"",color:"#f97316",note:"Explorar culinárias diferentes"},
  {id:"h3",name:"Caminhar ao ar livre",cat:"Natureza",freq:"Semanal",lastDone:"",color:"#84cc16",note:""},
];
export const D_LAZER_HABITS = [
  {id:"lh1",title:"Fazer algo só por prazer",freq:"Diário",done:false,xp:20},
  {id:"lh2",title:"Desconectar das telas 1h",freq:"Diário",done:false,xp:15},
  {id:"lh3",title:"Encontrar amigos ou família",freq:"Semanal",done:false,xp:30},
];
export const D_TAREFAS = [
  {id:"t1",nome:"Limpar banheiro",cat:"Limpeza",freq:"Semanal",lastDone:"",urgente:false},
  {id:"t2",nome:"Organizar guarda-roupa",cat:"Organização",freq:"Mensal",lastDone:"",urgente:false},
  {id:"t3",nome:"Pagar contas do lar",cat:"Manutenção",freq:"Mensal",lastDone:"",urgente:false},
];
export const D_LAR_HABITS = [
  {id:"lrh1",title:"Manter a cama arrumada",freq:"Diário",done:false,xp:10},
  {id:"lrh2",title:"10 min de organização rápida",freq:"Diário",done:false,xp:10},
  {id:"lrh3",title:"Planta/jardim cuidados",freq:"Semanal",done:false,xp:15},
];
export const D_EXPERIENCIAS = [
  {id:"ex1",titulo:"Ver aurora boreal",cat:"Viagem",status:"sonho",prazo:"",nota:"Noruega ou Islândia",emoji:"🌌"},
  {id:"ex2",titulo:"Morar na Itália",cat:"Viagem",status:"planejando",prazo:"2028-01-01",nota:"Objetivo de vida",emoji:"🇮🇹"},
  {id:"ex3",titulo:"Aprender a fazer macarrão fresco",cat:"Gastronomia",status:"planejando",prazo:"",nota:"",emoji:"🍝"},
  {id:"ex4",titulo:"Assistir jogo do seu time ao vivo",cat:"Esporte",status:"sonho",prazo:"",nota:"",emoji:"⚽"},
];
