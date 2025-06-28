import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { dataProvider } from './dataprovider.ts';
import { Dashboard } from './Dashboard/dashboard';
import invoices from './Invoices';
import Vehicles from './Vehicles';
export const App = () => (
    <Admin dataProvider={dataProvider} dashboard={Dashboard}>
        <Resource name="users" list={ListGuesser} />
        <Resource name="invoices" {...invoices} />
        <Resource name="vehicles" {...Vehicles} />
        
    </Admin>
);