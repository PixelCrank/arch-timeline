"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  onClear,
  matchCount,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  matchCount: number;
}) {
  return (
    <div className="glass-surface sticky top-4 z-50 rounded-2xl border border-white/50 p-2 shadow-lg backdrop-blur-xl">
      <div className="relative flex items-center gap-2">
        <Search className="ml-2 h-5 w-5 flex-shrink-0 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search movements, buildings, figures..."
          className="flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder-slate-400 outline-none sm:text-base"
        />
        {value && (
          <div className="flex items-center gap-1 sm:gap-2">
            {matchCount > 0 && (
              <div className="hidden rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white sm:block sm:px-3">
                {matchCount} {matchCount === 1 ? 'match' : 'matches'}
              </div>
            )}
            {matchCount > 0 && (
              <div className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white sm:hidden">
                {matchCount}
              </div>
            )}
            {matchCount === 0 && (
              <div className="rounded-full bg-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 sm:px-3">
                <span className="hidden sm:inline">No matches</span>
                <span className="sm:hidden">0</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClear}
              className="rounded-full p-1.5 transition hover:bg-white/60 sm:p-2"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-slate-600 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
