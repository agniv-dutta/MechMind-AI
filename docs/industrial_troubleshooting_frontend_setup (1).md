# Industrial Troubleshooting AI Assistant - Frontend Setup Guide

## Frontend Architecture Overview

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── SearchPanel.tsx
│   │   ├── KnowledgeGraphView.tsx
│   │   ├── CitationViewer.tsx
│   │   ├── DocumentBrowser.tsx
│   │   └── TroubleshootingWizard.tsx
│   ├── pages/
│   │   ├── ChatPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── FieldAssistancePage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── chatService.ts
│   │   ├── documentService.ts
│   │   ├── searchService.ts
│   │   └── graphService.ts
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useDocuments.ts
│   │   ├── useSearch.ts
│   │   └── useGraph.ts
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── ChatContext.tsx
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── styles/
│   │   ├── theme.css
│   │   ├── variables.css
│   │   └── responsive.css
│   └── types/
│       └── index.ts
├── package.json
└── vite.config.ts
```

---

# PART 1: GOOGLE STITCH FRAME GENERATION PROMPTS

## Prompt 1: Main Dashboard & Chat Interface Frames

**USE THIS PROMPT IN GOOGLE STITCH DESIGN TOOL**

```
Create a modern, professional UI design for an Industrial Troubleshooting AI Assistant 
with the following frames:

