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

// Custom Edit Button Component
const EditButton = () => {
    const record = useRecordContext(); // Get the current row's record
    const redirect = useRedirect();

    if (!record) return null;

    return (
        <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => redirect(`/vehicles/${record.id}`)}
        >
            Edit
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
        <DataTable
            rowClick={false}
            sx={{
                '& .onlyLarge': {  display: { xs: 'none', lg: 'table-cell' },},
            }}
        >
            <DataTable.Col source="id" label="ID" />
            <DataTable.Col source="make" label="Make" />
            <DataTable.Col source="model" label="Model" />
            <DataTable.Col source="year" label="Year" />
            <DataTable.Col source="license_plate" label="License Plate" />
            <DataTable.Col source="status" label="Status" />
            <DataTable.NumberCol source="mileage" label="Mileage" className="onlyLarge" />
            <DataTable.Col label="Actions">
                <EditButton />
            </DataTable.Col>
        </DataTable>
    </List>
);

export default VehiclesList;