import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Database, GitBranch, Network, Zap, RefreshCcw, Send, Terminal, CheckCircle2, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

type RunState = 'idle' | 'perception' | 'planning' | 'executing' | 'reflection' | 'completed';

interface LogEntry {
  id: string;
  timestamp: string;
  layer: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export function PrototypeDashboard() {
  const [taskInput, setTaskInput] = useState('');
  const [runState, setRunState] = useState<RunState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [memoryContext, setMemoryContext] = useState(0);
  const [episodicCount, setEpisodicCount] = useState(0);
  const [isCronActive, setIsCronActive] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/cognitive-loop/episodic')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && Array.isArray(data)) {
          setEpisodicCount(data.length);
        }
      })
      .catch((e) => console.log('Backend not wired yet or error', e));

    fetch('/api/scheduler/status')
      .then(res => res.ok ? res.json() : { bgTickActive: false })
      .then(data => setIsCronActive(data.bgTickActive))
      .catch(() => {});
  }, []);

  const addLog = (layer: string, message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString().substr(11, 8),
        layer,
        message,
        type,
      },
    ]);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const simulateCognitiveLoop = async () => {
    if (!taskInput.trim() || runState !== 'idle') return;

    setRunState('perception');
    setLogs([]);
    setMemoryContext((prev) => prev + 1500); // Simulate context loading
    
    // Initial static logs before server responds for better UX
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString().substr(11, 8),
        layer: 'Client',
        message: 'Dispatching task to backend cognitive loop...',
        type: 'info' as const,
      }
    ]);
    
    try {
      // 1. Send reset to clear short-term logs
      await fetch('/api/cognitive-loop/start', { method: 'POST' });

      // Start pulling logs while it runs
      const fetchLogs = async () => {
        try {
          const res = await fetch('/api/cognitive-loop/logs');
          if (res.ok) {
            const data = await res.json();
            // deduplicate and update
            setLogs((prev) => {
               const newLogs = [...prev];
               data.forEach((d: any) => {
                 if (!newLogs.find(l => l.message === d.message && l.layer === d.layer)) {
                    newLogs.push({
                      id: d.id.toString(),
                      timestamp: new Date(d.timestamp).toISOString().substr(11, 8),
                      layer: d.layer,
                      message: d.message,
                      type: d.type
                    });
                 }
               });
               return newLogs;
            });

            // Derive state based on latest logs
            if (data.length > 0) {
              const lastLayer = data[data.length - 1].layer as string;
              if (lastLayer.includes('Perceive')) setRunState('perception');
              if (lastLayer.includes('Plan') || lastLayer.includes('Router')) setRunState('planning');
              if (lastLayer.includes('Execut')) setRunState('executing');
              if (lastLayer.includes('Critic') || lastLayer.includes('Memory')) setRunState('reflection');
            }
          }
        } catch (err) {}
      };

      const pollInterval = setInterval(fetchLogs, 500);

      const response = await fetch('/api/cognitive-loop/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskInput })
      });

      clearInterval(pollInterval);
      await fetchLogs(); // One final fetch

      fetch('/api/cognitive-loop/episodic')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data)) setEpisodicCount(data.length);
        }).catch(() => {});

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setRunState('completed');
    } catch (e: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().substr(11, 8),
          layer: 'System',
          message: `Critical Error: ${e.message}`,
          type: 'error' as const,
        }
      ]);
      setRunState('idle');
    }
    
    setTimeout(() => {
      setRunState('idle');
    }, 4000);
  };

  const getStatusColor = (state: RunState, expected: RunState) => {
    if (state === expected) return 'text-[#f27d26] bg-[rgba(242,125,38,0.1)] border-[#f27d26]/50 shadow-[0_0_20px_rgba(242,125,38,0.2)]';
    if (state === 'completed' || ['planning', 'executing', 'reflection'].indexOf(state) >= ['planning', 'executing', 'reflection'].indexOf(expected)) {
       if (state === 'idle' && expected !== 'idle') return 'text-[#9494a0] border-[#2a2a32] opacity-50';
       return 'text-green-500 bg-green-500/10 border-green-500/30';
    }
    return 'text-[#9494a0] border-[#2a2a32] opacity-50';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,125,38,0.05)_0%,transparent_100%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto w-full h-full flex flex-col xl:flex-row gap-6 relative z-10"
      >
        
        {/* Left Column: Input and Memory */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* Task Input */}
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] rounded-3xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#f27d26]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
              <Terminal className="text-[#f27d26]" size={20} />
              Goal Initialization
            </h2>
            <div className="relative z-10">
              <div className="relative group/input">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f27d26]/0 via-[#f27d26]/30 to-[#f27d26]/0 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter a complex task for the AGI system..."
                  className="w-full h-32 bg-[#0c0c0e]/90 backdrop-blur-md border border-[#2a2a32] rounded-xl p-4 text-[#f5f5f6] placeholder-[#9494a0] focus:outline-none focus:border-[#f27d26]/50 resize-none font-mono text-sm leading-relaxed relative"
                  disabled={runState !== 'idle'}
                />
              </div>
              <button
                onClick={simulateCognitiveLoop}
                disabled={!taskInput.trim() || runState !== 'idle'}
                className="absolute bottom-4 right-4 bg-[#f27d26] hover:bg-[#d66a1d] disabled:opacity-50 disabled:hover:bg-[#f27d26] text-[#0c0c0e] p-2 rounded-lg transition-all transform active:scale-95 shadow-[0_4px_14px_0_rgba(242,125,38,0.39)] hover:shadow-[0_6px_20px_rgba(242,125,38,0.23)] disabled:shadow-none"
              >
                {runState !== 'idle' ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            
            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs relative z-10">
              <button 
                onClick={() => setTaskInput("Execute Recursive Self-Optimization: Sync latest AGI research logs, analyze internal Meta-Cognitive directives, and refactor for enhanced reasoning depth.")}
                className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 text-blue-300 hover:text-blue-100 transition-all"
              >
                AGI Self-Optimize
              </button>
              <button 
                onClick={() => setTaskInput("Analyze Q3 metrics across all 4 databases, refactor the aggregation pipeline, and summarize findings.")}
                className="px-4 py-2 rounded-full border border-[#2a2a32] bg-[#0c0c0e]/50 hover:bg-[#1e1e24] hover:border-[#f27d26]/50 text-[#9494a0] hover:text-[#f5f5f6] transition-all"
              >
                Analyze Q3 Data
              </button>
              <button 
                onClick={() => setTaskInput("Review my 500-page codebase, locate memory leaks, propose fixes, and write tests.")}
                className="px-4 py-2 rounded-full border border-[#2a2a32] bg-[#0c0c0e]/50 hover:bg-[#1e1e24] hover:border-[#f27d26]/50 text-[#9494a0] hover:text-[#f5f5f6] transition-all"
              >
                Codebase Audit
              </button>
              <button 
                onClick={async () => {
                  if (runState !== 'idle') return;
                  setRunState('perception');
                  setLogs([{ id: Math.random().toString(), timestamp: new Date().toISOString().substr(11, 8), layer: 'Client', message: 'Triggering Meta-Cognition Sequence...', type: 'info' }]);
                  
                  // Reset short term log
                  await fetch('/api/cognitive-loop/start', { method: 'POST' });

                  const fetchLogs = async () => {
                    try {
                      const res = await fetch('/api/cognitive-loop/logs');
                      if (res.ok) {
                        const data = await res.json();
                        setLogs((prev) => {
                           const newLogs = [...prev];
                           data.forEach((d: any) => {
                             if (!newLogs.find(l => l.message === d.message && l.layer === d.layer)) {
                                newLogs.push({ id: d.id.toString(), timestamp: new Date(d.timestamp).toISOString().substr(11, 8), layer: d.layer, message: d.message, type: d.type });
                             }
                           });
                           return newLogs;
                        });
                      }
                    } catch (err) {}
                  };

                  const pollInterval = setInterval(fetchLogs, 500);

                  try {
                    await fetch('/api/meta-cognition/evolve', { method: 'POST' });
                  } catch (e) {}

                  clearInterval(pollInterval);
                  await fetchLogs();
                  
                  fetch('/api/cognitive-loop/episodic')
                    .then(res => res.json())
                    .then(data => {
                      if (data && Array.isArray(data)) setEpisodicCount(data.length);
                    }).catch(() => {});
                    
                  setRunState('completed');
                  setTimeout(() => setRunState('idle'), 4000);
                }}
                disabled={runState !== 'idle'}
                className="px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 hover:border-pink-500/50 text-pink-300 hover:text-pink-100 transition-all font-semibold flex items-center gap-1"
              >
                <Activity size={14} /> Evolve System (Meta-Cog)
              </button>

              <button 
                onClick={async () => {
                  if (runState !== 'idle') return;
                  setRunState('perception');
                  setLogs([{ id: Math.random().toString(), timestamp: new Date().toISOString().substr(11, 8), layer: 'Client', message: 'Delegating to Multi-Agent Swarm...', type: 'info' }]);
                  
                  await fetch('/api/cognitive-loop/start', { method: 'POST' });

                  const fetchLogs = async () => {
                    try {
                      const res = await fetch('/api/cognitive-loop/logs');
                      if (res.ok) {
                        const data = await res.json();
                        setLogs((prev) => {
                           const newLogs = [...prev];
                           data.forEach((d: any) => {
                             if (!newLogs.find(l => l.message === d.message && l.layer === d.layer)) {
                                newLogs.push({ id: d.id.toString(), timestamp: new Date(d.timestamp).toISOString().substr(11, 8), layer: d.layer, message: d.message, type: d.type });
                             }
                           });
                           return newLogs;
                        });
                      }
                    } catch (err) {}
                  };

                  const pollInterval = setInterval(fetchLogs, 500);

                  try {
                    await fetch('/api/cognitive-loop/swarm', { 
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ task: 'Analyze the current state of artificial general intelligence and determine a trajectory for the rest of 2026.' })
                    });
                  } catch (e) {}

                  clearInterval(pollInterval);
                  await fetchLogs();
                  
                  setRunState('completed');
                  setTimeout(() => setRunState('idle'), 4000);
                }}
                disabled={runState !== 'idle'}
                className="px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-500/50 text-teal-300 hover:text-teal-100 transition-all font-semibold flex items-center gap-1"
              >
                <Activity size={14} /> Test Core Swarm
              </button>

              <button 
                onClick={async () => {
                  if (runState !== 'idle') return;
                  setRunState('perception');
                  setLogs([{ id: Math.random().toString(), timestamp: new Date().toISOString().substr(11, 8), layer: 'Client', message: 'Delegating to Spec-Analyzer Agent...', type: 'info' }]);
                  
                  await fetch('/api/cognitive-loop/start', { method: 'POST' });

                  const fetchLogs = async () => {
                    try {
                      const res = await fetch('/api/cognitive-loop/logs');
                      if (res.ok) {
                        const data = await res.json();
                        setLogs((prev) => {
                           const newLogs = [...prev];
                           data.forEach((d: any) => {
                             if (!newLogs.find(l => l.message === d.message && l.layer === d.layer)) {
                                newLogs.push({ id: d.id.toString(), timestamp: new Date(d.timestamp).toISOString().substr(11, 8), layer: d.layer, message: d.message, type: d.type });
                             }
                           });
                           return newLogs;
                        });
                      }
                    } catch (err) {}
                  };

                  const pollInterval = setInterval(fetchLogs, 500);

                  try {
                    await fetch('/api/agents/spec-planner', { method: 'POST' });
                  } catch (e) {}

                  clearInterval(pollInterval);
                  await fetchLogs();
                  
                  setRunState('completed');
                  setTimeout(() => setRunState('idle'), 4000);
                }}
                disabled={runState !== 'idle'}
                className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 text-purple-300 hover:text-purple-100 transition-all font-semibold flex items-center gap-1"
              >
                <Activity size={14} /> Spec Analyzer
              </button>

              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/scheduler/toggle', { method: 'POST' });
                    const data = await res.json();
                    setIsCronActive(data.bgTickActive);
                  } catch (e) {}
                }}
                className={`px-4 py-2 rounded-full border transition-all font-semibold flex items-center gap-1 ${
                  isCronActive 
                  ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30' 
                  : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <Activity size={14} className={isCronActive ? "animate-pulse" : ""} /> {isCronActive ? 'Auto Chron: ON' : 'Auto Chron: OFF'}
              </button>
            </div>
          </div>

        {/* End Left Column, Start Middle Column */}
        </div>

        {/* Middle Column: Visual Feedback & Logs */}
        <div className="flex-[2] flex flex-col gap-6 min-h-0 min-w-0">
          
          {/* Context Memory Visualizer */}
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] rounded-3xl p-6 flex-[2] flex flex-col relative overflow-hidden min-h-[300px]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
              <Database className="text-[#f27d26]" size={20} />
              Wave Field Substrate
            </h2>
            <div className="flex-1 rounded-2xl p-5 flex flex-col justify-end space-y-4 relative overflow-hidden bg-[#0c0c0e]/80 border border-[#2a2a32] min-h-0">
              
              {/* Animated grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,125,38,0.1)_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent"></div>
              
              <div className="relative z-10 w-full flex justify-between text-xs font-mono text-[#9494a0] uppercase tracking-wider">
                <span>Context Window</span>
                <span className="text-[#f27d26] animate-pulse">{(memoryContext / 1000).toFixed(1)}k / 8M Tokens</span>
              </div>
              <div className="relative z-10 w-full h-3 bg-[#16161a] rounded-full border border-[#2a2a32] overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#f27d26] via-[#ffaa66] to-[#f27d26] relative"
                  style={{ width: `${Math.min(100, (memoryContext / 8000) * 100)}%` }}
                  layout
                  transition={{ type: "spring", stiffness: 50 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 relative z-10">
                 <div className="p-4 bg-[#16161a]/60 backdrop-blur-md border border-[#2a2a32] rounded-xl hover:border-[#f27d26]/40 transition-colors">
                   <div className="text-[10px] text-[#f27d26] mb-1 font-mono uppercase tracking-wider">WORKING MEMORY</div>
                   <div className="text-sm font-medium">Active Task State</div>
                 </div>
                 <div className="p-4 bg-[#16161a]/60 backdrop-blur-md border border-[#2a2a32] rounded-xl hover:border-[#f27d26]/40 transition-colors">
                   <div className="text-[10px] text-[#f27d26] mb-1 font-mono uppercase tracking-wider">EPISODIC</div>
                   <div className="text-sm font-medium">{episodicCount} Past Traces</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Loop & Logs */}
        <div className="flex-[2] flex flex-col gap-6 min-h-0 min-w-0">
          {/* Cognitive Loop Nodes */}
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
             
            <h2 className="text-xl font-bold mb-8 relative z-10">Cognitive Loop Execution</h2>
            
            {/* Proactive Innovation Tip */}
            <div className="absolute top-6 right-8 z-20">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                className="bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded-full text-yellow-500 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                title="View next-level AGI innovation bulbs"
              >
                <Lightbulb size={20} className="animate-pulse" />
              </motion.button>
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 font-mono text-sm relative z-10">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#2a2a32] to-transparent -z-10"></div>
              {runState !== 'idle' && runState !== 'completed' && (
                <motion.div 
                   className="hidden md:block absolute top-6 h-[2px] bg-[#f27d26] -z-10"
                   initial={{ left: '10%', right: '90%', opacity: 0 }}
                   animate={{ 
                     left: ['10%', '30%', '50%', '70%'][['perception', 'planning', 'executing', 'reflection'].indexOf(runState)] || '10%',
                     right: ['70%', '50%', '30%', '10%'][['perception', 'planning', 'executing', 'reflection'].indexOf(runState)] || '10%',
                     opacity: 1
                   }}
                   transition={{ duration: 0.5 }}
                />
              )}
              
              {[
                { id: 'perception', icon: Activity, label: 'Perceive' },
                { id: 'planning', icon: GitBranch, label: 'Plan' },
                { id: 'executing', icon: Zap, label: 'Execute' },
                { id: 'reflection', icon: RefreshCcw, label: 'Reflect' }
              ].map((stage, idx) => {
                const Icon = stage.icon;
                const statusClass = getStatusColor(runState, stage.id as RunState);
                const isActive = runState === stage.id;
                
                return (
                  <div key={stage.id} className="flex flex-col items-center bg-transparent px-2 w-24">
                    <motion.div 
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 transition-colors duration-300 backdrop-blur-md ${statusClass}`}
                      animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <span className={`tracking-widest uppercase text-[10px] sm:text-xs font-semibold ${isActive ? 'text-[#f27d26]' : 'text-[#9494a0]'}`}>{stage.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Engine Logs */}
          <div className="bg-[#0c0c0e]/90 backdrop-blur-2xl border border-[#2a2a32] rounded-3xl flex-1 flex flex-col overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#f27d26]/30 to-transparent"></div>
            
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#2a2a32]/50 bg-[#16161a]/50">
               <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-[#f5f5f6]">
                 <Terminal size={16} className="text-[#f27d26]"/>
                 SYSTEM_TRACES
               </div>
               <div className="flex items-center gap-3 bg-[#0c0c0e] px-3 py-1.5 rounded-full border border-[#2a2a32]">
                 <span className="relative flex h-2.5 w-2.5">
                   {runState !== 'idle' && (
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f27d26] opacity-75"></span>
                   )}
                   <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${runState !== 'idle' ? 'bg-[#f27d26]' : 'bg-[#2a2a32]'}`}></span>
                 </span>
                 <span className="text-xs font-mono text-[#9494a0] uppercase tracking-wider">{runState}</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 font-mono text-xs sm:text-sm">
              <AnimatePresence>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center text-[#9494a0] opacity-50 flex-col gap-4"
                  >
                    <Network size={40} className="animate-pulse" />
                    <span className="tracking-widest uppercase">Awaiting Task Initialization...</span>
                  </motion.div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 hover:bg-[#16161a]/80 p-2 sm:p-2.5 rounded-lg -mx-2 transition-colors border border-transparent hover:border-[#2a2a32]/50"
                    >
                      <span className="text-[#9494a0]/50 shrink-0 text-[10px] sm:text-xs mt-0.5">{log.timestamp}</span>
                      <span className="text-[#f27d26] w-28 shrink-0 truncate uppercase tracking-wider text-[10px] sm:text-xs font-semibold">[{log.layer}]</span>
                      <span className={`
                        flex-1 
                        ${log.type === 'info' ? 'text-[#f5f5f6]' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'warn' ? 'text-yellow-400' : ''}
                        ${log.type === 'error' ? 'text-red-400' : ''}
                      `}>
                        {log.message}
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={logsEndRef} className="h-4" />
            </div>
          </div>
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
