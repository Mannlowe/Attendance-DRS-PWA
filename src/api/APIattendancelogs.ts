// APIattendancelogs.ts
// Handles API requests for fetching employee attendance logs.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ATTENDANCE_LOGS_API_URL = `${API_BASE_URL}/api/method/erp_attendance.api.get_employee_checkin_logs`;

export interface AttendanceLogsParams {
  name?: string;
  employee?: string;
  custom_attendance_status?: string;
  limit?: number;
}

export interface AttendanceLog {
  name: string;
  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: number;
  idx: number;
  employee: string;
  employee_name: string;
  log_type: string;
  shift: string | null;
  time: string;
  device_id: string | null;
  skip_auto_attendance: number;
  attendance: string | null;
  shift_start: string | null;
  shift_end: string | null;
  shift_actual_start: string | null;
  shift_actual_end: string | null;
  _user_tags: string | null;
  _comments: string | null;
  _assign: string | null;
  _liked_by: string | null;
  latitude: number;
  longitude: number;
  geolocation: string | null;
  offshift: number;
  custom_attendance_status: string;
  checkin_image: string | null;
}

export interface AttendanceLogsResponse {
  message: string;
  logs: AttendanceLog[];
}

export async function fetchAttendanceLogs(params: AttendanceLogsParams): Promise<AttendanceLogsResponse> {
  const api_key = localStorage.getItem('api_key') || '';
  const api_secret = localStorage.getItem('api_secret') || '';
  const authHeader = `token ${api_key}:${api_secret}`;

  const response = await axios.get(ATTENDANCE_LOGS_API_URL, {
    headers: {
      'Authorization': authHeader,
    },
    params,
    withCredentials: true,
  });
  return response.data;
}
