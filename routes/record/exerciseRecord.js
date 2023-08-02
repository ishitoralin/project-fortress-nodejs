const express = require('express');
const db = require(__dirname + '/../../modules/connectDB.js');
const router = express.Router();
const moment = require('moment-timezone');

const { protect } = require(__dirname + '/../../modules/auth.js');
router.use(protect);
// ===============================================================
// === exercise ==================================================
// ===============================================================
//>>> get all exercise record =======================================================================
router.get(
  '/exercise-record/:start?/:end?',
  // >>> member middleware
  // function (req, res, next) {
  //   res.locals.memberId = 5;
  //   next();
  // },
  //<<<   // >>> member middleware
  async (req, res) => {
    const output = {
      success: false,
      error: '',
      data: null,
    };
    // const sid = parseInt(req.params.sid) || 0;
    // FIXME:temporate member sid
    // const sid = parseInt(res.locals.memberId);
    const { sid: mID } = res.locals.user; // add auth
    if (!mID) {
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

    const fm = 'YYYY-MM-DD';
    let sql = `SELECT er.sid, er.member_sid, er.exe_type_sid AS typeID, et.exercise_name AS name, et.exercise_description, er.weight AS quantity, er.sets, er.reps, et.exercise_img AS img, DATE(er.exe_date) AS date
    FROM record_exercise_record as er
    JOIN record_exercise_type as et ON er.exe_type_sid = et.sid
    WHERE er.member_sid = ${mID} AND DATE(er.exe_date) BETWEEN '${start}' AND '${end}'
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
    // console.log(rows);
    output.success = true;
    output.data = rows;
    res.json(output);
  }
);
//<<< get all exercise record

// >>> add exercise record =======================================================================
router.post('/add-record', async (req, res, next) => {
  // let mID = 5; //for test
  const { sid: mID } = res.locals.user; // add auth
  const { typeID, quantity, sets, reps, date } = req.body;

  const sql = `INSERT INTO record_exercise_record( member_sid ,  exe_type_sid ,  weight ,  sets ,  reps ,  exe_date ) VALUES ( ? , ? , ? , ? , ? , ? )`;
  let result;
  [result] = await db.query(sql, [mID, typeID, quantity, sets, reps, date]);
  res.json({
    result,
    postData: req.body,
  });
});
// <<< add exercise record

// >>> delete exercise record for one centain date =======================================================================
router.delete('/delete-record', async (req, res, next) => {
  // let mID = 5;
  const { sid: mID } = res.locals.user; // add auth
  const output = {
    success: false,
    error: '',
    result: null,
  };

  const { date } = req.body;
  if (!date) {
    output.error = 'wrong date';
    return res.status(200).json(output);
  }

  const sql = `DELETE FROM record_exercise_record
  WHERE exe_date='${date}' AND member_sid=${mID}`;
  [output.result] = await db.query(sql);

  output.success = true;
  res.json(output);
});
// <<< delete exercise record for one centain date

// >>> get exercise for plot =======================================================================
router.get(
  '/exercise-record-plot/:start/:end/:exeSid',
  // >>> member middleware
  // function (req, res, next) {
  //   res.locals.memberId = 5;
  //   next();
  // },
  //<<<   // >>> member middleware
  async (req, res) => {
    const output = {
      success: false,
      error: '',
      data: null,
    };
    // const sid = parseInt(res.locals.memberId);

    const { sid: mID } = res.locals.user; // add auth
    const exeSid = req.params.exeSid || 0;
    if (!mID) {
      output.error = 'wrong id';
      return res.status(200).json(output);
    }
    if (!exeSid) {
      output.error = 'wrong exercsie id';
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

    const fm = 'YYYY-MM-DD';
    // old select :SELECT er.sid, er.member_sid, er.exe_type_sid AS typeID, et.exercise_name AS name, er.weight AS quantity, er.sets, er.reps, DATE(er.exe_date) AS date
    let sql = `SELECT er.member_sid, er.exe_type_sid AS typeID, et.exercise_name AS name, er.weight AS quantity, er.sets, er.reps, DATE(er.exe_date) AS date
    FROM record_exercise_record as er
    JOIN record_exercise_type as et ON er.exe_type_sid = et.sid
    WHERE er.member_sid = ${mID} AND er.exe_type_sid = ${exeSid} AND DATE(er.exe_date) BETWEEN '${start}' AND '${end}'
    ORDER BY er.exe_date DESC;`;
    let [rows] = await db.query(sql);

    if (!rows.length) {
      output.error = 'no data';
      return res.status(200).json(output);
    }

    rows = rows.map((row) => {
      row.date = moment(row.date).format(fm);
      // calc volumn
      row = {
        ...row,
        volumn: Number(row.quantity * row.reps * row.sets).toFixed(1),
      };
      return row;
    });

    rows = rows.reduce((acc, cur) => {
      const { member_sid, typeID, name, date, volumn } = cur;
      const curObj = { member_sid, typeID, name, date, volumn };
      const existObj = acc.find((obj) => obj.date === curObj.date);
      if (existObj) {
        existObj.volumn = Number(curObj.volumn) + Number(existObj.volumn);
      } else {
        acc.push(curObj);
      }
      return acc;
    }, []);

    // console.log(rows);
    output.success = true;
    output.data = rows;
    res.json(output);
  }
);

// <<< get exercise for plot
module.exports = router;
