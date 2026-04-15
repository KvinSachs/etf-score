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
  "IE00BDBRDM35":"AGGH","IE00B1XNHC34":"INRG","IE00B3F81R35":"IEAG","LU0478205379":"XBLC","IE00BZ163K21":"VCBO","LU1650490457":"AMUE","FR0013346681":"OBLI","FR0013416716":"GOLD","IE00B4ND3602":"IGLN","JE00B588CD74":"WGLD","IE00BTJRMP35":"XMEM","IE00B469F816":"SPYM","FR0010429068":"LYMEM",
  "IE00B5BMR087":"CSPX","LU1681041575":"MEUD","LU1681042773":"BCHN",
  "IE00B8GF1M35":"CBRE","LU1681043599":"MWRD","LU1681043086":"PAASI",
  "FR0011440478":"PAEMF","FR0013412038":"PCEU","FR0013411980":"PTPXE",
  "IE00BK5BQT80":"VWCE","IE00BFMXXD54":"VUAA","DE0002635307":"EXSA",
  "LU0908500753":"MEUD6","IE00BG47KH54":"VAGF","IE00B4WXJJ64":"XGLE",
  "FR0013412285":"PCPUS","FR0013412020":"PUST","LU1829220216":"PAASI2",
  "IE00B4L5YX21":"HMWO","IE00B5BMR087":"CSPX","LU1737652670":"RS2K",
  "IE00B3F81R35":"IEAG","LU0478205379":"XBLC","IE00BZ163K21":"VCBO","LU1650490457":"AMUE","FR0013346681":"OBLI","FR0013416716":"GOLD","IE00B4ND3602":"IGLN","JE00B588CD74":"WGLD","IE00BTJRMP35":"XMEM","IE00B469F816":"SPYM","FR0010429068":"LYMEM","IE00BYZK4776":"SPPW","LU1650490622":"LCWD",
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

  /* ── OBLIGATIONS EURO CORPORATE ─────────────────────────────────────────── */
  "IEAC":{ name:"iShares Core EUR Corporate Bond UCITS ETF", isin:"IE00B3F81R35", p:"iShares", assetClass:"bond", currencies:{EUR:95,Autres:5}, geo:{"Europe":95,"Autres":5}, sec:{"Oblig. corp.":100}, overlaps:{"XBLC":90,"VCBO":85}},
  "XBLC":{ name:"Xtrackers II EUR Corporate Bond UCITS ETF", isin:"LU0478205379", p:"Xtrackers", assetClass:"bond", currencies:{EUR:95,Autres:5}, geo:{"Europe":95,"Autres":5}, sec:{"Oblig. corp.":100}, overlaps:{"IEAC":90,"VCBO":85}},
  "VCBO":{ name:"Vanguard EUR Corporate Bond UCITS ETF", isin:"IE00BZ163K21", p:"Vanguard", assetClass:"bond", currencies:{EUR:95,Autres:5}, geo:{"Europe":95,"Autres":5}, sec:{"Oblig. corp.":100}, overlaps:{"IEAC":85,"XBLC":85}},
  "AMUE":{ name:"Amundi Euro Government Bond UCITS ETF", isin:"LU1650490457", p:"Amundi", assetClass:"bond", currencies:{EUR:100}, geo:{"Europe":100}, sec:{"Oblig. souv.":100}, overlaps:{"XGLE":80}},
  "OBLI":{ name:"Lyxor PEA Obligations d'État Euro UCITS ETF", isin:"FR0013346681", p:"Amundi", assetClass:"bond", currencies:{EUR:100}, geo:{"Europe":100}, sec:{"Oblig. souv.":100}, overlaps:{"AMUE":80,"XGLE":75}},

  /* ── OR PHYSIQUE ──────────────────────────────────────────────────────────── */
  "GOLD":{ name:"Amundi Physical Gold ETC", isin:"FR0013416716", p:"Amundi", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{"IGLN":99,"WGLD":99}},
  "IGLN":{ name:"iShares Physical Gold ETC", isin:"IE00B4ND3602", p:"iShares", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{"GOLD":99,"WGLD":99}},
  "WGLD":{ name:"WisdomTree Physical Swiss Gold", isin:"JE00B588CD74", p:"WisdomTree", assetClass:"commodity", currencies:{USD:100}, geo:{"Global":100}, sec:{"Or":100}, overlaps:{"GOLD":99,"IGLN":99}},

  /* ── MARCHÉS ÉMERGENTS ────────────────────────────────────────────────────── */
  "XMEM":{ name:"Xtrackers MSCI Emerging Markets UCITS ETF", isin:"IE00BTJRMP35", p:"Xtrackers", assetClass:"equity", currencies:{TWD:22,INR:19,CNY:23,KRW:12,BRL:5,Autres:19}, geo:{"Chine":23,"Taiwan":22,"Inde":19,"Corée du Sud":12,"Brésil":5,"Autres EM":19}, sec:{"Technologie":32,"Finance":22,"Conso. discr.":11,"Télécom":9,"Énergie":6,"Matériaux":6,"Industrie":5,"Santé":4,"Conso. cour.":5}, overlaps:{"EIMI":95,"PAEEM":90}},
  "SPYM":{ name:"SPDR MSCI Emerging Markets UCITS ETF", isin:"IE00B469F816", p:"SPDR", assetClass:"equity", currencies:{TWD:22,INR:19,CNY:23,KRW:12,BRL:5,Autres:19}, geo:{"Chine":23,"Taiwan":22,"Inde":19,"Corée du Sud":12,"Brésil":5,"Autres EM":19}, sec:{"Technologie":32,"Finance":22,"Conso. discr.":11,"Télécom":9,"Énergie":6,"Matériaux":6,"Industrie":5,"Santé":4,"Conso. cour.":5}, overlaps:{"EIMI":95,"XMEM":95}},
  "LYMEM":{ name:"Lyxor MSCI Emerging Markets UCITS ETF", isin:"FR0010429068", p:"Amundi", assetClass:"equity", currencies:{TWD:22,INR:18,CNY:24,KRW:12,BRL:5,Autres:19}, geo:{"Chine":24,"Taiwan":22,"Inde":18,"Corée du Sud":12,"Brésil":5,"Autres EM":19}, sec:{"Technologie":31,"Finance":22,"Conso. discr.":11,"Télécom":9,"Énergie":6,"Matériaux":6,"Industrie":5,"Santé":4,"Conso. cour.":6}, overlaps:{"EIMI":95,"PAEEM":90,"XMEM":95}},
};

const STORAGE_KEY = "etf-portfolio-v2";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const T = {
  bg:           "#050506",
  bgElevated:   "rgba(14,14,14,0.97)",
  bgDropdown:   "rgba(14,14,14,0.97)",
  shadowDropdown: "0 24px 60px rgba(0,0,0,0.8)",
  bgBlur:       "rgba(5,5,6,0.6)",
  bgHeader:     "rgba(5,5,6,0.88)",
  bgTabBar:     "rgba(5,5,6,0.92)",
  bgOverlay:    "rgba(0,0,0,0.65)",
  surface:      "rgba(255,255,255,0.05)",
  surfaceHover: "rgba(255,255,255,0.08)",
  surfaceFaint: "rgba(255,255,255,0.03)",
  surfaceMed:   "rgba(255,255,255,0.06)",
  surfaceStrong:"rgba(255,255,255,0.12)",
  surfaceActive:"rgba(255,255,255,0.15)",
  border:       "rgba(255,255,255,0.1)",
  borderFaint:  "rgba(255,255,255,0.06)",
  borderSubtle: "rgba(255,255,255,0.08)",
  surface4:     "rgba(255,255,255,0.04)",
  accent:       "#0ecb81",
  accentBg:     "rgba(14,203,129,0.1)",
  accentBorder: "rgba(14,203,129,0.25)",
  accentGlow:   "rgba(14,203,129,0.4)",
  danger:       "#ff4d4d",
  dangerBg:     "rgba(255,77,77,0.08)",
  dangerBorder: "rgba(255,77,77,0.2)",
  warning:      "#ff9500",
  warningBg:    "rgba(255,149,0,0.06)",
  warningBorder:"rgba(255,149,0,0.15)",
  text:         "#ffffff",
  textSub:      "rgba(255,255,255,0.6)",
  textMuted:    "rgba(255,255,255,0.48)",
  textFaint:    "rgba(255,255,255,0.42)",
  textGhost:    "rgba(255,255,255,0.38)",
  textDisabled: "rgba(255,255,255,0.32)",
  radiusXl:     24,
  radiusLg:     20,
  radiusMd:     16,
  radiusSm:     14,
  radiusXs:     8,
  fontDisplay:  "-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",
  fontText:     "-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",
  fontMono:     "'SF Mono',ui-monospace,monospace",
  text0:        "rgba(255,255,255,0.8)",
  text1:        "rgba(255,255,255,0.9)",
  text2:        "rgba(255,255,255,0.7)",
  text3:        "rgba(255,255,255,0.5)",
  text4:        "rgba(255,255,255,0.4)",
  text5:        "rgba(255,255,255,0.35)",
  indicatorTrack: "rgba(255,255,255,0.06)",
  arcTrack:       "rgba(255,255,255,0.06)",
};

const T_DARK = {...T}; // immutable copy of dark theme

const T_LIGHT = {
  ...T_DARK,
  bg:           "#f8f7f5",
  bgElevated:   "#ffffff",
  bgDropdown:   "#ffffff",
  shadowDropdown: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
  bgBlur:       "rgba(248,247,245,0.88)",
  bgHeader:     "rgba(248,247,245,0.97)",
  bgTabBar:     "rgba(248,247,245,0.97)",
  bgOverlay:    "rgba(0,0,0,0.35)",
  surface:      "#ffffff",
  surfaceHover: "rgba(0,0,0,0.04)",
  surfaceFaint: "rgba(0,0,0,0.02)",
  surfaceMed:   "rgba(0,0,0,0.04)",
  surfaceStrong:"rgba(0,0,0,0.06)",
  surfaceActive:"rgba(0,0,0,0.08)",
  border:       "rgba(0,0,0,0.07)",
  borderFaint:  "rgba(0,0,0,0.05)",
  borderSubtle: "rgba(0,0,0,0.06)",
  surface4:     "#ffffff",
  text:         "#1a1a1a",
  textSub:      "rgba(0,0,0,0.82)",
  textMuted:    "rgba(0,0,0,0.70)",
  textFaint:    "rgba(0,0,0,0.62)",
  textGhost:    "rgba(0,0,0,0.56)",
  textDisabled: "rgba(0,0,0,0.45)",
  text0:        "rgba(0,0,0,0.80)",
  text1:        "rgba(0,0,0,0.90)",
  text2:        "rgba(0,0,0,0.72)",
  text3:        "rgba(0,0,0,0.58)",
  text4:        "rgba(0,0,0,0.50)",
  text5:        "rgba(0,0,0,0.45)",
  indicatorTrack: "rgba(0,0,0,0.07)",
  arcTrack:       "rgba(0,0,0,0.10)",
};



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


/* ─── DCA PROJECTION ─────────────────────────────────────────────────────────── */
function projectPortfolio(holdings, plans, yearsAhead){
  // Simulate DCA contributions over yearsAhead and return projected holdings
  const projected = holdings.map(h => ({...h, amount: h.baseAmount ?? h.amount}));
  const periodsPerYear = {weekly:52, monthly:12, quarterly:4};
  for(const h of projected){
    const plan = plans[h.ticker];
    if(!plan?.amount || !plan?.startDate) continue;
    const ppy = periodsPerYear[plan.freq] || 12;
    const contributions = Math.round(ppy * yearsAhead);
    h.amount = h.amount + contributions * plan.amount;
  }
  return projected;
}


/* ─── DCA OPTIMIZER ──────────────────────────────────────────────────────────── */
function optimizeDCA(holdings, plans, yearsAhead=5){
  const periodsPerYear={weekly:52,monthly:12,quarterly:4};
  const monthlyEquiv={weekly:52/12,monthly:1,quarterly:1/3};

  // 1. Compute total monthly budget across all existing plans
  const existingTickers=Object.keys(plans).filter(t=>plans[t]?.amount>0);
  const totalMonthlyBudget=existingTickers.reduce((sum,t)=>{
    const p=plans[t];
    return sum+(p.amount*(monthlyEquiv[p.freq]||1));
  },0);

  if(totalMonthlyBudget<=0) return null;

  // 2. Determine default freq (most common among existing plans, fallback monthly)
  const freqCount={weekly:0,monthly:0,quarterly:0};
  existingTickers.forEach(t=>{freqCount[plans[t].freq]=(freqCount[plans[t].freq]||0)+1;});
  const defaultFreq=Object.entries(freqCount).sort((a,b)=>b[1]-a[1])[0]?.[0]||"monthly";

  // 3. All tickers to consider = holdings (existing plans + new ones)
  const allTickers=holdings.map(h=>h.ticker);

  // 4. Gradient-based optimization — iterate to maximize score
  // Initialize weights: existing plans keep their weight, new ones start at 0
  let weights={};
  allTickers.forEach(t=>{
    const p=plans[t];
    if(p?.amount>0){
      weights[t]=(p.amount*(monthlyEquiv[p.freq]||1))/totalMonthlyBudget;
    } else {
      weights[t]=0;
    }
  });

  // ── Allocation constraints (based on projected portfolio at yearsAhead) ──────
  // Returns true if the weight distribution violates allocation caps
  const CAPS={
    // Asset class caps (max % of projected portfolio value)
    equity:    0.90, // max 90% equities
    bond:      0.50, // max 50% bonds
    commodity: 0.15, // max 15% gold/commodities
    real_estate:0.20,// max 20% real estate
  };
  const GEO_CAPS={
    // Geographic concentration caps (emerging markets, single region)
    emerging:  0.25, // max 25% emerging markets (MSCI ACWI weight ~12%, allow up to 25% for diversification premium)
    us:        0.75, // max 75% North America
  };
  const EMERGING_TICKERS=new Set(["PAEEM","EIMI","PAEMF","XMEM","LYMEM","SPYM"]);
  const US_TICKERS=new Set(["SPY","VOO","CSP1","500","ESE","QQQ","PANX","CSPX","PCPUS","PUST","RS2K"]);

  // Compute current projected portfolio concentrations to detect overweights
  const currentProj=projectPortfolio(holdings,plans,yearsAhead);
  const currentProjTotal=currentProj.reduce((s,h)=>s+h.amount,0)||1;
  const currentUsPct=currentProj.filter(h=>US_TICKERS.has(h.ticker)).reduce((s,h)=>s+h.amount,0)/currentProjTotal;
  const currentEmPct=currentProj.filter(h=>EMERGING_TICKERS.has(h.ticker)).reduce((s,h)=>s+h.amount,0)/currentProjTotal;

  const violatesConstraints=(w)=>{
    const simPlans2={};
    allTickers.forEach(t=>{
      const freq=plans[t]?.freq||defaultFreq;
      const ppy=periodsPerYear[freq]||12;
      const monthlyAmt=w[t]*totalMonthlyBudget;
      const perPeriod=monthlyAmt/(ppy/12);
      if(perPeriod>=5) simPlans2[t]={freq,amount:perPeriod,startDate:plans[t]?.startDate||new Date().toISOString().split("T")[0]};
    });
    const proj=projectPortfolio(holdings,simPlans2,yearsAhead);
    const projTotal=proj.reduce((s,h)=>s+h.amount,0);
    if(!projTotal) return false;

    // Check asset class caps
    const classTotals={};
    proj.forEach(h=>{const cls=DB[h.ticker]?.assetClass;if(cls)classTotals[cls]=(classTotals[cls]||0)+h.amount;});
    for(const[cls,cap] of Object.entries(CAPS)){
      if((classTotals[cls]||0)/projTotal>cap) return true;
    }

    // Geographic caps — in stabilization mode, only block moves that INCREASE existing overweight
    const emTotal=proj.filter(h=>EMERGING_TICKERS.has(h.ticker)).reduce((s,h)=>s+h.amount,0);
    const newEmPct=emTotal/projTotal;
    if(newEmPct>GEO_CAPS.emerging) return true;

    const usTotal=proj.filter(h=>US_TICKERS.has(h.ticker)).reduce((s,h)=>s+h.amount,0);
    const newUsPct=usTotal/projTotal;
    // If already over cap, only block moves that increase US further
    if(currentUsPct>GEO_CAPS.us){
      if(newUsPct>currentUsPct+0.01) return true;
    } else {
      if(newUsPct>GEO_CAPS.us) return true;
    }

    return false;
  };

  // Helper: build plans from weights and simulate portfolio at yearsAhead
  const simulate=(w)=>{
    const simPlans={};
    allTickers.forEach(t=>{
      const freq=plans[t]?.freq||defaultFreq;
      const ppy=periodsPerYear[freq]||12;
      const monthlyAmt=w[t]*totalMonthlyBudget;
      const perPeriod=monthlyAmt/(ppy/12);
      if(perPeriod>=5){
        simPlans[t]={freq,amount:Math.round(perPeriod*100)/100,startDate:plans[t]?.startDate||new Date().toISOString().split("T")[0]};
      }
    });
    return computeScores(projectPortfolio(holdings,simPlans,yearsAhead)).total;
  };

  // Simple gradient ascent — 80 iterations with constraint check
  const STEP=0.02;
  for(let iter=0;iter<80;iter++){
    let bestDelta=0,bestFrom=null,bestTo=null;
    for(const from of allTickers){
      if(weights[from]<STEP) continue;
      for(const to of allTickers){
        if(to===from) continue;
        const trial={...weights};
        trial[from]-=STEP;
        trial[to]+=STEP;
        // Skip if trial violates allocation constraints
        if(violatesConstraints(trial)) continue;
        const delta=simulate(trial)-simulate(weights);
        if(delta>bestDelta){bestDelta=delta;bestFrom=from;bestTo=to;}
      }
    }
    if(!bestFrom) break;
    weights[bestFrom]-=STEP;
    weights[bestTo]+=STEP;
  }

  // 5. Build final optimized plans
  const optimizedPlans={};
  allTickers.forEach(t=>{
    const freq=plans[t]?.freq||defaultFreq;
    const ppy=periodsPerYear[freq]||12;
    const monthlyAmt=weights[t]*totalMonthlyBudget;
    const perPeriod=monthlyAmt/(ppy/12);
    const rounded=Math.round(perPeriod/5)*5; // round to nearest 5€ for practicality
    if(rounded>=5){
      optimizedPlans[t]={
        freq,
        amount:rounded,
        startDate:plans[t]?.startDate||new Date().toISOString().split("T")[0],
      };
    }
    // 0€ = no plan (omit)
  });

  // 6. Compute projected scores
  const score5yBefore=computeScores(projectPortfolio(holdings,plans,yearsAhead)).total;
  const score5yAfter=computeScores(projectPortfolio(holdings,optimizedPlans,yearsAhead)).total;

  // 7. Detect overweights in the 5y projection with current plans
  const proj5y=projectPortfolio(holdings,plans,yearsAhead);
  const proj5yTotal=proj5y.reduce((s,h)=>s+h.amount,0);
  const overweights=[];
  if(proj5yTotal>0){
    // Per-ETF concentration
    proj5y.forEach(h=>{
      const pct=h.amount/proj5yTotal;
      if(pct>0.60) overweights.push({type:"etf",ticker:h.ticker,name:h.name,pct:Math.round(pct*100)});
    });
    // US concentration
    const US_TICKERS_OW=new Set(["SPY","VOO","CSP1","500","ESE","QQQ","PANX","CSPX","PCPUS","PUST","RS2K","BNP","BNPP"]);
    const usPct=proj5y.filter(h=>US_TICKERS_OW.has(h.ticker)||(DB[h.ticker]?.geo?.["Amér. du Nord"]||0)>80).reduce((s,h)=>s+h.amount,0)/proj5yTotal;
    if(usPct>0.75) overweights.push({type:"geo",zone:"Amér. du Nord",pct:Math.round(usPct*100),threshold:75});
    // Equity concentration
    const eqPct=proj5y.filter(h=>DB[h.ticker]?.assetClass==="equity").reduce((s,h)=>s+h.amount,0)/proj5yTotal;
    if(eqPct>0.90) overweights.push({type:"asset",cls:"Actions",pct:Math.round(eqPct*100),threshold:90});
  }

  return{optimizedPlans,score5yBefore,score5yAfter,totalMonthlyBudget,defaultFreq,overweights};
}