PROJECT SPECIFICATIONS:
- Target Users: Industrial maintenance engineers and technicians
- Color Scheme: 
  * Primary: Deep Navy Blue (#1a237e)
  * Secondary: Vibrant Teal (#00897b)
  * Accent: Warm Orange (#ff6f00)
  * Neutral: Light Gray (#f5f5f5)
  * Text: Dark Gray (#212121)
  * Success: Green (#4caf50)
  * Warning: Red (#f44336)
- Typography: Inter or Roboto (sans-serif) for clarity
- Grid: 8px spacing system
- Icons: Use Material Design or industrial equipment icons
- Spacing: Generous padding (16px minimum) for readability

FRAME 1: MAIN DASHBOARD / CHAT INTERFACE (Desktop - 1920x1080)
Components:
1. Top Navigation Bar (Height: 64px)
   - Logo on left (company/product branding)
   - Title: "Industrial Troubleshooting Assistant"
   - Search icon (link to search page)
   - User menu with settings/logout
   - Toggle for dark/light mode
   - Styling: Navy blue background with white text, subtle bottom shadow

2. Left Sidebar (Width: 280px)
   - Navigation menu with icons:
     * Dashboard (home icon)
     * Chat (message icon)
     * Documents (document icon)
     * Search (search icon)
     * Knowledge Graph (network icon)
     * Field Assistance (mobile/field icon)
     * Settings (gear icon)
   - Active state indicator (teal left border)
   - Hover effects (light gray background)
   - Collapsible on mobile

3. Main Content Area
   a) Chat Interface Section (Left: 60% of remaining space)
      - Title: "Chat with AI Assistant"
      - Message history area:
        * User messages: Right-aligned, teal bubble
        * AI messages: Left-aligned, gray bubble
        * Timestamp for each message
        * Show "thinking..." indicator while processing
        * Display citations inline as expandable popups
      - Input area at bottom:
        * Large text input field (4 lines tall)
        * "Attach documents" button (paperclip icon)
        * "Send" button (arrow icon, teal background)
        * Character count indicator
        * Suggestion pills below input (quick queries)
   
   b) Context Sidebar (Right: 40% of remaining space)
      - Tab 1: Sources & Citations
        * List of documents used in current answer
        * Citation cards showing: document name, page, snippet
        * Confidence score bar (0-100%)
        * "View in document" link
      - Tab 2: Equipment Context
        * Related equipment entities from knowledge graph
        * Entity cards with properties
        * Related procedures/manuals
      - Tab 3: Message History
        * Expand/collapse previous messages
        * Search within conversation

FRAME 2: CHAT INTERFACE - STREAMING RESPONSE (Desktop - 1920x1080)
Show state while AI is generating response:
- Chat messages area with:
  * User query at top
  * AI response appearing character-by-character
  * Citations appearing as response generates
  * Loading spinner/animation
  * "Stop generation" button
- Sources sidebar showing:
  * "Retrieving relevant documents..." with progress
  * Found documents list updating
  * Confidence scores updating

FRAME 3: CHAT INTERFACE - MOBILE (Mobile - 375x812)
- Full-width chat interface
- Sidebar hidden (hamburger menu in header)
- Input field: full width at bottom
- Message bubbles: full width with padding
- Sources panel: stacked below chat (collapsible)
- Touch-friendly: larger tap targets

FRAME 4: DOCUMENT UPLOAD FLOW (Desktop Modal - 500x600)
- Modal title: "Upload Technical Documentation"
- Drop zone area:
  * Large drop target with dashed border
  * Upload icon in center
  * Text: "Drag files here or click to select"
  * Supported formats: PDF, DOCX, PNG, JPG, TIFF
- File list below:
  * Each file: thumbnail/type icon, filename, size, progress bar
  * Remove button (X) for each file
- Metadata form:
  * Dropdown: Equipment Type (Pump, Motor, Valve, etc.)
  * Dropdown: Category (Manual, Procedure, Wiring Diagram, etc.)
  * Text input: Version/Date
  * Tag input: Add tags
- Buttons:
  * "Upload" (teal, primary)
  * "Cancel" (gray, secondary)
- Processing status:
  * Show "Processing 2 of 5 documents"
  * Overall progress bar
  * Success/error states for each document

FRAME 5: QUICK TROUBLESHOOTING WIZARD (Desktop - 1920x1080)
Modal overlay with step-by-step troubleshooting:
- Step indicator: "Step 1 of 5"
- Equipment type selection:
  * Large cards with equipment icons
  * Card options: Pump, Motor, Valve, Compressor, PLC, Electrical, etc.
- Problem symptom selection:
  * Searchable list of common symptoms
  * Icons for each symptom
- Severity selector:
  * Radio buttons: Critical, High, Medium, Low
  * Description for each severity level
- Action buttons:
  * "Back" button (gray)
  * "Next" button (teal)
  * "Generate Quick Fix" button (orange)

FRAME 6: SEARCH RESULTS PAGE (Desktop - 1920x1080)
- Search bar at top with filter options
- Filter panel (left sidebar):
  * Equipment type checkboxes
  * Date range picker
  * Document type filter
  * Confidence score slider
  * Expand/collapse filters
- Results area (main):
  * Search query display: "Results for: pump cavitation"
  * Results count: "Found 47 results"
  * Sort by: Relevance, Date, Equipment Type
  * Each result card contains:
    - Snippet of text (with query highlighted)
    - Source document name
    - Page number
    - Relevance score (percentage bar)
    - Equipment tag
    - Date
    - "View in document" and "Use in chat" buttons

Styling Notes:
- All buttons should be 12px border-radius
- Cards should have subtle shadow (0 2px 4px rgba(0,0,0,0.1))
- Hover states: 0 4px 8px rgba(0,0,0,0.15)
- Input fields: 1px solid border, light gray background on hover
- Focus states: 2px solid teal outline
- Animations: 200ms ease-in-out for transitions
```

---

## Prompt 2: Document Management & Knowledge Graph Frames

**USE THIS PROMPT IN GOOGLE STITCH DESIGN TOOL**

```
Create design frames for document management and knowledge graph visualization:

FRAME 1: DOCUMENT MANAGEMENT PAGE (Desktop - 1920x1080)
- Header: "Technical Documentation Library"
- Toolbar:
  * Search documents input field
  * Filter button with dropdown
  * Sort dropdown (Date, Name, Type)
  * View toggle (Grid/List view)
  * Upload button (teal)
- Document grid (card view):
  * Each card contains:
    - Document type icon (PDF, DOCX, Image)
    - Document thumbnail/preview
    - Document name/title
    - Meta info: Date uploaded, file size
    - Equipment tags (Pills with different colors)
    - Status badge (Processing, Complete, Error)
    - Action menu (three dots dropdown):
      * View
      * Download
      * Delete
      * Manage tags
      * View related entities
  * Card dimensions: ~280x380px
  * Hover effect: Elevated shadow, slight scale up
  * Click: Opens document detail view
- Empty state (when no docs):
  * Large upload icon
  * Message: "No documents uploaded yet"
  * "Upload your first document" button

FRAME 2: DOCUMENT DETAIL VIEW (Desktop - 1920x1080)
- Header with back button and document title
- Two-column layout:
  a) Left side (60%): Document preview/content
     - Document thumbnail/preview
     - Page carousel (if multi-page PDF)
     - Text extraction preview
     - OCR status if scanned document
     - Zoom controls
  b) Right side (40%): Document metadata & analysis
     - Document info:
       * Filename, type, size, upload date
       * Equipment type, category, version
       * Tags (editable)
     - Processing status:
       * Pages processed: "42 / 50 pages"
       * Progress bar
       * Entities found: "156 equipment items, 324 relationships"
     - Extracted entities:
       * Tab 1: Equipment (list of equipment names)
       * Tab 2: Components (list of components)
       * Tab 3: Procedures (list of procedures)
       * Each entity clickable -> shows in knowledge graph
     - Related documents:
       * List of cross-referenced documents
       * "View related" link
     - Actions:
       * Re-process button
       * Download processed data
       * Delete document

FRAME 3: KNOWLEDGE GRAPH VISUALIZATION (Desktop - 1920x1080)
- Header: "Knowledge Graph - Equipment Relationships"
- Control panel (top):
  * Search entity input field
  * Filter by entity type (Equipment/Component/System)
  * Filter by relationship type
  * Depth slider (1-5 levels)
  * Reset view button
  * Export button
  * Legend toggle
- Main visualization area:
  * Interactive force-directed graph showing:
    - Nodes (circles) representing entities
      * Node colors by type: blue=Equipment, green=Component, orange=System
      * Node size by frequency/importance
      * Label on or near node
    - Edges (lines) representing relationships
      * Edge color by relationship type
      * Labels on edges (relationship name)
      * Thicker lines = stronger relationships
    - Hovering on node: highlight connected nodes/edges
    - Clicking on node: show entity details in sidebar
    - Dragging nodes: reorganize graph
    - Zoom/pan controls (+ - buttons or scroll wheel)
- Right sidebar (triggered on node click):
  * Entity details:
    - Entity name and type
    - Entity properties (table format)
    - Related equipment
    - Procedures involving this entity
    - Source documents mentioning this entity
  * Close button (X)

FRAME 4: ADVANCED SEARCH PAGE (Desktop - 1920x1080)
- Header: "Advanced Search"
- Search bar with options:
  * Main query input field
  * "Advanced options" toggle (expands filters)
- Advanced filters (when expanded):
  * Equipment type multi-select dropdown
  * Document type multi-select
  * Date range picker (from/to)
  * Confidence score slider (0-100%)
  * Search mode radio buttons:
    - Semantic (AI-powered similarity)
    - Keyword (exact match)
    - Hybrid (both)
  * Apply filters button
  * Clear filters button (gray)
- Results section:
  * Same as search results frame (see Prompt 1)
  * With highlighting for selected filters

FRAME 5: FIELD ASSISTANCE MOBILE VIEW (Mobile - 375x812)
- Simplified interface for field technicians
- Large header: "Quick Troubleshooting"
- Main content area:
  * Quick symptom selector:
    - Large cards with symptom icons and names
    - Scrollable horizontally
  * Quick problem solver:
    - Input: "What's wrong?"
    - Camera icon: Take photo of equipment
    - Symptom selector
  * Quick actions:
    - "View offline manual" (for downloaded docs)
    - "Call support" (phone icon)
    - "Share findings" (share icon)
- Response area:
  * Large, readable text (16px+)
  * Step numbers clearly visible
  * Safety warnings in red boxes
  * Equipment photos/diagrams when available
  * Simplified citations (document name + page)

FRAME 6: KNOWLEDGE GRAPH - TABLE VIEW (Desktop - 1920x1080)
Alternative to graph visualization - table format:
- Header: "Equipment & Relationships"
- Tabs:
  * Entities tab (active)
  * Relationships tab
- Entities tab content:
  * Table with columns: Name | Type | Frequency | Related Items | Documents | Actions
  * Sortable columns
  * Searchable within table
  * Row expansion: click row to see details
  * Each row: entity name as link (show details in modal)
- Relationships tab content:
  * Table with columns: Entity 1 | Relationship | Entity 2 | Confidence | Sources
  * Filterable by relationship type
  * Each row clickable to highlight in graph view

Styling Notes:
- Cards use consistent 8px border-radius
- Large readable fonts in document preview
- Color coding: entity type uses consistent colors across all frames
- Status badges: Processing (yellow), Complete (green), Error (red)
- Tag pills: different colors for different equipment types
- Accessibility: sufficient color contrast, keyboard navigation support
- Mobile: touch-friendly buttons (min 48x48px), full-width elements
```

---

## Prompt 3: Settings, Help & Admin Frames

**USE THIS PROMPT IN GOOGLE STITCH DESIGN TOOL**

```
Create design frames for settings, help, and admin interfaces:

FRAME 1: SETTINGS PAGE (Desktop - 1920x1080)
- Header: "Settings"
- Left sidebar (narrow): Settings categories
  * General
  * AI Model Configuration
  * Search Settings
  * Data & Privacy
  * Integrations
  * About
- Right panel: Settings content (responsive to selection)

a) General Settings:
   * Theme selector: Light / Dark / System
   * Language selector: English, Spanish, German, etc.
   * Notifications toggle (enable/disable)
   * Auto-save toggle
   * Default search mode (Semantic/Keyword/Hybrid)

b) AI Model Configuration:
   * LLM Provider selector (dropdown):
     - Ollama (local)
     - OpenAI
     - Anthropic Claude
   * Model selector (based on provider)
   * Temperature slider (0.0 - 1.0) with description
   * Max response tokens slider
   * Citation confidence threshold slider
   * API key input (for cloud providers, hidden by default)
   * "Test connection" button
   * Status indicator (green checkmark if connected)

c) Search Settings:
   * Embedding model selector
   * Hybrid search weights:
     - Semantic weight slider
     - Keyword weight slider
   * Min confidence score slider
   * Max results per query slider
   * Enable query expansion toggle
   * Cache search results toggle

