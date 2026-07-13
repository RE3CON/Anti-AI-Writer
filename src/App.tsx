// AI Footprint Scrub - Anti-AI-Writer Workspace
import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Search, 
  CheckSquare, 
  Square, 
  FileText, 
  Sparkle, 
  MessageSquare, 
  PenTool, 
  GraduationCap, 
  Megaphone, 
  Info, 
  Zap, 
  BookOpenCheck, 
  Trash2, 
  Lightbulb, 
  ShieldAlert, 
  RefreshCw,
  Eye,
  Download
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

// Master dictionary of standard AI "slop" words to flag and their direct human equivalents
const SLOP_DICTIONARY: Record<string, string> = {
  'delve': 'go deep / look into',
  'leverage': 'use / exploit',
  'tapestry': 'blend / structure / mix',
  'foster': 'build / grow / support',
  'testament': 'proof / sign / demonstration',
  'pivot': 'turn / change / shift',
  'utilize': 'use',
  'holistic': 'complete / overall',
  'streamline': 'simplify / cut down',
  'paradigm shift': 'major change / shift',
  'synergy': 'teamwork / collaboration',
  'optimize': 'improve / clean up',
  'in today\'s fast-paced digital landscape': 'today / currently',
  'digital landscape': 'world online / web',
  'of paramount importance': 'vital / key / crucial',
  'revolutionize': 'change / transform',
  'demystify': 'explain / clarify',
  'beacon of': 'example of',
  'groundbreaking': 'new / exciting',
  'game-changer': 'major improvement',
  'unwavering': 'strong / steady',
  'passionately': 'deeply / active',
  'robust': 'strong / solid',
  'vibrant': 'lively / rich',
  'elevate': 'raise / boost',
  'empower': 'help / enable',
  'tapestry of experiences': 'mix of life',
  'multifaceted': 'varied / complex'
};

