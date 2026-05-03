import React, { useState, useEffect } from 'react';
import { Cpu, Menu, X, BookOpen, MonitorPlay, FolderTree, ActivitySquare, Heart, Activity, ClipboardList, Database, LayoutTemplate, Network, BrainCircuit, Contact, Zap, Lightbulb } from 'lucide-react';
import { SpecDocument } from './components/SpecDocument';
import { PrototypeDashboard } from './components/PrototypeDashboard';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { ProgressTracker } from './components/ProgressTracker';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { ExecutionPlan } from './components/ExecutionPlan';
import { Credits } from './components/Credits';
import { VectorSearchUI } from './components/VectorSearchUI';
import { ComponentExplorer } from './components/ComponentExplorer';
import { DependencyVisualizer } from './components/DependencyVisualizer';
import { AGIResearchHub } from './components/AGIResearchHub';
import { AgentIdentityUI } from './components/AgentIdentityUI';
import { AgentAuditUI } from './components/AgentAuditUI';
import { SwarmDashboard } from './components/SwarmDashboard';
import { TaskQueueDashboard } from './components/TaskQueueDashboard';
import { CognitionDashboard } from './components/CognitionDashboard';
import { InnovationHub } from './components/InnovationHub';
import { motion, AnimatePresence } from 'motion/react';

