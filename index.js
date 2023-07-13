const express = require('express');
const db = require(__dirname + '/modules/connectDB.js');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const memberRoutes = require(__dirname + '/routes/memberRoutes.js');
const authRoutes = require(__dirname + '/routes/memberRoutes.js');
require('dotenv').config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
//:method :url :status :response-time ms - :res[content-length]

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/lesson', require(__dirname + '/routes/lesson'));
//登入用
app.use('/api/auth', authRoutes);
//使用者資料用
app.use('/api/member', memberRoutes);
app.use('*', async (req, res) => {
  res.status(404).json({ message: '路徑錯誤' });
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`啟動~ port: ${port}`);
});
