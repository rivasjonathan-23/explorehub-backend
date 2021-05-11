const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (token) {
      const userInf = token.split(" ")[1];
      if (!userInf || userInf == undefined) {
        return res.status(401).json({ message: "unauthorized" });
      }
      jwt.verify(userInf, process.env.MY_SECRET, (err, user) => {
        if (!user) {
          return res.status(401).json({ message: "unauthorized" });
        }
        if (err) {
          return res.status(401).json({ message: "unauthorized" });
        }
        console.log(user);
        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ message: "unauthorized" });
    }
  } catch (err) {
    console.error("error in checking authorization: ", err);
    res.status(500).json({ message: "error occured", error: err.message });
  }
};
