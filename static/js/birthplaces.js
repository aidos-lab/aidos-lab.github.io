// Shows the map of the `birthplaces` shortcode: MapLibre GL JS with the
// Positron style of OpenFreeMap, recoloured to match the site, and the
// photos of everyone at their birthplace. Photos that would overlap merge
// into a bubble with their number. The figure stays hidden if the map cannot
// be loaded.

(async () => {
  const STYLE = 'https://tiles.openfreemap.org/styles/positron';

  // Distance in pixels between the photos of people born in the same place,
  // and between a photo and its popup; see `.birthplaces-pin` in the CSS
  const SPACING = 36;
  const GAP     = 24;

  // Photos closer than this many pixels merge into a bubble
  const CLUSTER_RADIUS = 30;

  const figure = document.querySelector('.birthplaces');
  if (!figure || !window.maplibregl) return;

  const people = JSON.parse(figure.dataset.people);

  // Colours of the site; MapLibre cannot parse `color-mix()`, so mixtures
  // are computed here
  const css   = getComputedStyle(document.documentElement);
  const token = name => css.getPropertyValue(name).trim();

  const rgb = hex => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  };
  const mix = (a, b, t) => {
    const [x, y] = [rgb(a), rgb(b)];
    return `rgb(${x.map((v, i) => Math.round(t * v + (1 - t) * y[i])).join(',')})`;
  };

  const text = token('--text');
  const bg   = token('--bg');

  let style;
  try {
    style = await (await fetch(STYLE)).json();
  } catch {
    return;
  }

  // Land in the page colour, everything else in shades of the text colour
  for (const layer of style.layers) {
    const paint = layer.paint ??= {};
    if (layer.type === 'background') {
      paint['background-color'] = bg;
    } else if (layer.id === 'water') {
      paint['fill-color'] = mix(text, bg, 0.15);
    } else if (layer.type === 'fill') {
      paint['fill-color'] = mix(text, bg, 0.05);
    } else if (layer.id.startsWith('boundary')) {
      paint['line-color'] = mix(text, bg, 0.35);
    } else if (layer.type === 'symbol') {
      paint['text-color']      = text;
      paint['text-halo-color'] = bg;
    }
  }

  // Show everyone; without anyone, show the inhabited world
  const bounds = new maplibregl.LngLatBounds();
  people.forEach(person => bounds.extend([person.lon, person.lat]));
  if (bounds.isEmpty()) bounds.extend([[-170, -50], [180, 70]]);

  // The map needs its size while it loads, so the figure takes up space but
  // stays invisible until then
  figure.hidden = false;
  figure.classList.add('is-loading');

  const map = new maplibregl.Map({
    container:           figure.querySelector('.birthplaces-map'),
    style,
    bounds,
    fitBoundsOptions:    { padding: 60, maxZoom: 5 },
    // Ctrl + wheel and two fingers zoom and pan, so that the page still
    // scrolls normally across the map
    cooperativeGestures: true,
    // The caption credits the map data instead, so nothing covers the map
    attributionControl:  false,
    renderWorldCopies:   false,
    dragRotate:          false,
    pitchWithRotate:     false,
    touchPitch:          false,
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  map.once('load', () => figure.classList.remove('is-loading'));
  map.on('error', () => {
    if (figure.classList.contains('is-loading')) figure.hidden = true;
  });

  // People born in the same place form a ring, starting at the top, whose
  // radius puts neighbouring photos `SPACING` pixels apart
  const places  = Map.groupBy(people, person => person.place);
  const markers = new Map();

  const popup = new maplibregl.Popup({
    className:    'birthplaces-popup',
    closeButton:  false,
    closeOnClick: false,
    maxWidth:     'none',
  });

  for (const [place, group] of places) {
    const n = group.length;
    const r = n === 1 ? 0 : SPACING / (2 * Math.sin(Math.PI / n));

    group.forEach((person, i) => {
      const angle = 2 * Math.PI * i / n;
      const at = (x, y) => [r * Math.sin(angle) + x, -r * Math.cos(angle) + y];

      // Photos are the ones on the person cards, which the browser has
      // already loaded, and link to these cards
      const pin = document.createElement('a');
      const label = `${person.name} (${place})`;
      pin.className = 'birthplaces-pin';
      pin.href = `#person-${person.id}`;
      pin.setAttribute('aria-label', label);
      if (person.image) {
        const photo = document.createElement('img');
        photo.src = person.image;
        photo.alt = '';
        pin.append(photo);
      }

      // Popups sit next to the photo, whichever side MapLibre places them on
      const offset = {
        'center': at(0, 0),
        'top':    at(0, GAP),  'top-left':    at(GAP, GAP),  'top-right':    at(-GAP, GAP),
        'bottom': at(0, -GAP), 'bottom-left': at(GAP, -GAP), 'bottom-right': at(-GAP, -GAP),
        'left':   at(GAP, 0),  'right':       at(-GAP, 0),
      };

      const show = () => popup
        .setLngLat([person.lon, person.lat])
        .setOffset(offset)
        .setText(label)
        .addTo(map);
      const hide = () => popup.remove();
      pin.addEventListener('pointerenter', show);
      pin.addEventListener('pointerleave', hide);
      pin.addEventListener('focus', show);
      pin.addEventListener('blur', hide);

      markers.set(person.id, new maplibregl.Marker({ element: pin, offset: at(0, 0) })
        .setLngLat([person.lon, person.lat]));
    });
  }

  // MapLibre's clustering decides who merges at the current zoom level; the
  // invisible layer only makes it compute that. People born in the same
  // place stay merged until the highest zoom level, where the ring above
  // separates them.
  map.once('load', () => {
    map.addSource('people', {
      type:          'geojson',
      cluster:       true,
      clusterRadius: CLUSTER_RADIUS,
      data: {
        type:     'FeatureCollection',
        features: people.map(person => ({
          type:       'Feature',
          properties: { id: person.id },
          geometry:   { type: 'Point', coordinates: [person.lon, person.lat] },
        })),
      },
    });
    map.addLayer({ id: 'people', type: 'circle', source: 'people', paint: { 'circle-radius': 0 } });

    // Bubbles, by cluster ID; clicking one zooms in until it splits
    const bubbles = new Map();
    const bubble = feature => {
      const { cluster_id: id, point_count: count } = feature.properties;
      if (!bubbles.has(id)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'birthplaces-cluster';
        button.textContent = count;
        button.setAttribute('aria-label', `${count} people; zoom in`);
        button.addEventListener('click', async () => {
          const zoom = await map.getSource('people').getClusterExpansionZoom(id);
          map.easeTo({ center: feature.geometry.coordinates, zoom });
        });
        bubbles.set(id, new maplibregl.Marker({ element: button })
          .setLngLat(feature.geometry.coordinates));
      }
      return bubbles.get(id);
    };

    // After every change of the map, show exactly the photos and bubbles of
    // the visible clustering
    let shown = new Set();
    map.on('render', () => {
      if (!map.isSourceLoaded('people')) return;
      const visible = new Set(map.querySourceFeatures('people').map(feature =>
        feature.properties.cluster ? bubble(feature) : markers.get(feature.properties.id)));
      visible.forEach(marker => shown.has(marker) || marker.addTo(map));
      shown.forEach(marker => visible.has(marker) || marker.remove());
      shown = visible;
    });
  });
})();
