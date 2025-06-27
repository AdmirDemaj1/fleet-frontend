import * as React from 'react';
import {
    List,
    ColumnsButton,
    DateField,
    TextField,
    TopToolbar,
    ExportButton,
    FilterButton,
    useDefaultTitle,
    useListContext,
    DataTable,
    TextInput,
} from 'react-admin';

// Mock components to replace the removed imports
const VehicleDetails = () => <div>Mock Vehicle Details</div>;

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

const Column = DataTable.Col<any>; // Using `any` as a placeholder type
const ColumnNumber = DataTable.NumberCol<any>;

const VehiclesList = () => (
    <List
        filters={listFilters}
        perPage={25}
        sort={{ field: 'year', order: 'DESC' }}
        actions={<ListActions />}
        title={<VehiclesTitle />}
    >
        <DataTable
            rowClick="expand"
            expand={<VehicleDetails />}
            sx={{
                '& .onlyLarge': {
                    display: { xs: 'none', lg: 'table-cell' },
                },
            }}
        >
            <Column source="id" label="ID" />
            <Column source="make" label="Make" />
            <Column source="model" label="Model" />
            <Column source="year" label="Year" />
            <Column source="license_plate" label="License Plate" />
            <Column source="status" label="Status" />
            <ColumnNumber source="mileage" label="Mileage" className="onlyLarge" />
        </DataTable>
    </List>
);

export default VehiclesList;