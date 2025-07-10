import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { toast } from "sonner";

export const AppContext = createContext();

const API_URL = "/api";

// --- Helper: JWT Expiration ---
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? Date.now() >= payload.exp * 1000 : false;
  } catch {
    return true;
  }
};

// --- Axios instance (stable) ---
const api = axios.create({ baseURL: API_URL });

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
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
    setToken("");
    setUser(null);
    setClients([]);
    setBarbers([]);
    setCuts([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionExpiredRef.current = false;
    if (showToast) toast("Sesión cerrada");
  }, []);

  const handleSessionExpired = useCallback(() => {
    if (!sessionExpiredRef.current) {
      sessionExpiredRef.current = true;
      clearSession(false);
      toast.error("Sesión expirada. Inicie sesión nuevamente.");
    }
  }, [clearSession]);

  // --- Attach token to requests dynamically ---
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if ([401, 403].includes(error.response?.status)) {
          handleSessionExpired();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionExpiredRef.current = false;
      toast.success("Bienvenido");
      return true;
    } catch {
      toast.error("Usuario o contraseña incorrectos");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/users", userData);
      toast.success("Usuario registrado");
      return data;
    } catch (e) {
      toast.error(e.response?.data?.error || "Error registrando usuario");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, update) => {
    setLoading(true);
    try {
      await api.put(`/users/${id}`, update);
      toast.success("Usuario actualizado");
      return true;
    } catch (e) {
      toast.error(e.response?.data?.error || "Error actualizando usuario");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    try {
      await api.delete(`/users/${id}`);
      toast.success("Usuario eliminado");
      return true;
    } catch (e) {
      toast.error(e.response?.data?.error || "Error eliminando usuario");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- CRUD Helpers ---
  const fetchData = async (endpoint, setter, setLoadingFn, errorMessage) => {
    setLoadingFn(true);
    try {
      const { data } = await api.get(endpoint);
      setter(data);
    } catch {
      if (token && user) toast.error(errorMessage);
    } finally {
      setLoadingFn(false);
    }
  };

  const createOrUpdate = async (
    endpoint,
    method,
    payload,
    onSuccess,
    errorMessage
  ) => {
    setLoading(true);
    try {
      const { data } = await api[method](endpoint, payload);
      if (onSuccess) await onSuccess(data);
      toast.success("Operación exitosa");
      return data;
    } catch (e) {
      toast.error(e.response?.data?.error || errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = useCallback(
    () =>
      fetchData(
        "/clients",
        setClients,
        setLoadingClients,
        "Error cargando clientes"
      ),
    []
  );
  const fetchBarbers = useCallback(
    () =>
      fetchData(
        "/barbers",
        setBarbers,
        setLoadingBarbers,
        "Error cargando barberos"
      ),
    []
  );
  const fetchCuts = useCallback(
    () => fetchData("/cuts", setCuts, setLoadingCuts, "Error cargando cortes"),
    []
  );

  const addClient = useCallback(
    (client) =>
      createOrUpdate(
        "/clients",
        "post",
        client,
        fetchClients,
        "Error creando cliente"
      ),
    []
  );
  const updateClient = useCallback(
    (id, update) =>
      createOrUpdate(
        `/clients/${id}`,
        "put",
        update,
        fetchClients,
        "Error actualizando cliente"
      ),
    []
  );
  const deleteClient = useCallback(
    (id) =>
      createOrUpdate(
        `/clients/${id}`,
        "delete",
        null,
        fetchClients,
        "Error eliminando cliente"
      ),
    []
  );

  const addBarber = useCallback(
    (barber) =>
      createOrUpdate(
        "/barbers",
        "post",
        barber,
        fetchBarbers,
        "Error creando barbero"
      ),
    []
  );
  const updateBarber = useCallback(
    (id, update) =>
      createOrUpdate(
        `/barbers/${id}`,
        "put",
        update,
        fetchBarbers,
        "Error actualizando barbero"
      ),
    []
  );
  const deleteBarber = useCallback(
    (id) =>
      createOrUpdate(
        `/barbers/${id}`,
        "delete",
        null,
        fetchBarbers,
        "Error eliminando barbero"
      ),
    []
  );

  const addCut = useCallback(
    (cut) =>
      createOrUpdate(
        "/cuts",
        "post",
        cut,
        fetchCuts,
        "Error registrando corte"
      ),
    []
  );
  const updateCut = useCallback(
    (id, update) =>
      createOrUpdate(
        `/cuts/${id}`,
        "put",
        update,
        fetchCuts,
        "Error actualizando corte"
      ),
    []
  );
  const deleteCut = useCallback(
    (id) =>
      createOrUpdate(
        `/cuts/${id}`,
        "delete",
        null,
        fetchCuts,
        "Error eliminando corte"
      ),
    []
  );

  const addCutPhoto = useCallback(async (cutId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    try {
      await api.post(`/cuts/${cutId}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Foto subida");
    } catch {
      toast.error("Error subiendo foto");
    }
  }, []);

  const deleteCutPhoto = useCallback(
    async (cutId, photoId) => {
      try {
        await api.delete(`/cuts/${cutId}/photos/${photoId}`);
        toast.success("Foto eliminada");
        fetchCuts();
      } catch {
        toast.error("Error eliminando foto");
      }
    },
    [fetchCuts]
  );

  useEffect(() => {
    if (token && user) {
      Promise.all([fetchClients(), fetchBarbers(), fetchCuts()]);
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
      addCutPhoto,
      deleteCutPhoto,
      deleteCut,
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
      addCutPhoto,
      deleteCutPhoto,
      deleteCut,
      loading,
      loadingClients,
      loadingBarbers,
      loadingCuts,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
