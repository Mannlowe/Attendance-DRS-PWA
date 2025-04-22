import React, { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useStore } from '../zustandStore/store';
import { fetchAttendanceLogs, AttendanceLog } from '../api/APIattendancelogs';
import { stopAllCameras } from '../utils/stopAllCameras';

interface AttendanceEntry {
  id: string;
  timestamp: string | number | Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

const AttendanceLogs: React.FC = () => {
  const { logs, logsLoading, logsError, fetchLogs } = useStore();
  const attendances: AttendanceEntry[] = useStore((state: any) => state.attendances || []);
  const lastFive = attendances.slice(-5).reverse();

  useEffect(() => {
    stopAllCameras();
    const employee = localStorage.getItem('employee_id') || '';
    fetchLogs(employee);
  }, [fetchLogs]);

  // Get the latest 10 entries (both check-ins and check-outs) in chronological order
  const latestEntries = useMemo(() => {
    if (!logs.length) return [];
    
    // Sort all logs by time (newest first) and take the first 10
    return [...logs]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [logs]);

  return (
    <div className="max-w-lg mx-auto py-4 mb-10">
      <h2 className="text-xl font-semibold mb-4 text-[#5E5E5E]" style={{ fontFamily: 'Montserrat' }}>Attendance Logs</h2>
      {logsLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : logsError ? (
        <div className="text-red-600">{logsError}</div>
      ) : latestEntries.length === 0 && lastFive.length === 0 ? (
        <div className="text-gray-500">No attendance records found.</div>
      ) : (
        <ul className="space-y-4">
          {latestEntries.length > 0
            ? latestEntries.map((entry) => (
                <li 
                  key={entry.name} 
                  className={`${entry.log_type === 'OUT' ? 'bg-red-200' : 'bg-green-200'} rounded-lg shadow-2xl p-4 mb-2 flex flex-col`} 
                  style={{ fontFamily: 'Rubik' }}
                >
                  {entry.log_type === 'OUT' ? (
                    <span className="font-medium text-[#4135c7]">
                      Check-out Time: {format(new Date(entry.time), 'PPpp')}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium text-[#B4251C]">
                        Check-in Time: {format(new Date(entry.time), 'PPpp')}
                      </span>
                      <span className="text-gray-700">Latitude: {entry.latitude.toFixed(6)}</span>
                      <span className="text-gray-700">Longitude: {entry.longitude.toFixed(6)}</span>
                      
                      {entry.checkin_image && (
                        <img 
                          src={entry.checkin_image.startsWith('/') 
                            ? `${import.meta.env.VITE_API_BASE_URL}${entry.checkin_image}` 
                            : entry.checkin_image
                          } 
                          alt="Check-in" 
                          className="mt-2 rounded shadow" 
                          style={{ maxWidth: 350, maxHeight: 170 }} 
                        />
                      )}
                    </>
                  )}
                </li>
              ))
            : lastFive.map((entry: AttendanceEntry) => (
                <li key={entry.id} className="bg-green-200 rounded-lg shadow-2xl p-4 flex flex-col" style={{ fontFamily: 'Rubik' }}>
                  <span className="font-medium text-blue-700">Check-in Time: {format(new Date(entry.timestamp), 'PPpp')}</span>
                  <span className="text-gray-700">Latitude: {entry.location.latitude.toFixed(6)}</span>
                  <span className="text-gray-700">Longitude: {entry.location.longitude.toFixed(6)}</span>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
};

export default AttendanceLogs;
