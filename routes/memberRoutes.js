const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
const { protect } = require('../modules/auth');
const upload = require('../modules/img-uploads.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
//保護用的middleware 同時能decode token 取得 user 丟到req.locals.user 往後面傳
router.use(protect);
router
  //取得指定id的USER資料
  .get('/', async (req, res) => {
    // req.locals.user = {sid:1,};
    // const { id } = req.locals.user;
    console.log(res.locals.user);
    const { sid } = res.locals.user;
    if (!sid) {
      return res.status(200).json({ code: 200, message: '沒有資料' });
    }

    let sql = `SELECT 
    m.name , m.email ,m.mobile , 
    m.birth , m.address , ms.name AS sex 
    FROM member AS m JOIN member_sex AS ms ON m.sex_sid = ms.sid
    WHERE m.sid = ? ;`;
    const [rows] = await db.query(sql, [sid]);
    if (rows.length > 0) {
      rows[0]['mobile'] ||= '';
      rows[0]['birth'] =
        rows[0]['birth'] === null
          ? ''
          : dayjs(rows[0]['birth']).format('YYYY-MM-DD');
      return res
        .status(200)
        .json({ code: 200, data: rows[0], message: '有資料' });
    } else {
      return res.status(200).json({ code: 200, message: '沒有資料' });
    }
  })
  //修改指定會員資料
  .patch('/', async (req, res, next) => {
    let { mobile, birth, address, sex } = req.body;
    (mobile ||= null), (birth ||= null), (address ||= null);
    switch (sex) {
      case '男':
        sex = 1;
        break;
      case '女':
        sex = 2;
        break;
      default:
        sex = 3;
        break;
    }

    const { sid } = res.locals.user;
    const sql = `UPDATE member SET 
    mobile=?, birth=?, address=?, sex_sid= ? WHERE sid = ${sid};`;
    let rows;
    rows = await db.query(sql, [mobile, birth, address, sex]);
    console.log(rows[0].affectedRows);
    res.status(200).json({ message: '修改成功' });
    // .json({ code: 200, data: rows[0], message: '有資料' });
  })
  //上傳單張
  .patch('/icon', upload.single('avatar'), async (req, res, next) => {
    const { sid } = res.locals.user;
    console.log(req.file.filename);
    let sql = `UPDATE member SET hero_icon = '${req.file.filename}' WHERE sid=${sid}`;
    console.log(sql);
    await db.query(sql);
    res.status(200).json({
      code: 200,
      filename: req.file.filename,
      message: '更新照片成功',
    });
  })
  //取得會員最愛課程
  .get('/member-favorite-courses', async (req, res, next) => {
    let output = {
      redirect: '',
      totalRows: 0,
      perPage: 12,
      totalPages: 0,
      page: 1,
      rows: [],
    };
    const { sid } = res.locals.user;
    let sql = `SELECT mfl.sid ,mfl.member_sid , cll.name,clcoach.nickname ,cll.time ,cll.period,cll.price,clc.img FROM member_favorite_lessons AS mfl 
LEFT JOIN c_l_lessons AS cll ON cll.sid = mfl.lesson_sid 
LEFT JOIN c_l_category AS clc ON cll.category_sid = clc.sid
LEFT JOIN c_l_coachs AS clcoach ON cll.coach_sid =clcoach.sid
WHERE mfl.member_sid = ${sid}`;

    let rows;
    [rows] = await db.query(sql);
    if (rows.length > 0) {
      rows = rows.map((el) => {
        return { ...el, time: dayjs(el.time).format('YYYY-MM-DD') };
      });
      output.rows = rows;
      return res.status(200).json({ code: 200, output, message: '有資料' });
    }

    return res.status(200).json({ code: 200, message: '沒有資料' });
  })
  //新增會員最愛課程
  .post('/member-favorite-courses', async (req, res, next) => {
    const { sid } = res.locals.user;
    const { lsid } = req.body;
    let sql = `
  INSERT INTO member_favorite_lessons( member_sid  , lesson_sid) 
  VALUES ( ${sid}   , ${lsid}) `;
    try {
      await db.query(sql);
      res.status(200).json({ code: 200, message: '新增最愛課程成功' });
    } catch (error) {
      res.status(404).json({ code: 404, message: '新增最愛課程失敗' });
    }
  })
  //刪除會員最愛課程
  .delete('/member-favorite-courses', async (req, res, next) => {
    const { sid } = req.body;
    let sql = `DELETE FROM member_favorite_lessons WHERE member_favorite_lessons.sid = ${sid}`;
    try {
      const rows = await db.query(sql);
      if (!rows[0]['affectedRows']) {
        throw new Error('failed');
      }
      res.status(200).json({ code: 200, message: '刪除最愛課程成功' });
    } catch (error) {
      res.status(404).json({ code: 404, message: '刪除最愛課程失敗' });
    }
  })
  .get('/member-favorite-products', async (req, res, next) => {
    /* let output = {
      redirect: '',
      totalRows: 0,
      perPage: 12,
      totalPages: 0,
      page: 1,
    };
    output.page = req.query.page ? parseInt(req.query.page) : 1;
    if (!output.page || output.page < 1) {
      output.redirect = req.baseUrl;
      return res.status(404).json({ code: 404, output, message: '沒有資料' });
    } */
    const { sid } = res.locals.user;
    let sql = `SELECT mfp.sid , CASE
    WHEN mfp.category_sid = 1 THEN pn.product_name
    WHEN mfp.category_sid = 2 THEN fn.food_name
    WHEN mfp.category_sid = 3 THEN en.equipment_name
       END AS name  ,
CASE
    WHEN mfp.category_sid = 1 THEN pn.picture
    WHEN mfp.category_sid = 2 THEN fn.picture
    WHEN mfp.category_sid = 3 THEN en.picture
       END AS picture  ,
CASE
    WHEN mfp.category_sid = 1 THEN pn.price
    WHEN mfp.category_sid = 2 THEN fn.price
    WHEN mfp.category_sid = 3 THEN en.price
       END AS price 
FROM member_favorite_products  AS mfp
LEFT JOIN product_name AS pn ON mfp.product_sid = pn.sid AND mfp.category_sid = 1
LEFT JOIN food_name AS fn ON mfp.product_sid = fn.sid AND mfp.category_sid = 2
LEFT JOIN equipment_name AS en ON mfp.product_sid = en.sid AND mfp.category_sid = 3
WHERE mfp.member_sid =${sid}
`;
    let rows;
    [rows] = await db.query(sql);
    if (rows.length > 0) {
      rows = rows.map((el) => {
        return { ...el, picture: el.picture?.split(',')[0] };
      });
      return res.status(200).json({ code: 200, data: rows, message: '有資料' });
    }

    return res.status(200).json({ code: 200, message: '沒有資料' });
  })
  //新增最愛商品
  .post('/member-favorite-products', async (req, res, next) => {
    const { sid } = res.locals.user;
    const { psid, csid } = req.body;
    let sql = `
  INSERT INTO member_favorite_products( member_sid , category_sid , product_sid) 
  VALUES ( ${sid}  , ${csid} , ${psid}) `;
    try {
      await db.query(sql);
      res.status(200).json({ code: 200, message: '新增最愛商品成功' });
    } catch (error) {
      res.status(404).json({ code: 404, message: '新增最愛商品失敗' });
    }
  })
  //刪除最愛商品
  .delete('/member-favorite-products', async (req, res, next) => {
    const { sid } = req.body;
    let sql = `DELETE FROM member_favorite_products WHERE member_favorite_products.sid = ${sid}`;
    try {
      const rows = await db.query(sql);
      if (!rows[0]['affectedRows']) {
        throw new Error('failed');
      }
      res.status(200).json({ code: 200, message: '刪除最愛商品成功' });
    } catch (error) {
      res.status(404).json({ code: 404, message: '刪除最愛商品失敗' });
    }
  })

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的member routes' });
  });
module.exports = router;
/*     `SELECT member.sid, email, password, member.name, mobile, birth, address, ms.name, hero_icon, mr.role, created_at, active, providerData, google_uid FROM member JOIN member_role AS mr ON role_sid= mr.sid JOIN member_sex AS ms ON sex_sid =ms.sid WHERE email = '${email}'` */
