'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Clipboard, 
  X, 
  ArrowRight, 
  Check, 
  Copy, 
  Download, 
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const SUPABASE_URL = 'https://osmwbhutgeyommforopj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dRQFcOENpKDdEeFuZFrw8A_TgSfwMXK';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const RESTRICTED_WORDS_MAP = {
  'star': 'star',
  'stars': 's-tar',
  'verification': 'v-erification',
  'fiverr': 'f-iverr',
  'pay': 'p-ay',
  'send money': 'send m-oney',
  'direct deal': 'dir-ect d-eal',
  'private': 'pr-ivate',
  'bypass fiverr': 'by-pass fi-verr',
  'external link': 'exte-rnal l-ink',
  'personal number': 'personal-number',
  'call me': 'ca-ll me',
  'bank transfer': 'b-ank transfer',
  
  review: 're-view',
  personal: 'pe-rsonal',
  call: 'c-all',
  bank: 'ba-nk',
  link: 'l-ink',
  spam: 's-pam',
  scam: 's-cam',
  fraud: 'f-raud',
  illegal: 'il-legal',
  hack: 'h-ack',
  hacking: 'hack-ing',
  pirated: 'pi-rated',
  cracked: 'crac-ked',
  copyright: 'copy-right',
  plagiarism: 'plagia-rism',
  account: 'acc-ount',
  sharing: 'sha-ring',
  password: 'pass-word',
  otp: 'o-tp',
  whatsapp: 'whats-app',
  telegram: 'tele-gram',
  skype: 'sky-pe',
  email: 'e-mail',
  gmail: 'g-mail',
  mail: 'm-ail',
  phone: 'p-hone',
  mobile: 'mo-bile',
  contact: 'con-tact',
  number: 'num-ber',
  facebook: 'face-book',
  instagram: 'insta-gram',
  messenger: 'messen-ger',
  discord: 'dis-cord',
  paypal: 'pay-pal',
  wise: 'w-ise',
  payoneer: 'payo-neer',
  payment: 'pay-ment',
  outside: 'out-side',
  refund: 're-fund',
  chargeback: 'charge-back',
  adult: 'a-dult',
  porn: 'p-orn',
  gambling: 'gam-bling',
  drugs: 'd-rugs',
  threat: 'th-reat',
  harassment: 'harass-ment',
  discrimination: 'discrimi-nation',
  preview: 'pr-eview',
  feedback: 'feed-back'
};

const applyDashWithCase = (matchedText, defaultReplacement) => {
  if (defaultReplacement && defaultReplacement.includes('-') && defaultReplacement.split('-').length > 2) {
    return defaultReplacement;
  }

  const mid = Math.floor(matchedText.length / 2);
  return matchedText.slice(0, mid) + '-' + matchedText.slice(mid);
};

