import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  title: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: 'user',
            // Meminta rasio aspek ideal 1:1 jika didukung, namun browser mungkin tetap mengirim 4:3
            aspectRatio: 1 
        }, 
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera. Pastikan izin diberikan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Tentukan ukuran persegi berdasarkan sisi terpendek video
      const size = Math.min(video.videoWidth, video.videoHeight);
      
      // Set ukuran canvas menjadi persegi
      canvas.width = size;
      canvas.height = size;
      
      // Hitung posisi tengah untuk cropping (Center Crop)
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw video frame to canvas dengan cropping
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        // Convert to Base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden relative shadow-2xl">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1 hover:bg-blue-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Container Kamera Persegi (Aspect Square) */}
        <div className="relative w-full aspect-square bg-black overflow-hidden group">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
              {error}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]" // object-cover agar mengisi kotak persegi
            />
          )}
          {/* Guide frame visual */}
          {!error && (
             <div className="absolute inset-0 border-2 border-white/30 pointer-events-none m-4 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
             </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 bg-gray-100 flex justify-center items-center gap-4">
            {!error && (
              <button 
                onClick={takePhoto}
                className="h-16 w-16 bg-red-600 rounded-full border-4 border-gray-200 shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Ambil Foto"
              >
                <Camera className="text-white" size={32} />
              </button>
            )}
             {error && (
               <button 
               onClick={startCamera}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
             >
               <RefreshCw size={18} /> Coba Lagi
             </button>
             )}
        </div>
      </div>
    </div>
  );
};