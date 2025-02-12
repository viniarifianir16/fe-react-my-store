import axios from 'axios';

export const baseUrl = import.meta.env.VITE_APP_HOST;

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] || '',
    ),
  },
});

export const getCsrfToken = async () => {
  await api.get('/sanctum/csrf-cookie');
};

export default api;
