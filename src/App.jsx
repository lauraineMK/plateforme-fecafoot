import React, { useState, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import {
  Trophy, Calendar, Users, Search, Shield, Star, MapPin, Lock, ChevronRight,
  Activity, Target, Eye, Plus, Check, TrendingUp, Flag, ArrowLeft, X, Goal,
} from "lucide-react";

/* ===================== THÈME ===================== */
const T = {
  green900:"#0A3B2A", green800:"#0E4D37", green700:"#14664A", green100:"#DDEBE4",
  gold:"#E4B23C", goldDeep:"#C9932A", red:"#C1272D", paper:"#F3F6F2", card:"#FFFFFF",
  ink:"#15201B", muted:"#5F6F67", line:"#E1E8E3",
};
const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
const num = { fontVariantNumeric:"tabular-nums" };
const clamp = (x,a,b)=> Math.max(a, Math.min(b,x));

/* ===================== RNG déterministe ===================== */
function xmur3(str){ let h=1779033703 ^ str.length;
  for(let i=0;i<str.length;i++){ h=Math.imul(h ^ str.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19); }
  return ()=>{ h=Math.imul(h ^ (h>>>16),2246822507); h=Math.imul(h ^ (h>>>13),3266489909); return (h ^= h>>>16)>>>0; };
}
function mulberry32(a){ return ()=>{ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a ^ (a>>>15),1|a);
  t=(t+Math.imul(t ^ (t>>>7),61|t)) ^ t; return ((t ^ (t>>>14))>>>0)/4294967296; }; }
const rngFrom = (s)=>{ const seed=xmur3(s); return mulberry32(seed()); };
const pois = (l,r)=>{ const L=Math.exp(-l); let k=0,p=1; do{ k++; p*=r(); }while(p>L); return k-1; };
const pick = (arr,r)=> arr[Math.floor(r()*arr.length)];

/* ===================== CLUBS RÉELS ===================== */
const CLUBS_M = [
  ["cot","Coton Sport de Garoua","COT","Nord","#D62828",92],
  ["col","Colombe Sportive","COL","Sud","#1D4E89",88],
  ["can","Canon Yaoundé","CAN","Centre","#B5121B",86],
  ["pwd","PWD Bamenda","PWD","Nord-Ouest","#E63946",84],
  ["vic","Victoria United","VIC","Sud-Ouest","#264653",82],
  ["uni","Union Douala","UNI","Littoral","#B8860B",80],
  ["dyn","Dynamo Douala","DYN","Littoral","#2A9D8F",78],
  ["fau","Fauve Azur Elite","FAU","Centre","#457B9D",76],
  ["fov","Fovu Club de Baham","FOV","Ouest","#023047",75],
  ["aig","Aigle Royal de la Menoua","AIG","Ouest","#6D597A",73],
  ["for","AS Fortuna Mfou","FOR","Centre","#2B9348",71],
  ["bam","Bamboutos de Mbouda","BAM","Ouest","#E09F3E",69],
  ["sta","Stade Renard de Melong","STA","Littoral","#E76F51",67],
  ["gaz","Gazelle FA de Garoua","GAZ","Nord","#8AB17D",64],
  ["yos","YOSA de Bamenda","YOS","Nord-Ouest","#BC6C25",61],
  ["mou","Aigle du Moungo","MOU","Littoral","#6A994E",58],
].map(([id,name,short,region,color,prestige])=>({id,name,short,region,color,prestige}));

const CLUBS_F = [
  ["ebo","FC Ebolowa","EBO","Sud","#0E7C4A",91],
  ["lek","Lekié FF","LEK","Centre","#7B1FA2",89],
  ["awa","AS Awa","AWA","Centre","#C2185B",85],
  ["fap","Amazones FAP","FAP","Centre","#1565C0",83],
  ["min","Louves Minproff","MIN","Centre","#00838F",80],
  ["vis","Vision Foot Académie","VIS","Littoral","#E65100",78],
  ["cai","Caïman Douala","CAI","Littoral","#2E7D32","75"],
  ["ecl","Éclair de Sa'a","ECL","Centre","#F9A825",73],
  ["dja","Dja Sports Academy","DJA","Sud","#4527A0",70],
  ["aut","Authentic Douala","AUT","Littoral","#00695C",67],
  ["cyc","Cyclone FC","CYC","Ouest","#AD1457",64],
  ["ita","Ita Mbong","ITA","Sud-Ouest","#5D4037",61],
].map(([id,name,short,region,color,prestige])=>({id,name,short,region,color,prestige:+prestige}));

const REGIONS = ["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"];
const SEASONS = [2023,2024,2025,2026];

/* Nations CAN (drapeaux) - Cameroun toujours présent */
const NATIONS_M = [
  ["cmr","Cameroun","CMR","🇨🇲",88],["mar","Maroc","MAR","🇲🇦",91],["sen","Sénégal","SEN","🇸🇳",90],
  ["nga","Nigeria","NGA","🇳🇬",89],["civ","Côte d'Ivoire","CIV","🇨🇮",88],["egy","Égypte","EGY","🇪🇬",87],
  ["alg","Algérie","ALG","🇩🇿",86],["gha","Ghana","GHA","🇬🇭",84],["mli","Mali","MLI","🇲🇱",82],["cod","RD Congo","COD","🇨🇩",81],
].map(([id,name,short,flag,strength])=>({id,name,short,flag,strength}));
const NATIONS_F = [
  ["cmr","Cameroun","CMR","🇨🇲",88],["nga","Nigeria","NGA","🇳🇬",92],["rsa","Afrique du Sud","RSA","🇿🇦",90],
  ["zam","Zambie","ZAM","🇿🇲",85],["gha","Ghana","GHA","🇬🇭",84],["mar","Maroc","MAR","🇲🇦",86],
  ["sen","Sénégal","SEN","🇸🇳",82],["mli","Mali","MLI","🇲🇱",80],
].map(([id,name,short,flag,strength])=>({id,name,short,flag,strength}));

/* ===================== NOMS ===================== */
const FIRST_M = ["Junior","Aristide","Cédric","Landry","Boris","Ulrich","Hervé","Franck","Rodrigue","Achille","Willy","Serge","Blaise","Donald","Marcel","Armel","Ghislain","Steve","Yannick","Duplex","Emmanuel","Brice","Fabrice","Gaël","Ludovic","Nathan","Merveille","Éric"];
const FIRST_F = ["Gaëlle","Estelle","Christine","Ninon","Michaela","Ysis","Ajara","Henriette","Grace","Flavienne","Marlyse","Charlène","Raissa","Colette","Danielle","Falonne","Ivana","Kelly","Laure","Nadège","Ornella","Merveille","Brigitte","Kiki","Aboudi","Genevieve"];
const SUR = ["Ngando","Ebogo","Njike","Fokou","Talla","Wandji","Kemajou","Ndzana","Enow","Ashu","Ngwa","Tabi","Molua","Epee","Dooh","Kotto","Manga","Ndjock","Sende","Yaya","Mballa","Ateba","Ewané","Njoya","Fai","Bikai","Ngono","Owona","Mvondo","Essomba","Belinga","Onguene","Meva","Nkoa","Abanda"];

const POS = [
  { p:"Gardien", w:0 }, { p:"Gardien", w:0 },
  { p:"Défenseur", w:0.4 }, { p:"Défenseur", w:0.4 }, { p:"Défenseur", w:0.4 }, { p:"Défenseur", w:0.5 },
  { p:"Milieu", w:1 }, { p:"Milieu", w:1.1 }, { p:"Milieu", w:1.3 }, { p:"Milieu", w:0.9 },
  { p:"Ailier", w:2.4 }, { p:"Ailier", w:2.4 },
  { p:"Attaquant", w:3.4 }, { p:"Attaquant", w:3.2 }, { p:"Milieu", w:1 }, { p:"Défenseur", w:0.4 },
];

/* squads mémoïsés par univers */
const squadCache = {};
function squadOf(universe, cl) {
  const key = universe + "|" + cl.id;
  if (squadCache[key]) return squadCache[key];
  const r = rngFrom("squad|" + key);
  const firsts = universe==="F" ? FIRST_F : FIRST_M;
  const players = POS.map((pos,i)=>{
    const name = pick(firsts,r) + " " + pick(SUR,r);
    return { id: cl.id+"-"+i, name, poste: pos.p, w: pos.w, num:i+1, clubId: cl.id };
  });
  squadCache[key] = players;
  return players;
}

