const fs = require('fs');
const path = require('path');

const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/fotos'),
    path.join(__dirname, '../../uploads/documentos'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  });

  console.log('✅ Directorios de uploads verificados');
};

module.exports = createUploadDirs;
