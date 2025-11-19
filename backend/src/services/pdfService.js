const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

class PDFService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../uploads/reportes');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Generar reporte de personal individual
  async generarReportePersonal(personal) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `personal_${personal.ci}_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Encabezado
        this.addHeader(doc, 'REPORTE DE PERSONAL');

        // Información Personal
        doc.fontSize(14).text('INFORMACIÓN PERSONAL', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        this.addField(doc, 'Nombres:', personal.nombres);
        this.addField(doc, 'Apellidos:', personal.apellidos);
        this.addField(doc, 'CI:', `${personal.ci} ${personal.expedicion}`);
        this.addField(
          doc,
          'Fecha Nacimiento:',
          this.formatDate(personal.fecha_nacimiento)
        );
        this.addField(
          doc,
          'Género:',
          personal.genero === 'M' ? 'Masculino' : 'Femenino'
        );
        this.addField(doc, 'Estado Civil:', personal.estado_civil);
        this.addField(doc, 'Teléfono:', personal.telefono || 'N/A');
        this.addField(doc, 'Correo:', personal.correo || 'N/A');
        this.addField(doc, 'Dirección:', personal.direccion || 'N/A');

        doc.moveDown();

        // Información Policial
        doc.fontSize(14).text('INFORMACIÓN POLICIAL', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        this.addField(doc, 'Jerarquía:', personal.jerarquia?.nombre || 'N/A');
        this.addField(doc, 'Especialidad:', personal.especialidad || 'N/A');
        this.addField(doc, 'Sección:', personal.seccion?.nombre || 'N/A');
        this.addField(
          doc,
          'Fecha Ingreso:',
          this.formatDate(personal.fecha_ingreso)
        );
        this.addField(doc, 'Estado:', personal.estado);
        this.addField(
          doc,
          'Grupo Sanguíneo:',
          personal.grupo_sanguineo || 'N/A'
        );

        doc.moveDown();

        // Contacto de Emergencia
        doc.fontSize(14).text('CONTACTO DE EMERGENCIA', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        this.addField(doc, 'Nombre:', personal.contacto_emergencia || 'N/A');
        this.addField(doc, 'Teléfono:', personal.telefono_emergencia || 'N/A');

        // Pie de página
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generar reporte de lista de personal
  async generarReporteListaPersonal(personalList, filtros = {}) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `lista_personal_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          layout: 'landscape',
        });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Encabezado
        this.addHeader(doc, 'LISTA DE PERSONAL');

        // Filtros aplicados
        if (Object.keys(filtros).length > 0) {
          doc.fontSize(10).text('Filtros aplicados:', { underline: true });
          if (filtros.estado) this.addField(doc, 'Estado:', filtros.estado);
          if (filtros.jerarquia)
            this.addField(doc, 'Jerarquía:', filtros.jerarquia);
          if (filtros.seccion) this.addField(doc, 'Sección:', filtros.seccion);
          doc.moveDown();
        }

        // Tabla de personal
        const tableTop = doc.y;
        const itemHeight = 20;
        const colWidths = [40, 150, 100, 100, 100, 80];

        // Encabezados de tabla
        doc.fontSize(9).font('Helvetica-Bold');
        let x = 50;

        doc.text('N°', x, tableTop, { width: colWidths[0] });
        x += colWidths[0];
        doc.text('Nombre Completo', x, tableTop, { width: colWidths[1] });
        x += colWidths[1];
        doc.text('CI', x, tableTop, { width: colWidths[2] });
        x += colWidths[2];
        doc.text('Jerarquía', x, tableTop, { width: colWidths[3] });
        x += colWidths[3];
        doc.text('Sección', x, tableTop, { width: colWidths[4] });
        x += colWidths[4];
        doc.text('Estado', x, tableTop, { width: colWidths[5] });

        // Línea separadora
        doc
          .moveTo(50, tableTop + 15)
          .lineTo(750, tableTop + 15)
          .stroke();

        // Datos
        doc.font('Helvetica').fontSize(8);
        let y = tableTop + itemHeight;

        personalList.forEach((personal, index) => {
          if (y > 500) {
            doc.addPage();
            y = 50;
          }

          x = 50;
          doc.text(index + 1, x, y, { width: colWidths[0] });
          x += colWidths[0];
          doc.text(`${personal.nombres} ${personal.apellidos}`, x, y, {
            width: colWidths[1],
          });
          x += colWidths[1];
          doc.text(personal.ci, x, y, { width: colWidths[2] });
          x += colWidths[2];
          doc.text(personal.jerarquia?.nombre || 'N/A', x, y, {
            width: colWidths[3],
          });
          x += colWidths[3];
          doc.text(personal.seccion?.nombre || 'N/A', x, y, {
            width: colWidths[4],
          });
          x += colWidths[4];
          doc.text(personal.estado, x, y, { width: colWidths[5] });

          y += itemHeight;
        });

        // Total
        doc.moveDown();
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`Total de registros: ${personalList.length}`, 50);

        // Pie de página
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generar reporte de estadísticas
  async generarReporteEstadisticas(estadisticas) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `estadisticas_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Encabezado
        this.addHeader(doc, 'ESTADÍSTICAS DE PERSONAL');

        // Resumen General
        doc.fontSize(14).text('RESUMEN GENERAL', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);

        this.addField(doc, 'Total Activo:', estadisticas.totalActivo || 0);
        this.addField(doc, 'Total Inactivo:', estadisticas.totalInactivo || 0);
        this.addField(
          doc,
          'Total Superiores:',
          estadisticas.totalSuperiores || 0
        );
        this.addField(
          doc,
          'Total Subalternos:',
          estadisticas.totalSubalternos || 0
        );

        doc.moveDown();

        // Por Jerarquía
        if (estadisticas.porJerarquia && estadisticas.porJerarquia.length > 0) {
          doc
            .fontSize(14)
            .text('DISTRIBUCIÓN POR JERARQUÍA', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);

          estadisticas.porJerarquia.forEach(item => {
            this.addField(doc, item.nombre + ':', item.cantidad);
          });

          doc.moveDown();
        }

        // Por Sección
        if (estadisticas.porSeccion && estadisticas.porSeccion.length > 0) {
          doc
            .fontSize(14)
            .text('DISTRIBUCIÓN POR SECCIÓN', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);

          estadisticas.porSeccion.forEach(item => {
            this.addField(doc, item.nombre + ':', item.cantidad);
          });
        }

        // Pie de página
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Métodos auxiliares
  addHeader(doc, title) {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('POLICÍA BOLIVIANA', { align: 'center' })
      .fontSize(16)
      .text('Departamento de Inteligencia Criminal D-2', { align: 'center' })
      .moveDown()
      .fontSize(14)
      .text(title, { align: 'center' })
      .moveDown(1.5);
  }

  addFooter(doc) {
    const bottom = doc.page.height - 50;
    doc.fontSize(8).text(
      `Generado el: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", {
        locale: es,
      })}`,
      50,
      bottom,
      { align: 'center' }
    );
  }

  addField(doc, label, value) {
    doc
      .font('Helvetica-Bold')
      .text(label, { continued: true })
      .font('Helvetica')
      .text(` ${value}`);
  }

  formatDate(date) {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  }

  // Generar planillas de personal (single-page con foto)
  async generarPlanillasPersonal(personalList) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `planillas_personal_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        personalList.forEach((personal, index) => {
          if (index > 0) doc.addPage();

          // Encabezado institucional
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('POLICÍA BOLIVIANA', { align: 'center' })
            .fontSize(14)
            .text('Departamento de Inteligencia Criminal D-2', {
              align: 'center',
            })
            .fontSize(12)
            .text('PLANILLA DE PERSONAL', { align: 'center' })
            .moveDown(1);

          // Foto (si existe)
          let photoY = doc.y;
          if (personal.fotoUrl) {
            try {
              const photoPath = path.join(
                __dirname,
                '../../uploads',
                personal.fotoUrl.replace('/uploads/', '')
              );
              if (fs.existsSync(photoPath)) {
                doc.image(photoPath, 450, photoY, {
                  width: 100,
                  height: 120,
                  fit: [100, 120],
                });
              }
            } catch (err) {
              console.error('Error al cargar foto:', err);
            }
          }

          // Información en dos columnas
          doc.fontSize(10);
          const leftX = 50;
          const rightX = 300;
          let y = photoY;

          // Columna izquierda
          doc.font('Helvetica-Bold').text('DATOS PERSONALES', leftX, y);
          y += 20;

          this.addFieldCompact(doc, 'Apellidos:', personal.apellidos, leftX, y);
          y += 15;
          this.addFieldCompact(doc, 'Nombres:', personal.nombres, leftX, y);
          y += 15;
          this.addFieldCompact(doc, 'DNI/CI:', personal.dni, leftX, y);
          y += 15;
          this.addFieldCompact(doc, 'CUIL:', personal.cuil || 'N/A', leftX, y);
          y += 15;
          this.addFieldCompact(
            doc,
            'Fecha Nac.:',
            this.formatDate(personal.fechaNacimiento),
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Sexo:',
            personal.sexo === 'M' ? 'Masculino' : 'Femenino',
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Estado Civil:',
            personal.estadoCivil || 'N/A',
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Profesión:',
            personal.profesion || 'N/A',
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Prontuario:',
            personal.prontuario || 'N/A',
            leftX,
            y
          );

          y += 30;
          doc.font('Helvetica-Bold').text('CONTACTO', leftX, y);
          y += 20;
          this.addFieldCompact(
            doc,
            'Celular:',
            personal.celular || 'N/A',
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Email:',
            personal.email || 'N/A',
            leftX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Domicilio:',
            personal.domicilio || 'N/A',
            leftX,
            y
          );

          // Columna derecha
          y = photoY + 140;
          doc.font('Helvetica-Bold').text('DATOS LABORALES', rightX, y);
          y += 20;
          this.addFieldCompact(
            doc,
            'N° Asignación:',
            personal.numeroAsignacion || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Tipo Personal:',
            personal.tipoPersonal,
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Jerarquía:',
            personal.jerarquia?.nombre || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'N° Cargo:',
            personal.numeroCargo || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Sección:',
            personal.seccion?.nombre || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Función Depto:',
            personal.funcionDepto || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Horario:',
            personal.horarioLaboral || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Alta Depend.:',
            this.formatDate(personal.altaDependencia),
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Jurisdicción:',
            personal.jurisdiccion || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Regional:',
            personal.regional || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'Subsidio Salud:',
            personal.subsidioSalud || 'N/A',
            rightX,
            y
          );

          y += 30;
          doc.font('Helvetica-Bold').text('ARMAMENTO', rightX, y);
          y += 20;
          this.addFieldCompact(
            doc,
            'Tipo Arma:',
            personal.armaTipo || 'N/A',
            rightX,
            y
          );
          y += 15;
          this.addFieldCompact(
            doc,
            'N° Arma:',
            personal.nroArma || 'N/A',
            rightX,
            y
          );

          // Pie de página
          doc
            .fontSize(8)
            .text(
              `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', {
                locale: es,
              })}`,
              50,
              doc.page.height - 40,
              { align: 'center' }
            );
        });

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  addFieldCompact(doc, label, value, x, y) {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(label, x, y, { continued: true, width: 100 });
    doc.font('Helvetica').text(` ${value}`, { width: 200 });
  }

  // Limpiar reportes antiguos (opcional)
  async limpiarReportesAntiguos(dias = 30) {
    const files = fs.readdirSync(this.reportsDir);
    const now = Date.now();
    const maxAge = dias * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(this.reportsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = new PDFService();
