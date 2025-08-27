import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  useTheme,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Edit,
  Share,
  Print,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ContractResponse } from '../types/contract.types';
import { alpha } from '@mui/material';

interface ContractHeaderProps {
  contract: ContractResponse;
  contractConfig: any;
}

export const ContractHeader: React.FC<ContractHeaderProps> = ({ contract, contractConfig }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 3,
      mb: 4
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            bgcolor: contractConfig.type.color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 3,
            boxShadow: theme.shadows[4]
          }}
        >
          <contractConfig.type.icon sx={{ 
            color: 'white', 
            fontSize: 36
          }} />
        </Box>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: contractConfig.type.color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
              mb: 1,
              letterSpacing: '-0.02em'
            }}
          >
            {contract.contractNumber}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Chip
              icon={<contractConfig.type.icon />}
              label={contractConfig.type.label}
              color={contractConfig.type.color as any}
              variant="filled"
              sx={{ 
                fontWeight: 600,
                '& .MuiChip-icon': { fontSize: 16 }
              }}
            />
            <Chip
              icon={<contractConfig.status.icon />}
              label={contractConfig.status.label}
              color={contractConfig.status.color as any}
              variant={contractConfig.status.color === 'success' ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {contractConfig.type.description}
          </Typography>
        </Box>
      </Box>
      
      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        <Tooltip title="Share Contract">
          <IconButton 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <Share />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print Contract">
          <IconButton 
            sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
            }}
          >
            <Print />
          </IconButton>
        </Tooltip>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/contracts/${contract.id}/edit`)}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          Edit Contract
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 3,
            '&:hover': { boxShadow: 6 }
          }}
        >
          Export PDF
        </Button>
      </Stack>
    </Box>
  );
};
