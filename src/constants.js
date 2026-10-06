// ==========================================================================
// Central Constants & Helpers (src/constants.js)
// ==========================================================================

export const PALETTE = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Green
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#16a34a', // Emerald
  '#ca8a04', // Yellow
  '#9333ea', // Violet
];

export const PRESETS = [
  {
    id: 'default',
    name: 'Tối giản',
    url: 'radial-gradient(circle at center, #242638 0%, #111218 100%)',
    isGradient: true,
  },
  {
    id: 'galaxy',
    name: 'Vũ trụ',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
    isGradient: false,
  },
  {
    id: 'neon',
    name: 'Neon Light',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
    isGradient: false,
  },
  {
    id: 'casino',
    name: 'Sòng bài',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1200&auto=format&fit=crop',
    isGradient: false,
  },
  {
    id: 'wood',
    name: 'Vân gỗ',
    url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=1200&auto=format&fit=crop',
    isGradient: false,
  },
  {
    id: 'sunset',
    name: 'Bầu trời sao',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    isGradient: false,
  },
];

/**
 * Tự động nén và resize ảnh về kích thước chuẩn web (max 1920x1080)
 * Giúp tránh tràn hạn mức 5MB của localStorage.
 */
export function compressImageFile(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
