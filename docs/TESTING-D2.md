# Guía de Testing - Sistema D-2 SIGEPIC

## 📋 Estado de la Migración

**Progreso:** 90% completado (9/10 tareas)

### ✅ Tareas Completadas

1. **Schema actualizado** - Campos D-2 agregados (jerarquiaId, seccionId, numeroCargo, etc.)
2. **shadcn/ui configurado** - Componentes modernos instalados
3. **Login moderno** - Glassmorphism + animaciones + split diagonal
4. **Dashboard rediseñado** - 3 cards grandes con rutas actualizadas
5. **Formulario PersonalNew** - 30+ campos con validación, file uploads, date pickers
6. **Backend actualizado** - Controllers, validators, endpoint planillas
7. **PersonalSearch creado** - Página de búsqueda con filtros y descarga de planillas
8. **pdfService actualizado** - Generación de planillas single-page con foto
9. **Rutas actualizadas** - App.jsx con nuevas rutas

### 🔄 En Progreso

10. **Testing y ajustes finales** - Testing manual del flujo completo

---

## 🗄️ Base de Datos de Prueba

### Datos creados en el seed:

- **Usuario Admin:**

  - Username: `admin`
  - Password: `Admin123!`
  - Email: admin@d2.gob.ar

- **8 Registros de Personal:**

  1. **GARCÍA LÓPEZ, Juan Carlos** - Comisario General (SUPERIOR)
  2. **FERNÁNDEZ DÍAZ, María Victoria** - Comisario Mayor (SUPERIOR)
  3. **RODRÍGUEZ PÉREZ, Carlos Alberto** - Comisario (SUPERIOR)
  4. **MARTÍNEZ GÓMEZ, Roberto Daniel** - Sargento (SUBALTERNO)
  5. **LÓPEZ SÁNCHEZ, Ana Laura** - Cabo (SUBALTERNO)
  6. **GONZÁLEZ MORALES, Diego Hernán** - Agente (SUBALTERNO)
  7. **TORRES SILVA, Gabriela Beatriz** - Comisario (SUPERIOR - LICENCIA)
  8. **RAMÍREZ CASTRO, Jorge Luis** - Comisario Mayor (SUPERIOR - RETIRADO)

- **6 Jerarquías Superiores:** Comisario General, Comisario Mayor, Comisario Inspector, Comisario, Subcomisario, Principal
- **3 Jerarquías Subalternas:** Sargento, Cabo, Agente
- **5 Secciones:** Análisis Criminal, Inteligencia Operativa, Investigaciones, Tecnología y Comunicaciones, Administrativo

---

## 🧪 Plan de Testing Manual

### **Test 1: Login y Navegación**

**Objetivo:** Verificar que el login funciona y el dashboard muestra las 3 opciones

**Pasos:**

1. Acceder a `http://localhost:5173`
2. Ingresar credenciales: `admin` / `Admin123!`
3. Verificar que se muestra el Dashboard con 3 cards:
   - 📝 Agregar Personal
   - 🔍 Buscar Personal
   - ✏️ Editar Personal

**Resultado esperado:** Login exitoso, dashboard con 3 opciones visibles, animaciones funcionando

---

### **Test 2: Agregar Personal - Formulario Completo**

**Objetivo:** Verificar que todos los campos del formulario funcionan correctamente

**Pasos:**

1. Desde el Dashboard, hacer clic en "Agregar Personal"
2. Completar todos los campos obligatorios:
   - **Datos Personales:** Apellidos, Nombres, N° Asignación, DNI, CUIL, Fecha Nacimiento, Sexo, Estado Civil
   - **Datos Laborales:** Tipo Personal, Jerarquía (verificar filtrado por tipo), N° Cargo, Sección, Función Depto
   - **Datos Adicionales:** Profesión, Celular, Email, Domicilio
   - **Otros:** Jurisdicción, Regional, Estado Servicio
3. **Subir archivos:**
   - Foto (verificar preview)
   - 1-2 archivos adjuntos
4. Hacer clic en "Guardar"

**Verificaciones:**

- [ ] Filtro de jerarquía se actualiza según tipoPersonal (SUPERIOR/SUBALTERNO)
- [ ] Date picker funciona con locale español
- [ ] Preview de foto se muestra
- [ ] Validaciones funcionan (campos obligatorios)
- [ ] Submit exitoso muestra mensaje de éxito
- [ ] Redirecciona al listado o dashboard

---

### **Test 3: Buscar Personal - Filtros y Descarga**

**Objetivo:** Verificar filtros, selección y descarga de planillas

**Pasos:**

1. Desde el Dashboard, hacer clic en "Buscar Personal"
2. **Verificar filtros:**
   - Buscar por nombre: "García"
   - Filtrar por Tipo Personal: "SUPERIOR"
   - Filtrar por Jerarquía: "Comisario General"
   - Filtrar por Sección: "Análisis Criminal"
   - Filtrar por Estado Servicio: "ACTIVO"
3. **Probar selección:**
   - Seleccionar 1 persona con checkbox individual
   - Seleccionar todas con "Seleccionar todos"
   - Deseleccionar algunas
