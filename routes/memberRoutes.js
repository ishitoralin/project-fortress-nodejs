const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const router = express.Router();
router
  //取得指定id的USER資料
  .get('/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: '沒有資料' });
    }
    console.log(id);

    let sql = `SELECT * FROM address_book where sid = ? ;`;
    const [rows] = await db.query(sql, [id]);
    if (rows.length > 0) {
      return res.status(200).json({ rows });
    } else {
      res.status(200).json({ message: '沒有資料' });
    }
    res.status(200).json({ message: '沒有資料' });
  })

  .use('*', (req, res) => {
    res.status(200).json({ message: '錯誤的member routes' });
  });
module.exports = router;
