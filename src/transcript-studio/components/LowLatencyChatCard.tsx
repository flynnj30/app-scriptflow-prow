import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Bot, 
  User, 
  Clock, 
  Loader2, 
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { LowLatencyChatMsg } from '../types';

interface LowLatencyChatCardProps {
  transcript: string;
  fileName: string;
}

const PRESET_QUERIES = [
  'What were the customer’s main objections?',
  'List all explicit next steps and action items',
  'Summarize the entire call in 3 bullet points',
  'Who was on the call and what were their roles?',
  'Draft a 2-paragraph follow-up email'
];

export const LowLatencyChatCard: React.FC<LowLatencyChatCardProps> = ({
  transcript,
  fileName
}) => {
  const [messages, setMessages] = useState<LowLatencyChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am your low-latency AI meeting assistant powered by gemini-3.1-flash-lite. Ask me anything about ${fileName || 'this recording'} for instant sub-second answers.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.1-flash-lite',
      latencyMs: 180
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsg: LowLatencyChatMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const startTime = Date.now();
    try {
      const res = await fetch('/transcript-api/low-latency-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          transcript
        })
      });

      const data = await res.json();
      const latency = data.latencyMs || (Date.now() - startTime);

      if (data.success && data.answer) {
        const assistantMsg: LowLatencyChatMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: data.answer,
          latencyMs: latency,
          modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const fallbackMsg: LowLatencyChatMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: data.error || 'Could not process query right now. Please try again.',
          latencyMs: latency,
          modelUsed: 'gemini-3.1-flash-lite',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (err: any) {
      console.error('Low latency query error:', err);
      const latency = Date.now() - startTime;
      const errorMsg: LowLatencyChatMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: 'Network error communicating with gemini-3.1-flash-lite endpoint.',
        latencyMs: latency,
        modelUsed: 'gemini-3.1-flash-lite',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Chat reset. Ask any question about ${fileName || 'this recording'} for instant answers.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.1-flash-lite',
        latencyMs: 140
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full max-h-[750px] p-4 sm:p-5 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/40 via-yellow-900/20 to-slate-900/60 border border-amber-500/30 rounded-2xl p-4 mb-4 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Low-Latency Responses
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
              gemini-3.1-flash-lite
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Sub-Second Intelligence Assistant
          </h3>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs flex items-center gap-1 cursor-pointer shrink-0"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Preset Suggestions */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>Quick Questions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendQuery(preset)}
              className="text-left text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[220px] mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed backdrop-blur-sm relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20 border border-indigo-400/30'
                  : 'bg-slate-900/80 text-slate-100 rounded-bl-none border border-white/10 shadow-md'
              }`}
            >
              {/* Header inside bubble */}
              <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-80 border-b border-white/10 pb-1">
                <span className="flex items-center gap-1 font-semibold">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-amber-400" />}
                  {msg.role === 'user' ? 'You' : 'Gemini Lite'}
                </span>
                
                <div className="flex items-center gap-2">
                  {msg.latencyMs && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {msg.latencyMs}ms
                    </span>
                  )}
                  <span className="font-mono text-[10px]">{msg.timestamp}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap select-text font-sans">
                {msg.text}
              </div>

              {/* Copy button on hover */}
              {msg.role === 'assistant' && (
                <div className="mt-2 pt-1 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Answer</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-slate-900/60 border border-amber-500/30 rounded-2xl p-3 max-w-[240px] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Querying gemini-3.1-flash-lite...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="shrink-0 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything about this recording for instant response..."
          disabled={isLoading}
          className="flex-1 bg-slate-950/80 border border-white/15 focus:border-amber-400 focus:outline-none rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-all"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          title="Send query"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
