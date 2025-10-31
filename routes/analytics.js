const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET /api/transactions/summary - Get income/expense totals and balance
router.get("/summary", async (req, res) => {
  try {
    const summary = await Transaction.getSummary();

    res.json({
      success: true,
      data: {
        totalIncome: parseFloat(summary.totalIncome.toFixed(2)),
        totalExpenses: parseFloat(summary.totalExpenses.toFixed(2)),
        balance: parseFloat(summary.balance.toFixed(2)),
        transactionCount: summary.transactionCount,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch summary data",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// GET /api/transactions/analytics - Get data for charts and visualizations
router.get("/analytics", async (req, res) => {
  try {
    // Get category breakdown for expenses
    const expenseBreakdown = await Transaction.getCategoryBreakdown("expense");

    // Get category breakdown for income
    const incomeBreakdown = await Transaction.getCategoryBreakdown("income");

    // Get monthly trends (last 12 months)
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Format monthly trends for frontend consumption
    const formattedMonthlyTrends = {};
    monthlyTrends.forEach((item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}`;
      if (!formattedMonthlyTrends[monthKey]) {
        formattedMonthlyTrends[monthKey] = { income: 0, expense: 0 };
      }
      formattedMonthlyTrends[monthKey][item._id.type] = parseFloat(
        item.total.toFixed(2)
      );
    });

    res.json({
      success: true,
      data: {
        expenseBreakdown: expenseBreakdown.map((item) => ({
          category: item._id,
          amount: parseFloat(item.total.toFixed(2)),
          count: item.count,
        })),
        incomeBreakdown: incomeBreakdown.map((item) => ({
          category: item._id,
          amount: parseFloat(item.total.toFixed(2)),
          count: item.count,
        })),
        monthlyTrends: formattedMonthlyTrends,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch analytics data",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// GET /api/transactions/categories - Get all unique categories
router.get("/categories", async (req, res) => {
  try {
    const { type } = req.query;
    const matchStage = type ? { type } : {};

    const categories = await Transaction.distinct("category", matchStage);

    res.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch categories",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

module.exports = router;
