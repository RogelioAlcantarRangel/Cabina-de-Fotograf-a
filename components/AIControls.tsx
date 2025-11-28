import React, { useState } from 'react';
import { Wand2, BrainCircuit, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AspectRatio, Photo } from '../types';
import * as GeminiService from '../services/geminiService';

interface AIControlsProps {
  photos: Photo[];
  onCaptionGenerated: (caption: string) => void;
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

const AIControls: React.FC<AIControlsProps> = ({ photos, onCaptionGenerated }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  
  const [captioning, setCaptioning] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genPrompt, setGenPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');

  // 1. Fast Caption
  const handleGenerateCaption = async () => {
    if (photos.length === 0) return;
    setCaptioning(true);
    const caption = await GeminiService.generatePhotoStripCaption(photos.length);
    onCaptionGenerated(caption);
    setCaptioning(false);
  };

  // 2. Analyze Vibe
  const handleAnalyze = async () => {
    if (photos.length === 0) return;
    setAnalyzing(true);
    // Analyze the first photo as a sample
    const result = await GeminiService.analyzePhotoVibe(photos[0].dataUrl);
    setAnalysisText(result);
    setAnalyzing(false);
  };

  // 3. Generate Image
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPrompt) return;
    setGenerating(true);
    setGeneratedImage(null);
    try {
        const result = await GeminiService.generateCreativeImage(genPrompt, selectedRatio);
        setGeneratedImage(result);
    } catch (err) {
        // Error handled in service, but we clean up loading state
    }
    setGenerating(false);
  };

  if (photos.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-8 text-center border border-zinc-800">
        <SparklesIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500">Take photos to unlock AI Magic features.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 w-full max-w-4xl mx-auto mt-12">
      
      {/* Feature 1: Fast Caption (Gemini 2.5 Flash Lite) */}
      <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-rose-500" />
                    Instant Caption
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Powered by Gemini 2.5 Flash Lite</p>
            </div>
            <button
                onClick={handleGenerateCaption}
                disabled={captioning}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                {captioning ? <Loader2 className="animate-spin w-4 h-4" /> : "Generate"}
            </button>
        </div>
      </section>

      {/* Feature 2: Analyze Vibe (Gemini 3 Pro Preview) */}
      <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-500" />
                    Vibe Check
                </h3>
                <p className="text-sm text-zinc-400 mt-1">What does your photo strip say about you?</p>
            </div>
            <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                {analyzing ? <Loader2 className="animate-spin w-4 h-4" /> : "Analyze"}
            </button>
        </div>
        {analysisText && (
            <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20">
                <p className="text-zinc-200 italic font-mono-retro">"{analysisText}"</p>
            </div>
        )}
      </section>

      {/* Feature 3: Image Generation (Gemini 3 Pro Image Preview) */}
      <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                Creative Studio
            </h3>
            <p className="text-sm text-zinc-400 mt-1">Generate a digital prop or background for your next shoot.</p>
        </div>

        <form onSubmit={handleGenerateImage} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="E.g., A neon-lit cyberpunk street..." 
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                
                <select 
                    value={selectedRatio}
                    onChange={(e) => setSelectedRatio(e.target.value as AspectRatio)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                >
                    {ASPECT_RATIOS.map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                    ))}
                </select>
            </div>
            
            <button 
                type="submit" 
                disabled={generating || !genPrompt}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {generating ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Generating Asset...
                    </>
                ) : "Generate Asset"}
            </button>
        </form>

        {generatedImage && (
            <div className="mt-6">
                <p className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-wider">Generated Result</p>
                <div className="rounded-xl overflow-hidden border-2 border-zinc-700 inline-block">
                    <img src={generatedImage} alt="AI Generated" className="max-h-[400px] w-auto object-contain" />
                </div>
            </div>
        )}
      </section>

    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

export default AIControls;