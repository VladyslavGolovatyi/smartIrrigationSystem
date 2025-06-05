// src/components/ZonesView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ZoneSetupModal from './ZoneSetupModal';
import { Link, useNavigate } from 'react-router-dom';

// Icon URLs для червоного і зеленого маркерів
const RED_MARKER_URL =
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const GREEN_MARKER_URL =
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
const SHADOW_URL =
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

// Фіксимо шляхи до іконок за замовчуванням
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: RED_MARKER_URL, // placeholder; ми будемо переоприділяти у кожному маркері
    iconUrl: GREEN_MARKER_URL,
    shadowUrl: SHADOW_URL,
});

// Створюємо окремі екземпляри червоної та зеленої іконок:
const redIcon = new L.Icon({
    iconUrl: RED_MARKER_URL,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
const greenIcon = new L.Icon({
    iconUrl: GREEN_MARKER_URL,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function ZonesView() {
    const [zones, setZones] = useState([]);
    const [view, setView] = useState('map');
    const [setupZone, setSetupZone] = useState(null);
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    // Новий стан: поточний користувач і його ролі
    const [currentUserRoles, setCurrentUserRoles] = useState([]);
    const navigate = useNavigate();

    // Після першого рендеру:
    useEffect(() => {
        // 1) Отримуємо список зон
        axios
            .get('/api/zones')
            .then((res) => {
                setZones(res.data);
                // Якщо знайшли зону без координат — відкриваємо модалку для введення
                const missing = res.data.find((z) => z.latitude == null || z.longitude == null);
                if (missing) setSetupZone(missing);
            })
            .catch(console.error);

        // 2) Отримуємо поточного користувача, щоб дізнатися ролі:
        axios
            .get('/api/current-user')
            .then((res) => {
                console.log('Поточний користувач:', res.data.username, 'Ролі:', res.data.role)
                // Очікуємо, що res.data = { username: "...", roles: ["VIEWER","MAINTAINER", ...] }
                setCurrentUserRoles(res.data.role || []);
            })
            .catch((err) => {
                console.error('Не вдалося завантажити поточного користувача:', err);
                // Якщо не залогінений, редіректимо на сторінку входу
                navigate('/login');
            });
    }, [navigate]);

    const defaultCenter = [49.8397, 24.0297];

    // Відфільтровані зони за назвою (case-insensitive)
    const filteredZones = zones.filter((z) =>
        (z.name ?? '').toLowerCase().includes(filter.trim().toLowerCase())
    );

    // Розрахунок пагінації
    const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
    const paginatedZones = filteredZones.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page < 0 || page >= totalPages) return;
        setCurrentPage(page);
    };

    // Допоміжний метод: чи є в користувача роль MAINTAINER або ADMIN?
    const isAdminOrMaintainer = () => {
        return currentUserRoles.includes('ADMIN') || currentUserRoles.includes('MAINTAINER');
    };

    // Збереження оновлених координат (або інших полів) для зони
    const handleSave = (update) => {
        axios
            .put(`/api/zones/${setupZone.id}`, update)
            .then((res) => {
                setZones((zs) => zs.map((z) => (z.id === res.data.id ? res.data : z)));
                setSetupZone(null);
            })
            .catch(console.error);
    };

    return (
        <>
            <div className="container py-4">
                {/* Верхній рядок: кнопки List/Map + кнопка Settings для ADMIN/MAINTAINER */}
                <div className="d-flex align-items-center mb-3">
                    <div className="btn-group me-3" role="group" aria-label="View toggle">
                        <button
                            type="button"
                            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => {
                                setView('list');
                                setCurrentPage(0);
                            }}
                        >
                            List
                        </button>
                        <button
                            type="button"
                            className={`btn ${view === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setView('map')}
                        >
                            Map
                        </button>
                    </div>

                    {view === 'list' && (
                        <input
                            type="text"
                            placeholder="Filter by name"
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="form-control w-50 me-3"
                        />
                    )}

                    {/* Якщо користувач ADMIN або MAINTAINER, показуємо кнопку Settings */}
                    {isAdminOrMaintainer() && (
                        <Link to="/settings" className="btn btn-secondary ms-auto">
                            Settings
                        </Link>
                    )}
                </div>

                {/* LIST VIEW */}
                {view === 'list' && (
                    <>
                        <div className="row gx-3 gy-3">
                            {filteredZones.length === 0 && zones.length > 0 && (
                                <div className="col-12">
                                    <div className="alert alert-secondary text-center mb-0">
                                        No zones match filter.
                                    </div>
                                </div>
                            )}
                            {zones.length === 0 && (
                                <div className="col-12">
                                    <div className="alert alert-secondary text-center mb-0">
                                        Loading zones…
                                    </div>
                                </div>
                            )}
                            {paginatedZones.map((z) => (
                                <div key={z.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 className="card-title mb-0">{z.name ?? '—'}</h5>
                                                <span
                                                    className={`rounded-circle ${
                                                        z.hasIssues ? 'bg-danger' : 'bg-success'
                                                    } flex-shrink-0`}
                                                    style={{ display: 'inline-block', width: '12px', height: '12px' }}
                                                ></span>
                                            </div>
                                            <div className="mt-auto">
                                                <Link
                                                    to={`/zones/${z.id}`}
                                                    className="text-primary text-decoration-none"
                                                >
                                                    More Info
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <nav className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                            Previous
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(idx)}>
                                                {idx + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </>
                )}

                {/* MAP VIEW */}
                {view === 'map' && (
                    <div className="card shadow-sm">
                        <div style={{ height: '500px' }}>
                            <MapContainer
                                center={
                                    zones.length && zones[0].latitude != null
                                        ? [zones[0].latitude, zones[0].longitude]
                                        : defaultCenter
                                }
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="© OpenStreetMap contributors"
                                />
                                {zones
                                    .filter((z) => z.latitude != null && z.longitude != null)
                                    .map((z) => (
                                        <Marker
                                            key={z.id}
                                            position={[z.latitude, z.longitude]}
                                            icon={z.hasIssues ? redIcon : greenIcon}
                                        >
                                            <Popup>
                                                <span className="fw-semibold">{z.name ?? '—'}</span>
                                                <div className="mt-2">
                                                    <Link to={`/zones/${z.id}`} className="btn btn-sm btn-outline-primary">
                                                        More Info
                                                    </Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Модалка для вводу координат нової зони, якщо setupZone != null */}
            {setupZone && (
                <ZoneSetupModal
                    zone={setupZone}
                    markerCoords={null}
                    onSave={handleSave}
                    onCancel={() => setSetupZone(null)}
                />
            )}
        </>
    );
}
