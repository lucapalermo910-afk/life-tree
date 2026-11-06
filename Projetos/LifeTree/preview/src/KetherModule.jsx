import { useState } from "react";
import { useCoachDataSync, notifyCoachDataUpdated } from "./shared/coachSync.js";
import { YESOD_ACTION_HANDLERS } from "./shared/yesodActions.js";
import { HOD_ACTION_HANDLERS } from "./shared/hodActions.js";
import { TIPHARETH_ACTION_HANDLERS } from "./shared/tipharethActions.js";
import { NETZACH_ACTION_HANDLERS } from "./shared/netzachActions.js";
import { CHOKMAH_ACTION_HANDLERS } from "./shared/chokmahActions.js";
import { BINAH_ACTION_HANDLERS } from "./shared/binahActions.js";
import { GEBURAH_ACTION_HANDLERS } from "./shared/geburahActions.js";
import { AREAS, sugerirArea } from "./shared/areaObjetivo.js";
import { typeColor, typeLabel, phaseLabel } from "./hod/helpers.js";
import { fmt } from "./yesod/constants.js";
import { GoalCard, PlanoCard } from "./shared/ui.jsx";
import {
  readIfPlan,
  criarIfPlan as criarIfPlanShared,
  addIfMeta as addIfMetaShared,
  removeIfMeta as removeIfMetaShared,
  addIfAcao as addIfAcaoShared,
  removeIfAcao as removeIfAcaoShared,
  apagarIfPlano as apagarIfPlanoShared,
} from "./shared/ifPlanActions.js";

// Protótipo do Desejo (Kether) — mesmo padrão do Controle/Malkuth (19/08/2026), mas pro
// lado das metas em vez dos hábitos: "assim como o Controle cuida dos hábitos, o Desejo
// cuida das metas". Três peças: (1) aba METAS — agregação bidirecional das metas reais
// dos 3 módulos que têm um conceito limpo de meta com done/toggle (Yesod/Hod/Tiphareth,
// mesmo mecanismo do Controle); (2) PROJETOS (26/08/2026) — espelho read-only do motor de
// projetos do Hod (`lifetree_hod_projects`), o único módulo com esse conceito; sem toggle
// porque fase de projeto não é um "feito/não feito" binário (avança por critério — ver
// `hod/constants.js` CRITERIA_BY_TYPE — não cabe num toque só, mesma lógica de deixar
// Geburah/Binah read-only no Controle); (3) DESEJOS — lista própria do Kether onde cada
// desejo (ex: "morar na Itália") pode derivar metas concretas em módulos impactados (ex:
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
  target: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  alert: ["M12 9v4","M12 17h.01","M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"],
  zap:  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
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
    // plano/metrica (29/08/2026, motor genérico de objetivo+plano — ver plano salvo)
    // incluídos além de {id,title,xp,done} de sempre — Kether só espelha (read-only, sem
    // onUpdate), edição continua só no módulo de origem.
    chave: "lifetree_fin_ygoals",
    read: () => readOtherModule("lifetree_fin_ygoals", []).map(g => ({ id: "yesod_" + g.id, rawId: g.id, descricao: g.descricao || null, title: g.title, xp: g.xp, done: g.done, plano: g.plano || null, metrica: g.metrica || null })),
    toggle: item => YESOD_ACTION_HANDLERS.toggle_ygoal({ match: item.title }),
  },
  hod: {
    label: "Profissional", color: "#f97316",
    chave: "lifetree_hod_carGoals",
    read: () => readOtherModule("lifetree_hod_carGoals", []).map(g => ({ id: "hod_" + g.id, rawId: g.id, title: g.title, xp: g.xp, done: g.done })),
    toggle: item => HOD_ACTION_HANDLERS.toggle_car_goal({ match: item.title }),
  },
  tiphareth: {
    label: "Autocuidado", color: "#eab308",
    chave: "lifetree_tiph_goals",
    read: () => readOtherModule("lifetree_tiph_goals", []).map(g => ({ id: "tiph_" + g.id, rawId: g.id, title: g.title, xp: g.xp, done: g.done })),
    toggle: item => TIPHARETH_ACTION_HANDLERS.toggle_goal({ match: item.title }),
  },
  // 05/11/2026 — objetivos de saúde com plano (geburah/ObjetivosTab.jsx, lifetree_geb_objetivos).
  geburah: {
    label: "Saúde", color: "#ef4444",
    chave: "lifetree_geb_objetivos",
    read: () => readOtherModule("lifetree_geb_objetivos", []).map(g => ({ id: "geb_" + g.id, rawId: g.id, descricao: g.descricao || null, title: g.title, xp: g.xp, done: g.done, plano: g.plano || null, metrica: null })),
    toggle: item => GEBURAH_ACTION_HANDLERS.toggle_objective({ match: item.title }),
  },
};

