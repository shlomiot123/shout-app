import { Platform } from 'react-native';

// iOS Simulator → localhost, Android Emulator → 10.0.2.2
// Physical device → replace with your Mac's local IP (e.g. 192.168.1.x)
export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

// Ephemeral session (resets on app restart; fine for MVP)
export const SESSION = Math.random().toString(36).slice(2) + Date.now().toString(36);

const headers = () => ({
  'Content-Type': 'application/json',
  'x-session': SESSION,
});

export const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`, { headers: headers() }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    }),

  post: (path, body = {}) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    }),
};
