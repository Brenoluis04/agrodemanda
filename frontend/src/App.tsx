import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import type { User } from './api';
import { AuthContext } from './context/AuthContext';
import { Login } from './pages/Login';
import { Shell } from './layout/Shell';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(() => !!localStorage.getItem('agro_token'));

    // Restaura a sessão a partir do token salvo
    useEffect(() => {
        if (!localStorage.getItem('agro_token')) {
            setLoading(false);
            return;
        }
        api<User>('/auth/me')
            .then(setUser)
            .catch(() => localStorage.removeItem('agro_token'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/*" element={user ? <Shell /> : <Navigate to="/login" replace />} />
            </Routes>
        </AuthContext.Provider>
    );
}