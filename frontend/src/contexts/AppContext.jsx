import axios from 'axios';
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';

export const AppContext = createContext();
const API_URL = '/api';
const api = axios.create({ baseURL: API_URL });

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? Date.now() >= payload.exp * 1000 : false;
    } catch {
        return true;
    }
};

export function AppProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [clients, setClients] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [cuts, setCuts] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingBarbers, setLoadingBarbers] = useState(false);
    const [loadingCuts, setLoadingCuts] = useState(false);

    const sessionExpiredRef = useRef(false);

    // --- Session Management ---
    const clearSession = useCallback((showToast = true) => {
        setToken('');
        setUser(null);
        setClients([]);
        setBarbers([]);
        setCuts([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionExpiredRef.current = false;
        if (showToast) toast('Sesión cerrada');
    }, []);

    const handleSessionExpired = useCallback(() => {
        if (!sessionExpiredRef.current) {
            sessionExpiredRef.current = true;
            clearSession(false);
            toast.error('Sesión expirada. Inicie sesión nuevamente.');
        }
    }, [clearSession]);

    // Verificar expiración de token en inicialización y cambios
    useEffect(() => {
        if (token && isTokenExpired(token)) {
            handleSessionExpired();
        }
    }, [token, handleSessionExpired]);

    // --- Axios: token attach/interceptors ---
    useEffect(() => {
        const req = api.interceptors.request.use(
            (config) => {
                if (token) config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => Promise.reject(error),
        );
        const res = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if ([401, 403].includes(error.response?.status))
                    handleSessionExpired();
                return Promise.reject(error);
            },
        );
        return () => {
            api.interceptors.request.eject(req);
            api.interceptors.response.eject(res);
        };
    }, [token, handleSessionExpired]);

    // --- Auth Functions ---
    const login = useCallback(async (username, password) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/login`, {
                username,
                password,
            });
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            sessionExpiredRef.current = false;
            toast.success('Bienvenido');
            return true;
        } catch {
            toast.error('Usuario o contraseña incorrectos');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const registerUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/users', userData);
            toast.success('Usuario registrado');
            return data;
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error registrando usuario');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id, update) => {
        setLoading(true);
        try {
            await api.put(`/users/${id}`, update);
            toast.success('Usuario actualizado');
            return true;
        } catch (e) {
            toast.error(
                e.response?.data?.error || 'Error actualizando usuario',
            );
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (id) => {
        setLoading(true);
        try {
            await api.delete(`/users/${id}`);
            toast.success('Usuario eliminado');
            return true;
        } catch (e) {
            toast.error(e.response?.data?.error || 'Error eliminando usuario');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // --- CRUD directo (sin helpers) ---

    // CLIENTS
    const fetchClients = useCallback(async () => {
        setLoadingClients(true);
        try {
            const { data } = await api.get('/clients');
            setClients(data);
            return data;
        } catch {
            if (token && user) toast.error('Error cargando clientes');
            return null;
        } finally {
            setLoadingClients(false);
        }
    }, [token, user]);

    const addClient = useCallback(
        async (client) => {
            setLoading(true);
            try {
                const { data } = await api.post('/clients', client);
                await fetchClients();
                toast.success('Cliente creado');
                return data;
            } catch (e) {
                toast.error(e.response?.data?.error || 'Error creando cliente');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchClients],
    );

    const updateClient = useCallback(
        async (id, update) => {
            setLoading(true);
            try {
                const { data } = await api.put(`/clients/${id}`, update);
                await fetchClients();
                toast.success('Cliente actualizado');
                return data;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error actualizando cliente',
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchClients],
    );

    const deleteClient = useCallback(
        async (id) => {
            setLoading(true);
            try {
                await api.delete(`/clients/${id}`);
                await fetchClients();
                toast.success('Cliente eliminado');
                return true;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error eliminando cliente',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchClients],
    );

    // BARBERS
    const fetchBarbers = useCallback(async () => {
        setLoadingBarbers(true);
        try {
            const { data } = await api.get('/barbers');
            setBarbers(data);
            return data;
        } catch {
            if (token && user) toast.error('Error cargando barberos');
            return null;
        } finally {
            setLoadingBarbers(false);
        }
    }, [token, user]);

    const addBarber = useCallback(
        async (barber) => {
            setLoading(true);
            try {
                const { data } = await api.post('/barbers', barber);
                await fetchBarbers();
                toast.success('Barbero creado');
                return data;
            } catch (e) {
                toast.error(e.response?.data?.error || 'Error creando barbero');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchBarbers],
    );

    const updateBarber = useCallback(
        async (id, update) => {
            setLoading(true);
            try {
                const { data } = await api.put(`/barbers/${id}`, update);
                await fetchBarbers();
                toast.success('Barbero actualizado');
                return data;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error actualizando barbero',
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchBarbers],
    );

    const deleteBarber = useCallback(
        async (id) => {
            setLoading(true);
            try {
                await api.delete(`/barbers/${id}`);
                await fetchBarbers();
                toast.success('Barbero eliminado');
                return true;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error eliminando barbero',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchBarbers],
    );

    // CUTS
    const fetchCuts = useCallback(async () => {
        setLoadingCuts(true);
        try {
            const { data } = await api.get('/cuts');
            setCuts(data);
            return data;
        } catch {
            if (token && user) toast.error('Error cargando cortes');
            return null;
        } finally {
            setLoadingCuts(false);
        }
    }, [token, user]);

    const addCut = useCallback(
        async (cut) => {
            setLoading(true);
            try {
                const { data } = await api.post('/cuts', cut);
                await fetchCuts();
                toast.success('Corte registrado');
                return data;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error registrando corte',
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchCuts],
    );

    const updateCut = useCallback(
        async (id, update) => {
            setLoading(true);
            try {
                const { data } = await api.put(`/cuts/${id}`, update);
                await fetchCuts();
                toast.success('Corte actualizado');
                return data;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error actualizando corte',
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fetchCuts],
    );

    const deleteCut = useCallback(
        async (id) => {
            setLoading(true);
            try {
                await api.delete(`/cuts/${id}`);
                await fetchCuts();
                toast.success('Corte eliminado');
                return true;
            } catch (e) {
                toast.error(
                    e.response?.data?.error || 'Error eliminando corte',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchCuts],
    );

    // Fotos de cortes
    const addCutPhoto = useCallback(
        async (cutId, file) => {
            const formData = new FormData();
            formData.append('photo', file);
            try {
                await api.post(`/cuts/${cutId}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Foto subida');
                await fetchCuts();
                return true;
            } catch {
                toast.error('Error subiendo foto');
                return false;
            }
        },
        [fetchCuts],
    );

    const deleteCutPhoto = useCallback(
        async (cutId, photoId) => {
            try {
                await api.delete(`/cuts/${cutId}/photos/${photoId}`);
                toast.success('Foto eliminada');
                await fetchCuts();
                return true;
            } catch {
                toast.error('Error eliminando foto');
                return false;
            }
        },
        [fetchCuts],
    );

    // Inicializar datos
    useEffect(() => {
        if (token && user) {
            fetchClients();
            fetchBarbers();
            fetchCuts();
        }
    }, [token, user, fetchClients, fetchBarbers, fetchCuts]);

    const value = useMemo(
        () => ({
            user,
            token,
            login,
            logout: clearSession,
            registerUser,
            updateUser,
            deleteUser,
            clients,
            fetchClients,
            addClient,
            updateClient,
            deleteClient,
            barbers,
            fetchBarbers,
            addBarber,
            updateBarber,
            deleteBarber,
            cuts,
            fetchCuts,
            addCut,
            updateCut,
            deleteCut,
            addCutPhoto,
            deleteCutPhoto,
            loading,
            loadingClients,
            loadingBarbers,
            loadingCuts,
        }),
        [
            user,
            token,
            login,
            clearSession,
            registerUser,
            updateUser,
            deleteUser,
            clients,
            fetchClients,
            addClient,
            updateClient,
            deleteClient,
            barbers,
            fetchBarbers,
            addBarber,
            updateBarber,
            deleteBarber,
            cuts,
            fetchCuts,
            addCut,
            updateCut,
            deleteCut,
            addCutPhoto,
            deleteCutPhoto,
            loading,
            loadingClients,
            loadingBarbers,
            loadingCuts,
        ],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
