import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ─── DATA (identical to v1) ────────────────────────────────────────────────── */
const ISIN_MAP = {
  "IE00B4L5Y983":"IWDA","IE00B4L5YC18":"SWDA","FR0010315770":"MWRD",
  "IE00B6R52259":"ACWI","LU1681045370":"un ETF marchés émergents","IE00BKM4GZ66":"un ETF marchés émergents IMI",
  "US78462F1030":"SPY","US9229083632":"VOO","LU1681048804":"500",
  "US46090E1038":"QQQ","LU1681038243":"PANX","FR0011550185":"ESE",
  "LU1737652823":"EWLD","IE00B0M63177":"EEM","IE00BF4RFH31":"IUSN",
  "LU1681038672":"EPRA","IE00B945VV12":"un ETF Europe","IE00B579F325":"un ETF or physique",
  "IE00BDBRDM35":"AGGH","IE00B1XNHC34":"INRG","IE00B3F81R35":"IEAG",
  "IE00B5BMR087":"CSP1","LU1681041575":"un ETF Europe Amundi","LU1681042773":"BCHN",
  "IE00B8GF1M35":"CBRE","LU1681043599":"MWRD","LU1681043086":"PAASI","FR0011440478":"PAEMF","FR0013412038":"PCEU","FR0013411980":"PTPXE",
};
const DB = {
  "IWDA":{ name:"iShares Core ETF Monde", isin:"IE00B4L5Y983", p:"iShares", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"SWDA":99,"MWRD":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68,"QQQ":42,"PANX":42}},
  "SWDA":{ name:"iShares ETF Monde Acc", isin:"IE00B4L5Y983", p:"iShares", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68}},
  "MWRD":{ name:"Amundi ETF Monde", isin:"LU1681043599", p:"Amundi", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":98,"SWDA":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68}},
  "EWLD":{ name:"Amundi MSCI All World", isin:"LU1792117779", p:"Amundi", assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3}, geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4}, sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"ACWI":97,"IWDA":85,"SWDA":85}},
  "ACWI":{ name:"iShares MSCI ACWI", isin:"IE00B6R52259", p:"iShares", assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3}, geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4}, sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"EWLD":97,"IWDA":85}},
  "un ETF marchés émergents":{ name:"Amundi MSCI Emerging Markets", isin:"LU1681045370", p:"Amundi", assetClass:"equity", currencies:{CNY:32,TWD:16,INR:15,KRW:12,BRL:6,Autres:19}, geo:{"Chine":32,"Taiwan":16,"Inde":15,"Corée du Sud":12,"Brésil":6,"Autres EM":19}, sec:{"Technologie":28,"Finance":22,"Conso. discr.":12,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":4}, overlaps:{"un ETF marchés émergents IMI":95,"EEM":92}},
  "un ETF marchés émergents IMI":{ name:"iShares Core MSCI EM IMI", isin:"IE00BKM4GZ66", p:"iShares", assetClass:"equity", currencies:{CNY:28,TWD:18,INR:16,KRW:12,BRL:5,Autres:21}, geo:{"Chine":28,"Taiwan":18,"Inde":16,"Corée du Sud":12,"Brésil":5,"Autres EM":21}, sec:{"Technologie":29,"Finance":21,"Conso. discr.":11,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":5}, overlaps:{"un ETF marchés émergents":95,"EEM":92}},
  "SPY":{ name:"SPDR S&P 500", isin:"US78462F1030", p:"SPDR", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"VOO":99,"CSP1":99,"500":99,"ESE":99,"IWDA":68,"QQQ":55}},
  "VOO":{ name:"Vanguard S&P 500", isin:"US9229083632", p:"Vanguard", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"CSP1":99,"500":99,"ESE":99,"IWDA":68}},
  "CSP1":{ name:"iShares Core S&P 500", isin:"IE00B5BMR087", p:"iShares", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"500":99,"ESE":99}},
  "500":{ name:"Amundi S&P 500", isin:"LU1681048804", p:"Amundi", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"CSP1":99,"ESE":99}},
  "ESE":{ name:"BNP Paribas Easy S&P 500", isin:"FR0011550185", p:"BNP Paribas", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"CSP1":99,"500":99}},
  "QQQ":{ name:"Invesco NASDAQ-100", isin:"US46090E1038", p:"Invesco", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"PANX":99,"SPY":55,"IWDA":42}},
  "PANX":{ name:"Amundi NASDAQ-100", isin:"LU1681038243", p:"Amundi", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"QQQ":99,"SPY":55}},
  "IUSN":{ name:"iShares ETF Monde Small Cap", isin:"IE00BF4RFH31", p:"iShares", assetClass:"equity", currencies:{USD:58,EUR:18,JPY:10,GBP:7,Autres:7}, geo:{"Amér. du Nord":58,"Europe":18,"Japon":10,"Asie-Pac.":7,"Autres":7}, sec:{"Industrie":20,"Finance":16,"Technologie":15,"Santé":12,"Conso. discr.":11,"Matériaux":8,"Conso. cour.":6,"Immobilier":5,"Énergie":4,"Télécom":2,"Services pub.":1}, overlaps:{"IWDA":8}},
  "un ETF Europe":{ name:"Vanguard FTSE Developed Europe", isin:"IE00B945VV12", p:"Vanguard", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"un ETF Europe Amundi":96}},
  "un ETF Europe Amundi":{ name:"Amundi MSCI Europe", isin:"LU1681041575", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"un ETF Europe":96}},
  "PAASI":{ name:"Amundi MSCI Asia Pacific Ex-Japan", isin:"LU1681043086", p:"Amundi", assetClass:"equity", currencies:{CNY:38,TWD:20,INR:17,KRW:14,Autres:11}, geo:{"Chine":38,"Taiwan":20,"Inde":17,"Corée du Sud":14,"Autres Asie":11}, sec:{"Technologie":32,"Finance":20,"Conso. discr.":12,"Télécom":9,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":3}, overlaps:{"un ETF marchés émergents":45}},
  "EPRA":{ name:"Amundi FTSE EPRA Nareit", isin:"LU1681038672", p:"Amundi", assetClass:"real_estate", currencies:{USD:55,JPY:10,AUD:8,GBP:7,Autres:20}, geo:{"Amér. du Nord":55,"Japon":10,"Australie":8,"Royaume-Uni":7,"Autres":20}, sec:{"Immobilier":100}, overlaps:{"CBRE":75}},
  "CBRE":{ name:"iShares Global REIT", isin:"IE00B8GF1M35", p:"iShares", assetClass:"real_estate", currencies:{USD:65,JPY:10,AUD:8,SGD:5,Autres:12}, geo:{"Amér. du Nord":65,"Japon":10,"Australie":8,"Singapour":5,"Autres":12}, sec:{"Immobilier":100}, overlaps:{"EPRA":75}},
  "un ETF or physique":{ name:"Invesco Physical Gold", isin:"IE00B579F325", p:"Invesco", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{}},
  "un ETF or physique SPDR":{ name:"SPDR Gold Shares", isin:"US78463V1070", p:"SPDR", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{"un ETF or physique":99}},
  "INRG":{ name:"iShares Global Clean Energy", isin:"IE00B1XNHC34", p:"iShares", assetClass:"equity", currencies:{USD:45,EUR:30,Autres:25}, geo:{"Amér. du Nord":45,"Europe":30,"Asie-Pac.":15,"Autres":10}, sec:{"Énergie renou.":70,"Services pub.":20,"Industrie":10}, overlaps:{}},
  "BCHN":{ name:"Amundi MSCI China", isin:"LU1681042773", p:"Amundi", assetClass:"equity", currencies:{CNY:100}, geo:{"Chine":100}, sec:{"Conso. discr.":28,"Finance":20,"Télécom":15,"Industrie":12,"Technologie":10,"Santé":6,"Énergie":5,"Matériaux":4}, overlaps:{"un ETF marchés émergents":32}},
  "AGGH":{ name:"iShares Global Aggregate Bond", isin:"IE00BDBRDM35", p:"iShares", assetClass:"bond", currencies:{USD:40,EUR:30,JPY:15,Autres:15}, geo:{"Amér. du Nord":40,"Europe":30,"Japon":15,"Autres":15}, sec:{"Oblig. souv.":60,"Oblig. corp.":30,"Autres":10}, overlaps:{"IEAG":35}},
  "IEAG":{ name:"iShares Euro Aggregate Bond", isin:"IE00B3F81R35", p:"iShares", assetClass:"bond", currencies:{EUR:90,Autres:10}, geo:{"Europe":90,"Autres":10}, sec:{"Oblig. souv.":70,"Oblig. corp.":25,"Autres":5}, overlaps:{"AGGH":35}},
  "SGLD":{ name:"Invesco Physical Gold", isin:"IE00B579F325", p:"Invesco", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{}},
  "EPRA":{ name:"Amundi FTSE EPRA Nareit", isin:"LU1681038672", p:"Amundi", assetClass:"real_estate", currencies:{USD:55,JPY:10,AUD:8,GBP:7,Autres:20}, geo:{"Amér. du Nord":55,"Japon":10,"Australie":8,"Royaume-Uni":7,"Autres":20}, sec:{"Immobilier":100}, overlaps:{"CBRE":75}},
  "CBRE":{ name:"iShares Global REIT", isin:"IE00B8GF1M35", p:"iShares", assetClass:"real_estate", currencies:{USD:65,JPY:10,AUD:8,SGD:5,Autres:12}, geo:{"Amér. du Nord":65,"Japon":10,"Australie":8,"Singapour":5,"Autres":12}, sec:{"Immobilier":100}, overlaps:{"EPRA":75}},
  "MEUD":{ name:"Amundi MSCI Europe", isin:"LU1681041575", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"VEUR":96}},
  "VEUR":{ name:"Vanguard FTSE Developed Europe", isin:"IE00B945VV12", p:"Vanguard", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"MEUD":96}},
  "PAEEM":{ name:"Amundi MSCI Emerging Markets", isin:"LU1681045370", p:"Amundi", assetClass:"equity", currencies:{CNY:32,TWD:16,INR:15,KRW:12,BRL:6,Autres:19}, geo:{"Chine":32,"Taiwan":16,"Inde":15,"Corée du Sud":12,"Brésil":6,"Autres EM":19}, sec:{"Technologie":28,"Finance":22,"Conso. discr.":12,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":4}, overlaps:{"EIMI":95}},
  "EIMI":{ name:"iShares Core MSCI EM IMI", isin:"IE00BKM4GZ66", p:"iShares", assetClass:"equity", currencies:{CNY:28,TWD:18,INR:16,KRW:12,BRL:5,Autres:21}, geo:{"Chine":28,"Taiwan":18,"Inde":16,"Corée du Sud":12,"Brésil":5,"Autres EM":21}, sec:{"Technologie":29,"Finance":21,"Conso. discr.":11,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":5}, overlaps:{"PAEEM":95}},
  "PTPXE":{ name:"Amundi PEA Japan TOPIX UCITS ETF", isin:"FR0013411980", p:"Amundi", assetClass:"equity", currencies:{JPY:100}, geo:{"Japon":100}, sec:{"Industrie":22,"Finance":14,"Conso. discr.":13,"Technologie":11,"Matériaux":9,"Santé":8,"Conso. cour.":7,"Énergie":4,"Télécom":4,"Immobilier":4,"Services pub.":4}, overlaps:{}},
  "PCEU":{ name:"Amundi PEA MSCI Europe UCITS ETF", isin:"FR0013412038", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"MEUD":96,"VEUR":95}},
  "PAEMF":{ name:"Amundi PEA Marchés Émergents EMEA", isin:"FR0011440478", p:"Amundi", assetClass:"equity", currencies:{ZAR:15,AED:12,EGP:10,QAR:8,KWD:7,NGN:6,Autres:42}, geo:{"Afrique du Sud":15,"Émirats Arabes":12,"Égypte":10,"Qatar":8,"Koweït":7,"Nigeria":6,"Autres EMEA":42}, sec:{"Finance":28,"Matériaux":18,"Énergie":14,"Télécom":12,"Conso. discr.":10,"Industrie":8,"Autres":10}, overlaps:{}},
  "IUSN":{ name:"iShares MSCI World Small Cap", isin:"IE00BF4RFH31", p:"iShares", assetClass:"equity", currencies:{USD:58,EUR:18,JPY:10,GBP:7,Autres:7}, geo:{"Amér. du Nord":58,"Europe":18,"Japon":10,"Asie-Pac.":7,"Autres":7}, sec:{"Industrie":20,"Finance":16,"Technologie":15,"Santé":12,"Conso. discr.":11,"Matériaux":8,"Conso. cour.":6,"Immobilier":5,"Énergie":4,"Télécom":2,"Services pub.":1}, overlaps:{"IWDA":8}},
};
const STORAGE_KEY = "etf-portfolio-v2";

/* ─── SCORING ENGINE (identical) ────────────────────────────────────────────── */
function hhi(obj){const t=Object.values(obj).reduce((a,b)=>a+b,0);if(!t)return 1;return Object.values(obj).reduce((s,v)=>s+Math.pow(v/t,2),0);}
function hhiToScore(h,n){const mn=1/n,norm=(h-mn)/(1-mn);return Math.max(0,1-Math.pow(Math.max(0,norm),0.75));}
function geoScore(m){
  if(!Object.keys(m).length) return 0;
  // Base HHI score
  const n=Math.max(Object.values(m).filter(v=>v>2).length,Object.keys(m).length,6);
  const base=hhiToScore(hhi(m),n);
  // Penalty for missing major developed regions
  const usW=(m["Amér. du Nord"]||0)/100;
  const euW=(["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(m[k]||0),0))/100;
  const jpW=(m["Japon"]||0)/100;
  const devW=usW+euW+jpW;
  // If less than 20% in developed markets, apply a significant penalty
  const devPenalty = devW < 0.20 ? (0.20 - devW) * 2.5 : 0;
  // Individual concentration penalties (one region >70%)
  const maxSingle = Math.max(usW, euW, ...Object.values(m).map(v=>v/100)) ;
  const concPenalty = maxSingle > 0.70 ? (maxSingle - 0.70) * 1.5 : 0;
  return Math.max(0, base - devPenalty - concPenalty);
}
function sectorScore(m){
  if(!Object.keys(m).length) return 0;
  const n=Math.max(Object.values(m).filter(v=>v>2).length,Object.keys(m).length,8);
  const base=hhiToScore(hhi(m),n);
  // Penalize if top sector > 40%
  const maxSec=Math.max(...Object.values(m))/100;
  const concPenalty = maxSec > 0.40 ? (maxSec - 0.40) * 1.8 : 0;
  return Math.max(0, base - concPenalty);
}
function overlapScore(holdings,total){if(holdings.length<=1)return 1;let p=0;for(let i=0;i<holdings.length;i++)for(let j=i+1;j<holdings.length;j++){const a=holdings[i],b=holdings[j],eA=DB[a.ticker],eB=DB[b.ticker];if(!eA||!eB)continue;const ov=(eA.overlaps?.[b.ticker]||0)/100;p+=ov*(Math.min(a.amount,b.amount)/total)*2;}return Math.max(0,1-p*1.5);}
function assetClassScore(holdings,total){if(!holdings.length)return 0;const cls={};for(const h of holdings){const e=DB[h.ticker];if(!e)continue;cls[e.assetClass]=(cls[e.assetClass]||0)+h.amount/total;}const ideal={equity:.60,bond:.25,real_estate:.08,commodity:.07};const n=Math.min(Object.keys(cls).length/4,1);let dev=0;for(const[k,v] of Object.entries(ideal))dev+=Math.abs((cls[k]||0)-v)*.5;return Math.max(0,n-Math.min(.4,dev));}
function currencyScore(holdings,total){if(!holdings.length)return 0;const cur={};for(const h of holdings){const e=DB[h.ticker];if(!e)continue;const w=h.amount/total;for(const[k,v] of Object.entries(e.currencies||{}))cur[k]=(cur[k]||0)+(v/100)*w;}const n=Math.max(Object.keys(cur).length,4);return hhiToScore(hhi(cur),n);}
function computeScores(holdings){
  if(!holdings.length)return{total:0,geo:0,sector:0,overlap:0,assetClass:0,currency:0,geoMap:{},secMap:{},classes:{},currencies:{}};
  const total=holdings.reduce((s,h)=>s+h.amount,0);if(!total)return{total:0,geo:0,sector:0,overlap:0,assetClass:0,currency:0,geoMap:{},secMap:{},classes:{},currencies:{}};
  const geoMap={},secMap={},classes={},curs={};
  for(const h of holdings){const e=DB[h.ticker];if(!e)continue;const w=h.amount/total;for(const[k,v] of Object.entries(e.geo))geoMap[k]=(geoMap[k]||0)+(v/100)*w*100;for(const[k,v] of Object.entries(e.sec))secMap[k]=(secMap[k]||0)+(v/100)*w*100;classes[e.assetClass]=(classes[e.assetClass]||0)+w*100;for(const[k,v] of Object.entries(e.currencies||{}))curs[k]=(curs[k]||0)+(v/100)*w*100;}
  const s1=geoScore(geoMap),s2=sectorScore(secMap),s3=overlapScore(holdings,total),s4=assetClassScore(holdings,total),s5=currencyScore(holdings,total);
  const composite=s1*.25+s2*.25+s3*.20+s4*.15+s5*.15;
  return{total:Math.round(composite*200)/10,geo:Math.round(s1*200)/10,sector:Math.round(s2*200)/10,overlap:Math.round(s3*200)/10,assetClass:Math.round(s4*200)/10,currency:Math.round(s5*200)/10,geoMap,secMap,classes,currencies:curs};
}

/* ─── RECOMMENDATIONS ────────────────────────────────────────────────────────── */
function buildPositive(scores, holdings) {
  const positives = [];
  const { geoMap, secMap, classes } = scores;
  const bondPct = classes["bond"]||0;
  const commPct = classes["commodity"]||0;
  const n = holdings.length;
  if(n === 0) return [];
  if(n === 1) positives.push("C'est un excellent départ — un ETF diversifié mondial couvre déjà des centaines d'entreprises à moindre coût.");
  if(n >= 2)  positives.push("Votre portefeuille multi-ETF montre une vraie démarche de diversification. C'est ce que font les investisseurs avisés.");
  if(n >= 3)  positives.push("Avec " + n + " ETF complémentaires, vous avez construit une base solide.");
  if(scores.geo   >= 14) positives.push("Excellente diversification géographique — vous êtes exposé aux grandes zones économiques mondiales.");
  if(scores.sector>= 14) positives.push("Vos secteurs sont bien équilibrés — vous ne dépendez pas d'une seule industrie.");
  if(scores.overlap>=18) positives.push("Aucun chevauchement significatif — chaque ETF apporte une vraie valeur ajoutée.");
  if(bondPct>=15)         positives.push("Bonne allocation obligataire — votre portefeuille résistera mieux aux krachs actions.");
  if(commPct>=5&&commPct<=15) positives.push("Votre exposition à l'or est bien calibrée — une couverture efficace sans excès.");
  if(scores.total >= 16) positives.push("Score global exceptionnel. Votre portefeuille est parmi les mieux diversifiés.");
  return positives.slice(0, 2);
}

function buildRecs(scores,holdings,total){
  const recs=[];const{geoMap,secMap,classes,currencies}=scores;const tickers=new Set(holdings.map(h=>h.ticker));
  const bondPct=classes["bond"]||0,rePct=classes["real_estate"]||0,commPct=classes["commodity"]||0,equityPct=classes["equity"]||0;
  const usW=geoMap["Amér. du Nord"]||0,emW=["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const tW=secMap["Technologie"]||0,usdW=currencies["USD"]||0;
  for(let i=0;i<holdings.length;i++)for(let j=i+1;j<holdings.length;j++){const a=holdings[i],b=holdings[j],eA=DB[a.ticker],eB=DB[b.ticker];if(!eA||!eB)continue;const ov=eA.overlaps?.[b.ticker]||0;if(ov>=90)recs.push({priority:"high",icon:"overlap",color:"#f87171",bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.15)",level:"essential",title:"Chevauchement critique",text:`${a.ticker} et ${b.ticker} se recoupent à ${ov}% — doublon inutile. Conservez un seul.`});else if(ov>=60)recs.push({priority:"medium",icon:"overlap",color:"#fb923c",bg:"rgba(251,146,60,0.08)",border:"rgba(251,146,60,0.15)",level:"advanced",title:"Chevauchement élevé",text:`${a.ticker} et ${b.ticker} partagent ~${ov}% de leurs sous-jacents.`});}
  if(bondPct===0&&holdings.length>0)recs.push({priority:"high",icon:"bond",color:"#34d399",bg:"rgba(52,211,153,0.08)",border:"rgba(52,211,153,0.15)",title:"Aucune obligation",text:"Portefeuille 100% actions. obligations mondiales ou euro (ex: iShares Global Aggregate) réduiraient la volatilité et protégeraient lors des krachs."});
  else if(bondPct<15&&holdings.length>0)recs.push({priority:"medium",icon:"bond",color:"#34d399",bg:"rgba(52,211,153,0.08)",border:"rgba(52,211,153,0.15)",level:"advanced",title:"Faible exposition obligataire",cat:"bonds",text:`${bondPct.toFixed(0)}% seulement. Une allocation de 20-25% améliorerait la résilience.`});
  if(commPct===0&&holdings.length>=2)recs.push({priority:"low",icon:"gold",color:"#facc15",bg:"rgba(250,204,21,0.08)",border:"rgba(250,204,21,0.15)",level:"advanced",title:"Or absent",cat:"gold",text:"5-10% d'or (un ETF or physique) protège contre l'inflation et les crises systémiques."});
  if(rePct===0&&holdings.length>=2)recs.push({priority:"low",icon:"building",color:"#818cf8",bg:"rgba(129,140,248,0.08)",border:"rgba(129,140,248,0.15)",level:"advanced",title:"Immobilier absent",cat:"realestate",text:"Les REITs (ETF immobilier coté mondial) offrent revenus réguliers et décorrélation partielle."});
  const devW=(geoMap["Amér. du Nord"]||0)+(["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(geoMap[k]||0),0))+(geoMap["Japon"]||0);
  if(devW<20&&holdings.length>0)recs.push({priority:"high",icon:"geo",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",border:"rgba(245,158,11,0.15)",level:"essential",title:"Marchés développés absents",cat:"world",text:`Seulement ${devW.toFixed(0)}% en marchés développés (US, Europe, Japon). Ces marchés représentent ~80% de la capitalisation mondiale. Un ETF Monde comme ETF Monde rééquilibrerait fortement votre exposition.`});
  else if(usW>80)recs.push({priority:"high",icon:"geo",color:"#f59e0b",bg:"rgba(245,158,11,0.08)",border:"rgba(245,158,11,0.15)",level:"essential",title:"Concentration US excessive",cat:"europe",text:`${usW.toFixed(0)}% en Amérique du Nord. Ajoutez de l'Europe ou des émergents pour rééquilibrer.`});
  if(emW<8&&devW>=20&&holdings.length>0)recs.push({priority:"medium",icon:"geo",color:"#818cf8",bg:"rgba(129,140,248,0.08)",border:"rgba(129,140,248,0.15)",level:"advanced",title:"Émergents sous-représentés",cat:"emerging",text:`${emW.toFixed(0)}% seulement en marchés émergents, qui représentent ~40% du PIB mondial.`});
  if(tW>35)recs.push({priority:"high",icon:"sector",color:"#f87171",bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.15)",level:"essential",title:"Surexposition technologie",text:`${tW.toFixed(0)}% en Tech — très sensible aux taux et aux rotations sectorielles.`});
  if(usdW>80)recs.push({priority:"medium",icon:"currency",color:"#38bdf8",bg:"rgba(56,189,248,0.08)",border:"rgba(56,189,248,0.15)",level:"advanced",title:"Risque USD élevé",cat:"eurobonds",text:`${usdW.toFixed(0)}% USD. Une dépréciation du dollar impacte directement vos rendements en euros.`});
  if(scores.total>=16)recs.push({priority:"success",icon:"trophy",color:"#4ade80",bg:"rgba(74,222,128,0.08)",border:"rgba(74,222,128,0.15)",level:"essential",title:"Excellent portefeuille",text:"Diversification optimale. Maintenez et rééquilibrez périodiquement."});

  // Asset class overexposure warnings
  const equityPctR=classes["equity"]||0;
  const bondPctR=classes["bond"]||0;
  const commPctR=classes["commodity"]||0;
  const rePctR=classes["real_estate"]||0;
  if(commPctR>25) recs.push({priority:"high",icon:"gold",color:"#facc15",bg:"rgba(250,204,21,0.08)",border:"rgba(250,204,21,0.15)",level:"essential",title:"Surexposition matières premières",cat:"gold",text:`${commPctR.toFixed(0)}% en matières premières (or, etc.). Au-delà de 10-15%, cette classe amplifie la volatilité sans rendement long terme garanti. Rééquilibrez vers des actions ou obligations.`});
  else if(commPctR>15) recs.push({priority:"medium",icon:"gold",color:"#facc15",bg:"rgba(250,204,21,0.08)",border:"rgba(250,204,21,0.15)",level:"advanced",title:"Or/matières premières élevé",cat:"gold",text:`${commPctR.toFixed(0)}% en matières premières. Une allocation de 5-10% est généralement recommandée comme couverture.`});
  if(rePctR>30) recs.push({priority:"high",icon:"building",color:"#fb923c",bg:"rgba(251,146,60,0.08)",border:"rgba(251,146,60,0.15)",level:"essential",title:"Surexposition immobilier",cat:"realestate",text:`${rePctR.toFixed(0)}% en immobilier coté. Au-delà de 15%, vous amplifiez le risque de taux (les REITs sont sensibles aux hausses de taux). Diversifiez avec des actions ou obligations.`});
  if(bondPctR>60) recs.push({priority:"medium",icon:"bond",color:"#34d399",bg:"rgba(52,211,153,0.08)",border:"rgba(52,211,153,0.15)",level:"advanced",title:"Portefeuille très obligataire",cat:"emerging",text:`${bondPctR.toFixed(0)}% en obligations. Rendement potentiel limité sur le long terme. Un rééquilibrage vers les actions améliorerait la performance attendue.`});
  if(equityPctR>95&&holdings.length===1) recs.push({priority:"low",icon:"sector",color:"#818cf8",bg:"rgba(129,140,248,0.08)",border:"rgba(129,140,248,0.15)",level:"advanced",title:"Portefeuille mono-ETF",cat:"bonds",text:"Un seul ETF action couvre bien la diversification interne. Ajouter obligations et or renforcerait la résilience globale lors des crises."});

  // Scoring-driven analysis
  if(scores.overlap<10&&holdings.length>1) recs.push({priority:"high",icon:"overlap",color:"#f87171",bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.15)",level:"essential",title:"Chevauchements massifs détectés",text:`Score chevauchement : ${scores.overlap.toFixed(1)}/20. Plusieurs de vos ETF détiennent les mêmes entreprises. Vous payez des frais de gestion en doublon sans gain de diversification.`});
  if(scores.currency<8&&holdings.length>0) recs.push({priority:"medium",icon:"currency",color:"#38bdf8",bg:"rgba(56,189,248,0.08)",border:"rgba(56,189,248,0.15)",level:"advanced",title:"Dépendance monétaire élevée",cat:"eurobonds",text:`Score devises : ${scores.currency.toFixed(1)}/20. Votre portefeuille est très exposé à une ou deux devises. Une variation des taux de change peut amplement affecter vos rendements réels en euros.`});
  if(scores.assetClass<8&&holdings.length>1) recs.push({priority:"medium",icon:"bond",color:"#34d399",bg:"rgba(52,211,153,0.08)",border:"rgba(52,211,153,0.15)",level:"advanced",title:"Classes d'actifs déséquilibrées",cat:"bonds",text:`Score classes d'actifs : ${scores.assetClass.toFixed(1)}/20. Un portefeuille robuste combine actions, obligations, immobilier et or dans des proportions équilibrées. Le vôtre est concentré sur une seule catégorie.`});

  const order={high:0,medium:1,low:2,success:3};
  return recs.sort((a,b)=>order[a.priority]-order[b.priority]).slice(0,6);
}

/* ─── SUGGESTION CATALOG ─────────────────────────────────────────────────────── */
const CAT={
  world:{title:"ETF Monde — brique de base",emoji:"🌍",color:"#818cf8",why:"Un ETF Monde est le point de départ idéal : 1600 entreprises, diversification maximale en un produit.",options:[
    {ticker:"MWRD",label:"Monde développé · Amundi",desc:"Équivalent IWDA, frais compétitifs, domicilié Luxembourg.",ter:"0.12%",tags:["✅ Éligible PEA","💰 Le moins cher"]},
    {ticker:"IWDA",label:"Monde développé · iShares",desc:"1 600 entreprises dans 23 pays développés. La référence mondiale.",ter:"0.20%",tags:["⭐ Le plus populaire","💧 Très liquide"]},
    {ticker:"EWLD",label:"Monde entier · Amundi",desc:"Pays développés + marchés émergents en un seul produit.",ter:"0.38%",tags:["✅ Éligible PEA","🌐 Monde + émergents"]},
  ]},
  bonds:{title:"Obligations",emoji:"🔒",color:"#34d399",why:"Votre portefeuille manque d'obligations. Elles amortissent la volatilité et protègent lors des krachs actions.",options:[
    {ticker:"IEAG",label:"Obligations euro · iShares",desc:"Obligations souveraines et corporate européennes. Zéro risque de change.",ter:"0.09%",tags:["💰 Le moins cher","🇪🇺 Zéro risque €"]},
    {ticker:"AGGH",label:"Obligations mondiales · iShares",desc:"Obligations du monde entier, couvertes en euros.",ter:"0.10%",tags:["🌍 Le plus diversifié","💧 Liquide"]},
  ]},
  gold:{title:"Or",emoji:"✨",color:"#facc15",why:"5-10% d'or réduit la volatilité globale et protège contre l'inflation et les crises systémiques.",options:[
    {ticker:"SGLD",label:"Or physique · Invesco",desc:"Or physique stocké en coffre à Londres. Meilleure option pour les investisseurs européens — frais très bas, réplication physique.",ter:"0.12%",tags:["💰 Le moins cher","🏦 Or physique","💧 Liquide"]},
  ]},
  realestate:{title:"Immobilier coté",emoji:"🏢",color:"#fb923c",why:"Les REITs offrent revenus réguliers et décorrélation partielle des actions.",options:[
    {ticker:"EPRA",label:"Immobilier mondial · Amundi",desc:"Foncières cotées mondiales — exposition Europe et Asie.",ter:"0.24%",tags:["✅ Éligible PEA","🇪🇺 Exposition Europe"]},
    {ticker:"CBRE",label:"REITs mondiaux · iShares",desc:"Sociétés immobilières cotées dans le monde entier.",ter:"0.25%",tags:["🌍 Plus diversifié","💧 Liquide"]},
  ]},
  europe:{title:"Actions Europe",emoji:"🇪🇺",color:"#38bdf8",why:"Rééquilibre la forte pondération US et expose aux secteurs défensifs européens.",options:[
    {ticker:"MEUD",label:"Actions Europe · Amundi",desc:"Grandes entreprises européennes, domicilié en France.",ter:"0.12%",tags:["✅ Éligible PEA","💰 Le moins cher"]},
    {ticker:"VEUR",label:"Actions Europe · Vanguard",desc:"Royaume-Uni, France, Suisse, Allemagne — grandes capitalisations.",ter:"0.10%",tags:["💰 Frais très bas","💧 Très liquide"]},
  ]},
  emerging:{title:"Marchés émergents",emoji:"📈",color:"#a78bfa",why:"Les émergents = ~40% du PIB mondial mais souvent absents des portefeuilles.",options:[
    {ticker:"PAEEM",label:"Marchés émergents · Amundi",desc:"Chine, Inde, Taiwan, Brésil — grandes capitalisations.",ter:"0.20%",tags:["✅ Éligible PEA","⭐ Le plus populaire"]},
    {ticker:"EIMI",label:"Marchés émergents · iShares",desc:"Chine, Inde, Taiwan + mid et small caps émergentes.",ter:"0.18%",tags:["💰 Le moins cher","🔬 + Small caps"]},
  ]},
  smallcaps:{title:"Petites capitalisations",emoji:"🔬",color:"#c084fc",why:"Prime de rendement historique — complément idéal à un ETF large caps.",options:[
    {ticker:"IUSN",label:"Small caps mondiales · iShares",desc:"Complémentaire à un ETF Monde — diversifie sur les petites entreprises.",ter:"0.35%",tags:["🌍 Le plus diversifié","🔬 Small caps mondiales"]},
  ]},
  eurobonds:{title:"Obligations euro",emoji:"💶",color:"#34d399",why:"Forte exposition USD détectée. Des obligations en euros éliminent le risque de change.",options:[
    {ticker:"IEAG",label:"Obligations euro · iShares",desc:"Souveraines et corporate en euros — risque de change nul.",ter:"0.09%",tags:["💰 Le moins cher","🇪🇺 Zéro risque €"]},
  ]},
};
function buildSuggestions(scores,holdings){
  const keys=[];const{classes,geoMap,secMap,currencies}=scores;const tickers=new Set(holdings.map(h=>h.ticker));
  const bondPct=classes["bond"]||0,rePct=classes["real_estate"]||0,commPct=classes["commodity"]||0,equityPct=classes["equity"]||0;
  const usW=geoMap["Amér. du Nord"]||0,emW=["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const euW=["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const usdW=currencies["USD"]||0;
  if(!holdings.length){keys.push("world","bonds","gold");return keys.map(k=>({key:k,...CAT[k]}));}
  if(bondPct<10)keys.push(usdW>80?"eurobonds":"bonds");
  if(commPct<5)keys.push("gold");
  if(rePct<5&&holdings.length>=2)keys.push("realestate");
  if(usW>70&&euW<15)keys.push("europe");
  if(emW<8)keys.push("emerging");
  if(!tickers.has("IUSN")&&equityPct>50&&holdings.length>=2)keys.push("smallcaps");
  return [...new Set(keys)].slice(0,4).map(k=>({key:k,...CAT[k]}));
}

const ASSET_LABELS={equity:"Actions",bond:"Obligations",real_estate:"Immobilier",commodity:"Matières prem."};
const ASSET_COLORS={equity:"#818cf8",bond:"#34d399",real_estate:"#fb923c",commodity:"#facc15"};
const STORAGE_KEY_V2="etf-portfolio-v2";

/* ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────── */
function scoreColor(s){
  if(s>=15)return{from:"#00f5a0",to:"#00d9f5",text:"#00f0a0",glow:"rgba(0,245,160,0.3)",label:"Excellent"};
  if(s>=10)return{from:"#f7971e",to:"#ffd200",text:"#ffd200",glow:"rgba(255,210,0,0.3)",label:"Correct"};
  if(s>=5) return{from:"#f97316",to:"#ef4444",text:"#f97316",glow:"rgba(249,115,22,0.3)",label:"Faible"};
  return       {from:"#ef4444",to:"#dc2626",text:"#ef4444",glow:"rgba(239,68,68,0.3)",label:"Critique"};
}

/* ─── GRADIENT CARD ──────────────────────────────────────────────────────────── */
function GCard({children, gradient, style={}}){
  return(
    <div style={{
      background: gradient || "rgba(255,255,255,0.04)",
      borderRadius:20, position:"relative", overflow:"hidden",
      border: gradient ? "none" : "1px solid rgba(255,255,255,0.08)",
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── SCORE RING ─────────────────────────────────────────────────────────────── */
function ScoreRing({value,label,size=148}){
  const r=size/2-12,circ=2*Math.PI*r,g=scoreColor(value);
  const id=`r${label.replace(/\W/g,"")}`;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{position:"relative",width:size,height:size}}>
        {/* Glow behind ring */}
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,${g.glow} 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"relative",zIndex:1}}>
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={g.from}/><stop offset="100%" stopColor={g.to}/>
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth="8"
            strokeDasharray={`${(value/20)*circ} ${(1-value/20)*circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)",filter:`drop-shadow(0 0 8px ${g.from})`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,zIndex:2}}>
          <span style={{fontSize:34,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-1,fontVariantNumeric:"tabular-nums"}}>{value.toFixed(1)}</span>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2}}>/20</span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.8)",letterSpacing:0.3}}>{label}</div>
        {value>0&&<div style={{fontSize:10,color:g.text,fontWeight:500,marginTop:2}}>{g.label}</div>}
      </div>
    </div>
  );
}

/* ─── MINI BAR ───────────────────────────────────────────────────────────────── */
function MiniBar({label,value,weight}){
  const g=scoreColor(value);
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",width:118,flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(value/20)*100}%`,background:`linear-gradient(90deg,${g.from},${g.to})`,borderRadius:2,transition:"width .7s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 8px ${g.from}88`}}/>
      </div>
      <span style={{fontSize:12,color:g.text,fontWeight:700,width:30,textAlign:"right"}}>{value.toFixed(1)}</span>
      <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",width:30,textAlign:"right"}}>{weight}</span>
    </div>
  );
}

/* ─── COLOR BARS ─────────────────────────────────────────────────────────────── */
const PALETTE=["#818cf8","#22d3ee","#a78bfa","#34d399","#c084fc","#67e8f9","#4ade80","#38bdf8","#e879f9","#60a5fa"];
const SECTOR_INFO={"Technologie":"Logiciels, semi-conducteurs, cloud, matériel informatique.","Finance":"Banques, assurances, gestion d'actifs.","Santé":"Pharma, biotech, dispositifs médicaux.","Industrie":"Fabrication, aérospatiale, défense, transports.","Conso. discr.":"Mode, automobile, loisirs, e-commerce.","Conso. cour.":"Alimentation, hygiène, tabac — produits essentiels.","Énergie":"Pétrole, gaz, énergies renouvelables.","Matériaux":"Métaux, mines, chimie.","Télécom":"Opérateurs, câble, internet.","Immobilier":"REITs et foncières cotées.","Services pub.":"Électricité, gaz, eau.","Oblig. souv.":"Obligations d'États — risque faible.","Oblig. corp.":"Obligations d'entreprises.","Or":"Valeur refuge, couverture inflation.","Énergie renou.":"Solaire, éolien, hydraulique."};
const GEO_INFO={"Amér. du Nord":"États-Unis et Canada — marchés les plus profonds.","Europe":"UE + UK, Suisse — économies développées.","Japon":"3ème économie mondiale.","Asie-Pac.":"Australie, NZ, Hong Kong, Singapour.","Émergents":"Chine, Inde, Brésil — fort potentiel.","Chine":"2ème économie mondiale, risque réglementaire.","Inde":"Fort potentiel de croissance.","Taiwan":"Leader semi-conducteurs (TSMC).","Corée du Sud":"Samsung, Hyundai.","Brésil":"Plus grande économie d'Amérique latine.","Autres EM":"Mexique, Indonésie, Thaïlande…","Royaume-Uni":"Finance, énergie, post-Brexit.","France":"Luxe, énergie, aéronautique.","Suisse":"Pharma et luxe — très défensif.","Allemagne":"Industrie automobile.","Pays-Bas":"ASML, logistique.","Autres EU":"Espagne, Italie, Suède…","Australie":"Matières premières.","Singapour":"Hub financier asiatique.","Autres Asie":"Vietnam, Malaisie…","Global":"Exposition mondiale.","Autres":"Autres régions."};

function InfoModal({label,text,onClose}){
  useEffect(()=>{const f=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",f);return()=>document.removeEventListener("keydown",f);},[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 16px 40px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111118",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"24px 22px",width:"100%",maxWidth:420,animation:"slideUp .28s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{label}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:30,height:30,color:"#94a3b8",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>{text}</p>
      </div>
    </div>
  );
}
function IBtn({label,text}){const[s,ss]=useState(false);return(<><button onClick={()=>ss(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 0 5px",display:"inline-flex",alignItems:"center"}}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><text x="6.5" y="10" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="system-ui" fontWeight="600">i</text></svg></button>{s&&<InfoModal label={label} text={text} onClose={()=>ss(false)}/>}</>);}

function ColorBars({data,title,infoMap={}}){
  const sorted=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,9);
  const max=sorted[0]?.[1]||1;
  return(
    <GCard>
      <div style={{padding:"20px 18px"}}>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase",marginBottom:18}}>{title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {sorted.map(([k,v],i)=>(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.85)",fontWeight:500}}>{k}</span>
                  {infoMap[k]&&<IBtn label={k} text={infoMap[k]}/>}
                </div>
                <span style={{fontSize:13,color:PALETTE[i%PALETTE.length],fontWeight:700}}>{v.toFixed(1)}%</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(v/max)*100}%`,background:`linear-gradient(90deg,${PALETTE[i%PALETTE.length]},${PALETTE[i%PALETTE.length]}bb)`,borderRadius:3,transition:"width .8s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 12px ${PALETTE[i%PALETTE.length]}55`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GCard>
  );
}

/* ─── SUGGESTION MODAL ───────────────────────────────────────────────────────── */
function SuggestionModal({catalog,onSelect,onClose}){
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(()=>{
    const f=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",f);
    return()=>document.removeEventListener("keydown",f);
  },[onClose]);

  // Drag to dismiss
  const onTouchStart = e => { startY.current = e.touches[0].clientY; };
  const onTouchMove = e => {
    const dy = e.touches[0].clientY - startY.current;
    if(dy > 0 && sheetRef.current) {
      currentY.current = dy;
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  };
  const onTouchEnd = () => {
    if(currentY.current > 80) { onClose(); }
    else if(sheetRef.current) { sheetRef.current.style.transform = "translateY(0)"; }
    currentY.current = 0;
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div
        ref={sheetRef}
        onClick={e=>e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background:"#111118",
          borderTop:"1px solid rgba(255,255,255,0.1)",
          borderRadius:"24px 24px 0 0",
          padding:"0 18px 40px",
          width:"100%", maxWidth:430,
          transition:"transform 0.2s cubic-bezier(.16,1,.3,1)",
          animation:"slideUp .3s cubic-bezier(.16,1,.3,1)",
        }}>

        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 6px",cursor:"grab"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/>
        </div>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingTop:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>{catalog.emoji}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{catalog.title}</span>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:28,height:28,color:"#94a3b8",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {/* Why */}
        <p style={{margin:"0 0 16px",fontSize:12,color:"#7c8fa8",lineHeight:1.55}}>{catalog.why}</p>

        {/* Options */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {catalog.options.map(opt=>(
            <button key={opt.ticker} onClick={()=>onSelect(opt.ticker)}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 14px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(255,255,255,0.16)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{DB[opt.ticker]?.name||opt.label.split(" · ")[0]}</span>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  {opt.ter&&<span style={{fontSize:10,color:"#34d399",fontWeight:700,background:"rgba(52,211,153,0.12)",padding:"2px 6px",borderRadius:5}}>TER {opt.ter}</span>}
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>{opt.ticker}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {opt.tags?.map((tag,i)=>(
                  <span key={i} style={{fontSize:10,color:"rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:"2px 8px"}}>{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
        <p style={{margin:"14px 0 0",fontSize:9,color:"rgba(255,255,255,0.15)",textAlign:"center",letterSpacing:.3}}>Suggestions indicatives — d'autres ETF couvrent la même catégorie.</p>
      </div>
    </div>
  );
}

/* ─── SEARCH ─────────────────────────────────────────────────────────────────── */
function Search({onAdd,suggestions=[]}){
  const[q,setQ]=useState(""),[amt,setAmt]=useState(""),[open,setOpen]=useState(false);
  const[hi,setHi]=useState(0),[err,setErr]=useState(""),[activeSug,setActiveSug]=useState(null);
  // selectedTicker stores the resolved ticker separately from the display string
  const[selectedTicker,setSelectedTicker]=useState(null);
  const ref=useRef(null),amtRef=useRef(null);
  useEffect(()=>{const f=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",f);return()=>document.removeEventListener("mousedown",f);},[]);

  // When user types, clear any previous selection
  const handleInput=(val)=>{setQ(val);setSelectedTicker(null);setErr("");setHi(0);setOpen(true);};

  // Resolve: if we have a confirmed selection use it, else try ISIN map
  const resolved=useMemo(()=>{
    if(selectedTicker) return selectedTicker;
    const u=q.trim().toUpperCase();
    if(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u]) return ISIN_MAP[u];
    return u;
  },[q,selectedTicker]);

  const results=useMemo(()=>{
    if(selectedTicker) return []; // already selected, no dropdown
    const u=q.trim().toUpperCase();
    if(u.length<1) return [];
    const search=(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])?ISIN_MAP[u]:u;
    return Object.entries(DB).filter(([t,e])=>t.includes(search)||e.name.toUpperCase().includes(search)||(e.isin&&e.isin.toUpperCase().includes(search))||e.p.toUpperCase().includes(search)).slice(0,6);
  },[q,selectedTicker]);

  const selectItem=(ticker,etfName)=>{
    setSelectedTicker(ticker);
    setQ(etfName); // show the name in the input
    setOpen(false);
    setTimeout(()=>amtRef.current?.focus(),60);
  };

  const doAdd=()=>{
    const t=resolved,a=parseFloat(amt);
    if(!t){setErr("Saisissez un ETF");return;}
    if(!DB[t]){setErr("ETF introuvable — sélectionnez-en un dans la liste");return;}
    if(isNaN(a)||a<=0){setErr("Montant invalide");return;}
    onAdd(t,a);setQ("");setAmt("");setErr("");setOpen(false);setSelectedTicker(null);
  };

  const onKey=e=>{
    if(!open||!results.length){if(e.key==="Enter")doAdd();return;}
    if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>Math.min(h+1,results.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setHi(h=>Math.max(h-1,0));}
    else if(e.key==="Enter"){e.preventDefault();const[t,e2]=results[hi];selectItem(t,e2.name);}
    else if(e.key==="Escape")setOpen(false);
  };

  const inp={width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",color:"#f1f5f9",fontSize:15,fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color .2s"};
  return(
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{position:"relative"}}>
        <input value={q} onChange={e=>handleInput(e.target.value)} onFocus={e=>{if(!selectedTicker)setOpen(true);e.target.style.borderColor="rgba(129,140,248,0.6)";}} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} onKeyDown={onKey} placeholder="Nom, ISIN ou ticker…" style={inp}/>
        {/* Clear button when item selected */}
        {selectedTicker&&(
          <button onMouseDown={()=>{setQ("");setSelectedTicker(null);setOpen(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:22,height:22,color:"rgba(255,255,255,0.5)",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
        )}
        {open&&results.length>0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:"rgba(14,14,22,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,overflow:"hidden",backdropFilter:"blur(24px)",boxShadow:"0 24px 60px rgba(0,0,0,0.8)"}}>
            {results.map(([t,e],i)=>(
              <div key={t} onMouseDown={()=>selectItem(t,e.name)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",background:i===hi?"rgba(129,140,248,0.1)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.05)",transition:"background .1s"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:4}}>{e.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap"}}>
                    <span style={{fontSize:10,fontFamily:"'SF Mono',monospace",color:"rgba(255,255,255,0.25)",letterSpacing:.4,flexShrink:0}}>{e.isin}</span>
                    <span style={{fontSize:10,color:ASSET_COLORS[e.assetClass]||"#7c8fa8",fontWeight:600,background:`${ASSET_COLORS[e.assetClass]||"#818cf8"}15`,padding:"1px 6px",borderRadius:4,flexShrink:0}}>{ASSET_LABELS[e.assetClass]||e.assetClass}</span>
                    <span style={{fontSize:10,fontFamily:"'SF Mono',monospace",color:"rgba(255,255,255,0.15)",letterSpacing:.5,marginLeft:"auto",flexShrink:0}}>{t}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {open&&q.length>=2&&results.length===0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:"rgba(14,14,22,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px",textAlign:"center",backdropFilter:"blur(24px)"}}>
            <div style={{fontSize:13,color:"#94a3b8"}}>Aucun résultat pour « {q} »</div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10}}>
        <input ref={amtRef} type="number" value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()} onFocus={e=>e.target.style.borderColor="rgba(129,140,248,0.6)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} placeholder="Montant (€)" style={{...inp,flex:1}}/>
        <button onClick={doAdd} style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)",border:"none",borderRadius:14,padding:"14px 22px",color:"#fff",fontSize:20,fontWeight:700,cursor:"pointer",flexShrink:0,boxShadow:"0 4px 24px rgba(99,102,241,0.45)",transition:"transform .15s,box-shadow .15s"}} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 6px 28px rgba(99,102,241,0.6)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(99,102,241,0.45)";}}>+</button>
      </div>
      {err&&<div style={{fontSize:13,color:"#fca5a5",padding:"10px 14px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10}}>{err}</div>}
      {suggestions.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:4}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>Suggestions pour vous</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {suggestions.map(s=>(
              <button key={s.key} onClick={()=>setActiveSug(s.key)}
                style={{background:`${s.color}14`,border:`1px solid ${s.color}35`,borderRadius:20,padding:"7px 14px",color:s.color,fontSize:12,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${s.color}26`}
                onMouseLeave={e=>e.currentTarget.style.background=`${s.color}14`}>
                <span>{s.emoji}</span><span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {activeSug&&<SuggestionModal catalog={CAT[activeSug]} onSelect={t=>{selectItem(t,DB[t]?.name||t);setActiveSug(null);}} onClose={()=>setActiveSug(null)}/>}
    </div>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────────────── */
function Tabs({active,onChange,highlight=[]}){
  const icons={
    scores:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.8"/></svg>,
    geo:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="8" cy="8" rx="2.8" ry="6" stroke="currentColor" strokeWidth="1.4"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.4"/></svg>,
    sec:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx=".8" fill="currentColor" opacity=".5"/><rect x="6.5" y="5" width="3" height="9" rx=".8" fill="currentColor" opacity=".75"/><rect x="11" y="2" width="3" height="12" rx=".8" fill="currentColor"/></svg>,
    ptf:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 11.5C4 11.5 4.5 7 6.5 7c2 0 2 2.5 4 2.5 1.5 0 2-3.5 3.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return(
    <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:16,padding:4,gap:2,border:"1px solid rgba(255,255,255,0.07)"}}>
      {[{id:"scores",label:"Scores"},{id:"geo",label:"Géo."},{id:"sec",label:"Secteurs"},{id:"ptf",label:"ETF"}].map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,background:active===t.id?"rgba(99,102,241,0.2)":"transparent",border:active===t.id?"1px solid rgba(99,102,241,0.35)":"1px solid transparent",borderRadius:12,padding:"9px 4px",color:active===t.id?"#c7d2fe":"rgba(255,255,255,0.4)",fontSize:11,fontWeight:active===t.id?700:400,cursor:"pointer",transition:"all .2s",WebkitTapHighlightColor:"transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          {icons[t.id]}
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:3}}>
            <span style={{letterSpacing:.3}}>{t.label}</span>
            {highlight.includes(t.id)&&<div style={{width:5,height:5,borderRadius:"50%",background:"#818cf8",boxShadow:"0 0 6px #818cf8",animation:"pulse 2s infinite"}}/>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── DISCLAIMER ─────────────────────────────────────────────────────────────── */
function Disclaimer({onAccept}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"20px 16px"}}>
      <div style={{background:"#0e0e16",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"32px 24px",width:"100%",maxWidth:400,boxShadow:"0 32px 80px rgba(0,0,0,0.8)"}}>
        <div style={{marginBottom:20}}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#dbg)"/>
            <defs><linearGradient id="dbg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient><linearGradient id="dl" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs>
            <line x1="14" y1="18" x2="34" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="24" y1="18" x2="24" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="18" y1="34" x2="30" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 18 Q11 22 14 26 Q17 22 14 18Z" fill="rgba(255,255,255,0.9)"/>
            <path d="M34 18 Q31 22 34 26 Q37 22 34 18Z" fill="rgba(255,255,255,0.9)"/>
            <line x1="14" y1="18" x2="34" y2="18" stroke="url(#dl)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:14,letterSpacing:-.3}}>À titre informatif uniquement</div>
        <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,margin:"0 0 16px"}}>ETF Score est un outil d'analyse personnel. Les scores et suggestions affichés <strong style={{color:"#f1f5f9"}}>ne constituent pas un conseil en investissement</strong> au sens de la réglementation AMF.</p>
        <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,margin:"0 0 28px"}}>Tout investissement comporte un risque de perte en capital. Consultez un conseiller financier agréé avant toute décision.</p>
        <button onClick={onAccept} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#4f46e5)",border:"none",borderRadius:14,padding:"16px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(99,102,241,0.5)",letterSpacing:.3}}>
          J'ai compris, accéder à l'app
        </button>
      </div>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────────── */
function Toast({msg,visible}){
  return(
    <div style={{position:"fixed",bottom:80,left:"50%",transform:`translateX(-50%) translateY(${visible?0:12}px)`,opacity:visible?1:0,transition:"all .3s cubic-bezier(.16,1,.3,1)",background:"rgba(20,20,32,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"11px 18px",zIndex:9000,display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:"none",whiteSpace:"nowrap"}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 8px #4ade80",flexShrink:0}}/>
      <span style={{fontSize:13,color:"#f1f5f9",fontWeight:500}}>{msg}</span>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────────── */
export default function App(){
  const[holdings,setHoldings]=useState([]);
  const[ready,setReady]=useState(false);
  const[saved,setSaved]=useState(true);
  const[tab,setTab]=useState("scores");
  const[confirmReset,setConfirmReset]=useState(false);
  const[editAmt,setEditAmt]=useState({});
  const[disclaimerSeen,setDisclaimerSeen]=useState(false);
  const[savedAt,setSavedAt]=useState(null);
  const[toast,setToast]=useState({msg:"",visible:false});
  const[installToast,setInstallToast]=useState(false);
  const[activeRec,setActiveRec]=useState(null);
  const[recMode,setRecMode]=useState("essential"); // 'essential' | 'advanced'
  const toastTimer=useRef(null);

  // Load
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){const p=JSON.parse(raw);if(p.holdings)setHoldings(p.holdings);if(p.disclaimerSeen)setDisclaimerSeen(true);if(p.savedAt)setSavedAt(new Date(p.savedAt));}
    }catch(_){}
    setReady(true);
    const isStandalone=window.navigator.standalone||window.matchMedia("(display-mode: standalone)").matches;
    const seen=localStorage.getItem("etf-install-seen");
    if(!isStandalone&&!seen){setTimeout(()=>{setInstallToast(true);setTimeout(()=>setInstallToast(false),6000);localStorage.setItem("etf-install-seen","1");},2500);}
  },[]);

  // Save
  useEffect(()=>{
    if(!ready)return;
    setSaved(false);
    const t=setTimeout(async()=>{
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({holdings,disclaimerSeen,savedAt:new Date().toISOString()}));}catch(_){}
      setSaved(true);
    },700);
    return()=>clearTimeout(t);
  },[holdings,disclaimerSeen,ready]);

  const addHolding=useCallback((ticker,amount)=>{
    setHoldings(prev=>{const ex=prev.find(h=>h.ticker===ticker);if(ex)return prev.map(h=>h.ticker===ticker?{...h,amount:h.amount+amount}:h);return[...prev,{ticker,name:DB[ticker].name,amount}];});
    if(toastTimer.current)clearTimeout(toastTimer.current);
    setToast({msg:`${ticker} ajouté au portefeuille`,visible:true});
    toastTimer.current=setTimeout(()=>setToast(t=>({...t,visible:false})),2500);
  },[]);
  const removeHolding=useCallback(ticker=>setHoldings(p=>p.filter(h=>h.ticker!==ticker)),[]);
  const updateAmount=(ticker,val)=>{const a=parseFloat(val);if(!isNaN(a)&&a>0)setHoldings(p=>p.map(h=>h.ticker===ticker?{...h,amount:a}:h));};

  const scores=useMemo(()=>computeScores(holdings),[holdings]);
  const recs=useMemo(()=>buildRecs(scores,holdings,holdings.reduce((s,h)=>s+h.amount,0)),[scores,holdings]);
  const positives=useMemo(()=>buildPositive(scores,holdings),[scores,holdings]);
  const suggestions=useMemo(()=>buildSuggestions(scores,holdings),[scores,holdings]);
  const total=holdings.reduce((s,h)=>s+h.amount,0);
  const g=scoreColor(scores.total);

  if(!ready)return(<div style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:36,height:36,borderRadius:"50%",border:"2.5px solid rgba(99,102,241,0.2)",borderTopColor:"#6366f1",animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  return(
    <div style={{minHeight:"100vh",background:"#080810",color:"#f1f5f9",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",maxWidth:430,margin:"0 auto",position:"relative"}}>
      <style>{`
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input{outline:none;-webkit-appearance:none}input::placeholder{color:rgba(255,255,255,0.2)}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        button{font-family:inherit;-webkit-tap-highlight-color:transparent}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        ::-webkit-scrollbar{display:none}
        .anim{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      {!disclaimerSeen&&<Disclaimer onAccept={()=>setDisclaimerSeen(true)}/>}

      {/* Ambient background */}
      <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-25%",left:"-20%",width:"70%",height:"65%",background:"radial-gradient(ellipse,rgba(79,70,229,0.18) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-15%",width:"65%",height:"60%",background:"radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",top:"40%",left:"40%",width:"55%",height:"50%",background:"radial-gradient(ellipse,rgba(34,211,238,0.06) 0%,transparent 65%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* ── HEADER ── */}
        <header style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",background:"rgba(8,8,16,0.85)",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,flexShrink:0}}>
              <svg viewBox="0 0 512 512" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ll" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="50%" stopColor="#818cf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient>
                  <linearGradient id="lf" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient>
                  <filter id="lg"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <filter id="lb"><feGaussianBlur stdDeviation="50"/></filter>
                  <clipPath id="ls"><rect width="512" height="512" rx="115" ry="115"/></clipPath>
                </defs>
                <g clipPath="url(#ls)">
                  <rect width="512" height="512" fill="#08080c"/>
                  <ellipse cx="300" cy="260" rx="200" ry="150" fill="#6366f1" opacity="0.14" filter="url(#lb)"/>
                  <ellipse cx="150" cy="350" rx="120" ry="100" fill="#38bdf8" opacity="0.08" filter="url(#lb)"/>
                  <path d="M72 360C110 360 120 310 155 295C190 280 200 320 235 300C265 282 275 230 310 200C340 175 355 210 385 185C408 165 420 145 440 128L440 400L72 400Z" fill="url(#lf)"/>
                  <path d="M72 360C110 360 120 310 155 295C190 280 200 320 235 300C265 282 275 230 310 200C340 175 355 210 385 185C408 165 420 145 440 128" fill="none" stroke="url(#ll)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#lg)"/>
                  <circle cx="440" cy="128" r="14" fill="#c084fc" filter="url(#lg)"/>
                  <circle cx="440" cy="128" r="7" fill="white" opacity="0.9"/>
                </g>
              </svg>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9",letterSpacing:-.3}}>ETF Score</span>
                <span style={{fontSize:9,fontWeight:800,color:"#818cf8",letterSpacing:1.5,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",padding:"2px 7px",borderRadius:4}}>EXPERT</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:.5}}>Analyse multicritères</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",background:"rgba(255,255,255,0.04)",borderRadius:20,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:saved?"#4ade80":"#facc15",boxShadow:saved?"0 0 6px #4ade8099":"0 0 6px #facc1599",transition:"all .4s"}}/>
              <div style={{display:"flex",flexDirection:"column"}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:.5,lineHeight:1}}>{saved?"Sync":"..."}</span>
                {savedAt&&<span style={{fontSize:8,color:"rgba(255,255,255,0.2)",lineHeight:1,marginTop:1}}>{savedAt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* ── HERO SCORE BANNER ── */}
        {holdings.length>0&&(
          <div style={{margin:"14px 16px 0",padding:1.5,borderRadius:22,background:`linear-gradient(135deg,${g.from}44,${g.to}22,rgba(255,255,255,0.05))`}}>
            <div style={{background:"rgba(8,8,16,0.92)",borderRadius:20.5,padding:"20px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>Score global</div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontSize:42,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-2,fontVariantNumeric:"tabular-nums"}}>{scores.total.toFixed(1)}</span>
                  <span style={{fontSize:16,color:"rgba(255,255,255,0.25)",fontWeight:400}}>/20</span>
                </div>
                <div style={{fontSize:12,color:g.text,fontWeight:600,marginTop:4}}>{g.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:5,marginBottom:6}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>Apports</span>
                  <IBtn label="Montant investi" text="Ce montant correspond à vos apports nets — la somme totale que vous avez versée. Il ne tient pas compte des variations de marché. La valeur réelle de votre portefeuille peut être différente selon les performances des ETF."/>
                </div>
                <div style={{fontSize:26,fontWeight:700,color:"rgba(255,255,255,0.85)",letterSpacing:-.5}}>{total.toLocaleString("fr-FR")} €</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:4}}>{holdings.length} position{holdings.length>1?"s":""}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{padding:"14px 16px 0"}}><Tabs active={tab} onChange={setTab} highlight={holdings.length===0?["ptf"]:[]}/></div>

        {/* ── CONTENT ── */}
        <div style={{padding:"14px 16px 100px"}}>

          {/* SCORES */}
          {tab==="scores"&&(
            <div className="anim" style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Score rings */}
              <div style={{padding:1.5,borderRadius:22,background:"linear-gradient(135deg,rgba(99,102,241,0.4),rgba(139,92,246,0.2),rgba(56,189,248,0.1))"}}>
                <div style={{background:"rgba(8,8,16,0.93)",borderRadius:20.5,padding:"28px 16px 24px",display:"flex",justifyContent:"space-around",alignItems:"flex-start"}}>
                  <ScoreRing value={scores.geo} label="Géographique"/>
                  <div style={{width:1,background:"rgba(255,255,255,0.07)",alignSelf:"stretch",margin:"10px 0"}}/>
                  <ScoreRing value={scores.sector} label="Sectorielle"/>
                </div>
              </div>

              {/* Criteria detail */}
              {holdings.length>0&&(
                <GCard>
                  <div style={{padding:"18px 18px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase",marginBottom:16}}>Détail des critères</div>
                    <div style={{display:"flex",flexDirection:"column",gap:13}}>
                      <MiniBar label="Géographie" value={scores.geo} weight="25%"/>
                      <MiniBar label="Secteurs" value={scores.sector} weight="25%"/>
                      <MiniBar label="Chevauchement" value={scores.overlap} weight="20%"/>
                      <MiniBar label="Classes d'actifs" value={scores.assetClass} weight="15%"/>
                      <MiniBar label="Devises" value={scores.currency} weight="15%"/>
                    </div>

                    {/* Asset class chips */}
                    {Object.keys(scores.classes).length>0&&(
                      <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>Classes d'actifs</div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {Object.entries(scores.classes).sort((a,b)=>b[1]-a[1]).map(([cls,pct])=>(
                            <div key={cls} style={{padding:1,borderRadius:20,background:`linear-gradient(135deg,${ASSET_COLORS[cls]||"#818cf8"}60,${ASSET_COLORS[cls]||"#818cf8"}20)`}}>
                              <div style={{background:"rgba(8,8,16,0.85)",borderRadius:18.5,padding:"5px 12px",display:"flex",alignItems:"center",gap:6}}>
                                <div style={{width:6,height:6,borderRadius:"50%",background:ASSET_COLORS[cls]||"#818cf8",boxShadow:`0 0 8px ${ASSET_COLORS[cls]||"#818cf8"}`}}/>
                                <span style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:500}}>{ASSET_LABELS[cls]||cls}</span>
                                <span style={{fontSize:12,color:ASSET_COLORS[cls]||"#818cf8",fontWeight:700}}>{pct.toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GCard>
              )}

              {/* Stat chips */}
              {holdings.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {[{v:Object.keys(scores.geoMap).length,l:"Zones",c:"#818cf8"},{v:Object.keys(scores.secMap).length,l:"Secteurs",c:"#22d3ee"},{v:holdings.length,l:"ETF",c:"#a78bfa"}].map(({v,l,c})=>(
                    <div key={l} style={{padding:1,borderRadius:16,background:`linear-gradient(135deg,${c}40,${c}10)`}}>
                      <div style={{background:"rgba(8,8,16,0.9)",borderRadius:15,padding:"14px 12px",textAlign:"center"}}>
                        <div style={{fontSize:26,fontWeight:800,color:c,lineHeight:1,letterSpacing:-1}}>{v}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:5,letterSpacing:.5,textTransform:"uppercase",fontWeight:600}}>{l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {(recs.length>0||positives.length>0)&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {/* Section header */}
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 2px",marginBottom:2}}>
                    <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(99,102,241,0.4),transparent)"}}/>
                    <span style={{fontSize:11,fontWeight:700,color:"#c7d2fe",letterSpacing:2,textTransform:"uppercase"}}>Analyse & Recommandations</span>
                    <div style={{flex:1,height:1,background:"linear-gradient(270deg,rgba(99,102,241,0.4),transparent)"}}/>
                  </div>

                  {/* Critical first — high priority essential recs */}
                  {recs.filter(r=>r.level==="essential"&&r.priority==="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`1px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:r.color,marginBottom:5}}>{r.title}</div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&(
                        <button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600}}>
                          <span style={{fontSize:14,lineHeight:1}}>→</span>
                          <span style={{borderBottom:`1px solid ${r.color}55`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Positive feedback — after criticals */}
                  {positives.map((p,i)=>(
                    <div key={i} style={{background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:16,padding:"13px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:16,flexShrink:0}}>🌟</span>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.65}}>{p}</p>
                    </div>
                  ))}

                  {/* Other essential recs (non-critical) */}
                  {recs.filter(r=>r.level==="essential"&&r.priority!=="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`1px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:r.color,marginBottom:5}}>{r.title}</div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&(
                        <button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600}}>
                          <span style={{fontSize:14,lineHeight:1}}>→</span>
                          <span style={{borderBottom:`1px solid ${r.color}55`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Advanced toggle */}
                  {recs.filter(r=>r.level==="advanced").length>0&&(
                    <button onClick={()=>setRecMode(m=>m==="essential"?"advanced":"essential")}
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",WebkitTapHighlightColor:"transparent"}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.5)",fontWeight:500}}>
                        {recMode==="essential"
                          ? `Analyse avancée · ${recs.filter(r=>r.level==="advanced").length} point${recs.filter(r=>r.level==="advanced").length>1?"s":""} supplémentaire${recs.filter(r=>r.level==="advanced").length>1?"s":""}`
                          : "Masquer l'analyse avancée"}
                      </span>
                      <span style={{fontSize:14,color:"rgba(255,255,255,0.3)",transition:"transform 0.2s",transform:recMode==="advanced"?"rotate(180deg)":"rotate(0deg)"}}>›</span>
                    </button>
                  )}

                  {/* Advanced recs */}
                  {recMode==="advanced"&&recs.filter(r=>r.level==="advanced").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`1px solid ${r.border}`,borderRadius:16,padding:"14px 16px",animation:"fadeUp .3s cubic-bezier(.16,1,.3,1)"}}>
                      <div style={{fontSize:12,fontWeight:700,color:r.color,marginBottom:5}}>{r.title}</div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&(
                        <button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600}}>
                          <span style={{fontSize:14,lineHeight:1}}>→</span>
                          <span style={{borderBottom:`1px solid ${r.color}55`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!holdings.length&&(
                <div style={{padding:1.5,borderRadius:22,background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))"}}>
                  <div style={{background:"rgba(8,8,16,0.92)",borderRadius:20.5,padding:"48px 24px",textAlign:"center"}}>
                    <div style={{fontSize:48,marginBottom:16}}>📊</div>
                    <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>Aucun ETF renseigné</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>Allez dans l'onglet <strong style={{color:"#a5b4fc"}}>ETF</strong> pour ajouter vos positions.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==="geo"&&(<div className="anim">{Object.keys(scores.geoMap).length>0?<ColorBars data={scores.geoMap} title="Répartition géographique" infoMap={GEO_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"rgba(255,255,255,0.3)",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}
          {tab==="sec"&&(<div className="anim">{Object.keys(scores.secMap).length>0?<ColorBars data={scores.secMap} title="Répartition sectorielle" infoMap={SECTOR_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"rgba(255,255,255,0.3)",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}

          {/* ETF TAB */}
          {tab==="ptf"&&(
            <div className="anim" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{padding:1.5,borderRadius:22,background:"linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.2))"}}>
                <div style={{background:"rgba(8,8,16,0.92)",borderRadius:20.5,padding:"18px 16px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase",marginBottom:14}}>Ajouter un ETF</div>
                  <Search onAdd={addHolding} suggestions={suggestions}/>
                </div>
              </div>

              {holdings.length>0&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"0 4px"}}>
                    <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:2.5,textTransform:"uppercase"}}>Positions</span>
                    <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"none",color:"rgba(248,113,113,0.6)",fontSize:12,cursor:"pointer",fontWeight:500}}>Tout effacer</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {holdings.map((h,i)=>{
                      const pct=total>0?(h.amount/total*100):0;
                      const etf=DB[h.ticker];
                      const c=PALETTE[i%PALETTE.length];
                      const isEditing=editAmt[h.ticker]!==undefined;
                      return(
                        <div key={h.ticker} style={{padding:1.5,borderRadius:16,background:`linear-gradient(135deg,${c}30,${c}10)`,animation:`fadeUp .35s ${i*.04}s cubic-bezier(.16,1,.3,1) both`}}>
                          <div style={{background:"rgba(8,8,16,0.88)",borderRadius:14.5,padding:"13px 14px",display:"flex",alignItems:"center",gap:11}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0,boxShadow:`0 0 12px ${c}`}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                                <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{h.name}</span>
                                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:600,flexShrink:0}}>{pct.toFixed(1)}%</span>
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                {etf?.isin&&<span style={{fontSize:10,fontFamily:"'SF Mono',monospace",color:"rgba(255,255,255,0.25)",letterSpacing:.4}}>{etf.isin}</span>}
                                {etf&&<span style={{fontSize:9,color:ASSET_COLORS[etf.assetClass]||"#818cf8",fontWeight:700,background:`${ASSET_COLORS[etf.assetClass]||"#818cf8"}15`,padding:"1px 6px",borderRadius:4,letterSpacing:.3,flexShrink:0}}>{ASSET_LABELS[etf.assetClass]||etf.assetClass}</span>}

                              </div>
                            </div>
                            <input type="number" value={isEditing?editAmt[h.ticker]:h.amount}
                              onFocus={()=>setEditAmt(p=>({...p,[h.ticker]:String(h.amount)}))}
                              onChange={e=>setEditAmt(p=>({...p,[h.ticker]:e.target.value}))}
                              onBlur={()=>{updateAmount(h.ticker,editAmt[h.ticker]);setEditAmt(p=>{const n={...p};delete n[h.ticker];return n;});}}
                              style={{width:76,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"5px 8px",color:"#f1f5f9",fontSize:12,textAlign:"right",fontFamily:"monospace"}}/>
                            <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",flexShrink:0}}>€</span>
                            <button onClick={()=>removeHolding(h.ticker)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px",flexShrink:0,transition:"color .15s"}} onMouseEnter={e=>e.currentTarget.style.color="#f87171"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.15)"}>×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      <Toast msg={toast.msg} visible={toast.visible}/>
      <div style={{position:"fixed",bottom:80,left:"50%",transform:`translateX(-50%) translateY(${installToast?0:12}px)`,opacity:installToast?1:0,transition:"all .4s cubic-bezier(.16,1,.3,1)",background:"rgba(20,20,32,0.97)",border:"1px solid rgba(129,140,248,0.25)",borderRadius:20,padding:"12px 18px",zIndex:8999,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:"none",maxWidth:320,width:"calc(100% - 40px)"}}>
        <span style={{fontSize:20,flexShrink:0}}>📲</span>
        <div><div style={{fontSize:13,color:"#f1f5f9",fontWeight:600,marginBottom:2}}>Installer l'app</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>Partager → Sur l'écran d'accueil</div></div>
      </div>

      {/* Disclaimer banner */}
      {disclaimerSeen&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(8,8,16,0.95)",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"8px 20px",textAlign:"center",zIndex:40,backdropFilter:"blur(10px)"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.18)",letterSpacing:.3}}>À titre informatif — pas un conseil en investissement · <button onClick={()=>setDisclaimerSeen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",fontSize:10,cursor:"pointer",padding:0,textDecoration:"underline"}}>Revoir</button></span>
        </div>
      )}

      {/* Rec action modal */}
      {activeRec&&CAT[activeRec]&&(
        <SuggestionModal
          catalog={CAT[activeRec]}
          onSelect={ticker=>{
            // Switch to ETF tab and pre-fill
            setTab("ptf");
            setActiveRec(null);
          }}
          onClose={()=>setActiveRec(null)}
        />
      )}

      {/* Reset confirm */}
      {confirmReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:999,padding:"0 16px 40px"}}>
          <div style={{background:"#0e0e16",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:398,textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Effacer le portefeuille ?</div>
            <div style={{fontSize:13,color:"#94a3b8",marginBottom:24,lineHeight:1.65}}>Toutes vos positions seront supprimées. Irréversible.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{setHoldings([]);setConfirmReset(false);}} style={{background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:14,padding:"15px",color:"#fca5a5",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%"}}>Effacer tout</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"15px",color:"#f1f5f9",fontSize:15,cursor:"pointer",width:"100%"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
