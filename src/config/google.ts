// Google Analytics configuration
export const GA_TRACKING_ID = import.meta.env.VITE_GA_ID || '';

// Google Tag Manager configuration
export const GTM_ID = import.meta.env.VITE_GTM_ID || '';

// Google Search Console verification
export const GSC_VERIFICATION_ID = import.meta.env.VITE_GSC_ID || '';

// Google Cloud / OAuth configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GOOGLE_PROJECT_ID = import.meta.env.VITE_GOOGLE_PROJECT_ID || '';

export const isGoogleConfigured = !!(GTM_ID || GA_TRACKING_ID);

/**
 * Initialize Google Services
 * This is a placeholder for any manual initialization logic if not using GTM auto-inject
 */
export const initGoogleServices = () => {
  if (isGoogleConfigured) {
    console.log('Google services initialized');
  }
};
