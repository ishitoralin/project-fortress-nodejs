const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const { protect } = require(__dirname + '/../modules/auth.js');
const router = express.Router();
router.use(protect);
router.post('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  // db暫時不存宅配方式deliveryMethod
  const { name, address, phone, email, deliveryMethod, paymentMethod } =
    req.body;
  if (!name || !address || !phone || !email) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }
  // 先找到要插入收件人資訊的欄位sid
  const targetInfo = `SELECT sid FROM order_main WHERE member_sid=${member_sid} order by  buy_time DESC LIMIT 1`;
  const [sid] = await db.query(targetInfo, []);
  const data = sid[0].sid;

  // 把資訊塞進對應的欄位
  const query = `UPDATE order_main SET pay_time=NOW(),method_sid=?,name=?,address=?,phone=?,email=?,orderNumber=NOW() WHERE member_sid=${member_sid} AND sid = ${data};`;

  try {
    const [rows] = await db.query(query, [
      deliveryMethod,
      name,
      address,
      phone,
      email,
    ]);
    const data = rows;
    res.status(200).json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
