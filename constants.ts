
import type { DesignState, ComicStyle, ComicLayout, ComicAspectRatio, AppTheme, LayoutTemplate } from './types';

export const FONT_OPTIONS = [
  'Inter', 'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 
  'Georgia', 'Garamond', 'Courier New', 'Brush Script MT'
];

export const TEXT_GENERATION_MODEL = 'gemini-2.5-flash';
export const IMAGE_REIMAGINATION_MODEL = 'gemini-2.5-flash-image';
export const AI_SUITE_MODEL = 'gemini-2.5-flash';

export const REFERENCE_WIDTH = 1080;
export const REFERENCE_HEIGHT = 1920;

export const COMIC_STYLE_OPTIONS: { id: ComicStyle; label: string; promptInstruction: string }[] = [
    { id: 'classic', label: 'Classic American', promptInstruction: 'A classic American comic book style from the Silver Age. Use bold, confident black ink lines, cel-shading, and Ben Day dots for mid-tones. The colors should be vibrant but slightly desaturated.' },
    { id: 'manga', label: 'Manga', promptInstruction: 'A black and white Japanese manga style. Emphasize dynamic, expressive characters and action. Use sharp lines, screentones for shading, and dramatic paneling.' },
    { id: 'modern', label: 'Modern Digital', promptInstruction: 'A modern digital comic style. Use clean, precise lines, detailed coloring with smooth gradients, and cinematic lighting to create a polished, high-quality look.' },
];

export const COMIC_LAYOUT_OPTIONS: { id: ComicLayout; label: string }[] = [
    { id: 'strip', label: 'Horizontal Strip' },
    { id: 'hero', label: 'Hero Panel Top' },
    { id: 'focus', label: 'Vertical Focus' },
    { id: 'grid', label: '2x1 Grid' },
];

export const COMIC_ASPECT_RATIO_OPTIONS: { id: ComicAspectRatio; label: string }[] = [
    { id: 'rectangle', label: 'Rectangle (9:16)' },
    { id: 'square', label: 'Square (1:1)' },
    { id: 'landscape', label: 'Landscape (16:9)' },
];

const BASE_DEFAULT_STATE: DesignState = {
  images: [
    { 
      id: 'image1', 
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzM3NDFlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0YzRjRGNjUiPlBsYWNlaG9sZGVyIEltYWdlIDE8L3RleHQ+PC9zdmc+', 
      originalSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzM3NDFlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0YzRjRGNjUiPlBsYWNlaG9sZGVyIEltYWdlIDE8L3RleHQ+PC9zdmc+', 
      aiModifiedSrc: null, 
      mediaType: 'image',
      size: 70, 
      positionX: 0, 
      positionY: 0, 
      chromaKey: { enabled: false, keyColor: '#00ff00', tolerance: 20 }, 
      opacity: 100, 
      filters: { grayscale: 0, sepia: 0, brightness: 100, contrast: 100 },
      visible: true,
    },
    { 
      id: 'image2', 
      src: null, 
      originalSrc: null, 
      aiModifiedSrc: null, 
      mediaType: 'image',
      size: 70, 
      positionX: 0, 
      positionY: 0, 
      chromaKey: { enabled: false, keyColor: '#00ff00', tolerance: 20 }, 
      opacity: 100, 
      filters: { grayscale: 0, sepia: 0, brightness: 100, contrast: 100 },
      visible: true,
    },
  ],
  textElements: {
    headline: {
      id: 'headline',
      text: 'HEADLINE TEXT',
      fontSize: 48,
      width: 90,
      positionX: 0,
      positionY: 0,
      frame: { enabled: true, color: '#000000', padding: 10, opacity: 50 },
      locked: false,
      opacity: 100,
      visible: true,
    },
    hook: {
      id: 'hook',
      text: 'Hook text goes here to grab attention.',
      fontSize: 24,
      width: 80,
      positionX: 0,
      positionY: 0,
      frame: { enabled: false, color: '#000000', padding: 8, opacity: 50 },
      locked: false,
      opacity: 100,
      visible: true,
    },
    climax: {
      id: 'climax',
      text: 'Climax or call to action.',
      fontSize: 28,
      width: 85,
      positionX: 0,
      positionY: 0,
      frame: { enabled: true, color: '#8b5cf6', padding: 12, opacity: 50 },
      locked: false,
      opacity: 100,
      visible: true,
    },
  },
  globalStyles: {
    fontFamily: 'Inter',
    textColor: '#FFFFFF',
    textStroke: { enabled: true, color: '#000000', size: 2 },
    baseFontSize: 32,
    locked: false,
    previewBackground: '#111827',
  },
  grid: {
    enabled: false,
    size: 50,
    color: '#ffffff40',
  },
  fileName: 'ai-overlay',
  aiSuiteContent: {
    strategy: null,
  },
  comicState: {
    script: null,
    generatedComic: null,
    layout: 'strip',
    style: 'classic',
    aspectRatio: 'rectangle',
    imagePrompt: null,
    generatedComicV2: null,
    version: 'v1',
  },
  sourceUrl: '',
};

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'hero',
    name: "Hero",
    config: {
      images: { positionY: -50, size: 100, opacity: 90 },
      textElements: {
        headline: { positionY: -200, width: 90, fontSize: 52 },
        hook: { positionY: -120, width: 80, fontSize: 26 },
        climax: { positionY: 200, width: 85, fontSize: 30 },
      }
    }
  }
];

