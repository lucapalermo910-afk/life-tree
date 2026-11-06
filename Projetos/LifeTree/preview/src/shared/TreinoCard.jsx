// Quadro de metas de treino (06/11/2026). Mesmo desenho do MacrosCard: leitura por padrão,
// campos no modo de edição do plano. "Treinos por semana" é a fonte única — a dieta lê daqui.
// onChange(campo, valor) com campo em: treinos_semana, cardio_min_semana, divisao.
import { DIVISOES, sequenciaDaSemana } from "./treino.js";

export function TreinoCard({ C, t, accent = "#ef4444", editando = false, onChange = null }) {
  if (!t) return null;
  const ed = editando && onChange;
  const seq = sequenciaDaSemana(t);
  const caixa = { flex: 1, minWidth: 0, background: C.surface || C.card, borderRadius: 10, padding: "8px 6px", textAlign: "center" };
  const valor = (rot, val, un) => (
    <div style={caixa}>
      <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{val}<span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}> {un}</span></div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{rot}</div>
    </div>
  );
  const campo = (rot, k, val, un, max) => (
    <div style={caixa}>
      <input type="number" inputMode="numeric" min="0" max={max} value={val ?? ""} aria-label={rot + " (" + un + ")"}
        onChange={(e) => onChange(k, e.target.value === "" ? 0 : Number(e.target.value))}
        style={{ width: "100%", boxSizing: "border-box", textAlign: "center", fontSize: 16, fontWeight: 900, color: C.text, background: C.card,
          border: "1.5px solid " + accent + "66", borderRadius: 8, padding: "4px 2px", outline: "none", fontFamily: "inherit" }} />
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>{rot} ({un})</div>
    </div>
  );

  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: accent, marginBottom: 8 }}>METAS DE TREINO</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {ed ? campo("Treinos", "treinos_semana", t.treinos_semana, "/semana", 7) : valor("Treinos por semana", t.treinos_semana, "")}
        {ed ? campo("Cardio", "cardio_min_semana", t.cardio_min_semana, "min/semana") : valor("Cardio por semana", t.cardio_min_semana, "min")}
      </div>

      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 6 }}>Tipo de treino</div>
      {ed ? (
        <div role="group" aria-label="Tipo de treino" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {DIVISOES.map((d) => (
            <button key={d} onClick={() => onChange("divisao", d)} aria-pressed={t.divisao === d}
              style={{ padding: "6px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 800, letterSpacing: 1,
                border: "1.5px solid " + accent, background: t.divisao === d ? accent : "transparent", color: t.divisao === d ? "#fff" : accent }}>
              {d}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 14, fontWeight: 900, color: C.text, letterSpacing: 1, marginBottom: 10 }}>
          {t.divisao}
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0 }}>
            {" "}· {t.divisao.length === 1 ? "o mesmo treino repetido" : t.divisao.length + " treinos diferentes em rodízio"}
          </span>
        </div>
      )}

      {seq.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 6 }}>Sequência da semana</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {seq.map((l, i) => (
              <span key={i} style={{ width: 30, height: 30, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: accent + "18", color: accent, fontWeight: 900, fontSize: 13 }}>{l}</span>
            ))}
          </div>
        </>
      )}
      {ed && <div style={{ fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.4 }}>Os treinos por semana também entram no cálculo das metas de dieta.</div>}
    </div>
  );
}
