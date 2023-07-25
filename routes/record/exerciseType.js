const express = require('express');
const db = require(__dirname + '/../../modules/connectDB.js');
const router = express.Router();

// ===============================================================
// === exercise ==================================================
// ===============================================================
// NOTE: not using right now
//>>> get exercise type for exercise list
router.get('/exercise-type', async (req, res) => {
  let sql = `SELECT et.sid, et.exercise_name, et.exercise_description, et.exercise_img, et.exercise_vid
  FROM record_exercise_type et`;
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
});
//<<< get exercise type for exercise list
//>>> get exercise type for exercise list by bodypart.sid and keyword
router.get('/exercise-type/body-part/:sid/:keyword?', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };

  let sql = `SELECT et.sid, et.exercise_name, et.exercise_description, et.exercise_img AS img, et.exercise_vid AS vid
  FROM record_exercise_type et
  JOIN record_exercis_bodyPart_ref ebRef ON ebRef.exerciseType_sid = et.sid`;

  let sql1 = `SELECT et.sid, et.exercise_name, et.exercise_description, et.exercise_img AS img, et.exercise_vid AS vid
FROM record_exercise_type et`;

  const sid = parseInt(req.params.sid) || 0;
  const keyword = req.params.keyword || '';
  let where = ' WHERE et.status=1';
  // FIXME: keyword目前無法搜尋部位
  //===在沒有sid&keyword或只有keyword的情況下，使用bodypart關聯表JOIN會造成重複的資料，因此用另外的SQL
  if (!sid && !keyword) {
    sql = sql1;
    where += '';
  } else if (!keyword) {
    where += ` AND ebRef.bodyPart_sid =${sid}`;
  } else if (!sid) {
    const kw_escaped = db.escape('%' + keyword + '%');
    sql = sql1;
    where += ` AND (et.exercise_name LIKE ${kw_escaped} OR et.exercise_description LIKE ${kw_escaped} )`;
  } else {
    const kw_escaped = db.escape('%' + keyword + '%');
    where += ` AND ebRef.bodyPart_sid =${sid} AND (et.exercise_name LIKE ${kw_escaped} OR et.exercise_description LIKE ${kw_escaped} )`;
  }

  console.log(where);

  sql += where;
  let [rows] = await db.query(sql);
  if (!rows.length) {
    output.error = 'no data';
    return res.status(200).json(output);
  }

  output.success = true;
  output.data = rows;
  res.json(output);
});
//<<< get exercise type for exercise list by bodypart.sid and keyword

//>>> get exercise vs body part reference for selection
router.get('/body-part', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };
  let sql = `SELECT bp.sid AS 'key', bp.bodyPart_name AS 'value'
  FROM record_body_part bp ORDER BY bp.sid;`;
  let [rows] = await db.query(sql);

  if (!rows.length) {
    output.error = 'no data';
    return res.status(200).json(output);
  }

  output.success = true;
  output.data = rows;
  res.json(output);
});
//<<< get exercise vs body part reference for selection

module.exports = router;
