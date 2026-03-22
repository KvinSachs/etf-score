import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

/* ─── FONTS ──────────────────────────────────────────────────────────────────── */
const FONTS = ``;

/* ─── DATA ───────────────────────────────────────────────────────────────────── */
const ISIN_MAP = {
  "IE00B4L5Y983":"IWDA","IE00B4L5YC18":"SWDA","FR0010315770":"MWRD",
  "IE00B6R52259":"ACWI","LU1681045370":"PAEEM","IE00BKM4GZ66":"EIMI",
  "US78462F1030":"SPY","US9229083632":"VOO","LU1681048804":"500",
  "US46090E1038":"QQQ","LU1681038243":"PANX","FR0011550185":"ESE",
  "LU1737652823":"EWLD","IE00B0M63177":"EEM","IE00BF4RFH31":"IUSN",
  "LU1681038672":"EPRA","IE00B945VV12":"VEUR","IE00B579F325":"SGLD",
  "IE00BDBRDM35":"AGGH","IE00B1XNHC34":"INRG","IE00B3F81R35":"IEAG",
  "IE00B5BMR087":"CSPX","LU1681041575":"MEUD","LU1681042773":"BCHN",
  "IE00B8GF1M35":"CBRE","LU1681043599":"MWRD","LU1681043086":"PAASI",
  "FR0011440478":"PAEMF","FR0013412038":"PCEU","FR0013411980":"PTPXE",
  "IE00BK5BQT80":"VWCE","IE00BFMXXD54":"VUAA","DE0002635307":"EXSA",
  "LU0908500753":"MEUD6","IE00BG47KH54":"VAGF","IE00B4WXJJ64":"XGLE",
  "FR0013412285":"PCPUS","FR0013412020":"PUST","LU1829220216":"PAASI2",
  "IE00B4L5YX21":"HMWO","IE00B5BMR087":"CSPX","LU1737652670":"RS2K",
  "IE00B3F81R35":"IEAG","IE00BYZK4776":"SPPW","LU1650490622":"LCWD",
  "FR0010959676":"CW8","IE00B42Z5J44":"CNDX","LU1829219669":"PANX2",
};

