const express = require('express');
// const db = require(__dirname + "/modules/connectDB.js");
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const memberRouter = require('./routes/memberRoutes.js');
// const authRouter = require('./routes/memberRoutes.js');
// const authJwtRouter = require('./routes/auth-jwt.js');
const emailRouter = require('./routes/emailRoutes.js');

require('dotenv').config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
//:method :url :status :response-time ms - :res[content-length]

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//登入用
// app.use('/api/auth', authRouter);
// app.use('/api/auth-jwt', authJwtRouter);
app.use('/api/email', emailRouter);
//使用者資料用
app.use('/api/member', memberRouter);
app.use('*', async (req, res) => {
  res.status(404).json({ message: '路徑錯誤' });
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`啟動~ port: ${port}`);
});