export default function FiverrRewriter() {
  const [originalText, setOriginalText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [copied, setCopied] = useState(false);
  const [replacedCount, setReplacedCount] = useState(0);
  const [replacedWords, setReplacedWords] = useState([]);
  
  const [totalRewrittenCount, setTotalRewrittenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalCount = async () => {
      try {
        const { data, error } = await supabase
          .from('counters')
          .select('count')
          .eq('name', 'total_messages')
          .single();

        if (data && typeof data.count === 'number') {
          setTotalRewrittenCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch global count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalCount();
  }, []);

  const handleRewrite = async () => {
    if (!originalText.trim()) return;

    let text = originalText;
    let count = 0;
    const detectedWords = new Set();

    const keys = Object.keys(RESTRICTED_WORDS_MAP).sort((a, b) => b.length - a.length);

    keys.forEach((key) => {
      const regex = new RegExp(`(?<![/.-])\\b${key}\\b(?![/.-])`, 'gi');
      
      if (regex.test(text)) {
        const matches = text.match(regex);
        if (matches) {
          count += matches.length;
          matches.forEach((m) => detectedWords.add(m.toLowerCase()));
        }

        text = text.replace(regex, (match) => {
          const lowerMatch = match.toLowerCase();
          const predefined = RESTRICTED_WORDS_MAP[lowerMatch];

          if (predefined) {
            if (match === match.toUpperCase()) {
              return predefined.toUpperCase();
            }
            if (match[0] === match[0].toUpperCase()) {
              return predefined.charAt(0).toUpperCase() + predefined.slice(1);
            }
            return predefined;
          }

          return applyDashWithCase(match, predefined || match);
        });
      }
    });

    setRewrittenText(text);
    setReplacedCount(count);
    setReplacedWords(Array.from(detectedWords));

    try {
      const newCount = totalRewrittenCount + 1;
      const { error } = await supabase
        .from('counters')
        .update({ count: newCount })
        .eq('name', 'total_messages');

      if (!error) {
        setTotalRewrittenCount(newCount);
      }
    } catch (error) {
      console.error('Failed to update global count:', error);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setOriginalText(text);
    } catch (err) {
      alert('Failed to paste content from clipboard.');
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setRewrittenText('');
    setReplacedCount(0);
    setReplacedWords([]);
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!rewrittenText) return;
    const element = document.createElement('a');
    const file = new Blob([rewrittenText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'safe-fiverr-message.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getWordCount = (str) => (str.trim() ? str.trim().split(/\s+/).length : 0);

  return (
    <div className="w-full bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-5xl mx-auto z-10 flex flex-col items-center my-auto">
        
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <RefreshCw size={14} className={`text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{totalRewrittenCount.toLocaleString()} messages rewritten</span>
        </div>

        <div className="text-center mb-6 sm:mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200 leading-tight">
            Rewrite Fiverr Messages <span className="text-blue-400">Without Risk</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto px-2">
            Automatically replace restricted keywords in your Fiverr messages to keep your account safe from warnings or bans.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" /> Safe
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Zap size={14} className="text-amber-400" /> Instant Replacement
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Lock size={14} className="text-blue-400" /> 100% Client-Side
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            
            <div className="flex flex-col bg-slate-950/60 border border-white/10 rounded-xl p-4 transition-all focus-within:border-blue-500/50">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Original Message
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <button onClick={handlePaste} className="hover:text-blue-400 transition flex items-center gap-1">
                    <Clipboard size={12} /> Paste
                  </button>
                  <button onClick={handleClear} className="hover:text-red-400 transition flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                </div>
              </div>

              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste your Fiverr message here..."
                className="w-full h-48 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none font-mono"
              ></textarea>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>{getWordCount(originalText)} words</span>
                <span>{originalText.length} chars</span>
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-blue-600 rounded-full items-center justify-center border-2 border-slate-900 shadow-xl text-white">
              <ArrowRight size={18} />
            </div>

            <div className="flex flex-col bg-slate-950/60 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Safe Message
                </span>
                {replacedCount > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    {replacedCount} Words Fixed
                  </span>
                )}
              </div>

              <textarea
                readOnly
                value={rewrittenText}
                placeholder="Safe rewritten message will appear here..."
                className="w-full h-48 bg-transparent text-sm text-emerald-100 placeholder-slate-500 resize-none outline-none font-mono"
              ></textarea>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>{getWordCount(rewrittenText)} words</span>
                <span>{rewrittenText.length} chars</span>
              </div>
            </div>

          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleRewrite}
              disabled={!originalText.trim()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                !originalText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles size={16} /> Make Safe Message
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                disabled={!rewrittenText}
                className={`flex-1 sm:flex-none px-4 py-3 rounded-xl border text-xs font-semibold transition duration-300 flex items-center justify-center gap-2 ${
                  !rewrittenText
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                }`}
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!rewrittenText}
                className={`flex-1 sm:flex-none px-4 py-3 rounded-xl border text-xs font-semibold transition duration-300 flex items-center justify-center gap-2 ${
                  !rewrittenText
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Download size={14} /> Download .txt
              </button>
            </div>
          </div>

          {replacedCount > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                <AlertTriangle size={15} />
                <span>{replacedCount} restricted keyword{replacedCount > 1 ? 's' : ''} detected & replaced:</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {replacedWords.map((word, index) => (
                  <span key={index} className="px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono font-medium capitalize">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}