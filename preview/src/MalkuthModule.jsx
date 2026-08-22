import { useState } from "react";
import { useCoachDataSync } from "./shared/coachSync.js";
import { YESOD_ACTION_HANDLERS } from "./shared/yesodActions.js";
import { CHESED_ACTION_HANDLERS } from "./shared/chesedActions.js";
import { HOD_ACTION_HANDLERS } from "./shared/hodActions.js";
import { NETZACH_ACTION_HANDLERS } from "./shared/netzachActions.js";
import { TIPHARETH_ACTION_HANDLERS } from "./shared/tipharethActions.js";
import { CHOKMAH_ACTION_HANDLERS } from "./shared/chokmahActions.js";

// Protótipo do Reino (Malkuth) — proposta de "módulo integrador geral" de 18/08/2026,
// ver [[10 Malkuth]]. Validado primeiro com 3 módulos (Yesod/Chesed/Geburah), estendido
// em 19/08/2026 pros outros 5 (Hod/Netzach/Tiphareth/Chokmah/Binah) — cobre os 8 módulos
// reais. Ainda só a aba Atividades das 6 propostas (Reino/Progresso/Conquistas/Diário/
// Config ficam pra quando construir o módulo completo, mesmo porte de Chokmah/Binah).

const DARK  = { bg:"#12100c", surface:"#1a1610", card:"#1f1a12", b1:"#332818", b2:"#4f3e24", text:"#f6efe2", muted:"#e3d2b0", dim:"#c9a260", nav:"#0f0d0a" };
const LIGHT = { bg:"#fff8ef", surface:"#fffbf6", card:"#fff5e6", b1:"#f0d9ae", b2:"#dcb677", text:"#2a1c08", muted:"#8a5a2e", dim:"#452405", nav:"#fff8ef" };
const ACCENT = "#b45309";

