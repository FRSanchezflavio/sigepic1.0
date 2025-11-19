const { uploadFoto, uploadDocumento } = require('../config/upload');

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

module.exports = {
  uploadFoto: uploadFotoMiddleware,
  uploadArchivos: uploadArchivosMiddleware,
};