/* ─── TARGET-BASED REBALANCER ───────────────────────────────────────────────── */
function rebalanceDCA(holdings, plans) {
  const periodsPerYear={weekly:52,monthly:12,quarterly:4};
  const monthlyEquiv={weekly:52/12,monthly:1,quarterly:1/3};

  // Total monthly budget
  const existingTickers=Object.keys(plans).filter(tk=>plans[tk]?.amount>0);
  const totalMonthly=existingTickers.reduce((sum,tk)=>{
    const p=plans[tk]; return sum+(p.amount*(monthlyEquiv[p.freq]||1));
  },0);
  if(totalMonthly<=0) return null;

  const defaultFreq=(() => {
    const fc={weekly:0,monthly:0,quarterly:0};
    existingTickers.forEach(tk=>{fc[plans[tk].freq]=(fc[plans[tk].freq]||0)+1;});
    return Object.entries(fc).sort((a,b)=>b[1]-a[1])[0]?.[0]||"monthly";
  })();

  // Ideal target weights per asset class (based on recommended allocations)
  const IDEAL = {equity:0.80, bond:0.10, commodity:0.07, real_estate:0.03};
  // Within equity, ideal geo split
  const IDEAL_GEO = {"world":0.55,"europe":0.15,"emerging":0.20,"japan":0.05,"smallcap":0.05};

  // Classify each holding
  const WORLD_TICKERS  = new Set(["IWDA","SWDA","MWRD","VWCE","EWLD","ACWI","VWRL"]);
  const EUROPE_TICKERS = new Set(["PCEU","EXSA","MEUD","VEUR","MEUR"]);
  const EM_TICKERS     = new Set(["PAEEM","EIMI","PAEMF","XMEM","LYMEM","SPYM"]);
  const JAPAN_TICKERS  = new Set(["PTPXE","JPNT"]);
  const SMALL_TICKERS  = new Set(["IUSN","RS2K"]);
  const BOND_TICKERS   = new Set(["IEAC","XBLC","VCBO","IEAG","VAGF","OBLI","AGGH"]);
  const GOLD_TICKERS   = new Set(["GOLD","IGLN","SGLD","WGLD"]);
  const RE_TICKERS     = new Set(["EPRA","CBRE"]);
  // SP500 and similar — pure US equity, treated as "world" but with US bias
  const US_TICKERS_RB  = new Set(["SPY","VOO","CSP1","500","ESE","QQQ","PANX","CSPX","PCPUS","PUST"]);

  const classify = (ticker) => {
    if(WORLD_TICKERS.has(ticker)) return "world";
    if(US_TICKERS_RB.has(ticker)) return "us"; // US-only equity
    if(EUROPE_TICKERS.has(ticker)) return "europe";
    if(EM_TICKERS.has(ticker)) return "emerging";
    if(JAPAN_TICKERS.has(ticker)) return "japan";
    if(SMALL_TICKERS.has(ticker)) return "smallcap";
    if(BOND_TICKERS.has(ticker)) return "bond";
    if(GOLD_TICKERS.has(ticker)) return "commodity";
    if(RE_TICKERS.has(ticker)) return "realestate";
    const cls = DB[ticker]?.assetClass;
    return cls||"equity";
  };

  // Group holdings by category
  const groups={world:[],us:[],europe:[],emerging:[],japan:[],smallcap:[],bond:[],commodity:[],realestate:[]};
  holdings.forEach(h=>{const cat=classify(h.ticker);if(groups[cat])groups[cat].push(h.ticker);});

  // Build target weights for each ticker based on what's available
  // Step 1: determine which asset classes are present
  const presentClasses=new Set(holdings.map(h=>classify(h.ticker)));
  
  // Step 2: normalize IDEAL to present classes only
  const classMap={world:"equity",us:"equity",europe:"equity",emerging:"equity",japan:"equity",smallcap:"equity",bond:"bond",commodity:"commodity",realestate:"realestate"};
  let classBudget={equity:0,bond:0,commodity:0,realestate:0};
  presentClasses.forEach(cat=>{
    const cls=classMap[cat]||"equity";
    classBudget[cls]+=1;
  });

  // Equity gets its target if present, others proportional
  const presentAssetClasses=[...new Set([...presentClasses].map(c=>classMap[c]||"equity"))];
  let totalIdeal=presentAssetClasses.reduce((s,cls)=>s+(IDEAL[cls]||0),0)||1;
  const normalizedClassWeight={};
  presentAssetClasses.forEach(cls=>{ normalizedClassWeight[cls]=(IDEAL[cls]||0)/totalIdeal; });

  // Step 3: within equity, distribute among present equity types
  const equityTypes=["world","us","europe","emerging","japan","smallcap"].filter(t=>groups[t].length>0);
  let totalEquityIdeal=equityTypes.reduce((s,t)=>s+(IDEAL_GEO[t]||0),0)||1;

  // Step 4: assign target monthly amount to each ticker
  const targetWeights={};
  holdings.forEach(h=>{
    const cat=classify(h.ticker);
    const cls=classMap[cat]||"equity";
    const clsWeight=normalizedClassWeight[cls]||0;
    
    if(cls==="equity"){
      const eqTypeWeight=(IDEAL_GEO[cat]||0)/totalEquityIdeal;
      const tickersInType=groups[cat]||[];
      const shareInType=tickersInType.length>0?1/tickersInType.length:0;
      targetWeights[h.ticker]=clsWeight*eqTypeWeight*shareInType;
    } else {
      const tickersInCls=[...presentClasses].filter(c=>classMap[c]===cls).flatMap(c=>groups[c]||[]);
      const shareInCls=tickersInCls.length>0?1/tickersInCls.length:0;
      targetWeights[h.ticker]=clsWeight*shareInCls;
    }
  });

  // Normalize to sum=1
  const total=Object.values(targetWeights).reduce((s,v)=>s+v,0)||1;
  Object.keys(targetWeights).forEach(tk=>{targetWeights[tk]/=total;});

  // Build rebalanced plans
  const rebalancedPlans={};
  holdings.forEach(h=>{
    const freq=plans[h.ticker]?.freq||defaultFreq;
    const ppy=periodsPerYear[freq]||12;
    const monthlyAmt=targetWeights[h.ticker]*totalMonthly;
    const perPeriod=monthlyAmt/(ppy/12);
    const rounded=Math.round(perPeriod/5)*5;
    if(rounded>=5){
      rebalancedPlans[h.ticker]={
        freq, amount:rounded,
        startDate:plans[h.ticker]?.startDate||new Date().toISOString().split("T")[0]
      };
    }
  });

  const score5yBefore=computeScores(projectPortfolio(holdings,plans,5)).total;
  const score5yAfter=computeScores(projectPortfolio(holdings,rebalancedPlans,5)).total;

  return{rebalancedPlans,score5yBefore,score5yAfter,totalMonthly,defaultFreq,targetWeights};
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
  const usW=geoMap["Amér. du Nord"]||0,emW=["Émergents","Chine","Inde","Corée du Sud","Taiwan","Brésil","Autres EM","Autres Asie","Afrique du Sud","Émirats Arabes","Égypte","Qatar","Koweït","Nigeria","Autres EMEA"].reduce((s,k)=>s+(geoMap[k]||0),0);
  const devW=usW+(["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(geoMap[k]||0),0))+(geoMap["Japon"]||0);
  const tW=secMap["Technologie"]||0,usdW=currencies["USD"]||0;
  const commPctR=commPct,rePctR=rePct,bondPctR=bondPct,equityPctR=equityPct;
  for(let i=0;i<holdings.length;i++)for(let j=i+1;j<holdings.length;j++){const a=holdings[i],b=holdings[j],eA=DB[a.ticker],eB=DB[b.ticker];if(!eA||!eB)continue;const ov=eA.overlaps?.[b.ticker]||0;if(ov>=90)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Chevauchement critique",text:`${a.ticker} et ${b.ticker} se recoupent à ${ov}% — doublon inutile. Conservez un seul des deux.`});else if(ov>=60)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",title:"Chevauchement élevé",text:`${a.ticker} et ${b.ticker} partagent ~${ov}% de leurs sous-jacents.`});}
  if(bondPct===0&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:T.text3,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`,cat:"bonds",title:"Portefeuille 100% actions",text:"C'est un choix valide, notamment sur un horizon long terme. Des obligations réduiraient la volatilité si vous souhaitez sécuriser une partie du capital."});
  else if(bondPct<15&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"bonds",title:"Faible exposition obligataire",text:`${bondPct.toFixed(0)}% seulement. Une allocation de 20-25% améliorerait la résilience.`});
  if(devW<20&&holdings.length>0)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"world",title:"Marchés développés absents",text:`Seulement ${devW.toFixed(0)}% en marchés développés (US, Europe, Japon) qui représentent ~80% de la capitalisation mondiale.`});
  else if(usW>80)recs.push({priority:"high",level:"essential",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"europe",title:"Concentration US excessive",text:`${usW.toFixed(0)}% en Amérique du Nord. Ajoutez de l'Europe ou des émergents.`});
  if(tW>35)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Surexposition technologie",text:`${tW.toFixed(0)}% en Tech — très sensible aux taux et aux rotations sectorielles.`});
  if(commPctR>25)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"gold",title:"Surexposition matières premières",text:`${commPctR.toFixed(0)}% en matières premières. Au-delà de 15% la volatilité augmente sans rendement garanti.`});
  else if(commPctR>15)recs.push({priority:"medium",level:"advanced",color:"#ff9500",bg:"rgba(255,149,0,0.06)",border:"rgba(255,149,0,0.15)",cat:"gold",title:"Or/matières premières élevé",text:`${commPctR.toFixed(0)}% — une allocation de 5-10% est recommandée comme couverture.`});
  if(rePctR>30)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",cat:"realestate",title:"Surexposition immobilier",text:`${rePctR.toFixed(0)}% en immobilier coté. Les REITs sont très sensibles aux hausses de taux.`});
  if(emW<8&&devW>=20&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:T.text3,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`,cat:"emerging",title:"Émergents sous-représentés",text:`${emW.toFixed(0)}% en marchés émergents qui représentent ~40% du PIB mondial.`});
  if(commPct===0&&holdings.length>=2)recs.push({priority:"low",level:"advanced",color:T.text4,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderFaint}`,cat:"gold",title:"Or absent",text:"5-10% d'or protège contre l'inflation et les crises systémiques."});
  if(rePct===0&&holdings.length>=2)recs.push({priority:"low",level:"advanced",color:T.text4,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderFaint}`,cat:"realestate",title:"Immobilier absent",text:"Les REITs offrent revenus réguliers et décorrélation partielle."});
  if(usdW>80)recs.push({priority:"medium",level:"advanced",color:T.text3,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`,cat:"eurobonds",title:"Risque USD élevé",text:`${usdW.toFixed(0)}% USD. Une dépréciation du dollar impacte vos rendements en euros.`});
  if(scores.overlap<10&&holdings.length>1)recs.push({priority:"high",level:"essential",color:"#ff4d4d",bg:"rgba(255,77,77,0.06)",border:"rgba(255,77,77,0.15)",title:"Chevauchements massifs",text:`Score chevauchement : ${scores.overlap.toFixed(1)}/20. Vous payez des frais en doublon sans gain de diversification.`});
  if(bondPctR>60)recs.push({priority:"medium",level:"advanced",color:T.text3,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`,cat:"emerging",title:"Portefeuille très obligataire",text:`${bondPctR.toFixed(0)}% en obligations. Rendement long terme limité — rééquilibrez vers les actions.`});
  if(scores.currency<8&&holdings.length>0)recs.push({priority:"medium",level:"advanced",color:T.text4,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderFaint}`,cat:"eurobonds",title:"Dépendance monétaire",text:`Score devises : ${scores.currency.toFixed(1)}/20. Forte concentration sur une devise.`});
  if(scores.assetClass<8&&holdings.length>1)recs.push({priority:"medium",level:"advanced",color:T.text4,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderFaint}`,cat:"bonds",title:"Classes d'actifs déséquilibrées",text:`Score : ${scores.assetClass.toFixed(1)}/20. Combinez actions, obligations, immobilier et or.`});
  if(equityPctR>95&&holdings.length===1)recs.push({priority:"low",level:"advanced",color:T.text4,bg:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderFaint}`,cat:"bonds",title:"Portefeuille mono-ETF",text:"Bonne base. Ajouter obligations et or renforcerait la résilience."});
  if(scores.total>=16)recs.push({priority:"success",level:"essential",color:T.accent,bg:"rgba(14,203,129,0.06)",border:"rgba(14,203,129,0.15)",title:"Excellent portefeuille",text:"Diversification optimale. Maintenez et rééquilibrez périodiquement."});
  const order={high:0,medium:1,low:2,success:3};
  return recs.sort((a,b)=>order[a.priority]-order[b.priority]).slice(0,8);
}

/* ─── SUGGESTION CATALOG ─────────────────────────────────────────────────────── */
const CAT={
  world:{title:"ETF Monde",emoji:"🌍",color:T.accent,why:"Un ETF Monde est la brique de base idéale — exposition à des milliers d'entreprises mondiales en un seul produit.",options:[
    {ticker:"MWRD",label:"Monde développé · Amundi",desc:"Équivalent IWDA, frais très compétitifs. Domicilié Luxembourg.",ter:"0.12%",tags:["✅ Éligible PEA","💰 Le moins cher"]},
    {ticker:"VWCE",label:"All World · Vanguard",desc:"Monde développé + émergents. ~3 600 entreprises. Le favori européen.",ter:"0.22%",tags:["⭐ Le plus populaire EU","🌐 Monde + EM"]},
    {ticker:"IWDA",label:"Monde développé · iShares",desc:"La référence mondiale. 1 600 entreprises, 23 pays développés.",ter:"0.20%",tags:["💧 Très liquide","🏦 Référence mondiale"]},
    {ticker:"EWLD",label:"Monde entier · Amundi",desc:"Pays développés + marchés émergents. Éligible PEA.",ter:"0.38%",tags:["✅ Éligible PEA","🌐 Monde complet"]},
  ]},
  bonds:{title:"Obligations",emoji:"🔒",color:T.accent,why:"Les obligations amortissent la volatilité et protègent lors des krachs actions.",options:[
    {ticker:"IEAC",label:"Corporate euro · iShares",desc:"Le plus grand ETF obligataire corporate en euros. 10 Mds€ d'encours, très liquide.",ter:"0.09%",tags:["⭐ Le plus populaire","🇪🇺 Zéro risque €"]},
    {ticker:"XBLC",label:"Corporate euro · Xtrackers",desc:"Même indice que IEAC, frais identiques. Alternative solide chez Xtrackers.",ter:"0.09%",tags:["💰 Frais identiques","💧 Liquide"]},
    {ticker:"VCBO",label:"Corporate euro · Vanguard",desc:"Corporate bonds zone euro — Vanguard, très bien diversifié.",ter:"0.10%",tags:["🏦 Vanguard","🇪🇺 Euro pur"]},
    {ticker:"IEAG",label:"Aggregate euro · iShares",desc:"Mix souverain + corporate en euros. Zéro risque de change.",ter:"0.09%",tags:["💰 Le moins cher","🔀 Souv. + Corp."]},
    {ticker:"VAGF",label:"Global Aggregate couvert · Vanguard",desc:"Obligations mondiales couvertes en euros — très diversifié.",ter:"0.10%",tags:["🌍 Le plus diversifié","💧 Liquide"]},
    {ticker:"OBLI",label:"Oblig. État Euro PEA · Amundi",desc:"Le seul ETF obligataire éligible PEA. Obligations souveraines zone euro.",ter:"0.25%",tags:["✅ Éligible PEA","🏛️ Souveraines"]},
  ]},
  gold:{title:"Or",emoji:"✨",color:"#f0b90b",why:"5-10% d'or protège contre l'inflation et les crises systémiques.",options:[
    {ticker:"GOLD",label:"Or physique · Amundi",desc:"Or physique alloué chez HSBC. 10 Mds€ d'encours, domicilié en France.",ter:"0.12%",tags:["⭐ Le plus populaire FR","🏦 Or physique"]},
    {ticker:"IGLN",label:"Or physique · iShares",desc:"Le plus grand ETC or au monde. 28 Mds€, très liquide.",ter:"0.12%",tags:["💧 Très liquide","🏦 BlackRock"]},
    {ticker:"SGLD",label:"Or physique · Invesco",desc:"Or physique en coffre à Londres. Frais très compétitifs.",ter:"0.12%",tags:["💰 Le moins cher","🔒 Or alloué"]},
    {ticker:"WGLD",label:"Or physique Suisse · WisdomTree",desc:"Or physique stocké en Suisse. Référence européenne pour les investisseurs institutionnels.",ter:"0.15%",tags:["🇨🇭 Stocké en Suisse","🏦 WisdomTree"]},
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
    {ticker:"EIMI",label:"Émergents IMI · iShares",desc:"26 Mds€ d'encours. Couvre grandes, moyennes et petites caps — le plus complet.",ter:"0.18%",tags:["⭐ Le plus populaire","🌍 Large + Mid + Small"]},
    {ticker:"XMEM",label:"Émergents · Xtrackers",desc:"Réplication physique, frais compétitifs. Très bonne liquidité.",ter:"0.18%",tags:["💰 Frais bas","🏦 Xtrackers"]},
    {ticker:"SPYM",label:"Émergents · SPDR",desc:"MSCI Emerging Markets standard — grande diversification géographique.",ter:"0.18%",tags:["💧 Liquide","🏦 State Street"]},
    {ticker:"PAEEM",label:"Émergents PEA · Amundi",desc:"Le seul ETF émergents éligible PEA. Chine, Inde, Taiwan, Brésil.",ter:"0.20%",tags:["✅ Éligible PEA","🏛️ Synthétique"]},
    {ticker:"LYMEM",label:"Émergents · Lyxor/Amundi",desc:"Version Lyxor (fusionnée Amundi) de l'indice MSCI EM.",ter:"0.30%",tags:["🇫🇷 Domicilié France","📊 MSCI Standard"]},
  ]},
  smallcaps:{title:"Petites capitalisations",emoji:"🔬",color:"#a78bfa",why:"Prime de rendement historique — complément idéal à un ETF large caps.",options:[
    {ticker:"IUSN",label:"Small caps mondiales · iShares",desc:"Diversifie sur les petites entreprises mondiales.",ter:"0.35%",tags:["🌍 Le plus diversifié"]},
  ]},
  eurobonds:{title:"Obligations euro",emoji:"💶",color:T.accent,why:"Forte exposition USD détectée — les obligations en euros éliminent le risque de change.",options:[
    {ticker:"IEAG",label:"Obligations euro · iShares",desc:"Souveraines et corporate en euros. Risque de change nul.",ter:"0.09%",tags:["💰 Le moins cher","🇪🇺 Zéro risque €"]},
  ]},
};

