import React from 'react';
import type { GlobalStyles, Language, AppTheme } from '../types';
import { FONT_OPTIONS } from '../constants';
import { Slider } from './Slider';
import { ColorPicker } from './ColorPicker';
import { Toggle } from './Toggle';
import { LockClosedIcon, LockOpenIcon } from './Icons';

interface GlobalStylesControlProps {
  state: GlobalStyles;
  onStateChange: (newValues: Partial<GlobalStyles>) => void;
  language: Language;
  theme: AppTheme;
}

export const GlobalStylesControl: React.FC<GlobalStylesControlProps> = ({ state, onStateChange, language, theme }) => {
  const handleStrokeChange = (key: string, value: any) => {
    onStateChange({ textStroke: { ...state.textStroke, [key]: value } });
  };
  
  return (
    <div className={`${theme.classes.controlPanel.sectionBg} p-4 rounded-xl`}>
      <div className={`flex justify-between items-center mb-4`}>
        <h2 className={`text-xl font-semibold ${theme.classes.controlPanel.sectionTitle}`}>{language === 'id' ? 'Gaya Global' : 'Global Styles'}</h2>
        <button
          onClick={() => onStateChange({ locked: !state.locked })}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={state.locked ? "Unlock Global Styles" : "Lock Global Styles"}
        >
          {state.locked ? <LockClosedIcon /> : <LockOpenIcon />}
        </button>
      </div>
      
      <fieldset disabled={state.locked} className="space-y-4 disabled:opacity-50">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">{language === 'id' ? 'Jenis Huruf' : 'Font Family'}</label>
          <select
            value={state.fontFamily}
            onChange={(e) => onStateChange({ fontFamily: e.target.value })}
            className={`w-full ${theme.classes.input.bg} ${theme.classes.input.text} p-2 rounded-lg border ${theme.classes.input.border} focus:outline-none focus:ring-2 ${theme.classes.input.focusRing}`}
          >
            {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
        </div>

        <Slider
          label={language === 'id' ? 'Ukuran Font Dasar' : 'Base Font Size'}
          min={12}
          max={80}
          value={state.baseFontSize || 32}
          onChange={(e) => onStateChange({ baseFontSize: Number(e.target.value) })}
          theme={theme}
        />

        <ColorPicker
          label={language === 'id' ? 'Warna Teks' : 'Text Color'}
          color={state.textColor}
          onChange={(e) => onStateChange({ textColor: e.target.value })}
          theme={theme}
        />

        <ColorPicker
          label={language === 'id' ? 'Warna Latar' : 'Background Color'}
          color={state.previewBackground}
          onChange={(e) => onStateChange({ previewBackground: e.target.value })}
          theme={theme}
        />

        <div className={`pt-3 border-t ${theme.classes.headerBorder}/50`}>
          <Toggle
            label={language === 'id' ? 'Garis Teks' : 'Text Stroke'}
            enabled={state.textStroke.enabled}
            onChange={(enabled) => handleStrokeChange('enabled', enabled)}
            theme={theme}
          />
          {state.textStroke.enabled && (
            <div className="pl-6 space-y-4 mt-2">
              <ColorPicker
                label={language === 'id' ? 'Warna Garis' : 'Stroke Color'}
                color={state.textStroke.color}
                onChange={(e) => handleStrokeChange('color', e.target.value)}
                theme={theme}
              />
              <Slider
                label={language === 'id' ? 'Ukuran Garis' : 'Stroke Size'}
                min={0}
                max={10}
                step={0.5}
                value={state.textStroke.size}
                onChange={(e) => handleStrokeChange('size', Number(e.target.value))}
                theme={theme}
              />
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};