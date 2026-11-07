import React, { useEffect, useRef, useState } from 'react';
import { GameMode } from '../types/game';
import { sfx } from '../utils/audio';

interface TouchOverlayProps {
  mode: GameMode;
  onRaptorInput: (input: { dx: number; dy: number }) => void;
  onRaptorDodge: () => void;
  onGiantStomp: () => void;
  dodgeCooldownFraction: number; // 0 to 1 (0 = ready)
  stompCooldownFraction: number; // 0 to 1 (0 = ready)
  giantIsDazed?: boolean;
}

export const TouchOverlay: React.FC<TouchOverlayProps> = ({
  mode,
  onRaptorInput,
  onRaptorDodge,
  onGiantStomp,
  dodgeCooldownFraction,
  stompCooldownFraction,
  giantIsDazed = false,
}) => {
  // Virtual joystick state for Raptor
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 }); // relative to base center (-1 to 1)
  const [basePos, setBasePos] = useState({ x: 120, y: 120 });
  const touchIdRef = useRef<number | null>(null);

  // Keyboard support for desktop/hybrid devices
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateKeyboard = () => {
      let dx = 0;
      let dy = 0;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) dy -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) dy += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) dx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) dx += 1;
      onRaptorInput({ dx, dy });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keysDown.add(e.code);
        updateKeyboard();
      }
      if (e.code === 'Space') {
        if (mode === 'BANDIT' || mode === 'VERSUS') {
          onRaptorDodge();
        }
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        if (mode === 'GUARDIAN' || mode === 'VERSUS') {
          onGiantStomp();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysDown.has(e.code)) {
        keysDown.delete(e.code);
        updateKeyboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, onRaptorInput, onRaptorDodge, onGiantStomp]);

  // Touch handlers for virtual joystick
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setBasePos({ x: centerX, y: centerY });
    setJoystickActive(true);
    handleJoystickMove(touch.clientX, touch.clientY, centerX, centerY);
  };

  const handleJoystickMove = (clientX: number, clientY: number, centerX: number, centerY: number) => {
    const maxRadius = 45;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) {
      setStickPos({ x: 0, y: 0 });
      onRaptorInput({ dx: 0, dy: 0 });
      return;
    }

    const clampedDist = Math.min(dist, maxRadius);
    const normX = dx / dist;
    const normY = dy / dist;

    setStickPos({ x: normX * (clampedDist / maxRadius), y: normY * (clampedDist / maxRadius) });
    onRaptorInput({ dx: normX * (clampedDist / maxRadius), dy: normY * (clampedDist / maxRadius) });
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        handleJoystickMove(touch.clientX, touch.clientY, basePos.x, basePos.y);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setStickPos({ x: 0, y: 0 });
        onRaptorInput({ dx: 0, dy: 0 });
        break;
      }
    }
  };

  const showRaptorControls = mode === 'BANDIT' || mode === 'VERSUS';
  const showGiantControls = mode === 'GUARDIAN' || mode === 'VERSUS';

  const dodgeReady = dodgeCooldownFraction <= 0;
  const stompReady = stompCooldownFraction <= 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top instruction hints */}
      <div className="flex justify-between items-start pointer-events-none text-xs sm:text-sm font-semibold text-amber-200/80 drop-shadow">
        {mode === 'GUARDIAN' && (
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
            🖐️ Swipe screen to whip tail!
          </div>
        )}
        {mode === 'BANDIT' && (
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
            🏃 Sneak into nest, grab egg & run to burrow!
          </div>
        )}
        {mode === 'VERSUS' && (
          <>
            <div className="bg-orange-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-300">
              P1 (Bandit): Joystick + Dodge
            </div>
            <div className="bg-emerald-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300">
              P2 (Guardian): Swipe Tail + Stomp
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex justify-between items-end w-full pointer-events-none">
        {/* Left Side: Raptor Virtual Joystick (Bandit or Versus) */}
        {showRaptorControls ? (
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            <div
              onTouchStart={handleJoystickTouchStart}
              onTouchMove={handleJoystickTouchMove}
              onTouchEnd={handleJoystickTouchEnd}
              onTouchCancel={handleJoystickTouchEnd}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-900/40 backdrop-blur-md border-2 border-orange-400/40 flex items-center justify-center shadow-lg active:border-orange-400 touch-none"
            >
              {/* Center stick knob */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs transition-transform ${
                  joystickActive ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  transform: `translate(${stickPos.x * 40}px, ${stickPos.y * 40}px)`,
                }}
              >
                <span>RUN</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-orange-300/80 uppercase tracking-wider">
              Thumbstick / WASD
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Raptor Dodge Button (Bandit or Versus) */}
          {showRaptorControls && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (dodgeReady) {
                    onRaptorDodge();
                    sfx.tap();
                  }
                }}
                disabled={!dodgeReady}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-xl transition-all active:scale-95 border-2 ${
                  dodgeReady
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 hover:brightness-110 shadow-cyan-500/30'
                    : 'bg-slate-800/80 border-slate-700 opacity-60 text-slate-400'
                }`}
              >
                {/* Cooldown Ring */}
                {!dodgeReady && (
                  <div
                    className="absolute inset-0 rounded-2xl bg-black/50 overflow-hidden flex items-end"
                  >
                    <div
                      className="w-full bg-cyan-600/40 transition-all duration-100"
                      style={{ height: `${dodgeCooldownFraction * 100}%` }}
                    />
                  </div>
                )}
                <span className="text-2xl sm:text-3xl relative z-10">💨</span>
                <span className="text-xs sm:text-sm font-black relative z-10 font-display">
                  {dodgeReady ? 'DODGE!' : 'READYING'}
                </span>
                <span className="text-[10px] text-cyan-200/90 relative z-10 font-normal">
                  [SPACE]
                </span>
              </button>
            </div>
          )}

          {/* Giant Stomp Button (Guardian or Versus) */}
          {showGiantControls && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => {
                  if (stompReady && !giantIsDazed) {
                    onGiantStomp();
                    sfx.tap();
                  }
                }}
                disabled={!stompReady || giantIsDazed}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-xl transition-all active:scale-95 border-2 ${
                  giantIsDazed
                    ? 'bg-amber-950/80 border-amber-600/60 opacity-80 text-amber-200'
                    : stompReady
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 hover:brightness-110 shadow-amber-500/30'
                    : 'bg-slate-800/80 border-slate-700 opacity-60 text-slate-400'
                }`}
              >
                {/* Cooldown Ring */}
                {!stompReady && !giantIsDazed && (
                  <div
                    className="absolute inset-0 rounded-2xl bg-black/50 overflow-hidden flex items-end"
                  >
                    <div
                      className="w-full bg-amber-600/40 transition-all duration-100"
                      style={{ height: `${stompCooldownFraction * 100}%` }}
                    />
                  </div>
                )}
                <span className="text-2xl sm:text-3xl relative z-10">
                  {giantIsDazed ? '💫' : '💥'}
                </span>
                <span className="text-xs sm:text-sm font-black relative z-10 font-display">
                  {giantIsDazed ? 'DIZZY!' : stompReady ? 'STOMP!' : 'CHARGING'}
                </span>
                <span className="text-[10px] text-amber-200/90 relative z-10 font-normal">
                  [ENTER]
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
