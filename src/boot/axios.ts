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

const api = axios.create({ baseURL: getEffectiveBackendBaseUrl() });
registerAxiosBaseUrlSync(api);

export default defineBoot(({ app }) => {

  app.config.globalProperties.$axios = axios;

  app.config.globalProperties.$api = api;
});

export { api };
