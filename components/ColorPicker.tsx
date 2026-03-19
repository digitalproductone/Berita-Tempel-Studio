import React from 'react';
import type { AppTheme } from '../types';

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  color: string;
  theme: AppTheme;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, theme, ...props }) => {
  return (
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className={`relative w-10 h-10 p-1 bg-transparent border-2 ${theme.classes.input.border} rounded-md`}>
        <input
          type="color"
          value={color}
          {...props}
          className="w-full h-full p-0 border-none rounded-sm cursor-pointer appearance-none bg-transparent"
          style={{'backgroundColor': color}}
        />
      </div>
    </div>
  );
};