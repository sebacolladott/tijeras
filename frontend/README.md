# AppContext Barbería

Este archivo (`AppContext.jsx`) proporciona el contexto global de una aplicación de gestión para barbería utilizando React, Context API y Axios. Centraliza la autenticación y el manejo de recursos principales: clientes, barberos, cortes y visitas.

## Características principales

- Autenticación JWT (login/logout)
- CRUD de clientes
- CRUD de barberos
- CRUD de cortes
- Registro y consulta de visitas
- Manejo global de estado de carga
- Notificaciones con [Sonner](https://sonner.emilkowal.ski/)

## Instalación y uso

1. **Requisitos previos:**
    - Node.js >= 18
    - React >= 18
    - Axios
    - Sonner

2. **Estructura del contexto:**
    - Importar y envolver la aplicación con `<AppProvider>`
    - Consumir los datos y métodos con `useContext(AppContext)`

    ```jsx
    import { AppProvider } from './AppContext';

    export default function App() {
        return <AppProvider>{/* Tu aplicación */}</AppProvider>;
    }
    ```

    ```jsx
    import { useContext } from 'react';

    import { AppContext } from './AppContext';

    const { clients, fetchClients, addClient } = useContext(AppContext);
    ```

3. **Configuración de la API:**
    - Por defecto, la URL es `http://localhost:4000/api`. Puedes modificarla según corresponda.

4. **Autenticación:**
    - El contexto gestiona el token JWT de forma automática usando `localStorage`.

## Métodos y estados disponibles

A continuación se detallan los métodos y estados proporcionados por el contexto, indicando qué espera cada uno y qué devuelve.

### Autenticación

- **`login(username: string, password: string): Promise<boolean>`**
    - _Parámetros_: `username` (string), `password` (string)
    - _Devuelve_: `true` si es correcto, `false` si no.

- **`logout(): void`**
    - _Parámetros_: ninguno
    - _Devuelve_: nada

### Clientes

- **`fetchClients(): Promise<void>`**
    - _Parámetros_: ninguno
    - _Devuelve_: nada (actualiza el array `clients` globalmente)

- **`addClient(client: { name: string, alias?: string, phone?: string, email?: string, notes?: string }): Promise<Object|null>`**
    - _Parámetros_: objeto cliente
    - _Devuelve_: el cliente creado (con id) o `null` si hay error

- **`updateClient(id: number|string, update: Object): Promise<void>`**
    - _Parámetros_: id del cliente, objeto con campos a modificar
    - _Devuelve_: nada

- **`deleteClient(id: number|string): Promise<void>`**
    - _Parámetros_: id del cliente
    - _Devuelve_: nada

### Barberos

- **`fetchBarbers(): Promise<void>`**
    - _Parámetros_: ninguno
    - _Devuelve_: nada (actualiza el array `barbers`)

- **`addBarber(barber: { name: string }): Promise<void>`**
    - _Parámetros_: objeto barbero (`{ name }`)
    - _Devuelve_: nada

- **`updateBarber(id: number|string, update: Object): Promise<void>`**
    - _Parámetros_: id del barbero, objeto con campos a modificar
    - _Devuelve_: nada

- **`deleteBarber(id: number|string): Promise<void>`**
    - _Parámetros_: id del barbero
    - _Devuelve_: nada

### Cortes

- **`fetchCuts(): Promise<void>`**
    - _Parámetros_: ninguno
    - _Devuelve_: nada (actualiza el array `cuts`)

- **`addCut(cut: { clientId: number, barberId: number, service: string, date: string, detail?: string }): Promise<Object|null>`**
    - _Parámetros_: objeto corte
    - _Devuelve_: el corte creado o `null` si hay error

- **`addCutPhoto(cutId: number|string, file: File): Promise<void>`**
    - _Parámetros_: id del corte, archivo (foto)
    - _Devuelve_: nada

- **`deleteCut(id: number|string): Promise<void>`**
    - _Parámetros_: id del corte
    - _Devuelve_: nada

### Visitas

- **`fetchVisitsByClient(clientId: number|string): Promise<Array>`**
    - _Parámetros_: id del cliente
    - _Devuelve_: array de visitas (o array vacío si hay error)

- **`addVisit(visit: { clientId: number, date: string, detail?: string }): Promise<Object|null>`**
    - _Parámetros_: objeto visita
    - _Devuelve_: visita creada o `null` si hay error

### Otros estados

- **`loading: boolean`**
    - `true` si hay operaciones en curso, `false` si no

- **`clients`, `barbers`, `cuts`: arrays de entidades respectivas**
- **`user`, `token`**: usuario autenticado y token JWT

```jsx
const { clients, addClient, loading } = useContext(AppContext);

if (loading) return <div>Cargando...</div>;

return (
    <ul>
        {clients.map((c) => (
            <li key={c.id}>{c.name}</li>
        ))}
    </ul>
);
```

## Notas

- Todos los métodos de escritura retornan los datos creados o modificados, o `null` en caso de error.
- Las operaciones de carga muestran notificaciones mediante `toast`.
- El token JWT se agrega automáticamente a las peticiones si existe.

## Personalización

Puedes extender el contexto agregando nuevos recursos o métodos según las necesidades del sistema.

---

**Desarrollado por Señor Sebastian.**
