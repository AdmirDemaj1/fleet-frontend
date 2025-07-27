import { CheckCircle, Pending, Error } from '@mui/icons-material';
import { StatusConfig } from '../types/customerSidebar.types';

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  active: { 
    color: 'success.main', 
    bgcolor: '#e6f7ed',
    icon: <CheckCircle sx={{ fontSize: 12 }} />
  },
  inactive: { 
    color: 'error.main', 
    bgcolor: '#fce8e8',
    icon: <Error sx={{ fontSize: 12 }} />
  },
  pending: { 
    color: 'warning.main', 
    bgcolor: '#fff4e5',
    icon: <Pending sx={{ fontSize: 12 }} />
  },
};
