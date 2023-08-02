const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
// 從資料庫抓取資料，購物車顯示商品
// postman用get
const { protect } = require(__dirname + '/../modules/auth.js');
// router.use(protect);
router.get('/', async (req, res) => {
  //   const { sid } = res.locals.user;
  //   if (!sid || isNaN(sid)) {
  //     return res.status(404).json({ error: '無效的id' });
  //   }

  const mainData = `SELECT * FROM order_main WHERE member_sid = ? ORDER BY buy_time DESC LIMIT 1`;
  const [dataFromMain] = await db.query(mainData, [5]);
  //   const order_sid = dataFromMain[0];
  const { sid } = dataFromMain[0];

  const lastestOrder = `SELECT * FROM order_detail WHERE member_sid = ?`;
  console.log(sid);
  res.status(200).json({ code: 200 });
});

module.exports = router;
