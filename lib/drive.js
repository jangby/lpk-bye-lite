import { createSign } from 'node:crypto';

const DRIVE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
let tokenCache;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  if (refreshToken) {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('GOOGLE_DRIVE_REFRESH_TOKEN memerlukan GOOGLE_DRIVE_CLIENT_ID dan GOOGLE_DRIVE_CLIENT_SECRET.');
    const response = await fetch(DRIVE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    const body = await response.json();
    if (!response.ok || !body.access_token) throw new Error(body.error_description || body.error || 'Autentikasi Google Drive OAuth gagal.');
    tokenCache = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
    return tokenCache.value;
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !privateKey) throw new Error('Konfigurasi Google Service Account belum lengkap.');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: DRIVE_TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signed = signer.sign(privateKey, 'base64url');
  const response = await fetch(DRIVE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signed}`
    })
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(body.error_description || body.error || 'Autentikasi Google Drive gagal');
  tokenCache = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return tokenCache.value;
}

export async function uploadToDrive({ base64, mimeType, fileName, folderId, publicAccess = false }) {
  if (!base64) throw new Error('Data berkas tidak tersedia.');
  if (!/^image\/(jpeg|png|gif|webp)$|^application\/pdf$/i.test(mimeType || '')) {
    throw new Error('Berkas harus JPG, PNG, GIF, WebP, atau PDF.');
  }
  const clean = String(base64).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(clean, 'base64');
  if (!buffer.length) throw new Error('Berkas kosong atau data base64 tidak valid.');
  if (buffer.length > 2.5 * 1024 * 1024) throw new Error('Ukuran berkas maksimal 2,5 MB.');

  const metadata = {
    name: String(fileName || 'berkas-lpk-bye').replace(/[^\w.-]+/g, '_').slice(0, 180),
    ...(folderId || process.env.GOOGLE_DRIVE_FOLDER_ID
      ? { parents: [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID] }
      : {})
  };
  const token = await accessToken();
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([buffer], { type: mimeType }), metadata.name);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const file = await response.json();
  if (!response.ok) throw new Error(file.error?.message || 'Unggah Google Drive gagal');
  if (publicAccess) {
    const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}/permissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
    if (!permissionResponse.ok) {
      const error = await permissionResponse.json().catch(() => ({}));
      await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch((cleanupError) => console.error('Cleaning up Drive upload after permission failure failed:', cleanupError.message));
      throw new Error(error.error?.message || 'Mengatur izin gambar publik Google Drive gagal.');
    }
  }

  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    url: publicAccess
      ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(file.id)}&sz=w1600`
      : file.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`,
    webViewLink: file.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`
  };
}
