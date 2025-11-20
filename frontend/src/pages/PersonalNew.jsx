import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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

// Schema de validación Zod
const personalSchema = z.object({
  apellidos: z.string().min(2, 'Apellidos requeridos'),
  nombres: z.string().min(2, 'Nombres requeridos'),
  numeroAsignacion: z.string().optional().or(z.literal('')),
  tipoPersonal: z.enum(['SUPERIOR', 'SUBALTERNO']),
  jerarquiaId: z.string().min(1, 'Jerarquía requerida'),
  numeroCargo: z.string().optional().or(z.literal('')),
  seccionId: z.string().min(1, 'Sección requerida'),
  funcionDepto: z.string().optional(),
  horarioLaboral: z.string().optional(),
  profesion: z.string().optional(),
  celular: z.string().optional(),
  dni: z.string().min(4, 'DNI/CI requerido'),
  cuil: z.string().optional(),
  subsidioSalud: z.string().optional(),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  prontuario: z.string().optional(),
  estadoCivil: z
    .enum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'CONCUBINO'])
    .optional(),
  sexo: z.enum(['M', 'F']),
  grupoSanguineo: z.string().optional(),
  nacionalidad: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  domicilio: z.string().optional(),
  localidad: z.string().optional(),
  jurisdiccion: z.string().optional(),
  regional: z.string().optional(),
  armaTipo: z.string().optional(),
  nroArma: z.string().optional(),
  poseeCarnetManejo: z.string().optional(),
  conduceAutos: z.boolean().optional(),
  conduceMotos: z.boolean().optional(),
  conduceOtros: z.boolean().optional(),
  poseeCredencialPolicial: z.string().optional(),
  altaReparticion: z.string().optional(),
  altaDepartamental: z.string().optional(),
  poseeChalecoAsignado: z.string().optional(),
  nroSerieChalecoAsignado: z.string().optional(),
});

const PersonalNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [poseeCarnet, setPoseeCarnet] = useState(false);
  const [poseeCredencial, setPoseeCredencial] = useState(false);
  const [poseeChalecoState, setPoseeChalecoState] = useState(false);

  // Jerarquías estáticas
  const jerarquiasSuperiores = [
    'Comisario General',
    'Comisario Mayor',
    'Comisario Inspector',
    'Comisario Principal',
    'Comisario',
    'Subcomisario',
    'Oficial Principal',
    'Oficial Auxiliar',
    'Oficial Ayudante',
    'Oficial Subayudante',
  ];

  const jerarquiasSubalternas = [
    'Suboficial Mayor',
    'Suboficial Principal',
    'Sargento Ayudante',
    'Sargento 1°',
    'Sargento',
    'Cabo 1°',
    'Cabo',
    'Agente',
    'PTP',
  ];

  // Secciones estáticas
  const seccionesDisponibles = [
    'Delitos Generales y Especiales',
    'Cibercrimen',
    'Of. Central',
    'Análisis Informática Forense',
    'Explotación de Prensa',
    'Análisis Delictual',
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      tipoPersonal: 'SUBALTERNO',
      sexo: 'M',
      estadoCivil: 'SOLTERO',
      nacionalidad: 'Argentina',
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

  const onSubmit = async data => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Convertir y agregar datos al FormData
      Object.keys(data).forEach(key => {
        const value = data[key];
        
        // Saltar valores vacíos excepto booleanos
        if (value === null || value === undefined || value === '') {
          return;
        }

        // Convertir "SI"/"NO" a boolean para campos específicos
        if (['poseeCarnetManejo', 'poseeCredencialPolicial', 'poseeChalecoAsignado'].includes(key)) {
          formData.append(key, value === 'SI' ? 'true' : 'false');
        }
        // Convertir booleanos a strings para FormData
        else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
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

      console.log('Datos a enviar:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await personalService.create(formData);
      navigate('/personal');
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Error al crear el personal';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determinar jerarquías a mostrar según tipo de personal
  const jerarquiasAMostrar =
    tipoPersonal === 'SUPERIOR' ? jerarquiasSuperiores : jerarquiasSubalternas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-police-cyan/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-police-navy/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 hover:bg-white/80 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <motion.h1
                className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-police-navy via-police-navy-light to-police-cyan bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Agregar Personal
              </motion.h1>
              <motion.p
                className="text-lg text-slate-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Complete todos los campos requeridos para registrar nuevo
                personal del Departamento D-2
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-police-navy">
                  {jerarquias.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Jerarquías
                </div>
              </div> */}
              {/* <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-police-cyan">
                  {secciones.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Secciones
                </div>
              </div> */}
            </motion.div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 rounded-xl text-red-700 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Error al registrar</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Foto de Perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Fotografía</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Agregue una foto del personal (opcional)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Preview */}
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-police-cyan rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="flex-1 w-full">
                    <div
                      {...getFotoRootProps()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-police-cyan hover:bg-police-cyan/5 transition-all duration-300 hover:shadow-lg"
                    >
                      <input {...getFotoInputProps()} />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-police-cyan" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Click para seleccionar o arrastre una foto
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PNG, JPG • Máximo 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                    {foto && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <span className="text-sm text-green-700 font-medium">
                          ✓ Foto cargada: {foto.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFoto(null);
                            setFotoPreview(null);
                          }}
                          className="hover:bg-red-100 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Datos Personales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Datos Personales</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Información personal básica del efectivo
                    </CardDescription>
                  </div>
                </div>
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
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...register('fechaNacimiento')}
                    className={errors.fechaNacimiento ? 'border-red-500' : ''}
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

                <div>
                  <Label htmlFor="grupoSanguineo">Grupo Sanguíneo</Label>
                  <select
                    id="grupoSanguineo"
                    {...register('grupoSanguineo')}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Seleccionar...</option>
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

                <div>
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    {...register('nacionalidad')}
                    placeholder="Argentina"
                  />
                </div>

                <div className="lg:col-span-3">
                  <Label htmlFor="domicilio">Domicilio</Label>
                  <Input
                    id="domicilio"
                    {...register('domicilio')}
                    placeholder="Calle, número, localidad"
                  />
                </div>

                <div className="lg:col-span-3">
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input
                    id="localidad"
                    {...register('localidad')}
                    placeholder="Ciudad o localidad"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Datos Laborales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Datos Laborales</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Información del cargo y dependencia
                    </CardDescription>
                  </div>
                </div>
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
                    {jerarquiasAMostrar.map((jerarquia, index) => (
                      <option key={index} value={jerarquia}>
                        {jerarquia}
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
                    <option value="">Seleccione una sección...</option>
                    {seccionesDisponibles.map((seccion, index) => (
                      <option key={index} value={seccion}>
                        {seccion}
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
          </motion.div>

          {/* Contacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Información de Contacto
                    </CardTitle>
                  </div>
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
          </motion.div>

          {/* Armamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Armamento Asignado
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Información sobre el armamento asignado (opcional)
                    </CardDescription>
                  </div>
                </div>
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

                <div>
                  <Label htmlFor="poseeChalecoAsignado">Chaleco Asignado</Label>
                  <select
                    id="poseeChalecoAsignado"
                    {...register('poseeChalecoAsignado')}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    onChange={e => {
                      setPoseeChalecoState(e.target.value === 'SI');
                    }}
                  >
                    <option value="NO">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </div>

                {poseeChalecoState && (
                  <div>
                    <Label htmlFor="nroSerieChalecoAsignado">
                      N° de Serie Chaleco
                    </Label>
                    <Input
                      id="nroSerieChalecoAsignado"
                      {...register('nroSerieChalecoAsignado')}
                      placeholder="Número de serie del chaleco"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Otros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Otros</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Información adicional del personal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="poseeCarnetManejo">
                    Posee Carnet de Manejo
                  </Label>
                  <select
                    id="poseeCarnetManejo"
                    {...register('poseeCarnetManejo')}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    onChange={e => {
                      setPoseeCarnet(e.target.value === 'SI');
                    }}
                  >
                    <option value="NO">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </div>

                {poseeCarnet && (
                  <div className="lg:col-span-2">
                    <Label>Conduce</Label>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="conduceAutos"
                          {...register('conduceAutos')}
                          className="w-4 h-4 text-police-cyan border-gray-300 rounded focus:ring-police-cyan"
                        />
                        <Label
                          htmlFor="conduceAutos"
                          className="font-normal cursor-pointer"
                        >
                          Autos
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="conduceMotos"
                          {...register('conduceMotos')}
                          className="w-4 h-4 text-police-cyan border-gray-300 rounded focus:ring-police-cyan"
                        />
                        <Label
                          htmlFor="conduceMotos"
                          className="font-normal cursor-pointer"
                        >
                          Motos
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="conduceOtros"
                          {...register('conduceOtros')}
                          className="w-4 h-4 text-police-cyan border-gray-300 rounded focus:ring-police-cyan"
                        />
                        <Label
                          htmlFor="conduceOtros"
                          className="font-normal cursor-pointer"
                        >
                          Otros
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="poseeCredencialPolicial">
                    Posee Credencial Policial
                  </Label>
                  <select
                    id="poseeCredencialPolicial"
                    {...register('poseeCredencialPolicial')}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="NO">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="altaReparticion">
                    Alta en la Repartición
                  </Label>
                  <Input
                    id="altaReparticion"
                    type="date"
                    {...register('altaReparticion')}
                  />
                </div>

                <div>
                  <Label htmlFor="altaDepartamental">Alta Departamental</Label>
                  <Input
                    id="altaDepartamental"
                    type="date"
                    {...register('altaDepartamental')}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Archivos Adjuntos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-police-navy to-police-cyan flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Archivos Adjuntos</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Agregue documentos relacionados (opcional)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div
                  {...getArchivosRootProps()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-police-cyan hover:bg-gradient-to-br hover:from-police-cyan/5 hover:to-transparent transition-all duration-300 hover:shadow-lg"
                >
                  <input {...getArchivosInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-police-cyan" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-700 mb-1">
                        Click para seleccionar o arrastre archivos aquí
                      </p>
                      <p className="text-sm text-slate-500">
                        PDF, PNG, JPG • Máximo 10MB cada uno
                      </p>
                    </div>
                  </div>
                </div>

                {archivos.length > 0 && (
                  <motion.div
                    className="mt-6 space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {archivos.length} archivo
                        {archivos.length > 1 ? 's' : ''} seleccionado
                        {archivos.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    {archivos.map((archivo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-police-cyan/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-police-cyan" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-700">
                              {archivo.name}
                            </span>
                            <p className="text-xs text-slate-500">
                              {(archivo.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setArchivos(prev =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="hover:bg-red-100 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Botones */}
          <motion.div
            className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-6 mt-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                className="px-6 py-6 text-base font-semibold border-2 hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-police-navy via-police-navy-light to-police-cyan hover:from-police-navy-dark hover:to-police-cyan border-2 border-police-cyan/30 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <motion.span
                      className="inline-block mr-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      ⏳
                    </motion.span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar Personal
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default PersonalNew;
