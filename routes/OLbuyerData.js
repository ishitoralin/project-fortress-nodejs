const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const router = express.Router();
// 從資料庫抓取資料，購物車顯示商品
// postman用get
const { protect } = require(__dirname + '/../modules/auth.js');
router.use(protect);
router.get('/', async (req, res) => {
  const { sid: member_sid } = res.locals.user;
  if (!member_sid || isNaN(member_sid)) {
    return res.status(404).json({ error: '無效的id' });
  }
  const mainData = `SELECT * FROM order_main WHERE member_sid = ? ORDER BY buy_time DESC LIMIT 1`;
  const [dataFromMain] = await db.query(mainData, [member_sid]);

  const { sid: lastestOrderSid } = dataFromMain[0];
  const lastestOrder = `SELECT
  od.sid,
  od.order_sid,
  od.member_sid,
  od.products_type_sid,
  od.item_sid,
  od.quantity,
  od.created_at,
  CASE
      WHEN od.products_type_sid = 1 THEN pn.product_name
      WHEN od.products_type_sid = 2 THEN fn.food_name
      WHEN od.products_type_sid = 3 THEN en.equipment_name
      WHEN od.products_type_sid = 4 THEN ln.name
      ELSE NULL
  END AS item_name,
  CASE
      WHEN od.products_type_sid = 1 THEN pn.price
      WHEN od.products_type_sid = 2 THEN fn.price
      WHEN od.products_type_sid = 3 THEN en.price
      WHEN od.products_type_sid = 4 THEN ln.price
      ELSE NULL
  END AS price,
  CASE
      WHEN od.products_type_sid = 1 THEN pn.picture
      WHEN od.products_type_sid = 2 THEN fn.picture
      WHEN od.products_type_sid = 3 THEN en.picture
      WHEN od.products_type_sid = 4 THEN ln.img
      ELSE NULL
  END AS picture
  FROM
      order_detail AS od 
  LEFT JOIN product_name AS pn ON od.products_type_sid = 1
  AND od.item_sid = pn.sid
  LEFT JOIN food_name AS fn ON od.products_type_sid = 2
  AND od.item_sid = fn.sid
  LEFT JOIN equipment_name AS en ON od.products_type_sid = 3
  AND od.item_sid = en.sid
  LEFT JOIN (SELECT l.* , c.img
  FROM c_l_lessons AS l
  JOIN c_l_category AS c
  WHERE l.category_sid = c.sid) AS ln ON od.products_type_sid = 4
  AND od.item_sid = ln.sid
  WHERE
  od.member_sid = ? AND order_sid=?;`;

  const [lastestProductList] = await db.query(lastestOrder, [
    member_sid,
    lastestOrderSid,
  ]);
  const data = lastestProductList;
  res.status(200).json({ code: 200, data });
});

module.exports = router;
