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
    const res = await api.get(`/sanctum/csrf-cookie`);
    console.log('CSRF Cookie Set:', res);
  } catch (error) {
    console.error('Error fetching CSRF cookie:', error);
    return null;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (!csrfToken) {
    throw new Error('CSRF token not found in cookies.');
  }

  console.log('CSRF Token:', csrfToken);

  return decodeURIComponent(csrfToken);
};

export default api;
