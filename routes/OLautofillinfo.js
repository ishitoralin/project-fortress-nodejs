const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
const { protect } = require(__dirname + '/../modules/auth.js');
// router.use(protect);

router.get('/', async (req, res) => {
//   const { sid: member_sid } = res.locals.user;
//   if (!member_sid || isNaN(member_sid)) {
//     return res.status(404).json({ error: '無效的id' });
//   }
// TODO 自動import member data
  const query = `SELECT email, name, mobile,address FROM member WHERE sid = 5;`;

  const [rows] = await db.query(query, []);
  const data = rows;
  console.log(data);
  res.status(200).json({ code: 200, data });
});

module.exports = router;
