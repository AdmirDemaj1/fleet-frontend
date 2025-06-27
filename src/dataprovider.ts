import fakeRestProvider from 'ra-data-fakerest';
import { mockData } from './fakeRestProvider';

export const dataProvider = fakeRestProvider(mockData);