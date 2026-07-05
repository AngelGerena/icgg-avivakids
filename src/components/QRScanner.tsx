import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Camera, AlertCircle, Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

const JSQR_CDN = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';

// Load the jsQR decoder once (verified to decode our badge QR format).
const loadJsQR = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const w = window as any;
    if (w.jsQR) return resolve(w.jsQR);
    const existing = document.getElementById('jsqr-cdn') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).jsQR));
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.id = 'jsqr-cdn';
    s.src = JSQR_CDN;
    s.onload = () => resolve((window as any).jsQR);
    s.onerror = reject;
    document.body.appendChild(s);
  });

// Turn the captured photo into a bitmap, honoring EXIF orientation (iOS photos).
async function fileToBitmap(file: File): Promise<any> {
  const w = window as any;
  if (w.createImageBitmap) {
    try {
      return await w.createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (_e) {
      /* fall through */
    }
  }
  return await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function decodeAt(jsQR: any, bitmap: any, maxSide: number): any {
  const width = bitmap.width;
  const height = bitmap.height;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const cw = Math.max(1, Math.round(width * scale));
  const ch = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true } as any);
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  const img = ctx.getImageData(0, 0, cw, ch);
  return jsQR(img.data, cw, ch, { inversionAttempts: 'attemptBoth' });
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('analyzing');
    setErrMsg('');
    try {
      const jsQR = await loadJsQR();
      const bitmap = await fileToBitmap(file);
      // Try a downscaled pass (fast), then full resolution if needed.
      let code = decodeAt(jsQR, bitmap, 1600);
      if (!code || !code.data) code = decodeAt(jsQR, bitmap, Math.max(bitmap.width, bitmap.height));
      if (code && code.data) {
        onScanSuccess(code.data);
        return;
      }
      setStatus('error');
      setErrMsg('No se detectó el código QR en la foto. Vuelve a intentarlo con buena luz y el código bien centrado y enfocado, o ingresa el número abajo.');
    } catch (_err) {
      setStatus('error');
      setErrMsg('No se pudo analizar la foto. Intenta de nuevo o usa el ingreso manual abajo.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

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

        {/* Native camera capture: opens the phone camera to take a sharp photo of the
            QR, which we then decode in-app. Far more reliable than live video. */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={status === 'analyzing'}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-gradient-to-br from-kids-purple to-kids-blue text-white rounded-bubbly shadow-lg hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
        >
          {status === 'analyzing' ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin" />
              <span className="font-black text-lg">Analizando…</span>
            </>
          ) : (
            <>
              <Camera className="w-12 h-12" />
              <span className="font-black text-lg">Abrir cámara y tomar foto del QR</span>
              <span className="text-xs opacity-90 font-semibold">Enfoca el código de la tarjeta y toma la foto</span>
            </>
          )}
        </button>

        {status === 'error' && errMsg && (
          <div className="mt-3 flex items-start gap-2 bg-kids-yellow/15 border border-kids-yellow rounded-2xl p-3">
            <AlertCircle className="w-5 h-5 text-kids-coral flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 font-semibold">{errMsg}</p>
          </div>
        )}

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
