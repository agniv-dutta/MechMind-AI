import apiClient from '../utils/api-client.js';

export const chatService = {
  sendMessage(message, { sessionId, equipmentContext } = {}) {
    return apiClient.post('/chat', { message, sessionId, equipmentContext });
  },
  streamMessage(message, { sessionId, onToken, onCitation, signal } = {}) {
    // SSE streaming with graceful fallback to single response when unsupported
    return apiClient.post('/chat/stream', { message, sessionId }, { signal }).then((data) => {
      if (typeof data?.content === 'string' && onToken) onToken(data.content);
      (data?.citations || []).forEach((c) => onCitation?.(c));
      return data;
    });
  },
  getHistory(sessionId) {
    return apiClient.get(`/chat/history${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`);
  },
  stopGeneration(sessionId) {
    return apiClient.post('/chat/stop', { sessionId });
  },
};

export const documentService = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiClient.get(`/documents${qs ? `?${qs}` : ''}`);
  },
  get(id) {
    return apiClient.get(`/documents/${encodeURIComponent(id)}`);
  },
  upload(file, metadata = {}, { onProgress, signal } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return apiClient.upload('/documents/upload', formData, { onProgress, signal });
  },
  remove(id) {
    return apiClient.del(`/documents/${encodeURIComponent(id)}`);
  },
  reprocess(id) {
    return apiClient.post(`/documents/${encodeURIComponent(id)}/reprocess`, {});
  },
};

export const searchService = {
  search(query, filters = {}) {
    return apiClient.post('/search', { query, ...filters });
  },
  advancedSearch(payload) {
    return apiClient.post('/search/advanced', payload);
  },
};

export const graphService = {
  query(entity, { depth = 2, types = [] } = {}) {
    return apiClient.post('/knowledge-graph/query', { entity, depth, types });
  },
  entity(name) {
    return apiClient.get(`/knowledge-graph/entity/${encodeURIComponent(name)}`);
  },
  exportGraph(format = 'json') {
    return apiClient.get(`/knowledge-graph/export?format=${encodeURIComponent(format)}`);
  },
};

export default apiClient;
