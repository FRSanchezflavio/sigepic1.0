import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  X,
  ArrowLeft,
  User,
  Briefcase,
  FileText,
  Phone,
  Shield,
  Camera,
} from 'lucide-react';
import { personalService } from '../services/personal.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { DatePicker } from '../components/ui/date-picker';
import Loading from '../components/common/Loading';

// Schema de validación Zod
const personalSchema = z.object({
  apellidos: z.string().min(2, 'Apellidos requeridos'),
  nombres: z.string().min(2, 'Nombres requeridos'),
  numeroAsignacion: z.string().optional(),
  tipoPersonal: z.enum(['SUPERIOR', 'SUBALTERNO']),
  jerarquiaId: z.string().min(1, 'Jerarquía requerida'),
  numeroCargo: z.string().optional(),
  seccionId: z.string().min(1, 'Sección requerida'),
  funcionDepto: z.string().optional(),
  horarioLaboral: z.string().optional(),
  profesion: z.string().optional(),
  celular: z.string().optional(),
  altaDependencia: z.date().optional().nullable(),
  dni: z.string().min(4, 'DNI/CI requerido'),
  cuil: z.string().optional(),
  subsidioSalud: z.string().optional(),
  fechaNacimiento: z.date({ required_error: 'Fecha de nacimiento requerida' }),
  prontuario: z.string().optional(),
  estadoCivil: z
    .enum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'CONCUBINO'])
    .optional(),
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
    control,
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

  // Dropzone para foto
  const { getRootProps: getFotoRootProps, getInputProps: getFotoInputProps } =
    useDropzone({
      accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
      maxFiles: 1,
      onDrop: acceptedFiles => {
        const file = acceptedFiles[0];
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
      },
    });

  // Dropzone para archivos adjuntos
  const {
    getRootProps: getArchivosRootProps,
    getInputProps: getArchivosInputProps,
  } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: acceptedFiles => {
      setArchivos(prev => [...prev, ...acceptedFiles]);
    },
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      // Usar authService en lugar de fetch directo
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [jerarquiasRes, seccionesRes] = await Promise.all([
        fetch('/api/jerarquias', { headers }),
        fetch('/api/secciones', { headers }),
      ]);

      const jerarquiasData = await jerarquiasRes.json();
      const seccionesData = await seccionesRes.json();

      setJerarquias(jerarquiasData.data || []);
      setSecciones(seccionesData.data || []);
    } catch (err) {
      console.error('Error al cargar opciones:', err);
    }
  };

  const onSubmit = async data => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Convertir datos
      Object.keys(data).forEach(key => {
        if (data[key] instanceof Date) {
          formData.append(key, data[key].toISOString());
        } else if (
          data[key] !== null &&
          data[key] !== undefined &&
          data[key] !== ''
        ) {
          formData.append(key, data[key]);
        }
      });

      // Agregar foto
      if (foto) {
        formData.append('foto', foto);
      }

      // Agregar archivos
      archivos.forEach(archivo => {
        formData.append('archivos', archivo);
      });

      await personalService.create(formData);
      navigate('/personal');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el personal');
    } finally {
      setLoading(false);
    }
  };

  const jerarquiasFiltradas = tipoPersonal
    ? jerarquias.filter(j => j.tipo === tipoPersonal)
    : jerarquias;

  if (loading && !jerarquias.length) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-4xl font-bold leading-normal pt-1 bg-gradient-to-r from-police-navy to-police-navy-light bg-clip-text text-transparent">
            Agregar Personal
          </h1>
          <p className="text-slate-600 mt-6">
            Complete todos los campos requeridos para registrar nuevo personal
            del Departamento D-2
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-police-navy" />
                <CardTitle>Fotografía</CardTitle>
              </div>
              <CardDescription>
                Agregue una foto del personal (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                {/* Preview */}
                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-slate-200 overflow-hidden flex items-center justify-center">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>

                {/* Upload */}
                <div
                  {...getFotoRootProps()}
                  className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-police-cyan hover:bg-police-cyan/5 transition-colors"
                >
                  <input {...getFotoInputProps()} />
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    Click para seleccionar o arrastre una foto
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG (máx. 5MB)
                  </p>
                </div>

                {foto && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFoto(null);
                      setFotoPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-police-navy" />
                <CardTitle>Datos Personales</CardTitle>
              </div>
              <CardDescription>
                Información personal básica del efectivo
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  {...register('apellidos')}
                  className={errors.apellidos ? 'border-red-500' : ''}
                />
                {errors.apellidos && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  {...register('nombres')}
                  className={errors.nombres ? 'border-red-500' : ''}
                />
                {errors.nombres && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.nombres.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dni">DNI / CI *</Label>
                <Input
                  id="dni"
                  {...register('dni')}
                  placeholder="Ej: 12345678"
                  className={errors.dni ? 'border-red-500' : ''}
                />
                {errors.dni && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.dni.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cuil">CUIL</Label>
                <Input
                  id="cuil"
                  {...register('cuil')}
                  placeholder="Ej: 20-12345678-9"
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <select
                  id="sexo"
                  {...register('sexo')}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Controller
                  control={control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      placeholder="Seleccionar fecha"
                    />
                  )}
                />
                {errors.fechaNacimiento && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fechaNacimiento.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <select
                  id="estadoCivil"
                  {...register('estadoCivil')}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="SOLTERO">Soltero/a</option>
                  <option value="CASADO">Casado/a</option>
                  <option value="DIVORCIADO">Divorciado/a</option>
                  <option value="VIUDO">Viudo/a</option>
                  <option value="CONCUBINO">Concubino/a</option>
                </select>
              </div>

              <div>
                <Label htmlFor="profesion">Profesión</Label>
                <Input id="profesion" {...register('profesion')} />
              </div>

              <div>
                <Label htmlFor="prontuario">Prontuario</Label>
                <Input id="prontuario" {...register('prontuario')} />
              </div>

              <div className="lg:col-span-3">
                <Label htmlFor="domicilio">Domicilio</Label>
                <Input
                  id="domicilio"
                  {...register('domicilio')}
                  placeholder="Calle, número, localidad"
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos Laborales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-police-navy" />
                <CardTitle>Datos Laborales</CardTitle>
              </div>
              <CardDescription>
                Información del cargo y dependencia
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numeroAsignacion">N° de Asignación</Label>
                <Input
                  id="numeroAsignacion"
                  {...register('numeroAsignacion')}
                  placeholder="Ej: A-12345"
                />
              </div>

              <div>
                <Label htmlFor="tipoPersonal">Tipo de Personal *</Label>
                <select
                  id="tipoPersonal"
                  {...register('tipoPersonal')}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="SUPERIOR">Superior</option>
                  <option value="SUBALTERNO">Subalterno</option>
                </select>
              </div>

              <div>
                <Label htmlFor="jerarquiaId">Jerarquía *</Label>
                <select
                  id="jerarquiaId"
                  {...register('jerarquiaId')}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    errors.jerarquiaId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {jerarquiasFiltradas.map(j => (
                    <option key={j.id} value={j.id.toString()}>
                      {j.nombre}
                    </option>
                  ))}
                </select>
                {errors.jerarquiaId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.jerarquiaId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="numeroCargo">N° de Cargo</Label>
                <Input
                  id="numeroCargo"
                  {...register('numeroCargo')}
                  placeholder="Número de cargo"
                />
              </div>

              <div>
                <Label htmlFor="seccionId">Sección *</Label>
                <select
                  id="seccionId"
                  {...register('seccionId')}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    errors.seccionId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {secciones.map(s => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
                {errors.seccionId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.seccionId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="funcionDepto">Función en Departamento</Label>
                <Input id="funcionDepto" {...register('funcionDepto')} />
              </div>

              <div>
                <Label htmlFor="horarioLaboral">Horario Laboral</Label>
                <Input
                  id="horarioLaboral"
                  {...register('horarioLaboral')}
                  placeholder="Ej: 08:00 - 16:00"
                />
              </div>

              <div>
                <Label htmlFor="altaDependencia">Alta en Dependencia</Label>
                <Controller
                  control={control}
                  name="altaDependencia"
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      placeholder="Seleccionar fecha"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="jurisdiccion">Jurisdicción</Label>
                <Input id="jurisdiccion" {...register('jurisdiccion')} />
              </div>

              <div>
                <Label htmlFor="regional">Regional</Label>
                <Input id="regional" {...register('regional')} />
              </div>

              <div>
                <Label htmlFor="subsidioSalud">Subsidio de Salud</Label>
                <Input id="subsidioSalud" {...register('subsidioSalud')} />
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-police-navy" />
                <CardTitle>Información de Contacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  {...register('celular')}
                  placeholder="Ej: +549 11 1234-5678"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="usuario@ejemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Armamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-police-navy" />
                <CardTitle>Armamento Asignado</CardTitle>
              </div>
              <CardDescription>
                Información sobre el armamento asignado (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="armaTipo">Tipo de Arma</Label>
                <Input
                  id="armaTipo"
                  {...register('armaTipo')}
                  placeholder="Ej: Pistola 9mm"
                />
              </div>

              <div>
                <Label htmlFor="nroArma">N° de Arma</Label>
                <Input
                  id="nroArma"
                  {...register('nroArma')}
                  placeholder="Número de serie"
                />
              </div>
            </CardContent>
          </Card>

          {/* Archivos Adjuntos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-police-navy" />
                <CardTitle>Archivos Adjuntos</CardTitle>
              </div>
              <CardDescription>
                Agregue documentos relacionados (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getArchivosRootProps()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-police-cyan hover:bg-police-cyan/5 transition-colors"
              >
                <input {...getArchivosInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-1">
                  Click para seleccionar o arrastre archivos aquí
                </p>
                <p className="text-xs text-slate-400">
                  PDF, PNG, JPG (máx. 10MB cada uno)
                </p>
              </div>

              {archivos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Archivos seleccionados:
                  </p>
                  {archivos.map((archivo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                    >
                      <span className="text-sm text-slate-600">
                        {archivo.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setArchivos(prev =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 justify-end sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent py-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-police-navy to-police-navy-dark hover:from-police-navy-dark hover:to-police-navy border border-police-cyan/30"
            >
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
