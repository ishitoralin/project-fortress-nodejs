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
    // console.log(res.locals.user);
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
    mobile=?, birth=?, address=?, sex_sid= ? WHERE sid = ?;`;
    let rows;
    rows = await db.query(sql, [mobile, birth, address, sex, sid]);
    // console.log(rows[0].affectedRows);
    res.status(200).json({ message: '修改成功' });
    // .json({ code: 200, data: rows[0], message: '有資料' });
  })
  //上傳單張
  .patch('/icon', upload.single('avatar'), async (req, res, next) => {
    const { sid } = res.locals.user;
    // console.log(req.file.filename);
    let sql = `UPDATE member SET hero_icon = '${req.file.filename}' WHERE sid =?`;
    // console.log(sql);
    await db.query(sql, [sid]);
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

    /* 
    let where = ' WHERE 1 ';
    let keyword;
    if (req.query.keyword) {
      keyword = db.escape('%' + req.query.keyword + '%');
      where += ` AND 
       ${category}_name LIKE ${keyword} 
      `;
    }
    const t_sql = `SELECT COUNT(1) totalRows FROM ${category}_name ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql);
    */
    let sql = `SELECT mfl.sid ,mfl.member_sid , cll.name,clcoach.nickname ,cll.time ,cll.period,cll.price,clc.img FROM member_favorite_lessons AS mfl 
LEFT JOIN c_l_lessons AS cll ON cll.sid = mfl.lesson_sid 
LEFT JOIN c_l_category AS clc ON cll.category_sid = clc.sid
LEFT JOIN c_l_coachs AS clcoach ON cll.coach_sid =clcoach.sid
WHERE mfl.member_sid = ?`;

    let rows;
    [rows] = await db.query(sql, [sid]);
    if (rows.length > 0) {
      rows = rows.map((el) => {
        return { ...el, time: dayjs(el.time).format('YYYY-MM-DD') };
      });
      output.rows = rows;
      return res.status(200).json({ code: 200, output, message: '有資料' });
    }

    return res.status(200).json({ code: 200, message: '沒有資料' });
  })
  .get('/member-favorite-courses2', async (req, res, next) => {
    let output = {
      redirect: '',
      totalRows: 0,
      perPage: 6,
      totalPages: 0,
      page: 1,
      rows: [],
    };
    output.page = req.query.page ? parseInt(req.query.page) : 1;
    if (!output.page || output.page < 1) {
      output.redirect = req.baseUrl + req.path;

      return res.status(200).json({ code: 200, output, message: '沒有資料' });
    }
    const { sid: mid } = res.locals.user;

    let where = ` WHERE mfl.member_sid = ? `;
    let keyword;
    if (req.query.keyword) {
      keyword = db.escape('%' + req.query.keyword + '%');
      where += ` AND 
      cll.name LIKE ${keyword} OR nickname LIKE ${keyword}
      `;
    }
    const t_sql = `
    SELECT COUNT(1) totalRows FROM  member_favorite_lessons AS mfl 
    LEFT JOIN c_l_lessons AS cll ON cll.sid = mfl.lesson_sid 
    LEFT JOIN c_l_category AS clc ON cll.category_sid = clc.sid
    LEFT JOIN c_l_coachs AS clcoach ON cll.coach_sid =clcoach.sid
    ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql, [mid]);
    if (totalRows) {
      output.totalRows = totalRows;
      output.totalPages = Math.ceil(totalRows / output.perPage);
      if (output.page > output.totalPages) {
        output.redirect =
          req.baseUrl +
          req.path +
          '?page=' +
          output.totalPages +
          `${keyword ? `&keyword=${req.query.keyword}` : ''}`;
        return res.status(200).json({ code: 200, output, message: '沒有資料' });
      }
      let sql = `SELECT  mfl.lesson_sid AS sid ,mfl.member_sid , cll.name,clcoach.nickname ,cll.time ,cll.period,cll.price,clc.img FROM member_favorite_lessons AS mfl 
      LEFT JOIN c_l_lessons AS cll ON cll.sid = mfl.lesson_sid 
      LEFT JOIN c_l_category AS clc ON cll.category_sid = clc.sid
      LEFT JOIN c_l_coachs AS clcoach ON cll.coach_sid =clcoach.sid
      ${where} LIMIT ${output.perPage * (output.page - 1)}, ${output.perPage}`;
      let rows;
      [rows] = await db.query(sql, [mid]);
      if (rows.length > 0) {
        rows = rows.map((el) => {
          return {
            ...el,
            time: dayjs(el.time).format('YYYY-MM-DD'),
            img: `http://localhost:${process.env.PORT}/imgs/lesson/lessons-img/${el.img}`,
          };
        });
        output.rows = rows;
        return res.status(200).json({ code: 200, output, message: '有資料' });
      }

      return res.status(200).json({ code: 200, message: '沒有資料' });
    }
  })
  //新增會員最愛課程
  .post('/member-favorite-courses', async (req, res, next) => {
    const { sid } = res.locals.user;
    const { lsid } = req.body;
    let sql = `
  INSERT INTO member_favorite_lessons( member_sid  , lesson_sid) 
  VALUES ( ?   , ?) `;
    try {
      await db.query(sql, [sid, lsid]);
      res.status(200).json({ code: 200, message: '新增最愛課程成功' });
    } catch (error) {
      res.status(200).json({ code: 200, message: '新增最愛課程失敗' });
    }
  })
  //刪除會員最愛課程
  .delete('/member-favorite-courses', async (req, res, next) => {
    const { sid: lid } = req.body;
    const { sid: mid } = res.locals.user;
    // console.log(lid, mid);
    let sql = `DELETE FROM member_favorite_lessons WHERE member_favorite_lessons.lesson_sid = ${lid} AND member_favorite_lessons.member_sid = ?`;
    try {
      const rows = await db.query(sql, [mid]);
      if (!rows[0]['affectedRows']) {
        throw new Error('failed');
      }
      res.status(200).json({ code: 200, message: '刪除最愛課程成功' });
    } catch (error) {
      res.status(200).json({ code: 200, message: '刪除最愛課程失敗' });
    }
  })
  .get('/member-favorite-products/:cid/:pid', async (req, res, next) => {
    const { sid: mid } = res.locals.user;
    const { cid, pid } = req.params;
    let sql = `SELECT COUNT(1) FROM member_favorite_products WHERE  member_sid = ${mid} AND  product_sid  = ? AND category_sid=?`;
    const [[result]] = await db.query(sql, [pid, cid]);
    let favorite = false;
    let message = '此商品沒有加入最愛';
    if (result['COUNT(1)']) {
      favorite = true;
      message = '此商品已加入最愛';
    }
    res.status(200).json({ code: 200, favorite, message });
  })
  .get('/member-favorite-products', async (req, res, next) => {
    const { sid } = res.locals.user;
    let sql = `SELECT mfp.sid , 
    CASE
    WHEN mfp.category_sid = 1 THEN 1
    WHEN mfp.category_sid = 2 THEN 2
    WHEN mfp.category_sid = 3 THEN 3
       END AS category_sid  ,
    CASE
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
WHERE mfp.member_sid =?
`;
    let rows;
    [rows] = await db.query(sql, [sid]);
    if (rows.length > 0) {
      rows = rows.map((el) => {
        return { ...el, picture: el.picture?.split(',')[0] };
      });
      return res.status(200).json({ code: 200, data: rows, message: '有資料' });
    }

    return res.status(200).json({ code: 200, message: '沒有資料' });
  })
  .get('/member-favorite-products2', async (req, res, next) => {
    console.log(req.query);
    let output = {
      redirect: '',
      totalRows: 0,
      perPage: 6,
      totalPages: 0,
      page: 1,
      orderBy: '',
      rows: [],
    };

    output.page = req.query.page ? parseInt(req.query.page) : 1;
    if (!output.page || output.page < 1) {
      output.page = 1;
      output.redirect = req.baseUrl + req.path + '?page=1';
      return res.status(200).json({ code: 200, output, message: 'redirect' });
    }
    let where = ' WHERE 1 AND mfp.member_sid =? ';
    let keyword;
    if (req.query.keyword) {
      keyword = db.escape('%' + req.query.keyword + '%');
      where += ` AND (pn.product_name LIKE ${keyword}  OR fn.food_name LIKE ${keyword}  OR en.equipment_name LIKE ${keyword} )
      `;
    }
    //價格範圍搜尋
    let { price } = req.query;

    if (
      Array.isArray(price) &&
      price?.length === 2 &&
      !isNaN(parseInt(price[0])) &&
      !isNaN(parseInt(price[1]))
    ) {
      price[0] = parseInt(price[0]);
      price[1] = parseInt(price[1]);
      price.sort(function (a, b) {
        return parseInt(a) - parseInt(b) > 0 ? 1 : -1;
      });
      console.log(price);
      where += `AND ((pn.price BETWEEN ${price[0]} AND ${price[1]} ) OR (fn.price BETWEEN ${price[0]} AND ${price[1]}) OR (en.price BETWEEN ${price[0]} AND ${price[1]}) )`;
    }
    if (!isNaN(parseInt(req.query.category))) {
      where += `AND mfp.category_sid = ${req.query.category}`;
    }

    //排序
    let orderBy;
    switch (req.query.orderBy) {
      case `priiceDesc`:
        output.orderBy, (orderBy = `ORDER BY price DESC`);
        break;

      default:
        output.orderBy, (orderBy = `ORDER BY price ASC`);
        break;
    }
    const t_sql = `SELECT COUNT(1)FROM (SELECT mfp.sid , 
      CASE
      WHEN mfp.category_sid = 1 THEN 1
      WHEN mfp.category_sid = 2 THEN 2
      WHEN mfp.category_sid = 3 THEN 3
         END AS category_sid  ,
      CASE
      WHEN mfp.category_sid = 1 THEN pn.sid
      WHEN mfp.category_sid = 2 THEN fn.sid
      WHEN mfp.category_sid = 3 THEN en.sid
         END AS prdouct_sid  ,
      CASE
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
  ${where}) AS t
      `;
    const { sid } = res.locals.user;
    const [[{ 'COUNT(1)': totalRows }]] = await db.query(t_sql, [sid]);
    if (totalRows) {
      output.totalRows = totalRows;
      output.totalPages = Math.ceil(totalRows / output.perPage);
      if (output.page > output.totalPages) {
        output.redirect =
          req.baseUrl +
          req.path +
          '?page=' +
          output.totalPages +
          `${keyword ? `&keyword=${req.query.keyword}` : ''}`;
        return res.status(200).json({ code: 200, output, message: 'redirect' });
      }
    }
    let sql = `SELECT mfp.sid , 
    CASE
    WHEN mfp.category_sid = 1 THEN 1
    WHEN mfp.category_sid = 2 THEN 2
    WHEN mfp.category_sid = 3 THEN 3
       END AS category_sid  ,
    CASE
    WHEN mfp.category_sid = 1 THEN pn.sid
    WHEN mfp.category_sid = 2 THEN fn.sid
    WHEN mfp.category_sid = 3 THEN en.sid
          END AS product_sid  ,
    CASE
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
${where} ${orderBy} LIMIT ${output.perPage * (output.page - 1)}, ${
      output.perPage
    } 
`;
    let rows;
    [rows] = await db.query(sql, [sid]);
    if (rows.length > 0) {
      rows = rows.map((el) => {
        return {
          ...el,
          picture: `http://localhost:${process.env.PORT}/imgs/product/${
            el.picture?.split(',')[0]
          }`,
        };
      });
      output.rows = rows;
      return res.status(200).json({ code: 200, output, message: '有資料' });
    }

    return res.status(200).json({ code: 200, message: '沒有資料' });
  })
  //新增最愛商品
  .post('/member-favorite-products', async (req, res, next) => {
    const { sid } = res.locals.user;
    const { psid, csid } = req.body;
    let sql = `
  INSERT INTO member_favorite_products( member_sid , category_sid , product_sid) 
  VALUES ( ?  , ? , ?) `;
    try {
      await db.query(sql, [sid, csid, psid]);
      res.status(200).json({ code: 200, message: '新增最愛商品成功' });
    } catch (error) {
      res.status(200).json({ code: 200, message: '新增最愛商品失敗' });
    }
  })
  //刪除最愛商品
  .delete('/member-favorite-products', async (req, res, next) => {
    const { pid, cid } = req.body;
    const { sid: mid } = res.locals.user;
    // console.log(pid, cid, mid);
    let sql = `DELETE FROM member_favorite_products WHERE ( member_favorite_products.product_sid = ? ) AND ( member_favorite_products.category_sid= ? ) AND  ( member_favorite_products.member_sid= ? )`;
    try {
      const rows = await db.query(sql, [pid, cid, mid]);
      if (!rows[0]['affectedRows']) {
        throw new Error('failed');
      }
      res.status(200).json({ code: 200, message: '刪除最愛商品成功' });
    } catch (error) {
      res.status(200).json({ code: 200, message: '刪除最愛商品失敗' });
    }
  })
  .get('/my-orders', async (req, res, next) => {
    let output = {
      redirect: '',
      totalRows: 0,
      perPage: 6,
      totalPages: 0,
      page: 1,
      rows: [],
    };
    output.page = req.query.page ? parseInt(req.query.page) : 1;
    if (!output.page || output.page < 1) {
      output.redirect = req.baseUrl + req.path;

      return res.status(200).json({ code: 200, output, message: '沒有資料' });
    }
    const { sid: mid } = res.locals.user;

    let where = ` WHERE om.member_sid = ? `;
    let keyword;
    /*if (req.query.keyword) {
      keyword = db.escape('%' + req.query.keyword + '%');
      where += ` AND 
      od.name LIKE ${keyword} 
      `; //FIXME 因為出發點是 order_main 且已經對 order_main進行頁數限制 關鍵字搜尋會有問題
    } */
    const t_sql = `
    SELECT COUNT(1) totalRows FROM  order_main AS om 
    ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql, [mid]);
    if (totalRows) {
      output.totalRows = totalRows;
      output.totalPages = Math.ceil(totalRows / output.perPage);
      if (output.page > output.totalPages) {
        output.redirect =
          req.baseUrl +
          req.path +
          '?page=' +
          output.totalPages +
          `${keyword ? `&keyword=${req.query.keyword}` : ''}`;
        return res.status(200).json({ code: 200, output, message: '沒有資料' });
      }

      let sql = `SELECT
       om.sid as main_sid,
       om.member_sid,
       om.amount,
       om.buy_time,
       om.pay_time,
       om.method,
       om.name as recipient,
       om.address,
       om.phone,
       om.email,
       od.sid as detail_sid,
       od.products_type_sid AS cid,
       od.item_sid AS pid,
       od.name,
       od.picture,
       od.price,
       od.quantity,
       od.cllcid
     
     FROM
     ( SELECT 
      order_main.sid ,
      member_sid,
      amount,
      buy_time,
      pay_time,
      method_sid,
      order_method.Method AS method,
      name ,
      address,
      phone,
      email FROM order_main LEFT JOIN order_method ON order_method.sid = order_main.method_sid  ORDER BY order_main.buy_time DESC LIMIT ${
        output.perPage * (output.page - 1)
      },${output.perPage}) AS om
     LEFT JOIN
       (
         SELECT 
           od.sid,
           od.member_sid,
           od.item_sid,
           od.order_sid,
           od.products_type_sid ,
           od.quantity,
           CASE
             WHEN od.products_type_sid = 4 THEN cll.cllcid
            END AS cllcid,
           CASE
             WHEN od.products_type_sid = 1 THEN pn.product_name
             WHEN od.products_type_sid = 2 THEN fn.food_name
             WHEN od.products_type_sid = 3 THEN en.equipment_name
             WHEN od.products_type_sid = 4 THEN cll.name
           END AS name,
           CASE
             WHEN od.products_type_sid = 1 THEN pn.picture
             WHEN od.products_type_sid = 2 THEN fn.picture
             WHEN od.products_type_sid = 3 THEN en.picture
             WHEN od.products_type_sid = 4 THEN cll.img
           END AS picture,
           CASE
             WHEN od.products_type_sid = 1 THEN pn.price
             WHEN od.products_type_sid = 2 THEN fn.price
             WHEN od.products_type_sid = 3 THEN en.price
             WHEN od.products_type_sid = 4 THEN cll.price
           END AS price
         FROM order_detail od
         LEFT JOIN product_name pn  ON pn.sid = od.item_sid AND od.products_type_sid = 1 
         LEFT JOIN food_name fn ON fn.sid = od.item_sid AND od.products_type_sid = 2 
         LEFT JOIN equipment_name en ON en.sid = od.item_sid AND od.products_type_sid = 3
         LEFT JOIN (
           SELECT cll.sid,cll.price, cll.name,cll.category_sid as cllcid, clc.img AS img
           FROM c_l_lessons cll
           LEFT JOIN c_l_category clc ON cll.category_sid = clc.sid
         ) AS cll ON cll.sid = od.item_sid AND od.products_type_sid = 4  ) AS od  ON om.sid = od.order_sid ${where}  `;

      /*   
SELECT 
  od.sid,
  od.member_sid,
  od.products_type_sid AS pts,
  od.quantity,
  CASE
    WHEN od.products_type_sid = 1 THEN 1
    WHEN od.products_type_sid = 2 THEN 2
    WHEN od.products_type_sid = 3 THEN 3
    WHEN od.products_type_sid = 4 THEN 4
  END AS products_type_sid,
  CASE
    WHEN od.products_type_sid = 1 THEN pn.product_name
    WHEN od.products_type_sid = 2 THEN fn.food_name
    WHEN od.products_type_sid = 3 THEN en.equipment_name
    WHEN od.products_type_sid = 4 THEN cll.name
  END AS name,
  CASE
    WHEN od.products_type_sid = 1 THEN pn.picture
    WHEN od.products_type_sid = 2 THEN fn.picture
    WHEN od.products_type_sid = 3 THEN en.picture
    WHEN od.products_type_sid = 4 THEN cll.img
  END AS picture,
  CASE
    WHEN od.products_type_sid = 1 THEN pn.price
    WHEN od.products_type_sid = 2 THEN fn.price
    WHEN od.products_type_sid = 3 THEN en.price
    WHEN od.products_type_sid = 4 THEN cll.price
  END AS price
FROM order_detail od
LEFT JOIN product_name pn ON pn.sid = od.item_sid AND od.products_type_sid = 1  
LEFT JOIN food_name fn ON fn.sid = od.item_sid AND od.products_type_sid = 2 
LEFT JOIN equipment_name en ON en.sid = od.item_sid AND od.products_type_sid = 3
LEFT JOIN (
  SELECT cll.sid,cll.price, cll.name, clc.img AS img
  FROM c_l_lessons cll
  LEFT JOIN c_l_category clc ON cll.category_sid = clc.sid
) AS cll ON cll.sid = od.item_sid AND od.products_type_sid = 4;
	
      */
      let rows;
      [rows] = await db.query(sql, [mid]);
      console.log(rows);
      if (rows.length > 0) {
        const dict = {};
        let newRows = [];
        rows.forEach((el) => {
          if (dict[el.main_sid] !== el.main_sid) {
            dict[el.main_sid] = el.main_sid;
            let pay_time = el.pay_time === null ? '未付款' : '已付款';
            newRows.push({
              main_sid: el.main_sid,
              member_sid: el.member_sid,
              amount: el.amount,
              method: el.method,
              buy_time: dayjs(el.buy_time).format('YY-MM-DD'),
              pay_time: pay_time,
              method_sid: el.method_sid,
              recipient: el.recipient,
              address: el.address,
              phone: el.phone,
              email: el.email,
              rows: [
                {
                  detail_sid: el.detail_sid,
                  cid: el.cid,
                  pid: el.pid,
                  price: el.price,
                  name: el.name,
                  item_sid: el.item_sid,
                  picture: el.picture,
                  quantity: el.quantity,
                  cllcid: el.cllcid,
                },
              ],
            });
            return;
          }
          /* od.sid as detail_sid,
       od.products_type_sid AS cid,
       od.item_sid AS pid,
       od.name,
       od.picture,
       od.price,
     od.quantity */

          newRows.forEach((el2) => {
            if (el2.main_sid === el.main_sid) {
              el2.rows.push({
                detail_sid: el.detail_sid,
                cid: el.cid,
                pid: el.pid,
                price: el.price,
                name: el.name,
                item_sid: el.item_sid,
                picture: el.picture,
                quantity: el.quantity,
                cllcid: el.cllcid,
              });
            }
          });
        });
        output.rows = newRows;
        return res.status(200).json({ code: 200, output, message: '有資料' });
      }

      return res.status(200).json({ code: 200, message: '沒有資料' });
    }
  })
  .get('/test', async (req, res, next) => {
    let sql = `SELECT
    om.sid as main_sid,
    om.member_sid,
    om.amount,
    om.buy_time,
    om.pay_time,
    om.method_sid,
    om.payment,
    om.name,
    om.address,
    om.phone,
    om.email,
    od.sid as detail_sid,
    od.order_sid,
    od.products_type_sid,
    od.item_sid,
    od.quantity
  FROM
    order_main om
 LEFT JOIN
    order_detail od ON om.sid = od.order_sid
  WHERE
    om.member_sid = 5;`;
    const { sid: mid } = res.locals.user;
    let rows;
    [rows] = await db.query(sql, [mid]);

    return res.status(200).json({ code: 200, message: '有資料' });
  })

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的member routes' });
  });
module.exports = router;
/*     `SELECT member.sid, email, password, member.name, mobile, birth, address, ms.name, hero_icon, mr.role, created_at, active, providerData, google_uid FROM member JOIN member_role AS mr ON role_sid= mr.sid JOIN member_sex AS ms ON sex_sid =ms.sid WHERE email = '${email}'` */
