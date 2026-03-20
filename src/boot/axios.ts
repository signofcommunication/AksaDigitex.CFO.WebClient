import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import {
  getEffectiveBackendBaseUrl,
  registerAxiosBaseUrlSync,
} from 'src/shared/services/backendApiContract';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5095',
});

export default defineBoot(({ app }) => {

  app.config.globalProperties.$axios = axios;

  app.config.globalProperties.$api = api;
});

export { api };
