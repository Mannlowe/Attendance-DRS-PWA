// APILogin.ts
// This file will handle API requests related to login functionality.

import axios from 'axios';

// Vite exposes env variables via import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LOGIN_API_URL = `${API_BASE_URL}/api/method/erp_attendance.api.user_login`;

export interface LoginCredentials {
  usr: string; // username
  pwd: string; // password
}

export interface LoginResponse {
  message: {
    success_key: number;
    message: string;
    sid: string;
    api_key: string;
    api_secret: string;
    username: string;
    email: string;
    mobile_no: string;
    user_image: string | null;
    employee_id: string;
    base_url: string;
  };
  home_page: string;
  full_name: string;
}

export async function loginWithAPI(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await axios.post(LOGIN_API_URL, credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}
