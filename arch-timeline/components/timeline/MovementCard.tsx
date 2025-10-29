"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Building, ChevronDown, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import type { ChildMovement, TimelineBuilding, TimelineFigure } from "../../lib/timelineData";
import { FigureCard } from "./FigureCard";
import { InfoPill } from "./InfoPill";
import { MovementDetails, type MovementPalette } from "./MovementDetails";
import { WorkCard } from "./WorkCard";
import { formatMovementYears } from "@/components/timeline/utils";

export function MovementCard({
  movement,
  palette,
  macroName,
  isActive,
  onToggle,
  workPaletteKey,
  figurePaletteKey,
}: {
  movement: ChildMovement;
  palette: MovementPalette;
  macroName: string;
  isActive: boolean;
  onToggle: () => void;
  workPaletteKey: "a" | "b" | "c";
  figurePaletteKey: "a" | "b" | "c";
}) {
  const years = formatMovementYears(movement);
  const works = Array.isArray(movement.works) ? (movement.works as TimelineBuilding[]) : [];
  const figures = Array.isArray(movement.figures) ? (movement.figures as TimelineFigure[]) : [];

  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const [activeFigureId, setActiveFigureId] = useState<string | null>(null);

  const handleWorkToggle = (workId: string) => {
    setActiveWorkId((prev) => (prev === workId ? null : workId));
  };

  const handleFigureToggle = (figureId: string) => {
    setActiveFigureId((prev) => (prev === figureId ? null : figureId));
  };

  return (
    <div className="group space-y-4">
      <motion.button
        type="button"
        onClick={onToggle}
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`glass-panel w-full overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${palette.cardSurface} text-left shadow-soft transition-all hover:shadow-[0_12px_40px_rgba(15,23,42,0.15)]`}
      >
        {/* Card header */}
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <InfoPill tone="movement" icon={<Sparkles className="h-3 w-3" />} size="sm">
                  Movement
                </InfoPill>
                {years ? (
                  <InfoPill tone="muted" size="sm" uppercase={false}>
                    {years}
                  </InfoPill>
                ) : null}
                {movement.region || movement.geography ? (
                  <InfoPill tone="muted" size="sm" uppercase={false}>
                    {movement.region ?? movement.geography}
                  </InfoPill>
                ) : null}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-900">{movement.name}</h3>

              {/* Preview text */}
              {movement.overview ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{movement.overview}</p>
              ) : null}
            </div>

            {/* Expand chevron */}
            <div className="flex-shrink-0 pt-1">
              <ChevronDown
                className={`h-5 w-5 text-emerald-600 transition-transform ${isActive ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 border-t border-white/50 pt-3 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-amber-600" />
              {works.length} {works.length === 1 ? "Work" : "Works"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-fuchsia-600" />
              {figures.length} {figures.length === 1 ? "Figure" : "Figures"}
            </span>
          </div>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <MovementDetails movement={movement} macroName={macroName} palette={palette} />
            
            {works.length > 0 && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-700">
                  <Building className="h-4 w-4" />
                  Signature Works & Buildings
                </h4>
                {/* Collapsed cards in single column */}
                <div className="flex flex-col gap-4">
                  {works
                    .filter((work) => activeWorkId !== work.name)
                    .map((work) => (
                      <WorkCard
                        key={work.name}
                        work={work}
                        paletteKey={workPaletteKey}
                        isActive={false}
                        onToggle={() => handleWorkToggle(work.name)}
                      />
                    ))}
                </div>
                {/* Expanded card at full width */}
                {activeWorkId && (
                  <div className="w-full">
                    {works
                      .filter((work) => work.name === activeWorkId)
                      .map((work) => (
                        <WorkCard
                          key={work.name}
                          work={work}
                          paletteKey={workPaletteKey}
                          isActive={true}
                          onToggle={() => handleWorkToggle(work.name)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
            
            {figures.length > 0 && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-fuchsia-700">
                  <Users className="h-4 w-4" />
                  Key Figures
                </h4>
                {/* Collapsed cards in single column */}
                <div className="flex flex-col gap-4">
                  {figures
                    .filter((figure) => activeFigureId !== figure.name)
                    .map((figure) => (
                      <FigureCard
                        key={figure.name}
                        figure={figure}
                        paletteKey={figurePaletteKey}
                        isActive={false}
                        onToggle={() => handleFigureToggle(figure.name)}
                      />
                    ))}
                </div>
                {/* Expanded card at full width */}
                {activeFigureId && (
                  <div className="w-full">
                    {figures
                      .filter((figure) => figure.name === activeFigureId)
                      .map((figure) => (
                        <FigureCard
                          key={figure.name}
                          figure={figure}
                          paletteKey={figurePaletteKey}
                          isActive={true}
                          onToggle={() => handleFigureToggle(figure.name)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
