import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, ArrowLeft, Filter, X, FileDown, Users } from 'lucide-react';
import { personalService } from '../services/personal.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
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
      const headers = { 'Authorization': `Bearer ${token}` };
      
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

  const handleToggleSeleccion = (id) => {
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Buscar Personal
              </h1>
              <p className="text-slate-600 mt-2">
                Filtre y descargue planillas del personal del Departamento D-2
              </p>
            </div>
            {seleccionados.length > 0 && (
              <Button
                onClick={handleDescargarPlanillas}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generando...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Descargar Planillas ({seleccionados.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <CardTitle>Filtros de Búsqueda</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            <CardDescription>
              Complete los filtros para buscar personal específico
            </CardDescription>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="search">Búsqueda general</Label>
                  <Input
                    id="search"
                    name="search"
                    value={filtros.search}
                    onChange={handleChange}
                    placeholder="Nombre, DNI, N° asignación..."
                  />
                </div>

                <div>
                  <Label htmlFor="tipoPersonal">Tipo de Personal</Label>
                  <select
                    id="tipoPersonal"
                    name="tipoPersonal"
                    value={filtros.tipoPersonal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todos</option>
                    <option value="SUPERIOR">Superior</option>
                    <option value="SUBALTERNO">Subalterno</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="jerarquiaId">Jerarquía</Label>
                  <select
                    id="jerarquiaId"
                    name="jerarquiaId"
                    value={filtros.jerarquiaId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todas</option>
                    {jerarquias.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="seccionId">Sección</Label>
                  <select
                    id="seccionId"
                    name="seccionId"
                    value={filtros.seccionId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todas</option>
                    {secciones.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="estadoServicio">Estado de Servicio</Label>
                  <select
                    id="estadoServicio"
                    name="estadoServicio"
                    value={filtros.estadoServicio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="RETIRADO">Retirado</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="jurisdiccion">Jurisdicción</Label>
                  <Input
                    id="jurisdiccion"
                    name="jurisdiccion"
                    value={filtros.jurisdiccion}
                    onChange={handleChange}
                    placeholder="Jurisdicción..."
                  />
                </div>

                <div>
                  <Label htmlFor="regional">Regional</Label>
                  <Input
                    id="regional"
                    name="regional"
                    value={filtros.regional}
                    onChange={handleChange}
                    placeholder="Regional..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBuscar} disabled={searching} className="flex-1">
                  {searching ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleLimpiar}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resultados */}
        {resultados.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <CardTitle>Resultados ({resultados.length})</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleSeleccionarTodos}>
                  {seleccionados.length === resultados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <input
                          type="checkbox"
                          checked={seleccionados.length === resultados.length && resultados.length > 0}
                          onChange={handleSeleccionarTodos}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="text-left p-3">Foto</th>
                      <th className="text-left p-3">Apellidos y Nombres</th>
                      <th className="text-left p-3">DNI</th>
                      <th className="text-left p-3">N° Asignación</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-left p-3">Jerarquía</th>
                      <th className="text-left p-3">Sección</th>
                      <th className="text-left p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map(personal => (
                      <tr key={personal.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={seleccionados.includes(personal.id)}
                            onChange={() => handleToggleSeleccion(personal.id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            {personal.fotoUrl ? (
                              <img src={personal.fotoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Users className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          {personal.apellidos}, {personal.nombres}
                        </td>
                        <td className="p-3">{personal.dni}</td>
                        <td className="p-3">{personal.numeroAsignacion || '-'}</td>
                        <td className="p-3">
                          <Badge variant={personal.tipoPersonal === 'SUPERIOR' ? 'default' : 'secondary'}>
                            {personal.tipoPersonal}
                          </Badge>
                        </td>
                        <td className="p-3">{personal.jerarquia?.nombre || '-'}</td>
                        <td className="p-3">{personal.seccion?.nombre || '-'}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              personal.estadoServicio === 'ACTIVO'
                                ? 'default'
                                : personal.estadoServicio === 'INACTIVO'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {personal.estadoServicio}
                          </Badge>
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
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">
                {filtros.search || filtros.tipoPersonal || filtros.jerarquiaId
                  ? 'No se encontraron resultados'
                  : 'Utilice los filtros para buscar personal'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalSearch;
