const express = require('express');
const db = require(__dirname + '/../../modules/connectDB.js');
const router = express.Router();

// TODO: this is for test
//>>> test member middleware
router.get(
  '/test-member',
  // >>> member middleware
  function (req, res, next) {
    res.locals.memberId = 5;
    next();
  },
  //<<<   // >>> member middleware
  async (req, res) => {
    console.log(res.locals.memberId); //=== test member
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
  }
);
//<<< test

module.exports = router;
