const express = require('express');
const crypto = require('node:crypto');
const db = require(__dirname + '/../modules/connectDB.js');
require('dayjs/locale/zh-tw');
const ejs = require('ejs');
const path = require('path');
const transporter = require('../config/mail.js');
const router = express.Router();
require('dotenv').config();
const { mid, key, iv } = process.env;
// postman用get
const { protect } = require(__dirname + '/../modules/auth.js');
router.use(protect);
// 匯data進購物車
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
    // 找出最新一筆資料的email
    const { sid: member_sid } = res.locals.user;
    const data = `SELECT email FROM order_main WHERE member_sid=${member_sid} order BY sid DESC LIMIT 1`;

    const [rows] = await db.query(data, []);
    const [{ email }] = rows;
    console.log(email);
    let url = 'http://localhost:3000/';
    let receiver = email;
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
  })
  .get('/newebpayInfo', async (req, res, next) => {
    const { sid: member_sid } = res.locals.user;
    const order_main = `SELECT sid FROM order_main WHERE member_sid= ${member_sid} ORDER BY sid DESC limit 1`;
    const [omrows] = await db.query(order_main, []);
    const omdata = omrows; //data = 所有資訊
    const sidFromOrder_main = omdata[0].sid; //抓出該訂單的sid

    // 計算訂單總價
    const totalPrice = `SELECT SUM(price*quantity) AS totalPrice FROM (
      SELECT
        oc.sid,
        oc.order_sid,
        oc.member_sid,
        oc.products_type_sid,
        oc.item_sid,
        oc.quantity,
        oc.created_at,
        CASE
            WHEN oc.products_type_sid = 1 THEN pn.price
            WHEN oc.products_type_sid = 2 THEN fn.price
            WHEN oc.products_type_sid = 3 THEN en.price
            WHEN oc.products_type_sid = 4 THEN ln.price
            ELSE NULL
        END AS price
      FROM
        order_detail AS oc
        LEFT JOIN product_name AS pn ON oc.products_type_sid = 1
        AND oc.item_sid = pn.sid
        LEFT JOIN food_name AS fn ON oc.products_type_sid = 2
        AND oc.item_sid = fn.sid
        LEFT JOIN equipment_name AS en ON oc.products_type_sid = 3
        AND oc.item_sid = en.sid
        LEFT JOIN (
          SELECT l.* , c.img
          FROM c_l_lessons AS l
          JOIN c_l_category AS c ON l.category_sid = c.sid
        ) AS ln ON oc.products_type_sid = 4
        AND oc.item_sid = ln.sid
      WHERE
        oc.member_sid = 5
    ) AS derived_table_alias WHERE member_sid = ? AND order_sid = ?`;
    const [FinalPriceQuery] = await db.query(totalPrice, [
      member_sid,
      sidFromOrder_main,
    ]);
    const FinalPrice = parseInt(FinalPriceQuery[0].totalPrice);
    // oc.sid,
    // oc.member_sid,
    // oc.products_type_sid,
    // oc.item_sid,
    // oc.quantity,
    // oc.created_at,
    // 搜尋產品的資訊發送給藍新
    const showItem = `SELECT
    oc.quantity,
    CASE
        WHEN oc.products_type_sid = 1 THEN pn.product_name
        WHEN oc.products_type_sid = 2 THEN fn.food_name
        WHEN oc.products_type_sid = 3 THEN en.equipment_name
        WHEN oc.products_type_sid = 4 THEN ln.name
        ELSE NULL
    END AS item_name
  FROM
    order_detail AS oc
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
    oc.member_sid = ? AND oc.order_sid = ?`;

    const [showItemDetail] = await db.query(showItem, [
      member_sid,
      sidFromOrder_main,
    ]);

    // const ItemQuantity = showItemDetail[0].quantity;
    // const ItemName = showItemDetail[0].item_name;
    // console.log(showItemDetail);
    // const abc = JSON.stringify(showItemDetail);
    // 發送總價給藍新
    const amount = FinalPrice;
    /* 
    測試卡號：4000-2211-1111-1111
    有效期限：輸入比今天大即可 
    末三碼：任意填寫
    */
    const timeStamp = Date.now();
    const amt = parseInt(amount); //幣值，沒給的話預設是台幣
    const MerchantOrderNo = `J${timeStamp}`; //有30字最大上限，限英文數字底線
    const importOrderNumber = `UPDATE order_main SET orderNumber=? WHERE member_sid=? AND sid=?`;
    const orderNumber = await db.query(importOrderNumber, [
      MerchantOrderNo,
      member_sid,
      sidFromOrder_main,
    ]);
    //將tradeinfo物件轉成像querystring的東西
    function genDataChain(TradeInfo) {
      let results = [];
      for (let kv of Object.entries(TradeInfo)) {
        results.push(`${kv[0]}=${kv[1]}`);
      }
      return results.join('&');
    }
    //定義 aes256 key iv加密方法
    let encrypt = crypto.createCipheriv('aes256', key, iv);
    //加密字串化的TradeInfo
    let enc = encrypt.update(
      genDataChain({
        MerchantID: mid,
        TimeStamp: timeStamp,
        Version: '2.0',
        RespondType: 'String',
        MerchantOrderNo,
        Amt: amt,
        NotifyURL: 'https://ce5b-111-240-210-116.ngrok-free.app/note', //直擊後端
        ReturnURL: 'http://localhost:3000/shoppingcart/thirdstage', //直擊EJS畫面但是是用post方法
        ItemDesc: '感謝購買健身堡壘商品', //交易詳細資訊 EX 商品名稱 數量
      }),
      'utf8',
      'hex'
    );

    //把key和iv也加密後加到剛剛字串化的加密字串化的TradeInfo
    enc += encrypt.final('hex');
    //定義雜湊方式
    let sha = crypto.createHash('sha256');
    //定義要雜湊化的內容
    let plainText = `HashKey=${key}&${enc}&HashIV=${iv}`;
    let hashs;
    //進行雜湊
    hashs = sha.update(plainText).digest('hex').toUpperCase();
    //前後端分離的話要讓react 拿到這些資訊 在隱藏表格內提出這些
    const data = {
      MerchantID: mid,
      MerchantOrderNo,
      TradeInfo: enc,
      TradeSha: hashs,
    };
    res.status(200).json({ code: 200, data });
  });

module.exports = router;
