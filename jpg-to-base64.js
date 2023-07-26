const fs = require('fs');

const base64Encode = (filePath) => {
  const bitmap = fs.readFileSync(filePath);

  return new Buffer.from(bitmap).toString('base64');
};

fs.readdir('./lessons-small-img', (error, filenames) => {
  if (error) return console.log(error);

  const datas = filenames.map((file) => ({
    imgName: file.slice(0, -10) + '.jpg',
    base64Text:
      'data:image/jpg;base64,' + base64Encode(`./lessons-small-img/${file}`),
  }));

  const content = JSON.stringify(datas);

  fs.writeFile('./base64data.json', content, (error) => console.log(error));
});
