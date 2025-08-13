/**
 * Environment configuration utilities
 * Centralizes environment variable access and validation
 */

export interface EnvConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  appVersion: string;
  appName: string;
  enableLogging: boolean;
  tokenStorageKey: string;
  themeStorageKey: string;
  defaultRowsPerPage: number;
  enableDevTools: boolean;
}

/**
 * Validates and returns environment configuration
 * Throws error if required environment variables are missing
 */
export const getEnvConfig = (): EnvConfig => {
  // Check for explicit mode override from environment variable
  const explicitMode = import.meta.env.VITE_MODE;
  console.log("🚀 ~ explicitMode:", explicitMode)
  const mode = "production";

  console.log("🚀 ~ mode:", mode)
  const isDevelopment = false;
  const isProduction = mode === 'production';
  
  // Determine API URL based on mode
  let apiUrl: string;
  if (isDevelopment) {
    apiUrl = 'http://localhost:3000/';
  } else if (isProduction) {
    apiUrl = 'https://fleet-credit-system-oxtz.vercel.app/';
  } else {
    // Fallback for other modes (like preview)
    apiUrl = import.meta.env.VITE_API_URL || 'https://fleet-credit-system-oxtz.vercel.app/';
  }

  return {
    apiUrl,
    isDevelopment,
    isProduction,
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    appName: import.meta.env.VITE_APP_NAME || 'Fleet Management System',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true' || isDevelopment,
    tokenStorageKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'authToken',
    themeStorageKey: import.meta.env.VITE_THEME_STORAGE_KEY || 'themeMode',
    defaultRowsPerPage: parseInt(import.meta.env.VITE_DEFAULT_ROWS_PER_PAGE || '25'),
    enableDevTools: import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === 'true' || isDevelopment,
  };
};

/**
 * Environment configuration instance
 * Use this throughout your app instead of directly accessing import.meta.env
 */
export const envConfig = getEnvConfig();

/**
 * Utility to check if we're in development mode
 */
export const isDev = envConfig.isDevelopment;

/**
 * Utility to check if we're in production mode
 */
export const isProd = envConfig.isProduction;

/**
 * Get the API base URL based on current mode
 */
export const getApiUrl = () => envConfig.apiUrl;