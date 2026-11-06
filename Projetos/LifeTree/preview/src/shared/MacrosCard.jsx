// Cartão das metas de dieta calculadas por shared/macros.js (05/11/2026). Usado na
// pré-visualização do plano (App.jsx) e no objetivo salvo (geburah/ObjetivosTab.jsx).
const fmt = (n) => Number(n).toLocaleString("pt-BR");

// Edição (06/11/2026): no modo de edição do plano o cartão vira calculadora. O usuário ajusta
// os dados (peso atual, peso-meta, treinos por semana) e as alavancas (perda por semana,
// calorias, proteína); quem chama recalcula com calcularMacros e devolve o novo `m`.
// onChange(campo, valor) com campo em: peso_kg, peso_meta_kg, treinos_semana, kgSemana, cal, prot.
export function MacrosCard({ C, m, prazo, accent = "#ef4444", editando = false, onChange = null, dieta = null }) {
  if (!m) return null;
  const semanasAtePrazo = prazo ? Math.floor((new Date(prazo + "T00:00:00") - new Date(new Date().toDateString())) / (7 * 86400000)) : null;
  const prazoCurto = m.semanas != null && semanasAtePrazo != null && m.semanas > semanasAtePrazo;
  const dec = (n) => String(n).replace(".", ",");
  const caixa = { flex: 1, minWidth: 0, background: C.surface || C.card, borderRadius: 10, padding: "8px 6px", textAlign: "center" };
  const valor = (rot, val, un) => (
    <div style={caixa}>
      <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{fmt(val)}<span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}> {un}</span></div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{rot}</div>
    </div>
  );
  const campo = (rot, k, val, un, passo = 1) => (
    <div style={caixa}>
      <input type="number" inputMode="decimal" min="0" step={passo} value={val ?? ""} aria-label={rot + " (" + un + ")"}
        onChange={(e) => onChange(k, e.target.value === "" ? null : Number(e.target.value))}
        style={{ width: "100%", boxSizing: "border-box", textAlign: "center", fontSize: 16, fontWeight: 900, color: C.text, background: C.card,
          border: "1.5px solid " + accent + "66", borderRadius: 8, padding: "4px 2px", outline: "none", fontFamily: "inherit" }} />
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>{rot} ({un})</div>
    </div>
  );
  const aviso = (txt) => <div style={{ fontSize: 11, color: "#d97706", fontWeight: 700, marginTop: 6, lineHeight: 1.45 }}>{txt}</div>;
  const sub = (txt) => <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: C.muted, margin: "10px 0 6px" }}>{txt}</div>;
  const ed = editando && onChange;

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: accent, marginBottom: 8 }}>{m.ajustado ? "METAS DE DIETA (AJUSTADAS POR VOCÊ)" : "METAS DE DIETA (CALCULADAS PELO APP)"}</div>

      {ed && dieta && (
        <>
          {sub("SEUS DADOS")}
          <div style={{ display: "flex", gap: 6 }}>
            {campo("Peso atual", "peso_kg", dieta.peso_kg, "kg", 0.1)}
            {campo("Peso-meta", "peso_meta_kg", dieta.peso_meta_kg, "kg", 0.1)}
            {campo("Treinos", "treinos_semana", dieta.treinos_semana, "/sem")}
          </div>
          {sub("RITMO")}
          <div style={{ display: "flex", gap: 6 }}>
            {campo("Perda por semana", "kgSemana", m.kgSemana, "kg", 0.05)}
            {valor("Semanas até a meta", m.semanas ?? "—", "")}
          </div>
          {sub("METAS DIÁRIAS (CARBOIDRATO E GORDURA SE AJUSTAM SOZINHOS)")}
        </>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {ed ? campo("Calorias", "cal", m.cal, "kcal", 10) : valor("Calorias", m.cal, "kcal")}
        {ed ? campo("Proteína", "prot", m.prot, "g", 5) : valor("Proteína", m.prot, "g")}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {valor("Carboidrato", m.carb, "g")}
        {valor("Gordura", m.gord, "g")}
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
        Gasto estimado: {fmt(m.gasto)} kcal/dia (basal {fmt(m.tmb)} × {dec(m.fator)} pela frequência de treino).
        {m.objetivo === "perder" && m.semanas != null && <> Perda estimada: {dec(m.kgSemana)} kg/semana, cerca de {m.semanas} semanas até a meta.</>}
      </div>
      {prazoCurto && aviso("No ritmo atual, a meta leva cerca de " + m.semanas + " semanas, e o prazo tem " + Math.max(0, semanasAtePrazo) + ". Ajuste o prazo ou o ritmo.")}
      {m.limitadoPeloPiso && aviso("Esse ritmo exigiria comer abaixo do mínimo seguro (" + fmt(m.piso) + " kcal). As calorias ficaram no mínimo, e a perda real é de " + dec(m.kgSemana) + " kg/semana.")}
      {!m.limitadoPeloPiso && m.abaixoDoPiso && aviso("Abaixo do mínimo seguro de " + fmt(m.piso) + " kcal/dia. Só com acompanhamento médico.")}
      {m.ritmoAlto && aviso("Acima de 1% do peso por semana: ritmo agressivo, com mais risco de perder massa muscular.")}
      {m.carbZerado && aviso("Proteína e gordura já ocupam todas as calorias; o carboidrato ficou zerado.")}
      <div style={{ fontSize: 9.5, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
        Estimativa pela fórmula de Mifflin-St Jeor{m.ajustado ? ", com os ajustes feitos por você" : ", déficit de ~0,7% do peso por semana e proteína de 1,8 g por kg do peso-meta"}. Confirme com seu médico ou nutricionista, principalmente se usar medicação para peso.
      </div>
    </div>
  );
}
