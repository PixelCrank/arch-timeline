"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { ChildMovement, MacroMovement } from "../../lib/timelineData";
import { InfoPill } from "./InfoPill";
import { MovementCard } from "./MovementCard";
import { type MovementPalette } from "./MovementDetails";
import { formatMacroYears, splitList } from "@/components/timeline/utils";

export type MacroPalette = {
  surface: string;
  accent: string;
  movementPalette: MovementPalette;
  workPaletteKey: "a" | "b" | "c";
  figurePaletteKey: "a" | "b" | "c";
};

export function MacroSection({
  macro,
  order,
  palette,
  isActive,
  onToggle,
  movements,
  activeMovementId,
  onMovementToggle,
}: {
  macro: MacroMovement;
  order: number;
  palette: MacroPalette;
  isActive: boolean;
  onToggle: () => void;
  movements: ChildMovement[];
  activeMovementId: string | null;
  onMovementToggle: (movement: ChildMovement) => void;
}) {
  const years = formatMacroYears(macro);
  const aliasList = splitList(macro.macroNamesList);

  return (
    <section className="relative">
      <article className="group relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/30 shadow-[0_20px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl transition-all hover:shadow-[0_25px_90px_rgba(15,23,42,0.22)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${palette.surface} opacity-60`} aria-hidden="true" />
        
        <div className="relative z-10">
          <motion.button
            type="button"
            onClick={onToggle}
            layout
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="w-full text-left"
          >
            <div className="space-y-6 p-8 lg:p-10">
              {/* Header badges */}
              <div className="flex flex-wrap items-center gap-2">
                <InfoPill tone="macro" icon={<Layers className="h-3.5 w-3.5" />} size="sm">
                  Macro Era
                </InfoPill>
                {years ? (
                  <InfoPill tone="muted" size="sm" uppercase={false}>
                    ⏱ {years}
                  </InfoPill>
                ) : null}
                <InfoPill tone="muted" size="sm">
                  Era #{order + 1}
                </InfoPill>
                {isActive ? (
                  <InfoPill tone="macro" size="sm">
                    Expanded
                  </InfoPill>
                ) : null}
              </div>

              {/* Title and metadata grid */}
              <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 lg:text-4xl">
                    {macro.name}
                  </h2>
                  {macro.description ? (
                    <p className="max-w-2xl text-base leading-relaxed text-slate-600">{macro.description}</p>
                  ) : null}
                  
                  {/* Movement count indicator */}
                  {movements.length > 0 ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/80 text-[10px] font-bold text-emerald-900">
                        {movements.length}
                      </span>
                      {movements.length === 1 ? "Movement" : "Movements"} within this era
                    </div>
                  ) : null}
                </div>

                {/* Aliases sidebar */}
                {aliasList.length ? (
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Also Known As
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aliasList.map((alias) => (
                        <InfoPill key={`${macro.id}-alias-${alias}`} tone="neutral" size="sm" uppercase={false}>
                          {alias}
                        </InfoPill>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Expand indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>{isActive ? "Hide" : "Explore"} child movements</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isActive ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.button>

          <AnimatePresence initial={false}>
            {isActive ? (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-t border-white/40"
              >
                <div className="space-y-8 p-8 lg:p-10">
                  <p className="text-sm font-medium text-slate-600">
                    Explore the <span className="font-semibold text-slate-900">{movements.length}</span> child movement
                    {movements.length === 1 ? "" : "s"} branching from{" "}
                    <span className="font-semibold text-slate-900">{macro.name}</span>
                  </p>
                  <div className="grid gap-6 md:grid-cols-2">
                    {movements.map((movement) => (
                      <MovementCard
                        key={movement.id}
                        movement={movement}
                        macroName={macro.name}
                        palette={palette.movementPalette}
                        workPaletteKey={palette.workPaletteKey}
                        figurePaletteKey={palette.figurePaletteKey}
                        isActive={activeMovementId === movement.id}
                        onToggle={() => onMovementToggle(movement)}
                      />
                    ))}
                  </div>
                  {!movements.length ? (
                    <div className="glass-panel rounded-2xl border border-dashed border-slate-300/50 bg-slate-50/50 p-8 text-center text-sm text-slate-600">
                      No branch movements connected yet. Update the data sheet to grow this family tree.
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </article>
    </section>
  );
}
