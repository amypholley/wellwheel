// Public-domain map shapes (Natural Earth via world-atlas and us-atlas), turned into
// the same {id, name, d} lists the prototype used. Loaded only when Adventures opens.
import { feature } from 'topojson-client';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

let cache = null;
export async function loadMaps() {
  if (cache) return cache;
  const [world, us] = await Promise.all([
    import('world-atlas/countries-110m.json').then((m) => m.default || m),
    import('us-atlas/states-albers-10m.json').then((m) => m.default || m),
  ]);
  const countries = feature(world, world.objects.countries).features.filter((f) => f.properties.name !== 'Antarctica');
  const W = 960, H = 470;
  const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'FeatureCollection', features: countries });
  const wp = geoPath(proj);
  const WORLD = countries
    .map((f) => ({ id: f.id || f.properties.name.replace(/\W+/g, ''), name: f.properties.name, d: wp(f) }))
    .filter((x) => x.d)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sp = geoPath(); // the US file is already projected (Albers, with Alaska and Hawaii moved in)
  const USA = feature(us, us.objects.states).features
    .map((f) => ({ id: f.id, name: f.properties.name, d: sp(f) }))
    .filter((x) => x.d)
    .sort((a, b) => a.name.localeCompare(b.name));
  cache = { WORLD, USA, worldSize: [W, H], usaSize: [975, 610] };
  return cache;
}
