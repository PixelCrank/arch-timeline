'use client';

import React, { useEffect } from 'react';

export default function EnvironmentTest() {
  useEffect(() => {
    console.log('🔧 Environment Test Starting...');
    console.log('🔑 NEXT_PUBLIC_SANITY_PROJECT_ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log('🔑 NEXT_PUBLIC_SANITY_DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET);
    console.log('🔑 NEXT_PUBLIC_SANITY_API_VERSION:', process.env.NEXT_PUBLIC_SANITY_API_VERSION);
    
    // Test basic fetch with hardcoded values
    console.log('🌐 Testing basic fetch...');
    fetch('https://9i4jo80o.api.sanity.io/v2024-09-22/data/query/production?query=*[_type == "macroMovement"][0...2]')
      .then(res => {
        console.log('🌐 Fetch response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('🌐 Fetch response data:', data);
      })
      .catch(err => {
        console.error('🌐 Fetch error:', err);
      });
      
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Environment Test</h1>
      <div className="text-lg">Check the console for environment variables and fetch test results.</div>
    </div>
  );
}