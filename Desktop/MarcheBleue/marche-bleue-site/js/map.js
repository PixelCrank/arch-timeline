// Mapbox access token - Replace with your own token from mapbox.com
// Sign up at https://account.mapbox.com/auth/signup/ for a free token
mapboxgl.accessToken = 'pk.eyJ1IjoiY3JhbmsyIiwiYSI6ImNtaXp3bW05eDAyd2ozZ3M5OTVzNDU4MzQifQ.A4_Gjl_Qtret-QJ1yqHQ8Q';

// Get translation function
function getMapTranslation(key) {
  if (window.TranslationSystem) {
    return window.TranslationSystem.t(key);
  }
  // Fallback to French
  const fallbacks = {
    'map.departure': 'Départ',
    'map.day': 'Jour'
  };
  return fallbacks[key] || key;
}

// Journey waypoints - Coastal locations in PNBA along the peninsula
// Accurate GPS coordinates from GeoJSON data
const waypoints = [
  {
    name: 'Cap Tagarit',
    coordinates: [-16.2248, 20.1675],
    day: 'Départ',
    descriptionKey: 'map.waypoint_cap_tagarit'
  },
  {
    name: 'Iwik',
    coordinates: [-16.3308, 19.8494],
    day: 1,
    descriptionKey: 'map.waypoint_iwik'
  },
  {
    name: 'Tessot',
    coordinates: [-16.2749, 19.7401],
    day: 2,
    descriptionKey: 'map.waypoint_tessot'
  },
  {
    name: 'Baie de Serenni',
    coordinates: [-16.3469, 19.6792],
    day: 3,
    descriptionKey: 'map.waypoint_serenni'
  },
  {
    name: 'Techot',
    coordinates: [-16.4108, 19.5397],
    day: 4,
    descriptionKey: 'map.waypoint_techot'
  },
  {
    name: "R'gueiba",
    coordinates: [-16.4660, 19.4163],
    day: 5,
    descriptionKey: 'map.waypoint_rgueiba'
  },
  {
    name: 'Awguej',
    coordinates: [-16.4171, 19.3892],
    day: 6,
    descriptionKey: 'map.waypoint_awguej'
  },
  {
    name: 'Mamghar',
    coordinates: [-16.5167, 19.3667],
    day: 7,
    descriptionKey: 'map.waypoint_mamghar'
  }
];

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const mapContainer = document.getElementById('journey-map');
  if (!mapContainer) return;

  // Store markers for language updates
  window.journeyMarkers = [];

  // Initialize the map
  const map = new mapboxgl.Map({
    container: 'journey-map',
    style: 'mapbox://styles/mapbox/satellite-v9', // Enhanced satellite view
    center: [-16.4, 19.6], // Center on the journey
    zoom: 9,
    pitch: 35,
    bearing: 0,
    antialias: true
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Wait for map to load
  map.on('load', function() {
    // Add the route line
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: waypoints.map(wp => wp.coordinates)
        }
      }
    });

    // Style the route line with gradient
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#e8d5b7',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 3,
          12, 6
        ],
        'line-opacity': 0.95
      }
    });

    // Add a shadow/outline to the route
    map.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#1a3a52',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 5,
          12, 9
        ],
        'line-opacity': 0.6,
        'line-blur': 3
      }
    }, 'route');

    // Animate the route drawing
    let dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5]
    ];
    let step = 0;
    function animateDashArray(timestamp) {
      let newStep = parseInt((timestamp / 50) % dashArraySequence.length);
      if (newStep !== step) {
        map.setPaintProperty('route', 'line-dasharray', dashArraySequence[step]);
        step = newStep;
      }
      requestAnimationFrame(animateDashArray);
    }
    animateDashArray(0);

    // Add markers for each waypoint
    waypoints.forEach((waypoint, index) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'journey-marker';
      const displayDay = waypoint.day === 'Départ' ? 'D' : waypoint.day;
      el.innerHTML = `<div class="marker-inner">${displayDay}</div>`;
      
      // Create popup with translation support
      const dayLabel = waypoint.day === 'Départ' 
        ? getMapTranslation('map.departure')
        : `${getMapTranslation('map.day')} ${waypoint.day}`;
      const description = getMapTranslation(waypoint.descriptionKey);
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'journey-popup'
      }).setHTML(`
        <div class="popup-content">
          <h4>${dayLabel}: ${waypoint.name}</h4>
          <p>${description}</p>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat(waypoint.coordinates)
        .setPopup(popup)
        .addTo(map);

      // Store marker with waypoint data for language updates
      window.journeyMarkers.push({ marker, waypoint });

      // Show popup on hover
      el.addEventListener('mouseenter', () => popup.addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
    });

    // Fit map to show entire route with padding
    const bounds = waypoints.reduce((bounds, wp) => {
      return bounds.extend(wp.coordinates);
    }, new mapboxgl.LngLatBounds(waypoints[0].coordinates, waypoints[0].coordinates));

    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      duration: 0
    });
  });
});

// Function to update map language (called by translation system)
function updateMapLanguage(lang) {
  // Check if markers are initialized
  if (!window.journeyMarkers || window.journeyMarkers.length === 0) {
    return;
  }
  
  // Re-create all popups with new language
  window.journeyMarkers.forEach(({ marker, waypoint }) => {
    const dayLabel = waypoint.day === 'Départ' 
      ? getMapTranslation('map.departure')
      : `${getMapTranslation('map.day')} ${waypoint.day}`;
    const description = getMapTranslation(waypoint.descriptionKey);
    
    // Update the popup attached to this marker
    const popup = marker.getPopup();
    if (popup) {
      popup.setHTML(`
        <div class="popup-content">
          <h4>${dayLabel}: ${waypoint.name}</h4>
          <p>${description}</p>
        </div>
      `);
    }
  });
}
