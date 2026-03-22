import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ─── ISIN MAP ───────────────────────────────────────────────────────────────── */
const ISIN_MAP = {
  "IE00B4L5Y983":"IWDA","IE00B4L5YC18":"SWDA","FR0010315770":"MWRD",
  "IE00B6R52259":"ACWI","LU1681045370":"PAEEM","IE00BKM4GZ66":"EIMI",
  "US78462F1030":"SPY","US9229083632":"VOO","LU1681048804":"500",
  "US46090E1038":"QQQ","LU1681038243":"PANX","FR0011550185":"ESE",
  "LU1737652823":"EWLD","IE00B0M63177":"EEM","IE00BF4RFH31":"IUSN",
  "LU1681038672":"EPRA","IE00B945VV12":"VEUR","IE00B579F325":"SGLD",
  "IE00BDBRDM35":"AGGH","IE00B1XNHC34":"INRG","IE00B3F81R35":"IEAG",
  "IE00B5BMR087":"CSP1","LU1681041575":"MEUD","LU1681042773":"BCHN",
  "IE00B8GF1M35":"CBRE","LU1681043599":"MWRD","LU1681043086":"PAASI",
};

/* ─── ETF DATABASE ───────────────────────────────────────────────────────────── */
// assetClass: "equity" | "bond" | "commodity" | "real_estate" | "mixed"
// currency: main currency of underlying exposure
// overlap: map of tickers this ETF significantly overlaps with (% of portfolio overlap)
const DB = {
  "IWDA":{ name:"iShares Core MSCI World", isin:"IE00B4L5Y983", p:"iShares",
    assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4},
    geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3},
    sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discrétionnaire":10,"Conso. courante":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3},
    overlaps:{"SWDA":99,"MWRD":98,"XDWD":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68,"QQQ":42,"PANX":42}},
  "SWDA":{ name:"iShares MSCI World Acc", isin:"IE00B4L5Y983", p:"iShares",
    assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4},
    geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3},
    sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discrétionnaire":10,"Conso. courante":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3},
    overlaps:{"IWDA":99,"MWRD":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68}},
  "MWRD":{ name:"Amundi MSCI World", isin:"LU1681043599", p:"Amundi",
    assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4},
    geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3},
    sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discrétionnaire":10,"Conso. courante":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3},
    overlaps:{"IWDA":98,"SWDA":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68}},
  "EWLD":{ name:"Amundi MSCI All World", isin:"LU1792117779", p:"Amundi",
    assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3},
    geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4},
    sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discrétionnaire":10,"Conso. courante":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3},
    overlaps:{"ACWI":97,"IWDA":85,"SWDA":85,"MWRD":85}},
  "ACWI":{ name:"iShares MSCI ACWI", isin:"IE00B6R52259", p:"iShares",
    assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3},
    geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4},
    sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discrétionnaire":10,"Conso. courante":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3},
    overlaps:{"EWLD":97,"IWDA":85,"SWDA":85,"MWRD":85}},
  "PAEEM":{ name:"Amundi MSCI Emerging Markets", isin:"LU1681045370", p:"Amundi",
    assetClass:"equity", currencies:{CNY:32,TWD:16,INR:15,KRW:12,BRL:6,Autres:19},
    geo:{"Chine":32,"Taiwan":16,"Inde":15,"Corée du Sud":12,"Brésil":6,"Autres EM":19},
    sec:{"Technologie":28,"Finance":22,"Conso. discrétionnaire":12,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. courante":4},
    overlaps:{"EIMI":95,"EEM":92}},
  "EIMI":{ name:"iShares Core MSCI EM IMI", isin:"IE00BKM4GZ66", p:"iShares",
    assetClass:"equity", currencies:{CNY:28,TWD:18,INR:16,KRW:12,BRL:5,Autres:21},
    geo:{"Chine":28,"Taiwan":18,"Inde":16,"Corée du Sud":12,"Brésil":5,"Autres EM":21},
    sec:{"Technologie":29,"Finance":21,"Conso. discrétionnaire":11,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. courante":5},
    overlaps:{"PAEEM":95,"EEM":92}},
  "EEM":{ name:"iShares MSCI Emerging Markets", isin:"US4642872349", p:"iShares",
    assetClass:"equity", currencies:{CNY:30,TWD:17,INR:15,KRW:11,BRL:5,Autres:22},
    geo:{"Chine":30,"Taiwan":17,"Inde":15,"Corée du Sud":11,"Brésil":5,"Autres EM":22},
    sec:{"Technologie":28,"Finance":22,"Conso. discrétionnaire":12,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. courante":4},
    overlaps:{"PAEEM":92,"EIMI":92}},
  "SPY":{ name:"SPDR S&P 500", isin:"US78462F1030", p:"SPDR",
    assetClass:"equity", currencies:{USD:100},
    geo:{"Amér. du Nord":100},
    sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discrétionnaire":11,"Industrie":9,"Conso. courante":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3},
    overlaps:{"VOO":99,"CSP1":99,"500":99,"ESE":99,"IWDA":68,"SWDA":68,"MWRD":68,"QQQ":55,"PANX":55}},
  "VOO":{ name:"Vanguard S&P 500", isin:"US9229083632", p:"Vanguard",
    assetClass:"equity", currencies:{USD:100},
    geo:{"Amér. du Nord":100},
    sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discrétionnaire":11,"Industrie":9,"Conso. courante":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3},
    overlaps:{"SPY":99,"CSP1":99,"500":99,"ESE":99,"IWDA":68,"SWDA":68,"MWRD":68,"QQQ":55,"PANX":55}},
  "CSP1":{ name:"iShares Core S&P 500", isin:"IE00B5BMR087", p:"iShares",
    assetClass:"equity", currencies:{USD:100},
    geo:{"Amér. du Nord":100},
    sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discrétionnaire":11,"Industrie":9,"Conso. courante":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3},
    overlaps:{"SPY":99,"VOO":99,"500":99,"ESE":99,"IWDA":68,"SWDA":68,"MWRD":68}},
  "500":{ name:"Amundi S&P 500", isin:"LU1681048804", p:"Amundi",
    assetClass:"equity", currencies:{USD:100},
    geo:{"Amér. du Nord":100},
    sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discrétionnaire":11,"Industrie":9,"Conso. courante":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3},
    overlaps:{"SPY":99,"VOO":99,"CSP1":99,"ESE":99,"IWDA":68,"SWDA":68,"MWRD":68}},
  "ESE":{ name:"BNP Paribas Easy S&P 500", isin:"FR0011550185", p:"BNP Paribas",
    assetClass:"equity", currencies:{USD:100},
    geo:{"Amér. du Nord":100},
    sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discrétionnaire":11,"Industrie":9,"Conso. courante":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3},
    overlaps:{"SPY":99,"VOO":99,"CSP1":99,"500":99,"IWDA":68,"SWDA":68,"MWRD":68}},
  "QQQ":{ name:"Invesco NASDAQ-100", isin:"US46090E1038", p:"Invesco",
    assetClass:"equity", currencies:{USD:97,Autres:3},
    geo:{"Amér. du Nord":97,"Autres":3},
    sec:{"Technologie":50,"Conso. discrétionnaire":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. courante":4,"Énergie":1,"Autres":7},
    overlaps:{"PANX":99,"SPY":55,"VOO":55,"CSP1":55,"500":55,"ESE":55,"IWDA":42}},
  "PANX":{ name:"Amundi NASDAQ-100", isin:"LU1681038243", p:"Amundi",
    assetClass:"equity", currencies:{USD:97,Autres:3},
    geo:{"Amér. du Nord":97,"Autres":3},
    sec:{"Technologie":50,"Conso. discrétionnaire":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. courante":4,"Énergie":1,"Autres":7},
    overlaps:{"QQQ":99,"SPY":55,"VOO":55,"CSP1":55,"500":55,"ESE":55,"IWDA":42}},
  "IUSN":{ name:"iShares MSCI World Small Cap", isin:"IE00BF4RFH31", p:"iShares",
    assetClass:"equity", currencies:{USD:58,EUR:18,JPY:10,GBP:7,Autres:7},
    geo:{"Amér. du Nord":58,"Europe":18,"Japon":10,"Asie-Pac.":7,"Autres":7},
    sec:{"Industrie":20,"Finance":16,"Technologie":15,"Santé":12,"Conso. discrétionnaire":11,"Matériaux":8,"Conso. courante":6,"Immobilier":5,"Énergie":4,"Télécom":2,"Services pub.":1},
    overlaps:{"IWDA":8,"SWDA":8}},
  "VEUR":{ name:"Vanguard FTSE Developed Europe", isin:"IE00B945VV12", p:"Vanguard",
    assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4},
    geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28},
    sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. courante":12,"Matériaux":8,"Conso. discrétionnaire":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2},
    overlaps:{"MEUD":96,"IWDA":16,"SWDA":16}},
  "MEUD":{ name:"Amundi MSCI Europe", isin:"LU1681041575", p:"Amundi",
    assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4},
    geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28},
    sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. courante":12,"Matériaux":8,"Conso. discrétionnaire":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2},
    overlaps:{"VEUR":96,"IWDA":16,"SWDA":16}},
  "PAASI":{ name:"Amundi MSCI Asia Pacific Ex-Japan", isin:"LU1681043086", p:"Amundi",
    assetClass:"equity", currencies:{CNY:38,TWD:20,INR:17,KRW:14,Autres:11},
    geo:{"Chine":38,"Taiwan":20,"Inde":17,"Corée du Sud":14,"Autres Asie":11},
    sec:{"Technologie":32,"Finance":20,"Conso. discrétionnaire":12,"Télécom":9,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. courante":3},
    overlaps:{"PAEEM":45,"EIMI":42}},
  "EPRA":{ name:"Amundi FTSE EPRA Nareit", isin:"LU1681038672", p:"Amundi",
    assetClass:"real_estate", currencies:{USD:55,JPY:10,AUD:8,GBP:7,Autres:20},
    geo:{"Amér. du Nord":55,"Japon":10,"Australie":8,"Royaume-Uni":7,"Autres":20},
    sec:{"Immobilier":100},
    overlaps:{"CBRE":75}},
  "CBRE":{ name:"iShares Global REIT", isin:"IE00B8GF1M35", p:"iShares",
    assetClass:"real_estate", currencies:{USD:65,JPY:10,AUD:8,SGD:5,Autres:12},
    geo:{"Amér. du Nord":65,"Japon":10,"Australie":8,"Singapour":5,"Autres":12},
    sec:{"Immobilier":100},
    overlaps:{"EPRA":75}},
  "SGLD":{ name:"Invesco Physical Gold", isin:"IE00B579F325", p:"Invesco",
    assetClass:"commodity", currencies:{USD:100},
    geo:{"Global":100}, sec:{"Or":100}, overlaps:{}},
  "GLD":{ name:"SPDR Gold Shares", isin:"US78463V1070", p:"SPDR",
    assetClass:"commodity", currencies:{USD:100},
    geo:{"Global":100}, sec:{"Or":100}, overlaps:{"SGLD":99}},
  "INRG":{ name:"iShares Global Clean Energy", isin:"IE00B1XNHC34", p:"iShares",
    assetClass:"equity", currencies:{USD:45,EUR:30,Autres:25},
    geo:{"Amér. du Nord":45,"Europe":30,"Asie-Pac.":15,"Autres":10},
    sec:{"Énergie renou.":70,"Services pub.":20,"Industrie":10},
    overlaps:{}},
  "BCHN":{ name:"Amundi MSCI China", isin:"LU1681042773", p:"Amundi",
    assetClass:"equity", currencies:{CNY:100},
    geo:{"Chine":100},
    sec:{"Conso. discrétionnaire":28,"Finance":20,"Télécom":15,"Industrie":12,"Technologie":10,"Santé":6,"Énergie":5,"Matériaux":4},
    overlaps:{"PAEEM":32,"EIMI":28}},
  "AGGH":{ name:"iShares Global Aggregate Bond", isin:"IE00BDBRDM35", p:"iShares",
    assetClass:"bond", currencies:{USD:40,EUR:30,JPY:15,Autres:15},
    geo:{"Amér. du Nord":40,"Europe":30,"Japon":15,"Autres":15},
    sec:{"Oblig. souv.":60,"Oblig. corp.":30,"Autres":10},
    overlaps:{"IEAG":35}},
  "IEAG":{ name:"iShares Euro Aggregate Bond", isin:"IE00B3F81R35", p:"iShares",
    assetClass:"bond", currencies:{EUR:90,Autres:10},
    geo:{"Europe":90,"Autres":10},
    sec:{"Oblig. souv.":70,"Oblig. corp.":25,"Autres":5},
    overlaps:{"AGGH":35}},
};

const STORAGE_KEY = "etf-portfolio-v2";

/* ─── EXPERT SCORING ENGINE ──────────────────────────────────────────────────── */
function hhi(obj) {
  const t = Object.values(obj).reduce((a,b)=>a+b,0);
  if(!t) return 1;
  return Object.values(obj).reduce((s,v)=>s+Math.pow(v/t,2),0);
}
function hhiToScore(h, n) {
  // Use a softer curve: sqrt gives more credit to partial diversification
  const mn = 1/n, norm = (h-mn)/(1-mn);
  return Math.max(0, 1 - Math.pow(Math.max(0, norm), 0.75));
}

// 1. Geographic diversification (0-1)
function geoScore(geoMap) {
  if(!Object.keys(geoMap).length) return 0;
  // Count distinct regions with meaningful weight (>2%)
  const meaningful = Object.values(geoMap).filter(v=>v>2).length;
  const n = Math.max(meaningful, Object.keys(geoMap).length, 6);
  return hhiToScore(hhi(geoMap), n);
}

// 2. Sector diversification (0-1)
function sectorScore(secMap) {
  if(!Object.keys(secMap).length) return 0;
  const meaningful = Object.values(secMap).filter(v=>v>2).length;
  const n = Math.max(meaningful, Object.keys(secMap).length, 8);
  return hhiToScore(hhi(secMap), n);
}

// 3. Overlap score (0-1) — penalizes redundant ETF holdings
function overlapScore(holdings, total) {
  if(holdings.length <= 1) return 1;
  let totalPenalty = 0;
  let comparisons = 0;
  for(let i=0; i<holdings.length; i++) {
    for(let j=i+1; j<holdings.length; j++) {
      const a = holdings[i], b = holdings[j];
      const etfA = DB[a.ticker], etfB = DB[b.ticker];
      if(!etfA||!etfB) continue;
      const overlapPct = etfA.overlaps?.[b.ticker] || 0;
      const wA = a.amount/total, wB = b.amount/total;
      const combinedWeight = Math.min(wA, wB);
      totalPenalty += (overlapPct/100) * combinedWeight * 2;
      comparisons++;
    }
  }
  return Math.max(0, 1 - totalPenalty * 1.5);
}

// 4. Asset class diversification (0-1)
function assetClassScore(holdings, total) {
  if(!holdings.length) return 0;
  const classes = {};
  for(const h of holdings) {
    const e = DB[h.ticker]; if(!e) continue;
    const w = h.amount/total;
    classes[e.assetClass] = (classes[e.assetClass]||0) + w;
  }
  // Ideal: equity ~60%, bonds ~25%, real_estate ~8%, commodity ~7%
  const ideal = {equity:0.60, bond:0.25, real_estate:0.08, commodity:0.07};
  const presentClasses = Object.keys(classes).length;
  // Base score on number of distinct classes + proximity to ideal allocation
  const classBonus = Math.min(1, presentClasses / 4);
  let deviationPenalty = 0;
  for(const [cls, idealW] of Object.entries(ideal)) {
    const actual = classes[cls] || 0;
    deviationPenalty += Math.abs(actual - idealW) * 0.5;
  }
  return Math.max(0, classBonus - Math.min(0.4, deviationPenalty));
}

// 5. Currency diversification (0-1) — penalizes >70% single currency
function currencyScore(holdings, total) {
  if(!holdings.length) return 0;
  const currencies = {};
  for(const h of holdings) {
    const e = DB[h.ticker]; if(!e) continue;
    const w = h.amount/total;
    for(const [cur, pct] of Object.entries(e.currencies||{})) {
      currencies[cur] = (currencies[cur]||0) + (pct/100)*w;
    }
  }
  const n = Math.max(Object.keys(currencies).length, 4);
  return hhiToScore(hhi(currencies), n);
}

// Composite expert score /20
function computeExpertScore(holdings) {
  if(!holdings.length) return { total:0, geo:0, sector:0, overlap:0, assetClass:0, currency:0, geoMap:{}, secMap:{}, classes:{}, currencies:{} };
  const total = holdings.reduce((s,h)=>s+h.amount,0);
  if(!total) return { total:0, geo:0, sector:0, overlap:0, assetClass:0, currency:0, geoMap:{}, secMap:{}, classes:{}, currencies:{} };

  const geoMap={}, secMap={}, classes={}, currencyMap={};
  for(const h of holdings) {
    const e = DB[h.ticker]; if(!e) continue;
    const w = h.amount/total;
    for(const[k,v] of Object.entries(e.geo)) geoMap[k]=(geoMap[k]||0)+(v/100)*w*100;
    for(const[k,v] of Object.entries(e.sec)) secMap[k]=(secMap[k]||0)+(v/100)*w*100;
    classes[e.assetClass]=(classes[e.assetClass]||0)+w*100;
    for(const[k,v] of Object.entries(e.currencies||{})) currencyMap[k]=(currencyMap[k]||0)+(v/100)*w*100;
  }

  const s1 = geoScore(geoMap);
  const s2 = sectorScore(secMap);
  const s3 = overlapScore(holdings, total);
  const s4 = assetClassScore(holdings, total);
  const s5 = currencyScore(holdings, total);

  // Weighted composite
  const weights = { geo:0.25, sector:0.25, overlap:0.20, assetClass:0.15, currency:0.15 };
  const composite = s1*weights.geo + s2*weights.sector + s3*weights.overlap + s4*weights.assetClass + s5*weights.currency;

  return {
    total: Math.round(composite*200)/10,
    geo:   Math.round(s1*200)/10,
    sector:Math.round(s2*200)/10,
    overlap:Math.round(s3*200)/10,
    assetClass:Math.round(s4*200)/10,
    currency:Math.round(s5*200)/10,
    geoMap, secMap, classes, currencies: currencyMap,
  };
}

/* ─── RECOMMENDATIONS ENGINE ─────────────────────────────────────────────────── */
function buildRecommendations(scores, holdings, total) {
  const recs = [];
  const { geoMap, secMap, classes, currencies } = scores;

  // — Overlap warnings
  for(let i=0; i<holdings.length; i++) {
    for(let j=i+1; j<holdings.length; j++) {
      const a=holdings[i], b=holdings[j];
      const etfA=DB[a.ticker], etfB=DB[b.ticker]; if(!etfA||!etfB) continue;
      const ov=etfA.overlaps?.[b.ticker]||0;
      if(ov>=90) recs.push({ priority:"high", emoji:"⚠️", color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)",
        title:"Chevauchement critique",
        text:`${a.ticker} et ${b.ticker} se recoupent à ${ov}% — vous doublez la même exposition. Conservez un seul des deux.` });
      else if(ov>=60) recs.push({ priority:"medium", emoji:"🔄", color:"#fb923c", bg:"rgba(251,146,60,0.08)", border:"rgba(251,146,60,0.2)",
        title:"Chevauchement élevé",
        text:`${a.ticker} et ${b.ticker} partagent ~${ov}% de leurs sous-jacents. Vérifiez que cette duplication est intentionnelle.` });
    }
  }

  // — Asset class gaps
  const equityPct = classes["equity"]||0;
  const bondPct = classes["bond"]||0;
  const realEstatePct = classes["real_estate"]||0;
  const commodityPct = classes["commodity"]||0;

  if(bondPct===0 && holdings.length>0) recs.push({ priority:"high", emoji:"🔒", color:"#818cf8", bg:"rgba(129,140,248,0.08)", border:"rgba(129,140,248,0.2)",
    title:"Aucune exposition obligataire",
    text:`Votre portefeuille est 100% actions. Les obligations réduisent la volatilité globale et protègent en cas de krach. Envisagez AGGH (global) ou IEAG (euro).` });
  else if(bondPct<15 && holdings.length>0) recs.push({ priority:"medium", emoji:"🔒", color:"#818cf8", bg:"rgba(129,140,248,0.08)", border:"rgba(129,140,248,0.2)",
    title:"Faible exposition obligataire",
    text:`Seulement ${bondPct.toFixed(0)}% d'obligations. Une allocation de 20-30% améliorerait la résilience du portefeuille.` });

  if(realEstatePct===0 && holdings.length>=2) recs.push({ priority:"low", emoji:"🏢", color:"#34d399", bg:"rgba(52,211,153,0.08)", border:"rgba(52,211,153,0.2)",
    title:"Immobilier absent",
    text:`L'immobilier coté (REITs) offre une décorrélation partielle des actions et des revenus réguliers. EPRA ou CBRE sont des options.` });

  if(commodityPct===0 && holdings.length>=3) recs.push({ priority:"low", emoji:"✨", color:"#facc15", bg:"rgba(250,204,21,0.08)", border:"rgba(250,204,21,0.2)",
    title:"Aucune matière première",
    text:`L'or (SGLD) agit comme valeur refuge et couverture contre l'inflation. Une allocation de 5-10% est souvent recommandée.` });

  // — Geographic concentration
  const usW = geoMap["Amér. du Nord"]||0;
  const emW = ["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie"].reduce((s,k)=>s+(geoMap[k]||0),0);
  if(usW>80) recs.push({ priority:"high", emoji:"🌍", color:"#facc15", bg:"rgba(250,204,21,0.08)", border:"rgba(250,204,21,0.2)",
    title:"Concentration US excessive",
    text:`${usW.toFixed(0)}% en Amér. du Nord — votre portefeuille dépend fortement de l'économie américaine. Ajoutez VEUR (Europe) ou PAEEM (émergents).` });
  if(emW<8 && holdings.length>0) recs.push({ priority:"medium", emoji:"📈", color:"#818cf8", bg:"rgba(129,140,248,0.08)", border:"rgba(129,140,248,0.2)",
    title:"Sous-exposition aux émergents",
    text:`${emW.toFixed(0)}% seulement en marchés émergents. Ils représentent ~40% du PIB mondial. PAEEM ou EIMI à 10-15% est une base raisonnable.` });

  // — Sector concentration
  const techW = secMap["Technologie"]||0;
  if(techW>35) recs.push({ priority:"high", emoji:"💻", color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)",
    title:"Surdose de technologie",
    text:`${techW.toFixed(0)}% en Technologie — volatilité élevée, sensible aux taux d'intérêt. Diversifiez avec des secteurs défensifs (Santé, Conso. courante).` });

  // — Currency risk
  const usdW = currencies["USD"]||0;
  if(usdW>80) recs.push({ priority:"medium", emoji:"💱", color:"#38bdf8", bg:"rgba(56,189,248,0.08)", border:"rgba(56,189,248,0.2)",
    title:"Risque de change USD élevé",
    text:`${usdW.toFixed(0)}% d'exposition en USD sans couverture. Une dépréciation du dollar impacte directement vos rendements en euros. Envisagez des ETF hedgés ou plus européens.` });

  // — Perfect scores
  if(scores.overlap>=18 && scores.assetClass>=14 && scores.geo>=14 && scores.sector>=14) recs.push({ priority:"success", emoji:"🏆", color:"#4ade80", bg:"rgba(74,222,128,0.08)", border:"rgba(74,222,128,0.2)",
    title:"Portefeuille excellent",
    text:`Diversification optimale sur tous les critères. Maintenez le cap et rééquilibrez périodiquement.` });

  const order = { high:0, medium:1, low:2, success:3 };
  return recs.sort((a,b)=>order[a.priority]-order[b.priority]).slice(0,5);
}