function readOtherModule(key, fb) { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
const todayS = () => new Date().toISOString().slice(0, 10);

// Mesmo dicionário/sistema de ícone vetorial usado nos outros 8 módulos (subconjunto —
// só o que este protótipo precisa). Emoji cru (☀️/🌙/✓) tem peso visual e cor inconsistente
// entre plataformas e destoa do resto do app — achado testando ao vivo em 18/08/2026.
const IC = {
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  sun:  ["M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10Z","M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42"],
  check:"M20 6 9 17l-5-5",
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

// Leitura: mesmo padrão read-only já validado no HUB_ADAPTERS do Tiphareth.
// Escrita: reaproveita as *_ACTION_HANDLERS que o Coach já usa em cada módulo — nunca
// reimplementa a lógica de XP/score de cada um aqui. toggle(title) usa o mesmo "match"
// por texto que as ações do Coach já usam (achado real: risco de ambiguidade se houver
// 2 hábitos com título igual no mesmo módulo — aceitável neste protótipo, revisitar se
// virar problema real ao estender pros 8 módulos).
const ACTIVITY_ADAPTERS = {
  yesod: {
    label: "Finanças", color: "#10b981",
    read: () => readOtherModule("lifetree_fin_yhabits", []).map(h => ({ id: "yesod_" + h.id, title: h.title, freq: h.freq, done: h.done })),
    toggle: (item) => YESOD_ACTION_HANDLERS.toggle_yhabit({ match: item.title }),
  },
  chesed: {
    label: "Relacionamentos", color: "#ec4899",
    read: () => readOtherModule("lifetree_ches_habits", []).map(h => ({ id: "ches_" + h.id, title: h.title, freq: h.freq, done: h.done })),
    toggle: (item) => CHESED_ACTION_HANDLERS.toggle_habit({ match: item.title }),
  },
  geburah: {
    label: "Saúde", color: "#ef4444",
    read: () => {
      const logTreino = readOtherModule("lifetree_geb_logTreino", []);
      const treinouHoje = logTreino.some(l => l.data === todayS());
      return [{ id: "geb_treino_hoje", title: "Treino de hoje", freq: "Diário", done: treinouHoje }];
    },
    toggle: null, // Geburah não tem "hábito" simples — iniciar treino exige escolher rotina, não cabe num toggle de 1 toque. Fica read-only neste protótipo.
  },
  hod: {
    label: "Profissional", color: "#f97316",
    read: () => readOtherModule("lifetree_hod_carHabits", []).map(h => ({ id: "hod_" + h.id, title: h.title, freq: h.freq, done: h.done })),
    toggle: (item) => HOD_ACTION_HANDLERS.toggle_car_habit({ match: item.title }),
  },
  // Netzach guarda 2 listas separadas (lazer/lar) sob uma mesma ação com parâmetro
  // "area" — read() junta as duas tagueando cada item, toggle repassa a área certa.
  netzach: {
    label: "Qualidade de Vida", color: "#22c55e",
    read: () => [
      ...readOtherModule("lifetree_netz_lazerHabits", []).map(h => ({ id: "netz_lz_" + h.id, title: h.title, freq: h.freq, done: h.done, area: "lazer" })),
      ...readOtherModule("lifetree_netz_larHabits", []).map(h => ({ id: "netz_lr_" + h.id, title: h.title, freq: h.freq, done: h.done, area: "lar" })),
    ],
    toggle: (item) => NETZACH_ACTION_HANDLERS.toggle_habit({ match: item.title, area: item.area }),
  },
  // Mesmo padrão do Netzach — Tiphareth separa hábitos de aparência/bem-estar sob
  // uma ação com parâmetro "area".
  tiphareth: {
    label: "Autocuidado", color: "#eab308",
    read: () => [
      ...readOtherModule("lifetree_tiph_aparenciaHabits", []).map(h => ({ id: "tiph_ap_" + h.id, title: h.title, freq: h.freq, done: h.done, area: "aparencia" })),
      ...readOtherModule("lifetree_tiph_bemestarHabits", []).map(h => ({ id: "tiph_be_" + h.id, title: h.title, freq: h.freq, done: h.done, area: "bemestar" })),
    ],
    toggle: (item) => TIPHARETH_ACTION_HANDLERS.toggle_habit({ match: item.title, area: item.area }),
  },
  chokmah: {
    label: "Espiritualidade", color: "#c084fc",
    read: () => readOtherModule("lifetree_chok_praticaHabits", []).map(h => ({ id: "chok_" + h.id, title: h.title, freq: h.freq, done: h.done })),
    toggle: (item) => CHOKMAH_ACTION_HANDLERS.toggle_habit({ match: item.title }),
  },
  // Binah não tem "hábito" simples (trilhas/tópicos são por nível, livros por status) —
  // mesmo caso difícil do Geburah. Sintetiza "Leitura de hoje" a partir do readingLog.
  binah: {
    label: "Conhecimento", color: "#4f46e5",
    read: () => {
      const readingLog = readOtherModule("lifetree_binah_readingLog", []);
      const leuHoje = readingLog.some(l => l.date === todayS());
      return [{ id: "binah_leitura_hoje", title: "Leitura de hoje", freq: "Diário", done: leuHoje }];
    },
    toggle: null,
  },
};

export default function MalkuthModule({ onBack, dark, setDark }) {
  const C = dark ? DARK : LIGHT;
  const [, bump] = useState(0);
  const refresh = () => bump(n => n + 1);

  // Recarrega quando qualquer módulo conectado avisar atualização — inclusive quando o
  // próprio Reino chama a ação de outro módulo (o handler já dispara esse mesmo evento),
  // fechando o loop de sincronização nos dois sentidos sem lógica extra aqui.
  useCoachDataSync("yesod", refresh);
  useCoachDataSync("chesed", refresh);
  useCoachDataSync("geburah", refresh);
  useCoachDataSync("hod", refresh);
  useCoachDataSync("netzach", refresh);
  useCoachDataSync("tiphareth", refresh);
  useCoachDataSync("chokmah", refresh);
  useCoachDataSync("binah", refresh);

  const activities = Object.entries(ACTIVITY_ADAPTERS).flatMap(([moduleId, ad]) =>
    ad.read().map(item => ({ ...item, moduleId, moduleLabel: ad.label, color: ad.color, canToggle: !!ad.toggle }))
  );

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", color: C.text }}>
      <style>{"*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}"}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 0" }}>
        <button onClick={onBack} style={{ color: ACCENT, background: C.card, border: "1px solid " + ACCENT + "33", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>
          ← Árvore
        </button>
        <span style={{ fontSize: 12, color: C.muted }}>Malkuth · Controle</span>
      </div>

      <div style={{ padding: "18px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 2 }}>MALKUTH</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Controle</div>
        </div>
        <button onClick={() => setDark(d => !d)} style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Ico n={dark ? "sun" : "moon"} size={14} color={C.dim}/>
        </button>
      </div>

      <div style={{ padding: "14px 16px 100px" }}>
        <div style={{ background: "linear-gradient(135deg," + ACCENT + "22," + ACCENT + "06)", border: "1px solid " + ACCENT + "44", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PROTÓTIPO — TESTE DE INTEGRAÇÃO</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
            Só a aba Atividades, mas já com os 8 módulos conectados — pra validar a sincronização nos dois sentidos antes de construir o módulo completo.
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ATIVIDADES</div>
        {activities.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.muted, fontSize: 12 }}>
            Nenhuma atividade nos módulos conectados ainda.
          </div>
        )}
        {activities.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.card, border: "1px solid " + item.color + "22", borderRadius: 12, marginBottom: 7 }}>
            <button
              onClick={item.canToggle ? () => ACTIVITY_ADAPTERS[item.moduleId].toggle(item) : undefined}
              disabled={!item.canToggle}
              title={item.canToggle ? undefined : "Sem ação rápida — abra o módulo " + item.moduleLabel + " pra registrar"}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: item.canToggle ? "pointer" : "default",
                border: "1.5px solid " + (item.done ? item.color : C.b2), background: item.done ? item.color : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {item.done && <Ico n="check" size={11} color="#fff" sw={2.5}/>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: item.done ? C.muted : C.text, textDecoration: item.done ? "line-through" : "none" }}>{item.title}</div>
              <div style={{ fontSize: 9, color: item.color }}>{item.moduleLabel} · {item.freq}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
