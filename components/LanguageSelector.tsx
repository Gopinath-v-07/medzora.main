import React from 'react';
import { SUPPORTED_LANGUAGES, getCurrentAppLanguage, changeAppLanguage } from '../utils/translation';

interface LanguageSelectorProps {
    id?: string;
    className?: string;
    // Optional props for controlled usage during Signup without triggering a full page reload instantly
    value?: string;
    onChange?: (code: string) => void;
    // Determines if changing the select actively reloads the translation cookie (e.g. true for Sidebar, false for Signup form state)
    autoTranslateOnSelect?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    id,
    className = '',
    value,
    onChange,
    autoTranslateOnSelect = true
}) => {
    const currentValue = value !== undefined ? value : getCurrentAppLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLangCode = e.target.value;
        if (onChange) {
            onChange(newLangCode);
        }
        if (autoTranslateOnSelect) {
            changeAppLanguage(newLangCode);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <select
                id={id}
                value={currentValue}
                onChange={handleChange}
                className="appearance-none w-full bg-white/10 backdrop-blur-sm border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 pr-8 transition-colors outline-none cursor-pointer hover:bg-white/50"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                        {lang.label}
                    </option>
                ))}
            </select>
            {/* Custom dropdown arrow to replace default browser arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m1 1 4 4 4-4" />
                </svg>
            </div>
        </div>
    );
};
