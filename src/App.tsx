import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { store } from './app/store';
import { AppRoutes } from './routes/AppRoutes';
//mport { theme } from './theme';
import { ThemeProvider } from './shared/contexts/ThemeContext';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider maxSnack={3}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;