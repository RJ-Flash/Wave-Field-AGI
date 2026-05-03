import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, CheckCircle2, Circle, RefreshCcw, Loader2, Zap, Play, Square } from 'lucide-react';

interface PlanStep {
  id: string;
  step: number;
  action: string;
  expected_outcome: string;
  status: 'pending' | 'completed';
  last_result?: string;
}

export function ExecutionPlan() {
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isAutoExecuting, setIsAutoExecuting] = useState(false);
  const autoExecRef = useRef(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/execution-plan');
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const toggleStep = async (id: string) => {
    // Optimistic UI update
    setPlan(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'completed' ? 'pending' : 'completed' } : p));
    try {
      await fetch(`/api/execution-plan/${id}/toggle`, { method: 'POST' });
    } catch (e) {
      // Revert if error
      fetchPlan();
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/agents/spec-planner', { method: 'POST' });
      if (res.ok) {
        await fetchPlan();
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const executeNextStep = async () => {
    setIsExecuting(true);
    let success = false;
    try {
      const res = await fetch('/api/execution-plan/execute-next', { method: 'POST' });
      if (res.ok) {
        await fetchPlan(); // update plan state
        success = true;
      }
    } catch (e) {
      console.error(e);
    }
    setIsExecuting(false);
    return success;
  };

  const toggleAutoExecute = async () => {
    if (isAutoExecuting) {
      setIsAutoExecuting(false);
      autoExecRef.current = false;
      return;
    }
    
    setIsAutoExecuting(true);
    autoExecRef.current = true;
    
    let pending = true;
    while (autoExecRef.current && pending) {
      const success = await executeNextStep();
      if (!success) {
         break;
      }
      
      const res = await fetch('/api/execution-plan');
      if (res.ok) {
         const data = await res.json();
         pending = data.some((p: any) => p.status === 'pending');
      } else {
         pending = false;
      }
    }
    
    setIsAutoExecuting(false);
    autoExecRef.current = false;
  };

  const handleQuickAdd = async (requirement: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/spec/intake', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement })
      });
      if (res.ok) {
        // Clear input
        const input = document.getElementById('specUpdateInput') as HTMLInputElement;
        if(input) input.value = '';
        await generatePlan();
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const completedCount = plan.filter(p => p.status === 'completed').length;
  const progressPercent = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0;
  const hasPending = plan.some(p => p.status === 'pending');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-purple-500" size={28} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Execution Plan</h1>
              <p className="text-[#9494a0] mt-1">Autonomous sequential roadmap generated from spec.md</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={generatePlan}
              disabled={isGenerating || isExecuting}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm bg-[#2a2a32] hover:bg-[#3a3a42] text-white rounded-lg font-medium transition-colors disabled:opacity-50 w-full md:w-auto"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              {plan.length > 0 ? 'Regenerate Plan' : 'Generate Plan'}
            </button>
            {plan.length > 0 && hasPending && (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={executeNextStep}
                  disabled={isExecuting || isGenerating || isAutoExecuting}
                  className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex-1 whitespace-nowrap"
                >
                  {isExecuting && !isAutoExecuting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  Next Step
                </button>
                <button
                  onClick={toggleAutoExecute}
                  disabled={isGenerating}
                  className={`flex items-center justify-center gap-2 px-6 py-3 sm:py-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex-1 whitespace-nowrap ${isAutoExecuting ? 'bg-red-500 hover:bg-red-600 box-shadow-none shadow-none' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
                >
                  {isAutoExecuting ? (
                    <>
                      <Square size={18} className="fill-current" /> Stop Setup
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current" /> Auto-Execute All
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        {!isLoading && plan.length > 0 && (
          <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-4 md:p-6 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#9494a0]">Overall Progress</span>
              <span className="text-[#f5f5f6] font-bold">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full bg-[#2a2a32] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-[#9494a0]">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : plan.length === 0 ? (
            <div className="bg-[#16161a] border border-[#2a2a32] border-dashed rounded-xl p-12 text-center flex flex-col items-center">
              <ClipboardList className="text-[#9494a0] opacity-50 mb-4" size={48} />
              <h3 className="text-xl font-medium text-[#f5f5f6] mb-2">No Execution Plan Yet</h3>
              <p className="text-[#9494a0] max-w-md mb-6">
                Trigger the Spec Analyzer agent to read the current spec.md and break it down into actionable steps.
              </p>
              <button
                onClick={generatePlan}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : 'Generate Now'}
              </button>
            </div>
          ) : (
            plan.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-start gap-4 p-4 md:p-6 rounded-xl border transition-all duration-200 ${
                  item.status === 'completed' 
                    ? 'bg-[#16161a]/50 border-[#2a2a32]/50 opacity-70' 
                    : 'bg-[#1a1a24] border-purple-500/30 hover:border-purple-500/60'
                }`}
              >
                <button 
                  onClick={() => toggleStep(item.id)}
                  className="mt-1 flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2a2a32] text-[#9494a0]">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${item.status === 'completed' ? 'text-[#9494a0] line-through' : 'text-[#f5f5f6]'}`}>
                    {item.action}
                  </h3>
                  <div className={`text-sm p-3 rounded bg-[#0c0c0e]/50 border border-[#2a2a32] ${item.status === 'completed' ? 'text-[#9494a0]' : 'text-blue-300'} mb-2`}>
                    <span className="font-semibold opacity-80 mr-1">Outcome:</span> {item.expected_outcome}
                  </div>
                  {item.last_result && (
                    <div className="text-sm p-3 rounded bg-[#1e1e28] border border-[#3a3a4c] text-[#f5f5f6] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      <span className="text-[#a855f7] font-semibold block mb-1">Last Execution Result:</span>
                      {item.last_result}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {plan.length > 0 && (
            <div className="mt-8 flex flex-col gap-4 bg-[#16161a] p-6 rounded-xl border border-[#2a2a32]">
              <div>
                <h3 className="text-lg font-medium text-[#f5f5f6]">Update Spec & Regenerate Plan</h3>
                <p className="text-sm text-[#9494a0] mt-1">Want to shift directions? Enter a new requirement—it will automatically append to spec.md and rebuild the execution plan.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="E.g., Require the component explorer to support sorting..." 
                  className="flex-1 bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-3 sm:py-2 text-sm sm:text-base text-[#f5f5f6] focus:outline-none focus:border-purple-500 transition-colors"
                  id="specUpdateInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if(val) handleQuickAdd(val);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('specUpdateInput') as HTMLInputElement;
                    if(input && input.value) handleQuickAdd(input.value);
                  }}
                  disabled={isGenerating}
                  className="px-6 py-3 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  Auto-Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