/* ─── SUGGESTION CATALOG ────────────────────────────────────────────────────── */
const SUGGESTION_CATALOG = {
  bonds: {
    title: "Obligations",
    emoji: "🔒",
    color: "#34d399",
    why: "Votre portefeuille manque d'obligations. Elles réduisent la volatilité et offrent un coussin en cas de krach actions.",
    options: [
      { ticker:"AGGH", label:"Global (hedgé EUR)", desc:"Obligations mondiales couvertes en euros — le plus diversifié." },
      { ticker:"IEAG", label:"Zone Euro",           desc:"Obligations européennes souveraines et corporate — risque de change nul." },
    ]
  },
  gold: {
    title: "Or",
    emoji: "✨",
    color: "#facc15",
    why: "L'or est une valeur refuge décorrélée des marchés. 5-10% protège contre l'inflation et les crises.",
    options: [
      { ticker:"SGLD", label:"Or physique (Invesco)", desc:"Réplication physique, coté à Londres, frais parmi les plus bas." },
      { ticker:"GLD",  label:"Or physique (SPDR)",    desc:"Le plus ancien et liquide des ETF or, coté aux US." },
    ]
  },
  realestate: {
    title: "Immobilier coté",
    emoji: "🏢",
    color: "#fb923c",
    why: "L'immobilier coté (REITs) offre des revenus réguliers et une décorrélation partielle des actions.",
    options: [
      { ticker:"EPRA", label:"Monde développé (Amundi)", desc:"Foncières cotées mondiales — exposition Europe et Asie." },
      { ticker:"CBRE", label:"Global REIT (iShares)",    desc:"REITs mondiaux avec forte pondération US." },
    ]
  },
  europe: {
    title: "Actions Europe",
    emoji: "🇪🇺",
    color: "#38bdf8",
    why: "Votre exposition est très centrée sur les US. L'Europe offre une diversification géographique et sectorielle complémentaire.",
    options: [
      { ticker:"VEUR", label:"Europe développée (Vanguard)", desc:"UK, France, Suisse, Allemagne — les plus grandes capi européennes." },
      { ticker:"MEUD", label:"Europe MSCI (Amundi)",         desc:"Même exposition, frais légèrement inférieurs." },
    ]
  },
  emerging: {
    title: "Marchés émergents",
    emoji: "📈",
    color: "#a78bfa",
    why: "Les émergents représentent ~40% du PIB mondial mais sont sous-représentés dans votre portefeuille.",
    options: [
      { ticker:"PAEEM", label:"EM MSCI (Amundi)",      desc:"Chine, Inde, Taiwan, Corée — émergents large caps, frais bas." },
      { ticker:"EIMI",  label:"EM IMI (iShares)",      desc:"Version étendue incluant les mid et small caps émergentes." },
    ]
  },
  smallcaps: {
    title: "Small caps",
    emoji: "🔬",
    color: "#c084fc",
    why: "Les small caps offrent une prime de rendement historique et diversifient vos grandes capitalisations.",
    options: [
      { ticker:"IUSN", label:"World Small Cap (iShares)", desc:"Small caps mondiales — complément naturel à un ETF World large caps." },
    ]
  },
  eurobonds: {
    title: "Obligations euro",
    emoji: "💶",
    color: "#34d399",
    why: "Votre exposition USD est très élevée. Des obligations en euros éliminent le risque de change.",
    options: [
      { ticker:"IEAG", label:"Euro Aggregate (iShares)", desc:"Obligations souveraines et corporate en euros — risque de change nul." },
    ]
  },
  world: {
    title: "ETF Monde — par où commencer",
    emoji: "🌍",
    color: "#818cf8",
    why: "Un ETF Monde est la brique de base idéale : diversification maximale en un seul produit.",
    options: [
      { ticker:"IWDA",  label:"MSCI World (iShares)",  desc:"1600 entreprises des pays développés. La référence." },
      { ticker:"EWLD",  label:"All World (Amundi)",     desc:"Monde développé + émergents en un seul ETF." },
      { ticker:"MWRD",  label:"MSCI World (Amundi)",    desc:"Équivalent IWDA, domicilié Luxembourg, frais compétitifs." },
    ]
  },
};

