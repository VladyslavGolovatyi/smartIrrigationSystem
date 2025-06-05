import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import ZonesView from './components/ZonesView';
import ZoneDetail from './components/ZoneDetail';
import SubzoneDetail from "./components/SubzoneDetail";
import ZoneEdit from "./components/ZoneEdit";
import 'leaflet/dist/leaflet.css';
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./components/Settings";
import PlantTypesView from "./components/PlantTypesView";
import SoilTypesView from "./components/SoilTypesView";
import UsersView from "./components/UsersView";
import SubZoneEdit from "./components/SubZoneEdit";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/zones" replace/>}/>

                <Route path="/login" element={<Login/>}/>
                <Route element={<ProtectedRoute/>}>
                    <Route path="/zones" element={<ZonesView/>}/>
                    <Route path="/zones/:id" element={<ZoneDetail/>}/>
                    <Route path="/zones/:zoneId/subzones/:subzoneId" element={<SubzoneDetail/>}/>
                    <Route path="/zones/:id/edit" element={<ZoneEdit/>}/>
                    <Route path="/zones/:zoneId/subzones/:subzoneId/edit" element={<SubZoneEdit />} />
                    <Route path="/settings" element={<SettingsPage />}>
                        {/* nested routes */}
                        <Route index element={<div>Select a section from the left menu</div>} />
                        <Route path="plant-types" element={<PlantTypesView />} />
                        <Route path="soil-types" element={<SoilTypesView />} />
                        <Route path="users" element={<UsersView />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}
