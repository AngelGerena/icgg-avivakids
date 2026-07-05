import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

// jsQR: a robust, pure-JS QR decoder that works reliably on iOS Safari (which has
// no native barcode support). We drive the camera ourselves and decode each frame.
const JSQR_CDN = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');
  const [camError, setCamError] = useState('');
  const [starting, setStarting] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const decodedRef = useRef(false);
  const lastScanRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true } as any);

    const stopCamera = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    const tick = (ts: number) => {
      if (cancelled || decodedRef.current) return;
      const video = videoRef.current;
      const w: any = window;
      // Throttle decoding to ~12 fps to keep it smooth on phones.
      if (video && ctx && w.jsQR && video.readyState >= 2 && ts - lastScanRef.current > 80) {
        lastScanRef.current = ts;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (vw && vh) {
          canvas.width = vw;
          canvas.height = vh;
          ctx.drawImage(video, 0, 0, vw, vh);
          try {
            const img = ctx.getImageData(0, 0, vw, vh);
            const code = w.jsQR(img.data, vw, vh, { inversionAttempts: 'attemptBoth' });
            if (code && code.data) {
              decodedRef.current = true;
              stopCamera();
              onScanSuccess(code.data);
              return;
            }
          } catch (_e) {
            /* frame not ready; keep going */
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        // iOS requires these for inline autoplay without going fullscreen.
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        (video as any).playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        await video.play().catch(() => {});
        if (!cancelled) setStarting(false);
        rafRef.current = requestAnimationFrame(tick);
      } catch (_e) {
        if (!cancelled) {
          setCamError('No se pudo acceder a la cámara. Permite el acceso a la cámara o usa el ingreso manual abajo.');
          setStarting(false);
        }
      }
    };

    const loadJsQR = () => {
      const w: any = window;
      if (w.jsQR) { startCamera(); return; }
      const existing = document.getElementById('jsqr-cdn') as HTMLScriptElement | null;
      if (existing) { existing.addEventListener('load', startCamera); return; }
      const sc = document.createElement('script');
      sc.id = 'jsqr-cdn';
      sc.src = JSQR_CDN;
      sc.async = true;
      sc.onload = startCamera;
      sc.onerror = () => {
        if (!cancelled) { setCamError('No se pudo cargar el escáner. Usa el ingreso manual abajo.'); setStarting(false); }
      };
      document.body.appendChild(sc);
    };

    loadJsQR();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) onScanSuccess(manualCode.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-bubbly p-6 sm:p-8 shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl sm:text-3xl font-black text-kids-purple">Escanear QR</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Live camera — we own the <video>; jsQR reads frames via an off-DOM canvas,
            so there is no DOM conflict with React. */}
        <div className="mb-4">
          <div className="relative w-full aspect-square max-w-xs mx-auto bg-black rounded-bubbly overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            {/* Aiming frame */}
            {!starting && !camError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 h-2/3 border-4 border-white/80 rounded-2xl" />
              </div>
            )}
            {starting && !camError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 pointer-events-none">
                <Camera className="w-10 h-10 animate-pulse" />
                <span className="text-sm font-semibold">Iniciando cámara…</span>
              </div>
            )}
          </div>
          {!camError ? (
            <p className="text-center text-xs text-gray-500 font-semibold mt-2">
              Centra el código QR de la tarjeta dentro del recuadro.
            </p>
          ) : (
            <div className="mt-3 flex items-start gap-2 bg-kids-yellow/15 border border-kids-yellow rounded-2xl p-3">
              <AlertCircle className="w-5 h-5 text-kids-coral flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 font-semibold">{camError}</p>
            </div>
          )}
        </div>

        {/* Manual fallback */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">o ingresa el número</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Número del niño (ej. 0042)"
            className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-lg font-black rounded-bubbly shadow-lg flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Registrar / Buscar</span>
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};
