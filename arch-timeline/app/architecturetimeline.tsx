"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, Search, Filter, ZoomIn, ZoomOut, X, Image as ImageIcon } from "lucide-react";
import { createClient } from 'next-sanity';
import { convertSanityToTimelineFormat } from '../hooks/useTimelineData';

/**
 * Interactive Architecture Timeline (Horizontal)
 * - Banded horizontal timeline by macro movement (parents)
 * - Click a band to reveal child movements as chips on the same time axis
 * - Pan (mouse/touch) + scroll, zoom in/out (year scale)
 * - Quick filters and search
 * - TailwindCSS styling; no external CSS required
 * - All data embedded below; adapt/extend as needed
 *
 * Usage: Default export <ArchitectureTimeline />
 */

// Image component with error handling and fallback
const ArchImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}> = ({ src, alt, className = "", fallbackClassName = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <>
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          loading="lazy"
        />
      ) : (
        <div className={`${fallbackClassName} bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center`}>
          <ImageIcon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      {imageLoading && !imageError && (
        <div className={`${fallbackClassName} bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse`} />
      )}
    </>
  );
};

// -----------------------------
// Types
// -----------------------------

type Work = { title: string; location?: string; year?: string; imageUrl?: string };

type TextRef = { title: string; author?: string; year?: string };

type Figure = { name: string; role?: string };

type SubChild = {
  id: string;
  name: string;
  type: 'work' | 'figure' | 'text';
  year?: number; // For timeline positioning
  location?: string;
  imageUrl?: string;
  role?: string; // For figures
  author?: string; // For texts
  parent: string; // child movement id
};

type ChildMovement = {
  id: string;
  name: string;
  start: number; // BCE negative (e.g., -3000)
  end: number;   // inclusive upper bound (approx.)
  region: string;
  figures?: Figure[];
  traits?: string[];
  works?: Work[];
  texts?: TextRef[];
  parent: string; // macro id
  imageUrl?: string; // Representative image for the movement
  subchildren?: string[]; // ids of subchildren (works, figures, texts)
};

type MacroMovement = {
  id: string;
  name: string;
  colorClass: string; // Tailwind bg color for the band
  start: number;
  end: number;
  children: string[]; // ids of child movements
  imageUrl?: string; // Representative image for the macro movement
};

// -----------------------------
// Data helpers
// -----------------------------

