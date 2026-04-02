import axios from 'axios';

// Backend URL (Namma FastAPI run aagura address)
// Pazhaya code:
// const API_URL = "http://localhost:8000";

// Pudhu code:
const API_URL = "https://vouchtrack-backend.onrender.com";

const api = axios.create({
    baseURL: API_URL,
});

// User login panna apram token-ah headers-la add panna idhu help pannum
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;