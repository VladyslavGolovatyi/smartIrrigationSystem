import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ZonesView    from './components/ZonesView';
import ZoneDetail   from './components/ZoneDetail';
import SubzoneDetail from "./components/SubzoneDetail";
import ZoneEdit from "./components/ZoneEdit";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/"          element={<Navigate to="/zones" replace />} />
                <Route path="/zones"     element={<ZonesView />} />
                <Route path="/zones/:id" element={<ZoneDetail />} />
                <Route path="/zones/:zoneId/subzones/:subzoneId" element={<SubzoneDetail />} />
                {/* In your App.jsx or wherever routes live */}
                <Route path="/zones/:id/edit" element={<ZoneEdit />} />
            </Routes>
        </Router>
    );
}
