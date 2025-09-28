'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Direct fetch function
async function fetchSanityData() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '9i4jo80o';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-09-22';
  
  const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
  
  // Fetch macro movements
  const macroQuery = encodeURIComponent('*[_type == "macroMovement"]');
  const macroUrl = `${baseUrl}?query=${macroQuery}`;
  
  console.log('📡 Direct: Fetching macros from:', macroUrl);
  const macroResponse = await fetch(macroUrl);
  
  if (!macroResponse.ok) {
    throw new Error(`Macro fetch failed: ${macroResponse.status} ${macroResponse.statusText}`);
  }
  
  const macroData = await macroResponse.json();
  console.log('✅ Direct: Macro response:', macroData);
  
  // Fetch child movements
  const childQuery = encodeURIComponent('*[_type == "childMovement"]');
  const childUrl = `${baseUrl}?query=${childQuery}`;
  
  console.log('📡 Direct: Fetching children from:', childUrl);
  const childResponse = await fetch(childUrl);
  
  if (!childResponse.ok) {
    throw new Error(`Child fetch failed: ${childResponse.status} ${childResponse.statusText}`);
  }
  
  const childData = await childResponse.json();
  console.log('✅ Direct: Child response:', childData);
  
  return {
    macroMovements: macroData.result || [],
    childMovements: childData.result || []
  };
}

// Simple conversion function
function convertSanityData(sanityData: any) {
  console.log('🔄 Converting:', sanityData);
  
  const macros = sanityData.macroMovements.map((macro: any) => ({
    id: macro.slug?.current || macro._id,
    name: macro.name,
    colorClass: macro.colorClass || 'bg-blue-500/30',
    start: macro.startYear,
    end: macro.endYear,
    children: []  // We'll populate this next
  }));

  const children = sanityData.childMovements.map((child: any) => ({
    id: child.slug?.current || child._id,
    name: child.name,
    start: child.startYear,
    end: child.endYear,
    region: child.region,
    parent: child.parentMovement?.current || child.parentMovement || 'unknown'
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

  console.log('✅ Converted data:', { macros: macros.length, children: children.length });
  
  return { macros, children };
}

export default function DirectFetchTimeline() {
  console.log('🚀 DirectFetchTimeline starting...');
  
  // State hooks
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        console.log('📡 Direct: Starting fetch...');
        const rawData = await fetchSanityData();
        
        if (!isMounted) return;
        
        const converted = convertSanityData(rawData);
        
        setData(converted);
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ Direct: Fetch error:', err);
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      }
    }
    
    loadData();
    
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
    console.log('🎯 Direct: Macro clicked:', macro.name);
    console.log('🧒 Direct: Children count:', macro.children.length);
    console.log('🔍 Direct: Child lookup test:', macro.children.map(id => ({ id, found: !!CHILD_BY_ID[id] })));
    
    setActiveMacro(activeMacro === macro.id ? null : macro.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading with direct fetch...</div>
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
      <h1 className="text-3xl font-bold mb-6">Direct Fetch Architecture Timeline</h1>
      
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