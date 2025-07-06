import { useSnackbar, VariantType } from 'notistack';
import { useCallback } from 'react';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = useCallback(
    (message: string, variant: VariantType = 'default') => {
      enqueueSnackbar(message, { variant });
    },
    [enqueueSnackbar]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showNotification(message, 'success');
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string) => {
      showNotification(message, 'error');
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string) => {
      showNotification(message, 'warning');
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string) => {
      showNotification(message, 'info');
    },
    [showNotification]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};