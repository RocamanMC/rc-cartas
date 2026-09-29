import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/sound';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('cartasrc_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // If already running as an installed PWA or user dismissed it
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    sounds.playTap();
    setIsDismissed(true);
    try {
      localStorage.setItem('cartasrc_pwa_dismissed', 'true');
    } catch {}
  };

  const handleInstallClick = async () => {
    sounds.playCardFlick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // In case beforeinstallprompt hasn't fired yet or browser requires manual menu
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Sleek, responsive floating install badge for mobile & desktop */}
      <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-md animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto">
        <div className="flex items-center justify-between gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#062113]/95 border border-amber-500/60 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 p-1">
              <img src="/favicon.svg" alt="CartasRC" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-200 block truncate leading-tight">
                Instalar CartasRC en tu móvil
              </span>
              <span className="text-[10px] text-emerald-300/80 block truncate leading-tight">
                Juega a pantalla completa y sin conexión
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-emerald-300/60 hover:text-amber-200 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari & Generic Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#092b19] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-900/60">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-deck text-amber-100">
                  Instalar en Pantalla de Inicio
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-emerald-300/60 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-emerald-200/80">
              Para disfrutar de <strong>CartasRC</strong> como una aplicación nativa en tu dispositivo (pantalla completa, sin marcos de navegador y con carga instantánea):
            </p>

            <div className="space-y-3 bg-[#062113] p-3.5 rounded-xl border border-amber-900/50 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-200 block">Paso 1</span>
                  <span className="text-emerald-200/80">
                    Pulsa el botón de <strong>Compartir</strong> en la barra inferior de Safari o Chrome.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-200 block">Paso 2</span>
                  <span className="text-emerald-200/80">
                    Baja en las opciones y toca <strong>"Añadir a la pantalla de inicio"</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="font-bold text-amber-200 block">Paso 3</span>
                  <span className="text-emerald-200/80">
                    Pulsa <strong>"Añadir"</strong> arriba a la derecha. ¡Ya tendrás el icono de CartasRC en tu móvil!
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-center text-amber-200/60 font-mono">
              URL Oficial: https://cartas-rc.vercel.app/
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
