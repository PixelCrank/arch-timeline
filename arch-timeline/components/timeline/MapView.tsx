"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { TimelineBuilding, ChildMovement, MacroMovement } from "@/lib/timelineData";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Heatmap layer component
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const L = require("leaflet");
    require("leaflet.heat");

    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 35,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: "#3b82f6", // blue
        0.3: "#8b5cf6", // violet  
        0.5: "#ec4899", // fuchsia
        0.7: "#f59e0b", // amber
        1.0: "#ef4444", // red
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// Coordinate lookup for common locations
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // Europe - Western
  "rome": [41.9028, 12.4964],
  "italy": [41.9028, 12.4964],
  "milan": [45.4642, 9.1900],
  "florence": [43.7696, 11.2558],
  "venice": [45.4408, 12.3155],
  "naples": [40.8518, 14.2681],
  "paris": [48.8566, 2.3522],
  "france": [46.2276, 2.2137],
  "lyon": [45.7640, 4.8357],
  "marseille": [43.2965, 5.3698],
  "london": [51.5074, -0.1278],
  "england": [52.3555, -1.1743],
  "united kingdom": [55.3781, -3.4360],
  "uk": [55.3781, -3.4360],
  "britain": [52.3555, -1.1743],
  "scotland": [56.4907, -4.2026],
  "edinburgh": [55.9533, -3.1883],
  "glasgow": [55.8642, -4.2518],
  "germany": [51.1657, 10.4515],
  "berlin": [52.5200, 13.4050],
  "munich": [48.1351, 11.5820],
  "cologne": [50.9375, 6.9603],
  "frankfurt": [50.1109, 8.6821],
  "hamburg": [53.5511, 9.9937],
  "spain": [40.4637, -3.7492],
  "barcelona": [41.3874, 2.1686],
  "madrid": [40.4168, -3.7038],
  "seville": [37.3891, -5.9845],
  "valencia": [39.4699, -0.3763],
  "portugal": [39.3999, -8.2245],
  "lisbon": [38.7223, -9.1393],
  "porto": [41.1579, -8.6291],
  "netherlands": [52.1326, 5.2913],
  "holland": [52.1326, 5.2913],
  "amsterdam": [52.3676, 4.9041],
  "rotterdam": [51.9244, 4.4777],
  "belgium": [50.5039, 4.4699],
  "brussels": [50.8503, 4.3517],
  "bruges": [51.2093, 3.2247],
  "antwerp": [51.2194, 4.4025],
  "switzerland": [46.8182, 8.2275],
  "zurich": [47.3769, 8.5417],
  "geneva": [46.2044, 6.1432],
  "austria": [47.5162, 14.5501],
  "vienna": [48.2082, 16.3738],
  "salzburg": [47.8095, 13.0550],
  
  // Europe - Eastern
  "greece": [39.0742, 21.8243],
  "athens": [37.9838, 23.7275],
  "russia": [61.5240, 105.3188],
  "moscow": [55.7558, 37.6173],
  "st petersburg": [59.9343, 30.3351],
  "saint petersburg": [59.9343, 30.3351],
  "petersburg": [59.9343, 30.3351],
  "poland": [51.9194, 19.1451],
  "warsaw": [52.2297, 21.0122],
  "krakow": [50.0647, 19.9450],
  "czech republic": [49.8175, 15.4730],
  "prague": [50.0755, 14.4378],
  "hungary": [47.1625, 19.5033],
  "budapest": [47.4979, 19.0402],
  "romania": [45.9432, 24.9668],
  "bucharest": [44.4268, 26.1025],
  
  // Europe - Nordic
  "sweden": [60.1282, 18.6435],
  "stockholm": [59.3293, 18.0686],
  "denmark": [56.2639, 9.5018],
  "copenhagen": [55.6761, 12.5683],
  "norway": [60.4720, 8.4689],
  "oslo": [59.9139, 10.7522],
  "finland": [61.9241, 25.7482],
  "helsinki": [60.1699, 24.9384],
  
  // Americas - North America
  "united states": [37.0902, -95.7129],
  "usa": [37.0902, -95.7129],
  "america": [37.0902, -95.7129],
  "new york": [40.7128, -74.0060],
  "chicago": [41.8781, -87.6298],
  "los angeles": [34.0522, -118.2437],
  "san francisco": [37.7749, -122.4194],
  "washington": [38.9072, -77.0369],
  "boston": [42.3601, -71.0589],
  "philadelphia": [39.9526, -75.1652],
  "miami": [25.7617, -80.1918],
  "seattle": [47.6062, -122.3321],
  "canada": [56.1304, -106.3468],
  "toronto": [43.6532, -79.3832],
  "montreal": [45.5017, -73.5673],
  "vancouver": [49.2827, -123.1207],
  "mexico": [23.6345, -102.5528],
  "mexico city": [19.4326, -99.1332],
  
  // Americas - South America
  "brazil": [-14.2350, -51.9253],
  "brasilia": [-15.8267, -47.9218],
  "sao paulo": [-23.5505, -46.6333],
  "rio de janeiro": [-22.9068, -43.1729],
  "argentina": [-38.4161, -63.6167],
  "buenos aires": [-34.6037, -58.3816],
  "chile": [-35.6751, -71.5430],
  "santiago": [-33.4489, -70.6693],
  "peru": [-9.1900, -75.0152],
  "lima": [-12.0464, -77.0428],
  "colombia": [4.5709, -74.2973],
  "bogota": [4.7110, -74.0721],
  
  // Asia - East
  "china": [35.8617, 104.1954],
  "beijing": [39.9042, 116.4074],
  "shanghai": [31.2304, 121.4737],
  "hong kong": [22.3193, 114.1694],
  "japan": [36.2048, 138.2529],
  "tokyo": [35.6762, 139.6503],
  "kyoto": [35.0116, 135.7681],
  "osaka": [34.6937, 135.5023],
  "korea": [35.9078, 127.7669],
  "south korea": [35.9078, 127.7669],
  "seoul": [37.5665, 126.9780],
  
  // Asia - South & Southeast
  "india": [20.5937, 78.9629],
  "delhi": [28.7041, 77.1025],
  "mumbai": [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "thailand": [15.8700, 100.9925],
  "bangkok": [13.7563, 100.5018],
  "vietnam": [14.0583, 108.2772],
  "hanoi": [21.0285, 105.8542],
  "singapore": [1.3521, 103.8198],
  "malaysia": [4.2105, 101.9758],
  "kuala lumpur": [3.1390, 101.6869],
  "indonesia": [-0.7893, 113.9213],
  "jakarta": [-6.2088, 106.8456],
  
  // Middle East
  "egypt": [26.8206, 30.8025],
  "cairo": [30.0444, 31.2357],
  "turkey": [38.9637, 35.2433],
  "istanbul": [41.0082, 28.9784],
  "ankara": [39.9334, 32.8597],
  "iran": [32.4279, 53.6880],
  "tehran": [35.6892, 51.3890],
  "iraq": [33.2232, 43.6793],
  "baghdad": [33.3152, 44.3661],
  "israel": [31.0461, 34.8516],
  "jerusalem": [31.7683, 35.2137],
  "tel aviv": [32.0853, 34.7818],
  "saudi arabia": [23.8859, 45.0792],
  "dubai": [25.2048, 55.2708],
  "uae": [23.4241, 53.8478],
  
  // Africa
  "south africa": [-30.5595, 22.9375],
  "cape town": [-33.9249, 18.4241],
  "johannesburg": [-26.2041, 28.0473],
  "morocco": [31.7917, -7.0926],
  "marrakech": [31.6295, -7.9811],
  "kenya": [-0.0236, 37.9062],
  "nairobi": [-1.2921, 36.8219],
  
  // Oceania
  "australia": [-25.2744, 133.7751],
  "sydney": [-33.8688, 151.2093],
  "melbourne": [-37.8136, 144.9631],
  "brisbane": [-27.4698, 153.0251],
  "new zealand": [-40.9006, 174.8860],
  "auckland": [-36.8485, 174.7633],
};

