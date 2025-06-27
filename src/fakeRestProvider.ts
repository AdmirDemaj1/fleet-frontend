export const mockData = {
    vehicles: [
        {
            id: 1,
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            status: 'Available',
            mileage: 15000,
        },
        {
            id: 2,
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            license_plate: 'XYZ789',
            status: 'In Service',
            mileage: 20000,
        },
        {
            id: 3,
            make: 'Ford',
            model: 'Focus',
            year: 2021,
            license_plate: 'LMN456',
            status: 'Unavailable',
            mileage: 12000,
        },
        {
            id: 4,
            make: 'Chevrolet',
            model: 'Malibu',
            year: 2018,
            license_plate: 'QRS321',
            status: 'Available',
            mileage: 30000,
        },
    ],
    users: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ],
    invoices: [
        { id: 1, date: '2023-06-01', customer_id: 1, total: 100 },
        { id: 2, date: '2023-06-15', customer_id: 2, total: 200 },
    ],
};