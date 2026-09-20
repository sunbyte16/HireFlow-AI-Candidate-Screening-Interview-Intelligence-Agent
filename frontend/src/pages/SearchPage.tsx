import React, { useState } from 'react';
import { 
  Search, Sparkles, ArrowRight, CheckCircle2, 
  Target, ShieldCheck, AlertCircle 
} from 'lucide-react';
import type { SearchResultItem, NavigationTab } from '../types';
import { api } from '../services/api';

interface Props {
  initialQuery?: string;
  onSelectCandidate: (candidateId: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

const EXAMPLE_QUERIES = [
  "Show candidates with Python and PyTorch experience",
  "Which candidates have computer vision projects?",
  "Show candidates with AWS experience",
  "Which candidates have NLP experience?",
  "Find candidates whose projects involve YOLO"
];

export const SearchPage: React.FC<Props> = ({ 
  initialQuery = '', 
  onSelectCandidate,
  setActiveTab 
}) => {
  const [query, setQuery] = useState(initialQuery || 'Show candidates with Python and PyTorch experience');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm !== undefined ? searchTerm : query;
    if (!q.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const resp = await api.searchCandidates(q);
      setResults(resp.results || []);
    } catch (err: any) {
      alert(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    handleSearch(chip);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto pt-4 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural Language Recruiter Search</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Ask HireFlow Candidate Pool
        </h2>
        <p className="text-xs text-slate-400">
          Query candidate skills, project architectures, tools, and experience using natural recruiter questions.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Find candidates whose projects involve YOLO or computer vision..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 shadow-xl shadow-black/40 transition-all"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Example Query Chips */}
        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          <span className="text-[11px] text-slate-400 mr-1">Suggested:</span>
          {EXAMPLE_QUERIES.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 transition-colors"
            >
              "{chip}"
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        {hasSearched && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Found <strong className="text-white">{results.length}</strong> matching candidates</span>
            <span>Query: <span className="font-mono text-blue-300">"{query}"</span></span>
          </div>
        )}

        <div className="space-y-3">
          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCandidate(item.candidate.id)}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-600/20 shrink-0">
                    {item.candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {item.candidate.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {item.candidate.location} • {item.candidate.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-base font-bold text-white">{item.relevance_score}%</span>
                    <span className="text-[10px] text-slate-400 block">Relevance</span>
                  </div>
                  <div className="text-xs text-blue-400 group-hover:text-blue-300 flex items-center space-x-1 font-semibold">
                    <span>Profile &amp; Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Matched Reason */}
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{item.matched_reason}</span>
              </div>

              {/* Highlighted Evidence Snippets */}
              {item.highlighted_evidence && item.highlighted_evidence.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Verified Evidence Citations
                  </span>
                  <div className="space-y-1">
                    {item.highlighted_evidence.map((snippet, sIdx) => (
                      <div key={sIdx} className="p-2 rounded bg-slate-900/90 font-mono text-[11px] text-slate-300 border border-slate-800">
                        {snippet}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {hasSearched && results.length === 0 && !isSearching && (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching candidates found</p>
              <p className="text-xs text-slate-400 mt-1">Try querying general skills like "Python", "PyTorch", or "computer vision".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
