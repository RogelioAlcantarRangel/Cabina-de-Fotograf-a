import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCcw, Download, Sparkles } from 'lucide-react';
import { Photo } from '../types';

interface PhotoBoothProps {
  onPhotosTaken: (photos: Photo[]) => void;
}

const COUNTDOWN_START = 3;
const TOTAL_PHOTOS = 5;

const PhotoBooth: React.FC<PhotoBoothProps> = ({ onPhotosTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photosLeft, setPhotosLeft] = useState(TOTAL_PHOTOS);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string>('');

  // Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: "user" as ConstrainDOMString
        },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
      console.error("Error accessing camera:", err);
      setError(`Could not access camera: ${errorMessage}. Please check browser permissions.`);
    }
  };

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Initial load
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Capture Photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Match canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        // Flip horizontally for mirror effect natural feel
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get Data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          dataUrl,
          timestamp: Date.now(),
        };

        setPhotos(prev => [...prev, newPhoto]);
        setFlash(true);
        setTimeout(() => setFlash(false), 300); // Reset flash
      }
    }
  }, []);

  // Session Logic
  useEffect(() => {
    if (!isSessionActive) return;

    let timer: number;

    const runSequence = async () => {
      if (photosLeft > 0) {
        // Start Countdown
        for (let i = COUNTDOWN_START; i > 0; i--) {
          setCountdown(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setCountdown(null); // Clear countdown text
        capturePhoto();
        setPhotosLeft(prev => prev - 1);
        
        // Brief pause between photos
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      } else {
        // Finished
        setIsSessionActive(false);
        onPhotosTaken(photos);
      }
    };

    runSequence();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionActive, photosLeft]); // Dependency on photosLeft triggers the next loop iteration conceptually

  const startSession = () => {
    setPhotos([]);
    setPhotosLeft(TOTAL_PHOTOS);
    setIsSessionActive(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-800">
      
      {/* Viewport */}
      <div className="relative aspect-[4/3] bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlays */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 text-red-500 p-6 text-center">
            <p>{error}</p>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <span className="text-9xl font-black text-white drop-shadow-lg font-mono-retro animate-bounce">
              {countdown}
            </span>
          </div>
        )}

        {/* Flash Overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white z-50 flash-overlay pointer-events-none" />
        )}

        {/* Status Pills */}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full block"></span>
            LIVE
          </span>
          {isSessionActive && (
            <span className="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              {TOTAL_PHOTOS - photosLeft + 1} / {TOTAL_PHOTOS}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center items-center bg-zinc-900">
        {!isSessionActive ? (
          <button
            onClick={startSession}
            disabled={!!error}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-rose-600 font-mono-retro rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="mr-3 h-6 w-6" />
            START PHOTO BOOTH
            <div className="absolute -inset-3 rounded-full border border-rose-600 opacity-0 transition-opacity group-hover:opacity-100 animate-ping" />
          </button>
        ) : (
           <div className="text-center">
             <p className="text-rose-400 font-mono-retro text-lg animate-pulse">Session in progress...</p>
             <p className="text-zinc-500 text-sm mt-1">Smile for the camera!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default PhotoBooth;