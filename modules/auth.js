const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  console.log('protect');
  //從Authorization headers拿到 accesstoken->解密->把資料往下送
  const auth = req.get('Authorization');
  if (auth && auth.indexOf('Bearer ') === 0) {
    const token = auth.slice(7);
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.user = decoded;
      console.log('from protect:', auth, '\n', 'decoded:', res.locals.user);
    } catch (error) {
      return res.status(401);
    }
    next();
  } else {
    //沒拿到accesstoken則直接回傳401,中斷操作
    return res.status(401);
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
      return next();
    }
    return res.status(401).end();
  } catch (error) {
    return res.status(401).end();
  }
};
