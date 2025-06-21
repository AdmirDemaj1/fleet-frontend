import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    IconButton,
    Button,
    Stack,
    Divider,
    Tooltip,
    Paper
  } from '@mui/material';
  import EditIcon from '@mui/icons-material/Edit';
  import AddCircleIcon from '@mui/icons-material/AddCircle';
  import DeleteIcon from '@mui/icons-material/Delete';
  
  const mockContacts = [
    {
      id: 1,
      firstName: 'Elisa',
      lastName: 'Gjika',
      email: 'elisa.gjika@example.com',
      phone: '+355 69 123 4567',
      position: 'Lease Holder',
      address: 'Rruga e Elbasanit, Tirana',
      city: 'Tirana',
      zip: '1001',
      nationality: 'Albanian',
      idNumber: 'ID1234567AL',
      notes: 'Primary signer of lease agreement.',
      image: 'https://source.unsplash.com/100x100/?portrait,woman'
    },
    {
      id: 2,
      firstName: 'Ardit',
      lastName: 'Kola',
      email: 'ardit.kola@example.com',
      phone: '+355 67 987 6543',
      position: 'Secondary Contact',
      address: 'Bulevardi Zogu I, Durrës',
      city: 'Durrës',
      zip: '2001',
      nationality: 'Albanian',
      idNumber: 'ID7654321AL',
      notes: 'Backup contact for payment matters.',
      image: 'https://source.unsplash.com/100x100/?portrait,man'
    }
  ];
  
  const ContactPage = () => {
    const handleRemove = (id: number) => {
      console.log(`Remove contact with ID ${id}`);
    };
  
    return (
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight={600}>
            Account Contacts
          </Typography>
          <Button
            startIcon={<AddCircleIcon />}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
          >
            Add Contact
          </Button>
        </Box>
  
        <Stack spacing={3}>
          {mockContacts.map((contact) => (
            <Paper key={contact.id} elevation={3} sx={{ borderRadius: 3, p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={contact.image}
                    alt={`${contact.firstName} ${contact.lastName}`}
                    sx={{ width: 80, height: 80, boxShadow: 2 }}
                  />
                </Grid>
                <Grid item xs container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" fontWeight={600}>
                      {contact.firstName} {contact.lastName}
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {contact.position}
                    </Typography>
                    <Divider sx={{ my: 1, maxWidth: 200 }} />
                    <Typography variant="body2" color="text.secondary">
                      📧 Email: <strong>{contact.email}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 Phone: <strong>{contact.phone}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🏠 Address: {contact.address}, {contact.city} {contact.zip}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      🌍 Nationality: <strong>{contact.nationality}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🆔 ID Number: <strong>{contact.idNumber}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      📝 Notes:
                      <br />
                      <em>{contact.notes}</em>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item>
                  <Stack direction="column" spacing={1}>
                    <Tooltip title="Edit Contact">
                      <IconButton color="primary" sx={{ bgcolor: '#f0f0f0' }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Contact">
                      <IconButton
                        color="error"
                        sx={{ bgcolor: '#fce4ec' }}
                        onClick={() => handleRemove(contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  };
  
  export default ContactPage;
  