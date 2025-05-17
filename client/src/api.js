const API_URL = import.meta.env.PROD 
  ? 'https://video-player-s.vercel.app/api'  // Make sure to include /api
  : '/api';

export const fetchWithCredentials = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
};

export const login = async (credentials) => {
  return fetchWithCredentials('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const checkSession = async () => {
  return fetchWithCredentials('/protected');
}; 