const DB = {
  "IWDA":{ name:"iShares Core MSCI World", isin:"IE00B4L5Y983", p:"iShares", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"SWDA":99,"MWRD":98,"SPY":68,"VOO":68,"CSP1":68,"500":68,"ESE":68,"QQQ":42}},
  "SWDA":{ name:"iShares MSCI World Acc", isin:"IE00B4L5Y983", p:"iShares", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98}},
  "MWRD":{ name:"Amundi MSCI World", isin:"LU1681043599", p:"Amundi", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":98,"SWDA":98}},
  "EWLD":{ name:"Amundi MSCI All World", isin:"LU1792117779", p:"Amundi", assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3}, geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4}, sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"ACWI":97,"IWDA":85}},
  "ACWI":{ name:"iShares MSCI ACWI", isin:"IE00B6R52259", p:"iShares", assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3}, geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4}, sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"EWLD":97}},
  "PAEEM":{ name:"Amundi MSCI Emerging Markets", isin:"LU1681045370", p:"Amundi", assetClass:"equity", currencies:{CNY:32,TWD:16,INR:15,KRW:12,BRL:6,Autres:19}, geo:{"Chine":32,"Taiwan":16,"Inde":15,"Corée du Sud":12,"Brésil":6,"Autres EM":19}, sec:{"Technologie":28,"Finance":22,"Conso. discr.":12,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":4}, overlaps:{"EIMI":95}},
  "EIMI":{ name:"iShares Core MSCI EM IMI", isin:"IE00BKM4GZ66", p:"iShares", assetClass:"equity", currencies:{CNY:28,TWD:18,INR:16,KRW:12,BRL:5,Autres:21}, geo:{"Chine":28,"Taiwan":18,"Inde":16,"Corée du Sud":12,"Brésil":5,"Autres EM":21}, sec:{"Technologie":29,"Finance":21,"Conso. discr.":11,"Télécom":10,"Énergie":7,"Matériaux":7,"Industrie":6,"Santé":4,"Conso. cour.":5}, overlaps:{"PAEEM":95}},
  "SPY":{ name:"SPDR S&P 500", isin:"US78462F1030", p:"SPDR", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"VOO":99,"CSP1":99,"500":99,"ESE":99,"IWDA":68}},
  "VOO":{ name:"Vanguard S&P 500", isin:"US9229083632", p:"Vanguard", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"CSP1":99,"500":99,"ESE":99}},
  "CSP1":{ name:"iShares Core S&P 500", isin:"IE00B5BMR087", p:"iShares", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"500":99,"ESE":99}},
  "500":{ name:"Amundi S&P 500", isin:"LU1681048804", p:"Amundi", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"CSP1":99,"ESE":99}},
  "ESE":{ name:"BNP Paribas Easy S&P 500", isin:"FR0011550185", p:"BNP Paribas", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"CSP1":99,"500":99}},
  "QQQ":{ name:"Invesco NASDAQ-100", isin:"US46090E1038", p:"Invesco", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"PANX":99}},
  "PANX":{ name:"Amundi NASDAQ-100", isin:"LU1681038243", p:"Amundi", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"QQQ":99}},
  "IUSN":{ name:"iShares MSCI World Small Cap", isin:"IE00BF4RFH31", p:"iShares", assetClass:"equity", currencies:{USD:58,EUR:18,JPY:10,GBP:7,Autres:7}, geo:{"Amér. du Nord":58,"Europe":18,"Japon":10,"Asie-Pac.":7,"Autres":7}, sec:{"Industrie":20,"Finance":16,"Technologie":15,"Santé":12,"Conso. discr.":11,"Matériaux":8,"Conso. cour.":6,"Immobilier":5,"Énergie":4,"Télécom":2,"Services pub.":1}, overlaps:{"IWDA":8}},
  "VEUR":{ name:"Vanguard FTSE Developed Europe", isin:"IE00B945VV12", p:"Vanguard", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"MEUD":96,"PCEU":95}},
  "MEUD":{ name:"Amundi MSCI Europe", isin:"LU1681041575", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"VEUR":96,"PCEU":95}},
  "PCEU":{ name:"Amundi PEA MSCI Europe", isin:"FR0013412038", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":22,"France":15,"Suisse":14,"Allemagne":13,"Pays-Bas":8,"Autres EU":28}, sec:{"Finance":18,"Santé":15,"Industrie":14,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":8,"Énergie":7,"Télécom":6,"Technologie":6,"Services pub.":4,"Immobilier":2}, overlaps:{"VEUR":95,"MEUD":95}},
  "PTPXE":{ name:"Amundi PEA Japan TOPIX", isin:"FR0013411980", p:"Amundi", assetClass:"equity", currencies:{JPY:100}, geo:{"Japon":100}, sec:{"Industrie":22,"Finance":14,"Conso. discr.":13,"Technologie":11,"Matériaux":9,"Santé":8,"Conso. cour.":7,"Énergie":4,"Télécom":4,"Immobilier":4,"Services pub.":4}, overlaps:{}},
  "PAEMF":{ name:"Amundi PEA Marchés Émergents EMEA", isin:"FR0011440478", p:"Amundi", assetClass:"equity", currencies:{ZAR:15,AED:12,EGP:10,QAR:8,KWD:7,NGN:6,Autres:42}, geo:{"Afrique du Sud":15,"Émirats Arabes":12,"Égypte":10,"Qatar":8,"Koweït":7,"Nigeria":6,"Autres EMEA":42}, sec:{"Finance":28,"Matériaux":18,"Énergie":14,"Télécom":12,"Conso. discr.":10,"Industrie":8,"Autres":10}, overlaps:{}},
  "EPRA":{ name:"Amundi FTSE EPRA Nareit", isin:"LU1681038672", p:"Amundi", assetClass:"real_estate", currencies:{USD:55,JPY:10,AUD:8,GBP:7,Autres:20}, geo:{"Amér. du Nord":55,"Japon":10,"Australie":8,"Royaume-Uni":7,"Autres":20}, sec:{"Immobilier":100}, overlaps:{"CBRE":75}},
  "CBRE":{ name:"iShares Global REIT", isin:"IE00B8GF1M35", p:"iShares", assetClass:"real_estate", currencies:{USD:65,JPY:10,AUD:8,SGD:5,Autres:12}, geo:{"Amér. du Nord":65,"Japon":10,"Australie":8,"Singapour":5,"Autres":12}, sec:{"Immobilier":100}, overlaps:{"EPRA":75}},
  "SGLD":{ name:"Invesco Physical Gold", isin:"IE00B579F325", p:"Invesco", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{}},
  "AGGH":{ name:"iShares Global Aggregate Bond", isin:"IE00BDBRDM35", p:"iShares", assetClass:"bond", currencies:{USD:40,EUR:30,JPY:15,Autres:15}, geo:{"Amér. du Nord":40,"Europe":30,"Japon":15,"Autres":15}, sec:{"Oblig. souv.":60,"Oblig. corp.":30,"Autres":10}, overlaps:{"IEAG":35}},
  /* ── MONDE / ALL WORLD ───────────────────────────────────────────────────── */
  "VWCE":{ name:"Vanguard FTSE All-World Acc", isin:"IE00BK5BQT80", p:"Vanguard", assetClass:"equity", currencies:{USD:62,EUR:13,JPY:5,GBP:4,CNY:4,KRW:2,TWD:3,INR:4,Autres:3}, geo:{"Amér. du Nord":62,"Europe":13,"Japon":5,"Asie-Pac.":4,"Émergents":12,"Autres":4}, sec:{"Technologie":23,"Finance":16,"Santé":12,"Industrie":10,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":5,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"EWLD":97,"IWDA":85,"ACWI":96}},
  "CW8":{ name:"Amundi MSCI World UCITS ETF", isin:"FR0010959676", p:"Amundi", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98,"SWDA":99}},
  "HMWO":{ name:"HSBC MSCI World UCITS ETF", isin:"IE00B4L5YX21", p:"HSBC", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98}},
  "LCWD":{ name:"Lyxor Core MSCI World UCITS ETF", isin:"LU1650490622", p:"Lyxor", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98}},
  "SPPW":{ name:"SPDR MSCI World UCITS ETF", isin:"IE00BYZK4776", p:"SPDR", assetClass:"equity", currencies:{USD:70,EUR:16,JPY:6,GBP:4,CHF:4}, geo:{"Amér. du Nord":70,"Europe":16,"Japon":6,"Asie-Pac.":5,"Autres":3}, sec:{"Technologie":24,"Finance":16,"Santé":13,"Industrie":11,"Conso. discr.":10,"Conso. cour.":7,"Énergie":5,"Matériaux":4,"Télécom":4,"Immobilier":3,"Services pub.":3}, overlaps:{"IWDA":99,"MWRD":98}},

  /* ── S&P 500 / US ──────────────────────────────────────────────────────── */
  "VUAA":{ name:"Vanguard S&P 500 UCITS ETF Acc", isin:"IE00BFMXXD54", p:"Vanguard", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"CSP1":99,"500":99,"ESE":99,"PCPUS":99}},
  "CSPX":{ name:"iShares Core S&P 500 UCITS ETF", isin:"IE00B5BMR087", p:"iShares", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"500":99,"ESE":99,"VUAA":99}},

  /* ── NASDAQ ──────────────────────────────────────────────────────────────── */
  "CNDX":{ name:"iShares NASDAQ-100 UCITS ETF", isin:"IE00B42Z5J44", p:"iShares", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"QQQ":99,"PANX":99,"PUST":99}},

  /* ── EUROPE ──────────────────────────────────────────────────────────────── */
  "EXSA":{ name:"iShares STOXX Europe 600 UCITS ETF", isin:"DE0002635307", p:"iShares", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":18,"France":16,"Suisse":14,"Allemagne":14,"Pays-Bas":8,"Suède":5,"Espagne":4,"Autres EU":21}, sec:{"Finance":17,"Santé":15,"Industrie":15,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":7,"Énergie":7,"Télécom":6,"Technologie":7,"Services pub.":4,"Immobilier":2}, overlaps:{"MEUD":85,"VEUR":85,"PCEU":85}},
  "MEUD6":{ name:"Amundi Core STOXX Europe 600 UCITS ETF", isin:"LU0908500753", p:"Amundi", assetClass:"equity", currencies:{EUR:55,GBP:22,CHF:14,SEK:5,Autres:4}, geo:{"Royaume-Uni":18,"France":16,"Suisse":14,"Allemagne":14,"Pays-Bas":8,"Suède":5,"Espagne":4,"Autres EU":21}, sec:{"Finance":17,"Santé":15,"Industrie":15,"Conso. cour.":12,"Matériaux":8,"Conso. discr.":7,"Énergie":7,"Télécom":6,"Technologie":7,"Services pub.":4,"Immobilier":2}, overlaps:{"EXSA":95,"MEUD":85,"VEUR":85}},

  /* ── ETF PEA AMUNDI ───────────────────────────────────────────────────────── */
  "PCPUS":{ name:"Amundi PEA S&P 500 UCITS ETF", isin:"FR0013412285", p:"Amundi", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Technologie":29,"Finance":13,"Santé":13,"Conso. discr.":11,"Industrie":9,"Conso. cour.":6,"Énergie":5,"Matériaux":3,"Télécom":4,"Immobilier":2,"Services pub.":2,"Autres":3}, overlaps:{"SPY":99,"VOO":99,"CSP1":99,"500":99,"VUAA":99}},
  "PUST":{ name:"Amundi PEA Nasdaq-100 UCITS ETF", isin:"FR0013412020", p:"Amundi", assetClass:"equity", currencies:{USD:97,Autres:3}, geo:{"Amér. du Nord":97,"Autres":3}, sec:{"Technologie":50,"Conso. discr.":16,"Santé":7,"Finance":5,"Industrie":5,"Télécom":5,"Conso. cour.":4,"Énergie":1,"Autres":7}, overlaps:{"QQQ":99,"PANX":99,"CNDX":99}},

  /* ── OBLIGATIONS ──────────────────────────────────────────────────────────── */
  "VAGF":{ name:"Vanguard Global Aggregate Bond UCITS ETF", isin:"IE00BG47KH54", p:"Vanguard", assetClass:"bond", currencies:{USD:40,EUR:30,JPY:15,Autres:15}, geo:{"Amér. du Nord":40,"Europe":30,"Japon":15,"Autres":15}, sec:{"Oblig. souv.":60,"Oblig. corp.":30,"Autres":10}, overlaps:{"AGGH":90}},
  "XGLE":{ name:"iShares Euro Govt Bond UCITS ETF", isin:"IE00B4WXJJ64", p:"iShares", assetClass:"bond", currencies:{EUR:100}, geo:{"Europe":100}, sec:{"Oblig. souv.":100}, overlaps:{"IEAG":60}},

  /* ── SMALL CAPS ───────────────────────────────────────────────────────────── */
  "RS2K":{ name:"Lyxor Russell 2000 UCITS ETF", isin:"LU1737652670", p:"Lyxor", assetClass:"equity", currencies:{USD:100}, geo:{"Amér. du Nord":100}, sec:{"Finance":17,"Santé":15,"Industrie":18,"Technologie":13,"Conso. discr.":11,"Énergie":6,"Matériaux":4,"Immobilier":7,"Conso. cour.":4,"Autres":5}, overlaps:{}},

  "IEAG":{ name:"iShares Euro Aggregate Bond", isin:"IE00B3F81R35", p:"iShares", assetClass:"bond", currencies:{EUR:90,Autres:10}, geo:{"Europe":90,"Autres":10}, sec:{"Oblig. souv.":70,"Oblig. corp.":25,"Autres":5}, overlaps:{"AGGH":35}},
};

const STORAGE_KEY = "etf-portfolio-v2";

