import React, { useState, useEffect } from 'react';
import { SYSTEM_LAYERS, PHASES, BUILD_SEQUENCE } from '../data/planData';
import { Terminal, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface SpecDocumentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function SpecDocument({ activeSection, setActiveSection }: SpecDocumentProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
      }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [setActiveSection]);

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative">
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(242,125,38,0.1),transparent_50%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto p-8 md:p-16 space-y-32 pb-32 relative z-10">
        
        {/* Header/Overview */}
        <section id="overview" className="space-y-6 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(242,125,38,0.1)] border border-[rgba(242,125,38,0.2)] text-[#f27d26] text-xs font-mono mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#f27d26] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            SYSTEM SPEC DRAFT v1.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent"
          >
            Cognitive Architecture
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-[#9494a0] max-w-2xl leading-relaxed mt-6 mb-12"
          >
            A modular system built around <strong className="text-[#f5f5f6]">Wave Field LLM</strong> as the long-context memory substrate. 
            The ultimate goal is treating AGI as a system architecture problem, focusing on cognition, planning, action, reflection, and learning.
          </motion.p>

          <div className="mt-12 h-64 md:h-80 w-full overflow-hidden rounded-2xl border border-[#2a2a32] bg-[#0c0c0e] relative flex items-center justify-center">
            {/* Simplified network visual using concentric circles and glowing lines */}
              <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[800px] h-[800px] absolute rounded-full border border-[rgba(242,125,38,0.05)] animate-[spin_60s_linear_infinite]" />
              <div className="w-[600px] h-[600px] absolute rounded-full border border-[rgba(242,125,38,0.1)] animate-[spin_40s_linear_infinite_reverse]" />
              <div className="w-[400px] h-[400px] absolute rounded-full border border-[rgba(242,125,38,0.15)] animate-[spin_20s_linear_infinite]" />
              
              {/* Node grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
            </div>
            
            <div className="relative z-10 p-8 rounded-full bg-[#16161a] border border-[#f27d26]/30 shadow-[0_0_40px_rgba(242,125,38,0.1)]">
                <div className="text-center">
                  <div className="text-[#f27d26] font-mono text-sm tracking-widest mb-1">CORE</div>
                  <div className="font-bold text-xl tracking-tight">Wave Field Engine</div>
                </div>
            </div>
          </div>
        </section>

        {/* System Layers */}
        <section id="system-layers" className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Terminal className="text-[#f27d26]" /> 
              System Layers
            </h2>
            <p className="text-[#9494a0] mt-4 max-w-2xl">
              The architecture is divided into specialized modules. The core long-range memory and history is handled by Wave Field LLM, 
              minimizing the attention cost over millions of tokens.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SYSTEM_LAYERS.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div key={idx} className="group p-6 rounded-2xl bg-[#16161a] border border-[#2a2a32] hover:border-[#f27d26]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#0c0c0e] border border-[#2a2a32] group-hover:border-[#f27d26]/30 text-[#f27d26]">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{layer.name}</h3>
                      <p className="text-[#9494a0] text-sm leading-relaxed">{layer.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Phases */}
        <section id="phases" className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Milestone Roadmap</h2>
            <p className="text-[#9494a0] mt-4 max-w-2xl">
              The progression path from advanced agent to general intelligence. Each phase adds key cognitive capabilities.
            </p>
          </div>
          
          <div className="relative border-l border-[#2a2a32] ml-4 md:ml-6 space-y-12">
            {PHASES.map((phase, idx) => (
              <div key={idx} className="pl-10 relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#f27d26] ring-4 ring-[#0c0c0e]" />
                
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-[#f27d26] bg-[rgba(242,125,38,0.1)] px-2 py-0.5 rounded">
                      {phase.version}
                    </span>
                    <h3 className="text-2xl font-bold">{phase.title}</h3>
                  </div>
                  <p className="text-[#9494a0]">{phase.goal}</p>
                </div>
                
                <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] rounded-3xl p-6 mt-6 relative group overflow-hidden transition-all duration-300 hover:border-[#f27d26]/30 hover:shadow-[0_0_30px_rgba(242,125,38,0.05)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f27d26]/0 to-[#f27d26]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h4 className="text-sm font-mono text-[#9494a0] mb-4 uppercase tracking-wider relative z-10">Components added:</h4>
                  <ul className="space-y-3 mb-8 relative z-10">
                    {phase.adds.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <ChevronRight size={16} className="text-[#f27d26] shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base text-[#9494a0] group-hover:text-[#f5f5f6] transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-[#0c0c0e]/90 p-4 rounded-xl border border-[rgba(242,125,38,0.2)] relative z-10">
                    <h4 className="text-xs font-mono text-[#f27d26] mb-2 uppercase flex items-center gap-2">
                      <CheckCircle2 size={14} /> Success Metric
                    </h4>
                    <p className="text-sm text-[#f5f5f6]">{phase.success}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Build Sequence */}
        <section id="build-sequence" className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Implementation Order</h2>
            <p className="text-[#9494a0] mt-4 max-w-2xl">
              The recommended sequence of development to build the entire system from the ground up prioritizing core memory and planning first.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BUILD_SEQUENCE.map((step, idx) => (
              <div key={idx} className="bg-[#16161a] p-5 rounded-xl border border-[#2a2a32] flex items-center gap-4 hover:bg-[#1e1e24] transition-colors">
                <div className="font-mono text-2xl font-bold text-[#2a2a32]">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <div className="font-medium">{step}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
