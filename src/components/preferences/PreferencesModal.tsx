// src/components/preferences/PreferencesModal.tsx
import React, { useState } from 'react';
import { X, Save, RotateCcw, Bell, Eye, Palette, Globe } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'betting' | 'display'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences to default?')) {
      resetPreferences();
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'betting', label: 'Betting', icon: TrendingUp },
    { id: 'display', label: 'Display', icon: Globe },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h3>
                    
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => {
                              updatePreferences({ theme });
                              setHasChanges(true);
                            }}
                            className={`p-3 border rounded-lg text-center transition-colors capitalize ${
                              preferences.theme === theme
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default View */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Default View</label>
                      <select
                        value={preferences.defaultView}
                        onChange={(e) => {
                          updatePreferences({ defaultView: e.target.value as any });
                          setHasChanges(true);
                        }}
                        className="form-select w-full"
                      >
                        <option value="fixtures">Fixtures</option>
                        <option value="table">League Table</option>
                        <option value="stats">Statistics</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(preferences.notifications).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <p className="text-xs text-gray-500">
                              {getNotificationDescription(key)}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => {
                                updatePreferences({
                                  notifications: {
                                    ...preferences.notifications,
                                    [key]: e.target.checked
                                  }
                                });
                                setHasChanges(true);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Betting Tab */}
              {activeTab === 'betting' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Betting Preferences</h3>
                    
                    {/* Minimum Confidence */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Confidence Level: {preferences.betInsights.minConfidence}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={preferences.betInsights.minConfidence}
                        onChange={(e) => {
                          updatePreferences({
                            betInsights: {
                              ...preferences.betInsights,
                              minConfidence: Number(e.target.value)
                            }
                          });
                          setHasChanges(true);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Favorite Markets */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Favorite Markets</label>
                      <div className="grid grid-cols-2 gap-2">
                        {marketOptions.map((market) => (
                          <label key={market.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.betInsights.favoriteMarkets.includes(market.id)}
                              onChange={(e) => {
                                const favoriteMarkets = e.target.checked
                                  ? [...preferences.betInsights.favoriteMarkets, market.id]
                                  : preferences.betInsights.favoriteMarkets.filter(id => id !== market.id);
                                
                                updatePreferences({
                                  betInsights: {
                                    ...preferences.betInsights,
                                    favoriteMarkets
                                  }
                                });
                                setHasChanges(true);
                              }}
                              className="form-checkbox mr-2"
                            />
                            <span className="text-sm text-gray-700">{market.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hide High Risk */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Hide High Risk Bets</label>
                        <p className="text-xs text-gray-500">Hide bets with confidence below 30%</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.betInsights.hideHighRisk}
                          onChange={(e) => {
                            updatePreferences({
                              betInsights: {
                                ...preferences.betInsights,
                                hideHighRisk: e.target.checked
                              }
                            });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Tab */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Timezone */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                        <select
                          value={preferences.display.timezone}
                          onChange={(e) => {
                            updatePreferences({
                              display: { ...preferences.display, timezone: e.target.value }
                            });
                            setHasChanges(true);
                          }}
                          className="form-select w-full"
                        >
                          <option value="Europe/London">London (GMT/BST)</option>
                          <option value="America/New_York">New York (EST/EDT)</option>
                          <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                          <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Date Format</label>
                        <select
                          value={preferences.display.dateFormat}
                          onChange={(e) => {
                            updatePreferences({
                              display: { ...preferences.display, dateFormat: e.target.value as any }
                            });
                            setHasChanges(true);
                          }}
                          className="form-select w-full"
                        >
                          <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                          <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                      </div>

                      {/* Currency */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          value={preferences.display.currency}
                          onChange={(e) => {
                            updatePreferences({
                              display: { ...preferences.display, currency: e.target.value as any }
                            });
                            setHasChanges(true);
                          }}
                          className="form-select w-full"
                        >
                          <option value="GBP">British Pound (£)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>

                      {/* Language */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select
                          value={preferences.display.language}
                          onChange={(e) => {
                            updatePreferences({
                              display: { ...preferences.display, language: e.target.value as any }
                            });
                            setHasChanges(true);
                          }}
                          className="form-select w-full"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="btn btn-ghost text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions and data
const getNotificationDescription = (key: string): string => {
  const descriptions = {
    matchStart: 'Get notified when matches are about to start',
    goals: 'Real-time goal notifications during matches',
    finalResults: 'Match result notifications when games end',
    favoriteTeamResults: 'Special notifications for your favorite teams',
  };
  return descriptions[key as keyof typeof descriptions] || '';
};

const marketOptions = [
  { id: 'match_result', label: 'Match Result (1X2)' },
  { id: 'over_under_goals', label: 'Over/Under Goals' },
  { id: 'both_teams_score', label: 'Both Teams to Score' },
  { id: 'corners', label: 'Corners' },
  { id: 'cards', label: 'Cards' },
  { id: 'first_goal', label: 'First Goal' },
  { id: 'clean_sheet', label: 'Clean Sheet' },
  { id: 'player_goals', label: 'Player Goals' },
];
