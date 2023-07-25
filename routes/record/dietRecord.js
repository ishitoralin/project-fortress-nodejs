const express = require('express');
const db = require(__dirname + '/../../modules/connectDB.js');
const router = express.Router();

// ===============================================================
// === diet ======================================================
// ===============================================================

//>>> get all diet record
router.get('/diet-record', async (req, res) => {
  let sql = `SELECT dr.sid, m.name, ft.food_type, dr.quantity,ft.calories,ft.protein,ft.unit, dr.diet_time
  FROM record_diet_record dr
  JOIN member m ON dr.member_sid = m.sid AND m.active='1'
  JOIN record_food_type ft ON dr.food_sid = ft.sid
  ORDER BY dr.diet_time DESC;`;
  let [rows] = await db.query(sql);

  if (rows.length > 0) {
    return res.status(200).json({ rows });
  } else {
    res.status(200).json({ message: '沒有資料' });
  }
  res.status(200).json({ message: '沒有資料' });
});
//<<< get all diet record

//>>> get diet record by member sid
router.get('/diet-record/:sid', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };

  const sid = parseInt(req.params.sid) || 0;
  if (!sid) {
    output.error = 'wrong id';
    return res.status(200).json(output);
  }

  let sql = `SELECT dr.sid, m.name, ft.food_type, dr.quantity,ft.calories,ft.protein,ft.unit, dr.diet_time
  FROM record_diet_record dr
  JOIN member m ON dr.member_sid = m.sid AND m.active='1'
  JOIN record_food_type ft ON dr.food_sid = ft.sid
  WHERE m.sid =${sid}
  ORDER BY dr.diet_time DESC;`;
  let [rows] = await db.query(sql);

  if (!rows.length) {
    output.error = 'no data';
    return res.status(200).json(output);
  }

  output.success = true;
  output.data = rows;
  res.json(output);
});
//<<< get diet record by member sid

module.exports = router;
