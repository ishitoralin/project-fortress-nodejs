const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
const { protect } = require('../modules/auth');
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
      return res.status(404).json({ code: 404, message: '沒有資料' });
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
      return res.status(404).json({ code: 404, message: '沒有資料' });
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
    mobile=?, birth=?, address=?, sex_sid= ? WHERE sid = 50;`;
    // mobile=?, birth=?, address=?, sex_sid= ? WHERE sid = ${sid};`;
    let rows;
    rows = await db.query(sql, [mobile, birth, address, sex]);
    console.log(rows[0].affectedRows);
    res.status(200).json({ message: '修改成功' });
    // .json({ code: 200, data: rows[0], message: '有資料' });
  })
  .get('/member-favorite-courses', async (req, res, next) => {})
  .delete('/member-favorite-courses', async (req, res, next) => {})
  .get('/member-favorite-products', async (req, res, next) => {
    const { id } = res.locals.user;
    let sql = `SELECT CASE
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
WHERE mfp.member_sid =${id}
`;
    let rows;
    [rows] = await db.query(sql);
    if (rows.length > 0) {
      return res.status(200).json({ code: 200, rows, message: '有資料' });
    }

    return res.status(404).json({ code: 404, message: '沒有資料' });
  })
  .delete('/member-favorite-products', (req, res, next) => {})

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的member routes' });
  });
module.exports = router;
/*     `SELECT member.sid, email, password, member.name, mobile, birth, address, ms.name, hero_icon, mr.role, created_at, active, providerData, google_uid FROM member JOIN member_role AS mr ON role_sid= mr.sid JOIN member_sex AS ms ON sex_sid =ms.sid WHERE email = '${email}'` */
