/**
 * [FeatureName] Types
 * Type definitions for the [feature-name] feature
 */

/**
 * Main entity type
 */
export interface FeatureItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Request/Response types
 */
export interface FetchFeatureItemsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFeatureItemRequest {
  name: string;
  description?: string;
}

export interface UpdateFeatureItemRequest {
  name?: string;
  description?: string;
}

/**
 * Feature-specific error types
 */
export interface FeatureError {
  message: string;
  code: string;
  details?: any;
}
