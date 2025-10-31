const { body, validationResult } = require("express-validator");

// Validation rules for transaction creation/update
const transactionValidationRules = () => {
  return [
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),

    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number greater than 0")
      .toFloat(),

    body("description")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Description must be between 1 and 255 characters"),

    body("category")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Category must be between 1 and 50 characters"),

    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO 8601 date")
      .toDate(),
  ];
};

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors.array(),
      },
    });
  }
  next();
};

module.exports = {
  transactionValidationRules,
  validate,
};
