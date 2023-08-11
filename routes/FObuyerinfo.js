const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
const { protect } = require(__dirname + '/../modules/auth.js');
router.use(protect);
router.get('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  if (!member_sid || isNaN(member_sid)) {
    return res.status(404).json({ error: '無效的id' });
  }

  const order_main = `SELECT 
  order_main.*,order_method.Method 
FROM 
  order_main 
JOIN 
  order_method 
WHERE order_main.method_sid =order_method.sid AND member_sid = ? order BY sid DESC LIMIT 1`;

  try {
    const [omrows] = await db.query(order_main, [member_sid]);
    const omdata = omrows[0]; //data = 所有資訊
    console.log(omdata[0]);
    res.status(200).json({ code: 200, omdata });
  } catch (err) {
    console.log(err);
    res.status(200).json('資料庫抓不到資料');
  }
});

module.exports = router;
