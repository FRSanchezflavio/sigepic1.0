const { uploadFoto, uploadDocumento } = require('../config/upload');
const multer = require('multer');

const uploadFotoMiddleware = (req, res, next) => {
  uploadFoto.single('foto')(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const uploadArchivosMiddleware = (req, res, next) => {
  uploadDocumento.array('archivos', 5)(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Middleware combinado para manejar foto Y archivos juntos
const uploadPersonalCompleto = (req, res, next) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'foto') {
          cb(null, 'uploads/fotos/');
        } else {
          cb(null, 'uploads/documentos/');
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }).fields([
    { name: 'foto', maxCount: 1 },
    { name: 'archivos', maxCount: 5 },
  ]);

  upload(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = {
  uploadFoto: uploadFotoMiddleware,
  uploadArchivos: uploadArchivosMiddleware,
  uploadPersonalCompleto,
};