const initialTemplate = LAYOUT_TEMPLATES[0].config;
export const DEFAULT_STATE: DesignState = {
  ...BASE_DEFAULT_STATE,
  images: [
    { ...BASE_DEFAULT_STATE.images[0], ...initialTemplate.images!, visible: true },
    { ...BASE_DEFAULT_STATE.images[1], visible: true },
  ],
  textElements: {
    headline: { ...BASE_DEFAULT_STATE.textElements.headline, ...initialTemplate.textElements!.headline, visible: true },
    hook: { ...BASE_DEFAULT_STATE.textElements.hook, ...initialTemplate.textElements!.hook, visible: true },
    climax: { ...BASE_DEFAULT_STATE.textElements.climax, ...initialTemplate.textElements!.climax, visible: true },
  },
};

export const themes: Record<string, AppTheme> = {
  cyan: {
    name: 'Default Cyan',
    palette: {
      textColor: '#FFFFFF',
      strokeColor: '#000000',
      frameColor1: '#1f2937',
      frameColor2: '#0891b2',
    },
    classes: {
      bg: 'bg-slate-950',
      textWhite: 'text-slate-200',
      header: 'bg-slate-900/40 backdrop-blur-xl',
      headerBorder: 'border-white/10',
      headerTitle: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400',
      mainPanel: { bg: 'bg-white/5 backdrop-blur-md' },
      controlPanel: {
        bg: 'bg-white/5 backdrop-blur-xl',
        tabActive: 'bg-white/10 text-sky-300 border border-white/10',
        tabInactive: 'text-slate-400 hover:text-white',
        tabBorder: 'border-white/5',
        sectionBg: 'bg-white/5 backdrop-blur-sm border border-white/5',
        sectionTitle: 'text-sky-400',
      },
      button: {
        primary: 'bg-sky-600/80 hover:bg-sky-500/90 backdrop-blur-md focus:ring-sky-400 shadow-lg shadow-sky-600/20 border border-white/10',
        success: 'bg-emerald-600/80 hover:bg-emerald-500/90 backdrop-blur-md focus:ring-emerald-400 shadow-lg shadow-emerald-600/20 border border-white/10',
        danger: 'bg-rose-600/80 hover:bg-rose-500/90 backdrop-blur-md focus:ring-rose-400 shadow-lg shadow-rose-600/20 border border-white/10',
      },
      input: {
        bg: 'bg-white/5 backdrop-blur-sm',
        border: 'border-white/10',
        focusRing: 'focus:ring-sky-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-sky-500', inactive: 'bg-white/10' },
      slider: { track: 'bg-white/10', thumb: 'bg-sky-500', valueBg: 'bg-white/10', valueText: 'text-sky-300' },
      preview: { border: 'border-white/10' },
      modal: { bg: 'bg-slate-900/90 backdrop-blur-2xl', border: 'border-white/10', title: 'text-sky-400', sectionBg: 'bg-white/5', sectionBorder: 'border-sky-500/50' }
    }
  },
  synthwave: {
    name: 'Synthwave',
    palette: {
        textColor: '#f472b6',
        strokeColor: '#2e1065',
        frameColor1: '#0ea5e9',
        frameColor2: '#db2777',
    },
    classes: {
      bg: 'bg-indigo-900 from-gray-900 to-indigo-900 bg-gradient-to-b',
      textWhite: 'text-white',
      header: 'bg-slate-900/70',
      headerBorder: 'border-indigo-700',
      headerTitle: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400',
      mainPanel: { bg: 'bg-slate-900/50' },
      controlPanel: {
        bg: 'bg-black/20',
        tabActive: 'bg-slate-800 text-pink-400',
        tabInactive: 'text-indigo-300 hover:text-white',
        tabBorder: 'border-indigo-800',
        sectionBg: 'bg-black/20',
        sectionTitle: 'text-pink-400',
      },
      button: {
        primary: 'bg-pink-500 hover:bg-pink-400 focus:ring-pink-300 shadow-lg shadow-pink-500/20 hover:shadow-pink-400/30',
        success: 'bg-teal-500 hover:bg-teal-400 focus:ring-teal-300 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30',
        danger: 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-400 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30',
      },
      input: {
        bg: 'bg-indigo-800/80',
        border: 'border-indigo-700',
        focusRing: 'focus:ring-pink-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-pink-500', inactive: 'bg-indigo-600' },
      slider: { track: 'bg-indigo-700', thumb: 'bg-pink-500', valueBg: 'bg-indigo-800', valueText: 'text-pink-400' },
      preview: { border: 'border-indigo-700' },
      modal: { bg: 'bg-slate-900', border: 'border-indigo-700', title: 'text-pink-400', sectionBg: 'bg-black/20', sectionBorder: 'border-pink-500' }
    }
  },
  forest: {
    name: 'Forest',
    palette: {
      textColor: '#fde047',
      strokeColor: '#14532d',
      frameColor1: '#ca8a04',
      frameColor2: '#ea580c',
    },
    classes: {
      bg: 'bg-green-900 from-gray-900 to-green-900 bg-gradient-to-b',
      textWhite: 'text-white',
      header: 'bg-green-900/70',
      headerBorder: 'border-green-700',
      headerTitle: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400',
      mainPanel: { bg: 'bg-green-800/50' },
      controlPanel: {
        bg: 'bg-green-800/80',
        tabActive: 'bg-green-900 text-amber-300',
        tabInactive: 'text-green-300 hover:text-white',
        tabBorder: 'border-green-700',
        sectionBg: 'bg-green-900/50',
        sectionTitle: 'text-amber-300',
      },
      button: {
        primary: 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-400 shadow-lg shadow-amber-600/20 hover:shadow-amber-500/30',
        success: 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30',
        danger: 'bg-orange-700 hover:bg-orange-600 focus:ring-orange-500 shadow-lg shadow-orange-700/20 hover:shadow-orange-600/30',
      },
      input: {
        bg: 'bg-green-700',
        border: 'border-green-600',
        focusRing: 'focus:ring-amber-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-amber-500', inactive: 'bg-green-600' },
      slider: { track: 'bg-green-600', thumb: 'bg-amber-500', valueBg: 'bg-green-700', valueText: 'text-amber-300' },
      preview: { border: 'border-green-600' },
      modal: { bg: 'bg-green-800', border: 'border-green-700', title: 'text-amber-400', sectionBg: 'bg-green-700/50', sectionBorder: 'border-amber-500' }
    }
  },
  crimson: {
    name: 'Crimson',
    palette: {
      textColor: '#e5e7eb',
      strokeColor: '#450a0a',
      frameColor1: '#1f2937',
      frameColor2: '#991b1b',
    },
    classes: {
      bg: 'bg-slate-900 from-black to-slate-900 bg-gradient-to-b',
      textWhite: 'text-white',
      header: 'bg-black/70',
      headerBorder: 'border-slate-800',
      headerTitle: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500',
      mainPanel: { bg: 'bg-black/50' },
      controlPanel: {
        bg: 'bg-slate-900',
        tabActive: 'bg-slate-800 text-red-500',
        tabInactive: 'text-slate-400 hover:text-white',
        tabBorder: 'border-slate-800',
        sectionBg: 'bg-slate-800/50',
        sectionTitle: 'text-red-500',
      },
      button: {
        primary: 'bg-red-700 hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-700/20 hover:shadow-red-600/30',
        success: 'bg-sky-700 hover:bg-sky-600 focus:ring-sky-500 shadow-lg shadow-sky-700/20 hover:shadow-sky-600/30',
        danger: 'bg-rose-800 hover:bg-rose-700 focus:ring-rose-600 shadow-lg shadow-rose-800/20 hover:shadow-rose-700/30',
      },
      input: {
        bg: 'bg-slate-800',
        border: 'border-slate-700',
        focusRing: 'focus:ring-red-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-red-600', inactive: 'bg-slate-700' },
      slider: { track: 'bg-slate-700', thumb: 'bg-red-600', valueBg: 'bg-slate-800', valueText: 'text-red-500' },
      preview: { border: 'border-slate-700' },
      modal: { bg: 'bg-slate-900', border: 'border-slate-800', title: 'text-red-500', sectionBg: 'bg-slate-800/50', sectionBorder: 'border-red-600' }
    }
  },
  ocean: {
    name: 'Ocean',
    palette: {
      textColor: '#E0F2F1',
      strokeColor: '#004D40',
      frameColor1: '#009688',
      frameColor2: '#4DB6AC',
    },
    classes: {
      bg: 'bg-teal-900',
      textWhite: 'text-white',
      header: 'bg-teal-800/50',
      headerBorder: 'border-teal-700',
      headerTitle: 'text-cyan-200',
      mainPanel: { bg: 'bg-teal-800/50' },
      controlPanel: {
        bg: 'bg-teal-800/80',
        tabActive: 'bg-teal-700 text-cyan-300',
        tabInactive: 'text-teal-200 hover:text-white',
        tabBorder: 'border-teal-700',
        sectionBg: 'bg-teal-700/50',
        sectionTitle: 'text-cyan-200',
      },
      button: {
        primary: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500',
        success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        danger: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
      },
      input: {
        bg: 'bg-teal-700',
        border: 'border-teal-600',
        focusRing: 'focus:ring-cyan-400',
        text: 'text-white',
      },
      toggle: { active: 'bg-cyan-500', inactive: 'bg-teal-600' },
      slider: { track: 'bg-teal-600', thumb: 'bg-cyan-500', valueBg: 'bg-teal-700', valueText: 'text-cyan-200' },
      preview: { border: 'border-teal-600' },
      modal: { bg: 'bg-teal-800', border: 'border-teal-700', title: 'text-cyan-300', sectionBg: 'bg-teal-700/50', sectionBorder: 'border-cyan-400' }
    }
  },
  sunset: {
    name: 'Sunset',
    palette: {
      textColor: '#FFF3E0',
      strokeColor: '#422006',
      frameColor1: '#FF7043',
      frameColor2: '#8E24AA',
    },
    classes: {
      bg: 'bg-gray-800',
      textWhite: 'text-white',
      header: 'bg-gray-900/50',
      headerBorder: 'border-orange-900',
      headerTitle: 'text-yellow-400',
      mainPanel: { bg: 'bg-gray-900/50' },
      controlPanel: {
        bg: 'bg-black/30',
        tabActive: 'bg-gray-700 text-orange-500',
        tabInactive: 'text-orange-200 hover:text-white',
        tabBorder: 'border-gray-700',
        sectionBg: 'bg-black/20',
        sectionTitle: 'text-yellow-400',
      },
      button: {
        primary: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        success: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        danger: 'bg-red-700 hover:bg-red-800 focus:ring-red-600',
      },
      input: {
        bg: 'bg-gray-700',
        border: 'border-gray-600',
        focusRing: 'focus:ring-orange-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-orange-500', inactive: 'bg-gray-600' },
      slider: { track: 'bg-gray-600', thumb: 'bg-orange-500', valueBg: 'bg-gray-700', valueText: 'text-yellow-400' },
      preview: { border: 'border-gray-600' },
      modal: { bg: 'bg-gray-900', border: 'border-gray-700', title: 'text-orange-400', sectionBg: 'bg-black/20', sectionBorder: 'border-orange-500' }
    }
  },
  monochrome: {
    name: 'Monochrome',
    palette: {
      textColor: '#FFFFFF',
      strokeColor: '#000000',
      frameColor1: '#222222',
      frameColor2: '#999999',
    },
    classes: {
      bg: 'bg-black',
      textWhite: 'text-white',
      header: 'bg-gray-900/50',
      headerBorder: 'border-gray-700',
      headerTitle: 'text-white',
      mainPanel: { bg: 'bg-gray-900/50' },
      controlPanel: {
        bg: 'bg-gray-900',
        tabActive: 'bg-gray-700 text-white',
        tabInactive: 'text-gray-400 hover:text-white',
        tabBorder: 'border-gray-700',
        sectionBg: 'bg-gray-800',
        sectionTitle: 'text-white',
      },
      button: {
        primary: 'bg-gray-200 text-black hover:bg-white focus:ring-gray-400',
        success: 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-400',
        danger: 'bg-gray-800 hover:bg-gray-700 focus:ring-gray-600',
      },
      input: {
        bg: 'bg-gray-800',
        border: 'border-gray-600',
        focusRing: 'focus:ring-white',
        text: 'text-white',
      },
      toggle: { active: 'bg-white', inactive: 'bg-gray-600' },
      slider: { track: 'bg-gray-700', thumb: 'bg-white', valueBg: 'bg-gray-800', valueText: 'text-white' },
      preview: { border: 'border-gray-600' },
      modal: { bg: 'bg-gray-900', border: 'border-gray-700', title: 'text-white', sectionBg: 'bg-gray-800/50', sectionBorder: 'border-white' }
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    palette: { textColor: '#39FF14', strokeColor: '#000000', frameColor1: '#FF00FF', frameColor2: '#00FFFF' },
    classes: {
      bg: 'bg-black',
      textWhite: 'text-white',
      header: 'bg-gray-900/50',
      headerBorder: 'border-fuchsia-500',
      headerTitle: 'text-lime-400',
      mainPanel: { bg: 'bg-gray-900/50' },
      controlPanel: {
        bg: 'bg-gray-900/80',
        tabActive: 'bg-gray-800 text-lime-400',
        tabInactive: 'text-gray-400 hover:text-white',
        tabBorder: 'border-gray-800',
        sectionBg: 'bg-gray-800/50',
        sectionTitle: 'text-lime-400',
      },
      button: {
        primary: 'bg-fuchsia-600 hover:bg-fuchsia-700 focus:ring-fuchsia-500',
        success: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400',
        danger: 'bg-red-700 hover:bg-red-800 focus:ring-red-600',
      },
      input: {
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        focusRing: 'focus:ring-lime-400',
        text: 'text-white',
      },
      toggle: { active: 'bg-lime-500', inactive: 'bg-gray-600' },
      slider: { track: 'bg-gray-700', thumb: 'bg-lime-500', valueBg: 'bg-gray-800', valueText: 'text-lime-300' },
      preview: { border: 'border-fuchsia-500' },
      modal: { bg: 'bg-gray-900', border: 'border-gray-800', title: 'text-lime-400', sectionBg: 'bg-gray-800/50', sectionBorder: 'border-lime-500' }
    }
  },
  solar: {
    name: 'Solar Flare',
    palette: { textColor: '#FFFF00', strokeColor: '#4D0000', frameColor1: '#FF4500', frameColor2: '#DC143C' },
    classes: {
      bg: 'bg-red-900',
      textWhite: 'text-white',
      header: 'bg-red-800/50',
      headerBorder: 'border-orange-700',
      headerTitle: 'text-yellow-300',
      mainPanel: { bg: 'bg-red-800/50' },
      controlPanel: {
        bg: 'bg-red-800/80',
        tabActive: 'bg-red-700 text-yellow-400',
        tabInactive: 'text-orange-200 hover:text-white',
        tabBorder: 'border-red-700',
        sectionBg: 'bg-orange-900/50',
        sectionTitle: 'text-yellow-300',
      },
      button: {
        primary: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        success: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        danger: 'bg-red-700 hover:bg-red-800 focus:ring-red-600',
      },
      input: {
        bg: 'bg-orange-900/80',
        border: 'border-orange-800',
        focusRing: 'focus:ring-yellow-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-yellow-500', inactive: 'bg-red-700' },
      slider: { track: 'bg-red-700', thumb: 'bg-yellow-500', valueBg: 'bg-orange-900', valueText: 'text-yellow-300' },
      preview: { border: 'border-orange-800' },
      modal: { bg: 'bg-red-800', border: 'border-orange-700', title: 'text-yellow-400', sectionBg: 'bg-orange-900/50', sectionBorder: 'border-yellow-500' }
    }
  },
  arctic: {
    name: 'Arctic Ice',
    palette: { textColor: '#001f3f', strokeColor: '#FFFFFF', frameColor1: '#ADD8E6', frameColor2: '#F0FFFF' },
    classes: {
      bg: 'bg-slate-200',
      textWhite: 'text-slate-800',
      header: 'bg-white/50',
      headerBorder: 'border-slate-300',
      headerTitle: 'text-blue-600',
      mainPanel: { bg: 'bg-white/50' },
      controlPanel: {
        bg: 'bg-slate-100',
        tabActive: 'bg-white text-sky-500',
        tabInactive: 'text-slate-500 hover:text-slate-800',
        tabBorder: 'border-slate-300',
        sectionBg: 'bg-slate-200/50',
        sectionTitle: 'text-blue-600',
      },
      button: {
        primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400',
        success: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400',
      },
      input: {
        bg: 'bg-white',
        border: 'border-slate-300',
        focusRing: 'focus:ring-sky-500',
        text: 'text-slate-800',
      },
      toggle: { active: 'bg-sky-500', inactive: 'bg-slate-400' },
      slider: { track: 'bg-slate-300', thumb: 'bg-sky-500', valueBg: 'bg-slate-300', valueText: 'text-sky-600' },
      preview: { border: 'border-slate-400' },
      modal: { bg: 'bg-slate-100', border: 'border-slate-300', title: 'text-blue-600', sectionBg: 'bg-slate-200/50', sectionBorder: 'border-sky-500' }
    }
  },
  royal: {
    name: 'Royal Gold',
    palette: { textColor: '#FFD700', strokeColor: '#2C003E', frameColor1: '#4B0082', frameColor2: '#800080' },
    classes: {
      bg: 'bg-purple-900',
      textWhite: 'text-white',
      header: 'bg-purple-800/50',
      headerBorder: 'border-yellow-600',
      headerTitle: 'text-yellow-400',
      mainPanel: { bg: 'bg-purple-800/50' },
      controlPanel: {
        bg: 'bg-purple-800/80',
        tabActive: 'bg-purple-700 text-yellow-400',
        tabInactive: 'text-purple-300 hover:text-white',
        tabBorder: 'border-purple-700',
        sectionBg: 'bg-purple-700/50',
        sectionTitle: 'text-yellow-400',
      },
      button: {
        primary: 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400',
        success: 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-400',
        danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600',
      },
      input: {
        bg: 'bg-purple-700',
        border: 'border-purple-600',
        focusRing: 'focus:ring-yellow-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-yellow-500', inactive: 'bg-purple-600' },
      slider: { track: 'bg-purple-600', thumb: 'bg-yellow-500', valueBg: 'bg-purple-700', valueText: 'text-yellow-300' },
      preview: { border: 'border-purple-600' },
      modal: { bg: 'bg-purple-800', border: 'border-purple-700', title: 'text-yellow-400', sectionBg: 'bg-purple-700/50', sectionBorder: 'border-yellow-500' }
    }
  },
  desert: {
    name: 'Desert Mirage',
    palette: { textColor: '#422D24', strokeColor: '#F5DEB3', frameColor1: '#CD853F', frameColor2: '#87CEEB' },
    classes: {
      bg: 'bg-orange-100',
      textWhite: 'text-stone-800',
      header: 'bg-white/50',
      headerBorder: 'border-orange-200',
      headerTitle: 'text-amber-800',
      mainPanel: { bg: 'bg-white/50' },
      controlPanel: {
        bg: 'bg-orange-50',
        tabActive: 'bg-white text-amber-600',
        tabInactive: 'text-stone-500 hover:text-stone-800',
        tabBorder: 'border-orange-200',
        sectionBg: 'bg-orange-100/50',
        sectionTitle: 'text-amber-800',
      },
      button: {
        primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
        success: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      },
      input: {
        bg: 'bg-white',
        border: 'border-orange-200',
        focusRing: 'focus:ring-amber-600',
        text: 'text-stone-800',
      },
      toggle: { active: 'bg-amber-600', inactive: 'bg-orange-200' },
      slider: { track: 'bg-orange-200', thumb: 'bg-amber-600', valueBg: 'bg-orange-200', valueText: 'text-amber-800' },
      preview: { border: 'border-orange-300' },
      modal: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-amber-800', sectionBg: 'bg-orange-100/50', sectionBorder: 'border-amber-600' }
    }
  },
  sakura: {
    name: 'Sakura Blossom',
    palette: { textColor: '#6B4242', strokeColor: '#FFFFFF', frameColor1: '#FFC0CB', frameColor2: '#FFFFFF' },
    classes: {
      bg: 'bg-pink-50',
      textWhite: 'text-pink-900',
      header: 'bg-white/50',
      headerBorder: 'border-pink-200',
      headerTitle: 'text-pink-500',
      mainPanel: { bg: 'bg-white/50' },
      controlPanel: {
        bg: 'bg-pink-100/50',
        tabActive: 'bg-white text-pink-400',
        tabInactive: 'text-pink-300 hover:text-pink-500',
        tabBorder: 'border-pink-200',
        sectionBg: 'bg-white/50',
        sectionTitle: 'text-pink-500',
      },
      button: {
        primary: 'bg-pink-400 text-white hover:bg-pink-500 focus:ring-pink-300',
        success: 'bg-green-400 text-white hover:bg-green-500 focus:ring-green-300',
        danger: 'bg-rose-400 text-white hover:bg-rose-500 focus:ring-rose-300',
      },
      input: {
        bg: 'bg-white',
        border: 'border-pink-200',
        focusRing: 'focus:ring-pink-400',
        text: 'text-pink-900',
      },
      toggle: { active: 'bg-pink-400', inactive: 'bg-pink-200' },
      slider: { track: 'bg-pink-200', thumb: 'bg-pink-400', valueBg: 'bg-pink-200', valueText: 'text-pink-500' },
      preview: { border: 'border-pink-300' },
      modal: { bg: 'bg-white', border: 'border-pink-200', title: 'text-pink-500', sectionBg: 'bg-pink-50', sectionBorder: 'border-pink-400' }
    }
  },
  emerald: {
    name: 'Emerald City',
    palette: { textColor: '#FFD700', strokeColor: '#004B23', frameColor1: '#006400', frameColor2: '#38B000' },
    classes: {
      bg: 'bg-emerald-900',
      textWhite: 'text-white',
      header: 'bg-emerald-800/50',
      headerBorder: 'border-yellow-600',
      headerTitle: 'text-yellow-300',
      mainPanel: { bg: 'bg-emerald-800/50' },
      controlPanel: {
        bg: 'bg-emerald-800/80',
        tabActive: 'bg-emerald-700 text-yellow-400',
        tabInactive: 'text-emerald-300 hover:text-white',
        tabBorder: 'border-emerald-700',
        sectionBg: 'bg-emerald-700/50',
        sectionTitle: 'text-yellow-300',
      },
      button: {
        primary: 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
        danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600',
      },
      input: {
        bg: 'bg-emerald-700',
        border: 'border-emerald-600',
        focusRing: 'focus:ring-yellow-500',
        text: 'text-white',
      },
      toggle: { active: 'bg-yellow-500', inactive: 'bg-emerald-600' },
      slider: { track: 'bg-emerald-600', thumb: 'bg-yellow-500', valueBg: 'bg-emerald-700', valueText: 'text-yellow-300' },
      preview: { border: 'border-emerald-600' },
      modal: { bg: 'bg-emerald-800', border: 'border-emerald-700', title: 'text-yellow-400', sectionBg: 'bg-emerald-700/50', sectionBorder: 'border-yellow-500' }
    }
  },
  vampire: {
    name: 'Vampire Kiss',
    palette: { textColor: '#C0C0C0', strokeColor: '#000000', frameColor1: '#8B0000', frameColor2: '#4B0000' },
    classes: {
      bg: 'bg-black',
      textWhite: 'text-white',
      header: 'bg-gray-900/50',
      headerBorder: 'border-red-800',
      headerTitle: 'text-red-600',
      mainPanel: { bg: 'bg-gray-900/50' },
      controlPanel: {
        bg: 'bg-black/80',
        tabActive: 'bg-gray-800 text-red-600',
        tabInactive: 'text-gray-500 hover:text-white',
        tabBorder: 'border-gray-800',
        sectionBg: 'bg-gray-900/50',
        sectionTitle: 'text-red-600',
      },
      button: {
        primary: 'bg-red-800 hover:bg-red-900 focus:ring-red-700',
        success: 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-400',
        danger: 'bg-rose-900 hover:bg-rose-800 focus:ring-rose-700',
      },
      input: {
        bg: 'bg-gray-900',
        border: 'border-gray-800',
        focusRing: 'focus:ring-red-600',
        text: 'text-white',
      },
      toggle: { active: 'bg-red-700', inactive: 'bg-gray-700' },
      slider: { track: 'bg-gray-800', thumb: 'bg-red-700', valueBg: 'bg-gray-900', valueText: 'text-red-500' },
      preview: { border: 'border-red-800' },
      modal: { bg: 'bg-black', border: 'border-gray-800', title: 'text-red-600', sectionBg: 'bg-gray-900/50', sectionBorder: 'border-red-700' }
    }
  },
  coffee: {
    name: 'Coffee Shop',
    palette: { textColor: '#3E2723', strokeColor: '#EFEBE9', frameColor1: '#A1887F', frameColor2: '#D7CCC8' },
    classes: {
      bg: 'bg-stone-200',
      textWhite: 'text-stone-800',
      header: 'bg-white/50',
      headerBorder: 'border-stone-300',
      headerTitle: 'text-amber-900',
      mainPanel: { bg: 'bg-white/50' },
      controlPanel: {
        bg: 'bg-stone-100',
        tabActive: 'bg-white text-amber-800',
        tabInactive: 'text-stone-500 hover:text-stone-800',
        tabBorder: 'border-stone-300',
        sectionBg: 'bg-stone-200/50',
        sectionTitle: 'text-amber-900',
      },
      button: {
        primary: 'bg-amber-800 text-white hover:bg-amber-900 focus:ring-amber-700',
        success: 'bg-green-700 text-white hover:bg-green-800 focus:ring-green-600',
        danger: 'bg-red-800 text-white hover:bg-red-900 focus:ring-red-700',
      },
      input: {
        bg: 'bg-white',
        border: 'border-stone-300',
        focusRing: 'focus:ring-amber-800',
        text: 'text-stone-800',
      },
      toggle: { active: 'bg-amber-800', inactive: 'bg-stone-300' },
      slider: { track: 'bg-stone-300', thumb: 'bg-amber-800', valueBg: 'bg-stone-300', valueText: 'text-amber-900' },
      preview: { border: 'border-stone-400' },
      modal: { bg: 'bg-stone-100', border: 'border-stone-300', title: 'text-amber-900', sectionBg: 'bg-stone-200/50', sectionBorder: 'border-amber-800' }
    }
  },
  retro: {
    name: '8-Bit Retro',
    palette: { textColor: '#FFFFFF', strokeColor: '#000000', frameColor1: '#0000FF', frameColor2: '#FF0000' },
    classes: {
      bg: 'bg-gray-700',
      textWhite: 'text-white',
      header: 'bg-gray-800/50',
      headerBorder: 'border-gray-600',
      headerTitle: 'text-yellow-400',
      mainPanel: { bg: 'bg-gray-800/50' },
      controlPanel: {
        bg: 'bg-gray-800',
        tabActive: 'bg-gray-700 text-yellow-400',
        tabInactive: 'text-gray-400 hover:text-white',
        tabBorder: 'border-gray-600',
        sectionBg: 'bg-gray-700/50',
        sectionTitle: 'text-yellow-400',
      },
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      },
      input: {
        bg: 'bg-gray-600',
        border: 'border-gray-500',
        focusRing: 'focus:ring-yellow-400',
        text: 'text-white',
      },
      toggle: { active: 'bg-yellow-500', inactive: 'bg-gray-500' },
      slider: { track: 'bg-gray-600', thumb: 'bg-yellow-500', valueBg: 'bg-gray-600', valueText: 'text-yellow-300' },
      preview: { border: 'border-gray-500' },
      modal: { bg: 'bg-gray-800', border: 'border-gray-700', title: 'text-yellow-400', sectionBg: 'bg-gray-700/50', sectionBorder: 'border-yellow-500' }
    }
  }
};
