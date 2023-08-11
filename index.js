const express = require('express');
const db = require(__dirname + '/modules/connectDB.js');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const memberRouter = require('./routes/memberRoutes.js');
const authRouter = require('./routes/authRoutes.js');
const productRouter = require('./routes/productRoutes.js');
const emailRouter = require('./routes/emailRoutes.js');

const cart = require(__dirname + '/routes/cart.js');
const SCadd = require(__dirname + '/routes/SCadd');
const SCrecommanded = require(__dirname + '/routes/SCrecommanded');
const SCpopular = require(__dirname + '/routes/SCpopular');
const SChotlesson = require(__dirname + '/routes/SChotlesson');
const OLbuyerData = require(__dirname + '/routes/OLbuyerData');
const OLautofillinfo = require(__dirname + '/routes/OLautofillinfo');
const OLdelivery = require(__dirname + '/routes/OLdelivery');
const OLdeliveryMethod = require(__dirname + '/routes/OLdeliveryMethod');
const FObuyerinfo = require(__dirname + '/routes/FObuyerinfo');
const FOitemlist = require(__dirname + '/routes/FOitemlist');
// >>> for Sean
const testRoutes = require(__dirname + '/routes/record/test.js');
const exerciseRoutes = require(__dirname + '/routes/record/exerciseType.js');
const foodRoutes = require(__dirname + '/routes/record/foodType.js');
const dietRecordRoutes = require(__dirname + '/routes/record/dietRecord.js');
const exerciseRecordRoutes = require(__dirname +
  '/routes/record/exerciseRecord.js');
// <<< for sean

require('dotenv').config();
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:9010'],
    credentials: true,
  })
);
app.use(morgan('dev'));
//:method :url :status :response-time ms - :res[content-length]

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/lesson', require(__dirname + '/routes/lesson'));
app.use('/coach', require(__dirname + '/routes/coach'));

//登入用
app.use('/api/auth', authRouter);
//寄信用
app.use('/api/email', emailRouter);
// const cart = );
// shoppingcart use
app.use('/cart', cart);
app.use('/SCadd', SCadd);
// button for deleting all items at once
app.use('/SCrecommanded', SCrecommanded);
app.use('/SCpopular', SCpopular);
app.use('/SChotlesson', SChotlesson);
app.use('/OLbuyerData', OLbuyerData);
app.use('/OLautofillinfo', OLautofillinfo);
app.use('/OLdelivery', OLdelivery);
app.use('/OLdeliveryMethod', OLdeliveryMethod);
app.use('/FObuyerinfo', FObuyerinfo);
app.use('/FOitemlist', FOitemlist);
// =================================================================
// === record ======================================================
// =================================================================
app.use('/test', testRoutes);
app.use('/exe-type', exerciseRoutes);
app.use('/food-type', foodRoutes);
app.use('/diet-record', dietRecordRoutes);
app.use('/exercise-record', exerciseRecordRoutes);
// <<< record

//使用者資料用
app.use('/api/member', memberRouter);
//商品用
app.use('/api/product', productRouter);

app.use(express.static('public'));
app.use('*', async (req, res) => {
  res.status(404).json({ message: '路徑錯誤' });
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`啟動~ port: ${port}`);
});
