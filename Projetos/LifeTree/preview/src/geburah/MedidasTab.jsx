// MedidasTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). medExpanded/fotos/fotoSel/
// fotoPending/fotoInputRef eram hoisted no shell só pra sobreviver ao remount da aba a
// cada render — agora que MedidasTab é um componente de módulo estável, viram useState/
// useRef local normal (fotos ainda é recarregado 1x do IndexedDB, ver shared/photoStore.js).
import { useState, useRef, useEffect, useContext } from "react";
import { savePhoto, getPhotos, deletePhoto, compressImage } from "../shared/photoStore.js";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, GREEN, BLUE, PURPLE, ORANGE, AMBER, Sheet, FI, FS, Card, Btn, Bar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { MEDIDAS_P, MEDIDAS_DESTAQUE, MEDIDAS_GRUPOS, FOTOS_COLLECTION, FOTO_TAGS } from "./constants.js";
import { uid, todayS, fmt1, fmtKg } from "./helpers.js";
import { RotinasList } from "./TreinoTab.jsx";

// Meses abreviados PT — usado só pelo mini-gráfico de tendência (últimos 3 meses).
const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// Agrega uma série de registros (já ordenada crescente por data) num ponto por mês, pros
// últimos `n` meses (incluindo o atual) — pega o registro mais recente até o fim de cada
// mês (carrega o último valor conhecido pra frente se não houver registro naquele mês
// específico, em vez de deixar buraco). Usado pelos cards "Meu Corpo"/"Gordura Corporal".
function lastNMonths(sortedEntries, key, n=3){
  const now = new Date(todayS()+"T12:00:00");
  const out = [];
  for(let i=n-1;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const endStr = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10);
    const entry = [...sortedEntries].reverse().find(p=>p.data<=endStr && p[key]!=null);
    out.push({label: MESES_PT[d.getMonth()], value: entry ? entry[key] : null});
  }
  return out;
}

// ─── Tela "Ver mais" (Meu Corpo/Gordura Corporal) — histórico com periodicidade ────
const PERIOD_OPTS = [{v:"diaria",l:"Diária"},{v:"semanal",l:"Semanal"},{v:"mensal",l:"Mensal"}];
const fmtDM = ds => ds.slice(5).split("-").reverse().join("/"); // "YYYY-MM-DD" → "DD/MM"

// Gera sempre os últimos 7 períodos terminando hoje, cada um ancorado na mesma "posição
// de data" que hoje (mesmo dia da semana pro semanal, mesmo dia do mês pro mensal) — pedido
// explícito do usuário, em vez de paginar por janelas arbitrárias.
function buildPeriods(periodicidade){
  const hoje = new Date(todayS()+"T12:00:00");
  const out = [];
  for(let i=6;i>=0;i--){
    let endD, label;
    if(periodicidade==="mensal"){
      // new Date(y,m,dia) estoura pro mês seguinte quando o mês-alvo é mais curto que o
      // dia de hoje (ex: hoje dia 30, mês-alvo = fevereiro → viraria 2/mar) — por isso
      // calcula o mês/ano primeiro e limita o dia ao último válido daquele mês.
      const rawM = hoje.getMonth()-i;
      const y = hoje.getFullYear()+Math.floor(rawM/12);
      const m = ((rawM%12)+12)%12;
      const lastDay = new Date(y,m+1,0).getDate();
      endD = new Date(y,m,Math.min(hoje.getDate(),lastDay));
      label = MESES_PT[m];
    } else {
      const dias = periodicidade==="semanal" ? i*7 : i;
      endD = new Date(hoje); endD.setDate(endD.getDate()-dias);
      label = fmtDM(endD.toISOString().slice(0,10));
    }
    out.push({label, endStr: endD.toISOString().slice(0,10)});
  }
  return out;
}
// Valor mais recente até (e incluindo) `endStr`, carregado pra frente — mesma lógica de
// carry-forward do lastNMonths acima, generalizada pra qualquer corte de data.
function valueAt(sortedEntries, key, endStr){
  const e = [...sortedEntries].reverse().find(p=>p.data<=endStr && p[key]!=null);
  return e ? e[key] : null;
}

