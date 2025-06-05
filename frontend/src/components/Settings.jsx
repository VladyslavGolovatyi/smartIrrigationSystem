// src/components/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SettingsPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/current-user')
            .then((res) => {
                setCurrentUser(res.data); // { username: "...", roles: ["MAINTAINER", ...] }
            })
            .catch(() => {
                navigate('/login');
            });
    }, [navigate]);

    if (!currentUser) {
        return <div className="container py-5">Loading...</div>;
    }

    const roles = currentUser.role;
    const isAdmin = roles.includes('ADMIN');
    const isMaintainer = roles.includes('MAINTAINER');

    return (
        <div className="container py-4">
            <div className="d-flex align-items-center mb-4">
                <h2 className="me-auto">Settings</h2>
                {/* Кнопка "Back to Main" */}
                <Link to="/zones" className="btn btn-outline-secondary">
                    &larr; Back to Main
                </Link>
            </div>
            <div className="row">
                <div className="col-md-3">
                    <ul className="nav flex-column nav-pills">
                        <li className="nav-item">
                            <NavLink
                                to="plant-types"
                                className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
                            >
                                Plant Types
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="soil-types"
                                className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
                            >
                                Soil Types
                            </NavLink>
                        </li>
                        {isAdmin && (
                            <li className="nav-item">
                                <NavLink
                                    to="users"
                                    className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
                                >
                                    Users
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="col-md-9">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
