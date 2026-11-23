export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_FILE_UPLOAD_SIZE_BYTES = 2.5 * 1024 * 1024;

export function isImageUpload(file) {
  const type = file?.type || file?.mimeType || '';
  const name = file?.name || '';
  return type.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(name);
}

export function getUploadSizeLimit(file) {
  return isImageUpload(file)
    ? MAX_IMAGE_UPLOAD_SIZE_BYTES
    : MAX_FILE_UPLOAD_SIZE_BYTES;
}

export function getUploadSizeMessage(file) {
  return isImageUpload(file) ? 'Ukuran gambar maksimal 5 MB.' : 'Ukuran berkas maksimal 2,5 MB.';
}
