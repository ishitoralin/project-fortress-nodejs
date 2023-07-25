const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  const auth = req.get('Authorization');
  const refreshCookie = req.cookies.g4RefreshToken;
  if (refreshCookie) {
    let decodedRefresh = null;
    decodedRefresh = jwt.verify(
      refreshCookie,
      process.env.REFRESH_TOKEN_SECRET
    );
    const accessToken = jwt.sign(
      {
        sid: decodedRefresh.sid,
        name: decodedRefresh.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    );
  }
  if (auth && auth.indexOf('Bearer ') === 0) {
    const token = auth.slice(7);
    let decoded = null;
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = decoded;
    next();
  } else {
    return res.status(401).end();
  }
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