/* ─── SCORING (identical logic) ─────────────────────────────────────────────── */
function hhi(obj){const t=Object.values(obj).reduce((a,b)=>a+b,0);if(!t)return 1;return Object.values(obj).reduce((s,v)=>s+Math.pow(v/t,2),0);}
function hhiToScore(h,n){const mn=1/n,norm=(h-mn)/(1-mn);return Math.max(0,1-Math.pow(Math.max(0,norm),0.75));}
function geoScore(m){if(!Object.keys(m).length)return 0;const devW=(m["Amér. du Nord"]||0)/100+["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(m[k]||0)/100,0)+(m["Japon"]||0)/100;const n=Math.max(Object.values(m).filter(v=>v>2).length,Object.keys(m).length,6);const base=hhiToScore(hhi(m),n);const devPenalty=devW<0.20?(0.20-devW)*2.5:0;const maxSingle=Math.max(...Object.values(m))/100;const concPenalty=maxSingle>0.70?(maxSingle-0.70)*1.5:0;return Math.max(0,base-devPenalty-concPenalty);}
function sectorScore(m){if(!Object.keys(m).length)return 0;const n=Math.max(Object.values(m).filter(v=>v>2).length,Object.keys(m).length,8);const base=hhiToScore(hhi(m),n);const maxSec=Math.max(...Object.values(m))/100;const concPenalty=maxSec>0.40?(maxSec-0.40)*1.8:0;return Math.max(0,base-concPenalty);}
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

/* ─── RECS & POSITIVE (identical logic) ─────────────────────────────────────── */
function buildPositive(scores,holdings){
  const p=[],{classes}=scores,bondPct=classes["bond"]||0,commPct=classes["commodity"]||0,n=holdings.length;
  if(!n)return[];
  if(n===1)p.push("Excellent départ — un ETF diversifié mondial couvre déjà des centaines d'entreprises à moindre coût.");
  if(n>=2)p.push("Bonne démarche — votre portefeuille multi-ETF reflète une vraie stratégie de diversification.");
  if(n>=3)p.push("Avec "+n+" ETF complémentaires, vous avez construit une base solide.");
  if(scores.geo>=14)p.push("Diversification géographique excellente.");
  if(scores.sector>=14)p.push("Secteurs bien équilibrés — pas de dépendance à une seule industrie.");
  if(scores.overlap>=18)p.push("Aucun chevauchement significatif — chaque ETF apporte de la valeur.");
  if(bondPct>=15)p.push("Bonne allocation obligataire — votre portefeuille résistera mieux aux krachs.");
  if(scores.total>=16)p.push("Score global exceptionnel. Portefeuille parmi les mieux diversifiés.");
  return p.slice(0,2);
}

function buildRecs(scores,holdings,total){
  const recs=[],{geoMap,secMap,classes,currencies}=scores,tickers=new Set(holdings.map(h=>h.ticker));
  const bondPct=classes["bond"]||0,rePct=classes["real_estate"]||0,commPct=classes["commodity"]||0,equityPct=classes["equity"]||0;
  const usW=geoMap["Amér. du Nord"]||0,emW=["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const devW=usW+(["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(geoMap[k]||0),0))+(geoMap["Japon"]||0);
  const tW=secMap["Technologie"]||0,usdW=currencies["USD"]||0;
  const commPctR=commPct,rePctR=rePct,bondPctR=bondPct,equityPctR=equityPct;
  for(let i=0;i<holdings.length;i++)for(let j=i+1;j<holdings.length;j++){const a=holdings[i],b=holdings[j],eA=DB[a.ticker],eB=DB[b.ticker];if(!eA||!eB)continue;const ov=eA.overlaps?.[b.ticker]||0;if(ov>=90)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Chevauchement critique",text:`${a.ticker} et ${b.ticker} se recoupent à ${ov}% — doublon inutile. Conservez un seul des deux.`});else if(ov>=60)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",title:"Chevauchement élevé",text:`${a.ticker} et ${b.ticker} partagent ~${ov}% de leurs sous-jacents.`});}
  if(bondPct===0&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.5)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.08)",cat:"bonds",title:"Portefeuille 100% actions",text:"C'est un choix valide, notamment sur un horizon long terme. Des obligations réduiraient la volatilité si vous souhaitez sécuriser une partie du capital."});
  else if(bondPct<15&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"bonds",title:"Faible exposition obligataire",text:`${bondPct.toFixed(0)}% seulement. Une allocation de 20-25% améliorerait la résilience.`});
  if(devW<20&&holdings.length>0)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"world",title:"Marchés développés absents",text:`Seulement ${devW.toFixed(0)}% en marchés développés (US, Europe, Japon) qui représentent ~80% de la capitalisation mondiale.`});
  else if(usW>80)recs.push({priority:"high",level:"essential",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"europe",title:"Concentration US excessive",text:`${usW.toFixed(0)}% en Amérique du Nord. Ajoutez de l'Europe ou des émergents.`});
  if(tW>35)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Surexposition technologie",text:`${tW.toFixed(0)}% en Tech — très sensible aux taux et aux rotations sectorielles.`});
  if(commPctR>25)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"gold",title:"Surexposition matières premières",text:`${commPctR.toFixed(0)}% en matières premières. Au-delà de 15% la volatilité augmente sans rendement garanti.`});
  else if(commPctR>15)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"gold",title:"Or/matières premières élevé",text:`${commPctR.toFixed(0)}% — une allocation de 5-10% est recommandée comme couverture.`});
  if(rePctR>30)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"realestate",title:"Surexposition immobilier",text:`${rePctR.toFixed(0)}% en immobilier coté. Les REITs sont très sensibles aux hausses de taux.`});
  if(emW<8&&devW>=20&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.5)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.08)",cat:"emerging",title:"Émergents sous-représentés",text:`${emW.toFixed(0)}% en marchés émergents qui représentent ~40% du PIB mondial.`});
  if(commPct===0&&holdings.length>=2)recs.push({priority:"low",level:"advanced",color:"rgba(255,255,255,0.4)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.06)",cat:"gold",title:"Or absent",text:"5-10% d'or protège contre l'inflation et les crises systémiques."});
  if(rePct===0&&holdings.length>=2)recs.push({priority:"low",level:"advanced",color:"rgba(255,255,255,0.4)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.06)",cat:"realestate",title:"Immobilier absent",text:"Les REITs offrent revenus réguliers et décorrélation partielle."});
  if(usdW>80)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.5)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.08)",cat:"eurobonds",title:"Risque USD élevé",text:`${usdW.toFixed(0)}% USD. Une dépréciation du dollar impacte vos rendements en euros.`});
  if(scores.overlap<10&&holdings.length>1)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Chevauchements massifs",text:`Score chevauchement : ${scores.overlap.toFixed(1)}/20. Vous payez des frais en doublon sans gain de diversification.`});
  if(bondPctR>60)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.5)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.08)",cat:"emerging",title:"Portefeuille très obligataire",text:`${bondPctR.toFixed(0)}% en obligations. Rendement long terme limité — rééquilibrez vers les actions.`});
  if(scores.currency<8&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.4)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.06)",cat:"eurobonds",title:"Dépendance monétaire",text:`Score devises : ${scores.currency.toFixed(1)}/20. Forte concentration sur une devise.`});
  if(scores.assetClass<8&&holdings.length>1)recs.push({priority:"medium",level:"advanced",color:"rgba(255,255,255,0.4)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.06)",cat:"bonds",title:"Classes d'actifs déséquilibrées",text:`Score : ${scores.assetClass.toFixed(1)}/20. Combinez actions, obligations, immobilier et or.`});
  if(equityPctR>95&&holdings.length===1)recs.push({priority:"low",level:"advanced",color:"rgba(255,255,255,0.4)",bg:"rgba(255,255,255,0.03)",border:"rgba(255,255,255,0.06)",cat:"bonds",title:"Portefeuille mono-ETF",text:"Bonne base. Ajouter obligations et or renforcerait la résilience."});
  if(scores.total>=16)recs.push({priority:"success",level:"essential",color:"#0ecb81",bg:"rgba(14,203,129,0.06)",border:"rgba(14,203,129,0.15)",title:"Excellent portefeuille",text:"Diversification optimale. Maintenez et rééquilibrez périodiquement."});
  const order={high:0,medium:1,low:2,success:3};
  return recs.sort((a,b)=>order[a.priority]-order[b.priority]).slice(0,8);
}

