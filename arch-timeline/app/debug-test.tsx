'use client';

import React, { useState, useEffect } from 'react';

// Debug component to test data fetching
export default function DataDebugTest() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testFetch() {
      try {
        const projectId = '9i4jo80o';
        const dataset = 'production';
        const apiVersion = '2024-09-22';
        const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
        
        console.log('🔍 Starting debug fetch...');
        
        // Test each content type
        const macroRes = await fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "macroMovement"]')}`);
        const macroData = await macroRes.json();
        console.log('📊 Macro movements:', macroData.result?.length, macroData.result);
        
        const childRes = await fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "childMovement"]')}`);
        const childData = await childRes.json();
        console.log('👶 Child movements:', childData.result?.length, childData.result);
        
        const worksRes = await fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "architecturalWork"]')}`);
        const worksData = await worksRes.json();
        console.log('🏗️ Architectural works:', worksData.result?.length, worksData.result);
        
        const figuresRes = await fetch(`${baseUrl}?query=${encodeURIComponent('*[_type == "keyFigure"]')}`);
        const figuresData = await figuresRes.json();
        console.log('👤 Key figures:', figuresData.result?.length, figuresData.result);
        
        setData({
          macros: macroData.result || [],
          children: childData.result || [],
          works: worksData.result || [],
          figures: figuresData.result || []
        });
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ Debug fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    testFetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Data Test</h1>
        <div>Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Data Test</h1>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Data Test Results</h1>
      
      <div className="space-y-6">
        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-green-400 mb-2">Data Summary</h2>
          <div className="space-y-1">
            <div>Macro Movements: {data.macros.length}</div>
            <div>Child Movements: {data.children.length}</div>
            <div>Architectural Works: {data.works.length}</div>
            <div>Key Figures: {data.figures.length}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-blue-400 mb-2">Macro Movements</h2>
          <div className="space-y-2">
            {data.macros.map((macro: any) => (
              <div key={macro._id} className="bg-slate-700 p-2 rounded text-sm">
                <div><strong>ID:</strong> {macro._id}</div>
                <div><strong>Slug:</strong> {macro.slug?.current}</div>
                <div><strong>Name:</strong> {macro.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-purple-400 mb-2">Child Movements</h2>
          <div className="space-y-2">
            {data.children.map((child: any) => (
              <div key={child._id} className="bg-slate-700 p-2 rounded text-sm">
                <div><strong>Name:</strong> {child.name}</div>
                <div><strong>Parent:</strong> {child.parentMovement?._ref}</div>
                <div><strong>Slug:</strong> {child.slug?.current}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Works & Figures</h2>
          <div className="text-sm">
            <div>Works: {data.works.length} items</div>
            <div>Figures: {data.figures.length} items</div>
          </div>
        </div>
      </div>
    </div>
  );
}