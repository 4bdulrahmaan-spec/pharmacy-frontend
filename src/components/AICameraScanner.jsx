import { useEffect, useRef, useState } from 'react';
import { X, Camera, BrainCircuit } from 'lucide-react';

const AICameraScanner = ({ onCapture, onClose, isScanning }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraError, setCameraError] = useState('');
    const [stream, setStream] = useState(null);

    useEffect(() => {
        let activeStream = null;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                activeStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setCameraError("Could not access camera. Please check permissions.");
            }
        };

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

                // Freeze frame
                if (videoRef.current.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }

                onCapture(file);
            }
        }, 'image/jpeg', 0.8);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-600" /> AI Camera Scan
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center">
                    <div className="w-full rounded-lg overflow-hidden border-2 border-purple-500/30 bg-black min-h-[300px] relative flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover ${cameraError ? 'hidden' : ''}`}
                        />
                        {cameraError && <Camera className="w-12 h-12 text-gray-500 opacity-50 absolute" />}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {cameraError && (
                        <p className="text-center text-sm text-red-500 mt-3 font-medium px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-md w-full">
                            {cameraError}
                        </p>
                    )}

                    <div className="mt-6 flex justify-center w-full">
                        <button
                            onClick={handleCapture}
                            disabled={isScanning || !!cameraError}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm w-full ${isScanning || !!cameraError
                                    ? 'bg-purple-300 text-white cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            {isScanning ? (
                                <>
                                    <BrainCircuit className="w-5 h-5 animate-pulse" /> Analyzing Image...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5" /> Capture & Scan with AI
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 px-2">
                        Hold the medicine box clearly in view, ensuring the product name and brand are visible, then take a photo.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AICameraScanner;
