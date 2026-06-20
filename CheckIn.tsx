import { supabase } from '../lib/supabase';

/**
 * Compress and resize an image file to thumbnail size
 * Max 400x400px, JPEG quality 75%, max ~80KB
 */
export const compressImage = (file: File, maxSize = 400, quality = 0.75): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down to maxSize maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => { if (blob) resolve(blob); else reject(new Error('Compression failed')); },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a compressed photo to Supabase Storage
 * Returns the public URL or null on error
 */
export const uploadPhoto = async (
  file: File,
  bucket: 'child-photos' | 'parent-photos',
  path: string
): Promise<string | null> => {
  try {
    const compressed = await compressImage(file);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, compressed, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.error('Photo upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('Photo compression/upload error:', err);
    return null;
  }
};

/**
 * Delete a photo from Supabase Storage
 */
export const deletePhoto = async (
  bucket: 'child-photos' | 'parent-photos',
  path: string
): Promise<void> => {
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.error('Photo delete error:', err);
  }
};
