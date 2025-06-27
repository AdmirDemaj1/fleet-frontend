import {
    Edit,
    TabbedForm,
    TextInput,
    NumberInput,
    DateInput,
    required,
    Toolbar,
    SaveButton,
    useRedirect,
    useDelete,
    useNotify,
    useRefresh,
} from 'react-admin';
import { Box, Button, } from '@mui/material';

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
                    notify(`Error: ${(error as Error).message}`, { type: 'error' });
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
        <TabbedForm
            toolbar={<VehicleFormToolbar />}
            sanitizeEmptyValues
            warnWhenUnsavedChanges
        >
            <TabbedForm.Tab
                label="Basic Info"
                sx={{ maxWidth: '40em' }}
            >
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <TextInput source="make" label="Make" fullWidth validate={required()} />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <TextInput source="model" label="Model" fullWidth validate={required()} />
                    </Box>
                </Box>
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <TextInput source="license_plate" label="License Plate" fullWidth validate={required()} />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <TextInput source="status" label="Status" fullWidth />
                    </Box>
                </Box>
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <NumberInput source="year" label="Year" fullWidth validate={required()} />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <NumberInput source="mileage" label="Mileage" fullWidth />
                    </Box>
                </Box>
            </TabbedForm.Tab>

            <TabbedForm.Tab
                label="Owner Info"
                sx={{ maxWidth: '40em' }}
            >
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <TextInput source="owner" label="Owner" fullWidth />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <TextInput source="client" label="Client" fullWidth />
                    </Box>
                </Box>
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <TextInput source="color" label="Color" fullWidth />
                    </Box>
                </Box>
            </TabbedForm.Tab>

            <TabbedForm.Tab
                label="Insurance"
                sx={{ maxWidth: '40em' }}
            >
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <TextInput source="insurance" label="Insurance" fullWidth />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <DateInput source="tpl_expiry" label="TPL Expiry" fullWidth />
                    </Box>
                </Box>
                <Box display={{ xs: 'block', sm: 'flex' }} mb={2}>
                    <Box flex={1} mr={{ sm: '0.5em' }}>
                        <DateInput source="kasko_expiry" label="Kasko Expiry" fullWidth />
                    </Box>
                    <Box flex={1} ml={{ sm: '0.5em' }}>
                        <DateInput source="passenger_insurance" label="Passenger Insurance" fullWidth />
                    </Box>
                </Box>
            </TabbedForm.Tab>
        </TabbedForm>
    </Edit>
);