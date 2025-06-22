import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Adminnav from './components/mainview/adminnav';
import Sidebar from './components/customerview/sidebar';

import Summary from './pages/customer/summary';
import LogsPage from './pages/customer/logs';
import ContactPage from './pages/customer/contact';
import CommentsPage from './pages/customer/comments';
import ContractsPage from './pages/customer/contracts';

// Placeholder pages
const Activation = () => <div>Activation Page</div>;

const AppContent = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Render Sidebar only for the Summary page */}
        {location.pathname === '/summary' && <Sidebar />}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Summary />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/activation" element={<Activation />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/logs" element={<LogsPage />} />
            {/* Add other routes here */}
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <Adminnav />
      <AppContent />
    </Router>
  );
};

export default App;