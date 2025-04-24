import React, { useState, useCallback, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useStore } from '../zustandStore/store';
import { logEmployeeCheckin } from '../api/APIattendance';
import { checkoutAPI } from '../api/APILogin'
import { useNavigate } from 'react-router-dom';
import SettingsUI from './SettingsUI';

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

  const navigate = useNavigate();

  // Check for saved attendance data on component mount
  useEffect(() => {
    const savedAttendanceStatus = localStorage.getItem('attendanceStatus');
    const savedAttendanceData = localStorage.getItem('attendanceData');
    
    if (savedAttendanceStatus === 'success' && savedAttendanceData) {
      try {
        const parsedData = JSON.parse(savedAttendanceData);
        // Convert string timestamp back to Date object
        parsedData.timestamp = new Date(parsedData.timestamp);
        setSuccessData(parsedData);
        setShowSuccess(true);
      } catch (error) {
        console.error('Error parsing saved attendance data', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const employee_id = localStorage.getItem('employee_id');
      if (!employee_id) throw new Error('Employee ID missing');
  
      await checkoutAPI({ employee_id }); // pass the params correctly
      
      // Clear attendance status from localStorage
      localStorage.removeItem('attendanceStatus');
      localStorage.removeItem('attendanceData');
  
      sessionStorage.clear(); // cleanup
      navigate('/'); // redirect
    } catch (error) {
      console.error('Checkout failed', error);
      setError('Failed to check out. Please try again.');
    }
  };
  

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
      // Check if attendance was already marked today
      const savedAttendanceStatus = localStorage.getItem('attendanceStatus');
      const savedAttendanceData = localStorage.getItem('attendanceData');
      
      if (savedAttendanceStatus === 'success' && savedAttendanceData) {
        try {
          const parsedData = JSON.parse(savedAttendanceData);
          const savedDate = new Date(parsedData.timestamp);
          const today = new Date();
          
          // If attendance was already marked today, just show the success state without making API call
          if (savedDate.toDateString() === today.toDateString()) {
            parsedData.timestamp = savedDate; // Convert string back to Date
            setSuccessData(parsedData);
            setShowSuccess(true);
            return; // Exit early - no need to make API call again
          }
        } catch (error) {
          console.error('Error parsing saved attendance data', error);
          // Continue with normal flow if there's an error parsing the saved data
        }
      }
      
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
      
      const attendanceData = {
        timestamp: new Date(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        photo,
        apiResponse,
      };
      
      setSuccessData(attendanceData);
      setShowSuccess(true);
      
      // Save attendance status to localStorage
      localStorage.setItem('attendanceStatus', 'success');
      localStorage.setItem('attendanceData', JSON.stringify({
        ...attendanceData,
        timestamp: attendanceData.timestamp.toISOString(), // Convert Date to string for storage
      }));
      
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
    <SettingsUI
      showSuccess={showSuccess}
      successData={successData}
      handleLogout={handleLogout}
      error={error}
      checkLocationAccess={checkLocationAccess}
      cameraReady={cameraReady}
      webcamRef={webcamRef}
      setError={setError}
      setCameraReady={setCameraReady}
      locationStatus={locationStatus}
      loading={loading}
      isReady={isReady}
      capture={capture}
    />
  );
}

export default Settings;