export default function App() {
  // Navigation & Filter States
  const [selectedPersonaId, setSelectedPersonaId] = useState('no_bs_copywriter');
  const [activeScrubs, setActiveScrubs] = useState<string[]>(['vocab_scrub', 'burstiness', 'no_throat_clearing']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Custom Playground Text Inputs
  const [customTextInput, setCustomTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Categories list
  const categories = ['All', 'Conversational & Social', 'Marketing & Copywriting', 'Academic & Professional', 'Creative & Scriptwriting'];

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadJSONCatalog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: "Anti-AI Persona Catalog",
      last_updated: "2026-07-03",
      total_personas: HUMANIZER_PERSONAS.length,
      total_modifiers: QUICK_SCRUBS.length,
      modifiers: QUICK_SCRUBS,
      personas: HUMANIZER_PERSONAS
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "anti_ai_personas_catalog.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadMarkdownCatalog = () => {
    let md = `# 🧼 Anti-AI Persona & Writing Catalog\n\n`;
    md += `This directory contains **${HUMANIZER_PERSONAS.length} Humanizer Personas** and **${QUICK_SCRUBS.length} Quick-Scrub Modifiers** designed to strip robotic cadences, corporate double-speak, and cliché LLM markers from AI output.\n\n`;
    
    md += `## 🚀 How to Use These Prompts\n`;
    md += `1. Choose a Persona below that fits your desired writing style.\n`;
    md += `2. Copy the System Prompt text completely.\n`;
    md += `3. Paste it into ChatGPT, Claude, or Gemini.\n\n`;

    md += `## ⚙️ Quick-Scrub Modifiers\n\n`;
    QUICK_SCRUBS.forEach((scrub) => {
      md += `### ${scrub.emoji} ${scrub.name}\n`;
      md += `* **Description:** ${scrub.description}\n`;
      md += `* **Prompt Modifier:**\n\`\`\`text\n${scrub.prompt}\n\`\`\`\n\n`;
    });

    md += `## 📂 37 Humanizer Personas\n\n`;
    
    const categories: Record<string, typeof HUMANIZER_PERSONAS> = {};
    HUMANIZER_PERSONAS.forEach(p => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p);
    });

    for (const cat of Object.keys(categories)) {
      md += `## 📁 Category: ${cat}\n\n`;
      categories[cat].forEach(p => {
        md += `### ${p.emoji} ${p.name}\n`;
        md += `* Description: ${p.description}\n`;
        md += `* Key Directives:\n`;
        p.executionRules.forEach(rule => {
          md += `  - ${rule}\n`;
        });
        md += `* System Prompt:\n\`\`\`text\n${p.systemPrompt}\n\`\`\`\n\n`;
        md += `---\n\n`;
      });
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "anti_ai_personas_catalog.md");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Find active persona
  const activePersona = useMemo(() => {
    return HUMANIZER_PERSONAS.find(p => p.id === selectedPersonaId) || HUMANIZER_PERSONAS[0];
  }, [selectedPersonaId]);

  // Handle inject sample drafts
  const handleInjectSample = (sample: SampleInput) => {
    setCustomTextInput(sample.text);
    // Align with an appropriate persona context
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

  // Toggle quick scrubs
  const toggleScrub = (id: string) => {
    setActiveScrubs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Generate assembled prompt markdown text
  const assembledPrompt = useMemo(() => {
    let prompt = `You are an expert humanizer writing under the "${activePersona.name}" Persona.\n\n`;
    prompt += `--- SYSTEM INSTRUCTIONS & PERSONA GUIDELINES ---\n`;
    prompt += `- Tone Direction: ${activePersona.description}\n`;
    prompt += `- Core Rules to follow strictly:\n`;
    activePersona.executionRules.forEach(rule => {
      prompt += `  * ${rule}\n`;
    });
    prompt += `\n${activePersona.systemPrompt}\n\n`;

    // Append quick scrub modifiers
    const activeScrubDetails = activeScrubs
      .map(id => QUICK_SCRUBS.find(q => q.id === id))
      .filter(Boolean) as QuickScrub[];

    if (activeScrubDetails.length > 0) {
      prompt += `--- EXTRA MICRO-SCRUB FILTER CONSTRAINTS TO ENFORCE ---\n`;
      activeScrubDetails.forEach((scrub, idx) => {
        prompt += `${idx + 1}. [${scrub.name}]: ${scrub.prompt}\n`;
      });
      prompt += `\n`;
    }

    // Append strict output format parameters
    prompt += `--- OUTPUT METADATA CONSTRAINTS ---\n`;
    prompt += `1. Do NOT write any introduction, conversational greeting, or meta-commentary (such as "Here is the rewritten version" or "I have humanized this").\n`;
    prompt += `2. Do NOT wrap the final response in unnecessary markdown code fences unless code is explicitly part of the draft.\n`;
    prompt += `3. Jump immediately into the first word of the humanized output.\n\n`;

    // Inject user sandbox content
    if (customTextInput.trim()) {
      prompt += `--- INPUT CONTENT TO HUMANIZATION PROCESS ---\n`;
      prompt += `"""\n${customTextInput.trim()}\n"""\n\n`;
      prompt += `Please rewrite the above draft content following all the persona directives. Start now:`;
    } else {
      prompt += `[PASTE YOUR CONTENT DRAFT HERE TO COMPLETE]`;
    }

    return prompt;
  }, [activePersona, activeScrubs, customTextInput]);

  // Scan text for active slop words
  const detectedSlopWords = useMemo(() => {
    if (!customTextInput) return [];
    const lowerText = customTextInput.toLowerCase();
    const found: { word: string; replacement: string; index: number }[] = [];
    
    Object.keys(SLOP_DICTIONARY).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lowerText)) !== null) {
        if (!found.some(f => f.word === word)) {
          found.push({
            word: word,
            replacement: SLOP_DICTIONARY[word],
            index: match.index
          });
        }
      }
    });

    return found.sort((a, b) => a.index - b.index);
  }, [customTextInput]);

  // Client-side rule-based text humanizer simulation (provides lightning-fast offline preview of the prompt instructions!)
  const simulatedOutput = useMemo(() => {
    if (!customTextInput.trim()) return '';

    let text = customTextInput;

    // Apply standard slop substitutions
    Object.keys(SLOP_DICTIONARY).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      // Match case sensitivity roughly
      text = text.replace(regex, (match) => {
        const replacement = SLOP_DICTIONARY[word].split(' / ')[0];
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    // Apply specific persona styles
    if (activePersona.id === 'no_bs_copywriter' || activePersona.id === 'b2b_saas_pragmatist') {
      // Shorter sentences, delete filler phrases
      text = text.replace(/In today's fast-paced digital landscape,?/gi, 'Today,');
      text = text.replace(/It is important to note that/gi, '');
      text = text.replace(/embark on this exciting journey/gi, 'get started');
      text = text.replace(/beacon of innovation/gi, 'leader');
    } else if (activePersona.id === 'reddit_native' || activePersona.id === 'conversational_ghostwriter') {
      // Add casual fillers
      text = "Honestly, " + text.charAt(0).toLowerCase() + text.slice(1);
      text = text.replace(/\. /g, '. Like, ');
      text = text.replace(/In conclusion, let us/gi, 'So anyway, let\'s');
    } else if (activePersona.id === 'surgical_editor' || activePersona.id === 'academic_skeptic') {
      // Academic polishing
      text = text.replace(/exciting journey/gi, 'projected development');
      text = text.replace(/visionary leader/gi, 'specialist practitioner');
    }

    // Apply quick scrub modifiers locally for rendering
    if (activeScrubs.includes('no_throat_clearing')) {
      const sentences = text.split(/[.!?]+\s+/);
      if (sentences.length > 1) {
        // Drop the first sentence to simulate throat-clearing removal
        text = sentences.slice(1).join('. ');
      }
    }

    return text;
  }, [activePersona, activeScrubs, customTextInput]);

  // Filter personas based on search and category
  const filteredPersonas = useMemo(() => {
    return HUMANIZER_PERSONAS.filter(persona => {
      const matchesSearch = persona.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            persona.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || persona.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Conversational & Social': return <MessageSquare className="h-3.5 w-3.5 text-slate-400" />;
      case 'Marketing & Copywriting': return <Megaphone className="h-3.5 w-3.5 text-slate-400" />;
      case 'Academic & Professional': return <GraduationCap className="h-3.5 w-3.5 text-slate-400" />;
      case 'Creative & Scriptwriting': return <PenTool className="h-3.5 w-3.5 text-slate-400" />;
      default: return <Sparkle className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200" id="app_root">
      
      {/* Premium Minimalistic Header */}
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-5 sticky top-0 z-40" id="header_section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-sm">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white font-heading">
                AI Footprint Scrub
              </h1>
              <p className="text-xs text-slate-400">Purge robotic cadences and LLM style markers from drafts instantly</p>
            </div>
          </div>

          {/* Clean minimal download buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadMarkdownCatalog}
              title="Download full 37-persona catalog as Markdown (.md)"
              className="flex items-center gap-1.5 hover:bg-slate-900 hover:text-white text-slate-400 font-medium text-xs px-3 py-2 rounded-lg border border-slate-900 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Catalog (.md)</span>
            </button>
            <button 
              onClick={downloadJSONCatalog}
              title="Download full dataset as JSON (.json)"
              className="flex items-center gap-1.5 hover:bg-slate-900 hover:text-white text-slate-400 font-medium text-xs px-3 py-2 rounded-lg border border-slate-900 transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dataset (.json)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace_grid">
        
        {/* ================= LEFT SIDE: PERSONA SELECTION ================= */}
        <section className="lg:col-span-5 flex flex-col space-y-4" id="personas_selection_column">
          
          <div className="bg-slate-900 rounded-xl border border-slate-900 p-5 flex flex-col h-[760px] shadow-sm">
            
            <div className="space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-indigo-400" />
                  <span>1. Select Persona Blueprint</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {filteredPersonas.length} of 37
                </span>
              </div>
              
              <p className="text-xs text-slate-400">
                Choose a base style designed to strip generic LLM patterns and match your authentic voice.
              </p>

              {/* Live search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search personas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9.5 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Categories Navigation */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-850">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors shrink-0 border ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-900'
                    }`}
                  >
                    <span>{cat === 'All' ? 'All Styles' : cat.split(' & ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Personas Container */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-1" id="personas_scroller">
              {filteredPersonas.length === 0 ? (
                <div className="text-center py-16 text-slate-600 text-xs italic space-y-1">
                  <p>No personas matched your criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredPersonas.map((persona) => {
                  const isSelected = persona.id === selectedPersonaId;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'bg-slate-950 border-indigo-500 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-950 hover:bg-slate-950/80 hover:border-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl p-1 bg-slate-900 rounded shrink-0">{persona.emoji}</div>
                        <div className="min-w-0 flex-1">
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                              {persona.name}
                            </span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getCategoryIcon(persona.category)}
                            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
                              {persona.category}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {persona.description}
                          </p>

                          {isSelected && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-slate-900 space-y-2"
                            >
                              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Key Directives</span>
                              <div className="space-y-1">
                                {persona.executionRules.map((rule, idx) => (
                                  <div key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                                    <span className="text-indigo-400 shrink-0">•</span>
                                    <span>{rule}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </section>

        {/* ================= RIGHT SIDE: WORKSPACE & SANDBOX ================= */}
        <section className="lg:col-span-7 space-y-4" id="assembled_output_column">
          
          <div className="bg-slate-900 rounded-xl border border-slate-900 shadow-sm overflow-hidden">
            
            {/* Header of Workspace */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">2. Workspace & Script Assembly</h2>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedPersonaId('no_bs_copywriter');
                  setActiveScrubs(['vocab_scrub', 'burstiness', 'no_throat_clearing']);
                  setCustomTextInput('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                title="Reset Spaces"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Space</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Modifier toggles */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Stack Micro-Scrub Modifiers
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {QUICK_SCRUBS.map(scrub => {
                    const isActive = activeScrubs.includes(scrub.id);
                    return (
                      <button
                        key={scrub.id}
                        onClick={() => toggleScrub(scrub.id)}
                        className={`text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                          isActive 
                            ? 'bg-slate-950 border-indigo-500/50 text-slate-200' 
                            : 'bg-slate-950/40 border-transparent text-slate-400 hover:bg-slate-950/80 hover:text-slate-200'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isActive ? (
                            <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                          ) : (
                            <Square className="h-3.5 w-3.5 text-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                            <span>{scrub.emoji}</span>
                            <span>{scrub.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{scrub.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Draft Playground Sandbox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Interactive Draft Sandbox
                  </label>
                  {customTextInput && (
                    <button 
                      onClick={() => setCustomTextInput('')}
                      className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear Draft</span>
                    </button>
                  )}
                </div>

                <textarea
                  value={customTextInput}
                  onChange={(e) => setCustomTextInput(e.target.value)}
                  placeholder="Paste your AI draft here to instantly audit cliché phrases and test synonym rewrites..."
                  className="w-full h-24 bg-slate-950 border border-slate-950 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-slate-800 leading-relaxed resize-none"
                />

                {/* Sample drafts loading row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider shrink-0">Sample Drafts:</span>
                  {SAMPLE_INPUTS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => handleInjectSample(sample)}
                      className="text-[10px] bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-900 px-2.5 py-1 rounded transition-colors shrink-0"
                    >
                      {sample.emoji} {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Analysis & Simulator Panel (Shown only when there is text input) */}
              {customTextInput.trim() && (
                <div className="bg-slate-950/60 rounded-lg border border-slate-900 p-4 space-y-4" id="sandbox_interactive_panel">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Audit: Detected AI Footprints ({detectedSlopWords.length})</span>
                    </div>
                  </div>

                  {/* Highlights and live contrast dictionaries */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Footprint scanner original */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-500 font-mono uppercase">Detected Clichés</div>
                      <div className="bg-slate-950 p-3 rounded border border-slate-900 max-h-36 overflow-y-auto text-xs leading-relaxed text-slate-400">
                        {detectedSlopWords.length === 0 ? (
                          <span className="text-slate-600 italic">No generic buzzwords detected in this snippet.</span>
                        ) : (
                          <div className="space-y-1.5">
                            {detectedSlopWords.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] py-0.5 border-b border-slate-900 last:border-0">
                                <span className="font-mono text-rose-400 bg-rose-500/5 px-1 rounded border border-rose-500/10">
                                  {item.word}
                                </span>
                                <span className="text-slate-600 text-[9px]">→</span>
                                <span className="font-mono text-emerald-400 bg-emerald-500/5 px-1 rounded border border-emerald-500/10">
                                  {item.replacement}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulated output comparison */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-500 font-mono uppercase">Offline Rewrite Preview</div>
                      <div className="bg-slate-950 p-3 rounded border border-slate-900 max-h-36 overflow-y-auto text-xs leading-relaxed text-slate-300">
                        {simulatedOutput}
                      </div>
                    </div>

                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-900 flex items-start gap-2.5">
                    <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      This rewrite is a fast simulation. Copy the Engineered Prompt block below and paste it with your draft into ChatGPT, Claude, or Gemini to apply the complete instructions recursively.
                    </p>
                  </div>
                </div>
              )}

              {/* Master Prompt Output Generation */}
              <div className="space-y-2 pt-3 border-t border-slate-950">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkle className="h-3.5 w-3.5 text-indigo-400" />
                    <span>3. Master Engineered Prompt Block</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  This complete package is pre-configured with all chosen constraints. Drop it into your chat session to re-align your AI writer.
                </p>

                <div className="relative group">
                  <pre className="w-full bg-slate-950 border border-slate-950 rounded-lg p-4 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[250px] leading-relaxed whitespace-pre-wrap">
                    {assembledPrompt}
                  </pre>
                  
                  {/* Copy button floating */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleCopy(assembledPrompt, 'final')}
                      className={`px-3 py-2 rounded-md font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                        copiedId === 'final' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {copiedId === 'final' ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Prompt Block</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Quick Informational Guide */}
          <div className="bg-slate-900 rounded-xl border border-slate-900 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-400" />
              <span>Prompt Suite Guide</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
              <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-950">
                <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase">Step 1</span>
                <p>Pick a base persona style optimized to block typical LLM rhythms.</p>
              </div>
              <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-950">
                <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">Step 2</span>
                <p>Stack custom modifier layers to clean specific giveaways (e.g., throat clearing).</p>
              </div>
              <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-950">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Step 3</span>
                <p>Copy the output and use it as a custom system instruction with your LLM.</p>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-5 mt-12 text-center" id="footer_section">
        <p className="text-xs text-slate-600">
          © 2026 AI Footprint Scrub. All prompt catalogs are fully open-source. Runs entirely client-side.
        </p>
      </footer>

    </div>
  );
}
