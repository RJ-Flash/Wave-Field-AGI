import React, { useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw, CheckCircle2, XCircle, Clock, PlayCircle } from 'lucide-react';

interface Task {
  id: string;
  priority: 'high' | 'normal' | 'low';
  context: string;
  operation: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
  createdAt: number;
}

export function TaskQueueDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ priority: 'normal', context: '', operation: '' });

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/queue/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/queue/process', { method: 'POST' });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const handleRetry = async (taskId: string) => {
    try {
      await fetch('/api/queue/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.context || !newTask.operation) return;
    try {
      await fetch('/api/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      setShowAddForm(false);
      setNewTask({ priority: 'normal', context: '', operation: '' });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0c0c0e] text-[#f5f5f6] p-6 pt-24 md:pt-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Task Queue & Roadmap Ledger</h1>
            <p className="text-[#9494a0] mt-1">Autonomous sequential task execution engine replacing static spec.md.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a32] hover:bg-[#3a3a42] text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Add Task
            </button>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
              Force Process
            </button>
          </div>
        </header>

        {showAddForm && (
          <form onSubmit={handleAddTask} className="bg-[#16161a] p-6 rounded-xl border border-[#2a2a32] space-y-4">
            <h3 className="text-xl font-semibold mb-2">New Task via Brief</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#9494a0] mb-1">Context / Goal</label>
                <input
                  type="text"
                  required
                  value={newTask.context}
                  onChange={e => setNewTask({...newTask, context: e.target.value})}
                  className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-2 text-[#f5f5f6] focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Implement Ollama abstraction"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9494a0] mb-1">Operation</label>
                <input
                  type="text"
                  required
                  value={newTask.operation}
                  onChange={e => setNewTask({...newTask, operation: e.target.value})}
                  className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-2 text-[#f5f5f6] focus:outline-none focus:border-purple-500"
                  placeholder="e.g. build-qdrant"
                />
              </div>
              <div>
                <label className="block text-sm text-[#9494a0] mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                  className="w-full bg-[#0c0c0e] border border-[#2a2a32] rounded-lg px-4 py-2 text-[#f5f5f6] focus:outline-none focus:border-purple-500"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 font-medium transition-colors">
                  Submit Task
                </button>
              </div>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#16161a] rounded-xl border border-[#2a2a32]">
            <Clock className="text-[#9494a0] opacity-50 mb-4" size={48} />
            <h3 className="text-xl font-medium text-[#f5f5f6] mb-2">Queue is Empty</h3>
            <p className="text-[#9494a0]">No tasks in the autonomous queue. Add a brief to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-[#16161a] border border-[#2a2a32] rounded-xl overflow-hidden">
              <thead className="bg-[#2a2a32]/50 text-[#9494a0] text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Context</th>
                  <th className="px-6 py-3 font-medium">Operation</th>
                  <th className="px-6 py-3 font-medium">Retries</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a32]">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-[#1e1e24] transition-colors">
                    <td className="px-6 py-4">
                      {task.status === 'completed' && <span className="flex items-center gap-1 text-emerald-500 text-sm"><CheckCircle2 size={16}/> Completed</span>}
                      {task.status === 'failed' && <span className="flex items-center gap-1 text-red-500 text-sm"><XCircle size={16}/> Failed</span>}
                      {task.status === 'processing' && <span className="flex items-center gap-1 text-blue-500 text-sm"><RefreshCw size={16} className="animate-spin"/> Processing</span>}
                      {task.status === 'pending' && <span className="flex items-center gap-1 text-yellow-500 text-sm"><Clock size={16}/> Pending</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'normal' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate" title={task.context}>
                      {task.context}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-purple-400">
                      {task.operation}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9494a0]">
                      {task.retries}
                    </td>
                    <td className="px-6 py-4">
                      {task.status === 'failed' && (
                        <button 
                          onClick={() => handleRetry(task.id)}
                          className="text-sm px-3 py-1 bg-[#2a2a32] hover:bg-[#3a3a42] rounded text-[#f5f5f6]"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
