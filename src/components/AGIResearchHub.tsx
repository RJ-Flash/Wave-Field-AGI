import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, BrainCircuit, Globe, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

export function AGIResearchHub() {
  const [query, setQuery] = useState('Latest news and breakthroughs for explosive and exponential growth in Artificial General Intelligence');
  const [archives, setArchives] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [currentResearch, setCurrentResearch] = useState('');
  const [expandedArchive, setExpandedArchive] = useState<number | null>(null);
  
  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/research/archives');
      if (res.ok) {
         setArchives((await res.json()).reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResearch = async () => {
    if (!query.trim() || isResearching) return;
    setIsResearching(true);
    setCurrentResearch('');
    try {
      if (!process.env.GEMINI_API_KEY) {
        alert("GEMINI_API_KEY is not configured.");
        setIsResearching(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: `You are an Autonomous AI Researcher. The user wants to learn about: "${query}".
CRITICAL DIRECTIVE: You MUST search the web and the latest news for recent breakthroughs that will help with this system's "exponential and explosive growth" as an autonomous AGI system.
Synthesize a highly structured, dense report in markdown. Include:
1. Executive Summary
2. Key Recent Breakthroughs (Focus heavily on cutting-edge news that enables explosive scaling/growth)
3. Notable Tools and Resources (RAG, agent frameworks, etc.)
4. Practical Implications for an Autonomous Development System
Limit to 1000 words.`,
        config: {
           tools: [{ googleSearch: {} }],
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          setCurrentResearch(fullText);
        }
      }

      // Save the research
      await fetch('/api/research/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, summary: fullText })
      });
      await fetchArchives();

    } catch (e: any) {
      console.error(e);
      setCurrentResearch(prev => prev + "\n\n**Error during research:** " + e.message);
    }
    setIsResearching(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2a2a32] rounded-lg">
                <BrainCircuit className="text-emerald-500" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Autonomous Research Hub</h1>
            </div>
            <p className="text-[#9494a0] max-w-2xl">
              Equip the system to independently research the web for AGI advancements, development paradigms, and emerging Google tools.
            </p>
          </div>
        </header>

        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-4 md:p-6 mb-4">
          <label className="block text-sm font-medium text-[#9494a0] mb-2 uppercase tracking-wide">Research Directive</label>
          <div className="flex gap-2 flex-col sm:flex-row mb-3">
            <input 
              className="flex-1 bg-[#0c0c0e]/90 border border-[#2a2a32] rounded-lg p-3 text-[#f5f5f6] placeholder-[#4b4b53] focus:outline-none focus:border-emerald-500/50" 
              placeholder="e.g. DeepSeek v3, Gemini multi-agent workflows, autonomous system growth..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            />
            <button 
              onClick={handleResearch}
              disabled={isResearching}
              className="bg-emerald-500 hover:bg-emerald-600 text-[#0c0c0e] px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
            >
              {isResearching ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Synthesizing Info...
                </>
              ) : (
                <>
                  <Globe size={18} />
                  Run Global Research
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-[#9494a0] flex items-center gap-2 bg-[#0c0c0e]/50 p-2 rounded border border-[#2a2a32]">
            <Database size={14} className="text-indigo-400" />
            <span><span className="font-semibold text-indigo-400">Data Yield Routing:</span> Successful research is automatically indexed into the Vector RAG Database, expanding the system's persistent context for all future cognitive tasks.</span>
          </div>
        </div>

        {currentResearch && (
           <div className="bg-[#16161a] border border-emerald-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] mb-6">
              <div className="flex items-center gap-2 mb-4 text-emerald-500">
                 {isResearching ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                 <span className="font-semibold text-sm tracking-wide uppercase">
                    {isResearching ? "Live Web Synthesis in Progress..." : "Latest Research Findings"}
                 </span>
              </div>
              <div className="prose prose-invert prose-emerald max-w-none text-sm leading-relaxed">
                 <Markdown>{currentResearch}</Markdown>
              </div>
           </div>
        )}

        <div className="mt-4">
           <h3 className="text-xl font-bold text-[#f5f5f6] mb-4 flex items-center gap-2">
             <Bookmark className="text-[#9494a0]" size={20} />
             Research Archives Database
           </h3>
           
           <div className="space-y-4">
             {archives.length === 0 ? (
                <div className="text-center py-12 text-[#4b4b53] border border-dashed border-[#2a2a32] rounded-xl bg-[#0c0c0e]">
                   No previous research operations executed.
                </div>
             ) : (
               archives.map((arch) => (
                 <div key={arch.id} className="bg-[#16161a] border border-[#2a2a32] rounded-xl overflow-hidden transition-colors hover:border-[#3a3a42]">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedArchive(expandedArchive === arch.id ? null : arch.id)}
                    >
                       <div>
                         <p className="text-[#f5f5f6] font-medium mb-1 line-clamp-1">{arch.query}</p>
                         <p className="text-xs text-[#9494a0]">Completed strictly at {new Date(arch.timestamp).toLocaleString()}</p>
                       </div>
                       <ChevronRight size={18} className={`text-[#9494a0] transition-transform ${expandedArchive === arch.id ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {expandedArchive === arch.id && (
                       <div className="p-4 md:p-6 border-t border-[#2a2a32] bg-[#0c0c0e]/50">
                          <div className="prose prose-invert prose-emerald max-w-none text-sm leading-relaxed">
                            <Markdown>{arch.summary}</Markdown>
                          </div>
                       </div>
                    )}
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
