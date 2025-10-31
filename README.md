# Expense Tracker Backend API

A robust RESTful API built with Node.js, Express, and MongoDB for managing personal finance transactions with comprehensive analytics and data validation.

## 🚀 Features

### 💾 Data Management

- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for transactions
- **Data Validation**: Comprehensive server-side validation using express-validator
- **Error Handling**: Standardized error responses with proper HTTP status codes
- **Data Sanitization**: Input cleaning and security measures

### 🔍 Advanced Querying

- **Filtering**: Filter transactions by type, category, and date ranges
- **Pagination**: Efficient handling of large datasets with limit/offset
- **Sorting**: Configurable sorting by date, amount, or category
- **Search**: Full-text search capabilities across transaction descriptions

### 📊 Analytics & Reporting

- **Summary Statistics**: Real-time calculation of income, expenses, and balance
- **Category Breakdown**: Detailed analysis by transaction categories
- **Monthly Trends**: Historical data analysis and trending
- **Data Aggregation**: MongoDB aggregation pipelines for complex queries

### 🔒 Security & Validation

- **Input Validation**: Multi-layer validation with custom rules
- **Error Boundaries**: Graceful error handling and recovery
- **CORS Configuration**: Secure cross-origin resource sharing
- **Data Integrity**: Database constraints and validation rules

## 🛠 Technology Stack

### Core Technologies

- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling for Node.js

### Middleware & Utilities

- **express-validator**: Server-side validation middleware
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **nodemon**: Development server with auto-restart

## 📁 Project Structure

```
backend/
├── models/               # Mongoose data models
│   └── Transaction.js    # Transaction schema and methods
├── routes/              # Express route handlers
│   ├── transactions.js  # Transaction CRUD endpoints
│   └── analytics.js     # Analytics and reporting endpoints
├── middleware/          # Custom middleware functions
│   └── validation.js    # Validation rules and middleware
├── server.js           # Main application entry point
└── README.md          # This file
```

## 🗄 Database Schema

### Transaction Model

```javascript
{
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 255
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Database Indexes

- **Compound Index**: `{ type: 1, date: -1 }` for efficient filtering
- **Category Index**: `{ category: 1 }` for category-based queries
- **Date Index**: `{ date: -1 }` for chronological sorting
- **Created Index**: `{ createdAt: -1 }` for recent transactions

## 🔌 API Endpoints

### Transaction Management

#### Create Transaction

```http
POST /api/transactions
Content-Type: application/json

{
  "type": "expense",
  "amount": 25.50,
  "description": "Coffee and pastry",
  "category": "Food & Dining",
  "date": "2024-01-15"
}
```

#### Get All Transactions

```http
GET /api/transactions?type=expense&category=Food&startDate=2024-01-01&endDate=2024-01-31&limit=20&offset=0
```

**Query Parameters:**

- `type` - Filter by transaction type (income/expense)
- `category` - Filter by category (case-insensitive)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `limit` - Number of results per page (default: 50)
- `offset` - Number of results to skip (default: 0)

#### Get Single Transaction

```http
GET /api/transactions/:id
```

#### Update Transaction

```http
PUT /api/transactions/:id
Content-Type: application/json

{
  "type": "income",
  "amount": 1500.00,
  "description": "Freelance project payment",
  "category": "Freelance",
  "date": "2024-01-15"
}
```

#### Delete Transaction

```http
DELETE /api/transactions/:id
```

### Analytics & Reporting

#### Get Summary Statistics

```http
GET /api/analytics/summary
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIncome": 5000.0,
    "totalExpenses": 3500.0,
    "balance": 1500.0,
    "transactionCount": 45
  }
}
```

#### Get Detailed Analytics

```http
GET /api/analytics/analytics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "expenseBreakdown": [
      {
        "category": "Food & Dining",
        "amount": 850.0,
        "count": 12
      }
    ],
    "incomeBreakdown": [
      {
        "category": "Salary",
        "amount": 4000.0,
        "count": 2
      }
    ],
    "monthlyTrends": {
      "2024-01": { "income": 2000, "expense": 1500 }
    },
    "recentTransactions": []
  }
}
```

#### Get Categories

```http
GET /api/analytics/categories?type=expense
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### MongoDB Connection

