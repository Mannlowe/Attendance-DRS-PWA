import React, { useState, useCallback, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Loader, AlertCircle, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../zustandStore/store';
import { format } from 'date-fns';
import { logEmployeeCheckin } from '../api/APIattendance';

function Settings() {
  // --- Attendance Section State & Logic ---
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const addAttendance = useStore((state) => state.addAttendance);
  const fetchLogs = useStore((state) => state.fetchLogs);
  const locationCheckAttemptsRef = useRef(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    timestamp: Date;
    latitude: number;
    longitude: number;
    photo: string | null;
    apiResponse: any;
  } | null>(null);

  // Utility: Wait for first available position or timeout
  const getBestEffortLocation = async (timeoutMs = 10000) => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      let settled = false;
      const onSuccess = (pos: GeolocationPosition) => {
        if (!settled) {
          settled = true;
          navigator.geolocation.clearWatch(watchId);
          resolve(pos);
        }
      };
      const onError = (err: GeolocationPositionError) => {
        if (!settled) {
          settled = true;
          navigator.geolocation.clearWatch(watchId);
          reject(err);
        }
      };
      const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0
      });
      setTimeout(() => {
        if (!settled) {
          settled = true;
          navigator.geolocation.clearWatch(watchId);
          reject(new Error('Location timeout'));
        }
      }, timeoutMs);
    });
  };

  const checkLocationAccess = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Location services are not supported in your browser');
      return;
    }
    const maxAttempts = 2;
    locationCheckAttemptsRef.current += 1;
    try {
      setLocationStatus('checking');
      setError(null);
      const position = await getBestEffortLocation(8000); // 8 seconds
      setLocationAccuracy(position.coords.accuracy);
      setLocationStatus('ready');
      setError(null);
      locationCheckAttemptsRef.current = 0;
    } catch (err) {
      if (locationCheckAttemptsRef.current < maxAttempts) {
        setTimeout(() => checkLocationAccess(), 2000);
        return;
      }
      setLocationStatus('error');
      setError('Could not get your location. Please try again or check your device/location settings.');
    }
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in your browser');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setCameraReady(true);
        setError(null);
      })
      .catch((err) => {
        setError('Camera access denied. Please enable camera permissions in your browser settings');
        console.error('Camera access error:', err);
      });
    checkLocationAccess();
    return () => {
      const stream = webcamRef.current?.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [checkLocationAccess]);

  const getLocation = async (): Promise<GeolocationPosition> => {
    // Try best effort location; show user the accuracy
    return getBestEffortLocation(8000);
  };

  const capture = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!webcamRef.current) {
        throw new Error('Camera is not initialized');
      }
      const position = await getLocation();
      setLocationAccuracy(position.coords.accuracy);
      const photo = webcamRef.current.getScreenshot();
      if (!photo) {
        throw new Error('Failed to capture photo');
      }
      // Call attendance API
      const employee_id = localStorage.getItem('employee_id');
      if (!employee_id) throw new Error('Employee ID not found. Please log in again.');
      // Convert base64 to blob
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], 'checkin_image.png', { type: blob.type });
      const apiResponse = await logEmployeeCheckin({
        lat: position.coords.latitude,
        long: position.coords.longitude,
        checkin_image: file,
      });
      // Optionally add to local store
      addAttendance({
        id: Date.now().toString(),
        timestamp: new Date(),
        photo,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        apiResponse,
      });
      setSuccessData({
        timestamp: new Date(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        photo,
        apiResponse,
      });
      setShowSuccess(true);
      const employee = localStorage.getItem('employee_id') || '';
      await fetchLogs(employee);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark attendance';
      setError(errorMessage);
      setLocationStatus('error');
      console.error('Attendance error:', error);
    } finally {
      setLoading(false);
    }
  }, [addAttendance, fetchLogs]);

  const isReady = cameraReady && locationStatus === 'ready' && !error;

  return (
    <div className="space-y-4">
      {/* --- Attendance Section (only after setup) --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>Mark Attendance</h2>
        {showSuccess && successData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2 mb-2">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-1" style={{ fontFamily: 'Rubik' }}>Attendance marked successfully!</p>
              <div className="text-sm text-gray-800 gap-3 font-light" style={{ fontFamily: 'Rubik' }}>
                <div>Check-in Time: {format(new Date(successData.timestamp), 'PPpp')}</div>
                <div>Latitude: {successData.latitude.toFixed(6)}</div>
                <div>Longitude: {successData.longitude.toFixed(6)}</div>
                {/* {locationAccuracy && <div>Accuracy: {locationAccuracy.toFixed(0)} meters</div>} */}
                {/* {successData.photo && (
                  <div>
                    <span>Captured Image URL: </span>
                    <a href={successData.photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                      {successData.photo.length > 60
                        ? `${successData.photo.slice(0, 40)}...${successData.photo.slice(-8)}`
                        : successData.photo}
                    </a>
                  </div>
                )} */}
              </div>
              {/* <button
                className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </button> */}
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={checkLocationAccess}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {/* Hide this section once attendance is successful */}
        {!showSuccess && (
          <>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              {cameraReady ? (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                  onUserMediaError={(err) => {
                    setError('Failed to access camera: ' + err.message);
                    setCameraReady(false);
                  }}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Initializing camera...</p>
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {locationStatus === 'checking' ? (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center space-x-2">
                    <Loader className="animate-spin" size={16} />
                    <span className="text-sm">Getting location...</span>
                  </div>
                ) : locationStatus === 'ready' && !error ? (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Location verified</span>
                  </div>
                ) : null}
                <button
                  onClick={capture}
                  disabled={loading || !isReady}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center space-x-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      <span>Take Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <MapPin size={16} />
              <p>Please ensure you have a clear GPS signal to mark attendance</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Settings;