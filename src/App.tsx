import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Leaves from './pages/Leaves';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AttendanceLogs from './pages/AttendanceLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Settings" element={<Layout />}>
          <Route index element={<Settings />} />
          <Route path="leaves" element={<Leaves />} />
        </Route>
        <Route path="/logs" element={<Layout />}>
          <Route index element={<AttendanceLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;