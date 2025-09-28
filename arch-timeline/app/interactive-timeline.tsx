'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { sampleMacroMovements, sampleChildMovements, sampleArchitecturalWorks, sampleKeyFigures } from '../lib/sampleData'

// Enhanced type definitions
interface Work {
  title: string
  year?: string
  location?: string
  description?: string
  architect?: string
  slug?: string
}

interface Figure {
  name: string
  role?: string
  description?: string
  birthYear?: number
  deathYear?: number
  slug?: string
}

interface ChildMovement {
  id: string
  name: string
  start: number
  end: number
  region: string
  traits?: string[]
  works?: Work[]
  figures?: Figure[]
}

interface MacroMovement {
  id: string
  name: string
  start: number
  end: number
  colorClass: string
  children: string[]
}

// Transform sample data to our format
const MACROS: MacroMovement[] = sampleMacroMovements.map(macro => ({
  id: macro.slug,
  name: macro.name,
  start: macro.startYear,
  end: macro.endYear,
  colorClass: macro.colorClass,
  children: sampleChildMovements
    .filter(child => child.parentMovement === macro.slug)
    .map(child => child.slug)
}))

const CHILD_BY_ID: Record<string, ChildMovement> = sampleChildMovements.reduce((acc: Record<string, ChildMovement>, child: any) => {
  const works = sampleArchitecturalWorks
    .filter(work => work.parentMovement === child.slug)
    .map(work => ({
      title: work.name,
      year: work.year?.toString(),
      location: work.location,
      description: work.description,
      architect: work.architect,
      slug: work.slug
    }))
  
  const figures = sampleKeyFigures
    .filter(figure => figure.parentMovement === child.slug)
    .map(figure => ({
      name: figure.name,
      role: figure.role,
      description: figure.description,
      birthYear: figure.birthYear,
      deathYear: figure.deathYear,
      slug: figure.slug
    }))
  
  acc[child.slug] = {
    id: child.slug,
    name: child.name,
    start: child.startYear,
    end: child.endYear,
    region: child.region,
    traits: child.traits,
    works,
    figures
  }
  return acc
}, {} as Record<string, ChildMovement>)

const fmtYear = (year: number): string => {
  if (year < 0) return `${Math.abs(year)} BCE`
  return `${year} CE`
}

