import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Palette, Type, MousePointer2 } from 'lucide-react';

export function ComponentExplorer() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'buttons' | 'forms'>('colors');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2a2a32] rounded-lg">
                <LayoutTemplate className="text-[#f27d26]" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Component Explorer</h1>
            </div>
            <p className="text-[#9494a0] max-w-2xl">
              Design System Sandbox. Inspect and visualize UI components globally.
            </p>
          </div>
        </header>

        <div className="flex border-b border-[#2a2a32] mb-6">
          {[
            { id: 'colors', icon: Palette, label: 'Colors' },
            { id: 'typography', icon: Type, label: 'Typography' },
            { id: 'buttons', icon: MousePointer2, label: 'Buttons' },
            { id: 'forms', icon: LayoutTemplate, label: 'Forms' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === tab.id ? 'border-[#f27d26] text-[#f27d26]' : 'border-transparent text-[#9494a0] hover:text-[#f5f5f6]'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-6 md:p-8 min-h-[400px]">
          {activeTab === 'colors' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 bg-[#0c0c0e] rounded-lg border border-[#2a2a32]"></div>
                <div className="text-sm text-[#f5f5f6]">Background</div>
                <div className="text-xs font-mono text-[#9494a0]">#0c0c0e</div>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-[#16161a] rounded-lg border border-[#2a2a32]"></div>
                <div className="text-sm text-[#f5f5f6]">Surface</div>
                <div className="text-xs font-mono text-[#9494a0]">#16161a</div>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-[#f27d26] rounded-lg border border-[#2a2a32]"></div>
                <div className="text-sm text-[#f5f5f6]">Primary</div>
                <div className="text-xs font-mono text-[#9494a0]">#f27d26</div>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-[#2a2a32] rounded-lg border border-[#2a2a32]"></div>
                <div className="text-sm text-[#f5f5f6]">Border / Surface 2</div>
                <div className="text-xs font-mono text-[#9494a0]">#2a2a32</div>
              </div>
            </div>
          )}
          {activeTab === 'typography' && (
            <div className="space-y-6 text-[#f5f5f6]">
               <div>
                 <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
                 <p className="text-[#9494a0] font-mono text-sm mt-1">text-4xl font-bold tracking-tight</p>
               </div>
               <div>
                 <h2 className="text-2xl font-bold tracking-tight">Heading 2</h2>
                 <p className="text-[#9494a0] font-mono text-sm mt-1">text-2xl font-bold tracking-tight</p>
               </div>
               <div>
                 <p className="text-base leading-relaxed text-[#9494a0]">
                   Body Text. This represents general text blocks. It uses leading-relaxed for better readability and a slightly muted tone to prevent eye strain.
                 </p>
                 <p className="text-[#9494a0] font-mono text-sm mt-1">text-base leading-relaxed text-[#9494a0]</p>
               </div>
            </div>
          )}
          {activeTab === 'buttons' && (
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#f27d26] hover:bg-[#d66a1d] text-[#0c0c0e] px-4 py-2 rounded-lg font-medium transition-colors">
                Primary Button
              </button>
              <button className="bg-[#2a2a32] hover:bg-[#3a3a42] text-[#f5f5f6] px-4 py-2 rounded-lg font-medium transition-colors">
                Secondary Button
              </button>
              <button className="border border-[#2a2a32] hover:border-[#f27d26] hover:text-[#f27d26] text-[#9494a0] px-4 py-2 rounded-lg font-medium transition-all">
                Outline Button
              </button>
            </div>
          )}
          {activeTab === 'forms' && (
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f5f5f6] mb-1">Standard Input</label>
                <input className="w-full bg-[#0c0c0e]/90 border border-[#2a2a32] rounded-lg p-2 text-[#f5f5f6] placeholder-[#9494a0] focus:outline-none focus:border-[#f27d26]/50" placeholder="Placeholder text..." />
              </div>
              <div>
                 <label className="flex items-center gap-2 text-sm text-[#f5f5f6] cursor-pointer">
                   <input type="checkbox" className="rounded border-[#2a2a32] bg-[#0c0c0e] text-[#f27d26] focus:ring-[#f27d26]" />
                   <span>Remember preference</span>
                 </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
