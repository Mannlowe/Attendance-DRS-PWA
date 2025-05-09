import React, { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useStore } from '../zustandStore/store';
import { stopAllCameras } from '../utils/stopAllCameras';
import { Filter } from 'lucide-react';

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
  const { logs, logsLoading, logsError, fetchLogs, statusFilter, setStatusFilter } = useStore();
  const attendances: AttendanceEntry[] = useStore((state: any) => state.attendances || []);
  const lastFive = attendances.slice(-5).reverse();

  useEffect(() => {
    stopAllCameras();
    const employee = localStorage.getItem('employee_id') || '';
    fetchLogs(employee, statusFilter);
  }, [fetchLogs, statusFilter]);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  // Function to determine background color class based on attendance status
  const getBgColorClass = (entry: any) => {
    // First check custom_attendance_status
    if (entry.custom_attendance_status) {
      switch (entry.custom_attendance_status) {
        case 'Approved':
          return 'bg-green-100';
        case 'Rejected':
          return 'bg-red-100';
        case 'In Process':
          return 'bg-yellow-100';
        default:
          // Default coloring based on log_type if status doesn't match
          return entry.log_type === 'OUT' ? 'bg-red-200' : 'bg-green-200';
      }
    }
    
    // Fallback to original coloring if no custom status
    return entry.log_type === 'OUT' ? 'bg-red-200' : 'bg-green-200';
  };

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#5E5E5E]" style={{ fontFamily: 'Montserrat' }}>Attendance Logs</h2>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-500" />
          <select 
            value={statusFilter}
            onChange={handleStatusChange}
            className="text-[12px] border-none focus:ring-0 outline-none bg-transparent"
            style={{ fontFamily: 'Rubik' }}
          >
            <option value="-">View All</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="In Process">In Process</option>
          </select>
        </div>
      </div>
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
                  className={`${getBgColorClass(entry)} rounded-lg shadow-2xl p-4 mb-2 flex flex-col`} 
                  style={{ fontFamily: 'Rubik' }}
                >
                  {entry.log_type === 'OUT' ? (
                    <>
                      <span className="font-medium text-[#4135c7]">
                        Check-out Time: {format(new Date(entry.time), 'PPpp')}
                      </span>
                      {entry.latitude !== undefined && entry.longitude !== undefined && (
                        <>
                          <span className="text-gray-700">Latitude: {entry.latitude.toFixed(6)}</span>
                          <span className="text-gray-700">Longitude: {entry.longitude.toFixed(6)}</span>
                        </>
                      )}
                    </>
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
                          style={{ maxWidth: 350, maxHeight: 230 }} 
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
