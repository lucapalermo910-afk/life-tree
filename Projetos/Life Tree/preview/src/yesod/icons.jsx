const IC = {
  plus:"M12 5v14M5 12h14", x:"M18 6 6 18M6 6l12 12", back:"M19 12H5m7 7-7-7 7-7", check:"M20 6 9 17l-5-5",
  bank:"M3 22h18M6 18V9M10 18V9M14 18V9M18 18V9M12 2L2 7h20L12 2", card:"M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 11h20",
  piggy:"M4 12h1m-1 4h13a3 3 0 0 0 0-6H8a2 2 0 0 0-2 2v4m14-4V8a2 2 0 0 0-2-2H8", wallet:"M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M21 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z",
  up:"M12 19V5m-7 7 7-7 7 7", down:"M12 5v14m7-7-7 7-7-7", refresh:"M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9M21 3v5h-5M3 21v-5h5",
  sun:"M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8z", chev:"M9 18l6-6-6-6",
  gear:"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  debt:"M2 17h20M6 17V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M10 12h4M12 9v6", scale:"M12 3v18M3 9h18M8 3l4 6 4-6M8 21l4-6 4 6M3 15a6 6 0 0 0 6-6M15 15a6 6 0 0 0 6-6",
  alvo:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  activity:"M22 12h-4l-3 9L9 3l-3 9H2", barchart:"M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  target:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z","M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  alert:"M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  treelife:["M12 2v20","M12 7l-4-4","M12 7l4-4","M12 13l-5-4","M12 13l5-4","M12 19l-4-3","M12 19l4-3","circle cx='12' cy='2' r='2'","circle cx='8' cy='11' r='2'","circle cx='16' cy='11' r='2'","circle cx='12' cy='8' r='2'","circle cx='8' cy='17' r='2'","circle cx='16' cy='17' r='2'","circle cx='12' cy='14' r='2'","circle cx='12' cy='20' r='2'"],
};

export function Ico({ n, size=16, color="currentColor", sw=1.5 }) {
  const d = IC[n]; if (!d) return null;
  const parts = Array.isArray(d) ? d : d.split(/(?=M)/).filter(Boolean);
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>{parts.map((p,i) => { if (p.startsWith("circle")) { const m = p.match(/cx='([\d.]+)' cy='([\d.]+)' r='([\d.]+)'/); if (m) return <circle key={i} cx={m[1]} cy={m[2]} r={m[3]} fill="none"/>; } return <path key={i} d={p}/>; })}</svg>);
}
