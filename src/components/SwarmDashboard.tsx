import React, { useState } from 'react';
import { Cpu, Plus, Trash2, Zap, Play, TerminalSquare, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface SubAgentTask {
  id: string;
  role: string;
  goal: string;
  context: string;
}

interface SwarmResult {
  role: string;
  output: string;
}

export function SwarmDashboard() {
  const [tasks, setTasks] = useState<SubAgentTask[]>([
    {
      id: "1",
      role: 'Security Auditor',
      goal: 'Scan the codebase for any unhandled promise rejections or injection vulnerabilities.',
      context: 'We are deploying a new webhook intake system.'
    },
    {
      id: "2",
      role: 'Growth Strategist',
      goal: 'Identify the next 2 architectural paradigms needed for exponential system expansion.',
      context: 'Current focus: autonomous scheduling.'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SwarmResult[]>([]);
  const [error, setError] = useState('');

  const addTask = () => {
    setTasks([...tasks, { id: Date.now().toString(), role: '', goal: '', context: '' }]);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateTask = (id: string, field: keyof SubAgentTask, value: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const dispatchSwarm = async () => {
    // Validate
    if (tasks.some(t => !t.role || !t.goal)) {
      setError('All agents must have at least a role and a goal.');
      return;
    }
    setError('');
    setLoading(true);
    setResults([]);

    try {
      const payloads = tasks.map(t => ({ role: t.role, goal: t.goal, context: t.context }));
      const res = await fetch('/api/swarm/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: payloads })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Match results to tasks for rendering
      const pairedResults = payloads.map((task, idx) => ({
        role: task.role,
        output: data.results[idx]
      }));
      setResults(pairedResults);
    } catch (e: any) {
      setError(e.message || 'Failed to dispatch swarm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-[#2a2a32] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Zap size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Swarm Orchestrator</h1>
          </div>
          <p className="text-[#9494a0] max-w-2xl">
            Configure and dispatch multi-modal sub-agents simultaneously for parallel cognitive execution.
          </p>
        </div>
        <button 
          onClick={dispatchSwarm}
          disabled={loading || tasks.length === 0}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Cpu className="animate-spin" size={20} /> Initializing Agents...</>
          ) : (
            <><Play fill="currentColor" size={18} /> Execute Swarm Run</>
          )}
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0c0c0e] border border-[#2a2a32] rounded-lg p-3">
            <h2 className="text-sm font-semibold text-[#f5f5f6] uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Agent Rosters ({tasks.length})
            </h2>
            <button 
              onClick={addTask}
              className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 font-medium transition-colors"
            >
              <Plus size={16} /> Add Sub-Agent
            </button>
          </div>

          <AnimatePresence>
            {tasks.map((task, idx) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-5 relative group"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => removeTask(task.id)} className="text-rose-400 p-1 hover:bg-rose-400/10 rounded">
                     <Trash2 size={16} />
                   </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#9494a0] uppercase mb-1">Agent Role / Persona</label>
                  <input 
                    value={task.role}
                    onChange={(e) => updateTask(task.id, 'role', e.target.value)}
                    placeholder="e.g. Chaos Monkey, Code Reviewer"
                    className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded p-2 text-[#f5f5f6] text-sm focus:outline-none focus:border-yellow-500/50 font-mono"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#9494a0] uppercase mb-1">Core Goal</label>
                  <textarea 
                    value={task.goal}
                    onChange={(e) => updateTask(task.id, 'goal', e.target.value)}
                    placeholder="What must this agent specifically accomplish?"
                    className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded p-2 text-[#f5f5f6] text-sm focus:outline-none focus:border-yellow-500/50 resize-none h-20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9494a0] uppercase mb-1">Supplementary Context (Optional)</label>
                  <input 
                    value={task.context}
                    onChange={(e) => updateTask(task.id, 'context', e.target.value)}
                    placeholder="Extra state or environment vars..."
                    className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded p-2 text-[#f5f5f6] text-sm focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                
                <div className="absolute top-4 left-0 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black border-4 border-[#0c0c0e]">
                  {idx + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Results Render */}
        <div className="bg-[#0c0c0e] border border-[#2a2a32] rounded-xl flex flex-col h-[calc(100vh-16rem)] min-h-[500px]">
          <div className="border-b border-[#2a2a32] p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f5f5f6] uppercase tracking-wider flex items-center gap-2">
              <TerminalSquare size={18} className="text-emerald-400" />
              Live Telemetry / Logs
            </h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {results.length === 0 && !loading && (
              <div className="h-full flex items-center justify-center text-[#4b4b53] text-sm font-mono text-center">
                Awaiting Swarm Dispatch...<br/>
                Deploy agents to see concurrent outputs here.
              </div>
            )}
            
            {loading && (
              <div className="space-y-4">
                {tasks.map(t => (
                  <div key={t.id} className="bg-[#16161a] border border-yellow-500/30 p-4 rounded-lg animate-pulse">
                    <span className="text-yellow-500 text-xs font-mono mb-2 block">&gt; Spinning up container for {t.role}...</span>
                    <div className="h-2 bg-[#2a2a32] rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && results.map((res, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#16161a] border border-[#2a2a32] rounded-lg overflow-hidden"
              >
                <div className="bg-[#1e1e24] px-4 py-2 border-b border-[#2a2a32] text-xs font-mono font-semibold text-[#f5f5f6]">
                  Agent: <span className="text-yellow-400">{res.role}</span>
                </div>
                <div className="p-4 prose prose-sm prose-invert max-w-none text-[#9494a0]">
                  <Markdown>{res.output}</Markdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
