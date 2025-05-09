// APILogin.ts
// This file will handle API requests related to login and checkout functionality.

import axios from 'axios';

// Vite exposes env variables via import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const LOGIN_API_URL = `${API_BASE_URL}/api/method/erp_attendance.api.user_login`;
const CHECKOUT_API_URL = `${API_BASE_URL}/api/method/erp_attendance.api.log_employee_checkout`;

// Login-related types
export interface LoginCredentials {
  usr: string;
  pwd: string;
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

// Checkout-related types
export interface CheckoutParams {
  employee_id: string;
  lat?: number;
  long?: number;
}

export interface CheckoutResponse {
  message: string;
  checkin_details: {
    name: string;
    employee: string;
    time: string;
    latitude: number;
    longitude: number;
  };
}

// Login API
export async function loginWithAPI(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await axios.post(LOGIN_API_URL, credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Checkout API
export const checkoutAPI = async (params: CheckoutParams) => {
  const api_key = localStorage.getItem('api_key') || '';
  const api_secret = localStorage.getItem('api_secret') || '';
  const authHeader = `token ${api_key}:${api_secret}`;

  const response = await axios.post(
    CHECKOUT_API_URL,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      }
    }
  );
  return response.data;
};
