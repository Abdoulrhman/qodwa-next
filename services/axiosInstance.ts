// src/services/axiosInstance.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_APP_URL}api` || 'http://localhost:3000/api',
  timeout: 10000, // Set a timeout for requests
  headers: {
    'Content-Type': 'application/json',
    // Add any other default headers you want
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can modify the request config before it's sent
    // For example, add an Authorization header
    // config.headers.Authorization = `Bearer your_token_here`;
    return config;
  },
  (error) => {
    // Handle the request error
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);

export default axiosInstance;
