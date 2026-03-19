import React from 'react';
import type { DesignState, Language, ComicLayout, ComicStyle, ComicAspectRatio, AppTheme } from '../types';
import { Button } from './Button';
import { MagicIcon } from './Icons';
import { COMIC_LAYOUT_OPTIONS, COMIC_STYLE_OPTIONS, COMIC_ASPECT_RATIO_OPTIONS } from '../constants';

interface ComicControlProps {
  comicState: DesignState['comicState'];
  onGenerate: () => void;
  onGenerateV2: () => void;
  onUseComicStrip: (imageSlotId: 'image1' | 'image2') => void;
  onUseComicStripV2: (imageSlotId: 'image1' | 'image2') => void;
  onStateChange: (newValues: Partial<DesignState['comicState']>) => void;
  isLoading: boolean;
  language: Language;
  theme: AppTheme;
}

export const ComicControl: React.FC<ComicControlProps> = ({ comicState, onGenerate, onGenerateV2, onUseComicStrip, onUseComicStripV2, onStateChange, isLoading, language, theme }) => {
  return (
    <div className={`${theme.classes.controlPanel.sectionBg} p-4 rounded-lg space-y-4`}>
      <h2 className={`text-xl font-semibold border-b ${theme.classes.headerBorder} pb-2 mb-4 ${theme.classes.controlPanel.sectionTitle}`}>{language === 'id' ? 'Generator Komik AI' : 'AI Comic Generator'}</h2>
      
      <div className="flex bg-gray-700/50 rounded-lg p-1">
        <button
          onClick={() => onStateChange({ version: 'v1' })}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${comicState.version === 'v1' ? `${theme.classes.button.primary} text-white` : 'text-gray-300 hover:bg-gray-600/50'}`}
        >
          V1: 3-Panel Strip
        </button>
        <button
          onClick={() => onStateChange({ version: 'v2' })}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${comicState.version === 'v2' ? `${theme.classes.button.primary} text-white` : 'text-gray-300 hover:bg-gray-600/50'}`}
        >
          V2: Single Image
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {comicState.version === 'v1' && (
          <div>
            <label htmlFor="comic-layout" className="block text-sm font-medium text-gray-300 mb-1">{language === 'id' ? 'Tata Letak' : 'Layout'}</label>
            <select
                id="comic-layout"
                value={comicState.layout}
                onChange={(e) => onStateChange({ layout: e.target.value as ComicLayout })}
                className={`w-full bg-gray-900 ${theme.classes.input.text} p-2 rounded border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing}`}
            >
                {COMIC_LAYOUT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
          </div>
        )}
        <div className={comicState.version === 'v2' ? 'col-span-1' : ''}>
          <label htmlFor="comic-style" className="block text-sm font-medium text-gray-300 mb-1">{language === 'id' ? 'Gaya Seni' : 'Art Style'}</label>
          <select
              id="comic-style"
              value={comicState.style}
              onChange={(e) => onStateChange({ style: e.target.value as ComicStyle })}
              className={`w-full bg-gray-900 ${theme.classes.input.text} p-2 rounded border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing}`}
          >
              {COMIC_STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>
        <div className="col-span-full sm:col-span-1">
          <label htmlFor="comic-aspect-ratio" className="block text-sm font-medium text-gray-300 mb-1">{language === 'id' ? 'Rasio Aspek' : 'Aspect Ratio'}</label>
          <select
              id="comic-aspect-ratio"
              value={comicState.aspectRatio}
              onChange={(e) => onStateChange({ aspectRatio: e.target.value as ComicAspectRatio })}
              className={`w-full bg-gray-900 ${theme.classes.input.text} p-2 rounded border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing}`}
          >
              {COMIC_ASPECT_RATIO_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      
      {comicState.version === 'v2' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{language === 'id' ? 'Prompt Gambar AI' : 'AI Image Prompt'}</label>
          {comicState.imagePrompt ? (
            <textarea
                readOnly
                rows={5}
                value={comicState.imagePrompt}
                className={`w-full bg-gray-900 ${theme.classes.input.text} p-2 rounded border ${theme.classes.input.border} resize-none`}
            />
          ) : (
            <div className="text-center text-gray-400 p-3 bg-gray-900/50 rounded-md text-sm">
                {language === 'id' ? 'Prompt akan muncul di sini setelah teks dibuat.' : 'Prompt will appear here after generating text.'}
            </div>
          )}
        </div>
      )}

      {comicState.version === 'v1' ? (
        <Button onClick={onGenerate} isLoading={isLoading} disabled={isLoading || !comicState.script} fullWidth theme={theme}>
          <MagicIcon />
          {language === 'id' ? 'Buat Komik' : 'Generate Comic Strip'}
        </Button>
      ) : (
        <Button onClick={onGenerateV2} isLoading={isLoading} disabled={isLoading || !comicState.imagePrompt} fullWidth theme={theme}>
          <MagicIcon />
          {language === 'id' ? 'Buat Gambar Komik' : 'Generate Comic Image'}
        </Button>
      )}

      {comicState.version === 'v1' && comicState.generatedComic && (
        <div className="mt-4">
          <img src={comicState.generatedComic} alt="Generated Comic Strip" className={`rounded-md border-2 ${theme.classes.preview.border} w-full`} />
          <div className="flex gap-2 mt-2">
            <Button onClick={() => onUseComicStrip('image1')} fullWidth theme={theme}>{language === 'id' ? 'Gunakan di Gbr 1' : 'Use in Img 1'}</Button>
            <Button onClick={() => onUseComicStrip('image2')} fullWidth theme={theme}>{language === 'id' ? 'Gunakan di Gbr 2' : 'Use in Img 2'}</Button>
          </div>
        </div>
      )}

      {comicState.version === 'v2' && comicState.generatedComicV2 && (
        <div className="mt-4">
          <img src={comicState.generatedComicV2} alt="Generated Comic Image" className={`rounded-md border-2 ${theme.classes.preview.border} w-full`} />
          <div className="flex gap-2 mt-2">
            <Button onClick={() => onUseComicStripV2('image1')} fullWidth theme={theme}>{language === 'id' ? 'Gunakan di Gbr 1' : 'Use in Img 1'}</Button>
            <Button onClick={() => onUseComicStripV2('image2')} fullWidth theme={theme}>{language === 'id' ? 'Gunakan di Gbr 2' : 'Use in Img 2'}</Button>
          </div>
        </div>
      )}

      {comicState.version === 'v1' && (
        <div className={`space-y-4 pt-4 border-t ${theme.classes.headerBorder}`}>
          <h4 className="font-bold text-gray-300">{language === 'id' ? 'Skrip Referensi' : 'Reference Script'}</h4>
          {comicState.script ? (
            comicState.script.map((panel, index) => (
              <div key={index} className="bg-gray-900/50 p-3 rounded-lg text-sm">
                <p className={`font-semibold ${theme.classes.controlPanel.sectionTitle}`}>Panel {index + 1}</p>
                <p className="text-gray-400"><span className="font-medium text-gray-300">Scene:</span> {panel.description}</p>
                <p className="text-gray-400"><span className="font-medium text-gray-300">Dialogue:</span> "{panel.dialogue}"</p>
              </div>
            ))
          ) : (
             <div className="text-center text-gray-400 p-3 bg-gray-900/50 rounded-md text-sm">
                {language === 'id' ? 'Skrip akan muncul di sini setelah teks dibuat.' : 'Script will appear here after generating text.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
