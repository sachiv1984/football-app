// src/components/common/PWAInstallPrompt.tsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebkit = 'standalone' in window.navigator && (window.navigator as any).standalone;
    setIsInstalled(isInStandalone || isInWebkit);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if not installed
      if (!isInstalled) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Download className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install Football App</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get faster access and offline features by installing our app on your device.
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="btn btn-primary btn-sm"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm text-gray-500"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
