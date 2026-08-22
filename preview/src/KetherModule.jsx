import { useState } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { YESOD_ACTION_HANDLERS } from "./shared/yesodActions.js";
import { HOD_ACTION_HANDLERS } from "./shared/hodActions.js";
import { TIPHARETH_ACTION_HANDLERS } from "./shared/tipharethActions.js";
import { NETZACH_ACTION_HANDLERS } from "./shared/netzachActions.js";
import { CHOKMAH_ACTION_HANDLERS } from "./shared/chokmahActions.js";
import { BINAH_ACTION_HANDLERS } from "./shared/binahActions.js";

// Protótipo do Desejo (Kether) — mesmo padrão do Controle/Malkuth (19/08/2026), mas pro
// lado das metas em vez dos hábitos: "assim como o Controle cuida dos hábitos, o Desejo
// cuida das metas". Duas peças: (1) aba METAS — agregação bidirecional das metas reais
// dos 3 módulos que têm um conceito limpo de meta com done/toggle (Yesod/Hod/Tiphareth,
// mesmo mecanismo do Controle); (2) DESEJOS — lista própria do Kether onde cada desejo
// (ex: "morar na Itália") pode derivar metas concretas em módulos impactados (ex:
// "aprender Italiano" no Binah, "poupança de mudança" no Yesod, "emprego na Itália" no
// Hod), criadas de verdade nesses módulos ao salvar o desejo.

const DARK  = { bg:"#0a1216", surface:"#0f1a1f", card:"#132126", b1:"#1c333a", b2:"#2a4a54", text:"#eafdff", muted:"#bfe6ec", dim:"#6dd3e0", nav:"#081014" };
const LIGHT = { bg:"#eefcff", surface:"#fbffff", card:"#e6f9fc", b1:"#bdedf5", b2:"#8fdde9", text:"#062226", muted:"#356870", dim:"#054450", nav:"#eefcff" };
const ACCENT = "#06b6d4";

function readOtherModule(key, fb) { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }

const IC = {
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  sun:  ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  check:"M20 6 9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  x:    "M18 6 6 18M6 6l12 12",
  key:  ["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"],
};
function Ico({ n, size = 16, color = "currentColor", sw = 1.5 }) {
  const d = IC[n]; if (!d) return null;
  const parts = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {parts.map((p, i) => <path key={i} d={p}/>)}
    </svg>
  );
}

// Leitura+escrita: mesmo padrão do Controle/Malkuth — read-only via localStorage direto,
// toggle reaproveitando as *_ACTION_HANDLERS do Coach. Só os 3 módulos com meta "de
// verdade" (lista com done booleano) entram aqui — os outros 3 (abaixo, DERIVE_TARGETS)
// não têm esse conceito, então só suportam criação, não monitoramento com toggle.
const GOAL_ADAPTERS = {
  yesod: {
    label: "Finanças", color: "#10b981",
    read: () => readOtherModule("lifetree_fin_ygoals", []).map(g => ({ id: "yesod_" + g.id, title: g.title, xp: g.xp, done: g.done })),
    toggle: item => YESOD_ACTION_HANDLERS.toggle_ygoal({ match: item.title }),
  },
  hod: {
    label: "Profissional", color: "#f97316",
    read: () => readOtherModule("lifetree_hod_carGoals", []).map(g => ({ id: "hod_" + g.id, title: g.title, xp: g.xp, done: g.done })),
    toggle: item => HOD_ACTION_HANDLERS.toggle_car_goal({ match: item.title }),
  },
  tiphareth: {
    label: "Autocuidado", color: "#eab308",
    read: () => readOtherModule("lifetree_tiph_goals", []).map(g => ({ id: "tiph_" + g.id, title: g.title, xp: g.xp, done: g.done })),
    toggle: item => TIPHARETH_ACTION_HANDLERS.toggle_goal({ match: item.title }),
  },
};

