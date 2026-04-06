module.exports = (req, res, next) => {
  const { subscription_status } = req.query;

  if (subscription_status !== "active") {
    return res.status(403).json({
      message: "Premium only feature",
    });
  }

  next();
};