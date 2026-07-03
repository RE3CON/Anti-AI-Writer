import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Image as ImageIcon, 
  Database, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Settings, 
  RefreshCw, 
  FileJson, 
  Zap, 
  Download, 
  Info, 
  AlertCircle, 
  Terminal, 
  BookOpen, 
  Cpu, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Type Definitions
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  model: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  model: string;
  aspectRatio: string;
}

export default function App() {
  // Navigation & Global State
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'extract' | 'sandbox' | 'prompts' | 'help'>('chat');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Chat Lab State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState('gemini-3.5-flash');
  const [systemInstruction, setSystemInstruction] = useState('You are Gemini, a highly competent, creative, and technical AI assistant. Answer concisely, thoroughly, and provide clean code examples when relevant.');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [autoCopyToClipboard, setAutoCopyToClipboard] = useState<boolean>(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 2. Image Studio State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [imageModel, setImageModel] = useState('gemini-3.1-flash-lite-image');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // 3. Structured Extractor State
  const [extractorText, setExtractorText] = useState('');
  const [extractorSchemaType, setExtractorSchemaType] = useState<'receipt' | 'contact' | 'tasks' | 'custom'>('receipt');
  const [customSchema, setCustomSchema] = useState(
`{
  "type": "OBJECT",
  "properties": {
    "bookTitle": { "type": "STRING", "description": "The title of the book" },
    "author": { "type": "STRING" },
    "rating": { "type": "NUMBER", "description": "Rating out of 10" },
    "genres": { 
      "type": "ARRAY", 
      "items": { "type": "STRING" } 
    }
  },
  "required": ["bookTitle", "author"]
}`);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractorPrompt, setExtractorPrompt] = useState('You are an expert data parsing assistant. Carefully extract structured fields from the provided raw text source.');

  // 4. Code Sandbox State
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxCode, setSandboxCode] = useState<string>('');
  const [sandboxPreviewUrl, setSandboxPreviewUrl] = useState<string>('');
  const [sandboxActiveTab, setSandboxActiveTab] = useState<'editor' | 'preview'>('preview');

  // Load Initial Configurations and Check Connectivity
  useEffect(() => {
    checkConnection();
    
    // Add dummy welcome message
    setChatMessages([
      {
        id: 'welcome',
        role: 'model',
        content: "Welcome to the **Gemini AI Laboratory**! I am initialized and ready to assist you. Select one of the labs from the sidebar to explore creative text generation, AI imaging, structured data mining, or interactive code synthesis.",
        timestamp: new Date(),
        model: 'gemini-3.5-flash'
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const checkConnection = async () => {
    try {
      setApiConnected(null);
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'ping', model: 'gemini-3.5-flash', config: { maxOutputTokens: 5 } })
      });
      const data = await res.json();
      if (res.ok) {
        setApiConnected(true);
        setConnectionError(null);
      } else {
        setApiConnected(false);
        setConnectionError(data.error || 'Server returned an error');
      }
    } catch (err: any) {
      setApiConnected(false);
      setConnectionError(err.message || 'Could not connect to full-stack backend server');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Handle Chat Submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
      model: chatModel
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);

    // Create immediate placeholder message for streaming/generating
    const modelMsgId = Math.random().toString();
    const modelMsgPlaceholder: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: new Date(),
      model: chatModel
    };
    setChatMessages(prev => [...prev, modelMsgPlaceholder]);

    try {
      // Use Server-Sent Events for realistic streaming
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatMessages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + `\nUser: ${userMsg.content}`,
          model: chatModel,
          config: {
            systemInstruction,
            temperature,
            topP,
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedContent += parsed.text;
                // Update model message in place
                setChatMessages(prev => prev.map(msg => {
                  if (msg.id === modelMsgId) {
                    return { ...msg, content: accumulatedContent };
                  }
                  return msg;
                }));
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      if (autoCopyToClipboard && accumulatedContent.trim()) {
        navigator.clipboard.writeText(accumulatedContent);
        setCopiedId(modelMsgId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => prev.map(msg => {
        if (msg.id === modelMsgId) {
          return { 
            ...msg, 
            content: `⚠️ **Error generating response:** ${err.message || 'An unexpected error occurred.'}` 
          };
        }
        return msg;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Handle Image Generation
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          imageSize: imageSize,
          model: imageModel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = {
        id: Math.random().toString(),
        url: data.image,
        prompt: imagePrompt,
        timestamp: new Date(),
        model: imageModel,
        aspectRatio: imageAspectRatio
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
      setImagePrompt('');
    } catch (err: any) {
      alert(`Image Generation Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Handle Structured Data Extraction
  const getSelectedSchema = () => {
    switch (extractorSchemaType) {
      case 'receipt':
        return {
          type: "OBJECT",
          properties: {
            merchantName: { type: "STRING", description: "Name of the merchant, store, or cafe" },
            transactionDate: { type: "STRING", description: "Date of transaction, format YYYY-MM-DD or as listed" },
            subtotal: { type: "NUMBER", description: "Subtotal amount before tax" },
            tax: { type: "NUMBER" },
            totalAmount: { type: "NUMBER", description: "Final total paid amount" },
            lineItems: {
              type: "ARRAY",
              description: "Individual items listed in the transaction",
              items: {
                type: "OBJECT",
                properties: {
                  description: { type: "STRING", description: "The descriptive item name" },
                  quantity: { type: "NUMBER" },
                  price: { type: "NUMBER", description: "The unit price or line total" }
                },
                required: ["description", "price"]
              }
            }
          },
          required: ["merchantName", "totalAmount"]
        };
      case 'contact':
        return {
          type: "OBJECT",
          properties: {
            fullName: { type: "STRING" },
            jobTitle: { type: "STRING" },
            organization: { type: "STRING" },
            emailAddress: { type: "STRING" },
            phoneNumber: { type: "STRING" },
            officeAddress: { type: "STRING" },
            socialHandles: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["fullName"]
        };
      case 'tasks':
        return {
          type: "OBJECT",
          properties: {
            projectName: { type: "STRING" },
            urgencyLevel: { type: "STRING", description: "High, Medium, or Low" },
            actions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  taskDescription: { type: "STRING" },
                  assignedOwner: { type: "STRING" },
                  targetDeadline: { type: "STRING" }
                },
                required: ["taskDescription"]
              }
            }
          },
          required: ["projectName", "actions"]
        };
      case 'custom':
        try {
          return JSON.parse(customSchema);
        } catch (e) {
          return null;
        }
    }
  };

  const handleExtract = async () => {
    if (!extractorText.trim() || isGenerating) return;

    const schema = getSelectedSchema();
    if (!schema) {
      alert("Invalid custom JSON schema. Please check your syntax.");
      return;
    }

    setIsGenerating(true);
    setExtractedData(null);

    try {
      const res = await fetch('/api/gemini/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractorText,
          schema: schema,
          promptDescription: extractorPrompt
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract structured data');
      }

      setExtractedData(data.data);
    } catch (err: any) {
      alert(`Extraction Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Handle Code Sandbox Synthesis
  const handleSynthesizeSandboxCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setSandboxActiveTab('preview');
    try {
      const systemPrompt = `You are a high-end, senior frontend engineer. Build a fully styled, highly responsive, interactive, single-file HTML component based on the user's prompt.
Your response MUST be ONLY a single cohesive HTML document containing inline tailwind via CDN (<script src="https://cdn.tailwindcss.com"></script>), beautiful interactive modern designs, responsive layouts, fully functional vanilla JS in <script> tags, and clean mock data.
Make it exceptionally gorgeous (using rich borders, modern dark or light palettes, micro-interactions, subtle glassmorphic shadows, state toggles, and lovely typography).
IMPORTANT: DO NOT wrapping your code in generic Markdown blocks unless required, but ideally just return the clean HTML directly. In case you do return markdown blocks like \`\`\`html, I will extract it, but output ONLY the valid full HTML document code.`;

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sandboxPrompt,
          model: 'gemini-3.1-pro-preview', // Pro model for complex coding tasks
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3 // Low temperature for code accuracy
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      // Extract HTML from potential markdown wraps
      let rawText = data.text || '';
      let cleanCode = rawText;
      
      const mdRegex = /```html\s*([\s\S]*?)\s*```/;
      const match = rawText.match(mdRegex);
      if (match && match[1]) {
        cleanCode = match[1].trim();
      } else {
        // Fallback for general markdown wrappers
        const generalMdRegex = /```[\s\S]*?```/;
        if (generalMdRegex.test(rawText)) {
          cleanCode = rawText.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
        }
      }

      setSandboxCode(cleanCode);
      
      // Revoke old URL if exists
      if (sandboxPreviewUrl) {
        URL.revokeObjectURL(sandboxPreviewUrl);
      }
      
      // Create fresh blob URL for the iframe srcDoc/src
      const blob = new Blob([cleanCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setSandboxPreviewUrl(url);

    } catch (err: any) {
      alert(`Synthesis Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct load prompt template helper
  const loadPromptPreset = (promptText: string, targetType: 'chat' | 'image' | 'sandbox') => {
    if (targetType === 'chat') {
      setChatInput(promptText);
      setActiveTab('chat');
    } else if (targetType === 'image') {
      setImagePrompt(promptText);
      setActiveTab('image');
    } else if (targetType === 'sandbox') {
      setSandboxPrompt(promptText);
      setActiveTab('sandbox');
    }
  };

  const getAspectRatioClasses = (ratio: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16] max-h-[450px]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 antialiased font-sans" id="main_wrapper">
      
      {/* 1. SIDE NAVIGATION RAIL */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between select-none shrink-0" id="sidebar">
        <div>
          {/* Logo Brand Box */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-100">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-sm">Gemini AI Lab</h1>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise Workspace</p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="px-4 py-3 mx-3 my-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                apiConnected === null ? 'bg-amber-400 animate-pulse' :
                apiConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {apiConnected === null ? 'Checking Gateway' : 
                 apiConnected ? 'Gateway Live' : 'No Connection'}
              </span>
            </div>
            <button 
              onClick={checkConnection}
              className="text-slate-400 hover:text-blue-600 p-1 hover:bg-white rounded-md border border-transparent hover:border-slate-100 transition-all"
              title="Ping Server Gateway"
              id="ping_gateway_btn"
            >
              <RefreshCw className={`h-3 w-3 ${apiConnected === null ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="px-3 space-y-1.5" id="nav_menu">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'chat' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_chat_btn"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              <span>Speech & Chat Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'image' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_image_btn"
            >
              <ImageIcon className="h-4.5 w-4.5" />
              <span>AI Image Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('extract')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'extract' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_extract_btn"
            >
              <Database className="h-4.5 w-4.5" />
              <span>Structured Extractor</span>
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'sandbox' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_sandbox_btn"
            >
              <Code2 className="h-4.5 w-4.5" />
              <span>Interactive Code Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'prompts' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_prompts_btn"
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>Curated Prompts Library</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'help' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="tab_help_btn"
            >
              <Info className="h-4.5 w-4.5" />
              <span>User Guide & About</span>
            </button>
          </nav>
        </div>

        {/* Workspace Footer Details */}
        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50/50">
          <div className="font-semibold text-slate-600">Workspace Tenant ID</div>
          <div className="font-mono mt-0.5 select-all text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">d50bf1ce-ec5b-495b-9d8c</div>
          <div className="mt-2 text-[9px] text-slate-400 leading-relaxed">
            All API routes routed securely server-side. No client-side exposure.
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER AREA */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative" id="main_content">
        
        {/* Warning Toast if disconnected */}
        {apiConnected === false && (
          <div className="bg-rose-50 text-rose-800 px-6 py-3 border-b border-rose-100 flex items-center justify-between text-xs font-medium" id="conn_warning">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                <strong>System Gateway Offline:</strong> {connectionError || 'Gemini API key is unconfigured. Please declare process.env.GEMINI_API_KEY.'}
              </span>
            </div>
            <button 
              onClick={checkConnection}
              className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-lg text-[10px] font-bold transition-all shadow-sm"
              id="retry_conn_btn"
            >
              Retry Handshake
            </button>
          </div>
        )}

        {/* Tab Display Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeTab}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <h2 className="text-slate-950 font-bold text-sm tracking-tight">
              {activeTab === 'chat' && 'Speech & Chat Lab'}
              {activeTab === 'image' && 'AI Image Design Studio'}
              {activeTab === 'extract' && 'Structured Data Extraction'}
              {activeTab === 'sandbox' && 'Prompt-to-App Sandbox Compiler'}
              {activeTab === 'prompts' && 'Optimized Prompt Templates'}
              {activeTab === 'help' && 'System Guide & Laboratory Manual'}
            </h2>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            {isGenerating && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100" id="global_status_indicator">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider">Compiling Output...</span>
              </div>
            )}
            <span className="hidden md:inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px]">
              UTC: 2026-07-03
            </span>
          </div>
        </header>

        {/* 3. SCROLLABLE TAB PANEL AREA */}
        <div className="flex-1 overflow-y-auto p-8 relative" id="workspace_viewport">
          <AnimatePresence mode="wait">
            
            {/* TAB A: SPEECH & CHAT LAB */}
            {activeTab === 'chat' && (
              <motion.div 
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto h-full flex flex-col justify-between"
                id="chat_panel"
              >
                {/* Advanced Config Overlay Drawer Toggle */}
                <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-4">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Lab Parameters</span>
                      <p className="text-[10px] text-slate-400">Configure parameters for text compilation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={chatModel} 
                      onChange={(e) => setChatModel(e.target.value)}
                      className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500"
                      id="chat_model_selector"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex)</option>
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                    </select>
                    <button 
                      onClick={() => setShowChatSettings(!showChatSettings)}
                      className="text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-1"
                      id="toggle_advanced_settings"
                    >
                      <span>{showChatSettings ? 'Hide' : 'Configure'}</span>
                    </button>
                  </div>
                </div>

                {/* Settings Panel Drawer */}
                {showChatSettings && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4 space-y-4"
                    id="advanced_settings_drawer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">System Instructions (Context Setting)</label>
                        <textarea 
                          rows={3}
                          value={systemInstruction}
                          onChange={(e) => setSystemInstruction(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                          placeholder="Inject default personality, rules, constraints..."
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                            <span>Temperature (Creativity Control)</span>
                            <span>{temperature}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="2" 
                            step="0.1" 
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                            <span>Top P (Nucleus Sampling)</span>
                            <span>{topP}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">Auto-Copy Responses</span>
                            <span className="text-[10px] text-slate-400">Copy output to clipboard automatically upon completion</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAutoCopyToClipboard(!autoCopyToClipboard)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              autoCopyToClipboard ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                            id="auto_copy_toggle"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                autoCopyToClipboard ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Conversation Box */}
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" id="chat_messages_viewport">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'model' && (
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                            <Sparkles className="h-4.5 w-4.5" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed font-medium shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}>
                          <div className="prose prose-sm max-w-none break-words">
                            {/* Handcrafted simple Markdown/Text parser */}
                            {msg.content ? msg.content.split('\n').map((para, i) => {
                              if (para.startsWith('**') && para.endsWith('**')) {
                                return <p key={i} className="font-bold my-1 text-slate-950">{para.replace(/\*\*/g, '')}</p>;
                              }
                              if (para.startsWith('###')) {
                                return <h4 key={i} className="font-bold text-sm my-1 text-slate-950 mt-2">{para.replace(/###/g, '').trim()}</h4>;
                              }
                              return <p key={i} className="mb-1">{para}</p>;
                            }) : (
                              <div className="flex items-center gap-1.5 py-1 text-slate-400">
                                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                              </div>
                            )}
                          </div>
                          
                          {/* Message meta actions */}
                          <div className={`flex items-center justify-between mt-2.5 pt-2 border-t text-[9px] ${
                            msg.role === 'user' ? 'border-blue-500 text-blue-200' : 'border-slate-100 text-slate-400'
                          }`}>
                            <span>Model: {msg.model}</span>
                            <button 
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                              id={`copy_msg_${msg.id}`}
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 items-center">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a query or prompt instructions..."
                      disabled={isGenerating || apiConnected === false}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      id="chat_input_field"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !chatInput.trim() || apiConnected === false}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                      id="send_chat_btn"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB B: AI IMAGE STUDIO */}
            {activeTab === 'image' && (
              <motion.div 
                key="image-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
                id="image_panel"
              >
                {/* Control Panel (4 cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Render Control Console</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Define your visual synthesis prompt</p>
                  </div>

                  <form onSubmit={handleGenerateImage} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Visual Prompt Text</label>
                      <textarea 
                        rows={4}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="A hyper-detailed digital art of a futuristic space launch pad, dramatic evening light, neon glows, cinematic style..."
                        disabled={isGenerating || apiConnected === false}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                        id="image_prompt_field"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Aspect Ratio</label>
                        <select 
                          value={imageAspectRatio}
                          onChange={(e) => setImageAspectRatio(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500"
                          id="image_aspect_ratio_selector"
                        >
                          <option value="1:1">1:1 Square</option>
                          <option value="16:9">16:9 Landscape</option>
                          <option value="9:16">9:16 Portrait</option>
                          <option value="4:3">4:3 Desktop</option>
                          <option value="3:4">3:4 Mobile</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Rendering Model</label>
                        <select 
                          value={imageModel}
                          onChange={(e) => setImageModel(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500"
                          id="image_model_selector"
                        >
                          <option value="gemini-3.1-flash-lite-image">Gemini 3.1 Lite Image</option>
                          <option value="gemini-3.1-flash-image">Gemini 3.1 Standard Image</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating || !imagePrompt.trim() || apiConnected === false}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      id="generate_image_btn"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Synthesize Image Asset</span>
                    </button>
                  </form>

                  {/* Suggestion Prompts */}
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Prompt Inspiration</span>
                    <div className="space-y-2">
                      {[
                        "Cyberpunk noodle stall in the rain with glowing violet neon signage",
                        "Cute isometric 3D game model of a wizard cat, soft pastel colors",
                        "Minimalist logo representing dynamic artificial intelligence, flat vector style"
                      ].map((sug, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setImagePrompt(sug)}
                          className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl text-[10px] text-slate-600 hover:text-blue-700 transition-all font-semibold"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Canvas Render Area (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Selected/Main Display */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden" id="image_canvas_preview">
                    {selectedImage ? (
                      <div className="w-full flex flex-col items-center gap-4">
                        <div className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 max-w-full ${getAspectRatioClasses(selectedImage.aspectRatio)} flex items-center justify-center`}>
                          <img 
                            src={selectedImage.url} 
                            alt={selectedImage.prompt}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="w-full border-t border-slate-100 pt-4 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Generated Asset Prompt</span>
                            <p className="text-xs font-semibold text-slate-800 italic">"{selectedImage.prompt}"</p>
                            <span className="text-[10px] text-slate-400 block">Model: {selectedImage.model} ({selectedImage.aspectRatio})</span>
                          </div>
                          <a 
                            href={selectedImage.url}
                            download={`gemini_asset_${selectedImage.id}.png`}
                            className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 p-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Download className="h-4 w-4" />
                            <span>Save Asset</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700">Empty Rendering Stage</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs">Define a prompt on the left console to synthesize vector graphic mockups or scenic assets.</p>
                      </div>
                    )}

                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
                        <div className="h-9 w-9 rounded-xl border-2 border-blue-600 border-t-transparent animate-spin" />
                        <span className="text-xs font-bold text-slate-700">Synthesizing Pixel Grids...</span>
                        <p className="text-[10px] text-slate-400">Average generation time: 5-8 seconds</p>
                      </div>
                    )}
                  </div>

                  {/* History List */}
                  {generatedImages.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="h-4 w-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Asset Catalog History</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {generatedImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className={`aspect-square rounded-xl overflow-hidden border transition-all hover:scale-[1.03] duration-200 ${
                              selectedImage?.id === img.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                            }`}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB C: STRUCTURED EXTRACTOR */}
            {activeTab === 'extract' && (
              <motion.div 
                key="extract-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
                id="extractor_panel"
              >
                {/* Left Input Data Source (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Unstructured Raw Input</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Paste or import logs, email signatures, or receipts to parse</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">Extraction Schema Type</label>
                        <div className="grid grid-cols-2 gap-2" id="schema_selector_grid">
                          {[
                            { id: 'receipt', label: 'Receipt / Bill' },
                            { id: 'contact', label: 'Contact Card' },
                            { id: 'tasks', label: 'Action Checklist' },
                            { id: 'custom', label: 'Custom Schema' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setExtractorSchemaType(t.id as any)}
                              className={`px-3 py-2 border rounded-xl text-[11px] font-bold transition-all ${
                                extractorSchemaType === t.id 
                                  ? 'bg-blue-600 text-white border-blue-600' 
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Raw Text Content Source</label>
                        <textarea 
                          rows={6}
                          value={extractorText}
                          onChange={(e) => setExtractorText(e.target.value)}
                          placeholder="Paste receipt logs, business card signatures, transcript snippets..."
                          disabled={isGenerating || apiConnected === false}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-mono"
                          id="extractor_source_field"
                        />
                      </div>

                      <button
                        onClick={handleExtract}
                        disabled={isGenerating || !extractorText.trim() || apiConnected === false}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        id="run_extraction_btn"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Synthesize JSON Payload</span>
                      </button>
                    </div>

                    {/* Presets to load dummy text to make it easy to test */}
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Preset Data Samples</span>
                      <div className="space-y-1.5">
                        <button 
                          onClick={() => {
                            setExtractorSchemaType('receipt');
                            setExtractorText(
`BLUE BOTTLE COFFEE
Store #104 - SOMA San Francisco
Date: 2026-06-25 08:42 AM

1x Latte Macchiato    $6.50
1x Avocado Toast     $11.00
1x Blueberry Scone    $4.25

Subtotal:            $21.75
VAT (8.5%):          $1.85
TOTAL PAID:          $23.60
Visa ending in 4029`
                            );
                          }}
                          className="w-full text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-600 font-semibold flex items-center justify-between"
                        >
                          <span>Blue Bottle Coffee Receipt</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                        </button>
                        <button 
                          onClick={() => {
                            setExtractorSchemaType('contact');
                            setExtractorText(
`Sherlock Holmes
Consulting Detective | Baker Street Consulting
Phone: +44 20 7224 3688
Email: holmes@bakerstreet.com
Office: 221B Baker St, London NW1 6XE, UK
Twitter: @consulting_sherlock`
                            );
                          }}
                          className="w-full text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-600 font-semibold flex items-center justify-between"
                        >
                          <span>Detective Contact Info</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Schema Config or Output Display (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Custom Schema Editor */}
                  {extractorSchemaType === 'custom' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <FileJson className="h-4.5 w-4.5 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900">Define Target JSON Schema</h4>
                      </div>
                      <textarea 
                        rows={6}
                        value={customSchema}
                        onChange={(e) => setCustomSchema(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-mono bg-slate-950 text-slate-200"
                        id="custom_schema_editor"
                      />
                    </div>
                  )}

                  {/* Schema Target View / Extracted output */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4.5 w-4.5 text-slate-400" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">JSON Compiler Output</h4>
                        </div>
                        {extractedData && (
                          <button 
                            onClick={() => copyToClipboard(JSON.stringify(extractedData, null, 2), 'extracted')}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg"
                            id="copy_extracted_btn"
                          >
                            {copiedId === 'extracted' ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Payload Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Payload</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {extractedData ? (
                        <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-[350px]">
                          <pre className="text-xs text-emerald-400 font-mono leading-relaxed select-all">
                            {JSON.stringify(extractedData, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center mx-auto text-slate-400">
                            <Database className="h-5 w-5" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-700">Awaiting Extraction</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Fill text data and press synthesize. The model will parse fields and return valid structured JSON formats.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2 text-[10px] text-slate-400">
                      <Info className="h-4.5 w-4.5" />
                      <span>Gemini models enforce structured JSON output natively by declaring custom schema schemas at inference time.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB D: CODE SANDBOX COMPILER */}
            {activeTab === 'sandbox' && (
              <motion.div 
                key="sandbox-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-6"
                id="sandbox_panel"
              >
                {/* Input Prompt Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-blue-600 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Synthesize Applet Widget</h3>
                      <p className="text-[10px] text-slate-400">Enter features, layout, and behaviors you want the compiled sandbox applet to have.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSynthesizeSandboxCode} className="flex gap-4">
                    <input 
                      type="text"
                      value={sandboxPrompt}
                      onChange={(e) => setSandboxPrompt(e.target.value)}
                      placeholder="Build a gorgeous pomodoro focus clock with customizable work/break timers, neon circular status ring, and relaxing audio tones..."
                      disabled={isGenerating || apiConnected === false}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      id="sandbox_prompt_field"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !sandboxPrompt.trim() || apiConnected === false}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      id="run_sandbox_btn"
                    >
                      <Play className="h-4.5 w-4.5" />
                      <span>Compile</span>
                    </button>
                  </form>
                </div>

                {/* Render Dual-View Sandbox Workspace */}
                {sandboxCode ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px]" id="sandbox_workspace_split">
                    {/* Source Code Editor Display */}
                    <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Synthesized Source Code</span>
                        <button 
                          onClick={() => copyToClipboard(sandboxCode, 'sandbox')}
                          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
                          id="copy_sandbox_code_btn"
                        >
                          {copiedId === 'sandbox' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto p-4 font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                        <pre>{sandboxCode}</pre>
                      </div>
                    </div>

                    {/* Interactive Live Stage View */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Interactive Execution Stage</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              // Reload the iframe url
                              if (sandboxPreviewUrl) {
                                const iframe = document.getElementById('sandbox_iframe_exec') as HTMLIFrameElement;
                                if (iframe) iframe.src = sandboxPreviewUrl;
                              }
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1 rounded-lg"
                            id="reload_sandbox_iframe_btn"
                          >
                            Reload Widget
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-100 relative">
                        <iframe 
                          id="sandbox_iframe_exec"
                          src={sandboxPreviewUrl} 
                          title="Interactive Execution Canvas"
                          className="w-full h-full border-none bg-white"
                          sandbox="allow-scripts allow-modals allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">No Compiled Sandbox Applet</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">Input specifications for widget dashboards, calculators, or design patterns and compile to execute code in sandbox real-time.</p>
                    </div>
                    <div className="max-w-md mx-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
                      <button 
                        onClick={() => setSandboxPrompt("Gorgeous glassmorphic dynamic weather dashboard with rain particles, custom sliders, and interactive layout.")}
                        className="text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all"
                      >
                        Glass Weather Dashboard
                      </button>
                      <button 
                        onClick={() => setSandboxPrompt("Fully playable digital synthesizer keyboard widget with audio playback and visual sound waves.")}
                        className="text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all"
                      >
                        Playable Keyboard Synthesizer
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB E: PROMPTS LIBRARY */}
            {activeTab === 'prompts' && (
              <motion.div 
                key="prompts-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
                id="prompts_library_panel"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900">Curated Prompt Blueprints</h3>
                  <p className="text-xs text-slate-500">Inject curated optimized prompts instantly into any design or chat lab.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="presets_grid_layout">
                  {[
                    {
                      category: 'UI & Design',
                      title: 'Tailwind Glassmorphic Cards',
                      desc: 'Design beautifully styled glassmorphic bento cards with micro-hover shadow states and elegant neon accent outlines.',
                      prompt: 'Create a glassmorphic dashboard component with beautiful gradients, Tailwind CSS, hover transition scaling, and circular status meters.',
                      target: 'sandbox'
                    },
                    {
                      category: 'Logic & Architecture',
                      title: 'Collaborative Board Planner',
                      desc: 'Prompt model to architect structural schemas and detailed full-stack architecture plans for team productivity pipelines.',
                      prompt: 'Formulate an elegant, modern visual mock layout and step-by-step database architecture breakdown for a high-concurrency whiteboard organizer.',
                      target: 'chat'
                    },
                    {
                      category: 'Visual & Assets',
                      title: 'Neo-Tokyo Isometric Art',
                      desc: 'Generate hyper-detailed 3D cyberpunk isometric architectural renders for product banners or background hero images.',
                      prompt: 'An isometric 3D render of a neon cyberpunk coffee shop in Tokyo, hyper-detailed, vibrant violet-orange light source, Unreal Engine cinematic style.',
                      target: 'image'
                    },
                    {
                      category: 'JSON Mining',
                      title: 'Transaction Receipt Logger',
                      desc: 'Configure Structured Data Miners to parse raw restaurant, retail, or credit receipts directly into valid JSON arrays.',
                      prompt: 'blue bottle coffee billing logs latte macchiato avocado toast total subtotal taxes items details...',
                      target: 'extract'
                    }
                  ].map((preset, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{preset.category}</span>
                        <h4 className="text-xs font-bold text-slate-900">{preset.title}</h4>
                        <p className="text-[11px] text-slate-400 font-semibold">{preset.desc}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-semibold">Targets: <strong className="text-slate-600 capitalize">{preset.target} Lab</strong></span>
                        <button 
                          onClick={() => {
                            if (preset.target === 'extract') {
                              setActiveTab('extract');
                            } else {
                              loadPromptPreset(preset.prompt, preset.target as any);
                            }
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <span>Inject Prompt</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB F: SYSTEM GUIDE & LABORATORY MANUAL */}
            {activeTab === 'help' && (
              <motion.div 
                key="help-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-8"
                id="help_manual_panel"
              >
                {/* Intro Hero Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Cpu className="h-40 w-40" />
                  </div>
                  <div className="max-w-2xl space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/50 px-3 py-1 rounded-full text-blue-100">Official Manual</span>
                    <h3 className="text-2xl font-bold tracking-tight">Welcome to the Gemini AI Laboratory</h3>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">
                      The Laboratory is a premium full-stack development environment designed for real-time generative intelligence modeling, structure parsing, and runtime sandbox execution. Securely proxying all traffic to avoid exposing credentials.
                    </p>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Left Column - Navigation Guidelines */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-blue-600" />
                        <span>Interactive Laboratories & How to Run Them</span>
                      </h4>

                      <div className="space-y-6">
                        {/* Lab 1 */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Lab Suite 01</span>
                          <h5 className="text-xs font-bold text-slate-800">Speech & Chat Lab</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                            An active modeling playground supporting system parameter overrides (temperature and nucleus topP), advanced instruction framing, and direct model swaps.
                          </p>
                          <div className="text-[11px] text-slate-600 font-medium pl-3 border-l-2 border-blue-200 mt-2">
                            <strong>Step-by-step:</strong> Enter system parameter limits, select a language model, define background instructions, and stream completions. Enable <em>Auto-Copy</em> to automatically buffer finalized answers.
                          </div>
                        </div>

                        {/* Lab 2 */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Lab Suite 02</span>
                          <h5 className="text-xs font-bold text-slate-800">AI Image Design Studio</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                            A high-fidelity render stage configured with pixel ratio scaling and aspect model selection for generating custom website illustrations, mockups, or background tiles.
                          </p>
                          <div className="text-[11px] text-slate-600 font-medium pl-3 border-l-2 border-blue-200 mt-2">
                            <strong>Step-by-step:</strong> Write structural descriptions of graphics (e.g., isometric room layouts), choose ratios like 16:9 or 9:16, click synthesize, and click save asset to download output as base64 png format.
                          </div>
                        </div>

                        {/* Lab 3 */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Lab Suite 03</span>
                          <h5 className="text-xs font-bold text-slate-800">Structured Data Extractor</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                            A strict JSON parsing system utilizing raw JSON schema declarations at inference to transform messy OCR text, signatures, or transcript arrays into strictly valid client payloads.
                          </p>
                          <div className="text-[11px] text-slate-600 font-medium pl-3 border-l-2 border-blue-200 mt-2">
                            <strong>Step-by-step:</strong> Choose a preset parser (Receipt, Contact Card, or Task list) or toggle <em>Custom Schema</em> to input custom keys, paste unstructured input text, and export the valid structured JSON.
                          </div>
                        </div>

                        {/* Lab 4 */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Lab Suite 04</span>
                          <h5 className="text-xs font-bold text-slate-800">Interactive Code Sandbox Compiler</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                            An advanced prompt-to-app generator that produces fully-styled standalone HTML/JS widgets based on text descriptions, then renders them in real-time execution canvas frames.
                          </p>
                          <div className="text-[11px] text-slate-600 font-medium pl-3 border-l-2 border-blue-200 mt-2">
                            <strong>Step-by-step:</strong> Specify features (e.g., interactive weather slider, scientific calculators), compile the app, view generated source code on the left editor, and test features interactively on the live stage.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Architecture & Quick Tips */}
                  <div className="space-y-6">
                    {/* Architecture Stats */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Gateway Configuration</h4>
                      
                      <div className="space-y-3 text-[11px] font-semibold text-slate-600">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span>Tenant Environment</span>
                          <span className="font-mono text-slate-800">Cloud Run Ingress</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span>Secure Proxy Port</span>
                          <span className="font-mono text-slate-800">3000</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span>Routing Mechanism</span>
                          <span className="font-mono text-slate-800">Server-Side SDK</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span>API Isolation</span>
                          <span className="text-emerald-600">100% Isolated</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tips Panel */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Helpful Usage Tips</h4>
                      
                      <ul className="space-y-3 text-[11px] font-semibold text-slate-500 leading-relaxed list-disc list-inside">
                        <li>
                          <strong className="text-slate-800">Offline Warning:</strong> If you see a connection warning, verify that your <code className="font-mono bg-slate-100 text-rose-600 px-1 rounded">GEMINI_API_KEY</code> is correctly set in Settings &gt; Secrets.
                        </li>
                        <li>
                          <strong className="text-slate-800">Interactive Presets:</strong> Visit the <strong className="text-blue-600">Curated Prompts Library</strong> tab to instantly load premade configurations and test specific features with one click.
                        </li>
                        <li>
                          <strong className="text-slate-800">Sandbox Code:</strong> Feel free to copy compiled sandbox source code blocks and paste them directly into standard text files for external deployment.
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

    </div>
  );
}
