const express = require('express');
const crypto = require('node:crypto');
const db = require(__dirname + '/../modules/connectDB.js');
const uuid = require('uuid');
require('dayjs/locale/zh-tw');
// const ejs = require('ejs');
// const path = require('path');
// const transporter = require('../config/mail.js');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();
const {
  LINEPAY_CHANNEL_ID,
  LINEPAY_CHANNEL_SECRET,
  LINEPAY_VERSION,
  LINEPAY_SITE,
  LINEPAY_CONFIRM_URL,
  LINEPAY_CANCEL_URL,
} = process.env;
// postman用get
// const { protect } = require(__dirname + '/../modules/auth.js');
// router.use(protect);
router
  .get('/', async (req, res) => {
    const data = {
      productName: '健身堡壘商品',
      amount: 1,
      currency: 'TWD',
      orderId: 'd302055e-5249-4024-8cc1-eb8c2b1ea407',
    };
    // const uuid = uuid();
    try {
      console.log(data);
      // console.log(uuid);
      res.status(200).json({ code: 200, data });
    } catch (error) {
      console.log(error);
    }
  })

  // .post('/5', async (req, res) => {
  //   // const { orderID } = req.params;
  //   const { productName, amount, currency } = req.body;
  //   // const data = {
  //   //   productName: '健身堡壘商品',
  //   //   amount: 1,
  //   //   currency: 'TWD',
  //   //   orderId: 'd302055e-5249-4024-8cc1-eb8c2b1ea407',
  //   // };
  //   // const { orderID } = ;//從前端接到的body
  //   const redirectURL = {
  //     confirmURL: `${LINEPAY_CONFIRM_URL}`,
  //     cancelURL: `${LINEPAY_CANCEL_URL}`,
  //   };
  //   const linebody = {
  //     productName,
  //     amount,
  //     currency,
  //     redirectURL,
  //   };
  //   const url = 'payment/request'; //要給linepay的url
  //   const timeStamp = Date.now(); //要給nones跟db使用的章戳，可以用uuid
  //   const nones = parseInt(timeStamp);
  //   const string = `${LINEPAY_CHANNEL_SECRET}${url}${linebody}`;
  //   const signature = crypto.HmacSHA256(string, LINEPAY_CHANNEL_SECRET);
  //   try {
  //     console.log(signature);
  //     // console.log(uuid);
  //     res.status(200).json({ code: 200, signature });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
module.exports = router;