function buildSuggestions(scores, holdings) {
  const keys = [];
  const { classes, geoMap, secMap, currencies } = scores;
  const tickers = new Set(holdings.map(h => h.ticker));
  const bondPct   = classes["bond"]        || 0;
  const rePct     = classes["real_estate"] || 0;
  const commPct   = classes["commodity"]   || 0;
  const equityPct = classes["equity"]      || 0;
  const usW  = geoMap["Amér. du Nord"] || 0;
  const emW  = ["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const euW  = ["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const techW = secMap["Technologie"] || 0;
  const usdW  = currencies["USD"] || 0;

  if(!holdings.length) { keys.push("world","bonds","gold"); }
  if(bondPct < 10)  keys.push(usdW > 80 ? "eurobonds" : "bonds");
  if(commPct < 5)   keys.push("gold");
  if(rePct < 5 && holdings.length >= 2) keys.push("realestate");
  if(usW > 70 && euW < 15) keys.push("europe");
  if(emW < 8)       keys.push("emerging");
  if(!tickers.has("IUSN") && equityPct > 50 && holdings.length >= 2) keys.push("smallcaps");

  // deduplicate and map to catalog entries with emoji/color for the chip
  return [...new Set(keys)].slice(0,4).map(k => ({
    key: k,
    label: SUGGESTION_CATALOG[k].title,
    emoji: SUGGESTION_CATALOG[k].emoji,
    color: SUGGESTION_CATALOG[k].color,
  }));
}

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
function scoreStyle(s) {
  if(s>=15) return { from:"#4ade80", to:"#16a34a", text:"#4ade80", label:"Excellent" };
  if(s>=10) return { from:"#facc15", to:"#ca8a04", text:"#facc15", label:"Correct" };
  if(s>= 5) return { from:"#fb923c", to:"#ea580c", text:"#fb923c", label:"Faible" };
  return           { from:"#f87171", to:"#dc2626", text:"#f87171", label:"Très faible" };
}
const BAR = ["#818cf8","#38bdf8","#a78bfa","#6ee7b7","#c084fc","#67e8f9","#4ade80","#93c5fd","#e879f9","#7dd3fc"];
const ASSET_LABELS = { equity:"Actions", bond:"Obligations", real_estate:"Immobilier", commodity:"Matières 1ères" };
const ASSET_COLORS = { equity:"#818cf8", bond:"#34d399", real_estate:"#facc15", commodity:"#fb923c" };

/* ─── GLASS CARD ─────────────────────────────────────────────────────────────── */
function GlassCard({ children, style={} }) {
  return (
    <div style={{
      borderRadius:20, background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(255,255,255,0.07)",
      position:"relative", overflow:"hidden", ...style,
    }}>
      <div aria-hidden="true" style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`
          radial-gradient(ellipse 65% 55% at 5% 15%, rgba(99,102,241,0.10) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 95% 85%, rgba(139,92,246,0.08) 0%, transparent 65%),
          radial-gradient(ellipse 38% 42% at 72% 8%,  rgba(56,189,248,0.06) 0%, transparent 55%)
        `,
      }}/>
      <div style={{position:"relative"}}>{children}</div>
    </div>
  );
}