export function MedidasTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { medidasCorp, perfil, pesoHoje, navyEstimate, pesosMeta, pesoMeta, pesoScore, perdaTotal, faltaPerder, diasRest,
    sortedPes, setPesagens, f, F, close, sh, openSh, toast_, streak, treinos7d, logTreino } = g;

  const [medExpanded,setMedExpanded] = useState(false);
  const [detailView,setDetailView] = useState(null); // null | "corpo" | "medidas" | "treinos" — cards clicáveis do Acompanhamento
  const [periodicidade,setPeriodicidade] = useState("semanal"); // diaria|semanal|mensal — só usado na tela de detalhe
  const [fotos,setFotos] = useState([]);
  const [fotoSel,setFotoSel] = useState([]); // até 2 ids selecionados pra ver/comparar
  const [fotoPending,setFotoPending] = useState(null); // {data} — preview antes de salvar
  const fotoInputRef = useRef(null);
  useEffect(()=>{ getPhotos(FOTOS_COLLECTION).then(setFotos).catch(()=>{}); },[]);

  const ult = medidasCorp.length?[...medidasCorp].sort((a,b)=>b.data.localeCompare(a.data))[0]:null;
  const pri = medidasCorp.length?[...medidasCorp].sort((a,b)=>a.data.localeCompare(b.data))[0]:null;
  // IMC — peso atual ÷ altura² (altura vem do Perfil, em cm → convertida pra metros aqui).
  // Mostrado dentro do card "Medidas Corporais" (não tem card próprio) — é só mais um
  // número derivado do mesmo peso que já aparece nos cards acima.
  const alturaM = (perfil.altura||0)/100;
  const imc = alturaM>0 ? pesoHoje/(alturaM*alturaM) : 0;
  const imcClass = imc<=0?{l:"—",c:C.muted}:imc<18.5?{l:"Abaixo do peso",c:BLUE}:imc<25?{l:"Peso normal",c:GREEN}:imc<30?{l:"Sobrepeso",c:"#f59e0b"}:imc<35?{l:"Obesidade Grau I",c:ACCENT}:imc<40?{l:"Obesidade Grau II",c:ACCENT}:{l:"Obesidade Grau III",c:ACCENT};
  // Massa magra — derivada de peso × (1 − %gordura), não é um campo próprio: reaproveita
  // a mesma estimativa (fórmula da Marinha) já usada no tile "Gordura (est.)" ao lado.
  const massaMagraHoje = navyEstimate!=null ? pesoHoje*(1-navyEstimate/100) : null;

  // Fotos de Progresso — armazenadas à parte, em IndexedDB (ver shared/photoStore.js),
  // não em usePersisted/localStorage como o resto do módulo.
  const onFotoFile = async (e) => {
    const file=e.target.files?.[0]; e.target.value="";
    if(!file) return;
    try{
      const dataUrl = await compressImage(file);
      setFotoPending({data:dataUrl});
      openSh("addFoto",{data:todayS(),tag:""});
    }catch{ toast_("Não consegui processar a imagem","#ef4444"); }
  };
  const saveFotoPending = async () => {
    if(!fotoPending) return;
    const rec = await savePhoto(FOTOS_COLLECTION,{data:fotoPending.data,date:f.data||todayS(),tag:f.tag||""});
    setFotos(p=>[...p,rec].sort((a,b)=>a.date.localeCompare(b.date)));
    setFotoPending(null);
    toast_("Foto registrada",ACCENT);
    close();
  };
  const toggleFotoSel = id => setFotoSel(p=>p.includes(id)?p.filter(x=>x!==id):(p.length<2?[...p,id]:p));
  const delFoto = async id => { await deletePhoto(id); setFotos(p=>p.filter(x=>x!==id)); setFotoSel(p=>p.filter(x=>x!==id)); };
  const selectedFotos = fotoSel.map(id=>fotos.find(x=>x.id===id)).filter(Boolean);

  // Dados dos mini-gráficos de tendência (Meu Corpo / Gordura Corporal) — 3 meses, um
  // ponto por mês (carrega o último valor conhecido pra frente quando o mês não tem
  // registro próprio).
  const pesoTrend = lastNMonths(sortedPes,"peso",3);
  const gorduraTrend = lastNMonths(sortedPes,"gordura",3);

  // Mini-gráfico de linha com 3 pontos, valor rotulado acima de cada ponto e o mês
  // abaixo — mesmo espírito visual pros dois cards simplificados (Meu Corpo/Gordura
  // Corporal), só troca a cor/unidade. Reaproveita fmt1 pra formatar o rótulo.
  const MiniTrendChart = (points,unit,color) => {
    const vals = points.map(p=>p.value).filter(v=>v!=null);
    if(!vals.length) return <div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"14px 0"}}>Sem dados suficientes</div>;
    const W=170,H=72,padX=16,padTop=20,padBot=16;
    const xN = points.length-1||1;
    const xOf = i => padX+(i/xN)*(W-padX*2);
    const vMax=Math.max(...vals), vMin=Math.min(...vals), flat=vMax===vMin;
    const vRange=(vMax-vMin)||1;
    // Sem variação real (1 só ponto, ou todos iguais) — centraliza na vertical em vez de
    // grudar embaixo (fallback antigo de vRange=1 fazia (v-vMin)/vRange dar sempre 0).
    const yOf = v => flat ? padTop+(H-padTop-padBot)/2 : (H-padBot)-((v-vMin)/vRange)*(H-padTop-padBot);
    const withVal = points.map((p,i)=>({...p,i})).filter(p=>p.value!=null);
    const path = withVal.map((p,idx)=>(idx===0?"M":"L")+xOf(p.i).toFixed(1)+","+yOf(p.value).toFixed(1)).join(" ");
    return (
      <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:H,display:"block",overflow:"visible"}} preserveAspectRatio="none">
        {points.map((p,i)=>(<line key={"gl"+i} x1={xOf(i)} x2={xOf(i)} y1={padTop} y2={H-padBot} stroke={C.b1} strokeWidth={1} strokeDasharray="3,3"/>))}
        {path&&<path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>}
        {withVal.map(p=>(
          <g key={"pt"+p.i}>
            <circle cx={xOf(p.i)} cy={yOf(p.value)} r={3.5} fill={color}/>
            <text x={xOf(p.i)} y={yOf(p.value)-7} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.text}>{fmt1(p.value)}</text>
          </g>
        ))}
        {points.map((p,i)=>(<text key={"lb"+i} x={xOf(i)} y={H-3} textAnchor="middle" fontSize={8} fill={C.muted}>{p.label}</text>))}
      </svg>
    );
  };

  // ── Tela de detalhe (Ver mais / clicar no card Meu Corpo) ──────────────────────
  const metaGordura = pesosMeta.metaGordura ?? null;
  const periods = buildPeriods(periodicidade);
  const periodData = periods.map(p=>({...p, peso:valueAt(sortedPes,"peso",p.endStr), gordura:valueAt(sortedPes,"gordura",p.endStr)}));
  const curPeso = periodData[6].peso, prevPeso = periodData[5].peso;
  const deltaPeriodoPeso = (curPeso!=null&&prevPeso!=null) ? curPeso-prevPeso : null;
  const deltaInicioPeso = curPeso!=null ? curPeso-pesosMeta.pesoAtual : null;
  const curGordura = periodData[6].gordura, prevGordura = periodData[5].gordura;
  const deltaPeriodoGordura = (curGordura!=null&&prevGordura!=null) ? curGordura-prevGordura : null;
  const primeiraGordura = sortedPes.find(p=>p.gordura!=null)?.gordura ?? null;
  const deltaInicioGordura = (curGordura!=null&&primeiraGordura!=null) ? curGordura-primeiraGordura : null;
  const faltaGordura = (navyEstimate!=null&&metaGordura!=null) ? Math.max(0,navyEstimate-metaGordura) : null;
  const gorduraScore = (metaGordura!=null&&primeiraGordura!=null&&navyEstimate!=null)
    ? Math.max(0,Math.min(100,Math.round((1-faltaGordura/(primeiraGordura-metaGordura+0.001))*100))) : 0;
  const arrowOf = d => d>0.05?"↑":d<-0.05?"↓":"→";

  // Gráfico único (peso + meta + gordura + meta de gordura), eixo X = os 7 períodos da
  // periodicidade escolhida — mesmo estilo visual do gráfico antigo (peso sólido, meta
  // tracejada verde, gordura tracejada roxa no eixo direito), só que agrupado por período
  // em vez de mostrar cada pesagem bruta.
  const PeriodChart = () => {
    const pts = periodData.map(p=>{
      const dias = Math.max(0,Math.round((new Date(p.endStr)-new Date(pesosMeta.iniciou))/86400000));
      const metaV = pesosMeta.pesoAtual-(pesosMeta.taxaSemanal/7)*dias;
      return {...p,metaV};
    });
    const hasGordura = pts.some(p=>p.gordura!=null);
    const kgVals = pts.flatMap(p=>[p.peso,p.metaV]).filter(v=>v!=null);
    if(!kgVals.length) return <div style={{textAlign:"center",padding:"20px 10px",color:C.muted,fontSize:11}}>Sem dados suficientes</div>;
    const W=300,H=160,padL=28,padR=hasGordura?30:8,padB=20,padT=10;
    const kgMax=Math.max(...kgVals)+0.4, kgMin=Math.min(...kgVals)-0.4, kgRange=(kgMax-kgMin)||1;
    const pctVals = pts.map(p=>p.gordura).filter(v=>v!=null).concat(metaGordura!=null?[metaGordura]:[]);
    const pctMax = pctVals.length?Math.max(...pctVals)+0.6:100, pctMin = pctVals.length?Math.min(...pctVals)-0.6:0, pctRange=(pctMax-pctMin)||1;
    const xN = pts.length-1||1;
    const xOf = i=>padL+(i/xN)*(W-padL-padR);
    const yKg = v=>(H-padB)-((v-kgMin)/kgRange)*(H-padB-padT);
    const yPct = v=>(H-padB)-((v-pctMin)/pctRange)*(H-padB-padT);
    const pathSimple=(key,yFn)=>pts.map((p,i)=>(i===0?"M":"L")+xOf(i).toFixed(1)+","+yFn(p[key]).toFixed(1)).join(" ");
    const pathGapped=(key,yFn)=>{
      const segs=[]; let cur=[];
      pts.forEach((p,i)=>{
        if(p[key]!=null) cur.push((cur.length===0?"M":"L")+xOf(i).toFixed(1)+","+yFn(p[key]).toFixed(1));
        else if(cur.length){segs.push(cur.join(" "));cur=[];}
      });
      if(cur.length) segs.push(cur.join(" "));
      return segs;
    };
    return (
      <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:H,display:"block",overflow:"visible"}} preserveAspectRatio="none">
        {[1,0.5,0].map((t,i)=>{
          const y=padT+(1-t)*(H-padB-padT);
          return(<g key={i}>
            <line x1={padL} x2={W-padR} y1={y} y2={y} stroke={C.b1} strokeWidth={1}/>
            <text x={padL-5} y={y+3} textAnchor="end" fontSize={7} fill={C.muted}>{fmt1(kgMin+t*kgRange)}</text>
            {hasGordura&&<text x={W-padR+5} y={y+3} textAnchor="start" fontSize={7} fill={PURPLE}>{Math.round(pctMin+t*pctRange)}%</text>}
          </g>);
        })}
        <path d={pathSimple("metaV",yKg)} fill="none" stroke={GREEN} strokeWidth={1.5} strokeDasharray="4,4" strokeLinecap="round"/>
        {metaGordura!=null&&<line x1={padL} x2={W-padR} y1={yPct(metaGordura)} y2={yPct(metaGordura)} stroke={PURPLE} strokeWidth={1.2} strokeDasharray="2,3" opacity={.55}/>}
        {pathGapped("peso",yKg).map((d,i)=>(<path key={"ps"+i} d={d} fill="none" stroke={ACCENT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>))}
        {hasGordura&&pathGapped("gordura",yPct).map((d,i)=>(<path key={"gd"+i} d={d} fill="none" stroke={PURPLE} strokeWidth={2} strokeDasharray="2,3" strokeLinecap="round" strokeLinejoin="round"/>))}
        {pts.map((p,i)=>p.peso!=null&&(<circle key={"pp"+i} cx={xOf(i)} cy={yKg(p.peso)} r={i===xN?4:2.5} fill={i===xN?ACCENT:C.surface} stroke={ACCENT} strokeWidth={1.5}/>))}
        {pts.map((p,i)=>(<text key={"lb"+i} x={xOf(i)} y={H-4} textAnchor="middle" fontSize={7} fill={C.muted}>{p.label}</text>))}
      </svg>
    );
  };

  return(
    <div style={{animation:"slideUp .3s ease"}}>
      {detailView==="corpo" ? (<>
      <button onClick={()=>setDetailView(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 10px"}}>
        <Ico n="back" size={12}/> voltar
      </button>

      {/* PESO */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Peso atual</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:C.muted}}>Meta: {fmtKg(pesoMeta)}</span>
            <button onClick={()=>openSh("editMetaPeso",{...pesosMeta})} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,fontSize:10,fontWeight:700}}>Editar</button>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8}}>
          <div style={{fontSize:32,fontWeight:900,color:ACCENT,lineHeight:1}}>{fmtKg(pesoHoje)}</div>
          <div style={{fontSize:10,color:C.muted,textAlign:"right"}}>{faltaPerder>0?"faltam "+fmt1(faltaPerder)+"kg para sua meta":"Meta atingida! 🎉"}</div>
        </div>
        <Bar value={pesoScore} color={"linear-gradient(90deg,"+ACCENT+","+GREEN+")"} height={5}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:8}}>
          <span style={{color:deltaPeriodoPeso==null?C.muted:deltaPeriodoPeso<0?GREEN:deltaPeriodoPeso>0?"#ef4444":C.muted,fontWeight:600}}>
            {deltaPeriodoPeso==null?"— vs período anterior":arrowOf(deltaPeriodoPeso)+" "+fmt1(Math.abs(deltaPeriodoPeso))+"kg vs período anterior"}
          </span>
          <span style={{color:deltaInicioPeso==null?C.muted:deltaInicioPeso<0?GREEN:deltaInicioPeso>0?"#ef4444":C.muted,fontWeight:600}}>
            {deltaInicioPeso==null?"—":arrowOf(deltaInicioPeso)+" "+fmt1(Math.abs(deltaInicioPeso))+"kg desde o início"}
          </span>
        </div>
      </Card>

      {/* GORDURA */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Gordura Corporal (est.)</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {metaGordura!=null&&<span style={{fontSize:10,color:C.muted}}>Meta: {fmt1(metaGordura)}%</span>}
            <button onClick={()=>openSh("editMetaPeso",{...pesosMeta})} style={{background:"none",border:"none",cursor:"pointer",color:PURPLE,fontSize:10,fontWeight:700}}>{metaGordura!=null?"Editar":"Definir meta"}</button>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8}}>
          <div style={{fontSize:32,fontWeight:900,color:PURPLE,lineHeight:1}}>{navyEstimate!=null?fmt1(navyEstimate)+"%":"—"}</div>
          <div style={{fontSize:10,color:C.muted,textAlign:"right"}}>
            {metaGordura==null?"Defina uma meta pra acompanhar":faltaGordura>0?"faltam "+fmt1(faltaGordura)+"% para sua meta":"Meta atingida! 🎉"}
          </div>
        </div>
        {metaGordura!=null&&<Bar value={gorduraScore} color={"linear-gradient(90deg,"+PURPLE+",#c4b5fd)"} height={5}/>}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:8}}>
          <span style={{color:deltaPeriodoGordura==null?C.muted:deltaPeriodoGordura<0?GREEN:deltaPeriodoGordura>0?"#ef4444":C.muted,fontWeight:600}}>
            {deltaPeriodoGordura==null?"— vs período anterior":arrowOf(deltaPeriodoGordura)+" "+fmt1(Math.abs(deltaPeriodoGordura))+"% vs período anterior"}
          </span>
          <span style={{color:deltaInicioGordura==null?C.muted:deltaInicioGordura<0?GREEN:deltaInicioGordura>0?"#ef4444":C.muted,fontWeight:600}}>
            {deltaInicioGordura==null?"—":arrowOf(deltaInicioGordura)+" "+fmt1(Math.abs(deltaInicioGordura))+"% desde o início"}
          </span>
        </div>
      </Card>

      {/* HISTÓRICO */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Histórico</div>
        <select value={periodicidade} onChange={e=>setPeriodicidade(e.target.value)}
          style={{background:C.surface,border:"1px solid "+C.b1,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:ACCENT,outline:"none"}}>
          {PERIOD_OPTS.map(o=><option key={o.v} value={o.v} style={{background:C.surface}}>{o.l}</option>)}
        </select>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{textAlign:"center",marginBottom:8}}>
          <span style={{fontSize:9,color:C.muted}}>{periods[0].label} – {periods[6].label}</span>
        </div>
        <PeriodChart/>
        <div style={{display:"flex",gap:12,fontSize:8,color:C.muted,marginTop:10,flexWrap:"wrap"}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2.5px solid "+ACCENT,display:"inline-block"}}/>Peso</span>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+GREEN,display:"inline-block"}}/>Meta de peso</span>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+PURPLE,display:"inline-block"}}/>% Gordura (eixo dir.)</span>
          {metaGordura!=null&&<span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"1.5px dashed "+PURPLE,display:"inline-block",opacity:.55}}/>Meta de gordura</span>}
        </div>
      </Card>

      {/* ÚLTIMAS ATUALIZAÇÕES */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Últimas Atualizações</div>
        <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS(),...(navyEstimate?{gordura:Math.round(navyEstimate*10)/10}:{})})}><Ico n="plus" size={11}/> Pesar</Btn>
      </div>
      <Card style={{marginBottom:14}}>
        {sortedPes.slice().reverse().slice(0,5).map(p=>{
          const meta=pesosMeta.pesoAtual-(pesosMeta.taxaSemanal/7)*Math.max(0,Math.round((new Date(p.data)-new Date(pesosMeta.iniciou))/86400000));
          const dif=p.peso-meta;
          const massaMagra=p.gordura!=null?p.peso*(1-p.gordura/100):null;
          return(<div key={p.id} style={{padding:"6px 0",borderTop:"1px solid "+C.b1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11}}>{p.data}</span>
              <span style={{fontSize:12,fontWeight:700,color:ACCENT}}>{fmtKg(p.peso)}</span>
              <span style={{fontSize:10,fontWeight:600,color:dif>0.2?"#ef4444":dif<-0.2?GREEN:C.muted}}>{dif>0?"+":""}{fmt1(dif)}kg vs meta</span>
              <button onClick={()=>setPesagens(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><Ico n="x" size={11} color={C.muted}/></button>
            </div>
            {p.gordura!=null&&<div style={{fontSize:9,marginTop:2}}><span style={{color:PURPLE,fontWeight:600}}>{fmt1(p.gordura)}% gordura</span> · <span style={{color:BLUE,fontWeight:600}}>{fmt1(massaMagra)}kg magra</span></div>}
          </div>);
        })}
      </Card>
      </>) : detailView==="medidas" ? (<>
      <button onClick={()=>setDetailView(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 10px"}}>
        <Ico n="back" size={12}/> voltar
      </button>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Medidas Corporais</div>
        <Btn sm full={false} onClick={()=>{const b={};MEDIDAS_P.forEach(m=>{b[m]=ult?.medidas[m]||0;});openSh("addMedidas",{data:todayS(),medidas:b});}}><Ico n="plus" size={11}/> Registrar</Btn>
      </div>
      {ult&&(function MedidasCard(){
        const MedTile=({label,value,unit,color,delta})=>(
          <div style={{background:C.surface,borderRadius:9,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{label.toUpperCase()}</div>
            <div style={{fontSize:15,fontWeight:800,color:color||ACCENT}}>{value}{unit}</div>
            {delta!=null&&<div style={{fontSize:9,color:delta<0?GREEN:"#ef4444",fontWeight:600}}>{delta<0?"":"+"} {fmt1(delta)}{unit}</div>}
          </div>
        );
        const MedTiles=pts=>pts.map(m=>{
          const at=ult.medidas[m]||0, an=pri?.medidas[m]||0;
          return <MedTile key={m} label={m} value={at} unit="cm" delta={an>0&&at!==an?at-an:null}/>;
        });
        const restCount=MEDIDAS_DESTAQUE.length+MEDIDAS_GRUPOS.reduce((s,g)=>s+g.pts.length,0);
        return(
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>CLASSIFICAÇÃO</div>
            <div style={{fontSize:15,color:imcClass.c,fontWeight:800,marginBottom:10}}>{imc>0?imcClass.l+" — IMC "+fmt1(imc):"—"}</div>
            <div style={{fontSize:9,color:C.muted}}>Última: {ult.data}</div>
            <button onClick={()=>setMedExpanded(e=>!e)} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,fontSize:11,fontWeight:700,padding:"10px 0 2px"}}>
              {medExpanded?"Ocultar medidas ▴":"Ver todas as medidas ("+restCount+") ▾"}
            </button>
            {medExpanded&&(<>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
                <MedTile label="Massa Magra" value={massaMagraHoje!=null?fmt1(massaMagraHoje):"—"} unit="kg" color={BLUE}/>
                {MedTiles(MEDIDAS_DESTAQUE)}
              </div>
              {MEDIDAS_GRUPOS.map(gr=>(
                <div key={gr.l} style={{marginTop:10}}>
                  {gr.pts.length>1&&<div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:6}}>{gr.l.toUpperCase()}</div>}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{MedTiles(gr.pts)}</div>
                </div>
              ))}
            </>)}
          </Card>
        );
      })()}

      {/* FOTOS DE PROGRESSO — vive só nesta página (pedido do usuário, antes ficava
          sempre visível no fim da aba Acompanhamento). */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Fotos de Progresso</div>
        <Btn sm full={false} onClick={()=>fotoInputRef.current?.click()}><Ico n="plus" size={11}/> Foto</Btn>
      </div>
      <input ref={fotoInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={onFotoFile}/>
      {fotos.length===0
        ? <div style={{textAlign:"center",padding:24,color:C.muted,fontSize:12}}>Nenhuma foto ainda — registre pra comparar sua evolução visual.</div>
        : (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {fotos.slice().reverse().map(foto=>{
              const sel=fotoSel.includes(foto.id);
              return(
                <div key={foto.id} onClick={()=>toggleFotoSel(foto.id)} style={{position:"relative",borderRadius:9,overflow:"hidden",cursor:"pointer",border:sel?"2.5px solid "+ACCENT:"2.5px solid transparent",aspectRatio:"3/4"}}>
                  <img src={foto.data} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(0deg,rgba(0,0,0,.65),transparent)",padding:"14px 5px 4px",fontSize:8,color:"#fff",fontWeight:700}}>{foto.date.slice(5).split("-").reverse().join("/")}{foto.tag?" · "+foto.tag:""}</div>
                  <button onClick={e=>{e.stopPropagation();delFoto(foto.id);}} style={{position:"absolute",top:4,left:4,width:16,height:16,borderRadius:99,background:"rgba(0,0,0,.55)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" size={9} color="#fff"/></button>
                  {sel&&<div style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:99,background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="check" size={10} color="#fff" sw={3}/></div>}
                </div>
              );
            })}
          </div>)}
      {fotoSel.length>0&&(
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn sm color={ACCENT} onClick={()=>openSh("verFotos",{})}>{fotoSel.length===2?"Comparar (2)":"Ver foto"}</Btn>
          <Btn sm outline color={C.muted} onClick={()=>setFotoSel([])}>Cancelar</Btn>
        </div>
      )}
      {sh==="addFoto"&&fotoPending&&(
        <Sheet title="Nova Foto de Progresso" onClose={()=>{setFotoPending(null);close();}}>
          <img src={fotoPending.data} alt="" style={{width:"100%",borderRadius:10,marginBottom:12,display:"block"}}/>
          <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
          <FS label="Ângulo (opcional)" value={f.tag||""} onChange={v=>F({tag:v})} opts={[{v:"",l:"Nenhum"},...FOTO_TAGS.map(t=>({v:t,l:t}))]}/>
          <Btn color={ACCENT} onClick={saveFotoPending}>Salvar</Btn>
        </Sheet>
      )}
      {sh==="verFotos"&&(
        <Sheet title={selectedFotos.length===2?"Comparar Fotos":"Foto"} onClose={close} wide={selectedFotos.length===2}>
          <div style={{display:"flex",gap:8}}>
            {selectedFotos.map(foto=>(
              <div key={foto.id} style={{flex:1}}>
                <img src={foto.data} alt="" style={{width:"100%",borderRadius:10,display:"block"}}/>
                <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:6}}>{foto.date.split("-").reverse().join("/")}{foto.tag?" · "+foto.tag:""}</div>
              </div>
            ))}
          </div>
          <Btn outline color={C.muted} style={{marginTop:14}} onClick={()=>{setFotoSel([]);close();}}>Fechar seleção</Btn>
        </Sheet>
      )}
      </>) : detailView==="treinos" ? (<>
      <button onClick={()=>setDetailView(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.dim,fontSize:11,fontWeight:600,padding:"0 0 10px"}}>
        <Ico n="back" size={12}/> voltar
      </button>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Treinos Feitos</div>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}}>Essa semana</div>
            <div style={{fontSize:26,fontWeight:900,color:ORANGE,lineHeight:1}}>{treinos7d}</div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}}>No total</div>
            <div style={{fontSize:26,fontWeight:900,color:ORANGE,lineHeight:1}}>{logTreino.length}</div>
          </div>
        </div>
        {streak>0&&(
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,paddingTop:10,borderTop:"1px solid "+C.b1,fontSize:11,color:streak>=7?AMBER:ACCENT,fontWeight:700}}>
            <span>{streak>=7?"🔥":"💪"}</span>
            <span>{streak} {streak===1?"dia seguido treinando":"dias seguidos treinando"}{streak>=7?" — semana completa!":""}</span>
          </div>
        )}
      </Card>

      <RotinasList/>
      </>) : (<>

      {/* MEU CORPO — resumo simples (peso atual + meta + mini-gráfico dos últimos 3 meses).
          Card inteiro é clicável (pedido do usuário) e abre a tela de detalhe interativa
          (periodicidade diária/semanal/mensal, peso+gordura+metas), ver detailView==="corpo". */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Meu Corpo</div>
      </div>
      <Card onClick={()=>setDetailView("corpo")} style={{marginBottom:14}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:"0 0 38%"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}}>Peso atual</div>
            <div style={{fontSize:26,fontWeight:900,color:ACCENT,lineHeight:1}}>{fmtKg(pesoHoje)}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>meta: {fmtKg(pesoMeta)}</div>
            <span style={{display:"block",color:ACCENT,fontSize:11,fontWeight:700,padding:"10px 0 0"}}>Ver mais →</span>
          </div>
          <div style={{flex:1,minWidth:0}}>{MiniTrendChart(pesoTrend,"kg",ACCENT)}</div>
        </div>
      </Card>

      {/* GORDURA CORPORAL — mesmo estilo visual do card Meu Corpo, logo abaixo dele (pedido
          do usuário). "Ver mais" abre o mesmo detalhamento (o gráfico completo já traça
          %gordura junto com peso/massa magra). */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Gordura Corporal</div>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:"0 0 38%"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}}>Atual (est.)</div>
            <div style={{fontSize:26,fontWeight:900,color:PURPLE,lineHeight:1}}>{navyEstimate!=null?fmt1(navyEstimate)+"%":"—"}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>fórmula da Marinha</div>
            <button onClick={()=>setDetailView("corpo")} style={{background:"none",border:"none",cursor:"pointer",color:PURPLE,fontSize:11,fontWeight:700,padding:"10px 0 0"}}>Ver mais →</button>
          </div>
          <div style={{flex:1,minWidth:0}}>{MiniTrendChart(gorduraTrend,"%",PURPLE)}</div>
        </div>
      </Card>

      {/* MEDIDAS CORPORAIS — resumo simples (classificação + última data). Card inteiro é
          clicável (pedido do usuário) e abre a página de detalhe com o registro completo de
          medidas + Fotos de Progresso, ver detailView==="medidas". */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Medidas Corporais</div>
      </div>
      <Card onClick={()=>setDetailView("medidas")} style={{marginBottom:14}}>
        <div style={{fontSize:9,color:C.muted,marginBottom:2}}>CLASSIFICAÇÃO</div>
        <div style={{fontSize:15,color:imcClass.c,fontWeight:800,marginBottom:10}}>{imc>0?imcClass.l+" — IMC "+fmt1(imc):"—"}</div>
        <div style={{fontSize:9,color:C.muted}}>{ult?"Última: "+ult.data:"Nenhum registro ainda"}</div>
        <span style={{display:"block",color:ACCENT,fontSize:11,fontWeight:700,padding:"10px 0 0"}}>Ver mais →</span>
      </Card>

      {/* MEUS TREINOS — resumo (frequência 7d + streak). Card inteiro é clicável e abre a
          página com quantidade de treinos feitos + Minhas Rotinas (editar), ver
          detailView==="treinos". */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Meus Treinos</div>
      </div>
      <Card onClick={()=>setDetailView("treinos")} style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:4}}>Essa semana</div>
            <div style={{fontSize:26,fontWeight:900,color:ORANGE,lineHeight:1}}>{treinos7d}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>{treinos7d===1?"treino nos últimos 7 dias":"treinos nos últimos 7 dias"}</div>
          </div>
          {streak>0&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:20}}>{streak>=7?"🔥":"💪"}</div>
              <div style={{fontSize:14,fontWeight:800,color:streak>=7?AMBER:ACCENT}}>{streak}</div>
              <div style={{fontSize:8,color:C.muted}}>{streak===1?"dia seguido":"dias seguidos"}</div>
            </div>
          )}
        </div>
        <span style={{display:"block",color:ORANGE,fontSize:11,fontWeight:700,padding:"10px 0 0"}}>Ver mais →</span>
      </Card>

      </>)}
    </div>
  );
}

