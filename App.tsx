import React, { useState, useRef, useEffect } from 'react';
import PhotoBooth from './components/PhotoBooth';
import PhotoStrip from './components/PhotoStrip';
import AIControls from './components/AIControls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useToast } from './components/Toast';
import { Photo } from './types';
import { Camera, ChevronDown, Trash2 } from 'lucide-react';
import { saveSession, loadSession, clearSession, hasStoredSession } from './services/storageService';

const AppContent: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stripCaption, setStripCaption] = useState<string>('');
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const { toasts, addToast, removeToast, ToastContainer } = useToast();
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // Restaurar sesión guardada al montar
  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession) {
      setPhotos(savedSession.photos);
      setStripCaption(savedSession.caption);
      setHasRestoredSession(true);
    }
  }, []);

  // Guardar sesión cuando fotos o caption cambien
  useEffect(() => {
    if (photos.length > 0) {
      saveSession(photos, stripCaption);
    }
  }, [photos, stripCaption]);

  const handlePhotosTaken = (capturedPhotos: Photo[]) => {
    setPhotos(capturedPhotos);
    // Smooth scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleCaptionGenerated = (caption: string) => {
    setStripCaption(caption);
  };

  const handleCaptionError = (error: string) => {
    addToast(error, 'error', 6000);
  };

  const handleClearSession = () => {
    if (confirm('¿Descartar sesión actual? Esta acción no se puede deshacer.')) {
      setPhotos([]);
      setStripCaption('');
      clearSession();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      <ToastContainer />
      
      {/* Header */}
      <header className="py-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-mono-retro tracking-tighter">
              FLASHBOOTH<span className="text-rose-600">.AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {hasStoredSession() && photos.length > 0 && (
              <button
                onClick={handleClearSession}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors"
                title="Limpiar sesión actual"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            {hasRestoredSession && (
              <span className="text-xs text-zinc-500 hidden sm:inline">Sesión restaurada</span>
            )}
            <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block">
              Powered by Gemini
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-12 space-y-24">
        
        {/* Section 1: The Booth */}
        <section className="flex flex-col items-center gap-8">
            <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
                    Capture the Moment.
                </h2>
                <p className="text-zinc-400 text-lg">
                    Step into the digital booth. Take 5 snaps. Get instant AI magic.
                </p>
            </div>

            <div className="w-full">
                <PhotoBooth onPhotosTaken={handlePhotosTaken} />
            </div>

            <div className="animate-bounce mt-10 text-zinc-600">
                <ChevronDown className="w-8 h-8" />
            </div>
        </section>

        {/* Section 2: The Strip & AI Features */}
        <div ref={resultsRef} className={`transition-opacity duration-1000 ${photos.length > 0 ? 'opacity-100' : 'opacity-30 pointer-events-none grayscale'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left: The Photo Strip */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="sticky top-32">
                        <div className="mb-6 text-center lg:text-left">
                            <h3 className="text-2xl font-bold font-mono-retro text-rose-500 mb-2">YOUR STRIP</h3>
                            <p className="text-zinc-500 text-sm">Ready to download</p>
                        </div>
                        <PhotoStrip photos={photos} caption={stripCaption} />
                    </div>
                </div>

                {/* Right: AI Controls */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold mb-4">Enhance with Gemini</h3>
                        <p className="text-zinc-400">
                            Use the power of Google's Gemini models to analyze your photos, write witty captions, or generate creative assets for your memories.
                        </p>
                    </div>
                    
                    <AIControls 
                      photos={photos} 
                      onCaptionGenerated={handleCaptionGenerated}
                      onError={handleCaptionError}
                    />
                </div>
            </div>
        </div>

      </main>

      <footer className="py-12 text-center text-zinc-600 text-sm font-mono-retro mt-24 border-t border-zinc-900">
        <p>© {new Date().getFullYear()} FLASHBOOTH.AI • SIMULATED PHOTO BOOTH EXPERIENCE</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;