import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, LayoutTemplate, FileCode } from 'lucide-react';

export function VectorSearchUI() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const handleIndex = async () => {
    setIsIndexing(true);
    try {
      const res = await fetch('/api/vector-search/index', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully computed embeddings for ${data.count} documents.`);
      }
    } catch (e) {
       console.error("Index failed", e);
    }
    setIsIndexing(false);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/vector-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSearching(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#2a2a32] rounded-lg">
                <Database className="text-[#f27d26]" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f6]">Deep Vector RAG</h1>
            </div>
            <p className="text-[#9494a0] max-w-2xl">
              Query the global codebase and autonomous research using Gemini text embeddings and semantic search.
            </p>
          </div>
          <button 
            onClick={handleIndex}
            disabled={isIndexing}
            className="bg-[#2a2a32] hover:bg-[#3a3a42] text-[#f5f5f6] px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isIndexing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            {isIndexing ? "Computing Embeddings..." : "Build Vector Database"}
          </button>
        </header>

        <div className="bg-[#16161a] border border-[#2a2a32] rounded-xl p-4 md:p-6 mb-4">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-[#0c0c0e]/90 border border-[#2a2a32] rounded-lg p-3 text-[#f5f5f6] placeholder-[#9494a0] focus:outline-none focus:border-[#f27d26]/50" 
              placeholder="E.g. Where are we managing cognitive loops?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-[#f27d26] hover:bg-[#d66a1d] text-[#0c0c0e] px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-[#16161a] border border-[#2a2a32] p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-[#9494a0]">
                <FileCode size={16} /> <span className="font-mono text-sm">{r.path}</span>
              </div>
              <p className="text-[#f5f5f6] text-sm leading-relaxed">{r.excerpt}</p>
              <div className="mt-3 text-xs px-2 py-1 bg-[#2a2a32] inline-block rounded text-[#f27d26]">
                Similarity: {Math.round(r.score * 100)}%
              </div>
            </div>
          ))}
          {results.length === 0 && !isSearching && query && (
             <div className="text-center py-12 text-[#9494a0]">No semantic matches found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
