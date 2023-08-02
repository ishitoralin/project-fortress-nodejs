const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
// TODO 從前端送req.body過來，要怎麼判斷member_sid
// postman 用put
// 購物車編輯數量時，可編輯購物車

// /:sid指的是產品sid，並非會員
router.put('/:sid', async (req, res) => {
  const sid = req.params?.sid;
  //   console.log('hello');

  if (!sid || isNaN(sid)) {
    return res.status(404).json({ error: '無效的id' });
  }
  // 前端送req過來，要包含order_sid、quantity
  // 解構req.body，先判定有沒有接收到資料
  const { order_sid, quantity } = req.body;
  if (isNaN(quantity)) {
    return res.status(400).json({ error: '無效的數量' });
  }

  // 假設有的話開始處理，把order sid 丟進where sid，quantity丟進quantity
  const query = `UPDATE
  order_cart 
SET 
  quantity=?
WHERE 
  sid = ?`;

  try {
    const [result] = await db.query(query, [quantity, order_sid]);
    const data = result;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
