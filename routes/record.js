const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const router = express.Router();

// ===============================================================
// === exercise ==================================================
// ===============================================================
//>>> get exercise type for exercise list
router.get('/exercise-type', async (req, res) => {
  // let sql = `SELECT * FROM record_exercise_type ;`;
  let sql = `SELECT et.sid, et.exercise_name, et.exercise_description, et.exercise_img, et.exercise_vid, ebRef.bodyPart_sid
  FROM record_exercise_type et
  JOIN record_exercis_bodyPart_ref ebRef ON ebRef.exerciseType_sid = et.sid;`;
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
//<<< get exercise type for exercise list
//>>> get exercise type for exercise list by bodypart.sid and keyword
router.get('/exercise-type/body-part/:sid/:keyword?', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };

  let sql = `SELECT et.sid, et.exercise_name, et.exercise_description, et.exercise_img, et.exercise_vid, ebRef.bodyPart_sid
  FROM record_exercise_type et
  JOIN record_exercis_bodyPart_ref ebRef ON ebRef.exerciseType_sid = et.sid`;
  const sid = parseInt(req.params.sid) || 0;
  const keyword = req.params.keyword || '';
  let where = ' WHERE et.status=1';

  if (!sid && !keyword) {
    where += '';
  } else if (!keyword) {
    where += ` AND ebRef.bodyPart_sid =${sid}`;
  } else if (!sid) {
    const kw_escaped = db.escape('%' + keyword + '%');
    where += ` AND (et.exercise_name LIKE ${kw_escaped} OR et.exercise_description LIKE ${kw_escaped} )`;
  } else {
    const kw_escaped = db.escape('%' + keyword + '%');
    where += ` AND ebRef.bodyPart_sid =${sid} AND (et.exercise_name LIKE ${kw_escaped} OR et.exercise_description LIKE ${kw_escaped} )`;
  }

  // console.log(where);

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

//>>> test
router.get('/test/:sid/:test?', async (req, res) => {
  // console.log(req.params.sid, '/n', req.params?.test);
  res.json([]);
});
//<<< test

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

// ===============================================================
// === food ======================================================
// ===============================================================

// >>> get food type for food list
router.get('/food-type', async (req, res) => {
  let sql = `SELECT ft.sid, ft.food_type, ft.food_description,ft.calories,ft.protein,ft.unit,ft.food_img,ft.category_sid
  FROM record_food_type ft
  WHERE ft.status=1;`;
  let [rows] = await db.query(sql);

  if (rows.length > 0) {
    return res.status(200).json({ rows });
  } else {
    res.status(200).json({ message: '沒有資料' });
  }
  res.status(200).json({ message: '沒有資料' });
});
// <<< get food type for food list

// >>> get food type for food list by foodCategory.sid
router.get('/food-type/food-category/:sid', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };

  let sql;
  const sid = parseInt(req.params.sid) || 0;
  if (!sid) {
    sql = `SELECT ft.sid, ft.food_type,ft.food_description,ft.calories,ft.protein,ft.unit,ft.food_img
    FROM record_food_type ft
    WHERE ft.status =1;`;
  } else {
    sql = `SELECT ft.sid, ft.food_type,ft.food_description,ft.calories,ft.protein,ft.unit,ft.food_img
    FROM record_food_type ft
    WHERE ft.category_sid=${sid} AND ft.status =1;`;
  }

  let [rows] = await db.query(sql);

  if (!rows.length) {
    output.error = 'no data';
    return res.status(200).json(output);
  }
  output.success = true;
  output.data = rows;
  res.json(output);
});
// >>> get food type for food list by foodCategory.sid

// >>> get food category
router.get('/food-category', async (req, res) => {
  const output = {
    success: false,
    error: '',
    data: null,
  };
  let sql = `SELECT fc.sid AS 'key', fc.category_name AS 'value'
FROM record_food_category fc;`;
  let [rows] = await db.query(sql);

  if (!rows.length) {
    output.error = 'no data';
    return res.status(200).json(output);
  }

  output.success = true;
  output.data = rows;
  res.json(output);
});
// <<< get food category

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
