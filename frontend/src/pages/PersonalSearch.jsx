import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  ArrowLeft,
  Filter,
  X,
  FileDown,
  Users,
  Eye,
  Edit,
  SortAsc,
  SortDesc,
  ChevronRight,
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
} from '../components/ui/card';
import Loading from '../components/common/Loading';

const PersonalSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [sortField, setSortField] = useState('apellidos');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Jerarquías y secciones estáticas
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

  const secciones = [
    'Delitos Generales y Especiales',
    'Cibercrimen',
    'Of. Central',
    'Análisis Informática Forense',
    'Explotación de Prensa',
    'Análisis Delictual',
  ];

  const [filtros, setFiltros] = useState({
    search: '',
    tipoPersonal: '',
    jerarquia: '',
    seccion: '',
    estadoServicio: '',
    jurisdiccion: '',
    regional: '',
    sexo: '',
    estadoCivil: '',
    grupoSanguineo: '',
  });

  const handleBuscar = async (resetPage = true) => {
    setSearching(true);
    try {
      const params = {
        ...filtros,
        page: resetPage ? 1 : page,
        limit: 20,
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      // Remover valores vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await personalService.buscar(params);

      setResultados(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.totalPages || 0);
      if (resetPage) setPage(1);
      setSeleccionados([]);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResultados([]);
    } finally {
      setSearching(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({
      search: '',
      tipoPersonal: '',
      jerarquia: '',
      seccion: '',
      estadoServicio: '',
      jurisdiccion: '',
      regional: '',
      sexo: '',
      estadoCivil: '',
      grupoSanguineo: '',
    });
    setResultados([]);
    setSeleccionados([]);
    setPage(1);
  };

  const handleToggleSeleccion = id => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSeleccionarTodos = () => {
    if (seleccionados.length === resultados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(resultados.map(p => p.id));
    }
  };

  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDescargarPlanillas = async () => {
    if (seleccionados.length === 0) {
      alert('Seleccione al menos un personal');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/personal/planillas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ids: seleccionados }),
      });

      if (!response.ok) throw new Error('Error al generar planillas');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planillas-personal-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar planillas:', error);
      alert('Error al generar las planillas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (sortField || sortOrder) {
      handleBuscar(false);
    }
  }, [sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <motion.h1
                className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-police-navy via-police-navy-light to-police-cyan dark:from-sky-300 dark:via-blue-400 dark:to-cyan-300 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Búsqueda Avanzada de Personal
              </motion.h1>
              <motion.p
                className="text-lg text-slate-600 dark:text-slate-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Sistema de consulta integral del padrón policial
              </motion.p>
            </div>

            {seleccionados.length > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Button
                  onClick={handleDescargarPlanillas}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-5 h-5 mr-2" />
                      Exportar ({seleccionados.length})
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Panel de Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Criterios de Búsqueda
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Filtre por múltiples parámetros simultáneamente
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
              </div>
            </CardHeader>

            {showFilters && (
              <CardContent className="p-6">
                {/* Búsqueda General */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Búsqueda General
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      name="search"
                      value={filtros.search}
                      onChange={handleChange}
                      placeholder="Buscar por apellido, nombre, DNI, legajo..."
                      className="pl-12 h-12 text-base border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      onKeyPress={e => e.key === 'Enter' && handleBuscar()}
                    />
                  </div>
                </div>

                {/* Filtros Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tipo de Personal
                    </Label>
                    <select
                      name="tipoPersonal"
                      value={filtros.tipoPersonal}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="SUPERIOR">Superior</option>
                      <option value="SUBALTERNO">Subalterno</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Jerarquía
                    </Label>
                    <select
                      name="jerarquia"
                      value={filtros.jerarquia}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      <optgroup label="Superiores">
                        {jerarquiasSuperiores.map(j => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Subalternos">
                        {jerarquiasSubalternas.map(j => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Sección
                    </Label>
                    <select
                      name="seccion"
                      value={filtros.seccion}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      {secciones.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Estado de Servicio
                    </Label>
                    <select
                      name="estadoServicio"
                      value={filtros.estadoServicio}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="LICENCIA">Licencia</option>
                      <option value="SUSPENSION">Suspensión</option>
                      <option value="RETIRADO">Retirado</option>
                      <option value="BAJA">Baja</option>
                    </select>
                  </div>
                </div>

                {/* Filtros Adicionales */}
                <details className="group mb-4">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-3">
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    Filtros Adicionales
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-3 pl-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Jurisdicción
                      </Label>
                      <Input
                        name="jurisdiccion"
                        value={filtros.jurisdiccion}
                        onChange={handleChange}
                        placeholder="Ej: CRIA 1ra"
                        className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Regional
                      </Label>
                      <Input
                        name="regional"
                        value={filtros.regional}
                        onChange={handleChange}
                        placeholder="Ej: Tucumán"
                        className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sexo
                      </Label>
                      <select
                        name="sexo"
                        value={filtros.sexo}
                        onChange={handleChange}
                        className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Estado Civil
                      </Label>
                      <select
                        name="estadoCivil"
                        value={filtros.estadoCivil}
                        onChange={handleChange}
                        className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        <option value="SOLTERO">Soltero/a</option>
                        <option value="CASADO">Casado/a</option>
                        <option value="DIVORCIADO">Divorciado/a</option>
                        <option value="VIUDO">Viudo/a</option>
                        <option value="CONCUBINO">Concubinato</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Grupo Sanguíneo
                      </Label>
                      <select
                        name="grupoSanguineo"
                        value={filtros.grupoSanguineo}
                        onChange={handleChange}
                        className="w-full h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
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
                  </div>
                </details>

                {/* Acciones */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {Object.values(filtros).filter(v => v !== '').length >
                      0 && (
                      <span>
                        {Object.values(filtros).filter(v => v !== '').length}{' '}
                        filtro(s) activo(s)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleLimpiar}
                      className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar
                    </Button>
                    <Button
                      onClick={() => handleBuscar(true)}
                      disabled={searching}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white min-w-[140px]"
                    >
                      {searching ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Resultados */}
        {resultados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Resultados de Búsqueda
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {total} registro{total !== 1 ? 's' : ''} encontrado
                        {total !== 1 ? 's' : ''}
                        {seleccionados.length > 0 &&
                          ` · ${seleccionados.length} seleccionado${
                            seleccionados.length !== 1 ? 's' : ''
                          }`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSeleccionarTodos}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      {seleccionados.length === resultados.length
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={
                              seleccionados.length === resultados.length &&
                              resultados.length > 0
                            }
                            onChange={handleSeleccionarTodos}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-4 text-left">
                          <button
                            onClick={() => handleSort('apellidos')}
                            className="flex items-center gap-2 font-semibold text-sm text-slate-700 hover:text-slate-900"
                          >
                            Apellido y Nombre
                            {sortField === 'apellidos' &&
                              (sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                              ) : (
                                <SortDesc className="w-4 h-4" />
                              ))}
                          </button>
                        </th>
                        <th className="p-4 text-left">
                          <button
                            onClick={() => handleSort('dni')}
                            className="flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            Identificación
                            {sortField === 'dni' &&
                              (sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                              ) : (
                                <SortDesc className="w-4 h-4" />
                              ))}
                          </button>
                        </th>
                        <th className="p-4 text-left">
                          <button
                            onClick={() => handleSort('jerarquia')}
                            className="flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            Jerarquía
                            {sortField === 'jerarquia' &&
                              (sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                              ) : (
                                <SortDesc className="w-4 h-4" />
                              ))}
                          </button>
                        </th>
                        <th className="p-4 text-left font-semibold text-sm text-slate-700 dark:text-slate-300">
                          Sección
                        </th>
                        <th className="p-4 text-center">
                          <button
                            onClick={() => handleSort('estadoServicio')}
                            className="flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            Estado
                            {sortField === 'estadoServicio' &&
                              (sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                              ) : (
                                <SortDesc className="w-4 h-4" />
                              ))}
                          </button>
                        </th>
                        <th className="p-4 text-center font-semibold text-sm text-slate-700 dark:text-slate-300">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resultados.map((personal, index) => (
                        <motion.tr
                          key={personal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                        >
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={seleccionados.includes(personal.id)}
                              onChange={() =>
                                handleToggleSeleccion(personal.id)
                              }
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
                                {personal.fotoUrl ? (
                                  <img
                                    src={personal.fotoUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-blue-600">
                                    <Users className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {personal.apellidos}, {personal.nombres}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-medium">
                                    {personal.tipoPersonal}
                                  </span>
                                  {personal.sexo && (
                                    <span className="text-slate-400 dark:text-slate-500">
                                      •{' '}
                                      {personal.sexo === 'M'
                                        ? 'Masculino'
                                        : 'Femenino'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  DNI:
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                  {personal.dni}
                                </span>
                              </div>
                              {personal.numeroAsignacion && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Leg:
                                  </span>
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {personal.numeroAsignacion}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-200">
                                {personal.jerarquia || '-'}
                              </div>
                              {personal.cargo && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {personal.cargo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                              {personal.seccion || '-'}
                            </div>
                            {personal.jurisdiccion && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {personal.jurisdiccion}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                personal.estadoServicio === 'ACTIVO'
                                  ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                  : personal.estadoServicio === 'LICENCIA'
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                  : personal.estadoServicio === 'SUSPENSION'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}
                            >
                              {personal.estadoServicio || 'N/D'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (
                                    personal.archivosAdjuntos &&
                                    personal.archivosAdjuntos.length > 0
                                  ) {
                                    const ultimoArchivo =
                                      personal.archivosAdjuntos[
                                        personal.archivosAdjuntos.length - 1
                                      ];
                                    window.open(
                                      ultimoArchivo.url,
                                      '_blank'
                                    );
                                  } else {
                                    alert(
                                      'Este personal no tiene archivos adjuntos.'
                                    );
                                  }
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Descargar Adjunto"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      '/api/personal/planillas',
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          Authorization: `Bearer ${localStorage.getItem(
                                            'token'
                                          )}`,
                                        },
                                        body: JSON.stringify({
                                          ids: [personal.id],
                                        }),
                                      }
                                    );

                                    if (!response.ok)
                                      throw new Error(
                                        'Error al generar planilla'
                                      );

                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `planilla-${personal.apellidos}-${personal.nombres}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (error) {
                                    console.error(
                                      'Error al descargar planilla:',
                                      error
                                    );
                                    alert('Error al generar la planilla');
                                  }
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                                title="Generar Planilla"
                              >
                                <FileDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Página {page} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(p => Math.max(1, p - 1));
                          handleBuscar(false);
                        }}
                        disabled={page === 1}
                        className="border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(p => Math.min(totalPages, p + 1));
                          handleBuscar(false);
                        }}
                        disabled={page === totalPages}
                        className="border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Estado vacío */}
        {resultados.length === 0 && !searching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20 backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl"
          >
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Inicie una búsqueda
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filtros.search || Object.values(filtros).some(v => v !== '')
                ? 'No se encontraron resultados con los criterios especificados.'
                : 'Utilice los filtros de búsqueda para encontrar personal en el sistema.'}
            </p>
            {Object.values(filtros).some(v => v !== '') && (
              <Button
                onClick={handleLimpiar}
                className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Limpiar filtros
              </Button>
            )}
          </motion.div>
        )}

        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Buscando personal...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalSearch;
