import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  LayoutTemplate,
  Menu,
  X,
  Edit2,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type FileType = 'file' | 'folder';

export interface FileNode {
  name: string;
  type: FileType;
  path?: string;
  content?: string;
  children?: FileNode[];
}

export function WorkspaceExplorer() {
  const [workspaceTree, setWorkspaceTree] = useState<FileNode | null>(null);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch('/api/workspace/files');
      if (res.ok) {
        const tree = await res.json();
        setWorkspaceTree(tree);
        // If active file was open, try to update its content from new tree
        if (activeFile && activeFile.path) {
          const updatedFile = findFileInTree(tree, activeFile.path);
          if (updatedFile) {
             setActiveFile({ ...updatedFile });
             if (!isEditing) setEditContent(updatedFile.content || '');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const findFileInTree = (node: FileNode, path: string): FileNode | null => {
    if (node.path === path && node.type === 'file') return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findFileInTree(child, path);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchWorkspace();
    const interval = setInterval(fetchWorkspace, 20000); // Polling for changes
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (node: FileNode) => {
    if (activeFile?.path !== node.path) {
      setActiveFile(node);
      setIsEditing(false);
      setEditContent(node.content || '');
    }
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleSave = async () => {
    if (!activeFile || !activeFile.path) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/workspace/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath: activeFile.path, content: editContent })
      });
      if (res.ok) {
        setActiveFile({ ...activeFile, content: editContent });
        setIsEditing(false);
        await fetchWorkspace();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const getFileContent = () => {
    if (!activeFile) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-[#9494a0] opacity-50 space-y-4">
          <LayoutTemplate size={48} className="text-[#f27d26]/50" />
          <p>Select a file to view its context and rules.</p>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex-1 overflow-hidden w-full flex flex-col relative bg-[#16161a]">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 w-full p-4 md:p-8 bg-transparent text-[#f5f5f6] font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
            spellCheck={false}
          />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,125,38,0.05),transparent_50%)] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeFile.name}
          className="p-4 md:p-8 max-w-3xl mx-auto w-full relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[rgba(242,125,38,0.1)] border border-[rgba(242,125,38,0.2)] text-[#f27d26] text-xs font-mono">
            {activeFile.name}
          </div>
          <div className="prose prose-invert prose-headings:text-[#f5f5f6] prose-a:text-[#f27d26] max-w-none text-[#9494a0]">
            <div className="markdown-body">
              <Markdown>{activeFile.content || ''}</Markdown>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full bg-[#0c0c0e] overflow-hidden border-t border-[#2a2a32] md:border-t-0 relative">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar File Tree */}
      <div className={`absolute inset-y-0 left-0 z-40 transform ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-spring w-[280px] md:w-80 shrink-0 border-r border-[#2a2a32] bg-[#16161a]/95 backdrop-blur-xl overflow-y-auto flex flex-col shadow-2xl md:shadow-none`}>
        <div className="p-4 border-b border-[#2a2a32] flex items-center justify-between sticky top-0 bg-[#16161a]/95 backdrop-blur-xl z-10">
          <span className="text-sm font-semibold tracking-wide text-[#f5f5f6] flex items-center gap-2">
            <FolderTreeIcon />
            WORKSPACE EXPLORER
          </span>
          <button 
            className="md:hidden text-[#9494a0] hover:text-[#f5f5f6] transition-colors"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1 text-sm font-mono text-[#9494a0] pb-24">
          {isLoading ? (
             <div className="flex justify-center p-4 opacity-50"><Loader2 className="animate-spin" size={20} /></div>
          ) : workspaceTree ? (
            <TreeNode node={workspaceTree} setActiveFile={handleFileSelect} activeFile={activeFile} defaultOpen={true} />
          ) : (
            <div className="p-4 opacity-50">Workspace empty or failed to load.</div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-[#0c0c0e] relative min-w-0">
        <div className="h-14 border-b border-[#2a2a32] bg-[#16161a]/50 backdrop-blur-md flex items-center px-4 justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 w-3/4 overflow-hidden">
            <button 
              className="md:hidden p-2 -ml-2 text-[#9494a0] hover:text-[#f5f5f6] hover:bg-[#2a2a32] rounded-lg transition-colors flex items-center justify-center"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {activeFile ? (
              <div className="flex items-center gap-2 text-sm font-mono text-[#f5f5f6] truncate max-w-full">
                <FileText size={16} className="text-[#f27d26] shrink-0" /> 
                <span className="truncate" title={activeFile.path}>{activeFile.path}</span>
              </div>
            ) : (
              <div className="text-sm font-mono text-[#9494a0] italic">No file selected</div>
            )}
          </div>
          
          {activeFile && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => { setIsEditing(false); setEditContent(activeFile.content || ''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2a2a32] hover:bg-[#3a3a42] text-white rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#f27d26] hover:bg-[#f38c3e] text-white rounded-md transition-colors shadow-lg shadow-[#f27d26]/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2a2a32] hover:bg-[#3a3a42] text-white rounded-md transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
              )}
            </div>
          )}
        </div>
        {getFileContent()}
      </div>
    </div>
  );
}

function FolderTreeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f27d26]">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    </svg>
  );
}

function TreeNode({ 
  node, 
  setActiveFile, 
  activeFile,
  defaultOpen = false 
}: { 
  node: FileNode; 
  setActiveFile: (node: FileNode) => void;
  activeFile: FileNode | null;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isSelected = activeFile?.path === node.path;

  if (node.type === 'file') {
    return (
      <div 
        className={`flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-[rgba(242,125,38,0.15)] text-[#f27d26] shadow-[inset_2px_0_0_#f27d26]' : 'hover:bg-[#1e1e24] hover:text-[#f5f5f6]'}`}
        onClick={() => setActiveFile(node)}
      >
        <span className="w-5 h-5 shrink-0" />
        <FileText size={16} className={isSelected ? 'text-[#f27d26]' : 'text-[#9494a0]'} />
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div 
        className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg cursor-pointer hover:bg-[#1e1e24] transition-all duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="shrink-0 text-[#9494a0] group-hover:text-[#f5f5f6] transition-colors">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className="shrink-0 text-[#f27d26]">
          {isOpen ? <FolderOpen size={16} className="fill-[#f27d26]/20" /> : <Folder size={16} className="fill-[#f27d26]/10" />}
        </span>
        <span className="font-medium text-[#f5f5f6] group-hover:text-white transition-colors truncate">{node.name}</span>
      </div>
      
      <AnimatePresence>
        {isOpen && node.children && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 pl-3 border-l border-[#2a2a32] flex flex-col space-y-1 overflow-hidden"
          >
            {node.children.map((child, idx) => (
              <TreeNode 
                key={`${child.path}-${idx}`} 
                node={child} 
                setActiveFile={setActiveFile} 
                activeFile={activeFile} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
