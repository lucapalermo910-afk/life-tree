// MedidasTab, extraído de GeburahModule.jsx (21/08/2026, item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). medExpanded/fotos/fotoSel/
// fotoPending/fotoInputRef eram hoisted no shell só pra sobreviver ao remount da aba a
// cada render — agora que MedidasTab é um componente de módulo estável, viram useState/
// useRef local normal (fotos ainda é recarregado 1x do IndexedDB, ver shared/photoStore.js).
import { useState, useRef, useEffect, useContext } from "react";
import { savePhoto, getPhotos, deletePhoto, compressImage } from "../shared/photoStore.js";
import { useGeburah } from "./context.js";
import { ThemeCtx, ACCENT, GREEN, BLUE, PURPLE, Sheet, FI, FS, Card, Btn, Bar } from "./theme.js";
import { Ico } from "./icons.jsx";
import { MEDIDAS_P, MEDIDAS_DESTAQUE, MEDIDAS_GRUPOS, FOTOS_COLLECTION, FOTO_TAGS } from "./constants.js";
import { uid, todayS, fmt1, fmtKg } from "./helpers.js";

export function MedidasTab(){
  const C = useContext(ThemeCtx);
  const g = useGeburah();
  const { medidasCorp, perfil, pesoHoje, navyEstimate, pesosMeta, pesoMeta, pesoScore, perdaTotal, faltaPerder, diasRest,
    sortedPes, setPesagens, f, F, close, sh, openSh, toast_ } = g;

  const [medExpanded,setMedExpanded] = useState(false);
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

  return(
    <div style={{animation:"slideUp .3s ease"}}>
      <Card color={ACCENT} style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:800}}>Meta de Peso</div>
          <Btn sm full={false} onClick={()=>openSh("editMetaPeso",{...pesosMeta})}><Ico n="edit" size={11}/> Editar</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[["INICIAL",fmtKg(pesosMeta.pesoAtual),ACCENT],["META",fmtKg(pesoMeta),GREEN],["PERDA/SEM",fmtKg(pesosMeta.taxaSemanal),C.text]].map(([l,v,c])=>(
            <div key={l} style={{background:C.surface,borderRadius:9,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:8,color:C.muted}}>{l}</div>
              <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <Bar value={pesoScore} color={"linear-gradient(90deg,"+ACCENT+","+GREEN+")"} height={5}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:3}}>
          <span>Perdeu {fmt1(perdaTotal)}kg</span><span>Falta {fmt1(faltaPerder)}kg · ~{diasRest} dias</span>
        </div>
      </Card>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800}}>Peso &amp; Composição</div>
        <Btn sm full={false} onClick={()=>openSh("registrarPeso",{peso:pesoHoje,data:todayS(),...(navyEstimate?{gordura:Math.round(navyEstimate*10)/10}:{})})}><Ico n="plus" size={11}/> Pesar</Btn>
      </div>
      <Card style={{marginBottom:14}}>
        {(function PesoComposicaoChart(){
          const windowPts=sortedPes;
          const fmtDate=ds=>ds.slice(5).split("-").reverse().join("/");
          const fmtDateFull=ds=>ds.split("-").reverse().join("/");
          return(<div>
            <div style={{textAlign:"center",marginBottom:8}}>
              <span style={{fontSize:9,color:C.muted}}>{windowPts.length?fmtDateFull(windowPts[0].data)+" – "+fmtDateFull(windowPts[windowPts.length-1].data):"—"}</span>
            </div>
            {windowPts.length===0
              ? <div style={{textAlign:"center",padding:"20px 10px",color:C.muted,fontSize:11}}>Nenhum registro nesse período</div>
              : (function Chart(){
                  // Peso/Meta sempre existem em todo ponto; Massa Magra/%Gordura são
                  // derivados só quando aquela pesagem também tem gordura registrada —
                  // por isso os dois têm caminho "com buracos" (pathGapped), diferente
                  // do Peso/Meta que usam um <path> único (pathSimple).
                  const pts=windowPts.map(p=>{
                    const dias=Math.max(0,Math.round((new Date(p.data)-new Date(pesosMeta.iniciou))/86400000));
                    const metaV=pesosMeta.pesoAtual-(pesosMeta.taxaSemanal/7)*dias;
                    const massaMagra=p.gordura!=null?p.peso*(1-p.gordura/100):null;
                    return {...p,metaV,massaMagra};
                  });
                  const hasComp=pts.some(p=>p.gordura!=null);
                  const W=300,H=150,padL=28,padR=hasComp?26:6,padB=18,padT=8;
                  const kgVals=pts.flatMap(p=>[p.peso,p.metaV,p.massaMagra]).filter(v=>v!=null);
                  const kgMax=Math.max(...kgVals)+0.4, kgMin=Math.min(...kgVals)-0.4, kgRange=(kgMax-kgMin)||1;
                  const pctVals=pts.map(p=>p.gordura).filter(v=>v!=null);
                  const pctMax=pctVals.length?Math.max(...pctVals)+0.6:100;
                  const pctMin=pctVals.length?Math.min(...pctVals)-0.6:0;
                  const pctRange=(pctMax-pctMin)||1;
                  const xN=pts.length-1||1;
                  const xOf=i=>padL+(i/xN)*(W-padL-padR);
                  const yKg=v=>(H-padB)-((v-kgMin)/kgRange)*(H-padB-padT);
                  const yPct=v=>(H-padB)-((v-pctMin)/pctRange)*(H-padB-padT);
                  const pathSimple=(key,yFn)=>pts.map((p,i)=>(i===0?"M":"L")+xOf(i).toFixed(1)+","+yFn(p[key]).toFixed(1)).join(" ");
                  const pathGapped=(key,yFn)=>{
                    const segs=[]; let cur=[];
                    pts.forEach((p,i)=>{
                      if(p[key]!=null) cur.push((cur.length===0?"M":"L")+xOf(i).toFixed(1)+","+yFn(p[key]).toFixed(1));
                      else if(cur.length){ segs.push(cur.join(" ")); cur=[]; }
                    });
                    if(cur.length) segs.push(cur.join(" "));
                    return segs;
                  };
                  const lastIdx=pts.length-1;
                  const gridSteps=[1,0.5,0]; // posições relativas topo/meio/base — cada eixo rotula com seu próprio valor
                  const xLabelIdxs=pts.length<=4?pts.map((_,i)=>i):[0,Math.round(xN/3),Math.round(xN*2/3),xN];
                  const last=pts[lastIdx];
                  return(<div>
                    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:H,display:"block",overflow:"visible"}} preserveAspectRatio="none">
                      {gridSteps.map((t,i)=>{
                        const y=padT+(1-t)*(H-padB-padT);
                        return(<g key={i}>
                          <line x1={padL} x2={W-padR} y1={y} y2={y} stroke={C.b1} strokeWidth={1}/>
                          <text x={padL-5} y={y+3} textAnchor="end" fontSize={7} fill={C.muted}>{fmt1(kgMin+t*kgRange)}</text>
                          {hasComp&&<text x={W-padR+5} y={y+3} textAnchor="start" fontSize={7} fill={PURPLE}>{Math.round(pctMin+t*pctRange)}%</text>}
                        </g>);
                      })}
                      <path d={pathSimple("metaV",yKg)} fill="none" stroke={GREEN} strokeWidth={1.5} strokeDasharray="4,4" strokeLinecap="round"/>
                      <path d={pathSimple("peso",yKg)} fill="none" stroke={ACCENT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
                      {pathGapped("massaMagra",yKg).map((d,i)=>(<path key={"mm"+i} d={d} fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>))}
                      {hasComp&&pathGapped("gordura",yPct).map((d,i)=>(<path key={"gd"+i} d={d} fill="none" stroke={PURPLE} strokeWidth={2} strokeDasharray="2,3" strokeLinecap="round" strokeLinejoin="round"/>))}
                      {pts.map((p,i)=>(<circle key={p.id} cx={xOf(i)} cy={yKg(p.peso)} r={i===lastIdx?4:2.5} fill={i===lastIdx?ACCENT:C.surface} stroke={ACCENT} strokeWidth={1.5}/>))}
                      {xLabelIdxs.map(i=>(<text key={i} x={xOf(i)} y={H-3} textAnchor="middle" fontSize={7} fill={C.muted}>{fmtDate(pts[i].data)}</text>))}
                    </svg>
                    <div style={{display:"flex",justifyContent:"flex-end",gap:12,fontSize:9,fontWeight:700,marginTop:4}}>
                      <span style={{color:ACCENT}}>{fmtKg(last.peso)}</span>
                      {last.massaMagra!=null&&<span style={{color:BLUE}}>{fmt1(last.massaMagra)}kg magra</span>}
                      {last.gordura!=null&&<span style={{color:PURPLE}}>{fmt1(last.gordura)}%</span>}
                    </div>
                  </div>);
                })()}
            <div style={{display:"flex",gap:12,fontSize:8,color:C.muted,marginTop:10,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2.5px solid "+ACCENT,display:"inline-block"}}/>Peso</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+GREEN,display:"inline-block"}}/>Meta</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px solid "+BLUE,display:"inline-block"}}/>Massa magra</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:0,borderTop:"2px dashed "+PURPLE,display:"inline-block"}}/>% Gordura (eixo dir.)</span>
            </div>
          </div>);
        })()}
        {sortedPes.slice().reverse().slice(0,3).map(p=>{
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
        const restCount=MEDIDAS_GRUPOS.reduce((s,g)=>s+g.pts.length,0);
        return(
          <Card>
            {imc>0&&<div style={{fontSize:14,color:imcClass.c,fontWeight:800,marginBottom:10}}>{imcClass.l}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <MedTile label="IMC" value={imc>0?fmt1(imc):"—"} unit="" color={imcClass.c}/>
              <MedTile label="Gordura (est.)" value={navyEstimate!=null?fmt1(navyEstimate):"—"} unit="%" color={PURPLE}/>
              <MedTile label="Massa Magra" value={massaMagraHoje!=null?fmt1(massaMagraHoje):"—"} unit="kg" color={BLUE}/>
              {MedTiles(MEDIDAS_DESTAQUE)}
            </div>
            <div style={{fontSize:9,color:C.muted,marginTop:8}}>Última: {ult.data}</div>
            <button onClick={()=>setMedExpanded(e=>!e)} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,fontSize:11,fontWeight:700,padding:"10px 0 2px"}}>
              {medExpanded?"Ocultar medidas ▴":"Ver todas as medidas ("+restCount+") ▾"}
            </button>
            {medExpanded&&MEDIDAS_GRUPOS.map(gr=>(
              <div key={gr.l} style={{marginTop:10}}>
                {gr.pts.length>1&&<div style={{fontSize:9,color:ACCENT,fontWeight:700,letterSpacing:1,marginBottom:6}}>{gr.l.toUpperCase()}</div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{MedTiles(gr.pts)}</div>
              </div>
            ))}
          </Card>
        );
      })()}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,marginBottom:10}}>
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
      <Btn color={ACCENT} onClick={()=>{setPesosMeta({pesoAtual:Number(f.pesoAtual),pesoMeta:Number(f.pesoMeta),taxaSemanal:Number(f.taxaSemanal),iniciou:f.iniciou});toast_("Meta atualizada");close();}}>Salvar</Btn>
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
