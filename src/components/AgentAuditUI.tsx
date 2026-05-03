import React, { useState, useEffect } from 'react';
import { ShieldCheck, ServerCrash, Clock, Fingerprint } from 'lucide-react';
import Markdown from 'react-markdown';

export function AgentAuditUI() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cognitive-loop/episodic')
      .then(r => r.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-[#9494a0]">Loading Audit Matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-[#2a2a32] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">System Audit & Interaction Verify</h1>
          </div>
          <p className="text-[#9494a0] max-w-2xl">
            Verifying the last 20 chronological interactions / thoughts of the system.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setLoading(true);
              fetch('/api/cognitive-loop/episodic').then(r => r.json()).then(data => { setLogs(data); setLoading(false); });
            }}
            className="px-4 py-2 bg-[#2a2a32] text-[#f5f5f6] rounded-lg text-sm font-medium hover:bg-[#32323e] transition-colors"
          >
            Refresh
          </button>
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to clear the entire interaction history? This cannot be undone.')) {
                setLoading(true);
                await fetch('/api/cognitive-loop/start', { method: 'POST' });
                setLogs([]);
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Clear Matrix
          </button>
        </div>
      </header>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-[#9494a0] border border-dashed border-[#2a2a32] rounded-xl bg-[#0c0c0e]">
          No episodic interactions found.
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={index} className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4 text-xs text-[#9494a0] font-mono">
                  <span className="flex items-center gap-1 bg-[#2a2a32] px-2 py-1 rounded text-[#f5f5f6]">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Fingerprint size={12} />
                    ID: {log.id || 'N/A'}
                  </span>
                </div>

                {log.task && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#f5f5f6] uppercase tracking-wide mb-1">Triggered Task</h3>
                    <p className="text-lg text-[#f5f5f6] font-medium">&quot;{log.task}&quot;</p>
                  </div>
                )}
                
                {log.trigger && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#f5f5f6] uppercase tracking-wide mb-1">System Trigger</h3>
                    <p className="text-lg text-[#f5f5f6] font-medium capitalize">{log.trigger} Engine Pulse</p>
                  </div>
                )}

                <div className="bg-[#0c0c0e] border border-[#2a2a32] rounded-lg p-4 mt-4">
                   <h4 className="text-xs uppercase tracking-wide font-semibold text-[#f27d26] mb-2">Audit Yield / Analysis</h4>
                   <div className="prose prose-sm prose-invert max-w-none text-[#9494a0]">
                      <Markdown>{log.result || log.observation || "No resultant data logged."}</Markdown>
                   </div>
                </div>
                
                {log.goal && (
                   <div className="mt-4 pt-4 border-t border-[#2a2a32] text-xs text-[#9494a0] font-mono">
                      <span className="font-semibold">Goal Context: </span>
                      {log.goal.substring(0, 150)}...
                   </div>
                )}
                
                {log.context && (
                   <div className="mt-4 pt-4 border-t border-[#2a2a32] text-xs text-[#9494a0] font-mono">
                      <span className="font-semibold">Execution Context: </span>
                      {log.context}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
