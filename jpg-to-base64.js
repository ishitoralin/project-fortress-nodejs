const fs = require('fs');

const base64Encode = (filePath) => {
  const bitmap = fs.readFileSync(filePath);

  return new Buffer.from(bitmap).toString('base64');
};

const imgPath = './public/imgs/coach/coachs-small-img';
const imgExtend = 'jpg';
const fileNameWrited = './coachs-img-base64.json';

fs.readdir(imgPath, (error, filenames) => {
  if (error) return console.log(error);

  const datas = filenames.map((filename) => ({
    // remove suffix '-small.jpg' and add extend
    imgName: filename.slice(0, -10) + `.${imgExtend}`,
    base64Text:
      `data:image/${imgExtend};base64,` +
      base64Encode(`${imgPath}/${filename}`),
  }));

  const content = JSON.stringify(datas);

  fs.writeFile(fileNameWrited, content, (error) => console.log(error));
});
