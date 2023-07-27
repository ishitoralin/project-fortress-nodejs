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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
//:method :url :status :response-time ms - :res[content-length]

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/lesson', require(__dirname + '/routes/lesson'));
//登入用
app.use('/api/auth', authRouter);
//寄信用
app.use('/api/email', emailRouter);
// const cart = );

// shoppingcart use
app.use('/cart', cart);
app.get('/qstest', (req, res) => {
  res.json(req.query);
});
// TODO add products from products page and lesson page (to database (order_cart))
// check if user login state before enter shoppingcart
// show order list datas to shopping cart
// show recommanded products datas to shopping cart
// show popular products datas to shopping cart
// show recommanded lesson datas to shopping cart
// send datas to database (order_main) when user click the confirm button then replace the page to secondpage
// loaging data (order_main) then show in the secondpage
// if user click the import user info button > fetch user info from database (member)
// 
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
