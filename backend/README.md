# API Barbería - Documentación Detallada

---

## General

* **Base URL:** `http://localhost:4000/api`
* **Autenticación:** JWT en header `Authorization: Bearer <token>`
* **Roles disponibles:**

  * `admin`: Acceso total (administrador)
  * `user`: Acceso restringido (empleado/operador)

---

## Tabla de Permisos

| Recurso     | Acción       | admin | user |
| ----------- | ------------ | :---: | :--: |
| Usuarios    | Registrar    |   ✔️  |   ❌  |
| Usuarios    | Login        |   ✔️  |  ✔️  |
| Usuarios    | Editar       |   ✔️  |   ❌  |
| Usuarios    | Eliminar     |   ✔️  |   ❌  |
| Clientes    | Consultar    |   ✔️  |  ✔️  |
| Clientes    | Crear        |   ✔️  |  ✔️  |
| Clientes    | Editar       |   ✔️  |  ✔️  |
| Clientes    | Eliminar     |   ✔️  |   ❌  |
| Barberos    | Consultar    |   ✔️  |  ✔️  |
| Barberos    | Crear        |   ✔️  |  ✔️  |
| Barberos    | Editar       |   ✔️  |  ✔️  |
| Barberos    | Eliminar     |   ✔️  |   ❌  |
| Cortes      | Consultar    |   ✔️  |  ✔️  |
| Cortes      | Crear        |   ✔️  |  ✔️  |
| Cortes      | Editar       |   ✔️  |  ✔️  |
| Cortes      | Eliminar     |   ✔️  |   ❌  |
| Fotos Corte | Subir/Listar |   ✔️  |  ✔️  |

---

## Endpoints y Ejemplos

### Autenticación

#### POST `/api/login`

* **Descripción:** Iniciar sesión y obtener token JWT.
* **Body:**

  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
