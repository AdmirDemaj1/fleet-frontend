import * as React from 'react';
import {
    List,
    ColumnsButton,
    TextField,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    useDefaultTitle,
    useListContext,
    DataTable,
    TextInput,
    useRecordContext,
    useRedirect,
} from 'react-admin';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { Box } from '@mui/material';

const listFilters = [
    <TextInput source="make" label="Make" alwaysOn />,
    <TextInput source="model" label="Model" alwaysOn />,
    <TextInput source="year" label="Year" />,
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <ColumnsButton />
        <ExportButton />
        <CreateButton />
    </TopToolbar>
);

const VehiclesTitle = () => {
    const title = useDefaultTitle();
    const { defaultTitle } = useListContext();
    return (
        <>
            <title>{`${title} - ${defaultTitle}`}</title>
            <span>{defaultTitle}</span>
        </>
    );
};

const StatusField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return '#4caf50'; // green
            case 'leased':
                return '#ffd700'; // yellow
            case 'unavailable':
                return '#000000'; // black
            default:
                return '#757575'; // default grey
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <CircleIcon sx={{ 
                color: getStatusColor(record.status),
                fontSize: '20px'
            }} />
         
        </Box>
    );
};

const EditButton = () => {
    const record = useRecordContext(); // Get the current row's record
    const redirect = useRedirect();

    if (!record) return null;

    return (
        <Button

            size="small"
            onClick={() => redirect(`/vehicles/${record.id}`)}
            startIcon={<EditIcon />}
        >
            
        </Button>
    );
};

const VehiclesList = () => (
    <List
        filters={listFilters}
        perPage={25}
        sort={{ field: 'year', order: 'DESC' }}
        actions={<ListActions />}
        title={<VehiclesTitle />}
    >
        <DataTable rowClick={false}>
            <DataTable.Col source="id" label="ID" />
            <DataTable.Col source="make" label="Make" />
            <DataTable.Col source="model" label="Model" />
            <DataTable.Col source="chassis" label="Chassis" /> 
            <DataTable.Col 
                source="status" 
                label="Status"
                render={() => <StatusField />}
            />
            <DataTable.Col source="year" label="Year" />
            <DataTable.Col source="license_plate" label="License Plate" />
            <DataTable.Col source="owner" label="Owner" />
            <DataTable.Col source="client" label="Client" />
            <DataTable.Col label="Edit">
                <EditButton />
            </DataTable.Col>
        </DataTable>
    </List>
);

export default VehiclesList;