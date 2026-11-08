// Public-domain map shapes (Natural Earth via world-atlas and us-atlas), turned into
// the same {id, name, d} lists the prototype used. Loaded only when Adventures opens.
import { feature } from 'topojson-client';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';
import { lang, loc } from '@/lib/i18n';

// ISO numeric -> two-letter codes, so country names can be shown in the chosen language
const A2 = '242FJ834TZ732EH124CA840US398KZ860UZ598PG360ID032AR152CL180CD706SO404KE729SD148TD332HT214DO643RU044BS238FK578NO304GL260TF626TL710ZA426LS484MX858UY076BR068BO604PE170CO591PA188CR558NI340HN222SV320GT084BZ862VE328GY740SR250FR218EC630PR388JM192CU716ZW072BW516NA686SN466ML478MR204BJ562NE566NG120CM768TG288GH384CI324GN624GW430LR694SL854BF140CF178CG266GA226GQ894ZM454MW508MZ748SZ024AO108BI376IL422LB450MG275PS270GM788TN012DZ400JO784AE634QA414KW368IQ512OM548VU116KH764TH418LA104MM704VN408KP410KR496MN356IN050BD064BT524NP586PK004AF762TJ417KG795TM364IR760SY051AM752SE112BY804UA616PL040AT348HU498MD642RO440LT428LV233EE276DE100BG300GR792TR008AL191HR756CH442LU056BE528NL620PT724ES372IE540NC090SB554NZ036AU144LK156CN158TW380IT208DK826GB352IS031AZ268GE608PH458MY096BN705SI246FI703SK203CZ232ER392JP600PY887YE682SA196CY504MA818EG434LY231ET262DJ800UG646RW070BA807MK688RS499ME780TT728SS';
const A2MAP = {}; for (let i = 0; i < A2.length; i += 5) A2MAP[A2.slice(i, i + 3)] = A2.slice(i + 3, i + 5);
A2MAP.Kosovo = 'XK';
function localCountry(id, name) {
  if (lang() === 'en') return name;
  try { const c = A2MAP[id] || A2MAP[name]; if (!c) return name; return new Intl.DisplayNames([loc()], { type: 'region' }).of(c) || name; } catch { return name; }
}

let cache = null, cacheLang = '';
export async function loadMaps() {
  if (cache && cacheLang === lang()) return cache;
  const [world, us] = await Promise.all([
    import('world-atlas/countries-110m.json').then((m) => m.default || m),
    import('us-atlas/states-albers-10m.json').then((m) => m.default || m),
  ]);
  const countries = feature(world, world.objects.countries).features.filter((f) => f.properties.name !== 'Antarctica');
  const W = 960, H = 470;
  const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'FeatureCollection', features: countries });
  const wp = geoPath(proj);
  const WORLD = countries
    .map((f) => { const id = f.id || f.properties.name.replace(/\W+/g, ''); return { id, en: f.properties.name, name: localCountry(f.id || f.properties.name, f.properties.name), d: wp(f) }; })
    .filter((x) => x.d)
    .sort((a, b) => a.name.localeCompare(b.name, loc()));
  const sp = geoPath(); // the US file is already projected (Albers, with Alaska and Hawaii moved in)
  const USA = feature(us, us.objects.states).features
    .map((f) => ({ id: f.id, name: f.properties.name, d: sp(f) }))
    .filter((x) => x.d)
    .sort((a, b) => a.name.localeCompare(b.name));
  cacheLang = lang();
  cache = { WORLD, USA, worldSize: [W, H], usaSize: [975, 610] };
  return cache;
}
