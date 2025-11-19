import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
import { Alert, AlertDescription } from '../components/ui/alert';
import Loading from '../components/common/Loading';

const PersonalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jerarquias, setJerarquias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalRes, jerarquiasRes, seccionesRes] = await Promise.all([
        personalService.getById(id),
        fetch('/api/jerarquias'),
        fetch('/api/secciones'),
      ]);

      const jerarquiasData = await jerarquiasRes.json();
      const seccionesData = await seccionesRes.json();

      setJerarquias(jerarquiasData.data || []);
      setSecciones(seccionesData.data || []);

      const personal = personalRes.data;
      setFormData({
        nombres: personal.nombres || '',
        apellidos: personal.apellidos || '',
        ci: personal.ci || '',
        expedicion: personal.expedicion || '',
        fecha_nacimiento: personal.fecha_nacimiento
          ? personal.fecha_nacimiento.split('T')[0]
          : '',
        genero: personal.genero || 'M',
        estado_civil: personal.estado_civil || 'SOLTERO',
        nacionalidad: personal.nacionalidad || 'Boliviana',
        telefono: personal.telefono || '',
        correo: personal.correo || '',
        direccion: personal.direccion || '',
        jerarquiaId: personal.jerarquiaId || '',
        especialidad: personal.especialidad || '',
        seccionId: personal.seccionId || '',
        fecha_ingreso: personal.fecha_ingreso
          ? personal.fecha_ingreso.split('T')[0]
          : '',
        estado: personal.estado || 'ACTIVO',
        grupo_sanguineo: personal.grupo_sanguineo || '',
        contacto_emergencia: personal.contacto_emergencia || '',
        telefono_emergencia: personal.telefono_emergencia || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
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
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dataToSend = {
        ...formData,
        jerarquiaId: parseInt(formData.jerarquiaId),
        seccionId: parseInt(formData.seccionId),
      };

      await personalService.update(id, dataToSend);
      setSuccess('Personal actualizado exitosamente');
      setTimeout(() => navigate('/personal'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al actualizar el personal'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>
            No se pudo cargar la información del personal
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/personal')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Personal
            </h1>
            <p className="text-gray-600 mt-2">
              Actualice la información del personal
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
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
                  disabled
                />
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
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="BAJA">Baja</option>
                  <option value="LICENCIA">Licencia</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/personal')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalEdit;
