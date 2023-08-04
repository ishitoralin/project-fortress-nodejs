const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
// 從資料庫抓取資料，購物車顯示商品
// postman用get

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

router.get('/', async (req, res) => {
  const query = `SELECT * FROM product_name WHERE 1`;

  let rows;
  [rows] = await db.query(query, []);
  const data = rows;
  data.forEach((el) => {
    el['parent_id'] = 1;
  });
  const shuffledData = shuffleArray(data);
  const newData = shuffledData.splice(0, 10);
  res.status(200).json({ code: 200, newData });
});

module.exports = router;
