import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
    required,
    Toolbar,
    SaveButton,
    
    useRedirect
} from 'react-admin';
import { Box, Typography, Button } from '@mui/material';

const VehicleFormToolbar = () => {
    const redirect = useRedirect();
    return (
        <Toolbar>
            <SaveButton />
            <Button onClick={() => redirect('/vehicles')} color="inherit" sx={{ ml: 2 }}>
                Cancel
            </Button>
        </Toolbar>
    );
};

export const VehicleCreate = () => (
    <Create>
        <SimpleForm
            sanitizeEmptyValues
            warnWhenUnsavedChanges
            toolbar={<VehicleFormToolbar />}
        >
            {/* Basic Info */}
            <Typography variant="h6" gutterBottom>Basic Info</Typography>
            <Box display={{ xs: 'block', sm: 'flex' }}>
                <Box flex={1} mr={{ sm: '0.5em' }}>
                    <TextInput source="make" label="Make" fullWidth validate={required()} />
                </Box>
                <Box flex={1} ml={{ sm: '0.5em' }}>
                    <TextInput source="model" label="Model" fullWidth validate={required()} />
                </Box>
            </Box>
            <TextInput source="vin" label="VIN" fullWidth validate={required()} />

            {/* Specifications */}
            <Typography variant="h6" gutterBottom mt={2}>Specifications</Typography>
            <Box display={{ xs: 'block', sm: 'flex' }}>
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
            <Typography variant="h6" gutterBottom mt={2}>Appearance</Typography>
            <Box display={{ xs: 'block', sm: 'flex' }}>
                <Box flex={1} mr={{ sm: '0.5em' }}>
                    <TextInput source="color" label="Color" fullWidth />
                </Box>
                <Box flex={1} ml={{ sm: '0.5em' }}>
                    <NumberInput source="mileage" label="Mileage (km)" fullWidth />
                </Box>
            </Box>
            <TextInput source="image" label="Image URL" fullWidth />
        </SimpleForm>
    </Create>
);
