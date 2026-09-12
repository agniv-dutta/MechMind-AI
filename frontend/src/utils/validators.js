export const SUPPORTED_UPLOAD_EXTENSIONS = ['.pdf', '.docx', '.doc', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.tiff'];
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export function isSupportedFile(file) {
  const name = file?.name?.toLowerCase() || '';
  return SUPPORTED_UPLOAD_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function validateUploadFiles(files) {
  const errors = [];
  for (const file of files) {
    if (!isSupportedFile(file)) errors.push(`${file.name}: unsupported file type`);
    else if (file.size > MAX_UPLOAD_BYTES) errors.push(`${file.name}: exceeds 100MB`);
  }
  return errors;
}

export function validateChatInput(text) {
  if (!text?.trim()) return 'Message cannot be empty';
  if (text.length > 8000) return 'Message exceeds 8000 characters';
  return null;
}

export function validateApiKey(key) {
  if (!key?.trim()) return 'API key is required for cloud providers';
  if (key.trim().length < 8) return 'API key looks too short';
  return null;
}
