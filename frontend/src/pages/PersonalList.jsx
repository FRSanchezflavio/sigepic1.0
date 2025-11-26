import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { personalService } from '@/services/personal.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loading from '@/components/common/Loading';
import { Search, Plus, Filter, Download, Edit, ArrowUpDown, ArrowLeft } from 'lucide-react';

export default function PersonalList() {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filtros avanzados
  const [filters, setFilters] = useState({
    tipoPersonal: '',
    jerarquia: '',
    seccion: '',
    estadoServicio: '',
  });
  const [activeFilters, setActiveFilters] = useState({}); // Filtros aplicados realmente
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: 'numeroAsignacion',
    direction: 'asc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    cargarPersonal();
  }, [pagination.page, search, activeFilters, sortConfig]);

  const cargarPersonal = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...activeFilters,
      };
      
      // Limpiar params vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await personalService.buscar(params);
      setPersonal(response.data.data);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination,
      }));
    } catch (error) {
      console.error('Error cargando personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      tipoPersonal: '',
      jerarquia: '',
      seccion: '',
      estadoServicio: '',
    };
    setFilters(emptyFilters);
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {
        search,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...activeFilters,
      };
      
      // Limpiar params vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await personalService.exportar(params);
      
      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `personal_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic update
      setPersonal(prev => prev.map(p => 
        p.id === id ? { ...p, estadoServicio: newStatus } : p
      ));
      
      await personalService.actualizar(id, { estadoServicio: newStatus });
    } catch (error) {
      console.error('Error actualizando estado:', error);
      // Revertir si falla (opcional, requeriría recargar o guardar estado previo)
      cargarPersonal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 p-8">
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

      <div className="max-w-7xl mx-auto relative z-10">
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
                Personal
              </motion.h1>
              <motion.p
                className="text-lg text-slate-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Gestión del personal de inteligencia
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                onClick={() => navigate('/personal/nuevo')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Personal
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Barra de Herramientas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 mb-6 backdrop-blur-sm bg-white/80 border-slate-200 shadow-xl">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, DNI, número de asignación..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Button 
                variant={Object.keys(activeFilters).length > 0 ? "default" : "outline"}
                onClick={() => setIsFilterOpen(true)}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogContent className="sm:max-w-[425px]" onClose={() => setIsFilterOpen(false)}>
                  <DialogHeader>
                    <DialogTitle>Filtros de Búsqueda</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Tipo de Personal</Label>
                      <Select 
                        value={filters.tipoPersonal} 
                        onChange={(e) => setFilters({...filters, tipoPersonal: e.target.value})}
                      >
                        <option value="">Seleccionar tipo</option>
                        <SelectItem value="POLICIAL">Policial</SelectItem>
                        <SelectItem value="CIVIL">Civil</SelectItem>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Jerarquía</Label>
                      <Input 
                        value={filters.jerarquia}
                        onChange={(e) => setFilters({...filters, jerarquia: e.target.value})}
                        placeholder="Ej: Comisario"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Sección</Label>
                      <Input 
                        value={filters.seccion}
                        onChange={(e) => setFilters({...filters, seccion: e.target.value})}
                        placeholder="Ej: Investigaciones"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Estado</Label>
                      <Select 
                        value={filters.estadoServicio} 
                        onChange={(e) => setFilters({...filters, estadoServicio: e.target.value})}
                      >
                        <option value="">Seleccionar estado</option>
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="RETIRO">Retiro</SelectItem>
                        <SelectItem value="LICENCIA">Licencia</SelectItem>
                        <SelectItem value="BAJA">Baja</SelectItem>
                        <SelectItem value="DISPONIBILIDAD">Disponibilidad</SelectItem>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleClearFilters}>Limpiar</Button>
                    <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={exporting}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Tabla */}
        {loading ? (
          <Loading />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-slate-200 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">N° Asignación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Apellidos y Nombres</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Jerarquía</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sección y Función</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Horario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Profesión</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Celular</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Alta Dep.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">DNI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CUIL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Fecha Nac.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Estado Civil</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sexo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Domicilio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Jurisdicción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Regional</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Arma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Chaleco</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap sticky right-0 bg-slate-50 shadow-l">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-slate-200">
                    {personal.map((p, index) => (
                      <motion.tr 
                        key={p.id} 
                        className="hover:bg-blue-50/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.numeroAsignacion || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{p.apellidos}, {p.nombres}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.jerarquia || p.jerarquiaId || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.numeroCargo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex flex-col">
                            <span className="font-medium">{p.seccion || p.seccionId || '-'}</span>
                            <span className="text-xs text-slate-400">{p.funcionDepto}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.horarioLaboral || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.profesion || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.celular || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {p.altaDependencia ? new Date(p.altaDependencia).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.dni}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.cuil || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.fechaNacimiento || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.estadoCivil || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.sexo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.domicilio || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.jurisdiccion || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.regional || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {p.armaTipo ? `${p.armaTipo} - ${p.nroArma || ''}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {p.poseeChalecoAsignado ? `SI (${p.nroSerieChalecoAsignado || ''})` : 'NO'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select 
                            value={p.estadoServicio} 
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={`w-[140px] h-8 text-xs ${
                              p.estadoServicio === 'ACTIVO' 
                                ? 'bg-cyan-50 text-cyan-900 border-cyan-200' 
                                : 'bg-gray-50 text-gray-900 border-gray-200'
                            }`}
                          >
                            <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                            <SelectItem value="RETIRO">RETIRO</SelectItem>
                            <SelectItem value="LICENCIA">LICENCIA</SelectItem>
                            <SelectItem value="BAJA">BAJA</SelectItem>
                            <SelectItem value="DISPONIBILIDAD">DISPONIBILIDAD</SelectItem>
                          </Select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white/80 backdrop-blur-sm shadow-l">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/personal/${p.id}/editar`)}
                            title="Editar"
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                            <span className="ml-2">Editar</span>
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm text-slate-700">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                  de {pagination.total} registros
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                    }
                    className="border-slate-300 hover:bg-white"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                    }
                    className="border-slate-300 hover:bg-white"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
