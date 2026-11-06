// Identifica a área de vida de um objetivo escrito livremente (05/11/2026).
// O Desejo/Kether deixou de pedir que o usuário escolha a área em etiquetas: o app sugere a
// área enquanto ele escreve e mostra "Vai para: X · Trocar". Classificação local por palavras,
// instantânea e sem custo de API; quando erra ou não reconhece, o usuário troca com um toque.
// Propositalmente separada das keywords de roteamento do Coach (coachSkills.js), que têm outro
// papel (desviar uma pergunta para outro módulo) e não devem crescer por causa disto.

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Ordem importa no empate: a primeira área com mais acertos vence.
export const AREAS = [
  {
    id: "geburah", label: "Saúde", color: "#ef4444", comPlano: true,
    msg: (t) => "Quero criar o objetivo de saúde/treino: " + t,
    palavras: ["saude", "treino", "treinar", "academia", "musculacao", "emagrecer", "perder peso", "perder barriga", "barriga", "peso",
      "kg", "quilo", "gordura", "cintura", "correr", "corrida", "km", "maratona", "caminhar", "caminhada", "nadar", "natacao", "pedalar",
      "bicicleta", "ciclismo", "dieta", "alimentacao", "comer", "proteina", "massa muscular", "hipertrofia", "forca", "condicionamento",
      "flexibilidade", "alongar", "yoga", "pilates", "crossfit", "luta", "jiu", "muay", "boxe", "fisico", "shape", "abdomen", "agua"],
  },
  {
    id: "yesod", label: "Finanças", color: "#10b981", comPlano: true,
    msg: (t) => "Quero criar o objetivo: " + t,
    palavras: ["dinheiro", "financ", "juntar", "poupar", "poupanca", "economizar", "guardar", "reserva", "emergencia", "investir",
      "investimento", "aposentar", "independencia financeira", "divida", "quitar", "cartao", "emprestimo", "financiamento", "renda",
      "salario", "gastar menos", "gastos", "orcamento", "patrimonio", "comprar", "carro", "casa", "apartamento", "imovel", "viagem",
      "r$", "reais", "mil", "acoes", "tesouro", "cdb", "fii", "cripto"],
  },
  {
    id: "hod", label: "Profissional", color: "#f97316", comPlano: false,
    palavras: ["emprego", "vaga", "carreira", "promocao", "trabalho", "cargo", "curriculo", "cv", "linkedin", "entrevista",
      "empresa", "negocio", "cliente", "freelance", "canal", "youtube", "projeto", "lancar", "produto", "certificacao"],
  },
  {
    id: "binah", label: "Conhecimento", color: "#4f46e5", comPlano: false,
    palavras: ["aprender", "estudar", "curso", "idioma", "ingles", "italiano", "espanhol", "frances", "ler", "livro", "livros",
      "faculdade", "mestrado", "prova", "certificado"],
  },
  {
    id: "tiphareth", label: "Autocuidado", color: "#eab308", comPlano: false,
    palavras: ["dormir", "sono", "meditar", "meditacao", "ansiedade", "estresse", "descansar", "terapia", "autocuidado", "pele", "rotina matinal"],
  },
  {
    id: "chesed", label: "Relacionamentos", color: "#ec4899", comPlano: false,
    palavras: ["amigo", "amigos", "familia", "namor", "casamento", "esposa", "marido", "filho", "filha", "relacionamento", "pais"],
  },
];

/** Devolve a área mais provável, ou null se nenhuma palavra bater. */
export function sugerirArea(texto) {
  const t = norm(texto);
  let melhor = null;
  let pontos = 0;
  for (const a of AREAS) {
    // Palavra precisa começar numa fronteira ("mil" não pode casar dentro de "família"),
    // mas pode ser prefixo ("financ" casa "finanças" e "financeiro"). Número colado conta como
    // fronteira (06/11/2026): "75kg", "5km" e "30mil" eram ignorados.
    const n = a.palavras.filter((p) => new RegExp("(^|[^a-z])" + p.replace(/[$.*+?()[\]{}|\\^]/g, "\\$&")).test(t)).length;
    if (n > pontos) { melhor = a; pontos = n; }
  }
  return melhor;
}
