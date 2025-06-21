import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Chip,
    Link,
    TextField,
    MenuItem,
    InputAdornment,
    Stack,
    Divider,
    Tabs,
    Tab
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import { useState } from 'react';
  
  const mockContracts = [
    {
      id: 'C001',
      status: 'Active',
      customer: { name: 'John Doe', id: 'U123', contact: 'john@example.com' },
      vehicle: {
        id: 'V001',
        name: 'Volkswagen Golf',
        plate: 'AA123ZZ',
        vin: 'WVWZZZ1KZAW000001',
        image: '',
        engine: '1.6 TDI',
        fuel: 'Diesel',
        transmission: 'Automatic',
        color: 'White',
        mileage: '18,000 km'
      },
      leaseStart: '2024-01-01',
      leaseEnd: '2025-01-01',
      contractUrl: '/contracts/golf.pdf'
    },
    {
      id: 'C002',
      status: 'Expired',
      customer: { name: 'Elisa Green', id: 'U456', contact: 'elisa@example.com' },
      vehicle: {
        id: 'V002',
        name: 'Hyundai Tucson',
        plate: 'AB456CD',
        vin: 'KMHJ381ABFU100123',
        image: '',
        engine: '2.0 CRDi',
        fuel: 'Diesel',
        transmission: 'Manual',
        color: 'Black',
        mileage: '32,500 km'
      },
      leaseStart: '2022-06-15',
      leaseEnd: '2023-06-15',
      contractUrl: '/contracts/tucson.pdf'
    }
  ];
  
  const ContractsPage = () => {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState(0);
  
    const handleTabChange = (_: any, newValue: number) => {
      setTab(newValue);
    };
  
    const filteredContracts = mockContracts.filter(c => {
      const matchesTab = tab === 0 ? c.status === 'Active' : c.status === 'Expired';
      const vehicleMatch = c.vehicle.name.toLowerCase().includes(search.toLowerCase()) || c.vehicle.plate.includes(search) || c.vehicle.vin.includes(search);
      const customerMatch = c.customer.name.toLowerCase().includes(search.toLowerCase()) || c.customer.id.includes(search);
      return matchesTab && (vehicleMatch || customerMatch);
    });
  
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Lease Contracts
        </Typography>
  
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Current Contracts" />
          <Tab label="Expired Contracts" />
        </Tabs>
  
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by vehicle, VIN, or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
  
        <Stack spacing={3}>
          {filteredContracts.map((contract) => (
            <Card key={contract.id} sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <CardMedia
                    component="img"
                    image={contract.vehicle.image || 'https://via.placeholder.com/120x80?text=Vehicle'}
                    alt={contract.vehicle.name}
                    sx={{ width: 120, height: 80, borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contract ID: {contract.id} | Vehicle ID: {contract.vehicle.id}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {contract.vehicle.name} ({contract.vehicle.plate})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    VIN: {contract.vehicle.vin}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">Lease: {contract.leaseStart} → {contract.leaseEnd}</Typography>
                      <Typography variant="body2">Mileage: {contract.vehicle.mileage}</Typography>
                      <Typography variant="body2">Fuel: {contract.vehicle.fuel}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2">Transmission: {contract.vehicle.transmission}</Typography>
                      <Typography variant="body2">Engine: {contract.vehicle.engine}</Typography>
                      <Typography variant="body2">Color: {contract.vehicle.color}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <Typography variant="body2">Customer: {contract.customer.name} ({contract.customer.id})</Typography>
                      <Typography variant="body2">Contact: {contract.customer.contact}</Typography>
                      <Typography variant="body2">
                        Contract: <Link href={contract.contractUrl} target="_blank" rel="noopener">View PDF</Link>
                      </Typography>
                      <Chip label={contract.status} color={contract.status === 'Active' ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  };
  
  export default ContractsPage;
  