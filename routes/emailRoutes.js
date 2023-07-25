const express = require('express');
const transporter = require('../config/mail.js');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

const router = express.Router();

/* 寄送email的路由 */
router.get('/send', function (req, res, next) {
  let receiver = 'jim';
  let content = '成功了 豪爽';
  ejs.renderFile(
    path.resolve() + '\\views\\verify.ejs',
    { receiver, content },
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
