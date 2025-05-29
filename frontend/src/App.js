import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ZonesView    from './components/ZonesView';
import ZoneDetail   from './components/ZoneDetail';
import SubzoneDetail from "./components/SubzoneDetail";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"          element={<Navigate to="/zones" replace />} />
                <Route path="/zones"     element={<ZonesView />} />
                <Route path="/zones/:id" element={<ZoneDetail />} />
                <Route path="/zones/:zoneId/subzones/:subzoneId" element={<SubzoneDetail />} />
            </Routes>
        </BrowserRouter>
    );
}
