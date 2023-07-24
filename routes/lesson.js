const db = require(__dirname + '/../modules/connectDB.js');
const express = require('express');

const router = express.Router();

router.get('/tags', async (req, res) => {
  const sql = `SELECT name FROM c_l_tags ORDER BY sid`;
  const [datas] = await db.query(sql);
  const tags = datas.map((data) => data.name);
  res.json(tags);
});

router.get('/', async (req, res) => {
  const baseSql = `SELECT l.*, c.nickname FROM c_l_lessons l JOIN c_l_coachs c ON l.coach_sid = c.sid`;
  const queryObj = {
    sqlList: [],
    queryItems: [],
  };

  const { location, keyword } = req.query;

  const location_sid = location ? await getLocationSid(location) : -1;
  location_sid === -1 ||
    (queryObj.sqlList.push(`l.location_sid = ?`) &&
      queryObj.queryItems.push(location_sid));
  // keyword && sqlList.push(`location_sid = '${location_sid}'`)

  if (queryObj.sqlList.length === 0) {
    const [datas] = await db.query(baseSql);
    return res.json(datas);
  }

  const sqlListEnd = queryObj.sqlList.length - 1;
  const sql = queryObj.sqlList.reduce(
    (prevSql, nextSql, index) =>
      index === sqlListEnd
        ? `${prevSql} ${nextSql}`
        : `${prevSql} ${nextSql} AND`,
    `${baseSql} WHERE`
  );

  const [datas] = await db.query(sql, queryObj.queryItems);

  return res.json(datas);
  res.json({
    sql,
    queryItems: queryObj.queryItems,
  });
});

const getLocationSid = async (location) => {
  const sql = `SELECT sid FROM c_l_location WHERE name = ?`;
  const [datas] = await db.query(sql, [location]);
  return datas.length !== 0 ? datas[0].sid : -1;
};

module.exports = router;
