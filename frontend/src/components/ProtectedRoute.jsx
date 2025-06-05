// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';       // або свій експорт з withCredentials: true
import { useNavigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('/api/current-user')    // або будь-який інший захищений /api/ендпоінт
            .then(res => {
                setLoading(false);
            })
            .catch(err => {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                } else {
                    console.error(err);
                    navigate('/login');
                }
            });
    }, [navigate]);

    if (loading) {
        return null; // або спінер «Loading…»
    }
    return <Outlet />;
}
