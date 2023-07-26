const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
require('dayjs/locale/zh-tw');
const { getUser } = require('../modules/auth');
require('dotenv').config();
const router = express.Router();

router
  .get('/test', (req, res) => {
    res.json({ data: 123 });
  })
  .get('/check-auth', getUser, (req, res, next) => {
    console.log(res?.locals?.user);
    if (res?.locals?.user) {
      return res.status(200).json({ code: 200, message: '已登入' });
    } else {
      return res.send(401);
    }
  })
  .get('/logout', (req, res, next) => {
    res
      .status(200)
      .clearCookie('g4RefreshToken')
      .json({ code: 200, message: '登出成功' });
  })
  .get('/refresh-token', async (req, res, next) => {
    const refreshCookie = req.cookies?.g4RefreshToken;
    if (refreshCookie) {
      //解密refresh cookie 內的 token
      let decodedRefresh = null;
      decodedRefresh = jwt.verify(
        refreshCookie,
        process.env.REFRESH_TOKEN_SECRET
      );
      //去db找refresh token 解密出來的sid 對應的使用者
      let rows;
      let user;
      let accessToken;
      [rows] = await db.query(
        `SELECT * FROM member WHERE sid = ${decodedRefresh.sid}`
      );
      if (rows.length > 0) {
        user = rows[0];
        console.log(user);
        //issue accessToken 並回傳使用者資料
        accessToken = jwt.sign(
          {
            sid: user.sid,
            name: user.name,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '60m' }
        );
      }

      return res.status(200).json({
        code: 200,
        accessToken,
        user: {
          id: user.sid,
          name: user.name,
          role: user.role_sid,
          icon: `http://localhost:${process.env.PORT}/imgs/member/${
            user.hero_icon === 'null' ? '' : user.hero_icon
          }`,
        },
        message: 'refresh成功',
      });
    } else {
      return res.send(401);
    }
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
        return res.send(401);
      }

      //jwt
      //成功就放入JWT accessToken 和 refreshToken
      const accessToken = jwt.sign(
        {
          sid: user.sid,
          name: user.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '60m' }
      );
      const refreshToken = jwt.sign(
        { sid: user.sid, name: user.name },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '60d' }
      );
      //放入refreshToken進httponly cookie
      res.cookie('g4RefreshToken', refreshToken);

      //放入accessToken進json 前端接住丟進state內
      user.hero_icon = `http://localhost:${process.env.PORT}/imgs/member/${
        user.hero_icon === 'null' ? '' : user.hero_icon
      }`;
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
    res.send(401);
  });
module.exports = router;
