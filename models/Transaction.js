const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be either income or expense",
      },
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: "Amount must be a positive number",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [1, "Description cannot be empty"],
      maxlength: [255, "Description cannot exceed 255 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [1, "Category cannot be empty"],
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Date must be a valid date",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount (for display purposes)
transactionSchema.virtual("formattedAmount").get(function () {
  return this.amount.toFixed(2);
});

// Virtual for formatted date
transactionSchema.virtual("formattedDate").get(function () {
  return this.date.toISOString().split("T")[0];
});

// Pre-save middleware for data sanitization
transactionSchema.pre("save", function (next) {
  // Ensure amount is rounded to 2 decimal places
  if (this.amount) {
    this.amount = Math.round(this.amount * 100) / 100;
  }

  // Capitalize first letter of category
  if (this.category) {
    this.category =
      this.category.charAt(0).toUpperCase() +
      this.category.slice(1).toLowerCase();
  }

  next();
});

// Static method to get summary statistics
transactionSchema.statics.getSummary = async function () {
  const summary = await this.aggregate([
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  };

  summary.forEach((item) => {
    if (item._id === "income") {
      result.totalIncome = item.total;
    } else if (item._id === "expense") {
      result.totalExpenses = item.total;
    }
    result.transactionCount += item.count;
  });

  result.balance = result.totalIncome - result.totalExpenses;

  return result;
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function (type = null) {
  const matchStage = type ? { type } : {};

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = mongoose.model("Transaction", transactionSchema);
