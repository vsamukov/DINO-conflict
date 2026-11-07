import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Maximize, Home } from 'lucide-react';
import { GameMode, Egg, Raptor } from '../types/game';

interface HUDProps {
  mode: GameMode;
  eggs: Egg[];
  eggsBanked: number;
  timeLeft: number;
  raptor: Raptor;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleFullscreen: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  mode,
  eggs,
  eggsBanked,
  timeLeft,
  raptor,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onRestart,
  onHome,
  onToggleFullscreen,
}) => {
  const nestEggsCount = eggs.filter((e) => e.state === 'nest').length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-20 flex justify-between items-start">
      {/* Left side: Role & Score Status */}
      <div className="flex items-center gap-2.5 sm:gap-4 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 shadow-lg">
          {/* Dinosaur Icon & Name */}
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">
              {mode === 'GUARDIAN' ? '🦕' : mode === 'BANDIT' ? '🦖' : '⚔️'}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-amber-300 font-display uppercase tracking-wide leading-none">
                {mode === 'GUARDIAN'
                  ? 'Giant Guardian'
                  : mode === 'BANDIT'
                  ? 'Egg Bandit'
                  : 'Dino Showdown'}
              </span>
              <span className="text-[11px] text-slate-300 font-medium leading-tight">
                {mode === 'GUARDIAN'
                  ? 'Protect Nest'
                  : mode === 'BANDIT'
                  ? 'Steal 3 Eggs'
                  : '2-Player Battle'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/15" />

          {/* Nest Eggs tracker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-300">Nest:</span>
            <div className="flex gap-1">
              {eggs.map((egg) => (
                <div
                  key={egg.id}
                  className={`w-4 h-5 rounded-full border border-black/40 transition-all ${
                    egg.state === 'nest'
                      ? 'scale-100 opacity-100 shadow-sm'
                      : 'scale-75 opacity-25 grayscale'
                  }`}
                  style={{ backgroundColor: egg.color }}
                  title={`Egg #${egg.id + 1} (${egg.state})`}
                />
              ))}
            </div>
            <span className="text-xs font-black text-white ml-0.5">{nestEggsCount}/5</span>
          </div>

          <div className="h-6 w-px bg-white/15" />

          {/* Stolen Tracker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-orange-300">Stolen:</span>
            <span className="text-xs font-black text-white bg-orange-600/60 px-1.5 py-0.5 rounded-md">
              {eggsBanked}/3
            </span>
          </div>
        </div>

        {/* Raptor Health */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-lg hidden md:flex">
          <span className="text-xs font-bold text-slate-300">Raptor:</span>
          <div className="flex gap-0.5 text-sm">
            {Array.from({ length: raptor.maxHearts }).map((_, i) => (
              <span key={i} className="transition-transform duration-200">
                {i < raptor.hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Countdown Timer */}
      {(mode === 'GUARDIAN' || mode === 'VERSUS') && (
        <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/30 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <span className="text-base sm:text-lg">⏳</span>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider leading-none">
              Time Left
            </span>
            <span
              className={`text-base sm:text-xl font-black font-mono tracking-wider tabular-nums ${
                timeLeft < 15 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      )}

      {/* Right side: Controls (Mute, Pause, Restart, Home, Fullscreen) */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume' : 'Pause'}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
        </button>

        <button
          onClick={onRestart}
          title="Restart Round"
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onHome}
          title="Return to Menu"
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/10 shadow-lg active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/10 shadow-lg active:scale-95 transition-all hidden sm:block"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
