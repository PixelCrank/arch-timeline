"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, Search, Filter, ZoomIn, ZoomOut, X, Image as ImageIcon } from "lucide-react";
import { createClient } from 'next-sanity';
import { convertSanityToTimelineFormat } from '../hooks/useTimelineData';

export default function ArchitectureTimeline() {
  console.log('🚀 ArchitectureTimeline component starting...');
  
  // Direct Sanity client setup
  const [sanityData, setSanityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🎯 Current state:', { sanityData: !!sanityData, loading, error });
  
  const sanityClient = createClient({
    projectId: "9i4jo80o",
    dataset: "production", 
    apiVersion: "2025-09-22",
    useCdn: false,
  });
  
  const fetchData = async () => {
    try {
      console.log('🔍 Starting data fetch...');
      setLoading(true);
      setError(null);
      
      // Fetch all data types
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
      console.log('🎯 Setting sanityData to:', newData);
      setSanityData(newData);
      console.log('✅ sanityData has been set');
      
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
      console.log('🏁 Loading set to false');
    }
  };
  
  const refetch = fetchData;
  
  useEffect(() => {
    console.log('📍 useEffect triggered');
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Architecture Timeline</h1>
      {loading && <div className="text-blue-600">Loading timeline data...</div>}
      {error && (
        <div className="text-red-600 mb-4">
          Error: {error}
          <button 
            onClick={refetch}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
      {sanityData && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="font-bold text-green-800">Data Loaded Successfully!</h2>
          <p>Macro Movements: {sanityData.macroMovements?.length || 0}</p>
          <p>Child Movements: {sanityData.childMovements?.length || 0}</p>
          <p>Works: {sanityData.works?.length || 0}</p>
          <p>Figures: {sanityData.figures?.length || 0}</p>
        </div>
      )}
      <div className="bg-gray-100 p-4 rounded">
        Timeline component will be rendered here once data loading is confirmed working.
      </div>
    </div>
  );
}