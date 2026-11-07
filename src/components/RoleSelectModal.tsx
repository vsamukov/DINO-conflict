import React, { useState } from 'react';
import { Shield, Zap, Users, Trophy, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';
import { GameDifficulty, GameMode } from '../types/game';
import { sfx } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

// Generated image assets
import coverImg from '../assets/images/dino_conflict_cover_1791623397785.jpg';
import titanImg from '../assets/images/dino_titan_portrait_1791623410160.jpg';
import raptorImg from '../assets/images/dino_raptor_portrait_1791623421101.jpg';

interface RoleSelectModalProps {
  onStartGame: (mode: GameMode, difficulty: GameDifficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('JUNIOR');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const handleSelect = (mode: GameMode) => {
    sfx.tap();
    onStartGame(mode, difficulty);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-stone-900 to-amber-950/95 border-2 border-amber-600/40 rounded-3xl shadow-2xl p-4 sm:p-7 text-white flex flex-col gap-5 overflow-hidden">
        {/* Decorative corner leaves / styling */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex justify-between items-center relative z-10 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🦖⚡🦕</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 font-display">
                DINO CONFLICT
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 font-medium">
                Giant Tail vs. The Egg Bandit · Tablet & Touch Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => {
                sfx.tap();
                setShowHowToPlay(!showHowToPlay);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Rules</span>
            </button>
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/30 text-amber-200 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* How to Play Drawer */}
        {showHowToPlay && (
          <div className="relative z-10 bg-amber-950/80 border border-amber-500/40 rounded-2xl p-4 text-xs sm:text-sm text-amber-100 flex flex-col gap-2.5 animate-fadeIn">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> How to Play & Arena Hazards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="font-bold text-emerald-300 block mb-1">🦕 Giant Mother (Defend)</span>
                Swipe anywhere to whip your giant spiky tail! Tap <strong>STOMP</strong> to stun the raptor. Protect your nest eggs for 60 seconds! Watch out for falling rocks that can daze you!
              </div>
              <div className="bg-orange-950/50 p-2.5 rounded-xl border border-orange-500/30">
                <span className="font-bold text-orange-300 block mb-1">🦖 Agile Raptor (Steal)</span>
                Use the thumbstick to run. Touch an egg to snatch it and race to the burrow. Tap <strong>DODGE</strong> to roll under swipes. If hit by the tail, you tumble away to a safe spot out of reach!
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-amber-600/30 text-amber-200">
                <span className="font-bold text-amber-400 block mb-0.5">🪨 Falling Rocks</span>
                Watch the red warning shadow! Boulders crush whoever is underneath—hitting the Raptor stuns it, while hitting the Giant dazes it and freezes its tail!
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-amber-600/30 text-amber-200">
                <span className="font-bold text-amber-400 block mb-0.5">🍫 Sticky Mud</span>
                Mud halves Raptor running speed, but also dampens and slows the Giant's tail whip when swept through!
              </div>
            </div>
          </div>
        )}

        {/* Character Role Cards (Choose your Dino!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative z-10">
          {/* Card 1: Giant Guardian */}
          <div
            onClick={() => handleSelect('GUARDIAN')}
            className="group cursor-pointer relative bg-gradient-to-b from-emerald-950/70 to-emerald-900/40 hover:to-emerald-800/60 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/30"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950">
                <img
                  src={titanImg}
                  alt="Giant Dinosaur Guardian"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <Shield className="w-3 h-3" /> DEFENDER
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-300 font-display flex items-center justify-between">
                  Giant Guardian 🦕
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Defend your 5 speckled eggs! Whip your huge spiky tail via intuitive touch swipes and unleash
                  earth-shattering stomps.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('GUARDIAN');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-black text-white text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Play as Guardian
            </button>
          </div>

          {/* Card 2: Egg Bandit */}
          <div
            onClick={() => handleSelect('BANDIT')}
            className="group cursor-pointer relative bg-gradient-to-b from-orange-950/70 to-orange-900/40 hover:to-orange-800/60 border-2 border-orange-500/40 hover:border-orange-400 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/30"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-orange-500/30 bg-orange-950">
                <img
                  src={raptorImg}
                  alt="Agile Egg Bandit Raptor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-orange-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <Zap className="w-3 h-3" /> ATTACKER
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-orange-300 font-display flex items-center justify-between">
                  Egg Bandit 🦖
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Steal 3 eggs to win! Run with virtual joystick, sneak in ferns, dodge the giant whipping tail, and haul
                  loot back to your den!
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('BANDIT');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 font-black text-white text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Play as Bandit
            </button>
          </div>

          {/* Card 3: 2-Player Tablet Battle */}
          <div
            onClick={() => handleSelect('VERSUS')}
            className="group cursor-pointer relative bg-gradient-to-b from-purple-950/70 to-indigo-900/40 hover:to-purple-800/60 border-2 border-purple-500/40 hover:border-purple-400 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/30"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-purple-500/30 bg-purple-950 flex items-center justify-center p-2">
                <img
                  src={coverImg}
                  alt="Dino Conflict Showdown"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <Users className="w-3 h-3" /> 2 PLAYERS
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-purple-300 font-display flex items-center justify-between">
                  1v1 Tablet Battle ⚔️
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Pass & play or share 1 screen! One kid controls the agile Raptor bandit, the other kid controls the
                  Giant Mother's tail!
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('VERSUS');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 font-black text-white text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              2-Player Showdown
            </button>
          </div>
        </div>

        {/* Bottom Bar: Difficulty Mode Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-amber-500/20 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-200/90 uppercase tracking-wider">
              Difficulty:
            </span>
            <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-amber-500/30">
              <button
                onClick={() => {
                  sfx.tap();
                  setDifficulty('JUNIOR');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  difficulty === 'JUNIOR'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                Junior Ranger (Kids)
              </button>
              <button
                onClick={() => {
                  sfx.tap();
                  setDifficulty('CHAMPION');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  difficulty === 'CHAMPION'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                Dino Champion (Faster)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-amber-300/70 flex items-center gap-1.5 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Optimized for touchscreens, iPads, tablets & desktop</span>
          </div>
        </div>
      </div>
    </div>
  );
};
