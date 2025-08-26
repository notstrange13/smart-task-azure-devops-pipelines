# ShopWright API Setup Guide

## 🚀 Quick Demo Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Locally (Optional)
```bash
# Run all tests
npm test

# Start the API server
npm run dev
# Visit http://localhost:3000/health
```

### 3. Azure DevOps Pipeline Setup
1. **Copy Pipeline**: Copy `smart-testing-pipeline.yml` to your Azure DevOps repository
2. **Configure Variables**: Set up your Azure OpenAI credentials in pipeline variables
3. **Point to ShopWright**: Configure the pipeline to analyze this `shopwright-api/` directory
4. **Run Pipeline**: Execute and watch Smart Task make intelligent decisions

### 4. Demo Script
Use the **3-minute demo script** in the main README.md to showcase:
- Traditional pipeline problems (15 min, $7.50)
- Smart Task analysis and decisions  
- Results and savings (5 min, $2.50, 67% reduction)

## 🎯 What Smart Task Will Analyze

- **Project Type**: Node.js Express API
- **Dependencies**: 60+ packages including Jest, Supertest, JWT
- **Test Structure**: Unit (75%), Integration (20%), E2E (5%)
- **API Endpoints**: Auth, Products, Cart, Orders
- **Code Changes**: Intelligent test selection based on modified files

## 📊 Expected Results

- **Documentation changes** → Skip expensive tests
- **Authentication changes** → Focus on auth + integration tests
- **Product API changes** → Run product + integration tests
- **Core logic changes** → Full test suite

---

**Ready to demo?** Follow the pipeline setup and watch Smart Task optimize ShopWright! 🎉