interface MapMarker {
  id: string;
  name: string;
  coordinates: [number, number];
  type: "building" | "movement";
  color: string;
  description?: string;
  year?: string;
  imageUrl?: string;
  macroEra?: string;
}

interface MapViewProps {
  buildings: TimelineBuilding[];
  movements: ChildMovement[];
  macros: MacroMovement[];
  onMarkerClick?: (id: string, type: "building" | "movement") => void;
}

function getCoordinatesFromLocation(location?: string): [number, number] | null {
  if (!location) return null;
  
  const normalized = location.toLowerCase().trim();
  
  // Direct match
  if (LOCATION_COORDINATES[normalized]) {
    return LOCATION_COORDINATES[normalized];
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  
  return null;
}

function getMarkerColor(macroId?: string): string {
  // This should match your MACRO_PALETTES colors
  const colors: Record<string, string> = {
    "ancient": "#10b981", // emerald
    "classical": "#f59e0b", // amber
    "medieval": "#ec4899", // fuchsia
    "renaissance": "#3b82f6", // blue
    "modern": "#8b5cf6", // violet
  };
  
  return colors[macroId || ""] || "#6366f1"; // default indigo
}

export function MapView({ buildings, movements, macros, onMarkerClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [leafletIcon, setLeafletIcon] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Fix for default marker icon in Next.js
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        
        // Create custom colored icons
        const customIcon = (color: string) => L.divIcon({
          html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: "custom-marker",
          iconSize: [25, 25],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24],
        });
        
        setLeafletIcon(() => customIcon);
      });
    }
  }, []);

  const markers = useMemo(() => {
    const result: MapMarker[] = [];
    
    // Create lookup for macro by movement parent
    const macroById: Record<string, MacroMovement> = {};
    macros.forEach((macro) => {
      macroById[macro.id] = macro;
    });
    
    console.log('MapView data:', {
      buildingCount: buildings.length,
      movementCount: movements.length,
      macroCount: macros.length
    });
    
    // Process buildings
    buildings.forEach((building) => {
      const location = building.city || building.country || building.location;
      const coords = getCoordinatesFromLocation(location);
      
      if (!coords) {
        console.log('No coords for building:', building.name, 'location:', location);
      }
      
      if (coords) {
        result.push({
          id: building.id,
          name: building.name,
          coordinates: coords,
          type: "building",
          color: "#f59e0b", // amber for buildings
          description: building.description,
          year: building.yearsBuilt,
          imageUrl: building.imageUrl,
        });
      }
    });
    
    // Process movements
    movements.forEach((movement) => {
      const coords = getCoordinatesFromLocation(movement.region);
      const macro = movement.parent ? macroById[movement.parent] : undefined;
      
      if (!coords) {
        console.log('No coords for movement:', movement.name, 'region:', movement.region);
      }
      
      if (coords) {
        result.push({
          id: movement.id,
          name: movement.name,
          coordinates: coords,
          type: "movement",
          color: getMarkerColor(macro?.id),
          description: `${movement.start} - ${movement.end}`,
          macroEra: macro?.name,
        });
      }
    });
    
    console.log('Total markers:', result.length);
    
    return result;
  }, [buildings, movements, macros]);

  // Create heatmap data combining buildings and movements
  const heatmapPoints = useMemo(() => {
    const pointMap = new Map<string, number>();
    
    // Add movements with base intensity
    movements.forEach((movement) => {
      const coords = getCoordinatesFromLocation(movement.region);
      if (coords) {
        const key = `${coords[0]},${coords[1]}`;
        const current = pointMap.get(key) || 0;
        // Each movement adds base intensity
        pointMap.set(key, current + 0.5);
      }
    });
    
    // Add buildings with higher intensity
    buildings.forEach((building) => {
      const location = building.city || building.country || building.location;
      const coords = getCoordinatesFromLocation(location);
      if (coords) {
        const key = `${coords[0]},${coords[1]}`;
        const current = pointMap.get(key) || 0;
        // Each building adds more intensity
        pointMap.set(key, current + 1);
      }
    });
    
    // Convert to array format
    const points: [number, number, number][] = Array.from(pointMap.entries()).map(([key, intensity]) => {
      const [lat, lng] = key.split(',').map(Number);
      // Normalize intensity to 0-1 range, with cap at 5
      return [lat, lng, Math.min(intensity / 5, 1)];
    });
    
    console.log('Heatmap points:', points.length, 'Total intensity points:', pointMap.size);
    return points;
  }, [movements, buildings]);

  if (!mounted) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
      {/* Layer toggle */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 backdrop-blur-sm transition-all hover:bg-slate-800/90"
        >
          <div className="text-xs font-semibold text-white">
            {showHeatmap ? 'Show Markers' : 'Show Heatmap'}
          </div>
        </button>
      </div>
      
      {/* Debug info display */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <div className="rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 backdrop-blur-sm">
          <div className="text-xs font-semibold text-white">
            {showHeatmap ? `${heatmapPoints.length} locations` : `${markers.length} markers`}
          </div>
          <div className="text-[10px] text-slate-300">
            {showHeatmap ? 'Density map' : `${buildings.length} buildings`}
          </div>
        </div>
      </div>
      
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        style={{ background: "#1e293b" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Show heatmap or markers based on toggle */}
        {showHeatmap ? (
          <HeatmapLayer points={heatmapPoints} />
        ) : (
          markers.map((marker) => {
          const icon = leafletIcon ? leafletIcon(marker.color) : undefined;
          
          return (
            <Marker
              key={`${marker.type}-${marker.id}`}
              position={marker.coordinates}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(marker.id, marker.type);
                  }
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {marker.imageUrl && (
                    <img
                      src={marker.imageUrl}
                      alt={marker.name}
                      className="mb-2 h-32 w-full rounded object-cover"
                    />
                  )}
                  <h3 className="mb-1 font-semibold text-slate-900">{marker.name}</h3>
                  {marker.macroEra && (
                    <p className="mb-1 text-xs text-slate-600">Era: {marker.macroEra}</p>
                  )}
                  {marker.year && (
                    <p className="mb-1 text-xs text-slate-600">Built: {marker.year}</p>
                  )}
                  {marker.description && (
                    <p className="mt-2 text-sm text-slate-700">{marker.description}</p>
                  )}
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {marker.type === "building" ? "Building" : "Movement"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-white/20 bg-slate-900/90 p-3 backdrop-blur-sm">
        <div className="mb-2 text-xs font-semibold text-white">Legend</div>
        {showHeatmap ? (
          <div className="space-y-1 text-xs text-slate-300">
            <div className="text-[10px] text-slate-400 mb-1">Architecture Density</div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #ef4444)' }}></div>
              <span className="text-[10px]">Low → High</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Buildings + Movements</div>
          </div>
        ) : (
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500 border border-white"></div>
              <span>Buildings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 border border-white"></div>
              <span>Ancient/Classical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-fuchsia-500 border border-white"></div>
              <span>Medieval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 border border-white"></div>
              <span>Renaissance</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
