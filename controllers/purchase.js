const Razorpay = require("razorpay");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateAccessToken(id, name, ispremiumuser) {
  return jwt.sign(
    { userId: id, name: name, ispremiumuser: ispremiumuser },
    process.env.JWT_SECRET
  );
}

exports.purchasepremium = (req, res, next) => {
  try {
    var instance = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });
    var options = {
      amount: 1000,
      currency: "INR",
      receipt: "ABC",
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        throw new Error(err);
      }
      res.json({ order, key_id: instance.key_id });
    });
  } catch (err) {
    res.status(403).json({ message: "Something went wrong!" });
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    await req.user.createOrder({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      status: "success",
    });

    Order.findAll({ where: { orderId: razorpay_order_id } })
      .then((order) => {
        if (order[0].status == "success") {
          req.user.update({ ispremiumuser: true });
          console.log('user>>>', req.user)
          res
            .status(200)
            .json({
              message: "premium Subscribed!",
              token: generateAccessToken(
                req.user.id,
                req.user.name,
                req.user.ispremiumuser
              ),
              isPremium: req.user.ispremiumuser,
            });
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    res.status(403).json({ error: err, message: "Something went wrong!" });
  }
};
