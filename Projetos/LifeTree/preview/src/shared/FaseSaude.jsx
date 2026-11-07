// Fase executável da linha do tempo da Saúde (06/11/2026): meta da semana, marco, tarefas
// (só descritas aqui — marcadas no Controle) e revisão. Leitura e editor.
import { DIVISOES } from "./treino.js";
import { EditableRow, AddRowBtn } from "./ui.jsx";

const dataCurta = (s) => (s ? s.slice(8, 10) + "/" + s.slice(5, 7) : "");
const semanaTexto = (w) => w.treinos_semana + (w.treinos_semana === 1 ? " treino" : " treinos") + " (" + w.divisao.split("").join("·") + ")" +
  (w.cardio_min_semana ? " · " + w.cardio_min_semana + " min de cardio" : "");

export function FaseDetalhe({ C, s, accent, marco = null, fim = null }) {
  const rot = (t) => <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: C.muted, margin: "8px 0 3px" }}>{t}</div>;
  return (
    <div>
      {s.semana && (<>{rot("NA SEMANA")}<div style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{semanaTexto(s.semana)}</div></>)}
      {s.tarefas?.length > 0 && (
        <>
          {rot("TAREFAS")}
          {s.tarefas.map((t) => (
            <div key={t.id} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12.5, lineHeight: 1.4, marginBottom: 3,
              color: t.done ? C.muted : C.text, textDecoration: t.done ? "line-through" : "none" }}>
              <span style={{ color: t.done ? "#10b981" : accent, fontWeight: 900, flexShrink: 0 }}>{t.done ? "✓" : "•"}</span>
              <span style={{ overflowWrap: "anywhere" }}>{t.texto}{t.ate && <span style={{ color: C.muted, fontWeight: 700 }}> · até {dataCurta(t.ate)}</span>}</span>
            </div>
          ))}
        </>
      )}
      {!s.tarefas?.length && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Sem tarefas. Toque na etapa para adicionar; elas aparecem no Controle.</div>
      )}
      {s.revisao && (<>{rot("REVISÃO" + (fim ? " EM " + dataCurta(fim) : ""))}<div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.4 }}>{s.revisao}</div></>)}
      {marco && (
        <div style={{ display: "inline-block", marginTop: 8, padding: "3px 9px", borderRadius: 99, background: accent + "14", color: accent, fontSize: 11, fontWeight: 800 }}>{marco}</div>
      )}
    </div>
  );
}

export function FaseEditor({ C, s, accent, onPatch }) {
  const rot = (t) => <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: C.muted, margin: "10px 0 4px" }}>{t}</div>;
  const campo = { border: "1px solid " + C.b1, borderRadius: 8, background: C.card, outline: "none", padding: "6px 8px", fontSize: 13, fontFamily: "inherit", color: C.text, boxSizing: "border-box" };
  const w = s.semana;
  const mudarSemana = (k, v) => onPatch({ semana: { ...(w || { treinos_semana: 3, cardio_min_semana: 0, divisao: "ABC" }), [k]: v } });
  const tarefas = s.tarefas || [];
  const mudarTarefa = (id, patch) => onPatch({ tarefas: tarefas.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  return (
    <div>
      {rot("ETAPA (PERÍODO: NOME)")}
      <EditableRow C={C} value={s.title} onChange={(v) => onPatch({ title: v })} autoFocus />
      {rot("NA SEMANA")}
      {w ? (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <label style={{ flex: 1, fontSize: 10, color: C.muted, fontWeight: 700 }}>Treinos
              <input type="number" min="0" max="7" inputMode="numeric" aria-label="Treinos na semana da fase" value={w.treinos_semana}
                onChange={(e) => mudarSemana("treinos_semana", Number(e.target.value) || 0)} style={{ ...campo, width: "100%", marginTop: 2, fontWeight: 800 }} />
            </label>
            <label style={{ flex: 1, fontSize: 10, color: C.muted, fontWeight: 700 }}>Cardio (min)
              <input type="number" min="0" inputMode="numeric" aria-label="Cardio na semana da fase" value={w.cardio_min_semana}
                onChange={(e) => mudarSemana("cardio_min_semana", Number(e.target.value) || 0)} style={{ ...campo, width: "100%", marginTop: 2, fontWeight: 800 }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {DIVISOES.map((d) => (
              <button key={d} onClick={() => mudarSemana("divisao", d)} aria-pressed={w.divisao === d}
                style={{ padding: "4px 10px", borderRadius: 99, cursor: "pointer", fontSize: 11, fontWeight: 800, border: "1.5px solid " + accent,
                  background: w.divisao === d ? accent : "transparent", color: w.divisao === d ? "#fff" : accent }}>{d}</button>
            ))}
          </div>
        </div>
      ) : (
        <AddRowBtn C={C} onClick={() => mudarSemana("treinos_semana", 3)} label="Definir meta da semana" accent={accent} />
      )}
      {rot("TAREFAS")}
      {tarefas.map((t) => (
        <div key={t.id} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditableRow C={C} value={t.texto} onChange={(v) => mudarTarefa(t.id, { texto: v })} onRemove={() => onPatch({ tarefas: tarefas.filter((x) => x.id !== t.id) })} />
            <input type="date" aria-label={"Data da tarefa " + t.texto} value={t.ate || ""} onChange={(e) => mudarTarefa(t.id, { ate: e.target.value || null })}
              style={{ ...campo, fontSize: 11, padding: "3px 6px", marginTop: 2 }} />
          </div>
        </div>
      ))}
      <AddRowBtn C={C} onClick={() => onPatch({ tarefas: [...tarefas, { id: "tf" + Math.random().toString(36).slice(2, 8), texto: "", ate: null, done: false }] })} label="Tarefa" accent={accent} />
      {rot("REVISÃO NO FIM DA ETAPA")}
      <EditableRow C={C} value={s.revisao || ""} onChange={(v) => onPatch({ revisao: v })} />
    </div>
  );
}