function buildSuggestions(scores,holdings){
  const keys=[],{classes,geoMap,currencies}=scores,tickers=new Set(holdings.map(h=>h.ticker));
  const bondPct=classes["bond"]||0,rePct=classes["real_estate"]||0,commPct=classes["commodity"]||0,equityPct=classes["equity"]||0;
  const usW=geoMap["Amér. du Nord"]||0,emW=["Émergents","Chine","Inde","Corée du Sud","Taiwan","Brésil","Autres EM","Autres Asie","Afrique du Sud","Émirats Arabes","Égypte","Qatar","Koweït","Nigeria","Autres EMEA"].reduce((s,k)=>s+(geoMap[k]||0),0);
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
const ASSET_COLORS={equity:"#a78bfa",bond:"#0ecb81",real_estate:"#f0b90b",commodity:"#facc15"};

/* ─── SCORE COLOR (TR style) ─────────────────────────────────────────────────── */
function sc(s){
  if(s>=15)return{stroke:"#0ecb81",text:"#0ecb81",glow:"rgba(14,203,129,0.25)",label:"Excellent"};
  if(s>=10)return{stroke:"#f0b90b",text:"#f0b90b",glow:"rgba(240,185,11,0.25)",label:"Correct"};
  if(s>= 5)return{stroke:"#ff9500",text:"#ff9500",glow:"rgba(255,149,0,0.25)",label:"Faible"};
  return          {stroke:"#ff4d4d",text:"#ff4d4d",glow:"rgba(255,77,77,0.25)",label:"Critique"};
}

/* ─── LIQUID GLASS SURFACE ───────────────────────────────────────────────────── */
function Glass({children,style={},onClick}){
  const isDark=T.bg==="#050506";
  return(
    <div onClick={onClick} style={{
      background:T.surface,
      border:`0.5px solid ${T.border}`,
      borderRadius:T.radiusLg,
      position:"relative",
      boxShadow:isDark?"none":"0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      ...style
    }}>
      {isDark&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",pointerEvents:"none",borderRadius:"20px 20px 0 0"}}/>}
      {children}
    </div>
  );
}

/* ─── SCORE ARC ──────────────────────────────────────────────────────────────── */
function ScoreArc({value,label,size=150}){
  const SW=10; // stroke width
  const r=size/2-SW/2-8,circ=2*Math.PI*r,g=sc(value);
  const idGrad=`ag${label.replace(/\W/g,"")}`;
  const idSheen=`as${label.replace(/\W/g,"")}`;
  const idGlow=`agw${label.replace(/\W/g,"")}`;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flex:1}}>
      <div style={{position:"relative",width:size,height:size}}>
        {/* Ambient glow */}
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle at center,${g.glow} 0%,transparent 60%)`,pointerEvents:"none"}}/>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"relative",overflow:"visible"}}>
          <defs>
            {/* Main arc gradient: dark start → bright mid → dark end */}
            <linearGradient id={idGrad} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={g.stroke} stopOpacity="0.15"/>
              <stop offset="40%" stopColor={g.stroke} stopOpacity="0.9"/>
              <stop offset="55%" stopColor={lighten(g.stroke,70)}/>
              <stop offset="100%" stopColor={g.stroke} stopOpacity="0.4"/>
            </linearGradient>
            {/* Gloss sheen: white highlight on top of arc */}
            <linearGradient id={idSheen} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)"/>
              <stop offset="40%" stopColor="rgba(255,255,255,0.25)"/>
              <stop offset="60%" stopColor="rgba(255,255,255,0.35)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.arcTrack} strokeWidth={SW}/>
          {/* Main arc */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${idGrad})`} strokeWidth={SW}
            strokeDasharray={`${(value/20)*circ} ${(1-value/20)*circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)",filter:`drop-shadow(0 0 8px ${g.stroke}88) drop-shadow(0 0 3px ${g.stroke})`}}/>
          {/* Gloss sheen overlay */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${idSheen})`} strokeWidth={SW*0.5}
            strokeDasharray={`${(value/20)*circ} ${(1-value/20)*circ}`} strokeLinecap="round"
            style={{pointerEvents:"none"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
          <span style={{fontFamily:T.fontDisplay,fontSize:34,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-1}}>{value.toFixed(1)}</span>
          <span style={{fontSize:9,color:T.text5,letterSpacing:2,marginTop:2}}>/20</span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:T.fontDisplay,fontSize:12,fontWeight:600,color:T.textSub,letterSpacing:.5}}>{label}</div>
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
      <div style={{fontSize:12,color:T.text4,width:114,flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:2,background:T.indicatorTrack,borderRadius:1,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(value/20)*100}%`,background:g.stroke,borderRadius:1,transition:"width .8s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 6px ${g.stroke}`}}/>
      </div>
      <span style={{fontSize:12,color:g.text,fontFamily:T.fontDisplay,fontWeight:700,width:30,textAlign:"right"}}>{value.toFixed(1)}</span>
      <span style={{fontSize:10,color:T.text5,width:28,textAlign:"right"}}>{weight}</span>
    </div>
  );
}

