const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const router = express.Router();

// ===============================================================
// === exercise ==================================================
// ===============================================================
router.get('/exercise-type', async (req, res) => {
  let sql = `SELECT * FROM record_exercise_type ;`;
  let [rows] = await db.query(sql);
  // >>> only return status !=0
  rows = rows.map((ele) => {
    if (ele.status != 0) {
      return ele;
    }
  });
  // <<< only return status !=0
  if (rows.length > 0) {
    return res.status(200).json({ rows });
  } else {
    res.status(200).json({ message: '沒有資料' });
  }
  res.status(200).json({ message: '沒有資料' });
});

// ===============================================================
// === food ==================================================
// ===============================================================
router.get('/food-type', async (req, res) => {
  let sql = `SELECT * FROM record_food_type ;`;
  let [rows] = await db.query(sql);
  // >>> only return status !=0
  rows = rows.map((ele) => {
    if (ele.status != 0) {
      return ele;
    }
  });
  // <<< only return status !=0
  if (rows.length > 0) {
    return res.status(200).json({ rows });
  } else {
    res.status(200).json({ message: '沒有資料' });
  }
  res.status(200).json({ message: '沒有資料' });
});

module.exports = router;
