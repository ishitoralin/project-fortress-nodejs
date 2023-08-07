const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
// const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();

router.delete('/:sid', async (req, res) => {
  const order_sid = req.params?.sid;
  if (!order_sid) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }

  const query = `DELETE FROM order_cart WHERE order_cart.sid=?`;

  try {
    // const [result] = await db.query(query, [order_sid]);
    const [result] = await db.query(query, [order_sid]);
    const data = result;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
