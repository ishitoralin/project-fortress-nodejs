const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../modules/connectDB.js');
const dayjs = require('dayjs');
const { v4 } = require('uuid');
require('dayjs/locale/zh-tw');
const { getUser } = require('../modules/auth');
require('dotenv').config();
const router = express.Router();

router
  .get('/check-auth', getUser, (req, res, next) => {
    //#region 喚起前端初次載入app時refresh token的logic
    // console.log('check-auth work');
    // console.log(res?.locals?.user);
    if (res?.locals?.user) {
      return res.status(200).json({ code: 200, message: '已登入' });
    } else {
      return res.send(401);
    }
    //#endregion
  })
  .get('/logout', (req, res, next) => {
    //#region 登出 刪除 refresh cookie
    res
      .status(200)
      .clearCookie('g4RefreshToken')
      .json({ code: 200, message: '登出成功' });
    //#endregion
  })
  .get('/refresh-token', async (req, res, next) => {
    //#region 用g4RefreshToken cookies 拿到 refresh token 並進db找到對應使用者資訊 並回傳accessToken和其他資訊 讓前端設定auth state

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
      [rows] = await db.query(`SELECT * FROM member WHERE sid = ?`, [
        decodedRefresh.sid,
      ]);
      if (rows.length > 0) {
        user = rows[0];
        // console.log(user);
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
          icon:
            user.hero_icon === null
              ? ''
              : `http://localhost:${process.env.PORT}/imgs/member/${user.hero_icon}`,
        },
        message: 'refresh成功',
      });
    } else {
      return res.send(401);
    }
    //#endregion
  })

  .post('/login', async (req, res) => {
    const { email, password } = req.body;
    let rows;
    [rows] = await db.query(`SELECT * FROM member WHERE email = ? `, [email]);
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
      res.cookie('g4RefreshToken', refreshToken, {
        maxAge: 5184000000,
      });

      //放入accessToken進json 前端接住丟進state內
      // user.hero_icon = `${user.hero_icon === 'null' ? '' : user.hero_icon}`;
      return res.status(200).json({
        code: 200,
        accessToken,
        user: {
          id: user.sid,
          name: user.name,
          role: user.role_sid,
          icon:
            user.hero_icon === null
              ? ''
              : `http://localhost:${process.env.PORT}/imgs/member/${user.hero_icon}`,
        },
        message: '登入成功',
      });
    }
    //TODO
    res.send(401);
  })
  .post('/sign-up', async (req, res) => {
    const { name, email, password } = req.body;
    //#region 信箱duplicate check , duplicate 的話回應錯誤
    const [[emailCheck]] = await db.query(
      `SELECT COUNT(1) FROM member WHERE member.email = ? `,
      [email]
    );
    // console.log(emailCheck?.['COUNT(1)'] ? '帳號重複' : '');

    if (emailCheck?.['COUNT(1)'] > 0) {
      return res.status(200).json({ code: 200, message: '信箱已註冊' });
    }
    //#endregion
    //#region 檢查過後，註冊信箱，往SQL插入資料
    let sql = `
    INSERT INTO member 
    (name ,password,email,sex_sid,active,created_at) values
    (  ? , ? , ? , 3 , 1 , NOW() )`;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await db.query(sql, [name, hashPassword, email]);
    if (result[0]?.affectedRows) {
      return res.status(200).json({ code: 200, message: '註冊成功' });
    }
    //#endregion
    res.status(200).json({ code: 200, message: '註冊失敗' });
  })
  .post('/google-login', async (req, res, next) => {
    /* providerId: 'google.com',
  uid: '108313895597091290857',
  displayName: '健身堡壘',
  email: 'jianshenbaolei@gmail.com',
  phoneNumber: null,
  photoURL: 'https://lh3.googleusercontent.com/a/AAcHTte8qF5maA4hwwuygM_EOvSzNphCYKjJePnZOQskjNel=s96-c'    
} */
    const { displayName, email, uid } = req.body;
    //先檢查email是否存在
    const [[emailCheck]] = await db.query(
      `SELECT COUNT(1) FROM member WHERE member.email = ? `,
      [email]
    );
    //有帳號
    if (emailCheck?.['COUNT(1)'] > 0) {
      let rows;

      [rows] = await db.query(`SELECT * FROM member WHERE email = ?`, [email]);
      let user = rows[0];
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
      res.cookie('g4RefreshToken', refreshToken, {
        maxAge: 5184000000,
      });

      //放入accessToken進json 前端接住丟進state內
      // user.hero_icon = `${user.hero_icon === 'null' ? '' : user.hero_icon}`;
      // console.log('google login work');
      return res.status(200).json({
        code: 200,
        accessToken,
        user: {
          id: user.sid,
          name: user.name,
          role: user.role_sid,
          icon:
            user.hero_icon === null
              ? ''
              : `http://localhost:${process.env.PORT}/imgs/member/${user.hero_icon}`,
        },
        message: '登入成功',
      });
    }

    //沒帳號
    else {
      const unreachablePassword = v4();
      const hashPassword = await bcrypt.hash(unreachablePassword, 10);
      let sql = `
    INSERT INTO member 
    (name ,password,email,sex_sid,active,created_at,providerData ,google_uid) values
    (  ? , ? , ? , 3 , 1 , NOW() ,? ,? )`;
      const result = await db.query(sql, [
        displayName,
        hashPassword,
        email,
        JSON.stringify(req.body),
        uid,
      ]);
      if (result[0]?.affectedRows) {
        return res.status(200).json({ code: 200, message: '註冊成功' });
      }
    }
    // res.status(200).json({ code: 200, message: 'google work' });
  });
module.exports = router;