// Módulos onde dá pra criar uma meta derivada de um desejo — os 3 acima (meta real) mais
// 3 sem conceito de "meta" limpo (Netzach/Chokmah/Binah, mesmo caso difícil do Geburah no
// Controle): entram como experiência/tradição/trilha, o análogo mais próximo de cada um.
// Read-only depois de criados aqui — sem toggle, status lido do próprio módulo.
const DERIVE_TARGETS = {
  yesod:     { label: "Finanças",          color: "#10b981", create: title => YESOD_ACTION_HANDLERS.create_ygoal({ title }) },
  hod:       { label: "Profissional",      color: "#f97316", create: title => HOD_ACTION_HANDLERS.create_car_goal({ title }) },
  tiphareth: { label: "Autocuidado",       color: "#eab308", create: title => TIPHARETH_ACTION_HANDLERS.create_goal({ title, area: "bemestar" }) },
  netzach:   { label: "Qualidade de Vida", color: "#22c55e", create: title => NETZACH_ACTION_HANDLERS.create_experiencia({ titulo: title }) },
  chokmah:   { label: "Espiritualidade",   color: "#c084fc", create: title => CHOKMAH_ACTION_HANDLERS.create_tradicao({ nome: title }) },
  binah:     { label: "Conhecimento",      color: "#4f46e5", create: title => BINAH_ACTION_HANDLERS.create_track({ name: title }) },
};
const DERIVE_ORDER = ["yesod", "hod", "tiphareth", "netzach", "chokmah", "binah"];

// Status read-only pros 3 módulos sem toggle — cada um lido do seu próprio formato.
const STATUS_LOOKUP = {
  netzach: title => readOtherModule("lifetree_netz_experiencias", []).find(e => e.titulo === title)?.status || "sonho",
  chokmah: title => readOtherModule("lifetree_chok_tradicoes", []).find(t => t.nome === title)?.status || "explorando",
  binah:   title => readOtherModule("lifetree_binah_tracks", []).find(t => t.name === title) ? "trilha criada" : "—",
};

const DESEJOS_KEY = "lifetree_keth_desejos";
const uid = () => Math.random().toString(36).slice(2, 8);

