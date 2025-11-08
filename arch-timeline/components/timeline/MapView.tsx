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

// Coordinate lookup for common locations
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // Europe
  "rome": [41.9028, 12.4964],
  "italy": [41.9028, 12.4964],
  "paris": [48.8566, 2.3522],
  "france": [46.2276, 2.2137],
  "london": [51.5074, -0.1278],
  "england": [52.3555, -1.1743],
  "united kingdom": [55.3781, -3.4360],
  "germany": [51.1657, 10.4515],
  "berlin": [52.5200, 13.4050],
  "spain": [40.4637, -3.7492],
  "barcelona": [41.3874, 2.1686],
  "madrid": [40.4168, -3.7038],
  "athens": [37.9838, 23.7275],
  "greece": [39.0742, 21.8243],
  "vienna": [48.2082, 16.3738],
  "austria": [47.5162, 14.5501],
  "netherlands": [52.1326, 5.2913],
  "amsterdam": [52.3676, 4.9041],
  
  // Americas
  "united states": [37.0902, -95.7129],
  "new york": [40.7128, -74.0060],
  "chicago": [41.8781, -87.6298],
  "los angeles": [34.0522, -118.2437],
  "washington": [38.9072, -77.0369],
  "brazil": [-14.2350, -51.9253],
  "brasilia": [-15.8267, -47.9218],
  "mexico": [23.6345, -102.5528],
  "mexico city": [19.4326, -99.1332],
  
  // Asia
  "china": [35.8617, 104.1954],
  "beijing": [39.9042, 116.4074],
  "japan": [36.2048, 138.2529],
  "tokyo": [35.6762, 139.6503],
  "india": [20.5937, 78.9629],
  "delhi": [28.7041, 77.1025],
  "mumbai": [19.0760, 72.8777],
  
  // Middle East
  "egypt": [26.8206, 30.8025],
  "cairo": [30.0444, 31.2357],
  "turkey": [38.9637, 35.2433],
  "istanbul": [41.0082, 28.9784],
  
  // Others
  "australia": [-25.2744, 133.7751],
  "sydney": [-33.8688, 151.2093],
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
    
    // Process buildings
    buildings.forEach((building) => {
      const location = building.city || building.country || building.location;
      const coords = getCoordinatesFromLocation(location);
      
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
    
    return result;
  }, [buildings, movements, macros]);

  if (!mounted) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
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
        
        {markers.map((marker) => {
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
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-white/20 bg-slate-900/90 p-3 backdrop-blur-sm">
        <div className="mb-2 text-xs font-semibold text-white">Legend</div>
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
      </div>
    </div>
  );
}
