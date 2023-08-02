const db = require(__dirname + '/../modules/connectDB.js');
const datas = require('../coachs-img-base64.json');

(async () => {
  for (let data of datas) {
    const sql = `UPDATE c_l_coachs SET img_base64 = ? WHERE img = ?`;
    const [rows] = await db.query(sql, [data.base64Text, data.imgName]);
    console.log(rows);
  }
  process.exit();
})();