/* ===================== SIMULATION D'UNE SAISON ===================== */
const seasonCache = {};
function roundRobin(ids){
  const a = ids.slice(); if(a.length%2) a.push("BYE");
  const n=a.length, rounds=[];
  for(let r=0;r<n-1;r++){
    const round=[];
    for(let i=0;i<n/2;i++){ const h=a[i], g=a[n-1-i]; if(h!=="BYE"&&g!=="BYE") round.push(r%2? [g,h]:[h,g]); }
    rounds.push(round);
    a.splice(1,0,a.pop());
  }
  return rounds;
}
function simulate(universe, compId, season, clubs) {
  const key = [universe,compId,season].join("|");
  if (seasonCache[key]) return seasonCache[key];
  const seedBase = "sim|"+key;
  // ratings
  const ratings = {};
  clubs.forEach(c=>{ const r=rngFrom(seedBase+"|rate|"+c.id); ratings[c.id] = clamp(c.prestige + (r()-0.5)*14, 45, 99); });
  const ids = clubs.map(c=>c.id);
  const first = roundRobin(ids);
  const rounds = [...first, ...first.map(rd=> rd.map(([h,a])=>[a,h]))]; // aller-retour
  const totalRounds = rounds.length;
  const ongoing = season === 2026;
  const playedRounds = ongoing ? Math.round(totalRounds*0.62) : totalRounds;
  const currentRound = ongoing ? playedRounds : -1;

  const table = {}; clubs.forEach(c=> table[c.id]={ id:c.id, p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0, form:[] });
  const scorers = {}; // playerId -> goals
  const matches = [];

  rounds.forEach((rd, ri)=>{
    rd.forEach(([h,a])=>{
      const mr = rngFrom(seedBase+"|m|"+ri+"|"+h+"|"+a);
      const diff = (ratings[h]+6 - ratings[a]) / 26;
      const lh = clamp(1.35 + diff*0.7, 0.18, 4.2);
      const la = clamp(1.15 - diff*0.7, 0.12, 4.0);
      const gh = pois(lh,mr), ga = pois(la,mr);
      const played = ri < playedRounds;
      const live = ongoing && ri === currentRound && rd.indexOf(rd.find(x=>x[0]===h&&x[1]===a))===0;
      const upcoming = ri >= currentRound && ongoing && !live && ri>=playedRounds;
      const state = played ? "joué" : live ? "live" : "à venir";

      // stats + buteurs uniquement si joué / live
      let scH=[], scA=[], stats=null;
      if (played || live) {
        const poss = Math.round(clamp(50 + diff*16 + (mr()-0.5)*8, 30, 70));
        const shotsH = 6 + Math.floor(mr()*12), shotsA = 6 + Math.floor(mr()*11);
        stats = { poss, shotsH, shotsA, sotH: clamp(gh + Math.floor(mr()*5), gh, shotsH), sotA: clamp(ga+Math.floor(mr()*5), ga, shotsA),
          cornH:2+Math.floor(mr()*8), cornA:2+Math.floor(mr()*7), foulH:7+Math.floor(mr()*10), foulA:7+Math.floor(mr()*10),
          ycH:Math.floor(mr()*4), ycA:Math.floor(mr()*4) };
        scH = attributeGoals(universe, h, gh, mr); scA = attributeGoals(universe, a, ga, mr);
        [...scH.map(s=>s.id), ...scA.map(s=>s.id)].forEach(pid=> scorers[pid]=(scorers[pid]||0)+1);
      }
      // classement (matchs joués seulement)
      if (played) {
        const H=table[h], A=table[a];
        H.p++;A.p++;H.gf+=gh;H.ga+=ga;A.gf+=ga;A.ga+=gh;
        if(gh>ga){H.w++;A.l++;H.pts+=3;H.form.push("W");A.form.push("L");}
        else if(gh<ga){A.w++;H.l++;A.pts+=3;A.form.push("W");H.form.push("L");}
        else{H.d++;A.d++;H.pts++;A.pts++;H.form.push("D");A.form.push("D");}
      }
      matches.push({ id:"m"+ri+"-"+h+"-"+a, round:ri+1, home:h, away:a, gh, ga, state, minute: live?(20+Math.floor(mr()*60)):null, scH, scA, stats });
    });
  });

  const standings = clubs.map(c=>{ const t=table[c.id]; return { ...c, ...t, gd:t.gf-t.ga, form:t.form.slice(-5) }; })
    .sort((x,y)=> y.pts-x.pts || y.gd-x.gd || y.gf-x.gf);

  const topScorers = Object.entries(scorers).map(([pid,g])=>({ pid, g, ...playerMeta(universe, pid) }))
    .sort((a,b)=> b.g-a.g).slice(0,12);

  const out = { standings, matches, topScorers, totalRounds, playedRounds, currentRound, ongoing, ratings };
  seasonCache[key]=out; return out;
}
function attributeGoals(universe, clubId, n, r){
  if(!n) return [];
  const sq = squadOf(universe, allClubs().find(c=>c.id===clubId));
  const pool=[]; sq.forEach(p=>{ for(let i=0;i<Math.round(p.w*10);i++) pool.push(p); });
  const out=[]; for(let i=0;i<n;i++){ const p=pool.length?pick(pool,r):sq[12]; out.push({ id:p.id, name:p.name, minute:1+Math.floor(r()*90) }); }
  return out.sort((a,b)=>a.minute-b.minute);
}
function playerMeta(universe, pid){
  const clubId = pid.split("-")[0];
  const sq = squadOf(universe, allClubs().find(c=>c.id===clubId));
  const p = sq.find(x=>x.id===pid) || sq[0];
  return { name:p.name, poste:p.poste, clubId, num:p.num };
}
let _ALL=null; function allClubs(){ if(!_ALL) _ALL=[...CLUBS_M,...CLUBS_F]; return _ALL; }
const clubById = (id)=> allClubs().find(c=>c.id===id);

/* ===================== COUPE (bracket) ===================== */
const cupCache={};
function simulateCup(universe, season, clubs){
  const key=[universe,season].join("|"); if(cupCache[key]) return cupCache[key];
  const r=rngFrom("cup|"+key);
  const seeded=[...clubs].sort((a,b)=>b.prestige-a.prestige).slice(0,8);
  let round=seeded.map(c=>c.id); const rounds=[]; const labels=["Quarts de finale","Demi-finales","Finale"];
  let li=0;
  while(round.length>1){
    const ms=[]; const next=[];
    for(let i=0;i<round.length;i+=2){
      const h=round[i], a=round[i+1];
      const mr=rngFrom("cupm|"+key+"|"+li+"|"+h+"|"+a);
      let gh=pois(1.3+ (clubById(h).prestige-clubById(a).prestige)/40,mr), ga=pois(1.2-(clubById(h).prestige-clubById(a).prestige)/40,mr);
      if(gh===ga) gh++; // pas de nul en coupe
      const w = gh>ga? h : a;
      ms.push({ id:"cup"+li+"-"+h+"-"+a, home:h, away:a, gh, ga, winner:w, state:"joué", round:labels[li] });
      next.push(w);
    }
    rounds.push({ label:labels[li]||("Tour "+(li+1)), matches:ms }); round=next; li++;
  }
  const out={ rounds, champion: rounds[rounds.length-1].matches[0].winner };
  cupCache[key]=out; return out;
}

