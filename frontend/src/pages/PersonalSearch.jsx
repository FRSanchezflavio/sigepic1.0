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
  const [jerarquias, setJerarquias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  const [filtros, setFiltros] = useState({
    search: '',
    tipoPersonal: '',
    jerarquiaId: '',
    seccionId: '',
    estadoServicio: '',
    jurisdiccion: '',
    regional: '',
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
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

  const handleBuscar = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });

      const response = await personalService.buscar(params.toString());
      setResultados(response.data.data || []);
      setSeleccionados([]);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({
      search: '',
      tipoPersonal: '',
      jerarquiaId: '',
      seccionId: '',
      estadoServicio: '',
      jurisdiccion: '',
      regional: '',
    });
    setResultados([]);
    setSeleccionados([]);
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

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Administrativo */}
        <motion.div
          className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-300 pb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8 border-slate-300 hover:bg-slate-200"
              >
                <ArrowLeft className="w-4 h-4 text-slate-700" />
              </Button>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                Búsqueda de Personal
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-11">
              DEPARTAMENTO D-2 — SISTEMA DE GESTIÓN
            </p>
          </div>
          
          {seleccionados.length > 0 && (
            <Button
              onClick={handleDescargarPlanillas}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm border border-transparent rounded-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar Selección ({seleccionados.length})
                </>
              )}
            </Button>
          )}
        </motion.div>

        {/* Panel de Filtros */}
        <Card className="mb-6 border-slate-200 shadow-sm rounded-sm bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <CardTitle className="text-sm font-bold text-slate-700 uppercase">Criterios de Búsqueda</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-6 text-xs text-slate-500 hover:text-slate-900"
              >
                {showFilters ? 'OCULTAR' : 'MOSTRAR'}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                  <Label htmlFor="search" className="text-xs font-semibold text-slate-600 uppercase">Búsqueda General</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      name="search"
                      value={filtros.search}
                      onChange={handleChange}
                      placeholder="Apellido, Nombre, DNI..."
                      className="pl-9 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tipoPersonal" className="text-xs font-semibold text-slate-600 uppercase">Tipo de Personal</Label>
                  <select
                    id="tipoPersonal"
                    name="tipoPersonal"
                    value={filtros.tipoPersonal}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-300 rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">TODOS</option>
                    <option value="SUPERIOR">SUPERIOR</option>
                    <option value="SUBALTERNO">SUBALTERNO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="jerarquiaId" className="text-xs font-semibold text-slate-600 uppercase">Jerarquía</Label>
                  <select
                    id="jerarquiaId"
                    name="jerarquiaId"
                    value={filtros.jerarquiaId}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-300 rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">TODAS</option>
                    {jerarquias.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="seccionId" className="text-xs font-semibold text-slate-600 uppercase">Sección</Label>
                  <select
                    id="seccionId"
                    name="seccionId"
                    value={filtros.seccionId}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-300 rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">TODAS</option>
                    {secciones.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="estadoServicio" className="text-xs font-semibold text-slate-600 uppercase">Estado</Label>
                  <select
                    id="estadoServicio"
                    name="estadoServicio"
                    value={filtros.estadoServicio}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-300 rounded-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">TODOS</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="RETIRADO">RETIRADO</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="jurisdiccion" className="text-xs font-semibold text-slate-600 uppercase">Jurisdicción</Label>
                  <Input
                    id="jurisdiccion"
                    name="jurisdiccion"
                    value={filtros.jurisdiccion}
                    onChange={handleChange}
                    placeholder="Jurisdicción..."
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="regional" className="text-xs font-semibold text-slate-600 uppercase">Regional</Label>
                  <Input
                    id="regional"
                    name="regional"
                    value={filtros.regional}
                    onChange={handleChange}
                    placeholder="Regional..."
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={handleLimpiar}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleBuscar}
                  disabled={searching}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-sm min-w-[120px]"
                >
                  {searching ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      BUSCAR
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resultados */}
        {resultados.length > 0 && (
          <Card className="border-slate-200 shadow-sm rounded-sm bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase">Nómina de Personal ({resultados.length})</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSeleccionarTodos}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  {seleccionados.length === resultados.length
                    ? 'Deseleccionar todos'
                    : 'Seleccionar todos'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
                    <tr>
                      <th className="p-3 w-10 text-center border-b border-slate-200">
                        <input
                          type="checkbox"
                          checked={
                            seleccionados.length === resultados.length &&
                            resultados.length > 0
                          }
                          onChange={handleSeleccionarTodos}
                          className="w-4 h-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-500"
                        />
                      </th>
                      <th className="p-3 border-b border-slate-200">Agente</th>
                      <th className="p-3 border-b border-slate-200">Identificación</th>
                      <th className="p-3 border-b border-slate-200">Jerarquía / Cargo</th>
                      <th className="p-3 border-b border-slate-200">Destino</th>
                      <th className="p-3 border-b border-slate-200 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultados.map(personal => (
                      <tr
                        key={personal.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={seleccionados.includes(personal.id)}
                            onChange={() => handleToggleSeleccion(personal.id)}
                            className="w-4 h-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                              {personal.fotoUrl ? (
                                <img
                                  src={personal.fotoUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Users className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {personal.apellidos}, {personal.nombres}
                              </div>
                              <div className="text-xs text-slate-500">
                                {personal.tipoPersonal}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <div className="text-slate-700 font-medium">DNI: {personal.dni}</div>
                            <div className="text-xs text-slate-500">Legajo: {personal.numeroAsignacion || '-'}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-900">
                              {personal.jerarquia?.nombre || '-'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {personal.cargo || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700">
                          {personal.seccion?.nombre || '-'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              personal.estadoServicio === 'ACTIVO'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : personal.estadoServicio === 'INACTIVO'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {personal.estadoServicio}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {resultados.length === 0 && !searching && (
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Sin Resultados</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-1">
              {filtros.search || filtros.tipoPersonal || filtros.jerarquiaId
                ? 'No se encontraron registros que coincidan con los criterios de búsqueda.'
                : 'Utilice el panel de filtros superior para realizar una búsqueda en el padrón.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalSearch;
