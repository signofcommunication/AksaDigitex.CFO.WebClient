/**
 * Application Constants
 */

import { getEffectiveBackendBaseUrl } from '@/shared/services/backendApiContract';

export const APP_NAME = 'AksaDigitex CFO';
export const APP_VERSION = '0.0.1';

/**
 * HTTP Constants
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

/**
 * Date Format
 */
export const DATE_FORMATS = {
  DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'DD/MM/YYYY HH:mm:ss',
} as const;

/**
 * Currency
 */
export const CURRENCY = {
  DEFAULT: 'IDR',
  LOCALE: 'id-ID',
} as const;

/**
 * API Configuration (satu sumber kebenaran dengan axios / backendClient;
 * `BASE_URL` memperhitungkan override admin di browser jika ada)
 */
export const API_CONFIG = {
  get BASE_URL(): string {
    return getEffectiveBackendBaseUrl();
  },
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
} as const;

/**
 * Messages
 */
export const MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'An error occurred',
  WARNING: 'Please be cautious',
  INFO: 'Information',
  LOADING: 'Loading...',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
} as const;
