// Constantes de domínio do Geburah, extraídas de GeburahModule.jsx (21/08/2026, item 5
// do [[11 Plano de Decomposição — Arquivos Monolíticos]]).

// Ordem das abas alterada em 30/08/2026 (pedido do usuário): Árvore, Nutrição, Treino,
// Acompanhamento, Objetivos, Config. "Planejamento" foi tirada da barra (mas
// PlanejamentoTab continua existindo em GeburahModule.jsx, só ficou inacessível por nav —
// decisão de manter o código por enquanto, pra reavaliar depois das outras mudanças).
export const TABS=[{id:"geb",icon:"treelife",label:"Geburah"},{id:"nutri",icon:"apple",label:"Nutrição"},{id:"treino",icon:"dumbbell",label:"Treino"},{id:"medidas",icon:"ruler",label:"Acompanhamento"},{id:"objetivos",icon:"target",label:"Objetivos"},{id:"cfg",icon:"gear",label:"Config"}];
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

// Unidades de medida culinárias (31/08/2026, tela de busca de alimento) — peso estimado
// genérico por unidade, não específico por alimento (não temos densidade por item na
// biblioteca). Valores de referência comuns em receitas brasileiras; ficam rotulados como
// estimativa na UI. Tamanho P/M/G é relativo à porção-base do próprio alimento (al.porcao
// se existir, senão 100g), não um peso fixo — ver unidadesDoAlimento em NutriTab.jsx.
export const UNIDADES_MEDIDA=[
  {id:"colherSopa",label:"Colher de sopa",gramas:15},
  {id:"colherSobremesa",label:"Colher de sobremesa",gramas:10},
  {id:"colherCafe",label:"Colher de café",gramas:3},
  {id:"colherCha",label:"Colher de chá",gramas:6},
  {id:"xicara",label:"Xícara",gramas:120},
  {id:"copo",label:"Copo",gramas:200},
];
export const TAMANHOS_PORCAO=[
  {id:"P",label:"Pequeno",fator:0.7},
  {id:"M",label:"Médio",fator:1},
  {id:"G",label:"Grande",fator:1.4},
];
export const FOTOS_COLLECTION="geburah_progresso";
export const FOTO_TAGS=["Frente","Lado","Costas"];
export const DIAS_SEMANA=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];

// WIDGET_CATALOG/DEFAULT_LAYOUT (dashboard customizável) removidos em 30/08/2026 — usuário
// pediu pra tirar o "Customizar": o dashboard do Geburah virou layout fixo (score, peso,
// macros, treino), ver GebTab em GeburahModule.jsx.
