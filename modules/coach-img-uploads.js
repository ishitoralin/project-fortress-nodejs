const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const extMap = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/../public/imgs/coach/coachs-img');
  },
  filename: (req, file, cb) => {
    const ext = extMap[file.mimetype];
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, !!extMap[file.mimetype]);
};

module.exports = multer({ fileFilter, storage });
