const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
router.get('/test', (req, res) => {
  res.status(200).json({ a: 1 });
});
module.exports = router;
