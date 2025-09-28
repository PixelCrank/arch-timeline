'use client';

import React, { useState, useEffect } from 'react';
import { client } from '../sanity/client';
import { convertSanityToTimelineFormat } from '../hooks/useTimelineData';

export default function SimpleTest() {
  const [status, setStatus] = useState('Auto-testing connection...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    testFetch();
  }, []);

  const testFetch = async () => {
    try {
      console.log('🧪 Test: Fetching macro movements...');
      const macroMovements = await client.fetch('*[_type == "macroMovement"]');
      console.log('✅ Test: Got macros:', macroMovements.length);
      
      console.log('🧪 Test: Fetching child movements...');
      const childMovements = await client.fetch('*[_type == "childMovement"]');
      console.log('✅ Test: Got children:', childMovements.length);
      
      const testData = { macroMovements, childMovements, works: [], figures: [] };
      console.log('🧪 Test: Converting data...');
      const converted = convertSanityToTimelineFormat(testData);
      console.log('✅ Test: Converted data:', {
        macros: converted.macros.length,
        children: converted.children.length
      });
      
      setData(converted);
      setStatus(`Success! ${converted.macros.length} macros, ${converted.children.length} children`);
      
    } catch (err: any) {
      console.error('❌ Test error:', err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Sanity Data Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testFetch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Re-test Sanity Connection
        </button>
        
        <div className="text-lg">Status: {status}</div>
        
        {data && (
          <div className="space-y-4">
            <div className="text-green-400 font-semibold">Data loaded successfully!</div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Macro Movements ({data.macros.length}):</h3>
              {data.macros.slice(0, 3).map((macro: any) => (
                <div key={macro.id} className="bg-slate-800 p-3 rounded">
                  <div className="font-medium">{macro.name}</div>
                  <div className="text-sm text-gray-400">
                    {macro.start} - {macro.end} | Children: {macro.children.length}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Child Movements ({data.children.length}):</h3>
              {data.children.slice(0, 3).map((child: any) => (
                <div key={child.id} className="bg-slate-800 p-3 rounded">
                  <div className="font-medium">{child.name}</div>
                  <div className="text-sm text-gray-400">
                    {child.start} - {child.end} | {child.region}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded">
              <div className="text-green-300 font-semibold mb-2">✅ Connection Test Passed!</div>
              <div className="text-sm text-green-200">
                The children should now show when you click macro movements in the main timeline.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}