/* ─── SUGGESTION CATALOG ─────────────────────────────────────────────────────── */
const CAT={
  world:{title:"ETF Monde",emoji:"🌍",color:"#0ecb81",why:"Un ETF Monde est la brique de base idéale — exposition à des milliers d'entreprises mondiales en un seul produit.",options:[
    {ticker:"MWRD",label:"Monde développé · Amundi",desc:"Équivalent IWDA, frais très compétitifs. Domicilié Luxembourg.",ter:"0.12%",tags:["✅ Éligible PEA","💰 Le moins cher"]},
    {ticker:"VWCE",label:"All World · Vanguard",desc:"Monde développé + émergents. ~3 600 entreprises. Le favori européen.",ter:"0.22%",tags:["⭐ Le plus populaire EU","🌐 Monde + EM"]},
    {ticker:"IWDA",label:"Monde développé · iShares",desc:"La référence mondiale. 1 600 entreprises, 23 pays développés.",ter:"0.20%",tags:["💧 Très liquide","🏦 Référence mondiale"]},
    {ticker:"EWLD",label:"Monde entier · Amundi",desc:"Pays développés + marchés émergents. Éligible PEA.",ter:"0.38%",tags:["✅ Éligible PEA","🌐 Monde complet"]},
  ]},
  bonds:{title:"Obligations",emoji:"🔒",color:"#0ecb81",why:"Les obligations amortissent la volatilité et protègent lors des krachs actions.",options:[
    {ticker:"IEAG",label:"Obligations euro · iShares",desc:"Souveraines et corporate en euros. Zéro risque de change.",ter:"0.09%",tags:["💰 Le moins cher","🇪🇺 Zéro risque €"]},
    {ticker:"VAGF",label:"Global Aggregate couvert · Vanguard",desc:"Obligations mondiales couvertes en euros — très diversifié.",ter:"0.10%",tags:["🌍 Le plus diversifié","💧 Liquide"]},
    {ticker:"AGGH",label:"Global Aggregate · iShares",desc:"Obligations du monde entier, couvertes en euros.",ter:"0.10%",tags:["🌍 Diversifié","🏦 iShares"]},
    {ticker:"XGLE",label:"Govt Bond Euro · iShares",desc:"Obligations souveraines européennes uniquement — risque minimal.",ter:"0.09%",tags:["🏛️ Souveraines","🇪🇺 Euro pur"]},
  ]},
  gold:{title:"Or",emoji:"✨",color:"#f0b90b",why:"5-10% d'or protège contre l'inflation et les crises systémiques.",options:[
    {ticker:"SGLD",label:"Or physique · Invesco",desc:"Or physique en coffre à Londres. Meilleur choix pour les investisseurs européens.",ter:"0.12%",tags:["💰 Le moins cher","🏦 Or physique"]},
  ]},
  realestate:{title:"Immobilier coté",emoji:"🏢",color:"#f0b90b",why:"Les REITs offrent revenus réguliers et décorrélation partielle des actions.",options:[
    {ticker:"EPRA",label:"Immobilier mondial · Amundi",desc:"Foncières cotées mondiales — bonne exposition Europe et Asie.",ter:"0.24%",tags:["✅ Éligible PEA"]},
    {ticker:"CBRE",label:"REITs mondiaux · iShares",desc:"Sociétés immobilières cotées dans le monde entier.",ter:"0.25%",tags:["🌍 Plus diversifié"]},
  ]},
  europe:{title:"Actions Europe",emoji:"🇪🇺",color:"#3b82f6",why:"Rééquilibre la pondération US et expose aux secteurs défensifs européens.",options:[
    {ticker:"PCEU",label:"Europe PEA · Amundi",desc:"Grandes entreprises européennes, domicilié en France.",ter:"0.15%",tags:["✅ Éligible PEA","💰 Le moins cher"]},
    {ticker:"EXSA",label:"STOXX Europe 600 · iShares",desc:"600 grandes entreprises européennes — le plus large indice Europe.",ter:"0.20%",tags:["📊 600 entreprises","💧 Très liquide"]},
    {ticker:"MEUD",label:"Europe · Amundi",desc:"Même exposition MSCI Europe, compte-titres.",ter:"0.12%",tags:["💰 Frais bas"]},
    {ticker:"VEUR",label:"Europe · Vanguard",desc:"UK, France, Suisse, Allemagne — très liquide.",ter:"0.10%",tags:["💧 Très liquide"]},
  ]},
  emerging:{title:"Marchés émergents",emoji:"📈",color:"#a78bfa",why:"Les émergents = ~40% du PIB mondial, souvent absents des portefeuilles.",options:[
    {ticker:"PAEEM",label:"Émergents · Amundi",desc:"Chine, Inde, Taiwan, Brésil — grandes capitalisations.",ter:"0.20%",tags:["✅ Éligible PEA","⭐ Le plus populaire"]},
    {ticker:"EIMI",label:"Émergents étendu · iShares",desc:"Chine, Inde, Taiwan + mid et small caps.",ter:"0.18%",tags:["💰 Le moins cher"]},
  ]},
  smallcaps:{title:"Petites capitalisations",emoji:"🔬",color:"#a78bfa",why:"Prime de rendement historique — complément idéal à un ETF large caps.",options:[
    {ticker:"IUSN",label:"Small caps mondiales · iShares",desc:"Diversifie sur les petites entreprises mondiales.",ter:"0.35%",tags:["🌍 Le plus diversifié"]},
  ]},
  eurobonds:{title:"Obligations euro",emoji:"💶",color:"#0ecb81",why:"Forte exposition USD détectée — les obligations en euros éliminent le risque de change.",options:[
    {ticker:"IEAG",label:"Obligations euro · iShares",desc:"Souveraines et corporate en euros. Risque de change nul.",ter:"0.09%",tags:["💰 Le moins cher","🇪🇺 Zéro risque €"]},
  ]},
};

function buildSuggestions(scores,holdings){
  const keys=[],{classes,geoMap,currencies}=scores,tickers=new Set(holdings.map(h=>h.ticker));
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
  return[...new Set(keys)].slice(0,4).map(k=>({key:k,...CAT[k]}));
}

const REC_ICONS={
  bond: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><line x1="5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  gold: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="9,2 11.5,7 17,7.5 13,11.5 14.5,17 9,14 3.5,17 5,11.5 1,7.5 6.5,7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  geo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="9" cy="9" rx="3" ry="7" stroke="currentColor" strokeWidth="1.3"/><line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.3"/></svg>,
  overlap: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="9" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="9" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  sector: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 9 L9 2 A7 7 0 0 1 16 9 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/></svg>,
  building: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M6 16V11h6v5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M3 8h12" stroke="currentColor" strokeWidth="1.3"/><rect x="7" y="2" width="4" height="3" rx=".5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  currency: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5v8M7 6.5h3a1.5 1.5 0 0 1 0 3H8a1.5 1.5 0 0 0 0 3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 2h6v7a3 3 0 0 1-6 0V2Z" stroke="currentColor" strokeWidth="1.3"/><path d="M3 4H6M15 4h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 12v3M6 16h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

const ASSET_LABELS={equity:"Actions",bond:"Obligations",real_estate:"Immobilier",commodity:"Matières prem."};
const ASSET_COLORS={equity:"rgba(255,255,255,0.7)",bond:"#0ecb81",real_estate:"#f0b90b",commodity:"#f0b90b"};

/* ─── SCORE COLOR (TR style) ─────────────────────────────────────────────────── */
function sc(s){
  if(s>=15)return{stroke:"#0ecb81",text:"#0ecb81",glow:"rgba(14,203,129,0.25)",label:"Excellent"};
  if(s>=10)return{stroke:"#f0b90b",text:"#f0b90b",glow:"rgba(240,185,11,0.25)",label:"Correct"};
  if(s>= 5)return{stroke:"#ff9500",text:"#ff9500",glow:"rgba(255,149,0,0.25)",label:"Faible"};
  return          {stroke:"#ff4d4d",text:"#ff4d4d",glow:"rgba(255,77,77,0.25)",label:"Critique"};
}

/* ─── LIQUID GLASS SURFACE ───────────────────────────────────────────────────── */
function Glass({children,style={},onClick}){
  return(
    <div onClick={onClick} style={{
      background:"rgba(255,255,255,0.05)",
      border:"0.5px solid rgba(255,255,255,0.1)",
      borderRadius:20,
      position:"relative",
      ...style
    }}>
      {/* Top sheen */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",pointerEvents:"none",borderRadius:"20px 20px 0 0"}}/>
      {children}
    </div>
  );
}

/* ─── SCORE ARC ──────────────────────────────────────────────────────────────── */
function ScoreArc({value,label,size=150}){
  const r=size/2-12,circ=2*Math.PI*r,g=sc(value),id=`a${label.replace(/\W/g,"")}`;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flex:1}}>
      <div style={{position:"relative",width:size,height:size}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle at center,${g.glow} 0%,transparent 65%)`,pointerEvents:"none"}}/>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"relative"}}>
          <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={g.stroke} stopOpacity="0.4"/><stop offset="100%" stopColor={g.stroke}/></linearGradient></defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth="6"
            strokeDasharray={`${(value/20)*circ} ${(1-value/20)*circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)",filter:`drop-shadow(0 0 6px ${g.stroke})`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
          <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:34,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-1}}>{value.toFixed(1)}</span>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:2,marginTop:2}}>/20</span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:.5}}>{label}</div>
        {value>0&&<div style={{fontSize:10,color:g.text,marginTop:2}}>{g.label}</div>}
      </div>
    </div>
  );
}

