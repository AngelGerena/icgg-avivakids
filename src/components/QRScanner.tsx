import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Camera, CameraOff, Keyboard } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    setCameraError('');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          scanFrame();
        };
      }
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Por favor permita el acceso a la cámara en su navegador.'
          : 'No se pudo acceder a la cámara. Use el modo manual.'
      );
      setScanning(false);
      setMode('manual');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Use BarcodeDetector if available (Chrome/Android)
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      detector.detect(canvas).then((codes: any[]) => {
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          stopCamera();
          processQRValue(raw);
          return;
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }).catch(() => {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      });
    } else {
      // BarcodeDetector not available — fall back to manual
      stopCamera();
      setCameraError('Su navegador no soporta escaneo automático. Use el modo manual.');
      setMode('manual');
    }
  };

  const processQRValue = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      onScanSuccess(parsed);
    } catch {
      onScanSuccess({ childNumber: raw.trim(), type: 'child-profile' });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processQRValue(manualCode.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-bubbly shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-black text-kids-purple">Escanear QR del Niño</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex mx-6 mb-4 bg-gray-100 rounded-bubbly p-1">
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-bubbly font-bold text-sm transition-all ${
              mode === 'camera' ? 'bg-kids-purple text-white shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            Cámara
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-bubbly font-bold text-sm transition-all ${
              mode === 'manual' ? 'bg-kids-purple text-white shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {/* Camera view */}
        {mode === 'camera' && (
          <div className="mx-6 mb-6">
            {cameraError ? (
              <div className="bg-red-50 border border-red-200 rounded-bubbly p-4 text-red-600 font-semibold text-sm text-center">
                {cameraError}
              </div>
            ) : (
              <div className="relative rounded-bubbly overflow-hidden bg-black aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                    {scanning && (
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-kids-purple"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Apunte al código QR del padre/madre
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual mode */}
        {mode === 'manual' && (
          <div className="mx-6 mb-6">
            <div className="bg-gradient-to-br from-kids-blue to-kids-purple rounded-bubbly p-5 text-center text-white mb-4">
              <p className="text-sm font-bold">
                Ingrese el número de 4 dígitos del niño o pegue los datos del código QR
              </p>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej: 0042"
                autoFocus
                className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-black text-2xl text-center tracking-widest"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-lg font-black rounded-bubbly shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Buscar y Registrar Entrada
              </motion.button>
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
