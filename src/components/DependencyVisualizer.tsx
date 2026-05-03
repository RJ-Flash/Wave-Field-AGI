import React, { useState, useEffect, useRef } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

export function DependencyVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

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
        // Map edges to links format for force graph
        setGraphData({
          nodes: data.nodes.map((n: any) => ({ ...n, val: 15 })),
          links: data.edges.map((e: any) => ({ source: e.source, target: e.target }))
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-6 h-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2a2a32] rounded-lg">
                <Network className="text-[#f27d26]" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Dependency Visualizer</h1>
            </div>
            <p className="text-[#9494a0] max-w-2xl">
              File execution dependencies, contextual linking, and node graph representation of workspace files.
            </p>
          </div>
          <button onClick={loadDependencies} className="flex items-center gap-2 bg-[#16161a] border border-[#2a2a32] px-4 py-2 rounded-lg hover:border-[#f27d26]/50">
            <RefreshCw size={18} className={loading ? 'animate-spin text-[#f27d26]' : 'text-[#f27d26]'} />
            <span className="text-sm font-medium">Reload Graph</span>
          </button>
        </header>

        <div 
          ref={containerRef}
          className="bg-[#16161a] border border-[#2a2a32] rounded-xl overflow-hidden flex-1 relative flex items-center justify-center min-h-[500px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,125,38,0.05),transparent_70%)] pointer-events-none z-0" />
          
          <div className="absolute inset-0 z-10">
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="id"
              nodeColor={(node: any) => {
                if (node.group === 1) return '#f27d26';
                if (node.group === 2) return '#ec4899';
                if (node.group === 3) return '#3b82f6';
                return '#10b981';
              }}
              linkColor={() => '#2a2a32'}
              backgroundColor="#16161a"
              nodeRelSize={6}
              linkWidth={2}
              d3VelocityDecay={0.3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
