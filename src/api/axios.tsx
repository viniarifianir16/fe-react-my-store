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
  try {
    await api.get(`/sanctum/csrf-cookie`);
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies.');
    }

    return decodeURIComponent(csrfToken);
  } catch (error) {
    console.error('Error fetching CSRF cookie:', error);
    return null;
  }
};

export default api;
