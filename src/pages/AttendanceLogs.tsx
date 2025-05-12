import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../zustandStore/store';
import { stopAllCameras } from '../utils/stopAllCameras';
import { Filter, Info } from 'lucide-react';

interface AttendanceEntry {
  id: string;
  timestamp: string | number | Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

interface AttendanceLog {
  name: string;
  log_type: 'IN' | 'OUT';
  time: string;
  latitude: number;
  longitude: number;
  custom_attendance_status?: 'Approved' | 'Rejected' | 'In Process' | 'Submitted';
  custom_reason?: string;
  checkin_image?: string;
}

const AttendanceLogs: React.FC = () => {
  const { logs, logsLoading, logsError, fetchLogs, statusFilter, setStatusFilter } = useStore();
  // Type assertion for logs array
  const typedLogs = logs as AttendanceLog[];
  const attendances: AttendanceEntry[] = useStore((state: any) => state.attendances || []);
  const lastFive = attendances.slice(-5).reverse();
  const [visibleReasonId, setVisibleReasonId] = useState<string | null>(null);
  
  // Function to toggle the visibility of a reason tooltip
  const toggleReasonTooltip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setVisibleReasonId(visibleReasonId === id ? null : id);
  };
  
  // Function to close the tooltip when clicking anywhere on the screen
  useEffect(() => {
    const handleClickOutside = () => {
      if (visibleReasonId) {
        setVisibleReasonId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visibleReasonId]);

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
        case 'Submitted':
          return 'bg-gray-200'; // Grey background for Submitted status
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
    if (!typedLogs.length) return [];
    
    // Sort all logs by time (newest first) and take the first 10
    return [...typedLogs]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [typedLogs]);

  return (
    <div className="max-w-lg mx-auto py-4 mb-10">
      {/* Custom CSS for tooltip */}
      <style>
        {`
          .tooltip {
            position: absolute;
            top: -5px;
            right: 10px;
            background-color: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 10;
            max-width: 250px;
            font-size: 12px;
            color: #4a5568;
          }
          .reason-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#5E5E5E]" style={{ fontFamily: 'Montserrat' }}>Attendance Logs</h2>
        <div className="flex items-center space-x-1 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-500" />
          <select
            onChange={handleStatusChange}
            value={statusFilter}
            className="p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Rubik' }}
          >
            <option value="-">View All</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="In Process">In Process</option>
            <option value="Submitted">Submitted</option>
          </select>
        </div>
      </div>
      {logsLoading ? (
        <div className="text-gray-500 text-center py-4 font-medium">Loading...</div>
      ) : logsError ? (
        <div className=" text-center py-6 font-semibold text-[21px] text-red-500" style={{ fontFamily: 'Rubik' }}>No logs found</div>
      ) : latestEntries.length === 0 && lastFive.length === 0 ? (
        <div className="text-gray-500 text-center py-4 font-medium">No attendance records found.</div>
      ) : (
        <ul className="space-y-4">
          {latestEntries.length > 0
            ? latestEntries.map((entry) => (
                <li 
                  key={entry.name} 
                  className={`${getBgColorClass(entry)} rounded-lg shadow-2xl p-4 mb-2 flex flex-col relative`} 
                  style={{ fontFamily: 'Rubik' }}
                >
                  {/* Info icons for all status types */}
                  {entry.custom_attendance_status && (
                    <>
                      <div className="reason-icon" onClick={(e) => toggleReasonTooltip(entry.name, e)}>
                        <Info size={18} color="#4a5568" />
                      </div>
                      {visibleReasonId === entry.name && (
                        <div className="tooltip mt-2">
                          {entry.custom_attendance_status === 'Submitted' 
                            ? "Contact admin, to upload your photo in portal" 
                            : (entry.custom_reason || entry.custom_attendance_status)}
                        </div>
                      )}
                    </>
                  )}
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
                          style={{ maxWidth: 350, maxHeight: 310 }} 
                        />
                      )}
                    </>
                  )}
                </li>
              ))
            : lastFive.map((entry: AttendanceEntry) => (
                <li key={entry.id} className="bg-green-200 rounded-lg shadow-2xl p-4 flex flex-col relative" style={{ fontFamily: 'Rubik' }}>
                  {/* For fallback entries, we don't have custom reasons */}
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
