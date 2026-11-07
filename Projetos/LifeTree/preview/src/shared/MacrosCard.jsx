// Cartão das metas de dieta calculadas por shared/macros.js (05/11/2026). Usado na
// pré-visualização do plano (App.jsx) e no objetivo salvo (geburah/ObjetivosTab.jsx).
const fmt = (n) => Number(n).toLocaleString("pt-BR");

// Edição (06/11/2026): no modo de edição do plano o cartão vira calculadora. O usuário ajusta
// os dados (peso atual, peso-meta, treinos por semana) e as alavancas (perda por semana,
// calorias, proteína); quem chama recalcula com calcularMacros e devolve o novo `m`.
// onChange(campo, valor) com campo em: peso_kg, peso_meta_kg, duracao_treino_min, kgSemana, cal, prot.
// Treinos por semana vêm do quadro de treino (TreinoCard) e aparecem aqui só para leitura.
export function MacrosCard({ C, m, prazo, accent = "#ef4444", editando = false, onChange = null, dieta = null }) {
  if (!m) return null;
  const semanasAtePrazo = prazo ? Math.floor((new Date(prazo + "T00:00:00") - new Date(new Date().toDateString())) / (7 * 86400000)) : null;
  // Com simulação (07/11/2026): a data estimada da meta vem do dia a dia, não da linha reta.
  const prazoCurto = m.chegada && prazo ? m.chegada > prazo : m.semanas != null && semanasAtePrazo != null && m.semanas > semanasAtePrazo;
  const br = (s) => (s ? s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4) : "—");
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
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: accent, marginBottom: 8 }}>METAS DE DIETA</div>

      {ed && dieta && (
        <>
          {sub("SEUS DADOS")}
          <div style={{ display: "flex", gap: 6 }}>
            {campo("Peso atual", "peso_kg", dieta.peso_kg, "kg", 0.1)}
            {campo("Peso-meta", "peso_meta_kg", dieta.peso_meta_kg, "kg", 0.1)}
            {campo("Treino", "duracao_treino_min", dieta.duracao_treino_min ?? m.duracaoTreino ?? 60, "min", 5)}
          </div>
          {sub("RITMO")}
          <div style={{ display: "flex", gap: 6 }}>
            {campo("Perda por semana", "kgSemana", m.kgSemana, "kg", 0.05)}
            {m.chegada ? (
              <div style={caixa}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{br(m.chegada)}</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Meta estimada</div>
              </div>
            ) : valor("Semanas até a meta", m.semanas ?? "—", "")}
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
        {m.base != null ? (
          <>Gasto estimado hoje: {fmt(m.gasto)} kcal/dia = dia a dia {fmt(m.base)} (basal {fmt(m.tmb)} × 1,2) + treino {fmt(m.kcalTreinoDia)} ({m.treinos_semana}× {m.duracaoTreino} min/sem) + cardio {fmt(m.kcalCardioDia)} ({m.cardio_min_semana} min/sem).</>
        ) : (
          <>Gasto estimado: {fmt(m.gasto)} kcal/dia (basal {fmt(m.tmb)} × {dec(m.fator)}).</>
        )}
        {m.objetivo === "perder" && m.kgSemana > 0 && <> Perda agora: {dec(m.kgSemana)} kg/semana.</>}
        {m.chegada && <> Meta estimada em <b style={{ color: C.text }}>{br(m.chegada)}</b> — simulação dia a dia, com o basal caindo junto com o peso e as calorias replanejadas a cada etapa.</>}
      </div>
      {prazoCurto && aviso(m.chegada
        ? "Pela simulação, a meta chega em " + br(m.chegada) + ", depois do prazo" + (m.pesoNoPrazo ? " (no prazo: " + dec(m.pesoNoPrazo) + " kg)" : "") + ". Ajuste o prazo ou o ritmo."
        : "No ritmo atual, a meta leva cerca de " + m.semanas + " semanas, e o prazo tem " + Math.max(0, semanasAtePrazo) + ". Ajuste o prazo ou o ritmo.")}
      {m.limitadoPeloPiso && aviso("Esse ritmo exigiria comer abaixo do mínimo seguro (" + fmt(m.piso) + " kcal). As calorias ficaram no mínimo, e a perda real é de " + dec(m.kgSemana) + " kg/semana.")}
      {!m.limitadoPeloPiso && m.abaixoDoPiso && aviso("Abaixo do mínimo seguro de " + fmt(m.piso) + " kcal/dia. Só com acompanhamento médico.")}
      {m.ritmoAlto && aviso("Acima de 1% do peso por semana: ritmo agressivo, com mais risco de perder massa muscular.")}
      {m.carbZerado && aviso("Proteína e gordura já ocupam todas as calorias; o carboidrato ficou zerado.")}
      <div style={{ fontSize: 9.5, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
        Estimativa: basal de Mifflin-St Jeor; treino e cardio por minutos (intensidade moderada){m.ajustado ? ", com os ajustes feitos por você" : "; déficit de ~0,7% do peso por semana; proteína de 1,8 g por kg do peso-meta"}. As pesagens reais vão calibrar essa conta. Confirme com seu médico ou nutricionista, principalmente se usar medicação para peso.
      </div>
    </div>
  );
}
