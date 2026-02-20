import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// ngrok tunnel — exposes WSL2 backend to physical device/emulator
const API_URL = __DEV__ 
  ? 'https://bistred-aleen-epistemically.ngrok-free.dev/api'  // ngrok tunnel → WSL2 backend
  : 'https://your-production-url.com/api';  // Production

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Required to bypass ngrok's browser interstitial warning page
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — unwrap backend envelope { success, data, ... } → data
apiClient.interceptors.response.use(
  (response) => {
    // All backend responses are wrapped: { success: bool, data: <payload>, ... }
    // Unwrap so callers receive the payload directly via response.data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }

);

export default apiClient;