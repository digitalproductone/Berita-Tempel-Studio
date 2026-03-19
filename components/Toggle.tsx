import React from 'react';
import type { AppTheme } from '../types';

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  theme: AppTheme;
}

export const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange, theme }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`${
          enabled ? theme.classes.toggle.active : theme.classes.toggle.inactive
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};
