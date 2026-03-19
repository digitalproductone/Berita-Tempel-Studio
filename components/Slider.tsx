import React from 'react';
import type { AppTheme } from '../types';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  theme: AppTheme;
}

export const Slider: React.FC<SliderProps> = ({ label, value, unit = 'px', theme, ...props }) => {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">{label}</label>
        <span className={`text-[10px] font-mono bg-white/5 text-slate-400 px-1.5 rounded border border-white/5`}>{value}{unit}</span>
      </div>
      <div className="relative h-4 flex items-center">
        <input
            type="range"
            value={value}
            {...props}
            className={`w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer focus:outline-none
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none`}
        />
      </div>
    </div>
  );
};