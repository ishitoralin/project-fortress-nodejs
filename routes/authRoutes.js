const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const path = require('path');
require('dotenv').config();
const router = express.Router();
module.exports = router;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  let rows;
  [rows] = await db.query(`SELECT * FROM member WHERE email = '${email}'`);
  let user;
  if (rows.length > 0) {
    user = rows[0];
    //驗證資料庫拉出來的資料 的密碼和 下面密碼是不是一樣
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      return res.status(401).json({ code: 401, message: '帳號或密碼錯誤' });
    }
    //jwt
    //成功就放入JWT accessToken 和 refreshToken
    console.log('使用者資料正確');
    const accessToken = jwt.sign(
      {
        id: user.sid,
        name: user.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '60d' }
    );
    //放入refreshToken進httponly cookie
    res.cookie('g4RefreshToken', refreshToken, { httpOnly: true });
    //放入accessToken進json 前端接住丟進state內
    return res.status(200).json({
      code: 200,
      accessToken,
      user: {
        id: user.sid,
        name: user.name,
        role: user.role_sid,
        icon: user.hero_icon,
      },
      message: '登入成功',
    });
  }
  //TODO
  res.status(401).json({ code: 401, message: '帳號或密碼錯誤' });
});
