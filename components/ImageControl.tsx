
import React, { useRef } from 'react';
import type { ImageState, Language, ImageAiStyle, AppTheme } from '../types';
import { Slider } from './Slider';
import { Button } from './Button';
import { UploadIcon, MagicIcon, UseDirectlyIcon, ComicIcon, CaricatureIcon, TrashIcon, RemoveBgIcon, BringToFrontIcon, SendToBackIcon, VideoIcon } from './Icons';
import { Toggle } from './Toggle';
import { ColorPicker } from './ColorPicker';

interface ImageControlProps {
  id: 'image1' | 'image2';
  label: string;
  state: ImageState;
  imageIndex: number;
  onUpload: (file: File) => void;
  onPaste: (event: React.ClipboardEvent) => void;
  onDelete: () => void;
  onUseOriginal: () => void;
  onAiImageGeneration: (style: ImageAiStyle | 'veo') => void;
  onStateChange: (newValues: Partial<ImageState>) => void;
  onReorder: () => void;
  isLoading: boolean;
  language: Language;
  theme: AppTheme;
}

export const ImageControl: React.FC<ImageControlProps> = ({ label, state, imageIndex, onUpload, onPaste, onDelete, onUseOriginal, onAiImageGeneration, onStateChange, onReorder, isLoading, language, theme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilterChange = (filterName: keyof ImageState['filters'], value: number) => {
    onStateChange({ filters: { ...state.filters, [filterName]: value } });
  };

  return (
    <div className={`${theme.classes.controlPanel.sectionBg} p-6 rounded-lg space-y-4`} onPaste={onPaste} tabIndex={-1}>
      <h3 className={`text-lg font-semibold ${theme.classes.controlPanel.sectionTitle}`}>{label}</h3>
      <div
        className={`border-2 border-dashed border-gray-500 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-400 transition-colors`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        aria-label={language === 'id' ? 'Unggah atau tempel media' : 'Upload or paste media'}
      >
        <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            ref={fileInputRef}
            onChange={(e) => e.target.files && onUpload(e.target.files[0])}
            className="hidden"
        />
        {state.src ? (
           state.mediaType === 'video' ? (
               <div className="max-h-24 mx-auto mb-2 relative flex items-center justify-center bg-black/50 rounded-md border border-gray-700 h-24 w-full">
                   <div className="flex flex-col items-center">
                        <VideoIcon />
                        <span className="text-xs mt-1 text-white">Video Loaded</span>
                   </div>
               </div>
           ) : (
                <img src={state.src} alt="Preview" className="max-h-24 mx-auto rounded-md mb-2 object-contain" />
           )
        ) : (
          <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
        )}
        <p className="text-sm text-gray-400">
          {state.src 
            ? (language === 'id' ? 'Klik untuk ganti, atau tempel media baru' : 'Click to replace, or paste new media') 
            : (language === 'id' ? 'Klik untuk unggah gambar/video' : 'Click to upload image/video')
          }
        </p>
      </div>

      {state.originalSrc && (
          <>
            <div className="flex gap-2">
              <Button onClick={onUseOriginal} fullWidth theme={theme}>
                  <UseDirectlyIcon />
                  {language === 'id' ? 'Gunakan Asli' : 'Use Original'}
              </Button>
              <Button
                onClick={onDelete}
                className={`${theme.classes.button.danger} !p-0 flex-shrink-0 w-11`}
                aria-label={language === 'id' ? 'Hapus' : 'Delete'}
                theme={theme}
              >
                <TrashIcon />
              </Button>
            </div>
            <div className={`pt-2 border-t ${theme.classes.headerBorder}/50`}>
              <p className="text-sm font-medium text-gray-400 mb-2 text-center">{language === 'id' ? 'Transformasi AI' : 'AI Transformations'}</p>
              <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => onAiImageGeneration('background')} isLoading={isLoading} disabled={isLoading} theme={theme}>
                      <RemoveBgIcon />
                      {language === 'id' ? 'Hapus Latar' : 'Remove BG'}
                  </Button>
                  <Button onClick={() => onAiImageGeneration('reimagine')} isLoading={isLoading} disabled={isLoading} theme={theme}>
                      <MagicIcon />
                      {language === 'id' ? 'Re-imajinasi' : 'Re-imagine'}
                  </Button>
                  <Button onClick={() => onAiImageGeneration('comic')} isLoading={isLoading} disabled={isLoading} theme={theme}>
                      <ComicIcon />
                      {language === 'id' ? 'Gaya Komik' : 'Comic'}
                  </Button>
                  <Button onClick={() => onAiImageGeneration('caricature')} isLoading={isLoading} disabled={isLoading} theme={theme}>
                      <CaricatureIcon />
                      {language === 'id' ? 'Karikatur' : 'Caricature'}
                  </Button>
                  <Button 
                    onClick={() => onAiImageGeneration('veo')} 
                    isLoading={isLoading} 
                    disabled={isLoading || state.mediaType === 'video'} 
                    theme={theme} 
                    className="col-span-2 bg-purple-600 hover:bg-purple-500 border-t border-white/10"
                  >
                      <VideoIcon />
                      {language === 'id' ? 'Animasi Veo (Gambar ke Video)' : 'Animate w/ Veo (Img to Video)'}
                  </Button>
              </div>
            </div>
            <div className={`pt-2 border-t ${theme.classes.headerBorder}/50`}>
                <p className="text-sm font-medium text-gray-400 mb-2 text-center">{language === 'id' ? 'Lapisan' : 'Layering'}</p>
                <div className="flex">
                    {imageIndex === 0 ? (
                        <Button onClick={onReorder} fullWidth disabled={!state.src} theme={theme}>
                            <BringToFrontIcon />
                            {language === 'id' ? 'Bawa ke Depan' : 'Bring to Front'}
                        </Button>
                    ) : (
                        <Button onClick={onReorder} fullWidth disabled={!state.src} theme={theme}>
                            <SendToBackIcon />
                            {language === 'id' ? 'Kirim ke Belakang' : 'Send to Back'}
                        </Button>
                    )}
                </div>
            </div>
             <div className={`pt-2 border-t ${theme.classes.headerBorder}/50`}>
                <p className="text-sm font-medium text-gray-400 mb-2 text-center">{language === 'id' ? 'Filter Gambar' : 'Image Filters'}</p>
                 <Slider label="Grayscale" min={0} max={100} value={state.filters.grayscale} onChange={(e) => handleFilterChange('grayscale', Number(e.target.value))} unit="%" theme={theme} />
                 <Slider label="Sepia" min={0} max={100} value={state.filters.sepia} onChange={(e) => handleFilterChange('sepia', Number(e.target.value))} unit="%" theme={theme} />
                 <Slider label="Brightness" min={0} max={200} value={state.filters.brightness} onChange={(e) => handleFilterChange('brightness', Number(e.target.value))} unit="%" theme={theme} />
                 <Slider label="Contrast" min={0} max={200} value={state.filters.contrast} onChange={(e) => handleFilterChange('contrast', Number(e.target.value))} unit="%" theme={theme} />
            </div>
            <div className={`pt-2 border-t ${theme.classes.headerBorder}/50`}>
                <Toggle
                    label="Chroma Key (Green Screen)"
                    enabled={state.chromaKey.enabled}
                    onChange={(enabled) => onStateChange({ chromaKey: { ...state.chromaKey, enabled } })}
                    theme={theme}
                />
                {state.chromaKey.enabled && (
                    <div className="pl-6 space-y-4 mt-2">
                        <ColorPicker
                            label={language === 'id' ? 'Warna Kunci' : 'Key Color'}
                            color={state.chromaKey.keyColor}
                            onChange={(e) => onStateChange({ chromaKey: { ...state.chromaKey, keyColor: e.target.value } })}
                            theme={theme}
                        />
                        <Slider
                            label={language === 'id' ? 'Toleransi' : 'Tolerance'}
                            min={0}
                            max={100}
                            value={state.chromaKey.tolerance}
                            onChange={(e) => onStateChange({ chromaKey: { ...state.chromaKey, tolerance: Number(e.target.value) } })}
                            theme={theme}
                        />
                    </div>
                )}
            </div>
          </>
      )}

      <Slider
        label={language === 'id' ? 'Ukuran' : 'Size'}
        min={10}
        max={150}
        value={state.size}
        onChange={(e) => onStateChange({ size: Number(e.target.value) })}
        unit="%"
        theme={theme}
      />
      <Slider
        label={language === 'id' ? 'Posisi X' : 'Position X'}
        min={-300}
        max={300}
        value={state.positionX}
        onChange={(e) => onStateChange({ positionX: Number(e.target.value) })}
        theme={theme}
      />
      <Slider
        label={language === 'id' ? 'Posisi Y' : 'Position Y'}
        min={-500}
        max={500}
        value={state.positionY}
        onChange={(e) => onStateChange({ positionY: Number(e.target.value) })}
        theme={theme}
      />
      <Slider
        label={language === 'id' ? 'Opasitas' : 'Opacity'}
        min={0}
        max={100}
        value={state.opacity}
        onChange={(e) => onStateChange({ opacity: Number(e.target.value) })}
        unit="%"
        theme={theme}
      />
    </div>
  );
};
