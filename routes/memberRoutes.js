const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
router
  //取得指定id的USER資料
  .get('/', async (req, res) => {
    // req.locals.user = {sid:1,};
    // const { id } = req.locals.user;
    let id = 1;
    if (!id) {
      return res.status(404).json({ code: 404, message: '沒有資料' });
    }

    let sql = `SELECT * FROM member where sid = ? ;`;
    const [rows] = await db.query(sql, [id]);
    if (rows.length > 0) {
      delete rows[0]['password'];
      rows[0]['created_at'] = dayjs(rows[0]['created_at']).format('YYYY-MM-D');
      return res
        .status(200)
        .json({ code: 200, data: rows[0], message: '有資料' });
    } else {
      return res.status(404).json({ code: 404, message: '沒有資料' });
    }
  })

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的member routes' });
  });
module.exports = router;
