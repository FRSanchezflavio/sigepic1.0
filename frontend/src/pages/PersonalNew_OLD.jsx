import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Plus, Upload, X, ArrowLeft, User, Briefcase, FileText, Phone, Shield } from 'lucide-react';
import { personalService } from '../services/personal.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import Loading from '../components/common/Loading';

// Schema de validación Zod
const personalSchema = z.object({
  // Datos personales básicos
  apellidos: z.string().min(2, 'Apellidos requeridos'),
  nombres: z.string().min(2, 'Nombres requeridos'),
  numeroAsignacion: z.string().optional(),
  tipoPersonal: z.enum(['SUPERIOR', 'SUBALTERNO']),
  jerarquiaId: z.number({ required_error: 'Jerarquía requerida' }),
  numeroCargo: z.string().optional(),
  seccionId: z.number({ required_error: 'Sección requerida' }),
  funcionDepto: z.string().optional(),
  horarioLaboral: z.string().optional(),
  profesion: z.string().optional(),
  celular: z.string().optional(),
  altaDependencia: z.date().optional(),
  dni: z.string().min(4, 'DNI/CI requerido'),
  cuil: z.string().optional(),
  subsidioSalud: z.string().optional(),
  fechaNacimiento: z.date({ required_error: 'Fecha de nacimiento requerida' }),
  prontuario: z.string().optional(),
  estadoCivil: z.enum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'CONCUBINO']).optional(),
  sexo: z.enum(['M', 'F']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  domicilio: z.string().optional(),
  jurisdiccion: z.string().optional(),
  regional: z.string().optional(),
  armaTipo: z.string().optional(),
  nroArma: z.string().optional(),
});

const PersonalNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jerarquias, setJerarquias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivos, setArchivos] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      tipoPersonal: 'SUBALTERNO',
      sexo: 'M',
      estadoCivil: 'SOLTERO',
    },
  });

  const tipoPersonal = watch('tipoPersonal');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [jerarquiasRes, seccionesRes] = await Promise.all([
        fetch('/api/jerarquias'),
        fetch('/api/secciones'),
      ]);

      const jerarquiasData = await jerarquiasRes.json();
      const seccionesData = await seccionesRes.json();

      setJerarquias(jerarquiasData.data || []);
      setSecciones(seccionesData.data || []);
    } catch (err) {
      console.error('Error al cargar opciones:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convertir IDs a números
      const dataToSend = {
        ...formData,
        jerarquiaId: parseInt(formData.jerarquiaId),
        seccionId: parseInt(formData.seccionId),
      };

      await personalService.create(dataToSend);
      navigate('/personal');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el personal');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.nombres) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Nuevo Personal
          </h1>
          <p className="text-gray-600 mt-2">
            Complete el formulario con los datos del personal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="ci">Carnet de Identidad *</Label>
                <Input
                  id="ci"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expedicion">Expedición *</Label>
                <select
                  id="expedicion"
                  name="expedicion"
                  value={formData.expedicion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="LP">La Paz</option>
                  <option value="CB">Cochabamba</option>
                  <option value="SC">Santa Cruz</option>
                  <option value="OR">Oruro</option>
                  <option value="PT">Potosí</option>
                  <option value="TJ">Tarija</option>
                  <option value="CH">Chuquisaca</option>
                  <option value="BE">Beni</option>
                  <option value="PD">Pando</option>
                </select>
              </div>

              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="genero">Género *</Label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <select
                  id="estado_civil"
                  name="estado_civil"
                  value={formData.estado_civil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="SOLTERO">Soltero/a</option>
                  <option value="CASADO">Casado/a</option>
                  <option value="DIVORCIADO">Divorciado/a</option>
                  <option value="VIUDO">Viudo/a</option>
                  <option value="CONCUBINO">Concubino/a</option>
                </select>
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos Policiales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Policiales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jerarquiaId">Jerarquía *</Label>
                <select
                  id="jerarquiaId"
                  name="jerarquiaId"
                  value={formData.jerarquiaId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccione...</option>
                  {jerarquias.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input
                  id="especialidad"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="seccionId">Sección *</Label>
                <select
                  id="seccionId"
                  name="seccionId"
                  value={formData.seccionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccione...</option>
                  {secciones.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
                <Input
                  id="fecha_ingreso"
                  name="fecha_ingreso"
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="grupo_sanguineo">Grupo Sanguíneo</Label>
                <select
                  id="grupo_sanguineo"
                  name="grupo_sanguineo"
                  value={formData.grupo_sanguineo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contacto_emergencia">Nombre del Contacto</Label>
                <Input
                  id="contacto_emergencia"
                  name="contacto_emergencia"
                  value={formData.contacto_emergencia}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="telefono_emergencia">
                  Teléfono de Emergencia
                </Label>
                <Input
                  id="telefono_emergencia"
                  name="telefono_emergencia"
                  value={formData.telefono_emergencia}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/personal')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Personal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalNew;
