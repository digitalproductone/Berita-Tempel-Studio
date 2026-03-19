
import React, { useState } from 'react';
import { Button } from './Button';
import { MagicIcon, CopyIcon, CheckIcon } from './Icons';
import type { AiStrategy, Language, AppTheme } from '../types';

interface AiSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateStrategy: () => void;
  content: { strategy: AiStrategy | null };
  isLoading: Record<string, boolean>;
  hasGeneratedContent: boolean;
  language: Language;
  theme: AppTheme;
}

const ContentSection: React.FC<{
  title: string, 
  content: React.ReactNode, 
  copyValue?: string, 
  theme: AppTheme,
  language: Language,
}> = ({title, content, copyValue, theme, language}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyValue) return;
    navigator.clipboard.writeText(copyValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-gray-300">{title}</h4>
        {copyValue && (
          <Button onClick={handleCopy} theme={theme} className="!py-1 !px-2 text-xs bg-slate-600/50 hover:bg-slate-500/50">
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="w-16 text-center">{copied ? (language === 'id' ? 'Tersalin' : 'Copied') : (language === 'id' ? 'Salin' : 'Copy')}</span>
          </Button>
        )}
      </div>
      <div className={`text-gray-400 pl-2 border-l-2 ${theme.classes.modal.sectionBorder}`}>{content}</div>
    </div>
  );
};

export const AiSuiteModal: React.FC<AiSuiteModalProps> = ({
  isOpen, onClose, onGenerateStrategy, content, isLoading, hasGeneratedContent, language, theme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
      <div className={`${theme.classes.modal.bg} rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-white/10 backdrop-blur-2xl overflow-hidden`}>
        <div className={`flex justify-between items-center p-6 border-b border-white/10 bg-white/5`}>
          <h2 className={`text-xl font-bold ${theme.classes.modal.title} tracking-tight flex items-center gap-3`}>
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                <MagicIcon />
            </div>
            AI Creative Studio
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            &times;
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="flex gap-4">
            <Button 
                onClick={onGenerateStrategy} 
                isLoading={isLoading.strategy} 
                disabled={!hasGeneratedContent || isLoading.strategy} 
                theme={theme}
                className="shadow-xl shadow-sky-900/20"
            >
              <MagicIcon /> {language === 'id' ? 'Regenerasi Metadata' : 'Regenerate Metadata'}
            </Button>
          </div>
          
          {!hasGeneratedContent && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                {language === 'id' ? 'Harap buat teks dari URL terlebih dahulu untuk mengaktifkan AI Studio.' : 'Please generate text from a URL first to enable the AI Studio.'}
            </div>
          )}
          
          {content.strategy && (
            <div className={`space-y-6 ${theme.classes.modal.sectionBg} p-8 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md`}>
                <h3 className={`text-lg font-bold ${theme.classes.headerTitle} uppercase tracking-widest opacity-80`}>
                    {language === 'id' ? 'Metadata Video (Optimized)' : 'Video Metadata (Optimized)'}
                </h3>
                
                <div className="space-y-6">
                    <ContentSection 
                    title={language === 'id' ? 'Judul Video' : 'Video Title'} 
                    content={<p className="whitespace-pre-wrap text-lg font-bold text-white tracking-tight">{content.strategy.optimizedTitle}</p>} 
                    copyValue={content.strategy.optimizedTitle}
                    theme={theme}
                    language={language}
                    />
                    
                    <div className="h-px bg-white/5"></div>
                    
                    <ContentSection 
                    title={language === 'id' ? 'Deskripsi' : 'Description'} 
                    content={<p className="whitespace-pre-wrap text-sm leading-relaxed opacity-80">{content.strategy.optimizedDescription}</p>} 
                    copyValue={content.strategy.optimizedDescription}
                    theme={theme}
                    language={language}
                    />
                    
                    <div className="h-px bg-white/5"></div>
                    
                    <ContentSection 
                    title="Hashtags" 
                    content={<div className="flex flex-wrap gap-2">
                        {content.strategy.optimizedHashtags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-xs font-bold border border-sky-500/20">
                            {tag}
                        </span>
                        ))}
                    </div>} 
                    copyValue={content.strategy.optimizedHashtags.join(' ')}
                    theme={theme}
                    language={language}
                    />
                </div>
            </div>
          )}

          {isLoading.strategy && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    {language === 'id' ? 'Mengoptimalkan metadata...' : 'Optimizing metadata...'}
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
