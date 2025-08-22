// src/components/preferences/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const ThemeToggle: React.FC = () => {
  const { preferences, updatePreferences } = useUserPreferences();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => updatePreferences({ theme: theme.id })}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
            preferences.theme === theme.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <theme.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{theme.label}</span>
        </button>
      ))}
    </div>
  );
};