/* ─── MINI SCORE BAR ─────────────────────────────────────────────────────────── */
function MiniBar({label,value,weight}){
  const g=sc(value);
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",width:114,flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:2,background:"rgba(255,255,255,0.06)",borderRadius:1,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(value/20)*100}%`,background:g.stroke,borderRadius:1,transition:"width .8s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 6px ${g.stroke}`}}/>
      </div>
      <span style={{fontSize:12,color:g.text,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontWeight:700,width:30,textAlign:"right"}}>{value.toFixed(1)}</span>
      <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",width:28,textAlign:"right"}}>{weight}</span>
    </div>
  );
}

/* ─── BAR CHART ──────────────────────────────────────────────────────────────── */
const BARS=["#0ecb81","rgba(255,255,255,0.7)","#f0b90b","#3b82f6","#a78bfa","#38bdf8","#ff9500","rgba(255,255,255,0.5)","#0ecb81","#f0b90b"];
const SECTOR_INFO={"Technologie":"Logiciels, semi-conducteurs, cloud.","Finance":"Banques, assurances, gestion d'actifs.","Santé":"Pharma, biotech, dispositifs médicaux.","Industrie":"Fabrication, aérospatiale, transports.","Conso. discr.":"Mode, automobile, loisirs, e-commerce.","Conso. cour.":"Alimentation, hygiène — produits essentiels.","Énergie":"Pétrole, gaz, renouvelables.","Matériaux":"Métaux, mines, chimie.","Télécom":"Opérateurs, câble, internet.","Immobilier":"REITs et foncières cotées.","Services pub.":"Électricité, gaz, eau.","Oblig. souv.":"Obligations d'États.","Oblig. corp.":"Obligations d'entreprises.","Or":"Valeur refuge contre l'inflation."};
const GEO_INFO={"Amér. du Nord":"États-Unis et Canada — marchés les plus profonds.","Europe":"UE + UK, Suisse — économies matures.","Japon":"3ème économie mondiale.","Asie-Pac.":"Australie, NZ, Singapour.","Émergents":"Chine, Inde, Brésil — fort potentiel.","Chine":"2ème économie, risque réglementaire.","Inde":"Fort potentiel de croissance.","Taiwan":"Leader semi-conducteurs (TSMC).","Corée du Sud":"Samsung, Hyundai.","Brésil":"Plus grande économie d'Amérique latine.","Autres EM":"Mexique, Indonésie, Thaïlande…","Royaume-Uni":"Finance, énergie post-Brexit.","France":"Luxe, énergie, aéronautique.","Suisse":"Pharma et luxe — très défensif.","Allemagne":"Industrie automobile.","Pays-Bas":"ASML, logistique.","Autres EU":"Espagne, Italie, Suède…","Australie":"Matières premières.","Singapour":"Hub financier asiatique.","Autres Asie":"Marchés émergents asiatiques.","Global":"Exposition mondiale.","Autres":"Autres régions.","Afrique du Sud":"Plus grande économie d'Afrique.","Émirats Arabes":"Hub financier du Moyen-Orient.","Égypte":"Marché émergent d'Afrique du Nord.","Qatar":"Énergie et finance.","Koweït":"Marché pétrolier du Golfe.","Nigeria":"Plus grande économie d'Afrique subsaharienne.","Autres EMEA":"Autres marchés émergents Europe-Afrique-Moyen-Orient."};

function InfoModal({label,text,onClose}){
  useEffect(()=>{const f=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",f);return()=>document.removeEventListener("keydown",f);},[onClose]);
  return createPortal(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 16px 32px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(18,18,18,0.95)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:"24px 24px 0 0",padding:"12px 20px 24px",width:"100%",maxWidth:430,minHeight:"50vh",animation:"up .28s cubic-bezier(.16,1,.3,1)",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/></div>
        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>{label}</div>
        <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>{text}</p>
      </div>
    </div>
  , document.body);
}
function IBtn({label,text}){const[s,ss]=useState(false);return(<><button onClick={()=>ss(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 0 5px",display:"inline-flex",alignItems:"center",opacity:.5}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/><text x="6" y="9.5" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7.5" fontFamily="system-ui" fontWeight="600">i</text></svg></button>{s&&<InfoModal label={label} text={text} onClose={()=>ss(false)}/>}</>);}

function ColorBars({data,title,infoMap={}}){
  const sorted=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,9);
  const max=sorted[0]?.[1]||1;
  return(
    <Glass>
      <div style={{padding:"20px 18px"}}>
        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.25)",letterSpacing:3,textTransform:"uppercase",marginBottom:18}}>{title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {sorted.map(([k,v],i)=>(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{k}</span>
                  {infoMap[k]&&<IBtn label={k} text={infoMap[k]}/>}
                </div>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,color:BARS[i%BARS.length],fontWeight:700}}>{v.toFixed(1)}%</span>
              </div>
              <div style={{height:2,background:"rgba(255,255,255,0.05)",borderRadius:1,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(v/max)*100}%`,background:BARS[i%BARS.length],borderRadius:1,transition:"width .8s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 8px ${BARS[i%BARS.length]}55`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Glass>
  );
}

