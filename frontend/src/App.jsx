// Componentes UI
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import 'react-photo-view/dist/react-photo-view.css';

// React Router
import { Navigate, Route, Routes } from 'react-router';

// Hooks

// Componentes principales
import { useApp } from './hooks/useApp';
import DashboardLayout from './layout/DashboardLayout';
import LoginPage from './pages/LoginPage';

// Constante de API
const API_URL = '/api';

export default function App() {
    const { token, user } = useApp();

    return (
        <>
            <Routes>
                <Route
                    path="/login"
                    element={
                        !token || !user ? (
                            <LoginPage />
                        ) : (
                            <Navigate to="/cuts" replace />
                        )
                    }
                />
                <Route
                    path="/*"
                    element={
                        token && user ? (
                            <SidebarProvider defaultOpen={false}>
                                <DashboardLayout />
                            </SidebarProvider>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
            <Toaster />
        </>
    );
}
