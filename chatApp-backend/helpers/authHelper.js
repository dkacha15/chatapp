const jwt = require("jsonwebtoken");
const httpStatus = require("http-status-codes");

const dbConfig = require("../config/secret");

module.exports = {
  VerifyToken: (req, res, next) => {
    if (!req.headers.authorization) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "No Authorization" });
    }
    const token = req.cookies.auth || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "No token provided" });
    }
    return jwt.verify(token, dbConfig.secret, (err, decoded) => {
      if (err) {
        if (err.expiredAt < new Date()) {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Token is expired.Please login again",
            token: null,
          });
        }
        next();
      }
      req.user = decoded.data;
      next();
    });
  },
};
