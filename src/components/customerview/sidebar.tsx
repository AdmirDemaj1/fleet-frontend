import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
  } from '@mui/material';
  import CheckCircleIcon from '@mui/icons-material/CheckCircle';
  import DriveEtaIcon from '@mui/icons-material/DriveEta';
  import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
  import ScheduleIcon from '@mui/icons-material/Schedule';
  import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
  import PersonIcon from '@mui/icons-material/Person';
  import CreditScoreIcon from '@mui/icons-material/CreditScore';
  
  const Sidebar = () => {
    return (
      <Box
        sx={{
          width: 260,
          height: 'fit-content',
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: 2,
          p: 3,
          m: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Account Number */}
        <Typography variant="body2" color="text.secondary">
          Account ID
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          #362668
        </Typography>
  
        {/* Status and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="body2" color="success.main" fontWeight={500}>
            Active
          </Typography>
        </Box>
  
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body1" fontWeight={600}>
            Ian Rooney
          </Typography>
        </Box>
  
        <Divider sx={{ my: 2 }} />
  
        {/* Business Info */}
        <List dense disablePadding>
          <ListItem disablePadding>
            <ListItemIcon>
              <DriveEtaIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Vehicles Leased: 12" />
          </ListItem>
  
          <ListItem disablePadding>
            <ListItemIcon>
              <ScheduleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Billing: Monthly" />
          </ListItem>
  
          <ListItem disablePadding>
            <ListItemIcon>
              <MonetizationOnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Due: $843.43" />
          </ListItem>
  
          <ListItem disablePadding>
            <ListItemIcon>
              <CreditScoreIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Last Payment: $840.00" />
          </ListItem>
  
          <ListItem disablePadding>
            <ListItemIcon>
              <CalendarTodayIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Start Date: 2025-01-13" />
          </ListItem>
        </List>
      </Box>
    );
  };
  
  export default Sidebar;
  