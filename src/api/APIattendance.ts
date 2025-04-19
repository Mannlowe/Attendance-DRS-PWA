// attendance.ts
// Handles API requests for employee attendance check-in.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ATTENDANCE_API_URL = `${API_BASE_URL}/api/method/erp_attendance.api.log_employee_checkin`;

export interface AttendanceParams {
  lat: number;
  long: number;
  checkin_image: File | string; // File object or base64 string
}

export interface AttendanceResponse {
  message: string;
  checkin_details: {
    name: string;
    employee: string;
    time: string;
    latitude: number;
    longitude: number;
  };
}

export async function logEmployeeCheckin(params: AttendanceParams): Promise<AttendanceResponse> {
  const formData = new FormData();
  formData.append('lat', params.lat.toString());
  formData.append('long', params.long.toString());
  formData.append('checkin_image', params.checkin_image);

  // Get authentication info from localStorage
  const api_key = localStorage.getItem('api_key') || '';
  const api_secret = localStorage.getItem('api_secret') || '';
  const authHeader = `token ${api_key}:${api_secret}`;

  const response = await axios.post(ATTENDANCE_API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': authHeader,
    },
    withCredentials: true,
  });
  return response.data;
}
