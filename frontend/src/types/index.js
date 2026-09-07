/**
 * MechMind AI - Shared domain types (JS + JSDoc version of types/index.ts from setup guide).
 * Keeps the Vite JSX build dependency-free while documenting the API contract.
 */

/**
 * @typedef {'pdf'|'docx'|'image'} FileType
 * @typedef {'processing'|'complete'|'error'} DocumentStatus
 * @typedef {'Equipment'|'Component'|'System'|'Process'} EntityType
 */

/**
 * @typedef {Object} DocumentItem
 * @property {string} id
 * @property {string} filename
 * @property {FileType} fileType
 * @property {string} uploadedAt
 * @property {DocumentStatus} status
 * @property {number} pageCount
 * @property {number} entitiesFound
 * @property {string[]} tags
 * @property {string} [equipmentType]
 * @property {string} [category]
 */

/**
 * @typedef {Object} Citation
 * @property {string} sourceDoc
 * @property {number} page
 * @property {string} excerpt
 * @property {number} confidence
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {string} timestamp
 * @property {Citation[]} [citations]
 * @property {string[]} [sourceDocuments]
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} chunkId
 * @property {string} content
 * @property {string} sourceDoc
 * @property {number} page
 * @property {number} score
 * @property {string} [sectionTitle]
 */

/**
 * @typedef {Object} Entity
 * @property {string} name
 * @property {EntityType} type
 * @property {number} frequency
 * @property {number} documentCount
 * @property {Record<string,string>} [properties]
 */

/**
 * @typedef {Object} Relationship
 * @property {string} entity1
 * @property {string} entity2
 * @property {string} type
 * @property {number} confidence
 */

/**
 * @typedef {Object} GraphNode
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {number} size
 * @property {string} color
 */

/**
 * @typedef {Object} GraphEdge
 * @property {string} source
 * @property {string} target
 * @property {string} type
 * @property {string} label
 */

/**
 * @template T
 * @typedef {Object} APIResponse
 * @property {boolean} success
 * @property {T} [data]
 * @property {string} [error]
 * @property {Record<string, any>} [metadata]
 */

export const ENTITY_COLORS = {
  Equipment: '#3b82f6',
  Component: '#a855f7',
  System: '#14b8a6',
  Process: '#ec4899',
};

export const DOCUMENT_STATUS_META = {
  complete: { label: 'Complete', tone: 'green' },
  processing: { label: 'Processing', tone: 'yellow' },
  error: { label: 'Error', tone: 'red' },
};
