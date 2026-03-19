
import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import type { DesignState, TextElementState, ImageState, AppTheme } from '../types';
import { REFERENCE_WIDTH } from '../constants';

interface PreviewAreaProps {
  designState: DesignState;
  videoBackground: File | null;
  videoBlur: number;
  audioBackground?: File | null;
  audioVolume?: number;
  theme: AppTheme;
  hideVideo?: boolean;
  forceScale?: number; // New prop to force exact scale for export
  forceTransparent?: boolean; // New prop to force transparent background for video compositing
  activeElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElementPosition?: (id: string, x: number, y: number) => void;
}

const hexToRgba = (hex: string, opacity: number): string => {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;
    return `rgba(${r},${g},${b},${opacity / 100})`;
  }
  return `rgba(0,0,0,${opacity / 100})`;
};

export const PreviewArea = forwardRef<HTMLDivElement, PreviewAreaProps>(({ 
    designState, 
    videoBackground, 
    videoBlur, 
    audioBackground,
    audioVolume = 50,
    theme, 
    hideVideo = false,
    forceScale,
    forceTransparent = false,
    activeElementId,
    onSelectElement,
    onUpdateElementPosition
}, ref) => {
  const { images, textElements, globalStyles, grid } = designState;
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalScale, setInternalScale] = useState(1);
  
  // Refs for syncing
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use forceScale if provided (for exports), otherwise use responsive internalScale
  const scale = forceScale !== undefined ? forceScale : internalScale;
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });

  // Update scale based on container width relative to REFERENCE_WIDTH (1080p)
  useEffect(() => {
    if (forceScale !== undefined) return; // Skip resizing logic if scale is forced

    const updateScale = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setInternalScale(width / REFERENCE_WIDTH);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [containerRef.current, forceScale]);

  useEffect(() => {
    if (videoBackground && !hideVideo) {
      const url = URL.createObjectURL(videoBackground);
      setVideoSrc(url);
      return () => {
        URL.revokeObjectURL(url);
        setVideoSrc(null);
      };
    } else {
        setVideoSrc(null);
    }
  }, [videoBackground, hideVideo]);

  // Audio Logic
  useEffect(() => {
      if (audioBackground && !hideVideo) {
          const url = URL.createObjectURL(audioBackground);
          setAudioSrc(url);
          return () => {
              URL.revokeObjectURL(url);
              setAudioSrc(null);
          };
      } else {
          setAudioSrc(null);
      }
  }, [audioBackground, hideVideo]);

  // FIX: Immediate Playback Trigger when Audio Source Changes
  useEffect(() => {
    if (audioSrc && audioRef.current && videoRef.current) {
        // Apply volume immediately
        audioRef.current.volume = (audioVolume || 50) / 100;
        
        // If video is already playing, start audio immediately to sync
        if (!videoRef.current.paused) {
             // Sync time with video (modulo duration to handle loops if needed, though usually we just restart)
             // For simple background music, starting from 0 is usually expected on new upload
             audioRef.current.currentTime = 0; 
             audioRef.current.play().catch(e => console.warn("Audio autoplay blocked", e));
        }
    }
  }, [audioSrc]);

  // Audio Volume Effect
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = audioVolume / 100;
      }
  }, [audioVolume]);

  // SYNC AUDIO TO VIDEO
  useEffect(() => {
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;

    if (!videoEl || !audioEl) return;

    const handlePlay = () => audioEl.play().catch(e => console.warn("Audio autoplay prevented", e));
    const handlePause = () => audioEl.pause();
    
    // Improved Loop Sync
    const handleTimeUpdate = () => {
        // If video loops back to start (is near 0) but audio is far ahead, reset audio
        if (videoEl.currentTime < 0.3 && audioEl.currentTime > 0.5) {
            audioEl.currentTime = 0;
            if (!videoEl.paused) audioEl.play().catch(() => {});
        }
    };

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
        videoEl.removeEventListener('play', handlePlay);
        videoEl.removeEventListener('pause', handlePause);
        videoEl.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoSrc, audioSrc]);


  const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    if (hideVideo) return; // Disable interactions for hidden export canvas
    e.stopPropagation();
    if (onSelectElement) onSelectElement(id);
    
    if (onUpdateElementPosition) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({ x: currentX, y: currentY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && activeElementId && onUpdateElementPosition) {
        // Calculate delta in screen pixels
        const screenDeltaX = e.clientX - dragStart.x;
        const screenDeltaY = e.clientY - dragStart.y;
        
        // Convert to reference pixels (1080p space)
        const refDeltaX = screenDeltaX / scale;
        const refDeltaY = screenDeltaY / scale;

        onUpdateElementPosition(activeElementId, elementStart.x + refDeltaX, elementStart.y + refDeltaY);
    }
  }, [isDragging, activeElementId, dragStart, elementStart, onUpdateElementPosition, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const textStrokeStyle = (size: number, color: string): React.CSSProperties => {
    if (!globalStyles.textStroke.enabled || size === 0) return {};
    return {
      WebkitTextStroke: `${size}px ${color}`,
      paintOrder: 'stroke fill',
    };
  };

  const textElementContainerStyle = (element: TextElementState, isActive: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${element.width}%`,
    // Use scaled translation for visual consistency
    transform: `translate(-50%, -50%) translateX(${element.positionX * scale}px) translateY(${element.positionY * scale}px)`,
    backgroundColor: element.frame.enabled ? hexToRgba(element.frame.color, element.frame.opacity) : 'transparent',
    padding: element.frame.enabled ? `${element.frame.padding * scale}px` : '0px', // Scale padding
    borderRadius: `${8 * scale}px`,
    display: element.visible ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: element.opacity / 100,
    cursor: hideVideo ? 'default' : (isActive ? 'grabbing' : 'grab'),
    border: isActive && !hideVideo ? '2px solid #38bdf8' : '2px solid transparent', // Cyan selection border
    boxShadow: isActive && !hideVideo ? '0 0 15px rgba(56, 189, 248, 0.5)' : 'none',
    zIndex: isActive ? 50 : 'auto', // Bring active to front visually
  });
  
  const textSpanStyle = (element: TextElementState): React.CSSProperties => ({
    color: globalStyles.textColor,
    fontFamily: globalStyles.fontFamily,
    fontSize: `${element.fontSize * scale}px`, // Scale font size
    fontWeight: element.id === 'headline' ? 'bold' : 'normal',
    lineHeight: '1.2',
    ...textStrokeStyle(globalStyles.textStroke.size * scale, globalStyles.textStroke.color),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textAlign: 'center',
    pointerEvents: 'none', // Let clicks pass to container
  });

  const imageContainerStyle = (image: ImageState, isActive: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${image.size}%`,
    transform: `translate(-50%, -50%) translateX(${image.positionX * scale}px) translateY(${image.positionY * scale}px)`,
    opacity: image.opacity / 100,
    filter: `grayscale(${image.filters.grayscale}%) sepia(${image.filters.sepia}%) brightness(${image.filters.brightness}%) contrast(${image.filters.contrast}%)`,
    display: image.visible ? 'block' : 'none',
    cursor: hideVideo ? 'default' : (isActive ? 'grabbing' : 'grab'),
    border: isActive && !hideVideo ? '2px solid #38bdf8' : '2px solid transparent',
    boxShadow: isActive && !hideVideo ? '0 0 15px rgba(56, 189, 248, 0.5)' : 'none',
    zIndex: isActive ? 50 : 'auto',
  });

  const gridOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(${grid.color} 1px, transparent 1px),
      linear-gradient(to right, ${grid.color} 1px, transparent 1px)
    `,
    backgroundSize: `${grid.size * scale}px ${grid.size * scale}px`,
    pointerEvents: 'none',
    zIndex: 100,
  };

  // Background click to deselect
  const handleBgClick = () => {
      if (!hideVideo && onSelectElement) onSelectElement(null);
  }

  // Determine classes for background container
  // If forceTransparent is true, we MUST NOT have any bg classes or shadows that create opacity
  const containerClasses = forceTransparent 
    ? `aspect-[9/16] w-full h-full overflow-hidden relative`
    : `aspect-[9/16] w-full h-full ${!hideVideo ? 'rounded-2xl shadow-2xl ring-1 ring-white/10' : ''} overflow-hidden relative bg-black/50 backdrop-blur-sm`;

  const containerStyle: React.CSSProperties = {
    backgroundColor: forceTransparent ? 'transparent' : globalStyles.previewBackground
  };

  return (
    <div className="relative group w-full h-full">
        {/* Device Frame Shadow - Only visible in interactive mode */}
        {!hideVideo && !forceTransparent && (
          <div className="absolute -inset-2 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[24px] opacity-40 blur-sm group-hover:opacity-60 transition-opacity pointer-events-none"></div>
        )}
        
        <div
        className={containerClasses}
        style={containerStyle}
        >
            <div 
                ref={ref || containerRef} 
                className="w-full h-full relative overflow-hidden"
                onMouseDown={handleBgClick}
            >
                {/* LAYER 1: VIDEO BACKGROUND (Bottom) */}
                {videoSrc && !hideVideo && (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
                    style={{ filter: `blur(${videoBlur}px)` }}
                />
                )}
                
                {/* LAYER 1.5: AUDIO BACKGROUND (Hidden) */}
                {audioSrc && !hideVideo && (
                    <audio 
                        ref={audioRef}
                        src={audioSrc}
                        // We control loop manually via useEffect to sync with video
                    />
                )}
                
                {/* LAYER 2: GRID (Middle) */}
                {grid.enabled && <div style={gridOverlayStyle} />}
                
                {/* LAYER 3: IMAGES / OVERLAYS (Top-Middle) */}
                {images.map(image => {
                  if (!image.src) return null;
                  
                  const commonProps = {
                    style: { width: '100%', height: '100%', objectFit: 'contain' as const },
                    className: "select-none drag-none pointer-events-none"
                  };

                  return (
                    <div
                      key={`${image.id}-${image.src}`}
                      data-id={image.id}
                      style={imageContainerStyle(image, activeElementId === image.id)}
                      onMouseDown={(e) => handleMouseDown(e, image.id, image.positionX, image.positionY)}
                    >
                        {image.mediaType === 'video' ? (
                          <video 
                            src={image.src} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            crossOrigin="anonymous"
                            {...commonProps}
                          />
                        ) : (
                          <img 
                            src={image.src} 
                            alt={image.id}
                            crossOrigin="anonymous" 
                            {...commonProps}
                          />
                        )}
                    </div>
                  );
                })}
                
                {/* LAYER 4: TEXT ELEMENTS (Top) */}
                {Object.values(textElements)
                .map((element: TextElementState) => (
                    <div
                    key={element.id}
                    data-text-id={element.id}
                    style={textElementContainerStyle(element, activeElementId === element.id)}
                    onMouseDown={(e) => handleMouseDown(e, element.id, element.positionX, element.positionY)}
                    >
                    <span style={textSpanStyle(element)}>
                        {element.text}
                    </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
});
