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
  Smile, 
  Sliders, 
  ShieldAlert, 
  Plus,
  RefreshCw,
  Eye,
  ArrowRight,
  ArrowDown,
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

  // Custom User Prompt Workshop State
  const [workshopPersonaName, setWorkshopPersonaName] = useState('');
  const [workshopCategory, setWorkshopCategory] = useState('Conversational & Social');
  const [workshopBannedWords, setWorkshopBannedWords] = useState('delve, tapestry, showcase');
  const [workshopAdjectives, setWorkshopAdjectives] = useState('blunt, punchy, cynical');
  const [workshopCustomRules, setWorkshopCustomRules] = useState('');
  const [showWorkshopSuccess, setShowWorkshopSuccess] = useState(false);

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

    if (activeScrubs.includes('burstiness')) {
      // Inject some short punchy sentences
      text = text.trim() + " Simple. Direct. Fully resolved.";
    }

    return text;
  }, [customTextInput, activePersona, activeScrubs]);

  // Filtered Personas
  const filteredPersonas = useMemo(() => {
    return HUMANIZER_PERSONAS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.executionRules.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Workshop Submit Handler (Creates custom transient persona)
  const handleWorkshopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopPersonaName) return;

    // Create custom persona item
    const customPersona: HumanizerPersona = {
      id: `custom_${Date.now()}`,
      name: workshopPersonaName,
      category: workshopCategory,
      emoji: '🧠',
      description: `Custom crafted workflow emphasizing: ${workshopAdjectives}.`,
      executionRules: [
        `Strictly block: ${workshopBannedWords}`,
        `Adopt tone profile: ${workshopAdjectives}`,
        workshopCustomRules || `Keep sentences highly dynamic and authentic.`
      ],
      systemPrompt: `You are a specialized custom writer named ${workshopPersonaName}. 
Your core adjectives are: ${workshopAdjectives}. 
You are strictly forbidden from using any of the following terms: ${workshopBannedWords}. 
Follow this specific custom direction: ${workshopCustomRules || 'Sound natural, empathetic, and extremely direct.'}`
    };

    // Inject custom persona to the list dynamically
    HUMANIZER_PERSONAS.unshift(customPersona);
    setSelectedPersonaId(customPersona.id);
    
    // Show feedback
    setShowWorkshopSuccess(true);
    setTimeout(() => {
      setShowWorkshopSuccess(false);
      setWorkshopPersonaName('');
      setWorkshopCustomRules('');
    }, 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Conversational & Social': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'Marketing & Copywriting': return <Megaphone className="h-3.5 w-3.5" />;
      case 'Academic & Professional': return <GraduationCap className="h-3.5 w-3.5" />;
      case 'Creative & Scriptwriting': return <PenTool className="h-3.5 w-3.5" />;
      default: return <Sparkle className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100" id="app_root">
      
      {/* 🧼 Top Sticky Elegant Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4.5 sticky top-0 z-40 shadow-xl" id="header_section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/15">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">
                  AI Footprints
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  Free Prompts Catalog
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                  100% Client-Side
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ultra-polished, bypass-ready custom instruction blocks for ChatGPT, Claude, and Gemini.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono font-bold text-slate-300 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-850">
                📂 37 Persona Blueprints
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-300 px-3 py-1">
                ⚙️ 5 Modifiers
              </span>
            </div>
            
            <button 
              onClick={downloadMarkdownCatalog}
              title="Download full 37-persona catalog as Markdown (.md)"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-500/20 transition-all cursor-pointer shadow-lg shadow-emerald-950/20 hover:scale-102"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Catalog (.MD)</span>
            </button>
            
            <button 
              onClick={downloadJSONCatalog}
              title="Download full dataset as JSON (.json)"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-lg hover:scale-102"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Download Dataset (.JSON)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌌 Intro Banner */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-850 px-6 py-8" id="intro_banner">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            <Zap className="h-3 w-3 text-indigo-400" />
            NO API Keys Required • Direct Copy-Paste Workflow
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading tracking-tight">
            Purge Robotic AI footprint indicators instantly.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Select your base persona, stack micro-scrub layers to ban AI giveaway patterns (like <em>delve</em>, <em>leverage</em>, or <em>tapestry</em>), and generate robust prompts ready for your favorite LLM.
          </p>
        </div>
      </div>

      {/* 🚀 Main Catalog & Builder Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace_grid">
        
        {/* ================= LEFT SIDE: PERSOAN LIBRARY (lg:col-span-5) ================= */}
        <section className="lg:col-span-5 flex flex-col space-y-6" id="personas_selection_column">
          
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 p-5 flex flex-col h-[750px] shadow-xl">
            
            {/* Filter Hub */}
            <div className="space-y-3.5 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BookOpenCheck className="h-4.5 w-4.5 text-indigo-400" />
                  <span>1. Choose Writing Persona</span>
                </h3>
                <span className="text-[10px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                  {filteredPersonas.length} shown
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-normal">
                Choose the foundation tone rules. Each carries context-specific anti-AI formulas.
              </p>

              {/* Live search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search 37 blueprints (e.g. B2B, Surgeon)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {/* Categories Navigation */}
              <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-850 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-850'
                    }`}
                  >
                    {cat !== 'All' && getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Personas Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 mt-4" id="personas_scroller">
              {filteredPersonas.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs italic space-y-2">
                  <p>No personas matched your filter criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredPersonas.map((persona) => {
                  const isSelected = persona.id === selectedPersonaId;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-indigo-950/20 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                          : 'bg-slate-900/60 border-slate-850 text-slate-300 hover:bg-slate-900 hover:border-slate-850'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl p-1 bg-slate-950 rounded-lg shrink-0">{persona.emoji}</div>
                        <div className="min-w-0 flex-1">
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-extrabold ${isSelected ? 'text-indigo-300' : 'text-slate-100'}`}>
                              {persona.name}
                            </span>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                            )}
                          </div>

                          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mt-0.5 block">
                            {persona.category}
                          </span>

                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                            {persona.description}
                          </p>

                          {/* Expansion details if active */}
                          {isSelected && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-2.5 border-t border-indigo-500/10 space-y-2"
                            >
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Key Directives:</div>
                              <div className="space-y-1">
                                {persona.executionRules.map((rule, idx) => (
                                  <div key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                                    <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
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

          {/* 🛠️ Custom Prompt Creator Workshop */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                  Custom Persona Workshop
                </h4>
                <p className="text-[11px] text-slate-400">Generate a custom prompt configuration matching your unique voice.</p>
              </div>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Persona Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarcastic Dev"
                    value={workshopPersonaName}
                    onChange={(e) => setWorkshopPersonaName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={workshopCategory}
                    onChange={(e) => setWorkshopCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Conversational & Social">Conversational</option>
                    <option value="Marketing & Copywriting">Marketing</option>
                    <option value="Academic & Professional">Academic</option>
                    <option value="Creative & Scriptwriting">Creative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Banned AI Giveaway Words</label>
                  <input
                    type="text"
                    placeholder="e.g. delve, showcase, pivot"
                    value={workshopBannedWords}
                    onChange={(e) => setWorkshopBannedWords(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Tone Adjectives</label>
                  <input
                    type="text"
                    placeholder="e.g. dry, brief, blunt"
                    value={workshopAdjectives}
                    onChange={(e) => setWorkshopAdjectives(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Custom Constraints or Target Rules</label>
                <textarea
                  placeholder="e.g. Use lots of industry-specific jargon but explain them instantly with a dry sarcasm. Avoid all standard bullet point formats."
                  value={workshopCustomRules}
                  onChange={(e) => setWorkshopCustomRules(e.target.value)}
                  className="w-full h-14 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl border border-indigo-500/20 shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Compile Custom Blueprint Persona</span>
              </button>

              <AnimatePresence>
                {showWorkshopSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-emerald-950/40 border border-emerald-500/25 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-semibold"
                  >
                    ✨ Persona Compiled! Injected into Step 1 library.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

        </section>

        {/* ================= RIGHT SIDE: PROMPT ASSEMBLER WORKSPACE (lg:col-span-7) ================= */}
        <section className="lg:col-span-7 space-y-6" id="assembled_output_column">
          
          {/* Main workspace */}
          <div className="bg-slate-950/85 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            
            {/* Header section of assembler */}
            <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-200">2. Configure prompt layers & Sandbox</h2>
                  <p className="text-[11px] text-slate-400">Toggle micro-scrub layers & review simulated humanized output.</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedPersonaId('no_bs_copywriter');
                  setActiveScrubs(['vocab_scrub', 'burstiness', 'no_throat_clearing']);
                  setCustomTextInput('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-850 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1"
                title="Reset Workspace"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Space</span>
              </button>
            </div>

            {/* Config & Sandbox Form Area */}
            <div className="p-6 space-y-6">
              
              {/* Modifier toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <span>Stack Micro-Scrub Modifiers</span>
                  </label>
                  <span className="text-[10px] text-slate-500 italic">Select to append constraints dynamically</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {QUICK_SCRUBS.map(scrub => {
                    const isActive = activeScrubs.includes(scrub.id);
                    return (
                      <button
                        key={scrub.id}
                        onClick={() => toggleScrub(scrub.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 group relative ${
                          isActive 
                            ? 'bg-amber-950/15 border-amber-500/40 text-slate-100 shadow-inner' 
                            : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isActive ? (
                            <CheckSquare className="h-4 w-4 text-amber-500 animate-pulse" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-700 group-hover:text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                            <span>{scrub.emoji}</span>
                            <span>{scrub.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">{scrub.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Draft Playground sandbox */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>AI Draft Sandbox (Simulates Prompt Outputs)</span>
                  </label>
                  {customTextInput && (
                    <button 
                      onClick={() => setCustomTextInput('')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear Draft</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  Paste raw AI drafts here to test. The tool highlights detected AI cliches in real-time and simulates exactly how the prompt reshapes it offline.
                </p>

                <textarea
                  value={customTextInput}
                  onChange={(e) => setCustomTextInput(e.target.value)}
                  placeholder="Paste your ChatGPT / Gemini / Claude draft here... (e.g. 'We want to delve deeper to leverage our synergy and foster a holistic tapestry...')"
                  className="w-full h-24 bg-slate-900 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none"
                />

                {/* Sample drafts loading row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-850">
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Try AI-Slop Drafts:</span>
                  {SAMPLE_INPUTS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => handleInjectSample(sample)}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all shrink-0 font-medium"
                    >
                      {sample.emoji} {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Analysis & Simulator Panel (Shown only when there is text input) */}
              {customTextInput.trim() && (
                <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4.5 space-y-4" id="sandbox_interactive_panel">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Live Footprints & Slop Scanner</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold font-mono">
                      ✨ Prompt Simulation
                    </span>
                  </div>

                  {/* Highlights and live contrast dictionaries */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Footprint scanner original */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-rose-300 font-bold uppercase flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>Flagged Slop Words Found ({detectedSlopWords.length})</span>
                      </div>
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-rose-500/20 max-h-40 overflow-y-auto text-xs leading-relaxed text-slate-300">
                        {detectedSlopWords.length === 0 ? (
                          <span className="text-slate-500 italic">No blatant LLM giveaway terms detected in this draft. Looking clean!</span>
                        ) : (
                          <div className="space-y-1.5">
                            {detectedSlopWords.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-850 last:border-0">
                                <span className="font-mono text-rose-400 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">
                                  {item.word}
                                </span>
                                <span className="text-slate-500 text-[10px]">→</span>
                                <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                  {item.replacement}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulated output comparison */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Interactive Rewrite Simulator</span>
                      </div>
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/20 max-h-40 overflow-y-auto text-xs leading-relaxed text-slate-200">
                        {simulatedOutput}
                      </div>
                    </div>

                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 flex items-center gap-2.5">
                    <Lightbulb className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      <strong>Simulator Proof Concept:</strong> The above rewrite demonstrates the instant, natural results of feed-forward prompt mapping. Simply copy the master instructions block below and paste it in ChatGPT or Claude with this text draft to get a comprehensive, dynamic rewrite!
                    </p>
                  </div>
                </div>
              )}

              {/* Master Prompt Output Generation */}
              <div className="space-y-2.5 pt-3 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkle className="h-4 w-4 text-indigo-400" />
                    <span>3. Master Engineered Prompt Block</span>
                  </div>
                  
                  <span className="text-[10px] text-slate-500 font-mono">100% Free • Copy Ready</span>
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  This custom prompt holds your chosen persona guidelines, custom bans, burstiness pacing rules, formatting constraints, and input draft.
                </p>

                <div className="relative group">
                  <pre className="w-full bg-slate-950/90 border border-indigo-500/25 rounded-xl p-4 md:p-5 text-[11px] text-indigo-100 font-mono overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre-wrap">
                    {assembledPrompt}
                  </pre>
                  
                  {/* Copy button floating */}
                  <div className="absolute top-3 right-3 opacity-95 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(assembledPrompt, 'final')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                        copiedId === 'final' 
                          ? 'bg-emerald-600 text-white shadow-emerald-950/50 scale-102' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50 hover:scale-102'
                      }`}
                    >
                      {copiedId === 'final' ? (
                        <>
                          <Check className="h-3.5 w-3.5 animate-pulse" />
                          <span>Copied Blueprint!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Prompt Blueprint</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Quick Informational Guide */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3.5 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-indigo-400" />
              <span>Prompt Suite Integration Guide</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
              <div className="space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-indigo-400 font-mono font-bold block uppercase">Step 1</span>
                <p>Configure your target persona and micro-scrub layers in our visual sandbox library.</p>
              </div>
              <div className="space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">Step 2</span>
                <p>Paste your initial AI text to instantly preview banned slop highlights and synonmym swaps.</p>
              </div>
              <div className="space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Step 3</span>
                <p>Copy the master block, drop it into ChatGPT / Claude, and get fully humanized text output!</p>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* 🧼 Simple Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 px-6 py-5.5 mt-12 text-center" id="footer_section">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 AI Footprint Scrub. All prompt assets are fully open-source and free to distribute. No external server requests are made.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-850 px-3 py-1 rounded-lg">
              🔒 Client-Only Sandbox
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
