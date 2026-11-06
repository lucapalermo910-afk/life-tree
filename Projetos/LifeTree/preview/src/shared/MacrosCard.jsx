// Cartão das metas de dieta calculadas por shared/macros.js (05/11/2026). Usado na
// pré-visualização do plano (App.jsx) e no objetivo salvo (geburah/ObjetivosTab.jsx).
const fmt = (n) => Number(n).toLocaleString("pt-BR");

// editando/onChange (06/11/2026): no modo de edição do plano, os 4 números viram campos.
// Valor ajustado à mão marca `ajustado` e o cartão avisa que não é mais o cálculo do app.
export function MacrosCard({ C, m, prazo, accent = "#ef4444", editando = false, onChange = null }) {
  if (!m) return null;
  const semanasAtePrazo = prazo ? Math.floor((new Date(prazo + "T00:00:00") - new Date(new Date().toDateString())) / (7 * 86400000)) : null;
  const prazoCurto = m.semanas != null && semanasAtePrazo != null && m.semanas > semanasAtePrazo;
  const campo = { Calorias: "cal", "Proteína": "prot", Carboidrato: "carb", Gordura: "gord" };
  const item = (rot, val, un) => (
    <div style={{ flex: 1, minWidth: 0, background: C.surface || C.card, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
      {editando && onChange ? (
        <input type="number" inputMode="numeric" min="0" value={val} aria-label={rot + " (" + un + ")"}
          onChange={(e) => onChange(campo[rot], Math.max(0, Math.round(Number(e.target.value) || 0)))}
          style={{ width: "100%", boxSizing: "border-box", textAlign: "center", fontSize: 16, fontWeight: 900, color: C.text, background: C.card,
            border: "1px solid " + C.b1, borderRadius: 8, padding: "4px 2px", outline: "none", fontFamily: "inherit" }} />
      ) : (
        <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{fmt(val)}<span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}> {un}</span></div>
      )}
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{rot}{editando ? " (" + un + ")" : ""}</div>
    </div>
  );
  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: accent, marginBottom: 8 }}>{m.ajustado ? "METAS DE DIETA (AJUSTADAS POR VOCÊ)" : "METAS DE DIETA (CALCULADAS PELO APP)"}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {item("Calorias", m.cal, "kcal")}
        {item("Proteína", m.prot, "g")}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {item("Carboidrato", m.carb, "g")}
        {item("Gordura", m.gord, "g")}
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
        Gasto estimado: {fmt(m.gasto)} kcal/dia (basal {fmt(m.tmb)} × {String(m.fator).replace(".", ",")} pela frequência de treino).
        {m.objetivo === "perder" && <> Perda estimada: {String(m.kgSemana).replace(".", ",")} kg/semana, cerca de {m.semanas} semanas até a meta.</>}
      </div>
      {prazoCurto && (
        <div style={{ fontSize: 11, color: "#d97706", fontWeight: 700, marginTop: 6, lineHeight: 1.45 }}>
          No ritmo seguro, a meta leva cerca de {m.semanas} semanas, e o prazo tem {Math.max(0, semanasAtePrazo)}. Vale estender o prazo em vez de apertar a dieta.
        </div>
      )}
      {m.limitadoPeloPiso && (
        <div style={{ fontSize: 11, color: "#d97706", fontWeight: 700, marginTop: 6 }}>As calorias foram mantidas no mínimo seguro; a perda vai ser mais lenta.</div>
      )}
      <div style={{ fontSize: 9.5, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
        Estimativa pela fórmula de Mifflin-St Jeor, déficit de ~0,7% do peso por semana e proteína de 1,8 g por kg do peso-meta. Confirme com seu médico ou nutricionista, principalmente se usar medicação para peso.
      </div>
    </div>
  );
}
