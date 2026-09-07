const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, { method = 'GET', body, headers = {}, signal, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = (e) => {
    if (signal?.aborted) controller.abort(signal.reason);
  };
  signal?.addEventListener?.('abort', abort);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await parseBody(res);
    if (!res.ok) {
      const message = data?.error || data?.message || `API Error ${res.status}`;
      console.error('API Error:', { path, status: res.status, data });
      throw new Error(message);
    }
    return data;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', abort);
  }
}

const apiClient = {
  baseURL: API_BASE_URL,
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  upload: async (path, formData, { signal, timeoutMs = 120000, onProgress } = {}) => {
    // XMLHttpRequest for upload progress (fetch has no upload progress)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}${path}`);
      if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      signal?.addEventListener?.('abort', () => xhr.abort());
      const timer = setTimeout(() => xhr.abort(), timeoutMs);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => {
        clearTimeout(timer);
        try {
          const data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(new Error(data?.error || `Upload failed (${xhr.status})`));
        } catch (err) {
          reject(err);
        }
      };
      xhr.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Upload failed (network error)'));
      };
      xhr.onabort = () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      xhr.send(formData);
    });
  },
};

export default apiClient;
export { API_BASE_URL };
