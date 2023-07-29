const db = require(__dirname + '/../modules/connectDB.js');
const express = require('express');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) return res.json({ message: 'Invalid params' });
  const sql = `SELECT * FROM c_l_coachs WHERE sid = ${id}`;
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
