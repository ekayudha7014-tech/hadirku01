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
        video: { facingMode: 'user' }, // Front camera preferred
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
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to Base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden relative">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1 hover:bg-blue-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-[3/4] bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
              {error}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 bg-gray-100 flex justify-center items-center gap-4">
            {!error && (
              <button 
                onClick={takePhoto}
                className="h-16 w-16 bg-red-600 rounded-full border-4 border-gray-200 shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
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
