import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Link,
    Grid,
    Chip,
    Paper,
    Stack,
    Divider
  } from '@mui/material';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
  
  const mockVehicles = [
    {
      id: 1,
      name: 'Volkswagen Golf',
      plate: 'AA123ZZ',
      vin: 'WVWZZZ1KZAW000001',
      leasePeriod: '2024-01-01 to 2025-01-01',
      mileage: '18,000 km',
      status: 'Active',
      image: 'https://source.unsplash.com/100x100/?car,golf',
      contractUrl: '/contracts/golf.pdf',
      engine: '1.6 TDI',
      fuel: 'Diesel',
      transmission: 'Automatic',
      color: 'White',
    },
    {
      id: 2,
      name: 'Hyundai Tucson',
      plate: 'AB456CD',
      vin: 'KMHJ381ABFU100123',
      leasePeriod: '2023-06-15 to 2026-06-15',
      mileage: '32,500 km',
      status: 'In Maintenance',
      image: 'https://source.unsplash.com/100x100/?car,tucson',
      contractUrl: '/contracts/tucson.pdf',
      engine: '2.0 CRDi',
      fuel: 'Diesel',
      transmission: 'Manual',
      color: 'Black',
    },
  ];
  
  const mockComments = [
    {
      id: 1,
      admin: 'John D.',
      date: '2025-06-20 14:35',
      content: 'Reviewed contract terms with the customer and updated vehicle status.'
    },
    {
      id: 2,
      admin: 'Elisa G.',
      date: '2025-06-18 09:20',
      content: 'Called to remind about upcoming payment. Customer confirmed awareness.'
    }
  ];
  
  const SummaryPage = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Vehicle Lease Summary
        </Typography>
  
        {mockVehicles.map((vehicle) => (
          <Accordion key={vehicle.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <DirectionsCarFilledIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {vehicle.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color="text.secondary" fontWeight={500}>
                    ID: {vehicle.id}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
  
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    variant="rounded"
                    src={vehicle.image}
                    sx={{ width: 100, height: 100 }}
                  />
                </Grid>
  
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Name:</strong> {vehicle.name}
                  </Typography>
                  <Typography>
                    <strong>Plate:</strong> {vehicle.plate}
                  </Typography>
                  <Typography>
                    <strong>VIN:</strong> {vehicle.vin}
                  </Typography>
                  <Typography>
                    <strong>Lease Period:</strong> {vehicle.leasePeriod}
                  </Typography>
                  <Typography>
                    <strong>Mileage:</strong> {vehicle.mileage}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Engine:</strong> {vehicle.engine}
                  </Typography>
                  <Typography>
                    <strong>Fuel Type:</strong> {vehicle.fuel}
                  </Typography>
                  <Typography>
                    <strong>Transmission:</strong> {vehicle.transmission}
                  </Typography>
                  <Typography>
                    <strong>Color:</strong> {vehicle.color}
                  </Typography>
                </Grid>
  
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography>
                    <strong>Contract:</strong>{' '}
                    <Link href={vehicle.contractUrl} target="_blank" rel="noopener">
                      View Contract
                    </Link>
                  </Typography>
                  <Chip
                    label={vehicle.status}
                    color={vehicle.status === 'Active' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
  
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Admin Comments
          </Typography>
          <Stack spacing={3}>
            {mockComments.map((comment) => (
              <Paper key={comment.id} sx={{ p: 3, borderRadius: 3 }} elevation={1}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Avatar>{comment.admin[0]}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{comment.admin}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comment.date}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" color="text.primary">
                  {comment.content}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };
  
  export default SummaryPage;
  