export default function InteractiveTimeline() {
  // State management
  const [activeMacro, setActiveMacro] = useState<string | null>(null)
  const [activeChild, setActiveChild] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Event handlers
  const handleMacroClick = (macro: MacroMovement) => {
    if (activeMacro === macro.id) {
      // Collapse if already active
      setActiveMacro(null)
      setActiveChild(null)
    } else {
      setActiveMacro(macro.id)
      setActiveChild(null) // Reset child selection
    }
  }

  const handleChildClick = (child: ChildMovement) => {
    if (activeChild === child.id) {
      // Collapse if already active
      setActiveChild(null)
    } else {
      setActiveChild(child.id)
    }
  }

  const clearSelections = () => {
    setActiveMacro(null)
    setActiveChild(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Architecture Timeline
              </h1>
              <p className="text-sm text-slate-600 mt-1">Explore architectural movements through history</p>
            </div>
            
            {(activeMacro || activeChild) && (
              <button
                onClick={clearSelections}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-24 pb-8">
        {/* Always Visible Macro Movement Bar */}
        <div className="sticky top-24 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Architectural Movements</h2>
              <p className="text-sm text-slate-500">Click a movement to explore its sub-movements</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {MACROS.map((macro) => {
                const isActive = activeMacro === macro.id
                return (
                  <motion.button
                    key={macro.id}
                    onClick={() => handleMacroClick(macro)}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300' 
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
                    }`}
                    whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${macro.colorClass.replace('bg-gradient-to-r', 'bg-gradient-to-br')} shadow-sm`}></div>
                      <div className="text-left">
                        <div className="font-semibold">{macro.name}</div>
                        <div className="text-xs opacity-75">
                          {fmtYear(macro.start)} - {fmtYear(macro.end)}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
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
              className="bg-gradient-to-br from-blue-50/70 to-indigo-50/30 border-b border-blue-200/50"
            >
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {MACROS.find(m => m.id === activeMacro)?.name} Sub-Movements
                  </h3>
                  <p className="text-slate-600">Discover the regional variations and specific styles within this movement</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MACROS.find(m => m.id === activeMacro)?.children?.map((childId) => {
                    const child = CHILD_BY_ID[childId]
                    if (!child) return null
                    
                    const isChildActive = activeChild === child.id
                    
                    return (
                      <motion.button
                        key={childId}
                        onClick={() => handleChildClick(child)}
                        className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                          isChildActive
                            ? 'bg-green-100 border-2 border-green-400 shadow-xl ring-2 ring-green-200' 
                            : 'bg-white border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 shadow-md hover:shadow-xl'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-800 mb-1">{child.name}</h4>
                            <p className="text-sm text-slate-600 mb-2">{child.region}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {fmtYear(child.start)} - {fmtYear(child.end)}
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 shadow-sm ${
                              isChildActive ? 'ring-2 ring-green-300 scale-110' : ''
                            }`}></div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isChildActive ? 'rotate-180 text-green-600' : ''}`} />
                          </div>
                        </div>
                        
                        {child.traits && child.traits.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {child.traits.slice(0, 3).map((trait, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600 font-medium">
                                {trait}
                              </span>
                            ))}
                            {child.traits.length > 3 && (
                              <span className="px-3 py-1 bg-slate-200 text-xs rounded-full text-slate-500 font-medium">
                                +{child.traits.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {child.works?.length || 0} works • {child.figures?.length || 0} figures
                          </span>
                          <span className="text-green-600 font-medium">
                            {isChildActive ? 'Expanded' : 'Click to explore'}
                          </span>
                        </div>
                      </motion.button>
                    )
                  }) || []}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Works & Figures Section */}
        <AnimatePresence>
          {activeChild && (
            <motion.div
              key={`child-${activeChild}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="bg-gradient-to-br from-green-50/70 to-emerald-50/30 border-b border-green-200/50"
            >
              <div className="max-w-7xl mx-auto px-4 py-8">
                {(() => {
                  const child = CHILD_BY_ID[activeChild]
                  if (!child) return null
                  
                  return (
                    <>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          {child.name}
                        </h3>
                        <p className="text-lg text-slate-600 mb-1">{child.region}</p>
                        <p className="text-slate-500 mb-3">
                          {fmtYear(child.start)} - {fmtYear(child.end)}
                        </p>
                        {(() => {
                          const childData = sampleChildMovements.find(c => c.slug === child.id)
                          return childData?.description && (
                            <p className="text-slate-600 mb-4 max-w-4xl mx-auto leading-relaxed">
                              {childData.description}
                            </p>
                          )
                        })()}
                        {child.traits && child.traits.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {child.traits.map((trait, i) => (
                              <span key={i} className="px-4 py-2 bg-white/80 text-sm rounded-full text-slate-700 font-medium shadow-sm">
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid lg:grid-cols-2 gap-12">
                        {/* Notable Works */}
                        {child.works && child.works.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-md"></div>
                              <h4 className="text-xl font-bold text-slate-700">Notable Works</h4>
                              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {child.works.length} {child.works.length === 1 ? 'work' : 'works'}
                              </div>
                            </div>
                            <div className="space-y-6">
                              {child.works.map((work, i) => (
                                <motion.div
                                  key={i}
                                  className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group"
                                  whileHover={{ scale: 1.01, y: -2 }}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 + i * 0.05 }}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h5 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-2">
                                        {work.title}
                                      </h5>
                                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                        {work.year && (
                                          <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span className="font-medium">{work.year}</span>
                                          </div>
                                        )}
                                        {work.location && (
                                          <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            <span>{work.location}</span>
                                          </div>
                                        )}
                                        {work.architect && (
                                          <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            <span className="italic">{work.architect}</span>
                                          </div>
                                        )}
                                      </div>
                                      {work.description && (
                                        <p className="text-slate-700 leading-relaxed">{work.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  {work.location && (
                                    <div className="flex justify-end">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          window.open(`https://www.google.com/maps/search/${encodeURIComponent(work.title + ' ' + work.location)}`, '_blank')
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                      >
                                        📍 View on Map
                                      </button>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Key Figures */}
                        {child.figures && child.figures.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-md"></div>
                              <h4 className="text-xl font-bold text-slate-700">Key Figures</h4>
                              <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {child.figures.length} {child.figures.length === 1 ? 'figure' : 'figures'}
                              </div>
                            </div>
                            <div className="space-y-6">
                              {child.figures.map((figure, i) => {
                                const formatLifespan = () => {
                                  if (figure.birthYear && figure.deathYear) {
                                    const birth = figure.birthYear < 0 ? `${Math.abs(figure.birthYear)} BCE` : `${figure.birthYear} CE`
                                    const death = figure.deathYear < 0 ? `${Math.abs(figure.deathYear)} BCE` : `${figure.deathYear} CE`
                                    return `${birth} - ${death}`
                                  } else if (figure.birthYear) {
                                    const birth = figure.birthYear < 0 ? `${Math.abs(figure.birthYear)} BCE` : `${figure.birthYear} CE`
                                    return `Born ${birth}`
                                  }
                                  return null
                                }
                                
                                return (
                                  <motion.div
                                    key={i}
                                    className="p-6 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                  >
                                    <div className="mb-4">
                                      <h5 className="text-xl font-bold text-slate-800 mb-2">{figure.name}</h5>
                                      <div className="flex flex-col gap-2">
                                        {figure.role && (
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            <span className="text-sm font-medium text-slate-600">{figure.role}</span>
                                          </div>
                                        )}
                                        {formatLifespan() && (
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                            <span className="text-sm text-slate-600">{formatLifespan()}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {figure.description && (
                                      <p className="text-slate-700 leading-relaxed">{figure.description}</p>
                                    )}
                                  </motion.div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )
                })()}
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
  )
}