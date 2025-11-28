import React, { useRef, useState } from 'react';
import { Photo, FilterType } from '../types';
import { Download, Share2, Palette, Twitter, Facebook, Link as LinkIcon, DownloadCloud, Scissors } from 'lucide-react';

interface PhotoStripProps {
  photos: Photo[];
  caption?: string;
}

const FILTERS: { id: FilterType; name: string; css: string; icon: string }[] = [
  { id: 'normal', name: 'Original', css: 'none', icon: '🎨' },
  { id: 'bw', name: 'Noir', css: 'grayscale(100%) contrast(110%)', icon: '⚫' },
  { id: 'sepia', name: 'Antique', css: 'sepia(100%) brightness(95%)', icon: '📜' },
  { id: 'vintage', name: 'Retro 90s', css: 'sepia(40%) contrast(120%) saturate(150%) brightness(95%)', icon: '📼' },
  { id: 'cat', name: 'Soft Cat', css: 'brightness(115%) contrast(90%) saturate(130%) hue-rotate(-5deg)', icon: '😺' },
  { id: 'chad', name: 'Giga', css: 'grayscale(100%) contrast(150%) brightness(85%) sharpen(2px)', icon: '🗿' },
];

const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, caption }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal');
  const [isGenerating, setIsGenerating] = useState(false);

  const getFilterStyle = (filterId: FilterType) => {
    return FILTERS.find(f => f.id === filterId)?.css || 'none';
  };

  // Helper to draw the strip to a canvas for downloading as a single image
  const generateStripCanvas = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const photoWidth = 600;
      const photoHeight = 450; // 4:3 Aspect Ratio assumption
      const padding = 40;
      const headerHeight = 120;
      const footerHeight = 100;
      const spacing = 20;
      
      const totalHeight = headerHeight + (photos.length * (photoHeight + spacing)) + footerHeight;
      
      canvas.width = photoWidth + (padding * 2);
      canvas.height = totalHeight;

      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }

      // Background
      ctx.fillStyle = '#f4f4f5'; // zinc-100
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Text
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.font = 'bold 40px "Courier Prime", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GEMINI BOOTH', canvas.width / 2, 70);
      
      ctx.fillStyle = '#71717a'; // zinc-500
      ctx.font = '20px "Courier Prime", monospace';
      ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, 100);

      // Load and Draw Photos
      let loadedCount = 0;
      const filterCss = getFilterStyle(activeFilter);

      photos.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
          const yPos = headerHeight + (index * (photoHeight + spacing));
          
          // Draw Photo Background (Frame)
          ctx.fillStyle = '#18181b';
          ctx.fillRect(padding - 5, yPos - 5, photoWidth + 10, photoHeight + 10);

          // Apply Filter Logic (Simulated for Canvas)
          ctx.save();
          if (activeFilter === 'bw' || activeFilter === 'chad') {
             ctx.filter = 'grayscale(100%) contrast(120%)';
          } else if (activeFilter === 'sepia') {
             ctx.filter = 'sepia(100%)';
          } else if (activeFilter === 'vintage') {
             ctx.filter = 'sepia(40%) contrast(120%) saturate(150%)';
          } else if (activeFilter === 'cat') {
             ctx.filter = 'brightness(115%) contrast(90%) saturate(130%)';
          }
          
          // Draw Image
          ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
          ctx.restore();

          loadedCount++;
          if (loadedCount === photos.length) {
            // Draw Caption
            if (caption) {
                ctx.fillStyle = '#18181b';
                ctx.font = 'italic 24px "Inter", sans-serif';
                ctx.fillText(`"${caption}"`, canvas.width / 2, totalHeight - 50);
            }

            // Draw Footer decoration
            ctx.beginPath();
            ctx.arc(canvas.width / 2, totalHeight - 30, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = '#d4d4d8';
            ctx.lineWidth = 2;
            ctx.stroke();

            resolve(canvas.toDataURL('image/jpeg', 0.9));
          }
        };
        img.src = photo.dataUrl;
      });
    });
  };

  const handleDownloadStrip = async () => {
    setIsGenerating(true);
    try {
        const dataUrl = await generateStripCanvas();
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `gemini-strip-${Date.now()}.jpg`;
        link.click();
    } catch (e) {
        console.error(e);
        alert("Failed to generate strip.");
    }
    setIsGenerating(false);
  };

  const handleDownloadSingle = async (photo: Photo) => {
    // We create a temporary canvas to apply the filter before downloading
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if(ctx) {
            // Apply current filter CSS mapping to canvas context filter
            // Note: Not all CSS filters map 1:1 to Canvas API, but basic ones do in modern browsers
            // For robust cross-browser, we'd manipulate pixels, but ctx.filter works in most modern ones.
            ctx.filter = getFilterStyle(activeFilter); 
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.download = `photo-${photo.id}.jpg`;
            link.click();
        }
    };
    img.src = photo.dataUrl;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
        const dataUrl = await generateStripCanvas();
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'photo-strip.jpg', { type: 'image/jpeg' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'My AI Photo Booth Strip',
                text: 'Check out these photos I took with Gemini Booth!',
                files: [file],
            });
        } else {
            // Fallback
            alert("Web Share API not supported on this device. You can download the image instead.");
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
    setIsGenerating(false);
  };

  if (photos.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Filter Toolbar */}
      <div className="w-full mb-8 bg-zinc-900/80 p-4 rounded-xl backdrop-blur-sm border border-zinc-800">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Select Filter
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex flex-col items-center gap-2 min-w-[70px] p-2 rounded-lg transition-all ${
                        activeFilter === filter.id 
                        ? 'bg-rose-600 text-white scale-105 shadow-lg shadow-rose-600/20' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                >
                    <span className="text-2xl" role="img" aria-label={filter.name}>{filter.icon}</span>
                    <span className="text-[10px] font-bold">{filter.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* The Strip */}
      <div 
        className="relative bg-zinc-100 p-4 shadow-2xl transition-all duration-500 max-w-sm mx-auto"
        style={{ minWidth: '320px' }}
      >
        {/* Strip Header */}
        <div className="text-center mb-4">
          <h2 className="font-mono-retro text-2xl font-bold text-zinc-900 tracking-widest uppercase">
            Gemini Booth
          </h2>
          <p className="text-xs text-zinc-500 font-mono-retro">{new Date().toLocaleDateString()}</p>
        </div>

        {/* Photos */}
        <div className="space-y-4">
            {photos.map((photo, index) => (
            <div key={photo.id} className="group relative bg-zinc-900 p-1 shadow-inner">
                <img 
                    src={photo.dataUrl} 
                    alt={`Snap ${index + 1}`} 
                    className="w-full h-auto transition-all duration-300"
                    style={{ filter: getFilterStyle(activeFilter) }}
                />
                
                {/* Individual Download Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => handleDownloadSingle(photo)}
                        className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                        title="Download this photo"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
            ))}
        </div>

        {/* Caption Area */}
        <div className="mt-6 mb-2 text-center min-h-[40px] flex items-center justify-center">
            <p className="font-handwriting text-zinc-800 text-lg italic font-mono-retro leading-tight px-4">
                {caption ? `"${caption}"` : "..."}
            </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
             <div className="inline-block w-8 h-8 rounded-full border-2 border-zinc-300"></div>
             <p className="text-[10px] text-zinc-400 mt-1">THE FINEST QUALITY</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
        <button 
            onClick={handleDownloadStrip}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-white text-zinc-900 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
            {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900"></div> : <DownloadCloud className="w-4 h-4" />}
            Save Strip
        </button>

        <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
            <Share2 className="w-4 h-4" />
            Share
        </button>
      </div>

      {/* Social Links Fallback */}
      <div className="mt-6 flex gap-4">
        <a 
            href={`https://twitter.com/intent/tweet?text=Created%20with%20Gemini%20Photo%20Booth!`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 transition-colors"
        >
            <Twitter className="w-5 h-5" />
        </a>
        <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-zinc-700 transition-colors"
        >
            <Facebook className="w-5 h-5" />
        </a>
        <button 
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
            }}
            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
            <LinkIcon className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default PhotoStrip;