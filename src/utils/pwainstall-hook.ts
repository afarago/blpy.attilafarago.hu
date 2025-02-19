import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useBeforeInstallPrompt = () => {
    const [deferredInstallPrompt, setDeferredInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
            beforeInstallPromptEvent.preventDefault(); // Prevent the default prompt
            setDeferredInstallPrompt(beforeInstallPromptEvent); // Store the event for later use
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt(); // Show the browser's install prompt
            const { outcome } = await deferredInstallPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            setDeferredInstallPrompt(null); // Reset the prompt
        }
    };

    return { deferredInstallPrompt, handleInstallClick };
};