export function RegistrarPesoSheet(){
  const g = useGeburah();
  const { f, F, close, navyEstimate, setPesagens, toast_ } = g;
  return(
    <Sheet title="Registrar Peso" onClose={close}>
      <FI label="Peso (kg)" value={f.peso||0} onChange={v=>F({peso:v})} type="number" step={0.1} min={30} max={250}/>
      <FI label="% Gordura corporal (opcional)" value={f.gordura||""} onChange={v=>F({gordura:v})} type="number" step={0.1} min={3} max={60}
        hint={navyEstimate?"Pré-preenchido com estimativa por fórmula (Cintura/Pescoço/Altura) — ajuste se tiver uma medição real":"Deixe em branco se não souber — dá pra registrar depois"}/>
      <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
      <Btn color={ACCENT} onClick={()=>{if(!f.peso)return;setPesagens(p=>[...p.filter(x=>x.data!==f.data),{id:"ps"+uid(),data:f.data||todayS(),peso:Number(f.peso),...(f.gordura?{gordura:Number(f.gordura)}:{})}]);toast_("✓ Pesagem registrada");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function EditMetaPesoSheet(){
  const g = useGeburah();
  const { f, F, close, setPesosMeta, toast_ } = g;
  return(
    <Sheet title="Meta de Peso" onClose={close}>
      <FI label="Peso inicial (kg)" value={f.pesoAtual||0} onChange={v=>F({pesoAtual:v})} type="number" step={0.1}/>
      <FI label="Peso meta (kg)" value={f.pesoMeta||0} onChange={v=>F({pesoMeta:v})} type="number" step={0.1}/>
      <FI label="Perda semanal (kg)" value={f.taxaSemanal||0.5} onChange={v=>F({taxaSemanal:v})} type="number" step={0.1} min={0.1} max={1}/>
      <FI label="Data de início" value={f.iniciou||todayS()} onChange={v=>F({iniciou:v})} type="date"/>
      <FI label="Meta de % Gordura (opcional)" value={f.metaGordura??""} onChange={v=>F({metaGordura:v})} type="number" step={0.1} min={3} max={60}
        hint="Deixe em branco pra não acompanhar meta de gordura corporal"/>
      <Btn color={ACCENT} onClick={()=>{setPesosMeta({pesoAtual:Number(f.pesoAtual),pesoMeta:Number(f.pesoMeta),taxaSemanal:Number(f.taxaSemanal),iniciou:f.iniciou,metaGordura:f.metaGordura!==""&&f.metaGordura!=null?Number(f.metaGordura):null});toast_("Meta atualizada");close();}}>Salvar</Btn>
    </Sheet>
  );
}

export function AddMedidasSheet(){
  const g = useGeburah();
  const { f, F, close, setMedidasCorp, toast_ } = g;
  return(
    <Sheet title="Registrar Medidas" onClose={close}>
      <FI label="Data" value={f.data||todayS()} onChange={v=>F({data:v})} type="date"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {MEDIDAS_P.map(m=><FI key={m} label={m+(m==="Peso"?" (kg)":" (cm)")} value={(f.medidas||{})[m]||0} onChange={v=>F({medidas:{...(f.medidas||{}),[m]:v}})} type="number" step={0.1}/>)}
      </div>
      <Btn color={ACCENT} onClick={()=>{if(!f.data)return;setMedidasCorp(p=>[...p.filter(x=>x.data!==f.data),{id:"mc"+uid(),data:f.data,medidas:f.medidas||{}}].sort((a,b)=>a.data.localeCompare(b.data)));toast_("Medidas registradas");close();}}>Salvar</Btn>
    </Sheet>
  );
}
