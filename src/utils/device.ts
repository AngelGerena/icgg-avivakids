// QR scanning uses the device camera, which only makes sense on phones and
// tablets. On laptops/desktops the camera file-input just opens a file picker,
// so we hide the scan feature there.
export function isMobileOrTablet(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPod|iPad|Mobile|Tablet|Silk|Kindle|BlackBerry|Opera Mini|IEMobile|Windows Phone/i.test(ua)) {
    return true;
  }
  // iPadOS 13+ reports itself as "Macintosh"; detect it via multi-touch support.
  if (/Macintosh/.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}
