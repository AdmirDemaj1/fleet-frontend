import { EuriborRateSource, EuriborTenor } from '../types/euribor.types';

/**
 * Get user-friendly display name for Euribor rate source
 */
export const getRateSourceDisplayName = (source: EuriborRateSource): string => {
  const displayNames = {
    [EuriborRateSource.ECB]: 'ECB',
    [EuriborRateSource.BLOOMBERG]: 'Bloomberg',
    [EuriborRateSource.REUTERS]: 'Reuters', 
    [EuriborRateSource.MANUAL]: 'Manual',
    [EuriborRateSource.API]: 'API'
  };
  return displayNames[source] || source;
};

/**
 * Get user-friendly display name for Euribor tenor
 */
export const getTenorDisplayName = (tenor: EuriborTenor): string => {
  const displayNames = {
    [EuriborTenor.ONE_WEEK]: '1 Week',
    [EuriborTenor.ONE_MONTH]: '1 Month',
    [EuriborTenor.THREE_MONTHS]: '3 Months',
    [EuriborTenor.SIX_MONTHS]: '6 Months',
    [EuriborTenor.TWELVE_MONTHS]: '12 Months'
  };
  return displayNames[tenor] || tenor;
};

/**
 * Format rate as percentage
 */
export const formatRateAsPercentage = (rate: number, decimals: number = 4): string => {
  return (rate * 100).toFixed(decimals) + '%';
};

/**
 * Get color for tenor display
 */
export const getTenorColor = (tenor: EuriborTenor): string => {
  const colors = {
    [EuriborTenor.ONE_WEEK]: 'primary',
    [EuriborTenor.ONE_MONTH]: 'secondary',
    [EuriborTenor.THREE_MONTHS]: 'info',
    [EuriborTenor.SIX_MONTHS]: 'warning',
    [EuriborTenor.TWELVE_MONTHS]: 'error'
  };
  return colors[tenor] || 'default';
};

/**
 * Check if a rate is from today
 */
export const isRateFromToday = (rateDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const rateDateOnly = new Date(rateDate).toISOString().split('T')[0];
  return rateDateOnly === today;
};

/**
 * Check if a rate is recent (within last 3 business days)
 */
export const isRateRecent = (rateDate: string): boolean => {
  const today = new Date();
  const rateDateTime = new Date(rateDate);
  const diffTime = today.getTime() - rateDateTime.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Consider recent if within 5 days (accounts for weekends)
  return diffDays <= 5;
};

/**
 * Get rate status based on date
 */
export const getRateStatus = (rateDate: string): 'current' | 'recent' | 'outdated' => {
  if (isRateFromToday(rateDate)) {
    return 'current';
  } else if (isRateRecent(rateDate)) {
    return 'recent';
  } else {
    return 'outdated';
  }
};

/**
 * Get status color for rate based on how recent it is
 */
export const getRateStatusColor = (rateDate: string): string => {
  const status = getRateStatus(rateDate);
  switch (status) {
    case 'current':
      return 'success';
    case 'recent':
      return 'warning';
    case 'outdated':
      return 'error';
    default:
      return 'default';
  }
};
