'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type MacroMovement = {
  id: string;
  name: string;
  colorClass: string;
  start: number;
  end: number;
  children: string[];
};

type ChildMovement = {
  id: string;
  name: string;
  start: number;
  end: number;
  region: string;
  parent: string;
};

type Work = {
  id: string;
  name: string;
  year: number;
  architect: string;
  location: string;
  movement: string;
};

type Figure = {
  id: string;
  name: string;
  lifespan: string;
  nationality: string;
  movements: string[];
};

// Utility functions
const fmtYear = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
};

// Data fetching and conversion
async function fetchAllData() {
  const projectId = '9i4jo80o';
  const dataset = 'production';
  const apiVersion = '2024-09-22';
  const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
  
  // Fetch all data types
  const [macroRes, childRes, worksRes, figuresRes] = await Promise.all([
    fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "macroMovement"]')}`),
    fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "childMovement"]')}`),
    fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "architecturalWork"]')}`),
    fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "keyFigure"]')}`),
  ]);
  
  const [macroData, childData, worksData, figuresData] = await Promise.all([
    macroRes.json(),
    childRes.json(),
    worksRes.json(),
    figuresRes.json(),
  ]);
  
  return {
    macroMovements: macroData.result || [],
    childMovements: childData.result || [],
    works: worksData.result || [],
    figures: figuresData.result || [],
  };
}

function convertData(data: any) {
  // Convert macro movements
  const macros: MacroMovement[] = data.macroMovements.map((item: any) => ({
    id: item.slug?.current || item._id,
    name: item.name || 'Unnamed Movement',
    colorClass: item.colorClass || 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
    start: item.startYear || 0,
    end: item.endYear || 0,
    children: [], // Will be populated below
  }));

  // Convert child movements
  const children: ChildMovement[] = data.childMovements.map((item: any) => ({
    id: item.slug?.current || item._id,
    name: item.name || 'Unnamed Child Movement',
    start: item.startYear || 0,
    end: item.endYear || 0,
    region: item.region || 'Unknown Region',
    parent: item.parentMovement?._ref || item.parentMovement?.current || item.parentMovement || '',
  }));

  // Convert works
  const works: Work[] = data.works.map((item: any) => ({
    id: item.slug?.current || item._id,
    name: item.name || 'Unnamed Work',
    year: item.year || 0,
    architect: item.architect || 'Unknown Architect',
    location: item.location || 'Unknown Location',
    movement: item.parentMovement?._ref || item.parentMovement?.current || item.parentMovement || '',
  }));

  // Convert figures
  const figures: Figure[] = data.figures.map((item: any) => ({
    id: item.slug?.current || item._id,
    name: item.name || 'Unnamed Figure',
    lifespan: item.birthYear && item.deathYear ? `${fmtYear(item.birthYear)} - ${fmtYear(item.deathYear)}` : 'Unknown',
    nationality: item.nationality || item.role || 'Unknown',
    movements: item.parentMovement ? [item.parentMovement._ref || item.parentMovement.current || item.parentMovement] : [],
  }));

  // Create ID mappings for cross-referencing
  const macroIdToSlug: Record<string, string> = {};
  const macroSlugToId: Record<string, string> = {};
  
  macros.forEach(macro => {
    const refId = data.macroMovements.find((m: any) => (m.slug?.current || m._id) === macro.id)?._id;
    if (refId) {
      macroIdToSlug[refId] = macro.id;
      macroSlugToId[macro.id] = refId;
    }
  });

  // Link children to macros (handle both slug and _ref relationships)
  const childrenByParent: Record<string, string[]> = {};
  children.forEach(child => {
    if (child.parent && child.parent !== '') {
      // Try both the direct parent value and mapped slug
      const parentSlug = macroIdToSlug[child.parent] || child.parent;
      if (!childrenByParent[parentSlug]) {
        childrenByParent[parentSlug] = [];
      }
      childrenByParent[parentSlug].push(child.id);
    }
  });

  // Update macro children
  macros.forEach(macro => {
    macro.children = childrenByParent[macro.id] || [];
  });

  return { macros, children, works, figures, macroIdToSlug };
}

