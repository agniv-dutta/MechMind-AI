import React, { useState } from 'react';
import { 
  Bot, 
  Paperclip, 
  Link as LinkIcon, 
  Send, 
  SlidersHorizontal, 
  MoreVertical, 
  RotateCcw, 
  Sparkles, 
  ChevronRight,
  Mic,
  Loader2
} from 'lucide-react';

export default function ChatArea({ onCitationClick, activeCitation }) {
  const suggestions = ['Check vibration history', 'View P&ID diagram'];

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 min-w-0 transition-colors duration-200">
      {/* Chat Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center border border-teal-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                MechMind Assistant
              </h1>
              {/* GENERATING Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30 animate-pulse tracking-wide">
                <Loader2 className="w-3 h-3 mr-1 animate-spin text-teal-500" />
                GENERATING
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5 animate-ping"></span>
                ACTIVE STREAMING • STARTUP ANALYSIS
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Action Icons */}
        <div className="flex items-center space-x-1">
          <button 
            title="Session Options" 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button 
            title="Reset Session" 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            title="More Options" 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Date Separator */}
        <div className="flex justify-center">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs border border-slate-300/50 dark:border-slate-700/50">
            Today, 10:42 AM
          </span>
        </div>

        {/* User Message Bubble */}
        <div className="flex flex-col items-end max-w-2xl ml-auto">
          <div className="bg-[#0D6857] text-white px-5 py-4 rounded-2xl rounded-br-none shadow-md space-y-1">
            <p className="text-sm font-normal leading-relaxed tracking-wide">
              We're getting a high vibration alert on Turbine B-42 during the startup sequence. It hits the threshold around 1500 RPM, then settles. Pressure looks normal. What should we check first?
            </p>
          </div>
          <span className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pr-1">
            Technician J. Doe 10:42 AM
          </span>
        </div>

        {/* AI Streaming Response Bubble */}
        <div className="flex items-start space-x-3.5 max-w-3xl">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-300 dark:bg-slate-800 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="bg-[#F1F5F9] dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-5 rounded-2xl rounded-tl-none border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              {/* Summary Paragraph */}
              <p className="text-sm leading-relaxed font-normal text-slate-700 dark:text-slate-300">
                Based on the vibration spike at 1500 RPM during startup on Turbine B-42, while pressure remains normal, we need to look at transient phenomena rather than steady-state mechanical failure. This specific signature points to a few key areas.
              </p>

              {/* Numbered Diagnostic Steps */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Initial Diagnostic Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li className="pl-1">
                    <strong className="font-bold text-slate-900 dark:text-slate-100">Critical Speed Resonance:</strong> 1500 RPM is often close to the first critical speed for this turbine class. Verify if the acceleration rate through this band is according to the standard cold-start profile.
                  </li>
                  <li className="pl-1">
                    <strong className="font-bold text-slate-900 dark:text-slate-100">Thermal Bowing:</strong> If the unit was on turning gear for less than the required time prior to startup, a temporary rotor bow could cause this. Check the turning gear logs for the past 12 hours.
                  </li>
                  <li className="pl-1">
                    <strong className="font-bold text-slate-900 dark:text-slate-100">Bearing Lube Oil Temp:</strong> Verify the supply temperature is 
                    <span className="inline-block w-2 h-4 ml-1 bg-teal-400 animate-pulse align-middle"></span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 transition-all shadow-2xs flex items-center space-x-1 group"
                >
                  <span>{sugg}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area (Disabled State during response execution) */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="relative rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 p-3 opacity-80 cursor-not-allowed">
          <textarea
            rows={2}
            disabled
            placeholder="MechMind is typing..."
            className="w-full bg-transparent text-sm text-slate-500 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none cursor-not-allowed italic"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            {/* Bottom left actions */}
            <div className="flex items-center space-x-2 opacity-50 pointer-events-none">
              <button type="button" className="p-1.5 rounded-lg text-slate-400">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-lg text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-lg text-slate-400">
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Send button disabled state (muted arrow icon) */}
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 cursor-not-allowed flex items-center space-x-1.5 border border-slate-300/40 dark:border-slate-700/40 opacity-70"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
