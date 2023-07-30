const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
// const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
// TODO 從前端送req.body過來，須包含所有order cart欄位資料
// postman用post

router.post('/:sid', async (req, res) => {
  const { member_sid, products_type_sid, item_sid, quantity } = req.body;
  if (!member_sid || !products_type_sid || !item_sid || isNaN(quantity)) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }

  const query = `INSERT INTO 
    order_cart
      (member_sid, products_type_sid, item_sid, quantity, created_at) 
    VALUES 
      (?,?,?,?,NOW())`;

  try {
    const [result] = await db.query(query, [
      member_sid,
      products_type_sid,
      item_sid,
      quantity,
    ]);
    const data = result;
    console.log(data);
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