* **Respuesta exitosa:**

  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
  ```
* **Errores:** 401 Credenciales inválidas.

#### POST `/api/register`

* **Descripción:** Registrar un nuevo usuario (solo admin).
* **Headers:** `Authorization: Bearer <token>`
* **Body:**

  ```json
  {
    "username": "nuevo",
    "password": "123456",
    "role": "user"
  }
  ```
* **Respuesta:**

  ```json
  {
    "id": 2,
    "username": "nuevo",
    "role": "user"
  }
  ```
* **Errores:** 400 usuario existente, 403 acceso denegado.

#### PUT `/api/users/:id`

* **Descripción:** Editar usuario (solo admin). Permite cambiar username, password y rol.
* **Headers:** `Authorization: Bearer <token>`
* **Body:** (solo los campos a actualizar)

  ```json
  {
    "username": "nuevo_nombre",
    "password": "nuevo_password",
    "role": "admin"
  }
  ```
* **Respuesta:**

  ```json
  {
    "updated": 1
  }
  ```
* **Errores:** 400 datos inválidos, 403 acceso denegado, 404 usuario no encontrado.

#### DELETE `/api/users/:id`

* **Descripción:** Eliminar usuario (solo admin).
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta:**

  ```json
  {
    "deleted": 1
  }
  ```
* **Errores:** 403 acceso denegado, 404 usuario no encontrado.

---

### Clientes

#### GET `/api/clients`

* **Descripción:** Listar todos los clientes.
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta:**

  ```json
  [
    {
      "id": 1,
      "name": "Juan Pérez",
      "alias": "Juancho",
      "phone": "123456789",
      "email": "juan@email.com",
      "notes": "Nota interna"
    }
  ]
  ```

#### GET `/api/clients/:id`

* **Descripción:** Detalle de un cliente.
* **Respuesta:**

  ```json
  {
    "id": 1,
    "name": "Juan Pérez",
    "alias": "Juancho",
    "phone": "123456789",
    "email": "juan@email.com",
    "notes": "Nota interna"
  }
  ```

#### GET `/api/clients/:id/cuts`

* **Descripción:** Listar todos los cortes de un cliente (incluye fotos).
* **Respuesta:**

  ```json
  [
    {
      "id": 1,
      "clientId": 1,
      "barberId": 2,
      "service": "Corte clásico",
      "date": "2024-07-01",
      "detail": "Detalles...",
      "nota": "Nota adicional",
      "metodoPago": "Efectivo",
      "Barber": {
        "id": 2,
        "name": "Pedro"
      },
      "photos": [
        {
          "id": 5,
          "cutId": 1,
          "path": "/uploads/1720128850123-foto1.jpg"
        }
      ]
    }
  ]
  ```

#### POST `/api/clients`

* **Descripción:** Crear un cliente.
* **Body:**

  ```json
  {
    "name": "Nuevo Cliente",
    "alias": "Alias",
    "phone": "123456",
    "email": "correo@email.com",
    "notes": "Observaciones"
  }
  ```
* **Respuesta:**

  ```json
  {
    "id": 2,
    "name": "Nuevo Cliente",
    "alias": "Alias",
    "phone": "123456",
    "email": "correo@email.com",
    "notes": "Observaciones"
  }
  ```

#### PUT `/api/clients/:id`

* **Descripción:** Actualizar datos del cliente.
* **Body:**

  ```json
  {
    "name": "Nombre actualizado"
  }
  ```
* **Respuesta:**

  ```json
  {
    "updated": 1
  }
  ```

#### DELETE `/api/clients/:id`

* **Descripción:** Eliminar cliente (solo admin).
* **Respuesta:**

  ```json
  {
    "deleted": 1
  }
  ```

---

### Barberos

#### GET `/api/barbers`

* **Descripción:** Listar barberos.
* **Respuesta:**

  ```json
  [
    {
      "id": 1,
      "name": "Pedro"
    }
  ]
  ```

#### POST `/api/barbers`

* **Descripción:** Crear barbero.
* **Body:**

  ```json
  {
    "name": "Carlos"
  }
  ```
* **Respuesta:**

  ```json
  {
    "id": 3,
    "name": "Carlos"
  }
  ```

#### PUT `/api/barbers/:id`

* **Descripción:** Actualizar barbero.
* **Body:**

  ```json
  {
    "name": "Nombre actualizado"
  }
  ```
* **Respuesta:**

  ```json
  {
    "updated": 1
  }
  ```

#### DELETE `/api/barbers/:id`

* **Descripción:** Eliminar barbero (solo admin).
* **Respuesta:**

  ```json
  {
    "deleted": 1
  }
  ```

---

### Cortes

#### GET `/api/cuts`

* **Descripción:** Listar cortes (incluye info de cliente y barbero).
* **Respuesta:**

  ```json
  [
    {
      "id": 1,
      "clientId": 1,
      "barberId": 2,
      "service": "Fade",
      "date": "2024-07-01",
      "detail": "",
      "nota": "",
      "metodoPago": "",
      "Client": {
        "id": 1,
        "name": "Juan",
        "alias": "JP",
        "phone": "123456"
      },
      "Barber": {
        "id": 2,
        "name": "Pedro"
      }
    }
  ]
  ```

#### POST `/api/cuts`

* **Descripción:** Crear corte.
* **Body:**

  ```json
  {
    "clientId": 1,
    "barberId": 2,
    "service": "Corte clásico",
    "date": "2024-07-01",
    "detail": "Detalles",
    "nota": "Nota adicional",
    "metodoPago": "Tarjeta"
  }
  ```
* **Respuesta:**

  ```json
  {
    "id": 4,
    "clientId": 1,
    "barberId": 2,
    "service": "Corte clásico",
    "date": "2024-07-01",
    "detail": "Detalles",
    "nota": "Nota adicional",
    "metodoPago": "Tarjeta"
  }
  ```

#### DELETE `/api/cuts/:id`

* **Descripción:** Eliminar corte (solo admin).
* **Respuesta:**

  ```json
  {
    "deleted": 1
  }
  ```

---

### Fotos de Cortes

#### POST `/api/cuts/:id/photo`

* **Descripción:** Subir foto a corte.
* **Headers:**

  * `Authorization: Bearer <token>`
  * `Content-Type: multipart/form-data`
* **Body:** FormData, campo `photo` (archivo).
* **Respuesta:**

  ```json
  {
    "id": 10,
    "cutId": 4,
    "path": "/uploads/1720129000000-foto.jpg"
  }
  ```

#### GET `/api/cuts/:id/photos`

* **Descripción:** Obtener fotos de un corte.
* **Respuesta:**

  ```json
  [
    {
      "id": 10,
      "cutId": 4,
      "path": "/uploads/1720129000000-foto.jpg"
    }
  ]
  ```

---

## Errores Comunes

* **401 Unauthorized:** Token inválido o ausente.
* **403 Forbidden:** Acceso denegado por rol insuficiente.
* **404 Not Found:** Recurso inexistente.
* **400 Bad Request:** Datos inválidos o faltantes.

---

## Notas Técnicas

* Todos los endpoints (excepto login) requieren JWT válido.
* El rol de usuario se establece en el token y controla los permisos.
* El primer usuario admin se crea automáticamente (`admin`/`admin`).
* Las fotos subidas se almacenan en `/uploads` y son accesibles por `/uploads/{archivo}`.
* No hay paginación ni filtros avanzados en endpoints de lista.

---

## Ejemplo de uso con curl

**Login:**

```bash
curl -X POST http://localhost:4000/api/login -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin"}'
```

**Crear cliente:**

```bash
curl -X POST http://localhost:4000/api/clients -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"name":"Cliente Demo"}'
```

**Editar usuario:**

```bash
curl -X PUT http://localhost:4000/api/users/2 -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"username":"nuevo_nombre", "password":"nuevo_pass"}'
```

**Eliminar usuario:**

```bash
curl -X DELETE http://localhost:4000/api/users/2 -H "Authorization: Bearer <token>"
```

---

¿Dudas o mejoras? Contactar al desarrollador.
