// src/components/UsersView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersView() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]); // список ролей для селектора
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        roleId: null,
    });

    useEffect(() => {
        // Завантажуємо список користувачів
        axios
            .get('/api/users')
            .then((res) => {
                setUsers(res.data);
                setLoadingUsers(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingUsers(false);
            });

        // Завантажуємо список ролей
        axios
            .get('/api/roles')
            .then((res) => {
                setRoles(res.data);
                setLoadingRoles(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingRoles(false);
            });
    }, []);

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', roleId: null });
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '', // не показуємо старий пароль
            roleId: user.role.id,
        });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        axios
            .delete(`/api/users/${id}`)
            .then(() => {
                setUsers(users.filter((u) => u.id !== id));
            })
            .catch(console.error);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = {
            username: formData.username,
            passwordHash: formData.password || null,
            role: { id: formData.roleId },
        };

        if (editingUser) {
            axios
                .put(`/api/users/${editingUser.id}`, payload)
                .then((res) => {
                    setUsers(users.map((u) => (u.id === res.data.id ? res.data : u)));
                    resetForm();
                })
                .catch(console.error);
        } else {
            axios
                .post('/api/users', payload)
                .then((res) => {
                    setUsers([...users, res.data]);
                    resetForm();
                })
                .catch(console.error);
        }
    };

    // Показуємо loading, поки хоть один із запитів не завершився
    const stillLoading = loadingUsers || loadingRoles;

    return (
        <div>
            <h3>Users Management</h3>

            {stillLoading && <div>Loading users and roles…</div>}

            {!stillLoading && (
                <>
                    <form onSubmit={handleFormSubmit} className="mb-4">
                        <div className="row g-2 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">
                                    {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    {...(editingUser ? {} : { required: true })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={formData.roleId || ''}
                                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="" disabled>
                                        Select role
                                    </option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2 text-end">
                                <button type="submit" className="btn btn-primary btn-sm">
                                    {editingUser ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.username}</td>
                                    <td>{u.role.name}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-3"
                                            onClick={() => handleEditClick(u)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(u.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
