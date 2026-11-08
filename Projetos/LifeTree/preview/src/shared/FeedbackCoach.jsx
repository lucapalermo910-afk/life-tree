// Cartões de feedback do Coach (08/11/2026) — topo da Saúde e do Controle. Regras e textos em
// shared/feedback.js. Máx. 3 visíveis; × dispensa até o fim do dia; "Conversar" abre o Coach.
import { useState } from "react";
import { feedbacksDaSaude, dispensados, dispensar, conversarComCoach } from "./feedback.js";

const COR = { alerta: "#f59e0b", info: "#3b82f6", ok: "#10b981" };

export function FeedbackCoach({ C, dados, max = 3 }) {
  const [, setTick] = useState(0);
  const fora = dispensados();
  const lista = feedbacksDaSaude(dados).filter((f) => !fora[f.id]).slice(0, max);
  if (!lista.length) return null;
  return (
    <div style={{ display: "grid", gap: 8, marginBottom: 14 }} aria-label="Avisos do Coach">
      {lista.map((f) => (
        <div key={f.id} style={{ background: C.card, border: "1px solid " + COR[f.nivel] + "55", borderLeft: "4px solid " + COR[f.nivel], borderRadius: 12, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: COR[f.nivel], marginBottom: 3 }}>COACH · {f.titulo.toUpperCase()}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.45, color: C.text }}>{f.texto}</div>
            </div>
            <button onClick={() => { dispensar(f.id); setTick((n) => n + 1); }} aria-label={"Dispensar aviso " + f.titulo}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 }}>×</button>
          </div>
          {f.pergunta && (
            <button onClick={() => conversarComCoach(f.pergunta)}
              style={{ marginTop: 8, background: COR[f.nivel] + "18", border: "1px solid " + COR[f.nivel] + "55", color: COR[f.nivel], borderRadius: 99,
                padding: "5px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              Conversar com o Coach
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
