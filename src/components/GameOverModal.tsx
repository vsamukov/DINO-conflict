import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Star, Shield, Zap } from 'lucide-react';
import { GameMode } from '../types/game';
import { sfx } from '../utils/audio';

interface GameOverModalProps {
  winner: 'GUARDIAN' | 'BANDIT';
  mode: GameMode;
  eggsBanked: number;
  raptorWhacks: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  mode,
  eggsBanked,
  raptorWhacks,
  onPlayAgain,
  onHome,
}) => {
  const isPlayerWinner =
    (mode === 'GUARDIAN' && winner === 'GUARDIAN') ||
    (mode === 'BANDIT' && winner === 'BANDIT') ||
    mode === 'VERSUS';

  useEffect(() => {
    if (isPlayerWinner) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#34d399', '#f43f5e'],
      });
    }
  }, [isPlayerWinner]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center text-center gap-4">
        {/* Glow backdrop */}
        <div className="absolute -top-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Winner Icon Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 flex items-center justify-center shadow-xl shadow-amber-500/20 transform hover:scale-105 transition-transform">
          <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center text-4xl sm:text-5xl">
            {winner === 'GUARDIAN' ? '🦕' : '🦖'}
          </div>
        </div>

        {/* Victory/Defeat Title */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-display">
            {mode === 'VERSUS'
              ? 'Match Decided!'
              : isPlayerWinner
              ? 'Victory!'
              : 'Round Over!'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-200 font-display mt-0.5">
            {winner === 'GUARDIAN'
              ? 'The Nest is Saved!'
              : 'The Eggs are Stolen!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
            {winner === 'GUARDIAN'
              ? 'Mother Titan’s massive tail kept the nest safe and sent the egg bandit packing!'
              : 'Pip the agile Raptor snuck through the ferns and escaped with 3 delicious dinosaur eggs!'}
          </p>
        </div>

        {/* Star Rating for Kids */}
        <div className="flex gap-2 text-2xl text-amber-400 my-1">
          <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-bounce" />
          <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-bounce [animation-delay:150ms]" />
          <Star
            className={`w-7 h-7 ${
              isPlayerWinner
                ? 'fill-amber-400 text-amber-500 animate-bounce [animation-delay:300ms]'
                : 'text-stone-600'
            }`}
          />
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-xs font-medium">
          <div className="bg-stone-900/80 p-3 rounded-2xl border border-white/10 flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">Eggs Stolen</span>
            <span className="text-lg font-black text-amber-300 font-mono mt-0.5">
              {eggsBanked} / 3
            </span>
          </div>
          <div className="bg-stone-900/80 p-3 rounded-2xl border border-white/10 flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">Tail Whacks Landed</span>
            <span className="text-lg font-black text-amber-300 font-mono mt-0.5">
              {raptorWhacks}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-2">
          <button
            onClick={() => {
              sfx.tap();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 font-black text-stone-950 text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={() => {
              sfx.tap();
              onHome();
            }}
            className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-slate-200 text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/10"
          >
            <Home className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
