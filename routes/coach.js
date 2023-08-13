const db = require(__dirname + '/../modules/connectDB.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../modules/coach-img-uploads.js');
const { getUser } = require(__dirname + '/../modules/auth.js');

const base64Encode = (filePath) => {
  const bitmap = fs.readFileSync(filePath);

  return new Buffer.from(bitmap).toString('base64');
};

const router = express.Router();

router.get('/all', async (req, res) => {
  const [data] = await db.query(
    'SELECT c.*, l.name as location FROM c_l_coachs c JOIN c_l_location l ON c.location_sid = l.sid'
  );
  res.json(data);
});

router.get('/edit', getUser, async (req, res) => {
  const sid = res.locals.user?.sid || null;
  const sql = `SELECT * FROM c_l_coachs WHERE member_sid = ${sid}`;
  const [result] = await db.query(sql);

  res.json(result);
});

router.post(
  '/upload-img',
  getUser,
  upload.single('coach-img'),
  async (req, res) => {
    const sid = res.locals.user?.sid || null;
    if (sid === null) return res.json({ result: false });

    const imgExtend = path.extname(req.file.filename);
    const base64Text =
      `data:image/${imgExtend};base64,` + base64Encode(req.file.filename);
    // console.log(req.file.filename, req.file.destination);
    res.json({
      filename: req.file.filename,
      destination: req.file.destination,
    });
  }
);

router.post('/edit', getUser, async (req, res) => {
  const sid = res.locals.user?.sid || null;
  if (sid === null) return res.json({ result: false });

  const { nickname, introduction } = req.body;
  if (typeof nickname !== 'string' || typeof introduction !== 'string') {
    return res.json({ result: false });
  }

  const sql = `UPDATE c_l_coachs SET nickname = ?, introduction = ? WHERE member_sid = ${sid}`;
  const [result] = await db.query(sql, [nickname, introduction]);

  res.json({
    success: result.affectedRows === 1,
    isEdit: result.changedRows === 1,
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) return res.json({ message: 'Invalid params' });
  const sql = `SELECT c.*, l.name as location FROM c_l_coachs c JOIN c_l_location l ON c.location_sid = l.sid WHERE c.sid = ${id}`;
  const [[data]] = await db.query(sql);

  res.json(data);
});

router.get('/', async (req, res) => {
  const { location } = req.query;

  if (location === undefined) {
    const sql = 'SELECT sid FROM c_l_coachs WHERE 1';
    const [datas] = await db.query(sql);

    return res.json(datas.map((data) => data.sid));
  }

  const sids = await getLocationsSid(
    Array.isArray(location) ? location : [location]
  );

  const sql = `SELECT c.*, l.name as location FROM c_l_coachs c JOIN c_l_location l ON c.location_sid = l.sid WHERE location_sid IN (
    ${Array(sids.length).fill('?').join(',')})`;

  const [data] = await db.query(sql, sids);
  res.json(data);
});

const getLocationsSid = async (locations) => {
  const sids = await Promise.all(
    locations.map(async (location) => {
      const sql = 'SELECT sid FROM c_l_location WHERE name = ?';
      const [[data]] = await db.query(sql, location);
      return data !== undefined ? data.sid : -1;
    })
  );

  return sids.filter((sid) => sid !== -1);
};

module.exports = router;
