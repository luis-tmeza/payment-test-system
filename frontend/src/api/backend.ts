import axios from 'axios';

const readViteEnv = () => {
  try {
    // eslint-disable-next-line no-new-func
    const meta = new Function('return import.meta')() as {
      env?: { VITE_API_BASE_URL?: string };
    };
    return meta?.env?.VITE_API_BASE_URL;
  } catch {
    return undefined;
  }
};

const envBaseUrl =
  (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) ||
  readViteEnv();

export const api = axios.create({
  baseURL: envBaseUrl ?? 'http://localhost:3000',
});
