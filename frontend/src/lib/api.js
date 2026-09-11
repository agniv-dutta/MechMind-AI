const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  if (!res.ok) {
    const err = new Error(typeof data === 'object' && data && data.detail ? data.detail : `HTTP ${res.status}`);
    err.status = res.status;
    err.detail = typeof data === 'object' && data ? data.detail : data;
    throw err;
  }
  return data;
}

export function getHealth() {
  return request('/api/health');
}

export function getHealthDetailed() {
  return request('/api/health/detailed');
}

export function listDocuments({ skip = 0, limit = 50 } = {}) {
  return request(`/api/documents?skip=${skip}&limit=${limit}`);
}

export function getDocument(id) {
  return request(`/api/documents/${encodeURIComponent(id)}`);
}

export function getDocumentPage(id, page) {
  return request(`/api/documents/${encodeURIComponent(id)}/pages/${page}`);
}

export function uploadDocument({ file, category, equipmentType, version, tags = [], onProgress } = {}) {
  const form = new FormData();
  form.append('file', file);
  if (category) form.append('category', category);
  if (equipmentType) form.append('equipment_type', equipmentType);
  if (version) form.append('version', version);
  if (tags && tags.length) form.append('tags', tags.join(','));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/api/documents/upload`);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ...data, statusCode: xhr.status, _wasDuplicate: data.message && /duplicate/i.test(data.message) });
      } else {
        const err = new Error(data.detail || `HTTP ${xhr.status}`);
        err.status = xhr.status;
        err.detail = data.detail;
        reject(err);
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.send(form);
  });
}

export function deleteDocument(id) {
  return request(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function chat({ query, conversationHistory = [], filters, searchMode = 'hybrid', model, sessionId } = {}) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      query,
      conversation_history: conversationHistory.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content.join('\n'),
        timestamp: m.timestamp || new Date().toISOString(),
      })),
      filters,
      search_mode: searchMode,
      model,
      session_id: sessionId,
    }),
  });
}

export function chatStream(
  { query, conversationHistory = [], filters, searchMode = 'hybrid', model, sessionId } = {},
  { onMetadata, onToken, onDone, onError, signal } = {}
) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        conversation_history: (conversationHistory || []).map((m) => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : m.content.join('\n'),
          timestamp: m.timestamp || new Date().toISOString(),
        })),
        filters,
        search_mode: searchMode,
        model,
        session_id: sessionId,
      }),
      signal,
    })
      .then((res) => {
        if (!res.ok || !res.body) {
          throw new Error(`Stream request failed: HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const pump = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (onDone) onDone();
              resolve();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buffer.indexOf('\n\n')) !== -1) {
              const raw = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);
              const line = raw.split('\n').find((l) => l.startsWith('data: '));
              if (!line) continue;
              let event;
              try { event = JSON.parse(line.replace(/^data:\s*/, '')); } catch { continue; }
              if (event.type === 'metadata' && onMetadata) {
                onMetadata(event);
              } else if (event.type === 'token' && onToken) {
                onToken(event.content || '');
              } else if (event.type === 'sources' && onMetadata) {
                onMetadata({ sources: event.sources || [], sources_used: event.sources_used || [] });
              } else if (event.type === 'error') {
                if (onError) onError(event.content || 'Stream error');
                reject(new Error(event.content || 'Stream error'));
                return;
              } else if (event.type === 'done' && onDone) {
                onDone(event);
              }
            }
            pump();
          }).catch((e) => {
            if (e.name === 'AbortError') { reject(e); return; }
            if (onError) onError(e.message);
            reject(e);
          });
        };
        pump();
      })
      .catch((e) => {
        if (onError) onError(e.message || 'Stream request failed');
        reject(e);
      });
  });
}

export function search({ q, searchMode = 'hybrid', k = 10, minScore, documentIds = [] } = {}) {
  const params = new URLSearchParams({ q, search_mode: searchMode, k });
  if (minScore !== undefined && minScore !== null) params.append('min_score', minScore);
  if (documentIds && documentIds.length) params.append('document_ids', documentIds.join(','));
  return request(`/api/search?${params.toString()}`);
}

export function advancedSearch({ query, filters = {}, searchMode = 'hybrid', k = 10 } = {}) {
  return request('/api/search/advanced', {
    method: 'POST',
    body: JSON.stringify({
      query,
      filters: {
        document_ids: filters.documentIds || filters.document_ids,
        equipment_types: filters.equipmentTypes || filters.equipment_types,
        categories: filters.categories,
        confidence_min: filters.confidenceMin !== undefined ? filters.confidenceMin / 100 : undefined,
      },
      search_mode: searchMode,
      k,
    }),
  });
}

export function getKGEntities({ type, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);
  const qs = params.toString();
  return request(`/api/knowledge-graph/entities${qs ? `?${qs}` : ''}`);
}

export function getKGVisualization() {
  return request('/api/knowledge-graph/visualization');
}

export function getKGStatistics() {
  return request('/api/knowledge-graph/statistics');
}

export function getKGEntity(name) {
  return request(`/api/knowledge-graph/entities/${encodeURIComponent(name)}`);
}

export function getKGPaths(startEntity, endEntity, maxDepth = 3) {
  return request(`/api/knowledge-graph/paths?start_entity=${encodeURIComponent(startEntity)}&end_entity=${encodeURIComponent(endEntity)}&max_depth=${maxDepth}`);
}

export function getAIConfig() {
  return request('/api/ai/config');
}

export function getAIModels() {
  return request('/api/ai/models');
}

export function updateAIConfig(payload) {
  return request('/api/ai/config', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function testAIConnection(model) {
  try {
    return await request('/api/ai/test', {
      method: 'POST',
      body: JSON.stringify(model ? { model } : {}),
    });
  } catch (err) {
    return { success: false, message: err.detail || err.message };
  }
}

export function getSearchConfig() {
  return request('/api/search/config');
}

export function updateSearchConfig(config) {
  return request('/api/search/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export function quickFix({ equipmentType, symptom }) {
  return request('/api/field/quick-fix', {
    method: 'POST',
    body: JSON.stringify({ equipment_type: equipmentType, symptom }),
  });
}

export function getOfflinePackUrl() {
  return `${BASE_URL}/api/field/offline-pack`;
}

export function getDashboardMetrics() {
  return request('/api/analytics/dashboard').then((r) => r.data);
}

export function getAnalyticsTimeline(days = 30) {
  return request(`/api/analytics/timeline?days=${days}`).then((r) => r.data);
}

export function getEquipmentTypes() {
  return request('/api/analytics/equipment-types').then((r) => r.data);
}