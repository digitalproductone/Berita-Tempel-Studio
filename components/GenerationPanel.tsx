
import React, { useRef, useState } from 'react';
import type { Language, AppTheme, LayoutTemplate } from '../types';
import { Button } from './Button';
import { GenerateIcon, ZipIcon, SaveProjectIcon, ImportIcon, VideoIcon, XIcon, CheckIcon, MusicIcon } from './Icons';
import { Slider } from './Slider';

interface GenerationPanelProps {
    url: string;
    onUrlChange: (url: string) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    onGenerateText: () => void;
    isLoading: boolean;
    onDownloadAll: () => void;
    isDownloadingAll: boolean;
    hasResults: boolean;
    onSaveProject: () => void;
    onLoadProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
    videoBackground: File | null;
    onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onVideoRemove: () => void;
    videoBlur: number;
    onVideoBlurChange: (blur: number) => void;
    audioBackground?: File | null;
    onAudioUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAudioRemove?: () => void;
    audioVolume?: number;
    onAudioVolumeChange?: (volume: number) => void;
    layoutTemplates: LayoutTemplate[];
    onApplyLayoutTemplate: (template: LayoutTemplate) => void;
    activeTemplateName: string; // This is actually passing ID in App.tsx, handled as string
    onSaveLayoutTemplate: (name: string) => void;
    onDeleteLayoutTemplate: (templateId: string) => void;
    theme: AppTheme;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
    url, onUrlChange, language, onLanguageChange, onGenerateText, isLoading, onDownloadAll, isDownloadingAll, hasResults, onSaveProject, onLoadProject, videoBackground, onVideoUpload, onVideoRemove, videoBlur, onVideoBlurChange, audioBackground, onAudioUpload, onAudioRemove, audioVolume, onAudioVolumeChange, layoutTemplates, onApplyLayoutTemplate, activeTemplateName, onSaveLayoutTemplate, onDeleteLayoutTemplate, theme, isCollapsed = false, toggleCollapse
}) => {
    const loadProjectInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    const handleSaveNewTemplate = () => {
        if (newTemplateName.trim()) {
            onSaveLayoutTemplate(newTemplateName);
            setNewTemplateName('');
            setIsCreatingTemplate(false);
        }
    };

    return (
        <div className={`${theme.classes.mainPanel.bg} border-b ${theme.classes.headerBorder} backdrop-blur-xl shadow-lg relative z-30`}>
            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-all select-none group" onClick={toggleCollapse}>
                <h2 className={`text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-3`}>
                    <div className="relative">
                        <span className={`block w-2.5 h-2.5 rounded-full ${hasResults ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-500 shadow-inner'}`}></span>
                        {hasResults && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40"></span>}
                    </div>
                    {language === 'id' ? 'Sumber & Konfigurasi' : 'Source & Config'}
                </h2>
                <div className={`transform transition-all duration-300 text-slate-400 group-hover:text-white ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-5 pt-0 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    {/* URL Input Section */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <textarea
                                rows={3}
                                value={url}
                                onChange={(e) => onUrlChange(e.target.value)}
                                placeholder={language === 'id' ? 'Tempel URL artikel di sini...' : 'Paste article URLs here...'}
                                className={`w-full ${theme.classes.input.bg} ${theme.classes.input.text} p-4 rounded-xl border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing} text-sm resize-none font-mono shadow-2xl transition-all group-hover:border-white/20`}
                            />
                            <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                                <ImportIcon />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1/3">
                                <select
                                    value={language}
                                    onChange={(e) => onLanguageChange(e.target.value as Language)}
                                    className={`w-full h-full ${theme.classes.input.bg} ${theme.classes.input.text} px-3 py-2.5 rounded-xl border ${theme.classes.input.border} text-sm focus:outline-none focus:ring-2 ${theme.classes.input.focusRing} backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors`}
                                >
                                    <option value="en">English</option>
                                    <option value="id">Indonesia</option>
                                </select>
                            </div>
                            <div className="w-2/3">
                                <Button 
                                    onClick={onGenerateText} 
                                    isLoading={isLoading} 
                                    disabled={isLoading} 
                                    fullWidth 
                                    theme={theme}
                                    className="shadow-xl shadow-sky-900/20"
                                >
                                    <GenerateIcon />
                                    {language === 'id' ? 'Buat Konten' : 'Generate Content'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Project Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                         <Button 
                            onClick={onDownloadAll} 
                            isLoading={isDownloadingAll} 
                            disabled={isDownloadingAll || !hasResults} 
                            fullWidth 
                            className={`${theme.classes.button.success} shadow-xl shadow-emerald-900/20`} 
                            theme={theme}
                        >
                            <ZipIcon />
                            {language === 'id' ? 'Unduh Semua' : 'Download All'}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="file" accept=".json" ref={loadProjectInputRef} onChange={onLoadProject} className="hidden" />
                            <Button onClick={onSaveProject} disabled={!hasResults} fullWidth theme={theme} className="!bg-white/5 hover:!bg-white/10 border border-white/10 text-[10px] uppercase tracking-tighter">
                                <SaveProjectIcon />
                                {language === 'id' ? 'Simpan' : 'Save'}
                            </Button>
                            <Button onClick={() => loadProjectInputRef.current?.click()} fullWidth theme={theme} className="!bg-white/5 hover:!bg-white/10 border border-white/10 text-[10px] uppercase tracking-tighter">
                                <ImportIcon />
                                {language === 'id' ? 'Buka' : 'Load'}
                            </Button>
                        </div>
                    </div>

                    {/* Layout Templates - PROFESSIONAL GRID */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'id' ? 'Koleksi Template' : 'Template Library'}</span>
                            {!isCreatingTemplate ? (
                                <button 
                                    onClick={() => setIsCreatingTemplate(true)} 
                                    className="text-[10px] bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 px-2 py-1 rounded-lg flex items-center gap-1 font-bold transition-all border border-sky-500/20"
                                >
                                    + {language === 'id' ? 'Baru' : 'New'}
                                </button>
                            ) : (
                                <button onClick={() => setIsCreatingTemplate(false)} className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider">
                                    Cancel
                                </button>
                            )}
                        </div>
                        
                        {isCreatingTemplate && (
                            <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <input 
                                    type="text" 
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="Template Name..."
                                    className={`flex-1 ${theme.classes.input.bg} ${theme.classes.input.text} px-3 py-2 rounded-xl border ${theme.classes.input.border} text-xs focus:outline-none focus:ring-1 ${theme.classes.input.focusRing} backdrop-blur-md`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewTemplate()}
                                />
                                <button 
                                    onClick={handleSaveNewTemplate}
                                    disabled={!newTemplateName.trim()}
                                    className="bg-emerald-600 text-white px-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    <CheckIcon />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {layoutTemplates.map(template => (
                                <div key={template.id} className="relative group">
                                    <button
                                        onClick={() => onApplyLayoutTemplate(template)}
                                        className={`w-full px-3 py-2.5 text-left text-[10px] font-bold rounded-xl border transition-all duration-300 flex flex-col gap-1 ${
                                        activeTemplateName === template.id
                                            ? 'bg-white text-slate-900 border-white shadow-xl scale-105 z-10'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:border-white/10'
                                        }`}
                                        title={template.name}
                                    >
                                        <span className="truncate w-full uppercase tracking-tight">{template.name}</span>
                                        <span className={`text-[8px] opacity-60 px-1.5 py-0.5 rounded-full w-fit ${activeTemplateName === template.id ? 'bg-slate-900/10' : 'bg-white/5'}`}>
                                            {template.isCustom ? 'Custom' : 'Preset'}
                                        </span>
                                    </button>
                                    {template.isCustom && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteLayoutTemplate(template.id); }}
                                            className="absolute top-1 right-1 bg-rose-500/80 hover:bg-rose-600 rounded-lg p-1 text-white opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-md shadow-lg"
                                            title="Delete Template"
                                        >
                                            <XIcon className="h-2.5 w-2.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Global Background Video */}
                    <div className="pt-4 border-t border-white/10">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{language === 'id' ? 'Video Latar Global' : 'Global Video BG'}</span>
                         <div className="flex items-center gap-2">
                            <input type="file" accept="video/*" ref={videoInputRef} onChange={onVideoUpload} className="hidden" />
                            <Button onClick={() => videoInputRef.current?.click()} theme={theme} className="flex-1 text-[10px] py-2 !bg-white/5 hover:!bg-white/10 border border-white/10 uppercase tracking-wider">
                                <VideoIcon/>
                                {videoBackground ? (language === 'id' ? 'Ganti' : 'Change') : (language === 'id' ? 'Unggah' : 'Upload')}
                            </Button>
                            {videoBackground && (
                                <button onClick={onVideoRemove} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20">
                                    <XIcon className="h-4 w-4"/>
                                </button>
                            )}
                        </div>
                        {videoBackground && (
                            <div className="mt-4">
                                <Slider
                                    label={language === 'id' ? 'Blur Video' : 'Video Blur'}
                                    min={0}
                                    max={20}
                                    step={1}
                                    value={videoBlur}
                                    onChange={(e) => onVideoBlurChange(Number(e.target.value))}
                                    theme={theme}
                                />
                            </div>
                        )}
                    </div>

                    {/* Global Background Audio */}
                    <div className="pt-4 border-t border-white/10">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{language === 'id' ? 'Audio Latar Global' : 'Global Audio BG'}</span>
                         <div className="flex items-center gap-2">
                            <input type="file" accept="audio/*" ref={audioInputRef} onChange={onAudioUpload} className="hidden" />
                            <Button onClick={() => audioInputRef.current?.click()} theme={theme} className="flex-1 text-[10px] py-2 !bg-white/5 hover:!bg-white/10 border border-white/10 uppercase tracking-wider">
                                <MusicIcon/>
                                <span className="truncate max-w-[120px]">{audioBackground ? audioBackground.name : (language === 'id' ? 'Unggah Musik' : 'Upload Audio')}</span>
                            </Button>
                            {audioBackground && onAudioRemove && (
                                <button onClick={onAudioRemove} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20">
                                    <XIcon className="h-4 w-4"/>
                                </button>
                            )}
                        </div>
                        {audioBackground && audioVolume !== undefined && onAudioVolumeChange && (
                            <div className="mt-4">
                                <Slider
                                    label={language === 'id' ? 'Volume' : 'Volume'}
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={audioVolume}
                                    onChange={(e) => onAudioVolumeChange(Number(e.target.value))}
                                    unit="%"
                                    theme={theme}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