/* ─── SCORE ARC ──────────────────────────────────────────────────────────────── */
function ScoreArc({ value, label, size=158 }) {
  const r=size/2-13, circ=2*Math.PI*r;
  const g=scoreStyle(value);
  const id=`sg-${label.replace(/\W/g,"")}`;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flex:1}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={g.from}/><stop offset="100%" stopColor={g.to}/>
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth="7"
            strokeDasharray={`${(value/20)*circ} ${(1-value/20)*circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 0.9s cubic-bezier(.16,1,.3,1)",filter:`drop-shadow(0 0 7px ${g.from}99)`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
          <span style={{fontSize:36,fontWeight:700,color:g.text,lineHeight:1,letterSpacing:-1}}>{value.toFixed(1)}</span>
          <span style={{fontSize:10,color:"#94a3b8",letterSpacing:2}}>/20</span>
        </div>
      </div>
      <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:2}}>
        <span style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{label}</span>
        {value>0&&<span style={{fontSize:11,color:g.text,fontWeight:500}}>{g.label}</span>}
      </div>
    </div>
  );
}

/* ─── MINI SCORE BAR ─────────────────────────────────────────────────────────── */
function MiniScoreBar({ label, value, weight }) {
  const g = scoreStyle(value);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:120,fontSize:12,color:"#94a3b8",flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(value/20)*100}%`,
          background:`linear-gradient(90deg,${g.from},${g.to})`,borderRadius:3,
          transition:"width 0.7s cubic-bezier(.16,1,.3,1)",
          boxShadow:`0 0 8px ${g.from}66`}}/>
      </div>
      <span style={{fontSize:12,color:g.text,fontWeight:700,width:32,textAlign:"right"}}>{value.toFixed(1)}</span>
      <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",width:30,textAlign:"right"}}>{weight}</span>
    </div>
  );
}

