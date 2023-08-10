const express = require('express');
const transporter = require('../config/mail.js');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

const router = express.Router();

/* 寄送email的路由 */
router
  .get('/send', function (req, res, next) {
    let url = `http://localhost:3000`;
    let token = `ASDFSD`;
    let receiver = `jianshenbaolei@gmail.com`;
    ejs.renderFile(
      path.resolve() + '\\views\\verify.ejs',
      { url, token },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          // email內容
          const mailOptions = {
            from: `${process.env.SMTP_TO_EMAIL}`,
            to: `${receiver}`,
            subject: '健身堡壘--驗證信',
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
              return res.json({ message: 'Success' });
            }
          });
        }
      }
    );
  })
  .get('/send2', function (req, res, next) {
    ejs.renderFile(
      path.resolve() + '\\views\\template-try.ejs',
      {},
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          // email內容
          const mailOptions = {
            from: `${process.env.SMTP_TO_EMAIL}`,
            to: `jim6050482@gmail.com`,
            subject: '健身堡壘--驗證信',
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
              return res.json({ message: 'Success' });
            }
          });
        }
      }
    );
  });

module.exports = router;
/* 
function getRandomFourDigits(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

console.log(getRandomFourDigits(0,9999)) 
*/
