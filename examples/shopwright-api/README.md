# ShopWright API - Smart Task Demo Project

This is a complete **enterprise e-commerce platform API** designed specifically to demonstrate the **Smart Task Azure DevOps Extension** capabilities. ShopWright showcases how the Smart Task can intelligently analyze complex project structures, recommend optimal testing strategies, and automate CI/CD pipeline decisions.

## 🚀 Quick Demo Setup

### Prerequisites
- Azure DevOps account
- Node.js 18+ installed
- 5 minutes for setup

### Demo Steps
1. **Copy the pipeline**: Copy `smart-testing-pipeline.yml` to your Azure DevOps project
2. **Point to ShopWright**: Configure the pipeline to analyze this directory
3. **Run and observe**: Watch Smart Task make intelligent decisions
4. **See the savings**: Compare traditional vs. smart pipeline execution

## 💡 The Problem Smart Task Solves

Traditional CI/CD pipelines run the same tests every time, regardless of what actually changed:
- ⏰ **Waste Time**: Full test suites on minor documentation changes
- 💸 **Waste Money**: Unnecessary compute costs for irrelevant tests  
- 🐌 **Slow Feedback**: Developers wait for tests that don't matter

## ✨ Smart Task Solution in Action

Watch Smart Task analyze ShopWright and make intelligent decisions:
- 🧠 **Code Analysis**: Examines package.json, branch names, and project structure
- 🎯 **Smart Selection**: Only runs tests relevant to your specific changes
- 📊 **Clear Reasoning**: Shows exactly why each decision was made
- 💰 **Immediate ROI**: Reduces pipeline costs and time dramatically

## 🎯 Smart Task Integration

ShopWright serves as a **realistic demonstration** for the Smart Task extension, featuring:

- **Enterprise-grade architecture** with multiple API endpoints
- **Comprehensive test suite** (unit, integration, e2e tests)  
- **Multiple testing strategies** to showcase intelligent test selection
- **Production dependencies** that require different testing approaches
- **Scalable platform design** that benefits from smart CI/CD optimization

When you run the Smart Task Azure DevOps pipeline (`smart-testing-pipeline.yml`) against ShopWright, it will:

### 📊 Analyze Project Structure
- **API endpoints**: Authentication, Products, Cart, Orders
- **Test coverage**: Unit tests (75%), Integration tests (15%), E2E tests (10%)
- **Dependencies**: Express.js, Jest, Supertest, JWT, BCrypt, MongoDB
- **Performance impact**: Different test execution times

### 🧠 Intelligent Recommendations
- **Prioritize critical paths**: Authentication and payment flows
- **Optimize test selection**: Run relevant tests based on code changes
- **Suggest parallel execution**: Independent test suites
- **Estimate cost savings**: 50-70% reduction in CI/CD time

### 🎛️ Dynamic Pipeline Decisions
- **Skip unnecessary tests** when only documentation changes
- **Focus on integration tests** for API endpoint modifications
- **Run full test suite** for core business logic changes
- **Optimize resource allocation** based on test complexity

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role management
- 🛒 **Product Management** - CRUD operations for products and categories  
- 🛍️ **Shopping Cart** - Session-based cart management
- 💳 **Payment Processing** - Stripe integration for secure payments
- 📧 **Email Notifications** - Order confirmations and updates
- 🔍 **Search & Filtering** - Advanced product search capabilities
- 📊 **Analytics** - Order tracking and reporting
- 🔒 **Security** - Rate limiting, input validation, and security headers

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session storage
- **Payment**: Stripe API
- **Testing**: Jest, Supertest, Cypress
- **DevOps**: Docker, Azure DevOps Pipelines

## 🏗️ ShopWright Architecture

