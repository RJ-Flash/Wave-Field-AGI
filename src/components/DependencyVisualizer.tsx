import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, RefreshCw, FileText, Code2, Database, Layout, Info, Search, List, Activity } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'motion/react';

export function DependencyVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDependencies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dependencies');
      const data = await res.json();
      if (data.nodes) {
        setGraphData({
          nodes: data.nodes,
          links: data.edges.map((e: any) => ({ ...e }))
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const updateHighlight = useCallback(() => {
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  }, [highlightNodes, highlightLinks]);

  const handleNodeHighlight = (node: any) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node.id);
      graphData.links.forEach((link: any) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(link.source.id);
          highlightNodes.add(link.target.id);
        }
      });
    }
    updateHighlight();
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 400);
      graphRef.current.zoom(2, 400);
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'workspace': return '#3b82f6'; // Blue
      case 'frontend': return '#ec4899';  // Pink
      case 'core': return '#10b981';      // Emerald
      case 'server': return '#f27d26';    // Orange
      default: return '#9494a0';
    }
  };

  const filteredNodes = searchTerm 
    ? graphData.nodes.filter((n: any) => n.id.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const stats = {
    total: graphData.nodes.length,
    links: graphData.links.length,
    groups: Array.from(new Set(graphData.nodes.map((n: any) => n.group))).length
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto relative">
      <div className="max-w-full mx-auto w-full relative z-10 flex flex-col h-full p-4 md:p-8 gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2a2a32] rounded-lg">
                <Network className="text-[#f27d26]" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Dependency Visualizer</h1>
            </div>
            <p className="text-[#9494a0] max-w-2xl">
              Robust node graph representation of Wave Field architecture. Trace imports, markdown links, and system-wide execution flow.
            </p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b4b53]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search architecture..."
                  className="bg-[#16161a] border border-[#2a2a32] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#f27d26]/50 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <AnimatePresence>
                  {searchTerm && filteredNodes.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-0 right-0 bg-[#1e1e24] border border-[#2a2a32] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                    >
                      {filteredNodes.map((n: any) => (
                        <button 
                          key={n.id}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-[#2a2a32] transition-colors flex items-center justify-between"
                          onClick={() => {
                            handleNodeClick(n);
                            setSearchTerm('');
                          }}
                        >
                          <span className="truncate">{n.id}</span>
                          <span className="text-[10px] uppercase font-bold text-[#4b4b53]">{n.group}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <button onClick={loadDependencies} className="flex items-center gap-2 bg-[#16161a] border border-[#2a2a32] px-4 py-2 rounded-lg hover:border-[#f27d26]/50">
               <RefreshCw size={18} className={loading ? 'animate-spin text-[#f27d26]' : 'text-[#f27d26]'} />
               <span className="text-sm font-medium">Relink Graph</span>
             </button>
          </div>
        </header>

        <div className="flex-1 flex gap-6 min-h-0">
          <div 
            ref={containerRef}
            className="bg-[#16161a] border border-[#2a2a32] rounded-2xl overflow-hidden flex-1 relative flex items-center justify-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,125,38,0.03),transparent_70%)] pointer-events-none z-0" />
            
            <div className="absolute inset-0 z-10">
              <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel={() => ''} // Handles manually
                nodeRelSize={1}
                nodeVal={(node: any) => Math.sqrt(node.size || 1000) / 10 + 2}
                nodeColor={(node: any) => {
                  if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) return '#1e1e24';
                  return getGroupColor(node.group);
                }}
                linkColor={(link: any) => {
                  if (highlightLinks.size > 0 && !highlightLinks.has(link)) return '#1e1e24';
                  return '#2a2a32';
                }}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
                backgroundColor="#16161a"
                d3VelocityDecay={0.3}
                onNodeHover={(node) => {
                  setHoverNode(node);
                  handleNodeHighlight(node);
                  containerRef.current!.style.cursor = node ? 'pointer' : null;
                }}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const label = node.name || node.id.split('/').pop();
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Inter`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                  const size = Math.sqrt(node.size || 1000) / 10 + 2;
                  const alpha = (highlightNodes.size > 0 && !highlightNodes.has(node.id)) ? 0.1 : 1;

                  // Draw circle
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                  ctx.fillStyle = getGroupColor(node.group);
                  ctx.globalAlpha = alpha;
                  ctx.fill();

                  // Draw text
                  if (globalScale > 3 || (highlightNodes.size > 0 && highlightNodes.has(node.id))) {
                    ctx.fillStyle = 'rgba(245, 245, 246, ' + alpha + ')';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, node.x, node.y + size + fontSize + 2);
                  }
                  ctx.globalAlpha = 1;
                }}
              />
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
               <div className="flex items-center gap-4 bg-[#0c0c0e]/80 backdrop-blur-md border border-[#2a2a32] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f27d26]" /> Server</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ec4899]" /> Frontend</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Core</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Workspace</div>
               </div>
            </div>

            <AnimatePresence>
               {hoverNode && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute top-4 left-4 z-30 bg-[#0c0c0e]/90 backdrop-blur-md border border-[#2a2a32] p-4 rounded-2xl min-w-[200px] pointer-events-none"
                 >
                   <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 bg-[#16161a] rounded-lg border border-[#2a2a32]">
                         {hoverNode.type === 'md' ? <FileText size={16} className="text-[#3b82f6]" /> : <Code2 size={16} className="text-[#f27d26]" />}
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-[#f5f5f6] truncate max-w-[150px]">{hoverNode.name}</h3>
                         <p className="text-[10px] uppercase font-bold text-[#4b4b53]">{hoverNode.group}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                         <div className="text-[10px] uppercase font-bold text-[#9494a0] mb-0.5">Size</div>
                         <div className="text-xs font-mono">{(hoverNode.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <div>
                         <div className="text-[10px] uppercase font-bold text-[#9494a0] mb-0.5">Extension</div>
                         <div className="text-xs font-mono">.{hoverNode.type}</div>
                      </div>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="w-80 flex flex-col gap-6">
             <div className="bg-[#16161a] border border-[#2a2a32] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#f5f5f6] mb-4 flex items-center gap-2">
                   <Activity size={16} className="text-[#f27d26]" />
                   Architecture Insight
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-[#0c0c0e]/50 p-3 rounded-xl border border-[#2a2a32]">
                      <span className="text-xs text-[#9494a0]">Total Nodes</span>
                      <span className="text-lg font-bold text-[#f5f5f6]">{stats.total}</span>
                   </div>
                   <div className="flex justify-between items-center bg-[#0c0c0e]/50 p-3 rounded-xl border border-[#2a2a32]">
                      <span className="text-xs text-[#9494a0]">Linked Dependencies</span>
                      <span className="text-lg font-bold text-[#f5f5f6]">{stats.links}</span>
                   </div>
                   <div className="flex justify-between items-center bg-[#0c0c0e]/50 p-3 rounded-xl border border-[#2a2a32]">
                      <span className="text-xs text-[#9494a0]">Module Clusters</span>
                      <span className="text-lg font-bold text-[#f5f5f6]">{stats.groups}</span>
                   </div>
                </div>
             </div>

             <AnimatePresence mode="wait">
               {selectedNode ? (
                 <motion.div 
                   key={selectedNode.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="bg-[#16161a] border border-[#2a2a32] rounded-2xl p-6 flex-1 flex flex-col"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <h3 className="text-lg font-bold text-[#f5f5f6] leading-tight break-all">{selectedNode.id}</h3>
                       <button onClick={() => setSelectedNode(null)} className="text-[#4b4b53] hover:text-[#f5f5f6]">
                          <Info size={18} />
                       </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                       <section>
                          <h4 className="text-[10px] uppercase font-bold text-[#4b4b53] mb-3 flex items-center gap-2">
                             <Layout size={12} />
                             Metadata
                          </h4>
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs">
                                <span className="text-[#9494a0]">Type</span>
                                <span className="text-white">.{selectedNode.type}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                <span className="text-[#9494a0]">Byte Weight</span>
                                <span className="text-white">{selectedNode.size.toLocaleString()} bytes</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                <span className="text-[#9494a0]">Module Group</span>
                                <span className="text-[#f27d26] font-bold">{selectedNode.group}</span>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h4 className="text-[10px] uppercase font-bold text-[#4b4b53] mb-3 flex items-center gap-2">
                             <List size={12} />
                             Direct Connections
                          </h4>
                          <div className="space-y-2">
                             {graphData.links.filter((l: any) => l.source.id === selectedNode.id || l.target.id === selectedNode.id).slice(0, 10).map((l: any, i) => {
                                const other = l.source.id === selectedNode.id ? l.target : l.source;
                                return (
                                  <button 
                                    key={i}
                                    className="w-full text-left p-2 rounded-lg bg-[#0c0c0e] border border-[#2a2a32] hover:border-[#f27d26]/30 transition-all group"
                                    onClick={() => handleNodeClick(other)}
                                  >
                                    <div className="text-[10px] text-[#4b4b53] flex justify-between">
                                       <span>{l.source.id === selectedNode.id ? 'Outbound' : 'Inbound'}</span>
                                       <span className="group-hover:text-[#f27d26]">Focus →</span>
                                    </div>
                                    <div className="text-[11px] font-mono truncate text-[#9494a0] group-hover:text-[#f5f5f6]">{other.id}</div>
                                  </button>
                                );
                             })}
                             {graphData.links.filter((l: any) => l.source.id === selectedNode.id || l.target.id === selectedNode.id).length === 0 && (
                                <div className="text-xs text-[#4b4b53] italic">No direct links detected.</div>
                             )}
                          </div>
                       </section>
                    </div>

                    <button 
                      className="mt-6 w-full py-3 bg-[#f27d26] text-black font-bold rounded-xl hover:bg-[#f27d26]/90 transition-all flex items-center justify-center gap-2"
                      onClick={() => {
                        // Action could be "Open File" or similar
                      }}
                    >
                       <Code2 size={16} />
                       Open Module
                    </button>
                 </motion.div>
               ) : (
                 <div className="bg-[#16161a] border border-[#2a2a32] border-dashed rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-[#0c0c0e] rounded-full mb-4">
                       <Database size={32} className="text-[#2a2a32]" />
                    </div>
                    <p className="text-sm font-bold text-[#4b4b53]">Select a node to inspect system-wide linkages and module metadata.</p>
                 </div>
               )}
             </AnimatePresence>
          </aside>
        </div>
      </div>
    </div>
  );
}

