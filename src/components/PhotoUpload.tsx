import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, User } from 'lucide-react';

interface PhotoUploadProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  uploading?: boolean;
}

export const PhotoUpload = ({
  currentUrl,
  onUpload,
  onRemove,
  label = 'Foto',
  size = 'md',
  uploading = false,
}: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    await onUpload(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeMap[size]} group`}>
        {/* Photo circle */}
        <div
          className={`${sizeMap[size]} rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-kids-purple transition-colors`}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="animate-spin w-6 h-6 border-2 border-kids-purple border-t-transparent rounded-full" />
          ) : preview ? (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <User className={`${iconMap[size]} text-gray-300`} />
          )}
        </div>

        {/* Camera overlay on hover */}
        {!uploading && (
          <div
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Remove button */}
        {preview && !uploading && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1 text-xs font-bold text-kids-purple hover:text-kids-blue transition-colors disabled:opacity-50"
      >
        <Upload className="w-3 h-3" />
        {uploading ? 'Subiendo...' : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
