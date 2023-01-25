const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const path = require("path");
dotenv.config();
const PORT = process.env.PORT || 3000;

const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const purchaseRoutes = require("./routes/purchase");
const premiumFeaturesRoutes = require("./routes/premiumFeatures");
const forgotPasswordRoutes = require("./routes/forgotpassword");

const User = require("./models/user");
const Expense = require("./models/expense");
const Forgotpassword = require("./models/forgotpassword");
const Order = require("./models/order");
const DownloadUrl = require("./models/downloadurl");

const app = express();

const morgan = require("morgan");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.json({ extended: false }));
app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/payment", purchaseRoutes);
app.use("/premium", premiumFeaturesRoutes);
app.use("/password", forgotPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadUrl);
DownloadUrl.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server started at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
