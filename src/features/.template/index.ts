/**
 * [FeatureName] Feature
 * Barrel export for cleaner imports
 *
 * Usage:
 * import { FeaturePage, useFeature, featureService } from '@/features/[feature-name]'
 */

// Pages
export { default as FeaturePage } from './pages/FeaturePage.vue';

// Components
export { default as FeatureCard } from './components/FeatureCard.vue';
export { default as FeatureForm } from './components/FeatureForm.vue';

// Composables
export { useFeature, useFeatureForm } from './composables/useFeature';

// Services
export { featureService } from './services/featureService';

// Stores
export { useFeatureStore } from './stores/featureStore';

// Types
export * from './types';
