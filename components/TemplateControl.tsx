import React, { useRef } from 'react';
import { Button } from './Button';
import { ExportIcon, ImportIcon, ResetIcon } from './Icons';
import type { Language, AppTheme } from '../types';

interface TemplateControlProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  language: Language;
  theme: AppTheme;
}

export const TemplateControl: React.FC<TemplateControlProps> = ({ onExport, onImport, onReset, language, theme }) => {
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`${theme.classes.controlPanel.sectionBg} p-6 rounded-lg space-y-2`}>
        <h2 className={`text-xl font-semibold border-b ${theme.classes.headerBorder} pb-2 mb-4 ${theme.classes.controlPanel.sectionTitle}`}>{language === 'id' ? 'Mesin Template' : 'Template Engine'}</h2>
        <div className="flex gap-2">
            <input type="file" accept=".json" ref={importRef} onChange={onImport} className="hidden" />
            <Button onClick={() => importRef.current?.click()} fullWidth theme={theme}>
                <ImportIcon /> {language === 'id' ? 'Impor' : 'Import'}
            </Button>
            <Button onClick={onExport} fullWidth theme={theme}>
                <ExportIcon /> {language === 'id' ? 'Ekspor' : 'Export'}
            </Button>
        </div>
        <Button onClick={onReset} fullWidth className={theme.classes.button.danger} theme={theme}>
            <ResetIcon /> {language === 'id' ? 'Atur Ulang Semua' : 'Reset All'}
        </Button>
    </div>
  );
};