/* ─── DONUT CHART ────────────────────────────────────────────────────────────── */
function lighten(hex,amt=40){
  const n=parseInt(hex.replace("#",""),16);
  const r=Math.min(255,(n>>16)+amt);
  const g=Math.min(255,((n>>8)&0xff)+amt);
  const b=Math.min(255,(n&0xff)+amt);
  return`#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function Donut({data,palette,size=200}){
  const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const total=entries.reduce((s,[,v])=>s+v,0);
  if(!total)return null;
  const GAP=0.03;
  const THICKNESS=32; // thinner ring
  const cx=size/2,cy=size/2,r=size/2-10,inner=r-THICKNESS;
  let angle=-Math.PI/2;
  const slices=entries.map(([k,v],i)=>{
    const pct=v/total;
    const start=angle+GAP/2;
    angle+=pct*Math.PI*2;
    const end=angle-GAP/2;
    const x1=cx+r*Math.cos(start),y1=cy+r*Math.sin(start);
    const x2=cx+r*Math.cos(end),y2=cy+r*Math.sin(end);
    const xi1=cx+inner*Math.cos(start),yi1=cy+inner*Math.sin(start);
    const xi2=cx+inner*Math.cos(end),yi2=cy+inner*Math.sin(end);
    const large=pct>0.5?1:0;
    const path=`M${xi1} ${yi1} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${xi2} ${yi2} A${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    const mid=(start+end)/2;
    return{k,v,pct,path,color:palette[i%palette.length],mid,start,end,i};
  });
  const top=slices[0];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{position:"relative",width:size,height:size}}>

        <svg width={size} height={size} style={{position:"relative",zIndex:1}}>


          {/* Solid color segments */}
          {slices.map((s)=>(
            <path key={s.k} d={s.path} fill={s.color}/>
          ))}


          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={inner-2} fill={T.bg}/>
          {/* Center label — vertically centered: value line + zone line, total ~32px */}
          <text x={cx} y={cy-4} textAnchor="middle" fill={T.text} fontSize="24" fontWeight="800" fontFamily="-apple-system,system-ui" letterSpacing="-0.5">
            <tspan>{top?.pct>=0.01?(top.v).toFixed(0):""}</tspan><tspan fill={T.text4} fontSize="12" fontWeight="500" dx="2" dy="0">%</tspan>
          </text>
          <text x={cx} y={cy+14} textAnchor="middle" fill={T.text4} fontSize="9" fontFamily="-apple-system,system-ui" fontWeight="500">{top?.k}</text>
        </svg>
      </div>
      {/* Legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px 16px",justifyContent:"center",maxWidth:320}}>
        {slices.map((s,i)=>(
          <div key={s.k} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:`0 0 6px ${s.color}88`}}/>
            <span style={{fontSize:11,color:T.textMuted}}>{s.k}</span>
            <span style={{fontSize:11,color:s.color,fontWeight:600}}>{s.v.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BAR CHART ──────────────────────────────────────────────────────────────── */
const BARS=["#0ecb81","#60a5fa","#f0b90b","#3b82f6","#a78bfa","#38bdf8","#ff9500","#94a3b8","#0ecb81","#f0b90b"];
const SECTOR_INFO={"Technologie":"Logiciels, semi-conducteurs, cloud.","Finance":"Banques, assurances, gestion d'actifs.","Santé":"Pharma, biotech, dispositifs médicaux.","Industrie":"Fabrication, aérospatiale, transports.","Conso. discr.":"Mode, automobile, loisirs, e-commerce.","Conso. cour.":"Alimentation, hygiène — produits essentiels.","Énergie":"Pétrole, gaz, renouvelables.","Matériaux":"Métaux, mines, chimie.","Télécom":"Opérateurs, câble, internet.","Immobilier":"REITs et foncières cotées.","Services pub.":"Électricité, gaz, eau.","Oblig. souv.":"Obligations d'États.","Oblig. corp.":"Obligations d'entreprises.","Or":"Valeur refuge contre l'inflation."};
const GEO_INFO={"Amér. du Nord":"États-Unis et Canada — marchés les plus profonds.","Europe":"UE + UK, Suisse — économies matures.","Japon":"3ème économie mondiale.","Asie-Pac.":"Australie, NZ, Singapour.","Émergents":"Chine, Inde, Brésil — fort potentiel.","Chine":"2ème économie, risque réglementaire.","Inde":"Fort potentiel de croissance.","Taiwan":"Leader semi-conducteurs (TSMC).","Corée du Sud":"Samsung, Hyundai.","Brésil":"Plus grande économie d'Amérique latine.","Autres EM":"Mexique, Indonésie, Thaïlande…","Royaume-Uni":"Finance, énergie post-Brexit.","France":"Luxe, énergie, aéronautique.","Suisse":"Pharma et luxe — très défensif.","Allemagne":"Industrie automobile.","Pays-Bas":"ASML, logistique.","Autres EU":"Espagne, Italie, Suède…","Australie":"Matières premières.","Singapour":"Hub financier asiatique.","Autres Asie":"Marchés émergents asiatiques.","Global":"Exposition mondiale.","Autres":"Autres régions.","Afrique du Sud":"Plus grande économie d'Afrique.","Émirats Arabes":"Hub financier du Moyen-Orient.","Égypte":"Marché émergent d'Afrique du Nord.","Qatar":"Énergie et finance.","Koweït":"Marché pétrolier du Golfe.","Nigeria":"Plus grande économie d'Afrique subsaharienne.","Autres EMEA":"Autres marchés émergents Europe-Afrique-Moyen-Orient."};

function InfoModal({label,text,onClose}){
  return(
    <Sheet onClose={onClose}>
      <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
        <div style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:700,color:T.text,marginBottom:10}}>{label}</div>
        <p style={{margin:0,fontSize:13,color:T.text3,lineHeight:1.7}}>{text}</p>
      </div>
    </Sheet>
  );
}
function IBtn({label,text}){const[s,ss]=useState(false);return(<><button onClick={()=>ss(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 0 5px",display:"inline-flex",alignItems:"center",opacity:.5}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke={T.text3} strokeWidth="1"/><text x="6" y="9.5" textAnchor="middle" fill={T.text2} fontSize="7.5" fontFamily="system-ui" fontWeight="600">i</text></svg></button>{s&&<InfoModal label={label} text={text} onClose={()=>ss(false)}/>}</>);}

function ColorBars({data,title,infoMap={}}){
  const sorted=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,9);
  const max=sorted[0]?.[1]||1;
  return(
    <Glass>
      <div style={{padding:"20px 18px"}}>
        <div style={{fontFamily:T.fontDisplay,fontSize:10,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:18}}>{title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {sorted.map(([k,v],i)=>(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:13,color:T.text2}}>{k}</span>
                  {infoMap[k]&&<IBtn label={k} text={infoMap[k]}/>}
                </div>
                <span style={{fontFamily:T.fontDisplay,fontSize:13,color:BARS[i%BARS.length],fontWeight:700}}>{v.toFixed(1)}%</span>
              </div>
              <div style={{height:2,background:T.indicatorTrack,borderRadius:1,overflow:"hidden"}}>
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
  const dragging=useRef(false);const scrollableRef=useRef(null);
  useEffect(()=>{const f=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",f);return()=>document.removeEventListener("keydown",f);},[onClose]);

  const onTS=e=>{startY.current=e.touches[0].clientY;curY.current=0;dragging.current=false;};
  const onTM=e=>{
    const dy=e.touches[0].clientY-startY.current;
    const scrollEl=ref.current?.querySelector("[data-sheet-scroll]");
    if(scrollEl&&scrollEl.scrollTop>0)return;
    if(!dragging.current){if(Math.abs(dy)<6)return;if(dy<0)return;dragging.current=true;}
    if(dy>0&&ref.current){e.preventDefault();curY.current=dy;ref.current.style.transition="none";ref.current.style.transform=`translateY(${dy}px)`;}
  };
  const onTE=()=>{
    if(curY.current>80){
      if(ref.current){ref.current.style.transition="transform .25s cubic-bezier(.16,1,.3,1)";ref.current.style.transform="translateY(100%)";setTimeout(()=>onClose(),240);}
      else onClose();
    } else {
      if(ref.current){ref.current.style.transition="transform .25s cubic-bezier(.16,1,.3,1)";ref.current.style.transform="translateY(0)";}
    }
    curY.current=0;dragging.current=false;
  };
  // Block pull-to-refresh but allow scroll inside sheet content
  useEffect(()=>{
    const prevent=e=>{
      const scrollEl=ref.current?.querySelector("[data-sheet-scroll]");
      // If touch is inside the scrollable area — always allow
      if(scrollEl&&scrollEl.contains(e.target))return;
      // Otherwise block (drag bar area, backdrop, etc.)
      e.preventDefault();
    };
    document.addEventListener("touchmove",prevent,{passive:false});
    return()=>document.removeEventListener("touchmove",prevent,{passive:false});
  },[]);
  return createPortal(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:T.bgOverlay,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div ref={ref} onClick={e=>e.stopPropagation()} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{background:T.bgElevated,backdropFilter:"blur(40px)",border:`0.5px solid ${T.border}`,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,height:"calc(100dvh - env(safe-area-inset-top, 0px) - 20px)",display:"flex",flexDirection:"column",transition:"transform .2s cubic-bezier(.16,1,.3,1)",animation:"up .3s cubic-bezier(.16,1,.3,1)",fontFamily:T.fontText}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"14px 20px",position:"relative"}}>
          <div style={{width:36,height:4,borderRadius:2,background:T.surfaceStrong}}/>
          {"ontouchstart" in window||navigator.maxTouchPoints>0?null:(
            <button onClick={onClose} style={{position:"absolute",right:16,top:12,background:T.surfaceHover,border:"none",borderRadius:"50%",width:28,height:28,color:T.text3,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          )}
        </div>
        {children}
      </div>
    </div>
  , document.body);
}


/* ─── PROJECTION SHEET ───────────────────────────────────────────────────────── */
function ProjectionSheet({holdings,plans,onPlansUpdate,currentScore,onClose}){
  const score1y = computeScores(projectPortfolio(holdings,plans,1)).total;
  const score5y = computeScores(projectPortfolio(holdings,plans,5)).total;
  const proj5y  = projectPortfolio(holdings,plans,5);
  const total5y = proj5y.reduce((s,h)=>s+h.amount,0);
  const[showConfirm,setShowConfirm]=useState(false);
  const[applied,setApplied]=useState(false);

  // DCA annual total
  const periodsPerYear={weekly:52,monthly:12,quarterly:4};
  const annualDCA = Object.entries(plans).reduce((sum,[ticker,plan])=>{
    if(!plan?.amount)return sum;
    return sum + plan.amount*(periodsPerYear[plan.freq]||12);
  },0);

  const g0=sc(currentScore), g1=sc(score1y), g5=sc(score5y);

  // Compute optimization and target rebalancing
  const optResult=useMemo(()=>optimizeDCA(holdings,plans,5),[holdings,plans]);
  const rebalResult=useMemo(()=>rebalanceDCA(holdings,plans),[holdings,plans]);

  const ScoreCol=({label,value,g,highlight})=>(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,
      padding:"16px 8px",borderRadius:14,
      background:highlight?"rgba(14,203,129,0.06)":"transparent",
      border:highlight?`0.5px solid rgba(14,203,129,0.2)`:`0.5px solid ${T.borderFaint}`,
    }}>
      <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:600,textAlign:"center"}}>{label}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:2}}>
        <span style={{fontFamily:T.fontDisplay,fontSize:36,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-1}}>{value.toFixed(1)}</span>
        <span style={{fontSize:13,color:T.text5,fontWeight:300}}>/20</span>
      </div>
      <div style={{fontSize:10,color:g.text,fontWeight:600,letterSpacing:.3}}>{g.label}</div>
    </div>
  );

  return(
    <Sheet onClose={onClose}>
      <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:16,fontWeight:700,color:T.text,marginBottom:4}}>Projection DCA</div>
          <div style={{fontSize:13,color:T.text4,lineHeight:1.6}}>
            Évolution de votre score si vous maintenez vos versements programmés.
          </div>
        </div>

        {/* Score progression */}
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <ScoreCol label="Aujourd'hui" value={currentScore} g={g0}/>
          <ScoreCol label="Dans 1 an" value={score1y} g={g1}/>
          <ScoreCol label="Dans 5 ans" value={score5y} g={g5} highlight/>
        </div>



        {/* Per-ETF projection */}
        <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:12}}>Composition dans 5 ans</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {proj5y.map(h=>{
            const pct = total5y>0?h.amount/total5y*100:0;
            const plan = plans[h.ticker];
            return(
              <div key={h.ticker} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{h.name}</span>
                    <span style={{fontSize:12,color:T.text4,fontWeight:600,flexShrink:0,marginLeft:8}}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{height:3,borderRadius:2,background:T.surfaceFaint,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:plan?T.accent:T.text4,transition:"width .4s"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Annual DCA summary */}
        <div style={{background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:T.text5,marginBottom:8,letterSpacing:.3}}>Versements programmés</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-.5}}>{annualDCA.toLocaleString("fr-FR")} €</span>
            <span style={{fontSize:11,color:T.text5}}>/ an</span>
          </div>
          <div style={{fontSize:11,color:T.text4,marginTop:4}}>{(annualDCA*5).toLocaleString("fr-FR")} € versés sur 5 ans</div>
        </div>

        {/* Optimization section */}
        {optResult&&!applied&&(()=>{
          const noChangesInPlan = holdings.every(h=>{
            const before=plans[h.ticker]?.amount||0;
            const after=activeResult.optimizedPlans[h.ticker]?.amount||0;
            return before===after;
          });
          const noScoreGain = activeResult.score5yAfter-activeResult.score5yBefore<0.5;
          const scoreDegrading = score5y < currentScore - 0.5;
          const hasOverweights = optResult?.overweights?.length>0;
          // Use target-based rebalancing when overweights detected or score degrades
          const useRebal = (hasOverweights || scoreDegrading) && rebalResult;
          const activeResult = useRebal ? {...optResult, optimizedPlans:rebalResult.rebalancedPlans, score5yAfter:rebalResult.score5yAfter} : optResult;
          const noChangesActive = holdings.every(h=>{
            const before=plans[h.ticker]?.amount||0;
            const after=activeResult.optimizedPlans[h.ticker]?.amount||0;
            return before===after;
          });
          // Balanced only if: no degradation AND no overweights AND no meaningful changes
          const isBalanced = !scoreDegrading && !hasOverweights && (noChangesActive || noScoreGain);

          return isBalanced&&!hasOverweights?(
            <div style={{marginTop:8,padding:"14px 16px",borderRadius:14,background:"rgba(14,203,129,0.06)",border:"0.5px solid rgba(14,203,129,0.2)",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(14,203,129,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#0ecb81" strokeWidth="1"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#0ecb81" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.accent,fontFamily:T.fontDisplay}}>Votre plan est bien équilibré</div>
                <div style={{fontSize:11,color:T.text4,marginTop:3,lineHeight:1.5,fontFamily:T.fontText}}>La répartition actuelle de vos versements est déjà optimale à 5 ans.</div>
              </div>
            </div>
          ):(
          <div style={{marginTop:8}}>
            <div style={{height:"0.5px",background:T.borderFaint,margin:"8px 0 20px"}}/>
            <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:12}}>{useRebal?"Rééquilibrage conseillé":scoreDegrading?"Scénario de stabilisation":"Scénario optimal à 5 ans"}</div>

            {/* Score comparison */}
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <div style={{flex:1,background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.text5,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>DCA actuel</div>
                <div style={{fontFamily:T.fontDisplay,fontSize:28,fontWeight:800,color:sc(activeResult.score5yBefore).text,letterSpacing:-1}}>{activeResult.score5yBefore.toFixed(1)}</div>
                <div style={{fontSize:9,color:T.text5}}>/20</div>
              </div>
              <div style={{display:"flex",alignItems:"center",color:T.accent,fontSize:16}}>→</div>
              <div style={{flex:1,background:"rgba(14,203,129,0.06)",border:"0.5px solid rgba(14,203,129,0.25)",borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.accent,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{useRebal?"Conseillé":scoreDegrading?"Stabilisé":"Optimisé"}</div>
                <div style={{fontFamily:T.fontDisplay,fontSize:28,fontWeight:800,color:sc(activeResult.score5yAfter).text,letterSpacing:-1}}>{activeResult.score5yAfter.toFixed(1)}</div>
                <div style={{fontSize:9,color:T.text5}}>/20</div>
              </div>
            </div>

            {/* Per-ETF table */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",marginBottom:4}}>
                <div style={{flex:1}}/>
                <div style={{width:64,textAlign:"center",fontSize:9,color:T.text5,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Actuel</div>
                <div style={{width:64,textAlign:"center",fontSize:9,color:T.accent,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{useRebal?"Conseillé":scoreDegrading?"Stabilisé":"Optimisé"}</div>
              </div>
              {holdings.map(h=>{
                const before=plans[h.ticker];
                const after=activeResult.optimizedPlans[h.ticker];
                const beforeAmt=before?.amount||0;
                const afterAmt=after?.amount||0;
                const freq=before?.freq||activeResult.defaultFreq;
                const freqLabel=FREQS.find(f=>f.id===freq)?.short||"/mois";
                const changed=beforeAmt!==afterAmt;
                const isNew=!before&&after;
                const isStopped=before&&!after;
                const highlight=changed||isNew||isStopped;
                return(
                  <div key={h.ticker} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,background:highlight?T.surfaceFaint:"transparent",border:`0.5px solid ${highlight?T.borderSubtle:"transparent"}`,marginBottom:4}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</div>
                      <div style={{fontSize:10,color:T.text5,marginTop:1}}>{freqLabel}</div>
                    </div>
                    <div style={{width:64,textAlign:"center",flexShrink:0}}>
                      <span style={{fontSize:12,color:T.text4,fontWeight:500}}>{beforeAmt>0?`${beforeAmt} €`:"—"}</span>
                    </div>
                    <div style={{width:64,textAlign:"center",flexShrink:0}}>
                      <span style={{fontSize:12,fontWeight:700,color:!highlight?T.text4:afterAmt>beforeAmt?T.accent:afterAmt===0?"#ff4d4d":"#ff9500"}}>
                        {afterAmt>0?`${afterAmt} €`:"—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div style={{fontSize:11,color:T.text5,lineHeight:1.6,marginBottom:16,padding:"10px 12px",background:T.surfaceFaint,borderRadius:10}}>
              Simulation indicative. Vos positions existantes ne sont pas modifiées — seuls les versements futurs changent.
            </div>

            {/* CTA */}
            <button onClick={()=>setShowConfirm(true)} style={{width:"100%",background:T.accent,border:"none",borderRadius:14,padding:"14px",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.fontDisplay}}>
              {useRebal?"Appliquer le rééquilibrage conseillé":scoreDegrading?"Appliquer le scénario de stabilisation":"Appliquer ce scénario"}
            </button>
            {showConfirm&&createPortal(
              <div onClick={()=>setShowConfirm(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999999,padding:"0 24px"}}>
                <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:380,background:T.bgElevated,border:`0.5px solid ${T.border}`,borderRadius:20,padding:"28px 24px",animation:"popIn .25s cubic-bezier(.16,1,.3,1)"}}>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,149,0,0.12)",border:"0.5px solid rgba(255,149,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 7v5M10 14.5v.5" stroke="#ff9500" strokeWidth="1.8" strokeLinecap="round"/><path d="M8.5 3.2L2 15a1.7 1.7 0 0 0 1.5 2.5h13A1.7 1.7 0 0 0 18 15L11.5 3.2a1.7 1.7 0 0 0-3 0Z" stroke="#ff9500" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{fontFamily:T.fontDisplay,fontSize:17,fontWeight:700,color:T.text,marginBottom:8}}>Mettre à jour vos ordres ?</div>
                    <div style={{fontSize:13,color:T.text4,lineHeight:1.65,fontFamily:T.fontText}}>{scoreDegrading?"Les montants de vos versements vont être ajustés pour limiter la dégradation de votre score à 5 ans.":"Les montants de vos versements programmés vont être mis à jour selon le scénario optimal."}<br/><br/>Vos <strong style={{color:T.text3}}>positions actuelles ne sont pas modifiées</strong> — seuls les versements futurs changent.</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <button onClick={()=>{
                      onPlansUpdate(activeResult.optimizedPlans);
                      localStorage.setItem("etf-dca-sim-date",new Date().toISOString());
                      setApplied(true);setShowConfirm(false);
                    }} style={{width:"100%",background:T.accent,border:"none",borderRadius:12,padding:"14px",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.fontDisplay}}>
                      Confirmer la mise à jour
                    </button>
                    <button onClick={()=>setShowConfirm(false)} style={{width:"100%",background:"none",border:"none",borderRadius:12,padding:"12px",color:T.text4,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.fontText}}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
          )
        })()}
        {applied&&(
          <div style={{marginTop:8,padding:"14px 16px",borderRadius:14,background:"rgba(14,203,129,0.06)",border:"0.5px solid rgba(14,203,129,0.2)",display:"flex",alignItems:"center",gap:10}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#0ecb81" strokeWidth="1"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#0ecb81" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.accent}}>Scénario appliqué</div>
              <div style={{fontSize:11,color:T.text4,marginTop:2}}>Pensez à relancer une simulation dans 2 ans.</div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ─── SUGGESTION SHEET ───────────────────────────────────────────────────────── */
function SuggestionSheet({catalog,onSelect,onClose}){
  return(
    <Sheet onClose={onClose}>
      <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>{catalog.emoji}</span>
            <span style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:700,color:T.text}}>{catalog.title}</span>
          </div>
          
        </div>
        <p style={{margin:"0 0 16px",fontSize:13,color:T.text4,lineHeight:1.65,fontFamily:T.fontText}}>{catalog.why}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {catalog.options.map(opt=>(
            <button key={opt.ticker} onClick={()=>onSelect(opt.ticker)}
              style={{background:T.surface4,border:`0.5px solid ${T.borderSubtle}`,borderRadius:14,padding:"13px 14px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontFamily:T.fontDisplay,fontSize:13,fontWeight:700,color:T.text}}>{DB[opt.ticker]?.name||opt.label.split(" · ")[0]}</span>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {opt.ter&&<span style={{fontSize:10,color:T.accent,fontWeight:700,background:"rgba(14,203,129,0.1)",padding:"2px 6px",borderRadius:4}}>TER {opt.ter}</span>}
                  <span style={{fontSize:9,color:T.text5,fontFamily:"monospace"}}>{opt.ticker}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",fontFamily:T.fontText}}>
                {opt.tags?.map((t,i)=>{
                  const isStar=t.includes("⭐");
                  return(
                    <span key={i} style={{
                      fontSize:10,
                      color:isStar?T.accent:T.text4,
                      background:isStar?T.accentBg:T.surface,
                      border:`0.5px solid ${isStar?T.accentBorder:T.borderSubtle}`,
                      borderRadius:20,
                      padding:"2px 8px",
                      fontWeight:isStar?600:400,
                    }}>{t}</span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
        <p style={{margin:"12px 0 0",fontSize:9,color:T.text5,textAlign:"center",letterSpacing:.3}}>Suggestions indicatives — d'autres ETF couvrent la même catégorie.</p>
      </div>
    </Sheet>
  );
}

/* ─── SEARCH ─────────────────────────────────────────────────────────────────── */
function Search({onAdd,suggestions=[],initialTicker=null}){
  const[q,setQ]=useState(initialTicker?DB[initialTicker]?.name||initialTicker:""),[amt,setAmt]=useState(""),[open,setOpen]=useState(false);
  const[hi,setHi]=useState(0),[err,setErr]=useState(""),[activeSug,setActiveSug]=useState(null);
  const[selectedTicker,setSelectedTicker]=useState(initialTicker);
  const ref=useRef(null),amtRef=useRef(null);
  useEffect(()=>{const f=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",f);return()=>document.removeEventListener("mousedown",f);},[]);
  const resolved=useMemo(()=>{if(selectedTicker)return selectedTicker;const u=q.trim().toUpperCase();if(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])return ISIN_MAP[u];return u;},[q,selectedTicker]);
  const results=useMemo(()=>{if(selectedTicker)return[];const u=q.trim().toUpperCase();if(u.length<1)return[];const s=(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])?ISIN_MAP[u]:u;return Object.entries(DB).filter(([t,e])=>t.includes(s)||e.name.toUpperCase().includes(s)||(e.isin&&e.isin.toUpperCase().includes(s))||e.p.toUpperCase().includes(s)).slice(0,5);},[q,selectedTicker]);
  const selectItem=(ticker,name)=>{
    setSelectedTicker(ticker);
    setQ(name);
    setOpen(false);
    // Focus amount field — must happen in same tick as user gesture for iOS keyboard
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        if(amtRef.current){
          amtRef.current.focus();
          amtRef.current.click();
        }
      });
    });
  };
  const doAdd=()=>{const t=resolved,a=parseFloat(amt);if(!t){setErr("Saisissez un ETF");return;}if(!DB[t]){setErr("ETF introuvable — sélectionnez dans la liste");return;}if(isNaN(a)||a<=0){setErr("Montant invalide");return;}onAdd(t,a);setQ("");setAmt("");setErr("");setOpen(false);setSelectedTicker(null);};
  const onKey=e=>{if(!open||!results.length){if(e.key==="Enter")doAdd();return;}if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>Math.min(h+1,results.length-1));}else if(e.key==="ArrowUp"){e.preventDefault();setHi(h=>Math.max(h-1,0));}else if(e.key==="Enter"){e.preventDefault();const[t,e2]=results[hi];selectItem(t,e2.name);}else if(e.key==="Escape")setOpen(false);};
  const inp={width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"box-shadow .2s, border-color .2s",fontFamily:T.fontText};
  return(
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{position:"relative"}}>
        <input value={q} onChange={e=>{setQ(e.target.value);setSelectedTicker(null);setErr("");setHi(0);setOpen(true);}}
          onFocus={e=>{if(!selectedTicker)setOpen(true);e.target.style.borderColor=T.accentGlow;e.target.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
          onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}
          onKeyDown={onKey} placeholder="Nom, ISIN ou ticker…" style={inp}/>
        {selectedTicker&&<button onMouseDown={()=>{setQ("");setSelectedTicker(null);setOpen(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:T.surfaceHover,border:"none",borderRadius:"50%",width:22,height:22,color:T.text3,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>}
        {open&&results.length>0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:T.bgDropdown,backdropFilter:"blur(20px)",border:`0.5px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:T.shadowDropdown}}>
            {results.map(([t,e],i)=>(
              <div key={t} onMouseDown={()=>selectItem(t,e.name)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",background:i===hi?T.surfaceHover:"transparent",borderBottom:`0.5px solid ${T.borderFaint}`,transition:"background .1s"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:3}}>{e.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:T.text5,fontFamily:"monospace"}}>{e.isin}</span>
                    <span style={{fontSize:10,color:ASSET_COLORS[e.assetClass]||"rgba(255,255,255,0.3)",fontWeight:500}}>· {ASSET_LABELS[e.assetClass]||e.assetClass}</span>
                    <span style={{fontSize:9,color:T.text5,fontFamily:"monospace",marginLeft:"auto",flexShrink:0}}>{t}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {open&&q.length>=2&&!selectedTicker&&results.length===0&&(
          <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:300,background:T.bgDropdown,backdropFilter:"blur(20px)",border:`0.5px solid ${T.borderSubtle}`,borderRadius:16,padding:"18px",textAlign:"center"}}>
            <div style={{fontSize:13,color:T.text4}}>Aucun résultat pour « {q} »</div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,position:"relative"}}>
          <input ref={amtRef} type="number" value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
            onFocus={e=>{e.target.style.borderColor=T.accentGlow;e.target.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}} onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}
            placeholder="Montant" style={{...inp,width:"100%",paddingRight:36}}/>
          <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.text4,fontWeight:500,pointerEvents:"none"}}>€</span>
        </div>
        <button onClick={doAdd} style={{background:T.accent,border:"none",borderRadius:14,padding:"14px 22px",color:"#000",fontSize:18,fontWeight:800,cursor:"pointer",flexShrink:0,fontFamily:T.fontDisplay,transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>+</button>
      </div>
      {err&&<div style={{fontSize:13,color:T.danger,padding:"10px 14px",background:T.dangerBg,border:`0.5px solid ${T.dangerBorder}`,borderRadius:10}}>{err}</div>}
      {suggestions.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:2}}>
          <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700}}>Suggestions</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {suggestions.map(s=>(
              <button key={s.key} onClick={()=>setActiveSug(s.key)}
                style={{background:T.surface4,border:`0.5px solid ${T.borderSubtle}`,borderRadius:20,padding:"7px 14px",color:T.textSub,fontSize:12,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:6,transition:"all .15s",WebkitTapHighlightColor:"transparent"}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.surfaceHover;e.currentTarget.style.color=T.text;}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.surface4;e.currentTarget.style.color=T.textSub;}}>
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

/* ─── BOTTOM TAB BAR ─────────────────────────────────────────────────────────── */
function Tabs({active,onChange,highlight=[]}){
  const[pressedTab,setPressedTab]=useState(null);
  const tabs=[
    {id:"scores",label:"Scores",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 1.5" strokeLinecap="round"/><circle cx="11" cy="11" r="2.5" fill="currentColor"/></svg>},
    {id:"geo",label:"Géo.",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.4"/><ellipse cx="11" cy="11" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.4"/><line x1="3.5" y1="11" x2="18.5" y2="11" stroke="currentColor" strokeWidth="1.4"/></svg>},
    {id:"sec",label:"Secteurs",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="12" width="4" height="8" rx="1" fill="currentColor" opacity=".4"/><rect x="9" y="7" width="4" height="13" rx="1" fill="currentColor" opacity=".7"/><rect x="16" y="2" width="4" height="18" rx="1" fill="currentColor"/></svg>},
    {id:"ptf",label:"Mes ETF",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 15C5 15 5.5 9 9 9C12.5 9 12.5 13 16 11.5C18.5 10.5 19.5 5 21 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>},
    {id:"about",label:"À propos",icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4"/><line x1="11" y1="10" x2="11" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="11" cy="7" r="1" fill="currentColor"/></svg>},
  ];
  const isDark=T.bg==="#050506";
  return(
    <div style={{
      position:"fixed",
      bottom:0,
      left:"50%",
      transform:"translateX(-50%)",
      width:"100%",
      maxWidth:430,
      paddingBottom:"env(safe-area-inset-bottom, 16px)",
      paddingLeft:16,
      paddingRight:16,
      paddingTop:10,
      zIndex:50,
      pointerEvents:"none",
    }}>
      {/* Liquid glass gélule */}
      <div style={{
        display:"flex",
        background:isDark?"rgba(18,18,20,0.55)":"rgba(255,255,255,0.55)",
        backdropFilter:"blur(48px) saturate(180%)",
        WebkitBackdropFilter:"blur(48px) saturate(180%)",
        borderRadius:40,
        border:`0.5px solid ${isDark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.7)"}`,
        boxShadow:isDark
          ?"0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset"
          :"0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
        padding:"6px 8px",
        pointerEvents:"auto",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Iridescent prismatic layer */}
        <div style={{
          position:"absolute",inset:0,borderRadius:40,
          background:"linear-gradient(105deg, rgba(14,203,129,0.08) 0%, rgba(59,130,246,0.07) 25%, rgba(168,85,247,0.06) 50%, rgba(251,191,36,0.05) 75%, rgba(14,203,129,0.07) 100%)",
          pointerEvents:"none",
        }}/>
        {/* Top sheen */}
        <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:"0.5px",background:isDark?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.95)",borderRadius:"0 0 2px 2px",pointerEvents:"none"}}/>
        {/* Bottom subtle glow */}
        <div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:"0.5px",background:isDark?"rgba(14,203,129,0.15)":"rgba(14,203,129,0.1)",pointerEvents:"none"}}/>
        {tabs.map(t=>{
          const isActive=active===t.id;
          return(
            <button key={t.id} onClick={()=>{onChange(t.id);setPressedTab(t.id);setTimeout(()=>setPressedTab(p=>p===t.id?null:p),600);}}
              style={{
                flex:1,background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                padding:"8px 4px",
                color:isActive?(isDark?"rgba(255,255,255,0.95)":"rgba(0,0,0,0.85)"):T.text4,
                WebkitTapHighlightColor:"transparent",
                transition:"color .2s",
                position:"relative",
                fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
                borderRadius:32,
              }}>
              {/* Active liquid glass pill */}
              {isActive&&<div style={{
                position:"absolute",inset:0,
                background:isDark?"rgba(255,255,255,0.11)":"rgba(255,255,255,0.72)",
                backdropFilter:"blur(24px) saturate(200%)",
                WebkitBackdropFilter:"blur(24px) saturate(200%)",
                borderRadius:32,
                border:"none",
                boxShadow:isDark
                  ?"inset 0 0.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.10), inset 0.5px 0 rgba(255,255,255,0.08), inset -0.5px 0 rgba(255,255,255,0.08), 0 2px 12px rgba(0,0,0,0.25)"
                  :"inset 0 0.5px 0 rgba(255,255,255,1), inset 0 -0.5px 0 rgba(255,255,255,0.5), inset 0.5px 0 rgba(255,255,255,0.2), inset -0.5px 0 rgba(255,255,255,0.2), 0 2px 10px rgba(0,0,0,0.08)",
              }}/>}
              {/* Organic iridescent sheen on active */}
              {isActive&&<div style={{
                position:"absolute",inset:0,borderRadius:32,
                background:"linear-gradient(135deg, rgba(14,203,129,0.18) 0%, rgba(59,130,246,0.14) 25%, rgba(168,85,247,0.12) 50%, rgba(251,191,36,0.10) 75%, rgba(14,203,129,0.15) 100%)",
                pointerEvents:"none",
              }}/>}
              {/* Organic iridescent burst on press */}
              {pressedTab===t.id&&(
                <div style={{
                  position:"absolute",
                  inset:0,
                  borderRadius:32,
                  background:"transparent",
                  boxShadow:"inset 0 -6px 10px -5px rgba(14,203,129,0.3), inset 0 -4px 8px -5px rgba(59,130,246,0.22), inset 0 -3px 6px -5px rgba(168,85,247,0.15)",
                  animation:"tabGlow .55s cubic-bezier(.16,1,.3,1) forwards",
                  pointerEvents:"none",
                  zIndex:0,
                }}/>
              )}
              <div style={{
                position:"relative",zIndex:1,
                animation:pressedTab===t.id?"tabLens .5s cubic-bezier(.16,1,.3,1) forwards":"none",
              }}>
                {t.icon}
              </div>
              <span style={{fontSize:9,fontWeight:isActive?600:400,letterSpacing:.3,lineHeight:1,position:"relative",zIndex:1}}>{t.label}</span>
              {highlight.includes(t.id)&&!isActive&&<div style={{position:"absolute",top:6,right:"18%",width:5,height:5,borderRadius:"50%",background:T.accent,boxShadow:`0 0 6px ${T.accent}`,animation:"pulse 2s infinite"}}/>}
            </button>
          );
        })}
      </div>
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
        <div style={{fontFamily:T.fontDisplay,fontSize:18,fontWeight:800,color:T.text,marginBottom:14,letterSpacing:-.3}}>À titre informatif uniquement</div>
        <p style={{fontSize:13,color:T.text4,lineHeight:1.7,margin:"0 0 14px"}}>ETF Score est un outil d'analyse personnel. Les scores et suggestions <strong style={{color:T.text2}}>ne constituent pas un conseil en investissement</strong> au sens de la réglementation AMF.</p>
        <p style={{fontSize:13,color:T.text4,lineHeight:1.7,margin:"0 0 28px"}}>Tout investissement comporte un risque de perte en capital.</p>
        <button onClick={onAccept} style={{width:"100%",background:T.accent,border:"none",borderRadius:14,padding:"16px",color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:T.fontDisplay,letterSpacing:.3,transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          J'ai compris, accéder à l'app
        </button>
      </Glass>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────────── */
function Toast({msg,visible,onUndo,undoLabel,position="bottom"}){
  const isTop=position==="top";
  const posStyle=isTop
    ?{top:"calc(env(safe-area-inset-top,16px) + 56px)",transform:`translateX(-50%) translateY(${visible?0:-12}px)`}
    :{bottom:"calc(60px + env(safe-area-inset-bottom, 0px) + 16px)",transform:`translateX(-50%) translateY(${visible?0:12}px)`};
  return(
    <div style={{position:"fixed",left:"50%",...posStyle,opacity:visible?1:0,transition:"all .3s cubic-bezier(.16,1,.3,1)",background:T.bgDropdown,backdropFilter:"blur(20px)",border:`0.5px solid ${T.border}`,borderRadius:20,padding:"11px 18px",zIndex:999999,display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:visible?"auto":"none",whiteSpace:"nowrap"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,boxShadow:"0 0 8px #0ecb81",flexShrink:0}}/>
      <span style={{fontSize:13,color:T.text,fontFamily:T.fontText}}>{msg}</span>
      {onUndo&&<button onClick={onUndo} style={{background:"none",border:"none",color:T.accent,fontSize:13,fontWeight:700,cursor:"pointer",padding:"0 0 0 6px",fontFamily:T.fontText}}>{undoLabel||"Annuler"}</button>}
    </div>
  );
}

/* ─── SWIPE TO DELETE ROW ────────────────────────────────────────────────────── */
function SwipeToDelete({children,onDelete,disabled,playHint,onHintPlayed}){
  const[dx,setDx]=useState(0);
  const[confirmed,setConfirmed]=useState(false);
  const[ctxMenu,setCtxMenu]=useState(null); // {x,y} position of context menu
  const startX=useRef(null);
  const startY=useRef(null);
  const dragging=useRef(false);
  const[isDraggingSwipe,setIsDraggingSwipe]=useState(false);
  const[hintAnim,setHintAnim]=useState(false);
  const THRESHOLD=72;
  const BTN_W=64;
  const GAP=8;

  const onTouchStart=e=>{
    if(disabled)return;
    startX.current=e.touches[0].clientX;
    startY.current=e.touches[0].clientY;
    dragging.current=false;
  };
  const onTouchMove=e=>{
    if(startX.current===null)return;
    const dxRaw=e.touches[0].clientX-startX.current;
    const dyRaw=e.touches[0].clientY-startY.current;
    if(!dragging.current&&Math.abs(dyRaw)>Math.abs(dxRaw))return;
    if(dxRaw>0){setDx(0);return;}
    dragging.current=true;
    setIsDraggingSwipe(true);
    e.stopPropagation();
    const raw=Math.abs(dxRaw);
    const capped=raw>THRESHOLD?THRESHOLD+(raw-THRESHOLD)*0.2:raw;
    setDx(-capped);
  };
  const onTouchEnd=()=>{
    if(Math.abs(dx)>=THRESHOLD-4){setDx(-THRESHOLD);}else{setDx(0);}
    startX.current=null;
    dragging.current=false;
    setIsDraggingSwipe(false);
  };

  useEffect(()=>{
    if(!playHint)return;
    localStorage.setItem("etf-swipe-hint-seen","1");
    const isTouch=window.matchMedia("(hover:none) and (pointer:coarse)").matches;
    // Mark as seen AFTER animation completes so tab switches don't replay it
    // but playHint is captured at mount — re-renders won't re-trigger this effect
    if(!isTouch){onHintPlayed?.();return;}
    const t1=setTimeout(()=>setHintAnim(true),3000);
    // Mark seen after full sequence (3000 delay + 900 animation + buffer)
    const t2=setTimeout(()=>onHintPlayed?.(),4200);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[playHint]);

  // Drive dx via hintAnim: full swipe to THRESHOLD, pause, snap back
  useEffect(()=>{
    if(!hintAnim)return;
    const t1=setTimeout(()=>setDx(-(BTN_W+8)),50);   // slide open
    const t2=setTimeout(()=>setDx(0),900);            // snap back after pause
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[hintAnim]);

  const onContextMenu=e=>{
    e.preventDefault();
    // Clamp so menu never overflows viewport
    const menuW=160,menuH=44;
    const x=Math.min(e.clientX,window.innerWidth-menuW-8);
    const y=Math.min(e.clientY,window.innerHeight-menuH-8);
    setCtxMenu({x,y});
  };

  const closeCtx=()=>setCtxMenu(null);

  const handleDelete=()=>{
    setConfirmed(true);
    closeCtx();
    onDelete();
  };

  if(confirmed)return null;

  // How much space the delete button occupies (0 → BTN_W during open)
  const OPEN=BTN_W+8;
  const revealPct=Math.min(1,Math.abs(dx)/THRESHOLD);
  const btnOpacity=revealPct;

  // Close on outside click/touch — captured at document level
  useEffect(()=>{
    if(dx>=0&&!ctxMenu)return;
    const close=e=>{
      // Let clicks on swipe button or context menu pass through untouched
      if(e.target.closest&&(e.target.closest("[data-swipe-btn]")||e.target.closest("[data-ctx-menu]")))return;
      setDx(0);closeCtx();
    };
    document.addEventListener("mousedown",close,true);
    document.addEventListener("touchstart",close,{capture:true,passive:true});
    return()=>{
      document.removeEventListener("mousedown",close,true);
      document.removeEventListener("touchstart",close,{capture:true,passive:true});
    };
  },[dx,ctxMenu]);

  return(
    <div style={{position:"relative",borderRadius:14}}>
      {/* Flex row: card + delete button side by side, translated together */}
      <div style={{display:"flex",transform:`translateX(${dx}px)`,transition:isDraggingSwipe?"none":"transform .38s cubic-bezier(.16,1,.3,1)",willChange:"transform"}}>
        {/* Sliding card */}
        <div
          style={{flex:"0 0 100%",minWidth:"100%",borderRadius:14}}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={onContextMenu}
        >
          {children}
        </div>
        {/* Delete button — gap left + fully rounded */}
        <div data-swipe-btn style={{flex:`0 0 ${BTN_W+8}px`,width:BTN_W+8,paddingLeft:8,boxSizing:"border-box",display:"flex",alignItems:"center"}}>
          <button
            data-swipe-btn
            onClick={handleDelete}
            style={{
              width:BTN_W,height:"100%",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
              background:"rgba(255,59,48,0.15)",border:"0.5px solid rgba(255,59,48,0.25)",
              borderRadius:14,cursor:"pointer",
              opacity:btnOpacity,
              transition:"opacity .15s",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M6 4V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V4M5.5 7v4M9.5 7v4M3.5 4l.7 8.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L11.5 4" stroke="#ff3b30" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:9,color:"#ff3b30",fontWeight:700,letterSpacing:.3}}>Suppr.</span>
          </button>
        </div>
      </div>
      {/* Context menu (desktop right-click) */}
      {ctxMenu&&createPortal(
        <div
          data-ctx-menu
          style={{
            position:"fixed",left:ctxMenu.x,top:ctxMenu.y,
            zIndex:99999,
            background:"rgba(28,28,30,0.96)",
            backdropFilter:"blur(20px)",
            border:"0.5px solid rgba(255,255,255,0.1)",
            borderRadius:12,
            overflow:"hidden",
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
            minWidth:160,
            animation:"popIn .15s cubic-bezier(.16,1,.3,1)",
          }}
          onClick={e=>e.stopPropagation()}
        >
          <button
            data-ctx-menu
            onClick={handleDelete}
            style={{
              width:"100%",display:"flex",alignItems:"center",gap:10,
              padding:"11px 14px",background:"none",border:"none",
              cursor:"pointer",color:"#ff3b30",fontSize:13,fontWeight:600,
              fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",textAlign:"left",
              transition:"background .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,59,48,0.12)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M6 4V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V4M5.5 7v4M9.5 7v4M3.5 4l.7 8.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L11.5 4" stroke="#ff3b30" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Supprimer l'ETF
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}


/* ─── WELCOME SCREEN ─────────────────────────────────────────────────────────── */
function WelcomeScreen({etfCount,onDone}){
  const canvasRef=useRef(null);
  const[phase,setPhase]=useState("in"); // in → hold → out

  // Confetti
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    const particles=[];
    const colors=["#0ecb81","#ffffff","#a78bfa","#60a5fa","#fbbf24","#f472b6"];
    for(let i=0;i<90;i++){
      particles.push({
        x:Math.random()*canvas.width,
        y:-20-Math.random()*200,
        r:Math.random()*5+2,
        d:Math.random()*2+1,
        color:colors[Math.floor(Math.random()*colors.length)],
        tilt:Math.random()*10-5,
        tiltAngle:0,
        tiltSpeed:Math.random()*.07+.02,
      });
    }
    let frame;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{
        p.tiltAngle+=p.tiltSpeed;
        p.y+=p.d+1;
        p.x+=Math.sin(p.tiltAngle)*1.5;
        p.tilt=Math.sin(p.tiltAngle)*12;
        if(p.y>canvas.height+20){p.y=-20;p.x=Math.random()*canvas.width;}
        ctx.beginPath();
        ctx.lineWidth=p.r;
        ctx.strokeStyle=p.color;
        ctx.moveTo(p.x+p.tilt+p.r/2,p.y);
        ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2);
        ctx.stroke();
      });
      frame=requestAnimationFrame(draw);
    };
    // Small delay before starting
    const t=setTimeout(()=>draw(),100);
    return()=>{clearTimeout(t);cancelAnimationFrame(frame);};
  },[]);

  // Auto dismiss after 2.8s
  useEffect(()=>{
    const t=setTimeout(()=>{setPhase("out");},2200);
    const t2=setTimeout(()=>onDone(),2700);
    return()=>{clearTimeout(t);clearTimeout(t2);};
  },[]);

  return(
    <div style={{
      position:"fixed",inset:0,zIndex:99999,
      display:"flex",justifyContent:"center",
      opacity:phase==="out"?0:1,
      transition:phase==="out"?"opacity .5s cubic-bezier(.16,1,.3,1)":"opacity .3s",
      pointerEvents:"none",
    }}>
      <div style={{
        width:"100%",maxWidth:430,height:"100%",
        background:T.bg,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        gap:8,position:"relative",overflow:"hidden",
      }}>
        <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:52,animation:"popIn .5s cubic-bezier(.16,1,.3,1) .1s both"}}>🎉</div>
          <div style={{fontFamily:T.fontDisplay,fontSize:22,fontWeight:800,color:T.text,letterSpacing:-.5,animation:"up .5s cubic-bezier(.16,1,.3,1) .2s both"}}>
            Portefeuille créé !
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,animation:"up .5s cubic-bezier(.16,1,.3,1) .35s both"}}>
            <div style={{fontFamily:T.fontDisplay,fontSize:64,fontWeight:800,color:T.accent,lineHeight:1,letterSpacing:-2}}>
              {etfCount}
            </div>
            <div style={{fontSize:13,color:T.text4,letterSpacing:.3}}>ETF {etfCount>1?"ajoutés":"ajouté"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SPLASH ─────────────────────────────────────────────────────────────────── */
function Splash({visible}){
  return(
    <div style={{
      position:"fixed",inset:0,background:T.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      zIndex:999999,
      opacity:visible?1:0,
      pointerEvents:visible?"auto":"none",
      transition:"opacity .6s cubic-bezier(.16,1,.3,1)",
    }}>
      {/* Logo */}
      <div style={{
        position:"relative",
        animation:visible?"splashPop .6s cubic-bezier(.16,1,.3,1) .2s both":"none",
      }}>
        {/* Glow */}
        <div style={{
          position:"absolute",inset:-40,
          background:"radial-gradient(circle,rgba(14,203,129,0.15) 0%,transparent 70%)",
          animation:visible?"splashGlow 1.2s ease .4s both":"none",
        }}/>
        <img src="/logo-etf_score.svg" alt="ETF Score" style={{
          width:35,height:40,
          objectFit:"contain",
          position:"relative",zIndex:1,
          filter:T.bg==="#050506"?"invert(1)":"none",
        }}/>
      </div>

      {/* App name */}
      <div style={{
        marginTop:20,
        animation:visible?"splashText .5s cubic-bezier(.16,1,.3,1) .5s both":"none",
      }}>
        <div style={{fontSize:22,fontWeight:700,color:T.text,letterSpacing:-.5,textAlign:"center"}}>ETF Score</div>
        <div style={{fontSize:11,color:T.bg==="#050506"?"rgba(255,255,255,0.55)":"rgba(0,0,0,0.55)",textAlign:"center",marginTop:4,letterSpacing:2,textTransform:"uppercase"}}>Analyse multicritères</div>
      </div>

      {/* Bottom indicator */}
      <div style={{
        position:"absolute",bottom:48,
        animation:visible?"splashText .5s ease .8s both":"none",
      }}>
        <div style={{width:32,height:3,borderRadius:2,background:T.surfaceHover,overflow:"hidden"}}>
          <div style={{height:"100%",background:T.accent,borderRadius:2,animation:visible?"splashBar 1.2s ease .3s both":"none"}}/>
        </div>
      </div>
    </div>
  );
}

/* ─── ONBOARDING ─────────────────────────────────────────────────────────────── */
function Onboarding({onAdd,onDone,onToast}){
  const[step,setStep]=useState(0);
  const[q,setQ]=useState("");
  const[amt,setAmt]=useState("");
  const[open,setOpen]=useState(false);
  const[selectedTicker,setSelectedTicker]=useState(null);
  const[err,setErr]=useState("");
  const[added,setAdded]=useState([]);
  const[lastAdded,setLastAdded]=useState(null);
  const[inputFocused,setInputFocused]=useState(false); // ETFs added during onboarding
  const[kbOffset,setKbOffset]=useState(0); // keyboard push offset in px
  const contentRef=useRef(null);

  // Track visual viewport to compute exact offset needed
  useEffect(()=>{
    const vv=window.visualViewport;
    if(!vv)return;
    const update=()=>{
      if(!inputFocused){setKbOffset(0);return;}
      const el=contentRef.current;
      if(!el)return;
      // How much the viewport shrank = keyboard height approx
      const shrink=window.innerHeight-vv.height;
      if(shrink<=50){setKbOffset(0);return;} // no real keyboard
      // Check if the input area bottom is hidden
      const rect=el.getBoundingClientRect();
      const inputsEl=el.querySelector("[data-onboarding-inputs]");
      if(!inputsEl){setKbOffset(0);return;}
      const inputsBottom=inputsEl.getBoundingClientRect().bottom;
      const visibleBottom=vv.offsetTop+vv.height-16; // 16px breathing room
      const overflow=inputsBottom-visibleBottom;
      setKbOffset(overflow>0?-overflow:0);
    };
    vv.addEventListener("resize",update);
    return()=>vv.removeEventListener("resize",update);
  },[inputFocused]);
  const ref=useRef(null);
  const amtRef=useRef(null);
  const focusingAmt=useRef(false);
  const swipeStart=useRef(null);
  const[dragX,setDragX]=useState(0);
  const isDragging=useRef(false);

  useEffect(()=>{const f=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",f);return()=>document.removeEventListener("mousedown",f);},[]);

  const results=useMemo(()=>{
    if(selectedTicker)return[];
    const u=q.trim().toUpperCase();
    if(u.length<1)return[];
    const s=(/^[A-Z]{2}[A-Z0-9]{10}$/.test(u)&&ISIN_MAP[u])?ISIN_MAP[u]:u;
    return Object.entries(DB).filter(([t,e])=>t.includes(s)||e.name.toUpperCase().includes(s)||(e.isin&&e.isin.toUpperCase().includes(s))).slice(0,4);
  },[q,selectedTicker]);

  const selectItem=(ticker,name,focusNow=false)=>{
    setSelectedTicker(ticker);
    setQ(name);
    setOpen(false);
    focusingAmt.current=true;
    if(focusNow&&amtRef.current){
      // Direct focus in the user gesture callstack — required for iOS PWA keyboard
      amtRef.current.focus();
      amtRef.current.click();
      focusingAmt.current=false;
    } else {
      // Fallback for non-touch (mousedown already moved focus)
      requestAnimationFrame(()=>{
        if(amtRef.current){
          amtRef.current.focus();
          amtRef.current.click();
        }
        focusingAmt.current=false;
      });
    }
  };

  const addOne=()=>{
    const t=selectedTicker;
    const a=parseFloat(amt);
    if(!t||!DB[t]){setErr("Sélectionnez un ETF dans la liste");return;}
    if(isNaN(a)||a<=0){setErr("Montant invalide");return;}
    const newIdx=added.length;
    setAdded(prev=>[...prev,{ticker:t,name:DB[t].name,amount:a}]);
    setLastAdded(newIdx);
    setTimeout(()=>setLastAdded(null),1200);
    onToast?.(`${DB[t].name} ajouté`);
    setQ("");setAmt("");setSelectedTicker(null);setErr("");setOpen(false);
  };

  const done=()=>{
    // Commit all added ETFs to parent on exit
    added.forEach(h=>onAdd(h.ticker,h.amount));
    localStorage.setItem("etf-onboarding-seen","1");
    onDone(added.length>0);
  };

  // Swipe handling — content follows finger
  const onTouchStart=e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;swipeStart.current=e.touches[0].clientX;isDragging.current=true;};
  const onTouchMove=e=>{
    if(!isDragging.current)return;
    const dx=e.touches[0].clientX-swipeStart.current;
    // Resist swiping past boundaries
    if((step===0&&dx>0)||(step===1&&dx<0))setDragX(dx*0.3);
    else setDragX(dx);
  };
  const onTouchEnd=e=>{
    if(!isDragging.current)return;
    isDragging.current=false;
    const dx=e.changedTouches[0].clientX-swipeStart.current;
    if(dx<-60&&step<2){setStep(s=>s+1);}
    else if(dx>60&&step>0){setStep(s=>s-1);}
    setDragX(0);
    swipeStart.current=null;
  };

  const screens=[
    {
      icon:(
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="32" stroke="rgba(14,203,129,0.12)" strokeWidth="1"/>
          <circle cx="36" cy="36" r="22" stroke="rgba(14,203,129,0.08)" strokeWidth="1"/>
          <path d="M18 46C23 46 25 32 30 32C35 32 35 40 41 37C46 34 49 22 55 18" stroke="#0ecb81" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 8px #0ecb81)"/>
          <circle cx="55" cy="18" r="4" fill="#0ecb81" filter="drop-shadow(0 0 8px #0ecb81)"/>
        </svg>
      ),
      title:"Analysez votre portefeuille ETF",
      text:"ETF Score évalue la diversification de vos investissements selon 5 critères — géographie, secteurs, chevauchements, classes d'actifs et devises.",
    },
    {
      icon:(
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <rect x="8" y="42" width="14" height="22" rx="2" fill="rgba(14,203,129,0.1)" stroke="rgba(14,203,129,0.3)" strokeWidth="1"/>
          <rect x="29" y="28" width="14" height="36" rx="2" fill="rgba(14,203,129,0.2)" stroke="rgba(14,203,129,0.4)" strokeWidth="1"/>
          <rect x="50" y="12" width="14" height="52" rx="2" fill="rgba(14,203,129,0.35)" stroke="#0ecb81" strokeWidth="1"/>
          <circle cx="57" cy="7" r="5" fill="#0ecb81" filter="drop-shadow(0 0 8px #0ecb81)"/>
        </svg>
      ),
      title:"Un score clair sur 20",
      text:"Chaque critère est pondéré et analysé pour vous donner un score global et des recommandations concrètes.",
    },
  ];

  const isAddStep=step===2;

  const Dots=()=>(
    <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:32}}>
      {[0,1,2].map(i=>(
        <div key={i} onClick={()=>{ if(i<2)setStep(i); }} style={{width:i===step?24:6,height:6,borderRadius:3,background:i===step?T.accent:T.borderSubtle,transition:"all .3s cubic-bezier(.16,1,.3,1)",cursor:i<2?"pointer":"default"}}/>
      ))}
    </div>
  );

  // All 3 slides in one unified track
  const TOTAL_SLIDES = 3;

  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:99998,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",overflow:"hidden"}}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>



      {/* Top nav */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"calc(env(safe-area-inset-top,16px) + 8px) 20px 8px",zIndex:100,pointerEvents:"none"}}>
        <div style={{pointerEvents:"auto"}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:T.bgBlur,backdropFilter:"blur(20px)",border:`0.5px solid ${T.border}`,borderRadius:20,color:T.textSub,fontSize:20,cursor:"pointer",padding:"6px 14px",lineHeight:1}}>‹</button>}
        </div>
        <button onClick={done} style={{pointerEvents:"auto",background:T.bgBlur,backdropFilter:"blur(20px)",border:`0.5px solid ${T.border}`,borderRadius:20,color:T.text4,fontSize:12,cursor:"pointer",padding:"6px 14px"}}>Passer</button>
      </div>

      {/* ── UNIFIED TRACK — all 3 slides ── */}
      <div style={{flex:1,overflow:"hidden",position:"relative",paddingTop:"calc(env(safe-area-inset-top,16px) + 52px)"}}>
        <div style={{display:"flex",height:"100%",width:`${TOTAL_SLIDES*100}%`,transform:`translateX(calc(${-step*(100/TOTAL_SLIDES)}% + ${dragX}px))`,transition:isDragging.current?"none":"transform .4s cubic-bezier(.16,1,.3,1)",willChange:"transform"}}>

          {/* Slide 1 & 2 — info */}
          {screens.map((s,i)=>(
            <div key={i} style={{width:`${100/TOTAL_SLIDES}%`,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",boxSizing:"border-box",overflow:"hidden",paddingBottom:120}}>
              {s.icon}
              <div style={{marginTop:36,textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:700,color:T.text,lineHeight:1.3,marginBottom:14,letterSpacing:-.3}}>{s.title}</div>
                <div style={{fontSize:15,color:T.text4,lineHeight:1.75}}>{s.text}</div>
              </div>
            </div>
          ))}

          {/* Slide 3 — Add ETF */}
          <div style={{width:`${100/TOTAL_SLIDES}%`,flexShrink:0,display:"flex",flexDirection:"column",position:"relative",boxSizing:"border-box",overflow:"hidden"}}>
            <div ref={contentRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"0 24px",paddingBottom:120,transform:`translateY(${kbOffset}px)`,transition:"transform .35s cubic-bezier(.16,1,.3,1)"}}>
              <div style={{textAlign:"center",marginBottom:28,marginTop:"5vh"}}>
                <div style={{fontSize:21,fontWeight:700,color:T.text,marginBottom:8,letterSpacing:-.3}}>Constituez votre portefeuille</div>
                <div style={{fontSize:14,color:T.text4,lineHeight:1.7,maxWidth:300,margin:"0 auto"}}>Ajoutez autant d'ETF que vous souhaitez. Vous pourrez toujours modifier depuis l'app.</div>
              </div>

              {/* Added list */}
              {added.length>0&&(
                <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:6}}>
                  {added.map((h,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:lastAdded===i?T.accentBg:T.surfaceFaint,border:`0.5px solid ${lastAdded===i?"rgba(14,203,129,0.4)":"rgba(14,203,129,0.15)"}`,borderRadius:12,padding:"10px 14px",animation:lastAdded===i?"popIn .4s cubic-bezier(.16,1,.3,1)":"none",boxShadow:lastAdded===i?"0 0 16px rgba(14,203,129,0.2)":"none",transition:"background .4s,border .4s,box-shadow .4s"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.name}</div>
                        <div style={{fontSize:10,color:T.text4,marginTop:2}}>{h.ticker}</div>
                      </div>
                      <input type="number" defaultValue={h.amount}
                        onBlur={e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>0)setAdded(prev=>prev.map((x,j)=>j===i?{...x,amount:v}:x));else e.target.value=h.amount;}}
                        onKeyDown={e=>e.key==="Enter"&&e.target.blur()}
                        style={{width:72,background:T.surfaceMed,border:`0.5px solid ${T.border}`,borderRadius:8,padding:"4px 8px",color:T.accent,fontSize:12,fontWeight:600,textAlign:"right",outline:"none",fontFamily:"monospace",WebkitAppearance:"none"}}/>
                      <span style={{fontSize:10,color:T.text5,flexShrink:0}}>€</span>
                      <button onClick={()=>setAdded(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.text5,fontSize:16,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1,transition:"color .15s"}} onMouseEnter={e=>e.currentTarget.style.color="#ff4d4d"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.2)"}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div ref={ref} data-onboarding-inputs style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{position:"relative"}}>
                  <input value={q} onChange={e=>{setQ(e.target.value);setSelectedTicker(null);setErr("");setOpen(true);}}
                    onFocus={e=>{if(!selectedTicker)setOpen(true);e.target.style.borderColor=T.accentGlow;e.target.style.boxShadow=`0 0 0 3px ${T.accentBg}`;setInputFocused(true);}}
                    onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";if(!focusingAmt.current&&(!e.relatedTarget||!e.relatedTarget.closest("[data-onboarding-inputs]")))setTimeout(()=>setInputFocused(false),200);}}
                    placeholder="Nom, ISIN ou ticker…"
                    style={{width:"100%",background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:14,padding:"15px 16px",color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
                  {selectedTicker&&<button onMouseDown={()=>{setQ("");setSelectedTicker(null);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:T.surfaceHover,border:"none",borderRadius:"50%",width:22,height:22,color:T.text3,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
                  {open&&results.length>0&&(
                    <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:10,background:T.bgDropdown,border:`0.5px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:T.shadowDropdown}}>
                      {results.map(([t,e])=>(
                        <div key={t} onMouseDown={()=>selectItem(t,e.name)} onTouchEnd={ev=>{ev.preventDefault();selectItem(t,e.name,true);}} style={{padding:"13px 16px",cursor:"pointer",borderBottom:`0.5px solid ${T.borderFaint}`,transition:"background .1s"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.surfaceHover} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                          <div style={{fontSize:13,fontWeight:500,color:T.text,marginBottom:3}}>{e.name}</div>
                          <div style={{fontSize:10,color:T.text5,fontFamily:"monospace"}}>{e.isin} · {ASSET_LABELS[e.assetClass]||e.assetClass}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{position:"relative"}}>
                  <input ref={amtRef} type="number" value={amt} onChange={e=>setAmt(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addOne()}
                    onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";if(!e.relatedTarget||!e.relatedTarget.closest("[data-onboarding-inputs]"))setTimeout(()=>setInputFocused(false),200);if(selectedTicker&&parseFloat(amt)>0)addOne();}}
                    onFocus={e=>{e.target.style.borderColor=T.accentGlow;e.target.style.boxShadow=`0 0 0 3px ${T.accentBg}`;setInputFocused(true);}}
                    inputMode="decimal" placeholder="Montant investi"
                    style={{width:"100%",background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:14,padding:"15px 36px 15px 16px",color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border-color .2s",WebkitAppearance:"none"}}/>
                  <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.text4,fontWeight:500,pointerEvents:"none"}}>€</span>
                </div>
                {err&&<div style={{fontSize:13,color:T.danger,padding:"10px 14px",background:T.dangerBg,border:`0.5px solid ${T.dangerBorder}`,borderRadius:10}}>{err}</div>}
                <div>
                  <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Populaires</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {[{t:"IWDA",l:"iShares Monde"},{t:"VWCE",l:"Vanguard All-World"},{t:"MWRD",l:"Amundi Monde PEA"},{t:"PAEEM",l:"Émergents PEA"}].map(({t,l})=>(
                      <button key={t} onMouseDown={()=>selectItem(t,DB[t]?.name||l)} onTouchEnd={e=>{e.preventDefault();selectItem(t,DB[t]?.name||l,true);}} style={{background:T.surface4,border:`0.5px solid ${T.border}`,borderRadius:20,padding:"6px 14px",color:T.text3,fontSize:12,cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.surfaceHover;e.currentTarget.style.color=T.text;}} onMouseLeave={e=>{e.currentTarget.style.background=T.surface4;e.currentTarget.style.color=T.text3;}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {/* Import hint */}
                  <div style={{marginTop:16,paddingTop:14,borderTop:`0.5px solid ${T.borderFaint}`,display:"flex",alignItems:"center",gap:8}}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke={T.text5} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10" stroke={T.text5} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span style={{fontSize:11,color:T.text5,lineHeight:1.5}}>Vous avez déjà un portefeuille ? Importez un CSV depuis l'onglet <strong style={{color:T.text4,fontWeight:600}}>Mes ETF</strong> après l'introduction.</span>
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>
      </div>

      {/* ── FIXED BOTTOM CONTROLS — outside track, same position on all 3 slides ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10}}>
        <div style={{height:48,background:`linear-gradient(to bottom,transparent,${T.bg})`,pointerEvents:"none"}}/>
        <div style={{background:T.bg,padding:"4px 24px 40px"}}>
          <Dots/>
          {step<2?(
            <button onClick={()=>setStep(s=>s+1)}
              style={{width:"100%",background:T.surfaceMed,border:`0.5px solid ${T.border}`,borderRadius:16,padding:"17px",color:T.text2,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:.2,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
              onMouseLeave={e=>e.currentTarget.style.background=T.surfaceMed}>
              Suivant
            </button>
          ):(
            <button onClick={done}
              style={{width:"100%",background:added.length>0?T.accent:T.surfaceMed,border:added.length>0?"none":`0.5px solid ${T.border}`,borderRadius:16,padding:"17px",color:added.length>0?"#000":T.text4,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:.2,transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              {added.length>0?`Analyser mon portefeuille (${added.length} ETF) →`:"Passer cette étape"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PLAN SHEET ─────────────────────────────────────────────────────────────── */
const FREQS=[
  {id:"weekly",label:"Hebdomadaire",short:"/ sem.",weeks:52},
  {id:"monthly",label:"Mensuel",short:"/ mois",weeks:4.33},
  {id:"quarterly",label:"Trimestriel",short:"/ trim.",weeks:13},
];

function planStats(plan){
  if(!plan?.amount||!plan?.startDate) return null;
  const start=new Date(plan.startDate);
  const now=new Date();
  const freq=FREQS.find(f=>f.id===plan.freq)||FREQS[1];

  // Periods per year per frequency
  const periodsPerYear={weekly:52,monthly:12,quarterly:4}[freq.id]||12;
  const versementsParAn=periodsPerYear;

  // Days per period (calendar-accurate)
  const daysPerPeriod={weekly:7,monthly:30.4375,quarterly:91.3125}[freq.id]||30.4375;
  const msPerPeriod=daysPerPeriod*24*60*60*1000;

  const elapsed=Math.max(0,now-start);
  const rawPeriods=Math.floor(elapsed/msPerPeriod);
  // If start date is today or past, count at least 1 period (first payment done)
  const periodsElapsed=rawPeriods===0&&start<=now?1:rawPeriods;
  const totalInvested=periodsElapsed*plan.amount;
  const perYear=plan.amount*versementsParAn;
  const projection10y=Math.round(plan.amount*versementsParAn*10);

  // Next payment date — use rawPeriods (not periodsElapsed) to avoid double-counting
  let nextDate;
  if(rawPeriods===0&&start>now){
    // First payment not yet reached — next is simply the start date
    nextDate=start;
  } else {
    nextDate=new Date(start.getTime()+(rawPeriods+1)*msPerPeriod);
  }
  const daysUntilNext=Math.max(1,Math.ceil((nextDate-now)/(1000*60*60*24)));

  return{totalInvested,perYear,daysUntilNext,periodsElapsed,freq,projection10y,versementsParAn};
}

function PlanSheet({ticker,plan,onSave,onDelete,onClose}){
  const[freq,setFreq]=useState(plan?.freq||"monthly");
  const[amount,setAmount]=useState(plan?.amount||"");
  const[startDate,setStartDate]=useState(plan?.startDate||new Date().toISOString().split("T")[0]);
  const etf=DB[ticker];
  const preview=planStats({freq,amount:parseFloat(amount)||0,startDate});

  return(
    <Sheet onClose={onClose}>
      <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:T.text}}>Plan d'investissement</div>
            <div style={{fontSize:12,color:T.text4,marginTop:2}}>{etf?.name||ticker}</div>
          </div>
          
        </div>

        {/* Frequency selector */}
        <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Fréquence</div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {FREQS.map(f=>(
            <button key={f.id} onClick={()=>setFreq(f.id)}
              style={{flex:1,background:freq===f.id?T.accentBg:T.surface4,border:`0.5px solid ${freq===f.id?T.accentBorder:T.borderSubtle}`,borderRadius:12,padding:"10px 4px",color:freq===f.id?T.accent:T.text4,fontSize:11,fontWeight:freq===f.id?700:400,cursor:"pointer",transition:"all .15s"}}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Montant par versement</div>
        <div style={{position:"relative",marginBottom:20}}>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            style={{width:"100%",background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:14,padding:"14px 36px 14px 16px",color:T.text,fontSize:20,fontWeight:700,outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color .2s"}}
            onFocus={e=>{e.target.style.borderColor=T.accentGlow;e.target.style.boxShadow=`0 0 0 3px ${T.accentBg}`;}}
            onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}/>
          <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:T.text5,fontWeight:500,pointerEvents:"none"}}>€</span>
        </div>

        {/* Start date */}
        <div style={{fontSize:9,color:T.text5,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Prochaine exécution</div>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          style={{width:"100%",background:T.surface,border:`0.5px solid ${T.border}`,borderRadius:14,padding:"14px 16px",color:T.text2,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:20,colorScheme:T.bg==="#050506"?"dark":"light"}}/>

        {/* Preview */}
        {preview&&startDate&&(
          <div style={{background:"rgba(14,203,129,0.06)",border:"0.5px solid rgba(14,203,129,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
            {preview.periodsElapsed===0?(
              /* Avant premier versement — projection marketing */
              <div style={{textAlign:"center",padding:"6px 0"}}>
                <div style={{fontSize:9,color:T.text4,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Projection sur 10 ans</div>
                <div style={{fontSize:28,fontWeight:800,color:T.accent,letterSpacing:-1}}>{preview.projection10y.toLocaleString("fr-FR")} €</div>
                <div style={{fontSize:11,color:T.text4,marginTop:4}}>à ce rythme, sans intérêts</div>
              </div>
            ):(
              /* Après premier versement — 4 stats complètes */
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Total investi</div>
                  <div style={{fontSize:18,fontWeight:700,color:T.accent}}>{preview.totalInvested.toLocaleString("fr-FR")} €</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Par an</div>
                  <div style={{fontSize:18,fontWeight:700,color:T.text2}}>{preview.perYear.toLocaleString("fr-FR")} €</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Versements</div>
                  <div style={{fontSize:18,fontWeight:700,color:T.text2}}>{preview.periodsElapsed}</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Prochain dans</div>
                  <div style={{fontSize:18,fontWeight:700,color:T.text2}}>{preview.daysUntilNext}j</div>
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{margin:"0 0 14px",fontSize:11,color:T.text5,lineHeight:1.6,textAlign:"center",fontStyle:"italic"}}>
          Ce calcul suppose un versement constant depuis la date de départ. Les changements de montant ne sont pas pris en compte.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>{if(parseFloat(amount)>0&&startDate){onSave({freq,amount:parseFloat(amount),startDate});onClose();}}}
            style={{width:"100%",background:parseFloat(amount)>0?"#0ecb81":"rgba(255,255,255,0.06)",border:"none",borderRadius:14,padding:"16px",color:parseFloat(amount)>0?"#000":"rgba(255,255,255,0.3)",fontSize:15,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
            Enregistrer le plan
          </button>
          {plan&&<button onClick={()=>{onDelete();onClose();}}
            style={{width:"100%",background:"rgba(255,77,77,0.08)",border:"0.5px solid rgba(255,77,77,0.2)",borderRadius:14,padding:"13px",color:"#ff4d4d",fontSize:13,cursor:"pointer"}}>
            Supprimer le plan
          </button>}
        </div>
      </div>
    </Sheet>
  );
}


/* ─── IMPORT / EXPORT ────────────────────────────────────────────────────────── */
function ImportExport({holdings,holdingsWithPlan,onImport}){
  const[importing,setImporting]=useState(false);
  const[result,setResult]=useState(null); // {ok:[], errors:[]}
  const fileRef=useRef(null);

  // Download template CSV
  const downloadTemplate=()=>{
    const rows=[["ISIN","Nom","Montant (€)"],...Object.keys(DB).map(t=>[DB[t].isin||"",DB[t].name,""])];
    const csv=rows.map(r=>`${r[0]},${r[1].replace(/,/g," ")},${r[2]}`).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="etf-score-template.csv";a.click();
    URL.revokeObjectURL(url);
  };

  // Export current portfolio
  const exportPortfolio=()=>{
    if(!holdingsWithPlan.length)return;
    const rows=[["ISIN","Nom","Montant (€)"],...holdingsWithPlan.map(h=>[DB[h.ticker]?.isin||"",DB[h.ticker]?.name||h.name,h.amount.toFixed(2)])];
    const csv=rows.map(r=>`${r[0]},${r[1].replace(/,/g," ")},${r[2]}`).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="mon-portefeuille-etf.csv";a.click();
    URL.revokeObjectURL(url);
  };

  // Parse imported file
  const handleFile=e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setImporting(true);setResult(null);
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const text=ev.target.result;
        const lines=text.split(/\r?\n/).filter(l=>l.trim());
        const ok=[],errors=[];
        // Skip header row (first line has non-numeric last column)
        const startIdx=isNaN(parseFloat(lines[0]?.split(",").pop()?.replace(/[^0-9.]/g,"")))?1:0;
        for(let i=startIdx;i<lines.length;i++){
          const parts=lines[i].split(",");
          const rawISIN=(parts[0]||"").trim().toUpperCase();
          const rawAmt=(parts[parts.length-1]||"").trim().replace(/[^0-9.]/g,"");
          const amount=parseFloat(rawAmt);
          // ISIN lookup → ticker
          const ticker=ISIN_MAP[rawISIN]||null;
          if(!ticker||!DB[ticker]){errors.push({line:i+1,raw:rawISIN,reason:"ISIN introuvable"});continue;}
          if(isNaN(amount)||amount<=0){errors.push({line:i+1,raw:rawISIN,reason:"Montant invalide"});continue;}
          ok.push({ticker,name:DB[ticker].name,amount});
        }
        setResult({ok,errors});
        if(ok.length>0)ok.forEach(h=>onImport(h.ticker,h.amount));
      }catch(err){
        setResult({ok:[],errors:[{line:0,raw:"",reason:"Fichier illisible"}]});
      }
      setImporting(false);
      if(fileRef.current)fileRef.current.value="";
    };
    reader.readAsText(file);
  };

  return(
    <Glass style={{padding:"16px 16px"}}>
      <div style={{fontFamily:T.fontDisplay,fontSize:9,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Import / Export</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:result?12:0}}>
        {/* Import */}
        <button onClick={()=>fileRef.current?.click()}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:T.accentBg,border:`0.5px solid ${T.accentBorder}`,borderRadius:T.radiusSm,padding:"14px 16px",cursor:"pointer",transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{width:36,height:36,borderRadius:10,background:T.accentBg,border:`0.5px solid ${T.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:600,color:T.accent,marginBottom:2}}>Importer un CSV</div>
            <div style={{fontSize:11,color:T.text4}}>Colonnes : ISIN, Nom, Montant</div>
          </div>
        </button>
        {/* Export */}
        <button onClick={exportPortfolio}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:T.radiusSm,padding:"14px 16px",cursor:holdingsWithPlan.length?"pointer":"not-allowed",opacity:holdingsWithPlan.length?1:0.4,transition:"opacity .15s"}}
          onMouseEnter={e=>{if(holdingsWithPlan.length)e.currentTarget.style.opacity=".7";}}
          onMouseLeave={e=>e.currentTarget.style.opacity=holdingsWithPlan.length?"1":"0.4"}>
          <div style={{width:36,height:36,borderRadius:10,background:T.surfaceHover,border:`0.5px solid ${T.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 9V1M4 4l3-3 3 3" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:500,color:T.text3,marginBottom:2}}>Exporter mon portefeuille</div>
            <div style={{fontSize:11,color:T.text5}}>{holdingsWithPlan.length?`${holdingsWithPlan.length} position${holdingsWithPlan.length>1?"s":""} · CSV`:"Aucune position à exporter"}</div>
          </div>
        </button>
        {/* Template */}
        <button onClick={downloadTemplate}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:T.radiusSm,padding:"14px 16px",cursor:"pointer",transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{width:36,height:36,borderRadius:10,background:T.surfaceHover,border:`0.5px solid ${T.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke={T.text4} strokeWidth="1.3"/><line x1="4.5" y1="5" x2="9.5" y2="5" stroke={T.text4} strokeWidth="1" strokeLinecap="round"/><line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke={T.text4} strokeWidth="1" strokeLinecap="round"/><line x1="4.5" y1="10" x2="7.5" y2="10" stroke={T.text4} strokeWidth="1" strokeLinecap="round"/></svg>
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:500,color:T.text3,marginBottom:2}}>Télécharger le template</div>
            <div style={{fontSize:11,color:T.text5}}>Tous les ETF disponibles pré-listés</div>
          </div>
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{display:"none"}}/>
      {/* Result feedback */}
      {result&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {result.ok.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.accentBg,border:`0.5px solid ${T.accentBorder}`,borderRadius:10,padding:"9px 12px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,flexShrink:0}}/>
              <span style={{fontSize:12,color:T.accent,fontWeight:500}}>{result.ok.length} ETF importé{result.ok.length>1?"s":""} avec succès</span>
            </div>
          )}
          {result.errors.length>0&&(
            <div style={{background:T.dangerBg,border:`0.5px solid ${T.dangerBorder}`,borderRadius:10,padding:"9px 12px"}}>
              <div style={{fontSize:12,color:T.danger,fontWeight:500,marginBottom:4}}>{result.errors.length} ligne{result.errors.length>1?"s":""} ignorée{result.errors.length>1?"s":""}</div>
              {result.errors.slice(0,3).map((e,i)=>(
                <div key={i} style={{fontSize:11,color:T.text4}}>· Ligne {e.line} {e.raw?`"${e.raw}"`:""} — {e.reason}</div>
              ))}
            </div>
          )}
          <button onClick={()=>setResult(null)} style={{background:"none",border:"none",fontSize:11,color:T.text5,cursor:"pointer",padding:0,textAlign:"left"}}>Fermer</button>
        </div>
      )}
    </Glass>
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
  const[toast,setToast]=useState({msg:"",visible:false,position:"bottom"});
  const[swipeHintSeen,setSwipeHintSeen]=useState(true); // true = no hint by default
  const[onboarding,setOnboarding]=useState(false);
  const[showWelcome,setShowWelcome]=useState(false);
  const[showProjection,setShowProjection]=useState(false);
  const[darkMode,setDarkMode]=useState(()=>localStorage.getItem('etf-theme')!=='light');
  const[lightGag,setLightGag]=useState(false);
  const[onboardStep,setOnboardStep]=useState(0);
  const[splash,setSplash]=useState(true);
  const[activeRec,setActiveRec]=useState(null);
  const[plans,setPlans]=useState({}); // {ticker: {freq, amount, startDate}}
  const[editPlan,setEditPlan]=useState(null);
  const[showAddSheet,setShowAddSheet]=useState(false);
  const[addSheetTicker,setAddSheetTicker]=useState(null);
  const[showImportSheet,setShowImportSheet]=useState(false);
  const scrollRef=useRef(null);
  const scrollTouchY=useRef(0);
  const scrollTouchActive=useRef(false); // ticker being edited
  const[recMode,setRecMode]=useState("essential");
  const toastTimer=useRef(null);
  const undoRef=useRef(null);
  const pendingDelete=useRef(null);

  useEffect(()=>{
    try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const p=JSON.parse(raw);if(p.holdings)setHoldings(p.holdings.map(h=>({...h,baseAmount:h.baseAmount??h.amount})));if(p.disclaimerSeen)setDisclaimerSeen(true);if(p.savedAt)setSavedAt(new Date(p.savedAt));if(p.plans)setPlans(p.plans);}}catch(_){}
    setReady(true);
    const onboardingSeen=localStorage.getItem("etf-onboarding-seen");
    if(!onboardingSeen) setOnboarding(true);
    if(!localStorage.getItem("etf-swipe-hint-seen")){
      setSwipeHintSeen(false);
    }
    setTimeout(()=>setSplash(false), 2800);


    if(localStorage.getItem('etf-theme')==='light')setDarkMode(false);

  },[]);

  useEffect(()=>{
    if(!ready)return;setSaved(false);
    const t=setTimeout(async()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({holdings,disclaimerSeen,savedAt:new Date().toISOString(),plans}));}catch(_){}setSaved(true);},700);
    return()=>clearTimeout(t);
  },[holdings,disclaimerSeen,plans,ready]);

  const addHolding=useCallback((ticker,amount)=>{
    setHoldings(prev=>{const ex=prev.find(h=>h.ticker===ticker);if(ex)return prev.map(h=>h.ticker===ticker?{...h,amount:h.amount+amount,baseAmount:(h.baseAmount??h.amount)+amount}:h);return[...prev,{ticker,name:DB[ticker].name,amount,baseAmount:amount}];});
    if(toastTimer.current)clearTimeout(toastTimer.current);
    setToast({msg:`${DB[ticker]?.name||ticker} ajouté`,visible:true,position:"bottom"});
    toastTimer.current=setTimeout(()=>setToast(t=>({...t,visible:false})),2500);
  },[]);
  const removeHolding=useCallback(ticker=>{
    const snap=holdings.find(h=>h.ticker===ticker);
    const planSnap=plans[ticker];
    pendingDelete.current={ticker,snap,planSnap};
    setHoldings(p=>p.filter(h=>h.ticker!==ticker));
    if(undoRef.current)clearTimeout(undoRef.current);
    if(toastTimer.current)clearTimeout(toastTimer.current);
    setToast({msg:`${DB[ticker]?.name||ticker} supprimé`,visible:true,undo:true});
    undoRef.current=setTimeout(()=>{
      pendingDelete.current=null;
      setToast(t=>({...t,visible:false,undo:false}));
    },3000);
  },[holdings,plans]);
  const undoDelete=useCallback(()=>{
    if(!pendingDelete.current)return;
    const{ticker,snap,planSnap}=pendingDelete.current;
    pendingDelete.current=null;
    if(undoRef.current)clearTimeout(undoRef.current);
    setHoldings(p=>{if(p.find(h=>h.ticker===ticker))return p;return[...p,snap];});
    if(planSnap)setPlans(p=>({...p,[ticker]:planSnap}));
    setToast(t=>({...t,visible:false,undo:false}));
  },[]);
  const updateAmount=(ticker,val)=>{
    const a=parseFloat(val);
    if(!isNaN(a)&&a>=0){
      const plan=plans[ticker];
      const stats=plan?planStats(plan):null;
      const invested=stats?.totalInvested||0;
      setHoldings(p=>p.map(h=>h.ticker===ticker?{...h,amount:a,baseAmount:Math.max(0,a-invested)}:h));
    }
  };

  // Sync holding amounts with plan contributions
  const theme=darkMode?T_DARK:T_LIGHT;
  // Update global theme ref for subcomponents
  Object.assign(T, theme);
  const holdingsWithPlan=useMemo(()=>holdings.map(h=>{
    const plan=plans[h.ticker];
    const stats=plan?planStats(plan):null;
    const base=h.baseAmount??h.amount;
    const invested=stats?.totalInvested||0;
    return{...h,amount:base+invested};
  }),[holdings,plans]);
  const scores=useMemo(()=>computeScores(holdingsWithPlan),[holdingsWithPlan]);
  const recs=useMemo(()=>buildRecs(scores,holdingsWithPlan,holdingsWithPlan.reduce((s,h)=>s+h.amount,0)),[scores,holdingsWithPlan]);
  const positives=useMemo(()=>buildPositive(scores,holdingsWithPlan),[scores,holdingsWithPlan]);
  const suggestions=useMemo(()=>buildSuggestions(scores,holdingsWithPlan),[scores,holdingsWithPlan]);
  const total=holdingsWithPlan.reduce((s,h)=>s+h.amount,0);
  const g=sc(scores.total);

  if(!ready)return(<div style={{minHeight:"100vh",background:"#050506",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.1)",borderTopColor:"#0ecb81",animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:T.fontText,maxWidth:430,margin:"0 auto",colorScheme:T.bg==="#050506"?"dark":"light",transition:"background 0.35s cubic-bezier(.16,1,.3,1), color 0.35s cubic-bezier(.16,1,.3,1)",overflowX:"hidden",overscrollBehavior:"none"}}>
      <style>{`
        ${FONTS}
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input{outline:none;-webkit-appearance:none}
        input::placeholder{color:${T.text5}}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        button{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .12s cubic-bezier(.16,1,.3,1),opacity .12s}
        button:active{transform:scale(0.96);opacity:0.75}
        button:disabled:active{transform:none;opacity:1}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.7)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
        @keyframes checkFade{0%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(0.8)}}
        @keyframes splashPop{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        @keyframes splashText{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes splashGlow{from{opacity:0}to{opacity:1}}
        @keyframes splashBar{from{width:0}to{width:100%}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes tabLens{
          0%{transform:scale(1);filter:brightness(1)}
          25%{transform:scale(1.22);filter:brightness(1.3)}
          50%{transform:scale(1.12);filter:brightness(1.1)}
          75%{transform:scale(1.06)}
          100%{transform:scale(1);filter:brightness(1)}
        }
        @keyframes iridDrift{
          0%{background-position:0% 50%;opacity:0.8}
          25%{background-position:100% 0%;opacity:1}
          50%{background-position:100% 100%;opacity:0.7}
          75%{background-position:0% 100%;opacity:1}
          100%{background-position:0% 50%;opacity:0.8}
        }
        @keyframes tabGlow{
          0%{opacity:0;transform:scale(0.6)}
          30%{opacity:1;transform:scale(1.1)}
          100%{opacity:0;transform:scale(1.6)}
        }
        ::-webkit-scrollbar{display:none}
        .row{animation:up .35s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      <Splash visible={splash}/>
      {!disclaimerSeen&&<Disclaimer onAccept={()=>setDisclaimerSeen(true)}/>}
      {showProjection&&<ProjectionSheet
        holdings={holdings}
        plans={plans}
        currentScore={scores.total}
        onPlansUpdate={newPlans=>{setPlans(p=>({...p,...newPlans}));}}
        onClose={()=>setShowProjection(false)}
      />}
      {showWelcome&&<WelcomeScreen etfCount={holdings.length} onDone={()=>setShowWelcome(false)}/> }
      {disclaimerSeen&&onboarding&&<Onboarding onAdd={addHolding} onDone={(hasEtfs)=>{if(hasEtfs){setOnboarding(false);setTab("scores");setShowWelcome(true);}else{setOnboarding(false);setTab("scores");}}} onToast={msg=>{if(toastTimer.current)clearTimeout(toastTimer.current);setToast({msg,visible:true,position:"top"});toastTimer.current=setTimeout(()=>setToast(t=>({...t,visible:false})),2500);}}/>}

      {/* Ambient */}
      <div aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-30%",left:"-20%",width:"70%",height:"65%",background:T.bg==="#050506"?"radial-gradient(ellipse,rgba(14,203,129,0.04) 0%,transparent 65%)":"radial-gradient(ellipse,rgba(14,203,129,0.07) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",bottom:"-25%",right:"-20%",width:"65%",height:"60%",background:T.bg==="#050506"?"radial-gradient(ellipse,rgba(59,130,246,0.04) 0%,transparent 65%)":"radial-gradient(ellipse,rgba(59,130,246,0.06) 0%,transparent 60%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* ── HEADER ── */}


        {/* Rubber-band gap cover */}
        <div style={{
          position:"fixed",top:0,left:"50%",
          transform:"translateX(-50%)",
          width:"100%",maxWidth:430,
          height:"calc(env(safe-area-inset-top, 0px) + 60px)",
          background:T.bg,
          zIndex:49,
          pointerEvents:"none",
        }}/>
        <header style={{
          paddingTop:"calc(env(safe-area-inset-top, 0px) + 14px)",
          paddingBottom:"14px",paddingLeft:"20px",paddingRight:"20px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:T.bg,
          position:"fixed",
          top:0,
          left:"50%",
          transform:"translateX(-50%)",
          width:"100%",
          maxWidth:430,
          zIndex:50,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/logo-etf_score.svg" alt="ETF Score" style={{width:20,height:23,objectFit:"contain",flexShrink:0,filter:T.bg==="#050506"?"invert(1)":"none"}}/>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:800,color:T.text,letterSpacing:-.3}}>ETF Score</span>
              </div>
              <div style={{fontSize:10,color:T.text5,marginTop:0,letterSpacing:.3}}>Analyse multicritères</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {holdings.length>0&&(
              <div style={{padding:"5px 10px",background:`${g.glow.replace("0.25","0.08")}`,border:`0.5px solid ${g.stroke}44`,borderRadius:20,display:"flex",alignItems:"baseline",gap:3}}>
                <span style={{fontSize:13,fontWeight:700,color:g.text,letterSpacing:-.3}}>{scores.total.toFixed(1)}</span>
                <span style={{fontSize:9,color:T.text5}}>/20</span>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:T.surface4,borderRadius:20,border:`0.5px solid ${T.borderSubtle}`,width:110,justifyContent:"center",overflow:"hidden"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:saved?"#0ecb81":"#f0b90b",boxShadow:saved?"0 0 6px #0ecb8166":"0 0 6px #f0b90b66",transition:"background .4s, box-shadow .4s",flexShrink:0}}/>
              <span style={{fontSize:11,color:T.text4,letterSpacing:.3,lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",transition:"opacity .3s",opacity:1}}>
                {saved?"Sync"+(savedAt?" · "+savedAt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):""):"Enreg..."}
              </span>
            </div>
          </div>
        </header>
        {/* Header bottom fade */}
        <div style={{
          position:"fixed",
          top:"calc(env(safe-area-inset-top, 0px) + 48px)",
          left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:430,
          height:40,
          background:`linear-gradient(to bottom, ${T.bg}, transparent)`,
          zIndex:49,
          pointerEvents:"none",
        }}/>

        {/* ── CONTENT ── */}
        <div className="scroll-container"
          ref={scrollRef}
          onTouchStart={e=>{
            scrollTouchY.current=e.touches[0].clientY;
            const el=scrollRef.current;
            scrollTouchActive.current=el?el.scrollTop<=0:false;
          }}
          onTouchMove={e=>{
            if(!scrollTouchActive.current)return;
            const el=scrollRef.current;
            if(!el)return;
            const dy=e.touches[0].clientY-scrollTouchY.current;
            // Only elastic when at top and pulling down
            if(el.scrollTop<=0&&dy>0){
              e.preventDefault();
              const pull=Math.min(dy*0.45,90);
              el.style.transform=`translateX(-50%) translateY(${pull}px)`;
              el.style.transition="none";
            }
          }}
          onTouchEnd={()=>{
            scrollTouchActive.current=false;
            const el=scrollRef.current;
            if(!el)return;
            el.style.transform="translateX(-50%) translateY(0px)";
            el.style.transition="transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)";
          }}
          style={{
            position:"fixed",
            top:`calc(env(safe-area-inset-top, 0px) + 48px)`,
            bottom:0,left:"50%",
            transform:"translateX(-50%)",
            width:"100%",maxWidth:430,
            overflowY:"scroll",
            overflowX:"hidden",
          }}>
        <div style={{padding:`40px 16px calc(90px + env(safe-area-inset-bottom, 0px))`,overflowX:"hidden",width:"100%",boxSizing:"border-box",minHeight:"calc(100% + 1px)"}}>

          {/* SCORES */}
          {tab==="scores"&&(
            <div style={{display:"flex",flexDirection:"column",overflowX:"hidden",width:"100%",gap:12,animation:"fadeIn .3s ease"}}>

              {/* Hero score block — sans card, flottant sur le fond */}
              {holdings.length>0&&(
                <div style={{position:"relative",margin:"0 -16px",padding:"0 16px"}}>
                  {/* Ambient glow — scores tab only, fixed */}
                  {tab==="scores"&&<div style={{
                    position:"fixed",
                    top:"calc(env(safe-area-inset-top, 0px) + 48px)",
                    left:0,right:0,
                    height:"220px",
                    background:"radial-gradient(ellipse at 30% 40%, rgba(14,203,129,0.07) 0%, rgba(99,102,241,0.1) 45%, rgba(139,92,246,0.06) 65%, transparent 80%)",
                    pointerEvents:"none",
                    zIndex:0,
                    filter:"blur(16px)",
                  }}/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"20px 4px 24px",position:"relative",zIndex:1}}>
                  <div>
                    <div style={{fontSize:9,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Score global</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                      <span style={{fontSize:58,fontWeight:800,color:g.text,lineHeight:1,letterSpacing:-2}}>{scores.total.toFixed(1)}</span>
                      <span style={{fontSize:20,color:T.text5,fontWeight:300}}>/20</span>
                    </div>
                    <div style={{fontSize:11,color:g.text,marginTop:6,fontWeight:600,letterSpacing:.3}}>{g.label}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginBottom:10}}>
                      <span style={{fontSize:9,color:T.text5,letterSpacing:3,textTransform:"uppercase",fontWeight:600}}>Apports</span>
                      <IBtn label="Montant investi" text="Somme totale versée — ne tient pas compte des variations de marché."/>
                    </div>
                    <div style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:-.5}}>{total.toLocaleString("fr-FR")} €</div>
                    <div style={{fontSize:11,color:T.text5,marginTop:6}}>{holdings.length} position{holdings.length>1?"s":""}</div>
                  </div>
                </div>
                {Object.values(plans).some(p=>p?.amount>0)&&(
                  <div style={{display:"flex",justifyContent:"center",paddingBottom:16,position:"relative",zIndex:1}}>
                    <button onClick={()=>setShowProjection(true)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:`0.5px solid ${T.borderSubtle}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",color:T.textSub,fontSize:11,fontWeight:500}}>
                      <span>Projection DCA</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
                </div>
              )}

              {/* Score rings */}
              <Glass style={{padding:"28px 16px 24px"}}>
                <div style={{display:"flex",justifyContent:"space-around",alignItems:"flex-start"}}>
                  <ScoreArc value={scores.geo} label="Géographique"/>
                  <div style={{width:"0.5px",background:T.surfaceMed,alignSelf:"stretch",margin:"10px 0"}}/>
                  <ScoreArc value={scores.sector} label="Sectorielle"/>
                </div>
              </Glass>

              {/* Sub-scores */}
              {holdings.length>0&&(
                <Glass style={{padding:"18px 18px"}}>
                  <div style={{fontFamily:T.fontDisplay,fontSize:9,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:16}}>Détail des critères</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <MiniBar label="Géographie" value={scores.geo} weight="25%"/>
                    <MiniBar label="Secteurs" value={scores.sector} weight="25%"/>
                    <MiniBar label="Chevauchement" value={scores.overlap} weight="20%"/>
                    <MiniBar label="Classes d'actifs" value={scores.assetClass} weight="15%"/>
                    <MiniBar label="Devises" value={scores.currency} weight="15%"/>
                  </div>
                  {Object.keys(scores.classes).length>0&&(
                    <div style={{marginTop:18,paddingTop:16,borderTop:`0.5px solid ${T.borderFaint}`}}>
                      <div style={{fontFamily:T.fontDisplay,fontSize:9,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Classes d'actifs</div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                        {Object.entries(scores.classes).sort((a,b)=>b[1]-a[1]).map(([cls,pct])=>(
                          <div key={cls} style={{background:T.surface4,border:`0.5px solid ${T.borderSubtle}`,borderRadius:20,padding:"5px 12px",display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:5,height:5,borderRadius:"50%",background:ASSET_COLORS[cls]||"rgba(255,255,255,0.5)"}}/>
                            <span style={{fontSize:11,color:T.textSub}}>{ASSET_LABELS[cls]||cls}</span>
                            <span style={{fontFamily:T.fontDisplay,fontSize:11,color:ASSET_COLORS[cls]||"rgba(255,255,255,0.7)",fontWeight:700}}>{pct.toFixed(0)}%</span>
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
                      <div style={{fontFamily:T.fontDisplay,fontSize:26,fontWeight:800,color:T.text,lineHeight:1,letterSpacing:-1}}>{v}</div>
                      <div style={{fontSize:9,color:T.text5,marginTop:5,letterSpacing:2,textTransform:"uppercase"}}>{l}</div>
                    </Glass>
                  ))}
                </div>
              )}

              {/* Analyse & Recommandations */}
              {(recs.length>0||positives.length>0)&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 2px"}}>
                    <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,rgba(14,203,129,0.4),transparent)"}}/>
                    <span style={{fontFamily:T.fontDisplay,fontSize:10,fontWeight:800,color:T.text3,letterSpacing:2.5,textTransform:"uppercase"}}>Analyse & Recommandations</span>
                    <div style={{flex:1,height:"0.5px",background:"linear-gradient(270deg,rgba(14,203,129,0.4),transparent)"}}/>
                  </div>

                  {/* Critiques d'abord */}
                  {recs.filter(r=>r.level==="essential"&&r.priority==="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`0.5px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:r.color,flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:T.fontDisplay,fontSize:13,fontWeight:700,color:r.color}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:T.textSub,lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:`1px solid ${r.color}66`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}

                  {/* Feedback positif */}
                  {positives.map((p,i)=>(
                    <div key={i} style={{background:"rgba(14,203,129,0.04)",border:"0.5px solid rgba(14,203,129,0.12)",borderRadius:16,padding:"13px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{color:T.accent,flexShrink:0,marginTop:1}}>{REC_ICONS.trophy}</div>
                      <p style={{margin:0,fontSize:13,color:T.textSub,lineHeight:1.65}}>{p}</p>
                    </div>
                  ))}

                  {/* Essentiels non-critiques */}
                  {recs.filter(r=>r.level==="essential"&&r.priority!=="high").map((r,i)=>(
                    <div key={i} style={{background:r.bg,border:`0.5px solid ${r.border}`,borderRadius:16,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:r.color,flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:T.fontDisplay,fontSize:13,fontWeight:700,color:r.color}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:T.textSub,lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:r.color,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:`1px solid ${r.color}66`}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}

                  {/* Toggle avancé */}
                  {recs.filter(r=>r.level==="advanced").length>0&&(
                    <button onClick={()=>setRecMode(m=>m==="essential"?"advanced":"essential")}
                      style={{background:T.surfaceFaint,border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",WebkitTapHighlightColor:"transparent"}}>
                      <span style={{fontSize:12,color:T.text4}}>
                        {recMode==="essential"?`Analyse avancée · ${recs.filter(r=>r.level==="advanced").length} points`:"Masquer l'analyse avancée"}
                      </span>
                      <span style={{fontSize:16,color:T.text5,transform:recMode==="advanced"?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",display:"inline-block"}}>›</span>
                    </button>
                  )}
                  {recMode==="advanced"&&recs.filter(r=>r.level==="advanced").map((r,i)=>(
                    <div key={i} style={{background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:16,padding:"14px 16px",animation:"up .3s cubic-bezier(.16,1,.3,1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{color:T.text4,flexShrink:0}}>{REC_ICONS[r.icon]||REC_ICONS.geo}</div>
                        <div style={{fontFamily:T.fontDisplay,fontSize:13,fontWeight:600,color:T.text2}}>{r.title}</div>
                      </div>
                      <p style={{margin:0,fontSize:13,color:T.text3,lineHeight:1.65}}>{r.text}</p>
                      {r.cat&&CAT[r.cat]&&<button onClick={()=>setActiveRec(r.cat)} style={{marginTop:10,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:T.accent,fontSize:12,fontWeight:600,WebkitTapHighlightColor:"transparent"}}><span>→</span><span style={{borderBottom:"1px solid rgba(14,203,129,0.4)"}}>{CAT[r.cat].emoji} Voir les ETF — {CAT[r.cat].title}</span></button>}
                    </div>
                  ))}
                </div>
              )}

              {!holdings.length&&(
                <Glass style={{padding:"52px 24px",textAlign:"center"}}>
                  <div style={{fontFamily:T.fontDisplay,fontSize:44,marginBottom:16,opacity:.3}}>◎</div>
                  <div style={{fontFamily:T.fontDisplay,fontSize:16,fontWeight:800,color:T.text,marginBottom:10}}>Aucun ETF renseigné</div>
                  <div style={{fontSize:13,color:T.text4,lineHeight:1.7}}>Allez dans l'onglet <strong style={{color:T.textSub}}>Mes ETF</strong> pour ajouter vos positions.</div>
                </Glass>
              )}
            </div>
          )}

          {tab==="geo"&&(
            <div style={{display:"flex",flexDirection:"column",overflowX:"hidden",width:"100%",gap:14,animation:"fadeIn .3s ease"}}>
              {Object.keys(scores.geoMap).length>0?(
                <>
                  <div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}>
                    <Donut data={scores.geoMap} palette={BARS} size={220}/>
                  </div>
                  {/* Context stats below */}
                  <Glass style={{padding:"18px 18px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      {[
                        {label:"Zones couvertes",value:Object.keys(scores.geoMap).length,unit:""},
                        {label:"Score géo.",value:scores.geo.toFixed(1),unit:"/20",color:sc(scores.geo).text},
                        {label:"Marchés dév.",value:((scores.geoMap["Amér. du Nord"]||0)+(["Europe","Royaume-Uni","France","Suisse","Allemagne","Pays-Bas","Autres EU"].reduce((s,k)=>s+(scores.geoMap[k]||0),0))+(scores.geoMap["Japon"]||0)).toFixed(0),unit:"%"},
                        {label:"Marchés ém.",value:(["Émergents","Chine","Inde","Corée du Sud","Taiwan","Autres EM","Autres Asie","Afrique du Sud","Émirats Arabes","Autres EMEA"].reduce((s,k)=>s+(scores.geoMap[k]||0),0)).toFixed(0),unit:"%"},
                      ].map(({label,value,unit,color})=>(
                        <div key={label} style={{background:T.surfaceFaint,borderRadius:12,padding:"12px 14px"}}>
                          <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{label}</div>
                          <div style={{fontSize:22,fontWeight:700,color:color||T.text,letterSpacing:-.5}}>{value}<span style={{fontSize:12,color:T.text4,fontWeight:400}}>{unit}</span></div>
                        </div>
                      ))}
                    </div>
                  </Glass>
                  <ColorBars data={scores.geoMap} title="Détail par zone" infoMap={GEO_INFO}/>
                </>
              ):<div style={{textAlign:"center",padding:"48px 0",color:T.text5,fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}
            </div>
          )}
          {tab==="sec"&&(
            <div style={{display:"flex",flexDirection:"column",overflowX:"hidden",width:"100%",gap:14,animation:"fadeIn .3s ease"}}>
              {Object.keys(scores.secMap).length>0?(
                <>
                  <div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}>
                    <Donut data={scores.secMap} palette={BARS} size={220}/>
                  </div>
                  {/* Context stats below */}
                  <Glass style={{padding:"18px 18px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      {[
                        {label:"Secteurs couverts",value:Object.keys(scores.secMap).length,unit:""},
                        {label:"Score secteurs",value:scores.sector.toFixed(1),unit:"/20",color:sc(scores.sector).text},
                        {label:"Secteur dominant",value:Object.entries(scores.secMap).sort((a,b)=>b[1]-a[1])[0]?.[1].toFixed(0)||0,unit:"%"},
                        {label:"Technologie",value:(scores.secMap["Technologie"]||0).toFixed(0),unit:"%",color:(scores.secMap["Technologie"]||0)>35?"#ff4d4d":undefined},
                      ].map(({label,value,unit,color})=>(
                        <div key={label} style={{background:T.surfaceFaint,borderRadius:12,padding:"12px 14px"}}>
                          <div style={{fontSize:9,color:T.text5,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{label}</div>
                          <div style={{fontSize:22,fontWeight:700,color:color||T.text,letterSpacing:-.5}}>{value}<span style={{fontSize:12,color:T.text4,fontWeight:400}}>{unit}</span></div>
                        </div>
                      ))}
                    </div>
                  </Glass>
                  <ColorBars data={scores.secMap} title="Détail par secteur" infoMap={SECTOR_INFO}/>
                </>
              ):<div style={{textAlign:"center",padding:"48px 0",color:T.text5,fontSize:13}}>Ajoutez des ETF pour voir la répartition</div>}
            </div>
          )}

          {/* ETF TAB */}
          {tab==="ptf"&&(
            <div style={{display:"flex",flexDirection:"column",overflowX:"hidden",width:"100%",gap:12,animation:"fadeIn .3s ease"}}>

              {/* Positions — toujours en premier */}
              {/* Boutons d'action */}
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <button onClick={()=>setShowAddSheet(true)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:T.accentBg,border:`0.5px solid ${T.accentBorder}`,borderRadius:T.radiusSm,padding:"13px 16px",cursor:"pointer",transition:"opacity .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <span style={{fontSize:13,fontWeight:600,color:T.accent}}>Ajouter un ETF</span>
                </button>
                <button onClick={()=>setShowImportSheet(true)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:T.surfaceFaint,border:`0.5px solid ${T.borderSubtle}`,borderRadius:T.radiusSm,padding:"13px 16px",cursor:"pointer",transition:"opacity .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{fontSize:12,fontWeight:500,color:T.text3}}>Import</span>
                </button>
              </div>
              {holdings.length>0?(
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"0 2px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontFamily:T.fontDisplay,fontSize:9,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase"}}>Positions</span>
                      <span style={{fontSize:9,color:T.text5,background:T.surfaceFaint,border:`0.5px solid ${T.borderFaint}`,borderRadius:20,padding:"1px 7px"}}>{holdings.length}</span>
                    </div>
                    <button onClick={()=>setConfirmReset(true)} style={{background:"none",border:"none",color:"rgba(255,77,77,0.4)",fontSize:11,cursor:"pointer",padding:"2px 0"}}>Tout effacer</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {holdings.map((h,i)=>{
                      const pct=total>0?(h.amount/total*100):0;
                      const etf=DB[h.ticker];
                      const isEditing=editAmt[h.ticker]!==undefined;
                      return(
                        <SwipeToDelete key={h.ticker} onDelete={()=>removeHolding(h.ticker)} disabled={!!editAmt[h.ticker]} playHint={i===0&&!swipeHintSeen} onHintPlayed={()=>setSwipeHintSeen(true)}>
                        <Glass style={{padding:"13px 14px",animation:`up .35s ${i*.04}s both`}}>
                          <div style={{display:"flex",alignItems:"center",gap:11}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:4}}>{h.name}</div>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                {etf?.isin&&<span style={{fontSize:9,fontFamily:T.fontMono,color:T.textGhost,letterSpacing:.5}}>{etf.isin}</span>}
                                {etf&&<span style={{fontSize:9,color:ASSET_COLORS[etf.assetClass]||"rgba(255,255,255,0.4)",fontWeight:600,background:`${ASSET_COLORS[etf.assetClass]||"rgba(255,255,255,0.1)"}18`,padding:"1px 6px",borderRadius:4,letterSpacing:.3,flexShrink:0}}>{ASSET_LABELS[etf.assetClass]||etf.assetClass}</span>}
                              </div>
                            </div>
                            <span style={{fontSize:11,color:T.text4,fontWeight:600,flexShrink:0,alignSelf:"center"}}>{pct.toFixed(1)}%</span>
                            <input type="number" value={isEditing?editAmt[h.ticker]:(holdingsWithPlan.find(x=>x.ticker===h.ticker)?.amount||h.amount)}
                              onFocus={()=>setEditAmt(p=>({...p,[h.ticker]:String(holdingsWithPlan.find(x=>x.ticker===h.ticker)?.amount||h.amount)}))}
                              onChange={e=>setEditAmt(p=>({...p,[h.ticker]:e.target.value}))}
                              onBlur={()=>{updateAmount(h.ticker,editAmt[h.ticker]);setEditAmt(p=>{const n={...p};delete n[h.ticker];return n;});}}
                              style={{width:72,background:T.surface4,border:`0.5px solid ${T.borderSubtle}`,borderRadius:8,padding:"5px 8px",color:T.text,fontSize:12,textAlign:"right",fontFamily:"monospace"}}/>
                            <span style={{fontSize:10,color:T.text5,flexShrink:0}}>€</span>
                            {/* Plan button */}
                            <button onClick={()=>setEditPlan(h.ticker)}
                              style={{background:plans[h.ticker]?T.accentBg:T.surface,border:`0.5px solid ${plans[h.ticker]?T.accentBorder:T.borderSubtle}`,borderRadius:8,padding:"5px 7px",cursor:"pointer",flexShrink:0,lineHeight:1,transition:"all .15s"}}
                              title="Plan d'investissement">
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke={plans[h.ticker]?T.accent:T.text4} strokeWidth="1"/><line x1="4" y1="1" x2="4" y2="3.5" stroke={plans[h.ticker]?T.accent:T.text4} strokeWidth="1" strokeLinecap="round"/><line x1="9" y1="1" x2="9" y2="3.5" stroke={plans[h.ticker]?T.accent:T.text4} strokeWidth="1" strokeLinecap="round"/><line x1="3" y1="6" x2="10" y2="6" stroke={plans[h.ticker]?T.accent:T.text4} strokeWidth="1" strokeLinecap="round"/><line x1="3" y1="8.5" x2="7" y2="8.5" stroke={plans[h.ticker]?T.accent:T.text4} strokeWidth="1" strokeLinecap="round"/></svg>
                            </button>

                          </div>
                          {/* Plan summary if configured */}
                          {plans[h.ticker]&&(()=>{const s=planStats(plans[h.ticker]);return s?(
                            <div style={{marginTop:10,paddingTop:10,borderTop:`0.5px solid ${T.borderFaint}`}}>
                              {/* Ligne 1 — fréquence + prochain versement */}
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <svg width="10" height="10" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#0ecb81" strokeWidth="1"/><line x1="4" y1="1" x2="4" y2="3.5" stroke="#0ecb81" strokeWidth="1" strokeLinecap="round"/><line x1="3" y1="6" x2="10" y2="6" stroke="#0ecb81" strokeWidth="1" strokeLinecap="round"/></svg>
                                  <span style={{fontSize:10,color:T.text4}}>{FREQS.find(f=>f.id===plans[h.ticker].freq)?.label} · {plans[h.ticker].amount} €</span>
                                </div>
                                <span style={{fontSize:10,color:T.text5}}>prochain dans <span style={{color:T.text3,fontWeight:600}}>{s.daysUntilNext}j</span></span>
                              </div>
                              {/* Ligne 2 — montant investi si versements passés */}
                              {s.totalInvested>0&&(
                                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                                  <span style={{fontSize:15,fontWeight:700,color:T.accent}}>{s.totalInvested.toLocaleString("fr-FR")} €</span>
                                  <span style={{fontSize:10,color:T.text4}}>versés à ce jour</span>
                                </div>
                              )}
                            </div>
                          ):null;})()}
                        </Glass>
                        </SwipeToDelete>
                      );
                    })}
                  </div>
                </div>
              ):(
                <Glass style={{padding:"40px 24px",textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:12,opacity:.3}}>◎</div>
                  <div style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:700,color:T.text,marginBottom:8}}>Aucune position</div>
                  <div style={{fontSize:13,color:T.text4,lineHeight:1.7}}>Ajoutez vos ETF pour analyser votre portefeuille.</div>
                </Glass>
              )}

              {/* Add ETF sheet */}
              {showAddSheet&&(
                <Sheet onClose={()=>setShowAddSheet(false)}>
                  <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                      <div style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:700,color:T.text}}>Ajouter un ETF</div>
                      
                    </div>
                    <Search onAdd={(t,a)=>{addHolding(t,a);setShowAddSheet(false);setAddSheetTicker(null);}} suggestions={suggestions} initialTicker={addSheetTicker}/>
                  </div>
                </Sheet>
              )}

              {/* Import/Export sheet */}
              {showImportSheet&&(
                <Sheet onClose={()=>setShowImportSheet(false)}>
                  <div data-sheet-scroll style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                      <div style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:700,color:T.text}}>Import / Export</div>
                      
                    </div>
                    <ImportExport holdings={holdings} holdingsWithPlan={holdingsWithPlan} onImport={(t,a)=>{addHolding(t,a);}}/>
                  </div>
                </Sheet>
              )}

            </div>
          )}

          {/* ABOUT TAB */}
          {tab==="about"&&(
            <div style={{display:"flex",flexDirection:"column",overflowX:"hidden",width:"100%",gap:14,animation:"fadeIn .3s ease"}}>
              <Glass style={{padding:"24px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                  <img src="/logo-etf_score.svg" alt="ETF Score" style={{width:29,height:34,objectFit:"contain",filter:T.bg==="#050506"?"invert(1)":"none"}}/>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:-.3}}>ETF Score</div>
                    <div style={{fontSize:11,color:T.text4,marginTop:2}}>Analyse multicritères · v3</div>
                  </div>
                </div>
                <p style={{margin:0,fontSize:13,color:T.text4,lineHeight:1.7}}>
                  Outil d'analyse de diversification de portefeuille ETF. Construit avec Claude (Anthropic).
                  Les scores et recommandations sont fournis à titre indicatif uniquement.
                </p>
              </Glass>

              {/* Install card */}
              {!window.navigator.standalone&&!window.matchMedia("(display-mode: standalone)").matches&&(
                <Glass style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:40,height:40,borderRadius:12,background:"rgba(14,203,129,0.1)",border:"0.5px solid rgba(14,203,129,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>📲</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>Installer l'app</div>
                      <div style={{fontSize:12,color:T.text4,lineHeight:1.55}}>
                        Pour une expérience optimale, ajoutez ETF Score à votre écran d'accueil.<br/>
                        <span style={{color:T.text3}}>Safari → Partager → Sur l'écran d'accueil</span>
                      </div>
                    </div>
                  </div>
                </Glass>
              )}

              {/* Appearance */}
              <Glass style={{padding:"18px 20px"}}> 
                <div style={{fontSize:10,fontWeight:700,color:T.textDisabled,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Paramètres</div>
                <div style={{display:"flex",gap:8}}>
                  {[{id:true,label:"Sombre",icon:"🌙",badge:null},{id:false,label:"Claire",icon:"☀️",badge:"Alpha"}].map(opt=>(
                    <button key={String(opt.id)} onClick={()=>{
                      if(!opt.id&&darkMode){
                        setLightGag(true);
                        setTimeout(()=>{setLightGag(false);setDarkMode(false);localStorage.setItem('etf-theme','light');},2200);
                      } else {
                        setDarkMode(opt.id);localStorage.setItem('etf-theme',opt.id?'dark':'light');
                      }
                    }}
                      style={{
                        flex:1,padding:"12px 8px",borderRadius:T.radiusSm,cursor:"pointer",
                        background:darkMode===opt.id?T.accentBg:T.surfaceFaint,
                        border:`0.5px solid ${darkMode===opt.id?T.accentBorder:T.borderSubtle}`,
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
                        transition:"all .15s",
                        minHeight:80,
                      }}>
                      <span style={{fontSize:20}}>{opt.icon}</span>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <span style={{fontSize:12,fontWeight:darkMode===opt.id?600:400,color:darkMode===opt.id?T.accent:T.textGhost}}>{opt.label}</span>
                        {opt.badge&&<span style={{fontSize:9,fontWeight:600,color:T.warning,background:T.warningBg,border:`0.5px solid ${T.warningBorder}`,borderRadius:4,padding:"1px 5px",letterSpacing:.5}}>{opt.badge}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </Glass>

              {/* Reset onboarding */}
              <Glass style={{padding:"16px 20px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:T.surfaceHover,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>👋</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>Revoir l'introduction</div>
                      <div style={{fontSize:11,color:T.text4}}>Relancer l'onboarding depuis le début</div>
                    </div>
                  </div>
                  <button onClick={()=>{localStorage.removeItem("etf-onboarding-seen");window.location.reload();}}
                    style={{background:T.accentBg,border:`0.5px solid ${T.accentBorder}`,borderRadius:T.radiusSm,padding:"7px 14px",color:T.accent,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0,transition:"opacity .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".75"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    Lancer →
                  </button>
                </div>
              </Glass>
              {/* Legal */}
              <Glass style={{padding:"20px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Mentions légales</div>
                <p style={{margin:"0 0 14px",fontSize:13,color:T.text4,lineHeight:1.7}}>
                  ETF Score est un outil d'analyse personnel. Les scores, indicateurs et suggestions affichés <strong style={{color:T.textSub}}>ne constituent pas un conseil en investissement</strong> au sens de la réglementation AMF.
                </p>
                <p style={{margin:0,fontSize:13,color:T.text4,lineHeight:1.7}}>
                  Tout investissement comporte un risque de perte en capital. Consultez un conseiller financier agréé avant toute décision d'investissement.
                </p>
              </Glass>

              {/* Data disclaimer */}
              <Glass style={{padding:"20px"}}>
                <div style={{fontSize:10,fontWeight:700,color:T.text5,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Données</div>
                <p style={{margin:0,fontSize:13,color:T.text4,lineHeight:1.7}}>
                  Les compositions d'ETF sont approximatives et basées sur les données disponibles à la date de mise à jour. Elles peuvent différer des compositions réelles actuelles.
                  Les apports renseignés ne tiennent pas compte des variations de marché.
                </p>
              </Glass>

            </div>
          )}
        </div>
        </div>
      </div>

      {/* Light mode gag overlay */}
      {lightGag&&(
        <div style={{position:"fixed",inset:0,zIndex:9999999,display:"flex",justifyContent:"center"}}><div style={{width:"100%",maxWidth:430,height:"100%",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,animation:"gagIn .15s ease both"}}>
          <style>{`@keyframes gagIn{from{opacity:0}to{opacity:1}} @keyframes gagShake{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-8deg)}40%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}80%{transform:rotate(5deg)}}`}</style>
          <div style={{fontSize:64,animation:"gagShake .5s ease .1s both"}}>😵</div>
          <div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:-.3,textAlign:"center",padding:"0 32px"}}>Attention, ça pique les yeux !</div>
        </div></div>
      )}
      {/* Toasts */}
      <Toast msg={toast.msg} visible={toast.visible} onUndo={toast.undo?undoDelete:null} undoLabel="Annuler" position={toast.position||"bottom"}/>


      {/* Rec action sheet */}
      {activeRec&&CAT[activeRec]&&<SuggestionSheet catalog={CAT[activeRec]} onSelect={ticker=>{setTab("ptf");setActiveRec(null);setAddSheetTicker(ticker);setShowAddSheet(true);}} onClose={()=>setActiveRec(null)}/>}

      {/* Plan sheet */}
      {editPlan&&<PlanSheet
        ticker={editPlan}
        plan={plans[editPlan]||null}
        onSave={p=>setPlans(prev=>({...prev,[editPlan]:p}))}
        onDelete={()=>setPlans(prev=>{const n={...prev};delete n[editPlan];return n;})}
        onClose={()=>setEditPlan(null)}
      />}

      {/* Bottom Tab Bar */}
      <Tabs active={tab} onChange={setTab} highlight={holdings.length===0?["ptf"]:[]}/>

      {/* Reset */}
      {confirmReset&&(
        <Sheet onClose={()=>setConfirmReset(false)}>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"8px 20px calc(40px + env(safe-area-inset-bottom, 0px))",textAlign:"center"}}>
            <div style={{fontFamily:T.fontDisplay,fontSize:15,fontWeight:800,color:T.text,marginBottom:8}}>Effacer le portefeuille ?</div>
            <div style={{fontSize:13,color:T.text4,marginBottom:24,lineHeight:1.65}}>Toutes vos positions seront supprimées. Irréversible.</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{setHoldings([]);setConfirmReset(false);}} style={{background:"rgba(255,77,77,0.1)",border:"0.5px solid rgba(255,77,77,0.2)",borderRadius:14,padding:"15px",color:"#ff4d4d",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",fontFamily:T.fontDisplay}}>Effacer tout</button>
              <button onClick={()=>setConfirmReset(false)} style={{background:T.surface4,border:`0.5px solid ${T.borderSubtle}`,borderRadius:14,padding:"15px",color:T.text3,fontSize:15,cursor:"pointer",width:"100%"}}>Annuler</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
