import React, { useState, useEffect } from 'react';
import { Lightbulb, Rocket, Zap, Target, Star, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface InnovationIdea {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'completed';
  impact: 'medium' | 'high' | 'very-high' | 'critical';
}

export function InnovationHub() {
  const [ideas, setIdeas] = useState<InnovationIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/innovation');
      const data = await res.json();
      setIdeas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateNewIdea = async () => {
    setSuggesting(true);
    try {
      await fetch('/api/system/innovation/suggest', { method: 'POST' });
      await loadIdeas();
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'very-high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'high': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8 border-b border-[#2a2a32] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <Lightbulb size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Innovation Hub</h1>
          </div>
          <p className="text-[#9494a0] max-w-2xl">
            "Bulb Ideas" for the next evolution of Wave Field AGI. Proactive suggestions for system hardening and scaling.
          </p>
        </div>
        <button 
          onClick={generateNewIdea}
          disabled={suggesting}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            suggesting 
            ? 'bg-yellow-500/20 text-yellow-500 animate-pulse' 
            : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
          }`}
        >
          <Zap size={16} fill={suggesting ? 'none' : 'currentColor'} />
          {suggesting ? 'Brainstorming...' : 'Generate New Bulb'}
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#4b4b53]">
          <RefreshCw className="animate-spin mr-3" size={24} />
          <span>Synchronizing Vision Layers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idea.id}
              className="bg-[#16161a] border border-[#2a2a32] rounded-3xl p-6 relative overflow-hidden group hover:border-yellow-500/40 transition-all duration-300"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getImpactColor(idea.impact)}`}>
                  {idea.impact} impact
                </div>
                {idea.status === 'completed' && <Star size={16} className="text-yellow-500" fill="currentColor" />}
              </div>

              <h3 className="text-lg font-bold text-[#f5f5f6] mb-2">{idea.title}</h3>
              <p className="text-sm text-[#9494a0] leading-relaxed mb-6 font-medium">
                {idea.description}
              </p>

              <div className="mt-auto pt-4 border-t border-[#2a2a32] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    idea.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    idea.status === 'in-progress' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-[#4b4b53]'
                  }`}></div>
                  <span className="text-[10px] font-bold text-[#9494a0] uppercase tracking-tighter">
                    {idea.status.replace('-', ' ')}
                  </span>
                </div>
                <button className="text-xs font-bold text-yellow-500/50 hover:text-yellow-500 uppercase tracking-widest transition-colors">
                  Draft Spec →
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="border-2 border-dashed border-[#2a2a32] rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-[#4b4b53] transition-colors cursor-pointer" onClick={generateNewIdea}>
             <div className="p-4 bg-[#1e1e24] rounded-full mb-4 group-hover:scale-110 transition-transform">
               <Target size={32} className="text-[#4b4b53] group-hover:text-yellow-500/50" />
             </div>
             <p className="text-sm font-bold text-[#4b4b53] group-hover:text-[#9494a0] transition-colors">PROPOSE NEXT LEAP</p>
          </div>
        </div>
      )}

      <footer className="mt-12 p-8 bg-[#0c0c0e] rounded-3xl border border-[#2a2a32] flex flex-col md:flex-row gap-8 items-center">
         <div className="flex-1">
            <h4 className="text-lg font-bold text-[#f5f5f6] mb-2 flex items-center gap-2">
               <Rocket size={18} className="text-indigo-400" />
               Architectural Evolution
            </h4>
            <p className="text-sm text-[#9494a0] leading-relaxed">
               The Innovation Hub uses **Recursive Mental Sandboxing** to simulate system upgrades. Every confirmed Bulb Idea moves into the **Execution Plan** to be autonomously built and deployed.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-4 bg-[#16161a] rounded-2xl border border-[#2a2a32] text-center">
               <div className="text-2xl font-bold text-[#f5f5f6]">84%</div>
               <div className="text-[10px] text-[#9494a0] uppercase font-bold tracking-tight">Vision Alignment</div>
            </div>
            <div className="px-6 py-4 bg-[#16161a] rounded-2xl border border-[#2a2a32] text-center">
               <div className="text-2xl font-bold text-emerald-400">12</div>
               <div className="text-[10px] text-[#9494a0] uppercase font-bold tracking-tight">Leaps Logged</div>
            </div>
         </div>
      </footer>
    </div>
  );
}