/* ─── COLOR BARS ─────────────────────────────────────────────────────────────── */
const SECTOR_INFO = {
  "Technologie":"Logiciels, semi-conducteurs, matériel informatique, cloud.",
  "Finance":"Banques, assurances, sociétés de gestion d'actifs.",
  "Santé":"Pharmaceutique, biotechnologie, dispositifs médicaux.",
  "Industrie":"Fabrication, aérospatiale, défense, transports.",
  "Conso. discrétionnaire":"Biens non essentiels : mode, automobile, loisirs, e-commerce.",
  "Conso. courante":"Produits de première nécessité : alimentation, hygiène, tabac.",
  "Énergie":"Pétrole, gaz, énergies renouvelables.",
  "Matériaux":"Métaux, mines, chimie, matières premières.",
  "Télécom":"Opérateurs, câble, internet, médias.",
  "Immobilier":"REITs et foncières cotées.",
  "Services pub.":"Électricité, gaz, eau — revenus stables et régulés.",
  "Oblig. souv.":"Obligations d'États souverains, risque faible.",
  "Oblig. corp.":"Obligations d'entreprises, rendement supérieur.",
  "Or":"Valeur refuge, couverture contre l'inflation.",
  "Énergie renou.":"Solaire, éolien, hydraulique — transition énergétique.",
};
const GEO_INFO = {
  "Amér. du Nord":"États-Unis et Canada — marchés les plus profonds et liquides.",
  "Europe":"UE + UK, Suisse, Norvège — économies développées matures.",
  "Japon":"3ème économie mondiale, automobile et électronique.",
  "Asie-Pac.":"Australie, NZ, Hong Kong, Singapour — développés asiatiques.",
  "Émergents":"Chine, Inde, Brésil… fort potentiel, risque plus élevé.",
  "Chine":"2ème économie mondiale, risque réglementaire élevé.",
  "Inde":"Fort potentiel de croissance, démographie favorable.",
  "Taiwan":"Leader mondial semi-conducteurs (TSMC), risque géopolitique.",
  "Corée du Sud":"Tech et industrie (Samsung, Hyundai).",
  "Brésil":"Plus grande économie d'Amérique latine, riche en matières premières.",
  "Autres EM":"Afrique du Sud, Mexique, Indonésie, Thaïlande…",
  "Royaume-Uni":"Finance, énergie et biens de conso — marché post-Brexit.",
  "France":"CAC 40 : luxe, énergie, aéronautique.",
  "Suisse":"Pharma, finance et luxe — très défensif.",
  "Allemagne":"Première économie européenne, industrie automobile.",
  "Pays-Bas":"Hub logistique, technologie (ASML).",
  "Autres EU":"Espagne, Italie, Suède, Belgique…",
  "Australie":"Matières premières, finance — liée à la Chine.",
  "Singapour":"Hub financier asiatique.",
  "Autres Asie":"Vietnam, Malaisie… émergents asiatiques en forte croissance.",
  "Global":"Exposition mondiale sans concentration particulière.",
  "Autres":"Autres régions diversifiées.",
};

function InfoModal({ label, text, onClose }) {
  useEffect(()=>{ const fn=e=>{if(e.key==="Escape")onClose();}; document.addEventListener("keydown",fn); return()=>document.removeEventListener("keydown",fn); },[onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 16px 40px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(18,18,26,0.98)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:20,padding:"24px 22px",width:"100%",maxWidth:400,boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",
        animation:"fadeUp 0.25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{label}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"50%",
            width:28,height:28,color:"#94a3b8",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>{text}</p>
      </div>
    </div>
  );
}

function InfoBtn({ label, text }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={()=>setShow(true)} style={{background:"none",border:"none",cursor:"pointer",
        padding:"0 0 0 5px",display:"inline-flex",alignItems:"center",lineHeight:1}}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
          <text x="6.5" y="10" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="system-ui" fontWeight="600">i</text>
        </svg>
      </button>
      {show&&<InfoModal label={label} text={text} onClose={()=>setShow(false)}/>}
    </>
  );
}

