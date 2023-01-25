const Expense = require("../models/expense");
const User = require("../models/user");
const Downloadurl = require("../models/downloadurl");
const sequelize = require("sequelize");
const UserServices = require("../services/userservices");
const S3Services = require("../services/S3services");

exports.postAddExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;

  try {
    const data = await req.user.createExpense({
      amount,
      description,
      category,
    });
    res.status(201).json({ data, message: "expense added!" });
  } catch (err) {
    res.status(500).json({ message: "Cannot add Expense!" });
  }
};

exports.getExpenses = async (req, res, next) => {
  let page = req.params.pageno || 1;
  let ITEMS_PER_PAGE = +req.body.itempsperpage || 2;
  let totalItems;
  try {
    let totalExpenses = await Expense.count({ where: { userId: req.user.id } });
    totalItems = totalExpenses;

    let data = await req.user.getExpenses({
      offset: (page - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    });
    res.status(200).json({
      data,
      info: {
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: +page + 1,
        previousPage: +page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "unable to load expenses!" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    await req.user.getExpenses({ where: { id: expenseId } }).then((expense) => {
      let foundExpense = expense[0];
      foundExpense.destroy();
      res.status(200).json({ message: "Successfully deleted Expense!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Cannot delete Expense!" });
  }
};

exports.getAllUserExpenses = async (req, res, next) => {
  try {
    if (req.user.ispremiumuser) {
      const leaderboard = await User.findAll({
        attributes: [
          "id",
          "name",
          [
            sequelize.fn("sum", sequelize.col("expenses.amount")),
            "totalExpense",
          ],
        ],
        include: [
          {
            model: Expense,
            attributes: [],
          },
        ],
        group: ["user.id"],
        order: [["totalExpense", "DESC"]],
      });

      return res.status(200).json({ success: true, data: leaderboard });
    }
    return res.status(400).json({ message: "user is not a premium user" });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenses = await UserServices.getExpenses(req);

    const stringifyExpense = JSON.stringify(expenses);
    const fileName = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await S3Services.uploadtoS3(stringifyExpense, fileName);
    const downloadURLData = await req.user.createDownloadurl({
      fileName,
      fileUrl: fileURL,
    });
    console.log("download", downloadURLData);
    res.status(200).json({ fileURL, downloadURLData, success: true });
  } catch (error) {
    res.status(500).json({ fileURL: "", success: false, err: error });
  }
};

exports.getAlldownloadURL = async (req, res, next) => {
  try {
    let urls = await req.user.getDownloadurls();
    if (!urls) {
      res.status(404).json({ message: "no urls found!", success: false });
    }
    res.status(200).json({ urls, success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
};
