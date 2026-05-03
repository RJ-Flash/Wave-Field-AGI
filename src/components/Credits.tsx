import React from 'react';
import { Heart, Cpu, Code2, Globe, Database, BookOpen, Star } from 'lucide-react';
import { motion } from 'motion/react';

const TEAM_AND_CONTRIBUTORS = [
  {
    category: "Master Architects & Visionaries",
    icon: <Star className="text-yellow-400" size={24} />,
    items: [
      { name: "Jake Van Clief", description: "Pioneer of the 'Folder-as-Workspace' architecture and Markdown-based native routing." },
      { name: "Avinash Badaramoni", description: "Creator of Wave Field LLM (a novel attention mechanism achieving O(N log N) complexity, replacing standard O(N²) dot-product attention)." },
      { name: "RJGonzalez", description: "System integration, orchestration, and putting the entire AGI vision together." },
    ]
  },
  {
    category: "Concepts & Architecture",
    icon: <BookOpen className="text-blue-400" size={24} />,
    items: [
      { name: "Folder-as-Workspace", description: "Inspired by modern AI workflow pioneers treating file systems as native routing layers." },
      { name: "Cognitive Loop Model", description: "Plan-Act-Reflect patterns modeled after AGI research and standard autonomous agent architectures." },
    ]
  },
  {
    category: "Free AGI Infrastructure",
    icon: <Globe className="text-green-400" size={24} />,
    items: [
      { name: "Ollama", description: "For enabling zero-cost, local LLM execution capabilities." },
      { name: "Hugging Face", description: "Providing accessible inference APIs for open-source models." },
      { name: "Google AI Studio", description: "Providing workspace environments and Gemini LLM access." },
    ]
  },
  {
    category: "Models & Reasoners",
    icon: <Cpu className="text-purple-400" size={24} />,
    items: [
      { name: "Meta (Llama Family)", description: "Llama 3.2 models powering smart and fast routing paths." },
      { name: "DeepSeek & Qwen", description: "Leading open-weight models for coding and structured reasoning." },
      { name: "Google (Gemini Family)", description: "Gemini 3 Flash and Pro for reliable fallback and cognition." },
    ]
  },
  {
    category: "Core Technologies",
    icon: <Code2 className="text-orange-400" size={24} />,
    items: [
      { name: "Node.js & Express", description: "Powering the persistent backend and execution Sandbox." },
      { name: "React & Vite", description: "Driving the reactive, rapid-compilation frontend." },
      { name: "Tailwind CSS", description: "Providing utility-first, hyper-fast styling." },
      { name: "Lucide & Motion", description: "Beautiful iconography and fluid spring-based animations." },
    ]
  }
];

export function Credits() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.05)_0%,transparent_80%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="mb-10 text-center mt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#16161a] border border-[#2a2a32] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/10">
              <Heart className="text-pink-500" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#f5f5f6] mb-4">
            Credits & Attributions
          </h1>
          <p className="text-[#9494a0] max-w-2xl mx-auto leading-relaxed">
            This continuous evolution architecture is built upon the incredible work of the open-source community, AI researchers, and framework developers. 
            We stand on the shoulders of giants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {TEAM_AND_CONTRIBUTORS.map((section, idx) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#16161a]/60 backdrop-blur-md border border-[#2a2a32] rounded-3xl p-6 hover:border-pink-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#2a2a32]">
                <div className="p-3 bg-[#0c0c0e] rounded-xl border border-[#2a2a32]">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-[#f5f5f6]">{section.category}</h2>
              </div>
              
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.name} className="group">
                    <h3 className="text-[#f5f5f6] font-medium mb-1 group-hover:text-pink-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#9494a0] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center pb-12">
          <p className="text-xs font-mono text-[#9494a0] uppercase tracking-widest">
            Always Building. Always Evolving.
          </p>
        </div>
      </div>
    </div>
  );
}
