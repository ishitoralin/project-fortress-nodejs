const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  console.log('\x1b[33m protect \x1b[0m');
  //從Authorization headers拿到 accesstoken->解密->把資料往下送
  const auth = req.get('Authorization');
  if (auth && auth.indexOf('Bearer ') === 0) {
    const token = auth.slice(7);
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.user = decoded;
      console.log(res.locals.user, 'protect');
      // console.log('from protect:', auth, '\n', 'decoded:', res.locals.user);
    } catch (error) {
      console.log('protect catch');
      return res.status(401).end();
    }
    next();
  } else {
    //沒拿到accesstoken則直接回傳401,中斷操作
    console.log('protect error');
    return res.status(401).end();
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const auth = req.get('Authorization');
    if (auth && auth.indexOf('Bearer ') === 0) {
      const token = auth.slice(7);
      let decoded = null;

      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      //拿到user把user送下去
      res.locals.user = decoded;
    }
  } catch (error) {
    console.log(error);
  }
  next();
};
