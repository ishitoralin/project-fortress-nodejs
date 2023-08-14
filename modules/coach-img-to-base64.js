const fs = require('fs');
const jimp = require('jimp');

const shrinkImg = async (file) => {
  const result = {};
  try {
    const img = await jimp.read(file.path);
    await img.resize(10, jimp.AUTO);
    const destination = `${__dirname}/../public/imgs/coach/coachs-small-img/${file.filename}`;
    await img.writeAsync(destination);
    result.success = true;
    result.destination = destination;
  } catch (error) {
    result.success = false;
    result.error = error;
  }
  return result;
};

const base64Encode = (filePath) => {
  const bitmap = fs.readFileSync(filePath);

  return new Buffer.from(bitmap).toString('base64');
};

exports.toBase64 = async (req, res, next) => {
  const result = await shrinkImg(req.file);
  if (!result.success) return next();

  const base64Text = `data:${req.file.mimetype};base64,${base64Encode(
    result.destination
  )}`;
  req.file.base64Text = base64Text;

  next();
};