```
shopwright-api/
├── src/
│   ├── index.js              # Express server setup
│   └── routes/
│       ├── auth.js           # Authentication endpoints
│       ├── products.js       # Product management
│       ├── cart.js           # Shopping cart operations
│       └── orders.js         # Order processing
├── tests/
│   ├── auth.test.js          # Authentication unit tests
│   ├── products.test.js      # Product management tests
│   ├── cart.test.js          # Cart functionality tests
│   └── integration.test.js   # End-to-end integration tests
├── package.json              # Dependencies and scripts
├── Dockerfile               # Container configuration
└── README.md                # This file
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Shopping Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove cart item
- `DELETE /api/cart/clear` - Clear entire cart

## 🎮 Demo Usage with ShopWright

### 1. Test the API Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 2. Use with Smart Task Pipeline
1. **Copy** the `smart-testing-pipeline.yml` to your Azure DevOps project
2. **Point** the pipeline to this ShopWright project directory
3. **Run** the pipeline and observe Smart Task decisions
4. **Review** the intelligent test selection and cost savings

### 3. Experiment with Changes
- **Modify** authentication logic → Watch Smart Task prioritize auth tests
- **Update** product endpoints → See focused API testing
- **Change** documentation → Observe test skipping
- **Add** new features → Experience adaptive testing strategies

## 🌟 Business Value Demonstration

### Cost Savings Example
```
Traditional Pipeline: 15 minutes × $0.50/minute = $7.50 per run
Smart Task Pipeline: 5 minutes × $0.50/minute = $2.50 per run
💰 Savings: 67% reduction ($5.00 per run)
```

### Time Savings Example  
```
Traditional Approach:
├── Unit Tests: 2 minutes (always run)
├── Integration Tests: 8 minutes (always run)
└── E2E Tests: 5 minutes (always run)
Total: 15 minutes

Smart Task Approach:
├── Unit Tests: 2 minutes (relevant only)
├── Integration Tests: 3 minutes (focused)
└── E2E Tests: 0 minutes (skipped if safe)
Total: 5 minutes ⚡
```

## 🏆 Perfect for Professional Demos

### **3-Minute Demo Script**

**1. Show the Problem (30 seconds):**
- "ShopWright has comprehensive tests - auth, products, cart, orders"
- "Traditional pipelines run everything: 15 minutes, $7.50 per run"
- "Feature branch? Full test suite. Documentation fix? Full test suite."

**2. Show the AI Solution (90 seconds):**
- Run Smart Task pipeline on ShopWright
- Watch AI analyze: "Analyzing ShopWright API... Detecting Node.js + Express..."
- See intelligent decisions: "Auth changes detected → Prioritizing auth + integration tests"
- Show clear reasoning in pipeline logs

**3. Show the Impact (60 seconds):**
- "Smart Task just reduced ShopWright pipeline from 15 to 5 minutes"
- "67% cost reduction - $5 saved per run"
- "Developers get feedback 3x faster"
- "On enterprise scale: thousands saved monthly"

### 🚀 Demo Setup
```bash
# Clone/navigate to ShopWright
cd shopwright-api

# Test locally (optional)
npm install && npm test

# Copy smart-testing-pipeline.yml to Azure DevOps
# Point pipeline to this ShopWright directory
# Run and observe intelligent optimization!
```

### ✨ Why ShopWright is Perfect for Demos

- ✅ **Quick Setup**: 5-minute installation
- ✅ **Clear Value Prop**: Obvious cost and time savings
- ✅ **Realistic Complexity**: Enterprise-grade project structure
- ✅ **Measurable Results**: Concrete metrics and improvements
- ✅ **Live Demo**: Interactive testing and pipeline execution
- ✅ **Professional Appeal**: Looks like real enterprise software

---

**Ready to revolutionize your CI/CD pipeline?** 🚀

ShopWright demonstrates the **real-world impact** of intelligent testing strategies. Watch as Smart Task transforms your development workflow with **data-driven decisions** and **significant cost savings**.

*Built for demonstration of Smart Task Azure DevOps Extension capabilities.*
- `DELETE /api/cart/items/:id` - Remove cart item

## Testing Strategy

### Unit Tests (`npm run test:unit`)
- API endpoint logic
- Database models and validation
- Utility functions
- Authentication middleware

### Integration Tests (`npm run test:integration`) 
- API endpoint workflows
- Database operations
- External service integrations
- Authentication flows

### End-to-End Tests (`npm run test:e2e`)
- Complete user journeys
- Payment processing flows
- Admin functionality
- Cross-browser compatibility

### Performance Tests (`npm run test:performance`)
- Load testing with Artillery
- API response time benchmarks
- Database query optimization
- Concurrent user scenarios

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The application is containerized and deployed using Azure DevOps Pipelines with intelligent testing strategies.

### Docker
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
EMAIL_SERVICE_API_KEY=your-email-key
```

## CI/CD Pipeline

This project uses an **AI-powered smart testing pipeline** that:

- 🧠 **Analyzes code changes** to determine appropriate test strategy
- ⚡ **Saves 60-70% pipeline time** by running only relevant tests
- 🎯 **Adapts to branch types** (feature/main/hotfix) automatically
- 📊 **Provides clear reasoning** for all testing decisions

See `azure-pipelines.yml` for the intelligent pipeline configuration.

## License

MIT License - see LICENSE file for details.
