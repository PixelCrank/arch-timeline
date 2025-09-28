'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Search, Filter, ZoomIn, ZoomOut, X, Image as ImageIcon } from 'lucide-react';
import { client } from '../sanity/client';
import { convertSanityToTimelineFormat } from '../hooks/useTimelineData';

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
  year?: number;
  location?: string;
  imageUrl?: string;
  role?: string;
  author?: string;
  parent: string;
};

type ChildMovement = {
  id: string;
  name: string;
  start: number;
  end: number;
  region: string;
  figures?: Figure[];
  traits?: string[];
  works?: Work[];
  texts?: TextRef[];
  parent: string;
  imageUrl?: string;
  subchildren?: string[];
};

type MacroMovement = {
  id: string;
  name: string;
  colorClass: string;
  start: number;
  end: number;
  children: string[];
  imageUrl?: string;
};

// Constants
const INITIAL_PIXELS_PER_YEAR = 2;
const TIME_RANGE = { start: -3000, end: 2025 };
const YEAR_MIN = TIME_RANGE.start;
const YEAR_MAX = TIME_RANGE.end;

// Utility functions
const fmtYear = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
};

// Loading component
const TimelineLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-lg text-gray-600">Loading timeline data...</p>
    </div>
  </div>
);

// Error component  
const TimelineError = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-600 text-xl mb-4">Timeline Load Error</div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default function ArchitectureTimeline() {
  console.log('🚀 ArchitectureTimeline component starting...');
  
  // States
  const [sanityData, setSanityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timeline states
  const [scale, setScale] = useState(INITIAL_PIXELS_PER_YEAR);
  const [offsetX, setOffsetX] = useState(0);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMacro, setFilterMacro] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChildMovement | null>(null);
  
  // Store original zoom state for restoring when collapsing
  const [originalScale, setOriginalScale] = useState(INITIAL_PIXELS_PER_YEAR);
  const [originalOffsetX, setOriginalOffsetX] = useState(0);
  
  // Animation state for smooth transitions
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Hover state tracking for z-index management
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);
  const [hoveredSubchild, setHoveredSubchild] = useState<string | null>(null);
  
  // Panning state for mouse/touch interactions
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs - must be declared before any early returns
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panStart = useRef<{ x: number; offsetX: number } | null>(null);
  
  // Fetch data using useEffect to avoid hooks order violation
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('� Effect triggered - sanityData:', !!sanityData, 'error:', !!error);
      
      if (sanityData || error) {
        console.log('⏭️ Skipping fetch - already have data or error');
        return;
      }
      
      console.log('🔍 Starting data fetch...');
      
      try {
        console.log('📡 Fetching macro movements...');
        const macroMovements = await client.fetch('*[_type == "macroMovement"]');
        console.log('✅ Got macroMovements:', macroMovements.length);
        
        console.log('📡 Fetching child movements...');
        const childMovements = await client.fetch('*[_type == "childMovement"]');
        console.log('✅ Got childMovements:', childMovements.length);
        
        console.log('📡 Fetching works...');
        const works = await client.fetch('*[_type == "architecturalWork"]');
        console.log('✅ Got works:', works.length);
        
        console.log('📡 Fetching figures...');
        const figures = await client.fetch('*[_type == "keyFigure"]');
        console.log('✅ Got figures:', figures.length);
        
        if (!isMounted) return;
        
        console.log('✅ Fetched raw data:', { 
          macroMovements: macroMovements.length, 
          childMovements: childMovements.length, 
          works: works.length, 
          figures: figures.length 
        });
        
        const newData = { macroMovements, childMovements, works, figures };
        setSanityData(newData);
        setLoading(false);
        console.log('✅ Data loaded successfully');
        
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Fetch error:', err);
        setError('Failed to load timeline data');
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Convert data for timeline
  const timelineData = useMemo(() => {
    if (sanityData && sanityData.macroMovements && sanityData.macroMovements.length > 0) {
      try {
        const converted = convertSanityToTimelineFormat(sanityData);
        return converted;
      } catch (err) {
        console.error('❌ Conversion error:', err);
        return { macros: [], children: [], subchildren: [] };
      }
    }
    return { macros: [], children: [], subchildren: [] };
  }, [sanityData]);

  const { macros: MACROS, children: CHILDREN, subchildren: SUBCHILDREN } = timelineData;

  // Quick lookup objects
  const CHILD_BY_ID: Record<string, ChildMovement> = useMemo(() => 
    Object.fromEntries(CHILDREN.map((c) => [c.id, c])), [CHILDREN]
  );

  const SUBCHILD_BY_ID: Record<string, SubChild> = useMemo(() => 
    Object.fromEntries(SUBCHILDREN.map((s) => [s.id, s])), [SUBCHILDREN]
  );

  const shownMacros = useMemo(() => (filterMacro ? MACROS.filter(m => m.id === filterMacro) : MACROS), [filterMacro, MACROS]);

  const searchedChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return CHILDREN.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      (c.traits?.some(t => t.toLowerCase().includes(q)) ?? false) ||
      (c.figures?.some(f => f.name.toLowerCase().includes(q)) ?? false)
    );
  }, [search, CHILDREN]);

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

  const refetch = () => {
    setSanityData(null);
    setError(null);
    setLoading(true);
  };

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

  const yearToX = (year: number) => (year - YEAR_MIN) * scale + offsetX;

  // Z-index management for layering during hover
  const getMacroZIndex = (macroId: string) => {
    if (hoveredMacro === macroId) return 40;
    if (activeMacro === macroId) return 30;
    return 10;
  };

  const getChildZIndex = (childId: string) => {
    if (hoveredChild === childId) return 35;
    if (activeChild === childId) return 25;
    return 15;
  };

  const getSubchildZIndex = (subchildId: string) => {
    if (hoveredSubchild === subchildId) return 50;
    return 20;
  };

  // Collision detection for child movements to prevent overlap
  const calculateChildRows = (macroId: string) => {
    const macro = MACROS.find(m => m.id === macroId);
    if (!macro) return {};

    const childIds = macro.children;
    const children = childIds.map(id => CHILD_BY_ID[id]).filter(Boolean);
    
    const assignments: Record<string, number> = {};
    const rowSpans: { start: number; end: number; row: number }[] = [];

    // Sort by start year for better packing
    children.sort((a, b) => a.start - b.start);

    children.forEach(child => {
      let assignedRow = 0;
      
      // Find the first row where this child doesn't overlap
      while (true) {
        const conflicts = rowSpans.filter(span => 
          span.row === assignedRow && 
          !(child.end < span.start || child.start > span.end)
        );
        
        if (conflicts.length === 0) {
          assignments[child.id] = assignedRow;
          rowSpans.push({
            start: child.start,
            end: child.end,
            row: assignedRow
          });
          break;
        }
        assignedRow++;
      }
    });

    return assignments;
  };

  // Collision detection for subchildren
  const calculateSubchildRows = (childId: string) => {
    const child = CHILD_BY_ID[childId];
    if (!child) return {};

    // Get subchildren IDs from the child's subchildren array
    const subchildIds = child.subchildren || [];
    const subchildren = subchildIds.map(id => SUBCHILD_BY_ID[id]).filter(Boolean);
    
    const assignments: Record<string, number> = {};
    const rowSpans: { start: number; end: number; row: number }[] = [];

    // Sort by year, handling undefined years
    subchildren.sort((a, b) => (a.year || 0) - (b.year || 0));

    subchildren.forEach(subchild => {
      let assignedRow = 0;
      const year = subchild.year || 0;
      
      while (true) {
        const conflicts = rowSpans.filter(span => 
          span.row === assignedRow && 
          Math.abs(year - span.start) < 50 // 50-year spacing
        );
        
        if (conflicts.length === 0) {
          assignments[subchild.id] = assignedRow;
          rowSpans.push({
            start: year,
            end: year,
            row: assignedRow
          });
          break;
        }
        assignedRow++;
      }
    });

    return assignments;
  };

  // Auto-zoom functionality
  const zoomToMacro = (macro: MacroMovement) => {
    if (isAnimating) return;
    
    // Store original state for restoration
    setOriginalScale(scale);
    setOriginalOffsetX(offsetX);
    
    setIsAnimating(true);
    
    const macroSpan = macro.end - macro.start;
    const containerWidth = containerRef.current?.clientWidth || 1200;
    const targetScale = Math.min(20, Math.max(2, (containerWidth * 0.7) / macroSpan));
    
    const macroCenter = (macro.start + macro.end) / 2;
    const targetOffsetX = containerWidth / 2 - (macroCenter - YEAR_MIN) * targetScale;
    
    setScale(targetScale);
    setOffsetX(targetOffsetX);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const restoreOriginalZoom = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setScale(originalScale);
    setOffsetX(originalOffsetX);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Click handlers
  const handleMacroClick = (macro: MacroMovement) => {
    console.log('🎯 Macro clicked:', macro.name, 'ID:', macro.id);
    console.log('🧒 Children IDs:', macro.children);
    console.log('🔍 CHILD_BY_ID keys:', Object.keys(CHILD_BY_ID));
    console.log('🔍 Children lookup test:', macro.children.map(id => ({ id, found: !!CHILD_BY_ID[id] })));
    
    if (activeMacro === macro.id) {
      // Collapse: restore original zoom and clear active
      setActiveMacro(null);
      setActiveChild(null);
      setDetail(null);
      restoreOriginalZoom();
    } else {
      // Expand: zoom to macro and set active
      setActiveMacro(macro.id);
      setActiveChild(null);
      setDetail(null);
      zoomToMacro(macro);
    }
  };

  const handleChildClick = (child: ChildMovement) => {
    if (activeChild === child.id) {
      setActiveChild(null);
      setDetail(null);
    } else {
      setActiveChild(child.id);
      setDetail(child);
    }
  };

  // Main timeline render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Search and Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 p-4 max-w-full overflow-x-auto">
          <input
            type="text"
            placeholder="Search movements, regions, traits, figures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm min-w-80"
          />
          
          <select
            value={filterMacro || ""}
            onChange={(e) => setFilterMacro(e.target.value || null)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
          >
            <option value="">All Movements</option>
            {MACROS.map((macro) => (
              <option key={macro.id} value={macro.id} className="bg-slate-800">
                {macro.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-2 text-sm">
            <span>Zoom:</span>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="font-mono">{scale.toFixed(1)}x</span>
          </div>
          
          {activeMacro && (
            <button
              onClick={() => {
                setActiveMacro(null);
                setActiveChild(null);
                setDetail(null);
                restoreOriginalZoom();
              }}
              className="px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="pt-20 h-screen overflow-hidden">
        <div
          ref={containerRef}
          className="h-full w-full overflow-auto cursor-grab active:cursor-grabbing relative"
          style={{ 
            transform: isAnimating ? 'none' : undefined,
            transition: isAnimating ? 'transform 300ms ease-out' : 'none'
          }}
        >
          <div 
            className="relative bg-gradient-to-r from-slate-800/30 to-slate-700/30 min-h-full"
            style={{ 
              width: Math.max(totalWidth, 2000),
              minHeight: '100vh'
            }}
          >
            {/* Year Markers */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent">
              {Array.from({ length: Math.floor(yearsSpan / 100) + 1 }, (_, i) => {
                const year = YEAR_MIN + i * 100;
                const x = yearToX(year);
                if (x < -100 || x > (containerRef.current?.clientWidth || 0) + 100) return null;
                
                return (
                  <div
                    key={`year-${year}`}
                    className="absolute top-0 bottom-0 border-l border-white/20"
                    style={{ left: x }}
                  >
                    <span className="absolute top-2 -translate-x-1/2 text-xs text-white/70 font-mono">
                      {fmtYear(year)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Macro Movement Bands */}
            <div className="pt-16">
              {shownMacros.map((macro, macroIndex) => {
                const startX = yearToX(macro.start);
                const endX = yearToX(macro.end);
                const width = endX - startX;
                const isActive = activeMacro === macro.id;
                const childRows = isActive ? calculateChildRows(macro.id) : {};
                const maxChildRow = Math.max(0, ...Object.values(childRows));
                const bandHeight = isActive ? Math.max(120, 60 + maxChildRow * 80) : 80;
                
                return (
                  <motion.div
                    key={String(macro.id)}
                    className="relative mb-4"
                    style={{ height: bandHeight }}
                    initial={false}
                    animate={{ height: bandHeight }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {/* Macro Band */}
                    <motion.div
                      className={`absolute top-0 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 ${macro.colorClass} ${
                        isActive 
                          ? 'border-white/60 shadow-lg shadow-white/20' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                      style={{
                        left: startX,
                        width: Math.max(width, 120),
                        zIndex: getMacroZIndex(macro.id)
                      }}
                      onClick={() => handleMacroClick(macro)}
                      onMouseEnter={() => setHoveredMacro(macro.id)}
                      onMouseLeave={() => setHoveredMacro(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center h-full px-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {macro.name}
                          </div>
                          <div className="text-xs opacity-80">
                            {fmtYear(macro.start)} - {fmtYear(macro.end)}
                          </div>
                        </div>
                        {macro.imageUrl && (
                          <ArchImage
                            src={macro.imageUrl}
                            alt={macro.name}
                            className="w-10 h-10 rounded object-cover ml-2"
                            fallbackClassName="w-10 h-10 rounded ml-2"
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* Child Movements */}
                    <AnimatePresence>
                      {isActive && macro.children.map((childId) => {
                        const child = CHILD_BY_ID[childId];
                        if (!child) return null;
                        
                        const childStartX = yearToX(child.start);
                        const childEndX = yearToX(child.end);
                        const childWidth = childEndX - childStartX;
                        const row = childRows[childId] || 0;
                        const childY = 70 + row * 80;
                        const isChildActive = activeChild === child.id;
                        const subchildRows = isChildActive ? calculateSubchildRows(child.id) : {};
                        
                        return (
                          <motion.div
                            key={String(childId)}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.1 }}
                            className="absolute"
                            style={{
                              left: childStartX,
                              top: childY,
                              width: Math.max(childWidth, 100),
                              zIndex: getChildZIndex(childId)
                            }}
                          >
                            <motion.div
                              className={`h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded cursor-pointer transition-all duration-200 ${
                                isChildActive ? 'bg-white/30 border-white/60' : 'hover:bg-white/25'
                              }`}
                              onClick={() => handleChildClick(child)}
                              onMouseEnter={() => setHoveredChild(childId)}
                              onMouseLeave={() => setHoveredChild(null)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center h-full px-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate">
                                    {child.name}
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {child.region}
                                  </div>
                                </div>
                                {child.imageUrl && (
                                  <ArchImage
                                    src={child.imageUrl}
                                    alt={child.name}
                                    className="w-6 h-6 rounded object-cover ml-1"
                                    fallbackClassName="w-6 h-6 rounded ml-1"
                                  />
                                )}
                              </div>
                            </motion.div>

                            {/* Subchildren (Works & Figures) */}
                            <AnimatePresence>
                              {isChildActive && child.subchildren?.map((subchildId) => {
                                const subchild = SUBCHILD_BY_ID[subchildId];
                                if (!subchild) return null;
                                
                                const subchildX = yearToX(subchild.year || child.start);
                                const subchildRow = subchildRows[subchildId] || 0;
                                const subchildY = 50 + subchildRow * 30;
                                
                                return (
                                  <motion.div
                                    key={String(subchildId)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute"
                                    style={{
                                      left: subchildX - childStartX,
                                      top: subchildY,
                                      zIndex: getSubchildZIndex(subchildId)
                                    }}
                                    onMouseEnter={() => setHoveredSubchild(subchildId)}
                                    onMouseLeave={() => setHoveredSubchild(null)}
                                  >
                                    <motion.div
                                      className={`px-2 py-1 text-xs rounded border cursor-pointer transition-all duration-200 ${
                                        subchild.type === 'work'
                                          ? 'bg-blue-500/30 border-blue-400/50 text-blue-100'
                                          : 'bg-green-500/30 border-green-400/50 text-green-100'
                                      } hover:bg-white/20`}
                                      whileHover={{ scale: 1.1 }}
                                      title={subchild.name}
                                    >
                                      <div className="font-medium">
                                        {subchild.name}
                                      </div>
                                      {subchild.year && (
                                        <div className="opacity-80">
                                          {fmtYear(subchild.year)}
                                        </div>
                                      )}
                                    </motion.div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Search Results Overlay */}
            <AnimatePresence>
              {searchedChildren && searchedChildren.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                >
                  <div className="p-8 pt-24 max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold mb-4">
                      Search Results ({searchedChildren.length})
                    </h3>
                    <div className="grid gap-4 max-h-96 overflow-y-auto">
                      {searchedChildren.map((child) => (
                        <motion.div
                          key={String(child.id)}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-colors"
                          onClick={() => {
                            setSearch("");
                            setFilterMacro(child.parent);
                            setActiveMacro(child.parent);
                            const parent = MACROS.find(m => m.id === child.parent);
                            if (parent) zoomToMacro(parent);
                            setTimeout(() => {
                              setActiveChild(child.id);
                              setDetail(child);
                            }, 300);
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start gap-4">
                            {child.imageUrl && (
                              <ArchImage
                                src={child.imageUrl}
                                alt={child.name}
                                className="w-16 h-16 rounded object-cover"
                                fallbackClassName="w-16 h-16 rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold">{child.name}</h4>
                              <p className="text-sm opacity-80">
                                {fmtYear(child.start)} - {fmtYear(child.end)} | {child.region}
                              </p>
                              {child.traits && child.traits.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {child.traits.map((trait, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/20 rounded text-xs">
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-md border-l border-white/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold">{detail.name}</h2>
                <button
                  onClick={() => setDetail(null)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {detail.imageUrl && (
                <ArchImage
                  src={detail.imageUrl}
                  alt={detail.name}
                  className="w-full h-48 rounded-lg object-cover mb-4"
                  fallbackClassName="w-full h-48 rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-white/60 mb-1">Period</div>
                  <div>{fmtYear(detail.start)} - {fmtYear(detail.end)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-white/60 mb-1">Region</div>
                  <div>{detail.region}</div>
                </div>
                
                {detail.traits && detail.traits.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-white/60 mb-2">Characteristics</div>
                    <div className="flex flex-wrap gap-2">
                      {detail.traits.map((trait, i) => (
                        <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {detail.figures && detail.figures.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-white/60 mb-2">Key Figures</div>
                    <div className="space-y-2">
                      {detail.figures.map((figure, i) => (
                        <div key={i} className="bg-white/10 rounded p-3">
                          <div className="font-medium">{figure.name}</div>
                          {figure.role && (
                            <div className="text-sm opacity-80">{figure.role}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {detail.works && detail.works.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-white/60 mb-2">Notable Works</div>
                    <div className="space-y-2">
                      {detail.works.map((work, i) => (
                        <div key={i} className="bg-white/10 rounded p-3">
                          <div className="font-medium">{work.title}</div>
                          {work.location && (
                            <div className="text-sm opacity-80">{work.location}</div>
                          )}
                          {work.year && (
                            <div className="text-sm opacity-80">{work.year}</div>
                          )}
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
    </div>
  );
}