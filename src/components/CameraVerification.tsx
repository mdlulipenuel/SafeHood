import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, RotateCcw, Eye, Shield } from 'lucide-react';
import { cameraVerificationService } from '../utils/cameraVerificationService';
import type { VerificationSession, CameraVerificationResult } from '../utils/cameraVerificationService';

interface CameraVerificationProps {
  userId: string;
  onVerificationComplete: (success: boolean, confidence: number) => void;
  onClose: () => void;
}

const CameraVerification: React.FC<CameraVerificationProps> = ({
  userId,
  onVerificationComplete,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [currentStep, setCurrentStep] = useState<'permission' | 'capture' | 'processing' | 'result'>('permission');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureResult, setCaptureResult] = useState<CameraVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [instructions, setInstructions] = useState<string>('');

  // Initialize camera and session
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        // Check camera permissions
        const permissions = await cameraVerificationService.checkCameraPermissions();
        if (!permissions.granted && !permissions.canRequest) {
          setError('Camera access is required for verification');
          return;
        }

        // Start verification session
        const newSession = await cameraVerificationService.startVerificationSession(userId);
        setSession(newSession);

        if (permissions.granted) {
          await startCamera();
        }
      } catch (err) {
        setError(`Initialization failed: ${err}`);
      }
    };

    initializeVerification();

    return () => {
      stopCamera();
    };
  }, [userId]);

  const startCamera = async () => {
    try {
      const mediaStream = await cameraVerificationService.initializeCamera();
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setCurrentStep('capture');
      setInstructions('Position your face in the center of the frame');
    } catch (err) {
      setError(`Camera start failed: ${err}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    cameraVerificationService.stopCamera();
  };

  const startCountdown = () => {
    setCountdown(3);
    setInstructions('Get ready...');
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          capturePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = async () => {
    if (!session) return;

    try {
      setCurrentStep('processing');
      setInstructions('Processing your photo...');

      const result = await cameraVerificationService.captureVerificationPhoto(session.id);
      setCaptureResult(result);

      // Perform liveness check if face detected
      if (result.faceDetected) {
        setInstructions('Performing liveness check...');
        const livenessResult = await cameraVerificationService.performLivenessCheck(session.id);
        
        const finalSuccess = result.success && livenessResult.passed;
        const finalConfidence = (result.confidence + livenessResult.confidence) / 2;

        setCurrentStep('result');
        setInstructions(
          finalSuccess 
            ? 'Verification successful!' 
            : 'Verification failed. Please try again.'
        );

        setTimeout(() => {
          onVerificationComplete(finalSuccess, finalConfidence);
        }, 2000);
      } else {
        setCurrentStep('result');
        setInstructions('No face detected. Please try again.');
        
        setTimeout(() => {
          if (session.attempts < 3) {
            setCurrentStep('capture');
            setInstructions('Position your face in the center of the frame');
          } else {
            onVerificationComplete(false, 0);
          }
        }, 2000);
      }
    } catch (err) {
      setError(`Capture failed: ${err}`);
      setCurrentStep('result');
    }
  };

  const retryVerification = () => {
    setCaptureResult(null);
    setError(null);
    setCurrentStep('capture');
    setInstructions('Position your face in the center of the frame');
  };

  const renderPermissionStep = () => (
    <div className="text-center">
      <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Camera Permission Required</h3>
      <p className="text-gray-600 mb-6">
        We need access to your camera to verify your identity for security purposes.
      </p>
      <button
        onClick={startCamera}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Allow Camera Access
      </button>
    </div>
  );

  const renderCaptureStep = () => (
    <div className="text-center">
      <div className="relative mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-sm mx-auto rounded-lg border-4 border-blue-500"
        />
        
        {/* Face outline guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 border-2 border-white rounded-full opacity-50"></div>
        </div>

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-6xl font-bold">{countdown}</div>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4">{instructions}</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>Look at camera</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Remove glasses/hat</span>
          </div>
        </div>

        {session && session.attempts < 3 && (
          <button
            onClick={startCountdown}
            disabled={countdown > 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {countdown > 0 ? `${countdown}...` : 'Take Photo'}
          </button>
        )}

        {session && session.attempts > 0 && (
          <p className="text-sm text-orange-600">
            Attempt {session.attempts} of 3
          </p>
        )}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold mb-2">Processing Verification</h3>
      <p className="text-gray-600">{instructions}</p>
    </div>
  );

  const renderResultStep = () => (
    <div className="text-center">
      {captureResult?.success ? (
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      ) : (
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
      )}
      
      <h3 className="text-lg font-semibold mb-2">
        {captureResult?.success ? 'Verification Successful' : 'Verification Failed'}
      </h3>
      
      <p className="text-gray-600 mb-4">{instructions}</p>

      {captureResult && !captureResult.success && session && session.attempts < 3 && (
        <button
          onClick={retryVerification}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Try Again
        </button>
      )}

      <button
        onClick={onClose}
        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {currentStep === 'permission' && renderPermissionStep()}
        {currentStep === 'capture' && renderCaptureStep()}
        {currentStep === 'processing' && renderProcessingStep()}
        {currentStep === 'result' && renderResultStep()}

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          {['permission', 'capture', 'processing', 'result'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                ['permission', 'capture', 'processing', 'result'].indexOf(currentStep) >= index
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CameraVerification;
