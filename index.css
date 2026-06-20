import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      try {
        const data = JSON.parse(manualCode);
        onScanSuccess(data);
      } catch {
        const data = {
          childNumber: manualCode,
          type: 'child-profile',
        };
        onScanSuccess(data);
      }
    }
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
        className="bg-white rounded-bubbly p-8 shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-kids-purple">Escanear QR</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-br from-kids-blue to-kids-purple rounded-bubbly p-8 text-center text-white">
            <p className="text-lg font-bold mb-2">
              Ingrese el número del niño o los datos del código QR
            </p>
            <p className="text-sm opacity-90">
              Puede escribir el número de 4 dígitos o pegar los datos del QR
            </p>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Número o Datos QR
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="0001 o datos JSON"
              className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-xl font-black rounded-bubbly shadow-lg flex items-center justify-center space-x-2"
          >
            <Search className="w-6 h-6" />
            <span>Buscar Perfil</span>
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};
