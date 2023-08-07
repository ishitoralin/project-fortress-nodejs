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
  const query = `SELECT l.* , c.img
  FROM c_l_lessons AS l
  JOIN c_l_category AS c
  WHERE l.category_sid = c.sid`;

  let rows;
  [rows] = await db.query(query, []);
  const data = rows;
  data.forEach((el) => {
    el['parent_id'] = 4;
  });
  const shuffledData = shuffleArray(data);
  const newData = shuffledData.splice(0, 10);
  res.status(200).json({ code: 200, newData });
});

module.exports = router;
