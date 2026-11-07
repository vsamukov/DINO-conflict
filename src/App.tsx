/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine, ARENA_WIDTH, ARENA_HEIGHT } from './game/physics';
import { GameRenderer } from './game/renderer';
import { GameDifficulty, GameMode, GameState } from './types/game';
import { TouchOverlay } from './components/TouchOverlay';
import { HUD } from './components/HUD';
import { RoleSelectModal } from './components/RoleSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { sfx } from './utils/audio';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [mode, setMode] = useState<GameMode>('GUARDIAN');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('JUNIOR');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sfx.getMuted());

  // HUD sync state (updated from engine loop)
  const [hudState, setHudState] = useState({
    eggs: [] as GameEngine['eggs'],
    eggsBanked: 0,
    timeLeft: 60,
    raptor: null as GameEngine['raptor'] | null,
    raptorWhacks: 0,
    dodgeCooldownFraction: 0,
    stompCooldownFraction: 0,
    giantIsDazed: false,
    winner: null as 'GUARDIAN' | 'BANDIT' | null,
  });

  // Persistent engine & renderer references
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const raptorInputRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const touchPointerIdRef = useRef<number | null>(null);

  // Screen scale & offset for coordinate transformation
  const scaleRef = useRef<{ scale: number; offsetX: number; offsetY: number }>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Start new game
  const handleStartGame = (selectedMode: GameMode, selectedDifficulty: GameDifficulty) => {
    setMode(selectedMode);
    setDifficulty(selectedDifficulty);
    const newEngine = new GameEngine(selectedMode, selectedDifficulty);
    engineRef.current = newEngine;
    setGameState('PLAYING');
    setIsPaused(false);
  };

  // Restart current game
  const handleRestart = () => {
    if (!engineRef.current) return;
    engineRef.current = new GameEngine(mode, difficulty);
    setGameState('PLAYING');
    setIsPaused(false);
    sfx.tap();
  };

  // Return to role selection menu
  const handleHome = () => {
    setGameState('MENU');
    setIsPaused(false);
    sfx.tap();
  };

  // Sound toggle
  const handleToggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
  };

  // Pause toggle
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
    sfx.tap();
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Touch actions passed from TouchOverlay
  const handleRaptorInput = useCallback((input: { dx: number; dy: number }) => {
    raptorInputRef.current = input;
  }, []);

  const handleRaptorDodge = useCallback(() => {
    if (engineRef.current && (mode === 'BANDIT' || mode === 'VERSUS')) {
      engineRef.current.triggerRaptorDodge();
    }
  }, [mode]);

  const handleGiantStomp = useCallback(() => {
    if (engineRef.current && (mode === 'GUARDIAN' || mode === 'VERSUS')) {
      engineRef.current.triggerStomp();
    }
  }, [mode]);

  // Convert browser touch/mouse event coordinates to logical arena space
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * ARENA_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * ARENA_HEIGHT;
    return { x, y };
  };

  // Pointer event handlers on canvas for Tail Swipe
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If playing Guardian or Versus, touch swipes control the giant's tail!
    if (mode === 'GUARDIAN' || mode === 'VERSUS') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      // In VERSUS mode, only register swipes on the right 60% of arena
      if (mode === 'VERSUS' && coords.x < ARENA_WIDTH * 0.35) {
        return; // Reserved for raptor controls
      }
      touchPointerIdRef.current = e.pointerId;
      engineRef.current?.handleTailSwipe(coords.x, coords.y, true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (touchPointerIdRef.current === e.pointerId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      engineRef.current?.handleTailSwipe(coords.x, coords.y, true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (touchPointerIdRef.current === e.pointerId) {
      touchPointerIdRef.current = null;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      engineRef.current?.handleTailSwipe(coords.x, coords.y, false);
    }
  };

  // Resize canvas to fill container while keeping aspect ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Maintain 1200:800 (3:2) aspect ratio
      const targetAspect = ARENA_WIDTH / ARENA_HEIGHT;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth = containerWidth;
      let displayHeight = containerHeight;

      if (containerAspect > targetAspect) {
        // Limited by height
        displayHeight = containerHeight;
        displayWidth = containerHeight * targetAspect;
      } else {
        // Limited by width
        displayWidth = containerWidth;
        displayHeight = containerWidth / targetAspect;
      }

      // Internal resolution = fixed ARENA_WIDTH x ARENA_HEIGHT
      canvas.width = ARENA_WIDTH;
      canvas.height = ARENA_HEIGHT;

      // Set CSS display dimensions
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      scaleRef.current = {
        scale: displayWidth / ARENA_WIDTH,
        offsetX: (containerWidth - displayWidth) / 2,
        offsetY: (containerHeight - displayHeight) / 2,
      };
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer && gameState === 'PLAYING' && !isPaused) {
        // Update physics
        engine.update(dt, raptorInputRef.current);

        // Check for round conclusion
        if (engine.isGameOver) {
          setGameState('ROUND_END');
        }

        // Render scene
        ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        renderer.render(engine);

        // Sync HUD throttled
        setHudState({
          eggs: [...engine.eggs],
          eggsBanked: engine.eggsBanked,
          timeLeft: engine.roundTimeLeft,
          raptor: { ...engine.raptor },
          raptorWhacks: engine.raptorWhacks,
          dodgeCooldownFraction: engine.raptor.dodgeCooldown / engine.raptor.dodgeMaxCooldown,
          stompCooldownFraction: engine.giant.stompCooldown / engine.giant.stompMaxCooldown,
          giantIsDazed: engine.giant.isDazed,
          winner: engine.winner,
        });
      } else if (engine && renderer) {
        // Still render paused frame
        ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        renderer.render(engine);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, isPaused]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-stone-950 flex items-center justify-center overflow-hidden touch-none select-none"
    >
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="touch-none cursor-crosshair shadow-2xl rounded-lg"
      />

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && hudState.raptor && (
        <HUD
          mode={mode}
          eggs={hudState.eggs}
          eggsBanked={hudState.eggsBanked}
          timeLeft={hudState.timeLeft}
          raptor={hudState.raptor}
          isPaused={isPaused}
          isMuted={isMuted}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
          onHome={handleHome}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Paused Overlay */}
      {isPaused && gameState === 'PLAYING' && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-6 text-center text-white flex flex-col gap-4 shadow-2xl">
            <h2 className="text-2xl font-black text-amber-300 font-display">GAME PAUSED</h2>
            <div className="flex gap-3">
              <button
                onClick={handleTogglePause}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm uppercase shadow-md transition-all active:scale-95"
              >
                Resume
              </button>
              <button
                onClick={handleRestart}
                className="py-2.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm transition-all active:scale-95 border border-white/10"
              >
                Restart
              </button>
              <button
                onClick={handleHome}
                className="py-2.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm transition-all active:scale-95 border border-white/10"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tablet Touch Overlay & Controls */}
      {gameState === 'PLAYING' && !isPaused && (
        <TouchOverlay
          mode={mode}
          onRaptorInput={handleRaptorInput}
          onRaptorDodge={handleRaptorDodge}
          onGiantStomp={handleGiantStomp}
          dodgeCooldownFraction={hudState.dodgeCooldownFraction}
          stompCooldownFraction={hudState.stompCooldownFraction}
          giantIsDazed={hudState.giantIsDazed}
        />
      )}

      {/* Character Selection Modal */}
      {gameState === 'MENU' && (
        <RoleSelectModal
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'ROUND_END' && hudState.winner && (
        <GameOverModal
          winner={hudState.winner}
          mode={mode}
          eggsBanked={hudState.eggsBanked}
          raptorWhacks={hudState.raptorWhacks}
          onPlayAgain={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
