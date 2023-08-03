const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
// const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const { protect } = require(__dirname + '/../modules/auth.js');
const router = express.Router();

router.use(protect);
router.post('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  //   const member_sid = 5;

  //db抓出來的所有order_cart資料，陣列
  const getData = `SELECT * FROM order_cart WHERE member_sid = ${member_sid}`;
  const [cart] = await db.query(getData, []);

  //把資料塞到order_main
  const insertDataToMain = `INSERT INTO 
  order_main
  (member_sid, member_coupon_relation_sid, amount, 
    buy_time, pay_time, method_sid, 
    payment, name,address,phone,email) 
  VALUES 
  (?,?,?,
    NOW(),?,?,
    ?,?,?,
    ?,?)`;
  await db.query(insertDataToMain, [
    `${member_sid}`,
    null,
    cart.length,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  //   把剛剛的order_main資料撈出來(為了取他的sid)
  const updatedMainData = `SELECT * FROM order_main WHERE member_sid = ${member_sid} ORDER BY buy_time DESC LIMIT 1`;
  const [getMainData] = await db.query(updatedMainData, []);
  const { sid } = getMainData[0]; //取新建的order_main的sid

  //   把資料塞到order_detail

  cart.map(async (v) => {
    const { products_type_sid, item_sid, quantity } = v;
    const insertDataToDetail = `INSERT INTO
    order_detail(order_sid, member_sid, products_type_sid,
      item_sid, quantity, created_at)
    VALUES (?,?,?,?,?,NOW())`;
    await db.query(insertDataToDetail, [
      sid,
      member_sid,
      products_type_sid,
      item_sid,
      quantity,
    ]);
  });

  //   TODO remove data from order_cart
  try {
    res.status(200).json({ code: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
