const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
router.get('/', async (req, res) => {
  const query = `SELECT * FROM order_delivery_method WHERE 1`;
  try {
    const [rows] = await db.query(query, []);
    const data = rows;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