// ── Criar objetivo com plano (05/11/2026) ─────────────────────────────────────────────
// O Desejo é o ponto único de criação de objetivos (pedido do usuário): escolhe a área
// impactada, escreve o objetivo, e o Coach daquela área conduz a conversa (protocolo de
// objetivo com plano) e salva no módulo — que mostra, acompanha e edita. Só entram aqui as
// áreas que já têm create_objective com plano; as outras continuam pelos "Desejos" abaixo.
// Áreas e sugestão automática: shared/areaObjetivo.js (05/11/2026, sem etiquetas na criação).

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

export default function KetherModule({ onBack, dark, setDark, askCoach, abrirObjetivo }) {
  const C = dark ? DARK : LIGHT;
  const [, bump] = useState(0);
  const refresh = () => bump(n => n + 1);

  useCoachDataSync("yesod", refresh);
  useCoachDataSync("hod", refresh);
  useCoachDataSync("tiphareth", refresh);
  useCoachDataSync("netzach", refresh);
  useCoachDataSync("chokmah", refresh);
  useCoachDataSync("binah", refresh);
  useCoachDataSync("geburah", refresh);

  const [criandoObj, setCriandoObj] = useState(false);
  // Área escolhida à mão (via "Trocar"), junto com a sugestão que existia naquele momento:
  // se o usuário reescrever o objetivo e a sugestão mudar, a escolha manual deixa de valer.
  const [areaManualDe, setAreaManualDe] = useState(null); // { area, sugestao } | null
  const [trocandoArea, setTrocandoArea] = useState(false);
  const [tituloObj, setTituloObj] = useState("");
  const areaSugerida = sugerirArea(tituloObj);
  const areaManual = areaManualDe && areaManualDe.sugestao === (areaSugerida?.id ?? null) ? areaManualDe.area : null;
  const setAreaManual = id => setAreaManualDe(id ? { area: id, sugestao: areaSugerida?.id ?? null } : null);
  const areaSel = AREAS.find(a => a.id === areaManual) || areaSugerida;
  const podeCriar = !!(tituloObj.trim() && areaSel?.comPlano && askCoach);
  const pedirObjetivo = () => {
    if (!podeCriar) return;
    askCoach(areaSel.msg(tituloObj.trim()), areaSel.id);
    setTituloObj(""); setCriandoObj(false); setAreaManual(null); setTrocandoArea(false);
  };

  const [desejos, setDesejos] = useState(() => readOtherModule(DESEJOS_KEY, []));
  // Expande o plano (read-only) de uma meta com plano — mesmo padrão de toggle-só-uma-por-vez
  // já usado no resto do app (Yesod/Geburah). 29/08/2026, motor genérico de objetivo+plano.
  const [expandedMetaId, setExpandedMetaId] = useState(null);
  const [novo, setNovo] = useState(false);
  const [wishTitle, setWishTitle] = useState("");
  const [draftMetas, setDraftMetas] = useState([]);
  const [draftModule, setDraftModule] = useState("yesod");
  const [draftMetaTitle, setDraftMetaTitle] = useState("");

  // ── Objetivo Principal métrico: Independência Financeira (piloto financeiro, 29/08/2026) ──
  // Lógica movida pra shared/ifPlanActions.js em 30/08/2026 — a mesma tela de plano passou a
  // existir também dentro do Yesod (usuário pediu pra editar/apagar de lá, não só daqui), e as
  // duas precisam ler/escrever o mesmo plano sem duplicar a correção do bug de meta/hábito
  // órfão. Aqui só o wiring de estado local + inputs do formulário.
  const [ifPlan, setIfPlan] = useState(() => readIfPlan());
  const [ifMetaInput, setIfMetaInput] = useState("");
  const [ifAcaoInput, setIfAcaoInput] = useState("");
  const [ifAcaoFreq, setIfAcaoFreq] = useState("Diário");
  const criarIfPlan = () => setIfPlan(criarIfPlanShared());
  const addIfMeta = () => { setIfPlan(addIfMetaShared(ifPlan, ifMetaInput)); setIfMetaInput(""); };
  const removeIfMeta = id => setIfPlan(removeIfMetaShared(ifPlan, id));
  const addIfAcao = () => { setIfPlan(addIfAcaoShared(ifPlan, ifAcaoInput, ifAcaoFreq)); setIfAcaoInput(""); };
  const removeIfAcao = id => setIfPlan(removeIfAcaoShared(ifPlan, id));
  const apagarIfPlano = () => setIfPlan(apagarIfPlanoShared(ifPlan));

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

  // Apagar objetivo de qualquer área a partir do Desejo (06/11/2026, pedido do usuário: "não
  // dá pra deletar objetivos"). Escreve direto na chave do módulo de origem e avisa o módulo
  // pelo mesmo evento que as ações do Coach usam (coachSync.js), pra ele recarregar se estiver
  // montado. Pede confirmação: o plano e os passos vão junto.
  const apagarObjetivo = item => {
    const ad = GOAL_ADAPTERS[item.moduleId];
    if (!ad?.chave || item.rawId == null) return;
    if (!window.confirm("Apagar o objetivo \"" + item.title + "\"" + (item.plano ? " e o plano dele" : "") + "? Não dá para desfazer.")) return;
    try {
      const lista = readOtherModule(ad.chave, []);
      localStorage.setItem(ad.chave, JSON.stringify(lista.filter(g => g.id !== item.rawId)));
    } catch { return; }
    notifyCoachDataUpdated(item.moduleId);
    setExpandedMetaId(null);
    refresh();
  };

  // Renomear pelo Desejo (06/11/2026): mesmo caminho do apagar — escreve na chave do módulo de
  // origem. O nome anterior vira a descrição quando ainda não há uma.
  const renomearObjetivo = item => {
    const ad = GOAL_ADAPTERS[item.moduleId];
    if (!ad?.chave || item.rawId == null) return;
    const novo = window.prompt("Nome do objetivo (curto):", item.title);
    if (!novo || !novo.trim() || novo.trim() === item.title) return;
    try {
      const lista = readOtherModule(ad.chave, []);
      localStorage.setItem(ad.chave, JSON.stringify(lista.map(g => g.id !== item.rawId ? g : { ...g, title: novo.trim(), descricao: g.descricao || g.title })));
    } catch { return; }
    notifyCoachDataUpdated(item.moduleId);
    refresh();
  };

  const metas = Object.entries(GOAL_ADAPTERS).flatMap(([moduleId, ad]) =>
    ad.read().map(item => ({ ...item, moduleId, moduleLabel: ad.label, color: ad.color }))
  );
  const projects = readOtherModule("lifetree_hod_projects", []);

  // ifStatus: publicado pelo Yesod (Context) — progresso, projeção e "fora da rota" nunca
  // recalculados aqui, só refletidos. null enquanto o Yesod nunca foi aberto nesta sessão.
  const ifStatus = readOtherModule("lifetree_fin_ifstatus", null);
  const liveYGoals = readOtherModule("lifetree_fin_ygoals", []);
  const liveYHabits = readOtherModule("lifetree_fin_yhabits", []);
  const ifPct = ifStatus ? Math.min(100, Math.round((ifStatus.projection.net / ifStatus.projection.ifNeeded) * 100)) : 0;

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

        {ifStatus && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>OBJETIVO PRINCIPAL</div>
            <div style={{ background: C.card, border: "1px solid " + ACCENT + "33", borderRadius: 12, padding: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <Ico n="target" size={14} color={ACCENT}/>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}>Independência Financeira</span>
                <span style={{ fontSize: 8.5, fontWeight: 700, padding: "2.5px 7px", borderRadius: 5, background: "#10b98122", color: "#10b981" }}>Finanças</span>
              </div>

              {ifStatus.risk.atRisk && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#ef444418", border: "1px solid #ef444444", borderRadius: 9, padding: "8px 10px", marginBottom: 11 }}>
                  <Ico n="alert" size={13} color="#ef4444"/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: "#ef4444", marginBottom: 1 }}>Fora da rota</div>
                    <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{ifStatus.risk.reason} — atrasa ~{ifStatus.risk.delta} {ifStatus.risk.delta === 1 ? "mês" : "meses"}.</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: ACCENT }}>{ifPct}%</span>
                <span style={{ fontSize: 10, color: C.muted }}>{fmt(ifStatus.projection.net)} de {fmt(ifStatus.projection.ifNeeded)}</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: C.b1, overflow: "hidden", marginTop: 6, marginBottom: 12 }}>
                <div style={{ height: "100%", width: ifPct + "%", background: ACCENT, borderRadius: 99 }}/>
              </div>

              {!ifPlan ? (
                <div style={{ textAlign: "center", padding: "10px 4px" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 9 }}>Ainda não tem um plano pra chegar nessa meta.</div>
                  <button onClick={criarIfPlan} style={{ background: ACCENT, border: "none", borderRadius: 8, padding: "8px 16px", color: "#04222a", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Criar plano</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, margin: "4px 0 6px" }}>OBJETIVOS SECUNDÁRIOS</div>
                  {ifPlan.metas.map(m => {
                    const live = liveYGoals.find(g => g.title === m.title);
                    const done = live?.done || false;
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                        <button onClick={() => YESOD_ACTION_HANDLERS.toggle_ygoal({ match: m.title })}
                          style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                            border: "1.5px solid " + (done ? "#10b981" : C.b2), background: done ? "#10b981" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                          {done && <Ico n="check" size={9} color="#fff" sw={2.5}/>}
                        </button>
                        <span style={{ flex: 1, fontSize: 11, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{m.title}</span>
                        <button onClick={() => removeIfMeta(m.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: .5, display: "flex" }}>
                          <Ico n="x" size={10}/>
                        </button>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input value={ifMetaInput} onChange={e => setIfMetaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addIfMeta()}
                      placeholder="Ex: Elevar poupança pra 25%"
                      style={{ flex: 1, background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 11, outline: "none" }}/>
                    <button onClick={addIfMeta} style={{ background: C.b1, border: "none", borderRadius: 8, width: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ico n="plus" size={12} color={C.dim}/>
                    </button>
                  </div>

                  <div style={{ fontSize: 9, color: "#b45309", fontWeight: 700, letterSpacing: 1, margin: "14px 0 6px" }}>AÇÕES</div>
                  {ifPlan.acoes.map(a => {
                    const live = liveYHabits.find(h => h.title === a.title);
                    const done = live?.done || false;
                    return (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                        <button onClick={() => YESOD_ACTION_HANDLERS.toggle_yhabit({ match: a.title })}
                          style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                            border: "1.5px solid " + (done ? "#b45309" : C.b2), background: done ? "#b45309" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                          {done && <Ico n="check" size={9} color="#fff" sw={2.5}/>}
                        </button>
                        <span style={{ flex: 1, fontSize: 11, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{a.title}</span>
                        <span style={{ fontSize: 9, color: C.muted }}>{a.freq}</span>
                        <button onClick={() => removeIfAcao(a.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: .5, display: "flex" }}>
                          <Ico n="x" size={10}/>
                        </button>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input value={ifAcaoInput} onChange={e => setIfAcaoInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addIfAcao()}
                      placeholder="Ex: Revisar orçamento"
                      style={{ flex: 1, background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 11, outline: "none" }}/>
                    <select value={ifAcaoFreq} onChange={e => setIfAcaoFreq(e.target.value)}
                      style={{ background: C.bg, border: "1px solid " + C.b2, borderRadius: 8, padding: "7px 6px", color: C.text, fontSize: 10, outline: "none" }}>
                      <option>Diário</option><option>Semanal</option><option>Mensal</option>
                    </select>
                    <button onClick={addIfAcao} style={{ background: C.b1, border: "none", borderRadius: 8, width: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ico n="plus" size={12} color={C.dim}/>
                    </button>
                  </div>

                  <button onClick={apagarIfPlano} style={{ marginTop: 14, background: "none", border: "1px solid " + C.b1, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: C.muted, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <Ico n="x" size={11}/> Apagar plano
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>OBJETIVOS</div>
          {!criandoObj && (
            <button onClick={() => setCriandoObj(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: ACCENT, border: "none", borderRadius: 8, padding: "6px 12px", color: "#04222a", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
              <Ico n="plus" size={11} color="#04222a" sw={2.2}/> Objetivo
            </button>
          )}
        </div>
        {criandoObj && (
          <div style={{ background: C.card, border: "1px solid " + C.b1, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>Novo objetivo</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 10, lineHeight: 1.45 }}>
              Escreva o objetivo com as suas palavras. O app identifica a área, e o Coach dessa área pergunta o que falta e devolve um objetivo com número, prazo e marcos para você aprovar. Depois ele aparece no módulo.
            </div>
            <input value={tituloObj} onChange={e => setTituloObj(e.target.value)} placeholder="Ex: perder barriga até o verão, quitar o cartão" aria-label="Objetivo"
              onKeyDown={e => e.key === "Enter" && pedirObjetivo()}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid " + C.b2, background: C.surface, color: C.text, fontSize: 13, outline: "none" }}/>

            {/* Área: sugerida pelo texto, confirmada à vista, trocável com um toque. */}
            {tituloObj.trim() && (
              <div aria-live="polite" style={{ marginTop: 10, fontSize: 11.5, color: C.muted, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {areaSel ? (
                  <>
                    <span>Vai para:</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 800, color: areaSel.color }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: areaSel.color }}/>{areaSel.label}
                    </span>
                    {!areaManual && <span style={{ fontSize: 10 }}>(sugerido)</span>}
                  </>
                ) : <span>Não identifiquei a área. Escolha abaixo.</span>}
                {areaSel && (
                  <button onClick={() => setTrocandoArea(v => !v)} style={{ background: "none", border: "none", padding: "4px 2px", color: ACCENT, fontWeight: 800, fontSize: 11.5, cursor: "pointer" }}>
                    · {trocandoArea ? "Fechar" : "Trocar"}
                  </button>
                )}
              </div>
            )}
            {tituloObj.trim() && areaSel && !areaSel.comPlano && (
              <div style={{ marginTop: 6, fontSize: 10.5, color: "#f97316", lineHeight: 1.4 }}>
                {areaSel.label} ainda não tem plano pelo Coach. Troque para Saúde ou Finanças, ou use "Desejos" abaixo.
              </div>
            )}
            {tituloObj.trim() && (trocandoArea || !areaSel) && (
              <div role="group" aria-label="Escolher área" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {AREAS.map(a => (
                  <button key={a.id} disabled={!a.comPlano} aria-pressed={areaSel?.id === a.id}
                    onClick={() => { setAreaManual(a.id); setTrocandoArea(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", borderRadius: 9, textAlign: "left",
                      cursor: a.comPlano ? "pointer" : "default", opacity: a.comPlano ? 1 : .6,
                      border: "1.5px solid " + (areaSel?.id === a.id ? a.color : C.b1), background: areaSel?.id === a.id ? a.color + "18" : C.surface, color: C.text }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: a.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11.5, fontWeight: 700, flex: 1 }}>{a.label}</span>
                    {!a.comPlano && <span style={{ fontSize: 9, color: C.muted }}>em breve</span>}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { setCriandoObj(false); setTituloObj(""); setAreaManual(null); setTrocandoArea(false); }} style={{ padding: "9px 14px", borderRadius: 8, background: C.b1, border: "none", color: C.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
              <button onClick={pedirObjetivo} disabled={!podeCriar} style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: ACCENT, border: "none", color: "#04222a", fontWeight: 800, fontSize: 12, cursor: podeCriar ? "pointer" : "default", opacity: podeCriar ? 1 : .5 }}>Montar plano com o Coach</button>
            </div>
          </div>
        )}
        {metas.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 12 }}>
            Nenhum objetivo ainda. Toque em "+ Objetivo" para criar o primeiro.
          </div>
        )}
        {metas.map(item => item.plano ? (
          // Meta com plano (motor genérico) — mesmo GoalCard usado no módulo de origem, só
          // que read-only (sem onUpdate/onToggleStep de verdade): Kether nunca edita nem
          // recalcula, só espelha o que já foi salvo lá.
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4, fontSize: 9, color: item.color, fontWeight: 700 }}>{item.moduleLabel}</div>
            <GoalCard C={C} accent={item.color} label={item.title}
              pct={item.metrica?.id === "patrimonio_liquido" && ifStatus ? Math.max(0, Math.min(100, Math.round((ifStatus.projection.net / item.metrica.valor) * 100))) : Math.round((item.plano.steps.filter(s => s.done).length / item.plano.steps.length) * 100)}
              statLine={item.metrica?.id === "patrimonio_liquido" && ifStatus ? fmt(ifStatus.projection.net) + " de " + fmt(item.metrica.valor) : item.plano.steps.filter(s => s.done).length + " de " + item.plano.steps.length + " passos concluídos"}
              onClick={() => abrirObjetivo && item.rawId && (item.moduleId === "geburah" || item.moduleId === "yesod")
                ? abrirObjetivo(item.moduleId, item.rawId)
                : setExpandedMetaId(p => p === item.id ? null : item.id)}
              onEdit={() => renomearObjetivo(item)} onDelete={() => apagarObjetivo(item)}/>
            {expandedMetaId === item.id && (
              <div style={{ marginTop: 8 }}>
                <PlanoCard C={C} plano={item.plano} descricao={item.descricao || null} accent={item.color} onToggleStep={() => {}} onUpdate={() => {}} somenteLeitura/>
                <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginTop: 6 }}>Só leitura aqui — editar no módulo de origem ({item.moduleLabel}).</div>
              </div>
            )}
          </div>
        ) : (
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
            <button onClick={() => apagarObjetivo(item)} aria-label={"Apagar objetivo " + item.title}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexShrink: 0 }}>
              <Ico n="x" size={13} color={C.muted}/>
            </button>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>PROJETOS</span>
        </div>
        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 12 }}>
            Nenhum projeto no Profissional ainda.
          </div>
        )}
        {projects.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.card, border: "1px solid " + typeColor(p.type) + "22", borderRadius: 12, marginBottom: 7 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{p.name}</div>
              <div style={{ fontSize: 9, color: typeColor(p.type) }}>Profissional · {typeLabel(p.type)}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: typeColor(p.type), background: typeColor(p.type) + "18", borderRadius: 6, padding: "3px 8px" }}>{phaseLabel(p)}</span>
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