4. **Descargar planilla:**
   - Con 1 persona seleccionada: hacer clic en "Descargar Planilla (1)"
   - Con 3 personas seleccionadas: hacer clic en "Descargar Planilla (3)"

**Verificaciones:**

- [ ] Filtros funcionan correctamente
- [ ] Resultados se actualizan en tiempo real
- [ ] Checkboxes individuales funcionan
- [ ] "Seleccionar todos" funciona
- [ ] Contador de seleccionados es correcto
- [ ] Botón deshabilitado cuando no hay selección
- [ ] PDF se descarga correctamente

---

### **Test 4: Verificar PDF Generado**

**Objetivo:** Verificar contenido y formato de las planillas PDF

**Pasos:**

1. Descargar una planilla desde PersonalSearch
2. Abrir el PDF descargado
3. **Verificar contenido:**
   - Header institucional (Policía Boliviana, D-2)
   - Foto del personal (si existe) en la esquina superior derecha (100x120px)
   - **Columna Izquierda - Datos Personales:**
     - Apellidos y Nombres
     - DNI
     - CUIL
     - Fecha de Nacimiento
     - Sexo
     - Estado Civil
     - Profesión
     - Prontuario
   - **Columna Izquierda - Datos de Contacto:**
     - Celular
     - Email
     - Domicilio
   - **Columna Derecha - Datos Laborales:**
     - N° de Asignación
     - Tipo de Personal
     - Jerarquía
     - N° de Cargo
     - Sección
     - Función Depto
     - Horario Laboral
     - Alta Dependencia
     - Jurisdicción
     - Regional
     - Subsidio Salud
   - **Columna Derecha - Armamento:**
     - Tipo de Arma
     - N° de Arma
   - Footer con fecha/hora de generación

**Verificaciones:**

- [ ] Todas las secciones presentes
- [ ] Foto se muestra correctamente (si existe)
- [ ] Datos completos y correctos
- [ ] Formato profesional
- [ ] Layout single-page (1 página por persona)
- [ ] PDF multi-persona contiene varias páginas

---

### **Test 5: Editar Personal (si la ruta existe)**

**Objetivo:** Verificar que se puede editar un registro existente

**Pasos:**

1. Acceder al listado de personal
2. Hacer clic en editar uno de los registros creados en el seed
3. Modificar algunos campos
4. Guardar cambios
5. Verificar que los cambios se guardaron

**Verificaciones:**

- [ ] Formulario se pre-llena con datos existentes
- [ ] Foto actual se muestra
- [ ] Campos se pueden modificar
- [ ] Validaciones funcionan
- [ ] Submit actualiza correctamente

---

## 🚀 Comandos para Iniciar Testing

### **Backend:**

```bash
cd backend
npm run dev
```

**Puerto:** http://localhost:3000

### **Frontend:**

```bash
cd frontend
npm run dev
```

**Puerto:** http://localhost:5173

### **Re-ejecutar Seeds (si es necesario):**

```bash
cd backend
npx prisma db seed
```

---

## 🐛 Checklist de Problemas Conocidos

### Backend:

- [ ] Verificar que validators.js usa los campos correctos (jerarquiaId, seccionId, arma, numeroArma)
- [ ] Verificar que el endpoint POST /api/personal/planillas funciona
- [ ] Verificar que generarPlanillasPersonal() genera PDFs correctos

### Frontend:

- [ ] Verificar que PersonalNew usa los campos correctos del schema
- [ ] Verificar que PersonalSearch envía los IDs correctamente al endpoint
- [ ] Verificar que los filtros de jerarquía/sección funcionan
- [ ] Verificar que el upload de archivos funciona

### Base de Datos:

- [ ] Verificar que el schema tiene todos los campos necesarios
- [ ] Verificar que los seeds crean datos válidos

---

## 📝 Registro de Issues Encontrados

| #   | Descripción                                                | Estado      | Solución                                                  |
| --- | ---------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| 1   | Campo `jerarquia` obligatorio en schema pero falta en seed | ✅ Resuelto | Agregado campo `jerarquia` (String) a todos los registros |
| 2   | Campo `armaTipo`/`nroArma` no existe en schema             | ✅ Resuelto | Cambiado a `arma`/`numeroArma` según schema               |
| 3   | Variable `secciones` duplicada en seed.js                  | ✅ Resuelto | Renombrado a `seccionesDb`                                |
| 4   | Campo `subsidioSalud` es String no Boolean                 | ✅ Resuelto | Cambiado valores booleanos a String/null                  |

---

## ✅ Próximos Pasos

1. **Ejecutar testing manual** siguiendo esta guía
2. **Documentar issues** encontrados en la tabla anterior
3. **Corregir bugs** si se encuentran
4. **Actualizar tests automatizados** (opcional)
5. **Preparar para producción:**
   - Configurar variables de entorno
   - Optimizar builds
   - Documentación final

---

## 📞 Contacto y Soporte

Para reportar issues o solicitar features adicionales, contactar al equipo de desarrollo.

**Última actualización:** 18 de Noviembre de 2024
**Versión del sistema:** 2.0.0
**Estado:** Testing en curso
