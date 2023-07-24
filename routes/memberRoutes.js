const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
router
  //取得指定id的USER資料
  .get('/', async (req, res) => {
    // req.locals.user = {sid:1,};
    // const { id } = req.locals.user;
    let id = 5;
    if (!id) {
      return res.status(404).json({ code: 404, message: '沒有資料' });
    }

    let sql = `SELECT * FROM member where sid = ? ;`;
    const [rows] = await db.query(sql, [id]);
    if (rows.length > 0) {
      delete rows[0]['password'];
      rows[0]['created_at'] = dayjs(rows[0]['created_at']).format('YYYY-MM-D');
      return res
        .status(200)
        .json({ code: 200, data: rows[0], message: '有資料' });
    } else {
      return res.status(404).json({ code: 404, message: '沒有資料' });
    }
  })
  .post('/', (req, res, next) => {})
  .get('/member-favorite-courses', async (req, res, next) => {})
  .delete('/member-favorite-courses', async (req, res, next) => {})
  .get('/member-favorite-products', async (req, res, next) => {
    let id = 5;
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
    console.log(rows.length);

    return res.status(404).json({ code: 404, message: '沒有資料' });
  })
  .delete('/member-favorite-products', (req, res, next) => {})

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的member routes' });
  });
module.exports = router;
/*     `SELECT member.sid, email, password, member.name, mobile, birth, address, ms.name, hero_icon, mr.role, created_at, active, providerData, google_uid FROM member JOIN member_role AS mr ON role_sid= mr.sid JOIN member_sex AS ms ON sex_sid =ms.sid WHERE email = '${email}'` */
