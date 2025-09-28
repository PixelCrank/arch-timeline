'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { client } from '../sanity/client';
import { convertSanityToTimelineFormat } from '../hooks/useTimelineData';

export default function TestFunctionality() {
  const [sanityData, setSanityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Fetching test data...');
        const [macroMovements, childMovements, works, figures] = await Promise.all([
          client.fetch('*[_type == "macroMovement"]'),
          client.fetch('*[_type == "childMovement"]'),
          client.fetch('*[_type == "architecturalWork"]'),
          client.fetch('*[_type == "keyFigure"]')
        ]);
        
        console.log('✅ Test data loaded:', { 
          macros: macroMovements.length, 
          children: childMovements.length, 
          works: works.length, 
          figures: figures.length 
        });
        
        setSanityData({ macroMovements, childMovements, works, figures });
        setLoading(false);
      } catch (err) {
        console.error('❌ Test fetch error:', err);
        setError('Failed to load test data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Convert data
  const timelineData = sanityData ? convertSanityToTimelineFormat(sanityData) : { macros: [], children: [], subchildren: [] };
  const { macros, children } = timelineData;

  // Quick lookup
  const CHILD_BY_ID = Object.fromEntries(children.map((c) => [c.id, c]));

  const handleMacroClick = (macroId: string) => {
    console.log('🎯 Test macro clicked:', macroId);
    setActiveMacro(activeMacro === macroId ? null : macroId);
  };

  if (loading) return <div className="p-8 text-white">Loading test...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Architecture Timeline - Functionality Test</h1>
      
      <div className="space-y-4">
        <p className="text-lg">
          Data loaded: <span className="text-green-400">{macros.length} macros, {children.length} children</span>
        </p>
        
        <div className="text-sm text-gray-400 mb-4">
          Click a macro movement below to see its children expand:
        </div>
        
        {macros.slice(0, 3).map((macro) => {
          const isActive = activeMacro === macro.id;
          
          return (
            <div key={String(macro.id)} className="border border-gray-600 rounded-lg p-4">
              <button
                onClick={() => handleMacroClick(macro.id)}
                className={`w-full text-left p-4 rounded transition-colors ${
                  isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">{macro.name}</div>
                <div className="text-sm text-gray-300">
                  {macro.start} - {macro.end} | Children: {macro.children.length}
                </div>
              </button>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-4 space-y-2">
                      <div className="text-sm font-medium text-blue-300 mb-2">
                        Children ({macro.children.length}):
                      </div>
                      {macro.children.map((childId) => {
                        const child = CHILD_BY_ID[childId];
                        return child ? (
                          <div 
                            key={String(childId)} 
                            className="bg-gray-800 p-3 rounded border-l-4 border-blue-400"
                          >
                            <div className="font-medium">{child.name}</div>
                            <div className="text-sm text-gray-400">
                              {child.start} - {child.end} | {child.region}
                            </div>
                            {child.subchildren && child.subchildren.length > 0 && (
                              <div className="text-xs text-green-400 mt-1">
                                {child.subchildren.length} subchildren
                              </div>
                            )}
                          </div>
                        ) : (
                          <div key={String(childId)} className="text-red-400 text-sm">
                            Child {childId} not found
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded">
        <div className="text-sm text-gray-400">Debug Info:</div>
        <div className="text-xs text-gray-500 mt-2">
          <div>Active Macro: {activeMacro || 'None'}</div>
          <div>Total Children Available: {Object.keys(CHILD_BY_ID).length}</div>
          <div>Sample Child IDs: {Object.keys(CHILD_BY_ID).slice(0, 3).join(', ')}</div>
        </div>
      </div>
    </div>
  );
}