export default function WorkingTimeline() {
  // State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'works' | 'figures'>('timeline');

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await fetchAllData();
        const converted = convertData(rawData);
        setData(converted);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Child lookup
  const CHILD_BY_ID = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.children.map((c: ChildMovement) => [c.id, c]));
  }, [data]);

  // Works by movement
  const WORKS_BY_MOVEMENT = useMemo(() => {
    if (!data) return {};
    const worksByMovement: Record<string, Work[]> = {};
    data.works.forEach((work: Work) => {
      if (work.movement) {
        // Try both the direct movement value and mapped slug
        const movementSlug = data.macroIdToSlug?.[work.movement] || work.movement;
        if (!worksByMovement[movementSlug]) {
          worksByMovement[movementSlug] = [];
        }
        worksByMovement[movementSlug].push(work);
      }
    });
    return worksByMovement;
  }, [data]);

  // Figures by movement
  const FIGURES_BY_MOVEMENT = useMemo(() => {
    if (!data) return {};
    const figuresByMovement: Record<string, Figure[]> = {};
    data.figures.forEach((figure: Figure) => {
      figure.movements.forEach(movement => {
        // Try both the direct movement value and mapped slug
        const movementSlug = data.macroIdToSlug?.[movement] || movement;
        if (!figuresByMovement[movementSlug]) {
          figuresByMovement[movementSlug] = [];
        }
        figuresByMovement[movementSlug].push(figure);
      });
    });
    return figuresByMovement;
  }, [data]);

  // Handlers
  const handleMacroClick = (macro: MacroMovement) => {
    setActiveMacro(activeMacro === macro.id ? null : macro.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading architecture timeline...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div>No data available</div>
      </div>
    );
  }

  const { macros, children, works, figures } = data;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Architecture Through Time</h1>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-300 mb-4">
            <span>Movements: {macros.length}</span>
            <span>Sub-movements: {children.length}</span>
            <span>Works: {works.length}</span>
            <span>Figures: {figures.length}</span>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2">
            {(['timeline', 'works', 'figures'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {viewMode === 'timeline' && (
          <div ref={timelineRef} className="space-y-6">
            {macros
              .sort((a: MacroMovement, b: MacroMovement) => a.start - b.start)
              .map((macro: MacroMovement) => {
                const isActive = activeMacro === macro.id;
                const macroWorks = WORKS_BY_MOVEMENT[macro.id] || [];
                const macroFigures = FIGURES_BY_MOVEMENT[macro.id] || [];
                
                return (
                  <div key={macro.id} className="border border-slate-600 rounded-lg overflow-hidden shadow-lg">
                    {/* Macro Header */}
                    <button
                      onClick={() => handleMacroClick(macro)}
                      className={`w-full p-6 text-left transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xl font-semibold mb-2">{macro.name}</div>
                          <div className="text-sm text-gray-300 space-x-4">
                            <span>{fmtYear(macro.start)} - {fmtYear(macro.end)}</span>
                            <span>•</span>
                            <span>{macro.children.length} sub-movements</span>
                            <span>•</span>
                            <span>{macroWorks.length} works</span>
                            <span>•</span>
                            <span>{macroFigures.length} figures</span>
                          </div>
                        </div>
                        <div className="text-2xl text-gray-400">
                          {isActive ? '−' : '+'}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-slate-700/50 space-y-6">
                            {/* Child Movements */}
                            {macro.children.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium text-blue-300 mb-4">
                                  Sub-movements ({macro.children.length})
                                </h3>
                                <div className="grid gap-3">
                                  {macro.children.map((childId: string) => {
                                    const child = CHILD_BY_ID[childId];
                                    
                                    return child ? (
                                      <motion.div
                                        key={childId}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-slate-600 p-4 rounded border-l-4 border-blue-400"
                                      >
                                        <div className="font-medium text-lg">{child.name}</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                          {fmtYear(child.start)} - {fmtYear(child.end)} • {child.region}
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <div 
                                        key={childId} 
                                        className="bg-red-900/30 p-4 rounded border-l-4 border-red-500 text-red-300"
                                      >
                                        ⚠️ Sub-movement "{childId}" not found
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Works */}
                            {macroWorks.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium text-green-300 mb-4">
                                  Notable Works ({macroWorks.length})
                                </h3>
                                <div className="grid gap-3">
                                  {macroWorks.slice(0, 5).map((work: Work) => (
                                    <motion.div
                                      key={work.id}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="bg-slate-600 p-4 rounded border-l-4 border-green-400"
                                    >
                                      <div className="font-medium">{work.name}</div>
                                      <div className="text-sm text-gray-300 mt-1">
                                        {work.architect} • {work.year} • {work.location}
                                      </div>
                                    </motion.div>
                                  ))}
                                  {macroWorks.length > 5 && (
                                    <div className="text-sm text-gray-400 italic">
                                      And {macroWorks.length - 5} more works...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Figures */}
                            {macroFigures.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium text-purple-300 mb-4">
                                  Key Figures ({macroFigures.length})
                                </h3>
                                <div className="grid gap-3">
                                  {macroFigures.slice(0, 5).map((figure: Figure) => (
                                    <motion.div
                                      key={figure.id}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="bg-slate-600 p-4 rounded border-l-4 border-purple-400"
                                    >
                                      <div className="font-medium">{figure.name}</div>
                                      <div className="text-sm text-gray-300 mt-1">
                                        {figure.lifespan} • {figure.nationality}
                                      </div>
                                    </motion.div>
                                  ))}
                                  {macroFigures.length > 5 && (
                                    <div className="text-sm text-gray-400 italic">
                                      And {macroFigures.length - 5} more figures...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        )}

        {viewMode === 'works' && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold mb-4">Architectural Works</h2>
            {works.map((work: Work) => (
              <div key={work.id} className="bg-slate-800 p-4 rounded border-l-4 border-green-400">
                <div className="font-medium text-lg">{work.name}</div>
                <div className="text-sm text-gray-300 mt-1">
                  {work.architect} • {work.year} • {work.location}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'figures' && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold mb-4">Architectural Figures</h2>
            {figures.map((figure: Figure) => (
              <div key={figure.id} className="bg-slate-800 p-4 rounded border-l-4 border-purple-400">
                <div className="font-medium text-lg">{figure.name}</div>
                <div className="text-sm text-gray-300 mt-1">
                  {figure.lifespan} • {figure.nationality}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Movements: {figure.movements.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}