d) Data & Privacy:
   * Export user data button
   * Delete chat history button
   * Clear embeddings cache button
   * Privacy policy link
   * Terms of service link
   * GDPR compliance info

All settings:
- Save button (teal, bottom right)
- Reset button (gray)
- Unsaved changes indicator

FRAME 2: HELP & DOCUMENTATION (Desktop - 1920x1080)
- Header: "Help & Documentation"
- Left sidebar: Help topics (collapsible sections)
  * Getting Started
  * Chat Interface Guide
  * Document Upload Guide
  * Search Guide
  * Knowledge Graph Guide
  * Troubleshooting
  * API Reference
  * FAQ
- Right panel: Help content for selected topic
  * Rich text with code blocks
  * Screenshots/diagrams
  * Video embed links
  * External documentation links
  * Search within help (search input at top)
- Right edge: 
  * "Was this helpful?" thumbs up/down
  * "Contact support" button

FRAME 3: ACTIVITY & MONITORING (Desktop - 1920x1080)
Admin/monitoring view:
- Header: "System Activity & Monitoring"
- Top metrics (4 cards):
  * Documents Processed | 247
  * Total Queries | 1,234
  * Average Response Time | 2.3s
  * System Health | OK (green)
- Charts section:
  * Query volume over time (line chart)
  * Document processing status (pie chart)
  * Popular equipment types (bar chart)
  * Response time trend (line chart)
- Activity feed:
  * Log of recent activities
  * Filters: document uploads, queries, errors
  * Each entry: timestamp, action, status
  * Expandable for details

FRAME 4: ERROR STATES (Multiple small frames)
Various error/warning states:

a) Document Upload Error:
   * Modal with error icon (red)
   * Error message: "File size exceeds 100MB"
   * Retry button
   * Cancel button

b) API Connection Error:
   * Page overlay
   * Error icon and message
   * "Retry" and "Settings" buttons
   * Show last successful connection time

c) No Search Results:
   * In search results area:
     - Empty state icon
     - "No documents match your search"
     - Suggestions: refine search, adjust filters
     - Link to browse all documents

d) Insufficient Permissions:
   * Modal: "Access Denied"
   * Message: "Contact administrator for access"
   * Contact button

FRAME 5: ONBOARDING FLOW (Mobile & Desktop - Multiple frames)
First-time user experience:

Step 1: Welcome Screen
   * Large logo
   * Title: "Welcome to Industrial Troubleshooting AI"
   * Description: "Intelligent assistance for equipment maintenance"
   * "Get Started" button

Step 2: Role Selection
   * Radio buttons:
     - Maintenance Engineer
     - Field Technician
     - Equipment Manager
     - Other
   * Next button

Step 3: Upload First Document
   * Illustration of document upload
   * "Upload your first technical manual"
   * Upload button
   * "Skip for now" link

Step 4: AI Configuration
   * Brief explanation of LLM options
   * Radio buttons for provider selection
   * Configure button or "Use defaults" link

