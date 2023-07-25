const express = require('express');
const db = require(__dirname + '/../../modules/connectDB.js');
const router = express.Router();
const moment = require('moment-timezone');

// ===============================================================
// === exercise ==================================================
// ===============================================================
// TODO: check the fetch SQL, is all the output needed?
//>>> get all exercise record
router.get(
  '/exercise-record/:start?/:end?',
  // >>> member middleware
  function (req, res, next) {
    res.locals.memberId = 5;
    next();
  },
  //<<<   // >>> member middleware
  async (req, res) => {
    const output = {
      success: false,
      error: '',
      data: null,
    };
    // const sid = parseInt(req.params.sid) || 0;
    // FIXME:temporate member sid
    const sid = parseInt(res.locals.memberId);
    if (!sid) {
      output.error = 'wrong id';
      return res.status(200).json(output);
    }
    const start = req.params.start || 0;
    const end = req.params.end || 0;
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!start || !end || startDate > endDate) {
      output.error = 'wrong dates';
      return res.status(200).json(output);
    }

    const fm = 'YYYY-MM-DD HH:mm:ss';

    let sql = `SELECT er.sid, er.member_sid, er.exe_type_sid AS type, et.exercise_name AS name, er.weight, er.sets, er.reps, er.exe_date AS date
    FROM record_exercise_record as er
    JOIN record_exercise_type as et ON er.exe_type_sid = et.sid
    WHERE er.member_sid = ${sid} AND DATE(er.exe_date) BETWEEN '${start}' AND '${end}'
    ORDER BY er.exe_date DESC;`;

    let [rows] = await db.query(sql);

    if (!rows.length) {
      output.error = 'no data';
      return res.status(200).json(output);
    }

    rows = rows.map((row) => {
      row.date = moment(row.date).format(fm);
      return row;
    });

    output.success = true;
    output.data = rows;
    res.json(output);
  }
);
//<<< get all exercise record

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

// >>> add exercise record
// TODO: unfinishedr
router.post('/add-record', async (req, res, next) => {
  // res.json({ a: 123 });
  let mID = 5;
  // console.log(req.body);
  const { sid, quantity, sets, reps, date } = req.body;
  // console.log(sid, quantity, sets, reps, date);

  const sql = `INSERT INTO record_exercise_record( member_sid ,  exe_type_sid ,  weight ,  sets ,  reps ,  exe_date ) VALUES ( ? , ? , ? , ? , ? , ? )`;
  let result;
  [result] = await db.query(sql, [mID, sid, quantity, sets, reps, date]);
  console.log(result);
  res.json({
    result,
    postData: req.body,
  });
});
// <<< add exercise record

module.exports = router;
