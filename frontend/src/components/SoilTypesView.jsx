// src/components/SoilTypesView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SoilTypesView() {
    const [soilTypes, setSoilTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        waitingTime: '', // сюди запишемо waitingTimeBeforeMoistureCheckInMinutes
    });
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        // 1) Отримуємо поточного користувача, далі забираємо роль напряму
        axios
            .get('/api/current-user')
            .then((res) => {
                // Очікуємо, що res.data = { username: "...", role: "MAINTAINER" }
                if (res.data && res.data.role) {
                    setCurrentUserRole(res.data.role);
                } else {
                    setCurrentUserRole(''); // якщо щось не так, залишаємо порожнім
                }
            })
            .catch((err) => {
                console.error('Error fetching current user:', err);
                setCurrentUserRole('');
            });

        // 2) Завантажуємо список SoilType
        axios
            .get('/api/soil-types')
            .then((res) => {
                setSoilTypes(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching soil types:', err);
                setLoading(false);
            });
    }, []);

    const isMaintainerOrAdmin = () => {
        return currentUserRole === 'ROLE_MAINTAINER' || currentUserRole === 'ROLE_ADMIN';
    };

    const resetForm = () => {
        setEditing(null);
        setFormData({ name: '', description: '', waitingTime: '' });
    };

    const handleEditClick = (st) => {
        setEditing(st);
        setFormData({
            name: st.name || '',
            description: st.description || '',
            // поле camelCase з бекенду:
            waitingTime:
                st.waitingTimeBeforeMoistureCheckInMinutes != null
                    ? st.waitingTimeBeforeMoistureCheckInMinutes
                    : '',
        });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this soil type?')) return;
        axios
            .delete(`/api/soil-types/${id}`)
            .then(() => {
                setSoilTypes((prev) => prev.filter((st) => st.id !== id));
            })
            .catch(console.error);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Формуємо payload так, як очікує бекенд
        const payload = {
            name: formData.name,
            description: formData.description,
            waitingTimeBeforeMoistureCheckInMinutes: formData.waitingTime
                ? parseInt(formData.waitingTime, 10)
                : null,
        };
        if (editing) {
            axios
                .put(`/api/soil-types/${editing.id}`, payload)
                .then((res) => {
                    // Замінюємо оновлений запис у списку
                    setSoilTypes((prev) =>
                        prev.map((st) => (st.id === res.data.id ? res.data : st))
                    );
                    resetForm();
                })
                .catch(console.error);
        } else {
            // Якщо editing = null, створюємо новий запис
            axios
                .post('/api/soil-types', payload)
                .then((res) => {
                    setSoilTypes((prev) => [...prev, res.data]);
                    resetForm();
                })
                .catch(console.error);
        }
    };

    if (loading) {
        return <div>Loading soil types…</div>;
    }

    return (
        <div>
            <h3>Soil Types</h3>
            {!isMaintainerOrAdmin() && (
                <small className="text-muted mb-3 d-block">You have read-only access.</small>
            )}

            {isMaintainerOrAdmin() && (
                <form onSubmit={handleFormSubmit} className="mb-4">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Description</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Waiting Time (min)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.waitingTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, waitingTime: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="col-md-3 text-end">
                            <button type="submit" className="btn btn-primary btn-sm me-2">
                                {editing ? 'Save' : 'Create'}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            )}

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Waiting Time (min)</th>
                        {isMaintainerOrAdmin() && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {soilTypes.map((st) => (
                        <tr key={st.id}>
                            <td>{st.name}</td>
                            <td>{st.description}</td>
                            <td>{st.waitingTimeBeforeMoistureCheckInMinutes}</td>
                            {isMaintainerOrAdmin() && (
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => handleEditClick(st)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(st.id)}
                                        style={{ marginTop: '0.2rem' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {soilTypes.length === 0 && (
                        <tr>
                            <td colSpan={isMaintainerOrAdmin() ? 4 : 3} className="text-center">
                                No soil types found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
