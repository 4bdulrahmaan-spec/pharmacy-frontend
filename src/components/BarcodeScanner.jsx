import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Upload, Camera } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
    const [scanError, setScanError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Initialize the scanner object but don't start it yet
        html5QrCodeRef.current = new Html5Qrcode("reader");

        // Start camera by default
        startCamera();

        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }

            setIsScanning(true);
            setScanError('');

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    stopCamera();
                    onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore transient errors
                }
            );
        } catch (err) {
            console.error("Camera start error:", err);
            setScanError("Failed to start camera. Please ensure permissions are granted.");
            setIsScanning(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop camera:", err);
            }
        }
    };

    const handleFileUpload = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                // Stop camera if scanning
                await stopCamera();
                setScanError('');

                // Scan the uploaded image file
                const decodedText = await html5QrCodeRef.current.scanFile(file, true); // true = show image on UI
                onScanSuccess(decodedText);
            } catch (err) {
                console.error("File scan error:", err);
                setScanError("Could not detect barcode in that image. Try a clearer photo.");
                // If it fails, restart the camera
                startCamera();
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scan Barcode</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center">

                    {/* The container for html5-qrcode video/canvas */}
                    <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-primary-500/30 bg-black min-h-[300px]"></div>

                    {scanError && (
                        <p className="text-center text-sm text-red-500 mt-3 font-medium px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-md w-full">
                            {scanError}
                        </p>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
                        <button
                            onClick={startCamera}
                            disabled={isScanning}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isScanning
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 opacity-70'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Camera className="w-5 h-5" />
                            {isScanning ? 'Camera Active' : 'Restart Camera'}
                        </button>

                        <button
                            onClick={triggerFileInput}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Image
                        </button>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 px-2">
                        Point camera at a barcode, or upload a clear photo of the code if your webcam is blurry.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
