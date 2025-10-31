const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const {
  transactionValidationRules,
  validate,
} = require("../middleware/validation");

// POST /api/transactions - Create new transaction
router.post("/", transactionValidationRules(), validate, async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    const transaction = new Transaction({
      type,
      amount,
      description,
      category,
      date: date || new Date(),
    });

    const savedTransaction = await transaction.save();

    res.status(201).json({
      success: true,
      data: savedTransaction,
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create transaction",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// GET /api/transactions - Get all transactions with filtering
router.get("/", async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = req.query;

    // Build filter object
    const filter = {};

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = new RegExp(category, "i"); // Case-insensitive search
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch transactions",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// GET /api/transactions/:id - Get specific transaction
router.get("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Transaction not found",
          code: "NOT_FOUND",
          details: {},
        },
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid transaction ID",
          code: "INVALID_ID",
          details: {},
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch transaction",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put("/:id", transactionValidationRules(), validate, async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        type,
        amount,
        description,
        category,
        date: date || new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Transaction not found",
          code: "NOT_FOUND",
          details: {},
        },
      });
    }

    res.json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid transaction ID",
          code: "INVALID_ID",
          details: {},
        },
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update transaction",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Transaction not found",
          code: "NOT_FOUND",
          details: {},
        },
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid transaction ID",
          code: "INVALID_ID",
          details: {},
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to delete transaction",
        code: "SERVER_ERROR",
        details: {},
      },
    });
  }
});

module.exports = router;