Step 5: Completion
   * Checkmark icon
   * "You're all set!"
   * "Start troubleshooting" button
   * "View tutorial" link

FRAME 6: NOTIFICATION & ALERT STATES (Multiple small frames)
Examples of notifications appearing in various positions:

- Success toast (top-right):
  * Green checkmark
  * "Document uploaded successfully"
  * Auto-dismiss after 3s

- Error toast (top-right):
  * Red X icon
  * "Failed to process document"
  * "Retry" and "Dismiss" buttons

- Warning banner (top):
  * Yellow warning icon
  * "Vector database is 80% full"
  * "Manage storage" button

- Info notification (in-line):
  * Blue info icon
  * "New equipment detected in document: Centrifugal Pump"
  * Link to entity

Styling Notes:
- Settings page: clear section headers, grouped related options
- Help page: consistent breadcrumb navigation
- Error states: use clear, non-technical language
- Notifications: appear briefly, don't block content
- Icons: consistent across all frames
- Dark mode: maintain contrast in error/warning states
```

---

# PART 2: IDE IMPLEMENTATION PROMPTS FOR REACT/TYPESCRIPT

## Prompt 1: React Project Setup & Core Infrastructure

**USE THIS PROMPT IN YOUR IDE (VS Code, WebStorm, etc.)**

```
Create a complete React + TypeScript + Vite project structure for the Industrial 
Troubleshooting AI Assistant frontend:

SETUP REQUIREMENTS:
1. Create new Vite project:
   npm create vite@latest industrial-troubleshooting-frontend -- --template react-ts
   cd industrial-troubleshooting-frontend
   npm install

2. Install core dependencies:
   npm install react-router-dom axios zustand react-query
   npm install lucide-react recharts
   npm install @tailwindcss/tailwindcss autoprefixer postcss
   npm install -D tailwindcss postcss autoprefixer
   npm install react-markdown react-syntax-highlighter

3. Configure Tailwind CSS:
   npx tailwindcss init -p
   
   Update tailwind.config.js:
   ```javascript
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f3e5f5',
             100: '#e1bee7',
             500: '#1a237e',
             600: '#1565c0',
             700: '#0d47a1',
           },
           secondary: {
             500: '#00897b',
             600: '#00695c',
           },
           accent: {
             500: '#ff6f00',
             600: '#e65100',
           },
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
         },
       },
    },
     plugins: [],
   }
   ```

4. Project Structure (recreate these directories):
   src/
   ├── components/
   │   ├── common/
   │   │   ├── Header.tsx
   │   │   ├── Sidebar.tsx
   │   │   ├── LoadingSpinner.tsx
   │   │   ├── ErrorBoundary.tsx
   │   │   └── Toast.tsx
   │   ├── chat/
   │   │   ├── ChatInterface.tsx
   │   │   ├── ChatMessage.tsx
   │   │   ├── ChatInput.tsx
   │   │   ├── CitationViewer.tsx
   │   │   └── ContextSidebar.tsx
   │   ├── documents/
   │   │   ├── DocumentUpload.tsx
   │   │   ├── DocumentBrowser.tsx
   │   │   ├── DocumentCard.tsx
   │   │   └── DocumentDetail.tsx
   │   ├── search/
   │   │   ├── SearchPanel.tsx
   │   │   ├── SearchResults.tsx
   │   │   └── FilterPanel.tsx
   │   └── graph/
   │       ├── KnowledgeGraphView.tsx
   │       ├── GraphTableView.tsx
   │       └── EntityDetail.tsx
   ├── pages/
   │   ├── ChatPage.tsx
   │   ├── DocumentsPage.tsx
   │   ├── SearchPage.tsx
   │   ├── GraphPage.tsx
   │   ├── SettingsPage.tsx
   │   ├── HelpPage.tsx
   │   └── FieldAssistancePage.tsx
   ├── services/
   │   ├── api.ts
   │   ├── chatService.ts
   │   ├── documentService.ts
   │   ├── searchService.ts
   │   └── graphService.ts
   ├── hooks/
   │   ├── useChat.ts
   │   ├── useDocuments.ts
   │   ├── useSearch.ts
   │   ├── useGraph.ts
   │   └── useAsync.ts
   ├── context/
   │   ├── AppContext.tsx
   │   ├── ChatContext.tsx
   │   ├── NotificationContext.tsx
   │   └── ThemeContext.tsx
   ├── types/
   │   └── index.ts
   ├── utils/
   │   ├── formatters.ts
   │   ├── validators.ts
   │   ├── constants.ts
   │   └── api-client.ts
   ├── styles/
   │   ├── globals.css
   │   ├── theme.css
   │   └── animations.css
   ├── App.tsx
   ├── App.css
   └── main.tsx

5. Create TypeScript types file (src/types/index.ts):
   ```typescript
   export interface Document {
     id: string;
     filename: string;
     fileType: 'pdf' | 'docx' | 'image';
     uploadedAt: string;
     status: 'processing' | 'complete' | 'error';
     pageCount: number;
     entitiesFound: number;
     tags: string[];
     equipmentType?: string;
     category?: string;
   }

   export interface Citation {
     sourceDoc: string;
     page: number;
     excerpt: string;
     confidence: number;
   }

   export interface ChatMessage {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     timestamp: string;
     citations?: Citation[];
     sourceDocuments?: string[];
   }

   export interface SearchResult {
     chunkId: string;
     content: string;
     sourceDoc: string;
     page: number;
     score: number;
     sectionTitle?: string;
   }

   export interface Entity {
     name: string;
     type: 'Equipment' | 'Component' | 'System' | 'Process';
     frequency: number;
     documentCount: number;
     properties?: Record<string, string>;
   }

   export interface Relationship {
     entity1: string;
     entity2: string;
     type: string;
     confidence: number;
   }

   export interface GraphNode {
     id: string;
     label: string;
     type: string;
     size: number;
     color: string;
   }

   export interface GraphEdge {
     source: string;
     target: string;
     type: string;
     label: string;
   }

   export interface APIResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
     metadata?: Record<string, any>;
   }
   ```

