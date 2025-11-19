const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB

// Crear directorio si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage para fotos
const fotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fotoDir = path.join(UPLOAD_DIR, 'fotos');
    if (!fs.existsSync(fotoDir)) {
      fs.mkdirSync(fotoDir, { recursive: true });
    }
    cb(null, fotoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage para documentos
const documentoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const docDir = path.join(UPLOAD_DIR, 'documentos');
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }
    cb(null, docDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro de archivos para fotos
const fotoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png)'));
  }
};

// Filtro de archivos para documentos
const documentoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const uploadFoto = multer({
  storage: fotoStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fotoFileFilter,
});

const uploadDocumento = multer({
  storage: documentoStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentoFileFilter,
});

module.exports = {
  uploadFoto,
  uploadDocumento,
  UPLOAD_DIR,
};
