
import React, { useState, useEffect } from 'react';
import type { DesignState, TextElementId, Language, ImageAiStyle, TextElementState, ImageState, AppTheme } from '../types';
import { ImageControl } from './ImageControl';
import { TextControl } from './TextControl';
import { GlobalStylesControl } from './GlobalStylesControl';
import { TemplateControl } from './TemplateControl';
import { ComicControl } from './ComicControl';
import { Button } from './Button';
import { DownloadIcon, MagicIcon, RegenerateIcon, ImageIcon, TextIcon, StyleIcon, ActionsIcon, TemplateIcon, ComicGenIcon, VideoIcon, LayersIcon, EyeIcon, EyeOffIcon, LockClosedIcon, LockOpenIcon } from './Icons';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import { ColorPicker } from './ColorPicker';

interface ControlPanelProps {
  designState: DesignState;
  onStateChange: <K extends keyof DesignState>(key: K, value: DesignState[K]) => void;
  onImageUpload: (id: 'image1' | 'image2', file: File) => void;
  onImagePaste: (id: 'image1' | 'image2', event: React.ClipboardEvent) => void;
  onImageDelete: (id: 'image1' | 'image2') => void;
  onUseOriginal: (id: 'image1' | 'image2') => void;
  onImageStateChange: (id: 'image1' | 'image2', newValues: Partial<ImageState>) => void;
  onImageReorder: () => void;
  onAiImageGeneration: (id: 'image1' | 'image2', style: ImageAiStyle | 'veo') => void;
  onDownload: () => void;
  onDownloadMp4: () => void;
  hasVideoBackground: boolean;
  onReset: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAiSuite: () => void;
  onRegenerateText: () => void;
  onGenerateComic: () => void;
  onGenerateComicV2: () => void;
  onUseComicStrip: (imageSlotId: 'image1' | 'image2') => void;
  onUseComicStripV2: (imageSlotId: 'image1' | 'image2') => void;
  isLoading: Record<string, boolean>;
  language: Language;
  theme: AppTheme;
  activeElementId: string | null;
  setActiveElementId: (id: string | null) => void;
}

