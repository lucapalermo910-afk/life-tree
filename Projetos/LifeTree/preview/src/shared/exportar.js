// Exportar e compartilhar (06/11/2026, pedido do usuário): plano do objetivo em .md e backup
// completo em .json. No celular abre o "Compartilhar" do sistema (WhatsApp, e-mail, Arquivos);
// sem suporte, baixa o arquivo.

export async function compartilharArquivo(nome, conteudo, tipo = "text/markdown") {
  const blob = new Blob([conteudo], { type: tipo + ";charset=utf-8" });
  try {
    const arquivo = new File([blob], nome, { type: tipo });
    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], title: nome });
      return "compartilhado";
    }
  } catch (e) {
    if (e?.name === "AbortError") return "cancelado";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "baixado";
}

const dataBR = (s) => (s ? s.split("-").reverse().join("/") : "");
const dataCurta = (s) => (s ? s.slice(8, 10) + "/" + s.slice(5, 7) : "");
const n = (x) => Number(x).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export const nomeArquivo = (titulo, ext) =>
  (titulo || "plano").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "." + ext;

// o = objetivo salvo. extras (opcionais, calculados por quem chama): area, krs, dieta, macros,
// treino (meta em vigor), totais, marco(periodo) → texto, fimDaEtapa(i) → ISO.
export function planoParaMarkdown(o, extras = {}) {
  const { area, krs, dieta, macros, treino, totais, marco, fimDaEtapa } = extras;
  const L = [];
  L.push("# " + o.title, "");
  const meta = [area && "**Área:** " + area, o.prazo && "**Prazo:** " + dataBR(o.prazo), o.criado && "**Criado em:** " + dataBR(o.criado)].filter(Boolean);
  if (meta.length) L.push(meta.join(" · "), "");
  if (o.descricao) L.push("## O objetivo", "", o.descricao, "");

  if (krs) {
    L.push("## Resultados-chave", "");
    if (dieta?.peso_kg && dieta?.peso_meta_kg) L.push("- Peso: " + n(dieta.peso_kg) + " kg → " + n(dieta.peso_meta_kg) + " kg");
    L.push("- Treinos feitos do planejado: ≥ " + krs.treino_pct + "%");
    if (macros) L.push("- Dias dentro da dieta: ≥ " + krs.dieta_pct + "%");
    if (krs.gordura_pct) L.push("- % de gordura: ≤ " + n(krs.gordura_pct) + "%");
    L.push("");
  }
  if (treino) {
    L.push("## Metas de treino" + (treino.fase != null ? " (etapa " + (treino.fase + 1) + ")" : ""), "");
    L.push("- Treinos na semana: " + treino.treinos_semana, "- Cardio na semana: " + treino.cardio_min_semana + " min", "- Tipo de treino: " + treino.divisao);
    if (totais) L.push("- Total até o prazo: " + totais.treinos + " treinos e " + n(totais.cardio) + " min de cardio");
    L.push("");
  }
  if (macros?.ok) {
    L.push("## Metas de dieta (por dia)", "");
    L.push("- Calorias: " + n(macros.cal) + " kcal", "- Proteína: " + macros.prot + " g", "- Carboidrato: " + macros.carb + " g", "- Gordura: " + macros.gord + " g");
    if (macros.kgSemana) L.push("- Ritmo: " + Number(macros.kgSemana).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " kg por semana");
    L.push("");
  }

  const steps = o.plano?.steps || [];
  if (steps.length) {
    L.push("## Linha do tempo", "");
    steps.forEach((s, i) => {
      const m = String(s.title || "").match(/^([^:]{3,40}):\s*(.*)$/s);
      const periodo = m ? m[1].trim() : "", nome = m ? m[2].trim() : String(s.title || "").trim();
      L.push("### Etapa " + (i + 1) + (periodo ? " · " + periodo : ""), "");
      if (nome) L.push(nome, "");
      if (s.semana) L.push("**Na semana:** " + s.semana.treinos_semana + " treinos (" + s.semana.divisao.split("").join("·") + ")" + (s.semana.cardio_min_semana ? " · " + s.semana.cardio_min_semana + " min de cardio" : ""), "");
      if (s.tarefas?.length) {
        L.push("**Tarefas:**", "");
        s.tarefas.forEach((t) => L.push("- [" + (t.done ? "x" : " ") + "] " + t.texto + (t.ate ? " · até " + dataCurta(t.ate) : "")));
        L.push("");
      }
      const fim = fimDaEtapa ? fimDaEtapa(i) : null;
      if (s.revisao) L.push("**Revisão" + (fim ? " em " + dataCurta(fim) : "") + ":** " + s.revisao, "");
      const mk = marco && periodo ? marco(periodo) : null;
      if (mk) L.push("**" + mk + "**", "");
    });
  }
  const lista = (titulo, itens, marca = "- ") => { if (itens?.length) { L.push("## " + titulo, ""); itens.filter(Boolean).forEach((t) => L.push(marca + t)); L.push(""); } };
  lista("Rotina", o.plano?.rotina || (o.plano?.habitoSugerido ? [o.plano.habitoSugerido] : []));
  lista("Impacto positivo", o.plano?.impactoPositivo);
  lista("Pontos de atenção", o.plano?.impactoNegativo);

  const ts = steps.flatMap((s) => s.tarefas || []);
  if (ts.length) L.push("---", "", "Execução: " + ts.filter((t) => t.done).length + " de " + ts.length + " tarefas feitas.", "");
  L.push("_Exportado do LifeTree em " + new Date().toLocaleDateString("pt-BR") + "._");
  return L.join("\n");
}

// ── Backup completo ─────────────────────────────────────────────────────────────────
// Antes (até 06/11/2026) o backup só levava áreas, diário, widgets e finScore: objetivos,
// planos, metas, perfil e tudo dos módulos (chaves lifetree_*) ficavam de fora.
export function lerModulos() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("lifetree_")) out[k] = localStorage.getItem(k);
  }
  return out;
}

export function restaurarModulos(modulos) {
  let n = 0;
  Object.entries(modulos || {}).forEach(([k, v]) => {
    if (k.startsWith("lifetree_") && typeof v === "string") { localStorage.setItem(k, v); n++; }
  });
  return n;
}
