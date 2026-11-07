import React, { useState } from 'react';
import { Download, Tablet, Share, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sfx } from '../utils/audio';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'prominent';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showChromeGuide, setShowChromeGuide] = useState(false);

  // If already running standalone or installed, show quiet offline-ready badge or suppress
  if (isInstalled) {
    if (variant === 'prominent') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Installed & Offline Ready</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    sfx.tap();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Chrome/Android or Desktop where prompt hasn't triggered yet
      setShowChromeGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install app for full offline play on tablet"
        className={`flex items-center gap-2 font-bold transition-all active:scale-95 cursor-pointer ${
          variant === 'prominent'
            ? 'px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300'
            : 'px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 text-amber-200 text-xs shadow-md'
        } ${className}`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span className="font-display">Install App (Offline)</span>
      </button>

      {/* Chrome on Tablet / Android / Desktop Manual Guide Modal */}
      {showChromeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900 p-6 border-2 border-amber-500/50 text-white shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Tablet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-200 font-display">
                  Install on Tablet (Chrome)
                </h3>
                <p className="text-xs text-amber-200/70">
                  Play anywhere with zero internet or Wi-Fi needed!
                </p>
              </div>
            </div>

            <div className="bg-stone-950/80 rounded-2xl p-4 border border-white/10 text-xs sm:text-sm text-stone-200 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the Chrome menu (<strong>⋮</strong> three dots in top-right corner).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Launch from your tablet home screen in full standalone fullscreen!
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sfx.tap();
                setShowChromeGuide(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-stone-950 text-sm uppercase tracking-wider transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900 p-6 border-2 border-amber-500/50 text-white shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Share className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-200 font-display">
                  Install on iPad / Safari
                </h3>
                <p className="text-xs text-amber-200/70">
                  Add to home screen for full standalone offline play
                </p>
              </div>
            </div>

            <div className="bg-stone-950/80 rounded-2xl p-4 border border-white/10 text-xs sm:text-sm text-stone-200 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button in Safari toolbar.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Open the <strong>Dino Conflict</strong> icon on your home screen.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sfx.tap();
                setShowIOSGuide(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-stone-950 text-sm uppercase tracking-wider transition-all"
            >
              Understood!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
