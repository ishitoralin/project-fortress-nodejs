const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const { protect } = require(__dirname + '/../modules/auth.js');
const router = express.Router();
router.use(protect);
router.post('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  const { name, address, phone, email } = req.body;
  if (!name || !address || !phone || !email) {
    return res.status(400).json({ error: '無效的請求，請檢查輸入資料' });
  }
  // const member_sid = 5;
  const query = `INSERT INTO 
  order_main
      (member_sid, name, address, phone, email) 
  VALUES 
      (?,?,?,?,?)`;

  try {
    const [rows] = await db.query(query, [
      member_sid,
      name,
      address,
      phone,
      email,
    ]);
    const data = rows;
    res.status(200).json({ code: 200, data });
    console.log(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫更新失敗' });
  }
});

module.exports = router;
