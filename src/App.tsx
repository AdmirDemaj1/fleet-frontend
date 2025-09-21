import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { store } from './app/store';
import { AppRoutes } from './routes/AppRoutes';
//mport { theme } from './theme';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { AuthProvider } from './features/auth';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <SnackbarProvider maxSnack={3}>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;