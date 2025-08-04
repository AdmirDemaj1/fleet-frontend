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
  const apiUrl = import.meta.env.VITE_API_URL;
  const mode = import.meta.env.MODE;
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  
  // Validate required environment variables
  if (!apiUrl) {
    throw new Error(
      'VITE_API_URL environment variable is required. ' +
      'Please check your .env files or Vercel environment variables.'
    );
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
 * Get the API base URL
 */
export const getApiUrl = () => envConfig.apiUrl;