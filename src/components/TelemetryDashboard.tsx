import React, { useState, useEffect } from 'react';
import { Activity, Zap, Layers, Database, Clock, RefreshCcw, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TelemetryDashboard() {
  const [metrics, setMetrics] = useState({
    latency: [],
    memoryDepth: 0,
    activeAgents: 0,
    avgThoughtTime: 0,
    totalThoughts: 0,
    webhookEvents: 0
  });

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_100%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <Activity className="text-blue-500" size={28} />
          <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">System Telemetry</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9494a0] uppercase tracking-wider text-xs font-mono">
              <Zap size={14} className="text-blue-500" /> Latency (ms)
            </div>
            <div className="text-3xl font-bold text-blue-400">{metrics.latency.length > 0 ? metrics.latency[metrics.latency.length - 1].uv : 0}</div>
          </div>
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9494a0] uppercase tracking-wider text-xs font-mono">
              <Database size={14} className="text-[#f27d26]" /> Semantic Depth
            </div>
            <div className="text-3xl font-bold text-[#f27d26]">{metrics.memoryDepth}</div>
          </div>
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9494a0] uppercase tracking-wider text-xs font-mono">
              <Layers size={14} className="text-emerald-500" /> Episodic Traces
            </div>
            <div className="text-3xl font-bold text-emerald-400">{metrics.totalThoughts}</div>
          </div>
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9494a0] uppercase tracking-wider text-xs font-mono">
              <Clock size={14} className="text-pink-500" /> Avg Thought Time
            </div>
            <div className="text-3xl font-bold text-pink-400">{(metrics.avgThoughtTime / 1000).toFixed(2)}s</div>
          </div>
          <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9494a0] uppercase tracking-wider text-xs font-mono">
              <RefreshCcw size={14} className="text-purple-500" /> Webhook Events
            </div>
            <div className="text-3xl font-bold text-purple-400">{metrics.webhookEvents}</div>
          </div>
        </div>

        <div className="bg-[#16161a]/80 backdrop-blur-xl border border-[#2a2a32] p-6 rounded-2xl h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Cpu className="text-blue-500" size={20} /> Cognitive Latency Over Time
            </h2>
          </div>
          <div className="flex-1 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.latency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
                <XAxis dataKey="name" stroke="#9494a0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9494a0" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161a', border: '1px solid #2a2a32', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uv" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#16161a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
