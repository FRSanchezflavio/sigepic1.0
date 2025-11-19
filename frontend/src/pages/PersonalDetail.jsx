import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { personalService } from '../services/personal.service';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';

const PersonalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState(null);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPersonal();
  }, [id]);

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const response = await personalService.getById(id);
      setPersonal(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await personalService.delete(id);
      navigate('/personal');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-BO');
  };

  const getStatusBadge = estado => {
    const variants = {
      ACTIVO: 'success',
      INACTIVO: 'warning',
      BAJA: 'danger',
      LICENCIA: 'info',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!personal) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Personal no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/personal')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {personal.nombres} {personal.apellidos}
              </h1>
              <p className="text-gray-600 mt-1">
                CI: {personal.ci} {personal.expedicion} |{' '}
                {personal.jerarquia?.nombre}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {hasPermission('personal', 'actualizar') && (
              <Button onClick={() => navigate(`/personal/editar/${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {hasPermission('personal', 'eliminar') && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Foto */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {personal.foto ? (
                  <img
                    src={personal.foto}
                    alt={`${personal.nombres} ${personal.apellidos}`}
                    className="w-40 h-40 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-5xl text-gray-400">
                      {personal.nombres[0]}
                      {personal.apellidos[0]}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  {getStatusBadge(personal.estado)}
                  <p className="text-sm text-gray-600 mt-2">
                    {personal.jerarquia?.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {personal.seccion?.nombre}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Rápida */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{personal.telefono || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{personal.correo || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{personal.direccion || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>
                  Fecha de Ingreso: {formatDate(personal.fecha_ingreso)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalles Completos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow
                label="Nombres Completos"
                value={`${personal.nombres} ${personal.apellidos}`}
              />
              <InfoRow
                label="CI"
                value={`${personal.ci} ${personal.expedicion}`}
              />
              <InfoRow
                label="Fecha de Nacimiento"
                value={formatDate(personal.fecha_nacimiento)}
              />
              <InfoRow
                label="Género"
                value={personal.genero === 'M' ? 'Masculino' : 'Femenino'}
              />
              <InfoRow label="Estado Civil" value={personal.estado_civil} />
              <InfoRow label="Nacionalidad" value={personal.nacionalidad} />
              <InfoRow
                label="Grupo Sanguíneo"
                value={personal.grupo_sanguineo || 'No registrado'}
              />
            </CardContent>
          </Card>

          {/* Datos Policiales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Policiales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="Jerarquía" value={personal.jerarquia?.nombre} />
              <InfoRow label="Tipo" value={personal.jerarquia?.tipo} />
              <InfoRow
                label="Especialidad"
                value={personal.especialidad || 'No especificado'}
              />
              <InfoRow label="Sección" value={personal.seccion?.nombre} />
              <InfoRow
                label="Fecha de Ingreso"
                value={formatDate(personal.fecha_ingreso)}
              />
              <InfoRow
                label="Estado"
                value={<>{getStatusBadge(personal.estado)}</>}
              />
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow
                label="Nombre"
                value={personal.contacto_emergencia || 'No registrado'}
              />
              <InfoRow
                label="Teléfono"
                value={personal.telefono_emergencia || 'No registrado'}
              />
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow
                label="Registrado"
                value={formatDate(personal.createdAt)}
              />
              <InfoRow
                label="Última Actualización"
                value={formatDate(personal.updatedAt)}
              />
              <InfoRow label="ID del Registro" value={personal.id} />
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Confirmación de Eliminación */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent onClose={() => setShowDeleteDialog(false)}>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea eliminar el registro de{' '}
                {personal.nombres} {personal.apellidos}? Esta acción no se puede
                deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar información
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-1 border-b border-gray-100">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default PersonalDetail;
