// PWA Install Prompt Component with shadcn/ui modals in French

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';


interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Detect iOS devices
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window?.MSStream;
        setIsIOS(isIOSDevice);

        // Handle beforeinstallprompt for Android
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowModal(true);
        };

        // Show iOS prompt if not in standalone mode
        if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            setShowModal(true);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
               toast.success("Application installée avec succès !");
            }
            setDeferredPrompt(null);
            setShowModal(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isIOS ? "Installer l'application" : "Ajouter à l'écran d'accueil"}
                    </DialogTitle>
                    <DialogDescription>
                        {isIOS ? (
                            <>
                                Pour installer cette application sur votre iPhone/iPad :
                                <ol className="list-decimal pl-5 mt-2">
                                    <li>
                                        Appuyez sur le bouton <strong>Partager</strong> dans Safari.
                                    </li>
                                    <li>
                                        Sélectionnez <strong>Ajouter à l'écran d'accueil</strong>.
                                    </li>
                                    <li>Confirmez en appuyant sur <strong>Ajouter</strong>.</li>
                                </ol>
                            </>
                        ) : (
                            "Installez notre application pour une expérience optimale et un accès rapide depuis votre écran d'accueil."
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {isIOS ? (
                        <Button variant="outline" onClick={handleClose}>
                            Fermer
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Annuler
                            </Button>
                            <Button onClick={handleInstallClick}>Installer</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InstallPrompt;