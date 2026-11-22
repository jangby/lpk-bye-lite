const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function assetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    const driveUrl = url.match(/^https?:\/\/drive\.google\.com\/uc\?([^#]+)/i);
    const sharedFile = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    const fileId = driveUrl ? new URLSearchParams(driveUrl[1]).get('id') : sharedFile?.[1];
    if (fileId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
    return url;
  }
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
