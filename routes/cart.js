const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const ejs = require('ejs');
const path = require('path');
const transporter = require('../config/mail.js');
const router = express.Router();
// 從資料庫抓取資料，購物車顯示商品
// postman用get
const { protect } = require(__dirname + '/../modules/auth.js');
router.use(protect);
router
  .get('/', async (req, res) => {
    const { sid } = res.locals.user;
    if (!sid || isNaN(sid)) {
      return res.status(404).json({ error: '無效的id' });
    }
    // const sid = 5;
    const query = `SELECT
  oc.sid,
  oc.member_sid,
  oc.products_type_sid,
  oc.item_sid,
  oc.quantity,
  oc.created_at,
  CASE
      WHEN oc.products_type_sid = 1 THEN pn.product_name
      WHEN oc.products_type_sid = 2 THEN fn.food_name
      WHEN oc.products_type_sid = 3 THEN en.equipment_name
      WHEN oc.products_type_sid = 4 THEN ln.name
      ELSE NULL
  END AS item_name,
  CASE
      WHEN oc.products_type_sid = 1 THEN pn.price
      WHEN oc.products_type_sid = 2 THEN fn.price
      WHEN oc.products_type_sid = 3 THEN en.price
      WHEN oc.products_type_sid = 4 THEN ln.price
      ELSE NULL
  END AS price,
  CASE
      WHEN oc.products_type_sid = 1 THEN pn.picture
      WHEN oc.products_type_sid = 2 THEN fn.picture
      WHEN oc.products_type_sid = 3 THEN en.picture
      WHEN oc.products_type_sid = 4 THEN ln.img
      ELSE NULL
  END AS picture
FROM
  order_cart AS oc
  LEFT JOIN product_name AS pn ON oc.products_type_sid = 1
  AND oc.item_sid = pn.sid
  LEFT JOIN food_name AS fn ON oc.products_type_sid = 2
  AND oc.item_sid = fn.sid
  LEFT JOIN equipment_name AS en ON oc.products_type_sid = 3
  AND oc.item_sid = en.sid
  LEFT JOIN (SELECT l.* , c.img
  FROM c_l_lessons AS l
  JOIN c_l_category AS c
  WHERE l.category_sid = c.sid) AS ln ON oc.products_type_sid = 4
  AND oc.item_sid = ln.sid
WHERE
  oc.member_sid = ?`;
    try {
      let rows;
      [rows] = await db.query(query, [sid]);
      const data = rows;
      res.status(200).json({ code: 200, data });
    } catch (err) {
      console.error(err);
      res.status(500).json('資料擷取失敗');
    }
  })

  .get('/sendingPdf', async (req, res) => {
    const { sid } = res.locals.user;
    console.log('hello world');
    if (!sid || isNaN(sid)) {
      return res.status(404).json({ error: '無效的id' });
    }
  })
  .get('/test', async (req, res) => {
    let url = 'http://localhost:3000/';
    let receiver = 'miraculous0218@hotmail.com';
    ejs.renderFile(
      path.resolve() + '\\views\\sendingEmail.ejs',
      { url },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          // email內容
          const mailOptions = {
            from: `${process.env.SMTP_TO_EMAIL}`,
            to: `${receiver}`,
            subject: '健身堡壘--訂單成立',
            html: data,
          };

          // 寄送
          transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
              // 失敗處理
              console.log(err);
              return res.status(400).json({ message: 'Failure', detail: err });
            } else {
              // 成功回覆的json
              res.status(200).json({ code: 200 });
            }
          });
        }
      }
    );
  });

module.exports = router;
