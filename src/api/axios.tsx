import axios from 'axios';

export const baseUrl = import.meta.env.VITE_APP_HOST;

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCsrfToken = async () => {
  await api.get('/sanctum/csrf-cookie');

  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (!csrfToken) {
    console.error('CSRF token not found in cookies.');
    return null;
  }

  return decodeURIComponent(csrfToken);
};

export default api;
