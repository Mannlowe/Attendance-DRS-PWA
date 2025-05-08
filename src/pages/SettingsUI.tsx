import React from 'react';
import { format } from 'date-fns';
import { Camera, Loader, AlertCircle, MapPin, CheckCircle } from 'lucide-react';
import Webcam from 'react-webcam';

interface SettingsUIProps {
  showSuccess: boolean;
  successData: {
    timestamp: Date;
    latitude: number;
    longitude: number;
    photo: string | null;
    apiResponse: Record<string, unknown>;
  } | null;
  handleLogout: () => void;
  error: string | null;
  checkLocationAccess: () => void;
  cameraReady: boolean;
  webcamRef: React.RefObject<Webcam>;
  setError: (error: string) => void;
  setCameraReady: (ready: boolean) => void;
  locationStatus: 'checking' | 'ready' | 'error';
  loading: boolean;
  isReady: boolean;
  capture: () => void;
}

const SettingsUI: React.FC<SettingsUIProps> = ({
  showSuccess,
  successData,
  handleLogout,
  error,
  checkLocationAccess,
  cameraReady,
  webcamRef,
  setError,
  setCameraReady,
  locationStatus,
  loading,
  isReady,
  capture
}) => {
  const extractFirstNameFromEmail = (email: string | null) => {
    if (!email) return 'User';
    const match = email.match(/([^@]+)/);
    if (!match) return 'User';
    const name = match[0];
    // Split by dots, underscores, or hyphens which are common in email usernames
    const nameParts = name.split(/[._-]/);
    // Capitalize the first letter
    return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  };

  return (
    <div className="space-y-4 mt-16 h-screen">
      {/* --- Attendance Section (only after setup) --- */}
      <div className="space-y-4 -mt-8">
        {!showSuccess && (
          <h2 className="text-xl font-semibold text-[#5E5E5E]" style={{ fontFamily: 'Montserrat' }}>Mark Attendance</h2>
        )}
        {showSuccess && successData && (
          <>
            <div className="text-left mb-4">
              <h3 className="text-[22px] font-medium mb-1" style={{ fontFamily: 'Montserrat' }}>Hello {extractFirstNameFromEmail(localStorage.getItem('email'))}</h3>
              <p className="text-gray-500 font-medium" style={{ fontFamily: 'Montserrat' }}>Today's attendance</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md mb-4 mt-14">
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <p className="text-lg font-medium text-green-600" style={{ fontFamily: 'Montserrat' }}>Attendance successful</p>
                </div>
                <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-2 text-base" style={{ fontFamily: 'Rubik' }}>
                    <div className="text-gray-500 ">Date:</div>
                    <div className="text-right font-medium">{format(new Date(successData.timestamp), 'dd-MM-yyyy')}</div>
                    
                    <div className="text-gray-500">Time:</div>
                    <div className="text-right font-medium">{format(new Date(successData.timestamp), 'hh:mm a')}</div>
                    
                    <div className="text-gray-500">Latitude:</div>
                    <div className="text-right font-medium">{successData.latitude.toFixed(6)}</div>
                    
                    <div className="text-gray-500">Longitude:</div>
                    <div className="text-right font-medium">{successData.longitude.toFixed(6)}</div>
                  </div>
                </div>
                <button
                  className="w-full py-2 px-4 bg-[#B4251C] text-white rounded-lg font-medium text-center"
                  style={{ fontFamily: 'Rubik' }}
                  onClick={handleLogout}
                >
                  CHECK OUT
                </button>
              </div>
            </div>
          </>
        )}
        {/* Hide error and camera sections when success is shown */}
        {!showSuccess && (
          <>
            {error && (
              <div className="rounded-lg p-4 flex items-start space-x-2 bg-red-50 border border-red-200">
                <AlertCircle className="flex-shrink-0 mt-0.5 text-red-500" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-red-800" style={{ fontFamily: 'Rubik' }}>{error}</p>
                  <button
                    onClick={checkLocationAccess}
                    className="mt-3 text-sm font-medium px-3 py-1 rounded-md bg-red-200 text-red-800"
                    style={{ fontFamily: 'Rubik' }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              {cameraReady ? (
                <div className="transform scale-x-[-1]">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                    videoConstraints={{
                      facingMode: "user"
                    }}
                    onUserMediaError={(err: string | DOMException) => {
                      setError('Failed to access camera: ' + (typeof err === 'string' ? err : err.message));
                      setCameraReady(false);
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Initializing camera...</p>
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {locationStatus === 'checking' ? (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center space-x-2">
                    <Loader className="animate-spin" size={16} />
                    <span className="text-sm" style={{ fontFamily: 'Rubik' }}>Getting location...</span>
                  </div>
                ) : locationStatus === 'ready' && !error ? (
                  <div className="bg-green-100 text-[#168B45] px-4 py-2 rounded-full flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span className="text-sm" style={{ fontFamily: 'Rubik' }}>Location verified</span>
                  </div>
                ) : null}
                <button
                  onClick={capture}
                  disabled={loading || !isReady}
                  className="bg-[#B4251C] text-white px-6 py-2 rounded-full flex items-center space-x-2 disabled:bg-[#B4251] disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span style={{ fontFamily: 'Rubik' }}>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      <span style={{ fontFamily: 'Rubik' }}>Take Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <MapPin size={16} />
              <p style={{ fontFamily: 'Rubik' }}>Please ensure you have a clear GPS signal to mark attendance</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsUI;
