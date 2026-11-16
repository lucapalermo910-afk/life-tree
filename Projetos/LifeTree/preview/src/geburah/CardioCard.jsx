// Registro de cardio (16/11/2026): o plano pede minutos de cardio por semana em cada etapa e,
// até aqui, não havia onde registrar. Topo da aba Treino: total dos últimos 7 dias × meta da
// etapa atual, registro rápido (tipo + minutos) e os de hoje com × para apagar.
import { useContext, useState } from "react";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT } from "./theme.js";
import { TIPOS_CARDIO, cardioDaSemana, dataLocal } from "../shared/cardapio.js";
import { treinoAtual } from "../shared/planejamento.js";

export function CardioCard() {
  const C = useContext(ThemeCtx);
  const { logCardio = [], setLogCardio, objetivos = [], toast_ } = useGeburah();
  const [tipo, setTipo] = useState("Esteira");
  const [min, setMin] = useState("");
  const hoje = dataLocal();
  const o = objetivos.find((x) => x.plano && !x.done && x.plano.steps?.some((s) => s.semana));
  const meta = o ? treinoAtual(o)?.cardio_min_semana : null;
  const sem = cardioDaSemana(logCardio, hoje);
  const pct = meta ? Math.min(100, Math.round((sem.minutos_7_dias / meta) * 100)) : null;
  const deHoje = logCardio.filter((c) => c.data === hoje);
  const registrar = () => {
    const m = Math.round(Number(min));
    if (!m || m <= 0) return;
    setLogCardio((p) => [...p, { id: "cd" + Date.now().toString(36), data: hoje, tipo, min: m }]);
    setMin(""); toast_ && toast_("Cardio registrado: " + m + " min de " + tipo.toLowerCase(), ACCENT);
  };
  return (
    <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: ACCENT }}>CARDIO</div>
        <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: C.text }}>
          {sem.minutos_7_dias}{meta ? " de " + meta : ""} min <span style={{ color: C.muted, fontWeight: 600 }}>nos últimos 7 dias</span>
        </div>
      </div>
      {pct != null && (
        <div style={{ height: 6, background: C.b1, borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: pct + "%", background: pct >= 85 ? "#10b981" : ACCENT, borderRadius: 99 }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }} role="group" aria-label="Tipo de cardio">
        {TIPOS_CARDIO.map((t) => (
          <button key={t} onClick={() => setTipo(t)} aria-pressed={tipo === t}
            style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + ACCENT + "55",
              background: tipo === t ? ACCENT : "transparent", color: tipo === t ? "#fff" : ACCENT, fontFamily: "inherit" }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" inputMode="numeric" min="1" placeholder="Minutos" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minutos de cardio"
          onKeyDown={(e) => e.key === "Enter" && registrar()}
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.b2, background: C.surface || C.card, color: C.text, fontSize: 13, fontFamily: "inherit" }} />
        <button onClick={registrar} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: ACCENT, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Registrar</button>
      </div>
      {deHoje.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {deHoje.map((c) => (
            <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 8px", borderRadius: 99, background: ACCENT + "14", color: ACCENT, fontWeight: 700 }}>
              Hoje: {c.tipo} {c.min} min
              <button onClick={() => setLogCardio((p) => p.filter((x) => x.id !== c.id))} aria-label={"Apagar cardio " + c.tipo + " " + c.min + " min"}
                style={{ background: "none", border: "none", color: ACCENT, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
