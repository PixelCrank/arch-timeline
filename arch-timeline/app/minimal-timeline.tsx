'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { client } from '../sanity/client';

// Simplified types
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

// Utility function
const fmtYear = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
};

// Simple conversion function
function convertSanityData(sanityData: any) {
  const macros = sanityData.macroMovements.map((macro: any) => ({
    id: macro.slug,
    name: macro.name,
    colorClass: macro.colorClass || 'bg-blue-500/30',
    start: macro.startYear,
    end: macro.endYear,
    children: []  // We'll populate this next
  }));

  const children = sanityData.childMovements.map((child: any) => ({
    id: child.slug,
    name: child.name,
    start: child.startYear,
    end: child.endYear,
    region: child.region,
    parent: child.parentMovement || 'unknown'
  }));

  // Link children to macros
  const childrenByParent: Record<string, string[]> = {};
  children.forEach((child: ChildMovement) => {
    if (!childrenByParent[child.parent]) {
      childrenByParent[child.parent] = [];
    }
    childrenByParent[child.parent].push(child.id);
  });

  macros.forEach((macro: MacroMovement) => {
    macro.children = childrenByParent[macro.id] || [];
  });

  return { macros, children };
}

export default function MinimalTimeline() {
  console.log('🚀 MinimalTimeline starting...');
  
  // State hooks
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        console.log('📡 Minimal: Fetching macro movements...');
        const macroMovements = await client.fetch('*[_type == "macroMovement"]');
        console.log('✅ Minimal: Macros fetched:', macroMovements.length);
        
        if (!isMounted) return;
        
        console.log('📡 Minimal: Fetching child movements...');
        const childMovements = await client.fetch('*[_type == "childMovement"]');
        console.log('✅ Minimal: Children fetched:', childMovements.length);
        
        if (!isMounted) return;
        
        const rawData = { macroMovements, childMovements };
        const converted = convertSanityData(rawData);
        
        console.log('✅ Minimal: Data converted:', {
          macros: converted.macros.length,
          children: converted.children.length
        });
        
        setData(converted);
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ Minimal: Fetch error:', err);
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Child lookup
  const CHILD_BY_ID = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.children.map((c: ChildMovement) => [c.id, c]));
  }, [data]);

  // Click handler
  const handleMacroClick = (macro: MacroMovement) => {
    console.log('🎯 Minimal: Macro clicked:', macro.name);
    console.log('🧒 Minimal: Children count:', macro.children.length);
    console.log('🔍 Minimal: Child lookup test:', macro.children.map(id => ({ id, found: !!CHILD_BY_ID[id] })));
    
    setActiveMacro(activeMacro === macro.id ? null : macro.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading minimal timeline...</div>
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

  const { macros, children } = data;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Minimal Architecture Timeline</h1>
      
      <div className="mb-6 p-4 bg-slate-800 rounded-lg">
        <div className="text-lg font-semibold text-green-400 mb-2">✅ Data Loaded Successfully!</div>
        <div className="space-y-1 text-sm">
          <div>Macro Movements: {macros.length}</div>
          <div>Child Movements: {children.length}</div>
          <div>Active Macro: {activeMacro || 'None'}</div>
        </div>
      </div>

      <div className="space-y-6">
        {macros.map((macro: MacroMovement) => {
          const isActive = activeMacro === macro.id;
          
          return (
            <div key={String(macro.id)} className="border border-slate-600 rounded-lg overflow-hidden">
              {/* Macro Header */}
              <button
                onClick={() => handleMacroClick(macro)}
                className={`w-full p-6 text-left transition-colors ${
                  isActive 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold">{macro.name}</div>
                    <div className="text-sm text-gray-300">
                      {fmtYear(macro.start)} - {fmtYear(macro.end)} | 
                      Children: {macro.children.length}
                    </div>
                  </div>
                  <div className="text-2xl">
                    {isActive ? '−' : '+'}
                  </div>
                </div>
              </button>

              {/* Children */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-slate-700/50 space-y-3">
                      <div className="text-lg font-medium text-blue-300 mb-4">
                        Child Movements ({macro.children.length}):
                      </div>
                      
                      {macro.children.length === 0 ? (
                        <div className="text-gray-400 italic">No child movements found</div>
                      ) : (
                        macro.children.map((childId: string) => {
                          const child = CHILD_BY_ID[childId];
                          
                          return child ? (
                            <motion.div
                              key={String(childId)}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="bg-slate-600 p-4 rounded border-l-4 border-blue-400"
                            >
                              <div className="font-medium text-lg">{child.name}</div>
                              <div className="text-sm text-gray-300">
                                {fmtYear(child.start)} - {fmtYear(child.end)} | {child.region}
                              </div>
                            </motion.div>
                          ) : (
                            <div 
                              key={String(childId)} 
                              className="bg-red-900/30 p-4 rounded border-l-4 border-red-500 text-red-300"
                            >
                              ⚠️ Child movement "{childId}" not found
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}