/* ─── BOTTOM SHEET (shared) ──────────────────────────────────────────────────── */
function Sheet({children,onClose}){
  const ref=useRef(null);const startY=useRef(0);const curY=useRef(0);
  useEffect(()=>{const f=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",f);return()=>document.removeEventListener("keydown",f);},[onClose]);
  const onTS=e=>{startY.current=e.touches[0].clientY;};
  const onTM=e=>{const dy=e.touches[0].clientY-startY.current;if(dy>0&&ref.current){curY.current=dy;ref.current.style.transform=`translateY(${dy}px)`;}};
  const onTE=()=>{if(curY.current>80)onClose();else if(ref.current)ref.current.style.transform="translateY(0)";curY.current=0;};
  return createPortal(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div ref={ref} onClick={e=>e.stopPropagation()} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{background:"rgba(14,14,14,0.97)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,minHeight:"50vh",transition:"transform .2s cubic-bezier(.16,1,.3,1)",animation:"up .3s cubic-bezier(.16,1,.3,1)",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px",cursor:"grab"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.12)"}}/>
        </div>
        {children}
      </div>
    </div>
  , document.body);
}

/* ─── SUGGESTION SHEET ───────────────────────────────────────────────────────── */
function SuggestionSheet({catalog,onSelect,onClose}){
  return(
    <Sheet onClose={onClose}>
      <div style={{padding:"8px 20px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>{catalog.emoji}</span>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>{catalog.title}</span>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:28,height:28,color:"rgba(255,255,255,0.5)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <p style={{margin:"0 0 16px",fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.65,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>{catalog.why}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {catalog.options.map(opt=>(
            <button key={opt.ticker} onClick={()=>onSelect(opt.ticker)}
              style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 14px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,fontWeight:700,color:"#fff"}}>{DB[opt.ticker]?.name||opt.label.split(" · ")[0]}</span>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {opt.ter&&<span style={{fontSize:10,color:"#0ecb81",fontWeight:700,background:"rgba(14,203,129,0.1)",padding:"2px 6px",borderRadius:4}}>TER {opt.ter}</span>}
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>{opt.ticker}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>
                {opt.tags?.map((t,i)=><span key={i} style={{fontSize:10,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"2px 8px"}}>{t}</span>)}
              </div>
            </button>
          ))}
        </div>
        <p style={{margin:"12px 0 0",fontSize:9,color:"rgba(255,255,255,0.15)",textAlign:"center",letterSpacing:.3}}>Suggestions indicatives — d'autres ETF couvrent la même catégorie.</p>
      </div>
    </Sheet>
  );
}

/* ─── SEARCH ─────────────────────────────────────────────────────────────────── */
function Search({onAdd,suggestions=[]}){
  const[q,setQ]=useState(""),[amt,setAmt]=useState(""),[open,setOpen]=useState(false);
  const[hi,setHi]=useState(0),[err,setErr]=useState(""),[activeSug,setActiveSug]=useState(null);
  const[selectedTicker,setSelectedTicker]=useState(null);
  const ref=useRef(null),amtRef=useRef(null);
  useEffect(()=>{const f=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",f);return()=>document.removeEventListener("mousedown",f);},[]);
  const resolved=useMemo(()=>{if(selectedTicker)return selectedTicker;const u=q.trim().toUpperCase();if(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])return ISIN_MAP[u];return u;},[q,selectedTicker]);
  const results=useMemo(()=>{if(selectedTicker)return[];const u=q.trim().toUpperCase();if(u.length<1)return[];const s=(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])?ISIN_MAP[u]:u;return Object.entries(DB).filter(([t,e])=>t.includes(s)||e.name.toUpperCase().includes(s)||(e.isin&&e.isin.toUpperCase().includes(s))||e.p.toUpperCase().includes(s)).slice(0,5);},[q,selectedTicker]);
  const selectItem=(ticker,name)=>{setSelectedTicker(ticker);setQ(name);setOpen(false);setTimeout(()=>amtRef.current?.focus(),60);};
  const doAdd=()=>{const t=resolved,a=parseFloat(amt);if(!t){setErr("Saisissez un ETF");return;}if(!DB[t]){setErr("ETF introuvable — sélectionnez dans la liste");return;}if(isNaN(a)||a<=0){setErr("Montant invalide");return;}onAdd(t,a);setQ("");setAmt("");setErr("");setOpen(false);setSelectedTicker(null);};
  const onKey=e=>{if(!open||!results.length){if(e.key==="Enter")doAdd();return;}if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>Math.min(h+1,results.length-1));}else if(e.key==="ArrowUp"){e.preventDefault();setHi(h=>Math.max(h-1,0));}else if(e.key==="Enter"){e.preventDefault();const[t,e2]=results[hi];selectItem(t,e2.name);}else if(e.key==="Escape")setOpen(false);};
  const inp={width:"100%",background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color .2s",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"};
  return(
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{position:"relative"}}>
        <input value={q} onChange={e=>{setQ(e.target.value);setSelectedTicker(null);setErr("");setHi(0);setOpen(true);}}
          onFocus={e=>{if(!selectedTicker)setOpen(true);e.target.style.borderColor="rgba(255,255,255,0.25)";}}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
          onKeyDown={onKey} placeholder="Nom, ISIN ou ticker…" style={inp}/>
        {selectedTicker&&<button onMouseDown={()=>{setQ("");setSelectedTicker(null);setOpen(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:22,height:22,color:"rgba(255,255,255,0.5)",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>}
        {open&&results.length>0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:"rgba(14,14,14,0.97)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.8)"}}>
            {results.map(([t,e],i)=>(
              <div key={t} onMouseDown={()=>selectItem(t,e.name)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",background:i===hi?"rgba(255,255,255,0.05)":"transparent",borderBottom:"0.5px solid rgba(255,255,255,0.05)",transition:"background .1s"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:3}}>{e.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>{e.isin}</span>
                    <span style={{fontSize:10,color:ASSET_COLORS[e.assetClass]||"rgba(255,255,255,0.3)",fontWeight:500}}>· {ASSET_LABELS[e.assetClass]||e.assetClass}</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.15)",fontFamily:"monospace",marginLeft:"auto",flexShrink:0}}>{t}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {open&&q.length>=2&&!selectedTicker&&results.length===0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:"rgba(14,14,14,0.97)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px",textAlign:"center"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Aucun résultat pour « {q} »</div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10}}>
        <input ref={amtRef} type="number" value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
          onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.25)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
          placeholder="Montant (€)" style={{...inp,flex:1}}/>
        <button onClick={doAdd} style={{background:"#0ecb81",border:"none",borderRadius:14,padding:"14px 22px",color:"#000",fontSize:18,fontWeight:800,cursor:"pointer",flexShrink:0,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>+</button>
      </div>
      {err&&<div style={{fontSize:13,color:"#ff4d4d",padding:"10px 14px",background:"rgba(255,77,77,0.08)",border:"0.5px solid rgba(255,77,77,0.2)",borderRadius:10}}>{err}</div>}
      {suggestions.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:2}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:2.5,textTransform:"uppercase",fontWeight:700}}>Suggestions</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {suggestions.map(s=>(
              <button key={s.key} onClick={()=>setActiveSug(s.key)}
                style={{background:"rgba(255,255,255,0.04)",border:`0.5px solid rgba(255,255,255,0.1)`,borderRadius:20,padding:"7px 14px",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:6,transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}>
                <span>{s.emoji}</span><span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {activeSug&&<SuggestionSheet catalog={CAT[activeSug]} onSelect={t=>{selectItem(t,DB[t]?.name||t);setActiveSug(null);}} onClose={()=>setActiveSug(null)}/>}
    </div>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────────────── */
function Tabs({active,onChange,highlight=[]}){
  const icons={
    scores:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.2" strokeLinecap="round"/><circle cx="7.5" cy="7.5" r="1.8" fill="currentColor"/></svg>,
    geo:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="7.5" cy="7.5" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1.2"/><line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
    sec:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="7.5" width="3" height="6" rx=".8" fill="currentColor" opacity=".4"/><rect x="6" y="4.5" width="3" height="9" rx=".8" fill="currentColor" opacity=".7"/><rect x="10.5" y="1.5" width="3" height="12" rx=".8" fill="currentColor"/></svg>,
    ptf:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 10.5C3 10.5 3.5 6.5 6 6.5c2.5 0 2.5 2.5 5 2.5 1.5 0 2-3.5 3.5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return(
    <div style={{display:"flex",background:"rgba(255,255,255,0.03)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderRadius:16,padding:3,gap:2,border:"0.5px solid rgba(255,255,255,0.08)"}}>
      {[{id:"scores",label:"Scores"},{id:"geo",label:"Géo."},{id:"sec",label:"Secteurs"},{id:"ptf",label:"Mes ETF"}].map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,background:active===t.id?"rgba(255,255,255,0.08)":"transparent",border:active===t.id?"0.5px solid rgba(255,255,255,0.15)":"0.5px solid transparent",borderRadius:13,padding:"9px 4px",color:active===t.id?"#fff":"rgba(255,255,255,0.3)",fontSize:10,fontWeight:active===t.id?600:400,cursor:"pointer",transition:"all .2s",WebkitTapHighlightColor:"transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>
          {icons[t.id]}
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:3}}>
            <span style={{letterSpacing:.5}}>{t.label}</span>
            {highlight.includes(t.id)&&<div style={{width:4,height:4,borderRadius:"50%",background:"#0ecb81",animation:"pulse 2s infinite"}}/>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── DISCLAIMER ─────────────────────────────────────────────────────────────── */
function Disclaimer({onAccept}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"20px 16px"}}>
      <Glass style={{padding:"32px 24px",width:"100%",maxWidth:400}}>
        <div style={{marginBottom:20}}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.06)"/>
            <defs><linearGradient id="dl" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#0ecb81"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
            <line x1="14" y1="18" x2="34" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
            <line x1="24" y1="18" x2="24" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
            <line x1="18" y1="34" x2="30" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
            <path d="M14 18 Q11 22 14 26 Q17 22 14 18Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M34 18 Q31 22 34 26 Q37 22 34 18Z" fill="rgba(255,255,255,0.7)"/>
            <line x1="14" y1="18" x2="34" y2="18" stroke="url(#dl)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:18,fontWeight:800,color:"#fff",marginBottom:14,letterSpacing:-.3}}>À titre informatif uniquement</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.7,margin:"0 0 14px"}}>ETF Score est un outil d'analyse personnel. Les scores et suggestions <strong style={{color:"rgba(255,255,255,0.7)"}}>ne constituent pas un conseil en investissement</strong> au sens de la réglementation AMF.</p>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.7,margin:"0 0 28px"}}>Tout investissement comporte un risque de perte en capital.</p>
        <button onClick={onAccept} style={{width:"100%",background:"#0ecb81",border:"none",borderRadius:14,padding:"16px",color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",letterSpacing:.3,transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          J'ai compris, accéder à l'app
        </button>
      </Glass>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────────── */
function Toast({msg,visible}){
  return(
    <div style={{position:"fixed",bottom:80,left:"50%",transform:`translateX(-50%) translateY(${visible?0:12}px)`,opacity:visible?1:0,transition:"all .3s cubic-bezier(.16,1,.3,1)",background:"rgba(14,14,14,0.97)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"11px 18px",zIndex:9000,display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:"none",whiteSpace:"nowrap"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:"#0ecb81",boxShadow:"0 0 8px #0ecb81",flexShrink:0}}/>
      <span style={{fontSize:13,color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif"}}>{msg}</span>
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
  const[recMode,setRecMode]=useState("essential");
  const toastTimer=useRef(null);

  useEffect(()=>{
    try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const p=JSON.parse(raw);if(p.holdings)setHoldings(p.holdings);if(p.disclaimerSeen)setDisclaimerSeen(true);if(p.savedAt)setSavedAt(new Date(p.savedAt));}}catch(_){}
    setReady(true);
    const standalone=window.navigator.standalone||window.matchMedia("(display-mode: standalone)").matches;
    if(!standalone&&!localStorage.getItem("etf-install-seen")){setTimeout(()=>{setInstallToast(true);setTimeout(()=>setInstallToast(false),6000);localStorage.setItem("etf-install-seen","1");},2500);}
  },[]);

  useEffect(()=>{
    if(!ready)return;setSaved(false);
    const t=setTimeout(async()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({holdings,disclaimerSeen,savedAt:new Date().toISOString()}));}catch(_){}setSaved(true);},700);
    return()=>clearTimeout(t);
  },[holdings,disclaimerSeen,ready]);

  const addHolding=useCallback((ticker,amount)=>{
    setHoldings(prev=>{const ex=prev.find(h=>h.ticker===ticker);if(ex)return prev.map(h=>h.ticker===ticker?{...h,amount:h.amount+amount}:h);return[...prev,{ticker,name:DB[ticker].name,amount}];});
    if(toastTimer.current)clearTimeout(toastTimer.current);
    setToast({msg:`${DB[ticker]?.name||ticker} ajouté`,visible:true});
    toastTimer.current=setTimeout(()=>setToast(t=>({...t,visible:false})),2500);
  },[]);
  const removeHolding=useCallback(ticker=>setHoldings(p=>p.filter(h=>h.ticker!==ticker)),[]);
  const updateAmount=(ticker,val)=>{const a=parseFloat(val);if(!isNaN(a)&&a>0)setHoldings(p=>p.map(h=>h.ticker===ticker?{...h,amount:a}:h));};

  const scores=useMemo(()=>computeScores(holdings),[holdings]);
  const recs=useMemo(()=>buildRecs(scores,holdings,holdings.reduce((s,h)=>s+h.amount,0)),[scores,holdings]);
  const positives=useMemo(()=>buildPositive(scores,holdings),[scores,holdings]);
  const suggestions=useMemo(()=>buildSuggestions(scores,holdings),[scores,holdings]);
  const total=holdings.reduce((s,h)=>s+h.amount,0);
  const g=sc(scores.total);

  if(!ready)return(<div style={{minHeight:"100vh",background:"#050506",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.1)",borderTopColor:"#0ecb81",animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  return(
    <div style={{minHeight:"100vh",background:"#050506",color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",maxWidth:430,margin:"0 auto"}}>
      <style>{`
        ${FONTS}
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input{outline:none;-webkit-appearance:none}
        input::placeholder{color:rgba(255,255,255,0.2)}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        button{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        ::-webkit-scrollbar{display:none}
        .row{animation:up .35s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      {!disclaimerSeen&&<Disclaimer onAccept={()=>setDisclaimerSeen(true)}/>}

      {/* Ambient */}
      <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-30%",left:"-20%",width:"70%",height:"65%",background:"radial-gradient(ellipse,rgba(14,203,129,0.04) 0%,transparent 65%)"}}/>
        <div style={{position:"absolute",bottom:"-25%",right:"-20%",width:"65%",height:"60%",background:"radial-gradient(ellipse,rgba(59,130,246,0.04) 0%,transparent 65%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* ── HEADER ── */}
        <header style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",background:"rgba(5,5,6,0.8)",position:"sticky",top:0,zIndex:50,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/icon-180.png" alt="" style={{width:30,height:30,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:15,fontWeight:800,color:"#fff",letterSpacing:-.3}}>ETF Score</span>
                <span style={{fontSize:8,fontWeight:800,color:"#0ecb81",letterSpacing:2,background:"rgba(14,203,129,0.1)",border:"0.5px solid rgba(14,203,129,0.25)",padding:"2px 6px",borderRadius:3,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif"}}>EXPERT</span>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:0,letterSpacing:.3}}>Analyse multicritères</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(255,255,255,0.04)",borderRadius:20,border:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:saved?"#0ecb81":"#f0b90b",boxShadow:saved?"0 0 6px #0ecb8166":"0 0 6px #f0b90b66",transition:"all .4s",flexShrink:0}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:.3,lineHeight:1}}>
              {saved?"Sync"+(savedAt?" · "+savedAt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):""):"..."}
            </span>
          </div>
        </header>

        {/* ── HERO ── */}
        {holdings.length>0&&(
          <div style={{margin:"14px 16px 0"}}>
            <Glass style={{padding:"22px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontWeight:600}}>Score global</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:52,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-2}}>{scores.total.toFixed(1)}</span>
                    <span style={{fontSize:18,color:"rgba(255,255,255,0.2)",fontWeight:300}}>/20</span>
                  </div>
                  <div style={{fontSize:11,color:g.text,marginTop:4,fontWeight:500}}>{g.label}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginBottom:8}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontWeight:600}}>Apports</span>
                    <IBtn label="Montant investi" text="Somme totale versée — ne tient pas compte des variations de marché."/>
                  </div>
                  <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:24,fontWeight:800,color:"rgba(255,255,255,0.8)",letterSpacing:-.5}}>{total.toLocaleString("fr-FR")} €</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:4}}>{holdings.length} position{holdings.length>1?"s":""}</div>
                </div>
              </div>
            </Glass>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{padding:"14px 16px 0"}}><Tabs active={tab} onChange={setTab} highlight={holdings.length===0?["ptf"]:[]}/></div>

        {/* ── CONTENT ── */}
        <div style={{padding:"14px 16px 100px"}}>

          {/* SCORES */}
          {tab==="scores"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeIn .3s ease"}}>

              {/* Score rings */}
              <Glass style={{padding:"28px 16px 24px"}}>
                <div style={{display:"flex",justifyContent:"space-around",alignItems:"flex-start"}}>
                  <ScoreArc value={scores.geo} label="Géographique"/>
                  <div style={{width:"0.5px",background:"rgba(255,255,255,0.06)",alignSelf:"stretch",margin:"10px 0"}}/>
                  <ScoreArc value={scores.sector} label="Sectorielle"/>
                </div>
              </Glass>

              {/* Sub-scores */}
              {holdings.length>0&&(
                <Glass style={{padding:"18px 18px"}}>
                  <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase",marginBottom:16}}>Détail des critères</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <MiniBar label="Géographie" value={scores.geo} weight="25%"/>
                    <MiniBar label="Secteurs" value={scores.sector} weight="25%"/>
                    <MiniBar label="Chevauchement" value={scores.overlap} weight="20%"/>
                    <MiniBar label="Classes d'actifs" value={scores.assetClass} weight="15%"/>
                    <MiniBar label="Devises" value={scores.currency} weight="15%"/>
                  </div>
                  {Object.keys(scores.classes).length>0&&(
                    <div style={{marginTop:18,paddingTop:16,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
                      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Classes d'actifs</div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                        {Object.entries(scores.classes).sort((a,b)=>b[1]-a[1]).map(([cls,pct])=>(
                          <div key={cls} style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 12px",display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:5,height:5,borderRadius:"50%",background:ASSET_COLORS[cls]||"rgba(255,255,255,0.5)"}}/>
                            <span style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{ASSET_LABELS[cls]||cls}</span>
                            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:11,color:ASSET_COLORS[cls]||"rgba(255,255,255,0.7)",fontWeight:700}}>{pct.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Glass>
              )}

              {/* Stats row */}
              {holdings.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{v:Object.keys(scores.geoMap).length,l:"Zones"},{v:Object.keys(scores.secMap).length,l:"Secteurs"},{v:holdings.length,l:"ETF"}].map(({v,l})=>(
                    <Glass key={l} style={{padding:"14px 12px",textAlign:"center"}}>
                      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:26,fontWeight:800,color:"#fff",lineHeight:1,letterSpacing:-1}}>{v}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:5,letterSpacing:2,textTransform:"uppercase"}}>{l}</div>
                    </Glass>
                  ))}
                </div>
              )}

              {/* Analyse & Recommandations */}
              {(recs.length>0||positives.length>0)&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 2px"}}>
                    <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,rgba(14,203,129,0.4),transparent)"}}/>
                    <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.5)",letterSpacing:2.5,textTransform:"uppercase"}}>Analyse & Recommandations</span>
                    <div style={{flex:1,height:"0.5px",background:"linear-gradient(270deg,rgba(14,203,129,0.4),transparent)"}}/>
                  </div>

                  {/* Critiques d'abord */}
                  {recs.filter(r=>r.level==="essential"&&r.priority==="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`0.5px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:r.color,flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,fontWeight:700,color:r.color}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:`1px solid ${r.color}66`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}

                  {/* Feedback positif */}
                  {positives.map((p,i)=>(
                    <div key={i} style={{background:"rgba(14,203,129,0.04)",border:"0.5px solid rgba(14,203,129,0.12)",borderRadius:16,padding:"13px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{color:"#0ecb81",flexShrink:0,marginTop:1}}>{REC_ICONS.trophy}</div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.65}}>{p}</p>
                    </div>
                  ))}

                  {/* Essentiels non-critiques */}
                  {recs.filter(r=>r.level==="essential"&&r.priority!=="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`0.5px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:r.color,flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,fontWeight:700,color:r.color}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:`1px solid ${r.color}66`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}

                  {/* Toggle avancé */}
                  {recs.filter(r=>r.level==="advanced").length>0&&(
                    <button onClick={()=>setRecMode(m=>m==="essential"?"advanced":"essential")}
                      style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",WebkitTapHighlightColor:"transparent"}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>
                        {recMode==="essential"?`Analyse avancée · ${recs.filter(r=>r.level==="advanced").length} points`:"Masquer l'analyse avancée"}
                      </span>
                      <span style={{fontSize:16,color:"rgba(255,255,255,0.2)",transform:recMode==="advanced"?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",display:"inline-block"}}>›</span>
                    </button>
                  )}
                  {recMode==="advanced"&&recs.filter(r=>r.level==="advanced").map((r,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"14px 16px",animation:"up .3s cubic-bezier(.16,1,.3,1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:"rgba(255,255,255,0.35)",flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:"#0ecb81",fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:"1px solid rgba(14,203,129,0.4)"}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}
                </div>
              )}

              {!holdings.length&&(
                <Glass style={{padding:"52px 24px",textAlign:"center"}}>
                  <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:44,marginBottom:16,opacity:.3}}>◎</div>
                  <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:16,fontWeight:800,color:"#fff",marginBottom:10}}>Aucun ETF renseigné</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",lineHeight:1.7}}>Allez dans l'onglet <strong style={{color:"rgba(255,255,255,0.6)"}}>ETF</strong> pour ajouter vos positions.</div>
                </Glass>
              )}
            </div>
          )}

          {tab==="geo"&&(<div style={{animation:"fadeIn .3s ease"}}>{Object.keys(scores.geoMap).length>0?<ColorBars data={scores.geoMap} title="Répartition géographique" infoMap={GEO_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"rgba(255,255,255,0.2)",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}
          {tab==="sec"&&(<div style={{animation:"fadeIn .3s ease"}}>{Object.keys(scores.secMap).length>0?<ColorBars data={scores.secMap} title="Répartition sectorielle" infoMap={SECTOR_INFO}/>:<div style={{textAlign:"center",padding:"48px 0",color:"rgba(255,255,255,0.2)",fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}</div>)}

          {/* ETF TAB */}
          {tab==="ptf"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeIn .3s ease"}}>
              <Glass style={{padding:"18px 16px"}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Ajouter un ETF</div>
                <Search onAdd={addHolding} suggestions={suggestions}/>
              </Glass>

              {holdings.length>0&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"0 4px"}}>
                    <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:3,textTransform:"uppercase"}}>Positions</span>
                    <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"none",color:"rgba(255,77,77,0.5)",fontSize:11,cursor:"pointer"}}>Tout effacer</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {holdings.map((h,i)=>{
                      const pct=total>0?(h.amount/total*100):0;
                      const etf=DB[h.ticker];
                      const isEditing=editAmt[h.ticker]!==undefined;
                      return(
                        <Glass key={h.ticker} style={{padding:"13px 14px",animation:`up .35s ${i*.04}s both`}}>
                          <div style={{display:"flex",alignItems:"center",gap:11}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                                <span style={{fontSize:13,fontWeight:500,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{h.name}</span>
                                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600,flexShrink:0}}>{pct.toFixed(1)}%</span>
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                {etf?.isin&&<span style={{fontSize:9,fontFamily:"monospace",color:"rgba(255,255,255,0.2)",letterSpacing:.4}}>{etf.isin}</span>}
                                {etf&&<span style={{fontSize:9,color:ASSET_COLORS[etf.assetClass]||"rgba(255,255,255,0.3)",fontWeight:500}}>{ASSET_LABELS[etf.assetClass]||etf.assetClass}</span>}
                              </div>
                            </div>
                            <input type="number" value={isEditing?editAmt[h.ticker]:h.amount}
                              onFocus={()=>setEditAmt(p=>({...p,[h.ticker]:String(h.amount)}))}
                              onChange={e=>setEditAmt(p=>({...p,[h.ticker]:e.target.value}))}
                              onBlur={()=>{updateAmount(h.ticker,editAmt[h.ticker]);setEditAmt(p=>{const n={...p};delete n[h.ticker];return n;});}}
                              style={{width:72,background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"5px 8px",color:"#fff",fontSize:12,textAlign:"right",fontFamily:"monospace"}}/>
                            <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",flexShrink:0}}>€</span>
                            <button onClick={()=>removeHolding(h.ticker)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px",flexShrink:0,transition:"color .15s"}}
                              onMouseEnter={e=>e.currentTarget.style.color="#ff4d4d"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.15)"}>×</button>
                          </div>
                        </Glass>
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
      <div style={{position:"fixed",bottom:80,left:"50%",transform:`translateX(-50%) translateY(${installToast?0:12}px)`,opacity:installToast?1:0,transition:"all .4s cubic-bezier(.16,1,.3,1)",background:"rgba(14,14,14,0.97)",backdropFilter:"blur(40px)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"12px 18px",zIndex:8999,display:"flex",alignItems:"center",gap:10,pointerEvents:"none",maxWidth:320,width:"calc(100% - 40px)"}}>
        <span style={{fontSize:18,flexShrink:0}}>📲</span>
        <div><div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:13,color:"#fff",fontWeight:600,marginBottom:2}}>Installer l'app</div><div style={{fontSize:11,color:"rgba(255,255,255,0.3)",lineHeight:1.5}}>Partager → Sur l'écran d'accueil</div></div>
      </div>

      {/* Rec action sheet */}
      {activeRec&&CAT[activeRec]&&<SuggestionSheet catalog={CAT[activeRec]} onSelect={ticker=>{setTab("ptf");setActiveRec(null);}} onClose={()=>setActiveRec(null)}/>}

      {/* Disclaimer banner */}
      {disclaimerSeen&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(5,5,6,0.95)",backdropFilter:"blur(20px)",borderTop:"0.5px solid rgba(255,255,255,0.05)",padding:"8px 20px",textAlign:"center",zIndex:40}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.15)",letterSpacing:.3}}>À titre informatif uniquement — pas un conseil en investissement · <button onClick={()=>setDisclaimerSeen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",fontSize:9,cursor:"pointer",padding:0,textDecoration:"underline"}}>Revoir</button></span>
        </div>
      )}

      {/* Reset */}
      {confirmReset&&(
        <Sheet onClose={()=>setConfirmReset(false)}>
          <div style={{padding:"8px 20px 40px",textAlign:"center"}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",fontSize:15,fontWeight:800,color:"#fff",marginBottom:8}}>Effacer le portefeuille ?</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:24,lineHeight:1.65}}>Toutes vos positions seront supprimées. Irréversible.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{setHoldings([]);setConfirmReset(false);}} style={{background:"rgba(255,77,77,0.1)",border:"0.5px solid rgba(255,77,77,0.2)",borderRadius:14,padding:"15px",color:"#ff4d4d",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif"}}>Effacer tout</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"15px",color:"rgba(255,255,255,0.5)",fontSize:15,cursor:"pointer",width:"100%"}}>Annuler</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
