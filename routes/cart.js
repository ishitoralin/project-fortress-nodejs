const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
// router.get('/test', (req, res) => {
//   res.status(200).json({ a: 1 });
// });

// router.get('/cart', ({ query: { sid } }, res) => {
router.get('/:sid', (req, res) => {
  const sid = req.params?.sid;
  console.log('first');
  console.log(isNaN(sid), 'L14');
  console.log(!sid, 'L14');
  if (!sid || isNaN(sid)) {
    return res.status(404).json({ error: '無效的id' });
  }

  const query = 'SELECT * FROM `order_cart` WHERE member_sid = ?';

  db.query(query, [sid])
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error fetching data from database' });
    });
});

module.exports = router;
