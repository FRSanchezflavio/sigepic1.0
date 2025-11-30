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

  // Generar planillas de personal (Ficha de Datos del Empleado Policial)
  async generarPlanillasPersonal(personalList) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `planillas_personal_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        const doc = new PDFDocument({ margin: 40, size: 'A4' }); // Margen ajustado
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        personalList.forEach((personal, index) => {
          if (index > 0) doc.addPage();

          // --- ENCABEZADO ---
          // Nota: Como no tengo los escudos exactos, usaré espacios o texto.
          // Si tuvieras los logos en assets, se cargarían aquí.
          
          doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('POLICÍA DE TUCUMÁN', { align: 'center' })
            .fontSize(12)
            .text('DEPARTAMENTO INTELIGENCIA CRIMINAL', { align: 'center' })
            .text('SECCION CENTRAL', { align: 'center' })
            .moveDown(1.5);

          doc
            .fontSize(12)
            .text('FICHA DE DATOS DEL EMPLEADO POLICIAL', { align: 'center', underline: true });
            
          doc.moveDown(1);

          // --- RECUADRO FOTO ---
          const photoX = (doc.page.width - 120) / 2; // Centrado
          const photoY = doc.y;
          const photoWidth = 120;
          const photoHeight = 140;

          // Dibujar recuadro
          doc.rect(photoX, photoY, photoWidth, photoHeight).stroke();

          // Cargar foto si existe
          if (personal.fotoUrl) {
            try {
              const photoPath = path.join(
                __dirname,
                '../../uploads',
                personal.fotoUrl.replace('/uploads/', '')
              );
              if (fs.existsSync(photoPath)) {
                doc.image(photoPath, photoX + 1, photoY + 1, {
                  width: photoWidth - 2,
                  height: photoHeight - 2,
                  fit: [photoWidth - 2, photoHeight - 2],
                });
              }
            } catch (err) {
              console.error('Error al cargar foto:', err);
            }
          }

          let y = photoY + photoHeight + 30;
          const leftMargin = 50;
          const contentWidth = doc.page.width - 100;

          // --- DATOS PERSONALES ---
          // Dibujar recuadro de título
          doc.rect(leftMargin, y, contentWidth, 20).stroke();
          doc.fontSize(11).font('Helvetica-Bold').text('DATOS PERSONALES', leftMargin + 5, y + 5);
          
          y += 30;
          doc.fontSize(10);

          // Helper para líneas punteadas
          const drawDottedLine = (x, y, width) => {
            doc.save()
               .dash(1, { space: 2 })
               .moveTo(x, y)
               .lineTo(x + width, y)
               .stroke()
               .restore();
          };

          // Apellido y Nombre
          doc.font('Helvetica-Bold').text('Apellido y Nombre:', leftMargin, y);
          const nameValue = `${personal.apellidos}, ${personal.nombres}`.toUpperCase();
          doc.font('Helvetica').text(nameValue, leftMargin + 110, y);
          drawDottedLine(leftMargin + 110, y + 10, contentWidth - 110);
          
          y += 20;
          // Nro. De prontuario
          doc.font('Helvetica-Bold').text('Nro. De prontuario:', leftMargin, y);
          const prontuarioValue = personal.prontuario || '';
          doc.font('Helvetica').text(prontuarioValue, leftMargin + 110, y);
          drawDottedLine(leftMargin + 110, y + 10, 150);

          y += 20;
          // Jerarquía y Legajo Personal
          doc.font('Helvetica-Bold').text('Jerarquía:', leftMargin, y);
          doc.font('Helvetica').text(personal.jerarquia?.nombre || '', leftMargin + 60, y);
          drawDottedLine(leftMargin + 60, y + 10, 180);

          doc.font('Helvetica-Bold').text('Legajo Personal:', leftMargin + 250, y);
          doc.font('Helvetica').text(personal.numeroAsignacion || '', leftMargin + 350, y);
          drawDottedLine(leftMargin + 350, y + 10, 150);

          y += 20;
          // Pertenece a División/Sección
          doc.font('Helvetica-Bold').text('Pertenece a División/Sección:', leftMargin, y);
          doc.font('Helvetica').text(personal.seccion?.nombre || '', leftMargin + 170, y);
          drawDottedLine(leftMargin + 170, y + 10, contentWidth - 170);

          y += 20;
          // DNI y CUIT/CUIL
          doc.font('Helvetica-Bold').text('DNI:', leftMargin, y);
          doc.font('Helvetica').text(personal.dni || '', leftMargin + 30, y);
          drawDottedLine(leftMargin + 30, y + 10, 150);

          doc.font('Helvetica-Bold').text('CUIT / CUIL:', leftMargin + 200, y);
          doc.font('Helvetica').text(personal.cuil || '', leftMargin + 280, y);
          drawDottedLine(leftMargin + 280, y + 10, 150);

          y += 20;
          // Fecha de Nacimiento y Nacionalidad
          doc.font('Helvetica-Bold').text('Fecha de Nacimiento:', leftMargin, y);
          doc.font('Helvetica').text(this.formatDate(personal.fechaNacimiento), leftMargin + 120, y);
          drawDottedLine(leftMargin + 120, y + 10, 120);

          doc.font('Helvetica-Bold').text('Nacionalidad:', leftMargin + 260, y);
          doc.font('Helvetica').text(personal.nacionalidad || 'ARGENTINA', leftMargin + 340, y);
          drawDottedLine(leftMargin + 340, y + 10, 150);

          y += 20;
          // Domicilio y Localidad
          doc.font('Helvetica-Bold').text('Domicilio:', leftMargin, y);
          doc.font('Helvetica').text(personal.domicilio || '', leftMargin + 60, y);
          drawDottedLine(leftMargin + 60, y + 10, 250);

          doc.font('Helvetica-Bold').text('Localidad:', leftMargin + 320, y);
          doc.font('Helvetica').text(personal.localidad || 'TUCUMÁN', leftMargin + 380, y);
          drawDottedLine(leftMargin + 380, y + 10, 120);

          y += 20;
          // Domicilio Alternativo
          doc.font('Helvetica-Bold').text('Domicilio Alternativo:', leftMargin, y);
          doc.font('Helvetica').text('', leftMargin + 120, y); // Campo vacío por defecto si no existe en BD
          drawDottedLine(leftMargin + 120, y + 10, contentWidth - 120);

          y += 20;
          // Grupo Sanguineo
          doc.font('Helvetica-Bold').text('Grupo Sanguineo:', leftMargin, y);
          doc.font('Helvetica').text(personal.grupoSanguineo || '', leftMargin + 100, y);
          drawDottedLine(leftMargin + 100, y + 10, 150);

          y += 20;
          // Teléfono Personal y Alternativo
          doc.font('Helvetica-Bold').text('Teléfono Personal:', leftMargin, y);
          doc.font('Helvetica').text(personal.celular || '', leftMargin + 100, y);
          drawDottedLine(leftMargin + 100, y + 10, 150);

          doc.font('Helvetica-Bold').text('Teléfono Alternativo:', leftMargin + 260, y);
          doc.font('Helvetica').text(personal.telefonoFijo || '', leftMargin + 370, y);
          drawDottedLine(leftMargin + 370, y + 10, 130);

          y += 40;

          // --- OTROS ---
          doc.rect(leftMargin, y, contentWidth, 20).stroke();
          doc.fontSize(11).font('Helvetica-Bold').text('OTROS', leftMargin + 5, y + 5);
          
          y += 30;
          doc.fontSize(10);

          // Carnet de Manejo
          doc.font('Helvetica-Bold').text('Carnet de Manejo posee:', leftMargin, y);
          const poseeCarnet = personal.poseeCarnetManejo ? 'SI' : 'NO';
          doc.font('Helvetica').text(`SI   /   NO    (${poseeCarnet})`, leftMargin + 130, y);

          y += 20;
          // Conduce
          doc.font('Helvetica-Bold').text('Conduce:', leftMargin, y);
          
          // Checkboxes simulados
          const checkAuto = personal.conduceAutos ? '[ X ]' : '[   ]';
          const checkMoto = personal.conduceMotos ? '[ X ]' : '[   ]';
          const checkOtros = personal.conduceOtros ? '[ X ]' : '[   ]';

          doc.font('Helvetica').text(`Autos ${checkAuto}`, leftMargin + 60, y);
          doc.text(`Motos ${checkMoto}`, leftMargin + 140, y);
          doc.text(`Otros ${checkOtros}`, leftMargin + 220, y);

          y += 20;
          // Alta de Repartición
          doc.font('Helvetica-Bold').text('Alta de Repartición:', leftMargin, y);
          doc.font('Helvetica').text(this.formatDate(personal.altaReparticion) || '', leftMargin + 110, y);
          drawDottedLine(leftMargin + 110, y + 10, 200);

          y += 20;
          // Alta Departamental
          doc.font('Helvetica-Bold').text('Alta Departamental:', leftMargin, y);
          doc.font('Helvetica').text(this.formatDate(personal.altaDependencia) || '', leftMargin + 110, y);
          drawDottedLine(leftMargin + 110, y + 10, 200);

          y += 20;
          // Chaleco Provisto
          doc.font('Helvetica-Bold').text('Chaleco Provisto:', leftMargin, y);
          const poseeChaleco = personal.poseeChalecoAsignado ? 'SI' : 'NO';
          doc.font('Helvetica').text(`SI   /   NO    (${poseeChaleco})`, leftMargin + 100, y);

          doc.font('Helvetica-Bold').text('N° de Serie:', leftMargin + 250, y);
          // Asumiendo que no hay campo específico para serie de chaleco en el modelo actual, dejo espacio
          drawDottedLine(leftMargin + 320, y + 10, 150);

          y += 20;
          // Arma provista
          doc.font('Helvetica-Bold').text('Arma provista: Marca:', leftMargin, y);
          doc.font('Helvetica').text(personal.armaTipo || '', leftMargin + 120, y);
          drawDottedLine(leftMargin + 120, y + 10, 150);

          doc.font('Helvetica-Bold').text('N° de Serie:', leftMargin + 280, y);
          doc.font('Helvetica').text(personal.nroArma || '', leftMargin + 350, y);
          drawDottedLine(leftMargin + 350, y + 10, 150);

          // Pie de página
          doc
            .fontSize(8)
            .text(
              `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', {
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
