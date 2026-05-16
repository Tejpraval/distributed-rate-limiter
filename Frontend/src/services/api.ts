import axios from 'axios';

// Centralized Axios client for the application
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Vite proxy or direct URL for production
    withCredentials: true, // Crucial for sending HttpOnly cookies (JWT)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor for centralized error handling
api.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response.data; // We already formatted everything as { success, data, message } in backend
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        const message = error.response?.data?.message || 'An unexpected error occurred';
        
        // Centralized unauthorized handling
        if (error.response?.status === 401) {
            // Optional: trigger a logout action or redirect to login page
            // e.g. window.location.href = '/login';
        }

        // Return a normalized error object
        return Promise.reject({
            status: error.response?.status || 500,
            message,
            raw: error
        });
    }
);

export default api;
