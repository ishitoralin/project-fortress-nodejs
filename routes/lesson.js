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
  const baseSql = `
    SELECT l.*, c.nickname, ct.img FROM c_l_lessons l 
    JOIN c_l_coachs c ON l.coach_sid = c.sid 
    JOIN c_l_category ct ON l.category_sid = ct.sid
  `;

  const queryObj = {
    sqlList: [],
    queryItems: [],
  };

  const { location } = req.query;

  const location_sid = location ? await getLocationSid(location) : -1;
  location_sid === -1 ||
    (queryObj.sqlList.push(`l.location_sid = ?`) &&
      queryObj.queryItems.push(location_sid));
  // keyword && sqlList.push(`location_sid = '${location_sid}'`)

  if (queryObj.sqlList.length === 0) {
    const [lessons_noTags] = await db.query(baseSql);
    const lessons = await getLessonTags(lessons_noTags);
    return res.json(lessons);
  }

  const sqlListEnd = queryObj.sqlList.length - 1;
  const sql = queryObj.sqlList.reduce(
    (prevSql, nextSql, index) =>
      index === sqlListEnd
        ? `${prevSql} ${nextSql}`
        : `${prevSql} ${nextSql} AND`,
    `${baseSql} WHERE`
  );

  const [lessons] = await db.query(sql, queryObj.queryItems);

  return res.json(lessons);
});

const getLocationSid = async (location) => {
  const sql = `SELECT sid FROM c_l_location WHERE name = ?`;
  const [datas] = await db.query(sql, [location]);
  return datas.length !== 0 ? datas[0].sid : -1;
};

const getLessonTags = async (lessons) => {
  return await Promise.all(
    lessons.map(async (lesson) => {
      const getTagsSql = `
      SELECT name FROM c_l_tags WHERE sid IN ( 
      SELECT tag_sid FROM c_l_rela_lesson_tag WHERE lesson_sid = ? )
    `;

      const [tags] = await db.query(getTagsSql, [lesson.category_sid]);
      return { ...lesson, tags: tags.map((tag) => tag.name) };
    })
  );
};

module.exports = router;
