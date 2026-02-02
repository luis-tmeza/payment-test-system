import axios from 'axios';

const readViteEnv = () => {
  try {
     
    const meta = new Function('return import.meta')() as {
      env?: { VITE_API_BASE_URL?: string };
    };
    return meta?.env?.VITE_API_BASE_URL;
  } catch {
    return undefined;
  }
};

const envBaseUrl = readViteEnv();

export const api = axios.create({
  baseURL: envBaseUrl ?? 'https://payment-test-system-production.up.railway.app',
});
