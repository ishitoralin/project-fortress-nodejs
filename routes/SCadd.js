const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
// const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const { protect } = require(__dirname + '/../modules/auth.js');
const router = express.Router();

router.use(protect);
router.post('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  const { products_type_sid, item_sid, quantity } = req.body;
  if (!products_type_sid || !item_sid || isNaN(quantity)) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }

  // 先將req.body比對SQL，搜尋是否有重複data，count = 0時直接將data寫入database
  const SQLDataSearch = `SELECT count(1) FROM order_cart WHERE member_sid = ${member_sid} AND products_type_sid = ${products_type_sid} AND item_sid = ${item_sid}`;
  const oldData = await db.query(SQLDataSearch, []);
  const [existData] = oldData[0];

  // count = 0的情形(沒相同資料)
  if ([existData][0]['count(1)'] === 0) {
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
      // const [result] = await db.query(query, [5, 1, 1, 1]);
      const data = result;

      res.status(200).json({ code: 200, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '資料庫更新失敗' });
    }
  }

  // 有重複資料(count !==0)
  if ([existData][0]['count(1)'] !== 0) {
    // 先把重複的資料撈出來
    const oldData2 = `SELECT * FROM order_cart WHERE member_sid = ${member_sid} AND products_type_sid = ${products_type_sid} AND item_sid= ${item_sid}`;
    // 找出舊資料的quantity
    const oldQuantity = await db.query(oldData2, []);
    const [quantity2] = oldQuantity;
    const query = `UPDATE
    order_cart
  SET
    quantity=?
  WHERE
    member_sid = ? AND products_type_sid = ? AND item_sid = ?`;

    try {
      const [result] = await db.query(query, [
        [quantity2][0][0]['quantity'] + quantity,
        member_sid,
        products_type_sid,
        item_sid,
      ]);
      const data = result;
      res.status(200).json({ code: 200, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '資料庫更新失敗' });
    }
  }
});

module.exports = router;
