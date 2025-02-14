/// <reference types="vite/client" />
import axios from 'axios';

const baseUrl = import.meta.env.VITE_APP_HOST;

const api = axios.create({
  baseURL: baseUrl,
});

export default api;
