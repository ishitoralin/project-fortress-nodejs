const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
// 從資料庫抓取資料，購物車顯示商品
// postman用get
router.get('/', async (req, res) => {
  const query = `SELECT * FROM product_name WHERE 1 ORDER BY created_at LIMIT 10`;

  let rows;
  [rows] = await db.query(query, []);
  const data = rows;
  data.forEach((el) => {
    el['parent_id'] = 1;
  });
  res.status(200).json({ code: 200, data });
});

module.exports = router;
