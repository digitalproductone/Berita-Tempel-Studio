
export interface FrameState {
  enabled: boolean;
  color: string;
  padding: number;
  opacity: number;
}

export interface StrokeState {
  enabled: boolean;
  color: string;
  size: number;
}

export interface TextElementState {
  id: TextElementId;
  text: string;
  fontSize: number;
  width: number;
  positionX: number;
  positionY: number;
  frame: FrameState;
  locked: boolean;
  opacity: number;
  visible: boolean;
}

export interface ChromaKeyState {
  enabled: boolean;
  keyColor: string;
  tolerance: number;
}

export interface ImageFilters {
  grayscale: number;
  sepia: number;
  brightness: number;
  contrast: number;
}

export type MediaType = 'image' | 'video';

export interface ImageState {
  id: 'image1' | 'image2';
  src: string | null; // Can be base64 image or Blob URL for video
  mediaType: MediaType;
  originalSrc: string | null;
  aiModifiedSrc: string | null;
  size: number;
  positionX: number;
  positionY: number;
  chromaKey: ChromaKeyState;
  opacity: number;
  filters: ImageFilters;
  visible: boolean;
}

export interface GlobalStyles {
  fontFamily: string;
  textColor: string;
  textStroke: StrokeState;
  baseFontSize: number;
  locked: boolean;
  previewBackground: string;
}

export interface GridState {
  enabled: boolean;
  size: number;
  color: string;
}

export interface ComicPanel {
    description: string;
    dialogue: string;
}

export type ComicLayout = 'strip' | 'hero' | 'focus' | 'grid';
export type ComicStyle = 'classic' | 'manga' | 'modern';
export type ComicAspectRatio = 'rectangle' | 'square' | 'landscape';

export interface DesignState {
  images: [ImageState, ImageState];
  textElements: {
    headline: TextElementState;
    hook: TextElementState;
    climax: TextElementState;
  };
  globalStyles: GlobalStyles;
  grid: GridState;
  fileName: string;
  aiSuiteContent: {
    strategy: AiStrategy | null;
  };
  comicState: {
    // V1
    script: [ComicPanel, ComicPanel, ComicPanel] | null;
    generatedComic: string | null;
    layout: ComicLayout;
    // V2
    imagePrompt: string | null;
    generatedComicV2: string | null;
    // Common
    style: ComicStyle;
    aspectRatio: ComicAspectRatio;
    version: 'v1' | 'v2';
  };
  sourceUrl: string;
}

export type TextElementId = 'headline' | 'hook' | 'climax';
export type Language = 'en' | 'id';
export type ImageAiStyle = 'reimagine' | 'comic' | 'caricature' | 'background';

export interface GeneratedContent {
  HEADLINE: string;
  HOOK: string;
  CLIMAX: string;
  COMIC_SCRIPT: [ComicPanel, ComicPanel, ComicPanel];
}

export interface GeneratedContentV2 {
  headline: string;
  hook: string;
  climax: string;
  imagePrompt: string;
}

export interface AiStrategy {
    optimizedTitle: string;
    optimizedDescription: string;
    optimizedHashtags: string[];
}

export type TextStyle = Omit<TextElementState, 'id' | 'text' | 'locked' | 'visible'>;

export interface CopiedStyle {
  images: [ImageState, ImageState];
  textElements: {
    headline: TextStyle;
    hook: TextStyle;
    climax: TextStyle;
  };
  globalStyles: GlobalStyles;
  grid: GridState;
}

export interface AppTheme {
  name: string;
  palette: {
    textColor: string;
    strokeColor: string;
    frameColor1: string;
    frameColor2: string;
  };
  classes: {
    bg: string;
    textWhite: string;
    header: string;
    headerBorder: string;
    headerTitle: string;
    mainPanel: {
      bg: string;
    };
    controlPanel: {
      bg: string;
      tabActive: string;
      tabInactive: string;
      tabBorder: string;
      sectionBg: string;
      sectionTitle: string;
    },
    button: {
      primary: string;
      success: string;
      danger: string;
    },
    input: {
      bg: string;
      border: string;
      focusRing: string;
      text: string;
    },
    toggle: {
      active: string;
      inactive: string;
    },
    slider: {
      track: string;
      thumb: string;
      valueBg: string;
      valueText: string;
    },
    preview: {
      border: string;
    },
    modal: {
      bg: string;
      border: string;
      title: string;
      sectionBg: string;
      sectionBorder: string;
    }
  };
}

export interface LayoutTemplate {
  id: string;
  name: string;
  isCustom?: boolean;
  createdAt?: number;
  config: {
    images?: Partial<ImageState>;
    textElements?: Partial<Record<TextElementId, Partial<TextElementState>>>;
    globalStyles?: Partial<GlobalStyles>;
  };
}
