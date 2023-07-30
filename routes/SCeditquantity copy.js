const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
// TODO 從前端送req.body過來

// 購物車編輯數量時，可編輯購物車
router.put('/:sid', async (req, res) => {
  const sid = req.params?.sid;
  //   console.log('hello');
  if (!sid || isNaN(sid)) {
    return res.status(404).json({ error: '無效的id' });
  }
  // 前端送req過來，要包含member sid、order sid、quantity
  // 解構req.body，先判定有沒有接收到資料
  //   const { quantity } = req.body;
  //   if (isNaN(quantity)) {
  //     return res.status(400).json({ error: '無效的數量' });
  //   }

  // 假設有的話開始處理，把order sid 丟進where sid，quantity丟進quantity
  const query = `UPDATE 
  order_cart 
SET 
  quantity=?
WHERE 
  sid = ?`;

  //執行資料庫修改，quantity暫時先填4避免server crash
  try {
    // Provide the correct values in the db.query function
    const [result] = await db.query(query, [4, sid]);
    const data = result;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
