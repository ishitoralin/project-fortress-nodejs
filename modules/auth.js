const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  const auth = req.get('Authorization');
  if (auth && auth.indexOf('Bearer ') === 0) {
    const token = auth.slice(7);
    let decoded = null;
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = decoded;
  } else {
    return res.status(401).json({ code: 401, message: '未授權' });
  }

  next();
};
exports.getUser = async (req, res, next) => {
  const auth = req.get('Authorization');
  if (auth && auth.indexOf('Bearer ') === 0) {
    const token = auth.slice(7);
    let decoded = null;
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //拿到user把user送下去
    res.locals.user = decoded;
  }
  next();
};
