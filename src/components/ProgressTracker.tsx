import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, PlayCircle, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number; // 0 to 100
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'autonomous_scheduling',
    title: 'Autonomous Scheduling & Cron Logic',
    description: 'Allow the system to wake up automatically without user interaction.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'memory_compression',
    title: 'Deep Memory Compression & Vector Substrate',
    description: 'Compress episodic history and implement vector-based semantic retrieval.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'toolchain_expansion',
    title: 'Execution Toolchain Expansion',
    description: 'Create multi-modal tool endpoints (web search, sub-agents).',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'live_deploy',
    title: 'Live CI/CD Autonomous Deployment',
    description: 'Connect internal changes directly to git or automated cloud deployments.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'meta_reflection',
    title: 'Advanced Meta-Cognition',
    description: 'System automatically determines its next flaw, writes a fix, and deploys it.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'folder_workspace',
    title: 'Folder-as-Workspace Architecture',
    description: 'Native Node.js context loader for Markdown-based world model & folder routing.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'free_ag_infra',
    title: 'Free AGI Infrastructure (Ollama/HF)',
    description: 'Integrated HuggingFace and local Ollama routing with zero-cost fallback chain.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'tool_execution',
    title: 'Real Tool Execution Integration',
    description: 'Allow cognitive loop to actually read/write files and execute bash commands.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'sys_evolve_workspace',
    title: 'Self-Evolution Protocols',
    description: 'Workspace files guiding the AI on prompting itself for improvements.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'sqlite_memory',
    title: 'Persistent Memory Substrate',
    description: 'Add persistent JSON/SQLite layer for cognitive events and episodic traces.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'backend_bridge',
    title: 'Establish Express Backend',
    description: 'Transition from simulated delays to actual Express + Vite middleware backend.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'cog_loop',
    title: 'Build Cognitive Loop (v1.0 Core Engine)',
    description: 'Implement perception, planning, execution, and reflection cycle in frontend.',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'setup_env',
    title: 'Initialize Root Architecture',
    description: 'Set up Vite + React environment, Tailwind styling, and base component structure.',
    status: 'completed',
    progress: 100,
  }
];

export function ProgressTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/evolution/tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load tasks', err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'in_progress': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'pending': return 'text-red-500 bg-red-500/10 border-red-500/30';
    }
  };

  const getProgressColor = (progress: number) => {
    // Red to Green mapping based on percentage
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-[#a3e635]'; // lime
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={18} />;
      case 'in_progress': return <Loader2 size={18} className="animate-spin" />;
      case 'pending': return <Clock size={18} />;
    }
  };

  // Calculate overall progress
  const totalProgress = tasks.length > 0 ? tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length : 0;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#0c0c0e]">
        <Loader2 className="animate-spin text-[#f27d26] w-12 h-12" />
        <p className="text-[#9494a0] mt-4">Loading System Progress...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,125,38,0.05)_0%,transparent_80%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#f5f5f6] flex items-center gap-3 mb-3">
            <PlayCircle className="text-[#f27d26]" size={32} />
            System Evolution Progress
          </h1>
          <p className="text-[#9494a0] max-w-2xl leading-relaxed">
            Tracking the autonomous build and continuous self-improvement of the Wave Field AGI architecture. Tasks transition from red (pending) to green (completed).
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-xs text-[#9494a0] font-mono uppercase tracking-widest mb-1">Overall Core Completion</div>
              <div className="text-3xl font-bold text-[#f5f5f6]">{Math.round(totalProgress)}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#f27d26] font-medium">Phase 2: Capability Expansion</div>
            </div>
          </div>
          <div className="w-full h-3 bg-[#0c0c0e] rounded-full overflow-hidden border border-[#2a2a32] shadow-inner">
             <motion.div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 relative"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
             />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4 pb-20">
          {tasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#16161a]/60 backdrop-blur-md border border-[#2a2a32] rounded-2xl p-5 hover:border-[#f27d26]/40 transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                     <span className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${getStatusColor(task.status)}`}>
                       {getStatusIcon(task.status)}
                     </span>
                     <h3 className="text-lg font-bold text-[#f5f5f6] group-hover:text-[#f27d26] transition-colors">{task.title}</h3>
                   </div>
                   <p className="text-sm text-[#9494a0] ml-11">{task.description}</p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 md:w-48 ml-11 md:ml-0">
                  <div className="flex-1 h-2 bg-[#0c0c0e] rounded-full overflow-hidden border border-[#2a2a32]">
                    <motion.div 
                      className={`h-full ${getProgressColor(task.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-medium text-[#9494a0] w-10 text-right">
                    {task.progress}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
