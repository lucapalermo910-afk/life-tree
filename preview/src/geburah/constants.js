// Constantes de domínio do Geburah, extraídas de GeburahModule.jsx (21/08/2026, item 5
// do [[11 Plano de Decomposição — Arquivos Monolíticos]]).
import { ACCENT, ORANGE, GREEN, AMBER } from "./theme.js";

export const TABS=[{id:"geb",icon:"treelife",label:"Geburah"},{id:"treino",icon:"dumbbell",label:"Treino"},{id:"nutri",icon:"apple",label:"Nutrição"},{id:"planejamento",icon:"calendar",label:"Planejamento"},{id:"medidas",icon:"ruler",label:"Acompanhamento"},{id:"cfg",icon:"gear",label:"Config"}];
export const GRUPOS=["Peito","Costas","Ombros","Bíceps","Tríceps","Antebraço","Pernas","Glúteos","Core","Lombar / Posterior","Pescoço","Artes Marciais","Cardio","Flexibilidade"];
export const CATS_AL=["Frutas","Verduras & Legumes","Carnes Bovinas","Frango","Porco","Peixes & Frutos do Mar","Hambúrgueres","Grãos & Leguminosas","Massas & Cereais","Cereais Matinais","Pães","Laticínios","Ovos","Embutidos & Frios","Oleaginosas","Óleos & Gorduras","Molhos & Temperos","Doces & Sobremesas","Chocolates","Suplementos","Bebidas","Regional BR"];
export const MEDIDAS_P=["Peso","Cintura","Quadril","Peito","Pescoço","Antebraço Dir","Antebraço Esq","Bíceps Dir","Bíceps Esq","Coxa Dir","Coxa Esq","Panturrilha Dir","Panturrilha Esq"];
// Card "Medidas Corporais" fica compacto por padrão (Peso já aparece nos cards de cima,
// então some daqui) — só as 3 clássicas + IMC sempre visíveis; o resto (9 pontos) fica
// atrás de "Ver todas", agrupado por região.
export const MEDIDAS_DESTAQUE=["Cintura","Quadril","Peito"];
export const MEDIDAS_GRUPOS=[
  {l:"Pescoço",pts:["Pescoço"]},
  {l:"Braços",pts:["Antebraço Dir","Antebraço Esq","Bíceps Dir","Bíceps Esq"]},
  {l:"Pernas",pts:["Coxa Dir","Coxa Esq","Panturrilha Dir","Panturrilha Esq"]},
];
export const REFEICOES=["Café da manhã","Lanche","Almoço","Lanche tarde","Jantar","Ceia"];
export const REFEICAO_ITEM_CAP=4; // itens visíveis antes de precisar expandir "ver mais" num card de refeição
export const FOTOS_COLLECTION="geburah_progresso";
export const FOTO_TAGS=["Frente","Lado","Costas"];
export const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];

// Widget catalog
export const WIDGET_CATALOG = [
  {type:"score-geburah",  label:"Score Geburah",    icon:"treelife", color:ACCENT,  desc:"Score geral + sub-scores"},
  {type:"peso-hero",      label:"Peso vs Meta",      icon:"scale",    color:GREEN,   desc:"Pesagem de hoje vs meta do dia"},
  {type:"macros-hoje",    label:"Macros do Dia",     icon:"apple",    color:ORANGE,  desc:"Calorias, proteína, carb, gordura"},
  {type:"agua",           label:"Água",              icon:"droplet",  color:ACCENT,  desc:"Consumo de água do dia"},
  {type:"streak",         label:"Streak de Treinos", icon:"flame",    color:AMBER,   desc:"Dias consecutivos treinando"},
  {type:"treino-hoje",    label:"Treino de Hoje",    icon:"dumbbell", color:ACCENT,  desc:"Rotina sugerida para hoje"},
  {type:"pr-board",       label:"Recordes (PRs)",    icon:"trophy",   color:AMBER,   desc:"Seus recordes de carga"},
  {type:"meta-peso",      label:"Progresso do Peso", icon:"target",   color:GREEN,   desc:"Barra de progresso até a meta"},
  {type:"planejamento",   label:"Plano Semanal",     icon:"calendar", color:ORANGE,  desc:"Refeições planejadas da semana"},
];

export const DEFAULT_LAYOUT = [
  {id:"w1",type:"score-geburah",size:"full"},
  {id:"w2",type:"peso-hero",    size:"full"},
  {id:"w3",type:"macros-hoje",  size:"full"},
  {id:"w4",type:"agua",         size:"half"},
  {id:"w5",type:"streak",       size:"half"},
  {id:"w6",type:"treino-hoje",  size:"full"},
];
