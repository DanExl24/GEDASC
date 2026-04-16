const fallbackApiUrl = 'http://localhost:3000';

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/+$/, '');
export const SOCKET_URL = API_URL;
