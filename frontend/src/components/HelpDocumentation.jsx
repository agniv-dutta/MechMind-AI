import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  RefreshCw,
  Play,
  ThumbsUp,
  ThumbsDown,
  Headset,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function HelpDocumentation({ onBackToDashboard }) {
  const [docSearch, setDocSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState('Getting Started');

  const navCategories = [
    {
      header: 'USER GUIDES',
      items: ['Getting Started', 'Chat Interface Guide', 'Document Upload Guide'],
    },
    {
      header: 'ADVANCED FEATURES',
      items: ['Search Guide', 'Knowledge Graph Guide'],
    },
    {
      header: 'TECHNICAL',
      items: ['API Reference', 'Troubleshooting', 'FAQ'],
    },
  ];

  const relatedArticles = [
    { title: 'Understanding Diagnostic Thresholds', category: 'Configuration' },
    { title: 'Connecting Custom Data Sources', category: 'Integrations' },
    { title: 'Interpreting Knowledge Graphs', category: 'Analytics' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">

      {/* 1. Page Header Bar & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Help & Documentation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find guides, API references, and troubleshooting resources.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-200 w-64 flex items-center justify-between gap-2 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              placeholder="Search documentation..."
              className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 w-full"
            />
          </div>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* 2. Documentation Navigation Sidebar (~220px width) */}
        <aside className="w-full lg:w-[220px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-5 text-xs font-medium text-slate-600 dark:text-slate-400">
          {navCategories.map((cat, ci) => (
            <div key={cat.header}>
              <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 ${ci > 0 ? 'mt-4' : ''}`}>
                {cat.header}
              </span>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const isActive = item === activeArticle;
                  return isActive ? (
                    <button
                      key={item}
                      onClick={() => setActiveArticle(item)}
                      className="w-full text-left bg-teal-100/60 dark:bg-teal-500/15 text-teal-900 dark:text-teal-200 font-bold px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{item}</span>
                    </button>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setActiveArticle(item)}
                      className="w-full text-left px-3 py-1.5 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-colors"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* 3. Main Reader Article Canvas (Center Column) */}
        <article className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Breadcrumb Navigation */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-3">
            <span>USER GUIDES</span>
            <ChevronRight className="w-3 h-3" />
            <span>GETTING STARTED</span>
          </div>

          {/* Article Header */}
          <h2 className="text-3xl font-extrabold text-indigo-950 dark:text-slate-100 tracking-tight leading-tight">
            Getting Started with MechMind AI
          </h2>
          <div className="flex items-center gap-6 mt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>5 min read</span>
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Last updated: 2 days ago</span>
            </span>
          </div>

          {/* Section 1: Overview */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Overview
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Welcome to MechMind AI, the premier diagnostic and analytical engine for heavy industry operations. This guide will walk you through the initial setup, ensuring your workspace is optimized for high-speed troubleshooting and data synthesis.
          </p>

          {/* Section 2: Video Tutorial Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mt-6 shadow-sm aspect-video bg-slate-900 text-white flex flex-col justify-end p-4">
            {/* Thumbnail backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px] opacity-20"></div>
            </div>
            {/* Center Play Button Overlay */}
            <button className="bg-white/90 hover:bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg absolute inset-0 m-auto cursor-pointer transition-colors z-10">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
            {/* Bottom Bar Info */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-white">
                Platform Overview Tutorial
              </span>
              <span className="text-xs font-mono text-slate-300 bg-black/60 px-2 py-1 rounded-md shrink-0">
                03:45
              </span>
            </div>
          </div>
        </article>

        {/* 4. Right Inspector & Actions Panel (~280px width) */}
        <div className="w-full lg:w-[280px] shrink-0">
          {/* Card 1: Article Feedback Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Was this article helpful?
            </h4>
            <div className="flex justify-center gap-3 mt-2">
              <button className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-700 dark:text-slate-200 transition-colors">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-700 dark:text-slate-200 transition-colors">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Expert Support Banner */}
          <div className="bg-indigo-950 text-white rounded-2xl p-5 space-y-3 mt-6 shadow-md">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Headset className="w-5 h-5" />
              <span>Expert Support</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Need technical assistance? Our engineering team is available 24/7 for high-priority diagnostic routing.
            </p>
            <button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider text-center mt-2 transition-colors flex items-center justify-center gap-2">
              <Headset className="w-4 h-4" />
              <span>CONTACT SUPPORT</span>
            </button>
          </div>

          {/* Card 3: Related Articles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 mt-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-3">
              Related Articles
            </h4>
            <div className="space-y-4">
              {relatedArticles.map((a) => (
                <button key={a.title} className="w-full text-left flex items-start gap-2.5 group">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 group-hover:text-slate-600" />
                  <span>
                    <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white leading-snug">
                      {a.title}
                    </span>
                    <span className="block text-xs text-slate-400 font-mono mt-0.5">
                      {a.category}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
