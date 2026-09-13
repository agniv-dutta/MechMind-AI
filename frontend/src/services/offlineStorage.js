class OfflineStorage {
  constructor() {
    this.dbName = 'MechMindDB';
    this.dbVersion = 1;
    this.db = null;
  }

  isSupported() {
    return typeof indexedDB !== 'undefined';
  }

  async init() {
    if (this.db) return this.db;
    if (!this.isSupported()) return null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('searches')) {
          db.createObjectStore('searches', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('chat_history')) {
          db.createObjectStore('chat_history', { keyPath: 'id' });
        }
      };
    });
  }

  _store(name, mode) {
    return this.db.transaction([name], mode).objectStore(name);
  }

  _request(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ── documents ──────────────────────────────────────────────────────
  async saveDocument(document) {
    await this.init();
    if (!this.db) return false;
    await this._request(this._store('documents', 'readwrite').put(document));
    return true;
  }

  async saveDocuments(documents) {
    await this.init();
    if (!this.db || !Array.isArray(documents)) return false;
    const tx = this.db.transaction(['documents'], 'readwrite');
    documents.forEach((doc) => tx.objectStore('documents').put(doc));
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    return true;
  }

  async getDocuments() {
    await this.init();
    if (!this.db) return [];
    const results = [];
    const cursor = await this._request(this._store('documents', 'readonly').openCursor());
    if (cursor) {
      results.push(cursor.value);
      let next = cursor;
      while (next) {
        next = await this._request(next.continue());
        if (next) results.push(next.value);
      }
    }
    return results;
  }

  async getDocument(id) {
    await this.init();
    if (!this.db) return null;
    return this._request(this._store('documents', 'readonly').get(id));
  }

  async deleteDocument(id) {
    await this.init();
    if (!this.db) return false;
    await this._request(this._store('documents', 'readwrite').delete(id));
    return true;
  }

  // ── searches ───────────────────────────────────────────────────────
  async saveSearch(query, resultsCount) {
    await this.init();
    if (!this.db) return false;
    await this._request(
      this._store('searches', 'readwrite').add({
        query,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  }

  async getSearches() {
    await this.init();
    if (!this.db) return [];
    return this._request(this._store('searches', 'readonly').getAll());
  }

  // ── chat history ───────────────────────────────────────────────────
  async saveChat(chat) {
    await this.init();
    if (!this.db) return false;
    await this._request(this._store('chat_history', 'readwrite').put(chat));
    return true;
  }

  async getChats() {
    await this.init();
    if (!this.db) return [];
    return this._request(this._store('chat_history', 'readonly').getAll());
  }

  async clearChats() {
    await this.init();
    if (!this.db) return false;
    await this._request(this._store('chat_history', 'readwrite').clear());
    return true;
  }
}

export const offlineStorage = new OfflineStorage();