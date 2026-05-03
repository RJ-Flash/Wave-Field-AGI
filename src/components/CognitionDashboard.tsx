import React, { useState, useEffect } from 'react';
import { Activity, Brain, Code, Network, History, Zap, CheckCircle2, CircleDashed } from 'lucide-react';
import { motion } from 'motion/react';

interface EpisodicEvent {
  id: string;
  timestamp: string;
  task?: string;
  goal?: string;
  result?: string;
}

interface ProceduralSkill {
  name: string;
  description: string;
}

interface SemanticNode {
  id: string;
  label: string;
}

interface SemanticEdge {
  source: string;
  target: string;
  relation: string;
}

interface EvolutionTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending';
  progress: number;
}

export function CognitionDashboard() {
  const [activeTab, setActiveTab] = useState<'episodic' | 'procedural' | 'semantic' | 'evolution'>('episodic');
  const [events, setEvents] = useState<EpisodicEvent[]>([]);
  const [skills, setSkills] = useState<ProceduralSkill[]>([]);
  const [graph, setGraph] = useState<{ nodes: SemanticNode[], edges: SemanticEdge[] }>({ nodes: [], edges: [] });
  const [evolutionTasks, setEvolutionTasks] = useState<EvolutionTask[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cogRes, skillsRes, evolutionRes] = await Promise.all([
          fetch('/api/cognition'),
          fetch('/api/skills'),
          fetch('/api/evolution/tasks')
        ]);
        
        if (cogRes.ok) {
          const cogData = await cogRes.json();
          setEvents(cogData.episodic_memory?.slice().reverse() || []);
          setGraph(cogData.semantic_graph || { nodes: [], edges: [] });
        }
        if (skillsRes.ok) {
          const sData = await skillsRes.json();
          setSkills(sData.skills || []);
        }
        if (evolutionRes.ok) {
          const eData = await evolutionRes.json();
          setEvolutionTasks(eData || []);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const evolutionTasksArray = Array.isArray(evolutionTasks) ? evolutionTasks : [];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#f5f5f6] flex items-center gap-2">
          <Brain className="text-[#f27d26]" /> 
          Cognitive Architecture
        </h2>
        <p className="text-[#9494a0] mt-1">Live inspection of the agent's memory layers.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-[#2a2a32]">
        <button 
          onClick={() => setActiveTab('episodic')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'episodic' ? 'border-[#f27d26] text-[#f27d26]' : 'border-transparent text-[#9494a0] hover:text-[#f5f5f6]'}`}
        >
          <History size={18} /> Episodic Timeline
        </button>
        <button 
          onClick={() => setActiveTab('procedural')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'procedural' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-[#9494a0] hover:text-[#f5f5f6]'}`}
        >
          <Code size={18} /> Procedural Skills
        </button>
        <button 
          onClick={() => setActiveTab('semantic')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'semantic' ? 'border-violet-500 text-violet-500' : 'border-transparent text-[#9494a0] hover:text-[#f5f5f6]'}`}
        >
          <Network size={18} /> Semantic Graph
        </button>
        <button 
          onClick={() => setActiveTab('evolution')}
          className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'evolution' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-[#9494a0] hover:text-[#f5f5f6]'}`}
        >
          <Zap size={18} /> Evolution 
        </button>
      </div>

      <div className="flex-1 bg-[#16161a] border border-[#2a2a32] rounded-xl p-6">
        {activeTab === 'episodic' && (
          <div className="space-y-4">
            {events.length === 0 && <div className="text-center py-12 text-[#4b4b53]">No episodic events recorded.</div>}
            {events.map(ev => (
              <div key={ev.id} className="p-4 bg-[#1e1e24] rounded-lg border border-[#2a2a32]">
                <div className="text-xs text-[#9494a0] mb-2">{new Date(ev.timestamp).toLocaleString()}</div>
                {ev.task && <div className="text-sm font-medium text-[#f5f5f6] mb-1">Trigger: {ev.task}</div>}
                {ev.goal && <div className="text-sm text-[#9494a0] mb-2">Intent: {ev.goal}</div>}
                <div className="text-sm bg-black/30 p-2 rounded text-[#a6e22e] font-mono">{ev.result}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'procedural' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.length === 0 && <div className="col-span-full text-center py-12 text-[#4b4b53]">No custom skills loaded.</div>}
            {skills.map(skill => (
              <div key={skill.name} className="p-4 bg-[#1e1e24] rounded-lg border border-emerald-500/20">
                <div className="font-mono text-emerald-400 mb-2">{skill.name}</div>
                <div className="text-sm text-[#9494a0]">{skill.description}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2 mb-6">
                {graph.nodes.length === 0 && <div className="text-center w-full py-12 text-[#4b4b53]">Knowledge base empty.</div>}
                {graph.nodes.map(n => (
                   <span key={n.id} className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-sm border border-violet-500/20">
                     {n.label}
                   </span>
                ))}
             </div>
             <div className="space-y-2">
                {graph.edges.length > 0 && <h4 className="text-sm font-medium text-[#9494a0] mb-3 uppercase tracking-widest text-[10px]">Implicit Relations</h4>}
                {graph.edges.map((e, idx) => (
                   <div key={idx} className="flex items-center gap-3 text-sm bg-[#0c0c0e]/50 p-2 rounded border border-[#2a2a32]">
                     <span className="text-[#f5f5f6] px-2 py-0.5 bg-[#1e1e24] rounded">{e.source}</span>
                     <span className="text-xs font-mono text-violet-400">-[ {e.relation} ]-&gt;</span>
                     <span className="text-[#f5f5f6] px-2 py-0.5 bg-[#1e1e24] rounded">{e.target}</span>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {evolutionTasksArray.map((task) => (
              <div 
                key={task.id} 
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden group flex flex-col ${
                  task.status === 'completed' 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-[#1e1e24] border-[#2a2a32]'
                }`}
              >
                {task.status === 'completed' && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full"></div>
                )}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#0c0c0e] text-[#9494a0]'}`}>
                    {task.status === 'completed' ? <CheckCircle2 size={18} /> : <CircleDashed size={18} className="animate-spin" style={{ animationDuration: '3s' }} />}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {task.status === 'completed' ? 'Integrated' : 'In Dev'}
                  </span>
                </div>

                <h3 className="font-bold text-[#f5f5f6] mb-2 relative z-10">{task.title}</h3>
                <p className="text-xs text-[#9494a0] leading-relaxed mb-4 relative z-10 flex-1">{task.description}</p>
                
                <div className="mt-auto relative z-10">
                   <div className="flex justify-between items-center text-[10px] text-[#9494a0] uppercase mb-1.5 font-bold tracking-tighter">
                     <span>Deployment Status</span>
                     <span>{task.progress}%</span>
                   </div>
                   <div className="h-1.5 bg-[#0c0c0e] rounded-full overflow-hidden border border-[#2a2a32]">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${task.progress}%` }}
                       className={`h-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                     />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