function ColorBars({ data, title, infoMap={} }) {
  const sorted=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,9);
  const max=sorted[0]?.[1]||1;
  return (
    <GlassCard>
      <div style={{padding:"20px 18px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:18}}>{title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {sorted.map(([k,v],i)=>(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"#e2e8f0",fontWeight:500}}>{k}</span>
                  {infoMap[k]&&<InfoBtn label={k} text={infoMap[k]}/>}
                </div>
                <span style={{fontSize:13,color:BAR[i%BAR.length],fontWeight:700}}>{v.toFixed(1)}%</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(v/max)*100}%`,
                  background:`linear-gradient(90deg,${BAR[i%BAR.length]},${BAR[i%BAR.length]}aa)`,
                  borderRadius:3,transition:"width 0.8s cubic-bezier(.16,1,.3,1)",
                  boxShadow:`0 0 10px ${BAR[i%BAR.length]}55`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ─── SEARCH ─────────────────────────────────────────────────────────────────── */
/* ─── SUGGESTION MODAL ──────────────────────────────────────────────────────── */
function SuggestionModal({ catalog, onSelect, onClose }) {
  useEffect(()=>{ const fn=e=>{if(e.key==="Escape")onClose();}; document.addEventListener("keydown",fn); return()=>document.removeEventListener("keydown",fn); },[onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",
      backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",
      zIndex:9999,padding:"0 16px 40px"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"rgba(14,14,22,0.98)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:24,padding:"24px 20px",width:"100%",maxWidth:420,
        boxShadow:"0 -8px 48px rgba(0,0,0,0.6)",
        animation:"fadeUp 0.28s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{catalog.emoji}</span>
            <span style={{fontSize:16,fontWeight:700,color:"#e2e8f0"}}>{catalog.title}</span>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",
            borderRadius:"50%",width:30,height:30,color:"#94a3b8",fontSize:17,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {/* Why */}
        <p style={{margin:"0 0 20px",fontSize:13,color:"#94a3b8",lineHeight:1.65,
          padding:"12px 14px",background:"rgba(255,255,255,0.04)",borderRadius:12,
          border:"1px solid rgba(255,255,255,0.06)"}}>{catalog.why}</p>
        {/* Options */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Choisir un ETF</div>
          {catalog.options.map(opt=>(
            <button key={opt.ticker} onClick={()=>onSelect(opt.ticker)}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",width:"100%",
                transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(255,255,255,0.14)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:700,fontFamily:"ui-monospace,monospace",
                  color:"#a5b4fc",letterSpacing:0.8}}>{opt.ticker}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontWeight:500}}>{opt.label}</span>
              </div>
              <div style={{fontSize:12,color:"#7c8fa8",lineHeight:1.5}}>{opt.desc}</div>
            </button>
          ))}
        </div>
        <p style={{margin:"16px 0 0",fontSize:10,color:"rgba(255,255,255,0.18)",textAlign:"center",lineHeight:1.6}}>
          Ces suggestions sont indicatives. D'autres ETF couvrent la même catégorie.
        </p>
      </div>
    </div>
  );
}

function Search({ onAdd, suggestions=[] }) {
  const [q,setQ]=useState(""); const [amt,setAmt]=useState(""); const [open,setOpen]=useState(false);
  const [hi,setHi]=useState(0); const [err,setErr]=useState(""); const [activeSuggestion,setActiveSuggestion]=useState(null);
  const ref=useRef(null); const amtRef=useRef(null);

  useEffect(()=>{ const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",fn); return()=>document.removeEventListener("mousedown",fn); },[]);

  const resolved=useMemo(()=>{ const up=q.trim().toUpperCase(); if(/^[A-Z]{2}[A-Z0-9]{10}$/.test(up)&&ISIN_MAP[up])return ISIN_MAP[up]; return up; },[q]);
  const results=useMemo(()=>{ if(resolved.length<1)return []; return Object.entries(DB).filter(([t,e])=>t.includes(resolved)||e.name.toUpperCase().includes(resolved)||(e.isin&&e.isin.toUpperCase().includes(resolved))||e.p.toUpperCase().includes(resolved)).slice(0,5); },[resolved]);

  const doAdd=()=>{
    const t=resolved,a=parseFloat(amt);
    if(!t){setErr("Ticker ou ISIN requis");return;}
    if(!DB[t]){setErr(`"${t}" introuvable`);return;}
    if(isNaN(a)||a<=0){setErr("Montant invalide");return;}
    onAdd(t,a); setQ(""); setAmt(""); setErr(""); setOpen(false);
  };
  const onKey=e=>{
    if(!open||!results.length){if(e.key==="Enter")doAdd();return;}
    if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>Math.min(h+1,results.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setHi(h=>Math.max(h-1,0));}
    else if(e.key==="Enter"){e.preventDefault();setQ(results[hi][0]);setOpen(false);setTimeout(()=>amtRef.current?.focus(),60);}
    else if(e.key==="Escape")setOpen(false);
  };
  const inp={width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"14px 16px",color:"#e2e8f0",fontSize:15,fontFamily:"ui-monospace,'SF Mono',monospace",letterSpacing:0.5,outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color 0.2s"};

  return (
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{position:"relative"}}>
        <input value={q} onChange={e=>{setQ(e.target.value);setErr("");setHi(0);setOpen(true);}}
          onFocus={e=>{setOpen(true);e.target.style.borderColor="rgba(99,102,241,0.6)";}}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}
          onKeyDown={onKey} placeholder="Ticker ou ISIN…" style={inp}/>
        {open&&results.length>0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,
            background:"rgba(16,16,24,0.96)",border:"1px solid rgba(99,102,241,0.2)",
            borderRadius:16,overflow:"hidden",backdropFilter:"blur(24px)",boxShadow:"0 24px 60px rgba(0,0,0,0.8)"}}>
            {results.map(([t,e],i)=>(
              <div key={t} onMouseDown={()=>{setQ(t);setOpen(false);setTimeout(()=>amtRef.current?.focus(),60);}}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",
                  background:i===hi?"rgba(99,102,241,0.1)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:12,fontFamily:"ui-monospace,monospace",color:"#a5b4fc",fontWeight:700,minWidth:44,letterSpacing:0.8}}>{t}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                  <div style={{display:"flex",gap:8,marginTop:2}}>
                    <span style={{fontSize:10,color:"#7c8fa8",fontFamily:"monospace"}}>{e.isin}</span>
                    <span style={{fontSize:10,color:"#7c8fa8"}}>· {e.p}</span>
                    <span style={{fontSize:10,color:ASSET_COLORS[e.assetClass]||"#7c8fa8",fontWeight:600}}>· {ASSET_LABELS[e.assetClass]||e.assetClass}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {open&&q.length>=2&&results.length===0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,
            background:"rgba(16,16,24,0.96)",border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:16,padding:"18px",textAlign:"center",backdropFilter:"blur(24px)"}}>
            <div style={{fontSize:13,color:"#94a3b8"}}>Aucun résultat pour « {q} »</div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10}}>
        <input ref={amtRef} type="number" value={amt} onChange={e=>setAmt(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doAdd()}
          onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}
          placeholder="Montant (€)" style={{...inp,flex:1}}/>
        <button onClick={doAdd} style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)",border:"none",
          borderRadius:12,padding:"14px 22px",color:"#fff",fontSize:18,fontWeight:700,cursor:"pointer",
          flexShrink:0,boxShadow:"0 4px 20px rgba(99,102,241,0.4)",transition:"transform 0.15s,box-shadow 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 6px 24px rgba(99,102,241,0.55)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(99,102,241,0.4)";}}>+</button>
      </div>
      {err&&<div style={{fontSize:13,color:"#fca5a5",padding:"10px 14px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10}}>{err}</div>}
      {suggestions.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,paddingTop:2}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Suggestions</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {suggestions.map(s=>(
              <button key={s.key} onClick={()=>setActiveSuggestion(s.key)}
                style={{background:`${s.color}12`,border:`1px solid ${s.color}30`,borderRadius:20,
                  padding:"7px 14px",color:s.color,fontSize:12,cursor:"pointer",fontWeight:600,
                  WebkitTapHighlightColor:"transparent",display:"flex",alignItems:"center",gap:6,
                  transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${s.color}22`}
                onMouseLeave={e=>e.currentTarget.style.background=`${s.color}12`}>
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {activeSuggestion&&(
        <SuggestionModal
          catalog={SUGGESTION_CATALOG[activeSuggestion]}
          onSelect={ticker=>{setQ(ticker);setActiveSuggestion(null);setOpen(false);setTimeout(()=>amtRef.current?.focus(),60);}}
          onClose={()=>setActiveSuggestion(null)}
        />
      )}
    </div>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────────────── */
function Tabs({ active, onChange, highlight=[] }) {
  const icons={
    scores:(<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.7"/></svg>),
    geo:(<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="8" cy="8" rx="2.8" ry="6" stroke="currentColor" strokeWidth="1.4"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.4"/></svg>),
    sec:(<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx="0.8" fill="currentColor" opacity="0.5"/><rect x="6.5" y="5" width="3" height="9" rx="0.8" fill="currentColor" opacity="0.7"/><rect x="11" y="2" width="3" height="12" rx="0.8" fill="currentColor"/></svg>),
    ptf:(<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 11.5 C4 11.5 4.5 7 6.5 7 C8.5 7 8.5 9.5 10.5 9.5 C12 9.5 12.5 6 14 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  };
  return (
    <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:14,padding:3,gap:2,border:"1px solid rgba(255,255,255,0.08)"}}>
      {[{id:"scores",label:"Scores"},{id:"geo",label:"Géo."},{id:"sec",label:"Secteurs"},{id:"ptf",label:"ETF"}].map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,
          background:active===t.id?"rgba(99,102,241,0.15)":"transparent",
          border:active===t.id?"1px solid rgba(99,102,241,0.3)":"1px solid transparent",
          borderRadius:11,padding:"9px 4px",color:active===t.id?"#c7d2fe":"#94a3b8",
          fontSize:11,fontWeight:active===t.id?700:500,cursor:"pointer",transition:"all 0.2s",
          WebkitTapHighlightColor:"transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          {icons[t.id]}
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:4}}>
            <span style={{letterSpacing:0.3}}>{t.label}</span>
            {highlight.includes(t.id)&&(
              <div style={{width:5,height:5,borderRadius:"50%",background:"#818cf8",
                boxShadow:"0 0 6px #818cf899",flexShrink:0,animation:"pulse 2s infinite"}}/>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── STAT CHIP ──────────────────────────────────────────────────────────────── */
function StatChip({ value, label, color }) {
  return (
    <GlassCard style={{flex:1}}>
      <div style={{padding:"14px 12px",textAlign:"center"}}>
        <div style={{fontSize:26,fontWeight:700,color,lineHeight:1,letterSpacing:-1}}>{value}</div>
        <div style={{fontSize:10,color:"#94a3b8",marginTop:5,letterSpacing:0.5,fontWeight:500}}>{label}</div>
      </div>
    </GlassCard>
  );
}

/* ─── DISCLAIMER MODAL ───────────────────────────────────────────────────────── */
function Disclaimer({ onAccept }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"20px 16px"}}>
      <div style={{background:"rgba(14,14,22,0.98)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:400,
        boxShadow:"0 24px 60px rgba(0,0,0,0.8)"}}>
        <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#818cf8)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18}}>⚖️</div>
        <div style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:12}}>À titre informatif uniquement</div>
        <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,margin:"0 0 20px"}}>
          ETF Score est un outil d'analyse personnel. Les scores, indicateurs et suggestions affichés
          <strong style={{color:"#e2e8f0"}}> ne constituent pas un conseil en investissement</strong> au sens
          de la réglementation AMF.
        </p>
        <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,margin:"0 0 24px"}}>
          Tout investissement comporte un risque de perte en capital. Consultez un conseiller financier
          agréé avant toute décision d'investissement.
        </p>
        <button onClick={onAccept} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#4f46e5)",
          border:"none",borderRadius:14,padding:"15px",color:"#fff",fontSize:14,fontWeight:700,
          cursor:"pointer",boxShadow:"0 4px 20px rgba(99,102,241,0.4)"}}>
          J'ai compris, accéder à l'app
        </button>
      </div>
    </div>
  );
}