6. Create API client (src/utils/api-client.ts):
   ```typescript
   import axios from 'axios';

   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

   const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 30000,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add interceptors for error handling, auth, etc.
   apiClient.interceptors.response.use(
     response => response,
     error => {
       console.error('API Error:', error);
       throw error;
     }
   );

   export default apiClient;
   ```

7. Create global styles (src/styles/globals.css):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }

   body {
     font-family: 'Inter', system-ui, sans-serif;
     background-color: #f5f5f5;
     color: #212121;
   }

   html.dark {
     background-color: #121212;
     color: #e0e0e0;
   }

   button {
     cursor: pointer;
     border: none;
     border-radius: 4px;
     font-weight: 500;
     transition: all 200ms ease-in-out;
   }

   button:hover {
     transform: translateY(-2px);
     box-shadow: 0 4px 8px rgba(0,0,0,0.15);
   }

   input, textarea {
     border-radius: 4px;
     border: 1px solid #ccc;
     padding: 8px 12px;
     font-family: inherit;
   }

   input:focus, textarea:focus {
     outline: none;
     border-color: #1a237e;
     box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
   }
   ```

8. Create main App component (src/App.tsx):
   ```typescript
   import React from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import { Header } from './components/common/Header';
   import { Sidebar } from './components/common/Sidebar';
   import ChatPage from './pages/ChatPage';
   import DocumentsPage from './pages/DocumentsPage';
   import SearchPage from './pages/SearchPage';
   import GraphPage from './pages/GraphPage';
   import SettingsPage from './pages/SettingsPage';
   import './App.css';

   function App() {
     return (
       <Router>
         <div className="flex h-screen bg-gray-100">
           <Sidebar />
           <div className="flex flex-col flex-1">
             <Header />
             <main className="flex-1 overflow-auto">
               <Routes>
                 <Route path="/" element={<ChatPage />} />
                 <Route path="/documents" element={<DocumentsPage />} />
                 <Route path="/search" element={<SearchPage />} />
                 <Route path="/graph" element={<GraphPage />} />
                 <Route path="/settings" element={<SettingsPage />} />
               </Routes>
             </main>
           </div>
         </div>
       </Router>
     );
   }

   export default App;
   ```

9. Create .env.example:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=Industrial Troubleshooting AI
   VITE_ENABLE_DARK_MODE=true
   VITE_LOG_LEVEL=info
   ```

10. Update package.json scripts:
    ```json
    {
      "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview",
        "lint": "eslint src --ext ts,tsx",
        "format": "prettier --write src"
      }
    }
    ```

11. Verify setup:
    npm run dev
    # Should start dev server at http://localhost:5173

This creates a clean, modern React foundation with Tailwind CSS, TypeScript, 
and proper folder organization.
```

---

## Prompt 2: Core Components - Header, Sidebar, and Chat Interface

**USE THIS PROMPT IN YOUR IDE**

```
Create the following React components to match the Google Stitch designs:

COMPONENT 1: Header (src/components/common/Header.tsx)
Create a professional top navigation bar with:
- Logo/branding on left
- Title/breadcrumb in center
- Search icon, user menu on right
- Dark mode toggle
- Height: 64px
- Shadow effect at bottom
- Sticky positioning

Features:
```typescript
import React from 'react';
import { Menu, Search, Moon, Sun, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left section: Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg 
                          flex items-center justify-center text-white font-bold text-lg">
            AI
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Industrial Troubleshooting
          </h1>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                            transition-colors">
            <Search size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                      transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <User size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                            rounded-lg shadow-lg py-2 z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 
                                 dark:hover:bg-gray-700 flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

COMPONENT 2: Sidebar (src/components/common/Sidebar.tsx)
Create a left navigation sidebar with:
- Navigation menu items with icons
- Active state indication
- Collapsible on mobile
- Width: 280px on desktop

Features:
- Dashboard, Chat, Documents, Search, Graph, Field Assistance, Settings icons
- Active indicator (teal left border)
- Hover effects
- Mobile hamburger support

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  FileText,
  Search,
  Network,
  Smartphone,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Chat', icon: MessageSquare, path: '/chat' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Knowledge Graph', icon: Network, path: '/graph' },
    { label: 'Field Assistant', icon: Smartphone, path: '/field' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all 
       duration-300 flex flex-col shadow-xl hidden md:flex`}
    >
      {/* Collapse button */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <span className={`font-bold ${!isOpen && 'hidden'}`}>Menu</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg 
                         transition-colors relative ${
                           isActive
                             ? 'bg-teal-500 text-white'
                             : 'text-gray-300 hover:bg-gray-700'
                         }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className={`${!isOpen && 'hidden'} whitespace-nowrap`}>
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        {isOpen && <p>v1.0.0</p>}
      </div>
    </aside>
  );
};
```

COMPONENT 3: ChatInterface (src/components/chat/ChatInterface.tsx)
Main chat component with message history and input:

```typescript
import React from 'react';
import { Send, Paperclip, Loader } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { CitationViewer } from './CitationViewer';
import { ContextSidebar } from './ContextSidebar';
import { useChat } from '../../hooks/useChat';
import { ChatMessage as ChatMessageType } from '../../types';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = React.useState('');
  const { messages, loading, sendMessage, citations } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const quickQueries = [
    'How do I troubleshoot pump cavitation?',
    'What\'s the maintenance schedule for this equipment?',
    'Safety procedures for electrical systems',
  ];

  return (
    <div className="flex gap-4 h-full bg-gray-50">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Industrial Troubleshooting AI
              </h2>
              <p className="text-gray-600 mb-6">
                Upload technical documentation and start asking questions about 
                your equipment.
              </p>
              <div className="space-y-2 w-full max-w-md">
                {quickQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(query);
                    }}
                    className="w-full p-3 text-left rounded-lg border border-gray-300
                             hover:bg-gray-100 transition-colors text-sm text-gray-700"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg: ChatMessageType) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          {loading && (
            <div className="flex gap-2 items-center text-gray-600">
              <Loader size={16} className="animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t bg-white p-6 space-y-3">
          {/* Suggestions */}
          {messages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {['Follow-up question', 'Explain more', 'Related topics'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full
                           hover:bg-blue-100 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="flex gap-3">
            <button
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              title="Attach documents"
            >
              <Paperclip size={20} className="text-gray-600" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend();
                }
              }}
              placeholder="Ask about your equipment, procedures, or troubleshooting steps..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-50 resize-none"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                       flex items-center gap-2 self-end"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Context sidebar */}
      <ContextSidebar citations={citations} />
    </div>
  );
};
```

These core components provide the foundation for your chat interface with:
- Professional styling matching Google Stitch designs
- Proper TypeScript typing
- Responsive layout
- Dark mode support
- Interactive elements
- Tailwind CSS utilities
```

