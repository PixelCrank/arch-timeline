"use client";

import { useMemo, useState } from "react";
import { HeroSection } from "@/components/timeline/HeroSection";
import { LegendSection } from "@/components/timeline/LegendSection";
import { MacroSection } from "@/components/timeline/MacroSection";
import { LEGEND_ITEMS, MACRO_PALETTES } from "@/components/timeline/palettes";
import { getChronoStart } from "@/components/timeline/utils";
import { useTimelineData } from "../hooks/useTimelineData";
import type { ChildMovement, MacroMovement } from "../lib/timelineData";

export default function Home() {
  const { data, loading, error } = useTimelineData();

  const macros = useMemo<MacroMovement[]>(() => {
    return Array.isArray(data?.macros) ? (data.macros as MacroMovement[]) : [];
  }, [data?.macros]);

  const movements = useMemo<ChildMovement[]>(() => {
    return Array.isArray(data?.children) ? (data.children as ChildMovement[]) : [];
  }, [data?.children]);

  const movementById = useMemo(() => {
    return Object.fromEntries(movements.map((movement) => [movement.id, movement]));
  }, [movements]);

  const sortedMacros = useMemo(() => {
    return [...macros].sort((a, b) => getChronoStart(a) - getChronoStart(b));
  }, [macros]);

  const [activeMacroId, setActiveMacroId] = useState<string | null>(null);
  const [activeMovementId, setActiveMovementId] = useState<string | null>(null);

  const handleMacroToggle = (macro: MacroMovement) => {
    setActiveMacroId((previous) => (previous === macro.id ? null : macro.id));
    setActiveMovementId(null);
  };

  const handleMovementToggle = (movement: ChildMovement) => {
    setActiveMovementId((previous) => (previous === movement.id ? null : movement.id));
  };

  const clearHighlights = () => {
    setActiveMacroId(null);
    setActiveMovementId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-surface">
        <div className="glass-panel space-y-4 rounded-3xl border border-white/40 bg-white/60 p-8 text-center shadow-soft">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
          <p className="text-sm font-semibold text-slate-500">Loading the lineage…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-surface">
        <div className="glass-panel space-y-4 rounded-3xl border border-red-200/50 bg-white/70 p-8 text-center shadow-soft">
          <h2 className="text-xl font-bold text-red-600">Timeline data failed to load</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="glass-button inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-red-600 shadow-soft transition hover:bg-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-surface">
      <HeroSection hasHighlights={Boolean(activeMacroId || activeMovementId)} onClear={clearHighlights} />
      
      {/* Timeline with integrated dots that move with cards */}
      <main className="relative pb-24">
        {/* Continuous vertical timeline line */}
        <div className="absolute left-[calc(50%-550px+2rem)] top-0 hidden h-full w-0.5 bg-gradient-to-b from-sky-300/50 via-emerald-300/50 to-indigo-300/50 md:block lg:left-[calc(50%-550px+3rem)]" />
        
        {/* Timeline arrow at bottom */}
        <div className="absolute left-[calc(50%-550px+2rem)] bottom-8 hidden -translate-x-1/2 md:block lg:left-[calc(50%-550px+3rem)]">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-0.5 bg-gradient-to-b from-indigo-300/50 to-transparent" />
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-indigo-400">
              <path d="M8 14L4 10h8l-4 4z" fill="currentColor" />
            </svg>
            <span className="text-xs font-semibold text-slate-400">Time</span>
          </div>
        </div>

        <div className="section-container space-y-16 pt-16">
          {sortedMacros.map((macro, index) => {
            const palette = MACRO_PALETTES[index % MACRO_PALETTES.length];
            const childIds = Array.isArray(macro.children) ? macro.children : [];
            const childrenMovements = childIds
              .map((id) => movementById[id])
              .filter((movement): movement is ChildMovement => Boolean(movement))
              .sort((a, b) => getChronoStart(a) - getChronoStart(b));

            return (
              <div key={macro.id} className="relative">
                {/* Timeline marker that moves with the card */}
                <div className="absolute -left-[calc(1.5rem+96px)] top-8 hidden items-center gap-4 md:flex lg:-left-[calc(1.5rem+120px)]">
                  {/* Year label */}
                  <div className="flex min-w-[64px] flex-col items-end text-right">
                    {macro.start ? (
                      <>
                        <span className="text-xl font-black text-slate-800">{macro.start}</span>
                        {macro.end && macro.end !== macro.start ? (
                          <span className="text-xs font-medium text-slate-500">to {macro.end}</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">Era {index + 1}</span>
                    )}
                  </div>
                  
                  {/* Timeline dot */}
                  <div className={`relative z-10 h-4 w-4 rounded-full border-4 border-white bg-gradient-to-br ${palette.surface} shadow-lg`} />
                  
                  {/* Horizontal connector line to card */}
                  <div className="h-0.5 w-8 bg-gradient-to-r from-slate-300/60 to-transparent lg:w-12" />
                </div>
                
                <MacroSection
                  macro={macro}
                  order={index}
                  palette={palette}
                  isActive={activeMacroId === macro.id}
                  onToggle={() => handleMacroToggle(macro)}
                  movements={childrenMovements}
                  activeMovementId={activeMovementId}
                  onMovementToggle={handleMovementToggle}
                />
              </div>
            );
          })}

          {!sortedMacros.length ? (
            <div className="glass-panel rounded-4xl border border-dashed border-white/60 bg-white/70 p-12 text-center text-slate-600">
              No timeline data found yet. Connect the Google Sheet to populate your architectural family tree.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
