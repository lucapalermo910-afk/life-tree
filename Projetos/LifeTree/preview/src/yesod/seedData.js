// Dado de seed (bancos/contas/cartoes/caixinhas/dividas/categorias de investimento) do Yesod - dado puro, sem logica. CASH_ACC_ID e ACCENT substituidos pelos literais ("cash-wallet"/"#10b981") pra nao criar import circular com YesodModule.jsx, que define os dois pra uso proprio em logica (nao so seed). Extraido em 21/08/2026 (item 1 do Plano de Decomposicao).

// Seed de demonstração removido em 31/08/2026 (pedido do usuário — nova versão precisa
// iniciar 100% em branco, sem dado mockado, pra onboarding real desde o primeiro uso).
// Carteira virtual continua nascendo sozinha mesmo com D_ACCS=[] (useEffect de segurança em
// context.js já garante isso). ICAT é taxonomia de categoria de investimento — catálogo, não
// dado de usuário — continua populado.
export const D_BANKS = [];
export const D_ACCS = [];
export const D_CARDS = [];
export const D_BOXES = [];
export const D_DEBTS = [];
export const ICAT = [{id:"rf",label:"Renda Fixa",color:"#10b981",sub:[{id:"rf_pub",label:"Títulos Públicos"},{id:"rf_priv",label:"Títulos Privados"},{id:"rf_fund",label:"Fundos RF"}]},{id:"rv",label:"Renda Variável",color:"#ef4444",sub:[{id:"rv_ac",label:"Ações"},{id:"rv_fii",label:"FIIs"},{id:"rv_etf",label:"ETFs"}]},{id:"mm",label:"Multimercado",color:"#8b5cf6",sub:[{id:"mm_f",label:"Fundos MM"}]},{id:"int",label:"Internacional",color:"#f97316",sub:[{id:"int_b",label:"BDRs"},{id:"int_e",label:"ETFs Globais"}]}];
export const D_INVS = [];
