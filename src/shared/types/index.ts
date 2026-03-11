/**
 * API Error Type
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Pagination Type
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated Response Type
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * API Response Type
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Loading State Type
 */
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

/**
 * Filter Type
 */
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

/**
 * Sort Type
 */
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}