/* ===================== CAN (nations) ===================== */
const canCache={};
function simNationMatch(seed, sh, sa){
  const r=rngFrom(seed); const diff=(sh+4-sa)/24;
  const lh=clamp(1.3+diff*0.7,0.15,4), la=clamp(1.15-diff*0.7,0.1,3.8);
  const gh=pois(lh,r), ga=pois(la,r);
  const poss=Math.round(clamp(50+diff*15+(r()-0.5)*8,32,68));
  const shotsH=6+Math.floor(r()*11), shotsA=5+Math.floor(r()*11);
  const stats={poss,shotsH,shotsA,sotH:clamp(gh+Math.floor(r()*4),gh,shotsH),sotA:clamp(ga+Math.floor(r()*4),ga,shotsA),cornH:2+Math.floor(r()*7),cornA:2+Math.floor(r()*7),foulH:8+Math.floor(r()*9),foulA:8+Math.floor(r()*9),ycH:Math.floor(r()*4),ycA:Math.floor(r()*4)};
  return { gh, ga, stats };
}
function simulateCAN(universe, season){
  const key=universe+"|"+season; if(canCache[key]) return canCache[key];
  const nations = universe==="F"?NATIONS_F:NATIONS_M;
  const r=rngFrom("can|"+key);
  const cmr = nations.find(n=>n.id==="cmr");
  const rest = nations.filter(n=>n.id!=="cmr").sort(()=>r()-0.5);
  const group=[cmr, ...rest.slice(0,3)];
  // matchs de groupe (round robin)
  const gMatches=[]; const tbl={}; group.forEach(n=>tbl[n.id]={id:n.id,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++){
    const h=group[i], a=group[j]; const {gh,ga,stats}=simNationMatch("cangrp|"+key+"|"+h.id+"|"+a.id, h.strength, a.strength);
    const H=tbl[h.id],A=tbl[a.id]; H.p++;A.p++;H.gf+=gh;H.ga+=ga;A.gf+=ga;A.ga+=gh;
    if(gh>ga){H.w++;A.l++;H.pts+=3;} else if(ga>gh){A.w++;H.l++;A.pts+=3;} else {H.d++;A.d++;H.pts++;A.pts++;}
    gMatches.push({ id:"cg-"+h.id+"-"+a.id, home:h.id, away:a.id, gh, ga, state:"joué", round:"Phase de groupes", scH:[],scA:[], stats });
  }
  const groupStd=group.map(n=>({ ...n, ...tbl[n.id], gd:tbl[n.id].gf-tbl[n.id].ga })).sort((x,y)=>y.pts-x.pts||y.gd-x.gd);
  // phase finale (8 nations)
  const eight=[...nations].sort((a,b)=>b.strength-a.strength).slice(0,8);
  if(!eight.find(n=>n.id==="cmr")) eight[7]=cmr;
  let round=eight.map(n=>n.id); const labels=["Quarts de finale","Demi-finales","Finale"]; const rounds=[]; let li=0;
  while(round.length>1){
    const ms=[],next=[];
    for(let i=0;i<round.length;i+=2){
      const h=round[i],a=round[i+1]; const nh=nations.find(n=>n.id===h),na=nations.find(n=>n.id===a);
      let {gh,ga,stats}=simNationMatch("canko|"+key+"|"+li+"|"+h+"|"+a, nh.strength, na.strength);
      if(gh===ga){ // prolongation/tirs -> on départage
        if(nh.strength>=na.strength) gh++; else ga++;
      }
      const w=gh>ga?h:a; ms.push({ id:"ck"+li+"-"+h+"-"+a, home:h, away:a, gh, ga, winner:w, state:"joué", round:labels[li], scH:[],scA:[], stats }); next.push(w);
    }
    rounds.push({ label:labels[li]||("Tour "+(li+1)), matches:ms }); round=next; li++;
  }
  const out={ nations, group, groupStd, gMatches, rounds, champion: rounds[rounds.length-1].matches[0].winner };
  canCache[key]=out; return out;
}

/* ===================== TALENTS (scouting) ===================== */
function buildTalents(universe){
  const clubs = universe==="F"?CLUBS_F:CLUBS_M;
  const r = rngFrom("talents|"+universe);
  const firsts = universe==="F"?FIRST_F:FIRST_M;
  const postes=["Gardien","Défenseur","Milieu","Ailier","Attaquant"];
  const statusList=["À suivre","En observation","Recommandé","Convoqué U17","Convoqué U20"];
  const arr=[];
  for(let i=0;i<18;i++){
    const poste=pick(postes,r); const age=15+Math.floor(r()*4);
    const base=70+Math.floor(r()*22);
    const mk=(lo,hi)=> lo+Math.floor(r()*(hi-lo));
    const att = poste==="Attaquant"||poste==="Ailier";
    arr.push({
      id:i+1, uid:universe+"-"+(i+1), sexe:universe, name:pick(firsts,r)+" "+pick(SUR,r), age, region:pick(REGIONS,r),
      club: pick(clubs,r).name, poste, foot: r()>0.35?"Droit":"Gauche", h:165+Math.floor(r()*28), pot:base,
      status:pick(statusList,r), m:8+Math.floor(r()*18), g: att?Math.floor(r()*13):Math.floor(r()*4), a:Math.floor(r()*10),
      attrs:{ Technique:mk(62,93), Vitesse:mk(60,95), Physique:mk(58,92), Vision:mk(60,93), Finition: att?mk(70,93):mk(38,70), Mental:mk(65,92) },
    });
  }
  return arr.sort((a,b)=>b.pot-a.pot);
}

/* ===================== UI PRIMITIVES ===================== */
function Crest({ c, size=26 }){ if(!c) return null;
  if(c.flag) return <div style={{ width:size,height:size,borderRadius:6,background:"#fff",border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.62,flexShrink:0 }}>{c.flag}</div>;
  return (
  <div style={{ width:size,height:size,borderRadius:6,background:c.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:size*0.32,flexShrink:0,boxShadow:"inset 0 -2px 0 rgba(0,0,0,.18)" }}>{c.short.slice(0,3)}</div>
); }
function FormDots({ form }){ const map={W:T.green700,D:T.gold,L:T.red}; return (
  <div className="flex gap-1">{form.map((x,i)=><span key={i} style={{width:15,height:15,borderRadius:4,background:map[x],color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{x}</span>)}</div>
); }
function StatusPill({ s }){ const col=s?.startsWith("Convoqué")?T.green700:s==="Recommandé"?T.goldDeep:s==="En observation"?"#4B7BA8":T.muted;
  return <span style={{background:col+"1A",color:col,border:`1px solid ${col}40`,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,whiteSpace:"nowrap"}}>{s}</span>; }
function Eyebrow({ children }){ return <div style={{color:T.goldDeep,fontWeight:800,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>{children}</div>; }
function Panel({ title, icon, children, action, actionLabel }){ return (
  <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2" style={{color:T.green800}}>
        <span style={{color:T.goldDeep}}>{icon}</span>
        <span style={{fontWeight:800,fontSize:13,letterSpacing:.3,textTransform:"uppercase"}}>{title}</span>
      </div>
      {action && <button onClick={action} className="flex items-center gap-1" style={{color:T.muted,fontSize:12,fontWeight:600}}>{actionLabel}<ChevronRight size={14}/></button>}
    </div>
    {children}
  </div>
); }

/* ===================== ACCUEIL ===================== */
function Dashboard({ ctx, go, openMatch, openClub, openPlayer }){
  const { universe, season, clubs, compName } = ctx;
  const sim = simulate(universe, "league", season, clubs);
  const current = sim.matches.filter(m=> m.round===(sim.currentRound>0?sim.currentRound+1:sim.totalRounds)).slice(0,5);
  return (
    <div className="flex flex-col gap-5">
      <div style={{ background:`linear-gradient(135deg, ${T.green900}, ${T.green700})`, borderRadius:16, padding:26, color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{position:"absolute",right:-30,top:-30,opacity:.12}}><Star size={220} color={T.gold}/></div>
        <Eyebrow>{compName} · Saison {season}{sim.ongoing?" · en cours":""}</Eyebrow>
        <h1 style={{fontSize:28,fontWeight:800,margin:"6px 0 4px",letterSpacing:-0.5}}>La maison numérique du football camerounais</h1>
        <p style={{color:T.green100,maxWidth:620,fontSize:14}}>Compétitions {universe==="F"?"féminines":"masculines"} et détection des talents, réunies au même endroit - données à alimenter par la Fédération.</p>
        <div className="flex flex-wrap gap-3 mt-4">
          {[["Clubs",clubs.length],["Journées",sim.totalRounds],["Buts marqués",sim.standings.reduce((s,t)=>s+t.gf,0)],["Régions",10]].map(([k,v])=>(
            <div key={k} style={{background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",borderRadius:10,padding:"10px 14px",minWidth:110}}>
              <div style={{fontSize:24,fontWeight:800,...num}}>{v}</div><div style={{fontSize:11,color:T.green100}}>{k}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5" style={{gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))"}}>
        <Panel title="Classement" icon={<Trophy size={16}/>} action={()=>go("comp")} actionLabel="Voir tout">
          {sim.standings.slice(0,5).map((t,i)=>(
            <div key={t.id} onClick={()=>openClub(t.id)} className="flex items-center gap-3 py-2" style={{borderTop:i?`1px solid ${T.line}`:"none",cursor:"pointer"}}>
              <span style={{width:18,textAlign:"center",fontWeight:800,color:i===0?T.goldDeep:T.muted,...num}}>{i+1}</span>
              <Crest c={t}/><span style={{flex:1,fontWeight:600,fontSize:13,color:T.ink}}>{t.name}</span>
              <span style={{fontWeight:800,color:T.green800,...num}}>{t.pts}</span>
            </div>
          ))}
        </Panel>
        <Panel title={`Journée ${sim.currentRound>0?sim.currentRound+1:sim.totalRounds}`} icon={<Calendar size={16}/>} action={()=>go("comp")} actionLabel="Calendrier">
          {current.map((m,i)=><MatchRow key={m.id} m={m} top={i>0} onClick={()=>openMatch(m)}/>)}
        </Panel>
        <Panel title="Meilleurs buteurs" icon={<Target size={16}/>} action={()=>go("comp")} actionLabel="Détails">
          {sim.topScorers.slice(0,5).map((s,i)=>{ const c=clubById(s.clubId); const max=sim.topScorers[0].g||1; return (
            <div key={s.pid} className="py-2" style={{borderTop:i?`1px solid ${T.line}`:"none",cursor:"pointer"}} onClick={()=>openPlayer(s.pid)}>
              <div className="flex items-center gap-2"><Crest c={c} size={22}/><span style={{flex:1,fontSize:13,fontWeight:600,color:T.ink}}>{s.name}</span><span style={{fontWeight:800,...num}}>{s.g}</span></div>
              <div style={{height:5,background:T.line,borderRadius:3,marginTop:6}}><div style={{width:`${s.g/max*100}%`,height:"100%",background:T.gold,borderRadius:3}}/></div>
            </div>
          ); })}
        </Panel>
        <Panel title="Talents à suivre" icon={<Star size={16}/>} action={()=>go("scout")} actionLabel="Ouvrir le scouting">
          {buildTalents(universe).slice(0,5).map((p,i)=>(
            <div key={p.id} className="flex items-center gap-3 py-2" style={{borderTop:i?`1px solid ${T.line}`:"none"}}>
              <div style={{width:30,height:30,borderRadius:8,background:T.green100,color:T.green800,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,...num}}>{p.age}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{p.name}</div><div style={{fontSize:11,color:T.muted}}>{p.poste} · {p.region}</div></div>
              <div style={{fontWeight:800,color:T.goldDeep,...num}}>{p.pot}</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function MatchRow({ m, top, onClick }){
  const h=clubById(m.home), a=clubById(m.away); const live=m.state==="live", played=m.state==="joué";
  return (
    <div onClick={onClick} className="flex items-center gap-2 py-2" style={{borderTop:top?`1px solid ${T.line}`:"none",cursor:"pointer"}}>
      <div className="flex items-center gap-2" style={{flex:1,justifyContent:"flex-end"}}>
        <span style={{fontSize:12,fontWeight:600,color:T.ink,textAlign:"right"}}>{h.short}</span><Crest c={h} size={22}/>
      </div>
      <div style={{minWidth:64,textAlign:"center"}}>
        {(played||live)? <span style={{fontWeight:800,color:live?T.red:T.ink,...num}}>{m.gh} - {m.ga}</span> : <span style={{fontSize:12,color:T.muted,fontWeight:700}}>vs</span>}
        {live && <div style={{fontSize:9,color:T.red,fontWeight:800,display:"flex",gap:4,alignItems:"center",justifyContent:"center"}}><span style={{width:6,height:6,borderRadius:9,background:T.red,display:"inline-block",animation:"pulse 1.2s infinite"}}/>{m.minute}′</div>}
      </div>
      <div className="flex items-center gap-2" style={{flex:1}}><Crest c={a} size={22}/><span style={{fontSize:12,fontWeight:600,color:T.ink}}>{a.short}</span></div>
    </div>
  );
}

/* ===================== COMPÉTITIONS ===================== */
function Competitions({ ctx, openMatch, openClub, openPlayer }){
  const { universe, season, clubs } = ctx;
  const comps = universe==="F"
    ? [["league","Guinness Super League"],["cup","Coupe du Cameroun Féminin"],["can","CAN Féminine"]]
    : [["league","MTN Elite One"],["cup","Coupe du Cameroun"],["can","CAN"]];
  const [compId,setCompId]=useState("league");
  const [tab,setTab]=useState("classement");
  const sim = simulate(universe, "league", season, clubs);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {comps.map(([id,label])=>(
          <button key={id} onClick={()=>setCompId(id)} style={{padding:"7px 14px",borderRadius:999,fontSize:13,fontWeight:700,background:compId===id?T.green800:"#fff",color:compId===id?"#fff":T.muted,border:`1px solid ${compId===id?T.green800:T.line}`}}>{label}</button>
        ))}
      </div>

      {compId==="can" ? (
        <CANView universe={universe} season={season}/>
      ) : compId==="cup" ? (
        <CupBracket universe={universe} season={season} clubs={clubs} openMatch={openMatch}/>
      ) : (
        <>
          <div className="flex gap-2" style={{borderBottom:`1px solid ${T.line}`,overflowX:"auto"}}>
            {[["classement","Classement"],["calendrier","Calendrier & résultats"],["buteurs","Buteurs"],["regions","Par région"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 4px",marginRight:16,fontSize:13,fontWeight:700,whiteSpace:"nowrap",color:tab===k?T.green800:T.muted,borderBottom:`2px solid ${tab===k?T.gold:"transparent"}`}}>{l}</button>
            ))}
          </div>
          {tab==="classement" && <StandingsTable sim={sim} openClub={openClub}/>}
          {tab==="calendrier" && <FixturesFull sim={sim} openMatch={openMatch}/>}
          {tab==="buteurs" && <ScorersFull sim={sim} openPlayer={openPlayer}/>}
          {tab==="regions" && <RegionBreakdown clubs={clubs} openClub={openClub}/>}
        </>
      )}
    </div>
  );
}

function StandingsTable({ sim, openClub }){
  const n=sim.standings.length;
  return (
    <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.green900,color:"#fff",textAlign:"left"}}>
            {["#","Club","J","G","N","P","BP","BC","Diff","Pts","Forme"].map((h,i)=><th key={h} style={{padding:"10px",fontSize:11,letterSpacing:.5,textTransform:"uppercase",textAlign:i>1&&i<10?"center":"left",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sim.standings.map((t,i)=>{ const zone=i<2?T.gold:i<4?T.green700:i>=n-2?T.red:"transparent"; return (
              <tr key={t.id} onClick={()=>openClub(t.id)} style={{borderTop:`1px solid ${T.line}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"9px 10px"}}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:3,height:18,background:zone,borderRadius:2,display:"inline-block"}}/><b style={{...num,color:T.ink}}>{i+1}</b></span></td>
                <td style={{padding:"9px 10px"}}><span className="flex items-center gap-2"><Crest c={t} size={24}/><span style={{fontWeight:600,color:T.ink}}>{t.name}</span></span></td>
                {[t.p,t.w,t.d,t.l,t.gf,t.ga].map((v,j)=><td key={j} style={{padding:"9px 10px",textAlign:"center",color:T.muted,...num}}>{v}</td>)}
                <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,color:t.gd>=0?T.green700:T.red,...num}}>{t.gd>0?"+":""}{t.gd}</td>
                <td style={{padding:"9px 10px",textAlign:"center",fontWeight:800,color:T.ink,...num}}>{t.pts}</td>
                <td style={{padding:"9px 10px"}}><FormDots form={t.form}/></td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-4 px-3 py-3" style={{fontSize:11,color:T.muted,borderTop:`1px solid ${T.line}`}}>
        <Legend c={T.gold} t="Ligue des Champions CAF"/><Legend c={T.green700} t="Coupe de la Confédération"/><Legend c={T.red} t="Relégation"/>
        <span style={{marginLeft:"auto"}}>Cliquez une ligne pour la fiche club</span>
      </div>
    </div>
  );
}
function Legend({ c, t }){ return <span className="flex items-center gap-1"><span style={{width:10,height:10,background:c,borderRadius:2}}/>{t}</span>; }

function FixturesFull({ sim, openMatch }){
  const def = sim.currentRound>0 ? sim.currentRound+1 : sim.totalRounds;
  const [rd,setRd]=useState(def);
  const list = sim.matches.filter(m=>m.round===rd);
  return (
    <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Activity size={16} color={T.red}/><span style={{fontWeight:800,color:T.green800,textTransform:"uppercase",fontSize:13}}>Journée {rd} / {sim.totalRounds}</span>
        <div className="flex gap-1" style={{marginLeft:"auto"}}>
          <button onClick={()=>setRd(Math.max(1,rd-1))} style={navBtn}>‹</button>
          <select value={rd} onChange={e=>setRd(+e.target.value)} style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"5px 8px",fontSize:13}}>
            {Array.from({length:sim.totalRounds},(_,i)=>i+1).map(j=><option key={j} value={j}>Journée {j}</option>)}
          </select>
          <button onClick={()=>setRd(Math.min(sim.totalRounds,rd+1))} style={navBtn}>›</button>
        </div>
      </div>
      <div className="grid gap-2" style={{gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))"}}>
        {list.map(m=>(
          <div key={m.id} style={{border:`1px solid ${m.state==="live"?T.red+"55":T.line}`,borderRadius:10,padding:"6px 12px",background:m.state==="live"?T.red+"08":"#fff"}}>
            <MatchRow m={m} top={false} onClick={()=>openMatch(m)}/>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:T.muted,marginTop:10}}>Cliquez un match pour ses statistiques détaillées.</div>
    </div>
  );
}
const navBtn={ border:`1px solid ${T.line}`, borderRadius:8, width:30, height:30, fontSize:16, color:T.green800, background:"#fff" };

function ScorersFull({ sim, openPlayer }){
  const max=sim.topScorers[0]?.g||1;
  return (
    <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
      {sim.topScorers.map((s,i)=>{ const c=clubById(s.clubId); return (
        <div key={s.pid} className="flex items-center gap-3 py-2" style={{borderTop:i?`1px solid ${T.line}`:"none",cursor:"pointer"}} onClick={()=>openPlayer(s.pid)}>
          <span style={{width:20,textAlign:"center",fontWeight:800,color:i<3?T.goldDeep:T.muted,...num}}>{i+1}</span>
          <Crest c={c} size={24}/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.ink}}>{s.name}</div><div style={{fontSize:11,color:T.muted}}>{c.name} · {s.poste}</div></div>
          <div style={{width:"36%",maxWidth:200}}><div style={{height:8,background:T.line,borderRadius:4}}><div style={{width:`${s.g/max*100}%`,height:"100%",background:`linear-gradient(90deg,${T.goldDeep},${T.gold})`,borderRadius:4}}/></div></div>
          <b style={{width:26,textAlign:"right",color:T.ink,...num}}>{s.g}</b>
        </div>
      ); })}
    </div>
  );
}

function RegionBreakdown({ clubs, openClub }){
  const by=REGIONS.map(r=>({r,cl:clubs.filter(c=>c.region===r)})).filter(x=>x.cl.length);
  return (
    <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))"}}>
      {by.map(({r,cl})=>(
        <div key={r} style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
          <div className="flex items-center gap-2 mb-2"><MapPin size={14} color={T.goldDeep}/><span style={{fontWeight:800,color:T.green800,fontSize:13}}>{r}</span><span style={{marginLeft:"auto",fontSize:11,color:T.muted}}>{cl.length}</span></div>
          {cl.map(c=><div key={c.id} onClick={()=>openClub(c.id)} className="flex items-center gap-2 py-1" style={{cursor:"pointer"}}><Crest c={c} size={20}/><span style={{fontSize:12,color:T.ink}}>{c.name}</span></div>)}
        </div>
      ))}
    </div>
  );
}

function CupBracket({ universe, season, clubs, openMatch }){
  const cup = simulateCup(universe, season, clubs);
  const champ = clubById(cup.champion);
  return (
    <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
      <div className="flex items-center gap-2 mb-3"><Trophy size={16} color={T.gold}/><span style={{fontWeight:800,color:T.green800,textTransform:"uppercase",fontSize:13}}>Tableau final</span>
        <span style={{marginLeft:"auto",fontSize:12,color:T.muted}}>Vainqueur : <b style={{color:T.goldDeep}}>{champ.name}</b></span>
      </div>
      <div className="flex gap-4" style={{overflowX:"auto",paddingBottom:6}}>
        {cup.rounds.map((rnd,ri)=>(
          <div key={ri} style={{minWidth:210,display:"flex",flexDirection:"column",justifyContent:"space-around",gap:10}}>
            <div style={{fontSize:11,fontWeight:800,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>{rnd.label}</div>
            {rnd.matches.map(m=>{ const h=clubById(m.home),a=clubById(m.away); return (
              <div key={m.id} onClick={()=>openMatch({...m,round:m.round,scH:[],scA:[],stats:null,minute:null})} style={{border:`1px solid ${T.line}`,borderRadius:10,overflow:"hidden",cursor:"pointer"}}>
                {[[h,m.gh,m.home],[a,m.ga,m.away]].map(([c,g,id])=>(
                  <div key={id} className="flex items-center gap-2" style={{padding:"7px 10px",background:cup.champion&&m.winner===id?T.green100:"#fff",borderTop:id===m.away?`1px solid ${T.line}`:"none"}}>
                    <Crest c={c} size={20}/><span style={{flex:1,fontSize:12,fontWeight:m.winner===id?800:600,color:T.ink}}>{c.short}</span><b style={{...num,color:m.winner===id?T.green800:T.muted}}>{g}</b>
                  </div>
                ))}
              </div>
            ); })}
          </div>
        ))}
        <div style={{minWidth:150,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:8}}>
          <Trophy size={40} color={T.gold}/><Crest c={champ} size={44}/><div style={{fontWeight:800,color:T.green800,textAlign:"center",fontSize:13}}>{champ.name}</div><div style={{fontSize:11,color:T.muted}}>Champion {season}</div>
        </div>
      </div>
    </div>
  );
}

/* ===================== CAN VIEW ===================== */
function CANView({ universe, season }){
  const can = simulateCAN(universe, season);
  const champ = can.nations.find(n=>n.id===can.champion);
  const cmrOut = (()=>{ // parcours du Cameroun en phase finale
    for(let i=can.rounds.length-1;i>=0;i--){ const played=can.rounds[i].matches.find(m=>m.home==="cmr"||m.away==="cmr"); if(played){ return played.winner==="cmr" ? (i===can.rounds.length-1?"Vainqueur 🏆":"En finale") : `Éliminé en ${can.rounds[i].label.toLowerCase()}`; } }
    return "Phase de groupes";
  })();
  const nat=(id)=>can.nations.find(n=>n.id===id);
  const [selMatch,setSelMatch]=useState(null);
  return (
    <div className="flex flex-col gap-4">
      <div style={{ background:`linear-gradient(135deg, ${T.green800}, ${T.green900})`, borderRadius:14, padding:18, color:"#fff" }} className="flex items-center gap-3 flex-wrap">
        <div style={{width:44,height:44,borderRadius:10,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🇨🇲</div>
        <div><div style={{fontWeight:800,fontSize:16}}>{universe==="F"?"CAN Féminine":"CAN"} {season}</div><div style={{fontSize:12,color:T.green100}}>Parcours des {universe==="F"?"Lionnes":"Lions"} Indomptables</div></div>
        <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:11,color:T.green100}}>Résultat</div><div style={{fontWeight:800,color:T.gold}}>{cmrOut}</div></div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
        <div className="flex items-center gap-2 mb-2"><Flag size={16} color={T.goldDeep}/><span style={{fontWeight:800,color:T.green800,textTransform:"uppercase",fontSize:13}}>Phase de groupes - Groupe du Cameroun</span></div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:T.green900,color:"#fff",textAlign:"left"}}>{["#","Nation","J","G","N","P","Diff","Pts"].map((h,i)=><th key={h} style={{padding:"9px 10px",fontSize:11,textTransform:"uppercase",textAlign:i>1?"center":"left"}}>{h}</th>)}</tr></thead>
            <tbody>
              {can.groupStd.map((n,i)=>(
                <tr key={n.id} style={{borderTop:`1px solid ${T.line}`,background:n.id==="cmr"?T.green100:"transparent"}}>
                  <td style={{padding:"8px 10px"}}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{width:3,height:16,background:i<2?T.gold:"transparent",borderRadius:2}}/><b style={{...num}}>{i+1}</b></span></td>
                  <td style={{padding:"8px 10px"}}><span className="flex items-center gap-2"><Crest c={n} size={22}/><span style={{fontWeight:n.id==="cmr"?800:600,color:T.ink}}>{n.name}</span></span></td>
                  {[n.p,n.w,n.d,n.l].map((v,j)=><td key={j} style={{padding:"8px 10px",textAlign:"center",color:T.muted,...num}}>{v}</td>)}
                  <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:n.gd>=0?T.green700:T.red,...num}}>{n.gd>0?"+":""}{n.gd}</td>
                  <td style={{padding:"8px 10px",textAlign:"center",fontWeight:800,...num}}>{n.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 mt-3" style={{gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))"}}>
          {can.gMatches.map(m=>(
            <div key={m.id} onClick={()=>setSelMatch(m)} style={{border:`1px solid ${T.line}`,borderRadius:10,padding:"6px 12px",cursor:"pointer"}}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2" style={{flex:1,justifyContent:"flex-end"}}><span style={{fontSize:12,fontWeight:600}}>{nat(m.home).short}</span><Crest c={nat(m.home)} size={20}/></div>
                <b style={{...num,minWidth:44,textAlign:"center"}}>{m.gh} - {m.ga}</b>
                <div className="flex items-center gap-2" style={{flex:1}}><Crest c={nat(m.away)} size={20}/><span style={{fontSize:12,fontWeight:600}}>{nat(m.away).short}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:14,padding:16}}>
        <div className="flex items-center gap-2 mb-3"><Trophy size={16} color={T.gold}/><span style={{fontWeight:800,color:T.green800,textTransform:"uppercase",fontSize:13}}>Phase finale</span><span style={{marginLeft:"auto",fontSize:12,color:T.muted}}>Vainqueur : <b style={{color:T.goldDeep}}>{champ.name}</b></span></div>
        <div className="flex gap-4" style={{overflowX:"auto",paddingBottom:6}}>
          {can.rounds.map((rnd,ri)=>(
            <div key={ri} style={{minWidth:210,display:"flex",flexDirection:"column",justifyContent:"space-around",gap:10}}>
              <div style={{fontSize:11,fontWeight:800,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>{rnd.label}</div>
              {rnd.matches.map(m=>(
                <div key={m.id} onClick={()=>setSelMatch(m)} style={{border:`1px solid ${T.line}`,borderRadius:10,overflow:"hidden",cursor:"pointer"}}>
                  {[[nat(m.home),m.gh,m.home],[nat(m.away),m.ga,m.away]].map(([c,g,id])=>(
                    <div key={id} className="flex items-center gap-2" style={{padding:"7px 10px",background:m.winner===id?T.green100:"#fff",borderTop:id===m.away?`1px solid ${T.line}`:"none"}}>
                      <Crest c={c} size={20}/><span style={{flex:1,fontSize:12,fontWeight:m.winner===id?800:600,color:T.ink}}>{c.short}</span><b style={{...num,color:m.winner===id?T.green800:T.muted}}>{g}</b>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <div style={{minWidth:150,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:8}}>
            <Trophy size={40} color={T.gold}/><Crest c={champ} size={44}/><div style={{fontWeight:800,color:T.green800,textAlign:"center",fontSize:13}}>{champ.name}</div><div style={{fontSize:11,color:T.muted}}>Champion {season}</div>
          </div>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:8}}>Cliquez un match pour ses statistiques.</div>
      </div>

      {selMatch && <MatchModal m={selMatch} lookup={nat} onClose={()=>setSelMatch(null)}/>}
    </div>
  );
}

/* ===================== MODALS : MATCH / CLUB / JOUEUR ===================== */
function Drawer({ children, onClose, accent }){
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,20,15,.45)",display:"flex",justifyContent:"flex-end",zIndex:60}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"min(470px, 95vw)",height:"100%",background:T.paper,overflowY:"auto"}}>{children}</div>
    </div>
  );
}

function MatchModal({ m, universe, onClose, openClub=()=>{}, openPlayer=()=>{}, lookup=clubById }){
  const h=lookup(m.home), a=lookup(m.away); const has=m.stats;
  const bar=(l,vh,va)=>(
    <div style={{marginBottom:10}}>
      <div className="flex justify-between" style={{fontSize:12,color:T.muted,marginBottom:3}}><b style={{color:T.ink,...num}}>{vh}</b><span>{l}</span><b style={{color:T.ink,...num}}>{va}</b></div>
      <div style={{display:"flex",height:6,borderRadius:3,overflow:"hidden",background:T.line}}>
        <div style={{width:`${vh/(vh+va||1)*100}%`,background:T.green700}}/><div style={{width:`${va/(vh+va||1)*100}%`,background:T.gold}}/>
      </div>
    </div>
  );
  return (
    <Drawer onClose={onClose}>
      <div style={{background:`linear-gradient(135deg, ${T.green800}, ${T.green900})`,padding:20,color:"#fff"}}>
        <button onClick={onClose} className="flex items-center gap-1" style={{color:"#fff",opacity:.85,fontSize:13,marginBottom:14}}><ArrowLeft size={15}/>Fermer</button>
        <div className="flex items-center justify-between">
          <ClubMini c={h} onClick={()=>openClub(h.id)}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:30,fontWeight:800,...num}}>{(m.state==="à venir")?"-":`${m.gh}-${m.ga}`}</div>
            <div style={{fontSize:11,opacity:.85}}>{m.state==="live"?`LIVE ${m.minute}′`:m.state==="à venir"?"À venir":(typeof m.round==="number"?`Journée ${m.round}`:(m.round||"Match"))}</div>
          </div>
          <ClubMini c={a} onClick={()=>openClub(a.id)}/>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {(m.scH?.length||m.scA?.length)?(
          <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
            <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",marginBottom:8}}>Buteurs</div>
            <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>{m.scH.map((s,i)=><ScorerLine key={i} s={s} onClick={()=>openPlayer(s.id)}/>)}</div>
              <div style={{textAlign:"right"}}>{m.scA.map((s,i)=><ScorerLine key={i} s={s} right onClick={()=>openPlayer(s.id)}/>)}</div>
            </div>
          </div>
        ):null}
        {has?(
          <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
            <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",marginBottom:10}}>Statistiques</div>
            {bar("Possession %",has.poss,100-has.poss)}
            {bar("Tirs",has.shotsH,has.shotsA)}
            {bar("Tirs cadrés",has.sotH,has.sotA)}
            {bar("Corners",has.cornH,has.cornA)}
            {bar("Fautes",has.foulH,has.foulA)}
            {bar("Cartons jaunes",has.ycH,has.ycA)}
          </div>
        ):<div style={{fontSize:13,color:T.muted,textAlign:"center",padding:20}}>Statistiques disponibles au coup d'envoi.</div>}
      </div>
    </Drawer>
  );
}
function ClubMini({ c, onClick }){ return (
  <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,width:100}}>
    <Crest c={c} size={40}/><span style={{fontSize:12,color:"#fff",fontWeight:700,textAlign:"center",lineHeight:1.1}}>{c.short}</span>
  </button>
); }
function ScorerLine({ s, right, onClick }){ return (
  <div onClick={onClick} className="flex items-center gap-1" style={{fontSize:12,color:T.ink,cursor:"pointer",marginBottom:4,justifyContent:right?"flex-end":"flex-start"}}>
    {right?null:<Goal size={12} color={T.green700}/>}<span>{s.name} {s.minute}′</span>{right?<Goal size={12} color={T.gold}/>:null}
  </div>
); }

function ClubModal({ id, universe, season, onClose, openPlayer, openMatch }){
  const c=clubById(id);
  const isF = CLUBS_F.some(x=>x.id===id);
  const clubs = isF?CLUBS_F:CLUBS_M;
  const sim = simulate(isF?"F":"M","league",season,clubs);
  const row = sim.standings.find(t=>t.id===id) || {p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,gd:0,form:[]};
  const rank = sim.standings.findIndex(t=>t.id===id)+1;
  const squad = squadOf(isF?"F":"M", c);
  const goalsByP={}; sim.topScorers.forEach(s=>{ if(s.clubId===id) goalsByP[s.pid]=s.g; });
  const recent = sim.matches.filter(m=>(m.home===id||m.away===id)&&m.state==="joué").slice(-5).reverse();
  return (
    <Drawer onClose={onClose}>
      <div style={{background:`linear-gradient(135deg, ${c.color}, ${T.green900})`,padding:22,color:"#fff"}}>
        <button onClick={onClose} className="flex items-center gap-1" style={{color:"#fff",opacity:.85,fontSize:13,marginBottom:12}}><ArrowLeft size={15}/>Fermer</button>
        <div className="flex items-center gap-3"><Crest c={c} size={52}/><div><div style={{fontSize:20,fontWeight:800}}>{c.name}</div><div style={{fontSize:12,opacity:.9,display:"flex",gap:6,alignItems:"center"}}><MapPin size={12}/>{c.region} · Saison {season}</div></div></div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid gap-2" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
          {[["Rang",rank?`${rank}ᵉ`:"-"],["Pts",row.pts],["Diff",`${row.gd>0?"+":""}${row.gd}`],["Forme",""]].map(([k,v],i)=>(
            <div key={k} style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              {i<3?<div style={{fontSize:18,fontWeight:800,color:T.green800,...num}}>{v}</div>:<div style={{display:"flex",justifyContent:"center"}}><FormDots form={row.form}/></div>}
              <div style={{fontSize:10,color:T.muted,marginTop:2}}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
          <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",marginBottom:8}}>5 derniers matchs</div>
          {recent.length?recent.map(m=>{ const opp=clubById(m.home===id?m.away:m.home); const gf=m.home===id?m.gh:m.ga, ga=m.home===id?m.ga:m.gh; const res=gf>ga?"V":gf<ga?"D":"N"; const col=res==="V"?T.green700:res==="D"?T.red:T.gold; return (
            <div key={m.id} onClick={()=>openMatch(m)} className="flex items-center gap-2 py-1" style={{cursor:"pointer",fontSize:13}}>
              <span style={{width:18,height:18,borderRadius:4,background:col,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{res}</span>
              <Crest c={opp} size={18}/><span style={{flex:1,color:T.ink}}>{opp.name}</span><b style={{...num,color:T.ink}}>{gf}-{ga}</b>
            </div>
          ); }):<div style={{fontSize:12,color:T.muted}}>Aucun match joué cette saison.</div>}
        </div>
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
          <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",marginBottom:8}}>Effectif</div>
          {squad.map(p=>(
            <div key={p.id} onClick={()=>openPlayer(p.id)} className="flex items-center gap-2 py-1" style={{cursor:"pointer",fontSize:13,borderTop:`1px solid ${T.line}`}}>
              <span style={{width:22,textAlign:"center",color:T.muted,fontSize:11,...num}}>{p.num}</span>
              <span style={{flex:1,color:T.ink,fontWeight:600}}>{p.name}</span>
              <span style={{fontSize:11,color:T.muted}}>{p.poste}</span>
              {goalsByP[p.id]?<span style={{fontSize:11,color:T.goldDeep,fontWeight:800}}>{goalsByP[p.id]} ⚽</span>:null}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

function PlayerModal({ pid, universe, season, onClose, openClub }){
  const isF = CLUBS_F.some(x=>x.id===pid.split("-")[0]);
  const uni = isF?"F":"M";
  const meta = playerMeta(uni, pid); const c=clubById(meta.clubId);
  const clubs = isF?CLUBS_F:CLUBS_M;
  const sim = simulate(uni,"league",season,clubs);
  const goals = sim.topScorers.find(s=>s.pid===pid)?.g || 0;
  // attributs déterministes
  const r=rngFrom("attr|"+pid); const mk=(lo,hi)=>lo+Math.floor(r()*(hi-lo));
  const att = meta.poste==="Attaquant"||meta.poste==="Ailier";
  const attrs={ Technique:mk(64,92), Vitesse:mk(62,94), Physique:mk(58,90), Vision:mk(60,92), Finition: att?mk(70,92):mk(40,72), Mental:mk(64,90) };
  const radar=Object.entries(attrs).map(([k,v])=>({k,v}));
  const apps = 6+Math.floor(rngFrom("apps|"+pid)()*18);
  return (
    <Drawer onClose={onClose}>
      <div style={{background:`linear-gradient(135deg, ${c.color}, ${T.green900})`,padding:22,color:"#fff"}}>
        <button onClick={onClose} className="flex items-center gap-1" style={{color:"#fff",opacity:.85,fontSize:13,marginBottom:12}}><ArrowLeft size={15}/>Fermer</button>
        <div className="flex items-center gap-3">
          <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,...num}}>{meta.num}</div>
          <div><div style={{fontSize:20,fontWeight:800}}>{meta.name}</div>
            <button onClick={()=>openClub(c.id)} className="flex items-center gap-1" style={{fontSize:12,opacity:.9,color:"#fff"}}><Crest c={c} size={16}/>{c.name} · {meta.poste}</button>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid gap-2" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
          {[["Matchs",apps],["Buts",goals],["Saison",season]].map(([k,v])=>(
            <div key={k} style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:10,padding:"12px 6px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:T.green800,...num}}>{v}</div><div style={{fontSize:10,color:T.muted}}>{k}</div></div>
          ))}
        </div>
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:8}}>
          <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",padding:"4px 8px"}}>Profil technique</div>
          <div style={{width:"100%",height:230}}>
            <ResponsiveContainer><RadarChart data={radar} outerRadius="72%"><PolarGrid stroke={T.line}/><PolarAngleAxis dataKey="k" tick={{fill:T.muted,fontSize:11}}/><Radar dataKey="v" stroke={T.goldDeep} fill={T.gold} fillOpacity={0.45}/></RadarChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ===================== SCOUTING ===================== */
function Scouting({ universe, locked, unlock }){
  const [genre,setGenre]=useState(universe==="F"?"Femmes":"Hommes");
  const [region,setRegion]=useState("Toutes");
  const [poste,setPoste]=useState("Tous");
  const [sel,setSel]=useState(null);
  const [watch,setWatch]=useState(()=>new Set());
  const talents = useMemo(()=>[...buildTalents("M"),...buildTalents("F")].sort((a,b)=>b.pot-a.pot),[]);
  const genreMap={ "Hommes":"M", "Femmes":"F" };
  const list = talents.filter(p=>
    (genre==="Tous"||p.sexe===genreMap[genre]) &&
    (region==="Toutes"||p.region===region) && (poste==="Tous"||p.poste===poste));

  if(locked) return (
    <div style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:16,padding:"50px 24px",textAlign:"center"}}>
      <div style={{width:56,height:56,borderRadius:14,background:T.green100,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Lock size={24} color={T.green800}/></div>
      <h2 style={{fontWeight:800,color:T.ink,fontSize:20}}>Espace réservé au staff technique</h2>
      <p style={{color:T.muted,maxWidth:420,margin:"8px auto 18px",fontSize:14}}>Le module de détection contient des données sensibles sur des mineurs. Il est cloisonné du hub public.</p>
      <button onClick={unlock} style={{background:T.green800,color:"#fff",fontWeight:700,padding:"11px 22px",borderRadius:10,fontSize:14}}>Basculer en mode Staff (démo)</button>
    </div>
  );
  const toggle=(id)=>setWatch(w=>{const n=new Set(w);n.has(id)?n.delete(id):n.add(id);return n;});
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3" style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:12,padding:12}}>
        <div className="flex items-center gap-2" style={{color:T.green800,fontWeight:800,fontSize:13}}><Search size={16}/>DÉTECTION</div>
        <Sel label="Genre" value={genre} onChange={setGenre} options={["Tous","Hommes","Femmes"]}/>
        <Sel label="Région" value={region} onChange={setRegion} options={["Toutes",...REGIONS]}/>
        <Sel label="Poste" value={poste} onChange={setPoste} options={["Tous","Gardien","Défenseur","Milieu","Ailier","Attaquant"]}/>
        <div style={{marginLeft:"auto",fontSize:13,color:T.muted}}><b style={{color:T.ink,...num}}>{list.length}</b> talents · <b style={{color:T.goldDeep,...num}}>{watch.size}</b> suivis</div>
      </div>
      <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill, minmax(250px,1fr))"}}>
        {list.map(p=>(
          <div key={p.uid} onClick={()=>setSel(p)} style={{background:T.card,border:`1px solid ${T.line}`,borderRadius:12,padding:14,cursor:"pointer",position:"relative"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
            <button onClick={e=>{e.stopPropagation();toggle(p.uid);}} style={{position:"absolute",top:10,right:10,width:28,height:28,borderRadius:8,background:watch.has(p.uid)?T.gold:T.paper,color:watch.has(p.uid)?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center"}}>{watch.has(p.uid)?<Check size={15}/>:<Plus size={15}/>}</button>
            <div className="flex items-center gap-3">
              <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${T.green700},${T.green900})`,color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:800,...num}}>{p.pot}</span><span style={{fontSize:8,opacity:.8}}>POTENTIEL</span></div>
              <div style={{flex:1,minWidth:0}}>
                <div className="flex items-center gap-2" style={{minWidth:0}}>
                  <span style={{fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:999,background:p.sexe==="F"?"#C2185B1A":"#1565C01A",color:p.sexe==="F"?"#C2185B":"#1565C0"}}>{p.sexe==="F"?"F":"H"}</span>
                  <div style={{fontWeight:800,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                </div>
                <div style={{fontSize:11,color:T.muted}}>{p.poste} · {p.age} ans</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3" style={{fontSize:11,color:T.muted}}><MapPin size={12} color={T.goldDeep}/>{p.region}<span style={{marginLeft:"auto"}}><StatusPill s={p.status}/></span></div>
            <div className="flex gap-3 mt-3" style={{borderTop:`1px solid ${T.line}`,paddingTop:8,fontSize:12}}><Mini k="M" v={p.m}/><Mini k="B" v={p.g}/><Mini k="PD" v={p.a}/><span style={{marginLeft:"auto",fontSize:11,color:T.muted,alignSelf:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{p.club}</span></div>
          </div>
        ))}
      </div>
      {sel && <TalentPanel p={sel} onClose={()=>setSel(null)} watched={watch.has(sel.uid)} toggle={()=>toggle(sel.uid)}/>}
    </div>
  );
}
function Mini({k,v}){ return <span style={{color:T.muted}}>{k} <b style={{color:T.ink,...num}}>{v}</b></span>; }
function Sel({ label, value, onChange, options }){ return (
  <label className="flex items-center gap-2" style={{fontSize:12,color:T.muted}}>{label}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{border:`1px solid ${T.line}`,borderRadius:8,padding:"6px 8px",fontSize:13,color:T.ink,background:"#fff"}}>{options.map(o=><option key={o}>{o}</option>)}</select>
  </label>
); }
function TalentPanel({ p, onClose, watched, toggle }){
  const [notes,setNotes]=useState([{a:"Recruteur régional",d:"Explosivité rare sur les premiers appuis. À revoir sous pression.",t:"il y a 3 jours"},{a:"Cellule technique",d:"Profil compatible sélection jeune. Suivre l'évolution physique.",t:"il y a 2 semaines"}]);
  const [draft,setDraft]=useState("");
  const radar=Object.entries(p.attrs).map(([k,v])=>({k,v}));
  return (
    <Drawer onClose={onClose}>
      <div style={{background:`linear-gradient(135deg, ${T.green800}, ${T.green900})`,padding:22,color:"#fff"}}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-1" style={{color:"#fff",opacity:.85,fontSize:13}}><ArrowLeft size={15}/>Fermer</button>
          <button onClick={toggle} className="flex items-center gap-1" style={{background:watched?T.gold:"rgba(255,255,255,.15)",color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700}}>{watched?<><Check size={14}/>Suivi</>:<><Eye size={14}/>Suivre</>}</button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div style={{width:56,height:56,borderRadius:14,background:"rgba(255,255,255,.15)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20,fontWeight:800,...num}}>{p.pot}</span><span style={{fontSize:8,opacity:.8}}>POT.</span></div>
          <div><div style={{fontSize:20,fontWeight:800}}>{p.name}</div><div style={{fontSize:12,opacity:.9}}>{p.poste} · {p.age} ans · {p.h} cm · pied {p.foot.toLowerCase()}</div><div style={{marginTop:6}}><StatusPill s={p.status}/></div></div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:8}}>
          <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",padding:"4px 8px"}}>Profil technique</div>
          <div style={{width:"100%",height:230}}><ResponsiveContainer><RadarChart data={radar} outerRadius="72%"><PolarGrid stroke={T.line}/><PolarAngleAxis dataKey="k" tick={{fill:T.muted,fontSize:11}}/><Radar dataKey="v" stroke={T.goldDeep} fill={T.gold} fillOpacity={0.45}/></RadarChart></ResponsiveContainer></div>
        </div>
        <div className="grid gap-2" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
          {[["Matchs",p.m],["Buts",p.g],["Passes déc.",p.a]].map(([k,v])=><div key={k} style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:T.ink,...num}}>{v}</div><div style={{fontSize:10,color:T.muted}}>{k}</div></div>)}
        </div>
        <div style={{background:"#fff",border:`1px solid ${T.line}`,borderRadius:12,padding:14}}>
          <div style={{fontWeight:800,color:T.green800,fontSize:12,textTransform:"uppercase",marginBottom:8}}>Notes de scouting</div>
          {notes.map((n,i)=><div key={i} style={{borderLeft:`3px solid ${T.gold}`,paddingLeft:10,marginBottom:10}}><div style={{fontSize:13,color:T.ink}}>{n.d}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{n.a} · {n.t}</div></div>)}
          <div className="flex gap-2 mt-1">
            <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ajouter une observation…" style={{flex:1,border:`1px solid ${T.line}`,borderRadius:8,padding:"8px 10px",fontSize:13}}/>
            <button onClick={()=>{if(draft.trim()){setNotes([{a:"Vous",d:draft.trim(),t:"à l'instant"},...notes]);setDraft("");}}} style={{background:T.green800,color:"#fff",borderRadius:8,padding:"0 14px",fontWeight:700,fontSize:13}}>Ajouter</button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ===================== APP ===================== */
export default function App(){
  const [view,setView]=useState("home");
  const [universe,setUniverse]=useState("M");
  const [season,setSeason]=useState(2026);
  const [staff,setStaff]=useState(false);
  const [modal,setModal]=useState(null); // {type,payload}

  const clubs = universe==="F"?CLUBS_F:CLUBS_M;
  const compName = universe==="F"?"Guinness Super League":"MTN Elite One";
  const ctx = { universe, season, clubs, compName };

  const openMatch=(m)=>setModal({type:"match",m});
  const openClub=(id)=>setModal({type:"club",id});
  const openPlayer=(pid)=>setModal({type:"player",pid});

  const NAV=[{k:"home",label:"Accueil",icon:<TrendingUp size={16}/>},{k:"comp",label:"Compétitions",icon:<Trophy size={16}/>},{k:"scout",label:"Scouting",icon:<Users size={16}/>}];

  return (
    <div style={{background:T.paper,minHeight:"100vh",fontFamily:FONT,color:T.ink,display:"flex",flexDirection:"column"}}>
      <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:.3}100%{opacity:1}} *{box-sizing:border-box} button{cursor:pointer;border:none;background:none;font-family:inherit} select,input{font-family:inherit} table{width:100%}`}</style>

      <header style={{background:T.green900,color:"#fff",position:"sticky",top:0,zIndex:40}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 16px"}} className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 py-3" style={{marginRight:4}}>
            <div style={{width:34,height:34,borderRadius:9,background:T.gold,display:"flex",alignItems:"center",justifyContent:"center"}}><Star size={20} color={T.green900} fill={T.green900}/></div>
            <div style={{lineHeight:1}}><div style={{fontWeight:800,letterSpacing:1,fontSize:15}}>FECAFOOT</div><div style={{fontSize:9,color:T.gold,letterSpacing:2}}>PLATEFORME</div></div>
          </div>
          <nav className="flex items-center gap-1" style={{flex:1}}>
            {NAV.map(n=><button key={n.k} onClick={()=>setView(n.k)} className="flex items-center gap-2" style={{padding:"8px 12px",borderRadius:9,fontSize:13,fontWeight:700,color:view===n.k?T.green900:"#fff",background:view===n.k?T.gold:"transparent"}}>{n.icon}{n.label}</button>)}
          </nav>
          {/* univers */}
          <div className="flex items-center" style={{background:"rgba(255,255,255,.12)",borderRadius:999,padding:2}}>
            {[["M","Hommes"],["F","Femmes"]].map(([k,l])=><button key={k} onClick={()=>{setUniverse(k);setModal(null);}} style={{padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:700,color:universe===k?T.green900:"#fff",background:universe===k?"#fff":"transparent"}}>{l}</button>)}
          </div>
          <select value={season} onChange={e=>{setSeason(+e.target.value);setModal(null);}} style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.25)",borderRadius:8,padding:"6px 8px",fontSize:13,fontWeight:700}}>
            {SEASONS.map(s=><option key={s} value={s} style={{color:"#000"}}>{s}</option>)}
          </select>
          <button onClick={()=>setStaff(s=>!s)} className="flex items-center gap-1" style={{fontSize:12,fontWeight:700,padding:"7px 10px",borderRadius:999,border:`1px solid ${staff?T.gold:"rgba(255,255,255,.3)"}`,color:staff?T.gold:"#fff"}}><Shield size={14}/>{staff?"Staff":"Public"}</button>
        </div>
      </header>

      <main style={{maxWidth:1120,margin:"0 auto",padding:"22px 16px 40px",width:"100%",flex:1}}>
        {view==="home" && <Dashboard ctx={ctx} go={setView} openMatch={openMatch} openClub={openClub} openPlayer={openPlayer}/>}
        {view==="comp" && <Competitions ctx={ctx} openMatch={openMatch} openClub={openClub} openPlayer={openPlayer}/>}
        {view==="scout" && <Scouting universe={universe} locked={!staff} unlock={()=>setStaff(true)}/>}
      </main>

      <footer style={{borderTop:`1px solid ${T.line}`,background:"#fff",marginTop:"auto"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:16,fontSize:12,color:T.muted}} className="flex flex-wrap items-center gap-2">
          <Star size={14} color={T.goldDeep}/><b style={{color:T.green800}}>FECAFOOT - Plateforme unifiée</b>
          <span>· Démo · clubs réels, statistiques simulées</span>
          <span style={{marginLeft:"auto"}}>Hub public + Détection · Hommes &amp; Femmes · 4 saisons · 10 régions</span>
        </div>
      </footer>

      {modal?.type==="match" && <MatchModal m={modal.m} universe={universe} onClose={()=>setModal(null)} openClub={openClub} openPlayer={openPlayer}/>}
      {modal?.type==="club" && <ClubModal id={modal.id} universe={universe} season={season} onClose={()=>setModal(null)} openPlayer={openPlayer} openMatch={openMatch}/>}
      {modal?.type==="player" && <PlayerModal pid={modal.pid} universe={universe} season={season} onClose={()=>setModal(null)} openClub={openClub}/>}
    </div>
  );
}
