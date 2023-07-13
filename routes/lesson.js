const db = require(__dirname + '/../modules/connectDB.js');
const express = require('express');

const router = express.Router();

router.get('/tags', async (req, res) => {
  const sql = `SELECT name FROM c_l_tag ORDER BY sid`;
  const [datas] = await db.query(sql);
  const tags = datas.map((data) => data.name);
  res.json(tags);
});

module.exports = router;
