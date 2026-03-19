
import React from 'react';
import type { TextElementState, Language, AppTheme } from '../types';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { ColorPicker } from './ColorPicker';
import { LockClosedIcon, LockOpenIcon } from './Icons';

interface TextControlProps {
  state: TextElementState;
  onStateChange: (newValues: Partial<TextElementState>) => void;
  language: Language;
  theme: AppTheme;
}

export const TextControl: React.FC<TextControlProps> = ({ state, onStateChange, language, theme }) => {
  const handleFrameChange = (key: string, value: any) => {
    onStateChange({ frame: { ...state.frame, [key]: value } });
  };
  
  const title = state.id.charAt(0).toUpperCase() + state.id.slice(1);

  return (
    <div className={`${theme.classes.controlPanel.sectionBg} p-4 rounded-xl`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold capitalize ${theme.classes.controlPanel.sectionTitle}`}>{title}</h3>
        <button
          onClick={() => onStateChange({ locked: !state.locked })}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={state.locked ? `Unlock ${title} settings` : `Lock ${title} settings`}
        >
          {state.locked ? <LockClosedIcon /> : <LockOpenIcon />}
        </button>
      </div>
      <fieldset disabled={state.locked} className="space-y-4 disabled:opacity-50">
        <div>
          <label htmlFor={`${state.id}-text`} className="block text-sm font-medium text-slate-300 mb-1">
            {language === 'id' ? 'Teks Konten' : 'Content Text'}
          </label>
          <textarea
            id={`${state.id}-text`}
            rows={3}
            value={state.text}
            onChange={(e) => onStateChange({ text: e.target.value })}
            className={`w-full ${theme.classes.input.bg} ${theme.classes.input.text} p-2 rounded-lg border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing} resize-y`}
          />
        </div>
        <Slider
          label={language === 'id' ? 'Lebar' : 'Width'}
          min={20}
          max={100}
          value={state.width}
          onChange={(e) => onStateChange({ width: Number(e.target.value) })}
          unit="%"
          theme={theme}
        />
        <Slider
          label={language === 'id' ? 'Ukuran Teks' : 'Text Size'}
          min={10}
          max={120}
          value={state.fontSize}
          onChange={(e) => onStateChange({ fontSize: Number(e.target.value) })}
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
        
        <div className={`pt-3 border-t ${theme.classes.headerBorder}/50`}>
          <Toggle
            label={language === 'id' ? 'Bingkai Latar' : 'Background Frame'}
            enabled={state.frame.enabled}
            onChange={(enabled) => handleFrameChange('enabled', enabled)}
            theme={theme}
          />
          {state.frame.enabled && (
            <div className="pl-6 space-y-4 mt-2">
              <ColorPicker
                label={language === 'id' ? 'Warna Bingkai' : 'Frame Color'}
                color={state.frame.color}
                onChange={(e) => handleFrameChange('color', e.target.value)}
                theme={theme}
              />
              <Slider
                label="Padding"
                min={0}
                max={50}
                value={state.frame.padding}
                onChange={(e) => handleFrameChange('padding', Number(e.target.value))}
                theme={theme}
              />
              <Slider
                label={language === 'id' ? 'Transparansi Bingkai' : 'Frame Opacity'}
                min={0}
                max={100}
                value={state.frame.opacity}
                onChange={(e) => handleFrameChange('opacity', Number(e.target.value))}
                unit="%"
                theme={theme}
              />
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};
