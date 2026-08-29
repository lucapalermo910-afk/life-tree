// Dado de seed (pessoas/datas/registros/habitos) do Chesed - dado quase puro (2 pontos usam todayS() pra semear "hoje", replicado localmente pra nao criar import circular com ChesedModule.jsx). Extraido em 21/08/2026 (item 1 do Plano de Decomposicao).

const todayS = () => new Date().toISOString().slice(0,10);

export const SEED_PESSOAS = [
  {id:"p1",nome:"Mãe",emoji:"👩",tipo:"Família",freqIdeal:7, ultimoContato:"2026-05-20",energia:"positiva",nota:"Ligar toda semana",cor:"#f97316",interesses:"Jardinagem, novelas, viagens em família",presentes:"Perfume (aniversário 2025)",topicosPendentes:"Perguntar como foi a consulta médica"},
  {id:"p2",nome:"Lucas",emoji:"🤝",tipo:"Amigo próximo",freqIdeal:14,ultimoContato:"2026-05-15",energia:"positiva",nota:"Gosta de jogar",cor:"#8b5cf6",interesses:"Jogos, futebol, churrasco",presentes:"",topicosPendentes:"Ver como ele está no trabalho"},
  {id:"p3",nome:"Ana",emoji:"❤️",tipo:"Casal",freqIdeal:1, ultimoContato:todayS(),energia:"positiva",nota:"Presente no dia a dia",cor:"#ec4899",interesses:"Cinema, culinária, trilhas",presentes:"",topicosPendentes:""},
  {id:"p4",nome:"Pai",emoji:"👨",tipo:"Família",freqIdeal:7, ultimoContato:"2026-05-10",energia:"positiva",nota:"",cor:"#06b6d4",interesses:"",presentes:"",topicosPendentes:""},
];
export const SEED_DATAS = [
  {id:"dt1",nome:"Aniversário da Mãe",pessoaId:"p1",data:"1965-07-12",tipo:"Aniversário",recorrente:true,lembrete:7},
  {id:"dt2",nome:"Aniversário do Lucas",pessoaId:"p2",data:"1993-09-22",tipo:"Aniversário",recorrente:true,lembrete:7},
  {id:"dt3",nome:"Aniversário da Ana",pessoaId:"p3",data:"1995-03-15",tipo:"Aniversário",recorrente:true,lembrete:14},
  {id:"dt4",nome:"Aniversário de namoro",pessoaId:"p3",data:"2022-11-08",tipo:"Aniversário de namoro/casamento",recorrente:true,lembrete:14},
];
export const SEED_REGISTROS = [
  {id:"r1",pessoaId:"p1",data:"2026-05-20",tipo:"Conversa",conteudo:"Falamos sobre os planos para a viagem. Ela ficou animada mas preocupada.",qualidade:4},
  {id:"r2",pessoaId:"p2",data:"2026-05-15",tipo:"Encontro",conteudo:"Jogamos por 2h. Ele está passando por uma fase complicada no trabalho.",qualidade:3},
  {id:"r3",pessoaId:"p3",data:todayS(),tipo:"Conversa",conteudo:"Conversa profunda sobre nossos planos futuros.",qualidade:5},
];
export const SEED_HABITS = [
  {id:"rh1",title:"Mandar mensagem para alguém que importa",freq:"Diário",done:false,xp:15},
  {id:"rh2",title:"Ligar para família",freq:"Semanal",done:false,xp:25},
  {id:"rh3",title:"Planejar encontro com amigos",freq:"Mensal",done:false,xp:30},
];