The application automatically connects to MongoDB on startup with:

- **Connection pooling** for optimal performance
- **Automatic reconnection** on connection loss
- **Error handling** with graceful shutdown
- **Index creation** for query optimization

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   # Copy example environment file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

3. **Start MongoDB** (if using local installation)

   ```bash
   mongod
   ```

4. **Start the server**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:5000/
   # Should return: {"message": "Expense Tracker API Server is running!"}
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite (when implemented)

## 🔍 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": {
      // Additional error context
    }
  }
}
```

## 🔒 Validation Rules

### Transaction Validation

- **Type**: Must be 'income' or 'expense'
- **Amount**: Must be a positive number ≥ 0.01
- **Description**: Required, 1-255 characters, trimmed
- **Category**: Required, 1-50 characters, trimmed
- **Date**: Must be valid ISO 8601 date format

### Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `INVALID_ID` - Invalid MongoDB ObjectId
- `SERVER_ERROR` - Internal server error

## 📊 Performance Features

### Database Optimization

- **Indexes**: Strategic indexing for common query patterns
- **Aggregation**: MongoDB aggregation pipelines for analytics
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized queries with proper field selection

### Caching Strategy

- **Response Caching**: Cache frequently accessed data
- **Query Result Caching**: Cache expensive aggregation results
- **Connection Caching**: Reuse database connections

### Monitoring & Logging

- **Request Logging**: Detailed logging of all API requests
- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Metrics**: Response time and throughput monitoring

## 🔧 Advanced Features

### Data Aggregation

The API uses MongoDB aggregation pipelines for:

- **Summary Calculations**: Real-time income/expense totals
- **Category Analysis**: Breakdown by transaction categories
- **Trend Analysis**: Monthly and yearly financial trends
- **Statistical Analysis**: Averages, medians, and distributions

### Middleware Stack

1. **CORS Middleware**: Cross-origin request handling
2. **Body Parser**: JSON and URL-encoded data parsing
3. **Validation Middleware**: Input validation and sanitization
4. **Error Handler**: Centralized error processing
5. **404 Handler**: Not found route handling

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**

   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
   ```

2. **Process Management**

   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name expense-tracker-api
   ```

3. **Reverse Proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### API Testing with curl

```bash
# Create a transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"expense","amount":25.50,"description":"Coffee","category":"Food"}'

# Get all transactions
curl http://localhost:5000/api/transactions

# Get summary
curl http://localhost:5000/api/analytics/summary
```

### Testing with Postman

Import the API endpoints into Postman for interactive testing:

1. Create a new collection
2. Add requests for each endpoint
3. Set up environment variables for base URL
4. Test different scenarios and edge cases

## 🔍 Monitoring & Debugging

### Logging

- **Request Logs**: All incoming requests with timestamps
- **Error Logs**: Detailed error information with stack traces
- **Database Logs**: MongoDB connection and query logs
- **Performance Logs**: Response times and resource usage

### Health Checks

```http
GET /api/health
```

Returns server status and database connectivity information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow RESTful API conventions
- Add proper validation for all inputs
- Include error handling for all operations
- Write comprehensive tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```bash
# Check MongoDB service status
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod

# Check connection string in .env file
```

**Port Already in Use**

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

**Validation Errors**

- Check request body format matches schema
- Ensure all required fields are provided
- Verify data types match schema requirements

**Performance Issues**

- Check database indexes are created
- Monitor query performance with MongoDB profiler
- Optimize aggregation pipelines
- Consider implementing caching

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review API documentation
- Test endpoints with provided examples