export default function KetherModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [, bump] = useState(0);
  const refresh = () => bump(n => n + 1);

  useCoachDataSync("yesod", refresh);
  useCoachDataSync("hod", refresh);
  useCoachDataSync("tiphareth", refresh);
  useCoachDataSync("netzach", refresh);
  useCoachDataSync("chokmah", refresh);
  useCoachDataSync("binah", refresh);

  const [desejos, setDesejos] = useState(() => readOtherModule(DESEJOS_KEY, []));
  const [novo, setNovo] = useState(false);
  const [wishTitle, setWishTitle] = useState("");
  const [draftMetas, setDraftMetas] = useState([]);
  const [draftModule, setDraftModule] = useState("yesod");
  const [draftMetaTitle, setDraftMetaTitle] = useState("");

  const saveDesejos = next => {
    setDesejos(next);
    try { localStorage.setItem(DESEJOS_KEY, JSON.stringify(next)); } catch {}
  };

  const addDraftMeta = () => {
    if (!draftMetaTitle.trim()) return;
    setDraftMetas(p => [...p, { moduleId: draftModule, title: draftMetaTitle.trim() }]);
    setDraftMetaTitle("");
  };
  const removeDraftMeta = i => setDraftMetas(p => p.filter((_, idx) => idx !== i));

  const criarDesejo = () => {
    if (!wishTitle.trim()) return;
    draftMetas.forEach(m => DERIVE_TARGETS[m.moduleId].create(m.title));
    const desejo = { id: "w" + uid(), title: wishTitle.trim(), createdAt: new Date().toISOString().slice(0, 10), metasDerivadas: draftMetas };
    saveDesejos([desejo, ...desejos]);
    setWishTitle(""); setDraftMetas([]); setNovo(false);
  };

  const metas = Object.entries(GOAL_ADAPTERS).flatMap(([moduleId, ad]) =>
    ad.read().map(item => ({ ...item, moduleId, moduleLabel: ad.label, color: ad.color }))
  );

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", color: C.text }}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}"}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 0" }}>
        <button onClick={onBack} style={{ color: ACCENT, background: C.card, border: "1px solid " + ACCENT + "33", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>
          ← Árvore
        </button>
        <span style={{ fontSize: 12, color: C.muted }}>Kether · Desejo</span>
      </div>

      <div style={{ padding: "18px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 2 }}>KETHER</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Desejo</div>
        </div>
        <button onClick={() => setDark(d => !d)} style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Ico n={dark ? "sun" : "moon"} size={14} color={C.dim}/>
        </button>
      </div>

      <div style={{ padding: "14px 16px 100px" }}>
        <div style={{ background: "linear-gradient(135deg," + ACCENT + "22," + ACCENT + "06)", border: "1px solid " + ACCENT + "44", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PROTÓTIPO — TESTE DE INTEGRAÇÃO</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
            Metas monitoradas nos 2 sentidos (Finanças, Profissional, Autocuidado) + desejos que derivam metas em até 6 módulos.
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>METAS</div>
        {metas.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 12 }}>
            Nenhuma meta nos módulos conectados ainda.
          </div>
        )}
        {metas.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.card, border: "1px solid " + item.color + "22", borderRadius: 12, marginBottom: 7 }}>
            <button
              onClick={() => GOAL_ADAPTERS[item.moduleId].toggle(item)}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                border: "1.5px solid " + (item.done ? item.color : C.b2), background: item.done ? item.color : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {item.done && <Ico n="check" size={11} color="#fff" sw={2.5}/>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: item.done ? C.muted : C.text, textDecoration: item.done ? "line-through" : "none" }}>{item.title}</div>
              <div style={{ fontSize: 9, color: item.color }}>{item.moduleLabel}</div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>DESEJOS</span>
          {!novo && (
            <button onClick={() => setNovo(true)} style={{ background: ACCENT + "18", border: "1px solid " + ACCENT + "44", borderRadius: 7, padding: "4px 10px", color: ACCENT, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700 }}>
              <Ico n="plus" size={11}/> Desejo
            </button>
          )}
        </div>

        {novo && (
          <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <input value={wishTitle} onChange={e => setWishTitle(e.target.value)} placeholder="Ex: Morar na Itália"
              style={{ width: "100%", background: C.bg, border: "1px solid " + C.b2, borderRadius: 9, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", marginBottom: 10 }}/>

            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: .8, marginBottom: 6 }}>METAS DERIVADAS (OPCIONAL)</div>
            {draftMetas.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: DERIVE_TARGETS[m.moduleId].color, background: DERIVE_TARGETS[m.moduleId].color + "18", borderRadius: 6, padding: "3px 7px" }}>{DERIVE_TARGETS[m.moduleId].label}</span>
                <span style={{ flex: 1, fontSize: 11, color: C.text }}>{m.title}</span>
                <button onClick={() => removeDraftMeta(i)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", padding: 2 }}>
                  <Ico n="x" size={11}/>
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <select value={draftModule} onChange={e => setDraftModule(e.target.value)}
                style={{ background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 8px", color: C.text, fontSize: 11, outline: "none" }}>
                {DERIVE_ORDER.map(id => <option key={id} value={id}>{DERIVE_TARGETS[id].label}</option>)}
              </select>
              <input value={draftMetaTitle} onChange={e => setDraftMetaTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addDraftMeta()}
                placeholder="Ex: Aprender Italiano"
                style={{ flex: 1, background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 11, outline: "none" }}/>
              <button onClick={addDraftMeta} style={{ background: C.b1, border: "none", borderRadius: 8, width: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n="plus" size={12} color={C.dim}/>
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={criarDesejo} style={{ flex: 1, padding: "9px", borderRadius: 8, background: ACCENT, border: "none", color: "#04222a", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Criar Desejo</button>
              <button onClick={() => { setNovo(false); setWishTitle(""); setDraftMetas([]); }} style={{ padding: "9px 14px", borderRadius: 8, background: C.b1, border: "none", color: C.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        )}

        {desejos.length === 0 && !novo && (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 12 }}>
            Nenhum desejo registrado ainda.
          </div>
        )}
        {desejos.map(w => (
          <div key={w.id} style={{ background: C.card, border: "1px solid " + ACCENT + "22", borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: w.metasDerivadas.length ? 8 : 0 }}>
              <Ico n="key" size={13} color={ACCENT}/>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{w.title}</span>
            </div>
            {w.metasDerivadas.map((m, i) => {
              const adapter = GOAL_ADAPTERS[m.moduleId];
              if (adapter) {
                const live = adapter.read().find(x => x.title === m.title);
                const done = live?.done || false;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                    <button onClick={() => adapter.toggle({ title: m.title })}
                      style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                        border: "1.5px solid " + (done ? DERIVE_TARGETS[m.moduleId].color : C.b2), background: done ? DERIVE_TARGETS[m.moduleId].color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      {done && <Ico n="check" size={9} color="#fff" sw={2.5}/>}
                    </button>
                    <span style={{ flex: 1, fontSize: 11, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{m.title}</span>
                    <span style={{ fontSize: 9, color: DERIVE_TARGETS[m.moduleId].color }}>{DERIVE_TARGETS[m.moduleId].label}</span>
                  </div>
                );
              }
              const status = STATUS_LOOKUP[m.moduleId] ? STATUS_LOOKUP[m.moduleId](m.title) : "—";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <span style={{ flex: 1, fontSize: 11, color: C.text }}>{m.title}</span>
                  <span style={{ fontSize: 9, color: DERIVE_TARGETS[m.moduleId].color, background: DERIVE_TARGETS[m.moduleId].color + "18", borderRadius: 6, padding: "2px 6px" }}>{status}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
