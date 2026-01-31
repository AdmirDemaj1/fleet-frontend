import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PenaltyCalculator } from './PenaltyCalculator';
import { Payment } from '../../types/invoice.types';

interface PenaltyCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
}

/**
 * Modal wrapper for the PenaltyCalculator component
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * <Button onClick={() => setOpen(true)}>
 *   Calculate Penalties
 * </Button>
 * 
 * <PenaltyCalculatorModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   payment={payment}
 * />
 * ```
 */
export const PenaltyCalculatorModal: React.FC<PenaltyCalculatorModalProps> = ({
  open,
  onClose,
  payment,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Penalty Calculator
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <PenaltyCalculator payment={payment} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
