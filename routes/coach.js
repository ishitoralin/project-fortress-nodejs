const db = require(__dirname + '/../modules/connectDB.js');
const express = require('express');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM c_l_coachs WHERE sid = ${id}`;
  const [[data]] = await db.query(sql);

  res.json(data);
});

router.get('/', async (req, res) => {
  const sql = 'SELECT sid FROM c_l_coachs WHERE 1';
  const [datas] = await db.query(sql);

  res.json(datas.map((data) => data.sid));
});

module.exports = router;
