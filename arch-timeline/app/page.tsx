"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Calendar, MapPin, User } from "lucide-react";
import { useTimelineData } from "../hooks/useTimelineData";

const fmtYear = (year: number): string => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
};

export default function Home() {
  const { data, loading, error } = useTimelineData();

  // Defensive defaults
  const MACROS = data?.macros || [];
  const CHILDREN = data?.children || [];

  // Lookup for children by id
  const CHILD_BY_ID = useMemo(
    () => Object.fromEntries((CHILDREN || []).map((c: any) => [c.id, c])),
    [CHILDREN]
  );

  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  const handleMacroClick = (macro: any) => {
    if (activeMacro === macro.id) {
      setActiveMacro(null);
      setActiveChild(null);
    } else {
      setActiveMacro(macro.id);
      setActiveChild(null);
    }
  };

  const handleChildClick = (child: any) => {
    if (activeChild === child.id) {
      setActiveChild(null);
    } else {
      setActiveChild(child.id);
    }
  };

  const clearSelections = () => {
    setActiveMacro(null);
    setActiveChild(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Timeline Load Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen">
      {/* Header */}
      {/* Hero/Header */}
      <header className="w-full pt-12 pb-10 bg-gradient-to-br from-blue-200/60 via-white/80 to-purple-200/60">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                Architecture Timeline
              </h1>
              <p className="text-lg text-slate-700 max-w-xl mb-2">Explore the evolution of architectural movements, styles, and key figures from ancient to contemporary times. Click a movement to dive in!</p>
            </div>
            {(activeMacro || activeChild) && (
              <button
                onClick={clearSelections}
                className="flex items-center gap-2 px-6 py-3 glass-card text-slate-800 font-semibold text-base hover:bg-white/60 transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container pb-16">
        {/* Macro Movement Carousel */}
        <div className="w-full overflow-x-auto hide-scrollbar py-6">
          <div className="flex gap-6 min-w-[700px] md:min-w-0">
            {MACROS.map((macro: any) => {
              const isActive = activeMacro === macro.id;
              return (
                <motion.button
                  key={macro.id}
                  onClick={() => handleMacroClick(macro)}
                  className={`glass-card px-8 py-6 min-w-[260px] max-w-xs font-bold text-lg transition-all duration-300 border-2 border-white/40 hover:border-blue-400 hover:shadow-2xl ${
                    isActive ? 'ring-4 ring-blue-300/40 scale-105 text-blue-900 bg-white/70' : 'text-slate-800 bg-white/40'
                  }`}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(147,197,253,0.8) 0%, rgba(221,214,254,0.8) 100%)'
                      : 'rgba(255,255,255,0.35)',
                  }}
                  whileHover={{ scale: isActive ? 1.05 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full ${macro.colorClass?.replace('bg-gradient-to-r', 'bg-gradient-to-br') || ''} shadow-md border-2 border-white/60`}></div>
                    <span className="font-extrabold text-base tracking-tight drop-shadow-sm">{macro.name}</span>
                  </div>
                  <div className="text-xs opacity-80 font-mono mb-1">
                    {fmtYear(macro.start)} - {fmtYear(macro.end)}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {macro.children?.length > 0 && (
                      <span className="chip">{macro.children.length} sub-movements</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sub-movements Section */}
        <AnimatePresence>
          {activeMacro && (
            <motion.div
              key={`macro-${activeMacro}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="glass-card border-b border-white/30 shadow-2xl my-12"
              style={{ borderRadius: '2rem' }}
            >
              <div className="container py-12">
                <div className="text-center mb-10">
                  <h3 className="text-4xl font-extrabold text-slate-900 mb-2 drop-shadow-sm">
                    {MACROS.find((m: any) => m.id === activeMacro)?.name} Sub-Movements
                  </h3>
                  <p className="text-slate-700 text-lg">Discover the regional variations and specific styles within this movement</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {MACROS.find((m: any) => m.id === activeMacro)?.children?.map((childId: string) => {
                    const child = CHILD_BY_ID[childId];
                    if (!child) return null;
                    const isChildActive = activeChild === child.id;
                    return (
                      <div key={childId} className="relative">
                        <motion.button
                          onClick={() => handleChildClick(child)}
                          className={`glass-card p-8 w-full text-left transition-all duration-300 shadow-xl border-2 border-white/40 hover:border-green-400 hover:shadow-2xl ${
                            isChildActive ? 'ring-4 ring-green-300/40 scale-105 text-green-900 bg-white/80' : 'text-slate-800 bg-white/50'
                          }`}
                          style={{
                            background: isChildActive
                              ? 'linear-gradient(135deg, rgba(134,239,172,0.8) 0%, rgba(103,232,249,0.8) 100%)'
                              : 'rgba(255,255,255,0.45)',
                          }}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-2xl font-extrabold text-slate-900 mb-1 drop-shadow-sm">{child.name}</h4>
                              <p className="text-base text-slate-700 mb-2">{child.region}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                {fmtYear(child.start)} - {fmtYear(child.end)}
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 shadow-md border-2 border-white/60 ${
                                isChildActive ? 'ring-2 ring-green-300 scale-110' : ''
                              }`}></div>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isChildActive ? 'rotate-180 text-green-600' : ''}`} />
                            </div>
                          </div>
                          {/* All details for the sub-movement */}
                          {child.description && (
                            <div className="mb-2 text-slate-700 text-sm"><span className="font-semibold">Description:</span> {child.description}</div>
                          )}
                          {child.hallmarkTraits && child.hallmarkTraits.length > 0 && (
                            <div className="mb-2 text-slate-700 text-sm"><span className="font-semibold">Hallmark Traits:</span> {child.hallmarkTraits.join(', ')}</div>
                          )}
                          {child.texts && child.texts.length > 0 && (
                            <div className="mb-2 text-slate-700 text-sm"><span className="font-semibold">Key Texts / Theory:</span> {child.texts.join(', ')}</div>
                          )}
                          {child.socialPolitical && (
                            <div className="mb-2 text-slate-700 text-sm"><span className="font-semibold">Social / Political Context:</span> {child.socialPolitical}</div>
                          )}
                          {child.philosophy && (
                            <div className="mb-2 text-slate-700 text-sm"><span className="font-semibold">Philosophical Ideas:</span> {child.philosophy}</div>
                          )}
                          {child.traits && child.traits.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {child.traits.slice(0, 3).map((trait: string, i: number) => (
                                <span key={i} className="chip">
                                  {trait}
                                </span>
                              ))}
                              {child.traits.length > 3 && (
                                <span className="chip bg-gradient-to-r from-green-200 to-green-400 text-green-900">
                                  +{child.traits.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {(child.works?.length || 0)} works • {(child.figures?.length || 0)} figures
                            </span>
                            <span className="text-green-600 font-medium">
                              {isChildActive ? 'Expanded' : 'Click to explore'}
                            </span>
                          </div>
                        </motion.button>
                        {/* Expanded: Show works and figures */}
                        {isChildActive && (
                          <div className="mt-6 space-y-6">
                            {/* Works */}
                            {child.works && child.works.length > 0 &&
                              child.works.map((work: any, i: number) => (
                                <div
                                  key={i}
                                  className="glass-card p-10 flex flex-col items-center gap-8 border-2 border-white/40 hover:border-blue-400 shadow-2xl transition-all duration-300 bg-white/60 mx-2 my-4 transform-gpu hover:scale-105 hover:shadow-blue-200/60"
                                  style={{ minWidth: 260, maxWidth: 340, background: 'linear-gradient(135deg, rgba(147,197,253,0.8) 0%, rgba(221,214,254,0.8) 100%)' }}
                                >
                                  {work.imageUrl && (
                                    <div className="w-full flex justify-center mb-3">
                                      <img
                                        src={work.imageUrl}
                                        alt={work.name + ' image'}
                                        className="rounded-xl object-cover border-2 border-blue-200 shadow-md bg-slate-50"
                                        style={{ maxHeight: 160, width: '100%', objectFit: 'cover' }}
                                      />
                                    </div>
                                  )}
                                  <div className="text-xl font-extrabold text-blue-900 text-center mb-2 tracking-tight drop-shadow-sm">
                                    {work.name}
                                  </div>
                                  {work.metadata && (
                                    <div className="flex flex-col gap-2 w-full mb-3 pb-3 border-b border-blue-200/40">
                                      {work.metadata.architect && (
                                        <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold">
                                          <User className="w-4 h-4 opacity-70" />
                                          <span>{work.metadata.architect}</span>
                                        </div>
                                      )}
                                      {work.metadata.year && (
                                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                                          <Calendar className="w-4 h-4 opacity-70" />
                                          <span>{work.metadata.year}</span>
                                        </div>
                                      )}
                                      {work.metadata.location && (
                                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                                          <MapPin className="w-4 h-4 opacity-70" />
                                          <span>{work.metadata.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {work.description && (
                                    <div className="w-full text-slate-800 text-[15px] text-left mb-3 leading-snug pb-3 border-b border-blue-200/40">
                                      <span className="block font-semibold text-blue-700 mb-1">Description</span>
                                      {work.description}
                                    </div>
                                  )}
                                  {/* Render all other fields except id, name, type, imageUrl, metadata, description */}
                                  <div className="w-full flex flex-col gap-3 mt-2 pt-2">
                                    {Object.entries(work)
                                      .filter(([k]) => !['id', 'name', 'type', 'imageUrl', 'metadata', 'description'].includes(k))
                                      .map(([key, value]) => (
                                        <div key={key} className="w-full">
                                          <span className="block font-semibold text-blue-700 text-xs mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</span>
                                          <span className="block text-xs text-blue-900">
                                            {Array.isArray(value)
                                              ? value.join(', ')
                                              : typeof value === 'object' && value !== null
                                                ? Object.entries(value).map(([k2, v2]) => (
                                                    <span key={k2} className="inline-block mr-2">
                                                      <span className="font-medium">{k2}:</span> {Array.isArray(v2) ? v2.join(', ') : String(v2)}
                                                    </span>
                                                  ))
                                                : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            {/* Figures */}
                            {child.figures && child.figures.length > 0 &&
                              child.figures.map((figure: any, i: number) => (
                                <div
                                  key={i}
                                  className="glass-card p-10 flex flex-col items-center gap-8 border-2 border-white/40 hover:border-purple-400 shadow-2xl transition-all duration-300 bg-white/60 mx-2 my-4 transform-gpu hover:scale-105 hover:shadow-purple-200/60"
                                  style={{ minWidth: 260, maxWidth: 340, background: 'linear-gradient(135deg, rgba(233,213,255,0.8) 0%, rgba(199,210,254,0.8) 100%)' }}
                                >
                                  {figure.imageUrl && (
                                    <div className="w-full flex justify-center mb-3">
                                      <img
                                        src={figure.imageUrl}
                                        alt={figure.name + ' image'}
                                        className="rounded-xl object-cover border-2 border-purple-200 shadow-md bg-slate-50"
                                        style={{ maxHeight: 160, width: '100%', objectFit: 'cover' }}
                                      />
                                    </div>
                                  )}
                                  <div className="text-xl font-extrabold text-purple-900 text-center mb-2 tracking-tight drop-shadow-sm">
                                    {figure.name}
                                  </div>
                                  {figure.metadata && (
                                    <div className="flex flex-col gap-2 w-full mb-3 pb-3 border-b border-purple-200/40">
                                      {figure.metadata.birthYear && (
                                        <div className="flex items-center gap-2 text-purple-800 text-sm font-semibold">
                                          <Calendar className="w-4 h-4 opacity-70" />
                                          <span>{figure.metadata.birthYear}</span>
                                        </div>
                                      )}
                                      {figure.metadata.deathYear && (
                                        <div className="flex items-center gap-2 text-purple-700 text-sm">
                                          <Calendar className="w-4 h-4 opacity-70" />
                                          <span>– {figure.metadata.deathYear}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {figure.description && (
                                    <div className="w-full text-slate-800 text-[15px] text-left mb-3 leading-snug pb-3 border-b border-purple-200/40">
                                      <span className="block font-semibold text-purple-700 mb-1">Description</span>
                                      {figure.description}
                                    </div>
                                  )}
                                  {/* Render all other fields except id, name, type, imageUrl, metadata, description */}
                                  <div className="w-full flex flex-col gap-3 mt-2 pt-2">
                                    {Object.entries(figure)
                                      .filter(([k]) => !['id', 'name', 'type', 'imageUrl', 'metadata', 'description'].includes(k))
                                      .map(([key, value]) => (
                                        <div key={key} className="w-full">
                                          <span className="block font-semibold text-purple-700 text-xs mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</span>
                                          <span className="block text-xs text-purple-900">
                                            {Array.isArray(value)
                                              ? value.join(', ')
                                              : typeof value === 'object' && value !== null
                                                ? Object.entries(value).map(([k2, v2]) => (
                                                    <span key={k2} className="inline-block mr-2">
                                                      <span className="font-medium">{k2}:</span> {Array.isArray(v2) ? v2.join(', ') : String(v2)}
                                                    </span>
                                                  ))
                                                : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  }) || []}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help/Instructions Section */}
        {!activeMacro && (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Welcome to the Interactive Architecture Timeline
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                Explore the evolution of architectural movements from ancient times to the present day.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-2">Step 1: Choose Movement</h4>
                  <p className="text-slate-600">Click any architectural movement above to explore its sub-movements</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-2">Step 2: Explore Styles</h4>
                  <p className="text-slate-600">Discover regional variations and specific architectural styles</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-2">Step 3: Dive Deep</h4>
                  <p className="text-slate-600">Learn about notable works and key figures in each style</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