/* ─── TOASTER ────────────────────────────────────────────────────────────────── */
function Toaster({ message, visible }) {
  return (
    <div style={{
      position:"fixed", bottom:72, left:"50%", transform:`translateX(-50%) translateY(${visible?0:16}px)`,
      opacity: visible ? 1 : 0,
      transition:"all 0.3s cubic-bezier(.16,1,.3,1)",
      background:"rgba(30,30,42,0.97)", border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:20, padding:"11px 18px", zIndex:9000,
      display:"flex", alignItems:"center", gap:8,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      pointerEvents:"none", whiteSpace:"nowrap",
    }}>
      <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 8px #4ade8099",flexShrink:0}}/>
      <span style={{fontSize:13,color:"#e2e8f0",fontWeight:500}}>{message}</span>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const [holdings, setHoldings] = useState([]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState("scores");
  const [confirmReset, setConfirmReset] = useState(false);
  const [editAmt, setEditAmt] = useState({});
  const [disclaimerSeen, setDisclaimerSeen] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [toast, setToast] = useState({msg:"",visible:false});
  const toastTimer = useRef(null);
  const [installToast, setInstallToast] = useState(false);

  useEffect(()=>{
    try{
        const raw=localStorage.getItem(STORAGE_KEY);
        if(raw){ const p=JSON.parse(raw); if(p.holdings) setHoldings(p.holdings); if(p.disclaimerSeen) setDisclaimerSeen(true); if(p.savedAt) setSavedAt(new Date(p.savedAt)); }

    }catch(_){}
    setReady(true);
  },[]);

  useEffect(()=>{
    if(!ready) return;
    setSaved(false);
    const t=setTimeout(async()=>{
      try{ localStorage.setItem(STORAGE_KEY,JSON.stringify({holdings,disclaimerSeen,savedAt:new Date().toISOString()})); }catch(_){}
      setSaved(true);
    },700);
    return()=>clearTimeout(t);
  },[holdings,disclaimerSeen,ready]);

  const acceptDisclaimer=useCallback(()=>setDisclaimerSeen(true),[]);
  const addHolding=useCallback((ticker,amount)=>{
    setHoldings(prev=>{ const ex=prev.find(h=>h.ticker===ticker); if(ex)return prev.map(h=>h.ticker===ticker?{...h,amount:h.amount+amount}:h); return [...prev,{ticker,name:DB[ticker].name,amount}]; });

  },[]);
  const removeHolding=useCallback((ticker)=>setHoldings(p=>p.filter(h=>h.ticker!==ticker)),[]);
  const updateAmount=(ticker,val)=>{ const a=parseFloat(val); if(!isNaN(a)&&a>0)setHoldings(p=>p.map(h=>h.ticker===ticker?{...h,amount:a}:h)); };

  const scores=useMemo(()=>computeExpertScore(holdings),[holdings]);
  const recs=useMemo(()=>buildRecommendations(scores,holdings,holdings.reduce((s,h)=>s+h.amount,0)),[scores,holdings]);
  const total=holdings.reduce((s,h)=>s+h.amount,0);

  if(!ready) return (<div style={{minHeight:"100vh",background:"#0e0e0f",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:36,height:36,borderRadius:"50%",border:"2.5px solid rgba(99,102,241,0.2)",borderTopColor:"#6366f1",animation:"spin 0.8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}`}</style></div>);

  return (
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:"#0e0e0f",color:"#e2e8f0",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",
      maxWidth:430,margin:"0 auto",position:"relative"}}>

      <style>{`
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input{outline:none;-webkit-appearance:none}
        input::placeholder{color:#4a5568}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        button{font-family:inherit;-webkit-tap-highlight-color:transparent}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        ::-webkit-scrollbar{display:none}
        .anim{animation:fadeUp 0.4s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      {!disclaimerSeen && <Disclaimer onAccept={acceptDisclaimer}/>}

      {/* Ambient blobs */}
      <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",left:"-15%",width:"65%",height:"58%",background:"radial-gradient(ellipse,rgba(99,102,241,0.11) 0%,transparent 68%)",filter:"blur(1px)"}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-12%",width:"60%",height:"55%",background:"radial-gradient(ellipse,rgba(139,92,246,0.09) 0%,transparent 65%)",filter:"blur(1px)"}}/>
        <div style={{position:"absolute",top:"35%",left:"50%",width:"50%",height:"45%",background:"radial-gradient(ellipse,rgba(56,189,248,0.05) 0%,transparent 60%)",filter:"blur(1px)"}}/>
        <div style={{position:"absolute",top:"60%",left:"-8%",width:"42%",height:"38%",background:"radial-gradient(ellipse,rgba(79,70,229,0.07) 0%,transparent 65%)",filter:"blur(1px)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* Header */}
        <header style={{
          padding:"12px 20px 14px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
          background:"rgba(14,14,15,0.92)",
          position:"sticky",top:0,zIndex:50,
          marginTop:0,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,flexShrink:0}}>
              <svg viewBox="0 0 512 512" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lline" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="50%" stopColor="#818cf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient>
                  <linearGradient id="lfill" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.18"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient>
                  <filter id="lglow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <filter id="lblob"><feGaussianBlur stdDeviation="50"/></filter>
                  <clipPath id="lshape"><rect width="512" height="512" rx="115" ry="115"/></clipPath>
                </defs>
                <g clipPath="url(#lshape)">
                  <rect width="512" height="512" fill="#08080c"/>
                  <ellipse cx="300" cy="260" rx="200" ry="150" fill="#6366f1" opacity="0.12" filter="url(#lblob)"/>
                  <ellipse cx="150" cy="350" rx="120" ry="100" fill="#38bdf8" opacity="0.07" filter="url(#lblob)"/>
                  <path d="M 72 360 C 110 360 120 310 155 295 C 190 280 200 320 235 300 C 265 282 275 230 310 200 C 340 175 355 210 385 185 C 408 165 420 145 440 128 L 440 400 L 72 400 Z" fill="url(#lfill)"/>
                  <path d="M 72 360 C 110 360 120 310 155 295 C 190 280 200 320 235 300 C 265 282 275 230 310 200 C 340 175 355 210 385 185 C 408 165 420 145 440 128" fill="none" stroke="url(#lline)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#lglow)"/>
                  <circle cx="440" cy="128" r="14" fill="#c084fc" filter="url(#lglow)"/>
                  <circle cx="440" cy="128" r="7" fill="white" opacity="0.9"/>
                </g>
              </svg>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",letterSpacing:-0.3}}>ETF Score <span style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:1,background:"rgba(99,102,241,0.12)",padding:"2px 6px",borderRadius:4,border:"1px solid rgba(99,102,241,0.2)"}}>EXPERT</span></div>
              <div style={{fontSize:11,color:"#7c8fa8",marginTop:1}}>Analyse multicritères</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",background:"rgba(255,255,255,0.05)",borderRadius:20,border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:saved?"#4ade80":"#facc15",boxShadow:saved?"0 0 6px #4ade8099":"0 0 6px #facc1599",transition:"all 0.4s"}}/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
              <span style={{fontSize:10,color:"#7c8fa8",letterSpacing:0.5,fontWeight:500,lineHeight:1}}>{saved?"Sync":"..."}</span>
              {savedAt&&<span style={{fontSize:9,color:"rgba(255,255,255,0.2)",lineHeight:1,marginTop:1}}>{savedAt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>}
            </div>
          </div>
        </header>

        {/* Total banner */}
        {holdings.length>0&&(
          <div style={{margin:"14px 16px 0"}}>
            <GlassCard>
              <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:"#7c8fa8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4,fontWeight:600}}>Total portefeuille</div>
                  <div style={{fontSize:24,fontWeight:700,letterSpacing:-0.5,color:"#a5b4fc"}}>{total.toLocaleString("fr-FR")} €</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"#7c8fa8",letterSpacing:1,marginBottom:4,fontWeight:600}}>SCORE GLOBAL</div>
                  <div style={{fontSize:24,fontWeight:700,color:scoreStyle(scores.total).text}}>{scores.total.toFixed(1)}<span style={{fontSize:13,color:"#7c8fa8",fontWeight:400}}>/20</span></div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tabs */}
        <div style={{padding:"14px 16px 0"}}><Tabs active={tab} onChange={setTab} highlight={holdings.length===0?["ptf"]:[]}/></div>

        {/* Content */}
        <div style={{padding:"14px 16px calc(100px + env(safe-area-inset-bottom))"}}>

          {/* ── SCORES TAB ── */}
          {tab==="scores"&&(
            <div className="anim" style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Main arcs */}
              <GlassCard>
                <div style={{padding:"28px 16px 24px",display:"flex",justifyContent:"space-around",alignItems:"flex-start"}}>
                  <ScoreArc value={scores.geo} label="Géographique"/>
                  <div style={{width:1,background:"rgba(255,255,255,0.08)",alignSelf:"stretch",margin:"10px 0"}}/>
                  <ScoreArc value={scores.sector} label="Sectorielle"/>
                </div>
              </GlassCard>

              {/* Detailed sub-scores */}
              {holdings.length>0&&(
                <GlassCard>
                  <div style={{padding:"18px 18px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Détail des critères</div>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      <MiniScoreBar label="Géographie" value={scores.geo} weight="25%"/>
                      <MiniScoreBar label="Secteurs" value={scores.sector} weight="25%"/>
                      <MiniScoreBar label="Chevauchement" value={scores.overlap} weight="20%"/>
                      <MiniScoreBar label="Classes d'actifs" value={scores.assetClass} weight="15%"/>
                      <MiniScoreBar label="Devises" value={scores.currency} weight="15%"/>
                    </div>
                    {/* Asset class breakdown */}
                    {Object.keys(scores.classes).length>0&&(
                      <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Classes d'actifs</div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {Object.entries(scores.classes).sort((a,b)=>b[1]-a[1]).map(([cls,pct])=>(
                            <div key={cls} style={{background:`${ASSET_COLORS[cls]||"#818cf8"}15`,border:`1px solid ${ASSET_COLORS[cls]||"#818cf8"}30`,borderRadius:20,padding:"5px 12px",display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:ASSET_COLORS[cls]||"#818cf8",boxShadow:`0 0 6px ${ASSET_COLORS[cls]||"#818cf8"}99`}}/>
                              <span style={{fontSize:12,color:"#e2e8f0",fontWeight:500}}>{ASSET_LABELS[cls]||cls}</span>
                              <span style={{fontSize:12,color:ASSET_COLORS[cls]||"#818cf8",fontWeight:700}}>{pct.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Stat chips */}
              {holdings.length>0&&(
                <div style={{display:"flex",gap:10}}>
                  <StatChip value={Object.keys(scores.geoMap).length} label="Zones géo." color="#818cf8"/>
                  <StatChip value={Object.keys(scores.secMap).length} label="Secteurs" color="#38bdf8"/>
                  <StatChip value={holdings.length} label="ETF" color="#a78bfa"/>
                </div>
              )}

              {/* Recommendations */}
              {recs.length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",padding:"0 2px"}}>Recommandations</div>
                  {recs.map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`1px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{r.emoji}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:r.color,marginBottom:4}}>{r.title}</div>
                          <p style={{margin:0,fontSize:13,color:"#e2e8f0",lineHeight:1.65}}>{r.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!holdings.length&&(
                <GlassCard>
                  <div style={{padding:"48px 24px",textAlign:"center"}}>
                    <div style={{fontSize:44,marginBottom:16}}>📊</div>
                    <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:8}}>Aucun ETF renseigné</div>
                    <div style={{fontSize:13,color:"#7c8fa8",lineHeight:1.65}}>Allez dans l'onglet <strong style={{color:"#a5b4fc"}}>ETF</strong> pour ajouter vos positions.</div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {tab==="geo"&&(<div className="anim">{Object.keys(scores.geoMap).length>0?<ColorBars data={scores.geoMap} title="Répartition géographique" infoMap={GEO_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"#7c8fa8",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}
          {tab==="sec"&&(<div className="anim">{Object.keys(scores.secMap).length>0?<ColorBars data={scores.secMap} title="Répartition sectorielle" infoMap={SECTOR_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"#7c8fa8",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}

          {/* ETF TAB */}
          {tab==="ptf"&&(
            <div className="anim" style={{display:"flex",flexDirection:"column",gap:14}}>
              <GlassCard>
                <div style={{padding:"18px 16px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Ajouter un ETF</div>
                  <Search onAdd={addHolding} suggestions={buildSuggestions(scores, holdings)}/>
                </div>
              </GlassCard>

              {holdings.length>0&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"0 4px"}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase"}}>Positions</span>
                    <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"none",color:"#f87171",fontSize:12,cursor:"pointer",fontWeight:500}}>Tout effacer</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {holdings.map((h,i)=>{
                      const pct=total>0?(h.amount/total*100):0;
                      const etf=DB[h.ticker];
                      const dotColor=BAR[i%BAR.length];
                      const isEditing=editAmt[h.ticker]!==undefined;
                      return(
                        <GlassCard key={h.ticker}>
                          <div style={{padding:"13px 14px",display:"flex",alignItems:"center",gap:11,
                            animation:`fadeUp 0.35s ${i*0.04}s cubic-bezier(.16,1,.3,1) both`}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:dotColor,flexShrink:0,boxShadow:`0 0 10px ${dotColor}99`}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:2}}>
                                <span style={{fontSize:13,fontWeight:700,fontFamily:"ui-monospace,monospace",color:"#a5b4fc",letterSpacing:0.5}}>{h.ticker}</span>
                                <span style={{fontSize:10,color:"#7c8fa8",fontWeight:500}}>{pct.toFixed(1)}%</span>
                                {etf&&<span style={{fontSize:10,color:ASSET_COLORS[etf.assetClass]||"#7c8fa8",fontWeight:600,background:`${ASSET_COLORS[etf.assetClass]||"#818cf8"}15`,padding:"1px 6px",borderRadius:4}}>{ASSET_LABELS[etf.assetClass]||etf.assetClass}</span>}
                              </div>
                              <div style={{fontSize:11,color:"#7c8fa8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.name}</div>
                            </div>
                            <input type="number" value={isEditing?editAmt[h.ticker]:h.amount}
                              onFocus={()=>setEditAmt(p=>({...p,[h.ticker]:String(h.amount)}))}
                              onChange={e=>setEditAmt(p=>({...p,[h.ticker]:e.target.value}))}
                              onBlur={()=>{ updateAmount(h.ticker,editAmt[h.ticker]); setEditAmt(p=>{const n={...p};delete n[h.ticker];return n;}); }}
                              style={{width:76,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"5px 8px",color:"#e2e8f0",fontSize:12,textAlign:"right",fontFamily:"monospace"}}/>
                            <span style={{fontSize:11,color:"#7c8fa8",flexShrink:0}}>€</span>
                            <button onClick={()=>removeHolding(h.ticker)} style={{background:"none",border:"none",color:"#4a5568",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px",flexShrink:0,transition:"color 0.15s"}}
                              onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                              onMouseLeave={e=>e.currentTarget.style.color="#4a5568"}>×</button>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Toaster message={toast.msg} visible={toast.visible}/>

      {/* Install prompt toast */}
      <div style={{
        position:"fixed", bottom:72, left:"50%",
        transform:`translateX(-50%) translateY(${installToast?0:16}px)`,
        opacity: installToast ? 1 : 0,
        transition:"all 0.4s cubic-bezier(.16,1,.3,1)",
        background:"rgba(30,30,42,0.97)", border:"1px solid rgba(129,140,248,0.25)",
        borderRadius:20, padding:"12px 18px", zIndex:9000,
        display:"flex", alignItems:"center", gap:10,
        boxShadow:"0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
        pointerEvents:"none", maxWidth:320, width:"calc(100% - 40px)",
      }}>
        <span style={{fontSize:20,flexShrink:0}}>📲</span>
        <div>
          <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600,marginBottom:2}}>Installer l'app</div>
          <div style={{fontSize:11,color:"#7c8fa8",lineHeight:1.5}}>Partager → Sur l'écran d'accueil pour une expérience optimale</div>
        </div>
      </div>

      {/* Disclaimer banner */}
      {disclaimerSeen&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,
          background:"rgba(14,14,15,0.95)",borderTop:"1px solid rgba(255,255,255,0.06)",
          padding:"8px 20px calc(8px + env(safe-area-inset-bottom))",textAlign:"center",zIndex:40,backdropFilter:"blur(10px)"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:0.3}}>
            À titre informatif uniquement — pas un conseil en investissement · <button onClick={()=>setDisclaimerSeen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",fontSize:10,cursor:"pointer",padding:0,textDecoration:"underline"}}>Revoir</button>
          </span>
        </div>
      )}

      {/* Reset confirm */}
      {confirmReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)",
          display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:999,padding:"0 16px 40px"}}>
          <div style={{background:"rgba(18,14,18,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,
            padding:"28px 24px",width:"100%",maxWidth:398,textAlign:"center",backdropFilter:"blur(20px)"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:8}}>Effacer le portefeuille ?</div>
            <div style={{fontSize:13,color:"#94a3b8",marginBottom:24,lineHeight:1.65}}>Toutes vos positions seront supprimées. Cette action est irréversible.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{setHoldings([]);setConfirmReset(false);}} style={{background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:14,padding:"15px",color:"#fca5a5",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%"}}>Effacer tout</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"15px",color:"#e2e8f0",fontSize:15,cursor:"pointer",width:"100%"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
