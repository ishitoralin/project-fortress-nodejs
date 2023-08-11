const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
const express = require('express');
const { getUser } = require(__dirname + '/../modules/auth.js');

const router = express.Router();

router.get('/banners', async (req, res) => {
  const sql = `SELECT * FROM c_l_category LIMIT 5`;
  const [data] = await db.query(sql);
  res.json(data);
});

router.get('/tags', async (req, res) => {
  const sql = `SELECT name FROM c_l_tags ORDER BY sid`;
  const [datas] = await db.query(sql);
  const tags = datas.map((data) => data.name);
  res.json(tags);
});

router.get('/categories', async (req, res) => {
  const { id } = req.query;

  if (!isNaN(parseInt(id))) {
    const categorySql = `SELECT * FROM c_l_category WHERE sid = ${id}`;
    const [[category]] = await db.query(categorySql);

    const coachSql = `SELECT c.* FROM c_l_category ct JOIN c_l_coachs c WHERE c.sid IN (SELECT DISTINCT coach_sid FROM c_l_lessons WHERE category_sid = ${id} ) AND ct.sid = ${id}`;
    const [coachs] = await db.query(coachSql);
    return res.json({ ...category, coachs });
  }

  const sql = 'SELECT sid FROM c_l_category';
  const [datas] = await db.query(sql);
  const categories = datas.map((data) => data.sid);
  res.json(categories);
});

router.get('/', getUser, async (req, res) => {
  const sid = res.locals.user?.sid || null;

  const baseSql = `
    SELECT l.*, c.nickname, ct.img, ct.img_base64, lo.name as location FROM c_l_lessons l 
    JOIN c_l_coachs c ON l.coach_sid = c.sid 
    JOIN c_l_category ct ON l.category_sid = ct.sid
    JOIN c_l_location lo ON l.location_sid = lo.sid
  `;

  const queryObj = {
    sqlList: [],
    queryItems: [],
  };

  const {
    location,
    keyword,
    tags,
    dateAfter,
    dateBefore,
    price,
    category,
    coach,
  } = req.query;

  const location_sid = location ? await getLocationSid(location) : -1;
  if (location_sid !== -1) {
    queryObj.sqlList.push(`l.location_sid = ?`);
    queryObj.queryItems.push(location_sid);
  }

  if (keyword) {
    queryObj.sqlList.push(`(l.name LIKE ? OR c.nickname LIKE ?)`);
    queryObj.queryItems.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (tags) {
    const baseSql = `l.category_sid IN (SELECT DISTINCT lesson_sid FROM c_l_rela_lesson_tag WHERE c_l_rela_lesson_tag.tag_sid IN (SELECT sid FROM c_l_tags WHERE name`;

    queryObj.sqlList.push(
      Array.isArray(tags)
        ? `${baseSql} IN ( ${Array(tags.length).fill('?').join(',')} )))`
        : `${baseSql} = ? ))`
    );
    Array.isArray(tags)
      ? tags.forEach((tag) => queryObj.queryItems.push(tag))
      : queryObj.queryItems.push(tags);
  }

  if (dateAfter && dayjs(dateAfter).isValid()) {
    queryObj.sqlList.push(`l.time > ?`);
    queryObj.queryItems.push(dateAfter);
  }

  if (dateBefore && dayjs(dateBefore).isValid()) {
    queryObj.sqlList.push(`l.time < ?`);
    queryObj.queryItems.push(dateBefore);
  }

  if (
    Array.isArray(price) &&
    !isNaN(parseInt(price[0])) &&
    !isNaN(parseInt(price[1]))
  ) {
    queryObj.sqlList.push(`l.price BETWEEN ? AND ?`);
    queryObj.queryItems.push(
      Math.min(price[0], price[1]),
      Math.max(price[0], price[1])
    );
  }

  if (category && !isNaN(parseInt(category))) {
    queryObj.sqlList.push(`l.category_sid = ?`);
    queryObj.queryItems.push(category);
  }

  if (coach && !isNaN(parseInt(coach))) {
    queryObj.sqlList.push(`l.coach_sid = ${parseInt(coach)}`);
  }

  // splice sql syntax
  const spliceSql = queryObj.sqlList.reduce(
    (prevSql, nextSql) => `${prevSql} ${nextSql} AND`,
    queryObj.sqlList.length === 0 ? baseSql : `${baseSql} WHERE`
  );

  // remove last AND
  const sql =
    queryObj.sqlList.length === 0 ? spliceSql : spliceSql.slice(0, -4);

  const [lessons_noTags] = await db.query(sql, queryObj.queryItems);
  const lessons = await addLessonTags(lessons_noTags);

  // add save column for lesson
  if (sid) {
    const saveLessonsId = await getSavesLessons(sid);
    lessons.forEach((lesson) => (lesson.save = saveLessonsId.has(lesson.sid)));
  }

  const enrolledData = await getEnrolledCount();
  lessons.forEach((lesson) => {
    if (!enrolledData.has(lesson.sid)) return;
    lesson.enrolled =
      enrolledData.get(lesson.sid) > lesson.capacity
        ? lesson.capacity
        : enrolledData.get(lesson.sid);
  });

  // format lesson time
  lessons.forEach(
    (lesson) => (lesson.time = dayjs(lesson.time).format('YYYY/MM/DD HH:mm:ss'))
  );

  return res.json(lessons);
});

const getLocationSid = async (location) => {
  const sql = `SELECT sid FROM c_l_location WHERE name = ?`;
  const [datas] = await db.query(sql, [location]);
  return datas.length !== 0 ? datas[0].sid : 1;
};

const addLessonTags = async (lessons) => {
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

const getSavesLessons = async (sid) => {
  if (isNaN(parseInt(sid))) throw new Error('Invalid member id');
  const sql = `SELECT lesson_sid FROM member_favorite_lessons WHERE member_sid = ${sid}`;
  const [datas] = await db.query(sql);
  return new Set(datas.map((data) => data.lesson_sid));
};

const getEnrolledCount = async () => {
  const sql =
    'SELECT item_sid as lesson_sid, SUM(quantity) as count FROM order_detail WHERE products_type_sid = 4 GROUP BY item_sid';
  const [datas] = await db.query(sql);
  return new Map(datas.map((data) => [data.lesson_sid, parseInt(data.count)]));
};

module.exports = router;
