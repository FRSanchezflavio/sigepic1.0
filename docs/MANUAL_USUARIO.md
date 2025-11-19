# 📖 Manual de Usuario - SIGEPIC

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Dashboard](#dashboard)
4. [Gestión de Personal](#gestión-de-personal)
5. [Reportes](#reportes)
6. [Configuración de Perfil](#configuración-de-perfil)

---

## 1. Introducción

SIGEPIC (Sistema de Gestión del Personal de Inteligencia Criminal) es una aplicación web diseñada para gestionar la información del personal del Departamento de Inteligencia Criminal D-2.

### Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a Internet
- Credenciales de acceso proporcionadas por el administrador

---

## 2. Inicio de Sesión

### 2.1 Acceder al Sistema

1. Abra su navegador web
2. Ingrese a la URL del sistema: `http://[servidor-sigepic]/`
3. Verá la pantalla de inicio de sesión

### 2.2 Ingresar Credenciales

1. **Usuario**: Ingrese su nombre de usuario
2. **Contraseña**: Ingrese su contraseña
3. Click en **Iniciar Sesión**

![Login Screen](./images/login.png)

### 2.3 Primer Ingreso

Si es su primer ingreso con contraseña temporal:

1. Inicie sesión con las credenciales proporcionadas
2. El sistema le solicitará cambiar su contraseña
3. Ingrese una nueva contraseña segura:
   - Mínimo 8 caracteres
   - Al menos una mayúscula
   - Al menos un número
   - Al menos un carácter especial

---

## 3. Dashboard

El Dashboard es la pantalla principal después de iniciar sesión.

### 3.1 Componentes del Dashboard

**Estadísticas Principales:**

- Personal Activo
- Personal Inactivo
- Personal Superior
- Personal Subalterno

**Accesos Rápidos:**

- Ver Personal
- Registrar Personal
- Generar Reportes
- Configuración

![Dashboard](./images/dashboard.png)

### 3.2 Navegación

Use el menú lateral o las tarjetas de acceso rápido para navegar entre secciones.

---

## 4. Gestión de Personal

### 4.1 Listar Personal

**Ruta:** Dashboard → Personal

**Funciones disponibles:**

- Búsqueda por nombre, CI, jerarquía
- Filtros por estado, jerarquía, sección
- Ordenamiento de columnas
- Paginación

**Acciones:**

- **Ver**: Muestra detalles completos
- **Editar**: Modificar información (requiere permisos)
- **Eliminar**: Eliminar registro (solo administradores)

![Lista Personal](./images/personal-list.png)

### 4.2 Registrar Nuevo Personal

**Ruta:** Personal → Nuevo Personal

**Pasos:**

1. **Datos Personales**

   - Nombres y Apellidos
   - CI y Expedición
   - Fecha de Nacimiento
   - Género, Estado Civil
   - Teléfono, Correo
   - Dirección

2. **Datos Policiales**

   - Jerarquía
   - Especialidad
   - Sección
   - Fecha de Ingreso
   - Grupo Sanguíneo

3. **Contacto de Emergencia**

   - Nombre del Contacto
   - Teléfono de Emergencia

4. Click en **Registrar Personal**

![Nuevo Personal](./images/personal-new.png)

### 4.3 Editar Personal

**Ruta:** Personal → [Seleccionar] → Editar

1. Seleccione el personal a editar
2. Click en **Editar**
3. Modifique los campos necesarios
4. Click en **Guardar Cambios**

**Nota:** Todos los cambios quedan registrados en el historial de auditoría.

### 4.4 Ver Detalles

**Ruta:** Personal → [Seleccionar] → Ver

Muestra información completa del personal:

- Datos personales
- Datos policiales
- Contacto de emergencia
- Historial de cambios
- Documentos adjuntos

![Detalle Personal](./images/personal-detail.png)

### 4.5 Subir Archivos

**Fotografía:**

1. Vaya a Detalles del Personal
2. Click en **Subir Foto**
3. Seleccione archivo JPG o PNG (max 5MB)
4. Click en **Subir**

**Documentos:**

1. Vaya a Detalles del Personal
2. Click en **Subir Documentos**
3. Seleccione archivos PDF, DOC o DOCX (max 10MB cada uno)
4. Click en **Subir**

---

## 5. Reportes

### 5.1 Tipos de Reportes

**Reporte Individual:**

- Información completa de un personal
- Formato PDF

**Reporte de Lista:**

- Lista filtrada de personal
- Exportable a PDF o Excel

**Reporte de Estadísticas:**

- Gráficos y estadísticas generales
- Distribución por jerarquía y sección

### 5.2 Generar Reporte

1. Vaya a la sección correspondiente
2. Aplique filtros si es necesario
3. Click en **Exportar** o **Generar Reporte**
4. Seleccione formato (PDF/Excel)
5. El reporte se descargará automáticamente

---

## 6. Configuración de Perfil

### 6.1 Cambiar Contraseña

1. Click en su nombre (esquina superior derecha)
2. Seleccione **Cambiar Contraseña**
3. Ingrese:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
4. Click en **Guardar**

### 6.2 Cerrar Sesión

1. Click en su nombre (esquina superior derecha)
2. Seleccione **Cerrar Sesión**
3. Será redirigido a la pantalla de inicio de sesión

---

## 7. Roles y Permisos

### Administrador

- Acceso completo al sistema
- Crear, editar, eliminar registros
- Gestionar usuarios
- Acceso a auditoría

### Supervisor

- Crear y editar personal
- Ver todos los registros
- Generar reportes

### Usuario

- Solo lectura
- Ver información del personal
- Generar reportes básicos

### Auditor

- Lectura completa
- Acceso a logs de auditoría
- Generación de reportes

---

## 8. Preguntas Frecuentes

**P: ¿Cómo recupero mi contraseña?**
R: Contacte con el administrador del sistema para restablecer su contraseña.

**P: ¿Por qué no puedo editar un registro?**
R: Verifique que tenga los permisos necesarios (rol Supervisor o Administrador).

**P: ¿Cómo busco un personal específico?**
R: Use la barra de búsqueda en la lista de personal. Puede buscar por nombre, CI o jerarquía.

**P: ¿Puedo exportar datos a Excel?**
R: Sí, use el botón "Exportar" en la lista de personal y seleccione formato Excel.

**P: ¿Qué hacer si encuentro un error?**
R: Contacte con el soporte técnico y proporcione detalles del error.

---

## 9. Soporte Técnico

**Email:** soporte@policia.gob.bo  
**Teléfono:** (2) XXX-XXXX  
**Horario:** Lunes a Viernes, 8:00 - 18:00

---

© 2024 Policía Boliviana - Departamento de Inteligencia Criminal D-2
