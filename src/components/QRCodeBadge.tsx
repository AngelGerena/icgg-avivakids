import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface QRCodeBadgeProps {
  childName: string;
  childNumber: string;
  childId: string;
}

export const QRCodeBadge = ({ childName, childNumber, childId }: QRCodeBadgeProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  const downloadBadge = () => {
    if (!badgeRef.current) return;

    const svg = badgeRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 50);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#4FC3F7');
    gradient.addColorStop(1, '#CE93D8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Baloo 2';
    ctx.textAlign = 'center';
    ctx.fillText('Ministerio de Niños', canvas.width / 2, 30);

    ctx.fillStyle = '#CE93D8';
    ctx.font = 'bold 28px Baloo 2';
    ctx.fillText(childName, canvas.width / 2, 100);

    ctx.fillStyle = '#4FC3F7';
    ctx.font = 'bold 48px Baloo 2';
    ctx.fillText(childNumber, canvas.width / 2, 160);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 50, 190, 300, 300);

      ctx.strokeStyle = '#CE93D8';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `badge-${childNumber}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const qrData = JSON.stringify({
    childId,
    childNumber,
    childName,
    type: 'child-profile',
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        ref={badgeRef}
        className="bg-white rounded-bubbly p-6 shadow-2xl border-4 border-kids-purple"
        style={{ width: '320px' }}
      >
        <div className="bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-purple p-4 rounded-bubbly mb-4">
          <h3 className="text-white text-center font-black text-lg">
            Ministerio de Niños
          </h3>
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl font-black text-kids-purple mb-2">
            {childName}
          </div>
          <div className="text-4xl font-black text-kids-blue">{childNumber}</div>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#CE93D8"
          />
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 font-semibold">
          Escanea para ver perfil completo
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={downloadBadge}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-kids-mint to-kids-blue text-white rounded-bubbly font-bold shadow-lg"
      >
        <Download className="w-5 h-5" />
        <span>Descargar Tarjeta</span>
      </motion.button>
    </div>
  );
};
