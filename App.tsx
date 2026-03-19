
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GenerationPanel } from './components/GenerationPanel';
import { ControlPanel } from './components/ControlPanel';
import { PreviewArea } from './components/PreviewArea';
import { AiSuiteModal } from './components/AiSuiteModal';
import { Button } from './components/Button';
import {
  generateTextFromUrl,
  generateComicAnalysisFromUrl,
  reimagineImage,
  generateVideoStrategy,
  generateComicStripImage,
  generateSingleComicImage,
  generateVeoVideo,
} from './services/geminiService';
import { DEFAULT_STATE, themes, LAYOUT_TEMPLATES, REFERENCE_WIDTH, REFERENCE_HEIGHT } from './constants';
import type { DesignState, ImageState, TextElementId, GeneratedContent, GeneratedContentV2, Language, ImageAiStyle, AiStrategy, ChromaKeyState, CopiedStyle, ComicPanel, TextElementState, GlobalStyles, LayoutTemplate } from './types';
import { CopyIcon, PasteIcon, UndoIcon, RedoIcon, CheckIcon } from './components/Icons';

declare var JSZip: any;
declare var html2canvas: any;

const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState({
    past: [] as T[],
    present: initialState,
    future: [] as T[],
  });

  const setState = useCallback((action: React.SetStateAction<T>) => {
    setHistory(currentHistory => {
      const newPresent = typeof action === 'function' 
        ? (action as (prevState: T) => T)(currentHistory.present) 
        : action;
      
      if (JSON.stringify(newPresent) === JSON.stringify(currentHistory.present)) {
        return currentHistory;
      }

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(currentHistory => {
      if (currentHistory.past.length === 0) return currentHistory;
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(currentHistory => {
      if (currentHistory.future.length === 0) return currentHistory;
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
};

const themeColorMap: Record<string, string> = {
    cyan: 'bg-gradient-to-br from-sky-400 to-cyan-500',
    synthwave: 'bg-gradient-to-br from-pink-500 to-purple-600',
    forest: 'bg-gradient-to-br from-emerald-500 to-green-600',
    crimson: 'bg-gradient-to-br from-red-600 to-rose-700',
    ocean: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    sunset: 'bg-gradient-to-br from-orange-500 to-red-600',
    monochrome: 'bg-slate-500',
    cyberpunk: 'bg-gradient-to-br from-lime-400 to-cyan-400',
    solar: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    arctic: 'bg-gradient-to-br from-sky-300 to-blue-400',
    royal: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    desert: 'bg-gradient-to-br from-orange-300 to-amber-400',
    sakura: 'bg-gradient-to-br from-pink-300 to-rose-300',
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    vampire: 'bg-gradient-to-br from-red-800 to-rose-900',
    coffee: 'bg-gradient-to-br from-amber-800 to-stone-800',
    retro: 'bg-gradient-to-br from-blue-600 to-indigo-700',
};

const ThemeSelector: React.FC<{ currentThemeKey: string; onThemeChange: (themeKey: string) => void; }> = ({ currentThemeKey, onThemeChange }) => {
  return (
    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/10">
      {Object.keys(themes).map(key => (
        <button
          key={key}
          onClick={() => onThemeChange(key)}
          className={`w-5 h-5 rounded-full ${themeColorMap[key]} transition-all duration-300 hover:scale-125 ${currentThemeKey === key ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
          aria-label={`Select ${themes[key].name} theme`}
          title={themes[key].name}
        />
      ))}
    </div>
  );
};

const getInitialLayoutTemplates = (): LayoutTemplate[] => {
  try {
    const savedTemplatesJSON = localStorage.getItem('customLayoutTemplates');
    if (savedTemplatesJSON) {
      const savedTemplates = JSON.parse(savedTemplatesJSON);
      // Ensure ID exists for legacy saved templates
      const customTemplates = savedTemplates.map((t: any) => ({ 
          ...t, 
          isCustom: true,
          id: t.id || `custom-${Math.random().toString(36).substr(2, 9)}` 
      }));
      return [...LAYOUT_TEMPLATES.map((t, i) => ({ ...t, id: t.id || `default-${i}` })), ...customTemplates];
    }
  } catch (e) {
    console.error("Failed to load custom templates from localStorage", e);
  }
  return LAYOUT_TEMPLATES.map((t, i) => ({ ...t, id: t.id || `default-${i}` }));
};

const App: React.FC = () => {
  const { state: designStates, setState: setDesignStates, undo, redo, canUndo, canRedo } = useHistory<DesignState[]>([JSON.parse(JSON.stringify(DEFAULT_STATE))]);
  const [url, setUrl] = useState<string>('');
  const [language, setLanguage] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    text: false,
    download: false,
    all: false,
  });
  const [modalOpenForIndex, setModalOpenForIndex] = useState<number | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<CopiedStyle | null>(null);
  const [themeKey, setThemeKey] = useState('cyan');
  
  // Media State
  const [videoBackground, setVideoBackground] = useState<File | null>(null);
  const [videoBlur, setVideoBlur] = useState<number>(0);
  const [audioBackground, setAudioBackground] = useState<File | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(50);

  const [layoutTemplates, setLayoutTemplates] = useState<LayoutTemplate[]>(getInitialLayoutTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(LAYOUT_TEMPLATES[0]?.id || 'default-0');
  const [activeOverlayIndex, setActiveOverlayIndex] = useState<number>(0);
  const [isGenPanelCollapsed, setIsGenPanelCollapsed] = useState(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  const theme = themes[themeKey];
  const activeDesignState = designStates[activeOverlayIndex];

  // Refs for capturing ALL previews for export
  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    try {
      const customTemplates = layoutTemplates.filter(t => t.isCustom);
      localStorage.setItem('customLayoutTemplates', JSON.stringify(customTemplates));
    } catch (e) {
      console.error("Failed to save custom templates to localStorage", e);
    }
  }, [layoutTemplates]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoBackground(file);
    }
  };

  const handleVideoRemove = () => {
    setVideoBackground(null);
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBackground(file);
    }
  };

  const handleAudioRemove = () => {
    setAudioBackground(null);
  };

  const handleThemeChange = (newThemeKey: string) => {
    setThemeKey(newThemeKey);
    const newPalette = themes[newThemeKey].palette;

    setDesignStates(currentStates => 
        currentStates.map(state => ({
            ...state,
            globalStyles: {
                ...state.globalStyles,
                textColor: newPalette.textColor,
                textStroke: {
                    ...state.globalStyles.textStroke,
                    color: newPalette.strokeColor,
                }
            },
            textElements: {
                ...state.textElements,
                headline: {
                    ...state.textElements.headline,
                    frame: {
                        ...state.textElements.headline.frame,
                        color: newPalette.frameColor1,
                    }
                },
                hook: {
                    ...state.textElements.hook,
                    frame: {
                        ...state.textElements.hook.frame,
                        color: newPalette.frameColor1,
                    }
                },
                climax: {
                    ...state.textElements.climax,
                    frame: {
                        ...state.textElements.climax.frame,
                        color: newPalette.frameColor2,
                    }
                }
            }
        }))
    );
  };

  const handleStateChange = useCallback((index: number, key: keyof DesignState, value: any) => {
    setDesignStates(prevStates => {
      const newStates = [...prevStates];
      const targetState = newStates[index];
      if (!targetState) return prevStates;
  
      if (key === 'globalStyles') {
        const newGlobalStyles = value as GlobalStyles;
        const oldBaseFontSize = targetState.globalStyles.baseFontSize;
        const newBaseFontSize = newGlobalStyles.baseFontSize;
  
        let updatedTextElements = targetState.textElements;
  
        if (oldBaseFontSize && oldBaseFontSize !== newBaseFontSize && oldBaseFontSize > 0) {
          const ratio = newBaseFontSize / oldBaseFontSize;
  
          const newTextElements = { ...targetState.textElements };
  
          (Object.keys(newTextElements) as TextElementId[]).forEach(textId => {
            const element = newTextElements[textId];
            if (!element.locked) {
              newTextElements[textId] = {
                ...element,
                fontSize: Math.max(8, Math.round(element.fontSize * ratio)),
              };
            }
          });
          updatedTextElements = newTextElements;
        }
  
        newStates[index] = {
          ...targetState,
          globalStyles: newGlobalStyles,
          textElements: updatedTextElements,
        };
      } else {
        newStates[index] = { ...targetState, [key]: value };
      }
      return newStates;
    });
  }, [setDesignStates]);

  const handleElementPositionUpdate = useCallback((id: string, x: number, y: number) => {
      setDesignStates(prevStates => {
          const newStates = [...prevStates];
          const targetState = newStates[activeOverlayIndex];
          if (!targetState) return prevStates;

          let newState = { ...targetState };
          
          if (id.startsWith('image')) {
              const imageId = id as 'image1' | 'image2';
              newState.images = targetState.images.map(img => 
                  img.id === imageId ? { ...img, positionX: Math.round(x), positionY: Math.round(y) } : img
              ) as [ImageState, ImageState];
          } else {
              const textId = id as TextElementId;
              if (newState.textElements[textId]) {
                  newState.textElements = {
                      ...newState.textElements,
                      [textId]: {
                          ...newState.textElements[textId],
                          positionX: Math.round(x),
                          positionY: Math.round(y),
                      }
                  };
              }
          }

          newStates[activeOverlayIndex] = newState;
          return newStates;
      });
  }, [activeOverlayIndex, setDesignStates]);

  const handleApplyLayoutTemplate = useCallback((template: LayoutTemplate) => {
    setDesignStates(currentStates => {
      const newStates = [...currentStates];
      const baseState = newStates[activeOverlayIndex]; // Apply to active
      if (!baseState) return currentStates;

      const newState = JSON.parse(JSON.stringify(baseState)) as DesignState;

      // Apply Global Styles if present
      if (template.config.globalStyles) {
          newState.globalStyles = { ...newState.globalStyles, ...template.config.globalStyles };
      }

      if (template.config.images) {
        // Apply generic settings to both images or specific strategy
        newState.images = newState.images.map(img => ({ ...img, ...template.config.images })) as [ImageState, ImageState];
      }

      if (template.config.textElements) {
        for (const key in template.config.textElements) {
          const id = key as TextElementId;
          if (newState.textElements[id] && template.config.textElements[id]) {
            newState.textElements[id] = { ...newState.textElements[id], ...template.config.textElements[id] };
          }
        }
      }
      
      newStates[activeOverlayIndex] = newState;
      return newStates;
    });
    setActiveTemplateId(template.id);
  }, [setDesignStates, activeOverlayIndex]);

  const handleSaveLayoutTemplate = (name: string) => {
    if (!name || !name.trim()) return;

    if (layoutTemplates.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
        alert('A template with this name already exists. Please use a unique name.');
        return;
    }

    const baseState = designStates[activeOverlayIndex];
    if (!baseState) return;

    const newTemplateConfig: LayoutTemplate['config'] = {
      globalStyles: {
          fontFamily: baseState.globalStyles.fontFamily,
          baseFontSize: baseState.globalStyles.baseFontSize,
      },
      images: {
        size: baseState.images[0].size,
        positionX: baseState.images[0].positionX,
        positionY: baseState.images[0].positionY,
        opacity: baseState.images[0].opacity,
      },
      textElements: (['headline', 'hook', 'climax'] as TextElementId[]).reduce((acc, id) => {
        const el = baseState.textElements[id];
        acc[id] = {
          fontSize: el.fontSize,
          width: el.width,
          positionX: el.positionX,
          positionY: el.positionY,
          opacity: el.opacity,
          frame: { ...el.frame },
        };
        return acc;
      }, {} as Record<TextElementId, Partial<TextElementState>>),
    };

    const newId = `custom-${Date.now()}`;
    const newTemplate: LayoutTemplate = {
      id: newId,
      name: name.trim(),
      config: newTemplateConfig,
      isCustom: true,
      createdAt: Date.now()
    };

    setLayoutTemplates(prevTemplates => {
        const newTemplates = [...prevTemplates, newTemplate];
        // Immediately save to local storage to ensure persistence
        const customTemplates = newTemplates.filter(t => t.isCustom);
        localStorage.setItem('customLayoutTemplates', JSON.stringify(customTemplates));
        return newTemplates;
    });
    setActiveTemplateId(newId);
  };
  
  const handleDeleteLayoutTemplate = (templateId: string) => {
    const template = layoutTemplates.find(t => t.id === templateId);
    if (!template) return;

    if (!window.confirm(`Are you sure you want to delete the "${template.name}" template?`)) {
        return;
    }

    setLayoutTemplates(prevTemplates => {
        const updatedTemplates = prevTemplates.filter(t => t.id !== templateId);
        if (activeTemplateId === templateId) {
            setActiveTemplateId(updatedTemplates[0]?.id || '');
        }
        return updatedTemplates;
    });
  };

  const handleGenerateText = async () => {
    const urls = url.split('\n').map(u => u.trim()).filter(u => u);
    if (urls.length === 0) {
        alert('Please enter at least one URL.');
        return;
    }
    setIsLoading(prev => ({ ...prev, text: true }));

    const template = designStates[0] || DEFAULT_STATE;
    const { layout, style, aspectRatio } = template.comicState;
    const errorMessages: string[] = [];

    try {
      const generationPromises = urls.map(async (u) => {
        try {
          // 1. Generate Text Content & Analysis
          const [v1Content, v2Content] = await Promise.all([
            generateTextFromUrl(u, language),
            generateComicAnalysisFromUrl(u, language)
          ]);

          if (!v1Content || !v2Content || !v2Content.imagePrompt) {
            console.error("Text generation failed for one or both versions for URL:", u);
            errorMessages.push(`URL: ${u.slice(0, 50)}...\n- Text generation failed.`);
            return null;
          }

          // 2. Automatically Start Video Strategy Generation (Metadata)
          // We fire this concurrently with image generation
          const strategyPromise = generateVideoStrategy(v1Content, language);

          // 3. Generate Images
          const [v1Result, v2Result, strategyResult] = await Promise.all([
              generateComicStripImage(v1Content.COMIC_SCRIPT, layout, style, language, aspectRatio),
              generateSingleComicImage(v2Content.imagePrompt, style, aspectRatio),
              strategyPromise
          ]);

          if (v1Result.error || v2Result.error) {
              const v1ErrStr = typeof v1Result.error === 'object' ? JSON.stringify(v1Result.error) : v1Result.error;
              const v2ErrStr = typeof v2Result.error === 'object' ? JSON.stringify(v2Result.error) : v2Result.error;
              const urlError = `URL: ${u.slice(0, 50)}...\n- Strip Comic (V1): ${v1ErrStr || 'Success'}\n- Single Image (V2): ${v2ErrStr || 'Success'}`;
              
              console.error("Image generation failed for URL:", u, JSON.stringify({ v1Result, v2Result }, null, 2));
              errorMessages.push(urlError);
              return null;
          }

          return {
            ...template,
            sourceUrl: u,
            fileName: v2Content.headline.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
            aiSuiteContent: { 
                strategy: strategyResult, // Populated automatically
            },
            comicState: {
              ...template.comicState,
              script: v1Content.COMIC_SCRIPT,
              generatedComic: v1Result.data,
              imagePrompt: v2Content.imagePrompt,
              generatedComicV2: v2Result.data,
            },
            textElements: {
              ...template.textElements,
              headline: { ...template.textElements.headline, text: v2Content.headline, locked: false },
              hook: { ...template.textElements.hook, text: v2Content.hook, locked: false },
              climax: { ...template.textElements.climax, text: v2Content.climax, locked: false },
            }
          };
        } catch (error) {
          console.error(`Error processing URL ${u}:`, error);
          errorMessages.push(`URL: ${u.slice(0, 50)}...\n- General Error: ${(error as Error).message}`);
          return null;
        }
      });

      const results = await Promise.all(generationPromises);
      const newDesignStates = results.filter((state): state is DesignState => state !== null);
      
      if (errorMessages.length > 0) {
        alert(`Generation complete. Some comics could not be created:\n\n${errorMessages.join('\n\n')}`);
      }

      if (newDesignStates.length > 0) {
        setDesignStates(newDesignStates);
        setCopiedStyle(null);
        setIsGenPanelCollapsed(true); // Auto collapse to show results
      } else if (errorMessages.length === 0) {
        alert(`Failed to generate content and comics for any of the provided URLs.`);
      }

    } catch (error) {
        console.error('Error during batch generation:', error);
        alert('An unexpected error occurred during generation. Please check the console for details.');
    } finally {
        setIsLoading(prev => ({ ...prev, text: false }));
    }
  };

  const handleRegenerateText = async (index: number) => {
    const sourceState = designStates[index];
    if (!sourceState || !sourceState.sourceUrl) {
      alert(language === 'id' ? 'URL sumber tidak ditemukan untuk overlay ini.' : 'Source URL not found for this overlay.');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, [`regenerate-${index}`]: true }));
    try {
      const [newV1Content, newV2Content] = await Promise.all([
          generateTextFromUrl(sourceState.sourceUrl, language),
          generateComicAnalysisFromUrl(sourceState.sourceUrl, language)
      ]);

      if (!newV1Content || !newV2Content || !newV2Content.imagePrompt) {
          alert("Failed to regenerate text content for one or both versions.");
          return;
      }

      const { layout, style, aspectRatio } = sourceState.comicState;
      // Also regenerate strategy automatically
      const strategyPromise = generateVideoStrategy(newV1Content, language);

      const [newV1Result, newV2Result, strategyResult] = await Promise.all([
          generateComicStripImage(newV1Content.COMIC_SCRIPT, layout, style, language, aspectRatio),
          generateSingleComicImage(newV2Content.imagePrompt, style, aspectRatio),
          strategyPromise
      ]);
      
      if (newV1Result.error || newV2Result.error) {
          let errorMessage = "Failed to regenerate comic images.\n";
          if (newV1Result.error) errorMessage += `\n- V1 Error: ${JSON.stringify(newV1Result.error)}`;
          if (newV2Result.error) errorMessage += `\n- V2 Error: ${JSON.stringify(newV2Result.error)}`;
          alert(errorMessage);
          return;
      }
      
      setDesignStates(prevStates => {
          const newStates = [...prevStates];
          const targetState = newStates[index];
          if (targetState) {
              newStates[index] = {
                  ...targetState,
                  fileName: newV2Content.headline.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
                  aiSuiteContent: { 
                    strategy: strategyResult, // Updated
                  },
                  comicState: {
                      ...targetState.comicState,
                      script: newV1Content.COMIC_SCRIPT,
                      generatedComic: newV1Result.data,
                      imagePrompt: newV2Content.imagePrompt,
                      generatedComicV2: newV2Result.data,
                  },
                  textElements: {
                      ...targetState.textElements,
                      headline: { ...targetState.textElements.headline, text: newV2Content.headline },
                      hook: { ...targetState.textElements.hook, text: newV2Content.hook },
                      climax: { ...targetState.textElements.climax, text: newV2Content.climax },
                  },
              };
          }
          return newStates;
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
      alert(language === 'id' ? 'Terjadi kesalahan saat regenerasi. Periksa konsol.' : 'An error occurred during regeneration. Check the console.');
    } finally {
      setIsLoading(prev => ({ ...prev, [`regenerate-${index}`]: false }));
    }
  };

  const updateImagesForIndex = useCallback((index: number, updater: (images: [ImageState, ImageState]) => [ImageState, ImageState]) => {
    setDesignStates(prevStates => {
      const newStates = [...prevStates];
      const targetState = newStates[index];
      if (targetState) {
        newStates[index] = { ...targetState, images: updater(targetState.images) };
      }
      return newStates;
    });
  }, [setDesignStates]);

  const applyChromaKey = (base64Src: string, options: ChromaKeyState): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
        };
        const keyRgb = hexToRgb(options.keyColor);
        if (!keyRgb) return resolve(base64Src);
        const { r: keyR, g: keyG, b: keyB } = keyRgb;
        const toleranceThreshold = (options.tolerance / 100) * (255 * 255 * 3);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const distanceSq = Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2);
          if (distanceSq < toleranceThreshold) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => reject('Failed to load image for chroma key');
      img.src = base64Src;
    });
  };
  
  const processImageState = async (state: ImageState): Promise<ImageState> => {
      const sourceForProcessing = state.aiModifiedSrc || state.originalSrc;
      // If it's a video, skip processing for now as we can't easily do client-side canvas manip on video without heavy lift
      if (state.mediaType === 'video') {
          return { ...state, src: sourceForProcessing };
      }

      if (state.chromaKey.enabled && sourceForProcessing) {
          try {
              const processedSrc = await applyChromaKey(sourceForProcessing, state.chromaKey);
              return { ...state, src: processedSrc };
          } catch (error) {
              console.error("Chroma key failed:", error);
              return { ...state, src: sourceForProcessing };
          }
      }
      return { ...state, src: sourceForProcessing };
  };

  const updateAndProcessImage = useCallback(async (index: number, id: 'image1' | 'image2', newValues: Partial<ImageState>) => {
      const currentImage = designStates[index]?.images.find(i => i.id === id);
      if (!currentImage) return;
      const mergedState = { ...currentImage, ...newValues };
      const finalState = await processImageState(mergedState);
      updateImagesForIndex(index, images => 
          images.map(img =>
            img.id === id ? finalState : img
          ) as [ImageState, ImageState]
        );
  }, [designStates, updateImagesForIndex]);

  const handleImageUpload = useCallback((index: number, id: 'image1' | 'image2', file: File) => {
    if (!file) return;
    
    // Determine media type
    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';

    if (isVideo) {
        const url = URL.createObjectURL(file);
        updateAndProcessImage(index, id, { 
            originalSrc: url, 
            mediaType: 'video',
            aiModifiedSrc: null, 
            chromaKey: { ...DEFAULT_STATE.images.find(i => i.id === id)?.chromaKey!, enabled: false }
        });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const defaultChromaKey = DEFAULT_STATE.images.find(i => i.id === id)?.chromaKey;
          updateAndProcessImage(index, id, { 
              originalSrc: base64, 
              mediaType: 'image',
              aiModifiedSrc: null, 
              chromaKey: { ...defaultChromaKey!, enabled: false }
          });
        };
        reader.readAsDataURL(file);
    }
  }, [updateAndProcessImage]);
  
  const handleImagePaste = useCallback((index: number, id: 'image1' | 'image2', event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageUpload(index, id, file);
          event.preventDefault();
        }
        break;
      }
    }
  }, [handleImageUpload]);

  const handleImageDelete = useCallback((index: number, id: 'image1' | 'image2') => {
    if (window.confirm('Are you sure you want to remove this media?')) {
        setDesignStates(prevStates => {
            const defaultImageState = DEFAULT_STATE.images.find(img => img.id === id);
            if (!defaultImageState) return prevStates;
            return prevStates.map((currentState, currentIndex) => {
                if (currentIndex !== index) return currentState;
                return {
                    ...currentState,
                    images: currentState.images.map(image => {
                        if (image.id !== id) return image;
                        return JSON.parse(JSON.stringify(defaultImageState));
                    }) as [ImageState, ImageState]
                };
            });
        });
    }
  }, [setDesignStates]);
  
  const handleUseOriginal = useCallback((index: number, id: 'image1' | 'image2') => {
    updateAndProcessImage(index, id, { aiModifiedSrc: null });
  }, [updateAndProcessImage]);

  const handleImageStateChange = useCallback((index: number, id: 'image1' | 'image2', newValues: Partial<ImageState>) => {
    updateAndProcessImage(index, id, newValues);
  }, [updateAndProcessImage]);

  const handleImageReorder = useCallback((index: number) => {
    updateImagesForIndex(index, images => [...images].reverse() as [ImageState, ImageState]);
  }, [updateImagesForIndex]);

  const handleAiImageGeneration = async (index: number, id: 'image1' | 'image2', style: ImageAiStyle | 'veo') => {
    const imageToReimagine = designStates[index]?.images.find(img => img.id === id);
    if (!imageToReimagine || !imageToReimagine.originalSrc) {
      alert('Please upload an image first.');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, [`image-${index}-${id}`]: true }));
    
    try {
      if (style === 'veo') {
          if (imageToReimagine.mediaType === 'video') {
              alert('Source is already a video.');
              return;
          }
          // Generate Video from Image
          const videoUrl = await generateVeoVideo(imageToReimagine.originalSrc);
          if (videoUrl) {
              await updateAndProcessImage(index, id, { 
                  originalSrc: videoUrl, 
                  mediaType: 'video', 
                  aiModifiedSrc: null // Reset modified src to force video display
              });
          } else {
              alert('Failed to generate video from Veo.');
          }
      } else {
        // Regular Image Transformations
        const newImage = await reimagineImage(imageToReimagine.originalSrc, style);
        if (newImage) {
            await updateAndProcessImage(index, id, { 
                aiModifiedSrc: newImage,
                mediaType: 'image'
            });
        }
      }
    } catch (error) {
      console.error('Error processing AI media generation:', error);
      alert('An error occurred during generation.');
    } finally {
      setIsLoading(prev => ({ ...prev, [`image-${index}-${id}`]: false }));
    }
  };

  const handleGenerateComic = async (index: number) => {
    const designState = designStates[index];
    const { script, layout, style, aspectRatio } = designState?.comicState || {};
    if (!script || !layout || !style || !aspectRatio) {
      alert('No comic script or settings available to generate comic.');
      return;
    }
    setIsLoading(prev => ({ ...prev, [`comic-${index}`]: true }));
    try {
      const result = await generateComicStripImage(script, layout, style, language, aspectRatio);
      if (result.error) {
        alert(`Failed to generate comic strip: ${result.error}`);
        return;
      }
      handleStateChange(index, 'comicState', {
        ...designState.comicState,
        generatedComic: result.data,
      });
    } catch (error) {
      console.error('Error generating comic strip:', error);
      alert('Failed to generate the comic strip.');
    } finally {
      setIsLoading(prev => ({ ...prev, [`comic-${index}`]: false }));
    }
  };

  const handleGenerateComicV2 = async (index: number) => {
    const designState = designStates[index];
    const { imagePrompt, style, aspectRatio } = designState?.comicState || {};
    if (!imagePrompt || !style || !aspectRatio) {
      alert('No comic image prompt or settings available to generate comic.');
      return;
    }
    setIsLoading(prev => ({ ...prev, [`comic-${index}`]: true }));
    try {
      const result = await generateSingleComicImage(imagePrompt, style, aspectRatio);
      if (result.error) {
        alert(`Failed to generate comic image: ${result.error}`);
        return;
      }
      handleStateChange(index, 'comicState', {
        ...designState.comicState,
        generatedComicV2: result.data,
      });
    } catch (error) {
      console.error('Error generating single comic image:', error);
      alert('Failed to generate the comic image.');
    } finally {
      setIsLoading(prev => ({ ...prev, [`comic-${index}`]: false }));
    }
  };

  const handleUseComicStrip = (designStateIndex: number, imageSlotId: 'image1' | 'image2') => {
    const comicSrc = designStates[designStateIndex]?.comicState?.generatedComic;
    if (!comicSrc) return;
    const defaultChromaKey = DEFAULT_STATE.images.find(i => i.id === imageSlotId)?.chromaKey;
    updateAndProcessImage(designStateIndex, imageSlotId, { 
        originalSrc: comicSrc, 
        mediaType: 'image',
        aiModifiedSrc: null, 
        chromaKey: { ...defaultChromaKey!, enabled: false }
    });
  };

  const handleUseComicStripV2 = (designStateIndex: number, imageSlotId: 'image1' | 'image2') => {
    const comicSrc = designStates[designStateIndex]?.comicState?.generatedComicV2;
    if (!comicSrc) return;
    const defaultChromaKey = DEFAULT_STATE.images.find(i => i.id === imageSlotId)?.chromaKey;
    updateAndProcessImage(designStateIndex, imageSlotId, { 
        originalSrc: comicSrc, 
        mediaType: 'image',
        aiModifiedSrc: null, 
        chromaKey: { ...defaultChromaKey!, enabled: false }
    });
  };

  // Helper to swap video elements with canvas elements for html2canvas capture
  // This ensures that any video (overlay or background if present) is captured as a static image for PNG export
  const prepareVideosForCapture = async (element: HTMLElement): Promise<() => void> => {
    const videos = Array.from(element.querySelectorAll('video'));
    const replacements: { video: HTMLVideoElement; canvas: HTMLCanvasElement; }[] = [];

    for (const video of videos) {
        // If video is ready, draw it to canvas
        // Even if readyState is low, try to capture something
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || video.clientWidth || 300;
        canvas.height = video.videoHeight || video.clientHeight || 150;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            try {
                if (video.readyState >= 2) {
                   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                } else {
                    // Try to force a seek to ensure a frame is available? 
                    // Or just draw a placeholder?
                    // For now, we assume video is playing or paused on a frame
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0,0,canvas.width, canvas.height);
                }
                
                // Copy styles
                canvas.style.cssText = video.style.cssText;
                canvas.className = video.className;
                
                // Replace in DOM
                video.parentNode?.insertBefore(canvas, video);
                video.style.display = 'none'; // Hide video
                replacements.push({ video, canvas });
            } catch (e) {
                console.warn("Could not draw video to canvas (likely CORS)", e);
            }
        }
    }

    // Return cleanup function
    return () => {
        replacements.forEach(({ video, canvas }) => {
            video.style.display = ''; // Restore video
            canvas.remove(); // Remove temporary canvas
        });
    };
  };

  const generatePngBlob = (index: number): Promise<Blob | null> => {
    return new Promise(async (resolve, reject) => {
        const previewEl = previewRefs.current[index];
        const designState = designStates[index];
        
        if (!previewEl) {
            console.error(`Preview element not found for index ${index}`);
            return resolve(null); // Fail gracefully
        }
        if (!designState) {
             return resolve(null);
        }
        
        try {
            // Wait a moment for images in the hidden div to likely be loaded/rendered by browser
            await new Promise(r => setTimeout(r, 100));

            // NEW: Wait for any videos to be ready (for overlay videos)
            if (previewEl) {
                 const videos = Array.from(previewEl.querySelectorAll('video'));
                 if (videos.length > 0) {
                    await Promise.all(videos.map((v: HTMLVideoElement) => {
                        if (v.readyState >= 2) return Promise.resolve();
                        return new Promise<void>(resolve => {
                            v.oncanplay = () => resolve();
                            v.onerror = () => resolve();
                            setTimeout(resolve, 2000); // 2s timeout
                        });
                    }));
                 }
            }

            // Prepare videos for capture by swapping with canvas
            // IMPORTANT: If forceTransparent is active (for MP4 layering), we ensure background is transparent
            const restoreVideos = await prepareVideosForCapture(previewEl);

            // Use html2canvas for WYSIWYG accuracy
            // forceScale=1 logic is handled inside PreviewArea via prop, but we still set scale here to be safe
            const canvas = await html2canvas(previewEl.firstChild as HTMLElement, {
                scale: 1, 
                useCORS: true, // Enable cross-origin image loading
                allowTaint: true,
                backgroundColor: null, // Transparent background
                logging: false,
                width: REFERENCE_WIDTH,
                height: REFERENCE_HEIGHT,
                scrollX: 0,
                scrollY: 0
            });

            // Restore video elements
            restoreVideos();

            canvas.toBlob((blob: Blob | null) => {
                if (blob) resolve(blob);
                else {
                    console.error("Canvas toBlob returned null");
                    resolve(null);
                }
            }, 'image/png');
        } catch (error) {
            console.error("html2canvas error:", error);
            resolve(null); // Resolve null rather than reject to keep zip process going
        }
    });
  };
  
  const generateMp4Blob = (index: number, blurAmount: number): Promise<{ blob: Blob | null, extension: 'mp4' | 'webm' }> => {
    return new Promise(async (resolve, reject) => {
        // Optimization: Stream audio instead of decoding full file to reduce startup delay
        
        if (!videoBackground) return resolve({ blob: null, extension: 'mp4' });
        
        // Clean up any previous temp audio elements if needed
        let bgAudioElement: HTMLAudioElement | null = null;
        let bgAudioUrl: string | null = null;
        
        try {
            // 1. Generate the overlay as a PNG
            const pngBlob = await generatePngBlob(index);
            if (!pngBlob) throw new Error("Could not generate overlay PNG.");
            const overlayImage = await createImageBitmap(pngBlob);
            
            // 2. Setup the background video element
            const videoElement = document.createElement('video');
            videoElement.muted = true; // Mute video so we can control audio via Web Audio API
            videoElement.crossOrigin = 'anonymous';
            videoElement.playsInline = true;
            const videoUrl = URL.createObjectURL(videoBackground);
            videoElement.src = videoUrl;
            
            // 3. Prepare Audio Mixing (Web Audio API)
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const dest = audioCtx.createMediaStreamDestination();
            
            // OPTIMIZATION: Use streaming audio source instead of full decode
            let sourceNode: MediaElementAudioSourceNode | null = null;
            
            if (audioBackground) {
                bgAudioElement = new Audio();
                bgAudioUrl = URL.createObjectURL(audioBackground);
                bgAudioElement.src = bgAudioUrl;
                bgAudioElement.crossOrigin = "anonymous";
                
                // Create source from the element
                sourceNode = audioCtx.createMediaElementSource(bgAudioElement);
                const gain = audioCtx.createGain();
                gain.gain.value = audioVolume / 100;
                sourceNode.connect(gain);
                gain.connect(dest);
            }

            // 4. Prepare canvas and recording
            const OUTPUT_WIDTH = 1080;
            const OUTPUT_HEIGHT = 1920;
            const canvas = document.createElement('canvas');
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context.");
            
            // Helper to draw video frame while maintaining aspect ratio (cover)
            const drawVideoCover = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => {
                const videoRatio = video.videoWidth / video.videoHeight;
                const canvasRatio = ctx.canvas.width / ctx.canvas.height;
                let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;
                if (videoRatio > canvasRatio) {
                    sHeight = video.videoHeight;
                    sWidth = sHeight * canvasRatio;
                    sx = (video.videoWidth - sWidth) / 2;
                } else {
                    sWidth = video.videoWidth;
                    sHeight = sWidth / canvasRatio;
                    sy = (video.videoHeight - sHeight) / 2;
                }
                ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
            };

            // Wait for video metadata
            await new Promise((res, rej) => {
                videoElement.onloadedmetadata = res;
                videoElement.onerror = rej;
            });

            // 5. Combine Tracks
            // Use 30FPS fixed to ensure smooth playback even if rendering is slow
            const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
            const audioTracks = dest.stream.getAudioTracks();
            const combinedStream = new MediaStream([videoTrack, ...audioTracks]);

            const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs=avc1.42E01E') ? 'video/mp4; codecs=avc1.42E01E' : 'video/webm';
            const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 5000000 }); // 5Mbps target
            const chunks: Blob[] = [];
            
            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            recorder.onstop = () => {
                const finalMimeType = mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
                const blob = new Blob(chunks, { type: finalMimeType });
                
                // Cleanup
                URL.revokeObjectURL(videoUrl);
                if (bgAudioUrl) URL.revokeObjectURL(bgAudioUrl);
                audioCtx.close(); 
                
                resolve({ blob, extension: finalMimeType === 'video/mp4' ? 'mp4' : 'webm'});
            };
            
            recorder.onerror = (e) => { 
                URL.revokeObjectURL(videoUrl); 
                if (bgAudioUrl) URL.revokeObjectURL(bgAudioUrl);
                audioCtx.close();
                reject(e); 
            };

            // Rendering Loop
            let animationFrameId: number;
            
            const renderFrame = () => {
                if (videoElement.paused || videoElement.ended) {
                     if (recorder.state === 'recording') {
                         recorder.stop();
                         if (bgAudioElement) bgAudioElement.pause();
                     }
                     return;
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // LAYER 1: Draw Video Background
                if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;
                drawVideoCover(ctx, videoElement);
                if (blurAmount > 0) ctx.filter = 'none';
                
                // LAYER 2: Draw Overlay PNG
                ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
                
                if ('requestVideoFrameCallback' in videoElement) {
                    videoElement.requestVideoFrameCallback(renderFrame);
                } else {
                    animationFrameId = requestAnimationFrame(renderFrame);
                }
            };

            // Start Process
            recorder.start();
            await videoElement.play();
            if (bgAudioElement) {
                bgAudioElement.currentTime = 0;
                bgAudioElement.play().catch(console.warn);
            }

            if ('requestVideoFrameCallback' in videoElement) {
                videoElement.requestVideoFrameCallback(renderFrame);
            } else {
                renderFrame();
            }
            
            videoElement.onended = () => {
                if (recorder.state === 'recording') recorder.stop();
                if (bgAudioElement) bgAudioElement.pause();
                cancelAnimationFrame(animationFrameId);
            };

        } catch (error) {
             reject(error); 
        }
    });
  };

  const handleDownload = async (index: number) => {
    setIsLoading(prev => ({ ...prev, [`download-${index}`]: true }));
    try {
        const blob = await generatePngBlob(index);
        if (blob) {
            const designState = designStates[index];
            const sanitizedFileName = designState.fileName.replace(/[^a-z0-9_-]/gi, '_').replace(/_{2,}/g, '_');
            const finalFileName = sanitizedFileName || 'ai-overlay';
            const link = document.createElement('a');
            link.download = `${finalFileName}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        } else {
            alert("Failed to generate image. Please try again.");
        }
    } catch (error) {
        console.error('Error during single download:', error);
        alert('Error generating image for download.');
    } finally {
        setIsLoading(prev => ({ ...prev, [`download-${index}`]: false }));
    }
  };

  const handleDownloadMp4 = async (index: number) => {
    if (!videoBackground) {
        alert('Please upload a video background first.');
        return;
    }
    setIsLoading(prev => ({ ...prev, [`download-mp4-${index}`]: true }));
    try {
        const { blob, extension } = await generateMp4Blob(index, videoBlur);
        if (blob) {
            const designState = designStates[index];
            const sanitizedFileName = designState.fileName.replace(/[^a-z0-9_-]/gi, '_').replace(/_{2,}/g, '_');
            const finalFileName = sanitizedFileName || 'ai-overlay';
            const link = document.createElement('a');
            link.download = `${finalFileName}.${extension}`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        }
    } catch (error) {
        console.error('Error during MP4 download:', error);
        alert('Error generating video for download. Check console for details.');
    } finally {
        setIsLoading(prev => ({ ...prev, [`download-mp4-${index}`]: false }));
    }
  };

  const handleDownloadAll = async () => {
    setIsLoading(prev => ({ ...prev, all: true }));
    try {
      const zip = new JSZip();
      let hasFiles = false;

      // Iterate sequentially to avoid memory and concurrency issues
      for (let index = 0; index < designStates.length; index++) {
        const ds = designStates[index];
        const sanitizedFileName = ds.fileName.replace(/[^a-z0-9_-]/gi, '_').replace(/_{2,}/g, '_') || `overlay-${index + 1}`;
        
        // Ensure the hidden preview has been rendered and ref attached before processing
        if (!previewRefs.current[index]) {
            console.warn(`Preview ref for index ${index} not found. Skipping.`);
            continue;
        }

        // Yield to UI thread to allow rendering updates
        await new Promise(resolve => setTimeout(resolve, 150));

        // Generate PNG (Layer 2: Overlays)
        const pngBlob = await generatePngBlob(index);
        if (pngBlob) {
            zip.file(`${sanitizedFileName}.png`, pngBlob);
            hasFiles = true;
        }
        
        // Generate MP4 if needed (Composite: Layer 1 Video + Layer 2 PNG)
        if (videoBackground) {
            const { blob: mp4Blob, extension } = await generateMp4Blob(index, videoBlur);
            if (mp4Blob) {
                zip.file(`${sanitizedFileName}.${extension}`, mp4Blob);
                hasFiles = true;
            }
        }
        
        // Add Strategy info (Video Metadata)
        const { strategy } = ds.aiSuiteContent;
        if (strategy) {
          let content = `AI CREATIVE STUDIO METADATA\n===========================\n\nFile: ${sanitizedFileName}\n`;
          if (ds.sourceUrl) content += `Source URL: ${ds.sourceUrl}\n`;
          
          content += `\n--- VIDEO METADATA ---\n`;
          content += `\n[Optimized Title]\n${strategy.optimizedTitle}\n`;
          content += `\n[Optimized Description]\n${strategy.optimizedDescription}\n`;
          content += `\n[Optimized Hashtags]\n${strategy.optimizedHashtags.join(' ')}\n`;

          zip.file(`${sanitizedFileName}-metadata.txt`, content);
          hasFiles = true;
        }
      }
      
      if (hasFiles) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = 'ai-overlay-studio-export.zip';
        link.href = URL.createObjectURL(zipBlob);
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        alert('No files were generated to download.');
      }

    } catch (error) {
      console.error("Error generating ZIP file:", error);
      alert('Failed to generate ZIP file. See console for details.');
    } finally {
      setIsLoading(prev => ({ ...prev, all: false }));
    }
  };

  // Copy/Paste/Strategy/Music/Reset/Export/Import/SaveProject/LoadProject
  // Preserving logic, just condensing for the output
  const handleCopyStyle = (index: number) => {
    const sourceState = designStates[index];
    const styleToCopy: CopiedStyle = {
      images: JSON.parse(JSON.stringify(sourceState.images)),
      globalStyles: JSON.parse(JSON.stringify(sourceState.globalStyles)),
      grid: JSON.parse(JSON.stringify(sourceState.grid)),
      textElements: {
        headline: { fontSize: sourceState.textElements.headline.fontSize, width: sourceState.textElements.headline.width, positionX: sourceState.textElements.headline.positionX, positionY: sourceState.textElements.headline.positionY, opacity: sourceState.textElements.headline.opacity, frame: sourceState.textElements.headline.frame },
        hook: { fontSize: sourceState.textElements.hook.fontSize, width: sourceState.textElements.hook.width, positionX: sourceState.textElements.hook.positionX, positionY: sourceState.textElements.hook.positionY, opacity: sourceState.textElements.hook.opacity, frame: sourceState.textElements.hook.frame },
        climax: { fontSize: sourceState.textElements.climax.fontSize, width: sourceState.textElements.climax.width, positionX: sourceState.textElements.climax.positionX, positionY: sourceState.textElements.climax.positionY, opacity: sourceState.textElements.climax.opacity, frame: sourceState.textElements.climax.frame },
      }
    };
    setCopiedStyle(styleToCopy);
  };
  
  const handlePasteStyle = (index: number) => {
    if (!copiedStyle) return;
    setDesignStates(prevStates => {
      const newStates = [...prevStates];
      const targetState = newStates[index];
      if (targetState) {
          const newCopiedStyle = JSON.parse(JSON.stringify(copiedStyle));
          newStates[index] = {
              ...targetState,
              images: newCopiedStyle.images,
              globalStyles: newCopiedStyle.globalStyles,
              grid: newCopiedStyle.grid,
              textElements: {
                  ...targetState.textElements,
                  headline: { ...targetState.textElements.headline, ...newCopiedStyle.textElements.headline },
                  hook: { ...targetState.textElements.hook, ...newCopiedStyle.textElements.hook },
                  climax: { ...targetState.textElements.climax, ...newCopiedStyle.textElements.climax },
              },
          };
      }
      return newStates;
    });
  };

  const handleGenerateStrategy = async (index: number) => {
      const designState = designStates[index];
      const content: GeneratedContent = {
          HEADLINE: designState.textElements.headline.text,
          HOOK: designState.textElements.hook.text,
          CLIMAX: designState.textElements.climax.text,
          COMIC_SCRIPT: designState.comicState.script || [{ description: '', dialogue: '' }, { description: '', dialogue: '' }, { description: '', dialogue: '' }],
      };
      setIsLoading(prev => ({ ...prev, [`strategy-${index}`]: true }));
      try {
          const strategy = await generateVideoStrategy(content, language);
          handleStateChange(index, 'aiSuiteContent', { ...designState.aiSuiteContent, strategy });
      } catch (error) {
          console.error("Error generating strategy:", error);
      } finally {
          setIsLoading(prev => ({ ...prev, [`strategy-${index}`]: false }));
      }
  };

  const handleReset = (index: number) => {
    setDesignStates(prev => {
      const newStates = [...prev];
      newStates[index] = JSON.parse(JSON.stringify(DEFAULT_STATE));
      return newStates;
    });
  };
  
  const handleExport = (index: number) => {
    const dataStr = JSON.stringify(designStates[index], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'overlay-template.json');
    linkElement.click();
  };
  
  const handleImport = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.images && imported.textElements && imported.globalStyles) {
            setDesignStates(prev => {
              const newStates = [...prev];
              const targetState = newStates[index];
              if (!targetState) return prev;
              const newState = JSON.parse(JSON.stringify(targetState));
              newState.globalStyles = { ...targetState.globalStyles, ...(imported.globalStyles || {}) };
              newState.grid = { ...targetState.grid, ...(imported.grid || {}) };
              newState.images = targetState.images.map((targetImg, i) => {
                const importedImg = imported.images[i];
                if (!importedImg) return targetImg;
                const safeFilters = { ...targetImg.filters, ...(importedImg.filters || {}) };
                const safeChromaKey = { ...targetImg.chromaKey, ...(importedImg.chromaKey || {}) };
                return {
                  ...targetImg,
                  size: importedImg.size ?? targetImg.size,
                  positionX: importedImg.positionX ?? targetImg.positionX,
                  positionY: importedImg.positionY ?? targetImg.positionY,
                  opacity: importedImg.opacity ?? targetImg.opacity,
                  filters: safeFilters,
                  chromaKey: safeChromaKey,
                  visible: importedImg.visible ?? true,
                  // Default to image if mediaType not present in old imports
                  mediaType: importedImg.mediaType || 'image', 
                };
              }) as [ImageState, ImageState];
              for (const key of Object.keys(targetState.textElements)) {
                  const id = key as TextElementId;
                  const importedTextElem = imported.textElements[id];
                  if (importedTextElem) {
                      const targetTextElem = newState.textElements[id];
                      const safeFrame = { ...targetTextElem.frame, ...(importedTextElem.frame || {})};
                      newState.textElements[id] = {
                          ...targetTextElem,
                          fontSize: importedTextElem.fontSize ?? targetTextElem.fontSize,
                          width: importedTextElem.width ?? targetTextElem.width,
                          positionX: importedTextElem.positionX ?? targetTextElem.positionX,
                          positionY: importedTextElem.positionY ?? targetTextElem.positionY,
                          opacity: importedTextElem.opacity ?? targetTextElem.opacity,
                          frame: safeFrame,
                          visible: importedTextElem.visible ?? true,
                      };
                  }
              }
              newStates[index] = newState;
              return newStates;
            });
          }
        } catch (error) { console.error('Failed to import:', error); alert('Failed to import template.'); }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleSaveProject = () => {
    try {
      const dataStr = JSON.stringify(designStates, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = 'berita-tempel-studio-project.json';
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(url);
    } catch (error) { console.error('Failed to save:', error); alert('Failed to save project.'); }
  };

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedState = JSON.parse(e.target?.result as string);
          if (Array.isArray(loadedState)) {
            setDesignStates(loadedState.length > 0 ? loadedState : [JSON.parse(JSON.stringify(DEFAULT_STATE))]);
            setActiveOverlayIndex(0);
          } else throw new Error('Invalid structure');
        } catch (error) { console.error('Failed to load:', error); alert('Failed to load project.'); }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className={`${theme.classes.bg} ${theme.classes.textWhite} h-screen font-['Inter',_sans-serif] overflow-hidden flex flex-col relative`}>
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Professional Header - Slim & Glassy */}
      <header className={`h-14 flex-shrink-0 px-6 flex items-center justify-between ${theme.classes.header} border-b ${theme.classes.headerBorder} z-50 shadow-lg`}>
        <div className="flex items-center gap-4">
          <h1 className={`text-lg font-bold ${theme.classes.headerTitle} tracking-tight drop-shadow-sm`}>Berita Tempel Studio</h1>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2">
              <ThemeSelector currentThemeKey={themeKey} onThemeChange={handleThemeChange} />
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-white/5 backdrop-blur-md rounded-lg p-0.5 border border-white/10 shadow-inner">
                <button onClick={undo} disabled={!canUndo} className={`p-2 rounded-md transition-all ${!canUndo ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'}`} aria-label="Undo"><UndoIcon /></button>
                <button onClick={redo} disabled={!canRedo} className={`p-2 rounded-md transition-all ${!canRedo ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'}`} aria-label="Redo"><RedoIcon /></button>
            </div>
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <div className="flex items-center gap-2">
                <Button onClick={() => handleCopyStyle(activeOverlayIndex)} aria-label="Copy Style" theme={theme} className="!py-1.5 !px-2 bg-white/5 backdrop-blur-md hover:bg-white/10 text-sm border border-white/10"><CopyIcon /></Button>
                <Button onClick={() => handlePasteStyle(activeOverlayIndex)} disabled={!copiedStyle} aria-label="Paste Style" theme={theme} className="!py-1.5 !px-2 bg-white/5 backdrop-blur-md hover:bg-white/10 text-sm disabled:opacity-20 border border-white/10"><PasteIcon /></Button>
                {copiedStyle && <span className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse"><CheckIcon /> <span className="hidden sm:inline">Style Copied</span></span>}
            </div>
        </div>
      </header>

      {/* Main Editor Workspace - Two Column Layout */}
      <main className="flex-grow flex overflow-hidden relative z-10">
        {/* LEFT COLUMN: Tools & Controls (Scrollable) */}
        <div className={`w-full md:w-[420px] flex-shrink-0 border-r ${theme.classes.headerBorder} flex flex-col bg-white/5 backdrop-blur-xl relative z-20 shadow-2xl`}>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                <GenerationPanel
                    url={url}
                    onUrlChange={setUrl}
                    language={language}
                    onLanguageChange={setLanguage}
                    onGenerateText={handleGenerateText}
                    isLoading={isLoading.text}
                    onDownloadAll={handleDownloadAll}
                    isDownloadingAll={isLoading.all}
                    hasResults={designStates.length > 1 || (designStates.length === 1 && designStates[0].sourceUrl !== '')}
                    onSaveProject={handleSaveProject}
                    onLoadProject={handleLoadProject}
                    videoBackground={videoBackground}
                    onVideoUpload={handleVideoUpload}
                    onVideoRemove={handleVideoRemove}
                    videoBlur={videoBlur}
                    onVideoBlurChange={setVideoBlur}
                    audioBackground={audioBackground}
                    onAudioUpload={handleAudioUpload}
                    onAudioRemove={handleAudioRemove}
                    audioVolume={audioVolume}
                    onAudioVolumeChange={setAudioVolume}
                    layoutTemplates={layoutTemplates}
                    onApplyLayoutTemplate={handleApplyLayoutTemplate}
                    activeTemplateName={activeTemplateId}
                    onSaveLayoutTemplate={handleSaveLayoutTemplate}
                    onDeleteLayoutTemplate={handleDeleteLayoutTemplate}
                    theme={theme}
                    isCollapsed={isGenPanelCollapsed}
                    toggleCollapse={() => setIsGenPanelCollapsed(!isGenPanelCollapsed)}
                />
                
                <div className="p-4 space-y-4">
                    {designStates.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {designStates.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveOverlayIndex(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border backdrop-blur-md ${
                                        activeOverlayIndex === idx 
                                        ? 'bg-white text-slate-900 border-white shadow-lg scale-105' 
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    Overlay {idx + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    <ControlPanel
                        designState={activeDesignState}
                        onStateChange={(key, value) => handleStateChange(activeOverlayIndex, key, value)}
                        onImageUpload={(id, file) => handleImageUpload(activeOverlayIndex, id, file)}
                        onImagePaste={(id, event) => handleImagePaste(activeOverlayIndex, id, event)}
                        onImageDelete={(id) => handleImageDelete(activeOverlayIndex, id)}
                        onUseOriginal={(id) => handleUseOriginal(activeOverlayIndex, id)}
                        onImageStateChange={(id, values) => handleImageStateChange(activeOverlayIndex, id, values)}
                        onImageReorder={() => handleImageReorder(activeOverlayIndex)}
                        onAiImageGeneration={(id, style) => handleAiImageGeneration(activeOverlayIndex, id, style)}
                        onDownload={() => handleDownload(activeOverlayIndex)}
                        onDownloadMp4={() => handleDownloadMp4(activeOverlayIndex)}
                        hasVideoBackground={!!videoBackground}
                        onReset={() => handleReset(activeOverlayIndex)}
                        onExport={() => handleExport(activeOverlayIndex)}
                        onImport={(e) => handleImport(activeOverlayIndex, e)}
                        onOpenAiSuite={() => setModalOpenForIndex(activeOverlayIndex)}
                        onRegenerateText={() => handleRegenerateText(activeOverlayIndex)}
                        onGenerateComic={() => handleGenerateComic(activeOverlayIndex)}
                        onGenerateComicV2={() => handleGenerateComicV2(activeOverlayIndex)}
                        onUseComicStrip={(id) => handleUseComicStrip(activeOverlayIndex, id)}
                        onUseComicStripV2={(id) => handleUseComicStripV2(activeOverlayIndex, id)}
                        isLoading={{
                        ...isLoading,
                        comic: isLoading[`comic-${activeOverlayIndex}`],
                        download: isLoading[`download-${activeOverlayIndex}`],
                        downloadMp4: isLoading[`download-mp4-${activeOverlayIndex}`],
                        regenerate: isLoading[`regenerate-${activeOverlayIndex}`],
                        image1: isLoading[`image-${activeOverlayIndex}-image1`],
                        image2: isLoading[`image-${activeOverlayIndex}-image2`],
                        }}
                        language={language}
                        theme={theme}
                        activeElementId={activeElementId}
                        setActiveElementId={setActiveElementId}
                    />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Canvas Stage */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden shadow-inner">
            {/* Checkerboard background for transparency visualization */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                    backgroundImage: `linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }} 
            />
            
            <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">
                <div className="w-full max-w-[400px] xl:max-w-[480px] transition-all duration-500 ease-out">
                    {/* Visible Preview Area (User Interaction) - Responsive scale */}
                    <PreviewArea
                        designState={activeDesignState}
                        videoBackground={videoBackground}
                        videoBlur={videoBlur}
                        audioBackground={audioBackground}
                        audioVolume={audioVolume}
                        theme={theme}
                        activeElementId={activeElementId}
                        onSelectElement={setActiveElementId}
                        onUpdateElementPosition={handleElementPositionUpdate}
                    />
                </div>
            </div>
        </div>
      </main>
      
      {/* Hidden Container for Exporting All Slides */}
      {/* Fixed scale for html2canvas consistency */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'visible', pointerEvents: 'none' }}>
          {designStates.map((ds, idx) => (
              <div key={`hidden-preview-${idx}`} style={{ width: `${REFERENCE_WIDTH}px`, height: `${REFERENCE_HEIGHT}px` }}>
                  <div ref={(el) => { previewRefs.current[idx] = el; }} style={{ width: '100%', height: '100%' }}>
                    <PreviewArea
                        designState={ds}
                        videoBackground={videoBackground}
                        videoBlur={videoBlur}
                        audioBackground={null} // Audio not needed for PNG/html2canvas snapshot
                        audioVolume={0}
                        theme={theme}
                        hideVideo={true} // Optimize performance by hiding video in export container
                        forceScale={1} // FORCE SCALE TO 1 FOR EXACT EXPORT
                        forceTransparent={!!videoBackground} // Override BG color if video background exists to ensure compositing works
                    />
                  </div>
              </div>
          ))}
      </div>

      {modalOpenForIndex !== null && (
        <AiSuiteModal
          isOpen={modalOpenForIndex !== null}
          onClose={() => setModalOpenForIndex(null)}
          onGenerateStrategy={() => handleGenerateStrategy(modalOpenForIndex)}
          content={designStates[modalOpenForIndex].aiSuiteContent}
          isLoading={{
            strategy: isLoading[`strategy-${modalOpenForIndex}`],
          }}
          hasGeneratedContent={!!designStates[modalOpenForIndex].sourceUrl}
          language={language}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