---

## Prompt 3: Chat Components - Messages, Citations, and Context

**USE THIS PROMPT IN YOUR IDE**

```
Create the following chat-related components:

COMPONENT 1: ChatMessage (src/components/chat/ChatMessage.tsx)
Displays individual chat messages with proper styling:

```typescript
import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { ChatMessage as ChatMessageType, Citation } from '../../types';
import ReactMarkdown from 'react-markdown';

interface Props {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500
                       flex items-center justify-center text-white font-bold text-sm
                       flex-shrink-0">
          AI
        </div>
      )}

      <div
        className={`max-w-2xl rounded-lg p-4 ${
          isUser
            ? 'bg-teal-500 text-white ml-8'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        {/* Message content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Citations if present */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Sources:</p>
            {message.citations.map((citation, idx) => (
              <div key={idx} className="text-xs p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium text-gray-900">
                  {citation.sourceDoc} - Page {citation.page}
                </div>
                <div className="text-gray-600 mt-1 line-clamp-2">
                  "{citation.excerpt}"
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-300 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full"
                      style={{ width: \`\${citation.confidence * 100}%\` }}
                    />
                  </div>
                  <span className="text-gray-600">
                    {Math.round(citation.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={copyToClipboard}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200
                       transition-colors flex items-center gap-1"
            >
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

COMPONENT 2: CitationViewer (src/components/chat/CitationViewer.tsx)
Detailed view for citations with source highlighting:

```typescript
import React from 'react';
import { ChevronRight, Download, Eye } from 'lucide-react';
import { Citation } from '../../types';

interface Props {
  citations: Citation[];
  onViewDocument?: (docId: string, page: number) => void;
}

export const CitationViewer: React.FC<Props> = ({ citations, onViewDocument }) => {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900">Sources & Citations</h3>
      {citations.map((citation, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-lg overflow-hidden 
                   hover:border-teal-500 transition-colors"
        >
          <button
            onClick={() => setExpandedId(expandedId === idx ? null : idx)}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-900">
                {citation.sourceDoc}
              </div>
              <div className="text-xs text-gray-500">Page {citation.page}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full transition-all"
                      style={{ width: \`\${citation.confidence * 100}%\` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round(citation.confidence * 100)}%
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`transition-transform ${
                  expandedId === idx ? 'rotate-90' : ''
                }`}
              />
            </div>
          </button>

          {expandedId === idx && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
              <div className="text-sm text-gray-700 p-3 bg-white rounded border border-gray-200">
                <p className="font-medium mb-2">Excerpt:</p>
                <p className="italic text-gray-600">"{citation.excerpt}"</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewDocument?.(citation.sourceDoc, citation.page)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 
                           bg-teal-50 text-teal-700 rounded hover:bg-teal-100 
                           transition-colors text-sm font-medium"
                >
                  <Eye size={14} />
                  View in document
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2
                                 bg-gray-100 text-gray-700 rounded hover:bg-gray-200
                                 transition-colors text-sm font-medium">
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

COMPONENT 3: ContextSidebar (src/components/chat/ContextSidebar.tsx)
Right sidebar showing sources, entities, and context:

```typescript
import React from 'react';
import { TabGroup } from './TabGroup';
import { Citation } from '../../types';

interface Props {
  citations: Citation[];
}

export const ContextSidebar: React.FC<Props> = ({ citations }) => {
  const [activeTab, setActiveTab] = React.useState('sources');

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-hidden
                   flex flex-col hidden lg:flex">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Context</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'sources', label: 'Sources' },
          { id: 'entities', label: 'Entities' },
          { id: 'history', label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors
                       ${
                         activeTab === tab.id
                           ? 'border-teal-500 text-teal-600'
                           : 'border-transparent text-gray-600 hover:text-gray-900'
                       }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'sources' && (
          <div className="space-y-2">
            {citations.length === 0 ? (
              <p className="text-sm text-gray-500">No sources yet</p>
            ) : (
              citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-blue-50 rounded border border-blue-200 text-xs"
                >
                  <div className="font-medium text-blue-900">{citation.sourceDoc}</div>
                  <div className="text-blue-700 text-xs mt-1">
                    Page {citation.page} • {Math.round(citation.confidence * 100)}% confident
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Related equipment from knowledge graph:</p>
            <div className="space-y-2">
              {['Centrifugal Pump', 'Inlet Pressure Sensor', 'Relief Valve'].map((entity) => (
                <button
                  key={entity}
                  className="w-full text-left p-2 bg-teal-50 rounded border border-teal-200
                           hover:bg-teal-100 transition-colors text-sm text-teal-900"
                >
                  {entity}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Previous messages in this conversation:</p>
            <div className="space-y-1">
              {['Your first question', 'Follow-up about pressure', 'Maintenance query'].map((msg) => (
                <button
                  key={msg}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded
                           transition-colors text-gray-700"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

COMPONENT 4: ChatInput (src/components/chat/ChatInput.tsx)
Enhanced input component with file attachment:

```typescript
import React from 'react';
import { Send, Paperclip, Loader, X } from 'lucide-react';

interface Props {
  onSend: (message: string, attachments?: File[]) => void;
  loading?: boolean;
}

export const ChatInput: React.FC<Props> = ({ onSend, loading = false }) => {
  const [input, setInput] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 space-y-3">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200
                       rounded-lg text-xs text-blue-900"
            >
              <span>{file.name}</span>
              <button
                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                className="hover:bg-blue-100 p-0.5 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Attach documents"
        >
          <Paperclip size={20} className="text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff"
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey && !loading) {
              handleSend();
            }
          }}
          placeholder="Ask about your equipment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
                   disabled:bg-gray-300 flex items-center gap-2 self-end"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          Send
        </button>
      </div>
    </div>
  );
};
```

These components provide:
- Professional message display matching design
- Citation viewing and source attribution
- Context sidebar with tabs
- File attachment support
- Loading states
- Responsive layout
- Accessible components with proper ARIA labels
```

---

## Prompt 4: Document Upload & Browse Components

**USE THIS PROMPT IN YOUR IDE**

```
Create document management components:

COMPONENT 1: DocumentUpload (src/components/documents/DocumentUpload.tsx)
File upload modal with progress tracking:

```typescript
import React from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { documentService } from '../../services/documentService';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ onClose, onComplete }) => {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [metadata, setMetadata] = React.useState({
    equipmentType: '',
    category: '',
    version: '',
    tags: '',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles([...files, ...uploadFiles]);
  };

  const handleUpload = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      const updatedFiles = [...files];
      updatedFiles[i].status = 'uploading';
      setFiles(updatedFiles);

      try {
        const formData = new FormData();
        formData.append('file', files[i].file);
        formData.append('metadata', JSON.stringify(metadata));

        // Simulate upload with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          updatedFiles[i].progress = progress;
          setFiles([...updatedFiles]);
        }

        updatedFiles[i].status = 'complete';
        setFiles([...updatedFiles]);
      } catch (error: any) {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = error.message;
        setFiles([...updatedFiles]);
      }
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 
                    flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Documentation</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                       transition-colors ${
                         isDragging
                           ? 'border-teal-500 bg-teal-50'
                           : 'border-gray-300 hover:border-gray-400'
                       }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Drag files here or click</p>
            <p className="text-xs text-gray-500 mt-1">
              Supported: PDF, DOCX, PNG, JPG, TIFF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  addFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                      {file.file.name}
                    </span>
                    {file.status === 'error' && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    {file.status === 'complete' && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        file.status === 'complete'
                          ? 'bg-green-500'
                          : file.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: \`\${file.progress}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metadata form */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <select
              value={metadata.equipmentType}
              onChange={(e) =>
                setMetadata({ ...metadata, equipmentType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Equipment Type</option>
              <option value="pump">Pump</option>
              <option value="motor">Motor</option>
              <option value="valve">Valve</option>
              <option value="compressor">Compressor</option>
            </select>

            <select
              value={metadata.category}
              onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Category</option>
              <option value="manual">Manual</option>
              <option value="procedure">Procedure</option>
              <option value="wiring">Wiring Diagram</option>
              <option value="drawing">Technical Drawing</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                     hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg
                     hover:bg-teal-600 disabled:bg-gray-300 transition-colors font-medium"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
```

COMPONENT 2: DocumentBrowser (src/components/documents/DocumentBrowser.tsx)
Grid/list view of uploaded documents:

```typescript
import React from 'react';
import { FileText, MoreVertical, Download, Trash2, Eye } from 'lucide-react';
import { Document } from '../../types';

interface Props {
  documents: Document[];
  viewMode: 'grid' | 'list';
  onSelect: (doc: Document) => void;
  onDelete: (docId: string) => void;
}

export const DocumentBrowser: React.FC<Props> = ({
  documents,
  viewMode,
  onSelect,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
        <p className="text-gray-600">Upload your first technical manual to get started</p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
      }
    >
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`bg-white rounded-lg border border-gray-200 hover:shadow-md
                     transition-shadow cursor-pointer ${
                       viewMode === 'list' ? 'p-4 flex items-center' : 'p-4 flex flex-col'
                     }`}
          onClick={() => onSelect(doc)}
        >
          <div className="flex items-start gap-3 flex-1">
            <FileText size={24} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">{doc.filename}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {doc.pageCount} pages • {doc.uploadedAt}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                doc.status === 'complete'
                  ? 'bg-green-50 text-green-700'
                  : doc.status === 'processing'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {doc.status}
            </span>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(showMenu === doc.id ? null : doc.id);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical size={16} className="text-gray-600" />
              </button>

              {showMenu === doc.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200
                              rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                                   flex items-center gap-2 text-gray-700">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                                   flex items-center gap-2 text-gray-700">
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                      setShowMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50
                             flex items-center gap-2 text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

Install requirements: Already handled by the main setup
```

---

## Prompt 5: Search, Graph Visualization & Settings Pages

**USE THIS PROMPT IN YOUR IDE**

```
Create remaining major components:

COMPONENT 1: SearchPanel (src/components/search/SearchPanel.tsx)
Advanced search with filters:

```typescript
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Filters {
  equipmentTypes: string[];
  dateRange: { start: string; end: string };
  confidenceMin: number;
  searchMode: 'semantic' | 'keyword' | 'hybrid';
}

interface Props {
  onSearch: (query: string, filters: Filters) => void;
}

export const SearchPanel: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    equipmentTypes: [],
    dateRange: { start: '', end: '' },
    confidenceMin: 0.3,
    searchMode: 'hybrid',
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const equipmentOptions = [
    'Pump', 'Motor', 'Valve', 'Compressor', 'PLC', 'Electrical', 'Hydraulic'
  ];

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center px-4 py-3 bg-white border border-gray-300
                       rounded-lg focus-within:border-teal-500 focus-within:ring-2
                       focus-within:ring-teal-50">
          <Search size={20} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search technical documentation..."
            className="flex-1 ml-2 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
                   transition-colors font-medium"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${
            showFilters
              ? 'bg-teal-50 text-teal-600 border border-teal-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipment types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type
              </label>
              <div className="space-y-2">
                {equipmentOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.equipmentTypes.includes(option)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...filters.equipmentTypes, option]
                          : filters.equipmentTypes.filter((e) => e !== option);
                        setFilters({ ...filters, equipmentTypes: updated });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Confidence slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Confidence: {Math.round(filters.confidenceMin * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidenceMin}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  confidenceMin: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {/* Search mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Mode
            </label>
            <div className="flex gap-4">
              {(['semantic', 'keyword', 'hybrid'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="search-mode"
                    value={mode}
                    checked={filters.searchMode === mode}
                    onChange={() => setFilters({ ...filters, searchMode: mode })}
                  />
                  <span className="text-sm text-gray-700 capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setFilters({
                  equipmentTypes: [],
                  dateRange: { start: '', end: '' },
                  confidenceMin: 0.3,
                  searchMode: 'hybrid',
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                       hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg
                       hover:bg-teal-600 transition-colors font-medium text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

COMPONENT 2: KnowledgeGraphView (src/components/graph/KnowledgeGraphView.tsx)
Interactive graph visualization (using a library like react-force-graph or custom D3):

```typescript
import React from 'react';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { GraphNode, GraphEdge } from '../../types';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
}

export const KnowledgeGraphView: React.FC<Props> = ({ nodes, edges, onNodeClick }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    // This is a simplified visualization
    // In production, use react-force-graph or similar
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.size * 2, source.size * 2);
        ctx.lineTo(target.size * 2, target.size * 2);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.size * 2, node.size * 2, node.size, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.size * 2, node.size * 2 + 20);
    });
  }, [nodes, edges]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setScale(Math.min(scale + 0.1, 3))}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                   transition-colors"
        >
          <ZoomIn size={18} className="text-gray-600" />
        </button>
        <button
          onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                   transition-colors"
        >
          <ZoomOut size={18} className="text-gray-600" />
        </button>
        <button className="ml-auto px-4 py-2 bg-teal-500 text-white rounded-lg
                         hover:bg-teal-600 flex items-center gap-2 transition-colors">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-full border border-gray-200 rounded-lg bg-white cursor-grab 
                 active:cursor-grabbing"
      />

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Equipment', 'Component', 'System', 'Process'].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

COMPONENT 3: SettingsPage (src/pages/SettingsPage.tsx)
Settings management page:

```typescript
import React from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({
    theme: 'light',
    language: 'en',
    llmProvider: 'ollama',
    llmModel: 'mistral',
    temperature: 0.7,
    autoSave: true,
  });
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    try {
      // Save settings
      await new Promise((r) => setTimeout(r, 1000));
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Status message */}
      {status === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg
                       flex items-center gap-2 text-green-800">
          <CheckCircle size={18} />
          Settings saved successfully
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg
                       flex items-center gap-2 text-red-800">
          <AlertCircle size={18} />
          Failed to save settings
        </div>
      )}

      {/* Settings sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">General</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Configuration</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LLM Provider
            </label>
            <select
              value={settings.llmProvider}
              onChange={(e) => setSettings({ ...settings, llmProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={settings.llmModel}
              onChange={(e) => setSettings({ ...settings, llmModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="mistral">Mistral (Fast)</option>
              <option value="neural-chat">Neural Chat</option>
              <option value="llama2">Llama 2 (Large)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {settings.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                setSettings({ ...settings, temperature: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher values make responses more creative but less accurate
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
                     disabled:bg-gray-300 flex items-center gap-2 font-medium transition-colors"
          >
            <Save size={18} />
            {status === 'saving' ? 'Saving...' : 'Save Settings'}
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg
                           hover:bg-gray-50 font-medium transition-colors">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
```

These components complete the core frontend functionality with:
- Advanced search with filtering
- Knowledge graph visualization
- Settings management
- Responsive design
- Professional UI matching design specs
- Proper type safety
- State management
- Error handling
```

---

## Installation & Running

### Quick Start

```bash
# Frontend setup
npm create vite@latest industrial-troubleshooting -- --template react-ts
cd industrial-troubleshooting
npm install
npm run dev

# Visit http://localhost:5173
```

### Environment Configuration
```bash
cp .env.example .env
# Edit with your backend URL and API settings
```

### Build for Production
```bash
npm run build
# Outputs optimized files to dist/
```

---

## Design System Summary

- **Colors**: Navy (#1a237e), Teal (#00897b), Orange (#ff6f00)
- **Typography**: Inter sans-serif, 16px base
- **Spacing**: 8px grid system
- **Borders**: 1px solid gray
- **Shadows**: Subtle (0 2px 4px rgba(0,0,0,0.1))
- **Radius**: 4-8px
- **Transitions**: 200ms ease-in-out

---

## File Organization

Keep components organized by feature:
- components/ - Reusable UI components
- pages/ - Full page components  
- services/ - API service layer
- hooks/ - Custom React hooks
- context/ - Global state (React Context)
- types/ - TypeScript interfaces
- utils/ - Helper functions
- styles/ - Global CSS

