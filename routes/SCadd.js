const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
// const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
// TODO 從前端送req.body過來，須包含所有order cart欄位資料，
// sid、member_sid、product_type_sid、item_sid、quantity、create_at
// sid由DB自產、create_at用now()

router.post('/', async (req, res) => {
  const { member_sid, products_type_sid, item_sid, quantity } = req.body;

  // Validate the required data (optional)
  if (!member_sid || !products_type_sid || !item_sid || isNaN(quantity)) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }

  const query = `INSERT INTO 
  order_cart
    (member_sid, products_type_sid, item_sid, quantity, created_at) 
  VALUES 
    (?,?,?,?,NOW())`;

  //執行資料庫修改，quantity暫時先填4避免server crash
  try {
    // Provide the correct values in the db.query function
    const [result] = await db.query(query, [
      member_sid,
      products_type_sid,
      item_sid,
      quantity,
    ]);
    const data = result;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
