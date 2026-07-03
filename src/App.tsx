import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Search, 
  CheckSquare, 
  Square, 
  Clipboard, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  BookOpenCheck,
  FileText,
  Bookmark,
  Sparkle,
  MessageSquare,
  PenTool,
  GraduationCap,
  Megaphone,
  Eye,
  Info,
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HUMANIZER_PERSONAS, 
  QUICK_SCRUBS, 
  SAMPLE_INPUTS, 
  HumanizerPersona, 
  QuickScrub, 
  SampleInput 
} from './promptsData';

export default function App() {
  // Navigation & Filter States
  const [selectedPersonaId, setSelectedPersonaId] = useState('human_vibe_ghostwriter');
  const [activeScrubs, setActiveScrubs] = useState<string[]>(['vocab_scrub', 'burstiness']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sandbox Text Input for Live Prompt Wrapping
  const [customTextInput, setCustomTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Categories derived from data
  const categories = ['All', 'Conversational & Social', 'Marketing & Copywriting', 'Academic & Professional', 'Creative & Scriptwriting'];

  // Handle single prompt copying
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find active persona
  const activePersona = useMemo(() => {
    return HUMANIZER_PERSONAS.find(p => p.id === selectedPersonaId) || HUMANIZER_PERSONAS[0];
  }, [selectedPersonaId]);

  // Quick select an active sample input
  const handleInjectSample = (sample: SampleInput) => {
    setCustomTextInput(sample.text);
    // Auto align to a logical persona for the sample
    if (sample.id === 'corporate_update') {
      setSelectedPersonaId('b2b_saas_pragmatist');
    } else if (sample.id === 'seo_blog_intro') {
      setSelectedPersonaId('seo_optimiser');
    } else if (sample.id === 'overly_flattering_bio') {
      setSelectedPersonaId('biographer_realist');
    } else if (sample.id === 'college_essay_tapestry') {
      setSelectedPersonaId('surgical_editor');
    }
  };

  // Toggle quick-scrubs on/off
  const toggleScrub = (id: string) => {
    setActiveScrubs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Generate the masterfully assembled prompt
  const assembledPrompt = useMemo(() => {
    let prompt = `You are an expert humanizer writing under the "${activePersona.name}" Persona.\n\n`;
    prompt += `--- SYSTEM INSTRUCTIONS & PERSONA GUIDELINES ---\n`;
    prompt += `${activePersona.systemPrompt}\n\n`;

    // Append extra overlay constraints
    const activeScrubDetails = activeScrubs
      .map(id => QUICK_SCRUBS.find(q => q.id === id))
      .filter(Boolean) as QuickScrub[];

    if (activeScrubDetails.length > 0) {
      prompt += `--- EXTRA MICRO-SCRUB FILTER CONSTRAINTS TO ENFORCE ---\n`;
      activeScrubDetails.forEach((scrub, idx) => {
        prompt += `${idx + 1}. [${scrub.name} Modifier]: ${scrub.prompt}\n`;
      });
      prompt += `\n`;
    }

    // Append strict formatting output rule
    prompt += `--- OUTPUT METADATA CONSTRAINTS ---\n`;
    prompt += `1. Do NOT write any introduction or conclusion about the rewrite process (e.g. do not say "Here is the humanized version:").\n`;
    prompt += `2. Do NOT wrap the entire output in a markdown block unless the original input is markdown.\n`;
    prompt += `3. Start immediately with the rewritten humanized text.\n\n`;

    // Inject user content if provided
    if (customTextInput.trim()) {
      prompt += `--- INPUT CONTENT TO HUMANIZATION PROCESS ---\n`;
      prompt += `"""\n${customTextInput.trim()}\n"""\n\n`;
      prompt += `Please humanize the above content now.`;
    } else {
      prompt += `[PASTE YOUR CONTENT TO HUMANIZE HERE]`;
    }

    return prompt;
  }, [activePersona, activeScrubs, customTextInput]);

  // Filtered Personas List
  const filteredPersonas = useMemo(() => {
    return HUMANIZER_PERSONAS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Conversational & Social': return <MessageSquare className="h-4 w-4" />;
      case 'Marketing & Copywriting': return <Megaphone className="h-4 w-4" />;
      case 'Academic & Professional': return <GraduationCap className="h-4 w-4" />;
      case 'Creative & Scriptwriting': return <PenTool className="h-4 w-4" />;
      default: return <Sparkle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100" id="app_root">
      
      {/* 🧼 Header section */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-5 sticky top-0 z-40 shadow-md" id="header_section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Footprints Free Prompts
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  Clean & Direct
                </span>
              </h1>
              <p className="text-xs text-slate-400">Assemble zero-footprint, highly customized anti-AI instructions for your favorite LLM.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              ⚡ 37 Deep Personas • 5 Modifiers
            </span>
          </div>
        </div>
      </header>

      {/* 🎨 Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8" id="workspace_grid">
        
        {/* ================= LEFT SECTION: LIVE PROMPT ASSEMBLER (lg:col-span-7) ================= */}
        <div className="lg:col-span-7 space-y-6" id="left_assembler_column">
          
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            
            {/* Assembly Header */}
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-200">Interactive Prompt Assembler</h2>
                  <p className="text-[11px] text-slate-400">Pick any persona and toggle modifiers to build a bulletproof prompt template.</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedPersonaId('human_vibe_ghostwriter');
                  setActiveScrubs(['vocab_scrub', 'burstiness']);
                  setCustomTextInput('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-850 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1"
                title="Reset Workspace"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Assembled Result Box */}
            <div className="p-6 space-y-5">
              
              {/* Active Selection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Chosen Persona Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Base Persona</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{activePersona.emoji}</span>
                    <span className="text-sm font-bold text-indigo-300">{activePersona.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-normal">{activePersona.description}</p>
                </div>

                {/* Modifiers List */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Micro-Scrub Modifiers</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeScrubs.length === 0 ? (
                      <span className="text-xs text-slate-500 italic mt-1">No modifiers selected. Tap any below.</span>
                    ) : (
                      activeScrubs.map(id => {
                        const s = QUICK_SCRUBS.find(q => q.id === id);
                        if (!s) return null;
                        return (
                          <span key={id} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-md font-semibold">
                            {s.emoji} {s.name}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Optional: Input Content Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Optional Sandbox Text Input (Wrap your own draft directly!)</span>
                  </label>
                  {customTextInput && (
                    <button 
                      onClick={() => setCustomTextInput('')}
                      className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear text
                    </button>
                  )}
                </div>
                <textarea
                  value={customTextInput}
                  onChange={(e) => setCustomTextInput(e.target.value)}
                  placeholder="Paste your AI draft text here... (The Live Prompt below will dynamically wrap this draft inside your humanizing constraints!)"
                  className="w-full h-24 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 leading-relaxed resize-none"
                />

                {/* Quick slop samples to load */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Try Slop Drafts:</span>
                  {SAMPLE_INPUTS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => handleInjectSample(sample)}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md transition-colors shrink-0"
                    >
                      {sample.emoji} {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Assembled Code / Prompt Output */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkle className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Live Assembled Prompt Preview</span>
                  </div>
                  
                  <span className="text-[10px] text-slate-500 font-mono">Ready for ChatGPT / Claude / Gemini</span>
                </div>

                <div className="relative group">
                  <pre className="w-full bg-slate-950/90 border border-indigo-500/25 rounded-xl p-4.5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
                    {assembledPrompt}
                  </pre>
                  
                  {/* Big Copy Button Floating */}
                  <div className="absolute top-3 right-3 opacity-95 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(assembledPrompt, 'master')}
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                        copiedId === 'master' 
                          ? 'bg-emerald-600 text-white shadow-emerald-950/50' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
                      }`}
                    >
                      {copiedId === 'master' ? (
                        <>
                          <Check className="h-3.5 w-3.5 animate-pulse" />
                          <span>Copied Prompt!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Master Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Micro-Scrub modifiers settings panel */}
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Step 2: Micro-Scrub Modifiers (Toggle to Append Rules)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Overlay strict instructions dynamically. Turn them on or off to change the final generated instruction template instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {QUICK_SCRUBS.map(scrub => {
                const isActive = activeScrubs.includes(scrub.id);
                return (
                  <button
                    key={scrub.id}
                    onClick={() => toggleScrub(scrub.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 group relative ${
                      isActive 
                        ? 'bg-amber-950/10 border-amber-500/40 text-slate-100 shadow-inner' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isActive ? (
                        <CheckSquare className="h-4.5 w-4.5 text-amber-500" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-700 group-hover:text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{scrub.emoji}</span>
                        <span>{scrub.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{scrub.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ================= RIGHT SECTION: 37 DEEP-DIVE PERSONA LIBRARY (lg:col-span-5) ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6" id="right_library_column">
          
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 p-5 flex flex-col h-full shadow-xl" id="bento_library">
            
            {/* Library Header */}
            <div className="space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenCheck className="h-4 w-4 text-emerald-400" />
                  <span>Step 1: Choose Persona ({filteredPersonas.length})</span>
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Total 37
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose the foundation tone guidelines. Each card carries completely authentic, context-specific anti-AI rulesets.
              </p>

              {/* Search input bar */}
              <div className="relative pt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search personas (e.g. B2B, Academic, Reddit)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category selector capsules */}
              <div className="flex flex-wrap gap-1.5 pt-1.5 pb-3 border-b border-slate-850">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat !== 'All' && getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Cards List Scrollable Container */}
            <div className="flex-1 overflow-y-auto max-h-[640px] pr-1 space-y-3 pt-3" id="persona_scroller">
              {filteredPersonas.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No personas matched your search query. Try typing another category.
                </div>
              ) : (
                filteredPersonas.map((persona) => {
                  const isSelected = persona.id === selectedPersonaId;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                          : 'bg-slate-950/45 border-slate-850 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      {/* Active Status Badge Indicator */}
                      {isSelected && (
                        <span className="absolute top-3.5 right-3.5 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="text-2xl p-1 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">{persona.emoji}</div>
                        <div className="min-w-0 flex-1">
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {persona.name}
                            </span>
                          </div>

                          <div className="text-[9px] text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">
                            {persona.category}
                          </div>

                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            {persona.description}
                          </p>

                          {/* Quick Preview Rules inside cards */}
                          <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-1">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Key Directives</div>
                            {persona.executionRules.map((rule, idx) => (
                              <div key={idx} className="text-[10px] text-slate-300 flex items-start gap-1">
                                <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Quick instructions / Help Accordion Card */}
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-400" />
              <span>How to use these Anti-AI prompts:</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                1. <strong>Browse styles</strong> in the sidebar library. Select the persona that best mirrors your target context (e.g. "B2B SaaS Pragmatist" or "Reddit Native").
              </p>
              <p>
                2. <strong>Toggle micro-modifiers</strong> (like Vocabulary Scrub to explicitly ban standard ChatGPT vocabulary).
              </p>
              <p>
                3. <strong>Copy the custom-engineered prompt</strong> and paste it directly into your chat with ChatGPT, Gemini, or Claude. You will get incredibly organic, humanized prose instantly!
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 🧼 Simple Clean Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 px-6 py-4 mt-12 text-center" id="footer_section">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 AI Footprint Scrub. Crafted as a pristine 100% Client-Side Prompt Suite. No API keys required.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-600 bg-slate-900 border border-slate-850 px-2 py-1 rounded">
              Local Mode Enabled
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
