// Resultados-chave do objetivo (06/11/2026): "como saberei que tive sucesso". São alvos do
// plano; a medição virá das abas de registro. O peso vem do quadro de dieta (fonte única).
// onChange(campo, valor) com campo em: treino_pct, dieta_pct, gordura_pct.
import { kgBR } from "./planejamento.js";

export function ResultadosCard({ C, r, dieta = null, temDieta = false, accent = "#ef4444", editando = false, onChange = null }) {
  const ed = editando && onChange;
  const linha = (rot, valor, k, prefixo, extra) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid " + C.b1 }}>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: C.text, fontWeight: 600 }}>{rot}</div>
      {ed && k ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{prefixo}</span>
          <input type="number" inputMode="decimal" min="0" max="100" value={valor ?? ""} aria-label={rot} placeholder="—"
            onChange={(e) => onChange(k, e.target.value === "" ? null : Number(e.target.value))}
            style={{ width: 58, textAlign: "center", fontSize: 14, fontWeight: 900, color: C.text, background: C.card, border: "1.5px solid " + accent + "66",
              borderRadius: 8, padding: "4px 2px", outline: "none", fontFamily: "inherit" }} />
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>%</span>
        </div>
      ) : (
        <div style={{ fontSize: 14, fontWeight: 900, color: accent, flexShrink: 0 }}>{extra ?? prefixo + " " + valor + "%"}</div>
      )}
    </div>
  );
  const peso = dieta && Number(dieta.peso_kg) && Number(dieta.peso_meta_kg);
  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: accent, marginBottom: 4 }}>RESULTADOS-CHAVE</div>
      {peso && linha("Peso", null, null, "", kgBR(Number(dieta.peso_kg)) + " → " + kgBR(Number(dieta.peso_meta_kg)))}
      {linha("Treinos feitos do planejado", r.treino_pct, "treino_pct", "≥")}
      {temDieta && linha("Dias dentro da dieta", r.dieta_pct, "dieta_pct", "≥")}
      {(ed || r.gordura_pct) && linha(ed ? "% de gordura (opcional)" : "% de gordura", r.gordura_pct, "gordura_pct", "≤")}
      <div style={{ fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.4 }}>
        {ed && peso ? "O peso-meta muda no quadro de dieta. " : ""}Alvos do plano. A medição virá das abas de registro.
      </div>
    </div>
  );
}
