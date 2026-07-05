import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

const CDN = 'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js';
const REGION = 'qr-reader-region';

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');
  const [camError, setCamError] = useState('');
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef<any>(null);
  const decodedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      const w: any = window;
      if (!w.Html5Qrcode) {
        setCamError('No se pudo cargar el escáner. Usa el ingreso manual abajo.');
        setStarting(false);
        return;
      }
      try {
        const scanner = new w.Html5Qrcode(REGION, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (decodedRef.current) return;
            decodedRef.current = true;
            const stopping = scanner.stop().catch(() => {});
            Promise.resolve(stopping).finally(() => onScanSuccess(decodedText));
          },
          () => {}
        );
        if (!cancelled) setStarting(false);
      } catch (e: any) {
        if (!cancelled) {
          setCamError(
            'No se pudo acceder a la cámara. Permite el acceso a la cámara o usa el ingreso manual abajo.'
          );
          setStarting(false);
        }
      }
    };

    const loadAndStart = () => {
      const w: any = window;
      if (w.Html5Qrcode) {
        startScanner();
        return;
      }
      const existing = document.getElementById('html5qrcode-cdn') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', startScanner);
        return;
      }
      const s = document.createElement('script');
      s.id = 'html5qrcode-cdn';
      s.src = CDN;
      s.async = true;
      s.onload = startScanner;
      s.onerror = () => {
        setCamError('No se pudo cargar el escáner. Usa el ingreso manual abajo.');
        setStarting(false);
      };
      document.body.appendChild(s);
    };

    loadAndStart();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => scanner.clear()).catch(() => {});
          } else if (scanner.clear) {
            scanner.clear();
          }
        } catch {
          /* ignore */
        }
      }
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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

        {/* Live camera */}
        <div className="mb-4">
          <div
            id={REGION}
            className="w-full aspect-square max-w-xs mx-auto bg-black rounded-bubbly overflow-hidden flex items-center justify-center"
          >
            {starting && !camError && (
              <div className="text-white/80 flex flex-col items-center gap-2">
                <Camera className="w-10 h-10 animate-pulse" />
                <span className="text-sm font-semibold">Iniciando cámara…</span>
              </div>
            )}
          </div>
          {!camError ? (
            <p className="text-center text-xs text-gray-500 font-semibold mt-2">
              Apunta la cámara al código QR de la tarjeta del niño.
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