type Tab = 'images' | 'text' | 'style' | 'comic' | 'actions' | 'template' | 'layers';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  designState, onStateChange, onImageUpload, onImagePaste, onImageDelete, onUseOriginal, onImageStateChange, onImageReorder, onAiImageGeneration, onDownload, onDownloadMp4, hasVideoBackground, onReset, onExport, onImport, onOpenAiSuite, onRegenerateText, onGenerateComic, onGenerateComicV2, onUseComicStrip, onUseComicStripV2, isLoading, language, theme, activeElementId, setActiveElementId
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('layers');
  
  // Auto-switch tab based on selection
  useEffect(() => {
    if (activeElementId) {
        if (activeElementId.startsWith('image')) {
            setActiveTab('images');
        } else if (['headline', 'hook', 'climax'].includes(activeElementId)) {
            setActiveTab('text');
        }
    }
  }, [activeElementId]);

  const handleTextElementChange = (id: TextElementId, newValues: any) => {
    const updatedTextElements = {
      ...designState.textElements,
      [id]: { ...designState.textElements[id], ...newValues },
    };
    onStateChange('textElements', updatedTextElements);
  };

  const handleComicStateChange = (newValues: Partial<DesignState['comicState']>) => {
    onStateChange('comicState', { ...designState.comicState, ...newValues });
  };
  
  const handleFileNameChange = (name: string) => {
    onStateChange('fileName', name);
  };

  // Helper to toggle visibility in Layers tab
  const toggleVisibility = (id: string) => {
    if (id.startsWith('image')) {
        const imgId = id as 'image1' | 'image2';
        const img = designState.images.find(i => i.id === imgId);
        if (img) onImageStateChange(imgId, { visible: !img.visible });
    } else {
        const textId = id as TextElementId;
        const txt = designState.textElements[textId];
        if (txt) handleTextElementChange(textId, { visible: !txt.visible });
    }
  };

  // Simplified list for Layers
  const layers = [
    ...designState.textElements.headline ? [{ id: 'headline', type: 'text', name: 'Headline' }] : [],
    ...designState.textElements.hook ? [{ id: 'hook', type: 'text', name: 'Hook' }] : [],
    ...designState.textElements.climax ? [{ id: 'climax', type: 'text', name: 'Climax' }] : [],
    ...designState.images.map(img => ({ id: img.id, type: 'image', name: img.id === 'image1' ? 'Image 1' : 'Image 2' }))
  ];

  const tabs: { id: Tab; label: string; labelId: string; icon: React.ReactNode }[] = [
    { id: 'layers', label: 'Layers', labelId: 'Lapisan', icon: <LayersIcon /> },
    { id: 'images', label: 'Images', labelId: 'Gambar', icon: <ImageIcon /> },
    { id: 'text', label: 'Text', labelId: 'Teks', icon: <TextIcon /> },
    { id: 'style', label: 'Style', labelId: 'Gaya', icon: <StyleIcon /> },
    { id: 'comic', label: 'AI Comic', labelId: 'Komik AI', icon: <ComicGenIcon /> },
    { id: 'actions', label: 'Actions', labelId: 'Tindakan', icon: <ActionsIcon /> },
    { id: 'template', label: 'Template', labelId: 'Template', icon: <TemplateIcon /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'layers':
        return (
            <div className={`${theme.classes.controlPanel.sectionBg} p-4 rounded-xl space-y-4`}>
                <h2 className={`text-lg font-bold uppercase tracking-wider ${theme.classes.controlPanel.sectionTitle} mb-2 pb-2 border-b ${theme.classes.headerBorder}`}>
                    {language === 'id' ? 'Manajemen Lapisan' : 'Layer Management'}
                </h2>
                <div className="space-y-2">
                    {layers.map((layer) => {
                         const isSelected = activeElementId === layer.id;
                         let isVisible = true;
                         let isLocked = false;
                         
                         if (layer.type === 'image') {
                             const img = designState.images.find(i => i.id === layer.id);
                             isVisible = img?.visible ?? true;
                         } else {
                             const txt = designState.textElements[layer.id as TextElementId];
                             isVisible = txt?.visible ?? true;
                             isLocked = txt?.locked ?? false;
                         }

                        return (
                            <div 
                                key={layer.id} 
                                onClick={() => setActiveElementId(layer.id)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${isSelected ? `${theme.classes.button.primary} border-transparent` : `bg-white/5 border-white/5 hover:bg-white/10`}`}
                            >
                                <div className="flex items-center gap-3">
                                    {layer.type === 'text' ? <TextIcon /> : <ImageIcon />}
                                    <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{layer.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                     {layer.type === 'text' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleTextElementChange(layer.id as TextElementId, { locked: !isLocked }); }}
                                            className={`p-1.5 rounded hover:bg-white/20 ${isLocked ? 'text-amber-400' : 'text-slate-500'}`}
                                        >
                                            {isLocked ? <LockClosedIcon /> : <LockOpenIcon />}
                                        </button>
                                     )}
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                                        className={`p-1.5 rounded hover:bg-white/20 ${isVisible ? 'text-white' : 'text-slate-500'}`}
                                     >
                                        {isVisible ? <EyeIcon /> : <EyeOffIcon />}
                                     </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center italic">
                    {language === 'id' ? 'Tips: Klik elemen di pratinjau untuk memilih.' : 'Tip: Click elements on preview to select.'}
                </p>
            </div>
        );
      case 'images':
        return (
          <div className="space-y-4">
            {designState.images.map((image, index) => {
              // Only show if selected or none selected
               if (activeElementId && activeElementId !== image.id && !activeElementId.startsWith('image')) return null;
               // If an image is selected, only show that one. If no image selected (but in image tab), show all.
               if (activeElementId && activeElementId.startsWith('image') && activeElementId !== image.id) return null;

              return (
                <ImageControl
                    key={image.id}
                    id={image.id}
                    label={`${language === 'id' ? 'Gambar' : 'Image'} ${index + 1}`}
                    state={image}
                    imageIndex={index}
                    onUpload={(file) => onImageUpload(image.id, file)}
                    onPaste={(event) => onImagePaste(image.id, event)}
                    onDelete={() => onImageDelete(image.id)}
                    onUseOriginal={() => onUseOriginal(image.id)}
                    onAiImageGeneration={(style) => onAiImageGeneration(image.id, style)}
                    onStateChange={(newValues) => onImageStateChange(image.id, newValues)}
                    onReorder={onImageReorder}
                    isLoading={isLoading[image.id]}
                    language={language}
                    theme={theme}
                />
              );
            })}
             {activeElementId && !activeElementId.startsWith('image') && (
                 <p className="text-center text-slate-500 py-4">{language === 'id' ? 'Pilih gambar untuk diedit.' : 'Select an image to edit.'}</p>
             )}
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            {Object.values(designState.textElements).map((element: TextElementState) => {
               // Only show if selected or none selected (and none selected is strictly text tab)
               if (activeElementId && activeElementId !== element.id) return null;
               
               return (
                <TextControl
                    key={element.id}
                    state={element}
                    onStateChange={(newValues) => handleTextElementChange(element.id, newValues)}
                    language={language}
                    theme={theme}
                />
               );
            })}
            {!activeElementId && (
                 <p className="text-center text-slate-500 py-4">{language === 'id' ? 'Pilih teks untuk diedit.' : 'Select text to edit.'}</p>
            )}
          </div>
        );
      case 'style':
        return (
          <div className="space-y-6">
            <GlobalStylesControl
              state={designState.globalStyles}
              onStateChange={(newValues) => onStateChange('globalStyles', { ...designState.globalStyles, ...newValues })}
              language={language}
              theme={theme}
            />
            <Section title={language === 'id' ? 'Kisi Penjajaran' : 'Alignment Grid'} theme={theme}>
              <Toggle
                label={language === 'id' ? 'Tampilkan Kisi' : 'Show Grid'}
                enabled={designState.grid.enabled}
                onChange={(enabled) => onStateChange('grid', { ...designState.grid, enabled })}
                theme={theme}
              />
              {designState.grid.enabled && (
                <div className="pl-6 space-y-4 mt-2">
                  <Slider
                    label={language === 'id' ? 'Ukuran Kisi' : 'Grid Size'}
                    min={10}
                    max={100}
                    step={1}
                    value={designState.grid.size}
                    onChange={(e) => onStateChange('grid', { ...designState.grid, size: Number(e.target.value) })}
                    theme={theme}
                  />
                  <ColorPicker
                    label={language === 'id' ? 'Warna Kisi' : 'Grid Color'}
                    color={designState.grid.color}
                    onChange={(e) => onStateChange('grid', { ...designState.grid, color: e.target.value })}
                    theme={theme}
                  />
                </div>
              )}
            </Section>
          </div>
        );
       case 'comic':
        return (
          <ComicControl
            comicState={designState.comicState}
            onGenerate={onGenerateComic}
            onGenerateV2={onGenerateComicV2}
            onUseComicStrip={onUseComicStrip}
            onUseComicStripV2={onUseComicStripV2}
            onStateChange={handleComicStateChange}
            isLoading={isLoading.comic}
            language={language}
            theme={theme}
          />
        );
      case 'actions':
        return (
          <Section title={language === 'id' ? 'Tindakan Studio' : 'Studio Actions'} theme={theme}>
            <Button onClick={onRegenerateText} isLoading={isLoading.regenerate} disabled={isLoading.regenerate || !designState.sourceUrl} fullWidth theme={theme}>
                <RegenerateIcon />
                {language === 'id' ? 'Regenerasi Teks' : 'Regenerate Text'}
            </Button>
            <Button onClick={onOpenAiSuite} fullWidth theme={theme}>
                <MagicIcon />
                AI Creative Suite
            </Button>
            <div>
              <label htmlFor={`fileName-${designState.fileName}`} className="block text-xs font-bold uppercase text-gray-500 mb-1 tracking-wider">
                {language === 'id' ? 'Nama File' : 'File Name'}
              </label>
              <div className="flex">
                <input
                  id={`fileName-${designState.fileName}`}
                  type="text"
                  value={designState.fileName}
                  onChange={(e) => handleFileNameChange(e.target.value)}
                  placeholder="ai-overlay"
                  className={`w-full ${theme.classes.input.bg} ${theme.classes.input.text} p-2 rounded-l-md border border-r-0 ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing} text-sm`}
                />
                <span className={`inline-flex items-center px-3 rounded-r-md border border-l-0 ${theme.classes.input.border} ${theme.classes.input.bg} text-gray-400 text-sm`}>
                  .png
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button onClick={onDownload} isLoading={isLoading.download} disabled={isLoading.download} className={theme.classes.button.success} fullWidth theme={theme}>
                    <DownloadIcon />
                    PNG
                </Button>
                <Button onClick={onDownloadMp4} isLoading={isLoading.downloadMp4} disabled={isLoading.downloadMp4 || !hasVideoBackground} className={theme.classes.button.primary} fullWidth theme={theme}>
                    <VideoIcon />
                    MP4
                </Button>
            </div>
          </Section>
        );
      case 'template':
        return (
          <TemplateControl 
            onExport={onExport}
            onImport={onImport}
            onReset={onReset}
            language={language}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full flex gap-0 h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl`}>
      {/* Left Vertical Icon Rail */}
      <nav className={`w-16 flex-shrink-0 flex flex-col items-center gap-4 py-6 border-r ${theme.classes.headerBorder} bg-white/5 backdrop-blur-md shadow-inner`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group relative ${
              activeTab === tab.id
                ? `${theme.classes.button.primary} text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110 z-10`
                : 'text-slate-400 hover:bg-white/10 hover:text-white hover:scale-105'
            }`}
            title={language === 'id' ? tab.labelId : tab.label}
          >
            {tab.icon}
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 border border-white/10">
                {language === 'id' ? tab.labelId : tab.label}
            </div>
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-4 bg-gradient-to-br from-white/5 to-transparent">
        <div className="max-w-full animate-in fade-in slide-in-from-right-4 duration-500">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string, children: React.ReactNode, theme: AppTheme }> = ({ title, children, theme }) => (
  <div className={`${theme.classes.controlPanel.sectionBg} p-5 rounded-xl space-y-4 border border-white/5 shadow-sm`}>
    <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.classes.controlPanel.sectionTitle} border-b border-white/5 pb-2`}>{title}</h2>
    <div className="space-y-5">
        {children}
    </div>
  </div>
);
