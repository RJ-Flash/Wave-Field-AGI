import React, { useState, useEffect } from 'react';
import { Brain, Save, Settings, ShieldAlert, Cpu, HeartPulse, RefreshCcw, AlertTriangle } from 'lucide-react';

export function AgentIdentityUI() {
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [focusInput, setFocusInput] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [gaps, setGaps] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/agent-identity')
      .then(r => r.json())
      .then(data => {
        setIdentity(data);
        setFocusInput(data.currentFocus || '');
        setLoading(false);
      });
  }, []);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/system/audit');
      const data = await res.json();
      setGaps(data.gaps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditing(false);
    }
  };

  const updateFocus = async () => {
    await fetch('/api/agent-identity/focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focus: focusInput })
    });
    setIdentity({ ...identity, currentFocus: focusInput });
  };

  if (loading) return <div className="p-8 text-[#9494a0]">Loading Identity Matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-[#2a2a32] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Brain size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Mem0 Agent Identity</h1>
          </div>
          <p className="text-[#9494a0] max-w-2xl">
            Persistent personality, core directives, and autonomy levels.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#f5f5f6] mb-4 flex items-center gap-2">
            <Cpu size={20} className="text-emerald-400" />
            Current Focus & Autonomy
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#9494a0] block mb-2">Architectural Lineage</label>
              <div className="flex flex-col gap-2 mb-4">
                <div className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-3">
                  <div className="text-white text-xs font-bold uppercase tracking-wider mb-1">Collaborative Paradigm</div>
                  <div className="text-[#9494a0] text-[11px] leading-relaxed italic">
                    Inspired by "Folder-as-Workspace" (Jake Van Clief) and "Wave Field Attention" (Avinash Badaramoni).
                  </div>
                </div>
              </div>
              <label className="text-sm font-medium text-[#9494a0] block mb-2">Active Autonomy Level</label>
              <div className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-3 text-[#f5f5f6] font-mono text-sm capitalize flex justify-between items-center">
                <span>{identity.autonomyLevel}</span>
                {identity.autonomyLevel === 'fully-autonomous' ? 
                  <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  : <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                }
              </div>
              <p className="text-xs text-[#9494a0] mt-2">
                Last awakening: {new Date(identity.lastAwakening).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-[#9494a0] block mb-2">System Focus Alignment</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="flex-1 bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-3 text-[#f5f5f6] focus:outline-none focus:border-indigo-500 font-mono text-sm"
                />
                <button 
                  onClick={updateFocus}
                  className="bg-[#2a2a32] hover:bg-[#3a3a42] text-[#f5f5f6] px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save size={16} /> Sync
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#f5f5f6] flex items-center gap-2">
              <HeartPulse size={20} className="text-pink-400" />
              Meta-Cognitive Audit
            </h2>
            <button 
              onClick={runAudit}
              disabled={auditing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${auditing ? 'bg-pink-500/20 text-pink-500 animate-pulse' : 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'}`}
            >
              <RefreshCcw size={14} className={auditing ? 'animate-spin' : ''} />
              {auditing ? 'Scanning Layers...' : 'Run Full Audit'}
            </button>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {gaps.length === 0 && !auditing && (
              <div className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-8 text-center">
                <ShieldAlert className="mx-auto mb-3 text-[#4b4b53]" size={32} />
                <p className="text-[#9494a0] text-sm">No active anomalies detected in current workspace.</p>
              </div>
            )}
            
            {gaps.map((gap, idx) => (
              <div key={idx} className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-4 flex gap-4">
                <div className={`shrink-0 p-2 rounded-lg h-fit ${gap.severity === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#f5f5f6] text-sm font-bold uppercase tracking-wider">{gap.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${gap.severity === 'high' ? 'bg-rose-500/20 text-rose-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{gap.severity}</span>
                  </div>
                  <p className="text-[#f5f5f6] text-[13px] leading-relaxed mb-2 font-medium">{gap.description}</p>
                  <div className="text-[11px] text-[#9494a0] leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                    Recommendation: {gap.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-[#f5f5f6] mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-400" />
                Core Directives
              </h2>
              <div className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-4 h-full">
                <ul className="space-y-3">
                  {identity.coreDirectives?.map((directive: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-[#f5f5f6]">
                      <span className="text-[#9494a0] font-mono whitespace-nowrap">0x0{idx+1}</span>
                      <span className="leading-snug">{directive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-[#f5f5f6] mb-4 flex items-center gap-2">
                <Settings size={20} className="text-indigo-400" />
                Learned Preferences
              </h2>
              <div className="bg-[#0f0f13] border border-[#2a2a32] rounded-lg p-4 h-full">
                <ul className="space-y-3">
                  {identity.learnedPreferences?.map((pref: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#9494a0]">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{pref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