function AgentSidebarStatus() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/agent-identity')
        .then(r => r.json())
        .then(data => setStatus(data))
        .catch(() => {});
    };
    fetchStatus();
    const inv = setInterval(fetchStatus, 10000);
    return () => clearInterval(inv);
  }, []);

  if (!status) return null;

  return (
    <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-[#9494a0] uppercase tracking-widest">Neural Link</span>
        <div className="flex h-1.5 w-1.5 relative">
           <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
           <div className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></div>
        </div>
      </div>
      <div className="text-xs text-[#f5f5f6] font-mono truncate mb-1">
        {status.currentFocus || 'Awaiting task...'}
      </div>
      <div className="flex justify-between items-center">
         <span className="text-[9px] text-[#4b4b53] uppercase">{status.autonomyLevel}</span>
         <div className="h-1 w-12 bg-black rounded-full overflow-hidden">
            <motion.div 
               className="h-full bg-emerald-500" 
               initial={{ width: 0 }} 
               animate={{ width: status.autonomyLevel === 'fully-autonomous' ? '100%' : '40%' }} 
            />
         </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'spec' | 'plan' | 'prototype' | 'workspace' | 'progress' | 'telemetry' | 'credits' | 'vector' | 'components' | 'dependencies' | 'research' | 'identity' | 'audit' | 'swarm' | 'queue' | 'cognition' | 'innovation'>('prototype');
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ['Overview', 'System Layers', 'Phases', 'Build Sequence'];

  const handleNavClick = (id: string) => {
    if (currentView !== 'spec') {
      setCurrentView('spec');
      // Adding a small delay to ensure DOM updates before scrolling
      setTimeout(() => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setActiveSection(id);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0c0c0e] text-[#f5f5f6] overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-[#2a2a32] bg-[#16161a] z-50">
        <div className="flex items-center gap-2 text-[#f27d26]">
          <Cpu size={24} />
          <h1 className="text-lg font-bold tracking-tight">Wave Field AGI</h1>
        </div>
        <button className="text-[#f5f5f6]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 right-0 bottom-0 bg-[#0c0c0e] z-40 p-4 border-b border-[#2a2a32] overflow-y-auto">
          <div className="mb-6 space-y-2">
            <button
              onClick={() => { setCurrentView('prototype'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'prototype' 
                ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <MonitorPlay size={20} />
              v1.0 Core Engine
            </button>
            <button
              onClick={() => { setCurrentView('spec'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'spec' 
                ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <BookOpen size={20} />
              Architecture Spec
            </button>
            <button
              onClick={() => { setCurrentView('plan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'plan' 
                ? 'bg-[rgba(168,85,247,0.15)] text-purple-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <ClipboardList size={20} />
              Execution Plan
            </button>
            <button
              onClick={() => { setCurrentView('workspace'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'workspace' 
                ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <FolderTree size={20} />
              Layered Workspace
            </button>
            <button
              onClick={() => { setCurrentView('progress'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'progress' 
                ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <ActivitySquare size={20} />
              Evolution Tracker
            </button>
            <button
              onClick={() => { setCurrentView('telemetry'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'telemetry' 
                ? 'bg-[rgba(59,130,246,0.15)] text-blue-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Activity size={20} />
              System Telemetry
            </button>
            <button
              onClick={() => { setCurrentView('queue'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'queue' 
                ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <ClipboardList size={20} />
              Task Queue
            </button>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-[#9494a0] uppercase tracking-wider">Experimental GUI</div>
            <button
              onClick={() => { setCurrentView('vector'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'vector' 
                ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Database size={20} />
              Deep Vector RAG
            </button>
            <button
              onClick={() => { setCurrentView('components'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'components' 
                ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <LayoutTemplate size={20} />
              Component Explorer
            </button>
            <button
              onClick={() => { setCurrentView('dependencies'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'dependencies' 
                ? 'bg-[rgba(139,92,246,0.15)] text-violet-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Network size={20} />
              Dependency Graph
            </button>
            <button
              onClick={() => { setCurrentView('research'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'research' 
                ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <BrainCircuit size={20} />
              AGI Research Hub
            </button>

            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-[#9494a0] uppercase tracking-wider">Meta / System</div>
            <button
              onClick={() => { setCurrentView('identity'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'identity' 
                ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Contact size={20} />
              Agent Identity
            </button>
            <button
              onClick={() => { setCurrentView('audit'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'audit' 
                ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Network size={20} />
              Verify Audit Log
            </button>
            <button
              onClick={() => { setCurrentView('cognition'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'cognition' 
                ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <BrainCircuit size={20} />
              Cognitive Architecture
            </button>
            <button
              onClick={() => { setCurrentView('swarm'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'swarm' 
                ? 'bg-yellow-500/15 text-yellow-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Zap size={20} />
              Swarm Orchestrator
            </button>
            <button
              onClick={() => { setCurrentView('credits'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                currentView === 'credits' 
                ? 'bg-[rgba(236,72,153,0.15)] text-pink-500 font-medium' 
                : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
              }`}
            >
              <Heart size={20} />
              Credits & Attributions
            </button>
          </div>
          
          {currentView === 'spec' && (
            <>
              <div className="text-xs text-[#9494a0] font-mono mb-2 uppercase tracking-wider px-4">Spec Navigation</div>
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const id = item.toLowerCase().replace(' ', '-');
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleNavClick(id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                        isActive 
                        ? 'text-[#f27d26] font-medium' 
                        : 'text-[#9494a0] hover:text-[#f5f5f6]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-72 border-r border-[#2a2a32] bg-[#0c0c0e] p-6 flex-col hidden md:flex shrink-0 shadow-2xl relative z-10">
        <div className="flex items-center gap-3 mb-10 text-[#f27d26] shrink-0">
          <Cpu size={28} />
          <h1 className="text-xl font-bold tracking-tight">Wave Field AGI</h1>
        </div>
        
        <div className="flex-1 space-y-8 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <div className="text-[10px] text-[#9494a0] font-bold uppercase tracking-[0.2em] mb-4 px-4 opacity-50 flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-[#f27d26]"></div>
               Active Core
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentView('prototype')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'prototype' 
                  ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <MonitorPlay size={16} />
                v1.0 Core Engine
              </button>
              <button
                onClick={() => setCurrentView('progress')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'progress' 
                  ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium border border-transparent' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <ActivitySquare size={16} />
                Evolution Tracker
              </button>
              <button
                onClick={() => setCurrentView('telemetry')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'telemetry' 
                  ? 'bg-[rgba(59,130,246,0.15)] text-blue-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Activity size={16} />
                System Telemetry
              </button>
              <button
                onClick={() => setCurrentView('queue')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'queue' 
                  ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <ClipboardList size={16} />
                Task Queue
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#9494a0] font-bold uppercase tracking-[0.2em] mb-4 px-4 opacity-50">Experimental GUI</div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentView('vector')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'vector' 
                  ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Database size={16} />
                Deep Vector RAG
              </button>
              <button
                onClick={() => setCurrentView('components')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'components' 
                  ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <LayoutTemplate size={16} />
                Component Explorer
              </button>
              <button
                onClick={() => setCurrentView('dependencies')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'dependencies' 
                  ? 'bg-[rgba(139,92,246,0.15)] text-violet-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Network size={16} />
                Dependency Graph
              </button>
              <button
                onClick={() => setCurrentView('research')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'research' 
                  ? 'bg-[rgba(16,185,129,0.15)] text-emerald-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e2420]'
                }`}
              >
                <BrainCircuit size={16} />
                AGI Research Hub
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#9494a0] font-bold uppercase tracking-[0.2em] mb-4 px-4 opacity-50">Meta / System</div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentView('identity')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'identity' 
                  ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Contact size={16} />
                Agent Identity
              </button>
              <button
                onClick={() => setCurrentView('audit')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'audit' 
                  ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Network size={16} />
                Verify Audit Log
              </button>
              <button
                onClick={() => setCurrentView('cognition')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'cognition' 
                  ? 'bg-[rgba(99,102,241,0.15)] text-indigo-400 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <BrainCircuit size={16} />
                Cognitive Architecture
              </button>
              <button
                onClick={() => setCurrentView('swarm')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'swarm' 
                  ? 'bg-yellow-500/15 text-yellow-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Zap size={16} />
                Swarm Orchestrator
              </button>
              <button
                onClick={() => setCurrentView('innovation')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'innovation' 
                  ? 'bg-yellow-500/25 text-yellow-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Lightbulb size={16} />
                Innovation Hub
              </button>
              <button
                onClick={() => setCurrentView('spec')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'spec' 
                  ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <BookOpen size={16} />
                Architecture Spec
              </button>
              <button
                onClick={() => setCurrentView('plan')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'plan' 
                  ? 'bg-[rgba(168,85,247,0.15)] text-purple-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <ClipboardList size={16} />
                Execution Plan
              </button>
              <button
                onClick={() => setCurrentView('workspace')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'workspace' 
                  ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <FolderTree size={16} />
                Layered Workspace
              </button>
              <button
                onClick={() => setCurrentView('credits')}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentView === 'credits' 
                  ? 'bg-[rgba(236,72,153,0.15)] text-pink-500 font-medium' 
                  : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                }`}
              >
                <Heart size={16} />
                Credits
              </button>
            </div>
          </div>
        </div>
        
        {currentView === 'spec' && (
          <nav className="flex-1 space-y-2">
            <div className="text-xs text-[#9494a0] font-mono mb-3 uppercase tracking-wider pl-4">Document Sections</div>
            {navItems.map((item) => {
              const id = item.toLowerCase().replace(' ', '-');
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive 
                    ? 'text-[#f27d26] font-medium' 
                    : 'text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#1e1e24]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        )}
        
        <div className="mt-auto pt-6 border-t border-[#2a2a32]">
          <AgentSidebarStatus />
          <div className="text-[10px] text-[#4b4b53] font-mono mt-4 text-center">WAVE_FIELD_AGI_V1.0.4_REL</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        {currentView === 'spec' ? (
          <SpecDocument activeSection={activeSection} setActiveSection={setActiveSection} />
        ) : currentView === 'plan' ? (
          <ExecutionPlan />
        ) : currentView === 'prototype' ? (
          <PrototypeDashboard />
        ) : currentView === 'progress' ? (
          <ProgressTracker />
        ) : currentView === 'telemetry' ? (
          <TelemetryDashboard />
        ) : currentView === 'credits' ? (
          <Credits />
        ) : currentView === 'vector' ? (
          <VectorSearchUI />
        ) : currentView === 'components' ? (
          <ComponentExplorer />
        ) : currentView === 'dependencies' ? (
          <DependencyVisualizer />
        ) : currentView === 'research' ? (
          <AGIResearchHub />
        ) : currentView === 'identity' ? (
          <AgentIdentityUI />
        ) : currentView === 'audit' ? (
          <AgentAuditUI />
        ) : currentView === 'cognition' ? (
          <CognitionDashboard />
        ) : currentView === 'swarm' ? (
          <SwarmDashboard />
        ) : currentView === 'innovation' ? (
          <InnovationHub />
        ) : currentView === 'queue' ? (
          <TaskQueueDashboard />
        ) : (
          <WorkspaceExplorer />
        )}
      </main>
    </div>
  );
}

