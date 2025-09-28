'use client';

import React, { useState, useEffect } from 'react';

export default function SimpleDataTest() {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function testData() {
      try {
        setStatus('🔍 Testing API connection...');
        
        const response = await fetch('https://9i4jo80o.api.sanity.io/v2024-09-22/data/query/production?query=*[_type == "macroMovement"]');
        
        if (!response.ok) {
          setStatus(`❌ API Error: ${response.status} ${response.statusText}`);
          return;
        }
        
        const result = await response.json();
        setData(result);
        setStatus(`✅ Success! Found ${result.result?.length || 0} macro movements`);
        
      } catch (error: any) {
        setStatus(`❌ Error: ${error.message}`);
      }
    }
    
    testData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Simple Data Test</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        {data && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Data Preview:</h2>
            <div className="space-y-4">
              {data.result?.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <h3 className="text-xl font-medium text-blue-300">{item.name}</h3>
                  <p className="text-gray-300">
                    {item.startYear} - {item.endYear} | {item.slug?.current}
                  </p>
                </div>
              )) || <p className="text-red-300">No data found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}