// Convenience function for years (label formatting)
function fmtYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y}`;
}

// -----------------------------
// Dataset (reduced but comprehensive)
//  Note: You can extend this list further; kept under ~100 entries for performance
// -----------------------------

const CHILDREN: ChildMovement[] = [
  // 1) Ancient & Classical Traditions
  {
    id: "anc-egyptian",
    name: "Ancient Egyptian",
    start: -3000,
    end: -332,
    region: "Egypt",
    figures: [{ name: "Imhotep" }, { name: "Senenmut" }],
    traits: ["Monumental stone", "Axiality", "Post-and-lintel", "Pyramids"],
    works: [
      { title: "Step Pyramid of Djoser", year: "c. 2630 BCE", imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop" },
      { title: "Karnak Complex", imageUrl: "https://images.unsplash.com/photo-1593772380467-b1f6da3b29a4?w=400&h=300&fit=crop" },
      { title: "Luxor Temple", imageUrl: "https://images.unsplash.com/photo-1583155667729-9b1c06fda5d0?w=400&h=300&fit=crop" },
    ],
    texts: [],
    parent: "macro-ancient",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=120&fit=crop",
    subchildren: ["egyp-step-pyramid", "egyp-imhotep", "egyp-karnak", "egyp-senenmut"],
  },
  {
    id: "mesopotamian",
    name: "Mesopotamian",
    start: -3500,
    end: -539,
    region: "Sumer/Akkad/Babylon/Assyria",
    traits: ["Ziggurats", "Mud-brick", "Glazed brick reliefs"],
    works: [
      { title: "Ziggurat of Ur" },
      { title: "Ishtar Gate" },
      { title: "Palace of Sargon II" },
    ],
    parent: "macro-ancient",
  },
  {
    id: "greek-classical",
    name: "Classical Greek",
    start: -600,
    end: -323,
    region: "Greek World",
    figures: [
      { name: "Iktinos" },
      { name: "Kallikrates" },
      { name: "Hippodamus", role: "Urbanist" },
    ],
    traits: ["Orders", "Proportion", "Peripteral temples"],
    works: [
      { title: "Parthenon", year: "447–432 BCE", imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d2a1540d8d?w=400&h=300&fit=crop" },
      { title: "Erechtheion", imageUrl: "https://images.unsplash.com/photo-1603793303277-ed67787545e1?w=400&h=300&fit=crop" },
      { title: "Theater of Epidaurus", imageUrl: "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=400&h=300&fit=crop" },
    ],
    texts: [],
    parent: "macro-ancient",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d2a1540d8d?w=200&h=120&fit=crop",
  },
  {
    id: "roman",
    name: "Ancient Roman",
    start: -509,
    end: 476,
    region: "Roman Empire",
    figures: [{ name: "Vitruvius" }, { name: "Apollodorus of Damascus" }],
    traits: ["Concrete", "Arches/Vaults/Domes", "Infrastructure"],
    works: [
      { title: "Pantheon", year: "118–128" },
      { title: "Colosseum" },
      { title: "Baths of Caracalla" },
    ],
    texts: [{ title: "De Architectura", author: "Vitruvius" }],
    parent: "macro-ancient",
  },

  // 2) Medieval & Cross-Cultural Sacred
  {
    id: "byzantine",
    name: "Byzantine",
    start: 330,
    end: 1453,
    region: "Eastern Mediterranean",
    figures: [
      { name: "Anthemius of Tralles" },
      { name: "Isidore of Miletus" },
    ],
    traits: ["Domes on pendentives", "Mosaics", "Centralized plans"],
    works: [
      { title: "Hagia Sophia", year: "537" },
      { title: "San Vitale, Ravenna" },
      { title: "Hosios Loukas" },
    ],
    parent: "macro-medieval",
  },
  {
    id: "islamic-medieval",
    name: "Islamic (early–medieval)",
    start: 661,
    end: 1500,
    region: "Iberia to India",
    traits: ["Courtyards", "Iwans", "Muqarnas", "Calligraphy"],
    works: [
      { title: "Great Mosque of Córdoba" },
      { title: "Dome of the Rock" },
      { title: "Alhambra" },
    ],
    texts: [],
    parent: "macro-medieval",
  },
  {
    id: "romanesque",
    name: "Romanesque",
    start: 950,
    end: 1150,
    region: "Western/Central Europe",
    traits: ["Round arches", "Barrel/groin vaults", "Thick walls"],
    works: [
      { title: "Cluny Abbey" },
      { title: "Speyer Cathedral" },
      { title: "St. Sernin, Toulouse" },
    ],
    parent: "macro-medieval",
  },
  {
    id: "gothic",
    name: "Gothic",
    start: 1140,
    end: 1500,
    region: "W./N. Europe",
    figures: [{ name: "Abbot Suger", role: "Patron" }],
    traits: ["Pointed arch", "Rib vault", "Flying buttress", "Stained glass"],
    works: [
      { title: "Chartres Cathedral" },
      { title: "Amiens Cathedral" },
      { title: "Cologne Cathedral" },
    ],
    texts: [{ title: "De Administratione", author: "Suger" }],
    parent: "macro-medieval",
  },

  // 3) Early‑Modern Classicisms
  {
    id: "renaissance",
    name: "Renaissance",
    start: 1400,
    end: 1600,
    region: "Italy → Europe",
    figures: [
      { name: "Filippo Brunelleschi" },
      { name: "Leon Battista Alberti" },
      { name: "Andrea Palladio" },
    ],
    traits: ["Humanist proportion", "Orders revival", "Perspective"],
    works: [
      { title: "Florence Cathedral Dome" },
      { title: "Tempietto (Bramante)" },
      { title: "Villa Rotonda" },
    ],
    texts: [
      { title: "De re aedificatoria", author: "Alberti", year: "c. 1452" },
      { title: "Four Books of Architecture", author: "Palladio", year: "1570" },
    ],
    parent: "macro-early-modern-classicisms",
  },
  {
    id: "baroque",
    name: "Baroque",
    start: 1600,
    end: 1750,
    region: "Italy/France/Spain + Colonies",
    figures: [{ name: "Bernini" }, { name: "Borromini" }, { name: "Guarini" }],
    traits: ["Dramatic space", "Ellipses/ovals", "Urban scenography"],
    works: [
      { title: "St. Peter’s Colonnade" },
      { title: "San Carlo alle Quattro Fontane" },
      { title: "Palace of Versailles" },
    ],
    parent: "macro-early-modern-classicisms",
  },
  {
    id: "neoclassical",
    name: "Neoclassical",
    start: 1750,
    end: 1830,
    region: "Europe/US/Russia",
    figures: [{ name: "Ledoux" }, { name: "Boullée" }, { name: "Schinkel" }],
    traits: ["Archaeological rigor", "Civic gravitas", "Simplicity"],
    works: [
      { title: "Panthéon, Paris" },
      { title: "Altes Museum" },
      { title: "US Capitol" },
    ],
    texts: [{ title: "Architecture Considered…", author: "Ledoux" }],
    parent: "macro-early-modern-classicisms",
  },

  // 4) Global Empires & Regional Traditions
  {
    id: "ottoman-classical",
    name: "Ottoman Classical",
    start: 1453,
    end: 1700,
    region: "Anatolia/Balkans",
    figures: [{ name: "Mimar Sinan" }],
    traits: ["Large domes", "Cascading volumes", "Mosque complexes"],
    works: [
      { title: "Süleymaniye Mosque" },
      { title: "Selimiye Mosque" },
    ],
    parent: "macro-empires",
  },
  {
    id: "mughal",
    name: "Mughal",
    start: 1526,
    end: 1858,
    region: "South Asia",
    figures: [{ name: "Ustad Ahmad Lahori" }, { name: "Shah Jahan", role: "Patron" }],
    traits: ["Charbagh", "Inlay", "Bulbous domes"],
    works: [
      { title: "Taj Mahal" },
      { title: "Fatehpur Sikri" },
      { title: "Red Fort" },
    ],
    parent: "macro-empires",
  },
  {
    id: "chinese-ming-qing",
    name: "Chinese (Ming–Qing)",
    start: 1368,
    end: 1912,
    region: "China/East Asia",
    traits: ["Axial palaces", "Timber frames", "Courtyards"],
    works: [
      { title: "Forbidden City" },
      { title: "Temple of Heaven" },
      { title: "Suzhou Gardens" },
    ],
    texts: [{ title: "Yingzao Fashi", author: "Li Jie" }],
    parent: "macro-empires",
  },
  {
    id: "japan-edo",
    name: "Japanese (Edo sukiya/shoin)",
    start: 1600,
    end: 1868,
    region: "Japan",
    figures: [{ name: "Sen no Rikyū" }, { name: "Kobori Enshū" }],
    traits: ["Tatami module", "Sliding partitions", "Tea aesthetics"],
    works: [
      { title: "Katsura Imperial Villa" },
      { title: "Nijō Castle" },
      { title: "Kiyomizu-dera" },
    ],
    parent: "macro-empires",
  },

  // 5) Industrial Age & Historicisms
  {
    id: "gothic-revival",
    name: "Gothic Revival",
    start: 1780,
    end: 1910,
    region: "Europe/US",
    figures: [{ name: "A.W.N. Pugin" }, { name: "Viollet-le-Duc" }],
    traits: ["Moralized medievalism", "Spires", "Tracery"],
    works: [
      { title: "Palace of Westminster" },
      { title: "Notre-Dame restoration" },
    ],
    texts: [
      { title: "Contrasts", author: "Pugin", year: "1836" },
      { title: "Dictionnaire raisonné", author: "Viollet-le-Duc" },
    ],
    parent: "macro-industrial",
  },
  {
    id: "beaux-arts",
    name: "Beaux-Arts / City Beautiful",
    start: 1850,
    end: 1930,
    region: "France/US/Global",
    figures: [{ name: "Charles Garnier" }, { name: "D. Burnham" }],
    traits: ["Axial planning", "Classical composition", "Ornament"],
    works: [
      { title: "Paris Opéra" },
      { title: "NYPL" },
      { title: "Plan of Washington (McMillan)" },
    ],
    parent: "macro-industrial",
  },
  {
    id: "arts-crafts",
    name: "Arts & Crafts",
    start: 1860,
    end: 1910,
    region: "Britain/US",
    figures: [{ name: "William Morris" }, { name: "C.F.A. Voysey" }],
    traits: ["Craft integrity", "Vernacular", "Anti-industrial"],
    works: [
      { title: "Red House" },
      { title: "Gamble House" },
    ],
    parent: "macro-industrial",
  },
  {
    id: "art-nouveau",
    name: "Art Nouveau / Jugendstil",
    start: 1890,
    end: 1914,
    region: "Europe/LatAm",
    figures: [{ name: "Victor Horta" }, { name: "Antoni Gaudí" }, { name: "C.R. Mackintosh" }],
    traits: ["Organic line", "Synthesis of arts"],
    works: [
      { title: "Hôtel Tassel" },
      { title: "Casa Batlló" },
      { title: "Glasgow School of Art" },
    ],
    parent: "macro-industrial",
  },
  {
    id: "chicago-school",
    name: "Chicago School / Early Skyscraper",
    start: 1880,
    end: 1910,
    region: "US",
    figures: [{ name: "Jenney" }, { name: "Burnham" }, { name: "Louis Sullivan" }],
    traits: ["Steel frame", "Curtain wall", "Commercial urbanism"],
    works: [
      { title: "Monadnock Building" },
      { title: "Carson Pirie Scott" },
    ],
    parent: "macro-industrial",
  },

  // 6) Modernism
  {
    id: "bauhaus-intl",
    name: "Bauhaus / International Style",
    start: 1919,
    end: 1970,
    region: "Germany/US/Global",
    figures: [{ name: "Gropius" }, { name: "Le Corbusier" }, { name: "Mies" }],
    traits: ["Functionalism", "Volume over mass", "Pilotis/free plan"],
    works: [
      { title: "Bauhaus Dessau" },
      { title: "Villa Savoye" },
      { title: "Seagram Building" },
    ],
    texts: [{ title: "Vers une Architecture", author: "Le Corbusier", year: "1923" }],
    parent: "macro-modernism",
  },
  {
    id: "expressionism",
    name: "Expressionism",
    start: 1910,
    end: 1930,
    region: "Germany/Netherlands",
    figures: [{ name: "Bruno Taut" }, { name: "Erich Mendelsohn" }],
    traits: ["Brick/glass utopias", "Dynamic forms"],
    works: [
      { title: "Einstein Tower" },
      { title: "Glass Pavilion" },
    ],
    parent: "macro-modernism",
  },
  {
    id: "constructivism",
    name: "Constructivism",
    start: 1917,
    end: 1933,
    region: "USSR",
    figures: [{ name: "Tatlin" }, { name: "Ginzburg" }, { name: "Melnikov" }],
    traits: ["Industrial materials", "Social utility"],
    works: [
      { title: "Tatlin’s Tower (unbuilt)" },
      { title: "Narkomfin Building" },
    ],
    parent: "macro-modernism",
  },
  {
    id: "de-stijl",
    name: "De Stijl",
    start: 1917,
    end: 1931,
    region: "Netherlands",
    figures: [{ name: "Gerrit Rietveld" }, { name: "Theo van Doesburg" }],
    traits: ["Planar abstraction", "Primary colors"],
    works: [{ title: "Schröder House" }],
    parent: "macro-modernism",
  },
  {
    id: "art-deco",
    name: "Art Deco / Streamline",
    start: 1920,
    end: 1940,
    region: "Global",
    traits: ["Geometric ornament", "Streamline curves"],
    works: [{ title: "Chrysler Building" }, { title: "Palais de Chaillot" }],
    parent: "macro-modernism",
  },
  {
    id: "organic",
    name: "Organic Architecture",
    start: 1925,
    end: 1975,
    region: "US/Finland",
    figures: [{ name: "Frank Lloyd Wright" }, { name: "Alvar Aalto" }],
    traits: ["Site-responsive", "Natural materials"],
    works: [{ title: "Fallingwater" }, { title: "Villa Mairea" }, { title: "Sydney Opera House" }],
    parent: "macro-modernism",
  },
  {
    id: "brutalism",
    name: "Brutalism",
    start: 1950,
    end: 1975,
    region: "UK/Global",
    figures: [{ name: "Alison & Peter Smithson" }, { name: "Le Corbusier (late)" }],
    traits: ["Béton brut", "Exposed services/structure"],
    works: [{ title: "Unité d’Habitation" }, { title: "Barbican" }, { title: "Boston City Hall" }],
    parent: "macro-modernism",
  },
  {
    id: "metabolism",
    name: "Metabolism",
    start: 1960,
    end: 1975,
    region: "Japan",
    figures: [{ name: "Kisho Kurokawa" }, { name: "Kiyonori Kikutake" }],
    traits: ["Megastructure", "Plug-in modules"],
    works: [{ title: "Nakagin Capsule Tower" }],
    parent: "macro-modernism",
  },

  // 7) Late Modern, Postmodern & responses
  {
    id: "high-tech",
    name: "High‑Tech",
    start: 1970,
    end: 2005,
    region: "UK/France/Global",
    figures: [{ name: "Foster" }, { name: "Rogers" }, { name: "Piano" }],
    traits: ["Exposed systems", "Lightweight frames"],
    works: [{ title: "Centre Pompidou" }, { title: "Lloyd’s of London" }],
    parent: "macro-late-post",
  },
  {
    id: "postmodern",
    name: "Postmodernism",
    start: 1968,
    end: 1995,
    region: "US/Europe/Global",
    figures: [{ name: "Venturi & Scott Brown" }, { name: "Michael Graves" }, { name: "Aldo Rossi" }],
    traits: ["Irony", "Historical reference", "Pluralism"],
    works: [
      { title: "Vanna Venturi House" },
      { title: "Portland Building" },
      { title: "San Cataldo Cemetery" },
    ],
    parent: "macro-late-post",
  },
  {
    id: "deconstructivism",
    name: "Deconstructivism",
    start: 1985,
    end: 2000,
    region: "US/Europe",
    figures: [{ name: "Frank Gehry" }, { name: "Zaha Hadid" }, { name: "Libeskind" }],
    traits: ["Fragmentation", "Non-orthogonal geometry"],
    works: [{ title: "Guggenheim Bilbao" }, { title: "Vitra Fire Station" }, { title: "Jewish Museum Berlin" }],
    parent: "macro-late-post",
  },
  {
    id: "critical-regionalism",
    name: "Critical Regionalism",
    start: 1983,
    end: 2005,
    region: "Global",
    figures: [{ name: "Álvaro Siza" }, { name: "Tadao Ando" }, { name: "B.V. Doshi" }],
    traits: ["Local climate/materials", "Modern techniques"],
    works: [{ title: "Church of Santa Maria" }, { title: "Church of the Light" }],
    parent: "macro-late-post",
  },

  // 8) Contemporary currents
  {
    id: "parametric",
    name: "Parametric / Digital",
    start: 2000,
    end: 2025,
    region: "Global",
    figures: [{ name: "ZHA" }, { name: "Patrik Schumacher" }, { name: "Achim Menges" }],
    traits: ["Algorithmic forms", "Robotic fabrication"],
    works: [{ title: "Heydar Aliyev Center" }, { title: "ICD/ITKE Pavilions" }],
    parent: "macro-contemporary",
  },
  {
    id: "sustainable",
    name: "Sustainable / Decarbonization",
    start: 1990,
    end: 2025,
    region: "Global",
    figures: [{ name: "Lacaton & Vassal" }, { name: "Snøhetta" }, { name: "Studio Gang" }],
    traits: ["Net‑zero", "Embodied carbon", "Adaptive reuse"],
    works: [
      { title: "Latapie House" },
      { title: "Oslo Opera House" },
      { title: "Aqua Tower" },
    ],
    parent: "macro-contemporary",
  },
  {
    id: "mass-timber",
    name: "Mass Timber / Hybrid",
    start: 2010,
    end: 2025,
    region: "Europe/NA",
    figures: [{ name: "Waugh Thistleton" }, { name: "Shigeru Ban" }, { name: "Michael Green" }],
    traits: ["CLT", "Glulam", "Low‑carbon structure"],
    works: [{ title: "Brock Commons" }, { title: "Tamedia HQ" }],
    parent: "macro-contemporary",
  },
  {
    id: "neo-minimal",
    name: "Neo‑Minimalism / Atmospherics",
    start: 1990,
    end: 2025,
    region: "Global",
    figures: [{ name: "Ando" }, { name: "SANAA" }, { name: "Zumthor" }],
    traits: ["Reduction", "Light", "Material precision"],
    works: [{ title: "Therme Vals" }, { title: "Rolex Learning Center" }, { title: "Teshima Museum" }],
    parent: "macro-contemporary",
  },
  {
    id: "vernacular-social",
    name: "Contemporary Vernacular / Social",
    start: 2000,
    end: 2025,
    region: "Global South & beyond",
    figures: [{ name: "Francis Kéré" }, { name: "Anna Heringer" }, { name: "Studio Mumbai" }],
    traits: ["Local craft", "Community-led"],
    works: [{ title: "Gando Primary School" }, { title: "METI School" }],
    parent: "macro-contemporary",
  },
  {
    id: "resilience",
    name: "Resilience / Sponge Urbanism",
    start: 2010,
    end: 2025,
    region: "Global/China",
    figures: [{ name: "Kongjian Yu" }, { name: "Henk Ovink" }],
    traits: ["Flood mitigation", "Landscape urbanism"],
    works: [{ title: "Yanweizhou Park" }],
    parent: "macro-contemporary",
  },
];

// Subchildren data (works, figures, texts as timeline elements)
const SUBCHILDREN: SubChild[] = [
  // Ancient Egyptian subchildren
  {
    id: "egyp-step-pyramid",
    name: "Step Pyramid of Djoser",
    type: "work",
    year: -2630,
    location: "Saqqara, Egypt",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=200&fit=crop",
    parent: "anc-egyptian"
  },
  {
    id: "egyp-imhotep",
    name: "Imhotep",
    type: "figure",
    year: -2650,
    role: "Architect, Physician, Polymath",
    parent: "anc-egyptian"
  },
  {
    id: "egyp-karnak",
    name: "Karnak Complex",
    type: "work",
    year: -1500,
    location: "Luxor, Egypt",
    imageUrl: "https://images.unsplash.com/photo-1593772380467-b1f6da3b29a4?w=300&h=200&fit=crop",
    parent: "anc-egyptian"
  },
  {
    id: "egyp-senenmut",
    name: "Senenmut",
    type: "figure",
    year: -1470,
    role: "Royal Architect",
    parent: "anc-egyptian"
  },
];

// Loading component
const TimelineLoading: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-white text-lg">Loading Architecture Timeline...</p>
    </div>
  </div>
);

// Error component
const TimelineError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center space-y-4 p-8 max-w-md">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h2 className="text-white text-2xl font-bold">Timeline Load Error</h2>
      <p className="text-gray-300">{error}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Fallback data in case CMS is empty
const FALLBACK_MACROS: MacroMovement[] = [
  {
    id: "macro-ancient",
    name: "Ancient & Classical Traditions",
    colorClass: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
    start: -3000,
    end: 500,
    children: [],
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d2a1540d8d?w=200&h=120&fit=crop",
  },
  {
    id: "macro-medieval",
    name: "Medieval & Cross‑Cultural Sacred",
    colorClass: "bg-gradient-to-r from-purple-600 to-purple-700 text-white",
    start: 300,
    end: 1500,
    children: [],
    imageUrl: "https://images.unsplash.com/photo-1560698228-bb3fe8d79a50?w=200&h=120&fit=crop",
  },
  {
    id: "macro-contemporary",
    name: "Contemporary Architecture",
    colorClass: "bg-gradient-to-r from-lime-600 to-lime-700 text-white",
    start: 2000,
    end: 2025,
    children: [],
  },
];

// -----------------------------
// Timeline component
// -----------------------------

const YEAR_MIN = -3000; // earliest
const YEAR_MAX = 2025;  // latest
const INITIAL_PIXELS_PER_YEAR = 0.15; // base zoom (px per year)

export default function ArchitectureTimeline() {
  console.log('🚀 ArchitectureTimeline component starting...');
  
  // ALL HOOKS FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const [sanityData, setSanityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(INITIAL_PIXELS_PER_YEAR);
  const [offsetX, setOffsetX] = useState(0);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMacro, setFilterMacro] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChildMovement | null>(null);
  const [originalScale, setOriginalScale] = useState(INITIAL_PIXELS_PER_YEAR);
  const [originalOffsetX, setOriginalOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);
  const [hoveredSubchild, setHoveredSubchild] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panStart = useRef<{ x: number; offsetX: number } | null>(null);
  
  console.log('🎯 Current state:', { sanityData: !!sanityData, loading, error });
  
  const sanityClient = createClient({
    projectId: "9i4jo80o",
    dataset: "production", 
    apiVersion: "2025-09-22",
    useCdn: false,
  });
  
  // Immediate data fetch without useEffect for testing
  if (loading && !sanityData && !error) {
    console.log('� Starting immediate fetch...');
    setLoading(false); // Prevent infinite re-render
    
    (async () => {
      try {
        console.log('🔍 Fetching data...');
        const [macroMovements, childMovements, works, figures] = await Promise.all([
          sanityClient.fetch('*[_type == "macroMovement"]'),
          sanityClient.fetch('*[_type == "childMovement"]'),
          sanityClient.fetch('*[_type == "architecturalWork"]'),
          sanityClient.fetch('*[_type == "keyFigure"]')
        ]);
        
        console.log('✅ Fetched raw data:', { 
          macroMovements: macroMovements.length, 
          childMovements: childMovements.length, 
          works: works.length, 
          figures: figures.length 
        });
        
        const newData = { macroMovements, childMovements, works, figures };
        setSanityData(newData);
        console.log('✅ sanityData has been set');
        
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError('Failed to load timeline data');
      }
    })();
  }
  
  const fetchData = async () => {
    // Keep the function for the refetch button
    try {
      setLoading(true);
      setError(null);
      
      const [macroMovements, childMovements, works, figures] = await Promise.all([
        sanityClient.fetch('*[_type == "macroMovement"]'),
        sanityClient.fetch('*[_type == "childMovement"]'),
        sanityClient.fetch('*[_type == "architecturalWork"]'),
        sanityClient.fetch('*[_type == "keyFigure"]')
      ]);
      
      setSanityData({ macroMovements, childMovements, works, figures });
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };
  
  const refetch = fetchData;
  
  // Remove the problematic useEffect temporarily
  /*
  useEffect(() => {
    console.log('📍 useEffect triggered - SIMPLE TEST');
    setLoading(false);
  }, []);
  */

  // Timeline states already declared at the top

  // Convert Sanity data to timeline format
  const timelineData = useMemo(() => {
    if (sanityData && sanityData.macroMovements && sanityData.macroMovements.length > 0) {
      console.log('🔄 Converting Sanity data:', {
        macroMovements: sanityData.macroMovements.length,
        childMovements: sanityData.childMovements?.length || 0,
        works: sanityData.works?.length || 0,
        figures: sanityData.figures?.length || 0
      });
      try {
        const converted = convertSanityToTimelineFormat(sanityData);
        console.log('✅ Converted timeline data:', {
          macros: converted.macros.length,
          children: converted.children.length,
          subchildren: converted.subchildren.length
        });
        return converted;
      } catch (err) {
        console.error('❌ Conversion error:', err);
        return { macros: FALLBACK_MACROS, children: [], subchildren: [] };
      }
    }
    console.log('⚠️ No Sanity data, using fallback. Data state:', {
      sanityData: !!sanityData,
      macroMovements: sanityData?.macroMovements?.length || 'undefined',
      loading,
      error
    });
    return { macros: FALLBACK_MACROS, children: [], subchildren: [] };
  }, [sanityData, loading, error]);

  const { macros: MACROS, children: CHILDREN, subchildren: SUBCHILDREN } = timelineData;

  // Quick lookup objects
  const CHILD_BY_ID: Record<string, ChildMovement> = useMemo(() => 
    Object.fromEntries(CHILDREN.map((c) => [c.id, c])), [CHILDREN]
  );

  const SUBCHILD_BY_ID: Record<string, SubChild> = useMemo(() => 
    Object.fromEntries(SUBCHILDREN.map((s) => [s.id, s])), [SUBCHILDREN]
  );

  // Show loading state
  if (loading) {
    return <TimelineLoading />;
  }

  // Show error state
  if (error) {
    return <TimelineError error={error} onRetry={refetch} />;
  }

  const yearsSpan = YEAR_MAX - YEAR_MIN;
  const totalWidth = Math.max(1200, yearsSpan * scale);

  // Refs already declared at the top

  // Handle mouse/touch panning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onDown = (e: MouseEvent) => {
      setIsPanning(true);
      panStart.current = { x: e.clientX, offsetX };
    };
    const onMove = (e: MouseEvent) => {
      if (!isPanning || !panStart.current) return;
      const dx = e.clientX - panStart.current.x;
      setOffsetX(panStart.current.offsetX + dx);
    };
    const onUp = () => {
      setIsPanning(false);
      panStart.current = null;
    };
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [offsetX, isPanning]);

  // Wheel zoom (ctrl/cmd + wheel) or pinch trackpads
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        setScale((s) => {
          const next = Math.min(30.0, Math.max(0.05, s * (delta > 0 ? 0.9 : 1.1)));
          return next;
        });
      } else {
        // horizontal scroll for trackpads
        setOffsetX((prev) => prev - e.deltaY - e.deltaX);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  const shownMacros = useMemo(() => (filterMacro ? MACROS.filter(m => m.id === filterMacro) : MACROS), [filterMacro]);

  const searchedChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return CHILDREN.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      (c.traits?.some(t => t.toLowerCase().includes(q)) ?? false) ||
      (c.figures?.some(f => f.name.toLowerCase().includes(q)) ?? false)
    );
  }, [search]);

  const yearToX = (year: number) => (year - YEAR_MIN) * scale + offsetX;

  // Collision detection and row assignment for child movements
  const calculateChildRows = (children: string[], macro: MacroMovement) => {
    const childData = children
      .map(cid => CHILD_BY_ID[cid])
      .filter(c => !search || !searchedChildren || searchedChildren.some(sc => sc.id === c.id))
      .map(c => {
        // Calculate position relative to the timeline, not the macro
        const childStart = yearToX(c.start);
        const childEnd = yearToX(c.end);
        const macroStart = yearToX(macro.start);
        
        // Position relative to the macro's left edge
        const relativeLeft = childStart - macroStart;
        const width = Math.max(140, childEnd - childStart);
        
        return {
          ...c,
          left: relativeLeft,
          width: width,
          row: 0
        };
      })
      .sort((a, b) => a.left - b.left); // Sort by left position

    // Assign rows to avoid overlaps
    const rows: Array<{right: number}> = [];
    
    childData.forEach(child => {
      let assignedRow = 0;
      const childRight = child.left + child.width + 8; // Add 8px gap
      
      // Find first available row
      while (assignedRow < rows.length && rows[assignedRow].right > child.left) {
        assignedRow++;
      }
      
      // Create new row if needed
      if (assignedRow >= rows.length) {
        rows.push({right: childRight});
      } else {
        rows[assignedRow].right = childRight;
      }
      
      child.row = assignedRow;
    });

    return {
      children: childData,
      rowCount: rows.length
    };
  };

  // Collision detection and row assignment for subchildren
  const calculateSubchildRows = (subchildren: string[], child: ChildMovement) => {
    const subchildData = subchildren
      .map(sid => SUBCHILD_BY_ID[sid])
      .filter(s => s && s.year !== undefined) // Only include items with years
      .map(s => {
        // Calculate position relative to the timeline
        const subchildPos = yearToX(s.year!);
        const childStart = yearToX(child.start);
        
        // Position relative to the child's left edge
        const relativeLeft = subchildPos - childStart;
        const width = Math.max(120, 80); // Smaller width for subchildren
        
        return {
          ...s,
          left: relativeLeft,
          width: width,
          row: 0
        };
      })
      .sort((a, b) => a.left - b.left);

    // Assign rows to avoid overlaps (same logic as child movements)
    const rows: Array<{right: number}> = [];
    
    subchildData.forEach(subchild => {
      let assignedRow = 0;
      const subchildRight = subchild.left + subchild.width + 6; // Smaller gap for subchildren
      
      while (assignedRow < rows.length && rows[assignedRow].right > subchild.left) {
        assignedRow++;
      }
      
      if (assignedRow >= rows.length) {
        rows.push({right: subchildRight});
      } else {
        rows[assignedRow].right = subchildRight;
      }
      
      subchild.row = assignedRow;
    });

    return {
      subchildren: subchildData,
      rowCount: rows.length
    };
  };

  // Calculate z-index based on interaction states
  const getMacroZIndex = (macroId: string) => {
    if (hoveredMacro === macroId) return 50; // Highest priority for hovered
    if (activeMacro === macroId) return 30;  // High priority for active/expanded
    return 10; // Normal priority
  };

  const getChildZIndex = (childId: string) => {
    if (hoveredChild === childId) return 60; // Highest priority for hovered child
    if (activeChild === childId) return 45;  // Higher priority for expanded child
    return 40; // Normal child priority (above macro bands)
  };

  const getSubchildZIndex = (subchildId: string) => {
    if (hoveredSubchild === subchildId) return 70; // Highest priority for hovered subchild
    return 50; // Normal subchild priority (above child movements)
  };

  // Handle child click to show detail AND expand subchildren
  const handleChildClick = (child: ChildMovement) => {
    // Always show the detail card
    setDetail(child);
    
    // Toggle subchildren if they exist
    if (child.subchildren && child.subchildren.length > 0) {
      if (activeChild === child.id) {
        setActiveChild(null);
      } else {
        setActiveChild(child.id);
      }
    }
  };
  const zoomToMacro = (macro: MacroMovement) => {
    if (!containerRef.current || isAnimating) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const macroSpan = macro.end - macro.start;
    
    // Calculate optimal scale to show the macro movement with some padding
    const targetScale = Math.min(30.0, Math.max(0.05, (containerWidth * 0.8) / macroSpan));
    
    // Calculate offset to center the macro movement
    const macroCenter = (macro.start + macro.end) / 2;
    const targetOffsetX = containerWidth / 2 - (macroCenter - YEAR_MIN) * targetScale;
    
    // Animate to target values
    setIsAnimating(true);
    const startScale = scale;
    const startOffsetX = offsetX;
    const duration = 800; // ms
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentScale = startScale + (targetScale - startScale) * easeOut;
      const currentOffsetX = startOffsetX + (targetOffsetX - startOffsetX) * easeOut;
      
      setScale(currentScale);
      setOffsetX(currentOffsetX);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Restore original zoom when collapsing with smooth animation
  const restoreOriginalZoom = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const startScale = scale;
    const startOffsetX = offsetX;
    const duration = 600; // ms
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentScale = startScale + (originalScale - startScale) * easeOut;
      const currentOffsetX = startOffsetX + (originalOffsetX - startOffsetX) * easeOut;
      
      setScale(currentScale);
      setOffsetX(currentOffsetX);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Handle macro expansion/collapse with auto-zoom
  const handleMacroClick = (macroId: string) => {
    const macro = MACROS.find(m => m.id === macroId);
    if (!macro) return;

    if (activeMacro === macroId) {
      // Collapsing - restore original zoom
      setActiveMacro(null);
      restoreOriginalZoom();
    } else {
      // Expanding - save current state and zoom to macro
      if (activeMacro === null) {
        // Only save state if no macro is currently active
        setOriginalScale(scale);
        setOriginalOffsetX(offsetX);
      }
      setActiveMacro(macroId);
      zoomToMacro(macro);
    }
  };

  const gridYears = useMemo(() => {
    // choose a step based on zoom level
    const approxPx = 140; // target ~140px between ticks
    const rawStep = approxPx / scale; // in years
    // round step to nice values
    const niceSteps = [50, 100, 200, 250, 500];
    const step = niceSteps.find((s) => s >= rawStep) || 500;
    const start = Math.ceil(YEAR_MIN / step) * step;
    const arr: number[] = [];
    for (let y = start; y <= YEAR_MAX; y += step) arr.push(y);
    return { arr, step };
  }, [scale]);

  const macroHeight = 54;
  const bandGap = 12;
  
  // Calculate total height including expanded child areas
  const totalHeight = useMemo(() => {
    let height = 120; // Base padding
    
    shownMacros.forEach(macro => {
      height += macroHeight + bandGap;
      
      // Add space for child movements if this macro is active
      if (activeMacro === macro.id) {
        const { children: childData, rowCount } = calculateChildRows(macro.children, macro);
        const childAreaHeight = rowCount * 44 + 16; // 44px per row + 16px margin
        height += childAreaHeight;
        
        // Add space for subchildren if any child is active
        if (activeChild) {
          const activeChildData = childData.find(c => c.id === activeChild);
          if (activeChildData && activeChildData.subchildren && activeChildData.subchildren.length > 0) {
            const { rowCount: subRowCount } = calculateSubchildRows(activeChildData.subchildren, activeChildData);
            const subchildAreaHeight = subRowCount * 40 + 20; // 40px per row + 20px margin
            height += subchildAreaHeight;
          }
        }
      }
    });
    
    return height;
  }, [shownMacros, activeMacro, activeChild, scale, offsetX, search, searchedChildren]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Interactive Architecture Timeline
          </h1>
          <p className="text-slate-600 mt-2">Explore the evolution of architectural movements throughout history</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 gap-3 shadow-lg hover:shadow-xl transition-all duration-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              className="outline-none text-sm placeholder:text-slate-400 bg-transparent flex-1 min-w-[200px]"
              placeholder="Search movements, traits, figures…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setSearch("")}> 
                <X className="w-4 h-4"/> 
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center gap-2"
                                                        onClick={() => setScale((s) => Math.min(30.0, s * 1.2))}
            >
              <ZoomIn className="w-4 h-4 text-slate-600" /> 
              <span className="text-sm font-medium text-slate-700">Zoom In</span>
            </button>
            <button
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center gap-2"
              onClick={() => setScale((s) => Math.max(0.05, s / 1.2))}
            >
              <ZoomOut className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Zoom Out</span>
            </button>
            {activeMacro && (
              <button
                className="rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 backdrop-blur-sm px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                onClick={() => handleMacroClick(activeMacro)}
                title="Click to zoom out and collapse"
              >
                <ZoomOut className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Reset View</span>
              </button>
            )}
          </div>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
            <Filter className="w-4 h-4 mr-3 text-slate-400" />
            <select
              className="text-sm outline-none bg-transparent text-slate-700 font-medium"
              value={filterMacro ?? ""}
              onChange={(e) => setFilterMacro(e.target.value || null)}
            >
              <option value="">All macros</option>
              {MACROS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline container */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-200/50">
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ height: totalHeight }}
        >
          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none">
            {gridYears.arr.map((y) => (
              <div
                key={y}
                className="absolute top-0 bottom-0 border-l border-slate-200/60"
                style={{ left: yearToX(y) }}
              >
                <div className="absolute -top-1 -translate-x-1/2 text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-slate-200/50 font-medium text-slate-600">
                  {fmtYear(y)}
                </div>
              </div>
            ))}
          </div>

          {/* Macro bands */}
          <div className="absolute left-0 right-0" style={{ top: 16 }}>
            {shownMacros.map((m, i) => {
              const top = i * (macroHeight + bandGap);
              const left = yearToX(m.start);
              const width = (m.end - m.start) * scale;
              return (
                <div key={m.id} className="absolute" style={{ top, left, width, zIndex: getMacroZIndex(m.id) }}>
                  <button
                    className={`h-[${macroHeight}px] w-full rounded-2xl ${m.colorClass} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-between px-6 border border-white/20 ${isAnimating ? 'pointer-events-none' : ''} relative ${hoveredMacro === m.id ? 'ring-2 ring-white/40' : ''}`}
                    style={{ zIndex: getMacroZIndex(m.id) }}
                    onClick={() => handleMacroClick(m.id)}
                    onMouseEnter={() => setHoveredMacro(m.id)}
                    onMouseLeave={() => setHoveredMacro(null)}
                    title="Click to toggle child movements and auto-zoom"
                  >
                    <div className="flex items-center gap-4">
                      {m.imageUrl && (
                        <div className="flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border border-white/30 shadow-sm relative">
                          <ArchImage 
                            src={m.imageUrl} 
                            alt={m.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-sm md:text-base">
                          {m.name}
                        </span>
                        <span className="opacity-80 text-xs font-normal">
                          {fmtYear(m.start)} – {fmtYear(m.end)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeMacro === m.id ? "rotate-180" : ""}`} />
                  </button>

                  {/* Child chips */}
                  <AnimatePresence>
                    {activeMacro === m.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="relative mt-3"
                        style={{ zIndex: 35 }}
                      >
                        {(() => {
                          const { children: childData, rowCount } = calculateChildRows(m.children, m);
                          const rowHeight = 44; // Height including gap
                          const containerHeight = rowCount * rowHeight;
                          
                          return (
                            <div className="relative" style={{ height: containerHeight }}>
                              {childData.map((child) => (
                                <div key={child.id} className="relative">
                                  <button
                                    className={`absolute h-10 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-white hover:border-blue-300 transition-all duration-200 px-4 text-xs md:text-sm truncate group relative ${hoveredChild === child.id ? 'ring-2 ring-blue-300/60' : ''}`}
                                    style={{ 
                                      left: child.left, 
                                      width: child.width,
                                      top: child.row * rowHeight,
                                      zIndex: getChildZIndex(child.id)
                                    }}
                                    onClick={() => handleChildClick(child)}
                                    onMouseEnter={() => setHoveredChild(child.id)}
                                    onMouseLeave={() => setHoveredChild(null)}
                                    title={`${child.name} — ${fmtYear(child.start)} to ${fmtYear(child.end)}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {child.imageUrl && (
                                        <div className="flex-shrink-0 w-6 h-6 rounded overflow-hidden relative">
                                          <ArchImage 
                                            src={child.imageUrl} 
                                            alt={child.name}
                                            className="w-full h-full object-cover"
                                            fallbackClassName="w-full h-full"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{child.name}</span>
                                        <span className="text-slate-500 ml-2 font-medium group-hover:text-blue-600 transition-colors">{fmtYear(child.start)}–{fmtYear(child.end)}</span>
                                      </div>
                                    {child.subchildren && child.subchildren.length > 0 && (
                                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeChild === child.id ? "rotate-180" : ""}`} />
                                    )}
                                  </div>                                    {/* Hover image preview */}
                                    {child.imageUrl && (
                                      <div 
                                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                        style={{ zIndex: 70 }}
                                      >
                                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                          <img 
                                            src={child.imageUrl.replace('w=200&h=120', 'w=300&h=200')} 
                                            alt={child.name}
                                            className="w-72 h-48 object-cover"
                                            loading="lazy"
                                          />
                                          <div className="p-3">
                                            <div className="font-semibold text-slate-800 text-sm">{child.name}</div>
                                            <div className="text-slate-600 text-xs">{child.region}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </button>

                                  {/* Subchildren */}
                                  <AnimatePresence>
                                    {activeChild === child.id && child.subchildren && child.subchildren.length > 0 && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="absolute mt-3"
                                        style={{ 
                                          top: containerHeight + 8, // Position below all children
                                          left: 0,
                                          right: 0,
                                          zIndex: 40
                                        }}
                                      >
                                        {(() => {
                                          const { subchildren: subchildData, rowCount: subRowCount } = calculateSubchildRows(child.subchildren, child);
                                          const subRowHeight = 40; // Increased height for better readability
                                          const subContainerHeight = subRowCount * subRowHeight;
                                          
                                          return (
                                            <div className="relative bg-gradient-to-r from-slate-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/50 p-4 shadow-lg" style={{ height: subContainerHeight + 32 }}>
                                              <div className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200 shadow-sm">
                                                📚 Works & Figures
                                              </div>
                                              {subchildData.map((subchild) => (
                                                <button
                                                  key={subchild.id}
                                                  className={`absolute h-9 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm border border-indigo-200/60 shadow-md hover:shadow-lg hover:scale-[1.02] hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 transition-all duration-200 px-3 text-xs truncate group relative ${hoveredSubchild === subchild.id ? 'ring-2 ring-indigo-300/60' : ''}`}
                                                  style={{ 
                                                    left: subchild.left,
                                                    width: subchild.width,
                                                    top: subchild.row * subRowHeight + 16, // Offset for container padding
                                                    zIndex: 42
                                                  }}
                                                  onClick={() => setDetail({
                                                    ...subchild,
                                                    start: subchild.year || child.start,
                                                    end: subchild.year || child.end,
                                                    region: subchild.location || child.region,
                                                    traits: subchild.type === 'work' ? [`${subchild.role || 'Architectural work'}`] : [`${subchild.role || 'Key figure'}`]
                                                  })}
                                                  onMouseEnter={() => setHoveredSubchild(subchild.id)}
                                                  onMouseLeave={() => setHoveredSubchild(null)}
                                                  title={`${subchild.name} — ${fmtYear(subchild.year || child.start)} ${subchild.author ? `by ${subchild.author}` : ''}`}
                                                >
                                                  <div className="flex items-center gap-2 h-full">
                                                    {subchild.imageUrl && (
                                                      <div className="flex-shrink-0 w-5 h-5 rounded overflow-hidden relative border border-white/50">
                                                        <ArchImage 
                                                          src={subchild.imageUrl} 
                                                          alt={subchild.name}
                                                          className="w-full h-full object-cover"
                                                          fallbackClassName="w-full h-full"
                                                        />
                                                      </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                      <div className="font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors leading-tight">{subchild.name}</div>
                                                      <div className="text-slate-500 text-xs font-medium">{fmtYear(subchild.year || child.start)}</div>
                                                    </div>
                                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                      subchild.type === 'work' 
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    }`}>
                                                      {subchild.type === 'work' ? '🏛️' : '👤'} {subchild.type}
                                                    </div>
                                                  </div>
                                                </button>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search hits note */}
      {search && (
        <div className="mt-6 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="font-medium">Search Results:</span> Showing results that match “{search}”. Clear search to view all children under an expanded macro.
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-8 md:-translate-x-1/4 bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6 md:p-8 z-50 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1 p-2 bg-blue-100 rounded-xl">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {detail.imageUrl && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg relative">
                          <ArchImage 
                            src={detail.imageUrl.replace('w=200&h=120', 'w=160&h=160')} 
                            alt={detail.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{detail.name}</h2>
                        <div className="text-base text-slate-600 font-medium">
                          {fmtYear(detail.start)} – {fmtYear(detail.end)} · <span className="text-blue-600">{detail.region}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="rounded-2xl border border-slate-200 bg-white/80 hover:bg-white p-2 transition-all duration-200 hover:shadow-lg" 
                    onClick={() => setDetail(null)}
                  >
                    <X className="w-5 h-5 text-slate-600"/>
                  </button>
                </div>

                {detail.traits && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Key Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.traits.map((t, i) => (
                        <span key={i} className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl px-3 py-2 border border-blue-200 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detail.figures && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Key Figures</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.figures.map((f, i) => (
                        <span key={i} className="text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl px-3 py-2 border border-emerald-200 font-medium">
                          {f.name}{f.role ? ` — ${f.role}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detail.works && detail.works.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Canonical Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detail.works.map((w, i) => (
                        <div key={i} className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 border border-slate-200 group hover:shadow-lg transition-shadow">
                          {w.imageUrl && (
                            <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-slate-200">
                              <img 
                                src={w.imageUrl} 
                                alt={w.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="font-bold text-slate-800 mb-1">{w.title}</div>
                          {w.location && (<div className="text-sm text-slate-600 mb-1">{w.location}</div>)}
                          {w.year && (<div className="text-sm text-blue-600 font-medium">{w.year}</div>)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.texts && detail.texts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Texts & Literature</h3>
                    <div className="space-y-3">
                      {detail.texts.map((t, i) => (
                        <div key={i} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-200">
                          <span className="font-bold text-amber-800">{t.title}</span>
                          {t.author && <span className="text-amber-700"> — {t.author}</span>}
                          {t.year && <span className="text-amber-600 ml-2 font-medium">({t.year})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend / Tips */}
      <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg p-6">
        <h3 className="font-bold text-slate-800 mb-4 text-lg">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
            <div>
              <div className="font-semibold text-slate-700 mb-1">Explore Movements</div>
              <div>Click a colored band to reveal its child movements with auto-zoom. Click a chip to view details.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
            <div>
              <div className="font-semibold text-slate-700 mb-1">Navigate Timeline</div>
              <div>Drag inside the timeline to pan. Use trackpad scroll or hold Ctrl/Cmd + wheel to zoom.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></div>
            <div>
              <div className="font-semibold text-slate-700 mb-1">Search & Filter</div>
              <div>Use the search box to find movements, regions, traits, or figures.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
