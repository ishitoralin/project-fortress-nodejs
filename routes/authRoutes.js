const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const path = require('path');
const { protect } = require('../modules/auth');
require('dotenv').config();
const router = express.Router();

router
  .get('/test', protect, (req, res) => {
    res.json({ data: 123 });
  })
  .get('/check-auth', protect, (req, res, next) => {
    console.log(res.locals.user);
    res.status(200).json({});
  })
  .post('/login', async (req, res) => {
    const { email, password } = req.body;
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
      res.cookie('g4RefreshToken', refreshToken, {
        maxAge: 5184000000,
        httpOnly: true,
      });

      //放入accessToken進json 前端接住丟進state內
      user.hero_icon = `http://localhost:${process.env.PORT}/imgs/member/${user.hero_icon}`;
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
module.exports = router;
