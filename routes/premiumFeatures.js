const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');
const middleware = require('../middleware/auth');

router.get('/premiumleaderboard', middleware.authentication, expenseController.getAllUserExpenses);
// router.post('/leaderboarduser', middleware.authentication, expenseController.getLeaderboardUserExpense);

module.exports = router;