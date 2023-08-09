const express = require('express');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const router = express.Router();
router
  .get('/main-page/', async (req, res) => {
    let sql = ` SELECT * FROM product_name WHERE sid IN (1,10,5,6,7,8) ;`;
    let productRows;
    [productRows] = await db.query(sql);
    sql = ` SELECT * FROM food_name WHERE sid IN (1,2,3,4,5,6) ;`;
    let foodRows;
    [foodRows] = await db.query(sql);
    sql = ` SELECT * FROM equipment_name WHERE sid IN (1,2,3,4,5,6) ;`;
    let equipmentRows;
    [equipmentRows] = await db.query(sql);
    return res.status(200).json({
      code: 200,
      data: { productRows, foodRows, equipmentRows },
      message: '有資料',
    });
  })

  .get('/no-page/:cid/', async (req, res) => {
    let category;
    let sql;
    let rows = [];
    switch (parseInt(req.params.cid)) {
      case 1:
        //衣服
        category = 'product';
        // sql = `SELECT * FROM ${category}_name AS p;`;
        break;

      case 2:
        //食品
        category = 'food';
        // sql = `SELECT * FROM ${category}_name  AS p;`;
        break;

      case 3:
        //器材
        category = 'equipment';
        // sql = `SELECT * FROM ${category}_name  AS p;`;

        break;
      default:
        return res.status(404).json({ code: 404, message: '沒有資料' });
    }
    sql = ` SELECT p.sid,
    p.${category}_name AS name,
    p.category_id,
    p.price,
    p.picture,
    p.created_at FROM ${category}_name AS p;`;
    [rows] = await db.query(sql);
    // console.log(rows);
    if (rows.length > 0) {
      rows.forEach((element) => {
        element['created_at'] = dayjs(element['created_at']).format(
          'YYYY-MM-DD'
        );
      });
      return res.status(200).json({ code: 200, data: rows, message: '有資料' });
    }

    res.status(400).json({ code: 400, message: '沒資料' });
  })
  //取得指定 cid 指定 sid 資料
  .get('/:cid/:sid', async (req, res) => {
    // console.log(req);
    let sql;
    let category;
    switch (parseInt(req.params.cid)) {
      case 1:
        //衣服
        category = 'product';

        break;

      case 2:
        //食品
        category = 'food';

        break;

      case 3:
        //器材
        category = 'equipment';

        break;
      default:
        return res.status(404).json({ code: 404, message: '沒有資料' });
    }
    sql = ` SELECT p.sid,
    p.${category}_name AS name,
    p.category_id,
    ${req.params.cid} AS parent_id,
    p.price,
    p.picture,
    p.created_at FROM ${category}_name AS p;`;
    if (req.params.sid) {
      sql = sql.replace(';', ` WHERE sid = ${db.escape(req.params.sid)}`);
      const [rows] = await db.query(sql);
      if (rows.length > 0) {
        rows[0]['created_at'] = dayjs(rows[0]['created_at']).format(
          'YYYY-MM-DD'
        );
        return res
          .status(200)
          .json({ code: 200, data: rows[0], message: '有資料' });
      } else {
        return res.status(404).json({ code: 404, message: '沒有資料' });
      }
    }
  })

  //取得指定category的product資料(有分頁)
  .get('/:cid', async (req, res) => {
    let output = {
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
    }
    let rows = [];

    let category;
    switch (parseInt(req.params.cid)) {
      case 1:
        //衣服
        category = 'product';

        break;

      case 2:
        //食品
        category = 'food';

        break;

      case 3:
        //器材
        category = 'equipment';

        break;
      default:
        return res.status(404).json({ code: 404, message: '沒有資料' });
    }
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
    if (totalRows) {
      output.totalRows = totalRows;
      output.totalPages = Math.ceil(totalRows / output.perPage);
      if (output.page > output.totalPages) {
        output.redirect =
          req.baseUrl +
          '?page=' +
          output.totalPages +
          `${keyword ? `&keyword=${req.query.keyword}` : ''}`;
        return res.status(404).json({ code: 404, output, message: '沒有資料' });
      }
      const sql = ` SELECT *,${category}_name as name FROM ${category}_name ${where} LIMIT ${
        output.perPage * (output.page - 1)
      }, ${output.perPage}`;
      //   console.log(sql);
      [rows] = await db.query(sql);
    }
    rows.forEach((element) => {
      element['created_at'] = dayjs(element['created_at']).format('YYYY-MM-DD');
    });
    return res
      .status(200)
      .json({ code: 200, data: rows, output, message: '有資料' });
    // if (rows[0].length > 0) {
    //   rows[0]['created_at'] = dayjs(rows[0]['created_at']).format('YYYY-MM-DD');
    //   return res
    //     .status(200)
    //     .json({ code: 200, data: rows[0], output, message: '有資料' });
    // } else {
    //   return res.status(404).json({ code: 404, message: '沒有資料' });
    // }
  })

  .use('*', (req, res) => {
    res.status(404).json({ code: 404, message: '錯誤的product routes' });
  });
module.exports = router;
