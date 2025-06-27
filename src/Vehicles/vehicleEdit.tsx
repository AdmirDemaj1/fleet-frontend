import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
    required,
    Toolbar,
    SaveButton,
    useRedirect,
    useDelete,
    useNotify,
    useRefresh,
} from 'react-admin';
import { Box, Typography, Button, Divider } from '@mui/material';

const VehicleFormToolbar = ({ record }: { record?: any }) => {
    const redirect = useRedirect();
    const [deleteOne, { isLoading }] = useDelete();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleDelete = () => {
        if (!record) {
            console.error('No record found');
            
        }
        deleteOne(
            'vehicles', // Resource name
            { id: record.id }, // Record ID
            {
                onSuccess: () => {
                    notify('Vehicle deleted successfully', { type: 'success' });
                    redirect('/vehicles');
                    refresh();
                },
                onError: (error) => {
                    notify(`Error: ${error.message}`, { type: 'error' });
                },
            }
        );
    };

    return (
        <Toolbar>
            <SaveButton />
            <Button
                onClick={() => redirect('/vehicles')}
                color="inherit"
                sx={{ ml: 2 }}
            >
                Cancel
            </Button>
            <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                sx={{ ml: 2 }}
                disabled={isLoading}
            >
                Remove
            </Button>
        </Toolbar>
    );
};

export const VehicleEdit = () => (
    <Edit>
        <SimpleForm
            sanitizeEmptyValues
            warnWhenUnsavedChanges
            toolbar={<VehicleFormToolbar />}
        >
            {/* Basic Info */}
            <Typography variant="h5" gutterBottom>
                Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                <Box flex={1} mr={{ sm: '0.5em' }}>
                    <TextInput source="make" label="Make" fullWidth validate={required()} />
                </Box>
                <Box flex={1} ml={{ sm: '0.5em' }}>
                    <TextInput source="model" label="Model" fullWidth validate={required()} />
                </Box>
            </Box>
            <TextInput source="vin" label="VIN" fullWidth validate={required()} />

            {/* Specifications */}
            <Typography variant="h5" gutterBottom mt={4}>
                Specifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                <Box flex={1} mr={{ sm: '0.5em' }}>
                    <NumberInput source="year" label="Year" fullWidth validate={required()} />
                </Box>
                <Box flex={1} ml={{ sm: '0.5em' }}>
                    <TextInput source="engine" label="Engine Type" fullWidth />
                </Box>
            </Box>
            <SelectInput
                source="transmission"
                label="Transmission"
                choices={[
                    { id: 'manual', name: 'Manual' },
                    { id: 'automatic', name: 'Automatic' },
                ]}
                fullWidth
                validate={required()}
            />
            <SelectInput
                source="fuel"
                label="Fuel Type"
                choices={[
                    { id: 'gasoline', name: 'Gasoline' },
                    { id: 'diesel', name: 'Diesel' },
                    { id: 'electric', name: 'Electric' },
                    { id: 'hybrid', name: 'Hybrid' },
                ]}
                fullWidth
            />

            {/* Appearance */}
            <Typography variant="h5" gutterBottom mt={4}>
                Appearance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                <Box flex={1} mr={{ sm: '0.5em' }}>
                    <TextInput source="color" label="Color" fullWidth />
                </Box>
                <Box flex={1} ml={{ sm: '0.5em' }}>
                    <NumberInput source="mileage" label="Mileage (km)" fullWidth />
                </Box>
            </Box>
            <TextInput source="image" label="Image URL" fullWidth />
        </SimpleForm>
    </Edit>
);